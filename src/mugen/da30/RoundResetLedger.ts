/**
 * DA30-049: round/match cleanup ledger (expected clear vs persist owners).
 */

export type ResetOwner = {
  owner: string;
  onRoundReset: "clear" | "persist" | "conditional";
  onMatchReset: "clear" | "persist" | "conditional";
  note: string;
};

export function buildRoundResetLedger(): {
  schema: "Da30RoundResetLedger/v1";
  id: "DA30-049";
  owners: ResetOwner[];
  claimCeiling: string;
} {
  const owners: ResetOwner[] = [
    { owner: "hits/contact-memory", onRoundReset: "clear", onMatchReset: "clear", note: "per-round contact" },
    { owner: "binds/targets", onRoundReset: "clear", onMatchReset: "clear", note: "target links" },
    { owner: "pauses", onRoundReset: "clear", onMatchReset: "clear", note: "hitpause/pause" },
    { owner: "effects", onRoundReset: "clear", onMatchReset: "clear", note: "explods/FX" },
    { owner: "helpers", onRoundReset: "clear", onMatchReset: "clear", note: "helper actors" },
    { owner: "projectiles", onRoundReset: "clear", onMatchReset: "clear", note: "global projectile schedule" },
    { owner: "inputs", onRoundReset: "conditional", onMatchReset: "clear", note: "buffers may persist intro" },
    { owner: "vars", onRoundReset: "conditional", onMatchReset: "clear", note: "sysvar vs var policy" },
    { owner: "power", onRoundReset: "conditional", onMatchReset: "clear", note: "team mode may persist" },
    { owner: "team-state", onRoundReset: "persist", onMatchReset: "clear", note: "active/standby roster" },
    { owner: "camera", onRoundReset: "clear", onMatchReset: "clear", note: "recenter" },
    { owner: "audio", onRoundReset: "conditional", onMatchReset: "clear", note: "BGM may persist" },
    { owner: "renderer-resources", onRoundReset: "persist", onMatchReset: "conditional", note: "dispose on match end" },
  ];
  return {
    schema: "Da30RoundResetLedger/v1",
    id: "DA30-049",
    owners,
    claimCeiling: "reset ledger only",
  };
}
