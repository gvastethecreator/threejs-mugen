import { describe, expect, it } from "vitest";
import { RuntimeStateClockWorld } from "../mugen/runtime/RuntimeStateClockSystem";

describe("RuntimeStateClockSystem", () => {
  it("advances state elapsed time in place", () => {
    const world = new RuntimeStateClockWorld();
    const clock = { stateElapsed: -1 };

    expect(world.advance(clock)).toBe(0);
    expect(clock.stateElapsed).toBe(0);
    expect(world.advance(clock)).toBe(1);
    expect(clock.stateElapsed).toBe(1);
  });

  it("resets elapsed time only for changed transitions that request reset", () => {
    const world = new RuntimeStateClockWorld();
    const clock = { stateElapsed: 8 };

    expect(world.resetForTransition(clock, { changed: true }, { resetElapsed: true })).toBe(true);
    expect(clock.stateElapsed).toBe(-1);
  });

  it("leaves elapsed time untouched for unchanged or non-reset transitions", () => {
    const world = new RuntimeStateClockWorld();
    const clock = { stateElapsed: 8 };

    expect(world.resetForTransition(clock, { changed: false }, { resetElapsed: true })).toBe(false);
    expect(clock.stateElapsed).toBe(8);
    expect(world.resetForTransition(clock, { changed: true })).toBe(false);
    expect(clock.stateElapsed).toBe(8);
  });
});
