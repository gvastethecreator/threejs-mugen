import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenPresentationOrder } from "./PresentationOrder";
import type { RuntimeMatchTickSchedule } from "./RuntimeMatchTickScheduleSystem";
import type { RuntimeCollisionOverride } from "./RuntimeCollisionOverrideSystem";
import type { CommandInputHistorySample } from "./CommandBuffer";
import type {
  RuntimeMatchOutcomeProjection,
  RuntimeMatchOutcomeSnapshot,
} from "./RuntimeMatchOutcomeSystem";
import type { RuntimeRoundContextSnapshot } from "./RuntimeRoundContextSystem";
import type { RuntimeRoundState5900Snapshot } from "./RuntimeRoundState5900System";
import type { RuntimeTurnsContinuationResult } from "./RuntimeTurnsContinuationSystem";
import type { RuntimeRoundPhase } from "./RuntimeRoundPhaseSystem";
import type {
  RuntimeRoundWinPoseActorSnapshot,
  RuntimeRoundWinPoseSnapshot,
} from "./RuntimeRoundWinPoseSystem";
import type {
  RuntimeHitDefPriorityProfile,
  RuntimeHitDefSpritePrioritySource,
} from "./HitDefPriorityPolicy";

export type CharacterRuntimeState = {
  teamState?: RuntimeTeamState;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  combatDepth?: RuntimeCombatDepth;
  facing: 1 | -1;
  bodyWidth?: { front: number; back: number };
  bodyWidthDelta?: { front: number; back: number };
  bodyHeightDelta?: { top: number; bottom: number };
  clsnOverrides?: RuntimeCollisionOverride[];
  playerPush?: boolean;
  pushPriority?: number;
  pushAffectTeam?: -1 | 0 | 1;
  posFreeze?: { x: boolean; y: boolean; z: boolean };
  screenBound?: { bound: boolean; moveCameraX: boolean; moveCameraY: boolean };
  stageBound?: false;
  hitVelocity?: { x: number; y: number };
  receivedHitSequence?: number;
  hitVars?: RuntimeGetHitVars;
  hitFall?: RuntimeHitFall;
  targetCount?: number;
  targetRefs?: RuntimeTargetSnapshot[];
  targetBindings?: RuntimeTargetBindingSnapshot[];
  bindToTarget?: RuntimeTargetBindingSnapshot;
  hitBy?: {
    slot1?: RuntimeHitBySlot;
    slot2?: RuntimeHitBySlot;
  };
  hitOverrides?: RuntimeHitOverrideSlot[];
  reversal?: RuntimeReversalDef;
  defenseMultiplier?: number;
  superPauseDefenseMultiplier?: number;
  /** Incoming-damage factor from Common1 fall.defence_up; upstream stores its inverse. */
  fallDefenseMultiplier?: number;
  attackMultiplier?: number;
  dizzyPointsAttackMultiplier?: number;
  paletteRemap?: RuntimePaletteRemap;
  spritePriority?: number;
  hitDefSpritePriority?: {
    profile: RuntimeHitDefPriorityProfile;
    role: "p1" | "p2";
    contactKind: RuntimeHitDefContactKind;
    previousValue?: number;
    value: number;
    source: RuntimeHitDefSpritePrioritySource;
    supported: boolean;
  };
  paletteFx?: {
    remaining: number;
    time: number;
    add: [number, number, number];
    mul: [number, number, number];
    color: number;
    invert: boolean;
  };
  afterImage?: {
    remaining: number;
    time: number;
    length: number;
    timeGap: number;
    frameGap: number;
    palAdd: [number, number, number];
    palMul: [number, number, number];
    opacity: number;
    elapsed: number;
    samples: RuntimeAfterImageSample[];
  };
  renderOpacity?: number;
  renderScale?: { x: number; y: number };
  angle?: number;
  renderAngle?: number;
  animationSource?: "self" | "state-owner";
  customState?: RuntimeCustomState;
  assertSpecial?: RuntimeAssertSpecial;
  prevStateNo?: number;
  prevAnimNo?: number;
  prevStateType?: "S" | "C" | "A" | "L";
  prevMoveType?: "I" | "A" | "H";
  runOrder?: number;
  stateNo: number;
  roundNo?: number;
  roundsExisted?: number;
  roundPhase?: RuntimeRoundPhase;
  matchOver?: boolean;
  winPose?: RuntimeRoundWinPoseActorSnapshot;
  animNo: number;
  animTime: number;
  frameIndex: number;
  lifeMax?: number;
  life: number;
  guardPointsMax?: number;
  guardPoints?: number;
  dizzyPointsMax?: number;
  dizzyPoints?: number;
  redLife?: number;
  powerMax?: number;
  power: number;
  ctrl: boolean;
  guardStun?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guarding?: boolean;
  inGuardDist?: RuntimeInGuardDistanceLatch;
  stateType: "S" | "C" | "A" | "L";
  moveType: "I" | "A" | "H";
  physics: "S" | "C" | "A" | "N";
  vars: number[];
  sysvars?: number[];
  fvars: number[];
};

