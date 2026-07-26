import { describe, expect, it } from "vitest";
import {
  journalFromSourceWriteReceipt,
  listJournalForProject,
  replayJournalAfterProjectReopen,
} from "../app/SourceWriteJournalBridge";
import { createSourceWriteReceipt } from "../app/StudioSourceWriteReceipt";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("SourceWriteJournalBridge", () => {
  it("journals a committed receipt and replays after reopen", () => {
    const storage = memoryStorage();
    const receipt = createSourceWriteReceipt({
      id: "source-write:pkg:chars/a.cns",
      sourcePackageId: "pkg",
      sourceName: "pkg",
      path: "chars/a.cns",
      status: "committed",
      reason: "write-and-reimport",
      observedAt: "2026-07-26T22:00:00.000Z",
      operation: "directory-exclusive-write-and-reimport",
      draftDigest: "draft-1",
      committedDigest: "commit-1",
      baseSourceFingerprint: "base-1",
      invalidatedOutputs: [],
      diagnostics: [],
    });
    const bridged = journalFromSourceWriteReceipt({
      storage,
      receipt,
      projectId: "proj-1",
      preimageBytes: "old",
      writeBytes: "new",
    });
    expect(bridged.entry.status).toBe("committed");
    expect(bridged.linkedReceiptId).toBe(receipt.id);
    expect(listJournalForProject(storage, "proj-1")).toHaveLength(1);
    const replay = replayJournalAfterProjectReopen(storage, bridged.entry.id);
    expect(replay.replayed).toBe(true);
  });

  it("maps permission blocked receipts to permission-revoked journal status", () => {
    const storage = memoryStorage();
    const receipt = createSourceWriteReceipt({
      id: "source-write:pkg:blocked",
      sourcePackageId: "pkg",
      sourceName: "pkg",
      path: "chars/a.cns",
      status: "blocked",
      reason: "permission",
      observedAt: "2026-07-26T22:00:00.000Z",
      operation: "directory-exclusive-write-and-reimport",
      invalidatedOutputs: [],
      diagnostics: ["permission"],
    });
    const bridged = journalFromSourceWriteReceipt({
      storage,
      receipt,
      projectId: "proj-1",
    });
    expect(bridged.entry.status).toBe("permission-revoked");
    expect(bridged.replayable).toBe(false);
  });
});
