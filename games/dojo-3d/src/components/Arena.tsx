/**
 * @file Arena.tsx
 * @description The Dojo arena environment.
 */
import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Arena: React.FC = () => {
  return (
    <group>
      <RigidBody type="fixed" friction={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
        </mesh>
      </RigidBody>
      
      <gridHelper args={[30, 30, 0x00f5ff, 0x00f5ff]} position={[0, 0.01, 0]} material-opacity={0.3} material-transparent />

      <RigidBody type="fixed">
        <mesh position={[0, 2, -15]} visible={false}><boxGeometry args={[30, 4, 1]}/><meshBasicMaterial/></mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[0, 2, 15]} visible={false}><boxGeometry args={[30, 4, 1]}/><meshBasicMaterial/></mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[-15, 2, 0]} visible={false}><boxGeometry args={[1, 4, 30]}/><meshBasicMaterial/></mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[15, 2, 0]} visible={false}><boxGeometry args={[1, 4, 30]}/><meshBasicMaterial/></mesh>
      </RigidBody>

      {[[-14, -14], [14, -14], [-14, 14], [14, 14]].map((pos, i) => (
        <RigidBody key={i} type="fixed">
          <mesh position={[pos[0], 2, pos[1]]} castShadow>
            <boxGeometry args={[1, 4, 1]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <pointLight position={[pos[0], 3, pos[1]]} color="#00f5ff" intensity={0.5} distance={10} />
        </RigidBody>
      ))}

      <directionalLight position={[0, 10, 10]} intensity={0.3} castShadow />
      <ambientLight intensity={0.1} />
    </group>
  );
};
