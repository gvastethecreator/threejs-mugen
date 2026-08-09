import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import {
  createRuntimeContactMemory,
  RuntimeContactMemoryWorld,
  runtimeMoveContactValue,
  runtimeMoveHitCountValue,
  runtimeReceivedDamageValue,
} from "../mugen/runtime/ContactMemorySystem";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import { RuntimeDirectCombatWorld } from "../mugen/runtime/DirectCombatSystem";
import { RuntimeAudioWorld } from "../mugen/runtime/AudioEventSystem";
import { RuntimeHitEffectWorld } from "../mugen/runtime/HitEffectSystem";
import { RuntimeHitOverrideWorld } from "../mugen/runtime/HitOverrideSystem";
import { RuntimeReversalWorld } from "../mugen/runtime/ReversalSystem";
import { RuntimeGuardWorld } from "../mugen/runtime/GuardSystem";
import { RuntimeGetHitStateWorld } from "../mugen/runtime/GetHitStateSystem";
import { RuntimeHitStateTransitionWorld } from "../mugen/runtime/HitStateTransitionSystem";
import { RuntimeContactPresentationWorld } from "../mugen/runtime/RuntimeContactPresentationSystem";
import { runtimeHitVar } from "../mugen/runtime/RuntimeExpressionContextSystem";
import {
  RuntimeCombatResolutionWorld,
  type RuntimeCombatResolutionActor,
  type RuntimeCombatResolutionStateHooks,
} from "../mugen/runtime/RuntimeCombatResolutionSystem";
import type {
  RuntimeProjectileCombatActor,
  RuntimeProjectileCombatInput,
} from "../mugen/runtime/ProjectileCombatSystem";
import { resolveRuntimeProjectileCombat } from "../mugen/runtime/ProjectileCombatSystem";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import type { RuntimeHelper } from "../mugen/runtime/HelperSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeCombatResolutionSystem", () => {
  it("consumes a HitDef hitonce across distinct direct targets", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ damage: 25, hitOnce: true }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const firstDefender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, life: 100 }),
    });
    const secondDefender = actor("p3", "P3", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    expect(world.resolveDirect({ attacker, defender: firstDefender, ...base })).toMatchObject({ kind: "hit", damage: 25 });
    expect(world.resolveDirect({ attacker, defender: secondDefender, ...base })).toEqual({ kind: "skipped", reason: "hitonce-consumed" });
    expect(firstDefender.runtime.life).toBe(75);
    expect(secondDefender.runtime.life).toBe(100);
    expect(attacker.pendingHitDefTargets).toEqual(["p2"]);
  });

  it("consumes HitDef hitonce across queued equal-priority trades", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ damage: 25, priority: 4, hitOnce: true }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const firstOpponent = actor("p2", "P2", contactWorld, {
      currentMove: move({ damage: 25, priority: 4 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
      runtime: runtimeState({ pos: { x: 10, y: 0 }, life: 100 }),
    });
    const secondOpponent = actor("p3", "P3", contactWorld, {
      currentMove: move({ damage: 25, priority: 4 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    expect(world.resolvePriorityClash({ left: attacker, right: firstOpponent, directCombatWorld })).toBeUndefined();
    expect(world.resolvePriorityClash({ left: attacker, right: secondOpponent, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [attacker, firstOpponent, secondOpponent], ...base })).toBe(1);
    expect(attacker.runtime.life).toBe(75);
    expect(firstOpponent.runtime.life).toBe(75);
    expect(secondOpponent.runtime.life).toBe(100);
    expect(attacker.pendingHitDefTargets).toEqual(["p2"]);
  });

  it("tracks direct IKEMEN air.juggle points, rejects an over-budget contact, and honors NoJuggleCheck", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const logs: string[] = [];
    const hit = () => move({
      damage: 17,
      airJuggle: 3,
      hitFlag: "H,L,A,F",
      fall: { enabled: true, velocity: { y: -4 } },
    });
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: hit(),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 10, y: 0 },
        life: 100,
        moveType: "H",
        hitFall: { falling: true, damage: 0, velocity: { y: -4 } },
      }),
    });
    defender.definition.constants = { ...(defender.definition.constants ?? {}), "data.airjuggle": 4 };
    const base = { ...directInputBase(contactWorld, directCombatWorld, logs), runtimeProfile: "ikemen-go" as const };

    expect(world.resolveDirect({ attacker, defender, ...base })).toMatchObject({ kind: "hit", damage: 17 });
    expect(defender.runtime.airJugglePoints).toEqual({ p1: 1 });

    rearmHitDef(attacker, hit());
    expect(world.resolveDirect({ attacker, defender, ...base })).toEqual({ kind: "skipped", reason: "air-juggle-rejected" });
    expect(defender.runtime.life).toBe(83);
    expect(logs).toContain("P2 rejected P1 S,NA via air.juggle");

    attacker.runtime.assertSpecial = { flags: ["nojugglecheck"], globalFlags: [], noJuggleCheck: true };
    rearmHitDef(attacker, hit());
    expect(world.resolveDirect({ attacker, defender, ...base })).toMatchObject({ kind: "hit", damage: 17 });
    expect(defender.runtime.life).toBe(66);
    expect(defender.runtime.airJugglePoints).toEqual({ p1: 1 });
  });

  it.each([
    ["enemy-only", 1, false],
    ["both-teams", 0, true],
    ["friendly-only", -1, true],
  ] as const)("gates direct same-side HitDef contact through AffectTeam %s", (_label, affectTeam, shouldHit) => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ affectTeam, damage: 25 }),
      moveTick: 1,
    });
    const defender = actor("p3", "P3", contactWorld, {
      runtime: runtimeState({ life: 100 }),
    });
    const result = new RuntimeCombatResolutionWorld().resolveDirect({
      attacker,
      defender,
      ...directInputBase(contactWorld, directCombatWorld, []),
    });

    expect(result).toMatchObject(shouldHit ? { kind: "hit", damage: 25 } : { kind: "skipped", reason: "affectteam-rejected" });
    expect(defender.runtime.life).toBe(shouldHit ? 75 : 100);
  });

  it.each([
    ["without F", "H,L,A", undefined, 100],
    ["with NoFallHitFlag", "H,L,A,F", true, 100],
  ] as const)("rejects a falling target %s", (_label, hitFlag, noFallHitFlag, expectedLife) => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const logs: string[] = [];
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ hitFlag, damage: 25 }),
      runtime: runtimeState(noFallHitFlag ? {
        assertSpecial: { flags: ["nofallhitflag"], globalFlags: [], noFallHitFlag: true },
      } : {}),
      moveTick: 1,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ life: 100, moveType: "H", hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } } }),
    });

    const result = new RuntimeCombatResolutionWorld().resolveDirect({
      attacker,
      defender,
      ...directInputBase(contactWorld, directCombatWorld, logs),
    });

    expect(result).toEqual({ kind: "skipped", reason: "fall-hitflag-rejected" });
    expect(defender.runtime.life).toBe(expectedLife);
    expect(logs).toEqual(["P2 rejected P1 S,NA via fall HitFlag/NoFallHitFlag"]);
  });

  it("allows explicit F and preserves omitted hitflag behavior for a falling target", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const allowed = actor("p1", "P1", contactWorld, {
      currentMove: move({ hitFlag: "H,L,A,F", damage: 25 }),
      moveTick: 1,
    });
    const omitted = actor("p3", "P3", contactWorld, {
      currentMove: move({ damage: 15 }),
      moveTick: 1,
    });
    const fallingAllowed = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ life: 100, moveType: "H", hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } } }),
    });
    const fallingOmitted = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ life: 100, moveType: "H", hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } } }),
    });

    expect(world.resolveDirect({
      attacker: allowed,
      defender: fallingAllowed,
      ...directInputBase(contactWorld, directCombatWorld, []),
    })).toMatchObject({ kind: "hit", damage: 25 });
    expect(world.resolveDirect({
      attacker: omitted,
      defender: fallingOmitted,
      ...directInputBase(contactWorld, directCombatWorld, []),
    })).toMatchObject({ kind: "hit", damage: 15 });
  });

  it("filters a falling target before equal-priority prepared hits mutate it", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ priority: 4, hitFlag: "H,L,A", damage: 17 }),
      moveTick: 1,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1, life: 100, moveType: "H", hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } } }),
      currentMove: move({ priority: 4, damage: 23 }),
      moveTick: 1,
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    expect(world.resolvePriorityClash({ left: attacker, right: defender, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [attacker, defender], ...base })).toBe(0);
    expect(defender.runtime.life).toBe(100);
    expect(attacker.runtime.life).toBe(100);
  });

  it("enforces explicit minus and plus HitFlags at direct admission", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const logs: string[] = [];

    const minusAttacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ hitFlag: "H-" }),
      moveTick: 1,
    });
    const gettingHit = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, life: 100, stateNo: 5000, moveType: "H" }),
    });
    expect(world.resolveDirect({
      attacker: minusAttacker,
      defender: gettingHit,
      ...directInputBase(contactWorld, directCombatWorld, logs),
    })).toEqual({ kind: "skipped", reason: "minus-hitflag-rejected" });
    expect(gettingHit.runtime.life).toBe(100);

    const plusAttacker = actor("p3", "P3", contactWorld, {
      currentMove: move({ hitFlag: "H+" }),
      moveTick: 1,
    });
    const idle = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, life: 100 }),
    });
    expect(world.resolveDirect({
      attacker: plusAttacker,
      defender: idle,
      ...directInputBase(contactWorld, directCombatWorld, logs),
    })).toEqual({ kind: "skipped", reason: "plus-hitflag-rejected" });
    expect(idle.runtime.life).toBe(100);

    const wrongStateAttacker = actor("p7", "P7", contactWorld, {
      currentMove: move({ hitFlag: "H" }),
      moveTick: 1,
    });
    const crouching = actor("p8", "P8", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, life: 100, stateType: "C" }),
    });
    expect(world.resolveDirect({
      attacker: wrongStateAttacker,
      defender: crouching,
      ...directInputBase(contactWorld, directCombatWorld, logs),
    })).toEqual({ kind: "skipped", reason: "state-type-hitflag-rejected" });
    expect(crouching.runtime.life).toBe(100);

    const chainAttacker = actor("p5", "P5", contactWorld, {
      currentMove: move({ hitFlag: "H+", damage: 13 }),
      moveTick: 1,
    });
    const chainTarget = actor("p6", "P6", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, life: 100, stateNo: 5000, moveType: "H" }),
    });
    expect(world.resolveDirect({
      attacker: chainAttacker,
      defender: chainTarget,
      ...directInputBase(contactWorld, directCombatWorld, logs),
    })).toMatchObject({ kind: "hit", damage: 13 });
    expect(chainTarget.runtime.life).toBe(87);
    expect(logs).toEqual([
      "P2 rejected P1 S,NA via HitFlag -",
      "P4 rejected P3 S,NA via HitFlag +",
      "P8 rejected P7 S,NA via HitFlag state type",
      "P5 hit P6 for 13",
    ]);
  });

  it("applies equal-priority Hit versus Hit as one bilateral transaction", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const left = actor("p3", "P3", contactWorld, {
      runtime: runtimeState({ pos: { x: -10, y: 0 }, life: 100 }),
      currentMove: move({ priority: 4, damage: 17, targetId: 31 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const right = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1, life: 100 }),
      currentMove: move({ priority: 4, damage: 23, targetId: 32 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const logs: string[] = [];
    const base = {
      directCombatWorld,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      log: (line: string) => logs.push(line),
    };

    expect(world.resolvePriorityClash({ left, right, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(1);
    expect(world.resolveDirect({ attacker: left, defender: right, ...base })).toEqual({ kind: "skipped", reason: "missing-move" });
    expect(world.resolveDirect({ attacker: right, defender: left, ...base })).toEqual({ kind: "skipped", reason: "missing-move" });

    expect(left.runtime.life).toBe(77);
    expect(right.runtime.life).toBe(83);
    expect(left.pendingHitDefTargets).toEqual(["p4"]);
    expect(right.pendingHitDefTargets).toEqual(["p3"]);
    expect(left.targets).toEqual([{ actorId: "p4", targetId: 31, age: 0 }]);
    expect(right.targets).toEqual([{ actorId: "p3", targetId: 32, age: 0 }]);
    expect(left.currentMove).toBeUndefined();
    expect(right.currentMove).toBeUndefined();
    expect(logs).toEqual([
      "HitDef priority clash: P3 priority 4 Hit traded with P4 priority 4 Hit",
      "P3 hit P4 for 17",
      "P4 hit P3 for 23",
    ]);
  });

  it("enforces direct HitDef ChainID against the defender's previous HitDef id", () => {
    const resolve = (chainId: number | undefined, previousHitId: number | undefined) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const world = new RuntimeCombatResolutionWorld();
      const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
      const attacker = actor("p1", "P1", contactWorld, {
        currentMove: move({
          damage: 17,
          targetId: 43,
          hitVars: { hitId: 43, ...(chainId === undefined ? {} : { chainId }) },
        }),
        moveTick: 1,
        hitDefTargets: [],
        pendingHitDefTargets: [],
      });
      const defender = actor("p2", "P2", contactWorld, {
        runtime: runtimeState({
          pos: { x: 10, y: 0 },
          life: 100,
          ...(previousHitId === undefined ? {} : { hitVars: { hitId: previousHitId } }),
        }),
      });
      const logs: string[] = [];
      const result = world.resolveDirect({
        attacker,
        defender,
        ...directInputBase(contactWorld, directCombatWorld, logs),
      });
      return { attacker, defender, logs, result };
    };

    for (const [chainId, previousHitId] of [
      [undefined, undefined],
      [-1, undefined],
      [43, 43],
    ] as const) {
      const accepted = resolve(chainId, previousHitId);
      expect(accepted.result).toMatchObject({ kind: "hit", damage: 17 });
      expect(accepted.defender.runtime.life).toBe(83);
      expect(accepted.attacker.pendingHitDefTargets).toEqual(["p2"]);
      expect(accepted.attacker.targets).toEqual([{ actorId: "p2", targetId: 43, age: 0 }]);
      expect(accepted.defender.runtime.hitVars).toMatchObject({
        hitId: 43,
        ...(chainId === undefined ? {} : { chainId }),
      });
      expect(runtimeHitVar(accepted.defender.runtime, "hitid")).toBe(43);
      if (chainId === 43) expect(runtimeHitVar(accepted.defender.runtime, "chainid")).toBe(43);
    }

    for (const previousHitId of [undefined, 42] as const) {
      const rejected = resolve(43, previousHitId);
      expect(rejected.result).toEqual({ kind: "skipped", reason: "chainid-rejected" });
      expect(rejected.defender.runtime.life).toBe(100);
      expect(rejected.attacker.pendingHitDefTargets).toEqual([]);
      expect(rejected.attacker.targets).toEqual([]);
      expect(rejected.logs).toEqual([
        `P2 rejected P1 S,NA via ChainID 43 (previous HitDef id ${previousHitId === undefined ? "none" : previousHitId})`,
      ]);
    }
  });

  it("enforces direct HitDef ChainID before committing an equal-priority bilateral hit", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const left = actor("p3", "P3", contactWorld, {
      runtime: runtimeState({ pos: { x: -10, y: 0 }, life: 100 }),
      currentMove: move({ priority: 4, damage: 17, hitVars: { chainId: 43 } }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const right = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1, life: 100, hitVars: { hitId: 42 } }),
      currentMove: move({ priority: 4, damage: 23 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const logs: string[] = [];
    const base = directInputBase(contactWorld, directCombatWorld, logs);

    expect(world.resolvePriorityClash({ left, right, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(0);
    expect(left.runtime.life).toBe(100);
    expect(right.runtime.life).toBe(100);
    expect(left.pendingHitDefTargets).toEqual([]);
    expect(right.pendingHitDefTargets).toEqual([]);

    right.runtime.hitVars = { hitId: 43 };
    expect(world.resolvePriorityClash({ left, right, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(1);
    expect(left.runtime.life).toBe(77);
    expect(right.runtime.life).toBe(83);
  });

  it("enforces direct HitDef NoChainID for the same source player during hitshake or the latest targeting actor", () => {
    const resolve = (input: {
      noChainIds?: number[];
      previousHitId?: number;
      previousSourcePlayerId?: number;
      previousSourceActorId?: string;
      hitPause?: number;
    }) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const world = new RuntimeCombatResolutionWorld();
      const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
      const attacker = actor("p1", "P1", contactWorld, {
        playerId: 56,
        currentMove: move({ damage: 17, ...(input.noChainIds === undefined ? {} : { noChainIds: input.noChainIds }) }),
        moveTick: 1,
        hitDefTargets: [],
        pendingHitDefTargets: [],
      });
      const defender = actor("p2", "P2", contactWorld, {
        runtime: runtimeState({
          pos: { x: 10, y: 0 },
          life: 100,
          ...(input.previousHitId === undefined
            ? {}
            : {
                hitVars: {
                  hitId: input.previousHitId,
                  ...(input.previousSourcePlayerId === undefined ? {} : { sourcePlayerId: input.previousSourcePlayerId }),
                  ...(input.previousSourceActorId === undefined ? {} : { sourceActorId: input.previousSourceActorId }),
                },
              }),
        }),
      });
      defender.hitPause = input.hitPause ?? 0;
      const logs: string[] = [];
      const result = world.resolveDirect({
        attacker,
        defender,
        ...directInputBase(contactWorld, directCombatWorld, logs),
      });
      return { attacker, defender, logs, result };
    };

    for (const rejected of [
      resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 56, previousSourceActorId: "other", hitPause: 2 }),
      resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 56, previousSourceActorId: "p1" }),
    ]) {
      expect(rejected.result).toEqual({ kind: "skipped", reason: "nochainid-rejected" });
      expect(rejected.defender.runtime.life).toBe(100);
      expect(rejected.attacker.pendingHitDefTargets).toEqual([]);
      expect(rejected.logs).toEqual(["P2 rejected P1 S,NA via NoChainID 43"]);
    }

    for (const accepted of [
      resolve({ previousHitId: 43, previousSourcePlayerId: 56, previousSourceActorId: "p1", hitPause: 2 }),
      resolve({ noChainIds: [-1], previousHitId: 43, previousSourcePlayerId: 56, previousSourceActorId: "p1", hitPause: 2 }),
      resolve({ noChainIds: [42], previousHitId: 43, previousSourcePlayerId: 56, previousSourceActorId: "p1", hitPause: 2 }),
      resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 57, previousSourceActorId: "other", hitPause: 2 }),
      resolve({ noChainIds: [43], previousHitId: 43, previousSourcePlayerId: 56, previousSourceActorId: "other" }),
    ]) {
      expect(accepted.result).toMatchObject({ kind: "hit", damage: 17 });
      expect(accepted.defender.runtime.life).toBe(83);
      expect(accepted.attacker.pendingHitDefTargets).toEqual(["p2"]);
    }
  });

  it("splits equal direct ChainID and NoChainID by MUGEN/Ikemen profile", () => {
    const resolve = (runtimeProfile: "mugen-1.1" | "ikemen-go" | "unknown", includeChainId = true) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const attacker = actor("p1", "P1", contactWorld, {
        playerId: 56,
        currentMove: move({
          damage: 17,
          noChainIds: [43],
          ...(includeChainId ? { hitVars: { chainId: 43 } } : {}),
        }),
        moveTick: 1,
        hitDefTargets: [],
        pendingHitDefTargets: [],
      });
      const defender = actor("p2", "P2", contactWorld, {
        runtime: runtimeState({
          pos: { x: 10, y: 0 },
          life: 100,
          hitVars: { hitId: 43, sourcePlayerId: 56, sourceActorId: "p1" },
        }),
      });
      const logs: string[] = [];
      const result = new RuntimeCombatResolutionWorld().resolveDirect({
        attacker,
        defender,
        runtimeProfile,
        ...directInputBase(contactWorld, new RuntimeDirectCombatWorld(contactWorld), logs),
      });
      return { life: defender.runtime.life, logs, result };
    };

    expect(resolve("mugen-1.1")).toMatchObject({ life: 83, result: { kind: "hit", damage: 17 } });
    for (const profile of ["ikemen-go", "unknown"] as const) {
      expect(resolve(profile)).toEqual({
        life: 100,
        logs: ["P2 rejected P1 S,NA via NoChainID 43"],
        result: { kind: "skipped", reason: "nochainid-rejected" },
      });
    }
    expect(resolve("mugen-1.1", false)).toEqual({
      life: 100,
      logs: ["P2 rejected P1 S,NA via NoChainID 43"],
      result: { kind: "skipped", reason: "nochainid-rejected" },
    });
  });

  it("enforces direct HitDef NoChainID before committing an equal-priority bilateral hit", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const left = actor("p3", "P3", contactWorld, {
      playerId: 56,
      runtime: runtimeState({ pos: { x: -10, y: 0 }, life: 100 }),
      currentMove: move({ priority: 4, damage: 17, noChainIds: [43] }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const right = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({
        pos: { x: 10, y: 0 },
        facing: -1,
        life: 100,
        hitVars: { hitId: 43, sourcePlayerId: 56, sourceActorId: "p3" },
      }),
      currentMove: move({ priority: 4, damage: 23 }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    expect(world.resolvePriorityClash({ left, right, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(0);
    expect(left.runtime.life).toBe(100);
    expect(right.runtime.life).toBe(100);

    right.runtime.hitVars = { hitId: 43, sourcePlayerId: 57, sourceActorId: "other" };
    expect(world.resolvePriorityClash({ left, right, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(1);
    expect(left.runtime.life).toBe(77);
    expect(right.runtime.life).toBe(83);
  });

  it("runs direct ChainID and NoChainID admission before defender ReversalDef", () => {
    const resolve = (moveOverrides: Partial<DemoMove>, previousHitVars: CharacterRuntimeState["hitVars"]) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const reversalWorld = new RuntimeReversalWorld(contactWorld);
      const attacker = actor("p1", "P1", contactWorld, {
        playerId: 56,
        runtime: runtimeState({ stateNo: 200 }),
        currentMove: move({ attr: "S,NA", ...moveOverrides }),
        moveTick: 1,
        hitDefTargets: [],
        pendingHitDefTargets: [],
      });
      const defender = actor("p2", "P2", contactWorld, {
        runtime: runtimeState({ pos: { x: 10, y: 0 }, stateNo: 300, hitVars: previousHitVars }),
      });
      reversalWorld.activate(defender, {
        attr: "S,NA",
        hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 },
        hitPause: 5,
      });
      const logs: string[] = [];
      const result = new RuntimeCombatResolutionWorld().resolveDirect({
        attacker,
        defender,
        ...directInputBase(contactWorld, new RuntimeDirectCombatWorld(contactWorld), logs),
        reversalWorld,
      });
      return { attacker, defender, logs, result };
    };

    const chainRejected = resolve({ hitVars: { chainId: 44 } }, { hitId: 43 });
    expect(chainRejected.result).toEqual({ kind: "skipped", reason: "chainid-rejected" });
    expect(chainRejected.logs).toEqual(["P2 rejected P1 S,NA via ChainID 44 (previous HitDef id 43)"]);

    const noChainRejected = resolve(
      { noChainIds: [43] },
      { hitId: 43, sourcePlayerId: 56, sourceActorId: "p1" },
    );
    expect(noChainRejected.result).toEqual({ kind: "skipped", reason: "nochainid-rejected" });
    expect(noChainRejected.logs).toEqual(["P2 rejected P1 S,NA via NoChainID 43"]);

    for (const rejected of [chainRejected, noChainRejected]) {
      expect([rejected.attacker.hasHit, rejected.defender.hasHit]).toEqual([false, false]);
      expect([rejected.attacker.hitPause, rejected.defender.hitPause]).toEqual([0, 0]);
      expect([rejected.attacker.runtime.stateNo, rejected.defender.runtime.stateNo]).toEqual([200, 300]);
      expect(rejected.attacker.pendingHitDefTargets).toEqual([]);
      expect(rejected.attacker.targets).toEqual([]);
    }

    const accepted = resolve({ hitVars: { chainId: 43 } }, { hitId: 43 });
    expect(accepted.result).toMatchObject({ kind: "reversal" });
    expect([accepted.attacker.hasHit, accepted.defender.hasHit]).toEqual([true, true]);
    expect([accepted.attacker.hitPause, accepted.defender.hitPause]).toEqual([5, 5]);
  });

  it("rejects positive receiver unhittabletime before direct hit or ReversalDef mutation", () => {
    const resolve = (withReversal: boolean, unhittableTime: number) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const reversalWorld = new RuntimeReversalWorld(contactWorld);
      const attacker = actor("p1", "P1", contactWorld, {
        runtime: runtimeState({ stateNo: 200 }),
        currentMove: move({ attr: "S,NA", damage: 17 }),
        moveTick: 1,
        hitDefTargets: [],
        pendingHitDefTargets: [],
      });
      const defender = actor("p2", "P2", contactWorld, {
        runtime: runtimeState({ pos: { x: 10, y: 0 }, stateNo: 300, life: 100, unhittableTime }),
      });
      if (withReversal) {
        reversalWorld.activate(defender, {
          attr: "S,NA",
          hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 },
          hitPause: 5,
          unhittableTime: [1, 7],
        });
      }
      const logs: string[] = [];
      const result = new RuntimeCombatResolutionWorld().resolveDirect({
        attacker,
        defender,
        ...directInputBase(contactWorld, new RuntimeDirectCombatWorld(contactWorld), logs),
        reversalWorld,
      });
      return { attacker, defender, logs, result };
    };

    for (const withReversal of [false, true]) {
      const rejected = resolve(withReversal, 2);
      expect(rejected.result).toEqual({ kind: "skipped", reason: "unhittable-time" });
      expect(rejected.logs).toEqual(["P2 rejected P1 S,NA via HitDef unhittabletime"]);
      expect(rejected.attacker.hasHit).toBe(false);
      expect(rejected.defender.hasHit).toBe(false);
      expect(rejected.defender.runtime.life).toBe(100);
      expect(rejected.defender.runtime.unhittableTime).toBe(2);
    }

    expect(resolve(false, 0).result).toMatchObject({ kind: "hit", damage: 17 });
    const reversed = resolve(true, 0);
    expect(reversed.result).toMatchObject({ kind: "reversal" });
    expect(reversed.attacker.runtime.unhittableTime).toBe(7);
    expect(reversed.defender.runtime.unhittableTime).toBe(1);
  });

  it("blocks a later incoming HitDef with the accepted attacker's unhittabletime", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const logs: string[] = [];
    const p1 = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200, life: 100 }),
      currentMove: move({ damage: 10, unhittableTime: [6, -1] }),
      moveTick: 1,
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const p2 = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, stateNo: 300, life: 100 }),
      hitDefTargets: [],
      pendingHitDefTargets: [],
    });
    const base = directInputBase(contactWorld, directCombatWorld, logs);

    expect(world.resolveDirect({ attacker: p1, defender: p2, ...base })).toMatchObject({ kind: "hit", damage: 10 });
    expect(p1.runtime.unhittableTime).toBe(6);
    expect(p2.runtime.life).toBe(90);

    rearmHitDef(p2, move({ damage: 40 }));
    expect(world.resolveDirect({ attacker: p2, defender: p1, ...base })).toEqual({
      kind: "skipped",
      reason: "unhittable-time",
    });
    expect(p1.runtime.life).toBe(100);
    expect(p2.pendingHitDefTargets).toEqual([]);
    expect(logs.at(-1)).toBe("P1 rejected P2 S,NA via HitDef unhittabletime");
  });

  it("does not prepare equal-priority custom state redirects during pending state change", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const left = actor("p3", "P3", contactWorld, {
      runtime: runtimeState({ pos: { x: -10, y: 0 }, stateChangeTmp: true, actTmp: 1 }),
      currentMove: move({ priority: 4, p1StateNo: 777 }),
      moveTick: 1,
    });
    const right = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1 }),
      currentMove: move({ priority: 4 }),
      moveTick: 1,
    });
    const logs: string[] = [];
    const base = directInputBase(contactWorld, directCombatWorld, logs);

    expect(world.resolvePriorityClash({ left, right, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(0);
    expect(left.runtime.life).toBe(100);
    expect(right.runtime.life).toBe(100);
    expect(left.currentMove).toBeDefined();
    expect(right.currentMove).toBeDefined();
    expect(logs).toEqual([]);
  });

  it("clears unconsumed equal-priority candidates before later moves", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const left = actor("p3", "P3", contactWorld, { currentMove: move({ priority: 4 }), moveTick: 1 });
    const right = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1 }),
      currentMove: move({ priority: 4 }),
      moveTick: 1,
    });
    const base = {
      directCombatWorld,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      log: () => undefined,
    };

    world.resolvePriorityClash({ left, right, directCombatWorld });
    left.currentMove = move({ priority: 7, damage: 31 });
    right.currentMove = move({ priority: 1, damage: 9 });
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(0);
    expect(left.runtime.life).toBe(100);
    expect(right.runtime.life).toBe(100);
    expect(world.resolveEqualPriorityOutcomes({ actors: [left, right], ...base })).toBe(0);
  });

  it("lets equal-priority Hit beat Miss while suppressing only the Miss direction for the frame", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const hit = actor("p3", "P3", contactWorld, { currentMove: move({ priority: 4, priorityType: "hit", damage: 17 }), moveTick: 1 });
    const miss = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1 }),
      currentMove: move({ priority: 4, priorityType: "miss", damage: 29 }),
      moveTick: 1,
    });
    const logs: string[] = [];
    const base = directInputBase(contactWorld, directCombatWorld, logs);

    expect(world.resolvePriorityClash({ left: hit, right: miss, directCombatWorld })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({ actors: [hit, miss], ...base })).toBe(1);
    expect(world.resolveDirect({ attacker: miss, defender: hit, ...base })).toEqual({ kind: "skipped", reason: "priority-no-hit" });
    expect(world.resolveDirect({ attacker: hit, defender: miss, ...base })).toMatchObject({ kind: "hit", damage: 17 });
    expect(hit.runtime.life).toBe(100);
    expect(miss.runtime.life).toBe(83);
    expect(logs[0]).toBe("HitDef priority clash: P3 Hit beat P4 Miss at priority 4");
  });

  it("keeps both HitDefs active after an equal-priority Hit versus Dodge no-hit tie", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const hitMove = move({ priority: 4, priorityType: "hit" });
    const dodgeMove = move({ priority: 4, priorityType: "dodge" });
    const hit = actor("p3", "P3", contactWorld, { currentMove: hitMove, moveTick: 1 });
    const dodge = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1 }),
      currentMove: dodgeMove,
      moveTick: 1,
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    world.resolvePriorityClash({ left: hit, right: dodge, directCombatWorld });
    expect(world.resolveEqualPriorityOutcomes({ actors: [hit, dodge], ...base })).toBe(1);
    expect(world.resolveDirect({ attacker: hit, defender: dodge, ...base })).toEqual({ kind: "skipped", reason: "priority-no-hit" });
    expect(world.resolveDirect({ attacker: dodge, defender: hit, ...base })).toEqual({ kind: "skipped", reason: "priority-no-hit" });
    expect(hit.currentMove).toBe(hitMove);
    expect(dodge.currentMove).toBe(dodgeMove);
    expect(hit.runtime.life).toBe(100);
    expect(dodge.runtime.life).toBe(100);
  });

  it("does not report a Hit-over-Miss victory when the winning contact is rejected", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const hit = actor("p3", "P3", contactWorld, { currentMove: move({ priority: 4, priorityType: "hit" }), moveTick: 1 });
    const miss = actor("p4", "P4", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1 }),
      currentMove: move({ priority: 4, priorityType: "miss" }),
      moveTick: 1,
    });
    const logs: string[] = [];
    const base = { ...directInputBase(contactWorld, directCombatWorld, logs), canDefenderBeHit: () => false };

    world.resolvePriorityClash({ left: hit, right: miss, directCombatWorld });
    world.resolveEqualPriorityOutcomes({ actors: [hit, miss], ...base });
    expect(world.resolveDirect({ attacker: hit, defender: miss, ...base })).toEqual({ kind: "skipped", reason: "superpause-unhittable" });
    expect(logs).toEqual(["P4 rejected P3 S,NA via SuperPause unhittable"]);
  });

  it("prepares a connected three-actor equal-priority graph before mutation", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const actors = [
      actor("p1", "P1", contactWorld, { currentMove: move({ priority: 4, damage: 10, affectTeam: 0 }), moveTick: 1, hitDefTargets: [], pendingHitDefTargets: [] }),
      actor("p2", "P2", contactWorld, { currentMove: move({ priority: 4, damage: 20, affectTeam: 0 }), moveTick: 1, hitDefTargets: [], pendingHitDefTargets: [] }),
      actor("p3", "P3", contactWorld, { currentMove: move({ priority: 4, damage: 30, affectTeam: 0 }), moveTick: 1, hitDefTargets: [], pendingHitDefTargets: [] }),
    ];
    for (let leftIndex = 0; leftIndex < actors.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < actors.length; rightIndex += 1) {
        world.resolvePriorityClash({ left: actors[leftIndex]!, right: actors[rightIndex]!, directCombatWorld });
      }
    }
    const logs: string[] = [];
    const resolved = world.resolveEqualPriorityOutcomes({
      actors,
      directCombatWorld,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(resolved).toBe(3);
    expect(actors.map(({ runtime }) => runtime.life)).toEqual([50, 60, 70]);
    expect(actors.map(({ pendingHitDefTargets }) => pendingHitDefTargets)).toEqual([
      ["p2", "p3"],
      ["p1", "p3"],
      ["p1", "p2"],
    ]);
    expect(actors.every(({ currentMove }) => currentMove === undefined)).toBe(true);
    expect(logs).toHaveLength(9);
  });

  it("owns bounded direct contact ordering, target memory, presentation, and received damage", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200, power: 10 }),
      currentMove: move({ targetId: 7, hitSound: "S5,0", hitSpark: "S7000" }),
      moveTick: 2,
      hasHit: true,
      hitDefTargets: ["p4"],
      pendingHitDefTargets: [],
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 0, life: 100 }),
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(result).toMatchObject({ kind: "hit", damage: 25, message: "P1 hit P2 for 25" });
    expect(attacker.hasHit).toBe(true);
    expect(attacker.targets).toEqual([{ actorId: "p2", targetId: 7, age: 0 }]);
    expect(attacker.pendingHitDefTargets).toEqual(["p2"]);
    expect(attacker.hitDefTargets).toEqual(["p4"]);
    expect(attacker.soundEvents[0]).toMatchObject({
      type: "PlaySnd",
      group: 5,
      index: 0,
      contactKind: "hit",
      contactTick: 9,
    });
    expect(attacker.hitEffectEvents[0]).toMatchObject({
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7000,
      contactKind: "hit",
      contactTick: 9,
    });
    expect(defender.runtime.life).toBe(75);
    expect(runtimeMoveContactValue(attacker.contact, 200, "hit")).toBe(0);
    expect(runtimeReceivedDamageValue(defender.contact, 0)).toBe(25);
    expect(logs).toEqual(["P1 hit P2 for 25"]);
  });

  it("rejects direct custom-state HitDefs before HitOverride redirect", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const entries: string[] = [];
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA", targetId: 77, p2StateNo: 888, p2GetP1State: true }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        stateNo: 0,
        life: 100,
        hitOverrides: [{ slot: 1, attr: "S,NA", stateNo: 777, remaining: 30 }],
      }),
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(entries),
      log: (line) => logs.push(line),
    });

    expect(result).toEqual({ kind: "skipped", reason: "hitoverride-custom-state-miss" });
    expect(attacker.hasHit).toBe(false);
    expect(attacker.targets).toEqual([]);
    expect(entries).toEqual([]);
    expect(defender.runtime.stateNo).toBe(0);
    expect(defender.runtime.life).toBe(100);
    expect(logs).toEqual(["P2 rejected P1 S,NA because active override cannot receive custom-state HitDef"]);
  });

  const pendingStateRedirectCases: Array<{
    name: string;
    attackerRuntime: Partial<CharacterRuntimeState>;
    defenderRuntime: Partial<CharacterRuntimeState>;
    move: Partial<DemoMove>;
  }> = [
    {
      name: "target-owned p2stateno",
      attackerRuntime: { stateNo: 200 },
      defenderRuntime: { stateChangeTmp: true, hitTmp: 1, actTmp: 1 },
      move: { p2StateNo: 888 },
    },
    {
      name: "attacker-owned p1stateno",
      attackerRuntime: { stateNo: 200, stateChangeTmp: true, actTmp: 1 },
      defenderRuntime: {},
      move: { p1StateNo: 777 },
    },
  ];

  it.each(pendingStateRedirectCases)("rejects $name while stchtmp remains pending", ({ attackerRuntime, defenderRuntime, move: moveOverrides }) => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const logs: string[] = [];
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState(attackerRuntime),
      currentMove: move({ attr: "S,NA", ...moveOverrides }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 0, life: 100, ...defenderRuntime }),
    });

    const result = world.resolveDirect({
      attacker,
      defender,
      ...directInputBase(contactWorld, new RuntimeDirectCombatWorld(contactWorld), logs),
    });

    expect(result).toEqual({ kind: "skipped", reason: "state-change-pending" });
    expect(attacker.hasHit).toBe(false);
    expect(attacker.targets).toEqual([]);
    expect(defender.runtime.life).toBe(100);
    expect(logs).toEqual(["P2 rejected P1 S,NA via pending state change"]);
  });

  const pendingReversalStateRedirectCases: Array<{
    name: string;
    attackerRuntime: Partial<CharacterRuntimeState>;
    reverserRuntime: Partial<CharacterRuntimeState>;
    activation: { p1StateNo?: number; p2StateNo?: number };
  }> = [
    {
      name: "reverser-owned p1stateno",
      attackerRuntime: {},
      reverserRuntime: { stateChangeTmp: true, actTmp: 1 },
      activation: { p1StateNo: 777 },
    },
    {
      name: "target-owned p2stateno",
      attackerRuntime: { stateChangeTmp: true, hitTmp: 1 },
      reverserRuntime: {},
      activation: { p2StateNo: 888 },
    },
  ];

  it.each(pendingReversalStateRedirectCases)("rejects ReversalDef $name while stchtmp remains pending", ({ attackerRuntime, reverserRuntime, activation }) => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, ...attackerRuntime }),
      currentMove: move({ attr: "S,NA" }),
      moveTick: 2,
    });
    const reverser = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ ...reverserRuntime }),
    });
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 },
      hitPause: 3,
      ...activation,
    });
    const logs: string[] = [];

    const result = new RuntimeCombatResolutionWorld().resolveDirect({
      attacker,
      defender: reverser,
      ...directInputBase(contactWorld, new RuntimeDirectCombatWorld(contactWorld), logs),
      reversalWorld,
    });

    expect(result).toEqual({ kind: "skipped", reason: "state-change-pending" });
    expect(attacker.hasHit).toBe(false);
    expect(reverser.hasHit).toBe(false);
    expect(attacker.targets).toEqual([]);
    expect(reverser.targets).toEqual([]);
    expect(logs).toEqual(["P1 rejected P2 S,NA via pending state change"]);
  });

  it("rejects target-owned p2getp1state zero HitDefs before HitOverride redirect", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const entries: string[] = [];
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA", targetId: 77, p2StateNo: 889, p2GetP1State: false }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        stateNo: 0,
        life: 100,
        hitOverrides: [{ slot: 1, attr: "S,NA", stateNo: 777, remaining: 30 }],
      }),
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(entries),
      log: (line) => logs.push(line),
    });

    expect(result).toEqual({ kind: "skipped", reason: "hitoverride-custom-state-miss" });
    expect(attacker.hasHit).toBe(false);
    expect(attacker.targets).toEqual([]);
    expect(entries).toEqual([]);
    expect(defender.runtime.stateNo).toBe(0);
    expect(defender.runtime.life).toBe(100);
    expect(logs).toEqual(["P2 rejected P1 S,NA because active override cannot receive custom-state HitDef"]);
  });

  it("lets explicit MissOnOverride zero route custom-state HitDefs through HitOverride", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const entries: string[] = [];
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200, unhittableTime: 4 }),
      currentMove: move({ attr: "S,NA", targetId: 77, p2StateNo: 888, p2GetP1State: true, missOnOverride: false, unhittableTime: [7, 9] }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        stateNo: 0,
        life: 100,
        unhittableTime: 0,
        hitOverrides: [{ slot: 1, attr: "S,NA", stateNo: 777, remaining: 30 }],
      }),
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(entries),
      log: (line) => logs.push(line),
    });

    expect(result).toEqual({ kind: "hitoverride", message: "P2 HitOverride slot 1 redirected P1 to state 777" });
    expect(attacker.hasHit).toBe(true);
    expect(attacker.targets).toEqual([{ actorId: "p2", targetId: 77, age: 0 }]);
    expect(attacker.pendingHitDefTargets).toEqual(["p2"]);
    expect(entries).toEqual(["p2:777:self"]);
    expect(defender.runtime.stateNo).toBe(777);
    expect(defender.runtime.life).toBe(100);
    expect(attacker.runtime.unhittableTime).toBe(7);
    expect(defender.runtime.unhittableTime).toBe(9);
    expect(logs).toEqual(["P2 HitOverride slot 1 redirected P1 to state 777"]);
  });

  it("lets explicit MissOnOverride one reject non-custom HitDefs before HitOverride", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const entries: string[] = [];
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200, unhittableTime: 4 }),
      currentMove: move({ attr: "S,NA", targetId: 77, missOnOverride: true, unhittableTime: [7, 9] }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        stateNo: 0,
        life: 100,
        unhittableTime: 0,
        hitOverrides: [{ slot: 1, attr: "S,NA", stateNo: 777, remaining: 30 }],
      }),
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 9,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(entries),
      log: (line) => logs.push(line),
    });

    expect(result).toEqual({ kind: "skipped", reason: "hitoverride-custom-state-miss" });
    expect(attacker.hasHit).toBe(false);
    expect(attacker.targets).toEqual([]);
    expect(entries).toEqual([]);
    expect(defender.runtime.stateNo).toBe(0);
    expect(defender.runtime.life).toBe(100);
    expect(attacker.runtime.unhittableTime).toBe(4);
    expect(defender.runtime.unhittableTime).toBe(0);
    expect(logs).toEqual(["P2 rejected P1 S,NA because missonoverride = 1 forces active override miss"]);
  });

  it("routes ReversalDef contact through the countered actor's HitOverride payload", () => {
    const createRoute = ({
      attackerOverride = false,
      reverserOverride = false,
      missOnOverride,
      p1StateNo = 777,
    }: {
      attackerOverride?: boolean;
      reverserOverride?: boolean;
      missOnOverride?: boolean;
      p1StateNo?: number | null;
    } = {}) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const reversalWorld = new RuntimeReversalWorld(contactWorld);
      const override = { slot: 1, attr: "S,SP", stateNo: 889, remaining: 30, guardFlag: "A" };
      const attacker = actor("p1", "P1", contactWorld, {
        runtime: runtimeState({ stateNo: 200, unhittableTime: 11, ...(attackerOverride ? { hitOverrides: [override] } : {}) }),
        currentMove: move({ attr: "S,NA", guardFlag: "H", targetId: 77 }),
        moveTick: 2,
      });
      const defender = actor("p2", "P2", contactWorld, {
        runtime: runtimeState({
          pos: { x: 18, y: 0 },
          stateNo: 0,
          life: 100,
          unhittableTime: 0,
          ...(reverserOverride ? { hitOverrides: [override] } : {}),
        }),
      });
      reversalWorld.activate(defender, {
        attr: "S,NA",
        hitDefAttr: "S,SP",
        guardFlag: "A",
        hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 },
        hitPause: 3,
        targetId: 77,
        unhittableTime: [5, 6],
        ...(p1StateNo === null ? {} : { p1StateNo }),
        ...(missOnOverride === undefined ? {} : { missOnOverride }),
      });
      return { attacker, contactWorld, defender, reversalWorld };
    };

    const reverserOwnedOverride = createRoute({ reverserOverride: true });
    const reverserOwnedLogs: string[] = [];
    const reverserOwnedResult = new RuntimeCombatResolutionWorld().resolveDirect({
      attacker: reverserOwnedOverride.attacker,
      defender: reverserOwnedOverride.defender,
      ...directInputBase(
        reverserOwnedOverride.contactWorld,
        new RuntimeDirectCombatWorld(reverserOwnedOverride.contactWorld),
        reverserOwnedLogs,
      ),
      reversalWorld: reverserOwnedOverride.reversalWorld,
    });

    expect(reverserOwnedResult).toMatchObject({ kind: "reversal" });
    expect(reverserOwnedOverride.attacker.runtime.moveType).toBe("H");
    expect(reverserOwnedOverride.defender.runtime.stateNo).toBe(777);
    expect(reverserOwnedLogs).toEqual(["P2 reversed P1 p1->777"]);

    const defaultMissRoute = createRoute({ attackerOverride: true });
    const defaultMissLogs: string[] = [];
    const defaultMissResult = new RuntimeCombatResolutionWorld().resolveDirect({
      attacker: defaultMissRoute.attacker,
      defender: defaultMissRoute.defender,
      ...directInputBase(
        defaultMissRoute.contactWorld,
        new RuntimeDirectCombatWorld(defaultMissRoute.contactWorld),
        defaultMissLogs,
      ),
      reversalWorld: defaultMissRoute.reversalWorld,
    });

    expect(defaultMissResult).toEqual({ kind: "skipped", reason: "hitoverride-custom-state-miss" });
    expect(defaultMissRoute.attacker.hasHit).toBe(false);
    expect(defaultMissRoute.attacker.runtime.stateNo).toBe(200);
    expect(defaultMissRoute.defender.runtime.stateNo).toBe(0);
    expect(defaultMissRoute.attacker.runtime.unhittableTime).toBe(11);
    expect(defaultMissRoute.defender.runtime.unhittableTime).toBe(0);
    expect(defaultMissLogs).toEqual(["P1 rejected P2 S,SP because active override cannot receive custom-state ReversalDef"]);

    const forcedMissRoute = createRoute({ attackerOverride: true, missOnOverride: true, p1StateNo: null });
    const forcedMissResult = new RuntimeCombatResolutionWorld().resolveDirect({
      attacker: forcedMissRoute.attacker,
      defender: forcedMissRoute.defender,
      ...directInputBase(
        forcedMissRoute.contactWorld,
        new RuntimeDirectCombatWorld(forcedMissRoute.contactWorld),
        [],
      ),
      reversalWorld: forcedMissRoute.reversalWorld,
    });

    expect(forcedMissResult).toEqual({ kind: "skipped", reason: "hitoverride-custom-state-miss" });
    expect(forcedMissRoute.attacker.runtime.stateNo).toBe(200);
    expect(forcedMissRoute.defender.runtime.stateNo).toBe(0);

    const redirectRoute = createRoute({ attackerOverride: true, missOnOverride: false });
    const redirectResult = new RuntimeCombatResolutionWorld().resolveDirect({
      attacker: redirectRoute.attacker,
      defender: redirectRoute.defender,
      ...directInputBase(
        redirectRoute.contactWorld,
        new RuntimeDirectCombatWorld(redirectRoute.contactWorld),
        [],
      ),
      reversalWorld: redirectRoute.reversalWorld,
    });

    expect(redirectResult).toEqual({ kind: "hitoverride", message: "P1 HitOverride slot 1 redirected P2 to state 889" });
    expect(redirectRoute.attacker.runtime.stateNo).toBe(889);
    expect(redirectRoute.attacker.runtime.moveType).toBe("I");
    expect(redirectRoute.defender.hasHit).toBe(true);
    expect(redirectRoute.defender.runtime.stateNo).toBe(0);
    expect(redirectRoute.defender.targets).toEqual([{ actorId: "p1", targetId: 77, age: 0 }]);
    expect(redirectRoute.attacker.runtime.unhittableTime).toBe(6);
    expect(redirectRoute.defender.runtime.unhittableTime).toBe(5);
  });

  it("rejects direct HitDef contact while SuperPause unhittable protects the defender", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ stateNo: 200, spritePriority: 8 }),
      currentMove: move({ attr: "S,NA", p1SpritePriority: 5, p2SpritePriority: -4 }),
      moveTick: 2,
    });
    attacker.definition.hitDefPriorityProfile = "mugen-1.1";
    const defender = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100, spritePriority: 7 }),
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      canDefenderBeHit: () => false,
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(result).toEqual({ kind: "skipped", reason: "superpause-unhittable" });
    expect(attacker.hasHit).toBe(false);
    expect(defender.runtime.life).toBe(100);
    expect(defender.runtime.moveType).toBe("I");
    expect(attacker.runtime.spritePriority).toBe(8);
    expect(defender.runtime.spritePriority).toBe(7);
    expect(attacker.runtime.hitDefSpritePriority).toBeUndefined();
    expect(defender.runtime.hitDefSpritePriority).toBeUndefined();
    expect(logs).toEqual(["P1 rejected P2 S,NA via SuperPause unhittable"]);
  });

  it("prioritizes ReversalDef over SuperPause-unhittable direct contact", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA" }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    reversalWorld.activate(defender, {
      attr: "S,NA",
      hitbox: { x1: 0, y1: -40, x2: 50, y2: -1 },
      hitPause: 5,
      p1StateNo: 777,
      p2StateNo: 888,
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld,
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 19,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      canDefenderBeHit: () => false,
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(result).toMatchObject({ kind: "reversal", message: "P2 reversed P1 p1->777 p2->888" });
    expect(attacker.hasHit).toBe(true);
    expect(logs).toEqual(["P2 reversed P1 p1->777 p2->888"]);
    expect(defender.runtime.stateNo).toBe(777);
    expect(defender.runtime.life).toBe(100);
  });

  it("lets direct HitDef ignore an active ReversalDef", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA", damage: 25, ignoreReversalDef: true }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    reversalWorld.activate(defender, {
      attr: "S,NA",
      hitbox: { x1: 0, y1: -40, x2: 50, y2: -1 },
      hitPause: 5,
      p1StateNo: 777,
      p2StateNo: 888,
    });
    const logs: string[] = [];

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld,
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 20,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(result).toMatchObject({ kind: "hit", damage: 25 });
    expect(attacker.hasHit).toBe(true);
    expect(defender.runtime.life).toBe(75);
    expect(defender.runtime.stateNo).not.toBe(777);
    expect(logs).toEqual(["P1 hit P2 for 25"]);
  });

  it("checks every resolved root Clsn1 box before direct ReversalDef contact", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA", hitbox: { x1: 100, y1: -30, x2: 120, y2: -2 } }),
      moveTick: 2,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    reversalWorld.activate(defender, {
      attr: "S,NA",
      hitbox: { x1: 0, y1: -40, x2: 50, y2: -1 },
      hitPause: 5,
      p1StateNo: 777,
      p2StateNo: 888,
    });

    const result = world.resolveDirect({
      attacker,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld,
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 19,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      getCollisionBoxes: (target, boxType) =>
        target.id === "p1" && boxType === "clsn1"
          ? [{ x1: 0, y1: -30, x2: 36, y2: -2 }]
          : undefined,
      canDefenderBeHit: () => false,
      stateHooks: hooks(),
      log: () => undefined,
    });

    expect(result).toMatchObject({ kind: "reversal", message: "P2 reversed P1 p1->777 p2->888" });
  });

  it("applies only the first directed ReversalDef clash candidate", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const p1 = actor("p1", "P1", contactWorld, { runtime: runtimeState({ stateNo: 300 }) });
    const p2 = actor("p2", "P2", contactWorld, { runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 301 }) });
    for (const fighter of [p1, p2]) {
      reversalWorld.activate(fighter, {
        attr: "S,NA",
        hitbox: fighter === p1
          ? { x1: 200, y1: -40, x2: 240, y2: -1 }
          : { x1: -40, y1: -40, x2: 40, y2: -1 },
        hitPause: 3,
        targetId: 127,
      });
    }
    const logs: string[] = [];
    const input = {
      reversalWorld,
      getCollisionBoxes: (_actor: TestActor, boxType: "clsn1" | "clsn2" | "size" | "none") =>
        boxType === "clsn1" ? [{ x1: -40, y1: -40, x2: 40, y2: -1 }] : undefined,
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      stateHooks: hooks(),
      log: (line: string) => logs.push(line),
    };

    expect(world.resolveReversalClash({ ...input, reverser: p2, getter: p1 })).toEqual({
      kind: "reversal",
      message: "P2 reversed P1",
    });
    expect(world.resolveReversalClash({ ...input, reverser: p1, getter: p2 })).toEqual({
      kind: "skipped",
      reason: "missing-reversal",
    });
    expect(logs).toEqual(["P2 reversed P1"]);
    expect(p1.currentMove).toBeUndefined();
    expect(p2.currentMove).toBeUndefined();
    expect(p2.targets).toContainEqual(expect.objectContaining({ actorId: "p1", targetId: 127 }));
    expect(p2.pendingHitDefTargets).toEqual(["p1"]);
    expect(p1.pendingHitDefTargets).toEqual(["p2"]);
    expect(p2.runtime.power).toBe(25);
  });

  it("rejects a pending ReversalDef clash before state mutation", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const reverser = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateChangeTmp: true, actTmp: 1 }),
    });
    const getter = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 } }),
    });
    reversalWorld.activate(reverser, {
      attr: "S,NA",
      hitbox: { x1: -40, y1: -40, x2: 40, y2: -1 },
      hitPause: 3,
      p1StateNo: 777,
    });
    reversalWorld.activate(getter, {
      attr: "S,NA",
      hitbox: { x1: -40, y1: -40, x2: 40, y2: -1 },
      hitPause: 3,
    });
    const logs: string[] = [];

    const result = world.resolveReversalClash({
      reverser,
      getter,
      reversalWorld,
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(result).toEqual({ kind: "skipped", reason: "state-change-pending" });
    expect(reverser.currentMove?.isReversal).toBe(true);
    expect(getter.currentMove?.isReversal).toBe(true);
    expect(reverser.hasHit).toBe(false);
    expect(getter.hasHit).toBe(false);
    expect(logs).toEqual(["P2 rejected P1 S,NA via pending state change"]);
  });

  it("revalidates ReversalDef clash depth before mutation", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const p1 = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ combatDepth: { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] }, stateNo: 300 }),
    });
    const p2 = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ combatDepth: { position: 20, velocity: 0, size: [3, 3], attack: [4, 4] }, stateNo: 301 }),
    });
    for (const fighter of [p1, p2]) {
      reversalWorld.activate(fighter, {
        attr: "S,NA",
        hitbox: { x1: -40, y1: -40, x2: 40, y2: -1 },
        hitPause: 3,
      });
    }

    expect(world.resolveReversalClash({
      reverser: p2,
      getter: p1,
      reversalWorld,
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      stateHooks: hooks(),
      log: () => undefined,
    })).toEqual({ kind: "skipped", reason: "no-match" });
    expect(p1.currentMove?.isReversal).toBe(true);
    expect(p2.currentMove?.isReversal).toBe(true);
  });

  it("prioritizes ReversalDef over SuperPause-unhittable Projectile contact", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const world = new RuntimeCombatResolutionWorld();
    const projectile = projectileActor({ pos: { x: 0, y: 0 }, facing: 1 });
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 300 }),
      projectiles: [projectile],
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 12, y: 0 }, stateNo: 0, life: 100 }),
    });
    reversalWorld.activate(defender, {
      attr: "S,SP",
      hitbox: { x1: -20, y1: -24, x2: 30, y2: 12 },
      hitPause: 5,
      p1StateNo: 777,
      p2StateNo: 888,
    });
    const logs: string[] = [];

    world.resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld,
      effectLifecycleWorld: { markGetHit: (target) => logs.push(`mark:${target.id}`) },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 19,
      getHurtBoxes: () => [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      canDefenderBeHit: () => false,
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual(["P2 reversed P1 p1->777 p2->888"]);
    expect(attacker.hasHit).toBe(true);
    expect(defender.runtime.stateNo).toBe(777);
    expect(attacker.runtime.stateNo).toBe(888);
    expect(defender.runtime.life).toBe(100);
    expect(projectile).toMatchObject({ hasHit: false, hitsRemaining: 1 });
  });

  it("rejects Projectile ReversalDef redirects while either redirect owner is pending", () => {
    const cases = [
      { name: "reverser p1", defenderRuntime: { stateChangeTmp: true, actTmp: 1 }, attackerRuntime: {}, p1StateNo: 777, p2StateNo: undefined },
      { name: "projectile owner p2", defenderRuntime: {}, attackerRuntime: { stateChangeTmp: true, actTmp: 1 }, p1StateNo: undefined, p2StateNo: 888 },
    ] as const;

    for (const testCase of cases) {
      const contactWorld = new RuntimeContactMemoryWorld();
      const reversalWorld = new RuntimeReversalWorld(contactWorld);
      const projectile = projectileActor({ pos: { x: 0, y: 0 }, facing: 1 });
      const attacker = actor("p1", "P1", contactWorld, {
        runtime: runtimeState({ ...testCase.attackerRuntime, stateNo: 300 }),
        projectiles: [projectile],
      });
      const defender = actor("p2", "P2", contactWorld, {
        runtime: runtimeState({ ...testCase.defenderRuntime, pos: { x: 12, y: 0 }, stateNo: 0, life: 100 }),
      });
      reversalWorld.activate(defender, {
        attr: "S,SP",
        hitbox: { x1: -20, y1: -24, x2: 30, y2: 12 },
        hitPause: 5,
        p1StateNo: testCase.p1StateNo,
        p2StateNo: testCase.p2StateNo,
      });
      const logs: string[] = [];

      new RuntimeCombatResolutionWorld().resolveProjectile({
        attacker,
        defender,
        hitOverrideWorld: new RuntimeHitOverrideWorld(),
        reversalWorld,
        effectLifecycleWorld: { markGetHit: (target) => logs.push(`mark:${target.id}`) },
        guardWorld: new RuntimeGuardWorld(),
        getHitStateWorld: new RuntimeGetHitStateWorld(),
        hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
        contactPresentationWorld: new RuntimeContactPresentationWorld(),
        runtimeTick: 19,
        getHurtBoxes: () => [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
        stateHooks: hooks(),
        log: (line) => logs.push(line),
      });

      expect(logs, testCase.name).toEqual(["P2 rejected P1 projectile S,SP via pending state change"]);
      expect(attacker.hasHit, testCase.name).toBe(false);
      expect(defender.hasHit, testCase.name).toBe(false);
      expect(attacker.runtime.stateNo, testCase.name).toBe(300);
      expect(defender.runtime.stateNo, testCase.name).toBe(0);
      expect(defender.runtime.life, testCase.name).toBe(100);
      expect(projectile, testCase.name).toMatchObject({ hasHit: false, hitsRemaining: 1 });
    }
  });

  it("routes HitFlag P projectile cancellation through defender contact memory", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({
      action: {
        ...sparkAction(910),
        frames: [{
          ...sparkAction(910).frames[0],
          clsn2: [{ x1: 6, y1: -18, x2: 34, y2: 6 }],
        }],
      },
    });
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 300 }),
      projectiles: [projectile],
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 12, y: 0 }, stateNo: 5000, life: 100, assertSpecial: { flags: ["projtypecollision"], globalFlags: [], projTypeCollision: true } }),
      currentMove: move({ hitFlag: "H,L,A,F,P", hitbox: { x1: 100, y1: -30, x2: 120, y2: -2 } }),
      moveTick: 1,
    });

    const logs: string[] = [];
    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      effectLifecycleWorld: { markGetHit: () => undefined },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(defender.runtime.life).toBe(100);
    expect(defender.hasHit).toBe(true);
    expect(contactWorld.projectileCancelTime(defender.contact, 5000, 88)).toBe(0);
    expect(projectile).toMatchObject({ removalReason: "cancel", hasHit: true, lastCancelTime: 0 });
    expect(logs.some((line) => line.includes("HitFlag P"))).toBe(true);
  });

  it("uses the resolved root Clsn2 boxes for projectile target contact", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({
      action: {
        ...sparkAction(910),
        frames: [{
          ...sparkAction(910).frames[0],
          clsn1: [{ x1: 6, y1: -18, x2: 34, y2: 6 }],
        }],
      },
    });
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 300 }),
      projectiles: [projectile],
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 0, y: 0 }, stateNo: 5000, life: 100 }),
    });
    const logs: string[] = [];

    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      effectLifecycleWorld: { markGetHit: () => undefined },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: 100, y1: -40, x2: 124, y2: 0 }],
      getCollisionBoxes: (target, boxType) =>
        target.id === "p2" && boxType === "clsn2"
          ? [{ x1: 6, y1: -18, x2: 34, y2: 6 }]
          : undefined,
      stateHooks: hooks(),
      log: (line) => logs.push(line),
    });

    expect(defender.runtime.life).toBe(88);
    expect(projectile).toMatchObject({ removalReason: "hit", hasHit: true });
    expect(logs.some((line) => line.includes("P1 projectile hit P2 for 12"))).toBe(true);
  });

  it("uses paired Clsn2 boxes for direct contact when both players assert ProjTypeCollision", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ assertSpecial: { flags: ["projtypecollision"], globalFlags: [], projTypeCollision: true } }),
      currentMove: move({ hitbox: { x1: 100, y1: -30, x2: 120, y2: -2 }, damage: 19 }),
      moveTick: 1,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1, life: 100, assertSpecial: { flags: ["projtypecollision"], globalFlags: [], projTypeCollision: true } }),
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    expect(new RuntimeCombatResolutionWorld().resolveDirect({
      attacker,
      defender,
      ...base,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
    })).toMatchObject({ kind: "hit", damage: 19 });
    expect(defender.runtime.life).toBe(81);
  });

  it("selects direct target Clsn1 boxes for p2clsncheck and enforces p2clsnrequire", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ p2ClsnCheck: "clsn1", p2ClsnRequire: "clsn1", hitbox: { x1: 6, y1: -30, x2: 34, y2: -2 }, damage: 19 }),
      moveTick: 1,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1, life: 100 }),
      currentMove: move({ hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 } }),
      moveTick: 1,
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    expect(new RuntimeCombatResolutionWorld().resolveDirect({
      attacker,
      defender,
      ...base,
      getHurtBoxes: () => [{ x1: 100, y1: -40, x2: 124, y2: 0 }],
      getCollisionBoxes: (_target, boxType) =>
        boxType === "clsn1" ? [{ x1: -24, y1: -40, x2: 24, y2: 0 }] : [],
    })).toMatchObject({ kind: "hit", damage: 19 });
    expect(defender.runtime.life).toBe(81);
  });

  it("uses the resolved root Clsn1 boxes for direct HitDef contact", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "P1", contactWorld, {
      currentMove: move({ hitbox: { x1: 100, y1: -30, x2: 120, y2: -2 }, damage: 19 }),
      moveTick: 1,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1, life: 100 }),
    });
    const base = directInputBase(contactWorld, directCombatWorld, []);

    expect(new RuntimeCombatResolutionWorld().resolveDirect({
      attacker,
      defender,
      ...base,
      getCollisionBoxes: (target, boxType) =>
        target.id === "p1" && boxType === "clsn1"
          ? [{ x1: 0, y1: -30, x2: 36, y2: -2 }]
          : undefined,
    })).toMatchObject({ kind: "hit", damage: 19 });
    expect(defender.runtime.life).toBe(81);
  });

  it("uses paired Clsn2 boxes for priority clash admission when both players assert ProjTypeCollision", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const directCombatWorld = new RuntimeDirectCombatWorld(contactWorld);
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ assertSpecial: { flags: ["projtypecollision"], globalFlags: [], projTypeCollision: true } }),
      currentMove: move({ priority: 4, hitbox: { x1: 100, y1: -30, x2: 120, y2: -2 }, damage: 19 }),
      moveTick: 1,
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 10, y: 0 }, facing: -1, assertSpecial: { flags: ["projtypecollision"], globalFlags: [], projTypeCollision: true } }),
      currentMove: move({ priority: 4, hitbox: { x1: 100, y1: -30, x2: 120, y2: -2 }, damage: 23 }),
      moveTick: 1,
    });
    const world = new RuntimeCombatResolutionWorld();
    const logs: string[] = [];
    const base = directInputBase(contactWorld, directCombatWorld, logs);

    expect(world.resolvePriorityClash({
      left: attacker,
      right: defender,
      directCombatWorld,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
    })).toBeUndefined();
    expect(world.resolveEqualPriorityOutcomes({
      actors: [attacker, defender],
      ...base,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
    })).toBe(1);
    expect(attacker.runtime.life).toBe(77);
    expect(defender.runtime.life).toBe(81);
  });

  it("routes projectile callbacks through target, contact, presentation, and damage ownership hooks", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({
      projectileId: 88,
      serialId: "p1-projectile-0",
      hitSound: "S6,0",
      hitSoundValue: { rawPrefix: "S", group: 6, index: 0 },
      hitSpark: "S7001",
    });
    const calls: string[] = [];
    const resolver: ProjectileResolver = (ownerId, input) => {
      calls.push(`owner:${ownerId}`);
      input.rememberTarget(input.attacker, input.defender, projectile.targetId, projectile);
      input.recordProjectileContact?.(input.attacker, input.defender, projectile, "hit");
      input.recordReceivedDamage?.(input.defender, 12);
      input.emitProjectileContactEffects?.(input.attacker, input.defender, projectile, "hit");
      input.emitProjectileEnvShake?.(input.attacker, projectile);
    };
    const attacker = actor("p1", "P1", contactWorld, { runtime: runtimeState({ stateNo: 300 }), projectileResolver: resolver });
    const defender = actor("p2", "P2", contactWorld, { runtime: runtimeState({ stateNo: 5000 }) });

    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      effectLifecycleWorld: { markGetHit: (target) => calls.push(`mark:${target.id}`) },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      rememberProjectileTarget: (_source, _target, entry) => calls.push(`projectile-target:${entry.serialId}`),
      recordAudioOperation: (actor, operation) => calls.push(`audio:${actor.id}:${operation.value}`),
      emitProjectileEnvShake: (actor, entry) => calls.push(`envshake:${actor.id}:${entry.serialId}`),
      log: (line) => calls.push(`log:${line}`),
    });

    expect(calls).toEqual(["owner:p1", "projectile-target:p1-projectile-0", "audio:p1:S6,0", "envshake:p1:p1-projectile-0"]);
    expect(attacker.targets).toEqual([{ actorId: "p2", targetId: 88, age: 0 }]);
    expect(contactWorld.hasProjectileContact(attacker.contact, 300, "hit", 88)).toBe(true);
    expect(runtimeMoveHitCountValue(attacker.contact, 300, false)).toBe(1);
    expect(runtimeMoveHitCountValue(attacker.contact, 300, true)).toBe(1);
    expect(runtimeReceivedDamageValue(defender.contact, 5000)).toBe(12);
    expect(attacker.soundEvents[0]).toMatchObject({ type: "PlaySnd", group: 6, index: 0, contactKind: "hit" });
    expect(attacker.hitEffectEvents[0]).toMatchObject({ type: "HitSpark", kind: "hit", sparkNo: 7001, contactKind: "hit" });
  });

  it("carries verified Helper Projectile identity into the hit-state result path", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({
      attr: "S,HA",
      damage: 31,
      parentId: "p1-helper-0",
      rootId: "p1",
    });
    const helper = {
      serialId: "p1-helper-0",
      playerId: 60,
      rootId: "p1",
      parentId: "p1",
      playerNo: 1,
      rootPlayerNo: 1,
      stateNo: 6000,
      contact: createRuntimeContactMemory(),
    } as RuntimeHelper;
    const attacker = actor("p1", "P1", contactWorld, {
      playerId: 56,
      playerNo: 1,
      runtime: runtimeState({ pos: { x: 0, y: 0 }, stateNo: 300 }),
      projectiles: [projectile],
      helpers: [helper],
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 31 }),
    });

    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      effectLifecycleWorld: { markGetHit: () => undefined },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      stateHooks: hooks(),
      log: () => undefined,
    });

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBe("hyper");
    expect(defender.runtime.hitVars).toMatchObject({
      sourcePlayerId: 60,
      sourcePlayerNo: 1,
      sourceActorId: "p1-helper-0",
      sourceRootId: "p1",
      sourceRootOwned: true,
    });
  });

  it("carries nested Helper Projectile identity through verified ancestry", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({
      attr: "S,HA",
      damage: 31,
      parentId: "p1-helper-nested",
      rootId: "p1",
    });
    const helper = {
      serialId: "p1-helper-nested",
      playerId: 61,
      rootId: "p1",
      parentId: "p1-helper-parent",
      playerNo: 1,
      rootPlayerNo: 1,
      stateNo: 6000,
      contact: createRuntimeContactMemory(),
    } as RuntimeHelper;
    const attacker = actor("p1", "P1", contactWorld, {
      playerId: 56,
      playerNo: 1,
      runtime: runtimeState({ pos: { x: 0, y: 0 }, stateNo: 300 }),
      projectiles: [projectile],
      helpers: [helper],
    });
    const defender = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 12, y: 0 }, facing: -1, life: 31 }),
    });

    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      effectLifecycleWorld: { markGetHit: () => undefined },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -24, x2: 24, y2: 12 }],
      stateHooks: hooks(),
      isHelperRootOwned: (candidate, ownerId) =>
        candidate.serialId === helper.serialId &&
        candidate.parentId === "p1-helper-parent" &&
        candidate.rootId === ownerId,
      log: () => undefined,
    });

    expect(defender.runtime.life).toBe(0);
    expect(attacker.runtime.roundWinType).toBe("hyper");
    expect(defender.runtime.hitVars).toMatchObject({
      sourcePlayerId: 61,
      sourcePlayerNo: 1,
      sourceActorId: helper.serialId,
      sourceRootId: "p1",
      sourceRootOwned: true,
    });
  });

  it("routes Projectile p2stateno through target hit-state ownership when no HitOverride is active", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({ projectileId: 88, p1StateNo: 777, p2StateNo: 889, p2GetP1State: false });
    const entries: string[] = [];
    const calls: string[] = [];
    const resolver: ProjectileResolver = (_ownerId, input) => {
      input.rememberTarget(input.attacker, input.defender, projectile.targetId, projectile);
      input.applyHitState?.(input.attacker, input.defender, projectile);
    };
    const attacker = actor("p1", "P1", contactWorld, { runtime: runtimeState({ stateNo: 300 }), projectileResolver: resolver });
    const defender = actor("p2", "P2", contactWorld, { runtime: runtimeState({ stateNo: 0 }) });

    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      effectLifecycleWorld: { markGetHit: (target) => calls.push(`mark:${target.id}`) },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(entries),
      log: (line) => calls.push(`log:${line}`),
    });

    expect(entries).toEqual(["p2:889:clear", "p1:777:self"]);
    expect(defender.runtime.stateNo).toBe(889);
    expect(attacker.runtime.stateNo).toBe(777);
    expect(attacker.targets).toEqual([{ actorId: "p2", targetId: 88, age: 0 }]);
  });

  it("keeps the default Projectile get-hit path when only p1stateno is authored", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({ projectileId: 88, p1StateNo: 777 });
    const entries: string[] = [];
    const resolver: ProjectileResolver = (_ownerId, input) => {
      input.applyHitState?.(input.attacker, input.defender, projectile);
    };
    const attacker = actor("p1", "P1", contactWorld, { runtime: runtimeState({ stateNo: 300 }), projectileResolver: resolver });
    const defender = actor("p2", "P2", contactWorld, { source: "imported", runtime: runtimeState({ stateNo: 0, stateType: "S" }) });

    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      effectLifecycleWorld: { markGetHit: () => undefined },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(entries),
      log: () => undefined,
    });

    expect(attacker.runtime.stateNo).toBe(777);
    expect(defender.runtime.stateNo).toBe(5000);
    expect(entries).toEqual(["p1:777:self", "p2:5000:clear"]);
  });

  it("uses direct HitDef forced posture only for accepted default get-hit selection", () => {
    const resolve = (
      stateType: CharacterRuntimeState["stateType"],
      moveOverrides: Partial<DemoMove>,
      currentInput: Iterable<string> = new Set<string>(),
    ) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const attacker = actor("p1", "P1", contactWorld, {
        currentMove: move(moveOverrides),
        moveTick: 1,
      });
      const defender = actor("p2", "P2", contactWorld, {
        source: "imported",
        runtime: runtimeState({ pos: { x: 18, y: 0 }, stateType }),
      });
      defender.currentInput = currentInput;
      const entries: string[] = [];
      const outcome = new RuntimeCombatResolutionWorld().resolveDirect({
        attacker,
        defender,
        ...directInputBase(contactWorld, new RuntimeDirectCombatWorld(contactWorld), []),
        stateHooks: hooks(entries),
      });
      return { kind: outcome.kind, stateNo: defender.runtime.stateNo, entries };
    };

    expect(resolve("C", { forceStand: true })).toMatchObject({ kind: "hit", stateNo: 5000 });
    expect(resolve("S", { forceCrouch: true })).toMatchObject({ kind: "hit", stateNo: 5010 });
    expect(resolve("A", { forceStand: true, forceCrouch: true })).toMatchObject({ kind: "hit", stateNo: 5020 });
    expect(resolve("C", { forceStand: true, p2StateNo: 889 })).toEqual({
      kind: "hit",
      stateNo: 889,
      entries: ["p2:889:p1"],
    });
    expect(resolve("C", { forceStand: true }, new Set(["B"]))).toMatchObject({ kind: "guard", stateNo: 152 });
    expect(resolve("C", {})).toMatchObject({ kind: "hit", stateNo: 5010 });
  });

  it("uses Projectile forced posture only for bounded default get-hit selection", () => {
    const resolve = (
      stateType: CharacterRuntimeState["stateType"],
      overrides: Partial<RuntimeProjectile>,
    ) => {
      const contactWorld = new RuntimeContactMemoryWorld();
      const projectile = projectileActor(overrides);
      const entries: string[] = [];
      const resolver: ProjectileResolver = (_ownerId, input) => {
        input.applyHitState?.(input.attacker, input.defender, projectile);
      };
      const attacker = actor("p1", "P1", contactWorld, { projectileResolver: resolver });
      const defender = actor("p2", "P2", contactWorld, {
        source: "imported",
        runtime: runtimeState({ stateType }),
      });

      new RuntimeCombatResolutionWorld().resolveProjectile({
        attacker,
        defender,
        hitOverrideWorld: new RuntimeHitOverrideWorld(),
        reversalWorld: new RuntimeReversalWorld(contactWorld),
        effectLifecycleWorld: { markGetHit: () => undefined },
        guardWorld: new RuntimeGuardWorld(),
        getHitStateWorld: new RuntimeGetHitStateWorld(),
        hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
        contactPresentationWorld: new RuntimeContactPresentationWorld(),
        runtimeTick: 12,
        getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
        stateHooks: hooks(entries),
        log: () => undefined,
      });
      return { stateNo: defender.runtime.stateNo, entries };
    };

    expect(resolve("C", { forceStand: true })).toMatchObject({ stateNo: 5000 });
    expect(resolve("S", { forceCrouch: true })).toMatchObject({ stateNo: 5010 });
    expect(resolve("A", { forceStand: true, forceCrouch: true })).toMatchObject({ stateNo: 5020 });
    expect(resolve("C", { forceStand: true, p2StateNo: 889 })).toEqual({
      stateNo: 889,
      entries: ["p2:889:p1"],
    });
    expect(resolve("C", {})).toMatchObject({ stateNo: 5010 });
  });
});

