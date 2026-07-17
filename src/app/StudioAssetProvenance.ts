import type { StudioAssetRecord } from "./StudioModel";
import type { SourceFingerprintAlgorithm } from "./StudioSourceIdentity";
import type { SourceTransactionPermission } from "./StudioSourceTransaction";
import { STUDIO_LICENSE_EXPRESSION_PROFILE, isSupportedStudioLicenseExpression } from "./StudioLicenseExpression";

export const ASSET_PROVENANCE_SCHEMA_V1 = "mugen-web-sandbox/asset-provenance/v1" as const;
export const ASSET_PROVENANCE_SCHEMA = "mugen-web-sandbox/asset-provenance/v2" as const;
export const ASSET_PROVENANCE_TOOL_VERSION = "mugen-web-sandbox@0.0.0" as const;
export const ASSET_PROVENANCE_IMPORT_CONFIG_DIGEST = "9828b7bd168c53a6bf59579b6632f54e077052451975bc36d78ae469c4fea691" as const;
export const ASSET_PROVENANCE_EXPORT_CONFIG_DIGEST = "3f16a1479ee9a4583b192837206af057cb62fd0f9e0245ba1b65b55c3769311b" as const;

export type AssetProvenanceStatus = "complete" | "partial" | "blocked";
export type AssetProvenancePermission = "not-required" | SourceTransactionPermission;
export type AssetProvenanceDigest = {
  algorithm: SourceFingerprintAlgorithm;
  digest: string;
};

export type AssetProvenanceLicenseInput = {
  expression?: string;
  sourceRef?: string;
  verified?: boolean;
};

