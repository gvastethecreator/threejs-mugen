import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import type { CharacterRuntimeState } from "../mugen/runtime/types";
import {
  advanceRuntimeExplodActors,
  advanceRuntimeHelperActors,
  createRuntimeEffectActorStore,
  removeRuntimeExplodActors,
  removeRuntimeExplodActorsOnGetHit,
  removeRuntimeProjectilesMarkedForRemoval,
  RuntimeEffectActorWorld,
  runtimeExplodActorsToSnapshots,
  runtimeHelperActorsToSnapshots,
  runtimeProjectileActorsToSnapshots,
  spawnRuntimeExplodActor,
  spawnRuntimeHelperActor,
  spawnRuntimeProjectileActor,
  summarizeRuntimeEffectActorStore,
} from "../mugen/runtime/EffectActorSystem";
import { markRuntimeProjectileForRemoval } from "../mugen/runtime/ProjectileSystem";

describe("EffectActorSystem", () => {
  it("owns effect actor serials, bounded stores, and renderer snapshots", () => {
    const store = createRuntimeEffectActorStore();

    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "10", anim: "900" }));
    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "11", anim: "900" }));
    spawnRuntimeHelperActor(store, "p1", helperInput({ id: "20", name: '"Buddy"' }));
    spawnRuntimeProjectileActor(store, "p1", projectileInput({ projid: "30", projanim: "900" }));

    expect(store.explods.map((actor) => actor.serialId)).toEqual(["p1-explod-1", "p1-explod-0"]);
    expect(store.helpers.map((actor) => actor.serialId)).toEqual(["p1-helper-0"]);
    expect(store.projectiles.map((actor) => actor.serialId)).toEqual(["p1-projectile-0"]);
    expect(store).toMatchObject({
      nextExplodSerial: 2,
      nextHelperSerial: 1,
      nextProjectileSerial: 1,
    });
    expect(summarizeRuntimeEffectActorStore(store, "p1")).toEqual({
      ownerId: "p1",
      total: 4,
      explods: ["p1-explod-1", "p1-explod-0"],
      helpers: ["p1-helper-0"],
      projectiles: ["p1-projectile-0"],
      nextSerials: {
        explod: 2,
        helper: 1,
        projectile: 1,
      },
    });

    const explodSnapshots = runtimeExplodActorsToSnapshots(store, 200);
    expect(explodSnapshots.map((snapshot) => snapshot.id)).toEqual(["p1-explod-1", "p1-explod-0"]);
    expect(explodSnapshots[0]?.effect).toMatchObject({
      kind: "explod",
      id: 11,
      removeOnGetHit: false,
      ignoreHitPause: false,
      scale: { x: 1, y: 1 },
    });
    expect(runtimeHelperActorsToSnapshots(store, 200)[0]).toMatchObject({
      id: "p1-helper-0",
      actorKind: "helper",
      ownerId: "p1",
      effect: { kind: "helper", id: 20, name: "Buddy", scale: { x: 1, y: 1 }, ignoreHitPause: false, pauseMoveTime: 0, superMoveTime: 0 },
    });
    expect(runtimeProjectileActorsToSnapshots(store, 200)[0]).toMatchObject({
      id: "p1-projectile-0",
      actorKind: "projectile",
      runtime: { moveType: "A" },
      effect: { kind: "projectile", id: 30, priority: 1, hitsRemaining: 1 },
    });
  });

  it("centralizes effect actor advance and removal mutations", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "10", removetime: "1" }));
    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "11", removetime: "-1" }));
    spawnRuntimeHelperActor(store, "p1", helperInput({ removetime: "1" }));
    spawnRuntimeProjectileActor(store, "p1", projectileInput({ projremove: "1" }));

    removeRuntimeExplodActors(store, 10);
    expect(store.explods.map((actor) => actor.explodId)).toEqual([11]);

    advanceRuntimeExplodActors(store);
    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } });
    markRuntimeProjectileForRemoval(store.projectiles[0]!, "hit");
    removeRuntimeProjectilesMarkedForRemoval(store);

    expect(store.explods.map((actor) => actor.explodId)).toEqual([11]);
    expect(store.helpers).toEqual([]);
    expect(store.projectiles).toEqual([]);
  });

  it("removes owner explods flagged with removeongethit", () => {
    const store = createRuntimeEffectActorStore();

    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "10", removeongethit: "1" }));
    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "11" }));

    removeRuntimeExplodActorsOnGetHit(store);

    expect(store.explods.map((actor) => actor.explodId)).toEqual([11]);
  });

  it("wraps per-fighter effect stores behind a runtime world contract", () => {
    const world = new RuntimeEffectActorWorld();
    const p1Store = world.getStore("p1");

    world.spawnHelper("p1", helperInput({ id: "20", name: '"Buddy"' }));
    world.spawnProjectile("p1", projectileInput({ projid: "30", projanim: "900", projremove: "1" }));
    markRuntimeProjectileForRemoval(world.projectiles("p1")[0]!, "hit");

    expect(world.getStore("p1")).toBe(p1Store);
    expect(world.summarize()[0]).toMatchObject({
      ownerId: "p1",
      total: 2,
      helpers: ["p1-helper-0"],
      projectiles: ["p1-projectile-0"],
      nextSerials: { helper: 1, projectile: 1 },
    });
    expect(world.helperSnapshots("p1", 200)[0]).toMatchObject({ id: "p1-helper-0", actorKind: "helper" });

    world.spawnExplod("p1", explodInput({ id: "10", removeongethit: "1" }));
    world.removeExplodsOnGetHit("p1");
    expect(world.getStore("p1").explods).toEqual([]);

    world.removeProjectilesMarkedForRemoval("p1");
    expect(world.projectiles("p1")).toEqual([]);

    world.reset();
    expect(world.getStore("p1")).toBe(p1Store);
    expect(world.summarize()[0]).toMatchObject({
      ownerId: "p1",
      total: 0,
      helpers: [],
      projectiles: [],
      nextSerials: { explod: 0, helper: 0, projectile: 0 },
    });
  });

  it("owns NumExplod, NumHelper, and NumProj trigger counts through one world query", () => {
    const world = new RuntimeEffectActorWorld();

    world.spawnExplod("p1", explodInput({ id: "9000" }));
    world.spawnExplod("p1", explodInput({ id: "9001" }));
    world.spawnHelper("p1", helperInput({ id: "42" }));
    world.spawnProjectile("p1", projectileInput({ projid: "77", projanim: "900" }));
    world.spawnProjectile("p1", projectileInput({ projid: "78", projanim: "900" }));
    const removedProjectile = world.projectiles("p1").find((projectile) => projectile.projectileId === 78)!;
    markRuntimeProjectileForRemoval(removedProjectile, "hit");

    expect(world.countActors("p1", "explod")).toBe(2);
    expect(world.countActors("p1", "explod", 9000)).toBe(1);
    expect(world.countActors("p1", "helper")).toBe(1);
    expect(world.countActors("p1", "helper", 42)).toBe(1);
    expect(world.countActors("p1", "projectile")).toBe(1);
    expect(world.countActors("p1", "projectile", 77)).toBe(1);
    expect(world.countActors("p1", "projectile", 78)).toBe(0);
  });

  it("separates active effect ticks from presentation effect ticks", () => {
    const world = new RuntimeEffectActorWorld();

    world.spawnExplod("p1", explodInput({ id: "10", removetime: "1" }));
    world.spawnHelper("p1", helperInput({ removetime: "1" }));
    world.spawnProjectile("p1", projectileInput({ velocity: "3,0" }));

    world.advanceActiveEffects("p1", { bounds: { left: -160, right: 160 } });

    expect(world.getStore("p1").helpers).toEqual([]);
    expect(world.getStore("p1").explods).toHaveLength(1);
    expect(world.projectiles("p1")[0]?.pos.x).toBe(3);

    world.advancePresentationEffects("p1");

    expect(world.getStore("p1").explods).toEqual([]);
  });

  it("resolves projectile combat and cleanup through the runtime world contract", () => {
    const world = new RuntimeEffectActorWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 1000 });
    const logs: string[] = [];
    const targets: string[] = [];

    world.spawnProjectile("p1", projectileInput({ projremove: "1", damage: "40" }));
    world.resolveProjectileCombat("p1", {
      attacker,
      defender,
      hurtBoxes: [{ x1: 0, y1: -10, x2: 20, y2: 0 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: (_attacker, target, targetId) => targets.push(`${target.id}:${targetId ?? "none"}`),
      applyHitOverride: () => {
        throw new Error("unexpected hit override");
      },
    });

    expect(defender.runtime.life).toBe(960);
    expect(defender.hitPause).toBe(6);
    expect(defender.hitStun).toBe(18);
    expect(defender.runtime.moveType).toBe("H");
    expect(attacker.runtime.power).toBe(35);
    expect(targets).toEqual(["p2:none"]);
    expect(logs).toEqual(["Attacker projectile hit Defender for 40; hits remaining 0, miss 0; hit removal anim none"]);
    expect(world.projectiles("p1")).toEqual([]);
  });

  it("keeps projectile terminal playback visible after hit removal when an AIR action exists", () => {
    const world = new RuntimeEffectActorWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 1000 });

    world.spawnProjectile("p1", {
      ...projectileInput({ projremove: "1", damage: "40", projhitanim: "901" }),
      terminalActions: { hit: action(901, 2) },
    });
    world.resolveProjectileCombat("p1", {
      attacker,
      defender,
      hurtBoxes: [{ x1: 0, y1: -10, x2: 20, y2: 0 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => {
        throw new Error("unexpected hit override");
      },
    });

    expect(world.projectiles("p1")).toHaveLength(1);
    expect(world.projectiles("p1")[0]).toMatchObject({
      animNo: 901,
      terminalPlayback: { reason: "hit", duration: 2, age: 0 },
      removalReason: "hit",
      removalAnimNo: 901,
    });
    expect(world.projectileSnapshots("p1", 200)[0]).toMatchObject({
      actorKind: "projectile",
      runtime: { animNo: 901, moveType: "I" },
      clsn1: [],
      clsn2: [],
    });

    world.advanceActiveEffects("p1", { bounds: { left: -160, right: 160 } });
    expect(world.projectiles("p1")).toHaveLength(1);
    world.advanceActiveEffects("p1", { bounds: { left: -160, right: 160 } });
    expect(world.projectiles("p1")).toEqual([]);
  });

  it("resolves projectile guard through the same combat contract", () => {
    const world = new RuntimeEffectActorWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 1000, stateType: "S" });
    const logs: string[] = [];
    let guardHitApplied = false;

    world.spawnProjectile(
      "p1",
      projectileInput({
        projremove: "1",
        damage: "40,6",
        guardflag: "MA",
        "guard.pausetime": "3,3",
        "guard.hittime": "8",
        "guard.velocity": "-4,-1",
      }),
    );
    world.resolveProjectileCombat("p1", {
      attacker,
      defender,
      hurtBoxes: [{ x1: 0, y1: -10, x2: 20, y2: 0 }],
      holdingBack: true,
      log: (line) => logs.push(line),
      rememberTarget: () => undefined,
      applyHitOverride: () => {
        throw new Error("unexpected hit override");
      },
      applyGuardHit: () => {
        guardHitApplied = true;
      },
    });

    expect(defender.runtime.life).toBe(994);
    expect(defender.hitPause).toBe(3);
    expect(defender.hitStun).toBe(0);
    expect(defender.runtime.guardStun).toBe(8);
    expect(defender.runtime.guarding).toBe(true);
    expect(defender.runtime.vel).toEqual({ x: 4, y: -1 });
    expect(attacker.runtime.power).toBe(12);
    expect(guardHitApplied).toBe(true);
    expect(logs).toEqual(["Defender guarded Attacker projectile for 6; hits remaining 0, miss 0; hit removal anim none"]);
    expect(world.projectiles("p1")).toEqual([]);
  });

  it("keeps multi-hit projectiles alive until projhits are exhausted after projmisstime", () => {
    const world = new RuntimeEffectActorWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { life: 1000 });
    const logs: string[] = [];

    world.spawnProjectile(
      "p1",
      projectileInput({
        projremove: "1",
        projhits: "2",
        projmisstime: "2",
        damage: "40",
        velocity: "0,0",
      }),
    );
    const combatInput = {
      attacker,
      defender,
      hurtBoxes: [{ x1: 0, y1: -10, x2: 20, y2: 0 }],
      holdingBack: false,
      log: (line: string) => logs.push(line),
      rememberTarget: () => undefined,
      applyHitOverride: () => {
        throw new Error("unexpected hit override");
      },
    };

    world.resolveProjectileCombat("p1", combatInput);

    expect(defender.runtime.life).toBe(960);
    expect(world.projectiles("p1")).toHaveLength(1);
    expect(world.projectiles("p1")[0]).toMatchObject({
      hitsRemaining: 1,
      missTime: 2,
      missTimeRemaining: 2,
      hasHit: false,
    });

    world.resolveProjectileCombat("p1", combatInput);
    expect(defender.runtime.life).toBe(960);
    expect(logs).toEqual(["Attacker projectile hit Defender for 40; hits remaining 1, miss 2; removal pending none"]);

    world.advanceActiveEffects("p1", { bounds: { left: -160, right: 160 } });
    expect(world.projectiles("p1")[0]?.missTimeRemaining).toBe(1);
    world.advanceActiveEffects("p1", { bounds: { left: -160, right: 160 } });
    expect(world.projectiles("p1")[0]?.missTimeRemaining).toBe(0);

    world.resolveProjectileCombat("p1", combatInput);

    expect(defender.runtime.life).toBe(920);
    expect(logs).toEqual([
      "Attacker projectile hit Defender for 40; hits remaining 1, miss 2; removal pending none",
      "Attacker projectile hit Defender for 40; hits remaining 0, miss 0; hit removal anim none",
    ]);
    expect(world.projectiles("p1")).toEqual([]);
  });

  it("trades equal-priority projectiles through the runtime world contract", () => {
    const world = new RuntimeEffectActorWorld();
    const logs: string[] = [];

    const left = world.spawnProjectile("p1", projectileInput({ projremove: "1", projpriority: "2" }));
    const right = world.spawnProjectile("p2", projectileInput({ projremove: "1", projpriority: "2" }));
    left.pos = { x: 0, y: 0 };
    left.facing = 1;
    right.pos = { x: 20, y: 0 };
    right.facing = -1;

    world.resolveProjectileClashes("p1", "p2", {
      leftLabel: "P1",
      rightLabel: "P2",
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual([
      "Projectile clash: P1 p1-projectile-0 traded with P2 p2-projectile-0 at priority 2; p1-projectile-0 cancel removal anim none; p2-projectile-0 cancel removal anim none",
    ]);
    expect(world.projectiles("p1")).toEqual([]);
    expect(world.projectiles("p2")).toEqual([]);
  });

  it("keeps the higher-priority projectile when a clash cancels the weaker one", () => {
    const world = new RuntimeEffectActorWorld();
    const logs: string[] = [];

    const left = world.spawnProjectile("p1", projectileInput({ projremove: "1", projpriority: "3" }));
    const right = world.spawnProjectile("p2", projectileInput({ projremove: "1", projpriority: "1" }));
    left.pos = { x: 0, y: 0 };
    left.facing = 1;
    right.pos = { x: 20, y: 0 };
    right.facing = -1;

    world.resolveProjectileClashes("p1", "p2", {
      leftLabel: "P1",
      rightLabel: "P2",
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual([
      "Projectile clash: P1 p1-projectile-0 canceled P2 p2-projectile-0 by priority 3 > 1; winner priority 3 -> 2; p2-projectile-0 cancel removal anim none",
    ]);
    expect(world.projectiles("p1").map((projectile) => projectile.serialId)).toEqual(["p1-projectile-0"]);
    expect(world.projectiles("p1")[0]?.hasHit).toBe(false);
    expect(world.projectiles("p1")[0]?.priority).toBe(2);
    expect(world.projectiles("p2")).toEqual([]);
  });
});

function explodInput(params: Record<string, string>) {
  return {
    controller: controller("Explod", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action: action(),
    animNo: Number(params.anim ?? 900),
    pos: { x: 0, y: 0 },
    fallbackFacing: 1 as const,
    defaultRemoveTime: 4,
  };
}

function helperInput(params: Record<string, string>) {
  return {
    controller: controller("Helper", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action: action(),
    stateNo: 6000,
    animNo: 900,
    pos: { x: 0, y: 0 },
    fallbackFacing: 1 as const,
  };
}

function projectileInput(params: Record<string, string>) {
  return {
    controller: controller("Projectile", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action: action(),
    animNo: 900,
    pos: { x: 0, y: 0 },
    fallbackFacing: 1 as const,
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function action(id = 900, duration = 2): MugenAnimationAction {
  return {
    id,
    loopStart: 0,
    rawLines: [],
    frames: [
      {
        spriteGroup: id,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration,
        clsn1: [{ x1: 1, y1: -8, x2: 16, y2: -1 }],
        clsn2: [{ x1: -8, y1: -16, x2: 8, y2: 0 }],
        raw: `${id},0,0,0,${duration}`,
        line: 1,
      },
    ],
  };
}

function actor(
  id: string,
  label: string,
  runtimeOverrides: Partial<CharacterRuntimeState> = {},
): {
  id: string;
  label: string;
  runtime: CharacterRuntimeState;
  hitPause: number;
  hitStun: number;
} {
  return {
    id,
    label,
    hitPause: 0,
    hitStun: 0,
    runtime: {
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      facing: 1,
      stateNo: 0,
      animNo: 0,
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
      ...runtimeOverrides,
    },
  };
}
