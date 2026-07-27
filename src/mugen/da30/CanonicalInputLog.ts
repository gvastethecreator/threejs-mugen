/**
 * DA30-034: canonical per-frame input log.
 */

export type InputFrameSample = {
  tick: number;
  seat: 1 | 2;
  buttons: string[];
  edges: string[];
  deviceClass: "keyboard" | "gamepad" | "touch" | "replay";
  focus: boolean;
  policyRevision: string;
};

export type CanonicalInputLog = {
  schema: "Da30CanonicalInputLog/v1";
  matchSeed: string;
  policyRevision: string;
  frames: InputFrameSample[];
  checksum: string;
};

export function canonicalizeInputLog(input: {
  matchSeed: string;
  policyRevision: string;
  frames: InputFrameSample[];
}): CanonicalInputLog {
  const frames = [...input.frames]
    .map((f) => ({
      ...f,
      buttons: [...f.buttons].sort(),
      edges: [...f.edges].sort(),
    }))
    .sort((a, b) => a.tick - b.tick || a.seat - b.seat);
  const body = JSON.stringify({ matchSeed: input.matchSeed, policyRevision: input.policyRevision, frames });
  // Simple stable checksum without node:crypto for browser-safe pure module
  let h = 2166136261;
  for (let i = 0; i < body.length; i += 1) {
    h ^= body.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const checksum = (h >>> 0).toString(16).padStart(8, "0");
  return {
    schema: "Da30CanonicalInputLog/v1",
    matchSeed: input.matchSeed,
    policyRevision: input.policyRevision,
    frames,
    checksum,
  };
}

export function inputLogsEqual(a: CanonicalInputLog, b: CanonicalInputLog): boolean {
  return a.checksum === b.checksum && JSON.stringify(a.frames) === JSON.stringify(b.frames);
}

/** Mutation must change checksum (determinism negative). */
export function mutateInputLogFrame(log: CanonicalInputLog, tick: number, seat: 1 | 2, button: string): CanonicalInputLog {
  const frames = log.frames.map((f) => {
    if (f.tick !== tick || f.seat !== seat) return f;
    return { ...f, buttons: [...f.buttons, button] };
  });
  return canonicalizeInputLog({
    matchSeed: log.matchSeed,
    policyRevision: log.policyRevision,
    frames,
  });
}
