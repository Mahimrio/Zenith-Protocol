/**
 * @file Enemy.tsx
 * @description Single enemy agent.
 */
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { BallCollider, RapierRigidBody, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import gsap from 'gsap';
import { EnemyData } from '../types';
import { useEnemyAI } from '../hooks/useEnemyAI';
import { useDojoStore } from '../store/dojoStore';

export const Enemy: React.FC<{ data: EnemyData }> = ({ data }) => {
  const rb = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { update } = useEnemyAI(data.id, useDojoStore.getState().wave);

  useEffect(() => {
    if (meshRef.current) {
      gsap.from(meshRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'back.out' });
    }
  }, []);

  useFrame(() => {
    if (rb.current) {
      const pos = rb.current.translation();
      const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);
      const vel = update(currentPos);
      rb.current.setLinvel({ x: vel.x, y: rb.current.linvel().y, z: vel.z }, true);
    }
  });

  return (
    <RigidBody ref={rb} position={data.position} colliders={false} lockRotations mass={1}>
      <BallCollider args={[0.6]} />
      <mesh ref={meshRef} castShadow>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.2} wireframe />
      </mesh>
    </RigidBody>
  );
};
