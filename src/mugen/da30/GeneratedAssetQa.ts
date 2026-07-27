/**
 * DA30-084: generated asset QA gate for owned sample pipeline.
 */

export type AssetQaResult = {
  id: string;
  passed: boolean;
  reasons: string[];
};

export function qaGeneratedAsset(sample: {
  id: string;
  width: number;
  height: number;
  hasAlpha: boolean;
  seamsOk: boolean;
  paletteSize: number;
  animTimingMs: number[];
  audioPeak: number;
  audioRms: number;
  provenanceOk: boolean;
  pathSafe: boolean;
  budgetBytes: number;
  maxBytes: number;
}): AssetQaResult {
  const reasons: string[] = [];
  if (sample.width <= 0 || sample.height <= 0) reasons.push("dimensions");
  if (!sample.hasAlpha) reasons.push("alpha");
  if (!sample.seamsOk) reasons.push("seams");
  if (sample.paletteSize <= 0 || sample.paletteSize > 256) reasons.push("palette");
  if (!sample.animTimingMs.length || sample.animTimingMs.some((t) => t <= 0)) reasons.push("animation-timing");
  if (sample.audioPeak > 1 || sample.audioPeak < 0) reasons.push("audio-peak");
  if (sample.audioRms < 0 || sample.audioRms > sample.audioPeak) reasons.push("audio-rms");
  if (!sample.provenanceOk) reasons.push("provenance");
  if (!sample.pathSafe) reasons.push("path");
  if (sample.budgetBytes > sample.maxBytes) reasons.push("budget");
  return { id: sample.id, passed: reasons.length === 0, reasons };
}

export function runGeneratedAssetQa(): { ok: boolean; pass: AssetQaResult; fail: AssetQaResult } {
  const pass = qaGeneratedAsset({
    id: "spark-sheet",
    width: 128,
    height: 128,
    hasAlpha: true,
    seamsOk: true,
    paletteSize: 32,
    animTimingMs: [50, 50, 50],
    audioPeak: 0.8,
    audioRms: 0.2,
    provenanceOk: true,
    pathSafe: true,
    budgetBytes: 40_000,
    maxBytes: 100_000,
  });
  const fail = qaGeneratedAsset({
    id: "bad",
    width: 0,
    height: 64,
    hasAlpha: false,
    seamsOk: false,
    paletteSize: 0,
    animTimingMs: [],
    audioPeak: 1.5,
    audioRms: 2,
    provenanceOk: false,
    pathSafe: false,
    budgetBytes: 9_000_000,
    maxBytes: 100_000,
  });
  return {
    ok: pass.passed && !fail.passed && fail.reasons.length >= 3,
    pass,
    fail,
  };
}
