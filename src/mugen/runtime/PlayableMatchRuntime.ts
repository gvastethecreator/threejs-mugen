import type {
  EnvColorControllerOp,
  PauseControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import { RuntimeActorConstraintControllerDispatchWorld, RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import { RuntimeAudioControllerDispatchWorld, RuntimeAudioWorld } from "./AudioEventSystem";
import {
  RuntimeContactControllerDispatchWorld,
  RuntimeContactMemoryWorld,
} from "./ContactMemorySystem";
import { RuntimeEnvColorControllerDispatchWorld, RuntimeEnvColorWorld } from "./EnvColorSystem";
import { scaleRuntimeIncomingDamage } from "./CombatResolver";
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
  RuntimeEffectSpawnControllerDispatchWorld,
  RuntimeEffectSpawnWorld,
} from "./EffectSpawnSystem";
import { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import { RuntimeGuardWorld } from "./GuardSystem";
import type { RuntimeHelper } from "./HelperSystem";
import { RuntimeHitStateTransitionWorld } from "./HitStateTransitionSystem";
import { RuntimeInputControlWorld } from "./RuntimeInputControlSystem";
import { RuntimeDispatchEvaluationWorld } from "./RuntimeDispatchEvaluationSystem";
import { RuntimeExpressionContextWorld, runtimeDefinitionConst } from "./RuntimeExpressionContextSystem";
import { RuntimeHelperTelemetryWorld } from "./RuntimeHelperTelemetrySystem";
import { RuntimeMatchFrameStartWorld } from "./RuntimeMatchFrameStartSystem";
import { RuntimeMatchInputControlWorld } from "./RuntimeMatchInputControlSystem";
import { RuntimeMatchTickInputWorld } from "./RuntimeMatchTickInputSystem";
import { RuntimeGuardDistanceWorld } from "./RuntimeGuardDistanceSystem";
import { RuntimeContactPresentationWorld } from "./RuntimeContactPresentationSystem";
import { RuntimeCombatResolutionWorld } from "./RuntimeCombatResolutionSystem";
import { RuntimeHelperCombatWorld } from "./RuntimeHelperCombatSystem";
import { RuntimeMatchFighterAdvanceWorld } from "./RuntimeMatchFighterAdvanceSystem";
import { RuntimeMatchPostFighterWorld } from "./RuntimeMatchPostFighterSystem";
import { RuntimeMatchRoundWorld } from "./RuntimeMatchRoundSystem";
import { RuntimeControllerEvaluationContextWorld } from "./RuntimeControllerEvaluationContextSystem";
import { RuntimeHelperProjectileTargetWorld } from "./RuntimeHelperProjectileTargetSystem";
import { RuntimeHelperTargetStateWorld } from "./RuntimeHelperTargetStateSystem";
import { RuntimeMatchResetWorld } from "./RuntimeMatchResetSystem";
import { RuntimeActiveControllerScanWorld } from "./RuntimeActiveControllerScanSystem";
import { RuntimeActiveControllerDispatchWorld } from "./RuntimeActiveControllerDispatchSystem";
import { RuntimeAutoGuardStartWorld } from "./RuntimeAutoGuardStartSystem";
import { defaultRuntimeHurtBoxes, RuntimeFrameWorld } from "./RuntimeFrameSystem";
import { RuntimeRoundSystem } from "./RuntimeRoundSystem";
import { nextRuntimeRandomUnit } from "./RuntimeRandomSystem";
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
import { RuntimeFighterAdvanceWorld } from "./RuntimeFighterAdvanceSystem";
import { RuntimeFighterStateWorld, type FighterMatchState } from "./RuntimeFighterStateSystem";
import { RuntimeControllerDispatchWorld } from "./RuntimeControllerDispatchSystem";
import { RuntimeHitPauseWorld } from "./RuntimeHitPauseSystem";
import { RuntimeMoveLifecycleWorld } from "./RuntimeMoveLifecycleSystem";
import { RuntimeMoveStartWorld } from "./RuntimeMoveStartSystem";
import { RuntimeKinematicsWorld } from "./RuntimeKinematicsSystem";
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
import { hasRuntimeStun, RuntimeStunWorld } from "./RuntimeStunSystem";
import {
  RuntimeMatchPauseControllerWorld,
  RuntimePauseControllerDispatchWorld,
  RuntimePauseWorld,
  RuntimePausedMatchWorld,
  type MatchPauseControllerResult,
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
import type { RuntimeProjectile } from "./ProjectileSystem";
import { trainingStage } from "./demoStage";
import type {
  CharacterRuntimeState,
  MugenSnapshot,
} from "./types";

const compatibilityTelemetryWorld = new RuntimeCompatibilityTelemetryWorld();
const defaultGuardDistanceWorld = new RuntimeGuardDistanceWorld();
const stateClockWorld = new RuntimeStateClockWorld();
const stateEntryWorld = new RuntimeStateEntryWorld({ stateClockWorld });
const stateEntryRouteWorld = new RuntimeStateEntryRouteWorld();
const controllerDispatchWorld = new RuntimeControllerDispatchWorld();
const stateEntrySetupWorld = new RuntimeStateEntrySetupWorld();
const activeControllerScanWorld = new RuntimeActiveControllerScanWorld();
const activeControllerDispatchWorld = new RuntimeActiveControllerDispatchWorld();
const dispatchEvaluationWorld = new RuntimeDispatchEvaluationWorld();
const controllerEvaluationContextWorld = new RuntimeControllerEvaluationContextWorld();
const autoGuardStartWorld = new RuntimeAutoGuardStartWorld();
const triggerGateWorld = new RuntimeTriggerGateWorld();
const triggerEvaluationWorld = new RuntimeTriggerEvaluationWorld();
const afterImageSampleWorld = new RuntimeAfterImageSampleWorld();
const frameWorld = new RuntimeFrameWorld();
const animationChangeWorld = new RuntimeAnimationWorld();
const fighterStateWorld = new RuntimeFighterStateWorld();
const spriteEffectControllerWorld = new RuntimeSpriteEffectControllerWorld();
const targetStateEntryWorld = new RuntimeTargetStateEntryWorld();
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
const fighterAdvanceWorld = new RuntimeFighterAdvanceWorld();
const helperTelemetryWorld = new RuntimeHelperTelemetryWorld();
const matchFrameStartWorld = new RuntimeMatchFrameStartWorld();
const matchInputControlWorld = new RuntimeMatchInputControlWorld();
const matchTickInputWorld = new RuntimeMatchTickInputWorld();
const moveStartWorld = new RuntimeMoveStartWorld();
const matchFighterAdvanceWorld = new RuntimeMatchFighterAdvanceWorld();
const matchPostFighterWorld = new RuntimeMatchPostFighterWorld();
const matchRoundWorld = new RuntimeMatchRoundWorld();

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
  private readonly helperProjectileTargetWorld = new RuntimeHelperProjectileTargetWorld();
  private readonly helperTargetStateWorld = new RuntimeHelperTargetStateWorld();
  private readonly moveLifecycleWorld = new RuntimeMoveLifecycleWorld();
  private readonly inputControlWorld = new RuntimeInputControlWorld();
  private readonly kinematicsWorld = new RuntimeKinematicsWorld();
  private readonly animationWorld = new RuntimeAnimationWorld();
  private readonly stunWorld = new RuntimeStunWorld();
  private readonly pausedMatchWorld = new RuntimePausedMatchWorld();
  private readonly snapshotWorld = new RuntimeSnapshotWorld();
  private readonly matchResetWorld = new RuntimeMatchResetWorld();
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
    this.p1 = fighterStateWorld.create({
      id: "p1",
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
    this.attachHelperTargetStateHandlers();
    this.logs.unshift(`Playable demo match started on ${stage.displayName}`);
  }

  private attachHelperTargetStateHandlers(): void {
    this.helperTargetStateWorld.attachOwnerHandlers([this.p1, this.p2], (owner, helper, target, stateId) =>
      this.enterHelperOwnedTargetState(owner, helper, target, stateId),
    );
    helperTelemetryWorld.attachProjectileTelemetry([this.p1, this.p2], {
      recordController: (owner, controller, context) => compatibilityTelemetryWorld.recordController(owner, controller, context),
      recordOperation: (owner, operation, context) => compatibilityTelemetryWorld.recordOperation(owner, operation, context),
    });
  }

  private enterHelperOwnedTargetState(
    owner: FighterMatchState,
    helper: RuntimeHelper,
    targetActor: RuntimeTargetWorldActor,
    stateId: number,
  ): void {
    this.helperTargetStateWorld.enter({
      owner,
      helper,
      targetActor,
      stateId,
      hooks: {
        resolveTarget: (candidate) => this.fighterById(candidate.id),
        canEnterState: (target, targetStateId, stateOwner) => canEnterState(target, targetStateId, stateOwner),
        enterState: (target, targetStateId, options) => enterState(target, targetStateId, undefined, options),
      },
    });
  }

  private fighterById(actorId: string): FighterMatchState | undefined {
    if (actorId === this.p1.id) {
      return this.p1;
    }
    if (actorId === this.p2.id) {
      return this.p2;
    }
    return undefined;
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
    matchTickInputWorld.stampFrame({ tick: this.tick, p1: this.p1, p2: this.p2, p1Input, p2Input });

    matchFrameStartWorld.advance({
      p1: this.p1,
      p2: this.p2,
      resetFrameFlags: (fighter) => this.hitEligibilityWorld.resetFrameFlags(fighter.runtime),
      applyPreFacingAssertSpecial: (fighter, opponent) => this.applyPreFacingAssertSpecial(fighter, opponent),
      updateAutoFacing: (fighter, opponent) => this.orientationWorld.updateAutoFacing(fighter.runtime, opponent.runtime),
    });

    if (
      this.hitPauseWorld.advanceRuntime({
        p1: this.p1,
        p2: this.p2,
        p1Input,
        p2Input,
        tick: this.tick,
        stage: this.stage,
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

    matchRoundWorld.tickTimer(this.round);
    matchTickInputWorld.pushNormalCommandBuffers({ tick: this.tick, p1: this.p1, p2: this.p2, p1Input, p2Input });
    matchInputControlWorld.apply({
      p1: this.p1,
      p2: this.p2,
      p1Input,
      p2Input,
      p2Controlled: input.p2 !== undefined,
      handlePlayerInput: (fighter, fighterInput, opponent) =>
        handlePlayerInput(fighter, fighterInput, opponent, this.stage.bounds, this.tick, this.inputControlWorld),
      handleAi: (fighter, opponent) => handleSimpleAi(fighter, opponent, this.tick, this.inputControlWorld),
    });
    matchFighterAdvanceWorld.advancePair({
      p1: this.p1,
      p2: this.p2,
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
          this.tick,
          (pauseActor, controller, operation) => this.applyMatchPauseController(pauseActor, controller, operation),
          (controller, operation) => this.recordEnvColorEvent(controller, this.tick, operation),
        ),
      applyAutoGuardStart: (defender, attacker) =>
        applyAutoGuardStart(defender, attacker, this.guardWorld, this.guardDistanceWorld),
      isPaused: () => this.pauseWorld.current() !== undefined,
    });
    matchPostFighterWorld.advanceRuntime({
      p1: this.p1,
      p2: this.p2,
      stage: this.stage,
      stageTime: this.tick,
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
      getHurtBoxes: getRuntimeHurtBoxes,
      combatStateHooks: runtimeCombatStateHooks,
      helperStateHooks: runtimeHelperCombatStateHooks,
      defaultHurtBoxes: defaultRuntimeHurtBoxes,
      rememberProjectileTarget: (source, target, projectile) =>
        this.rememberHelperProjectileTarget(source, target, projectile),
      log: (line) => this.logs.unshift(line),
    });

    matchRoundWorld.finishIfNeeded({
      round: this.round,
      p1: this.p1,
      p2: this.p2,
      stopPlaying: () => {
        this.playing = false;
      },
      log: (message) => this.logs.unshift(message),
    });
  }

  private advancePausedMatch(input: MatchInput, p1Input: Set<string>, p2Input: Set<string>): void {
    this.pausedMatchWorld.advanceRuntime({
      p1: this.p1,
      p2: this.p2,
      p1Input,
      p2Input,
      p2Controlled: input.p2 !== undefined,
      stage: this.stage,
      stageTime: this.tick,
      runtimeTick: this.tick,
      actorConstraintWorld: this.actorConstraintWorld,
      effectLifecycleWorld: this.effectLifecycleWorld,
      currentPause: () => this.pauseWorld.current(),
      canActorMove: (actorId) => this.pauseWorld.canActorMove(actorId),
      pushCommandBuffer: (actor, actorInput) => actor.commandBuffer.push(this.tick, actorInput, { hitPause: true }),
      handlePlayerInput: (actor, actorInput, opponent) =>
        handlePlayerInput(actor, actorInput, opponent, this.stage.bounds, this.tick, this.inputControlWorld),
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
    return this.matchPauseControllerWorld.apply({
      actor: fighter,
      controller,
      operation,
      runtimeTick: this.tick,
      pauseWorld: this.pauseWorld,
      applyPowerDelta: (actor, powerDelta) => applyRuntimePowerDelta(actor.runtime, powerDelta, actor.definition.constants),
      log: (message) => this.logs.unshift(message),
    });
  }

  private applyPreFacingAssertSpecial(fighter: FighterMatchState, opponent: FighterMatchState): void {
    this.assertSpecialWorld.applyPreFacing({
      actor: fighter,
      opponent,
      tick: this.tick,
      triggersPass: (controller, actor, targetOpponent, owner, tick) =>
        triggersPass(controller, actor, targetOpponent, owner, tick, this.stage.bounds),
      executeController: (controller, actor, owner, tick) => {
        controllerDispatchWorld.apply(actor, controller, {
          context: {
            getConst: (name) => runtimeDefinitionConst(owner.definition, name),
            hitPauseTime: () => actor.hitPause,
            random: () => nextRuntimeRandom(actor),
            stageBounds: this.stage.bounds,
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
      createFighter: (id, definition, start) =>
        fighterStateWorld.create({
          id,
          definition,
          x: start.x,
          y: start.y,
          facing: start.facing,
          effectActorWorld: this.effectActorWorld,
          targetWorld: this.targetWorld,
          audioWorld: this.audioWorld,
          envShakeWorld: this.envShakeWorld,
          hitEffectWorld: this.hitEffectWorld,
          contactWorld: this.contactWorld,
        }),
      attachHelperTargetStateHandlers: () => this.attachHelperTargetStateHandlers(),
      log: (message) => this.logs.unshift(message),
    });
    this.tick = resetState.tick;
    this.frameClock = resetState.frameClock;
    this.playing = resetState.playing;
  }

  private recordEnvColorEvent(controller: MugenStateController, runtimeTick: number, operation?: EnvColorControllerOp): void {
    this.envColorWorld.emitController(controller, runtimeTick, operation);
  }

  private rememberHelperProjectileTarget(owner: FighterMatchState, defender: FighterMatchState, projectile: RuntimeProjectile): void {
    this.helperProjectileTargetWorld.remember({
      owner,
      defender,
      projectile,
      targetWorld: this.targetWorld,
    });
  }

}

function nextRuntimeRandom(fighter: FighterMatchState): number {
  const next = nextRuntimeRandomUnit(fighter.rngSeed);
  fighter.rngSeed = next.seed;
  return next.value;
}

function setRuntimeStateNo(fighter: FighterMatchState, stateNo: number, options: { resetElapsed?: boolean } = {}): void {
  stateEntryWorld.setStateNo(fighter, stateNo, options);
}

function handlePlayerInput(
  fighter: FighterMatchState,
  input: Set<string>,
  opponent: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  tick: number,
  inputControlWorld: RuntimeInputControlWorld,
): void {
  inputControlWorld.handlePlayerInput(fighter, input, {
    hasStun: hasRuntimeStun(fighter),
    preserveImportedStateMoveType: shouldPreserveImportedStateMoveType(fighter),
    runStateEntrySetup: () => runStateEntrySetupControllers(fighter, opponent, stageBounds, tick),
    tryApplyStateEntry: () => tryApplyStateEntry(fighter, opponent, stageBounds, tick),
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
  tick: number,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
): void {
  fighterAdvanceWorld.advance({
    actor: fighter,
    hooks: {
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
        kinematicsWorld.advance(actor, {
          preserveImportedStateMoveType,
          changeIdleAction: () => changeAction(actor, actor.definition.idleAction),
        });
      },
      advanceAnimation: (actor) => animationWorld.advance(actor),
      runActiveStateControllers: (actor) =>
        runActiveStateControllers(
          actor,
          opponent,
          actorConstraintWorld,
          spriteEffectWorld,
          reversalWorld,
          effectSpawnWorld,
          stageBounds,
          tick,
          onPauseController,
          onEnvColorController,
        ),
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
        });
      },
      preserveFrozenPosition: (actor, tickStartPos) =>
        actorConstraintWorld.preserveFrozenPosition(actor.runtime, tickStartPos),
    },
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
    stageBounds,
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
  stageBounds: MugenStageDefinition["bounds"],
  tick: number,
  onPauseController?: PauseControllerHandler,
  onEnvColorController?: EnvColorControllerHandler,
  options: ActiveControllerRunOptions = {},
): void {
  activeControllerScanWorld.run({
    actor: fighter,
    opponent,
    tick,
    onlyIgnoreHitPause: options.onlyIgnoreHitPause,
    controllerIgnoresHitPause,
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(controller, actor, targetOpponent, owner, activeTick, stageBounds),
    executeController: ({ controller, owner }) => {
      const dispatch = dispatchStateProgramController(controller);
      const activeDispatch = activeControllerDispatchWorld.apply({
        dispatch,
        actor: fighter,
        opponent,
        owner,
        tick,
        stateHooks: {
          resolveNumber: ({ value, expression, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) =>
            resolveDispatchNumber(value, expression, actor, targetOpponent, stateOwner, stageBounds, activeTick),
          resolveBoolean: ({ value, expression, actor, opponent: targetOpponent, owner: stateOwner, tick: activeTick }) =>
            resolveDispatchBoolean(value, expression, actor, targetOpponent, stateOwner, stageBounds, activeTick),
          recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
          enterState: (actor, stateId, stateOptions) => enterState(actor, stateId, undefined, stateOptions),
          applyControl: (actor, ctrl) => applyRuntimeControl(actor.runtime, ctrl),
          changeAction: (actor, actionId, source, actionOwner, elementOptions) =>
            changeAction(actor, actionId, source, actionOwner.definition, elementOptions),
        },
        sideEffectHooks: {
          hitDef: () => {
            hitDefControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              frame: getCurrentFrame(fighter),
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          reversalDef: () => {
            reversalControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              hitbox: frameWorld.currentFrame(fighter)?.clsn1[0],
              reversalWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          width: () => {
            actorConstraintControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              actorConstraintWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          fallEnvShake: () => {
            fallEnvShakeControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              runtimeTick: tick,
              envShakeWorld: fighter.envShakeWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          spriteEffect: ({ effect }) => {
            spriteEffectControllerWorld.apply({
              actor: fighter,
              controller,
              effect,
              spriteEffectWorld,
              sampleFactory: () => createAfterImageSample(fighter),
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          effectSpawn: ({ effect }) => {
            effectSpawnControllerDispatchWorld.apply({
              actor: fighter,
              opponent,
              controller,
              effect,
              effectSpawnWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          target: ({ effect }) => {
            targetControllerDispatchWorld.apply({
              actor: fighter,
              candidateTargets: [opponent],
              controller,
              effect,
              targetWorld: fighter.targetWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
              scaleIncomingDamage: scaleRuntimeIncomingDamage,
              enterTargetState: (target, stateId) => {
                targetStateEntryWorld.enter({
                  actor: fighter,
                  target,
                  stateId,
                  hooks: {
                    canEnterState: (targetActor, targetStateId, stateOwner) =>
                      canEnterState(targetActor, targetStateId, stateOwner),
                    enterState: (targetActor, targetStateId, options) =>
                      enterState(targetActor, targetStateId, undefined, options),
                  },
                });
              },
              getTargetConst: (target, name) => runtimeDefinitionConst(target.definition, name),
            });
          },
          pause: () => {
            pauseControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              applyController: (actor, source, operation) => onPauseController?.(actor, source, operation),
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          sound: () => {
            audioControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              runtimeTick: tick,
              audioWorld: fighter.audioWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          envColor: () => {
            envColorControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              runtimeTick: tick,
              emitController: (source, _runtimeTick, operation) => onEnvColorController?.(source, operation),
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          envShake: () => {
            envShakeControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              runtimeTick: tick,
              envShakeWorld: fighter.envShakeWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
          contact: () => {
            contactControllerDispatchWorld.apply({
              actor: fighter,
              controller,
              contactWorld: fighter.contactWorld,
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
        },
        hooks: {
          runtimeController: () => {
            controllerDispatchWorld.apply(fighter, controller, {
              context: runtimeControllerContext(fighter, owner, tick, stageBounds),
              recordController: (actor, recordedController) => compatibilityTelemetryWorld.recordController(actor, recordedController),
              recordOperation: (actor, operation) => compatibilityTelemetryWorld.recordOperation(actor, operation),
            });
          },
        },
      });
      return activeDispatch.stop ? "stop" : "continue";
    },
  });
}

function controllerIgnoresHitPause(controller: ControllerIr): boolean {
  return (firstNumber(findParam(controller, "ignorehitpause")) ?? 0) !== 0;
}

function runtimeControllerContext(
  fighter: FighterMatchState,
  owner: FighterMatchState,
  tick: number,
  stageBounds: MugenStageDefinition["bounds"],
) {
  return controllerEvaluationContextWorld.create({
    actor: fighter,
    owner,
    stageBounds,
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

const runtimeCombatStateHooks = {
  canEnterState: (target: FighterMatchState, stateNo: number, stateOwner?: FighterMatchState) =>
    canEnterState(target, stateNo, stateOwner),
  enterState: (
    target: FighterMatchState,
    stateNo: number,
    options?: { stateOwner?: FighterMatchState; clearStateOwner?: boolean },
  ) => enterState(target, stateNo, undefined, options),
};

const runtimeHelperCombatStateHooks = {
  canEnterState: (target: FighterMatchState, stateNo: number) => canEnterState(target, stateNo),
  enterState: (
    target: FighterMatchState,
    stateNo: number,
    options?: { stateOwner?: FighterMatchState; clearStateOwner?: boolean },
  ) => enterState(target, stateNo, undefined, options),
};

function resetContactState(fighter: FighterMatchState): void {
  fighter.contact = fighter.contactWorld.create();
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
  guardDistanceWorld: RuntimeGuardDistanceWorld,
): void {
  autoGuardStartWorld.apply({
    defender,
    attacker,
    guardWorld,
    hooks: {
      isInGuardDistance: (candidateDefender, candidateAttacker) =>
        evaluateRuntimeInGuardDist(candidateDefender, candidateAttacker, guardDistanceWorld),
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
  guardDistanceWorld: RuntimeGuardDistanceWorld = defaultGuardDistanceWorld,
): boolean {
  const hurtBoxes = frameWorld.currentHurtBoxes(fighter);
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
  return frameWorld.currentFrame(fighter);
}

function tryApplyStateEntry(
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  stageBounds: MugenStageDefinition["bounds"],
  tick: number,
): boolean {
  return stateEntryRouteWorld.apply(fighter, opponent, tick, {
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(controller, actor, targetOpponent, owner, activeTick, stageBounds),
    resolveStateId: (dispatch, _controller, actor, targetOpponent, stageTime) =>
      resolveDispatchNumber(dispatch.stateId, dispatch.stateExpression, actor, targetOpponent, actor, stageBounds, stageTime),
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
  tick: number,
): void {
  stateEntrySetupWorld.apply({
    actor: fighter,
    opponent,
    tick,
    triggersPass: (controller, actor, targetOpponent, owner, activeTick) =>
      triggersPass(controller, actor, targetOpponent, owner, activeTick, stageBounds),
    executeController: (controller, actor, stageTime) => {
      controllerDispatchWorld.apply(actor, controller, {
        context: {
          hitPauseTime: () => actor.hitPause,
          random: () => nextRuntimeRandom(actor),
          stageBounds,
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
  stageBounds?: MugenStageDefinition["bounds"],
): boolean {
  return triggerGateWorld.passes({
    controller,
    actor: fighter,
    opponent,
    owner,
    tick: stageTime,
    evaluateTrigger: (trigger, actor, targetOpponent, stateOwner, tick) =>
      evaluateRuntimeTrigger(trigger, actor, targetOpponent, stateOwner, tick, stageBounds),
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
): number | undefined {
  return dispatchEvaluationWorld.resolveNumber({
    value,
    expression,
    actor: fighter,
    opponent,
    opponents: [opponent],
    owner,
    tick: stageTime,
    createContext: ({ actor, opponent: targetOpponent, opponents: targetOpponents, owner: stateOwner, tick }) =>
      expressionContextWorld.create({
        actor,
        opponent: targetOpponent,
        opponents: targetOpponents,
        owner: stateOwner,
        stageBounds,
        stageTime: tick,
        random: () => nextRuntimeRandom(actor),
        animTimeRemaining: getAnimTimeRemaining(actor),
        animElemTime: (elementNumber) => getAnimElemTime(actor, elementNumber),
        inGuardDist: () => evaluateRuntimeInGuardDist(actor, targetOpponent),
      }),
  });
}

function resolveDispatchBoolean(
  value: boolean | undefined,
  expression: string | undefined,
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageBounds?: MugenStageDefinition["bounds"],
  stageTime?: number,
): boolean | undefined {
  return dispatchEvaluationWorld.resolveBoolean({
    value,
    expression,
    actor: fighter,
    opponent,
    opponents: [opponent],
    owner,
    tick: stageTime,
    createContext: ({ actor, opponent: targetOpponent, opponents: targetOpponents, owner: stateOwner, tick }) =>
      expressionContextWorld.create({
        actor,
        opponent: targetOpponent,
        opponents: targetOpponents,
        owner: stateOwner,
        stageBounds,
        stageTime: tick,
        random: () => nextRuntimeRandom(actor),
        animTimeRemaining: getAnimTimeRemaining(actor),
        animElemTime: (elementNumber) => getAnimElemTime(actor, elementNumber),
        inGuardDist: () => evaluateRuntimeInGuardDist(actor, targetOpponent),
      }),
  });
}

function evaluateRuntimeTrigger(
  trigger: ControllerIr["triggers"][number],
  fighter: FighterMatchState,
  opponent: FighterMatchState,
  owner: FighterMatchState = fighter,
  stageTime?: number,
  stageBounds?: MugenStageDefinition["bounds"],
): boolean {
  return triggerEvaluationWorld.passes({
    trigger,
    actor: fighter,
    opponent,
    opponents: [opponent],
    owner,
    tick: stageTime,
    createContext: ({ actor, opponent: targetOpponent, opponents: targetOpponents, owner: stateOwner, tick }) =>
      expressionContextWorld.create({
        actor,
        opponent: targetOpponent,
        opponents: targetOpponents,
        owner: stateOwner,
        stageBounds,
        stageTime: tick,
        random: () => nextRuntimeRandom(actor),
        animTimeRemaining: getAnimTimeRemaining(actor),
        animElemTime: (elementNumber) => getAnimElemTime(actor, elementNumber),
        inGuardDist: () => evaluateRuntimeInGuardDist(actor, targetOpponent),
      }),
  });
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
