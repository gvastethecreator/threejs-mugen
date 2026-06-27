import { compileRuntimeProgram } from "../compiler/StateControllerCompiler";
import type {
  BindToTargetControllerOp,
  CollisionControllerOp,
  ControllerOp,
  ExplodControllerOp,
  FallEnvShakeControllerOp,
  HelperControllerOp,
  HitDefControllerOp,
  PauseControllerOp,
  ProjectileControllerOp,
  RemoveExplodControllerOp,
  ReversalDefControllerOp,
  SpriteEffectControllerOp,
  TargetControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr, RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { createRuntimeSoundEvent, pushRuntimeSoundEvent } from "./AudioEventSystem";
import { CommandBuffer } from "./CommandBuffer";
import {
  applyRuntimeDamage,
  canRuntimeDamageKill,
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
import {
  calculateRuntimeCameraShake,
  createRuntimeEnvShakeEvent,
  createRuntimeFallEnvShakeEvent,
  pushRuntimeEnvShakeEvent,
} from "./EnvShakeSystem";
import type { RuntimeProjectileSpawnInput } from "./ProjectileSystem";
import { evaluateExpression } from "./ExpressionEvaluator";
import {
  RuntimeEffectActorWorld,
  type RuntimeEffectActorStores,
  type RuntimeEffectActorStoreSummary,
} from "./EffectActorSystem";
import type { RuntimeExplodPauseKind } from "./ExplodSystem";
import { hasRuntimeDirection, isRuntimeHoldingBack } from "./RuntimeInput";
import {
  canActorMoveDuringPause,
  createMatchPauseFromController,
  tickMatchPause,
  toMatchPauseSnapshot,
  type RuntimeMatchPause,
} from "./PauseSystem";
import { executeControllerIr } from "./StateControllerExecutor";
import { dispatchStateProgramController, findControllerParam, isStateEntrySetupDispatch } from "./StateProgramExecutor";
import {
  applyRuntimeAfterImageController,
  applyRuntimeAfterImageTimeController,
  applyRuntimePaletteFxController,
  applyRuntimeSpritePriorityController,
  tickRuntimeAfterImage,
  tickRuntimePaletteFx,
} from "./SpriteEffectSystem";
import {
  createRuntimeTargetBinding,
  RuntimeTargetWorld,
  resolveRuntimeTargetBindingPosition,
  type RuntimeTarget,
  type RuntimeTargetBinding,
} from "./TargetSystem";
import { trainingStage } from "./demoStage";
import { evaluateTriggerIr } from "./TriggerEvaluator";
import type {
  ActorCompatibilitySession,
  ActorSnapshot,
  CharacterRuntimeState,
  RuntimeAfterImageSample,
  RuntimeEnvShakeEvent,
  RuntimeHitBySlot,
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
  targetWorld?: RuntimeTargetWorld;
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
  firedHitDefs: Set<string>;
  soundEvents: RuntimeSoundEvent[];
  envShakeEvents: RuntimeEnvShakeEvent[];
  effectActorWorld: RuntimeEffectActorWorld;
  targetWorld: RuntimeTargetWorld;
  lastExecutedState?: number;
  contact: FighterContactState;
};

type FighterContactState = {
  moveContactState?: number;
  moveHitState?: number;
  moveGuardState?: number;
  projectileContactState?: number;
  projectileHitState?: number;
  projectileGuardState?: number;
  projectileId?: number;
  projectileContactTime?: number;
  projectileHitTime?: number;
  projectileGuardTime?: number;
};

type PauseControllerHandler = (fighter: FighterMatchState, controller: MugenStateController, operation?: PauseControllerOp) => void;

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
  private roundOver = false;
  private roundState: "fight" | "ko" | "timeover" = "fight";
  private roundTimerFrames = 99 * 60;
  private winner?: string;
  private readonly logs: string[] = [];
  private readonly p1: FighterMatchState;
  private readonly p2: FighterMatchState;
  private readonly stage: MugenStageDefinition;
  private readonly effectActorWorld: RuntimeEffectActorWorld;
  private readonly targetWorld: RuntimeTargetWorld;
  private matchPause?: RuntimeMatchPause;
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
    this.effectActorWorld = options.effectActorWorld ?? new RuntimeEffectActorWorld(options.effectActorStores);
    this.targetWorld = options.targetWorld ?? new RuntimeTargetWorld();
    this.p1 = createFighterState(
      "p1",
      p1Definition,
      stage.playerStart.p1.x,
      stage.playerStart.p1.y,
      stage.playerStart.p1.facing,
      this.effectActorWorld,
      this.targetWorld,
    );
    this.p2 = createFighterState(
      "p2",
      p2Definition,
      stage.playerStart.p2.x,
      stage.playerStart.p2.y,
      stage.playerStart.p2.facing,
      this.effectActorWorld,
      this.targetWorld,
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
      if (this.roundOver) {
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
    this.p1.currentInput = new Set(p1Input);
    this.p2.currentInput = new Set(p2Input);

    updateFacing(this.p1, this.p2);
    updateFacing(this.p2, this.p1);

    const globalPause = Math.max(this.p1.hitPause, this.p2.hitPause);
    if (globalPause > 0) {
      this.p1.commandBuffer.push(this.tick, p1Input, { hitPause: true });
      this.p2.commandBuffer.push(this.tick, p2Input, { hitPause: true });
      advancePausedPresentationEffects(this.p1, "hitpause");
      advancePausedPresentationEffects(this.p2, "hitpause");
      this.p1.hitPause = Math.max(0, this.p1.hitPause - 1);
      this.p2.hitPause = Math.max(0, this.p2.hitPause - 1);
      return;
    }

    if (this.matchPause) {
      this.advancePausedMatch(input, p1Input, p2Input);
      return;
    }

    this.roundTimerFrames = Math.max(0, this.roundTimerFrames - 1);
    this.p1.commandBuffer.push(this.tick, p1Input);
    this.p2.commandBuffer.push(this.tick, p2Input);
    handlePlayerInput(this.p1, p1Input, this.p2);
    if (input.p2) {
      handlePlayerInput(this.p2, p2Input, this.p1);
    } else {
      handleSimpleAi(this.p2, this.p1, this.tick);
    }
    advanceFighter(this.p1, this.p2, this.tick, (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation));
    applyAutoGuardStart(this.p2, this.p1);
    if (!this.matchPause) {
      advanceFighter(this.p2, this.p1, this.tick, (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation));
      applyAutoGuardStart(this.p1, this.p2);
    }
    advanceTargetMemory(this.p1);
    advanceTargetMemory(this.p2);
    advanceActiveEffects(this.p1, this.stage);
    advanceActiveEffects(this.p2, this.stage);
    resolveProjectileClashes(this.p1, this.p2, (line) => this.logs.unshift(line));
    separateFighters(this.p1, this.p2);
    applyTargetBindings(this.p1, this.p2);
    applyTargetBindings(this.p2, this.p1);
    applyBindToTarget(this.p1, this.p2);
    applyBindToTarget(this.p2, this.p1);
    resolveDirectHitDefPriority(this.p1, this.p2, (line) => this.logs.unshift(line));
    resolveCombat(this.p1, this.p2, (line) => this.logs.unshift(line));
    resolveCombat(this.p2, this.p1, (line) => this.logs.unshift(line));
    resolveProjectileCombat(this.p1, this.p2, (line) => this.logs.unshift(line));
    resolveProjectileCombat(this.p2, this.p1, (line) => this.logs.unshift(line));
    clampStage(this.p1, this.stage);
    clampStage(this.p2, this.stage);
    advancePresentationEffects(this.p1);
    advancePresentationEffects(this.p2);

    if (this.p1.runtime.life <= 0 || this.p2.runtime.life <= 0 || this.roundTimerFrames <= 0) {
      this.finishRound();
    }
  }

  private advancePausedMatch(input: MatchInput, p1Input: Set<string>, p2Input: Set<string>): void {
    const pause = this.matchPause;
    if (!pause) {
      return;
    }

    this.p1.commandBuffer.push(this.tick, p1Input, { hitPause: true });
    this.p2.commandBuffer.push(this.tick, p2Input, { hitPause: true });

    const actor = pause.actorId === this.p2.id ? this.p2 : this.p1;
    const opponent = actor === this.p1 ? this.p2 : this.p1;
    const actorInput = actor === this.p1 ? p1Input : p2Input;
    const actorMoved = canActorMoveDuringPause(pause, actor.id);
    if (actorMoved) {
      if (actor === this.p1 || input.p2) {
        handlePlayerInput(actor, actorInput, opponent);
      } else {
        handleSimpleAi(actor, opponent, this.tick);
      }
      advanceFighter(actor, opponent, this.tick, (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation));
      advanceTargetMemory(actor);
      advanceActiveEffects(actor, this.stage);
      advancePresentationEffects(actor);
      applyTargetBindings(actor, opponent);
      applyBindToTarget(actor, opponent);
      clampStage(actor, this.stage);
    }

    if (this.matchPause !== pause) {
      return;
    }
    if (!actorMoved || actor.id !== this.p1.id) {
      advancePausedPresentationEffects(this.p1, pause.type);
    }
    if (!actorMoved || actor.id !== this.p2.id) {
      advancePausedPresentationEffects(this.p2, pause.type);
    }
    this.matchPause = tickMatchPause(pause);
  }

  private applyMatchPauseController(fighter: FighterMatchState, controller: MugenStateController, operation?: PauseControllerOp): void {
    const result = createMatchPauseFromController(fighter, controller, this.tick, operation);
    if (!result.pause) {
      return;
    }
    if (operation) {
      recordControllerOperation(fighter, operation);
    }
    if (result.powerDelta !== 0) {
      fighter.runtime.power = clampNumber(fighter.runtime.power + result.powerDelta, 0, 3000);
    }
    this.matchPause = result.pause;
    this.logs.unshift(
      `${fighter.label} triggered ${result.pause.type} for ${result.pause.remaining}f (${result.pause.moveTime}f movetime)`,
    );
  }

  getSnapshot(): MugenSnapshot {
    const center = cameraCenterX([this.p1, this.p2]);
    const shake = calculateRuntimeCameraShake(this.tick, [this.p1, this.p2].flatMap((fighter) => fighter.envShakeEvents));
    return {
      tick: this.tick,
      selectedActionId: this.p1.runtime.animNo,
      selectedAction: this.p1.currentAction,
      playing: this.playing,
      speed: this.speed,
      ...this.toggles,
      matchPause: this.matchPause ? toMatchPauseSnapshot(this.matchPause) : undefined,
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
        layers: this.stage.layers,
        animations: this.stage.animations,
        bgControllers: this.stage.bgControllers,
      },
      round: {
        state: this.roundState,
        timer: Math.ceil(this.roundTimerFrames / 60),
        winner: this.winner,
        message: this.roundMessage(),
      },
      actors: [toSnapshot(this.p1), toSnapshot(this.p2)],
      effects: [
        ...toExplodSnapshots(this.p1),
        ...toExplodSnapshots(this.p2),
        ...toHelperSnapshots(this.p1),
        ...toHelperSnapshots(this.p2),
        ...toProjectileSnapshots(this.p1),
        ...toProjectileSnapshots(this.p2),
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
    this.roundOver = false;
    this.roundState = "fight";
    this.roundTimerFrames = 99 * 60;
    this.winner = undefined;
    this.playing = true;
    this.matchPause = undefined;
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
      ),
    );
    this.logs.unshift("Round reset");
  }

  private finishRound(): void {
    if (this.roundOver) {
      return;
    }
    this.roundOver = true;
    this.roundState = this.roundTimerFrames <= 0 ? "timeover" : "ko";
    const p1Life = this.p1.runtime.life;
    const p2Life = this.p2.runtime.life;
    if (p1Life === p2Life) {
      this.winner = "Draw";
    } else {
      this.winner = p1Life > p2Life ? this.p1.label : this.p2.label;
    }
    this.playing = false;
    this.logs.unshift(`${this.roundMessage()} - press Reset to fight again`);
  }

  private roundMessage(): string {
    if (this.roundState === "fight") {
      return "Fight";
    }
    if (this.winner === "Draw") {
      return this.roundState === "timeover" ? "Time over - draw" : "Double KO";
    }
    return `${this.winner ?? "Fighter"} wins`;
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
): FighterMatchState {
  const action = definition.animations.get(definition.idleAction)!;
  const runtimeProgram = getRuntimeProgram(definition);
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
      spritePriority: id === "p2" ? 1 : 2,
      stateNo: 0,
      animNo: definition.idleAction,
      animTime: 0,
      frameIndex: 0,
      life: 1000,
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
    firedHitDefs: new Set(),
    soundEvents: [],
    envShakeEvents: [],
    effectActorWorld,
    targetWorld,
    contact: {},
  };
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
    fighter.runtime.stateNo = stateNo;
    if (options.resetElapsed) {
      fighter.stateElapsed = -1;
    }
    return;
  }
  fighter.runtime.stateNo = stateNo;
}

