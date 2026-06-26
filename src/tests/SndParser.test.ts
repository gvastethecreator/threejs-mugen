import { describe, expect, it } from "vitest";
import { parseSnd } from "../mugen/parsers/SndParser";

describe("SndParser", () => {
  it("reads MUGEN SND subfiles as indexed WAV sounds", () => {
    const archive = parseSnd(createSndFixture());

    expect(archive.version).toBe("4.0");
    expect(archive.metadata).toEqual({ soundTotal: 2, decodedTotal: 2 });
    expect(archive.sounds).toHaveLength(2);
    expect(archive.sounds[0]).toMatchObject({
      group: 0,
      index: 0,
      format: "wav",
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 8,
    });
    expect(archive.sounds[1]).toMatchObject({ group: 5, index: 2, format: "wav" });
    expect(archive.warnings).toEqual([]);
  });

  it("reports invalid headers without throwing", () => {
    const archive = parseSnd(new ArrayBuffer(16));

    expect(archive.sounds).toEqual([]);
    expect(archive.warnings[0]).toContain("too small");
  });
});

function createSndFixture(): ArrayBuffer {
  const firstWav = createTinyWav(0x80);
  const secondWav = createTinyWav(0x7f);
  const firstOffset = 512;
  const secondOffset = firstOffset + 16 + firstWav.byteLength;
  const totalLength = secondOffset + 16 + secondWav.byteLength;
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);
  writeAscii(bytes, 0, "ElecbyteSnd\0");
  view.setUint16(12, 4, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, 2, true);
  view.setUint32(20, firstOffset, true);

  writeSubfile(bytes, firstOffset, secondOffset, 0, 0, firstWav);
  writeSubfile(bytes, secondOffset, 0, 5, 2, secondWav);
  return bytes.buffer;
}

function writeSubfile(
  target: Uint8Array,
  offset: number,
  nextOffset: number,
  group: number,
  index: number,
  wav: Uint8Array,
): void {
  const view = new DataView(target.buffer);
  view.setUint32(offset, nextOffset, true);
  view.setUint32(offset + 4, wav.byteLength, true);
  view.setInt32(offset + 8, group, true);
  view.setInt32(offset + 12, index, true);
  target.set(wav, offset + 16);
}

function createTinyWav(sample: number): Uint8Array {
  const bytes = new Uint8Array(45);
  const view = new DataView(bytes.buffer);
  writeAscii(bytes, 0, "RIFF");
  view.setUint32(4, 37, true);
  writeAscii(bytes, 8, "WAVE");
  writeAscii(bytes, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeAscii(bytes, 36, "data");
  view.setUint32(40, 1, true);
  bytes[44] = sample;
  return bytes;
}

function writeAscii(target: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    target[offset + index] = value.charCodeAt(index);
  }
}
