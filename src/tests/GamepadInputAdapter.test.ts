import { describe, expect, it } from "vitest";
import {
  actionsToMugenState,
  createFakeGamepad,
  GamepadInputAdapter,
  physicalFromGamepad,
} from "../game/input/GamepadInputAdapter";
import { matchInputPolicySnapshotsEqual } from "../mugen/runtime/MatchInputPolicySnapshot";

describe("GamepadInputAdapter", () => {
  it("polls two pads into policy seats with deadzone and button remap", () => {
    const pads = [
      createFakeGamepad({
        index: 0,
        buttons: [true, false, false, false, false, false, false, false, false, true],
        axes: [0.05, -0.9, 0, 0], // left stick mostly up; x inside deadzone
      }),
      createFakeGamepad({
        index: 1,
        buttons: [false, true, false, false],
        axes: [0.8, 0, 0, 0],
      }),
      null,
    ];
    const adapter = new GamepadInputAdapter({
      getGamepads: () => pads,
      deadzone: 0.2,
    });
    const policy = adapter.poll(12);
    expect(policy.tick).toBe(12);
    expect(policy.seats[0]?.connected).toBe(true);
    expect(policy.seats[1]?.connected).toBe(true);
    expect(policy.seats[0]?.actions.up).toBe(true);
    expect(policy.seats[0]?.actions.left).toBe(false); // deadzoned axis0
    expect(policy.seats[0]?.actions.a).toBe(true); // button0
    expect(policy.seats[0]?.actions.start).toBe(true); // button9
    expect(policy.seats[1]?.actions.right).toBe(true);
    expect(policy.seats[1]?.actions.b).toBe(true);
    expect(adapter.getState(1).has("U")).toBe(true);
    expect(adapter.getState(1).has("a")).toBe(true);
    expect(adapter.getState(2).has("F")).toBe(true);
    expect(adapter.getState(2).has("b")).toBe(true);
  });

  it("treats no-pad as disconnected empty state", () => {
    const adapter = new GamepadInputAdapter({ getGamepads: () => [] });
    const policy = adapter.poll(1);
    expect(policy.seats[0]?.connected).toBe(false);
    expect(policy.seats[1]?.connected).toBe(false);
    expect(adapter.getState(1).size).toBe(0);
  });

  it("maps d-pad buttons when sticks are idle", () => {
    const buttons = Array.from({ length: 16 }, () => false);
    buttons[12] = true; // up
    buttons[15] = true; // right
    const pad = createFakeGamepad({ buttons, axes: [0, 0, 0, 0] });
    const physical = physicalFromGamepad(pad, 0.2);
    expect(physical.axes.axis1).toBe(-1);
    expect(physical.axes.axis0).toBe(1);
    const adapter = new GamepadInputAdapter({
      getGamepads: () => [pad],
      deadzone: 0.2,
    });
    const policy = adapter.poll(3);
    expect(policy.seats[0]?.actions.up).toBe(true);
    expect(policy.seats[0]?.actions.right).toBe(true);
    const state = adapter.getState(1);
    expect(state.has("U")).toBe(true);
    expect(state.has("F")).toBe(true);
    expect(state.has("UF")).toBe(true);
  });

  it("produces stable replay policy for the same pad readings", () => {
    const pads = [
      createFakeGamepad({
        buttons: [true, false, true],
        axes: [0.5, -0.5, 0, 0],
      }),
    ];
    const adapter = new GamepadInputAdapter({ getGamepads: () => pads, deadzone: 0.15 });
    const first = adapter.poll(9);
    const second = adapter.poll(9);
    expect(matchInputPolicySnapshotsEqual(first, second)).toBe(true);
  });

  it("converts actions to Mugen intents with diagonals", () => {
    const state = actionsToMugenState({
      up: true,
      down: false,
      left: false,
      right: true,
      a: true,
      b: false,
      c: false,
      x: false,
      y: false,
      z: false,
      start: false,
      select: false,
    });
    expect([...state].sort()).toEqual(["F", "U", "UF", "a"].sort());
  });

  it("supports custom seat remap and disconnect mid-poll", () => {
    const pads: Array<Gamepad | null> = [
      createFakeGamepad({ buttons: [true], axes: [0, 0, 0, 0] }),
      createFakeGamepad({ connected: false, buttons: [true], axes: [1, 0, 0, 0] }),
    ];
    const adapter = new GamepadInputAdapter({
      getGamepads: () => pads,
      remap: { button0: "x" },
    });
    let policy = adapter.poll(1);
    expect(policy.seats[0]?.actions.x).toBe(true);
    expect(policy.seats[1]?.connected).toBe(false);
    pads[0] = null;
    policy = adapter.poll(2);
    expect(policy.seats[0]?.connected).toBe(false);
    expect(adapter.getState(1).size).toBe(0);
  });

  it("keeps a logical seat when a known device reconnects at a new browser index", () => {
    let pads: Array<Gamepad | null> = [createFakeGamepad({ index: 0, id: "Stable Pad", buttons: [true] })];
    const adapter = new GamepadInputAdapter({ getGamepads: () => pads });

    adapter.poll(1);
    expect(adapter.getDiagnostics().seats[0]?.index).toBe(0);

    pads = Array.from({ length: 5 }, () => null);
    pads[4] = createFakeGamepad({ index: 4, id: "Stable Pad", buttons: [false] });
    adapter.poll(2);

    expect(adapter.getDiagnostics().seats[0]).toMatchObject({
      connected: true,
      index: 4,
      id: "Stable Pad",
      mapping: "standard",
    });
    expect(adapter.getDiagnostics().seats[1]?.connected).toBe(false);
  });

  it("exposes seat diagnostics for mapping, index, and active actions", () => {
    const pads = [
      createFakeGamepad({ index: 4, id: "Arcade Pad", buttons: [true] }),
      createFakeGamepad({ index: 7, id: "Legacy Pad", buttons: [false], mapping: "" }),
    ];
    const adapter = new GamepadInputAdapter({ getGamepads: () => pads });

    adapter.poll(18);

    expect(adapter.getDiagnostics()).toEqual({
      tick: 18,
      connectedCount: 2,
      seats: [
        {
          seat: 1,
          connected: true,
          index: 4,
          id: "Arcade Pad",
          mapping: "standard",
          actions: ["a"],
        },
        {
          seat: 2,
          connected: true,
          index: 7,
          id: "Legacy Pad",
          mapping: "non-standard",
          actions: [],
        },
      ],
    });
  });

  it("reports a disconnected seat after an unplug without stale actions", () => {
    const pads: Array<Gamepad | null> = [createFakeGamepad({ buttons: [true] }), null];
    const adapter = new GamepadInputAdapter({ getGamepads: () => pads });

    adapter.poll(4);
    pads[0] = null;
    adapter.poll(5);

    expect(adapter.getDiagnostics().seats[0]).toEqual({
      seat: 1,
      connected: false,
      index: null,
      id: null,
      mapping: "disconnected",
      actions: [],
    });
  });

  it("records browser connect and disconnect events and removes listeners", () => {
    const target = new EventTarget();
    const pad = createFakeGamepad({ index: 3, id: "Event Pad", mapping: "standard" });
    const adapter = new GamepadInputAdapter({ getGamepads: () => [pad] });
    adapter.start(target);

    const connected = new Event("gamepadconnected");
    Object.defineProperty(connected, "gamepad", { value: pad });
    target.dispatchEvent(connected);

    const disconnected = new Event("gamepaddisconnected");
    Object.defineProperty(disconnected, "gamepad", { value: pad });
    target.dispatchEvent(disconnected);
    adapter.stop();
    target.dispatchEvent(connected);

    expect(adapter.getDeviceEvents()).toEqual([
      { type: "connected", index: 3, id: "Event Pad", mapping: "standard", tick: 0 },
      { type: "disconnected", index: 3, id: "Event Pad", mapping: "standard", tick: 0 },
    ]);
  });
});
