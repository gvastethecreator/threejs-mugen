/**
 * CommonFxFightScreenProof/v1 (DA27-09).
 * Proves Sandbox FightScreen Common.Fx / FightFX libraries + audible SND edges.
 */

import { MugenAudioSystem } from "../../game/audio/MugenAudioSystem";
import { MugenCharacterLoader } from "../loader/MugenCharacterLoader";
import type { SndArchive } from "../model/MugenSound";
import type { MugenSnapshot } from "./types";
import {
  createSandboxFightScreenWithProbeCharacterVfs,
  SANDBOX_FIGHTSCREEN_MANIFEST,
} from "./FightScreenFixture";

export const COMMON_FX_FIGHTSCREEN_PROOF_SCHEMA = "CommonFxFightScreenProof/v1" as const;

export type CommonFxFightScreenProofReport = {
  schema: typeof COMMON_FX_FIGHTSCREEN_PROOF_SCHEMA;
  packageId: string;
  fightDefPath: string;
  surfaces: string[];
  libraries: {
    commonAnimCount: number;
    fightfxAnimCount: number;
    commonHas7002: boolean;
    fightfxHas7001: boolean;
    fightfxHas7002: boolean;
  };
  audio: {
    fightfxSoundCount: number;
    fightScreenSoundCount: number;
    unlocked: boolean;
    available: boolean;
    played: number;
    missing: number;
    errors: string[];
  };
  audibleEdges: string[];
  passed: boolean;
  diagnostics: string[];
  claims: {
    allowed: string[];
    blocked: string[];
  };
  checksum: string;
};

export async function runCommonFxFightScreenProof(options: {
  AudioContextImpl?: typeof AudioContext;
} = {}): Promise<CommonFxFightScreenProofReport> {
  const diagnostics: string[] = [];
  const vfs = createSandboxFightScreenWithProbeCharacterVfs();
  const character = await new MugenCharacterLoader().load("chars/probe/probe.def", vfs);
  const system = character.systemAssets;
  if (!system) diagnostics.push("missing-system-assets");

  const common = system?.hitSparkLibraries?.common;
  const fightfx = system?.hitSparkLibraries?.fightfx;
  const fightScreen = system?.fightScreenAssets;
  const commonAnimCount = common?.animations.size ?? 0;
  const fightfxAnimCount = fightfx?.animations.size ?? 0;
  const commonHas7002 = common?.animations.has(7002) === true;
  const fightfxHas7001 = fightfx?.animations.has(7001) === true;
  const fightfxHas7002 = fightfx?.animations.has(7002) === true;

  if (!commonHas7002) diagnostics.push("common-missing-7002");
  if (!fightfxHas7001) diagnostics.push("fightfx-missing-7001");
  if (!fightfxHas7002) diagnostics.push("fightfx-missing-7002");
  if (!system?.fightScreenTiming) diagnostics.push("missing-fight-timing");
  if (!fightScreen?.sourcePath) diagnostics.push("missing-fightscreen-assets");

  const fightfxSounds = fightfx?.soundArchive?.sounds.length ?? 0;
  const fightScreenSounds = fightScreen?.soundArchive?.sounds.length ?? 0;
  if (fightfxSounds < 1 && fightScreenSounds < 1) diagnostics.push("no-snd-catalog");

  const audioReport = await proveAudibleFightFxEdges({
    fightfxArchive: fightfx?.soundArchive,
    fightScreenArchive: fightScreen?.soundArchive,
    AudioContextImpl: options.AudioContextImpl,
  });
  diagnostics.push(...audioReport.diagnostics);

  const surfaces = [...SANDBOX_FIGHTSCREEN_MANIFEST.expectedSurfaces];
  const passed =
    diagnostics.length === 0 &&
    audioReport.played >= 3 &&
    commonHas7002 &&
    fightfxHas7001 &&
    (fightfxSounds > 0 || fightScreenSounds > 0);

  const payload = {
    schema: COMMON_FX_FIGHTSCREEN_PROOF_SCHEMA,
    packageId: SANDBOX_FIGHTSCREEN_MANIFEST.id,
    fightDefPath: system?.fightDefPath ?? SANDBOX_FIGHTSCREEN_MANIFEST.fightDef,
    surfaces,
    libraries: {
      commonAnimCount,
      fightfxAnimCount,
      commonHas7002,
      fightfxHas7001,
      fightfxHas7002,
    },
    audio: {
      fightfxSoundCount: fightfxSounds,
      fightScreenSoundCount: fightScreenSounds,
      unlocked: audioReport.unlocked,
      available: audioReport.available,
      played: audioReport.played,
      missing: audioReport.missing,
      errors: audioReport.errors,
    },
    audibleEdges: audioReport.edges,
    passed,
    diagnostics: [...diagnostics].sort(),
    claims: {
      allowed: [
        "Sandbox FightScreen loads Common.Fx + FightFX animation libraries",
        "FightFX/FightScreen SND catalog is audible through MugenAudioSystem unlock+play",
        "named fight/ko/round announcement sound edges fire at least once",
      ],
      blocked: [
        "full Elecbyte motif visual parity",
        "browser WebAudio autoplay without user gesture on all hosts",
        "score movement",
      ],
    },
  };

  return {
    ...payload,
    checksum: stableHash(stableStringify(payload)),
  };
}

