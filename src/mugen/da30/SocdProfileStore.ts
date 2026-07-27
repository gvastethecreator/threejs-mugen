/**
 * DA30-033: versioned SOCD/input profile persistence by seat.
 */

export type SocdMode = "neutral" | "last-input" | "absolute";

export type SeatInputProfile = {
  schema: "Da30SeatInputProfile/v1";
  seat: 1 | 2;
  revision: number;
  socdMode: SocdMode;
  devicePreference: "keyboard" | "gamepad" | "auto";
  bindings: Record<string, string>;
};

export type ProfileStore = {
  profiles: Record<string, SeatInputProfile>;
};

export function defaultProfile(seat: 1 | 2): SeatInputProfile {
  return {
    schema: "Da30SeatInputProfile/v1",
    seat,
    revision: 1,
    socdMode: "last-input",
    devicePreference: "auto",
    bindings: { left: "a", right: "d", up: "w", down: "s", attack: "y" },
  };
}

export function createStore(): ProfileStore {
  return { profiles: { p1: defaultProfile(1), p2: defaultProfile(2) } };
}

export function serializeStore(store: ProfileStore): string {
  return JSON.stringify(store);
}

export function openStore(raw: string): { ok: true; store: ProfileStore } | { ok: false; reason: string; store: ProfileStore } {
  try {
    const parsed = JSON.parse(raw) as ProfileStore;
    if (!parsed.profiles?.p1 || !parsed.profiles?.p2) {
      return { ok: false, reason: "missing seats", store: createStore() };
    }
    for (const key of ["p1", "p2"] as const) {
      const p = parsed.profiles[key];
      if (p.schema !== "Da30SeatInputProfile/v1") {
        return { ok: false, reason: "unknown schema", store: createStore() };
      }
    }
    return { ok: true, store: parsed };
  } catch {
    return { ok: false, reason: "corrupt", store: createStore() };
  }
}

export function swapSeats(store: ProfileStore): ProfileStore {
  const p1 = { ...store.profiles.p1!, seat: 2 as const, revision: store.profiles.p1!.revision + 1 };
  const p2 = { ...store.profiles.p2!, seat: 1 as const, revision: store.profiles.p2!.revision + 1 };
  return { profiles: { p1: p2, p2: p1 } };
}

export function resetSeat(store: ProfileStore, seatKey: "p1" | "p2"): ProfileStore {
  const seat = seatKey === "p1" ? 1 : 2;
  return {
    profiles: {
      ...store.profiles,
      [seatKey]: { ...defaultProfile(seat), revision: (store.profiles[seatKey]?.revision ?? 0) + 1 },
    },
  };
}
