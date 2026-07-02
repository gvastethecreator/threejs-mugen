import { findSound, type MugenSound, type SndArchive } from "../../mugen/model/MugenSound";
import type { MugenSnapshot, RuntimeSoundEvent } from "../../mugen/runtime/types";

export type MugenAudioDiagnostics = {
  available: boolean;
  unlocked: boolean;
  sounds: number;
  decoded: number;
  played: number;
  skipped: number;
  missing: number;
  errors: string[];
};

export type RuntimeAudioEventAction =
  | { type: "play"; channel?: number }
  | { type: "skip"; reason: "low-priority-channel"; channel: number }
  | { type: "stop"; channel?: number };

const DEFAULT_SOUND_GAIN = 0.55;
const MIN_PLAYBACK_RATE = 0.01;
const MAX_PLAYBACK_RATE = 4;

export class MugenAudioSystem {
  private context?: AudioContext;
  private archive?: SndArchive;
  private readonly prefixedArchives = new Map<string, SndArchive>();
  private readonly bufferPromises = new Map<string, Promise<AudioBuffer | undefined>>();
  private readonly activeChannels = new Map<number, AudioBufferSourceNode>();
  private readonly floatingSources = new Set<AudioBufferSourceNode>();
  private readonly seenEvents = new Set<string>();
  private readonly errors: string[] = [];
  private unlocked = false;
  private played = 0;
  private skipped = 0;
  private missing = 0;

  setArchive(archive: SndArchive | undefined, prefixedArchives: Record<string, SndArchive | undefined> = {}): void {
    this.stopAll();
    this.archive = archive;
    this.prefixedArchives.clear();
    for (const [prefix, prefixedArchive] of Object.entries(prefixedArchives)) {
      const normalizedPrefix = prefix.trim().toLowerCase();
      if (normalizedPrefix && prefixedArchive) {
        this.prefixedArchives.set(normalizedPrefix, prefixedArchive);
      }
    }
    this.bufferPromises.clear();
    this.seenEvents.clear();
    this.errors.length = 0;
    this.played = 0;
    this.skipped = 0;
    this.missing = 0;
  }

  async unlock(): Promise<void> {
    const context = this.ensureContext();
    if (context.state !== "running") {
      await context.resume();
    }
    this.unlocked = context.state === "running";
  }

  processSnapshot(snapshot: MugenSnapshot): void {
    const soundActors = [...snapshot.actors, ...(snapshot.effects ?? [])];
    if (!this.hasAnyArchive() || soundActors.length === 0) {
      return;
    }
    for (const actor of soundActors) {
      if (actor.source !== "imported" && actor.source !== "effect") {
        continue;
      }
      for (const event of [...(actor.soundEvents ?? [])].reverse()) {
        const key = eventKey(actor.id, event);
        if (this.seenEvents.has(key)) {
          continue;
        }
        this.seenEvents.add(key);
        if (this.seenEvents.size > 256) {
          const oldest = this.seenEvents.values().next().value;
          if (oldest) {
            this.seenEvents.delete(oldest);
          }
        }
        const action = resolveRuntimeAudioEventAction(event, this.hasActiveChannel(event.channel));
        if (action.type === "play") {
          void this.play(event, action);
        } else if (action.type === "stop") {
          this.stop(action.channel);
        } else {
          this.skipped += 1;
        }
      }
    }
  }

  getDiagnostics(): MugenAudioDiagnostics {
    const archives = this.archives();
    return {
      available: this.hasAnyArchive(),
      unlocked: this.unlocked,
      sounds: archives.reduce((total, archive) => total + archive.sounds.length, 0),
      decoded: this.bufferPromises.size,
      played: this.played,
      skipped: this.skipped,
      missing: this.missing,
      errors: this.errors.slice(0, 8),
    };
  }

  stopAll(): void {
    for (const source of this.activeChannels.values()) {
      source.stop();
    }
    this.activeChannels.clear();
    for (const source of this.floatingSources) {
      source.stop();
    }
    this.floatingSources.clear();
  }

