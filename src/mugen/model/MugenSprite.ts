export type MugenSprite = {
  group: number;
  index: number;
  width: number;
  height: number;
  axisX: number;
  axisY: number;
  imageBitmap?: ImageBitmap;
  canvas?: HTMLCanvasElement;
  raw?: unknown;
};

export type SffPaletteSummary = {
  group: number;
  index: number;
  colors: number;
  linkedIndex?: number;
};

export type SffArchiveMetadata = {
  versionLabel?: string;
  spriteTotal: number;
  paletteTotal: number;
  decodedSprites: number;
  formatCounts: Record<string, number>;
  unsupportedFormats: Record<string, number>;
  palettes?: SffPaletteSummary[];
};

export type SffArchive = {
  version: "v1" | "v2" | "unknown";
  sprites: MugenSprite[];
  warnings: string[];
  metadata?: SffArchiveMetadata;
};

export interface ISffReader {
  load(buffer: ArrayBuffer): Promise<SffArchive>;
  getSprite(group: number, index: number): MugenSprite | undefined;
}

export type SpriteLookupContext = {
  ownerId?: string;
};

export interface SpriteProvider {
  getSprite(group: number, index: number, context?: SpriteLookupContext): Promise<MugenSprite | undefined>;
}
