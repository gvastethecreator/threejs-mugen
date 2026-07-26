/**
 * StudioProjectSnapshot/v1 (DA26-24 bounded).
 * Local history of project identity, source pin, authority, analysis, and versions.
 * Claim blocked: full IndexedDB product UI and large-blob quota tuning.
 */

export const STUDIO_PROJECT_SNAPSHOT_SCHEMA = "StudioProjectSnapshot/v1" as const;
export const STUDIO_PROJECT_SNAPSHOT_STORE_KEY = "mugen-web-sandbox:project-snapshots:v1";
export const STUDIO_PROJECT_SNAPSHOT_LEGACY_KEY = "mugen-web-sandbox:project-snapshots:v0";

export type StudioProjectSnapshotStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

export type StudioProjectSnapshotSource = {
  packageId: string;
  kind: "folder" | "zip" | "virtual";
  fingerprint: string;
  identityStatus: "matched" | "changed" | "unknown";
};

export type StudioProjectSnapshotAuthority = {
  formalSha: string;
  globalSha: string;
  sourceNormativeSha?: string;
};

export type StudioProjectSnapshotAnalysis = {
  schemaVersion: string;
  checksum: string;
  status: "recognized" | "partial" | "unknown";
  findingCount: number;
};

export type StudioProjectSnapshotVersions = {
  app: string;
  analyzer: string;
  ruleset: string;
};

export type StudioProjectSnapshot = {
  schema: typeof STUDIO_PROJECT_SNAPSHOT_SCHEMA;
  id: string;
  projectId: string;
  projectName: string;
  projectRevision: number;
  savedAt: string;
  source: StudioProjectSnapshotSource;
  authority: StudioProjectSnapshotAuthority;
  analysis: StudioProjectSnapshotAnalysis;
  versions: StudioProjectSnapshotVersions;
  assetClosureChecksum?: string;
  integrity: string;
};

export type StudioProjectSnapshotIndex = {
  schema: typeof STUDIO_PROJECT_SNAPSHOT_SCHEMA;
  entries: StudioProjectSnapshot[];
};

export type StudioProjectSnapshotInput = Omit<StudioProjectSnapshot, "schema" | "integrity">;

export function createStudioProjectSnapshot(input: StudioProjectSnapshotInput): StudioProjectSnapshot {
  const payload: Omit<StudioProjectSnapshot, "integrity"> = {
    schema: STUDIO_PROJECT_SNAPSHOT_SCHEMA,
    id: input.id.trim(),
    projectId: input.projectId.trim(),
    projectName: input.projectName.trim(),
    projectRevision: input.projectRevision,
    savedAt: input.savedAt,
    source: { ...input.source },
    authority: { ...input.authority },
    analysis: { ...input.analysis },
    versions: { ...input.versions },
    ...(input.assetClosureChecksum ? { assetClosureChecksum: input.assetClosureChecksum } : {}),
  };
  return {
    ...payload,
    integrity: integrityOf(payload),
  };
}

export function verifyStudioProjectSnapshot(snapshot: StudioProjectSnapshot): string[] {
  const diagnostics: string[] = [];
  if (snapshot.schema !== STUDIO_PROJECT_SNAPSHOT_SCHEMA) diagnostics.push("schema-mismatch");
  if (!snapshot.id) diagnostics.push("empty-id");
  if (!snapshot.projectId) diagnostics.push("empty-project-id");
  if (!Number.isFinite(snapshot.projectRevision) || snapshot.projectRevision < 0) {
    diagnostics.push("invalid-revision");
  }
  const { integrity: _i, ...payload } = snapshot;
  if (integrityOf(payload) !== snapshot.integrity) diagnostics.push("integrity-mismatch");
  return diagnostics;
}

export function saveStudioProjectSnapshot(
  storage: StudioProjectSnapshotStorage,
  snapshot: StudioProjectSnapshot,
  options: { maxEntries?: number } = {},
): StudioProjectSnapshotIndex {
  const maxEntries = options.maxEntries ?? 16;
  const diagnostics = verifyStudioProjectSnapshot(snapshot);
  if (diagnostics.length > 0) {
    throw new Error(`StudioProjectSnapshot invalid: ${diagnostics.join(",")}`);
  }
  const index = listStudioProjectSnapshots(storage);
  const entries = [
    snapshot,
    ...index.entries.filter((entry) => entry.id !== snapshot.id),
  ].slice(0, maxEntries);
  const next: StudioProjectSnapshotIndex = {
    schema: STUDIO_PROJECT_SNAPSHOT_SCHEMA,
    entries,
  };
  writeIndex(storage, next);
  return next;
}

