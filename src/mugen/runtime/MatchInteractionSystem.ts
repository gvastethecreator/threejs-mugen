import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import type { RuntimeContactMemory, RuntimeContactMemoryWorld } from "./ContactMemorySystem";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { RuntimeEffectLifecycleActor, RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import { RuntimeMatchOpponentContextWorld } from "./RuntimeMatchOpponentContextSystem";
import type { RuntimeTargetWorld, RuntimeTargetWorldActor } from "./TargetSystem";

export type RuntimeMatchInteractionFighterPair<TFighter> = {
  p1: TFighter;
  p2: TFighter;
};

export type RuntimeMatchInteractionWorldInput<TFighter> = RuntimeMatchInteractionFighterPair<TFighter> & {
  advanceTargetMemory: (fighter: TFighter) => void;
  advanceActiveEffects: (fighter: TFighter) => void;
  resolveProjectileClashes: (left: TFighter, right: TFighter) => void;
  separateActors: (left: TFighter, right: TFighter) => void;
  applyTargetBindings: (fighter: TFighter, opponent: TFighter) => void;
  applyBindToTarget: (fighter: TFighter, opponent: TFighter) => void;
  resolvePriorityClash: (left: TFighter, right: TFighter) => string | undefined;
  resolveDirectCombat: (attacker: TFighter, defender: TFighter) => void;
  resolveProjectileCombat: (attacker: TFighter, defender: TFighter) => void;
  resolveHelperCombat?: (attacker: TFighter, defender: TFighter) => void;
  clampToStage: (fighter: TFighter) => void;
  advancePresentationEffects: (fighter: TFighter) => void;
  log: (line: string) => void;
};

export type RuntimeMatchInteractionRuntimeActor = RuntimeEffectLifecycleActor &
  RuntimeTargetWorldActor & {
    label: string;
    contact: RuntimeContactMemory;
    contactWorld: Pick<RuntimeContactMemoryWorld, "markProjectileCancel">;
    targetWorld: Pick<RuntimeTargetWorld, "advance" | "applyTargetBindings" | "applyBindToTarget">;
    effectActorWorld: RuntimeEffectLifecycleActor["effectActorWorld"] & Pick<RuntimeEffectActorWorld, "resolveProjectileClashes">;
  };

export type RuntimeMatchInteractionRuntimeWorldInput<TFighter extends RuntimeMatchInteractionRuntimeActor> =
  RuntimeMatchInteractionFighterPair<TFighter> & {
    stage: Pick<MugenStageDefinition, "bounds">;
    actorConstraintWorld: Pick<RuntimeActorConstraintWorld, "separate" | "clampToStage">;
    effectLifecycleWorld: Pick<RuntimeEffectLifecycleWorld, "advanceActive" | "advancePresentation">;
    stageTime?: number;
    runtimeTick?: number;
    resolvePriorityClash: (left: TFighter, right: TFighter) => string | undefined;
    resolveDirectCombat: (attacker: TFighter, defender: TFighter) => void;
    resolveProjectileCombat: (attacker: TFighter, defender: TFighter) => void;
    resolveHelperCombat?: (attacker: TFighter, defender: TFighter) => void;
    log: (line: string) => void;
  };

export class RuntimeMatchInteractionWorld {
  private readonly opponentContextWorld = new RuntimeMatchOpponentContextWorld();

  advance<TFighter>(input: RuntimeMatchInteractionWorldInput<TFighter>): void {
    const { p1, p2 } = input;

    input.advanceTargetMemory(p1);
    input.advanceTargetMemory(p2);
    input.advanceActiveEffects(p1);
    input.advanceActiveEffects(p2);
    input.resolveProjectileClashes(p1, p2);
    input.separateActors(p1, p2);
    input.applyTargetBindings(p1, p2);
    input.applyTargetBindings(p2, p1);
    input.applyBindToTarget(p1, p2);
    input.applyBindToTarget(p2, p1);

    const priorityMessage = input.resolvePriorityClash(p1, p2);
    if (priorityMessage) {
      input.log(priorityMessage);
    }

    input.resolveDirectCombat(p1, p2);
    input.resolveDirectCombat(p2, p1);
    input.resolveProjectileCombat(p1, p2);
    input.resolveProjectileCombat(p2, p1);
    input.resolveHelperCombat?.(p1, p2);
    input.resolveHelperCombat?.(p2, p1);
    input.clampToStage(p1);
    input.clampToStage(p2);
    input.advancePresentationEffects(p1);
    input.advancePresentationEffects(p2);
  }

  advanceRuntime<TFighter extends RuntimeMatchInteractionRuntimeActor>(
    input: RuntimeMatchInteractionRuntimeWorldInput<TFighter>,
  ): void {
    const { actorConstraintWorld, effectLifecycleWorld, p1, p2, stage } = input;
    const pair = { p1, p2 };

    this.advance({
      p1,
      p2,
      advanceTargetMemory: (fighter) => fighter.targetWorld.advance(fighter),
      advanceActiveEffects: (fighter) => {
        const context = this.opponentContextWorld.forActor(pair, fighter);
        if (!context) {
          return;
        }
        effectLifecycleWorld.advanceActive(fighter, stage, context.opponent, {
          stageTime: input.stageTime,
          runtimeTick: input.runtimeTick,
          opponents: context.opponents,
        });
      },
      resolveProjectileClashes: (left, right) =>
        left.effectActorWorld.resolveProjectileClashes(left.id, right.id, {
          leftLabel: left.label,
          rightLabel: right.label,
          log: input.log,
          recordProjectileCancel: (projectile) => {
            const owner = projectile.ownerId === right.id ? right : left;
            owner.contactWorld.markProjectileCancel(owner.contact, owner.runtime.stateNo, projectile.projectileId);
          },
        }),
      separateActors: (left, right) => actorConstraintWorld.separate(left.runtime, right.runtime),
      applyTargetBindings: (fighter, opponent) => fighter.targetWorld.applyTargetBindings(fighter, [opponent]),
      applyBindToTarget: (fighter, opponent) => fighter.targetWorld.applyBindToTarget(fighter, [opponent]),
      resolvePriorityClash: input.resolvePriorityClash,
      resolveDirectCombat: input.resolveDirectCombat,
      resolveProjectileCombat: input.resolveProjectileCombat,
      resolveHelperCombat: input.resolveHelperCombat,
      clampToStage: (fighter) => actorConstraintWorld.clampToStage(fighter.runtime, stage),
      advancePresentationEffects: (fighter) => effectLifecycleWorld.advancePresentation(fighter),
      log: input.log,
    });
  }
}
