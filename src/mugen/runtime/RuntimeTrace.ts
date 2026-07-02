import type { MatchInput } from "./PlayableMatchRuntime";
import type {
  MatchWorldActorLifecycleEvent,
  MatchWorldActorLifecycleRecord,
  MatchWorldActorRegistrySnapshot,
  MatchWorldTargetLink,
} from "./MatchWorld";
import type {
  ActorCompatibilitySession,
  ActorSnapshot,
  CompatibilitySessionSnapshot,
  MugenSnapshot,
  RuntimeActorKind,
  RuntimeControllerTraceEvent,
  RuntimeHitDefContactKind,
  RuntimeMatchPauseSnapshot,
  RoundSnapshot,
  StageSnapshot,
} from "./types";

export type RuntimeTraceInputFrame = {
  label?: string;
  p1?: string[];
  p2?: string[];
  force?: boolean;
};

export type RuntimeTraceScriptSegment = RuntimeTraceInputFrame & {
  frames?: number;
};

export type RuntimeTraceEffectSummary = NonNullable<ActorSnapshot["effect"]>;
export type RuntimeTraceHitEffectEvent = NonNullable<ActorSnapshot["hitEffectEvents"]>[number];

export type RuntimeTraceActor = {
  id: string;
  label: string;
  actorKind: ActorSnapshot["actorKind"];
  ownerId: string;
  rootId: string;
  parentId: string;
  source?: ActorSnapshot["source"];
  prevStateNo?: number;
  prevAnimNo?: number;
  prevStateType?: string;
  prevMoveType?: string;
  stateNo: number;
  animNo: number;
  animTime: number;
  frameIndex: number;
  life: number;
  power: number;
  ctrl: boolean;
  stateType: string;
  moveType: string;
  physics: string;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  renderOpacity?: number;
  renderScale?: { x: number; y: number };
  renderAngle?: number;
  bodyWidth?: { front: number; back: number };
  playerPush?: boolean;
  spritePriority?: number;
  paletteFx?: {
    time: number;
    add: [number, number, number];
    mul: [number, number, number];
    color: number;
    invert: boolean;
  };
  paletteRemap?: {
    source: [number, number];
    dest: [number, number];
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
    sampleCount: number;
  };
  posFreeze?: { x: boolean; y: boolean };
  screenBound?: { bound: boolean; moveCameraX: boolean; moveCameraY: boolean };
  facing: 1 | -1;
  hitPause: number;
  guarding: boolean;
  guardStun: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  hitFall?: RuntimeTraceHitFallSummary;
  targetCount: number;
  effect?: RuntimeTraceEffectSummary;
  soundEvents?: NonNullable<ActorSnapshot["soundEvents"]>;
  hitEffectEvents?: RuntimeTraceHitEffectEvent[];
  envShakeEvents?: NonNullable<ActorSnapshot["envShakeEvents"]>;
  customOwnerId?: string;
  clsn1Count: number;
  clsn2Count: number;
};

export type RuntimeTraceCompatibilityActor = Pick<
  ActorCompatibilitySession,
  | "actorId"
  | "label"
  | "executedStates"
  | "routedStates"
  | "activeCommands"
  | "commandHistory"
  | "lastRoutedState"
  | "lastExecutedState"
> & {
  executedControllers: Record<string, number>;
  executedOperations: Record<string, number>;
  controllerEvents: RuntimeTraceControllerEvent[];
};

export type RuntimeTraceControllerEvent = RuntimeControllerTraceEvent & {
  actorId: string;
  label: string;
};

export type RuntimeTraceEvent = {
  frameIndex: number;
  tick: number;
  category: "hit" | "guard" | "reject" | "override" | "reversal" | "pause" | "round" | "runtime";
  line: string;
};

export type RuntimeTraceCombatReason = {
  frameIndex: number;
  tick: number;
  reason: "hit" | "guard" | "whiff" | "reject" | "override" | "reversal";
  source: "log" | "inferred";
  actorId?: string;
  detail: string;
};

export type RuntimeTraceHitFallSummary = {
  falling: boolean;
  damage: number;
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

export type RuntimeTraceHitFallRequirement = {
  falling?: boolean;
  damage?: number;
  kill?: boolean;
  velocityX?: number;
  velocityY?: number;
  recover?: boolean;
  recoverTime?: number;
  downRecover?: boolean;
  downRecoverTime?: number;
  envShakeTime?: number;
  envShakeFreq?: number;
  envShakeAmpl?: number;
  envShakePhase?: number;
};

export type RuntimeTraceFrame = {
  frameIndex: number;
  tick: number;
  label?: string;
  input: {
    p1: string[];
    p2?: string[];
    force: boolean;
  };
  actors: RuntimeTraceActor[];
  effects: RuntimeTraceActor[];
  stage?: RuntimeTraceStageSummary;
  round?: RoundSnapshot;
  matchPause?: RuntimeMatchPauseSnapshot;
  compatibility?: RuntimeTraceCompatibilityActor[];
  events: RuntimeTraceEvent[];
  combatReasons: RuntimeTraceCombatReason[];
  world?: RuntimeTraceWorldSummary;
  checksum: string;
};

export type RuntimeTraceStageSummary = {
  id?: string;
  displayName?: string;
  floorY: number;
  zOffset?: number;
  bounds?: StageSnapshot["bounds"];
  camera: {
    x: number;
    y: number;
    zoom: number;
    shake?: StageSnapshot["camera"]["shake"];
  };
  envColor?: StageSnapshot["envColor"];
};

export type RuntimeTraceWorldSummary = {
  live: string[];
  spawnedThisTick: string[];
  removedThisTick: string[];
  removed: string[];
  eventsThisTick: RuntimeTraceWorldLifecycleEvent[];
  recentEvents: RuntimeTraceWorldLifecycleEvent[];
  effectStores: RuntimeTraceWorldEffectStoreSummary[];
  targetLinks: RuntimeTraceWorldTargetLink[];
  lifecycle: RuntimeTraceWorldLifecycleRecord[];
};

export type RuntimeTraceWorldEffectStoreSummary = MatchWorldActorRegistrySnapshot["effectStores"][number];
export type RuntimeTraceWorldTargetLink = MatchWorldTargetLink;

export type RuntimeTraceWorldLifecycleRecord = Pick<
  MatchWorldActorLifecycleRecord,
  | "id"
  | "label"
  | "kind"
  | "layer"
  | "ownerId"
  | "rootId"
  | "parentId"
  | "status"
  | "firstSeenTick"
  | "lastSeenTick"
  | "ageTicks"
>;

export type RuntimeTraceWorldLifecycleEvent = Pick<
  MatchWorldActorLifecycleEvent,
  "type" | "id" | "label" | "kind" | "layer" | "ownerId" | "rootId" | "parentId" | "tick" | "ageTicks"
>;

export type RuntimeTraceTargetLinkRequirement = {
  ownerId?: string;
  actorId?: string;
  targetId?: number;
  hasBinding?: boolean;
  minFrames?: number;
  minAge?: number;
  maxAge?: number;
  minBindingRemaining?: number;
  maxBindingRemaining?: number;
  bindingOffsetX?: number;
  bindingOffsetY?: number;
};

export type RuntimeTraceWorldLifecycleEventRequirement = {
  type?: RuntimeTraceWorldLifecycleEvent["type"];
  id?: string;
  kind?: RuntimeActorKind;
  layer?: RuntimeTraceWorldLifecycleEvent["layer"];
  ownerId?: string;
  rootId?: string;
  parentId?: string;
};

export type RuntimeTraceGateWorldLifecycleEventEvidence = {
  type: RuntimeTraceWorldLifecycleEvent["type"];
  id: string;
  label: string;
  kind: RuntimeActorKind;
  layer: RuntimeTraceWorldLifecycleEvent["layer"];
  ownerId: string;
  rootId: string;
  parentId: string;
  firstTick: number;
  lastTick: number;
  count: number;
};

export type RuntimeTraceEffectStoreRequirement = {
  ownerId?: string;
  minTotal?: number;
  minExplods?: number;
  minHelpers?: number;
  minProjectiles?: number;
  minNextExplodSerial?: number;
  minNextHelperSerial?: number;
  minNextProjectileSerial?: number;
  includesExplod?: string;
  includesHelper?: string;
  includesProjectile?: string;
};

export type RuntimeTraceEffectPayloadRequirement = {
  actorId?: string;
  actorKind?: RuntimeActorKind;
  ownerId?: string;
  parentId?: string;
  source?: ActorSnapshot["source"];
  kind?: RuntimeTraceEffectSummary["kind"];
  effectId?: number;
  minAge?: number;
  maxAge?: number;
  minRemoveTime?: number;
  minSpritePriority?: number;
  name?: string;
  helperStateNo?: number;
  targetCount?: number;
  minPriority?: number;
  minHitsRemaining?: number;
  maxHitsRemaining?: number;
  hasHit?: boolean;
  removalReason?: Extract<RuntimeTraceEffectSummary, { kind: "projectile" }>["removalReason"];
  terminalReason?: Extract<RuntimeTraceEffectSummary, { kind: "projectile" }>["terminalReason"];
  minTerminalAge?: number;
  minTerminalDuration?: number;
  ignoreHitPause?: boolean;
  removeOnGetHit?: boolean;
  minPauseMoveTime?: number;
  minSuperMoveTime?: number;
  minBindRemaining?: number;
  maxBindRemaining?: number;
  ownerBindTarget?: "parent" | "root";
  ownerBindOffsetX?: number;
  ownerBindOffsetY?: number;
  minOwnerBindRemaining?: number;
  maxOwnerBindRemaining?: number;
  scaleX?: number;
  scaleY?: number;
};

export type RuntimeTraceGateEffectPayloadEvidence = {
  frameIndex: number;
  tick: number;
  actorId: string;
  label: string;
  source?: ActorSnapshot["source"];
  actorKind: RuntimeActorKind;
  ownerId: string;
  rootId: string;
  parentId: string;
  effect: RuntimeTraceEffectSummary;
};

export type RuntimeTracePauseEvidenceType = RuntimeMatchPauseSnapshot["type"] | "HitPause";

export type RuntimeTraceMatchPauseRequirement = {
  type?: RuntimeTracePauseEvidenceType;
  actorId?: string;
  sourceStateNo?: number;
  darken?: boolean;
  minFrames?: number;
  minRemaining?: number;
  minMoveTime?: number;
};

export type RuntimeTraceMatchPauseFreezeRequirement = {
  type?: RuntimeTracePauseEvidenceType;
  actorId?: string;
  actorKind?: RuntimeActorKind;
  ownerId?: string;
  minFrozenFrames?: number;
};

export type RuntimeTraceMatchPauseAdvanceRequirement = {
  type?: RuntimeTracePauseEvidenceType;
  actorId?: string;
  actorKind?: RuntimeActorKind;
  ownerId?: string;
  minAdvancedFrames?: number;
  minPreviousMoveTime?: number;
};

export type RuntimeTraceGateEffectStoreEvidence = {
  ownerId: string;
  total: number;
  explods: string[];
  helpers: string[];
  projectiles: string[];
  nextSerials: RuntimeTraceWorldEffectStoreSummary["nextSerials"];
};

export type RuntimeTraceGateMatchPauseEvidence = {
  type: RuntimeTracePauseEvidenceType;
  actorId: string;
  sourceStateNo?: number;
  darken: boolean;
  firstTick: number;
  lastTick: number;
  frames: number;
  maxRemaining: number;
  maxMoveTime: number;
};

export type RuntimeTraceGateMatchPauseFreezeEvidence = {
  type: RuntimeTracePauseEvidenceType;
  actorId: string;
  actorKind: RuntimeActorKind;
  ownerId: string;
  firstTick: number;
  lastTick: number;
  frozenFrames: number;
  comparedFields: string[];
};

export type RuntimeTraceGateMatchPauseAdvanceEvidence = {
  type: RuntimeTracePauseEvidenceType;
  actorId: string;
  actorKind: RuntimeActorKind;
  ownerId: string;
  firstTick: number;
  lastTick: number;
  advancedFrames: number;
  maxPreviousMoveTime: number;
  changedFields: string[];
};

export type RuntimeTraceGateTargetLinkEvidence = {
  ownerId: string;
  actorId: string;
  targetId?: number;
  hasBinding: boolean;
  firstTick: number;
  lastTick: number;
  frames: number;
  minAge: number;
  maxAge: number;
  minBindingRemaining?: number;
  maxBindingRemaining?: number;
  bindingInfinite?: boolean;
  bindingOffset?: { x: number; y: number };
};

export type RuntimeTraceFinalActorRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  customOwnerId?: string;
  stateNo?: number;
  animNo?: number;
  life?: number;
  power?: number;
  ctrl?: boolean;
  stateType?: string;
  moveType?: string;
  physics?: string;
  guarding?: boolean;
  hitFall?: RuntimeTraceHitFallRequirement;
  targetCount?: number;
};

export type RuntimeTraceActorFrameRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  ownerId?: string;
  customOwnerId?: string;
  stateNo?: number;
  animNo?: number;
  facing?: 1 | -1;
  stateType?: string;
  moveType?: string;
  physics?: string;
  clsn1Count?: number;
  clsn2Count?: number;
  minFrames?: number;
  observedLifeAtLeast?: number;
  observedLifeAtMost?: number;
  observedPowerAtLeast?: number;
  observedPowerAtMost?: number;
  observedPosXAtLeast?: number;
  observedPosXAtMost?: number;
  observedPosYAtLeast?: number;
  observedPosYAtMost?: number;
  observedVelXAtLeast?: number;
  observedVelXAtMost?: number;
  observedVelYAtLeast?: number;
  observedVelYAtMost?: number;
  observedScaleXAtLeast?: number;
  observedScaleXAtMost?: number;
  observedScaleYAtLeast?: number;
  observedScaleYAtMost?: number;
  observedOpacityAtLeast?: number;
  observedOpacityAtMost?: number;
  observedAngleAtLeast?: number;
  observedAngleAtMost?: number;
  observedHitFallRecoverTimeAtLeast?: number;
  observedHitFallRecoverTimeMinAtLeast?: number;
  observedHitFallRecoverTimeAtMost?: number;
  observedHitFallRecoverTimeDropAtLeast?: number;
  observedHitFallDownRecoverTimeAtLeast?: number;
  observedHitFallDownRecoverTimeAtMost?: number;
  observedHitFallDownRecoverTimeDropAtLeast?: number;
  bodyWidthFront?: number;
  bodyWidthBack?: number;
  playerPush?: boolean;
  spritePriority?: number;
  paletteFxTime?: number;
  paletteFxAddR?: number;
  paletteFxAddG?: number;
  paletteFxAddB?: number;
  paletteFxMulR?: number;
  paletteFxMulG?: number;
  paletteFxMulB?: number;
  paletteFxColor?: number;
  paletteFxInvert?: boolean;
  paletteRemapSourceGroup?: number;
  paletteRemapSourceIndex?: number;
  paletteRemapDestGroup?: number;
  paletteRemapDestIndex?: number;
  afterImageTime?: number;
  afterImageLength?: number;
  afterImageTimeGap?: number;
  afterImageFrameGap?: number;
  afterImageSampleCountAtLeast?: number;
  afterImageOpacity?: number;
  posFreezeX?: boolean;
  posFreezeY?: boolean;
  screenBound?: boolean;
  moveCameraX?: boolean;
  moveCameraY?: boolean;
};

export type RuntimeTraceActorFrameSequenceRequirement = {
  label?: string;
  steps: RuntimeTraceActorFrameRequirement[];
  allowSameTick?: boolean;
};

export type RuntimeTraceGateActorFrameEvidence = {
  actorId: string;
  label: string;
  source?: ActorSnapshot["source"];
  actorKind: RuntimeActorKind;
  ownerId: string;
  customOwnerId?: string;
  stateNo: number;
  animNo: number;
  facing: 1 | -1;
  stateType: string;
  moveType: string;
  physics: string;
  clsn1Count: number;
  clsn2Count: number;
  minLife: number;
  maxLife: number;
  minPower: number;
  maxPower: number;
  minPos: { x: number; y: number };
  maxPos: { x: number; y: number };
  minVel: { x: number; y: number };
  maxVel: { x: number; y: number };
  minScale: { x: number; y: number };
  maxScale: { x: number; y: number };
  minOpacity: number;
  maxOpacity: number;
  minAngle: number;
  maxAngle: number;
  minHitFallRecoverTime?: number;
  maxHitFallRecoverTime?: number;
  firstHitFallRecoverTime?: number;
  lastHitFallRecoverTime?: number;
  minHitFallDownRecoverTime?: number;
  maxHitFallDownRecoverTime?: number;
  firstHitFallDownRecoverTime?: number;
  lastHitFallDownRecoverTime?: number;
  bodyWidthFront?: number;
  bodyWidthBack?: number;
  playerPush?: boolean;
  spritePriority?: number;
  paletteFxTime?: number;
  paletteFxAddR?: number;
  paletteFxAddG?: number;
  paletteFxAddB?: number;
  paletteFxMulR?: number;
  paletteFxMulG?: number;
  paletteFxMulB?: number;
  paletteFxColor?: number;
  paletteFxInvert?: boolean;
  paletteRemapSourceGroup?: number;
  paletteRemapSourceIndex?: number;
  paletteRemapDestGroup?: number;
  paletteRemapDestIndex?: number;
  afterImageTime?: number;
  afterImageLength?: number;
  afterImageTimeGap?: number;
  afterImageFrameGap?: number;
  afterImageSampleCount?: number;
  afterImageOpacity?: number;
  posFreezeX?: boolean;
  posFreezeY?: boolean;
  screenBound?: boolean;
  moveCameraX?: boolean;
  moveCameraY?: boolean;
  firstTick: number;
  lastTick: number;
  frames: number;
};

export type RuntimeTraceStageFrameRequirement = {
  stageId?: string;
  minFrames?: number;
  observedCameraXAtLeast?: number;
  observedCameraXAtMost?: number;
  observedCameraYAtLeast?: number;
  observedCameraYAtMost?: number;
  observedZoomAtLeast?: number;
  observedZoomAtMost?: number;
  envColorR?: number;
  envColorG?: number;
  envColorB?: number;
  envColorUnder?: boolean;
  observedEnvColorOpacityAtLeast?: number;
  observedEnvColorOpacityAtMost?: number;
  boundLeft?: number;
  boundRight?: number;
};

export type RuntimeTraceGateStageFrameEvidence = {
  stageId?: string;
  displayName?: string;
  bounds?: StageSnapshot["bounds"];
  minCamera: { x: number; y: number; zoom: number };
  maxCamera: { x: number; y: number; zoom: number };
  envColor?: {
    color: [number, number, number];
    under: boolean;
    minOpacity: number;
    maxOpacity: number;
  };
  firstTick: number;
  lastTick: number;
  frames: number;
};

