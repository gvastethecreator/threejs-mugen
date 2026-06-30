import { describe, expect, it } from "vitest";
import { compileRuntimeProgram } from "../mugen/compiler/StateControllerCompiler";
import { parseCns } from "../mugen/parsers/CnsParser";
import {
  RuntimeStateEntrySetupWorld,
  type RuntimeStateEntrySetupActor,
} from "../mugen/runtime/RuntimeStateEntrySetupSystem";
import { executeControllerIr } from "../mugen/runtime/StateControllerExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeStateEntrySetupSystem", () => {
  it("applies imported State -1 setup controllers while leaving ChangeState routing to the input world", () => {
    const actor = actorWithProgram("imported", `
[State -1, Attack Route]
type = ChangeState
trigger1 = 1
value = 200

[State -1, Prep Var]
type = VarSet
trigger1 = 1
v = 3
value = 9

[State -1, Prep Power]
type = PowerAdd
trigger1 = 1
value = 50
`);
    const executed: string[] = [];
    const ticks: number[] = [];

    const result = new RuntimeStateEntrySetupWorld().apply({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 12,
      triggersPass: () => true,
      executeController: (controller, target, tick) => {
        executed.push(controller.type);
        ticks.push(tick);
        return executeControllerIr(controller, target.runtime, () => undefined);
      },
    });

    expect(result).toEqual({ applied: 2, scanned: 3, skipped: false });
    expect(executed).toEqual(["VarSet", "PowerAdd"]);
    expect(ticks).toEqual([12, 12]);
    expect(actor.runtime.stateNo).toBe(0);
    expect(actor.runtime.vars[3]).toBe(9);
    expect(actor.runtime.power).toBe(50);
  });

  it("skips non-imported actors before evaluating State -1 setup controllers", () => {
    const actor = actorWithProgram("demo", `
[State -1, Prep Var]
type = VarSet
trigger1 = 1
v = 1
value = 7
`);
    let executed = false;

    const result = new RuntimeStateEntrySetupWorld().apply({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 1,
      triggersPass: () => true,
      executeController: (controller, target) => {
        executed = true;
        return executeControllerIr(controller, target.runtime, () => undefined);
      },
    });

    expect(result).toEqual({ applied: 0, scanned: 1, skipped: true });
    expect(executed).toBe(false);
    expect(actor.runtime.vars[1]).toBeUndefined();
  });

  it("respects trigger failures and ignores non-setup runtime controllers", () => {
    const actor = actorWithProgram("imported", `
[State -1, Movement]
type = VelAdd
trigger1 = 1
x = 5

[State -1, Failed Var]
type = VarSet
trigger1 = 0
v = 2
value = 11
`);
    const seenTriggers: string[] = [];
    const executed: string[] = [];

    const result = new RuntimeStateEntrySetupWorld().apply({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 4,
      triggersPass: (controller) => {
        seenTriggers.push(controller.type);
        return controller.normalizedType !== "varset";
      },
      executeController: (controller, target) => {
        executed.push(controller.type);
        return executeControllerIr(controller, target.runtime, () => undefined);
      },
    });

    expect(result).toEqual({ applied: 0, scanned: 2, skipped: false });
    expect(seenTriggers).toEqual(["VelAdd", "VarSet"]);
    expect(executed).toEqual([]);
    expect(actor.runtime.vel.x).toBe(0);
    expect(actor.runtime.vars[2]).toBeUndefined();
  });
});

function actorWithProgram(source: string, cns: string): RuntimeStateEntrySetupActor {
  const parsed = cns.trim() ? parseCns(cns) : { states: [], controllers: [] };
  return {
    definition: { source },
    runtime: runtime(),
    runtimeProgram: compileRuntimeProgram({
      commands: [],
      states: parsed.states,
      stateEntryControllers: parsed.controllers,
      animations: new Map(),
    }),
  };
}

function runtime(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
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
    sysvars: [],
    ...overrides,
  };
}
