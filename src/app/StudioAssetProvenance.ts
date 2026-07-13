import type { StudioAssetRecord } from "./StudioModel";
import type { SourceFingerprintAlgorithm } from "./StudioSourceIdentity";
import type { SourceTransactionPermission } from "./StudioSourceTransaction";

export const ASSET_PROVENANCE_SCHEMA = "mugen-web-sandbox/asset-provenance/v1" as const;

export type AssetProvenanceStatus = "complete" | "partial" | "blocked";
export type AssetProvenancePermission = "not-required" | SourceTransactionPermission;
export type AssetProvenanceDigest = {
  algorithm: SourceFingerprintAlgorithm;
  digest: string;
};

export type AssetProvenanceFileInput = {
  path: string;
  digest?: string;
  byteLength?: number;
};

export type AssetProvenanceFileRecord = {
  path: string;
  bytes?: number;
  digest?: AssetProvenanceDigest;
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
  inputFiles: AssetProvenanceFileRecord[];
  outputFiles: AssetProvenanceFileRecord[];
  sourceRef?: string;
  tool?: string;
  canExport: boolean;
  warnings: string[];
};

export type AssetProvenanceInput = {
  asset: StudioAssetRecord;
  sourceFingerprint?: string;
  outputDigest?: string;
  inputFiles?: AssetProvenanceFileInput[];
  outputFiles?: AssetProvenanceFileInput[];
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
  const inputFiles = normalizeFileRecords(input.inputFiles);
  const outputFiles = normalizeFileRecords(input.outputFiles);
  const sourceRef = redactAssetSourcePath(input.sourcePath);
  const inputFileCoverageComplete = inputFiles.length > 0 && inputFiles.every((file) => Boolean(file.digest));
  const outputFileCoverageComplete = outputFiles.length > 0 && outputFiles.every((file) => Boolean(file.digest));
  const warnings = [
    ...(!inputDigest && !inputFileCoverageComplete ? [inputFiles.length ? "Input file digest coverage is incomplete." : "Input content digest is missing."] : []),
    ...(!outputDigest && !outputFileCoverageComplete ? [outputFiles.length ? "Output file digest coverage is incomplete." : "Output content digest is missing."] : []),
    ...(requiresDurablePermission && permission !== "granted"
      ? ["Durable provenance permission is not granted."]
      : []),
    ...(sourceRef === "[local-path-redacted]" ? ["Absolute local source path was redacted from the provenance record."] : []),
  ];
  const blocked = requiresDurablePermission && permission !== "granted";
  const inputEvidenceComplete = inputFiles.length > 0 ? inputFileCoverageComplete : Boolean(inputDigest);
  const outputEvidenceComplete = outputFiles.length > 0 ? outputFileCoverageComplete : Boolean(outputDigest);
  const complete = inputEvidenceComplete && outputEvidenceComplete;
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
    inputFiles,
    outputFiles,
    ...(sourceRef ? { sourceRef } : {}),
    ...(input.tool ? { tool: input.tool } : {}),
    canExport: complete && !blocked,
    warnings: uniqueStrings(warnings),
  };
}

function normalizeFileRecords(values: AssetProvenanceFileInput[] | undefined): AssetProvenanceFileRecord[] {
  const records = (values ?? []).flatMap((value) => {
    const path = redactAssetSourcePath(value.path);
    if (!path) {
      return [];
    }
    const digest = digestRecord(value.digest);
    const bytes = typeof value.byteLength === "number" && Number.isSafeInteger(value.byteLength) && value.byteLength >= 0
      ? value.byteLength
      : undefined;
    return [{
      path,
      ...(bytes !== undefined ? { bytes } : {}),
      ...(digest ? { digest } : {}),
    } satisfies AssetProvenanceFileRecord];
  });
  const unique = new Map<string, AssetProvenanceFileRecord>();
  for (const record of records) {
    unique.set(record.path.toLowerCase(), record);
  }
  return [...unique.values()].sort((left, right) => left.path.localeCompare(right.path));
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
