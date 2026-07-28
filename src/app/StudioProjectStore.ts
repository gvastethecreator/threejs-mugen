import {
  parseGameProjectManifest,
  type GameProjectManifest,
} from "./StudioModel";
import {
  ProjectStorageConflictError,
  type ProjectStorageConflict,
  type StoredProjectEntry,
} from "./ProjectStorage";

export const STUDIO_PROJECT_STORE_SCHEMA = "StudioProjectStore/v1" as const;
export const STUDIO_PROJECT_STORE_DB_NAME = "mugen-web-sandbox-projects";
export const STUDIO_PROJECT_STORE_VERSION = 1;
const STUDIO_PROJECT_STORE_NAME = "projects";
const DEFAULT_MAX_ENTRIES = 8;

export type StudioProjectStoreBackend = "indexeddb" | "memory";

export type StudioProjectStoreDiagnostics = {
  schema: typeof STUDIO_PROJECT_STORE_SCHEMA;
  database: string;
  backend: StudioProjectStoreBackend;
  authoritative: boolean;
  lastError?: string;
};

export type StudioProjectStoreOptions = {
  indexedDB?: IDBFactory;
  database?: string;
  maxEntries?: number;
};

export type StudioProjectStoreSaveOptions = {
  savedAt?: string;
  expectedRevision?: number;
  maxEntries?: number;
};

type StudioProjectRecord = {
  schema: typeof STUDIO_PROJECT_STORE_SCHEMA;
  entry: StoredProjectEntry;
};

/**
 * Project identity and manifests live here. localStorage remains a UI cache
 * because browser storage is synchronous and small; the app mirrors this list
 * after every successful authority read/write.
 */
export class StudioProjectStore {
  private readonly factory: IDBFactory | undefined;
  private readonly database: string;
  private readonly maxEntries: number;
  private readonly memory = new Map<string, StoredProjectEntry>();
  private backend: StudioProjectStoreBackend;
  private lastError?: string;

  constructor(options: StudioProjectStoreOptions = {}) {
    this.factory = options.indexedDB ?? (typeof indexedDB === "undefined" ? undefined : indexedDB);
    this.database = options.database ?? STUDIO_PROJECT_STORE_DB_NAME;
    this.maxEntries = normalizeMaxEntries(options.maxEntries ?? DEFAULT_MAX_ENTRIES);
    this.backend = this.factory ? "indexeddb" : "memory";
  }

  getBackend(): StudioProjectStoreBackend {
    return this.backend;
  }

  getDiagnostics(): StudioProjectStoreDiagnostics {
    return {
      schema: STUDIO_PROJECT_STORE_SCHEMA,
      database: this.database,
      backend: this.backend,
      authoritative: this.backend === "indexeddb",
      ...(this.lastError ? { lastError: this.lastError } : {}),
    };
  }

  async list(): Promise<StoredProjectEntry[]> {
    if (this.backend === "indexeddb" && this.factory) {
      try {
        const entries = await this.readIndexedEntries();
        this.replaceMemory(entries);
        return entries;
      } catch (error) {
        this.failover(error);
      }
    }
    return this.listMemory();
  }

  async load(id: string): Promise<StoredProjectEntry | undefined> {
    const entryId = id.trim();
    if (!entryId) return undefined;
    const entries = await this.list();
    return entries.find((entry) => entry.id === entryId);
  }

  async save(
    manifest: GameProjectManifest,
    options: StudioProjectStoreSaveOptions = {},
  ): Promise<StoredProjectEntry[]> {
    if (this.backend === "indexeddb" && this.factory) {
      try {
        const entries = await this.saveIndexed(manifest, options);
        this.replaceMemory(entries);
        return entries;
      } catch (error) {
        if (error instanceof ProjectStorageConflictError) {
          throw error;
        }
        this.failover(error);
      }
    }
    return this.saveMemory(manifest, options);
  }

  async replace(entries: StoredProjectEntry[], options: { maxEntries?: number } = {}): Promise<StoredProjectEntry[]> {
    const next = normalizeEntries(entries).slice(0, normalizeMaxEntries(options.maxEntries ?? this.maxEntries));
    if (this.backend === "indexeddb" && this.factory) {
      try {
        await this.writeIndexedEntries(next);
        this.replaceMemory(next);
        return next;
      } catch (error) {
        this.failover(error);
      }
    }
    this.replaceMemory(next);
    return this.listMemory();
  }

  private async readIndexedEntries(): Promise<StoredProjectEntry[]> {
    const db = await openDatabase(this.factory!, this.database);
    try {
      const records = await readRecords(db);
      return sortEntries(records.flatMap(parseRecord));
    } finally {
      db.close();
    }
  }

  private async saveIndexed(
    manifest: GameProjectManifest,
    options: StudioProjectStoreSaveOptions,
  ): Promise<StoredProjectEntry[]> {
    const savedAt = options.savedAt ?? new Date().toISOString();
    const maxEntries = normalizeMaxEntries(options.maxEntries ?? this.maxEntries);
    const db = await openDatabase(this.factory!, this.database);
    try {
      return await updateRecords(db, (current) => {
        const previous = current.find((entry) => entry.id === manifest.id);
        const actualRevision = previous?.revision ?? 0;
        if (options.expectedRevision !== undefined && options.expectedRevision !== actualRevision) {
          const conflict: ProjectStorageConflict = {
            projectId: manifest.id,
            expectedRevision: options.expectedRevision,
            actualRevision,
          };
          throw new ProjectStorageConflictError(conflict);
        }
        const entry: StoredProjectEntry = {
          id: manifest.id,
          name: manifest.name,
          savedAt,
          revision: actualRevision + 1,
          manifest,
        };
        return sortEntries([entry, ...current.filter((candidate) => candidate.id !== manifest.id)]).slice(0, maxEntries);
      });
    } finally {
      db.close();
    }
  }

