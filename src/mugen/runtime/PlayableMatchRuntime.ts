import { compileRuntimeProgram } from "../compiler/StateControllerCompiler";
import type {
  BindToTargetControllerOp,
  ContactControllerOp,
  ControllerOp,
  EnvColorControllerOp,
  FallEnvShakeControllerOp,
  HitDefControllerOp,
  PauseControllerOp,
  ReversalDefControllerOp,
  SpriteEffectControllerOp,
  TargetControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr, RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import { RuntimeAudioWorld } from "./AudioEventSystem";
import { CommandBuffer } from "./CommandBuffer";
import {
  RuntimeContactMemoryWorld,
  type RuntimeContactMemory,
} from "./ContactMemorySystem";
import { RuntimeEnvColorWorld } from "./EnvColorSystem";
import {
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  DEFAULT_RUNTIME_GUARD_DISTANCE,
  findRuntimeHitOverride,
  hasRuntimeGuardDistance,
  hasRuntimeBoxContact,
  hitAttributeMatches,
  isRuntimeGuarding,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
  scaleRuntimeIncomingDamage,
} from "./CombatResolver";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "./demoFighters";
import { RuntimeDirectCombatWorld } from "./DirectCombatSystem";
import { RuntimeEnvShakeWorld } from "./EnvShakeSystem";
import { resolveRuntimeHitSparkAssetFrames } from "./HitSparkAssetSystem";
import { RuntimeHitEffectWorld } from "./HitEffectSystem";
import { RuntimeHitOverrideWorld } from "./HitOverrideSystem";
import { RuntimeReversalWorld } from "./ReversalSystem";
import { evaluateExpression } from "./ExpressionEvaluator";
import {
  RuntimeEffectActorWorld,
  type RuntimeEffectActorStores,
  type RuntimeEffectActorStoreSummary,
} from "./EffectActorSystem";
import { RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import { RuntimeEffectSpawnWorld } from "./EffectSpawnSystem";
import { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import { RuntimeGuardWorld } from "./GuardSystem";
import { hasRuntimeDirection, isRuntimeHoldingBack } from "./RuntimeInput";
import { RuntimeRoundSystem } from "./RuntimeRoundSystem";
import { createRuntimeRandomSeed, nextRuntimeRandomUnit } from "./RuntimeRandomSystem";
import { RuntimeOrientationWorld } from "./OrientationSystem";
import { RuntimeMatchInteractionWorld } from "./MatchInteractionSystem";
import { RuntimeRecoverySystem } from "./RuntimeRecoverySystem";
import { RuntimeHitEligibilityWorld } from "./RuntimeHitEligibilitySystem";
import { hasRuntimeStun, tickRuntimeStun } from "./RuntimeStunSystem";
import { RuntimePauseWorld } from "./PauseSystem";
import { executeControllerIr } from "./StateControllerExecutor";
import { dispatchStateProgramController, findControllerParam, isStateEntrySetupDispatch } from "./StateProgramExecutor";
import {
  RuntimeSpriteEffectWorld,
  type RuntimeAngleSpriteEffectOp,
} from "./SpriteEffectSystem";
import {
  RuntimeTargetWorld,
  type RuntimeTarget,
  type RuntimeTargetBinding,
  type RuntimeTargetPostype,
} from "./TargetSystem";
import { trainingStage } from "./demoStage";
import { evaluateTriggerIr } from "./TriggerEvaluator";
import type {
  ActorCompatibilitySession,
  ActorSnapshot,
  CharacterRuntimeState,
  RuntimeAfterImageSample,
  RuntimeControllerTraceEvent,
  RuntimeEnvShakeEvent,
  RuntimeHitEffectEvent,
  RuntimeHitOverrideSlot,
  MugenSnapshot,
  RuntimeSoundEvent,
} from "./types";

export type MatchInput = {
  p1: Set<string>;
  p2?: Set<string>;
};

export type MatchRuntimeCommand =
  | { type: "set-playing"; playing: boolean }
  | { type: "set-speed"; speed: number }
  | { type: "toggle"; key: "showClsn1" | "showClsn2" | "showAxis" | "showGrid"; value: boolean }
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
};

type FighterMatchState = {
  id: string;
  label: string;
  definition: DemoFighterDefinition;
  runtimeProgram?: RuntimeProgramIr;
  runtime: CharacterRuntimeState;
  currentAction: MugenAnimationAction;
  stateOwner?: FighterMatchState;
  commandBuffer: CommandBuffer;
  frameElapsed: number;
  animationComplete: boolean;
  stateElapsed: number;
  currentMove?: DemoMove;
  currentMoveLabel?: string;
  moveTick: number;
  hitStun: number;
  hitPause: number;
  hasHit: boolean;
  targets: RuntimeTarget[];
  targetBindings: RuntimeTargetBinding[];
  bindToTarget?: RuntimeTargetBinding;
  currentInput: Set<string>;
  aiCooldown: number;
  executedStateIds: Set<number>;
  routedStateEntries: number;
  routedStateIds: number[];
  lastRoutedState?: { stateId: number; name?: string };
  executedControllerCounts: Record<string, number>;
  executedOperationCounts: Record<string, number>;
  controllerEvents: RuntimeControllerTraceEvent[];
  nextControllerEventSequence: number;
  compatibilityTick: number;
  rngSeed: number;
  firedHitDefs: Set<string>;
  soundEvents: RuntimeSoundEvent[];
  audioWorld: RuntimeAudioWorld;
  envShakeEvents: RuntimeEnvShakeEvent[];
  envShakeWorld: RuntimeEnvShakeWorld;
  hitEffectEvents: RuntimeHitEffectEvent[];
  hitEffectWorld: RuntimeHitEffectWorld;
  effectActorWorld: RuntimeEffectActorWorld;
  targetWorld: RuntimeTargetWorld;
  contactWorld: RuntimeContactMemoryWorld;
  lastExecutedState?: number;
  contact: RuntimeContactMemory;
};

type PauseControllerHandler = (fighter: FighterMatchState, controller: MugenStateController, operation?: PauseControllerOp) => void;
type EnvColorControllerHandler = (controller: MugenStateController, operation?: EnvColorControllerOp) => void;

type EnterStateOptions = {
  stateOwner?: FighterMatchState;
  clearStateOwner?: boolean;
  animOverride?: number;
  preserveAnimationWhenMissing?: boolean;
  animationElement?: AnimationElementOptions;
};

type AnimationElementOptions = {
  elem?: number;
  elemTime?: number;
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
  private readonly stage: MugenStageDefinition;
  private readonly effectActorWorld: RuntimeEffectActorWorld;
  private readonly effectLifecycleWorld: RuntimeEffectLifecycleWorld;
  private readonly effectSpawnWorld: RuntimeEffectSpawnWorld;
  private readonly targetWorld: RuntimeTargetWorld;
  private readonly audioWorld = new RuntimeAudioWorld();
  private readonly envShakeWorld = new RuntimeEnvShakeWorld();
  private readonly hitEffectWorld = new RuntimeHitEffectWorld();
  private readonly envColorWorld = new RuntimeEnvColorWorld();
  private readonly pauseWorld = new RuntimePauseWorld();
  private readonly spriteEffectWorld = new RuntimeSpriteEffectWorld();
  private readonly actorConstraintWorld = new RuntimeActorConstraintWorld();
  private readonly contactWorld = new RuntimeContactMemoryWorld();
  private readonly directCombatWorld = new RuntimeDirectCombatWorld(this.contactWorld);
  private readonly hitOverrideWorld = new RuntimeHitOverrideWorld();
  private readonly reversalWorld = new RuntimeReversalWorld(this.contactWorld);
  private readonly matchInteractionWorld = new RuntimeMatchInteractionWorld();
  private readonly recoveryWorld = new RuntimeRecoverySystem();
  private readonly hitEligibilityWorld = new RuntimeHitEligibilityWorld();
  private readonly orientationWorld = new RuntimeOrientationWorld();
  private readonly guardWorld = new RuntimeGuardWorld();
  private readonly getHitStateWorld = new RuntimeGetHitStateWorld();
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
    this.roundTimerFrames = options.roundTimerFrames;
    this.round = new RuntimeRoundSystem(options.roundTimerFrames);
    this.effectActorWorld = options.effectActorWorld ?? new RuntimeEffectActorWorld(options.effectActorStores);
    this.effectLifecycleWorld = options.effectLifecycleWorld ?? new RuntimeEffectLifecycleWorld();
    this.effectSpawnWorld = options.effectSpawnWorld ?? new RuntimeEffectSpawnWorld();
    this.targetWorld = options.targetWorld ?? new RuntimeTargetWorld();
    this.p1 = createFighterState(
      "p1",
      p1Definition,
      stage.playerStart.p1.x,
      stage.playerStart.p1.y,
      stage.playerStart.p1.facing,
      this.effectActorWorld,
      this.targetWorld,
      this.audioWorld,
      this.envShakeWorld,
      this.hitEffectWorld,
      this.contactWorld,
    );
    this.p2 = createFighterState(
      "p2",
      p2Definition,
      stage.playerStart.p2.x,
      stage.playerStart.p2.y,
      stage.playerStart.p2.facing,
      this.effectActorWorld,
      this.targetWorld,
      this.audioWorld,
      this.envShakeWorld,
      this.hitEffectWorld,
      this.contactWorld,
    );
    this.logs.unshift(`Playable demo match started on ${stage.displayName}`);
  }

  dispatch(command: MatchRuntimeCommand): MugenSnapshot {
    if (command.type === "set-playing") {
      this.playing = command.playing;
    } else if (command.type === "set-speed") {
      this.speed = Math.max(0.5, Math.min(4, command.speed));
    } else if (command.type === "toggle") {
      this.toggles = { ...this.toggles, [command.key]: command.value };
    } else if (command.type === "reset") {
      this.reset();
    }
    return this.getSnapshot();
  }

  step(input: MatchInput, options: MatchStepOptions = {}): MugenSnapshot {
    if (!this.playing && !options.force) {
      return this.getSnapshot();
    }

    this.frameClock += 1;
    const iterations = options.force ? 1 : this.consumeSpeedIterations();
    for (let index = 0; index < iterations; index += 1) {
      if (this.round.isOver) {
        break;
      }
      this.advanceOneTick(input);
    }

    return this.getSnapshot();
  }

  private consumeSpeedIterations(): number {
    if (this.speed < 1) {
      const skipEvery = Math.round(1 / this.speed);
      return this.frameClock % skipEvery === 0 ? 1 : 0;
    }
    return Math.max(1, Math.round(this.speed));
  }

  private advanceOneTick(input: MatchInput): void {
    this.tick += 1;
    const p1Input = input.p1;
    const p2Input = input.p2 ?? new Set<string>();
    this.p1.compatibilityTick = this.tick;
    this.p2.compatibilityTick = this.tick;
    this.p1.currentInput = new Set(p1Input);
    this.p2.currentInput = new Set(p2Input);

    this.hitEligibilityWorld.resetFrameFlags(this.p1.runtime);
    this.hitEligibilityWorld.resetFrameFlags(this.p2.runtime);
    applyPreFacingAssertSpecial(this.p1, this.p2, this.tick);
    applyPreFacingAssertSpecial(this.p2, this.p1, this.tick);
    this.orientationWorld.updateAutoFacing(this.p1.runtime, this.p2.runtime);
    this.orientationWorld.updateAutoFacing(this.p2.runtime, this.p1.runtime);

    const globalPause = Math.max(this.p1.hitPause, this.p2.hitPause);
    if (globalPause > 0) {
      this.p1.commandBuffer.push(this.tick, p1Input, { hitPause: true });
      this.p2.commandBuffer.push(this.tick, p2Input, { hitPause: true });
      runHitPauseIgnoredControllers(
        this.p1,
        this.p2,
        this.actorConstraintWorld,
        this.spriteEffectWorld,
        this.reversalWorld,
        this.effectSpawnWorld,
        this.tick,
        (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
        (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
      );
      runHitPauseIgnoredControllers(
        this.p2,
        this.p1,
        this.actorConstraintWorld,
        this.spriteEffectWorld,
        this.reversalWorld,
        this.effectSpawnWorld,
        this.tick,
        (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
        (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
      );
      this.effectLifecycleWorld.advancePausedPresentation(this.p1, "hitpause", this.stage);
      this.effectLifecycleWorld.advancePausedPresentation(this.p2, "hitpause", this.stage);
      this.p1.hitPause = Math.max(0, this.p1.hitPause - 1);
      this.p2.hitPause = Math.max(0, this.p2.hitPause - 1);
      return;
    }

    if (this.pauseWorld.current()) {
      this.advancePausedMatch(input, p1Input, p2Input);
      return;
    }

    this.round.tickTimer();
    this.p1.commandBuffer.push(this.tick, p1Input);
    this.p2.commandBuffer.push(this.tick, p2Input);
    handlePlayerInput(this.p1, p1Input, this.p2, this.tick);
    if (input.p2) {
      handlePlayerInput(this.p2, p2Input, this.p1, this.tick);
    } else {
      handleSimpleAi(this.p2, this.p1, this.tick);
    }
    advanceFighter(
      this.p1,
      this.p2,
      this.actorConstraintWorld,
      this.spriteEffectWorld,
      this.hitOverrideWorld,
      this.reversalWorld,
      this.effectSpawnWorld,
      this.recoveryWorld,
      this.hitEligibilityWorld,
      this.tick,
      (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
      (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
    );
    applyAutoGuardStart(this.p2, this.p1, this.guardWorld);
    if (!this.pauseWorld.current()) {
      advanceFighter(
        this.p2,
        this.p1,
        this.actorConstraintWorld,
        this.spriteEffectWorld,
        this.hitOverrideWorld,
        this.reversalWorld,
        this.effectSpawnWorld,
        this.recoveryWorld,
        this.hitEligibilityWorld,
        this.tick,
        (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
        (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
      );
      applyAutoGuardStart(this.p1, this.p2, this.guardWorld);
    }
    this.matchInteractionWorld.advance({
      p1: this.p1,
      p2: this.p2,
      advanceTargetMemory,
      advanceActiveEffects: (fighter) => this.effectLifecycleWorld.advanceActive(fighter, this.stage),
      resolveProjectileClashes: (left, right) => resolveProjectileClashes(left, right, (line) => this.logs.unshift(line)),
      separateActors: (left, right) => this.actorConstraintWorld.separate(left.runtime, right.runtime),
      applyTargetBindings,
      applyBindToTarget,
      resolvePriorityClash: (left, right) =>
        this.directCombatWorld.resolvePriorityClash(left, right, {
          isMoveActive,
          worldBox: runtimeWorldBox,
          boxesIntersect: collisionBoxesIntersect,
        })?.message,
      resolveDirectCombat: (attacker, defender) =>
        resolveCombat(
          attacker,
          defender,
          this.directCombatWorld,
          this.hitOverrideWorld,
          this.reversalWorld,
          this.guardWorld,
          this.getHitStateWorld,
          this.tick,
          (line) => this.logs.unshift(line),
        ),
      resolveProjectileCombat: (attacker, defender) =>
        resolveProjectileCombat(
          attacker,
          defender,
          this.hitOverrideWorld,
          this.effectLifecycleWorld,
          this.guardWorld,
          this.getHitStateWorld,
          (line) => this.logs.unshift(line),
        ),
      clampToStage: (fighter) => this.actorConstraintWorld.clampToStage(fighter.runtime, this.stage),
      advancePresentationEffects: (fighter) => this.effectLifecycleWorld.advancePresentation(fighter),
      log: (line) => this.logs.unshift(line),
    });

    const roundFinish = this.round.finishIfNeeded(
      { label: this.p1.label, life: this.p1.runtime.life },
      { label: this.p2.label, life: this.p2.runtime.life },
    );
    if (roundFinish) {
      this.playing = false;
      this.logs.unshift(roundFinish.message);
    }
  }

  private advancePausedMatch(input: MatchInput, p1Input: Set<string>, p2Input: Set<string>): void {
    const pause = this.pauseWorld.current();
    if (!pause) {
      return;
    }

    this.p1.commandBuffer.push(this.tick, p1Input, { hitPause: true });
    this.p2.commandBuffer.push(this.tick, p2Input, { hitPause: true });

    const actor = pause.actorId === this.p2.id ? this.p2 : this.p1;
    const opponent = actor === this.p1 ? this.p2 : this.p1;
    const actorInput = actor === this.p1 ? p1Input : p2Input;
    const actorMoved = this.pauseWorld.canActorMove(actor.id);
    if (actorMoved) {
      if (actor === this.p1 || input.p2) {
        handlePlayerInput(actor, actorInput, opponent, this.tick);
      } else {
        handleSimpleAi(actor, opponent, this.tick);
      }
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
        this.tick,
        (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
        (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
      );
      advanceTargetMemory(actor);
      this.effectLifecycleWorld.advanceActive(actor, this.stage);
      this.effectLifecycleWorld.advancePresentation(actor);
      applyTargetBindings(actor, opponent);
      applyBindToTarget(actor, opponent);
      this.actorConstraintWorld.clampToStage(actor.runtime, this.stage);
    }

    if (this.pauseWorld.current() !== pause) {
      return;
    }
    if (!actorMoved || actor.id !== this.p1.id) {
      this.effectLifecycleWorld.advancePausedPresentation(this.p1, pause.type, this.stage);
    }
    if (!actorMoved || actor.id !== this.p2.id) {
      this.effectLifecycleWorld.advancePausedPresentation(this.p2, pause.type, this.stage);
    }
    this.pauseWorld.tick();
  }

  private applyMatchPauseController(fighter: FighterMatchState, controller: MugenStateController, operation?: PauseControllerOp): void {
    const result = this.pauseWorld.applyController(fighter, controller, this.tick, operation);
    if (!result.pause) {
      return;
    }
    if (operation) {
      recordControllerOperation(fighter, operation);
    }
    if (result.powerDelta !== 0) {
      fighter.runtime.power = clampNumber(fighter.runtime.power + result.powerDelta, 0, runtimePowerMax(fighter.definition));
    }
    this.logs.unshift(
      `${fighter.label} triggered ${result.pause.type} for ${result.pause.remaining}f (${result.pause.moveTime}f movetime)`,
    );
  }

  getSnapshot(): MugenSnapshot {
    const center = cameraCenterX([this.p1, this.p2]);
    const shake = this.envShakeWorld.snapshotCameraShake(this.tick, [this.p1, this.p2]);
    const envColor = this.envColorWorld.snapshotStageFlash(this.tick);
    const p1Effects = this.effectLifecycleWorld.snapshotGroups(this.p1);
    const p2Effects = this.effectLifecycleWorld.snapshotGroups(this.p2);
    return {
      tick: this.tick,
      selectedActionId: this.p1.runtime.animNo,
      selectedAction: this.p1.currentAction,
      playing: this.playing,
      speed: this.speed,
      ...this.toggles,
      matchPause: this.pauseWorld.snapshot(),
      stage: {
        id: this.stage.id,
        displayName: this.stage.displayName,
        floorY: this.stage.floorY,
        zOffset: this.stage.zOffset,
        bounds: this.stage.bounds,
        camera: {
          x: center + this.stage.camera.startX,
          y: this.stage.camera.startY,
          zoom: this.stage.camera.zoom,
          ...(shake ? { shake } : {}),
        },
        ...(envColor ? { envColor } : {}),
        layers: this.stage.layers,
        animations: this.stage.animations,
        bgControllers: this.stage.bgControllers,
      },
      round: this.round.snapshot(),
      actors: [toSnapshot(this.p1), toSnapshot(this.p2)],
      effects: [
        ...p1Effects.explods,
        ...p2Effects.explods,
        ...p1Effects.helpers,
        ...p2Effects.helpers,
        ...p1Effects.projectiles,
        ...p2Effects.projectiles,
      ],
      compatibilitySession: buildCompatibilitySession([this.p1, this.p2]),
      logs: this.logs.slice(0, 80),
    };
  }

  getEffectActorStores(): RuntimeEffectActorStoreSummary[] {
    return this.effectActorWorld.summarize({ p1: this.p1.id, p2: this.p2.id });
  }

  reset(): void {
    this.tick = 0;
    this.frameClock = 0;
    this.round.reset(this.roundTimerFrames);
    this.playing = true;
    this.pauseWorld.reset();
    this.envColorWorld.reset();
    this.effectActorWorld.reset();
    Object.assign(
      this.p1,
      createFighterState(
        "p1",
        this.p1.definition,
        this.stage.playerStart.p1.x,
        this.stage.playerStart.p1.y,
        this.stage.playerStart.p1.facing,
        this.effectActorWorld,
        this.targetWorld,
        this.audioWorld,
        this.envShakeWorld,
        this.hitEffectWorld,
        this.contactWorld,
      ),
    );
    Object.assign(
      this.p2,
      createFighterState(
        "p2",
        this.p2.definition,
        this.stage.playerStart.p2.x,
        this.stage.playerStart.p2.y,
        this.stage.playerStart.p2.facing,
        this.effectActorWorld,
        this.targetWorld,
        this.audioWorld,
        this.envShakeWorld,
        this.hitEffectWorld,
        this.contactWorld,
      ),
    );
    this.logs.unshift("Round reset");
  }

  private recordEnvColorEvent(controller: MugenStateController, runtimeTick: number, operation?: EnvColorControllerOp): void {
    this.envColorWorld.emitController(controller, runtimeTick, operation);
  }

}

function createFighterState(
  id: string,
  definition: DemoFighterDefinition,
  x: number,
  y: number,
  facing: 1 | -1,
  effectActorWorld = new RuntimeEffectActorWorld(),
  targetWorld = new RuntimeTargetWorld(),
  audioWorld = new RuntimeAudioWorld(),
  envShakeWorld = new RuntimeEnvShakeWorld(),
  hitEffectWorld = new RuntimeHitEffectWorld(),
  contactWorld = new RuntimeContactMemoryWorld(),
): FighterMatchState {
  const action = definition.animations.get(definition.idleAction)!;
  const runtimeProgram = getRuntimeProgram(definition);
  const lifeMax = runtimeLifeMax(definition);
  const powerMax = runtimePowerMax(definition);
  const attackMultiplier = runtimeAttackMultiplier(definition);
  const defenseMultiplier = runtimeDefenseMultiplier(definition);
  return {
    id,
    label: definition.displayName,
    definition,
    runtimeProgram,
    stateOwner: undefined,
    runtime: {
      pos: { x, y },
      vel: { x: 0, y: 0 },
      facing,
      bodyWidth: { front: 39, back: 39 },
      playerPush: true,
      targetCount: 0,
      ...(attackMultiplier === undefined ? {} : { attackMultiplier }),
      ...(defenseMultiplier === undefined ? {} : { defenseMultiplier }),
      spritePriority: id === "p2" ? 1 : 2,
      stateNo: 0,
      animNo: definition.idleAction,
      animTime: 0,
      frameIndex: 0,
      lifeMax,
      life: lifeMax,
      powerMax,
      power: 0,
      ctrl: true,
      guardStun: 0,
      guardSlideTime: 0,
      guardControlTime: 0,
      guarding: false,
      stateType: "S",
      moveType: "I",
      physics: "S",
      vars: [],
      fvars: [],
    },
    currentAction: action,
    commandBuffer: new CommandBuffer(90),
    frameElapsed: 0,
    animationComplete: false,
    stateElapsed: -1,
    moveTick: 0,
    hitStun: 0,
    hitPause: 0,
    hasHit: false,
    targets: [],
    targetBindings: [],
    currentInput: new Set(),
    aiCooldown: 80,
    executedStateIds: new Set(),
    routedStateEntries: 0,
    routedStateIds: [],
    executedControllerCounts: {},
    executedOperationCounts: {},
    controllerEvents: [],
    nextControllerEventSequence: 0,
    compatibilityTick: 0,
    rngSeed: createRuntimeRandomSeed(id, definition.id),
    firedHitDefs: new Set(),
    soundEvents: [],
    audioWorld,
    envShakeEvents: [],
    envShakeWorld,
    hitEffectEvents: [],
    hitEffectWorld,
    effectActorWorld,
    targetWorld,
    contactWorld,
    contact: contactWorld.create(),
  };
}

function nextRuntimeRandom(fighter: FighterMatchState): number {
  const next = nextRuntimeRandomUnit(fighter.rngSeed);
  fighter.rngSeed = next.seed;
  return next.value;
}

function getRuntimeProgram(definition: DemoFighterDefinition): RuntimeProgramIr | undefined {
  if (definition.runtimeProgram) {
    return definition.runtimeProgram;
  }
  if (!definition.states?.length && !definition.stateEntryControllers?.length && !definition.commands?.length) {
    return undefined;
  }
  return compileRuntimeProgram({
    commands: definition.commands ?? [],
    states: definition.states ?? [],
    stateEntryControllers: definition.stateEntryControllers ?? [],
    animations: definition.animations,
  });
}

function setRuntimeStateNo(fighter: FighterMatchState, stateNo: number, options: { resetElapsed?: boolean } = {}): void {
  if (fighter.runtime.stateNo !== stateNo) {
    fighter.runtime.prevStateNo = fighter.runtime.stateNo;
    fighter.runtime.prevAnimNo = fighter.runtime.animNo;
    fighter.runtime.prevStateType = currentStateType(fighter);
    fighter.runtime.prevMoveType = currentStateMoveType(fighter);
    fighter.runtime.stateNo = stateNo;
    if (options.resetElapsed) {
      fighter.stateElapsed = -1;
    }
    return;
  }
  fighter.runtime.stateNo = stateNo;
}

function currentStateType(fighter: FighterMatchState): CharacterRuntimeState["stateType"] {
  const owner = fighter.stateOwner ?? fighter;
  const state =
    owner.runtimeProgram?.states.find((candidate) => candidate.id === fighter.runtime.stateNo)?.source ??
    owner.definition.states?.find((candidate) => candidate.id === fighter.runtime.stateNo);
  return state?.type ? normalizeStateType(state.type, fighter.runtime.stateType) : fighter.runtime.stateType;
}

function currentStateMoveType(fighter: FighterMatchState): CharacterRuntimeState["moveType"] {
  const owner = fighter.stateOwner ?? fighter;
  const state =
    owner.runtimeProgram?.states.find((candidate) => candidate.id === fighter.runtime.stateNo)?.source ??
    owner.definition.states?.find((candidate) => candidate.id === fighter.runtime.stateNo);
  return state?.moveType ? normalizeMoveType(state.moveType, fighter.runtime.moveType) : fighter.runtime.moveType;
}

function handlePlayerInput(fighter: FighterMatchState, input: Set<string>, opponent: FighterMatchState, tick: number): void {
  if (hasRuntimeStun(fighter) || fighter.currentMove) {
    return;
  }
  if (!fighter.runtime.ctrl || shouldPreserveImportedStateMoveType(fighter)) {
    return;
  }

  runStateEntrySetupControllers(fighter, opponent, tick);
  if (tryApplyStateEntry(fighter, opponent, tick)) {
    return;
  }

  if (input.has("x") || input.has("y") || input.has("z")) {
    startMove(fighter, "punch");
    return;
  }
  if (input.has("a") || input.has("b") || input.has("c")) {
    startMove(fighter, "kick");
    return;
  }
  if (hasRuntimeDirection(input, "D") && fighter.runtime.stateType !== "A") {
    changeAction(fighter, fighter.definition.crouchAction);
    setRuntimeStateNo(fighter, fighter.definition.crouchAction);
    fighter.runtime.stateType = "C";
    fighter.runtime.physics = "C";
    fighter.runtime.vel.x = 0;
    return;
  }
  if (hasRuntimeDirection(input, "U") && fighter.runtime.stateType !== "A") {
    fighter.runtime.vel.y = fighter.definition.jumpVelocity;
    fighter.runtime.stateType = "A";
    fighter.runtime.physics = "A";
    changeAction(fighter, fighter.definition.jumpAction);
    setRuntimeStateNo(fighter, fighter.definition.jumpAction);
    return;
  }

  const direction = hasRuntimeDirection(input, "F") ? 1 : hasRuntimeDirection(input, "B") ? -1 : 0;
  if (direction !== 0 && fighter.runtime.assertSpecial?.noWalk) {
    fighter.runtime.vel.x = 0;
    return;
  }
  if (direction !== 0 && fighter.runtime.stateType === "A" && !fighter.runtime.assertSpecial?.noWalk) {
    fighter.runtime.vel.x = direction * fighter.runtime.facing * fighter.definition.speed;
    return;
  }
  if (direction !== 0 && !fighter.runtime.assertSpecial?.noWalk) {
    fighter.runtime.vel.x = direction * fighter.runtime.facing * fighter.definition.speed;
    fighter.runtime.stateType = "S";
    fighter.runtime.physics = "S";
    changeAction(fighter, fighter.definition.walkAction);
    setRuntimeStateNo(fighter, fighter.definition.walkAction);
  } else {
    fighter.runtime.vel.x = 0;
    if (fighter.runtime.stateType !== "A") {
      fighter.runtime.stateType = "S";
      fighter.runtime.physics = "S";
      changeAction(fighter, fighter.definition.idleAction);
      setRuntimeStateNo(fighter, fighter.definition.idleAction);
      fighter.runtime.ctrl = true;
    }
  }
}

function handleSimpleAi(fighter: FighterMatchState, opponent: FighterMatchState, tick: number): void {
  if (hasRuntimeStun(fighter) || fighter.currentMove) {
    return;
  }
  if (!fighter.runtime.ctrl || shouldPreserveImportedStateMoveType(fighter)) {
    return;
  }
  fighter.aiCooldown = Math.max(0, fighter.aiCooldown - 1);
  const distance = Math.abs(opponent.runtime.pos.x - fighter.runtime.pos.x);
  if (distance > 110 && !fighter.runtime.assertSpecial?.noWalk) {
    fighter.runtime.vel.x = fighter.runtime.facing * fighter.definition.speed * 0.65;
    changeAction(fighter, fighter.definition.walkAction);
    setRuntimeStateNo(fighter, fighter.definition.walkAction);
  } else {
    fighter.runtime.vel.x = 0;
    if (fighter.aiCooldown === 0) {
      startMove(fighter, tick % 2 === 0 ? "punch" : "kick");
      fighter.aiCooldown = 70;
    } else {
      changeAction(fighter, fighter.definition.idleAction);
      setRuntimeStateNo(fighter, fighter.definition.idleAction);
    }
  }
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
  tick: number,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
): void {
  spriteEffectWorld.tick(fighter.runtime, () => createAfterImageSample(fighter));
  hitEligibilityWorld.tickHitBySlots(fighter.runtime);
  hitOverrideWorld.tickSlots(fighter.runtime);
  advanceContactTimers(fighter);
  fighter.runtime.renderAngle = undefined;
  fighter.stateElapsed += 1;
  actorConstraintWorld.resetFrameConstraints(fighter.runtime);
  recoveryWorld.tickHitFallRecoveryWindow(fighter);
  const tickStartPos = { ...fighter.runtime.pos };
  const stunTick = tickRuntimeStun(fighter);
  if (stunTick.guardActive) {
    if (!fighter.stateOwner && !shouldPreserveImportedStateMoveType(fighter)) {
      changeAction(fighter, fighter.definition.hitstunAction);
    }
  }
  if (stunTick.hitActive) {
    if (!fighter.stateOwner && !shouldPreserveImportedStateMoveType(fighter)) {
      changeAction(fighter, fighter.definition.hitstunAction);
    }
  }

  if (fighter.currentMove) {
    fighter.moveTick += 1;
    const move = fighter.currentMove;
    if (!move.isReversal) {
      fighter.runtime.moveType = "A";
      fighter.runtime.vel.x = 0;
    }
    if (fighter.moveTick > move.startup + move.recovery) {
      const wasReversal = move.isReversal;
      fighter.currentMove = undefined;
      fighter.currentMoveLabel = undefined;
      fighter.moveTick = 0;
      fighter.hasHit = false;
      fighter.runtime.reversal = undefined;
      if (!wasReversal) {
        fighter.runtime.moveType = "I";
        fighter.runtime.ctrl = true;
        setRuntimeStateNo(fighter, fighter.definition.idleAction);
        changeAction(fighter, fighter.definition.idleAction);
      }
    }
  } else if (fighter.hitStun <= 0 && (fighter.runtime.guardStun ?? 0) <= 0 && !shouldPreserveImportedStateMoveType(fighter)) {
    fighter.runtime.moveType = "I";
  }

  fighter.runtime.pos.x += fighter.runtime.vel.x;
  fighter.runtime.pos.y += fighter.runtime.vel.y;
  if (fighter.runtime.stateType === "A") {
    fighter.runtime.vel.y += 0.55;
  }
  if (fighter.runtime.pos.y > 0 && !shouldPreserveImportedStateMoveType(fighter)) {
    fighter.runtime.pos.y = 0;
    fighter.runtime.vel.y = 0;
    fighter.runtime.stateType = "S";
    fighter.runtime.physics = "S";
    if (!fighter.currentMove) {
      changeAction(fighter, fighter.definition.idleAction);
    }
  }

  advanceAnimation(fighter);
  runActiveStateControllers(
    fighter,
    opponent,
    actorConstraintWorld,
    spriteEffectWorld,
    reversalWorld,
    effectSpawnWorld,
    tick,
    onPauseController,
    onEnvColorController,
  );
  recoveryWorld.advanceImportedGroundRecoveryLanding(fighter, {
    canEnterState: (stateId) => canEnterState(fighter, stateId),
    enterState: (stateId) => enterState(fighter, stateId, undefined, { clearStateOwner: true }),
  });
  recoveryWorld.advanceCommon1LieDownRecovery(fighter, {
    canEnterState: (stateId) => canEnterState(fighter, stateId),
    enterState: (stateId) => enterState(fighter, stateId, undefined, { clearStateOwner: true }),
  });
  actorConstraintWorld.preserveFrozenPosition(fighter.runtime, tickStartPos);
}

function startMove(fighter: FighterMatchState, moveName: "punch" | "kick"): void {
  startMoveWithSpec(fighter, fighter.definition.moves[moveName], moveName);
}

function startMoveWithSpec(fighter: FighterMatchState, move: DemoMove, label: string): void {
  fighter.currentMove = move;
  fighter.currentMoveLabel = label;
  fighter.moveTick = 0;
  fighter.hasHit = false;
  fighter.runtime.reversal = undefined;
  fighter.runtime.moveType = "A";
  fighter.runtime.ctrl = false;
  enterState(fighter, move.actionId, move);
}

function changeAction(
  fighter: FighterMatchState,
  actionId: number,
  source: NonNullable<CharacterRuntimeState["animationSource"]> = "self",
  actionOwner: DemoFighterDefinition = fighter.definition,
  elementOptions: AnimationElementOptions = {},
): boolean {
  const action = actionOwner.animations.get(actionId);
  if (!action) {
    return false;
  }
  if (fighter.runtime.animNo === actionId && fighter.runtime.animationSource === source && fighter.currentAction === action) {
    applyAnimationElement(fighter, elementOptions);
    return true;
  }
  fighter.currentAction = action;
  fighter.runtime.animNo = actionId;
  fighter.runtime.animationSource = source;
  fighter.runtime.frameIndex = 0;
  fighter.runtime.animTime = 0;
  fighter.frameElapsed = 0;
  fighter.animationComplete = false;
  applyAnimationElement(fighter, elementOptions);
  return true;
}

function applyAnimationElement(fighter: FighterMatchState, options: AnimationElementOptions): void {
  if (options.elem === undefined) {
    return;
  }
  const frames = fighter.currentAction.frames;
  if (frames.length === 0) {
    return;
  }
  const frameIndex = Math.max(0, Math.min(frames.length - 1, Math.round(options.elem) - 1));
  const frameDuration = Math.max(1, frames[frameIndex]?.duration ?? 1);
  const elemTime = Math.max(0, Math.min(frameDuration - 1, Math.round(options.elemTime ?? 0)));
  fighter.runtime.frameIndex = frameIndex;
  fighter.frameElapsed = elemTime;
  fighter.runtime.animTime = animationElapsedBeforeFrame(fighter.currentAction, frameIndex) + elemTime;
  fighter.animationComplete = false;
}

function animationElapsedBeforeFrame(action: MugenAnimationAction, frameIndex: number): number {
  let elapsed = 0;
  for (let index = 0; index < frameIndex; index += 1) {
    elapsed += Math.max(1, action.frames[index]?.duration ?? 1);
  }
  return elapsed;
}

function enterState(fighter: FighterMatchState, stateId: number, move?: DemoMove, options: EnterStateOptions = {}): void {
  const owner = options.clearStateOwner ? fighter : options.stateOwner ?? fighter.stateOwner ?? fighter;
  const ownerDefinition = owner.definition;
  const state = owner.runtimeProgram?.states.find((candidate) => candidate.id === stateId)?.source ?? ownerDefinition.states?.find((candidate) => candidate.id === stateId);
  const actionId =
    options.animOverride ?? state?.anim ?? move?.actionId ?? (options.preserveAnimationWhenMissing ? undefined : stateId);
  recordStateExecution(fighter, stateId, owner);
  if (!move && fighter.currentMove && fighter.currentMove.actionId !== stateId) {
    fighter.currentMove = undefined;
    fighter.currentMoveLabel = undefined;
    fighter.moveTick = 0;
    fighter.hasHit = false;
    fighter.runtime.reversal = undefined;
  }
  if (owner !== fighter) {
    fighter.stateOwner = owner;
    fighter.runtime.customState = {
      ownerId: owner.id,
      stateNo: stateId,
      getP1State: true,
    };
  } else {
    fighter.stateOwner = undefined;
    fighter.runtime.customState = undefined;
  }
  setRuntimeStateNo(fighter, stateId, { resetElapsed: true });
  fighter.firedHitDefs.clear();
  resetContactState(fighter);
  if (state?.type) {
    fighter.runtime.stateType = normalizeStateType(state.type, fighter.runtime.stateType);
  }
  if (state?.moveType) {
    fighter.runtime.moveType = normalizeMoveType(state.moveType, fighter.runtime.moveType);
  }
  if (state?.physics) {
    fighter.runtime.physics = normalizePhysics(state.physics, fighter.runtime.physics);
  }
  if (state?.ctrl !== undefined) {
    fighter.runtime.ctrl = state.ctrl !== 0;
  }
  if (state?.velSet) {
    fighter.runtime.vel = { x: state.velSet[0], y: state.velSet[1] };
  }
  if (actionId !== undefined) {
    changeAction(fighter, actionId, owner === fighter ? "self" : "state-owner", ownerDefinition, options.animationElement);
  }
}

function advanceAnimation(fighter: FighterMatchState): void {
  const frames = fighter.currentAction.frames;
  if (frames.length === 0) {
    return;
  }
  fighter.runtime.animTime += 1;
  const frame = frames[fighter.runtime.frameIndex];
  fighter.frameElapsed += 1;
  if (fighter.frameElapsed < Math.max(1, frame?.duration ?? 1)) {
    return;
  }
  fighter.frameElapsed = 0;
  const next = fighter.runtime.frameIndex + 1;
  if (next < frames.length) {
    fighter.runtime.frameIndex = next;
    return;
  }
  fighter.animationComplete = true;
  fighter.runtime.frameIndex = fighter.currentAction.loopStart ?? Math.max(0, frames.length - 1);
}

function runHitPauseIgnoredControllers(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  actorConstraintWorld: RuntimeActorConstraintWorld,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  reversalWorld: RuntimeReversalWorld,
  effectSpawnWorld: RuntimeEffectSpawnWorld,
  tick: number,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
): void {
  runActiveStateControllers(
    fighter,
    opponent,
    actorConstraintWorld,
    spriteEffectWorld,
    reversalWorld,
    effectSpawnWorld,
    tick,
    onPauseController,
    onEnvColorController,
    { onlyIgnoreHitPause: true },
  );
}

type ActiveControllerRunOptions = {
  onlyIgnoreHitPause?: boolean;
};

function runActiveStateControllers(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  actorConstraintWorld: RuntimeActorConstraintWorld,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  reversalWorld: RuntimeReversalWorld,
  effectSpawnWorld: RuntimeEffectSpawnWorld,
  tick: number,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
  options: ActiveControllerRunOptions = {},
): void {
  const owner = fighter.stateOwner ?? fighter;
  const stateProgram = owner.runtimeProgram?.states.find((candidate) => candidate.id === fighter.runtime.stateNo);
  const state = stateProgram?.source;
  if (!state || (fighter.definition.source !== "imported" && owner.definition.source !== "imported")) {
    return;
  }

  for (const controller of stateProgram.controllers) {
    if (options.onlyIgnoreHitPause && !controllerIgnoresHitPause(controller)) {
      continue;
    }
    if (!triggersPass(controller, fighter, opponent, owner, tick)) {
      continue;
    }
    const dispatch = dispatchStateProgramController(controller);
    const rawController = controller.source;

    if (dispatch.kind === "change-state") {
      const stateId = resolveDispatchNumber(dispatch.stateId, dispatch.stateExpression, fighter, opponent, owner, tick);
      if (stateId === undefined) {
        continue;
      }
      const animOverride = resolveDispatchNumber(dispatch.animOverride, dispatch.animExpression, fighter, opponent, owner, tick);
      const ctrl = resolveDispatchBoolean(dispatch.ctrl, dispatch.ctrlExpression, fighter, opponent, owner, tick);
      recordControllerExecution(fighter, rawController);
      enterState(fighter, stateId, undefined, {
        clearStateOwner: dispatch.clearStateOwner,
        animOverride,
        preserveAnimationWhenMissing: true,
      });
      if (ctrl !== undefined) {
        fighter.runtime.ctrl = ctrl;
      }
      return;
    }

    if (dispatch.kind === "change-anim") {
      const actionId = resolveDispatchNumber(dispatch.actionId, dispatch.actionExpression, fighter, opponent, owner, tick);
      if (actionId === undefined) {
        continue;
      }
      const elem = resolveDispatchNumber(dispatch.elem, dispatch.elemExpression, fighter, opponent, owner, tick);
      const elemTime = resolveDispatchNumber(dispatch.elemTime, dispatch.elemTimeExpression, fighter, opponent, owner, tick);
      recordControllerExecution(fighter, rawController);
      const animationOwner = dispatch.animationSource === "state-owner" ? owner : fighter;
      changeAction(fighter, actionId, dispatch.animationSource, animationOwner.definition, {
        elem,
        elemTime,
      });
      continue;
    }

    if (dispatch.kind === "runtime-controller") {
      recordControllerExecution(fighter, rawController);
      fighter.runtime = executeControllerIr(controller, fighter.runtime, () => undefined, {
        getConst: (name) => runtimeConst(owner.definition, name),
        hitPauseTime: () => fighter.hitPause,
        random: () => nextRuntimeRandom(fighter),
        stageTime: tick,
      });
      if (controller.operation) {
        recordControllerOperation(fighter, controller.operation);
      }
      continue;
    }

    if (dispatch.kind === "side-effect") {
      if (dispatch.effect === "hitdef") {
        activateHitDef(fighter, rawController, controller.operation?.kind === "hitdef" ? controller.operation : undefined);
      } else if (dispatch.effect === "reversaldef") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "reversaldef" ? controller.operation : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        activateReversalDef(fighter, rawController, reversalWorld, operation);
      } else if (dispatch.effect === "width") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "collision" && controller.operation.controllerType === "width" ? controller.operation : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        actorConstraintWorld.applyWidth(fighter.runtime, rawController, operation);
      } else if (dispatch.effect === "fallenvshake") {
        recordControllerExecution(fighter, rawController);
        recordFallEnvShakeEvent(
          fighter,
          tick,
          controller.operation?.kind === "fallenvshake" ? controller.operation : undefined,
        );
      } else if (dispatch.effect === "sprpriority") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === "sprpriority"
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applySprPriorityController(fighter, spriteEffectWorld, rawController, operation);
      } else if (dispatch.effect === "palfx") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === "palfx"
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyPalFxController(fighter, spriteEffectWorld, rawController, operation);
      } else if (dispatch.effect === "afterimage") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === "afterimage"
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyAfterImageController(fighter, spriteEffectWorld, rawController, operation);
      } else if (dispatch.effect === "afterimagetime") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === "afterimagetime"
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyAfterImageTimeController(fighter, spriteEffectWorld, rawController, operation);
      } else if (dispatch.effect === "angle") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" &&
          (controller.operation.controllerType === "angleset" ||
            controller.operation.controllerType === "angleadd" ||
            controller.operation.controllerType === "angledraw")
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyAngleController(fighter, spriteEffectWorld, rawController, operation);
      } else if (dispatch.effect === "explod") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "explod" ? controller.operation : undefined;
        if (effectSpawnWorld.spawnExplod(fighter, opponent, rawController, operation) && operation) {
          recordControllerOperation(fighter, operation);
        }
      } else if (dispatch.effect === "removeexplod") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "removeexplod" ? controller.operation : undefined;
        if (effectSpawnWorld.removeExplods(fighter, rawController, operation) && operation) {
          recordControllerOperation(fighter, operation);
        }
      } else if (dispatch.effect === "modifyexplod") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "modifyexplod" ? controller.operation : undefined;
        if (effectSpawnWorld.modifyExplods(fighter, rawController, operation) > 0 && operation) {
          recordControllerOperation(fighter, operation);
        }
      } else if (dispatch.effect === "helper") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "helper" ? controller.operation : undefined;
        if (effectSpawnWorld.spawnHelper(fighter, opponent, rawController, operation) && operation) {
          recordControllerOperation(fighter, operation);
        }
      } else if (dispatch.effect === "projectile") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "projectile" ? controller.operation : undefined;
        if (effectSpawnWorld.spawnProjectile(fighter, opponent, rawController, operation) && operation) {
          recordControllerOperation(fighter, operation);
        }
      } else if (dispatch.effect === "modifyprojectile") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "modifyprojectile" ? controller.operation : undefined;
        if (effectSpawnWorld.modifyProjectiles(fighter, rawController, operation) > 0 && operation) {
          recordControllerOperation(fighter, operation);
        }
      } else if (dispatch.effect === "target") {
        recordControllerExecution(fighter, rawController);
        applyTargetController(fighter, opponent, rawController, controller.operation?.kind === "target" ? controller.operation : undefined);
      } else if (dispatch.effect === "bindtotarget") {
        recordControllerExecution(fighter, rawController);
        applyBindToTargetController(fighter, opponent, rawController, controller.operation?.kind === "bindtotarget" ? controller.operation : undefined);
      } else if (dispatch.effect === "pause") {
        recordControllerExecution(fighter, rawController);
        onPauseController?.(fighter, rawController, controller.operation?.kind === "pause" ? controller.operation : undefined);
      } else if (dispatch.effect === "sound") {
        recordControllerExecution(fighter, rawController);
        recordSoundEvent(fighter, rawController, tick);
      } else if (dispatch.effect === "envcolor") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "envcolor" ? controller.operation : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        onEnvColorController?.(rawController, operation);
      } else if (dispatch.effect === "envshake") {
        recordControllerExecution(fighter, rawController);
        recordEnvShakeEvent(fighter, rawController, tick);
      } else if (dispatch.effect === "contact") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "contact" ? controller.operation : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        if (rawController.type.toLowerCase() === "hitadd") {
          applyHitAddController(fighter, rawController, operation?.controllerType === "hitadd" ? operation : undefined);
        } else {
          resetMoveContactState(fighter);
        }
      }
    }
  }
}

