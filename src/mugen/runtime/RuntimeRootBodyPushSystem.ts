import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeActorConstraintState, RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTeamState } from "./types";

export type RuntimeRootBodyPushActor = {
  id: string;
  side: RuntimeTeamSide | null;
  teamState: RuntimeTeamState;
  runtime: RuntimeActorConstraintState;
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
  stage: Pick<MugenStageDefinition, "bounds">;
  actorConstraintWorld: Pick<RuntimeActorConstraintWorld, "separate" | "clampBodyPushToStage">;
};

export class RuntimeRootBodyPushWorld {
  advance(input: RuntimeRootBodyPushInput): RuntimeRootBodyPushDiagnostic {
    assertUniqueRoots(input.roots);
    const roots = input.tagMode ? input.roots.filter(eligibleTagRoot) : [...input.playableRoots];
    const before = new Map(roots.map((root) => [root.id, root.runtime.pos.x]));
    const pairIds: Array<[string, string]> = [];

    for (let leftIndex = 0; leftIndex < roots.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < roots.length; rightIndex += 1) {
        const left = roots[leftIndex]!;
        const right = roots[rightIndex]!;
        pairIds.push([left.id, right.id]);
        input.actorConstraintWorld.separate(left.runtime, right.runtime);
      }
    }
    for (const root of roots) input.actorConstraintWorld.clampBodyPushToStage(root.runtime, input.stage);

    return {
      schema: "RuntimeRootBodyPush/v0",
      mode: input.tagMode ? "ikemen-tag" : "pair",
      rootIds: roots.map(({ id }) => id),
      pairIds,
      movedRootIds: roots.filter((root) => root.runtime.pos.x !== before.get(root.id)).map(({ id }) => id),
    };
  }
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
