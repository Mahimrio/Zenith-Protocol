/**
 * @file collision.ts
 * @description AABB Collision logic.
 */
export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const aabbCollides = (a: Bounds, b: Bounds): boolean => {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
};
