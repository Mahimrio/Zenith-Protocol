/**
 * @file Player.tsx
 * @description Player mesh and controller logic.
 */
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import gsap from 'gsap';
import { Trail } from '@react-three/drei';
import { usePlayerController } from '../hooks/usePlayerController';
import { useDojoStore } from '../store/dojoStore';
import { useCombat } from '../hooks/useCombat';
import { CursedEnergyFX } from './CursedEnergyFX';

export const Player: React.FC = () => {
  const rb = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const fistRef = useRef<THREE.Mesh>(null);
  const { update } = usePlayerController();
  const { updatePlayerPos, gameStatus } = useDojoStore();
  const { checkAttackHits } = useCombat();
  const [isAttackingUI, setIsAttackingUI] = useState(false);

  useFrame(() => {
    if (gameStatus !== 'PLAYING') return;

    const state = update();
    if (rb.current) {
      rb.current.setLinvel({ x: state.velocity.x, y: rb.current.linvel().y, z: state.velocity.z }, true);
      const pos = rb.current.translation();
      updatePlayerPos([pos.x, pos.y, pos.z]);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.facing, 0.2);
    }

    if (state.attacking && !isAttackingUI) {
      setIsAttackingUI(true);
      if (fistRef.current) {
        gsap.to(fistRef.current.position, { z: 1.5, duration: 0.1, yoyo: true, repeat: 1 });
        gsap.to(fistRef.current.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.1, yoyo: true, repeat: 1 });
      }
      
      if (rb.current) {
         const pos = rb.current.translation();
         const hitPos = new THREE.Vector3(pos.x + Math.sin(state.facing)*1.5, pos.y, pos.z + Math.cos(state.facing)*1.5);
         checkAttackHits(hitPos);
      }

      setTimeout(() => setIsAttackingUI(false), 400);
    }
  });

  return (
    <RigidBody ref={rb} colliders={false} mass={1} type="dynamic" lockRotations position={[0, 2, 0]}>
      <CapsuleCollider args={[0.5, 0.5]} />
      <group ref={groupRef}>
        <Trail
          width={1.5}
          length={6}
          color="#00f5ff"
          attenuation={(t: number) => t * t}
          decay={1}
        >
          <mesh castShadow>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial color="#10101a" emissive="#00f5ff" emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        </Trail>
        <mesh ref={fistRef} position={[0, 0, 0.8]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      </group>
      <CursedEnergyFX active={isAttackingUI} />
    </RigidBody>
  );
};
