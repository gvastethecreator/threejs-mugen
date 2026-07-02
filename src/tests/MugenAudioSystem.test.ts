import { describe, expect, it } from "vitest";
import { MugenAudioSystem, resolveRuntimeAudioEventAction, resolveRuntimeSoundGain } from "../game/audio/MugenAudioSystem";
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

  it("resolves channel playback actions for StopSnd and low-priority PlaySnd", () => {
    expect(resolveRuntimeAudioEventAction({ type: "StopSnd", channel: 2 }, true)).toEqual({ type: "stop", channel: 2 });
    expect(resolveRuntimeAudioEventAction({ type: "StopSnd", channel: -1 }, true)).toEqual({ type: "stop", channel: undefined });
    expect(resolveRuntimeAudioEventAction({ type: "PlaySnd", channel: 2, lowPriority: true }, true)).toEqual({
      type: "skip",
      reason: "low-priority-channel",
      channel: 2,
    });
    expect(resolveRuntimeAudioEventAction({ type: "PlaySnd", channel: 2, lowPriority: true }, false)).toEqual({
      type: "play",
      channel: 2,
    });
    expect(resolveRuntimeAudioEventAction({ type: "PlaySnd", channel: 2 }, true)).toEqual({ type: "play", channel: 2 });
  });

  it("maps PlaySnd volumescale into bounded Web Audio gain", () => {
    expect(resolveRuntimeSoundGain({})).toBeCloseTo(0.55);
    expect(resolveRuntimeSoundGain({ volumeScale: 50 })).toBeCloseTo(0.275);
    expect(resolveRuntimeSoundGain({ volumeScale: 0 })).toBe(0);
    expect(resolveRuntimeSoundGain({ volumeScale: -25 })).toBe(0);
    expect(resolveRuntimeSoundGain({ volumeScale: 200 })).toBeCloseTo(0.55);
    expect(resolveRuntimeSoundGain({ volumeScale: 50 }, 2)).toBeCloseTo(0.5);
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
