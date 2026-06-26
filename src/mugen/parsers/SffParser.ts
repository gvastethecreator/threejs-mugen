import type { ISffReader, MugenSprite, SffArchive } from "../model/MugenSprite";

type DecodedPcx = {
  width: number;
  height: number;
  pixels: Uint8Array;
  palette?: Uint8Array;
};

type SffSubfile = {
  offset: number;
  nextOffset: number;
  length: number;
  axisX: number;
  axisY: number;
  group: number;
  index: number;
  linkedIndex: number;
  samePalette: boolean;
};

type SffV2Header = {
  versionLabel: string;
  spriteOffset: number;
  spriteTotal: number;
  paletteOffset: number;
  paletteTotal: number;
  ldataOffset: number;
  ldataLength: number;
  tdataOffset: number;
  tdataLength: number;
};

type SffV2PaletteRecord = {
  group: number;
  index: number;
  colors: number;
  linkedIndex: number;
  dataOffset: number;
  dataLength: number;
  absoluteOffset: number;
  palette?: Uint8Array;
};

type SffV2SpriteRecord = {
  recordIndex: number;
  group: number;
  index: number;
  width: number;
  height: number;
  axisX: number;
  axisY: number;
  linkedIndex: number;
  format: number;
  colorDepth: number;
  dataOffset: number;
  dataLength: number;
  paletteIndex: number;
  flags: number;
  absoluteOffset: number;
};

export class SffParser implements ISffReader {
  private archive: SffArchive = {
    version: "unknown",
    sprites: [],
    warnings: [],
  };

  async load(buffer: ArrayBuffer): Promise<SffArchive> {
    const bytes = new Uint8Array(buffer);
    const signature = new TextDecoder("ascii").decode(bytes.slice(0, 12));
    const version = detectSffVersion(bytes, signature);

    if (version !== "v1") {
      this.archive = {
        version,
        sprites: [],
        warnings: [
          version === "unknown"
            ? "SFF header was not recognized; sprite rendering will use mock textures"
            : "Detected SFF v2; sprite table could not be parsed",
        ],
      };
      if (version === "v2") {
        this.archive = parseSffV2(bytes);
      }
      return this.archive;
    }

    this.archive = parseSffV1(bytes);
    return this.archive;
  }

  getSprite(group: number, index: number): MugenSprite | undefined {
    return this.archive.sprites.find((sprite) => sprite.group === group && sprite.index === index);
  }
}

