import type {
  AudioControllerOp,
  ControllerOp,
  EnvColorControllerOp,
  PauseControllerOp,
  TeamStandbyControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenCollisionBoxType } from "../model/CollisionBox";
import type { MugenStageDefinition } from "../model/MugenStage";
import type {
  MugenFightScreenAssets,
  MugenFightScreenResultDisplayDefinitions,
  MugenFightScreenTiming,
  MugenFightScreenWinTypeDefinitions,
} from "../model/MugenSystemAssets";
import {
  matchesMugenStateIdentity,
  type MugenStateController,
  type MugenStateDef,
  type MugenStateSpecial,
} from "../model/MugenState";
import {
  RuntimeActorConstraintControllerDispatchWorld,
  RuntimeActorConstraintWorld,
  type RuntimeDepthResolver,
  type RuntimeHeightResolver,
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
import { runtimeDefaultHitFlagForSource } from "./RuntimeHitFlagDefaults";
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
  applyRuntimeStateToHelper,
  applyRuntimeHelperTagStateControl,
  canAdvanceRuntimeHelper,
  hasRuntimeHelperState,
  helperTargetControllerRedirectExpression,
  helperTargetWorld,
  helperRuntimeState,
  runtimeHelperTargetActor,
  syncRuntimeHelperTargetActor,
  type RuntimeHelper,
  type RuntimeHelperTargetRedirect,
} from "./HelperSystem";
import { RuntimeHitStateTransitionWorld } from "./HitStateTransitionSystem";
import { RuntimeInputControlWorld, type RuntimeInputControlResult } from "./RuntimeInputControlSystem";
import {
  createRuntimeSocdInputState,
  resetRuntimeSocdInputState,
  resolveRuntimeSocdResolution,
  resolveRuntimeSocdInput,
  type RuntimeSocdInputState,
  type RuntimeSocdResolutionAuthority,
  type RuntimeSocdResolution,
} from "./RuntimeInput";
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
import { runtimeAffectTeamAllows, runtimeTeamSide, RuntimeTeamTopologyWorld, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
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
import { resetRuntimeIntroSkipActor } from "./RuntimeIntroSkipSystem";
import { RuntimeActiveControllerRunWorld } from "./RuntimeActiveControllerRunSystem";
import {
  RuntimeRootCnsExecutionWorld,
  type RuntimeRootCnsParticipation,
} from "./RuntimeRootCnsExecutionSystem";
import { RuntimeRootAdvancePhaseWorld, type RuntimeRootAdvancePhase } from "./RuntimeRootAdvancePhaseSystem";
import { RuntimeRootMotionAdvanceWorld } from "./RuntimeRootMotionAdvanceSystem";
import { RuntimeRootPresentationWorld } from "./RuntimeRootPresentationSystem";
import { RuntimeCollisionOverrideWorld, type RuntimeCollisionOverrideResolver } from "./RuntimeCollisionOverrideSystem";
import { resolveRuntimePushSizeBox, RuntimeRootBodyPushWorld, type RuntimeRootBodyPushDiagnostic, usesMugenPlayerPushMinimumWidth } from "./RuntimeRootBodyPushSystem";
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
import {
  RuntimeRoundSystem,
  type RuntimeRoundParticipant,
  type RuntimeRoundTiming,
} from "./RuntimeRoundSystem";
import { resolveRuntimeRoundAnnouncementTiming } from "./RuntimeRoundAnnouncementSystem";
import {
  resolveFightScreenAnimationCompletion,
  resolveFightScreenAnnouncementCompletion,
} from "./FightScreenAnimationSemantics";
import {
  RuntimeRoundResourceResetWorld,
  type RuntimeRoundResourceActor,
  type RuntimeRoundResourceResetResult,
} from "./RuntimeRoundResourceResetSystem";
import {
  RuntimeMatchOutcomeSystem,
  type RuntimeMatchOutcomeProjection,
  type RuntimeMatchOutcomeResult,
} from "./RuntimeMatchOutcomeSystem";
import {
  RUNTIME_ROUND_STATE_5900,
  RuntimeRoundState5900World,
  type RuntimeRoundState5900Snapshot,
} from "./RuntimeRoundState5900System";
import {
  RuntimeRoundContextWorld,
  type RuntimeRoundContextSnapshot,
} from "./RuntimeRoundContextSystem";
import {
  RuntimeRoundWinPoseWorld,
  type RuntimeRoundWinPoseSnapshot,
} from "./RuntimeRoundWinPoseSystem";
import {
  RuntimeTurnsContinuationWorld,
  type RuntimeTurnsContinuationResult,
} from "./RuntimeTurnsContinuationSystem";
import { nextRuntimeRandomUnit } from "./RuntimeRandomSystem";
import type { RuntimeModifyProjectileNumberParam, RuntimeModifyProjectilePairParam } from "./ProjectileSystem";
import {
  applyRuntimeControl,
  applyRuntimePowerDelta,
  resolveRuntimeResourceControllerOperation,
} from "./RuntimeResourceSystem";
import { recordRuntimeRootSelfKoCause, recordRuntimeTargetLifeKoCause } from "./RuntimeRoundWinTypeSystem";
import { RuntimeSnapshotWorld } from "./RuntimeSnapshotSystem";
import { RuntimeOrientationWorld } from "./OrientationSystem";
import { RuntimeRecoverySystem } from "./RuntimeRecoverySystem";
import { RuntimeHitEligibilityWorld } from "./RuntimeHitEligibilitySystem";
import { RuntimeAssertSpecialWorld } from "./RuntimeAssertSpecialSystem";
import { RuntimeCompatibilityTelemetryWorld } from "./RuntimeCompatibilityTelemetrySystem";
import {
  type RuntimeTeamRoundDecision,
  type RuntimeTeamRoundMode,
} from "./RuntimeTeamRoundDecisionSystem";
import { RuntimeTeamRoundLifebarWorld } from "./RuntimeTeamRoundLifebarSystem";
import {
  RuntimeAuxiliaryResourceProjectionWorld,
  type RuntimeAuxiliaryResourceProjectionInputActor,
} from "./RuntimeAuxiliaryResourceProjectionSystem";
import {
  RuntimeTeamResourceBankRuntime,
  RuntimeTeamResourceBankWorld,
  type RuntimeTeamResourceBankActor,
  type RuntimeTeamResourceBankRuntimeActor,
} from "./RuntimeTeamResourceBankSystem";
import {
  RuntimeRedLifeShareRuntime,
  RuntimeRedLifeShareWorld,
  type RuntimeRedLifeShareActor,
  type RuntimeRedLifeShareRuntimeActor,
} from "./RuntimeRedLifeShareSystem";
import type {
  RuntimeTeamRoundHandoffActor,
  RuntimeTeamRoundHandoffResult,
} from "./RuntimeTeamRoundHandoffSystem";
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
import { hasRuntimeStun, RuntimeStunWorld, tickRuntimeGuardStun } from "./RuntimeStunSystem";
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
  type RuntimeTargetControllerDispatchSelection,
  type RuntimeTargetWorldActor,
} from "./TargetSystem";
import {
  RuntimeRedirectedTargetDispatchWorld,
  createRuntimeRedirectedTargetDispatchObservation,
  type RuntimeRedirectedTargetDispatchLease,
  type RuntimeRedirectedTargetDispatchPhase,
} from "./RuntimeRedirectedTargetDispatchSystem";
import { RuntimeTargetStateEntryWorld } from "./RuntimeTargetStateEntrySystem";
import { RuntimeTriggerEvaluationWorld } from "./RuntimeTriggerEvaluationSystem";
import { RuntimeTriggerGateWorld } from "./RuntimeTriggerGateSystem";
import { RuntimeAfterImageSampleWorld } from "./RuntimeAfterImageSampleSystem";
import { trainingStage } from "./demoStage";
import type {
  CharacterRuntimeState,
  MugenSnapshot,
  RoundSnapshot,
  RuntimeRoundOutcomeTiming,
  RuntimeRedirectedTargetDispatchWriteback,
} from "./types";
import type { ExpressionGameSpace, ExpressionRedirectTarget } from "./ExpressionEvaluator";

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
const collisionOverrideWorld = new RuntimeCollisionOverrideWorld();
const animationChangeWorld = new RuntimeAnimationWorld();
const fighterStateWorld = new RuntimeFighterStateWorld();
const characterIdentityWorld = new RuntimeCharacterIdentityWorld();
const spriteEffectControllerWorld = new RuntimeSpriteEffectControllerWorld();
const targetStateEntryWorld = new RuntimeTargetStateEntryWorld();
const actorConstraintControllerDispatchWorld = new RuntimeActorConstraintControllerDispatchWorld();
const targetControllerDispatchWorld = new RuntimeTargetControllerDispatchWorld();
const redirectedTargetDispatchWorld = new RuntimeRedirectedTargetDispatchWorld();
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
const teamRoundLifebarWorld = new RuntimeTeamRoundLifebarWorld();
const teamResourceBankWorld = new RuntimeTeamResourceBankWorld();
const redLifeShareWorld = new RuntimeRedLifeShareWorld();
const auxiliaryResourceProjectionWorld = new RuntimeAuxiliaryResourceProjectionWorld();

export type MatchInput = {
  p1: Set<string>;
  p2?: Set<string>;
};

export type MatchRuntimeCommand =
  | { type: "set-playing"; playing: boolean }
  | { type: "set-speed"; speed: number }
  | { type: "toggle"; key: "showClsn1" | "showClsn2" | "showAxis" | "showGrid"; value: boolean }
  | { type: "set-root-standby"; changes: readonly RuntimeRootStandbyChange[] }
  | { type: "set-match-max-draws"; side: RuntimeTeamSide; count: number }
  | { type: "set-match-wins"; side: RuntimeTeamSide; count: number }
  | { type: "skip-intro" }
  | { type: "next-round" }
  | { type: "reset" };

export type RuntimeNextRoundResult = RuntimeRoundResourceResetResult & {
  applied: boolean;
  matchOutcome: RuntimeMatchOutcomeResult;
  roundContext: RuntimeRoundContextSnapshot;
  state5900: RuntimeRoundState5900Snapshot;
};

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
  roundTiming?: Partial<RuntimeRoundTiming>;
  matchWins?: number;
  maxDraws?: number;
  maxDrawsBySide?: Partial<Record<RuntimeTeamSide, number>>;
  runtimeProfile?: RuntimeCompatibilityProfile;
  socdResolution?: RuntimeSocdResolution;
  superPauseTargetDefenseValue?: number;
  reserveFighters?: readonly DemoFighterDefinition[];
  teamMode?: RuntimeTeamRoundMode;
  teamLifeShare?: boolean;
  teamPowerShare?: boolean;
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
type RootControllerRedirectHandler = (
  caller: FighterMatchState,
  expression: string,
  context: ReturnType<typeof runtimeControllerContext>,
  controllerType:
    | "depth"
    | "height"
    | "overrideclsn"
    | "screenbound"
    | "playerpush"
    | RedirectableTargetControllerType
    | RedirectableResourceControllerType
    | RedirectableEffectControllerType,
) => FighterMatchState | undefined;
type RootTargetDispatchLeaseHandler = (
  caller: FighterMatchState,
  expression: string,
  context: ReturnType<typeof runtimeControllerContext>,
  controllerType:
    | RedirectableTargetControllerType
    | RedirectableResourceControllerType
    | RedirectableEffectControllerType,
  phase: Extract<RuntimeRedirectedTargetDispatchPhase, "root-active" | "root-state-minus-one">,
  candidateTargets: readonly FighterMatchState[],
) => RuntimeRedirectedTargetDispatchLease<FighterMatchState> | undefined;
type RedirectableResourceControllerType =
  | "ctrlset"
  | "lifeadd"
  | "lifeset"
  | "guardpointsadd"
  | "guardpointsset"
  | "dizzypointsadd"
  | "dizzypointsset"
  | "redlifeadd"
  | "redlifeset"
  | "poweradd"
  | "powerset";
type RedirectableEffectControllerType = "projectile" | "modifyprojectile";
type RedirectableTargetControllerType =
  | "targetlifeadd"
  | "targetredlifeadd"
  | "targetguardpointsadd"
  | "targetdizzypointsadd"
  | "targetpoweradd"
  | "targetfacing"
  | "targetdrop"
  | "targetbind"
  | "targetstate"
  | "targetveladd"
  | "targetvelset"
  | "bindtotarget";