export type RuntimeCombatDepth = {
  position: number;
  velocity: number;
  size: [number, number];
  attack: [number, number];
  baseSize?: [number, number];
  edge?: [number, number];
};

export type RuntimeTeamState = {
  disabled: boolean;
  standby: boolean;
  overKo: boolean;
  playerType: boolean;
};

export type RuntimeInGuardDistanceLatch = {
  attackerId: string;
  source: "direct" | "projectile" | "direct+projectile";
  observedTick: number;
};

export type RuntimeHitBySlot = {
  mode: "allow" | "deny";
  attr: string;
  remaining: number;
};

export type RuntimeTargetSnapshot = {
  actorId: string;
  targetId?: number;
  age: number;
};

export type RuntimeTargetBindingSnapshot = {
  actorId: string;
  targetId?: number;
  remaining: number | "infinite";
  offset: { x: number; y: number; z?: number };
};

export type RuntimePaletteRemap = {
  source: [number, number];
  dest: [number, number];
};

export type RuntimeHitOverrideSlot = {
  slot: number;
  attr: string;
  stateNo?: number;
  remaining: number;
  guardFlag?: string;
  guardFlagNot?: string;
  forceAir?: boolean;
  forceGuard?: boolean;
  keepState?: boolean;
};

export type RuntimeReversalDef = {
  attr: string;
  p1StateNo?: number;
  p2StateNo?: number;
  hitPause: number;
  attackDepth?: [number, number];
};

export type RuntimeGetHitVars = {
  damage?: number;
  kill?: boolean;
  hitId?: number;
  chainId?: number;
  hitCount?: number;
  hitOffset?: { x: number; y?: number; z?: number };
  animType?: number;
  groundType?: number;
  airType?: number;
  yAccel?: number;
  isBound?: boolean;
  guarded?: boolean;
  hitTime?: number;
  hitShakeTime?: number;
};

export type RuntimeCustomState = {
  ownerId: string;
  stateNo: number;
  getP1State: boolean;
};

export type RuntimeHitFall = {
  falling: boolean;
  damage: number;
  fallCount?: number;
  fallCountedGroundImpact?: boolean;
  common1FallMechanicsStateNo?: number;
  fallDefenseApplied?: boolean;
  defenceUp?: number;
  kill?: boolean;
  velocity: {
    x?: number;
    y: number;
  };
  recover?: boolean;
  recoverTime?: number;
  downRecover?: boolean;
  downRecoverTime?: number;
  envShake?: {
    time: number;
    freq: number;
    ampl: number;
    phase: number;
  };
};

export type RuntimeAssertSpecial = {
  flags: string[];
  globalFlags: string[];
  noAutoTurn?: boolean;
  noWalk?: boolean;
  invisible?: boolean;
  noShadow?: boolean;
  noStandGuard?: boolean;
  noCrouchGuard?: boolean;
  noAirGuard?: boolean;
  noDizzyPointsDamage?: boolean;
  unguardable?: boolean;
  noKo?: boolean;
  noKoSlow?: boolean;
  timerFreeze?: boolean;
  roundNotOver?: boolean;
  intro?: boolean;
  noJuggleCheck?: boolean;
  noGetUpFromLieDown?: boolean;
  noFastRecoverFromLieDown?: boolean;
  noFallDefenceUp?: boolean;
  noFallCount?: boolean;
  noFallHitFlag?: boolean;
  projTypeCollision?: boolean;
  runFirst?: boolean;
  runLast?: boolean;
};

export type RuntimeAfterImageSample = {
  age: number;
  pos: { x: number; y: number };
  facing: 1 | -1;
  spriteOwnerId?: string;
  spriteOwnerDefinitionId?: string;
  spriteOwnerLabel?: string;
  spriteGroup: number;
  spriteIndex: number;
  offsetX: number;
  offsetY: number;
};

