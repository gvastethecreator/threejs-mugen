/**
 * StudioIndexedDbSnapshot/v1 (DA28-21/22 bounded).
 * IndexedDB-backed project snapshot + source-write intent with real preimage bytes.
 * Falls back to in-memory map when IndexedDB is unavailable (unit/node).
 */

export const STUDIO_INDEXEDDB_SNAPSHOT_SCHEMA = "StudioIndexedDbSnapshot/v1" as const;
export const STUDIO_SOURCE_WRITE_INTENT_SCHEMA = "StudioSourceWriteIntent/v1" as const;
export const STUDIO_INDEXEDDB_SNAPSHOT_DB_NAME = "mugen-web-sandbox-studio";
export const STUDIO_INDEXEDDB_SNAPSHOT_DB_VERSION = 1;

export type StudioIndexedDbSnapshotBackend = "indexeddb" | "memory";

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
  result?: "committed" | "aborted" | "denied";
  recovery?: "restored" | "none";
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
  result?: StudioSourceWriteIntent["result"];
  recovery?: StudioSourceWriteIntent["recovery"];
}): Promise<StudioSourceWriteIntent> {
  const preimageBytes = [...intent.preimage];
  const record: StudioSourceWriteIntent = {
    schema: STUDIO_SOURCE_WRITE_INTENT_SCHEMA,
    intentId: intent.intentId,
    path: intent.path,
    preimageBytes,
    preimageSha256: fnvHex(preimageBytes),
    ...(intent.result ? { result: intent.result } : {}),
    ...(intent.recovery ? { recovery: intent.recovery } : {}),
    createdAt: new Date().toISOString(),
  };
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
  if (!intent) return { ok: false, reason: "missing-intent" };
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
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
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
