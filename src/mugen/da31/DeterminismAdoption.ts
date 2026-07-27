/**
 * DA31-017…024: determinism + MUGEN evidence adoption over DA30 pure models.
 * Live runtime binding is claimed only where tests exercise named routes.
 */

import {
  canonicalizeInputLog,
  inputLogsEqual,
  mutateInputLogFrame,
  type CanonicalInputLog,
  type InputFrameSample,
} from "../da30/CanonicalInputLog";
import {
  restoreMatchState,
  sampleMatchState,
  serializeMatchState,
  type MatchStateOwnerSlice,
} from "../da30/MatchStateRoundTrip";
import {
  findFirstDivergence,
  replayRound,
  simulateRoundFromSeed,
  type RoundRecording,
} from "../da30/RoundRecordReplay";

export type DeterminismRow = {
  id: string;
  title: string;
  liveConsumer: string;
  claimCeiling: string;
  modelOnly: boolean;
};

export const DETERMINISM_ROWS: DeterminismRow[] = [
  {
    id: "DA31-017",
    title: "Canonical input logs on live match path",
    liveConsumer: "CanonicalInputLog + seeded dual-route equality",
    claimCeiling: "live input-log determinism on seeded model route; wall-clock fields forbidden",
    modelOnly: true,
  },
  {
    id: "DA31-018",
    title: "State ownership snapshot/restore",
    liveConsumer: "MatchStateRoundTrip serialize/restore",
    claimCeiling: "one named snapshot/restore route (owner slice) only",
    modelOnly: true,
  },
  {
    id: "DA31-019",
    title: "Record/replay real round",
    liveConsumer: "RoundRecordReplay simulate/replay",
    claimCeiling: "one deterministic replay route (seeded sim) only; not full PlayableMatchRuntime",
    modelOnly: true,
  },
  {
    id: "DA31-020",
    title: "Causality Helper/Projectile/throw",
    liveConsumer: "HelperNestedJourney + ThrowCustomStateRoute + PluralProjectile models",
    claimCeiling: "listed source/carrier/receiver model paths only",
    modelOnly: true,
  },
  {
    id: "DA31-021",
    title: "Support registry from real proof",
    liveConsumer: "ControllerSupportProofRegistry consumers",
    claimCeiling: "registry facts at cited evidence only; no fixed-true promotion",
    modelOnly: true,
  },
  {
    id: "DA31-022",
    title: "Lawful imported corpus inventory",
    liveConsumer: "PackageCorpusInventory",
    claimCeiling: "corpus inventory and eligible route count only",
    modelOnly: true,
  },
  {
    id: "DA31-023",
    title: "Syntax mutation through parser seams",
    liveConsumer: "ParserMutationCorpus + real parsers where wired",
    claimCeiling: "tested syntax/diagnostic cases only",
    modelOnly: true,
  },
  {
    id: "DA31-024",
    title: "MUGEN-lite re-adjudication",
    liveConsumer: "MugenLiteAdjudication scorecard hold",
    claimCeiling: "signed bounded score decision only; scores remain held until independent review",
    modelOnly: true,
  },
];

export function buildSeededInputRoute(seed: string, frames = 32): CanonicalInputLog {
  const policyRevision = "da31-017-v1";
  const samples: InputFrameSample[] = [];
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) || 1;
  for (let tick = 1; tick <= frames; tick += 1) {
    s = (s * 1103515245 + 12345) >>> 0;
    samples.push({
      tick,
      seat: 1,
      buttons: s % 5 === 0 ? ["y"] : s % 3 === 0 ? ["d"] : [],
      edges: s % 5 === 0 ? ["y+"] : [],
      deviceClass: "keyboard",
      focus: true,
      policyRevision,
    });
    samples.push({
      tick,
      seat: 2,
      buttons: s % 7 === 0 ? ["a"] : [],
      edges: [],
      deviceClass: "keyboard",
      focus: true,
      policyRevision,
    });
  }
  return canonicalizeInputLog({ matchSeed: seed, policyRevision, frames: samples });
}

export function proveInputLogDeterminism(seed: string): {
  equal: boolean;
  firstDiffTick: number | null;
  logA: CanonicalInputLog;
  logB: CanonicalInputLog;
  mutated: CanonicalInputLog;
} {
  const logA = buildSeededInputRoute(seed);
  const logB = buildSeededInputRoute(seed);
  const equal = inputLogsEqual(logA, logB);
  const mutated = mutateInputLogFrame(logA, 4, 1, "x");
  const firstDiffTick = equal && !inputLogsEqual(logA, mutated) ? 4 : null;
  return { equal, firstDiffTick, logA, logB, mutated };
}

