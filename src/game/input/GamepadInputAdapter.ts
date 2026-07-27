/**
 * GamepadInputAdapter (DA28-10).
 * Polls the Gamepad API (or an injected getGamepads) into MatchInputPolicy seats
 * and Mugen virtual input sets for live match stepping.
 */

import {
  applyMatchInputDeadzone,
  buildMatchInputPolicySnapshot,
  buildMatchInputSeatSnapshot,
  resolveMatchInputActions,
  type MatchInputAction,
  type MatchInputPhysicalState,
  type MatchInputPolicySnapshot,
  type MatchInputRemapTable,
  type MatchInputSeatId,
  type MatchInputSeatSnapshot,
} from "../../mugen/runtime/MatchInputPolicySnapshot";
import type { RuntimeSocdResolution } from "../../mugen/runtime/RuntimeInput";

export type MugenInputState = Set<string>;

export type GamepadInputAdapterOptions = {
  /** Inject navigator.getGamepads or a test double. */
  getGamepads?: () => ReadonlyArray<Gamepad | null | undefined>;
  deadzone?: number;
  /** Physical gamepad index → seat (default: index 0 → seat 1, index 1 → seat 2). */
  seatByIndex?: Partial<Record<number, MatchInputSeatId>>;
  remap?: MatchInputRemapTable;
  socdMode?: RuntimeSocdResolution;
};

const ACTION_TO_MUGEN: Record<MatchInputAction, string | undefined> = {
  up: "U",
  down: "D",
  left: "B",
  right: "F",
  a: "a",
  b: "b",
  c: "c",
  x: "x",
  y: "y",
  z: "z",
  start: "s",
  select: undefined,
};

export class GamepadInputAdapter {
  private readonly getGamepads: () => ReadonlyArray<Gamepad | null | undefined>;
  private readonly deadzone: number;
  private readonly seatByIndex: Record<number, MatchInputSeatId>;
  private readonly remap: MatchInputRemapTable | undefined;
  private readonly socdMode: RuntimeSocdResolution;
  private lastPolicy?: MatchInputPolicySnapshot;
  private lastTick = 0;

  constructor(options: GamepadInputAdapterOptions = {}) {
    this.getGamepads =
      options.getGamepads ??
      (() => {
        if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") {
          return [];
        }
        return navigator.getGamepads();
      });
    this.deadzone = options.deadzone ?? 0.2;
    this.seatByIndex = {
      0: 1,
      1: 2,
      ...(options.seatByIndex ?? {}),
    };
    this.remap = options.remap;
    this.socdMode = options.socdMode ?? 0;
  }

  /** Poll pads for a match tick and retain the policy snapshot. */
  poll(tick: number): MatchInputPolicySnapshot {
    const pads = [...this.getGamepads()];
    const bySeat = new Map<MatchInputSeatId, { pad: Gamepad; index: number }>();
    for (let index = 0; index < pads.length; index += 1) {
      const pad = pads[index];
      if (!pad || pad.connected === false) continue;
      const seat = this.seatByIndex[index];
      if (!seat) continue;
      // First connected pad for a seat wins.
      if (!bySeat.has(seat)) bySeat.set(seat, { pad, index });
    }

    const p1 = this.seatBuild(1, bySeat.get(1), tick);
    const p2 = this.seatBuild(2, bySeat.get(2), tick);
    const policy = buildMatchInputPolicySnapshot({ tick, p1, p2 });
    this.lastPolicy = policy;
    this.lastTick = tick;
    return policy;
  }

  getLastPolicy(): MatchInputPolicySnapshot | undefined {
    return this.lastPolicy;
  }

  getLastTick(): number {
    return this.lastTick;
  }

  /** MUGEN virtual intents for one seat (empty when disconnected). */
  getState(seat: MatchInputSeatId = 1): MugenInputState {
    const policy = this.lastPolicy ?? this.poll(this.lastTick);
    const seatSnap = policy.seats.find((item) => item.seat === seat);
    if (!seatSnap || !seatSnap.connected) return new Set();
    return actionsToMugenState(seatSnap.actions);
  }

  /** Build a single seat snapshot from a Gamepad (or empty disconnected). */
  snapshotSeat(input: {
    seat: MatchInputSeatId;
    pad?: Gamepad | null;
    tick: number;
    connected?: boolean;
  }): MatchInputSeatSnapshot {
    if (!input.pad || input.connected === false) {
      return buildMatchInputSeatSnapshot({
        seat: input.seat,
        device: "gamepad",
        connected: false,
        deadzone: this.deadzone,
        tick: input.tick,
        socdMode: this.socdMode,
        remap: this.remap,
      });
    }
    const physical = physicalFromGamepad(input.pad, this.deadzone);
    return buildMatchInputSeatSnapshot({
      seat: input.seat,
      device: "gamepad",
      connected: true,
      deadzone: this.deadzone,
      physical,
      remap: this.remap,
      socdMode: this.socdMode,
      tick: input.tick,
    });
  }

  private seatBuild(
    _seat: MatchInputSeatId,
    bound: { pad: Gamepad; index: number } | undefined,
    _tick: number,
  ): Omit<Parameters<typeof buildMatchInputSeatSnapshot>[0], "seat" | "tick"> {
    if (!bound) {
      return {
        device: "gamepad",
        connected: false,
        deadzone: this.deadzone,
        socdMode: this.socdMode,
        remap: this.remap,
      };
    }
    return {
      device: "gamepad",
      connected: true,
      deadzone: this.deadzone,
      physical: physicalFromGamepad(bound.pad, this.deadzone),
      remap: this.remap,
      socdMode: this.socdMode,
    };
  }
}

