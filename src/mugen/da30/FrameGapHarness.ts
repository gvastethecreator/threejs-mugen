/**
 * DA30-027: frame-gap harness measurement shape (device/route facts only).
 */

export type FrameGapSample = {
  routeId: string;
  seed: number;
  warmupFrames: number;
  sampleCount: number;
  gapsMs: number[];
  drawCalls?: number;
  memoryMb?: number;
  browser: string;
  cpuHint?: string;
  gpuHint?: string;
};

export type FrameGapReport = {
  schema: "Da30FrameGapReport/v1";
  routeId: string;
  p50: number;
  p95: number;
  p99: number;
  max: number;
  fpsEstimate: number;
  longTasksOver50ms: number;
  seed: number;
  sampleCount: number;
  thresholds: { p95Ms: number; maxMs: number };
  breach: boolean;
  breachOwner: string | null;
};

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx]!;
}

export function buildFrameGapReport(sample: FrameGapSample, thresholds = { p95Ms: 33, maxMs: 100 }): FrameGapReport {
  const sorted = [...sample.gapsMs].sort((a, b) => a - b);
  const p50 = percentile(sorted, 50);
  const p95 = percentile(sorted, 95);
  const p99 = percentile(sorted, 99);
  const max = sorted.length ? sorted[sorted.length - 1]! : 0;
  const mean = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
  const fpsEstimate = mean > 0 ? 1000 / mean : 0;
  const longTasksOver50ms = sample.gapsMs.filter((g) => g > 50).length;
  const breach = p95 > thresholds.p95Ms || max > thresholds.maxMs;
  return {
    schema: "Da30FrameGapReport/v1",
    routeId: sample.routeId,
    p50,
    p95,
    p99,
    max,
    fpsEstimate,
    longTasksOver50ms,
    seed: sample.seed,
    sampleCount: sample.sampleCount,
    thresholds,
    breach,
    breachOwner: breach ? "runtime-owner" : null,
  };
}
