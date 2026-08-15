import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeAudioWorld } from "../mugen/runtime/AudioEventSystem";
import {
  createRuntimeContactMemory,
  RuntimeContactMemoryWorld,
  runtimeMoveContactValue,
  runtimeMoveReversedValue,
} from "../mugen/runtime/ContactMemorySystem";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import { RuntimeDirectCombatWorld } from "../mugen/runtime/DirectCombatSystem";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import { RuntimeGetHitStateWorld } from "../mugen/runtime/GetHitStateSystem";
import { RuntimeGuardWorld } from "../mugen/runtime/GuardSystem";
import { RuntimeHitEffectWorld } from "../mugen/runtime/HitEffectSystem";
import { RuntimeHitOverrideWorld } from "../mugen/runtime/HitOverrideSystem";
import { RuntimeContactPresentationWorld } from "../mugen/runtime/RuntimeContactPresentationSystem";
import { runtimeHitVar } from "../mugen/runtime/RuntimeExpressionContextSystem";
import {
  RuntimeHelperCombatWorld,
  type RuntimeHelperCombatDefender,
  type RuntimeHelperCombatOwner,
  type RuntimeHelperCombatStateHooks,
} from "../mugen/runtime/RuntimeHelperCombatSystem";
import { RuntimeReversalWorld } from "../mugen/runtime/ReversalSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHelperCombatSystem", () => {
  it("owns helper direct HitDef contact, target memory, presentation, and helper sync", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const targetWorld = new RuntimeTargetWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Assist"' }));
    helper.playerId = 60;
    helper.playerNo = 1;
    helper.rootPlayerNo = 1;
    helper.stateNo = 6000;
    helper.currentMove = move({
      damage: 41,
      guardDamage: 7,
      hitPause: 4,
      hitShakeTime: 9,
      targetId: 7,
      p1SpritePriority: 5,
      p2SpritePriority: -3,
      hitSound: "S5,1",
      hitSoundValue: { rawPrefix: "S", group: 5, index: 1 },
      hitSpark: "S7000",
      guardFlag: "H",
      unhittableTime: [6, -1],
      p1GetP2Facing: 1,
      p2Facing: -1,
      attackerHitPower: 47,
      envShake: { time: 999, freq: 60, ampl: -4, phase: 0, mul: 1, dir: 0 },
    });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, facing: -1, stateNo: 0, life: 100 }),
    });
    const logs: string[] = [];
    const stateEntries: string[] = [];
    const audioOperations: string[] = [];
    const emittedEnvShakes: DemoMove[] = [];
    const combatOwner = owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1"));

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: combatOwner,
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld,
      runtimeTick: 33,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks(stateEntries, [5000]),
      recordAudioOperation: (actor, operation) => audioOperations.push(`${actor.id}:${operation.value}`),
      emitDirectEnvShake: (_owner, authoredMove) => emittedEnvShakes.push(authoredMove),
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual(["Helper Assist hit P2 for 41"]);
    expect(helper.hasHit).toBe(true);
    expect(helper.hitPause).toBe(4);
    expect(helper.facing).toBe(-1);
    expect(helper.power).toBe(47);
    expect(helper.unhittableTime).toBe(6);
    expect(helper.spritePriority).toBe(5);
    expect(helper.hitDefSpritePriority).toMatchObject({ role: "p1", contactKind: "hit", source: "authored" });
    expect(helper.targets).toEqual([{ actorId: "p2", targetId: 7, age: 0 }]);
    expect(helper.soundEvents[0]).toMatchObject({
      type: "PlaySnd",
      group: 5,
      index: 1,
      contactKind: "hit",
      contactTick: 33,
    });
    expect(helper.hitEffectEvents[0]).toMatchObject({
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7000,
      contactKind: "hit",
      contactTick: 33,
    });
    expect(defender.runtime.life).toBe(59);
    expect(defender.runtime.receivedHitSequence).toBe(1);
    expect(defender.hitPause).toBe(9);
    expect(defender.runtime.hitVars).toMatchObject({
      sourcePlayerId: 60,
      sourcePlayerNo: 1,
      sourceActorId: helper.serialId,
      sourceRootId: "p1",
      sourceRootOwned: true,
      sourceAttr: "S,NA",
      sourceGuardFlag: "H",
      sourceGuardKo: false,
      sourceFacing: -1,
      damage: 41,
      hitDamage: 41,
      guardDamage: 7,
    });
    expect(runtimeHitVar(defender.runtime, "damage")).toBe(41);
    expect(runtimeHitVar(defender.runtime, "hitdamage")).toBe(41);
    expect(runtimeHitVar(defender.runtime, "guarddamage")).toBe(7);
    expect(runtimeHitVar(defender.runtime, "hitshaketime", { hitPause: defender.hitPause })).toBe(9);
    expect(defender.runtime.facing).toBe(-1);
    expect(defender.pendingDirectHitFacing).toBe(1);
    expect(defender.runtime.spritePriority).toBe(-3);
    expect(defender.runtime.hitDefSpritePriority).toMatchObject({ role: "p2", contactKind: "hit", source: "authored" });
    expect(defender.runtime.stateNo).toBe(5000);
    expect(stateEntries).toEqual(["p2:5000:clear"]);
    expect(runtimeMoveContactValue(helper.contact, 6000, "hit")).toBe(0);
    expect(audioOperations).toEqual(["p1:S5,1"]);
    expect(emittedEnvShakes).toEqual([helper.currentMove]);
  });

  it("accepts a zero-damage Helper HitDef while retaining target and GetHitVar metadata", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Zero Tap"' }));
    helper.currentMove = move({
      damage: 0,
      guardDamage: 0,
      targetId: 77,
      push: 0,
      hitVelocityY: 0,
      hitVelocityZ: 0,
      hitVelocities: { ground: { x: 0, y: 0, z: 0 } },
    });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        vel: { x: 13, y: -11 },
        hitVelocity: { x: 9, y: -7, z: 5 },
        hitVars: { hitVelocities: { ground: { x: 9, y: -7, z: 5 } } },
        life: 100,
      }),
    });

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 34,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
    });

    expect(defender.runtime).toMatchObject({
      life: 100,
      moveType: "H",
      vel: { x: 0, y: 0 },
      hitVelocity: { x: 0, y: 0, z: 0 },
    });
    expect(helper.targets).toEqual([{ actorId: "p2", targetId: 77, age: 0 }]);
    expect(defender.runtime.hitVars).toMatchObject({
      damage: 0,
      hitDamage: 0,
      guardDamage: 0,
      hitVelocities: { ground: { x: 0, y: 0, z: 0 } },
    });
    expect(runtimeHitVar(defender.runtime, "damage")).toBe(0);
    expect(runtimeHitVar(defender.runtime, "hitdamage")).toBe(0);
    expect(runtimeHitVar(defender.runtime, "guarddamage")).toBe(0);
    expect(runtimeHitVar(defender.runtime, "xvel")).toBe(0);
    expect(runtimeHitVar(defender.runtime, "yvel")).toBe(0);
  });

  it("uses Helper direct HitDef forced posture only for accepted default get-hit selection", () => {
    const resolve = (
      stateType: CharacterRuntimeState["stateType"],
      moveOverrides: Partial<DemoMove>,
      currentInput: Iterable<string> = new Set<string>(),
    ) => {
      const effectActorWorld = new RuntimeEffectActorWorld();
      const contactWorld = new RuntimeContactMemoryWorld();
      const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Posture Assist"' }));
      helper.currentMove = move(moveOverrides);
      helper.moveTick = 1;
      const defender = defenderActor("p2", "P2", contactWorld, {
        definition: fighterDefinition("imported"),
        currentInput,
        runtime: runtimeState({ pos: { x: 18, y: 0 }, stateType }),
      });
      const entries: string[] = [];

      new RuntimeHelperCombatWorld().resolveDirect({
        owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
        defender,
        directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
        reversalWorld: new RuntimeReversalWorld(contactWorld),
        guardWorld: new RuntimeGuardWorld(),
        getHitStateWorld: new RuntimeGetHitStateWorld(),
        contactPresentationWorld: new RuntimeContactPresentationWorld(),
        targetWorld: new RuntimeTargetWorld(),
        runtimeTick: 34,
        getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
        stateHooks: stateHooks(entries, [150, 5000, 5010, 5020]),
      });
      return { stateNo: defender.runtime.stateNo, entries };
    };

    expect(resolve("C", { forceStand: true })).toMatchObject({ stateNo: 5000 });
    expect(resolve("S", { forceCrouch: true })).toMatchObject({ stateNo: 5010 });
    expect(resolve("A", { forceStand: true, forceCrouch: true })).toMatchObject({ stateNo: 5020 });
    expect(resolve("C", { forceStand: true }, new Set(["B"]))).toMatchObject({ stateNo: 150 });
    expect(resolve("C", {})).toMatchObject({ stateNo: 5010 });
  });

  it("routes Helper HitDef through HitOverride and applies actor-role unhittabletime", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const targetWorld = new RuntimeTargetWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Override Assist"' }));
    helper.unhittableTime = 5;
    helper.currentMove = move({ targetId: 7, unhittableTime: [-1, 8] });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        life: 100,
        unhittableTime: 0,
        hitOverrides: [{ slot: 1, attr: "S,NA", stateNo: 777, remaining: 30 }],
      }),
    });
    const logs: string[] = [];
    const entries: string[] = [];

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld,
      runtimeTick: 34,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks(entries, [777]),
      log: (line) => logs.push(line),
    });

    expect(helper.hasHit).toBe(true);
    expect(helper.unhittableTime).toBe(5);
    expect(helper.targets).toEqual([{ actorId: "p2", targetId: 7, age: 0 }]);
    expect(defender.runtime.unhittableTime).toBe(8);
    expect(defender.runtime.stateNo).toBe(777);
    expect(defender.runtime.life).toBe(100);
    expect(entries).toEqual(["p2:777:state-owner"]);
    expect(logs).toEqual(["P2 HitOverride slot 1 redirected Helper Override Assist to state 777"]);
  });

  it("uses Helper HitDef id and chainid for admission, target memory, and GetHitVar metadata", () => {
    const resolve = (chainId: number) => {
      const effectActorWorld = new RuntimeEffectActorWorld();
      const contactWorld = new RuntimeContactMemoryWorld();
      const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Chain Assist"' }));
      helper.playerId = 60;
      helper.playerNo = 1;
      helper.rootPlayerNo = 1;
      helper.currentMove = move({ targetId: 43, hitVars: { hitId: 43, chainId } });
      helper.moveTick = 1;
      const defender = defenderActor("p2", "P2", contactWorld, {
        runtime: runtimeState({
          pos: { x: 18, y: 0 },
          life: 100,
          hitVars: { hitId: 43, sourcePlayerId: 60, sourceActorId: helper.serialId },
        }),
      });
      const logs: string[] = [];

      new RuntimeHelperCombatWorld().resolveDirect({
        owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
        defender,
        directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
        reversalWorld: new RuntimeReversalWorld(contactWorld),
        guardWorld: new RuntimeGuardWorld(),
        getHitStateWorld: new RuntimeGetHitStateWorld(),
        contactPresentationWorld: new RuntimeContactPresentationWorld(),
        targetWorld: new RuntimeTargetWorld(),
        runtimeTick: 33,
        getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
        stateHooks: stateHooks([], [5000]),
        log: (line: string) => logs.push(line),
      });

      return { defender, helper, logs };
    };

    const accepted = resolve(43);
    expect(accepted.defender.runtime.life).toBe(75);
    expect(accepted.defender.runtime.hitVars).toMatchObject({ hitId: 43, chainId: 43 });
    expect(runtimeHitVar(accepted.defender.runtime, "hitid")).toBe(43);
    expect(runtimeHitVar(accepted.defender.runtime, "chainid")).toBe(43);
    expect(accepted.helper.targets).toEqual([{ actorId: "p2", targetId: 43, age: 0 }]);

    const rejected = resolve(44);
    expect(rejected.defender.runtime.life).toBe(100);
    expect(rejected.helper.targets).toEqual([]);
    expect(rejected.logs).toEqual(["P2 rejected Helper Chain Assist S,NA via ChainID 44 (previous HitDef id 43)"]);
  });

  it("enforces Helper direct HitDef ChainID and NoChainID admission", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const targetWorld = new RuntimeTargetWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Chain Assist"' }));
    helper.playerId = 60;
    helper.playerNo = 1;
    helper.rootPlayerNo = 1;
    helper.currentMove = move({ hitVars: { chainId: 44 }, noChainIds: [43] });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        life: 100,
        hitVars: { hitId: 43, sourcePlayerId: 60, sourceActorId: helper.serialId },
      }),
    });
    const logs: string[] = [];
    const input = {
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld,
      runtimeTick: 33,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
      log: (line: string) => logs.push(line),
    };

    new RuntimeHelperCombatWorld().resolveDirect(input);
    expect(logs).toEqual(["P2 rejected Helper Chain Assist S,NA via ChainID 44 (previous HitDef id 43)"]);
    expect(defender.runtime.life).toBe(100);
    expect(helper.hasHit).toBe(false);

    helper.currentMove.hitVars = { chainId: 43 };
    logs.length = 0;
    new RuntimeHelperCombatWorld().resolveDirect(input);
    expect(logs).toEqual(["P2 rejected Helper Chain Assist S,NA via NoChainID 43"]);
    expect(defender.runtime.life).toBe(100);
    expect(helper.hasHit).toBe(false);

    defender.runtime.hitVars = { hitId: 43, sourcePlayerId: 61, sourceActorId: "other-helper" };
    logs.length = 0;
    new RuntimeHelperCombatWorld().resolveDirect(input);
    expect(logs).toEqual(["Helper Chain Assist hit P2 for 25"]);
    expect(defender.runtime.life).toBe(75);
    expect(helper.hasHit).toBe(true);
  });

  it("splits equal Helper ChainID and NoChainID by MUGEN/Ikemen profile", () => {
    const resolve = (runtimeProfile: "mugen-1.1" | "ikemen-go" | "unknown") => {
      const effectActorWorld = new RuntimeEffectActorWorld();
      const contactWorld = new RuntimeContactMemoryWorld();
      const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "43", name: '"Profile Assist"' }));
      helper.playerId = 60;
      helper.currentMove = move({ hitVars: { chainId: 43 }, noChainIds: [43] });
      helper.moveTick = 1;
      const defender = defenderActor("p2", "P2", contactWorld, {
        runtime: runtimeState({
          pos: { x: 18, y: 0 },
          life: 100,
          hitVars: { hitId: 43, sourcePlayerId: 60, sourceActorId: helper.serialId },
        }),
      });
      const logs: string[] = [];

      new RuntimeHelperCombatWorld().resolveDirect({
        owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
        defender,
        runtimeProfile,
        directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
        reversalWorld: new RuntimeReversalWorld(contactWorld),
        guardWorld: new RuntimeGuardWorld(),
        getHitStateWorld: new RuntimeGetHitStateWorld(),
        contactPresentationWorld: new RuntimeContactPresentationWorld(),
        targetWorld: new RuntimeTargetWorld(),
        runtimeTick: 34,
        getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
        stateHooks: stateHooks([], [5000]),
        log: (line) => logs.push(line),
      });
      return { helper, defender, logs };
    };

    const mugen = resolve("mugen-1.1");
    expect(mugen.defender.runtime.life).toBe(75);
    expect(mugen.helper.hasHit).toBe(true);

    for (const profile of ["ikemen-go", "unknown"] as const) {
      const rejected = resolve(profile);
      expect(rejected.defender.runtime.life).toBe(100);
      expect(rejected.helper.hasHit).toBe(false);
      expect(rejected.logs).toEqual(["P2 rejected Helper Profile Assist S,NA via NoChainID 43"]);
    }
  });

  it("excludes clsnproxy Helpers from direct HitDef admission", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "42", name: '"Proxy"' }));
    helper.clsnProxy = true;
    helper.currentMove = move({ damage: 25 });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 33,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
    });

    expect(helper.hasHit).toBe(false);
    expect(helper.targets).toEqual([]);
    expect(defender.runtime.life).toBe(100);
  });

  it("copies the Parent air-juggle budget before a falling Helper contact", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "49", name: '"Inherited Assist"' }));
    helper.inheritJuggle = 1;
    helper.currentMove = move({ airJuggle: 1, damage: 25 });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        moveType: "H",
        hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
        airJugglePoints: { p1: 1 },
        life: 100,
      }),
    });

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      runtimeProfile: "ikemen-go",
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 34,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
    });

    expect(defender.runtime.life).toBe(75);
    expect(defender.runtime.airJugglePoints).toEqual({ p1: 1, "p1-helper-0": 0 });
    expect(helper.airJugglePoints).toBeUndefined();
  });

  it("admits nested Helper direct HitDef source identity through verified ancestry", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const targetWorld = new RuntimeTargetWorld();
    const parent = effectActorWorld.spawnHelper("p1", helperInput({ id: "47", name: '"Parent"' }));
    const nested = effectActorWorld.spawnHelper("p1", {
      ...helperInput({ id: "48", name: '"Nested"' }),
      parentId: parent.serialId,
    });
    parent.playerNo = 1;
    parent.rootPlayerNo = 1;
    nested.playerId = 61;
    nested.playerNo = 1;
    nested.rootPlayerNo = 1;
    nested.currentMove = move({ damage: 17 });
    nested.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld,
      runtimeTick: 34,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
      isHelperRootOwned: (helper, ownerId) =>
        helper.serialId === nested.serialId &&
        helper.parentId === parent.serialId &&
        helper.rootId === ownerId,
    });

    expect(nested.hasHit).toBe(true);
    expect(defender.runtime.life).toBe(83);
    expect(defender.runtime.hitVars).toMatchObject({
      sourcePlayerId: 61,
      sourceActorId: nested.serialId,
      sourceRootId: "p1",
      sourceRootOwned: true,
    });
  });

  it("rejects helper direct HitDef admission against a falling target without F", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const targetWorld = new RuntimeTargetWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "43", name: '"Fall Filter Assist"' }));
    helper.currentMove = move({ hitFlag: "H,L,A" });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, moveType: "H", hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } }, life: 100 }),
    });
    const logs: string[] = [];

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld,
      runtimeTick: 33,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual(["P2 rejected Helper Fall Filter Assist S,NA via fall HitFlag/NoFallHitFlag"]);
    expect(defender.runtime.life).toBe(100);
    expect(helper.hasHit).toBe(false);
  });

  it("enforces helper minus and plus HitFlags without mutating rejected targets", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const targetWorld = new RuntimeTargetWorld();
    const combatWorld = new RuntimeHelperCombatWorld();
    const inputBase = {
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld,
      runtimeTick: 33,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
    };
    const minusHelper = effectActorWorld.spawnHelper("p1", helperInput({ id: "44", name: '"Minus Assist"' }));
    minusHelper.currentMove = move({ hitFlag: "H-" });
    minusHelper.moveTick = 1;
    const minusTarget = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 5000, moveType: "H", life: 100 }),
    });
    const minusLogs: string[] = [];
    combatWorld.resolveDirect({ ...inputBase, defender: minusTarget, log: (line) => minusLogs.push(line) });
    expect(minusTarget.runtime.life).toBe(100);
    expect(minusLogs).toEqual(["P2 rejected Helper Minus Assist S,NA via HitFlag -"]);

    const plusEffectActorWorld = new RuntimeEffectActorWorld();
    const plusHelper = plusEffectActorWorld.spawnHelper("p1", helperInput({ id: "45", name: '"Plus Assist"' }));
    plusHelper.currentMove = move({ hitFlag: "H+", damage: 11 });
    plusHelper.moveTick = 1;
    const idleTarget = defenderActor("p3", "P3", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    const plusLogs: string[] = [];
    combatWorld.resolveDirect({
      ...inputBase,
      owner: owner("p1", plusEffectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender: idleTarget,
      log: (line) => plusLogs.push(line),
    });
    expect(idleTarget.runtime.life).toBe(100);
    expect(plusLogs).toEqual(["P3 rejected Helper Plus Assist S,NA via HitFlag +"]);

    const mismatchEffectActorWorld = new RuntimeEffectActorWorld();
    const mismatchHelper = mismatchEffectActorWorld.spawnHelper("p1", helperInput({ id: "46", name: '"State Assist"' }));
    mismatchHelper.currentMove = move({ hitFlag: "H" });
    mismatchHelper.moveTick = 1;
    const mismatchTarget = defenderActor("p4", "P4", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, stateType: "C", life: 100 }),
    });
    const mismatchLogs: string[] = [];
    combatWorld.resolveDirect({
      ...inputBase,
      owner: owner("p1", mismatchEffectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender: mismatchTarget,
      log: (line) => mismatchLogs.push(line),
    });
    expect(mismatchTarget.runtime.life).toBe(100);
    expect(mismatchLogs).toEqual(["P4 rejected Helper State Assist S,NA via HitFlag state type"]);
  });

  it("suppresses standby Helper direct HitDef and resumes it after TagIn", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "48", name: '"Standby Assist"' }));
    helper.currentMove = move();
    helper.moveTick = 1;
    helper.teamState!.standby = true;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    const logs: string[] = [];
    const combatWorld = new RuntimeHelperCombatWorld();
    const input = {
      owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 70,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
      log: (line: string) => logs.push(line),
    };

    combatWorld.resolveDirect(input);

    expect(defender.runtime.life).toBe(100);
    expect(helper.hasHit).toBe(false);
    expect(logs).toEqual([]);

    helper.teamState!.standby = false;
    combatWorld.resolveDirect({ ...input, runtimeTick: 71 });

    expect(defender.runtime.life).toBe(75);
    expect(helper.hasHit).toBe(true);
    expect(logs).toEqual(["Helper Standby Assist hit P2 for 25"]);
  });

  it("routes helper guard hits through guard-state hooks and guard presentation", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const targetWorld = new RuntimeTargetWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "43", name: '"Guard Tap"' }));
    helper.stateNo = 6100;
    helper.currentMove = move({
      damage: 41,
      guardDamage: 7,
      guardPause: 3,
      guardShakeTime: 7,
      guardStun: 6,
      guardPush: 2,
      guardSound: "S6,2",
      guardSoundValue: { rawPrefix: "S", group: 6, index: 2 },
      unhittableTime: [4, -1],
      guardSpark: "S7001",
    });
    helper.moveTick = 2;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      currentInput: new Set(["B"]),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    const stateEntries: string[] = [];
    const audioOperations: string[] = [];

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld,
      runtimeTick: 44,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks(stateEntries, [150]),
      recordAudioOperation: (actor, operation) => audioOperations.push(`${actor.id}:${operation.value}`),
    });

    expect(helper.hasHit).toBe(true);
    expect(helper.hitPause).toBe(3);
    expect(helper.unhittableTime).toBe(4);
    expect(helper.spritePriority).toBe(1);
    expect(helper.hitDefSpritePriority).toMatchObject({ role: "p1", contactKind: "guard", source: "mugen-1.1-default" });
    expect(helper.soundEvents[0]).toMatchObject({ type: "PlaySnd", group: 6, index: 2, contactKind: "guard" });
    expect(helper.hitEffectEvents[0]).toMatchObject({ type: "HitSpark", sparkNo: 7001, contactKind: "guard" });
    expect(defender.runtime.life).toBe(93);
    expect(defender.hitPause).toBe(7);
    expect(defender.runtime.guardStun).toBe(6);
    expect(defender.runtime.guarding).toBe(true);
    expect(defender.runtime.spritePriority).toBe(0);
    expect(defender.runtime.hitDefSpritePriority).toMatchObject({ role: "p2", contactKind: "guard", source: "mugen-1.1-default" });
    expect(defender.runtime.stateNo).toBe(150);
    expect(runtimeHitVar(defender.runtime, "damage")).toBe(7);
    expect(runtimeHitVar(defender.runtime, "hitdamage")).toBe(41);
    expect(runtimeHitVar(defender.runtime, "guarddamage")).toBe(7);
    expect(runtimeHitVar(defender.runtime, "hitshaketime", { hitPause: defender.hitPause })).toBe(7);
    expect(stateEntries).toEqual(["p2:150:clear"]);
    expect(runtimeMoveContactValue(helper.contact, 6100, "guard")).toBe(0);
    expect(audioOperations).toEqual(["p1:S6,2"]);
  });

  it("keeps helper direct combat fail-closed on HitBy rejection", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "44", name: '"Denied"' }));
    helper.currentMove = move({
      attr: "S,NA",
      hitSound: "S5,3",
      hitSoundValue: { rawPrefix: "S", group: 5, index: 3 },
    });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      runtime: runtimeState({
        pos: { x: 18, y: 0 },
        life: 100,
        hitBy: { slot1: { mode: "deny", attr: "S,NA", remaining: 3 } },
      }),
    });
    const logs: string[] = [];
    const audioOperations: string[] = [];

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported", "mugen-1.1")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 55,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks([], [5000]),
      recordAudioOperation: (actor, operation) => audioOperations.push(`${actor.id}:${operation.value}`),
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual(["P2 rejected Helper Denied S,NA via HitBy/NotHitBy"]);
    expect(helper.hasHit).toBe(false);
    expect(helper.targets).toEqual([]);
    expect(helper.soundEvents).toEqual([]);
    expect(helper.hitEffectEvents).toEqual([]);
    expect(audioOperations).toEqual([]);
    expect(defender.runtime.life).toBe(100);
    expect(helper.spritePriority).toBe(3);
    expect(helper.hitDefSpritePriority).toBeUndefined();
    expect(defender.runtime.hitDefSpritePriority).toBeUndefined();
  });

  it("rejects helper direct HitDef while SuperPause unhittable protects the defender", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "46", name: '"Paused Assist"' }));
    helper.currentMove = move({ attr: "S,NA" });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
    });
    const logs: string[] = [];

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld: new RuntimeReversalWorld(contactWorld),
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 57,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      canDefenderBeHit: () => false,
      stateHooks: stateHooks([], [5000]),
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual(["P2 rejected Helper Paused Assist S,NA via SuperPause unhittable"]);
    expect(helper.hasHit).toBe(false);
    expect(helper.targets).toEqual([]);
    expect(defender.runtime.life).toBe(100);
  });

  it("prioritizes ReversalDef over helper direct contact while SuperPause-unhittable is active", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "47", name: '"Countered by Helper"' }));
    helper.currentMove = move({ attr: "S,NA" });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 0, life: 100 }),
    });
    reversalWorld.activate(defender, {
      attr: "S,NA",
      hitbox: { x1: 0, y1: -30, x2: 50, y2: -1 },
      hitPause: 5,
      p2StateNo: 777,
    });
    const logs: string[] = [];

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld,
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 57,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      canDefenderBeHit: () => false,
      stateHooks: stateHooks([], [5000]),
      log: (line) => logs.push(line),
    });

    expect(helper.hasHit).toBe(true);
    expect(helper.currentMove).toBeUndefined();
    expect(logs).toEqual(["P2 reversed Helper Countered by Helper p2->777"]);
    expect(helper.stateNo).toBe(777);
    expect(helper.targets).toEqual([]);
  });

  it("runs Helper ChainID and NoChainID admission before defender ReversalDef", () => {
    const resolve = (moveOverrides: Partial<DemoMove>, previousHitVars: CharacterRuntimeState["hitVars"]) => {
      const effectActorWorld = new RuntimeEffectActorWorld();
      const contactWorld = new RuntimeContactMemoryWorld();
      const reversalWorld = new RuntimeReversalWorld(contactWorld);
      const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "48", name: '"Ordered Assist"' }));
      helper.playerId = 60;
      helper.stateNo = 6200;
      helper.currentMove = move({ attr: "S,NA", ...moveOverrides });
      helper.moveTick = 1;
      const defender = defenderActor("p2", "P2", contactWorld, {
        definition: fighterDefinition("imported"),
        runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 300, hitVars: previousHitVars }),
      });
      reversalWorld.activate(defender, {
        attr: "S,NA",
        hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 },
        hitPause: 5,
      });
      const logs: string[] = [];

      new RuntimeHelperCombatWorld().resolveDirect({
        owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
        defender,
        directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
        reversalWorld,
        guardWorld: new RuntimeGuardWorld(),
        getHitStateWorld: new RuntimeGetHitStateWorld(),
        contactPresentationWorld: new RuntimeContactPresentationWorld(),
        targetWorld: new RuntimeTargetWorld(),
        runtimeTick: 68,
        getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
        stateHooks: stateHooks([], []),
        log: (line) => logs.push(line),
      });
      return { defender, helper, logs };
    };

    const chainRejected = resolve({ hitVars: { chainId: 44 } }, { hitId: 43 });
    expect(chainRejected.logs).toEqual(["P2 rejected Helper Ordered Assist S,NA via ChainID 44 (previous HitDef id 43)"]);

    const noChainRejected = resolve(
      { noChainIds: [43] },
      { hitId: 43, sourcePlayerId: 60, sourceActorId: "p1-helper-0" },
    );
    expect(noChainRejected.logs).toEqual(["P2 rejected Helper Ordered Assist S,NA via NoChainID 43"]);

    for (const rejected of [chainRejected, noChainRejected]) {
      expect([rejected.helper.hasHit, rejected.defender.hasHit]).toEqual([false, false]);
      expect(rejected.defender.hitPause).toBe(0);
      expect([rejected.helper.stateNo, rejected.defender.runtime.stateNo]).toEqual([6200, 300]);
      expect(rejected.helper.targets).toEqual([]);
      expect(rejected.helper.currentMove).toBeDefined();
    }
  });

  it("rejects Helper direct contact on positive receiver unhittabletime before ReversalDef", () => {
    const resolve = (unhittableTime: number) => {
      const effectActorWorld = new RuntimeEffectActorWorld();
      const contactWorld = new RuntimeContactMemoryWorld();
      const reversalWorld = new RuntimeReversalWorld(contactWorld);
      const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "49", name: '"Locked Assist"' }));
      helper.stateNo = 6200;
      helper.currentMove = move({ attr: "S,NA" });
      helper.moveTick = 1;
      const defender = defenderActor("p2", "P2", contactWorld, {
        definition: fighterDefinition("imported"),
        runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 300, life: 100, unhittableTime }),
      });
      reversalWorld.activate(defender, {
        attr: "S,NA",
        hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 },
        hitPause: 5,
        unhittableTime: [1, 6],
      });
      const logs: string[] = [];

      new RuntimeHelperCombatWorld().resolveDirect({
        owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
        defender,
        directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
        reversalWorld,
        guardWorld: new RuntimeGuardWorld(),
        getHitStateWorld: new RuntimeGetHitStateWorld(),
        contactPresentationWorld: new RuntimeContactPresentationWorld(),
        targetWorld: new RuntimeTargetWorld(),
        runtimeTick: 69,
        getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
        stateHooks: stateHooks([], []),
        log: (line) => logs.push(line),
      });
      return { defender, helper, logs };
    };

    const rejected = resolve(2);
    expect(rejected.logs).toEqual(["P2 rejected Helper Locked Assist S,NA via HitDef unhittabletime"]);
    expect([rejected.helper.hasHit, rejected.defender.hasHit]).toEqual([false, false]);
    expect(rejected.helper.currentMove).toBeDefined();
    expect(rejected.defender.runtime.unhittableTime).toBe(2);

    const expired = resolve(0);
    expect(expired.logs).toEqual(["P2 reversed Helper Locked Assist"]);
    expect(expired.helper.unhittableTime).toBe(6);
  });

  it("lets defender ReversalDef counter helper direct HitDef and mark helper MoveReversed", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const contactWorld = new RuntimeContactMemoryWorld();
    const reversalWorld = new RuntimeReversalWorld(contactWorld);
    const helper = effectActorWorld.spawnHelper("p1", helperInput({ id: "45", name: '"Countered"' }));
    helper.stateNo = 6200;
    helper.currentMove = move({ attr: "S,NA" });
    helper.moveTick = 1;
    const defender = defenderActor("p2", "P2", contactWorld, {
      definition: fighterDefinition("imported"),
      runtime: runtimeState({ pos: { x: 18, y: 0 }, stateNo: 0, life: 100 }),
    });
    reversalWorld.activate(defender, {
      attr: "SA,AA",
      hitbox: { x1: -24, y1: -40, x2: 24, y2: 0 },
      hitPause: 5,
      p1StateNo: 777,
    });
    const logs: string[] = [];
    const stateEntries: string[] = [];

    new RuntimeHelperCombatWorld().resolveDirect({
      owner: owner("p1", effectActorWorld, fighterDefinition("imported")),
      defender,
      directCombatWorld: new RuntimeDirectCombatWorld(contactWorld),
      reversalWorld,
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      targetWorld: new RuntimeTargetWorld(),
      runtimeTick: 66,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: stateHooks(stateEntries, [777]),
      log: (line) => logs.push(line),
    });

    expect(logs).toEqual(["P2 reversed Helper Countered p1->777"]);
    expect(helper.hasHit).toBe(true);
    expect(helper.currentMove).toBeUndefined();
    expect(helper.moveType).toBe("H");
    expect(runtimeMoveReversedValue(helper.contact, 6200)).toBe(0);
    expect(helper.contact).toMatchObject({ moveReversedState: 6200, moveReversedTime: 0 });
    expect(helper.targets).toEqual([]);
    expect(helper.soundEvents).toEqual([]);
    expect(helper.hitEffectEvents).toEqual([]);
    expect(defender.runtime.stateNo).toBe(777);
    expect(defender.hitPause).toBe(5);
    expect(defender.runtime.power).toBe(25);
    expect(defender.runtime.life).toBe(100);
    expect(stateEntries).toEqual(["p2:777:state-owner"]);
  });
});