function handlePlayerInput(fighter: FighterMatchState, input: Set<string>, opponent: FighterMatchState): void {
  if (fighter.hitStun > 0 || (fighter.runtime.guardStun ?? 0) > 0 || fighter.currentMove) {
    return;
  }
  if (!fighter.runtime.ctrl || shouldPreserveImportedStateMoveType(fighter)) {
    return;
  }

  runStateEntrySetupControllers(fighter, opponent);
  if (tryApplyStateEntry(fighter, opponent)) {
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
  if (fighter.hitStun > 0 || (fighter.runtime.guardStun ?? 0) > 0 || fighter.currentMove) {
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
  tick: number,
  onPauseController?: PauseControllerHandler,
): void {
  tickRuntimePaletteFx(fighter.runtime);
  tickRuntimeAfterImage(fighter.runtime, () => createAfterImageSample(fighter));
  tickHitBySlots(fighter.runtime);
  tickHitOverrideSlots(fighter.runtime);
  advanceContactTimers(fighter);
  resetAssertSpecial(fighter.runtime);
  fighter.stateElapsed += 1;
  fighter.runtime.playerPush = true;
  fighter.runtime.posFreeze = undefined;
  fighter.runtime.screenBound = undefined;
  fighter.runtime.guarding = false;
  advanceHitFallRecoveryWindow(fighter);
  const tickStartPos = { ...fighter.runtime.pos };
  if ((fighter.runtime.guardStun ?? 0) > 0) {
    fighter.runtime.guardStun = Math.max(0, (fighter.runtime.guardStun ?? 0) - 1);
    fighter.runtime.guarding = fighter.runtime.guardStun > 0;
    fighter.runtime.moveType = fighter.runtime.guarding ? "H" : fighter.runtime.moveType;
    fighter.runtime.vel.x *= 0.82;
    if (!fighter.stateOwner && !shouldPreserveImportedStateMoveType(fighter)) {
      changeAction(fighter, fighter.definition.hitstunAction);
    }
  }
  if (fighter.hitStun > 0) {
    fighter.hitStun -= 1;
    fighter.runtime.vel.x *= 0.88;
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
  runActiveStateControllers(fighter, opponent, tick, onPauseController);
  advanceImportedGroundRecoveryLanding(fighter);
  advanceCommon1LieDownRecovery(fighter);
  const posFreeze = fighter.runtime.posFreeze as CharacterRuntimeState["posFreeze"];
  if (posFreeze?.x) {
    fighter.runtime.pos.x = tickStartPos.x;
  }
  if (posFreeze?.y) {
    fighter.runtime.pos.y = tickStartPos.y;
  }
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

function runActiveStateControllers(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  tick: number,
  onPauseController?: PauseControllerHandler,
): void {
  const owner = fighter.stateOwner ?? fighter;
  const stateProgram = owner.runtimeProgram?.states.find((candidate) => candidate.id === fighter.runtime.stateNo);
  const state = stateProgram?.source;
  if (!state || (fighter.definition.source !== "imported" && owner.definition.source !== "imported")) {
    return;
  }

  for (const controller of stateProgram.controllers) {
    if (!triggersPass(controller, fighter, opponent, owner)) {
      continue;
    }
    const dispatch = dispatchStateProgramController(controller);
    const rawController = controller.source;

    if (dispatch.kind === "change-state") {
      const stateId = resolveDispatchNumber(dispatch.stateId, dispatch.stateExpression, fighter, opponent, owner);
      if (stateId === undefined) {
        continue;
      }
      const animOverride = resolveDispatchNumber(dispatch.animOverride, dispatch.animExpression, fighter, opponent, owner);
      const ctrl = resolveDispatchBoolean(dispatch.ctrl, dispatch.ctrlExpression, fighter, opponent, owner);
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
      const actionId = resolveDispatchNumber(dispatch.actionId, dispatch.actionExpression, fighter, opponent, owner);
      if (actionId === undefined) {
        continue;
      }
      const elem = resolveDispatchNumber(dispatch.elem, dispatch.elemExpression, fighter, opponent, owner);
      const elemTime = resolveDispatchNumber(dispatch.elemTime, dispatch.elemTimeExpression, fighter, opponent, owner);
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
        activateReversalDef(fighter, rawController, operation);
      } else if (dispatch.effect === "width") {
        recordControllerExecution(fighter, rawController);
        const operation = controller.operation?.kind === "collision" && controller.operation.controllerType === "width" ? controller.operation : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyWidthController(fighter, rawController, operation);
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
        applySprPriorityController(fighter, rawController, operation);
      } else if (dispatch.effect === "palfx") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === "palfx"
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyPalFxController(fighter, rawController, operation);
      } else if (dispatch.effect === "afterimage") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === "afterimage"
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyAfterImageController(fighter, rawController, operation);
      } else if (dispatch.effect === "afterimagetime") {
        recordControllerExecution(fighter, rawController);
        const operation =
          controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === "afterimagetime"
            ? controller.operation
            : undefined;
        if (operation) {
          recordControllerOperation(fighter, operation);
        }
        applyAfterImageTimeController(fighter, rawController, operation);
      } else if (dispatch.effect === "explod") {
        recordControllerExecution(fighter, rawController);
        createExplod(fighter, opponent, rawController, controller.operation?.kind === "explod" ? controller.operation : undefined);
      } else if (dispatch.effect === "removeexplod") {
        recordControllerExecution(fighter, rawController);
        removeExplods(fighter, rawController, controller.operation?.kind === "removeexplod" ? controller.operation : undefined);
      } else if (dispatch.effect === "helper") {
        recordControllerExecution(fighter, rawController);
        createHelper(fighter, opponent, rawController, controller.operation?.kind === "helper" ? controller.operation : undefined);
      } else if (dispatch.effect === "projectile") {
        recordControllerExecution(fighter, rawController);
        createProjectile(fighter, opponent, rawController, controller.operation?.kind === "projectile" ? controller.operation : undefined);
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
      } else if (dispatch.effect === "envshake") {
        recordControllerExecution(fighter, rawController);
        recordEnvShakeEvent(fighter, rawController, tick);
      }
    }
  }
}

function applyWidthController(
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: Extract<CollisionControllerOp, { controllerType: "width" }>,
): void {
  const pair = operation ? undefined : numberPair(findParam(controller, "player") ?? findParam(controller, "value"));
  const front = operation?.front ?? pair?.[0];
  if (front === undefined) {
    return;
  }
  fighter.runtime.bodyWidth = {
    front: clampBodyWidth(front),
    back: clampBodyWidth(operation?.back ?? pair?.[1] ?? front),
  };
}

function applySprPriorityController(
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "sprpriority" }>,
): void {
  applyRuntimeSpritePriorityController(fighter.runtime, controller, operation);
}

