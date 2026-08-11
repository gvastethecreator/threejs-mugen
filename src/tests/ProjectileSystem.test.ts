import { describe, expect, it } from "vitest";
import type { ModifyProjectileControllerOp, ProjectileControllerOp } from "../mugen/compiler/ControllerOps";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import {
  advanceRuntimeProjectiles,
  beginRuntimeProjectileHitPause,
  canRuntimeProjectileContact,
  createRuntimeProjectile,
  getRuntimeProjectileHitboxes,
  hasRuntimeProjectileContact,
  modifyRuntimeProjectiles,
  recordRuntimeProjectileContact,
  runtimeProjectileContactTime,
  runtimeProjectileClsnOverlap,
  runtimeProjectileVar,
  runtimeProjectileWorldBox,
  runtimeProjectileCombatDepth,
  runtimeProjectileAffectTeamAllows,
  runtimeProjectilesToSnapshots,
  describeRuntimeProjectileRemoval,
  shouldKeepRuntimeProjectileAfterRemoval,
  startRuntimeProjectileTerminalPlayback,
  type RuntimeProjectile,
} from "../mugen/runtime/ProjectileSystem";
import type { RuntimeClsnOverlapActor } from "../mugen/runtime/RuntimeFrameSystem";
import { hitAttributeMatches, isRuntimeGuarding } from "../mugen/runtime/CombatResolver";

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

