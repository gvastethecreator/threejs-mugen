import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { HitSparkLibrarySource } from "./demoFighters";
import { parseMugenSparkValue } from "./HitEffectSystem";
import type { RuntimeHitEffectAssetFrame } from "./types";

type RuntimeHitSparkAssetLibrary = {
  animations: Map<number, MugenAnimationAction>;
};

type RuntimeHitSparkAssetDefinition = {
  animations: Map<number, MugenAnimationAction>;
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
  return actionFramesToHitSparkAssetFrames(source, actionId, owner.definition.hitSparkLibraries?.[source]?.animations.get(actionId));
}

function actionFramesToHitSparkAssetFrames(
  source: RuntimeHitEffectAssetFrame["source"],
  actionId: number,
  action?: MugenAnimationAction,
): RuntimeHitEffectAssetFrame[] {
  if (!action) {
    return [];
  }
  return action.frames.map((frame, frameIndex) => frameToHitSparkAssetFrame(source, actionId, frame, frameIndex));
}

function frameToHitSparkAssetFrame(
  source: RuntimeHitEffectAssetFrame["source"],
  actionId: number,
  frame: MugenAnimationFrame,
  frameIndex: number,
): RuntimeHitEffectAssetFrame {
  return {
    source,
    actionId,
    frameIndex,
    spriteGroup: frame.spriteGroup,
    spriteIndex: frame.spriteIndex,
    offsetX: frame.offsetX,
    offsetY: frame.offsetY,
    duration: frame.duration,
  };
}
