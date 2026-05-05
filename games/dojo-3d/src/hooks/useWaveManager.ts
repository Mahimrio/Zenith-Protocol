/**
 * @file useWaveManager.ts
 * @description Wave state machine.
 */
import { useEffect, useState } from 'react';
import { useDojoStore } from '../store/dojoStore';
import { spawnPatterns } from '../utils/spawnPatterns';
import { EnemyData } from '../types';

type WaveState = 'WAITING' | 'SPAWNING' | 'ACTIVE' | 'WAVE_CLEAR';

export const useWaveManager = () => {
  const { wave, enemies, setEnemies, nextWave, player } = useDojoStore();
  const [waveState, setWaveState] = useState<WaveState>('WAITING');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (waveState === 'WAITING') {
      setWaveState('SPAWNING');
      const count = 3 + (wave - 1) * 2;
      const positions = spawnPatterns.generatePositions(count, player.position);
      const newEnemies: EnemyData[] = positions.map((pos, i) => ({
        id: `enemy_${wave}_${i}`,
        hp: 100, maxHp: 100,
        position: pos,
        type: 'BASIC',
        state: 'CHASE'
      }));
      setEnemies(newEnemies);
      setWaveState('ACTIVE');
    }
  }, [waveState, wave, player.position, setEnemies]);

  useEffect(() => {
    if (waveState === 'ACTIVE' && enemies.length === 0) {
      setWaveState('WAVE_CLEAR');
      setCountdown(3);
    }
  }, [enemies.length, waveState]);

  useEffect(() => {
    if (waveState === 'WAVE_CLEAR') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        nextWave();
        setWaveState('WAITING');
      }
    }
  }, [countdown, waveState, nextWave]);

  return { waveState, countdown };
};