const replacementAction: MugenAnimationAction = {
  id: 1010,
  loopStart: 0,
  rawLines: ["[Begin Action 1010]"],
  frames: [
    {
      spriteGroup: 1010,
      spriteIndex: 0,
      offsetX: 3,
      offsetY: -2,
      duration: 5,
      clsn1: [{ x1: 12, y1: -36, x2: 48, y2: -10 }],
      clsn2: [],
      raw: "1010,0,3,-2,5",
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
        nochainid: "40,41,42,43,44,45,46,47,48,49",
        numhits: "3",
        velocity: "5,-1",
        remvelocity: "-3,2,0.5",
        accel: "0.5,0.25",
        velmul: "0.5,1.5,2",
        projscale: "1.5,0.75",
        projangle: "33.5",
        projxangle: "-22.5",
        projyangle: "17.25",
        projxshear: "0.375",
        projshadow: "32,64,96",
        projreflection: "2",
        projprojection: "perspective",
        projfocallength: "320",
        projwindow: "-48,-24,64,32",
        ownpal: "1",
        remappal: "2,3",
        projclsnscale: "1.25,0.5",
        projclsnangle: "30",
        facing: "-1",
        projhitanim: "1200",
        projremanim: "1201",
        projcancelanim: "1202",
        projedgebound: "48",
        projstagebound: "32",
        projdepthbound: "12",
        projheightbound: "-96,64",
        affectteam: "B",
        teamside: "2",
        projremovetime: "9999",
        projpriority: "12",
        priority: "6, Dodge",
        p1sprpriority: "5",
        p2sprpriority: "-4",
        projhits: "3",
        projmisstime: "4",
        projlayerno: "9",
        projsprpriority: "25",
        trans: "add",
        damage: "40",
        dizzypoints: "27",
        guardpoints: "19",
        redlife: "23,9",
        givepower: "5,23",
        score: "6.5,2.25",
        unhittabletime: "5,11",
        p2facing: "-1",
        mindist: "20",
        maxdist: "72,18,9",
        // The same pair also proves the first givepower value is retained.
        "air.juggle": "3.5",
        guardflag: "MA",
        "guard.pausetime": "3,3",
        "guard.hittime": "8",
        "airguard.ctrltime": "12",
        "guard.velocity": "-4,-1,1.5",
        "airguard.velocity": "-8,-2,2.5",
        "ground.cornerpush.veloff": "3",
        "air.cornerpush.veloff": "4",
        "down.cornerpush.veloff": "5",
        "guard.cornerpush.veloff": "6",
        "airguard.cornerpush.veloff": "7",
        attr: '"S,SP"',
        hitflag: "H,L,A,F,+",
        pausetime: "9",
        "ground.hittime": "21",
        "air.hittime": "17",
        "down.hittime": "19",
        "ground.velocity": "-7,-3,0.75",
        "air.velocity": "-6,-8,1.25",
        "down.velocity": "-2,0,1.5",
        "down.bounce": "0",
        forcenofall: "1",
        forcestand: "1",
        forcecrouch: "0",
        xaccel: "-.11",
        yaccel: ".33",
        zaccel: ".19",
        "envshake.time": "20",
        "envshake.freq": "90.5",
        "envshake.ampl": "-6",
        "envshake.phase": "30.25",
        "envshake.mul": "1.5",
        "envshake.dir": "75",
        fall: "1",
        "air.fall": "1",
        "fall.yvelocity": "-6",
        "fall.zvelocity": "2.5",
        "fall.envshake.mul": "0.75",
        "fall.envshake.dir": "67.5",
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
      remVelocity: { x: -3, y: 2, z: 0.5 },
      accel: { x: -0.5, y: 0.25 },
      velMul: { x: 0.5, y: 1.5, z: 2 },
      scale: { x: 1.5, y: 0.75 },
      angle: 33.5,
      xAngle: -22.5,
      yAngle: 17.25,
      xShear: 0.375,
      shadow: [32, 64, 96],
      reflection: 2,
      projection: "perspective",
      focalLength: 320,
      window: [-48, -24, 64, 32],
      ownPalette: true,
      drawPalette: [2, 3],
      paletteRemap: { source: [1, 1], dest: [2, 3] },
      clsnScale: { x: 1.25, y: 0.5 },
      clsnAngle: 30,
      facing: -1,
      dizzyPoints: 27,
      guardPoints: 19,
      redLife: 23,
      guardRedLife: 9,
      guardPower: 23,
      hitPower: 5,
      score: 6.5,
      guardScore: 2.25,
      unhittableTime: [5, 11],
      p2Facing: -1,
      minDistance: [20],
      maxDistance: [72, 18, 9],
      hitAnimNo: 1200,
      removeAnimNo: 1201,
      cancelAnimNo: 1202,
      removeTime: 1200,
      edgeBound: 48,
      stageBound: 32,
      depthBound: 12,
      heightBound: { low: -96, high: 64 },
      hitPriority: 6,
      hitPriorityType: "dodge",
      p1SpritePriority: 5,
      p2SpritePriority: -4,
      priority: 10,
      hitsRemaining: 3,
      missTime: 4,
      missTimeRemaining: 0,
      layerNo: 1,
      spritePriority: 10,
      opacity: 0.78,
      damage: 60,
      airJuggle: 3,
      attr: "S,SP",
      hitFlag: "H,L,A,F,+",
      targetId: 78,
      chainId: 43,
      noChainIds: [40, 41, 42, 43, 44, 45, 46, 47],
      hitDefHitCount: 3,
      affectTeam: 0,
      teamSide: 2,
      hitPause: 9,
      hitStun: 21,
      airHitTime: 17,
      downHitTime: 19,
      downVelocityX: -2,
      downVelocityY: 0,
      downVelocityZ: 1.5,
      downBounce: false,
      forceNoFall: true,
      forceStand: true,
      forceCrouch: false,
      fall: { enabled: true, airFall: true, yVelocity: -6, zVelocity: 2.5, envShakeMultiplier: 0.75, envShakeDirection: 67.5 },
      push: 7,
      hitVelocityY: -3,
      hitVelocityZ: 0.75,
      airVelocityZ: 1.25,
      hitXAccel: -0.11,
      hitYAccel: 0.33,
      hitZAccel: 0.19,
      envShake: { time: 20, freq: 90.5, ampl: -6, phase: 30.25, mul: 1.5, dir: 75 },
      guardDamage: 0,
      guardFlag: "MA",
      guardPause: 3,
      guardStun: 8,
      airGuardControlTime: 12,
      guardPush: 4,
      guardVelocityY: -1,
      guardVelocityZ: 1.5,
      airGuardPush: 8,
      airGuardVelocityY: -2,
      airGuardVelocityZ: 2.5,
      cornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      removeOnHit: false,
      hasHit: false,
    });
    expect(runtimeProjectilesToSnapshots([projectile], 1000)[0]?.effect).toMatchObject({
      affectTeam: 0,
      teamSide: 2,
      hitFlag: "H,L,A,F,+",
      velMul: { x: 0.5, y: 1.5, z: 2 },
      shadow: [32, 64, 96],
      reflection: 2,
      projection: "perspective",
      focalLength: 320,
      window: [-48, -24, 64, 32],
      ownPalette: true,
      drawPalette: [2, 3],
      paletteRemap: { source: [1, 1], dest: [2, 3] },
    });
    expect(runtimeProjectilesToSnapshots([projectile], 1000)[0]?.runtime.paletteRemap).toEqual({
      source: [1, 1],
      dest: [2, 3],
    });
  });

  it("stores explicit Projectile getpower and derives a missing guard reward from hit power", () => {
    const spawn = (serialId: string, getPower?: string) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", ...(getPower === undefined ? {} : { getpower: getPower }) }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(spawn("p1-projectile-getpower-pair", "31,9")).toMatchObject({
      attackerHitPower: 31,
      attackerGuardPower: 9,
    });
    expect(spawn("p1-projectile-getpower-single", "-31")).toMatchObject({
      attackerHitPower: -31,
      attackerGuardPower: -15,
    });
    const omitted = spawn("p1-projectile-getpower-omitted");
    expect(omitted).toMatchObject({ attackerHitPower: 21, attackerGuardPower: 10 });

    const hyper = createRuntimeProjectile({
      serialId: "p1-projectile-getpower-hyper-default",
      controller: controller({ projanim: "1005", attr: "S,HP", damage: "41" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      damageScale: 2,
      constants: { "super.attack.lifetopowermul": 0.25 },
    });
    expect(hyper).toMatchObject({ damage: 82, attackerHitPower: 10, attackerGuardPower: 5 });
  });

  it("uses component-wise caller resolution for dynamic Projectile getpower", () => {
    const operation: ProjectileControllerOp = {
      kind: "projectile",
      velocity: [0, 0],
      removeTime: 60,
      spritePriority: 1,
      priority: 1,
      hitCount: 1,
      missTime: 0,
      damage: 20,
      hitPause: 0,
      hitStun: 10,
      removeOnHit: true,
      getPower: ["var(0) * 3", "var(1) + 2"],
    };
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-getpower-dynamic",
      controller: controller({ projanim: "1005", getpower: "var(0) * 3,var(1) + 2" }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveProjectileGetPower: () => ({ hit: 21.9, guard: 6.8 }),
    });

    expect(projectile).toMatchObject({ attackerHitPower: 21, attackerGuardPower: 6 });

    const unresolvedGuard = createRuntimeProjectile({
      serialId: "p1-projectile-getpower-partial",
      controller: controller({ projanim: "1005", getpower: "var(0),var(1)" }),
      operation: { ...operation, getPower: ["var(0)", "var(1)"] },
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveProjectileGetPower: () => ({ hit: 21.9 }),
    });
    expect(unresolvedGuard.attackerHitPower).toBe(21);
    expect(unresolvedGuard.attackerGuardPower).toBe(10);

    const singleDynamic = createRuntimeProjectile({
      serialId: "p1-projectile-getpower-single-dynamic",
      controller: controller({ projanim: "1005", getpower: "var(0)" }),
      operation: { ...operation, getPower: ["var(0)"] },
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveProjectileGetPower: () => ({ hit: 21.9 }),
    });
    expect(singleDynamic).toMatchObject({ attackerHitPower: 21, attackerGuardPower: 10 });
  });

  it("carries fresh Projectile keepstate from static and caller-resolved values", () => {
    const base = {
      serialId: "p1-projectile-keepstate",
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1 as const,
    };

    expect(createRuntimeProjectile({
      ...base,
      controller: controller({ projanim: "1005", keepstate: "1" }),
    })).toMatchObject({ keepState: true });
    expect(createRuntimeProjectile({
      ...base,
      serialId: "p1-projectile-keepstate-false",
      controller: controller({ projanim: "1005", keepstate: "0" }),
    })).toMatchObject({ keepState: false });

    const dynamic = createRuntimeProjectile({
      ...base,
      serialId: "p1-projectile-keepstate-dynamic",
      controller: controller({ projanim: "1005", keepstate: "var(0)" }),
      operation: {
        kind: "projectile",
        velocity: [0, 0],
        removeTime: 60,
        spritePriority: 1,
        priority: 1,
        hitCount: 1,
        missTime: 0,
        damage: 20,
        hitPause: 0,
        hitStun: 10,
        removeOnHit: true,
        keepStateExpression: "var(0)",
      },
      resolveKeepState: () => 1,
    });
    expect(dynamic.keepState).toBe(true);

    const unresolved = createRuntimeProjectile({
      ...base,
      serialId: "p1-projectile-keepstate-unresolved",
      controller: controller({ projanim: "1005", keepstate: "var(0)" }),
      operation: {
        kind: "projectile",
        velocity: [0, 0],
        removeTime: 60,
        spritePriority: 1,
        priority: 1,
        hitCount: 1,
        missTime: 0,
        damage: 20,
        hitPause: 0,
        hitStun: 10,
        removeOnHit: true,
        keepStateExpression: "var(0)",
      },
    });
    expect(unresolved.keepState).toBeUndefined();
  });

  it("resolves fresh Projectile p2facing once in the caller context", () => {
    const operation = compileControllerIr(controller({ p2facing: "var(0)" })).operation as ProjectileControllerOp;
    const base = {
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1 as const,
      operation,
    };

    const dynamic = createRuntimeProjectile({
      ...base,
      serialId: "p1-projectile-p2facing-dynamic",
      controller: controller({ projanim: "1005", p2facing: "var(0)" }),
      resolveP2Facing: () => -1.8,
    });
    const unresolved = createRuntimeProjectile({
      ...base,
      serialId: "p1-projectile-p2facing-unresolved",
      controller: controller({ projanim: "1005", p2facing: "var(0)" }),
      resolveP2Facing: () => undefined,
    });
    const unresolvedRedirect = createRuntimeProjectile({
      ...base,
      serialId: "p1-projectile-p2facing-unresolved-redirect",
      controller: controller({ projanim: "1005", p2facing: "Parent,var(0)" }),
    });

    expect(dynamic.p2Facing).toBe(-1);
    expect(unresolved.p2Facing).toBeUndefined();
    expect(unresolvedRedirect.p2Facing).toBeUndefined();
  });

  it("resolves typed ModifyProjectile p2facing once in the caller context", () => {
    const controllerValue = controller({ id: "77", p2facing: "var(0)" }, "ModifyProjectile");
    const operation = compileControllerIr(controllerValue).operation as ModifyProjectileControllerOp;
    const matching = projectile({ p2Facing: 1, projectileId: 77 });
    const changed = modifyRuntimeProjectiles([matching], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: {
        resolveNumber: (key) => key === "p2facing" ? -2.9 : undefined,
      },
    });
    const unresolved = projectile({ p2Facing: 1, projectileId: 77 });
    const unchanged = modifyRuntimeProjectiles([unresolved], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: { resolveNumber: () => undefined },
    });

    expect(operation).toMatchObject({ kind: "modifyprojectile", p2FacingExpression: "var(0)" });
    expect(changed).toBe(1);
    expect(matching.p2Facing).toBe(-2);
    expect(unchanged).toBe(1);
    expect(unresolved.p2Facing).toBe(1);
  });

  it("uses component-wise caller resolution for fresh dynamic Projectile damage", () => {
    const baseOperation: ProjectileControllerOp = {
      kind: "projectile",
      velocity: [0, 0],
      removeTime: 60,
      spritePriority: 1,
      priority: 1,
      hitCount: 1,
      missTime: 0,
      damage: 30,
      hitPause: 0,
      hitStun: 10,
      removeOnHit: true,
      damageExpressions: ["var(0) * 2", "var(1) + 1"],
    };
    const create = (
      serialId: string,
      damageExpressions: ProjectileControllerOp["damageExpressions"],
      resolved: { hit?: number; guard?: number } | undefined,
    ) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", damage: damageExpressions?.join(",") ?? "" }),
      operation: { ...baseOperation, damageExpressions },
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveProjectileDamage: resolved === undefined ? undefined : () => resolved,
    });

    expect(create("p1-projectile-damage-dynamic-pair", ["var(0) * 2", "var(1) + 1"], {
      hit: 41.9,
      guard: 7.8,
    })).toMatchObject({ damage: 41, guardDamage: 7 });
    expect(create("p1-projectile-damage-dynamic-single", ["var(0) * 2"], { hit: 19.9 }))
      .toMatchObject({ damage: 19, guardDamage: 0 });
    expect(create("p1-projectile-damage-dynamic-unresolved", ["var(0)"], undefined))
      .toMatchObject({ damage: 0, guardDamage: 0 });
  });

  it("derives fresh Projectile givepower from authored pre-scale damage", () => {
    const spawn = (
      serialId: string,
      params: Record<string, string>,
      constants?: Record<string, number>,
      damageScale?: number,
    ) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", ...params }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      constants,
      damageScale,
    });

    expect(spawn(
      "p1-projectile-givepower-default",
      { attr: "S,NA", damage: "10" },
      { "default.gethit.lifetopowermul": 0.8 },
    )).toMatchObject({ hitPower: 8, guardPower: 4 });
    expect(spawn(
      "p1-projectile-givepower-single",
      { attr: "S,NA", damage: "10", givepower: "9" },
    )).toMatchObject({ hitPower: 9, guardPower: 4 });
    expect(spawn(
      "p1-projectile-givepower-hyper",
      { attr: "S,HT", damage: "10" },
      { "super.gethit.lifetopowermul": 0.25 },
      2,
    )).toMatchObject({ damage: 20, hitPower: 2, guardPower: 1 });
  });

  it("applies configured fresh Projectile power defaults unless explicit values are authored", () => {
    const constants = {
      "default.attack.lifetopowermul": 0.25,
      "default.gethit.lifetopowermul": 0.4,
    };
    const spawn = (serialId: string, params: Record<string, string>) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", attr: "S,NA", damage: "40", ...params }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      constants,
    });

    expect(spawn("p1-projectile-power-config-defaults", {})).toMatchObject({
      attackerHitPower: 10,
      attackerGuardPower: 5,
      hitPower: 16,
      guardPower: 8,
    });
    expect(spawn("p1-projectile-power-explicit", {
      getpower: "13,7",
      givepower: "19,11",
    })).toMatchObject({
      attackerHitPower: 13,
      attackerGuardPower: 7,
      hitPower: 19,
      guardPower: 11,
    });
  });

  it("resolves fresh dynamic Projectile givepower in the caller context", () => {
    const baseOperation: ProjectileControllerOp = {
      kind: "projectile",
      velocity: [0, 0],
      removeTime: 60,
      spritePriority: 1,
      priority: 1,
      hitCount: 1,
      missTime: 0,
      damage: 20,
      hitPause: 0,
      hitStun: 10,
      removeOnHit: true,
      givePower: ["var(0) * 3", "var(1) + 2"],
    };
    const spawn = (
      serialId: string,
      givePower: ProjectileControllerOp["givePower"],
      resolved: { hit?: number; guard?: number },
    ) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", givepower: givePower?.join(",") ?? "" }),
      operation: { ...baseOperation, givePower },
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveProjectileGivePower: () => resolved,
    });

    expect(spawn(
      "p1-projectile-givepower-dynamic-pair",
      ["var(0) * 3", "var(1) + 2"],
      { hit: 21.9, guard: 6.8 },
    )).toMatchObject({ hitPower: 21, guardPower: 6 });
    expect(spawn(
      "p1-projectile-givepower-dynamic-single",
      ["var(0) * 3"],
      { hit: 21.9 },
    )).toMatchObject({ hitPower: 21, guardPower: 10 });
  });

  it("uses the Ikemen zero guard component for one-value ModifyProjectile givepower", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-modify-givepower-single",
      controller: controller({ projanim: "1005", projid: "77", givepower: "9,8" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(modifyRuntimeProjectiles([projectile], {
      controller: controller({ id: "77", givepower: "11" }, "ModifyProjectile"),
    })).toBe(1);
    expect(projectile).toMatchObject({ hitPower: 11, guardPower: 0 });

    expect(modifyRuntimeProjectiles([projectile], {
      controller: controller({ id: "77", givepower: "var(0)" }, "ModifyProjectile"),
      resolveModifyProjectile: {
        resolvePair: (key) => key === "givepower" ? [13, 0] : undefined,
      },
    })).toBe(1);
    expect(projectile).toMatchObject({ hitPower: 13, guardPower: 0 });
  });

  it("retains static Projectile unhittabletime for root and Helper identities", () => {
    const spawn = (serialId: string, ownerId: string, rootId?: string, parentId?: string) =>
      createRuntimeProjectile({
        serialId,
        controller: controller({ projanim: "1005", unhittabletime: "4,9" }),
        ownerId,
        ...(rootId === undefined ? {} : { rootId }),
        ...(parentId === undefined ? {} : { parentId }),
        spriteOwnerId: ownerId,
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
      });

    const root = spawn("p1-projectile-0", "p1");
    const helper = spawn("p1-helper-projectile-0", "p1-helper-0", "p1", "p1-helper-0");

    expect(root).toMatchObject({ ownerId: "p1", rootId: "p1", parentId: "p1", unhittableTime: [4, 9] });
    expect(helper).toMatchObject({
      ownerId: "p1-helper-0",
      rootId: "p1",
      parentId: "p1-helper-0",
      unhittableTime: [4, 9],
    });
  });

  it("normalizes resolved dynamic Projectile unhittabletime and fails closed without a runtime value", () => {
    const spawn = (serialId: string, resolveUnhittableTime?: () => [number]) =>
      createRuntimeProjectile({
        serialId,
        controller: controller({ projanim: "1005", unhittabletime: "var(0)" }),
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
        ...(resolveUnhittableTime === undefined ? {} : { resolveUnhittableTime }),
      });

    expect(spawn("p1-projectile-resolved", () => [7])).toMatchObject({ unhittableTime: [7, -1] });
    expect(spawn("p1-projectile-unresolved")).not.toHaveProperty("unhittableTime");
  });

  it("resolves Projectile grounded friction at spawn and fails closed for unresolved expressions", () => {
    const spawn = (
      serialId: string,
      params: Record<string, string>,
      resolveGroundFriction?: () => { stand?: number; crouch?: number },
    ) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", ...params }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      ...(resolveGroundFriction === undefined ? {} : { resolveGroundFriction }),
    });

    expect(spawn("p1-projectile-static-friction", {
      "stand.friction": "0.6",
      "crouch.friction": "0.4",
    })).toMatchObject({ standFriction: 0.6, crouchFriction: 0.4 });
    expect(spawn("p1-projectile-dynamic-friction", {
      "stand.friction": "var(0)",
      "crouch.friction": "fvar(0)",
    }, () => ({ stand: 0.55, crouch: 0.35 }))).toMatchObject({ standFriction: 0.55, crouchFriction: 0.35 });
    expect(spawn("p1-projectile-unresolved-friction", {
      "stand.friction": "var(0)",
      "crouch.friction": "fvar(0)",
    })).not.toMatchObject({ standFriction: expect.any(Number), crouchFriction: expect.any(Number) });
  });

  it("resolves Projectile hit and guard spark scales with independent component defaults", () => {
    const spawn = (
      serialId: string,
      params: Record<string, string>,
      resolveSparkScale?: () => { hit?: [number?, number?]; guard?: [number?, number?] },
    ) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", ...params }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      ...(resolveSparkScale === undefined ? {} : { resolveSparkScale }),
    });

    expect(spawn("p1-projectile-static-spark-scale", {
      sparkscale: "2",
      "guard.sparkscale": "0,-1",
    })).toMatchObject({ hitSparkScale: [2, 1], guardSparkScale: [0, -1] });
    expect(spawn("p1-projectile-dynamic-spark-scale", {
      sparkscale: "var(0)",
      "guard.sparkscale": "fvar(0),var(1)",
    }, () => ({ hit: [1.5], guard: [-0.5, 0.75] }))).toMatchObject({
      hitSparkScale: [1.5, 1],
      guardSparkScale: [-0.5, 0.75],
    });
    expect(spawn("p1-projectile-partial-spark-scale", {
      sparkscale: "var(0),fvar(0)",
      "guard.sparkscale": "var(1),fvar(1)",
    }, () => ({ hit: [1.5, undefined], guard: [undefined, -0.5] }))).toMatchObject({
      hitSparkScale: [1.5, 1],
      guardSparkScale: [1, -0.5],
    });
    expect(spawn("p1-projectile-unresolved-spark-scale", {
      sparkscale: "var(0)",
      "guard.sparkscale": "fvar(0)",
    })).toMatchObject({ hitSparkScale: [1, 1], guardSparkScale: [1, 1] });
  });

  it("stores static and caller-resolved Projectile contact PalFX", () => {
    const spawn = (
      serialId: string,
      params: Record<string, string>,
      resolvePaletteFx?: Parameters<typeof createRuntimeProjectile>[0]["resolvePaletteFx"],
    ) => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", ...params }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolvePaletteFx,
    });

    expect(spawn("p1-projectile-static-palfx", {
      "palfx.time": "9",
      "palfx.add": "12,-6,3",
      "palfx.mul": "200,220,240",
      "palfx.color": "192",
      "palfx.invertall": "1",
    }).paletteFx).toEqual({
      time: 9,
      add: [12, -6, 3],
      mul: [200, 220, 240],
      color: 192,
      invert: true,
    });

    expect(spawn("p1-projectile-dynamic-palfx", {
      "palfx.time": "var(0)",
      "palfx.add": "var(1),var(2),var(3)",
      "palfx.mul": "var(4),var(5),var(6)",
    }, {
      resolveNumber: (key) => key === "time" ? 7 : undefined,
      resolveTriplet: (key) => key === "add" ? [1, 2, 3] : [210, 211, 212],
    }).paletteFx).toEqual({
      time: 7,
      add: [1, 2, 3],
      mul: [210, 211, 212],
      color: 256,
      invert: false,
    });
  });

  it("reads bounded numeric ProjVar fields with caller localcoord conversion", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller({
        projid: "77",
        projanim: "1005",
        projhitanim: "1300",
        projremanim: "1301",
        projcancelanim: "1302",
        velocity: "8,-4,2",
        remvelocity: "-6,3,1",
        accel: "2,4,6",
        velmul: "0.5,1.5,2",
        projscale: "1.25,0.75",
        projangle: "24",
        projxangle: "-18",
        projyangle: "12.5",
        projxshear: "-0.25",
        projshadow: "16,32,48",
        projheightbound: "-120,80",
        projedgebound: "60",
        projstagebound: "50",
        projremovetime: "20",
        projpriority: "3",
        projlayerno: "-4",
        projsprpriority: "6",
        projhits: "3",
        projmisstime: "4",
        projremove: "0",
        teamside: "2",
        ownpal: "1",
        remappal: "4,6",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 32, y: -12, z: 8 },
      fallbackFacing: 1,
      localCoord: [640, 480],
    });
    projectile.frameIndex = 2;
    projectile.age = 5;
    projectile.hitsRemaining = 2;
    projectile.missTimeRemaining = 3;
    projectile.pauseMoveTime = 5;
    projectile.superMoveTime = 7;

    const read = (parameter: string) => runtimeProjectileVar(projectile, parameter, [320, 240]);
    expect([
      read("ProjID"), read("Anim"), read("AnimElem"), read("Facing"),
      read("ProjHits"), read("ProjHitsMax"), read("ProjMissTime"), read("Time"),
      read("ProjRemove"), read("ProjRemoveTime"), read("ProjPriority"), read("ProjSprPriority"), read("ProjLayerNo"), read("ProjAngle"),
      read("Angle X"), read("Angle Y"),
      read("XShear"),
      read("Shadow R"), read("Shadow G"), read("Shadow B"),
      read("ProjHitAnim"), read("ProjRemAnim"), read("ProjCancelAnim"), read("TeamSide"),
      read("PauseMoveTime"), read("SuperMoveTime"),
    ]).toEqual([77, 1005, 3, 1, 2, 3, 3, 5, 0, 15, 3, 6, -1, 24, -18, 12.5, -0.25, 16, 32, 48, 1300, 1301, 1302, 2, 5, 7]);
    expect([
      read("Pos X"), read("Pos Y"), read("Pos Z"),
      read("Vel X"), read("Vel Y"), read("Vel Z"),
      read("Accel X"), read("Accel Y"), read("Accel Z"),
      read("RemVelocity X"), read("RemVelocity Y"), read("RemVelocity Z"),
      read("LowBound"), read("HighBound"), read("ProjEdgeBound"), read("ProjStageBound"),
    ]).toEqual([16, -6, 4, 4, -2, 1, 1, 2, 3, -3, 1.5, 0.5, -60, 40, 30, 25]);
    expect([read("Scale X"), read("Scale Y"), read("VelMul X"), read("VelMul Y"), read("VelMul Z")]).toEqual([1.25, 0.75, 0.5, 1.5, 2]);
    expect([read("DrawPal.Group"), read("DrawPal.Index")]).toEqual([4, 6]);
  });

  it("defaults missing Projectile id to target id 0", () => {
    const projectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller({
        projanim: "1005",
        velmul: "2",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      ownerLayerNo: -8,
    });

    expect(projectile.projectileId).toBe(0);
    expect(projectile.targetId).toBe(0);
    expect(projectile.layerNo).toBe(-1);
    expect(projectile.velMul).toEqual({ x: 2, y: 1, z: 1 });
    expect(projectile).toMatchObject({
      angle: 0,
      xAngle: 0,
      yAngle: 0,
      xShear: 0,
      shadow: [0, 0, 0],
      reflection: -1,
      projection: "orthographic",
      focalLength: 0,
      window: [0, 0, 0, 0],
      ownPalette: false,
      drawPalette: [0, 0],
    });
    expect(runtimeProjectileVar(projectile, "DrawPal.Group")).toBe(0);
    expect(runtimeProjectileVar(projectile, "DrawPal.Index")).toBe(0);
  });

  it("ignores spawn remappal when ownpal is disabled", () => {
    const projectile = createRuntimeProjectile({
      serialId: "shared-palette-projectile",
      controller: controller({ projanim: "1005", ownpal: "0", remappal: "7,9" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(projectile).toMatchObject({ ownPalette: false, drawPalette: [0, 0] });
    expect(projectile).not.toHaveProperty("paletteRemap");
    expect(runtimeProjectilesToSnapshots([projectile], 1000)[0]?.effect).not.toHaveProperty("paletteRemap");
  });

  it("applies an imported default only when Projectile HitFlag is omitted", () => {
    const create = (params: Record<string, string>) =>
      createRuntimeProjectile({
        serialId: "hitflag-projectile",
        controller: controller(params),
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
        defaultHitFlag: "MAF",
      });

    expect(create({ projanim: "1005" }).hitFlag).toBe("MAF");
    expect(create({ projanim: "1005", hitflag: "H" }).hitFlag).toBe("H");
    expect(create({ projanim: "1005", hitflag: "var(0)" }).hitFlag).toBeUndefined();
  });

  it("carries projectile Z position, velocity, localcoord, and attack depth", () => {
    const projectile = createRuntimeProjectile({
      serialId: "depth-projectile",
      controller: controller({
        projanim: "1005",
        velocity: "2,-1,0.5",
        accel: "0,0,0.25",
        velmul: "1,1,2",
        "attack.depth": "7,9",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0, z: 10 },
      fallbackFacing: 1,
      localCoord: [640, 480],
    });

    expect(projectile).toMatchObject({
      pos: { x: 0, y: 0, z: 10 },
      vel: { x: 2, y: -1, z: 0.5 },
      accel: { x: 0, y: 0, z: 0.25 },
      velMul: { x: 1, y: 1, z: 2 },
      attackDepth: [7, 9],
      localCoord: [640, 480],
    });
    expect(runtimeProjectileCombatDepth(projectile)).toEqual({
      position: 10,
      velocity: 0.5,
      size: [3, 3],
      attack: [7, 9],
    });

    advanceRuntimeProjectiles([projectile], stage);

    expect(projectile.pos.z).toBe(10.5);
    expect(projectile.vel.z).toBe(1.5);
    expect(runtimeProjectilesToSnapshots([projectile], 1000)[0]?.effect).toMatchObject({
      depth: { position: 10.5, velocity: 1.5, attack: [7, 9] },
    });
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
        projlayerno: "-9",
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
      layerNo: -1,
    });
  });

  it("derives missing fresh Projectile airguard.velocity components from air.velocity", () => {
    const create = (serialId: string, airGuardVelocity?: string): RuntimeProjectile => createRuntimeProjectile({
      serialId,
      controller: controller({
        projanim: "1005",
        damage: "24,2",
        guardflag: "A",
        "ground.velocity": "-4",
        "air.velocity": "-6,-10,4",
        ...(airGuardVelocity === undefined ? {} : { "airguard.velocity": airGuardVelocity }),
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    const omitted = create("p1-projectile-air-default");
    const single = create("p1-projectile-air-single", "-5");
    const pair = create("p1-projectile-air-pair", "-9,-4");
    const triple = create("p1-projectile-air-triple", "-12,-6,7");

    expect(omitted).toMatchObject({
      guardDamage: 2,
      guardFlag: "A",
      airGuardPush: 9,
      airGuardVelocityY: -5,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -9, y: -5, z: 6 } },
    });
    expect(single).toMatchObject({
      airGuardPush: 5,
      airGuardVelocityY: -5,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -5, y: -5, z: 6 } },
    });
    expect(pair).toMatchObject({
      airGuardPush: 9,
      airGuardVelocityY: -4,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -9, y: -4, z: 6 } },
    });
    expect(triple).toMatchObject({
      airGuardPush: 12,
      airGuardVelocityY: -6,
      airGuardVelocityZ: 7,
      hitVelocities: { airGuard: { x: -12, y: -6, z: 7 } },
    });
  });

  it("resolves fresh Projectile airguard.velocity expressions in caller context", () => {
    const create = (serialId: string, airGuardVelocity: string, resolved: [number?, number?, number?]): RuntimeProjectile => {
      const compiled = compileControllerIr(controller({
        projanim: "1005",
        "air.velocity": "-6,-8,2",
        "airguard.velocity": airGuardVelocity,
      }));
      const operation = compiled.operation as ProjectileControllerOp;
      return createRuntimeProjectile({
        serialId,
        controller: controller({
          projanim: "1005",
          "air.velocity": "-6,-8,2",
          "airguard.velocity": airGuardVelocity,
        }),
        operation,
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
        resolveAirGuardVelocity: () => resolved,
      });
    };

    const dynamicTriplet = create("p1-projectile-air-dynamic-triplet", "var(0),fvar(1),var(2)", [-5, -4, 6]);
    const dynamicPair = create("p1-projectile-air-dynamic-pair", "var(0),fvar(1)", [-5, -4]);
    const dynamicSingle = create("p1-projectile-air-dynamic-single", "var(0)", [-5]);

    expect(dynamicTriplet).toMatchObject({
      airGuardPush: 5,
      airGuardVelocityY: -4,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -5, y: -4, z: 6 } },
    });
    expect(dynamicPair).toMatchObject({
      airGuardPush: 5,
      airGuardVelocityY: -4,
      airGuardVelocityZ: 3,
      hitVelocities: { airGuard: { x: -5, y: -4, z: 3 } },
    });
    expect(dynamicSingle).toMatchObject({
      airGuardPush: 5,
      airGuardVelocityY: -4,
      airGuardVelocityZ: 3,
      hitVelocities: { airGuard: { x: -5, y: -4, z: 3 } },
    });
  });

  it("resolves fresh Projectile air.velocity expressions in caller context", () => {
    const create = (serialId: string, airVelocity: string, resolved: [number?, number?, number?]): RuntimeProjectile => {
      const compiled = compileControllerIr(controller({
        projanim: "1005",
        "air.velocity": airVelocity,
      }));
      const operation = compiled.operation as ProjectileControllerOp;
      return createRuntimeProjectile({
        serialId,
        controller: controller({ projanim: "1005", "air.velocity": airVelocity }),
        operation,
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
        resolveAirVelocity: () => resolved,
      });
    };

    const dynamicTriplet = create("p1-projectile-air-velocity-dynamic-triplet", "var(0),fvar(1),var(2)", [-5, -4, 6]);
    const dynamicPair = create("p1-projectile-air-velocity-dynamic-pair", "var(0),fvar(1)", [-5, -4]);
    const dynamicSingle = create("p1-projectile-air-velocity-dynamic-single", "var(0)", [-5]);

    expect(dynamicTriplet).toMatchObject({ hitVelocities: { air: { x: -5, y: -4, z: 6 } } });
    expect(dynamicPair).toMatchObject({ hitVelocities: { air: { x: -5, y: -4, z: 0 } } });
    expect(dynamicSingle).toMatchObject({ hitVelocities: { air: { x: -5, y: 0, z: 0 } } });
  });

  it("resolves fresh Projectile projremovetime in the caller context", () => {
    const operation = compileControllerIr(controller({ projremovetime: "var(0) + 3" })).operation as ProjectileControllerOp;
    const create = (serialId: string, resolveRemoveTime?: () => number | undefined): RuntimeProjectile => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", projremovetime: "var(0) + 3" }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveRemoveTime,
    });

    expect(operation.removeTimeExpression).toBe("var(0) + 3");
    expect(create("dynamic", () => 7).removeTime).toBe(7);
    expect(create("unresolved", () => undefined).removeTime).toBe(-1);
  });

  it("resolves fresh Projectile projmisstime in the caller context", () => {
    const operation = compileControllerIr(controller({ projmisstime: "var(0) + 2" })).operation as ProjectileControllerOp;
    const create = (serialId: string, resolveMissTime?: () => number | undefined): RuntimeProjectile => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", projmisstime: "var(0) + 2" }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveMissTime,
    });

    expect(operation.missTimeExpression).toBe("var(0) + 2");
    expect(create("dynamic", () => 7.9).missTime).toBe(7);
    expect(create("negative", () => -4).missTime).toBe(0);
    expect(create("unresolved", () => undefined).missTime).toBe(0);
  });

  it("resolves fresh Projectile projpriority in the caller context", () => {
    const operation = compileControllerIr(controller({ projpriority: "var(0) + 2" })).operation as ProjectileControllerOp;
    const create = (serialId: string, resolvePriority?: () => number | undefined): RuntimeProjectile => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", projpriority: "var(0) + 2" }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolvePriority,
    });

    expect(operation.priorityExpression).toBe("var(0) + 2");
    expect(create("dynamic", () => 7.9).priority).toBe(7);
    expect(create("clamped", () => 99).priority).toBe(10);
    expect(create("negative", () => -4).priority).toBe(0);
    expect(create("unresolved", () => undefined).priority).toBe(1);
  });

  it("resolves fresh Projectile projhits in the caller context", () => {
    const operation = compileControllerIr(controller({ projhits: "var(0) + 1" })).operation as ProjectileControllerOp;
    const create = (serialId: string, resolveHitCount?: () => number | undefined): RuntimeProjectile => createRuntimeProjectile({
      serialId,
      controller: controller({ projanim: "1005", projhits: "var(0) + 1" }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveHitCount,
    });

    expect(operation.hitCountExpression).toBe("var(0) + 1");
    expect(create("dynamic", () => 7.9).hitsRemaining).toBe(7);
    expect(create("dynamic", () => 7.9).hitsMax).toBe(7);
    expect(create("clamped", () => 99).hitsRemaining).toBe(16);
    expect(create("negative", () => -4).hitsRemaining).toBe(1);
    expect(create("unresolved", () => undefined).hitsRemaining).toBe(1);
  });

  it("resolves fresh Projectile down.hittime in the caller context", () => {
    const dynamicOperation = compileControllerIr(controller({ "down.hittime": "var(0) + 3" })).operation as ProjectileControllerOp;
    const dynamic = createRuntimeProjectile({
      serialId: "p1-projectile-down-hittime-dynamic",
      controller: controller({ "down.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveDownHitTime: () => 17.9,
    });
    const unresolved = createRuntimeProjectile({
      serialId: "p1-projectile-down-hittime-unresolved",
      controller: controller({ "down.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveDownHitTime: () => undefined,
    });
    const omitted = createRuntimeProjectile({
      serialId: "p1-projectile-down-hittime-omitted",
      controller: controller({}),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(dynamic.downHitTime).toBe(17);
    expect(unresolved.downHitTime).toBe(20);
    expect(omitted.downHitTime).toBe(20);
  });

  it("resolves fresh Projectile ground.hittime in the caller context", () => {
    const dynamicOperation = compileControllerIr(controller({ "ground.hittime": "var(0) + 3" })).operation as ProjectileControllerOp;
    const dynamic = createRuntimeProjectile({
      serialId: "p1-projectile-ground-hittime-dynamic",
      controller: controller({ "ground.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveGroundHitTime: () => 17.9,
    });
    const unresolved = createRuntimeProjectile({
      serialId: "p1-projectile-ground-hittime-unresolved",
      controller: controller({ "ground.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveGroundHitTime: () => undefined,
    });
    const omitted = createRuntimeProjectile({
      serialId: "p1-projectile-ground-hittime-omitted",
      controller: controller({}),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(dynamic.hitStun).toBe(17);
    expect(dynamic.guardStun).toBe(17);
    expect(unresolved.hitStun).toBe(18);
    expect(omitted.hitStun).toBe(18);
  });

  it("resolves fresh Projectile ground.slidetime in the caller context", () => {
    const dynamicOperation = compileControllerIr(controller({ "ground.slidetime": "var(0) + 3" })).operation as ProjectileControllerOp;
    const dynamic = createRuntimeProjectile({
      serialId: "p1-projectile-ground-slidetime-dynamic",
      controller: controller({ "ground.slidetime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveGroundSlideTime: () => 17.9,
    });
    const unresolved = createRuntimeProjectile({
      serialId: "p1-projectile-ground-slidetime-unresolved",
      controller: controller({ "ground.slidetime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveGroundSlideTime: () => undefined,
    });
    const omitted = createRuntimeProjectile({
      serialId: "p1-projectile-ground-slidetime-omitted",
      controller: controller({}),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(dynamic.groundSlideTime).toBe(17);
    expect(unresolved.groundSlideTime).toBeUndefined();
    expect(omitted.groundSlideTime).toBeUndefined();
  });

  it("resolves fresh Projectile air.hittime in the caller context", () => {
    const dynamicOperation = compileControllerIr(controller({ "air.hittime": "var(0) + 3" })).operation as ProjectileControllerOp;
    const dynamic = createRuntimeProjectile({
      serialId: "p1-projectile-air-hittime-dynamic",
      controller: controller({ "air.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveAirHitTime: () => 17.9,
    });
    const unresolved = createRuntimeProjectile({
      serialId: "p1-projectile-air-hittime-unresolved",
      controller: controller({ "air.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveAirHitTime: () => undefined,
    });
    const omitted = createRuntimeProjectile({
      serialId: "p1-projectile-air-hittime-omitted",
      controller: controller({}),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(dynamic.airHitTime).toBe(17);
    expect(unresolved.airHitTime).toBe(20);
    expect(omitted.airHitTime).toBe(20);
  });

  it("resolves fresh Projectile guard.hittime in the caller context", () => {
    const dynamicOperation = compileControllerIr(controller({ "guard.hittime": "var(0) + 3" })).operation as ProjectileControllerOp;
    const dynamic = createRuntimeProjectile({
      serialId: "p1-projectile-guard-hittime-dynamic",
      controller: controller({ "guard.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveGuardHitTime: () => 17.9,
    });
    const unresolved = createRuntimeProjectile({
      serialId: "p1-projectile-guard-hittime-unresolved",
      controller: controller({ "guard.hittime": "var(0) + 3" }),
      operation: dynamicOperation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolveGuardHitTime: () => undefined,
    });
    const omitted = createRuntimeProjectile({
      serialId: "p1-projectile-guard-hittime-omitted",
      controller: controller({}),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(dynamic.guardStun).toBe(17);
    expect(unresolved.guardStun).toBe(18);
    expect(omitted.guardStun).toBe(18);
  });

  it("resolves fresh Projectile ground.velocity expressions in caller context", () => {
    const create = (serialId: string, groundVelocity: string, resolved: [number?, number?, number?]): RuntimeProjectile => {
      const compiled = compileControllerIr(controller({
        projanim: "1005",
        "ground.velocity": groundVelocity,
      }));
      const operation = compiled.operation as ProjectileControllerOp;
      return createRuntimeProjectile({
        serialId,
        controller: controller({ projanim: "1005", "ground.velocity": groundVelocity }),
        operation,
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
        resolveGroundVelocity: () => resolved,
      });
    };

    const dynamicTriplet = create("p1-projectile-ground-velocity-dynamic-triplet", "var(0),fvar(1),var(2)", [-7.5, -5.25, 2.25]);
    const dynamicPair = create("p1-projectile-ground-velocity-dynamic-pair", "var(0),fvar(1)", [-7.5, -5.25]);
    const dynamicSingle = create("p1-projectile-ground-velocity-dynamic-single", "var(0)", [-7.5]);

    expect(dynamicTriplet).toMatchObject({
      push: 7.5,
      hitVelocityY: -5.25,
      hitVelocityZ: 2.25,
      hitVelocities: { ground: { x: -7.5, y: -5.25, z: 2.25 } },
    });
    expect(dynamicPair).toMatchObject({
      push: 7.5,
      hitVelocityY: -5.25,
      hitVelocityZ: 0,
      hitVelocities: { ground: { x: -7.5, y: -5.25, z: 0 } },
    });
    expect(dynamicSingle).toMatchObject({
      push: 7.5,
      hitVelocityY: 0,
      hitVelocityZ: 0,
      hitVelocities: { ground: { x: -7.5, y: 0, z: 0 } },
    });
  });

  it("resolves fresh Projectile guard.velocity expressions with ground inheritance", () => {
    const create = (serialId: string, guardVelocity: string, resolved: [number?, number?, number?]): RuntimeProjectile => {
      const compiled = compileControllerIr(controller({
        projanim: "1005",
        "ground.velocity": "-6,-8,2",
        "guard.velocity": guardVelocity,
      }));
      const operation = compiled.operation as ProjectileControllerOp;
      return createRuntimeProjectile({
        serialId,
        controller: controller({
          projanim: "1005",
          "ground.velocity": "-6,-8,2",
          "guard.velocity": guardVelocity,
        }),
        operation,
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
        resolveGuardVelocity: () => resolved,
      });
    };

    const dynamicTriplet = create("p1-projectile-guard-velocity-dynamic-triplet", "var(0),fvar(1),var(2)", [-5, -4, 6]);
    const dynamicPair = create("p1-projectile-guard-velocity-dynamic-pair", "var(0),fvar(1)", [-5, -4]);
    const dynamicSingle = create("p1-projectile-guard-velocity-dynamic-single", "var(0)", [-5]);

    expect(dynamicTriplet).toMatchObject({
      guardPush: 5,
      guardVelocityY: -4,
      guardVelocityZ: 6,
      hitVelocities: { guard: { x: -5, y: -4, z: 6 } },
    });
    expect(dynamicPair).toMatchObject({
      guardPush: 5,
      guardVelocityY: -4,
      guardVelocityZ: 2,
      hitVelocities: { guard: { x: -5, y: -4, z: 2 } },
    });
    expect(dynamicSingle).toMatchObject({
      guardPush: 5,
      guardVelocityY: 0,
      guardVelocityZ: 2,
      hitVelocities: { guard: { x: -5, y: 0, z: 2 } },
    });
  });

  it("resolves fresh Projectile down.velocity expressions with air inheritance", () => {
    const create = (serialId: string, downVelocity: string, resolved: [number?, number?, number?]): RuntimeProjectile => {
      const compiled = compileControllerIr(controller({
        projanim: "1005",
        "air.velocity": "-6,-8,2",
        "down.velocity": downVelocity,
      }));
      const operation = compiled.operation as ProjectileControllerOp;
      return createRuntimeProjectile({
        serialId,
        controller: controller({
          projanim: "1005",
          "air.velocity": "-6,-8,2",
          "down.velocity": downVelocity,
        }),
        operation,
        spriteOwnerId: "p1",
        spriteOwnerDefinitionId: "kfm",
        spriteOwnerLabel: "Kung Fu Man",
        action,
        animNo: 1005,
        pos: { x: 0, y: 0 },
        fallbackFacing: 1,
        resolveDownVelocity: () => resolved,
      });
    };

    const dynamicTriplet = create("p1-projectile-down-velocity-dynamic-triplet", "var(0),fvar(1),var(2)", [-3, -5, 7]);
    const dynamicPair = create("p1-projectile-down-velocity-dynamic-pair", "var(0),fvar(1)", [-3, -5]);
    const dynamicSingle = create("p1-projectile-down-velocity-dynamic-single", "var(0)", [-3]);

    expect(dynamicTriplet).toMatchObject({
      downVelocityX: -3,
      downVelocityY: -5,
      downVelocityZ: 7,
      hitVelocities: { down: { x: -3, y: -5, z: 7 } },
    });
    expect(dynamicPair).toMatchObject({
      downVelocityX: -3,
      downVelocityY: -5,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -3, y: -5, z: 2 } },
    });
    expect(dynamicSingle).toMatchObject({
      downVelocityX: -3,
      downVelocityY: -8,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -3, y: -8, z: 2 } },
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
      airGuardControlTime: 17,
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
      airGuardControlTime: 8,
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
      airGuardControlTime: 6,
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
      p1SpritePriority: 3,
      p2SpritePriority: -2,
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
      p1StateNo: 777,
      p2ClsnCheck: "clsn1",
      p2ClsnRequire: "size",
      missOnOverride: true,
      guardDamage: 5,
      guardDistanceBounds: {
        width: [88, 0],
        height: [77, 66],
        depth: [12, 9],
      },
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
        projsprpriority: "-5",
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
      p1SpritePriority: 3,
      p2SpritePriority: -2,
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
      p1StateNo: 777,
      p2ClsnCheck: "clsn1",
      p2ClsnRequire: "size",
      missOnOverride: true,
      guardDamage: 5,
      guardDistanceBounds: {
        width: [88, 0],
        height: [77, 66],
        depth: [12, 9],
      },
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

  it("applies Projectile Pause and SuperPause movement counters", () => {
    const moving = createRuntimeProjectile({
      serialId: "pause-moving",
      controller: controller({ velocity: "2,0", pausemovetime: "2", supermovetime: "1" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    const frozen = projectile({ serialId: "pause-frozen", pauseMoveTime: 0, superMoveTime: -2 });

    expect(moving).toMatchObject({ pauseMoveTime: 3, superMoveTime: 2 });

    advanceRuntimeProjectiles([moving], stage);
    expect(moving).toMatchObject({ pos: { x: 2, y: 0 }, age: 1, pauseMoveTime: 2, superMoveTime: 1 });

    advanceRuntimeProjectiles([moving, frozen], stage, { pauseKind: "Pause" });
    expect(moving).toMatchObject({ pos: { x: 4, y: 0 }, age: 2, pauseMoveTime: 1, superMoveTime: 0 });
    expect(frozen).toMatchObject({ pos: { x: 0, y: 0 }, age: 0, pauseMoveTime: 0, superMoveTime: -2 });

    advanceRuntimeProjectiles([moving, frozen], stage, { pauseKind: "SuperPause" });
    expect(moving).toMatchObject({ pos: { x: 4, y: 0 }, age: 2, pauseMoveTime: 1, superMoveTime: 0 });
    expect(frozen).toMatchObject({ pos: { x: 0, y: 0 }, age: 0 });

    expect(modifyRuntimeProjectiles([moving], {
      controller: controller({ pausemovetime: "-1", supermovetime: "2" }),
    })).toBe(1);
    expect(moving).toMatchObject({ pauseMoveTime: -1, superMoveTime: 3 });

    advanceRuntimeProjectiles([moving], stage, { pauseKind: "Pause" });
    expect(moving).toMatchObject({ pos: { x: 6, y: 0 }, pauseMoveTime: -1, superMoveTime: 2 });
    expect(runtimeProjectilesToSnapshots([moving], 1000)[0]).toMatchObject({
      effect: { pauseMoveTime: -1, superMoveTime: 2 },
    });
  });

  it("keeps Projectile hit pause separate from owner hit pause and global Pause", () => {
    const shot = projectile({
      vel: { x: 2, y: 0 },
      hitPause: 2,
      hitShakeTime: 7,
      guardPause: 3,
      guardShakeTime: 9,
    });

    beginRuntimeProjectileHitPause(shot, "hit");
    expect(shot.hitPauseRemaining).toBe(2);
    advanceRuntimeProjectiles([shot], stage, { pauseKind: "hitpause" });
    expect(shot).toMatchObject({ pos: { x: 0, y: 0 }, age: 0, hitPauseRemaining: 1 });
    advanceRuntimeProjectiles([shot], stage, { pauseKind: "Pause" });
    expect(shot).toMatchObject({ pos: { x: 0, y: 0 }, age: 0, hitPauseRemaining: 1 });
    advanceRuntimeProjectiles([shot], stage, { pauseKind: "hitpause" });
    expect(shot).toMatchObject({ pos: { x: 0, y: 0 }, age: 0, hitPauseRemaining: 0 });
    advanceRuntimeProjectiles([shot], stage, { pauseKind: "hitpause" });
    expect(shot).toMatchObject({ pos: { x: 2, y: 0 }, age: 1, hitPauseRemaining: 0 });
  });

  it("inherits Projectile guard pause pairs from normal pause unless explicitly authored", () => {
    const defaults = createRuntimeProjectile({
      serialId: "pause-pair-defaults",
      controller: controller({}),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    const inherited = createRuntimeProjectile({
      serialId: "pause-pair-inherited",
      controller: controller({ pausetime: "2,7" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    const explicit = createRuntimeProjectile({
      serialId: "pause-pair-explicit",
      controller: controller({ pausetime: "2,7", "guard.pausetime": "3" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(defaults).toMatchObject({ hitPause: 0, hitShakeTime: 0, guardPause: 0, guardShakeTime: 0 });
    expect(inherited).toMatchObject({ hitPause: 2, hitShakeTime: 7, guardPause: 2, guardShakeTime: 7 });
    expect(explicit).toMatchObject({ hitPause: 2, hitShakeTime: 7, guardPause: 3, guardShakeTime: 7 });
  });

  it("resolves fresh Projectile pause pairs from caller callbacks component-wise", () => {
    const dynamic = createRuntimeProjectile({
      serialId: "pause-pair-dynamic",
      controller: controller({ pausetime: "var(0),var(1)", "guard.pausetime": "var(2)" }),
      operation: compileControllerIr(controller({
        pausetime: "var(0),var(1)",
        "guard.pausetime": "var(2)",
      })).operation as ProjectileControllerOp,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      resolvePauseTime: () => [4.9, 7.9],
      resolveGuardPauseTime: () => [3.9, undefined],
    });
    expect(dynamic).toMatchObject({
      hitPause: 4,
      hitShakeTime: 7,
      guardPause: 3,
      guardShakeTime: 7,
    });
  });

  it("creates Projectile guard-distance bounds with official defaults and negative preservation", () => {
    const defaults = createRuntimeProjectile({
      serialId: "guard-distance-defaults",
      controller: controller({}),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    const authored = createRuntimeProjectile({
      serialId: "guard-distance-authored",
      controller: controller({
        "guard.dist": "44,33",
        "guard.dist.width": "-1,24",
        "guard.dist.height": "80",
        "guard.dist.depth": "12,9",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(defaults.guardDistanceBounds).toEqual({
      width: [90, 0],
      height: [1000, 1000],
      depth: [10, 10],
    });
    expect(authored.guardDistanceBounds).toEqual({
      width: [90, 24],
      height: [80, 0],
      depth: [12, 9],
    });
  });

  it("creates Projectile spark refs, angles, and zero-default offsets", () => {
    const shot = createRuntimeProjectile({
      serialId: "spark-payload",
      controller: controller({
        sparkno: "F7001",
        sparkangle: "0.25",
        "guard.sparkno": "S7000",
        "guard.sparkangle": "-0.5",
        sparkxy: "18",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      action,
      animNo: 1005,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(shot).toMatchObject({
      hitSpark: "F7001",
      hitSparkAngle: 0.25,
      guardSpark: "S7000",
      guardSparkAngle: -0.5,
      sparkXy: [18, 0],
    });
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

  it("uses explicit projdepthbound for stage depth removal without adding a default bound", () => {
    const depthStage = {
      bounds: { left: -120, right: 120 },
      depthBounds: { top: -10, bottom: 10 },
      localCoord: { width: 640, height: 480 },
    };
    const touching = projectile({
      serialId: "depth-touching",
      pos: { x: 0, y: 0, z: 7 },
      vel: { x: 0, y: 0, z: 0 },
      localCoord: [320, 240],
      depthBound: 2,
    });
    const outside = projectile({
      serialId: "depth-outside",
      pos: { x: 0, y: 0, z: 8 },
      vel: { x: 0, y: 0, z: 0 },
      localCoord: [320, 240],
      depthBound: 2,
    });
    const unbounded = projectile({
      serialId: "depth-unbounded",
      pos: { x: 0, y: 0, z: 100 },
      vel: { x: 0, y: 0, z: 0 },
      localCoord: [320, 240],
    });

    const remaining = advanceRuntimeProjectiles([touching, outside, unbounded], depthStage);

    expect(remaining.map((entry) => entry.serialId)).toEqual(["depth-touching", "depth-unbounded"]);
    expect(touching.removalReason).toBeUndefined();
    expect(outside).toMatchObject({ depthBound: 2, removalReason: "bounds" });
    expect(unbounded.removalReason).toBeUndefined();
    expect(runtimeProjectilesToSnapshots([outside], 1000)[0]).toMatchObject({
      effect: { depthBound: 2, removalReason: "bounds" },
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
    const matching = projectile({
      projectileId: 77,
      facing: -1,
      vel: { x: -2, y: 0 },
      hitsRemaining: 1,
      shadow: [10, 20, 30],
      p1SpritePriority: 2,
      p2SpritePriority: -1,
    });
    const other = projectile({ serialId: "other", projectileId: 88, vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
    const terminal = projectile({ serialId: "terminal", projectileId: 77, terminalPlayback: { reason: "hit", age: 0, duration: 2 } });
    const removed = projectile({ serialId: "removed", projectileId: 77, removalReason: "bounds", depthBound: 4 });

    const changed = modifyRuntimeProjectiles([matching, other, terminal, removed], {
      controller: controller({
        id: "77",
        chainid: "99",
        nochainid: "101,102",
        velocity: "6,-1",
        remvelocity: "-4,2,0.5",
        accel: "0.5,0.25",
        velmul: "0.5,1,1.25",
        projscale: "1.5,0.75",
        projangle: "-27.5",
        projxangle: "16.25",
        projyangle: "-11.5",
        projxshear: "0.5",
        projshadow: "64",
        projreflection: "1",
        projprojection: "perspective2",
        projfocallength: "180",
        projwindow: "-24,-16,36,28",
        projedgebound: "48",
        projstagebound: "32",
        projdepthbound: "12",
        projheightbound: "-96,64",
        attr: "A,NP",
        guardflag: "A",
        affectteam: "F",
        animtype: "Medium",
        "air.animtype": "Up",
        "fall.animtype": "DiagUp",
        kill: "0",
        "guard.kill": "0",
        "fall.kill": "0",
        forcenofall: "0",
        forcestand: "0",
        forcecrouch: "1",
        "fall.damage": "13",
        "fall.xvelocity": "-3.5",
        "fall.yvelocity": "-8.25",
        "fall.zvelocity": "2.5",
        "fall.recover": "0",
        "fall.recovertime": "19",
        "down.recover": "0",
        "down.recovertime": "27",
        "fall.envshake.time": "15",
        "fall.envshake.freq": "178.5",
        "fall.envshake.ampl": "6",
        "fall.envshake.phase": "0.25",
        "fall.envshake.mul": "0.75",
        "fall.envshake.dir": "67.5",
        dizzypoints: "23",
        guardpoints: "17",
        "air.juggle": "3",
        damage: "41,7",
        givepower: "43,33",
        redlife: "23,9",
        score: "6.5,2.25",
        numhits: "5",
        priority: "7, Miss",
        p1sprpriority: "11",
        p2sprpriority: "-4",
        p2stateno: "889",
        p2getp1state: "0",
        p2facing: "-2",
        mindist: "24,6,3",
        maxdist: "72,18,9",
        "air.hittime": "23",
        "ground.hittime": "29",
        "guard.hittime": "31",
        "guard.dist.width": "120,-1",
        "guard.dist.height": "-1,64",
        "guard.dist.depth": "8",
        sparkno: "F7101",
        sparkangle: "1.25",
        "guard.sparkno": "S7100",
        "guard.sparkangle": "-1.5",
        sparkxy: "24",
        xaccel: "-0.125",
        yaccel: "0.375",
        zaccel: "0.625",
        "envshake.time": "24",
        "envshake.freq": "120.5",
        "envshake.ampl": "-8",
        "envshake.phase": "45.25",
        "envshake.mul": "1.75",
        "envshake.dir": "90",
        "guard.slidetime": "37",
        "guard.ctrltime": "39",
        "airguard.ctrltime": "41",
        "down.hittime": "43",
        p1stateno: "777",
        missonoverride: "0",
        p2clsncheck: "Clsn1",
        p2clsnrequire: "Size",
        hitflag: "H+",
        teamside: "2",
        projremovetime: "18",
        projsprpriority: "8",
        projpriority: "3",
        projhits: "4",
        projmisstime: "5",
        pausemovetime: "6",
        supermovetime: "8",
        projremove: "0",
      }),
    });

    expect(changed).toBe(1);
    expect(matching).toMatchObject({
      vel: { x: -6, y: -1 },
      remVelocity: { x: -4, y: 2, z: 0.5 },
      accel: { x: -0.5, y: 0.25 },
      velMul: { x: 0.5, y: 1, z: 1.25 },
      scale: { x: 1.5, y: 0.75 },
      angle: -27.5,
      xAngle: 16.25,
      yAngle: -11.5,
      xShear: 0.5,
      shadow: [64, 20, 30],
      reflection: 1,
      projection: "perspective2",
      focalLength: 180,
      window: [-24, -16, 36, 28],
      edgeBound: 48,
      stageBound: 32,
      depthBound: 12,
      heightBound: { low: -96, high: 64 },
      targetId: 77,
      chainId: 99,
      noChainIds: [101, 102],
      attr: "A,NP",
      guardFlag: "A",
      affectTeam: -1,
      hitAnimTypes: { ground: 1, air: 4, fall: 5 },
      kill: false,
      guardKill: false,
      fall: {
        kill: false,
        damage: 13,
        xVelocity: -3.5,
        yVelocity: -8.25,
        zVelocity: 2.5,
        recover: false,
        recoverTime: 19,
        downRecover: false,
        downRecoverTime: 27,
        envShakeTime: 15,
        envShakeFrequency: 178.5,
        envShakeAmplitude: 6,
        envShakePhase: 0.25,
        envShakeMultiplier: 0.75,
        envShakeDirection: 67.5,
      },
      forceNoFall: false,
      forceStand: false,
      forceCrouch: true,
      airJuggle: 3,
      damage: 41,
      guardDamage: 7,
      dizzyPoints: 23,
      guardPoints: 17,
      hitPower: 43,
      guardPower: 33,
      redLife: 23,
      guardRedLife: 9,
      score: 6.5,
      guardScore: 2.25,
      hitDefHitCount: 5,
      hitPriority: 7,
      hitPriorityType: "miss",
      p1SpritePriority: 2,
      p2SpritePriority: -4,
      p2StateNo: 889,
      p2GetP1State: false,
      p2Facing: -2,
      minDistance: [24, 6, 3],
      maxDistance: [72, 18, 9],
      airHitTime: 23,
      hitStun: 29,
      guardStun: 31,
      guardDistanceBounds: {
        width: [120, 0],
        height: [1000, 64],
        depth: [8, 0],
      },
      hitSpark: "F7101",
      hitSparkAngle: 1.25,
      guardSpark: "S7100",
      guardSparkAngle: -1.5,
      sparkXy: [24, 0],
      hitXAccel: -0.125,
      hitYAccel: 0.375,
      hitZAccel: 0.625,
      envShake: { time: 24, freq: 120.5, ampl: -8, phase: 45.25, mul: 1.75, dir: 90 },
      guardSlideTime: 37,
      guardControlTime: 39,
      airGuardControlTime: 41,
      downHitTime: 43,
      p1StateNo: 777,
      missOnOverride: false,
      p2ClsnCheck: "clsn1",
      p2ClsnRequire: "size",
      teamSide: 2,
      removeTime: 18,
      spritePriority: 8,
      priority: 3,
      hitsRemaining: 4,
      missTime: 5,
      pauseMoveTime: 7,
      superMoveTime: 9,
      removeOnHit: false,
      hasHit: false,
    });
    expect(matching.hitFlag).toBe("H+");
    expect(hitAttributeMatches("A,NP", matching.attr!)).toBe(true);
    expect(isRuntimeGuarding(true, "I", "S", matching.guardFlag!)).toBe(false);
    expect(isRuntimeGuarding(true, "I", "A", matching.guardFlag!)).toBe(true);
    expect(runtimeProjectileAffectTeamAllows(matching, "p2-ally")).toBe(true);
    expect(runtimeProjectileAffectTeamAllows(matching, "p1-enemy")).toBe(false);
    expect(runtimeProjectilesToSnapshots([matching], 1000)[0]).toMatchObject({
      effect: { affectTeam: -1, hitFlag: "H+", teamSide: 2 },
    });
    expect(other).toMatchObject({ vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
    expect(other.p2Facing).toBeUndefined();
    expect(terminal).toMatchObject({ vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
    expect(terminal.depthBound).toBeUndefined();
    expect(removed).toMatchObject({ removalReason: "bounds", depthBound: 4 });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({
        id: "77",
        projshadow: "0,0,0",
        projreflection: "0",
        projprojection: "orthographic",
        projfocallength: "0",
        projwindow: "0,0,0,0",
      }),
    })).toBe(1);
    expect(matching.shadow).toEqual([0, 0, 0]);
    expect(matching.reflection).toBe(0);
    expect(matching.projection).toBe("orthographic");
    expect(matching.focalLength).toBe(0);
    expect(matching.window).toEqual([0, 0, 0, 0]);
    expect(runtimeProjectilesToSnapshots([matching], 1000)[0]?.effect).not.toHaveProperty("shadow");
    expect(runtimeProjectilesToSnapshots([matching], 1000)[0]?.runtime).not.toHaveProperty("shadowColor");
    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", "fall.envshake.freq": "-2" }),
    })).toBe(1);
    expect(matching.fall?.envShakeFrequency).toBe(0);
    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", p2clsncheck: "var(0)", p2clsnrequire: "invalid" }),
    })).toBe(1);
    expect(matching).toMatchObject({ p2ClsnCheck: "clsn1", p2ClsnRequire: "size" });
  });

  it("resolves dynamic ModifyProjectile bounds through the bounded runtime resolver", () => {
    const matching = projectile({ projectileId: 77 });
    const resolvedKeys: string[] = [];

    const changed = modifyRuntimeProjectiles([matching], {
      controller: controller({
        id: "77",
        projedgebound: "var(0)",
        projstagebound: "var(1)",
        projdepthbound: "var(4)",
        projheightbound: "var(2),var(3)",
        "guard.dist.width": "var(5),var(6)",
        "guard.dist.height": "var(7),var(8)",
        "guard.dist.depth": "var(9),var(10)",
        sparkangle: "var(11)",
        "guard.sparkangle": "var(12)",
        sparkxy: "var(13),var(14)",
      }),
      resolveModifyProjectile: {
        resolveNumber: (key) => {
          resolvedKeys.push(key);
          return key === "projedgebound" ? 52 : 36;
        },
        resolvePair: (key) => {
          resolvedKeys.push(key);
          if (key === "guard.dist.width") return [120, -1];
          if (key === "guard.dist.height") return [-1, 64];
          if (key === "guard.dist.depth") return [8, 0];
          if (key === "sparkxy") return [14, -60];
          return [-144, 72];
        },
      },
    });

    expect(changed).toBe(1);
    expect(resolvedKeys).toEqual([
      "guard.dist.width",
      "guard.dist.height",
      "guard.dist.depth",
      "sparkangle",
      "guard.sparkangle",
      "sparkxy",
      "projedgebound",
      "projstagebound",
      "projdepthbound",
      "projheightbound",
    ]);
    expect(matching).toMatchObject({
      edgeBound: 52,
      stageBound: 36,
      depthBound: 36,
      heightBound: { low: -144, high: 72 },
      guardDistanceBounds: {
        width: [120, 0],
        height: [1000, 64],
        depth: [8, 0],
      },
      hitSparkAngle: 36,
      guardSparkAngle: 36,
      sparkXy: [14, -60],
    });
  });

  it("replaces ModifyProjectile attacker getpower and preserves omitted values", () => {
    const matching = projectile({ projectileId: 77, attackerHitPower: 31, attackerGuardPower: 9 });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", getpower: "9" }),
      operation: { kind: "modifyprojectile", selectionId: 77, getPower: [9] },
    })).toBe(1);
    expect(matching).toMatchObject({ attackerHitPower: 9, attackerGuardPower: 0 });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", getpower: "7,-3" }),
      operation: { kind: "modifyprojectile", selectionId: 77, getPower: [7, -3] },
    })).toBe(1);
    expect(matching).toMatchObject({ attackerHitPower: 7, attackerGuardPower: -3 });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", getpower: "var(0),var(1)" }),
      operation: { kind: "modifyprojectile", selectionId: 77, getPower: ["var(0)", "var(1)"] },
      resolveModifyProjectile: {
        resolvePair: (key) => key === "getpower" ? [12.9, -5.8] : undefined,
      },
    })).toBe(1);
    expect(matching).toMatchObject({ attackerHitPower: 12, attackerGuardPower: -5 });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77" }),
      operation: { kind: "modifyprojectile", selectionId: 77 },
    })).toBe(1);
    expect(matching).toMatchObject({ attackerHitPower: 12, attackerGuardPower: -5 });
  });

  it("replaces ModifyProjectile damage from typed dynamic pairs and uses zero guard for one value", () => {
    const matching = projectile({ projectileId: 77, damage: 30, guardDamage: 9 });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", damage: "var(0),var(1)" }, "ModifyProjectile"),
      operation: {
        kind: "modifyprojectile",
        selectionId: 77,
        damageExpressions: ["var(0)", "var(1)"],
      },
      resolveModifyProjectile: {
        resolvePair: (key) => key === "damage" ? [41.9, 7.8] : undefined,
      },
    })).toBe(1);
    expect(matching).toMatchObject({ damage: 41, guardDamage: 7 });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", damage: "var(0)" }, "ModifyProjectile"),
      operation: {
        kind: "modifyprojectile",
        selectionId: 77,
        damageExpressions: ["var(0)"],
      },
      resolveModifyProjectile: {
        resolvePair: (key) => key === "damage" ? [13.9, 99] : undefined,
      },
    })).toBe(1);
    expect(matching).toMatchObject({ damage: 13, guardDamage: 0 });
  });

  it("selects ModifyProjectile matches oldest-first and keeps projid as a mutation", () => {
    const oldest = projectile({ serialId: "oldest", projectileId: 77, priority: 1 });
    const middle = projectile({ serialId: "middle", projectileId: 77, priority: 2 });
    const newest = projectile({ serialId: "newest", projectileId: 77, priority: 3 });
    const storeOrder = [newest, middle, oldest];

    expect(modifyRuntimeProjectiles(storeOrder, {
      controller: controller({ id: "77", index: "1", projid: "99", projpriority: "8" }),
    })).toBe(1);
    expect(oldest).toMatchObject({ projectileId: 77, priority: 1 });
    expect(middle).toMatchObject({ projectileId: 99, targetId: 77, priority: 8 });
    expect(newest).toMatchObject({ projectileId: 77, priority: 3 });

    expect(modifyRuntimeProjectiles(storeOrder, {
      controller: controller({ id: "77", index: "var(0)", projpriority: "6" }),
      resolveModifyProjectile: { resolveNumber: (key) => key === "index" ? 0 : undefined },
    })).toBe(1);
    expect(oldest.priority).toBe(6);
    expect(oldest.targetId).toBe(77);

    expect(modifyRuntimeProjectiles(storeOrder, {
      controller: controller({ id: "77", index: "-1", projpriority: "5" }),
    })).toBe(2);
    expect([oldest.priority, middle.priority, newest.priority]).toEqual([5, 8, 5]);
    expect([oldest.targetId, middle.targetId, newest.targetId]).toEqual([77, 77, 77]);
    expect(modifyRuntimeProjectiles(storeOrder, {
      controller: controller({ id: "77", index: "9", projpriority: "4" }),
    })).toBe(0);
    expect(modifyRuntimeProjectiles(storeOrder, {
      controller: controller({ id: "-1" }),
    })).toBe(3);
    expect([oldest.targetId, middle.targetId, newest.targetId]).toEqual([0, 0, 0]);
  });

  it("preserves omitted ModifyProjectile reaction types", () => {
    const selected = projectile({ hitAnimTypes: { ground: 0, air: 1, fall: 2 } });

    expect(modifyRuntimeProjectiles([selected], {
      controller: controller({ id: "77", "air.animtype": "Up" }),
    })).toBe(1);
    expect(selected.hitAnimTypes).toEqual({ ground: 0, air: 4, fall: 2 });
  });

  it("replaces selected ModifyProjectile AIR actions and resets only a changed animation cursor", () => {
    const selected = projectile({ frameIndex: 1, frameElapsed: 1 });
    const untouched = projectile({ serialId: "other-animation", projectileId: 88, frameIndex: 1, frameElapsed: 1 });

    expect(modifyRuntimeProjectiles([untouched, selected], {
      controller: controller({ id: "77", projanim: "1010" }),
      resolveAction: (animNo) => animNo === 1010 ? replacementAction : undefined,
    })).toBe(1);
    expect(selected).toMatchObject({
      animNo: 1010,
      action: replacementAction,
      frameIndex: 0,
      frameElapsed: 0,
    });
    expect(untouched).toMatchObject({ animNo: 1005, action, frameIndex: 1, frameElapsed: 1 });

    selected.frameIndex = 0;
    selected.frameElapsed = 3;
    expect(modifyRuntimeProjectiles([selected], {
      controller: controller({ id: "77", projanim: "1010" }),
      resolveAction: () => replacementAction,
    })).toBe(1);
    expect(selected).toMatchObject({ frameIndex: 0, frameElapsed: 3 });

    expect(modifyRuntimeProjectiles([selected], {
      controller: controller({ id: "77", projanim: "9999" }),
      resolveAction: () => undefined,
    })).toBe(1);
    expect(selected).toMatchObject({ animNo: 1010, action: replacementAction, frameElapsed: 3 });
  });

  it("refreshes selected ModifyProjectile terminal AIR actions for later removal playback", () => {
    const selected = projectile({ projectileId: 77 });
    const actions = new Map<number, MugenAnimationAction>([
      [1010, replacementAction],
      [1400, terminalAction],
      [1005, action],
    ]);

    expect(modifyRuntimeProjectiles([selected], {
      controller: controller({
        id: "77",
        projhitanim: "1010",
        projremanim: "1400",
        projcancelanim: "1005",
      }),
      resolveAction: (animNo) => actions.get(animNo),
    })).toBe(1);
    expect(selected).toMatchObject({
      hitAnimNo: 1010,
      removeAnimNo: 1400,
      cancelAnimNo: 1005,
      terminalActions: {
        hit: replacementAction,
        remove: terminalAction,
        cancel: action,
      },
    });

    const hit = projectile({ removalReason: "hit", hitAnimNo: selected.hitAnimNo, terminalActions: { ...selected.terminalActions } });
    const remove = projectile({ removalReason: "timeout", removeAnimNo: selected.removeAnimNo, terminalActions: { ...selected.terminalActions } });
    const cancel = projectile({ removalReason: "cancel", cancelAnimNo: selected.cancelAnimNo, terminalActions: { ...selected.terminalActions } });
    expect(startRuntimeProjectileTerminalPlayback(hit)).toBe(true);
    expect(startRuntimeProjectileTerminalPlayback(remove)).toBe(true);
    expect(startRuntimeProjectileTerminalPlayback(cancel)).toBe(true);
    expect([hit.animNo, remove.animNo, cancel.animNo]).toEqual([1010, 1400, 1005]);
  });

  it("resolves typed dynamic ModifyProjectile terminal animations once in caller context", () => {
    const selected = projectile({ projectileId: 77 });
    const other = projectile({ serialId: "typed-terminal-other", projectileId: 88 });
    const operation = compileControllerIr(controller({
      id: "77",
      projhitanim: "var(0) + 1",
      projremanim: "var(1) + 2",
      projcancelanim: "var(2) + 3",
    }, "ModifyProjectile")).operation as ModifyProjectileControllerOp;
    const resolved: string[] = [];
    const actions = new Map<number, MugenAnimationAction>([
      [101, replacementAction],
      [202, terminalAction],
      [303, action],
    ]);

    expect(modifyRuntimeProjectiles([selected, other], {
      controller: controller({
        id: "77",
        projhitanim: "var(0) + 1",
        projremanim: "var(1) + 2",
        projcancelanim: "var(2) + 3",
      }),
      operation,
      resolveModifyProjectile: {
        resolveTerminalAnimation: (key) => {
          resolved.push(key);
          return key === "projhitanim" ? 101 : key === "projremanim" ? 202 : 303;
        },
      },
      resolveAction: (animNo) => actions.get(animNo),
    })).toBe(1);
    expect(resolved).toEqual(["projhitanim", "projremanim", "projcancelanim"]);
    expect(selected).toMatchObject({
      hitAnimNo: 101,
      removeAnimNo: 202,
      cancelAnimNo: 303,
      terminalActions: { hit: replacementAction, remove: terminalAction, cancel: action },
    });
    expect(other.terminalActions).toEqual({});
    expect(other.hitAnimNo).toBeUndefined();
    expect(other.removeAnimNo).toBeUndefined();
    expect(other.cancelAnimNo).toBeUndefined();
  });

  it("resolves dynamic ModifyProjectile pause budgets once for the selected projectile", () => {
    const selected = projectile({ projectileId: 77, pauseMoveTime: 0, superMoveTime: 0 });
    const other = projectile({ serialId: "dynamic-movetime-other", projectileId: 88, pauseMoveTime: 4, superMoveTime: 5 });
    const controllerValue = controller({
      id: "77",
      pausemovetime: "var(0) + 1",
      supermovetime: "fvar(1) - 2",
    });
    const operation = compileControllerIr(controller({
      id: "77",
      pausemovetime: "var(0) + 1",
      supermovetime: "fvar(1) - 2",
    }, "ModifyProjectile")).operation as ModifyProjectileControllerOp;
    const resolvedKeys: string[] = [];

    expect(modifyRuntimeProjectiles([selected, other], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: {
        resolveMoveTime: (key) => {
          resolvedKeys.push(key);
          return key === "pausemovetime" ? 5 : 6;
        },
      },
    })).toBe(1);

    expect(resolvedKeys).toEqual(["pausemovetime", "supermovetime"]);
    expect(selected).toMatchObject({ pauseMoveTime: 6, superMoveTime: 7 });
    expect(other).toMatchObject({ pauseMoveTime: 4, superMoveTime: 5 });
  });

  it("normalizes negative ModifyProjectile depth bounds to zero", () => {
    const matching = projectile({ projectileId: 77, depthBound: 12 });

    expect(
      modifyRuntimeProjectiles([matching], {
        controller: controller({ id: "77", projdepthbound: "-4" }),
      }),
    ).toBe(1);

    expect(matching.depthBound).toBe(0);
  });

  it("replaces static ModifyProjectile attack depth without changing omitted projectiles", () => {
    const pair = projectile({ projectileId: 77, attackDepth: [1, 2] });
    const single = projectile({ serialId: "single-depth", projectileId: 88, attackDepth: [3, 4] });
    const omitted = projectile({ serialId: "omitted-depth", projectileId: 99, attackDepth: [5, 6] });

    expect(modifyRuntimeProjectiles([pair, single, omitted], {
      controller: controller({ id: "77", "attack.depth": "7.5,9.25" }),
    })).toBe(1);
    expect(modifyRuntimeProjectiles([pair, single, omitted], {
      controller: controller({ id: "88", "attack.depth": "6.5" }),
    })).toBe(1);

    expect(pair.attackDepth).toEqual([7.5, 9.25]);
    expect(single.attackDepth).toEqual([6.5, 0]);
    expect(omitted.attackDepth).toEqual([5, 6]);
  });

  it("replaces static ModifyProjectile down.velocity and zeros omitted components", () => {
    const triple = projectile({ projectileId: 77, downVelocityX: 1, downVelocityY: 2, downVelocityZ: 3 });
    const pair = projectile({ serialId: "down-pair", projectileId: 88, downVelocityX: 4, downVelocityY: 5, downVelocityZ: 6 });
    const single = projectile({ serialId: "down-single", projectileId: 99, downVelocityX: 7, downVelocityY: 8, downVelocityZ: 9 });

    expect(modifyRuntimeProjectiles([triple, pair, single], {
      controller: controller({ id: "77", "down.velocity": "-3.5,-8.25,2.5" }),
    })).toBe(1);
    expect(modifyRuntimeProjectiles([triple, pair, single], {
      controller: controller({ id: "88", "down.velocity": "-4.5,-7.25" }),
    })).toBe(1);
    expect(modifyRuntimeProjectiles([triple, pair, single], {
      controller: controller({ id: "99", "down.velocity": "-6.5" }),
    })).toBe(1);

    expect([triple.downVelocityX, triple.downVelocityY, triple.downVelocityZ]).toEqual([-3.5, -8.25, 2.5]);
    expect([pair.downVelocityX, pair.downVelocityY, pair.downVelocityZ]).toEqual([-4.5, -7.25, 0]);
    expect([single.downVelocityX, single.downVelocityY, single.downVelocityZ]).toEqual([-6.5, 0, 0]);
  });

  it("resolves dynamic ModifyProjectile down.velocity for selected live projectiles", () => {
    const matching = projectile({ projectileId: 77, downVelocityX: 1, downVelocityY: 2, downVelocityZ: 3 });
    const other = projectile({ serialId: "dynamic-down-other", projectileId: 88, downVelocityX: 4, downVelocityY: 5, downVelocityZ: 6 });
    const controllerValue = controller({ id: "77", "down.velocity": "var(0),fvar(1)" });
    const operation = compileControllerIr(controller({
      id: "77",
      "down.velocity": "var(0),fvar(1)",
    }, "ModifyProjectile")).operation as ModifyProjectileControllerOp;
    const resolvedKeys: string[] = [];

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: {
        resolveFloatTriple: (key) => {
          resolvedKeys.push(key);
          return key === "down.velocity" ? [-3.5, -8.25, 0] : undefined;
        },
      },
    })).toBe(1);

    expect(resolvedKeys).toEqual(["down.velocity"]);
    expect([matching.downVelocityX, matching.downVelocityY, matching.downVelocityZ]).toEqual([-3.5, -8.25, 0]);
    expect([other.downVelocityX, other.downVelocityY, other.downVelocityZ]).toEqual([4, 5, 6]);
  });

  it("resolves dynamic ModifyProjectile airguard.velocity for selected live projectiles", () => {
    const matching = projectile({ projectileId: 77, airGuardPush: 1, airGuardVelocityY: 2, airGuardVelocityZ: 3 });
    const other = projectile({ serialId: "dynamic-airguard-other", projectileId: 88, airGuardPush: 4, airGuardVelocityY: 5, airGuardVelocityZ: 6 });
    const controllerValue = controller({ id: "77", "airguard.velocity": "var(0),fvar(1)" });
    const operation = compileControllerIr(controller({
      id: "77",
      "airguard.velocity": "var(0),fvar(1)",
    }, "ModifyProjectile")).operation as ModifyProjectileControllerOp;
    const resolvedKeys: string[] = [];

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: {
        resolveFloatTriple: (key) => {
          resolvedKeys.push(key);
          return key === "airguard.velocity" ? [-3.5, -8.25, 0] : undefined;
        },
      },
    })).toBe(1);

    expect(resolvedKeys).toEqual(["airguard.velocity"]);
    expect([matching.airGuardPush, matching.airGuardVelocityY, matching.airGuardVelocityZ]).toEqual([3.5, -8.25, 0]);
    expect([other.airGuardPush, other.airGuardVelocityY, other.airGuardVelocityZ]).toEqual([4, 5, 6]);
    expect(matching.hitVelocities?.airGuard).toEqual({ x: -3.5, y: -8.25, z: 0 });
  });

  it("resolves dynamic ModifyProjectile air.velocity for selected live projectiles", () => {
    const matching = projectile({ projectileId: 77, airVelocityX: 1, airVelocityY: 2, airVelocityZ: 3 });
    const other = projectile({ serialId: "dynamic-air-other", projectileId: 88, airVelocityX: 4, airVelocityY: 5, airVelocityZ: 6 });
    const controllerValue = controller({ id: "77", "air.velocity": "var(0),fvar(1)" });
    const operation = compileControllerIr(controller({
      id: "77",
      "air.velocity": "var(0),fvar(1)",
    }, "ModifyProjectile")).operation as ModifyProjectileControllerOp;
    const resolvedKeys: string[] = [];

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: {
        resolveFloatTriple: (key) => {
          resolvedKeys.push(key);
          return key === "air.velocity" ? [-7.5, -5.25, 0] : undefined;
        },
      },
    })).toBe(1);

    expect(resolvedKeys).toEqual(["air.velocity"]);
    expect([matching.airVelocityX, matching.airVelocityY, matching.airVelocityZ]).toEqual([-7.5, -5.25, 0]);
    expect([other.airVelocityX, other.airVelocityY, other.airVelocityZ]).toEqual([4, 5, 6]);
    expect(matching.hitVelocities?.air).toEqual({ x: -7.5, y: -5.25, z: 0 });
  });

  it("resolves dynamic ModifyProjectile guard.velocity for selected live projectiles", () => {
    const matching = projectile({ projectileId: 77, guardPush: 1, guardVelocityY: 2, guardVelocityZ: 3 });
    const other = projectile({ serialId: "dynamic-guard-other", projectileId: 88, guardPush: 4, guardVelocityY: 5, guardVelocityZ: 6 });
    const controllerValue = controller({ id: "77", "guard.velocity": "var(0),fvar(1)" });
    const operation = compileControllerIr(controller({
      id: "77",
      "guard.velocity": "var(0),fvar(1)",
    }, "ModifyProjectile")).operation as ModifyProjectileControllerOp;
    const resolvedKeys: string[] = [];

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: {
        resolveFloatTriple: (key) => {
          resolvedKeys.push(key);
          return key === "guard.velocity" ? [-6.5, -4.25, 1.75] : undefined;
        },
      },
    })).toBe(1);

    expect(resolvedKeys).toEqual(["guard.velocity"]);
    expect([matching.guardPush, matching.guardVelocityY, matching.guardVelocityZ]).toEqual([6.5, -4.25, 1.75]);
    expect([other.guardPush, other.guardVelocityY, other.guardVelocityZ]).toEqual([4, 5, 6]);
    expect(matching.hitVelocities?.guard).toEqual({ x: -6.5, y: -4.25, z: 1.75 });
  });

  it("resolves dynamic ModifyProjectile ground.velocity for selected live projectiles", () => {
    const matching = projectile({ projectileId: 77, push: 1, hitVelocityY: 2, hitVelocityZ: 3 });
    const other = projectile({ serialId: "dynamic-ground-other", projectileId: 88, push: 4, hitVelocityY: 5, hitVelocityZ: 6 });
    const controllerValue = controller({ id: "77", "ground.velocity": "var(0),fvar(1)" });
    const operation = compileControllerIr(controller({
      id: "77",
      "ground.velocity": "var(0),fvar(1)",
    }, "ModifyProjectile")).operation as ModifyProjectileControllerOp;
    const resolvedKeys: string[] = [];

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controllerValue,
      operation,
      resolveModifyProjectile: {
        resolveFloatPartialTriple: (key) => {
          resolvedKeys.push(key);
          return key === "ground.velocity" ? { x: -7.5, y: -5.25 } : undefined;
        },
      },
    })).toBe(1);

    expect(resolvedKeys).toEqual(["ground.velocity"]);
    expect([matching.push, matching.hitVelocityY, matching.hitVelocityZ]).toEqual([7.5, -5.25, 3]);
    expect([other.push, other.hitVelocityY, other.hitVelocityZ]).toEqual([4, 5, 6]);
    expect(matching.hitVelocities?.ground).toEqual({ x: -7.5, y: -5.25, z: 3 });
  });

  it("replaces static ModifyProjectile target-distance bounds and zeros omitted components", () => {
    const matching = projectile({
      projectileId: 77,
      minDistance: [1, 2, 3],
      maxDistance: [4, 5, 6],
    });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", mindist: "24", maxdist: "72,18" }),
    })).toBe(1);
    expect(matching.minDistance).toEqual([24, 0, 0]);
    expect(matching.maxDistance).toEqual([72, 18, 0]);
  });

  it("replaces static ModifyProjectile fall flags only on selected projectiles", () => {
    const matching = projectile({ projectileId: 77, fall: { enabled: false, airFall: true }, downBounce: false });
    const other = projectile({ serialId: "other-fall-flags", projectileId: 88, fall: { enabled: false }, downBounce: false });

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controller({ id: "77", fall: "1", "air.fall": "0", "down.bounce": "1" }),
    })).toBe(1);

    expect(matching).toMatchObject({ fall: { enabled: true, airFall: false }, downBounce: true });
    expect(other).toMatchObject({ fall: { enabled: false }, downBounce: false });
  });

  it("replaces static ModifyProjectile ground and air guard velocities", () => {
    const matching = projectile({
      projectileId: 77,
      guardPush: 1,
      guardVelocityY: 2,
      guardVelocityZ: 3,
      airGuardPush: 4,
      airGuardVelocityY: 5,
      airGuardVelocityZ: 6,
    });

    expect(modifyRuntimeProjectiles([matching], {
      controller: controller({
        id: "77",
        "guard.velocity": "-4.5,-1.25,1.5",
        "airguard.velocity": "-7.5,-2.25,2.5",
      }),
    })).toBe(1);

    expect(matching).toMatchObject({
      guardPush: 4.5,
      guardVelocityY: -1.25,
      guardVelocityZ: 1.5,
      airGuardPush: 7.5,
      airGuardVelocityY: -2.25,
      airGuardVelocityZ: 2.5,
      hitVelocities: {
        guard: { x: -4.5, y: -1.25, z: 1.5 },
        airGuard: { x: -7.5, y: -2.25, z: 2.5 },
      },
    });
  });

  it("replaces static ModifyProjectile air.velocity with zero defaults", () => {
    const matching = projectile({ projectileId: 77, airVelocityX: 1, airVelocityY: 2, airVelocityZ: 3 });
    const single = projectile({ serialId: "air-single", projectileId: 88, airVelocityX: 4, airVelocityY: 5, airVelocityZ: 6 });

    expect(modifyRuntimeProjectiles([matching, single], {
      controller: controller({ id: "77", "air.velocity": "-6.5,-9.25,3.5" }),
    })).toBe(1);
    expect(modifyRuntimeProjectiles([matching, single], {
      controller: controller({ id: "88", "air.velocity": "-8.5" }),
    })).toBe(1);

    expect(matching).toMatchObject({
      airVelocityX: -6.5,
      airVelocityY: -9.25,
      airVelocityZ: 3.5,
      hitVelocities: { air: { x: -6.5, y: -9.25, z: 3.5 } },
    });
    expect(single).toMatchObject({ airVelocityX: -8.5, airVelocityY: 0, airVelocityZ: 0 });
  });

  it("replaces only supplied static ModifyProjectile ground.velocity components", () => {
    const matching = projectile({
      projectileId: 77,
      push: 3,
      hitVelocityY: -2,
      hitVelocityZ: 0.5,
      hitVelocities: { ground: { x: -3, y: -2, z: 0.5 } },
    });
    const preserveAll = projectile({ serialId: "ground-preserve", projectileId: 88, push: 4, hitVelocityY: -1, hitVelocityZ: 0.25 });

    expect(modifyRuntimeProjectiles([matching, preserveAll], {
      controller: controller({ id: "77", "ground.velocity": "n,-4.25,2.5" }),
    })).toBe(1);
    expect(modifyRuntimeProjectiles([matching, preserveAll], {
      controller: controller({ id: "88", "ground.velocity": "n,n,n" }),
    })).toBe(1);

    expect(matching).toMatchObject({
      push: 3,
      hitVelocityY: -4.25,
      hitVelocityZ: 2.5,
      hitVelocities: { ground: { x: -3, y: -4.25, z: 2.5 } },
    });
    expect(preserveAll).toMatchObject({ push: 4, hitVelocityY: -1, hitVelocityZ: 0.25 });
    expect(preserveAll).not.toHaveProperty("hitVelocities");
  });

  it("replaces static ModifyProjectile ground.slidetime only on selected projectiles", () => {
    const matching = projectile({ projectileId: 77, groundSlideTime: 5 });
    const other = projectile({ serialId: "other-ground-slide", projectileId: 88, groundSlideTime: 9 });

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controller({ id: "77", "ground.slidetime": "37" }),
    })).toBe(1);

    expect(matching.groundSlideTime).toBe(37);
    expect(other.groundSlideTime).toBe(9);
  });

  it("replaces static ModifyProjectile pause pairs only on selected projectiles", () => {
    const matching = projectile({ projectileId: 77, hitPause: 6, hitShakeTime: 6, guardPause: 5, guardShakeTime: 5 });
    const other = projectile({ serialId: "other-pause-pair", projectileId: 88, hitPause: 9, hitShakeTime: 8 });

    expect(modifyRuntimeProjectiles([matching, other], {
      controller: controller({ id: "77", pausetime: "2,7", "guard.pausetime": "3" }),
    })).toBe(1);

    expect(matching).toMatchObject({ hitPause: 2, hitShakeTime: 7, guardPause: 3, guardShakeTime: 0 });
    expect(other).toMatchObject({ hitPause: 9, hitShakeTime: 8 });
  });

  it("resolves dynamic ModifyProjectile selection and non-bound params through the bounded runtime resolver", () => {
    const matching = projectile({
      projectileId: 77,
      facing: -1,
      removeOnHit: true,
      p1SpritePriority: 2,
      push: 3,
      hitVelocityY: -2,
      hitVelocityZ: 0.5,
      hitVelocities: { ground: { x: -3, y: -2, z: 0.5 } },
    });
    const other = projectile({ serialId: "other-dynamic", projectileId: 88, vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
    const resolvedKeys: string[] = [];
    const numberValues: Partial<Record<string, number>> = {
      id: 77,
      index: 0,
      projid: 91,
      projanim: 1010,
      projhitanim: 1010,
      projremanim: 1400,
      projcancelanim: 1005,
      teamside: 2,
      forcenofall: 1,
      forcestand: 1,
      forcecrouch: 0,
      "fall.damage": 13,
      "fall.xvelocity": -3.5,
      "fall.yvelocity": -8.25,
      "fall.zvelocity": 2.5,
      "fall.recover": 0,
      "fall.recovertime": 19,
      "down.recover": 0,
      "down.recovertime": 27,
      "fall.envshake.time": 15,
      "fall.envshake.freq": 178.5,
      "fall.envshake.ampl": 6,
      "fall.envshake.phase": 0.25,
      "fall.envshake.mul": 0.75,
      "fall.envshake.dir": 67.5,
      dizzypoints: 23,
      guardpoints: 17,
      projedgebound: 52,
      projstagebound: 36,
      projremovetime: 42,
      p2sprpriority: -6,
      p2facing: -2,
      "air.hittime": 23,
      fall: 1,
      "air.fall": 0,
      "down.bounce": 1,
      "ground.hittime": 29,
      "ground.slidetime": 35,
      "guard.hittime": 31,
      "guard.slidetime": 37,
      "guard.ctrltime": 39,
      "airguard.ctrltime": 41,
      "down.hittime": 43,
      xaccel: -0.125,
      yaccel: 0.375,
      zaccel: 0.625,
      "envshake.time": 20,
      "envshake.freq": 90,
      "envshake.ampl": -6,
      "envshake.phase": 30,
      "envshake.mul": 2,
      "envshake.dir": 90,
      projsprpriority: 7,
      projpriority: 5,
      projhits: 6,
      projmisstime: 8,
      projclsnangle: 35,
      projremove: 0,
    };
    const pairValues: Partial<Record<string, [number, number]>> = {
      redlife: [23, 9],
      pausetime: [2, 7],
      "guard.pausetime": [3, 9],
      velocity: [11, -2],
      accel: [1, 0],
      velmul: [2, 1],
      projscale: [3, 1],
      projclsnscale: [1.5, 0.75],
      projheightbound: [-144, 72],
    };
    const floatPairValues: Partial<Record<string, [number, number]>> = {
      score: [6.5, 2.25],
      "attack.depth": [4.5, 8.25],
    };
    const floatTripleValues: Partial<Record<string, [number, number, number]>> = {
      mindist: [24.5, 6.25, 3.5],
      maxdist: [72.5, 18.25, 9.5],
      "down.velocity": [-3.5, -8.25, 2.5],
      "air.velocity": [-6.5, -9.25, 3.5],
      "guard.velocity": [-4.5, -1.25, 1.5],
      "airguard.velocity": [-7.5, -2.25, 2.5],
    };
    const partialFloatTripleValues: Partial<Record<string, { x?: number; y?: number; z?: number }>> = {
      "ground.velocity": { x: -5.5, z: 1.75 },
    };

    const changed = modifyRuntimeProjectiles([matching, other], {
      controller: controller({
        id: "var(0)",
        index: "var(23)",
        projid: "var(24)",
        projanim: "var(25)",
        projhitanim: "var(26)",
        projremanim: "var(27)",
        projcancelanim: "var(28)",
        teamside: "var(19)",
        forcenofall: "var(31)",
        forcestand: "var(32)",
        forcecrouch: "var(33)",
        "fall.damage": "var(34)",
        "fall.xvelocity": "var(35)",
        "fall.yvelocity": "var(36)",
        "fall.zvelocity": "var(37)",
        "fall.recover": "var(38)",
        "fall.recovertime": "var(39)",
        "down.recover": "var(49)",
        "down.recovertime": "var(50)",
        "fall.envshake.time": "var(40)",
        "fall.envshake.freq": "var(41)",
        "fall.envshake.ampl": "var(42)",
        "fall.envshake.phase": "var(43)",
        "fall.envshake.mul": "var(44)",
        "fall.envshake.dir": "fvar(31)",
        dizzypoints: "var(45)",
        guardpoints: "var(46)",
        redlife: "var(47),var(48)",
        score: "fvar(0),fvar(1)",
        "attack.depth": "fvar(2),fvar(3)",
        velocity: "var(1),var(2)",
        accel: "var(3),var(4)",
        velmul: "var(5),var(6)",
        projscale: "var(7),var(8)",
        projclsnscale: "var(20),var(21)",
        projclsnangle: "var(22)",
        projedgebound: "var(9)",
        projstagebound: "var(10)",
        projheightbound: "var(11),var(12)",
        projremovetime: "var(13)",
        p1sprpriority: "var(29)",
        p2sprpriority: "var(30)",
        p2facing: "var(51)",
        mindist: "fvar(18),fvar(19),fvar(20)",
        maxdist: "fvar(21),fvar(22),fvar(23)",
        "air.hittime": "var(52)",
        fall: "var(59)",
        "air.fall": "var(60)",
        "down.bounce": "var(61)",
        "ground.hittime": "var(53)",
        pausetime: "var(63),var(64)",
        "guard.pausetime": "var(65),var(66)",
        "ground.slidetime": "var(62)",
        "guard.hittime": "var(54)",
        "guard.slidetime": "var(55)",
        "guard.ctrltime": "var(56)",
        "airguard.ctrltime": "var(57)",
        "down.hittime": "var(58)",
        "ground.velocity": "fvar(16),n,fvar(17)",
        "down.velocity": "fvar(4),fvar(5),fvar(6)",
        "air.velocity": "fvar(13),fvar(14),fvar(15)",
        "guard.velocity": "fvar(7),fvar(8),fvar(9)",
        "airguard.velocity": "fvar(10),fvar(11),fvar(12)",
        xaccel: "fvar(24)",
        yaccel: "fvar(25)",
        zaccel: "fvar(26)",
        "envshake.time": "var(67)",
        "envshake.freq": "fvar(27)",
        "envshake.ampl": "var(68)",
        "envshake.phase": "fvar(28)",
        "envshake.mul": "fvar(29)",
        "envshake.dir": "fvar(30)",
        projsprpriority: "var(14)",
        projpriority: "var(15)",
        projhits: "var(16)",
        projmisstime: "var(17)",
        projremove: "var(18)",
      }),
      resolveModifyProjectile: {
        resolveNumber: (key) => {
          resolvedKeys.push(key);
          return numberValues[key];
        },
        resolvePair: (key) => {
          resolvedKeys.push(key);
          return pairValues[key];
        },
        resolveFloatPair: (key) => {
          resolvedKeys.push(key);
          return floatPairValues[key];
        },
        resolveFloatTriple: (key) => {
          resolvedKeys.push(key);
          return floatTripleValues[key];
        },
        resolveFloatPartialTriple: (key) => {
          resolvedKeys.push(key);
          return partialFloatTripleValues[key];
        },
      },
      resolveAction: (animNo) => animNo === 1010 ? replacementAction : undefined,
    });

    expect(changed).toBe(1);
    expect(resolvedKeys).toEqual([
      "id",
      "index",
      "projid",
      "projanim",
      "projhitanim",
      "projremanim",
      "projcancelanim",
      "teamside",
      "forcenofall",
      "forcestand",
      "forcecrouch",
      "fall.damage",
      "fall.xvelocity",
      "fall.yvelocity",
      "fall.zvelocity",
      "fall.recover",
      "fall.recovertime",
      "down.recover",
      "down.recovertime",
      "fall.envshake.time",
      "fall.envshake.freq",
      "fall.envshake.ampl",
      "fall.envshake.phase",
      "fall.envshake.mul",
      "fall.envshake.dir",
      "dizzypoints",
      "guardpoints",
      "redlife",
      "score",
      "p2sprpriority",
      "p2facing",
      "mindist",
      "maxdist",
      "air.hittime",
      "fall",
      "air.fall",
      "down.bounce",
      "ground.hittime",
      "pausetime",
      "guard.pausetime",
      "ground.slidetime",
      "guard.hittime",
      "guard.slidetime",
      "guard.ctrltime",
      "airguard.ctrltime",
      "down.hittime",
      "ground.velocity",
      "down.velocity",
      "air.velocity",
      "guard.velocity",
      "airguard.velocity",
      "xaccel",
      "yaccel",
      "zaccel",
      "envshake.time",
      "envshake.freq",
      "envshake.ampl",
      "envshake.phase",
      "envshake.mul",
      "envshake.dir",
      "attack.depth",
      "velocity",
      "accel",
      "velmul",
      "projscale",
      "projclsnscale",
      "projclsnangle",
      "projedgebound",
      "projstagebound",
      "projheightbound",
      "projremovetime",
      "projsprpriority",
      "projpriority",
      "projhits",
      "projmisstime",
      "projremove",
    ]);
    expect(matching.projectileId).toBe(91);
    expect(matching).toMatchObject({
      animNo: 1010,
      action: replacementAction,
      hitAnimNo: 1010,
      removeAnimNo: 1400,
      cancelAnimNo: 1005,
      vel: { x: -11, y: -2 },
      accel: { x: -1, y: 0 },
      velMul: { x: 2, y: 1 },
      scale: { x: 3, y: 1 },
      clsnScale: { x: 1.5, y: 0.75 },
      clsnAngle: 35,
      edgeBound: 52,
      stageBound: 36,
      heightBound: { low: -144, high: 72 },
      removeTime: 42,
      p1SpritePriority: 2,
      p2SpritePriority: -6,
      p2Facing: -2,
      minDistance: [24.5, 6.25, 3.5],
      maxDistance: [72.5, 18.25, 9.5],
      airHitTime: 23,
      downBounce: true,
      hitStun: 29,
      hitPause: 2,
      hitShakeTime: 7,
      guardPause: 3,
      guardShakeTime: 9,
      groundSlideTime: 35,
      guardStun: 31,
      guardSlideTime: 37,
      guardControlTime: 39,
      airGuardControlTime: 41,
      downHitTime: 43,
      push: 5.5,
      hitVelocityY: -2,
      hitVelocityZ: 1.75,
      hitVelocities: { ground: { x: -5.5, y: -2, z: 1.75 } },
      downVelocityX: -3.5,
      downVelocityY: -8.25,
      downVelocityZ: 2.5,
      airVelocityX: -6.5,
      airVelocityY: -9.25,
      airVelocityZ: 3.5,
      guardPush: 4.5,
      guardVelocityY: -1.25,
      guardVelocityZ: 1.5,
      airGuardPush: 7.5,
      airGuardVelocityY: -2.25,
      airGuardVelocityZ: 2.5,
      hitXAccel: -0.125,
      hitYAccel: 0.375,
      hitZAccel: 0.625,
      envShake: { time: 20, freq: 90, ampl: -6, phase: 30, mul: 2, dir: 90 },
      forceNoFall: true,
      forceStand: true,
      forceCrouch: false,
      dizzyPoints: 23,
      guardPoints: 17,
      redLife: 23,
      guardRedLife: 9,
      score: 6.5,
      guardScore: 2.25,
      attackDepth: [4.5, 8.25],
      fall: {
        enabled: true,
        airFall: false,
        damage: 13,
        xVelocity: -3.5,
        yVelocity: -8.25,
        zVelocity: 2.5,
        recover: false,
        recoverTime: 19,
        downRecover: false,
        downRecoverTime: 27,
        envShakeTime: 15,
        envShakeFrequency: 178.5,
        envShakeAmplitude: 6,
        envShakePhase: 0.25,
        envShakeMultiplier: 0.75,
        envShakeDirection: 67.5,
      },
      spritePriority: 7,
      priority: 5,
      teamSide: 2,
      hitsRemaining: 6,
      missTime: 8,
      removeOnHit: false,
      hasHit: false,
    });
    expect(other).toMatchObject({ vel: { x: 2, y: 0 }, scale: { x: 1, y: 1 } });
  });

  it("ignores invalid dynamic ModifyProjectile TeamSide values", () => {
    const matching = projectile({ projectileId: 77, teamSide: 1 });

    const changed = modifyRuntimeProjectiles([matching], {
      controller: controller({ id: "77", teamside: "var(0)" }),
      resolveModifyProjectile: {
        resolveNumber: (key) => (key === "teamside" ? 3 : undefined),
      },
    });

    expect(changed).toBe(1);
    expect(matching.teamSide).toBe(1);
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

  it("switches to removal velocity for terminal playback and advances all axes", () => {
    const shot = projectile({
      pos: { x: 10, y: -5, z: 2 },
      vel: { x: 8, y: -1, z: 0.25 },
      remVelocity: { x: -3, y: 2, z: 0.5 },
      facing: -1,
      accel: { x: 1, y: 1, z: 1 },
      velMul: { x: 0.5, y: 2 },
      hitAnimNo: 1400,
      terminalActions: { hit: terminalAction },
    });

    recordRuntimeProjectileContact(shot, "hit");
    expect(shouldKeepRuntimeProjectileAfterRemoval(shot)).toBe(true);
    expect(shot).toMatchObject({
      vel: { x: 3, y: 2, z: 0.5 },
      accel: { x: 0, y: 0, z: 0 },
      velMul: { x: 1, y: 1, z: 1 },
    });
    expect(runtimeProjectilesToSnapshots([shot], 1000)[0]?.effect).toMatchObject({
      remVelocity: { x: -3, y: 2, z: 0.5 },
    });

    expect(advanceRuntimeProjectiles([shot], stage)).toEqual([shot]);
    expect(shot.pos).toEqual({ x: 13, y: -3, z: 2.5 });
    expect(advanceRuntimeProjectiles([shot], stage)).toEqual([]);
    expect(shot.pos).toEqual({ x: 16, y: -1, z: 3 });
  });

  it("projects hitboxes and snapshots without sharing collision arrays", () => {
    const shot = projectile({
      frameIndex: 0,
      facing: -1,
      pos: { x: 100, y: 20 },
      scale: { x: 2, y: 0.5 },
      layerNo: 1,
      angle: 45,
      xAngle: -20,
      yAngle: 15,
      xShear: 0.25,
      shadow: [40, 80, 120],
      reflection: 1,
      projection: "perspective",
      focalLength: 256,
    });
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
      presentationOrder: { phase: "stage-foreground", sourceKind: "projectile", priority: 4 },
      runtime: {
        pos: { x: 100, y: 20 },
        vel: { x: 2, y: 0 },
        facing: -1,
        stateNo: 1000,
        animNo: 1005,
        moveType: "A",
        renderOpacity: 1,
        renderAngle: 45,
        renderAngleX: -20,
        renderAngleY: 15,
        renderShearX: 0.25,
        shadowColor: [40, 80, 120],
        reflectionMode: 1,
        renderProjection: "perspective",
        renderFocalLength: 256,
        renderScale: { x: 2, y: 0.5 },
      },
      effect: {
        layerNo: 1,
        angle: 45,
        xAngle: -20,
        yAngle: 15,
        xShear: 0.25,
        shadow: [40, 80, 120],
        reflection: 1,
        projection: "perspective",
        focalLength: 256,
        scale: { x: 2, y: 0.5 },
      },
      clsn1: [{ x1: 8, y1: -40, x2: 42, y2: -16 }],
      clsn2: [{ x1: -8, y1: -44, x2: 44, y2: -12 }],
    });
    expect(snapshot?.clsn1[0]).not.toBe(action.frames[0]?.clsn1[0]);
    expect(snapshot?.clsn2[0]).not.toBe(action.frames[0]?.clsn2[0]);
  });

  it("projects authored projwindow into renderer coordinates using Projectile localcoord", () => {
    const shot = projectile({
      localCoord: [640, 480],
      window: [-40, -20, 80, 60],
    });
    const [snapshot] = runtimeProjectilesToSnapshots([shot], 1000);

    expect(snapshot?.effect).toMatchObject({ window: [-40, -20, 80, 60] });
    expect(snapshot?.runtime.renderWindow).toEqual([-20, -10, 40, 30]);
  });

  it("uses the fallback hitbox when the current AIR frame lacks Clsn1", () => {
    const shot = projectile({ frameIndex: 1, hitbox: { x1: 1, y1: 2, x2: 3, y2: 4 } });

    expect(getRuntimeProjectileHitboxes(shot)).toEqual([{ x1: 1, y1: 2, x2: 3, y2: 4 }]);
  });

  it("checks ProjClsnOverlap across raw Clsn1 and Clsn2 with projectile transforms", () => {
    const target = projectileClsnTarget({
      clsn2: [{ x1: -1, y1: -1, x2: 1, y2: 1 }],
      runtime: { pos: { x: 6, y: 0 } },
    });
    const shot = projectile({
      action: projectileAction([], [{ x1: 0, y1: -2, x2: 10, y2: 2 }]),
    });

    expect(runtimeProjectileClsnOverlap(shot, target, "clsn2")).toBe(true);
    shot.action.frames[0]!.clsn2 = [];
    expect(runtimeProjectileClsnOverlap(shot, target, "clsn2")).toBe(false);

    shot.action = projectileAction([{ x1: 10, y1: -2, x2: 20, y2: 2 }], []);
    shot.localCoord = [640, 480];
    shot.clsnScale = { x: 2, y: 1 };
    shot.clsnAngle = 90;
    target.runtime.pos = { x: 0, y: -15 };
    expect(runtimeProjectileClsnOverlap(shot, target, "clsn2")).toBe(true);
    shot.clsnAngle = 0;
    expect(runtimeProjectileClsnOverlap(shot, target, "clsn2")).toBe(false);
    shot.clsnAngle = 90;
    shot.facing = -1;
    target.runtime.pos = { x: 0, y: -15 };
    expect(runtimeProjectileClsnOverlap(shot, target, "clsn2")).toBe(true);
  });

  it("keeps the ProjClsnOverlap target size box unscaled and unrotated", () => {
    const target = projectileClsnTarget({
      runtime: {
        clsnScaleMultiplier: { x: 10, y: 10 },
        clsnAngle: 90,
      },
    });
    const shot = projectile({
      action: projectileAction([{ x1: 14, y1: -2, x2: 18, y2: -1 }], []),
    });

    expect(runtimeProjectileClsnOverlap(shot, target, "size")).toBe(true);
  });
});

function projectileAction(clsn1: MugenAnimationAction["frames"][number]["clsn1"], clsn2: MugenAnimationAction["frames"][number]["clsn2"]): MugenAnimationAction {
  return {
    id: 1100,
    rawLines: [],
    frames: [{
      spriteGroup: 1100,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 1,
      clsn1,
      clsn2,
      raw: "1100,0,0,0,1",
      line: 1,
    }],
  };
}

function projectileClsnTarget(options: {
  clsn1?: MugenAnimationAction["frames"][number]["clsn1"];
  clsn2?: MugenAnimationAction["frames"][number]["clsn2"];
  runtime?: Partial<RuntimeClsnOverlapActor["runtime"]>;
} = {}): RuntimeClsnOverlapActor {
  return {
    runtime: {
      frameIndex: 0,
      stateType: "S",
      pos: { x: 0, y: 0 },
      facing: 1,
      ...options.runtime,
    },
    currentAction: projectileAction(options.clsn1 ?? [], options.clsn2 ?? []),
    definition: {},
  };
}

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
    remVelocity: { x: 0, y: 0 },
    accel: { x: 0, y: 0 },
    velMul: { x: 1, y: 1 },
    scale: { x: 1, y: 1 },
    angle: 0,
    xAngle: 0,
    yAngle: 0,
    xShear: 0,
    shadow: [0, 0, 0],
    reflection: -1,
    projection: "orthographic",
    focalLength: 0,
    window: [0, 0, 0, 0],
    ownPalette: false,
    drawPalette: [0, 0],
    facing: 1,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: 10,
    stageBound: 40,
    layerNo: 0,
    priority: 1,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    pauseMoveTime: 0,
    superMoveTime: 0,
    spritePriority: 4,
    opacity: 1,
    damage: 30,
    kill: true,
    guardKill: true,
    attr: "S,SP",
    targetId: 77,
    hitPause: 6,
    hitShakeTime: 6,
    hitPauseRemaining: 0,
    hitStun: 18,
    push: 18,
    guardDamage: 0,
    guardDistanceBounds: {
      width: [90, 0],
      height: [1000, 1000],
      depth: [10, 10],
    },
    guardFlag: "MA",
    guardPause: 5,
    guardShakeTime: 5,
    guardStun: 10,
    guardPush: 10,
    hitbox: { x1: 8, y1: -40, x2: 42, y2: -16 },
    removeOnHit: true,
    hasHit: false,
    ...overrides,
    terminalActions: overrides.terminalActions ?? {},
  };
}

function controller(params: Record<string, string>, type = "Projectile"): MugenStateController {
  return {
    stateId: 1000,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 1000, ${type}]`,
  };
}