type TestActor = RuntimeCombatResolutionActor & {
  removedExplodsOnGetHit: number;
};

type ProjectileResolver = <TActor extends RuntimeProjectileCombatActor>(
  ownerId: string,
  input: Omit<RuntimeProjectileCombatInput<TActor>, "projectiles" | "removeProjectilesMarkedForRemoval">,
) => void;

type ActorOptions = {
  source?: "demo" | "imported";
  playerId?: number;
  playerNo?: number;
  runtime?: CharacterRuntimeState;
  currentMove?: DemoMove;
  moveTick?: number;
  hasHit?: boolean;
  hitDefTargets?: string[];
  pendingHitDefTargets?: string[];
  projectileResolver?: ProjectileResolver;
  projectiles?: RuntimeProjectile[];
  helpers?: RuntimeHelper[];
};

function actor(id: string, label: string, contactWorld: RuntimeContactMemoryWorld, options: ActorOptions = {}): TestActor {
  let removedExplodsOnGetHit = 0;
  const targetWorld = new RuntimeTargetWorld();
  const state = options.runtime ?? runtimeState();
  return {
    id,
    label,
    ...(options.playerId === undefined ? {} : { playerId: options.playerId }),
    ...(options.playerNo === undefined ? {} : { playerNo: options.playerNo }),
    definition: {
      source: options.source ?? "demo",
      constants: {},
      animations: new Map([[7000, sparkAction(7000)], [7001, sparkAction(7001)]]),
      hitSparkLibraries: {},
    },
    runtime: state,
    stateElapsed: 0,
    stateOwner: undefined,
    currentMove: options.currentMove,
    currentMoveLabel: options.currentMove ? "test" : undefined,
    moveTick: options.moveTick ?? 0,
    hitStun: 0,
    hitPause: 0,
    hasHit: options.hasHit ?? false,
    hitDefTargets: options.hitDefTargets,
    pendingHitDefTargets: options.pendingHitDefTargets,
    contact: createRuntimeContactMemory(),
    contactWorld,
    currentInput: new Set<string>(),
    targetWorld,
    targets: [],
    targetBindings: [],
    audioWorld: new RuntimeAudioWorld(),
    soundEvents: [],
    hitEffectWorld: new RuntimeHitEffectWorld(),
    hitEffectEvents: [],
    get removedExplodsOnGetHit() {
      return removedExplodsOnGetHit;
    },
    effectActorWorld: {
      removeExplodsOnGetHit: () => {
        removedExplodsOnGetHit += 1;
      },
      resolveProjectileCombat: (ownerId, input) => {
        if (options.projectileResolver) {
          options.projectileResolver(ownerId, input);
          return;
        }
        if (options.projectiles) {
          resolveRuntimeProjectileCombat({
            ...input,
            projectiles: options.projectiles,
            removeProjectilesMarkedForRemoval: () => {
              options.projectiles = options.projectiles?.filter((entry) => !entry.removalReason);
            },
          });
        }
      },
      helpers: () => options.helpers ?? [],
    },
  };
}

