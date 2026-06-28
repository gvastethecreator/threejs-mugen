import type { PauseControllerOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";
import type { RuntimeMatchPauseSnapshot } from "./types";

export type RuntimeMatchPause = RuntimeMatchPauseSnapshot & {
  startedAt: number;
};

export type MatchPauseControllerResult = {
  pause?: RuntimeMatchPause;
  powerDelta: number;
};

export type MatchPauseActor = {
  id: string;
  runtime: {
    stateNo: number;
  };
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

  tick(): RuntimeMatchPause | undefined {
    this.pause = this.pause ? tickMatchPause(this.pause) : undefined;
    return this.pause;
  }

  applyController(
    actor: MatchPauseActor,
    controller: MugenStateController,
    tick: number,
    operation?: PauseControllerOp,
  ): MatchPauseControllerResult {
    const result = createMatchPauseFromController(actor, controller, tick, operation);
    if (result.pause) {
      this.pause = result.pause;
    }
    return result;
  }
}

export function createMatchPauseFromController(
  actor: MatchPauseActor,
  controller: MugenStateController,
  tick: number,
  operation?: PauseControllerOp,
): MatchPauseControllerResult {
  const controllerType = operation?.controllerType ?? (controller.type.toLowerCase() === "superpause" ? "superpause" : "pause");
  const type = controllerType === "superpause" ? "SuperPause" : "Pause";
  const time = clampPauseTime(operation?.time ?? firstNumber(findControllerParam(controller, "time")) ?? 0);
  const moveTime = Math.min(time, clampPauseTime(operation?.moveTime ?? firstNumber(findControllerParam(controller, "movetime")) ?? 0));
  if (time <= 0) {
    return { powerDelta: 0 };
  }

  return {
    pause: {
      type,
      remaining: time,
      moveTime,
      actorId: actor.id,
      darken: type === "SuperPause" ? operation?.darken ?? (firstNumber(findControllerParam(controller, "darken")) ?? 1) !== 0 : false,
      sourceStateNo: actor.runtime.stateNo,
      startedAt: tick,
    },
    powerDelta: type === "SuperPause" ? operation?.powerAdd ?? (firstNumber(findControllerParam(controller, "poweradd")) ?? 0) : 0,
  };
}

export function canActorMoveDuringPause(pause: RuntimeMatchPause | undefined, actorId: string): boolean {
  return pause !== undefined && pause.actorId === actorId && pause.moveTime > 0;
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
    darken: pause.darken,
    sourceStateNo: pause.sourceStateNo,
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
