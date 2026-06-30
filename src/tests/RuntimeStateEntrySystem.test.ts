import { describe, expect, it, vi } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateDef } from "../mugen/model/MugenState";
import {
  RuntimeStateEntryWorld,
  normalizeRuntimeMoveType,
  normalizeRuntimePhysics,
  normalizeRuntimeStateType,
  type RuntimeStateEntryActor,
} from "../mugen/runtime/RuntimeStateEntrySystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeStateEntrySystem", () => {
  it("owns state entry metadata, action selection, contact reset, and telemetry hooks", () => {
    const world = new RuntimeStateEntryWorld();
    const actor = entryActor({
      states: [
        state(200, {
          type: "A",
          moveType: "A",
          physics: "A",
          anim: 205,
          ctrl: 0,
          velSet: [3, -6],
        }),
      ],
      animations: [205],
      runtime: { stateNo: 0, animNo: 0, ctrl: true, stateType: "S", moveType: "I", physics: "S" },
    });
    actor.firedHitDefs.add("200:12:0");
    actor.currentMove = { actionId: 210 };
    actor.currentMoveLabel = "old";
    actor.moveTick = 9;
    actor.hasHit = true;
    actor.runtime.reversal = { attr: "S, NA", p1StateNo: 210, p2StateNo: 211, hitPause: 0 };
    const recordStateExecution = vi.fn();
    const resetContactState = vi.fn();
    const changeAction = vi.fn(() => true);

    const result = world.enterState(actor, 200, undefined, {}, { recordStateExecution, resetContactState, changeAction });

    expect(result).toMatchObject({ actionId: 205, animationChanged: true });
    expect(actor.runtime).toMatchObject({
      stateNo: 200,
      stateType: "A",
      moveType: "A",
      physics: "A",
      ctrl: false,
      vel: { x: 3, y: -6 },
    });
    expect(actor.stateElapsed).toBe(-1);
    expect(actor.firedHitDefs.size).toBe(0);
    expect(actor.currentMove).toBeUndefined();
    expect(actor.currentMoveLabel).toBeUndefined();
    expect(actor.moveTick).toBe(0);
    expect(actor.hasHit).toBe(false);
    expect(actor.runtime.reversal).toBeUndefined();
    expect(recordStateExecution).toHaveBeenCalledWith(actor, 200, actor);
    expect(resetContactState).toHaveBeenCalledWith(actor);
    expect(changeAction).toHaveBeenCalledWith(actor, 205, "self", actor, undefined);
  });

  it("enters owner-backed custom states with state-owner animation source", () => {
    const world = new RuntimeStateEntryWorld();
    const target = entryActor({ states: [state(0)], animations: [0] });
    const owner = entryActor({ id: "p1", states: [state(888, { anim: 889 })], animations: [889] });
    const changeAction = vi.fn(() => true);

    expect(world.canEnterState(target, 888, owner)).toBe(true);
    world.enterState(target, 888, undefined, { stateOwner: owner }, { changeAction });

    expect(target.stateOwner).toBe(owner);
    expect(target.runtime.customState).toEqual({ ownerId: "p1", stateNo: 888, getP1State: true });
    expect(changeAction).toHaveBeenCalledWith(target, 889, "state-owner", owner, undefined);
  });

  it("keeps previous metadata from current state owner when state number changes", () => {
    const world = new RuntimeStateEntryWorld();
    const owner = entryActor({ states: [state(888, { type: "A", moveType: "H" })], animations: [888] });
    const target = entryActor({
      states: [state(0, { type: "S", moveType: "I" })],
      animations: [0],
      runtime: { stateNo: 888, animNo: 900, stateType: "S", moveType: "I" },
    });
    target.stateOwner = owner;

    world.setStateNo(target, 0, { resetElapsed: true });

    expect(target.runtime).toMatchObject({
      stateNo: 0,
      prevStateNo: 888,
      prevAnimNo: 900,
      prevStateType: "A",
      prevMoveType: "H",
    });
    expect(target.stateElapsed).toBe(-1);
  });

  it("normalizes MUGEN Statedef metadata with fallback values", () => {
    expect(normalizeRuntimeStateType(" c ", "S")).toBe("C");
    expect(normalizeRuntimeMoveType("h", "I")).toBe("H");
    expect(normalizeRuntimePhysics("n", "S")).toBe("N");
    expect(normalizeRuntimeStateType("stand", "A")).toBe("A");
    expect(normalizeRuntimeMoveType("attack", "I")).toBe("I");
    expect(normalizeRuntimePhysics("none", "A")).toBe("A");
  });
});

function entryActor(options: {
  id?: string;
  states?: MugenStateDef[];
  animations?: number[];
  runtime?: Partial<CharacterRuntimeState>;
} = {}): RuntimeStateEntryActor {
  const animationEntries = (options.animations ?? [0]).map((id) => [id, action(id)] as const);
  return {
    id: options.id ?? "actor",
    definition: {
      states: options.states,
      animations: new Map(animationEntries),
    },
    runtime: runtimeState(options.runtime),
    stateElapsed: 0,
    currentMoveLabel: undefined,
    moveTick: 0,
    hasHit: false,
    firedHitDefs: new Set(),
  };
}

function state(id: number, overrides: Partial<MugenStateDef> = {}): MugenStateDef {
  return {
    id,
    line: 0,
    rawParams: {},
    controllers: [],
    ...overrides,
  };
}

function action(id: number): MugenAnimationAction {
  return { id, frames: [], rawLines: [] };
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
