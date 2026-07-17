import { describe, expect, it, vi } from "vitest";
import {
  captureSourceWritePreimage,
  createSourceWritePlan,
  readSourceHandleBytes,
  restoreSourceWritePreimage,
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

  it("retains a byte preimage and proves exact restore after a post-close failure", async () => {
    const source = mutableFileHandle("before\u0000bytes");
    const preimage = await captureSourceWritePreimage(source.root, "kfm.cns");

    await writeSourceHandleText(source.root, "kfm.cns", "edited");
    expect(new TextDecoder().decode((await readSourceHandleBytes(source.root, "kfm.cns")).bytes)).toBe("edited");

    const compensation = await restoreSourceWritePreimage(source.root, preimage);

    expect(compensation).toMatchObject({
      status: "restored",
      preimageDigest: preimage.digest,
      preimageByteLength: preimage.byteLength,
      restoredDigest: preimage.digest,
      restoredByteLength: preimage.byteLength,
      diagnostics: [],
    });
    expect((await readSourceHandleBytes(source.root, "kfm.cns")).bytes).toEqual(preimage.bytes);
  });

  it("emits restore-failed evidence when the compensating writer is rejected", async () => {
    const source = mutableFileHandle("before");
    const preimage = await captureSourceWritePreimage(source.root, "kfm.cns");
    await writeSourceHandleText(source.root, "kfm.cns", "edited");
    source.failWrites = true;

    const compensation = await restoreSourceWritePreimage(source.root, preimage);

    expect(compensation.status).toBe("restore-failed");
    expect(compensation.preimageDigest).toBe(preimage.digest);
    expect(compensation.diagnostics.join(" ")).toContain("Could not write source file");
  });

  it("fails closed when the preimage cannot be read", async () => {
    const source = mutableFileHandle("before");
    source.failReads = true;

    await expect(captureSourceWritePreimage(source.root, "kfm.cns")).rejects.toMatchObject({
      name: "SourceHandleWriteError",
      code: "write-failed",
    });
  });

  it("emits restore-failed evidence when restored bytes do not verify", async () => {
    const source = mutableFileHandle("before");
    const preimage = await captureSourceWritePreimage(source.root, "kfm.cns");
    await writeSourceHandleText(source.root, "kfm.cns", "edited");
    source.corruptWrites = true;

    const compensation = await restoreSourceWritePreimage(source.root, preimage);

    expect(compensation.status).toBe("restore-failed");
    expect(compensation.restoredDigest).not.toBe(preimage.digest);
    expect(compensation.diagnostics.join(" ")).toContain("do not match");
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

function mutableFileHandle(initialText: string): {
  root: SourceHandleLike;
  failWrites: boolean;
  failReads: boolean;
  corruptWrites: boolean;
} {
  let bytes = new TextEncoder().encode(initialText);
  const state = { failWrites: false, failReads: false, corruptWrites: false };
  const fileHandle: SourceHandleLike = {
    kind: "file",
    name: "kfm.cns",
    getFile: vi.fn(async () => {
      if (state.failReads) {
        throw new Error("injected preimage read failure");
      }
      return ({ arrayBuffer: async () => bytes.slice().buffer }) as unknown as File;
    }),
    createWritable: vi.fn(async () => ({
      write: async (data: string | Uint8Array) => {
        if (state.failWrites) {
          throw new Error("injected restore write failure");
        }
        bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
        if (state.corruptWrites) {
          bytes = new TextEncoder().encode("corrupted restore");
        }
      },
      close: async () => undefined,
      abort: async () => undefined,
    })),
  };
  return {
    get failWrites() {
      return state.failWrites;
    },
    set failWrites(value: boolean) {
      state.failWrites = value;
    },
    get failReads() {
      return state.failReads;
    },
    set failReads(value: boolean) {
      state.failReads = value;
    },
    get corruptWrites() {
      return state.corruptWrites;
    },
    set corruptWrites(value: boolean) {
      state.corruptWrites = value;
    },
    root: {
      kind: "directory",
      name: "kfm",
      getFileHandle: vi.fn(async () => fileHandle),
    },
  };
}
