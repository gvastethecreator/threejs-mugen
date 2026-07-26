/**
 * SourceWriteJournalBridge/v1 (DA27-02).
 * Maps SourceWriteReceipt outcomes onto SourceWriteJournal durable entries.
 */

import type { SourceWriteReceipt } from "./StudioSourceWriteReceipt";
import {
  listSourceWriteJournal,
  replaySourceWriteJournalAfterReopen,
  runSourceWriteJournal,
  saveSourceWriteJournalEntry,
  type SourceWriteJournalEntry,
  type SourceWriteJournalStorage,
} from "./SourceWriteJournal";

export const SOURCE_WRITE_JOURNAL_BRIDGE_SCHEMA = "SourceWriteJournalBridge/v1" as const;

export type SourceWriteJournalBridgeResult = {
  schema: typeof SOURCE_WRITE_JOURNAL_BRIDGE_SCHEMA;
  entry: SourceWriteJournalEntry;
  linkedReceiptId: string;
  restoredPreimage: boolean;
  replayable: boolean;
};

export function journalFromSourceWriteReceipt(input: {
  storage: SourceWriteJournalStorage;
  receipt: SourceWriteReceipt;
  projectId: string;
  preimageBytes?: string;
  writeBytes?: string;
}): SourceWriteJournalBridgeResult {
  const preimageBytes = input.preimageBytes ?? input.receipt.baseSourceFingerprint ?? "preimage:unknown";
  const writeBytes = input.writeBytes ?? input.receipt.committedDigest ?? input.receipt.draftDigest ?? "write:unknown";

  let fault: "permission-revoked" | "write-failed" | "verify-failed" | undefined;
  if (input.receipt.status === "blocked" && input.receipt.reason === "permission") {
    fault = "permission-revoked";
  } else if (input.receipt.status === "failed") {
    fault = "write-failed";
  } else if (input.receipt.status === "rejected") {
    fault = "verify-failed";
  }

  const run = runSourceWriteJournal({
    id: `journal:${input.receipt.id}`,
    projectId: input.projectId,
    path: input.receipt.path,
    intentBytes: writeBytes,
    preimageBytes,
    writeBytes,
    observedAt: input.receipt.observedAt,
    fault,
    maxRetries: fault ? 0 : 1,
  });

  // Successful receipt must yield committed journal even if digests are synthetic.
  let entry = run.entry;
  if (input.receipt.status === "committed" && entry.status !== "committed") {
    const forced = runSourceWriteJournal({
      id: `journal:${input.receipt.id}`,
      projectId: input.projectId,
      path: input.receipt.path,
      intentBytes: writeBytes,
      preimageBytes,
      writeBytes,
      observedAt: input.receipt.observedAt,
    });
    entry = forced.entry;
  }

  saveSourceWriteJournalEntry(input.storage, entry);
  return {
    schema: SOURCE_WRITE_JOURNAL_BRIDGE_SCHEMA,
    entry,
    linkedReceiptId: input.receipt.id,
    restoredPreimage: run.restoredPreimage && input.receipt.status !== "committed",
    replayable: entry.status === "committed" || entry.status === "rolled-back",
  };
}

export function replayJournalAfterProjectReopen(
  storage: SourceWriteJournalStorage,
  entryId: string,
): ReturnType<typeof replaySourceWriteJournalAfterReopen> {
  return replaySourceWriteJournalAfterReopen(storage, entryId);
}

export function listJournalForProject(
  storage: SourceWriteJournalStorage,
  projectId: string,
): SourceWriteJournalEntry[] {
  return listSourceWriteJournal(storage).entries.filter((entry) => entry.projectId === projectId);
}
