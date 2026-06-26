export type CollisionBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LocatedCollisionBox = CollisionBox & {
  raw?: string;
  line?: number;
};