function controllerIgnoresHitPause(controller: ControllerIr): boolean {
  return (firstNumber(findParam(controller, "ignorehitpause")) ?? 0) !== 0;
}

function applyPreFacingAssertSpecial(fighter: FighterMatchState, opponent: FighterMatchState, tick: number): void {
  const owner = fighter.stateOwner ?? fighter;
  const stateProgram = owner.runtimeProgram?.states.find((candidate) => candidate.id === fighter.runtime.stateNo);
  const state = stateProgram?.source;
  if (!state || (fighter.definition.source !== "imported" && owner.definition.source !== "imported")) {
    return;
  }

  for (const controller of stateProgram.controllers) {
    if (controller.normalizedType !== "assertspecial" || !triggersPass(controller, fighter, opponent, owner, tick)) {
      continue;
    }
    fighter.runtime = executeControllerIr(controller, fighter.runtime, () => undefined, {
      getConst: (name) => runtimeConst(owner.definition, name),
      hitPauseTime: () => fighter.hitPause,
      random: () => nextRuntimeRandom(fighter),
      stageTime: tick,
    });
  }
}

function applySprPriorityController(
  fighter: FighterMatchState,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "sprpriority" }>,
): void {
  spriteEffectWorld.applySpritePriority(fighter.runtime, controller, operation);
}

