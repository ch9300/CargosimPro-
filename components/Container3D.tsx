import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Text, GizmoHelper, GizmoViewport, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ContainerType, PlacedItem, Point3D } from '../types';

// Augment JSX namespace for React Three Fiber elements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      boxGeometry: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      ambientLight: any;
      directionalLight: any;
      fog: any;
      color: any;
      axesHelper: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      boxGeometry: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      ambientLight: any;
      directionalLight: any;
      fog: any;
      color: any;
      axesHelper: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
    }
  }
}

interface Container3DProps {
  container: ContainerType;
  items: PlacedItem[];
  visibleCount: number;
  cog?: Point3D;
}

const ContainerFrame: React.FC<{ container: ContainerType }> = ({ container }) => {
  const { length, width, height } = container;
  
  return (
    <group>
      {/* Floor Grid inside container */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height/2 + 2, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <Grid 
        position={[0, -height/2 + 3, 0]} 
        args={[length, width]} 
        cellSize={500} 
        sectionSize={1000} 
        cellColor="#e2e8f0" 
        sectionColor="#cbd5e1" 
        infiniteGrid={false}
      />
      
      {/* Container Box Wireframe */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent 
          opacity={0.02} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </mesh>
      
      {/* Strong Edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(length, height, width)]} />
        <lineBasicMaterial color="#334155" linewidth={1} />
      </lineSegments>

      {/* Dimensions Text */}
      <group position={[-length/2, -height/2, width/2 + 100]}>
         <Text 
            color="#64748b" 
            fontSize={120} 
            rotation={[-Math.PI/2, 0, 0]} 
            anchorX="left" 
            position={[0, 0, 50]}
          >
            {length} mm
          </Text>
      </group>
      <group position={[length/2 + 100, -height/2, width/2]}>
         <Text 
            color="#64748b" 
            fontSize={120} 
            rotation={[-Math.PI/2, 0, -Math.PI/2]} 
            anchorX="left"
          >
            {width} mm
          </Text>
      </group>
       <group position={[length/2 + 100, 0, -width/2]}>
         <Text 
            color="#64748b" 
            fontSize={120} 
            rotation={[0, 0, 0]} 
            anchorX="center"
          >
            {height} mm
          </Text>
      </group>
    </group>
  );
};

const Parcel: React.FC<{ item: PlacedItem; isNew: boolean }> = ({ item, isNew }) => {
  return (
    <group position={new THREE.Vector3(...item.position)}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[item.length - 2, item.height - 2, item.width - 2]} />
        <meshStandardMaterial 
          color={item.color} 
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>
      {/* Sharp Edges for technical look */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(item.length, item.height, item.width)]} />
        <lineBasicMaterial color="#1e293b" linewidth={1} transparent opacity={0.4} />
      </lineSegments>
      
      {/* Optional Weight Label on larger boxes */}
      {item.length > 600 && item.height > 400 && (
         <Text 
           position={[0, 0, item.width/2 + 5]} 
           fontSize={item.height/6} 
           color="black"
           anchorX="center" 
           anchorY="middle"
         >
           {item.weight}kg
         </Text>
      )}
    </group>
  );
};

const CenterOfGravityMarker: React.FC<{ cog: Point3D }> = ({ cog }) => {
  return (
    <group position={[cog.x, cog.y, cog.z]}>
      {/* Visual Marker */}
      <mesh>
        <sphereGeometry args={[150, 32, 32]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      <Html position={[0, 200, 0]} center>
         <div className="bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-red-600 border border-red-200 shadow-sm whitespace-nowrap">
           Center of Gravity
         </div>
      </Html>
    </group>
  )
}

export const Container3D: React.FC<Container3DProps> = ({ container, items, visibleCount, cog }) => {
  const maxDim = Math.max(container.length, container.height, container.width);
  const camPos = [maxDim * 1.2, maxDim * 0.8, maxDim * 1.5] as [number, number, number];

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  return (
    <Canvas shadows camera={{ position: camPos, fov: 35, near: 10, far: 100000 }}>
      <color attach="background" args={['#f8fafc']} />
      <fog attach="fog" args={['#f8fafc', maxDim * 1.5, maxDim * 3]} />
      
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10000, 20000, 10000]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-container.length}
        shadow-camera-right={container.length}
        shadow-camera-top={container.length}
        shadow-camera-bottom={-container.length}
        shadow-bias={-0.0005}
      />
      
      {/* Fill light for shadows */}
      <directionalLight position={[-10000, 500, -10000]} intensity={0.3} />

      <group>
        <Center top>
            <ContainerFrame container={container} />
            {visibleItems.map((item) => (
              <Parcel key={item.id} item={item} isNew={true} />
            ))}
            {cog && visibleCount > 0 && <CenterOfGravityMarker cog={cog} />}
        </Center>
      </group>

      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2} 
        dampingFactor={0.05}
      />
      
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="black" />
      </GizmoHelper>
    </Canvas>
  );
};