function applyPalFxController(
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "palfx" }>,
): void {
  applyRuntimePaletteFxController(fighter.runtime, controller, operation);
}

function tickHitBySlots(state: CharacterRuntimeState): void {
  if (!state.hitBy) {
    return;
  }
  const next = { ...state.hitBy };
  next.slot1 = tickHitBySlot(next.slot1);
  next.slot2 = tickHitBySlot(next.slot2);
  state.hitBy = next.slot1 || next.slot2 ? next : undefined;
}

function tickHitBySlot(slot: RuntimeHitBySlot | undefined): RuntimeHitBySlot | undefined {
  if (!slot || slot.remaining === Number.POSITIVE_INFINITY) {
    return slot;
  }
  const remaining = Math.max(0, slot.remaining - 1);
  return remaining > 0 ? { ...slot, remaining } : undefined;
}

function tickHitOverrideSlots(state: CharacterRuntimeState): void {
  if (!state.hitOverrides) {
    return;
  }
  const next = state.hitOverrides
    .map((slot) => tickHitOverrideSlot(slot))
    .filter((slot): slot is RuntimeHitOverrideSlot => slot !== undefined);
  state.hitOverrides = next.length > 0 ? next : undefined;
}

function tickHitOverrideSlot(slot: RuntimeHitOverrideSlot | undefined): RuntimeHitOverrideSlot | undefined {
  if (!slot || slot.remaining === Number.POSITIVE_INFINITY) {
    return slot;
  }
  const remaining = Math.max(0, slot.remaining - 1);
  return remaining > 0 ? { ...slot, remaining } : undefined;
}

function resetAssertSpecial(state: CharacterRuntimeState): void {
  state.assertSpecial = undefined;
  state.renderOpacity = undefined;
}

function applyAfterImageController(
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimage" }>,
): void {
  applyRuntimeAfterImageController(fighter.runtime, controller, () => createAfterImageSample(fighter), operation);
}

