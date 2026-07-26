import { describe, expect, it } from "vitest";
import {
  applyMatchInputDeadzone,
  buildMatchInputPolicySnapshot,
  buildMatchInputSeatSnapshot,
  canonicalizeMatchInputPolicySnapshot,
  matchInputPolicySnapshotsEqual,
  resolveMatchInputActions,
} from "../mugen/runtime/MatchInputPolicySnapshot";

describe("MatchInputPolicySnapshot", () => {
  it("applies deadzone to axes and maps remapped buttons to logical actions", () => {
    expect(applyMatchInputDeadzone(0.1, 0.2)).toBe(0);
    expect(applyMatchInputDeadzone(0.6, 0.2)).toBeCloseTo(0.5, 5);
    expect(applyMatchInputDeadzone(-0.6, 0.2)).toBeCloseTo(-0.5, 5);

    const actions = resolveMatchInputActions({
      deadzone: 0.25,
      physical: {
        buttons: { button0: true, KeyW: true },
        axes: { axis0: -0.9, axis1: 0.1 },
      },
    });
    expect(actions.a).toBe(true);
    expect(actions.up).toBe(true);
    expect(actions.left).toBe(true);
    expect(actions.down).toBe(false);
  });

  it("clears actions when a seat is disconnected", () => {
    const seat = buildMatchInputSeatSnapshot({
      seat: 1,
      device: "gamepad",
      connected: false,
      tick: 12,
      physical: {
        buttons: { button0: true, button1: true },
        axes: { axis0: 1 },
      },
    });
    expect(seat.connected).toBe(false);
    expect(Object.values(seat.actions).every((value) => value === false)).toBe(true);
  });

  it("builds a two-seat snapshot for keyboard + gamepad and stays deterministic", () => {
    const first = buildMatchInputPolicySnapshot({
      tick: 40,
      p1: {
        device: "keyboard",
        facing: 1,
        socdMode: 4,
        physical: { buttons: { KeyD: true, KeyJ: true }, axes: {} },
      },
      p2: {
        device: "gamepad",
        facing: -1,
        deadzone: 0.3,
        socdMode: 0,
        physical: { buttons: { button1: true }, axes: { axis0: 0.2 } },
      },
    });
    const second = buildMatchInputPolicySnapshot({
      tick: 40,
      p1: {
        device: "keyboard",
        facing: 1,
        socdMode: 4,
        physical: { buttons: { KeyD: true, KeyJ: true }, axes: {} },
      },
      p2: {
        device: "gamepad",
        facing: -1,
        deadzone: 0.3,
        socdMode: 0,
        physical: { buttons: { button1: true }, axes: { axis0: 0.2 } },
      },
    });

    expect(first.schema).toBe("MatchInputPolicySnapshot/v1");
    expect(first.seats[0].actions.right).toBe(true);
    expect(first.seats[0].actions.a).toBe(true);
    expect(first.seats[1].actions.b).toBe(true);
    // axis0=0.2 is inside deadzone 0.3 → no left/right
    expect(first.seats[1].actions.right).toBe(false);
    expect(first.seats[1].facing).toBe(-1);
    expect(matchInputPolicySnapshotsEqual(first, second)).toBe(true);
    expect(canonicalizeMatchInputPolicySnapshot(first)).toContain("\"tick\":40");
  });

  it("supports custom remaps for replay seats", () => {
    const seat = buildMatchInputSeatSnapshot({
      seat: 2,
      device: "replay",
      tick: 3,
      remap: { replay_punch: "a", replay_guard: "b" },
      physical: {
        buttons: { replay_punch: true, replay_guard: true },
        axes: {},
      },
    });
    expect(seat.actions.a).toBe(true);
    expect(seat.actions.b).toBe(true);
    expect(seat.device).toBe("replay");
  });
});
