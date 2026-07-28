import { describe, expect, it } from "vitest";
import {
  clearStudioIndexedDbMemory,
  classifySourceWriteObservation,
  getStudioIndexedDbSnapshotDiagnostics,
  listSourceWriteIntents,
  loadProjectSnapshot,
  replaySourceWriteIntent,
  saveProjectSnapshot,
  saveSourceWriteIntent,
} from "../app/StudioIndexedDbSnapshot";
import { createSourceWriteReceipt } from "../app/StudioSourceWriteReceipt";

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
    const pending = await saveSourceWriteIntent({
      intentId: "intent-1",
      path: "chars/nova/nova.cns",
      preimage,
      projectId: "project-1",
      sourcePackageId: "nova",
      baseSourceFingerprint: "sha256:base",
      draftDigest: "fnv1a32:deadbeef",
      byteLength: preimage.byteLength,
    });
    expect(pending.preimageBytes.length).toBe(preimage.length);
    expect(pending.preimageSha256).toMatch(/^[0-9a-f]{8}$/);
    const listed = (await listSourceWriteIntents())[0];
    expect(listed).toMatchObject({
      intentId: "intent-1",
      projectId: "project-1",
      sourcePackageId: "nova",
      phase: "preimage-captured",
    });
    expect(listed?.result).toBeUndefined();
    const receipt = createSourceWriteReceipt({
      id: "source-write:intent-1",
      sourcePackageId: "nova",
      sourceName: "Nova",
      path: pending.path,
      status: "committed",
      reason: "write-and-reimport",
      observedAt: "2026-07-28T00:00:00.000Z",
      operation: "directory-exclusive-write-and-reimport",
      observedSourceFingerprint: "sha256:after",
      committedSourceFingerprint: "sha256:after",
      draftDigest: "fnv1a32:draft",
      committedDigest: "fnv1a32:draft",
      byteLength: 13,
      invalidatedOutputs: [],
      diagnostics: [],
    });
    const committed = await saveSourceWriteIntent({
      intentId: "intent-1",
      path: pending.path,
      preimage,
      phase: "settled",
      writeByteLength: 13,
      observedSourceFingerprint: "b".repeat(64),
      baseSourceFingerprint: pending.baseSourceFingerprint,
      receiptId: "source-write:intent-1",
      receipt,
      result: "committed",
      recovery: "none",
      createdAt: pending.createdAt,
    });
    expect(committed.createdAt).toBe(pending.createdAt);
    expect(committed).toMatchObject({
      result: "committed",
      phase: "settled",
      writeByteLength: 13,
      observedSourceFingerprint: "b".repeat(64),
      receiptId: "source-write:intent-1",
      baseSourceFingerprint: "sha256:base",
    });
    expect(committed.receipt).toEqual(receipt);
    const replay = await replaySourceWriteIntent("intent-1");
    expect(replay.ok).toBe(true);
    expect([...replay.bytes!]).toEqual([...preimage]);
  });

  it("retains the last durable phase when a receipt has not settled yet", async () => {
    clearStudioIndexedDbMemory();
    const preimage = new TextEncoder().encode("before-write");
    await saveSourceWriteIntent({
      intentId: "intent-phase-1",
      path: "chars/kfm/kfm.cns",
      preimage,
      phase: "write-closed",
      writeByteLength: 13,
      draftDigest: "fnv1a32:write",
    });

    const listed = (await listSourceWriteIntents())[0];
    expect(listed).toMatchObject({
      intentId: "intent-phase-1",
      phase: "write-closed",
      writeByteLength: 13,
      observation: { status: "needs-observation", diagnostics: [] },
    });
    expect(listed?.result).toBeUndefined();
  });

  it("classifies observed bytes without settling the write intent", async () => {
    clearStudioIndexedDbMemory();
    const preimage = new TextEncoder().encode("before-write");
    const observedDraft = new TextEncoder().encode("draft-write");
    expect(classifySourceWriteObservation({ observedBytes: preimage, preimageBytes: preimage, draftMatches: false })).toBe("matches-preimage");
    expect(classifySourceWriteObservation({ observedBytes: observedDraft, preimageBytes: preimage, draftMatches: true })).toBe("matches-draft");
    expect(classifySourceWriteObservation({ observedBytes: new TextEncoder().encode("other"), preimageBytes: preimage, draftMatches: false })).toBe("changed");

    const pending = await saveSourceWriteIntent({
      intentId: "intent-observation-1",
      path: "chars/kfm/kfm.cns",
      preimage,
      phase: "write-closed",
      writeByteLength: observedDraft.byteLength,
      draftDigest: "fnv1a32:write",
      observation: {
        status: "matches-draft",
        observedAt: "2026-07-28T00:00:00.000Z",
        digest: "sha256:observed",
        byteLength: observedDraft.byteLength,
        permission: "granted",
        diagnostics: ["The source matches the draft semantic digest."],
      },
    });
    expect(pending.observation?.status).toBe("matches-draft");
    expect(pending.result).toBeUndefined();
    expect(pending.phase).toBe("write-closed");
  });

  it("fails closed when a persisted receipt digest is invalid", async () => {
    clearStudioIndexedDbMemory();
    const receipt = createSourceWriteReceipt({
      id: "source-write:invalid-receipt",
      sourcePackageId: "nova",
      sourceName: "Nova",
      path: "chars/nova/nova.cns",
      status: "committed",
      reason: "write-and-reimport",
      observedAt: "2026-07-28T00:00:00.000Z",
      operation: "directory-exclusive-write-and-reimport",
      invalidatedOutputs: [],
      diagnostics: [],
    });
    receipt.digest = "fnv1a32:00000000";

    await expect(saveSourceWriteIntent({
      intentId: "intent-invalid-receipt",
      path: receipt.path,
      preimage: new TextEncoder().encode("before"),
      phase: "settled",
      receiptId: receipt.id,
      receipt,
      result: "committed",
    })).rejects.toThrow("Source write intent receipt is invalid");
    expect(await listSourceWriteIntents()).toEqual([]);
  });
});
