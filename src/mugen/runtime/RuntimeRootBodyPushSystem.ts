import type { MugenStageDefinition } from "../model/MugenStage";
import type { CollisionBox } from "../model/CollisionBox";
import type { RuntimeActorConstraintState, RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import { collisionBoxesIntersect, runtimeWorldBox } from "./CombatResolver";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTeamState } from "./types";

export type RuntimeRootBodyPushActor = {
  id: string;
  side: RuntimeTeamSide | null;
  teamState: RuntimeTeamState;
  runtime: RuntimeActorConstraintState;
  localCoord?: readonly [number, number];
  weight?: number;
  pushFactor?: number;
  sizeBox?: CollisionBox;
  hurtBoxes?: readonly CollisionBox[];
};

export type RuntimeRootBodyPushDiagnostic = {
  schema: "RuntimeRootBodyPush/v0";
  mode: "pair" | "ikemen-tag";
  rootIds: string[];
  pairIds: Array<[string, string]>;
  movedRootIds: string[];
};

export type RuntimeRootBodyPushInput = {
  tagMode: boolean;
  roots: readonly RuntimeRootBodyPushActor[];
  playableRoots: readonly [RuntimeRootBodyPushActor, RuntimeRootBodyPushActor];
  stage: Pick<MugenStageDefinition, "bounds"> & Partial<Pick<MugenStageDefinition, "depthBounds" | "localCoord">>;
  actorConstraintWorld: Pick<
    RuntimeActorConstraintWorld,
    "separate" | "clampBodyPushToStage" | "clampBodyPushDepthToStage"
  >;
};

export function resolveRuntimePushSizeBox(
  constants: Readonly<Record<string, number>> | undefined,
  stateType: "S" | "C" | "A" | "L",
): CollisionBox {
  const values = constants ?? {};
  const stand: CollisionBox = {
    x1: -(values["size.ground.back"] ?? 16), y1: -(values["size.height"] ?? 60),
    x2: values["size.ground.front"] ?? 16, y2: 0,
  };
  const key = stateType === "C" ? "crouch" : stateType === "A" ? "air" : stateType === "L" ? "down" : "stand";
  const fallback = key === "air"
    ? { x1: -(values["size.air.back"] ?? 12), y1: stand.y1, x2: values["size.air.front"] ?? 12, y2: stand.y2 }
    : stand;
  const edges = ["left", "top", "right", "bottom"].map((edge) => values[`size.${key}.sizebox.${edge}`]);
  const box = edges.every((value) => value !== undefined && Number.isFinite(value))
    ? { x1: edges[0]!, y1: edges[1]!, x2: edges[2]!, y2: edges[3]! }
    : fallback;
  return { x1: Math.min(box.x1, box.x2), y1: Math.min(box.y1, box.y2), x2: Math.max(box.x1, box.x2), y2: Math.max(box.y1, box.y2) };
}

export class RuntimeRootBodyPushWorld {
  advance(input: RuntimeRootBodyPushInput): RuntimeRootBodyPushDiagnostic {
    assertUniqueRoots(input.roots);
    const roots = input.tagMode ? input.roots.filter(eligibleTagRoot) : [...input.playableRoots];
    const before = new Map(roots.map((root) => [root.id, {
      x: root.runtime.pos.x,
      z: root.runtime.combatDepth?.position,
    }]));
    const pairIds: Array<[string, string]> = [];

    for (let leftIndex = 0; leftIndex < roots.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < roots.length; rightIndex += 1) {
        const left = roots[leftIndex]!;
        const right = roots[rightIndex]!;
        if (!canPairPush(left, right) || !hasPushGeometry(left, right)) continue;
        pairIds.push([left.id, right.id]);
        input.actorConstraintWorld.separate(
          left.runtime,
          right.runtime,
          left.localCoord,
          right.localCoord,
          resolvePushFactors(left, right),
        );
      }
    }
    for (const root of roots) {
      input.actorConstraintWorld.clampBodyPushToStage(root.runtime, input.stage);
      input.actorConstraintWorld.clampBodyPushDepthToStage(root.runtime, input.stage, root.localCoord);
    }

