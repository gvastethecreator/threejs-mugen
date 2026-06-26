export type MugenSound = {
  group: number;
  index: number;
  length: number;
  format: "wav" | "unknown";
  data: ArrayBuffer;
  sampleRate?: number;
  channels?: number;
  bitsPerSample?: number;
  raw?: unknown;
};

export type SndArchive = {
  version: string;
  sounds: MugenSound[];
  warnings: string[];
  metadata: {
    soundTotal: number;
    decodedTotal: number;
  };
};

export function findSound(archive: SndArchive | undefined, group: number, index: number): MugenSound | undefined {
  return archive?.sounds.find((sound) => sound.group === group && sound.index === index);
}