export function listStudioProjectSnapshots(
  storage: StudioProjectSnapshotStorage,
): StudioProjectSnapshotIndex {
  const raw = storage.getItem(STUDIO_PROJECT_SNAPSHOT_STORE_KEY);
  if (!raw) {
    return migrateLegacy(storage);
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.entries)) {
      return emptyIndex();
    }
    if (parsed.schema !== STUDIO_PROJECT_SNAPSHOT_SCHEMA) {
      return emptyIndex();
    }
    const entries = parsed.entries
      .map((entry) => parseEntry(entry))
      .filter((entry): entry is StudioProjectSnapshot => entry !== undefined);
    return { schema: STUDIO_PROJECT_SNAPSHOT_SCHEMA, entries };
  } catch {
    return emptyIndex();
  }
}

export function loadStudioProjectSnapshot(
  storage: StudioProjectSnapshotStorage,
  id: string,
): StudioProjectSnapshot | undefined {
  return listStudioProjectSnapshots(storage).entries.find((entry) => entry.id === id);
}

export function reopenStudioProjectIdentity(
  storage: StudioProjectSnapshotStorage,
  projectId: string,
): { snapshot?: StudioProjectSnapshot; identityPreserved: boolean; diagnostics: string[] } {
  const latest = listStudioProjectSnapshots(storage).entries.find(
    (entry) => entry.projectId === projectId,
  );
  if (!latest) {
    return { identityPreserved: false, diagnostics: ["missing-snapshot"] };
  }
  const diagnostics = verifyStudioProjectSnapshot(latest);
  if (diagnostics.length > 0) {
    return { snapshot: latest, identityPreserved: false, diagnostics };
  }
  return {
    snapshot: latest,
    identityPreserved:
      latest.source.identityStatus === "matched" &&
      latest.projectId === projectId &&
      latest.source.fingerprint.length > 0,
    diagnostics: [],
  };
}

/** Damaged / truncated storage must not throw and must fail closed to empty index. */
export function recoverStudioProjectSnapshots(
  storage: StudioProjectSnapshotStorage,
): StudioProjectSnapshotIndex {
  try {
    return listStudioProjectSnapshots(storage);
  } catch {
    return emptyIndex();
  }
}

function migrateLegacy(storage: StudioProjectSnapshotStorage): StudioProjectSnapshotIndex {
  const legacy = storage.getItem(STUDIO_PROJECT_SNAPSHOT_LEGACY_KEY);
  if (!legacy) return emptyIndex();
  try {
    const parsed = JSON.parse(legacy) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.entries)) return emptyIndex();
    const entries = parsed.entries
      .map((entry) => parseEntry(entry))
      .filter((entry): entry is StudioProjectSnapshot => entry !== undefined);
    const index: StudioProjectSnapshotIndex = {
      schema: STUDIO_PROJECT_SNAPSHOT_SCHEMA,
      entries,
    };
    try {
      writeIndex(storage, index);
    } catch {
      // Quota or read-only storage: keep in-memory migration result.
    }
    return index;
  } catch {
    return emptyIndex();
  }
}

function parseEntry(value: unknown): StudioProjectSnapshot | undefined {
  if (!isRecord(value)) return undefined;
  try {
    const snapshot = createStudioProjectSnapshot({
      id: String(value.id ?? ""),
      projectId: String(value.projectId ?? ""),
      projectName: String(value.projectName ?? ""),
      projectRevision: Number(value.projectRevision ?? 0),
      savedAt: String(value.savedAt ?? ""),
      source: value.source as StudioProjectSnapshotSource,
      authority: value.authority as StudioProjectSnapshotAuthority,
      analysis: value.analysis as StudioProjectSnapshotAnalysis,
      versions: value.versions as StudioProjectSnapshotVersions,
      assetClosureChecksum:
        typeof value.assetClosureChecksum === "string" ? value.assetClosureChecksum : undefined,
    });
    if (typeof value.integrity === "string" && value.integrity !== snapshot.integrity) {
      // Prefer recomputed integrity only when payload fields parse; reject on mismatch if explicit.
      if (verifyStudioProjectSnapshot({ ...snapshot, integrity: value.integrity }).includes("integrity-mismatch")) {
        return undefined;
      }
    }
    return snapshot;
  } catch {
    return undefined;
  }
}

function writeIndex(storage: StudioProjectSnapshotStorage, index: StudioProjectSnapshotIndex): void {
  storage.setItem(STUDIO_PROJECT_SNAPSHOT_STORE_KEY, JSON.stringify(index));
}

function emptyIndex(): StudioProjectSnapshotIndex {
  return { schema: STUDIO_PROJECT_SNAPSHOT_SCHEMA, entries: [] };
}

function integrityOf(payload: Omit<StudioProjectSnapshot, "integrity">): string {
  return stableHash(stableStringify(payload));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
