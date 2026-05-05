/**
 * @file DojoCanvas.tsx
 * @description Main R3F Canvas setup.
 */
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Arena } from './Arena';
import { Player } from './Player';
import { EnemySpawner } from './EnemySpawner';
import { ImpactParticles } from './ImpactParticles';

const LoadingMesh = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="red" wireframe />
  </mesh>
);

export const DojoCanvas: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 14], fov: 60 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <fogExp2 attach="fog" color="#8b5cf6" density={0.015} />
      
      <Suspense fallback={<LoadingMesh />}>
        <Physics>
          <Arena />
          <Player />
          <EnemySpawner />
        </Physics>
        
        <ImpactParticles />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} intensity={1.8} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
