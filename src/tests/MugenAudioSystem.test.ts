import { describe, expect, it } from "vitest";
import { MugenAudioSystem } from "../game/audio/MugenAudioSystem";
import type { SndArchive } from "../mugen/model/MugenSound";

describe("MugenAudioSystem", () => {
  it("tracks prefixed FightFX SND archives separately from the character SND archive", () => {
    const system = new MugenAudioSystem();

    system.setArchive(undefined, { kfm_fx: archive(2) });

    expect(system.getDiagnostics()).toMatchObject({
      available: true,
      sounds: 2,
      played: 0,
      missing: 0,
    });
  });
});

function archive(soundTotal: number): SndArchive {
  return {
    version: "4.0",
    sounds: Array.from({ length: soundTotal }, (_, index) => ({
      group: 5,
      index,
      length: 1,
      format: "wav",
      data: new ArrayBuffer(1),
    })),
    warnings: [],
    metadata: {
      soundTotal,
      decodedTotal: soundTotal,
    },
  };
}
