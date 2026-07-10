import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MugenAudioSystem,
  RuntimeAudioChannelStore,
  resolveRuntimeAudioEventAction,
  resolveRuntimeSoundGain,
  resolveRuntimeSoundPlaybackRate,
  resolveRuntimeSoundStereoPan,
} from "../game/audio/MugenAudioSystem";
import type { SndArchive } from "../mugen/model/MugenSound";
import type { MugenSnapshot } from "../mugen/runtime/types";

describe("MugenAudioSystem", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("isolates numbered sound channels by runtime actor", () => {
    const channels = new RuntimeAudioChannelStore<string>();

    channels.set("p1", 2, "p1-voice");
    channels.set("p2", 2, "p2-voice");

    expect(channels.has("p1", 2)).toBe(true);
    expect(channels.has("p2", 2)).toBe(true);
    expect(channels.get("p1", 2)).toBe("p1-voice");
    expect(channels.get("p2", 2)).toBe("p2-voice");
    expect(channels.values()).toEqual(["p1-voice", "p2-voice"]);

    expect(channels.delete("p1", 2)).toBe("p1-voice");
    expect(channels.has("p1", 2)).toBe(false);
    expect(channels.get("p2", 2)).toBe("p2-voice");
  });

  it("replaces only the selected actor channel", () => {
    const channels = new RuntimeAudioChannelStore<string>();
    channels.set("p1", 0, "p1-first");
    channels.set("p2", 0, "p2-first");

    expect(channels.set("p1", 0, "p1-second")).toBe("p1-first");
    expect(channels.get("p1", 0)).toBe("p1-second");
    expect(channels.get("p2", 0)).toBe("p2-first");
    expect(channels.clear()).toEqual(["p1-second", "p2-first"]);
    expect(channels.values()).toEqual([]);
  });

  it("plays matching numbered channels independently across actors", async () => {
    const audioContext = fakeAudioContext();
    vi.stubGlobal("AudioContext", class {
      constructor() {
        return audioContext;
      }
    });
    const system = new MugenAudioSystem();
    system.setArchive(archive(1));
    await system.unlock();

    system.processSnapshot(audioSnapshot([soundActor("p1", 1), soundActor("p2", 1)]));
    await vi.waitFor(() => expect(system.getDiagnostics().played).toBe(2));

    expect(audioContext.sources).toHaveLength(2);
    expect(audioContext.sources.map((source) => source.stopped)).toEqual([false, false]);

    system.processSnapshot(audioSnapshot([soundActor("p1", 2), soundActor("p2", 1)]));
    await vi.waitFor(() => expect(system.getDiagnostics().played).toBe(3));

    expect(audioContext.sources.map((source) => source.stopped)).toEqual([true, false, false]);

    system.processSnapshot(audioSnapshot([stopSoundActor("p1", 3)]));

    expect(audioContext.sources.map((source) => source.stopped)).toEqual([true, false, true]);
  });

  it("keeps the newest actor-channel request when WAV decoding completes out of order", async () => {
    const audioContext = deferredAudioContext();
    vi.stubGlobal("AudioContext", class {
      constructor() {
        return audioContext;
      }
    });
    const system = new MugenAudioSystem();
    system.setArchive(archive(2));
    await system.unlock();

    system.processSnapshot(audioSnapshot([soundActor("p1", 1, 0)]));
    system.processSnapshot(audioSnapshot([soundActor("p1", 2, 1)]));
    expect(audioContext.decodeResolvers).toHaveLength(2);

    audioContext.decodeResolvers[1]!({} as AudioBuffer);
    await vi.waitFor(() => expect(system.getDiagnostics().played).toBe(1));
    audioContext.decodeResolvers[0]!({} as AudioBuffer);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(system.getDiagnostics()).toMatchObject({ played: 1, skipped: 1 });
    expect(audioContext.sources).toHaveLength(1);
    expect(audioContext.sources[0]?.stopped).toBe(false);
  });

  it("stops only the hit actor voice channel once per received-hit sequence", async () => {
    const audioContext = fakeAudioContext();
    vi.stubGlobal("AudioContext", class {
      constructor() {
        return audioContext;
      }
    });
    const system = new MugenAudioSystem();
    system.setArchive(archive(1));
    await system.unlock();

    system.processSnapshot(audioSnapshot([soundActor("p1", 1, 0, 0, 0), soundActor("p2", 1, 0, 0, 0)]));
    await vi.waitFor(() => expect(system.getDiagnostics().played).toBe(2));

    system.processSnapshot(audioSnapshot([soundActor("p1", 1, 0, 0, 1), soundActor("p2", 1, 0, 0, 0)]));
    expect(audioContext.sources.map((source) => source.stopped)).toEqual([true, false]);

    system.processSnapshot(audioSnapshot([soundActor("p1", 2, 0, 0, 1), soundActor("p2", 1, 0, 0, 0)]));
    await vi.waitFor(() => expect(system.getDiagnostics().played).toBe(3));

    expect(audioContext.sources.map((source) => source.stopped)).toEqual([true, false, false]);
  });

  it("cancels a pending voice decode when its actor is hit", async () => {
    const audioContext = deferredAudioContext();
    vi.stubGlobal("AudioContext", class {
      constructor() {
        return audioContext;
      }
    });
    const system = new MugenAudioSystem();
    system.setArchive(archive(1));
    await system.unlock();

    system.processSnapshot(audioSnapshot([soundActor("p1", 1, 0, 0, 0)]));
    expect(audioContext.decodeResolvers).toHaveLength(1);
    system.processSnapshot(audioSnapshot([soundActor("p1", 1, 0, 0, 1)]));
    audioContext.decodeResolvers[0]!({} as AudioBuffer);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(system.getDiagnostics()).toMatchObject({ played: 0, skipped: 1 });
    expect(audioContext.sources).toEqual([]);
  });

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

  it("plays common-bank events from f and never falls back to the player archive", async () => {
    const audioContext = fakeAudioContext();
    vi.stubGlobal("AudioContext", class {
      constructor() {
        return audioContext;
      }
    });
    const commonActor = soundActor("p1", 1);
    commonActor.soundEvents = [{ type: "PlaySnd", group: 5, index: 0, soundPrefix: "f", stateNo: 200, tick: 1, runtimeTick: 1 }];

    const routed = new MugenAudioSystem();
    routed.setArchive(archive(1, 9), { f: archive(1, 5) });
    await routed.unlock();
    routed.processSnapshot(audioSnapshot([commonActor]));
    await vi.waitFor(() => expect(routed.getDiagnostics().played).toBe(1));

    const missing = new MugenAudioSystem();
    missing.setArchive(archive(1, 5));
    await missing.unlock();
    missing.processSnapshot(audioSnapshot([commonActor]));
    await vi.waitFor(() => expect(missing.getDiagnostics().missing).toBe(1));
    expect(missing.getDiagnostics().played).toBe(0);
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
    expect(resolveRuntimeAudioEventAction({ type: "SndPan", channel: 2 }, true)).toEqual({ type: "pan", channel: 2 });
    expect(resolveRuntimeAudioEventAction({ type: "SndPan", channel: 2 }, false)).toEqual({
      type: "skip",
      reason: "inactive-channel",
      channel: 2,
    });
    expect(resolveRuntimeAudioEventAction({ type: "SndPan", channel: -1 }, true)).toEqual({
      type: "skip",
      reason: "missing-channel",
    });
  });

  it("maps PlaySnd volumescale into bounded Web Audio gain", () => {
    expect(resolveRuntimeSoundGain({})).toBeCloseTo(0.55);
    expect(resolveRuntimeSoundGain({ volumeScale: 50 })).toBeCloseTo(0.275);
    expect(resolveRuntimeSoundGain({ volumeScale: 0 })).toBe(0);
    expect(resolveRuntimeSoundGain({ volumeScale: -25 })).toBe(0);
    expect(resolveRuntimeSoundGain({ volumeScale: 200 })).toBeCloseTo(0.55);
    expect(resolveRuntimeSoundGain({ volumeScale: 50 }, 2)).toBeCloseTo(0.5);
  });

  it("maps PlaySnd freqmul into bounded Web Audio playback rate", () => {
    expect(resolveRuntimeSoundPlaybackRate({})).toBe(1);
    expect(resolveRuntimeSoundPlaybackRate({ freqMul: 0.5 })).toBe(0.5);
    expect(resolveRuntimeSoundPlaybackRate({ freqMul: 1.25 })).toBe(1.25);
    expect(resolveRuntimeSoundPlaybackRate({ freqMul: 0 })).toBe(1);
    expect(resolveRuntimeSoundPlaybackRate({ freqMul: -2 })).toBe(1);
    expect(resolveRuntimeSoundPlaybackRate({ freqMul: 99 })).toBe(4);
    expect(resolveRuntimeSoundPlaybackRate({ freqMul: 0.5 }, 2)).toBe(1);
  });

  it("maps PlaySnd pan and abspan into bounded stereo panning", () => {
    expect(resolveRuntimeSoundStereoPan({})).toBe(0);
    expect(resolveRuntimeSoundStereoPan({ absPan: 160 })).toBe(0.5);
    expect(resolveRuntimeSoundStereoPan({ absPan: -640 })).toBe(-1);
    expect(resolveRuntimeSoundStereoPan({ pan: 64 }, { actorX: 0, actorFacing: 1, cameraX: 0 })).toBe(0.2);
    expect(resolveRuntimeSoundStereoPan({ pan: 64 }, { actorX: 0, actorFacing: -1, cameraX: 0 })).toBe(-0.2);
    expect(resolveRuntimeSoundStereoPan({ pan: 0 }, { actorX: 160, actorFacing: 1, cameraX: 0 })).toBe(0.5);
    expect(resolveRuntimeSoundStereoPan({ pan: 0 }, { actorX: 160, actorFacing: 1, cameraX: 160 })).toBe(0);
    expect(resolveRuntimeSoundStereoPan({ pan: 64, absPan: -160 }, { actorX: 160, actorFacing: 1, cameraX: 0 })).toBe(-0.5);
  });
});

