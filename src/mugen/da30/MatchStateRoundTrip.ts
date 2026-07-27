/**
 * DA30-037/038: pure match-state serialize roundtrip for deterministic owners.
 * Subset only — not full PlayableMatchRuntime snapshot.
 */

export type MatchStateOwnerSlice = {
  tick: number;
  roots: Array<{ id: string; stateNo: number; life: number; power: number; posX: number; posY: number }>;
  helpers: Array<{ id: string; ownerId: string; stateNo: number }>;
  projectiles: Array<{ id: string; ownerId: string; spawnTick: number }>;
  inputs: { p1Buttons: string[]; p2Buttons: string[] };
  clocks: { hitPause: number; superPause: number; roundTime: number };
  rng: { gameplaySeed: number; streamCursor: number };
  team: { p1Wins: number; p2Wins: number; mode: string };
  round: { phase: string; number: number };
};

export type MatchStateEnvelope = {
  schema: "Da30MatchState/v1";
  version: 1;
  state: MatchStateOwnerSlice;
  checksum: string;
};

function fnv1a(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function canonicalizeMatchState(state: MatchStateOwnerSlice): string {
  const ordered: MatchStateOwnerSlice = {
    tick: state.tick,
    roots: [...state.roots].sort((a, b) => a.id.localeCompare(b.id)),
    helpers: [...state.helpers].sort((a, b) => a.id.localeCompare(b.id)),
    projectiles: [...state.projectiles].sort((a, b) => a.id.localeCompare(b.id)),
    inputs: {
      p1Buttons: [...state.inputs.p1Buttons].sort(),
      p2Buttons: [...state.inputs.p2Buttons].sort(),
    },
    clocks: { ...state.clocks },
    rng: { ...state.rng },
    team: { ...state.team },
    round: { ...state.round },
  };
  return JSON.stringify(ordered);
}

export function serializeMatchState(state: MatchStateOwnerSlice): MatchStateEnvelope {
  const body = canonicalizeMatchState(state);
  return {
    schema: "Da30MatchState/v1",
    version: 1,
    state: JSON.parse(body) as MatchStateOwnerSlice,
    checksum: fnv1a(body),
  };
}

export function restoreMatchState(raw: unknown):
  | { ok: true; state: MatchStateOwnerSlice; checksum: string }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "not object" };
  const env = raw as Partial<MatchStateEnvelope>;
  if (env.schema !== "Da30MatchState/v1") return { ok: false, error: "unknown schema" };
  if (env.version !== 1) return { ok: false, error: "unknown version" };
  if (!env.state || typeof env.state !== "object") return { ok: false, error: "missing state" };
  if (typeof env.checksum !== "string") return { ok: false, error: "missing checksum" };
  const recomputed = fnv1a(canonicalizeMatchState(env.state as MatchStateOwnerSlice));
  if (recomputed !== env.checksum) return { ok: false, error: "checksum mismatch" };
  return { ok: true, state: env.state as MatchStateOwnerSlice, checksum: env.checksum };
}

export function sampleMatchState(): MatchStateOwnerSlice {
  return {
    tick: 120,
    roots: [
      { id: "p1", stateNo: 200, life: 980, power: 100, posX: -40, posY: 0 },
      { id: "p2", stateNo: 0, life: 1000, power: 0, posX: 40, posY: 0 },
    ],
    helpers: [{ id: "p1-h0", ownerId: "p1", stateNo: 1000 }],
    projectiles: [{ id: "proj-1", ownerId: "p1", spawnTick: 100 }],
    inputs: { p1Buttons: ["a"], p2Buttons: [] },
    clocks: { hitPause: 0, superPause: 0, roundTime: 99 },
    rng: { gameplaySeed: 42, streamCursor: 7 },
    team: { p1Wins: 0, p2Wins: 0, mode: "versus" },
    round: { phase: "fight", number: 1 },
  };
}
