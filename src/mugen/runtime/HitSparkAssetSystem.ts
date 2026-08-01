import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { HitSparkLibrarySource } from "./demoFighters";
import { parseMugenSparkValue } from "./HitEffectSystem";
import type { RuntimeHitEffectAssetFrame } from "./types";

type RuntimeHitSparkAssetLibrary = {
  animations: Map<number, MugenAnimationAction>;
  scale?: number;
  localCoord?: [number, number];
};

type RuntimeHitSparkAssetDefinition = {
  animations: Map<number, MugenAnimationAction>;
  localCoord?: [number, number];
  fightFxPrefix?: string;
  hitSparkLibraries?: Partial<Record<HitSparkLibrarySource, RuntimeHitSparkAssetLibrary>>;
};

export type RuntimeHitSparkAssetActor = {
  definition: RuntimeHitSparkAssetDefinition;
  stateOwner?: {
    definition: RuntimeHitSparkAssetDefinition;
  };
};

export function resolveRuntimeHitSparkAssetFrames(
  actor: RuntimeHitSparkAssetActor,
  spark: string | undefined,
): RuntimeHitEffectAssetFrame[] {
  const parsed = parseMugenSparkValue(spark);
  if (!parsed) {
    return [];
  }
  if (parsed.rawPrefix === "S") {
    return resolvePlayerHitSparkAssetFrames(actor, parsed.sparkNo);
  }
  const source = hitSparkLibrarySource(parsed.rawPrefix);
  if (!source) {
    return [];
  }
  return resolveLibraryHitSparkAssetFrames(actor, source, parsed.sparkNo);
}

export function hitSparkLibrarySource(rawPrefix: string | undefined): HitSparkLibrarySource | undefined {
  if (rawPrefix === undefined) {
    return "common";
  }
  return rawPrefix === "F" ? "fightfx" : undefined;
}

function resolvePlayerHitSparkAssetFrames(actor: RuntimeHitSparkAssetActor, actionId: number): RuntimeHitEffectAssetFrame[] {
  const owner = actor.stateOwner ?? actor;
  return actionFramesToHitSparkAssetFrames("player", actionId, owner.definition.animations.get(actionId));
}

function resolveLibraryHitSparkAssetFrames(
  actor: RuntimeHitSparkAssetActor,
  source: HitSparkLibrarySource,
  actionId: number,
): RuntimeHitEffectAssetFrame[] {
  const owner = actor.stateOwner ?? actor;
  const fightFxPrefix = source === "fightfx" ? owner.definition.fightFxPrefix : undefined;
  const library = owner.definition.hitSparkLibraries?.[source];
  return actionFramesToHitSparkAssetFrames(
    source,
    actionId,
    library?.animations.get(actionId),
    fightFxPrefix,
    effectiveLibraryScale(library?.scale, library?.localCoord, owner.definition.localCoord),
    library?.localCoord,
  );
}

function actionFramesToHitSparkAssetFrames(
  source: RuntimeHitEffectAssetFrame["source"],
  actionId: number,
  action?: MugenAnimationAction,
  fightFxPrefix?: string,
  scale?: number,
  localCoord?: [number, number],
): RuntimeHitEffectAssetFrame[] {
  if (!action) {
    return [];
  }
  return action.frames.map((frame, frameIndex) => frameToHitSparkAssetFrame(source, actionId, frame, frameIndex, fightFxPrefix, scale, localCoord));
}

function frameToHitSparkAssetFrame(
  source: RuntimeHitEffectAssetFrame["source"],
  actionId: number,
  frame: MugenAnimationFrame,
  frameIndex: number,
  fightFxPrefix?: string,
  scale?: number,
  localCoord?: [number, number],
): RuntimeHitEffectAssetFrame {
  return {
    source,
    ...(fightFxPrefix ? { fightFxPrefix } : {}),
    ...normalizedScale(scale),
    ...(localCoord ? { localCoord: [...localCoord] as [number, number] } : {}),
    actionId,
    frameIndex,
    spriteGroup: frame.spriteGroup,
    spriteIndex: frame.spriteIndex,
    offsetX: frame.offsetX,
    offsetY: frame.offsetY,
    duration: frame.duration,
  };
}

function effectiveLibraryScale(
  authoredScale: number | undefined,
  libraryLocalCoord: [number, number] | undefined,
  actorLocalCoord: [number, number] | undefined,
): number | undefined {
  const scale = authoredScale ?? 1;
  const libraryWidth = libraryLocalCoord?.[0] ?? 320;
  const actorWidth = actorLocalCoord?.[0] ?? 320;
  if (!Number.isFinite(scale) || scale <= 0 || !Number.isFinite(libraryWidth) || libraryWidth <= 0 || !Number.isFinite(actorWidth) || actorWidth <= 0) {
    return undefined;
  }
  return scale * (actorWidth / libraryWidth);
}

function normalizedScale(value: number | undefined): { scale?: number } {
  if (value === undefined || !Number.isFinite(value) || value <= 0 || value === 1) {
    return {};
  }
  return { scale: Math.max(0.01, Math.min(16, value)) };
}