function applyAfterImageTimeController(
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "afterimagetime" }>,
): void {
  applyRuntimeAfterImageTimeController(fighter.runtime, controller, operation);
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

function createExplod(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  controller: MugenStateController,
  operation?: ExplodControllerOp,
): void {
  const animNo = operation?.animNo ?? firstNumber(findParam(controller, "anim"));
  if (animNo === undefined) {
    return;
  }
  const owner = fighter.stateOwner ?? fighter;
  const action = owner.definition.animations.get(animNo);
  if (!action || action.frames.length === 0) {
    return;
  }
  const localPos = operation?.pos ?? numberPair(findParam(controller, "pos")) ?? [0, 0];
  const postype = operation?.postype ?? findParam(controller, "postype");
  const worldPos = resolveExplodPosition(fighter, opponent, postype, localPos);
  fighter.effectActorWorld.spawnExplod(fighter.id, {
    controller,
    operation,
    ownerId: fighter.id,
    rootId: fighter.id,
    parentId: fighter.id,
    spriteOwnerId: owner.id,
    spriteOwnerDefinitionId: owner.definition.id,
    spriteOwnerLabel: owner.label,
    action,
    animNo,
    pos: worldPos,
    bind: resolveExplodBind(postype, localPos),
    fallbackFacing: fighter.runtime.facing,
    defaultRemoveTime: actionDuration(action),
  });
  if (operation) {
    recordControllerOperation(fighter, operation);
  }
}

function removeExplods(fighter: FighterMatchState, controller: MugenStateController, operation?: RemoveExplodControllerOp): void {
  fighter.effectActorWorld.removeExplods(fighter.id, operation?.explodId ?? firstNumber(findParam(controller, "id")));
  if (operation) {
    recordControllerOperation(fighter, operation);
  }
}

function advancePresentationEffects(fighter: FighterMatchState): void {
  fighter.effectActorWorld.advancePresentationEffects(fighter.id, {
    pos: fighter.runtime.pos,
    facing: fighter.runtime.facing,
  });
}

function advancePausedPresentationEffects(fighter: FighterMatchState, pauseKind: RuntimeExplodPauseKind): void {
  fighter.effectActorWorld.advancePresentationEffects(
    fighter.id,
    {
      pos: fighter.runtime.pos,
      facing: fighter.runtime.facing,
    },
    { pauseKind },
  );
}

function toExplodSnapshots(fighter: FighterMatchState): ActorSnapshot[] {
  return fighter.effectActorWorld.explodSnapshots(fighter.id, fighter.runtime.stateNo);
}

function createHelper(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  controller: MugenStateController,
  operation?: HelperControllerOp,
): void {
  const owner = fighter.stateOwner ?? fighter;
  const stateNo = operation?.stateNo ?? firstNumber(findParam(controller, "stateno") ?? findParam(controller, "value"));
  const state = owner.runtimeProgram?.states.find((candidate) => candidate.id === stateNo)?.source ?? owner.definition.states?.find((candidate) => candidate.id === stateNo);
  const animNo = operation?.animNo ?? firstNumber(findParam(controller, "anim")) ?? state?.anim ?? stateNo ?? fighter.runtime.animNo;
  const action = owner.definition.animations.get(animNo);
  if (!action || action.frames.length === 0) {
    return;
  }
  const localPos = operation?.pos ?? numberPair(findParam(controller, "pos")) ?? [0, 0];
  const worldPos = resolveExplodPosition(fighter, opponent, operation?.postype ?? findParam(controller, "postype"), localPos);
  fighter.effectActorWorld.spawnHelper(fighter.id, {
    controller,
    operation,
    ownerId: fighter.id,
    rootId: fighter.id,
    parentId: fighter.id,
    spriteOwnerId: owner.id,
    spriteOwnerDefinitionId: owner.definition.id,
    spriteOwnerLabel: owner.label,
    action,
    stateNo,
    animNo,
    pos: worldPos,
    fallbackFacing: fighter.runtime.facing,
  });
  if (operation) {
    recordControllerOperation(fighter, operation);
  }
}

function toHelperSnapshots(fighter: FighterMatchState): ActorSnapshot[] {
  return fighter.effectActorWorld.helperSnapshots(fighter.id, fighter.runtime.stateNo);
}

function createProjectile(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  controller: MugenStateController,
  operation?: ProjectileControllerOp,
): void {
  const owner = fighter.stateOwner ?? fighter;
  const animNo = operation?.projAnim ?? firstNumber(findParam(controller, "projanim") ?? findParam(controller, "anim")) ?? 0;
  const action = owner.definition.animations.get(animNo);
  if (!action || action.frames.length === 0) {
    return;
  }
  const localPos = operation?.offset ?? operation?.pos ?? numberPair(findParam(controller, "offset") ?? findParam(controller, "pos")) ?? [0, 0];
  const worldPos = resolveExplodPosition(fighter, opponent, operation?.postype ?? findParam(controller, "postype"), localPos);
  fighter.effectActorWorld.spawnProjectile(fighter.id, {
    controller,
    operation,
    ownerId: fighter.id,
    rootId: fighter.id,
    parentId: fighter.id,
    spriteOwnerId: owner.id,
    spriteOwnerDefinitionId: owner.definition.id,
    spriteOwnerLabel: owner.label,
    action,
    animNo,
    terminalActions: resolveProjectileTerminalActions(owner, controller, operation),
    pos: worldPos,
    fallbackFacing: fighter.runtime.facing,
    damageScale: fighter.runtime.attackMultiplier,
  });
  if (operation) {
    recordControllerOperation(fighter, operation);
  }
}

function resolveProjectileTerminalActions(
  owner: FighterMatchState,
  controller: MugenStateController,
  operation?: ProjectileControllerOp,
): RuntimeProjectileSpawnInput["terminalActions"] {
  const hitAnim = operation?.hitAnim ?? firstNumber(findParam(controller, "projhitanim"));
  const removeAnim = operation?.removeAnim ?? firstNumber(findParam(controller, "projremanim"));
  const cancelAnim = operation?.cancelAnim ?? firstNumber(findParam(controller, "projcancelanim"));
  return {
    hit: hitAnim === undefined ? undefined : owner.definition.animations.get(hitAnim),
    remove: removeAnim === undefined ? undefined : owner.definition.animations.get(removeAnim),
    cancel: cancelAnim === undefined ? undefined : owner.definition.animations.get(cancelAnim),
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
  const requestedId = operation?.requestedId ?? firstNumber(findParam(controller, "id")) ?? -1;
  const target = fighter.targetWorld.find(fighter, opponent.id, requestedId);
  if (!target) {
    return;
  }
  const bindParams = operation ? { pos: operation.pos, postype: operation.postype } : bindToTargetParams(controller);
  const offset = bindToTargetOffset(opponent, bindParams);
  fighter.bindToTarget = createRuntimeTargetBinding({
    actorId: opponent.id,
    targetId: target.targetId,
    remaining: operation?.time ?? firstNumber(findParam(controller, "time")) ?? 1,
    offset,
  });
  recordControllerOperation(fighter, operation ?? { kind: "bindtotarget", requestedId, pos: bindParams.pos, postype: bindParams.postype, time: fighter.bindToTarget.remaining });
  applyBindToTarget(fighter, opponent);
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
  for (const binding of fighter.targetBindings) {
    if (binding.actorId !== opponent.id) {
      continue;
    }
    opponent.runtime.pos = resolveRuntimeTargetBindingPosition(fighter.runtime.pos, fighter.runtime.facing, binding);
  }
}

function applyBindToTarget(fighter: FighterMatchState, opponent: FighterMatchState): void {
  const binding = fighter.bindToTarget;
  if (!binding || binding.actorId !== opponent.id) {
    return;
  }
  fighter.runtime.pos = resolveRuntimeTargetBindingPosition(opponent.runtime.pos, opponent.runtime.facing, binding);
}

function bindToTargetParams(controller: MugenStateController): { pos: [number, number]; postype: "foot" | "mid" | "head" } {
  const raw = findParam(controller, "pos");
  if (!raw) {
    return { pos: [0, 0], postype: "foot" };
  }
  const parts = raw.split(",").map((part) => part.trim());
  const pair = numberPair(raw) ?? [0, 0];
  return {
    pos: [pair[0], pair[1] ?? 0],
    postype: normalizeBindToTargetPostype(parts[2]),
  };
}

function bindToTargetOffset(target: FighterMatchState, params: { pos: [number, number]; postype: "foot" | "mid" | "head" }): { x: number; y: number } {
  const anchor = bindToTargetAnchor(target, params.postype);
  return {
    x: anchor.x + params.pos[0],
    y: anchor.y + params.pos[1],
  };
}

function bindToTargetAnchor(target: FighterMatchState, postype: "foot" | "mid" | "head"): { x: number; y: number } {
  if (postype === "foot") {
    return { x: 0, y: 0 };
  }
  const key = postype === "head" ? "size.head.pos" : "size.mid.pos";
  return {
    x: runtimeConst(target.definition, `${key}.x`) ?? runtimeConst(target.definition, key) ?? 0,
    y: runtimeConst(target.definition, `${key}.y`) ?? 0,
  };
}

function normalizeBindToTargetPostype(value: string | undefined): "foot" | "mid" | "head" {
  const normalized = value?.replace(/^"|"$/g, "").trim().toLowerCase();
  return normalized === "mid" || normalized === "head" ? normalized : "foot";
}

function rememberTarget(attacker: FighterMatchState, defender: FighterMatchState, targetId: number | undefined): void {
  attacker.targetWorld.remember(attacker, defender.id, targetId);
}

function resetContactState(fighter: FighterMatchState): void {
  fighter.contact = {};
}

function markMoveContact(fighter: FighterMatchState, kind: "hit" | "guard"): void {
  fighter.contact.moveContactState = fighter.runtime.stateNo;
  if (kind === "hit") {
    fighter.contact.moveHitState = fighter.runtime.stateNo;
  } else {
    fighter.contact.moveGuardState = fighter.runtime.stateNo;
  }
}

function markProjectileContact(fighter: FighterMatchState, projectileId: number | undefined, kind: "hit" | "guard"): void {
  fighter.contact.projectileContactState = fighter.runtime.stateNo;
  fighter.contact.projectileId = projectileId;
  fighter.contact.projectileContactTime = 0;
  if (kind === "hit") {
    fighter.contact.projectileHitState = fighter.runtime.stateNo;
    fighter.contact.projectileHitTime = 0;
  } else {
    fighter.contact.projectileGuardState = fighter.runtime.stateNo;
    fighter.contact.projectileGuardTime = 0;
  }
}

function advanceContactTimers(fighter: FighterMatchState): void {
  if (fighter.contact.projectileContactTime !== undefined) {
    fighter.contact.projectileContactTime += 1;
  }
  if (fighter.contact.projectileHitTime !== undefined) {
    fighter.contact.projectileHitTime += 1;
  }
  if (fighter.contact.projectileGuardTime !== undefined) {
    fighter.contact.projectileGuardTime += 1;
  }
}

function hasMoveContact(fighter: FighterMatchState, kind: "contact" | "hit" | "guard"): boolean {
  if (kind === "hit") {
    return fighter.contact.moveHitState === fighter.runtime.stateNo;
  }
  if (kind === "guard") {
    return fighter.contact.moveGuardState === fighter.runtime.stateNo;
  }
  return fighter.contact.moveContactState === fighter.runtime.stateNo;
}

function hasProjectileContact(fighter: FighterMatchState, kind: "contact" | "hit" | "guard", projectileId?: number): boolean {
  if (projectileId !== undefined && fighter.contact.projectileId !== projectileId) {
    return false;
  }
  if (kind === "hit") {
    return fighter.contact.projectileHitState === fighter.runtime.stateNo;
  }
  if (kind === "guard") {
    return fighter.contact.projectileGuardState === fighter.runtime.stateNo;
  }
  return fighter.contact.projectileContactState === fighter.runtime.stateNo;
}

function projectileContactTime(fighter: FighterMatchState, kind: "contact" | "hit" | "guard", projectileId?: number): number {
  if (projectileId !== undefined && fighter.contact.projectileId !== projectileId) {
    return -1;
  }
  if (kind === "hit") {
    return fighter.contact.projectileHitState === fighter.runtime.stateNo ? fighter.contact.projectileHitTime ?? 0 : -1;
  }
  if (kind === "guard") {
    return fighter.contact.projectileGuardState === fighter.runtime.stateNo ? fighter.contact.projectileGuardTime ?? 0 : -1;
  }
  return fighter.contact.projectileContactState === fighter.runtime.stateNo ? fighter.contact.projectileContactTime ?? 0 : -1;
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

function advanceActiveEffects(fighter: FighterMatchState, stage: MugenStageDefinition): void {
  fighter.effectActorWorld.advanceActiveEffects(fighter.id, stage);
}

function resolveProjectileCombat(attacker: FighterMatchState, defender: FighterMatchState, log: (line: string) => void): void {
  const hurtBoxes = getCurrentFrame(defender)?.clsn2 ?? [{ x1: -24, y1: -96, x2: 24, y2: 0 }];
  attacker.effectActorWorld.resolveProjectileCombat(attacker.id, {
    attacker,
    defender,
    hurtBoxes,
    holdingBack: isRuntimeHoldingBack(defender.currentInput),
    log,
    rememberTarget,
    applyHitOverride,
    applyGuardHit: applyDefaultGuardHitState,
    markDefenderGotHit: markFighterGotHit,
    recordProjectileContact: (source, _target, projectile, kind) => markProjectileContact(source, projectile.projectileId, kind),
  });
}

function resolveProjectileClashes(left: FighterMatchState, right: FighterMatchState, log: (line: string) => void): void {
  left.effectActorWorld.resolveProjectileClashes(left.id, right.id, {
    leftLabel: left.label,
    rightLabel: right.label,
    log,
  });
}

function toProjectileSnapshots(fighter: FighterMatchState): ActorSnapshot[] {
  return fighter.effectActorWorld.projectileSnapshots(fighter.id, fighter.runtime.stateNo);
}

function resolveExplodPosition(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  postype: string | undefined,
  localPos: [number, number],
): { x: number; y: number } {
  const type = postype?.trim().toLowerCase() ?? "p1";
  if (type === "p2") {
    return { x: opponent.runtime.pos.x + localPos[0] * opponent.runtime.facing, y: opponent.runtime.pos.y + localPos[1] };
  }
  if (type === "front") {
    return { x: fighter.runtime.pos.x + localPos[0] * fighter.runtime.facing + 48 * fighter.runtime.facing, y: fighter.runtime.pos.y + localPos[1] };
  }
  if (type === "back") {
    return { x: fighter.runtime.pos.x + localPos[0] * fighter.runtime.facing - 48 * fighter.runtime.facing, y: fighter.runtime.pos.y + localPos[1] };
  }
  if (type === "left") {
    return { x: localPos[0], y: localPos[1] };
  }
  return { x: fighter.runtime.pos.x + localPos[0] * fighter.runtime.facing, y: fighter.runtime.pos.y + localPos[1] };
}

function resolveExplodBind(postype: string | undefined, localPos: [number, number]): { localOffset: { x: number; y: number } } | undefined {
  const type = postype?.trim().toLowerCase() ?? "p1";
  if (type === "front") {
    return { localOffset: { x: localPos[0] + 48, y: localPos[1] } };
  }
  if (type === "back") {
    return { localOffset: { x: localPos[0] - 48, y: localPos[1] } };
  }
  if (type === "p1") {
    return { localOffset: { x: localPos[0], y: localPos[1] } };
  }
  return undefined;
}

function recordSoundEvent(
  fighter: FighterMatchState,
  controller: MugenStateController,
  runtimeTick: number,
): void {
  pushRuntimeSoundEvent(fighter.soundEvents, createRuntimeSoundEvent(fighter, controller, runtimeTick));
}

function recordEnvShakeEvent(fighter: FighterMatchState, controller: MugenStateController, runtimeTick: number): void {
  const event = createRuntimeEnvShakeEvent(fighter, controller, runtimeTick);
  if (!event) {
    return;
  }
  pushRuntimeEnvShakeEvent(fighter.envShakeEvents, event);
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

function resolveDirectHitDefPriority(left: FighterMatchState, right: FighterMatchState, log: (line: string) => void): void {
  const leftMove = getActiveDirectHitDefMove(left);
  const rightMove = getActiveDirectHitDefMove(right);
  if (!leftMove || !rightMove) {
    return;
  }
  const leftBox = runtimeWorldBox(left.runtime, leftMove.hitbox);
  const rightBox = runtimeWorldBox(right.runtime, rightMove.hitbox);
  if (!collisionBoxesIntersect(leftBox, rightBox)) {
    return;
  }
  const leftPriority = clampHitDefPriority(leftMove.priority ?? 4);
  const rightPriority = clampHitDefPriority(rightMove.priority ?? 4);
  if (leftPriority === rightPriority) {
    left.hasHit = true;
    right.hasHit = true;
    log(`HitDef priority clash: ${left.label} priority ${leftPriority} traded with ${right.label} priority ${rightPriority}`);
    return;
  }
  const winner = leftPriority > rightPriority ? left : right;
  const loser = winner === left ? right : left;
  winner.hasHit = false;
  loser.hasHit = true;
  log(`HitDef priority clash: ${winner.label} priority ${Math.max(leftPriority, rightPriority)} beat ${loser.label} priority ${Math.min(leftPriority, rightPriority)}`);
}

function getActiveDirectHitDefMove(fighter: FighterMatchState): DemoMove | undefined {
  const move = fighter.currentMove;
  if (!move || fighter.hasHit || move.requiresHitDef || move.isReversal || !isMoveActive(move, fighter.moveTick)) {
    return undefined;
  }
  return move;
}

function activateReversalDef(
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: ReversalDefControllerOp,
): void {
  const attr = (operation?.attr ?? stripMugenString(findParam(controller, "reversal.attr")))?.trim() ?? "";
  if (!attr) {
    if (fighter.currentMove?.isReversal) {
      fighter.currentMove = undefined;
      fighter.currentMoveLabel = undefined;
      fighter.moveTick = 0;
      fighter.hasHit = false;
    }
    fighter.runtime.reversal = undefined;
    return;
  }

  const frame = getCurrentFrame(fighter);
  const hitbox = frame?.clsn1[0];
  if (!hitbox) {
    fighter.runtime.reversal = undefined;
    return;
  }

  const hitPause = operation?.hitPause ?? Math.max(0, Math.round(firstNumber(findParam(controller, "pausetime")) ?? 0));
  const p1StateNo = operation?.p1StateNo ?? firstNumber(findParam(controller, "p1stateno"));
  const p2StateNo = operation?.p2StateNo ?? firstNumber(findParam(controller, "p2stateno"));
  const targetId = operation?.targetId ?? firstNumber(findParam(controller, "id"));
  fighter.currentMove = {
    actionId: fighter.runtime.stateNo,
    startup: 0,
    activeStart: 0,
    activeEnd: 3600,
    recovery: 3600,
    damage: 0,
    attr: "S,NA",
    targetId,
    isReversal: true,
    reversalAttr: attr,
    p1StateNo,
    p2StateNo,
    hitPause,
    hitStun: 0,
    push: 0,
    hitbox: cloneBox(hitbox),
  };
  fighter.currentMoveLabel = controller.name ?? "ReversalDef";
  fighter.hasHit = false;
  fighter.runtime.reversal = {
    attr,
    hitPause,
    ...(p1StateNo !== undefined ? { p1StateNo } : {}),
    ...(p2StateNo !== undefined ? { p2StateNo } : {}),
  };
}

function resolveCombat(attacker: FighterMatchState, defender: FighterMatchState, log: (line: string) => void): void {
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
  const reversal = findActiveReversal(defender, move, attackBox);
  if (reversal) {
    applyReversal(defender, attacker, reversal, log);
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
    applyHitOverride(attacker, defender, override, move.hitPause, log);
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
  if (result.kind === "guard") {
    markMoveContact(attacker, "guard");
    interruptCurrentMove(defender);
    attacker.hitPause = result.pause;
    defender.hitPause = result.pause;
    defender.runtime.guardStun = result.stun;
    defender.runtime.guardSlideTime = result.slideTime ?? 0;
    defender.runtime.guardControlTime = result.controlTime ?? 0;
    defender.runtime.guarding = true;
    defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
    defender.runtime.vel.x = attacker.runtime.facing * result.push;
    defender.runtime.hitVelocity = { x: attacker.runtime.facing * result.push, y: result.hitVelocityY ?? 0 };
    if (result.hitVelocityY !== undefined) {
      defender.runtime.vel.y = result.hitVelocityY;
    }
    markFighterGotHit(defender);
    defender.runtime.ctrl = false;
    attacker.runtime.power = Math.min(3000, attacker.runtime.power + result.powerGain);
    applyDefaultGuardHitState(defender);
    log(`${defender.label} guarded ${attacker.label} for ${result.damage}`);
    return;
  }

  markMoveContact(attacker, "hit");
  attacker.hitPause = result.pause;
  interruptCurrentMove(defender);
  defender.hitPause = result.pause;
  defender.hitStun = result.stun;
  defender.runtime.guardStun = 0;
  defender.runtime.guardSlideTime = 0;
  defender.runtime.guardControlTime = 0;
  defender.runtime.guarding = false;
  defender.runtime.life = applyRuntimeDamage(defender.runtime.life, result.damage, canRuntimeDamageKill(defender.runtime, result.kill));
  defender.runtime.vel.x = attacker.runtime.facing * result.push;
  defender.runtime.hitVelocity = { x: attacker.runtime.facing * result.push, y: result.hitVelocityY ?? 0 };
  defender.runtime.hitFall = runtimeHitFallFromMove(move, attacker.runtime.facing);
  if (result.hitVelocityY !== undefined) {
    defender.runtime.vel.y = result.hitVelocityY;
  }
  markFighterGotHit(defender);
  attacker.runtime.power = Math.min(3000, attacker.runtime.power + result.powerGain);
  applyHitStateTransitions(attacker, defender, move);
  applyDefaultGetHitState(defender, move);
  log(`${attacker.label} hit ${defender.label} for ${result.damage}`);
}

function interruptCurrentMove(fighter: FighterMatchState): void {
  fighter.currentMove = undefined;
  fighter.currentMoveLabel = undefined;
  fighter.moveTick = 0;
  fighter.hasHit = false;
}

function markFighterGotHit(fighter: FighterMatchState): void {
  fighter.runtime.moveType = "H";
  fighter.effectActorWorld.removeExplodsOnGetHit(fighter.id);
}

function recordFallEnvShakeEvent(
  fighter: FighterMatchState,
  runtimeTick: number,
  operation?: FallEnvShakeControllerOp,
): void {
  const hitFall = fighter.runtime.hitFall;
  const event = createRuntimeFallEnvShakeEvent(fighter, runtimeTick);
  if (!event || !hitFall) {
    return;
  }
  pushRuntimeEnvShakeEvent(fighter.envShakeEvents, event);
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

function runtimeHitFallFromMove(move: DemoMove, attackerFacing: 1 | -1): CharacterRuntimeState["hitFall"] | undefined {
  const fall = move.fall;
  if (!fall) {
    return undefined;
  }
  const xVelocity = fall.velocity?.x;
  return {
    falling: fall.enabled,
    damage: Math.max(0, fall.damage ?? 0),
    kill: fall.kill,
    recover: fall.recover,
    recoverTime: fall.recoverTime,
    downRecover: fall.downRecover ?? true,
    downRecoverTime: fall.downRecoverTime,
    velocity: {
      x: xVelocity !== undefined ? attackerFacing * Math.abs(xVelocity) : undefined,
      y: fall.velocity?.y ?? move.hitVelocityY ?? -4.5,
    },
    envShake: fall.envShake,
  };
}

function advanceHitFallRecoveryWindow(fighter: FighterMatchState): void {
  const hitFall = fighter.runtime.hitFall;
  if (!hitFall?.recover || hitFall.recoverTime === undefined || hitFall.recoverTime <= 0) {
    return;
  }
  fighter.runtime.hitFall = {
    ...hitFall,
    recoverTime: Math.max(0, hitFall.recoverTime - 1),
  };
}

function advanceCommon1LieDownRecovery(fighter: FighterMatchState): void {
  if (fighter.runtime.stateNo !== 5110 || fighter.runtime.life <= 0) {
    return;
  }
  const hitFall = ensureDownRecoveryTime(fighter);
  if (!hitFall) {
    return;
  }
  if ((hitFall.downRecoverTime ?? 0) <= 0) {
    if (fighter.stateElapsed >= 1 && canEnterState(fighter, 5120)) {
      enterState(fighter, 5120, undefined, { clearStateOwner: true });
    }
    return;
  }
  fighter.runtime.hitFall = {
    ...hitFall,
    downRecoverTime: Math.max(0, (hitFall.downRecoverTime ?? 0) - 1),
  };
}

function advanceImportedGroundRecoveryLanding(fighter: FighterMatchState): void {
  if (!isImportedGroundRecoveryLandingState(fighter) || fighter.runtime.life <= 0) {
    return;
  }
  if (fighter.runtime.vel.y <= 0 || fighter.runtime.pos.y < 0 || !canEnterState(fighter, 52)) {
    return;
  }
  fighter.runtime.pos.y = 0;
  fighter.runtime.vel.y = 0;
  enterState(fighter, 52, undefined, { clearStateOwner: true });
}

function isImportedGroundRecoveryLandingState(fighter: FighterMatchState): boolean {
  if (fighter.definition.source !== "imported" && fighter.stateOwner?.definition.source !== "imported") {
    return false;
  }
  return fighter.runtime.stateNo === 5201 && fighter.runtime.physics === "A";
}

function ensureDownRecoveryTime(fighter: FighterMatchState): CharacterRuntimeState["hitFall"] | undefined {
  const hitFall = fighter.runtime.hitFall;
  if (!hitFall) {
    return undefined;
  }
  if (hitFall.downRecoverTime !== undefined) {
    return hitFall;
  }
  const downRecoverTime = defaultDownRecoverTime(fighter.definition);
  fighter.runtime.hitFall = {
    ...hitFall,
    downRecover: hitFall.downRecover ?? true,
    downRecoverTime,
  };
  return fighter.runtime.hitFall;
}

function defaultDownRecoverTime(definition: DemoFighterDefinition): number {
  return Math.max(0, Math.round(definition.constants?.["data.liedown.time"] ?? 60));
}

function applyHitOverride(
  attacker: FighterMatchState,
  defender: FighterMatchState,
  override: RuntimeHitOverrideSlot,
  hitPause: number,
  log: (line: string) => void,
): void {
  attacker.hitPause = hitPause;
  defender.hitPause = hitPause;
  defender.hitStun = 0;
  defender.runtime.guardStun = 0;
  defender.runtime.guardSlideTime = 0;
  defender.runtime.guardControlTime = 0;
  defender.runtime.guarding = override.forceGuard ?? false;
  if (override.forceGuard) {
    markFighterGotHit(defender);
  }
  if (override.forceAir) {
    defender.runtime.stateType = "A";
    defender.runtime.physics = "A";
  }
  if (!override.keepState && override.stateNo !== undefined && canEnterState(defender, override.stateNo)) {
    enterState(defender, override.stateNo);
  }
  const targetState = override.stateNo !== undefined ? ` to state ${override.stateNo}` : "";
  log(`${defender.label} HitOverride slot ${override.slot} redirected ${attacker.label}${targetState}`);
}

function findActiveReversal(
  defender: FighterMatchState,
  incomingMove: DemoMove,
  incomingAttackBox: CollisionBox,
): DemoMove | undefined {
  const reversal = defender.currentMove;
  if (!reversal?.isReversal || defender.hasHit || !reversal.reversalAttr) {
    return undefined;
  }
  if (!isMoveActive(reversal, defender.moveTick)) {
    return undefined;
  }
  if (!hitAttributeMatches(reversal.reversalAttr, incomingMove.attr ?? "S,NA")) {
    return undefined;
  }
  return collisionBoxesIntersect(runtimeWorldBox(defender.runtime, reversal.hitbox), incomingAttackBox) ? reversal : undefined;
}

function applyReversal(
  reverser: FighterMatchState,
  attacker: FighterMatchState,
  reversal: DemoMove,
  log: (line: string) => void,
): void {
  reverser.hasHit = true;
  attacker.hasHit = true;
  rememberTarget(reverser, attacker, reversal.targetId);
  reverser.hitPause = reversal.hitPause;
  attacker.hitPause = reversal.hitPause;
  attacker.hitStun = 0;
  attacker.currentMove = undefined;
  attacker.currentMoveLabel = undefined;
  attacker.moveTick = 0;
  attacker.runtime.guardStun = 0;
  attacker.runtime.guardSlideTime = 0;
  attacker.runtime.guardControlTime = 0;
  attacker.runtime.guarding = false;
  markFighterGotHit(attacker);
  reverser.runtime.power = Math.min(3000, reverser.runtime.power + 25);

  const p1StateNo = reversal.p1StateNo;
  const p2StateNo = reversal.p2StateNo;
  if (p1StateNo !== undefined && canEnterState(reverser, p1StateNo)) {
    enterState(reverser, p1StateNo);
  } else {
    clearReversal(reverser);
  }
  if (p2StateNo !== undefined) {
    enterTargetHitState(attacker, reverser, p2StateNo, true);
  }

  const p1 = p1StateNo !== undefined ? ` p1->${p1StateNo}` : "";
  const p2 = p2StateNo !== undefined ? ` p2->${p2StateNo}` : "";
  log(`${reverser.label} reversed ${attacker.label}${p1}${p2}`);
}

function clearReversal(fighter: FighterMatchState): void {
  if (fighter.currentMove?.isReversal) {
    fighter.currentMove = undefined;
    fighter.currentMoveLabel = undefined;
    fighter.moveTick = 0;
  }
  fighter.runtime.reversal = undefined;
}

function applyHitStateTransitions(attacker: FighterMatchState, defender: FighterMatchState, move: DemoMove): void {
  if (move.p2StateNo !== undefined) {
    enterTargetHitState(defender, attacker, move.p2StateNo, move.p2GetP1State ?? true);
  }
  if (move.p1StateNo !== undefined && canEnterState(attacker, move.p1StateNo)) {
    enterState(attacker, move.p1StateNo);
  }
}

function applyDefaultGetHitState(defender: FighterMatchState, move: DemoMove): void {
  if (move.p2StateNo !== undefined || defender.definition.source !== "imported") {
    return;
  }
  const stateNo = move.defaultTargetStateNo ?? defaultGetHitStateNo(defender);
  if (stateNo === undefined || !canEnterState(defender, stateNo)) {
    return;
  }
  enterState(defender, stateNo, undefined, { clearStateOwner: true });
}

function applyDefaultGuardHitState(defender: FighterMatchState): void {
  if (defender.definition.source !== "imported") {
    return;
  }
  const stateNo = defaultGuardHitStateNo(defender);
  if (stateNo === undefined || !canEnterState(defender, stateNo)) {
    return;
  }
  enterState(defender, stateNo, undefined, { clearStateOwner: true });
}

function applyAutoGuardStart(defender: FighterMatchState, attacker: FighterMatchState): void {
  if (defender.definition.source !== "imported") {
    return;
  }
  if (!isRuntimeHoldingBack(defender.currentInput) || defender.currentMove || defender.hitPause > 0 || defender.hitStun > 0 || (defender.runtime.guardStun ?? 0) > 0) {
    return;
  }
  if (!defender.runtime.ctrl || defender.runtime.moveType === "H" || isGuardState(defender.runtime.stateNo)) {
    return;
  }
  if (!evaluateRuntimeInGuardDist(defender, attacker)) {
    return;
  }
  const stateNo = defaultGuardStartStateNo(defender);
  if (stateNo === undefined || !canEnterState(defender, stateNo)) {
    return;
  }
  enterState(defender, stateNo, undefined, { clearStateOwner: true });
  defender.runtime.ctrl = false;
  defender.runtime.vel.x = 0;
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

function defaultGetHitStateNo(defender: FighterMatchState): number | undefined {
  const preferred =
    defender.runtime.stateType === "A" ? [5020, 5000] : defender.runtime.stateType === "C" ? [5010, 5000] : [5000];
  return preferred.find((stateNo) => canEnterState(defender, stateNo));
}

function defaultGuardHitStateNo(defender: FighterMatchState): number | undefined {
  const preferred =
    defender.runtime.stateType === "A" ? [154, 150] : defender.runtime.stateType === "C" ? [152, 150] : [150];
  return preferred.find((stateNo) => canEnterState(defender, stateNo));
}

function defaultGuardStartStateNo(defender: FighterMatchState): number | undefined {
  const stateTypedGuard =
    defender.runtime.stateType === "A" ? [132, 120] : defender.runtime.stateType === "C" ? [131, 120] : [130, 120];
  return [120, ...stateTypedGuard].find((stateNo) => canEnterState(defender, stateNo));
}

function isGuardState(stateNo: number): boolean {
  return stateNo >= 120 && stateNo <= 155;
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

function updateFacing(self: FighterMatchState, opponent: FighterMatchState): void {
  if (self.runtime.assertSpecial?.noAutoTurn) {
    return;
  }
  self.runtime.facing = self.runtime.pos.x <= opponent.runtime.pos.x ? 1 : -1;
}

function clampStage(fighter: FighterMatchState, stage: MugenStageDefinition): void {
  if (fighter.runtime.screenBound?.bound === false) {
    return;
  }
  fighter.runtime.pos.x = Math.max(stage.bounds.left, Math.min(stage.bounds.right, fighter.runtime.pos.x));
}

function separateFighters(left: FighterMatchState, right: FighterMatchState): void {
  if (left.runtime.playerPush === false || right.runtime.playerPush === false) {
    return;
  }
  const minDistance = widthToward(left, right) + widthToward(right, left);
  const delta = right.runtime.pos.x - left.runtime.pos.x;
  const distance = Math.abs(delta);
  if (distance >= minDistance || distance === 0) {
    return;
  }
  const push = (minDistance - distance) / 2;
  const direction = delta > 0 ? 1 : -1;
  left.runtime.pos.x -= push * direction;
  right.runtime.pos.x += push * direction;
}

function widthToward(self: FighterMatchState, target: FighterMatchState): number {
  const width = self.runtime.bodyWidth ?? { front: 39, back: 39 };
  const targetIsInFront = (target.runtime.pos.x - self.runtime.pos.x) * self.runtime.facing >= 0;
  return targetIsInFront ? width.front : width.back;
}

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

function tryApplyStateEntry(fighter: FighterMatchState, opponent: FighterMatchState): boolean {
  const entries = fighter.runtimeProgram?.stateEntries ?? [];
  if (entries.length === 0) {
    return false;
  }

  for (const controller of entries) {
    const dispatch = dispatchStateProgramController(controller);
    if (dispatch.kind !== "change-state") {
      continue;
    }
    if (!triggersPass(controller, fighter, opponent)) {
      continue;
    }
    const stateId = resolveDispatchNumber(dispatch.stateId, dispatch.stateExpression, fighter, opponent);
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

function runStateEntrySetupControllers(fighter: FighterMatchState, opponent: FighterMatchState): void {
  const entries = fighter.runtimeProgram?.stateEntries ?? [];
  if (entries.length === 0 || fighter.definition.source !== "imported") {
    return;
  }
  for (const controller of entries) {
    const dispatch = dispatchStateProgramController(controller);
    if (dispatch.kind === "change-state") {
      continue;
    }
    if (!triggersPass(controller, fighter, opponent)) {
      continue;
    }
    if (isStateEntrySetupDispatch(dispatch)) {
      recordControllerExecution(fighter, controller.source);
      fighter.runtime = executeControllerIr(controller, fighter.runtime, () => undefined);
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
}

function recordControllerOperation(fighter: FighterMatchState, operation: ControllerOp): void {
  if (!isImportedCompatibilityActor(fighter)) {
    return;
  }
  const key = controllerOperationKey(operation);
  fighter.executedOperationCounts[key] = (fighter.executedOperationCounts[key] ?? 0) + 1;
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
): boolean {
  const triggerAll = controller.triggers.filter((trigger) => trigger.index === 0);
  if (!triggerAll.every((trigger) => evaluateRuntimeTrigger(trigger, fighter, opponent, owner))) {
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
    triggers.every((trigger) => evaluateRuntimeTrigger(trigger, fighter, opponent, owner)),
  );
}

function resolveDispatchNumber(
  value: number | undefined,
  expression: string | undefined,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
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
    stateTime: fighter.stateElapsed,
    animTimeRemaining: getAnimTimeRemaining(fighter),
    animElemTime: (elementNumber) => getAnimElemTime(fighter, elementNumber),
    animExists: (animationId) => fighter.definition.animations.has(animationId),
    commandActive: (name) => fighter.commandBuffer.isCommandActive(name, fighter.definition.commands ?? []),
    getConst: (name) => runtimeConst(owner.definition, name),
    getHitVar: (name) => runtimeHitVar(fighter.runtime, name),
    hitDefAttr: (filter) => (fighter.currentMove ? hitAttributeMatches(filter, fighter.currentMove.attr ?? "S,NA") : false),
    hitShakeOver: () => fighter.hitPause <= 0,
    hitOver: () => fighter.hitStun <= 0 && (fighter.runtime.guardStun ?? 0) <= 0,
    inGuardDist: () => evaluateRuntimeInGuardDist(fighter, opponent),
    moveContact: () => hasMoveContact(fighter, "contact"),
    moveHit: () => hasMoveContact(fighter, "hit"),
    moveGuarded: () => hasMoveContact(fighter, "guard"),
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
): boolean | undefined {
  if (value !== undefined) {
    return value;
  }
  const numberValue = resolveDispatchNumber(undefined, expression, fighter, opponent, owner);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

function evaluateRuntimeTrigger(
  trigger: ControllerIr["triggers"][number],
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
): boolean {
  return evaluateTriggerIr(trigger, {
    self: fighter.runtime,
    opponent: opponent.runtime,
    stateTime: fighter.stateElapsed,
    animTimeRemaining: getAnimTimeRemaining(fighter),
    animElemTime: (elementNumber) => getAnimElemTime(fighter, elementNumber),
    animExists: (animationId) => fighter.definition.animations.has(animationId),
    commandActive: (name) => fighter.commandBuffer.isCommandActive(name, fighter.definition.commands ?? []),
    getConst: (name) => runtimeConst(owner.definition, name),
    getHitVar: (name) => runtimeHitVar(fighter.runtime, name),
    hitDefAttr: (filter) => (fighter.currentMove ? hitAttributeMatches(filter, fighter.currentMove.attr ?? "S,NA") : false),
    hitShakeOver: () => fighter.hitPause <= 0,
    hitOver: () => fighter.hitStun <= 0 && (fighter.runtime.guardStun ?? 0) <= 0,
    inGuardDist: () => evaluateRuntimeInGuardDist(fighter, opponent),
    moveContact: () => hasMoveContact(fighter, "contact"),
    moveHit: () => hasMoveContact(fighter, "hit"),
    moveGuarded: () => hasMoveContact(fighter, "guard"),
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
  });
}

function runtimeConst(definition: DemoFighterDefinition, name: string): number | undefined {
  return definition.constants?.[name.trim().toLowerCase()];
}

function runtimeHitVar(state: CharacterRuntimeState, name: string): number | undefined {
  const key = name.trim().toLowerCase();
  if (key === "fall") {
    return state.hitFall?.falling ? 1 : 0;
  }
  if (key === "fall.damage") {
    return state.hitFall?.damage ?? 0;
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

function clampBodyWidth(value: number): number {
  return Math.max(1, Math.min(160, Math.abs(Math.round(value))));
}

function clampHitDefPriority(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function actionDuration(action: MugenAnimationAction): number {
  return action.frames.reduce((total, frame) => total + Math.max(1, frame.duration), 0);
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
