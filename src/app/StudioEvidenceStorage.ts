import type { RuntimeTraceArtifact } from "../mugen/runtime/RuntimeTraceArtifact";
import type { GameProjectManifest, GameProjectSourcePackage } from "./StudioModel";
import type { StorageLike } from "./ProjectStorage";

export const STUDIO_EVIDENCE_STORAGE_KEY = "mugen-web-sandbox:studio-evidence:v0";

export type StoredTraceEvidenceEntry = {
  id: string;
  savedAt: string;
  projectId: string;
  projectName: string;
  entry: GameProjectManifest["entry"];
  sourcePackages: Pick<GameProjectSourcePackage, "id" | "name" | "kind" | "status" | "requiredPaths">[];
  artifact: RuntimeTraceArtifact;
};

type StoredTraceEvidenceIndex = {
  schemaVersion: "mugen-web-sandbox/studio-evidence-index/v0";
  entries: StoredTraceEvidenceEntry[];
};

export function listStoredTraceEvidence(storage: StorageLike): StoredTraceEvidenceEntry[] {
  return readIndex(storage).entries;
}

export function saveStoredTraceEvidence(
  storage: StorageLike,
  manifest: GameProjectManifest,
  artifact: RuntimeTraceArtifact,
  options: { savedAt?: string; maxEntries?: number } = {},
): StoredTraceEvidenceEntry[] {
  const savedAt = options.savedAt ?? new Date().toISOString();
  const maxEntries = options.maxEntries ?? 12;
  const index = readIndex(storage);
  const entry: StoredTraceEvidenceEntry = {
    id: `${manifest.id}:${artifact.trace.checksum}`,
    savedAt,
    projectId: manifest.id,
    projectName: manifest.name,
    entry: { ...manifest.entry },
    sourcePackages: manifest.sourcePackages.map((sourcePackage) => ({
      id: sourcePackage.id,
      name: sourcePackage.name,
      kind: sourcePackage.kind,
      status: sourcePackage.status,
      requiredPaths: [...sourcePackage.requiredPaths],
    })),
    artifact: cloneArtifact(artifact),
  };
  const entries = [entry, ...index.entries.filter((candidate) => candidate.id !== entry.id)].slice(0, maxEntries);
  writeIndex(storage, { schemaVersion: "mugen-web-sandbox/studio-evidence-index/v0", entries });
  return entries;
}

function readIndex(storage: StorageLike): StoredTraceEvidenceIndex {
  const raw = storage.getItem(STUDIO_EVIDENCE_STORAGE_KEY);
  if (!raw) {
    return emptyIndex();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.schemaVersion !== "mugen-web-sandbox/studio-evidence-index/v0" || !Array.isArray(parsed.entries)) {
      return emptyIndex();
    }
    return {
      schemaVersion: "mugen-web-sandbox/studio-evidence-index/v0",
      entries: parsed.entries.flatMap(readEntry),
    };
  } catch {
    return emptyIndex();
  }
}

function writeIndex(storage: StorageLike, index: StoredTraceEvidenceIndex): void {
  storage.setItem(STUDIO_EVIDENCE_STORAGE_KEY, JSON.stringify(index));
}

function readEntry(value: unknown): StoredTraceEvidenceEntry[] {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.savedAt !== "string" ||
    typeof value.projectId !== "string" ||
    typeof value.projectName !== "string" ||
    !isEntry(value.entry) ||
    !Array.isArray(value.sourcePackages) ||
    !isRuntimeTraceArtifact(value.artifact)
  ) {
    return [];
  }
  return [
    {
      id: value.id,
      savedAt: value.savedAt,
      projectId: value.projectId,
      projectName: value.projectName,
      entry: { ...value.entry },
      sourcePackages: value.sourcePackages.flatMap(readSourcePackage),
      artifact: cloneArtifact(value.artifact),
    },
  ];
}

function readSourcePackage(value: unknown): StoredTraceEvidenceEntry["sourcePackages"] {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    (value.kind !== "zip" && value.kind !== "folder") ||
    (value.status !== "linked" && value.status !== "missing") ||
    !Array.isArray(value.requiredPaths)
  ) {
    return [];
  }
  return [
    {
      id: value.id,
      name: value.name,
      kind: value.kind,
      status: value.status,
      requiredPaths: value.requiredPaths.filter((item): item is string => typeof item === "string"),
    },
  ];
}

function isEntry(value: unknown): value is GameProjectManifest["entry"] {
  return isRecord(value) && value.mode === "match" && typeof value.p1 === "string" && typeof value.p2 === "string" && typeof value.stage === "string";
}

function isRuntimeTraceArtifact(value: unknown): value is RuntimeTraceArtifact {
  return (
    isRecord(value) &&
    value.schemaVersion === "runtime-trace-artifact/v0" &&
    typeof value.generatedAt === "string" &&
    (value.status === "passed" || value.status === "failed") &&
    isRecord(value.target) &&
    typeof value.target.id === "string" &&
    typeof value.target.label === "string" &&
    isRecord(value.trace) &&
    typeof value.trace.label === "string" &&
    typeof value.trace.checksum === "string" &&
    Array.isArray(value.gates)
  );
}

function cloneArtifact(artifact: RuntimeTraceArtifact): RuntimeTraceArtifact {
  return structuredClone(artifact);
}

function emptyIndex(): StoredTraceEvidenceIndex {
  return { schemaVersion: "mugen-web-sandbox/studio-evidence-index/v0", entries: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
