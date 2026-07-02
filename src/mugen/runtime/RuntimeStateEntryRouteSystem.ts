import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { dispatchStateProgramController, type StateProgramDispatch } from "./StateProgramExecutor";

type RuntimeStateEntryChangeStateDispatch = Extract<StateProgramDispatch, { kind: "change-state" }>;

export type RuntimeStateEntryRouteActor<TMove = unknown> = {
  definition: {
    stateMoves?: ReadonlyMap<number, TMove>;
  };
  runtimeProgram?: {
    stateEntries: ControllerIr[];
  };
};

type RuntimeStateEntryRouteMove<TActor extends RuntimeStateEntryRouteActor<unknown>> =
  TActor extends RuntimeStateEntryRouteActor<infer TMove> ? TMove : never;

export type RuntimeStateEntryRouteHooks<TActor extends RuntimeStateEntryRouteActor<unknown>> = {
  triggersPass: (controller: ControllerIr, actor: TActor, opponent: TActor, owner: TActor, tick: number) => boolean;
  resolveStateId: (
    dispatch: RuntimeStateEntryChangeStateDispatch,
    controller: ControllerIr,
    actor: TActor,
    opponent: TActor,
    tick: number,
  ) => number | undefined;
  recordStateEntryRoute?: (actor: TActor, controller: MugenStateController, stateId: number) => void;
  startMove?: (actor: TActor, move: RuntimeStateEntryRouteMove<TActor>, label: string) => void;
  enterState?: (actor: TActor, stateId: number) => void;
};

export type RuntimeStateEntryRouteResult = {
  applied: boolean;
  scanned: number;
  skipped: boolean;
  stateId?: number;
  route?: "state-move" | "state";
};

export class RuntimeStateEntryRouteWorld {
  apply<TActor extends RuntimeStateEntryRouteActor<unknown>>(
    actor: TActor,
    opponent: TActor,
    tick: number,
    hooks: RuntimeStateEntryRouteHooks<TActor>,
  ): RuntimeStateEntryRouteResult {
    const entries = actor.runtimeProgram?.stateEntries ?? [];
    if (entries.length === 0) {
      return { applied: false, scanned: 0, skipped: true };
    }

    let scanned = 0;
    for (const controller of entries) {
      scanned += 1;
      const dispatch = dispatchStateProgramController(controller);
      if (dispatch.kind !== "change-state") {
        continue;
      }
      if (!hooks.triggersPass(controller, actor, opponent, actor, tick)) {
        continue;
      }
      const stateId = hooks.resolveStateId(dispatch, controller, actor, opponent, tick);
      if (stateId === undefined) {
        continue;
      }

      hooks.recordStateEntryRoute?.(actor, controller.source, stateId);
      const stateMoves = actor.definition.stateMoves as ReadonlyMap<number, RuntimeStateEntryRouteMove<TActor>> | undefined;
      const move = stateMoves?.get(stateId);
      if (move !== undefined) {
        hooks.startMove?.(actor, move, controller.name ?? `state ${stateId}`);
        return { applied: true, scanned, skipped: false, stateId, route: "state-move" };
      }

      hooks.enterState?.(actor, stateId);
      return { applied: true, scanned, skipped: false, stateId, route: "state" };
    }

    return { applied: false, scanned, skipped: false };
  }
}
