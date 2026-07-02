export type MugenPalette = {
  group?: number;
  index: number;
  path: string;
  colors?: string[];
  data?: Uint8Array;
  colorCount?: number;
  transparentIndex?: number;
  raw?: unknown;
};
