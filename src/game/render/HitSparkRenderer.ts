import * as THREE from "three";
import type { MugenSprite, SpriteProvider } from "../../mugen/model/MugenSprite";
import type { ActorSnapshot, RuntimeHitEffectAssetFrame, RuntimeHitEffectEvent } from "../../mugen/runtime/types";
import { projectHitSpark } from "./projection";
import { TextureStore } from "./TextureStore";

export const HIT_SPARK_LIFETIME_FRAMES = 180;
const HIT_SPARK_SYSTEM_FRAME_COUNT = 3;
const HIT_SPARK_SYSTEM_FRAME_DURATION = 3;

export type HitSparkAssetSource = "player" | "fightfx" | "common" | "unknown";
export type HitSparkLookupStatus = "resolved-sprite" | "resolved-frame" | "missing-sprite" | "missing-action" | "unsupported-prefix" | "missing-id";
export type HitSparkRenderLayer = "hit-spark" | "guard-spark";

export type HitSparkAssetRef = {
  source: HitSparkAssetSource;
  actionId?: number;
  rawPrefix?: string;
  lookupKey?: string;
  lookupStatus: HitSparkLookupStatus;
  fallbackReason: string;
};

export type HitSparkPresentation = {
  key: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  color: number;
  age: number;
  asset: HitSparkAssetRef;
  assetFrame?: RuntimeHitEffectAssetFrame;
  layer: HitSparkRenderLayer;
  renderOrder: number;
};

type SparkMeshSet = {
  group: THREE.Group;
  flare: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  core: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  sprite?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
};

export class HitSparkRenderer {
  readonly group = new THREE.Group();
  private readonly sparks = new Map<string, SparkMeshSet>();
  private readonly firstSeenTicks = new Map<string, number>();
  private readonly activePresentations = new Map<string, HitSparkPresentation>();

  constructor(
    private readonly spriteProvider?: SpriteProvider,
    private readonly textures?: TextureStore,
  ) {}

  async update(actors: ActorSnapshot[], currentTick: number): Promise<void> {
    const activeKeys = new Set<string>();
    const observedKeys = new Set<string>();
    const nextPresentations = new Map<string, HitSparkPresentation>();
    for (const actor of actors) {
      const events = actor.hitEffectEvents ?? [];
      for (const [index, event] of events.entries()) {
        const key = hitSparkKey(actor, event, index);
        observedKeys.add(key);
        const firstSeenTick = this.firstSeenTicks.get(key) ?? currentTick;
        this.firstSeenTicks.set(key, firstSeenTick);
        const presentation = resolveHitSparkPresentation(actor, event, currentTick, index, HIT_SPARK_LIFETIME_FRAMES, firstSeenTick);
        if (!presentation) {
          continue;
        }
        activeKeys.add(presentation.key);
        await this.updateSpark(actor, presentation);
        nextPresentations.set(presentation.key, presentation);
      }
    }

    for (const [key, spark] of this.sparks) {
      if (!activeKeys.has(key)) {
        this.disposeSpark(key, spark);
      }
    }
    for (const key of this.firstSeenTicks.keys()) {
      if (!observedKeys.has(key)) {
        this.firstSeenTicks.delete(key);
      }
    }
    this.activePresentations.clear();
    for (const [key, presentation] of nextPresentations) {
      this.activePresentations.set(key, presentation);
    }
  }

  getActiveCount(): number {
    return this.sparks.size;
  }

