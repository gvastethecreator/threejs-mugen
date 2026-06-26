import type { SndArchive, MugenSound } from "../model/MugenSound";

const SIGNATURE = "ElecbyteSnd\0";
const SUBFILE_HEADER_SIZE = 16;

export function parseSnd(buffer: ArrayBuffer): SndArchive {
  const view = new DataView(buffer);
  const warnings: string[] = [];

  if (buffer.byteLength < 24) {
    return emptyArchive("0.0", ["SND file is too small to contain a valid header"]);
  }

  const signature = ascii(buffer, 0, 12);
  if (signature !== SIGNATURE) {
    return emptyArchive("0.0", [`Unrecognized SND signature: ${JSON.stringify(signature)}`]);
  }

  const version = `${view.getUint16(12, true)}.${view.getUint16(14, true)}`;
  const soundTotal = view.getUint32(16, true);
  let offset = view.getUint32(20, true);
  const sounds: MugenSound[] = [];
  const seenOffsets = new Set<number>();
  const seenKeys = new Set<string>();

  for (let index = 0; index < soundTotal; index += 1) {
    if (offset === 0) {
      break;
    }
    if (seenOffsets.has(offset)) {
      warnings.push(`Loop detected in SND subfile list at offset ${offset}`);
      break;
    }
    seenOffsets.add(offset);
    if (offset + SUBFILE_HEADER_SIZE > buffer.byteLength) {
      warnings.push(`SND subfile header ${index} points outside file at offset ${offset}`);
      break;
    }

    const nextOffset = view.getUint32(offset, true);
    const length = view.getUint32(offset + 4, true);
    const group = view.getInt32(offset + 8, true);
    const soundIndex = view.getInt32(offset + 12, true);
    const dataStart = offset + SUBFILE_HEADER_SIZE;
    const dataEnd = dataStart + length;
    const key = `${group},${soundIndex}`;

    if (dataEnd > buffer.byteLength) {
      warnings.push(`SND sound ${key} length ${length} exceeds file bounds`);
      offset = nextOffset;
      continue;
    }
    if (seenKeys.has(key)) {
      warnings.push(`Duplicate SND sound ${key}; later entry ignored`);
      offset = nextOffset;
      continue;
    }
    seenKeys.add(key);

    const data = buffer.slice(dataStart, dataEnd);
    const wav = parseWavMetadata(data);
    if (!wav) {
      warnings.push(`SND sound ${key} is not a RIFF/WAVE payload; kept as unsupported raw data`);
    }
    sounds.push({
      group,
      index: soundIndex,
      length,
      format: wav ? "wav" : "unknown",
      data,
      sampleRate: wav?.sampleRate,
      channels: wav?.channels,
      bitsPerSample: wav?.bitsPerSample,
      raw: { offset, nextOffset },
    });
    offset = nextOffset;
  }

  if (sounds.length < soundTotal) {
    warnings.push(`SND decoded ${sounds.length}/${soundTotal} sounds`);
  }

  return {
    version,
    sounds,
    warnings,
    metadata: {
      soundTotal,
      decodedTotal: sounds.filter((sound) => sound.format === "wav").length,
    },
  };
}

function parseWavMetadata(buffer: ArrayBuffer): { channels: number; sampleRate: number; bitsPerSample: number } | undefined {
  if (buffer.byteLength < 44 || ascii(buffer, 0, 4) !== "RIFF" || ascii(buffer, 8, 4) !== "WAVE") {
    return undefined;
  }
  const view = new DataView(buffer);
  let offset = 12;
  while (offset + 8 <= buffer.byteLength) {
    const id = ascii(buffer, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const payload = offset + 8;
    if (payload + size > buffer.byteLength) {
      return undefined;
    }
    if (id === "fmt " && size >= 16) {
      return {
        channels: view.getUint16(payload + 2, true),
        sampleRate: view.getUint32(payload + 4, true),
        bitsPerSample: view.getUint16(payload + 14, true),
      };
    }
    offset = payload + size + (size % 2);
  }
  return undefined;
}

function emptyArchive(version: string, warnings: string[]): SndArchive {
  return {
    version,
    sounds: [],
    warnings,
    metadata: {
      soundTotal: 0,
      decodedTotal: 0,
    },
  };
}

function ascii(buffer: ArrayBuffer, offset: number, length: number): string {
  return String.fromCharCode(...new Uint8Array(buffer, offset, length));
}