function applyPalFxController(
  fighter: FighterMatchState,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "palfx" }>,
): void {
  spriteEffectWorld.applyPaletteFx(fighter.runtime, controller, operation);
}

function applyAfterImageController(
  fighter: FighterMatchState,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimage" }>,
): void {
  spriteEffectWorld.applyAfterImage(fighter.runtime, controller, () => createAfterImageSample(fighter), operation);
}

function applyAfterImageTimeController(
  fighter: FighterMatchState,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimagetime" }>,
): void {
  spriteEffectWorld.applyAfterImageTime(fighter.runtime, controller, operation);
}

function applyAngleController(
  fighter: FighterMatchState,
  spriteEffectWorld: RuntimeSpriteEffectWorld,
  controller: MugenStateController,
  operation?: RuntimeAngleSpriteEffectOp,
): void {
  spriteEffectWorld.applyAngle(fighter.runtime, controller, operation);
}

function createAfterImageSample(fighter: FighterMatchState): RuntimeAfterImageSample | undefined {
  const frame = getCurrentFrame(fighter);
  if (!frame) {
    return undefined;
  }
  return {
    age: 0,
    pos: { ...fighter.runtime.pos },
    facing: fighter.runtime.facing,
    ...spriteOwnerSnapshot(fighter),
    spriteGroup: frame.spriteGroup,
    spriteIndex: frame.spriteIndex,
    offsetX: frame.offsetX,
    offsetY: frame.offsetY,
  };
}

