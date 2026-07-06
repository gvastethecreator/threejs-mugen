import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { CommandInputHistorySample } from "./CommandBuffer";

export type CharacterRuntimeState = {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  facing: 1 | -1;
  bodyWidth?: { front: number; back: number };
  playerPush?: boolean;
  posFreeze?: { x: boolean; y: boolean };
  screenBound?: { bound: boolean; moveCameraX: boolean; moveCameraY: boolean };
  hitVelocity?: { x: number; y: number };
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
  attackMultiplier?: number;
  paletteRemap?: RuntimePaletteRemap;
  spritePriority?: number;
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
  stateNo: number;
  animNo: number;
  animTime: number;
  frameIndex: number;
  lifeMax?: number;
  life: number;
  powerMax?: number;
  power: number;
  ctrl: boolean;
  guardStun?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guarding?: boolean;
  stateType: "S" | "C" | "A" | "L";
  moveType: "I" | "A" | "H";
  physics: "S" | "C" | "A" | "N";
  vars: number[];
  sysvars?: number[];
  fvars: number[];
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
  offset: { x: number; y: number };
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
  unguardable?: boolean;
  noKo?: boolean;
  noKoSlow?: boolean;
  timerFreeze?: boolean;
  roundNotOver?: boolean;
  intro?: boolean;
  noJuggleCheck?: boolean;
  noGetUpFromLieDown?: boolean;
  noFastRecoverFromLieDown?: boolean;
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
      spritePriority: number;
      priority: number;
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
      p2StateNo?: number;
      p2GetP1State?: boolean;
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
    };

export type ActorSnapshot = RuntimeActorIdentity & {
  id: string;
  label: string;
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
};

export type RuntimeControllerTraceEvent = {
  sequence: number;
  tick: number;
  stateNo: number;
  controller: string;
  name?: string;
  line?: number;
  operation?: string;
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
};

export type RoundSnapshot = {
  state: "fight" | "ko" | "timeover";
  timer: number;
  winner?: string;
  message: string;
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
  effects?: ActorSnapshot[];
  compatibilitySession?: CompatibilitySessionSnapshot;
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
