import JSZip from "jszip";
import { describe, expect, it, vi } from "vitest";
import {
  ZIP_CHARACTER_SOURCE_POLICY,
  ZipCharacterSource,
} from "../mugen/loader/ZipCharacterSource";

describe("ZipCharacterSource", () => {
  it("loads a bounded archive", async () => {
    const source = new ZipCharacterSource(await zipFile({ "chars/test/test.def": "[Info]\nname = test" }));
    const vfs = await source.load();

    expect(ZIP_CHARACTER_SOURCE_POLICY.schema).toBe("ZipCharacterSourcePolicy/v0");
    expect(vfs.readText("chars/test/test.def")).toContain("name = test");
  });

  it("rejects invalid archive bytes with a typed error", async () => {
    const source = new ZipCharacterSource(new File(["not a zip"], "broken.zip"));
    await expect(source.load()).rejects.toMatchObject({ code: "invalid-archive" });
  });

  it("rejects compressed files above the configured archive limit", async () => {
    const source = new ZipCharacterSource(await zipFile({ "test.def": "ok" }), { maxArchiveBytes: 1 });
    await expect(source.load()).rejects.toMatchObject({ code: "archive-too-large" });
  });

  it("rejects excessive file counts", async () => {
    const source = new ZipCharacterSource(await zipFile({ "a.def": "a", "b.cns": "b" }), { maxEntries: 1 });
    await expect(source.load()).rejects.toMatchObject({ code: "too-many-entries" });
  });

  it("counts directory entries toward the archive limit", async () => {
    const zip = new JSZip();
    zip.folder("a");
    zip.folder("b");
    const file = new File([await zip.generateAsync({ type: "arraybuffer" })], "directories.zip");
    await expect(new ZipCharacterSource(file, { maxEntries: 1 }).load())
      .rejects.toMatchObject({ code: "too-many-entries" });
  });

  it("wraps entry decompression failures in the typed error contract", async () => {
    const load = vi.spyOn(JSZip, "loadAsync").mockResolvedValue({
      files: {
        bad: {
          name: "bad.cns",
          unsafeOriginalName: "bad.cns",
          dir: false,
          _data: { uncompressedSize: 1 },
          async: async () => { throw new Error("broken DEFLATE stream"); },
        },
      },
    } as unknown as JSZip);
    try {
      await expect(new ZipCharacterSource(new File(["PK"], "damaged.zip")).load())
        .rejects.toMatchObject({ code: "invalid-archive", message: expect.stringContaining("bad.cns") });
    } finally {
      load.mockRestore();
    }
  });

  it("rejects sanitized traversal paths", async () => {
    const source = new ZipCharacterSource(await zipFile({ "../escape.def": "bad" }));
    await expect(source.load()).rejects.toMatchObject({ code: "unsafe-path" });
  });

  it("rejects absolute virtual paths", async () => {
    const source = new ZipCharacterSource(await zipFile({ "/absolute.def": "bad" }));
    await expect(source.load()).rejects.toMatchObject({ code: "unsafe-path" });
  });

  it("rejects case-insensitive virtual-path collisions", async () => {
    const source = new ZipCharacterSource(await zipFile({ "chars/Test.def": "a", "chars/test.def": "b" }));
    await expect(source.load()).rejects.toMatchObject({ code: "duplicate-path" });
  });

  it("rejects oversized entries and aggregate expanded archives", async () => {
    const file = await zipFile({ "a.cns": "1234", "b.cns": "5678" });
    await expect(new ZipCharacterSource(file, { maxEntryUncompressedBytes: 3 }).load())
      .rejects.toMatchObject({ code: "entry-too-large" });
    await expect(new ZipCharacterSource(file, { maxTotalUncompressedBytes: 7 }).load())
      .rejects.toMatchObject({ code: "expanded-archive-too-large" });
  });
});

async function zipFile(files: Record<string, string>): Promise<File> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) zip.file(path, content);
  return new File([await zip.generateAsync({ type: "arraybuffer" })], "fixture.zip");
}
