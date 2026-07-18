import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import {
  resolveRuntimeProjectileClashes,
  resolveRuntimeProjectileCombat,
  RuntimeProjectileCombatWorld,
} from "../mugen/runtime/ProjectileCombatSystem";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

const action: MugenAnimationAction = {
  id: 910,
  rawLines: ["[Begin Action 910]"],
  frames: [
    {
      spriteGroup: 910,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 4,
      clsn1: [{ x1: 6, y1: -18, x2: 34, y2: 6 }],
      clsn2: [],
      raw: "910,0,0,0,4",
      line: 1,
    },
  ],
};

const projTypeCollisionAction: MugenAnimationAction = {
  ...action,
  frames: [{
    ...action.frames[0],
    clsn1: [],
    clsn2: [{ x1: 6, y1: -18, x2: 34, y2: 6 }],
  }],
};

const projectileTradeAction: MugenAnimationAction = {
  ...action,
  frames: [{
    ...action.frames[0],
    clsn2: [{ x1: 6, y1: -18, x2: 34, y2: 6 }],
  }],
};

describe("ProjectileCombatSystem", () => {
  it("rejects separated projectile/player depth and admits touching depth edges", () => {
    let separated = [projectile({ pos: { x: 0, y: 0, z: 20 } })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const separatedDefender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender: separatedDefender,
      projectiles: separated,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        separated = separated.filter((entry) => !entry.removalReason);
      },
    });

    expect(separatedDefender.runtime.life).toBe(1000);
    expect(separated[0]?.hasHit).toBe(false);

    let touching = [projectile({ pos: { x: 0, y: 0, z: 7 } })];
    const touchingDefender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    }));
    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender: touchingDefender,
      projectiles: touching,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        touching = touching.filter((entry) => !entry.removalReason);
      },
    });

    expect(touchingDefender.runtime.life).toBe(969);
    expect(touching).toEqual([]);
  });

  it("applies the same depth admission to helper-parented root-store projectiles", () => {
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    }));
    let separated = [projectile({
      parentId: "p1-helper-0",
      rootId: "p1",
      pos: { x: 0, y: 0, z: 20 },
    })];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles: separated,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        separated = separated.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(1000);
    expect(separated[0]?.parentId).toBe("p1-helper-0");
    expect(separated[0]?.removalReason).toBeUndefined();

    let touching = [projectile({
      serialId: "helper-projectile-1",
      parentId: "p1-helper-0",
      rootId: "p1",
      pos: { x: 0, y: 0, z: 7 },
    })];
    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles: touching,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        touching = touching.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(969);
    expect(touching).toEqual([]);
  });

  it("applies projectile depth to HitFlag P cancellation", () => {
    let projectiles = [projectile({ action: projectileTradeAction, pos: { x: 0, y: 0, z: 20 } })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    }));
    let cancellations = 0;

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      projectileDefense: {
        collisionBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        attackDepth: [4, 4],
        onCancel: () => cancellations++,
      },
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(cancellations).toBe(0);
    expect(projectiles[0]?.hasHit).toBe(false);
    expect(projectiles[0]?.removalReason).toBeUndefined();
  });

  it("requires projectile depth overlap before current-frame Clsn2 trade", () => {
    let separatedLeft = [projectile({ action: projectileTradeAction, ownerId: "p1", pos: { x: 0, y: 0, z: 20 } })];
    let separatedRight = [projectile({ action: projectileTradeAction, ownerId: "p2", pos: { x: 40, y: 0, z: 0 }, facing: -1 })];
    resolveRuntimeProjectileClashes({
      leftLabel: "P1",
      rightLabel: "P2",
      leftProjectiles: separatedLeft,
      rightProjectiles: separatedRight,
      log: () => undefined,
      removeProjectilesMarkedForRemoval: () => undefined,
    });
    expect(separatedLeft[0]?.removalReason).toBeUndefined();
    expect(separatedRight[0]?.removalReason).toBeUndefined();

    let touchingLeft = [projectile({ action: projectileTradeAction, ownerId: "p1", pos: { x: 0, y: 0, z: 0 } })];
    let touchingRight = [projectile({ action: projectileTradeAction, ownerId: "p2", pos: { x: 40, y: 0, z: 8 }, facing: -1 })];
    resolveRuntimeProjectileClashes({
      leftLabel: "P1",
      rightLabel: "P2",
      leftProjectiles: touchingLeft,
      rightProjectiles: touchingRight,
      log: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        touchingLeft = touchingLeft.filter((entry) => !entry.removalReason);
        touchingRight = touchingRight.filter((entry) => !entry.removalReason);
      },
    });
    expect(touchingLeft).toEqual([]);
    expect(touchingRight).toEqual([]);
  });

  it("uses strict current-frame Clsn2 boxes when projectile collision mode is enabled", () => {
    let projectiles = [projectile({ action: projTypeCollisionAction, hitbox: { x1: 100, y1: -18, x2: 120, y2: 6 } })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      projectileCollisionMode: true,
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(969);
    expect(projectiles).toEqual([]);
  });

  it("fails closed when projectile collision mode has no current-frame Clsn2", () => {
    let projectiles = [projectile({ hitbox: { x1: 6, y1: -18, x2: 34, y2: 6 } })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      projectileCollisionMode: true,
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(1000);
    expect(projectiles).toHaveLength(1);
  });

  it("enforces explicit projectile HitFlags through shared player admission", () => {
    const resolve = (
      hitFlag: string,
      defenderOverrides: Partial<CharacterRuntimeState> = {},
      attackerOverrides: Partial<CharacterRuntimeState> = {},
    ) => {
      let projectiles = [projectile({ hitFlag, removeOnHit: true })];
      const attacker = actor("p1", "P1", runtimeState(attackerOverrides));
      const defender = actor("p2", "P2", runtimeState({ life: 1000, ...defenderOverrides }));
      const logs: string[] = [];
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack: false,
        log: (line) => logs.push(line),
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return { defender, logs, projectiles };
    };

    const stateMismatch = resolve("L");
    expect(stateMismatch.defender.runtime.life).toBe(1000);
    expect(stateMismatch.logs).toEqual(["P2 rejected P1 projectile S,SP via HitFlag state type"]);
    expect(stateMismatch.projectiles).toHaveLength(1);

    const minusGetHit = resolve("H-", { moveType: "H", stateNo: 5000 });
    expect(minusGetHit.defender.runtime.life).toBe(1000);
    expect(minusGetHit.logs).toEqual(["P2 rejected P1 projectile S,SP via HitFlag -"]);

    const plusIdle = resolve("H+");
    expect(plusIdle.defender.runtime.life).toBe(1000);
    expect(plusIdle.logs).toEqual(["P2 rejected P1 projectile S,SP via HitFlag +"]);

    const allowedStanding = resolve("H");
    expect(allowedStanding.defender.runtime.life).toBe(969);
    expect(allowedStanding.logs).toHaveLength(1);
    expect(allowedStanding.projectiles).toEqual([]);

    const falling = resolve("H", {
      moveType: "H",
      hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } },
    });
    expect(falling.defender.runtime.life).toBe(1000);
    expect(falling.logs).toEqual(["P2 rejected P1 projectile S,SP via fall HitFlag/NoFallHitFlag"]);

    const noFallHitFlag = resolve(
      "H",
      { moveType: "H", hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } } },
      { assertSpecial: { flags: [], globalFlags: [], noFallHitFlag: true } },
    );
    expect(noFallHitFlag.defender.runtime.life).toBe(1000);
    expect(noFallHitFlag.logs).toEqual(["P2 rejected P1 projectile S,SP via fall HitFlag/NoFallHitFlag"]);
    expect(noFallHitFlag.projectiles).toHaveLength(1);
  });

  it("selects the target Clsn1 box for an explicit projectile p2clsncheck", () => {
    let projectiles = [projectile({ p2ClsnCheck: "clsn1" })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: 120, y1: -24, x2: 140, y2: 12 }],
      getTargetCollisionBoxes: (_target, boxType) =>
        boxType === "clsn1" ? [{ x1: -24, y1: -24, x2: 24, y2: 12 }] : [],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(969);
    expect(projectiles).toEqual([]);
  });

  it("fails closed when projectile p2clsnrequire finds no required target box", () => {
    let projectiles = [projectile({ p2ClsnRequire: "size" })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      getTargetCollisionBoxes: (_target, boxType) => (boxType === "size" ? [] : [{ x1: -24, y1: -24, x2: 24, y2: 12 }]),
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(1000);
    expect(projectiles).toHaveLength(1);
  });

  it("cancels overlapping projectiles through projectile defense without damage", () => {
    let projectiles = [projectile({ action: projTypeCollisionAction })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));
    const canceled: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      projectileDefense: {
        collisionBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        onCancel: (entry) => canceled.push(entry.serialId),
      },
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(1000);
    expect(canceled).toEqual(["projectile-0"]);
    expect(projectiles).toEqual([]);
  });

  it("applies the defending HitFlag P AffectTeam policy independently from projectile admission", () => {
    const attacker = actor("p2", "P2", runtimeState({ pos: { x: 0, y: 0 }, facing: -1 }));
    const defender = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, life: 1000 }));
    const collisionBoxes = [{ x1: -24, y1: -24, x2: 24, y2: 12 }];
    let canceledProjectiles = [projectile({ action: projTypeCollisionAction, ownerId: "p2", teamSide: 2, affectTeam: 1 })];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles: canceledProjectiles,
      hurtBoxes: collisionBoxes,
      projectileDefense: { collisionBoxes, teamSide: 1, affectTeam: 1 },
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        canceledProjectiles = canceledProjectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(1000);
    expect(canceledProjectiles).toEqual([]);

    const friendlyOnlyDefense = [projectile({ ownerId: "p2", teamSide: 2, affectTeam: 1 })];
    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles: friendlyOnlyDefense,
      hurtBoxes: collisionBoxes,
      projectileDefense: { collisionBoxes, teamSide: 1, affectTeam: -1 },
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => undefined,
    });

    expect(defender.runtime.life).toBe(969);
  });

  it("owns bounded projectile hit mutation behind RuntimeProjectileCombatWorld", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, damage: 42, targetId: 78, chainId: 43, hitDefHitCount: 3 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1, power: 10, powerMax: 40 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));
    const logs: string[] = [];
    const targets: string[] = [];
    const effects: string[] = [];
    let receivedDamage = 0;
    const world = new RuntimeProjectileCombatWorld();

    world.resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: (_attacker, target, targetId) => targets.push(`${target.id}:${targetId ?? "none"}`),
      emitProjectileContactEffects: (source, target, entry, kind) => effects.push(`${source.id}:${target.id}:${entry.serialId}:${kind}`),
      applyHitOverride: () => {
        throw new Error("unexpected hit override");
      },
      recordReceivedDamage: (target, damage) => {
        expect(target.id).toBe("p2");
        receivedDamage = damage;
      },
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(958);
    expect(defender.hitPause).toBe(4);
    expect(defender.hitStun).toBe(13);
    expect(defender.runtime.moveType).toBe("H");
    expect(defender.runtime.hitVars).toMatchObject({ damage: 42, hitId: 78, chainId: 43, hitCount: 3 });
    expect(receivedDamage).toBe(42);
    expect(attacker.runtime.power).toBe(40);
    expect(targets).toEqual(["p2:78"]);
    expect(effects).toEqual(["p1:p2:projectile-0:hit"]);
    expect(logs).toEqual(["P1 projectile hit P2 for 42; hits remaining 0, miss 0; hit removal anim none"]);
    expect(projectiles).toEqual([]);
  });

  it("routes projectile guard power and control through runtime resource bounds", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, guardDamage: 4 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1, power: 2990 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000, ctrl: true }));
    const logs: string[] = [];
    const effects: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: true,
      log: (line) => logs.push(line),
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      emitProjectileContactEffects: (source, target, entry, kind) => effects.push(`${source.id}:${target.id}:${entry.serialId}:${kind}`),
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(996);
    expect(defender.runtime.ctrl).toBe(false);
    expect(defender.runtime.guarding).toBe(true);
    expect(defender.runtime.hitVars).toEqual({
      damage: 4,
      kill: true,
      hitId: 77,
      hitCount: 1,
      animType: 0,
      groundType: 1,
      airType: 1,
      isBound: false,
      hitShakeTime: 3,
      hitTime: 8,
      guarded: true,
    });
    expect(attacker.runtime.power).toBe(3000);
    expect(effects).toEqual(["p1:p2:projectile-0:guard"]);
    expect(logs).toEqual(["P2 guarded P1 projectile for 4; hits remaining 0, miss 0; hit removal anim none"]);
    expect(projectiles).toEqual([]);
  });

  it("routes projectile guard.kill into bounded guard damage and hit vars", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, guardDamage: 11, guardKill: false })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 8 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: true,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(1);
    expect(defender.runtime.hitVars).toMatchObject({
      damage: 11,
      kill: false,
      guarded: true,
    });
    expect(projectiles).toEqual([]);
  });

  it("rejects projectile contact while SuperPause unhittable protects the defender", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, damage: 42 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));
    const logs: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      canDefenderBeHit: () => false,
      log: (line) => logs.push(line),
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(1000);
    expect(projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
    expect(logs).toEqual(["P2 rejected P1 projectile S,SP via SuperPause unhittable"]);
  });

  it("checks projectile reversal before SuperPause and HitOverride rejection paths", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, damage: 42 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      hitOverrides: [{ slot: 1, attr: "S,SP", stateNo: 777, remaining: 30 }],
    }));
    const calls: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      canDefenderBeHit: () => false,
      log: (line) => calls.push(`log:${line}`),
      rememberTarget: () => calls.push("target"),
      applyHitOverride: () => calls.push("override"),
      applyProjectileReversal: (_source, _target, entry, attackBox) => {
        calls.push(`reversal:${entry.serialId}:${attackBox.x1},${attackBox.y1},${attackBox.x2},${attackBox.y2}`);
        return true;
      },
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(calls).toEqual(["reversal:projectile-0:6,-18,34,6"]);
    expect(defender.runtime.life).toBe(1000);
    expect(projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
  });

  it("applies guarded Projectile cornerpush to the owner at stage bounds", () => {
    let projectiles = [projectile({ pos: { x: 260, y: 0 }, facing: 1, guardDamage: 0, guardPush: 8, guardCornerPush: 6 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 220, y: 0 }, facing: 1, vel: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 286, y: 0 },
      facing: -1,
      vel: { x: 0, y: 0 },
      bodyWidth: { front: 39, back: 39 },
    }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: true,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
      stageBounds: { left: -320, right: 320 },
    });

    expect(defender.runtime.vel.x).toBe(8);
    expect(attacker.runtime.vel.x).toBe(-6);
  });

  it("owns bounded projectile clash mutation behind RuntimeProjectileCombatWorld", () => {
    let leftProjectiles = [
      projectile({ action: projectileTradeAction, serialId: "p1-projectile-0", ownerId: "p1", priority: 5, pos: { x: 0, y: 0 }, facing: 1 }),
    ];
    let rightProjectiles = [
      projectile({ action: projectileTradeAction, serialId: "p2-projectile-0", ownerId: "p2", priority: 5, pos: { x: 40, y: 0 }, facing: -1 }),
    ];
    const logs: string[] = [];
    const cancels: string[] = [];
    const world = new RuntimeProjectileCombatWorld();

    world.resolveClashes({
      leftLabel: "P1",
      rightLabel: "P2",
      leftProjectiles,
      rightProjectiles,
      log: (line) => logs.push(line),
      recordProjectileCancel: (entry) => cancels.push(`${entry.ownerId}:${entry.projectileId}:${entry.lastCancelTime}`),
      removeProjectilesMarkedForRemoval: () => {
        leftProjectiles = leftProjectiles.filter((entry) => !entry.hasHit || !entry.removeOnHit);
        rightProjectiles = rightProjectiles.filter((entry) => !entry.hasHit || !entry.removeOnHit);
      },
    });

    expect(logs).toEqual([
      "Projectile clash: P1 p1-projectile-0 traded with P2 p2-projectile-0 at priority 5; p1-projectile-0 cancel removal anim none; p2-projectile-0 cancel removal anim none",
    ]);
    expect(cancels).toEqual(["p1:77:0", "p2:77:0"]);
    expect(leftProjectiles).toEqual([]);
    expect(rightProjectiles).toEqual([]);
  });

  it("fails projectile trade admission without strict current-frame Clsn2 boxes", () => {
    let leftProjectiles = [projectile({ serialId: "p1-projectile-0", ownerId: "p1", pos: { x: 0, y: 0 }, facing: 1 })];
    let rightProjectiles = [projectile({ serialId: "p2-projectile-0", ownerId: "p2", pos: { x: 40, y: 0 }, facing: -1 })];

    new RuntimeProjectileCombatWorld().resolveClashes({
      leftLabel: "P1",
      rightLabel: "P2",
      leftProjectiles,
      rightProjectiles,
      log: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        leftProjectiles = leftProjectiles.filter((entry) => !entry.removalReason);
        rightProjectiles = rightProjectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(leftProjectiles).toHaveLength(1);
    expect(rightProjectiles).toHaveLength(1);
  });

  it("allows an explicit opposite-side Projectile to hit its owner", () => {
    let projectiles = [projectile({ teamSide: 2, damage: 42, pos: { x: 0, y: 0 } })];
    const fighter = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker: fighter,
      defender: fighter,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(fighter.runtime.life).toBe(958);
    expect(projectiles).toEqual([]);
  });

  it("keeps ordinary same-owner Projectiles from self-contact", () => {
    const projectiles = [projectile({ teamSide: 1, pos: { x: 0, y: 0 } })];
    const fighter = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker: fighter,
      defender: fighter,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => undefined,
    });

    expect(fighter.runtime.life).toBe(1000);
    expect(projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
  });

  it.each([
    ["enemy-only", 1, false],
    ["both-teams", 0, true],
    ["friendly-only", -1, true],
  ] as const)("applies Projectile AffectTeam %s against a same-side target", (_label, affectTeam, shouldHit) => {
    let projectiles = [projectile({ affectTeam, teamSide: 1, damage: 42, pos: { x: 0, y: 0 } })];
    const fighter = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker: fighter,
      defender: fighter,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(fighter.runtime.life).toBe(shouldHit ? 958 : 1000);
  });

  it("clashes overlapping same-owner Projectiles when one opts into the opposite side", () => {
    let projectiles = [
      projectile({ action: projectileTradeAction, serialId: "p1-projectile-0", ownerId: "p1", teamSide: 2, priority: 5 }),
      projectile({ action: projectileTradeAction, serialId: "p1-projectile-1", ownerId: "p1", teamSide: 1, priority: 5 }),
    ];
    const logs: string[] = [];
    const cancels: string[] = [];

    new RuntimeProjectileCombatWorld().resolveClashes({
      leftLabel: "P1",
      rightLabel: "P1",
      leftProjectiles: projectiles,
      rightProjectiles: projectiles,
      log: (line) => logs.push(line),
      recordProjectileCancel: (entry) => cancels.push(entry.serialId),
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(cancels).toEqual(["p1-projectile-0", "p1-projectile-1"]);
    expect(logs).toEqual([
      "Projectile clash: P1 p1-projectile-0 traded with P1 p1-projectile-1 at priority 5; p1-projectile-0 cancel removal anim none; p1-projectile-1 cancel removal anim none",
    ]);
    expect(projectiles).toEqual([]);
  });

  it("rejects same-side Projectile clashes unless both projectiles admit that team", () => {
    let projectiles = [
      projectile({ action: projectileTradeAction, serialId: "p1-projectile-0", ownerId: "p1", teamSide: 1, affectTeam: 1, priority: 5 }),
      projectile({ action: projectileTradeAction, serialId: "p1-projectile-1", ownerId: "p1", teamSide: 1, affectTeam: -1, priority: 5 }),
    ];

    new RuntimeProjectileCombatWorld().resolveClashes({
      leftLabel: "P1",
      rightLabel: "P1",
      leftProjectiles: projectiles,
      rightProjectiles: projectiles,
      log: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(projectiles).toHaveLength(2);
    expect(projectiles.every((entry) => !entry.removalReason)).toBe(true);
  });

  it("routes projectile get-hit through an owner callback when provided", () => {
    const projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1, moveType: "A" }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1 }));
    const marked: string[] = [];

    resolveRuntimeProjectileCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      markDefenderGotHit: (target) => {
        marked.push(target.id);
        target.runtime.moveType = "H";
      },
      removeProjectilesMarkedForRemoval: () => undefined,
    });

    expect(marked).toEqual(["p2"]);
    expect(defender.runtime.moveType).toBe("H");
    expect(projectiles[0]).toMatchObject({ hasHit: true, hitsRemaining: 0 });
  });

  it("lets Projectile p2stateno route through HitOverride instead of custom-state miss", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, p2StateNo: 889, p2GetP1State: false })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      hitOverrides: [{ slot: 1, attr: "S,SP", stateNo: 777, remaining: 30 }],
    }));
    const logs: string[] = [];
    const transitions: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: (_attacker, target, targetId) => transitions.push(`target:${target.id}:${targetId ?? "none"}`),
      applyHitOverride: (_source, target, override, _hitPause, logger) => {
        transitions.push(`override:${target.id}:${override.stateNo}`);
        target.runtime.stateNo = override.stateNo ?? target.runtime.stateNo;
        logger(`override:${override.slot}:${override.stateNo}`);
      },
      applyHitState: (_source, target, entry) => {
        transitions.push(`custom:${target.id}:${entry.p2StateNo ?? "none"}`);
      },
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(transitions).toEqual(["target:p2:77", "override:p2:777"]);
    expect(defender.runtime.stateNo).toBe(777);
    expect(defender.runtime.life).toBe(1000);
    expect(logs).toEqual(["override:1:777"]);
    expect(projectiles).toEqual([]);
  });

  it("filters Projectile HitOverride slots by incoming guard flags before slot priority", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, guardFlag: "H" })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      hitOverrides: [
        { slot: 1, attr: "S,SP", stateNo: 776, remaining: 30, guardFlagNot: "HA" },
        { slot: 2, attr: "S,SP", stateNo: 778, remaining: 30, guardFlag: "A" },
        { slot: 5, attr: "S,SP", stateNo: 779, remaining: 30, guardFlag: "H" },
      ],
    }));
    const transitions: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: (_attacker, target, targetId) => transitions.push(`target:${target.id}:${targetId ?? "none"}`),
      applyHitOverride: (_source, target, override) => {
        transitions.push(`override:${target.id}:${override.stateNo}:${override.slot}`);
        target.runtime.stateNo = override.stateNo ?? target.runtime.stateNo;
      },
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(transitions).toEqual(["target:p2:77", "override:p2:779:5"]);
    expect(defender.runtime.stateNo).toBe(779);
    expect(defender.runtime.life).toBe(1000);
    expect(projectiles).toEqual([]);
  });

  it("lets explicit Projectile missonoverride one reject before HitOverride target memory", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, missOnOverride: true })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      hitOverrides: [{ slot: 1, attr: "S,SP", stateNo: 777, remaining: 30 }],
    }));
    const logs: string[] = [];
    const transitions: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: (_attacker, target, targetId) => transitions.push(`target:${target.id}:${targetId ?? "none"}`),
      applyHitOverride: () => {
        throw new Error("unexpected hit override");
      },
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(transitions).toEqual([]);
    expect(defender.runtime.stateNo).toBe(0);
    expect(defender.runtime.life).toBe(1000);
    expect(logs).toEqual(["P2 rejected P1 projectile S,SP because missonoverride = 1 forces active override miss"]);
    expect(projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
    expect(projectiles[0]?.removalReason).toBeUndefined();
  });

  it("keeps the higher-priority projectile active while removing the lower-priority clash loser", () => {
    let leftProjectiles = [
      projectile({ action: projectileTradeAction, serialId: "p1-projectile-0", ownerId: "p1", priority: 3, pos: { x: 0, y: 0 }, facing: 1 }),
    ];
    let rightProjectiles = [
      projectile({
        action: projectileTradeAction,
        serialId: "p2-projectile-0",
        ownerId: "p2",
        priority: 1,
        pos: { x: 40, y: 0 },
        facing: -1,
        cancelAnimNo: 920,
      }),
    ];
    const logs: string[] = [];
    const cancels: string[] = [];

    resolveRuntimeProjectileClashes({
      leftLabel: "P1",
      rightLabel: "P2",
      leftProjectiles,
      rightProjectiles,
      log: (line) => logs.push(line),
      recordProjectileCancel: (entry) => cancels.push(`${entry.ownerId}:${entry.projectileId}:${entry.lastCancelTime}`),
      removeProjectilesMarkedForRemoval: () => {
        leftProjectiles = leftProjectiles.filter((entry) => !entry.hasHit || !entry.removeOnHit);
        rightProjectiles = rightProjectiles.filter((entry) => !entry.hasHit || !entry.removeOnHit);
      },
    });

    expect(logs).toEqual([
      "Projectile clash: P1 p1-projectile-0 canceled P2 p2-projectile-0 by priority 3 > 1; winner priority 3 -> 2; p2-projectile-0 cancel removal anim 920",
    ]);
    expect(cancels).toEqual(["p2:77:0"]);
    expect(leftProjectiles.map((entry) => entry.serialId)).toEqual(["p1-projectile-0"]);
    expect(leftProjectiles[0]?.hasHit).toBe(false);
    expect(leftProjectiles[0]?.priority).toBe(2);
    expect(rightProjectiles[0]).toBeUndefined();
    expect(rightProjectiles).toEqual([]);
  });

  it("degrades a winning projectile before resolving later same-tick clashes", () => {
    let leftProjectiles = [projectile({ action: projectileTradeAction, serialId: "p1-projectile-0", ownerId: "p1", priority: 3, pos: { x: 0, y: 0 }, facing: 1 })];
    let rightProjectiles = [
      projectile({ action: projectileTradeAction, serialId: "p2-projectile-0", ownerId: "p2", priority: 1, pos: { x: 40, y: 0 }, facing: -1 }),
      projectile({ action: projectileTradeAction, serialId: "p2-projectile-1", ownerId: "p2", priority: 2, pos: { x: 40, y: 0 }, facing: -1 }),
    ];
    const logs: string[] = [];

    resolveRuntimeProjectileClashes({
      leftLabel: "P1",
      rightLabel: "P2",
      leftProjectiles,
      rightProjectiles,
      log: (line) => logs.push(line),
      removeProjectilesMarkedForRemoval: () => {
        leftProjectiles = leftProjectiles.filter((entry) => !entry.hasHit || !entry.removeOnHit);
        rightProjectiles = rightProjectiles.filter((entry) => !entry.hasHit || !entry.removeOnHit);
      },
    });

    expect(logs).toEqual([
      "Projectile clash: P1 p1-projectile-0 canceled P2 p2-projectile-0 by priority 3 > 1; winner priority 3 -> 2; p2-projectile-0 cancel removal anim none",
      "Projectile clash: P1 p1-projectile-0 traded with P2 p2-projectile-1 at priority 2; p1-projectile-0 cancel removal anim none; p2-projectile-1 cancel removal anim none",
    ]);
    expect(leftProjectiles).toEqual([]);
    expect(rightProjectiles).toEqual([]);
  });
});

