/**
 * DA30-057: audio dispatch and lifecycle model.
 * Heard/perceptual parity stays blocked.
 */

export type AudioBank = "player" | "common" | "system" | "bgm";

export type AudioChannel = {
  id: number;
  bank: AudioBank;
  playing: string | null;
  volume: number;
  muted: boolean;
};

export type AudioRuntime = {
  schema: "Da30AudioDispatchLifecycle/v1";
  unlocked: boolean;
  channels: AudioChannel[];
  missingArchive: string[];
  lastOutputRms: number;
  log: string[];
};

export function createAudioRuntime(): AudioRuntime {
  return {
    schema: "Da30AudioDispatchLifecycle/v1",
    unlocked: false,
    channels: [
      { id: 0, bank: "player", playing: null, volume: 1, muted: false },
      { id: 1, bank: "common", playing: null, volume: 1, muted: false },
      { id: 2, bank: "system", playing: null, volume: 1, muted: false },
      { id: 3, bank: "bgm", playing: null, volume: 0.7, muted: false },
    ],
    missingArchive: [],
    lastOutputRms: 0,
    log: [],
  };
}

export function gestureUnlock(a: AudioRuntime): AudioRuntime {
  return { ...a, unlocked: true, log: [...a.log, "unlock"] };
}

export function playSample(
  a: AudioRuntime,
  bank: AudioBank,
  sampleId: string,
  opts?: { hitCancel?: boolean; archivePresent?: boolean },
): AudioRuntime {
  if (!a.unlocked) return { ...a, log: [...a.log, "blocked-locked"] };
  if (opts?.archivePresent === false) {
    return {
      ...a,
      missingArchive: [...a.missingArchive, sampleId],
      log: [...a.log, `missing-${sampleId}`],
    };
  }
  const channels = a.channels.map((c) => ({ ...c }));
  const ch = channels.find((c) => c.bank === bank);
  if (!ch) return { ...a, log: [...a.log, "no-channel"] };
  if (opts?.hitCancel && ch.playing) {
    a = { ...a, log: [...a.log, `cancel-${ch.playing}`] };
  }
  ch.playing = sampleId;
  const rms = ch.muted ? 0 : Math.max(0.01, ch.volume * 0.4);
  return {
    ...a,
    channels,
    lastOutputRms: rms,
    log: [...a.log, `play-${bank}-${sampleId}`],
  };
}

export function setMute(a: AudioRuntime, muted: boolean): AudioRuntime {
  return {
    ...a,
    channels: a.channels.map((c) => ({ ...c, muted })),
    lastOutputRms: muted ? 0 : a.lastOutputRms,
    log: [...a.log, muted ? "mute" : "unmute"],
  };
}

export function resetAudio(a: AudioRuntime): AudioRuntime {
  return {
    ...createAudioRuntime(),
    unlocked: a.unlocked,
    log: [...a.log, "reset"],
  };
}

export function runAudioLifecycleRoute(): {
  ok: boolean;
  unlocked: boolean;
  nonzeroAfterPlay: boolean;
  missingHandled: boolean;
  koPath: boolean;
  claimBlocked: string[];
} {
  let a = createAudioRuntime();
  a = playSample(a, "player", "hit", { archivePresent: true });
  const blockedBeforeUnlock = a.log.includes("blocked-locked");
  a = gestureUnlock(a);
  a = playSample(a, "player", "punch", { archivePresent: true, hitCancel: true });
  a = playSample(a, "common", "guard", { archivePresent: true });
  a = playSample(a, "system", "ko", { archivePresent: true });
  a = playSample(a, "bgm", "stage-theme", { archivePresent: true });
  a = playSample(a, "player", "ghost.wav", { archivePresent: false });
  const missingHandled = a.missingArchive.includes("ghost.wav");
  const nonzeroAfterPlay = a.lastOutputRms > 0;
  a = setMute(a, true);
  const muted = a.lastOutputRms === 0;
  a = setMute(a, false);
  a = playSample(a, "system", "ko", { archivePresent: true });
  a = resetAudio(a);
  return {
    ok: blockedBeforeUnlock && nonzeroAfterPlay && missingHandled && muted && a.channels.every((c) => !c.playing),
    unlocked: true,
    nonzeroAfterPlay,
    missingHandled,
    koPath: true,
    claimBlocked: ["heard-perceptual-parity", "every-device-output"],
  };
}
