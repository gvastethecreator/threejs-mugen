import { describe, expect, it, vi } from "vitest";
import {
  createSourceWritePlan,
  SourceHandleWriteError,
  sourceWritePathSegments,
  writeSourceHandleText,
} from "../app/StudioSourceWrite";
import { createSourceHandleRecord, type SourceHandleLike } from "../app/StudioSourceHandle";
import { createSourceTransactionRecord } from "../app/StudioSourceTransaction";
import type { GameProjectSourcePackage } from "../app/StudioModel";

describe("StudioSourceWrite", () => {
  it("keeps ZIP packages read-only", () => {
    const packageRecord = sourcePackage({ kind: "zip" });
    const plan = createSourceWritePlan({
      sourcePackage: packageRecord,
      sourceTransaction: transaction(packageRecord),
      sourceHandle: handleRecord(packageRecord),
      handle: writableFolder(),
      path: "chars/kfm/kfm.cns",
    });

    expect(plan).toMatchObject({ status: "blocked", reason: "zip-source" });
  });

  it("requires a matched identity, granted directory handle, and safe source path", () => {
    const packageRecord = sourcePackage({ kind: "folder", identityStatus: "unknown" });
    const unknownPlan = createSourceWritePlan({
      sourcePackage: packageRecord,
      sourceTransaction: transaction(packageRecord),
      sourceHandle: handleRecord(packageRecord),
      handle: writableFolder(),
      path: "kfm/chars/kfm.cns",
    });
    expect(unknownPlan).toMatchObject({ status: "blocked", reason: "identity-unknown" });

    const matchedPackage = sourcePackage({ kind: "folder" });
    const readyPlan = createSourceWritePlan({
      sourcePackage: matchedPackage,
      sourceTransaction: transaction(matchedPackage),
      sourceHandle: handleRecord(matchedPackage),
      handle: writableFolder(),
      path: "kfm/chars/kfm.cns",
    });
    expect(readyPlan).toMatchObject({ status: "ready" });

    expect(() => sourceWritePathSegments("kfm", "kfm/../escape.cns")).toThrow(SourceHandleWriteError);
  });

  it("writes nested source text through an exclusive staged stream", async () => {
    const writable = {
      write: vi.fn(),
      close: vi.fn(),
      abort: vi.fn(),
    };
    const fileHandle: SourceHandleLike = {
      kind: "file",
      name: "kfm.cns",
      createWritable: vi.fn(async (options) => {
        expect(options).toEqual({ keepExistingData: false, mode: "exclusive" });
        return writable;
      }),
    };
    const charsDirectory: SourceHandleLike = {
      kind: "directory",
      name: "chars",
      getFileHandle: vi.fn(async (name, options) => {
        expect(name).toBe("kfm.cns");
        expect(options).toEqual({ create: false });
        return fileHandle;
      }),
    };
    const root = {
      ...writableFolder(),
      getDirectoryHandle: vi.fn(async (name, options) => {
        expect(name).toBe("chars");
        expect(options).toEqual({ create: false });
        return charsDirectory;
      }),
    } satisfies SourceHandleLike;

    await expect(writeSourceHandleText(root, "kfm/chars/kfm.cns", "[Statedef 0]\n")).resolves.toMatchObject({
      path: "kfm/chars/kfm.cns",
      byteLength: 13,
    });
    expect(writable.write).toHaveBeenCalledWith("[Statedef 0]\n");
    expect(writable.close).toHaveBeenCalledTimes(1);
    expect(writable.abort).not.toHaveBeenCalled();
  });

  it("aborts a staged stream when close fails", async () => {
    const writable = {
      write: vi.fn(),
      close: vi.fn(async () => { throw new DOMException("locked", "NoModificationAllowedError"); }),
      abort: vi.fn(),
    };
    const fileHandle: SourceHandleLike = { kind: "file", createWritable: vi.fn(async () => writable) };
    const root: SourceHandleLike = {
      ...writableFolder(),
      getFileHandle: vi.fn(async () => fileHandle),
    };

    await expect(writeSourceHandleText(root, "kfm.cns", "changed")).rejects.toMatchObject({
      name: "SourceHandleWriteError",
      code: "conflict",
    });
    expect(writable.abort).toHaveBeenCalledTimes(1);
  });
});

function sourcePackage(overrides: Partial<GameProjectSourcePackage> = {}): GameProjectSourcePackage {
  return {
    id: "kfm-folder",
    name: "kfm",
    kind: "folder",
    fileCount: 5,
    status: "linked",
    stageIds: [],
    stageDefPaths: [],
    requiredPaths: ["kfm/chars/kfm.cns"],
    fingerprint: "a".repeat(64),
    fingerprintAlgorithm: "sha-256",
    byteLength: 5,
    observedFingerprint: "a".repeat(64),
    observedByteLength: 5,
    identityStatus: "matched",
    ...overrides,
  };
}

function handleRecord(source: GameProjectSourcePackage) {
  return createSourceHandleRecord({
    sourcePackage: source,
    capability: "available",
    storage: "memory",
    permission: "granted",
    handleLinked: true,
    persisted: false,
    sourceAvailable: true,
    handleKind: "directory",
    observedFingerprint: source.observedFingerprint,
  });
}

function transaction(source: GameProjectSourcePackage) {
  return createSourceTransactionRecord({ sourcePackage: source, permission: "granted", expectedRevision: 1, observedRevision: 1 });
}

function writableFolder(): SourceHandleLike {
  return { kind: "directory", name: "kfm", getDirectoryHandle: vi.fn(), getFileHandle: vi.fn() };
}
