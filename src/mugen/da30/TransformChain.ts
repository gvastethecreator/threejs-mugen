/**
 * DA30-083: reproducible transform chains with digests.
 */

import { createHash } from "node:crypto";

export type TransformStep = {
  tool: string;
  version: string;
  params: Record<string, string | number | boolean>;
  inputDigest: string;
  outputDigest: string;
};

export function digestPayload(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function applyTransform(
  inputDigest: string,
  tool: string,
  version: string,
  params: Record<string, string | number | boolean>,
  inputBytes: string,
): TransformStep {
  const canonical = JSON.stringify({ tool, version, params, inputBytes });
  return {
    tool,
    version,
    params,
    inputDigest,
    outputDigest: digestPayload(canonical),
  };
}

export function rerunMatches(a: TransformStep, b: TransformStep): boolean {
  return a.outputDigest === b.outputDigest && a.tool === b.tool && a.version === b.version;
}

export function runTransformChainCases(): {
  ok: boolean;
  steps: TransformStep[];
  deterministic: boolean;
  nondeterminismDeclared: boolean;
} {
  const tools = [
    { tool: "crop", params: { x: 0, y: 0, w: 64, h: 64 } },
    { tool: "resize", params: { w: 128, h: 128 } },
    { tool: "palette", params: { act: 1 } },
    { tool: "alpha", params: { threshold: 1 } },
    { tool: "atlas", params: { pad: 1 } },
    { tool: "audio-convert", params: { rate: 44100 } },
    { tool: "compress", params: { level: 6 } },
    { tool: "generate", params: { seed: 42 }, nondet: false },
  ];
  let dig = digestPayload("source");
  const steps: TransformStep[] = [];
  for (const t of tools) {
    const step = applyTransform(dig, t.tool, "1.0.0", t.params, dig);
    const again = applyTransform(dig, t.tool, "1.0.0", t.params, dig);
    if (!rerunMatches(step, again)) {
      return { ok: false, steps, deterministic: false, nondeterminismDeclared: false };
    }
    steps.push(step);
    dig = step.outputDigest;
  }
  return {
    ok: steps.length >= 8,
    steps,
    deterministic: true,
    nondeterminismDeclared: false,
  };
}
