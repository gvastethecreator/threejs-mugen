import { describe, expect, it } from "vitest";
import {
  createAssetProvenanceRecord,
  redactAssetSourcePath,
} from "../app/StudioAssetProvenance";
import type { StudioAssetRecord } from "../app/StudioModel";

describe("StudioAssetProvenance", () => {
  it("marks an asset complete only when input and output digests exist", () => {
    const record = createAssetProvenanceRecord({
      asset: asset(),
      sourceFingerprint: "A".repeat(64),
      outputDigest: "B".repeat(64),
      sourcePath: "chars/kfm/kfm.def",
      tool: "mugen-loader",
    });

    expect(record).toMatchObject({
      schemaVersion: "mugen-web-sandbox/asset-provenance/v0",
      status: "complete",
      canExport: true,
      inputDigest: { algorithm: "sha-256", digest: "a".repeat(64) },
      outputDigest: { algorithm: "sha-256", digest: "b".repeat(64) },
      sourceRef: "chars/kfm/kfm.def",
      tool: "mugen-loader",
      warnings: [],
    });
  });

  it("keeps incomplete digest evidence visible and non-exportable", () => {
    const record = createAssetProvenanceRecord({ asset: asset(), sourceFingerprint: "a".repeat(64) });

    expect(record).toMatchObject({
      status: "partial",
      canExport: false,
      warnings: ["Output content digest is missing."],
    });
  });

  it("blocks durable provenance when permission is not granted", () => {
    const record = createAssetProvenanceRecord({
      asset: asset(),
      sourceFingerprint: "a".repeat(64),
      outputDigest: "b".repeat(64),
      permission: "denied",
      requiresDurablePermission: true,
    });

    expect(record).toMatchObject({
      status: "blocked",
      canExport: false,
      warnings: ["Durable provenance permission is not granted."],
    });
  });

  it("redacts absolute local paths while preserving public and virtual paths", () => {
    expect(redactAssetSourcePath("C:\\Users\\cristian\\source\\kfm.def")).toBe("[local-path-redacted]");
    expect(redactAssetSourcePath("/characters/nova-boxer/manifest.json")).toBe("characters/nova-boxer/manifest.json");
    expect(redactAssetSourcePath("chars/kfm/kfm.def")).toBe("chars/kfm/kfm.def");
    expect(redactAssetSourcePath("chars/../private/kfm.def")).toBe("[local-path-redacted]");
  });
});

function asset(): StudioAssetRecord {
  return {
    id: "kfm-official",
    label: "Kung Fu Man",
    kind: "character",
    source: "mugen-import",
    status: "ok",
    detail: "imported character",
    tags: ["runtime-route"],
    severity: "info",
    affectedAssetId: "kfm-official",
    affectedSystem: "runtime",
    impact: "imported asset",
    evidenceIds: [],
    blockedBy: [],
    canExport: true,
    nextAction: { kind: "open-character-preview", label: "Open Character Preview", targetId: "kfm-official" },
  };
}
