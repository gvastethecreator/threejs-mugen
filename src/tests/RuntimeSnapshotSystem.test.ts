import { describe, expect, it } from "vitest";
import type { MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import { trainingStage } from "../mugen/runtime/demoStage";
import {
  cameraCenterX,
  RuntimeSnapshotWorld,
  type RuntimePlayerSnapshotActor,
  type RuntimeSnapshotActor,
} from "../mugen/runtime/RuntimeSnapshotSystem";
import type { ActorSnapshot, CharacterRuntimeState, RuntimeStageFlash } from "../mugen/runtime/types";

describe("RuntimeSnapshotWorld", () => {
  it("projects camera center from actors that can move the camera", () => {
    const actors = [
      actorAt(-120),
      actorAt(40, { moveCameraX: false }),
      actorAt(80),
    ];

    expect(cameraCenterX(actors)).toBe(-20);
  });

  it("falls back to every actor when all actors disable camera movement", () => {
    const actors = [actorAt(-120, { moveCameraX: false }), actorAt(40, { moveCameraX: false })];

    expect(cameraCenterX(actors)).toBe(-40);
  });

  it("owns stage snapshot projection for camera, shake, env color, and stage data", () => {
    const world = new RuntimeSnapshotWorld();
    const envColor: RuntimeStageFlash = {
      color: [24, 48, 96],
      opacity: 0.5,
      under: true,
      remaining: 7,
    };
    const cameraShake = {
      x: 3,
      y: -2,
      remaining: 5,
      amplitude: 4,
    };

    const snapshot = world.stage({
      stage: trainingStage,
      actors: [actorAt(-100), actorAt(50)],
      cameraShake,
      envColor,
    });

    expect(snapshot).toMatchObject({
      id: trainingStage.id,
      displayName: trainingStage.displayName,
      floorY: trainingStage.floorY,
      zOffset: trainingStage.zOffset,
      bounds: trainingStage.bounds,
      camera: {
        x: -25 + trainingStage.camera.startX,
        y: trainingStage.camera.startY,
        zoom: trainingStage.camera.zoom,
        shake: cameraShake,
      },
      envColor,
      layers: trainingStage.layers,
      animations: trainingStage.animations,
      bgControllers: trainingStage.bgControllers,
    });
  });

  it("owns player actor snapshot projection for runtime, targets, active boxes, events, and sprite owner", () => {
    const world = new RuntimeSnapshotWorld();
    const runtime = runtimeState();
    const activeMoveBox = { x1: 1, y1: -12, x2: 22, y2: -2 };
    const actor: RuntimePlayerSnapshotActor = {
      id: "p1",
      label: "Imported KFM",
      definition: { id: "kfm", source: "imported", hitDefPriorityProfile: "mugen-1.1" },
      stateOwner: {
        id: "p2",
        label: "Target Owner",
        definition: { id: "target-def" },
      },
      runtime,
      currentAction: {
        id: 200,
        frames: [frame({ clsn2: [{ x1: -20, y1: -80, x2: 18, y2: 0 }] })],
        rawLines: [],
      },
      currentMove: {
        activeStart: 2,
        activeEnd: 4,
        hitbox: activeMoveBox,
      },
      moveTick: 3,
      hitPause: 7,
      targets: [{ actorId: "p2", targetId: 10, age: 5 }],
      targetBindings: [],
      bindToTarget: {
        actorId: "p1",
        targetId: 10,
        remaining: Number.POSITIVE_INFINITY,
        offset: { x: 12, y: -4 },
      },
      targetWorld: {
        snapshot: () => ({
          targets: [{ actorId: "p2", targetId: 10, age: 5 }],
          bindings: [{ actorId: "p1", targetId: 10, remaining: "infinite", offset: { x: 12, y: -4 } }],
        }),
        count: () => 1,
      },
      soundEvents: [{ type: "PlaySnd", group: 5, index: 0, stateNo: 200, tick: 3, runtimeTick: 12 }],
      hitEffectEvents: [
        {
          type: "HitSpark",
          kind: "hit",
          sparkNo: 7000,
          rawPrefix: "S",
          offset: { x: 8, y: -70 },
          stateNo: 200,
          tick: 3,
          runtimeTick: 13,
          assetFrame: {
            source: "player",
            actionId: 7000,
            frameIndex: 0,
            spriteGroup: 7000,
            spriteIndex: 0,
            offsetX: 1,
            offsetY: 2,
            duration: 3,
          },
          assetFrames: [
            {
              source: "player",
              actionId: 7000,
              frameIndex: 0,
              spriteGroup: 7000,
              spriteIndex: 0,
              offsetX: 1,
              offsetY: 2,
              duration: 3,
            },
          ],
        },
      ],
      envShakeEvents: [{ type: "EnvShake", time: 8, freq: 60, ampl: 4, phase: 0, stateNo: 200, tick: 3, runtimeTick: 14 }],
    };

    const snapshot = world.actor(actor);
    runtime.pos.x = 999;
    actor.hitEffectEvents[0].offset = { x: 999, y: 999 };

    expect(snapshot).toMatchObject({
      id: "p1",
      label: "Imported KFM",
      actorKind: "player",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      source: "imported",
      presentationOrder: {
        schema: "MugenPresentationOrder/v0",
        profile: "mugen-1.1",
        phase: "actor",
        sourceKind: "player",
        blendPolicy: "alpha",
        priority: 2,
        tieBreaker: 2,
        tiePolicy: "unknown-reference",
      },
      spriteOwnerId: "p2",
      spriteOwnerDefinitionId: "target-def",
      spriteOwnerLabel: "Target Owner",
      hitPause: 7,
      clsn1: [activeMoveBox],
      clsn2: [{ x1: -20, y1: -80, x2: 18, y2: 0 }],
      runtime: {
        pos: { x: 30, y: 0 },
        targetCount: 1,
        targetRefs: [{ actorId: "p2", targetId: 10, age: 5 }],
        bindToTarget: {
          actorId: "p1",
          targetId: 10,
          remaining: "infinite",
          offset: { x: 12, y: -4 },
        },
      },
      soundEvents: [{ type: "PlaySnd", group: 5, index: 0, stateNo: 200, tick: 3, runtimeTick: 12 }],
      envShakeEvents: [{ type: "EnvShake", time: 8, freq: 60, ampl: 4, phase: 0, stateNo: 200, tick: 3, runtimeTick: 14 }],
    });
    expect(snapshot.hitEffectEvents?.[0]?.offset).toEqual({ x: 8, y: -70 });
    expect(snapshot.hitEffectEvents?.[0]?.assetFrames).toEqual([
      {
        source: "player",
        actionId: 7000,
        frameIndex: 0,
        spriteGroup: 7000,
        spriteIndex: 0,
        offsetX: 1,
        offsetY: 2,
        duration: 3,
      },
    ]);
  });

  it("uses frame collision boxes when no active move exists", () => {
    const world = new RuntimeSnapshotWorld();
    const snapshot = world.actor({
      id: "p1",
      label: "Demo",
      definition: { id: "demo" },
      runtime: runtimeState(),
      currentAction: {
        id: 0,
        frames: [frame({ clsn1: [{ x1: 2, y1: 3, x2: 4, y2: 5 }], clsn2: [] })],
        rawLines: [],
      },
      moveTick: 0,
      hitPause: 0,
      targets: [],
      targetBindings: [],
      targetWorld: {
        snapshot: () => ({ targets: [], bindings: [] }),
        count: () => 0,
      },
      soundEvents: [],
      hitEffectEvents: [],
      envShakeEvents: [],
    });

    expect(snapshot.source).toBe("demo");
    expect(snapshot.clsn1).toEqual([{ x1: 2, y1: 3, x2: 4, y2: 5 }]);
    expect(snapshot.clsn2).toEqual([]);
  });

  it("uses default hurtbox when the current animation frame is missing", () => {
    const world = new RuntimeSnapshotWorld();
    const snapshot = world.actor({
      id: "p1",
      label: "Demo",
      definition: { id: "demo" },
      runtime: runtimeState(),
      currentAction: {
        id: 0,
        frames: [],
        rawLines: [],
      },
      moveTick: 0,
      hitPause: 0,
      targets: [],
      targetBindings: [],
      targetWorld: {
        snapshot: () => ({ targets: [], bindings: [] }),
        count: () => 0,
      },
      soundEvents: [],
      hitEffectEvents: [],
      envShakeEvents: [],
    });

    expect(snapshot.clsn1).toEqual([]);
    expect(snapshot.clsn2).toEqual([{ x1: -24, y1: -96, x2: 24, y2: 0 }]);
  });

  it("owns ordered effect snapshot aggregation without leaking mutable snapshots", () => {
    const world = new RuntimeSnapshotWorld();
    const p1Explod = effectSnapshot("p1-explod-1", "explod", "p1", { x: 1, y: 0 });
    const p2Explod = effectSnapshot("p2-explod-1", "explod", "p2", { x: 2, y: 0 });
    const p1Helper = effectSnapshot("p1-helper-1", "helper", "p1", { x: 3, y: 0 });
    const p2Projectile = effectSnapshot("p2-projectile-1", "projectile", "p2", { x: 4, y: 0 });
    p1Explod.runtime.hitDefSpritePriority = {
      profile: "mugen-1.1",
      role: "p1",
      contactKind: "hit",
      value: 4,
      source: "authored",
      supported: true,
    };

    const snapshots = world.effects({
      p1: { explods: [p1Explod], helpers: [p1Helper], projectiles: [] },
      p2: { explods: [p2Explod], helpers: [], projectiles: [p2Projectile] },
    });
    p1Explod.runtime.pos.x = 999;
    p1Explod.clsn1[0]!.x1 = 999;

    expect(snapshots.map((snapshot) => snapshot.id)).toEqual([
      "p1-explod-1",
      "p2-explod-1",
      "p1-helper-1",
      "p2-projectile-1",
    ]);
    expect(snapshots[0]?.runtime.pos.x).toBe(1);
    expect(snapshots[0]?.clsn1).toEqual([{ x1: 0, y1: -10, x2: 8, y2: 0 }]);
    expect(snapshots[0]?.presentationOrder).toMatchObject({ profile: "unknown", sourceKind: "explod", priority: 0 });
  });

  it("owns full match snapshot envelope assembly", () => {
    const world = new RuntimeSnapshotWorld();
    const p1 = playerActor("p1", "P1", 200);
    const p2 = playerActor("p2", "P2", 0);
    const p1Explod = effectSnapshot("p1-explod-1", "explod", "p1", { x: 8, y: 0 });
    const logs = Array.from({ length: 82 }, (_, index) => `log-${index}`);
    const matchPause = {
      type: "Pause" as const,
      remaining: 3,
      moveTime: 1,
      actorId: "p1",
      darken: true,
      sourceStateNo: 200,
    };
    const round = {
      state: "fight" as const,
      timer: 88,
      message: "Fight",
    };
    const compatibilitySession = {
      actors: [],
    };
    const rootPresentation = {
      schema: "RuntimeRootPresentation/v1" as const,
      mode: "ikemen-tag" as const,
      roots: [],
      drawRootIds: ["p1", "p2"],
      cameraRootIds: ["p1", "p2"],
      collisionRootIds: ["p1", "p2"],
    };
    const rootBodyPush = {
      schema: "RuntimeRootBodyPush/v0" as const,
      mode: "ikemen-tag" as const,
      rootIds: ["p1", "p2"],
      pairIds: [["p1", "p2"]] as Array<[string, string]>,
      movedRootIds: ["p1", "p2"],
    };

    const snapshot = world.match({
      tick: 42,
      playing: false,
      speed: 2,
      toggles: {
        showClsn1: true,
        showClsn2: false,
        showAxis: true,
        showGrid: false,
      },
      matchPause,
      stage: { stage: trainingStage, actors: [p1, p2] },
      round,
      p1,
      p2,
      effects: {
        p1: { explods: [p1Explod], helpers: [], projectiles: [] },
        p2: { explods: [], helpers: [], projectiles: [] },
      },
      compatibilitySession,
      rootPresentation,
      rootBodyPush,
      logs,
    });
    p1.runtime.pos.x = 999;
    p1Explod.runtime.pos.x = 999;
    logs[0] = "mutated";
    rootPresentation.drawRootIds[0] = "mutated";
    rootBodyPush.rootIds[0] = "mutated";

    expect(snapshot).toMatchObject({
      tick: 42,
      selectedActionId: 200,
      selectedAction: { id: 200 },
      playing: false,
      speed: 2,
      showClsn1: true,
      showClsn2: false,
      showAxis: true,
      showGrid: false,
      matchPause,
      round,
      compatibilitySession,
      rootPresentation: expect.objectContaining({ drawRootIds: ["p1", "p2"] }),
      rootBodyPush: expect.objectContaining({ rootIds: ["p1", "p2"] }),
    });
    expect(snapshot.actors.map((actor) => actor.id)).toEqual(["p1", "p2"]);
    expect(snapshot.actors[0]?.runtime.pos.x).toBe(30);
    expect(snapshot.effects?.map((effect) => effect.id)).toEqual(["p1-explod-1"]);
    expect(snapshot.effects?.[0]?.runtime.pos.x).toBe(8);
    expect(snapshot.stage.id).toBe(trainingStage.id);
    expect(snapshot.logs).toHaveLength(80);
    expect(snapshot.logs[0]).toBe("log-0");
    expect(snapshot.logs[79]).toBe("log-79");
  });

  it("projects AssertSpecial shadow suppression across players and supported effects", () => {
    const world = new RuntimeSnapshotWorld();
    const p1 = playerActor("p1", "P1", 0);
    const p2 = playerActor("p2", "P2", 0);
    p1.runtime.assertSpecial = { flags: ["noshadow"], globalFlags: [], noShadow: true };
    const localSnapshot = world.match({
      tick: 1,
      playing: true,
      speed: 1,
      toggles: { showClsn1: false, showClsn2: false, showAxis: false, showGrid: false },
      matchPause: undefined,
      stage: { stage: trainingStage, actors: [p1, p2] },
      round: undefined,
      p1,
      p2,
      effects: {
        p1: { explods: [effectSnapshot("p1-explod-1", "explod", "p1", { x: 8, y: 0 })], helpers: [], projectiles: [] },
        p2: { explods: [], helpers: [], projectiles: [] },
      },
      compatibilitySession: undefined,
      logs: [],
    });

    expect(localSnapshot.actors[0]?.shadowVisible).toBe(false);
    expect(localSnapshot.actors[1]?.shadowVisible).toBeUndefined();
    expect(localSnapshot.effects?.[0]?.shadowVisible).toBeUndefined();

    p1.runtime.assertSpecial = { flags: [], globalFlags: ["globalnoshadow"], noShadow: true };
    const p1Helper = effectSnapshot("p1-helper-1", "helper", "p1", { x: 12, y: 0 });
    const p1Projectile = effectSnapshot("p1-projectile-1", "projectile", "p1", { x: 16, y: 0 });
    const globalSnapshot = world.match({
      tick: 2,
      playing: true,
      speed: 1,
      toggles: { showClsn1: false, showClsn2: false, showAxis: false, showGrid: false },
      matchPause: undefined,
      stage: { stage: trainingStage, actors: [p1, p2] },
      round: undefined,
      p1,
      p2,
      effects: {
        p1: {
          explods: [effectSnapshot("p1-explod-1", "explod", "p1", { x: 8, y: 0 })],
          helpers: [p1Helper],
          projectiles: [p1Projectile],
        },
        p2: { explods: [], helpers: [], projectiles: [] },
      },
      compatibilitySession: undefined,
      logs: [],
    });

    expect(globalSnapshot.actors.map((actor) => actor.shadowVisible)).toEqual([false, false]);
    expect(globalSnapshot.effects?.find((effect) => effect.actorKind === "explod")?.shadowVisible).toBe(false);
    expect(globalSnapshot.effects?.find((effect) => effect.actorKind === "helper")?.shadowVisible).toBe(false);
    expect(globalSnapshot.effects?.find((effect) => effect.actorKind === "projectile")?.shadowVisible).toBeUndefined();

    p1.runtime.assertSpecial = { flags: [], globalFlags: [], noShadow: false };
    const p3 = playerActor("p3", "P3", 0);
    p3.runtime.assertSpecial = { flags: [], globalFlags: ["globalnoshadow"], noShadow: true };
    const reserveGlobalSnapshot = world.match({
      tick: 3,
      playing: true,
      speed: 1,
      toggles: { showClsn1: false, showClsn2: false, showAxis: false, showGrid: false },
      matchPause: undefined,
      stage: { stage: trainingStage, actors: [p1, p2] },
      round: undefined,
      p1,
      p2,
      reserveActors: [p3],
      effects: {
        p1: { explods: [], helpers: [], projectiles: [] },
        p2: { explods: [], helpers: [], projectiles: [] },
      },
      compatibilitySession: undefined,
      logs: [],
    });
    expect(reserveGlobalSnapshot.actors.map((actor) => actor.shadowVisible)).toEqual([false, false]);
    expect(reserveGlobalSnapshot.reserveActors?.[0]?.shadowVisible).toBe(false);
  });
});

function actorAt(x: number, screenBound?: RuntimeSnapshotActor["runtime"]["screenBound"]): RuntimeSnapshotActor {
  return {
    runtime: {
      pos: { x, y: 0 },
      screenBound,
    },
  };
}

function runtimeState(): CharacterRuntimeState {
  return {
    pos: { x: 30, y: 0 },
    vel: { x: 1, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "A",
    physics: "S",
    vars: [],
    fvars: [],
  };
}

function playerActor(id: string, label: string, animNo: number): RuntimePlayerSnapshotActor {
  const runtime = runtimeState();
  runtime.animNo = animNo;
  return {
    id,
    label,
    definition: { id },
    runtime,
    currentAction: {
      id: animNo,
      frames: [frame()],
      rawLines: [],
    },
    moveTick: 0,
    hitPause: 0,
    targets: [],
    targetBindings: [],
    targetWorld: {
      snapshot: () => ({ targets: [], bindings: [] }),
      count: () => 0,
    },
    soundEvents: [],
    hitEffectEvents: [],
    envShakeEvents: [],
  };
}

function frame(overrides: Partial<MugenAnimationFrame> = {}): MugenAnimationFrame {
  return {
    spriteGroup: 200,
    spriteIndex: 0,
    offsetX: 0,
    offsetY: 0,
    duration: 3,
    clsn1: [],
    clsn2: [],
    raw: "200,0,0,0,3",
    line: 1,
    ...overrides,
  };
}

function effectSnapshot(
  id: string,
  kind: NonNullable<ActorSnapshot["effect"]>["kind"],
  ownerId: string,
  pos: CharacterRuntimeState["pos"],
): ActorSnapshot {
  return {
    id,
    label: id,
    actorKind: kind,
    ownerId,
    rootId: ownerId,
    parentId: ownerId,
    source: "effect",
    effect: effectPayload(kind),
    runtime: {
      ...runtimeState(),
      pos: { ...pos },
    },
    clsn1: [{ x1: 0, y1: -10, x2: 8, y2: 0 }],
    clsn2: [],
  };
}

function effectPayload(kind: NonNullable<ActorSnapshot["effect"]>["kind"]): NonNullable<ActorSnapshot["effect"]> {
  if (kind === "explod") {
    return {
      kind,
      age: 1,
      removeTime: 30,
      spritePriority: 2,
      opacity: 1,
      scale: { x: 1, y: 1 },
      removeOnGetHit: false,
      ignoreHitPause: false,
      pauseMoveTime: 0,
      superMoveTime: 0,
    };
  }
  if (kind === "helper") {
    return {
      kind,
      age: 1,
      stateTime: 1,
      removeTime: 30,
      spritePriority: 2,
      targetCount: 0,
      scale: { x: 1, y: 1 },
      ignoreHitPause: false,
      pauseMoveTime: 0,
      superMoveTime: 0,
    };
  }
  return {
    kind,
    age: 1,
    removeTime: 30,
    spritePriority: 2,
    priority: 1,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    damage: 10,
    hitPause: 0,
    hitStun: 0,
    guardDamage: 0,
    guardPause: 0,
    guardStun: 0,
    guardDistance: 0,
    removeOnHit: true,
    hasHit: false,
  };
}
