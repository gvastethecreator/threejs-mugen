import type { StudioAssetRecord } from "./StudioModel";
import type { SourceFingerprintAlgorithm } from "./StudioSourceIdentity";
import type { SourceTransactionPermission } from "./StudioSourceTransaction";

export const ASSET_PROVENANCE_SCHEMA = "mugen-web-sandbox/asset-provenance/v0" as const;

export type AssetProvenanceStatus = "complete" | "partial" | "blocked";
export type AssetProvenancePermission = "not-required" | SourceTransactionPermission;
export type AssetProvenanceDigest = {
  algorithm: SourceFingerprintAlgorithm;
  digest: string;
};

export type AssetProvenanceRecord = {
  schemaVersion: typeof ASSET_PROVENANCE_SCHEMA;
  id: string;
  assetId: string;
  assetLabel: string;
  source: StudioAssetRecord["source"];
  status: AssetProvenanceStatus;
  permission: AssetProvenancePermission;
  requiresDurablePermission: boolean;
  inputDigest?: AssetProvenanceDigest;
  outputDigest?: AssetProvenanceDigest;
  sourceRef?: string;
  tool?: string;
  canExport: boolean;
  warnings: string[];
};

export type AssetProvenanceInput = {
  asset: StudioAssetRecord;
  sourceFingerprint?: string;
  outputDigest?: string;
  sourcePath?: string;
  tool?: string;
  permission?: AssetProvenancePermission;
  requiresDurablePermission?: boolean;
};

export function createAssetProvenanceRecord(input: AssetProvenanceInput): AssetProvenanceRecord {
  const permission = input.permission ?? "not-required";
  const requiresDurablePermission = input.requiresDurablePermission === true;
  const inputDigest = digestRecord(input.sourceFingerprint);
  const outputDigest = digestRecord(input.outputDigest);
  const sourceRef = redactAssetSourcePath(input.sourcePath);
  const warnings = [
    ...(!inputDigest ? ["Input content digest is missing."] : []),
    ...(!outputDigest ? ["Output content digest is missing."] : []),
    ...(requiresDurablePermission && permission !== "granted"
      ? ["Durable provenance permission is not granted."]
      : []),
    ...(sourceRef === "[local-path-redacted]" ? ["Absolute local source path was redacted from the provenance record."] : []),
  ];
  const blocked = requiresDurablePermission && permission !== "granted";
  const complete = Boolean(inputDigest && outputDigest);
  return {
    schemaVersion: ASSET_PROVENANCE_SCHEMA,
    id: `asset-provenance:${input.asset.id}`,
    assetId: input.asset.id,
    assetLabel: input.asset.label,
    source: input.asset.source,
    status: blocked ? "blocked" : complete ? "complete" : "partial",
    permission,
    requiresDurablePermission,
    ...(inputDigest ? { inputDigest } : {}),
    ...(outputDigest ? { outputDigest } : {}),
    ...(sourceRef ? { sourceRef } : {}),
    ...(input.tool ? { tool: input.tool } : {}),
    canExport: complete && !blocked,
    warnings: uniqueStrings(warnings),
  };
}

export function redactAssetSourcePath(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  const normalized = trimmed.replace(/\\/g, "/");
  if (/^\/(?:characters|stages|audio|assets)\//i.test(normalized)) {
    return normalized.slice(1);
  }
  if (/^(?:[a-z]:\/|\/\/|\/|file:)/i.test(normalized) || normalized.split("/").includes("..")) {
    return "[local-path-redacted]";
  }
  return normalized;
}

function digestRecord(value: string | undefined): AssetProvenanceDigest | undefined {
  if (!value || !/^[0-9a-f]{64}$/i.test(value)) {
    return undefined;
  }
  return { algorithm: "sha-256", digest: value.toLowerCase() };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
