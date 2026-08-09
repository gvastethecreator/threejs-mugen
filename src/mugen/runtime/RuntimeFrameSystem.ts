import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { CharacterRuntimeState } from "./types";
import { applyCollisionOverrides } from "./RuntimeCollisionOverrideSystem";
import { collisionBoxesIntersect, runtimeWorldBox } from "./CombatResolver";
import { scaleRuntimeCollisionBoxes, type RuntimeCollisionBox } from "./RuntimeCollisionTransformSystem";
import { resolveRuntimePushSizeBox } from "./RuntimeRootBodyPushSystem";
import { runtimeCurrentSizeBox } from "./RuntimeSizeBoxSystem";

export const defaultRuntimeHurtBoxes: CollisionBox[] = [{ x1: -24, y1: -96, x2: 24, y2: 0 }];

export type RuntimeFrameMove = {
  activeStart: number;
  activeEnd: number;
  hitbox: CollisionBox;
};

export type RuntimeFrameActor = {
  runtime: Pick<CharacterRuntimeState, "frameIndex" | "clsnOverrides" | "clsnScaleMultiplier">;
  currentAction: Pick<MugenAnimationAction, "frames">;
  currentMove?: RuntimeFrameMove;
  moveTick: number;
};

export type RuntimeClsnVarGroup = "clsn1" | "clsn2" | "size";
export type RuntimeClsnVarCoordinate = "back" | "front" | "top" | "bottom";

export type RuntimeClsnVarActor = {
  runtime: Pick<
    CharacterRuntimeState,
    "frameIndex" | "clsnOverrides" | "bodyWidthDelta" | "bodyHeightDelta" | "stateType"
  >;
  currentAction: Pick<MugenAnimationAction, "frames">;
  definition: {
    constants?: Readonly<Record<string, number | undefined>>;
    localCoord?: [number, number];
  };
};

export type RuntimeClsnOverlapActor = {
  runtime: Pick<
    CharacterRuntimeState,
    | "frameIndex"
    | "clsnOverrides"
    | "bodyWidthDelta"
    | "bodyHeightDelta"
    | "stateType"
    | "pos"
    | "facing"
    | "clsnScaleMultiplier"
    | "clsnAngle"
  >;
  currentAction: Pick<MugenAnimationAction, "frames">;
  definition: {
    constants?: Readonly<Record<string, number | undefined>>;
    localCoord?: [number, number];
  };
};

/** Raw current-frame collision projection used by Ikemen ClsnVar. */
export function runtimeCurrentClsnVarBoxes(actor: RuntimeClsnVarActor, group: RuntimeClsnVarGroup): CollisionBox[] {
  if (group === "size") {
    const stateType = actor.runtime.stateType === "C" || actor.runtime.stateType === "A" || actor.runtime.stateType === "L"
      ? actor.runtime.stateType
      : "S";
    const base = resolveRuntimePushSizeBox(actor.definition.constants, stateType);
    const box = runtimeCurrentSizeBox(actor.runtime, base);
    return box ? [box] : [];
  }
  const frame = actor.currentAction.frames[actor.runtime.frameIndex];
  const collisionGroup = group === "clsn1" ? 1 : 2;
  return applyCollisionOverrides(frame?.[group] ?? [], actor.runtime.clsnOverrides, collisionGroup);
}

export function runtimeCollisionBoxCoordinate(
  boxes: readonly CollisionBox[],
  index: number,
  coordinate: RuntimeClsnVarCoordinate,
): number | undefined {
  if (!Number.isFinite(index) || index < 0 || Math.trunc(index) !== index) return undefined;
  const box = boxes[index];
  if (!box) return undefined;
  if (coordinate === "back") return box.x1;
  if (coordinate === "front") return box.x2;
  if (coordinate === "top") return box.y1;
  return box.y2;
}

export function runtimeClsnVar(
  actor: RuntimeClsnVarActor,
  group: RuntimeClsnVarGroup,
  index: number,
  coordinate: RuntimeClsnVarCoordinate,
): number | undefined {
  return runtimeCollisionBoxCoordinate(runtimeCurrentClsnVarBoxes(actor, group), index, coordinate);
}

/** Ikemen ClsnOverlap over normalized, scaled, faced, and angled world boxes. */
export function runtimeClsnOverlap(
  actor: RuntimeClsnOverlapActor,
  target: RuntimeClsnOverlapActor,
  actorGroup: RuntimeClsnVarGroup,
  targetGroup: RuntimeClsnVarGroup,
): boolean {
  const actorBoxes = runtimeClsnOverlapWorldBoxes(actor, actorGroup);
  const targetBoxes = runtimeClsnOverlapWorldBoxes(target, targetGroup);
  return actorBoxes.some((actorBox) => targetBoxes.some((targetBox) => collisionBoxesIntersect(actorBox, targetBox)));
}

export function runtimeClsnOverlapWorldBoxes(
  actor: RuntimeClsnOverlapActor,
  group: RuntimeClsnVarGroup,
): RuntimeCollisionBox[] {
  const rawBoxes = runtimeCurrentClsnVarBoxes(actor, group);
  const transformed = group === "size"
    ? rawBoxes.map((box): RuntimeCollisionBox => ({ ...box, collisionTransformDisabled: true }))
    : scaleRuntimeCollisionBoxes(rawBoxes, actor.runtime.clsnScaleMultiplier);
  const localScale = 320 / (actor.definition.localCoord?.[0] ?? 320);
  const normalized = transformed.map((box): RuntimeCollisionBox => ({
    ...box,
    x1: box.x1 * localScale,
    y1: box.y1 * localScale,
    x2: box.x2 * localScale,
    y2: box.y2 * localScale,
  }));
  const state = {
    pos: { x: actor.runtime.pos.x * localScale, y: actor.runtime.pos.y * localScale },
    facing: actor.runtime.facing,
    clsnAngle: actor.runtime.clsnAngle,
  };
  return normalized.map((box) => runtimeWorldBox(state, box));
}

export class RuntimeFrameWorld {
  currentFrame(actor: RuntimeFrameActor): MugenAnimationFrame | undefined {
    return actor.currentAction.frames[actor.runtime.frameIndex];
  }

  currentHurtBoxes(actor: RuntimeFrameActor): CollisionBox[] {
    const frame = this.currentFrame(actor);
    const base = frame?.clsn2 ?? (hasCollisionOverride(actor, 2) ? [] : defaultRuntimeHurtBoxes);
    return scaleRuntimeCollisionBoxes(
      applyCollisionOverrides(base, actor.runtime.clsnOverrides, 2),
      actor.runtime.clsnScaleMultiplier,
    );
  }

  currentAttackBoxes(actor: RuntimeFrameActor): CollisionBox[] {
    if (hasCollisionOverride(actor, 1)) {
      return scaleRuntimeCollisionBoxes(
        applyCollisionOverrides(this.currentFrame(actor)?.clsn1 ?? [], actor.runtime.clsnOverrides, 1),
        actor.runtime.clsnScaleMultiplier,
      );
    }
    if (this.isCurrentMoveActive(actor)) {
      return scaleRuntimeCollisionBoxes([actor.currentMove.hitbox], actor.runtime.clsnScaleMultiplier);
    }
    return scaleRuntimeCollisionBoxes(
      cloneCollisionBoxes(this.currentFrame(actor)?.clsn1 ?? []),
      actor.runtime.clsnScaleMultiplier,
    );
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
