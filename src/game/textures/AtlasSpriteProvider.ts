import type { MugenSprite, SpriteProvider } from "../../mugen/model/MugenSprite";

type AtlasRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type SpriteAtlasManifest = {
  characterId?: string;
  sprite_sheet_alpha?: string;
  frame_layout: {
    sheetWidth: number;
    sheetHeight: number;
    cellWidth: number;
    cellHeight: number;
    rows: Record<string, AtlasRect[]>;
  };
};

export type AtlasActionMapping = Record<number, string>;

const defaultActionMapping: AtlasActionMapping = {
  0: "idle",
  10: "crouch",
  20: "walk-forward",
  40: "jump",
  200: "punch",
  210: "kick",
  500: "hitstun",
};

export class AtlasSpriteProvider implements SpriteProvider {
  private readonly cache = new Map<string, MugenSprite>();

  private constructor(
    private readonly image: HTMLImageElement,
    private readonly manifest: SpriteAtlasManifest,
    private readonly actionMapping: AtlasActionMapping,
  ) {}

  static async fromFiles(
    atlasFile: File,
    manifestFile: File,
    actionMapping: AtlasActionMapping = defaultActionMapping,
  ): Promise<AtlasSpriteProvider> {
    const [manifest, image] = await Promise.all([
      manifestFile.text().then((text) => JSON.parse(text) as SpriteAtlasManifest),
      loadImageFromFile(atlasFile),
    ]);
    return new AtlasSpriteProvider(image, manifest, actionMapping);
  }

  static async fromUrls(
    atlasUrl: string,
    manifestUrl: string,
    actionMapping: AtlasActionMapping = defaultActionMapping,
  ): Promise<AtlasSpriteProvider> {
    const [manifest, image] = await Promise.all([
      fetch(manifestUrl).then((response) => response.json() as Promise<SpriteAtlasManifest>),
      loadImage(atlasUrl),
    ]);
    return new AtlasSpriteProvider(image, manifest, actionMapping);
  }

  async getSprite(group: number, index: number): Promise<MugenSprite | undefined> {
    const key = `${group}:${index}`;
    const existing = this.cache.get(key);
    if (existing) {
      return existing;
    }

    const rowName = this.resolveRowName(group);
    const rect = this.manifest.frame_layout.rows[rowName]?.[index];
    if (!rect) {
      return undefined;
    }

    const canvas = document.createElement("canvas");
    canvas.width = rect.w;
    canvas.height = rect.h;
    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }
    context.imageSmoothingEnabled = false;
    context.drawImage(this.image, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

    const sprite: MugenSprite = {
      group,
      index,
      width: rect.w,
      height: rect.h,
      axisX: Math.round(rect.w / 2),
      axisY: rect.h - 8,
      canvas,
      raw: { atlas: true, rowName, rect },
    };
    this.cache.set(key, sprite);
    return sprite;
  }

  private resolveRowName(group: number): string {
    const actionId = group % 1000;
    return this.actionMapping[actionId] ?? String(actionId);
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return loadImage(url).finally(() => {
    URL.revokeObjectURL(url);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load atlas image: ${src}`));
    image.src = src;
  });
}
