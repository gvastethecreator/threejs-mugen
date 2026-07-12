import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { CharacterRuntimeState } from "./types";
import { applyCollisionOverrides } from "./RuntimeCollisionOverrideSystem";

export const defaultRuntimeHurtBoxes: CollisionBox[] = [{ x1: -24, y1: -96, x2: 24, y2: 0 }];

export type RuntimeFrameMove = {
  activeStart: number;
  activeEnd: number;
  hitbox: CollisionBox;
};

export type RuntimeFrameActor = {
  runtime: Pick<CharacterRuntimeState, "frameIndex" | "clsnOverrides">;
  currentAction: Pick<MugenAnimationAction, "frames">;
  currentMove?: RuntimeFrameMove;
  moveTick: number;
};

export class RuntimeFrameWorld {
  currentFrame(actor: RuntimeFrameActor): MugenAnimationFrame | undefined {
    return actor.currentAction.frames[actor.runtime.frameIndex];
  }

  currentHurtBoxes(actor: RuntimeFrameActor): CollisionBox[] {
    const frame = this.currentFrame(actor);
    const base = frame?.clsn2 ?? (hasCollisionOverride(actor, 2) ? [] : defaultRuntimeHurtBoxes);
    return applyCollisionOverrides(base, actor.runtime.clsnOverrides, 2);
  }

  currentAttackBoxes(actor: RuntimeFrameActor): CollisionBox[] {
    if (hasCollisionOverride(actor, 1)) {
      return applyCollisionOverrides(this.currentFrame(actor)?.clsn1 ?? [], actor.runtime.clsnOverrides, 1);
    }
    if (this.isCurrentMoveActive(actor)) {
      return [{ ...actor.currentMove.hitbox }];
    }
    return cloneCollisionBoxes(this.currentFrame(actor)?.clsn1 ?? []);
  }

  firstCurrentAttackBox(actor: RuntimeFrameActor): CollisionBox | undefined {
    return this.currentAttackBoxes(actor)[0];
  }

  isCurrentMoveActive(actor: RuntimeFrameActor): actor is RuntimeFrameActor & {
    currentMove: RuntimeFrameMove;
  } {
    return Boolean(actor.currentMove && actor.moveTick >= actor.currentMove.activeStart && actor.moveTick <= actor.currentMove.activeEnd);
  }
}

function hasCollisionOverride(actor: RuntimeFrameActor, group: 1 | 2): boolean {
  return actor.runtime.clsnOverrides?.some((override) => override.group === group) ?? false;
}

export function cloneCollisionBoxes(boxes: CollisionBox[]): CollisionBox[] {
  return boxes.map((box) => ({ ...box }));
}