export type RuntimeHitDefContactKind = "hit" | "guard";

export type RuntimeHitDefContactMetadata = {
  contactId: string;
  contactTick: number;
  contactKind: RuntimeHitDefContactKind;
};

export type RuntimeResolvedSoundRef = {
  rawPrefix?: "F" | "S";
  group: number;
  index: number;
};

export type RuntimeSoundEvent = {
  type: "PlaySnd" | "StopSnd" | "SndPan";
  group?: number;
  index?: number;
  channel?: number;
  lowPriority?: boolean;
  volumeScale?: number;
  legacyVolume?: number;
  freqMul?: number;
  loop?: boolean;
  pan?: number;
  absPan?: number;
  raw?: string;
  soundPrefix?: string;
  stateNo: number;
  tick: number;
  runtimeTick?: number;
  contactId?: string;
  contactTick?: number;
  contactKind?: RuntimeHitDefContactKind;
};

export type RuntimeHitEffectAssetFrame = {
  source: "player" | "common" | "fightfx";
  fightFxPrefix?: string;
  actionId: number;
  frameIndex: number;
  spriteGroup: number;
  spriteIndex: number;
  offsetX: number;
  offsetY: number;
  duration: number;
};

export type RuntimeHitEffectEvent = {
  type: "HitSpark";
  kind: "hit" | "guard";
  sparkNo?: number;
  raw?: string;
  rawPrefix?: string;
  offset?: { x: number; y: number };
  stateNo: number;
  tick: number;
  runtimeTick?: number;
  assetFrame?: RuntimeHitEffectAssetFrame;
  assetFrames?: RuntimeHitEffectAssetFrame[];
  fightFxPrefix?: string;
  contactId?: string;
  contactTick?: number;
  contactKind?: RuntimeHitDefContactKind;
};

export type RuntimeEnvShakeEvent = {
  type: "EnvShake";
  time: number;
  freq: number;
  ampl: number;
  phase: number;
  stateNo: number;
  tick: number;
  runtimeTick: number;
};

export type RuntimeEnvColorEvent = {
  type: "EnvColor";
  color: [number, number, number];
  time: number;
  under: boolean;
  runtimeTick: number;
};

export type RuntimeStageFlash = {
  color: [number, number, number];
  opacity: number;
  remaining: number;
  under: boolean;
};

export type RuntimeActorKind = "player" | "helper" | "projectile" | "explod";

export type RuntimeActorIdentity = {
  actorKind: RuntimeActorKind;
  ownerId: string;
  rootId: string;
  parentId: string;
};

export type ActorEffectSnapshot =
  | {
      kind: "explod";
      id?: number;
      age: number;
      removeTime: number;
      spritePriority: number;
      opacity: number;
      scale: { x: number; y: number };
      removeOnGetHit: boolean;
      ignoreHitPause: boolean;
      pauseMoveTime: number;
      superMoveTime: number;
      bindRemaining?: number;
      bindOffset?: { x: number; y: number };
    }
  | {
      kind: "helper";
      id?: number;
      name?: string;
      stateNo?: number;
      age: number;
      stateTime: number;
      removeTime: number;
      spritePriority: number;
      targetCount: number;
      scale: { x: number; y: number };
      ignoreHitPause: boolean;
      pauseMoveTime: number;
      superMoveTime: number;
      ownerBind?: {
        target: "parent" | "root";
        offset: { x: number; y: number };
        remaining: number;
      };
    }
  | {
      kind: "projectile";
      id?: number;
      age: number;
      removeTime: number;
      edgeBound?: number;
      stageBound?: number;
      heightBound?: { low: number; high: number };
      spritePriority: number;
      priority: number;
      affectTeam?: -1 | 0 | 1;
      teamSide?: 1 | 2;
      hitsRemaining: number;
      missTime: number;
      missTimeRemaining: number;
      damage: number;
      hitPause: number;
      hitStun: number;
      guardDamage: number;
      guardPause: number;
      guardStun: number;
      guardDistance: number;
      guardFlag?: string;
      hitFlag?: string;
      p2StateNo?: number;
      p2GetP1State?: boolean;
      p2ClsnCheck?: "clsn1" | "clsn2" | "size" | "none";
      p2ClsnRequire?: "clsn1" | "clsn2" | "size" | "none";
      missOnOverride?: boolean;
      removeOnHit: boolean;
      hasHit: boolean;
      removalReason?: "hit" | "timeout" | "bounds" | "cancel";
      terminalReason?: "hit" | "timeout" | "bounds" | "cancel";
      terminalAge?: number;
      terminalDuration?: number;
      hitAnimNo?: number;
      removeAnimNo?: number;
      cancelAnimNo?: number;
      accel?: { x: number; y: number };
      velMul?: { x: number; y: number };
      scale?: { x: number; y: number };
      depthBound?: number;
      depth?: {
        position: number;
        velocity: number;
        attack: [number, number];
      };
    };

