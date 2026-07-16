import { describe, expect, it } from "vitest";
import { FolderCharacterSource } from "../mugen/loader/FolderCharacterSource";

describe("FolderCharacterSource", () => {
  it("keeps explicit relative paths when loading directory-handle files", async () => {
    const source = new FolderCharacterSource([
      { file: new File(["[Info]"], "kfm.def"), relativePath: "kfm/chars/kfm.def" },
      { file: new File(["[Begin Action 0]"], "kfm.air"), relativePath: "kfm/chars/kfm.air" },
    ]);

    const vfs = await source.load();

    expect(source.name).toBe("kfm");
    expect(vfs.listFiles()).toEqual(["kfm/chars/kfm.air", "kfm/chars/kfm.def"]);
    expect(vfs.readText("kfm/chars/kfm.def")).toBe("[Info]");
  });

  it("strips the selected browser directory root while preserving package-relative paths", async () => {
    const paths = [
      "repository-skyline-relay/chars/mugen-lite-journey/journey.def",
      "repository-skyline-relay/stages/skyline-relay/skyline.def",
    ];
    const files = paths.map((path) => {
      const file = new File([path], path.split("/").at(-1) ?? "source.def");
      Object.defineProperty(file, "webkitRelativePath", { value: path });
      return file;
    });
    const fileList = {
      ...Object.fromEntries(files.map((file, index) => [index, file])),
      length: files.length,
      item: (index: number) => files[index] ?? null,
    } as unknown as FileList;

    const source = new FolderCharacterSource(fileList);
    const vfs = await source.load();

    expect(source.name).toBe("repository-skyline-relay");
    expect(vfs.listFiles()).toEqual([
      "chars/mugen-lite-journey/journey.def",
      "stages/skyline-relay/skyline.def",
    ]);
  });
});