function parseSffV1(bytes: Uint8Array): SffArchive {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const warnings: string[] = [];
  const imageCount = readU32(view, 20);
  const firstSubfileOffset = readU32(view, 24);
  const subheaderSize = readU32(view, 28) || 32;
  const sprites: MugenSprite[] = [];
  const palettes: Uint8Array[] = [];

  if (firstSubfileOffset < 512 || firstSubfileOffset >= bytes.length) {
    return {
      version: "v1",
      sprites,
      warnings: [`SFF v1 first subfile offset is outside the file: ${firstSubfileOffset}`],
    };
  }

  let offset = firstSubfileOffset;
  for (let spriteNumber = 0; spriteNumber < imageCount && offset > 0; spriteNumber += 1) {
    if (offset + subheaderSize > bytes.length) {
      warnings.push(`SFF v1 subfile header ${spriteNumber} is outside the file at offset ${offset}`);
      break;
    }

    const subfile = readSubfile(view, offset);
    const previousPalette = palettes.at(-1);
    const linkedSprite = subfile.length === 0 ? sprites[subfile.linkedIndex] : undefined;

    if (subfile.length === 0) {
      if (linkedSprite) {
        sprites.push({
          ...linkedSprite,
          group: subfile.group,
          index: subfile.index,
          axisX: subfile.axisX,
          axisY: subfile.axisY,
          raw: { sff: subfile, linked: true, linkedIndex: subfile.linkedIndex },
        });
      } else {
        warnings.push(`SFF v1 linked sprite ${subfile.group},${subfile.index} references missing sprite ${subfile.linkedIndex}`);
      }
      offset = subfile.nextOffset;
      continue;
    }

    const dataStart = offset + subheaderSize;
    const dataEnd = dataStart + subfile.length;
    if (dataEnd > bytes.length) {
      warnings.push(`SFF v1 sprite ${subfile.group},${subfile.index} PCX data exceeds file bounds`);
      break;
    }

    try {
      const decoded = decodePcx(bytes.slice(dataStart, dataEnd), { expectEmbeddedPalette: !subfile.samePalette });
      const palette = selectPalette(decoded, previousPalette, subfile, warnings);
      if (palette) {
        palettes.push(palette);
      }
      sprites.push({
        group: subfile.group,
        index: subfile.index,
        width: decoded.width,
        height: decoded.height,
        axisX: subfile.axisX,
        axisY: subfile.axisY,
        canvas: palette ? createCanvas(decoded, palette) : undefined,
        raw: {
          sff: subfile,
          pcx: {
            width: decoded.width,
            height: decoded.height,
            hasPalette: Boolean(palette),
            hasEmbeddedPalette: Boolean(decoded.palette),
            usesPreviousPalette: subfile.samePalette && !decoded.palette && Boolean(palette),
            pixels: decoded.pixels,
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warnings.push(`SFF v1 sprite ${subfile.group},${subfile.index} could not be decoded: ${message}`);
    }

    offset = subfile.nextOffset;
  }

  if (sprites.length === 0) {
    warnings.push("SFF v1 parsed but no drawable sprites were decoded");
  }

  return {
    version: "v1",
    sprites,
    warnings,
    metadata: {
      versionLabel: "1",
      spriteTotal: imageCount,
      paletteTotal: palettes.length,
      decodedSprites: sprites.length,
      formatCounts: sprites.length ? { pcx8: sprites.length } : {},
      unsupportedFormats: {},
    },
  };
}

function parseSffV2(bytes: Uint8Array): SffArchive {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const warnings: string[] = [];
  const sprites: MugenSprite[] = [];
  const header = readSffV2Header(view, bytes);
  const formatCounts: Record<string, number> = {};
  const unsupportedFormats: Record<string, number> = {};

  if (!isRangeInside(header.paletteOffset, header.paletteTotal * 16, bytes.length)) {
    warnings.push(`SFF v2 palette table is outside the file: offset ${header.paletteOffset}, count ${header.paletteTotal}`);
    return createSffV2Archive(header, sprites, warnings, formatCounts, unsupportedFormats);
  }
  if (!isRangeInside(header.spriteOffset, header.spriteTotal * 28, bytes.length)) {
    warnings.push(`SFF v2 sprite table is outside the file: offset ${header.spriteOffset}, count ${header.spriteTotal}`);
    return createSffV2Archive(header, sprites, warnings, formatCounts, unsupportedFormats);
  }

  const palettes = readSffV2Palettes(view, bytes, header, warnings);
  const spriteRecords = readSffV2Sprites(view, header, warnings);
  const decodedByRecordIndex: Array<MugenSprite | undefined> = [];
  let linkedUndecodedCount = 0;
  const linkedUndecodedExamples: string[] = [];

  for (const record of spriteRecords) {
    const key = formatKey(record.format, record.colorDepth);
    increment(formatCounts, key);

    if (record.dataLength === 0) {
      const linked = decodedByRecordIndex[record.linkedIndex];
      if (linked) {
        const sprite: MugenSprite = {
          ...linked,
          group: record.group,
          index: record.index,
          axisX: record.axisX,
          axisY: record.axisY,
          raw: {
            sff: record,
            linked: true,
            linkedIndex: record.linkedIndex,
          },
        };
        sprites.push(sprite);
        decodedByRecordIndex[record.recordIndex] = sprite;
      } else {
        linkedUndecodedCount += 1;
        if (linkedUndecodedExamples.length < 5) {
          linkedUndecodedExamples.push(`${record.group},${record.index}->${record.linkedIndex}`);
        }
      }
      continue;
    }

    if (!isRangeInside(record.absoluteOffset, record.dataLength, bytes.length)) {
      warnings.push(`SFF v2 sprite ${record.group},${record.index} data exceeds file bounds`);
      increment(unsupportedFormats, key);
      continue;
    }

    const data = bytes.slice(record.absoluteOffset, record.absoluteOffset + record.dataLength);
    const palette = record.colorDepth <= 8 ? resolveSffV2Palette(record.paletteIndex, palettes, warnings) : undefined;

    try {
      const decoded = decodeSffV2Sprite(record, data, palette);
      const sprite: MugenSprite = {
        group: record.group,
        index: record.index,
        width: record.width,
        height: record.height,
        axisX: record.axisX,
        axisY: record.axisY,
        canvas: decoded.canvas,
        raw: {
          sff: record,
          pixels: decoded.pixels,
          format: key,
        },
      };
      sprites.push(sprite);
      decodedByRecordIndex[record.recordIndex] = sprite;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isUnsupportedSffV2Format(record)) {
        increment(unsupportedFormats, key);
        continue;
      }
      warnings.push(`SFF v2 sprite ${record.group},${record.index} (${key}) could not be decoded: ${message}`);
    }
  }

  if (linkedUndecodedCount > 0) {
    warnings.push(
      `SFF v2 has ${linkedUndecodedCount} linked sprite records whose source sprites were not decoded${
        linkedUndecodedExamples.length > 0 ? ` (${linkedUndecodedExamples.join(", ")})` : ""
      }`,
    );
  }

  if (Object.keys(unsupportedFormats).length > 0) {
    warnings.push(
      `SFF v2 parsed ${header.spriteTotal} sprite records and ${header.paletteTotal} palettes; decoded ${
        sprites.length
      } sprites; unsupported formats: ${formatCountsToText(unsupportedFormats)}`,
    );
  } else if (sprites.length === 0) {
    warnings.push(`SFF v2 parsed ${header.spriteTotal} sprite records but no drawable sprites were decoded`);
  }

  return createSffV2Archive(header, sprites, warnings, formatCounts, unsupportedFormats, palettes);
}

function createSffV2Archive(
  header: SffV2Header,
  sprites: MugenSprite[],
  warnings: string[],
  formatCounts: Record<string, number>,
  unsupportedFormats: Record<string, number>,
  palettes: SffV2PaletteRecord[] = [],
): SffArchive {
  return {
    version: "v2",
    sprites,
    warnings,
    metadata: {
      versionLabel: header.versionLabel,
      spriteTotal: header.spriteTotal,
      paletteTotal: header.paletteTotal,
      decodedSprites: sprites.length,
      formatCounts,
      unsupportedFormats,
      palettes: palettes.map((palette) => ({
        group: palette.group,
        index: palette.index,
        colors: palette.colors,
        linkedIndex: palette.dataLength === 0 ? palette.linkedIndex : undefined,
      })),
    },
  };
}

function readSffV2Header(view: DataView, bytes: Uint8Array): SffV2Header {
  return {
    versionLabel: `${bytes[15] ?? 0}.${bytes[14] ?? 0}.${bytes[13] ?? 0}.${bytes[12] ?? 0}`,
    spriteOffset: readU32(view, 36),
    spriteTotal: readU32(view, 40),
    paletteOffset: readU32(view, 44),
    paletteTotal: readU32(view, 48),
    ldataOffset: readU32(view, 52),
    ldataLength: readU32(view, 56),
    tdataOffset: readU32(view, 60),
    tdataLength: readU32(view, 64),
  };
}

function readSffV2Palettes(
  view: DataView,
  bytes: Uint8Array,
  header: SffV2Header,
  warnings: string[],
): SffV2PaletteRecord[] {
  const palettes: SffV2PaletteRecord[] = [];
  for (let index = 0; index < header.paletteTotal; index += 1) {
    const offset = header.paletteOffset + index * 16;
    const dataOffset = readU32(view, offset + 8);
    const dataLength = readU32(view, offset + 12);
    const record: SffV2PaletteRecord = {
      group: readU16(view, offset),
      index: readU16(view, offset + 2),
      colors: readU16(view, offset + 4),
      linkedIndex: readU16(view, offset + 6),
      dataOffset,
      dataLength,
      absoluteOffset: header.ldataOffset + dataOffset,
    };

    if (dataLength > 0) {
      if (isRangeInside(record.absoluteOffset, dataLength, bytes.length)) {
        record.palette = decodeSffV2Palette(bytes.slice(record.absoluteOffset, record.absoluteOffset + dataLength), record.colors);
      } else {
        warnings.push(`SFF v2 palette ${record.group},${record.index} data exceeds file bounds`);
      }
    }
    palettes.push(record);
  }
  return palettes;
}

function readSffV2Sprites(
  view: DataView,
  header: SffV2Header,
  warnings: string[],
): SffV2SpriteRecord[] {
  const sprites: SffV2SpriteRecord[] = [];
  for (let recordIndex = 0; recordIndex < header.spriteTotal; recordIndex += 1) {
    const offset = header.spriteOffset + recordIndex * 28;
    const flags = readU16(view, offset + 26);
    const dataOffset = readU32(view, offset + 16);
    const dataLength = readU32(view, offset + 20);
    const baseOffset = flags === 0 ? header.ldataOffset : header.tdataOffset;
    const record: SffV2SpriteRecord = {
      recordIndex,
      group: readU16(view, offset),
      index: readU16(view, offset + 2),
      width: readU16(view, offset + 4),
      height: readU16(view, offset + 6),
      axisX: readI16(view, offset + 8),
      axisY: readI16(view, offset + 10),
      linkedIndex: readU16(view, offset + 12),
      format: readU8(view, offset + 14),
      colorDepth: readU8(view, offset + 15),
      dataOffset,
      dataLength,
      paletteIndex: readU16(view, offset + 24),
      flags,
      absoluteOffset: baseOffset + dataOffset,
    };
    if (record.linkedIndex >= header.spriteTotal) {
      warnings.push(`SFF v2 sprite ${record.group},${record.index} references invalid link index ${record.linkedIndex}`);
    }
    sprites.push(record);
  }
  return sprites;
}

function decodeSffV2Palette(data: Uint8Array, colorCount: number): Uint8Array {
  const palette = new Uint8Array(colorCount * 4);
  for (let index = 0; index < colorCount; index += 1) {
    const source = index * 4;
    const target = index * 4;
    palette[target] = data[source] ?? 0;
    palette[target + 1] = data[source + 1] ?? 0;
    palette[target + 2] = data[source + 2] ?? 0;
    palette[target + 3] = index === 0 ? 0 : data[source + 3] ?? 255;
  }
  return palette;
}

function resolveSffV2Palette(
  paletteIndex: number,
  palettes: SffV2PaletteRecord[],
  warnings: string[],
  seen = new Set<number>(),
): Uint8Array | undefined {
  const record = palettes[paletteIndex];
  if (!record) {
    warnings.push(`SFF v2 sprite references missing palette index ${paletteIndex}`);
    return undefined;
  }
  if (record.palette) {
    return record.palette;
  }
  if (record.dataLength === 0 && !seen.has(paletteIndex)) {
    seen.add(paletteIndex);
    return resolveSffV2Palette(record.linkedIndex, palettes, warnings, seen);
  }
  warnings.push(`SFF v2 palette ${record.group},${record.index} has no decoded color data`);
  return undefined;
}

function decodeSffV2Sprite(
  record: SffV2SpriteRecord,
  data: Uint8Array,
  palette: Uint8Array | undefined,
): { canvas?: HTMLCanvasElement; pixels?: Uint8Array } {
  if (record.format === 0) {
    return decodeSffV2Raw(record, data, palette);
  }
  if (record.format === 2 && record.colorDepth === 8) {
    return decodeSffV2Rle8(record, data, palette);
  }
  if (record.format === 3 && record.colorDepth === 5) {
    return decodeSffV2Rle5(record, data, palette);
  }
  if (record.format === 4 && record.colorDepth === 5) {
    return decodeSffV2Lz5(record, data, palette);
  }
  throw new Error(`format ${formatKey(record.format, record.colorDepth)} is not supported by the browser decoder yet`);
}

function decodeSffV2Raw(
  record: SffV2SpriteRecord,
  data: Uint8Array,
  palette: Uint8Array | undefined,
): { canvas?: HTMLCanvasElement; pixels?: Uint8Array } {
  const pixelCount = record.width * record.height;
  if (record.colorDepth > 0 && record.colorDepth <= 8) {
    if (!palette) {
      throw new Error(`indexed RAW${record.colorDepth} sprite has no decoded palette`);
    }
    if (data.length < pixelCount) {
      throw new Error(`RAW${record.colorDepth} data ended early: ${data.length}/${pixelCount}`);
    }
    const pixels = data.slice(0, pixelCount);
    return { pixels, canvas: createIndexedCanvas(record.width, record.height, pixels, palette, 4) };
  }
  if (record.colorDepth === 24) {
    const expected = pixelCount * 3;
    if (data.length < expected) {
      throw new Error(`RAW24 data ended early: ${data.length}/${expected}`);
    }
    return { canvas: createTrueColorCanvas(record.width, record.height, data, 3) };
  }
  if (record.colorDepth === 32) {
    const expected = pixelCount * 4;
    if (data.length < expected) {
      throw new Error(`RAW32 data ended early: ${data.length}/${expected}`);
    }
    return { canvas: createTrueColorCanvas(record.width, record.height, data, 4) };
  }
  throw new Error(`RAW color depth ${record.colorDepth} is not supported`);
}

function decodeSffV2Rle8(
  record: SffV2SpriteRecord,
  data: Uint8Array,
  palette: Uint8Array | undefined,
): { canvas?: HTMLCanvasElement; pixels: Uint8Array } {
  if (!palette) {
    throw new Error("RLE8 sprite has no decoded palette");
  }
  if (data.length < 4) {
    throw new Error("RLE8 data is shorter than its uncompressed-size header");
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const expectedLength = view.getUint32(0, true);
  const pixelCount = record.width * record.height;
  if (expectedLength !== pixelCount) {
    throw new Error(`RLE8 uncompressed size ${expectedLength} does not match ${pixelCount}`);
  }

  const pixels = new Uint8Array(expectedLength);
  let cursor = 4;
  let outputCursor = 0;
  let runLength = -1;
  while (cursor < data.length && outputCursor < expectedLength) {
    const value = data[cursor++] ?? 0;
    if ((value & 0xc0) === 0x40 && runLength === -1) {
      runLength = value - 0x40;
      continue;
    }

    const count = runLength === -1 ? 1 : runLength;
    pixels.fill(value, outputCursor, Math.min(expectedLength, outputCursor + count));
    outputCursor += count;
    runLength = -1;
  }

  if (outputCursor < expectedLength) {
    throw new Error(`RLE8 data ended early: ${outputCursor}/${expectedLength}`);
  }

  return {
    pixels,
    canvas: createIndexedCanvas(record.width, record.height, pixels, palette, 4),
  };
}

function decodeSffV2Rle5(
  record: SffV2SpriteRecord,
  data: Uint8Array,
  palette: Uint8Array | undefined,
): { canvas?: HTMLCanvasElement; pixels: Uint8Array } {
  const payload = readCompressedIndexedPayload(record, data, palette, "RLE5");
  const pixels = new Uint8Array(payload.expectedLength);
  let cursor = 0;
  let outputCursor = 0;

  while (outputCursor < pixels.length) {
    const runByte = payload.bytes[cursor++];
    const descriptor = payload.bytes[cursor++];
    if (runByte === undefined || descriptor === undefined) {
      throw new Error(`RLE5 data ended early: ${outputCursor}/${pixels.length}`);
    }

    let runLength = runByte;
    let descriptorCount = descriptor & 0x7f;
    let color = 0;
    if ((descriptor & 0x80) !== 0) {
      const explicitColor = payload.bytes[cursor++];
      if (explicitColor === undefined) {
        throw new Error(`RLE5 explicit color ended early: ${outputCursor}/${pixels.length}`);
      }
      color = explicitColor;
    }

    for (;;) {
      pixels[outputCursor++] = color;
      runLength -= 1;
      if (outputCursor >= pixels.length) {
        break;
      }
      if (runLength < 0) {
        descriptorCount -= 1;
        if (descriptorCount < 0) {
          break;
        }
        const packed = payload.bytes[cursor++];
        if (packed === undefined) {
          throw new Error(`RLE5 packed run ended early: ${outputCursor}/${pixels.length}`);
        }
        color = packed & 0x1f;
        runLength = packed >> 5;
      }
    }
  }

  return {
    pixels,
    canvas: createIndexedCanvas(record.width, record.height, pixels, payload.palette, 4),
  };
}

function decodeSffV2Lz5(
  record: SffV2SpriteRecord,
  data: Uint8Array,
  palette: Uint8Array | undefined,
): { canvas?: HTMLCanvasElement; pixels: Uint8Array } {
  const payload = readCompressedIndexedPayload(record, data, palette, "LZ5");
  const pixels = new Uint8Array(payload.expectedLength);
  let cursor = 0;
  let outputCursor = 0;
  let control = payload.bytes[cursor++] ?? 0;
  let controlShift = 0;
  let recycledDistanceBits = 0;
  let recycledDistanceBitCount = 0;

  while (outputCursor < pixels.length) {
    const command = payload.bytes[cursor++];
    if (command === undefined) {
      throw new Error(`LZ5 data ended early: ${outputCursor}/${pixels.length}`);
    }

    if ((control & (1 << controlShift)) !== 0) {
      let distance = command;
      let count = 0;
      if ((distance & 0x3f) === 0) {
        const distanceLow = payload.bytes[cursor++];
        const countByte = payload.bytes[cursor++];
        if (distanceLow === undefined || countByte === undefined) {
          throw new Error(`LZ5 long back-reference ended early: ${outputCursor}/${pixels.length}`);
        }
        distance = ((distance << 2) | distanceLow) + 1;
        count = countByte + 2;
      } else {
        recycledDistanceBits |= (distance & 0xc0) >> recycledDistanceBitCount;
        recycledDistanceBitCount += 2;
        count = distance & 0x3f;
        if (recycledDistanceBitCount < 8) {
          const distanceByte = payload.bytes[cursor++];
          if (distanceByte === undefined) {
            throw new Error(`LZ5 short back-reference ended early: ${outputCursor}/${pixels.length}`);
          }
          distance = distanceByte + 1;
        } else {
          distance = recycledDistanceBits + 1;
          recycledDistanceBits = 0;
          recycledDistanceBitCount = 0;
        }
      }

      for (;;) {
        const sourceIndex = outputCursor - distance;
        if (sourceIndex < 0) {
          throw new Error(`LZ5 back-reference points before decoded data: ${sourceIndex}`);
        }
        pixels[outputCursor++] = pixels[sourceIndex] ?? 0;
        count -= 1;
        if (count < 0 || outputCursor >= pixels.length) {
          break;
        }
      }
    } else {
      let color = command;
      let count = 0;
      if ((color & 0xe0) === 0) {
        const longCount = payload.bytes[cursor++];
        if (longCount === undefined) {
          throw new Error(`LZ5 long literal run ended early: ${outputCursor}/${pixels.length}`);
        }
        count = longCount + 8;
      } else {
        count = color >> 5;
        color &= 0x1f;
      }
      for (; count > 0 && outputCursor < pixels.length; count -= 1) {
        pixels[outputCursor++] = color;
      }
    }

    controlShift += 1;
    if (controlShift >= 8) {
      control = payload.bytes[cursor++] ?? 0;
      controlShift = 0;
    }
  }

  return {
    pixels,
    canvas: createIndexedCanvas(record.width, record.height, pixels, payload.palette, 4),
  };
}

function readCompressedIndexedPayload(
  record: SffV2SpriteRecord,
  data: Uint8Array,
  palette: Uint8Array | undefined,
  label: string,
): { bytes: Uint8Array; expectedLength: number; palette: Uint8Array } {
  if (!palette) {
    throw new Error(`${label} sprite has no decoded palette`);
  }
  if (data.length < 4) {
    throw new Error(`${label} data is shorter than its uncompressed-size header`);
  }
  const expectedLength = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(0, true);
  const pixelCount = record.width * record.height;
  if (expectedLength !== pixelCount) {
    throw new Error(`${label} uncompressed size ${expectedLength} does not match ${pixelCount}`);
  }
  return {
    bytes: data.slice(4),
    expectedLength,
    palette,
  };
}

function readSubfile(view: DataView, offset: number): SffSubfile {
  return {
    offset,
    nextOffset: readU32(view, offset),
    length: readU32(view, offset + 4),
    axisX: view.getInt16(offset + 8, true),
    axisY: view.getInt16(offset + 10, true),
    group: view.getInt16(offset + 12, true),
    index: view.getInt16(offset + 14, true),
    linkedIndex: view.getUint16(offset + 16, true),
    samePalette: view.getUint8(offset + 18) !== 0,
  };
}

function decodePcx(bytes: Uint8Array, options: { expectEmbeddedPalette: boolean }): DecodedPcx {
  if (bytes.length < 128) {
    throw new Error("PCX data is shorter than its header");
  }
  if (bytes[0] !== 0x0a) {
    throw new Error("PCX manufacturer byte is not 0x0A");
  }
  if (bytes[2] !== 1) {
    throw new Error("Only PCX RLE encoding is supported");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const bitsPerPixel = bytes[3] ?? 0;
  const xmin = view.getInt16(4, true);
  const ymin = view.getInt16(6, true);
  const xmax = view.getInt16(8, true);
  const ymax = view.getInt16(10, true);
  const width = xmax - xmin + 1;
  const height = ymax - ymin + 1;
  const colorPlanes = bytes[65] ?? 0;
  const bytesPerLine = view.getUint16(66, true);

  if (bitsPerPixel !== 8 || colorPlanes !== 1) {
    throw new Error(`Only 8-bit single-plane PCX is supported; got ${bitsPerPixel}bpp/${colorPlanes} planes`);
  }
  if (width <= 0 || height <= 0 || bytesPerLine < width) {
    throw new Error(`Invalid PCX dimensions ${width}x${height} with bytesPerLine ${bytesPerLine}`);
  }

  const paletteStart = options.expectEmbeddedPalette ? findPaletteStart(bytes) : undefined;
  const rleEnd = paletteStart ?? bytes.length;
  const decodedLines = decodePcxRle(bytes, 128, rleEnd, bytesPerLine * height);
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const sourceStart = y * bytesPerLine;
    pixels.set(decodedLines.slice(sourceStart, sourceStart + width), y * width);
  }

  return {
    width,
    height,
    pixels,
    palette: paletteStart !== undefined ? bytes.slice(paletteStart, paletteStart + 768) : undefined,
  };
}

function findPaletteStart(bytes: Uint8Array): number | undefined {
  if (bytes.length >= 769 && bytes[bytes.length - 769] === 0x0c) {
    return bytes.length - 768;
  }
  if (bytes.length >= 768) {
    return bytes.length - 768;
  }
  return undefined;
}

function decodePcxRle(bytes: Uint8Array, start: number, end: number, expectedLength: number): Uint8Array {
  const output = new Uint8Array(expectedLength);
  let cursor = start;
  let outputCursor = 0;
  while (cursor < end && outputCursor < expectedLength) {
    const value = bytes[cursor++];
    if (value === undefined) {
      break;
    }
    if ((value & 0xc0) === 0xc0) {
      const count = value & 0x3f;
      const repeated = bytes[cursor++];
      if (repeated === undefined) {
        break;
      }
      output.fill(repeated, outputCursor, Math.min(expectedLength, outputCursor + count));
      outputCursor += count;
    } else {
      output[outputCursor++] = value;
    }
  }
  if (outputCursor < expectedLength) {
    throw new Error(`PCX RLE ended early: ${outputCursor}/${expectedLength} bytes`);
  }
  return output;
}

function selectPalette(
  decoded: DecodedPcx,
  previousPalette: Uint8Array | undefined,
  subfile: SffSubfile,
  warnings: string[],
): Uint8Array | undefined {
  if (subfile.samePalette) {
    if (previousPalette) {
      return previousPalette;
    }
    warnings.push(`SFF v1 sprite ${subfile.group},${subfile.index} asks for previous palette but no previous palette exists`);
  }
  if (decoded.palette) {
    return decoded.palette;
  }
  if (previousPalette) {
    warnings.push(`SFF v1 sprite ${subfile.group},${subfile.index} has no PCX palette; reusing previous palette`);
    return previousPalette;
  }
  warnings.push(`SFF v1 sprite ${subfile.group},${subfile.index} has no palette; sprite will use mock fallback`);
  return undefined;
}

function createCanvas(decoded: DecodedPcx, palette: Uint8Array): HTMLCanvasElement | undefined {
  return createIndexedCanvas(decoded.width, decoded.height, decoded.pixels, palette, 3);
}

function createIndexedCanvas(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: Uint8Array,
  paletteStride: 3 | 4,
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
    const paletteOffset = colorIndex * paletteStride;
    const outputOffset = index * 4;
    imageData.data[outputOffset] = palette[paletteOffset] ?? 0;
    imageData.data[outputOffset + 1] = palette[paletteOffset + 1] ?? 0;
    imageData.data[outputOffset + 2] = palette[paletteOffset + 2] ?? 0;
    imageData.data[outputOffset + 3] = paletteStride === 4 ? palette[paletteOffset + 3] ?? 255 : colorIndex === 0 ? 0 : 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

function createTrueColorCanvas(width: number, height: number, data: Uint8Array, stride: 3 | 4): HTMLCanvasElement | undefined {
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
  const pixelCount = width * height;
  for (let index = 0; index < pixelCount; index += 1) {
    const source = index * stride;
    const target = index * 4;
    imageData.data[target] = data[source] ?? 0;
    imageData.data[target + 1] = data[source + 1] ?? 0;
    imageData.data[target + 2] = data[source + 2] ?? 0;
    imageData.data[target + 3] = stride === 4 ? data[source + 3] ?? 255 : 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

function readU32(view: DataView, offset: number): number {
  return offset + 4 <= view.byteLength ? view.getUint32(offset, true) : 0;
}

function readU16(view: DataView, offset: number): number {
  return offset + 2 <= view.byteLength ? view.getUint16(offset, true) : 0;
}

function readI16(view: DataView, offset: number): number {
  return offset + 2 <= view.byteLength ? view.getInt16(offset, true) : 0;
}

function readU8(view: DataView, offset: number): number {
  return offset + 1 <= view.byteLength ? view.getUint8(offset) : 0;
}

function detectSffVersion(bytes: Uint8Array, signature: string): SffArchive["version"] {
  if (!signature.toLowerCase().includes("elecbytespr")) {
    return "unknown";
  }
  const ver0 = bytes[12] ?? 0;
  const ver3 = bytes[15] ?? 0;
  if (ver0 >= 2 || ver3 >= 2) {
    return "v2";
  }
  if (ver0 === 1 || bytes[13] === 1) {
    return "v1";
  }
  return "unknown";
}

function isRangeInside(offset: number, length: number, totalLength: number): boolean {
  return offset >= 0 && length >= 0 && offset <= totalLength && offset + length <= totalLength;
}

function increment(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function formatKey(format: number, colorDepth: number): string {
  const name =
    {
      0: "raw",
      1: "invalid",
      2: "rle8",
      3: "rle5",
      4: "lz5",
      10: "png8",
      11: "png24",
      12: "png32",
    }[format] ?? `format${format}`;
  return `${name}/d${colorDepth}`;
}

function formatCountsToText(counts: Record<string, number>): string {
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([format, count]) => `${format} x${count}`)
    .join(", ");
}

function isUnsupportedSffV2Format(record: SffV2SpriteRecord): boolean {
  if (record.format === 0) {
    return !(record.colorDepth > 0 && record.colorDepth <= 8) && ![24, 32].includes(record.colorDepth);
  }
  return !(
    (record.format === 2 && record.colorDepth === 8) ||
    (record.format === 3 && record.colorDepth === 5) ||
    (record.format === 4 && record.colorDepth === 5)
  );
}
