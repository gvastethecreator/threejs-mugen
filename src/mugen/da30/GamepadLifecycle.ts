/**
 * DA30-032: gamepad lifecycle pure model (mid-hold unplug, reconnect, mapping fail).
 */

export type GamepadSeatBinding = {
  seat: 1 | 2;
  gamepadIndex: number | null;
  mapping: "standard" | "non-standard" | "unknown";
  status: "active" | "disconnected" | "fallback-keyboard" | "mapping-failed";
  lastButtons: boolean[];
};

export type GamepadLifecycleEvent =
  | { type: "connect"; index: number; mapping: GamepadSeatBinding["mapping"] }
  | { type: "disconnect"; index: number }
  | { type: "button"; index: number; button: number; pressed: boolean }
  | { type: "remap-fail"; index: number };

export function createSeatBindings(): GamepadSeatBinding[] {
  return [
    { seat: 1, gamepadIndex: null, mapping: "unknown", status: "fallback-keyboard", lastButtons: [] },
    { seat: 2, gamepadIndex: null, mapping: "unknown", status: "fallback-keyboard", lastButtons: [] },
  ];
}

export function applyGamepadEvent(bindings: GamepadSeatBinding[], event: GamepadLifecycleEvent): GamepadSeatBinding[] {
  const next = bindings.map((b) => ({ ...b, lastButtons: [...b.lastButtons] }));
  if (event.type === "connect") {
    const free = next.find((b) => b.gamepadIndex === null) ?? next[0]!;
    free.gamepadIndex = event.index;
    free.mapping = event.mapping;
    free.status = event.mapping === "non-standard" ? "mapping-failed" : "active";
    if (free.status === "mapping-failed") free.gamepadIndex = event.index;
    return next;
  }
  if (event.type === "disconnect") {
    for (const b of next) {
      if (b.gamepadIndex === event.index) {
        // mid-hold unplug: clear pressed buttons (stale release)
        b.lastButtons = b.lastButtons.map(() => false);
        b.gamepadIndex = null;
        b.status = "fallback-keyboard";
        b.mapping = "unknown";
      }
    }
    return next;
  }
  if (event.type === "button") {
    for (const b of next) {
      if (b.gamepadIndex === event.index && b.status === "active") {
        while (b.lastButtons.length <= event.button) b.lastButtons.push(false);
        b.lastButtons[event.button] = event.pressed;
      }
    }
    return next;
  }
  if (event.type === "remap-fail") {
    for (const b of next) {
      if (b.gamepadIndex === event.index) {
        b.status = "mapping-failed";
        b.lastButtons = b.lastButtons.map(() => false);
      }
    }
  }
  return next;
}

export function visibleStatus(bindings: GamepadSeatBinding[]): string[] {
  return bindings.map((b) => `P${b.seat}:${b.status}${b.gamepadIndex == null ? "" : `#${b.gamepadIndex}`}`);
}
