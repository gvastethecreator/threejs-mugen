import { describe, expect, it } from "vitest";
import { RuntimeMatchResetWorld, type RuntimeMatchResetFighterStart } from "../mugen/runtime/RuntimeMatchResetSystem";

type TestFighter = {
  id: string;
  definition: string;
  start?: RuntimeMatchResetFighterStart;
  stale?: boolean;
  handlerAttached?: boolean;
};

describe("RuntimeMatchResetWorld", () => {
  it("resets match-owned worlds, replaces actor state in place, and reattaches helper handlers", () => {
    const world = new RuntimeMatchResetWorld();
    const calls: string[] = [];
    const p1: TestFighter = { id: "stale", definition: "nova", stale: true };
    const p2: TestFighter = { id: "stale", definition: "mira", stale: true };
    const p3: TestFighter = { id: "stale", definition: "reserve", stale: true };
    const p1Ref = p1;
    const p2Ref = p2;

    const result = world.reset({
      p1,
      p2,
      p1Definition: "nova",
      p2Definition: "mira",
      p1Start: { x: -80, y: 0, facing: 1 },
      p2Start: { x: 80, y: 0, facing: -1 },
      roundTimerFrames: 3600,
      round: { reset: (frames) => calls.push(`round:${frames}`) },
      pauseWorld: { reset: () => calls.push("pause") },
      envColorWorld: { reset: () => calls.push("env-color") },
      effectActorWorld: { reset: () => calls.push("effects") },
      reserveActors: [{
        actor: p3,
        id: "p3",
        definition: "reserve",
        start: { x: -80, y: 0, facing: 1 },
      }],
      createFighter: (id, definition, start) => {
        calls.push(`create:${id}:${definition}:${start.x}:${start.facing}`);
        return { id, definition, start };
      },
      attachHelperHandlers: () => {
        calls.push(`attach:${p1.id}:${p2.id}`);
        p1.handlerAttached = true;
        p2.handlerAttached = true;
      },
      log: (message) => calls.push(`log:${message}`),
    });

    expect(result).toEqual({ tick: 0, frameClock: 0, playing: true });
    expect(p1).toBe(p1Ref);
    expect(p2).toBe(p2Ref);
    expect(p1.stale).toBeUndefined();
    expect(p2.stale).toBeUndefined();
    expect(p3.stale).toBeUndefined();
    expect(p1).toMatchObject({
      id: "p1",
      definition: "nova",
      start: { x: -80, y: 0, facing: 1 },
      handlerAttached: true,
    });
    expect(p2).toMatchObject({
      id: "p2",
      definition: "mira",
      start: { x: 80, y: 0, facing: -1 },
      handlerAttached: true,
    });
    expect(p3).toMatchObject({
      id: "p3",
      definition: "reserve",
      start: { x: -80, y: 0, facing: 1 },
    });
    expect(calls).toEqual([
      "round:3600",
      "pause",
      "env-color",
      "effects",
      "create:p1:nova:-80:1",
      "create:p2:mira:80:-1",
      "create:p3:reserve:-80:1",
      "attach:p1:p2",
      "log:Round reset",
    ]);
  });
});
