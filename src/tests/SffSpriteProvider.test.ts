import { describe, expect, it } from "vitest";
import { SffSpriteProvider } from "../game/textures/SffSpriteProvider";
import type { MugenPalette } from "../mugen/model/MugenPalette";
import type { MugenSprite, SffArchive } from "../mugen/model/MugenSprite";

describe("SffSpriteProvider", () => {
  it("applies RemapPal context to indexed sprites when the destination ACT palette is loaded", async () => {
    const archive: SffArchive = {
      version: "v1",
      warnings: [],
      sprites: [indexedSprite()],
    };
    const provider = new SffSpriteProvider(archive, [actPalette(1, 2, "pal2.act", [0, 0, 0, 10, 20, 30])]);

    const remapped = await provider.getSprite(10, 0, { ownerId: "p1", paletteRemap: { source: [1, 1], dest: [1, 2] } });

    expect(remapped).toBeDefined();
    expect(remapped).not.toBe(archive.sprites[0]);
    expect(remapped?.indexed?.palette).toMatchObject({
      stride: 3,
      transparentIndex: 0,
      key: "act:1:2:pal2.act",
    });
    expect(remapped?.indexed?.palette.bytes.slice(0, 6)).toEqual(new Uint8Array([0, 0, 0, 10, 20, 30]));
    expect(remapped?.raw).toMatchObject({
      paletteRemap: {
        source: [1, 1],
        dest: [1, 2],
        palettePath: "pal2.act",
      },
    });
  });

  it("keeps original sprites when no remap palette is available", async () => {
    const sprite = indexedSprite();
    const provider = new SffSpriteProvider({ version: "v1", warnings: [], sprites: [sprite] });

    await expect(provider.getSprite(10, 0, { paletteRemap: { source: [1, 1], dest: [1, 9] } })).resolves.toBe(sprite);
  });
});

function indexedSprite(): MugenSprite {
  return {
    group: 10,
    index: 0,
    width: 2,
    height: 2,
    axisX: 1,
    axisY: 2,
    indexed: {
      pixels: new Uint8Array([0, 1, 1, 0]),
      palette: {
        bytes: new Uint8Array([0, 0, 0, 255, 255, 255]),
        stride: 3,
        transparentIndex: 0,
        key: "sff-v1:0",
      },
    },
    raw: { sff: true },
  };
}

function actPalette(group: number, index: number, path: string, bytes: number[]): MugenPalette {
  return {
    group,
    index,
    path,
    colors: ["#000000", "#0a141e"],
    data: new Uint8Array(bytes),
    colorCount: 2,
    transparentIndex: 0,
  };
}
