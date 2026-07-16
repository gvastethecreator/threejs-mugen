import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import type { RuntimeEffectLifecycleAdvanceOptions, RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";
import { RuntimeMatchInteractionWorld, type RuntimeMatchInteractionRuntimeActor } from "./MatchInteractionSystem";
import {
  RuntimeMatchCombatBridgeWorld,
  type RuntimeMatchCombatBridgeActor,
  type RuntimeMatchCombatBridgeInput,
} from "./RuntimeMatchCombatBridgeSystem";

export type RuntimeMatchPostFighterActor = RuntimeMatchCombatBridgeActor & RuntimeMatchInteractionRuntimeActor;

export type RuntimeMatchPostFighterInput<TActor extends RuntimeMatchPostFighterActor> = Omit<
  RuntimeMatchCombatBridgeInput<TActor>,
  "effectLifecycleWorld"
> & {
  p1: TActor;
  p2: TActor;
  stage: Pick<MugenStageDefinition, "bounds"> & Partial<Pick<MugenStageDefinition, "depthBounds" | "localCoord">>;
  gameSpace?: ExpressionGameSpace;
  stageTime?: number;
  helpersAdvancedInActorOrder?: boolean;
  targetActors?: readonly TActor[];
  targetResetActors?: readonly TActor[];
  hitDefContactActors?: readonly TActor[];
  resolveHelperTargetRedirect?: RuntimeEffectLifecycleAdvanceOptions["resolveTargetRedirect"];
  resolveHelperResourceRedirect?: RuntimeEffectLifecycleAdvanceOptions["resolveResourceRedirect"];
  onHelperTargetRedirectBlocked?: RuntimeEffectLifecycleAdvanceOptions["onTargetRedirectBlocked"];
  onHelperResourceRedirectBlocked?: RuntimeEffectLifecycleAdvanceOptions["onResourceRedirectBlocked"];
  onHelperRedirectedController?: RuntimeEffectLifecycleAdvanceOptions["onRedirectedController"];
  onHelperRedirectedOperation?: RuntimeEffectLifecycleAdvanceOptions["onRedirectedOperation"];
  onHelperRedirectedTargetDispatch?: RuntimeEffectLifecycleAdvanceOptions["onRedirectedTargetDispatch"];
  enterHelperRedirectedTargetState?: RuntimeEffectLifecycleAdvanceOptions["enterRedirectedTargetState"];
  actorConstraintWorld: Pick<RuntimeActorConstraintWorld, "separate" | "clampToStage">;
  effectLifecycleWorld: Pick<RuntimeEffectLifecycleWorld, "advanceActive" | "advancePresentation" | "markGetHit">;
  recordSchedulePhase?: (phase: "post-fighter:combat" | "post-fighter:presentation-effects") => void;
  refreshGuardDistance?: (defender: TActor, attacker: TActor) => void;
  refreshRootGuardDistance?: () => void;
  advanceBodyPush?: () => void;
  inspectHitAdmission?: () => void;
  resolveRootPriorityClashes?: (resolvePriorityClash: (left: TActor, right: TActor) => string | undefined) => void;
  resolveRootReversalClashes?: (resolveReversalClash: (reverser: TActor, getter: TActor) => void) => void;
  resolveRootPriorityOutcomes?: (resolveEqualPriorityOutcomes: (actors: readonly TActor[]) => number) => void;
  resolveRootDirectCombat?: (resolveDirectCombat: (attacker: TActor, defender: TActor) => void) => void;
  recordTargetMaintenance?: (fighter: TActor) => void;
  commitHitDefTargets?: (fighter: TActor) => void;
  recordHitDefContactCommit?: (fighter: TActor) => void;
};

export class RuntimeMatchPostFighterWorld {
  constructor(
    private readonly combatBridgeWorld = new RuntimeMatchCombatBridgeWorld(),
    private readonly interactionWorld = new RuntimeMatchInteractionWorld(),
  ) {}

  advanceRuntime<TActor extends RuntimeMatchPostFighterActor>(input: RuntimeMatchPostFighterInput<TActor>): void {
    const combatResolvers = this.combatBridgeWorld.createResolvers({
      ...input,
      stageBounds: input.stageBounds ?? input.stage.bounds,
    });

    this.interactionWorld.advanceRuntime({
      p1: input.p1,
      p2: input.p2,
      stage: input.stage,
      gameSpace: input.gameSpace,
      stageTime: input.stageTime,
      runtimeTick: input.runtimeTick,
      targetActors: input.targetActors,
      targetResetActors: input.targetResetActors,
      hitDefContactActors: input.hitDefContactActors,
      helpersAdvancedInActorOrder: input.helpersAdvancedInActorOrder,
      resolveHelperTargetRedirect: input.resolveHelperTargetRedirect,
      resolveHelperResourceRedirect: input.resolveHelperResourceRedirect,
      onHelperTargetRedirectBlocked: input.onHelperTargetRedirectBlocked,
      onHelperResourceRedirectBlocked: input.onHelperResourceRedirectBlocked,
      onHelperRedirectedController: input.onHelperRedirectedController,
      onHelperRedirectedOperation: input.onHelperRedirectedOperation,
      onHelperRedirectedTargetDispatch: input.onHelperRedirectedTargetDispatch,
      enterHelperRedirectedTargetState: input.enterHelperRedirectedTargetState,
      actorConstraintWorld: input.actorConstraintWorld,
      effectLifecycleWorld: input.effectLifecycleWorld,
      resolvePriorityClash: combatResolvers.resolvePriorityClash,
      resolveReversalClash: combatResolvers.resolveReversalClash,
      resolveDirectCombat: combatResolvers.resolveDirectCombat,
      resolveProjectileCombat: combatResolvers.resolveProjectileCombat,
      resolveHelperCombat: combatResolvers.resolveHelperCombat,
      refreshGuardDistance: input.refreshGuardDistance,
      refreshRootGuardDistance: input.refreshRootGuardDistance,
      advanceBodyPush: input.advanceBodyPush,
      inspectHitAdmission: input.inspectHitAdmission,
      resolveRootReversalClashes: input.resolveRootReversalClashes,
      resolveRootPriorityClashes: input.resolveRootPriorityClashes,
      resolveRootPriorityOutcomes: input.resolveRootPriorityOutcomes,
      resolveEqualPriorityOutcomes: combatResolvers.resolveEqualPriorityOutcomes,
      resolveRootDirectCombat: input.resolveRootDirectCombat,
      recordTargetMaintenance: input.recordTargetMaintenance,
      commitHitDefTargets: input.commitHitDefTargets,
      recordHitDefContactCommit: input.recordHitDefContactCommit,
      recordSchedulePhase: input.recordSchedulePhase,
      log: input.log,
    });
  }
}
