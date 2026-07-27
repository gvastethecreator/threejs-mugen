/**
 * DA30-087: profile-aware capability reasons from scanner.
 */

export type CapabilityState =
  | "recognized"
  | "parsed"
  | "compiled"
  | "executed"
  | "unsupported"
  | "blocked"
  | "unknown"
  | "profile-only"
  | "malformed";

export type CapabilityFact = {
  symbol: string;
  state: CapabilityState;
  location: { file: string; line: number };
  owner: string;
  nextAction: string;
  registryRevision: number;
  profile: string;
};

export function emitCapabilityFact(partial: Omit<CapabilityFact, "nextAction"> & { nextAction?: string }): CapabilityFact {
  const next =
    partial.nextAction ??
    ({
      recognized: "await-parse",
      parsed: "await-compile",
      compiled: "await-execute-proof",
      executed: "none",
      unsupported: "document-gap",
      blocked: "remove-or-gate",
      unknown: "classify",
      "profile-only": "switch-profile-or-omit",
      malformed: "fix-syntax",
    } as Record<CapabilityState, string>)[partial.state];
  return { ...partial, nextAction: next };
}

export function runCapabilityReasonMatrix(): { ok: boolean; facts: CapabilityFact[] } {
  const states: CapabilityState[] = [
    "recognized",
    "parsed",
    "compiled",
    "executed",
    "unsupported",
    "blocked",
    "unknown",
    "profile-only",
    "malformed",
  ];
  const facts = states.map((state, i) =>
    emitCapabilityFact({
      symbol: `Sym${i}`,
      state,
      location: { file: "char.cns", line: i + 1 },
      owner: "scanner",
      registryRevision: 1,
      profile: state === "profile-only" ? "ikemen" : "mugen",
    }),
  );
  return {
    ok: facts.length === 9 && facts.every((f) => f.nextAction && f.location.line > 0),
    facts,
  };
}