  private async play(event: RuntimeSoundEvent, action: Extract<RuntimeAudioEventAction, { type: "play" }>): Promise<void> {
    const archive = this.resolveArchive(event);
    if (event.group === undefined || event.index === undefined || !archive) {
      this.missing += 1;
      return;
    }
    const sound = findSound(archive, event.group, event.index);
    if (!sound || sound.format !== "wav") {
      this.missing += 1;
      return;
    }

    const context = this.ensureContext();
    if (context.state !== "running") {
      return;
    }
    const buffer = await this.getAudioBuffer(event.soundPrefix, sound);
    if (!buffer) {
      return;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = resolveRuntimeSoundGain(event);
    source.buffer = buffer;
    source.playbackRate.value = resolveRuntimeSoundPlaybackRate(event);
    source.loop = event.loop === true;
    source.connect(gain).connect(context.destination);
    if (action.channel !== undefined) {
      this.stop(action.channel);
      this.activeChannels.set(action.channel, source);
      source.addEventListener("ended", () => {
        if (this.activeChannels.get(action.channel!) === source) {
          this.activeChannels.delete(action.channel!);
        }
      });
    } else {
      this.floatingSources.add(source);
      source.addEventListener("ended", () => {
        this.floatingSources.delete(source);
      });
    }
    source.start();
    this.played += 1;
  }

  private stop(channel: number | undefined): void {
    if (channel === undefined || channel < 0) {
      this.stopAll();
      return;
    }
    const source = this.activeChannels.get(channel);
    if (!source) {
      return;
    }
    source.stop();
    this.activeChannels.delete(channel);
  }

  private hasActiveChannel(channel: number | undefined): boolean {
    return channel !== undefined && channel >= 0 && this.activeChannels.has(channel);
  }

  private getAudioBuffer(prefix: string | undefined, sound: MugenSound): Promise<AudioBuffer | undefined> {
    const key = `${prefix?.toLowerCase() ?? "self"}:${sound.group},${sound.index}`;
    const existing = this.bufferPromises.get(key);
    if (existing) {
      return existing;
    }
    const promise = this.ensureContext()
      .decodeAudioData(sound.data.slice(0))
      .catch((error: unknown) => {
        this.errors.unshift(`SND ${key} decode failed: ${error instanceof Error ? error.message : String(error)}`);
        this.errors.splice(8);
        return undefined;
      });
    this.bufferPromises.set(key, promise);
    return promise;
  }

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  private resolveArchive(event: RuntimeSoundEvent): SndArchive | undefined {
    const prefix = event.soundPrefix?.trim().toLowerCase();
    if (!prefix || prefix === "s") {
      return this.archive;
    }
    return this.prefixedArchives.get(prefix);
  }

  private hasAnyArchive(): boolean {
    return Boolean(this.archive) || this.prefixedArchives.size > 0;
  }

  private archives(): SndArchive[] {
    const archives: SndArchive[] = [];
    if (this.archive) {
      archives.push(this.archive);
    }
    archives.push(...this.prefixedArchives.values());
    return archives;
  }
}

export function resolveRuntimeAudioEventAction(event: Pick<RuntimeSoundEvent, "type" | "channel" | "lowPriority">, activeChannel: boolean): RuntimeAudioEventAction {
  const channel = event.channel !== undefined && event.channel >= 0 ? event.channel : undefined;
  if (event.type === "StopSnd") {
    return { type: "stop", channel };
  }
  if (event.lowPriority && channel !== undefined && activeChannel) {
    return { type: "skip", reason: "low-priority-channel", channel };
  }
  return { type: "play", channel };
}

export function resolveRuntimeSoundGain(
  event: Pick<RuntimeSoundEvent, "volumeScale">,
  baseGain = DEFAULT_SOUND_GAIN,
): number {
  const safeBaseGain = clamp(baseGain, 0, 1);
  if (event.volumeScale === undefined) {
    return safeBaseGain;
  }
  return safeBaseGain * (clamp(event.volumeScale, 0, 100) / 100);
}

export function resolveRuntimeSoundPlaybackRate(
  event: Pick<RuntimeSoundEvent, "freqMul">,
  baseRate = 1,
): number {
  const safeBaseRate = clamp(baseRate, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE);
  if (event.freqMul === undefined || event.freqMul <= 0) {
    return safeBaseRate;
  }
  return clamp(safeBaseRate * event.freqMul, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE);
}

function eventKey(actorId: string, event: RuntimeSoundEvent): string {
  return [
    actorId,
    event.type,
    event.soundPrefix ?? "-",
    event.runtimeTick ?? "-",
    event.stateNo,
    event.tick,
    event.group ?? "-",
    event.index ?? "-",
    event.channel ?? "-",
    event.lowPriority ? "low" : "-",
    event.volumeScale ?? "-",
    event.freqMul ?? "-",
    event.loop ? "loop" : "-",
  ].join(":");
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}
