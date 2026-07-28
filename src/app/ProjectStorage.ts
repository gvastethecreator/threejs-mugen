import { parseGameProjectManifest, type GameProjectManifest } from "./StudioModel";
import { snapshotAfterProjectSave } from "./ProjectSnapshotBridge";

export const PROJECT_STORAGE_KEY = "mugen-web-sandbox:projects:v0";
export const PROJECT_STORAGE_SCHEMA_VERSION = "mugen-web-sandbox/project-index/v1" as const;

const LEGACY_PROJECT_STORAGE_SCHEMA_VERSION = "mugen-web-sandbox/project-index/v0";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type StoredProjectEntry = {
  id: string;
  name: string;
  savedAt: string;
  revision: number;
  manifest: GameProjectManifest;
};

export type ProjectStorageConflict = {
  projectId: string;
  expectedRevision: number;
  actualRevision: number;
};

export class ProjectStorageConflictError extends Error {
  readonly code = "project-storage-conflict" as const;

  constructor(readonly conflict: ProjectStorageConflict) {
    super(
      `Project ${conflict.projectId} changed from revision ${conflict.expectedRevision} to ${conflict.actualRevision} in another browser context.`,
    );
    this.name = "ProjectStorageConflictError";
  }
}

type StoredProjectIndex = {
  schemaVersion: typeof PROJECT_STORAGE_SCHEMA_VERSION;
  entries: StoredProjectEntry[];
};

export function listStoredProjects(storage: StorageLike): StoredProjectEntry[] {
  return readIndex(storage).entries;
}

export function loadStoredProject(storage: StorageLike, id: string): StoredProjectEntry | undefined {
  return readIndex(storage).entries.find((entry) => entry.id === id);
}

export function loadStoredProjectManifest(storage: StorageLike, id: string): GameProjectManifest | undefined {
  return loadStoredProject(storage, id)?.manifest;
}

/** Mirror the authoritative project list into the small localStorage cache. */
export function replaceStoredProjectCache(storage: StorageLike, entries: StoredProjectEntry[]): StoredProjectEntry[] {
  const next = entries.map((entry) => ({ ...entry, manifest: { ...entry.manifest } }));
  writeIndex(storage, { schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION, entries: next });
  return next;
}

export function saveStoredProjectManifest(
  storage: StorageLike,
  manifest: GameProjectManifest,
  options: {
    savedAt?: string;
    maxEntries?: number;
    expectedRevision?: number;
    /** When true (default), also write StudioProjectSnapshot for reopen identity. */
    snapshot?: boolean;
  } = {},
): StoredProjectEntry[] {
  const savedAt = options.savedAt ?? new Date().toISOString();
  const maxEntries = options.maxEntries ?? 8;
  const index = readIndex(storage);
  const previous = index.entries.find((candidate) => candidate.id === manifest.id);
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
    savedAt,
    revision: (previous?.revision ?? 0) + 1,
    manifest,
  };
  const entries = [entry, ...index.entries.filter((candidate) => candidate.id !== manifest.id)].slice(0, maxEntries);
  writeIndex(storage, { schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION, entries });
  if (options.snapshot !== false) {
    try {
      snapshotAfterProjectSave({ storage, entry });
    } catch {
      // Snapshot is best-effort; project index remains authoritative.
    }
  }
  return entries;
}

function readIndex(storage: StorageLike): StoredProjectIndex {
  const raw = storage.getItem(PROJECT_STORAGE_KEY);
  if (!raw) {
    return emptyIndex();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.entries)) {
      return emptyIndex();
    }
    if (parsed.schemaVersion === PROJECT_STORAGE_SCHEMA_VERSION) {
      return {
        schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION,
        entries: parsed.entries.flatMap((value) => readEntry(value, 1)),
      };
    }
    if (parsed.schemaVersion === LEGACY_PROJECT_STORAGE_SCHEMA_VERSION) {
      const migrated: StoredProjectIndex = {
        schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION,
        entries: parsed.entries.flatMap((value) => readEntry(value, 1)),
      };
      try {
        writeIndex(storage, migrated);
      } catch {
        // Keep read access available when a browser blocks migration writes.
      }
      return migrated;
    }
    return emptyIndex();
  } catch {
    return emptyIndex();
  }
}

function writeIndex(storage: StorageLike, index: StoredProjectIndex): void {
  storage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(index));
}

function readEntry(value: unknown, fallbackRevision: number): StoredProjectEntry[] {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string" || typeof value.savedAt !== "string") {
    return [];
  }
  const manifest = parseGameProjectManifest(value.manifest).manifest;
  if (!manifest) {
    return [];
  }
  const revision = typeof value.revision === "number" && Number.isSafeInteger(value.revision) && value.revision >= 1 ? value.revision : fallbackRevision;
  return [{ id: value.id, name: value.name, savedAt: value.savedAt, revision, manifest }];
}

function emptyIndex(): StoredProjectIndex {
  return { schemaVersion: PROJECT_STORAGE_SCHEMA_VERSION, entries: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
