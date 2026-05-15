/**
 * @file spawnPatterns.ts
 * @description Logic for placing enemies safely.
 */
export const spawnPatterns = {
  generatePositions: (count: number, playerPos: [number, number, number], arenaRadius: number = 14) => {
    const positions: [number, number, number][] = [];
    const [px, _py, pz] = playerPos;
    
    for (let i = 0; i < count; i++) {
      let angle = Math.random() * Math.PI * 2;
      let radius = 5 + Math.random() * (arenaRadius - 5);
      
      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;
      
      let dist = Math.sqrt(Math.pow(x - px, 2) + Math.pow(z - pz, 2));
      if (dist < 5) {
        x += Math.sign(x - px) * 5;
        z += Math.sign(z - pz) * 5;
      }
      
      positions.push([Math.min(Math.max(x, -14), 14), 0.5, Math.min(Math.max(z, -14), 14)]);
    }
    return positions;
  }
};
