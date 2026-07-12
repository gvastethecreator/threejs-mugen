import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeActorConstraintState, RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
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
        if (!canPairPush(left, right)) continue;
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