function applyTargetController(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  controller: MugenStateController,
  operation?: TargetControllerOp,
): void {
  fighter.targetWorld.applyController({
    actor: fighter,
    candidateTargets: [opponent],
    controller,
    operation,
    onOperation: (executedOperation) => recordControllerOperation(fighter, executedOperation),
    scaleIncomingDamage: scaleRuntimeIncomingDamage,
    enterTargetState: (target, stateId) => {
      const controllerOwner = fighter.stateOwner ?? fighter;
      if (canEnterState(target, stateId, controllerOwner)) {
        enterState(target, stateId, undefined, { stateOwner: controllerOwner });
      }
    },
  });
}

function applyBindToTargetController(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  controller: MugenStateController,
  operation?: BindToTargetControllerOp,
): void {
  fighter.targetWorld.applyBindToTargetController({
    actor: fighter,
    candidateTargets: [opponent],
    controller,
    operation,
    targetAnchor: bindToTargetAnchor,
    onOperation: (executedOperation) => recordControllerOperation(fighter, executedOperation),
  });
}

function canEnterState(target: FighterMatchState, stateId: number, owner: FighterMatchState = target): boolean {
  return Boolean(
    owner.runtimeProgram?.states.some((state) => state.id === stateId) ||
      owner.definition.states?.some((state) => state.id === stateId) ||
      owner.definition.animations.has(stateId),
  );
}

function advanceTargetMemory(fighter: FighterMatchState): void {
  fighter.targetWorld.advance(fighter);
}

