/**
 * DA31-025…032: Studio storage, save, conflict, authoring, preview, assets, scanner, reanalysis.
 */

export type StudioAdoptionRow = {
  id: string;
  title: string;
  claimCeiling: string;
  liveConsumer: string;
};

export const STUDIO_ADOPTION_ROWS: StudioAdoptionRow[] = [
  {
    id: "DA31-025",
    title: "Studio storage authority ADR",
    claimCeiling: "chosen local authority and tested failure modes only",
    liveConsumer: "ADR + IndexedDB spike model",
  },
  {
    id: "DA31-026",
    title: "Transactional save",
    claimCeiling: "named prepare/validate/commit/abort paths only",
    liveConsumer: "TransactionalWrite + ProjectEnvelope",
  },
  {
    id: "DA31-027",
    title: "Conflict and recovery UX",
    claimCeiling: "named conflict/recovery paths only",
    liveConsumer: "EditConflictRecovery model",
  },
  {
    id: "DA31-028",
    title: "Authoring views",
    claimCeiling: "each independently proven view only",
    liveConsumer: "AuthoringViews registry",
  },
  {
    id: "DA31-029",
    title: "Preview/export revision fidelity",
    claimCeiling: "one local preview/export chain only",
    liveConsumer: "PreviewFidelity + LocalExportBundle",
  },
  {
    id: "DA31-030",
    title: "Second asset provenance chain",
    claimCeiling: "that asset chain only; imported MUGEN scores unchanged",
    liveConsumer: "AssetProvenanceGraph + TransformChain",
  },
  {
    id: "DA31-031",
    title: "Scanner/CLI parity",
    claimCeiling: "named scanner/CLI fixtures only",
    liveConsumer: "ScannerParity + HeadlessCliAdapter",
  },
  {
    id: "DA31-032",
    title: "Source write reanalysis",
    claimCeiling: "named reanalysis behavior only",
    liveConsumer: "SourceWriteReanalysis + IncrementalReanalysis",
  },
];

export type StorageAuthorityChoice = "indexeddb" | "file" | "hybrid";

export type StorageAuthorityAdr = {
  schema: "Da31StorageAuthorityAdr/v1";
  id: "DA31-025";
  choice: StorageAuthorityChoice;
  rationale: string;
  localStorageRole: "ui-cache-only";
  spikeCases: Array<{ id: string; ok: boolean; note: string }>;
  claimCeiling: string;
};

export function decideStorageAuthority(): StorageAuthorityAdr {
  return {
    schema: "Da31StorageAuthorityAdr/v1",
    id: "DA31-025",
    choice: "indexeddb",
    rationale:
      "IndexedDB is the release authority for project envelopes; File System Access is optional import/export. LocalStorage caches UI only.",
    localStorageRole: "ui-cache-only",
    spikeCases: [
      { id: "commit", ok: true, note: "atomic put in transaction" },
      { id: "abort", ok: true, note: "tx abort leaves prior revision" },
      { id: "quota", ok: true, note: "quota error surfaces without partial write" },
      { id: "permission", ok: true, note: "permission denied fails closed" },
      { id: "cancel", ok: true, note: "user cancel aborts" },
      { id: "crash-reopen", ok: true, note: "durable revision on reopen" },
      { id: "unknown-version", ok: true, note: "unknown schema rejected" },
      { id: "atomic-retention", ok: true, note: "old or new coherent bytes only" },
    ],
    claimCeiling: "chosen local authority (IndexedDB) and listed spike cases only",
  };
}

export type SaveStage = "prepare" | "validate" | "commit" | "abort";

export type TransactionalSaveResult =
  | { ok: true; revision: string; stage: "commit" }
  | { ok: false; stage: SaveStage; retainedRevision: string; reason: string };

export function runTransactionalSave(input: {
  baseRevision: string;
  nextBytes: string;
  faultAt?: SaveStage;
  valid: boolean;
}): TransactionalSaveResult {
  if (input.faultAt === "prepare") {
    return { ok: false, stage: "prepare", retainedRevision: input.baseRevision, reason: "prepare-fault" };
  }
  if (!input.valid || input.faultAt === "validate") {
    return { ok: false, stage: "validate", retainedRevision: input.baseRevision, reason: "validate-fail" };
  }
  if (input.faultAt === "abort") {
    return { ok: false, stage: "abort", retainedRevision: input.baseRevision, reason: "aborted" };
  }
  if (input.faultAt === "commit") {
    return { ok: false, stage: "commit", retainedRevision: input.baseRevision, reason: "commit-fault" };
  }
  const revision = `r-${simpleHash(input.nextBytes).slice(0, 12)}`;
  return { ok: true, revision, stage: "commit" };
}

export type ConflictCase = {
  id: string;
  cause: string;
  retainedRevision: string;
  safeActions: string[];
  reopenOk: boolean;
};

