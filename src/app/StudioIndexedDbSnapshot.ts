/**
 * StudioIndexedDbSnapshot/v1 (DA28-21/22 bounded).
 * IndexedDB-backed project snapshot + source-write intent with real preimage bytes.
 * Falls back to in-memory map when IndexedDB is unavailable (unit/node).
 */

import { parseSourceWriteReceipt, type SourceWriteReceipt } from "./StudioSourceWriteReceipt";
import type { SourceTransactionPermission } from "./StudioSourceTransaction";

export const STUDIO_INDEXEDDB_SNAPSHOT_SCHEMA = "StudioIndexedDbSnapshot/v1" as const;
export const STUDIO_SOURCE_WRITE_INTENT_SCHEMA = "StudioSourceWriteIntent/v1" as const;
export const STUDIO_INDEXEDDB_SNAPSHOT_DB_NAME = "mugen-web-sandbox-studio";
export const STUDIO_INDEXEDDB_SNAPSHOT_DB_VERSION = 1;

export type StudioIndexedDbSnapshotBackend = "indexeddb" | "memory";
export type StudioSourceWriteIntentPhase = "preimage-captured" | "write-closed" | "reimported" | "settled";
export type StudioSourceWriteObservationStatus = "needs-observation" | "matches-preimage" | "matches-draft" | "changed" | "unavailable";
export type StudioSourceWriteRecoveryDecision = "retry" | "abandon";
export type StudioSourceWriteObservation = {
  status: StudioSourceWriteObservationStatus;
  observedAt?: string;
  digest?: string;
  byteLength?: number;
  permission?: SourceTransactionPermission;
  diagnostics: string[];
};

export type StudioIndexedDbSnapshotDiagnostics = {
  schema: typeof STUDIO_INDEXEDDB_SNAPSHOT_SCHEMA;
  database: string;
  backend: StudioIndexedDbSnapshotBackend;
  authoritative: boolean;
  lastError?: string;
};

export type StudioProjectSnapshotRecord = {
  schema: typeof STUDIO_INDEXEDDB_SNAPSHOT_SCHEMA;
  projectId: string;
  revision: number;
  authoritySha: string;
  analysisDigest?: string;
  assetClosureDigest?: string;
  evidenceRefs: string[];
  payload: string;
  savedAt: string;
};

export type StudioSourceWriteIntent = {
  schema: typeof STUDIO_SOURCE_WRITE_INTENT_SCHEMA;
  intentId: string;
  path: string;
  preimageBytes: number[];
  preimageSha256: string;
  projectId?: string;
  sourcePackageId?: string;
  baseSourceFingerprint?: string;
  draftDigest?: string;
  byteLength?: number;
  phase: StudioSourceWriteIntentPhase;
  writeByteLength?: number;
  observedSourceFingerprint?: string;
  receiptId?: string;
  receipt?: SourceWriteReceipt;
  observation?: StudioSourceWriteObservation;
  result?: "committed" | "aborted" | "denied";
  recovery?: "restored" | "observed" | "none";
  recoveryDecision?: StudioSourceWriteRecoveryDecision;
  recoveryAttempt?: number;
  recoveryDecidedAt?: string;
  createdAt: string;
};

type MemoryDb = {
  snapshots: Map<string, StudioProjectSnapshotRecord>;
  intents: Map<string, StudioSourceWriteIntent>;
};

const memory: MemoryDb = {
  snapshots: new Map(),
  intents: new Map(),
};

const indexedDbFactory = typeof indexedDB === "undefined" ? undefined : indexedDB;
let backend: StudioIndexedDbSnapshotBackend = indexedDbFactory ? "indexeddb" : "memory";
let lastError: string | undefined;

export function getStudioIndexedDbSnapshotDiagnostics(): StudioIndexedDbSnapshotDiagnostics {
  return {
    schema: STUDIO_INDEXEDDB_SNAPSHOT_SCHEMA,
    database: STUDIO_INDEXEDDB_SNAPSHOT_DB_NAME,
    backend,
    authoritative: backend === "indexeddb",
    ...(lastError ? { lastError } : {}),
  };
}

export async function retryStudioIndexedDbSnapshot(): Promise<StudioIndexedDbSnapshotDiagnostics> {
  if (!indexedDbFactory) return getStudioIndexedDbSnapshotDiagnostics();
  backend = "indexeddb";
  lastError = undefined;
  try {
    const db = await openDb();
    db.close();
  } catch (error) {
    failover(error);
  }
  return getStudioIndexedDbSnapshotDiagnostics();
}

