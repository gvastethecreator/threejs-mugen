import { describe, expect, it } from "vitest";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeActiveControllerDispatchWorld,
  type RuntimeActiveControllerDispatchHooks,
} from "../mugen/runtime/RuntimeActiveControllerDispatchSystem";
import type { RuntimeActiveSideEffectDispatchHooks } from "../mugen/runtime/RuntimeActiveSideEffectDispatchSystem";
import type {
  RuntimeActiveStateDispatchActor,
  RuntimeActiveStateDispatchHooks,
} from "../mugen/runtime/RuntimeActiveStateDispatchSystem";
import type { StateProgramDispatch } from "../mugen/runtime/StateProgramExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeActiveControllerDispatchWorld", () => {
  it("routes active state dispatch first and stops after ChangeState", () => {
    const actor = activeActor("p1");
    const calls: string[] = [];

    const result = new RuntimeActiveControllerDispatchWorld().apply({
      dispatch: changeStateDispatch(310),
      actor,
      opponent: activeActor("p2"),
      owner: activeActor("owner"),
      tick: 20,
      stateHooks: stateHooks(calls),
      sideEffectHooks: sideEffectHooks(calls),
      hooks: routeHooks(calls),
    });

    expect(result).toMatchObject({
      handled: true,
      route: "state",
      stop: true,
      stateDispatch: {
        handled: true,
        kind: "change-state",
        applied: true,
        stateId: 310,
      },
    });
    expect(actor.runtime.stateNo).toBe(310);
    expect(calls).toEqual([
      "resolve-number:310:p1:p2:owner:20",
      "resolve-number:undefined:p1:p2:owner:20",
      "record:p1:ChangeState",
      "enter:p1:310",
    ]);
  });

  it("routes runtime controllers after state dispatch declines ownership", () => {
    const calls: string[] = [];

    const result = new RuntimeActiveControllerDispatchWorld().apply({
      dispatch: { kind: "runtime-controller", controller: controllerIr("VelSet") },
      actor: activeActor("p1"),
      opponent: activeActor("p2"),
      owner: activeActor("owner"),
      tick: 7,
      stateHooks: stateHooks(calls),
      sideEffectHooks: sideEffectHooks(calls),
      hooks: routeHooks(calls),
    });

    expect(result).toEqual({
      handled: true,
      route: "runtime-controller",
      applied: true,
      stop: false,
    });
    expect(calls).toEqual(["runtime:VelSet:p1:p2:owner:7"]);
  });

  it("routes active side effects after runtime-controller dispatch declines ownership", () => {
    const calls: string[] = [];

    const result = new RuntimeActiveControllerDispatchWorld().apply({
      dispatch: sideEffectDispatch("sound"),
      actor: activeActor("p1"),
      opponent: activeActor("p2"),
      owner: activeActor("owner"),
      tick: 9,
      stateHooks: stateHooks(calls),
      sideEffectHooks: sideEffectHooks(calls),
      hooks: routeHooks(calls),
    });

    expect(result).toEqual({
      handled: true,
      route: "side-effect",
      sideEffectDispatch: {
        handled: true,
        effect: "sound",
        route: "sound",
        applied: true,
        stop: false,
      },
      stop: false,
    });
    expect(calls).toEqual(["side-effect:sound:p1:p2:owner:9"]);
  });

  it("keeps unsupported dispatches non-fatal and reportable", () => {
    const calls: string[] = [];

    const result = new RuntimeActiveControllerDispatchWorld().apply({
      dispatch: { kind: "unsupported", controller: controllerIr("EnemyNear") },
      actor: activeActor("p1"),
      opponent: activeActor("p2"),
      owner: activeActor("owner"),
      tick: 12,
      stateHooks: stateHooks(calls),
      sideEffectHooks: sideEffectHooks(calls),
      hooks: routeHooks(calls),
    });

    expect(result).toEqual({
      handled: true,
      route: "unsupported",
      applied: true,
      stop: false,
    });
    expect(calls).toEqual(["unsupported:EnemyNear:p1:p2:owner:12"]);
  });
});

type ActiveDispatchActor = RuntimeActiveStateDispatchActor<{ name: string }> & { id: string };

function stateHooks(calls: string[]): RuntimeActiveStateDispatchHooks<ActiveDispatchActor> {
  return {
    resolveNumber: ({ value, expression, actor, opponent, owner, tick }) => {
      calls.push(`resolve-number:${value ?? expression}:${actor.id}:${opponent.id}:${owner.id}:${tick}`);
      return value;
    },
    resolveBoolean: ({ value }) => value,
    recordController: (actor, controller) => calls.push(`record:${actor.id}:${controller.type}`),
    enterState: (actor, stateId) => {
      actor.runtime.stateNo = stateId;
      calls.push(`enter:${actor.id}:${stateId}`);
    },
    applyControl: (actor, ctrl) => {
      actor.runtime.ctrl = ctrl;
    },
    changeAction: (actor, actionId) => {
      actor.runtime.animNo = actionId;
      return true;
    },
  };
}

function sideEffectHooks(calls: string[]): RuntimeActiveSideEffectDispatchHooks<ActiveDispatchActor> {
  return {
    sound: ({ effect, actor, opponent, owner, tick }) =>
      calls.push(`side-effect:${effect}:${actor.id}:${opponent.id}:${owner.id}:${tick}`),
  };
}

function routeHooks(calls: string[]): RuntimeActiveControllerDispatchHooks<ActiveDispatchActor> {
  return {
    runtimeController: ({ dispatch, actor, opponent, owner, tick }) =>
      calls.push(`runtime:${dispatch.controller.type}:${actor.id}:${opponent.id}:${owner.id}:${tick}`),
    unsupported: ({ dispatch, actor, opponent, owner, tick }) =>
      calls.push(`unsupported:${dispatch.controller.type}:${actor.id}:${opponent.id}:${owner.id}:${tick}`),
  };
}

function changeStateDispatch(stateId: number): StateProgramDispatch {
  return {
    kind: "change-state",
    controller: controllerIr("ChangeState"),
    stateId,
    clearStateOwner: true,
  };
}

function sideEffectDispatch(effect: "sound"): StateProgramDispatch {
  return {
    kind: "side-effect",
    controller: controllerIr(effect),
    effect,
  };
}

function controllerIr(type: string): ControllerIr {
  return {
    source: controllerSource(type),
    stateId: 200,
    type,
    normalizedType: type.toLowerCase(),
    supportLevel: "partial",
    triggers: [],
    params: {},
    line: 1,
    unsupportedFeatures: [],
  };
}

function controllerSource(type: string): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params: {},
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function activeActor(id: string): ActiveDispatchActor {
  return {
    id,
    definition: { name: id },
    runtime: runtimeState(),
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
