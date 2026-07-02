import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

describe("MugenCharacterLoader", () => {
  it("loads DEF palette slots as parsed ACT palettes", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/pal/pal.def",
      textBytes(`
[Info]
name = "Palette Test"

[Files]
pal1 = pal1.act
pal2 = pal2.act
`),
    );
    vfs.addFile("chars/pal/pal1.act", createAct([255, 0, 255]));
    vfs.addFile("chars/pal/pal2.act", createAct([0, 16, 32], { colorCount: 4, transparentIndex: 3 }));

    const character = await new MugenCharacterLoader().load("pal.zip", vfs);

    expect(character.palettes).toHaveLength(2);
    expect(character.palettes?.[0]).toMatchObject({
      group: 1,
      index: 1,
      path: "chars/pal/pal1.act",
      colorCount: 256,
    });
    expect(character.palettes?.[0]?.colors?.[0]).toBe("#ff00ff");
    expect(character.palettes?.[1]).toMatchObject({
      group: 1,
      index: 2,
      path: "chars/pal/pal2.act",
      colorCount: 4,
      transparentIndex: 3,
    });
    expect(character.compatibility.palettes).toEqual({
      total: 2,
      parsed: 2,
      colors: 260,
      withTransparency: 1,
    });
  });
});

function textBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value.trimStart());
}

function createAct(firstColor: [number, number, number], footer?: { colorCount: number; transparentIndex: number }): Uint8Array {
  const bytes = new Uint8Array(768 + (footer ? 4 : 0));
  bytes.set(firstColor, 0);
  if (footer) {
    bytes[768] = (footer.colorCount >> 8) & 0xff;
    bytes[769] = footer.colorCount & 0xff;
    bytes[770] = (footer.transparentIndex >> 8) & 0xff;
    bytes[771] = footer.transparentIndex & 0xff;
  }
  return bytes;
}
