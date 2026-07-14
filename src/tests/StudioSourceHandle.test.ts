import { describe, expect, it, vi } from "vitest";
import {
  createMemorySourceHandleStore,
  createSourceHandleRecord,
  pickSourceHandle,
  querySourceHandlePermission,
  readSourceHandleFolder,
  readSourceHandleFile,
  querySourceHandleWritePermission,
  requestSourceHandlePermission,
  requestSourceHandleWritePermission,
  SOURCE_HANDLE_SCHEMA,
  type SourceHandleLike,
} from "../app/StudioSourceHandle";
import type { GameProjectSourcePackage } from "../app/StudioModel";

describe("StudioSourceHandle", () => {
  it("exposes an explicit link action before a handle has been persisted", () => {
    const record = createSourceHandleRecord({
      sourcePackage: sourcePackage(),
      capability: "available",
      storage: "indexeddb",
      permission: "not-requested",
      handleLinked: false,
      persisted: false,
      updatedAt: "2026-07-13T00:00:00.000Z",
    });

    expect(record).toMatchObject({
      schemaVersion: SOURCE_HANDLE_SCHEMA,
      state: "not-linked",
      nextAction: "link-handle",
      canRead: false,
      persisted: false,
    });
  });

  it("allows recovery from a granted persisted handle when the active session is missing", () => {
    const record = createSourceHandleRecord({
      sourcePackage: sourcePackage({ status: "missing" }),
      capability: "available",
      storage: "indexeddb",
      permission: "granted",
      handleLinked: true,
      persisted: true,
      sourceAvailable: true,
      observedFingerprint: "a".repeat(64),
    });

    expect(record).toMatchObject({
      state: "granted",
      nextAction: "recover-source",
      canRead: true,
      persisted: true,
    });
  });

  it("blocks recovery when the persisted source fingerprint is stale", () => {
    const record = createSourceHandleRecord({
      sourcePackage: sourcePackage({ status: "missing" }),
      capability: "available",
      storage: "indexeddb",
      permission: "granted",
      handleLinked: true,
      persisted: true,
      sourceAvailable: true,
      observedFingerprint: "b".repeat(64),
    });

    expect(record).toMatchObject({
      state: "stale",
      nextAction: "relink-source",
      canRead: false,
      observedFingerprint: "b".repeat(64),
    });
    expect(record.warnings).toContain("Source fingerprint changed; recover is blocked until the package is explicitly relinked.");
  });

  it("requests read permission only while the handle is still promptable", async () => {
    const handle: SourceHandleLike = {
      kind: "file",
      name: "kfm.zip",
      queryPermission: vi.fn(async () => "prompt"),
      requestPermission: vi.fn(async () => "granted"),
    };

    expect(await querySourceHandlePermission(handle)).toBe("prompt");
    expect(await requestSourceHandlePermission(handle)).toBe("granted");
    expect(handle.requestPermission).toHaveBeenCalledWith({ mode: "read" });
  });

  it("requests readwrite permission separately before a source write", async () => {
    const handle: SourceHandleLike = {
      kind: "directory",
      queryPermission: vi.fn(async ({ mode }: { mode?: "read" | "readwrite" } = {}) => mode === "readwrite" ? "prompt" : "granted"),
      requestPermission: vi.fn(async ({ mode }: { mode?: "read" | "readwrite" } = {}) => mode === "readwrite" ? "granted" : "granted"),
    };

    expect(await querySourceHandleWritePermission(handle)).toBe("prompt");
    expect(await requestSourceHandleWritePermission(handle)).toBe("granted");
    expect(handle.requestPermission).toHaveBeenCalledWith({ mode: "readwrite" });
  });

  it("keeps handles separate from project manifests in the memory fallback store", async () => {
    const store = createMemorySourceHandleStore();
    const handle: SourceHandleLike = { kind: "file", name: "kfm.zip", getFile: vi.fn() };
    const record = createSourceHandleRecord({
      sourcePackage: sourcePackage(),
      capability: "available",
      storage: "memory",
      permission: "granted",
      handleLinked: true,
      persisted: true,
      sourceAvailable: true,
    });

    await store.put({ record, handle });
    const loaded = await store.get(record.sourcePackageId);
    expect(loaded?.record).toMatchObject({ schemaVersion: SOURCE_HANDLE_SCHEMA, persisted: false });
    expect(loaded?.handle).toBe(handle);
    expect((await store.list())).toHaveLength(1);
  });

  it("uses the native picker for ZIP handles and reads the selected file", async () => {
    const file = { name: "kfm.zip", size: 3, arrayBuffer: vi.fn(async () => new ArrayBuffer(3)) } as unknown as File;
    const handle: SourceHandleLike = {
      kind: "file",
      name: "kfm.zip",
      getFile: vi.fn(async () => file),
    };
    const host = {
      showOpenFilePicker: vi.fn(async () => [handle]),
    };

    await expect(pickSourceHandle(host, "zip")).resolves.toBe(handle);
    await expect(readSourceHandleFile(handle)).resolves.toBe(file);
    expect(host.showOpenFilePicker).toHaveBeenCalledWith({
      multiple: false,
      types: [{ description: "MUGEN source ZIP", accept: { "application/zip": [".zip"] } }],
    });
  });

  it("recursively reads directory handles with stable relative paths", async () => {
    const defFile = { kind: "file" as const, name: "kfm.def", getFile: vi.fn(async () => new File(["def"], "kfm.def")) };
    const nestedDirectory = {
      kind: "directory" as const,
      name: "chars",
      values: async function* () {
        yield defFile;
      },
    };
    const root = {
      kind: "directory" as const,
      name: "kfm",
      values: async function* () {
        yield nestedDirectory;
      },
    };

    await expect(readSourceHandleFolder(root)).resolves.toEqual([
      { file: expect.any(File), relativePath: "kfm/chars/kfm.def" },
    ]);
    expect(defFile.getFile).toHaveBeenCalledTimes(1);
  });

  it("rejects unsafe native directory entry names before adding them to the VFS", async () => {
    const root = {
      kind: "directory" as const,
      name: "kfm",
      values: async function* () {
        yield { kind: "file" as const, name: "../escape.def", getFile: vi.fn() };
      },
    };

    await expect(readSourceHandleFolder(root)).rejects.toMatchObject({
      name: "SourceHandleReadError",
      code: "read-failed",
    });
  });
});

function sourcePackage(overrides: Partial<GameProjectSourcePackage> = {}): GameProjectSourcePackage {
  return {
    id: "kfm-official",
    name: "kfm-official.zip",
    kind: "zip",
    fileCount: 5,
    status: "linked",
    stageIds: [],
    stageDefPaths: [],
    requiredPaths: ["chars/kfm/kfm.def"],
    fingerprint: "a".repeat(64),
    fingerprintAlgorithm: "sha-256",
    byteLength: 5,
    observedFingerprint: "a".repeat(64),
    observedByteLength: 5,
    identityStatus: "matched",
    ...overrides,
  };
}