export type RuntimeTraceRoundFrameRequirement = {
  state?: RoundSnapshot["state"];
  winner?: string;
  message?: string;
  minFrames?: number;
  observedTimerAtLeast?: number;
  observedTimerAtMost?: number;
};

export type RuntimeTraceGateRoundFrameEvidence = {
  state: RoundSnapshot["state"];
  winner?: string;
  message: string;
  minTimer: number;
  maxTimer: number;
  firstTick: number;
  lastTick: number;
  frames: number;
};

export type RuntimeTraceGateFinalActorEvidence = Pick<
  RuntimeTraceActor,
  | "id"
  | "label"
  | "actorKind"
  | "source"
  | "customOwnerId"
  | "stateNo"
  | "animNo"
  | "life"
  | "power"
  | "ctrl"
  | "stateType"
  | "moveType"
  | "physics"
  | "guarding"
  | "hitFall"
  | "targetCount"
>;

export type RuntimeTraceSoundEventRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  type?: NonNullable<ActorSnapshot["soundEvents"]>[number]["type"];
  group?: number;
  index?: number;
  channel?: number;
  lowPriority?: boolean;
  raw?: string;
  soundPrefix?: string;
  stateNo?: number;
  contactId?: string;
  contactTick?: number;
  contactKind?: RuntimeHitDefContactKind;
  requireContactId?: boolean;
  minCount?: number;
};

export type RuntimeTraceGateSoundEventEvidence = {
  actorId: string;
  label: string;
  source?: ActorSnapshot["source"];
  actorKind: RuntimeActorKind;
  type: NonNullable<ActorSnapshot["soundEvents"]>[number]["type"];
  group?: number;
  index?: number;
  channel?: number;
  lowPriority?: boolean;
  raw?: string;
  soundPrefix?: string;
  stateNo: number;
  eventTick: number;
  runtimeTick?: number;
  contactId?: string;
  contactTick?: number;
  contactKind?: RuntimeHitDefContactKind;
  firstTraceTick: number;
  lastTraceTick: number;
  count: number;
};

export type RuntimeTraceHitEffectEventRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  kind?: NonNullable<ActorSnapshot["hitEffectEvents"]>[number]["kind"];
  sparkNo?: number;
  raw?: string;
  rawPrefix?: string;
  offsetX?: number;
  offsetY?: number;
  assetSource?: NonNullable<NonNullable<ActorSnapshot["hitEffectEvents"]>[number]["assetFrame"]>["source"];
  fightFxPrefix?: string;
  assetActionId?: number;
  assetFrameIndex?: number;
  assetFrameOffsetX?: number;
  assetFrameOffsetY?: number;
  assetFrameDuration?: number;
  assetSpriteGroup?: number;
  assetSpriteIndex?: number;
  minAssetFrameCount?: number;
  minAssetTotalDuration?: number;
  requiredAssetFrameIndices?: number[];
  stateNo?: number;
  contactId?: string;
  contactTick?: number;
  contactKind?: RuntimeHitDefContactKind;
  requireContactId?: boolean;
  minCount?: number;
};

export type RuntimeTraceGateHitEffectEventEvidence = {
  actorId: string;
  label: string;
  source?: ActorSnapshot["source"];
  actorKind: RuntimeActorKind;
  type: NonNullable<ActorSnapshot["hitEffectEvents"]>[number]["type"];
  kind: NonNullable<ActorSnapshot["hitEffectEvents"]>[number]["kind"];
  sparkNo?: number;
  raw?: string;
  rawPrefix?: string;
  offset?: { x: number; y: number };
  assetSource?: NonNullable<NonNullable<ActorSnapshot["hitEffectEvents"]>[number]["assetFrame"]>["source"];
  fightFxPrefix?: string;
  assetActionId?: number;
  assetFrameIndex?: number;
  assetFrameOffsetX?: number;
  assetFrameOffsetY?: number;
  assetFrameDuration?: number;
  assetSpriteGroup?: number;
  assetSpriteIndex?: number;
  assetFrameCount?: number;
  assetTotalDuration?: number;
  assetFrameIndices?: number[];
  stateNo: number;
  eventTick: number;
  runtimeTick?: number;
  contactId?: string;
  contactTick?: number;
  contactKind?: RuntimeHitDefContactKind;
  firstTraceTick: number;
  lastTraceTick: number;
  count: number;
};

export type RuntimeTraceContactEffectPackageRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  contactId?: string;
  contactTick?: number;
  contactKind?: RuntimeHitDefContactKind;
  sound?: RuntimeTraceSoundEventRequirement;
  hitEffect?: RuntimeTraceHitEffectEventRequirement;
  minCount?: number;
};

export type RuntimeTraceGateContactEffectPackageEvidence = {
  actorId: string;
  label: string;
  source?: ActorSnapshot["source"];
  actorKind: RuntimeActorKind;
  contactId: string;
  contactTick: number;
  contactKind: RuntimeHitDefContactKind;
  sound: RuntimeTraceGateSoundEventEvidence;
  hitEffect: RuntimeTraceGateHitEffectEventEvidence;
  firstTraceTick: number;
  lastTraceTick: number;
  count: number;
};

export type RuntimeTraceEnvShakeEventRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  time?: number;
  freq?: number;
  ampl?: number;
  phase?: number;
  stateNo?: number;
  minCount?: number;
};

export type RuntimeTraceGateEnvShakeEventEvidence = {
  actorId: string;
  label: string;
  source?: ActorSnapshot["source"];
  actorKind: RuntimeActorKind;
  time: number;
  freq: number;
  ampl: number;
  phase: number;
  stateNo: number;
  eventTick: number;
  runtimeTick: number;
  firstTraceTick: number;
  lastTraceTick: number;
  count: number;
};

export type RuntimeTrace = {
  label: string;
  frameCount: number;
  initial: Omit<RuntimeTraceFrame, "input" | "events">;
  frames: RuntimeTraceFrame[];
  events: RuntimeTraceEvent[];
  combatReasons: RuntimeTraceCombatReason[];
  final: RuntimeTraceFrame;
  checksum: string;
};

export type RuntimeTraceGate = {
  label: string;
  requiredActorSources?: Array<NonNullable<ActorSnapshot["source"]>>;
  requiredActorKinds?: RuntimeActorKind[];
  requiredEffectKinds?: RuntimeActorKind[];
  requiredRoutedStates?: number[];
  requiredExecutedStates?: number[];
  forbiddenExecutedStates?: number[];
  requiredExecutedControllers?: Array<string | { type: string; minCount: number }>;
  requiredExecutedOperations?: Array<string | { operation: string; minCount: number }>;
  requiredControllerEventSequences?: RuntimeTraceControllerEventSequenceRequirement[];
  requiredActiveCommands?: string[];
  requiredEventCategories?: RuntimeTraceEvent["category"][];
  requiredEventSubstrings?: string[];
  requiredCombatReasons?: RuntimeTraceCombatReason["reason"][];
  requiredWorldLifecycleEvents?: RuntimeTraceWorldLifecycleEventRequirement[];
  requiredEffectStores?: RuntimeTraceEffectStoreRequirement[];
  requiredEffectPayloads?: RuntimeTraceEffectPayloadRequirement[];
  requiredMatchPauses?: RuntimeTraceMatchPauseRequirement[];
  requiredMatchPauseFreezes?: RuntimeTraceMatchPauseFreezeRequirement[];
  requiredMatchPauseAdvances?: RuntimeTraceMatchPauseAdvanceRequirement[];
  requiredSoundEvents?: RuntimeTraceSoundEventRequirement[];
  requiredHitEffectEvents?: RuntimeTraceHitEffectEventRequirement[];
  requiredContactEffectPackages?: RuntimeTraceContactEffectPackageRequirement[];
  requiredEnvShakeEvents?: RuntimeTraceEnvShakeEventRequirement[];
  requiredTargetLinks?: RuntimeTraceTargetLinkRequirement[];
  requiredRoundFrames?: RuntimeTraceRoundFrameRequirement[];
  requiredStageFrames?: RuntimeTraceStageFrameRequirement[];
  requiredActorFrames?: RuntimeTraceActorFrameRequirement[];
  requiredActorFrameSequences?: RuntimeTraceActorFrameSequenceRequirement[];
  requiredFinalActors?: RuntimeTraceFinalActorRequirement[];
};

export type RuntimeTraceGateEvidence = {
  actorSources: string[];
  actorKinds: RuntimeActorKind[];
  effectKinds: RuntimeActorKind[];
  routedStates: number[];
  executedStates: number[];
  executedControllers: Record<string, number>;
  executedOperations: Record<string, number>;
  controllerEvents: RuntimeTraceControllerEvent[];
  activeCommands: string[];
  eventCategories: RuntimeTraceEvent["category"][];
  eventLines: string[];
  combatReasons: RuntimeTraceCombatReason["reason"][];
  worldLifecycleEvents: RuntimeTraceGateWorldLifecycleEventEvidence[];
  effectStores: RuntimeTraceGateEffectStoreEvidence[];
  effectPayloads: RuntimeTraceGateEffectPayloadEvidence[];
  matchPauses: RuntimeTraceGateMatchPauseEvidence[];
  matchPauseFreezes: RuntimeTraceGateMatchPauseFreezeEvidence[];
  matchPauseAdvances: RuntimeTraceGateMatchPauseAdvanceEvidence[];
  soundEvents: RuntimeTraceGateSoundEventEvidence[];
  hitEffectEvents: RuntimeTraceGateHitEffectEventEvidence[];
  contactEffectPackages: RuntimeTraceGateContactEffectPackageEvidence[];
  envShakeEvents: RuntimeTraceGateEnvShakeEventEvidence[];
  targetLinks: RuntimeTraceGateTargetLinkEvidence[];
  roundFrames: RuntimeTraceGateRoundFrameEvidence[];
  stageFrames: RuntimeTraceGateStageFrameEvidence[];
  actorFrames: RuntimeTraceGateActorFrameEvidence[];
  finalActors: RuntimeTraceGateFinalActorEvidence[];
};

export type RuntimeTraceGateResult = {
  label: string;
  passed: boolean;
  failures: string[];
  evidence: RuntimeTraceGateEvidence;
};

export type RuntimeTraceControllerEventRequirement = {
  actorId?: string;
  stateNo?: number;
  controller?: string;
  name?: string;
  operation?: string;
};

export type RuntimeTraceControllerEventSequenceRequirement = {
  label?: string;
  actorId?: string;
  steps: RuntimeTraceControllerEventRequirement[];
  allowSameTick?: boolean;
};

export type RuntimeTraceRunner = {
  getSnapshot(): MugenSnapshot;
  step(input: MatchInput, options?: { force?: boolean }): MugenSnapshot;
  getActorRegistry?(): MatchWorldActorRegistrySnapshot;
};

export function expandRuntimeTraceScript(segments: RuntimeTraceScriptSegment[]): RuntimeTraceInputFrame[] {
  return segments.flatMap((segment) => {
    const count = Math.max(1, Math.floor(segment.frames ?? 1));
    return Array.from({ length: count }, (_, index) => ({
      label: index === 0 ? segment.label : undefined,
      p1: cloneInputTokens(segment.p1),
      p2: segment.p2 === undefined ? undefined : cloneInputTokens(segment.p2),
      force: segment.force,
    }));
  });
}

export function runRuntimeTrace(
  runtime: RuntimeTraceRunner,
  script: RuntimeTraceInputFrame[],
  options: { label?: string } = {},
): RuntimeTrace {
  let snapshot = runtime.getSnapshot();
  let previousLogs = snapshot.logs;
  const initial = summarizeTraceSnapshot(-1, snapshot, undefined, [], options.label ?? "initial", readActorRegistry(runtime));
  const frames: RuntimeTraceFrame[] = [];

  for (const [frameIndex, frame] of script.entries()) {
    const input = toMatchInput(frame);
    snapshot = runtime.step(input, frame.force ? { force: true } : undefined);
    const newLogs = collectNewLogs(previousLogs, snapshot.logs);
    previousLogs = snapshot.logs;
    frames.push(summarizeTraceSnapshot(frameIndex, snapshot, frame, newLogs, undefined, readActorRegistry(runtime)));
  }

  const final = frames.at(-1) ?? summarizeTraceSnapshot(0, snapshot, { p1: [], p2: [], force: false }, [], undefined, readActorRegistry(runtime));
  const events = frames.flatMap((frame) => frame.events);
  const combatReasons = frames.flatMap((frame) => frame.combatReasons);
  const checksum = hashStableJson({
    label: options.label ?? "runtime-trace",
    initial: initial.checksum,
    frames: frames.map((frame) => frame.checksum),
    final: final.checksum,
    events: events.map((event) => event.line),
    combatReasons,
  });

  return {
    label: options.label ?? "runtime-trace",
    frameCount: frames.length,
    initial,
    frames,
    events,
    combatReasons,
    final,
    checksum,
  };
}

