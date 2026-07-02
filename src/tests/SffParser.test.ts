import { describe, expect, it } from "vitest";
import { SffParser } from "../mugen/parsers/SffParser";

describe("SffParser", () => {
  it("decodes SFF v1 PCX sprites into MugenSprite records", async () => {
    const archive = await new SffParser().load(createSffV1([{ group: 0, index: 0, axisX: 7, axisY: 9 }]));

    expect(archive.version).toBe("v1");
    expect(archive.warnings).toEqual([]);
    expect(archive.sprites).toHaveLength(1);
    expect(archive.sprites[0]).toMatchObject({
      group: 0,
      index: 0,
      width: 2,
      height: 2,
      axisX: 7,
      axisY: 9,
    });
    expect((archive.sprites[0]?.raw as { pcx: { pixels: Uint8Array; hasPalette: boolean } }).pcx.pixels).toEqual(
      new Uint8Array([0, 1, 2, 3]),
    );
    expect((archive.sprites[0]?.raw as { pcx: { hasPalette: boolean } }).pcx.hasPalette).toBe(true);
    expect(archive.sprites[0]?.indexed?.pixels).toEqual(new Uint8Array([0, 1, 2, 3]));
    expect(archive.sprites[0]?.indexed?.palette).toMatchObject({
      stride: 3,
      transparentIndex: 0,
      key: "sff-v1:0",
    });
  });

  it("supports SFF v1 linked sprites", async () => {
    const archive = await new SffParser().load(
      createSffV1([
        { group: 0, index: 0, axisX: 7, axisY: 9 },
        { group: 1, index: 2, axisX: 3, axisY: 4, linkedIndex: 0 },
      ]),
    );

    expect(archive.version).toBe("v1");
    expect(archive.sprites).toHaveLength(2);
    expect(archive.sprites[1]).toMatchObject({
      group: 1,
      index: 2,
      width: 2,
      height: 2,
      axisX: 3,
      axisY: 4,
    });
    expect((archive.sprites[1]?.raw as { linked: boolean }).linked).toBe(true);
  });

  it("decodes SFF v1 sprites that reuse the previous palette without embedded PCX palettes", async () => {
    const archive = await new SffParser().load(
      createSffV1([
        { group: 9000, index: 0, axisX: 0, axisY: 0 },
        { group: 0, index: 0, axisX: 7, axisY: 9, samePalette: true },
      ]),
    );

    expect(archive.version).toBe("v1");
    expect(archive.warnings).toEqual([]);
    expect(archive.sprites).toHaveLength(2);
    expect(archive.sprites[1]).toMatchObject({
      group: 0,
      index: 0,
      width: 2,
      height: 2,
      axisX: 7,
      axisY: 9,
    });
    expect((archive.sprites[1]?.raw as { pcx: { pixels: Uint8Array; hasPalette: boolean } }).pcx.pixels).toEqual(
      new Uint8Array([0, 1, 2, 3]),
    );
    expect(
      (
        archive.sprites[1]?.raw as {
          pcx: { hasPalette: boolean; hasEmbeddedPalette: boolean; usesPreviousPalette: boolean };
        }
      ).pcx,
    ).toMatchObject({
      hasPalette: true,
      hasEmbeddedPalette: false,
      usesPreviousPalette: true,
    });
  });

  it("decodes SFF v2 RLE8 sprites with embedded palettes", async () => {
    const archive = await new SffParser().load(createSffV2([{ group: 9000, index: 1, format: 2, colorDepth: 8 }]));

    expect(archive.version).toBe("v2");
    expect(archive.metadata).toMatchObject({
      spriteTotal: 1,
      paletteTotal: 1,
      decodedSprites: 1,
      formatCounts: { "rle8/d8": 1 },
      unsupportedFormats: {},
    });
    expect(archive.sprites).toHaveLength(1);
    expect(archive.sprites[0]).toMatchObject({
      group: 9000,
      index: 1,
      width: 2,
      height: 2,
      axisX: 7,
      axisY: 9,
    });
    expect((archive.sprites[0]?.raw as { pixels: Uint8Array }).pixels).toEqual(new Uint8Array([0, 1, 1, 2]));
    expect(archive.sprites[0]?.indexed?.pixels).toEqual(new Uint8Array([0, 1, 1, 2]));
    expect(archive.sprites[0]?.indexed?.palette).toMatchObject({ stride: 4, transparentIndex: 0, key: "sff-v2:0" });
  });

  it("decodes SFF v2 RLE5 sprites with reduced palettes", async () => {
    const archive = await new SffParser().load(createSffV2([{ group: 0, index: 0, format: 3, colorDepth: 5 }]));

    expect(archive.version).toBe("v2");
    expect(archive.warnings).toEqual([]);
    expect(archive.metadata?.formatCounts).toEqual({ "rle5/d5": 1 });
    expect(archive.metadata?.unsupportedFormats).toEqual({});
    expect((archive.sprites[0]?.raw as { pixels: Uint8Array }).pixels).toEqual(new Uint8Array([0, 1, 1, 2]));
  });

  it("decodes SFF v2 LZ5 sprites with reduced palettes", async () => {
    const archive = await new SffParser().load(createSffV2([{ group: 0, index: 0, format: 4, colorDepth: 5 }]));

    expect(archive.version).toBe("v2");
    expect(archive.warnings).toEqual([]);
    expect(archive.metadata?.formatCounts).toEqual({ "lz5/d5": 1 });
    expect(archive.metadata?.unsupportedFormats).toEqual({});
    expect((archive.sprites[0]?.raw as { pixels: Uint8Array }).pixels).toEqual(new Uint8Array([0, 1, 1, 2]));
  });

  it("counts unsupported SFF v2 formats without crashing", async () => {
    const archive = await new SffParser().load(createSffV2([{ group: 0, index: 0, format: 99, colorDepth: 8 }]));

    expect(archive.version).toBe("v2");
    expect(archive.sprites).toEqual([]);
    expect(archive.metadata?.formatCounts).toEqual({ "format99/d8": 1 });
    expect(archive.metadata?.unsupportedFormats).toEqual({ "format99/d8": 1 });
    expect(archive.warnings.join("\n")).toContain("unsupported formats: format99/d8 x1");
  });
});

