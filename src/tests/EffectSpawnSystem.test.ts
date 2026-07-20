import { describe, expect, it } from "vitest";
import { compileControllerIr, compileStateProgram } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import {
  resolveEffectSpawnBind,
  resolveEffectSpawnDepth,
  resolveEffectSpawnPosition,
  resolveHelperSpawnDepth,
  RuntimeEffectSpawnControllerDispatchWorld,
  RuntimeEffectSpawnWorld,
  type RuntimeEffectSpawnActor,
} from "../mugen/runtime/EffectSpawnSystem";
import type { DemoFighterDefinition } from "../mugen/runtime/demoFighters";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

const baseAction: MugenAnimationAction = {
  id: 910,
  rawLines: ["[Begin Action 910]"],
  frames: [
    {
      spriteGroup: 910,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 4,
      clsn1: [{ x1: 0, y1: -16, x2: 24, y2: 0 }],
      clsn2: [],
      raw: "910,0,0,0,4",
      line: 1,
    },
    {
      spriteGroup: 910,
      spriteIndex: 1,
      offsetX: 0,
      offsetY: 0,
      duration: 3,
      clsn1: [],
      clsn2: [],
      raw: "910,1,0,0,3",
      line: 2,
    },
  ],
};

const helperAction: MugenAnimationAction = {
  ...baseAction,
  id: 920,
  rawLines: ["[Begin Action 920]"],
};

const terminalAction: MugenAnimationAction = {
  ...baseAction,
  id: 930,
  rawLines: ["[Begin Action 930]"],
};

