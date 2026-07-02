import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { RuntimeExplodPauseKind } from "./ExplodSystem";
import type { RuntimeHelper, RuntimeHelperAdvanceOptions } from "./HelperSystem";
import { RuntimeOpponentSelectionWorld } from "./RuntimeOpponentSelectionSystem";
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
  onHelperController?: RuntimeHelperAdvanceOptions["onController"];
  onHelperOperation?: RuntimeHelperAdvanceOptions["onOperation"];
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

export type RuntimeEffectLifecycleOpponent = {
  id?: string;
  runtime: RuntimeEffectLifecycleActor["runtime"];
};

export type RuntimeEffectLifecycleAdvanceOptions = Pick<
  RuntimeHelperAdvanceOptions,
  "stageTime" | "runtimeTick" | "opponentRoster"
> & {
  opponents?: readonly RuntimeEffectLifecycleOpponent[];
};

export type RuntimeEffectSnapshotGroups = {
  explods: ActorSnapshot[];
  helpers: ActorSnapshot[];
  projectiles: ActorSnapshot[];
};

export class RuntimeEffectLifecycleWorld {
  constructor(private readonly opponentSelectionWorld = new RuntimeOpponentSelectionWorld()) {}

  advanceActive(
    actor: RuntimeEffectLifecycleActor,
    stage: Pick<MugenStageDefinition, "bounds">,
    opponent?: RuntimeEffectLifecycleActor,
    options: RuntimeEffectLifecycleAdvanceOptions = {},
  ): void {
    actor.effectActorWorld.advanceActiveEffects(actor.id, stage, {
      stageBounds: stage.bounds,
      ...helperRedirectContext(actor, this.opponentSelectionWorld, opponent, options),
    });
  }

  advancePresentation(actor: RuntimeEffectLifecycleActor): void {
    actor.effectActorWorld.advancePresentationEffects(actor.id, effectBindAnchor(actor));
  }

  advancePausedPresentation(
    actor: RuntimeEffectLifecycleActor,
    pauseKind: RuntimeExplodPauseKind,
    stage: Pick<MugenStageDefinition, "bounds">,
    opponent?: RuntimeEffectLifecycleActor,
    options: RuntimeEffectLifecycleAdvanceOptions = {},
  ): void {
    actor.effectActorWorld.advancePresentationEffects(actor.id, effectBindAnchor(actor), {
      pauseKind,
      stage,
      stageBounds: stage.bounds,
      ...helperRedirectContext(actor, this.opponentSelectionWorld, opponent, options),
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
  opponentSelectionWorld: RuntimeOpponentSelectionWorld,
  opponent?: RuntimeEffectLifecycleActor,
  options: RuntimeEffectLifecycleAdvanceOptions = {},
): {
  parentState?: CharacterRuntimeState;
  rootState?: CharacterRuntimeState;
  opponentId?: string;
  opponentState?: CharacterRuntimeState;
  opponentRoster?: RuntimeHelperAdvanceOptions["opponentRoster"];
  stageTime?: number;
  runtimeTick?: number;
  targetCandidates?: RuntimeTargetWorldActor[];
  enterTargetState?: RuntimeHelperAdvanceOptions["enterTargetState"];
  onController?: RuntimeHelperAdvanceOptions["onController"];
  onOperation?: RuntimeHelperAdvanceOptions["onOperation"];
} {
  if (!isCompleteRuntimeState(actor.runtime)) {
    return {};
  }
  const { opponents, ...helperOptions } = options;
  let opponentId: string | undefined;
  let opponentState: CharacterRuntimeState | undefined;
  let opponentRoster: RuntimeHelperAdvanceOptions["opponentRoster"];
  const completeOpponents = opponents?.filter(isCompleteLifecycleOpponent);
  if (completeOpponents && completeOpponents.length > 0) {
    opponentRoster = opponentSelectionWorld.buildOpponentRoster({ runtime: actor.runtime }, completeOpponents);
  }
  if (opponent && isCompleteRuntimeState(opponent.runtime)) {
    opponentId = opponent.id;
    opponentState = opponent.runtime;
    opponentRoster ??= opponentSelectionWorld.buildOpponentRoster({ runtime: actor.runtime }, [
      { id: opponent.id, runtime: opponent.runtime },
    ]);
  }
  return {
    parentState: actor.runtime,
    rootState: actor.runtime,
    opponentId,
    opponentState,
    ...helperOptions,
    opponentRoster: helperOptions.opponentRoster ?? opponentRoster,
    ...(opponent && isRuntimeTargetWorldActor(opponent) ? { targetCandidates: [opponent] } : {}),
    ...(actor.enterHelperTargetState ? { enterTargetState: actor.enterHelperTargetState } : {}),
    ...(actor.onHelperController ? { onController: actor.onHelperController } : {}),
    ...(actor.onHelperOperation ? { onOperation: actor.onHelperOperation } : {}),
  };
}

function isCompleteLifecycleOpponent(opponent: RuntimeEffectLifecycleOpponent): opponent is RuntimeEffectLifecycleOpponent & { runtime: CharacterRuntimeState } {
  return isCompleteRuntimeState(opponent.runtime);
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