type SffSpriteSpec = {
  group: number;
  index: number;
  axisX: number;
  axisY: number;
  linkedIndex?: number;
  samePalette?: boolean;
};

function createSffV1(specs: SffSpriteSpec[]): ArrayBuffer {
  const chunks = specs.map((spec) =>
    spec.linkedIndex === undefined ? createPcx2x2({ includePalette: !spec.samePalette }) : new Uint8Array(),
  );
  const totalLength = 512 + chunks.reduce((total, chunk) => total + 32 + chunk.length, 0);
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);

  bytes.set(ascii("ElecbyteSpr\0"), 0);
  bytes[12] = 1;
  bytes[13] = 1;
  view.setUint32(16, 1, true);
  view.setUint32(20, specs.length, true);
  view.setUint32(24, 512, true);
  view.setUint32(28, 32, true);

  let offset = 512;
  for (let spriteNumber = 0; spriteNumber < specs.length; spriteNumber += 1) {
    const spec = specs[spriteNumber]!;
    const chunk = chunks[spriteNumber]!;
    const nextOffset = spriteNumber === specs.length - 1 ? 0 : offset + 32 + chunk.length;
    view.setUint32(offset, nextOffset, true);
    view.setUint32(offset + 4, chunk.length, true);
    view.setInt16(offset + 8, spec.axisX, true);
    view.setInt16(offset + 10, spec.axisY, true);
    view.setInt16(offset + 12, spec.group, true);
    view.setInt16(offset + 14, spec.index, true);
    view.setUint16(offset + 16, spec.linkedIndex ?? 0, true);
    view.setUint8(offset + 18, spec.samePalette || spec.linkedIndex !== undefined ? 1 : 0);
    bytes.set(chunk, offset + 32);
    offset = nextOffset;
  }

  return bytes.buffer;
}

function createPcx2x2(options: { includePalette?: boolean } = {}): Uint8Array {
  const header = new Uint8Array(128);
  const view = new DataView(header.buffer);
  header[0] = 0x0a;
  header[1] = 5;
  header[2] = 1;
  header[3] = 8;
  view.setInt16(4, 0, true);
  view.setInt16(6, 0, true);
  view.setInt16(8, 1, true);
  view.setInt16(10, 1, true);
  header[65] = 1;
  view.setUint16(66, 2, true);
  view.setUint16(68, 1, true);

  const pixels = new Uint8Array([0, 1, 2, 3]);
  const palette = new Uint8Array(769);
  palette[0] = 0x0c;
  palette.set([255, 0, 255], 1);
  palette.set([255, 0, 0], 4);
  palette.set([0, 255, 0], 7);
  palette.set([0, 0, 255], 10);

  const includePalette = options.includePalette ?? true;
  const result = new Uint8Array(header.length + pixels.length + (includePalette ? palette.length : 0));
  result.set(header, 0);
  result.set(pixels, header.length);
  if (includePalette) {
    result.set(palette, header.length + pixels.length);
  }
  return result;
}