  getDiagnostics(): {
    active: number;
    fallbackGeometry: boolean;
    resolvedSprites: number;
    sources: Partial<Record<HitSparkAssetSource, number>>;
    presentations: Array<{
      key: string;
      kind: RuntimeHitEffectEvent["kind"];
      source: HitSparkAssetSource;
      actionId?: number;
      lookupStatus: HitSparkLookupStatus;
      layer: HitSparkRenderLayer;
      renderOrder: number;
    }>;
  } {
    const presentations = [...this.activePresentations.values()];
    const sources: Partial<Record<HitSparkAssetSource, number>> = {};
    for (const presentation of presentations) {
      sources[presentation.asset.source] = (sources[presentation.asset.source] ?? 0) + 1;
    }
    return {
      active: this.sparks.size,
      fallbackGeometry: presentations.some((presentation) => presentation.asset.lookupStatus !== "resolved-sprite"),
      resolvedSprites: presentations.filter((presentation) => presentation.asset.lookupStatus === "resolved-sprite").length,
      sources,
      presentations: presentations.map((presentation) => ({
        key: presentation.key,
        kind: presentation.layer === "guard-spark" ? "guard" : "hit",
        source: presentation.asset.source,
        actionId: presentation.asset.actionId,
        lookupStatus: presentation.asset.lookupStatus,
        layer: presentation.layer,
        renderOrder: presentation.renderOrder,
      })),
    };
  }

  dispose(): void {
    for (const [key, spark] of this.sparks) {
      this.disposeSpark(key, spark);
    }
    this.sparks.clear();
    this.firstSeenTicks.clear();
    this.activePresentations.clear();
  }

  private async updateSpark(actor: ActorSnapshot, presentation: HitSparkPresentation): Promise<void> {
    const spark = this.sparks.get(presentation.key) ?? this.createSpark(presentation.key);
    const sprite = await this.resolveSparkSprite(actor, presentation);
    const hasSprite = Boolean(sprite);
    spark.group.position.set(presentation.x, presentation.y, 6);
    spark.group.rotation.z = presentation.rotation;
    spark.group.scale.set(presentation.size, presentation.size, 1);
    spark.group.renderOrder = presentation.renderOrder;
    spark.flare.material.color.setHex(presentation.color);
    spark.flare.material.opacity = presentation.opacity * (hasSprite ? 0.18 : 0.42);
    spark.core.material.opacity = Math.min(1, presentation.opacity * (hasSprite ? 0.34 : 1.12));
    if (sprite) {
      const spriteMesh = this.ensureSpriteMesh(spark);
      spriteMesh.visible = true;
      spriteMesh.material.map = this.textures?.getTexture(sprite, hitSparkTextureNamespace(actor, presentation)) ?? null;
      spriteMesh.material.opacity = presentation.opacity;
      spriteMesh.material.needsUpdate = true;
      spriteMesh.scale.set(sprite.width / Math.max(1, presentation.size), sprite.height / Math.max(1, presentation.size), 1);
      presentation.asset.lookupStatus = "resolved-sprite";
      presentation.asset.fallbackReason = `Resolved ${hitSparkAssetSourceLabel(presentation.asset.source)} spark frame into a sprite texture.`;
    } else if (spark.sprite) {
      spark.sprite.visible = false;
    }
  }

  private createSpark(key: string): SparkMeshSet {
    const group = new THREE.Group();
    const flare = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffd36a,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    );
    const core = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.46),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    );
    core.rotation.z = Math.PI / 4;
    flare.rotation.z = -Math.PI / 4;
    group.add(flare, core);
    this.group.add(group);
    const spark = { group, flare, core };
    this.sparks.set(key, spark);
    return spark;
  }

  private ensureSpriteMesh(spark: SparkMeshSet): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    if (spark.sprite) {
      return spark.sprite;
    }
    const sprite = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    );
    sprite.renderOrder = 1;
    spark.group.add(sprite);
    spark.sprite = sprite;
    return sprite;
  }

  private async resolveSparkSprite(actor: ActorSnapshot, presentation: HitSparkPresentation): Promise<MugenSprite | undefined> {
    const frame = presentation.assetFrame;
    if (!frame || !this.spriteProvider || !this.textures) {
      return undefined;
    }
    const context = presentation.asset.source === "player" ? { ownerId: actor.spriteOwnerId ?? actor.id } : undefined;
    const sprite = await this.spriteProvider.getSprite(frame.spriteGroup, frame.spriteIndex, context);
    if (!sprite) {
      presentation.asset.lookupStatus = "missing-sprite";
      presentation.asset.fallbackReason = `Resolved ${hitSparkAssetSourceLabel(frame.source)} spark action ${frame.actionId} frame ${frame.frameIndex}, but sprite ${frame.spriteGroup},${frame.spriteIndex} was unavailable.`;
      return undefined;
    }
    return sprite;
  }

  private disposeSpark(key: string, spark: SparkMeshSet): void {
    this.group.remove(spark.group);
    spark.group.remove(spark.flare, spark.core);
    spark.flare.geometry.dispose();
    spark.flare.material.dispose();
    spark.core.geometry.dispose();
    spark.core.material.dispose();
    if (spark.sprite) {
      spark.group.remove(spark.sprite);
      spark.sprite.geometry.dispose();
      spark.sprite.material.dispose();
    }
    this.sparks.delete(key);
  }
}