export type AssetProvenanceLicense = {
  status: "declared" | "unknown";
  expression?: string;
  profile?: typeof STUDIO_LICENSE_EXPRESSION_PROFILE;
  sourceRef?: string;
  verified: boolean;
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

export type AssetProvenanceTransformKind = "source-import" | "normalize" | "compile" | "atlas" | "bundle" | "legacy" | "other";

export type AssetProvenanceTransformInput = {
  id?: string;
  kind: AssetProvenanceTransformKind;
  tool?: string;
  version?: string;
  configDigest?: string;
  inputPaths?: string[];
  outputPaths?: string[];
};

export type AssetProvenanceTransform = {
  id: string;
  order: number;
  kind: AssetProvenanceTransformKind;
  tool: string;
  version: string;
  configDigest?: AssetProvenanceDigest;
  inputPaths: string[];
  outputPaths: string[];
};

export type AssetProvenanceQaLink = {
  id: string;
  kind: "qa" | "collision" | "playtest";
  status: "pass" | "fail" | "unknown";
  reference: string;
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
  license: AssetProvenanceLicense;
  entityId: string;
  activityId: string;
  agentId: string;
  inputDigest?: AssetProvenanceDigest;
  outputDigest?: AssetProvenanceDigest;
  inputFiles: AssetProvenanceFileRecord[];
  outputFiles: AssetProvenanceFileRecord[];
  transforms: AssetProvenanceTransform[];
  qaLinks: AssetProvenanceQaLink[];
  sourceRef?: string;
  tool?: string;
  toolVersion?: string;
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
  toolVersion?: string;
  permission?: AssetProvenancePermission;
  requiresDurablePermission?: boolean;
  license?: AssetProvenanceLicenseInput;
  entityId?: string;
  activityId?: string;
  agentId?: string;
  transforms?: AssetProvenanceTransformInput[];
  qaLinks?: AssetProvenanceQaLink[];
  additionalWarnings?: string[];
};

export type AssetProvenanceV1Record = {
  schemaVersion: typeof ASSET_PROVENANCE_SCHEMA_V1;
  id: string;
  assetId: string;
  assetLabel: string;
  source: StudioAssetRecord["source"];
  status: "complete" | "partial" | "blocked";
  permission: AssetProvenancePermission;
  requiresDurablePermission: boolean;
  inputDigest?: { algorithm: SourceFingerprintAlgorithm; digest: string };
  outputDigest?: { algorithm: SourceFingerprintAlgorithm; digest: string };
  inputFiles: AssetProvenanceFileRecord[];
  outputFiles: AssetProvenanceFileRecord[];
  sourceRef?: string;
  tool?: string;
  canExport: boolean;
  warnings: string[];
};

export function createAssetProvenanceRecord(input: AssetProvenanceInput): AssetProvenanceRecord {
  const permission = input.permission ?? "not-required";
  const requiresDurablePermission = input.requiresDurablePermission === true;
  const inputDigest = digestRecord(input.sourceFingerprint);
  const outputDigest = digestRecord(input.outputDigest);
  const inputFiles = normalizeFileRecords(input.inputFiles);
  const outputFiles = normalizeFileRecords(input.outputFiles);
  const sourceRef = redactAssetSourcePath(input.sourcePath);
  const license = normalizeLicense(input.license);
  const transforms = normalizeTransforms(input.transforms);
  const qaLinks = normalizeQaLinks(input.qaLinks);
  const inputFileCoverageComplete = inputFiles.length > 0 && inputFiles.every((file) => Boolean(file.digest));
  const outputFileCoverageComplete = outputFiles.length > 0 && outputFiles.every((file) => Boolean(file.digest));
  const inputEvidenceComplete = inputFiles.length > 0 ? inputFileCoverageComplete : Boolean(inputDigest);
  const outputEvidenceComplete = outputFiles.length > 0 ? outputFileCoverageComplete : Boolean(outputDigest);
  const transformEvidenceComplete = transforms.length > 0 && transforms.every(isCompleteTransform);
  const legalBlocked = license.status !== "declared" || license.verified !== true;
  const permissionBlocked = requiresDurablePermission && permission !== "granted";
  const complete = inputEvidenceComplete && outputEvidenceComplete && transformEvidenceComplete;
  const warnings = [
    ...(!inputEvidenceComplete ? [inputFiles.length ? "Input file digest coverage is incomplete." : "Input content digest is missing."] : []),
    ...(!outputEvidenceComplete ? [outputFiles.length ? "Output file digest coverage is incomplete." : "Output content digest is missing."] : []),
    ...(!transformEvidenceComplete
      ? [transforms.length ? "Transform evidence is incomplete." : "No transform records are present."]
      : []),
    ...(transforms.some((transform) => !transform.configDigest) ? ["Transform configuration digest is missing."] : []),
    ...(qaLinks.length === 0 ? ["No QA, collision, or playtest links are recorded."] : []),
    ...(legalBlocked ? ["License SPDX assertion is missing or unverified."] : []),
    ...(permissionBlocked ? ["Durable provenance permission is not granted."] : []),
    ...(sourceRef === "[local-path-redacted]" ? ["Absolute local source path was redacted from the provenance record."] : []),
    ...(input.additionalWarnings ?? []),
  ];
  const blocked = legalBlocked || permissionBlocked;
  return {
    schemaVersion: ASSET_PROVENANCE_SCHEMA,
    id: `asset-provenance:${input.asset.id}`,
    assetId: input.asset.id,
    assetLabel: input.asset.label,
    source: input.asset.source,
    status: blocked ? "blocked" : complete ? "complete" : "partial",
    permission,
    requiresDurablePermission,
    license,
    entityId: normalizeId(input.entityId, `asset-entity:${input.asset.id}`),
    activityId: normalizeId(input.activityId, `asset-activity:${input.asset.id}`),
    agentId: normalizeId(input.agentId, "agent:mugen-web-sandbox"),
    ...(inputDigest ? { inputDigest } : {}),
    ...(outputDigest ? { outputDigest } : {}),
    inputFiles,
    outputFiles,
    transforms,
    qaLinks,
    ...(sourceRef ? { sourceRef } : {}),
    ...(input.tool?.trim() ? { tool: input.tool.trim() } : {}),
    ...(input.toolVersion?.trim() ? { toolVersion: input.toolVersion.trim() } : {}),
    canExport: complete && !blocked,
    warnings: uniqueStrings(warnings),
  };
}

export function migrateAssetProvenanceRecord(value: AssetProvenanceV1Record): AssetProvenanceRecord {
  const inputFiles = value.inputFiles.map((file) => ({
    path: file.path,
    ...(file.digest ? { digest: file.digest.digest } : {}),
    ...(file.bytes !== undefined ? { byteLength: file.bytes } : {}),
  }));
  const outputFiles = value.outputFiles.map((file) => ({
    path: file.path,
    ...(file.digest ? { digest: file.digest.digest } : {}),
    ...(file.bytes !== undefined ? { byteLength: file.bytes } : {}),
  }));
  return createAssetProvenanceRecord({
    asset: {
      id: value.assetId,
      label: value.assetLabel,
      kind: "report",
      source: value.source,
      status: "ok",
      detail: "Migrated asset provenance record",
      tags: [],
      severity: "info",
      affectedAssetId: value.assetId,
      affectedSystem: "studio",
      impact: "Legacy provenance requires explicit v2 assertions before export.",
      evidenceIds: [],
      blockedBy: [],
      canExport: false,
      nextAction: { kind: "open-build", label: "Review provenance", targetId: value.assetId },
    },
    sourceFingerprint: value.inputDigest?.digest,
    outputDigest: value.outputDigest?.digest,
    inputFiles,
    outputFiles,
    sourcePath: value.sourceRef,
    tool: value.tool,
    permission: value.permission,
    requiresDurablePermission: value.requiresDurablePermission,
    license: { sourceRef: value.sourceRef, verified: false },
    entityId: `asset-entity:${value.assetId}`,
    activityId: `asset-activity:unknown:${value.assetId}`,
    agentId: "agent:unknown",
    transforms: [{
      id: `legacy-v1:${value.assetId}`,
      kind: "legacy",
      tool: value.tool,
      version: "unknown",
      inputPaths: inputFiles.map((file) => file.path),
      outputPaths: outputFiles.map((file) => file.path),
    }],
    additionalWarnings: ["Migrated from AssetProvenance/v1; missing v2 facts remain unknown."],
  });
}

export function canonicalizeAssetProvenanceRecord(record: AssetProvenanceRecord): string {
  return stableStringify(record);
}

function normalizeLicense(input: AssetProvenanceLicenseInput | undefined): AssetProvenanceLicense {
  const expression = input?.expression?.trim();
  const sourceRef = redactAssetSourcePath(input?.sourceRef);
  const validExpression = Boolean(expression && isSupportedStudioLicenseExpression(expression));
  const verified = input?.verified === true && validExpression;
  return {
    status: verified ? "declared" : "unknown",
    ...(validExpression && expression ? { expression } : {}),
    ...(verified ? { profile: STUDIO_LICENSE_EXPRESSION_PROFILE } : {}),
    ...(sourceRef ? { sourceRef } : {}),
    verified,
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

function normalizeTransforms(values: AssetProvenanceTransformInput[] | undefined): AssetProvenanceTransform[] {
  const unique = new Map<string, AssetProvenanceTransform>();
  for (const [index, value] of (values ?? []).entries()) {
    const id = normalizeId(value.id, `transform-${index + 1}`);
    const transform: AssetProvenanceTransform = {
      id,
      order: index + 1,
      kind: value.kind,
      tool: value.tool?.trim() || "unknown",
      version: value.version?.trim() || "unknown",
      ...(digestRecord(value.configDigest) ? { configDigest: digestRecord(value.configDigest) } : {}),
      inputPaths: normalizePaths(value.inputPaths),
      outputPaths: normalizePaths(value.outputPaths),
    };
    unique.set(id.toLowerCase(), transform);
  }
  return [...unique.values()].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

function normalizeQaLinks(values: AssetProvenanceQaLink[] | undefined): AssetProvenanceQaLink[] {
  const unique = new Map<string, AssetProvenanceQaLink>();
  for (const value of values ?? []) {
    const id = value.id.trim();
    const reference = redactAssetSourcePath(value.reference);
    if (!id || !reference) {
      continue;
    }
    unique.set(id.toLowerCase(), { id, kind: value.kind, status: value.status, reference });
  }
  return [...unique.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function normalizePaths(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map((value) => redactAssetSourcePath(value)).filter((value): value is string => Boolean(value)))].sort((left, right) => left.localeCompare(right));
}

function isCompleteTransform(transform: AssetProvenanceTransform): boolean {
  return transform.tool !== "unknown" && transform.version !== "unknown" && Boolean(transform.configDigest) && transform.inputPaths.length > 0 && transform.outputPaths.length > 0;
}

export function redactAssetSourcePath(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  const normalized = trimmed.replace(/\\/g, "/");
  const isPublicPath = /^\/(?:characters|stages|audio|assets)\//i.test(normalized);
  if (normalized.split("/").includes("..") || /^(?:[a-z]:|\/\/|file:)/i.test(normalized) || (/^\//.test(normalized) && !isPublicPath)) {
    return "[local-path-redacted]";
  }
  if (isPublicPath) {
    return normalized.slice(1);
  }
  return normalized;
}

function digestRecord(value: string | undefined): AssetProvenanceDigest | undefined {
  if (!value || !/^[0-9a-f]{64}$/i.test(value)) {
    return undefined;
  }
  return { algorithm: "sha-256", digest: value.toLowerCase() };
}


function normalizeId(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
