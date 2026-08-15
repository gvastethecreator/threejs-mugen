import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import {
  consumeRuntimeProjectileHitFacing,
  resolveRuntimeProjectileClashes,
  resolveRuntimeProjectileCombat,
  RuntimeProjectileCombatWorld,
} from "../mugen/runtime/ProjectileCombatSystem";
import { runtimeHitVar } from "../mugen/runtime/RuntimeExpressionContextSystem";
import { modifyRuntimeProjectiles, type RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import type { CharacterRuntimeState, RuntimePaletteFxPayload, RuntimePaletteFxState } from "../mugen/runtime/types";

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

  it("applies Projectile contact PalFX only on accepted unguarded hits", () => {
    const paletteFx: RuntimePaletteFxPayload = { time: 7, add: [9, -3, 1], mul: [210, 220, 230], color: 180, invert: true };
    const run = (holdingBack: boolean, existing?: CharacterRuntimeState["paletteFx"]) => {
      let projectiles = [projectile({ paletteFx })];
      const attacker = actor("p1", "P1", runtimeState());
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        facing: -1,
        ...(existing === undefined ? {} : { paletteFx: existing }),
      }));
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return defender.runtime.paletteFx;
    };

    expect(run(false)).toEqual({ remaining: 7, ...paletteFx });
    const existing: RuntimePaletteFxState = { remaining: 3, time: 3, add: [1, 1, 1], mul: [256, 256, 256], color: 256, invert: false };
    expect(run(true, existing)).toEqual(existing);
  });

  it("uses modified Projectile attack.depth for later contact admission", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0, z: 20 }, attackDepth: [4, 4] })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    }));

    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "attack.depth": "17" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]?.attackDepth).toEqual([17, 0]);

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.life).toBe(969);
    expect(projectiles).toEqual([]);
  });

  it("uses component-wise modified Projectile ground.velocity on later grounded contact", () => {
    let projectiles = [projectile({
      push: 3,
      hitVelocityY: -2,
      hitVelocityZ: 0.5,
      hitVelocities: { ground: { x: -3, y: -2, z: 0.5 } },
    })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "ground.velocity": "n,-7,2" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]).toMatchObject({
      push: 3,
      hitVelocityY: -7,
      hitVelocityZ: 2,
      hitVelocities: { ground: { x: -3, y: -7, z: 2 } },
    });
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.vel).toMatchObject({ x: 3, y: -7 });
    expect(defender.runtime.hitVelocity).toEqual({ x: 3, y: -7, z: 2 });
    expect(defender.runtime.combatDepth?.velocity).toBe(2);
  });

  it("exposes modified Projectile ground.slidetime only on later unguarded contact", () => {
    const resolve = (holdingBack: boolean): number | undefined => {
      let projectiles = [projectile({ groundSlideTime: 5, guardSlideTime: 9 })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: { id: "77", "ground.slidetime": "37" },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return runtimeHitVar(defender.runtime, "slidetime");
    };

    expect(resolve(false)).toBe(37);
    expect(resolve(true)).toBe(9);
  });

  it("uses modified Projectile pause pairs for Projectile and defender without pausing the owner", () => {
    const resolve = (holdingBack: boolean) => {
      let projectiles = [projectile({ removeOnHit: false })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: { id: "77", pausetime: "2,7", "guard.pausetime": "3,9" },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      return { attacker, defender, projectile: projectiles[0]! };
    };

    const hit = resolve(false);
    expect(hit.attacker.hitPause).toBe(0);
    expect(hit.defender.hitPause).toBe(7);
    expect(hit.projectile.hitPauseRemaining).toBe(2);
    expect(runtimeHitVar(hit.defender.runtime, "hitshaketime")).toBe(7);

    const guard = resolve(true);
    expect(guard.attacker.hitPause).toBe(0);
    expect(guard.defender.hitPause).toBe(9);
    expect(guard.projectile.hitPauseRemaining).toBe(3);
    expect(runtimeHitVar(guard.defender.runtime, "hitshaketime")).toBe(9);
  });

  it("carries projectile down.bounce and fall metadata into the hit-fall runtime", () => {
    let projectiles = [projectile({
      downBounce: true,
      fall: { enabled: false, yVelocity: -6 },
    })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", fall: "1", "down.bounce": "0" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitFall).toMatchObject({
      falling: true,
      downBounce: false,
      recover: true,
      recoverTime: 4,
      velocity: { y: -6 },
    });
  });

  it("applies modified projectile forcenofall on hit without changing guard fall metadata", () => {
    const resolve = (holdingBack: boolean) => {
      let projectiles = [projectile({
        fall: { enabled: true, yVelocity: -6 },
        forceNoFall: false,
      })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: { id: "77", forcenofall: "1" },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        life: 1000,
        hitFall: { falling: true, damage: 4, velocity: { y: -2 } },
      }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return defender.runtime.hitFall;
    };

    expect(resolve(false)).toMatchObject({ falling: false, velocity: { y: -6 } });
    expect(resolve(true)).toMatchObject({ falling: true, damage: 4, velocity: { y: -2 } });
  });

  it("does not enter the forced Projectile hit-posture path on guard contact", () => {
    let projectiles = [projectile({ forceCrouch: true })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));
    let guardCalls = 0;
    let hitStateCalls = 0;

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: true,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      applyGuardHit: () => {
        guardCalls += 1;
      },
      applyHitState: () => {
        hitStateCalls += 1;
      },
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(guardCalls).toBe(1);
    expect(hitStateCalls).toBe(0);
  });

  it("exposes modified projectile point metadata and applies guardpoints only on guard", () => {
    const resolve = (holdingBack: boolean) => {
      let projectiles = [projectile({ dizzyPoints: 1, guardPoints: 2 })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: { id: "77", dizzypoints: "23", guardpoints: "17" },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        life: 1000,
        dizzyPoints: 91,
        guardPoints: 92,
      }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return defender.runtime;
    };

    const hitState = resolve(false);
    const guardState = resolve(true);
    expect(runtimeHitVar(hitState, "dizzypoints")).toBe(23);
    expect(runtimeHitVar(hitState, "guardpoints")).toBe(17);
    expect(hitState.dizzyPoints).toBe(114);
    expect(runtimeHitVar(guardState, "dizzypoints")).toBe(23);
    expect(runtimeHitVar(guardState, "guardpoints")).toBe(17);
    expect(guardState.dizzyPoints).toBe(91);
    expect(hitState.guardPoints).toBe(92);
    expect(guardState.guardPoints).toBe(109);
  });

  it("applies projectile down.velocity X to a lying defender", () => {
    let projectiles = [projectile({ downVelocityX: 4 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType: "L", life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.vel.x).toBe(-4);
    expect(defender.runtime.hitVelocity?.x).toBe(-4);
  });

  it("applies projectile air.fall only to an airborne defender", () => {
    const resolve = (stateType: "S" | "A") => {
      let projectiles = [projectile({ fall: { enabled: false, airFall: false } })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: { id: "77", "air.fall": "1" },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType, life: 1000 }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
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
      return defender;
    };

    expect(resolve("S").runtime.hitFall).toMatchObject({ falling: false });
    expect(resolve("A").runtime.hitFall).toMatchObject({ falling: true, recover: true, recoverTime: 4 });
  });

  it("defaults projectile fall y velocity from the projectile localcoord", () => {
    let projectiles = [projectile({
      localCoord: [640, 480],
      fall: { enabled: true },
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitFall?.velocity.y).toBe(-9);
  });

  it("preserves signed authored fall.xvelocity across projectile facing", () => {
    let projectiles = [projectile({
      facing: -1,
      fall: { enabled: true, xVelocity: -3, yVelocity: -9, zVelocity: 2.5 },
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitFall?.velocity).toEqual({ x: -3, y: -9, z: 2.5 });
  });

  it("carries projectile fall.envshake.mul and dir into GetHitVar metadata", () => {
    let projectiles = [projectile({
      fall: { enabled: true, xVelocity: 0, yVelocity: -9, envShakeMultiplier: 0.75, envShakeDirection: 67.5 },
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitFall?.envShake?.mul).toBeCloseTo(0.75, 5);
    expect(defender.runtime.hitFall?.envShake?.dir).toBeCloseTo(67.5, 5);
  });

  it("exposes the projectile owner's player number and ID through GetHitVar", () => {
    let projectiles = [projectile({ priority: 9 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, life: 1000 }), 3, undefined, 56);
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(runtimeHitVar(defender.runtime, "playerno")).toBe(3);
    expect(runtimeHitVar(defender.runtime, "playerid")).toBe(56);
    expect(runtimeHitVar(defender.runtime, "projid")).toBe(77);
    expect(runtimeHitVar(defender.runtime, "teamside")).toBe(1);
    expect(runtimeHitVar(defender.runtime, "frame")).toBe(1);
    expect(runtimeHitVar(defender.runtime, "priority")).toBe(4);
  });

  it("records Ikemen KO velocity deltas for a root-owned projectile hit", () => {
    let projectiles = [projectile({
      damage: 1000,
      hitVelocityY: -3,
      koVelocityAdd: { x: 4, y: 2 },
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      runtimeProfile: "ikemen-go",
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(0);
    expect(defender.runtime.hitVelocity).toEqual({ x: 5, y: -3 });
    expect(defender.runtime.vel).toEqual({ x: 9, y: -1 });
    expect(defender.runtime.hitVars?.hitVelocityAdd).toEqual({ x: 4, y: 2 });
    expect(runtimeHitVar(defender.runtime, "xveladd")).toBe(4);
    expect(runtimeHitVar(defender.runtime, "yveladd")).toBe(2);
  });

  it("does not apply projectile KO velocity deltas to helper-owned contacts", () => {
    let projectiles = [projectile({
      damage: 1000,
      hitVelocityY: -3,
      koVelocityAdd: { x: 4, y: 2 },
      ownerId: "helper-1",
      rootId: "p1",
      parentId: "helper-1",
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      runtimeProfile: "ikemen-go",
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(0);
    expect(defender.runtime.vel).toEqual({ x: 5, y: -3 });
    expect(defender.runtime.hitVars?.hitVelocityAdd).toBeUndefined();
    expect(runtimeHitVar(defender.runtime, "xveladd")).toBe(0);
    expect(runtimeHitVar(defender.runtime, "yveladd")).toBe(0);
  });

  it("applies projectile HitDef velocity Z for airborne contacts", () => {
    let projectiles = [projectile({ hitVelocityZ: 3, airVelocityZ: 4 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      stateType: "A",
      life: 1000,
      combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
    }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVelocity?.z).toBe(4);
    expect(defender.runtime.combatDepth?.velocity).toBe(4);
  });

  it("uses modified Projectile air.hittime for later airborne contact", () => {
    let projectiles = [projectile({ airHitTime: 7 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "air.hittime": "23" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType: "A", life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.hitStun).toBe(23);
  });

  it("uses modified Projectile ground.hittime for later grounded contact", () => {
    let projectiles = [projectile({ hitStun: 7 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "ground.hittime": "29" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType: "S", life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.hitStun).toBe(29);
  });

  it("uses modified Projectile guard.hittime for later guard contact", () => {
    let projectiles = [projectile({ guardStun: 7 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "guard.hittime": "31" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType: "S", life: 1000 }));

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

    expect(defender.runtime.guardStun).toBe(31);
  });

  it("uses modified Projectile guard control times for later ground and air guard contacts", () => {
    for (const route of [
      { stateType: "S" as const, expectedSlide: 37, expectedControl: 39 },
      { stateType: "A" as const, expectedSlide: 37, expectedControl: 41 },
    ]) {
      let projectiles = [projectile({ guardSlideTime: 5, guardControlTime: 6, airGuardControlTime: 7 })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: {
            id: "77",
            "guard.slidetime": "37",
            "guard.ctrltime": "39",
            "airguard.ctrltime": "41",
          },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType: route.stateType, life: 1000 }));

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

      expect(defender.runtime.guardSlideTimeRemaining).toBe(route.expectedSlide);
      expect(defender.runtime.guardControlTimeRemaining).toBe(route.expectedControl);
    }
  });

  it("uses modified Projectile ground and air guard velocities on later guard contact", () => {
    const resolve = (stateType: "S" | "A") => {
      let projectiles = [projectile({ guardDamage: 0 })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: {
            id: "77",
            "guard.velocity": "-5,-1,1.5",
            "airguard.velocity": "-8,-2,2.5",
          },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType, life: 1000 }));

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
      return defender.runtime;
    };

    expect(resolve("S")).toMatchObject({
      vel: { x: 5, y: -1 },
      hitVelocity: { x: 5, y: -1, z: 1.5 },
      combatDepth: { velocity: 1.5 },
    });
    expect(resolve("A")).toMatchObject({
      vel: { x: 8, y: -2 },
      hitVelocity: { x: 8, y: -2, z: 2.5 },
      combatDepth: { velocity: 2.5 },
    });
  });

  it("uses modified Projectile air.velocity X/Y/Z on later airborne hit contact", () => {
    let projectiles = [projectile({ airVelocityX: 1, airVelocityY: 2, airVelocityZ: 3 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "air.velocity": "-6,-9,2" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType: "A", life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.vel).toEqual({ x: 6, y: -9 });
    expect(defender.runtime.hitVelocity).toEqual({ x: 6, y: -9, z: 2 });
    expect(defender.runtime.combatDepth?.velocity).toBe(2);
  });

  it("uses modified Projectile down.hittime and down.velocity for later lying-state contact", () => {
    let projectiles = [projectile({ downHitTime: 7, downVelocityY: 0 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "down.hittime": "43", "down.velocity": "6,0,1.75" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, stateType: "L", life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.hitStun).toBe(43);
    expect(defender.runtime.vel.x).toBe(-6);
    expect(defender.runtime.hitVelocity).toMatchObject({ x: -6, y: 0, z: 1.75 });
    expect(defender.runtime.combatDepth?.velocity).toBe(1.75);
  });

  it("uses modified Projectile mindist and maxdist on later hit and guard contact", () => {
    const resolve = (
      params: Record<string, string>,
      projectileOverrides: Partial<RuntimeProjectile>,
      defenderState: Partial<CharacterRuntimeState>,
      holdingBack: boolean,
    ): CharacterRuntimeState => {
      let projectiles = [projectile(projectileOverrides)];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: { id: "77", ...params },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState(defenderState));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return defender.runtime;
    };

    expect(resolve(
      { mindist: "24,6,3", maxdist: "72,18,9" },
      { pos: { x: 0, y: -10, z: 0 }, facing: 1 },
      {
        pos: { x: 12, y: -20 },
        stateType: "S",
        life: 1000,
        combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] },
      },
      false,
    )).toMatchObject({ pos: { x: 24, y: -4 }, combatDepth: { position: 3 } });

    expect(resolve(
      { maxdist: "20,10,2" },
      { pos: { x: 40, y: -10, z: 0 }, facing: -1 },
      {
        pos: { x: 8, y: 4 },
        stateType: "A",
        life: 1000,
        combatDepth: { position: 4, velocity: 0, size: [3, 3], attack: [4, 4] },
      },
      true,
    )).toMatchObject({ pos: { x: 20, y: 0 }, combatDepth: { position: 2 } });
  });

  it("carries projectile HitDef acceleration and grounded friction metadata into defender GetHitVars", () => {
    let projectiles = [projectile({
      hitXAccel: -0.12,
      hitYAccel: 0.35,
      hitZAccel: 0.2,
      standFriction: 0.55,
      crouchFriction: 0.45,
    })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", xaccel: "-0.44", yaccel: "0.75", zaccel: "0.125" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars).toMatchObject({
      xAccel: -0.44,
      yAccel: 0.75,
      zAccel: 0.125,
      standFriction: 0.55,
      crouchFriction: 0.45,
    });
    expect(runtimeHitVar(defender.runtime, "xaccel")).toBe(-0.44);
    expect(runtimeHitVar(defender.runtime, "yaccel")).toBe(0.75);
    expect(runtimeHitVar(defender.runtime, "zaccel")).toBe(0.125);
    expect(runtimeHitVar(defender.runtime, "stand.friction")).toBe(0.55);
    expect(runtimeHitVar(defender.runtime, "crouch.friction")).toBe(0.45);
    expect(defender.runtime.hitVars).toMatchObject({ hitDamage: 31, guardDamage: 4 });
  });

  it("emits Projectile EnvShake metadata only on accepted unguarded hits", () => {
    const emitted: Array<RuntimeProjectile["envShake"]> = [];
    const resolve = (holdingBack: boolean, canDefenderBeHit?: boolean) => {
      let projectiles = [projectile({
        envShake: { time: 24, freq: 120.5, ampl: -8, phase: 45.25, mul: 1.75, dir: 90 },
      })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        emitProjectileEnvShake: (_source, entry) => emitted.push(entry.envShake),
        ...(canDefenderBeHit === undefined ? {} : { canDefenderBeHit: () => canDefenderBeHit }),
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
    };

    resolve(false);
    resolve(true);
    resolve(false, false);

    expect(emitted).toEqual([
      { time: 24, freq: 120.5, ampl: -8, phase: 45.25, mul: 1.75, dir: 90 },
    ]);
  });

  it("exposes Projectile HitDef dizzypoints through GetHitVar(dizzypoints)", () => {
    let projectiles = [projectile({ dizzyPoints: 29, damage: 12 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, dizzyPoints: 5 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars?.sourceDizzyPoints).toBe(29);
    expect(runtimeHitVar(defender.runtime, "dizzypoints")).toBe(29);
    expect(defender.runtime.dizzyPoints).toBe(34);
  });

  it("exposes Projectile HitDef guardpoints through GetHitVar(guardpoints)", () => {
    let projectiles = [projectile({ guardPoints: 33, damage: 12 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, guardPoints: 7 }));

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

    expect(defender.runtime.hitVars?.sourceGuardPoints).toBe(33);
    expect(runtimeHitVar(defender.runtime, "guardpoints")).toBe(33);
    expect(defender.runtime.guardPoints).toBe(40);
  });

  it("consumes the Projectile creation snapshot instead of the attacker's later guardpoints multiplier", () => {
    let projectiles = [projectile({ guardPoints: -20, guardPointsAttackMultiplier: 0.5 })];
    const attacker = actor("p1", "P1", runtimeState({
      pos: { x: 0, y: 0 },
      attackMultiplier: 1.5,
      guardPointsAttackMultiplier: 2,
    }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      life: 1000,
      guardPoints: 1000,
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
    });

    expect(defender.runtime.guardPoints).toBe(990);
    expect(projectiles).toEqual([]);
  });

  it("consumes the Projectile creation snapshot instead of the attacker's later dizzypoints multiplier", () => {
    let projectiles = [projectile({ dizzyPoints: -20, dizzyPointsAttackMultiplier: 0.5, damage: 12 })];
    const attacker = actor("p1", "P1", runtimeState({
      pos: { x: 0, y: 0 },
      attackMultiplier: 1.5,
      dizzyPointsAttackMultiplier: 2,
    }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.dizzyPoints).toBe(990);
    expect(projectiles).toEqual([]);
  });

  it("applies Projectile HitDef redlife while preserving authored GetHitVar(redlife)", () => {
    let projectiles = [projectile({ redLife: 33, damage: 12 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, redLife: 7 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars?.sourceRedLife).toBe(33);
    expect(runtimeHitVar(defender.runtime, "redlife")).toBe(33);
    expect(defender.runtime.redLife).toBe(988);
  });

  it("consumes the Projectile creation red-life snapshot instead of the live attacker multiplier", () => {
    let projectiles = [projectile({ redLife: 20, redLifeAttackMultiplier: 0.5, damage: 12 })];
    const attacker = actor("p1", "P1", runtimeState({
      pos: { x: 0, y: 0 },
      attackMultiplier: 1.5,
      redLifeAttackMultiplier: 2,
    }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, redLife: 7 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.redLife).toBe(982);
    expect(projectiles).toEqual([]);
  });

  it("applies Projectile HitDef guardpower while preserving its GetHitVar delta", () => {
    let projectiles = [projectile({ guardPower: 99, damage: 12 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", givepower: "43,33" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, power: 7 }));

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

    expect(defender.runtime.hitVars?.sourceGuardPower).toBe(33);
    expect(runtimeHitVar(defender.runtime, "guardpower")).toBe(33);
    expect(defender.runtime.power).toBe(40);
  });

  it("applies Projectile HitDef hitpower while preserving its GetHitVar delta", () => {
    let projectiles = [projectile({ hitPower: 99, damage: 12 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", givepower: "43,33" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, power: 7 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars?.sourceHitPower).toBe(43);
    expect(runtimeHitVar(defender.runtime, "hitpower")).toBe(43);
    expect(defender.runtime.power).toBe(50);
  });

  it("exposes the effective Projectile givepower through GetHitVar(power)", () => {
    let projectiles = [projectile({ hitPower: 43, damage: 12 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, power: 7 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars?.sourcePower).toBe(43);
    expect(runtimeHitVar(defender.runtime, "power")).toBe(43);
    expect(defender.runtime.power).toBe(50);
  });

  it("exposes Projectile HitDef p2facing only for hit contacts", () => {
    let projectiles = [projectile({ p2Facing: 1, hitPower: 43, damage: 12 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", p2facing: "-1" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]?.p2Facing).toBe(-1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars?.sourceFacing).toBe(-1);
    expect(runtimeHitVar(defender.runtime, "facing")).toBe(-1);

    let guardedProjectiles = [projectile({ p2Facing: 1, hitPower: 43, damage: 12 })];
    expect(modifyRuntimeProjectiles(guardedProjectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", p2facing: "-2" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const guardDefender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));
    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender: guardDefender,
      projectiles: guardedProjectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: true,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        guardedProjectiles = guardedProjectiles.filter((entry) => !entry.removalReason);
      },
    });
    expect(guardDefender.runtime.hitVars?.guarded).toBe(true);
    expect(guardDefender.runtime.hitVars?.sourceFacing).toBeUndefined();
  });

  it("applies Projectile p2facing as a one-shot deferred facing on accepted hits", () => {
    const resolve = (p2Facing: number, defenderFacing: 1 | -1, holdingBack = false) => {
      let projectiles = [projectile({ p2Facing, facing: 1 })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        facing: defenderFacing,
        life: 1000,
      }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      const pending = (defender as typeof defender & { pendingProjectileHitFacing?: 1 | -1 }).pendingProjectileHitFacing;
      const before = defender.runtime.facing;
      const consumed = consumeRuntimeProjectileHitFacing(defender);
      return { before, consumed, facing: defender.runtime.facing, pending };
    };

    expect(resolve(1, -1)).toEqual({ before: -1, consumed: true, facing: 1, pending: 1 });
    expect(resolve(-1, 1)).toEqual({ before: 1, consumed: true, facing: -1, pending: -1 });
    expect(resolve(1, -1, true)).toEqual({ before: -1, consumed: false, facing: -1, pending: undefined });
  });

  it("exposes Projectile keepstate through GetHitVar on hit and guard contacts", () => {
    for (const holdingBack of [false, true]) {
      let projectiles = [projectile({ keepState: true, damage: 12 })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      expect(defender.runtime.hitVars?.keepState).toBe(true);
      expect(runtimeHitVar(defender.runtime, "keepstate")).toBe(1);
    }
  });

  it("preserves the active state and skips default hit-state hooks for keepstate", () => {
    for (const holdingBack of [false, true]) {
      let projectiles = [projectile({ keepState: true, p1StateNo: 777, p2StateNo: 888, damage: 12 })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, stateNo: 200, moveType: "A" }));
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        life: 1000,
        stateNo: 201,
        stateType: "S",
        moveType: "A",
      }));
      let markedGotHit = 0;
      let guardStateRequests = 0;
      let hitStateRequests = 0;

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        markDefenderGotHit: () => {
          markedGotHit += 1;
        },
        applyGuardHit: () => {
          guardStateRequests += 1;
        },
        applyHitState: () => {
          hitStateRequests += 1;
        },
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      expect(defender.runtime.stateNo).toBe(201);
      expect(defender.runtime.moveType).toBe("A");
      expect(markedGotHit).toBe(0);
      expect(guardStateRequests).toBe(0);
      expect(hitStateRequests).toBe(0);
      expect(defender.runtime.hitVars?.keepState).toBe(true);
    }
  });

  it("exposes Projectile HitDef score without moving score adjudication", () => {
    let projectiles = [projectile({ score: 7.25, damage: 12 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars?.sourceScore).toBe(7.25);
    expect(runtimeHitVar(defender.runtime, "score")).toBe(7.25);
  });

  it("uses ModifyProjectile redlife and score pairs for resource/readback", () => {
    for (const contact of [
      { holdingBack: false, redLife: 23, score: 6.5 },
      { holdingBack: true, redLife: 9, score: 2.25 },
    ]) {
      let projectiles = [projectile({ damage: 12 })];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: { id: "77", redlife: "23,9", score: "6.5,2.25" },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, redLife: 7 }));

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack: contact.holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      expect(runtimeHitVar(defender.runtime, "redlife")).toBe(contact.redLife);
      expect(runtimeHitVar(defender.runtime, "score")).toBe(contact.score);
      expect(defender.runtime.redLife).toBe(contact.holdingBack ? 996 : 988);
    }
  });

  it("keeps the Projectile creation red-life multiplier after ModifyProjectile replaces redlife", () => {
    let projectiles = [projectile({
      damage: 12,
      guardDamage: 30,
      redLife: 0,
      guardRedLife: 0,
      redLifeAttackMultiplier: 0.5,
    })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", redlife: "40,40" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]).toMatchObject({ redLife: 40, guardRedLife: 40, redLifeAttackMultiplier: 0.5 });

    const attacker = actor("p1", "P1", runtimeState({
      pos: { x: 0, y: 0 },
      redLifeAttackMultiplier: 2,
    }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 50, redLife: 0 }));

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

    expect(runtimeHitVar(defender.runtime, "redlife")).toBe(40);
    expect(defender.runtime.life).toBe(20);
    expect(defender.runtime.redLife).toBe(20);
  });

  it("keeps the Projectile creation red-life multiplier after ModifyProjectile on a hit", () => {
    let projectiles = [projectile({
      damage: 45,
      guardDamage: 0,
      redLife: 0,
      guardRedLife: 0,
      redLifeAttackMultiplier: 0.5,
    })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", redlife: "40,0" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]).toMatchObject({ redLife: 40, guardRedLife: 0, redLifeAttackMultiplier: 0.5 });

    const attacker = actor("p1", "P1", runtimeState({
      pos: { x: 0, y: 0 },
      redLifeAttackMultiplier: 2,
    }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 50, redLife: 0 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(runtimeHitVar(defender.runtime, "redlife")).toBe(40);
    expect(defender.runtime.life).toBe(5);
    expect(defender.runtime.redLife).toBe(20);
  });

  it("carries projectile HitDef velocity vectors into Ikemen GetHitVar metadata", () => {
    let projectiles = [projectile({
      hitVelocities: {
        ground: { x: 3, y: -2, z: 1.5 },
        air: { x: 4, y: -6, z: 2.25 },
        down: { x: 5, y: -7, z: 3.5 },
        guard: { x: 2, y: -1, z: 0.75 },
        airGuard: { x: 1, y: -3, z: 1.25 },
      },
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars?.hitVelocities).toEqual({
      ground: { x: 3, y: -2, z: 1.5 },
      air: { x: 4, y: -6, z: 2.25 },
      down: { x: 5, y: -7, z: 3.5 },
      guard: { x: 2, y: -1, z: 0.75 },
      airGuard: { x: 1, y: -3, z: 1.25 },
    });
  });

  it("carries projectile HitDef ground, air, and fall anim types into GetHitVar metadata", () => {
    let projectiles = [projectile({ hitAnimTypes: { ground: 0, air: 0, fall: 0 } })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: {
          id: "77",
          chainid: "91",
          animtype: "Medium",
          "air.animtype": "Up",
          "fall.animtype": "DiagUp",
        },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, hitVars: { hitId: 91 } }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars).toMatchObject({
      chainId: 91,
      groundAnimType: 1,
      airAnimType: 4,
      fallAnimType: 5,
    });
  });

  it("enforces Projectile ChainID against the defender previous HitDef id", () => {
    const resolve = (chainId: number | undefined, previousHitId: number | undefined) => {
      let projectiles = [projectile({ chainId })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        life: 1000,
        ...(previousHitId === undefined ? {} : { hitVars: { hitId: previousHitId } }),
      }));
      const logs: string[] = [];
      const targets: string[] = [];

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack: false,
        log: (line) => logs.push(line),
        rememberTarget: (_source, target, targetId) => targets.push(`${target.id}:${targetId ?? "none"}`),
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      return { life: defender.runtime.life, logs, projectiles, targets };
    };

    expect(resolve(undefined, undefined)).toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve(-1, undefined)).toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve(43, 43)).toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve(43, undefined)).toMatchObject({
      life: 1000,
      logs: ["P2 rejected P1 projectile S,SP via ChainID 43 (previous HitDef id none)"],
      targets: [],
    });
    expect(resolve(43, 42)).toMatchObject({
      life: 1000,
      logs: ["P2 rejected P1 projectile S,SP via ChainID 43 (previous HitDef id 42)"],
      targets: [],
    });
  });

  it("uses a selected ModifyProjectile ChainID for later contact admission", () => {
    let projectiles = [projectile({ chainId: -1 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", chainid: "91" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]?.chainId).toBe(91);

    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, life: 1000, hitVars: { hitId: 90 } }));
    const logs: string[] = [];
    const targets: string[] = [];
    const resolve = () => new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: (_source, target, targetId) => targets.push(`${target.id}:${targetId ?? "none"}`),
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    resolve();
    expect(defender.runtime.life).toBe(1000);
    expect(projectiles).toHaveLength(1);
    expect(targets).toEqual([]);
    expect(logs).toEqual(["P2 rejected P1 projectile S,SP via ChainID 91 (previous HitDef id 90)"]);

    defender.runtime.hitVars = { hitId: 91 };
    resolve();
    expect(defender.runtime.life).toBe(969);
    expect(projectiles).toEqual([]);
    expect(targets).toEqual(["p2:77"]);
  });

  it("enforces Projectile NoChainID only for a matching same-player repeat source", () => {
    const resolve = (input: {
      noChainIds?: number[];
      previousHitId?: number;
      previousSourcePlayerId?: number;
      previousSourceActorId?: string;
      attackerPlayerId?: number;
      defenderHitPause?: number;
    }) => {
      let projectiles = [projectile({ noChainIds: input.noChainIds })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }), undefined, undefined, input.attackerPlayerId);
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        life: 1000,
        ...(input.previousHitId === undefined
          ? {}
          : {
              hitVars: {
                hitId: input.previousHitId,
                sourcePlayerId: input.previousSourcePlayerId,
                sourceActorId: input.previousSourceActorId,
              },
            }),
      }));
      defender.hitPause = input.defenderHitPause ?? 0;
      const logs: string[] = [];
      const targets: string[] = [];

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack: false,
        log: (line) => logs.push(line),
        rememberTarget: (_source, target, targetId) => targets.push(`${target.id}:${targetId ?? "none"}`),
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      return { life: defender.runtime.life, logs, projectiles, targets };
    };

    expect(resolve({ attackerPlayerId: 11 })).toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve({ noChainIds: [-1], previousHitId: 43, previousSourcePlayerId: 11, previousSourceActorId: "p1", attackerPlayerId: 11 }))
      .toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve({ noChainIds: [43], previousHitId: 42, previousSourcePlayerId: 11, previousSourceActorId: "p1", attackerPlayerId: 11 }))
      .toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 12, previousSourceActorId: "p1", attackerPlayerId: 11 }))
      .toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 11, previousSourceActorId: "other", attackerPlayerId: 11 }))
      .toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    expect(resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 11, previousSourceActorId: "p1", attackerPlayerId: 11 })).toMatchObject({
      life: 1000,
      logs: ["P2 rejected P1 projectile S,SP via NoChainID 43 (same source player 11)"],
      targets: [],
    });
    expect(resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 11, previousSourceActorId: "other", attackerPlayerId: 11, defenderHitPause: 3 })).toMatchObject({
      life: 1000,
      logs: ["P2 rejected P1 projectile S,SP via NoChainID 43 (same source player 11)"],
      targets: [],
    });
  });

  it("splits equal Projectile ChainID and NoChainID by MUGEN/Ikemen profile", () => {
    const resolve = (runtimeProfile: "mugen-1.1" | "ikemen-go" | "unknown") => {
      let projectiles = [projectile({ chainId: 43, noChainIds: [43] })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }), undefined, undefined, 11);
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        life: 1000,
        hitVars: { hitId: 43, sourcePlayerId: 11, sourceActorId: "p1" },
      }));
      const logs: string[] = [];
      const targets: string[] = [];

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        runtimeProfile,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack: false,
        log: (line) => logs.push(line),
        rememberTarget: (_source, target, targetId) => targets.push(`${target.id}:${targetId ?? "none"}`),
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return { life: defender.runtime.life, logs, projectiles, targets };
    };

    expect(resolve("mugen-1.1")).toMatchObject({ life: 969, projectiles: [], targets: ["p2:77"] });
    for (const profile of ["ikemen-go", "unknown"] as const) {
      expect(resolve(profile)).toMatchObject({
        life: 1000,
        logs: [`P2 rejected P1 projectile S,SP via NoChainID 43 (same source player 11)`],
        targets: [],
      });
    }
  });

  it("uses a selected ModifyProjectile NoChainID list for later contact admission", () => {
    let projectiles = [projectile({ noChainIds: [-1] })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", nochainid: "91,102" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]?.noChainIds).toEqual([91, 102]);

    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }), undefined, undefined, 11);
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      life: 1000,
      hitVars: { hitId: 91, sourcePlayerId: 11, sourceActorId: "p1" },
    }));
    const logs: string[] = [];
    const targets: string[] = [];
    const resolve = () => new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: (_source, target, targetId) => targets.push(`${target.id}:${targetId ?? "none"}`),
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    resolve();
    expect(defender.runtime.life).toBe(1000);
    expect(projectiles).toHaveLength(1);
    expect(targets).toEqual([]);
    expect(logs).toEqual(["P2 rejected P1 projectile S,SP via NoChainID 91 (same source player 11)"]);

    defender.runtime.hitVars = { hitId: 90, sourcePlayerId: 11, sourceActorId: "p1" };
    resolve();
    expect(defender.runtime.life).toBe(969);
    expect(projectiles).toEqual([]);
    expect(targets).toEqual(["p2:77"]);
  });

  it.each([
    ["S,NA", "normal"],
    ["S,SA", "special"],
    ["S,HA", "hyper"],
    ["S,NT", "throw"],
  ] as const)("records %s for a root-owned projectile KO", (attr, winType) => {
    let projectiles = [projectile({ attr, damage: 31 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 31,
    }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBe(winType);
  });

  it("uses the projectile combat default attr for a root-owned KO", () => {
    let projectiles = [projectile({ attr: undefined, damage: 31 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 31 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBe("special");
  });

  it("blocks a later AP projectile in the same owner pass and resets on the next pass", () => {
    let projectiles = [
      projectile({ serialId: "ap-first", damage: 10, removeOnHit: false }),
      projectile({ serialId: "ap-second", damage: 20, removeOnHit: false }),
    ];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 100 }));
    const logs: string[] = [];
    const resolve = () => new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => undefined,
    });

    resolve();
    expect(defender.runtime.life).toBe(90);
    expect(projectiles).toMatchObject([
      { serialId: "ap-first", hasHit: true },
      { serialId: "ap-second", hasHit: false, hitsRemaining: 1 },
    ]);
    expect(logs).toContain("P2 rejected P1 projectile S,SP via same-frame AP projectile contact");

    resolve();
    expect(defender.runtime.life).toBe(70);
    expect(projectiles).toMatchObject([
      { serialId: "ap-first", hasHit: true },
      { serialId: "ap-second", hasHit: true },
    ]);
  });

  it("keeps a non-AP projectile eligible after an AP contact", () => {
    let projectiles = [
      projectile({ serialId: "ap-first", damage: 10, removeOnHit: false }),
      projectile({ serialId: "normal-second", attr: "S,NA", damage: 20, removeOnHit: false }),
    ];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 100 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => undefined,
    });

    expect(defender.runtime.life).toBe(70);
    expect(projectiles).toMatchObject([
      { serialId: "ap-first", hasHit: true },
      { serialId: "normal-second", hasHit: true },
    ]);
  });

  it("rejects a projectile while a getting-hit state change remains pending", () => {
    let projectiles = [projectile({ removeOnHit: false, damage: 20 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 100,
      moveType: "H",
      hitTmp: 1,
      actTmp: 1,
      stateChangeTmp: true,
    }));
    const logs: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      runtimeProfile: "ikemen-go",
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(100);
    expect(projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
    expect(logs).toContain("P2 rejected P1 projectile S,SP via pending state change");
  });

  it("does not promote a helper-owned projectile to a root win cause", () => {
    let projectiles = [projectile({ attr: "S,HA", damage: 31, parentId: "p1-helper-0", rootId: "p1" })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 31 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBeUndefined();
  });

  it("admits a verified helper-owned projectile source into the root win cause", () => {
    let projectiles = [projectile({ attr: "S,HA", guardFlag: "L", damage: 31, parentId: "p1-helper-0", rootId: "p1" })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }), 1);
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 31 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      resolveProjectileHitSource: (_attacker, entry) => ({
        id: entry.parentId,
        playerId: 60,
        playerNo: 1,
        rootId: "p1",
        rootOwned: true,
      }),
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBe("hyper");
    expect(defender.runtime.hitVars).toMatchObject({
      sourcePlayerId: 60,
      sourcePlayerNo: 1,
      sourceActorId: "p1-helper-0",
      sourceRootId: "p1",
      sourceRootOwned: true,
      sourceAttr: "S,HA",
      sourceGuardFlag: "L",
      sourceHitFlag: "MAF",
      sourceGuardKo: false,
    });
    expect(runtimeHitVar(defender.runtime, "playerid")).toBe(60);
    expect(runtimeHitVar(defender.runtime, "playerno")).toBe(1);
  });

  it("carries explicit projectile source identity into GetHitVar metadata", () => {
    let projectiles = [projectile({ attr: "S,SP", guardFlag: "A", hitFlag: "H", damage: 10 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 } }), 1, undefined, 56);
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 100 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.hitVars).toMatchObject({
      sourcePlayerId: 56,
      sourcePlayerNo: 1,
      sourceActorId: "p1",
      sourceRootId: "p1",
      sourceRootOwned: true,
      sourceAttr: "S,SP",
      sourceGuardFlag: "A",
      sourceHitFlag: "H",
      sourceGuardKo: false,
    });
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

  it("uses a modified Projectile HitFlag for later player admission", () => {
    let projectiles = [projectile({ hitFlag: "H", removeOnHit: false })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", hitflag: "L" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);

    const attacker = actor("p1", "P1", runtimeState());
    const defender = actor("p2", "P2", runtimeState({ life: 1000, stateType: "S" }));
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

    expect(projectiles[0]?.hitFlag).toBe("L");
    expect(defender.runtime.life).toBe(1000);
    expect(logs).toEqual(["P2 rejected P1 projectile S,SP via HitFlag state type"]);
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

  it("uses ModifyProjectile p2 collision check and requirement on later contact", () => {
    let projectiles = [projectile({ p2ClsnCheck: "clsn2", p2ClsnRequire: "none" })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", p2clsncheck: "Clsn1", p2clsnrequire: "Size" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: 120, y1: -24, x2: 140, y2: 12 }],
      getTargetCollisionBoxes: (_target, boxType) => {
        if (boxType === "clsn1") return [{ x1: -24, y1: -24, x2: 24, y2: 12 }];
        if (boxType === "size") return [{ x1: -18, y1: -30, x2: 18, y2: 6 }];
        return [];
      },
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
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000, hitVars: { hitId: 43 } }));
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

  it("uses authored Projectile getpower for accepted hit and guard contacts", () => {
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1, power: 100 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));
    const resolve = (holdingBack: boolean, serialId: string) => {
      let projectiles = [projectile({
        serialId,
        attackerHitPower: 47,
        attackerGuardPower: 19,
        guardDamage: 0,
      })];
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
    };

    resolve(false, "getpower-hit");
    expect(attacker.runtime.power).toBe(147);

    defender.runtime.moveType = "I";
    resolve(true, "getpower-guard");
    expect(attacker.runtime.power).toBe(166);
  });

  it("tracks root Projectile air.juggle points, rejects over-budget contacts, and honors NoJuggleCheck", () => {
    let projectiles = [projectile({ airJuggle: 7, damage: 17 })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", "air.juggle": "3" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }), undefined, { constants: {} });
    const defender = actor(
      "p2",
      "P2",
      runtimeState({
        pos: { x: 12, y: 0 },
        facing: -1,
        life: 1000,
        moveType: "H",
        hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
      }),
      undefined,
      { constants: { "data.airjuggle": 4 } },
    );
    const logs: string[] = [];
    const resolve = () => new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      runtimeProfile: "ikemen-go",
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    resolve();
    expect(defender.runtime.life).toBe(983);
    expect(defender.runtime.airJugglePoints).toEqual({ p1: 1 });
    expect(projectiles).toEqual([]);

    projectiles = [projectile({ serialId: "projectile-rejected", airJuggle: 3, damage: 17 })];
    resolve();
    expect(defender.runtime.life).toBe(983);
    expect(defender.runtime.airJugglePoints).toEqual({ p1: 1 });
    expect(projectiles).toHaveLength(1);
    expect(projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
    expect(logs).toContain("P2 rejected P1 projectile S,SP via air.juggle");

    attacker.runtime.assertSpecial = { flags: ["nojugglecheck"], globalFlags: [], noJuggleCheck: true };
    projectiles = [projectile({ serialId: "projectile-bypass", airJuggle: 3, damage: 17 })];
    resolve();
    expect(defender.runtime.life).toBe(966);
    expect(defender.runtime.airJugglePoints).toEqual({ p1: 1 });
  });

  it("keeps projectile air.juggle inactive outside IKEMEN and uses root ownership for helper-parented projectiles", () => {
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor(
      "p2",
      "P2",
      runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000, moveType: "H", hitFall: { falling: true, damage: 0, velocity: { y: -1 } } }),
      undefined,
      { constants: { "data.airjuggle": 1 } },
    );
    const resolve = (entry: RuntimeProjectile, runtimeProfile: "mugen-1.1" | "ikemen-go") => {
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles: [entry],
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        runtimeProfile,
        holdingBack: false,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => undefined,
      });
    };

    resolve(projectile({ airJuggle: 3 }), "mugen-1.1");
    expect(defender.runtime.life).toBe(969);
    expect(defender.runtime.airJugglePoints).toBeUndefined();

    resolve(projectile({ serialId: "helper-projectile", airJuggle: 3, parentId: "helper-1" }), "ikemen-go");
    expect(defender.runtime.life).toBe(969);
    expect(defender.runtime.airJugglePoints).toBeUndefined();
  });

  it("uses Helper owner identity for ownprojectile air.juggle and honors its NoJuggleCheck", () => {
    let projectiles = [projectile({
      airJuggle: 3,
      damage: 17,
      ownerId: "helper-1",
      rootId: "p1",
      parentId: "helper-1",
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor(
      "p2",
      "P2",
      runtimeState({
        pos: { x: 12, y: 0 },
        facing: -1,
        life: 1000,
        moveType: "H",
        hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
      }),
      undefined,
      { constants: { "data.airjuggle": 4 } },
    );
    const helperJuggleActor = {
      id: "helper-1",
      definition: { constants: {} },
      runtime: { assertSpecial: { flags: [], globalFlags: [], noJuggleCheck: false } },
    };
    const resolve = () => new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      runtimeProfile: "ikemen-go",
      getProjectileJuggleActor: () => helperJuggleActor,
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    resolve();
    expect(defender.runtime.life).toBe(983);
    expect(defender.runtime.airJugglePoints).toEqual({ "helper-1": 1 });

    projectiles = [projectile({
      serialId: "helper-projectile-rejected",
      airJuggle: 3,
      damage: 17,
      ownerId: "helper-1",
      rootId: "p1",
      parentId: "helper-1",
    })];
    resolve();
    expect(defender.runtime.life).toBe(983);
    expect(defender.runtime.airJugglePoints).toEqual({ "helper-1": 1 });
    expect(projectiles).toHaveLength(1);

    helperJuggleActor.runtime.assertSpecial.noJuggleCheck = true;
    projectiles = [projectile({
      serialId: "helper-projectile-bypass",
      airJuggle: 3,
      damage: 17,
      ownerId: "helper-1",
      rootId: "p1",
      parentId: "helper-1",
    })];
    resolve();
    expect(defender.runtime.life).toBe(966);
    expect(defender.runtime.airJugglePoints).toEqual({ "helper-1": 1 });
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
    expect(defender.runtime.guardSlideTimeRemaining).toBe(8);
    expect(defender.runtime.guardControlTimeRemaining).toBe(8);
    expect(defender.runtime.hitVars).toEqual({
      damage: 4,
      hitDamage: 31,
      guardDamage: 4,
      kill: true,
      sourceProjectileId: 77,
      sourceTeamSide: 1,
      sourcePriority: 4,
      frame: true,
      hitId: 77,
      hitCount: 1,
      animType: 0,
      groundAnimType: 0,
      airAnimType: 0,
      fallAnimType: 0,
      groundType: 1,
      airType: 1,
      isBound: false,
      hitShakeTime: 3,
      hitTime: 8,
      guardCount: 1,
      guarded: true,
    });
    expect(runtimeHitVar(defender.runtime, "guardcount")).toBe(1);
    expect(attacker.runtime.power).toBe(3000);
    expect(effects).toEqual(["p1:p2:projectile-0:guard"]);
    expect(logs).toEqual(["P2 guarded P1 projectile for 4; hits remaining 0, miss 0; hit removal anim none"]);
    expect(projectiles).toEqual([]);
  });

  it("tracks projectile GetHitVar(hitcount) across a combo and resets after a guard", () => {
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));
    let serial = 0;

    const resolve = (holdingBack: boolean) => {
      let projectiles = [projectile({
        serialId: `combo-projectile-${serial++}`,
        pos: { x: 0, y: 0 },
        facing: 1,
        hitDefHitCount: 3,
      })];
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        runtimeProfile: "ikemen-go",
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
    };

    resolve(false);
    expect(runtimeHitVar(defender.runtime, "hitcount")).toBe(1);

    resolve(false);
    expect(runtimeHitVar(defender.runtime, "hitcount")).toBe(2);

    defender.runtime.moveType = "I";
    resolve(true);
    expect(defender.runtime.hitVars?.guarded).toBe(true);
    expect(runtimeHitVar(defender.runtime, "hitcount")).toBe(2);

    resolve(false);
    expect(defender.runtime.hitVars?.guarded).toBeUndefined();
    expect(runtimeHitVar(defender.runtime, "hitcount")).toBe(1);
  });

  it("keeps ModifyProjectile numhits/projhits and priority/projpriority separate", () => {
    let projectiles = [projectile({
      pos: { x: 0, y: 0 },
      facing: 1,
      hitsRemaining: 2,
      hitDefHitCount: 3,
      hitPriority: 4,
      priority: 2,
      removeOnHit: false,
    })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", numhits: "9", priority: "8,Dodge", projpriority: "3" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]).toMatchObject({
      hitDefHitCount: 9,
      hitsRemaining: 2,
      hitPriority: 8,
      hitPriorityType: "dodge",
      priority: 3,
    });

    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));
    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      runtimeProfile: "ikemen-go",
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: () => undefined,
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(projectiles[0]?.hitsRemaining).toBe(1);
    expect(defender.runtime.hitVars).toMatchObject({ hitCount: 9, comboHitCount: 1, sourcePriority: 8 });
  });

  it("applies modified Projectile P2 sprite priority on hit and guard without changing P1", () => {
    const attacker = actor("p1", "P1", runtimeState({
      pos: { x: 0, y: 0 },
      facing: 1,
      spritePriority: 7,
    }));

    const resolve = (kind: "hit" | "guard", p2SpritePriority: number) => {
      const active = projectile({
        serialId: `sprite-priority-${kind}`,
        pos: { x: 0, y: 0 },
        facing: 1,
        spritePriority: 9,
        p1SpritePriority: 11,
        p2SpritePriority: -1,
      });
      let projectiles = [active];
      expect(modifyRuntimeProjectiles(projectiles, {
        controller: {
          stateId: 1000,
          type: "ModifyProjectile",
          params: {
            id: "77",
            p1sprpriority: "15",
            p2sprpriority: String(p2SpritePriority),
            projsprpriority: "8",
          },
          triggers: [],
          line: 1,
          rawHeader: "[State 1000, ModifyProjectile]",
        },
      })).toBe(1);
      expect(active).toMatchObject({
        spritePriority: 8,
        p1SpritePriority: 11,
        p2SpritePriority,
      });

      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        facing: -1,
        life: 1000,
        spritePriority: 5,
      }));
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        runtimeProfile: "ikemen-go",
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack: kind === "guard",
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });

      expect(attacker.runtime.spritePriority).toBe(7);
      expect(attacker.runtime.hitDefSpritePriority).toBeUndefined();
      expect(defender.runtime.spritePriority).toBe(p2SpritePriority);
      expect(defender.runtime.hitDefSpritePriority).toMatchObject({
        profile: "ikemen-go",
        role: "p2",
        contactKind: kind,
        source: "authored",
        value: p2SpritePriority,
      });
    };

    resolve("hit", -4);
    resolve("guard", 6);
  });

  it("routes projectile guard.kill into bounded guard damage and hit vars", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, guardDamage: 99, guardKill: true })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", damage: "23,11", "guard.kill": "0" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
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

  it("routes modified projectile kill and fall.kill into bounded hit state", () => {
    let projectiles = [projectile({
      pos: { x: 0, y: 0 },
      facing: 1,
      damage: 99,
      kill: true,
      fall: { enabled: true, damage: 7, kill: true },
    })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: {
          id: "77",
          damage: "11",
          kill: "0",
          "fall.kill": "0",
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
        },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 8 }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
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

    expect(defender.runtime.life).toBe(1);
    expect(defender.runtime.hitVars).toMatchObject({ damage: 11, kill: false });
    expect(defender.runtime.hitFall).toMatchObject({
      falling: true,
      damage: 13,
      kill: false,
      recover: false,
      recoverTime: 19,
      downRecover: false,
      downRecoverTime: 27,
      velocity: { x: -3.5, y: -8.25, z: 2.5 },
      envShake: { time: 15, freq: 178.5, ampl: 6, phase: 0.25, mul: 0.75, dir: 67.5 },
    });
    expect(projectiles).toEqual([]);
  });

  it("exposes a root projectile guard KO through GetHitVar(guardko)", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, guardDamage: 11, guardKill: true })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }), 1, undefined, 56);
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

    expect(defender.runtime.life).toBe(0);
    expect(defender.runtime.hitVars?.sourceGuardKo).toBe(true);
    expect(runtimeHitVar(defender.runtime, "guardko")).toBe(1);
    expect(runtimeHitVar(defender.runtime, "frame")).toBe(1);
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

  it("checks Projectile ChainID and NoChainID before ReversalDef", () => {
    const resolve = (overrides: Partial<RuntimeProjectile>) => {
      let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, damage: 42, ...overrides })];
      const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }), undefined, undefined, 11);
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        facing: -1,
        life: 1000,
        hitVars: { hitId: 43, sourcePlayerId: 11, sourceActorId: "p1" },
      }));
      const calls: string[] = [];

      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        runtimeProfile: "ikemen-go",
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack: false,
        log: (line) => calls.push(`log:${line}`),
        rememberTarget: () => calls.push("target"),
        applyHitOverride: () => calls.push("override"),
        applyProjectileReversal: () => {
          calls.push("reversal");
          return true;
        },
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return { calls, defender, projectiles };
    };

    const chainRejected = resolve({ chainId: 44 });
    expect(chainRejected.calls).toEqual([
      "log:P2 rejected P1 projectile S,SP via ChainID 44 (previous HitDef id 43)",
    ]);

    const noChainRejected = resolve({ noChainIds: [43] });
    expect(noChainRejected.calls).toEqual([
      "log:P2 rejected P1 projectile S,SP via NoChainID 43 (same source player 11)",
    ]);

    for (const rejected of [chainRejected, noChainRejected]) {
      expect(rejected.defender.runtime.life).toBe(1000);
      expect(rejected.defender.hitPause).toBe(0);
      expect(rejected.projectiles).toHaveLength(1);
      expect(rejected.projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
      expect(rejected.projectiles[0]?.removalReason).toBeUndefined();
    }

    const accepted = resolve({ chainId: 43 });
    expect(accepted.calls).toEqual(["reversal"]);
    expect(accepted.defender.runtime.life).toBe(1000);
    expect(accepted.projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
  });

  it("keeps a projectile active when its ReversalDef redirect is pending", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, damage: 42 })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1 }));
    const defender = actor("p2", "P2", runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 1000 }));
    const calls: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => calls.push(`log:${line}`),
      rememberTarget: () => calls.push("target"),
      applyHitOverride: () => calls.push("override"),
      applyProjectileReversal: () => "state-change-pending",
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(calls).toEqual(["log:P2 rejected P1 projectile S,SP via pending state change"]);
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

  it("rejects positive receiver unhittabletime before Projectile reversal or HitOverride mutation", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, unhittableTime: [20, 8], removeOnHit: false })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1, unhittableTime: 4 }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      unhittableTime: 3,
      hitOverrides: [{ slot: 1, attr: "S,SP", stateNo: 777, remaining: 30 }],
    }));
    const calls: string[] = [];
    const logs: string[] = [];

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: (line) => logs.push(line),
      rememberTarget: () => calls.push("target"),
      applyProjectileReversal: () => {
        calls.push("reversal");
        return true;
      },
      applyHitOverride: () => calls.push("override"),
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(calls).toEqual([]);
    expect(logs).toEqual(["P2 rejected P1 projectile S,SP via HitDef unhittabletime"]);
    expect(attacker.runtime.unhittableTime).toBe(4);
    expect(defender.runtime).toMatchObject({ life: 1000, stateNo: 0, unhittableTime: 3 });
    expect(projectiles[0]).toMatchObject({ hasHit: false, hitsRemaining: 1 });
  });

  it("writes only Projectile receiver unhittabletime after unguarded contact", () => {
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1, unhittableTime: 4 }));
    const resolve = (holdingBack: boolean, unhittableTime: [number, number]) => {
      let projectiles = [projectile({
        pos: { x: 0, y: 0 },
        facing: 1,
        unhittableTime,
        removeOnHit: false,
      })];
      const defender = actor("p2", "P2", runtimeState({
        pos: { x: 12, y: 0 },
        facing: -1,
        life: 1000,
        unhittableTime: 0,
      }));
      new RuntimeProjectileCombatWorld().resolveCombat({
        attacker,
        defender,
        projectiles,
        hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        holdingBack,
        log: () => undefined,
        rememberTarget: () => undefined,
        applyHitOverride: () => undefined,
        removeProjectilesMarkedForRemoval: () => {
          projectiles = projectiles.filter((entry) => !entry.removalReason);
        },
      });
      return defender;
    };

    const hit = resolve(false, [30, 8]);
    expect(hit.runtime).toMatchObject({ life: 969, unhittableTime: 8 });
    expect(attacker.runtime.unhittableTime).toBe(4);

    const guard = resolve(true, [30, 11]);
    expect(guard.runtime).toMatchObject({ life: 996, unhittableTime: 0 });
    expect(attacker.runtime.unhittableTime).toBe(4);

    const negative = resolve(false, [30, -1]);
    expect(negative.runtime).toMatchObject({ life: 969, unhittableTime: 0 });
    expect(attacker.runtime.unhittableTime).toBe(4);
  });

  it("writes Projectile receiver unhittabletime after accepted unguarded HitOverride", () => {
    let projectiles = [projectile({
      pos: { x: 0, y: 0 },
      facing: 1,
      unhittableTime: [20, 7],
      removeOnHit: false,
    })];
    const attacker = actor("p1", "P1", runtimeState({ pos: { x: 0, y: 0 }, facing: 1, unhittableTime: 4 }));
    const defender = actor("p2", "P2", runtimeState({
      pos: { x: 12, y: 0 },
      facing: -1,
      life: 1000,
      hitOverrides: [{ slot: 1, attr: "S,SP", stateNo: 777, remaining: 30 }],
    }));

    new RuntimeProjectileCombatWorld().resolveCombat({
      attacker,
      defender,
      projectiles,
      hurtBoxes: [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      holdingBack: false,
      log: () => undefined,
      rememberTarget: () => undefined,
      applyHitOverride: (_source, target, override) => {
        target.runtime.stateNo = override.stateNo ?? target.runtime.stateNo;
      },
      removeProjectilesMarkedForRemoval: () => {
        projectiles = projectiles.filter((entry) => !entry.removalReason);
      },
    });

    expect(attacker.runtime.unhittableTime).toBe(4);
    expect(defender.runtime).toMatchObject({ life: 1000, stateNo: 777, unhittableTime: 7 });
  });

  it("lets Projectile p2stateno route through HitOverride instead of custom-state miss", () => {
    let projectiles = [projectile({ pos: { x: 0, y: 0 }, facing: 1, missOnOverride: true })];
    expect(modifyRuntimeProjectiles(projectiles, {
      controller: {
        stateId: 1000,
        type: "ModifyProjectile",
        params: { id: "77", p2stateno: "889", p2getp1state: "0", missonoverride: "0" },
        triggers: [],
        line: 1,
        rawHeader: "[State 1000, ModifyProjectile]",
      },
    })).toBe(1);
    expect(projectiles[0]).toMatchObject({ p2StateNo: 889, p2GetP1State: false, missOnOverride: false });
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

function actor(
  id: string,
  label: string,
  runtime: CharacterRuntimeState,
  playerNo?: number,
  definition?: { constants?: Record<string, number> },
  playerId?: number,
) {
  return {
    id,
    label,
    ...(playerId === undefined ? {} : { playerId }),
    ...(playerNo === undefined ? {} : { playerNo }),
    ...(definition === undefined ? {} : { definition }),
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
    removeTime: 24,
    layerNo: 0,
    spritePriority: 7,
    priority: 1,
    hitsRemaining: 1,
    missTime: 0,
    missTimeRemaining: 0,
    remVelocity: { x: 0, y: 0 },
    pauseMoveTime: 0,
    superMoveTime: 0,
    opacity: 1,
    damage: 31,
    airJuggle: undefined,
    kill: true,
    attr: "S,SP",
    targetId: 77,
    hitPause: 4,
    hitShakeTime: 4,
    hitPauseRemaining: 0,
    hitStun: 13,
    push: 5,
    guardDamage: 4,
    guardKill: true,
    guardDistanceBounds: {
      width: [120, 0],
      height: [1000, 1000],
      depth: [10, 10],
    },
    guardFlag: "MA",
    guardPause: 3,
    guardShakeTime: 3,
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