function applyTargetBindings(fighter: FighterMatchState, opponent: FighterMatchState): void {
  fighter.targetWorld.applyTargetBindings(fighter, [opponent]);
}

function applyBindToTarget(fighter: FighterMatchState, opponent: FighterMatchState): void {
  fighter.targetWorld.applyBindToTarget(fighter, [opponent]);
}

function bindToTargetAnchor(target: FighterMatchState, postype: RuntimeTargetPostype): { x: number; y: number } {
  if (postype === "foot") {
    return { x: 0, y: 0 };
  }
  const key = postype === "head" ? "size.head.pos" : "size.mid.pos";
  return {
    x: runtimeConst(target.definition, `${key}.x`) ?? runtimeConst(target.definition, key) ?? 0,
    y: runtimeConst(target.definition, `${key}.y`) ?? 0,
  };
}

function rememberTarget(attacker: FighterMatchState, defender: FighterMatchState, targetId: number | undefined): void {
  attacker.targetWorld.remember(attacker, defender.id, targetId);
}

function resetContactState(fighter: FighterMatchState): void {
  fighter.contact = fighter.contactWorld.create();
}

function resetMoveContactState(fighter: FighterMatchState): void {
  fighter.contactWorld.resetMoveContact(fighter.contact);
}

function applyHitAddController(
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: Extract<ContactControllerOp, { controllerType: "hitadd" }>,
): void {
  const value = operation?.value ?? firstNumber(findParam(controller, "value"));
  if (value === undefined) {
    return;
  }
  fighter.contactWorld.applyHitAdd(fighter.contact, fighter.runtime.stateNo, value);
}

function markReceivedDamage(fighter: FighterMatchState, damage: number): void {
  fighter.contactWorld.markReceivedDamage(fighter.contact, fighter.runtime.stateNo, damage);
}

function markProjectileContact(fighter: FighterMatchState, projectileId: number | undefined, kind: "hit" | "guard"): void {
  fighter.contactWorld.markProjectileContact(fighter.contact, fighter.runtime.stateNo, projectileId, kind);
}

function advanceContactTimers(fighter: FighterMatchState): void {
  fighter.contactWorld.advance(fighter.contact);
}

function moveContactValue(fighter: FighterMatchState, kind: "contact" | "hit" | "guard"): number {
  return fighter.contactWorld.moveContactValue(fighter.contact, fighter.runtime.stateNo, kind);
}

function moveHitCountValue(fighter: FighterMatchState, unique: boolean): number {
  return fighter.contactWorld.moveHitCountValue(fighter.contact, fighter.runtime.stateNo, unique);
}

function moveReversedValue(fighter: FighterMatchState): number {
  return fighter.contactWorld.moveReversedValue(fighter.contact, fighter.runtime.stateNo);
}

function receivedDamageValue(fighter: FighterMatchState): number {
  return fighter.contactWorld.receivedDamageValue(fighter.contact, fighter.runtime.stateNo);
}

function receivedHitsValue(fighter: FighterMatchState): number {
  return fighter.contactWorld.receivedHitsValue(fighter.contact, fighter.runtime.stateNo);
}

function hasProjectileContact(fighter: FighterMatchState, kind: "contact" | "hit" | "guard", projectileId?: number): boolean {
  return fighter.contactWorld.hasProjectileContact(fighter.contact, fighter.runtime.stateNo, kind, projectileId);
}

function projectileContactTime(fighter: FighterMatchState, kind: "contact" | "hit" | "guard", projectileId?: number): number {
  return fighter.contactWorld.projectileContactTime(fighter.contact, fighter.runtime.stateNo, kind, projectileId);
}

function countRuntimeTargets(fighter: FighterMatchState, targetId?: number): number {
  return fighter.targetWorld.count(fighter, targetId);
}

function countRuntimeExplods(fighter: FighterMatchState, explodId?: number): number {
  return fighter.effectActorWorld.countExplods(fighter.id, explodId);
}

function countRuntimeHelpers(fighter: FighterMatchState, helperId?: number): number {
  return fighter.effectActorWorld.countHelpers(fighter.id, helperId);
}

function countRuntimeProjectiles(fighter: FighterMatchState, projectileId?: number): number {
  return fighter.effectActorWorld.countProjectiles(fighter.id, projectileId);
}

function resolveProjectileCombat(
  attacker: FighterMatchState,
  defender: FighterMatchState,
  hitOverrideWorld: RuntimeHitOverrideWorld,
  effectLifecycleWorld: RuntimeEffectLifecycleWorld,
  guardWorld: RuntimeGuardWorld,
  getHitStateWorld: RuntimeGetHitStateWorld,
  log: (line: string) => void,
): void {
  const hurtBoxes = getCurrentFrame(defender)?.clsn2 ?? [{ x1: -24, y1: -96, x2: 24, y2: 0 }];
  attacker.effectActorWorld.resolveProjectileCombat(attacker.id, {
    attacker,
    defender,
    hurtBoxes,
    holdingBack: isRuntimeHoldingBack(defender.currentInput),
    log,
    rememberTarget,
    applyHitOverride: (source, target, override, hitPause, logger) =>
      applyHitOverride(source, target, override, hitPause, hitOverrideWorld, logger),
    applyGuardHit: (target) => applyDefaultGuardHitState(target, guardWorld),
    applyHitState: (target) => applyDefaultProjectileGetHitState(target, getHitStateWorld),
    markDefenderGotHit: (target) => effectLifecycleWorld.markGetHit(target),
    recordProjectileContact: (source, _target, projectile, kind) => markProjectileContact(source, projectile.projectileId, kind),
    recordReceivedDamage: markReceivedDamage,
  });
}

function resolveProjectileClashes(left: FighterMatchState, right: FighterMatchState, log: (line: string) => void): void {
  left.effectActorWorld.resolveProjectileClashes(left.id, right.id, {
    leftLabel: left.label,
    rightLabel: right.label,
    log,
  });
}

function recordSoundEvent(
  fighter: FighterMatchState,
  controller: MugenStateController,
  runtimeTick: number,
): void {
  fighter.audioWorld.emitController(fighter, controller, runtimeTick);
}

function recordEnvShakeEvent(fighter: FighterMatchState, controller: MugenStateController, runtimeTick: number): void {
  fighter.envShakeWorld.emitController(fighter, controller, runtimeTick);
}

function activateHitDef(fighter: FighterMatchState, controller: MugenStateController, operation?: HitDefControllerOp): void {
  const frame = getCurrentFrame(fighter);
  const key = `${fighter.runtime.stateNo}:${controller.line}:${fighter.runtime.frameIndex}`;
  if (fighter.firedHitDefs.has(key)) {
    return;
  }
  fighter.firedHitDefs.add(key);
  recordControllerExecution(fighter, controller);
  if (operation) {
    recordControllerOperation(fighter, operation);
  }
  const existing = fighter.currentMove;
  const activeStart = fighter.moveTick;
  const activeEnd = activeStart + Math.max(1, (frame?.duration ?? 1) - fighter.frameElapsed);
  const damage = operation?.damage ?? firstNumber(findParam(controller, "damage")) ?? existing?.damage ?? 45;
  const guardDamage = operation?.guardDamage ?? secondNumber(findParam(controller, "damage")) ?? existing?.guardDamage ?? 0;
  const kill = operation?.kill ?? booleanHitDefParam(controller, "kill") ?? existing?.kill ?? true;
  const guardKill = operation?.guardKill ?? booleanHitDefParam(controller, "guard.kill") ?? existing?.guardKill ?? true;
  const hitPause = operation?.pauseTime ?? firstNumber(findParam(controller, "pausetime")) ?? existing?.hitPause ?? (damage >= 60 ? 9 : 7);
  const hitStun = operation?.groundHitTime ?? firstNumber(findParam(controller, "ground.hittime")) ?? existing?.hitStun ?? (damage >= 60 ? 28 : 22);
  const priority = clampHitDefPriority(operation?.priority ?? firstNumber(findParam(controller, "priority")) ?? existing?.priority ?? 4);
  const groundVelocity = operation?.groundVelocity ?? velocityPair(findParam(controller, "ground.velocity"));
  const push = Math.abs(groundVelocity?.[0] ?? existing?.push ?? (damage >= 60 ? 30 : 20));
  const guardPause =
    operation?.guardPauseTime ?? firstNumber(findParam(controller, "guard.pausetime")) ?? existing?.guardPause ?? Math.max(1, Math.round(hitPause * 0.75));
  const guardStun =
    operation?.guardHitTime ?? firstNumber(findParam(controller, "guard.hittime")) ?? existing?.guardStun ?? Math.max(1, Math.round(hitStun * 0.55));
  const guardSlideTime = operation?.guardSlideTime ?? firstNumber(findParam(controller, "guard.slidetime")) ?? existing?.guardSlideTime;
  const guardControlTime = operation?.guardControlTime ?? firstNumber(findParam(controller, "guard.ctrltime")) ?? existing?.guardControlTime;
  const guardVelocity = operation?.guardVelocity ?? velocityPair(findParam(controller, "guard.velocity"));
  const guardDistance =
    operation?.guardDistance ?? firstNumber(findParam(controller, "guard.dist")) ?? existing?.guardDistance ?? DEFAULT_RUNTIME_GUARD_DISTANCE;
  const guardPush =
    Math.abs(guardVelocity?.[0] ?? existing?.guardPush ?? Math.max(1, Math.round(push * 0.55)));
  const groundType = operation?.groundType ?? hitType(findParam(controller, "ground.type") ?? findParam(controller, "type")) ?? existing?.hitVars?.groundType ?? 1;
  const airType = operation?.airType ?? hitType(findParam(controller, "air.type")) ?? existing?.hitVars?.airType ?? groundType;
  const animType =
    operation?.fallAnimType ??
    hitAnimType(findParam(controller, "fall.animtype")) ??
    operation?.animType ??
    hitAnimType(findParam(controller, "animtype")) ??
    existing?.hitVars?.animType ??
    0;
  const p1StateNo = operation?.p1StateNo ?? firstNumber(findParam(controller, "p1stateno"));
  const p2StateNo = operation?.p2StateNo ?? firstNumber(findParam(controller, "p2stateno"));
  const p2GetP1State = operation?.p2GetP1State ?? (p2StateNo !== undefined ? (firstNumber(findParam(controller, "p2getp1state")) ?? 1) !== 0 : false);
  const fallbackHitbox = existing?.hitbox ?? { x1: 14, y1: -72, x2: 78, y2: -38 };
  fighter.currentMove = {
    actionId: fighter.runtime.stateNo,
    startup: existing?.startup ?? 0,
    activeStart,
    activeEnd,
    recovery: Math.max(existing?.recovery ?? 0, activeEnd + 12),
    damage,
    kill,
    priority,
    requiresHitDef: false,
    attr: operation?.attr ?? stripMugenString(findParam(controller, "attr")) ?? existing?.attr ?? "S,NA",
    targetId: operation?.id ?? firstNumber(findParam(controller, "id")) ?? existing?.targetId,
    hitPause,
    hitStun,
    push,
    hitVelocityY: groundVelocity?.[1] ?? existing?.hitVelocityY,
    hitVars: { animType, groundType, airType },
    guardDistance,
    guardFlag: operation?.guardFlag ?? stripMugenString(findParam(controller, "guardflag")) ?? existing?.guardFlag ?? "MA",
    guardDamage,
    guardKill,
    guardPause,
    guardStun,
    guardSlideTime,
    guardControlTime,
    guardPush,
    guardVelocityY: guardVelocity?.[1] ?? existing?.guardVelocityY,
    hitSound: operation?.hitSound ?? stripMugenString(findParam(controller, "hitsound")) ?? existing?.hitSound,
    guardSound: operation?.guardSound ?? stripMugenString(findParam(controller, "guardsound")) ?? existing?.guardSound,
    hitSpark: operation?.hitSpark ?? stripMugenString(findParam(controller, "sparkno")) ?? existing?.hitSpark,
    guardSpark: operation?.guardSpark ?? stripMugenString(findParam(controller, "guard.sparkno")) ?? existing?.guardSpark,
    sparkXy: operation?.sparkXy ? normalizeSparkOffset(operation.sparkXy) : numberPair(findParam(controller, "sparkxy")) ?? existing?.sparkXy,
    p1StateNo,
    p2StateNo,
    p2GetP1State,
    fall: buildMoveFallData(controller, existing, operation),
    hitbox: cloneBox(frame?.clsn1[0] ?? fallbackHitbox),
  };
  fighter.currentMoveLabel = controller.name ?? "HitDef";
  fighter.hasHit = false;
  fighter.runtime.reversal = undefined;
  fighter.runtime.moveType = "A";
  fighter.runtime.ctrl = false;
}

