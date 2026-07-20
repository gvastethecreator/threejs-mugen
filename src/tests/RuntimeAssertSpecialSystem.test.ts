import { describe, expect, it } from "vitest";
import { compileRuntimeProgram } from "../mugen/compiler/StateControllerCompiler";
import { parseCns } from "../mugen/parsers/CnsParser";
import {
  RuntimeAssertSpecialWorld,
  type RuntimeAssertSpecialActor,
} from "../mugen/runtime/RuntimeAssertSpecialSystem";
import { executeControllerIr } from "../mugen/runtime/StateControllerExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeAssertSpecialSystem", () => {
  it("applies pre-facing AssertSpecial controllers for imported active states", () => {
    const actor = actorWithProgram("imported", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Pre Facing Flags]
type = AssertSpecial
trigger1 = Time = 0
flag = NoAutoTurn
flag2 = Invisible
flag3 = ProjTypeCollision
`);
    const opponent = actorWithProgram("demo", "");
    const world = new RuntimeAssertSpecialWorld();

    const result = world.applyPreFacing({
      actor,
      opponent,
      tick: 7,
      triggersPass: () => true,
      executeController: (controller, target) => executeControllerIr(controller, target.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(actor.runtime.assertSpecial).toMatchObject({
      flags: ["noautoturn", "invisible", "projtypecollision"],
      noAutoTurn: true,
      invisible: true,
      projTypeCollision: true,
    });
    expect(actor.runtime.renderOpacity).toBe(0);
  });

  it("normalizes target resource damage guards", () => {
    const actor = actorWithProgram("imported", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Target Resource Guards]
type = AssertSpecial
trigger1 = 1
flag = NoRedLifeDamage
flag2 = NoGuardPointsDamage
flag3 = NoDizzyPointsDamage
`);

    const result = new RuntimeAssertSpecialWorld().applyPreFacing({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 1,
      triggersPass: () => true,
      executeController: (controller, target) => executeControllerIr(controller, target.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(actor.runtime.assertSpecial).toMatchObject({
      noRedLifeDamage: true,
      noGuardPointsDamage: true,
      noDizzyPointsDamage: true,
    });
  });

  it("normalizes NoFallDefenceUp for Common1 recovery", () => {
    const actor = actorWithProgram("imported", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Fall Defense Opt Out]
type = AssertSpecial
trigger1 = 1
flag = NoFallDefenceUp
`);

    const result = new RuntimeAssertSpecialWorld().applyPreFacing({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 1,
      triggersPass: () => true,
      executeController: (controller, target) => executeControllerIr(controller, target.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(actor.runtime.assertSpecial).toMatchObject({
      flags: ["nofalldefenceup"],
      noFallDefenceUp: true,
    });
  });

  it("normalizes NoFallCount for Common1 fall accounting", () => {
    const actor = actorWithProgram("imported", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Fall Count Opt Out]
type = AssertSpecial
trigger1 = 1
flag = NoFallCount
`);

    const result = new RuntimeAssertSpecialWorld().applyPreFacing({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 1,
      triggersPass: () => true,
      executeController: (controller, target) => executeControllerIr(controller, target.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(actor.runtime.assertSpecial).toMatchObject({
      flags: ["nofallcount"],
      noFallCount: true,
    });
  });

  it("normalizes NoFallHitFlag for falling-target admission", () => {
    const actor = actorWithProgram("imported", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Fall Hit Flag Opt Out]
type = AssertSpecial
trigger1 = 1
flag = NoFallHitFlag
`);

    const result = new RuntimeAssertSpecialWorld().applyPreFacing({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 1,
      triggersPass: () => true,
      executeController: (controller, target) => executeControllerIr(controller, target.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(actor.runtime.assertSpecial).toMatchObject({
      flags: ["nofallhitflag"],
      noFallHitFlag: true,
    });
  });

  it("skips non-imported actors without an imported state owner", () => {
    const actor = actorWithProgram("demo", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Demo Flags]
type = AssertSpecial
trigger1 = 1
flag = NoWalk
`);
    const world = new RuntimeAssertSpecialWorld();
    let executed = false;

    const result = world.applyPreFacing({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 1,
      triggersPass: () => true,
      executeController: (controller, target) => {
        executed = true;
        return executeControllerIr(controller, target.runtime, () => undefined);
      },
    });

    expect(result).toEqual({ applied: 0, skipped: true });
    expect(executed).toBe(false);
    expect(actor.runtime.assertSpecial).toBeUndefined();
  });

  it("applies owner-backed imported custom-state AssertSpecial controllers", () => {
    const owner = actorWithProgram("imported", `
[Statedef 888]
type = S
movetype = H
physics = N
anim = 888

[State 888, Owner Flags]
type = AssertSpecial
trigger1 = 1
flag = NoWalk
`);
    const target = actorWithProgram("demo", "");
    target.runtime.stateNo = 888;
    target.stateOwner = owner;

    const result = new RuntimeAssertSpecialWorld().applyPreFacing({
      actor: target,
      opponent: owner,
      tick: 3,
      triggersPass: () => true,
      executeController: (controller, actor) => executeControllerIr(controller, actor.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(target.runtime.assertSpecial).toMatchObject({
      flags: ["nowalk"],
      noWalk: true,
    });
  });

  it("normalizes official round-flow telemetry flags", () => {
    const actor = actorWithProgram("imported", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Round Flow Flags]
type = AssertSpecial
trigger1 = 1
flag = Intro
flag2 = NoKOSlow
`);

    const result = new RuntimeAssertSpecialWorld().applyPreFacing({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 2,
      triggersPass: () => true,
      executeController: (controller, target) => executeControllerIr(controller, target.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(actor.runtime.assertSpecial).toMatchObject({
      globalFlags: ["intro", "nokoslow"],
      intro: true,
      noKoSlow: true,
    });
  });

  it("filters non-AssertSpecial controllers and respects trigger failure", () => {
    const actor = actorWithProgram("imported", `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Ctrl]
type = CtrlSet
trigger1 = 1
value = 0

[State 0, Flags]
type = AssertSpecial
trigger1 = Time = 4
flag = NoAutoTurn
`);
    const seenControllers: string[] = [];

    const result = new RuntimeAssertSpecialWorld().applyPreFacing({
      actor,
      opponent: actorWithProgram("demo", ""),
      tick: 4,
      triggersPass: (controller) => {
        seenControllers.push(controller.type);
        return false;
      },
      executeController: (controller, target) => executeControllerIr(controller, target.runtime, () => undefined),
    });

    expect(result).toEqual({ applied: 0, skipped: false });
    expect(seenControllers).toEqual(["AssertSpecial"]);
    expect(actor.runtime.assertSpecial).toBeUndefined();
  });
});

function actorWithProgram(source: string, cns: string): RuntimeAssertSpecialActor {
  const parsed = cns.trim() ? parseCns(cns) : { states: [], controllers: [] };
  return {
    definition: { source },
    hitPause: 0,
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
    ...overrides,
  };
}
