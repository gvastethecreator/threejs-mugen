import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import { RuntimeFrameWorld } from "./RuntimeFrameSystem";
import type {
  ActorSnapshot,
  CharacterRuntimeState,
  RuntimeEnvShakeEvent,
  RuntimeHitEffectEvent,
  RuntimeSoundEvent,
  RuntimeStageFlash,
  StageSnapshot,
} from "./types";
import type { RuntimeEffectSnapshotGroups } from "./EffectLifecycleSystem";
import type { RuntimeTarget, RuntimeTargetBinding, RuntimeTargetWorld } from "./TargetSystem";

const frameWorld = new RuntimeFrameWorld();

export type RuntimeSnapshotActor = {
  runtime: {
    pos: CharacterRuntimeState["pos"];
    screenBound?: Pick<NonNullable<CharacterRuntimeState["screenBound"]>, "moveCameraX">;
  };
};

export type RuntimePlayerSnapshotActor = {
  id: string;
  label: string;
  definition: {
    id: string;
    source?: "demo" | "imported";
  };
  stateOwner?: {
    id: string;
    label: string;
    definition: {
      id: string;
    };
  };
  runtime: CharacterRuntimeState;
  currentAction: MugenAnimationAction;
  currentMove?: {
    activeStart: number;
    activeEnd: number;
    hitbox: CollisionBox;
  };
  moveTick: number;
  hitPause: number;
  targets: RuntimeTarget[];
  targetBindings: RuntimeTargetBinding[];
  bindToTarget?: RuntimeTargetBinding;
  targetWorld: Pick<RuntimeTargetWorld, "snapshot" | "count">;
  soundEvents: RuntimeSoundEvent[];
  hitEffectEvents: RuntimeHitEffectEvent[];
  envShakeEvents: RuntimeEnvShakeEvent[];
};

export type RuntimeStageSnapshotInput = {
  stage: MugenStageDefinition;
  actors: RuntimeSnapshotActor[];
  cameraShake?: StageSnapshot["camera"]["shake"];
  envColor?: RuntimeStageFlash;
};

export type RuntimeEffectSnapshotInput = {
  p1: RuntimeEffectSnapshotGroups;
  p2: RuntimeEffectSnapshotGroups;
};

export class RuntimeSnapshotWorld {
  stage(input: RuntimeStageSnapshotInput): StageSnapshot {
    const center = cameraCenterX(input.actors);
    return {
      id: input.stage.id,
      displayName: input.stage.displayName,
      floorY: input.stage.floorY,
      zOffset: input.stage.zOffset,
      bounds: input.stage.bounds,
      camera: {
        x: center + input.stage.camera.startX,
        y: input.stage.camera.startY,
        zoom: input.stage.camera.zoom,
        ...(input.cameraShake ? { shake: input.cameraShake } : {}),
      },
      ...(input.envColor ? { envColor: input.envColor } : {}),
      layers: input.stage.layers,
      animations: input.stage.animations,
      bgControllers: input.stage.bgControllers,
    };
  }

  actor(actor: RuntimePlayerSnapshotActor): ActorSnapshot {
    const frame = frameWorld.currentFrame(actor);
    const activeHitbox = frameWorld.currentAttackBoxes(actor);
    const targetSnapshot = actor.targetWorld.snapshot(actor);
    return {
      id: actor.id,
      label: actor.label,
      actorKind: "player",
      ownerId: actor.id,
      rootId: actor.id,
      parentId: actor.id,
      source: actor.definition.source ?? "demo",
      ...spriteOwnerSnapshot(actor),
      hitPause: actor.hitPause,
      runtime: {
        ...structuredClone(actor.runtime),
        targetCount: actor.targetWorld.count(actor),
        targetRefs: targetSnapshot.targets,
        targetBindings: targetSnapshot.bindings,
        ...(actor.bindToTarget
          ? {
              bindToTarget: {
                actorId: actor.bindToTarget.actorId,
                targetId: actor.bindToTarget.targetId,
                remaining:
                  actor.bindToTarget.remaining === Number.POSITIVE_INFINITY
                    ? "infinite"
                    : actor.bindToTarget.remaining,
                offset: { ...actor.bindToTarget.offset },
              },
            }
          : {}),
      },
      frame,
      clsn1: activeHitbox,
      clsn2: frameWorld.currentHurtBoxes(actor),
      soundEvents: actor.soundEvents.map((event) => ({ ...event })),
      hitEffectEvents: actor.hitEffectEvents.map((event) => ({
        ...event,
        offset: event.offset ? { ...event.offset } : undefined,
        assetFrame: event.assetFrame ? { ...event.assetFrame } : undefined,
        assetFrames: event.assetFrames?.map((assetFrame) => ({ ...assetFrame })),
      })),
      envShakeEvents: actor.envShakeEvents.map((event) => ({ ...event })),
    };
  }

  effects(input: RuntimeEffectSnapshotInput): ActorSnapshot[] {
    return [
      ...input.p1.explods,
      ...input.p2.explods,
      ...input.p1.helpers,
      ...input.p2.helpers,
      ...input.p1.projectiles,
      ...input.p2.projectiles,
    ].map((snapshot) => structuredClone(snapshot));
  }
}

export function cameraCenterX(actors: RuntimeSnapshotActor[]): number {
  const cameraActors = actors.filter((actor) => actor.runtime.screenBound?.moveCameraX !== false);
  const source = cameraActors.length > 0 ? cameraActors : actors;
  return source.reduce((sum, actor) => sum + actor.runtime.pos.x, 0) / Math.max(1, source.length);
}

function spriteOwnerSnapshot(actor: RuntimePlayerSnapshotActor): {
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
} {
  const owner = actor.stateOwner ?? actor;
  return {
    spriteOwnerId: owner.id,
    spriteOwnerDefinitionId: owner.definition.id,
    spriteOwnerLabel: owner.label,
  };
}
