import { describe, expect, it } from "vitest";
import type { ControllerIr, StateProgramIr } from "../mugen/compiler/RuntimeIr";
import { RuntimeActiveControllerScanWorld } from "../mugen/runtime/RuntimeActiveControllerScanSystem";

describe("RuntimeActiveControllerScanWorld", () => {
  it("scans imported active-state controllers through owner-backed state data", () => {
    const world = new RuntimeActiveControllerScanWorld();
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
      triggersPass: (controller, actorInput, opponentInput, stateOwner, tick) => {
        calls.push(`trigger:${controller.type}:${actorInput.id}:${opponentInput.id}:${stateOwner.id}:${tick}`);
        return true;
      },
      executeController: ({ controller, actor: actorInput, owner: stateOwner }) => {
        calls.push(`execute:${controller.type}:${actorInput.id}:${stateOwner.id}`);
      },
    });

    expect(result).toMatchObject({
      scanned: true,
      owner,
      visitedControllers: 2,
      executedControllers: 2,
      stopped: false,
    });
    expect(calls).toEqual([
      "trigger:VelSet:p2:p1:owner:12",
      "execute:VelSet:p2:owner",
      "trigger:ChangeState:p2:p1:owner:12",
      "execute:ChangeState:p2:owner",
    ]);
  });

  it("filters hitpause controllers and can stop after a state-changing controller", () => {
    const world = new RuntimeActiveControllerScanWorld();
    const fighter = actor("p1", "imported", 200, [
      stateProgram(200, [controller("VelSet"), controller("PlaySnd", { ignoreHitPause: true }), controller("ChangeState", { ignoreHitPause: true })]),
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
      executeController: ({ controller }) => {
        calls.push(`execute:${controller.type}`);
        return controller.type === "ChangeState" ? "stop" : "continue";
      },
    });

    expect(result).toMatchObject({
      scanned: true,
      visitedControllers: 2,
      executedControllers: 2,
      stopped: true,
    });
    expect(calls).toEqual(["trigger:PlaySnd", "execute:PlaySnd", "trigger:ChangeState", "execute:ChangeState"]);
  });

  it("can scan an explicit root-owned global state while the actor borrows another state owner", () => {
    const world = new RuntimeActiveControllerScanWorld();
    const borrowedOwner = actor("borrowed", "imported", 200, [stateProgram(-2, [controller("Borrowed")])]);
    const rootOwner = actor("root", "imported", 200, [stateProgram(-2, [controller("RootGlobal")])]);
    const fighter = actor("p2", "demo", 200, []);
    fighter.stateOwner = borrowedOwner;
    const calls: string[] = [];

    const result = world.run({
      actor: fighter,
      opponent: actor("p1", "demo", 0, []),
      tick: 3,
      stateNo: -2,
      stateOwner: rootOwner,
      controllerIgnoresHitPause: () => true,
      triggersPass: (controllerInput, actorInput, _opponent, owner, tick) => {
        calls.push(`trigger:${controllerInput.type}:${actorInput.id}:${owner.id}:${tick}`);
        return true;
      },
      executeController: ({ controller: controllerInput, owner }) => {
        calls.push(`execute:${controllerInput.type}:${owner.id}`);
      },
    });

    expect(result).toMatchObject({ scanned: true, owner: rootOwner, visitedControllers: 1, executedControllers: 1 });
    expect(calls).toEqual(["trigger:RootGlobal:p2:root:3", "execute:RootGlobal:root"]);
  });

  it("selects literal plus-one separately from numeric State 1", () => {
    const world = new RuntimeActiveControllerScanWorld();
    const owner = actor("owner", "imported", 0, [
      stateProgram(1, [controller("NormalOne")]),
      stateProgram(1, [controller("PlusOne")], "plus-one"),
    ]);
    const calls: string[] = [];

    const result = world.run({
      actor: actor("p1", "imported", 0, []),
      opponent: actor("p2", "demo", 0, []),
      tick: 4,
      stateNo: 1,
      stateSpecial: "plus-one",
      stateOwner: owner,
      controllerIgnoresHitPause: () => true,
      triggersPass: () => true,
      executeController: ({ controller }) => {
        calls.push(controller.type);
      },
    });

    expect(result).toMatchObject({ scanned: true, stateProgram: { id: 1, special: "plus-one" } });
    expect(calls).toEqual(["PlusOne"]);
  });

  it("fails closed for missing states, non-imported actors, and failing triggers", () => {
    const world = new RuntimeActiveControllerScanWorld();
    const opponent = actor("p2", "demo", 0, []);
    const missingState = world.run({
      actor: actor("p1", "imported", 999, [stateProgram(200, [controller("VelSet")])]),
      opponent,
      tick: 0,
      controllerIgnoresHitPause: () => true,
      triggersPass: () => true,
      executeController: () => {
        throw new Error("missing state should not execute");
      },
    });
    const nonImported = world.run({
      actor: actor("p1", "demo", 200, [stateProgram(200, [controller("VelSet")])]),
      opponent,
      tick: 0,
      controllerIgnoresHitPause: () => true,
      triggersPass: () => true,
      executeController: () => {
        throw new Error("non-imported actor should not execute");
      },
    });
    const triggerFail = world.run({
      actor: actor("p1", "imported", 200, [stateProgram(200, [controller("VelSet")])]),
      opponent,
      tick: 0,
      controllerIgnoresHitPause: () => true,
      triggersPass: () => false,
      executeController: () => {
        throw new Error("failed trigger should not execute");
      },
    });

    expect(missingState).toMatchObject({ scanned: false, reason: "missing-state" });
    expect(nonImported).toMatchObject({ scanned: false, reason: "non-imported" });
    expect(triggerFail).toMatchObject({ scanned: true, visitedControllers: 0, executedControllers: 0, stopped: false });
  });
});

type ScanTestActor = {
  id: string;
  definition: { source: string };
  runtime: { stateNo: number };
  runtimeProgram?: { states: StateProgramIr[] };
  stateOwner?: ScanTestActor;
};

function actor(id: string, source: string, stateNo: number, states: StateProgramIr[]): ScanTestActor {
  return {
    id,
    definition: { source },
    runtime: { stateNo },
    runtimeProgram: { states },
  };
}

function stateProgram(id: number, controllers: ControllerIr[], special?: "plus-one"): StateProgramIr {
  return {
    id,
    ...(special === undefined ? {} : { special }),
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

function controller(type: string, options: { ignoreHitPause?: boolean } = {}): ControllerIr {
  return {
    source: {
      stateId: 200,
      type,
      triggers: [],
      params: options.ignoreHitPause ? { ignorehitpause: "1" } : {},
      line: 1,
      rawHeader: `[State 200, ${type}]`,
    },
    stateId: 200,
    type,
    normalizedType: type.toLowerCase(),
    supportLevel: "partial",
    triggers: [],
    params: options.ignoreHitPause ? { ignorehitpause: "1" } : {},
    line: 1,
    unsupportedFeatures: [],
  };
}