function hooks(entries: string[] = []): RuntimeCombatResolutionStateHooks<TestActor> {
  return {
    canEnterState: () => true,
    enterState: (target, stateNo, options) => {
      entries.push(`${target.id}:${stateNo}:${options?.clearStateOwner ? "clear" : options?.stateOwner?.id ?? "self"}`);
      target.runtime.stateNo = stateNo;
    },
  };
}

function directInputBase(
  contactWorld: RuntimeContactMemoryWorld,
  directCombatWorld: RuntimeDirectCombatWorld,
  logs: string[],
) {
  return {
    directCombatWorld,
    hitOverrideWorld: new RuntimeHitOverrideWorld(),
    reversalWorld: new RuntimeReversalWorld(contactWorld),
    guardWorld: new RuntimeGuardWorld(),
    getHitStateWorld: new RuntimeGetHitStateWorld(),
    hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
    contactPresentationWorld: new RuntimeContactPresentationWorld(),
    runtimeTick: 9,
    getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
    stateHooks: hooks(),
    log: (line: string) => logs.push(line),
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
    life: 100,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

function rearmHitDef(actor: TestActor, currentMove: DemoMove): void {
  actor.currentMove = currentMove;
  actor.currentMoveLabel = "test";
  actor.moveTick = 1;
  actor.hasHit = false;
  actor.hitDefTargets = [];
  actor.pendingHitDefTargets = [];
  // Mirror HitDef activation: attack move type + explicit air.juggle re-arms c.juggle.
  actor.runtime.moveType = "A";
  if (currentMove.airJuggle !== undefined) {
    actor.runtime.juggle = currentMove.airJuggle;
    actor.runtime.juggleOrigin = "hitdef";
  }
}

function move(overrides: Partial<DemoMove> = {}): DemoMove {
  return {
    actionId: 200,
    startup: 0,
    activeStart: 0,
    activeEnd: 4,
    recovery: 6,
    damage: 25,
    hitPause: 4,
    hitStun: 9,
    push: 3,
    hitbox: { x1: 0, y1: -30, x2: 36, y2: -2 },
    ...overrides,
  };
}

function sparkAction(id: number): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: [
      {
        spriteGroup: id,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 4,
        clsn1: [],
        clsn2: [],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

function projectileActor(overrides: Partial<RuntimeProjectile> = {}): RuntimeProjectile {
  return {
    serialId: "projectile-0",
    projectileId: 88,
    actorKind: "projectile",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "trace",
    spriteOwnerLabel: "Trace Fighter",
    action: sparkAction(910),
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
    damage: 12,
    kill: true,
    guardKill: true,
    attr: "S,SP",
    targetId: 88,
    hitPause: 4,
    hitShakeTime: 4,
    hitPauseRemaining: 0,
    hitStun: 13,
    push: 5,
    guardDamage: 3,
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
    terminalActions: {},
    ...overrides,
    stageBound: overrides.stageBound ?? 240,
  };
}
