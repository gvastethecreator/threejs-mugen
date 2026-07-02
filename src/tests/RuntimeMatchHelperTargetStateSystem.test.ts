import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { createRuntimeHelper, type RuntimeHelper } from "../mugen/runtime/HelperSystem";
import {
  RuntimeMatchHelperTargetStateWorld,
  type RuntimeMatchHelperTargetStateActor,
} from "../mugen/runtime/RuntimeMatchHelperTargetStateSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeMatchHelperTargetStateWorld", () => {
  it("resolves helper target-state entries through the supplied match actor roster", () => {
    const owner = actor("p1");
    const target = actor("p2");
    const staleTargetActor = actor("p2", { stateNo: 12 });
    const calls: string[] = [];

    const result = new RuntimeMatchHelperTargetStateWorld().enter({
      owner,
      helper: helper("p1"),
      targetActor: staleTargetActor,
      stateId: 888,
      actors: [owner, target],
      canEnterState: (candidate, stateId, stateOwner) => {
        calls.push(`can:${candidate.id}:${stateId}:${stateOwner.id}`);
        return true;
      },
      enterState: (candidate, stateId, options) => {
        calls.push(`enter:${candidate.id}:${stateId}:${options.stateOwner.id}`);
        candidate.runtime.stateNo = stateId;
      },
    });

    expect(result).toMatchObject({ entered: true, target, stateId: 888 });
    expect(target.runtime.stateNo).toBe(888);
    expect(staleTargetActor.runtime.stateNo).toBe(12);
    expect(calls).toEqual(["can:p2:888:p1", "enter:p2:888:p1"]);
  });

  it("fails closed when the target actor is not in the match roster", () => {
    const owner = actor("p1");
    const entered: string[] = [];

    const result = new RuntimeMatchHelperTargetStateWorld().enter({
      owner,
      helper: helper("p1"),
      targetActor: actor("missing"),
      stateId: 888,
      actors: [owner, actor("p2")],
      canEnterState: () => true,
      enterState: () => entered.push("entered"),
    });

    expect(result).toEqual({ entered: false, reason: "missing-target" });
    expect(entered).toEqual([]);
  });

  it("preserves helper owner validation before resolving targets", () => {
    const owner = actor("p1");
    const calls: string[] = [];

    const result = new RuntimeMatchHelperTargetStateWorld().enter({
      owner,
      helper: helper("p2"),
      targetActor: actor("p2"),
      stateId: 888,
      actors: [owner, actor("p2")],
      canEnterState: () => {
        calls.push("can");
        return true;
      },
      enterState: () => calls.push("enter"),
    });

    expect(result).toEqual({ entered: false, reason: "owner-mismatch" });
    expect(calls).toEqual([]);
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

function actor(id: string, runtimeOverrides: Partial<CharacterRuntimeState> = {}): RuntimeMatchHelperTargetStateActor {
  return {
    id,
    runtime: runtimeState(runtimeOverrides),
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