  private async writeIndexedEntries(entries: StoredProjectEntry[]): Promise<void> {
    const db = await openDatabase(this.factory!, this.database);
    try {
      await updateRecords(db, () => entries);
    } finally {
      db.close();
    }
  }

  private saveMemory(
    manifest: GameProjectManifest,
    options: StudioProjectStoreSaveOptions,
  ): StoredProjectEntry[] {
    const current = this.listMemory();
    const previous = current.find((entry) => entry.id === manifest.id);
    const actualRevision = previous?.revision ?? 0;
    if (options.expectedRevision !== undefined && options.expectedRevision !== actualRevision) {
      throw new ProjectStorageConflictError({
        projectId: manifest.id,
        expectedRevision: options.expectedRevision,
        actualRevision,
      });
    }
    const entry: StoredProjectEntry = {
      id: manifest.id,
      name: manifest.name,
      savedAt: options.savedAt ?? new Date().toISOString(),
      revision: actualRevision + 1,
      manifest,
    };
    const entries = sortEntries([entry, ...current.filter((candidate) => candidate.id !== manifest.id)]).slice(
      0,
      normalizeMaxEntries(options.maxEntries ?? this.maxEntries),
    );
    this.replaceMemory(entries);
    return entries;
  }

  private listMemory(): StoredProjectEntry[] {
    return sortEntries([...this.memory.values()]);
  }

  private replaceMemory(entries: StoredProjectEntry[]): void {
    this.memory.clear();
    for (const entry of entries) {
      this.memory.set(entry.id, entry);
    }
  }

  private failover(error: unknown): void {
    this.backend = "memory";
    this.lastError = error instanceof Error ? error.message : String(error);
  }
}

function openDatabase(factory: IDBFactory, database: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(database, STUDIO_PROJECT_STORE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STUDIO_PROJECT_STORE_NAME)) {
        db.createObjectStore(STUDIO_PROJECT_STORE_NAME, { keyPath: "entry.id" });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB project store could not open."));
  });
}

function readRecords(db: IDBDatabase): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STUDIO_PROJECT_STORE_NAME, "readonly");
    const request = transaction.objectStore(STUDIO_PROJECT_STORE_NAME).getAll();
    let records: unknown[] = [];
    request.onsuccess = () => {
      records = Array.isArray(request.result) ? (request.result as unknown[]) : [];
    };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB project read failed."));
    transaction.oncomplete = () => resolve(records);
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB project read transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB project read transaction aborted."));
  });
}

function updateRecords(
  db: IDBDatabase,
  update: (entries: StoredProjectEntry[]) => StoredProjectEntry[],
): Promise<StoredProjectEntry[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STUDIO_PROJECT_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(STUDIO_PROJECT_STORE_NAME);
    const request = objectStore.getAll();
    let next: StoredProjectEntry[] = [];
    let operationError: unknown;
    request.onsuccess = () => {
      try {
        const current = request.result.flatMap(parseRecord);
        next = normalizeEntries(update(current));
        objectStore.clear();
        for (const entry of next) {
          const record: StudioProjectRecord = { schema: STUDIO_PROJECT_STORE_SCHEMA, entry };
          objectStore.put(record);
        }
      } catch (error) {
        operationError = error;
        try {
          transaction.abort();
        } catch {
          // The transaction may already be aborting.
        }
      }
    };
    request.onerror = () => {
      operationError = request.error ?? new Error("IndexedDB project update read failed.");
      try {
        transaction.abort();
      } catch {
        // The transaction may already be aborting.
      }
    };
    transaction.oncomplete = () => resolve(next);
    transaction.onerror = () => reject(operationError ?? transaction.error ?? new Error("IndexedDB project update failed."));
    transaction.onabort = () => reject(operationError ?? transaction.error ?? new Error("IndexedDB project update aborted."));
  });
}

function parseRecord(value: unknown): StoredProjectEntry[] {
  if (!isRecord(value) || value.schema !== STUDIO_PROJECT_STORE_SCHEMA || !isRecord(value.entry)) {
    return [];
  }
  const entry = value.entry;
  if (typeof entry.id !== "string" || typeof entry.name !== "string" || typeof entry.savedAt !== "string") {
    return [];
  }
  const manifest = parseGameProjectManifest(entry.manifest).manifest;
  if (!manifest) return [];
  const revision = entry.revision;
  if (typeof revision !== "number" || !Number.isSafeInteger(revision) || revision < 1) return [];
  return [
    {
      id: entry.id,
      name: entry.name,
      savedAt: entry.savedAt,
      revision,
      manifest,
    },
  ];
}

function normalizeEntries(entries: StoredProjectEntry[]): StoredProjectEntry[] {
  const seen = new Set<string>();
  const valid: StoredProjectEntry[] = [];
  for (const entry of entries) {
    if (seen.has(entry.id)) continue;
    const parsed = parseRecord({ schema: STUDIO_PROJECT_STORE_SCHEMA, entry });
    if (parsed[0]) {
      valid.push(parsed[0]);
      seen.add(parsed[0].id);
    }
  }
  return sortEntries(valid);
}

function sortEntries(entries: StoredProjectEntry[]): StoredProjectEntry[] {
  return [...entries].sort((a, b) => {
    const dateOrder = b.savedAt.localeCompare(a.savedAt);
    if (dateOrder !== 0) return dateOrder;
    const revisionOrder = b.revision - a.revision;
    return revisionOrder !== 0 ? revisionOrder : a.id.localeCompare(b.id);
  });
}

function normalizeMaxEntries(value: number): number {
  return Math.max(1, Math.floor(Number.isFinite(value) ? value : DEFAULT_MAX_ENTRIES));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