describe("EffectSpawnSystem", () => {
  it("owns Explod spawn positioning, binding, and removal through RuntimeEffectSpawnWorld", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld, {
      pos: { x: 100, y: 0 },
      facing: 1,
    });
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 220, y: 0 },
      facing: -1,
    });

    const spawned = spawnWorld.spawnExplod(
      fighter,
      opponent,
      controller("Explod", {
        anim: "910",
        pos: "10,-4",
        postype: "front",
        bindtime: "3",
        id: "77",
      }),
    );

    expect(spawned).toBe(true);
    expect(effectActorWorld.getStore("p1").explods[0]).toMatchObject({
      explodId: 77,
      animNo: 910,
      pos: { x: 158, y: -4 },
      bind: { localOffset: { x: 58, y: -4 }, remaining: 3 },
      removeTime: 7,
    });

    expect(spawnWorld.removeExplods(fighter, controller("RemoveExplod", { id: "77" }))).toBe(true);
    expect(effectActorWorld.getStore("p1").explods).toHaveLength(0);
  });

  it("dispatches active effect-spawn controllers with telemetry hooks", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const dispatchWorld = new RuntimeEffectSpawnControllerDispatchWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 220, y: 0 },
      facing: -1,
    });
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const spawned = dispatchWorld.apply({
      actor: fighter,
      opponent,
      controller: compileControllerIr(controller("Explod", { anim: "910", id: "77" })),
      effect: "explod",
      effectSpawnWorld: spawnWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(spawned).toMatchObject({
      changed: true,
      changedCount: 1,
      recordedController: true,
      recordedOperation: true,
    });
    expect(spawned.operation).toMatchObject({ kind: "explod", animNo: 910, explodId: 77 });
    expect(effectActorWorld.getStore("p1").explods[0]).toMatchObject({ animNo: 910, explodId: 77 });
    expect(recordedControllers).toEqual(["Explod"]);
    expect(recordedOperations).toEqual(["explod"]);

    const missed = dispatchWorld.apply({
      actor: fighter,
      opponent,
      controller: compileControllerIr(controller("ModifyExplod", { id: "999", vel: "4,0" })),
      effect: "modifyexplod",
      effectSpawnWorld: spawnWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(missed).toMatchObject({
      changed: false,
      changedCount: 0,
      recordedController: true,
      recordedOperation: false,
    });
    expect(recordedControllers).toEqual(["Explod", "ModifyExplod"]);
    expect(recordedOperations).toEqual(["explod"]);
  });

  it("owns ModifyExplod dispatch for live owner-side visual actors", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });

    spawnWorld.spawnExplod(fighter, opponent, controller("Explod", { anim: "910", id: "77", vel: "1,0", scale: "1,1" }));
    const changed = spawnWorld.modifyExplods(fighter, controller("ModifyExplod", { id: "77", vel: "4,-2", scale: "2,.5", sprpriority: "8" }));

    expect(changed).toBe(1);
    expect(effectActorWorld.getStore("p1").explods[0]).toMatchObject({
      vel: { x: 4, y: -2 },
      scale: { x: 2, y: 0.5 },
      spritePriority: 8,
    });
  });

  it("owns Helper and Projectile creation through state-owner sprite/action resolution", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const owner = actor("owner", effectActorWorld, {}, definition("owner", [baseAction, helperAction, terminalAction], [state(300, 920)]));
    owner.runtimeProgram = { states: [compileStateProgram(state(300, 920))] };
    const fighter = actor("p1", effectActorWorld, {
      pos: { x: 100, y: 0 },
      facing: 1,
      attackMultiplier: 1.5,
    });
    fighter.stateOwner = owner;
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 220, y: 0 },
      facing: -1,
    });

    expect(spawnWorld.spawnHelper(fighter, opponent, controller("Helper", { stateno: "300", pos: "12,5", postype: "p2" }))).toBe(true);
    expect(effectActorWorld.getStore("p1").helpers[0]).toMatchObject({
      stateNo: 300,
      animNo: 920,
      spriteOwnerId: "owner",
      runtimeProgram: owner.runtimeProgram,
      pos: { x: 208, y: 5 },
    });
    expect(effectActorWorld.getStore("p1").helpers[0]?.animations?.get(920)).toBe(helperAction);

    expect(
      spawnWorld.spawnProjectile(
        fighter,
        opponent,
        controller("Projectile", {
          projanim: "910",
          projhitanim: "930",
          offset: "6,-8",
          postype: "back",
          velocity: "3,0",
          projid: "44",
          damage: "20",
          hitsound: "Fvar(0),var(1)",
        }),
        undefined,
        (key) => (key === "hitsound" ? { rawPrefix: "F", group: 5, index: 4 } : undefined),
      ),
    ).toBe(true);
    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      projectileId: 44,
      animNo: 910,
      hitAnimNo: 930,
      damage: 30,
      spriteOwnerId: "owner",
      pos: { x: 58, y: -8 },
      hitSound: "Fvar(0),var(1)",
      hitSoundValue: { rawPrefix: "F", group: 5, index: 4 },
    });
  });

  it("carries imported Projectile HitFlag defaults through the root spawn boundary", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const importedDefinition = { ...definition("imported", [baseAction]), source: "imported" as const };
    const fighter = actor("p1", effectActorWorld, {}, importedDefinition);
    const opponent = actor("p2", effectActorWorld);

    expect(spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", { projanim: "910" }))).toBe(true);
    expect(spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", { projanim: "910", hitflag: "H" }))).toBe(true);
    expect(spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", { projanim: "910", hitflag: "var(0)" }))).toBe(true);

    expect(effectActorWorld.getStore("p1").projectiles.map((projectile) => projectile.hitFlag)).toEqual([undefined, "H", "MAF"]);
  });

  it("resolves initial Helper standby only for IKEMEN and preserves StateDef ctrl precedence", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const dispatchWorld = new RuntimeEffectSpawnControllerDispatchWorld();
    const initialStates = [state(300, 920, 0), state(301, 920)];
    const fighter = actor("p1", effectActorWorld, {}, definition("p1", [baseAction, helperAction], initialStates));
    fighter.runtimeProgram = { states: initialStates.map((initialState) => compileStateProgram(initialState)) };
    const opponent = actor("p2", effectActorWorld);
    const dispatch = (
      runtimeProfile: "mugen-1.1" | "ikemen-go" | "unknown",
      standby: string | undefined,
      stateNo = 301,
      resolveHelperStandby?: () => boolean | undefined,
    ) =>
      dispatchWorld.apply({
        actor: fighter,
        opponent,
        controller: compileControllerIr(controller("Helper", {
          stateno: String(stateNo),
          ...(standby === undefined ? {} : { standby }),
        })),
        effect: "helper",
        effectSpawnWorld: spawnWorld,
        runtimeProfile,
        resolveHelperStandby,
      });

    expect(dispatch("ikemen-go", "1", 300).changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]).toMatchObject({
      ctrl: false,
      teamState: { standby: true },
    });

    expect(dispatch("ikemen-go", "var(3)", 301, () => true).changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]).toMatchObject({
      ctrl: true,
      teamState: { standby: true },
    });
    expect(dispatch("ikemen-go", "var(3)", 301, () => undefined).changed).toBe(false);
    expect(dispatch("ikemen-go", "(").changed).toBe(false);
    expect(dispatch("ikemen-go", "0").changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.teamState?.standby).toBe(false);
    expect(dispatch("ikemen-go", undefined).changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.teamState?.standby).toBe(false);

    for (const profile of ["mugen-1.1", "unknown"] as const) {
      expect(dispatch(profile, "1").changed).toBe(true);
      expect(effectActorWorld.helpers("p1")[0]?.teamState?.standby).toBe(false);
    }
    expect(dispatch("mugen-1.1", "(").changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.teamState?.standby).toBe(false);
  });

  it("resolves Helper ownprojectile only for IKEMEN and fails closed for dynamic values", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const dispatchWorld = new RuntimeEffectSpawnControllerDispatchWorld();
    const fighter = actor("p1", effectActorWorld, {}, definition("p1", [baseAction, helperAction], [state(301, 920)]));
    fighter.runtimeProgram = { states: [compileStateProgram(state(301, 920))] };
    const opponent = actor("p2", effectActorWorld);
    const dispatch = (
      runtimeProfile: "mugen-1.1" | "ikemen-go" | "unknown",
      ownProjectile: string | undefined,
      resolve?: () => boolean | undefined,
    ) =>
      dispatchWorld.apply({
        actor: fighter,
        opponent,
        controller: compileControllerIr(controller("Helper", {
          stateno: "301",
          ...(ownProjectile === undefined ? {} : { ownprojectile: ownProjectile }),
        })),
        effect: "helper",
        effectSpawnWorld: spawnWorld,
        runtimeProfile,
        resolveHelperOwnProjectile: resolve,
      });

    expect(dispatch("ikemen-go", "1").changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.ownProjectile).toBe(true);

    expect(dispatch("ikemen-go", "var(0)", () => false).changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.ownProjectile).toBe(false);

    expect(dispatch("ikemen-go", "var(0)").changed).toBe(false);
    expect(dispatch("unknown", "1").changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.ownProjectile).toBeUndefined();
  });

  it("resolves Helper ownpal only for IKEMEN and fails closed for dynamic values", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const dispatchWorld = new RuntimeEffectSpawnControllerDispatchWorld();
    const fighter = actor("p1", effectActorWorld, {}, definition("p1", [baseAction, helperAction], [state(301, 920)]));
    fighter.runtimeProgram = { states: [compileStateProgram(state(301, 920))] };
    const opponent = actor("p2", effectActorWorld);
    const dispatch = (
      runtimeProfile: "mugen-1.1" | "ikemen-go" | "unknown",
      ownPalette: string | undefined,
      resolve?: () => boolean | undefined,
    ) =>
      dispatchWorld.apply({
        actor: fighter,
        opponent,
        controller: compileControllerIr(controller("Helper", {
          stateno: "301",
          ...(ownPalette === undefined ? {} : { ownpal: ownPalette }),
        })),
        effect: "helper",
        effectSpawnWorld: spawnWorld,
        runtimeProfile,
        resolveHelperOwnPalette: resolve,
      });

    expect(dispatch("ikemen-go", "1").changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.ownPalette).toBe(true);

    expect(dispatch("ikemen-go", "var(0)", () => false).changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.ownPalette).toBe(false);

    expect(dispatch("ikemen-go", "var(0)").changed).toBe(false);
    expect(dispatch("unknown", "1").changed).toBe(true);
    expect(effectActorWorld.helpers("p1")[0]?.ownPalette).toBeUndefined();
  });

  it("owns helper removal dispatch for current visual helper actors", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });

    spawnWorld.spawnHelper(fighter, opponent, controller("Helper", { id: "42", anim: "920" }));
    spawnWorld.spawnHelper(fighter, opponent, controller("Helper", { id: "43", anim: "920" }));

    expect(spawnWorld.removeHelpers(fighter, 42)).toBe(1);
    expect(effectActorWorld.getStore("p1").helpers.map((helper) => helper.helperId)).toEqual([43]);

    expect(spawnWorld.removeHelpers(fighter)).toBe(1);
    expect(effectActorWorld.getStore("p1").helpers).toEqual([]);
  });

  it("owns ModifyProjectile dispatch and keeps position helper behavior explicit", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });

    spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", { projanim: "910", projid: "7", velocity: "1,0" }));
    const changed = spawnWorld.modifyProjectiles(
      fighter,
      controller("ModifyProjectile", {
        projid: "7",
        velocity: "4,-2",
        projscale: "2,.5",
        projedgebound: "28",
        projstagebound: "24",
        projheightbound: "-120,60",
      }),
    );

    expect(changed).toBe(1);
    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      vel: { x: 4, y: -2 },
      scale: { x: 2, y: 0.5 },
      edgeBound: 28,
      stageBound: 24,
      heightBound: { low: -120, high: 60 },
    });
    expect(resolveEffectSpawnPosition(fighter, opponent, "left", [12, -3])).toEqual({ x: 12, y: -3 });
    expect(resolveEffectSpawnDepth(fighter, opponent, "p1", [12, -3, 6])).toBe(6);
    expect(resolveEffectSpawnBind("back", [12, -3])).toEqual({ localOffset: { x: -36, y: -3 } });
  });

  it("propagates root projectile Z spawn data into the effect actor", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld, {
      combatDepth: { position: 12, velocity: 0, size: [3, 3], attack: [4, 4] },
    });
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
      combatDepth: { position: -4, velocity: 0, size: [3, 3], attack: [4, 4] },
    });

    spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", {
      projanim: "910",
      offset: "8,-16,6",
      velocity: "2,0,0.5",
      "attack.depth": "8,10",
    }));

    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      pos: { x: 8, y: -16, z: 18 },
      vel: { x: 2, y: 0, z: 0.5 },
      attackDepth: [8, 10],
    });
  });

  it("propagates helper-origin and helper-local Projectile Z spawn data", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const ownerState: MugenStateDef = {
      ...state(300, 920),
      controllers: [
        controller("Projectile", {
          projanim: "910",
          offset: "6,-8,2",
          velocity: "0,0,0",
          projid: "88",
        }, ["Time = 0"]),
      ],
    };
    const owner = actor("owner", effectActorWorld, {}, definition("owner", [baseAction, helperAction, terminalAction], [ownerState]));
    owner.runtimeProgram = { states: [compileStateProgram(ownerState)] };
    const fighter = actor("p1", effectActorWorld, {
      combatDepth: { position: 12, velocity: 0, size: [3, 3], attack: [4, 4] },
    });
    fighter.stateOwner = owner;
    const opponent = actor("p2", effectActorWorld);

    expect(spawnWorld.spawnHelper(fighter, opponent, controller("Helper", {
      stateno: "300",
      pos: "4,-6,3",
      postype: "p1",
    }))).toBe(true);
    expect(effectActorWorld.getStore("p1").helpers[0]).toMatchObject({ pos: { x: 4, y: -6, z: 15 } });
    expect(resolveHelperSpawnDepth(fighter, opponent, "p1", [4, -6, 3])).toBe(15);

    effectActorWorld.advanceHelpers("p1", { bounds: { left: -160, right: 160 } });

    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      projectileId: 88,
      parentId: "p1-helper-0",
      pos: { x: 10, y: -14, z: 17 },
      vel: { x: 0, y: 0, z: 0 },
    });
  });

  it("passes dynamic ModifyProjectile bound resolvers through owner-side dispatch", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });

    spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", { projanim: "910", projid: "7", velocity: "1,0" }));
    const changed = spawnWorld.modifyProjectiles(
      fighter,
      controller("ModifyProjectile", {
        projid: "7",
        projedgebound: "var(0)",
        projstagebound: "var(1)",
        projheightbound: "var(2),var(3)",
      }),
      undefined,
      {
        resolveNumber: (key) => (key === "projedgebound" ? 52 : 36),
        resolvePair: () => [-144, 72],
      },
    );

    expect(changed).toBe(1);
    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      edgeBound: 52,
      stageBound: 36,
      heightBound: { low: -144, high: 72 },
    });
  });

  it("passes dynamic ModifyProjectile selection and non-bound resolvers through owner-side dispatch", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });
    const numberValues: Partial<Record<string, number>> = {
      projid: 7,
      projremovetime: 42,
      sprpriority: 8,
      projpriority: 5,
      projhits: 6,
      projmisstime: 4,
      projremove: 0,
    };
    const pairValues: Partial<Record<string, [number, number]>> = {
      velocity: [9, -2],
      accel: [1, 0],
      velmul: [2, 1],
      projscale: [3, 1],
    };

    spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", { projanim: "910", projid: "7", velocity: "1,0", projremove: "1" }));
    const changed = spawnWorld.modifyProjectiles(
      fighter,
      controller("ModifyProjectile", {
        projid: "var(0)",
        velocity: "var(1),var(2)",
        accel: "var(3),var(4)",
        velmul: "var(5),var(6)",
        projscale: "var(7),var(8)",
        projremovetime: "var(9)",
        sprpriority: "var(10)",
        projpriority: "var(11)",
        projhits: "var(12)",
        projmisstime: "var(13)",
        projremove: "var(14)",
      }),
      undefined,
      {
        resolveNumber: (key) => numberValues[key],
        resolvePair: (key) => pairValues[key],
      },
    );

    expect(changed).toBe(1);
    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      vel: { x: 9, y: -2 },
      accel: { x: 1, y: 0 },
      velMul: { x: 2, y: 1 },
      scale: { x: 3, y: 1 },
      removeTime: 42,
      spritePriority: 8,
      priority: 5,
      hitsRemaining: 6,
      missTime: 4,
      removeOnHit: false,
    });
  });
});