export function resolveHitSparkPresentation(
  actor: ActorSnapshot,
  event: RuntimeHitEffectEvent,
  currentTick: number,
  eventIndex = 0,
  lifetime = HIT_SPARK_LIFETIME_FRAMES,
  firstSeenTick?: number,
): HitSparkPresentation | undefined {
  const sourceTick = firstSeenTick ?? event.runtimeTick ?? currentTick;
  const age = Math.max(0, currentTick - sourceTick);
  if (age >= lifetime) {
    return undefined;
  }
  const progress = age / Math.max(1, lifetime);
  const projected = projectHitSpark(actor, event);
  const baseSize = event.kind === "guard" ? 38 : 44;
  const sparkBias = event.sparkNo === undefined ? 0 : Math.abs(event.sparkNo % 5);
  const asset = resolveHitSparkAssetRef(event);
  const assetFrame = resolveHitSparkPresentationFrame(asset, event, age);
  const layer = event.kind === "guard" ? "guard-spark" : "hit-spark";
  return {
    key: hitSparkKey(actor, event, eventIndex),
    x: projected.x,
    y: projected.y,
    size: baseSize + sparkBias + progress * 32,
    opacity: Math.max(0, 0.92 * (1 - progress)),
    rotation: Math.PI / 4 + age * 0.18 + sparkBias * 0.07,
    color: event.kind === "guard" ? 0x68d8ff : 0xffc247,
    age,
    asset,
    layer,
    renderOrder: event.kind === "guard" ? 710 : 720,
    assetFrame,
  };
}

export function resolveHitSparkAssetRef(event: RuntimeHitEffectEvent): HitSparkAssetRef {
  if (event.sparkNo === undefined) {
    return {
      source: "unknown",
      rawPrefix: event.rawPrefix,
      lookupStatus: "missing-id",
      fallbackReason: "HitSpark event has no numeric spark id.",
    };
  }
  const rawPrefix = event.rawPrefix?.toUpperCase();
  const source = hitSparkAssetSource(rawPrefix);
  const supportedPrefix = source !== "unknown";
  const hasLookupFrame =
    source === "player" ? isMatchingAssetFrame(event.assetFrame, source, event.sparkNo) : source === "common" || source === "fightfx";
  return {
    source,
    actionId: event.sparkNo,
    rawPrefix,
    lookupKey: `${source}:${event.sparkNo}`,
    lookupStatus: !supportedPrefix ? "unsupported-prefix" : hasLookupFrame ? "resolved-frame" : "missing-action",
    fallbackReason: fallbackReasonForHitSparkRef(source, rawPrefix, hasLookupFrame),
  };
}

function hitSparkAssetSource(rawPrefix: string | undefined): HitSparkAssetSource {
  if (rawPrefix === "S") {
    return "player";
  }
  if (rawPrefix === "F") {
    return "fightfx";
  }
  if (rawPrefix === undefined) {
    return "common";
  }
  return "unknown";
}