    return {
      schema: "RuntimeRootBodyPush/v0",
      mode: input.tagMode ? "ikemen-tag" : "pair",
      rootIds: roots.map(({ id }) => id),
      pairIds,
      movedRootIds: roots.filter((root) => {
        const prior = before.get(root.id);
        return root.runtime.pos.x !== prior?.x || root.runtime.combatDepth?.position !== prior?.z;
      }).map(({ id }) => id),
    };
  }
}

function hasPushGeometry(left: RuntimeRootBodyPushActor, right: RuntimeRootBodyPushActor): boolean {
  const leftScale = 320 / (left.localCoord?.[0] ?? 320);
  const rightScale = 320 / (right.localCoord?.[0] ?? 320);
  const leftSizeBox = left.sizeBox ?? { x1: -16, y1: -60, x2: 16, y2: 0 };
  const rightSizeBox = right.sizeBox ?? { x1: -16, y1: -60, x2: 16, y2: 0 };
  const leftTop = (left.runtime.pos.y + leftSizeBox.y1) * leftScale;
  const leftBottom = (left.runtime.pos.y + leftSizeBox.y2) * leftScale;
  const rightTop = (right.runtime.pos.y + rightSizeBox.y1) * rightScale;
  const rightBottom = (right.runtime.pos.y + rightSizeBox.y2) * rightScale;
  if (Math.min(leftBottom, rightBottom) - Math.max(leftTop, rightTop) <= 0) return false;
  if (!left.hurtBoxes?.length || !right.hurtBoxes?.length) return false;
  return left.hurtBoxes.some((leftBox) => right.hurtBoxes!.some((rightBox) =>
    collisionBoxesIntersect(runtimeWorldBox(left.runtime, leftBox), runtimeWorldBox(right.runtime, rightBox)),
  ));
}

function canPairPush(left: RuntimeRootBodyPushActor, right: RuntimeRootBodyPushActor): boolean {
  const leftAffect = left.runtime.pushAffectTeam ?? 1;
  const rightAffect = right.runtime.pushAffectTeam ?? 1;
  if (left.side === right.side) return !(leftAffect > 0 && rightAffect > 0);
  return leftAffect >= 0 && rightAffect >= 0;
}

function resolvePushFactors(
  left: RuntimeRootBodyPushActor,
  right: RuntimeRootBodyPushActor,
): { left: number; right: number } {
  const leftPriority = left.runtime.pushPriority ?? 0;
  const rightPriority = right.runtime.pushPriority ?? 0;
  const leftPushFactor = finiteNonNegative(left.pushFactor, 1);
  const rightPushFactor = finiteNonNegative(right.pushFactor, 1);
  if (leftPriority > rightPriority) return { left: 0, right: rightPushFactor };
  if (leftPriority < rightPriority) return { left: leftPushFactor, right: 0 };
  const leftWeight = finitePositive(left.weight, 100);
  const rightWeight = finitePositive(right.weight, 100);
  const totalWeight = leftWeight + rightWeight;
  return {
    left: (rightWeight / totalWeight) * leftPushFactor,
    right: (leftWeight / totalWeight) * rightPushFactor,
  };
}

function finitePositive(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback;
}

function finiteNonNegative(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function eligibleTagRoot(root: RuntimeRootBodyPushActor): boolean {
  return (root.side === 1 || root.side === 2) &&
    root.teamState.playerType &&
    !root.teamState.disabled &&
    !root.teamState.standby;
}

function assertUniqueRoots(roots: readonly RuntimeRootBodyPushActor[]): void {
  const ids = new Set<string>();
  for (const root of roots) {
    if (ids.has(root.id)) throw new Error(`Duplicate root body-push actor ${root.id}`);
    ids.add(root.id);
  }
}