export async function saveProjectSnapshot(
  record: StudioProjectSnapshotRecord,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!record.projectId.trim()) return { ok: false, reason: "missing-project-id" };
  if (!Number.isFinite(record.revision) || record.revision < 0) {
    return { ok: false, reason: "bad-revision" };
  }
  memory.snapshots.set(record.projectId, record);
  if (backend === "indexeddb" && indexedDbFactory) {
    try {
      await idbPut("snapshots", record.projectId, record);
    } catch (error) {
      failover(error);
    }
  }
  return { ok: true };
}

export async function loadProjectSnapshot(
  projectId: string,
): Promise<StudioProjectSnapshotRecord | undefined> {
  if (backend === "indexeddb" && indexedDbFactory) {
    try {
      const fromIdb = await idbGet<StudioProjectSnapshotRecord>("snapshots", projectId);
      if (fromIdb) return fromIdb;
    } catch (error) {
      failover(error);
    }
  }
  return memory.snapshots.get(projectId);
}

export async function saveSourceWriteIntent(intent: {
  intentId: string;
  path: string;
  preimage: Uint8Array;
  projectId?: string;
  sourcePackageId?: string;
  baseSourceFingerprint?: string;
  draftDigest?: string;
  byteLength?: number;
  phase?: StudioSourceWriteIntentPhase;
  writeByteLength?: number;
  observedSourceFingerprint?: string;
  receiptId?: string;
  receipt?: SourceWriteReceipt;
  observation?: StudioSourceWriteObservation;
  result?: StudioSourceWriteIntent["result"];
  recovery?: StudioSourceWriteIntent["recovery"];
  recoveryDecision?: StudioSourceWriteIntent["recoveryDecision"];
  recoveryAttempt?: number;
  recoveryDecidedAt?: string;
  createdAt?: string;
}): Promise<StudioSourceWriteIntent> {
  const preimageBytes = [...intent.preimage];
  const previous = memory.intents.get(intent.intentId);
  const phase = intent.phase ?? previous?.phase ?? "preimage-captured";
  const result = intent.result ?? previous?.result;
  const receipt = intent.receipt ?? previous?.receipt;
  const observation = intent.observation ?? previous?.observation ?? (
    phase === "write-closed" && result === undefined && receipt === undefined
      ? { status: "needs-observation" as const, diagnostics: [] }
      : undefined
  );
  const record: StudioSourceWriteIntent = {
    schema: STUDIO_SOURCE_WRITE_INTENT_SCHEMA,
    intentId: intent.intentId,
    path: intent.path,
    preimageBytes,
    preimageSha256: fnvHex(preimageBytes),
    ...(intent.projectId !== undefined || previous?.projectId !== undefined ? { projectId: intent.projectId ?? previous?.projectId } : {}),
    ...(intent.sourcePackageId !== undefined || previous?.sourcePackageId !== undefined ? { sourcePackageId: intent.sourcePackageId ?? previous?.sourcePackageId } : {}),
    ...(intent.baseSourceFingerprint !== undefined || previous?.baseSourceFingerprint !== undefined ? { baseSourceFingerprint: intent.baseSourceFingerprint ?? previous?.baseSourceFingerprint } : {}),
    ...(intent.draftDigest !== undefined || previous?.draftDigest !== undefined ? { draftDigest: intent.draftDigest ?? previous?.draftDigest } : {}),
    ...(intent.byteLength !== undefined || previous?.byteLength !== undefined ? { byteLength: intent.byteLength ?? previous?.byteLength } : {}),
    phase,
    ...(intent.writeByteLength !== undefined || previous?.writeByteLength !== undefined ? { writeByteLength: intent.writeByteLength ?? previous?.writeByteLength } : {}),
    ...(intent.observedSourceFingerprint !== undefined || previous?.observedSourceFingerprint !== undefined ? { observedSourceFingerprint: intent.observedSourceFingerprint ?? previous?.observedSourceFingerprint } : {}),
    ...(intent.receiptId !== undefined || previous?.receiptId !== undefined ? { receiptId: intent.receiptId ?? previous?.receiptId } : {}),
    ...(receipt !== undefined ? { receipt } : {}),
    ...(observation !== undefined ? { observation } : {}),
    ...(result !== undefined ? { result } : {}),
    ...(intent.recovery !== undefined || previous?.recovery !== undefined ? { recovery: intent.recovery ?? previous?.recovery } : {}),
    ...(intent.recoveryDecision !== undefined || previous?.recoveryDecision !== undefined ? { recoveryDecision: intent.recoveryDecision ?? previous?.recoveryDecision } : {}),
    ...(intent.recoveryAttempt !== undefined || previous?.recoveryAttempt !== undefined ? { recoveryAttempt: intent.recoveryAttempt ?? previous?.recoveryAttempt } : {}),
    ...(intent.recoveryDecidedAt !== undefined || previous?.recoveryDecidedAt !== undefined ? { recoveryDecidedAt: intent.recoveryDecidedAt ?? previous?.recoveryDecidedAt } : {}),
    createdAt: intent.createdAt ?? previous?.createdAt ?? new Date().toISOString(),
  };
  if (record.receipt && parseSourceWriteReceipt(record.receipt).diagnostics.length > 0) {
    throw new Error("Source write intent receipt is invalid.");
  }
  memory.intents.set(record.intentId, record);
  if (backend === "indexeddb" && indexedDbFactory) {
    try {
      await idbPut("intents", record.intentId, record);
    } catch (error) {
      failover(error);
    }
  }
  return record;
}

