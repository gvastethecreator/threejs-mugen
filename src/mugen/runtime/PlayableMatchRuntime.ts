import type {
  AudioControllerOp,
  EnvColorControllerOp,
  PauseControllerOp,
  TeamStandbyControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController, MugenStateDef } from "../model/MugenState";
import {
  RuntimeActorConstraintControllerDispatchWorld,
  RuntimeActorConstraintWorld,
  type RuntimeDepthResolver,
  type RuntimeWidthResolver,
} from "./ActorConstraintSystem";
import {
  RuntimeAudioControllerDispatchWorld,
  type RuntimeAudioParamResolver,
  type RuntimeResolvedSoundValue,
  RuntimeAudioWorld,
} from "./AudioEventSystem";
import {
  RuntimeContactControllerDispatchWorld,
  RuntimeContactMemoryWorld,
} from "./ContactMemorySystem";
import {
  RuntimeEnvColorControllerDispatchWorld,
  type RuntimeEnvColorResolver,
  RuntimeEnvColorWorld,
} from "./EnvColorSystem";
import { scaleRuntimeIncomingDamage } from "./CombatResolver";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "./demoFighters";
import { RuntimeDirectCombatWorld } from "./DirectCombatSystem";
import { RuntimeEnvShakeWorld } from "./EnvShakeSystem";
import { RuntimeHitDefControllerDispatchWorld } from "./HitDefSystem";
import { RuntimeHitEffectWorld } from "./HitEffectSystem";
import { RuntimeHitOverrideWorld } from "./HitOverrideSystem";
import { RuntimeReversalControllerDispatchWorld, RuntimeReversalWorld } from "./ReversalSystem";
import {
  RuntimeEffectActorWorld,
  type RuntimeEffectActorStores,
  type RuntimeEffectActorStoreSummary,
} from "./EffectActorSystem";
import { RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import {
  RuntimeEffectSpawnControllerDispatchWorld,
  RuntimeEffectSpawnWorld,
} from "./EffectSpawnSystem";
import { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import { RuntimeGuardWorld } from "./GuardSystem";
import {
  applyRuntimeHelperTagStateControl,
  canAdvanceRuntimeHelper,
  hasRuntimeHelperState,
  helperRuntimeState,
  type RuntimeHelper,
} from "./HelperSystem";
import { RuntimeHitStateTransitionWorld } from "./HitStateTransitionSystem";
import { RuntimeInputControlWorld } from "./RuntimeInputControlSystem";
import { RuntimeDispatchEvaluationWorld } from "./RuntimeDispatchEvaluationSystem";
import { RuntimeExpressionContextWorld, runtimeDefinitionConst } from "./RuntimeExpressionContextSystem";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import { RuntimeMatchHelperBindingWorld } from "./RuntimeMatchHelperBindingSystem";
import { RuntimeMatchActiveWorld } from "./RuntimeMatchActiveSystem";
import { RuntimeMatchActorRosterWorld, type RuntimeMatchActorRoster } from "./RuntimeMatchActorRosterSystem";
import { RuntimeMatchFrameStartWorld } from "./RuntimeMatchFrameStartSystem";
import { RuntimeMatchHitPauseWorld } from "./RuntimeMatchHitPauseSystem";
import { RuntimeMatchInputControlWorld } from "./RuntimeMatchInputControlSystem";
import { RuntimeMatchPausedBridgeWorld } from "./RuntimeMatchPausedBridgeSystem";
import { RuntimeMatchPreFacingAssertSpecialWorld } from "./RuntimeMatchPreFacingAssertSpecialSystem";
import { RuntimeMatchStepWorld } from "./RuntimeMatchStepSystem";
import { RuntimeMatchTickBranchWorld } from "./RuntimeMatchTickBranchSystem";
import { RuntimeMatchTickInputWorld } from "./RuntimeMatchTickInputSystem";
import {
  createIdleMatchTickSchedule,
  RuntimeMatchTickScheduleRecorder,
  type RuntimeMatchTickPhaseId,
} from "./RuntimeMatchTickScheduleSystem";
import { RuntimeGuardDistanceWorld } from "./RuntimeGuardDistanceSystem";
import { RuntimeContactPresentationWorld } from "./RuntimeContactPresentationSystem";
import { RuntimeCombatResolutionWorld } from "./RuntimeCombatResolutionSystem";
import {
  RuntimeCharacterIdentityWorld,
  type RuntimeCharacterIdentityActor,
  type RuntimeCharacterIdentityDiagnostic,
  type RuntimeCharacterIdentityRegistry,
} from "./RuntimeCharacterIdentitySystem";
import { RuntimeHelperCombatWorld } from "./RuntimeHelperCombatSystem";
import { RuntimeMatchCombatStateHooksWorld } from "./RuntimeMatchCombatStateHooksSystem";
import { RuntimeMatchFighterAdvanceWorld } from "./RuntimeMatchFighterAdvanceSystem";
import {
  RuntimeActorRunOrderWorld,
  type RuntimeActorRunOrderCandidate,
  type RuntimeActorRunOrderResult,
} from "./RuntimeActorRunOrderSystem";
import { RuntimeMatchActorAdvanceWorld } from "./RuntimeMatchActorAdvanceSystem";
import { RuntimePausedActorAdvanceWorld } from "./RuntimePausedActorAdvanceSystem";
import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import { defaultSuperPauseTargetDefenseValue } from "./SuperPauseTargetDefensePolicy";
import { runtimeTeamSide, RuntimeTeamTopologyWorld } from "./RuntimeTeamTopologySystem";
import {
  RuntimeFighterRunOrderWorld,
  type RuntimeRootRunOrderResult,
} from "./RuntimeFighterRunOrderSystem";
import { RuntimeMatchPostFighterWorld } from "./RuntimeMatchPostFighterSystem";
import { selectRuntimeRootTargetMaintenanceActors } from "./MatchInteractionSystem";
import {
  commitRuntimeHitDefTargets,
  createRuntimeHitDefContactMemoryDiagnostic,
  type RuntimeHitDefContactMemoryDiagnostic,
} from "./RuntimeHitDefContactMemorySystem";
import { RuntimeMatchPresentationSnapshotWorld } from "./RuntimeMatchPresentationSnapshotSystem";
import { RuntimeMatchRoundWorld } from "./RuntimeMatchRoundSystem";
import { RuntimeControllerEvaluationContextWorld } from "./RuntimeControllerEvaluationContextSystem";
import { RuntimeMatchHelperProjectileTargetWorld } from "./RuntimeMatchHelperProjectileTargetSystem";
import { RuntimeMatchHelperTargetStateWorld } from "./RuntimeMatchHelperTargetStateSystem";
import { RuntimeMatchEnvColorBridgeWorld } from "./RuntimeMatchEnvColorBridgeSystem";
import { RuntimeMatchEnvShakeBridgeWorld } from "./RuntimeMatchEnvShakeBridgeSystem";
import { RuntimeMatchResetWorld } from "./RuntimeMatchResetSystem";
import { RuntimeActiveControllerRunWorld } from "./RuntimeActiveControllerRunSystem";
import {
  RuntimeRootCnsExecutionWorld,
  type RuntimeRootCnsParticipation,
} from "./RuntimeRootCnsExecutionSystem";
import { RuntimeRootAdvancePhaseWorld } from "./RuntimeRootAdvancePhaseSystem";
import { RuntimeRootMotionAdvanceWorld } from "./RuntimeRootMotionAdvanceSystem";
import { RuntimeRootPresentationWorld } from "./RuntimeRootPresentationSystem";
import { RuntimeRootBodyPushWorld, type RuntimeRootBodyPushDiagnostic } from "./RuntimeRootBodyPushSystem";
import {
  RuntimeRootDirectHitAdmissionWorld,
  type RuntimeRootDirectHitAdmissionDiagnostic,
} from "./RuntimeRootDirectHitAdmissionSystem";
import { RuntimeRootSelectionWorld } from "./RuntimeRootSelectionSystem";
import {
  RuntimeRootInputRoutingWorld,
  type RuntimeRootInputRoute,
} from "./RuntimeRootInputRoutingSystem";
import { RuntimeTagPartnerSelectionWorld } from "./RuntimeTagPartnerSelectionSystem";
import { RuntimeTagTeamOrderWorld, type RuntimeTagTeamOrder } from "./RuntimeTagTeamOrderSystem";
import { RuntimeActiveControllerTelemetryWorld } from "./RuntimeActiveControllerTelemetrySystem";
import { RuntimeActiveExpressionContextWorld } from "./RuntimeActiveExpressionContextSystem";
import { RuntimeAutoGuardStartWorld } from "./RuntimeAutoGuardStartSystem";
import { defaultRuntimeHurtBoxes, RuntimeFrameWorld } from "./RuntimeFrameSystem";
import { RuntimeRoundSystem } from "./RuntimeRoundSystem";
import { nextRuntimeRandomUnit } from "./RuntimeRandomSystem";
import type { RuntimeModifyProjectileNumberParam, RuntimeModifyProjectilePairParam } from "./ProjectileSystem";
import {
  applyRuntimeControl,
  applyRuntimePowerDelta,
} from "./RuntimeResourceSystem";
import { RuntimeSnapshotWorld } from "./RuntimeSnapshotSystem";
import { RuntimeOrientationWorld } from "./OrientationSystem";
import { RuntimeRecoverySystem } from "./RuntimeRecoverySystem";
import { RuntimeHitEligibilityWorld } from "./RuntimeHitEligibilitySystem";
import { RuntimeAssertSpecialWorld } from "./RuntimeAssertSpecialSystem";
import { RuntimeCompatibilityTelemetryWorld } from "./RuntimeCompatibilityTelemetrySystem";
import { RuntimeFighterAdvanceHookSetWorld } from "./RuntimeFighterAdvanceHookSetSystem";
import { RuntimeFighterAdvanceWorld } from "./RuntimeFighterAdvanceSystem";
import { RuntimeFighterStateWorld, type FighterMatchState } from "./RuntimeFighterStateSystem";
import {
  RuntimeRootStandbyTransitionWorld,
  type RuntimeRootStandbyChange,
} from "./RuntimeRootStandbyTransitionSystem";
import { RuntimeControllerDispatchWorld } from "./RuntimeControllerDispatchSystem";
import { RuntimeHitPauseWorld } from "./RuntimeHitPauseSystem";
import { RuntimeMoveLifecycleWorld } from "./RuntimeMoveLifecycleSystem";
import { RuntimeMoveStartWorld } from "./RuntimeMoveStartSystem";
import { RuntimeKinematicsWorld, runtimeGroundFrictionOptions } from "./RuntimeKinematicsSystem";
import {
  RuntimeAnimationWorld,
  runtimeAnimationElementTime,
  runtimeAnimationTimeRemaining,
} from "./RuntimeAnimationSystem";
import {
  RuntimeStateEntryWorld,
  type RuntimeStateEntryAnimationElementOptions,
  type RuntimeStateEntryOptions,
} from "./RuntimeStateEntrySystem";
import { RuntimeStateEntryRouteWorld } from "./RuntimeStateEntryRouteSystem";
import { RuntimeStateEntrySetupWorld } from "./RuntimeStateEntrySetupSystem";
import { RuntimeStateClockWorld } from "./RuntimeStateClockSystem";
import { runtimeStageGameSpace } from "./RuntimeStageGameSpaceSystem";
import { hasRuntimeStun, RuntimeStunWorld } from "./RuntimeStunSystem";
import { RuntimeActiveControllerHookSetWorld } from "./RuntimeActiveControllerHookSetSystem";
import {
  RuntimeMatchPauseControllerWorld,
  RuntimePauseControllerDispatchWorld,
  RuntimePauseWorld,
  RuntimePausedMatchWorld,
  type MatchPauseControllerResult,
  type RuntimeMatchPause,
  type RuntimePauseControllerParamResolvers,
} from "./PauseSystem";
import { dispatchStateProgramController, findControllerParam } from "./StateProgramExecutor";
import {
  RuntimeSpriteEffectControllerWorld,
  RuntimeSpriteEffectWorld,
} from "./SpriteEffectSystem";
import {
  RuntimeTargetControllerDispatchWorld,
  RuntimeTargetWorld,
  type RuntimeTargetWorldActor,
} from "./TargetSystem";
import { RuntimeTargetStateEntryWorld } from "./RuntimeTargetStateEntrySystem";
import { RuntimeTriggerEvaluationWorld } from "./RuntimeTriggerEvaluationSystem";
import { RuntimeTriggerGateWorld } from "./RuntimeTriggerGateSystem";
import { RuntimeAfterImageSampleWorld } from "./RuntimeAfterImageSampleSystem";
import { trainingStage } from "./demoStage";
import type {
  CharacterRuntimeState,
  MugenSnapshot,
} from "./types";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";

const compatibilityTelemetryWorld = new RuntimeCompatibilityTelemetryWorld();
const defaultGuardDistanceWorld = new RuntimeGuardDistanceWorld();
const stateClockWorld = new RuntimeStateClockWorld();
const stateEntryWorld = new RuntimeStateEntryWorld({ stateClockWorld });
const stateEntryRouteWorld = new RuntimeStateEntryRouteWorld();
const controllerDispatchWorld = new RuntimeControllerDispatchWorld();
const stateEntrySetupWorld = new RuntimeStateEntrySetupWorld();
const activeControllerRunWorld = new RuntimeActiveControllerRunWorld();
const rootCnsExecutionWorld = new RuntimeRootCnsExecutionWorld(activeControllerRunWorld);
const rootSelectionWorld = new RuntimeRootSelectionWorld();
const tagPartnerSelectionWorld = new RuntimeTagPartnerSelectionWorld();
const tagTeamOrderWorld = new RuntimeTagTeamOrderWorld();
const activeControllerHookSetWorld = new RuntimeActiveControllerHookSetWorld();
const activeControllerTelemetryWorld = new RuntimeActiveControllerTelemetryWorld();
const dispatchEvaluationWorld = new RuntimeDispatchEvaluationWorld();
const rootStandbyTransitionWorld = new RuntimeRootStandbyTransitionWorld();
const controllerEvaluationContextWorld = new RuntimeControllerEvaluationContextWorld();
const matchPreFacingAssertSpecialWorld = new RuntimeMatchPreFacingAssertSpecialWorld(controllerEvaluationContextWorld);
const autoGuardStartWorld = new RuntimeAutoGuardStartWorld();
const triggerGateWorld = new RuntimeTriggerGateWorld();
const triggerEvaluationWorld = new RuntimeTriggerEvaluationWorld();
const afterImageSampleWorld = new RuntimeAfterImageSampleWorld();
const frameWorld = new RuntimeFrameWorld();
const animationChangeWorld = new RuntimeAnimationWorld();
const fighterStateWorld = new RuntimeFighterStateWorld();
const characterIdentityWorld = new RuntimeCharacterIdentityWorld();
const spriteEffectControllerWorld = new RuntimeSpriteEffectControllerWorld();
const targetStateEntryWorld = new RuntimeTargetStateEntryWorld();
const actorConstraintControllerDispatchWorld = new RuntimeActorConstraintControllerDispatchWorld();
const targetControllerDispatchWorld = new RuntimeTargetControllerDispatchWorld();
const contactControllerDispatchWorld = new RuntimeContactControllerDispatchWorld();
const audioControllerDispatchWorld = new RuntimeAudioControllerDispatchWorld();
const envColorControllerDispatchWorld = new RuntimeEnvColorControllerDispatchWorld();
const pauseControllerDispatchWorld = new RuntimePauseControllerDispatchWorld();
const effectSpawnControllerDispatchWorld = new RuntimeEffectSpawnControllerDispatchWorld();
const reversalControllerDispatchWorld = new RuntimeReversalControllerDispatchWorld();
const hitDefControllerDispatchWorld = new RuntimeHitDefControllerDispatchWorld();
const expressionContextWorld = new RuntimeExpressionContextWorld();
const activeExpressionContextWorld = new RuntimeActiveExpressionContextWorld(expressionContextWorld);
const fighterAdvanceHookSetWorld = new RuntimeFighterAdvanceHookSetWorld();
const fighterAdvanceWorld = new RuntimeFighterAdvanceWorld();
const matchHelperBindingWorld = new RuntimeMatchHelperBindingWorld();
const matchActiveWorld = new RuntimeMatchActiveWorld();
const matchActorRosterWorld = new RuntimeMatchActorRosterWorld();
const runtimeTeamTopologyWorld = new RuntimeTeamTopologyWorld();
const matchFrameStartWorld = new RuntimeMatchFrameStartWorld();
const matchHitPauseWorld = new RuntimeMatchHitPauseWorld();
const matchInputControlWorld = new RuntimeMatchInputControlWorld();
const matchPausedBridgeWorld = new RuntimeMatchPausedBridgeWorld();
const matchStepWorld = new RuntimeMatchStepWorld();
const matchTickBranchWorld = new RuntimeMatchTickBranchWorld();
const matchTickInputWorld = new RuntimeMatchTickInputWorld();
const rootInputRoutingWorld = new RuntimeRootInputRoutingWorld();
const rootAdvancePhaseWorld = new RuntimeRootAdvancePhaseWorld();
const rootMotionAdvanceWorld = new RuntimeRootMotionAdvanceWorld();
const rootPresentationWorld = new RuntimeRootPresentationWorld();
const rootBodyPushWorld = new RuntimeRootBodyPushWorld();
const rootDirectHitAdmissionWorld = new RuntimeRootDirectHitAdmissionWorld();
const moveStartWorld = new RuntimeMoveStartWorld();
const matchFighterAdvanceWorld = new RuntimeMatchFighterAdvanceWorld();
const fighterRunOrderWorld = new RuntimeFighterRunOrderWorld();
const actorRunOrderWorld = new RuntimeActorRunOrderWorld();
const matchActorAdvanceWorld = new RuntimeMatchActorAdvanceWorld(actorRunOrderWorld);
const pausedActorAdvanceWorld = new RuntimePausedActorAdvanceWorld(actorRunOrderWorld);
const matchCombatStateHooksWorld = new RuntimeMatchCombatStateHooksWorld();
const matchHelperTargetStateWorld = new RuntimeMatchHelperTargetStateWorld();
const matchHelperProjectileTargetWorld = new RuntimeMatchHelperProjectileTargetWorld();
const matchEnvColorBridgeWorld = new RuntimeMatchEnvColorBridgeWorld();
const matchEnvShakeBridgeWorld = new RuntimeMatchEnvShakeBridgeWorld();
const matchPostFighterWorld = new RuntimeMatchPostFighterWorld();
const matchPresentationSnapshotWorld = new RuntimeMatchPresentationSnapshotWorld();
const matchRoundWorld = new RuntimeMatchRoundWorld();
const runtimeActiveControllerTelemetryHooks = activeControllerTelemetryWorld.create<FighterMatchState>({
  recordController: (actor, controller) => compatibilityTelemetryWorld.recordController(actor, controller),
  recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
});

export type MatchInput = {
  p1: Set<string>;
  p2?: Set<string>;
};

export type MatchRuntimeCommand =
  | { type: "set-playing"; playing: boolean }
  | { type: "set-speed"; speed: number }
  | { type: "toggle"; key: "showClsn1" | "showClsn2" | "showAxis" | "showGrid"; value: boolean }
  | { type: "set-root-standby"; changes: readonly RuntimeRootStandbyChange[] }
  | { type: "reset" };

export type MatchStepOptions = {
  force?: boolean;
};

export type PlayableMatchRuntimeOptions = {
  effectActorWorld?: RuntimeEffectActorWorld;
  effectActorStores?: RuntimeEffectActorStores;
  effectLifecycleWorld?: RuntimeEffectLifecycleWorld;
  effectSpawnWorld?: RuntimeEffectSpawnWorld;
  targetWorld?: RuntimeTargetWorld;
  roundTimerFrames?: number;
  runtimeProfile?: RuntimeCompatibilityProfile;
  superPauseTargetDefenseValue?: number;
  reserveFighters?: readonly DemoFighterDefinition[];
  teamMode?: "single" | "tag";
};

type PauseControllerHandler = (
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: PauseControllerOp,
  resolveSoundValue?: () => RuntimeResolvedSoundValue | undefined,
  resolveParams?: RuntimePauseControllerParamResolvers,
) => MatchPauseControllerResult | undefined;
type EnvColorControllerHandler = (
  controller: MugenStateController,
  operation?: EnvColorControllerOp,
  resolveEnvColor?: RuntimeEnvColorResolver,
) => void;
type TeamStandbyControllerHandler = (
  fighter: FighterMatchState,
  operation: TeamStandbyControllerOp,
  context: ReturnType<typeof runtimeControllerContext>,
) => TeamStandbyControllerOp | undefined;

type EnterStateOptions = RuntimeStateEntryOptions<FighterMatchState>;
type AnimationElementOptions = RuntimeStateEntryAnimationElementOptions;
type SuperPauseTargetDefenseOverride = {
  actor: FighterMatchState | RuntimeHelper;
  pauseStartedAt: number;
  multiplier: number;
};
type RuntimeMatchCharacterIdentity = RuntimeCharacterIdentityActor & {
  fighter?: FighterMatchState;
  helper?: RuntimeHelper;
};

export class PlayableMatchRuntime {
  private tick = 0;
  private frameClock = 0;
  private playing = true;
  private speed = 1;
  private readonly round: RuntimeRoundSystem;
  private readonly roundTimerFrames?: number;
  private readonly logs: string[] = [];
  private readonly p1: FighterMatchState;
  private readonly p2: FighterMatchState;
  private readonly reserveRoots: FighterMatchState[];
  private characterIdentity?: RuntimeCharacterIdentityRegistry<RuntimeMatchCharacterIdentity>;
  private readonly tagTeamOrder?: RuntimeTagTeamOrder;
  private readonly stage: MugenStageDefinition;
  private readonly effectActorWorld: RuntimeEffectActorWorld;
  private readonly effectLifecycleWorld: RuntimeEffectLifecycleWorld;
  private readonly effectSpawnWorld: RuntimeEffectSpawnWorld;
  private readonly targetWorld: RuntimeTargetWorld;
  private readonly audioWorld = new RuntimeAudioWorld();
  private readonly envShakeWorld = new RuntimeEnvShakeWorld();
  private readonly hitEffectWorld = new RuntimeHitEffectWorld();
  private readonly envColorWorld = new RuntimeEnvColorWorld();
  private readonly pauseWorld: RuntimePauseWorld;
  private readonly spriteEffectWorld = new RuntimeSpriteEffectWorld();
  private readonly actorConstraintWorld = new RuntimeActorConstraintWorld();
  private readonly contactWorld = new RuntimeContactMemoryWorld();
  private readonly directCombatWorld = new RuntimeDirectCombatWorld(this.contactWorld);
  private readonly hitOverrideWorld = new RuntimeHitOverrideWorld();
  private readonly reversalWorld = new RuntimeReversalWorld(this.contactWorld);
  private readonly recoveryWorld = new RuntimeRecoverySystem();
  private readonly hitEligibilityWorld = new RuntimeHitEligibilityWorld();
  private readonly assertSpecialWorld = new RuntimeAssertSpecialWorld();
  private readonly orientationWorld = new RuntimeOrientationWorld();
  private readonly guardWorld = new RuntimeGuardWorld();
  private readonly guardDistanceWorld = new RuntimeGuardDistanceWorld();
  private readonly getHitStateWorld = new RuntimeGetHitStateWorld();
  private readonly hitStateTransitionWorld = new RuntimeHitStateTransitionWorld();
  private readonly hitPauseWorld = new RuntimeHitPauseWorld();
  private readonly contactPresentationWorld = new RuntimeContactPresentationWorld();
  private readonly combatResolutionWorld = new RuntimeCombatResolutionWorld();
  private readonly matchPauseControllerWorld = new RuntimeMatchPauseControllerWorld();
  private readonly helperCombatWorld = new RuntimeHelperCombatWorld();
  private readonly moveLifecycleWorld = new RuntimeMoveLifecycleWorld();
  private readonly inputControlWorld = new RuntimeInputControlWorld();
  private readonly kinematicsWorld = new RuntimeKinematicsWorld();
  private readonly animationWorld = new RuntimeAnimationWorld();
  private readonly stunWorld = new RuntimeStunWorld();
  private readonly pausedMatchWorld = new RuntimePausedMatchWorld();
  private readonly snapshotWorld = new RuntimeSnapshotWorld();
  private lastTickSchedule = createIdleMatchTickSchedule();
  private lastRootBodyPush?: RuntimeRootBodyPushDiagnostic;
  private lastRootHitAdmission?: RuntimeRootDirectHitAdmissionDiagnostic;
  private readonly matchResetWorld = new RuntimeMatchResetWorld();
  private readonly runtimeProfile: RuntimeCompatibilityProfile;
  private lastP2Controlled = false;
  private readonly superPauseTargetDefenseValue?: number;
  private superPauseTargetDefenseOverrides: SuperPauseTargetDefenseOverride[] = [];
  private toggles = {
    showClsn1: true,
    showClsn2: true,
    showAxis: true,
    showGrid: true,
  };

  constructor(
    p1Definition = demoFighters[0]!,
    p2Definition = demoFighters[1]!,
    stage = trainingStage,
    options: PlayableMatchRuntimeOptions = {},
  ) {
    this.stage = stage;
    this.runtimeProfile = options.runtimeProfile ?? "unknown";
    this.superPauseTargetDefenseValue = defaultSuperPauseTargetDefenseValue(
      this.runtimeProfile,
      options.superPauseTargetDefenseValue,
    );
    this.pauseWorld = new RuntimePauseWorld(this.runtimeProfile);
    this.roundTimerFrames = options.roundTimerFrames;
    this.round = new RuntimeRoundSystem(options.roundTimerFrames);
    this.effectActorWorld = options.effectActorWorld ?? new RuntimeEffectActorWorld(options.effectActorStores);
    this.effectLifecycleWorld = options.effectLifecycleWorld ?? new RuntimeEffectLifecycleWorld();
    this.effectSpawnWorld = options.effectSpawnWorld ?? new RuntimeEffectSpawnWorld();
    this.targetWorld = options.targetWorld ?? new RuntimeTargetWorld();
    this.p1 = fighterStateWorld.create({
      id: "p1",
      ...(this.runtimeProfile === "ikemen-go" ? { playerNo: 1 } : {}),
      definition: p1Definition,
      x: stage.playerStart.p1.x,
      y: stage.playerStart.p1.y,
      facing: stage.playerStart.p1.facing,
      effectActorWorld: this.effectActorWorld,
      targetWorld: this.targetWorld,
      audioWorld: this.audioWorld,
      envShakeWorld: this.envShakeWorld,
      hitEffectWorld: this.hitEffectWorld,
      contactWorld: this.contactWorld,
    });
    this.p2 = fighterStateWorld.create({
      id: "p2",
      ...(this.runtimeProfile === "ikemen-go" ? { playerNo: 2 } : {}),
      definition: p2Definition,
      x: stage.playerStart.p2.x,
      y: stage.playerStart.p2.y,
      facing: stage.playerStart.p2.facing,
      effectActorWorld: this.effectActorWorld,
      targetWorld: this.targetWorld,
      audioWorld: this.audioWorld,
      envShakeWorld: this.envShakeWorld,
      hitEffectWorld: this.hitEffectWorld,
      contactWorld: this.contactWorld,
    });
    this.reserveRoots = this.runtimeProfile === "ikemen-go"
      ? options.reserveFighters?.slice(0, 6).map((definition, index) => {
          const playerNumber = index + 3;
          const start = playerNumber % 2 === 1 ? stage.playerStart.p1 : stage.playerStart.p2;
          const fighter = this.createFighterState(`p${playerNumber}`, definition, start, { playerNo: playerNumber });
          fighter.runtime.teamState = {
            disabled: false,
            standby: true,
            overKo: false,
            playerType: true,
          };
          return fighter;
        }) ?? []
      : [];
    for (const root of this.characterRoots()) this.effectActorWorld.registerOwner(root.id);
    if (this.runtimeProfile === "ikemen-go") {
      this.initializeCharacterIdentity();
      this.effectActorWorld.observeHelperLifecycle({
        onSpawn: (helper) => this.registerHelperCharacterIdentity(helper),
        onRemove: (helper) => this.unregisterHelperCharacterIdentity(helper),
      });
    }
    this.tagTeamOrder = tagTeamOrderWorld.create(
      [this.p1, this.p2, ...this.reserveRoots].map((root) => ({ id: root.id, playerType: root.runtime.teamState?.playerType ?? true })),
      this.runtimeProfile === "ikemen-go" ? options.teamMode ?? "single" : "single",
    );
    this.attachHelperHandlers();
    this.logs.unshift(`Playable demo match started on ${stage.displayName}`);
  }

  private attachHelperHandlers(): void {
    this.attachHelperTargetStateHandlers();
    this.attachHelperPauseHandlers();
  }

  private attachHelperTargetStateHandlers(): void {
    const roster = this.matchRoster();
    matchHelperBindingWorld.attach({
      owners: roster.actors,
      enterTargetState: (owner, helper, target, stateId) =>
        this.enterHelperOwnedTargetState(owner, helper, target, stateId),
      applyTeamStandby: (owner, helper, operation) =>
        this.applyHelperOwnedSelfTeamStandbyController(owner, helper, operation),
      telemetryRecorder: {
        recordController: (owner, controller, context) =>
          compatibilityTelemetryWorld.recordController(owner, controller, context),
        recordOperation: (owner, operation, context) =>
          compatibilityTelemetryWorld.recordOperation(owner, operation, context),
      },
    });
  }

  private attachHelperPauseHandlers(): void {
    for (const owner of this.matchRoster().actors) {
      owner.scaleHelperTargetDamage = scaleRuntimeIncomingDamage;
      owner.onHelperPauseController = (helper, controller, operation, resolveSoundValue, resolveParams) =>
        this.applyHelperMatchPauseController(
          owner,
          helper,
          controller,
          operation,
          resolveSoundValue,
          resolveParams,
        );
    }
  }

  private initializeCharacterIdentity(): void {
    const identityRoots = this.characterRoots().map(createRootCharacterIdentity);
    this.characterIdentity = characterIdentityWorld.create<RuntimeMatchCharacterIdentity>(identityRoots);
    for (const identityRoot of identityRoots) {
      identityRoot.fighter!.playerId = this.characterIdentity.playerIdFor(identityRoot.id);
    }
    for (const helper of [
      ...this.effectActorWorld.helpers(this.p1.id),
      ...this.effectActorWorld.helpers(this.p2.id),
    ]) {
      this.registerHelperCharacterIdentity(helper);
    }
  }

  private registerHelperCharacterIdentity(helper: RuntimeHelper): void {
    const registry = this.characterIdentity;
    if (!registry) return;
    const root = this.characterRoots().find((candidate) => candidate.id === helper.rootId);
    if (root?.playerNo === undefined || root.playerId === undefined) {
      throw new Error(`Missing IKEMEN root identity for Helper ${helper.serialId}`);
    }
    const parentPlayerId = registry.playerIdFor(helper.parentId);
    if (parentPlayerId === undefined) {
      throw new Error(`Missing IKEMEN parent identity ${helper.parentId} for Helper ${helper.serialId}`);
    }
    helper.destroyed = false;
    helper.playerNo = root.playerNo;
    helper.parentPlayerId = parentPlayerId;
    helper.parentPlayerNo = root.playerNo;
    helper.rootPlayerId = root.playerId;
    helper.rootPlayerNo = root.playerNo;
    const identity = createHelperCharacterIdentity(helper);
    helper.playerId = registry.register(identity);
  }

  private unregisterHelperCharacterIdentity(helper: RuntimeHelper): void {
    helper.destroyed = true;
    this.characterIdentity?.unregister(helper.serialId);
  }

  private characterRoots(): FighterMatchState[] {
    return [this.p1, this.p2, ...this.reserveRoots];
  }

  private rootForHelper(helper: RuntimeHelper): FighterMatchState {
    return this.characterRoots().find((candidate) => candidate.id === helper.rootId) ?? this.p1;
  }

  private enterHelperOwnedTargetState(
    owner: FighterMatchState,
    helper: RuntimeHelper,
    targetActor: RuntimeTargetWorldActor,
    stateId: number,
  ): void {
    const roster = this.matchRoster();
    matchHelperTargetStateWorld.enter({
      owner,
      helper,
      targetActor,
      stateId,
      actors: roster.actors,
      canEnterState: (target, targetStateId, stateOwner) => canEnterState(target, targetStateId, stateOwner),
      enterState: (target, targetStateId, options) => enterState(target, targetStateId, undefined, options),
    });
  }

  private matchRoster(): RuntimeMatchActorRoster<FighterMatchState> {
    return matchActorRosterWorld.create({ p1: this.p1, p2: this.p2 });
  }

  dispatch(command: MatchRuntimeCommand): MugenSnapshot {
    if (command.type === "set-playing") {
      this.playing = command.playing;
    } else if (command.type === "set-speed") {
      this.speed = Math.max(0.5, Math.min(4, command.speed));
    } else if (command.type === "toggle") {
      this.toggles = { ...this.toggles, [command.key]: command.value };
    } else if (command.type === "set-root-standby") {
      if (this.runtimeProfile !== "ikemen-go") {
        throw new Error("Root standby transitions require the ikemen-go runtime profile");
      }
      rootStandbyTransitionWorld.apply([this.p1, this.p2, ...this.reserveRoots], command.changes);
    } else if (command.type === "reset") {
      this.reset();
    }
    return this.getSnapshot();
  }

  step(input: MatchInput, options: MatchStepOptions = {}): MugenSnapshot {
    const result = matchStepWorld.step({
      playing: this.playing,
      frameClock: this.frameClock,
      speed: this.speed,
      force: options.force,
      isRoundOver: () => this.round.isOver,
      advanceOneTick: () => this.advanceOneTick(input),
      snapshot: () => this.getSnapshot(),
    });
    this.frameClock = result.frameClock;
    return result.snapshot;
  }

  private actorRunOrderCandidates(): RuntimeActorRunOrderCandidate<FighterMatchState, RuntimeHelper>[] {
    return [
      this.rootRunOrderCandidate(this.p1, 1),
      this.rootRunOrderCandidate(this.p2, 2),
      ...this.reserveRoots.map((root, index) => this.rootRunOrderCandidate(root, index + 3)),
      ...this.helperRunOrderCandidates(),
    ];
  }

  private rootRunOrderCandidate(
    fighter: FighterMatchState,
    runOrderId: number,
  ): RuntimeActorRunOrderCandidate<FighterMatchState, RuntimeHelper> {
    return {
      kind: "root",
      key: `root:${fighter.id}`,
      runOrderId,
      moveType: fighter.runtime.moveType,
      assertSpecial: fighter.runtime.assertSpecial,
      value: fighter,
      stamp: (runOrder) => {
        fighter.runtime.runOrder = runOrder;
      },
    };
  }

  private helperRunOrderCandidates(): RuntimeActorRunOrderCandidate<FighterMatchState, RuntimeHelper>[] {
    return [this.p1, this.p2].flatMap((owner) =>
      this.effectActorWorld.helpers(owner.id).map((helper) => ({
        kind: "helper" as const,
        key: `helper:${helper.serialId}`,
        runOrderId: helper.runOrderId,
        moveType: helper.moveType,
        assertSpecial: helper.assertSpecial,
        value: helper,
        stamp: (runOrder: number | undefined) => {
          helper.runOrder = runOrder;
        },
      })),
    );
  }

  private advanceOneTick(input: MatchInput): void {
    this.tick += 1;
    this.lastRootBodyPush = undefined;
    this.lastRootHitAdmission = undefined;
    const schedule = new RuntimeMatchTickScheduleRecorder(this.tick);
    const p1Input = input.p1;
    const p2Input = input.p2 ?? new Set<string>();
    const rootInputRoutes = rootInputRoutingWorld.routes({
      runtimeProfile: this.runtimeProfile,
      teamMode: this.tagTeamOrder ? "tag" : "single",
      roots: this.characterRoots(),
      p1Input,
      p2Input,
    });
    this.lastP2Controlled = input.p2 !== undefined;
    const preparedRunOrder = fighterRunOrderWorld.stamp(fighterRunOrderWorld.orderPair(this.runtimeProfile, this.p1, this.p2));
    const preparedActorRunOrder = actorRunOrderWorld.order(this.runtimeProfile, this.actorRunOrderCandidates());
    schedule.record("tick:stamp-input");
    matchTickInputWorld.stampFrame({ tick: this.tick, p1: this.p1, p2: this.p2, p1Input, p2Input });

    schedule.record("frame:start");
    matchFrameStartWorld.advance({
      p1: this.p1,
      p2: this.p2,
      resetFrameFlags: (fighter) => this.hitEligibilityWorld.resetFrameFlags(fighter.runtime),
      applyPreFacingAssertSpecial: (fighter, opponent) => this.applyPreFacingAssertSpecial(fighter, opponent),
      updateAutoFacing: (fighter, opponent) => this.orientationWorld.updateAutoFacing(fighter.runtime, opponent.runtime),
    });

    const branchResult = matchTickBranchWorld.advance({
      advanceHitPause: () => {
        schedule.record("branch:hitpause-advance");
        const gameSpace = runtimeStageGameSpace(this.stage);
        const result = matchHitPauseWorld.advanceRuntime<FighterMatchState>({
          hitPauseWorld: this.hitPauseWorld,
          p1: this.p1,
          p2: this.p2,
          p1Input,
          p2Input,
          tick: this.tick,
          stage: this.stage,
          gameSpace,
          stageTime: this.tick,
          runtimeTick: this.tick,
          effectLifecycleWorld: this.effectLifecycleWorld,
          runIgnoredControllers: (fighter, opponent) =>
            runHitPauseIgnoredControllers(
              fighter,
              opponent,
              this.actorConstraintWorld,
              this.spriteEffectWorld,
              this.reversalWorld,
              this.effectSpawnWorld,
              this.stage.bounds,
              gameSpace,
              this.tick,
              this.runtimeProfile,
              (target, controller, operation, resolveSoundValue, resolveParams) =>
                this.applyMatchPauseController(target, controller, operation, resolveSoundValue, resolveParams),
              (controller, operation, resolveEnvColor) => this.recordEnvColorEvent(controller, this.tick, operation, resolveEnvColor),
              (actor, operation, context) => this.applyTeamStandbyController(actor, operation, context),
            ),
        });
        return { paused: result.paused, result };
      },
      isMatchPaused: () => {
        schedule.record("branch:pause-check");
        return this.pauseWorld.current() !== undefined;
      },
      advancePaused: () => {
        schedule.record("pause:advance");
        return this.advancePausedMatch(
          input,
          p1Input,
          p2Input,
          preparedActorRunOrder,
          (phase, actorId) => schedule.record(phase, actorId),
        );
      },
      advanceActive: () =>
        this.advanceActiveMatch(
          input,
          p1Input,
          p2Input,
          preparedRunOrder,
          preparedActorRunOrder,
          rootInputRoutes,
          (phase, actorId) => schedule.record(phase, actorId),
        ),
    });
    if (branchResult.branch !== "active") {
      schedule.record("tick:guard-distance-latch", this.p1.id);
      refreshRuntimeInGuardDist(this.p1, this.p2, this.guardDistanceWorld, this.tick);
      schedule.record("tick:guard-distance-latch", this.p2.id);
      refreshRuntimeInGuardDist(this.p2, this.p1, this.guardDistanceWorld, this.tick);
    }
    schedule.record("tick:restore-superpause-defense");
    this.restoreExpiredSuperPauseTargetDefense();
    this.lastTickSchedule = schedule.complete(branchResult.branch);
  }

  private advanceActiveMatch(
    input: MatchInput,
    p1Input: Set<string>,
    p2Input: Set<string>,
    preparedRunOrder: RuntimeRootRunOrderResult<FighterMatchState>,
    preparedActorRunOrder: RuntimeActorRunOrderResult<FighterMatchState, RuntimeHelper>,
    rootInputRoutes: RuntimeRootInputRoute<FighterMatchState>[],
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
  ): void {
    const gameSpace = runtimeStageGameSpace(this.stage);
    const rootAdvancePhases = rootAdvancePhaseWorld.snapshot({
      runtimeProfile: this.runtimeProfile,
      teamMode: this.tagTeamOrder ? "tag" : "single",
      roots: this.characterRoots(),
      playableRoots: [this.p1, this.p2],
    });
    matchActiveWorld.advance({
      tickRoundTimer: () => {
        recordPhase("active:round-timer");
        return matchRoundWorld.tickTimer(this.round, this.matchRoster().actors);
      },
      pushNormalCommandBuffers: () => {
        recordPhase("active:command-buffer");
        const reserveRoutes = rootInputRoutes.filter(({ actor }) => actor !== this.p1 && actor !== this.p2);
        matchTickInputWorld.stampMappedActors({ tick: this.tick, routes: reserveRoutes });
        return matchTickInputWorld.pushMappedNormalCommandBuffers({ tick: this.tick, routes: rootInputRoutes });
      },
      applyInputControl: () => {
        recordPhase("active:input-control");
        return matchInputControlWorld.apply({
          p1: this.p1,
          p2: this.p2,
          p1Input,
          p2Input,
          p2Controlled: input.p2 !== undefined,
          handlePlayerInput: (fighter, fighterInput, opponent) =>
            handlePlayerInput(fighter, fighterInput, opponent, this.stage.bounds, gameSpace, this.tick, this.inputControlWorld),
          handleAi: (fighter, opponent) => handleSimpleAi(fighter, opponent, this.tick, this.inputControlWorld),
        });
      },
      advanceFighters: () => {
        recordPhase("active:fighter-advance");
        if (this.runtimeProfile === "ikemen-go") {
          return matchActorAdvanceWorld.advance({
            runOrder: preparedActorRunOrder,
            opponentOf: (fighter) => this.opponentForRoot(fighter),
            participationOf: (fighter) => rootAdvancePhases.phaseOf(fighter),
            advanceRoot: (fighter, opponent, participation) => {
              if (participation === "bounded-standby") {
                this.advanceStandbyRootCns(fighter, opponent, gameSpace, recordPhase);
                return;
              }
              if (participation === "active-motion") {
                this.advanceActiveRootMotion(fighter, opponent, gameSpace, recordPhase);
                return;
              }
              advanceFighter(
                fighter,
                opponent,
                this.actorConstraintWorld,
                this.spriteEffectWorld,
                this.hitOverrideWorld,
                this.reversalWorld,
                this.effectSpawnWorld,
                this.recoveryWorld,
                this.hitEligibilityWorld,
                this.moveLifecycleWorld,
                this.kinematicsWorld,
                this.animationWorld,
                this.stunWorld,
                this.stage.bounds,
                gameSpace,
                this.tick,
                this.runtimeProfile,
                (pauseActor, controller, operation, resolveSoundValue, resolveParams) =>
                  this.applyMatchPauseController(pauseActor, controller, operation, resolveSoundValue, resolveParams),
                (controller, operation, resolveEnvColor) =>
                  this.recordEnvColorEvent(controller, this.tick, operation, resolveEnvColor),
                recordPhase,
                (actor, operation, context) => this.applyTeamStandbyController(actor, operation, context),
              );
            },
            advanceHelper: (helper) => {
              recordPhase("helper:controllers", helper.serialId);
              const owner = this.rootForHelper(helper);
              const opponent = this.opponentForRoot(owner);
              this.effectLifecycleWorld.advanceHelper(owner, helper, this.stage, opponent, {
                gameSpace,
                stageTime: this.tick,
                runtimeTick: this.tick,
                opponents: [opponent],
              });
            },
            discoverHelpers: () => this.helperRunOrderCandidates(),
            applyAutoGuardStart: (defender, attacker, checkpoint) => {
              recordPhase(`fighter:auto-guard-check:${checkpoint}`, defender.id);
              applyAutoGuardStart(defender, attacker, this.guardWorld);
            },
          });
        }
        return matchFighterAdvanceWorld.advancePair({
          p1: this.p1,
          p2: this.p2,
          runtimeProfile: this.runtimeProfile,
          preparedRunOrder,
          advanceFighter: (fighter, opponent) =>
            advanceFighter(
              fighter,
              opponent,
              this.actorConstraintWorld,
              this.spriteEffectWorld,
              this.hitOverrideWorld,
              this.reversalWorld,
              this.effectSpawnWorld,
              this.recoveryWorld,
              this.hitEligibilityWorld,
              this.moveLifecycleWorld,
              this.kinematicsWorld,
              this.animationWorld,
              this.stunWorld,
              this.stage.bounds,
              gameSpace,
              this.tick,
              this.runtimeProfile,
              (pauseActor, controller, operation, resolveSoundValue, resolveParams) =>
                this.applyMatchPauseController(pauseActor, controller, operation, resolveSoundValue, resolveParams),
              (controller, operation, resolveEnvColor) => this.recordEnvColorEvent(controller, this.tick, operation, resolveEnvColor),
              recordPhase,
              (actor, operation, context) => this.applyTeamStandbyController(actor, operation, context),
            ),
          applyAutoGuardStart: (defender, attacker, checkpoint) => {
            recordPhase(`fighter:auto-guard-check:${checkpoint}`, defender.id);
            applyAutoGuardStart(defender, attacker, this.guardWorld);
          },
        });
      },
      advancePostFighter: () => {
        recordPhase("active:post-fighter");
        return matchPostFighterWorld.advanceRuntime({
          p1: this.p1,
          p2: this.p2,
          targetActors: this.tagTeamOrder
            ? selectRuntimeRootTargetMaintenanceActors(this.characterRoots())
            : undefined,
          targetResetActors: this.tagTeamOrder ? this.characterRoots() : undefined,
          hitDefContactActors: this.tagTeamOrder ? this.characterRoots() : undefined,
          stage: this.stage,
          stageTime: this.tick,
          helpersAdvancedInActorOrder: this.runtimeProfile === "ikemen-go",
          actorConstraintWorld: this.actorConstraintWorld,
          effectLifecycleWorld: this.effectLifecycleWorld,
          combatResolutionWorld: this.combatResolutionWorld,
          helperCombatWorld: this.helperCombatWorld,
          directCombatWorld: this.directCombatWorld,
          hitOverrideWorld: this.hitOverrideWorld,
          reversalWorld: this.reversalWorld,
          guardWorld: this.guardWorld,
          getHitStateWorld: this.getHitStateWorld,
          hitStateTransitionWorld: this.hitStateTransitionWorld,
          contactPresentationWorld: this.contactPresentationWorld,
          targetWorld: this.targetWorld,
          runtimeTick: this.tick,
          stageBounds: this.stage.bounds,
          gameSpace,
          getHurtBoxes: getRuntimeHurtBoxes,
          combatStateHooks: runtimeCombatStateHooks,
          helperStateHooks: runtimeHelperCombatStateHooks,
          recordAudioOperation: (actor, audioOperation: AudioControllerOp) =>
            compatibilityTelemetryWorld.recordOperation(actor, audioOperation),
          defaultHurtBoxes: defaultRuntimeHurtBoxes,
          canActorBeHit: (actorId) => this.pauseWorld.canActorBeHit(actorId),
          rememberProjectileTarget: (source, target, projectile) =>
            matchHelperProjectileTargetWorld.remember({
              owner: source,
              defender: target,
              projectile,
              targetWorld: this.targetWorld,
            }),
          refreshGuardDistance: (defender, attacker) => {
            recordPhase("tick:guard-distance-latch", defender.id);
            refreshRuntimeInGuardDist(defender, attacker, this.guardDistanceWorld, this.tick);
          },
          advanceBodyPush: this.tagTeamOrder ? () => {
            const roots = this.characterRoots();
            this.lastRootBodyPush = rootBodyPushWorld.advance({
              tagMode: true,
              roots: roots.map((root) => ({
                id: root.id,
                side: runtimeTeamSide(root) ?? null,
                teamState: root.runtime.teamState!,
                runtime: root.runtime,
                localCoord: root.definition.localCoord,
              })),
              playableRoots: [
                { id: this.p1.id, side: 1, teamState: this.p1.runtime.teamState!, runtime: this.p1.runtime, localCoord: this.p1.definition.localCoord },
                { id: this.p2.id, side: 2, teamState: this.p2.runtime.teamState!, runtime: this.p2.runtime, localCoord: this.p2.definition.localCoord },
              ],
              stage: this.stage,
              actorConstraintWorld: this.actorConstraintWorld,
            });
            for (const id of this.lastRootBodyPush.rootIds) recordPhase("post-fighter:body-push", id);
          } : undefined,
          inspectHitAdmission: this.tagTeamOrder ? () => {
            const roots = this.characterRoots();
            this.lastRootHitAdmission = rootDirectHitAdmissionWorld.inspect({
              roots: roots.map((root) => ({
                id: root.id,
                playerNo: root.playerNo,
                side: runtimeTeamSide(root) ?? null,
                teamState: root.runtime.teamState!,
                runtime: root.runtime,
                currentMove: root.currentMove,
                moveTick: root.moveTick,
                hasHit: root.hasHit,
                hitDefTargets: root.hitDefTargets,
                pendingHitDefTargets: root.pendingHitDefTargets,
              })),
              getHurtBoxes: (candidate) => {
                const root = roots.find(({ id }) => id === candidate.id);
                return root ? getRuntimeHurtBoxes(root) : undefined;
              },
            });
            for (const id of this.lastRootHitAdmission.rootIds) recordPhase("post-fighter:hit-admission", id);
          } : undefined,
          resolveRootDirectCombat: this.tagTeamOrder ? (resolveDirectCombat) => {
            const rootsById = new Map(this.characterRoots().map((root) => [root.id, root]));
            for (const pairId of this.lastRootHitAdmission?.admittedPairIds ?? []) {
              const [attackerId, getterId] = pairId.split("->");
              const attacker = rootsById.get(attackerId);
              const getter = rootsById.get(getterId);
              if (!attacker || !getter) throw new Error(`Root hit admission referenced unknown pair ${pairId}`);
              resolveDirectCombat(attacker, getter);
            }
          } : undefined,
          resolveRootReversalClashes: this.tagTeamOrder ? (resolveReversalClash) => {
            const rootsById = new Map(this.characterRoots().map((root) => [root.id, root]));
            for (const pairId of this.lastRootHitAdmission?.admittedReversalClashPairIds ?? []) {
              const [reverserId, getterId] = pairId.split("->");
              const reverser = rootsById.get(reverserId);
              const getter = rootsById.get(getterId);
              if (!reverser || !getter) throw new Error(`Root reversal admission referenced unknown pair ${pairId}`);
              resolveReversalClash(reverser, getter);
            }
          } : undefined,
          resolveRootPriorityClashes: this.tagTeamOrder ? (resolvePriorityClash) => {
            const rootsById = new Map(this.characterRoots().map((root) => [root.id, root]));
            const ordered = (this.lastRootHitAdmission?.attackerIds ?? []).map((id) => {
              const root = rootsById.get(id);
              if (!root) throw new Error(`Root hit admission referenced unknown priority actor ${id}`);
              return root;
            });
            for (let leftIndex = 0; leftIndex < ordered.length; leftIndex += 1) {
              const left = ordered[leftIndex]!;
              for (let rightIndex = leftIndex + 1; rightIndex < ordered.length; rightIndex += 1) {
                const right = ordered[rightIndex]!;
                if (runtimeTeamSide(left) === runtimeTeamSide(right)) continue;
                const message = resolvePriorityClash(left, right);
                if (message) this.logs.unshift(message);
              }
            }
          } : undefined,
          resolveRootPriorityOutcomes: (resolveEqualPriorityOutcomes) => {
            resolveEqualPriorityOutcomes(this.tagTeamOrder ? this.characterRoots() : [this.p1, this.p2]);
          },
          recordTargetMaintenance: this.tagTeamOrder
            ? (root) => recordPhase("post-fighter:target-maintenance", root.id)
            : undefined,
          commitHitDefTargets: (root) => commitRuntimeHitDefTargets(root),
          recordHitDefContactCommit: this.tagTeamOrder
            ? (root) => recordPhase("post-fighter:hitdef-contact-commit", root.id)
            : undefined,
          log: (line) => this.logs.unshift(line),
          recordSchedulePhase: recordPhase,
        });
      },
      finishRoundIfNeeded: () => {
        recordPhase("active:round-finish");
        return matchRoundWorld.finishIfNeeded({
          round: this.round,
          p1: this.p1,
          p2: this.p2,
          stopPlaying: () => {
            this.playing = false;
          },
          log: (message) => this.logs.unshift(message),
          emitKoSound: (actor) => this.audioWorld.emitKoSound(actor, this.tick),
        });
      },
    });
  }

  private advancePausedMatch(
    input: MatchInput,
    p1Input: Set<string>,
    p2Input: Set<string>,
    preparedActorRunOrder: RuntimeActorRunOrderResult<FighterMatchState, RuntimeHelper>,
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
  ): void {
    const gameSpace = runtimeStageGameSpace(this.stage);
    if (this.runtimeProfile === "ikemen-go") {
      this.advanceIkemenPausedMatch(input, p1Input, p2Input, preparedActorRunOrder, gameSpace, recordPhase);
      return;
    }
    matchPausedBridgeWorld.advanceRuntime({
      pausedMatchWorld: this.pausedMatchWorld,
      pauseWorld: this.pauseWorld,
      p1: this.p1,
      p2: this.p2,
      p1Input,
      p2Input,
      p2Controlled: input.p2 !== undefined,
      stage: this.stage,
      gameSpace,
      tick: this.tick,
      actorConstraintWorld: this.actorConstraintWorld,
      effectLifecycleWorld: this.effectLifecycleWorld,
      handlePlayerInput: (actor, actorInput, opponent) =>
        handlePlayerInput(actor, actorInput, opponent, this.stage.bounds, gameSpace, this.tick, this.inputControlWorld),
      handleAi: (actor, opponent) => handleSimpleAi(actor, opponent, this.tick, this.inputControlWorld),
      advanceFighter: (actor, opponent) =>
        advanceFighter(
          actor,
          opponent,
          this.actorConstraintWorld,
          this.spriteEffectWorld,
          this.hitOverrideWorld,
          this.reversalWorld,
          this.effectSpawnWorld,
          this.recoveryWorld,
          this.hitEligibilityWorld,
          this.moveLifecycleWorld,
          this.kinematicsWorld,
          this.animationWorld,
          this.stunWorld,
          this.stage.bounds,
          gameSpace,
          this.tick,
          this.runtimeProfile,
          (fighter, controller, operation, resolveSoundValue, resolveParams) =>
            this.applyMatchPauseController(fighter, controller, operation, resolveSoundValue, resolveParams),
          (controller, operation, resolveEnvColor) => this.recordEnvColorEvent(controller, this.tick, operation, resolveEnvColor),
          recordPhase,
        ),
    });
  }

  private advanceIkemenPausedMatch(
    input: MatchInput,
    p1Input: Set<string>,
    p2Input: Set<string>,
    preparedActorRunOrder: RuntimeActorRunOrderResult<FighterMatchState, RuntimeHelper>,
    gameSpace: ExpressionGameSpace,
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
  ): void {
    const pause = this.pauseWorld.current();
    if (!pause) return;

    this.p1.commandBuffer.push(this.tick, p1Input, { hitPause: true });
    this.p2.commandBuffer.push(this.tick, p2Input, { hitPause: true });

    this.pauseWorld.beginDeferredActivation();
    try {
      pausedActorAdvanceWorld.advance({
        pause,
        runOrder: preparedActorRunOrder,
        canAdvanceRoot: (fighter) => this.reserveRoots.includes(fighter) || this.pauseWorld.canActorMove(fighter.id),
        advanceRoot: (fighter) => {
          const opponent = this.opponentForRoot(fighter);
          if (this.reserveRoots.includes(fighter)) {
            this.advanceStandbyRootCns(fighter, opponent, gameSpace, recordPhase, {
              onlyIgnoreHitPause: !this.pauseWorld.canActorMove(fighter.id),
            });
            return;
          }
          const fighterInput = fighter === this.p1 ? p1Input : p2Input;
          if (fighter === this.p1 || input.p2 !== undefined) {
            handlePlayerInput(
              fighter,
              fighterInput,
              opponent,
              this.stage.bounds,
              gameSpace,
              this.tick,
              this.inputControlWorld,
            );
          } else {
            handleSimpleAi(fighter, opponent, this.tick, this.inputControlWorld);
          }
          advanceFighter(
            fighter,
            opponent,
            this.actorConstraintWorld,
            this.spriteEffectWorld,
            this.hitOverrideWorld,
            this.reversalWorld,
            this.effectSpawnWorld,
            this.recoveryWorld,
            this.hitEligibilityWorld,
            this.moveLifecycleWorld,
            this.kinematicsWorld,
            this.animationWorld,
            this.stunWorld,
            this.stage.bounds,
            gameSpace,
            this.tick,
            this.runtimeProfile,
            (pauseActor, controller, operation, resolveSoundValue, resolveParams) =>
              this.applyMatchPauseController(pauseActor, controller, operation, resolveSoundValue, resolveParams),
            (controller, operation, resolveEnvColor) =>
              this.recordEnvColorEvent(controller, this.tick, operation, resolveEnvColor),
            recordPhase,
            (actor, operation, context) => this.applyTeamStandbyController(actor, operation, context),
          );
          fighter.targetWorld.advance(fighter);
          this.effectLifecycleWorld.advanceActive(fighter, this.stage, opponent, {
            gameSpace,
            stageTime: this.tick,
            runtimeTick: this.tick,
            opponents: [opponent],
            skipHelpers: true,
          });
          fighter.targetWorld.applyTargetBindings(fighter, [opponent]);
          fighter.targetWorld.applyBindToTarget(fighter, [opponent]);
          this.actorConstraintWorld.clampToStage(fighter.runtime, this.stage, fighter.definition.localCoord);
        },
        consumeRootMoveTime: (fighter) => this.pauseWorld.consumeActorMoveTime(fighter.id),
        canAdvanceHelper: (helper, pauseType) => canAdvanceRuntimeHelper(helper, pauseType),
        advanceHelper: (helper, pauseType) => {
          recordPhase("helper:controllers", helper.serialId);
          const owner = this.rootForHelper(helper);
          const opponent = this.opponentForRoot(owner);
          this.effectLifecycleWorld.advanceHelper(owner, helper, this.stage, opponent, {
            pauseKind: pauseType,
            gameSpace,
            stageTime: this.tick,
            runtimeTick: this.tick,
            opponents: [opponent],
          });
        },
        discoverHelpers: () => this.helperRunOrderCandidates(),
        currentPause: () => this.pauseWorld.current(),
        finalizePresentation: () => {
          for (const [fighter, opponent] of [
            [this.p1, this.p2],
            [this.p2, this.p1],
          ] as const) {
            this.effectLifecycleWorld.advancePausedPresentation(fighter, pause.type, this.stage, opponent, {
              gameSpace,
              stageTime: this.tick,
              runtimeTick: this.tick,
              opponents: [opponent],
              skipHelpers: true,
            });
          }
        },
        tickPause: () => this.pauseWorld.tick(),
      });
    } catch (error) {
      this.pauseWorld.cancelDeferredActivation();
      throw error;
    }
    this.pauseWorld.commitDeferredActivation();
  }

  private advanceStandbyRootCns(
    fighter: FighterMatchState,
    opponent: FighterMatchState,
    gameSpace: ExpressionGameSpace,
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
    options: { onlyIgnoreHitPause?: boolean } = {},
  ): void {
    if (fighter.runtime.teamState?.disabled || fighter.runtime.teamState?.playerType === false) return;
    if (!options.onlyIgnoreHitPause) {
      stateClockWorld.advance(fighter);
    }
    recordPhase("fighter:controllers", fighter.id);
    runActiveStateControllers(
      fighter,
      opponent,
      this.actorConstraintWorld,
      this.spriteEffectWorld,
      this.reversalWorld,
      this.effectSpawnWorld,
      this.stage.bounds,
      gameSpace,
      this.tick,
      undefined,
      undefined,
      {
        participation: "standby",
        runtimeProfile: this.runtimeProfile,
        onlyIgnoreHitPause: options.onlyIgnoreHitPause,
        onBlocked: (controller, route) =>
          this.logs.unshift(`Blocked standby CNS controller ${controller.type} for ${fighter.id} (${route})`),
        onTeamStandby: (actor, operation, context) => this.applyTeamStandbyController(actor, operation, context),
      },
    );
  }

  private advanceActiveRootMotion(
    fighter: FighterMatchState,
    opponent: FighterMatchState,
    gameSpace: ExpressionGameSpace,
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
  ): void {
    this.actorConstraintWorld.resetFrameConstraints(fighter.runtime);
    const tickStartPos = {
      ...fighter.runtime.pos,
      z: fighter.runtime.combatDepth?.position ?? 0,
    };
    rootMotionAdvanceWorld.advance({
      actor: fighter,
      hooks: {
        advanceStateClock: (actor) => stateClockWorld.advance(actor),
        runMotionControllers: (actor) => {
          recordPhase("fighter:controllers", actor.id);
          runActiveStateControllers(
            actor,
            opponent,
            this.actorConstraintWorld,
            this.spriteEffectWorld,
            this.reversalWorld,
            this.effectSpawnWorld,
            this.stage.bounds,
            gameSpace,
            this.tick,
            undefined,
            undefined,
            {
              participation: "active-motion",
              runtimeProfile: this.runtimeProfile,
              onBlocked: (controller, route) =>
                this.logs.unshift(`Blocked active-motion CNS controller ${controller.type} for ${actor.id} (${route})`),
              onTeamStandby: (caller, operation, context) => this.applyTeamStandbyController(caller, operation, context),
            },
          );
        },
        advanceKinematics: (actor) => {
          recordPhase("fighter:kinematics", actor.id);
          this.kinematicsWorld.advance(actor, {
            preserveImportedStateMoveType: shouldPreserveImportedStateMoveType(actor),
            changeIdleAction: () => changeAction(actor, actor.definition.idleAction),
            groundFriction:
              actor.definition.source === "imported"
                ? runtimeGroundFrictionOptions(actor.definition.constants, actor.definition.localCoord)
                : undefined,
          });
        },
        advanceAnimation: (actor) => {
          recordPhase("fighter:animation", actor.id);
          this.animationWorld.advance(actor);
        },
        applyConstraints: (actor) => {
          recordPhase("fighter:constraints", actor.id);
          this.actorConstraintWorld.preserveFrozenPosition(actor.runtime, tickStartPos);
          this.actorConstraintWorld.clampToStage(actor.runtime, this.stage, actor.definition.localCoord);
        },
      },
    });
  }

  private applyTeamStandbyController(
    caller: FighterMatchState,
    sourceOperation: TeamStandbyControllerOp,
    context: ReturnType<typeof runtimeControllerContext>,
  ): TeamStandbyControllerOp | undefined {
    if (this.runtimeProfile !== "ikemen-go") {
      this.logs.unshift(`Blocked ${sourceOperation.controllerType} for ${caller.id} outside ikemen-go profile`);
      return undefined;
    }
    let fighter = caller;
    let operation = sourceOperation;
    let redirectedIdentity: RuntimeMatchCharacterIdentity | undefined;
    if (operation.redirectPlayerIdExpression !== undefined) {
      const resolvedRedirect = evaluateRuntimeControllerNumber(
        operation.redirectPlayerIdExpression,
        caller.runtime,
        context,
      );
      const redirectPlayerId = resolvedRedirect === undefined ? undefined : Math.trunc(resolvedRedirect);
      redirectedIdentity = redirectPlayerId === undefined
        ? undefined
        : this.characterIdentity?.findByPlayerId(redirectPlayerId);
      if (!redirectedIdentity) {
        this.logs.unshift(`Blocked ${operation.controllerType} RedirectID ${redirectPlayerId ?? "invalid"} for ${caller.id}`);
        return undefined;
      }
      const { redirectPlayerIdExpression: _redirectPlayerIdExpression, ...staticOperation } = operation;
      operation = { ...staticOperation, redirectPlayerId };
    }
    if (redirectedIdentity?.helper) {
      return this.applyHelperLocalTeamStandbyController(caller, redirectedIdentity.helper, operation, context);
    }
    if (redirectedIdentity?.fighter) {
      fighter = redirectedIdentity.fighter;
    }
    const resolvedOperation = resolveDynamicTeamStandbyOperation(operation, caller, context);
    if (!resolvedOperation) return undefined;
    operation = resolvedOperation;
    const roots = [this.p1, this.p2, ...this.reserveRoots];
    const rootById = new Map(roots.map((root) => [root.id, root]));
    const rootByPlayerNo = new Map(
      roots.flatMap((root) => root.playerNo === undefined ? [] : [[root.playerNo, root] as const]),
    );
    const targetSide = runtimeTeamSide(fighter);
    const leader = operation.leaderPlayerNo === undefined ? undefined : rootByPlayerNo.get(operation.leaderPlayerNo);
    if (
      operation.memberPosition !== undefined &&
      (!this.tagTeamOrder || targetSide === undefined || !this.tagTeamOrder.canSwapMember(targetSide, fighter.id, operation.memberPosition))
    ) {
      this.logs.unshift(`Blocked ${operation.controllerType} member position ${operation.memberPosition} for ${fighter.id}`);
      return undefined;
    }
    if (
      operation.leaderPlayerNo !== undefined &&
      (!this.tagTeamOrder ||
        targetSide === undefined ||
        !leader ||
        runtimeTeamSide(leader) !== targetSide ||
        !this.tagTeamOrder.canRotateLeader(targetSide, leader.id))
    ) {
      this.logs.unshift(`Blocked ${operation.controllerType} leader ${operation.leaderPlayerNo} for ${fighter.id}`);
      return undefined;
    }
    if (operation.callerStateNo !== undefined && !canEnterState(fighter, operation.callerStateNo, fighter)) {
      this.logs.unshift(`Blocked ${operation.controllerType} state ${operation.callerStateNo} for ${fighter.id}`);
      return undefined;
    }
    let partner: FighterMatchState | undefined;
    if (operation.partnerOrdinal !== undefined) {
      partner = tagPartnerSelectionWorld.select(roots, fighter, operation.partnerOrdinal);
      if (!partner) {
        this.logs.unshift(`Blocked ${operation.controllerType} partner ${operation.partnerOrdinal} for ${fighter.id}`);
        return undefined;
      }
      if (operation.partnerStateNo !== undefined && !canEnterState(partner, operation.partnerStateNo, partner)) {
        this.logs.unshift(`Blocked ${operation.controllerType} partner state ${operation.partnerStateNo} for ${partner.id}`);
        return undefined;
      }
    }
    const targetIds = new Set<string>();
    if (operation.self) targetIds.add(fighter.id);
    if (partner) targetIds.add(partner.id);
    const changes: RuntimeRootStandbyChange[] = [...targetIds].map((id) => ({ id, standby: operation.standby }));
    if (changes.length === 0) {
      if (operation.callerStateNo !== undefined) {
        enterState(fighter, operation.callerStateNo, undefined, { clearStateOwner: true });
      }
      if (operation.memberPosition !== undefined) {
        this.tagTeamOrder!.swapMember(targetSide!, fighter.id, operation.memberPosition);
      }
      if (operation.callerControl !== undefined) {
        applyRuntimeControl(fighter.runtime, operation.callerControl);
      }
      if (leader) {
        this.tagTeamOrder!.rotateLeader(targetSide!, leader.id, (id) => (rootById.get(id)?.runtime.life ?? 0) > 0);
      }
      return operation;
    }
    if (operation.callerStateNo !== undefined) {
      enterState(fighter, operation.callerStateNo, undefined, { clearStateOwner: true });
    }
    if (operation.memberPosition !== undefined) {
      this.tagTeamOrder!.swapMember(targetSide!, fighter.id, operation.memberPosition);
    }
    if (operation.callerControl !== undefined) {
      applyRuntimeControl(fighter.runtime, operation.callerControl);
    }
    if (leader) {
      this.tagTeamOrder!.rotateLeader(targetSide!, leader.id, (id) => (rootById.get(id)?.runtime.life ?? 0) > 0);
    }
    rootStandbyTransitionWorld.apply(roots, changes);
    if (partner && operation.partnerStateNo !== undefined) {
      enterState(partner, operation.partnerStateNo, undefined, { clearStateOwner: true });
    }
    if (partner && operation.partnerControl !== undefined) {
      applyRuntimeControl(partner.runtime, operation.partnerControl);
    }
    return operation;
  }

  private applyHelperOwnedSelfTeamStandbyController(
    owner: FighterMatchState,
    helper: RuntimeHelper,
    operation: TeamStandbyControllerOp,
  ): TeamStandbyControllerOp | undefined {
    const block = (reason: string): undefined => {
      this.logs.unshift(`Blocked Helper-owned ${operation.controllerType} for ${helper.serialId} (${reason})`);
      return undefined;
    };
    if (this.runtimeProfile !== "ikemen-go") return block("requires ikemen-go profile");
    if (helper.ownerId !== owner.id) return block(`owner mismatch ${owner.id}`);
    if (helper.destroyed || helper.teamState?.disabled) return block("Helper unavailable");
    if (
      operation.selfExpression !== undefined ||
      operation.redirectPlayerId !== undefined ||
      operation.redirectPlayerIdExpression !== undefined ||
      operation.partnerOrdinal !== undefined ||
      operation.partnerOrdinalExpression !== undefined ||
      operation.callerStateNo !== undefined ||
      operation.callerStateExpression !== undefined ||
      operation.partnerStateNo !== undefined ||
      operation.partnerStateExpression !== undefined ||
      operation.callerControl !== undefined ||
      operation.callerControlExpression !== undefined ||
      operation.partnerControl !== undefined ||
      operation.partnerControlExpression !== undefined ||
      operation.memberPosition !== undefined ||
      operation.memberPositionExpression !== undefined ||
      operation.leaderPlayerNo !== undefined ||
      operation.leaderPlayerNoExpression !== undefined
    ) {
      return block("aggregate payload unsupported");
    }
    if (operation.self) {
      helper.teamState = {
        disabled: helper.teamState?.disabled ?? false,
        standby: operation.standby,
        overKo: helper.teamState?.overKo ?? false,
        playerType: helper.teamState?.playerType ?? false,
      };
    }
    return operation;
  }

  private applyHelperLocalTeamStandbyController(
    caller: FighterMatchState,
    helper: RuntimeHelper,
    sourceOperation: TeamStandbyControllerOp,
    context: ReturnType<typeof runtimeControllerContext>,
  ): TeamStandbyControllerOp | undefined {
    const redirectPlayerId = sourceOperation.redirectPlayerId ?? helper.playerId ?? "invalid";
    const block = (reason: string): undefined => {
      this.logs.unshift(
        `Blocked ${sourceOperation.controllerType} RedirectID ${redirectPlayerId} for ${caller.id} (${reason})`,
      );
      return undefined;
    };
    if (sourceOperation.controllerType === "tagout" && hasAuthoredCallerControl(sourceOperation)) {
      return block("TagOut Helper control unsupported");
    }
    if (
      sourceOperation.controllerType !== "tagin" &&
      (sourceOperation.leaderPlayerNo !== undefined || sourceOperation.leaderPlayerNoExpression !== undefined)
    ) {
      return block("TagOut Helper leader unsupported");
    }

    const operation = resolveDynamicTeamStandbyOperation(sourceOperation, caller, context);
    if (!operation) return block("invalid Helper Tag expression");
    const stateNo = operation.callerStateNo;
    if (stateNo !== undefined && !hasRuntimeHelperState(helper, stateNo)) {
      return block(`Helper state ${stateNo} unavailable for ${helper.serialId}`);
    }

    const hasPartnerPayload = operation.partnerStateNo !== undefined || operation.partnerControl !== undefined;
    if (operation.partnerOrdinal === undefined && hasPartnerPayload) {
      return block("Helper partner target required");
    }
    const roots = this.characterRoots();
    const rootById = new Map(roots.map((candidate) => [candidate.id, candidate]));
    const rootByPlayerNo = new Map(
      roots.flatMap((candidate) => candidate.playerNo === undefined ? [] : [[candidate.playerNo, candidate] as const]),
    );
    const needsRootAnchor = operation.partnerOrdinal !== undefined ||
      operation.memberPosition !== undefined ||
      operation.leaderPlayerNo !== undefined;
    const root = needsRootAnchor ? roots.find((candidate) => candidate.id === helper.rootId) : undefined;
    if (needsRootAnchor && (!root || !root.runtime.teamState?.playerType || root.runtime.teamState.disabled)) {
      return block(`Helper root ${helper.rootId} unavailable`);
    }
    let partner: FighterMatchState | undefined;
    if (operation.partnerOrdinal !== undefined) {
      partner = tagPartnerSelectionWorld.select(roots, root!, operation.partnerOrdinal);
      if (!partner) return block(`partner ${operation.partnerOrdinal} unavailable for ${root!.id}`);
      if (operation.partnerStateNo !== undefined && !canEnterState(partner, operation.partnerStateNo, partner)) {
        return block(`partner state ${operation.partnerStateNo} unavailable for ${partner.id}`);
      }
    }
    const targetSide = root === undefined ? undefined : runtimeTeamSide(root);
    if (
      operation.memberPosition !== undefined &&
      (!this.tagTeamOrder ||
        targetSide === undefined ||
        !this.tagTeamOrder.canSwapPositionOne(targetSide, operation.memberPosition))
    ) {
      return block(`member position ${operation.memberPosition} unavailable for ${root!.id}`);
    }
    const leader = operation.leaderPlayerNo === undefined ? undefined : rootByPlayerNo.get(operation.leaderPlayerNo);
    if (
      operation.leaderPlayerNo !== undefined &&
      (!this.tagTeamOrder ||
        targetSide === undefined ||
        !leader ||
        leader.runtime.teamState?.disabled ||
        runtimeTeamSide(leader) !== targetSide ||
        !this.tagTeamOrder.canRotateLeader(targetSide, leader.id))
    ) {
      return block(`leader ${operation.leaderPlayerNo} unavailable for ${root!.id}`);
    }

    const hasLocalMutation = stateNo !== undefined ||
      operation.memberPosition !== undefined ||
      (operation.controllerType === "tagin" && hasAuthoredCallerControl(operation));
    if (!operation.self && !hasLocalMutation && !partner && !leader) return block("Helper local mutation required");

    if (!applyRuntimeHelperTagStateControl(helper, { stateNo })) {
      return block(`Helper state ${stateNo ?? "invalid"} unavailable for ${helper.serialId}`);
    }
    if (operation.memberPosition !== undefined) {
      this.tagTeamOrder!.swapPositionOne(targetSide!, operation.memberPosition);
    }
    if (operation.callerControl !== undefined) {
      applyRuntimeHelperTagStateControl(helper, { control: operation.callerControl });
    }
    if (leader) {
      this.tagTeamOrder!.rotateLeader(targetSide!, leader.id, (id) => (rootById.get(id)?.runtime.life ?? 0) > 0);
    }
    if (operation.self) {
      helper.teamState = {
        disabled: helper.teamState?.disabled ?? false,
        standby: operation.standby,
        overKo: helper.teamState?.overKo ?? false,
        playerType: helper.teamState?.playerType ?? false,
      };
    }
    if (partner) {
      rootStandbyTransitionWorld.apply(roots, [{ id: partner.id, standby: operation.standby }]);
      if (operation.partnerStateNo !== undefined) {
        enterState(partner, operation.partnerStateNo, undefined, { clearStateOwner: true });
      }
      if (operation.partnerControl !== undefined) {
        applyRuntimeControl(partner.runtime, operation.partnerControl);
      }
    }
    return operation;
  }

  private opponentForRoot(fighter: FighterMatchState): FighterMatchState {
    const roots = [this.p1, this.p2, ...this.reserveRoots];
    const selection = rootSelectionWorld.diagnostic(
      roots.map((root) => ({ id: root.id, ...root.runtime.teamState })),
    ).entries.find((entry) => entry.actorId === fighter.id);
    const selectedId = selection?.p2CandidateIds[0];
    return roots.find((root) => root.id === selectedId) ?? (runtimeTeamSide(fighter) === 1 ? this.p2 : this.p1);
  }

  private applyMatchPauseController(
    fighter: FighterMatchState,
    controller: MugenStateController,
    operation?: PauseControllerOp,
    resolveSoundValue?: () => RuntimeResolvedSoundValue | undefined,
    resolveParams?: RuntimePauseControllerParamResolvers,
  ): MatchPauseControllerResult {
    return this.matchPauseControllerWorld.apply({
      actor: fighter,
      controller,
      operation,
      runtimeTick: this.tick,
      pauseWorld: this.pauseWorld,
      applyPowerDelta: (actor, powerDelta) => applyRuntimePowerDelta(actor.runtime, powerDelta, actor.definition.constants),
      applyTargetDefenseMultiplier: (actor, multiplier, pause) =>
        this.applyTargetDefenseMultiplier(actor, multiplier, pause),
      emitSound: (actor, sound, runtimeTick, resolvedSound) =>
        actor.audioWorld.emitSuperPauseSound(actor, sound, runtimeTick, resolvedSound),
      recordAudioOperation: (actor, audioOperation: AudioControllerOp) =>
        compatibilityTelemetryWorld.recordOperation(actor, audioOperation),
      resolveSoundValue,
      resolveParams,
      defaultTargetDefenseValue: () => this.superPauseTargetDefenseValue,
      log: (message) => this.logs.unshift(message),
    });
  }

  private applyHelperMatchPauseController(
    owner: FighterMatchState,
    helper: RuntimeHelper,
    controller: ControllerIr,
    operation: PauseControllerOp | undefined,
    resolveSoundValue: () => RuntimeResolvedSoundValue | undefined,
    resolveParams: RuntimePauseControllerParamResolvers,
  ): MatchPauseControllerResult {
    const actor = {
      id: helper.serialId,
      label: `Helper ${helper.name ?? helper.helperId ?? helper.serialId}`,
      runtime: { stateNo: helper.stateNo ?? owner.runtime.stateNo },
      definition: owner.definition,
      stateElapsed: helper.stateTime,
      soundEvents: helper.soundEvents,
    };
    const result = this.matchPauseControllerWorld.apply({
      actor,
      controller: controller.source,
      operation,
      runtimeTick: this.tick,
      pauseWorld: this.pauseWorld,
      applyPowerDelta: (_actor, powerDelta) =>
        applyRuntimePowerDelta(owner.runtime, powerDelta, owner.definition.constants),
      emitSound: (pauseActor, sound, runtimeTick, resolvedSound) =>
        this.audioWorld.emitSuperPauseSound(pauseActor, sound, runtimeTick, resolvedSound),
      recordAudioOperation: (_actor, audioOperation) =>
        compatibilityTelemetryWorld.recordOperation(owner, audioOperation, {
          stateNo: helper.stateNo ?? owner.runtime.stateNo,
        }),
      resolveSoundValue,
      resolveParams,
      defaultTargetDefenseValue: () => this.superPauseTargetDefenseValue,
      applyTargetDefenseMultiplier: (_actor, multiplier, pause) =>
        this.applyHelperTargetDefenseMultiplier(helper, multiplier, pause),
      log: (message) => this.logs.unshift(message),
    });
    if (result.pause?.type === "Pause") {
      helper.pauseMoveTime = result.pause.moveTime;
    } else if (result.pause?.type === "SuperPause") {
      helper.superMoveTime = result.pause.moveTime;
    }
    return result;
  }

  private applyTargetDefenseMultiplier(
    fighter: FighterMatchState,
    multiplier: number,
    pause = this.pauseWorld.current(),
  ): number {
    this.restoreExpiredSuperPauseTargetDefense();
    if (pause?.type !== "SuperPause") {
      return 0;
    }
    const targets = this.runtimeProfile === "ikemen-go"
      ? this.opposingTeamDefenseActors(fighter)
      : fighter.targetWorld.resolveCandidates(fighter, [fighter.id === this.p1.id ? this.p2 : this.p1]);
    return this.applyTargetDefenseMultiplierToActors(targets, multiplier, pause);
  }

  private applyHelperTargetDefenseMultiplier(
    helper: RuntimeHelper,
    multiplier: number,
    pause: RuntimeMatchPause,
  ): number {
    const targets = this.runtimeProfile === "ikemen-go"
      ? this.opposingTeamDefenseActors(helper)
      : this.targetWorld.resolveCandidates(
          {
            id: helper.serialId,
            runtime: helperRuntimeState(helper),
            targets: helper.targets,
            targetBindings: helper.targetBindings,
          },
          [...this.matchRoster().actors],
        );
    return this.applyTargetDefenseMultiplierToActors(targets, multiplier, pause);
  }

  private opposingTeamDefenseActors(
    source: FighterMatchState | RuntimeHelper,
  ): Array<FighterMatchState | RuntimeHelper> {
    const characters = [
      ...this.matchRoster().actors.map((actor) => ({ id: actor.id, actor })),
      ...this.effectActorWorld.helpers(this.p1.id).map((actor) => ({ id: actor.serialId, rootId: actor.rootId, actor })),
      ...this.effectActorWorld.helpers(this.p2.id).map((actor) => ({ id: actor.serialId, rootId: actor.rootId, actor })),
    ];
    const sourceEntry = characters.find((entry) => entry.actor === source);
    return sourceEntry
      ? runtimeTeamTopologyWorld.create(characters).opposingCharactersFor(sourceEntry).map((entry) => entry.actor)
      : [];
  }

  private applyTargetDefenseMultiplierToActors(
    targets: Array<FighterMatchState | RuntimeHelper>,
    multiplier: number,
    pause: RuntimeMatchPause,
  ): number {
    for (const target of targets) {
      const existing = this.superPauseTargetDefenseOverrides.find(
        (override) => override.actor === target && override.pauseStartedAt === pause.startedAt,
      );
      if (!existing) {
        this.superPauseTargetDefenseOverrides.push({
          actor: target,
          pauseStartedAt: pause.startedAt,
          multiplier,
        });
      } else {
        existing.multiplier *= multiplier;
      }
      this.setSuperPauseDefenseMultiplier(target, existing ? existing.multiplier : multiplier);
    }
    return targets.length;
  }

  private restoreExpiredSuperPauseTargetDefense(force = false): void {
    const pause = this.pauseWorld.current();
    const actors = new Set(this.superPauseTargetDefenseOverrides.map((override) => override.actor));
    const active = force || pause?.type !== "SuperPause"
      ? []
      : this.superPauseTargetDefenseOverrides.filter((override) => override.pauseStartedAt === pause.startedAt);
    for (const actor of actors) {
      const override = active.find((candidate) => candidate.actor === actor);
      if (override) {
        this.setSuperPauseDefenseMultiplier(actor, override.multiplier);
      } else {
        this.clearSuperPauseDefenseMultiplier(actor);
      }
    }
    this.superPauseTargetDefenseOverrides = active;
  }

  private setSuperPauseDefenseMultiplier(actor: FighterMatchState | RuntimeHelper, multiplier: number): void {
    if ("runtime" in actor) {
      actor.runtime.superPauseDefenseMultiplier = multiplier;
    } else {
      actor.superPauseDefenseMultiplier = multiplier;
    }
  }

  private clearSuperPauseDefenseMultiplier(actor: FighterMatchState | RuntimeHelper): void {
    if ("runtime" in actor) {
      delete actor.runtime.superPauseDefenseMultiplier;
    } else {
      delete actor.superPauseDefenseMultiplier;
    }
  }

  private applyPreFacingAssertSpecial(fighter: FighterMatchState, opponent: FighterMatchState): void {
    matchPreFacingAssertSpecialWorld.apply({
      actor: fighter,
      opponent,
      tick: this.tick,
      stageBounds: this.stage.bounds,
      gameSpace: runtimeStageGameSpace(this.stage),
      assertSpecialWorld: this.assertSpecialWorld,
      controllerDispatchWorld,
      triggersPass,
      getConst: (owner, name) => runtimeDefinitionConst(owner.definition, name),
      nextRandom: nextRuntimeRandom,
    });
  }

  getSnapshot(): MugenSnapshot {
    const roots = this.characterRoots();
    const teamMode = this.tagTeamOrder ? "tag" : "single";
    const rootPresentation = rootPresentationWorld.diagnostic({
      runtimeProfile: this.runtimeProfile,
      teamMode,
      roots,
      playableRoots: [this.p1, this.p2],
    });
    const rootById = new Map(roots.map((root) => [root.id, root]));
    const cameraActors = rootPresentation.cameraRootIds.map((id) => {
      const actor = rootById.get(id);
      if (!actor) throw new Error(`Root presentation camera actor ${id} is unavailable`);
      return actor;
    });
    const presentationSnapshot = matchPresentationSnapshotWorld.create({
      tick: this.tick,
      stage: this.stage,
      p1: this.p1,
      p2: this.p2,
      cameraActors,
      envShakeWorld: this.envShakeWorld,
      envColorWorld: this.envColorWorld,
      effectLifecycleWorld: this.effectLifecycleWorld,
    });
    const snapshot = this.snapshotWorld.match({
      tick: this.tick,
      playing: this.playing,
      speed: this.speed,
      toggles: this.toggles,
      matchPause: this.pauseWorld.snapshot(),
      stage: presentationSnapshot.stage,
      round: this.round.snapshot(),
      p1: this.p1,
      p2: this.p2,
      reserveActors: this.reserveRoots,
      effects: presentationSnapshot.effects,
      compatibilitySession: compatibilityTelemetryWorld.buildSession([...this.matchRoster().actors]),
      tickSchedule: this.lastTickSchedule,
      rootPresentation,
      rootBodyPush: this.lastRootBodyPush,
      rootHitAdmission: this.lastRootHitAdmission,
      logs: this.logs,
    });
    const reserveCompatibilitySession = compatibilityTelemetryWorld.buildSession(this.reserveRoots);
    return {
      ...snapshot,
      ...(this.tagTeamOrder ? { tagTeamOrder: this.tagTeamOrder.diagnostic() } : {}),
      ...(this.runtimeProfile === "ikemen-go"
        ? {
            rootInputRouting: rootInputRoutingWorld.diagnostic({
              runtimeProfile: this.runtimeProfile,
              teamMode,
              roots,
              p2Controlled: this.lastP2Controlled,
            }),
          }
        : {}),
      ...(reserveCompatibilitySession ? { reserveCompatibilitySession } : {}),
    };
  }

  getEffectActorStores(): RuntimeEffectActorStoreSummary[] {
    return this.effectActorWorld.summarize(this.characterRoots().map(({ id }) => id));
  }

  getHitDefContactMemory(): RuntimeHitDefContactMemoryDiagnostic {
    return createRuntimeHitDefContactMemoryDiagnostic(this.characterRoots());
  }

  getCharacterIdentity(): RuntimeCharacterIdentityDiagnostic | undefined {
    return this.characterIdentity?.diagnostic();
  }

  reset(): void {
    this.restoreExpiredSuperPauseTargetDefense(true);
    this.tagTeamOrder?.reset();
    const resetState = this.matchResetWorld.reset({
      p1: this.p1,
      p2: this.p2,
      p1Definition: this.p1.definition,
      p2Definition: this.p2.definition,
      p1Start: this.stage.playerStart.p1,
      p2Start: this.stage.playerStart.p2,
      round: this.round,
      roundTimerFrames: this.roundTimerFrames,
      pauseWorld: this.pauseWorld,
      envColorWorld: this.envColorWorld,
      effectActorWorld: this.effectActorWorld,
      reserveActors: this.reserveRoots.map((actor) => ({
        actor,
        id: actor.id,
        definition: actor.definition,
        start: /p[357]$/.test(actor.id) ? this.stage.playerStart.p1 : this.stage.playerStart.p2,
      })),
      createFighter: (id, definition, start) => {
        const existing = [this.p1, this.p2, ...this.reserveRoots].find((root) => root.id === id);
        const fighter = this.createFighterState(id, definition, start, {
          playerId: existing?.playerId,
          playerNo: existing?.playerNo,
        });
        if (id !== "p1" && id !== "p2") {
          fighter.runtime.teamState = {
            disabled: false,
            standby: true,
            overKo: false,
            playerType: true,
          };
        }
        return fighter;
      },
      attachHelperHandlers: () => this.attachHelperHandlers(),
      log: (message) => this.logs.unshift(message),
    });
    this.tick = resetState.tick;
    this.frameClock = resetState.frameClock;
    this.playing = resetState.playing;
    this.lastP2Controlled = false;
    this.lastTickSchedule = createIdleMatchTickSchedule(this.tick);
    this.lastRootBodyPush = undefined;
    this.lastRootHitAdmission = undefined;
    if (this.runtimeProfile === "ikemen-go") {
      this.initializeCharacterIdentity();
    }
  }

  private createFighterState(
    id: string,
    definition: DemoFighterDefinition,
    start: { x: number; y: number; z?: number; facing: 1 | -1 },
    identity: Pick<FighterMatchState, "playerId" | "playerNo"> = {},
  ): FighterMatchState {
    return fighterStateWorld.create({
      id,
      ...identity,
      definition,
      x: start.x,
      y: start.y,
      z:
        start.z === undefined
          ? undefined
          : start.z * ((320 / this.stage.localCoord.width) / (320 / (definition.localCoord?.[0] ?? 320))),
      facing: start.facing,
      effectActorWorld: this.effectActorWorld,
      targetWorld: this.targetWorld,
      audioWorld: this.audioWorld,
      envShakeWorld: this.envShakeWorld,
      hitEffectWorld: this.hitEffectWorld,
      contactWorld: this.contactWorld,
    });
  }

  private recordEnvColorEvent(
    controller: MugenStateController,
    runtimeTick: number,
    operation?: EnvColorControllerOp,
    resolveEnvColor?: RuntimeEnvColorResolver,
  ): void {
    matchEnvColorBridgeWorld.apply({
      controller,
      operation,
      resolveEnvColor,
      runtimeTick,
      envColorWorld: this.envColorWorld,
    });
  }

}

function nextRuntimeRandom(fighter: FighterMatchState): number {
  const next = nextRuntimeRandomUnit(fighter.rngSeed);
  fighter.rngSeed = next.seed;
  return next.value;
}

function createRootCharacterIdentity(fighter: FighterMatchState): RuntimeMatchCharacterIdentity {
  if (fighter.playerNo === undefined) {
    throw new Error(`Missing explicit PlayerNo for runtime root ${fighter.id}`);
  }
  return {
    id: fighter.id,
    playerNo: fighter.playerNo,
    fighter,
    get disabled() {
      return fighter.runtime.teamState?.disabled;
    },
    get standby() {
      return fighter.runtime.teamState?.standby;
    },
  };
}

function createHelperCharacterIdentity(helper: RuntimeHelper): RuntimeMatchCharacterIdentity {
  if (helper.playerNo === undefined) {
    throw new Error(`Missing inherited PlayerNo for runtime Helper ${helper.serialId}`);
  }
  return {
    id: helper.serialId,
    playerNo: helper.playerNo,
    rootId: helper.rootId,
    parentId: helper.parentId,
    helper,
    get disabled() {
      return helper.teamState?.disabled;
    },
    get destroyed() {
      return helper.destroyed;
    },
    get standby() {
      return helper.teamState?.standby;
    },
  };
}

function setRuntimeStateNo(fighter: FighterMatchState, stateNo: number, options: { resetElapsed?: boolean } = {}): void {
  stateEntryWorld.setStateNo(fighter, stateNo, options);
}

function handlePlayerInput(
  fighter: FighterMatchState,
  input: Set<string>,
  opponent: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
  inputControlWorld: RuntimeInputControlWorld,
): void {
  inputControlWorld.handlePlayerInput(fighter, input, {
    hasStun: hasRuntimeStun(fighter),
    preserveImportedStateMoveType: shouldPreserveImportedStateMoveType(fighter),
    runStateEntrySetup: () => runStateEntrySetupControllers(fighter, opponent, stageBounds, gameSpace, tick),
    tryApplyStateEntry: () => tryApplyStateEntry(fighter, opponent, stageBounds, gameSpace, tick),
    startMove: (move) => startMove(fighter, move),
    changeAction: (actionId) => changeAction(fighter, actionId),
    setStateNo: (stateNo) => setRuntimeStateNo(fighter, stateNo),
    restoreControl: () => applyRuntimeControl(fighter.runtime, true),
  });
}

function handleSimpleAi(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  tick: number,
  inputControlWorld: RuntimeInputControlWorld,
): void {
  inputControlWorld.handleSimpleAi(fighter, opponent, tick, {
    hasStun: hasRuntimeStun(fighter),
    preserveImportedStateMoveType: shouldPreserveImportedStateMoveType(fighter),
    startMove: (move) => startMove(fighter, move),
    changeAction: (actionId) => changeAction(fighter, actionId),
    setStateNo: (stateNo) => setRuntimeStateNo(fighter, stateNo),
  });
}

function advanceFighter(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  actorConstraintWorld: RuntimeActorConstraintWorld,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  hitOverrideWorld: RuntimeHitOverrideWorld,
  reversalWorld: RuntimeReversalWorld,
  effectSpawnWorld: RuntimeEffectSpawnWorld,
  recoveryWorld: RuntimeRecoverySystem,
  hitEligibilityWorld: RuntimeHitEligibilityWorld,
  moveLifecycleWorld: RuntimeMoveLifecycleWorld,
  kinematicsWorld: RuntimeKinematicsWorld,
  animationWorld: RuntimeAnimationWorld,
  stunWorld: RuntimeStunWorld,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
  runtimeProfile: RuntimeCompatibilityProfile,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
  recordSchedulePhase?: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
  onTeamStandby?: TeamStandbyControllerHandler,
): void {
  const hooks = fighterAdvanceHookSetWorld.create<FighterMatchState>({
    tickSpriteEffects: (actor) => spriteEffectWorld.tick(actor.runtime, () => createAfterImageSample(actor)),
    tickHitBySlots: (actor) => hitEligibilityWorld.tickHitBySlots(actor.runtime),
    tickHitOverrideSlots: (actor) => hitOverrideWorld.tickSlots(actor.runtime),
    advanceContactTimers,
    advanceStateClock: (actor) => stateClockWorld.advance(actor),
    resetFrameConstraints: (actor) => actorConstraintWorld.resetFrameConstraints(actor.runtime),
    tickHitFallRecoveryWindow: (actor) => recoveryWorld.tickHitFallRecoveryWindow(actor),
    shouldPreserveImportedStateMoveType,
    advanceStun: (actor, preserveImportedStateMoveType) => {
      stunWorld.advance(actor, {
        hasCurrentMove: Boolean(actor.currentMove),
        preserveImportedStateMoveType,
        suppressHitStunAction: Boolean(actor.stateOwner),
        showHitStunAction: () => changeAction(actor, actor.definition.hitstunAction),
      });
    },
    advanceMoveLifecycle: (actor) => {
      moveLifecycleWorld.advance(actor, {
        restoreControl: () => applyRuntimeControl(actor.runtime, true),
        enterIdleState: () => setRuntimeStateNo(actor, actor.definition.idleAction),
        changeIdleAction: () => changeAction(actor, actor.definition.idleAction),
      });
    },
    advanceKinematics: (actor, preserveImportedStateMoveType) => {
      recordSchedulePhase?.("fighter:kinematics", actor.id);
      kinematicsWorld.advance(actor, {
        preserveImportedStateMoveType,
        changeIdleAction: () => changeAction(actor, actor.definition.idleAction),
        groundFriction:
          actor.definition.source === "imported"
            ? runtimeGroundFrictionOptions(actor.definition.constants, actor.definition.localCoord)
            : undefined,
      });
    },
    advanceAnimation: (actor) => {
      recordSchedulePhase?.("fighter:animation", actor.id);
      animationWorld.advance(actor);
    },
    runActiveStateControllers: (actor) => {
      recordSchedulePhase?.("fighter:controllers", actor.id);
      return runActiveStateControllers(
        actor,
        opponent,
        actorConstraintWorld,
        spriteEffectWorld,
        reversalWorld,
        effectSpawnWorld,
        stageBounds,
        gameSpace,
        tick,
        onPauseController,
        onEnvColorController,
        { onTeamStandby, runtimeProfile },
      );
    },
    advanceImportedGroundRecoveryLanding: (actor) => {
      recoveryWorld.advanceImportedGroundRecoveryLanding(actor, {
        canEnterState: (stateId) => canEnterState(actor, stateId),
        enterState: (stateId) => enterState(actor, stateId, undefined, { clearStateOwner: true }),
      });
    },
    advanceCommon1LieDownRecovery: (actor) => {
      recoveryWorld.advanceCommon1LieDownRecovery(actor, {
        canEnterState: (stateId) => canEnterState(actor, stateId),
        enterState: (stateId) => enterState(actor, stateId, undefined, { clearStateOwner: true }),
        isFastRecoverFromLieDownRequested: () =>
          actor.commandBuffer.isCommandActive("recovery", actor.definition.commands ?? []),
      });
    },
    preserveFrozenPosition: (actor, tickStartPos) =>
      actorConstraintWorld.preserveFrozenPosition(actor.runtime, tickStartPos),
  });

  fighterAdvanceWorld.advance({
    actor: fighter,
    hooks,
  });
}

function startMove(fighter: FighterMatchState, moveName: "punch" | "kick"): void {
  startMoveWithSpec(fighter, fighter.definition.moves[moveName], moveName);
}

function startMoveWithSpec(fighter: FighterMatchState, move: DemoMove, label: string): void {
  moveStartWorld.start(fighter, move, label, {
    applyControl: (actor, ctrl) => applyRuntimeControl(actor.runtime, ctrl),
    enterState: (actor, stateId, stateMove) => enterState(actor, stateId, stateMove),
  });
}

function changeAction(
  fighter: FighterMatchState,
  actionId: number,
  source: NonNullable<CharacterRuntimeState["animationSource"]> = "self",
  actionOwner: DemoFighterDefinition = fighter.definition,
  elementOptions: AnimationElementOptions = {},
): boolean {
  const result = animationChangeWorld.changeAction(fighter, {
    actionId,
    source,
    actionOwner,
    ...elementOptions,
  });
  return result.actionFound;
}

function enterState(fighter: FighterMatchState, stateId: number, move?: DemoMove, options: EnterStateOptions = {}): void {
  stateEntryWorld.enterState(fighter, stateId, move, options, {
    recordStateExecution: (actor, executedStateId, owner) =>
      compatibilityTelemetryWorld.recordStateExecution(actor, executedStateId, owner),
    resetContactState,
    changeAction: (actor, actionId, source, actionOwner, elementOptions) =>
      changeAction(actor, actionId, source, actionOwner.definition, elementOptions),
  });
}

function runHitPauseIgnoredControllers(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  actorConstraintWorld: RuntimeActorConstraintWorld,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  reversalWorld: RuntimeReversalWorld,
  effectSpawnWorld: RuntimeEffectSpawnWorld,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
  runtimeProfile: RuntimeCompatibilityProfile,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
  onTeamStandby?: TeamStandbyControllerHandler,
): void {
  runActiveStateControllers(
    fighter,
    opponent,
    actorConstraintWorld,
    spriteEffectWorld,
    reversalWorld,
    effectSpawnWorld,
    stageBounds,
    gameSpace,
    tick,
    onPauseController,
    onEnvColorController,
    { onlyIgnoreHitPause: true, onTeamStandby, runtimeProfile },
  );
}

type ActiveControllerRunOptions = {
  onlyIgnoreHitPause?: boolean;
  participation?: RuntimeRootCnsParticipation;
  onBlocked?: (controller: ControllerIr, route: string) => void;
  onTeamStandby?: TeamStandbyControllerHandler;
  runtimeProfile?: RuntimeCompatibilityProfile;
};

function runActiveStateControllers(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  actorConstraintWorld: RuntimeActorConstraintWorld,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  reversalWorld: RuntimeReversalWorld,
  effectSpawnWorld: RuntimeEffectSpawnWorld,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
  options: ActiveControllerRunOptions = {},
): void {
  const hookSet = activeControllerHookSetWorld.create<FighterMatchState>({
    resolveNumber: ({ value, expression, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) =>
      resolveDispatchNumber(value, expression, actor, targetOpponent, stateOwner, stageBounds, activeTick, gameSpace),
    resolveBoolean: ({ value, expression, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) =>
      resolveDispatchBoolean(value, expression, actor, targetOpponent, stateOwner, stageBounds, activeTick, gameSpace),
    recordController: runtimeActiveControllerTelemetryHooks.recordController,
    enterState: (actor, stateId, stateOptions) => enterState(actor, stateId, undefined, stateOptions),
    applyControl: (actor, ctrl) => applyRuntimeControl(actor.runtime, ctrl),
    changeAction: (actor, actionId, source, actionOwner, elementOptions) =>
      changeAction(actor, actionId, source, actionOwner.definition, elementOptions),
    hitDef: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      hitDefControllerDispatchWorld.apply({
        actor,
        controller,
        frame: getCurrentFrame(actor),
        resolveSoundValue: (key) => resolveAudioSoundValueParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    reversalDef: ({ controller }) => {
      reversalControllerDispatchWorld.apply({
        actor: fighter,
        controller,
        hitbox: frameWorld.currentFrame(fighter)?.clsn1[0],
        reversalWorld,
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    width: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      actorConstraintControllerDispatchWorld.apply({
        actor: fighter,
        controller,
        actorConstraintWorld,
        resolveWidth: {
          resolvePair: (key) => resolveWidthPairParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        },
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    depth: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      actorConstraintControllerDispatchWorld.applyDepth({
        actor: fighter,
        controller,
        actorConstraintWorld,
        resolveDepth: {
          resolvePair: (key) =>
            resolveDepthPairParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        },
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    fallEnvShake: ({ controller }) => {
      matchEnvShakeBridgeWorld.applyFallController({
        actor: fighter,
        controller,
        runtimeTick: tick,
        envShakeWorld: fighter.envShakeWorld,
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    spriteEffect: ({ controller, effect, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      spriteEffectControllerWorld.apply({
        actor: fighter,
        controller,
        effect,
        spriteEffectWorld,
        sampleFactory: () => createAfterImageSample(fighter),
        resolveRemapPalPair:
          effect === "remappal"
            ? (key) => resolveRemapPalPairParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick)
            : undefined,
        resolveSpritePriority:
          effect === "sprpriority"
            ? (key) => resolveSpritePriorityParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick)
            : undefined,
        resolveTransAlpha:
          effect === "trans"
            ? (key) => resolveTransAlphaParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick)
            : undefined,
        resolvePaletteFx:
          effect === "palfx"
            ? {
                resolveNumber: (key) =>
                  resolvePaletteFxNumberParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
                resolveTriplet: (key) =>
                  resolvePaletteFxTripletParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
              }
            : undefined,
        resolveAfterImage:
          effect === "afterimage"
            ? {
                resolveNumber: (key) =>
                  resolveAfterImageNumberParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
                resolveTriplet: (key) =>
                  resolveAfterImageTripletParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
              }
            : undefined,
        resolveAfterImageTime:
          effect === "afterimagetime"
            ? (key) => resolveAfterImageTimeParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick)
            : undefined,
        resolveAngle:
          effect === "angle"
            ? {
                resolveNumber: (key) =>
                  resolveAngleNumberParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
                resolvePair: (key) =>
                  resolveAnglePairParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
              }
            : undefined,
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    effectSpawn: ({ controller, effect, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      effectSpawnControllerDispatchWorld.apply({
        actor: fighter,
        opponent,
        controller,
        effect,
        effectSpawnWorld,
        runtimeProfile: options.runtimeProfile,
        resolveHelperStandby:
          effect === "helper" && options.runtimeProfile === "ikemen-go"
            ? (operation) =>
                resolveDispatchBoolean(
                  operation.standby,
                  operation.standbyExpression,
                  actor,
                  targetOpponent,
                  stateOwner,
                  stageBounds,
                  activeTick,
                  gameSpace,
                )
            : undefined,
        resolveProjectileSound:
          effect === "projectile"
            ? (key) => resolveAudioSoundValueParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick)
            : undefined,
        resolveModifyProjectile:
          effect === "modifyprojectile"
            ? {
                resolveNumber: (key) =>
                  resolveModifyProjectileNumberParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
                resolvePair: (key) =>
                  resolveModifyProjectilePairParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
              }
            : undefined,
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    target: ({ controller, effect }) => {
      targetControllerDispatchWorld.apply({
        actor: fighter,
        candidateTargets: [opponent],
        controller,
        effect,
        targetWorld: fighter.targetWorld,
        ...runtimeActiveControllerTelemetryHooks,
        scaleIncomingDamage: scaleRuntimeIncomingDamage,
        enterTargetState: (target, stateId) => {
          targetStateEntryWorld.enter({
            actor: fighter,
            target,
            stateId,
            hooks: {
              canEnterState: (targetActor, targetStateId, stateOwner) =>
                canEnterState(targetActor, targetStateId, stateOwner),
              enterState: (targetActor, targetStateId, targetOptions) =>
                enterState(targetActor, targetStateId, undefined, targetOptions),
            },
          });
        },
        getTargetConst: (target, name) => runtimeDefinitionConst(target.definition, name),
      });
    },
    pause: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      pauseControllerDispatchWorld.apply({
        actor: fighter,
        controller,
        applyController: (activeActor, source, operation) =>
          onPauseController?.(
            activeActor,
            source,
            operation,
            () => resolveAudioSoundValueParam(source, "sound", actor, targetOpponent, stateOwner, stageBounds, activeTick),
            {
              time: () => resolvePauseNumberParam(source, "time", actor, targetOpponent, stateOwner, stageBounds, activeTick),
              moveTime: () =>
                resolvePauseNumberParam(source, "movetime", actor, targetOpponent, stateOwner, stageBounds, activeTick),
              pauseBg: () =>
                resolvePauseNumberParam(source, "pausebg", actor, targetOpponent, stateOwner, stageBounds, activeTick),
              unhittable: () =>
                resolvePauseNumberParam(source, "unhittable", actor, targetOpponent, stateOwner, stageBounds, activeTick),
              darken: () => resolvePauseNumberParam(source, "darken", actor, targetOpponent, stateOwner, stageBounds, activeTick),
              powerAdd: () =>
                resolvePauseNumberParam(source, "poweradd", actor, targetOpponent, stateOwner, stageBounds, activeTick),
              p2DefMul: () =>
                resolvePauseNumberParam(source, "p2defmul", actor, targetOpponent, stateOwner, stageBounds, activeTick),
              animActionNo: () =>
                resolvePauseAnimActionNoParam(source, actor, targetOpponent, stateOwner, stageBounds, activeTick),
              posX: () => resolvePausePosParam(source, 0, actor, targetOpponent, stateOwner, stageBounds, activeTick),
              posY: () => resolvePausePosParam(source, 1, actor, targetOpponent, stateOwner, stageBounds, activeTick),
            },
          ),
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    sound: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      audioControllerDispatchWorld.apply({
        actor: fighter,
        controller,
        runtimeTick: tick,
        audioWorld: fighter.audioWorld,
        resolveAudio: {
          resolveNumber: (key) => resolveAudioNumberParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
          resolveSoundValue: (key) => resolveAudioSoundValueParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        },
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    envColor: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      envColorControllerDispatchWorld.apply({
        actor: fighter,
        controller,
        runtimeTick: tick,
        emitController: (source, _runtimeTick, operation, resolveEnvColor) =>
          onEnvColorController?.(source, operation, resolveEnvColor),
        resolveEnvColor: {
          resolveNumber: (key) => resolveEnvColorNumberParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
          resolveTriplet: (key) =>
            resolveEnvColorTripletParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        },
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    envShake: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      matchEnvShakeBridgeWorld.applyController({
        actor: fighter,
        controller,
        runtimeTick: tick,
        envShakeWorld: fighter.envShakeWorld,
        resolveEnvShake: {
          resolveNumber: (key) => resolveEnvShakeNumberParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
          resolveFloat: (key) => resolveEnvShakeFloatParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        },
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    contact: ({ controller }) => {
      contactControllerDispatchWorld.apply({
        actor: fighter,
        controller,
        contactWorld: fighter.contactWorld,
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    runtimeController: ({ dispatch, actor, opponent: targetOpponent, owner, tick: activeTick }) => {
      if (dispatch.controller.operation?.kind === "team-standby") {
        const context = runtimeControllerContext(
          actor,
          owner,
          activeTick,
          stageBounds,
          targetOpponent,
          gameSpace,
        );
        const operation = options.onTeamStandby?.(
          fighter,
          dispatch.controller.operation,
          context,
        );
        if (operation) {
          runtimeActiveControllerTelemetryHooks.recordController(fighter, dispatch.controller.source);
          runtimeActiveControllerTelemetryHooks.recordOperation(fighter, operation);
        } else {
          options.onBlocked?.(dispatch.controller, "runtime-controller");
        }
        return;
      }
      controllerDispatchWorld.apply(fighter, dispatch.controller, {
        context: runtimeControllerContext(fighter, owner, tick, stageBounds, opponent, gameSpace),
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
  });

  rootCnsExecutionWorld.execute({
    actor: fighter,
    opponent,
    tick,
    onlyIgnoreHitPause: options.onlyIgnoreHitPause,
    controllerIgnoresHitPause,
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(controller, actor, targetOpponent, owner, activeTick, stageBounds, gameSpace),
    dispatchController: dispatchStateProgramController,
    stateHooks: hookSet.stateHooks,
    sideEffectHooks: hookSet.sideEffectHooks,
    hooks: hookSet.hooks,
    onBlocked: options.onBlocked,
  }, options.participation ?? "playable");
}

function resolveDynamicTeamStandbyOperation(
  operation: TeamStandbyControllerOp,
  fighter: FighterMatchState,
  context: ReturnType<typeof runtimeControllerContext>,
): TeamStandbyControllerOp | undefined {
  let resolvedOperation = operation;
  if (operation.selfExpression !== undefined) {
    const resolvedSelf = evaluateRuntimeControllerNumber(operation.selfExpression, fighter.runtime, context);
    if (resolvedSelf === undefined) return undefined;
    const { selfExpression: _selfExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, self: resolvedSelf !== 0 };
  }
  if (operation.partnerOrdinalExpression !== undefined) {
    const resolvedPartnerOrdinal = evaluateRuntimeControllerNumber(operation.partnerOrdinalExpression, fighter.runtime, context);
    if (resolvedPartnerOrdinal === undefined) return undefined;
    const partnerOrdinal = Math.trunc(resolvedPartnerOrdinal);
    if (partnerOrdinal < 0) return undefined;
    const { partnerOrdinalExpression: _partnerOrdinalExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, partnerOrdinal };
  }
  if (operation.callerStateExpression !== undefined) {
    const resolvedCallerState = evaluateRuntimeControllerNumber(operation.callerStateExpression, fighter.runtime, context);
    if (resolvedCallerState === undefined) return undefined;
    const stateNo = Math.trunc(resolvedCallerState);
    if (stateNo < 0) return undefined;
    const { callerStateExpression: _callerStateExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, callerStateNo: stateNo };
  }
  if (operation.memberPositionExpression !== undefined) {
    const resolvedMemberPosition = evaluateRuntimeControllerNumber(operation.memberPositionExpression, fighter.runtime, context);
    if (resolvedMemberPosition === undefined) return undefined;
    const memberPosition = Math.trunc(resolvedMemberPosition);
    if (memberPosition < 1) return undefined;
    const { memberPositionExpression: _memberPositionExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, memberPosition };
  }
  if (operation.partnerStateExpression !== undefined) {
    const resolvedPartnerState = evaluateRuntimeControllerNumber(operation.partnerStateExpression, fighter.runtime, context);
    if (resolvedPartnerState === undefined) return undefined;
    const stateNo = Math.trunc(resolvedPartnerState);
    if (stateNo < 0) return undefined;
    const { partnerStateExpression: _partnerStateExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, partnerStateNo: stateNo };
  }
  if (operation.callerControlExpression !== undefined) {
    const resolvedControl = evaluateRuntimeControllerNumber(operation.callerControlExpression, fighter.runtime, context);
    if (resolvedControl === undefined) return undefined;
    const { callerControlExpression: _callerControlExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, callerControl: resolvedControl !== 0 };
  }
  if (operation.partnerControlExpression !== undefined) {
    const resolvedPartnerControl = evaluateRuntimeControllerNumber(operation.partnerControlExpression, fighter.runtime, context);
    if (resolvedPartnerControl === undefined) return undefined;
    const { partnerControlExpression: _partnerControlExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, partnerControl: resolvedPartnerControl !== 0 };
  }
  if (operation.leaderPlayerNoExpression !== undefined) {
    const resolvedLeaderPlayerNo = evaluateRuntimeControllerNumber(operation.leaderPlayerNoExpression, fighter.runtime, context);
    if (resolvedLeaderPlayerNo === undefined) return undefined;
    const leaderPlayerNo = Math.trunc(resolvedLeaderPlayerNo);
    if (leaderPlayerNo < 1) return undefined;
    const { leaderPlayerNoExpression: _leaderPlayerNoExpression, ...staticOperation } = resolvedOperation;
    resolvedOperation = { ...staticOperation, leaderPlayerNo };
  }
  return resolvedOperation;
}

function hasAuthoredCallerControl(operation: TeamStandbyControllerOp): boolean {
  return operation.callerControl !== undefined || operation.callerControlExpression !== undefined;
}

function controllerIgnoresHitPause(controller: ControllerIr): boolean {
  return (firstNumber(findParam(controller, "ignorehitpause")) ?? 0) !== 0;
}

function runtimeControllerContext(
  fighter: FighterMatchState,
  owner: FighterMatchState,
  tick: number,
  stageBounds: MugenStageDefinition["bounds"],
  opponent?: FighterMatchState,
  gameSpace?: ExpressionGameSpace,
) {
  return controllerEvaluationContextWorld.create({
    actor: fighter,
    owner,
    opponent,
    root: fighter,
    target: opponent ? (targetId) => expressionContextWorld.resolveTargetRedirect(fighter, opponent, targetId) : undefined,
    stageBounds,
    gameSpace,
    localCoord: fighter.definition.localCoord,
    opponentLocalCoord: opponent?.definition.localCoord,
    rootLocalCoord: fighter.definition.localCoord,
    tick,
    getConst: (stateOwner, name) => runtimeDefinitionConst(stateOwner.definition, name),
    nextRandom: (actor) => nextRuntimeRandom(actor),
  });
}

function createAfterImageSample(fighter: FighterMatchState) {
  return afterImageSampleWorld.create({ actor: fighter, frame: getCurrentFrame(fighter) });
}

function canEnterState(target: FighterMatchState, stateId: number, owner: FighterMatchState = target): boolean {
  return stateEntryWorld.canEnterState(target, stateId, owner);
}

const {
  combatStateHooks: runtimeCombatStateHooks,
  helperStateHooks: runtimeHelperCombatStateHooks,
} = matchCombatStateHooksWorld.create<FighterMatchState>({
  canEnterState: (target, stateNo, stateOwner) => canEnterState(target, stateNo, stateOwner),
  enterState: (target, stateNo, options) => enterState(target, stateNo, undefined, options),
});

function resetContactState(fighter: FighterMatchState, state?: MugenStateDef): void {
  fighter.contact = fighter.contactWorld.createForStateEntry(fighter.contact, fighter.runtime.stateNo, {
    moveHit: Boolean(state?.moveHitPersist),
    hitCount: Boolean(state?.hitCountPersist),
  });
}

function advanceContactTimers(fighter: FighterMatchState): void {
  fighter.contactWorld.advance(fighter.contact);
}

function getRuntimeHurtBoxes(fighter: FighterMatchState): MugenAnimationFrame["clsn2"] | undefined {
  return frameWorld.currentFrame(fighter)?.clsn2;
}

function applyAutoGuardStart(
  defender: FighterMatchState,
  attacker: FighterMatchState,
  guardWorld: RuntimeGuardWorld,
): void {
  autoGuardStartWorld.apply({
    defender,
    attacker,
    guardWorld,
    hooks: {
      isInGuardDistance: (candidateDefender, candidateAttacker) =>
        isRuntimeInGuardDistLatched(candidateDefender, candidateAttacker),
      canEnterState: (candidateDefender, stateNo) => canEnterState(candidateDefender, stateNo),
      enterState: (candidateDefender, stateNo, options) => enterState(candidateDefender, stateNo, undefined, options),
    },
  });
}

function shouldPreserveImportedStateMoveType(fighter: FighterMatchState): boolean {
  if (fighter.definition.source !== "imported" && fighter.stateOwner?.definition.source !== "imported") {
    return false;
  }
  const owner = fighter.stateOwner ?? fighter;
  const state =
    owner.runtimeProgram?.states.find((candidate) => candidate.id === fighter.runtime.stateNo)?.source ??
    owner.definition.states?.find((candidate) => candidate.id === fighter.runtime.stateNo);
  return state?.moveType?.toUpperCase() === "H";
}

function evaluateRuntimeInGuardDist(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
): boolean {
  return isRuntimeInGuardDistLatched(fighter, opponent);
}

function refreshRuntimeInGuardDist(
  defender: FighterMatchState,
  attacker: FighterMatchState,
  guardDistanceWorld: RuntimeGuardDistanceWorld = defaultGuardDistanceWorld,
  tick = 0,
): void {
  const latch = guardDistanceWorld.refreshLatch({
    defender: {
      runtime: defender.runtime,
      hurtBoxes: frameWorld.currentHurtBoxes(defender),
    },
    attacker: {
      id: attacker.id,
      runtime: attacker.runtime,
      currentMove: attacker.currentMove,
      moveTick: attacker.moveTick,
      hasHit: attacker.hasHit,
    },
    projectiles: attacker.effectActorWorld.projectiles(attacker.id),
    tick,
  });
  if (latch) {
    defender.runtime.inGuardDist = latch;
  } else {
    delete defender.runtime.inGuardDist;
  }
}

function isRuntimeInGuardDistLatched(defender: FighterMatchState, attacker: FighterMatchState): boolean {
  return defender.runtime.inGuardDist?.attackerId === attacker.id;
}

function getCurrentFrame(fighter: FighterMatchState): MugenAnimationFrame | undefined {
  return frameWorld.currentFrame(fighter);
}

function tryApplyStateEntry(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
): boolean {
  return stateEntryRouteWorld.apply(fighter, opponent, tick, {
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(controller, actor, targetOpponent, owner, activeTick, stageBounds, gameSpace),
    resolveStateId: (dispatch, _controller, actor, targetOpponent, stageTime) =>
      resolveDispatchNumber(dispatch.stateId, dispatch.stateExpression, actor, targetOpponent, actor, stageBounds, stageTime, gameSpace),
    recordStateEntryRoute: (actor, controller, stateId) =>
      compatibilityTelemetryWorld.recordStateEntryRoute(actor, controller, stateId),
    startMove: (actor, move, label) => startMoveWithSpec(actor, move, label),
    enterState: (actor, stateId) => enterState(actor, stateId),
  }).applied;
}

function runStateEntrySetupControllers(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
): void {
  stateEntrySetupWorld.apply({
    actor: fighter,
    opponent,
    tick,
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(controller, actor, targetOpponent, owner, activeTick, stageBounds, gameSpace),
    executeController: (controller, actor, stageTime) => {
      controllerDispatchWorld.apply(actor, controller, {
        context: runtimeControllerContext(actor, actor, stageTime, stageBounds, opponent, gameSpace),
        recordController: (target, recordedController) => compatibilityTelemetryWorld.recordController(target, recordedController),
      });
      return actor.runtime;
    },
  });
}

function triggersPass(
  controller: ControllerIr,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageTime?: number,
  stageBounds?: MugenStageDefinition["bounds"],
  gameSpace?: ExpressionGameSpace,
): boolean {
  return triggerGateWorld.passes({
    controller,
    actor: fighter,
    opponent,
    owner,
    tick: stageTime,
    evaluateTrigger: (trigger, actor, targetOpponent, stateOwner, tick) =>
      evaluateRuntimeTrigger(trigger, actor, targetOpponent, stateOwner, tick, stageBounds, gameSpace),
  });
}

function resolveDispatchNumber(
  value: number | undefined,
  expression: string | undefined,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
  gameSpace?: ExpressionGameSpace,
): number | undefined {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace);
  return dispatchEvaluationWorld.resolveNumber({
    value,
    expression,
    actor: fighter,
    opponent,
    opponents: [opponent],
    owner,
    tick: stageTime,
    createContext,
  });
}

function resolveDispatchFloat(
  value: number | undefined,
  expression: string | undefined,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
  gameSpace?: ExpressionGameSpace,
): number | undefined {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace);
  return dispatchEvaluationWorld.resolveFloat({
    value,
    expression,
    actor: fighter,
    opponent,
    opponents: [opponent],
    owner,
    tick: stageTime,
    createContext,
  });
}

function resolveWidthPairParam(
  controller: ControllerIr,
  key: Parameters<RuntimeWidthResolver["resolvePair"]>[0],
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): ReturnType<RuntimeWidthResolver["resolvePair"]> {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  const [frontExpression, backExpression] = raw.split(",").map((part) => part.trim());
  if (!frontExpression) {
    return undefined;
  }
  const front = resolveDispatchNumber(undefined, frontExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (front === undefined) {
    return undefined;
  }
  if (!backExpression) {
    return [front];
  }
  const back = resolveDispatchNumber(undefined, backExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (back === undefined) {
    return undefined;
  }
  return [front, back];
}

function resolveDepthPairParam(
  controller: ControllerIr,
  key: Parameters<RuntimeDepthResolver["resolvePair"]>[0],
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): ReturnType<RuntimeDepthResolver["resolvePair"]> {
  const raw = findParam(controller, key);
  if (raw === undefined) return undefined;
  const [topExpression, bottomExpression] = raw.split(",").map((part) => part.trim());
  if (!topExpression) return undefined;
  const top = resolveDispatchNumber(undefined, topExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (top === undefined) return undefined;
  if (!bottomExpression) return [top];
  const bottom = resolveDispatchNumber(undefined, bottomExpression, fighter, opponent, owner, stageBounds, stageTime);
  return bottom === undefined ? undefined : [top, bottom];
}

function resolveRemapPalPairParam(
  controller: ControllerIr,
  key: "source" | "dest",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number] | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const [groupExpression, indexExpression] = raw.split(",").map((part) => part.trim());
  if (!groupExpression || !indexExpression) {
    return undefined;
  }
  const group = resolveDispatchNumber(undefined, groupExpression, fighter, opponent, owner, stageBounds, stageTime);
  const index = resolveDispatchNumber(undefined, indexExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (group === undefined || index === undefined) {
    return undefined;
  }
  return [group, index];
}

function resolveSpritePriorityParam(
  controller: ControllerIr,
  key: "value" | "priority",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveTransAlphaParam(
  controller: ControllerIr,
  key: "alpha",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number] | undefined {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  const [sourceExpression, destExpression] = raw.split(",").map((part) => part.trim());
  if (!sourceExpression || !destExpression) {
    return undefined;
  }
  const source = resolveDispatchNumber(undefined, sourceExpression, fighter, opponent, owner, stageBounds, stageTime);
  const dest = resolveDispatchNumber(undefined, destExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (source === undefined || dest === undefined) {
    return undefined;
  }
  return [source, dest];
}

function resolvePaletteFxNumberParam(
  controller: ControllerIr,
  key: "time" | "color" | "invertall" | "invert",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolvePaletteFxTripletParam(
  controller: ControllerIr,
  key: "add" | "mul",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number, number] | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const parts = raw.split(",").map((part) => part.trim());
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
    return undefined;
  }
  const values = parts
    .slice(0, 3)
    .map((part) => resolveDispatchNumber(undefined, part, fighter, opponent, owner, stageBounds, stageTime));
  return values.some((value) => value === undefined)
    ? undefined
    : [values[0]!, values[1]!, values[2]!];
}

function resolveAfterImageNumberParam(
  controller: ControllerIr,
  key: "time" | "length" | "timegap" | "framegap",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveAfterImageTimeParam(
  controller: ControllerIr,
  key: "time" | "value",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveAfterImageTripletParam(
  controller: ControllerIr,
  key: "paladd" | "palmul" | "add" | "mul",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number, number] | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const parts = raw.split(",").map((part) => part.trim());
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
    return undefined;
  }
  const values = parts
    .slice(0, 3)
    .map((part) => resolveDispatchNumber(undefined, part, fighter, opponent, owner, stageBounds, stageTime));
  return values.some((value) => value === undefined)
    ? undefined
    : [values[0]!, values[1]!, values[2]!];
}

function resolveAngleNumberParam(
  controller: ControllerIr,
  key: "value",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchFloat(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveAnglePairParam(
  controller: ControllerIr,
  key: "scale",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number] | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const [xExpression, yExpression] = raw.split(",").map((part) => part.trim());
  if (!xExpression || !yExpression) {
    return undefined;
  }
  const x = resolveDispatchFloat(undefined, xExpression, fighter, opponent, owner, stageBounds, stageTime);
  const y = resolveDispatchFloat(undefined, yExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (x === undefined || y === undefined) {
    return undefined;
  }
  return [x, y];
}

function resolveModifyProjectileNumberParam(
  controller: ControllerIr,
  key: RuntimeModifyProjectileNumberParam,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findModifyProjectileNumberRawParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveModifyProjectilePairParam(
  controller: ControllerIr,
  key: RuntimeModifyProjectilePairParam,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number] | undefined {
  const raw = findModifyProjectilePairRawParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return resolveModifyProjectileExpressionPair(raw, fighter, opponent, owner, stageBounds, stageTime);
}

function findModifyProjectileNumberRawParam(
  controller: ControllerIr,
  key: RuntimeModifyProjectileNumberParam,
): string | undefined {
  switch (key) {
    case "projid":
      return findParam(controller, "projid") ?? findParam(controller, "id");
    case "projremovetime":
      return findParam(controller, "projremovetime") ?? findParam(controller, "removetime");
    case "sprpriority":
      return findParam(controller, "sprpriority") ?? findParam(controller, "projsprpriority");
    case "projpriority":
      return findParam(controller, "projpriority") ?? findParam(controller, "priority");
    default:
      return findParam(controller, key);
  }
}

function findModifyProjectilePairRawParam(
  controller: ControllerIr,
  key: RuntimeModifyProjectilePairParam,
): string | undefined {
  switch (key) {
    case "velocity":
      return findParam(controller, "velocity") ?? findParam(controller, "vel");
    case "projscale":
      return findParam(controller, "projscale") ?? findParam(controller, "scale");
    default:
      return findParam(controller, key);
  }
}

function resolveModifyProjectileExpressionPair(
  raw: string,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number] | undefined {
  const splitIndices = topLevelCommaIndices(raw);
  if (splitIndices.length === 0) {
    const value = resolveDispatchNumber(undefined, raw.trim(), fighter, opponent, owner, stageBounds, stageTime);
    return value === undefined ? undefined : [value, value];
  }
  let best: { pair: [number, number]; maxCommaCount: number; balance: number; index: number } | undefined;
  for (const index of splitIndices) {
    const lowExpression = raw.slice(0, index).trim();
    const highExpression = raw.slice(index + 1).trim();
    if (!lowExpression || !highExpression) {
      continue;
    }
    const low = resolveDispatchNumber(undefined, lowExpression, fighter, opponent, owner, stageBounds, stageTime);
    const high = resolveDispatchNumber(undefined, highExpression, fighter, opponent, owner, stageBounds, stageTime);
    if (low !== undefined && high !== undefined) {
      const leftCommaCount = topLevelCommaIndices(lowExpression).length;
      const rightCommaCount = topLevelCommaIndices(highExpression).length;
      const candidate = {
        pair: [low, high] as [number, number],
        maxCommaCount: Math.max(leftCommaCount, rightCommaCount),
        balance: Math.abs(leftCommaCount - rightCommaCount),
        index,
      };
      if (
        !best ||
        candidate.maxCommaCount < best.maxCommaCount ||
        (candidate.maxCommaCount === best.maxCommaCount && candidate.balance < best.balance) ||
        (candidate.maxCommaCount === best.maxCommaCount && candidate.balance === best.balance && candidate.index > best.index)
      ) {
        best = candidate;
      }
    }
  }
  return best?.pair;
}

function topLevelCommaIndices(raw: string): number[] {
  const indices: number[] = [];
  let depth = 0;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (char === "," && depth === 0) {
      indices.push(index);
    }
  }
  return indices;
}

function resolveEnvShakeNumberParam(
  controller: ControllerIr,
  key: "time" | "ampl",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveEnvShakeFloatParam(
  controller: ControllerIr,
  key: "freq" | "phase",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchFloat(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveEnvColorNumberParam(
  controller: ControllerIr,
  key: "time" | "under",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveEnvColorTripletParam(
  controller: ControllerIr,
  key: "value",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): [number, number, number] | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const [rExpression, gExpression, bExpression] = raw.split(",").map((part) => part.trim());
  if (!rExpression || !gExpression || !bExpression) {
    return undefined;
  }
  const r = resolveDispatchNumber(undefined, rExpression, fighter, opponent, owner, stageBounds, stageTime);
  const g = resolveDispatchNumber(undefined, gExpression, fighter, opponent, owner, stageBounds, stageTime);
  const b = resolveDispatchNumber(undefined, bExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (r === undefined || g === undefined || b === undefined) {
    return undefined;
  }
  return [r, g, b];
}

function resolvePauseNumberParam(
  controller: MugenStateController,
  key: "time" | "movetime" | "pausebg" | "unhittable" | "darken" | "poweradd" | "p2defmul",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findControllerParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, raw.trim(), fighter, opponent, owner, stageBounds, stageTime);
}

function resolvePauseAnimActionNoParam(
  controller: MugenStateController,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = stripMugenString(findControllerParam(controller, "anim"));
  if (!raw || raw === "-1") {
    return undefined;
  }
  const expression = raw.toUpperCase().startsWith("S") ? raw.slice(1).trim() : raw;
  if (!expression) {
    return undefined;
  }
  return resolveDispatchNumber(undefined, expression, fighter, opponent, owner, stageBounds, stageTime);
}

function resolvePausePosParam(
  controller: MugenStateController,
  index: 0 | 1,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findControllerParam(controller, "pos");
  if (!raw) {
    return undefined;
  }
  const expression = raw.split(",")[index]?.trim();
  if (!expression) {
    return undefined;
  }
  return resolveDispatchFloat(undefined, expression, fighter, opponent, owner, stageBounds, stageTime);
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if ((first === `"` && last === `"`) || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function resolveAudioNumberParam(
  controller: ControllerIr,
  key: Parameters<RuntimeAudioParamResolver["resolveNumber"]>[0],
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): number | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  return resolveDispatchFloat(undefined, raw, fighter, opponent, owner, stageBounds, stageTime);
}

function resolveAudioSoundValueParam(
  controller: { params: Record<string, string> },
  key: "value" | "hitsound" | "guardsound" | "sound",
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): RuntimeResolvedSoundValue | undefined {
  const raw = findParam(controller, key);
  if (!raw) {
    return undefined;
  }
  const valueExpressions = splitAudioSoundValueExpressions(raw);
  if (!valueExpressions) {
    return undefined;
  }
  const [groupExpressionWithPrefix, indexExpression] = valueExpressions;
  if (!groupExpressionWithPrefix || !indexExpression) {
    return undefined;
  }
  const prefixMatch = /^([FS])\s*(.+)$/.exec(groupExpressionWithPrefix);
  const rawPrefix = prefixMatch?.[1]?.toUpperCase() as "F" | "S" | undefined;
  const groupExpression = prefixMatch?.[2]?.trim() ?? groupExpressionWithPrefix;
  if (!groupExpression) {
    return undefined;
  }
  const group = resolveDispatchNumber(undefined, groupExpression, fighter, opponent, owner, stageBounds, stageTime);
  const index = resolveDispatchNumber(undefined, indexExpression, fighter, opponent, owner, stageBounds, stageTime);
  if (group === undefined || index === undefined) {
    return undefined;
  }
  return { ...(rawPrefix ? { rawPrefix } : {}), group, index };
}

function splitAudioSoundValueExpressions(raw: string): [string, string] | undefined {
  let depth = 0;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (char === "," && depth === 0) {
      const groupExpression = raw.slice(0, index).trim();
      const indexExpression = raw.slice(index + 1).trim();
      return groupExpression && indexExpression ? [groupExpression, indexExpression] : undefined;
    }
  }
  return undefined;
}

function resolveDispatchBoolean(
  value: boolean | undefined,
  expression: string | undefined,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
  gameSpace?: ExpressionGameSpace,
): boolean | undefined {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace);
  return dispatchEvaluationWorld.resolveBoolean({
    value,
    expression,
    actor: fighter,
    opponent,
    opponents: [opponent],
    owner,
    tick: stageTime,
    createContext,
  });
}

function evaluateRuntimeTrigger(
  trigger: ControllerIr["triggers"][number],
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageTime?: number,
  stageBounds?: MugenStageDefinition["bounds"],
  gameSpace?: ExpressionGameSpace,
): boolean {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace);
  return triggerEvaluationWorld.passes({
    trigger,
    actor: fighter,
    opponent,
    opponents: [opponent],
    owner,
    tick: stageTime,
    createContext,
  });
}

function activeExpressionContextFactory(stageBounds?: MugenStageDefinition["bounds"], gameSpace?: ExpressionGameSpace) {
  return activeExpressionContextWorld.createFactory<FighterMatchState>({
    stageBounds,
    gameSpace: gameSpace ?? fallbackGameSpaceFromBounds(stageBounds),
    nextRandom: nextRuntimeRandom,
    animTimeRemaining: getAnimTimeRemaining,
    animElemTime: getAnimElemTime,
    inGuardDist: (actor, opponent) => evaluateRuntimeInGuardDist(actor, opponent),
  });
}

function fallbackGameSpaceFromBounds(stageBounds?: MugenStageDefinition["bounds"]): ExpressionGameSpace | undefined {
  if (!stageBounds) {
    return undefined;
  }
  return { width: Math.max(0, stageBounds.right - stageBounds.left), height: 480, zoom: 1 };
}


function getAnimTimeRemaining(fighter: FighterMatchState): number {
  return runtimeAnimationTimeRemaining(fighter);
}

function getAnimElemTime(fighter: FighterMatchState, elementNumber: number): number | undefined {
  return runtimeAnimationElementTime(fighter, elementNumber);
}

function findParam(controller: { params: Record<string, string> }, key: string): string | undefined {
  return findControllerParam(controller, key);
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}