function activateReversalDef(
  fighter: FighterMatchState,
  controller: MugenStateController,
  reversalWorld: RuntimeReversalWorld,
  operation?: ReversalDefControllerOp,
): void {
  const attr = (operation?.attr ?? stripMugenString(findParam(controller, "reversal.attr")))?.trim() ?? "";
  const frame = getCurrentFrame(fighter);
  const hitPause = operation?.hitPause ?? Math.max(0, Math.round(firstNumber(findParam(controller, "pausetime")) ?? 0));
  const p1StateNo = operation?.p1StateNo ?? firstNumber(findParam(controller, "p1stateno"));
  const p2StateNo = operation?.p2StateNo ?? firstNumber(findParam(controller, "p2stateno"));
  const targetId = operation?.targetId ?? firstNumber(findParam(controller, "id"));
  reversalWorld.activate(fighter, {
    attr,
    hitbox: frame?.clsn1[0],
    label: controller.name ?? "ReversalDef",
    hitPause,
    p1StateNo,
    p2StateNo,
    targetId,
  });
}

function resolveCombat(
  attacker: FighterMatchState,
  defender: FighterMatchState,
  directCombatWorld: RuntimeDirectCombatWorld,
  hitOverrideWorld: RuntimeHitOverrideWorld,
  reversalWorld: RuntimeReversalWorld,
  guardWorld: RuntimeGuardWorld,
  getHitStateWorld: RuntimeGetHitStateWorld,
  runtimeTick: number,
  log: (line: string) => void,
): void {
  if (!attacker.currentMove || attacker.hasHit) {
    return;
  }
  const move = attacker.currentMove;
  if (move.requiresHitDef) {
    return;
  }
  if (move.isReversal) {
    return;
  }
  if (!isMoveActive(move, attacker.moveTick)) {
    return;
  }
  const attackBox = runtimeWorldBox(attacker.runtime, move.hitbox);
  const reversal = reversalWorld.findActive(defender, move, attackBox, {
    isMoveActive,
    worldBox: runtimeWorldBox,
    boxesIntersect: collisionBoxesIntersect,
    attrMatches: hitAttributeMatches,
  });
  if (reversal) {
    const outcome = reversalWorld.apply(defender, attacker, reversal, {
      rememberTarget,
      canEnterState: (target, stateNo) => canEnterState(target, stateNo),
      enterState: (target, stateNo) => enterState(target, stateNo),
      enterTargetHitState: (target, owner, stateNo, getP1State) => {
        enterTargetHitState(target, owner, stateNo, getP1State);
      },
    });
    log(outcome.message);
    return;
  }
  const hurtBoxes = getCurrentFrame(defender)?.clsn2 ?? [{ x1: -24, y1: -96, x2: 24, y2: 0 }];
  if (!hasRuntimeBoxContact(attackBox, defender.runtime, hurtBoxes)) {
    return;
  }
  if (!canRuntimeBeHitBy(defender.runtime, move.attr ?? "S,NA")) {
    log(`${defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via HitBy/NotHitBy`);
    return;
  }

  const override = findRuntimeHitOverride(defender.runtime, move.attr ?? "S,NA");
  if (override) {
    attacker.hasHit = true;
    rememberTarget(attacker, defender, move.targetId);
    const result = hitOverrideWorld.applyRedirect(attacker, defender, override, move.hitPause, {
      tryEnterState: (target, stateNo) => {
        if (!canEnterState(target, stateNo)) {
          return false;
        }
        enterState(target, stateNo);
        return true;
      },
    });
    log(result.message);
    return;
  }

  attacker.hasHit = true;
  rememberTarget(attacker, defender, move.targetId);
  const result = resolveRuntimeCombatHit({
    attacker: attacker.runtime,
    defender: defender.runtime,
    attack: move,
    holdingBack: isRuntimeHoldingBack(defender.currentInput),
  });
  const outcome = directCombatWorld.applyResolvedHit(attacker, defender, move, result, {
    applyGuardHit: (target) => applyDefaultGuardHitState(target, guardWorld),
    applyHitStateTransitions,
    applyDefaultGetHit: (target, moveArg) => applyDefaultGetHitState(target, moveArg, getHitStateWorld),
  });
  recordHitDefSoundEvent(attacker, outcome.kind === "guard" ? move.guardSound : move.hitSound, runtimeTick);
  recordHitDefEffectEvent(attacker, outcome.kind, move, runtimeTick);
  log(outcome.message);
}

function recordHitDefSoundEvent(fighter: FighterMatchState, sound: string | undefined, runtimeTick: number): void {
  fighter.audioWorld.emitHitDefSound(fighter, sound, runtimeTick);
}

function recordHitDefEffectEvent(fighter: FighterMatchState, kind: "hit" | "guard", move: DemoMove, runtimeTick: number): void {
  const spark = kind === "guard" ? move.guardSpark : move.hitSpark;
  const assetFrames = resolveRuntimeHitSparkAssetFrames(fighter, spark);
  fighter.hitEffectWorld.emitHitDefEffect(fighter, kind, spark, move.sparkXy, runtimeTick, assetFrames[0], assetFrames);
}

function recordFallEnvShakeEvent(
  fighter: FighterMatchState,
  runtimeTick: number,
  operation?: FallEnvShakeControllerOp,
): void {
  const hitFall = fighter.runtime.hitFall;
  const event = fighter.envShakeWorld.emitFall(fighter, runtimeTick);
  if (!event || !hitFall) {
    return;
  }
  fighter.runtime.hitFall = {
    ...hitFall,
    envShake: undefined,
  };
  if (operation) {
    recordControllerOperation(fighter, operation);
  }
}

function buildMoveFallData(controller: MugenStateController, existing?: DemoMove, operation?: HitDefControllerOp): DemoMove["fall"] | undefined {
  const enabled =
    (operation?.fall.enabled === undefined ? undefined : operation.fall.enabled ? 1 : 0) ??
    firstNumber(findParam(controller, "fall")) ??
    firstNumber(findParam(controller, "air.fall")) ??
    firstNumber(findParam(controller, "ground.fall"));
  const damage = operation?.fall.damage ?? firstNumber(findParam(controller, "fall.damage")) ?? existing?.fall?.damage;
  const defenceUp = operation?.fall.defenceUp ?? firstNumber(findParam(controller, "fall.defence_up")) ?? existing?.fall?.defenceUp;
  const kill = operation?.fall.kill ?? booleanHitDefParam(controller, "fall.kill") ?? existing?.fall?.kill ?? true;
  const xVelocity = operation?.fall.xVelocity ?? firstNumber(findParam(controller, "fall.xvelocity")) ?? existing?.fall?.velocity?.x;
  const yVelocity = operation?.fall.yVelocity ?? firstNumber(findParam(controller, "fall.yvelocity")) ?? existing?.fall?.velocity?.y;
  const envShakeTime = operation?.fall.envShakeTime ?? firstNumber(findParam(controller, "fall.envshake.time")) ?? existing?.fall?.envShake?.time;
  const envShakeFreq = operation?.fall.envShakeFrequency ?? firstNumber(findParam(controller, "fall.envshake.freq")) ?? existing?.fall?.envShake?.freq;
  const envShakeAmpl = operation?.fall.envShakeAmplitude ?? firstNumber(findParam(controller, "fall.envshake.ampl")) ?? existing?.fall?.envShake?.ampl;
  const envShakePhase = operation?.fall.envShakePhase ?? firstNumber(findParam(controller, "fall.envshake.phase")) ?? existing?.fall?.envShake?.phase;
  const recover = operation?.fall.recover === undefined ? firstNumber(findParam(controller, "fall.recover")) : operation.fall.recover ? 1 : 0;
  const recoverTime = operation?.fall.recoverTime ?? firstNumber(findParam(controller, "fall.recovertime")) ?? existing?.fall?.recoverTime;
  const downRecover =
    operation?.fall.downRecover === undefined ? firstNumber(findParam(controller, "down.recover")) : operation.fall.downRecover ? 1 : 0;
  const downRecoverTime =
    operation?.fall.downRecoverTime ?? firstNumber(findParam(controller, "down.recovertime")) ?? existing?.fall?.downRecoverTime;
  const hasAny =
    enabled !== undefined ||
    damage !== undefined ||
    defenceUp !== undefined ||
    operation?.fall.kill !== undefined ||
    findParam(controller, "fall.kill") !== undefined ||
    xVelocity !== undefined ||
    yVelocity !== undefined ||
    envShakeTime !== undefined ||
    recover !== undefined ||
    recoverTime !== undefined ||
    downRecover !== undefined ||
    downRecoverTime !== undefined;
  if (!hasAny) {
    return existing?.fall;
  }
  return {
    enabled: enabled !== undefined ? enabled !== 0 : existing?.fall?.enabled ?? false,
    damage,
    defenceUp,
    kill,
    velocity: xVelocity !== undefined || yVelocity !== undefined ? { x: xVelocity, y: yVelocity } : existing?.fall?.velocity,
    recover: recover !== undefined ? recover !== 0 : existing?.fall?.recover,
    recoverTime,
    downRecover: downRecover !== undefined ? downRecover !== 0 : existing?.fall?.downRecover,
    downRecoverTime,
    envShake:
      envShakeTime !== undefined
        ? {
            time: envShakeTime,
            freq: envShakeFreq ?? 60,
            ampl: envShakeAmpl ?? -4,
            phase: envShakePhase ?? 0,
          }
        : existing?.fall?.envShake,
  };
}

function applyHitOverride(
  attacker: FighterMatchState,
  defender: FighterMatchState,
  override: RuntimeHitOverrideSlot,
  hitPause: number,
  hitOverrideWorld: RuntimeHitOverrideWorld,
  log: (line: string) => void,
): void {
  const result = hitOverrideWorld.applyRedirect(attacker, defender, override, hitPause, {
    tryEnterState: (target, stateNo) => {
      if (!canEnterState(target, stateNo)) {
        return false;
      }
      enterState(target, stateNo);
      return true;
    },
  });
  log(result.message);
}

function applyHitStateTransitions(attacker: FighterMatchState, defender: FighterMatchState, move: DemoMove): void {
  if (move.p2StateNo !== undefined) {
    enterTargetHitState(defender, attacker, move.p2StateNo, move.p2GetP1State ?? true);
  }
  if (move.p1StateNo !== undefined && canEnterState(attacker, move.p1StateNo)) {
    enterState(attacker, move.p1StateNo);
  }
}

function applyDefaultGetHitState(defender: FighterMatchState, move: DemoMove, getHitStateWorld: RuntimeGetHitStateWorld): void {
  if (move.p2StateNo !== undefined || defender.definition.source !== "imported") {
    return;
  }
  const stateNo =
    move.defaultTargetStateNo ??
    getHitStateWorld.defaultGetHitStateNo(defender.runtime, (candidate) => canEnterState(defender, candidate));
  if (stateNo === undefined || !canEnterState(defender, stateNo)) {
    return;
  }
  enterState(defender, stateNo, undefined, { clearStateOwner: true });
}

function applyDefaultGuardHitState(defender: FighterMatchState, guardWorld: RuntimeGuardWorld): void {
  if (defender.definition.source !== "imported") {
    return;
  }
  const stateNo = guardWorld.defaultGuardHitStateNo(defender.runtime, (candidate) => canEnterState(defender, candidate));
  if (stateNo === undefined || !canEnterState(defender, stateNo)) {
    return;
  }
  enterState(defender, stateNo, undefined, { clearStateOwner: true });
}

function applyDefaultProjectileGetHitState(defender: FighterMatchState, getHitStateWorld: RuntimeGetHitStateWorld): void {
  if (defender.definition.source !== "imported") {
    return;
  }
  const stateNo = getHitStateWorld.defaultGetHitStateNo(defender.runtime, (candidate) => canEnterState(defender, candidate));
  if (stateNo === undefined || !canEnterState(defender, stateNo)) {
    return;
  }
  enterState(defender, stateNo, undefined, { clearStateOwner: true });
}

