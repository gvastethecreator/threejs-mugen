import { parseGameProjectManifest, type GameProjectManifest } from "./StudioModel";

export const PROJECT_STORAGE_KEY = "mugen-web-sandbox:projects:v0";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type StoredProjectEntry = {
  id: string;
  name: string;
  savedAt: string;
  manifest: GameProjectManifest;
};

type StoredProjectIndex = {
  schemaVersion: "mugen-web-sandbox/project-index/v0";
  entries: StoredProjectEntry[];
};

export function listStoredProjects(storage: StorageLike): StoredProjectEntry[] {
  return readIndex(storage).entries;
}

export function loadStoredProjectManifest(storage: StorageLike, id: string): GameProjectManifest | undefined {
  return readIndex(storage).entries.find((entry) => entry.id === id)?.manifest;
}

export function saveStoredProjectManifest(
  storage: StorageLike,
  manifest: GameProjectManifest,
  options: { savedAt?: string; maxEntries?: number } = {},
): StoredProjectEntry[] {
  const savedAt = options.savedAt ?? new Date().toISOString();
  const maxEntries = options.maxEntries ?? 8;
  const index = readIndex(storage);
  const entry: StoredProjectEntry = {
    id: manifest.id,
    name: manifest.name,
    savedAt,
    manifest,
  };
  const entries = [entry, ...index.entries.filter((candidate) => candidate.id !== manifest.id)].slice(0, maxEntries);
  writeIndex(storage, { schemaVersion: "mugen-web-sandbox/project-index/v0", entries });
  return entries;
}

function readIndex(storage: StorageLike): StoredProjectIndex {
  const raw = storage.getItem(PROJECT_STORAGE_KEY);
  if (!raw) {
    return emptyIndex();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.schemaVersion !== "mugen-web-sandbox/project-index/v0" || !Array.isArray(parsed.entries)) {
      return emptyIndex();
    }
    return {
      schemaVersion: "mugen-web-sandbox/project-index/v0",
      entries: parsed.entries.flatMap(readEntry),
    };
  } catch {
    return emptyIndex();
  }
}

function writeIndex(storage: StorageLike, index: StoredProjectIndex): void {
  storage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(index));
}

function readEntry(value: unknown): StoredProjectEntry[] {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string" || typeof value.savedAt !== "string") {
    return [];
  }
  const manifest = parseGameProjectManifest(value.manifest).manifest;
  if (!manifest) {
    return [];
  }
  return [{ id: value.id, name: value.name, savedAt: value.savedAt, manifest }];
}

function emptyIndex(): StoredProjectIndex {
  return { schemaVersion: "mugen-web-sandbox/project-index/v0", entries: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
