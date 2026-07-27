/**
 * DA30-040: offline rewind/resim feasibility spike measurements.
 */
import { sampleMatchState, serializeMatchState, restoreMatchState, type MatchStateOwnerSlice } from "./MatchStateRoundTrip";
import { simulateRoundFromSeed } from "./RoundRecordReplay";

export type RewindDepthSample = {
  depthFrames: number;
  snapshotBytes: number;
  restoreMs: number;
  resimMs: number;
  resimFrames: number;
  checksumMatch: boolean;
};

export type RewindFeasibilityReport = {
  schema: "Da30RewindFeasibility/v1";
  id: "DA30-040";
  depths: RewindDepthSample[];
  unsupportedOwners: string[];
  frameBudgetMs: number;
  claimCeiling: string;
  blocks: string[];
  ok: boolean;
};

function timeMs(fn: () => void): number {
  const t0 = performance.now();
  fn();
  return performance.now() - t0;
}

export function runRewindFeasibilitySpike(depths = [8, 32, 64]): RewindFeasibilityReport {
  const samples: RewindDepthSample[] = [];
  for (const depth of depths) {
    const { recording, states } = simulateRoundFromSeed("rewind-spike", depth);
    const last = states[states.length - 1] ?? sampleMatchState();
    const env = serializeMatchState(last);
    const snapshotBytes = JSON.stringify(env).length;

    let restored: MatchStateOwnerSlice | null = null;
    const restoreMs = timeMs(() => {
      const r = restoreMatchState(env);
      restored = r.ok ? r.state : null;
    });

    let resimChecksum = "";
    const resimMs = timeMs(() => {
      const again = simulateRoundFromSeed("rewind-spike", depth);
      resimChecksum = again.recording.finalChecksum;
    });

    samples.push({
      depthFrames: depth,
      snapshotBytes,
      restoreMs,
      resimMs,
      resimFrames: depth,
      checksumMatch: resimChecksum === recording.finalChecksum && restored !== null,
    });
  }

  return {
    schema: "Da30RewindFeasibility/v1",
    id: "DA30-040",
    depths: samples,
    unsupportedOwners: ["full-effect-actor-graph", "audio-graph", "gpu-resources"],
    frameBudgetMs: 16.67,
    claimCeiling: "feasibility data only; blocks rollback/netplay readiness",
    blocks: ["rollback readiness", "netplay readiness"],
    ok: samples.every((s) => s.checksumMatch && s.snapshotBytes > 0),
  };
}
