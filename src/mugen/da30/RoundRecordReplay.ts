/**
 * DA30-039: record/replay one full round — periodic + final checksums, mutation finds first diverge.
 */
import { canonicalizeInputLog, type CanonicalInputLog, type InputFrameSample } from "./CanonicalInputLog";
import {
  serializeMatchState,
  type MatchStateOwnerSlice,
  sampleMatchState,
} from "./MatchStateRoundTrip";

export type RoundFrameRecord = {
  tick: number;
  stateChecksum: string;
  contactEvents: number;
  winner: "p1" | "p2" | "none";
  resources: { p1Life: number; p2Life: number; p1Power: number; p2Power: number };
};

export type RoundRecording = {
  schema: "Da30RoundRecording/v1";
  matchSeed: string;
  frameCount: number;
  inputLog: CanonicalInputLog;
  frames: RoundFrameRecord[];
  finalChecksum: string;
  periodicEvery: number;
};

function fnv(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Deterministic synthetic round sim from seed (not full runtime). */
export function simulateRoundFromSeed(matchSeed: string, frameCount = 64): {
  recording: RoundRecording;
  states: MatchStateOwnerSlice[];
} {
  const policyRevision = "v1";
  const inputFrames: InputFrameSample[] = [];
  const states: MatchStateOwnerSlice[] = [];
  const frameRecords: RoundFrameRecord[] = [];
  let seed = [...matchSeed].reduce((a, c) => a + c.charCodeAt(0), 0) || 1;

  const state = sampleMatchState();
  state.tick = 0;
  state.round = { phase: "fight", number: 1 };

  for (let tick = 1; tick <= frameCount; tick += 1) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const p1Attack = seed % 7 === 0;
    const p2Guard = seed % 11 === 0;
    inputFrames.push({
      tick,
      seat: 1,
      buttons: p1Attack ? ["y"] : seed % 3 === 0 ? ["d"] : [],
      edges: p1Attack ? ["y+"] : [],
      deviceClass: "keyboard",
      focus: true,
      policyRevision,
    });
    inputFrames.push({
      tick,
      seat: 2,
      buttons: p2Guard ? ["a"] : [],
      edges: [],
      deviceClass: "keyboard",
      focus: true,
      policyRevision,
    });

    state.tick = tick;
    if (p1Attack && !p2Guard) {
      state.roots = state.roots.map((r) =>
        r.id === "p2" ? { ...r, life: Math.max(0, r.life - 12), stateNo: 5000 } : r.id === "p1" ? { ...r, stateNo: 200, power: r.power + 10 } : r,
      );
    } else if (p1Attack && p2Guard) {
      state.roots = state.roots.map((r) => (r.id === "p2" ? { ...r, life: Math.max(0, r.life - 2) } : r));
    } else {
      state.roots = state.roots.map((r) => ({ ...r }));
    }
    state.clocks = { ...state.clocks, roundTime: Math.max(0, 99 - Math.floor(tick / 2)) };
    state.rng = { gameplaySeed: 42, streamCursor: tick };

    const env = serializeMatchState(state);
    const p1 = state.roots.find((r) => r.id === "p1")!;
    const p2 = state.roots.find((r) => r.id === "p2")!;
    const contactEvents = p1Attack ? 1 : 0;
    frameRecords.push({
      tick,
      stateChecksum: env.checksum,
      contactEvents,
      winner: p2.life <= 0 ? "p1" : p1.life <= 0 ? "p2" : "none",
      resources: { p1Life: p1.life, p2Life: p2.life, p1Power: p1.power, p2Power: p2.power },
    });
    states.push(JSON.parse(JSON.stringify(state)) as MatchStateOwnerSlice);
  }

  const inputLog = canonicalizeInputLog({ matchSeed, policyRevision, frames: inputFrames });
  const finalChecksum = fnv(frameRecords.map((f) => f.stateChecksum).join("|") + inputLog.checksum);
  const recording: RoundRecording = {
    schema: "Da30RoundRecording/v1",
    matchSeed,
    frameCount,
    inputLog,
    frames: frameRecords,
    finalChecksum,
    periodicEvery: 8,
  };
  return { recording, states };
}

export function replayRound(recording: RoundRecording): {
  ok: boolean;
  finalChecksum: string;
  periodicMatches: boolean;
  frameCount: number;
} {
  const again = simulateRoundFromSeed(recording.matchSeed, recording.frameCount);
  const periodicMatches = recording.frames
    .filter((f) => f.tick % recording.periodicEvery === 0)
    .every((f) => {
      const g = again.recording.frames.find((x) => x.tick === f.tick);
      return g?.stateChecksum === f.stateChecksum;
    });
  return {
    ok: again.recording.finalChecksum === recording.finalChecksum && periodicMatches,
    finalChecksum: again.recording.finalChecksum,
    periodicMatches,
    frameCount: again.recording.frameCount,
  };
}

export function findFirstDivergence(
  a: RoundRecording,
  b: RoundRecording,
): { tick: number; owner: string } | null {
  const n = Math.min(a.frames.length, b.frames.length);
  for (let i = 0; i < n; i += 1) {
    const fa = a.frames[i]!;
    const fb = b.frames[i]!;
    if (fa.stateChecksum !== fb.stateChecksum) {
      if (fa.resources.p1Life !== fb.resources.p1Life) return { tick: fa.tick, owner: "roots.p1.life" };
      if (fa.resources.p2Life !== fb.resources.p2Life) return { tick: fa.tick, owner: "roots.p2.life" };
      return { tick: fa.tick, owner: "state" };
    }
  }
  if (a.inputLog.checksum !== b.inputLog.checksum) return { tick: 0, owner: "inputs" };
  return null;
}

export function mutateRecordingAt(recording: RoundRecording, tick: number): RoundRecording {
  const frames = recording.frames.map((f) =>
    f.tick === tick
      ? {
          ...f,
          stateChecksum: fnv(f.stateChecksum + "mut"),
          resources: { ...f.resources, p2Life: Math.max(0, f.resources.p2Life - 1) },
        }
      : f,
  );
  return {
    ...recording,
    frames,
    finalChecksum: fnv(frames.map((f) => f.stateChecksum).join("|") + recording.inputLog.checksum),
  };
}