function resolveHitSparkPresentationFrame(
  asset: HitSparkAssetRef,
  event: RuntimeHitEffectEvent,
  age: number,
): RuntimeHitEffectAssetFrame | undefined {
  if (asset.actionId === undefined) {
    return undefined;
  }
  const matchingFrames = event.assetFrames?.filter((frame) => isMatchingAssetFrame(frame, asset.source, asset.actionId)) ?? [];
  if (matchingFrames.length > 0) {
    return selectTimedAssetFrame(matchingFrames, age);
  }
  if (asset.source === "player") {
    return isMatchingAssetFrame(event.assetFrame, asset.source, asset.actionId) ? event.assetFrame : undefined;
  }
  if (asset.source === "common" || asset.source === "fightfx") {
    if (isMatchingAssetFrame(event.assetFrame, asset.source, asset.actionId)) {
      return event.assetFrame;
    }
    const frameIndex = Math.floor(age / HIT_SPARK_SYSTEM_FRAME_DURATION) % HIT_SPARK_SYSTEM_FRAME_COUNT;
    return {
      source: asset.source,
      actionId: asset.actionId,
      frameIndex,
      spriteGroup: asset.actionId,
      spriteIndex: frameIndex,
      offsetX: 0,
      offsetY: 0,
      duration: HIT_SPARK_SYSTEM_FRAME_DURATION,
    };
  }
  return undefined;
}

function selectTimedAssetFrame(frames: RuntimeHitEffectAssetFrame[], age: number): RuntimeHitEffectAssetFrame {
  const totalDuration = frames.reduce((total, frame) => total + normalizeAssetFrameDuration(frame.duration), 0);
  let cursor = totalDuration > 0 ? age % totalDuration : 0;
  for (const frame of frames) {
    const duration = normalizeAssetFrameDuration(frame.duration);
    if (cursor < duration) {
      return frame;
    }
    cursor -= duration;
  }
  return frames[frames.length - 1]!;
}

function normalizeAssetFrameDuration(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) {
    return HIT_SPARK_SYSTEM_FRAME_DURATION;
  }
  return Math.max(1, Math.round(duration));
}

function isMatchingAssetFrame(
  frame: RuntimeHitEffectAssetFrame | undefined,
  source: HitSparkAssetSource,
  actionId: number | undefined,
): frame is RuntimeHitEffectAssetFrame {
  return Boolean(frame && actionId !== undefined && frame.source === source && frame.actionId === actionId);
}

function fallbackReasonForHitSparkRef(source: HitSparkAssetSource, rawPrefix: string | undefined, hasLookupFrame: boolean): string {
  if (source === "player") {
    return hasLookupFrame
      ? "Resolved local player AIR spark action; sprite lookup runs in the Three.js renderer."
      : "S-prefixed spark points at the player's AIR action, but no frame was resolved; using fallback geometry.";
  }
  if (source === "common") {
    return "Unprefixed MUGEN spark refs probe the global common/default spark sprite namespace; fallback geometry remains active when no sprite exists.";
  }
  if (source === "fightfx") {
    return "F-prefixed MUGEN spark refs probe the global FightFX spark sprite namespace; fallback geometry remains active when no sprite exists.";
  }
  return `Unsupported HitSpark prefix '${rawPrefix ?? ""}'; using fallback geometry.`;
}

function hitSparkTextureNamespace(actor: ActorSnapshot, presentation: HitSparkPresentation): string {
  const owner = presentation.asset.source === "player" ? actor.spriteOwnerId ?? actor.id : "system";
  return `hit-spark:${presentation.asset.source}:${owner}`;
}

function hitSparkAssetSourceLabel(source: HitSparkAssetSource): string {
  if (source === "player") {
    return "player AIR";
  }
  if (source === "common") {
    return "common/default";
  }
  if (source === "fightfx") {
    return "FightFX";
  }
  return "unknown";
}

export function hitSparkKey(actor: ActorSnapshot, event: RuntimeHitEffectEvent, eventIndex = 0): string {
  return [
    actor.id,
    event.runtimeTick ?? "tickless",
    event.tick,
    event.kind,
    event.sparkNo ?? event.raw ?? eventIndex,
  ].join(":");
}
