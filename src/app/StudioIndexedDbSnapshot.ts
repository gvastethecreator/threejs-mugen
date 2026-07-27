/**
 * StudioIndexedDbSnapshot/v1 (DA28-21/22 bounded).
 * IndexedDB-backed project snapshot + source-write intent with real preimage bytes.
 * Falls back to in-memory map when IndexedDB is unavailable (unit/node).
 */

export const STUDIO_INDEXEDDB_SNAPSHOT_SCHEMA = "StudioIndexedDbSnapshot/v1" as const;
export const STUDIO_SOURCE_WRITE_INTENT_SCHEMA = "StudioSourceWriteIntent/v1" as const;

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

export async function saveProjectSnapshot(
  record: StudioProjectSnapshotRecord,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!record.projectId.trim()) return { ok: false, reason: "missing-project-id" };
  if (!Number.isFinite(record.revision) || record.revision < 0) {
    return { ok: false, reason: "bad-revision" };
  }
  memory.snapshots.set(record.projectId, record);
  // Best-effort IndexedDB when available.
  try {
    await idbPut("snapshots", record.projectId, record);
  } catch {
    // memory remains source of truth in node/tests
  }
  return { ok: true };
}

export async function loadProjectSnapshot(
  projectId: string,
): Promise<StudioProjectSnapshotRecord | undefined> {
  try {
    const fromIdb = await idbGet<StudioProjectSnapshotRecord>("snapshots", projectId);
    if (fromIdb) return fromIdb;
  } catch {
    // ignore
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
  try {
    await idbPut("intents", record.intentId, record);
  } catch {
    // ignore
  }
  return record;
}

export async function replaySourceWriteIntent(
  intentId: string,
): Promise<{ ok: boolean; bytes?: Uint8Array; reason?: string }> {
  const intent = memory.intents.get(intentId) ?? (await idbGet<StudioSourceWriteIntent>("intents", intentId));
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
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  if (typeof indexedDB === "undefined") return undefined;
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
    const req = indexedDB.open("mugen-web-sandbox-studio", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("snapshots")) db.createObjectStore("snapshots");
      if (!db.objectStoreNames.contains("intents")) db.createObjectStore("intents");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function fnvHex(bytes: number[]): string {
  let hash = 2166136261;
  for (const b of bytes) {
    hash ^= b;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
