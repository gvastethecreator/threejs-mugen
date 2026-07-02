import { createIndexedCanvas } from "../../mugen/model/IndexedImage";
import type { MugenPalette } from "../../mugen/model/MugenPalette";
import type { MugenSprite, SffArchive, SpriteLookupContext, SpriteProvider } from "../../mugen/model/MugenSprite";

export class SffSpriteProvider implements SpriteProvider {
  private readonly sprites = new Map<string, MugenSprite>();
  private readonly palettes = new Map<string, MugenPalette>();
  private readonly remappedSprites = new Map<string, MugenSprite>();
  readonly minGroup: number;
  readonly maxGroup: number;

  constructor(private readonly archive: SffArchive, palettes: MugenPalette[] = []) {
    for (const sprite of archive.sprites) {
      this.sprites.set(spriteKey(sprite.group, sprite.index), sprite);
    }
    for (const palette of palettes) {
      this.palettes.set(paletteKey(palette.group ?? 1, palette.index), palette);
    }
    const groups = archive.sprites.map((sprite) => sprite.group);
    this.minGroup = groups.length ? Math.min(...groups) : 0;
    this.maxGroup = groups.length ? Math.max(...groups) : 0;
  }

  get hasSprites(): boolean {
    return this.archive.sprites.length > 0;
  }

  async getSprite(group: number, index: number, context: SpriteLookupContext = {}): Promise<MugenSprite | undefined> {
    const sprite = this.sprites.get(spriteKey(group, index));
    if (!sprite || !context.paletteRemap) {
      return sprite;
    }
    const remap = context.paletteRemap;
    if (!remap || !sprite.indexed) {
      return sprite;
    }
    const palette = this.palettes.get(paletteKey(remap.dest[0], remap.dest[1]));
    if (!palette?.data) {
      return sprite;
    }
    const cacheKey = `${spriteKey(group, index)}:${remap.source.join(",")}:${remap.dest.join(",")}:${palette.path}`;
    const cached = this.remappedSprites.get(cacheKey);
    if (cached) {
      return cached;
    }
    const remapped: MugenSprite = {
      ...sprite,
      canvas: createIndexedCanvas(sprite.width, sprite.height, sprite.indexed.pixels, {
        bytes: palette.data,
        stride: 3,
        colorCount: palette.colorCount,
        transparentIndex: palette.transparentIndex ?? 0,
        key: `act:${palette.group ?? 1}:${palette.index}:${palette.path}`,
      }),
      indexed: {
        pixels: sprite.indexed.pixels,
        palette: {
          bytes: palette.data,
          stride: 3,
          colorCount: palette.colorCount,
          transparentIndex: palette.transparentIndex ?? 0,
          key: `act:${palette.group ?? 1}:${palette.index}:${palette.path}`,
        },
      },
      raw: {
        ...(sprite.raw && typeof sprite.raw === "object" ? sprite.raw : {}),
        paletteRemap: {
          source: [...remap.source],
          dest: [...remap.dest],
          palettePath: palette.path,
        },
      },
    };
    this.remappedSprites.set(cacheKey, remapped);
    return remapped;
  }
}

function spriteKey(group: number, index: number): string {
  return `${group}:${index}`;
}

function paletteKey(group: number, index: number): string {
  return `${group}:${index}`;
}
