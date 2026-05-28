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

/**
 * Forgiving collision check — shrinks player hitbox to 80%
 * (and 50% height when sliding) for a fairer feel.
 */
export const checkPlayerObstacleCollision = (
  player: Bounds,
  obstacle: Bounds,
  isSliding: boolean
): boolean => {
  const innerFactor = 0.8;
  const widthInset = player.w * (1 - innerFactor) / 2;
  const heightFactor = isSliding ? 0.5 : innerFactor;
  const heightInset = player.h * (1 - heightFactor) / 2;

  const innerPlayer: Bounds = {
    x: player.x + widthInset,
    y: player.y + heightInset,
    w: player.w * innerFactor,
    h: player.h * heightFactor,
  };

  return aabbCollides(innerPlayer, obstacle);
};