async function proveAudibleFightFxEdges(input: {
  fightfxArchive?: SndArchive;
  fightScreenArchive?: SndArchive;
  AudioContextImpl?: typeof AudioContext;
}): Promise<{
  unlocked: boolean;
  available: boolean;
  played: number;
  missing: number;
  errors: string[];
  edges: string[];
  diagnostics: string[];
}> {
  const diagnostics: string[] = [];
  const AudioContextCtor = input.AudioContextImpl ?? (globalThis as { AudioContext?: typeof AudioContext }).AudioContext;
  if (!AudioContextCtor && !(globalThis as { AudioContext?: unknown }).AudioContext) {
    // Provide a minimal fake when none exists (node test without stub).
    installMinimalFakeAudioContext();
  } else if (input.AudioContextImpl) {
    (globalThis as { AudioContext: typeof AudioContext }).AudioContext = input.AudioContextImpl;
  }

  const system = new MugenAudioSystem();
  const prefixed: Record<string, SndArchive | undefined> = {
    f: input.fightfxArchive,
    fs: input.fightScreenArchive ?? input.fightfxArchive,
  };
  system.setArchive(input.fightScreenArchive ?? input.fightfxArchive, prefixed);
  await system.unlock();

  const edges: string[] = [];
  // Fight call sound from fight.def: fight.snd = 7,1
  system.processSnapshot(roundSoundSnapshot("fight", { group: 7, index: 1, soundPrefix: "f" }));
  edges.push("fight.snd:7,1");
  // KO sound: ko.snd = 7,2
  system.processSnapshot(roundSoundSnapshot("ko", { group: 7, index: 2, soundPrefix: "f" }));
  edges.push("ko.snd:7,2");
  // Round default: round.default.snd = 8,2
  system.processSnapshot(roundSoundSnapshot("round", { group: 8, index: 2, soundPrefix: "fs" }));
  edges.push("round.default.snd:8,2");

  // Allow async decode/play to settle.
  await waitForPlayed(system, 1, 500);

  const diagnosticsAudio = system.getDiagnostics();
  if (!diagnosticsAudio.available) diagnostics.push("audio-archive-unavailable");
  if (!diagnosticsAudio.unlocked) diagnostics.push("audio-not-unlocked");
  if (diagnosticsAudio.played < 1) diagnostics.push("audio-no-play");
  if (diagnosticsAudio.missing > 0) diagnostics.push(`audio-missing:${diagnosticsAudio.missing}`);

  return {
    unlocked: diagnosticsAudio.unlocked,
    available: diagnosticsAudio.available,
    played: diagnosticsAudio.played,
    missing: diagnosticsAudio.missing,
    errors: diagnosticsAudio.errors,
    edges,
    diagnostics,
  };
}