type PlayerIdTargetResolver = (
  caller: FighterMatchState,
  playerId: number,
) => ExpressionRedirectTarget | undefined;
type PlayerIdExpressionTarget = (playerId: number) => ExpressionRedirectTarget | undefined;

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
  private stageRoundStartTick = 0;
  private frameClock = 0;
  private playing = true;
  private speed = 1;
  private readonly round: RuntimeRoundSystem;
  private readonly roundTimerFrames?: number;
  private readonly logs: string[] = [];
  private readonly p1: FighterMatchState;
  private readonly p2: FighterMatchState;
  private readonly reserveRoots: FighterMatchState[];
  private activeRoots!: [FighterMatchState, FighterMatchState];
  private turnsContinuationActive = false;
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
  private readonly deferredInputControls = new Map<FighterMatchState, () => RuntimeInputControlResult>();
  private readonly kinematicsWorld = new RuntimeKinematicsWorld();
  private readonly animationWorld = new RuntimeAnimationWorld();
  private readonly stunWorld = new RuntimeStunWorld();
  private readonly pausedMatchWorld = new RuntimePausedMatchWorld();
  private readonly snapshotWorld = new RuntimeSnapshotWorld();
  private lastTickSchedule = createIdleMatchTickSchedule();
  private lastRootBodyPush?: RuntimeRootBodyPushDiagnostic;
  private lastRootHitAdmission?: RuntimeRootDirectHitAdmissionDiagnostic;
  private readonly matchResetWorld = new RuntimeMatchResetWorld();
  private readonly teamResourceBankRuntime = new RuntimeTeamResourceBankRuntime();
  private readonly redLifeShareRuntime = new RuntimeRedLifeShareRuntime();
  private readonly roundResourceResetWorld = new RuntimeRoundResourceResetWorld();
  private readonly matchOutcome: RuntimeMatchOutcomeSystem;
  private readonly roundState5900World = new RuntimeRoundState5900World();
  private readonly roundContextWorld = new RuntimeRoundContextWorld();
  private readonly roundWinPoseWorld = new RuntimeRoundWinPoseWorld();
  private readonly turnsContinuationWorld = new RuntimeTurnsContinuationWorld();
  private lastRoundContext: RuntimeRoundContextSnapshot;
  private lastRoundState5900?: RuntimeRoundState5900Snapshot;
  private lastTurnsContinuation?: RuntimeTurnsContinuationResult;
  private readonly runtimeProfile: RuntimeCompatibilityProfile;
  private readonly socdResolution: RuntimeSocdResolution;
  private readonly socdResolutionAuthority: RuntimeSocdResolutionAuthority;
  private readonly socdInputState: { p1: RuntimeSocdInputState; p2: RuntimeSocdInputState } = {
    p1: createRuntimeSocdInputState(),
    p2: createRuntimeSocdInputState(),
  };
  private readonly previousIntroSkipInputs: { p1: Set<string>; p2: Set<string> } = {
    p1: new Set(),
    p2: new Set(),
  };
  private readonly teamRoundMode: RuntimeTeamRoundMode;
  private readonly teamLifeShare: boolean;
  private readonly teamPowerShare: boolean;
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
    this.socdResolutionAuthority = resolveRuntimeSocdResolution({
      profile: this.runtimeProfile,
      runtimeOption: options.socdResolution,
      p1Package: p1Definition.socdResolution,
      p2Package: p2Definition.socdResolution,
    });
    this.socdResolution = this.socdResolutionAuthority.resolution;
    this.teamRoundMode = options.teamMode ?? "single";
    this.teamLifeShare = options.teamLifeShare === true;
    this.teamPowerShare = options.teamPowerShare === true;
    this.superPauseTargetDefenseValue = defaultSuperPauseTargetDefenseValue(
      this.runtimeProfile,
      options.superPauseTargetDefenseValue,
    );
    this.pauseWorld = new RuntimePauseWorld(this.runtimeProfile);
    this.roundTimerFrames = options.roundTimerFrames;
    const fightScreenDefinition = p1Definition.fightScreenTiming ? p1Definition : p2Definition;
    const roundTiming = options.roundTiming ?? runtimeRoundTimingFromFightScreen(
      fightScreenDefinition.fightScreenTiming,
      fightScreenDefinition.fightScreenAssets,
    );
    this.round = new RuntimeRoundSystem(options.roundTimerFrames, this.runtimeProfile, roundTiming);
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
    const turnsMatchWinsBySide = this.teamRoundMode === "turns"
      ? deriveTurnsMatchWinsBySide([this.p1, this.p2, ...this.reserveRoots])
      : undefined;
    const configuredMaxDrawsBySide = options.maxDrawsBySide ?? (options.maxDraws === undefined
      ? undefined
      : { 1: options.maxDraws, 2: options.maxDraws });
    this.matchOutcome = new RuntimeMatchOutcomeSystem(
      this.teamRoundMode,
      turnsMatchWinsBySide === undefined
        ? options.matchWins
        : Math.max(turnsMatchWinsBySide[1], turnsMatchWinsBySide[2]),
      turnsMatchWinsBySide,
      configuredMaxDrawsBySide,
    );
    this.activeRoots = [this.p1, this.p2];
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
      this.runtimeProfile === "ikemen-go" && this.teamRoundMode === "tag" ? "tag" : "single",
    );
    this.lastRoundContext = this.roundContextWorld.reset(this.characterRoots().map(({ id }) => ({ id })));
    this.applyRoundContext(this.lastRoundContext);
    this.applyRuntimeRoundPhase();
    this.resetTeamResourceBanks();
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
    for (const helper of this.characterRoots().flatMap((root) => this.effectActorWorld.helpers(root.id))) {
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

  private resolvePlayerIdTarget(caller: FighterMatchState, playerId: number): ExpressionRedirectTarget | undefined {
    if (this.runtimeProfile !== "ikemen-go") return undefined;
    const identity = this.characterIdentity?.findByPlayerId(playerId);
    return identity?.fighter
      ? expressionContextWorld.resolvePlayerIdRedirect(caller, this.characterRoots(), playerId)
      : undefined;
  }

  private resolveRootTargetDispatchLease(
    caller: FighterMatchState,
    expression: string,
    context: ReturnType<typeof runtimeControllerContext>,
    controllerType:
      | RedirectableTargetControllerType
      | RedirectableResourceControllerType
      | RedirectableEffectControllerType,
    phase: Extract<RuntimeRedirectedTargetDispatchPhase, "root-active" | "root-state-minus-one">,
    candidateTargets: readonly FighterMatchState[],
  ): RuntimeRedirectedTargetDispatchLease<FighterMatchState> | undefined {
    const block = (playerId: number | "invalid"): undefined => {
      this.logs.unshift(`Blocked ${controllerType} RedirectID ${playerId} for ${caller.id}`);
      return undefined;
    };
    if (this.runtimeProfile !== "ikemen-go") return block("invalid");
    const resolved = evaluateRuntimeControllerNumber(expression, caller.runtime, context);
    const playerId = resolved === undefined ? undefined : Math.trunc(resolved);
    if (playerId === undefined || playerId < 0) return block(playerId ?? "invalid");
    const identity = this.characterIdentity?.findByPlayerId(playerId);
    const destination = identity?.fighter
      ? this.characterRoots().find((root) => root.id === identity.fighter!.id)
      : undefined;
    if (!destination) return block(playerId);
    const destinationRevision = `${playerId}:${destination.id}`;
    const resolveCurrentDestination = (): FighterMatchState | undefined => {
      const currentIdentity = this.characterIdentity?.findByPlayerId(playerId);
      return currentIdentity?.fighter
        ? this.characterRoots().find((root) => root.id === currentIdentity.fighter!.id)
        : undefined;
    };
    const resolution = redirectedTargetDispatchWorld.resolveResult({
      phase,
      callerId: caller.id,
      redirectExpression: expression,
      redirectPlayerId: playerId,
      destination,
      candidateTargets,
      targetWorld: destination.targetWorld,
      stateOwnerId: destination.stateOwner?.id ?? destination.id,
      destinationRevision,
      destinationGeneration: destinationRevision,
      resolveCurrentDestination,
      resolveCurrentDestinationGeneration: () => {
        const currentDestination = resolveCurrentDestination();
        return currentDestination ? `${playerId}:${currentDestination.id}` : undefined;
      },
    });
    return resolution.kind === "resolved" ? resolution.lease : block(resolution.failure.redirectPlayerId);
  }

  private resolveHelperTargetRedirect(
    helper: RuntimeHelper,
    playerId: number,
    controller: ControllerIr,
    candidateProjection?: readonly RuntimeTargetWorldActor[],
  ): RuntimeHelperTargetRedirect | undefined {
    if (this.runtimeProfile !== "ikemen-go") return undefined;
    if (!this.verifiedRootForHelper(helper)) return undefined;
    const redirectExpression = helperTargetControllerRedirectExpression(controller);
    if (redirectExpression === undefined) return undefined;
    const identity = this.characterIdentity?.findByPlayerId(playerId);
    const roots = this.characterRoots();
    const helperEntries = roots
      .flatMap((root) => this.effectActorWorld.helpers(root.id))
      .filter((helper) => helper.destroyed !== true && helper.teamState?.disabled !== true)
      .map((helper) => ({ helper, actor: runtimeHelperTargetActor(helper) }));
    const helperById = new Map(helperEntries.map((entry) => [entry.helper.serialId, entry]));
    const destinationRoot = identity?.fighter
      ? roots.find((root) => root.id === identity.fighter!.id)
      : undefined;
    const destinationHelper = identity?.helper
      ? helperById.get(identity.helper.serialId)?.helper
      : undefined;
    const target = destinationRoot ?? (destinationHelper ? runtimeHelperTargetActor(destinationHelper) : undefined);
    const destinationStateOwner = destinationRoot?.stateOwner
      ?? (destinationHelper ? roots.find((root) => root.id === destinationHelper.rootId) : undefined)
      ?? destinationRoot;
    const findCurrentHelper = (serialId: string): RuntimeHelper | undefined => this.characterRoots()
      .flatMap((root) => this.effectActorWorld.helpers(root.id))
      .filter((candidate) => candidate.destroyed !== true && candidate.teamState?.disabled !== true)
      .find((candidate) => candidate.serialId === serialId);
    const resolveCurrentDestination = (): RuntimeTargetWorldActor | undefined => {
      const currentIdentity = this.characterIdentity?.findByPlayerId(playerId);
      if (currentIdentity?.fighter) {
        return this.characterRoots().find((root) => root.id === currentIdentity.fighter!.id);
      }
      if (currentIdentity?.helper) {
        const currentHelper = findCurrentHelper(currentIdentity.helper.serialId);
        return currentHelper === destinationHelper ? target : undefined;
      }
      return undefined;
    };
    if (!target) return undefined;
    if (identity?.helper && !destinationStateOwner) return undefined;
    const candidateTargets = candidateProjection
      ? [...candidateProjection]
      : [...roots, ...helperEntries.map((entry) => entry.actor)];
    const canEnterTargetState = controller.normalizedType === "targetstate"
      ? (selectedTarget: RuntimeTargetWorldActor, stateId: number): boolean => {
          const selectedRoot = roots.find((root) => root.id === selectedTarget.id);
          return selectedRoot !== undefined && destinationStateOwner !== undefined
            ? canEnterState(selectedRoot, stateId, destinationStateOwner)
            : false;
        }
      : undefined;
    const destinationRevision = `${playerId}:${target.id}`;
    const resolution = redirectedTargetDispatchWorld.resolveResult<RuntimeTargetWorldActor>({
      phase: "helper",
      callerId: helper.serialId,
      redirectExpression,
      redirectPlayerId: playerId,
      destination: target,
      candidateTargets,
      targetWorld: destinationRoot?.targetWorld ?? helperTargetWorld,
      stateOwnerId: destinationStateOwner?.id ?? target.id,
      destinationRevision,
      destinationGeneration: destinationRevision,
      resolveCurrentDestination,
      resolveCurrentDestinationGeneration: () => {
        const currentDestination = resolveCurrentDestination();
        return currentDestination ? `${playerId}:${currentDestination.id}` : undefined;
      },
    });
    if (resolution.kind === "rejected") return undefined;
    const lease = resolution.lease;
    return {
      actor: target,
      candidateTargets,
      ...(destinationStateOwner === undefined ? {} : { stateOwner: destinationStateOwner }),
      ...(canEnterTargetState === undefined ? {} : { canEnterTargetState }),
      lease,
      commitActor: (actor) => {
        const targetHelper = helperById.get(actor.id)?.helper;
        if (!targetHelper) return;
        applyRuntimeStateToHelper(targetHelper, actor.runtime);
        syncRuntimeHelperTargetActor(targetHelper, actor);
      },
    };
  }

  private resolveHelperResourceRedirect(
    helper: RuntimeHelper,
    playerId: number,
    controller: ControllerIr,
  ): RuntimeHelperTargetRedirect | undefined {
    return this.resolveHelperTargetRedirect(helper, playerId, controller, []);
  }

  private rootForRedirectedTarget(target: RuntimeHelperTargetRedirect["actor"]): FighterMatchState | undefined {
    const root = this.characterRoots().find((candidate) => candidate.id === target.id);
    if (root) return root;
    const helper = this.characterRoots()
      .flatMap((candidate) => this.effectActorWorld.helpers(candidate.id))
      .find((candidate) => candidate.serialId === target.id);
    return helper ? this.rootForHelper(helper) : undefined;
  }

  private recordHelperRedirectedController(
    target: RuntimeHelperTargetRedirect["actor"],
    controller: MugenStateController,
  ): void {
    const root = this.rootForRedirectedTarget(target);
    if (root) compatibilityTelemetryWorld.recordController(root, controller);
  }

  private recordHelperRedirectedOperation(
    helper: RuntimeHelper,
    target: RuntimeHelperTargetRedirect["actor"],
    operation: ControllerOp,
    lifeBefore?: number,
  ): void {
    const root = this.rootForRedirectedTarget(target);
    if (root) compatibilityTelemetryWorld.recordOperation(root, operation);
    if (
      lifeBefore === undefined ||
      operation.kind !== "resource" ||
      (operation.controllerType !== "lifeadd" && operation.controllerType !== "lifeset") ||
      target.id !== root?.id
    ) {
      return;
    }
    const callerRoot = this.verifiedRootForHelper(helper);
    if (!callerRoot || callerRoot.id !== root.id) return;
    recordRuntimeRootSelfKoCause(
      root,
      this.opponentForRoot(root),
      lifeBefore,
      root.stateOwner?.id ?? root.id,
    );
  }

  private verifiedRootForHelper(helper: RuntimeHelper): FighterMatchState | undefined {
    const root = this.characterRoots().find((candidate) => candidate.id === helper.rootId);
    if (!root || helper.playerNo === undefined || root.playerNo === undefined || root.playerId === undefined) {
      return undefined;
    }
    const helpers = this.characterRoots().flatMap((candidate) => this.effectActorWorld.helpers(candidate.id));
    const helperById = new Map(helpers.map((candidate) => [candidate.serialId, candidate]));
    let current: RuntimeHelper | undefined = helperById.get(helper.serialId);
    const visited = new Set<string>();
    while (current) {
      if (
        visited.has(current.serialId) ||
        current.rootId !== root.id ||
        current.playerNo !== root.playerNo ||
        current.rootPlayerNo !== root.playerNo ||
        current.rootPlayerId !== root.playerId ||
        current.parentPlayerNo !== root.playerNo ||
        current.parentPlayerId !== this.characterIdentity?.playerIdFor(current.parentId)
      ) {
        return undefined;
      }
      visited.add(current.serialId);
      if (current.parentId === root.id) return root;
      current = helperById.get(current.parentId);
    }
    return undefined;
  }

  private verifiedRootForTargetActor(target: RuntimeTargetWorldActor): FighterMatchState | undefined {
    const root = this.characterRoots().find((candidate) => candidate.id === target.id);
    if (root) return root;
    const helper = this.characterRoots()
      .flatMap((candidate) => this.effectActorWorld.helpers(candidate.id))
      .find((candidate) => candidate.serialId === target.id);
    return helper ? this.verifiedRootForHelper(helper) : undefined;
  }

  private recordHelperTargetLifeKoCause(
    helper: RuntimeHelper,
    sourceActor: RuntimeTargetWorldActor,
    targetActor: RuntimeTargetWorldActor,
    lifeBefore: number,
  ): void {
    if (!this.verifiedRootForHelper(helper)) return;
    const sourceIsRoot = this.characterRoots().some((candidate) => candidate.id === sourceActor.id);
    const sourceIsLocalHelper = sourceActor.id === helper.serialId;
    if (!sourceIsRoot && !sourceIsLocalHelper) return;
    const sourceRoot = this.verifiedRootForTargetActor(sourceActor);
    const victimRoot = this.characterRoots().find((candidate) => candidate.id === targetActor.id);
    if (!sourceRoot || !victimRoot) return;
    recordRuntimeTargetLifeKoCause(
      victimRoot,
      this.opponentForRoot(victimRoot),
      lifeBefore,
      sourceRoot.id,
    );
  }

  private recordHelperRedirectedTargetDispatch(
    helper: RuntimeHelper,
    target: RuntimeTargetWorldActor,
    selection: RuntimeTargetControllerDispatchSelection,
    redirectPlayerId: number,
    redirectExpression: string,
    writeback: RuntimeRedirectedTargetDispatchWriteback,
    destinationRevision?: string,
  ): void {
    const callerRoot = this.runtimeProfile === "ikemen-go"
      ? this.verifiedRootForHelper(helper)
      : this.rootForHelper(helper);
    if (!callerRoot) return;
    const destinationRoot = this.characterRoots().find((candidate) => candidate.id === target.id);
    const stateOwner = selection.controllerType === "targetstate" ? this.rootForRedirectedTarget(target) : destinationRoot;
    compatibilityTelemetryWorld.recordRedirectedTargetDispatch(
      callerRoot,
      createRuntimeRedirectedTargetDispatchObservation(selection, {
        route: destinationRoot ? "helper-to-root" : "helper-to-helper",
        callerId: helper.serialId,
        destinationId: target.id,
        stateOwnerId: stateOwner?.stateOwner?.id ?? stateOwner?.id ?? target.id,
        ...(destinationRevision === undefined ? {} : { destinationRevision }),
        redirectExpression,
        redirectPlayerId,
        writebackActorIds: writeback.actorIds,
        writebackMode: writeback.mode,
        ...(helper.stateNo === undefined ? {} : { sourceStateNo: helper.stateNo }),
      }),
    );
  }

  private characterRoots(): FighterMatchState[] {
    return [this.p1, this.p2, ...this.reserveRoots];
  }

  private applyIntroSkipReset(): void {
    const roots = this.characterRoots();
    for (const root of roots) this.effectActorWorld.resetOwner(root.id);
    for (const root of roots) {
      const start = root.id === "p1" || /p[357]$/.test(root.id)
        ? this.stage.playerStart.p1
        : this.stage.playerStart.p2;
      resetRuntimeIntroSkipActor(root, start);
      enterState(root, 0, undefined, {
        clearStateOwner: true,
        animOverride: root.definition.idleAction,
      });
    }
    if (this.runtimeProfile === "ikemen-go") {
      this.initializeCharacterIdentity();
    }
    this.attachHelperHandlers();
    this.logs.unshift(`Intro skip reset ${roots.length} actors`);
  }

  private activePair(): [FighterMatchState, FighterMatchState] {
    return this.activeRoots;
  }

  private teamGameplayActive(): boolean {
    return this.tagTeamOrder !== undefined || this.turnsContinuationActive;
  }

  private teamPresentationMode(): "single" | "tag" {
    return this.teamGameplayActive() ? "tag" : "single";
  }

  private inactiveRoots(): FighterMatchState[] {
    const active = new Set(this.activeRoots);
    return this.characterRoots().filter((root) => !active.has(root));
  }

  private teamRoundActors(): RuntimeTeamRoundHandoffActor[] {
    return this.characterRoots().map((root) => {
      const side = runtimeTeamSide(root);
      const teamState = root.runtime.teamState;
      if (side === undefined || !teamState) {
        throw new Error(`Team round root ${root.id} has no valid team state`);
      }
      const memberNo = root.playerNo === undefined ? undefined : Math.floor((root.playerNo - 1) / 2);
      return {
        id: root.id,
        side,
        life: root.runtime.life,
        disabled: teamState.disabled,
        standby: teamState.standby,
        overKo: teamState.overKo,
        playerType: teamState.playerType,
        replacementEligible: this.teamRoundMode === "turns" &&
          root !== this.p1 &&
          root !== this.p2 &&
          teamState.standby === true,
        ...(memberNo === undefined ? {} : { memberNo }),
        teamState,
      } satisfies RuntimeTeamRoundHandoffActor;
    });
  }

  private teamRoundOutcomeParticipants(): RuntimeRoundParticipant[] {
    return this.characterRoots().flatMap((root) => {
      const side = runtimeTeamSide(root);
      if (side === undefined) return [];
      return [{
        label: root.label,
        life: root.runtime.life,
        lifeMax: root.runtime.lifeMax,
        side: side === 1 ? 0 : 1,
        ...(root.runtime.roundWinType === undefined ? {} : { winType: root.runtime.roundWinType }),
      }];
    });
  }

  private syncTurnsActiveRoots(): boolean {
    const next = ([1, 2] as const).map((side) => {
      const candidates = this.characterRoots()
        .filter((root) => runtimeTeamSide(root) === side)
        .filter((root) => {
          const teamState = root.runtime.teamState;
          return teamState?.playerType && !teamState.disabled && !teamState.standby && !teamState.overKo;
        })
        .sort((left, right) => (left.playerNo ?? Number.MAX_SAFE_INTEGER) - (right.playerNo ?? Number.MAX_SAFE_INTEGER));
      return candidates[0];
    }) as [FighterMatchState | undefined, FighterMatchState | undefined];
    if (!next[0] || !next[1]) return false;
    this.activeRoots = [next[0], next[1]];
    this.turnsContinuationActive = true;
    return true;
  }

  private teamRoundLifebarActors() {
    return this.characterRoots().map((root) => {
      const side = runtimeTeamSide(root);
      const teamState = root.runtime.teamState;
      if (side === undefined || !teamState) {
        throw new Error(`Team lifebar root ${root.id} has no valid team state`);
      }
      const memberNo = root.playerNo === undefined ? undefined : Math.floor((root.playerNo - 1) / 2);
      return {
        id: root.id,
        label: root.label,
        side,
        life: root.runtime.life,
        lifeMax: root.runtime.lifeMax ?? 1000,
        redLife: root.runtime.redLife ?? 0,
        ...(memberNo === undefined ? {} : { memberNo }),
        teamState,
      };
    });
  }

  private teamResourceBankActors() {
    return this.characterRoots().map((root) => this.teamResourceBankActor(root));
  }

  private teamResourceBankRuntimeActors(): RuntimeTeamResourceBankRuntimeActor[] {
    return this.characterRoots().map((root) => ({
      ...this.teamResourceBankActor(root),
      runtime: root.runtime,
    }));
  }

  private teamResourceBankActor(root: FighterMatchState): RuntimeTeamResourceBankActor {
    const side = runtimeTeamSide(root);
    const teamState = root.runtime.teamState;
    if (side === undefined || !teamState) {
      throw new Error(`Team resource root ${root.id} has no valid team state`);
    }
    const memberNo = root.playerNo === undefined ? undefined : Math.floor((root.playerNo - 1) / 2);
    return {
      id: root.id,
      side,
      life: root.runtime.life,
      lifeMax: root.runtime.lifeMax,
      power: root.runtime.power,
      powerMax: root.runtime.powerMax,
      ...(memberNo === undefined ? {} : { memberNo }),
      teamState,
    } satisfies RuntimeTeamResourceBankActor;
  }

  private redLifeShareRuntimeActors(): RuntimeRedLifeShareRuntimeActor[] {
    return this.characterRoots().map((root) => ({
      ...this.redLifeShareActor(root),
      runtime: root.runtime,
    }));
  }

  private redLifeShareActor(root: FighterMatchState): RuntimeRedLifeShareActor {
    const side = runtimeTeamSide(root);
    const teamState = root.runtime.teamState;
    if (side === undefined || !teamState) {
      throw new Error(`Red-life share root ${root.id} has no valid team state`);
    }
    const memberNo = root.playerNo === undefined ? undefined : Math.floor((root.playerNo - 1) / 2);
    return {
      id: root.id,
      side,
      life: root.runtime.life,
      lifeMax: root.runtime.lifeMax,
      redLife: root.runtime.redLife ?? 0,
      ...(memberNo === undefined ? {} : { memberNo }),
      teamState,
    } satisfies RuntimeRedLifeShareActor;
  }

  private auxiliaryResourceProjectionActors(): RuntimeAuxiliaryResourceProjectionInputActor[] {
    return this.characterRoots().flatMap((root, rootOrder) => {
      const side = runtimeTeamSide(root);
      if (side === undefined) {
        throw new Error(`Auxiliary resource root ${root.id} has no valid team side`);
      }
      const memberNo = root.playerNo === undefined ? undefined : Math.floor((root.playerNo - 1) / 2);
      const rootActor: RuntimeAuxiliaryResourceProjectionInputActor = {
        id: root.id,
        actorKind: "root",
        rootId: root.id,
        parentId: root.id,
        resourceOwnerId: root.id,
        side,
        ...(memberNo === undefined ? {} : { memberNo }),
        rootOrder,
        teamState: root.runtime.teamState,
        runtime: root.runtime,
      };
      const helperActors = this.effectActorWorld.helpers(root.id).map((helper) => ({
        id: helper.serialId,
        actorKind: "helper" as const,
        rootId: helper.rootId,
        parentId: helper.parentId,
        resourceOwnerId: helper.serialId,
        side,
        rootOrder,
        runOrder: helper.runOrder ?? helper.runOrderId,
        teamState: helper.teamState,
        runtime: {
          life: helper.life,
          lifeMax: helper.lifeMax,
          redLife: helper.redLife,
          guardPoints: helper.guardPoints,
          guardPointsMax: helper.guardPointsMax,
          dizzyPoints: helper.dizzyPoints,
          dizzyPointsMax: helper.dizzyPointsMax,
          assertSpecial: helper.assertSpecial,
        },
      } satisfies RuntimeAuxiliaryResourceProjectionInputActor));
      return [rootActor, ...helperActors];
    });
  }

  private teamResourceBankRuntimeEnabled(): boolean {
    return this.runtimeProfile === "ikemen-go" && this.teamRoundMode !== "single";
  }

  private resetTeamResourceBanks(): void {
    if (!this.teamResourceBankRuntimeEnabled()) return;
    this.teamResourceBankRuntime.reset({
      actors: this.teamResourceBankRuntimeActors(),
      mode: this.teamRoundMode,
      lifeShare: this.teamLifeShare,
      powerShare: this.teamPowerShare,
      tick: this.tick,
    });
    this.redLifeShareRuntime.reset({
      actors: this.redLifeShareRuntimeActors(),
      mode: this.teamRoundMode,
      lifeShare: this.teamLifeShare,
      tick: this.tick,
    });
  }

  private reconcileTeamResourceBanks(): void {
    if (!this.teamResourceBankRuntimeEnabled()) return;
    const result = this.teamResourceBankRuntime.reconcile({
      actors: this.teamResourceBankRuntimeActors(),
      mode: this.teamRoundMode,
      lifeShare: this.teamLifeShare,
      powerShare: this.teamPowerShare,
      tick: this.tick,
    });
    for (const change of result.changes) {
      if (!change.shared || change.delta === 0) continue;
      const sign = change.delta > 0 ? "+" : "";
      this.logs.unshift(
        `TeamResource ${change.kind} ${change.resourceOwnerId} delta ${sign}${change.delta} value ${change.value}/${change.max} actors ${change.actorIds.join(",")}`,
      );
    }
    this.reconcileTeamRedLifeShare();
  }

  private reconcileTeamRedLifeShare(): void {
    if (!this.teamResourceBankRuntimeEnabled()) return;
    const redLifeResult = this.redLifeShareRuntime.reconcile({
      actors: this.redLifeShareRuntimeActors(),
      mode: this.teamRoundMode,
      lifeShare: this.teamLifeShare,
      tick: this.tick,
    });
    for (const change of redLifeResult.changes) {
      if (!change.shared || change.delta === 0) continue;
      const sign = change.delta > 0 ? "+" : "";
      this.logs.unshift(
        `TeamRedLife ${change.resourceOwnerId} delta ${sign}${change.delta} value ${change.value}/${change.max} actors ${change.actorIds.join(",")}`,
      );
    }
  }

  private rootForHelper(helper: RuntimeHelper): FighterMatchState {
    return this.characterRoots().find((candidate) => candidate.id === helper.rootId) ?? this.activeRoots[0];
  }

  private enterHelperOwnedTargetState(
    owner: FighterMatchState,
    helper: RuntimeHelper,
    targetActor: RuntimeTargetWorldActor,
    stateId: number,
  ): boolean {
    const roster = this.matchRoster();
    const result = matchHelperTargetStateWorld.enter({
      owner,
      helper,
      targetActor,
      stateId,
      actors: roster.actors,
      canEnterState: (target, targetStateId, stateOwner) => canEnterState(target, targetStateId, stateOwner),
      enterState: (target, targetStateId, options) => enterState(target, targetStateId, undefined, options),
    });
    return result.entered;
  }

  private enterHelperRedirectedTargetState(
    helper: RuntimeHelper,
    stateOwner: RuntimeTargetWorldActor,
    targetActor: RuntimeTargetWorldActor,
    stateId: number,
  ): boolean {
    const owner = this.characterRoots().find((candidate) => candidate.id === stateOwner.id);
    if (!owner) return false;
    const actors = this.characterRoots();
    const result = matchHelperTargetStateWorld.enterRedirected({
      owner,
      helper,
      targetActor,
      stateId,
      actors,
      canEnterState: (target, targetStateId, targetOwner) => canEnterState(target, targetStateId, targetOwner),
      enterState: (target, targetStateId, options) => enterState(target, targetStateId, undefined, options),
    });
    return result.entered;
  }

  private matchRoster(): RuntimeMatchActorRoster<FighterMatchState> {
    return matchActorRosterWorld.create({ p1: this.activeRoots[0], p2: this.activeRoots[1] });
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
    } else if (command.type === "set-match-max-draws") {
      if (this.runtimeProfile !== "ikemen-go") {
        throw new Error("Match draw limits require the ikemen-go runtime profile");
      }
      this.matchOutcome.setMaxDraws(command.side, command.count);
    } else if (command.type === "set-match-wins") {
      if (this.runtimeProfile !== "ikemen-go") {
        throw new Error("Match win targets require the ikemen-go runtime profile");
      }
      this.matchOutcome.setMatchWins(command.side, command.count);
    } else if (command.type === "skip-intro") {
      this.round.requestIntroSkip({ roundNoSkip: hasRuntimeRoundNoSkip(this.characterRoots()) });
    } else if (command.type === "next-round") {
      this.startNextRound();
    } else if (command.type === "reset") {
      this.reset();
    }
    return this.getSnapshot();
  }

  step(input: MatchInput, options: MatchStepOptions = {}): MugenSnapshot {
    const result = matchStepWorld.step({
      playing: this.playing,
      frameClock: this.frameClock,
      speed: this.speed * this.round.playbackRate,
      force: options.force,
      isRoundOver: () => this.round.isOver,
      advanceOneTick: () => this.advanceOneTick(input),
      snapshot: () => this.getSnapshot(),
    });
    this.frameClock = result.frameClock;
    return result.snapshot;
  }

  private deferInputControl(
    fighter: FighterMatchState,
    apply: () => RuntimeInputControlResult,
  ): RuntimeInputControlResult {
    this.deferredInputControls.set(fighter, apply);
    return "deferred";
  }

  private runDeferredInputControl(fighter: FighterMatchState): boolean {
    const apply = this.deferredInputControls.get(fighter);
    if (!apply) return false;
    this.deferredInputControls.delete(fighter);
    apply();
    return true;
  }

  private shouldDeferRootInputControl(fighter: FighterMatchState): boolean {
    if (fighter.definition.source !== "imported") return false;
    if (this.runtimeProfile !== "mugen-1.1" && this.runtimeProfile !== "ikemen-go") return false;
    return fighter.runtimeProgram?.states.some(
      (state) => state.special === undefined && (state.id === -3 || state.id === -2),
    ) ?? false;
  }

  private rootInputControlDeferral(
    fighter: FighterMatchState,
  ): ((apply: () => RuntimeInputControlResult) => RuntimeInputControlResult) | undefined {
    return this.shouldDeferRootInputControl(fighter)
      ? (apply) => this.deferInputControl(fighter, apply)
      : undefined;
  }

  private rootInputControlRunner(fighter: FighterMatchState): (() => boolean) | undefined {
    return this.shouldDeferRootInputControl(fighter)
      ? () => this.runDeferredInputControl(fighter)
      : undefined;
  }

  private roundAnnouncementMode(): "normal" | "single" | "final" {
    const outcome = this.matchOutcome.snapshot();
    const roundNo = this.round.currentRoundNo;
    const side1Target = outcome.matchWinsBySide?.[1] ?? outcome.matchWins;
    const side2Target = outcome.matchWinsBySide?.[2] ?? outcome.matchWins;
    if (roundNo === 1 && side1Target === 1 && side2Target === 1) {
      return "single";
    }
    if (roundNo <= 1 || outcome.matchOver) {
      return "normal";
    }
    const bothSidesDecisive = outcome.wins[1] >= side1Target - 1 && outcome.wins[2] >= side2Target - 1;
    return bothSidesDecisive ? "final" : "normal";
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
    return this.activeRoots.flatMap((owner) =>
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
    this.deferredInputControls.clear();
    const [activeP1, activeP2] = this.activePair();
    const introSkipButtonPressed = hasNewRuntimeIntroSkipButtonPress(
      input.p1,
      this.previousIntroSkipInputs.p1,
    ) || hasNewRuntimeIntroSkipButtonPress(
      input.p2 ?? new Set<string>(),
      this.previousIntroSkipInputs.p2,
    );
    rememberRuntimeInput(this.previousIntroSkipInputs.p1, input.p1);
    rememberRuntimeInput(this.previousIntroSkipInputs.p2, input.p2 ?? new Set<string>());
    if (introSkipButtonPressed) {
      this.round.requestIntroSkip({ roundNoSkip: hasRuntimeRoundNoSkip(this.characterRoots()) });
    }
    if (this.round.snapshot().state === "ko") {
      matchRoundWorld.advanceTimer(this.round, this.matchRoster().actors, () => {
        this.playing = false;
      }, this.tick, {
        phase4Ready: this.isRoundPhase4Ready(),
        announcementMode: this.roundAnnouncementMode(),
      });
    }
    this.lastRootBodyPush = undefined;
    this.lastRootHitAdmission = undefined;
    const schedule = new RuntimeMatchTickScheduleRecorder(this.tick);
    const p1Input = resolveRuntimeSocdInput(input.p1, this.socdResolution, this.socdInputState.p1);
    const p2Input = resolveRuntimeSocdInput(input.p2 ?? new Set<string>(), this.socdResolution, this.socdInputState.p2);
    const rootInputRoutes = rootInputRoutingWorld.routes({
      runtimeProfile: this.runtimeProfile,
      teamMode: this.teamPresentationMode(),
      roots: this.characterRoots(),
      p1Input,
      p2Input,
    });
    this.lastP2Controlled = input.p2 !== undefined;
    const preparedRunOrder = fighterRunOrderWorld.stamp(fighterRunOrderWorld.orderPair(this.runtimeProfile, activeP1, activeP2));
    const preparedActorRunOrder = actorRunOrderWorld.order(this.runtimeProfile, this.actorRunOrderCandidates());
    schedule.record("tick:stamp-input");
    matchTickInputWorld.stampFrame({ tick: this.tick, p1: activeP1, p2: activeP2, p1Input, p2Input });

    schedule.record("frame:start");
    matchFrameStartWorld.advance({
      p1: activeP1,
      p2: activeP2,
      resetFrameFlags: (fighter) => this.hitEligibilityWorld.resetFrameFlags(fighter.runtime),
      applyPreFacingAssertSpecial: (fighter, opponent) => this.applyPreFacingAssertSpecial(fighter, opponent),
      updateAutoFacing: (fighter, opponent) => this.orientationWorld.updateAutoFacing(fighter.runtime, opponent.runtime),
    });
    for (const root of this.characterRoots()) collisionOverrideWorld.resetFrame(root.runtime);

    const branchResult = matchTickBranchWorld.advance({
      advanceHitPause: () => {
        schedule.record("branch:hitpause-advance");
        if (Math.max(activeP1.hitPause, activeP2.hitPause) > 0) {
          this.clearActiveRootGuardDistanceLatches();
        }
        const gameSpace = runtimeStageGameSpace(this.stage);
        const result = matchHitPauseWorld.advanceRuntime<FighterMatchState>({
          hitPauseWorld: this.hitPauseWorld,
          p1: activeP1,
          p2: activeP2,
          p1Input,
          p2Input,
          tick: this.tick,
          stage: this.stage,
          gameSpace,
          stageTime: this.tick,
          runtimeTick: this.tick,
          effectLifecycleWorld: this.effectLifecycleWorld,
          resolveHelperTargetRedirect: (helper, playerId, controller) =>
            this.resolveHelperTargetRedirect(helper, playerId, controller),
          resolveHelperResourceRedirect: (helper, playerId, controller) =>
            this.resolveHelperResourceRedirect(helper, playerId, controller),
          onHelperTargetRedirectBlocked: (helper, controller, playerId) =>
            this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
          onHelperResourceRedirectBlocked: (helper, controller, playerId) =>
            this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
          onHelperRedirectedController: (_helper, target, controller) =>
            this.recordHelperRedirectedController(target, controller),
          onHelperRedirectedOperation: (helper, target, operation, lifeBefore) =>
            this.recordHelperRedirectedOperation(helper, target, operation, lifeBefore),
          onTargetLifeAdd: (helper, sourceActor, targetActor, lifeBefore) =>
            this.recordHelperTargetLifeKoCause(helper, sourceActor, targetActor, lifeBefore),
          onHelperRedirectedTargetDispatch: (helper, target, selection, redirectPlayerId, redirectExpression, writeback, destinationRevision) =>
            this.recordHelperRedirectedTargetDispatch(
              helper,
              target,
              selection,
              redirectPlayerId,
              redirectExpression,
              writeback,
              destinationRevision,
            ),
          enterHelperRedirectedTargetState: (helper, stateOwner, target, stateId) =>
            this.enterHelperRedirectedTargetState(helper, stateOwner, target, stateId),
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
              (caller, expression, context, controllerType) =>
                this.resolveRootControllerRedirect(caller, expression, context, controllerType),
              (caller, expression, context, controllerType, phase, candidates) =>
                this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
              (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
              this.characterRoots(),
              this.round.roundNoDamage,
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
        this.clearActiveRootGuardDistanceLatches();
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
      schedule.record("tick:guard-distance-latch", activeP1.id);
      refreshRuntimeInGuardDist(activeP1, activeP2, this.guardDistanceWorld, this.tick);
      schedule.record("tick:guard-distance-latch", activeP2.id);
      refreshRuntimeInGuardDist(activeP2, activeP1, this.guardDistanceWorld, this.tick);
      this.clearActiveRootGuardDistanceLatches();
    }
    schedule.record("tick:restore-superpause-defense");
    this.restoreExpiredSuperPauseTargetDefense();
    this.reconcileTeamResourceBanks();
    this.applyRuntimeRoundPhase();
    this.lastTickSchedule = schedule.complete(branchResult.branch);
  }

  getSocdResolution(): RuntimeSocdResolution {
    return this.socdResolution;
  }

  getSocdResolutionAuthority(): RuntimeSocdResolutionAuthority {
    return {
      ...this.socdResolutionAuthority,
      packageValues: { ...this.socdResolutionAuthority.packageValues },
      diagnostics: [...this.socdResolutionAuthority.diagnostics],
    };
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
    const [activeP1, activeP2] = this.activePair();
    const rootAdvancePhases = rootAdvancePhaseWorld.snapshot({
      runtimeProfile: this.runtimeProfile,
      teamMode: this.teamPresentationMode(),
      roots: this.characterRoots(),
      playableRoots: [activeP1, activeP2],
    });
    const activeRootGuardDefenders = this.teamGameplayActive()
      ? this.characterRoots().filter((root) => rootAdvancePhases.phaseOf(root) === "active-motion")
      : [];
    matchActiveWorld.advance({
      tickRoundTimer: () => {
        recordPhase("active:round-timer");
        if (this.round.snapshot().state === "ko") return { frozen: false };
        const result = matchRoundWorld.advanceTimer(this.round, this.matchRoster().actors, () => {
          this.playing = false;
        }, this.tick, {
          phase4Ready: this.isRoundPhase4Ready(),
          announcementMode: this.roundAnnouncementMode(),
        });
        if (result.introSkipResetReady) this.applyIntroSkipReset();
        return result;
      },
      pushNormalCommandBuffers: () => {
        recordPhase("active:command-buffer");
        const reserveRoutes = rootInputRoutes.filter(({ actor }) => !this.activeRoots.includes(actor));
        matchTickInputWorld.stampMappedActors({ tick: this.tick, routes: reserveRoutes });
        return matchTickInputWorld.pushMappedNormalCommandBuffers({ tick: this.tick, routes: rootInputRoutes });
      },
      applyInputControl: () => {
        recordPhase("active:input-control");
        return matchInputControlWorld.apply({
          p1: activeP1,
          p2: activeP2,
          p1Input,
          p2Input,
          p2Controlled: input.p2 !== undefined,
          handlePlayerInput: (fighter, fighterInput, opponent) =>
            handlePlayerInput(
              fighter,
              fighterInput,
              opponent,
              this.stage.bounds,
              gameSpace,
              this.tick,
              this.inputControlWorld,
              (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
              this.characterRoots(),
              (caller, expression, context, controllerType) =>
                this.resolveRootControllerRedirect(caller, expression, context, controllerType),
              (caller, expression, context, controllerType, phase, candidates) =>
                this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
              this.rootInputControlDeferral(fighter),
              this.round.roundNoDamage,
            ),
          handleAi: (fighter, opponent) =>
            handleSimpleAi(
              fighter,
              opponent,
              this.tick,
              this.inputControlWorld,
              this.stage.bounds,
              gameSpace,
              (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
              this.characterRoots(),
              (caller, expression, context, controllerType) =>
                this.resolveRootControllerRedirect(caller, expression, context, controllerType),
              (caller, expression, context, controllerType, phase, candidates) =>
                this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
              this.rootInputControlDeferral(fighter),
              this.round.roundNoDamage,
            ),
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
                (caller, expression, context, controllerType) =>
                  this.resolveRootControllerRedirect(caller, expression, context, controllerType),
                (caller, expression, context, controllerType, phase, candidates) =>
                  this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
                (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
                this.characterRoots(),
                this.rootInputControlRunner(fighter),
                this.round.roundNoDamage,
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
                constants: owner.definition.constants,
                defaultHitFlag: runtimeDefaultHitFlagForSource(owner.definition.source),
                runtimeProfile: this.runtimeProfile,
                commandActive: (name) => owner.commandBuffer.isCommandActive(name, owner.definition.commands ?? []),
                commandInput: owner.currentInput,
                resolveTargetRedirect: (helper, playerId, controller) =>
                  this.resolveHelperTargetRedirect(helper, playerId, controller),
                resolveResourceRedirect: (helper, playerId, controller) =>
                  this.resolveHelperResourceRedirect(helper, playerId, controller),
                onTargetRedirectBlocked: (helper, controller, playerId) =>
                  this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
                onResourceRedirectBlocked: (helper, controller, playerId) =>
                  this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
                onRedirectedController: (_helper, target, controller) =>
                  this.recordHelperRedirectedController(target, controller),
                onRedirectedOperation: (helper, target, operation, lifeBefore) =>
                  this.recordHelperRedirectedOperation(helper, target, operation, lifeBefore),
                onTargetLifeAdd: (helper, sourceActor, targetActor, lifeBefore) =>
                  this.recordHelperTargetLifeKoCause(helper, sourceActor, targetActor, lifeBefore),
                onRedirectedTargetDispatch: (helper, target, selection, redirectPlayerId, redirectExpression, writeback, destinationRevision) =>
                  this.recordHelperRedirectedTargetDispatch(
                    helper,
                    target,
                    selection,
                    redirectPlayerId,
                    redirectExpression,
                    writeback,
                    destinationRevision,
                  ),
                enterRedirectedTargetState: (helper, stateOwner, target, stateId) =>
                  this.enterHelperRedirectedTargetState(helper, stateOwner, target, stateId),
              });
            },
            discoverHelpers: () => this.helperRunOrderCandidates(),
            applyAutoGuardStart: (defender, attacker, checkpoint) => {
              const initialParticipation = rootAdvancePhases.phaseOf(defender);
              const currentParticipation = this.currentRootAdvancePhaseOf(defender);
              if (
                currentParticipation === "bounded-standby" ||
                (initialParticipation === "active-motion" && currentParticipation !== "active-motion")
              ) {
                return;
              }
              recordPhase(`fighter:auto-guard-check:${checkpoint}`, defender.id);
              applyAutoGuardStart(defender, attacker, this.guardWorld, {
                useAnyLatchedAttacker: initialParticipation === "active-motion",
              });
            },
          });
        }
        return matchFighterAdvanceWorld.advancePair({
          p1: activeP1,
          p2: activeP2,
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
              (caller, expression, context, controllerType) =>
                this.resolveRootControllerRedirect(caller, expression, context, controllerType),
              (caller, expression, context, controllerType, phase, candidates) =>
                this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
              (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
              this.characterRoots(),
              this.rootInputControlRunner(fighter),
              this.round.roundNoDamage,
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
          p1: activeP1,
          p2: activeP2,
          roundNoDamage: this.round.roundNoDamage,
          targetActors: this.teamGameplayActive()
            ? selectRuntimeRootTargetMaintenanceActors(this.characterRoots())
            : undefined,
          targetResetActors: this.teamGameplayActive() ? this.characterRoots() : undefined,
          hitDefContactActors: this.teamGameplayActive() ? this.characterRoots() : undefined,
          stage: this.stage,
          stageTime: this.tick,
          helpersAdvancedInActorOrder: this.runtimeProfile === "ikemen-go",
          runtimeProfile: this.runtimeProfile,
          resolveHelperCommandActive: (fighter, name) =>
            fighter.commandBuffer.isCommandActive(name, fighter.definition.commands ?? []),
          resolveHelperTargetRedirect: (helper, playerId, controller) =>
            this.resolveHelperTargetRedirect(helper, playerId, controller),
          resolveHelperResourceRedirect: (helper, playerId, controller) =>
            this.resolveHelperResourceRedirect(helper, playerId, controller),
          onHelperTargetRedirectBlocked: (helper, controller, playerId) =>
            this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
          onHelperResourceRedirectBlocked: (helper, controller, playerId) =>
            this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
          onHelperRedirectedController: (_helper, target, controller) =>
            this.recordHelperRedirectedController(target, controller),
          onHelperRedirectedOperation: (helper, target, operation, lifeBefore) =>
            this.recordHelperRedirectedOperation(helper, target, operation, lifeBefore),
          onTargetLifeAdd: (helper, sourceActor, targetActor, lifeBefore) =>
            this.recordHelperTargetLifeKoCause(helper, sourceActor, targetActor, lifeBefore),
          onHelperRedirectedTargetDispatch: (helper, target, selection, redirectPlayerId, redirectExpression, writeback, destinationRevision) =>
            this.recordHelperRedirectedTargetDispatch(
              helper,
              target,
              selection,
              redirectPlayerId,
              redirectExpression,
              writeback,
              destinationRevision,
            ),
          enterHelperRedirectedTargetState: (helper, stateOwner, target, stateId) =>
            this.enterHelperRedirectedTargetState(helper, stateOwner, target, stateId),
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
          getCollisionBoxes: getRuntimeCollisionBoxes,
          isHelperRootOwned: this.runtimeProfile === "ikemen-go"
            ? (helper, ownerId) => this.verifiedRootForHelper(helper)?.id === ownerId
            : undefined,
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
          refreshRootGuardDistance: this.teamGameplayActive() ? () => {
            this.refreshActiveRootDirectGuardDistance(recordPhase, activeRootGuardDefenders);
          } : undefined,
          advanceBodyPush: this.teamGameplayActive() ? () => {
            const roots = this.characterRoots();
            this.lastRootBodyPush = rootBodyPushWorld.advance({
              tagMode: true,
              roots: roots.map((root) => ({
                id: root.id,
                side: runtimeTeamSide(root) ?? null,
                teamState: root.runtime.teamState!,
                runtime: root.runtime,
                localCoord: root.definition.localCoord,
                weight: root.definition.constants?.["size.weight"],
                pushFactor: root.definition.constants?.["size.pushfactor"],
                sizeBox: runtimePushSizeBox(root),
                hurtBoxes: frameWorld.currentHurtBoxes(root),
                sizePushOnly: root.runtime.assertSpecial?.flags.includes("sizepushonly"),
                moveType: root.runtime.moveType,
                mugenMinimumWidth: usesMugenPlayerPushMinimumWidth(root.definition),
              })),
              playableRoots: [
                { id: activeP1.id, side: 1, teamState: activeP1.runtime.teamState!, runtime: activeP1.runtime, localCoord: activeP1.definition.localCoord, weight: activeP1.definition.constants?.["size.weight"], pushFactor: activeP1.definition.constants?.["size.pushfactor"], sizeBox: runtimePushSizeBox(activeP1), hurtBoxes: frameWorld.currentHurtBoxes(activeP1), sizePushOnly: activeP1.runtime.assertSpecial?.flags.includes("sizepushonly"), moveType: activeP1.runtime.moveType, mugenMinimumWidth: usesMugenPlayerPushMinimumWidth(activeP1.definition) },
                { id: activeP2.id, side: 2, teamState: activeP2.runtime.teamState!, runtime: activeP2.runtime, localCoord: activeP2.definition.localCoord, weight: activeP2.definition.constants?.["size.weight"], pushFactor: activeP2.definition.constants?.["size.pushfactor"], sizeBox: runtimePushSizeBox(activeP2), hurtBoxes: frameWorld.currentHurtBoxes(activeP2), sizePushOnly: activeP2.runtime.assertSpecial?.flags.includes("sizepushonly"), moveType: activeP2.runtime.moveType, mugenMinimumWidth: usesMugenPlayerPushMinimumWidth(activeP2.definition) },
              ],
              stage: this.stage,
              actorConstraintWorld: this.actorConstraintWorld,
            });
            for (const id of this.lastRootBodyPush.rootIds) recordPhase("post-fighter:body-push", id);
          } : undefined,
          inspectHitAdmission: this.teamGameplayActive() ? () => {
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
              getCollisionBoxes: (candidate, boxType) => {
                const root = roots.find(({ id }) => id === candidate.id);
                return root ? getRuntimeCollisionBoxes(root, boxType) : undefined;
              },
            });
            for (const id of this.lastRootHitAdmission.rootIds) recordPhase("post-fighter:hit-admission", id);
          } : undefined,
          resolveRootDirectCombat: this.teamGameplayActive() ? (resolveDirectCombat) => {
            const rootsById = new Map(this.characterRoots().map((root) => [root.id, root]));
            for (const pairId of this.lastRootHitAdmission?.admittedPairIds ?? []) {
              const [attackerId, getterId] = pairId.split("->");
              const attacker = rootsById.get(attackerId);
              const getter = rootsById.get(getterId);
              if (!attacker || !getter) throw new Error(`Root hit admission referenced unknown pair ${pairId}`);
              resolveDirectCombat(attacker, getter);
            }
          } : undefined,
          resolveRootReversalClashes: this.teamGameplayActive() ? (resolveReversalClash) => {
            const rootsById = new Map(this.characterRoots().map((root) => [root.id, root]));
            for (const pairId of this.lastRootHitAdmission?.admittedReversalClashPairIds ?? []) {
              const [reverserId, getterId] = pairId.split("->");
              const reverser = rootsById.get(reverserId);
              const getter = rootsById.get(getterId);
              if (!reverser || !getter) throw new Error(`Root reversal admission referenced unknown pair ${pairId}`);
              resolveReversalClash(reverser, getter);
            }
          } : undefined,
          resolveRootPriorityClashes: this.teamGameplayActive() ? (resolvePriorityClash) => {
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
                const leftMove = left.currentMove;
                const rightMove = right.currentMove;
                if (!leftMove || !rightMove) continue;
                if (!runtimeAffectTeamAllows(runtimeTeamSide(left), runtimeTeamSide(right), leftMove.affectTeam)
                  || !runtimeAffectTeamAllows(runtimeTeamSide(right), runtimeTeamSide(left), rightMove.affectTeam)) continue;
                const message = resolvePriorityClash(left, right);
                if (message) this.logs.unshift(message);
              }
            }
          } : undefined,
          resolveRootPriorityOutcomes: (resolveEqualPriorityOutcomes) => {
            resolveEqualPriorityOutcomes(this.teamGameplayActive() ? this.characterRoots() : [activeP1, activeP2]);
          },
          recordTargetMaintenance: this.teamGameplayActive()
            ? (root) => recordPhase("post-fighter:target-maintenance", root.id)
            : undefined,
          commitHitDefTargets: (root) => commitRuntimeHitDefTargets(root),
          recordHitDefContactCommit: this.teamGameplayActive()
            ? (root) => recordPhase("post-fighter:hitdef-contact-commit", root.id)
            : undefined,
          log: (line) => this.logs.unshift(line),
          recordSchedulePhase: recordPhase,
        });
      },
      finishRoundIfNeeded: () => {
        recordPhase("active:round-finish");
        const [activeP1, activeP2] = this.activePair();
        if (this.teamRoundMode === "turns" && this.round.isOver) {
          const turnsContinuation = this.tryAutomaticTurnsContinuation();
          if (turnsContinuation !== "not-applicable") return undefined;
        }
        return matchRoundWorld.finishIfNeeded({
          round: this.round,
          p1: activeP1,
          p2: activeP2,
          tick: this.tick,
          participants: this.teamGameplayActive() ? this.teamRoundOutcomeParticipants() : undefined,
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
    const [activeP1, activeP2] = this.activePair();
    if (this.runtimeProfile === "ikemen-go") {
      this.advanceIkemenPausedMatch(input, p1Input, p2Input, preparedActorRunOrder, gameSpace, recordPhase);
      return;
    }
    matchPausedBridgeWorld.advanceRuntime({
      pausedMatchWorld: this.pausedMatchWorld,
      pauseWorld: this.pauseWorld,
      p1: activeP1,
      p2: activeP2,
      p1Input,
      p2Input,
      p2Controlled: input.p2 !== undefined,
      stage: this.stage,
      gameSpace,
      tick: this.tick,
      actorConstraintWorld: this.actorConstraintWorld,
      effectLifecycleWorld: this.effectLifecycleWorld,
      handlePlayerInput: (actor, actorInput, opponent) =>
        handlePlayerInput(
          actor,
          actorInput,
          opponent,
          this.stage.bounds,
          gameSpace,
          this.tick,
          this.inputControlWorld,
          (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
          this.characterRoots(),
          (caller, expression, context, controllerType) =>
            this.resolveRootControllerRedirect(caller, expression, context, controllerType),
          (caller, expression, context, controllerType, phase, candidates) =>
            this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
          this.rootInputControlDeferral(actor),
          this.round.roundNoDamage,
        ),
      handleAi: (actor, opponent) =>
        handleSimpleAi(
          actor,
          opponent,
          this.tick,
          this.inputControlWorld,
          this.stage.bounds,
          gameSpace,
          (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
          this.characterRoots(),
          (caller, expression, context, controllerType) =>
            this.resolveRootControllerRedirect(caller, expression, context, controllerType),
          (caller, expression, context, controllerType, phase, candidates) =>
            this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
          this.rootInputControlDeferral(actor),
          this.round.roundNoDamage,
        ),
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
          undefined,
          (caller, expression, context, controllerType) =>
            this.resolveRootControllerRedirect(caller, expression, context, controllerType),
          (caller, expression, context, controllerType, phase, candidates) =>
            this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
          (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
          this.characterRoots(),
          this.rootInputControlRunner(actor),
          this.round.roundNoDamage,
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
    const [activeP1, activeP2] = this.activePair();

    activeP1.commandBuffer.push(this.tick, p1Input, { hitPause: true });
    activeP2.commandBuffer.push(this.tick, p2Input, { hitPause: true });

    this.pauseWorld.beginDeferredActivation();
    try {
      pausedActorAdvanceWorld.advance({
        pause,
        runOrder: preparedActorRunOrder,
        canAdvanceRoot: (fighter) => this.inactiveRoots().includes(fighter) || this.pauseWorld.canActorMove(fighter.id),
        advancePauseImmuneRoot: (fighter) => {
          const opponent = this.opponentForRoot(fighter);
          this.advancePauseImmuneRootCns(fighter, opponent, gameSpace, recordPhase);
        },
        advanceRoot: (fighter) => {
          const opponent = this.opponentForRoot(fighter);
          if (this.inactiveRoots().includes(fighter)) {
            this.advanceStandbyRootCns(fighter, opponent, gameSpace, recordPhase, {
              onlyIgnoreHitPause: !this.pauseWorld.canActorMove(fighter.id),
            });
            return;
          }
          const fighterInput = fighter === activeP1 ? p1Input : p2Input;
          if (fighter === activeP1 || input.p2 !== undefined) {
            handlePlayerInput(
              fighter,
              fighterInput,
              opponent,
              this.stage.bounds,
              gameSpace,
              this.tick,
              this.inputControlWorld,
              (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
              this.characterRoots(),
              (caller, expression, context, controllerType) =>
                this.resolveRootControllerRedirect(caller, expression, context, controllerType),
              (caller, expression, context, controllerType, phase, candidates) =>
                this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
              this.rootInputControlDeferral(fighter),
              this.round.roundNoDamage,
            );
          } else {
            handleSimpleAi(
              fighter,
              opponent,
              this.tick,
              this.inputControlWorld,
              this.stage.bounds,
              gameSpace,
              (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
              this.characterRoots(),
              (caller, expression, context, controllerType) =>
                this.resolveRootControllerRedirect(caller, expression, context, controllerType),
              (caller, expression, context, controllerType, phase, candidates) =>
                this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
              this.rootInputControlDeferral(fighter),
              this.round.roundNoDamage,
            );
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
            (caller, expression, context, controllerType) =>
              this.resolveRootControllerRedirect(caller, expression, context, controllerType),
            (caller, expression, context, controllerType, phase, candidates) =>
              this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
            (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
            this.characterRoots(),
            this.rootInputControlRunner(fighter),
            this.round.roundNoDamage,
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
            constants: owner.definition.constants,
            defaultHitFlag: runtimeDefaultHitFlagForSource(owner.definition.source),
            runtimeProfile: this.runtimeProfile,
            commandActive: (name) => owner.commandBuffer.isCommandActive(name, owner.definition.commands ?? []),
            commandInput: owner.currentInput,
            resolveTargetRedirect: (helper, playerId, controller) =>
              this.resolveHelperTargetRedirect(helper, playerId, controller),
            resolveResourceRedirect: (helper, playerId, controller) =>
              this.resolveHelperResourceRedirect(helper, playerId, controller),
            onTargetRedirectBlocked: (helper, controller, playerId) =>
              this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
            onResourceRedirectBlocked: (helper, controller, playerId) =>
              this.logs.unshift(`Blocked ${controller.normalizedType} RedirectID ${playerId} for ${helper.serialId}`),
            onRedirectedController: (_helper, target, controller) =>
              this.recordHelperRedirectedController(target, controller),
            onRedirectedOperation: (helper, target, operation, lifeBefore) =>
              this.recordHelperRedirectedOperation(helper, target, operation, lifeBefore),
            onTargetLifeAdd: (helper, sourceActor, targetActor, lifeBefore) =>
              this.recordHelperTargetLifeKoCause(helper, sourceActor, targetActor, lifeBefore),
            onRedirectedTargetDispatch: (helper, target, selection, redirectPlayerId, redirectExpression, writeback, destinationRevision) =>
              this.recordHelperRedirectedTargetDispatch(
                helper,
                target,
                selection,
                redirectPlayerId,
                redirectExpression,
                writeback,
                destinationRevision,
              ),
            enterRedirectedTargetState: (helper, stateOwner, target, stateId) =>
              this.enterHelperRedirectedTargetState(helper, stateOwner, target, stateId),
          });
        },
        discoverHelpers: () => this.helperRunOrderCandidates(),
        currentPause: () => this.pauseWorld.current(),
        finalizePresentation: () => {
          for (const [fighter, opponent] of [
            [activeP1, activeP2],
            [activeP2, activeP1],
          ] as const) {
            this.effectLifecycleWorld.advancePausedPresentation(fighter, pause.type, this.stage, opponent, {
              gameSpace,
              stageTime: this.tick,
              runtimeTick: this.tick,
              opponents: [opponent],
              skipHelpers: true,
              enterRedirectedTargetState: (helper, stateOwner, target, stateId) =>
                this.enterHelperRedirectedTargetState(helper, stateOwner, target, stateId),
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
        roundNoDamage: this.round.roundNoDamage,
        onlyIgnoreHitPause: options.onlyIgnoreHitPause,
        onBlocked: (controller, route) =>
          this.logs.unshift(`Blocked standby CNS controller ${controller.type} for ${fighter.id} (${route})`),
        onTeamStandby: (actor, operation, context) => this.applyTeamStandbyController(actor, operation, context),
        onRootRedirect: (caller, expression, context, controllerType) =>
          this.resolveRootControllerRedirect(caller, expression, context, controllerType),
        onRootTargetDispatchLease: (caller, expression, context, controllerType, phase, candidates) =>
          this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
        playerIdTarget: (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
        characters: this.characterRoots(),
      },
    );
  }

  private advancePauseImmuneRootCns(
    fighter: FighterMatchState,
    opponent: FighterMatchState,
    gameSpace: ExpressionGameSpace,
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
  ): void {
    if (this.runtimeProfile !== "ikemen-go") return;
    if (fighter.runtime.teamState?.disabled || fighter.runtime.teamState?.playerType === false) return;
    recordPhase("fighter:controllers", fighter.id);
    const runSpecialState = (stateNo: number, stateSpecial?: MugenStateSpecial): void => {
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
          participation: "active-motion",
          runtimeProfile: this.runtimeProfile,
          roundNoDamage: this.round.roundNoDamage,
          stateNo,
          stateSpecial,
          stateOwner: fighter,
          includeRootGlobalStates: false,
          onlyIgnoreHitPause: false,
          onBlocked: (controller, route) =>
            this.logs.unshift(`Blocked pause-immune CNS controller ${controller.type} for ${fighter.id} (${route})`),
          onRootRedirect: (caller, expression, context, controllerType) =>
            this.resolveRootControllerRedirect(caller, expression, context, controllerType),
          onRootTargetDispatchLease: (caller, expression, context, controllerType, phase, candidates) =>
            this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
          playerIdTarget: (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
          characters: this.characterRoots(),
        },
      );
    };
    runSpecialState(-4);
    runSpecialState(1, "plus-one");
  }

  private advanceActiveRootMotion(
    fighter: FighterMatchState,
    opponent: FighterMatchState,
    gameSpace: ExpressionGameSpace,
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
  ): void {
    this.actorConstraintWorld.resetFrameConstraints(fighter.runtime);
    this.hitOverrideWorld.tickSlots(fighter.runtime);
    const tickStartPos = {
      ...fighter.runtime.pos,
      z: fighter.runtime.combatDepth?.position ?? 0,
    };
    rootMotionAdvanceWorld.advance({
      actor: fighter,
      hooks: {
        advanceGuardStun: (actor) => tickRuntimeGuardStun(actor),
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
              roundNoDamage: this.round.roundNoDamage,
              onBlocked: (controller, route) =>
                this.logs.unshift(`Blocked active-motion CNS controller ${controller.type} for ${actor.id} (${route})`),
              onTeamStandby: (caller, operation, context) => this.applyTeamStandbyController(caller, operation, context),
              onRootRedirect: (caller, expression, context, controllerType) =>
                this.resolveRootControllerRedirect(caller, expression, context, controllerType),
              onRootTargetDispatchLease: (caller, expression, context, controllerType, phase, candidates) =>
                this.resolveRootTargetDispatchLease(caller, expression, context, controllerType, phase, candidates),
              playerIdTarget: (caller, playerId) => this.resolvePlayerIdTarget(caller, playerId),
              characters: this.characterRoots(),
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

  private resolveRootControllerRedirect(
    caller: FighterMatchState,
    expression: string,
    context: ReturnType<typeof runtimeControllerContext>,
    controllerType:
      | "depth"
      | "height"
      | "overrideclsn"
      | "screenbound"
      | "playerpush"
      | RedirectableTargetControllerType
      | RedirectableResourceControllerType
      | RedirectableEffectControllerType,
  ): FighterMatchState | undefined {
    const block = (value: number | "invalid"): undefined => {
      this.logs.unshift(`Blocked ${controllerType} RedirectID ${value} for ${caller.id}`);
      return undefined;
    };
    if (this.runtimeProfile !== "ikemen-go") return block("invalid");
    const resolved = evaluateRuntimeControllerNumber(expression, caller.runtime, context);
    const playerId = resolved === undefined ? undefined : Math.trunc(resolved);
    if (playerId === undefined || playerId < 0) return block(playerId ?? "invalid");
    const identity = this.characterIdentity?.findByPlayerId(playerId);
    return identity?.fighter ?? block(playerId);
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
    return roots.find((root) => root.id === selectedId) ?? (runtimeTeamSide(fighter) === 1 ? this.activeRoots[1] : this.activeRoots[0]);
  }

  private currentRootAdvancePhaseOf(fighter: FighterMatchState): RuntimeRootAdvancePhase {
    return rootAdvancePhaseWorld.snapshot({
      runtimeProfile: this.runtimeProfile,
      teamMode: this.teamPresentationMode(),
      roots: this.characterRoots(),
      playableRoots: this.activeRoots,
    }).phaseOf(fighter);
  }

  private refreshActiveRootDirectGuardDistance(
    recordPhase: (phase: RuntimeMatchTickPhaseId, actorId?: string) => void,
    activeRootGuardDefenders: readonly FighterMatchState[],
  ): void {
    const roots = this.characterRoots();
    const rootsById = new Map(roots.map((root) => [root.id, root]));
    const currentRootAdvancePhases = rootAdvancePhaseWorld.snapshot({
      runtimeProfile: this.runtimeProfile,
      teamMode: this.teamPresentationMode(),
      roots,
      playableRoots: this.activeRoots,
    });
    const selections = rootSelectionWorld.diagnostic(
      roots.map((root) => ({ id: root.id, ...root.runtime.teamState })),
    );
    for (const defender of activeRootGuardDefenders) {
      recordPhase("tick:guard-distance-latch", defender.id);
      if (currentRootAdvancePhases.phaseOf(defender) !== "active-motion") {
        delete defender.runtime.inGuardDist;
        continue;
      }
      const candidateIds = selections.entries.find((entry) => entry.actorId === defender.id)?.p2CandidateIds ?? [];
      const attackers = candidateIds.flatMap((id) => {
        const candidate = rootsById.get(id);
        return candidate ? [candidate] : [];
      });
      refreshRuntimeDirectInGuardDist(defender, attackers, this.guardDistanceWorld, this.tick);
    }
  }

  private clearActiveRootGuardDistanceLatches(): void {
    if (!this.teamGameplayActive()) return;
    for (const root of this.reserveRoots) delete root.runtime.inGuardDist;
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
      : fighter.targetWorld.resolveCandidates(fighter, [fighter === this.activeRoots[0] ? this.activeRoots[1] : this.activeRoots[0]]);
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
      ...this.characterRoots().flatMap((root) =>
        this.effectActorWorld.helpers(root.id).map((actor) => ({ id: actor.serialId, rootId: actor.rootId, actor })),
      ),
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
    const [activeP1, activeP2] = this.activePair();
    const teamMode = this.teamPresentationMode();
    const globalAssertSpecial = matchRoundWorld.snapshotGlobalAssertSpecial(roots, this.tick);
    const rootPresentation = rootPresentationWorld.diagnostic({
      runtimeProfile: this.runtimeProfile,
      teamMode,
      roots,
      playableRoots: [activeP1, activeP2],
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
      backgroundTick: this.stageBackgroundTick(),
      p1: activeP1,
      p2: activeP2,
      cameraActors,
      envShakeWorld: this.envShakeWorld,
      envColorWorld: this.envColorWorld,
      effectLifecycleWorld: this.effectLifecycleWorld,
    });
    const teamRoundLifebar = this.runtimeProfile === "ikemen-go" && this.teamRoundMode !== "single"
      ? teamRoundLifebarWorld.snapshot({
          actors: this.teamRoundLifebarActors(),
          mode: this.teamRoundMode,
          visible: !globalAssertSpecial.activeFlags.includes("nobardisplay"),
          tick: this.tick,
        })
      : undefined;
    const teamRoundResourceBanks = this.runtimeProfile === "ikemen-go" && this.teamRoundMode !== "single"
      ? teamResourceBankWorld.snapshot({
          actors: this.teamResourceBankActors(),
          mode: this.teamRoundMode,
          lifeShare: this.teamLifeShare,
          powerShare: this.teamPowerShare,
          tick: this.tick,
        })
      : undefined;
    const teamRoundRedLifeShare = this.runtimeProfile === "ikemen-go" && this.teamRoundMode !== "single"
      ? redLifeShareWorld.snapshot({
          actors: this.redLifeShareRuntimeActors(),
          mode: this.teamRoundMode,
          lifeShare: this.teamLifeShare,
          tick: this.tick,
        })
      : undefined;
    const runtimeAuxiliaryResources = this.runtimeProfile === "ikemen-go"
      ? auxiliaryResourceProjectionWorld.snapshot({
          actors: this.auxiliaryResourceProjectionActors(),
          tick: this.tick,
        })
      : undefined;
    const snapshot = this.snapshotWorld.match({
      tick: this.tick,
      playing: this.playing,
      speed: this.speed,
      toggles: this.toggles,
      matchPause: this.pauseWorld.snapshot(),
      stage: presentationSnapshot.stage,
      round: this.snapshotRound(),
      p1: activeP1,
      p2: activeP2,
      reserveActors: this.inactiveRoots(),
      effects: presentationSnapshot.effects,
      compatibilitySession: compatibilityTelemetryWorld.buildSession([...this.matchRoster().actors]),
      tickSchedule: this.lastTickSchedule,
      rootPresentation,
      rootBodyPush: this.lastRootBodyPush,
      rootHitAdmission: this.lastRootHitAdmission,
      teamRoundLifebar,
      teamRoundResourceBanks,
      teamRoundRedLifeShare,
      runtimeAuxiliaryResources,
      logs: this.logs,
    });
    const reserveCompatibilitySession = compatibilityTelemetryWorld.buildSession(this.inactiveRoots());
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

  getTeamRoundDecision(): RuntimeTeamRoundDecision {
    const actors = this.teamRoundActors();
    const globalAssertSpecial = matchRoundWorld.snapshotGlobalAssertSpecial(this.characterRoots(), this.tick);
    return matchRoundWorld.snapshotTeamRoundDecision({
      actors,
      modeBySide: { 1: this.teamRoundMode, 2: this.teamRoundMode },
      roundNotOver: globalAssertSpecial.roundNotOver,
      tick: this.tick,
    });
  }

  applyTeamRoundHandoff(): RuntimeTeamRoundHandoffResult {
    const actors = this.teamRoundActors();
    const decision = matchRoundWorld.snapshotTeamRoundDecision({
      actors,
      modeBySide: { 1: this.teamRoundMode, 2: this.teamRoundMode },
      roundNotOver: matchRoundWorld.snapshotGlobalAssertSpecial(this.characterRoots(), this.tick).roundNotOver,
      tick: this.tick,
    });
    const result = matchRoundWorld.applyTeamRoundHandoff({ actors, decision });
    if (result.applied) {
      if (this.teamRoundMode === "turns" && !this.syncTurnsActiveRoots()) {
        throw new Error("Turns handoff committed without one active root per side");
      }
      this.logTeamRoundHandoff(result);
      this.reconcileTeamRedLifeShare();
    }
    return result;
  }

  reset(): void {
    this.resetRuntimeState();
    this.stageRoundStartTick = this.tick;
    this.activeRoots = [this.p1, this.p2];
    this.turnsContinuationActive = false;
    this.lastTurnsContinuation = undefined;
    this.matchOutcome.reset();
    this.lastRoundContext = this.roundContextWorld.reset(this.characterRoots().map(({ id }) => ({ id })));
    this.applyRoundContext(this.lastRoundContext);
    this.applyRuntimeRoundPhase();
  }

  private resetRuntimeState(options: { preserveRound?: boolean } = {}): void {
    this.roundWinPoseWorld.reset();
    resetRuntimeSocdInputState(this.socdInputState.p1);
    resetRuntimeSocdInputState(this.socdInputState.p2);
    this.previousIntroSkipInputs.p1.clear();
    this.previousIntroSkipInputs.p2.clear();
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
      resetRound: options.preserveRound !== true,
      roundTimerFrames: this.roundTimerFrames,
      preserveHelpers: options.preserveRound === true && this.runtimeProfile === "ikemen-go",
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
    this.lastRoundState5900 = undefined;
    if (this.runtimeProfile === "ikemen-go") {
      this.initializeCharacterIdentity();
    }
    this.resetTeamResourceBanks();
  }

  private tryAutomaticTurnsContinuation(): "continued" | "terminal" | "blocked" | "not-applicable" {
    if (this.runtimeProfile !== "ikemen-go" || this.teamRoundMode !== "turns") return "not-applicable";

    const roots = this.characterRoots();
    const actors = this.teamRoundActors();
    const globalAssertSpecial = matchRoundWorld.snapshotGlobalAssertSpecial(roots, this.tick);
    const baseDecision = matchRoundWorld.snapshotTeamRoundDecision({
      actors,
      modeBySide: { 1: "turns", 2: "turns" },
      roundNotOver: globalAssertSpecial.roundNotOver,
      tick: this.tick,
    });
    const isSimultaneousTurnsDraw = baseDecision.sides.every((side) =>
      side.mode === "turns" && side.memberKo && side.aliveActorIds.length === 0,
    );
    const effectiveLossBySide = isSimultaneousTurnsDraw
      ? this.matchOutcome.effectiveLossBySideForNextDraw()
      : { 1: false, 2: false };
    const decision = isSimultaneousTurnsDraw
      ? matchRoundWorld.snapshotTeamRoundDecision({
          actors,
          modeBySide: { 1: "turns", 2: "turns" },
          effectiveLossBySide,
          roundNotOver: globalAssertSpecial.roundNotOver,
          tick: this.tick,
        })
      : baseDecision;
    const winnerId = this.turnsContinuationWinnerId(decision, actors);
    const plan = this.turnsContinuationWorld.prepare({
      actors,
      modeBySide: { 1: "turns", 2: "turns" },
      stateActors: roots.map(roundState5900Actor),
      resourceActors: roots.map(roundResourceActor),
      roundNotOver: globalAssertSpecial.roundNotOver,
      winnerId,
      recoveryTimeTicks: this.round.remainingTimerFrames,
      matchOver: this.matchOutcome.isOver,
      effectiveLossBySide,
      nextRoundNo: this.round.currentRoundNo,
      tick: this.tick,
    });

    if (plan.status !== "replacement-required") {
      if (plan.status === "blocked") {
        this.lastTurnsContinuation = { ...plan, applied: false };
        this.playing = false;
        this.logs.unshift(`Turns continuation blocked: ${plan.diagnostics.join(", ") || "preflight"}`);
        return "blocked";
      }
      if (plan.status === "draw") {
        const nextRound = this.startNextRound();
        const drawContinuation = {
          ...plan,
          phases: [
            ...plan.phases,
            "draw:normal-round",
            nextRound.applied ? "continuation:complete" : "continuation:terminal",
          ],
          diagnostics: [...plan.diagnostics, ...nextRound.diagnostics],
          matchOutcome: nextRound.matchOutcome,
          applied: nextRound.applied,
        } satisfies RuntimeTurnsContinuationResult;
        this.lastTurnsContinuation = drawContinuation;
        if (!nextRound.applied) {
          this.playing = false;
          return "terminal";
        }
        this.logs.unshift(`Turns draw; round ${nextRound.nextRoundNo} started`);
        return "continued";
      }
      if (plan.status === "side-defeat") {
        const matchOutcome = this.matchOutcome.recordRound(this.turnsContinuationWinnerSide(plan.decision, actors));
        this.lastTurnsContinuation = { ...plan, matchOutcome, applied: false };
        if (matchOutcome.matchOver) {
          this.lastRoundContext = this.roundContextWorld.snapshot(true, ["match-over"]);
          this.applyRoundContext(this.lastRoundContext);
          this.logs.unshift(`Turns match over; side ${matchOutcome.winnerSide} wins`);
        }
        this.playing = false;
        return "terminal";
      }
      return "not-applicable";
    }

    this.lastTurnsContinuation = { ...plan, applied: false };
    if (!plan.ready) {
      this.playing = false;
      this.logs.unshift(`Turns continuation blocked: ${plan.diagnostics.join(", ") || "preflight"}`);
      return "blocked";
    }

    const handoff = matchRoundWorld.applyTeamRoundHandoff({ actors, decision: plan.decision });
    if (!handoff.applied) {
      const blocked = {
        ...plan,
        status: "blocked" as const,
        ready: false,
        diagnostics: [...plan.diagnostics, ...handoff.diagnostics, "handoff-commit-failed"].sort(),
        phases: [...plan.phases, "continuation:blocked"],
        applied: false,
      } satisfies RuntimeTurnsContinuationResult;
      this.lastTurnsContinuation = blocked;
      this.playing = false;
      this.logs.unshift(`Turns continuation blocked: ${blocked.diagnostics.join(", ")}`);
      return "blocked";
    }
    this.logTeamRoundHandoff(handoff);

    const desiredTeamStates = new Map(
      roots.map((root) => [root.id, root.runtime.teamState ? { ...root.runtime.teamState } : undefined]),
    );
    const nextActiveRoots = ([1, 2] as const).map((side) => roots
      .filter((root) => runtimeTeamSide(root) === side)
      .filter((root) => {
        const teamState = desiredTeamStates.get(root.id);
        return teamState?.playerType && !teamState.disabled && !teamState.standby && !teamState.overKo;
      })
      .sort((left, right) => (left.playerNo ?? Number.MAX_SAFE_INTEGER) - (right.playerNo ?? Number.MAX_SAFE_INTEGER))[0]) as [
        FighterMatchState | undefined,
        FighterMatchState | undefined,
      ];
    if (!nextActiveRoots[0] || !nextActiveRoots[1]) {
      const blocked = {
        ...plan,
        status: "blocked" as const,
        ready: false,
        diagnostics: [...plan.diagnostics, "active-root-missing"].sort(),
        phases: [...plan.phases, "continuation:blocked"],
        applied: false,
      } satisfies RuntimeTurnsContinuationResult;
      this.lastTurnsContinuation = blocked;
      this.playing = false;
      this.logs.unshift(`Turns continuation blocked: ${blocked.diagnostics.join(", ")}`);
      return "blocked";
    }

    const persistentState = new Map(
      roots.map((root) => [root.id, { vars: [...root.runtime.vars], fvars: [...root.runtime.fvars] }]),
    );
    const matchTick = this.tick;
    const matchFrameClock = this.frameClock;
    this.resetRuntimeState({ preserveRound: true });
    this.tick = matchTick;
    this.frameClock = matchFrameClock;
    this.lastTickSchedule = createIdleMatchTickSchedule(this.tick);
    this.round.restartCurrentRound(this.roundTimerFrames);
    this.activeRoots = [nextActiveRoots[0], nextActiveRoots[1]];
    this.turnsContinuationActive = true;
    this.applyRoundContext(this.lastRoundContext);
    this.applyRuntimeRoundPhase();

    for (const root of roots) {
      const desired = desiredTeamStates.get(root.id);
      if (desired && root.runtime.teamState) Object.assign(root.runtime.teamState, desired);
      const variables = persistentState.get(root.id);
      if (variables) {
        root.runtime.vars = [...variables.vars];
        root.runtime.fvars = [...variables.fvars];
      }
    }
    const stateByActorId = new Map(plan.resourceReset.states.map((state) => [state.actorId, state]));
    for (const root of roots) {
      const state = stateByActorId.get(root.id);
      if (!state) continue;
      root.runtime.life = state.lifeAfter;
      root.runtime.power = state.powerAfter;
      root.runtime.guardPoints = state.guardPointsAfter;
      root.runtime.dizzyPoints = state.dizzyPointsAfter;
      root.runtime.redLife = state.redLifeAfter;
    }
    const availableState5900Ids = new Set(plan.state5900.availableActorIds);
    for (const root of roots) {
      if (!availableState5900Ids.has(root.id)) continue;
      enterState(root, RUNTIME_ROUND_STATE_5900, undefined, { preserveAnimationWhenMissing: true });
    }
    this.lastRoundState5900 = plan.state5900;
    this.resetTeamResourceBanks();
    const matchOutcome = this.matchOutcome.recordRound(this.turnsContinuationWinnerSide(plan.decision, actors));
    const applied = {
      ...plan,
      phases: [...plan.phases, ...handoff.phases.slice(-2), "continuation:commit", "continuation:complete"],
      diagnostics: [],
      matchOutcome,
      applied: true,
    } satisfies RuntimeTurnsContinuationResult;
    this.lastTurnsContinuation = applied;
    this.logs.unshift(`Turns continuation ${nextActiveRoots[0].id}/${nextActiveRoots[1].id}; state 5900 entered`);
    return "continued";
  }

  private logTeamRoundHandoff(result: RuntimeTeamRoundHandoffResult): void {
    const handoffLogLines = [
      ...result.phases.map((phase) => `TeamRound ${phase}`),
      ...result.changes.map((change) => `Team ${change.side} ${change.role} ${change.actorId}`),
    ];
    for (const line of handoffLogLines.reverse()) {
      this.logs.unshift(line);
    }
  }

  private turnsContinuationWinnerId(
    decision: RuntimeTeamRoundDecision,
    actors: readonly RuntimeTeamRoundHandoffActor[],
  ): string | undefined {
    const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
    const winningSides = decision.sides.filter((side) =>
      !side.memberKo && side.aliveActorIds.some((actorId) => (actorsById.get(actorId)?.life ?? 0) > 0),
    );
    if (winningSides.length !== 1) return undefined;
    return winningSides[0]!.aliveActorIds.find((actorId) => (actorsById.get(actorId)?.life ?? 0) > 0);
  }

  private turnsContinuationWinnerSide(
    decision: RuntimeTeamRoundDecision,
    actors: readonly RuntimeTeamRoundHandoffActor[],
  ): RuntimeTeamSide | undefined {
    if (decision.winnerSide !== undefined) return decision.winnerSide;
    const winnerId = this.turnsContinuationWinnerId(decision, actors);
    return actors.find(({ id }) => id === winnerId)?.side;
  }

  startNextRound(): RuntimeNextRoundResult {
    const roundSnapshot = this.round.snapshot();
    const roots = this.characterRoots();
    const winnerRoot = roots.find((root) => root.label === roundSnapshot.winner);
    const winnerId = winnerRoot?.id;
    const plan = this.roundResourceResetWorld.prepare({
      actors: roots.map((root) => roundResourceActor(root)),
      mode: this.teamRoundMode,
      winnerId,
      nextRoundNo: this.round.currentRoundNo + 1,
    });
    const state5900 = this.roundState5900World.prepare(roots.map(roundState5900Actor));
    const roundContextPlan = this.roundContextWorld.prepareNextRound(plan.nextRoundNo, roots.map(({ id }) => ({ id })));
    if (!roundContextPlan.applied) {
      const matchOutcome = this.matchOutcome.blocked("round-context-unavailable");
      return {
        ...plan,
        applied: false,
        diagnostics: [...plan.diagnostics, ...roundContextPlan.diagnostics],
        matchOutcome,
        roundContext: roundContextPlan.snapshot,
        state5900,
      };
    }
    if (!this.round.isOver) {
      const matchOutcome = this.matchOutcome.blocked("round-not-over");
      return {
        ...plan,
        applied: false,
        diagnostics: [...plan.diagnostics, "round-not-over"],
        matchOutcome,
        roundContext: this.lastRoundContext,
        state5900,
      };
    }

    const matchOutcome = this.matchOutcome.recordRound(winnerRoot ? runtimeTeamSide(winnerRoot) : undefined);
    if (matchOutcome.matchOver) {
      this.lastRoundContext = this.roundContextWorld.snapshot(true, ["match-over"]);
      this.applyRoundContext(this.lastRoundContext);
      this.logs.unshift(matchOutcome.winnerSide === undefined
        ? "Match over; draw"
        : `Match over; side ${matchOutcome.winnerSide} wins`);
      return {
        ...plan,
        applied: false,
        diagnostics: [...plan.diagnostics, "match-over"],
        matchOutcome,
        roundContext: this.lastRoundContext,
        state5900,
      };
    }

    const persistentState = new Map(
      roots.map((root) => [root.id, {
        vars: [...root.runtime.vars],
        fvars: [...root.runtime.fvars],
      }]),
    );
    const matchTick = this.tick;
    const matchFrameClock = this.frameClock;
    this.resetRuntimeState({ preserveRound: true });
    this.tick = matchTick;
    this.frameClock = matchFrameClock;
    this.stageRoundStartTick = this.tick;
    this.lastTickSchedule = createIdleMatchTickSchedule(this.tick);
    this.round.startNextRound(this.roundTimerFrames);
    this.lastRoundContext = this.roundContextWorld.commit(roundContextPlan);
    this.applyRoundContext(this.lastRoundContext);
    this.applyRuntimeRoundPhase();

    const stateByActorId = new Map(plan.states.map((state) => [state.actorId, state]));
    for (const root of this.characterRoots()) {
      const state = stateByActorId.get(root.id);
      if (!state) continue;
      root.runtime.life = state.lifeAfter;
      root.runtime.power = state.powerAfter;
      root.runtime.guardPoints = state.guardPointsAfter;
      root.runtime.dizzyPoints = state.dizzyPointsAfter;
      root.runtime.redLife = state.redLifeAfter;
      const variables = persistentState.get(root.id);
      if (variables) {
        root.runtime.vars = [...variables.vars];
        root.runtime.fvars = [...variables.fvars];
      }
    }
    const availableState5900Ids = new Set(state5900.availableActorIds);
    for (const root of this.characterRoots()) {
      if (!availableState5900Ids.has(root.id)) continue;
      enterState(root, RUNTIME_ROUND_STATE_5900, undefined, { preserveAnimationWhenMissing: true });
    }
    this.lastRoundState5900 = state5900;
    this.resetTeamResourceBanks();
    const state5900Log = state5900.availableActorIds.length > 0
      ? `state 5900 entered for ${state5900.availableActorIds.join(",")}`
      : `state 5900 unavailable for ${state5900.unavailableActorIds.join(",") || "all roots"}`;
    this.logs.unshift(`Round ${plan.nextRoundNo} started; red life reset; ${state5900Log}`);
    return {
      ...plan,
      applied: true,
      matchOutcome,
      roundContext: this.lastRoundContext,
      state5900,
    };
  }

  private snapshotRound(): RoundSnapshot {
    const round = this.round.snapshot();
    const matchProjection = this.currentMatchOutcomeProjection();
    if (matchProjection) {
      round.matchProjection = matchProjection;
    }
    if (this.matchOutcome.roundsExisted > 0 || this.matchOutcome.isOver) {
      round.match = this.matchOutcome.snapshot();
    }
    if (this.lastRoundContext.roundNo > 1 || this.lastRoundContext.matchOver) {
      round.roundContext = this.lastRoundContext;
    }
    if (this.lastRoundState5900) {
      round.state5900 = this.lastRoundState5900;
    }
    if (this.lastTurnsContinuation) {
      round.turnsContinuation = this.lastTurnsContinuation;
    }
    const winPose = this.roundWinPoseWorld.snapshot();
    if (winPose) {
      round.winPose = winPose;
    }
    if (round.match?.matchOver && round.match.winnerSide === undefined) {
      round.message = "Match over - Draw";
    } else if (round.match?.matchOver) {
      const winnerLabel = this.activeRoots.find((root) => runtimeTeamSide(root) === round.match!.winnerSide)?.label ??
        (round.match.winnerSide === 1 ? this.p1.label : this.p2.label);
      round.message = `Match over - ${winnerLabel}`;
    }
    return round;
  }

  private stageBackgroundTick(): number {
    if (this.stage.resetBackgroundBetweenRounds !== true) {
      return this.tick;
    }
    return Math.max(0, this.tick - this.stageRoundStartTick);
  }

  private applyRoundContext(context: RuntimeRoundContextSnapshot): void {
    const byActorId = new Map(context.actors.map((actor) => [actor.actorId, actor]));
    for (const root of this.characterRoots()) {
      const actor = byActorId.get(root.id);
      if (!actor) continue;
      root.runtime.roundNo = actor.roundNo;
      root.runtime.roundsExisted = actor.roundsExisted;
      root.runtime.matchOver = context.matchOver;
    }
  }

  private isRoundPhase4Ready(): boolean {
    if (this.round.forceWinTimeFrames <= 0) return true;
    const roundState = this.round.snapshot().state;
    return this.activeRoots.every((root) => {
      const teamState = root.runtime.teamState;
      if (
        root.runtime.life <= 0
        || teamState?.disabled
        || teamState?.standby
        || teamState?.overKo
      ) {
        return true;
      }
      // IKEMEN waits for a controllable standing idle actor before phase 4,
      // then forces the handoff when over.forcewintime expires.
      return !(
        root.runtime.ctrl
        && root.runtime.stateType === "S"
        && root.runtime.moveType === "I"
        && roundState !== "timeover"
        && root.runtime.animNo !== 5
      );
    });
  }

  private applyRuntimeRoundPhase(): void {
    const phase = this.round.currentPhase;
    const matchProjection = this.currentMatchOutcomeProjection();
    const winPose = phase === 4 ? this.applyRoundWinPose() : undefined;
    const activeIds = new Set(this.activeRoots.map(({ id }) => id));
    for (const root of this.characterRoots()) {
      if (phase === 2) {
        delete root.runtime.roundPhase;
      } else {
        root.runtime.roundPhase = phase;
      }
      root.runtime.matchOver = root.runtime.matchOver === true || matchProjection?.matchOver === true;
      const actorWinPose = activeIds.has(root.id)
        ? winPose?.actors.find(({ actorId }) => actorId === root.id)
        : undefined;
      if (actorWinPose) {
        root.runtime.winPose = actorWinPose;
      } else {
        delete root.runtime.winPose;
      }
    }
  }

  private applyRoundWinPose(): RuntimeRoundWinPoseSnapshot | undefined {
    if (this.teamRoundMode === "turns") return undefined;
    const round = this.round.snapshot();
    const postRoundFrame = round.postRound?.frame ?? 0;
    const winPoseReadyFrame = this.round.postKoPhase4StartFrames + this.round.winPoseFrames;
    if (postRoundFrame < winPoseReadyFrame) return undefined;
    return this.roundWinPoseWorld.apply({
      phase: this.round.currentPhase,
      winner: round.winner,
      actors: this.activeRoots,
      canEnterState: (actor, stateNo) => canEnterState(actor, stateNo),
      enterState: (actor, stateNo) => enterState(actor, stateNo, undefined, { clearStateOwner: true }),
    });
  }

  private currentMatchOutcomeProjection(): RuntimeMatchOutcomeProjection | undefined {
    if (this.round.currentPhase !== 4 || this.teamRoundMode === "turns" || this.matchOutcome.isOver) {
      return undefined;
    }
    const round = this.round.snapshot();
    if (round.winner === undefined) return undefined;
    if (round.winner === "Draw") {
      const projection = this.matchOutcome.projectRound();
      return projection.matchOver ? projection : undefined;
    }
    const winnerRoot = this.characterRoots().find((root) => root.label === round.winner);
    if (!winnerRoot) return undefined;
    const projection = this.matchOutcome.projectRound(runtimeTeamSide(winnerRoot));
    return projection.matchOver ? projection : undefined;
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

function roundResourceActor(root: FighterMatchState): RuntimeRoundResourceActor {
  return {
    id: root.id,
    life: root.runtime.life,
    lifeMax: root.runtime.lifeMax,
    power: root.runtime.power ?? 0,
    powerMax: root.runtime.powerMax,
    guardPoints: root.runtime.guardPoints ?? 0,
    guardPointsMax: root.runtime.guardPointsMax,
    dizzyPoints: root.runtime.dizzyPoints ?? 0,
    dizzyPointsMax: root.runtime.dizzyPointsMax,
    redLife: root.runtime.redLife,
  };
}

function roundState5900Actor(root: FighterMatchState) {
  return {
    id: root.id,
    stateIds: [
      ...(root.runtimeProgram?.states.map(({ id }) => id) ?? []),
      ...(root.definition.states?.map(({ id }) => id) ?? []),
      ...(root.definition.animations.has(RUNTIME_ROUND_STATE_5900) ? [RUNTIME_ROUND_STATE_5900] : []),
    ],
    ...(root.definition.stateSources === undefined ? {} : { stateSources: root.definition.stateSources }),
  };
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

function redirectableResourceControllerType(controller: ControllerIr): RedirectableResourceControllerType | undefined {
  const normalizedType = controller.normalizedType as RedirectableResourceControllerType;
  return normalizedType === "ctrlset" ||
    normalizedType === "lifeadd" || normalizedType === "lifeset" ||
    normalizedType === "guardpointsadd" || normalizedType === "guardpointsset" ||
    normalizedType === "dizzypointsadd" || normalizedType === "dizzypointsset" ||
    normalizedType === "redlifeadd" || normalizedType === "redlifeset" ||
    normalizedType === "poweradd" || normalizedType === "powerset"
    ? normalizedType
    : undefined;
}

function redirectableEffectControllerType(controller: ControllerIr): RedirectableEffectControllerType | undefined {
  return controller.normalizedType === "projectile" || controller.normalizedType === "modifyprojectile"
    ? controller.normalizedType
    : undefined;
}

function resourceControllerRedirectExpression(controller: ControllerIr): string | undefined {
  if (redirectableResourceControllerType(controller) === undefined) {
    return undefined;
  }
  const operation = controller.operation;
  const compiledExpression = operation?.kind === "resource" && "redirectPlayerIdExpression" in operation
    ? operation.redirectPlayerIdExpression
    : undefined;
  if (compiledExpression !== undefined) {
    return compiledExpression.trim() || "invalid";
  }
  const rawExpression = findControllerParam(controller, "redirectid");
  if (rawExpression === undefined) {
    return undefined;
  }
  return rawExpression.trim() || "invalid";
}

function effectControllerRedirectExpression(controller: ControllerIr): string | undefined {
  if (redirectableEffectControllerType(controller) === undefined) {
    return undefined;
  }
  const operation = controller.operation;
  const compiledExpression =
    (operation?.kind === "projectile" || operation?.kind === "modifyprojectile")
      ? operation.redirectPlayerIdExpression
      : undefined;
  if (compiledExpression !== undefined) {
    return compiledExpression.trim() || "invalid";
  }
  const rawExpression = findControllerParam(controller, "redirectid");
  if (rawExpression === undefined) {
    return undefined;
  }
  return rawExpression.trim() || "invalid";
}

function targetControllerRedirectExpression(controller: ControllerIr): string | undefined {
  if (redirectableTargetControllerType(controller) === undefined) {
    return undefined;
  }
  const operation = controller.operation;
  const compiledExpression = operation !== undefined && "redirectPlayerIdExpression" in operation
    ? operation.redirectPlayerIdExpression
    : undefined;
  if (compiledExpression !== undefined) {
    return compiledExpression.trim() || "invalid";
  }
  const rawExpression = findControllerParam(controller, "redirectid");
  if (rawExpression === undefined) {
    return undefined;
  }
  return rawExpression.trim() || "invalid";
}

function redirectableTargetControllerType(controller: ControllerIr): RedirectableTargetControllerType | undefined {
  return controller.normalizedType === "targetlifeadd" ||
    controller.normalizedType === "targetredlifeadd" ||
    controller.normalizedType === "targetguardpointsadd" ||
    controller.normalizedType === "targetdizzypointsadd" ||
    controller.normalizedType === "targetpoweradd" ||
    controller.normalizedType === "targetfacing" ||
    controller.normalizedType === "targetdrop" ||
    controller.normalizedType === "targetbind" ||
    controller.normalizedType === "targetstate" ||
    controller.normalizedType === "targetveladd" ||
    controller.normalizedType === "targetvelset" ||
    controller.normalizedType === "bindtotarget"
    ? controller.normalizedType
    : undefined;
}

function resolveRedirectedResourceController(
  controller: ControllerIr,
  caller: FighterMatchState,
  context: ReturnType<typeof runtimeControllerContext>,
): ControllerIr | undefined {
  const controllerType = redirectableResourceControllerType(controller);
  if (controllerType === undefined) {
    return undefined;
  }
  const staticOperation = controller.operation;
  const operation =
    staticOperation?.kind === "resource" && staticOperation.controllerType === controllerType
      ? staticOperation
      : resolveRuntimeResourceControllerOperation(controller, caller.runtime, context);
  if (operation?.kind !== "resource" || operation.controllerType !== controllerType) {
    return undefined;
  }
  return controller.operation === operation ? controller : { ...controller, operation };
}

function handlePlayerInput(
  fighter: FighterMatchState,
  input: Set<string>,
  opponent: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
  inputControlWorld: RuntimeInputControlWorld,
  playerIdTarget?: PlayerIdTargetResolver,
  characters?: readonly FighterMatchState[],
  onRootRedirect?: RootControllerRedirectHandler,
  onRootTargetDispatchLease?: RootTargetDispatchLeaseHandler,
  deferControl?: (apply: () => RuntimeInputControlResult) => RuntimeInputControlResult,
  roundNoDamage = false,
): void {
  inputControlWorld.handlePlayerInput(fighter, input, {
    hasStun: hasRuntimeStun(fighter),
    preserveImportedStateMoveType: shouldPreserveImportedStateMoveType(fighter),
    deferControl,
    runStateEntrySetup: () =>
      runStateEntrySetupControllers(
        fighter,
        opponent,
        stageBounds,
        gameSpace,
        tick,
        playerIdTarget,
        characters,
        onRootRedirect,
        onRootTargetDispatchLease,
        roundNoDamage,
      ),
    tryApplyStateEntry: () => tryApplyStateEntry(fighter, opponent, stageBounds, gameSpace, tick, characters, playerIdTarget),
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
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  playerIdTarget?: PlayerIdTargetResolver,
  characters?: readonly FighterMatchState[],
  onRootRedirect?: RootControllerRedirectHandler,
  onRootTargetDispatchLease?: RootTargetDispatchLeaseHandler,
  deferControl?: (apply: () => RuntimeInputControlResult) => RuntimeInputControlResult,
  roundNoDamage = false,
): void {
  inputControlWorld.handleSimpleAi(fighter, opponent, tick, {
    hasStun: hasRuntimeStun(fighter),
    preserveImportedStateMoveType: shouldPreserveImportedStateMoveType(fighter),
    deferControl,
    runStateEntrySetup: () =>
      runStateEntrySetupControllers(
        fighter,
        opponent,
        stageBounds,
        gameSpace,
        tick,
        playerIdTarget,
        characters,
        onRootRedirect,
        onRootTargetDispatchLease,
        roundNoDamage,
      ),
    tryApplyStateEntry: () => tryApplyStateEntry(fighter, opponent, stageBounds, gameSpace, tick, characters, playerIdTarget),
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
  onRootRedirect?: RootControllerRedirectHandler,
  onRootTargetDispatchLease?: RootTargetDispatchLeaseHandler,
  playerIdTarget?: PlayerIdTargetResolver,
  characters?: readonly FighterMatchState[],
  runDeferredInputControl?: () => boolean,
  roundNoDamage = false,
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
        {
          onTeamStandby,
          onRootRedirect,
          onRootTargetDispatchLease,
          playerIdTarget,
          characters,
          runtimeProfile,
          roundNoDamage,
          includeStateEntries:
            fighter.definition.source === "imported" && runDeferredInputControl !== undefined,
          runDeferredInputControl,
        },
      );
    },
    applyCommon1FallDefenseUp: (actor) => {
      recoveryWorld.applyCommon1FallDefenseUp(actor);
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
  onRootRedirect?: RootControllerRedirectHandler,
  onRootTargetDispatchLease?: RootTargetDispatchLeaseHandler,
  playerIdTarget?: PlayerIdTargetResolver,
  characters?: readonly FighterMatchState[],
  roundNoDamage = false,
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
    {
      onlyIgnoreHitPause: true,
      onTeamStandby,
      onRootRedirect,
      onRootTargetDispatchLease,
      playerIdTarget,
      characters,
      runtimeProfile,
      roundNoDamage,
    },
  );
}

type ActiveControllerRunOptions = {
  onlyIgnoreHitPause?: boolean;
  stateNo?: number;
  stateSpecial?: MugenStateSpecial;
  stateOwner?: FighterMatchState;
  includeRootGlobalStates?: boolean;
  includeStateEntries?: boolean;
  includeCurrentState?: boolean;
  runDeferredInputControl?: () => boolean;
  participation?: RuntimeRootCnsParticipation;
  onBlocked?: (controller: ControllerIr, route: string) => void;
  onTeamStandby?: TeamStandbyControllerHandler;
  onRootRedirect?: RootControllerRedirectHandler;
  onRootTargetDispatchLease?: RootTargetDispatchLeaseHandler;
  playerIdTarget?: PlayerIdTargetResolver;
  characters?: readonly FighterMatchState[];
  runtimeProfile?: RuntimeCompatibilityProfile;
  roundNoDamage?: boolean;
};

function recordRootTargetLifeKoCause(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  characters: readonly FighterMatchState[] | undefined,
  sourceActor: RuntimeTargetWorldActor,
  targetActor: RuntimeTargetWorldActor,
  lifeBefore: number,
): void {
  const roots = [fighter, opponent, ...(characters ?? [])];
  const sourceRoot = roots.find((root) => root.id === sourceActor.id);
  const victimRoot = roots.find((root) => root.id === targetActor.id);
  if (
    !sourceRoot ||
    !victimRoot ||
    (sourceRoot !== fighter && sourceRoot !== opponent) ||
    (victimRoot !== fighter && victimRoot !== opponent)
  ) {
    return;
  }
  const winner = victimRoot === fighter ? opponent : fighter;
  recordRuntimeTargetLifeKoCause(victimRoot, winner, lifeBefore, sourceRoot.id);
}

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
  const createPlayerIdTarget = (actor: FighterMatchState) =>
    options.playerIdTarget ? (playerId: number) => options.playerIdTarget!(actor, playerId) : undefined;
  const hookSet = activeControllerHookSetWorld.create<FighterMatchState>({
    resolveNumber: ({ value, expression, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) =>
      resolveDispatchNumber(
        value,
        expression,
        actor,
        targetOpponent,
        stateOwner,
        stageBounds,
        activeTick,
        gameSpace,
        options.characters,
        createPlayerIdTarget(actor),
      ),
    resolveBoolean: ({ value, expression, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) =>
      resolveDispatchBoolean(
        value,
        expression,
        actor,
        targetOpponent,
        stateOwner,
        stageBounds,
        activeTick,
        gameSpace,
        options.characters,
        createPlayerIdTarget(actor),
      ),
    recordController: runtimeActiveControllerTelemetryHooks.recordController,
    enterState: (actor, stateId, stateOptions) => enterState(actor, stateId, undefined, stateOptions),
    applyControl: (actor, ctrl) => applyRuntimeControl(actor.runtime, ctrl),
    changeAction: (actor, actionId, source, actionOwner, elementOptions) =>
      changeAction(actor, actionId, source, actionOwner.definition, elementOptions),
    hitDef: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      hitDefControllerDispatchWorld.apply({
        actor,
        defaultHitFlag: runtimeDefaultHitFlagForSource(actor.definition.source),
        controller,
        frame: getCurrentCollisionFrame(actor),
        constants: actor.definition.constants,
        resolveSoundValue: (key) => resolveAudioSoundValueParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    reversalDef: ({ controller }) => {
      reversalControllerDispatchWorld.apply({
        actor: fighter,
        controller,
        hitbox: frameWorld.firstCurrentAttackBox(fighter),
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
    height: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      const context = runtimeControllerContext(
        actor,
        stateOwner,
        activeTick,
        stageBounds,
        targetOpponent,
        gameSpace,
        createPlayerIdTarget(actor),
      );
      const redirectExpression =
        (controller.operation?.kind === "collision" && controller.operation.controllerType === "height"
          ? controller.operation.redirectPlayerIdExpression
          : undefined) ?? findControllerParam(controller, "redirectid")?.trim();
      const target = redirectExpression
        ? options.onRootRedirect?.(fighter, redirectExpression, context, "height")
        : fighter;
      if (!target) {
        options.onBlocked?.(controller, "height-redirect");
        return;
      }
      const callerWidth = actor.definition.localCoord?.[0] ?? 320;
      const targetWidth = target.definition.localCoord?.[0] ?? 320;
      actorConstraintControllerDispatchWorld.applyHeight({
        actor: target,
        controller,
        actorConstraintWorld,
        resolveHeight: {
          resolvePair: (key) => resolveHeightPairParam(controller, key, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        },
        valueScale: targetWidth / callerWidth,
        ...runtimeActiveControllerTelemetryHooks,
      });
    },
    overrideClsn: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      const operation = controller.operation?.kind === "collision" && controller.operation.controllerType === "overrideclsn"
        ? controller.operation
        : undefined;
      const context = runtimeControllerContext(
        actor,
        stateOwner,
        activeTick,
        stageBounds,
        targetOpponent,
        gameSpace,
        createPlayerIdTarget(actor),
      );
      const redirectExpression = operation?.redirectPlayerIdExpression ?? findControllerParam(controller, "redirectid")?.trim();
      const target = redirectExpression
        ? options.onRootRedirect?.(fighter, redirectExpression, context, "overrideclsn")
        : fighter;
      if (!target) {
        options.onBlocked?.(controller, "overrideclsn-redirect");
        return;
      }
      runtimeActiveControllerTelemetryHooks.recordController(target, controller.source);
      const callerWidth = actor.definition.localCoord?.[0] ?? 320;
      const targetWidth = target.definition.localCoord?.[0] ?? 320;
      const applied = collisionOverrideWorld.apply(
        target.runtime,
        controller.source,
        operation,
        resolveCollisionOverrideParams(controller, actor, targetOpponent, stateOwner, stageBounds, activeTick),
        targetWidth / callerWidth,
      );
      if (applied) runtimeActiveControllerTelemetryHooks.recordOperation(target, applied);
    },
    depth: ({ controller, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      const context = runtimeControllerContext(
        actor,
        stateOwner,
        activeTick,
        stageBounds,
        targetOpponent,
        gameSpace,
        createPlayerIdTarget(actor),
      );
      const redirectExpression =
        (controller.operation?.kind === "collision" && controller.operation.controllerType === "depth"
          ? controller.operation.redirectPlayerIdExpression
          : undefined) ?? findControllerParam(controller, "redirectid")?.trim();
      const target = redirectExpression
        ? options.onRootRedirect?.(fighter, redirectExpression, context, "depth")
        : fighter;
      if (!target) {
        options.onBlocked?.(controller, "depth-redirect");
        return;
      }
      actorConstraintControllerDispatchWorld.applyDepth({
        actor: target,
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
      const context = runtimeControllerContext(
        actor,
        stateOwner,
        activeTick,
        stageBounds,
        targetOpponent,
        gameSpace,
        createPlayerIdTarget(actor),
      );
      const redirectControllerType = redirectableEffectControllerType(controller);
      const redirectExpression = effectControllerRedirectExpression(controller);
      const redirectLease = redirectExpression && redirectControllerType !== undefined
        ? options.onRootTargetDispatchLease?.(
            fighter,
            redirectExpression,
            context,
            redirectControllerType,
            "root-active",
            [],
          )
        : undefined;
      const target = redirectExpression
        ? options.onRootTargetDispatchLease
          ? redirectLease?.destination
          : redirectControllerType === undefined
            ? undefined
            : options.onRootRedirect?.(fighter, redirectExpression, context, redirectControllerType)
        : fighter;
      if (!target) {
        options.onBlocked?.(controller, `${redirectControllerType ?? "effect"}-redirect`);
        return;
      }
      const mirrorRedirectedEffectTelemetry =
        redirectControllerType !== undefined &&
        target !== fighter &&
        !compatibilityTelemetryWorld.isImportedActor(target);
      const applyDispatch = () => {
        effectSpawnControllerDispatchWorld.apply({
          actor: target,
          opponent: target === fighter ? opponent : targetOpponent,
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
                    options.characters,
                    createPlayerIdTarget(actor),
                  )
              : undefined,
          resolveHelperOwnProjectile:
            effect === "helper" && options.runtimeProfile === "ikemen-go"
              ? (operation) =>
                  resolveDispatchBoolean(
                    operation.ownProjectile,
                    operation.ownProjectileExpression,
                    actor,
                    targetOpponent,
                    stateOwner,
                    stageBounds,
                    activeTick,
                    gameSpace,
                    options.characters,
                    createPlayerIdTarget(actor),
                  )
              : undefined,
          resolveHelperOwnPalette:
            effect === "helper" && options.runtimeProfile === "ikemen-go"
              ? (operation) =>
                  resolveDispatchBoolean(
                    operation.ownPalette,
                    operation.ownPaletteExpression,
                    actor,
                    targetOpponent,
                    stateOwner,
                    stageBounds,
                    activeTick,
                    gameSpace,
                    options.characters,
                    createPlayerIdTarget(actor),
                  )
              : undefined,
          resolveHelperPreserve:
            effect === "helper" && options.runtimeProfile === "ikemen-go"
              ? (operation) =>
                  resolveDispatchBoolean(
                    operation.preserve,
                    operation.preserveExpression,
                    actor,
                    targetOpponent,
                    stateOwner,
                    stageBounds,
                    activeTick,
                    gameSpace,
                    options.characters,
                    createPlayerIdTarget(actor),
                  )
              : undefined,
          resolveHelperOwnClsnScale:
            effect === "helper" && options.runtimeProfile === "ikemen-go"
              ? (operation) =>
                  resolveDispatchBoolean(
                    operation.ownClsnScale,
                    operation.ownClsnScaleExpression,
                    actor,
                    targetOpponent,
                    stateOwner,
                    stageBounds,
                    activeTick,
                    gameSpace,
                    options.characters,
                    createPlayerIdTarget(actor),
                  )
              : undefined,
          resolveHelperClsnProxy:
            effect === "helper" && options.runtimeProfile === "ikemen-go"
              ? (operation) =>
                  resolveDispatchBoolean(
                    operation.clsnProxy,
                    operation.clsnProxyExpression,
                    actor,
                    targetOpponent,
                    stateOwner,
                    stageBounds,
                    activeTick,
                    gameSpace,
                    options.characters,
                    createPlayerIdTarget(actor),
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
          recordController: (recordedTarget, recordedController) => {
            runtimeActiveControllerTelemetryHooks.recordController(recordedTarget, recordedController);
            if (mirrorRedirectedEffectTelemetry) {
              runtimeActiveControllerTelemetryHooks.recordController(fighter, recordedController);
            }
          },
          recordOperation: (recordedTarget, operation) => {
            runtimeActiveControllerTelemetryHooks.recordOperation(recordedTarget, operation);
            if (mirrorRedirectedEffectTelemetry) {
              runtimeActiveControllerTelemetryHooks.recordOperation(fighter, operation);
            }
          },
        });
      };
      if (redirectLease) {
        redirectedTargetDispatchWorld.execute(redirectLease, applyDispatch);
      } else {
        applyDispatch();
      }
    },
    target: ({ controller, effect, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) => {
      const context = runtimeControllerContext(
        actor,
        stateOwner,
        activeTick,
        stageBounds,
        targetOpponent,
        gameSpace,
        createPlayerIdTarget(actor),
      );
      const redirectControllerType = redirectableTargetControllerType(controller);
      const redirectExpression = targetControllerRedirectExpression(controller);
      const redirectLease = redirectExpression && redirectControllerType !== undefined
        ? options.onRootTargetDispatchLease?.(
            fighter,
            redirectExpression,
            context,
            redirectControllerType,
            "root-active",
            [...(options.characters ?? []), targetOpponent],
          )
        : undefined;
      const target = redirectExpression
        ? options.onRootTargetDispatchLease
          ? redirectLease?.destination
          : redirectControllerType === undefined
            ? undefined
            : options.onRootRedirect?.(fighter, redirectExpression, context, redirectControllerType)
        : fighter;
      if (!target) {
        options.onBlocked?.(controller, "target-redirect");
        return;
      }
      const candidateTargets = redirectLease
        ? [...redirectLease.candidateTargets]
        : target === fighter
        ? [targetOpponent]
        : [...new Map(
            [...(options.characters ?? []), targetOpponent].map((candidate) => [candidate.id, candidate] as const),
          ).values()].filter((candidate) => candidate.id !== target.id);
      const mirrorRedirectedTargetTelemetry =
        redirectControllerType !== undefined &&
        target !== fighter &&
        !compatibilityTelemetryWorld.isImportedActor(target);
      const applyDispatch = () => targetControllerDispatchWorld.apply({
        actor: target,
        candidateTargets,
        controller,
        effect,
        targetWorld: redirectLease?.targetWorld ?? target.targetWorld,
        recordController: (recordedTarget, recordedController) => {
          runtimeActiveControllerTelemetryHooks.recordController(recordedTarget, recordedController);
          if (mirrorRedirectedTargetTelemetry) {
            runtimeActiveControllerTelemetryHooks.recordController(fighter, recordedController);
          }
        },
        recordOperation: (recordedTarget, operation) => {
          runtimeActiveControllerTelemetryHooks.recordOperation(recordedTarget, operation);
          if (mirrorRedirectedTargetTelemetry) {
            runtimeActiveControllerTelemetryHooks.recordOperation(fighter, operation);
          }
        },
        recordTargetLifeAdd: (sourceActor, targetActor, lifeBefore) =>
          recordRootTargetLifeKoCause(fighter, opponent, options.characters, sourceActor, targetActor, lifeBefore),
        recordDispatch: (selection) => {
          if (redirectExpression === undefined) return;
          compatibilityTelemetryWorld.recordRedirectedTargetDispatch(
            fighter,
            createRuntimeRedirectedTargetDispatchObservation(selection, {
              route: "root-active",
              callerId: fighter.id,
              destinationId: target.id,
              stateOwnerId: redirectLease?.stateOwnerId ?? target.stateOwner?.id ?? target.id,
              ...(redirectLease?.destinationRevision === undefined
                ? {}
                : { destinationRevision: redirectLease.destinationRevision }),
              redirectExpression,
              writebackActorIds: selection.mutatedActorIds,
              writebackMode: "direct",
              sourceStateNo: actor.runtime.stateNo,
            }),
          );
        },
        scaleIncomingDamage: scaleRuntimeIncomingDamage,
        canEnterTargetState: (selectedTarget, stateId) =>
          canEnterState(selectedTarget, stateId, target.stateOwner ?? target),
        enterTargetState: (selectedTarget, stateId) => {
          const result = targetStateEntryWorld.enter({
            actor: target,
            target: selectedTarget,
            stateId,
            hooks: {
              canEnterState: (targetActor, targetStateId, stateOwner) =>
                canEnterState(targetActor, targetStateId, stateOwner),
              enterState: (targetActor, targetStateId, targetOptions) =>
                enterState(targetActor, targetStateId, undefined, targetOptions),
            },
          });
          return result.entered;
        },
        constants: target.definition.constants,
        getTargetConst: (target, name) => runtimeDefinitionConst(target.definition, name),
      });
      if (redirectLease) {
        redirectedTargetDispatchWorld.execute(redirectLease, applyDispatch);
      } else {
        applyDispatch();
      }
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
          createPlayerIdTarget(actor),
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
      const context = runtimeControllerContext(
        actor,
        owner,
        activeTick,
        stageBounds,
        targetOpponent,
        gameSpace,
        createPlayerIdTarget(actor),
      );
      const redirectableBoundsController = dispatch.controller.normalizedType === "screenbound" || dispatch.controller.normalizedType === "playerpush";
      const redirectableResourceType = redirectableResourceControllerType(dispatch.controller);
      const redirectExpression = redirectableResourceType !== undefined
        ? resourceControllerRedirectExpression(dispatch.controller)
        : redirectableBoundsController
          ? (((dispatch.controller.operation?.kind === "bounds" && dispatch.controller.operation.controllerType === "screenbound") ||
                (dispatch.controller.operation?.kind === "collision" && dispatch.controller.operation.controllerType === "playerpush")
              ? dispatch.controller.operation.redirectPlayerIdExpression
              : undefined) ?? findControllerParam(dispatch.controller, "redirectid")?.trim())
          : undefined;
      const redirectControllerType = redirectableResourceType ??
        (redirectableBoundsController
          ? dispatch.controller.normalizedType as "screenbound" | "playerpush"
          : undefined);
      const resourceRedirectLease = redirectExpression && redirectableResourceType !== undefined
        ? options.onRootTargetDispatchLease?.(
            fighter,
            redirectExpression,
            context,
            redirectableResourceType,
            "root-active",
            [],
          )
        : undefined;
      const target = redirectExpression
        ? redirectableResourceType !== undefined && options.onRootTargetDispatchLease
          ? resourceRedirectLease?.destination
          : redirectControllerType === undefined
            ? undefined
            : options.onRootRedirect?.(fighter, redirectExpression, context, redirectControllerType)
        : fighter;
      if (!target) {
        options.onBlocked?.(dispatch.controller, `${redirectControllerType ?? "root"}-redirect`);
        return;
      }
      const applyDispatch = () => {
        const redirectedController = redirectableResourceType !== undefined && redirectExpression
          ? resolveRedirectedResourceController(dispatch.controller, actor, context)
          : dispatch.controller;
        if (!redirectedController) {
          options.onBlocked?.(dispatch.controller, `${redirectableResourceType}-redirect-value`);
          return;
        }
        const mirrorRedirectedResourceTelemetry =
          redirectableResourceType !== undefined &&
          target !== fighter &&
          !compatibilityTelemetryWorld.isImportedActor(target);
        if (mirrorRedirectedResourceTelemetry) {
          runtimeActiveControllerTelemetryHooks.recordController(fighter, dispatch.controller.source);
        }
        const lifeBefore = target.runtime.life;
        controllerDispatchWorld.apply(target, redirectedController, {
          context,
          roundNoDamage: options.roundNoDamage,
          ...runtimeActiveControllerTelemetryHooks,
        });
        if (target === fighter) {
          recordRuntimeRootSelfKoCause(
            target,
            opponent,
            lifeBefore,
            redirectExpression === undefined ? owner.id : target.stateOwner?.id ?? target.id,
          );
        }
        if (mirrorRedirectedResourceTelemetry && redirectedController.operation) {
          runtimeActiveControllerTelemetryHooks.recordOperation(fighter, redirectedController.operation);
        }
      };
      if (resourceRedirectLease) {
        redirectedTargetDispatchWorld.execute(resourceRedirectLease, applyDispatch);
      } else {
        applyDispatch();
      }
    },
  });

  const participation = options.participation ?? "playable";
  const executeRootState = (
    stateNo?: number,
    stateSpecial?: MugenStateSpecial,
    stateOwner?: FighterMatchState,
    onlyIgnoreHitPause = options.onlyIgnoreHitPause,
  ): void => {
    rootCnsExecutionWorld.execute({
      actor: fighter,
      opponent,
      tick,
      ...(stateNo === undefined ? {} : { stateNo }),
      ...(stateSpecial === undefined ? {} : { stateSpecial }),
      ...(stateOwner === undefined ? {} : { stateOwner }),
      onlyIgnoreHitPause,
      controllerIgnoresHitPause,
      triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
        triggersPass(
          controller,
          actor,
          targetOpponent,
          owner,
          activeTick,
          stageBounds,
          gameSpace,
          options.characters,
          options.playerIdTarget,
        ),
      dispatchController: dispatchStateProgramController,
      stateHooks: hookSet.stateHooks,
      sideEffectHooks: hookSet.sideEffectHooks,
      hooks: hookSet.hooks,
      onBlocked: options.onBlocked,
    }, participation);
  };

  const includeRootGlobalStates = options.includeRootGlobalStates !== false;
  const includeCurrentState = options.includeCurrentState !== false;
  if (includeRootGlobalStates && options.runtimeProfile === "ikemen-go") {
    executeRootState(-4, undefined, fighter, false);
  }
  const supportsRootGlobalStates = options.runtimeProfile === "mugen-1.1" || options.runtimeProfile === "ikemen-go";
  if (includeRootGlobalStates && supportsRootGlobalStates) {
    if (fighter.stateOwner === undefined) {
      executeRootState(-3, undefined, fighter);
    }
    executeRootState(-2, undefined, fighter);
  }
  const deferredInputApplied = options.onlyIgnoreHitPause
    ? false
    : options.runDeferredInputControl?.() ?? false;
  if (options.includeStateEntries && !options.onlyIgnoreHitPause && !deferredInputApplied) {
    runStateEntrySetupControllers(
      fighter,
      opponent,
      stageBounds,
      gameSpace,
      tick,
      options.playerIdTarget,
      options.characters,
      options.onRootRedirect,
      options.onRootTargetDispatchLease,
      options.roundNoDamage,
    );
    tryApplyStateEntry(
      fighter,
      opponent,
      stageBounds,
      gameSpace,
      tick,
      options.characters,
      options.playerIdTarget,
    );
  }
  if (includeCurrentState) {
    executeRootState(options.stateNo, options.stateSpecial, options.stateOwner);
  }
  if (includeRootGlobalStates && options.runtimeProfile === "ikemen-go") {
    executeRootState(1, "plus-one", fighter, false);
  }
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
  playerIdTarget?: (playerId: number) => ExpressionRedirectTarget | undefined,
) {
  return controllerEvaluationContextWorld.create({
    actor: fighter,
    owner,
    opponent,
    root: fighter,
    target: opponent ? (targetId) => expressionContextWorld.resolveTargetRedirect(fighter, opponent, targetId) : undefined,
    playerIdTarget,
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
  return frameWorld.currentHurtBoxes(fighter);
}

function getRuntimeCollisionBoxes(fighter: FighterMatchState, boxType: MugenCollisionBoxType): MugenAnimationFrame["clsn1"] {
  if (boxType === "clsn1") return frameWorld.currentAttackBoxes(fighter);
  if (boxType === "clsn2") return frameWorld.currentHurtBoxes(fighter);
  if (boxType === "size") return [runtimePushSizeBox(fighter)];
  return [];
}

function runtimePushSizeBox(fighter: FighterMatchState) {
  return resolveRuntimePushSizeBox(fighter.definition.constants, fighter.runtime.stateType);
}

function applyAutoGuardStart(
  defender: FighterMatchState,
  attacker: FighterMatchState,
  guardWorld: RuntimeGuardWorld,
  options: { useAnyLatchedAttacker?: boolean } = {},
): void {
  autoGuardStartWorld.apply({
    defender,
    attacker,
    guardWorld,
    hooks: {
      isInGuardDistance: (candidateDefender, candidateAttacker) =>
        isRuntimeInGuardDistLatched(candidateDefender, options.useAnyLatchedAttacker ? undefined : candidateAttacker),
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
    owner.runtimeProgram?.states.find((candidate) => matchesMugenStateIdentity(candidate, fighter.runtime.stateNo))?.source ??
    owner.definition.states?.find((candidate) => matchesMugenStateIdentity(candidate, fighter.runtime.stateNo));
  return state?.moveType?.toUpperCase() === "H";
}

function evaluateRuntimeInGuardDist(fighter: FighterMatchState, opponent: FighterMatchState): boolean {
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

function refreshRuntimeDirectInGuardDist(
  defender: FighterMatchState,
  attackers: readonly FighterMatchState[],
  guardDistanceWorld: RuntimeGuardDistanceWorld = defaultGuardDistanceWorld,
  tick = 0,
): void {
  const attacker = attackers.find((candidate) =>
    guardDistanceWorld.isInGuardDistance(
      {
        runtime: defender.runtime,
        hurtBoxes: frameWorld.currentHurtBoxes(defender),
      },
      {
        runtime: candidate.runtime,
        currentMove: candidate.currentMove,
        moveTick: candidate.moveTick,
        hasHit: candidate.hasHit,
      },
    ),
  );
  if (attacker) {
    defender.runtime.inGuardDist = {
      attackerId: attacker.id,
      source: "direct",
      observedTick: tick,
    };
  } else {
    delete defender.runtime.inGuardDist;
  }
}

function isRuntimeInGuardDistLatched(defender: FighterMatchState, attacker?: FighterMatchState): boolean {
  return attacker ? defender.runtime.inGuardDist?.attackerId === attacker.id : defender.runtime.inGuardDist !== undefined;
}

function getCurrentFrame(fighter: FighterMatchState): MugenAnimationFrame | undefined {
  return frameWorld.currentFrame(fighter);
}

function getCurrentCollisionFrame(fighter: FighterMatchState): MugenAnimationFrame | undefined {
  const frame = getCurrentFrame(fighter);
  return frame ? { ...frame, clsn1: frameWorld.currentAttackBoxes(fighter), clsn2: frameWorld.currentHurtBoxes(fighter) } : undefined;
}

function tryApplyStateEntry(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  gameSpace: ExpressionGameSpace,
  tick: number,
  characters?: readonly FighterMatchState[],
  playerIdTarget?: PlayerIdTargetResolver,
): boolean {
  return stateEntryRouteWorld.apply(fighter, opponent, tick, {
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(
        controller,
        actor,
        targetOpponent,
        owner,
        activeTick,
        stageBounds,
        gameSpace,
        characters,
        playerIdTarget,
      ),
    resolveStateId: (dispatch, _controller, actor, targetOpponent, stageTime) =>
      resolveDispatchNumber(
        dispatch.stateId,
        dispatch.stateExpression,
        actor,
        targetOpponent,
        actor,
        stageBounds,
        stageTime,
        gameSpace,
        characters,
        playerIdTarget ? (playerId) => playerIdTarget(actor, playerId) : undefined,
      ),
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
  playerIdTarget?: PlayerIdTargetResolver,
  characters?: readonly FighterMatchState[],
  onRootRedirect?: RootControllerRedirectHandler,
  onRootTargetDispatchLease?: RootTargetDispatchLeaseHandler,
  roundNoDamage = false,
): void {
  stateEntrySetupWorld.apply({
    actor: fighter,
    opponent,
    tick,
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(
        controller,
        actor,
        targetOpponent,
        owner,
        activeTick,
        stageBounds,
        gameSpace,
        characters,
        playerIdTarget,
    ),
    executeController: (controller, actor, stageTime) => {
      const context = runtimeControllerContext(
        actor,
        actor,
        stageTime,
        stageBounds,
        opponent,
        gameSpace,
        playerIdTarget ? (playerId) => playerIdTarget(actor, playerId) : undefined,
      );
      const targetRedirectControllerType = redirectableTargetControllerType(controller);
      if (targetRedirectControllerType !== undefined) {
        const redirectExpression = targetControllerRedirectExpression(controller);
        const redirectLease = redirectExpression
          ? onRootTargetDispatchLease?.(
              fighter,
              redirectExpression,
              context,
              targetRedirectControllerType,
              "root-state-minus-one",
              [...(characters ?? []), opponent],
            )
          : undefined;
        const target = redirectExpression
          ? onRootTargetDispatchLease
            ? redirectLease?.destination
            : onRootRedirect?.(fighter, redirectExpression, context, targetRedirectControllerType)
          : actor;
        if (!target) {
          return actor.runtime;
        }
        const candidateTargets = redirectLease
          ? [...redirectLease.candidateTargets]
          : target === actor
          ? [opponent]
          : [...new Map(
              [...(characters ?? []), opponent].map((candidate) => [candidate.id, candidate] as const),
            ).values()].filter((candidate) => candidate.id !== target.id);
        const mirrorRedirectedTargetTelemetry =
          target !== actor &&
          !compatibilityTelemetryWorld.isImportedActor(target);
        const applyDispatch = () => targetControllerDispatchWorld.apply({
          actor: target,
          candidateTargets,
          controller,
          effect: controller.normalizedType === "bindtotarget" ? "bindtotarget" : "target",
          targetWorld: redirectLease?.targetWorld ?? target.targetWorld,
          recordController: (recordedTarget, recordedController) => {
            compatibilityTelemetryWorld.recordController(recordedTarget, recordedController);
            if (mirrorRedirectedTargetTelemetry) {
              compatibilityTelemetryWorld.recordController(fighter, recordedController);
            }
          },
          recordOperation: (recordedTarget, operation) => {
            compatibilityTelemetryWorld.recordOperation(recordedTarget, operation);
            if (mirrorRedirectedTargetTelemetry) {
              compatibilityTelemetryWorld.recordOperation(fighter, operation);
            }
          },
          recordTargetLifeAdd: (sourceActor, targetActor, lifeBefore) =>
            recordRootTargetLifeKoCause(fighter, opponent, characters, sourceActor, targetActor, lifeBefore),
          recordDispatch: (selection) => {
            if (redirectExpression === undefined) return;
            compatibilityTelemetryWorld.recordRedirectedTargetDispatch(
              fighter,
              createRuntimeRedirectedTargetDispatchObservation(selection, {
                route: "root-state-minus-one",
                callerId: fighter.id,
                destinationId: target.id,
                stateOwnerId: redirectLease?.stateOwnerId ?? target.stateOwner?.id ?? target.id,
                ...(redirectLease?.destinationRevision === undefined
                  ? {}
                  : { destinationRevision: redirectLease.destinationRevision }),
                redirectExpression,
                writebackActorIds: selection.mutatedActorIds,
                writebackMode: "direct",
                sourceStateNo: -1,
              }),
            );
          },
          canEnterTargetState: (selectedTarget, stateId) =>
            canEnterState(selectedTarget, stateId, target.stateOwner ?? target),
          enterTargetState: (selectedTarget, stateId) => {
            const result = targetStateEntryWorld.enter({
              actor: target,
              target: selectedTarget,
              stateId,
              hooks: {
                canEnterState: (targetActor, targetStateId, stateOwner) =>
                  canEnterState(targetActor, targetStateId, stateOwner),
                enterState: (targetActor, targetStateId, targetOptions) =>
                  enterState(targetActor, targetStateId, undefined, targetOptions),
              },
            });
            return result.entered;
          },
          constants: target.definition.constants,
        });
        if (redirectLease) {
          redirectedTargetDispatchWorld.execute(redirectLease, applyDispatch);
        } else {
          applyDispatch();
        }
        return actor.runtime;
      }
      const redirectExpression = resourceControllerRedirectExpression(controller);
      const redirectControllerType = redirectableResourceControllerType(controller);
      const resourceRedirectLease = redirectExpression && redirectControllerType !== undefined
        ? onRootTargetDispatchLease?.(
            fighter,
            redirectExpression,
            context,
            redirectControllerType,
            "root-state-minus-one",
            [],
          )
        : undefined;
      const target = redirectExpression && redirectControllerType !== undefined
        ? onRootTargetDispatchLease
          ? resourceRedirectLease?.destination
          : onRootRedirect?.(fighter, redirectExpression, context, redirectControllerType)
        : actor;
      if (!target) {
        return actor.runtime;
      }
      const applyDispatch = () => {
        const redirectedController = target === actor && redirectExpression === undefined
          ? controller
          : resolveRedirectedResourceController(controller, actor, context);
        if (!redirectedController) {
          return;
        }
        const mirrorRedirectedResourceTelemetry =
          redirectControllerType !== undefined &&
          target !== actor &&
          !compatibilityTelemetryWorld.isImportedActor(target);
        const lifeBefore = target.runtime.life;
        controllerDispatchWorld.apply(target, redirectedController, {
          context,
          roundNoDamage,
          recordController: (recordedTarget, recordedController) => {
            compatibilityTelemetryWorld.recordController(recordedTarget, recordedController);
            if (mirrorRedirectedResourceTelemetry) {
              compatibilityTelemetryWorld.recordController(fighter, recordedController);
            }
          },
          recordOperation: (recordedTarget, operation) => {
            compatibilityTelemetryWorld.recordOperation(recordedTarget, operation);
            if (mirrorRedirectedResourceTelemetry) {
              compatibilityTelemetryWorld.recordOperation(fighter, operation);
            }
          },
        });
        if (target === fighter && target === actor) {
          recordRuntimeRootSelfKoCause(
            target,
            opponent,
            lifeBefore,
            redirectExpression === undefined ? actor.id : target.stateOwner?.id ?? target.id,
          );
        }
      };
      if (resourceRedirectLease) {
        redirectedTargetDispatchWorld.execute(resourceRedirectLease, applyDispatch);
      } else {
        applyDispatch();
      }
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
  characters?: readonly FighterMatchState[],
  playerIdTarget?: PlayerIdTargetResolver,
): boolean {
  return triggerGateWorld.passes({
    controller,
    actor: fighter,
    opponent,
    owner,
    tick: stageTime,
    evaluateTrigger: (trigger, actor, targetOpponent, stateOwner, tick) =>
      evaluateRuntimeTrigger(
        trigger,
        actor,
        targetOpponent,
        stateOwner,
        tick,
        stageBounds,
        gameSpace,
        characters,
        playerIdTarget ? (playerId) => playerIdTarget(actor, playerId) : undefined,
      ),
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
  characters?: readonly FighterMatchState[],
  playerIdTarget?: PlayerIdExpressionTarget,
): number | undefined {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace, characters, playerIdTarget);
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
  characters?: readonly FighterMatchState[],
  playerIdTarget?: PlayerIdExpressionTarget,
): number | undefined {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace, characters, playerIdTarget);
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

function resolveHeightPairParam(
  controller: ControllerIr,
  key: Parameters<RuntimeHeightResolver["resolvePair"]>[0],
  actor: FighterMatchState,
  opponent: FighterMatchState,
  stateOwner: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  tick: number,
): ReturnType<RuntimeHeightResolver["resolvePair"]> {
  const raw = findParam(controller, key);
  if (raw === undefined) return undefined;
  const [topExpression, bottomExpression] = raw.split(",").map((part) => part.trim());
  if (!topExpression) return undefined;
  const top = resolveDispatchFloat(undefined, topExpression, actor, opponent, stateOwner, stageBounds, tick);
  if (top === undefined) return undefined;
  if (!bottomExpression) return [top];
  const bottom = resolveDispatchFloat(undefined, bottomExpression, actor, opponent, stateOwner, stageBounds, tick);
  return bottom === undefined ? undefined : [top, bottom];
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

function resolveCollisionOverrideParams(
  controller: ControllerIr,
  actor: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  tick: number,
): RuntimeCollisionOverrideResolver {
  return {
    resolveNumber: (key) => {
      const raw = findParam(controller, key);
      return raw === undefined ? undefined : resolveDispatchNumber(undefined, raw, actor, opponent, owner, stageBounds, tick);
    },
    resolveRect: (key) => {
      const raw = findParam(controller, key);
      if (raw === undefined) return undefined;
      const expressions = raw.split(",").map((part) => part.trim());
      if (expressions.length < 1 || expressions.length > 4 || expressions.some((part) => !part)) return undefined;
      const values = expressions.map((expression) => resolveDispatchFloat(undefined, expression, actor, opponent, owner, stageBounds, tick));
      return values.some((value) => value === undefined) ? undefined : values as [number, number?, number?, number?];
    },
  };
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
  characters?: readonly FighterMatchState[],
  playerIdTarget?: PlayerIdExpressionTarget,
): boolean | undefined {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace, characters, playerIdTarget);
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
  characters?: readonly FighterMatchState[],
  playerIdTarget?: PlayerIdExpressionTarget,
): boolean {
  const createContext = activeExpressionContextFactory(stageBounds, gameSpace, characters, playerIdTarget);
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

function activeExpressionContextFactory(
  stageBounds?: MugenStageDefinition["bounds"],
  gameSpace?: ExpressionGameSpace,
  characters?: readonly FighterMatchState[],
  playerIdTarget?: PlayerIdExpressionTarget,
) {
  return activeExpressionContextWorld.createFactory<FighterMatchState>({
    stageBounds,
    gameSpace: gameSpace ?? fallbackGameSpaceFromBounds(stageBounds),
    characters,
    playerIdTarget,
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

const RUNTIME_INTRO_SKIP_BUTTONS = new Set(["a", "b", "c", "x", "y", "z"]);

function hasNewRuntimeIntroSkipButtonPress(current: Iterable<string>, previous: ReadonlySet<string>): boolean {
  for (const value of current) {
    const normalized = value.trim().toLowerCase();
    if (RUNTIME_INTRO_SKIP_BUTTONS.has(normalized) && !previous.has(normalized)) return true;
  }
  return false;
}

function rememberRuntimeInput(previous: Set<string>, current: Iterable<string>): void {
  previous.clear();
  for (const value of current) previous.add(value.trim().toLowerCase());
}

function hasRuntimeRoundNoSkip(
  actors: ReadonlyArray<{ runtime: { assertSpecial?: { flags: readonly string[]; globalFlags: readonly string[] } } }>,
): boolean {
  return actors.some(({ runtime }) => {
    const flags = [...(runtime.assertSpecial?.flags ?? []), ...(runtime.assertSpecial?.globalFlags ?? [])];
    return flags.some((flag) => flag.trim().replace(/^"|"$/g, "").replace(/[^A-Za-z0-9_]/g, "").toLowerCase() === "roundnotskip");
  });
}

function runtimeRoundTimingFromFightScreen(
  source?: MugenFightScreenTiming,
  assets?: MugenFightScreenAssets,
): Partial<RuntimeRoundTiming> | undefined {
  const display = assets?.display;
  if (!source && !display) return undefined;
  const animations = assets?.animations ?? new Map();
  const roundSoundsByNumber = display
    ? Object.fromEntries(
        [...display.round.entries()]
          .filter(([, asset]) => asset.sound !== undefined)
          .map(([roundNo, asset]) => [roundNo, runtimeAnnouncementSound(asset.sound)]),
      )
    : undefined;
  const roundSingleSound = runtimeAnnouncementSound(display?.roundSingle?.sound);
  const roundFinalSound = runtimeAnnouncementSound(display?.roundFinal?.sound);
  const defaultRoundSound = runtimeAnnouncementSound(source?.roundSound ?? display?.roundDefault?.sound);
  const defaultRoundAnimationEndFrames = display === undefined
    ? undefined
    : resolveFightScreenAnimationCompletion(display.roundDefault, animations).frame;
  const roundAnimationEndFramesByNumber = display === undefined
    ? undefined
    : Object.fromEntries(
        [...display.round.keys()].map((roundNo) => [
          roundNo,
          resolveFightScreenAnnouncementCompletion(display, animations, "round", "normal", roundNo)?.frame ?? 0,
        ]),
      );
  const roundSingleAnimationEndFrames = display === undefined
    ? undefined
    : resolveFightScreenAnnouncementCompletion(display, animations, "round", "single", 1)?.frame ?? 0;
  const roundFinalAnimationEndFrames = display === undefined
    ? undefined
    : resolveFightScreenAnnouncementCompletion(display, animations, "round", "final", 1)?.frame ?? 0;
  const fightAnimationEndFrames = display === undefined
    ? undefined
    : resolveFightScreenAnnouncementCompletion(display, animations, "fight", "normal", 1)?.frame ?? 0;
  const outcome = runtimeRoundOutcomeTimingFromFightScreen(source, display);
  const timing: Partial<RuntimeRoundTiming> = {
    overHitTimeFrames: source?.overHitTime,
    postKoPhase4StartFrames: source?.overWaitTime,
    forceWinTimeFrames: source?.overForceWinTime,
    winPoseFrames: source?.overWinTime,
    overTimeFrames: source?.overTime,
    startWaitTimeFrames: source?.startWaitTime,
    controlTimeFrames: source?.controlTime,
    announcement: resolveRuntimeRoundAnnouncementTiming({
      roundTimeFrames: source?.roundTime,
      roundSoundTimeFrames: source?.roundSoundTime,
      roundSound: defaultRoundSound,
      roundSoundsByNumber: roundSoundsByNumber as Record<number, ReturnType<typeof runtimeAnnouncementSound>>,
      roundSingleSound,
      roundFinalSound,
      roundAnimationEndFrames: defaultRoundAnimationEndFrames,
      roundAnimationEndFramesByNumber,
      roundSingleAnimationEndFrames,
      roundFinalAnimationEndFrames,
      callFightTimeFrames: source?.callFightTime,
      fightTimeFrames: source?.fightTime,
      fightSoundTimeFrames: source?.fightSoundTime,
      fightSound: runtimeAnnouncementSound(source?.fightSound),
      fightAnimationEndFrames,
    }),
    shutterTimeFrames: source?.shutterTime,
    shutterColor: source?.shutterColor,
    fadeInTimeFrames: source?.fadeInTime,
    fadeInColor: source?.fadeInColor,
    fadeInAnimationNo: source?.fadeInAnimationNo,
    fadeInAnimationDurationFrames: source?.fadeInAnimationDuration,
    fadeInSound: source?.fadeInSound,
    fadeOutTimeFrames: source?.fadeOutTime,
    fadeOutColor: source?.fadeOutColor,
    fadeOutAnimationNo: source?.fadeOutAnimationNo,
    fadeOutAnimationDurationFrames: source?.fadeOutAnimationDuration,
    fadeOutSound: source?.fadeOutSound,
    ...(outcome ? { outcome } : {}),
    koSlowFrames: source?.slowTime,
    koSlowFadeFrames: source?.slowFadeTime,
    koSlowRate: source?.slowSpeed,
  };
  return Object.values(timing).some((value) => value !== undefined) ? timing : undefined;
}

function runtimeRoundOutcomeTimingFromFightScreen(
  source?: MugenFightScreenTiming,
  display?: MugenFightScreenAssets["display"],
): RuntimeRoundOutcomeTiming | undefined {
  const hasSourceTiming = [
    source?.koTime,
    source?.koSoundTime,
    source?.doubleKoTime,
    source?.doubleKoSoundTime,
    source?.doubleKoShowDraw,
    source?.timeOverTime,
    source?.timeOverSoundTime,
    source?.winTime,
    source?.winSoundTime,
  ].some((value) => value !== undefined);
  const hasDisplay = Boolean(display?.ko || display?.doubleKo || display?.timeOver || display?.draw || display?.win || display?.result || display?.winType);
  if (!hasSourceTiming && !hasDisplay) return undefined;

  const koTimeFrames = source?.koTime ?? 0;
  const koSoundTimeFrames = source?.koSoundTime ?? koTimeFrames;
  const koSound = runtimeAnnouncementSound(display?.ko?.sound);
  const doubleKoSound = runtimeAnnouncementSound(display?.doubleKo?.sound) ?? koSound;
  const timeOverSound = runtimeAnnouncementSound(display?.timeOver?.sound) ?? koSound;
  const winSound = runtimeAnnouncementSound(display?.win?.sound);
  const drawSound = runtimeAnnouncementSound(display?.draw?.sound) ?? timeOverSound;
  const resultSounds = runtimeResultDisplaySounds(display?.result);
  const winTypeSounds = runtimeWinTypeSounds(display?.winType);
  return {
    koTimeFrames,
    koSoundTimeFrames,
    ...(koSound ? { koSound } : {}),
    doubleKoTimeFrames: source?.doubleKoTime ?? koTimeFrames,
    doubleKoSoundTimeFrames: source?.doubleKoSoundTime ?? koSoundTimeFrames,
    ...(doubleKoSound ? { doubleKoSound } : {}),
    doubleKoShowDraw: source?.doubleKoShowDraw === true,
    ...(source?.clutchThresholdPercent === undefined ? {} : {
      clutchThresholdPercent: source.clutchThresholdPercent,
    }),
    timeOverTimeFrames: source?.timeOverTime ?? koTimeFrames,
    timeOverSoundTimeFrames: source?.timeOverSoundTime ?? koSoundTimeFrames,
    ...(timeOverSound ? { timeOverSound } : {}),
    winTimeFrames: source?.winTime ?? 0,
    winSoundTimeFrames: source?.winSoundTime ?? source?.winTime ?? 0,
    ...(winSound ? { winSound } : {}),
    ...(drawSound ? { drawSound } : {}),
    ...(resultSounds ? { resultSounds } : {}),
    ...(winTypeSounds ? { winTypeSounds } : {}),
  };
}

function runtimeResultDisplaySounds(
  result: MugenFightScreenResultDisplayDefinitions | undefined,
): RuntimeRoundOutcomeTiming["resultSounds"] {
  if (!result) return undefined;
  const hasSound = Object.values(result).some((family) => family.variants.some(({ sides }) => sides.some((asset) => asset?.sound !== undefined)));
  if (!hasSound) return undefined;
  const mapFamily = (family: MugenFightScreenResultDisplayDefinitions["win"]) => ({
    variants: family.variants.map(({ sides }) => [
      runtimeAnnouncementSound(sides[0]?.sound),
      runtimeAnnouncementSound(sides[1]?.sound),
    ] as [ReturnType<typeof runtimeAnnouncementSound>, ReturnType<typeof runtimeAnnouncementSound>]),
  });
  return {
    win: mapFamily(result.win),
    aiWin: mapFamily(result.aiWin),
    aiLose: mapFamily(result.aiLose),
  };
}

function runtimeWinTypeSounds(
  definitions: MugenFightScreenWinTypeDefinitions | undefined,
): RuntimeRoundOutcomeTiming["winTypeSounds"] {
  if (!definitions) return undefined;
  const mapSide = (side: MugenFightScreenWinTypeDefinitions["p1"]) => Object.fromEntries(
    Object.entries(side).flatMap(([name, asset]) => {
      const sound = runtimeAnnouncementSound(asset?.sound);
      if (!asset || !sound) return [];
      return [[name, {
        soundTimeFrames: asset.soundTime ?? asset.time ?? 0,
        sound,
      }]];
    }),
  ) as NonNullable<RuntimeRoundOutcomeTiming["winTypeSounds"]>["p1"];
  const mapped: NonNullable<RuntimeRoundOutcomeTiming["winTypeSounds"]> = {
    p1: mapSide(definitions.p1),
    p2: mapSide(definitions.p2),
  };
  return Object.keys(mapped.p1).length > 0 || Object.keys(mapped.p2).length > 0 ? mapped : undefined;
}

function runtimeAnnouncementSound(
  value: [number, number] | undefined,
): { group: number; index: number; soundPrefix: string } | undefined {
  return value ? { group: value[0], index: value[1], soundPrefix: "fs" } : undefined;
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

function deriveTurnsMatchWinsBySide(roots: readonly FighterMatchState[]): { 1: number; 2: number } {
  const sideOneMembers = roots.filter((root) => runtimeTeamSide(root) === 1).length;
  const sideTwoMembers = roots.filter((root) => runtimeTeamSide(root) === 2).length;
  return {
    1: Math.max(1, sideTwoMembers),
    2: Math.max(1, sideOneMembers),
  };
}
