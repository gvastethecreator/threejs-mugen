import { compileRuntimeProgram } from "../compiler/StateControllerCompiler";
import type {
  EnvColorControllerOp,
  PauseControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr, RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { RuntimeActorConstraintControllerDispatchWorld, RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import { RuntimeAudioControllerDispatchWorld, RuntimeAudioWorld } from "./AudioEventSystem";
import { CommandBuffer } from "./CommandBuffer";
import {
  RuntimeContactControllerDispatchWorld,
  RuntimeContactMemoryWorld,
  type RuntimeContactMemory,
} from "./ContactMemorySystem";
import { RuntimeEnvColorControllerDispatchWorld, RuntimeEnvColorWorld } from "./EnvColorSystem";
import {
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  hasRuntimeBoxContact,
  hitAttributeMatches,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
  scaleRuntimeIncomingDamage,
} from "./CombatResolver";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "./demoFighters";
import { RuntimeDirectCombatWorld } from "./DirectCombatSystem";
import {
  RuntimeEnvShakeControllerDispatchWorld,
  RuntimeEnvShakeWorld,
  RuntimeFallEnvShakeControllerDispatchWorld,
} from "./EnvShakeSystem";
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
  isRuntimeEffectSpawnControllerDispatchEffect,
  RuntimeEffectSpawnControllerDispatchWorld,
  RuntimeEffectSpawnWorld,
} from "./EffectSpawnSystem";
import { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import { RuntimeGuardWorld } from "./GuardSystem";
import { RuntimeHitStateTransitionWorld } from "./HitStateTransitionSystem";
import { isRuntimeHoldingBack } from "./RuntimeInput";
import { RuntimeInputControlWorld } from "./RuntimeInputControlSystem";
import { RuntimeExpressionContextWorld, runtimeDefinitionConst } from "./RuntimeExpressionContextSystem";
import { RuntimeGuardDistanceWorld } from "./RuntimeGuardDistanceSystem";
import { RuntimeContactPresentationWorld } from "./RuntimeContactPresentationSystem";
import { RuntimeRoundSystem } from "./RuntimeRoundSystem";
import { createRuntimeRandomSeed, nextRuntimeRandomUnit } from "./RuntimeRandomSystem";
import {
  applyRuntimeControl,
  applyRuntimePowerDelta,
  runtimeLifeMaxFromConstants,
  runtimePowerMaxFromConstants,
} from "./RuntimeResourceSystem";
import { RuntimeSnapshotWorld } from "./RuntimeSnapshotSystem";
import { RuntimeOrientationWorld } from "./OrientationSystem";
import { RuntimeMatchInteractionWorld } from "./MatchInteractionSystem";
import { RuntimeRecoverySystem } from "./RuntimeRecoverySystem";
import { RuntimeHitEligibilityWorld } from "./RuntimeHitEligibilitySystem";
import { RuntimeAssertSpecialWorld } from "./RuntimeAssertSpecialSystem";
import { RuntimeCompatibilityTelemetryWorld } from "./RuntimeCompatibilityTelemetrySystem";
import { RuntimeControllerDispatchWorld } from "./RuntimeControllerDispatchSystem";
import { RuntimeHitPauseWorld } from "./RuntimeHitPauseSystem";
import { RuntimeMoveLifecycleWorld } from "./RuntimeMoveLifecycleSystem";
import { RuntimeKinematicsWorld } from "./RuntimeKinematicsSystem";
import {
  RuntimeAnimationWorld,
  runtimeAnimationElapsedBeforeFrame,
  runtimeAnimationElementTime,
  runtimeAnimationFrameDuration,
  runtimeAnimationTimeRemaining,
} from "./RuntimeAnimationSystem";
import {
  RuntimeStateEntryWorld,
  type RuntimeStateEntryAnimationElementOptions,
  type RuntimeStateEntryOptions,
} from "./RuntimeStateEntrySystem";
import { RuntimeStateEntrySetupWorld } from "./RuntimeStateEntrySetupSystem";
import { RuntimeStateClockWorld } from "./RuntimeStateClockSystem";
import { hasRuntimeStun, RuntimeStunWorld } from "./RuntimeStunSystem";
import {
  RuntimePauseControllerDispatchWorld,
  RuntimePauseWorld,
  RuntimePausedMatchWorld,
  type MatchPauseControllerResult,
} from "./PauseSystem";
import { dispatchStateProgramController, findControllerParam } from "./StateProgramExecutor";
import {
  isRuntimeSpriteEffectControllerEffect,
  RuntimeSpriteEffectControllerWorld,
  RuntimeSpriteEffectWorld,
} from "./SpriteEffectSystem";
import {
  isRuntimeTargetControllerDispatchEffect,
  RuntimeTargetControllerDispatchWorld,
  RuntimeTargetWorld,
  type RuntimeTarget,
  type RuntimeTargetBinding,
} from "./TargetSystem";
import { trainingStage } from "./demoStage";
import type {
  CharacterRuntimeState,
  RuntimeAfterImageSample,
  RuntimeControllerTraceEvent,
  RuntimeEnvShakeEvent,
  RuntimeHitEffectEvent,
  RuntimeHitOverrideSlot,
  MugenSnapshot,
  RuntimeSoundEvent,
} from "./types";

const compatibilityTelemetryWorld = new RuntimeCompatibilityTelemetryWorld();
const defaultGuardDistanceWorld = new RuntimeGuardDistanceWorld();
const stateClockWorld = new RuntimeStateClockWorld();
const stateEntryWorld = new RuntimeStateEntryWorld({ stateClockWorld });
const controllerDispatchWorld = new RuntimeControllerDispatchWorld();
const stateEntrySetupWorld = new RuntimeStateEntrySetupWorld();
const spriteEffectControllerWorld = new RuntimeSpriteEffectControllerWorld();
const actorConstraintControllerDispatchWorld = new RuntimeActorConstraintControllerDispatchWorld();
const targetControllerDispatchWorld = new RuntimeTargetControllerDispatchWorld();
const contactControllerDispatchWorld = new RuntimeContactControllerDispatchWorld();
const audioControllerDispatchWorld = new RuntimeAudioControllerDispatchWorld();
const envColorControllerDispatchWorld = new RuntimeEnvColorControllerDispatchWorld();
const envShakeControllerDispatchWorld = new RuntimeEnvShakeControllerDispatchWorld();
const fallEnvShakeControllerDispatchWorld = new RuntimeFallEnvShakeControllerDispatchWorld();
const pauseControllerDispatchWorld = new RuntimePauseControllerDispatchWorld();
const effectSpawnControllerDispatchWorld = new RuntimeEffectSpawnControllerDispatchWorld();
const reversalControllerDispatchWorld = new RuntimeReversalControllerDispatchWorld();
const hitDefControllerDispatchWorld = new RuntimeHitDefControllerDispatchWorld();
const expressionContextWorld = new RuntimeExpressionContextWorld();

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

type PauseControllerHandler = (
  fighter: FighterMatchState,
  controller: MugenStateController,
  operation?: PauseControllerOp,
) => MatchPauseControllerResult | undefined;
type EnvColorControllerHandler = (controller: MugenStateController, operation?: EnvColorControllerOp) => void;

type EnterStateOptions = RuntimeStateEntryOptions<FighterMatchState>;
type AnimationElementOptions = RuntimeStateEntryAnimationElementOptions;

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
  private readonly assertSpecialWorld = new RuntimeAssertSpecialWorld();
  private readonly orientationWorld = new RuntimeOrientationWorld();
  private readonly guardWorld = new RuntimeGuardWorld();
  private readonly guardDistanceWorld = new RuntimeGuardDistanceWorld();
  private readonly getHitStateWorld = new RuntimeGetHitStateWorld();
  private readonly hitStateTransitionWorld = new RuntimeHitStateTransitionWorld();
  private readonly hitPauseWorld = new RuntimeHitPauseWorld();
  private readonly contactPresentationWorld = new RuntimeContactPresentationWorld();
  private readonly moveLifecycleWorld = new RuntimeMoveLifecycleWorld();
  private readonly inputControlWorld = new RuntimeInputControlWorld();
  private readonly kinematicsWorld = new RuntimeKinematicsWorld();
  private readonly animationWorld = new RuntimeAnimationWorld();
  private readonly stunWorld = new RuntimeStunWorld();
  private readonly pausedMatchWorld = new RuntimePausedMatchWorld();
  private readonly snapshotWorld = new RuntimeSnapshotWorld();
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
    this.applyPreFacingAssertSpecial(this.p1, this.p2);
    this.applyPreFacingAssertSpecial(this.p2, this.p1);
    this.orientationWorld.updateAutoFacing(this.p1.runtime, this.p2.runtime);
    this.orientationWorld.updateAutoFacing(this.p2.runtime, this.p1.runtime);

    if (
      this.hitPauseWorld.advanceRuntime({
        p1: this.p1,
        p2: this.p2,
        p1Input,
        p2Input,
        tick: this.tick,
        stage: this.stage,
        effectLifecycleWorld: this.effectLifecycleWorld,
        runIgnoredControllers: (fighter, opponent) =>
          runHitPauseIgnoredControllers(
            fighter,
            opponent,
            this.actorConstraintWorld,
            this.spriteEffectWorld,
            this.reversalWorld,
            this.effectSpawnWorld,
            this.tick,
            (target, controller, operation) => this.applyMatchPauseController(target, controller, operation),
            (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
          ),
      }).paused
    ) {
      return;
    }

    if (this.pauseWorld.current()) {
      this.advancePausedMatch(input, p1Input, p2Input);
      return;
    }

    this.round.tickTimer();
    this.p1.commandBuffer.push(this.tick, p1Input);
    this.p2.commandBuffer.push(this.tick, p2Input);
    handlePlayerInput(this.p1, p1Input, this.p2, this.tick, this.inputControlWorld);
    if (input.p2) {
      handlePlayerInput(this.p2, p2Input, this.p1, this.tick, this.inputControlWorld);
    } else {
      handleSimpleAi(this.p2, this.p1, this.tick, this.inputControlWorld);
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
      this.moveLifecycleWorld,
      this.kinematicsWorld,
      this.animationWorld,
      this.stunWorld,
      this.tick,
      (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
      (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
    );
    applyAutoGuardStart(this.p2, this.p1, this.guardWorld, this.guardDistanceWorld);
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
        this.moveLifecycleWorld,
        this.kinematicsWorld,
        this.animationWorld,
        this.stunWorld,
        this.tick,
        (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
        (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
      );
      applyAutoGuardStart(this.p1, this.p2, this.guardWorld, this.guardDistanceWorld);
    }
    this.matchInteractionWorld.advanceRuntime({
      p1: this.p1,
      p2: this.p2,
      stage: this.stage,
      actorConstraintWorld: this.actorConstraintWorld,
      effectLifecycleWorld: this.effectLifecycleWorld,
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
          this.hitStateTransitionWorld,
          this.contactPresentationWorld,
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
          this.contactPresentationWorld,
          this.tick,
          (line) => this.logs.unshift(line),
        ),
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
    this.pausedMatchWorld.advanceRuntime({
      p1: this.p1,
      p2: this.p2,
      p1Input,
      p2Input,
      p2Controlled: input.p2 !== undefined,
      stage: this.stage,
      actorConstraintWorld: this.actorConstraintWorld,
      effectLifecycleWorld: this.effectLifecycleWorld,
      currentPause: () => this.pauseWorld.current(),
      canActorMove: (actorId) => this.pauseWorld.canActorMove(actorId),
      pushCommandBuffer: (actor, actorInput) => actor.commandBuffer.push(this.tick, actorInput, { hitPause: true }),
      handlePlayerInput: (actor, actorInput, opponent) =>
        handlePlayerInput(actor, actorInput, opponent, this.tick, this.inputControlWorld),
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
          this.tick,
          (fighter, controller, operation) => this.applyMatchPauseController(fighter, controller, operation),
          (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
        ),
      tickPause: () => this.pauseWorld.tick(),
    });
  }

  private applyMatchPauseController(
    fighter: FighterMatchState,
    controller: MugenStateController,
    operation?: PauseControllerOp,
  ): MatchPauseControllerResult {
    const result = this.pauseWorld.applyController(fighter, controller, this.tick, operation);
    if (!result.pause) {
      return result;
    }
    if (result.powerDelta !== 0) {
      applyRuntimePowerDelta(fighter.runtime, result.powerDelta, fighter.definition.constants);
    }
    this.logs.unshift(
      `${fighter.label} triggered ${result.pause.type} for ${result.pause.remaining}f (${result.pause.moveTime}f movetime)`,
    );
    return result;
  }

  private applyPreFacingAssertSpecial(fighter: FighterMatchState, opponent: FighterMatchState): void {
    this.assertSpecialWorld.applyPreFacing({
      actor: fighter,
      opponent,
      tick: this.tick,
      triggersPass,
      executeController: (controller, actor, owner, tick) => {
        controllerDispatchWorld.apply(actor, controller, {
          context: {
            getConst: (name) => runtimeDefinitionConst(owner.definition, name),
            hitPauseTime: () => actor.hitPause,
            random: () => nextRuntimeRandom(actor),
            stageTime: tick,
          },
        });
        return actor.runtime;
      },
    });
  }

  getSnapshot(): MugenSnapshot {
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
      stage: this.snapshotWorld.stage({ stage: this.stage, actors: [this.p1, this.p2], cameraShake: shake, envColor }),
      round: this.round.snapshot(),
      actors: [this.snapshotWorld.actor(this.p1), this.snapshotWorld.actor(this.p2)],
      effects: this.snapshotWorld.effects({ p1: p1Effects, p2: p2Effects }),
      compatibilitySession: compatibilityTelemetryWorld.buildSession([this.p1, this.p2]),
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
  const lifeMax = runtimeLifeMaxFromConstants(definition.constants);
  const powerMax = runtimePowerMaxFromConstants(definition.constants);
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
  stateEntryWorld.setStateNo(fighter, stateNo, options);
}

function handlePlayerInput(
  fighter: FighterMatchState,
  input: Set<string>,
  opponent: FighterMatchState,
  tick: number,
  inputControlWorld: RuntimeInputControlWorld,
): void {
  inputControlWorld.handlePlayerInput(fighter, input, {
    hasStun: hasRuntimeStun(fighter),
    preserveImportedStateMoveType: shouldPreserveImportedStateMoveType(fighter),
    runStateEntrySetup: () => runStateEntrySetupControllers(fighter, opponent, tick),
    tryApplyStateEntry: () => tryApplyStateEntry(fighter, opponent, tick),
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
  tick: number,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
): void {
  spriteEffectWorld.tick(fighter.runtime, () => createAfterImageSample(fighter));
  hitEligibilityWorld.tickHitBySlots(fighter.runtime);
  hitOverrideWorld.tickSlots(fighter.runtime);
  advanceContactTimers(fighter);
  fighter.runtime.renderAngle = undefined;
  stateClockWorld.advance(fighter);
  actorConstraintWorld.resetFrameConstraints(fighter.runtime);
  recoveryWorld.tickHitFallRecoveryWindow(fighter);
  const tickStartPos = { ...fighter.runtime.pos };
  const preserveImportedStateMoveType = shouldPreserveImportedStateMoveType(fighter);
  stunWorld.advance(fighter, {
    hasCurrentMove: Boolean(fighter.currentMove),
    preserveImportedStateMoveType,
    suppressHitStunAction: Boolean(fighter.stateOwner),
    showHitStunAction: () => changeAction(fighter, fighter.definition.hitstunAction),
  });

  moveLifecycleWorld.advance(fighter, {
    restoreControl: () => applyRuntimeControl(fighter.runtime, true),
    enterIdleState: () => setRuntimeStateNo(fighter, fighter.definition.idleAction),
    changeIdleAction: () => changeAction(fighter, fighter.definition.idleAction),
  });

  kinematicsWorld.advance(fighter, {
    preserveImportedStateMoveType,
    changeIdleAction: () => changeAction(fighter, fighter.definition.idleAction),
  });

  animationWorld.advance(fighter);
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
  applyRuntimeControl(fighter.runtime, false);
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
  const frameDuration = runtimeAnimationFrameDuration(frames[frameIndex]);
  const elemTime = Math.max(0, Math.min(frameDuration - 1, Math.round(options.elemTime ?? 0)));
  fighter.runtime.frameIndex = frameIndex;
  fighter.frameElapsed = elemTime;
  fighter.runtime.animTime = runtimeAnimationElapsedBeforeFrame(fighter.currentAction, frameIndex) + elemTime;
  fighter.animationComplete = false;
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
      compatibilityTelemetryWorld.recordController(fighter, rawController);
      enterState(fighter, stateId, undefined, {
        clearStateOwner: dispatch.clearStateOwner,
        animOverride,
        preserveAnimationWhenMissing: true,
      });
      if (ctrl !== undefined) {
        applyRuntimeControl(fighter.runtime, ctrl);
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
      compatibilityTelemetryWorld.recordController(fighter, rawController);
      const animationOwner = dispatch.animationSource === "state-owner" ? owner : fighter;
      changeAction(fighter, actionId, dispatch.animationSource, animationOwner.definition, {
        elem,
        elemTime,
      });
      continue;
    }

    if (dispatch.kind === "runtime-controller") {
      controllerDispatchWorld.apply(fighter, controller, {
        context: runtimeControllerContext(fighter, owner, tick),
        recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
        recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
      });
      continue;
    }

    if (dispatch.kind === "side-effect") {
      if (dispatch.effect === "hitdef") {
        hitDefControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          frame: getCurrentFrame(fighter),
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (dispatch.effect === "reversaldef") {
        reversalControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          hitbox: getCurrentFrame(fighter)?.clsn1[0],
          reversalWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (dispatch.effect === "width") {
        actorConstraintControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          actorConstraintWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (dispatch.effect === "fallenvshake") {
        fallEnvShakeControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          runtimeTick: tick,
          envShakeWorld: fighter.envShakeWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (isRuntimeSpriteEffectControllerEffect(dispatch.effect)) {
        spriteEffectControllerWorld.apply({
          actor: fighter,
          controller,
          effect: dispatch.effect,
          spriteEffectWorld,
          sampleFactory: () => createAfterImageSample(fighter),
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (isRuntimeEffectSpawnControllerDispatchEffect(dispatch.effect)) {
        effectSpawnControllerDispatchWorld.apply({
          actor: fighter,
          opponent,
          controller,
          effect: dispatch.effect,
          effectSpawnWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (isRuntimeTargetControllerDispatchEffect(dispatch.effect)) {
        targetControllerDispatchWorld.apply({
          actor: fighter,
          candidateTargets: [opponent],
          controller,
          effect: dispatch.effect,
          targetWorld: fighter.targetWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
          scaleIncomingDamage: scaleRuntimeIncomingDamage,
          enterTargetState: (target, stateId) => {
            const controllerOwner = fighter.stateOwner ?? fighter;
            if (canEnterState(target, stateId, controllerOwner)) {
              enterState(target, stateId, undefined, { stateOwner: controllerOwner });
            }
          },
          getTargetConst: (target, name) => runtimeDefinitionConst(target.definition, name),
        });
      } else if (dispatch.effect === "pause") {
        pauseControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          applyController: (actor, source, operation) => onPauseController?.(actor, source, operation),
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (dispatch.effect === "sound") {
        audioControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          runtimeTick: tick,
          audioWorld: fighter.audioWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (dispatch.effect === "envcolor") {
        envColorControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          runtimeTick: tick,
          emitController: (source, _runtimeTick, operation) => onEnvColorController?.(source, operation),
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (dispatch.effect === "envshake") {
        envShakeControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          runtimeTick: tick,
          envShakeWorld: fighter.envShakeWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      } else if (dispatch.effect === "contact") {
        contactControllerDispatchWorld.apply({
          actor: fighter,
          controller,
          contactWorld: fighter.contactWorld,
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
        });
      }
    }
  }
}

function controllerIgnoresHitPause(controller: ControllerIr): boolean {
  return (firstNumber(findParam(controller, "ignorehitpause")) ?? 0) !== 0;
}

function runtimeControllerContext(fighter: FighterMatchState, owner: FighterMatchState, tick: number) {
  return {
    getConst: (name: string) => runtimeDefinitionConst(owner.definition, name),
    hitPauseTime: () => fighter.hitPause,
    random: () => nextRuntimeRandom(fighter),
    stageTime: tick,
  };
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

function canEnterState(target: FighterMatchState, stateId: number, owner: FighterMatchState = target): boolean {
  return stateEntryWorld.canEnterState(target, stateId, owner);
}

function rememberTarget(attacker: FighterMatchState, defender: FighterMatchState, targetId: number | undefined): void {
  attacker.targetWorld.remember(attacker, defender.id, targetId);
}

function resetContactState(fighter: FighterMatchState): void {
  fighter.contact = fighter.contactWorld.create();
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

function resolveProjectileCombat(
  attacker: FighterMatchState,
  defender: FighterMatchState,
  hitOverrideWorld: RuntimeHitOverrideWorld,
  effectLifecycleWorld: RuntimeEffectLifecycleWorld,
  guardWorld: RuntimeGuardWorld,
  getHitStateWorld: RuntimeGetHitStateWorld,
  contactPresentationWorld: RuntimeContactPresentationWorld,
  runtimeTick: number,
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
    emitProjectileContactEffects: (source, _target, projectile, kind) => {
      contactPresentationWorld.emitProjectileContact({ actor: source, projectile, kind, runtimeTick });
    },
    recordReceivedDamage: markReceivedDamage,
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
  hitStateTransitionWorld: RuntimeHitStateTransitionWorld,
  contactPresentationWorld: RuntimeContactPresentationWorld,
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
      enterTargetHitState: (target, owner, stateNo, getP1State) =>
        hitStateTransitionWorld.enterTargetHitState(target, owner, stateNo, getP1State, hitStateTransitionHooks()),
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
    applyHitStateTransitions: (source, target, moveArg) =>
      applyHitStateTransitions(source, target, moveArg, hitStateTransitionWorld),
    applyDefaultGetHit: (target, moveArg) => applyDefaultGetHitState(target, moveArg, getHitStateWorld),
  });
  contactPresentationWorld.emitHitDefContact({ attacker, defender, kind: outcome.kind, move, runtimeTick });
  log(outcome.message);
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

function applyHitStateTransitions(
  attacker: FighterMatchState,
  defender: FighterMatchState,
  move: DemoMove,
  hitStateTransitionWorld: RuntimeHitStateTransitionWorld,
): void {
  hitStateTransitionWorld.applyHitStateTransitions(attacker, defender, move, hitStateTransitionHooks());
}

function hitStateTransitionHooks() {
  return {
    canEnterState: (target: FighterMatchState, stateNo: number, stateOwner?: FighterMatchState) =>
      canEnterState(target, stateNo, stateOwner),
    enterState: (
      target: FighterMatchState,
      stateNo: number,
      options?: { stateOwner?: FighterMatchState; clearStateOwner?: boolean },
    ) => enterState(target, stateNo, undefined, options),
  };
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

function applyAutoGuardStart(
  defender: FighterMatchState,
  attacker: FighterMatchState,
  guardWorld: RuntimeGuardWorld,
  guardDistanceWorld: RuntimeGuardDistanceWorld,
): void {
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
  if (!evaluateRuntimeInGuardDist(defender, attacker, guardDistanceWorld)) {
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

function isMoveActive(move: DemoMove, tick: number): boolean {
  return tick >= move.activeStart && tick <= move.activeEnd;
}

function evaluateRuntimeInGuardDist(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  guardDistanceWorld: RuntimeGuardDistanceWorld = defaultGuardDistanceWorld,
): boolean {
  const hurtBoxes = getCurrentFrame(fighter)?.clsn2 ?? [{ x1: -24, y1: -96, x2: 24, y2: 0 }];
  return guardDistanceWorld.isInGuardDistance(
    { runtime: fighter.runtime, hurtBoxes },
    {
      runtime: opponent.runtime,
      currentMove: opponent.currentMove,
      moveTick: opponent.moveTick,
      hasHit: opponent.hasHit,
    },
  );
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
    compatibilityTelemetryWorld.recordStateEntryRoute(fighter, controller.source, stateId);
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
  stateEntrySetupWorld.apply({
    actor: fighter,
    opponent,
    tick,
    triggersPass,
    executeController: (controller, actor, stageTime) => {
      controllerDispatchWorld.apply(actor, controller, {
        context: {
          hitPauseTime: () => actor.hitPause,
          random: () => nextRuntimeRandom(actor),
          stageTime,
        },
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
  return expressionContextWorld.evaluateNumber(expression, {
    actor: fighter,
    opponent,
    owner,
    stageTime,
    random: () => nextRuntimeRandom(fighter),
    animTimeRemaining: getAnimTimeRemaining(fighter),
    animElemTime: (elementNumber) => getAnimElemTime(fighter, elementNumber),
    inGuardDist: () => evaluateRuntimeInGuardDist(fighter, opponent),
  });
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
  return expressionContextWorld.evaluateTrigger(trigger, {
    actor: fighter,
    opponent,
    owner,
    stageTime,
    random: () => nextRuntimeRandom(fighter),
    animTimeRemaining: getAnimTimeRemaining(fighter),
    animElemTime: (elementNumber) => getAnimElemTime(fighter, elementNumber),
    inGuardDist: () => evaluateRuntimeInGuardDist(fighter, opponent),
  });
}

function runtimeAttackMultiplier(definition: DemoFighterDefinition): number | undefined {
  const attack = definition.constants?.["data.attack"];
  return attack === undefined ? undefined : boundedRuntimeDamageMultiplier(attack / 100);
}

function runtimeDefenseMultiplier(definition: DemoFighterDefinition): number | undefined {
  const defence = definition.constants?.["data.defence"];
  return defence === undefined || defence <= 0 ? undefined : boundedRuntimeDamageMultiplier(100 / defence);
}

function boundedRuntimeDamageMultiplier(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0, Math.min(10, Math.round(value * 1000) / 1000));
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