export function evaluateRuntimeTraceGate(trace: RuntimeTrace, gate: RuntimeTraceGate): RuntimeTraceGateResult {
  const evidence = summarizeTraceGateEvidence(trace);
  const failures: string[] = [];

  for (const source of gate.requiredActorSources ?? []) {
    if (!evidence.actorSources.includes(source)) {
      failures.push(`Missing actor source: ${source}`);
    }
  }
  for (const kind of gate.requiredActorKinds ?? []) {
    if (!evidence.actorKinds.includes(kind)) {
      failures.push(`Missing actor kind: ${kind}`);
    }
  }
  for (const kind of gate.requiredEffectKinds ?? []) {
    if (!evidence.effectKinds.includes(kind)) {
      failures.push(`Missing effect kind: ${kind}`);
    }
  }
  for (const stateNo of gate.requiredRoutedStates ?? []) {
    if (!evidence.routedStates.includes(stateNo)) {
      failures.push(`Missing routed state: ${stateNo}`);
    }
  }
  for (const stateNo of gate.requiredExecutedStates ?? []) {
    if (!evidence.executedStates.includes(stateNo)) {
      failures.push(`Missing executed state: ${stateNo}`);
    }
  }
  for (const stateNo of gate.forbiddenExecutedStates ?? []) {
    if (evidence.executedStates.includes(stateNo)) {
      failures.push(`Forbidden executed state: ${stateNo}`);
    }
  }
  for (const controller of gate.requiredExecutedControllers ?? []) {
    const type = typeof controller === "string" ? controller : controller.type;
    const minCount = typeof controller === "string" ? 1 : controller.minCount;
    const actual = evidence.executedControllers[type] ?? 0;
    if (actual < minCount) {
      failures.push(`Missing executed controller: ${type} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const operation of gate.requiredExecutedOperations ?? []) {
    const type = typeof operation === "string" ? operation : operation.operation;
    const minCount = typeof operation === "string" ? 1 : operation.minCount;
    const actual = evidence.executedOperations[type] ?? 0;
    if (actual < minCount) {
      failures.push(`Missing executed operation: ${type} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const requirement of gate.requiredControllerEventSequences ?? []) {
    const result = matchesControllerEventSequenceRequirement(evidence.controllerEvents, requirement);
    if (!result.passed) {
      failures.push(`Missing controller event sequence: ${describeControllerEventSequenceRequirement(requirement)} (${result.reason})`);
    }
  }
  for (const command of gate.requiredActiveCommands ?? []) {
    if (!evidence.activeCommands.includes(command)) {
      failures.push(`Missing active command: ${command}`);
    }
  }
  for (const category of gate.requiredEventCategories ?? []) {
    if (!evidence.eventCategories.includes(category)) {
      failures.push(`Missing event category: ${category}`);
    }
  }
  for (const substring of gate.requiredEventSubstrings ?? []) {
    const expected = substring.toLowerCase();
    if (!evidence.eventLines.some((line) => line.toLowerCase().includes(expected))) {
      failures.push(`Missing event substring: ${substring}`);
    }
  }
  for (const reason of gate.requiredCombatReasons ?? []) {
    if (!evidence.combatReasons.includes(reason)) {
      failures.push(`Missing combat reason: ${reason}`);
    }
  }
  for (const requirement of gate.requiredWorldLifecycleEvents ?? []) {
    if (!evidence.worldLifecycleEvents.some((event) => matchesWorldLifecycleEventRequirement(event, requirement))) {
      failures.push(`Missing world lifecycle event: ${describeWorldLifecycleEventRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredEffectStores ?? []) {
    if (!evidence.effectStores.some((store) => matchesEffectStoreRequirement(store, requirement))) {
      failures.push(`Missing effect store: ${describeEffectStoreRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredEffectPayloads ?? []) {
    if (!evidence.effectPayloads.some((payload) => matchesEffectPayloadRequirement(payload, requirement))) {
      failures.push(`Missing effect payload: ${describeEffectPayloadRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredMatchPauses ?? []) {
    if (!evidence.matchPauses.some((pause) => matchesMatchPauseRequirement(pause, requirement))) {
      failures.push(`Missing match pause: ${describeMatchPauseRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredMatchPauseFreezes ?? []) {
    if (!evidence.matchPauseFreezes.some((freeze) => matchesMatchPauseFreezeRequirement(freeze, requirement))) {
      failures.push(`Missing match pause freeze: ${describeMatchPauseFreezeRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredMatchPauseAdvances ?? []) {
    if (!evidence.matchPauseAdvances.some((advance) => matchesMatchPauseAdvanceRequirement(advance, requirement))) {
      failures.push(`Missing match pause advance: ${describeMatchPauseAdvanceRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredSoundEvents ?? []) {
    const minCount = requirement.minCount ?? 1;
    const actual = evidence.soundEvents
      .filter((event) => matchesSoundEventRequirement(event, requirement))
      .reduce((total, event) => total + event.count, 0);
    if (actual < minCount) {
      failures.push(`Missing sound event: ${describeSoundEventRequirement(requirement)} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const requirement of gate.requiredHitEffectEvents ?? []) {
    const minCount = requirement.minCount ?? 1;
    const actual = evidence.hitEffectEvents
      .filter((event) => matchesHitEffectEventRequirement(event, requirement))
      .reduce((total, event) => total + event.count, 0);
    if (actual < minCount) {
      failures.push(`Missing hit-effect event: ${describeHitEffectEventRequirement(requirement)} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const requirement of gate.requiredContactEffectPackages ?? []) {
    const minCount = requirement.minCount ?? 1;
    const actual = evidence.contactEffectPackages
      .filter((event) => matchesContactEffectPackageRequirement(event, requirement))
      .reduce((total, event) => total + event.count, 0);
    if (actual < minCount) {
      failures.push(`Missing contact effect package: ${describeContactEffectPackageRequirement(requirement)} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const requirement of gate.requiredEnvShakeEvents ?? []) {
    const minCount = requirement.minCount ?? 1;
    const actual = evidence.envShakeEvents
      .filter((event) => matchesEnvShakeEventRequirement(event, requirement))
      .reduce((total, event) => total + event.count, 0);
    if (actual < minCount) {
      failures.push(`Missing env-shake event: ${describeEnvShakeEventRequirement(requirement)} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const requirement of gate.requiredTargetLinks ?? []) {
    if (!evidence.targetLinks.some((link) => matchesTargetLinkRequirement(link, requirement))) {
      failures.push(`Missing target link: ${describeTargetLinkRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredRoundFrames ?? []) {
    if (!evidence.roundFrames.some((round) => matchesRoundFrameRequirement(round, requirement))) {
      failures.push(`Missing round frame: ${describeRoundFrameRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredStageFrames ?? []) {
    if (!evidence.stageFrames.some((stage) => matchesStageFrameRequirement(stage, requirement))) {
      failures.push(`Missing stage frame: ${describeStageFrameRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredActorFrames ?? []) {
    if (!evidence.actorFrames.some((actor) => matchesActorFrameRequirement(actor, requirement))) {
      failures.push(`Missing actor frame: ${describeActorFrameRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredActorFrameSequences ?? []) {
    const result = matchesActorFrameSequenceRequirement(evidence.actorFrames, requirement);
    if (!result.passed) {
      failures.push(`Missing actor frame sequence: ${describeActorFrameSequenceRequirement(requirement)} (${result.reason})`);
    }
  }
  for (const requirement of gate.requiredFinalActors ?? []) {
    const actor = findRequiredFinalActor(evidence.finalActors, requirement);
    if (!actor) {
      failures.push(`Missing final actor matching: ${describeFinalActorRequirement(requirement)}`);
      continue;
    }
    for (const [field, expected] of Object.entries(requirement) as Array<
      [keyof RuntimeTraceFinalActorRequirement, RuntimeTraceFinalActorRequirement[keyof RuntimeTraceFinalActorRequirement]]
    >) {
      if (expected === undefined || field === "actorId") {
        continue;
      }
      if (field === "hitFall") {
        failures.push(...compareHitFallRequirement(actor, expected as RuntimeTraceHitFallRequirement));
        continue;
      }
      if (actor[field] !== expected) {
        failures.push(`Final actor ${actor.id} ${field} expected ${String(expected)} (actual ${String(actor[field])})`);
      }
    }
  }

  return {
    label: gate.label,
    passed: failures.length === 0,
    failures,
    evidence,
  };
}

export function summarizeTraceGateEvidence(trace: RuntimeTrace): RuntimeTraceGateEvidence {
  const frames = [trace.initial, ...trace.frames, trace.final];
  const actorSources = new Set<string>();
  const actorKinds = new Set<RuntimeActorKind>();
  const effectKinds = new Set<RuntimeActorKind>();
  const routedStates = new Set<number>();
  const executedStates = new Set<number>();
  const activeCommands = new Set<string>();
  const eventCategories = new Set<RuntimeTraceEvent["category"]>();
  const eventLines = new Set<string>();
  const combatReasons = new Set<RuntimeTraceCombatReason["reason"]>();
  const worldLifecycleEvents = new Map<string, RuntimeTraceGateWorldLifecycleEventEvidence>();
  const worldLifecycleEventOccurrences = new Set<string>();
  const effectStores = new Map<string, RuntimeTraceGateEffectStoreAccumulator>();
  const effectPayloads = new Map<string, RuntimeTraceGateEffectPayloadEvidence>();
  const matchPauses = new Map<string, RuntimeTraceGateMatchPauseEvidence>();
  const matchPauseOccurrences = new Set<string>();
  const matchPauseFreezes = new Map<string, RuntimeTraceGateMatchPauseFreezeEvidence>();
  const matchPauseAdvances = new Map<string, RuntimeTraceGateMatchPauseAdvanceEvidence>();
  const soundEvents = new Map<string, RuntimeTraceGateSoundEventEvidence>();
  const hitEffectEvents = new Map<string, RuntimeTraceGateHitEffectEventEvidence>();
  const envShakeEvents = new Map<string, RuntimeTraceGateEnvShakeEventEvidence>();
  const targetLinks = new Map<string, RuntimeTraceGateTargetLinkEvidence>();
  const roundFrames = new Map<string, RuntimeTraceGateRoundFrameEvidence>();
  const stageFrames = new Map<string, RuntimeTraceGateStageFrameEvidence>();
  const actorFrames = new Map<string, RuntimeTraceGateActorFrameEvidence>();
  const executedControllers: Record<string, number> = {};
  const executedOperations: Record<string, number> = {};
  const controllerEvents = new Map<string, RuntimeTraceControllerEvent>();

  for (const [frameIndex, frame] of frames.entries()) {
    const allActors = [...frame.actors, ...frame.effects];
    if (frame.stage) {
      const key = stageFrameEvidenceKey(frame.stage);
      const existing = stageFrames.get(key);
      stageFrames.set(key, existing ? mergeStageFrameEvidence(existing, frame.stage, frame.tick) : summarizeStageFrameEvidence(frame.stage, frame.tick));
    }
    if (frame.round) {
      const key = roundFrameEvidenceKey(frame.round);
      const existing = roundFrames.get(key);
      roundFrames.set(key, existing ? mergeRoundFrameEvidence(existing, frame.round, frame.tick) : summarizeRoundFrameEvidence(frame.round, frame.tick));
    }
    for (const actor of frame.actors) {
      if (actor.source) {
        actorSources.add(actor.source);
      }
      actorKinds.add(actor.actorKind);
    }
    for (const effect of frame.effects) {
      effectKinds.add(effect.actorKind);
    }
    for (const actor of allActors) {
      if (actor.effect) {
        const payload = summarizeEffectPayloadEvidence(frame, actor);
        effectPayloads.set(effectPayloadEvidenceKey(payload), payload);
      }
      for (const event of actor.soundEvents ?? []) {
        const evidence = summarizeSoundEventEvidence(frame.tick, actor, event);
        const key = soundEventEvidenceKey(evidence);
        const existing = soundEvents.get(key);
        soundEvents.set(
          key,
          existing
            ? {
                ...existing,
                firstTraceTick: Math.min(existing.firstTraceTick, frame.tick),
                lastTraceTick: Math.max(existing.lastTraceTick, frame.tick),
              }
            : evidence,
        );
      }
      for (const event of actor.hitEffectEvents ?? []) {
        const evidence = summarizeHitEffectEventEvidence(frame.tick, actor, event);
        const key = hitEffectEventEvidenceKey(evidence);
        const existing = hitEffectEvents.get(key);
        hitEffectEvents.set(
          key,
          existing
            ? {
                ...existing,
                firstTraceTick: Math.min(existing.firstTraceTick, frame.tick),
                lastTraceTick: Math.max(existing.lastTraceTick, frame.tick),
              }
            : evidence,
        );
      }
      for (const event of actor.envShakeEvents ?? []) {
        const evidence = summarizeEnvShakeEventEvidence(frame.tick, actor, event);
        const key = envShakeEventEvidenceKey(evidence);
        const existing = envShakeEvents.get(key);
        envShakeEvents.set(
          key,
          existing
            ? {
                ...existing,
                firstTraceTick: Math.min(existing.firstTraceTick, frame.tick),
                lastTraceTick: Math.max(existing.lastTraceTick, frame.tick),
              }
            : evidence,
        );
      }
    }
    for (const actor of frame.compatibility ?? []) {
      for (const stateNo of actor.routedStates) {
        routedStates.add(stateNo);
      }
      for (const stateNo of actor.executedStates) {
        executedStates.add(stateNo);
      }
      for (const command of actor.activeCommands) {
        activeCommands.add(command);
      }
      for (const [type, count] of Object.entries(actor.executedControllers)) {
        executedControllers[type] = Math.max(executedControllers[type] ?? 0, count);
      }
      for (const [type, count] of Object.entries(actor.executedOperations)) {
        executedOperations[type] = Math.max(executedOperations[type] ?? 0, count);
      }
      for (const event of actor.controllerEvents) {
        controllerEvents.set(controllerEventKey(event), event);
      }
    }
    for (const reason of frame.combatReasons) {
      combatReasons.add(reason.reason);
    }
    for (const event of frame.world?.eventsThisTick ?? []) {
      const occurrenceKey = worldLifecycleEventOccurrenceKey(event);
      if (worldLifecycleEventOccurrences.has(occurrenceKey)) {
        continue;
      }
      worldLifecycleEventOccurrences.add(occurrenceKey);
      const evidence = summarizeWorldLifecycleEventEvidence(event);
      const key = worldLifecycleEventEvidenceKey(evidence);
      const existing = worldLifecycleEvents.get(key);
      worldLifecycleEvents.set(
        key,
        existing
          ? {
              ...existing,
              firstTick: Math.min(existing.firstTick, event.tick),
              lastTick: Math.max(existing.lastTick, event.tick),
              count: existing.count + 1,
            }
          : evidence,
      );
    }
    for (const store of frame.world?.effectStores ?? []) {
      const accumulator = effectStores.get(store.ownerId) ?? createEffectStoreAccumulator(store.ownerId);
      accumulator.total = Math.max(accumulator.total, store.total);
      accumulator.nextSerials.explod = Math.max(accumulator.nextSerials.explod, store.nextSerials.explod);
      accumulator.nextSerials.helper = Math.max(accumulator.nextSerials.helper, store.nextSerials.helper);
      accumulator.nextSerials.projectile = Math.max(accumulator.nextSerials.projectile, store.nextSerials.projectile);
      for (const id of store.explods) {
        accumulator.explods.add(id);
      }
      for (const id of store.helpers) {
        accumulator.helpers.add(id);
      }
      for (const id of store.projectiles) {
        accumulator.projectiles.add(id);
      }
      effectStores.set(store.ownerId, accumulator);
    }
    if (frame.matchPause) {
      const occurrenceKey = matchPauseOccurrenceKey(frame);
      if (!matchPauseOccurrences.has(occurrenceKey)) {
        matchPauseOccurrences.add(occurrenceKey);
        const pause = frame.matchPause;
        const key = matchPauseEvidenceKey(pause);
        const existing = matchPauses.get(key);
        matchPauses.set(
          key,
          existing
            ? {
                ...existing,
                firstTick: Math.min(existing.firstTick, frame.tick),
                lastTick: Math.max(existing.lastTick, frame.tick),
                frames: existing.frames + 1,
                maxRemaining: Math.max(existing.maxRemaining, pause.remaining),
                maxMoveTime: Math.max(existing.maxMoveTime, pause.moveTime),
              }
            : {
                type: pause.type,
                actorId: pause.actorId,
                sourceStateNo: pause.sourceStateNo,
                darken: pause.darken,
                firstTick: frame.tick,
                lastTick: frame.tick,
                frames: 1,
                maxRemaining: pause.remaining,
                maxMoveTime: pause.moveTime,
              },
        );
      }
    }
    const previousFrame = frameIndex > 0 ? frames[frameIndex - 1] : undefined;
    if (frame.matchPause && previousFrame) {
      const currentTraceActors = [...frame.actors, ...frame.effects];
      const previousTraceActors = [...previousFrame.actors, ...previousFrame.effects];
      for (const actor of currentTraceActors) {
        const previousActor = previousTraceActors.find((candidate) => candidate.id === actor.id);
        if (!previousActor) {
          continue;
        }
        const changedFields = traceActorChangedFields(previousActor, actor);
        if (changedFields.length > 0) {
          const key = matchPauseAdvanceEvidenceKey(frame.matchPause.type, actor.id);
          const existing = matchPauseAdvances.get(key);
          matchPauseAdvances.set(
            key,
            existing
              ? {
                  ...existing,
                  firstTick: Math.min(existing.firstTick, frame.tick),
                  lastTick: Math.max(existing.lastTick, frame.tick),
                  advancedFrames: existing.advancedFrames + 1,
                  maxPreviousMoveTime: Math.max(existing.maxPreviousMoveTime, previousFrame.matchPause?.moveTime ?? 0),
                  changedFields: sortStrings([...new Set([...existing.changedFields, ...changedFields])]),
                }
              : {
                  type: frame.matchPause.type,
                  actorId: actor.id,
                  actorKind: actor.actorKind,
                  ownerId: actor.ownerId,
                  firstTick: frame.tick,
                  lastTick: frame.tick,
                  advancedFrames: 1,
                  maxPreviousMoveTime: previousFrame.matchPause?.moveTime ?? 0,
                  changedFields,
                },
          );
          continue;
        }
        const key = matchPauseFreezeEvidenceKey(frame.matchPause.type, actor.id);
        const existing = matchPauseFreezes.get(key);
        matchPauseFreezes.set(
          key,
          existing
            ? {
                ...existing,
                firstTick: Math.min(existing.firstTick, frame.tick),
                lastTick: Math.max(existing.lastTick, frame.tick),
                frozenFrames: existing.frozenFrames + 1,
              }
            : {
                type: frame.matchPause.type,
                actorId: actor.id,
                actorKind: actor.actorKind,
                ownerId: actor.ownerId,
                firstTick: frame.tick,
                lastTick: frame.tick,
                frozenFrames: 1,
                comparedFields: [...TRACE_ACTOR_FREEZE_FIELDS],
              },
        );
      }
    }
    if (previousFrame) {
      collectHitPauseMotionEvidence(frame, previousFrame, matchPauseFreezes, matchPauseAdvances);
    }
    for (const link of frame.world?.targetLinks ?? []) {
      const evidence = summarizeTargetLinkEvidence(frame.tick, link);
      const key = targetLinkEvidenceKey(evidence);
      const existing = targetLinks.get(key);
      targetLinks.set(key, existing ? mergeTargetLinkEvidence(existing, evidence) : evidence);
    }
    for (const actor of allActors) {
      const key = actorFrameEvidenceKey(actor);
      const existing = actorFrames.get(key);
      actorFrames.set(
        key,
        existing
          ? {
              ...existing,
              firstTick: Math.min(existing.firstTick, frame.tick),
              lastTick: Math.max(existing.lastTick, frame.tick),
              frames: existing.frames + 1,
              minLife: Math.min(existing.minLife, actor.life),
              maxLife: Math.max(existing.maxLife, actor.life),
              minPower: Math.min(existing.minPower, actor.power),
              maxPower: Math.max(existing.maxPower, actor.power),
              minPos: {
                x: Math.min(existing.minPos.x, actor.pos.x),
                y: Math.min(existing.minPos.y, actor.pos.y),
              },
              maxPos: {
                x: Math.max(existing.maxPos.x, actor.pos.x),
                y: Math.max(existing.maxPos.y, actor.pos.y),
              },
              minVel: {
                x: Math.min(existing.minVel.x, actor.vel.x),
                y: Math.min(existing.minVel.y, actor.vel.y),
              },
              maxVel: {
                x: Math.max(existing.maxVel.x, actor.vel.x),
                y: Math.max(existing.maxVel.y, actor.vel.y),
              },
              minScale: {
                x: Math.min(existing.minScale.x, actor.renderScale?.x ?? 1),
                y: Math.min(existing.minScale.y, actor.renderScale?.y ?? 1),
              },
              maxScale: {
                x: Math.max(existing.maxScale.x, actor.renderScale?.x ?? 1),
                y: Math.max(existing.maxScale.y, actor.renderScale?.y ?? 1),
              },
              minOpacity: Math.min(existing.minOpacity, actor.renderOpacity ?? 1),
              maxOpacity: Math.max(existing.maxOpacity, actor.renderOpacity ?? 1),
              minAngle: Math.min(existing.minAngle, actor.renderAngle ?? 0),
              maxAngle: Math.max(existing.maxAngle, actor.renderAngle ?? 0),
              minHitFallRecoverTime: minOptionalTraceNumber(existing.minHitFallRecoverTime, actor.hitFall?.recoverTime),
              maxHitFallRecoverTime: maxOptionalTraceNumber(existing.maxHitFallRecoverTime, actor.hitFall?.recoverTime),
              firstHitFallRecoverTime:
                frame.tick < existing.firstTick ? actor.hitFall?.recoverTime : existing.firstHitFallRecoverTime,
              lastHitFallRecoverTime:
                frame.tick >= existing.lastTick ? actor.hitFall?.recoverTime : existing.lastHitFallRecoverTime,
              minHitFallDownRecoverTime: minOptionalTraceNumber(existing.minHitFallDownRecoverTime, actor.hitFall?.downRecoverTime),
              maxHitFallDownRecoverTime: maxOptionalTraceNumber(existing.maxHitFallDownRecoverTime, actor.hitFall?.downRecoverTime),
              firstHitFallDownRecoverTime:
                frame.tick < existing.firstTick ? actor.hitFall?.downRecoverTime : existing.firstHitFallDownRecoverTime,
              lastHitFallDownRecoverTime:
                frame.tick >= existing.lastTick ? actor.hitFall?.downRecoverTime : existing.lastHitFallDownRecoverTime,
            }
          : {
              actorId: actor.id,
              label: actor.label,
              source: actor.source,
              actorKind: actor.actorKind,
              ownerId: actor.ownerId,
              customOwnerId: actor.customOwnerId,
              stateNo: actor.stateNo,
              animNo: actor.animNo,
              facing: actor.facing,
              stateType: actor.stateType,
              moveType: actor.moveType,
              physics: actor.physics,
              clsn1Count: actor.clsn1Count,
              clsn2Count: actor.clsn2Count,
              minLife: actor.life,
              maxLife: actor.life,
              minPower: actor.power,
              maxPower: actor.power,
              minPos: { ...actor.pos },
              maxPos: { ...actor.pos },
              minVel: { ...actor.vel },
              maxVel: { ...actor.vel },
              minScale: { x: actor.renderScale?.x ?? 1, y: actor.renderScale?.y ?? 1 },
              maxScale: { x: actor.renderScale?.x ?? 1, y: actor.renderScale?.y ?? 1 },
              minOpacity: actor.renderOpacity ?? 1,
              maxOpacity: actor.renderOpacity ?? 1,
              minAngle: actor.renderAngle ?? 0,
              maxAngle: actor.renderAngle ?? 0,
              minHitFallRecoverTime: actor.hitFall?.recoverTime,
              maxHitFallRecoverTime: actor.hitFall?.recoverTime,
              firstHitFallRecoverTime: actor.hitFall?.recoverTime,
              lastHitFallRecoverTime: actor.hitFall?.recoverTime,
              minHitFallDownRecoverTime: actor.hitFall?.downRecoverTime,
              maxHitFallDownRecoverTime: actor.hitFall?.downRecoverTime,
              firstHitFallDownRecoverTime: actor.hitFall?.downRecoverTime,
              lastHitFallDownRecoverTime: actor.hitFall?.downRecoverTime,
              bodyWidthFront: actor.bodyWidth?.front,
              bodyWidthBack: actor.bodyWidth?.back,
              playerPush: actor.playerPush,
              spritePriority: actor.spritePriority,
              paletteFxTime: actor.paletteFx?.time,
              paletteFxAddR: actor.paletteFx?.add[0],
              paletteFxAddG: actor.paletteFx?.add[1],
              paletteFxAddB: actor.paletteFx?.add[2],
              paletteFxMulR: actor.paletteFx?.mul[0],
              paletteFxMulG: actor.paletteFx?.mul[1],
              paletteFxMulB: actor.paletteFx?.mul[2],
              paletteFxColor: actor.paletteFx?.color,
              paletteFxInvert: actor.paletteFx?.invert,
              paletteRemapSourceGroup: actor.paletteRemap?.source[0],
              paletteRemapSourceIndex: actor.paletteRemap?.source[1],
              paletteRemapDestGroup: actor.paletteRemap?.dest[0],
              paletteRemapDestIndex: actor.paletteRemap?.dest[1],
              afterImageTime: actor.afterImage?.time,
              afterImageLength: actor.afterImage?.length,
              afterImageTimeGap: actor.afterImage?.timeGap,
              afterImageFrameGap: actor.afterImage?.frameGap,
              afterImageSampleCount: actor.afterImage?.sampleCount,
              afterImageOpacity: actor.afterImage?.opacity,
              posFreezeX: actor.posFreeze?.x,
              posFreezeY: actor.posFreeze?.y,
              screenBound: actor.screenBound?.bound,
              moveCameraX: actor.screenBound?.moveCameraX,
              moveCameraY: actor.screenBound?.moveCameraY,
              firstTick: frame.tick,
              lastTick: frame.tick,
              frames: 1,
            },
      );
    }
  }
  for (const event of trace.events) {
    eventCategories.add(event.category);
    eventLines.add(event.line);
  }

  const summarizedSoundEvents = [...soundEvents.values()].sort((left, right) => soundEventEvidenceKey(left).localeCompare(soundEventEvidenceKey(right)));
  const summarizedHitEffectEvents = [...hitEffectEvents.values()].sort((left, right) =>
    hitEffectEventEvidenceKey(left).localeCompare(hitEffectEventEvidenceKey(right)),
  );

  return {
    actorSources: sortStrings([...actorSources]),
    actorKinds: sortStrings([...actorKinds]) as RuntimeActorKind[],
    effectKinds: sortStrings([...effectKinds]) as RuntimeActorKind[],
    routedStates: sortNumbers([...routedStates]),
    executedStates: sortNumbers([...executedStates]),
    executedControllers: Object.fromEntries(Object.entries(executedControllers).sort(([left], [right]) => left.localeCompare(right))),
    executedOperations: Object.fromEntries(Object.entries(executedOperations).sort(([left], [right]) => left.localeCompare(right))),
    controllerEvents: [...controllerEvents.values()].sort(compareControllerTraceEvents),
    activeCommands: sortStrings([...activeCommands]),
    eventCategories: sortStrings([...eventCategories]) as RuntimeTraceEvent["category"][],
    eventLines: sortStrings([...eventLines]),
    combatReasons: sortStrings([...combatReasons]) as RuntimeTraceCombatReason["reason"][],
    worldLifecycleEvents: [...worldLifecycleEvents.values()].sort((left, right) =>
      worldLifecycleEventEvidenceKey(left).localeCompare(worldLifecycleEventEvidenceKey(right)),
    ),
    effectStores: [...effectStores.values()]
      .map(finalizeEffectStoreEvidence)
      .sort((left, right) => left.ownerId.localeCompare(right.ownerId)),
    effectPayloads: [...effectPayloads.values()].sort((left, right) => effectPayloadEvidenceKey(left).localeCompare(effectPayloadEvidenceKey(right))),
    matchPauses: [...matchPauses.values()].sort((left, right) => matchPauseGateEvidenceKey(left).localeCompare(matchPauseGateEvidenceKey(right))),
    matchPauseFreezes: [...matchPauseFreezes.values()].sort((left, right) =>
      matchPauseFreezeEvidenceKey(left.type, left.actorId).localeCompare(matchPauseFreezeEvidenceKey(right.type, right.actorId)),
    ),
    matchPauseAdvances: [...matchPauseAdvances.values()].sort((left, right) =>
      matchPauseAdvanceEvidenceKey(left.type, left.actorId).localeCompare(matchPauseAdvanceEvidenceKey(right.type, right.actorId)),
    ),
    soundEvents: summarizedSoundEvents,
    hitEffectEvents: summarizedHitEffectEvents,
    contactEffectPackages: summarizeContactEffectPackageEvidence(summarizedSoundEvents, summarizedHitEffectEvents),
    envShakeEvents: [...envShakeEvents.values()].sort((left, right) => envShakeEventEvidenceKey(left).localeCompare(envShakeEventEvidenceKey(right))),
    targetLinks: [...targetLinks.values()].sort((left, right) => targetLinkEvidenceKey(left).localeCompare(targetLinkEvidenceKey(right))),
    roundFrames: [...roundFrames.values()].sort((left, right) => roundFrameGateEvidenceKey(left).localeCompare(roundFrameGateEvidenceKey(right))),
    stageFrames: [...stageFrames.values()].sort((left, right) => stageFrameGateEvidenceKey(left).localeCompare(stageFrameGateEvidenceKey(right))),
    actorFrames: [...actorFrames.values()].sort((left, right) => actorFrameGateEvidenceKey(left).localeCompare(actorFrameGateEvidenceKey(right))),
    finalActors: trace.final.actors.map(summarizeFinalActorEvidence),
  };
}

type RuntimeTraceGateEffectStoreAccumulator = {
  ownerId: string;
  total: number;
  explods: Set<string>;
  helpers: Set<string>;
  projectiles: Set<string>;
  nextSerials: RuntimeTraceWorldEffectStoreSummary["nextSerials"];
};

function createEffectStoreAccumulator(ownerId: string): RuntimeTraceGateEffectStoreAccumulator {
  return {
    ownerId,
    total: 0,
    explods: new Set<string>(),
    helpers: new Set<string>(),
    projectiles: new Set<string>(),
    nextSerials: {
      explod: 0,
      helper: 0,
      projectile: 0,
    },
  };
}

function finalizeEffectStoreEvidence(
  store: RuntimeTraceGateEffectStoreAccumulator,
): RuntimeTraceGateEffectStoreEvidence {
  return {
    ownerId: store.ownerId,
    total: store.total,
    explods: sortStrings([...store.explods]),
    helpers: sortStrings([...store.helpers]),
    projectiles: sortStrings([...store.projectiles]),
    nextSerials: { ...store.nextSerials },
  };
}

function summarizeEffectPayloadEvidence(
  frame: Omit<RuntimeTraceFrame, "input" | "events"> | RuntimeTraceFrame,
  actor: RuntimeTraceActor,
): RuntimeTraceGateEffectPayloadEvidence {
  if (!actor.effect) {
    throw new Error("summarizeEffectPayloadEvidence requires an actor effect payload");
  }
  return {
    frameIndex: frame.frameIndex,
    tick: frame.tick,
    actorId: actor.id,
    label: actor.label,
    source: actor.source,
    actorKind: actor.actorKind,
    ownerId: actor.ownerId,
    rootId: actor.rootId,
    parentId: actor.parentId,
    effect: cloneTraceEffect(actor.effect),
  };
}

function effectPayloadEvidenceKey(payload: RuntimeTraceGateEffectPayloadEvidence): string {
  return `${payload.tick}:${payload.frameIndex}:${payload.actorId}:${payload.effect.kind}:${JSON.stringify(payload.effect)}`;
}

function summarizeWorldLifecycleEventEvidence(
  event: RuntimeTraceWorldLifecycleEvent,
): RuntimeTraceGateWorldLifecycleEventEvidence {
  return {
    type: event.type,
    id: event.id,
    label: event.label,
    kind: event.kind,
    layer: event.layer,
    ownerId: event.ownerId,
    rootId: event.rootId,
    parentId: event.parentId,
    firstTick: event.tick,
    lastTick: event.tick,
    count: 1,
  };
}

function worldLifecycleEventOccurrenceKey(event: RuntimeTraceWorldLifecycleEvent): string {
  return `${event.type}:${event.id}:${event.tick}`;
}

function worldLifecycleEventEvidenceKey(event: RuntimeTraceGateWorldLifecycleEventEvidence): string {
  return `${event.type}:${event.kind}:${event.layer}:${event.ownerId}:${event.rootId}:${event.parentId}:${event.id}`;
}

function matchesWorldLifecycleEventRequirement(
  event: RuntimeTraceGateWorldLifecycleEventEvidence,
  requirement: RuntimeTraceWorldLifecycleEventRequirement,
): boolean {
  return (
    (requirement.type === undefined || event.type === requirement.type) &&
    (requirement.id === undefined || event.id === requirement.id) &&
    (requirement.kind === undefined || event.kind === requirement.kind) &&
    (requirement.layer === undefined || event.layer === requirement.layer) &&
    (requirement.ownerId === undefined || event.ownerId === requirement.ownerId) &&
    (requirement.rootId === undefined || event.rootId === requirement.rootId) &&
    (requirement.parentId === undefined || event.parentId === requirement.parentId)
  );
}

function describeWorldLifecycleEventRequirement(requirement: RuntimeTraceWorldLifecycleEventRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchesEffectStoreRequirement(
  store: RuntimeTraceGateEffectStoreEvidence,
  requirement: RuntimeTraceEffectStoreRequirement,
): boolean {
  return (
    (requirement.ownerId === undefined || store.ownerId === requirement.ownerId) &&
    (requirement.minTotal === undefined || store.total >= requirement.minTotal) &&
    (requirement.minExplods === undefined || store.explods.length >= requirement.minExplods) &&
    (requirement.minHelpers === undefined || store.helpers.length >= requirement.minHelpers) &&
    (requirement.minProjectiles === undefined || store.projectiles.length >= requirement.minProjectiles) &&
    (requirement.minNextExplodSerial === undefined || store.nextSerials.explod >= requirement.minNextExplodSerial) &&
    (requirement.minNextHelperSerial === undefined || store.nextSerials.helper >= requirement.minNextHelperSerial) &&
    (requirement.minNextProjectileSerial === undefined ||
      store.nextSerials.projectile >= requirement.minNextProjectileSerial) &&
    (requirement.includesExplod === undefined || store.explods.includes(requirement.includesExplod)) &&
    (requirement.includesHelper === undefined || store.helpers.includes(requirement.includesHelper)) &&
    (requirement.includesProjectile === undefined || store.projectiles.includes(requirement.includesProjectile))
  );
}

function describeEffectStoreRequirement(requirement: RuntimeTraceEffectStoreRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchesEffectPayloadRequirement(
  payload: RuntimeTraceGateEffectPayloadEvidence,
  requirement: RuntimeTraceEffectPayloadRequirement,
): boolean {
  const effect = payload.effect;
  return (
    (requirement.actorId === undefined || payload.actorId === requirement.actorId) &&
    (requirement.actorKind === undefined || payload.actorKind === requirement.actorKind) &&
    (requirement.ownerId === undefined || payload.ownerId === requirement.ownerId) &&
    (requirement.parentId === undefined || payload.parentId === requirement.parentId) &&
    (requirement.source === undefined || payload.source === requirement.source) &&
    (requirement.kind === undefined || effect.kind === requirement.kind) &&
    (requirement.effectId === undefined || effect.id === requirement.effectId) &&
    (requirement.minAge === undefined || effect.age >= requirement.minAge) &&
    (requirement.maxAge === undefined || effect.age <= requirement.maxAge) &&
    (requirement.minRemoveTime === undefined || effect.removeTime >= requirement.minRemoveTime) &&
    (requirement.minSpritePriority === undefined || effect.spritePriority >= requirement.minSpritePriority) &&
    matchesEffectScalePayloadRequirement(effect, requirement) &&
    matchesEffectPausePayloadRequirement(effect, requirement) &&
    matchesHelperPayloadRequirement(effect, requirement) &&
    matchesProjectilePayloadRequirement(effect, requirement) &&
    matchesExplodPayloadRequirement(effect, requirement)
  );
}

function matchesHelperPayloadRequirement(
  effect: RuntimeTraceEffectSummary,
  requirement: RuntimeTraceEffectPayloadRequirement,
): boolean {
  const hasHelperRequirement =
    requirement.name !== undefined ||
    requirement.helperStateNo !== undefined ||
    requirement.targetCount !== undefined ||
    requirement.ownerBindTarget !== undefined ||
    requirement.ownerBindOffsetX !== undefined ||
    requirement.ownerBindOffsetY !== undefined ||
    requirement.minOwnerBindRemaining !== undefined ||
    requirement.maxOwnerBindRemaining !== undefined;
  if (!hasHelperRequirement) {
    return true;
  }
  return (
    effect.kind === "helper" &&
    (requirement.name === undefined || effect.name === requirement.name) &&
    (requirement.helperStateNo === undefined || effect.stateNo === requirement.helperStateNo) &&
    (requirement.targetCount === undefined || effect.targetCount === requirement.targetCount) &&
    matchesHelperOwnerBindPayloadRequirement(effect, requirement)
  );
}

function matchesHelperOwnerBindPayloadRequirement(
  effect: Extract<RuntimeTraceEffectSummary, { kind: "helper" }>,
  requirement: RuntimeTraceEffectPayloadRequirement,
): boolean {
  const hasOwnerBindRequirement =
    requirement.ownerBindTarget !== undefined ||
    requirement.ownerBindOffsetX !== undefined ||
    requirement.ownerBindOffsetY !== undefined ||
    requirement.minOwnerBindRemaining !== undefined ||
    requirement.maxOwnerBindRemaining !== undefined;
  if (!hasOwnerBindRequirement) {
    return true;
  }
  if (!effect.ownerBind) {
    return false;
  }
  return (
    (requirement.ownerBindTarget === undefined || effect.ownerBind.target === requirement.ownerBindTarget) &&
    (requirement.ownerBindOffsetX === undefined || sameTraceNumber(effect.ownerBind.offset.x, requirement.ownerBindOffsetX)) &&
    (requirement.ownerBindOffsetY === undefined || sameTraceNumber(effect.ownerBind.offset.y, requirement.ownerBindOffsetY)) &&
    (requirement.minOwnerBindRemaining === undefined || effect.ownerBind.remaining >= requirement.minOwnerBindRemaining) &&
    (requirement.maxOwnerBindRemaining === undefined || effect.ownerBind.remaining <= requirement.maxOwnerBindRemaining)
  );
}

function matchesEffectScalePayloadRequirement(
  effect: RuntimeTraceEffectSummary,
  requirement: RuntimeTraceEffectPayloadRequirement,
): boolean {
  if (requirement.scaleX === undefined && requirement.scaleY === undefined) {
    return true;
  }
  if (!("scale" in effect) || effect.scale === undefined) {
    return false;
  }
  return (
    (requirement.scaleX === undefined || sameTraceNumber(effect.scale.x, requirement.scaleX)) &&
    (requirement.scaleY === undefined || sameTraceNumber(effect.scale.y, requirement.scaleY))
  );
}

function matchesEffectPausePayloadRequirement(
  effect: RuntimeTraceEffectSummary,
  requirement: RuntimeTraceEffectPayloadRequirement,
): boolean {
  const hasPauseRequirement =
    requirement.ignoreHitPause !== undefined ||
    requirement.minPauseMoveTime !== undefined ||
    requirement.minSuperMoveTime !== undefined;
  if (!hasPauseRequirement) {
    return true;
  }
  if (!("ignoreHitPause" in effect) || !("pauseMoveTime" in effect) || !("superMoveTime" in effect)) {
    return false;
  }
  return (
    (requirement.ignoreHitPause === undefined || effect.ignoreHitPause === requirement.ignoreHitPause) &&
    (requirement.minPauseMoveTime === undefined || effect.pauseMoveTime >= requirement.minPauseMoveTime) &&
    (requirement.minSuperMoveTime === undefined || effect.superMoveTime >= requirement.minSuperMoveTime)
  );
}

function matchesProjectilePayloadRequirement(
  effect: RuntimeTraceEffectSummary,
  requirement: RuntimeTraceEffectPayloadRequirement,
): boolean {
  const hasProjectileRequirement =
    requirement.minPriority !== undefined ||
    requirement.minHitsRemaining !== undefined ||
    requirement.maxHitsRemaining !== undefined ||
    requirement.hasHit !== undefined ||
    requirement.removalReason !== undefined ||
    requirement.terminalReason !== undefined ||
    requirement.minTerminalAge !== undefined ||
    requirement.minTerminalDuration !== undefined;
  if (!hasProjectileRequirement) {
    return true;
  }
  return (
    effect.kind === "projectile" &&
    (requirement.minPriority === undefined || effect.priority >= requirement.minPriority) &&
    (requirement.minHitsRemaining === undefined || effect.hitsRemaining >= requirement.minHitsRemaining) &&
    (requirement.maxHitsRemaining === undefined || effect.hitsRemaining <= requirement.maxHitsRemaining) &&
    (requirement.hasHit === undefined || effect.hasHit === requirement.hasHit) &&
    (requirement.removalReason === undefined || effect.removalReason === requirement.removalReason) &&
    (requirement.terminalReason === undefined || effect.terminalReason === requirement.terminalReason) &&
    (requirement.minTerminalAge === undefined || (effect.terminalAge ?? -Infinity) >= requirement.minTerminalAge) &&
    (requirement.minTerminalDuration === undefined || (effect.terminalDuration ?? -Infinity) >= requirement.minTerminalDuration)
  );
}

function matchesExplodPayloadRequirement(
  effect: RuntimeTraceEffectSummary,
  requirement: RuntimeTraceEffectPayloadRequirement,
): boolean {
  const hasExplodRequirement =
    requirement.removeOnGetHit !== undefined ||
    requirement.minBindRemaining !== undefined ||
    requirement.maxBindRemaining !== undefined;
  if (!hasExplodRequirement) {
    return true;
  }
  return (
    effect.kind === "explod" &&
    (requirement.removeOnGetHit === undefined || effect.removeOnGetHit === requirement.removeOnGetHit) &&
    (requirement.minBindRemaining === undefined || (effect.bindRemaining ?? -Infinity) >= requirement.minBindRemaining) &&
    (requirement.maxBindRemaining === undefined || (effect.bindRemaining ?? Infinity) <= requirement.maxBindRemaining)
  );
}

function sameTraceNumber(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.0001;
}

function describeEffectPayloadRequirement(requirement: RuntimeTraceEffectPayloadRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchPauseOccurrenceKey(frame: Omit<RuntimeTraceFrame, "input" | "events"> | RuntimeTraceFrame): string {
  return `${frame.frameIndex}:${frame.tick}`;
}

function matchPauseEvidenceKey(pause: RuntimeMatchPauseSnapshot): string {
  return `${pause.type}:${pause.actorId}:${pause.sourceStateNo ?? "*"}:${pause.darken ? "darken" : "normal"}`;
}

function matchPauseGateEvidenceKey(pause: RuntimeTraceGateMatchPauseEvidence): string {
  return `${pause.type}:${pause.actorId}:${pause.sourceStateNo ?? "*"}:${pause.darken ? "darken" : "normal"}`;
}

function matchesMatchPauseRequirement(
  pause: RuntimeTraceGateMatchPauseEvidence,
  requirement: RuntimeTraceMatchPauseRequirement,
): boolean {
  return (
    (requirement.type === undefined || pause.type === requirement.type) &&
    (requirement.actorId === undefined || pause.actorId === requirement.actorId) &&
    (requirement.sourceStateNo === undefined || pause.sourceStateNo === requirement.sourceStateNo) &&
    (requirement.darken === undefined || pause.darken === requirement.darken) &&
    (requirement.minFrames === undefined || pause.frames >= requirement.minFrames) &&
    (requirement.minRemaining === undefined || pause.maxRemaining >= requirement.minRemaining) &&
    (requirement.minMoveTime === undefined || pause.maxMoveTime >= requirement.minMoveTime)
  );
}

function describeMatchPauseRequirement(requirement: RuntimeTraceMatchPauseRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

const TRACE_ACTOR_FREEZE_FIELDS = [
  "stateNo",
  "animNo",
  "animTime",
  "frameIndex",
  "pos",
  "vel",
  "ctrl",
  "stateType",
  "moveType",
  "physics",
] as const;

function traceActorChangedFields(previous: RuntimeTraceActor, current: RuntimeTraceActor): string[] {
  const fields: string[] = [];
  if (current.stateNo !== previous.stateNo) {
    fields.push("stateNo");
  }
  if (current.animNo !== previous.animNo) {
    fields.push("animNo");
  }
  if (current.animTime !== previous.animTime) {
    fields.push("animTime");
  }
  if (current.frameIndex !== previous.frameIndex) {
    fields.push("frameIndex");
  }
  if (current.pos.x !== previous.pos.x || current.pos.y !== previous.pos.y) {
    fields.push("pos");
  }
  if (current.vel.x !== previous.vel.x || current.vel.y !== previous.vel.y) {
    fields.push("vel");
  }
  if (current.ctrl !== previous.ctrl) {
    fields.push("ctrl");
  }
  if (current.stateType !== previous.stateType) {
    fields.push("stateType");
  }
  if (current.moveType !== previous.moveType) {
    fields.push("moveType");
  }
  if (current.physics !== previous.physics) {
    fields.push("physics");
  }
  return fields;
}

function collectHitPauseMotionEvidence(
  frame: Omit<RuntimeTraceFrame, "input" | "events"> | RuntimeTraceFrame,
  previousFrame: Omit<RuntimeTraceFrame, "input" | "events"> | RuntimeTraceFrame,
  matchPauseFreezes: Map<string, RuntimeTraceGateMatchPauseFreezeEvidence>,
  matchPauseAdvances: Map<string, RuntimeTraceGateMatchPauseAdvanceEvidence>,
): void {
  const currentFightersInHitPause = frame.actors.filter((actor) => actor.hitPause > 0);
  if (currentFightersInHitPause.length === 0) {
    return;
  }
  const maxPreviousHitPause = Math.max(0, ...previousFrame.actors.map((actor) => actor.hitPause));
  const currentTraceActors = [...frame.actors, ...frame.effects];
  const previousTraceActors = [...previousFrame.actors, ...previousFrame.effects];
  for (const actor of currentTraceActors) {
    const previousActor = previousTraceActors.find((candidate) => candidate.id === actor.id);
    if (!previousActor) {
      continue;
    }
    const changedFields = traceActorChangedFields(previousActor, actor);
    if (changedFields.length > 0) {
      const key = matchPauseAdvanceEvidenceKey("HitPause", actor.id);
      const existing = matchPauseAdvances.get(key);
      matchPauseAdvances.set(
        key,
        existing
          ? {
              ...existing,
              firstTick: Math.min(existing.firstTick, frame.tick),
              lastTick: Math.max(existing.lastTick, frame.tick),
              advancedFrames: existing.advancedFrames + 1,
              maxPreviousMoveTime: Math.max(existing.maxPreviousMoveTime, maxPreviousHitPause),
              changedFields: sortStrings([...new Set([...existing.changedFields, ...changedFields])]),
            }
          : {
              type: "HitPause",
              actorId: actor.id,
              actorKind: actor.actorKind,
              ownerId: actor.ownerId,
              firstTick: frame.tick,
              lastTick: frame.tick,
              advancedFrames: 1,
              maxPreviousMoveTime: maxPreviousHitPause,
              changedFields,
            },
      );
      continue;
    }
    const key = matchPauseFreezeEvidenceKey("HitPause", actor.id);
    const existing = matchPauseFreezes.get(key);
    matchPauseFreezes.set(
      key,
      existing
        ? {
            ...existing,
            firstTick: Math.min(existing.firstTick, frame.tick),
            lastTick: Math.max(existing.lastTick, frame.tick),
            frozenFrames: existing.frozenFrames + 1,
          }
        : {
            type: "HitPause",
            actorId: actor.id,
            actorKind: actor.actorKind,
            ownerId: actor.ownerId,
            firstTick: frame.tick,
            lastTick: frame.tick,
            frozenFrames: 1,
            comparedFields: [...TRACE_ACTOR_FREEZE_FIELDS],
          },
    );
  }
}

function matchPauseFreezeEvidenceKey(type: RuntimeTracePauseEvidenceType, actorId: string): string {
  return `${type}:${actorId}`;
}

function matchesMatchPauseFreezeRequirement(
  freeze: RuntimeTraceGateMatchPauseFreezeEvidence,
  requirement: RuntimeTraceMatchPauseFreezeRequirement,
): boolean {
  return (
    (requirement.type === undefined || freeze.type === requirement.type) &&
    (requirement.actorId === undefined || freeze.actorId === requirement.actorId) &&
    (requirement.actorKind === undefined || freeze.actorKind === requirement.actorKind) &&
    (requirement.ownerId === undefined || freeze.ownerId === requirement.ownerId) &&
    (requirement.minFrozenFrames === undefined || freeze.frozenFrames >= requirement.minFrozenFrames)
  );
}

function describeMatchPauseFreezeRequirement(requirement: RuntimeTraceMatchPauseFreezeRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchPauseAdvanceEvidenceKey(type: RuntimeTracePauseEvidenceType, actorId: string): string {
  return `${type}:${actorId}`;
}

function matchesMatchPauseAdvanceRequirement(
  advance: RuntimeTraceGateMatchPauseAdvanceEvidence,
  requirement: RuntimeTraceMatchPauseAdvanceRequirement,
): boolean {
  return (
    (requirement.type === undefined || advance.type === requirement.type) &&
    (requirement.actorId === undefined || advance.actorId === requirement.actorId) &&
    (requirement.actorKind === undefined || advance.actorKind === requirement.actorKind) &&
    (requirement.ownerId === undefined || advance.ownerId === requirement.ownerId) &&
    (requirement.minAdvancedFrames === undefined || advance.advancedFrames >= requirement.minAdvancedFrames) &&
    (requirement.minPreviousMoveTime === undefined || advance.maxPreviousMoveTime >= requirement.minPreviousMoveTime)
  );
}

function describeMatchPauseAdvanceRequirement(requirement: RuntimeTraceMatchPauseAdvanceRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeSoundEventEvidence(
  traceTick: number,
  actor: RuntimeTraceActor,
  event: NonNullable<RuntimeTraceActor["soundEvents"]>[number],
): RuntimeTraceGateSoundEventEvidence {
  return {
    actorId: actor.id,
    label: actor.label,
    source: actor.source,
    actorKind: actor.actorKind,
    type: event.type,
    group: event.group,
    index: event.index,
    channel: event.channel,
    lowPriority: event.lowPriority,
    raw: event.raw,
    soundPrefix: event.soundPrefix,
    stateNo: event.stateNo,
    eventTick: event.tick,
    runtimeTick: event.runtimeTick,
    contactId: event.contactId,
    contactTick: event.contactTick,
    contactKind: event.contactKind,
    firstTraceTick: traceTick,
    lastTraceTick: traceTick,
    count: 1,
  };
}

function soundEventEvidenceKey(event: RuntimeTraceGateSoundEventEvidence): string {
  return [
    event.actorId,
    event.type,
    event.group ?? "",
    event.index ?? "",
    event.channel ?? "",
    event.lowPriority ? "low" : "",
    event.raw ?? "",
    event.soundPrefix ?? "",
    event.stateNo,
    event.eventTick,
    event.runtimeTick ?? "",
    event.contactId ?? "",
    event.contactTick ?? "",
    event.contactKind ?? "",
  ].join(":");
}

function matchesSoundEventRequirement(
  event: RuntimeTraceGateSoundEventEvidence,
  requirement: RuntimeTraceSoundEventRequirement,
): boolean {
  return (
    (requirement.actorId === undefined || event.actorId === requirement.actorId) &&
    (requirement.source === undefined || event.source === requirement.source) &&
    (requirement.actorKind === undefined || event.actorKind === requirement.actorKind) &&
    (requirement.type === undefined || event.type === requirement.type) &&
    (requirement.group === undefined || event.group === requirement.group) &&
    (requirement.index === undefined || event.index === requirement.index) &&
    (requirement.channel === undefined || event.channel === requirement.channel) &&
    (requirement.lowPriority === undefined ||
      (requirement.lowPriority ? event.lowPriority === true : event.lowPriority !== true)) &&
    (requirement.raw === undefined || event.raw === requirement.raw) &&
    (requirement.soundPrefix === undefined || event.soundPrefix === requirement.soundPrefix) &&
    (requirement.stateNo === undefined || event.stateNo === requirement.stateNo) &&
    (requirement.contactId === undefined || event.contactId === requirement.contactId) &&
    (requirement.contactTick === undefined || event.contactTick === requirement.contactTick) &&
    (requirement.contactKind === undefined || event.contactKind === requirement.contactKind) &&
    (requirement.requireContactId !== true || event.contactId !== undefined)
  );
}

function describeSoundEventRequirement(requirement: RuntimeTraceSoundEventRequirement): string {
  return Object.entries(requirement)
    .filter(([key, value]) => value !== undefined && key !== "minCount" && key !== "requireContactId")
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeHitEffectEventEvidence(
  traceTick: number,
  actor: RuntimeTraceActor,
  event: NonNullable<RuntimeTraceActor["hitEffectEvents"]>[number],
): RuntimeTraceGateHitEffectEventEvidence {
  const assetFrameSummary = summarizeHitEffectAssetFrames(event.assetFrames);
  const fightFxPrefix = event.fightFxPrefix ?? event.assetFrame?.fightFxPrefix;
  return {
    actorId: actor.id,
    label: actor.label,
    source: actor.source,
    actorKind: actor.actorKind,
    type: event.type,
    kind: event.kind,
    sparkNo: event.sparkNo,
    raw: event.raw,
    rawPrefix: event.rawPrefix,
    offset: event.offset ? { ...event.offset } : undefined,
    assetSource: event.assetFrame?.source,
    ...(fightFxPrefix ? { fightFxPrefix } : {}),
    assetActionId: event.assetFrame?.actionId,
    assetFrameIndex: event.assetFrame?.frameIndex,
    assetFrameOffsetX: event.assetFrame?.offsetX,
    assetFrameOffsetY: event.assetFrame?.offsetY,
    assetFrameDuration: event.assetFrame?.duration,
    assetSpriteGroup: event.assetFrame?.spriteGroup,
    assetSpriteIndex: event.assetFrame?.spriteIndex,
    assetFrameCount: assetFrameSummary?.count,
    assetTotalDuration: assetFrameSummary?.totalDuration,
    assetFrameIndices: assetFrameSummary?.indices,
    stateNo: event.stateNo,
    eventTick: event.tick,
    runtimeTick: event.runtimeTick,
    contactId: event.contactId,
    contactTick: event.contactTick,
    contactKind: event.contactKind,
    firstTraceTick: traceTick,
    lastTraceTick: traceTick,
    count: 1,
  };
}

function hitEffectEventEvidenceKey(event: RuntimeTraceGateHitEffectEventEvidence): string {
  return [
    event.actorId,
    event.type,
    event.kind,
    event.sparkNo ?? "",
    event.raw ?? "",
    event.rawPrefix ?? "",
    event.offset?.x ?? "",
    event.offset?.y ?? "",
    event.assetSource ?? "",
    event.fightFxPrefix ?? "",
    event.assetActionId ?? "",
    event.assetFrameIndex ?? "",
    event.assetFrameOffsetX ?? "",
    event.assetFrameOffsetY ?? "",
    event.assetFrameDuration ?? "",
    event.assetSpriteGroup ?? "",
    event.assetSpriteIndex ?? "",
    event.assetFrameCount ?? "",
    event.assetTotalDuration ?? "",
    event.assetFrameIndices?.join(",") ?? "",
    event.stateNo,
    event.eventTick,
    event.runtimeTick ?? "",
    event.contactId ?? "",
    event.contactTick ?? "",
    event.contactKind ?? "",
  ].join(":");
}

function matchesHitEffectEventRequirement(
  event: RuntimeTraceGateHitEffectEventEvidence,
  requirement: RuntimeTraceHitEffectEventRequirement,
): boolean {
  return (
    (requirement.actorId === undefined || event.actorId === requirement.actorId) &&
    (requirement.source === undefined || event.source === requirement.source) &&
    (requirement.actorKind === undefined || event.actorKind === requirement.actorKind) &&
    (requirement.kind === undefined || event.kind === requirement.kind) &&
    (requirement.sparkNo === undefined || event.sparkNo === requirement.sparkNo) &&
    (requirement.raw === undefined || event.raw === requirement.raw) &&
    (requirement.rawPrefix === undefined || event.rawPrefix === requirement.rawPrefix) &&
    (requirement.offsetX === undefined || sameTraceNumber(event.offset?.x ?? NaN, requirement.offsetX)) &&
    (requirement.offsetY === undefined || sameTraceNumber(event.offset?.y ?? NaN, requirement.offsetY)) &&
    (requirement.assetSource === undefined || event.assetSource === requirement.assetSource) &&
    (requirement.fightFxPrefix === undefined || event.fightFxPrefix === requirement.fightFxPrefix) &&
    (requirement.assetActionId === undefined || event.assetActionId === requirement.assetActionId) &&
    (requirement.assetFrameIndex === undefined || event.assetFrameIndex === requirement.assetFrameIndex) &&
    (requirement.assetFrameOffsetX === undefined || sameTraceNumber(event.assetFrameOffsetX ?? NaN, requirement.assetFrameOffsetX)) &&
    (requirement.assetFrameOffsetY === undefined || sameTraceNumber(event.assetFrameOffsetY ?? NaN, requirement.assetFrameOffsetY)) &&
    (requirement.assetFrameDuration === undefined || sameTraceNumber(event.assetFrameDuration ?? NaN, requirement.assetFrameDuration)) &&
    (requirement.assetSpriteGroup === undefined || event.assetSpriteGroup === requirement.assetSpriteGroup) &&
    (requirement.assetSpriteIndex === undefined || event.assetSpriteIndex === requirement.assetSpriteIndex) &&
    (requirement.minAssetFrameCount === undefined || (event.assetFrameCount ?? 0) >= requirement.minAssetFrameCount) &&
    (requirement.minAssetTotalDuration === undefined || (event.assetTotalDuration ?? 0) >= requirement.minAssetTotalDuration) &&
    (requirement.requiredAssetFrameIndices === undefined ||
      requirement.requiredAssetFrameIndices.every((frameIndex) => event.assetFrameIndices?.includes(frameIndex))) &&
    (requirement.stateNo === undefined || event.stateNo === requirement.stateNo) &&
    (requirement.contactId === undefined || event.contactId === requirement.contactId) &&
    (requirement.contactTick === undefined || event.contactTick === requirement.contactTick) &&
    (requirement.contactKind === undefined || event.contactKind === requirement.contactKind) &&
    (requirement.requireContactId !== true || event.contactId !== undefined)
  );
}

function describeHitEffectEventRequirement(requirement: RuntimeTraceHitEffectEventRequirement): string {
  return Object.entries(requirement)
    .filter(([key, value]) => value !== undefined && key !== "minCount" && key !== "requireContactId")
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeContactEffectPackageEvidence(
  soundEvents: RuntimeTraceGateSoundEventEvidence[],
  hitEffectEvents: RuntimeTraceGateHitEffectEventEvidence[],
): RuntimeTraceGateContactEffectPackageEvidence[] {
  const packages: RuntimeTraceGateContactEffectPackageEvidence[] = [];
  for (const sound of soundEvents) {
    if (!sound.contactId || sound.contactTick === undefined || !sound.contactKind) {
      continue;
    }
    for (const hitEffect of hitEffectEvents) {
      if (
        hitEffect.actorId !== sound.actorId ||
        hitEffect.contactId !== sound.contactId ||
        hitEffect.contactTick !== sound.contactTick ||
        hitEffect.contactKind !== sound.contactKind
      ) {
        continue;
      }
      packages.push({
        actorId: sound.actorId,
        label: sound.label,
        source: sound.source,
        actorKind: sound.actorKind,
        contactId: sound.contactId,
        contactTick: sound.contactTick,
        contactKind: sound.contactKind,
        sound,
        hitEffect,
        firstTraceTick: Math.min(sound.firstTraceTick, hitEffect.firstTraceTick),
        lastTraceTick: Math.max(sound.lastTraceTick, hitEffect.lastTraceTick),
        count: Math.min(sound.count, hitEffect.count),
      });
    }
  }
  return packages.sort((left, right) => contactEffectPackageEvidenceKey(left).localeCompare(contactEffectPackageEvidenceKey(right)));
}

function contactEffectPackageEvidenceKey(event: RuntimeTraceGateContactEffectPackageEvidence): string {
  return [
    event.actorId,
    event.contactId,
    event.contactTick,
    event.contactKind,
    soundEventEvidenceKey(event.sound),
    hitEffectEventEvidenceKey(event.hitEffect),
  ].join(":");
}

function matchesContactEffectPackageRequirement(
  event: RuntimeTraceGateContactEffectPackageEvidence,
  requirement: RuntimeTraceContactEffectPackageRequirement,
): boolean {
  return (
    (requirement.actorId === undefined || event.actorId === requirement.actorId) &&
    (requirement.source === undefined || event.source === requirement.source) &&
    (requirement.actorKind === undefined || event.actorKind === requirement.actorKind) &&
    (requirement.contactId === undefined || event.contactId === requirement.contactId) &&
    (requirement.contactTick === undefined || event.contactTick === requirement.contactTick) &&
    (requirement.contactKind === undefined || event.contactKind === requirement.contactKind) &&
    (requirement.sound === undefined || matchesSoundEventRequirement(event.sound, requirement.sound)) &&
    (requirement.hitEffect === undefined || matchesHitEffectEventRequirement(event.hitEffect, requirement.hitEffect))
  );
}

function describeContactEffectPackageRequirement(requirement: RuntimeTraceContactEffectPackageRequirement): string {
  const parts = Object.entries(requirement)
    .filter(([key, value]) => value !== undefined && key !== "minCount" && key !== "sound" && key !== "hitEffect")
    .map(([key, value]) => `${key}=${String(value)}`);
  if (requirement.sound) {
    parts.push(`sound={${describeSoundEventRequirement(requirement.sound)}}`);
  }
  if (requirement.hitEffect) {
    parts.push(`hitEffect={${describeHitEffectEventRequirement(requirement.hitEffect)}}`);
  }
  return parts.join(", ");
}

function summarizeHitEffectAssetFrames(
  frames: RuntimeTraceHitEffectEvent["assetFrames"] | undefined,
): { count: number; totalDuration: number; indices: number[] } | undefined {
  if (!frames?.length) {
    return undefined;
  }
  return {
    count: frames.length,
    totalDuration: frames.reduce((total, frame) => total + Math.max(0, Math.round(frame.duration)), 0),
    indices: frames.map((frame) => frame.frameIndex),
  };
}

function summarizeEnvShakeEventEvidence(
  traceTick: number,
  actor: RuntimeTraceActor,
  event: NonNullable<RuntimeTraceActor["envShakeEvents"]>[number],
): RuntimeTraceGateEnvShakeEventEvidence {
  return {
    actorId: actor.id,
    label: actor.label,
    source: actor.source,
    actorKind: actor.actorKind,
    time: event.time,
    freq: event.freq,
    ampl: event.ampl,
    phase: event.phase,
    stateNo: event.stateNo,
    eventTick: event.tick,
    runtimeTick: event.runtimeTick,
    firstTraceTick: traceTick,
    lastTraceTick: traceTick,
    count: 1,
  };
}

function envShakeEventEvidenceKey(event: RuntimeTraceGateEnvShakeEventEvidence): string {
  return [
    event.actorId,
    event.time,
    event.freq,
    event.ampl,
    event.phase,
    event.stateNo,
    event.eventTick,
    event.runtimeTick,
  ].join(":");
}

function matchesEnvShakeEventRequirement(
  event: RuntimeTraceGateEnvShakeEventEvidence,
  requirement: RuntimeTraceEnvShakeEventRequirement,
): boolean {
  return (
    (requirement.actorId === undefined || event.actorId === requirement.actorId) &&
    (requirement.source === undefined || event.source === requirement.source) &&
    (requirement.actorKind === undefined || event.actorKind === requirement.actorKind) &&
    (requirement.time === undefined || event.time === requirement.time) &&
    (requirement.freq === undefined || event.freq === requirement.freq) &&
    (requirement.ampl === undefined || event.ampl === requirement.ampl) &&
    (requirement.phase === undefined || event.phase === requirement.phase) &&
    (requirement.stateNo === undefined || event.stateNo === requirement.stateNo)
  );
}

function describeEnvShakeEventRequirement(requirement: RuntimeTraceEnvShakeEventRequirement): string {
  return Object.entries(requirement)
    .filter(([key, value]) => value !== undefined && key !== "minCount")
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeFinalActorEvidence(actor: RuntimeTraceActor): RuntimeTraceGateFinalActorEvidence {
  return {
    id: actor.id,
    label: actor.label,
    actorKind: actor.actorKind,
    source: actor.source,
    customOwnerId: actor.customOwnerId,
    stateNo: actor.stateNo,
    animNo: actor.animNo,
    life: actor.life,
    power: actor.power,
    ctrl: actor.ctrl,
    stateType: actor.stateType,
    moveType: actor.moveType,
    physics: actor.physics,
    guarding: actor.guarding,
    hitFall: actor.hitFall ? cloneTraceHitFall(actor.hitFall) : undefined,
    targetCount: actor.targetCount,
  };
}

function summarizeTargetLinkEvidence(tick: number, link: RuntimeTraceWorldTargetLink): RuntimeTraceGateTargetLinkEvidence {
  const numericRemaining = typeof link.binding?.remaining === "number" ? link.binding.remaining : undefined;
  return {
    ownerId: link.ownerId,
    actorId: link.actorId,
    targetId: link.targetId,
    hasBinding: Boolean(link.binding),
    firstTick: tick,
    lastTick: tick,
    frames: 1,
    minAge: link.age,
    maxAge: link.age,
    minBindingRemaining: numericRemaining,
    maxBindingRemaining: numericRemaining,
    bindingInfinite: link.binding?.remaining === "infinite" ? true : undefined,
    bindingOffset: link.binding ? { ...link.binding.offset } : undefined,
  };
}

function mergeTargetLinkEvidence(
  current: RuntimeTraceGateTargetLinkEvidence,
  next: RuntimeTraceGateTargetLinkEvidence,
): RuntimeTraceGateTargetLinkEvidence {
  return {
    ...current,
    firstTick: Math.min(current.firstTick, next.firstTick),
    lastTick: Math.max(current.lastTick, next.lastTick),
    frames: current.frames + next.frames,
    minAge: Math.min(current.minAge, next.minAge),
    maxAge: Math.max(current.maxAge, next.maxAge),
    minBindingRemaining: minOptionalTraceNumber(current.minBindingRemaining, next.minBindingRemaining),
    maxBindingRemaining: maxOptionalTraceNumber(current.maxBindingRemaining, next.maxBindingRemaining),
    bindingInfinite: current.bindingInfinite || next.bindingInfinite || undefined,
  };
}

function minOptionalTraceNumber(left: number | undefined, right: number | undefined): number | undefined {
  if (left === undefined) {
    return right;
  }
  if (right === undefined) {
    return left;
  }
  return Math.min(left, right);
}

function maxOptionalTraceNumber(left: number | undefined, right: number | undefined): number | undefined {
  if (left === undefined) {
    return right;
  }
  if (right === undefined) {
    return left;
  }
  return Math.max(left, right);
}

function targetLinkEvidenceKey(link: RuntimeTraceGateTargetLinkEvidence): string {
  return [
    link.ownerId,
    link.actorId,
    link.targetId ?? "*",
    link.hasBinding ? "binding" : "memory",
    link.bindingOffset ? `${link.bindingOffset.x},${link.bindingOffset.y}` : "none",
  ].join(":");
}

function matchesTargetLinkRequirement(
  link: RuntimeTraceGateTargetLinkEvidence,
  requirement: RuntimeTraceTargetLinkRequirement,
): boolean {
  return (
    (requirement.ownerId === undefined || link.ownerId === requirement.ownerId) &&
    (requirement.actorId === undefined || link.actorId === requirement.actorId) &&
    (requirement.targetId === undefined || link.targetId === requirement.targetId) &&
    (requirement.hasBinding === undefined || link.hasBinding === requirement.hasBinding) &&
    (requirement.minFrames === undefined || link.frames >= requirement.minFrames) &&
    (requirement.minAge === undefined || link.maxAge >= requirement.minAge) &&
    (requirement.maxAge === undefined || link.minAge <= requirement.maxAge) &&
    (requirement.minBindingRemaining === undefined ||
      link.bindingInfinite === true ||
      (link.maxBindingRemaining ?? -Infinity) >= requirement.minBindingRemaining) &&
    (requirement.maxBindingRemaining === undefined ||
      (link.minBindingRemaining ?? Infinity) <= requirement.maxBindingRemaining) &&
    (requirement.bindingOffsetX === undefined || sameTraceNumber(link.bindingOffset?.x ?? NaN, requirement.bindingOffsetX)) &&
    (requirement.bindingOffsetY === undefined || sameTraceNumber(link.bindingOffset?.y ?? NaN, requirement.bindingOffsetY))
  );
}

function describeTargetLinkRequirement(requirement: RuntimeTraceTargetLinkRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeRoundFrameEvidence(round: RoundSnapshot, tick: number): RuntimeTraceGateRoundFrameEvidence {
  return {
    state: round.state,
    winner: round.winner,
    message: round.message,
    minTimer: round.timer,
    maxTimer: round.timer,
    firstTick: tick,
    lastTick: tick,
    frames: 1,
  };
}

function mergeRoundFrameEvidence(
  current: RuntimeTraceGateRoundFrameEvidence,
  round: RoundSnapshot,
  tick: number,
): RuntimeTraceGateRoundFrameEvidence {
  return {
    ...current,
    minTimer: Math.min(current.minTimer, round.timer),
    maxTimer: Math.max(current.maxTimer, round.timer),
    firstTick: Math.min(current.firstTick, tick),
    lastTick: Math.max(current.lastTick, tick),
    frames: current.frames + 1,
  };
}

function roundFrameEvidenceKey(round: RoundSnapshot): string {
  return [round.state, round.winner ?? "", round.message].join(":");
}

function roundFrameGateEvidenceKey(round: RuntimeTraceGateRoundFrameEvidence): string {
  return [round.state, round.winner ?? "", round.message].join(":");
}

function matchesRoundFrameRequirement(
  round: RuntimeTraceGateRoundFrameEvidence,
  requirement: RuntimeTraceRoundFrameRequirement,
): boolean {
  return (
    (requirement.state === undefined || round.state === requirement.state) &&
    (requirement.winner === undefined || round.winner === requirement.winner) &&
    (requirement.message === undefined || round.message === requirement.message) &&
    (requirement.minFrames === undefined || round.frames >= requirement.minFrames) &&
    (requirement.observedTimerAtLeast === undefined || round.maxTimer >= requirement.observedTimerAtLeast) &&
    (requirement.observedTimerAtMost === undefined || round.minTimer <= requirement.observedTimerAtMost)
  );
}

function describeRoundFrameRequirement(requirement: RuntimeTraceRoundFrameRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeStageFrameEvidence(stage: RuntimeTraceStageSummary, tick: number): RuntimeTraceGateStageFrameEvidence {
  return {
    stageId: stage.id,
    displayName: stage.displayName,
    bounds: stage.bounds ? { ...stage.bounds } : undefined,
    minCamera: { x: stage.camera.x, y: stage.camera.y, zoom: stage.camera.zoom },
    maxCamera: { x: stage.camera.x, y: stage.camera.y, zoom: stage.camera.zoom },
    envColor: summarizeStageEnvColor(stage),
    firstTick: tick,
    lastTick: tick,
    frames: 1,
  };
}

function mergeStageFrameEvidence(
  current: RuntimeTraceGateStageFrameEvidence,
  stage: RuntimeTraceStageSummary,
  tick: number,
): RuntimeTraceGateStageFrameEvidence {
  return {
    ...current,
    firstTick: Math.min(current.firstTick, tick),
    lastTick: Math.max(current.lastTick, tick),
    frames: current.frames + 1,
    minCamera: {
      x: Math.min(current.minCamera.x, stage.camera.x),
      y: Math.min(current.minCamera.y, stage.camera.y),
      zoom: Math.min(current.minCamera.zoom, stage.camera.zoom),
    },
    maxCamera: {
      x: Math.max(current.maxCamera.x, stage.camera.x),
      y: Math.max(current.maxCamera.y, stage.camera.y),
      zoom: Math.max(current.maxCamera.zoom, stage.camera.zoom),
    },
    envColor: mergeStageEnvColor(current.envColor, stage.envColor),
  };
}

function summarizeStageEnvColor(stage: RuntimeTraceStageSummary): RuntimeTraceGateStageFrameEvidence["envColor"] {
  if (!stage.envColor) {
    return undefined;
  }
  return {
    color: [stage.envColor.color[0], stage.envColor.color[1], stage.envColor.color[2]],
    under: stage.envColor.under,
    minOpacity: stage.envColor.opacity,
    maxOpacity: stage.envColor.opacity,
  };
}

function mergeStageEnvColor(
  current: RuntimeTraceGateStageFrameEvidence["envColor"],
  next: RuntimeTraceStageSummary["envColor"],
): RuntimeTraceGateStageFrameEvidence["envColor"] {
  if (!next) {
    return current;
  }
  if (!current) {
    return {
      color: [next.color[0], next.color[1], next.color[2]],
      under: next.under,
      minOpacity: next.opacity,
      maxOpacity: next.opacity,
    };
  }
  return {
    color: [current.color[0], current.color[1], current.color[2]],
    under: current.under,
    minOpacity: Math.min(current.minOpacity, next.opacity),
    maxOpacity: Math.max(current.maxOpacity, next.opacity),
  };
}

function stageFrameEvidenceKey(stage: RuntimeTraceStageSummary): string {
  return [
    stage.id ?? "none",
    stage.bounds?.left ?? "*",
    stage.bounds?.right ?? "*",
    stage.camera.zoom,
    stage.envColor ? `${stage.envColor.color.join(",")}:${stage.envColor.under ? 1 : 0}` : "ec*",
  ].join(":");
}

function stageFrameGateEvidenceKey(stage: RuntimeTraceGateStageFrameEvidence): string {
  return [
    stage.stageId ?? "none",
    stage.bounds?.left ?? "*",
    stage.bounds?.right ?? "*",
    stage.minCamera.zoom,
    stage.maxCamera.zoom,
    stage.envColor ? `${stage.envColor.color.join(",")}:${stage.envColor.under ? 1 : 0}:${stage.envColor.minOpacity}:${stage.envColor.maxOpacity}` : "ec*",
  ].join(":");
}

function matchesStageFrameRequirement(
  stage: RuntimeTraceGateStageFrameEvidence,
  requirement: RuntimeTraceStageFrameRequirement,
): boolean {
  return (
    (requirement.stageId === undefined || stage.stageId === requirement.stageId) &&
    (requirement.minFrames === undefined || stage.frames >= requirement.minFrames) &&
    (requirement.observedCameraXAtLeast === undefined || stage.maxCamera.x >= requirement.observedCameraXAtLeast) &&
    (requirement.observedCameraXAtMost === undefined || stage.minCamera.x <= requirement.observedCameraXAtMost) &&
    (requirement.observedCameraYAtLeast === undefined || stage.maxCamera.y >= requirement.observedCameraYAtLeast) &&
    (requirement.observedCameraYAtMost === undefined || stage.minCamera.y <= requirement.observedCameraYAtMost) &&
    (requirement.observedZoomAtLeast === undefined || stage.maxCamera.zoom >= requirement.observedZoomAtLeast) &&
    (requirement.observedZoomAtMost === undefined || stage.minCamera.zoom <= requirement.observedZoomAtMost) &&
    (requirement.envColorR === undefined || stage.envColor?.color[0] === requirement.envColorR) &&
    (requirement.envColorG === undefined || stage.envColor?.color[1] === requirement.envColorG) &&
    (requirement.envColorB === undefined || stage.envColor?.color[2] === requirement.envColorB) &&
    (requirement.envColorUnder === undefined || stage.envColor?.under === requirement.envColorUnder) &&
    (requirement.observedEnvColorOpacityAtLeast === undefined ||
      (stage.envColor?.maxOpacity ?? Number.NEGATIVE_INFINITY) >= requirement.observedEnvColorOpacityAtLeast) &&
    (requirement.observedEnvColorOpacityAtMost === undefined ||
      (stage.envColor?.minOpacity ?? Number.POSITIVE_INFINITY) <= requirement.observedEnvColorOpacityAtMost) &&
    (requirement.boundLeft === undefined || sameTraceNumber(stage.bounds?.left ?? NaN, requirement.boundLeft)) &&
    (requirement.boundRight === undefined || sameTraceNumber(stage.bounds?.right ?? NaN, requirement.boundRight))
  );
}

function describeStageFrameRequirement(requirement: RuntimeTraceStageFrameRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function actorFrameEvidenceKey(actor: RuntimeTraceActor): string {
  return [
    actor.id,
    actor.source ?? "none",
    actor.actorKind,
    actor.ownerId,
    actor.customOwnerId ?? "none",
    actor.stateNo,
    actor.animNo,
    actor.facing,
    actor.stateType,
    actor.moveType,
    actor.physics,
    actor.clsn1Count,
    actor.clsn2Count,
    actor.bodyWidth?.front === undefined ? "wf*" : `wf${actor.bodyWidth.front}`,
    actor.bodyWidth?.back === undefined ? "wb*" : `wb${actor.bodyWidth.back}`,
    actor.playerPush === undefined ? "push*" : `push${actor.playerPush ? 1 : 0}`,
    actor.spritePriority === undefined ? "sp*" : `sp${actor.spritePriority}`,
    actor.renderOpacity === undefined ? "op*" : `op${actor.renderOpacity}`,
    actor.renderAngle === undefined ? "ang*" : `ang${actor.renderAngle}`,
    actor.paletteFx === undefined
      ? "pf*"
      : `pf${actor.paletteFx.time}:${actor.paletteFx.add.join(",")}:${actor.paletteFx.mul.join(",")}:${actor.paletteFx.color}:${actor.paletteFx.invert ? 1 : 0}`,
    actor.paletteRemap === undefined ? "pr*" : `pr${actor.paletteRemap.source.join(",")}:${actor.paletteRemap.dest.join(",")}`,
    actor.afterImage === undefined
      ? "ai*"
      : `ai${actor.afterImage.time}:${actor.afterImage.length}:${actor.afterImage.timeGap}:${actor.afterImage.frameGap}:${actor.afterImage.sampleCount}:${actor.afterImage.opacity}`,
    actor.posFreeze?.x === undefined ? "pfx*" : `pfx${actor.posFreeze.x ? 1 : 0}`,
    actor.posFreeze?.y === undefined ? "pfy*" : `pfy${actor.posFreeze.y ? 1 : 0}`,
    actor.screenBound?.bound === undefined ? "sb*" : `sb${actor.screenBound.bound ? 1 : 0}`,
    actor.screenBound?.moveCameraX === undefined ? "mcx*" : `mcx${actor.screenBound.moveCameraX ? 1 : 0}`,
    actor.screenBound?.moveCameraY === undefined ? "mcy*" : `mcy${actor.screenBound.moveCameraY ? 1 : 0}`,
  ].join(":");
}

function actorFrameGateEvidenceKey(actor: RuntimeTraceGateActorFrameEvidence): string {
  return [
    actor.actorId,
    actor.source ?? "none",
    actor.actorKind,
    actor.ownerId,
    actor.customOwnerId ?? "none",
    actor.animNo,
    actor.facing,
    actor.stateType,
    actor.moveType,
    actor.physics,
    actor.clsn1Count,
    actor.clsn2Count,
    `life${actor.minLife}:${actor.maxLife}`,
    `power${actor.minPower}:${actor.maxPower}`,
    actor.bodyWidthFront === undefined ? "wf*" : `wf${actor.bodyWidthFront}`,
    actor.bodyWidthBack === undefined ? "wb*" : `wb${actor.bodyWidthBack}`,
    actor.playerPush === undefined ? "push*" : `push${actor.playerPush ? 1 : 0}`,
    actor.spritePriority === undefined ? "sp*" : `sp${actor.spritePriority}`,
    `op${actor.minOpacity}:${actor.maxOpacity}`,
    `ang${actor.minAngle}:${actor.maxAngle}`,
    actor.paletteFxTime === undefined
      ? "pf*"
      : `pf${actor.paletteFxTime}:${actor.paletteFxAddR},${actor.paletteFxAddG},${actor.paletteFxAddB}:${actor.paletteFxMulR},${actor.paletteFxMulG},${actor.paletteFxMulB}:${actor.paletteFxColor}:${actor.paletteFxInvert ? 1 : 0}`,
    actor.paletteRemapSourceGroup === undefined
      ? "pr*"
      : `pr${actor.paletteRemapSourceGroup},${actor.paletteRemapSourceIndex}:${actor.paletteRemapDestGroup},${actor.paletteRemapDestIndex}`,
    actor.afterImageTime === undefined
      ? "ai*"
      : `ai${actor.afterImageTime}:${actor.afterImageLength}:${actor.afterImageTimeGap}:${actor.afterImageFrameGap}:${actor.afterImageSampleCount}:${actor.afterImageOpacity}`,
    actor.minHitFallRecoverTime === undefined ? "hfrt*" : `hfrt${actor.minHitFallRecoverTime}:${actor.maxHitFallRecoverTime}`,
    actor.minHitFallDownRecoverTime === undefined
      ? "hfdrt*"
      : `hfdrt${actor.minHitFallDownRecoverTime}:${actor.maxHitFallDownRecoverTime}`,
    actor.posFreezeX === undefined ? "pfx*" : `pfx${actor.posFreezeX ? 1 : 0}`,
    actor.posFreezeY === undefined ? "pfy*" : `pfy${actor.posFreezeY ? 1 : 0}`,
    actor.screenBound === undefined ? "sb*" : `sb${actor.screenBound ? 1 : 0}`,
    actor.moveCameraX === undefined ? "mcx*" : `mcx${actor.moveCameraX ? 1 : 0}`,
    actor.moveCameraY === undefined ? "mcy*" : `mcy${actor.moveCameraY ? 1 : 0}`,
  ].join(":");
}

function matchesActorFrameRequirement(
  actor: RuntimeTraceGateActorFrameEvidence,
  requirement: RuntimeTraceActorFrameRequirement,
): boolean {
  const hitFallRecoverTimeDrop =
    actor.firstHitFallRecoverTime === undefined || actor.lastHitFallRecoverTime === undefined
      ? undefined
      : actor.firstHitFallRecoverTime - actor.lastHitFallRecoverTime;
  const hitFallDownRecoverTimeDrop =
    actor.firstHitFallDownRecoverTime === undefined || actor.lastHitFallDownRecoverTime === undefined
      ? undefined
      : actor.firstHitFallDownRecoverTime - actor.lastHitFallDownRecoverTime;
  return (
    (requirement.actorId === undefined || actor.actorId === requirement.actorId) &&
    (requirement.source === undefined || actor.source === requirement.source) &&
    (requirement.actorKind === undefined || actor.actorKind === requirement.actorKind) &&
    (requirement.ownerId === undefined || actor.ownerId === requirement.ownerId) &&
    (requirement.customOwnerId === undefined || actor.customOwnerId === requirement.customOwnerId) &&
    (requirement.stateNo === undefined || actor.stateNo === requirement.stateNo) &&
    (requirement.animNo === undefined || actor.animNo === requirement.animNo) &&
    (requirement.facing === undefined || actor.facing === requirement.facing) &&
    (requirement.stateType === undefined || actor.stateType === requirement.stateType) &&
    (requirement.moveType === undefined || actor.moveType === requirement.moveType) &&
    (requirement.physics === undefined || actor.physics === requirement.physics) &&
    (requirement.clsn1Count === undefined || actor.clsn1Count === requirement.clsn1Count) &&
    (requirement.clsn2Count === undefined || actor.clsn2Count === requirement.clsn2Count) &&
    (requirement.minFrames === undefined || actor.frames >= requirement.minFrames) &&
    (requirement.observedLifeAtLeast === undefined || actor.maxLife >= requirement.observedLifeAtLeast) &&
    (requirement.observedLifeAtMost === undefined || actor.minLife <= requirement.observedLifeAtMost) &&
    (requirement.observedPowerAtLeast === undefined || actor.maxPower >= requirement.observedPowerAtLeast) &&
    (requirement.observedPowerAtMost === undefined || actor.minPower <= requirement.observedPowerAtMost) &&
    (requirement.observedPosXAtLeast === undefined || actor.maxPos.x >= requirement.observedPosXAtLeast) &&
    (requirement.observedPosXAtMost === undefined || actor.minPos.x <= requirement.observedPosXAtMost) &&
    (requirement.observedPosYAtLeast === undefined || actor.maxPos.y >= requirement.observedPosYAtLeast) &&
    (requirement.observedPosYAtMost === undefined || actor.minPos.y <= requirement.observedPosYAtMost) &&
    (requirement.observedVelXAtLeast === undefined || actor.maxVel.x >= requirement.observedVelXAtLeast) &&
    (requirement.observedVelXAtMost === undefined || actor.minVel.x <= requirement.observedVelXAtMost) &&
    (requirement.observedVelYAtLeast === undefined || actor.maxVel.y >= requirement.observedVelYAtLeast) &&
    (requirement.observedVelYAtMost === undefined || actor.minVel.y <= requirement.observedVelYAtMost) &&
    (requirement.observedScaleXAtLeast === undefined || actor.maxScale.x >= requirement.observedScaleXAtLeast) &&
    (requirement.observedScaleXAtMost === undefined || actor.minScale.x <= requirement.observedScaleXAtMost) &&
    (requirement.observedScaleYAtLeast === undefined || actor.maxScale.y >= requirement.observedScaleYAtLeast) &&
    (requirement.observedScaleYAtMost === undefined || actor.minScale.y <= requirement.observedScaleYAtMost) &&
    (requirement.observedOpacityAtLeast === undefined || actor.maxOpacity >= requirement.observedOpacityAtLeast) &&
    (requirement.observedOpacityAtMost === undefined || actor.minOpacity <= requirement.observedOpacityAtMost) &&
    (requirement.observedAngleAtLeast === undefined || actor.maxAngle >= requirement.observedAngleAtLeast) &&
    (requirement.observedAngleAtMost === undefined || actor.minAngle <= requirement.observedAngleAtMost) &&
    (requirement.observedHitFallRecoverTimeAtLeast === undefined ||
      (actor.maxHitFallRecoverTime ?? Number.NEGATIVE_INFINITY) >= requirement.observedHitFallRecoverTimeAtLeast) &&
    (requirement.observedHitFallRecoverTimeMinAtLeast === undefined ||
      (actor.minHitFallRecoverTime ?? Number.NEGATIVE_INFINITY) >= requirement.observedHitFallRecoverTimeMinAtLeast) &&
    (requirement.observedHitFallRecoverTimeAtMost === undefined ||
      (actor.minHitFallRecoverTime ?? Number.POSITIVE_INFINITY) <= requirement.observedHitFallRecoverTimeAtMost) &&
    (requirement.observedHitFallRecoverTimeDropAtLeast === undefined ||
      (hitFallRecoverTimeDrop ?? Number.NEGATIVE_INFINITY) >= requirement.observedHitFallRecoverTimeDropAtLeast) &&
    (requirement.observedHitFallDownRecoverTimeAtLeast === undefined ||
      (actor.maxHitFallDownRecoverTime ?? Number.NEGATIVE_INFINITY) >= requirement.observedHitFallDownRecoverTimeAtLeast) &&
    (requirement.observedHitFallDownRecoverTimeAtMost === undefined ||
      (actor.minHitFallDownRecoverTime ?? Number.POSITIVE_INFINITY) <= requirement.observedHitFallDownRecoverTimeAtMost) &&
    (requirement.observedHitFallDownRecoverTimeDropAtLeast === undefined ||
      (hitFallDownRecoverTimeDrop ?? Number.NEGATIVE_INFINITY) >=
        requirement.observedHitFallDownRecoverTimeDropAtLeast) &&
    (requirement.bodyWidthFront === undefined || sameTraceNumber(actor.bodyWidthFront ?? NaN, requirement.bodyWidthFront)) &&
    (requirement.bodyWidthBack === undefined || sameTraceNumber(actor.bodyWidthBack ?? NaN, requirement.bodyWidthBack)) &&
    (requirement.playerPush === undefined || actor.playerPush === requirement.playerPush) &&
    (requirement.spritePriority === undefined || actor.spritePriority === requirement.spritePriority) &&
    (requirement.paletteFxTime === undefined || actor.paletteFxTime === requirement.paletteFxTime) &&
    (requirement.paletteFxAddR === undefined || actor.paletteFxAddR === requirement.paletteFxAddR) &&
    (requirement.paletteFxAddG === undefined || actor.paletteFxAddG === requirement.paletteFxAddG) &&
    (requirement.paletteFxAddB === undefined || actor.paletteFxAddB === requirement.paletteFxAddB) &&
    (requirement.paletteFxMulR === undefined || actor.paletteFxMulR === requirement.paletteFxMulR) &&
    (requirement.paletteFxMulG === undefined || actor.paletteFxMulG === requirement.paletteFxMulG) &&
    (requirement.paletteFxMulB === undefined || actor.paletteFxMulB === requirement.paletteFxMulB) &&
    (requirement.paletteFxColor === undefined || actor.paletteFxColor === requirement.paletteFxColor) &&
    (requirement.paletteFxInvert === undefined || actor.paletteFxInvert === requirement.paletteFxInvert) &&
    (requirement.paletteRemapSourceGroup === undefined || actor.paletteRemapSourceGroup === requirement.paletteRemapSourceGroup) &&
    (requirement.paletteRemapSourceIndex === undefined || actor.paletteRemapSourceIndex === requirement.paletteRemapSourceIndex) &&
    (requirement.paletteRemapDestGroup === undefined || actor.paletteRemapDestGroup === requirement.paletteRemapDestGroup) &&
    (requirement.paletteRemapDestIndex === undefined || actor.paletteRemapDestIndex === requirement.paletteRemapDestIndex) &&
    (requirement.afterImageTime === undefined || actor.afterImageTime === requirement.afterImageTime) &&
    (requirement.afterImageLength === undefined || actor.afterImageLength === requirement.afterImageLength) &&
    (requirement.afterImageTimeGap === undefined || actor.afterImageTimeGap === requirement.afterImageTimeGap) &&
    (requirement.afterImageFrameGap === undefined || actor.afterImageFrameGap === requirement.afterImageFrameGap) &&
    (requirement.afterImageSampleCountAtLeast === undefined ||
      (actor.afterImageSampleCount ?? 0) >= requirement.afterImageSampleCountAtLeast) &&
    (requirement.afterImageOpacity === undefined || sameTraceNumber(actor.afterImageOpacity ?? NaN, requirement.afterImageOpacity)) &&
    (requirement.posFreezeX === undefined || actor.posFreezeX === requirement.posFreezeX) &&
    (requirement.posFreezeY === undefined || actor.posFreezeY === requirement.posFreezeY) &&
    (requirement.screenBound === undefined || actor.screenBound === requirement.screenBound) &&
    (requirement.moveCameraX === undefined || actor.moveCameraX === requirement.moveCameraX) &&
    (requirement.moveCameraY === undefined || actor.moveCameraY === requirement.moveCameraY)
  );
}

function describeActorFrameRequirement(requirement: RuntimeTraceActorFrameRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchesActorFrameSequenceRequirement(
  actors: RuntimeTraceGateActorFrameEvidence[],
  requirement: RuntimeTraceActorFrameSequenceRequirement,
): { passed: true } | { passed: false; reason: string } {
  if (requirement.steps.length === 0) {
    return { passed: true };
  }
  let previousBoundaryTick = Number.NEGATIVE_INFINITY;
  for (const [index, step] of requirement.steps.entries()) {
    const candidates = actors
      .filter((actor) => matchesActorFrameRequirement(actor, step))
      .sort((left, right) => left.firstTick - right.firstTick || left.lastTick - right.lastTick);
    if (candidates.length === 0) {
      return { passed: false, reason: `step ${index + 1} missing ${describeActorFrameRequirement(step)}` };
    }
    const candidate = candidates.find((actor) =>
      requirement.allowSameTick ? actor.firstTick >= previousBoundaryTick : actor.firstTick > previousBoundaryTick,
    );
    if (!candidate) {
      return {
        passed: false,
        reason: `step ${index + 1} not after tick ${previousBoundaryTick}: ${describeActorFrameRequirement(step)}`,
      };
    }
    previousBoundaryTick = requirement.allowSameTick ? candidate.firstTick : candidate.lastTick;
  }
  return { passed: true };
}

function describeActorFrameSequenceRequirement(requirement: RuntimeTraceActorFrameSequenceRequirement): string {
  const label = requirement.label ? `${requirement.label}: ` : "";
  return `${label}${requirement.steps.map(describeActorFrameRequirement).join(" -> ")}`;
}

function compareHitFallRequirement(
  actor: RuntimeTraceGateFinalActorEvidence,
  requirement: RuntimeTraceHitFallRequirement,
): string[] {
  const failures: string[] = [];
  const hitFall = actor.hitFall;
  if (!hitFall) {
    failures.push(`Final actor ${actor.id} missing hitFall evidence`);
    return failures;
  }
  const comparisons: Array<[string, number | boolean | undefined, number | boolean | undefined]> = [
    ["hitFall.falling", requirement.falling, hitFall.falling],
    ["hitFall.damage", requirement.damage, hitFall.damage],
    ["hitFall.kill", requirement.kill, hitFall.kill],
    ["hitFall.velocity.x", requirement.velocityX, hitFall.velocity.x],
    ["hitFall.velocity.y", requirement.velocityY, hitFall.velocity.y],
    ["hitFall.recover", requirement.recover, hitFall.recover],
    ["hitFall.recoverTime", requirement.recoverTime, hitFall.recoverTime],
    ["hitFall.downRecover", requirement.downRecover, hitFall.downRecover],
    ["hitFall.downRecoverTime", requirement.downRecoverTime, hitFall.downRecoverTime],
    ["hitFall.envShake.time", requirement.envShakeTime, hitFall.envShake?.time],
    ["hitFall.envShake.freq", requirement.envShakeFreq, hitFall.envShake?.freq],
    ["hitFall.envShake.ampl", requirement.envShakeAmpl, hitFall.envShake?.ampl],
    ["hitFall.envShake.phase", requirement.envShakePhase, hitFall.envShake?.phase],
  ];
  for (const [label, expected, actual] of comparisons) {
    if (expected !== undefined && actual !== expected) {
      failures.push(`Final actor ${actor.id} ${label} expected ${String(expected)} (actual ${String(actual)})`);
    }
  }
  return failures;
}

function findRequiredFinalActor(
  actors: RuntimeTraceGateFinalActorEvidence[],
  requirement: RuntimeTraceFinalActorRequirement,
): RuntimeTraceGateFinalActorEvidence | undefined {
  if (requirement.actorId) {
    return actors.find((actor) => actor.id === requirement.actorId);
  }
  return actors.find(
    (actor) =>
      (requirement.source === undefined || actor.source === requirement.source) &&
      (requirement.actorKind === undefined || actor.actorKind === requirement.actorKind),
  );
}

function describeFinalActorRequirement(requirement: RuntimeTraceFinalActorRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeTraceSnapshot(
  frameIndex: number,
  snapshot: MugenSnapshot,
  inputFrame?: RuntimeTraceInputFrame,
  logs: string[] = [],
  label = inputFrame?.label,
  actorRegistry?: MatchWorldActorRegistrySnapshot,
): RuntimeTraceFrame {
  const events = logs.map((line) => ({
    frameIndex,
    tick: snapshot.tick,
    category: categorizeLogLine(line),
    line,
  }));
  const actors = snapshot.actors.map(summarizeActor);
  const frame: RuntimeTraceFrame = {
    frameIndex,
    tick: snapshot.tick,
    label,
    input: {
      p1: cloneInputTokens(inputFrame?.p1),
      ...(inputFrame?.p2 === undefined ? {} : { p2: cloneInputTokens(inputFrame.p2) }),
      force: inputFrame?.force ?? false,
    },
    actors,
    effects: (snapshot.effects ?? []).map(summarizeActor),
    stage: summarizeStage(snapshot.stage),
    round: snapshot.round,
    matchPause: snapshot.matchPause,
    compatibility: summarizeCompatibility(snapshot.compatibilitySession),
    events,
    combatReasons: summarizeCombatReasons(frameIndex, snapshot.tick, actors, events),
    world: summarizeWorld(actorRegistry),
    checksum: "",
  };
  // World lifecycle evidence is excluded from behavior checksums until MatchWorld owns lifecycle simulation directly.
  frame.checksum = hashStableJson({
    tick: frame.tick,
    input: frame.input,
    actors: frame.actors.map(summarizeActorForChecksum),
    effects: frame.effects.map(summarizeActorForChecksum),
    round: frame.round,
    matchPause: frame.matchPause,
    compatibility: summarizeCompatibilityForChecksum(frame.compatibility),
    events: frame.events.map((event) => event.line),
    combatReasons: frame.combatReasons,
  });
  return frame;
}

function summarizeStage(stage: StageSnapshot): RuntimeTraceStageSummary {
  return {
    id: stage.id,
    displayName: stage.displayName,
    floorY: roundTraceNumber(stage.floorY),
    zOffset: stage.zOffset === undefined ? undefined : roundTraceNumber(stage.zOffset),
    bounds: stage.bounds
      ? {
          left: roundTraceNumber(stage.bounds.left),
          right: roundTraceNumber(stage.bounds.right),
        }
      : undefined,
    camera: {
      x: roundTraceNumber(stage.camera.x),
      y: roundTraceNumber(stage.camera.y),
      zoom: roundTraceNumber(stage.camera.zoom),
      shake: stage.camera.shake
        ? {
            x: roundTraceNumber(stage.camera.shake.x),
            y: roundTraceNumber(stage.camera.shake.y),
            remaining: stage.camera.shake.remaining,
            amplitude: roundTraceNumber(stage.camera.shake.amplitude),
          }
        : undefined,
    },
    envColor: stage.envColor
      ? {
          color: [stage.envColor.color[0], stage.envColor.color[1], stage.envColor.color[2]],
          opacity: roundTraceNumber(stage.envColor.opacity),
          remaining: stage.envColor.remaining,
          under: stage.envColor.under,
        }
      : undefined,
  };
}

function readActorRegistry(runtime: RuntimeTraceRunner): MatchWorldActorRegistrySnapshot | undefined {
  return runtime.getActorRegistry?.();
}

function summarizeWorld(actorRegistry: MatchWorldActorRegistrySnapshot | undefined): RuntimeTraceWorldSummary | undefined {
  if (!actorRegistry) {
    return undefined;
  }
  return {
    live: [...actorRegistry.lifecycle.live],
    spawnedThisTick: [...actorRegistry.lifecycle.spawnedThisTick],
    removedThisTick: [...actorRegistry.lifecycle.removedThisTick],
    removed: [...actorRegistry.lifecycle.removed],
    eventsThisTick: actorRegistry.lifecycle.eventsThisTick.map((event) => ({ ...event })),
    recentEvents: actorRegistry.lifecycle.recentEvents.map((event) => ({ ...event })),
    effectStores: actorRegistry.effectStores.map((store) => ({
      ownerId: store.ownerId,
      total: store.total,
      explods: [...store.explods],
      helpers: [...store.helpers],
      projectiles: [...store.projectiles],
      nextSerials: { ...store.nextSerials },
    })),
    targetLinks: actorRegistry.targetLinks.map((link) => ({
      ownerId: link.ownerId,
      actorId: link.actorId,
      targetId: link.targetId,
      age: link.age,
      binding: link.binding
        ? {
            actorId: link.binding.actorId,
            targetId: link.binding.targetId,
            remaining: link.binding.remaining,
            offset: { ...link.binding.offset },
          }
        : undefined,
    })),
    lifecycle: actorRegistry.lifecycle.records.map((record) => ({ ...record })),
  };
}

function summarizeCombatReasons(
  frameIndex: number,
  tick: number,
  actors: RuntimeTraceActor[],
  events: RuntimeTraceEvent[],
): RuntimeTraceCombatReason[] {
  const reasons = events.flatMap((event): RuntimeTraceCombatReason[] => {
    const reason = eventCategoryToCombatReason(event.category);
    return reason
      ? [
          {
            frameIndex,
            tick,
            reason,
            source: "log",
            detail: event.line,
          },
        ]
      : [];
  });
  if (reasons.length > 0) {
    return reasons;
  }
  return actors
    .filter((actor) => actor.moveType === "A" && actor.clsn1Count > 0)
    .map((actor) => ({
      frameIndex,
      tick,
      reason: "whiff" as const,
      source: "inferred" as const,
      actorId: actor.id,
      detail: `${actor.label} had active Clsn1 without hit, guard, reject, override, or reversal evidence`,
    }));
}

function eventCategoryToCombatReason(category: RuntimeTraceEvent["category"]): RuntimeTraceCombatReason["reason"] | undefined {
  if (category === "hit" || category === "guard" || category === "reject" || category === "override" || category === "reversal") {
    return category;
  }
  return undefined;
}

function summarizeActor(actor: ActorSnapshot): RuntimeTraceActor {
  return {
    id: actor.id,
    label: actor.label,
    actorKind: actor.actorKind,
    ownerId: actor.ownerId,
    rootId: actor.rootId,
    parentId: actor.parentId,
    source: actor.source,
    prevStateNo: actor.runtime.prevStateNo,
    prevAnimNo: actor.runtime.prevAnimNo,
    prevStateType: actor.runtime.prevStateType,
    prevMoveType: actor.runtime.prevMoveType,
    stateNo: actor.runtime.stateNo,
    animNo: actor.runtime.animNo,
    animTime: roundTraceNumber(actor.runtime.animTime),
    frameIndex: actor.runtime.frameIndex,
    life: actor.runtime.life,
    power: actor.runtime.power,
    ctrl: actor.runtime.ctrl,
    stateType: actor.runtime.stateType,
    moveType: actor.runtime.moveType,
    physics: actor.runtime.physics,
    pos: {
      x: roundTraceNumber(actor.runtime.pos.x),
      y: roundTraceNumber(actor.runtime.pos.y),
    },
    vel: {
      x: roundTraceNumber(actor.runtime.vel.x),
      y: roundTraceNumber(actor.runtime.vel.y),
    },
    renderScale: actor.runtime.renderScale
      ? {
          x: roundTraceNumber(actor.runtime.renderScale.x),
          y: roundTraceNumber(actor.runtime.renderScale.y),
        }
      : undefined,
    renderOpacity: actor.runtime.renderOpacity === undefined ? undefined : roundTraceNumber(actor.runtime.renderOpacity),
    renderAngle: actor.runtime.renderAngle === undefined ? undefined : roundTraceNumber(actor.runtime.renderAngle),
    bodyWidth: actor.runtime.bodyWidth
      ? {
          front: roundTraceNumber(actor.runtime.bodyWidth.front),
          back: roundTraceNumber(actor.runtime.bodyWidth.back),
        }
      : undefined,
    playerPush: actor.runtime.playerPush,
    spritePriority: actor.runtime.spritePriority,
    paletteFx: actor.runtime.paletteFx
      ? {
          time: actor.runtime.paletteFx.time,
          add: [...actor.runtime.paletteFx.add],
          mul: [...actor.runtime.paletteFx.mul],
          color: actor.runtime.paletteFx.color,
          invert: actor.runtime.paletteFx.invert,
        }
      : undefined,
    paletteRemap: actor.runtime.paletteRemap
      ? {
          source: [...actor.runtime.paletteRemap.source],
          dest: [...actor.runtime.paletteRemap.dest],
        }
      : undefined,
    afterImage: actor.runtime.afterImage
      ? {
          remaining: actor.runtime.afterImage.remaining,
          time: actor.runtime.afterImage.time,
          length: actor.runtime.afterImage.length,
          timeGap: actor.runtime.afterImage.timeGap,
          frameGap: actor.runtime.afterImage.frameGap,
          palAdd: [...actor.runtime.afterImage.palAdd],
          palMul: [...actor.runtime.afterImage.palMul],
          opacity: roundTraceNumber(actor.runtime.afterImage.opacity),
          sampleCount: actor.runtime.afterImage.samples.length,
        }
      : undefined,
    posFreeze: actor.runtime.posFreeze ? { ...actor.runtime.posFreeze } : undefined,
    screenBound: actor.runtime.screenBound ? { ...actor.runtime.screenBound } : undefined,
    facing: actor.runtime.facing,
    hitPause: actor.hitPause ?? 0,
    guarding: actor.runtime.guarding ?? false,
    guardStun: actor.runtime.guardStun ?? 0,
    ...(actor.runtime.guardSlideTime ? { guardSlideTime: actor.runtime.guardSlideTime } : {}),
    ...(actor.runtime.guardControlTime ? { guardControlTime: actor.runtime.guardControlTime } : {}),
    hitFall: actor.runtime.hitFall ? cloneTraceHitFall(actor.runtime.hitFall) : undefined,
    targetCount: actor.runtime.targetCount ?? actor.runtime.targetRefs?.length ?? 0,
    effect: actor.effect ? cloneTraceEffect(actor.effect) : undefined,
    soundEvents: actor.soundEvents?.map((event) => ({ ...event })),
    hitEffectEvents: actor.hitEffectEvents?.map(cloneTraceHitEffectEvent),
    envShakeEvents: actor.envShakeEvents?.map((event) => ({ ...event })),
    customOwnerId: actor.runtime.customState?.ownerId,
    clsn1Count: actor.clsn1.length,
    clsn2Count: actor.clsn2.length,
  };
}

function cloneTraceHitEffectEvent(event: NonNullable<ActorSnapshot["hitEffectEvents"]>[number]): RuntimeTraceHitEffectEvent {
  return {
    type: event.type,
    kind: event.kind,
    sparkNo: event.sparkNo,
    raw: event.raw,
    rawPrefix: event.rawPrefix,
    offset: event.offset ? { ...event.offset } : undefined,
    assetFrame: event.assetFrame ? { ...event.assetFrame } : undefined,
    assetFrames: event.assetFrames?.map((frame) => ({ ...frame })),
    ...(event.fightFxPrefix ? { fightFxPrefix: event.fightFxPrefix } : {}),
    stateNo: event.stateNo,
    tick: event.tick,
    runtimeTick: event.runtimeTick,
    contactId: event.contactId,
    contactTick: event.contactTick,
    contactKind: event.contactKind,
  };
}

function summarizeActorForChecksum(
  actor: RuntimeTraceActor,
): Omit<
  RuntimeTraceActor,
  | "animTime"
  | "prevStateNo"
  | "prevAnimNo"
  | "prevStateType"
  | "prevMoveType"
  | "hitPause"
  | "targetCount"
  | "effect"
  | "bodyWidth"
  | "playerPush"
  | "spritePriority"
  | "paletteFx"
  | "paletteRemap"
  | "afterImage"
  | "posFreeze"
  | "screenBound"
  | "soundEvents"
  | "hitEffectEvents"
  | "envShakeEvents"
> {
  const {
    animTime: _animTime,
    prevStateNo: _prevStateNo,
    prevAnimNo: _prevAnimNo,
    prevStateType: _prevStateType,
    prevMoveType: _prevMoveType,
    hitPause: _hitPause,
    targetCount: _targetCount,
    effect: _effect,
    bodyWidth: _bodyWidth,
    playerPush: _playerPush,
    spritePriority: _spritePriority,
    paletteFx: _paletteFx,
    paletteRemap: _paletteRemap,
    afterImage: _afterImage,
    posFreeze: _posFreeze,
    screenBound: _screenBound,
    soundEvents: _soundEvents,
    hitEffectEvents: _hitEffectEvents,
    envShakeEvents: _envShakeEvents,
    ...checksumActor
  } = actor;
  return checksumActor;
}

function cloneTraceEffect(effect: RuntimeTraceEffectSummary): RuntimeTraceEffectSummary {
  if (effect.kind === "explod") {
    return {
      ...effect,
      opacity: roundTraceNumber(effect.opacity),
      scale: {
        x: roundTraceNumber(effect.scale.x),
        y: roundTraceNumber(effect.scale.y),
      },
      bindOffset: effect.bindOffset
        ? {
            x: roundTraceNumber(effect.bindOffset.x),
            y: roundTraceNumber(effect.bindOffset.y),
          }
        : undefined,
    };
  }
  if (effect.kind === "projectile") {
    return {
      ...effect,
      accel: effect.accel
        ? {
            x: roundTraceNumber(effect.accel.x),
            y: roundTraceNumber(effect.accel.y),
          }
        : undefined,
      velMul: effect.velMul
        ? {
            x: roundTraceNumber(effect.velMul.x),
            y: roundTraceNumber(effect.velMul.y),
          }
        : undefined,
      scale: effect.scale
        ? {
            x: roundTraceNumber(effect.scale.x),
            y: roundTraceNumber(effect.scale.y),
          }
        : undefined,
    };
  }
  if (effect.kind === "helper") {
    return {
      ...effect,
      scale: {
        x: roundTraceNumber(effect.scale.x),
        y: roundTraceNumber(effect.scale.y),
      },
      ownerBind: effect.ownerBind
        ? {
            target: effect.ownerBind.target,
            offset: {
              x: roundTraceNumber(effect.ownerBind.offset.x),
              y: roundTraceNumber(effect.ownerBind.offset.y),
            },
            remaining: roundTraceNumber(effect.ownerBind.remaining),
          }
        : undefined,
    };
  }
  const exhaustive: never = effect;
  return exhaustive;
}

function cloneTraceHitFall(hitFall: RuntimeTraceHitFallSummary): RuntimeTraceHitFallSummary {
  return {
    falling: hitFall.falling,
    damage: roundTraceNumber(hitFall.damage),
    kill: hitFall.kill,
    velocity: {
      ...(hitFall.velocity.x === undefined ? {} : { x: roundTraceNumber(hitFall.velocity.x) }),
      y: roundTraceNumber(hitFall.velocity.y),
    },
    recover: hitFall.recover,
    recoverTime: hitFall.recoverTime === undefined ? undefined : roundTraceNumber(hitFall.recoverTime),
    downRecover: hitFall.downRecover,
    downRecoverTime: hitFall.downRecoverTime === undefined ? undefined : roundTraceNumber(hitFall.downRecoverTime),
    envShake: hitFall.envShake
      ? {
          time: roundTraceNumber(hitFall.envShake.time),
          freq: roundTraceNumber(hitFall.envShake.freq),
          ampl: roundTraceNumber(hitFall.envShake.ampl),
          phase: roundTraceNumber(hitFall.envShake.phase),
        }
      : undefined,
  };
}

function summarizeCompatibility(session: CompatibilitySessionSnapshot | undefined): RuntimeTraceCompatibilityActor[] | undefined {
  if (!session?.actors.length) {
    return undefined;
  }
  return session.actors.map((actor) => ({
    actorId: actor.actorId,
    label: actor.label,
    executedStates: [...actor.executedStates],
    routedStates: [...actor.routedStates],
    activeCommands: [...actor.activeCommands],
    commandHistory: actor.commandHistory.map((sample) => ({
      frame: sample.frame,
      values: [...sample.values],
      hitPause: sample.hitPause,
    })),
    executedControllers: { ...actor.executedControllers },
    executedOperations: { ...actor.executedOperations },
    controllerEvents: (actor.controllerEvents ?? []).map((event) => ({
      actorId: actor.actorId,
      label: actor.label,
      ...event,
    })),
    lastRoutedState: actor.lastRoutedState ? { ...actor.lastRoutedState } : undefined,
    lastExecutedState: actor.lastExecutedState,
  }));
}

function summarizeCompatibilityForChecksum(
  compatibility: RuntimeTraceCompatibilityActor[] | undefined,
): Array<Omit<RuntimeTraceCompatibilityActor, "controllerEvents">> | undefined {
  return compatibility?.map(({ controllerEvents: _controllerEvents, ...actor }) => actor);
}

function toMatchInput(frame: RuntimeTraceInputFrame): MatchInput {
  return {
    p1: new Set(frame.p1 ?? []),
    ...(frame.p2 === undefined ? {} : { p2: new Set(frame.p2) }),
  };
}

function collectNewLogs(previous: string[], current: string[]): string[] {
  for (let start = 0; start <= current.length; start += 1) {
    const matches = previous.every((line, index) => current[start + index] === line);
    if (matches) {
      return current.slice(0, start);
    }
  }
  const previousSet = new Set(previous);
  return current.filter((line) => !previousSet.has(line));
}

function controllerEventKey(event: RuntimeTraceControllerEvent): string {
  return `${event.actorId}:${event.sequence}`;
}

function compareControllerTraceEvents(left: RuntimeTraceControllerEvent, right: RuntimeTraceControllerEvent): number {
  return left.tick - right.tick || left.sequence - right.sequence || left.actorId.localeCompare(right.actorId);
}

function matchesControllerEventSequenceRequirement(
  events: RuntimeTraceControllerEvent[],
  requirement: RuntimeTraceControllerEventSequenceRequirement,
): { passed: boolean; reason: string } {
  if (requirement.steps.length === 0) {
    return { passed: true, reason: "empty sequence" };
  }
  let cursor = -1;
  let previous: RuntimeTraceControllerEvent | undefined;
  for (const step of requirement.steps) {
    const foundIndex = events.findIndex((event, index) => {
      if (index <= cursor) {
        return false;
      }
      if (requirement.actorId !== undefined && event.actorId !== requirement.actorId) {
        return false;
      }
      if (!matchesControllerEventRequirement(event, step)) {
        return false;
      }
      if (!requirement.allowSameTick && previous && event.tick <= previous.tick) {
        return false;
      }
      return true;
    });
    if (foundIndex === -1) {
      return { passed: false, reason: `missing ${describeControllerEventRequirement(step)} after index ${cursor}` };
    }
    cursor = foundIndex;
    previous = events[foundIndex];
  }
  return { passed: true, reason: "matched" };
}

function matchesControllerEventRequirement(
  event: RuntimeTraceControllerEvent,
  requirement: RuntimeTraceControllerEventRequirement,
): boolean {
  return (
    (requirement.actorId === undefined || event.actorId === requirement.actorId) &&
    (requirement.stateNo === undefined || event.stateNo === requirement.stateNo) &&
    (requirement.controller === undefined || event.controller === requirement.controller) &&
    (requirement.name === undefined || event.name === requirement.name) &&
    (requirement.operation === undefined || event.operation === requirement.operation)
  );
}

function describeControllerEventSequenceRequirement(requirement: RuntimeTraceControllerEventSequenceRequirement): string {
  const label = requirement.label ? `${requirement.label}: ` : "";
  return `${label}${requirement.steps.map(describeControllerEventRequirement).join(" -> ")}`;
}

function describeControllerEventRequirement(requirement: RuntimeTraceControllerEventRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function categorizeLogLine(line: string): RuntimeTraceEvent["category"] {
  const lower = line.toLowerCase();
  if (lower.includes("hitoverride")) {
    return "override";
  }
  if (lower.includes("rejected")) {
    return "reject";
  }
  if (lower.includes("reversed")) {
    return "reversal";
  }
  if (lower.includes("guarded")) {
    return "guard";
  }
  if (lower.includes(" hit ") || lower.includes("projectile hit")) {
    return "hit";
  }
  if (lower.includes("pause")) {
    return "pause";
  }
  if (lower.includes("wins") || lower.includes("ko") || lower.includes("time over")) {
    return "round";
  }
  return "runtime";
}

function cloneInputTokens(tokens: string[] | undefined): string[] {
  return [...(tokens ?? [])].sort();
}

function sortNumbers(values: number[]): number[] {
  return values.sort((left, right) => left - right);
}

function sortStrings<T extends string>(values: T[]): T[] {
  return values.sort((left, right) => left.localeCompare(right));
}

function roundTraceNumber(value: number): number {
  return Number(value.toFixed(4));
}

function hashStableJson(value: unknown): string {
  const text = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
