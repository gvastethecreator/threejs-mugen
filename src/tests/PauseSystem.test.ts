import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  canActorMoveDuringPause,
  createMatchPauseFromController,
  RuntimePauseWorld,
  tickMatchPause,
  toMatchPauseSnapshot,
} from "../mugen/runtime/PauseSystem";

describe("PauseSystem", () => {
  it("creates a bounded Pause snapshot from a CNS controller", () => {
    const result = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "6", movetime: "2" }), 18);

    expect(result.powerDelta).toBe(0);
    expect(result.pause).toMatchObject({
      type: "Pause",
      remaining: 6,
      moveTime: 2,
      actorId: "p1",
      darken: false,
      sourceStateNo: 200,
      startedAt: 18,
    });
    expect(toMatchPauseSnapshot(result.pause!)).toEqual({
      type: "Pause",
      remaining: 6,
      moveTime: 2,
      actorId: "p1",
      darken: false,
      sourceStateNo: 200,
    });
  });

  it("creates SuperPause darken telemetry and power delta without mutating the actor", () => {
    const source = actor("p2", 3000);
    const result = createMatchPauseFromController(
      source,
      controller("SuperPause", { time: "7", movetime: "1", darken: "1", poweradd: "100" }),
      44,
    );

    expect(result.powerDelta).toBe(100);
    expect(source.runtime.stateNo).toBe(3000);
    expect(result.pause).toMatchObject({
      type: "SuperPause",
      remaining: 7,
      moveTime: 1,
      actorId: "p2",
      darken: true,
      sourceStateNo: 3000,
      startedAt: 44,
    });
  });

  it("prefers typed pause operations over raw controller params", () => {
    const result = createMatchPauseFromController(
      actor("p1", 400),
      controller("SuperPause", { time: "1", movetime: "1", darken: "1", poweradd: "10" }),
      12,
      {
        kind: "pause",
        controllerType: "superpause",
        time: 9,
        moveTime: 3,
        darken: false,
        powerAdd: 75,
      },
    );

    expect(result.powerDelta).toBe(75);
    expect(result.pause).toMatchObject({
      type: "SuperPause",
      remaining: 9,
      moveTime: 3,
      darken: false,
      sourceStateNo: 400,
    });
  });

  it("ignores zero-length typed pause operations", () => {
    const result = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "10", movetime: "2" }), 0, {
      kind: "pause",
      controllerType: "pause",
      time: 0,
      moveTime: 2,
      darken: false,
      powerAdd: 0,
    });

    expect(result).toEqual({ powerDelta: 0 });
  });

  it("clamps pause duration and movetime to the supported sandbox range", () => {
    const result = createMatchPauseFromController(actor("p1", 1000), controller("Pause", { time: "9999", movetime: "9999" }), 0);

    expect(result.pause).toMatchObject({ remaining: 600, moveTime: 600 });
  });

  it("advances remaining frames and source movetime deterministically", () => {
    const pause = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "2", movetime: "1" }), 0).pause!;

    const next = tickMatchPause(pause);
    expect(next).toMatchObject({ remaining: 1, moveTime: 0 });
    expect(tickMatchPause(next!)).toBeUndefined();
  });

  it("only lets the source actor move while movetime remains", () => {
    const active = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "3", movetime: "1" }), 0).pause!;
    const expiredMoveTime = { ...active, moveTime: 0 };

    expect(canActorMoveDuringPause(active, "p1")).toBe(true);
    expect(canActorMoveDuringPause(active, "p2")).toBe(false);
    expect(canActorMoveDuringPause(expiredMoveTime, "p1")).toBe(false);
    expect(canActorMoveDuringPause(undefined, "p1")).toBe(false);
  });

  it("ignores zero-length pause controllers", () => {
    const result = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "0", movetime: "2" }), 0);

    expect(result).toEqual({ powerDelta: 0 });
  });

  it("wraps current pause state behind RuntimePauseWorld", () => {
    const world = new RuntimePauseWorld();
    const result = world.applyController(actor("p1", 200), controller("SuperPause", { time: "3", movetime: "1", darken: "1", poweradd: "25" }), 8);

    expect(result.powerDelta).toBe(25);
    expect(world.current()).toMatchObject({ type: "SuperPause", remaining: 3, moveTime: 1, startedAt: 8 });
    expect(world.snapshot()).toEqual({
      type: "SuperPause",
      remaining: 3,
      moveTime: 1,
      actorId: "p1",
      darken: true,
      sourceStateNo: 200,
    });
    expect(world.canActorMove("p1")).toBe(true);
    expect(world.canActorMove("p2")).toBe(false);

    world.tick();
    expect(world.snapshot()).toMatchObject({ remaining: 2, moveTime: 0 });
    world.reset();
    expect(world.current()).toBeUndefined();
    expect(world.snapshot()).toBeUndefined();
  });
});

function actor(id: string, stateNo: number) {
  return { id, runtime: { stateNo } };
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
