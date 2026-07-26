import { describe, expect, it } from "vitest";
import {
  listSourceWriteJournal,
  replaySourceWriteJournalAfterReopen,
  runSourceWriteJournal,
  saveSourceWriteJournalEntry,
} from "../app/SourceWriteJournal";

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

describe("SourceWriteJournal", () => {
  it("commits intent → preimage → write → verify → commit", () => {
    const result = runSourceWriteJournal({
      id: "jw-1",
      projectId: "proj",
      path: "chars/a/cns",
      intentBytes: "new-body",
      preimageBytes: "old-body",
      writeBytes: "new-body",
      observedAt: "2026-07-26T20:00:00.000Z",
    });
    expect(result.entry.status).toBe("committed");
    expect(result.entry.phases).toEqual(["intent", "preimage", "write", "verify", "commit"]);
    expect(result.restoredPreimage).toBe(false);
    expect(result.entry.committedDigest).toBeTruthy();
  });

  it("rolls back on verify fault and remains replayable after reopen", () => {
    const storage = memoryStorage();
    const result = runSourceWriteJournal({
      id: "jw-2",
      projectId: "proj",
      path: "chars/a/cns",
      intentBytes: "x",
      preimageBytes: "old",
      writeBytes: "x",
      fault: "verify-failed",
      maxRetries: 0,
      observedAt: "2026-07-26T20:00:00.000Z",
    });
    expect(result.entry.status).toBe("rolled-back");
    expect(result.restoredPreimage).toBe(true);
    expect(result.entry.phases).toContain("rollback");
    saveSourceWriteJournalEntry(storage, result.entry);
    expect(listSourceWriteJournal(storage).entries).toHaveLength(1);
    const replay = replaySourceWriteJournalAfterReopen(storage, "jw-2");
    expect(replay.replayed).toBe(true);
    expect(replay.entry?.phases).toContain("replay");
  });

  it("fails closed on permission revocation", () => {
    const result = runSourceWriteJournal({
      id: "jw-3",
      projectId: "proj",
      path: "chars/a/cns",
      intentBytes: "x",
      preimageBytes: "old",
      writeBytes: "x",
      fault: "permission-revoked",
    });
    expect(result.entry.status).toBe("permission-revoked");
    expect(result.replayable).toBe(false);
  });
});
