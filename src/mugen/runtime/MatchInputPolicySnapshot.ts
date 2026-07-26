import type { RuntimeSocdResolution } from "./RuntimeInput";

/**
 * MatchInputPolicySnapshot/v1 (DA26-14, bounded).
 * Logical seat snapshots shared by keyboard, gamepad, and replay adapters.
 * Does not claim full browser Gamepad API parity.
 */

export const MATCH_INPUT_POLICY_SNAPSHOT_SCHEMA = "MatchInputPolicySnapshot/v1" as const;

export type MatchInputDeviceKind = "keyboard" | "gamepad" | "replay";
export type MatchInputSeatId = 1 | 2;
export type MatchInputAction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "a"
  | "b"
  | "c"
  | "x"
  | "y"
  | "z"
  | "start"
  | "select";

export type MatchInputRemapTable = Partial<Record<string, MatchInputAction>>;

export type MatchInputPhysicalState = {
  /** Digital buttons keyed by physical id (KeyW, button0, …). */
  buttons: Record<string, boolean>;
  /** Analog axes in [-1, 1] before deadzone. */
  axes: Record<string, number>;
};

export type MatchInputSeatSnapshot = {
  seat: MatchInputSeatId;
  device: MatchInputDeviceKind;
  connected: boolean;
  deadzone: number;
  physical: MatchInputPhysicalState;
  actions: Record<MatchInputAction, boolean>;
  facing: 1 | -1;
  socdMode: RuntimeSocdResolution;
  tick: number;
};

export type MatchInputPolicySnapshot = {
  schema: typeof MATCH_INPUT_POLICY_SNAPSHOT_SCHEMA;
  tick: number;
  seats: [MatchInputSeatSnapshot, MatchInputSeatSnapshot];
};

export type MatchInputSeatBuildInput = {
  seat: MatchInputSeatId;
  device: MatchInputDeviceKind;
  connected?: boolean;
  deadzone?: number;
  physical?: Partial<MatchInputPhysicalState>;
  remap?: MatchInputRemapTable;
  facing?: 1 | -1;
  socdMode?: RuntimeSocdResolution;
  tick: number;
};

const DEFAULT_REMAP: MatchInputRemapTable = {
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  KeyJ: "a",
  KeyK: "b",
  KeyL: "c",
  KeyU: "x",
  KeyI: "y",
  KeyO: "z",
  Enter: "start",
  ShiftLeft: "select",
  button0: "a",
  button1: "b",
  button2: "c",
  button3: "x",
  button4: "y",
  button5: "z",
  button9: "start",
  button8: "select",
  axis0_neg: "left",
  axis0_pos: "right",
  axis1_neg: "up",
  axis1_pos: "down",
};

export function applyMatchInputDeadzone(value: number, deadzone: number): number {
  if (!Number.isFinite(value)) return 0;
  const zone = clamp01(deadzone);
  const magnitude = Math.abs(value);
  if (magnitude <= zone) return 0;
  const sign = value < 0 ? -1 : 1;
  return sign * ((magnitude - zone) / (1 - zone));
}

export function resolveMatchInputActions(input: {
  physical: MatchInputPhysicalState;
  remap?: MatchInputRemapTable;
  deadzone?: number;
  connected?: boolean;
}): Record<MatchInputAction, boolean> {
  const actions = emptyActions();
  if (input.connected === false) {
    return actions;
  }
  const remap = { ...DEFAULT_REMAP, ...input.remap };
  const deadzone = input.deadzone ?? 0.2;
  for (const [physicalId, pressed] of Object.entries(input.physical.buttons)) {
    if (!pressed) continue;
    const action = remap[physicalId];
    if (action) actions[action] = true;
  }
  for (const [axisId, raw] of Object.entries(input.physical.axes)) {
    const value = applyMatchInputDeadzone(raw, deadzone);
    if (value < 0) {
      const action = remap[`${axisId}_neg`];
      if (action) actions[action] = true;
    } else if (value > 0) {
      const action = remap[`${axisId}_pos`];
      if (action) actions[action] = true;
    }
  }
  return actions;
}

export function buildMatchInputSeatSnapshot(input: MatchInputSeatBuildInput): MatchInputSeatSnapshot {
  const connected = input.connected !== false;
  const deadzone = clamp01(input.deadzone ?? 0.2);
  const physical: MatchInputPhysicalState = {
    buttons: { ...(input.physical?.buttons ?? {}) },
    axes: { ...(input.physical?.axes ?? {}) },
  };
  return {
    seat: input.seat,
    device: input.device,
    connected,
    deadzone,
    physical,
    actions: resolveMatchInputActions({
      physical,
      remap: input.remap,
      deadzone,
      connected,
    }),
    facing: input.facing ?? 1,
    socdMode: input.socdMode ?? 0,
    tick: Math.trunc(input.tick),
  };
}

export function buildMatchInputPolicySnapshot(input: {
  tick: number;
  p1: Omit<MatchInputSeatBuildInput, "seat" | "tick">;
  p2: Omit<MatchInputSeatBuildInput, "seat" | "tick">;
}): MatchInputPolicySnapshot {
  const tick = Math.trunc(input.tick);
  return {
    schema: MATCH_INPUT_POLICY_SNAPSHOT_SCHEMA,
    tick,
    seats: [
      buildMatchInputSeatSnapshot({ ...input.p1, seat: 1, tick }),
      buildMatchInputSeatSnapshot({ ...input.p2, seat: 2, tick }),
    ],
  };
}

/** Stable JSON for replay / determinism checks. */
export function canonicalizeMatchInputPolicySnapshot(snapshot: MatchInputPolicySnapshot): string {
  return JSON.stringify(snapshot);
}

export function matchInputPolicySnapshotsEqual(
  left: MatchInputPolicySnapshot,
  right: MatchInputPolicySnapshot,
): boolean {
  return canonicalizeMatchInputPolicySnapshot(left) === canonicalizeMatchInputPolicySnapshot(right);
}

function emptyActions(): Record<MatchInputAction, boolean> {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    c: false,
    x: false,
    y: false,
    z: false,
    start: false,
    select: false,
  };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.2;
  return Math.min(1, Math.max(0, value));
}
