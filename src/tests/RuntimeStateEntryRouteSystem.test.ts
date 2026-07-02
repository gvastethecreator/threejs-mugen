import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeStateEntryRouteWorld,
  type RuntimeStateEntryRouteActor,
} from "../mugen/runtime/RuntimeStateEntryRouteSystem";

type Move = { actionId: number; label: string };
type Actor = RuntimeStateEntryRouteActor<Move> & { id: string };

describe("RuntimeStateEntryRouteWorld", () => {
  it("routes State -1 ChangeState entries into authored state moves", () => {
    const world = new RuntimeStateEntryRouteWorld();
    const move = { actionId: 200, label: "light punch" };
    const actor = routeActor([compiled("VelSet", { x: "4" }), compiled("ChangeState", { value: "200" }, "Light Punch")], [
      [200, move],
    ]);
    const calls: string[] = [];

    const result = world.apply(actor, routeActor(), 17, {
      triggersPass: (controller, current, _opponent, owner, tick) => {
        calls.push(`trigger:${controller.type}:${current.id}:${owner.id}:${tick}`);
        return true;
      },
      resolveStateId: (dispatch) => dispatch.stateId,
      recordStateEntryRoute: (_actor, controller, stateId) => calls.push(`record:${controller.type}:${stateId}`),
      startMove: (_actor, routedMove, label) => calls.push(`move:${routedMove.label}:${label}`),
      enterState: (_actor, stateId) => calls.push(`state:${stateId}`),
    });

    expect(result).toEqual({ applied: true, scanned: 2, skipped: false, stateId: 200, route: "state-move" });
    expect(calls).toEqual(["trigger:ChangeState:p1:p1:17", "record:ChangeState:200", "move:light punch:Light Punch"]);
  });

  it("enters a raw state when no authored state move exists", () => {
    const world = new RuntimeStateEntryRouteWorld();
    const actor = routeActor([compiled("ChangeState", { value: "310" })]);
    const calls: string[] = [];

    const result = world.apply(actor, routeActor(), 4, {
      triggersPass: () => true,
      resolveStateId: (dispatch) => dispatch.stateId,
      recordStateEntryRoute: (_actor, controller, stateId) => calls.push(`record:${controller.type}:${stateId}`),
      startMove: (_actor, move) => calls.push(`move:${move.label}`),
      enterState: (_actor, stateId) => calls.push(`state:${stateId}`),
    });

    expect(result).toEqual({ applied: true, scanned: 1, skipped: false, stateId: 310, route: "state" });
    expect(calls).toEqual(["record:ChangeState:310", "state:310"]);
  });

  it("keeps failed triggers and unresolved state ids as no-op scans", () => {
    const world = new RuntimeStateEntryRouteWorld();
    const actor = routeActor([
      compiled("ChangeState", { value: "200" }),
      compiled("ChangeState", { value: "var(0) + 300" }),
    ]);
    const calls: string[] = [];

    const result = world.apply(actor, routeActor(), 9, {
      triggersPass: (controller) => {
        calls.push(`trigger:${controller.params.value}`);
        return controller.params.value !== "200";
      },
      resolveStateId: () => undefined,
      recordStateEntryRoute: () => calls.push("record"),
      startMove: () => calls.push("move"),
      enterState: () => calls.push("state"),
    });

    expect(result).toEqual({ applied: false, scanned: 2, skipped: false });
    expect(calls).toEqual(["trigger:200", "trigger:var(0) + 300"]);
  });

  it("passes dynamic ChangeState expressions through the resolver hook", () => {
    const world = new RuntimeStateEntryRouteWorld();
    const actor = routeActor([compiled("ChangeState", { value: "var(0) + 400" })]);
    const expressions: string[] = [];
    const states: number[] = [];

    const result = world.apply(actor, routeActor(), 3, {
      triggersPass: () => true,
      resolveStateId: (dispatch) => {
        if (dispatch.stateExpression) {
          expressions.push(dispatch.stateExpression);
          return 407;
        }
        return dispatch.stateId;
      },
      enterState: (_actor, stateId) => states.push(stateId),
    });

    expect(result).toEqual({ applied: true, scanned: 1, skipped: false, stateId: 407, route: "state" });
    expect(expressions).toEqual(["var(0) + 400"]);
    expect(states).toEqual([407]);
  });

  it("reports an empty State -1 list as skipped", () => {
    const result = new RuntimeStateEntryRouteWorld().apply(routeActor(), routeActor(), 1, {
      triggersPass: () => true,
      resolveStateId: (dispatch) => dispatch.stateId,
    });

    expect(result).toEqual({ applied: false, scanned: 0, skipped: true });
  });
});

function routeActor(entries: ControllerIr[] = [], moves: Array<[number, Move]> = []): Actor {
  return {
    id: "p1",
    definition: { stateMoves: new Map(moves) },
    runtimeProgram: { stateEntries: entries },
  };
}

function compiled(type: string, params: Record<string, string>, name?: string): ControllerIr {
  return compileControllerIr(controller(type, params, name));
}

function controller(type: string, params: Record<string, string>, name?: string): MugenStateController {
  return {
    stateId: -1,
    type,
    name,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State -1, ${name ?? type}]`,
  };
}