function actor(
  id: string,
  effectActorWorld: RuntimeEffectActorWorld,
  runtimeOverrides: Partial<CharacterRuntimeState> = {},
  fighterDefinition = definition(id, [baseAction, helperAction, terminalAction]),
): RuntimeEffectSpawnActor {
  return {
    id,
    label: id.toUpperCase(),
    definition: fighterDefinition,
    runtime: runtimeState(runtimeOverrides),
    effectActorWorld,
  };
}

function definition(id: string, actions: MugenAnimationAction[], states: MugenStateDef[] = []): DemoFighterDefinition {
  return {
    id,
    displayName: id,
    palette: "#fff",
    spriteGroupBase: 0,
    speed: 1,
    jumpVelocity: -8,
    walkAction: 20,
    idleAction: 0,
    crouchAction: 10,
    jumpAction: 40,
    hitstunAction: 5000,
    moves: {
      punch: move(200),
      kick: move(210),
    },
    states,
    animations: new Map(actions.map((action) => [action.id, action])),
  };
}

function state(id: number, anim: number, ctrl?: number): MugenStateDef {
  return {
    id,
    anim,
    ctrl,
    rawParams: {},
    controllers: [],
    line: 1,
  };
}

function move(actionId: number) {
  return {
    actionId,
    startup: 1,
    activeStart: 1,
    activeEnd: 2,
    recovery: 4,
    damage: 20,
    hitPause: 4,
    hitStun: 12,
    push: 5,
    hitbox: { x1: 0, y1: -12, x2: 20, y2: 0 },
  };
}

function controller(type: string, params: Record<string, string>, triggers: string[] = []): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: triggers.map((expression, index) => ({
      index: index + 1,
      expression,
      raw: `trigger${index + 1} = ${expression}`,
      line: index + 1,
    })),
    params,
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 910,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: Array.from({ length: 60 }, () => 0),
    fvars: Array.from({ length: 40 }, () => 0),
    ...overrides,
  };
}