export type ActorSnapshot = RuntimeActorIdentity & {
  id: string;
  label: string;
  presentationOrder?: MugenPresentationOrder;
  source?: "demo" | "imported" | "effect";
  shadowVisible?: false;
  spriteOwnerId?: string;
  spriteOwnerDefinitionId?: string;
  spriteOwnerLabel?: string;
  hitPause?: number;
  effect?: ActorEffectSnapshot;
  runtime: CharacterRuntimeState;
  frame?: MugenAnimationFrame;
  clsn1: CollisionBox[];
  clsn2: CollisionBox[];
  soundEvents?: RuntimeSoundEvent[];
  hitEffectEvents?: RuntimeHitEffectEvent[];
  envShakeEvents?: RuntimeEnvShakeEvent[];
};

export type ActorCompatibilitySession = {
  actorId: string;
  label: string;
  source: "imported";
  executedStates: number[];
  routedStateEntries: number;
  routedStates: number[];
  executedControllers: Record<string, number>;
  activeCommands: string[];
  commandHistory: CommandInputHistorySample[];
  lastRoutedState?: {
    stateId: number;
    name?: string;
  };
  lastExecutedState?: number;
  executedOperations: Record<string, number>;
  controllerEvents?: RuntimeControllerTraceEvent[];
  redirectedTargetDispatches?: RuntimeRedirectedTargetDispatchObservation[];
};

export type RuntimeRedirectedTargetDispatchRoute =
  | "root-active"
  | "root-state-minus-one"
  | "helper-to-root"
  | "helper-to-helper";

export type RuntimeRedirectedTargetDispatchWritebackMode = "direct" | "helper-wrapper";

export type RuntimeRedirectedTargetDispatchOperationClass =
  | "target-resource"
  | "target-motion"
  | "target-binding"
  | "target-state"
  | "bind-to-target"
  | "target-controller";

export type RuntimeRedirectedTargetDispatchWriteback = {
  mode: RuntimeRedirectedTargetDispatchWritebackMode;
  actorIds: string[];
};

export type RuntimeRedirectedTargetDispatchObservation = {
  route: RuntimeRedirectedTargetDispatchRoute;
  callerId: string;
  destinationId: string;
  stateOwnerId: string;
  destinationRevision?: string;
  controllerType: string;
  operationClass: RuntimeRedirectedTargetDispatchOperationClass;
  effect: "target" | "bindtotarget";
  redirectExpression?: string;
  redirectPlayerId?: number;
  sourceStateNo?: number;
  telemetryId: string;
  candidateTargetIds: string[];
  requestedId?: number;
  selectedTargetIds: string[];
  mutatedActorIds: string[];
  writebackActorIds: string[];
  writebackMode: RuntimeRedirectedTargetDispatchWritebackMode;
  matchedTargets: number;
  operationExecuted: boolean;
};

export type RuntimeControllerTraceEvent = {
  sequence: number;
  tick: number;
  stateNo: number;
  controller: string;
  name?: string;
  line?: number;
  operation?: string;
  stateSource?: import("../model/MugenState").MugenStateSourceRef;
};

export type CompatibilitySessionSnapshot = {
  actors: ActorCompatibilitySession[];
};

export type StageSnapshot = {
  id?: string;
  displayName?: string;
  floorY: number;
  zOffset?: number;
  bounds?: MugenStageDefinition["bounds"];
  camera: {
    x: number;
    y: number;
    zoom: number;
    shake?: {
      x: number;
      y: number;
      remaining: number;
      amplitude: number;
    };
  };
  envColor?: RuntimeStageFlash;
  layers?: MugenStageDefinition["layers"];
  animations?: MugenStageDefinition["animations"];
  bgControllers?: MugenStageDefinition["bgControllers"];
  backgroundTick?: number;
};

