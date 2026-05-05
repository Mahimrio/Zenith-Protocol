/**
 * @file CursedEnergyFX.tsx
 * @description Glow ring on attack.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CursedEnergyFX: React.FC<{ active: boolean }> = ({ active }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    if (active && meshRef.current && matRef.current) {
      meshRef.current.scale.addScalar(delta * 10);
      matRef.current.opacity = Math.max(0, matRef.current.opacity - delta * 2.5);
    } else if (meshRef.current && matRef.current) {
      meshRef.current.scale.set(1, 1, 1);
      matRef.current.opacity = 0.8;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} visible={active}>
      <ringGeometry args={[1, 1.2, 32]} />
      <meshBasicMaterial ref={matRef} color="#00f5ff" transparent opacity={0.8} />
    </mesh>
  );
};
