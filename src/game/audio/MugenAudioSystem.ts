import { findSound, type MugenSound, type SndArchive } from "../../mugen/model/MugenSound";
import type {
  ActorSnapshot,
  MugenSnapshot,
  RuntimeRoundFadeSnapshot,
  RuntimeRoundOutcomeSnapshot,
  RuntimeRoundWinnerDisplayKind,
  RuntimeSoundEvent,
} from "../../mugen/runtime/types";
import type { RuntimeRoundAnnouncementSound } from "../../mugen/runtime/RuntimeRoundAnnouncementSystem";

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
  | { type: "skip"; reason: "missing-channel" | "inactive-channel"; channel?: number }
  | { type: "stop"; channel?: number }
  | { type: "pan"; channel: number };

type RuntimeAudioSourceHandle = {
  source: AudioBufferSourceNode;
  panner?: StereoPannerNode;
};

type RuntimeAudioActorContext = Pick<ActorSnapshot, "id"> & {
  runtime: Pick<ActorSnapshot["runtime"], "pos" | "facing">;
};

const DEFAULT_SOUND_GAIN = 0.55;
const MIN_PLAYBACK_RATE = 0.01;
const MAX_PLAYBACK_RATE = 4;
const DEFAULT_PAN_HALF_WIDTH = 320;

export type RuntimeSoundPanContext = {
  actorX?: number;
  actorFacing?: 1 | -1;
  cameraX?: number;
  halfWidth?: number;
};

export class RuntimeAudioChannelStore<THandle> {
  private readonly entries = new Map<string, THandle>();

  has(actorId: string, channel: number): boolean {
    return this.entries.has(runtimeAudioChannelKey(actorId, channel));
  }

  get(actorId: string, channel: number): THandle | undefined {
    return this.entries.get(runtimeAudioChannelKey(actorId, channel));
  }

  set(actorId: string, channel: number, handle: THandle): THandle | undefined {
    const key = runtimeAudioChannelKey(actorId, channel);
    const previous = this.entries.get(key);
    this.entries.set(key, handle);
    return previous;
  }

  delete(actorId: string, channel: number): THandle | undefined {
    const key = runtimeAudioChannelKey(actorId, channel);
    const previous = this.entries.get(key);
    this.entries.delete(key);
    return previous;
  }

  values(): THandle[] {
    return [...this.entries.values()];
  }

  clear(): THandle[] {
    const handles = this.values();
    this.entries.clear();
    return handles;
  }
}

