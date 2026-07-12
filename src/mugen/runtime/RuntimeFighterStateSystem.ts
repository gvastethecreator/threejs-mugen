import type { RuntimeProgramIr } from "../compiler/RuntimeIr";
import { compileRuntimeProgram } from "../compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import { RuntimeAudioWorld } from "./AudioEventSystem";
import { CommandBuffer } from "./CommandBuffer";
import { RuntimeContactMemoryWorld, type RuntimeContactMemory } from "./ContactMemorySystem";
import { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { RuntimeEnvShakeWorld } from "./EnvShakeSystem";
import { RuntimeHitEffectWorld } from "./HitEffectSystem";
import type { RuntimeHelper, RuntimeHelperAdvanceOptions } from "./HelperSystem";
import { createRuntimeRandomSeed } from "./RuntimeRandomSystem";
import { runtimeLifeMaxFromConstants, runtimePowerMaxFromConstants } from "./RuntimeResourceSystem";
import type {
  CharacterRuntimeState,
  RuntimeControllerTraceEvent,
  RuntimeEnvShakeEvent,
  RuntimeHitEffectEvent,
  RuntimeSoundEvent,
} from "./types";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import { RuntimeTargetWorld, type RuntimeTarget, type RuntimeTargetBinding, type RuntimeTargetWorldActor } from "./TargetSystem";

export type FighterMatchState = {
  id: string;
  playerId?: number;
  playerNo?: number;
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
  enterHelperTargetState?: (helper: RuntimeHelper, target: RuntimeTargetWorldActor, stateId: number) => void;
  onHelperController?: RuntimeHelperAdvanceOptions["onController"];
  onHelperOperation?: RuntimeHelperAdvanceOptions["onOperation"];
  onHelperPauseController?: RuntimeHelperAdvanceOptions["onPauseController"];
  onHelperTeamStandby?: RuntimeHelperAdvanceOptions["onTeamStandby"];
  scaleHelperTargetDamage?: RuntimeHelperAdvanceOptions["scaleTargetDamage"];
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

export type RuntimeFighterStateCreateInput = {
  id: string;
  playerId?: number;
  playerNo?: number;
  definition: DemoFighterDefinition;
  x: number;
  y: number;
  facing: 1 | -1;
  effectActorWorld?: RuntimeEffectActorWorld;
  targetWorld?: RuntimeTargetWorld;
  audioWorld?: RuntimeAudioWorld;
  envShakeWorld?: RuntimeEnvShakeWorld;
  hitEffectWorld?: RuntimeHitEffectWorld;
  contactWorld?: RuntimeContactMemoryWorld;
};

export class RuntimeFighterStateWorld {
  create(input: RuntimeFighterStateCreateInput): FighterMatchState {
    const effectActorWorld = input.effectActorWorld ?? new RuntimeEffectActorWorld();
    const targetWorld = input.targetWorld ?? new RuntimeTargetWorld();
    const audioWorld = input.audioWorld ?? new RuntimeAudioWorld();
    const envShakeWorld = input.envShakeWorld ?? new RuntimeEnvShakeWorld();
    const hitEffectWorld = input.hitEffectWorld ?? new RuntimeHitEffectWorld();
    const contactWorld = input.contactWorld ?? new RuntimeContactMemoryWorld();
    const action = input.definition.animations.get(input.definition.idleAction)!;
    const runtimeProgram = getRuntimeProgram(input.definition);
    const lifeMax = runtimeLifeMaxFromConstants(input.definition.constants);
    const powerMax = runtimePowerMaxFromConstants(input.definition.constants);
    const attackMultiplier = runtimeAttackMultiplier(input.definition);
    const defenseMultiplier = runtimeDefenseMultiplier(input.definition);

    return {
      id: input.id,
      ...(input.playerId === undefined ? {} : { playerId: input.playerId }),
      ...(input.playerNo === undefined ? {} : { playerNo: input.playerNo }),
      label: input.definition.displayName,
      definition: input.definition,
      runtimeProgram,
      stateOwner: undefined,
      runtime: {
        teamState: {
          disabled: false,
          standby: false,
          overKo: false,
          playerType: true,
        },
        pos: { x: input.x, y: input.y },
        vel: { x: 0, y: 0 },
        facing: input.facing,
        bodyWidth: { front: 39, back: 39 },
        playerPush: true,
        targetCount: 0,
        ...(attackMultiplier === undefined ? {} : { attackMultiplier }),
        ...(defenseMultiplier === undefined ? {} : { defenseMultiplier }),
        spritePriority: input.id === "p2" ? 1 : 2,
        stateNo: 0,
        animNo: input.definition.idleAction,
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
      rngSeed: createRuntimeRandomSeed(input.id, input.definition.id),
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
    constants: definition.constants,
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