function archive(soundTotal: number, group = 5): SndArchive {
  return {
    version: "4.0",
    sounds: Array.from({ length: soundTotal }, (_, index) => ({
      group,
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

function soundActor(id: string, runtimeTick: number, index = 0, channel = 2, receivedHitSequence = 0): MugenSnapshot["actors"][number] {
  return {
    id,
    label: id,
    source: "imported",
    actorKind: "player",
    runtime: {
      stateNo: 200,
      stateElapsed: 1,
      actionId: 200,
      frameIndex: 0,
      frameElapsed: 0,
      pos: { x: id === "p1" ? -40 : 40, y: 0 },
      vel: { x: 0, y: 0 },
      facing: id === "p1" ? 1 : -1,
      ctrl: false,
      life: 1000,
      power: 0,
      receivedHitSequence,
    },
    moveTick: 0,
    hasHit: false,
    soundEvents: [{ type: "PlaySnd", group: 5, index, channel, stateNo: 200, tick: 1, runtimeTick }],
  } as unknown as MugenSnapshot["actors"][number];
}

function stopSoundActor(id: string, runtimeTick: number): MugenSnapshot["actors"][number] {
  const actor = soundActor(id, runtimeTick);
  actor.soundEvents = [{ type: "StopSnd", channel: 2, stateNo: 200, tick: 1, runtimeTick }];
  return actor;
}

function audioSnapshot(actors: MugenSnapshot["actors"]): MugenSnapshot {
  return {
    actors,
    effects: [],
    stage: { camera: { x: 0 } },
  } as unknown as MugenSnapshot;
}

function fakeAudioContext(): {
  state: AudioContextState;
  destination: object;
  sources: Array<{ stopped: boolean }>;
  resume: () => Promise<void>;
  decodeAudioData: () => Promise<AudioBuffer>;
  createBufferSource: () => AudioBufferSourceNode;
  createGain: () => GainNode;
  createStereoPanner: () => StereoPannerNode;
} {
  const sources: Array<{ stopped: boolean }> = [];
  return {
    state: "running",
    destination: {},
    sources,
    resume: async () => undefined,
    decodeAudioData: async () => ({}) as AudioBuffer,
    createBufferSource: () => {
      const state = { stopped: false };
      sources.push(state);
      return {
        playbackRate: { value: 1 },
        loop: false,
        connect: (target: AudioNode) => target,
        addEventListener: () => undefined,
        start: () => undefined,
        stop: () => {
          state.stopped = true;
        },
      } as unknown as AudioBufferSourceNode;
    },
    createGain: () =>
      ({ gain: { value: 1 }, connect: (target: AudioNode) => target }) as unknown as GainNode,
    createStereoPanner: () =>
      ({ pan: { value: 0 }, connect: (target: AudioNode) => target }) as unknown as StereoPannerNode,
  };
}

function deferredAudioContext(): ReturnType<typeof fakeAudioContext> & {
  decodeResolvers: Array<(buffer: AudioBuffer) => void>;
} {
  const context = fakeAudioContext();
  const decodeResolvers: Array<(buffer: AudioBuffer) => void> = [];
  return {
    ...context,
    decodeResolvers,
    decodeAudioData: () =>
      new Promise<AudioBuffer>((resolve) => {
        decodeResolvers.push(resolve);
      }),
  };
}