function applyAutoGuardStart(defender: FighterMatchState, attacker: FighterMatchState, guardWorld: RuntimeGuardWorld): void {
  if (defender.definition.source !== "imported") {
    return;
  }
  if (
    !guardWorld.canAttemptAutoGuardStart(defender.currentInput, defender.runtime, {
      currentMoveActive: Boolean(defender.currentMove),
      hitPause: defender.hitPause,
      hitStun: defender.hitStun,
    })
  ) {
    return;
  }
  if (!evaluateRuntimeInGuardDist(defender, attacker)) {
    return;
  }
  const stateNo = guardWorld.defaultGuardStartStateNo(defender.runtime, (candidate) => canEnterState(defender, candidate));
  if (stateNo === undefined || !canEnterState(defender, stateNo)) {
    return;
  }
  enterState(defender, stateNo, undefined, { clearStateOwner: true });
  guardWorld.applyAutoGuardStart(defender.runtime);
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

function enterTargetHitState(target: FighterMatchState, owner: FighterMatchState, stateId: number, getP1State: boolean): boolean {
  const stateOwner = getP1State ? owner : target;
  if (!canEnterState(target, stateId, stateOwner)) {
    return false;
  }
  enterState(target, stateId, undefined, { stateOwner: getP1State ? owner : undefined, clearStateOwner: !getP1State });
  if (getP1State && target.runtime.customState) {
    target.runtime.customState.getP1State = true;
  }
  return true;
}

function isMoveActive(move: DemoMove, tick: number): boolean {
  return tick >= move.activeStart && tick <= move.activeEnd;
}

function isMoveInGuardDistanceWindow(move: DemoMove, tick: number): boolean {
  return tick >= Math.max(0, move.activeStart - 1) && tick <= move.activeEnd;
}

function evaluateRuntimeInGuardDist(fighter: FighterMatchState, opponent: FighterMatchState): boolean {
  const move = opponent.currentMove;
  if (!move || opponent.hasHit || !isMoveInGuardDistanceWindow(move, opponent.moveTick)) {
    return false;
  }
  if (
    !isRuntimeGuarding(true, fighter.runtime.moveType, fighter.runtime.stateType, move.guardFlag ?? "MA", {
      defenderAssertSpecial: fighter.runtime.assertSpecial,
      attackUnguardable: opponent.runtime.assertSpecial?.unguardable,
    })
  ) {
    return false;
  }
  const hurtBoxes = getCurrentFrame(fighter)?.clsn2 ?? [{ x1: -24, y1: -96, x2: 24, y2: 0 }];
  return hasRuntimeGuardDistance(
    opponent.runtime,
    move.hitbox,
    fighter.runtime,
    hurtBoxes,
    move.guardDistance ?? DEFAULT_RUNTIME_GUARD_DISTANCE,
  );
}

function toSnapshot(fighter: FighterMatchState): ActorSnapshot {
  const frame = getCurrentFrame(fighter);
  const move = fighter.currentMove;
  const activeHitbox = move && isMoveActive(move, fighter.moveTick) ? [move.hitbox] : frame?.clsn1 ?? [];
  const targetSnapshot = fighter.targetWorld.snapshot(fighter);
  return {
    id: fighter.id,
    label: fighter.label,
    actorKind: "player",
    ownerId: fighter.id,
    rootId: fighter.id,
    parentId: fighter.id,
    source: fighter.definition.source ?? "demo",
    ...spriteOwnerSnapshot(fighter),
    hitPause: fighter.hitPause,
    runtime: {
      ...structuredClone(fighter.runtime),
      targetCount: fighter.targetWorld.count(fighter),
      targetRefs: targetSnapshot.targets,
      targetBindings: targetSnapshot.bindings,
      ...(fighter.bindToTarget
        ? {
            bindToTarget: {
              actorId: fighter.bindToTarget.actorId,
              targetId: fighter.bindToTarget.targetId,
              remaining: fighter.bindToTarget.remaining === Number.POSITIVE_INFINITY ? "infinite" : fighter.bindToTarget.remaining,
              offset: { ...fighter.bindToTarget.offset },
            },
          }
        : {}),
    },
    frame,
    clsn1: activeHitbox.map((box) => ({ ...box })),
    clsn2: frame?.clsn2.map((box) => ({ ...box })) ?? [{ x1: -24, y1: -96, x2: 24, y2: 0 }],
    soundEvents: fighter.soundEvents.map((event) => ({ ...event })),
    hitEffectEvents: fighter.hitEffectEvents.map((event) => ({
      ...event,
      offset: event.offset ? { ...event.offset } : undefined,
      assetFrame: event.assetFrame ? { ...event.assetFrame } : undefined,
      assetFrames: event.assetFrames?.map((frame) => ({ ...frame })),
    })),
    envShakeEvents: fighter.envShakeEvents.map((event) => ({ ...event })),
  };
}

function cameraCenterX(fighters: FighterMatchState[]): number {
  const cameraActors = fighters.filter((fighter) => fighter.runtime.screenBound?.moveCameraX !== false);
  const source = cameraActors.length > 0 ? cameraActors : fighters;
  return source.reduce((sum, fighter) => sum + fighter.runtime.pos.x, 0) / Math.max(1, source.length);
}

function getCurrentFrame(fighter: FighterMatchState): MugenAnimationFrame | undefined {
  return fighter.currentAction.frames[fighter.runtime.frameIndex];
}

function spriteOwnerSnapshot(fighter: FighterMatchState): {
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
} {
  const owner = fighter.stateOwner ?? fighter;
  return {
    spriteOwnerId: owner.id,
    spriteOwnerDefinitionId: owner.definition.id,
    spriteOwnerLabel: owner.label,
  };
}

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

function tryApplyStateEntry(fighter: FighterMatchState, opponent: FighterMatchState, tick: number): boolean {
  const entries = fighter.runtimeProgram?.stateEntries ?? [];
  if (entries.length === 0) {
    return false;
  }

  for (const controller of entries) {
    const dispatch = dispatchStateProgramController(controller);
    if (dispatch.kind !== "change-state") {
      continue;
    }
    if (!triggersPass(controller, fighter, opponent, fighter, tick)) {
      continue;
    }
    const stateId = resolveDispatchNumber(dispatch.stateId, dispatch.stateExpression, fighter, opponent, fighter, tick);
    if (stateId === undefined) {
      continue;
    }
    recordStateEntryRoute(fighter, controller.source, stateId);
    const move = fighter.definition.stateMoves?.get(stateId);
    if (move) {
      startMoveWithSpec(fighter, move, controller.name ?? `state ${stateId}`);
    } else {
      enterState(fighter, stateId);
    }
    return true;
  }

  return false;
}

function runStateEntrySetupControllers(fighter: FighterMatchState, opponent: FighterMatchState, tick: number): void {
  const entries = fighter.runtimeProgram?.stateEntries ?? [];
  if (entries.length === 0 || fighter.definition.source !== "imported") {
    return;
  }
  for (const controller of entries) {
    const dispatch = dispatchStateProgramController(controller);
    if (dispatch.kind === "change-state") {
      continue;
    }
    if (!triggersPass(controller, fighter, opponent, fighter, tick)) {
      continue;
    }
    if (isStateEntrySetupDispatch(dispatch)) {
      recordControllerExecution(fighter, controller.source);
      fighter.runtime = executeControllerIr(controller, fighter.runtime, () => undefined, {
        hitPauseTime: () => fighter.hitPause,
        random: () => nextRuntimeRandom(fighter),
        stageTime: tick,
      });
    }
  }
}

function isImportedCompatibilityActor(fighter: FighterMatchState): boolean {
  return fighter.definition.source === "imported" || fighter.stateOwner?.definition.source === "imported";
}

function recordStateExecution(fighter: FighterMatchState, stateId: number, owner: FighterMatchState = fighter): void {
  if (fighter.definition.source !== "imported" && owner.definition.source !== "imported") {
    return;
  }
  fighter.executedStateIds.add(stateId);
  fighter.lastExecutedState = stateId;
}

function recordStateEntryRoute(fighter: FighterMatchState, controller: MugenStateController, stateId: number): void {
  if (fighter.definition.source !== "imported") {
    return;
  }
  fighter.routedStateEntries += 1;
  fighter.routedStateIds.push(stateId);
  while (fighter.routedStateIds.length > 12) {
    fighter.routedStateIds.shift();
  }
  fighter.lastRoutedState = {
    stateId,
    ...(controller.name ? { name: controller.name } : {}),
  };
  recordControllerExecution(fighter, controller);
}

function recordControllerExecution(fighter: FighterMatchState, controller: MugenStateController): void {
  if (!isImportedCompatibilityActor(fighter)) {
    return;
  }
  const key = controller.type || controller.name || "Unknown";
  fighter.executedControllerCounts[key] = (fighter.executedControllerCounts[key] ?? 0) + 1;
  appendControllerEvent(fighter, controller);
}

function recordControllerOperation(fighter: FighterMatchState, operation: ControllerOp): void {
  if (!isImportedCompatibilityActor(fighter)) {
    return;
  }
  const key = controllerOperationKey(operation);
  fighter.executedOperationCounts[key] = (fighter.executedOperationCounts[key] ?? 0) + 1;
  appendControllerEvent(fighter, undefined, key);
}

function appendControllerEvent(fighter: FighterMatchState, controller?: MugenStateController, operation?: string): void {
  const key = controller?.type || controller?.name || operation || "Unknown";
  fighter.controllerEvents.push({
    sequence: fighter.nextControllerEventSequence++,
    tick: fighter.compatibilityTick,
    stateNo: fighter.runtime.stateNo,
    controller: key,
    ...(controller?.name ? { name: controller.name } : {}),
    ...(controller?.line !== undefined ? { line: controller.line } : {}),
    ...(operation ? { operation } : {}),
  });
  while (fighter.controllerEvents.length > 160) {
    fighter.controllerEvents.shift();
  }
}

function controllerOperationKey(operation: ControllerOp): string {
  if (operation.kind === "target") {
    return `target:${operation.controllerType}`;
  }
  if (operation.kind === "bindtotarget") {
    return "bindtotarget";
  }
  if (operation.kind === "pause") {
    return `pause:${operation.controllerType}`;
  }
  if (operation.kind === "hitfall") {
    return `hitfall:${operation.controllerType}`;
  }
  if (operation.kind === "kinematic") {
    return `kinematic:${operation.controllerType}`;
  }
  if (operation.kind === "bounds") {
    return `bounds:${operation.controllerType}`;
  }
  if (operation.kind === "collision") {
    return `collision:${operation.controllerType}`;
  }
  if (operation.kind === "metadata") {
    return `metadata:${operation.controllerType}`;
  }
  if (operation.kind === "orientation") {
    return `orientation:${operation.controllerType}`;
  }
  if (operation.kind === "sprite-effect") {
    return `sprite-effect:${operation.controllerType}`;
  }
  if (operation.kind === "resource") {
    return `resource:${operation.controllerType}`;
  }
  if (operation.kind === "variable") {
    return `variable:${operation.controllerType}`;
  }
  if (operation.kind === "eligibility") {
    return `eligibility:${operation.controllerType}`;
  }
  if (operation.kind === "damage-scale") {
    return `damage-scale:${operation.controllerType}`;
  }
  if (operation.kind === "contact") {
    return `contact:${operation.controllerType}`;
  }
  return operation.kind;
}

function buildCompatibilitySession(fighters: FighterMatchState[]): MugenSnapshot["compatibilitySession"] {
  const actors = fighters
    .filter(isImportedCompatibilityActor)
    .map((fighter): ActorCompatibilitySession => {
      const executedStates = [...fighter.executedStateIds].sort((a, b) => a - b);
      const session: ActorCompatibilitySession = {
        actorId: fighter.id,
        label: fighter.label,
        source: "imported",
        executedStates,
        routedStateEntries: fighter.routedStateEntries,
        routedStates: [...fighter.routedStateIds],
        executedControllers: { ...fighter.executedControllerCounts },
        executedOperations: { ...fighter.executedOperationCounts },
        controllerEvents: fighter.controllerEvents.map((event) => ({ ...event })),
        activeCommands: activeImportedCommands(fighter),
        commandHistory: fighter.commandBuffer.getHistory(24),
      };
      if (fighter.lastRoutedState) {
        session.lastRoutedState = { ...fighter.lastRoutedState };
      }
      if (fighter.lastExecutedState !== undefined) {
        session.lastExecutedState = fighter.lastExecutedState;
      }
      return session;
    });
  return actors.length > 0 ? { actors } : undefined;
}

function activeImportedCommands(fighter: FighterMatchState): string[] {
  const commands = fighter.definition.commands ?? [];
  const names: string[] = [];
  const seen = new Set<string>();
  for (const command of commands) {
    if (seen.has(command.name)) {
      continue;
    }
    if (fighter.commandBuffer.isCommandActive(command.name, commands)) {
      names.push(command.name);
      seen.add(command.name);
    }
  }
  return names.slice(0, 12);
}

function triggersPass(
  controller: ControllerIr,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageTime?: number,
): boolean {
  const triggerAll = controller.triggers.filter((trigger) => trigger.index === 0);
  if (!triggerAll.every((trigger) => evaluateRuntimeTrigger(trigger, fighter, opponent, owner, stageTime))) {
    return false;
  }

  const grouped = new Map<number, typeof controller.triggers>();
  for (const trigger of controller.triggers) {
    if (trigger.index <= 0) {
      continue;
    }
    const triggers = grouped.get(trigger.index) ?? [];
    triggers.push(trigger);
    grouped.set(trigger.index, triggers);
  }

  if (grouped.size === 0) {
    return true;
  }

  return [...grouped.values()].some((triggers) =>
    triggers.every((trigger) => evaluateRuntimeTrigger(trigger, fighter, opponent, owner, stageTime)),
  );
}

function resolveDispatchNumber(
  value: number | undefined,
  expression: string | undefined,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageTime?: number,
): number | undefined {
  if (value !== undefined) {
    return value;
  }
  if (!expression) {
    return undefined;
  }
  const evaluated = evaluateExpression(expression, {
    self: fighter.runtime,
    opponent: opponent.runtime,
    stageTime,
    stateTime: fighter.stateElapsed,
    random: () => nextRuntimeRandom(fighter),
    animTimeRemaining: getAnimTimeRemaining(fighter),
    animElemTime: (elementNumber) => getAnimElemTime(fighter, elementNumber),
    animExists: (animationId) => fighter.definition.animations.has(animationId),
    stateExists: (stateNo) => fighterHasState(fighter, stateNo),
    commandActive: (name) => fighter.commandBuffer.isCommandActive(name, fighter.definition.commands ?? []),
    getConst: (name) => runtimeConst(owner.definition, name),
    getHitVar: (name) => runtimeHitVar(fighter.runtime, name),
    hitDefAttr: (filter) => (fighter.currentMove ? hitAttributeMatches(filter, fighter.currentMove.attr ?? "S,NA") : false),
    hitCount: () => moveHitCountValue(fighter, false),
    hitPauseTime: () => fighter.hitPause,
    hitShakeOver: () => fighter.hitPause <= 0,
    hitOver: () => fighter.hitStun <= 0 && (fighter.runtime.guardStun ?? 0) <= 0,
    inGuardDist: () => evaluateRuntimeInGuardDist(fighter, opponent),
    moveContact: () => moveContactValue(fighter, "contact"),
    moveHit: () => moveContactValue(fighter, "hit"),
    moveGuarded: () => moveContactValue(fighter, "guard"),
    moveReversed: () => moveReversedValue(fighter),
    receivedDamage: () => receivedDamageValue(fighter),
    receivedHits: () => receivedHitsValue(fighter),
    numExplod: (explodId) => countRuntimeExplods(fighter, explodId),
    numHelper: (helperId) => countRuntimeHelpers(fighter, helperId),
    numProj: (projectileId) => countRuntimeProjectiles(fighter, projectileId),
    numTarget: (targetId) => countRuntimeTargets(fighter, targetId),
    projContact: (projectileId) => hasProjectileContact(fighter, "contact", projectileId),
    projHit: (projectileId) => hasProjectileContact(fighter, "hit", projectileId),
    projGuarded: (projectileId) => hasProjectileContact(fighter, "guard", projectileId),
    projContactTime: (projectileId) => projectileContactTime(fighter, "contact", projectileId),
    projHitTime: (projectileId) => projectileContactTime(fighter, "hit", projectileId),
    projGuardedTime: (projectileId) => projectileContactTime(fighter, "guard", projectileId),
    uniqueHitCount: () => moveHitCountValue(fighter, true),
  });
  const numberValue = Number(evaluated);
  return Number.isFinite(numberValue) ? Math.trunc(numberValue) : undefined;
}

function resolveDispatchBoolean(
  value: boolean | undefined,
  expression: string | undefined,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageTime?: number,
): boolean | undefined {
  if (value !== undefined) {
    return value;
  }
  const numberValue = resolveDispatchNumber(undefined, expression, fighter, opponent, owner, stageTime);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

function evaluateRuntimeTrigger(
  trigger: ControllerIr["triggers"][number],
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageTime?: number,
): boolean {
  return evaluateTriggerIr(trigger, {
    self: fighter.runtime,
    opponent: opponent.runtime,
    stageTime,
    stateTime: fighter.stateElapsed,
    random: () => nextRuntimeRandom(fighter),
    animTimeRemaining: getAnimTimeRemaining(fighter),
    animElemTime: (elementNumber) => getAnimElemTime(fighter, elementNumber),
    animExists: (animationId) => fighter.definition.animations.has(animationId),
    stateExists: (stateNo) => fighterHasState(fighter, stateNo),
    commandActive: (name) => fighter.commandBuffer.isCommandActive(name, fighter.definition.commands ?? []),
    getConst: (name) => runtimeConst(owner.definition, name),
    getHitVar: (name) => runtimeHitVar(fighter.runtime, name),
    hitDefAttr: (filter) => (fighter.currentMove ? hitAttributeMatches(filter, fighter.currentMove.attr ?? "S,NA") : false),
    hitCount: () => moveHitCountValue(fighter, false),
    hitPauseTime: () => fighter.hitPause,
    hitShakeOver: () => fighter.hitPause <= 0,
    hitOver: () => fighter.hitStun <= 0 && (fighter.runtime.guardStun ?? 0) <= 0,
    inGuardDist: () => evaluateRuntimeInGuardDist(fighter, opponent),
    moveContact: () => moveContactValue(fighter, "contact"),
    moveHit: () => moveContactValue(fighter, "hit"),
    moveGuarded: () => moveContactValue(fighter, "guard"),
    moveReversed: () => moveReversedValue(fighter),
    receivedDamage: () => receivedDamageValue(fighter),
    receivedHits: () => receivedHitsValue(fighter),
    numExplod: (explodId) => countRuntimeExplods(fighter, explodId),
    numHelper: (helperId) => countRuntimeHelpers(fighter, helperId),
    numProj: (projectileId) => countRuntimeProjectiles(fighter, projectileId),
    numTarget: (targetId) => countRuntimeTargets(fighter, targetId),
    projContact: (projectileId) => hasProjectileContact(fighter, "contact", projectileId),
    projHit: (projectileId) => hasProjectileContact(fighter, "hit", projectileId),
    projGuarded: (projectileId) => hasProjectileContact(fighter, "guard", projectileId),
    projContactTime: (projectileId) => projectileContactTime(fighter, "contact", projectileId),
    projHitTime: (projectileId) => projectileContactTime(fighter, "hit", projectileId),
    projGuardedTime: (projectileId) => projectileContactTime(fighter, "guard", projectileId),
    uniqueHitCount: () => moveHitCountValue(fighter, true),
  });
}

function fighterHasState(fighter: FighterMatchState, stateNo: number): boolean {
  const id = Math.trunc(stateNo);
  return (
    fighter.runtimeProgram?.states.some((state) => state.id === id) ??
    fighter.definition.states?.some((state) => state.id === id) ??
    false
  );
}

function runtimeConst(definition: DemoFighterDefinition, name: string): number | undefined {
  return definition.constants?.[name.trim().toLowerCase()];
}

function runtimeLifeMax(definition: DemoFighterDefinition): number {
  return boundedRuntimeResourceMax(definition.constants?.["data.life"], 1000);
}

function runtimePowerMax(definition: DemoFighterDefinition): number {
  return boundedRuntimeResourceMax(definition.constants?.["data.power"], 3000);
}

function runtimeAttackMultiplier(definition: DemoFighterDefinition): number | undefined {
  const attack = definition.constants?.["data.attack"];
  return attack === undefined ? undefined : boundedRuntimeDamageMultiplier(attack / 100);
}

function runtimeDefenseMultiplier(definition: DemoFighterDefinition): number | undefined {
  const defence = definition.constants?.["data.defence"];
  return defence === undefined || defence <= 0 ? undefined : boundedRuntimeDamageMultiplier(100 / defence);
}

function boundedRuntimeResourceMax(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.round(value));
}

function boundedRuntimeDamageMultiplier(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0, Math.min(10, Math.round(value * 1000) / 1000));
}

