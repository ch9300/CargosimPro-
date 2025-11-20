export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface ContainerType extends Dimensions {
  id: string;
  name: string;
  maxVolume: number;
  maxWeight: number; // kg
}

export interface CargoItem extends Dimensions {
  id: string;
  name: string;
  color: string;
  quantity: number;
  weight: number; // kg per unit
  allowRotation: boolean;
}

// Used for the individual boxes placed in the 3D scene
export interface PlacedItem extends Dimensions {
  id: string; // unique instance id
  groupId: string; // links back to CargoItem
  name: string;
  color: string;
  weight: number;
  position: [number, number, number]; // x, y, z (center point for Three.js)
  rotation?: [number, number, number];
  step: number; // Loading order
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PackResult {
  placedItems: PlacedItem[];
  unplacedItems: CargoItem[];
  volumeUtilization: number;
  weightUtilization: number;
  itemCount: number;
  centerOfGravity: Point3D; // Relative to container center
}