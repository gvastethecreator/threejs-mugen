import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { RuntimeExplodPauseKind } from "./ExplodSystem";
import type { RuntimeHelper, RuntimeHelperAdvanceOptions } from "./HelperSystem";
import type { RuntimeTargetWorldActor } from "./TargetSystem";
import type { ActorSnapshot, CharacterRuntimeState } from "./types";

export type RuntimeEffectGetHitActor = {
  id: string;
  runtime: Pick<CharacterRuntimeState, "moveType">;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "removeExplodsOnGetHit">;
};

export type RuntimeEffectLifecycleActor = RuntimeEffectGetHitActor & {
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "stateNo" | "moveType">;
  targets?: RuntimeTargetWorldActor["targets"];
  targetBindings?: RuntimeTargetWorldActor["targetBindings"];
  bindToTarget?: RuntimeTargetWorldActor["bindToTarget"];
  enterHelperTargetState?: (helper: RuntimeHelper, target: RuntimeTargetWorldActor, stateId: number) => void;
  effectActorWorld: Pick<
    RuntimeEffectActorWorld,
    | "advanceActiveEffects"
    | "advancePresentationEffects"
    | "explodSnapshots"
    | "helperSnapshots"
    | "projectileSnapshots"
    | "removeExplodsOnGetHit"
  >;
};

export type RuntimeEffectSnapshotGroups = {
  explods: ActorSnapshot[];
  helpers: ActorSnapshot[];
  projectiles: ActorSnapshot[];
};

export class RuntimeEffectLifecycleWorld {
  advanceActive(
    actor: RuntimeEffectLifecycleActor,
    stage: Pick<MugenStageDefinition, "bounds">,
    opponent?: RuntimeEffectLifecycleActor,
  ): void {
    actor.effectActorWorld.advanceActiveEffects(actor.id, stage, helperRedirectContext(actor, opponent));
  }

  advancePresentation(actor: RuntimeEffectLifecycleActor): void {
    actor.effectActorWorld.advancePresentationEffects(actor.id, effectBindAnchor(actor));
  }

  advancePausedPresentation(
    actor: RuntimeEffectLifecycleActor,
    pauseKind: RuntimeExplodPauseKind,
    stage: Pick<MugenStageDefinition, "bounds">,
    opponent?: RuntimeEffectLifecycleActor,
  ): void {
    actor.effectActorWorld.advancePresentationEffects(actor.id, effectBindAnchor(actor), {
      pauseKind,
      stage,
      ...helperRedirectContext(actor, opponent),
    });
  }

  markGetHit(actor: RuntimeEffectLifecycleActor): void {
    markRuntimeEffectActorGotHit(actor);
  }

  snapshotGroups(actor: RuntimeEffectLifecycleActor): RuntimeEffectSnapshotGroups {
    return {
      explods: actor.effectActorWorld.explodSnapshots(actor.id, actor.runtime.stateNo),
      helpers: actor.effectActorWorld.helperSnapshots(actor.id, actor.runtime.stateNo),
      projectiles: actor.effectActorWorld.projectileSnapshots(actor.id, actor.runtime.stateNo),
    };
  }

  snapshots(actor: RuntimeEffectLifecycleActor): ActorSnapshot[] {
    const groups = this.snapshotGroups(actor);
    return [...groups.explods, ...groups.helpers, ...groups.projectiles];
  }
}

export function markRuntimeEffectActorGotHit(actor: RuntimeEffectGetHitActor): void {
  actor.runtime.moveType = "H";
  actor.effectActorWorld.removeExplodsOnGetHit(actor.id);
}

function effectBindAnchor(actor: RuntimeEffectLifecycleActor): { pos: { x: number; y: number }; facing: 1 | -1 } {
  return {
    pos: actor.runtime.pos,
    facing: actor.runtime.facing,
  };
}

function helperRedirectContext(
  actor: RuntimeEffectLifecycleActor,
  opponent?: RuntimeEffectLifecycleActor,
): {
  parentState?: CharacterRuntimeState;
  rootState?: CharacterRuntimeState;
  opponentId?: string;
  opponentState?: CharacterRuntimeState;
  targetCandidates?: RuntimeTargetWorldActor[];
  enterTargetState?: RuntimeHelperAdvanceOptions["enterTargetState"];
} {
  if (!isCompleteRuntimeState(actor.runtime)) {
    return {};
  }
  let opponentId: string | undefined;
  let opponentState: CharacterRuntimeState | undefined;
  if (opponent && isCompleteRuntimeState(opponent.runtime)) {
    opponentId = opponent.id;
    opponentState = opponent.runtime;
  }
  return {
    parentState: actor.runtime,
    rootState: actor.runtime,
    opponentId,
    opponentState,
    ...(opponent && isRuntimeTargetWorldActor(opponent) ? { targetCandidates: [opponent] } : {}),
    ...(actor.enterHelperTargetState ? { enterTargetState: actor.enterHelperTargetState } : {}),
  };
}

function isRuntimeTargetWorldActor(actor: RuntimeEffectLifecycleActor): actor is RuntimeEffectLifecycleActor & RuntimeTargetWorldActor {
  return isCompleteRuntimeState(actor.runtime) && Array.isArray(actor.targets) && Array.isArray(actor.targetBindings);
}

function isCompleteRuntimeState(
  runtime: RuntimeEffectLifecycleActor["runtime"],
): runtime is CharacterRuntimeState {
  return (
    "vel" in runtime &&
    "animNo" in runtime &&
    "animTime" in runtime &&
    "frameIndex" in runtime &&
    "life" in runtime &&
    "power" in runtime &&
    "ctrl" in runtime &&
    "stateType" in runtime &&
    "physics" in runtime &&
    "vars" in runtime &&
    "fvars" in runtime
  );
}