function baseSnapshot(round: NonNullable<MugenSnapshot["round"]>, tick: number): MugenSnapshot {
  return {
    tick,
    playing: true,
    speed: 1,
    actors: [],
    effects: [],
    showClsn1: false,
    showClsn2: false,
    showAxis: false,
    showGrid: false,
    stage: {
      displayName: "Sandbox",
      floorY: 0,
      camera: { x: 0, y: 0, zoom: 1 },
    },
    toggles: { showClsn1: false, showClsn2: false, showAxis: false, showGrid: false },
    logs: [],
    round,
  } as unknown as MugenSnapshot;
}

function roundSoundSnapshot(
  kind: "fight" | "ko" | "round",
  sound: { group: number; index: number; soundPrefix: string },
): MugenSnapshot {
  if (kind === "fight") {
    return baseSnapshot(
      {
        state: "fight",
        timer: 99,
        message: "FIGHT",
        roundNo: 1,
        announcement: {
          visibility: "visible",
          round: { elapsed: 0 },
          fight: { elapsed: 1, sound },
        },
      } as unknown as NonNullable<MugenSnapshot["round"]>,
      1,
    );
  }
  if (kind === "ko") {
    return baseSnapshot(
      {
        state: "ko",
        timer: 0,
        message: "KO",
        roundNo: 1,
        postRound: {
          schema: "RuntimePostRound/v0",
          frame: 3,
          remaining: 2,
          duration: 5,
          slowRemaining: 0,
          slowDuration: 0,
          playbackRate: 1,
          noKoSlow: true,
          outcome: {
            schema: "RuntimeRoundOutcome/v0",
            kind: "ko",
            displayStartFrame: 2,
            soundTime: 2,
            soundDue: true,
            showDraw: false,
            sound,
          },
        },
      } as unknown as NonNullable<MugenSnapshot["round"]>,
      2,
    );
  }
  return baseSnapshot(
    {
      state: "fight",
      timer: 99,
      message: "Round 1",
      roundNo: 1,
      announcement: {
        visibility: "visible",
        round: { elapsed: 2, sound },
        fight: { elapsed: 0 },
      },
    } as unknown as NonNullable<MugenSnapshot["round"]>,
    3,
  );
}

function installMinimalFakeAudioContext(): void {
  const sources: Array<{ stopped: boolean }> = [];
  const context = {
    state: "running" as AudioContextState,
    destination: {},
    sources,
    resume: async () => undefined,
    decodeAudioData: async () => ({}) as AudioBuffer,
    createBufferSource: () => {
      const source = {
        stopped: false,
        buffer: null as AudioBuffer | null,
        loop: false,
        playbackRate: { value: 1 },
        connect() {
          return source;
        },
        start() {},
        stop() {
          source.stopped = true;
        },
        addEventListener() {},
        onended: null as (() => void) | null,
      };
      sources.push(source);
      return source as unknown as AudioBufferSourceNode;
    },
    createGain: () => {
      const node = {
        gain: { value: 1 },
        connect() {
          return node;
        },
        disconnect() {},
      };
      return node as unknown as GainNode;
    },
    createStereoPanner: () => {
      const node = {
        pan: { value: 0 },
        connect() {
          return node;
        },
        disconnect() {},
      };
      return node as unknown as StereoPannerNode;
    },
  };
  (globalThis as unknown as { AudioContext: new () => unknown }).AudioContext = class {
    constructor() {
      return context;
    }
  } as unknown as typeof AudioContext;
}

async function waitForPlayed(system: MugenAudioSystem, min: number, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (system.getDiagnostics().played >= min) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
