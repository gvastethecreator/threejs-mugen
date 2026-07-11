import { describe, expect, it } from "vitest";
import type { ControllerIr, StateProgramIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { RuntimeActiveControllerDispatchHooks } from "../mugen/runtime/RuntimeActiveControllerDispatchSystem";
import {
  RuntimeActiveControllerRunWorld,
  type RuntimeActiveControllerRunActor,
} from "../mugen/runtime/RuntimeActiveControllerRunSystem";
import type { RuntimeActiveStateDispatchHooks } from "../mugen/runtime/RuntimeActiveStateDispatchSystem";
import type { RuntimeActiveSideEffectDispatchHooks } from "../mugen/runtime/RuntimeActiveSideEffectDispatchSystem";
import type { StateProgramDispatch } from "../mugen/runtime/StateProgramExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";
import { RuntimeRootCnsExecutionWorld } from "../mugen/runtime/RuntimeRootCnsExecutionSystem";

describe("RuntimeActiveControllerRunWorld", () => {
  it("bridges owner-backed active-controller scan into runtime and state dispatch", () => {
    const world = new RuntimeActiveControllerRunWorld();
    const owner = actor("owner", "imported", 200, [stateProgram(200, [controller("VelSet"), controller("ChangeState")])]);
    const fighter = actor("p2", "demo", 200, []);
    const opponent = actor("p1", "demo", 0, []);
    fighter.stateOwner = owner;
    const calls: string[] = [];

    const result = world.run({
      actor: fighter,
      opponent,
      tick: 12,
      controllerIgnoresHitPause: () => true,
      triggersPass: (controllerInput, actorInput, opponentInput, stateOwner, tick) => {
        calls.push(`trigger:${controllerInput.type}:${actorInput.id}:${opponentInput.id}:${stateOwner.id}:${tick}`);
        return true;
      },
      dispatchController: (controllerInput) => dispatch(controllerInput, calls),
      stateHooks: stateHooks(calls),
      sideEffectHooks: sideEffectHooks(calls),
      hooks: routeHooks(calls),
    });

    expect(result).toMatchObject({
      scanned: true,
      owner,
      visitedControllers: 2,
      executedControllers: 2,
      stopped: true,
    });
    expect(fighter.runtime.stateNo).toBe(310);
    expect(calls).toEqual([
      "trigger:VelSet:p2:p1:owner:12",
      "dispatch:VelSet",
      "runtime:VelSet:p2:p1:owner:12",
      "trigger:ChangeState:p2:p1:owner:12",
      "dispatch:ChangeState",
      "resolve-number:310:p2:p1:owner:12",
      "resolve-number:undefined:p2:p1:owner:12",
      "resolve-boolean:undefined:p2:p1:owner:12",
      "record:p2:ChangeState",
      "enter:p2:310",
    ]);
  });

  it("keeps hitpause-only active runs filtered before dispatch", () => {
    const world = new RuntimeActiveControllerRunWorld();
    const fighter = actor("p1", "imported", 200, [
      stateProgram(200, [controller("VelSet"), controller("PlaySnd", true), controller("ChangeState", true)]),
    ]);
    const opponent = actor("p2", "imported", 0, []);
    const calls: string[] = [];

    const result = world.run({
      actor: fighter,
      opponent,
      tick: 5,
      onlyIgnoreHitPause: true,
      controllerIgnoresHitPause: (controllerInput) => Boolean(controllerInput.params.ignorehitpause),
      triggersPass: (controllerInput) => {
        calls.push(`trigger:${controllerInput.type}`);
        return true;
      },
      dispatchController: (controllerInput) => dispatch(controllerInput, calls),
      stateHooks: stateHooks(calls),
      sideEffectHooks: sideEffectHooks(calls),
      hooks: routeHooks(calls),
    });

    expect(result).toMatchObject({
      scanned: true,
      visitedControllers: 2,
      executedControllers: 2,
      stopped: true,
    });
    expect(calls).toEqual([
      "trigger:PlaySnd",
      "dispatch:PlaySnd",
      "sound:PlaySnd:p1:p2:p1:5",
      "trigger:ChangeState",
      "dispatch:ChangeState",
      "resolve-number:310:p1:p2:p1:5",
      "resolve-number:undefined:p1:p2:p1:5",
      "resolve-boolean:undefined:p1:p2:p1:5",
      "record:p1:ChangeState",
      "enter:p1:310",
    ]);
  });

  it("reports standby-blocked runtime and side-effect controllers without invoking their hooks", () => {
    const world = new RuntimeRootCnsExecutionWorld();
    const fighter = actor("p3", "imported", 200, [
      stateProgram(200, [controller("LifeAdd"), controller("VarSet"), controller("PlaySnd"), controller("ChangeState")]),
    ]);
    const opponent = actor("p2", "imported", 0, []);
    const calls: string[] = [];

    const result = world.execute({
      actor: fighter,
      opponent,
      tick: 8,
      controllerIgnoresHitPause: () => false,
      triggersPass: (controllerInput) => {
        calls.push(`trigger:${controllerInput.type}`);
        return true;
      },
      dispatchController: (controllerInput) => dispatch(controllerInput, calls),
      stateHooks: stateHooks(calls),
      sideEffectHooks: sideEffectHooks(calls),
      hooks: routeHooks(calls),
      onBlocked: (controllerInput, route) => calls.push(`blocked:${controllerInput.type}:${route}`),
    }, "standby");

    expect(result).toMatchObject({
      scanned: true,
      visitedControllers: 4,
      executedControllers: 2,
      blockedControllers: 2,
      stopped: true,
    });
    expect(calls).toEqual([
      "trigger:LifeAdd",
      "dispatch:LifeAdd",
      "blocked:LifeAdd:runtime-controller",
      "trigger:VarSet",
      "dispatch:VarSet",
      "runtime:VarSet:p3:p2:p3:8",
      "trigger:PlaySnd",
      "dispatch:PlaySnd",
      "blocked:PlaySnd:sound",
      "trigger:ChangeState",
      "dispatch:ChangeState",
      "resolve-number:310:p3:p2:p3:8",
      "resolve-number:undefined:p3:p2:p3:8",
      "resolve-boolean:undefined:p3:p2:p3:8",
      "record:p3:ChangeState",
      "enter:p3:310",
    ]);
  });
});

interface RunActor extends RuntimeActiveControllerRunActor<RunActor> {
  id: string;
  definition: { name: string; source: string };
  runtime: CharacterRuntimeState;
  runtimeProgram?: { states: StateProgramIr[] };
  stateOwner?: RunActor;
}

function actor(id: string, source: string, stateNo: number, states: StateProgramIr[]): RunActor {
  return {
    id,
    definition: { name: id, source },
    runtime: runtimeState({ stateNo }),
    runtimeProgram: { states },
  };
}

function stateHooks(calls: string[]): RuntimeActiveStateDispatchHooks<RunActor> {
  return {
    resolveNumber: ({ value, expression, actor, opponent, owner, tick }) => {
      calls.push(`resolve-number:${value ?? expression}:${actor.id}:${opponent.id}:${owner.id}:${tick}`);
      return value;
    },
    resolveBoolean: ({ value, expression, actor, opponent, owner, tick }) => {
      calls.push(`resolve-boolean:${value ?? expression}:${actor.id}:${opponent.id}:${owner.id}:${tick}`);
      return value;
    },
    recordController: (actorInput, controllerInput) => calls.push(`record:${actorInput.id}:${controllerInput.type}`),
    enterState: (actorInput, stateId) => {
      actorInput.runtime.stateNo = stateId;
      calls.push(`enter:${actorInput.id}:${stateId}`);
    },
    applyControl: (actorInput, ctrl) => {
      actorInput.runtime.ctrl = ctrl;
      calls.push(`ctrl:${actorInput.id}:${ctrl}`);
    },
    changeAction: (actorInput, actionId) => {
      actorInput.runtime.animNo = actionId;
      calls.push(`anim:${actorInput.id}:${actionId}`);
      return true;
    },
  };
}

function sideEffectHooks(calls: string[]): RuntimeActiveSideEffectDispatchHooks<RunActor> {
  return {
    sound: ({ controller, actor, opponent, owner, tick }) =>
      calls.push(`sound:${controller.type}:${actor.id}:${opponent.id}:${owner.id}:${tick}`),
  };
}

function routeHooks(calls: string[]): RuntimeActiveControllerDispatchHooks<RunActor> {
  return {
    runtimeController: ({ dispatch: routeDispatch, actor, opponent, owner, tick }) =>
      calls.push(`runtime:${routeDispatch.controller.type}:${actor.id}:${opponent.id}:${owner.id}:${tick}`),
  };
}

function dispatch(controllerInput: ControllerIr, calls: string[]): StateProgramDispatch {
  calls.push(`dispatch:${controllerInput.type}`);
  if (controllerInput.normalizedType === "changestate") {
    return {
      kind: "change-state",
      controller: controllerInput,
      stateId: 310,
      clearStateOwner: true,
    };
  }
  if (controllerInput.normalizedType === "playsnd") {
    return {
      kind: "side-effect",
      controller: controllerInput,
      effect: "sound",
    };
  }
  return {
    kind: "runtime-controller",
    controller: controllerInput,
  };
}

function stateProgram(id: number, controllers: ControllerIr[]): StateProgramIr {
  return {
    id,
    source: {
      id,
      rawParams: {},
      controllers: controllers.map((controllerInput) => controllerInput.source),
      line: 1,
    },
    supportLevel: "partial",
    compiledControllers: controllers.length,
    controllers,
  };
}

function controller(type: string, ignoreHitPause = false): ControllerIr {
  return {
    source: controllerSource(type, ignoreHitPause),
    stateId: 200,
    type,
    normalizedType: type.toLowerCase(),
    supportLevel: "partial",
    triggers: [],
    params: ignoreHitPause ? { ignorehitpause: "1" } : {},
    line: 1,
    unsupportedFeatures: [],
  };
}

function controllerSource(type: string, ignoreHitPause: boolean): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params: ignoreHitPause ? { ignorehitpause: "1" } : {},
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
    life: 1000,
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