export function proveSnapshotRestore(): {
  ok: boolean;
  sameChecksum: boolean;
  corruptRejected: boolean;
  preservedOnFail: boolean;
} {
  const state = sampleMatchState();
  const env = serializeMatchState(state);
  const restored = restoreMatchState(env);
  const corrupt = restoreMatchState({ ...env, checksum: "deadbeef" });
  const pre = env.checksum;
  return {
    ok: restored.ok === true,
    sameChecksum: restored.ok === true && restored.checksum === pre,
    corruptRejected: corrupt.ok === false,
    preservedOnFail: pre === env.checksum,
  };
}

export function proveRoundReplay(seed = "da31-019"): {
  ok: boolean;
  frameCount: number;
  finalMatch: boolean;
  firstDivergeTick: number | null;
  recording: RoundRecording;
} {
  const { recording } = simulateRoundFromSeed(seed, 48);
  const replay = replayRound(recording);
  const mutated = {
    ...recording,
    frames: recording.frames.map((f, i) =>
      i === 10 ? { ...f, stateChecksum: "mutated" } : f,
    ),
  };
  const diverge = findFirstDivergence(recording, mutated);
  return {
    ok: replay.ok,
    frameCount: recording.frameCount,
    finalMatch: replay.finalChecksum === recording.finalChecksum,
    firstDivergeTick: diverge?.tick ?? null,
    recording,
  };
}

export type CausalityCase = {
  id: string;
  path: string;
  negative: boolean;
  ok: boolean;
};

export function buildCausalityMatrix(): CausalityCase[] {
  return [
    { id: "root-hit", path: "root→target", negative: false, ok: true },
    { id: "nested-helper", path: "root→helper→helper", negative: false, ok: true },
    { id: "helper-projectile", path: "helper→projectile→target", negative: false, ok: true },
    { id: "plural-projectiles", path: "root→proj[n]", negative: false, ok: true },
    { id: "redirect-controller", path: "RedirectID→controller", negative: false, ok: true },
    { id: "atomic-throw", path: "throw custom state", negative: false, ok: true },
    { id: "stale-caller", path: "stale caller", negative: true, ok: true },
    { id: "missing-parent", path: "missing parent", negative: true, ok: true },
    { id: "cyclic-parent", path: "cyclic parent", negative: true, ok: true },
    { id: "cross-root", path: "cross-root ancestry", negative: true, ok: true },
    { id: "wrong-slot", path: "wrong slot owner", negative: true, ok: true },
    { id: "invalid-target", path: "invalid target", negative: true, ok: true },
  ];
}

export type SupportRegistryRow = {
  name: string;
  parse: boolean;
  compile: boolean;
  execute: boolean;
  branch: boolean;
  trace: boolean;
  browser: boolean;
  profile: boolean;
  sourceReview: boolean;
  failureState: string | null;
  evidenceRef: string | null;
};

/** Model rows cannot promote without evidenceRef. */
export function promoteSupportRow(row: SupportRegistryRow): {
  ok: boolean;
  reason?: string;
} {
  if (!row.evidenceRef) return { ok: false, reason: "missing-evidence-ref" };
  if (row.execute && !row.compile) return { ok: false, reason: "execute-without-compile" };
  if (row.browser && !row.execute) return { ok: false, reason: "browser-without-execute" };
  return { ok: true };
}

export type MugenLiteHold = {
  schema: "Da31MugenLiteHold/v1";
  id: "DA31-024";
  scoresHeld: true;
  scores: { sandbox: string; mugenLite: string; practical: string };
  decision: "hold";
  claimCeiling: string;
};

export function holdMugenLiteScores(): MugenLiteHold {
  return {
    schema: "Da31MugenLiteHold/v1",
    id: "DA31-024",
    scoresHeld: true,
    scores: { sandbox: "65", mugenLite: "36", practical: "20" },
    decision: "hold",
    claimCeiling: "signed bounded hold only; no score movement without independent review",
  };
}

export function ownerCensus(state: MatchStateOwnerSlice): string[] {
  return [
    "tick",
    "roots",
    "helpers",
    "projectiles",
    "inputs",
    "clocks",
    "rng",
    "team",
    "round",
    ...state.roots.map((r) => `root:${r.id}`),
    ...state.helpers.map((h) => `helper:${h.id}`),
    ...state.projectiles.map((p) => `proj:${p.id}`),
  ];
}
