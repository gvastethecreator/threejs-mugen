import * as THREE from "three";
import type { ActorSnapshot, RuntimeHitEffectEvent } from "../../mugen/runtime/types";
import { projectHitSpark } from "./projection";

export const HIT_SPARK_LIFETIME_FRAMES = 120;

export type HitSparkAssetSource = "system" | "fightfx" | "character-or-common" | "unknown";
export type HitSparkLookupStatus = "fallback-geometry" | "missing-id";
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
  layer: HitSparkRenderLayer;
  renderOrder: number;
};

type SparkMeshSet = {
  group: THREE.Group;
  flare: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  core: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
};

export class HitSparkRenderer {
  readonly group = new THREE.Group();
  private readonly sparks = new Map<string, SparkMeshSet>();
  private readonly firstSeenTicks = new Map<string, number>();
  private readonly activePresentations = new Map<string, HitSparkPresentation>();

  update(actors: ActorSnapshot[], currentTick: number): void {
    const activeKeys = new Set<string>();
    const observedKeys = new Set<string>();
    const nextPresentations = new Map<string, HitSparkPresentation>();
    for (const actor of actors) {
      const events = actor.hitEffectEvents ?? [];
      events.forEach((event, index) => {
        const key = hitSparkKey(actor, event, index);
        observedKeys.add(key);
        const firstSeenTick = this.firstSeenTicks.get(key) ?? currentTick;
        this.firstSeenTicks.set(key, firstSeenTick);
        const presentation = resolveHitSparkPresentation(actor, event, currentTick, index, HIT_SPARK_LIFETIME_FRAMES, firstSeenTick);
        if (!presentation) {
          return;
        }
        activeKeys.add(presentation.key);
        nextPresentations.set(presentation.key, presentation);
        this.updateSpark(presentation);
      });
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
      fallbackGeometry: presentations.length > 0,
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

  private updateSpark(presentation: HitSparkPresentation): void {
    const spark = this.sparks.get(presentation.key) ?? this.createSpark(presentation.key);
    spark.group.position.set(presentation.x, presentation.y, 6);
    spark.group.rotation.z = presentation.rotation;
    spark.group.scale.set(presentation.size, presentation.size, 1);
    spark.group.renderOrder = presentation.renderOrder;
    spark.flare.material.color.setHex(presentation.color);
    spark.flare.material.opacity = presentation.opacity * 0.42;
    spark.core.material.opacity = Math.min(1, presentation.opacity * 1.12);
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

  private disposeSpark(key: string, spark: SparkMeshSet): void {
    this.group.remove(spark.group);
    spark.group.remove(spark.flare, spark.core);
    spark.flare.geometry.dispose();
    spark.flare.material.dispose();
    spark.core.geometry.dispose();
    spark.core.material.dispose();
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
  return {
    source,
    actionId: event.sparkNo,
    rawPrefix,
    lookupKey: `${source}:${event.sparkNo}`,
    lookupStatus: "fallback-geometry",
    fallbackReason: "FightFX/common sprite lookup is not wired yet; using bounded Three.js fallback geometry.",
  };
}

function hitSparkAssetSource(rawPrefix: string | undefined): HitSparkAssetSource {
  if (rawPrefix === "S") {
    return "system";
  }
  if (rawPrefix === "F") {
    return "fightfx";
  }
  if (rawPrefix === undefined) {
    return "character-or-common";
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
