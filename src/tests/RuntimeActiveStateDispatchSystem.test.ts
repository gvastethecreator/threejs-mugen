import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeActiveStateDispatchWorld,
  type RuntimeActiveStateDispatchActor,
  type RuntimeActiveStateDispatchHooks,
} from "../mugen/runtime/RuntimeActiveStateDispatchSystem";
import { dispatchStateProgramController } from "../mugen/runtime/StateProgramExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeActiveStateDispatchWorld", () => {
  it("owns active ChangeState routing with dynamic state, animation override, ctrl, and stop result", () => {
    const world = new RuntimeActiveStateDispatchWorld();
    const actor = activeActor("p1");
    const opponent = activeActor("p2");
    const owner = activeActor("owner");
    const calls: string[] = [];

    const result = world.apply({
      dispatch: dispatchStateProgramController(compiled("SelfState", { value: "var(0) + 300", anim: "201", ctrl: "0" })),
      actor,
      opponent,
      owner,
      tick: 14,
      hooks: hooks(calls),
    });

    expect(result).toEqual({
      handled: true,
      kind: "change-state",
      applied: true,
      stateId: 314,
      animOverride: 201,
      ctrl: false,
      stop: true,
    });
    expect(actor.runtime.ctrl).toBe(false);
    expect(calls).toEqual([
      "resolve-number:var(0) + 300:p1:p2:owner:14",
      "resolve-number:201:p1:p2:owner:14",
      "resolve-bool:false:p1:p2:owner:14",
      "record:p1:SelfState",
      "enter:p1:314:clear:201:preserve",
      "ctrl:p1:false",
    ]);
  });

  it("routes active ChangeAnim2 through the state owner and resolved element timing", () => {
    const world = new RuntimeActiveStateDispatchWorld();
    const actor = activeActor("p1");
    const opponent = activeActor("p2");
    const owner = activeActor("owner");
    const calls: string[] = [];

    const result = world.apply({
      dispatch: dispatchStateProgramController(
        compiled("ChangeAnim2", { value: "600", elem: "var(1) + 2", elemtime: "3" }),
      ),
      actor,
      opponent,
      owner,
      tick: 8,
      hooks: hooks(calls),
    });

    expect(result).toEqual({
      handled: true,
      kind: "change-anim",
      applied: true,
      actionId: 600,
      elem: 4,
      elemTime: 3,
      actionFound: true,
      stop: false,
    });
    expect(calls).toEqual([
      "resolve-number:600:p1:p2:owner:8",
      "resolve-number:var(1) + 2:p1:p2:owner:8",
      "resolve-number:3:p1:p2:owner:8",
      "record:p1:ChangeAnim2",
      "change-action:p1:600:state-owner:owner:4:3",
    ]);
  });

  it("fails closed for unresolved active state or animation dispatches without recording telemetry", () => {
    const world = new RuntimeActiveStateDispatchWorld();
    const actor = activeActor("p1");
    const opponent = activeActor("p2");
    const calls: string[] = [];
    const unresolvedHooks = hooks(calls, { resolveExpressions: false });

    expect(
      world.apply({
        dispatch: dispatchStateProgramController(compiled("ChangeState", { value: "var(0)" })),
        actor,
        opponent,
        owner: actor,
        tick: 1,
        hooks: unresolvedHooks,
      }),
    ).toEqual({ handled: true, kind: "change-state", applied: false, reason: "unresolved-state", stop: false });
    expect(
      world.apply({
        dispatch: dispatchStateProgramController(compiled("ChangeAnim", { value: "var(1)" })),
        actor,
        opponent,
        owner: actor,
        tick: 2,
        hooks: unresolvedHooks,
      }),
    ).toEqual({ handled: true, kind: "change-anim", applied: false, reason: "unresolved-action", stop: false });
    expect(calls).toEqual(["resolve-number:var(0):p1:p2:p1:1", "resolve-number:var(1):p1:p2:p1:2"]);
  });

  it("leaves non state/animation dispatches for the remaining active controller pipeline", () => {
    const result = new RuntimeActiveStateDispatchWorld().apply({
      dispatch: dispatchStateProgramController(compiled("VelSet", { x: "3" })),
      actor: activeActor("p1"),
      opponent: activeActor("p2"),
      owner: activeActor("p1"),
      tick: 0,
      hooks: hooks([]),
    });

    expect(result).toEqual({ handled: false, stop: false });
  });
});

type ActiveStateActor = RuntimeActiveStateDispatchActor<{ name: string }> & { id: string };

function hooks(
  calls: string[],
  options: { resolveExpressions?: boolean } = {},
): RuntimeActiveStateDispatchHooks<ActiveStateActor> {
  const resolveExpressions = options.resolveExpressions ?? true;
  return {
    resolveNumber: ({ value, expression, actor, opponent, owner, tick }) => {
      calls.push(`resolve-number:${value ?? expression}:${actor.id}:${opponent.id}:${owner.id}:${tick}`);
      if (value !== undefined) return value;
      if (!resolveExpressions) return undefined;
      if (expression === "var(0) + 300") return 314;
      if (expression === "var(1) + 2") return 4;
      return undefined;
    },
    resolveBoolean: ({ value, expression, actor, opponent, owner, tick }) => {
      calls.push(`resolve-bool:${value ?? expression}:${actor.id}:${opponent.id}:${owner.id}:${tick}`);
      return value ?? (expression === "1" ? true : expression === "0" ? false : undefined);
    },
    recordController: (actor, controller) => calls.push(`record:${actor.id}:${controller.type}`),
    enterState: (actor, stateId, enterOptions) => {
      actor.runtime.stateNo = stateId;
      calls.push(
        `enter:${actor.id}:${stateId}:${enterOptions.clearStateOwner ? "clear" : "keep"}:${enterOptions.animOverride ?? "none"}:${
          enterOptions.preserveAnimationWhenMissing ? "preserve" : "replace"
        }`,
      );
    },
    applyControl: (actor, ctrl) => {
      actor.runtime.ctrl = ctrl;
      calls.push(`ctrl:${actor.id}:${ctrl}`);
    },
    changeAction: (actor, actionId, source, actionOwner, elementOptions) => {
      actor.runtime.animNo = actionId;
      calls.push(
        `change-action:${actor.id}:${actionId}:${source}:${actionOwner.id}:${elementOptions.elem ?? "none"}:${
          elementOptions.elemTime ?? "none"
        }`,
      );
      return true;
    },
  };
}

function activeActor(id: string): ActiveStateActor {
  return {
    id,
    definition: { name: id },
    runtime: runtimeState(),
  };
}

function compiled(type: string, params: Record<string, string>): ControllerIr {
  return compileControllerIr(controller(type, params));
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
    animTime: 0,
    frameIndex: 0,
    life: 100,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}