type TestDefender = RuntimeHelperCombatDefender & {
  removedExplodsOnGetHit: number;
};

function owner(
  id: string,
  effectActorWorld: RuntimeEffectActorWorld,
  definition: RuntimeHelperCombatOwner["definition"],
): RuntimeHelperCombatOwner {
  return {
    id,
    definition,
    runtime: runtimeState(),
    effectActorWorld,
    audioWorld: new RuntimeAudioWorld(),
    hitEffectWorld: new RuntimeHitEffectWorld(),
  };
}

function defenderActor(
  id: string,
  label: string,
  _contactWorld: RuntimeContactMemoryWorld,
  options: {
    runtime?: CharacterRuntimeState;
    definition?: RuntimeHelperCombatOwner["definition"];
    currentInput?: Iterable<string>;
  } = {},
): TestDefender {
  let removedExplodsOnGetHit = 0;
  return {
    id,
    label,
    definition: options.definition ?? fighterDefinition("demo"),
    runtime: options.runtime ?? runtimeState(),
    stateElapsed: 0,
    stateOwner: undefined,
    currentMove: undefined,
    currentMoveLabel: undefined,
    moveTick: 0,
    hitStun: 0,
    hitPause: 0,
    hasHit: false,
    contact: createRuntimeContactMemory(),
    currentInput: options.currentInput ?? new Set<string>(),
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
    },
  };
}

