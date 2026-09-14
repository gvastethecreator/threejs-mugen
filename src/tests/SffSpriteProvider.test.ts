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

  it("remaps only sprites that use the authored source palette", async () => {
    const matched = indexedSprite({ group: 10, index: 0, sourcePalette: [1, 1] });
    const other = indexedSprite({ group: 20, index: 0, sourcePalette: [1, 3] });
    const truecolor: MugenSprite = {
      group: 30,
      index: 0,
      width: 2,
      height: 2,
      axisX: 0,
      axisY: 0,
      raw: { truecolor: true },
    };
    const dest = actPalette(1, 2, "pal2.act", [0, 0, 0, 10, 20, 30]);
    const otherDest = actPalette(1, 4, "pal4.act", [0, 0, 0, 40, 50, 60]);
    const provider = new SffSpriteProvider(
      { version: "v1", warnings: [], sprites: [matched, other, truecolor] },
      [dest, otherDest],
    );
    const remap = { source: [1, 1] as [number, number], dest: [1, 2] as [number, number] };

    const remapped = await provider.getSprite(10, 0, { paletteRemap: remap });
    const untouched = await provider.getSprite(20, 0, { paletteRemap: remap });
    const skippedTruecolor = await provider.getSprite(30, 0, { paletteRemap: remap });

    expect(remapped).not.toBe(matched);
    expect(remapped?.indexed?.palette.bytes.slice(0, 6)).toEqual(new Uint8Array([0, 0, 0, 10, 20, 30]));
    expect(untouched).toBe(other);
    expect(skippedTruecolor).toBe(truecolor);

    const recached = await provider.getSprite(10, 0, { paletteRemap: remap });
    expect(recached).toBe(remapped);

    const replaced = await provider.getSprite(10, 0, { paletteRemap: { source: [1, 1], dest: [1, 4] } });
    expect(replaced).not.toBe(remapped);
    expect(replaced?.indexed?.palette.bytes.slice(3, 6)).toEqual(new Uint8Array([40, 50, 60]));
    expect(await provider.getSprite(10, 0)).toBe(matched);
  });

  it("does not remap v1 sprites by group or index when provenance differs", async () => {
    const idle = indexedSprite({ group: 0, index: 0, sourcePalette: [1, 3] });
    const attack = indexedSprite({ group: 200, index: 0, sourcePalette: [1, 1] });
    const dest = actPalette(1, 2, "pal2.act", [0, 0, 0, 240, 32, 80, 35, 195, 255]);
    const provider = new SffSpriteProvider({ version: "v1", warnings: [], sprites: [idle, attack] }, [dest]);
    const remap = { source: [1, 1] as [number, number], dest: [1, 2] as [number, number] };

    expect(await provider.getSprite(0, 0, { paletteRemap: remap })).toBe(idle);
    const remapped = await provider.getSprite(200, 0, { paletteRemap: remap });
    expect(remapped).not.toBe(attack);
    expect(remapped?.indexed?.palette.bytes.slice(3, 6)).toEqual(new Uint8Array([240, 32, 80]));
    expect(remapped?.indexed?.pixels[0]).toBe(0);
  });

  it("keeps remapped textures isolated per owner and restores the source mapping", async () => {
    const sprite = indexedSprite({ group: 200, index: 0, sourcePalette: [1, 1] });
    const pal2 = actPalette(1, 2, "pal2.act", [0, 0, 0, 240, 32, 80]);
    const pal3 = actPalette(1, 3, "pal3.act", [0, 0, 0, 10, 200, 30]);
    const provider = new SffSpriteProvider({ version: "v1", warnings: [], sprites: [sprite] }, [pal2, pal3]);

    const p1 = await provider.getSprite(200, 0, { ownerId: "p1", paletteRemap: { source: [1, 1], dest: [1, 2] } });
    const p2 = await provider.getSprite(200, 0, { ownerId: "p2", paletteRemap: { source: [1, 1], dest: [1, 3] } });
    expect(p1).not.toBe(p2);
    expect(p1?.indexed?.palette.bytes.slice(3, 6)).toEqual(new Uint8Array([240, 32, 80]));
    expect(p2?.indexed?.palette.bytes.slice(3, 6)).toEqual(new Uint8Array([10, 200, 30]));
    expect(await provider.getSprite(200, 0, { ownerId: "p1" })).toBe(sprite);
  });
});

function indexedSprite(options: { group?: number; index?: number; sourcePalette?: [number, number] } = {}): MugenSprite {
  return {
    group: options.group ?? 10,
    index: options.index ?? 0,
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
        sourcePalette: options.sourcePalette ?? [1, 1],
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
