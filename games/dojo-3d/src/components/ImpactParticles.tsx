/**
 * @file ImpactParticles.tsx
 * @description Particle burst on hit.
 */
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDojoStore } from '../store/dojoStore';

export const ImpactParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const { score } = useDojoStore(); 
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setActive(true);
      setTimeout(() => setActive(false), 500);
    }
  }, [score]);

  useFrame((state, delta) => {
    if (active && particlesRef.current) {
      particlesRef.current.rotation.y += delta;
      particlesRef.current.scale.addScalar(delta * 2);
      (particlesRef.current.material as THREE.PointsMaterial).opacity -= delta * 2;
    } else if (particlesRef.current) {
      particlesRef.current.scale.set(1, 1, 1);
      (particlesRef.current.material as THREE.PointsMaterial).opacity = 1;
    }
  });

  if (!active) return null;

  return (
    <points ref={particlesRef} position={[0, 2, 0]}>
      <sphereGeometry args={[1, 16, 16]} />
      <pointsMaterial color="#8b5cf6" size={0.1} transparent opacity={1} blending={THREE.AdditiveBlending} />
    </points>
  );
};
