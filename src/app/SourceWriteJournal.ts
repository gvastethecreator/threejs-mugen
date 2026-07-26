/**
 * SourceWriteJournal/v1 (DA26-26 bounded).
 * Intent → preimage → write phases → retry/rollback/replay after reopen.
 * Claim blocked: browser File System Access permission product path.
 */

export const SOURCE_WRITE_JOURNAL_SCHEMA = "SourceWriteJournal/v1" as const;
export const SOURCE_WRITE_JOURNAL_STORE_KEY = "mugen-web-sandbox:source-write-journal:v1";

export type SourceWriteJournalPhase =
  | "intent"
  | "preimage"
  | "write"
  | "verify"
  | "commit"
  | "rollback"
  | "replay";

export type SourceWriteJournalStatus =
  | "open"
  | "committed"
  | "rolled-back"
  | "failed"
  | "permission-revoked";

export type SourceWriteJournalStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type SourceWriteJournalEntry = {
  schema: typeof SOURCE_WRITE_JOURNAL_SCHEMA;
  id: string;
  projectId: string;
  path: string;
  status: SourceWriteJournalStatus;
  phases: SourceWriteJournalPhase[];
  intentDigest: string;
  preimageDigest?: string;
  writtenDigest?: string;
  committedDigest?: string;
  retryCount: number;
  diagnostics: string[];
  observedAt: string;
  integrity: string;
};

export type SourceWriteJournalIndex = {
  schema: typeof SOURCE_WRITE_JOURNAL_SCHEMA;
  entries: SourceWriteJournalEntry[];
};

export type SourceWriteJournalRunInput = {
  id: string;
  projectId: string;
  path: string;
  intentBytes: string;
  /** Current bytes before write. */
  preimageBytes: string;
  /** Bytes that would be written. */
  writeBytes: string;
  observedAt?: string;
  /** Injected failures for unit proof. */
  fault?: "permission-revoked" | "write-failed" | "verify-failed";
  maxRetries?: number;
};

export type SourceWriteJournalRunResult = {
  entry: SourceWriteJournalEntry;
  restoredPreimage: boolean;
  replayable: boolean;
};

export function createSourceWriteIntent(input: {
  projectId: string;
  path: string;
  intentBytes: string;
}): { intentDigest: string; phases: SourceWriteJournalPhase[] } {
  return {
    intentDigest: digestOf(input.intentBytes),
    phases: ["intent"],
  };
}

export function runSourceWriteJournal(
  input: SourceWriteJournalRunInput,
): SourceWriteJournalRunResult {
  const observedAt = input.observedAt ?? new Date().toISOString();
  const maxRetries = input.maxRetries ?? 1;
  const intent = createSourceWriteIntent({
    projectId: input.projectId,
    path: input.path,
    intentBytes: input.intentBytes,
  });
  const phases: SourceWriteJournalPhase[] = [...intent.phases];
  const diagnostics: string[] = [];
  let retryCount = 0;
  let status: SourceWriteJournalStatus = "open";
  let preimageDigest: string | undefined;
  let writtenDigest: string | undefined;
  let committedDigest: string | undefined;
  let restoredPreimage = false;

  if (input.fault === "permission-revoked") {
    diagnostics.push("permission-revoked");
    status = "permission-revoked";
    return {
      entry: sealEntry({
        id: input.id,
        projectId: input.projectId,
        path: input.path,
        status,
        phases,
        intentDigest: intent.intentDigest,
        retryCount,
        diagnostics,
        observedAt,
      }),
      restoredPreimage: false,
      replayable: false,
    };
  }

  phases.push("preimage");
  preimageDigest = digestOf(input.preimageBytes);

  const attemptWrite = (): boolean => {
    phases.push("write");
    if (input.fault === "write-failed") {
      diagnostics.push("write-failed");
      return false;
    }
    writtenDigest = digestOf(input.writeBytes);
    phases.push("verify");
    if (input.fault === "verify-failed") {
      diagnostics.push("verify-failed");
      return false;
    }
    if (writtenDigest !== digestOf(input.writeBytes)) {
      diagnostics.push("written-digest-mismatch");
      return false;
    }
    return true;
  };

  let ok = attemptWrite();
  while (!ok && retryCount < maxRetries) {
    retryCount += 1;
    diagnostics.push(`retry:${retryCount}`);
    ok = attemptWrite();
  }

  if (!ok) {
    phases.push("rollback");
    restoredPreimage = true;
    status = "rolled-back";
    diagnostics.push("restored-preimage");
    return {
      entry: sealEntry({
        id: input.id,
        projectId: input.projectId,
        path: input.path,
        status,
        phases,
        intentDigest: intent.intentDigest,
        preimageDigest,
        writtenDigest,
        retryCount,
        diagnostics,
        observedAt,
      }),
      restoredPreimage: true,
      replayable: true,
    };
  }

  phases.push("commit");
  committedDigest = writtenDigest;
  status = "committed";
  return {
    entry: sealEntry({
      id: input.id,
      projectId: input.projectId,
      path: input.path,
      status,
      phases,
      intentDigest: intent.intentDigest,
      preimageDigest,
      writtenDigest,
      committedDigest,
      retryCount,
      diagnostics,
      observedAt,
    }),
    restoredPreimage: false,
    replayable: true,
  };
}

