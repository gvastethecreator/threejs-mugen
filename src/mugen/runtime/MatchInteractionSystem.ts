import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import type { RuntimeContactMemory, RuntimeContactMemoryWorld } from "./ContactMemorySystem";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { RuntimeEffectLifecycleActor, RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import { RuntimeMatchOpponentContextWorld } from "./RuntimeMatchOpponentContextSystem";
import { runtimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";
import type { RuntimeTargetWorld, RuntimeTargetWorldActor } from "./TargetSystem";

export type RuntimeMatchInteractionFighterPair<TFighter> = {
  p1: TFighter;
  p2: TFighter;
};

export type RuntimeRootTargetMaintenanceCandidate = {
  id: string;
  runtime: { teamState?: { disabled: boolean; playerType: boolean } };
};

export function selectRuntimeRootTargetMaintenanceActors<TActor extends RuntimeRootTargetMaintenanceCandidate>(
  roots: readonly TActor[],
): TActor[] {
  const seen = new Set<string>();
  return roots.filter((root) => {
    const teamState = root.runtime.teamState;
    if (!teamState?.playerType || teamState.disabled || runtimeTeamSide(root) === undefined || seen.has(root.id)) return false;
    seen.add(root.id);
    return true;
  });
}

export type RuntimeMatchInteractionWorldInput<TFighter> = RuntimeMatchInteractionFighterPair<TFighter> & {
  targetActors?: readonly TFighter[];
  targetResetActors?: readonly TFighter[];
  advanceTargetMemory: (fighter: TFighter) => void;
  clearTargetBindingSubject?: (fighter: TFighter) => void;
  advanceActiveEffects: (fighter: TFighter) => void;
  resolveProjectileClashes: (left: TFighter, right: TFighter) => void;
  separateActors: (left: TFighter, right: TFighter) => void;
  advanceBodyPush?: () => void;
  inspectHitAdmission?: () => void;
  applyTargetBindings: (fighter: TFighter, candidates: TFighter[]) => void;
  applyBindToTarget: (fighter: TFighter, candidates: TFighter[]) => void;
  refreshGuardDistance?: (defender: TFighter, attacker: TFighter) => void;
  resolvePriorityClash: (left: TFighter, right: TFighter) => string | undefined;
  resolveDirectCombat: (attacker: TFighter, defender: TFighter) => void;
  resolveProjectileCombat: (attacker: TFighter, defender: TFighter) => void;
  resolveHelperCombat?: (attacker: TFighter, defender: TFighter) => void;
  clampToStage: (fighter: TFighter) => void;
  advancePresentationEffects: (fighter: TFighter) => void;
  recordTargetMaintenance?: (fighter: TFighter) => void;
  recordSchedulePhase?: (phase: "post-fighter:combat" | "post-fighter:presentation-effects") => void;
  log: (line: string) => void;
};

export type RuntimeMatchInteractionRuntimeActor = RuntimeEffectLifecycleActor &
  RuntimeTargetWorldActor & {
    label: string;
    contact: RuntimeContactMemory;
    contactWorld: Pick<RuntimeContactMemoryWorld, "markProjectileCancel">;
    targetWorld: Pick<RuntimeTargetWorld, "advance" | "clearBindingSubject" | "applyTargetBindings" | "applyBindToTarget">;
    effectActorWorld: RuntimeEffectLifecycleActor["effectActorWorld"] & Pick<RuntimeEffectActorWorld, "resolveProjectileClashes">;
  };

export type RuntimeMatchInteractionRuntimeWorldInput<TFighter extends RuntimeMatchInteractionRuntimeActor> =
  RuntimeMatchInteractionFighterPair<TFighter> & {
    stage: Pick<MugenStageDefinition, "bounds">;
    actorConstraintWorld: Pick<RuntimeActorConstraintWorld, "separate" | "clampToStage">;
    effectLifecycleWorld: Pick<RuntimeEffectLifecycleWorld, "advanceActive" | "advancePresentation">;
    gameSpace?: ExpressionGameSpace;
    stageTime?: number;
    runtimeTick?: number;
    targetActors?: readonly TFighter[];
    targetResetActors?: readonly TFighter[];
    helpersAdvancedInActorOrder?: boolean;
    resolvePriorityClash: (left: TFighter, right: TFighter) => string | undefined;
    resolveDirectCombat: (attacker: TFighter, defender: TFighter) => void;
    resolveProjectileCombat: (attacker: TFighter, defender: TFighter) => void;
    resolveHelperCombat?: (attacker: TFighter, defender: TFighter) => void;
    refreshGuardDistance?: (defender: TFighter, attacker: TFighter) => void;
    advanceBodyPush?: () => void;
    inspectHitAdmission?: () => void;
    recordTargetMaintenance?: (fighter: TFighter) => void;
    recordSchedulePhase?: (phase: "post-fighter:combat" | "post-fighter:presentation-effects") => void;
    log: (line: string) => void;
  };

export class RuntimeMatchInteractionWorld {
  private readonly opponentContextWorld = new RuntimeMatchOpponentContextWorld();

  advance<TFighter>(input: RuntimeMatchInteractionWorldInput<TFighter>): void {
    const { p1, p2 } = input;
    const targetActors = input.targetActors ?? [p1, p2];

    for (const fighter of targetActors) {
      input.advanceTargetMemory(fighter);
      input.recordTargetMaintenance?.(fighter);
    }
    input.advanceActiveEffects(p1);
    input.advanceActiveEffects(p2);
    input.resolveProjectileClashes(p1, p2);
    if (input.advanceBodyPush) input.advanceBodyPush();
    else input.separateActors(p1, p2);
    for (const fighter of input.targetResetActors ?? []) input.clearTargetBindingSubject?.(fighter);
    for (const fighter of targetActors) {
      const candidates = targetActors.filter((candidate) => candidate !== fighter);
      input.applyTargetBindings(fighter, candidates);
    }
    for (const fighter of targetActors) {
      const candidates = targetActors.filter((candidate) => candidate !== fighter);
      input.applyBindToTarget(fighter, candidates);
    }
    input.refreshGuardDistance?.(p1, p2);
    input.refreshGuardDistance?.(p2, p1);
    input.inspectHitAdmission?.();

    input.recordSchedulePhase?.("post-fighter:combat");
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
    input.recordSchedulePhase?.("post-fighter:presentation-effects");
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
      targetActors: input.targetActors,
      targetResetActors: input.targetResetActors,
      advanceTargetMemory: (fighter) => fighter.targetWorld.advance(fighter),
      clearTargetBindingSubject: (fighter) => fighter.targetWorld.clearBindingSubject(fighter),
      advanceActiveEffects: (fighter) => {
        const context = this.opponentContextWorld.forActor(pair, fighter);
        if (!context) {
          return;
        }
        effectLifecycleWorld.advanceActive(fighter, stage, context.opponent, {
          gameSpace: input.gameSpace,
          stageTime: input.stageTime,
          runtimeTick: input.runtimeTick,
          opponents: context.opponents,
          skipHelpers: input.helpersAdvancedInActorOrder,
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
      advanceBodyPush: input.advanceBodyPush,
      inspectHitAdmission: input.inspectHitAdmission,
      applyTargetBindings: (fighter, candidates) => fighter.targetWorld.applyTargetBindings(fighter, candidates),
      applyBindToTarget: (fighter, candidates) => fighter.targetWorld.applyBindToTarget(fighter, candidates),
      resolvePriorityClash: input.resolvePriorityClash,
      resolveDirectCombat: input.resolveDirectCombat,
      resolveProjectileCombat: input.resolveProjectileCombat,
      resolveHelperCombat: input.resolveHelperCombat,
      refreshGuardDistance: input.refreshGuardDistance,
      recordTargetMaintenance: input.recordTargetMaintenance,
      recordSchedulePhase: input.recordSchedulePhase,
      clampToStage: (fighter) => actorConstraintWorld.clampToStage(fighter.runtime, stage),
      advancePresentationEffects: (fighter) => effectLifecycleWorld.advancePresentation(fighter),
      log: input.log,
    });
  }
}
