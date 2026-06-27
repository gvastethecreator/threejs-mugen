import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { resolveRuntimeProjectileClashes, resolveRuntimeProjectileCombat } from "../mugen/runtime/ProjectileCombatSystem";
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

describe("ProjectileCombatSystem", () => {
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

  it("keeps the higher-priority projectile active while removing the lower-priority clash loser", () => {
    let leftProjectiles = [
      projectile({ serialId: "p1-projectile-0", ownerId: "p1", priority: 3, pos: { x: 0, y: 0 }, facing: 1 }),
    ];
    let rightProjectiles = [
      projectile({
        serialId: "p2-projectile-0",
        ownerId: "p2",
        priority: 1,
        pos: { x: 40, y: 0 },
        facing: -1,
        cancelAnimNo: 920,
      }),
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
      "Projectile clash: P1 p1-projectile-0 canceled P2 p2-projectile-0 by priority 3 > 1; winner priority 3 -> 2; p2-projectile-0 cancel removal anim 920",
    ]);
    expect(leftProjectiles.map((entry) => entry.serialId)).toEqual(["p1-projectile-0"]);
    expect(leftProjectiles[0]?.hasHit).toBe(false);
    expect(leftProjectiles[0]?.priority).toBe(2);
    expect(rightProjectiles[0]).toBeUndefined();
    expect(rightProjectiles).toEqual([]);
  });

  it("degrades a winning projectile before resolving later same-tick clashes", () => {
    let leftProjectiles = [projectile({ serialId: "p1-projectile-0", ownerId: "p1", priority: 3, pos: { x: 0, y: 0 }, facing: 1 })];
    let rightProjectiles = [
      projectile({ serialId: "p2-projectile-0", ownerId: "p2", priority: 1, pos: { x: 40, y: 0 }, facing: -1 }),
      projectile({ serialId: "p2-projectile-1", ownerId: "p2", priority: 2, pos: { x: 40, y: 0 }, facing: -1 }),
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
    attr: "S,SP",
    targetId: 77,
    hitPause: 4,
    hitStun: 13,
    push: 5,
    guardDamage: 4,
    guardDistance: 120,
    guardFlag: "MA",
    guardPause: 3,
    guardStun: 8,
    guardPush: 2,
    hitbox: { x1: 6, y1: -18, x2: 34, y2: 6 },
    removeOnHit: true,
    hasHit: false,
    ...overrides,
    terminalActions: overrides.terminalActions ?? {},
  };
}
