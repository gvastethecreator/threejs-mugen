import type { AudioControllerOp, PauseControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { MugenStateController } from "../model/MugenState";
import type { RuntimeActorConstraintWorld } from "./ActorConstraintSystem";
import type { RuntimeEffectLifecycleActor, RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";
import { RuntimeMatchOpponentContextWorld } from "./RuntimeMatchOpponentContextSystem";
import { findControllerParam } from "./StateProgramExecutor";
import type { RuntimeTargetWorld, RuntimeTargetWorldActor } from "./TargetSystem";
import type { RuntimeMatchPauseSnapshot, RuntimeResolvedSoundRef, RuntimeSoundEvent, RuntimeSuperPauseAnimSnapshot } from "./types";

export type RuntimeMatchPause = RuntimeMatchPauseSnapshot & {
  startedAt: number;
};

export type MatchPauseControllerResult = {
  pause?: RuntimeMatchPause;
  powerDelta: number;
  soundEvent?: RuntimeSoundEvent;
  targetDefenseMultiplier?: number;
  targetDefenseTargets?: number;
};

export type MatchPauseActor = {
  id: string;
  runtime: {
    stateNo: number;
  };
};

export type RuntimePausedMatchActor = {
  id: string;
};

export type RuntimePausedMatchWorldInput<TActor extends RuntimePausedMatchActor> = {
  p1: TActor;
  p2: TActor;
  p1Input: Set<string>;
  p2Input: Set<string>;
  p2Controlled: boolean;
  currentPause: () => RuntimeMatchPause | undefined;
  canActorMove: (actorId: string) => boolean;
  pushCommandBuffer: (actor: TActor, input: Set<string>) => void;
  handlePlayerInput: (actor: TActor, input: Set<string>, opponent: TActor) => void;
  handleAi: (actor: TActor, opponent: TActor) => void;
  advanceFighter: (actor: TActor, opponent: TActor) => void;
  advanceTargetMemory: (actor: TActor) => void;
  advanceActiveEffects: (actor: TActor) => void;
  advancePresentationEffects: (actor: TActor) => void;
  applyTargetBindings: (actor: TActor, opponent: TActor) => void;
  applyBindToTarget: (actor: TActor, opponent: TActor) => void;
  clampToStage: (actor: TActor) => void;
  advancePausedPresentation: (actor: TActor, pause: RuntimeMatchPause) => void;
  tickPause: () => RuntimeMatchPause | undefined;
};

export type RuntimePausedMatchRuntimeActor = RuntimeEffectLifecycleActor &
  RuntimeTargetWorldActor & {
    targetWorld: Pick<RuntimeTargetWorld, "advance" | "applyTargetBindings" | "applyBindToTarget">;
  };

export type RuntimePausedMatchRuntimeWorldInput<TActor extends RuntimePausedMatchRuntimeActor> = {
  p1: TActor;
  p2: TActor;
  p1Input: Set<string>;
  p2Input: Set<string>;
  p2Controlled: boolean;
  stage: Pick<MugenStageDefinition, "bounds">;
  actorConstraintWorld: Pick<RuntimeActorConstraintWorld, "clampToStage">;
  effectLifecycleWorld: Pick<
    RuntimeEffectLifecycleWorld,
    "advanceActive" | "advancePresentation" | "advancePausedPresentation"
  >;
  gameSpace?: ExpressionGameSpace;
  stageTime?: number;
  runtimeTick?: number;
  currentPause: () => RuntimeMatchPause | undefined;
  canActorMove: (actorId: string) => boolean;
  pushCommandBuffer: (actor: TActor, input: Set<string>) => void;
  handlePlayerInput: (actor: TActor, input: Set<string>, opponent: TActor) => void;
  handleAi: (actor: TActor, opponent: TActor) => void;
  advanceFighter: (actor: TActor, opponent: TActor) => void;
  tickPause: () => RuntimeMatchPause | undefined;
};

export type RuntimePausedMatchAdvanceResult = {
  paused: boolean;
  sourceActorId?: string;
  actorMoved: boolean;
  interrupted: boolean;
  ticked: boolean;
};

export type RuntimePauseControllerDispatchOptions<TActor extends MatchPauseActor> = {
  actor: TActor;
  controller: ControllerIr;
  applyController: (
    actor: TActor,
    controller: MugenStateController,
    operation?: PauseControllerOp,
    resolveParams?: RuntimePauseControllerParamResolvers,
  ) => MatchPauseControllerResult | undefined;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: PauseControllerOp) => void;
};

export type RuntimePauseControllerDispatchResult = {
  result?: MatchPauseControllerResult;
  recordedController: boolean;
  recordedOperation: boolean;
};

export type RuntimeMatchPauseControllerWorldInput<TActor extends MatchPauseActor & { label: string }> = {
  actor: TActor;
  controller: MugenStateController;
  operation?: PauseControllerOp;
  runtimeTick: number;
  pauseWorld: Pick<RuntimePauseWorld, "applyController">;
  applyPowerDelta: (actor: TActor, powerDelta: number) => void;
  emitSound?: (
    actor: TActor,
    sound: string | undefined,
    runtimeTick: number,
    resolvedSound?: RuntimeResolvedSoundRef,
  ) => RuntimeSoundEvent | undefined;
  resolveSoundValue?: () => RuntimeResolvedSoundRef | undefined;
  recordAudioOperation?: (actor: TActor, operation: AudioControllerOp) => void;
  resolveParams?: RuntimePauseControllerParamResolvers;
  applyTargetDefenseMultiplier?: (actor: TActor, multiplier: number) => number;
  log: (message: string) => void;
};

export type RuntimePauseControllerParamResolvers = {
  time?: () => number | undefined;
  moveTime?: () => number | undefined;
  pauseBg?: () => number | undefined;
  unhittable?: () => number | undefined;
  darken?: () => number | undefined;
  powerAdd?: () => number | undefined;
  p2DefMul?: () => number | undefined;
  animActionNo?: () => number | undefined;
  posX?: () => number | undefined;
  posY?: () => number | undefined;
};

export class RuntimePauseWorld {
  private pause?: RuntimeMatchPause;

  current(): RuntimeMatchPause | undefined {
    return this.pause;
  }

  reset(): void {
    this.pause = undefined;
  }

  snapshot(): RuntimeMatchPauseSnapshot | undefined {
    return this.pause ? toMatchPauseSnapshot(this.pause) : undefined;
  }

  canActorMove(actorId: string): boolean {
    return canActorMoveDuringPause(this.pause, actorId);
  }

  canActorBeHit(actorId: string): boolean {
    return canActorBeHitDuringPause(this.pause, actorId);
  }

  tick(): RuntimeMatchPause | undefined {
    this.pause = this.pause ? tickMatchPause(this.pause) : undefined;
    return this.pause;
  }

  applyController(
    actor: MatchPauseActor,
    controller: MugenStateController,
    tick: number,
    operation?: PauseControllerOp,
    resolveParams?: RuntimePauseControllerParamResolvers,
  ): MatchPauseControllerResult {
    const result = createMatchPauseFromController(actor, controller, tick, operation, resolveParams);
    if (result.pause) {
      this.pause = result.pause;
    }
    return result;
  }
}

export class RuntimeMatchPauseControllerWorld {
  apply<TActor extends MatchPauseActor & { label: string }>(
    input: RuntimeMatchPauseControllerWorldInput<TActor>,
  ): MatchPauseControllerResult {
    const result = input.pauseWorld.applyController(
      input.actor,
      input.controller,
      input.runtimeTick,
      input.operation,
      input.resolveParams,
    );
    if (!result.pause) {
      return result;
    }
    if (result.powerDelta !== 0) {
      input.applyPowerDelta(input.actor, result.powerDelta);
    }
    const targetDefenseMultiplier = superPauseTargetDefenseMultiplierParam(
      input.controller,
      input.operation,
      input.resolveParams?.p2DefMul,
    );
    const targetDefenseTargets =
      result.pause.type === "SuperPause" && targetDefenseMultiplier !== undefined
        ? input.applyTargetDefenseMultiplier?.(input.actor, targetDefenseMultiplier) ?? 0
        : 0;
    const sound = superPauseSoundParam(input.controller, input.operation);
    const resolvedSound = result.pause.type === "SuperPause" && sound ? input.resolveSoundValue?.() : undefined;
    const soundEvent =
      result.pause.type === "SuperPause" && sound
        ? input.emitSound?.(input.actor, sound, input.runtimeTick, resolvedSound)
        : undefined;
    const audioOperation =
      result.pause.type === "SuperPause" && sound ? superPauseSoundAudioOperation(sound, resolvedSound) : undefined;
    if (audioOperation) {
      input.recordAudioOperation?.(input.actor, audioOperation);
    }
    input.log(
      `${input.actor.label} triggered ${result.pause.type} for ${result.pause.remaining}f (${result.pause.moveTime}f movetime)`,
    );
    return {
      ...result,
      ...(soundEvent ? { soundEvent } : {}),
      ...(targetDefenseTargets > 0 ? { targetDefenseMultiplier, targetDefenseTargets } : {}),
    };
  }
}

export class RuntimePauseControllerDispatchWorld {
  apply<TActor extends MatchPauseActor>(
    options: RuntimePauseControllerDispatchOptions<TActor>,
  ): RuntimePauseControllerDispatchResult {
    const operation = options.controller.operation?.kind === "pause" ? options.controller.operation : undefined;
    options.recordController?.(options.actor, options.controller.source);
    const result = options.applyController(options.actor, options.controller.source, operation);
    if (result?.pause && operation) {
      options.recordOperation?.(options.actor, operation);
    }
    return {
      result,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(result?.pause && operation && options.recordOperation),
    };
  }
}

export class RuntimePausedMatchWorld {
  private readonly opponentContextWorld = new RuntimeMatchOpponentContextWorld();

  advance<TActor extends RuntimePausedMatchActor>(input: RuntimePausedMatchWorldInput<TActor>): RuntimePausedMatchAdvanceResult {
    const pause = input.currentPause();
    if (!pause) {
      return { paused: false, actorMoved: false, interrupted: false, ticked: false };
    }

    input.pushCommandBuffer(input.p1, input.p1Input);
    input.pushCommandBuffer(input.p2, input.p2Input);

    const actor = pause.actorId === input.p2.id ? input.p2 : input.p1;
    const opponent = actor === input.p1 ? input.p2 : input.p1;
    const actorInput = actor === input.p1 ? input.p1Input : input.p2Input;
    const actorMoved = input.canActorMove(actor.id);

    if (actorMoved) {
      if (actor === input.p1 || input.p2Controlled) {
        input.handlePlayerInput(actor, actorInput, opponent);
      } else {
        input.handleAi(actor, opponent);
      }
      input.advanceFighter(actor, opponent);
      input.advanceTargetMemory(actor);
      input.advanceActiveEffects(actor);
      input.advancePresentationEffects(actor);
      input.applyTargetBindings(actor, opponent);
      input.applyBindToTarget(actor, opponent);
      input.clampToStage(actor);
    }

    if (input.currentPause() !== pause) {
      return { paused: true, sourceActorId: actor.id, actorMoved, interrupted: true, ticked: false };
    }

    if (!actorMoved || actor.id !== input.p1.id) {
      input.advancePausedPresentation(input.p1, pause);
    }
    if (!actorMoved || actor.id !== input.p2.id) {
      input.advancePausedPresentation(input.p2, pause);
    }
    input.tickPause();
    return { paused: true, sourceActorId: actor.id, actorMoved, interrupted: false, ticked: true };
  }

  advanceRuntime<TActor extends RuntimePausedMatchRuntimeActor>(
    input: RuntimePausedMatchRuntimeWorldInput<TActor>,
  ): RuntimePausedMatchAdvanceResult {
    const { actorConstraintWorld, effectLifecycleWorld, stage } = input;
    const pair = { p1: input.p1, p2: input.p2 };

    return this.advance({
      p1: input.p1,
      p2: input.p2,
      p1Input: input.p1Input,
      p2Input: input.p2Input,
      p2Controlled: input.p2Controlled,
      currentPause: input.currentPause,
      canActorMove: input.canActorMove,
      pushCommandBuffer: input.pushCommandBuffer,
      handlePlayerInput: input.handlePlayerInput,
      handleAi: input.handleAi,
      advanceFighter: input.advanceFighter,
      advanceTargetMemory: (actor) => actor.targetWorld.advance(actor),
      advanceActiveEffects: (actor) => {
        const context = this.opponentContextWorld.forActor(pair, actor);
        if (!context) {
          return;
        }
        effectLifecycleWorld.advanceActive(actor, stage, context.opponent, {
          gameSpace: input.gameSpace,
          stageTime: input.stageTime,
          runtimeTick: input.runtimeTick,
          opponents: context.opponents,
        });
      },
      advancePresentationEffects: (actor) => effectLifecycleWorld.advancePresentation(actor),
      applyTargetBindings: (actor, opponent) => actor.targetWorld.applyTargetBindings(actor, [opponent]),
      applyBindToTarget: (actor, opponent) => actor.targetWorld.applyBindToTarget(actor, [opponent]),
      clampToStage: (actor) => actorConstraintWorld.clampToStage(actor.runtime, stage),
      advancePausedPresentation: (actor, pause) => {
        const context = this.opponentContextWorld.forActor(pair, actor);
        if (!context) {
          return;
        }
        effectLifecycleWorld.advancePausedPresentation(actor, pause.type, stage, context.opponent, {
          gameSpace: input.gameSpace,
          stageTime: input.stageTime,
          runtimeTick: input.runtimeTick,
          opponents: context.opponents,
        });
      },
      tickPause: input.tickPause,
    });
  }
}

export function createMatchPauseFromController(
  actor: MatchPauseActor,
  controller: MugenStateController,
  tick: number,
  operation?: PauseControllerOp,
  resolveParams?: RuntimePauseControllerParamResolvers,
): MatchPauseControllerResult {
  const controllerType = operation?.controllerType ?? (controller.type.toLowerCase() === "superpause" ? "superpause" : "pause");
  const type = controllerType === "superpause" ? "SuperPause" : "Pause";
  const time = clampPauseTime(resolveParams?.time?.() ?? operation?.time ?? firstNumber(findControllerParam(controller, "time")) ?? 0);
  const moveTime = Math.min(
    time,
    clampPauseTime(resolveParams?.moveTime?.() ?? operation?.moveTime ?? firstNumber(findControllerParam(controller, "movetime")) ?? 0),
  );
  if (time <= 0) {
    return { powerDelta: 0 };
  }
  const darken = resolveParams?.darken?.();
  const pauseBg = resolveParams?.pauseBg?.();
  const pauseBgEnabled =
    pauseBg !== undefined ? pauseBg !== 0 : operation?.pauseBg ?? (firstNumber(findControllerParam(controller, "pausebg")) ?? 1) !== 0;
  const unhittable = resolveParams?.unhittable?.();
  const superPauseUnhittable =
    type === "SuperPause"
      ? unhittable !== undefined
        ? unhittable !== 0
        : operation?.unhittable ?? (firstNumber(findControllerParam(controller, "unhittable")) ?? 1) !== 0
      : false;
  const powerAdd = resolveParams?.powerAdd?.();
  const superAnim = type === "SuperPause" ? superPauseAnimParam(controller, operation, resolveParams) : undefined;

  return {
    pause: {
      type,
      remaining: time,
      moveTime,
      actorId: actor.id,
      ...(pauseBgEnabled ? {} : { pauseBg: false }),
      ...(type === "SuperPause" && !superPauseUnhittable ? { unhittable: false } : {}),
      darken:
        type === "SuperPause"
          ? darken !== undefined
            ? darken !== 0
            : operation?.darken ?? (firstNumber(findControllerParam(controller, "darken")) ?? 1) !== 0
          : false,
      sourceStateNo: actor.runtime.stateNo,
      startedAt: tick,
      ...(superAnim ? { superAnim } : {}),
    },
    powerDelta: type === "SuperPause" ? powerAdd ?? operation?.powerAdd ?? (firstNumber(findControllerParam(controller, "poweradd")) ?? 0) : 0,
  };
}

export function canActorMoveDuringPause(pause: RuntimeMatchPause | undefined, actorId: string): boolean {
  return pause !== undefined && pause.actorId === actorId && pause.moveTime > 0;
}

export function canActorBeHitDuringPause(pause: RuntimeMatchPause | undefined, actorId: string): boolean {
  return !(pause?.type === "SuperPause" && pause.actorId === actorId && pause.unhittable !== false);
}

export function tickMatchPause(pause: RuntimeMatchPause): RuntimeMatchPause | undefined {
  const next: RuntimeMatchPause = {
    ...pause,
    remaining: Math.max(0, pause.remaining - 1),
    moveTime: Math.max(0, pause.moveTime - 1),
  };
  return next.remaining > 0 ? next : undefined;
}

export function toMatchPauseSnapshot(pause: RuntimeMatchPause): RuntimeMatchPauseSnapshot {
  return {
    type: pause.type,
    remaining: pause.remaining,
    moveTime: pause.moveTime,
    actorId: pause.actorId,
    ...(pause.pauseBg === false ? { pauseBg: false } : {}),
    ...(pause.unhittable === false ? { unhittable: false } : {}),
    darken: pause.darken,
    sourceStateNo: pause.sourceStateNo,
    ...(pause.superAnim
      ? {
          superAnim: {
            ...pause.superAnim,
            offset: { ...pause.superAnim.offset },
          },
        }
      : {}),
  };
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function clampPauseTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function superPauseSoundParam(controller: MugenStateController, operation?: PauseControllerOp): string | undefined {
  const controllerType = operation?.controllerType ?? (controller.type.toLowerCase() === "superpause" ? "superpause" : "pause");
  if (controllerType !== "superpause") {
    return undefined;
  }
  const raw = operation?.sound ?? findControllerParam(controller, "sound");
  const sound = stripMugenString(raw);
  if (!sound || sound === "-1") {
    return undefined;
  }
  return sound;
}

function superPauseSoundAudioOperation(sound: string, resolvedSound?: RuntimeResolvedSoundRef): AudioControllerOp | undefined {
  const value = resolvedSound ? soundRefToString(resolvedSound) : normalizedStaticSoundRef(sound);
  if (!value) {
    return undefined;
  }
  return {
    kind: "audio",
    controllerType: "playsnd",
    value,
  };
}

function normalizedStaticSoundRef(sound: string): string | undefined {
  const match = /^\s*([FS])?\s*(-?\d+)\s*,\s*(-?\d+)/i.exec(sound);
  if (!match) {
    return undefined;
  }
  return `${match[1]?.toUpperCase() ?? ""}${Number(match[2])},${Number(match[3])}`;
}

function soundRefToString(ref: RuntimeResolvedSoundRef): string {
  return `${ref.rawPrefix ?? ""}${ref.group},${ref.index}`;
}

function superPauseTargetDefenseMultiplierParam(
  controller: MugenStateController,
  operation: PauseControllerOp | undefined,
  resolveTargetDefenseValue: (() => number | undefined) | undefined,
): number | undefined {
  const controllerType = operation?.controllerType ?? (controller.type.toLowerCase() === "superpause" ? "superpause" : "pause");
  if (controllerType !== "superpause") {
    return undefined;
  }
  const p2DefMul = operation?.p2DefMul ?? resolveTargetDefenseValue?.() ?? firstNumber(findControllerParam(controller, "p2defmul"));
  if (p2DefMul === undefined || p2DefMul <= 0) {
    return undefined;
  }
  return Math.max(0, Math.min(10, 1 / p2DefMul));
}

function superPauseAnimParam(
  controller: MugenStateController,
  operation?: PauseControllerOp,
  resolveParams?: RuntimePauseControllerParamResolvers,
): RuntimeSuperPauseAnimSnapshot | undefined {
  const controllerType = operation?.controllerType ?? (controller.type.toLowerCase() === "superpause" ? "superpause" : "pause");
  if (controllerType !== "superpause") {
    return undefined;
  }
  const rawAnim = operation?.anim ?? findControllerParam(controller, "anim");
  const parsed = parseSuperPauseAnimParam(rawAnim ?? "30", rawAnim === undefined ? undefined : resolveParams?.animActionNo?.());
  if (!parsed) {
    return undefined;
  }
  const pos = superPauseAnimOffsetParam(controller, operation, resolveParams);
  return {
    ...parsed,
    offset: { x: pos[0], y: pos[1] },
  };
}

function parseSuperPauseAnimParam(
  value: string | undefined,
  resolvedActionNo?: number,
): Omit<RuntimeSuperPauseAnimSnapshot, "offset"> | undefined {
  const raw = stripMugenString(value);
  if (!raw || raw === "-1") {
    return undefined;
  }
  const source = raw.toUpperCase().startsWith("S") ? "player" : "fightfx";
  const actionRaw = source === "player" ? raw.slice(1).trim() : raw.trim();
  const actionNo = Number(actionRaw);
  const resolvedNo = Number.isInteger(actionNo) ? actionNo : resolvedActionNo;
  if (resolvedNo === undefined || !Number.isInteger(resolvedNo) || resolvedNo < 0) {
    return undefined;
  }
  return { raw, source, actionNo: resolvedNo };
}

function superPauseAnimOffsetParam(
  controller: MugenStateController,
  operation?: PauseControllerOp,
  resolveParams?: RuntimePauseControllerParamResolvers,
): [number, number] {
  if (operation?.pos) {
    return operation.pos;
  }
  const x = resolveParams?.posX?.();
  const y = resolveParams?.posY?.();
  if (x !== undefined || y !== undefined) {
    return [x ?? 0, y ?? 0];
  }
  return numberPair(findControllerParam(controller, "pos")) ?? [0, 0];
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const [xRaw, yRaw] = value.split(",").map((part) => part.trim());
  const x = Number(xRaw);
  if (!Number.isFinite(x)) {
    return undefined;
  }
  const y = Number(yRaw);
  return [x, Number.isFinite(y) ? y : 0];
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
