import { describe, expect, it } from "vitest";
import type { ProjectileControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import {
  advanceRuntimeProjectiles,
  canRuntimeProjectileContact,
  createRuntimeProjectile,
  getRuntimeProjectileHitboxes,
  hasRuntimeProjectileContact,
  modifyRuntimeProjectiles,
  recordRuntimeProjectileContact,
  runtimeProjectileContactTime,
  runtimeProjectileWorldBox,
  runtimeProjectilesToSnapshots,
  describeRuntimeProjectileRemoval,
  shouldKeepRuntimeProjectileAfterRemoval,
  type RuntimeProjectile,
} from "../mugen/runtime/ProjectileSystem";

const stage: Pick<MugenStageDefinition, "bounds"> = {
  bounds: {
    left: -120,
    right: 120,
  },
};

const action: MugenAnimationAction = {
  id: 1005,
  loopStart: 0,
  rawLines: [],
  frames: [
    {
      spriteGroup: 1005,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 2,
      clsn1: [{ x1: 8, y1: -40, x2: 42, y2: -16 }],
      clsn2: [{ x1: -8, y1: -44, x2: 44, y2: -12 }],
      raw: "1005,0,0,0,2",
      line: 1,
    },
    {
      spriteGroup: 1005,
      spriteIndex: 1,
      offsetX: 1,
      offsetY: -1,
      duration: 1,
      clsn1: [],
      clsn2: [],
      raw: "1005,1,1,-1,1",
      line: 2,
    },
  ],
};

const terminalAction: MugenAnimationAction = {
  id: 1400,
  rawLines: ["[Begin Action 1400]"],
  frames: [
    {
      spriteGroup: 1400,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 2,
      clsn1: [{ x1: 100, y1: 100, x2: 120, y2: 120 }],
      clsn2: [{ x1: 90, y1: 90, x2: 130, y2: 130 }],
      raw: "1400,0,0,0,2",
      line: 1,
    },
  ],
};

describe("ProjectileSystem", () => {
  it("creates a bounded projectile actor from controller params", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller({
        projid: "77",
        id: "78",
        chainID: "43",
        numhits: "3",
        velocity: "5,-1",
        accel: "0.5,0.25",
        velmul: "0.5,1.5",
        projscale: "1.5,0.75",
        facing: "-1",
        projhitanim: "1200",
        projremanim: "1201",
        projcancelanim: "1202",
        projedgebound: "48",
        projstagebound: "32",
        projheightbound: "-96,64",
        projremovetime: "9999",
        projpriority: "12",
        projhits: "3",
        projmisstime: "4",
        sprpriority: "25",
        trans: "add",
        damage: "40",
        guardflag: "MA",
        "guard.pausetime": "3,3",
        "guard.hittime": "8",
        "guard.velocity": "-4,-1",
        "airguard.velocity": "-8,-2",
        "ground.cornerpush.veloff": "3",
        "air.cornerpush.veloff": "4",
        "down.cornerpush.veloff": "5",
        "guard.cornerpush.veloff": "6",
        "airguard.cornerpush.veloff": "7",
        attr: '"S,SP"',
        pausetime: "9",
        "ground.hittime": "21",
        "ground.velocity": "-7,-3",
        missonoverride: "1",
        projremove: "0",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 12, y: -20 },
      fallbackFacing: 1,
      damageScale: 1.5,
    });

    expect(projectile).toMatchObject({
      serialId: "p1-projectile-0",
      projectileId: 77,
      actorKind: "projectile",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      animNo: 1005,
      pos: { x: 12, y: -20 },
      vel: { x: -5, y: -1 },
      accel: { x: -0.5, y: 0.25 },
      velMul: { x: 0.5, y: 1.5 },
      scale: { x: 1.5, y: 0.75 },
      facing: -1,
      hitAnimNo: 1200,
      removeAnimNo: 1201,
      cancelAnimNo: 1202,
      removeTime: 1200,
      edgeBound: 48,
      stageBound: 32,
      heightBound: { low: -96, high: 64 },
      priority: 10,
      hitsRemaining: 3,
      missTime: 4,
      missTimeRemaining: 0,
      spritePriority: 10,
      opacity: 0.78,
      damage: 60,
      attr: "S,SP",
      targetId: 78,
      chainId: 43,
      hitDefHitCount: 3,
      hitPause: 9,
      hitStun: 21,
      push: 7,
      hitVelocityY: -3,
      guardDamage: 0,
      guardFlag: "MA",
      guardPause: 3,
      guardStun: 8,
      guardPush: 4,
      guardVelocityY: -1,
      airGuardPush: 8,
      airGuardVelocityY: -2,
      cornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      removeOnHit: false,
      hasHit: false,
    });
  });

  it("defaults missing Projectile id to target id 0", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller({
        projanim: "1005",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile.projectileId).toBe(0);
    expect(projectile.targetId).toBe(0);
  });

  it("uses official 240p default Projectile removal bounds when params are omitted", () => {
    const createDefaultBoundProjectile = (serialId: string, pos: { x: number; y: number }, velocity: string) =>
      createRuntimeProjectile({
        serialId,
        controller: controller({
          projanim: "1005",
          velocity,
        }),
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos,
        fallbackFacing: 1,
      });
    const horizontal = createDefaultBoundProjectile("default-horizontal", { x: 152, y: 0 }, "9,0");
    const verticalLow = createDefaultBoundProjectile("default-vertical-low", { x: 0, y: -236 }, "0,-5");
    const verticalHigh = createDefaultBoundProjectile("default-vertical-high", { x: 0, y: 0 }, "0,2");

    expect(horizontal).toMatchObject({
      edgeBound: 40,
      stageBound: 40,
      heightBound: { low: -240, high: 1 },
    });
    const snapshotEffect = runtimeProjectilesToSnapshots([horizontal], 1000)[0]?.effect;
    expect(snapshotEffect).not.toHaveProperty("edgeBound");
    expect(snapshotEffect).not.toHaveProperty("stageBound");
    expect(snapshotEffect).not.toHaveProperty("heightBound");

    const remaining = advanceRuntimeProjectiles([horizontal, verticalLow, verticalHigh], stage);

    expect(remaining).toEqual([]);
    expect(horizontal).toMatchObject({ removalReason: "bounds" });
    expect(verticalLow).toMatchObject({ removalReason: "bounds" });
    expect(verticalHigh).toMatchObject({ removalReason: "bounds" });
  });

  it("scales omitted Projectile removal bounds from character localcoord width", () => {
    const createDefaultBoundProjectile = (serialId: string, pos: { x: number; y: number }, velocity: string) =>
      createRuntimeProjectile({
        serialId,
        controller: controller({
          projanim: "1005",
          velocity,
        }),
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm-480",
        spriteOwnerLabel: "Kung Fu Man 480p",
        action,
        animNo: 1005,
        pos,
        fallbackFacing: 1,
        localCoord: [640, 480],
      });
    const horizontal = createDefaultBoundProjectile("default-horizontal-480p", { x: 198, y: 0 }, "3,0");
    const verticalLow = createDefaultBoundProjectile("default-vertical-low-480p", { x: 0, y: -478 }, "0,-3");
    const verticalHigh = createDefaultBoundProjectile("default-vertical-high-480p", { x: 0, y: 1 }, "0,2");

    expect(horizontal).toMatchObject({
      edgeBound: 80,
      stageBound: 80,
      heightBound: { low: -480, high: 2 },
    });
    expect(runtimeProjectilesToSnapshots([horizontal], 1000)[0]?.effect).toMatchObject({
      edgeBound: 80,
      stageBound: 80,
      heightBound: { low: -480, high: 2 },
    });

    const remaining = advanceRuntimeProjectiles([horizontal, verticalLow, verticalHigh], stage);

    expect(remaining).toEqual([]);
    expect(horizontal).toMatchObject({ removalReason: "bounds" });
    expect(verticalLow).toMatchObject({ removalReason: "bounds" });
    expect(verticalHigh).toMatchObject({ removalReason: "bounds" });
  });

  it("does not rescale explicit Projectile removal bounds from localcoord", () => {
    const projectile = createRuntimeProjectile({
      serialId: "explicit-bounds-480p",
      controller: controller({
        projanim: "1005",
        projedgebound: "48",
        projstagebound: "32",
        projheightbound: "-96,64",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm-480",
      spriteOwnerLabel: "Kung Fu Man 480p",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      localCoord: [640, 480],
    });

    expect(projectile).toMatchObject({
      edgeBound: 48,
      stageBound: 32,
      heightBound: { low: -96, high: 64 },
    });
  });

  it("derives missing Projectile airguard.velocity from air.velocity", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-air-default",
      controller: controller({
        projanim: "1005",
        damage: "24,2",
        guardflag: "A",
        "ground.velocity": "-4",
        "air.velocity": "-6,-8",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile).toMatchObject({
      guardDamage: 2,
      guardFlag: "A",
      airGuardPush: 9,
      airGuardVelocityY: -4,
    });
  });

  it("derives missing Projectile guard.velocity from ground.velocity x", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-guard-default",
      controller: controller({
        projanim: "1005",
        damage: "24,2",
        guardflag: "MA",
        "ground.velocity": "-6,-3",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile).toMatchObject({
      guardDamage: 2,
      guardFlag: "MA",
      guardPush: 6,
    });
    expect(projectile.guardVelocityY).toBeUndefined();
  });

  it("derives missing Projectile guard timing from ground hittime", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-guard-timing-default",
      controller: controller({
        projanim: "1005",
        damage: "24,2",
        guardflag: "MA",
        "ground.hittime": "17",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile).toMatchObject({
      guardStun: 17,
      guardSlideTime: 17,
      guardControlTime: 17,
    });
  });

  it("derives missing Projectile guard slide and control timing from guard hittime", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-guard-hit-timing-default",
      controller: controller({
        projanim: "1005",
        damage: "24,2",
        guardflag: "MA",
        "ground.hittime": "17",
        "guard.hittime": "8",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile).toMatchObject({
      guardStun: 8,
      guardSlideTime: 8,
      guardControlTime: 8,
    });
  });

  it("derives missing Projectile guard control timing from guard slidetime", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-guard-slide-timing-default",
      controller: controller({
        projanim: "1005",
        damage: "24,2",
        guardflag: "MA",
        "ground.hittime": "17",
        "guard.slidetime": "6",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile).toMatchObject({
      guardStun: 17,
      guardSlideTime: 6,
      guardControlTime: 6,
    });
  });

  it("prefers typed projectile operations over raw controller params", () => {
    const operation: ProjectileControllerOp = {
      kind: "projectile",
      projectileId: 91,
      velocity: [7, -2],
      acceleration: [1, 0.25],
      velocityMultiplier: [0.5, 2],
      scale: [2, 0.5],
      facing: 1,
      hitAnim: 1300,
      removeAnim: 1301,
      cancelAnim: 1302,
      removeTime: 25,
      priority: 3,
      hitCount: 2,
      hitDefHitCount: 5,
      missTime: 5,
      spritePriority: 6,
      trans: "none",
      damage: 22,
      attr: "S,SP",
      hitPause: 3,
      hitStun: 11,
      groundVelocity: [-9, -4],
      p2StateNo: 889,
      p2GetP1State: false,
      missOnOverride: true,
      guardDamage: 5,
      guardDistance: 88,
      guardFlag: "MA",
      guardPauseTime: 2,
      guardHitTime: 7,
      guardVelocity: [-3, -1],
      airGuardVelocity: [-6, -2],
      groundCornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      removeOnHit: false,
    };
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-typed",
      controller: controller({
        projid: "77",
        velocity: "-99,0",
        facing: "-1",
        projremovetime: "9999",
        sprpriority: "-5",
        trans: "add",
        damage: "999",
        pausetime: "99",
        "ground.hittime": "99",
        "ground.velocity": "-1",
        projremove: "1",
      }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: -1,
    });

    expect(projectile).toMatchObject({
      projectileId: 91,
      vel: { x: 7, y: -2 },
      accel: { x: 1, y: 0.25 },
      velMul: { x: 0.5, y: 2 },
      scale: { x: 2, y: 0.5 },
      facing: 1,
      hitAnimNo: 1300,
      removeAnimNo: 1301,
      cancelAnimNo: 1302,
      removeTime: 25,
      priority: 3,
      hitsRemaining: 2,
      hitDefHitCount: 5,
      missTime: 5,
      missTimeRemaining: 0,
      spritePriority: 6,
      opacity: 0.9,
      damage: 22,
      hitPause: 3,
      hitStun: 11,
      push: 9,
      hitVelocityY: -4,
      p2StateNo: 889,
      p2GetP1State: false,
      missOnOverride: true,
      guardDamage: 5,
      guardDistance: 88,
      guardFlag: "MA",
      guardPause: 2,
      guardStun: 7,
      guardPush: 3,
      guardVelocityY: -1,
      airGuardPush: 6,
      airGuardVelocityY: -2,
      cornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      removeOnHit: false,
    });
  });

  it("derives Projectile cornerpush defaults from guard velocity", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-corner-default",
      controller: controller({
        projanim: "1005",
        attr: "S,SP",
        guardflag: "MA",
        "ground.velocity": "-10",
        "guard.velocity": "-4",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile.cornerPush).toBeCloseTo(5.2);
    expect(projectile.airCornerPush).toBeCloseTo(5.2);
    expect(projectile.downCornerPush).toBeCloseTo(5.2);
    expect(projectile.guardCornerPush).toBeCloseTo(5.2);
    expect(projectile.airGuardCornerPush).toBeCloseTo(5.2);
  });

  it("advances projectile movement with acceleration, loops frames, and removes stale actors", () => {
    const active = projectile({
      serialId: "active",
      removeTime: 8,
      missTimeRemaining: 2,
      vel: { x: 4, y: -2 },
      accel: { x: 1, y: 0.5 },
    });
    const expired = projectile({ serialId: "expired", age: 4, removeTime: 5, removeAnimNo: 1201 });
    const hit = projectile({ serialId: "hit", hasHit: true, removeOnHit: true });
    const outside = projectile({ serialId: "outside", pos: { x: 999, y: 0 }, removeAnimNo: 1201 });

    const remaining = advanceRuntimeProjectiles([active, expired, hit, outside], stage);
    expect(remaining.map((entry) => entry.serialId)).toEqual(["active"]);
    expect(expired).toMatchObject({ removalReason: "timeout", removalAnimNo: 1201 });
    expect(outside).toMatchObject({ removalReason: "bounds", removalAnimNo: 1201 });
    expect(hit).toMatchObject({ removalReason: "hit" });
    expect(active).toMatchObject({
      age: 1,
      frameIndex: 0,
      frameElapsed: 1,
      missTimeRemaining: 1,
      pos: { x: 4, y: -2 },
      vel: { x: 5, y: -1.5 },
    });

    advanceRuntimeProjectiles([active], stage);
    expect(active.frameIndex).toBe(1);

    advanceRuntimeProjectiles([active], stage);
    expect(active.frameIndex).toBe(0);
  });

  it("uses explicit projstagebound for horizontal stage removal", () => {
    const tight = projectile({ serialId: "tight", pos: { x: 140, y: 0 }, vel: { x: 8, y: 0 }, stageBound: 24 });
    const defaultBound = projectile({ serialId: "default", pos: { x: 140, y: 0 }, vel: { x: 8, y: 0 } });

    const remaining = advanceRuntimeProjectiles([tight, defaultBound], stage);

    expect(remaining.map((entry) => entry.serialId)).toEqual(["default"]);
    expect(tight).toMatchObject({ removalReason: "bounds" });
    expect(defaultBound.removalReason).toBeUndefined();
    expect(runtimeProjectilesToSnapshots([tight], 1000)[0]).toMatchObject({
      effect: {
        stageBound: 24,
        removalReason: "bounds",
      },
    });
  });

  it("uses explicit projedgebound as a horizontal screen-edge removal proxy", () => {
    const tight = projectile({ serialId: "edge-tight", pos: { x: 140, y: 0 }, vel: { x: 8, y: 0 }, edgeBound: 24 });
    const defaultBound = projectile({ serialId: "edge-default", pos: { x: 140, y: 0 }, vel: { x: 8, y: 0 } });

    const remaining = advanceRuntimeProjectiles([tight, defaultBound], stage);

    expect(remaining.map((entry) => entry.serialId)).toEqual(["edge-default"]);
    expect(tight).toMatchObject({ removalReason: "bounds" });
    expect(defaultBound.removalReason).toBeUndefined();
    expect(runtimeProjectilesToSnapshots([tight], 1000)[0]).toMatchObject({
      effect: {
        edgeBound: 24,
        removalReason: "bounds",
      },
    });
  });

  it("uses explicit projheightbound for vertical removal", () => {
    const tight = projectile({
      serialId: "height-tight",
      pos: { x: 0, y: -130 },
      vel: { x: 0, y: -8 },
      heightBound: { low: -132, high: 40 },
    });
    const defaultBound = projectile({ serialId: "height-default", pos: { x: 0, y: -130 }, vel: { x: 0, y: -8 } });

    const remaining = advanceRuntimeProjectiles([tight, defaultBound], stage);

    expect(remaining.map((entry) => entry.serialId)).toEqual(["height-default"]);
    expect(tight).toMatchObject({ removalReason: "bounds" });
    expect(defaultBound.removalReason).toBeUndefined();
    expect(runtimeProjectilesToSnapshots([tight], 1000)[0]).toMatchObject({
      effect: {
        heightBound: { low: -132, high: 40 },
        removalReason: "bounds",
      },
    });
  });

  it("blocks further contact after projhits are exhausted even when projremove keeps the actor alive", () => {
    const shot = projectile({ hitsRemaining: 1, removeOnHit: false });

    expect(canRuntimeProjectileContact(shot)).toBe(true);

    recordRuntimeProjectileContact(shot, "hit");

    expect(shot).toMatchObject({ hitsRemaining: 0, hasHit: true, missTimeRemaining: 0, removeOnHit: false });
    expect(hasRuntimeProjectileContact(shot, "contact", 77)).toBe(true);
    expect(hasRuntimeProjectileContact(shot, "hit", 77)).toBe(true);
    expect(hasRuntimeProjectileContact(shot, "guard", 77)).toBe(false);
    expect(runtimeProjectileContactTime(shot, "hit", 77)).toBe(0);
    expect(canRuntimeProjectileContact(shot)).toBe(false);
    expect(advanceRuntimeProjectiles([shot], stage)).toHaveLength(1);
    expect(runtimeProjectileContactTime(shot, "hit", 77)).toBe(1);
  });

  it("applies bounded projectile velocity multipliers after acceleration", () => {
    const shot = projectile({
      vel: { x: 8, y: -2 },
      accel: { x: 2, y: 1 },
      velMul: { x: 0.5, y: 2 },
    });

    advanceRuntimeProjectiles([shot], stage);

    expect(shot).toMatchObject({
      pos: { x: 8, y: -2 },
      vel: { x: 5, y: -2 },
    });
    expect(runtimeProjectilesToSnapshots([shot], 1000)[0]).toMatchObject({
      effect: {
        accel: { x: 2, y: 1 },
        velMul: { x: 0.5, y: 2 },
      },
    });
  });

  it("modifies matching active projectiles through bounded ModifyProjectile params", () => {
    const matching = projectile({ projectileId: 77, facing: -1, vel: { x: -2, y: 0 }, hitsRemaining: 1 });
    const other = projectile({ serialId: "other", projectileId: 88, vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
    const terminal = projectile({ serialId: "terminal", projectileId: 77, terminalPlayback: { reason: "hit", age: 0, duration: 2 } });

    const changed = modifyRuntimeProjectiles([matching, other, terminal], {
      controller: controller({
        projid: "77",
        velocity: "6,-1",
        accel: "0.5,0.25",
        velmul: "0.5,1",
        projscale: "1.5,0.75",
        projedgebound: "48",
        projstagebound: "32",
        projheightbound: "-96,64",
        projremovetime: "18",
        sprpriority: "8",
        projpriority: "3",
        projhits: "4",
        projmisstime: "5",
        projremove: "0",
      }),
    });

    expect(changed).toBe(1);
    expect(matching).toMatchObject({
      vel: { x: -6, y: -1 },
      accel: { x: -0.5, y: 0.25 },
      velMul: { x: 0.5, y: 1 },
      scale: { x: 1.5, y: 0.75 },
      edgeBound: 48,
      stageBound: 32,
      heightBound: { low: -96, high: 64 },
      removeTime: 18,
      spritePriority: 8,
      priority: 3,
      hitsRemaining: 4,
      missTime: 5,
      removeOnHit: false,
      hasHit: false,
    });
    expect(other).toMatchObject({ vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
    expect(terminal).toMatchObject({ vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
  });

  it("resolves dynamic ModifyProjectile bounds through the bounded runtime resolver", () => {
    const matching = projectile({ projectileId: 77 });
    const resolvedKeys: string[] = [];

    const changed = modifyRuntimeProjectiles([matching], {
      controller: controller({
        projid: "77",
        projedgebound: "var(0)",
        projstagebound: "var(1)",
        projheightbound: "var(2),var(3)",
      }),
      resolveModifyProjectile: {
        resolveNumber: (key) => {
          resolvedKeys.push(key);
          return key === "projedgebound" ? 52 : 36;
        },
        resolvePair: (key) => {
          resolvedKeys.push(key);
          return [-144, 72];
        },
      },
    });

    expect(changed).toBe(1);
    expect(resolvedKeys).toEqual(["projedgebound", "projstagebound", "projheightbound"]);
    expect(matching).toMatchObject({
      edgeBound: 52,
      stageBound: 36,
      heightBound: { low: -144, high: 72 },
    });
  });

  it("plays a bounded terminal animation when hit removal metadata resolves to an AIR action", () => {
    const shot = projectile({
      hitsRemaining: 1,
      removeOnHit: true,
      hitAnimNo: 1400,
      removeAnimNo: 1401,
      terminalActions: { hit: terminalAction },
    });

    recordRuntimeProjectileContact(shot, "hit");

    expect(shot).toMatchObject({
      hasHit: true,
      removalReason: "hit",
      removalAnimNo: 1400,
    });
    expect(describeRuntimeProjectileRemoval(shot)).toBe("hit removal anim 1400");
    expect(shouldKeepRuntimeProjectileAfterRemoval(shot)).toBe(true);
    expect(shot).toMatchObject({
      animNo: 1400,
      frameIndex: 0,
      terminalPlayback: { reason: "hit", duration: 2, age: 0 },
      vel: { x: 0, y: 0 },
    });
    expect(runtimeProjectilesToSnapshots([shot], 1000)[0]).toMatchObject({
      actorKind: "projectile",
      runtime: { animNo: 1400, moveType: "I" },
      clsn1: [],
      clsn2: [],
    });

    expect(advanceRuntimeProjectiles([shot], stage)).toEqual([shot]);
    expect(shot.terminalPlayback?.age).toBe(1);
    expect(advanceRuntimeProjectiles([shot], stage)).toEqual([]);
  });

  it("plays a bounded remove animation when projectile lifetime expires", () => {
    const removeAction = { ...terminalAction, id: 1500 };
    const shot = projectile({
      age: 4,
      removeTime: 5,
      removeAnimNo: 1500,
      terminalActions: { remove: removeAction },
    });

    expect(advanceRuntimeProjectiles([shot], stage)).toEqual([shot]);
    expect(shot).toMatchObject({
      removalReason: "timeout",
      removalAnimNo: 1500,
      animNo: 1500,
      terminalPlayback: { reason: "timeout", duration: 2, age: 0 },
    });

    expect(advanceRuntimeProjectiles([shot], stage)).toEqual([shot]);
    expect(advanceRuntimeProjectiles([shot], stage)).toEqual([]);
  });

  it("projects hitboxes and snapshots without sharing collision arrays", () => {
    const shot = projectile({ frameIndex: 0, facing: -1, pos: { x: 100, y: 20 }, scale: { x: 2, y: 0.5 } });
    const [snapshot] = runtimeProjectilesToSnapshots([shot], 1000);

    expect(getRuntimeProjectileHitboxes(shot)).toEqual([{ x1: 8, y1: -40, x2: 42, y2: -16 }]);
    expect(runtimeProjectileWorldBox(shot, { x1: 8, y1: -40, x2: 42, y2: -16 })).toEqual({
      x1: 58,
      x2: 92,
      y1: -20,
      y2: 4,
    });
    expect(snapshot).toMatchObject({
      id: "p1-projectile-0",
      label: "Projectile 77",
      actorKind: "projectile",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      source: "effect",
      runtime: {
        pos: { x: 100, y: 20 },
        vel: { x: 2, y: 0 },
        facing: -1,
        stateNo: 1000,
        animNo: 1005,
        moveType: "A",
        renderOpacity: 1,
        renderScale: { x: 2, y: 0.5 },
      },
      effect: {
        scale: { x: 2, y: 0.5 },
      },
      clsn1: [{ x1: 8, y1: -40, x2: 42, y2: -16 }],
      clsn2: [{ x1: -8, y1: -44, x2: 44, y2: -12 }],
    });
    expect(snapshot?.clsn1[0]).not.toBe(action.frames[0]?.clsn1[0]);
    expect(snapshot?.clsn2[0]).not.toBe(action.frames[0]?.clsn2[0]);
  });

  it("uses the fallback hitbox when the current AIR frame lacks Clsn1", () => {
    const shot = projectile({ frameIndex: 1, hitbox: { x1: 1, y1: 2, x2: 3, y2: 4 } });

    expect(getRuntimeProjectileHitboxes(shot)).toEqual([{ x1: 1, y1: 2, x2: 3, y2: 4 }]);
  });
});

function projectile(overrides: Partial<RuntimeProjectile> = {}): RuntimeProjectile {
  return {
    serialId: "p1-projectile-0",
    projectileId: 77,
    actorKind: "projectile",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action,
    animNo: 1005,
    pos: { x: 0, y: 0 },
    vel: { x: 2, y: 0 },
    accel: { x: 0, y: 0 },
    velMul: { x: 1, y: 1 },
    scale: { x: 1, y: 1 },
    facing: 1,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: 10,
    stageBound: 40,
    priority: 1,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    spritePriority: 4,
    opacity: 1,
    damage: 30,
    kill: true,
    guardKill: true,
    attr: "S,SP",
    targetId: 77,
    hitPause: 6,
    hitStun: 18,
    push: 18,
    guardDamage: 0,
    guardDistance: 0,
    guardFlag: "MA",
    guardPause: 5,
    guardStun: 10,
    guardPush: 10,
    hitbox: { x1: 8, y1: -40, x2: 42, y2: -16 },
    removeOnHit: true,
    hasHit: false,
    ...overrides,
    terminalActions: overrides.terminalActions ?? {},
  };
}

function controller(params: Record<string, string>): MugenStateController {
  return {
    stateId: 1000,
    type: "Projectile",
    params,
    triggers: [],
    line: 1,
    rawHeader: "[State 1000, Projectile]",
  };
}
