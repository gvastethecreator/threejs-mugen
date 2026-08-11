import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeHitDefControllerDispatchWorld,
  type RuntimeHitDefControllerDispatchActor,
} from "../mugen/runtime/HitDefSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";
import { applyRuntimeHitDefJuggle } from "../mugen/runtime/RuntimeJuggleSystem";

describe("RuntimeHitDefControllerDispatchWorld", () => {
  it("activates a typed HitDef payload with raw fallbacks and frame hitbox handoff", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.hitDefTargets = ["p2"];
    actor.pendingHitDefTargets = ["p4"];
    const ir = compileControllerIr(
      controller("HitDef", {
        attr: "S,NA",
        hitflag: "H,L,A,F,P",
        affectteam: "F",
        teamside: "2",
        p2clsncheck: "Size",
        p2clsnrequire: "Clsn1",
        damage: "30,5",
        keepstate: "1",
        guardpoints: "-12",
        dizzypoints: "18",
        nochainid: "40,41,42,43,44,45,46,47,48,49",
        priority: "5, Dodge",
        pausetime: "12,8",
        p1sprpriority: "3",
        p2sprpriority: "-2",
        "attack.depth": "5,8",
        "ground.hittime": "15",
        "air.hittime": "17",
        "down.hittime": "19",
        "down.bounce": "1",
        "ground.velocity": "-4,-3,0.75",
        "air.velocity": "-6,-8,1.25",
        "down.velocity": "-2,0,1.5",
        guardflag: "MA",
        "guard.pausetime": "6,6",
        "guard.hittime": "9",
        "airguard.ctrltime": "11",
        "guard.velocity": "-2,0,1.75",
        "airguard.velocity": "-6,-2,2.25",
        "ground.cornerpush.veloff": "3",
        "air.cornerpush.veloff": "4",
        "down.cornerpush.veloff": "5",
        "guard.cornerpush.veloff": "6",
        "airguard.cornerpush.veloff": "7",
        xaccel: "-.16",
        yaccel: ".62",
        zaccel: ".24",
        sparkno: "S7000",
        "guard.sparkno": "F7004",
        sparkxy: "12,-40",
        p1stateno: "210",
        p2stateno: "5000",
        p2getp1state: "0",
        missonoverride: "0",
        ignorereversaldef: "1",
        fall: "1",
        hitonce: "1",
        "air.juggle": "6",
        "fall.damage": "7",
        "fall.yvelocity": "-4.5",
        "fall.recover": "1",
        "fall.recovertime": "20",
        "fall.envshake.dir": "67.5",
      }),
    );
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(result.activated).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(result.recordedController).toBe(true);
    expect(result.recordedOperation).toBe(true);
    expect(result.operation?.kind).toBe("hitdef");
    expect(recordedControllers).toEqual(["HitDef"]);
    expect(recordedOperations).toEqual(["hitdef"]);
    expect(actor.firedHitDefs.has(result.key)).toBe(true);

    expect(actor.currentMoveLabel).toBe("HitDef");
    expect(actor.runtime.ctrl).toBe(false);
    expect(actor.runtime.moveType).toBe("A");
    expect(actor.runtime.reversal).toBeUndefined();
    expect(actor.hasHit).toBe(false);
    expect(actor.hitDefTargets).toEqual([]);
    expect(actor.pendingHitDefTargets).toEqual([]);
    expect(actor.currentMove).toMatchObject({
      actionId: 200,
      activeStart: 3,
      activeEnd: 6,
      recovery: 18,
      damage: 30,
      keepState: true,
      hitFlag: "H,L,A,F,P",
      affectTeam: -1,
      teamSide: 2,
      p2ClsnCheck: "size",
      p2ClsnRequire: "clsn1",
      priority: 5,
      priorityType: "dodge",
      guardDamage: 5,
      guardPoints: -12,
      dizzyPoints: 18,
      noChainIds: [40, 41, 42, 43, 44, 45, 46, 47],
      hitPause: 12,
      hitShakeTime: 8,
      hitStun: 15,
      airHitTime: 17,
      downHitTime: 19,
      downVelocityX: -2,
      downVelocityY: 0,
      downVelocityZ: 1.5,
      downBounce: true,
      p1SpritePriority: 3,
      p2SpritePriority: -2,
      attackDepth: [5, 8],
      push: 4,
      hitVelocityY: -3,
      hitVelocityZ: 0.75,
      airVelocityZ: 1.25,
      guardFlag: "MA",
      guardPause: 6,
      guardShakeTime: 6,
      guardStun: 9,
      airGuardControlTime: 11,
      guardPush: 2,
      guardVelocityY: 0,
      guardVelocityZ: 1.75,
      airGuardPush: 6,
      airGuardVelocityY: -2,
      airGuardVelocityZ: 2.25,
      hitVars: {
        xAccel: -0.16,
        yAccel: 0.62,
        zAccel: 0.24,
      },
      cornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      hitSpark: "S7000",
      guardSpark: "F7004",
      sparkXy: [12, -40],
      p1StateNo: 210,
      p2StateNo: 5000,
      p2GetP1State: false,
      missOnOverride: false,
      ignoreReversalDef: true,
      hitOnce: true,
      airJuggle: 6,
      fall: {
        enabled: true,
        damage: 7,
        velocity: { y: -4.5 },
        recover: true,
        recoverTime: 20,
        envShake: { time: 0, freq: 60, ampl: -4, phase: 0, dir: 67.5 },
      },
      hitbox: { x1: 10, y1: -50, x2: 45, y2: -20 },
    });
  });

  it("defaults missing HitDef id to target id 0", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(controller("HitDef", { damage: "30" }));

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove?.targetId).toBe(0);
  });

  it("uses official fresh HitDef damage defaults without changing ModifyHitDef preservation", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.constants = {
      "default.attack.lifetopowermul": 0.25,
      "default.gethit.lifetopowermul": 0.4,
    };
    actor.currentMove = {
      ...actor.currentMove!,
      damage: 99,
      guardDamage: 88,
      attackerHitPower: 77,
      attackerGuardPower: 66,
      hitPower: 55,
      guardPower: 44,
    };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      damage: 0,
      guardDamage: 0,
      attackerHitPower: 0,
      attackerGuardPower: 0,
      hitPower: 0,
      guardPower: 0,
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "40" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ damage: 40, guardDamage: 0 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "41,7" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ damage: 41, guardDamage: 7 });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({ damage: 41, guardDamage: 7 });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { damage: "50", redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({ damage: 50, guardDamage: 7 });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { damage: "60,9", redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({ damage: 60, guardDamage: 9 });
  });

  it("resolves fresh HitDef pause pairs and guard inheritance in caller context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    actor.currentMove = {
      ...actor.currentMove!,
      hitPause: 99,
      hitShakeTime: 88,
      guardPause: 77,
      guardShakeTime: 66,
    };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      hitPause: 0,
      hitShakeTime: 0,
      guardPause: 0,
      guardShakeTime: 0,
    });

    const caller = runtimeState();
    caller.vars[1] = 8.9;
    caller.vars[2] = 11.9;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        pausetime: "var(1),var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      hitPause: 8,
      hitShakeTime: 11,
      guardPause: 8,
      guardShakeTime: 11,
    });

    caller.vars[3] = 5.9;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        pausetime: "var(1),var(2)",
        "guard.pausetime": "var(3)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      hitPause: 8,
      hitShakeTime: 11,
      guardPause: 5,
      guardShakeTime: 11,
    });

    caller.vars[4] = 6.9;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        pausetime: "var(1),var(2)",
        "guard.pausetime": "var(3),var(4)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      hitPause: 8,
      hitShakeTime: 11,
      guardPause: 5,
      guardShakeTime: 6,
    });
  });

  it("mutates live ModifyHitDef pause pairs without overwriting omitted siblings", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        pausetime: "21,22",
        "guard.pausetime": "31,32",
      })),
      frame: activeFrame(),
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        pausetime: "7",
        "guard.pausetime": "9,10",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({
      hitPause: 7,
      hitShakeTime: 22,
      guardPause: 9,
      guardShakeTime: 10,
    });

    const caller = runtimeState();
    caller.vars[1] = 12.9;
    caller.vars[2] = 13.8;
    caller.vars[3] = 14.7;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        pausetime: "var(1),var(2)",
        "guard.pausetime": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
      resolveIntegerPair: (key) => key === "pausetime" ? [19, 20] : key === "guard.pausetime" ? [21] : undefined,
    });
    expect(actor.currentMove).toMatchObject({
      hitPause: 19,
      hitShakeTime: 20,
      guardPause: 21,
      guardShakeTime: 10,
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({
      hitPause: 19,
      hitShakeTime: 20,
      guardPause: 21,
      guardShakeTime: 10,
    });
  });

  it("resolves fresh and modified ground.hittime in caller or helper context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.currentMove = { ...actor.currentMove!, hitStun: 99 };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitStun).toBe(0);

    const caller = runtimeState();
    caller.vars[1] = 13.9;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.hittime": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitStun).toBe(13);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.hittime": "var(1)",
      })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "ground.hittime" ? 17 : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitStun).toBe(17);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "1",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitStun).toBe(17);

    caller.vars[2] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "ground.hittime": "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitStun).toBe(24);
  });

  it("resolves fresh and modified ground.slidetime in caller or helper context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.currentMove = {
      ...actor.currentMove!,
      hitVars: { ...actor.currentMove?.hitVars, slideTime: 99 },
    };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars?.slideTime).toBe(0);

    const caller = runtimeState();
    caller.vars[1] = 13.9;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.slidetime": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars?.slideTime).toBe(13);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.slidetime": "var(1)",
      })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "ground.slidetime" ? 17 : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars?.slideTime).toBe(17);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "1",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVars?.slideTime).toBe(17);

    caller.vars[2] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "ground.slidetime": "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVars?.slideTime).toBe(24);
  });

  it("resolves guard.hittime by profile and replaces only guard stun on ModifyHitDef", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const fallback = (runtimeProfile: "mugen-1.1" | "ikemen-go" | "unknown") => {
      const actor = hitDefActor();
      world.apply({
        actor,
        controller: compileControllerIr(controller("HitDef", {
          attr: "S,NA",
          "ground.hittime": "12",
          "ground.slidetime": "7",
        })),
        runtimeProfile,
        frame: activeFrame(),
      });
      return actor.currentMove?.guardStun;
    };

    expect(fallback("mugen-1.1")).toBe(7);
    expect(fallback("ikemen-go")).toBe(12);
    expect(fallback("unknown")).toBe(12);

    const actor = hitDefActor();
    const caller = runtimeState();
    caller.vars[1] = 13.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.hittime": "var(1)",
      })),
      context: { self: caller },
      runtimeProfile: "ikemen-go",
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardStun).toBe(13);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.hittime": "var(1)",
      })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "guard.hittime" ? 17 : undefined,
      runtimeProfile: "ikemen-go",
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardStun).toBe(17);
    actor.currentMove!.guardSlideTime = 31;
    actor.currentMove!.guardControlTime = 32;

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "1",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardStun: 17, guardSlideTime: 31, guardControlTime: 32 });

    caller.vars[2] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "guard.hittime": "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardStun: 24, guardSlideTime: 31, guardControlTime: 32 });
  });

  it("resolves guard.slidetime in caller context and modifies only guard slide time", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    caller.vars[1] = 13.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.hittime": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardStun: 13, guardSlideTime: 13, guardControlTime: 13 });

    actor.firedHitDefs.clear();
    caller.vars[2] = 17.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.hittime": "9",
        "guard.slidetime": "var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardStun: 9, guardSlideTime: 17, guardControlTime: 17 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.hittime": "9",
        "guard.slidetime": "var(2)",
      })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "guard.slidetime" ? 21 : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardStun: 9, guardSlideTime: 21, guardControlTime: 21 });
    actor.currentMove!.guardControlTime = 32;

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "1",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardStun: 9, guardSlideTime: 21, guardControlTime: 32 });

    caller.vars[3] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "guard.slidetime": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardStun: 9, guardSlideTime: 24, guardControlTime: 32 });
  });

  it("resolves guard.ctrltime in caller context and modifies only guard control time", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    caller.vars[1] = 13.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.slidetime": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardSlideTime: 13, guardControlTime: 13 });

    actor.firedHitDefs.clear();
    caller.vars[2] = 17.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.slidetime": "9",
        "guard.ctrltime": "var(2)",
        "airguard.ctrltime": "31",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardSlideTime: 9, guardControlTime: 17, airGuardControlTime: 31 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.slidetime": "9",
        "guard.ctrltime": "var(2)",
        "airguard.ctrltime": "31",
      })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "guard.ctrltime" ? 21 : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardSlideTime: 9, guardControlTime: 21, airGuardControlTime: 31 });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "1",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardSlideTime: 9, guardControlTime: 21, airGuardControlTime: 31 });

    caller.vars[3] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "guard.ctrltime": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardSlideTime: 9, guardControlTime: 24, airGuardControlTime: 31 });
  });

  it("resolves airguard.ctrltime in caller context and modifies only air guard control time", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    caller.vars[1] = 13.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.ctrltime": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardControlTime: 13, airGuardControlTime: 13 });

    actor.firedHitDefs.clear();
    caller.vars[2] = 17.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.ctrltime": "9",
        "airguard.ctrltime": "var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardControlTime: 9, airGuardControlTime: 17 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "guard.ctrltime": "9",
        "airguard.ctrltime": "var(2)",
      })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "airguard.ctrltime" ? 21 : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ guardControlTime: 9, airGuardControlTime: 21 });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "1",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardControlTime: 9, airGuardControlTime: 21 });

    caller.vars[3] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "airguard.ctrltime": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ guardControlTime: 9, airGuardControlTime: 24 });
  });

  it("resolves air.hittime in caller context with a fresh default of 20", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", "air.hittime": "77" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.airHitTime).toBe(77);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.airHitTime).toBe(20);

    actor.firedHitDefs.clear();
    caller.vars[1] = 17.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", "air.hittime": "var(1)" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.airHitTime).toBe(17);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", "air.hittime": "var(1)" })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "air.hittime" ? 21 : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove?.airHitTime).toBe(21);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
      context: { self: caller },
    });
    expect(actor.currentMove?.airHitTime).toBe(21);

    caller.vars[2] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "air.hittime": "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.airHitTime).toBe(24);
  });

  it("resolves fresh and modified down.hittime in caller context without inheriting fresh state", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.currentMove = { ...actor.currentMove!, downHitTime: 99 };
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.downHitTime).toBe(20);

    actor.firedHitDefs.clear();
    caller.vars[1] = 17.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "down.hittime": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.downHitTime).toBe(17);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57" })),
      context: { self: caller },
    });
    expect(actor.currentMove?.downHitTime).toBe(17);

    caller.vars[2] = 24.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "down.hittime": "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.downHitTime).toBe(24);
  });

  it("resolves nonnegative guard.dist and preserves the live or default value for negatives", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardDistance).toBe(96);

    actor.firedHitDefs.clear();
    caller.vars[1] = 72.9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", "guard.dist": "var(1)" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardDistance).toBe(72);

    actor.firedHitDefs.clear();
    caller.vars[1] = -9;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", "guard.dist": "var(1)" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardDistance).toBe(72);

    const defaultActor = hitDefActor();
    world.apply({
      actor: defaultActor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", "guard.dist": "-1" })),
      frame: activeFrame(),
    });
    expect(defaultActor.currentMove?.guardDistance).toBe(96);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", "guard.dist": "var(1)" })),
      context: { self: caller },
      resolveIntegerScalar: (key) => key === "guard.dist" ? 64 : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardDistance).toBe(64);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
      context: { self: caller },
    });
    expect(actor.currentMove?.guardDistance).toBe(64);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { "guard.dist": "-1", redirectid: "57" })),
      context: { self: caller },
    });
    expect(actor.currentMove?.guardDistance).toBe(64);

    caller.vars[2] = 48.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "guard.dist": "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.guardDistance).toBe(48);
  });

  it("resolves ground.velocity X/Y independently and preserves live siblings on ModifyHitDef", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-2,-3,4",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      push: 2,
      hitVelocityY: -3,
      hitVelocityZ: 4,
      hitVelocities: { ground: { x: -2, y: -3, z: 4 } },
    });

    actor.firedHitDefs.clear();
    caller.vars[1] = -6.25;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      push: 6.25,
      hitVelocityY: 0,
      hitVelocityZ: 4,
      hitVelocities: { ground: { x: -6.25, y: 0, z: 4 } },
    });

    actor.firedHitDefs.clear();
    caller.vars[2] = -2.25;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-5.5,var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      push: 5.5,
      hitVelocityY: -2.25,
      hitVelocities: { ground: { x: -5.5, y: -2.25, z: 4 } },
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "var(1),var(2)",
      })),
      context: { self: caller },
      resolveFloatPair: (key) => key === "ground.velocity" ? [undefined, -3.5] : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      push: 5.5,
      hitVelocityY: -3.5,
      hitVelocities: { ground: { x: -5.5, y: -3.5, z: 4 } },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVelocities?.ground).toEqual({ x: -5.5, y: -3.5, z: 4 });

    caller.vars[3] = -8.5;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "ground.velocity": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      push: 8.5,
      hitVelocityY: -3.5,
      hitVelocityZ: 4,
      hitVelocities: { ground: { x: -8.5, y: -3.5, z: 4 } },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "ground.velocity": "var(1),var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
      resolveFloatPair: (key) => key === "ground.velocity" ? [undefined, -6.5] : undefined,
    });
    expect(actor.currentMove).toMatchObject({
      push: 8.5,
      hitVelocityY: -6.5,
      hitVelocityZ: 4,
      hitVelocities: { ground: { x: -8.5, y: -6.5, z: 4 } },
    });
  });

  it("resolves fresh direct air.velocity X/Y expressions without inheriting prior metadata", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "30,-20,13",
      })),
      frame: activeFrame(),
    });

    caller.vars[1] = -6.25;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      airVelocityZ: 0,
      hitVelocities: { air: { x: -6.25, y: 0, z: 0 } },
    });

    caller.vars[2] = -10.5;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "var(1),var(2)",
      })),
      context: { self: caller },
      resolveFloatPair: (key) => key === "air.velocity" ? [undefined, -9.5] : undefined,
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      airVelocityZ: 0,
      hitVelocities: { air: { x: 0, y: -9.5, z: 0 } },
    });
  });

  it("resolves fresh direct snap X/Y expressions in caller context without stale offsets", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        snap: "99,-99,4",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars?.hitOffset).toEqual({ x: 99, y: -99, z: 4 });

    caller.vars[1] = 7;
    caller.fvars[1] = -5;
    caller.vars[3] = 13;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        snap: "var(1),fvar(1),var(3)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars?.hitOffset).toEqual({ x: 7, y: -5, z: 13 });

    caller.vars[4] = 3;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        snap: "var(1),fvar(1),var(3),var(4)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars).toMatchObject({
      hitOffset: { x: 7, y: -5, z: 13 },
      snapTime: 3,
    });

    caller.vars[2] = 11;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        snap: "var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars).toMatchObject({ hitOffset: { x: 11 }, snapTime: 0 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars?.hitOffset).toBeUndefined();
    expect(actor.currentMove?.hitVars?.snapTime).toBe(0);
  });

  it("resolves live ModifyHitDef air.velocity X/Y independently and preserves omitted siblings", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-2,-3,4",
      })),
      frame: activeFrame(),
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVelocities?.air).toEqual({ x: -2, y: -3, z: 4 });

    caller.vars[1] = -7.25;
    caller.vars[2] = -5.5;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "air.velocity": "var(1),var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      airVelocityZ: 4,
      hitVelocities: { air: { x: -7.25, y: -5.5, z: 4 } },
    });

    caller.vars[3] = -11.75;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "air.velocity": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      airVelocityZ: 4,
      hitVelocities: { air: { x: -11.75, y: -5.5, z: 4 } },
    });
  });

  it("resolves live ModifyHitDef down.velocity X/Y independently and preserves omitted siblings", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "down.velocity": "-2,-8,2",
      })),
      frame: activeFrame(),
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "down.velocity": "-4",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -4,
      downVelocityY: -8,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -4, y: -8, z: 2 } },
    });

    caller.vars[1] = -7;
    caller.vars[2] = -5;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "down.velocity": "var(1),var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -7,
      downVelocityY: -5,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -7, y: -5, z: 2 } },
    });

    caller.vars[3] = -11;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "down.velocity": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -11,
      downVelocityY: -5,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -11, y: -5, z: 2 } },
    });

    caller.vars[4] = 3.75;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "down.velocity": "-11,-5,var(4)",
        redirectid: "57",
      })),
      context: { self: caller },
      resolveFloatScalar: (key) => key === "down.velocity" ? caller.vars[4] : undefined,
    });
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -11,
      downVelocityY: -5,
      downVelocityZ: 3.75,
      hitVelocities: { down: { x: -11, y: -5, z: 3.75 } },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVelocities?.down).toEqual({ x: -11, y: -5, z: 3.75 });
  });

  it("resolves live ModifyHitDef sparkxy per component and preserves omitted axes", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        damage: "20",
        sparkno: "S7001",
        sparkxy: "10,-40",
      })),
      frame: activeFrame(),
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        sparkxy: "var(0)",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.sparkXy).toEqual([0, -40]);

    caller.vars[0] = 24.5;
    caller.fvars[1] = -72.25;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        sparkxy: "var(0),fvar(1)",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.sparkXy).toEqual([24.5, -72.25]);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        forcenofall: "1",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.sparkXy).toEqual([24.5, -72.25]);
  });

  it("resolves live ModifyHitDef snap per component and preserves omitted axes", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        damage: "20",
        snap: "10,-40",
      })),
      frame: activeFrame(),
    });
    actor.currentMove!.hitVars = {
      ...actor.currentMove!.hitVars,
      hitOffset: { x: 10, y: -40, z: 3 },
    };

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        snap: "var(0)",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVars?.hitOffset).toEqual({ x: 0, y: -40, z: 3 });

    caller.vars[0] = 24.5;
    caller.fvars[1] = -72.25;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        snap: "var(0),fvar(1)",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVars?.hitOffset).toEqual({ x: 24.5, y: -72.25, z: 3 });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        forcenofall: "1",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitVars?.hitOffset).toEqual({ x: 24.5, y: -72.25, z: 3 });
  });

  it("resolves live ModifyHitDef sparkangle in caller context and preserves omission", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        damage: "20",
        sparkno: "S7001",
        sparkangle: "-10",
        "guard.sparkno": "S7000",
        "guard.sparkangle": "-8",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitSparkAngle).toBe(-10);
    expect(actor.currentMove?.guardSparkAngle).toBe(-8);

    caller.vars[0] = 27.5;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        sparkangle: "var(0)",
        "guard.sparkangle": "var(0) + 1.5",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitSparkAngle).toBe(27.5);
    expect(actor.currentMove?.guardSparkAngle).toBe(29);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        forcenofall: "1",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.hitSparkAngle).toBe(27.5);
    expect(actor.currentMove?.guardSparkAngle).toBe(29);
  });

  it("replaces live ModifyHitDef guard.sparkno identity and preserves omission", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        damage: "20",
        "guard.sparkno": "S7000",
        "guard.sparkangle": "-8",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardSpark).toBe("S7000");

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "guard.sparkno": "F7100",
      })),
    });
    expect(actor.currentMove?.guardSpark).toBe("F7100");

    caller.vars[0] = 19;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "guard.sparkno": "Fvar(0)",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.guardSpark).toBe("F19");
    expect(actor.currentMove?.guardSparkAngle).toBe(-8);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        forcenofall: "1",
      })),
    });
    expect(actor.currentMove?.guardSpark).toBe("F19");
    expect(actor.currentMove?.guardSparkAngle).toBe(-8);
  });

  it("resolves fresh direct down.velocity X/Y and inherits every omitted component from air.velocity", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    const apply = (downVelocity?: string, resolveFloatPair?: (key: "ground.velocity" | "air.velocity" | "down.velocity" | "guard.velocity" | "airguard.velocity" | "sparkscale" | "guard.sparkscale" | "sparkxy" | "snap") => [number?, number?] | undefined) => {
      actor.firedHitDefs.clear();
      world.apply({
        actor,
        controller: compileControllerIr(controller("HitDef", {
          attr: "S,NA",
          "air.velocity": "-6,-8,2",
          ...(downVelocity === undefined ? {} : { "down.velocity": downVelocity }),
        })),
        context: { self: caller },
        resolveFloatPair,
        frame: activeFrame(),
      });
    };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "30,-20,13",
        "down.velocity": "40,-30,17",
      })),
      frame: activeFrame(),
    });

    apply();
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -6,
      downVelocityY: -8,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -6, y: -8, z: 2 } },
    });

    caller.vars[1] = -3.25;
    apply("var(1)");
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -3.25,
      downVelocityY: -8,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -3.25, y: -8, z: 2 } },
    });

    caller.vars[2] = -5.5;
    apply("var(1),var(2)");
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -3.25,
      downVelocityY: -5.5,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -3.25, y: -5.5, z: 2 } },
    });

    apply("var(1),var(2)", (key) => key === "down.velocity" ? [undefined, -6.5] : undefined);
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -6,
      downVelocityY: -6.5,
      downVelocityZ: 2,
      hitVelocities: { down: { x: -6, y: -6.5, z: 2 } },
    });

    apply("-4,-6,3");
    expect(actor.currentMove).toMatchObject({
      downVelocityX: -4,
      downVelocityY: -6,
      downVelocityZ: 3,
      hitVelocities: { down: { x: -4, y: -6, z: 3 } },
    });
  });

  it("resets omitted fresh ground.velocity without changing ModifyHitDef omission preservation", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "9,-4,3",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      push: 9,
      hitVelocityY: -4,
      hitVelocityZ: 3,
      hitVelocities: { ground: { x: 9, y: -4, z: 3 } },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1" })),
    });
    expect(actor.currentMove).toMatchObject({
      push: 9,
      hitVelocityY: -4,
      hitVelocityZ: 3,
      hitVelocities: { ground: { x: 9, y: -4, z: 3 } },
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      push: 0,
      hitVelocityY: 0,
      hitVelocityZ: 0,
      hitVelocities: { ground: { x: 0, y: 0, z: 0 } },
    });
  });

  it("resolves fresh and modified HitDef id and chainid in caller context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    actor.runtime.vars[2] = 99;
    const caller = runtimeState();
    caller.vars[1] = -7.9;
    caller.vars[2] = 13.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        id: "var(1)",
        chainid: "var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ targetId: 0, hitVars: { hitId: 0, chainId: 13 } });

    caller.vars[1] = 9.9;
    caller.vars[2] = -1.9;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        id: "var(1)",
        chainid: "var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ targetId: 9, hitVars: { hitId: 9 } });
    expect(actor.currentMove?.hitVars).not.toHaveProperty("chainId");

    caller.vars[3] = -5.9;
    caller.vars[4] = 17.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        id: "var(3)",
        chainid: "var(4)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ targetId: 0, hitVars: { hitId: 0, chainId: 17 } });

    caller.vars[5] = 8.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        id: "var(5)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ targetId: 8, hitVars: { hitId: 8, chainId: 17 } });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { chainid: "-1", redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({ targetId: 8, hitVars: { hitId: 8 } });
    expect(actor.currentMove?.hitVars).not.toHaveProperty("chainId");

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ targetId: 0, hitVars: { hitId: 0 } });
    expect(actor.currentMove?.hitVars).not.toHaveProperty("chainId");
  });

  it("resolves dynamic HitDef damage before fresh defaults and mutates it without recomputing metadata", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    actor.constants = {
      "default.attack.lifetopowermul": 0.25,
      "default.gethit.lifetopowermul": 0.4,
      "default.lifetodizzypointsmul": 1.25,
    };
    const caller = runtimeState();
    caller.vars[1] = 40.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "var(1)" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      damage: 40,
      guardDamage: 0,
      dizzyPoints: -50,
      attackerHitPower: 10,
      attackerGuardPower: 5,
      hitPower: 16,
      guardPower: 8,
    });

    caller.vars[1] = 41.9;
    caller.vars[2] = 7.9;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        damage: "var(1),var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ damage: 41, guardDamage: 7 });
    const derivedMetadata = {
      dizzyPoints: actor.currentMove?.dizzyPoints,
      attackerHitPower: actor.currentMove?.attackerHitPower,
      attackerGuardPower: actor.currentMove?.attackerGuardPower,
      hitPower: actor.currentMove?.hitPower,
      guardPower: actor.currentMove?.guardPower,
    };

    caller.vars[3] = 50.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        damage: "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ damage: 50, guardDamage: 7, ...derivedMetadata });

    caller.vars[4] = 60.9;
    caller.vars[5] = 9.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        damage: "var(4),var(5)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ damage: 60, guardDamage: 9, ...derivedMetadata });
  });

  it("evaluates dynamic HitDef and ModifyHitDef acceleration, friction, and spark-scale metadata", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 0.25;
    actor.runtime.vars[2] = 0.5;
    actor.runtime.vars[3] = -0.75;
    actor.runtime.vars[4] = 0.35;
    actor.runtime.vars[5] = 0.45;
    actor.runtime.vars[6] = 0.5;
    actor.runtime.vars[7] = 0.8;
    actor.runtime.vars[8] = -1.5;

    const hitDef = compileControllerIr(
      controller("HitDef", {
        xaccel: "var(1) + 0.1",
        yaccel: "var(2)",
        zaccel: "var(3)",
        "stand.friction": "var(4)",
        "crouch.friction": "var(5)",
        sparkscale: "var(6),var(7)",
        "guard.sparkscale": "var(8)",
      }),
    );
    expect(hitDef.operation).toMatchObject({
      kind: "hitdef",
      xAccel: "var(1) + 0.1",
      yAccel: "var(2)",
      zAccel: "var(3)",
      standFriction: "var(4)",
      crouchFriction: "var(5)",
      hitSparkScale: ["var(6)", "var(7)"],
      guardSparkScale: ["var(8)"],
    });

    world.apply({ actor, controller: hitDef, frame: activeFrame() });
    expect(actor.currentMove?.hitVars).toMatchObject({
      xAccel: 0.35,
      yAccel: 0.5,
      zAccel: -0.75,
      standFriction: 0.35,
      crouchFriction: 0.45,
    });
    expect(actor.currentMove).toMatchObject({
      hitSparkScale: [0.5, 0.8],
      guardSparkScale: [-1.5, 1],
    });

    actor.runtime.vars[1] = -0.2;
    actor.runtime.vars[2] = 0.4;
    actor.runtime.vars[3] = 0.15;
    actor.runtime.vars[4] = 0.62;
    actor.runtime.vars[5] = 0.72;
    actor.runtime.vars[9] = 2;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(
        controller("ModifyHitDef", {
          xaccel: "var(1)",
          yaccel: "var(2)",
          zaccel: "var(3)",
          "stand.friction": "var(4)",
          "crouch.friction": "var(5)",
          sparkscale: "var(9)",
          "guard.sparkscale": "var(8),var(7)",
          redirectid: "57",
        }),
      ),
    });

    expect(modified.modified).toBe(true);
    expect(modified.operation).toMatchObject({
      kind: "modifyhitdef",
      xAccel: "var(1)",
      yAccel: "var(2)",
      zAccel: "var(3)",
      standFriction: "var(4)",
      crouchFriction: "var(5)",
      hitSparkScale: ["var(9)"],
      guardSparkScale: ["var(8)", "var(7)"],
    });
    expect(actor.currentMove?.hitVars).toMatchObject({
      xAccel: -0.2,
      yAccel: 0.4,
      zAccel: 0.15,
      standFriction: 0.62,
      crouchFriction: 0.72,
    });
    expect(actor.currentMove).toMatchObject({
      hitSparkScale: [2, 0.8],
      guardSparkScale: [-1.5, 0.8],
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { sparkscale: "0" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      hitSparkScale: [0, 1],
      guardSparkScale: [1, 1],
    });
  });

  it("resolves fresh contact PalFX and preserves omitted ModifyHitDef components", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 8;
    actor.runtime.vars[2] = 12;
    actor.runtime.vars[3] = -6;
    actor.runtime.vars[4] = 4;
    actor.runtime.vars[5] = 220;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "palfx.time": "var(1)",
        "palfx.add": "var(2),var(3),var(4)",
        "palfx.mul": "200,var(5),240",
        "palfx.color": "192",
        "palfx.invertall": "1",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.paletteFx).toEqual({
      time: 8,
      add: [12, -6, 4],
      mul: [200, 220, 240],
      color: 192,
      invert: true,
    });

    actor.runtime.vars[1] = 13;
    actor.runtime.vars[2] = 7;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "palfx.time": "var(1)",
        "palfx.add": "var(2),2,3",
      })),
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.paletteFx).toEqual({
      time: 13,
      add: [7, 2, 3],
      mul: [200, 220, 240],
      color: 192,
      invert: true,
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.paletteFx).toBeUndefined();
  });

  it("resolves fresh contact EnvShake and preserves omitted ModifyHitDef fields", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 12.8;
    actor.runtime.vars[2] = 75;
    actor.runtime.vars[3] = -9.9;
    actor.runtime.vars[4] = 45;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "envshake.time": "var(1)",
        "envshake.freq": "var(2)",
        "envshake.ampl": "var(3)",
        "envshake.phase": "var(4)",
        "envshake.mul": "1.5",
        "envshake.dir": "-20",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.envShake).toEqual({
      time: 12,
      freq: 75,
      ampl: -9,
      phase: 45,
      mul: 1.5,
      dir: -20,
    });

    actor.runtime.vars[1] = 7;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "envshake.time": "var(1)",
        "envshake.dir": "30",
      })),
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.envShake).toEqual({
      time: 7,
      freq: 75,
      ampl: -9,
      phase: 45,
      mul: 1.5,
      dir: 30,
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.envShake).toBeUndefined();
  });

  it("resolves fall EnvShake in the caller context and mutates live fields independently", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 999;
    const caller = runtimeState();
    caller.vars[1] = 12.8;
    caller.vars[2] = 75.5;
    caller.vars[3] = -9.9;
    caller.vars[4] = 45.5;

    const hitDef = compileControllerIr(controller("HitDef", {
      attr: "S,NA",
      "fall.envshake.time": "var(1)",
      "fall.envshake.freq": "var(2)",
      "fall.envshake.ampl": "var(3)",
      "fall.envshake.phase": "var(4)",
      "fall.envshake.mul": "1.5",
      "fall.envshake.dir": "-20",
    }));
    expect(hitDef.operation).toMatchObject({
      kind: "hitdef",
      fallEnvShake: {
        time: "var(1)",
        freq: "var(2)",
        ampl: "var(3)",
        phase: "var(4)",
        mul: 1.5,
        dir: -20,
      },
    });
    world.apply({ actor, controller: hitDef, context: { self: caller }, frame: activeFrame() });
    expect(actor.currentMove?.fall?.envShake).toEqual({
      time: 12,
      freq: 75.5,
      ampl: -9,
      phase: 45.5,
      mul: 1.5,
      dir: -20,
    });

    caller.vars[1] = 7.9;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "fall.envshake.time": "var(1)",
        "fall.envshake.dir": "30",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.fall?.envShake).toEqual({
      time: 7,
      freq: 75.5,
      ampl: -9,
      phase: 45.5,
      mul: 1.5,
      dir: 30,
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.fall?.envShake).toBeUndefined();
  });

  it("resolves fall impact metadata in the caller context and mutates live fields independently", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 999;
    const caller = runtimeState();
    caller.vars[1] = 17.9;
    caller.vars[2] = 3.5;
    caller.vars[3] = -6.25;
    caller.vars[4] = 2.75;

    const hitDef = compileControllerIr(controller("HitDef", {
      attr: "S,NA",
      fall: "1",
      "fall.damage": "var(1)",
      "fall.xvelocity": "var(2)",
      "fall.yvelocity": "var(3)",
      "fall.zvelocity": "var(4)",
    }));
    world.apply({ actor, controller: hitDef, context: { self: caller }, frame: activeFrame() });
    expect(actor.currentMove?.fall).toMatchObject({
      enabled: true,
      damage: 17,
      velocity: { x: 3.5, y: -6.25, z: 2.75 },
    });

    caller.vars[1] = 9.8;
    caller.vars[2] = 4.25;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "fall.damage": "var(1)",
        "fall.xvelocity": "var(2)",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.fall).toMatchObject({
      enabled: true,
      damage: 9,
      velocity: { x: 4.25, y: -6.25, z: 2.75 },
    });
  });

  it("resolves fall recovery metadata in the caller context and mutates live fields independently", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 999;
    const caller = runtimeState();
    caller.vars[1] = 0.9;
    caller.vars[2] = 19.8;
    caller.vars[3] = 1.9;
    caller.vars[4] = 45.8;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        fall: "1",
        "fall.recover": "var(1)",
        "fall.recovertime": "var(2)",
        "down.recover": "var(3)",
        "down.recovertime": "var(4)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.fall).toMatchObject({
      enabled: true,
      recover: false,
      recoverTime: 19,
      downRecover: true,
      downRecoverTime: 45,
    });

    caller.vars[1] = 1.9;
    caller.vars[4] = 12.9;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "fall.recover": "var(1)",
        "down.recovertime": "var(4)",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.fall).toMatchObject({
      enabled: true,
      recover: true,
      recoverTime: 19,
      downRecover: true,
      downRecoverTime: 12,
    });
  });

  it("resolves fall flags in the caller context and mutates live fields independently", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 999;
    const caller = runtimeState();
    caller.vars[1] = 1.9;
    caller.vars[2] = 0.9;
    caller.vars[3] = 0.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        fall: "var(1)",
        "air.fall": "var(2)",
        "fall.kill": "var(3)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.fall).toMatchObject({ enabled: true, airFall: false, kill: false });

    caller.vars[2] = 1.9;
    caller.vars[3] = 1.9;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "air.fall": "var(2)",
        "fall.kill": "var(3)",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.fall).toMatchObject({ enabled: true, airFall: true, kill: true });
  });

  it("resolves down.bounce in caller context and mutates it live", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 0;
    const caller = runtimeState();
    caller.vars[1] = 1.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "down.bounce": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.downBounce).toBe(true);

    caller.vars[1] = 0.9;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "down.bounce": "var(1)",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.downBounce).toBe(false);

  });

  it("resolves lethal flags in caller context and mutates live fields independently", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 999;
    const caller = runtimeState();
    caller.vars[1] = 0.9;
    caller.vars[2] = 1.9;
    caller.vars[3] = 0.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        kill: "var(1)",
        "guard.kill": "var(2)",
        hitonce: "var(3)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ kill: false, guardKill: true, hitOnce: false });

    caller.vars[1] = 1.9;
    caller.vars[3] = 1.9;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        kill: "var(1)",
        hitonce: "var(3)",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove).toMatchObject({ kill: true, guardKill: true, hitOnce: true });
  });

  it("resolves and independently mutates direct-HitDef facing metadata", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    const caller = runtimeState();
    caller.vars[1] = -1.8;
    caller.vars[2] = 2.9;
    caller.vars[5] = -3.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        p1facing: "var(1)",
        p1getp2facing: "var(2)",
        p2facing: "var(5)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ p1Facing: -1, p1GetP2Facing: 2, p2Facing: -3 });

    caller.vars[3] = 3.7;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        p1facing: "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ p1Facing: 3, p1GetP2Facing: 2, p2Facing: -3 });

    caller.vars[4] = Number.POSITIVE_INFINITY;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        p1getp2facing: "var(4)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ p1Facing: 3, p1GetP2Facing: 2, p2Facing: -3 });

    caller.vars[6] = 0.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        p2facing: "var(6)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ p1Facing: 3, p1GetP2Facing: 2, p2Facing: 0 });

    caller.vars[7] = 4.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        p2facing: "var(7)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ p1Facing: 3, p1GetP2Facing: 2, p2Facing: 4 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ p1Facing: 0, p1GetP2Facing: 0, p2Facing: 0 });
  });

  it("derives fresh direct-HitDef posture and preserves omitted ModifyHitDef fields", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    caller.vars[1] = 1.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-5,-2",
        forcecrouch: "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ forceStand: true, forceCrouch: true });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-5,-2",
        forcestand: "0",
        forcecrouch: "0",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ forceStand: false, forceCrouch: false });

    caller.vars[2] = 1.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcestand: "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ forceStand: true, forceCrouch: false });

    caller.vars[3] = 1.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcecrouch: "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ forceStand: true, forceCrouch: true });
  });

  it("resolves fresh and modified direct-HitDef forceNoFall without inheriting omitted values", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    const caller = runtimeState();
    caller.vars[1] = 1.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", forcenofall: "var(1)" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.forceNoFall).toBe(true);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.forceNoFall).toBe(false);

    caller.vars[2] = 1.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.forceNoFall).toBe(true);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcecrouch: "1",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({ forceNoFall: true, forceCrouch: true });

    caller.vars[3] = 0.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        forcenofall: "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({ forceNoFall: false, forceCrouch: true });
  });

  it("resolves fresh root HitDef states once and defaults p2 ownership only for a valid target state", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const calls: string[] = [];
    const values: Record<string, number> = {
      p1stateno: 777.9,
      p2stateno: 888.8,
      p2getp1state: 0.9,
    };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        p1stateno: "var(1)",
        p2stateno: "var(2)",
        p2getp1state: "var(3)",
      })),
      resolveIntegerScalar: (key) => {
        calls.push(key);
        return values[key];
      },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ p1StateNo: 777, p2StateNo: 888, p2GetP1State: false });
    expect(calls.filter((key) => key.endsWith("stateno") || key === "p2getp1state")).toEqual([
      "p1stateno",
      "p2stateno",
      "p2getp1state",
    ]);

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", p2stateno: "889" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ p2StateNo: 889, p2GetP1State: true });

    actor.firedHitDefs.clear();
    const invalidCalls: string[] = [];
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        p2stateno: "var(2)",
        p2getp1state: "var(3)",
      })),
      resolveIntegerScalar: (key) => {
        invalidCalls.push(key);
        return key === "p2stateno" ? Number.POSITIVE_INFINITY : 1;
      },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.p2StateNo).toBeUndefined();
    expect(actor.currentMove?.p2GetP1State).toBe(false);
    expect(invalidCalls).not.toContain("p2getp1state");
  });

  it("resolves fresh and modified direct-HitDef getpower component semantics", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 9.8;
    actor.runtime.vars[2] = -4.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        getpower: "var(1),var(2)",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ attackerHitPower: 9, attackerGuardPower: -4 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", getpower: "9" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ attackerHitPower: 9, attackerGuardPower: 4 });

    actor.runtime.vars[3] = 7.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        getpower: "var(3)",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({ attackerHitPower: 7, attackerGuardPower: 4 });

    actor.runtime.vars[4] = Number.POSITIVE_INFINITY;
    actor.runtime.vars[5] = 11.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        getpower: "var(4),var(5)",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({ attackerHitPower: 7, attackerGuardPower: 11 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ attackerHitPower: 0, attackerGuardPower: 0 });
  });

  it("derives omitted direct-HitDef getpower from normal and exact hyper attack constants", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const normal = hitDefActor();
    normal.constants = {
      "default.attack.lifetopowermul": 0.8,
      "super.attack.lifetopowermul": 0.25,
    };

    world.apply({
      actor: normal,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "41" })),
      frame: activeFrame(),
    });
    expect(normal.currentMove).toMatchObject({ attackerHitPower: 32, attackerGuardPower: 16 });

    for (const attackType of ["HA", "HT", "HP"]) {
      const hyper = hitDefActor();
      hyper.constants = normal.constants;
      world.apply({
        actor: hyper,
        controller: compileControllerIr(controller("HitDef", { attr: `S,${attackType}`, damage: "41" })),
        frame: activeFrame(),
      });
      expect(hyper.currentMove).toMatchObject({ attackerHitPower: 10, attackerGuardPower: 5 });
    }
  });

  it("applies configured fresh HitDef power defaults unless explicit values are authored", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.constants = {
      "default.attack.lifetopowermul": 0.25,
      "default.gethit.lifetopowermul": 0.4,
    };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "40" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      attackerHitPower: 10,
      attackerGuardPower: 5,
      hitPower: 16,
      guardPower: 8,
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        damage: "40",
        getpower: "13,7",
        givepower: "19,11",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      attackerHitPower: 13,
      attackerGuardPower: 7,
      hitPower: 19,
      guardPower: 11,
    });
  });

  it("derives fresh direct-HitDef givepower without inheriting the previous move", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.constants = {
      "default.gethit.lifetopowermul": 0.8,
      "super.gethit.lifetopowermul": 0.25,
    };
    actor.currentMove = { ...actor.currentMove!, hitPower: 99, guardPower: 88 };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "10" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ hitPower: 8, guardPower: 4 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,HA", damage: "10", givepower: "9" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ hitPower: 9, guardPower: 4 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,HP", damage: "10" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ hitPower: 2, guardPower: 1 });
  });

  it("resolves dynamic fresh and modified direct-HitDef givepower components", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 9.8;
    actor.runtime.vars[2] = -4.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        givepower: "var(1),var(2)",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ hitPower: 9, guardPower: -4 });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", givepower: "9" })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ hitPower: 9, guardPower: 4 });

    actor.runtime.vars[3] = 7.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        givepower: "var(3)",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({ hitPower: 7, guardPower: 4 });

    actor.runtime.vars[4] = Number.POSITIVE_INFINITY;
    actor.runtime.vars[5] = 11.9;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        givepower: "var(4),var(5)",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({ hitPower: 7, guardPower: 11 });
  });

  it("resolves and replaces two-value HitDef unhittabletime in caller context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const staticActor = hitDefActor();
    const staticHitDef = compileControllerIr(controller("HitDef", { attr: "S,NA", unhittabletime: "2,8" }));

    expect(staticHitDef.operation).toMatchObject({ kind: "hitdef", unhittableTime: [2, 8] });
    world.apply({ actor: staticActor, controller: staticHitDef, frame: activeFrame() });
    expect(staticActor.currentMove?.unhittableTime).toEqual([2, 8]);

    const dynamicActor = hitDefActor();
    dynamicActor.runtime.vars[1] = 3;
    dynamicActor.runtime.vars[2] = 4;
    const dynamicHitDef = compileControllerIr(controller("HitDef", {
      attr: "S,NA",
      unhittabletime: "var(1) + 2,var(2) + 5",
    }));

    expect(dynamicHitDef.operation).toMatchObject({
      kind: "hitdef",
      unhittableTime: ["var(1) + 2", "var(2) + 5"],
    });
    world.apply({ actor: dynamicActor, controller: dynamicHitDef, frame: activeFrame() });
    expect(dynamicActor.currentMove?.unhittableTime).toEqual([5, 9]);

    dynamicActor.runtime.vars[1] = 7;
    const modified = world.modify({
      actor: dynamicActor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        unhittabletime: "var(1) + 10",
      })),
    });
    expect(modified).toMatchObject({
      modified: true,
      operation: { kind: "modifyhitdef", unhittableTime: ["var(1) + 10"] },
    });
    expect(dynamicActor.currentMove?.unhittableTime).toEqual([17, 9]);

    const omittedActor = hitDefActor();
    world.apply({
      actor: omittedActor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA" })),
      frame: activeFrame(),
    });
    expect(omittedActor.currentMove?.unhittableTime).toEqual([-1, -1]);

    const throwActor = hitDefActor();
    world.apply({
      actor: throwActor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NT", pausetime: "5,3" })),
      frame: activeFrame(),
    });
    expect(throwActor.currentMove?.unhittableTime).toEqual([6, 6]);

    const explicitThrowActor = hitDefActor();
    world.apply({
      actor: explicitThrowActor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,ST",
        pausetime: "9,4",
        unhittabletime: "0,-1",
      })),
      frame: activeFrame(),
    });
    expect(explicitThrowActor.currentMove?.unhittableTime).toEqual([0, -1]);
  });

  it("resolves dynamic HitDef and ModifyHitDef NoChainID lists into the active move", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const hitDef = compileControllerIr(
      controller("HitDef", { attr: "S,NA", nochainid: "var(1) + 40,var(1) + 41" }),
    );

    world.apply({
      actor,
      controller: hitDef,
      frame: activeFrame(),
      resolveIntegerList: () => [43, 44],
    });
    expect(actor.currentMove?.noChainIds).toEqual([43, 44]);

    const modified = world.modify({
      actor,
      controller: compileControllerIr(
        controller("ModifyHitDef", { nochainid: "var(1) + 50,var(1) + 51", redirectid: "57" }),
      ),
      resolveIntegerList: () => [53, 54],
    });
    expect(modified).toMatchObject({ modified: true, operation: { kind: "modifyhitdef" } });
    expect(actor.currentMove?.noChainIds).toEqual([53, 54]);
  });

  it("mutates live ModifyHitDef guardsound and preserves it on omission or unresolved caller values", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        guardsound: "S6,0",
      })),
      frame: activeFrame(),
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        guardsound: "F7,2",
      })),
    });
    expect(actor.currentMove).toMatchObject({
      guardSound: "F7,2",
      guardSoundValue: { rawPrefix: "F", group: 7, index: 2 },
    });

    const dynamic = compileControllerIr(controller("ModifyHitDef", {
      redirectid: "57",
      guardsound: "Fvar(0),var(1)",
    }));
    world.modify({
      actor,
      controller: dynamic,
      resolveSoundValue: (_key, expression) => expression === "Fvar(0),var(1)"
        ? { rawPrefix: "F", group: 9, index: 4 }
        : undefined,
    });
    expect(actor.currentMove).toMatchObject({
      guardSound: "Fvar(0),var(1)",
      guardSoundValue: { rawPrefix: "F", group: 9, index: 4 },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        guardsound: "Fvar(2),var(3)",
      })),
      resolveSoundValue: () => undefined,
    });
    expect(actor.currentMove).toMatchObject({
      guardSound: "Fvar(0),var(1)",
      guardSoundValue: { rawPrefix: "F", group: 9, index: 4 },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({
      guardSound: "Fvar(0),var(1)",
      guardSoundValue: { rawPrefix: "F", group: 9, index: 4 },
    });
  });

  it("mutates live ModifyHitDef hitsound and preserves it on omission or unresolved caller values", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        hitsound: "S5,0",
      })),
      frame: activeFrame(),
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        hitsound: "F7,2",
      })),
    });
    expect(actor.currentMove).toMatchObject({
      hitSound: "F7,2",
      hitSoundValue: { rawPrefix: "F", group: 7, index: 2 },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        hitsound: "Fvar(0),var(1)",
      })),
      resolveSoundValue: (_key, expression) => expression === "Fvar(0),var(1)"
        ? { rawPrefix: "F", group: 9, index: 4 }
        : undefined,
    });
    expect(actor.currentMove).toMatchObject({
      hitSound: "Fvar(0),var(1)",
      hitSoundValue: { rawPrefix: "F", group: 9, index: 4 },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        hitsound: "Fvar(2),var(3)",
      })),
      resolveSoundValue: () => undefined,
    });
    expect(actor.currentMove).toMatchObject({
      hitSound: "Fvar(0),var(1)",
      hitSoundValue: { rawPrefix: "F", group: 9, index: 4 },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({
      hitSound: "Fvar(0),var(1)",
      hitSoundValue: { rawPrefix: "F", group: 9, index: 4 },
    });
  });

  it("mutates live ModifyHitDef hitsound.channel and preserves omission or unresolved values", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", hitsound: "S5,0" })),
      frame: activeFrame(),
    });
    actor.currentMove!.hitSoundChannel = 2;

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "hitsound.channel": "7.9",
      })),
    });
    expect(actor.currentMove?.hitSoundChannel).toBe(7);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "hitsound.channel": "var(99)",
      })),
      resolveIntegerScalar: () => undefined,
    });
    expect(actor.currentMove?.hitSoundChannel).toBe(7);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57" })),
    });
    expect(actor.currentMove?.hitSoundChannel).toBe(7);
  });

  it("mutates live ModifyHitDef guardsound.channel and preserves omission or unresolved values", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", guardsound: "S6,0" })),
      frame: activeFrame(),
    });
    actor.currentMove!.guardSoundChannel = 2;

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "guardsound.channel": "7.9",
      })),
    });
    expect(actor.currentMove?.guardSoundChannel).toBe(7);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        "guardsound.channel": "var(99)",
      })),
      resolveIntegerScalar: () => undefined,
    });
    expect(actor.currentMove?.guardSoundChannel).toBe(7);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57" })),
    });
    expect(actor.currentMove?.guardSoundChannel).toBe(7);
  });

  it("keeps air.fall separate from the ground fall flag", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const result = world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { damage: "30", "air.fall": "1" })),
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove?.fall).toEqual({ enabled: false, airFall: true, kill: true });
  });

  it("resets ignorereversaldef when the next HitDef omits it", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { ignorereversaldef: "1" })),
      frame: activeFrame(),
    });
    actor.runtime.frameIndex = 1;
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { damage: "30" })),
      frame: activeFrame(),
    });

    expect(actor.currentMove?.ignoreReversalDef).toBe(false);
  });

  it("defaults a new HitDef air.juggle field to zero without changing the active cost when omitted", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.juggle = 7;
    actor.runtime.juggleOrigin = "hitdef";
    actor.currentMove = {
      actionId: 200,
      startup: 0,
      activeStart: 0,
      activeEnd: 1,
      recovery: 2,
      damage: 10,
      airJuggle: 7,
      hitPause: 1,
      hitStun: 2,
      push: 1,
      hitbox: { x1: 0, y1: -20, x2: 20, y2: 0 },
    };

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { damage: "30" })),
      runtimeProfile: "ikemen-go",
      frame: activeFrame(),
    });

    // Field defaults to 0 after setup; omitted source must not rewrite c.juggle.
    expect(actor.currentMove?.airJuggle).toBe(0);
    expect(actor.runtime.juggle).toBe(7);
    expect(actor.runtime.juggleOrigin).toBe("hitdef");
  });

  it("arms the active juggle cost from an explicit HitDef air.juggle under IKEMEN", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.juggle = 0;
    actor.runtime.juggleOrigin = "reset";

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { damage: "30", "air.juggle": "3" })),
      runtimeProfile: "ikemen-go",
      frame: activeFrame(),
    });

    expect(actor.currentMove?.airJuggle).toBe(3);
    expect(actor.runtime.juggle).toBe(3);
    expect(actor.runtime.juggleOrigin).toBe("hitdef");
  });

  it("resolves dynamic HitDef air.juggle in caller context before arming the IKEMEN cost", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    const caller = runtimeState();
    caller.vars[1] = 5.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { damage: "30", "air.juggle": "var(1) - 2" })),
      context: { self: caller },
      runtimeProfile: "ikemen-go",
      frame: activeFrame(),
    });

    expect(actor.currentMove?.airJuggle).toBe(3);
    expect(actor.runtime.juggle).toBe(3);
    expect(actor.runtime.juggleOrigin).toBe("hitdef");
  });

  it("resolves dynamic HitDef numhits in caller context and mutates the live count", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    const caller = runtimeState();
    caller.vars[1] = 2.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { damage: "30", numhits: "var(1) + 1" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVars?.hitCount).toBe(3);

    caller.vars[1] = 5.9;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57", numhits: "var(1)" })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove?.hitVars?.hitCount).toBe(5);
  });

  it("resolves dynamic HitDef sprite priorities and the legacy alias in caller context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    const caller = runtimeState();
    caller.vars[1] = 4.9;
    caller.vars[2] = -3.2;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        damage: "30",
        sprpriority: "var(1) + 1",
        p2sprpriority: "var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ p1SpritePriority: 5, p2SpritePriority: -3 });

    caller.vars[1] = 8.7;
    caller.vars[2] = -6.1;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        p1sprpriority: "var(2)",
        p2sprpriority: "var(1)",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove).toMatchObject({ p1SpritePriority: -6, p2SpritePriority: 8 });
  });

  it("resolves dynamic HitDef priority in caller context and mutates its static class", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.runtime.vars[1] = 99;
    const caller = runtimeState();
    caller.vars[1] = 4.9;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { damage: "30", priority: "var(1) + 2, Dodge" })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ priority: 6, priorityType: "dodge" });

    caller.vars[1] = 8.7;
    const modified = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        priority: "var(1) - 3, Miss",
      })),
      context: { self: caller },
    });
    expect(modified.modified).toBe(true);
    expect(actor.currentMove).toMatchObject({ priority: 5, priorityType: "miss" });
  });

  it("arms explicit air.juggle 0 while treating omitted as non-update", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const omitted = hitDefActor();
    omitted.runtime.juggle = 5;
    world.apply({
      actor: omitted,
      controller: compileControllerIr(controller("HitDef", { damage: "10" })),
      runtimeProfile: "ikemen-go",
      frame: activeFrame(),
    });
    expect(omitted.runtime.juggle).toBe(5);

    const explicitZero = hitDefActor();
    explicitZero.runtime.juggle = 5;
    world.apply({
      actor: explicitZero,
      controller: compileControllerIr(controller("HitDef", { damage: "10", "air.juggle": "0" })),
      runtimeProfile: "ikemen-go",
      frame: activeFrame(),
    });
    expect(explicitZero.runtime.juggle).toBe(0);
    expect(explicitZero.runtime.juggleOrigin).toBe("hitdef");
  });

  it("keeps applyRuntimeHitDefJuggle available for direct arming paths", () => {
    const state = { juggle: undefined as number | undefined };
    applyRuntimeHitDefJuggle(state, 4, { profile: "ikemen-go" });
    expect(state.juggle).toBe(4);
  });

  it("uses an imported source default only when HitDef omits hitflag", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const imported = hitDefActor();

    world.apply({
      actor: imported,
      controller: compileControllerIr(controller("HitDef", { damage: "30" })),
      defaultHitFlag: "MAF",
      frame: activeFrame(),
    });

    expect(imported.currentMove?.hitFlag).toBe("MAF");

    const explicit = hitDefActor();
    world.apply({
      actor: explicit,
      controller: compileControllerIr(controller("HitDef", { damage: "30", hitflag: "H,L,A,F" })),
      defaultHitFlag: "MAF",
      frame: activeFrame(),
    });

    expect(explicit.currentMove?.hitFlag).toBe("H,L,A,F");
  });

  it("derives omitted dizzy points from damage and the authored normal multiplier", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.constants = { "default.lifetodizzypointsmul": 1.25 };

    world.apply({ actor, controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "40" })), frame: activeFrame() });

    expect(actor.currentMove).toMatchObject({ damage: 40, dizzyPoints: -50 });
  });

  it("accepts runtime constants from the dispatch contract", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "40" })),
      frame: activeFrame(),
      constants: { "default.lifetodizzypointsmul": 1.25 },
    });

    expect(actor.currentMove).toMatchObject({ damage: 40, dizzyPoints: -50 });
  });

  it("uses the Super multiplier for hyper attributes when dizzypoints is omitted", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.constants = { "default.lifetodizzypointsmul": 1.25, "super.lifetodizzypointsmul": 0.5 };

    world.apply({ actor, controller: compileControllerIr(controller("HitDef", { attr: "S,HA", damage: "40" })), frame: activeFrame() });

    expect(actor.currentMove).toMatchObject({ damage: 40, dizzyPoints: -20 });
  });

  it("defaults each omitted HitDef priority to 4 Hit instead of inheriting the previous move", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    actor.currentMove = {
      actionId: 199,
      startup: 0,
      activeStart: 0,
      activeEnd: 4,
      recovery: 8,
      damage: 20,
      hitPause: 4,
      hitStun: 8,
      push: 2,
      priority: 7,
      priorityType: "dodge",
      attackDepth: [12, 15],
      hitbox: { x1: 0, y1: -30, x2: 30, y2: 0 },
    };
    actor.runtime.combatDepth = { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] };

    world.apply({ actor, controller: compileControllerIr(controller("HitDef", { damage: "30" })), frame: activeFrame() });

    expect(actor.currentMove).toMatchObject({ priority: 4, priorityType: "hit", attackDepth: [4, 4] });
  });

  it("preserves source-shaped integer HitDef priorities outside the legacy clamps", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const high = hitDefActor();
    const negative = hitDefActor();

    world.apply({ actor: high, controller: compileControllerIr(controller("HitDef", { priority: "12.8, Dodge" })), frame: activeFrame() });
    world.apply({ actor: negative, controller: compileControllerIr(controller("HitDef", { priority: "-4.8, Miss" })), frame: activeFrame() });

    expect(high.currentMove).toMatchObject({ priority: 12, priorityType: "dodge" });
    expect(negative.currentMove).toMatchObject({ priority: -4, priorityType: "miss" });
  });

  it("derives missing airguard.velocity from air.velocity", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "A",
        "ground.velocity": "-3",
        "air.velocity": "-6,-8,4",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardDamage: 3,
      guardFlag: "A",
      airGuardPush: 9,
      airGuardVelocityY: -4,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -9, y: -4, z: 6 } },
    });
  });

  it("resolves exact dynamic and mixed airguard.velocity X/Y without inheriting a prior move", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "airguard.velocity": "-30,-20",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({ airGuardPush: 30, airGuardVelocityY: -20 });

    caller.vars[1] = -9.25;
    caller.fvars[2] = -4.5;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-6,-8,4",
        "airguard.velocity": "var(1),fvar(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 9.25,
      airGuardVelocityY: -4.5,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -9.25, y: -4.5, z: 6 } },
    });

    caller.vars[3] = -3.75;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-6,-8,5",
        "airguard.velocity": "-7.5,var(3)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 7.5,
      airGuardVelocityY: -3.75,
      airGuardVelocityZ: 7.5,
      hitVelocities: { airGuard: { x: -7.5, y: -3.75, z: 7.5 } },
    });
  });

  it("resolves a dynamic fresh airguard.velocity Z component in caller context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    caller.vars[1] = -7;
    caller.vars[2] = -4;
    caller.vars[3] = 6;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-6,-8,2",
        "airguard.velocity": "var(1),var(2),var(3)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });

    expect(actor.currentMove).toMatchObject({
      airGuardPush: 7,
      airGuardVelocityY: -4,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -7, y: -4, z: 6 } },
    });
  });

  it("derives fresh single-component airguard.velocity Y from effective air.velocity", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-20,-12",
        "airguard.velocity": "-30,-20,4",
      })),
      frame: activeFrame(),
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-6,-8,6",
        "airguard.velocity": "-7.5",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.hitVelocities?.air).toEqual({ x: -6, y: -8, z: 6 });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 7.5,
      airGuardVelocityY: -4,
      airGuardVelocityZ: 9,
      hitVelocities: { airGuard: { x: -7.5, y: -4, z: 9 } },
    });

    caller.vars[1] = -9.25;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-10,-6,2",
        "airguard.velocity": "var(1)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 9.25,
      airGuardVelocityY: -3,
      airGuardVelocityZ: 3,
      hitVelocities: { airGuard: { x: -9.25, y: -3, z: 3 } },
    });
  });

  it("replaces exact root ModifyHitDef airguard.velocity X/Y while preserving Z and omission", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-6,-8,6",
        "airguard.velocity": "-5,-3",
      })),
      frame: activeFrame(),
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 5,
      airGuardVelocityY: -3,
      airGuardVelocityZ: 9,
      hitVelocities: { airGuard: { x: -5, y: -3, z: 9 } },
    });

    caller.vars[1] = -9.25;
    caller.fvars[2] = -6.5;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "airguard.velocity": "var(1),fvar(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 9.25,
      airGuardVelocityY: -6.5,
      airGuardVelocityZ: 9,
      hitVelocities: { airGuard: { x: -9.25, y: -6.5, z: 9 } },
    });

    caller.vars[4] = 7.25;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "airguard.velocity": "var(1),fvar(2),var(4)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 9.25,
      airGuardVelocityY: -6.5,
      airGuardVelocityZ: 7.25,
      hitVelocities: { airGuard: { x: -9.25, y: -6.5, z: 7.25 } },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "airguard.velocity": "-7,-2,6",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 7,
      airGuardVelocityY: -2,
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -7, y: -2, z: 6 } },
    });
  });

  it("replaces only X for single-component root ModifyHitDef airguard.velocity", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "air.velocity": "-6,-8,6",
        "airguard.velocity": "-5,-3",
      })),
      frame: activeFrame(),
    });

    caller.vars[1] = -9.25;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "airguard.velocity": "var(1)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 9.25,
      airGuardVelocityY: -3,
      airGuardVelocityZ: 9,
      hitVelocities: { airGuard: { x: -9.25, y: -3, z: 9 } },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "airguard.velocity": "-7",
        redirectid: "57",
      })),
    });
    expect(actor.currentMove).toMatchObject({
      airGuardPush: 7,
      airGuardVelocityY: -3,
      airGuardVelocityZ: 9,
      hitVelocities: { airGuard: { x: -7, y: -3, z: 9 } },
    });
  });

  it("resolves live ModifyHitDef airguard.cornerpush.veloff in caller context and preserves omission", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        guardflag: "MA",
        "airguard.cornerpush.veloff": "7",
      })),
      frame: activeFrame(),
    });

    caller.vars[0] = 4.75;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "airguard.cornerpush.veloff": "var(0)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.airGuardCornerPush).toBeCloseTo(4.75);

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        redirectid: "57",
        damage: "20",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove?.airGuardCornerPush).toBeCloseTo(4.75);

  });

  it("resolves remaining live ModifyHitDef cornerpush offsets in caller context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        guardflag: "MA",
        "ground.cornerpush.veloff": "1",
        "air.cornerpush.veloff": "2",
        "down.cornerpush.veloff": "3",
        "guard.cornerpush.veloff": "4",
      })),
      frame: activeFrame(),
    });
    caller.vars[0] = 4.75;
    caller.vars[1] = 5.5;
    caller.vars[2] = 6.25;
    caller.vars[3] = 7.125;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "ground.cornerpush.veloff": "var(0)",
        "air.cornerpush.veloff": "var(1)",
        "down.cornerpush.veloff": "var(2)",
        "guard.cornerpush.veloff": "var(3)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      cornerPush: 4.75,
      airCornerPush: 5.5,
      downCornerPush: 6.25,
      guardCornerPush: 7.125,
    });
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { redirectid: "57", damage: "20" })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      cornerPush: 4.75,
      airCornerPush: 5.5,
      downCornerPush: 6.25,
      guardCornerPush: 7.125,
    });
  });

  it("derives missing guard.velocity from ground.velocity x", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.velocity": "-6,-2",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardDamage: 3,
      guardFlag: "MA",
      guardPush: 6,
    });
    expect(actor.currentMove?.guardVelocityY).toBeUndefined();
  });

  it("resolves fresh and root-owned modified guard.velocity X in caller context", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-9,-2",
        "guard.velocity": "-5,-3,4",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      guardPush: 5,
      guardVelocityY: -3,
      guardVelocityZ: 4,
      hitVelocities: { guard: { x: -5, y: -3, z: 4 } },
    });

    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
    });
    expect(actor.currentMove?.hitVelocities?.guard).toEqual({ x: -5, y: -3, z: 4 });

    caller.vars[1] = -6.25;
    world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "guard.velocity": "var(1)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(actor.currentMove).toMatchObject({
      guardPush: 6.25,
      guardVelocityY: -3,
      guardVelocityZ: 4,
      hitVelocities: { guard: { x: -6.25, y: -3, z: 4 } },
    });

    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-8,-2",
      })),
      frame: activeFrame(),
    });
    expect(actor.currentMove?.guardPush).toBe(8);

    caller.vars[2] = -7.5;
    actor.firedHitDefs.clear();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-8,-2",
        "guard.velocity": "var(2)",
      })),
      context: { self: caller },
      frame: activeFrame(),
    });
    expect(actor.currentMove).toMatchObject({
      guardPush: 7.5,
      hitVelocities: { guard: { x: -7.5, y: 0, z: 0 } },
    });
  });

  it("mutates live ModifyHitDef guard.velocity Y/Z by component and preserves omitted siblings", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const caller = runtimeState();
    caller.vars[0] = -8;
    caller.vars[1] = -4;
    caller.vars[2] = 6.5;

    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", {
        attr: "S,NA",
        "ground.velocity": "-9,-2",
        "guard.velocity": "-2,-1,2.5",
      })),
      frame: activeFrame(),
    });

    const pairResult = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "guard.velocity": "var(0),var(1),var(2)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(pairResult.modified).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardPush: 8,
      guardVelocityY: -4,
      guardVelocityZ: 6.5,
      hitVelocities: { guard: { x: -8, y: -4, z: 6.5 } },
    });

    caller.vars[0] = -11;
    const singleResult = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        "guard.velocity": "var(0)",
        redirectid: "57",
      })),
      context: { self: caller },
    });
    expect(singleResult.modified).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardPush: 11,
      guardVelocityY: -4,
      guardVelocityZ: 6.5,
      hitVelocities: { guard: { x: -11, y: -4, z: 6.5 } },
    });

    const omittedResult = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { forcenofall: "1", redirectid: "57" })),
      context: { self: caller },
    });
    expect(omittedResult.modified).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardPush: 11,
      guardVelocityY: -4,
      guardVelocityZ: 6.5,
      hitVelocities: { guard: { x: -11, y: -4, z: 6.5 } },
    });
  });

  it("derives missing guard timing from ground hittime", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.hittime": "15",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardStun: 15,
      guardSlideTime: 15,
      guardControlTime: 15,
      airGuardControlTime: 15,
    });
  });

  it("derives missing guard slide and control timing from guard hittime", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.hittime": "15",
        "guard.hittime": "9",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardStun: 9,
      guardSlideTime: 9,
      guardControlTime: 9,
      airGuardControlTime: 9,
    });
  });

  it("derives missing guard control timing from guard slidetime", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        damage: "20,3",
        guardflag: "MA",
        "ground.hittime": "15",
        "guard.slidetime": "6",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove).toMatchObject({
      guardStun: 15,
      guardSlideTime: 6,
      guardControlTime: 6,
      airGuardControlTime: 6,
    });
  });

  it("derives official cornerpush defaults from guard velocity", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        attr: "S,NA",
        guardflag: "MA",
        "ground.velocity": "-10",
        "guard.velocity": "-4",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove?.cornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.airCornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.downCornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.guardCornerPush).toBeCloseTo(5.2);
    expect(actor.currentMove?.airGuardCornerPush).toBeCloseTo(5.2);
  });

  it("uses zero ground cornerpush default for aerial HitDef attr", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(
      controller("HitDef", {
        attr: "A,NA",
        guardflag: "A",
        "guard.velocity": "-4",
      }),
    );

    const result = world.apply({
      actor,
      controller: ir,
      frame: activeFrame(),
    });

    expect(result.activated).toBe(true);
    expect(actor.currentMove?.cornerPush).toBe(0);
    expect(actor.currentMove?.guardCornerPush).toBe(0);
    expect(actor.currentMove?.airGuardCornerPush).toBe(0);
  });

  it("deduplicates repeated HitDef dispatches for the same state line and frame", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    const ir = compileControllerIr(controller("HitDef", { damage: "30" }));
    const frame = activeFrame();
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const first = world.apply({
      actor,
      controller: ir,
      frame,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });
    const second = world.apply({
      actor,
      controller: ir,
      frame,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(first.activated).toBe(true);
    expect(second).toEqual({
      activated: false,
      duplicate: true,
      key: first.key,
      recordedController: false,
      recordedOperation: false,
    });
    expect(recordedControllers).toEqual(["HitDef"]);
    expect(recordedOperations).toEqual(["hitdef"]);
  });

  it("mutates an active normal HitDef in place without clearing contact memory", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const actor = hitDefActor();
    world.apply({
      actor,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "30,6" })),
      frame: activeFrame(),
    });
    const activeMove = actor.currentMove;
    actor.hasHit = true;
    actor.hitDefTargets = ["p2"];
    actor.pendingHitDefTargets = ["p3"];
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", {
        damage: "61",
        "air.hittime": "18",
        "down.hittime": "22",
        "ground.velocity": "-3,-4,1.25",
        "air.velocity": "-5,-6,1.5",
        "down.velocity": "-2,0,1.75",
        "down.bounce": "0",
        "airguard.ctrltime": "17",
        "guard.velocity": "-1,0,2",
        "airguard.velocity": "-2,-1,2.5",
        xaccel: "-.2",
        yaccel: ".4",
        zaccel: ".15",
        id: "91",
        chainid: "13",
        nochainid: "40,41,42,43,44,45,46,47,48,49",
        numhits: "3",
        attr: "C,HP",
        guardflag: "H",
        hitflag: "LAF",
        p1stateno: "777",
        p2stateno: "888",
        p2getp1state: "0",
        p1sprpriority: "5",
        p2sprpriority: "-4",
        priority: "12.8, Dodge",
        kill: "0",
        "guard.kill": "0",
        "fall.kill": "0",
        hitonce: "0",
        redirectid: "57",
      })),
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(result).toMatchObject({
      modified: true,
      operation: {
        kind: "modifyhitdef",
        damage: 61,
        airHitTime: 18,
        downHitTime: 22,
        groundVelocity: [-3, -4],
        groundVelocityZ: 1.25,
        airVelocity: [-5, -6],
        airVelocityZ: 1.5,
        downVelocity: [-2, 0, 1.75],
        downBounce: false,
        airGuardControlTime: 17,
        guardVelocityZ: 2,
        airGuardVelocityZ: 2.5,
        xAccel: -0.2,
        yAccel: 0.4,
        zAccel: 0.15,
        id: 91,
        chainId: 13,
        noChainIds: [40, 41, 42, 43, 44, 45, 46, 47],
        hitCount: 3,
        attr: "C,HP",
        guardFlag: "H",
        hitFlag: "LAF",
        p1StateNo: 777,
        p2StateNo: 888,
        p2GetP1State: false,
        p1SpritePriority: 5,
        p2SpritePriority: -4,
        priority: 12,
        priorityType: "dodge",
        kill: false,
        guardKill: false,
        fallKill: false,
        hitOnce: false,
      },
    });
    expect(actor.currentMove).toBe(activeMove);
    expect(actor.currentMove).toMatchObject({
      damage: 61,
      airHitTime: 18,
      downHitTime: 22,
      downVelocityX: -2,
      downVelocityY: 0,
      downVelocityZ: 1.75,
      downBounce: false,
      hitVelocityZ: 1.25,
      airVelocityZ: 1.5,
      hitVelocities: { air: { x: -5, y: -6, z: 1.5 } },
      guardVelocityZ: 2,
      airGuardVelocityZ: 2.5,
      airGuardControlTime: 17,
      guardDamage: 6,
      attr: "C,HP",
      guardFlag: "H",
      hitFlag: "LAF",
      targetId: 91,
      noChainIds: [40, 41, 42, 43, 44, 45, 46, 47],
      hitVars: { hitId: 91, chainId: 13, hitCount: 3, xAccel: -0.2, yAccel: 0.4, zAccel: 0.15 },
      p1StateNo: 777,
      p2StateNo: 888,
      p2GetP1State: false,
      p1SpritePriority: 5,
      p2SpritePriority: -4,
      priority: 12,
      priorityType: "dodge",
      kill: false,
      guardKill: false,
      hitOnce: false,
      fall: { enabled: false, kill: false },
    });
    expect(actor.hasHit).toBe(true);
    expect(actor.hitDefTargets).toEqual(["p2"]);
    expect(actor.pendingHitDefTargets).toEqual(["p3"]);
    expect(recordedControllers).toEqual(["ModifyHitDef"]);
    expect(recordedOperations).toEqual(["modifyhitdef"]);

    const defaultedTargetState = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { p2stateno: "889", redirectid: "57" })),
    });

    expect(defaultedTargetState).toMatchObject({ modified: true, operation: { kind: "modifyhitdef", p2StateNo: 889 } });
    expect(actor.currentMove).toMatchObject({
      damage: 61,
      attr: "C,HP",
      guardFlag: "H",
      hitFlag: "LAF",
      targetId: 91,
      hitVars: { hitId: 91, chainId: 13, hitCount: 3 },
      p1StateNo: 777,
      p2StateNo: 889,
      p2GetP1State: true,
      p1SpritePriority: 5,
      p2SpritePriority: -4,
      priority: 12,
      priorityType: "dodge",
      kill: false,
      guardKill: false,
      fall: { enabled: false, kill: false },
    });

    const targetOwnedState = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { p2getp1state: "0", redirectid: "57" })),
    });

    expect(targetOwnedState).toMatchObject({ modified: true, operation: { kind: "modifyhitdef", p2GetP1State: false } });
    expect(actor.currentMove).toMatchObject({
      p1StateNo: 777,
      p2StateNo: 889,
      p2GetP1State: false,
      p1SpritePriority: 5,
      p2SpritePriority: -4,
      priority: 12,
      priorityType: "dodge",
      kill: false,
      guardKill: false,
    });

    const restoredKill = world.modify({
      actor,
      controller: compileControllerIr(controller("ModifyHitDef", { kill: "1", "guard.kill": "-2", "fall.kill": "-3", hitonce: "-4", redirectid: "57" })),
    });

    expect(restoredKill).toMatchObject({
      modified: true,
      operation: { kind: "modifyhitdef", kill: true, guardKill: true, fallKill: true, hitOnce: true },
    });
    expect(actor.currentMove).toMatchObject({ kill: true, guardKill: true, hitOnce: true, fall: { enabled: false, kill: true } });
    expect(actor.hasHit).toBe(true);
    expect(actor.hitDefTargets).toEqual(["p2"]);
    expect(actor.pendingHitDefTargets).toEqual(["p3"]);
  });

  it("blocks ModifyHitDef without a normal active HitDef or against a reversal", () => {
    const world = new RuntimeHitDefControllerDispatchWorld();
    const operation = compileControllerIr(controller("ModifyHitDef", { attr: "S,NA", redirectid: "57" }));
    const inactive = hitDefActor();
    const inactiveResult = world.modify({ actor: inactive, controller: operation });

    const reversal = hitDefActor();
    world.apply({
      actor: reversal,
      controller: compileControllerIr(controller("HitDef", { attr: "S,NA", damage: "30,6" })),
      frame: activeFrame(),
    });
    const reversalMove = reversal.currentMove;
    if (!reversalMove) {
      throw new Error("Expected active HitDef");
    }
    reversalMove.isReversal = true;
    const reversalResult = world.modify({ actor: reversal, controller: operation });

    expect(inactiveResult).toMatchObject({ modified: false, reason: "missing-normal-hitdef" });
    expect(reversalResult).toMatchObject({ modified: false, reason: "missing-normal-hitdef" });
    expect(reversal.currentMove).toBe(reversalMove);
    expect(reversal.currentMove).toMatchObject({ damage: 30, guardDamage: 6 });
  });
});

function activeFrame(): MugenAnimationFrame {
  return {
    spriteGroup: 200,
    spriteIndex: 0,
    offsetX: 0,
    offsetY: 0,
    duration: 4,
    clsn1: [{ x1: 10, y1: -50, x2: 45, y2: -20 }],
    clsn2: [],
    raw: "200,0,0,0,4",
    line: 1,
  };
}

function hitDefActor(): RuntimeHitDefControllerDispatchActor {
  return {
    runtime: runtimeState(),
    moveTick: 3,
    frameElapsed: 1,
    hasHit: true,
    firedHitDefs: new Set(),
  };
}

function runtimeState(): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    name: type,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}
