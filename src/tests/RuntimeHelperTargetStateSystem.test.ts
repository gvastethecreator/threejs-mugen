import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { createRuntimeHelper, type RuntimeHelper } from "../mugen/runtime/HelperSystem";
import { RuntimeHelperTargetStateWorld, type RuntimeHelperTargetStateBindingOwner } from "../mugen/runtime/RuntimeHelperTargetStateSystem";
import type { RuntimeTargetWorldActor } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHelperTargetStateWorld", () => {
  it("routes helper-owned TargetState into owner-backed target state data", () => {
    const world = new RuntimeHelperTargetStateWorld();
    const owner = { id: "p1" };
    const target = actor("p2");
    const calls: string[] = [];

    const result = world.enter({
      owner,
      helper: helper("p1"),
      targetActor: { ...target, id: "p2" },
      stateId: 888,
      hooks: {
        resolveTarget: (candidate) => {
          calls.push(`resolve:${candidate.id}`);
          return candidate.id === target.id ? target : undefined;
        },
        canEnterState: (candidate, stateId, stateOwner) => {
          calls.push(`can:${candidate.id}:${stateId}:${stateOwner.id}`);
          return true;
        },
        enterState: (candidate, stateId, options) => {
          calls.push(`enter:${candidate.id}:${stateId}:${options.stateOwner.id}`);
          candidate.runtime.stateNo = stateId;
        },
      },
    });

    expect(result).toMatchObject({ entered: true, target, stateId: 888 });
    expect(target.runtime.stateNo).toBe(888);
    expect(calls).toEqual(["resolve:p2", "can:p2:888:p1", "enter:p2:888:p1"]);
  });

  it("skips helpers that do not belong to the owner", () => {
    const result = new RuntimeHelperTargetStateWorld().enter({
      owner: { id: "p1" },
      helper: helper("p2"),
      targetActor: actor("p2"),
      stateId: 888,
      hooks: {
        resolveTarget: () => {
          throw new Error("target should not resolve on owner mismatch");
        },
        canEnterState: () => true,
        enterState: () => {},
      },
    });

    expect(result).toEqual({ entered: false, reason: "owner-mismatch" });
  });

  it("fails closed when the target is missing or state is unavailable", () => {
    const world = new RuntimeHelperTargetStateWorld();
    const owner = { id: "p1" };
    const target = actor("p2");
    const entered: string[] = [];

    const missing = world.enter({
      owner,
      helper: helper("p1"),
      targetActor: actor("missing"),
      stateId: 888,
      hooks: {
        resolveTarget: () => undefined,
        canEnterState: () => true,
        enterState: () => entered.push("missing"),
      },
    });

    const unavailable = world.enter({
      owner,
      helper: helper("p1"),
      targetActor: target,
      stateId: 889,
      hooks: {
        resolveTarget: () => target,
        canEnterState: () => false,
        enterState: () => entered.push("unavailable"),
      },
    });

    expect(missing).toEqual({ entered: false, reason: "missing-target" });
    expect(unavailable).toEqual({ entered: false, reason: "unavailable-state" });
    expect(entered).toEqual([]);
    expect(target.runtime.stateNo).toBe(0);
  });

  it("attaches owner-specific helper target-state handlers", () => {
    const world = new RuntimeHelperTargetStateWorld();
    const calls: string[] = [];
    const p1: RuntimeHelperTargetStateBindingOwner = { id: "p1", enterHelperTargetState: () => { calls.push("stale-p1"); } };
    const p2: RuntimeHelperTargetStateBindingOwner = { id: "p2", enterHelperTargetState: () => { calls.push("stale-p2"); } };

    world.attachOwnerHandlers([p1, p2], (owner, helperActor, target, stateId) => {
      calls.push(`${owner.id}:${helperActor.ownerId}:${target.id}:${stateId}`);
    });

    p1.enterHelperTargetState?.(helper("p1"), actor("p2"), 888);
    p2.enterHelperTargetState?.(helper("p2"), actor("p1"), 889);

    expect(calls).toEqual(["p1:p1:p2:888", "p2:p2:p1:889"]);
  });
});

function helper(ownerId: string): RuntimeHelper {
  return createRuntimeHelper({
    serialId: `${ownerId}-helper-0`,
    controller: controller("Helper", { id: "42", name: '"Targeter"' }),
    ownerId,
    spriteOwnerId: ownerId,
    spriteOwnerDefinitionId: "test",
    spriteOwnerLabel: "Test",
    action: action(900),
    stateNo: 6000,
    animNo: 900,
    pos: { x: 0, y: 0 },
    fallbackFacing: 1,
  });
}

function actor(id: string): RuntimeTargetWorldActor {
  return {
    id,
    runtime: runtimeState(),
    targets: [],
    targetBindings: [],
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
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

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function action(id: number): MugenAnimationAction {
  return {
    id,
    loopStart: 0,
    rawLines: [],
    frames: [
      {
        spriteGroup: id,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 4,
        clsn1: [],
        clsn2: [],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}