export function saveSourceWriteJournalEntry(
  storage: SourceWriteJournalStorage,
  entry: SourceWriteJournalEntry,
  options: { maxEntries?: number } = {},
): SourceWriteJournalIndex {
  const maxEntries = options.maxEntries ?? 32;
  const index = listSourceWriteJournal(storage);
  const entries = [entry, ...index.entries.filter((item) => item.id !== entry.id)].slice(0, maxEntries);
  const next: SourceWriteJournalIndex = {
    schema: SOURCE_WRITE_JOURNAL_SCHEMA,
    entries,
  };
  storage.setItem(SOURCE_WRITE_JOURNAL_STORE_KEY, JSON.stringify(next));
  return next;
}

export function listSourceWriteJournal(storage: SourceWriteJournalStorage): SourceWriteJournalIndex {
  const raw = storage.getItem(SOURCE_WRITE_JOURNAL_STORE_KEY);
  if (!raw) return { schema: SOURCE_WRITE_JOURNAL_SCHEMA, entries: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.entries)) {
      return { schema: SOURCE_WRITE_JOURNAL_SCHEMA, entries: [] };
    }
    const entries = parsed.entries.filter(
      (entry): entry is SourceWriteJournalEntry =>
        isRecord(entry) &&
        entry.schema === SOURCE_WRITE_JOURNAL_SCHEMA &&
        typeof entry.id === "string" &&
        typeof entry.integrity === "string",
    );
    return { schema: SOURCE_WRITE_JOURNAL_SCHEMA, entries };
  } catch {
    return { schema: SOURCE_WRITE_JOURNAL_SCHEMA, entries: [] };
  }
}

/** After reopen, committed/rolled-back entries with integrity can be replayed as audit facts. */
export function replaySourceWriteJournalAfterReopen(
  storage: SourceWriteJournalStorage,
  entryId: string,
): {
  entry?: SourceWriteJournalEntry;
  replayed: boolean;
  diagnostics: string[];
} {
  const entry = listSourceWriteJournal(storage).entries.find((item) => item.id === entryId);
  if (!entry) return { replayed: false, diagnostics: ["missing-entry"] };
  const expected = sealEntry(stripEntry(entry));
  if (expected.integrity !== entry.integrity) {
    return { entry, replayed: false, diagnostics: ["integrity-mismatch"] };
  }
  if (entry.status !== "committed" && entry.status !== "rolled-back") {
    return { entry, replayed: false, diagnostics: [`status-not-replayable:${entry.status}`] };
  }
  const phases = entry.phases.includes("replay") ? entry.phases : [...entry.phases, "replay" as const];
  return {
    entry: sealEntry({
      ...stripEntry(entry),
      phases,
    }),
    replayed: true,
    diagnostics: [],
  };
}

function stripEntry(
  entry: SourceWriteJournalEntry,
): Omit<SourceWriteJournalEntry, "schema" | "integrity"> {
  return {
    id: entry.id,
    projectId: entry.projectId,
    path: entry.path,
    status: entry.status,
    phases: entry.phases,
    intentDigest: entry.intentDigest,
    ...(entry.preimageDigest ? { preimageDigest: entry.preimageDigest } : {}),
    ...(entry.writtenDigest ? { writtenDigest: entry.writtenDigest } : {}),
    ...(entry.committedDigest ? { committedDigest: entry.committedDigest } : {}),
    retryCount: entry.retryCount,
    diagnostics: entry.diagnostics,
    observedAt: entry.observedAt,
  };
}

function sealEntry(
  input: Omit<SourceWriteJournalEntry, "schema" | "integrity">,
): SourceWriteJournalEntry {
  const payload: Omit<SourceWriteJournalEntry, "integrity"> = {
    schema: SOURCE_WRITE_JOURNAL_SCHEMA,
    id: input.id,
    projectId: input.projectId,
    path: input.path,
    status: input.status,
    phases: [...input.phases],
    intentDigest: input.intentDigest,
    ...(input.preimageDigest ? { preimageDigest: input.preimageDigest } : {}),
    ...(input.writtenDigest ? { writtenDigest: input.writtenDigest } : {}),
    ...(input.committedDigest ? { committedDigest: input.committedDigest } : {}),
    retryCount: input.retryCount,
    diagnostics: [...input.diagnostics],
    observedAt: input.observedAt,
  };
  return {
    ...payload,
    integrity: stableHash(stableStringify(payload)),
  };
}

function digestOf(bytes: string): string {
  return stableHash(bytes);
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