export async function listSourceWriteIntents(): Promise<StudioSourceWriteIntent[]> {
  if (backend === "indexeddb" && indexedDbFactory) {
    try {
      const records = await idbGetAll<StudioSourceWriteIntent>("intents");
      const intents = records.filter(isStudioSourceWriteIntent).map(normalizeStudioSourceWriteIntent).sort(compareSourceWriteIntents);
      memory.intents.clear();
      for (const intent of intents) memory.intents.set(intent.intentId, intent);
      return intents;
    } catch (error) {
      failover(error);
    }
  }
  return [...memory.intents.values()].sort(compareSourceWriteIntents);
}

export async function replaySourceWriteIntent(
  intentId: string,
): Promise<{ ok: boolean; bytes?: Uint8Array; reason?: string }> {
  let intent = memory.intents.get(intentId);
  if (!intent && backend === "indexeddb" && indexedDbFactory) {
    try {
      intent = await idbGet<StudioSourceWriteIntent>("intents", intentId);
    } catch (error) {
      failover(error);
    }
  }
  if (!intent || !isStudioSourceWriteIntent(intent)) return { ok: false, reason: "missing-intent" };
  intent = normalizeStudioSourceWriteIntent(intent);
  memory.intents.set(intent.intentId, intent);
  if (intent.result === "committed") {
    return { ok: true, bytes: Uint8Array.from(intent.preimageBytes) };
  }
  // Restore preimage for aborted/denied recovery.
  return {
    ok: true,
    bytes: Uint8Array.from(intent.preimageBytes),
  };
}

export function clearStudioIndexedDbMemory(): void {
  memory.snapshots.clear();
  memory.intents.clear();
}

async function idbPut(store: string, key: string, value: unknown): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error(`IndexedDB ${store} write failed.`));
      tx.onabort = () => reject(tx.error ?? new Error(`IndexedDB ${store} write aborted.`));
    });
  } finally {
    db.close();
  }
}

async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error ?? new Error(`IndexedDB ${store} read failed.`));
      tx.onabort = () => reject(tx.error ?? new Error(`IndexedDB ${store} read aborted.`));
    });
  } finally {
    db.close();
  }
}

async function idbGetAll<T>(store: string): Promise<T[]> {
  const db = await openDb();
  try {
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).getAll();
      let records: T[] = [];
      req.onsuccess = () => {
        records = Array.isArray(req.result) ? (req.result as T[]) : [];
      };
      req.onerror = () => reject(req.error ?? new Error(`IndexedDB ${store} list failed.`));
      tx.oncomplete = () => resolve(records);
      tx.onerror = () => reject(tx.error ?? new Error(`IndexedDB ${store} list transaction failed.`));
      tx.onabort = () => reject(tx.error ?? new Error(`IndexedDB ${store} list transaction aborted.`));
    });
  } finally {
    db.close();
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!indexedDbFactory) {
      reject(new Error("IndexedDB studio snapshot storage is unavailable."));
      return;
    }
    const req = indexedDbFactory.open(STUDIO_INDEXEDDB_SNAPSHOT_DB_NAME, STUDIO_INDEXEDDB_SNAPSHOT_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("snapshots")) db.createObjectStore("snapshots");
      if (!db.objectStoreNames.contains("intents")) db.createObjectStore("intents");
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onerror = () => reject(req.error ?? new Error("IndexedDB studio snapshot storage could not open."));
  });
}

function failover(error: unknown): void {
  backend = "memory";
  lastError = error instanceof Error ? error.message : String(error);
}

