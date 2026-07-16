import type { SourceTransactionPermission } from "./StudioSourceTransaction";

export const SOURCE_WRITE_RECEIPT_SCHEMA = "mugen-web-sandbox/source-write-receipt/v0" as const;

export type SourceWriteReceiptStatus = "committed" | "blocked" | "rejected" | "failed";
export type SourceWriteReceiptReason =
  | "semantic-preflight"
  | "plan-blocked"
  | "permission"
  | "project-conflict"
  | "source-changed"
  | "write-and-reimport"
  | "reimport-rejected"
  | "write-failed";

export type SourceWriteReceipt = {
  schemaVersion: typeof SOURCE_WRITE_RECEIPT_SCHEMA;
  id: string;
  sourcePackageId: string;
  sourceName: string;
  path: string;
  status: SourceWriteReceiptStatus;
  reason: SourceWriteReceiptReason;
  observedAt: string;
  operation: "directory-exclusive-write-and-reimport";
  permission?: SourceTransactionPermission;
  baseSourceFingerprint?: string;
  observedSourceFingerprint?: string;
  committedSourceFingerprint?: string;
  baseProjectRevision?: number;
  observedProjectRevision?: number;
  draftDigest?: string;
  committedDigest?: string;
  byteLength?: number;
  invalidatedOutputs: string[];
  diagnostics: string[];
  digest: string;
};

export type SourceWriteReceiptParseResult = {
  receipt?: SourceWriteReceipt;
  diagnostics: string[];
};

export function createSourceWriteReceipt(
  input: Omit<SourceWriteReceipt, "schemaVersion" | "digest">,
): SourceWriteReceipt {
  const payload: Omit<SourceWriteReceipt, "digest"> = {
    schemaVersion: SOURCE_WRITE_RECEIPT_SCHEMA,
    id: input.id,
    sourcePackageId: input.sourcePackageId,
    sourceName: input.sourceName,
    path: input.path,
    status: input.status,
    reason: input.reason,
    observedAt: input.observedAt,
    operation: input.operation,
    ...(input.permission ? { permission: input.permission } : {}),
    ...(input.baseSourceFingerprint ? { baseSourceFingerprint: input.baseSourceFingerprint } : {}),
    ...(input.observedSourceFingerprint ? { observedSourceFingerprint: input.observedSourceFingerprint } : {}),
    ...(input.committedSourceFingerprint ? { committedSourceFingerprint: input.committedSourceFingerprint } : {}),
    ...(input.baseProjectRevision !== undefined ? { baseProjectRevision: input.baseProjectRevision } : {}),
    ...(input.observedProjectRevision !== undefined ? { observedProjectRevision: input.observedProjectRevision } : {}),
    ...(input.draftDigest ? { draftDigest: input.draftDigest } : {}),
    ...(input.committedDigest ? { committedDigest: input.committedDigest } : {}),
    ...(input.byteLength !== undefined ? { byteLength: input.byteLength } : {}),
    invalidatedOutputs: [...input.invalidatedOutputs],
    diagnostics: [...input.diagnostics],
  };
  return { ...payload, digest: hashStableJson(payload) };
}