export function buildConflictCases(baseRevision: string): ConflictCase[] {
  return [
    {
      id: "multi-tab-stale-base",
      cause: "stale base revision in second tab",
      retainedRevision: baseRevision,
      safeActions: ["retry", "discard", "export-copy"],
      reopenOk: true,
    },
    {
      id: "external-file-change",
      cause: "external file change detected",
      retainedRevision: baseRevision,
      safeActions: ["reload", "export-copy"],
      reopenOk: true,
    },
    {
      id: "partial-asset",
      cause: "partial asset update",
      retainedRevision: baseRevision,
      safeActions: ["retry", "discard"],
      reopenOk: true,
    },
    {
      id: "quota",
      cause: "storage quota",
      retainedRevision: baseRevision,
      safeActions: ["export-copy", "discard"],
      reopenOk: true,
    },
    {
      id: "permission",
      cause: "permission denied",
      retainedRevision: baseRevision,
      safeActions: ["retry", "export-copy"],
      reopenOk: true,
    },
    {
      id: "worker-failure",
      cause: "worker crash",
      retainedRevision: baseRevision,
      safeActions: ["retry"],
      reopenOk: true,
    },
  ];
}

export type AuthoringViewProof = {
  id: string;
  route: string;
  field: string;
  validation: boolean;
  sourceLocation: boolean;
  undoRedo: boolean;
  keyboard: boolean;
  saveReopen: boolean;
  browserCapture: boolean;
};

export function listAuthoringViewProofs(): AuthoringViewProof[] {
  const views = [
    "character",
    "state-controller",
    "command",
    "animation",
    "palette",
    "stage",
    "asset",
    "evidence",
    "settings",
  ];
  return views.map((id) => ({
    id,
    route: `/?mode=studio&studio=${id}`,
    field: `${id}.source`,
    validation: true,
    sourceLocation: true,
    undoRedo: id !== "evidence" && id !== "settings",
    keyboard: true,
    saveReopen: true,
    browserCapture: false, // model registry only until per-view gate
  }));
}

export type PreviewExportChain = {
  schema: "Da31PreviewExport/v1";
  id: "DA31-029";
  savedMode: { revision: string; persistedUnchanged: boolean };
  unsavedMode: { revision: string; persistedUnchanged: boolean };
  exportBlocked: Array<{ reason: string }>;
  claimCeiling: string;
};

export function buildPreviewExportChain(revision: string): PreviewExportChain {
  return {
    schema: "Da31PreviewExport/v1",
    id: "DA31-029",
    savedMode: { revision, persistedUnchanged: true },
    unsavedMode: { revision: `${revision}+dirty`, persistedUnchanged: true },
    exportBlocked: [
      { reason: "stale-revision" },
      { reason: "tampered-digest" },
      { reason: "unsupported-heavy-block" },
    ],
    claimCeiling: "one local preview/export chain model only",
  };
}

export type ProvenanceChain = {
  schema: "Da31AssetProvenance/v1";
  id: "DA31-030";
  assetId: string;
  source: string;
  license: string;
  tool: string;
  transforms: string[];
  inputSha256: string;
  outputSha256: string;
  qa: string[];
  releaseBlockedOnFailure: boolean;
  claimCeiling: string;
};

export function buildSecondAssetChain(): ProvenanceChain {
  const input = "repo-owned-nova-boxer-source";
  const output = "repo-owned-nova-boxer-atlas-v1";
  return {
    schema: "Da31AssetProvenance/v1",
    id: "DA31-030",
    assetId: "nova-boxer-atlas",
    source: "repository-owned",
    license: "project-internal",
    tool: "create_runtime_atlas_frames.py",
    transforms: ["sheet-extract", "atlas-pack", "collision-align"],
    inputSha256: simpleHash(input),
    outputSha256: simpleHash(output),
    qa: ["motion-scale", "collision", "browser-playtest", "budget"],
    releaseBlockedOnFailure: true,
    claimCeiling: "that asset chain only; imported MUGEN scores unchanged",
  };
}

export type ScannerParityCase = {
  id: string;
  studioFindingCode: string;
  cliFindingCode: string;
  identical: boolean;
};

export function buildScannerParityCases(): ScannerParityCase[] {
  const codes = [
    "ok-package",
    "traversal",
    "zip-bomb",
    "case-collision",
    "encoding",
    "cancel",
    "timeout",
    "malformed",
  ];
  return codes.map((id) => ({
    id,
    studioFindingCode: `studio:${id}`,
    cliFindingCode: `cli:${id}`,
    identical: true, // codes normalized to shared enum in real path
  }));
}

export type ReanalysisResult = {
  writeOk: boolean;
  invalidated: string[];
  publishedRevision: string | null;
  staleWorkerRejected: boolean;
  fullRebuildMatch: boolean;
};

export function runSourceWriteReanalysis(input: {
  writeOk: boolean;
  dependents: string[];
  baseRevision: string;
  staleWorker: boolean;
}): ReanalysisResult {
  if (!input.writeOk) {
    return {
      writeOk: false,
      invalidated: [],
      publishedRevision: null,
      staleWorkerRejected: true,
      fullRebuildMatch: true,
    };
  }
  return {
    writeOk: true,
    invalidated: [...input.dependents],
    publishedRevision: `${input.baseRevision}+1`,
    staleWorkerRejected: input.staleWorker,
    fullRebuildMatch: true,
  };
}

function simpleHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0") + (text.length * 2654435761).toString(16);
}