type SffV2SpriteSpec = {
  group: number;
  index: number;
  format: number;
  colorDepth: number;
};

function createSffV2(specs: SffV2SpriteSpec[]): ArrayBuffer {
  const palette = createSffV2Palette();
  const spritePayloads = specs.map(createSffV2Payload2x2);
  const headerSize = 512;
  const paletteOffset = headerSize;
  const spriteOffset = paletteOffset + 16;
  const ldataOffset = spriteOffset + specs.length * 28;
  const totalLength = ldataOffset + palette.length + spritePayloads.reduce((total, payload) => total + payload.length, 0);
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);

  bytes.set(ascii("ElecbyteSpr\0"), 0);
  bytes[12] = 0;
  bytes[13] = 1;
  bytes[14] = 0;
  bytes[15] = 2;
  view.setUint32(36, spriteOffset, true);
  view.setUint32(40, specs.length, true);
  view.setUint32(44, paletteOffset, true);
  view.setUint32(48, 1, true);
  view.setUint32(52, ldataOffset, true);
  view.setUint32(56, totalLength - ldataOffset, true);
  view.setUint32(60, totalLength, true);
  view.setUint32(64, 0, true);

  view.setUint16(paletteOffset, 1, true);
  view.setUint16(paletteOffset + 2, 1, true);
  view.setUint16(paletteOffset + 4, 256, true);
  view.setUint16(paletteOffset + 6, 0, true);
  view.setUint32(paletteOffset + 8, 0, true);
  view.setUint32(paletteOffset + 12, palette.length, true);
  bytes.set(palette, ldataOffset);

  let dataOffset = palette.length;
  for (let spriteNumber = 0; spriteNumber < specs.length; spriteNumber += 1) {
    const spec = specs[spriteNumber]!;
    const payload = spritePayloads[spriteNumber]!;
    const offset = spriteOffset + spriteNumber * 28;
    view.setUint16(offset, spec.group, true);
    view.setUint16(offset + 2, spec.index, true);
    view.setUint16(offset + 4, 2, true);
    view.setUint16(offset + 6, 2, true);
    view.setInt16(offset + 8, 7, true);
    view.setInt16(offset + 10, 9, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint8(offset + 14, spec.format);
    view.setUint8(offset + 15, spec.colorDepth);
    view.setUint32(offset + 16, dataOffset, true);
    view.setUint32(offset + 20, payload.length, true);
    view.setUint16(offset + 24, 0, true);
    view.setUint16(offset + 26, 0, true);
    bytes.set(payload, ldataOffset + dataOffset);
    dataOffset += payload.length;
  }

  return bytes.buffer;
}

function createSffV2Palette(): Uint8Array {
  const palette = new Uint8Array(256 * 4);
  palette.set([0, 0, 0, 0], 0);
  palette.set([255, 0, 0, 255], 4);
  palette.set([0, 255, 0, 255], 8);
  return palette;
}

function createRle8Payload2x2(): Uint8Array {
  const payload = new Uint8Array(8);
  const view = new DataView(payload.buffer);
  view.setUint32(0, 4, true);
  payload.set([0, 0x42, 1, 2], 4);
  return payload;
}

function createSffV2Payload2x2(spec: SffV2SpriteSpec): Uint8Array {
  if (spec.format === 2) {
    return createRle8Payload2x2();
  }
  if (spec.format === 3) {
    return createCompressedPayload2x2([0x00, 0x02, 0x21, 0x02]);
  }
  if (spec.format === 4) {
    return createCompressedPayload2x2([0x00, 0x20, 0x41, 0x22]);
  }
  return new Uint8Array([4, 0, 0, 0, 0xff]);
}

function createCompressedPayload2x2(bytes: number[]): Uint8Array {
  const payload = new Uint8Array(4 + bytes.length);
  const view = new DataView(payload.buffer);
  view.setUint32(0, 4, true);
  payload.set(bytes, 4);
  return payload;
}

function ascii(text: string): Uint8Array {
  return Uint8Array.from([...text].map((char) => char.charCodeAt(0)));
}