function actor(id: string, label: string, runtime: CharacterRuntimeState) {
  return {
    id,
    label,
    runtime,
    hitPause: 0,
    hitStun: 0,
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
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
    vars: Array.from({ length: 60 }, () => 0),
    fvars: Array.from({ length: 40 }, () => 0),
    ...overrides,
  };
}

function projectile(overrides: Partial<RuntimeProjectile> = {}): RuntimeProjectile {
  return {
    serialId: "projectile-0",
    projectileId: 77,
    actorKind: "projectile",
    ownerId: "p1",
    rootId: overrides.ownerId ?? "p1",
    parentId: overrides.ownerId ?? "p1",
    spriteOwnerId: overrides.ownerId ?? "p1",
    spriteOwnerDefinitionId: "trace",
    spriteOwnerLabel: "Trace Fighter",
    action,
    animNo: 910,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    accel: { x: 0, y: 0 },
    velMul: { x: 1, y: 1 },
    scale: { x: 1, y: 1 },
    facing: 1,
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    removeTime: 24,
    spritePriority: 7,
    priority: 1,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    opacity: 1,
    damage: 31,
    kill: true,
    attr: "S,SP",
    targetId: 77,
    hitPause: 4,
    hitStun: 13,
    push: 5,
    guardDamage: 4,
    guardKill: true,
    guardDistance: 120,
    guardFlag: "MA",
    guardPause: 3,
    guardStun: 8,
    guardPush: 2,
    hitbox: { x1: 6, y1: -18, x2: 34, y2: 6 },
    removeOnHit: true,
    hasHit: false,
    ...overrides,
    stageBound: overrides.stageBound ?? 240,
    terminalActions: overrides.terminalActions ?? {},
  };
}
