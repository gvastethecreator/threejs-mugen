import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import { RuntimeFrameWorld } from "./RuntimeFrameSystem";
import { createActorPresentationOrder } from "./PresentationOrder";
import type { RuntimeHitDefPriorityProfile } from "./HitDefPriorityPolicy";
import type {
  ActorSnapshot,
  CharacterRuntimeState,
  MugenSnapshot,
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
    hitDefPriorityProfile?: RuntimeHitDefPriorityProfile;
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

export type RuntimeMatchSnapshotInput = {
  tick: number;
  playing: boolean;
  speed: number;
  toggles: Pick<MugenSnapshot, "showClsn1" | "showClsn2" | "showAxis" | "showGrid">;
  matchPause: MugenSnapshot["matchPause"];
  stage: RuntimeStageSnapshotInput;
  round: MugenSnapshot["round"];
  p1: RuntimePlayerSnapshotActor;
  p2: RuntimePlayerSnapshotActor;
  reserveActors?: readonly RuntimePlayerSnapshotActor[];
  effects: RuntimeEffectSnapshotInput;
  compatibilitySession: MugenSnapshot["compatibilitySession"];
  tickSchedule?: MugenSnapshot["tickSchedule"];
  rootPresentation?: MugenSnapshot["rootPresentation"];
  rootBodyPush?: MugenSnapshot["rootBodyPush"];
  rootHitAdmission?: MugenSnapshot["rootHitAdmission"];
  logs: string[];
};

export class RuntimeSnapshotWorld {
  match(input: RuntimeMatchSnapshotInput): MugenSnapshot {
    const actors = [this.actor(input.p1), this.actor(input.p2)];
    const reserveActors = (input.reserveActors ?? []).map((actor) => this.actor(actor));
    const effects = this.effects(input.effects);
    const globalNoShadow = [...actors, ...reserveActors, ...effects].some(hasRuntimeGlobalNoShadow);
    return {
      tick: input.tick,
      selectedActionId: input.p1.runtime.animNo,
      selectedAction: input.p1.currentAction,
      playing: input.playing,
      speed: input.speed,
      ...input.toggles,
      matchPause: input.matchPause,
      stage: this.stage(input.stage),
      round: input.round,
      actors: actors.map((actor) => applyShadowVisibility(actor, globalNoShadow)),
      ...(reserveActors.length > 0
        ? { reserveActors: reserveActors.map((actor) => applyShadowVisibility(actor, globalNoShadow)) }
        : {}),
      effects: effects.map((effect) => applyShadowVisibility(effect, globalNoShadow)),
      compatibilitySession: input.compatibilitySession,
      ...(input.tickSchedule ? { tickSchedule: structuredClone(input.tickSchedule) } : {}),
      ...(input.rootPresentation ? { rootPresentation: structuredClone(input.rootPresentation) } : {}),
      ...(input.rootBodyPush ? { rootBodyPush: structuredClone(input.rootBodyPush) } : {}),
      ...(input.rootHitAdmission ? { rootHitAdmission: structuredClone(input.rootHitAdmission) } : {}),
      logs: input.logs.slice(0, 80),
    };
  }

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
      presentationOrder: createActorPresentationOrder(
        "player",
        actor.runtime.spritePriority ?? (actor.id === "p2" ? 1 : 2),
        actorPresentationBias(actor.id),
        {
          profile: presentationProfile(actor.definition.hitDefPriorityProfile ?? actor.runtime.hitDefSpritePriority?.profile),
          blendPolicy: actor.runtime.paletteFx?.add.some((value) => value > 0) ? "additive" : "alpha",
        },
      ),
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
      frame: structuredClone(frame),
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
    ].map((snapshot) => {
      const clone = structuredClone(snapshot);
      clone.presentationOrder = createActorPresentationOrder(
        clone.actorKind,
        clone.runtime.spritePriority ?? 0,
        actorPresentationBias(clone.id),
        {
          profile: "unknown",
          blendPolicy: clone.runtime.paletteFx?.add.some((value) => value > 0) ? "additive" : "alpha",
        },
      );
      return clone;
    });
  }
}

function actorPresentationBias(actorId: string): number {
  return actorId === "p2" ? 1 : 2;
}

function presentationProfile(profile: RuntimeHitDefPriorityProfile | undefined): "mugen-1.1" | "ikemen-go" | "unknown" {
  return profile === "mugen-1.1" || profile === "ikemen-go" ? profile : "unknown";
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

function applyShadowVisibility(actor: ActorSnapshot, globalNoShadow: boolean): ActorSnapshot {
  if (!supportsRuntimeShadow(actor)) {
    return actor;
  }
  if (globalNoShadow || hasRuntimeLocalNoShadow(actor) || actor.shadowVisible === false) {
    return { ...actor, shadowVisible: false };
  }
  return actor;
}

function supportsRuntimeShadow(actor: ActorSnapshot): boolean {
  return actor.actorKind === "player" || actor.actorKind === "helper" || actor.actorKind === "explod";
}

function hasRuntimeLocalNoShadow(actor: ActorSnapshot): boolean {
  return actor.runtime.assertSpecial?.flags.includes("noshadow") === true;
}

function hasRuntimeGlobalNoShadow(actor: ActorSnapshot): boolean {
  return actor.runtime.assertSpecial?.globalFlags.includes("globalnoshadow") === true;
}