function runtimeHitVar(state: CharacterRuntimeState, name: string): number | undefined {
  const key = name.trim().toLowerCase();
  if (key === "animtype") {
    return state.hitVars?.animType ?? 0;
  }
  if (key === "groundtype") {
    return state.hitVars?.groundType ?? 0;
  }
  if (key === "airtype") {
    return state.hitVars?.airType ?? 0;
  }
  if (key === "isbound") {
    return state.hitVars?.isBound ? 1 : 0;
  }
  if (key === "fall") {
    return state.hitFall?.falling ? 1 : 0;
  }
  if (key === "fall.damage") {
    return state.hitFall?.damage ?? 0;
  }
  if (key === "fall.defence_up") {
    return state.hitFall?.defenceUp ?? 100;
  }
  if (key === "fall.kill") {
    return state.hitFall?.kill === false ? 0 : 1;
  }
  if (key === "fall.xvel" || key === "fall.xvelocity") {
    return state.hitFall?.velocity.x ?? 0;
  }
  if (key === "fall.yvel" || key === "fall.yvelocity") {
    return state.hitFall?.velocity.y ?? 0;
  }
  if (key === "fall.recover") {
    return state.hitFall?.recover && (state.hitFall.recoverTime ?? 0) <= 0 ? 1 : 0;
  }
  if (key === "fall.recovertime") {
    return state.hitFall?.recoverTime ?? 0;
  }
  if (key === "down.recover") {
    return state.hitFall?.downRecover === false ? 0 : 1;
  }
  if (key === "recovertime" || key === "down.recovertime") {
    return state.hitFall?.downRecoverTime ?? 0;
  }
  if (key === "fall.envshake.time") {
    return state.hitFall?.envShake?.time ?? 0;
  }
  if (key === "fall.envshake.freq") {
    return state.hitFall?.envShake?.freq ?? 60;
  }
  if (key === "fall.envshake.ampl") {
    return state.hitFall?.envShake?.ampl ?? 0;
  }
  if (key === "fall.envshake.phase") {
    return state.hitFall?.envShake?.phase ?? 0;
  }
  if (key === "xvel") {
    return state.hitVelocity?.x ?? 0;
  }
  if (key === "yvel") {
    return state.hitVelocity?.y ?? 0;
  }
  if (key === "hittime") {
    return state.guardStun ?? 0;
  }
  if (key === "slidetime") {
    return state.guardSlideTime ?? 0;
  }
  if (key === "ctrltime") {
    return state.guardControlTime ?? 0;
  }
  if (key === "yaccel") {
    return 0.44;
  }
  return undefined;
}

function getAnimTimeRemaining(fighter: FighterMatchState): number {
  const frames = fighter.currentAction.frames;
  if (frames.length === 0) {
    return 0;
  }
  if (fighter.animationComplete) {
    return 0;
  }
  let remaining = Math.max(0, (frames[fighter.runtime.frameIndex]?.duration ?? 1) - fighter.frameElapsed - 1);
  for (let index = fighter.runtime.frameIndex + 1; index < frames.length; index += 1) {
    remaining += Math.max(1, frames[index]?.duration ?? 1);
  }
  return remaining;
}

function getAnimElemTime(fighter: FighterMatchState, elementNumber: number): number | undefined {
  const frames = fighter.currentAction.frames;
  const elementIndex = Math.floor(elementNumber) - 1;
  if (elementIndex < 0 || elementIndex >= frames.length) {
    return undefined;
  }
  const currentElapsed = animationElapsedBeforeFrame(fighter.currentAction, fighter.runtime.frameIndex) + fighter.frameElapsed;
  const targetElapsed = animationElapsedBeforeFrame(fighter.currentAction, elementIndex);
  return currentElapsed - targetElapsed;
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

function secondNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[1]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function booleanHitDefParam(controller: { params: Record<string, string> }, key: string): boolean | undefined {
  const value = firstNumber(findParam(controller, key));
  return value === undefined ? undefined : value !== 0;
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((numberValue) => Number.isFinite(numberValue));
  if (numbers.length === 0 || numbers[0] === undefined) {
    return undefined;
  }
  return [numbers[0], numbers[1] ?? numbers[0]];
}

function normalizeSparkOffset(value: [number, number?]): [number, number] {
  return [value[0], value[1] ?? value[0]];
}

function velocityPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((numberValue) => Number.isFinite(numberValue));
  if (numbers.length === 0 || numbers[0] === undefined) {
    return undefined;
  }
  return [numbers[0], numbers[1] ?? 0];
}

function clampHitDefPriority(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

function hitAnimType(value: string | undefined): number | undefined {
  const numeric = firstNumber(value);
  if (numeric !== undefined) {
    return numeric;
  }
  const normalized = stripMugenString(value)?.replace(/[\s_-]+/g, "").toLowerCase();
  if (!normalized) {
    return undefined;
  }
  const values: Record<string, number> = {
    light: 0,
    medium: 1,
    med: 1,
    hard: 2,
    heavy: 2,
    back: 3,
    up: 4,
    diagup: 5,
    diagonalup: 5,
  };
  return values[normalized];
}

function hitType(value: string | undefined): number | undefined {
  const numeric = firstNumber(value);
  if (numeric !== undefined) {
    return numeric;
  }
  const normalized = stripMugenString(value)?.replace(/[\s_-]+/g, "").toLowerCase();
  if (!normalized) {
    return undefined;
  }
  const values: Record<string, number> = {
    high: 1,
    low: 2,
    trip: 3,
  };
  return values[normalized];
}

function normalizeStateType(value: string, fallback: CharacterRuntimeState["stateType"]): CharacterRuntimeState["stateType"] {
  const upper = value.trim().toUpperCase();
  return upper === "S" || upper === "C" || upper === "A" || upper === "L" ? upper : fallback;
}

function normalizeMoveType(value: string, fallback: CharacterRuntimeState["moveType"]): CharacterRuntimeState["moveType"] {
  const upper = value.trim().toUpperCase();
  return upper === "I" || upper === "A" || upper === "H" ? upper : fallback;
}

function normalizePhysics(value: string, fallback: CharacterRuntimeState["physics"]): CharacterRuntimeState["physics"] {
  const upper = value.trim().toUpperCase();
  return upper === "S" || upper === "C" || upper === "A" || upper === "N" ? upper : fallback;
}
