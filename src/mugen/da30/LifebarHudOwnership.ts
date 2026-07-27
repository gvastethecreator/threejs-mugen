/**
 * DA30-056: lifebar/HUD ownership — exact actor/team/resource owner per field.
 */

export type HudField =
  | "life"
  | "power"
  | "guard"
  | "stun"
  | "redLife"
  | "timer"
  | "rounds"
  | "combo"
  | "teamSlot";

export type HudOwner = {
  field: HudField;
  ownerId: string;
  teamSide: "p1" | "p2" | "system";
  status: "ok" | "stale" | "standby" | "missing";
  value: number | string | null;
};

export type HudSnapshot = {
  schema: "Da30LifebarHudOwnership/v1";
  fields: HudOwner[];
  failures: string[];
};

export function buildHudSnapshot(input: {
  p1Active: string | null;
  p2Active: string | null;
  p1Standby?: string[];
  life: Record<string, number>;
  power: Record<string, number>;
  guard?: Record<string, number>;
  stun?: Record<string, number>;
  redLife?: Record<string, number>;
  timer: number;
  rounds: [number, number];
  combo: number;
  teamSlots: string[];
}): HudSnapshot {
  const fields: HudOwner[] = [];
  const failures: string[] = [];

  const bind = (
    field: HudField,
    ownerId: string | null,
    teamSide: HudOwner["teamSide"],
    value: number | string | null,
    status: HudOwner["status"] = "ok",
  ) => {
    if (!ownerId && field !== "timer" && field !== "rounds" && field !== "combo") {
      failures.push(`${field}:missing-owner`);
      fields.push({ field, ownerId: "?", teamSide, status: "missing", value: null });
      return;
    }
    fields.push({
      field,
      ownerId: ownerId ?? "system",
      teamSide,
      status,
      value,
    });
  };

  bind("life", input.p1Active, "p1", input.p1Active ? input.life[input.p1Active] ?? null : null);
  bind("power", input.p1Active, "p1", input.p1Active ? input.power[input.p1Active] ?? null : null);
  bind("guard", input.p1Active, "p1", input.p1Active ? input.guard?.[input.p1Active] ?? 0 : 0);
  bind("stun", input.p1Active, "p1", input.p1Active ? input.stun?.[input.p1Active] ?? 0 : 0);
  bind("redLife", input.p1Active, "p1", input.p1Active ? input.redLife?.[input.p1Active] ?? 0 : 0);
  bind("life", input.p2Active, "p2", input.p2Active ? input.life[input.p2Active] ?? null : null);
  bind("power", input.p2Active, "p2", input.p2Active ? input.power[input.p2Active] ?? null : null);
  bind("timer", "system", "system", input.timer);
  bind("rounds", "system", "system", `${input.rounds[0]}-${input.rounds[1]}`);
  bind("combo", input.p1Active, "p1", input.combo);
  for (const slot of input.teamSlots) {
    const standby = input.p1Standby?.includes(slot) || input.p2Active !== slot;
    bind("teamSlot", slot, "p1", slot, standby && slot !== input.p1Active ? "standby" : "ok");
  }

  // stale owner
  if (input.p1Active && input.life[input.p1Active] === undefined) {
    failures.push("life:stale-owner");
  }

  return { schema: "Da30LifebarHudOwnership/v1", fields, failures };
}

export function runHudOwnershipCases(): { ok: boolean; cases: Array<{ id: string; passed: boolean }> } {
  const good = buildHudSnapshot({
    p1Active: "nova",
    p2Active: "mira",
    p1Standby: ["rook"],
    life: { nova: 900, mira: 800, rook: 1000 },
    power: { nova: 1000, mira: 500 },
    guard: { nova: 0 },
    stun: { nova: 0 },
    redLife: { nova: 50 },
    timer: 99,
    rounds: [1, 0],
    combo: 3,
    teamSlots: ["nova", "rook"],
  });
  const missing = buildHudSnapshot({
    p1Active: null,
    p2Active: "mira",
    life: { mira: 1000 },
    power: { mira: 0 },
    timer: 60,
    rounds: [0, 0],
    combo: 0,
    teamSlots: [],
  });
  const cases = [
    { id: "happy-owners", passed: good.failures.length === 0 && good.fields.length >= 8 },
    { id: "missing-p1-visible", passed: missing.failures.some((f) => f.includes("missing")) },
    {
      id: "standby-slot",
      passed: good.fields.some((f) => f.field === "teamSlot" && f.status === "standby"),
    },
  ];
  return { ok: cases.every((c) => c.passed), cases };
}