export class MugenAudioSystem {
  private context?: AudioContext;
  private archive?: SndArchive;
  private readonly prefixedArchives = new Map<string, SndArchive>();
  private readonly bufferPromises = new Map<string, Promise<AudioBuffer | undefined>>();
  private readonly activeChannels = new RuntimeAudioChannelStore<RuntimeAudioSourceHandle>();
  private readonly pendingChannels = new RuntimeAudioChannelStore<number>();
  private readonly floatingSources = new Set<RuntimeAudioSourceHandle>();
  private readonly seenEvents = new Set<string>();
  private readonly receivedHitSequences = new Map<string, number>();
  private readonly errors: string[] = [];
  private unlocked = false;
  private played = 0;
  private skipped = 0;
  private missing = 0;
  private channelRequestSequence = 0;
  private lastRoundFadeSoundKey?: string;
  private readonly roundAnnouncementSoundKeys = new Set<string>();
  private roundAnnouncementSoundStateKey?: string;

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
    this.receivedHitSequences.clear();
    this.errors.length = 0;
    this.played = 0;
    this.skipped = 0;
    this.missing = 0;
    this.roundAnnouncementSoundKeys.clear();
    this.roundAnnouncementSoundStateKey = undefined;
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
    const roundFade = snapshot.round?.postRound?.fadeOut?.active
      ? snapshot.round.postRound.fadeOut
      : snapshot.round?.preRound?.fadeIn?.active
        ? snapshot.round.preRound.fadeIn
        : undefined;
    if (!roundFade?.active) {
      this.lastRoundFadeSoundKey = undefined;
    }
    const hasRoundFadeSound = Boolean(roundFade?.active && roundFade.sound);
    const roundAnnouncementSoundStateKey = `${snapshot.round?.roundNo ?? 1}:${snapshot.round?.state ?? "none"}`;
    if (this.roundAnnouncementSoundStateKey !== roundAnnouncementSoundStateKey) {
      this.roundAnnouncementSoundKeys.clear();
      this.roundAnnouncementSoundStateKey = roundAnnouncementSoundStateKey;
    }
    const roundAnnouncementSound = resolveRoundAnnouncementSound(snapshot);
    const roundOutcomeSounds = resolveRoundOutcomeSounds(snapshot);
    if (!this.hasAnyArchive() || (soundActors.length === 0 && !hasRoundFadeSound && !roundAnnouncementSound && roundOutcomeSounds.length === 0)) {
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
        const action = resolveRuntimeAudioEventAction(event, this.hasActiveChannel(actor.id, event.channel));
        if (action.type === "play") {
          void this.play(event, action, actor, snapshot);
        } else if (action.type === "stop") {
          this.stop(actor.id, action.channel);
        } else if (action.type === "pan") {
          this.pan(actor.id, action.channel, event, actor, snapshot);
        } else {
          this.skipped += 1;
        }
      }
      this.stopVoiceChannelOnNewHit(actor);
    }
    if (roundFade?.active && roundFade.sound) {
      this.processRoundFadeSound(roundFade, snapshot);
    }
    if (roundAnnouncementSound) {
      this.processRoundAnnouncementSound(roundAnnouncementSound, snapshot);
    }
    for (const roundOutcomeSound of roundOutcomeSounds) {
      this.processRoundAnnouncementSound(roundOutcomeSound, snapshot);
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
    this.lastRoundFadeSoundKey = undefined;
    this.roundAnnouncementSoundKeys.clear();
    this.roundAnnouncementSoundStateKey = undefined;
    this.pendingChannels.clear();
    for (const handle of this.activeChannels.clear()) {
      handle.source.stop();
    }
    for (const handle of this.floatingSources) {
      handle.source.stop();
    }
    this.floatingSources.clear();
  }

  private async play(
    event: RuntimeSoundEvent,
    action: Extract<RuntimeAudioEventAction, { type: "play" }>,
    actor: RuntimeAudioActorContext,
    snapshot: MugenSnapshot,
  ): Promise<void> {
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
    const requestId = action.channel === undefined ? undefined : ++this.channelRequestSequence;
    if (action.channel !== undefined && requestId !== undefined) {
      this.pendingChannels.set(actor.id, action.channel, requestId);
    }
    const buffer = await this.getAudioBuffer(event.soundPrefix, sound);
    if (!buffer) {
      if (action.channel !== undefined && this.pendingChannels.get(actor.id, action.channel) === requestId) {
        this.pendingChannels.delete(actor.id, action.channel);
      }
      return;
    }
    if (action.channel !== undefined && this.pendingChannels.get(actor.id, action.channel) !== requestId) {
      this.skipped += 1;
      return;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = resolveRuntimeSoundGain(event);
    source.buffer = buffer;
    source.playbackRate.value = resolveRuntimeSoundPlaybackRate(event);
    source.loop = event.loop === true;
    const stereoPan = resolveRuntimeSoundStereoPan(event, {
      actorX: actor.runtime.pos.x,
      actorFacing: actor.runtime.facing,
      cameraX: snapshot.stage.camera.x,
    });
    let panner: StereoPannerNode | undefined;
    if (typeof context.createStereoPanner === "function") {
      panner = context.createStereoPanner();
      panner.pan.value = stereoPan;
      source.connect(gain).connect(panner).connect(context.destination);
    } else {
      source.connect(gain).connect(context.destination);
    }
    const handle: RuntimeAudioSourceHandle = { source, ...(panner ? { panner } : {}) };
    if (action.channel !== undefined) {
      this.stopActiveChannel(actor.id, action.channel);
      this.activeChannels.set(actor.id, action.channel, handle);
      source.addEventListener("ended", () => {
        if (this.activeChannels.get(actor.id, action.channel!) === handle) {
          this.activeChannels.delete(actor.id, action.channel!);
        }
        if (this.pendingChannels.get(actor.id, action.channel!) === requestId) {
          this.pendingChannels.delete(actor.id, action.channel!);
        }
      });
    } else {
      this.floatingSources.add(handle);
      source.addEventListener("ended", () => {
        this.floatingSources.delete(handle);
      });
    }
    source.start();
    this.played += 1;
  }

  private processRoundFadeSound(fade: RuntimeRoundFadeSnapshot, snapshot: MugenSnapshot): void {
    if (!fade.sound) return;
    const key = `${snapshot.round?.roundNo ?? 1}:${fade.direction ?? "out"}:${snapshot.round?.state ?? "ko"}:${fade.sound.group},${fade.sound.index}`;
    if (this.lastRoundFadeSoundKey === key) return;
    this.lastRoundFadeSoundKey = key;
    const event: RuntimeSoundEvent = {
      type: "PlaySnd",
      group: fade.sound.group,
      index: fade.sound.index,
      soundPrefix: "f",
      stateNo: -3,
      tick: snapshot.tick,
      runtimeTick: snapshot.tick,
    };
    void this.play(
      event,
      { type: "play" },
      { id: "__round-fade__", runtime: { pos: { x: 0, y: 0 }, facing: 1 } },
      snapshot,
    );
  }

  private processRoundAnnouncementSound(
    input: {
      kind: "round" | "fight" | RuntimeRoundOutcomeSnapshot["kind"] | RuntimeRoundWinnerDisplayKind;
      sound: RuntimeRoundAnnouncementSound;
      elapsed: number;
      identity?: string;
    },
    snapshot: MugenSnapshot,
  ): void {
    const key = `${snapshot.round?.roundNo ?? 1}:${input.kind}:${input.identity ?? "default"}:${input.elapsed}:${input.sound.soundPrefix}:${input.sound.group},${input.sound.index}`;
    if (this.roundAnnouncementSoundKeys.has(key)) {
      return;
    }
    this.roundAnnouncementSoundKeys.add(key);
    const actor = snapshot.actors[0] ?? {
      id: "__round-announcement__",
      runtime: {
        pos: { x: snapshot.stage.camera.x, y: 0 },
        facing: 1 as const,
      },
    };
    const event: RuntimeSoundEvent = {
      type: "PlaySnd",
      group: input.sound.group,
      index: input.sound.index,
      soundPrefix: input.sound.soundPrefix,
      stateNo: 0,
      tick: input.elapsed,
      runtimeTick: snapshot.tick,
    };
    void this.play(event, { type: "play" }, actor, snapshot);
  }

  private stop(actorId: string, channel: number | undefined): void {
    if (channel === undefined || channel < 0) {
      this.stopAll();
      return;
    }
    this.pendingChannels.delete(actorId, channel);
    this.stopActiveChannel(actorId, channel);
  }

  private stopActiveChannel(actorId: string, channel: number): void {
    const handle = this.activeChannels.delete(actorId, channel);
    if (!handle) {
      return;
    }
    handle.source.stop();
  }

  private pan(actorId: string, channel: number, event: RuntimeSoundEvent, actor: ActorSnapshot, snapshot: MugenSnapshot): void {
    const handle = this.activeChannels.get(actorId, channel);
    if (!handle?.panner) {
      this.skipped += 1;
      return;
    }
    handle.panner.pan.value = resolveRuntimeSoundStereoPan(event, {
      actorX: actor.runtime.pos.x,
      actorFacing: actor.runtime.facing,
      cameraX: snapshot.stage.camera.x,
    });
  }

  private hasActiveChannel(actorId: string, channel: number | undefined): boolean {
    return channel !== undefined && channel >= 0 && this.activeChannels.has(actorId, channel);
  }

  private stopVoiceChannelOnNewHit(actor: ActorSnapshot): void {
    const sequence = actor.runtime.receivedHitSequence ?? 0;
    const previous = this.receivedHitSequences.get(actor.id);
    this.receivedHitSequences.set(actor.id, sequence);
    if (sequence > 0 && sequence !== previous) {
      this.stop(actor.id, 0);
    }
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

function resolveRoundAnnouncementSound(
  snapshot: MugenSnapshot,
): { kind: "round" | "fight"; sound: RuntimeRoundAnnouncementSound; elapsed: number } | undefined {
  const announcement = snapshot.round?.announcement;
  if (!announcement || announcement.visibility !== "visible") {
    return undefined;
  }
  if (announcement.round.sound) {
    return { kind: "round", sound: announcement.round.sound, elapsed: announcement.round.elapsed };
  }
  if (announcement.fight.sound) {
    return { kind: "fight", sound: announcement.fight.sound, elapsed: announcement.fight.elapsed };
  }
  return undefined;
}

function resolveRoundOutcomeSounds(
  snapshot: MugenSnapshot,
): Array<{
  kind: RuntimeRoundOutcomeSnapshot["kind"] | RuntimeRoundWinnerDisplayKind;
  sound: RuntimeRoundAnnouncementSound;
  elapsed: number;
  identity?: string;
}> {
  const outcome = snapshot.round?.postRound?.outcome;
  const winnerDisplay = outcome?.winnerDisplay;
  const elapsed = snapshot.round?.postRound?.frame ?? 0;
  const sounds: Array<{
    kind: RuntimeRoundOutcomeSnapshot["kind"] | RuntimeRoundWinnerDisplayKind;
    sound: RuntimeRoundAnnouncementSound;
    elapsed: number;
    identity?: string;
  }> = [];
  if (winnerDisplay?.winTypeSounds) {
    for (const edge of winnerDisplay.winTypeSounds) {
      if (!edge.soundDue || !edge.sound) continue;
      sounds.push({
        kind: winnerDisplay.kind,
        sound: edge.sound,
        elapsed,
        identity: `win-type:${edge.name}`,
      });
    }
  } else if (winnerDisplay?.winTypeSoundDue && winnerDisplay.winTypeSound) {
    sounds.push({
      kind: winnerDisplay.kind,
      sound: winnerDisplay.winTypeSound,
      elapsed,
      identity: "win-type:primary",
    });
  }
  if (winnerDisplay?.phase === "active" && winnerDisplay.soundDue && winnerDisplay.sound) {
    sounds.push({
      kind: winnerDisplay.kind,
      sound: winnerDisplay.sound,
      elapsed,
    });
  }
  if (outcome?.soundDue && outcome.sound) {
    sounds.push({ kind: outcome.kind, sound: outcome.sound, elapsed });
  }
  return sounds;
}

function runtimeAudioChannelKey(actorId: string, channel: number): string {
  return `${actorId}:${channel}`;
}

export function resolveRuntimeAudioEventAction(event: Pick<RuntimeSoundEvent, "type" | "channel" | "lowPriority">, activeChannel: boolean): RuntimeAudioEventAction {
  const channel = event.channel !== undefined && event.channel >= 0 ? event.channel : undefined;
  if (event.type === "StopSnd") {
    return { type: "stop", channel };
  }
  if (event.type === "SndPan") {
    if (channel === undefined) {
      return { type: "skip", reason: "missing-channel" };
    }
    if (!activeChannel) {
      return { type: "skip", reason: "inactive-channel", channel };
    }
    return { type: "pan", channel };
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

export function resolveRuntimeSoundStereoPan(
  event: Pick<RuntimeSoundEvent, "pan" | "absPan">,
  context: RuntimeSoundPanContext = {},
): number {
  const halfWidth = Math.max(1, Math.abs(context.halfWidth ?? DEFAULT_PAN_HALF_WIDTH));
  if (event.absPan !== undefined) {
    return clamp(event.absPan / halfWidth, -1, 1);
  }
  if (event.pan === undefined) {
    return 0;
  }
  const actorX = context.actorX ?? 0;
  const actorFacing = context.actorFacing ?? 1;
  const cameraX = context.cameraX ?? 0;
  return clamp((actorX + event.pan * actorFacing - cameraX) / halfWidth, -1, 1);
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
    event.pan ?? "-",
    event.absPan ?? "-",
  ].join(":");
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}
