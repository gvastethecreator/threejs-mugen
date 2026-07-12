import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { RuntimeExplodPauseKind } from "./ExplodSystem";
import type { RuntimeHelper, RuntimeHelperAdvanceOptions } from "./HelperSystem";
import { runtimeStageGameSpace, type RuntimeStageGameSpaceSource } from "./RuntimeStageGameSpaceSystem";
import {
  RuntimeEffectHelperContextWorld,
  type RuntimeEffectHelperContextOptions,
  type RuntimeEffectHelperContextOpponent,
} from "./RuntimeEffectHelperContextSystem";
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
  onHelperPauseController?: RuntimeHelperAdvanceOptions["onPauseController"];
  onHelperTeamStandby?: RuntimeHelperAdvanceOptions["onTeamStandby"];
  scaleHelperTargetDamage?: RuntimeHelperAdvanceOptions["scaleTargetDamage"];
  effectActorWorld: Pick<
    RuntimeEffectActorWorld,
    | "advanceActiveEffects"
    | "advancePresentationEffects"
    | "explodSnapshots"
    | "helperSnapshots"
    | "projectileSnapshots"
    | "removeExplodsOnGetHit"
  > & Partial<Pick<RuntimeEffectActorWorld, "advanceHelper">>;
};

export type RuntimeEffectLifecycleOpponent = RuntimeEffectHelperContextOpponent;

export type RuntimeEffectLifecycleAdvanceOptions = RuntimeEffectHelperContextOptions & { skipHelpers?: boolean };

export type RuntimeEffectSnapshotGroups = {
  explods: ActorSnapshot[];
  helpers: ActorSnapshot[];
  projectiles: ActorSnapshot[];
};

export class RuntimeEffectLifecycleWorld {
  constructor(private readonly helperContextWorld = new RuntimeEffectHelperContextWorld()) {}

  advanceActive(
    actor: RuntimeEffectLifecycleActor,
    stage: RuntimeStageGameSpaceSource,
    opponent?: RuntimeEffectLifecycleActor,
    options: RuntimeEffectLifecycleAdvanceOptions = {},
  ): void {
    actor.effectActorWorld.advanceActiveEffects(actor.id, stage, {
      stageBounds: stage.bounds,
      ...this.helperContextWorld.create({ actor, opponent, options }),
      gameSpace: options.gameSpace ?? runtimeStageGameSpace(stage),
      skipHelpers: options.skipHelpers,
    });
  }

  advanceHelper(
    actor: RuntimeEffectLifecycleActor,
    helper: RuntimeHelper,
    stage: RuntimeStageGameSpaceSource,
    opponent?: RuntimeEffectLifecycleActor,
    options: RuntimeEffectLifecycleAdvanceOptions = {},
  ): boolean {
    if (!actor.effectActorWorld.advanceHelper) return false;
    return actor.effectActorWorld.advanceHelper(actor.id, helper, stage, {
      stageBounds: stage.bounds,
      ...this.helperContextWorld.create({ actor, opponent, options }),
      gameSpace: options.gameSpace ?? runtimeStageGameSpace(stage),
    });
  }

  advancePresentation(actor: RuntimeEffectLifecycleActor): void {
    actor.effectActorWorld.advancePresentationEffects(actor.id, effectBindAnchor(actor));
  }

  advancePausedPresentation(
    actor: RuntimeEffectLifecycleActor,
    pauseKind: RuntimeExplodPauseKind,
    stage: RuntimeStageGameSpaceSource,
    opponent?: RuntimeEffectLifecycleActor,
    options: RuntimeEffectLifecycleAdvanceOptions = {},
  ): void {
    actor.effectActorWorld.advancePresentationEffects(actor.id, effectBindAnchor(actor), {
      pauseKind,
      stage,
      stageBounds: stage.bounds,
      ...this.helperContextWorld.create({ actor, opponent, options }),
      gameSpace: options.gameSpace ?? runtimeStageGameSpace(stage),
      skipHelpers: options.skipHelpers,
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
