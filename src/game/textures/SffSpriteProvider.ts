import type { MugenSprite, SffArchive, SpriteProvider } from "../../mugen/model/MugenSprite";

export class SffSpriteProvider implements SpriteProvider {
  private readonly sprites = new Map<string, MugenSprite>();
  readonly minGroup: number;
  readonly maxGroup: number;

  constructor(private readonly archive: SffArchive) {
    for (const sprite of archive.sprites) {
      this.sprites.set(spriteKey(sprite.group, sprite.index), sprite);
    }
    const groups = archive.sprites.map((sprite) => sprite.group);
    this.minGroup = groups.length ? Math.min(...groups) : 0;
    this.maxGroup = groups.length ? Math.max(...groups) : 0;
  }

  get hasSprites(): boolean {
    return this.archive.sprites.length > 0;
  }

  async getSprite(group: number, index: number): Promise<MugenSprite | undefined> {
    return this.sprites.get(spriteKey(group, index));
  }
}

function spriteKey(group: number, index: number): string {
  return `${group}:${index}`;
}
