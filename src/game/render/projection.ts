import type { CollisionBox } from "../../mugen/model/CollisionBox";
import type { MugenSprite } from "../../mugen/model/MugenSprite";
import type { ActorSnapshot, RuntimeHitEffectEvent } from "../../mugen/runtime/types";

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
  const scale = actor.runtime.renderScale ?? { x: 1, y: 1 };
  const width = sprite.width * scale.x;
  const height = sprite.height * scale.y;
  const centerX = actor.runtime.pos.x + facing * ((offsetX + sprite.width / 2 - sprite.axisX) * scale.x);
  const centerY = -actor.runtime.pos.y + (sprite.axisY - sprite.height / 2 - offsetY) * scale.y;

  return {
    x: centerX,
    y: centerY,
    width,
    height,
    scaleX: facing,
  };
}

export function projectCollisionBox(actor: ActorSnapshot, box: CollisionBox): ProjectedRect {
  const facing = actor.runtime.facing;
  const scale = actor.runtime.renderScale ?? { x: 1, y: 1 };
  const left = facing === 1 ? actor.runtime.pos.x + box.x1 * scale.x : actor.runtime.pos.x - box.x2 * scale.x;
  const right = facing === 1 ? actor.runtime.pos.x + box.x2 * scale.x : actor.runtime.pos.x - box.x1 * scale.x;
  const top = -actor.runtime.pos.y - box.y1 * scale.y;
  const bottom = -actor.runtime.pos.y - box.y2 * scale.y;

  const x = (left + right) / 2;
  const y = (top + bottom) / 2;
  return {
    x,
    y,
    width: Math.max(1, Math.abs(right - left)),
    height: Math.max(1, Math.abs(top - bottom)),
  };
}

export function projectHitSpark(actor: ActorSnapshot, event: RuntimeHitEffectEvent): { x: number; y: number } {
  const offset = event.offset ?? { x: 0, y: -64 };
  const scale = actor.runtime.renderScale ?? { x: 1, y: 1 };
  return {
    x: actor.runtime.pos.x + actor.runtime.facing * offset.x * scale.x,
    y: -actor.runtime.pos.y - offset.y * scale.y,
  };
}
