import { describe, expect, it } from "vitest";
import {
  canonicalizeAssetReleasePolicyRecord,
  createAssetReleasePolicyRecord,
  type AssetReleasePolicyEvidence,
} from "../app/StudioAssetReleasePolicy";
import { createAssetProvenanceRecord } from "../app/StudioAssetProvenance";
import type { StudioAssetRecord } from "../app/StudioModel";

describe("StudioAssetReleasePolicy", () => {
  it("releases one named asset with fresh evidence and preserves non-blocking QA warnings", () => {
    const record = createAssetReleasePolicyRecord({
      provenance: completeProvenance(),
      evidence: [
        evidence("permission", "pass"),
        evidence("license", "pass"),
        evidence("digest", "pass"),
        evidence("transform", "pass"),
        evidence("qa", "pass", "qa:atlas-integrity"),
        evidence("qa", "warn", "qa:motion-variation"),
        evidence("collision", "pass"),
        evidence("playtest", "pass"),
      ],
      evaluatedAt: "2026-07-16T12:00:00.000Z",
    });

    expect(record).toMatchObject({
      status: "ready",
      canRelease: true,
      provenanceId: "asset-provenance:nova-boxer",
      evaluatedAt: "2026-07-16T12:00:00.000Z",
    });
    expect(record.blockedBy).toEqual([]);
    expect(record.warnings).toEqual(["qa:warning:qa:motion-variation"]);
  });

  it("fails closed for missing, stale, and unknown evidence", () => {
    const record = createAssetReleasePolicyRecord({
      provenance: completeProvenance(),
      evidence: [
        evidence("permission", "pass"),
        evidence("license", "pass"),
        evidence("digest", "stale"),
        evidence("transform", "pass"),
        evidence("qa", "unknown"),
        evidence("collision", "pass"),
      ],
      evaluatedAt: "2026-07-16T12:00:00.000Z",
    });

    expect(record).toMatchObject({ status: "blocked", canRelease: false });
    expect(record.blockedBy).toEqual(expect.arrayContaining([
      "digest:stale:digest",
      "digest:freshness:digest",
      "qa:unknown:qa",
      "qa:freshness:qa",
      "playtest:missing",
    ]));
  });

  it("rejects incomplete transform/path provenance and canonicalizes evidence order", () => {
    const provenance = completeProvenance({
      sourcePath: "C:\\Users\\cristian\\nova.def",
      transforms: [{
        id: "broken",
        kind: "bundle",
        tool: "browser-export",
        version: "1.0.0",
        configDigest: undefined,
        inputPaths: ["C:\\Users\\cristian\\nova.def"],
        outputPaths: ["assets/nova/manifest.json"],
      }],
    });
    const first = createAssetReleasePolicyRecord({
      provenance,
      evidence: completeEvidence(),
      evaluatedAt: "2026-07-16T12:00:00.000Z",
    });
    const second = createAssetReleasePolicyRecord({
      provenance,
      evidence: [...completeEvidence()].reverse(),
      evaluatedAt: "2026-07-16T12:00:00.000Z",
    });

    expect(first.blockedBy).toEqual(expect.arrayContaining(["paths:unsafe", "transform:incomplete"]));
    expect(first.canRelease).toBe(false);
    expect(canonicalizeAssetReleasePolicyRecord(first)).toBe(canonicalizeAssetReleasePolicyRecord(second));
    expect(canonicalizeAssetReleasePolicyRecord(first)).not.toContain("C:/Users/cristian");
  });
});

function evidence(
  kind: AssetReleasePolicyEvidence["kind"],
  status: AssetReleasePolicyEvidence["status"],
  id: string = kind,
): AssetReleasePolicyEvidence {
  return {
    id,
    kind,
    status,
    freshness: status === "stale" ? "stale" : status === "unknown" ? "unknown" : "fresh",
    reference: `qa/${id}.json`,
    digest: "d".repeat(64),
  };
}

function completeEvidence(): AssetReleasePolicyEvidence[] {
  return [
    evidence("permission", "pass"),
    evidence("license", "pass"),
    evidence("digest", "pass"),
    evidence("transform", "pass"),
    evidence("qa", "pass"),
    evidence("collision", "pass"),
    evidence("playtest", "pass"),
  ];
}

function completeProvenance(options: {
  sourcePath?: string;
  transforms?: Parameters<typeof createAssetProvenanceRecord>[0]["transforms"];
} = {}) {
  return createAssetProvenanceRecord({
    asset: asset(),
    sourceFingerprint: "a".repeat(64),
    outputDigest: "b".repeat(64),
    sourcePath: options.sourcePath ?? "characters/nova-boxer/source/input.png",
    tool: "sprite-atlas-builder",
    toolVersion: "1.0.0",
    license: { expression: "CC0-1.0", sourceRef: "LICENSE.txt", verified: true },
    transforms: options.transforms ?? [
      {
        id: "atlas",
        kind: "atlas" as const,
        tool: "sprite-atlas-builder",
        version: "1.0.0",
        configDigest: "c".repeat(64),
        inputPaths: ["characters/nova-boxer/source/input.png"],
        outputPaths: ["assets/characters/nova-boxer/manifest.json"],
      },
    ],
    qaLinks: [{ id: "qa:motion", kind: "qa" as const, status: "pass" as const, reference: "qa/motion.json" }],
  });
}

function asset(): StudioAssetRecord {
  return {
    id: "nova-boxer",
    label: "Nova Boxer",
    kind: "sprite-atlas",
    source: "generated",
    status: "ok",
    detail: "generated atlas",
    tags: ["sprite-atlas-builder"],
    severity: "info",
    affectedAssetId: "nova-boxer",
    affectedSystem: "renderer",
    impact: "generated fixture",
    evidenceIds: [],
    blockedBy: [],
    canExport: true,
    nextAction: { kind: "open-build", label: "Review build", targetId: "nova-boxer" },
  };
}
