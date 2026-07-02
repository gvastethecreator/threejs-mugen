export type IndexedPaletteData = {
  bytes: Uint8Array;
  stride: 3 | 4;
  colorCount?: number;
  transparentIndex?: number;
  key?: string;
};

export type IndexedSpriteData = {
  pixels: Uint8Array;
  palette: IndexedPaletteData;
};

export function createIndexedCanvas(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: IndexedPaletteData,
): HTMLCanvasElement | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return undefined;
  }
  const imageData = context.createImageData(width, height);
  for (let index = 0; index < pixels.length; index += 1) {
    const colorIndex = pixels[index] ?? 0;
    const paletteOffset = colorIndex * palette.stride;
    const outputOffset = index * 4;
    imageData.data[outputOffset] = palette.bytes[paletteOffset] ?? 0;
    imageData.data[outputOffset + 1] = palette.bytes[paletteOffset + 1] ?? 0;
    imageData.data[outputOffset + 2] = palette.bytes[paletteOffset + 2] ?? 0;
    imageData.data[outputOffset + 3] =
      palette.stride === 4 ? palette.bytes[paletteOffset + 3] ?? 255 : colorIndex === (palette.transparentIndex ?? 0) ? 0 : 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}
