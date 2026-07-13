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
});
