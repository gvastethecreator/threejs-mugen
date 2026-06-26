import type { CollisionBox } from "../../mugen/model/CollisionBox";
import type { MugenSprite } from "../../mugen/model/MugenSprite";
import type { ActorSnapshot } from "../../mugen/runtime/types";

export type ProjectedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ProjectedSprite = ProjectedRect & {
  scaleX: 1 | -1;
};

export function projectSprite(actor: ActorSnapshot, sprite: MugenSprite): ProjectedSprite {
  const frame = actor.frame;
  const offsetX = frame?.offsetX ?? 0;
  const offsetY = frame?.offsetY ?? 0;
  const facing = actor.runtime.facing;
  const centerX = actor.runtime.pos.x + facing * (offsetX + sprite.width / 2 - sprite.axisX);
  const centerY = -actor.runtime.pos.y + sprite.axisY - sprite.height / 2 - offsetY;

  return {
    x: centerX,
    y: centerY,
    width: sprite.width,
    height: sprite.height,
    scaleX: facing,
  };
}

export function projectCollisionBox(actor: ActorSnapshot, box: CollisionBox): ProjectedRect {
  const facing = actor.runtime.facing;
  const left = facing === 1 ? actor.runtime.pos.x + box.x1 : actor.runtime.pos.x - box.x2;
  const right = facing === 1 ? actor.runtime.pos.x + box.x2 : actor.runtime.pos.x - box.x1;
  const top = -actor.runtime.pos.y - box.y1;
  const bottom = -actor.runtime.pos.y - box.y2;

  const x = (left + right) / 2;
  const y = (top + bottom) / 2;
  return {
    x,
    y,
    width: Math.max(1, Math.abs(right - left)),
    height: Math.max(1, Math.abs(top - bottom)),
  };
}
