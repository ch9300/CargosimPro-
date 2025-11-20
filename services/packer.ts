import { CargoItem, ContainerType, PackResult, PlacedItem, Point3D } from '../types';

interface Box3D {
  x: number;
  y: number;
  z: number;
  l: number;
  w: number;
  h: number;
}

/**
 * Check if two boxes intersect
 */
const intersect = (a: Box3D, b: Box3D): boolean => {
  return (
    a.x < b.x + b.l &&
    a.x + a.l > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y &&
    a.z < b.z + b.w &&
    a.z + a.w > b.z
  );
};

/**
 * Anchor Point Packing Algorithm
 * Upgrades:
 * 1. Sorts by Weight (Heaviest First) to lower CoG and prevent crushing.
 * 2. Checks Container Max Weight.
 * 3. Calculates Center of Gravity.
 */
export const calculatePacking = (container: ContainerType, items: CargoItem[], gap: number = 0): PackResult => {
  const placedItems: PlacedItem[] = [];
  
  // 1. Explode quantities
  let boxesToPack: (CargoItem & { uniqueId: string })[] = [];
  items.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      boxesToPack.push({ ...item, uniqueId: `${item.id}-${i}` });
    }
  });

  // 2. SORT STRATEGY: 
  // Primary: Weight (Heaviest First) -> Stability & Safety
  // Secondary: Height (Tallest First) -> Packing Efficiency
  // Tertiary: Volume
  boxesToPack.sort((a, b) => {
    if (a.weight !== b.weight) return b.weight - a.weight;
    if (b.height !== a.height) return b.height - a.height;
    return (b.length * b.width * b.height) - (a.length * a.width * a.height);
  });

  // 3. Anchors
  let anchors: Point3D[] = [{ x: 0, y: 0, z: 0 }];
  let currentTotalWeight = 0;

  // Helper to check collision
  const isValidPlacement = (box: Box3D): boolean => {
    // Boundary Check
    if (box.x + box.l > container.length) return false;
    if (box.y + box.h > container.height) return false;
    if (box.z + box.w > container.width) return false;

    // Collision Check
    for (const placed of placedItems) {
      const placedBox: Box3D = {
        x: placed.position[0] + container.length / 2 - placed.length / 2,
        y: placed.position[1] + container.height / 2 - placed.height / 2,
        z: placed.position[2] + container.width / 2 - placed.width / 2,
        l: placed.length,
        w: placed.width,
        h: placed.height
      };
      
      // Strict collision check (Gap is handled in anchor generation)
      if (intersect(box, placedBox)) return false;
    }
    return true;
  };

  const unplacedItems: CargoItem[] = [];

  for (const item of boxesToPack) {
    
    // Weight Limit Check
    if (currentTotalWeight + item.weight > container.maxWeight) {
      unplacedItems.push(item);
      continue;
    }

    let bestFit: { anchor: Point3D, l: number, w: number, h: number } | null = null;

    // Sort Anchors: Y (Height) -> Z (Depth) -> X (Length)
    // This builds "Walls" starting from the floor up, then back to front.
    // Prioritizing Y=0 ensures heavy items sit on floor.
    anchors.sort((a, b) => {
       if (a.y !== b.y) return a.y - b.y; // Fill bottom up (Critical for stability)
       if (a.x !== b.x) return a.x - b.x; // Then along length
       return a.z - b.z; 
    });

    // Try rotations
    const orientations = [
      { l: item.length, w: item.width, h: item.height }
    ];
    if (item.allowRotation) {
      orientations.push(
        { l: item.width, w: item.length, h: item.height }, // Spin on floor
        { l: item.length, w: item.height, h: item.width }, // Side
        { l: item.height, w: item.length, h: item.width }, // Side
        { l: item.width, w: item.height, h: item.length }, // Vertical
        { l: item.height, w: item.width, h: item.length }  // Vertical
      );
    }

    // Find first anchor where ANY orientation fits
    anchorLoop: for (const anchor of anchors) {
      for (const dim of orientations) {
        const potentialBox: Box3D = {
          x: anchor.x,
          y: anchor.y,
          z: anchor.z,
          l: dim.l,
          w: dim.w,
          h: dim.h
        };

        if (isValidPlacement(potentialBox)) {
          bestFit = { anchor, ...dim };
          break anchorLoop;
        }
      }
    }

    if (bestFit) {
      const { anchor, l, w, h } = bestFit;

      // Center position for Three.js
      const posX = (anchor.x + l / 2) - container.length / 2;
      const posY = (anchor.y + h / 2) - container.height / 2;
      const posZ = (anchor.z + w / 2) - container.width / 2;

      placedItems.push({
        id: item.uniqueId,
        groupId: item.id,
        name: item.name,
        color: item.color,
        length: l,
        width: w, 
        height: h,
        weight: item.weight,
        position: [posX, posY, posZ],
        step: placedItems.length + 1
      });

      currentTotalWeight += item.weight;

      // Generate new anchors
      const nextX = anchor.x + l + gap;
      const nextY = anchor.y + h + gap;
      const nextZ = anchor.z + w + gap;

      anchors.push({ x: anchor.x, y: nextY, z: anchor.z }); // Top
      anchors.push({ x: nextX, y: anchor.y, z: anchor.z }); // Right
      anchors.push({ x: anchor.x, y: anchor.y, z: nextZ }); // Front

      const anchorIndex = anchors.indexOf(anchor);
      if (anchorIndex > -1) anchors.splice(anchorIndex, 1);

    } else {
      unplacedItems.push(item);
    }
  }

  const totalVol = container.length * container.width * container.height;
  const usedVol = placedItems.reduce((acc, item) => acc + (item.length * item.width * item.height), 0);

  // Calculate Center of Gravity (CoG)
  // Formula: Sum(mass * position) / Sum(mass)
  let momentX = 0, momentY = 0, momentZ = 0;
  
  placedItems.forEach(item => {
    momentX += item.weight * item.position[0];
    momentY += item.weight * item.position[1];
    momentZ += item.weight * item.position[2];
  });

  const cog: Point3D = currentTotalWeight > 0 ? {
    x: momentX / currentTotalWeight,
    y: momentY / currentTotalWeight,
    z: momentZ / currentTotalWeight
  } : { x: 0, y: 0, z: 0 };

  return {
    placedItems,
    unplacedItems,
    volumeUtilization: (usedVol / totalVol) * 100,
    weightUtilization: (currentTotalWeight / container.maxWeight) * 100,
    itemCount: placedItems.length,
    centerOfGravity: cog
  };
};