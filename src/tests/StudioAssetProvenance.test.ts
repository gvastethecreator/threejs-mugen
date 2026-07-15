import { describe, expect, it } from "vitest";
import {
  ASSET_PROVENANCE_SCHEMA,
  ASSET_PROVENANCE_SCHEMA_V1,
  canonicalizeAssetProvenanceRecord,
  createAssetProvenanceRecord,
  migrateAssetProvenanceRecord,
  redactAssetSourcePath,
} from "../app/StudioAssetProvenance";
import type { StudioAssetRecord } from "../app/StudioModel";

describe("StudioAssetProvenance", () => {
  it("records a complete v2 transform chain only with license, digest, and tool evidence", () => {
    const record = createAssetProvenanceRecord(completeInput());

    expect(record).toMatchObject({
      schemaVersion: ASSET_PROVENANCE_SCHEMA,
      status: "complete",
      canExport: true,
      license: { status: "declared", expression: "CC0-1.0", verified: true },
      entityId: "entity:kfm",
      activityId: "activity:import:kfm",
      agentId: "agent:loader",
      transforms: [{ order: 1, tool: "mugen-loader", version: "1.0.0" }],
      qaLinks: [{ id: "qa:smoke", status: "pass" }],
      warnings: [],
    });
    expect(record.inputDigest).toEqual({ algorithm: "sha-256", digest: "a".repeat(64) });
    expect(record.outputDigest).toEqual({ algorithm: "sha-256", digest: "b".repeat(64) });
  });

  it("accepts complete per-file input and output coverage without an aggregate shortcut", () => {
    const record = createAssetProvenanceRecord({
      ...completeInput(),
      sourceFingerprint: undefined,
      outputDigest: undefined,
      inputFiles: [{ path: "chars/kfm/kfm.sff", digest: "A".repeat(64), byteLength: 12 }],
      outputFiles: [{ path: "assets/imported/kfm/kfm.sff", digest: "B".repeat(64), byteLength: 12 }],
    });

    expect(record).toMatchObject({
      status: "complete",
      canExport: true,
      inputFiles: [{ path: "chars/kfm/kfm.sff", bytes: 12, digest: { digest: "a".repeat(64) } }],
      outputFiles: [{ path: "assets/imported/kfm/kfm.sff", bytes: 12, digest: { digest: "b".repeat(64) } }],
    });
  });

  it("keeps incomplete per-file output coverage partial and non-exportable", () => {
    const record = createAssetProvenanceRecord({
      ...completeInput(),
      sourceFingerprint: undefined,
      outputDigest: undefined,
      inputFiles: [{ path: "chars/kfm/kfm.sff", digest: "a".repeat(64), byteLength: 12 }],
      outputFiles: [{ path: "assets/imported/kfm/kfm.sff", byteLength: 12 }],
    });

    expect(record).toMatchObject({
      status: "partial",
      canExport: false,
      warnings: expect.arrayContaining(["Output file digest coverage is incomplete."]),
    });
  });

  it("blocks export readiness when the license assertion is missing", () => {
    const record = createAssetProvenanceRecord({
      ...completeInput(),
      license: undefined,
    });

    expect(record).toMatchObject({
      status: "blocked",
      canExport: false,
      license: { status: "unknown", verified: false },
      warnings: expect.arrayContaining(["License SPDX assertion is missing or unverified."]),
    });
  });

  it("keeps missing digest evidence visible and non-exportable", () => {
    const record = createAssetProvenanceRecord({
      ...completeInput(),
      outputDigest: undefined,
      outputFiles: [],
    });

    expect(record).toMatchObject({
      status: "partial",
      canExport: false,
      warnings: expect.arrayContaining(["Output content digest is missing."]),
    });
  });

  it("blocks durable provenance when permission is not granted", () => {
    const record = createAssetProvenanceRecord({
      ...completeInput(),
      permission: "denied",
      requiresDurablePermission: true,
    });

    expect(record).toMatchObject({
      status: "blocked",
      canExport: false,
      warnings: expect.arrayContaining(["Durable provenance permission is not granted."]),
    });
  });

  it("migrates v1 records without inventing license, version, or agent certainty", () => {
    const record = migrateAssetProvenanceRecord({
      schemaVersion: ASSET_PROVENANCE_SCHEMA_V1,
      id: "asset-provenance:kfm-official",
      assetId: "kfm-official",
      assetLabel: "Kung Fu Man",
      source: "mugen-import",
      status: "complete",
      permission: "not-required",
      requiresDurablePermission: false,
      inputDigest: { algorithm: "sha-256", digest: "a".repeat(64) },
      outputDigest: { algorithm: "sha-256", digest: "b".repeat(64) },
      inputFiles: [],
      outputFiles: [],
      sourceRef: "chars/kfm/kfm.def",
      tool: "mugen-loader",
      canExport: true,
      warnings: [],
    });

    expect(record).toMatchObject({
      schemaVersion: ASSET_PROVENANCE_SCHEMA,
      status: "blocked",
      canExport: false,
      license: { status: "unknown", verified: false },
      activityId: "asset-activity:unknown:kfm-official",
      agentId: "agent:unknown",
      transforms: [{ kind: "legacy", tool: "mugen-loader", version: "unknown" }],
    });
    expect(record.warnings).toEqual(expect.arrayContaining([
      "Migrated from AssetProvenance/v1; missing v2 facts remain unknown.",
      "License SPDX assertion is missing or unverified.",
    ]));
  });

  it("redacts paths and serializes the same v2 record canonically", () => {
    const record = createAssetProvenanceRecord({
      ...completeInput(),
      sourcePath: "C:\\Users\\cristian\\source\\kfm.def",
      transforms: [
        ...(completeInput().transforms ?? []),
        {
          id: "normalize",
          kind: "normalize",
          tool: "normalizer",
          version: "1.0.0",
          configDigest: "C".repeat(64),
          inputPaths: ["C:\\Users\\cristian\\source\\kfm.def"],
          outputPaths: ["assets/kfm/normalized.def"],
        },
      ],
    });
    const reordered = createAssetProvenanceRecord({
      ...completeInput(),
      transforms: [...(completeInput().transforms ?? [])].reverse(),
      qaLinks: [...(completeInput().qaLinks ?? [])].reverse(),
    });

    expect(redactAssetSourcePath("C:\\Users\\cristian\\source\\kfm.def")).toBe("[local-path-redacted]");
    expect(record.sourceRef).toBe("[local-path-redacted]");
    expect(record.transforms[1]?.inputPaths).toEqual(["[local-path-redacted]"]);
    expect(canonicalizeAssetProvenanceRecord(reordered)).not.toBe("");
    expect(canonicalizeAssetProvenanceRecord(record)).not.toContain("C:/Users/cristian");
  });
});

function completeInput() {
  return {
    asset: asset(),
    sourceFingerprint: "A".repeat(64),
    outputDigest: "B".repeat(64),
    sourcePath: "chars/kfm/kfm.def",
    tool: "mugen-loader",
    toolVersion: "1.0.0",
    license: { expression: "CC0-1.0", sourceRef: "LICENSE.txt", verified: true },
    entityId: "entity:kfm",
    activityId: "activity:import:kfm",
    agentId: "agent:loader",
    transforms: [{
      id: "import",
      kind: "source-import" as const,
      tool: "mugen-loader",
      version: "1.0.0",
      configDigest: "C".repeat(64),
      inputPaths: ["chars/kfm/kfm.def"],
      outputPaths: ["runtime/kfm"],
    }],
    qaLinks: [{ id: "qa:smoke", kind: "qa" as const, status: "pass" as const, reference: "trace:kfm" }],
  };
}

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
