import { describe, expect, it } from "vitest";
import {
  clearStudioIndexedDbMemory,
  getStudioIndexedDbSnapshotDiagnostics,
  loadProjectSnapshot,
  replaySourceWriteIntent,
  saveProjectSnapshot,
  saveSourceWriteIntent,
} from "../app/StudioIndexedDbSnapshot";

describe("StudioIndexedDbSnapshot", () => {
  it("reports memory authority when IndexedDB is unavailable to the test runtime", () => {
    const diagnostics = getStudioIndexedDbSnapshotDiagnostics();
    expect(diagnostics.schema).toBe("StudioIndexedDbSnapshot/v1");
    expect(diagnostics.backend).toBe("memory");
    expect(diagnostics.authoritative).toBe(false);
  });

  it("saves and reloads project snapshots fail-closed on bad revision", async () => {
    clearStudioIndexedDbMemory();
    const bad = await saveProjectSnapshot({
      schema: "StudioIndexedDbSnapshot/v1",
      projectId: "",
      revision: -1,
      authoritySha: "x",
      evidenceRefs: [],
      payload: "{}",
      savedAt: new Date().toISOString(),
    });
    expect(bad.ok).toBe(false);

    const ok = await saveProjectSnapshot({
      schema: "StudioIndexedDbSnapshot/v1",
      projectId: "proj-1",
      revision: 2,
      authoritySha: "32466c6e",
      analysisDigest: "a1",
      assetClosureDigest: "c1",
      evidenceRefs: ["docs/evidence/authority-selector-v1.json"],
      payload: JSON.stringify({ mode: "match" }),
      savedAt: "2026-07-26T00:00:00.000Z",
    });
    expect(ok).toEqual({ ok: true });
    const loaded = await loadProjectSnapshot("proj-1");
    expect(loaded?.revision).toBe(2);
    expect(loaded?.authoritySha).toBe("32466c6e");
  });

  it("persists write intent preimage and replays bytes", async () => {
    clearStudioIndexedDbMemory();
    const preimage = new TextEncoder().encode("hello-source");
    const intent = await saveSourceWriteIntent({
      intentId: "intent-1",
      path: "chars/nova/nova.cns",
      preimage,
      result: "aborted",
      recovery: "restored",
    });
    expect(intent.preimageBytes.length).toBe(preimage.length);
    expect(intent.preimageSha256).toMatch(/^[0-9a-f]{8}$/);
    const replay = await replaySourceWriteIntent("intent-1");
    expect(replay.ok).toBe(true);
    expect([...replay.bytes!]).toEqual([...preimage]);
  });
});