function stateHooks(entries: string[], allowedStates: number[]): RuntimeHelperCombatStateHooks<TestDefender> {
  return {
    canEnterState: (_target, stateNo) => allowedStates.includes(stateNo),
    enterState: (target, stateNo, options) => {
      entries.push(`${target.id}:${stateNo}:${options?.clearStateOwner ? "clear" : "state-owner"}`);
      target.runtime.stateNo = stateNo;
    },
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

function fighterDefinition(
  source: RuntimeHelperCombatOwner["definition"]["source"],
  hitDefPriorityProfile?: RuntimeHelperCombatOwner["definition"]["hitDefPriorityProfile"],
): RuntimeHelperCombatOwner["definition"] {
  return {
    source,
    hitDefPriorityProfile,
    constants: {},
    animations: new Map([
      [7000, action(7000)],
      [7001, action(7001)],
    ]),
    hitSparkLibraries: {},
  };
}

function helperInput(params: Record<string, string>) {
  return {
    controller: controller("Helper", params),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "test",
    spriteOwnerLabel: "Test",
    action: action(),
    stateNo: 6000,
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
        offsetX: 3,
        offsetY: -4,
        duration,
        clsn1: [],
        clsn2: [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
        raw: `${id},0,3,-4,${duration}`,
        line: 1,
      },
    ],
  };
}