export type RoundSnapshot = {
  state: "fight" | "ko" | "timeover";
  timer: number;
  roundNo?: number;
  roundsExisted?: number;
  roundPhase?: RuntimeRoundPhase;
  winner?: string;
  message: string;
  winPose?: RuntimeRoundWinPoseSnapshot;
  match?: RuntimeMatchOutcomeSnapshot;
  matchProjection?: RuntimeMatchOutcomeProjection;
  roundContext?: RuntimeRoundContextSnapshot;
  state5900?: RuntimeRoundState5900Snapshot;
  turnsContinuation?: RuntimeTurnsContinuationResult;
  postRound?: {
    schema: "RuntimePostRound/v0";
    frame: number;
    remaining: number;
    duration: number;
    slowRemaining: number;
    slowDuration: number;
    playbackRate: number;
    noKoSlow: boolean;
    fadeOut?: RuntimeRoundFadeSnapshot;
  };
};

export type RuntimeRoundFadeSnapshot = {
  schema: "RuntimeRoundFade/v0";
  active: boolean;
  frame: number;
  remaining: number;
  duration: number;
  opacity: number;
  color: [number, number, number];
};

export type RuntimeSuperPauseAnimSnapshot = {
  raw: string;
  source: "fightfx" | "player";
  actionNo: number;
  offset: { x: number; y: number };
};

export type RuntimeMatchPauseSnapshot = {
  type: "Pause" | "SuperPause";
  remaining: number;
  moveTime: number;
  actorId: string;
  pauseBg?: boolean;
  unhittable?: boolean;
  darken: boolean;
  sourceStateNo: number;
  superAnim?: RuntimeSuperPauseAnimSnapshot;
};

export type MugenSnapshot = {
  tick: number;
  selectedActionId?: number;
  selectedAction?: MugenAnimationAction;
  playing: boolean;
  speed: number;
  showClsn1: boolean;
  showClsn2: boolean;
  showAxis: boolean;
  showGrid: boolean;
  matchPause?: RuntimeMatchPauseSnapshot;
  stage: StageSnapshot;
  round?: RoundSnapshot;
  actors: ActorSnapshot[];
  reserveActors?: ActorSnapshot[];
  effects?: ActorSnapshot[];
  compatibilitySession?: CompatibilitySessionSnapshot;
  reserveCompatibilitySession?: CompatibilitySessionSnapshot;
  tickSchedule?: RuntimeMatchTickSchedule;
  tagTeamOrder?: import("./RuntimeTagTeamOrderSystem").RuntimeTagTeamOrderDiagnostic;
  rootInputRouting?: import("./RuntimeRootInputRoutingSystem").RuntimeRootInputRoutingDiagnostic;
  rootPresentation?: import("./RuntimeRootPresentationSystem").RuntimeRootPresentationDiagnostic;
  rootBodyPush?: import("./RuntimeRootBodyPushSystem").RuntimeRootBodyPushDiagnostic;
  rootHitAdmission?: import("./RuntimeRootDirectHitAdmissionSystem").RuntimeRootDirectHitAdmissionDiagnostic;
  teamRoundLifebar?: import("./RuntimeTeamRoundLifebarSystem").RuntimeTeamRoundLifebarDiagnostic;
  teamRoundResourceBanks?: import("./RuntimeTeamResourceBankSystem").RuntimeTeamResourceBankDiagnostic;
  teamRoundRedLifeShare?: import("./RuntimeRedLifeShareSystem").RuntimeRedLifeShareDiagnostic;
  runtimeAuxiliaryResources?: import("./RuntimeAuxiliaryResourceProjectionSystem").RuntimeAuxiliaryResourceProjectionDiagnostic;
  logs: string[];
};

export type RuntimeCommand =
  | { type: "select-action"; actionId: number }
  | { type: "set-playing"; playing: boolean }
  | { type: "step"; ticks?: number }
  | { type: "set-speed"; speed: number }
  | { type: "toggle"; key: "showClsn1" | "showClsn2" | "showAxis" | "showGrid"; value: boolean };

export interface SnapshotRuntime {
  dispatch(command: RuntimeCommand): MugenSnapshot;
  step(ticks?: number): MugenSnapshot;
  getSnapshot(): MugenSnapshot;
}