export function parseSourceWriteReceipt(value: unknown): SourceWriteReceiptParseResult {
  const diagnostics: string[] = [];
  if (!isRecord(value)) return { diagnostics: ["Source write receipt must be an object"] };
  if (value.schemaVersion !== SOURCE_WRITE_RECEIPT_SCHEMA) diagnostics.push("Source write receipt has an unsupported schema");
  for (const key of ["id", "sourcePackageId", "sourceName", "path", "observedAt"] as const) {
    if (!nonEmptyString(value[key])) diagnostics.push(`Source write receipt is missing ${key}`);
  }
  if (!isReceiptStatus(value.status)) diagnostics.push("Source write receipt has an invalid status");
  if (!isReceiptReason(value.reason)) diagnostics.push("Source write receipt has an invalid reason");
  if (value.operation !== "directory-exclusive-write-and-reimport") diagnostics.push("Source write receipt has an invalid operation");
  if (!isIsoDate(value.observedAt)) diagnostics.push("Source write receipt observedAt is invalid");
  if (value.permission !== undefined && !isPermission(value.permission)) diagnostics.push("Source write receipt permission is invalid");
  for (const key of ["baseProjectRevision", "observedProjectRevision", "byteLength"] as const) {
    if (value[key] !== undefined && !isNonNegativeSafeInteger(value[key])) {
      diagnostics.push(`Source write receipt ${key} is invalid`);
    }
  }
  for (const key of ["baseSourceFingerprint", "observedSourceFingerprint", "committedSourceFingerprint", "draftDigest", "committedDigest"] as const) {
    if (value[key] !== undefined && !nonEmptyString(value[key])) {
      diagnostics.push(`Source write receipt ${key} is invalid`);
    }
  }
  if (!Array.isArray(value.invalidatedOutputs) || !value.invalidatedOutputs.every((item) => typeof item === "string")) {
    diagnostics.push("Source write receipt invalidatedOutputs must be string[]");
  }
  if (!Array.isArray(value.diagnostics) || !value.diagnostics.every((item) => typeof item === "string")) {
    diagnostics.push("Source write receipt diagnostics must be string[]");
  }
  if (!nonEmptyString(value.digest)) diagnostics.push("Source write receipt digest is missing");
  if (diagnostics.length) return { diagnostics };
  const candidate = {
    schemaVersion: SOURCE_WRITE_RECEIPT_SCHEMA,
    id: String(value.id),
    sourcePackageId: String(value.sourcePackageId),
    sourceName: String(value.sourceName),
    path: String(value.path),
    status: value.status as SourceWriteReceiptStatus,
    reason: value.reason as SourceWriteReceiptReason,
    observedAt: String(value.observedAt),
    operation: "directory-exclusive-write-and-reimport" as const,
    ...(value.permission !== undefined ? { permission: value.permission as SourceTransactionPermission } : {}),
    ...optionalString(value, "baseSourceFingerprint"),
    ...optionalString(value, "observedSourceFingerprint"),
    ...optionalString(value, "committedSourceFingerprint"),
    ...optionalNumber(value, "baseProjectRevision"),
    ...optionalNumber(value, "observedProjectRevision"),
    ...optionalString(value, "draftDigest"),
    ...optionalString(value, "committedDigest"),
    ...optionalNumber(value, "byteLength"),
    invalidatedOutputs: [...(value.invalidatedOutputs as string[])],
    diagnostics: [...(value.diagnostics as string[])],
  } satisfies Omit<SourceWriteReceipt, "digest">;
  const expectedDigest = hashStableJson(candidate);
  if (String(value.digest) !== expectedDigest) return { diagnostics: ["Source write receipt digest mismatch"] };
  return { diagnostics: [], receipt: { ...candidate, digest: String(value.digest) } };
}

export function isSourceWriteReceiptCommitted(receipt: SourceWriteReceipt | undefined): boolean {
  return receipt?.status === "committed" && Boolean(receipt.committedSourceFingerprint) && Boolean(receipt.committedDigest);
}

function optionalString(value: Record<string, unknown>, key: string): Record<string, string> {
  return typeof value[key] === "string" && value[key].length > 0 ? { [key]: value[key] as string } : {};
}

function optionalNumber(value: Record<string, unknown>, key: string): Record<string, number> {
  return isNonNegativeSafeInteger(value[key]) ? { [key]: value[key] as number } : {};
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isReceiptStatus(value: unknown): value is SourceWriteReceiptStatus {
  return value === "committed" || value === "blocked" || value === "rejected" || value === "failed";
}

function isReceiptReason(value: unknown): value is SourceWriteReceiptReason {
  return value === "semantic-preflight" || value === "plan-blocked" || value === "permission" || value === "project-conflict" ||
    value === "source-changed" || value === "write-and-reimport" || value === "reimport-rejected" || value === "write-failed";
}

function isPermission(value: unknown): value is SourceTransactionPermission {
  return value === "not-requested" || value === "prompt" || value === "granted" || value === "denied" || value === "revoked" || value === "unsupported";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hashStableJson(value: unknown): string {
  let hash = 0x811c9dc5;
  for (const character of stableStringify(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(",")}}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