function fnvHex(bytes: number[]): string {
  let hash = 2166136261;
  for (const b of bytes) {
    hash ^= b;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function isStudioSourceWriteIntent(value: unknown): value is StudioSourceWriteIntent {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<StudioSourceWriteIntent>;
  return record.schema === STUDIO_SOURCE_WRITE_INTENT_SCHEMA &&
    typeof record.intentId === "string" && record.intentId.trim().length > 0 &&
    typeof record.path === "string" && record.path.trim().length > 0 &&
    Array.isArray(record.preimageBytes) && record.preimageBytes.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255) &&
    typeof record.preimageSha256 === "string" &&
    (record.phase === undefined || isStudioSourceWriteIntentPhase(record.phase)) &&
    (record.baseSourceFingerprint === undefined || typeof record.baseSourceFingerprint === "string") &&
    (record.writeByteLength === undefined || (Number.isSafeInteger(record.writeByteLength) && record.writeByteLength >= 0)) &&
    (record.observedSourceFingerprint === undefined || typeof record.observedSourceFingerprint === "string") &&
    (record.receiptId === undefined || typeof record.receiptId === "string") &&
    (record.receipt === undefined || parseSourceWriteReceipt(record.receipt).diagnostics.length === 0) &&
    (record.observation === undefined || isStudioSourceWriteObservation(record.observation)) &&
    (record.result === undefined || record.result === "committed" || record.result === "aborted" || record.result === "denied") &&
    (record.recovery === undefined || record.recovery === "restored" || record.recovery === "observed" || record.recovery === "none") &&
    (record.recoveryDecision === undefined || isStudioSourceWriteRecoveryDecision(record.recoveryDecision)) &&
    (record.recoveryAttempt === undefined || (Number.isSafeInteger(record.recoveryAttempt) && record.recoveryAttempt >= 1)) &&
    (record.recoveryDecidedAt === undefined || isIsoDate(record.recoveryDecidedAt)) &&
    typeof record.createdAt === "string";
}

export function classifySourceWriteObservation(input: {
  observedBytes: Uint8Array;
  preimageBytes: Uint8Array;
  draftMatches: boolean;
}): StudioSourceWriteObservationStatus {
  if (bytesEqual(input.observedBytes, input.preimageBytes)) return "matches-preimage";
  if (input.draftMatches) return "matches-draft";
  return "changed";
}

function normalizeStudioSourceWriteIntent(intent: StudioSourceWriteIntent): StudioSourceWriteIntent {
  return {
    ...intent,
    phase: intent.phase ?? "preimage-captured",
  };
}

function isStudioSourceWriteIntentPhase(value: unknown): value is StudioSourceWriteIntentPhase {
  return value === "preimage-captured" || value === "write-closed" || value === "reimported" || value === "settled";
}

function isStudioSourceWriteObservation(value: unknown): value is StudioSourceWriteObservation {
  if (!value || typeof value !== "object") return false;
  const observation = value as Partial<StudioSourceWriteObservation>;
  return isStudioSourceWriteObservationStatus(observation.status) &&
    (observation.observedAt === undefined || isIsoDate(observation.observedAt)) &&
    (observation.digest === undefined || (typeof observation.digest === "string" && observation.digest.trim().length > 0)) &&
    (observation.byteLength === undefined || (Number.isSafeInteger(observation.byteLength) && observation.byteLength >= 0)) &&
    (observation.permission === undefined || isSourceTransactionPermission(observation.permission)) &&
    Array.isArray(observation.diagnostics) && observation.diagnostics.every((item) => typeof item === "string");
}

function isStudioSourceWriteObservationStatus(value: unknown): value is StudioSourceWriteObservationStatus {
  return value === "needs-observation" || value === "matches-preimage" || value === "matches-draft" || value === "changed" || value === "unavailable";
}

function isStudioSourceWriteRecoveryDecision(value: unknown): value is StudioSourceWriteRecoveryDecision {
  return value === "retry" || value === "abandon";
}

function isSourceTransactionPermission(value: unknown): value is SourceTransactionPermission {
  return value === "not-requested" || value === "prompt" || value === "granted" || value === "denied" || value === "revoked" || value === "unsupported";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function compareSourceWriteIntents(left: StudioSourceWriteIntent, right: StudioSourceWriteIntent): number {
  const timeDelta = Date.parse(right.createdAt) - Date.parse(left.createdAt);
  return Number.isFinite(timeDelta) && timeDelta !== 0 ? timeDelta : right.intentId.localeCompare(left.intentId);
}
