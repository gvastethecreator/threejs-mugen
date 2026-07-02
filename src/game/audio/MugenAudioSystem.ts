import { findSound, type MugenSound, type SndArchive } from "../../mugen/model/MugenSound";
import type { MugenSnapshot, RuntimeSoundEvent } from "../../mugen/runtime/types";

export type MugenAudioDiagnostics = {
  available: boolean;
  unlocked: boolean;
  sounds: number;
  decoded: number;
  played: number;
  missing: number;
  errors: string[];
};

export class MugenAudioSystem {
  private context?: AudioContext;
  private archive?: SndArchive;
  private readonly prefixedArchives = new Map<string, SndArchive>();
  private readonly bufferPromises = new Map<string, Promise<AudioBuffer | undefined>>();
  private readonly activeChannels = new Map<number, AudioBufferSourceNode>();
  private readonly seenEvents = new Set<string>();
  private readonly errors: string[] = [];
  private unlocked = false;
  private played = 0;
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
        if (event.type === "PlaySnd") {
          void this.play(event);
        } else {
          this.stop(event.channel);
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
      missing: this.missing,
      errors: this.errors.slice(0, 8),
    };
  }

  stopAll(): void {
    for (const source of this.activeChannels.values()) {
      source.stop();
    }
    this.activeChannels.clear();
  }

  private async play(event: RuntimeSoundEvent): Promise<void> {
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
    gain.gain.value = 0.55;
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    if (event.channel !== undefined && event.channel >= 0) {
      this.stop(event.channel);
      this.activeChannels.set(event.channel, source);
      source.addEventListener("ended", () => {
        if (this.activeChannels.get(event.channel!) === source) {
          this.activeChannels.delete(event.channel!);
        }
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

function eventKey(actorId: string, event: RuntimeSoundEvent): string {
  return [
    actorId,
    event.type,
    event.runtimeTick ?? "-",
    event.stateNo,
    event.tick,
    event.group ?? "-",
    event.index ?? "-",
    event.channel ?? "-",
  ].join(":");
}