export function physicalFromGamepad(pad: Gamepad, deadzone: number): MatchInputPhysicalState {
  const buttons: Record<string, boolean> = {};
  const axes: Record<string, number> = {};
  for (let i = 0; i < pad.buttons.length; i += 1) {
    const button = pad.buttons[i];
    const pressed = Boolean(button?.pressed || (button?.value ?? 0) > 0.5);
    buttons[`button${i}`] = pressed;
  }
  // D-pad aliases when standard mapping exposes buttons 12-15.
  if (buttons.button12) buttons.axis1_neg = true; // up via digital alias handled as button only
  if (buttons.button13) buttons.axis1_pos = true;
  if (buttons.button14) buttons.axis0_neg = true;
  if (buttons.button15) buttons.axis0_pos = true;
  // Prefer standard button remap: also map dpad buttons to action keys via remap table defaults.
  if (buttons.button12) buttons.KeyW = true; // will not match DEFAULT_REMAP — use explicit dpad remap below
  // Map d-pad to synthetic physical ids used by DEFAULT_REMAP axes:
  // instead set axes from dpad when stick near zero.
  for (let i = 0; i < pad.axes.length; i += 1) {
    axes[`axis${i}`] = applyMatchInputDeadzone(pad.axes[i] ?? 0, deadzone);
  }
  // If sticks idle, fold digital d-pad into axes.
  if (Math.abs(axes.axis0 ?? 0) < 1e-6) {
    if (buttons.button15) axes.axis0 = 1;
    else if (buttons.button14) axes.axis0 = -1;
  }
  if (Math.abs(axes.axis1 ?? 0) < 1e-6) {
    if (buttons.button13) axes.axis1 = 1;
    else if (buttons.button12) axes.axis1 = -1;
  }
  // Clean non-button digital aliases that are not in DEFAULT_REMAP.
  delete buttons.axis0_neg;
  delete buttons.axis0_pos;
  delete buttons.axis1_neg;
  delete buttons.axis1_pos;
  delete buttons.KeyW;
  return { buttons, axes };
}

export function actionsToMugenState(actions: Record<MatchInputAction, boolean>): MugenInputState {
  const result = new Set<string>();
  for (const [action, pressed] of Object.entries(actions) as Array<[MatchInputAction, boolean]>) {
    if (!pressed) continue;
    const mapped = ACTION_TO_MUGEN[action];
    if (mapped) result.add(mapped);
  }
  // Derived diagonals.
  if (result.has("D") && result.has("F")) result.add("DF");
  if (result.has("D") && result.has("B")) result.add("DB");
  if (result.has("U") && result.has("F")) result.add("UF");
  if (result.has("U") && result.has("B")) result.add("UB");
  return result;
}

/** Test helper: minimal Gamepad-like object. */
export function createFakeGamepad(input: {
  index?: number;
  connected?: boolean;
  buttons?: Array<boolean | number>;
  axes?: number[];
  id?: string;
}): Gamepad {
  const buttons = (input.buttons ?? []).map((value) => {
    if (typeof value === "number") {
      return { pressed: value > 0.5, touched: false, value } as GamepadButton;
    }
    return { pressed: value, touched: value, value: value ? 1 : 0 } as GamepadButton;
  });
  return {
    index: input.index ?? 0,
    id: input.id ?? "fake-pad",
    connected: input.connected !== false,
    mapping: "standard",
    axes: input.axes ?? [0, 0, 0, 0],
    buttons,
    timestamp: 0,
    vibrationActuator: null,
    hapticActuators: [],
  } as unknown as Gamepad;
}

// Re-export resolve for tests that assert deadzone path through policy.
export { resolveMatchInputActions, applyMatchInputDeadzone };
