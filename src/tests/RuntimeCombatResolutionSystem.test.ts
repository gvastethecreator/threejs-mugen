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
import {
  RuntimeCombatResolutionWorld,
  type RuntimeCombatResolutionActor,
  type RuntimeCombatResolutionStateHooks,
} from "../mugen/runtime/RuntimeCombatResolutionSystem";
import type {
  RuntimeProjectileCombatActor,
  RuntimeProjectileCombatInput,
} from "../mugen/runtime/ProjectileCombatSystem";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeCombatResolutionSystem", () => {
  it("owns bounded direct contact ordering, target memory, presentation, and received damage", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200, power: 10 }),
      currentMove: move({ targetId: 7, hitSound: "S5,0", hitSpark: "S7000" }),
      moveTick: 2,
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
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA", targetId: 77, p2StateNo: 888, p2GetP1State: true, missOnOverride: false }),
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

    expect(result).toEqual({ kind: "hitoverride", message: "P2 HitOverride slot 1 redirected P1 to state 777" });
    expect(attacker.hasHit).toBe(true);
    expect(attacker.targets).toEqual([{ actorId: "p2", targetId: 77, age: 0 }]);
    expect(entries).toEqual(["p2:777:self"]);
    expect(defender.runtime.stateNo).toBe(777);
    expect(defender.runtime.life).toBe(100);
    expect(logs).toEqual(["P2 HitOverride slot 1 redirected P1 to state 777"]);
  });

  it("lets explicit MissOnOverride one reject non-custom HitDefs before HitOverride", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const entries: string[] = [];
    const attacker = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA", targetId: 77, missOnOverride: true }),
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
    expect(logs).toEqual(["P2 rejected P1 S,NA because missonoverride = 1 forces active override miss"]);
  });

  it("rejects direct HitDef contact while SuperPause unhittable protects the defender", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const world = new RuntimeCombatResolutionWorld();
    const attacker = actor("p2", "P2", contactWorld, {
      runtime: runtimeState({ stateNo: 200 }),
      currentMove: move({ attr: "S,NA" }),
      moveTick: 2,
    });
    const defender = actor("p1", "P1", contactWorld, {
      runtime: runtimeState({ pos: { x: 18, y: 0 }, life: 100 }),
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
    expect(logs).toEqual(["P1 rejected P2 S,NA via SuperPause unhittable"]);
  });

  it("routes projectile callbacks through target, contact, presentation, and damage ownership hooks", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({ projectileId: 88, serialId: "p1-projectile-0", hitSound: "S6,0", hitSpark: "S7001" });
    const calls: string[] = [];
    const resolver: ProjectileResolver = (ownerId, input) => {
      calls.push(`owner:${ownerId}`);
      input.rememberTarget(input.attacker, input.defender, projectile.targetId, projectile);
      input.recordProjectileContact?.(input.attacker, input.defender, projectile, "hit");
      input.recordReceivedDamage?.(input.defender, 12);
      input.emitProjectileContactEffects?.(input.attacker, input.defender, projectile, "hit");
    };
    const attacker = actor("p1", "P1", contactWorld, { runtime: runtimeState({ stateNo: 300 }), projectileResolver: resolver });
    const defender = actor("p2", "P2", contactWorld, { runtime: runtimeState({ stateNo: 5000 }) });

    new RuntimeCombatResolutionWorld().resolveProjectile({
      attacker,
      defender,
      hitOverrideWorld: new RuntimeHitOverrideWorld(),
      effectLifecycleWorld: { markGetHit: (target) => calls.push(`mark:${target.id}`) },
      guardWorld: new RuntimeGuardWorld(),
      getHitStateWorld: new RuntimeGetHitStateWorld(),
      hitStateTransitionWorld: new RuntimeHitStateTransitionWorld(),
      contactPresentationWorld: new RuntimeContactPresentationWorld(),
      runtimeTick: 12,
      getHurtBoxes: () => [{ x1: -24, y1: -40, x2: 24, y2: 0 }],
      stateHooks: hooks(),
      rememberProjectileTarget: (_source, _target, entry) => calls.push(`projectile-target:${entry.serialId}`),
      log: (line) => calls.push(`log:${line}`),
    });

    expect(calls).toEqual(["owner:p1", "projectile-target:p1-projectile-0"]);
    expect(attacker.targets).toEqual([{ actorId: "p2", targetId: 88, age: 0 }]);
    expect(contactWorld.hasProjectileContact(attacker.contact, 300, "hit", 88)).toBe(true);
    expect(runtimeMoveHitCountValue(attacker.contact, 300, false)).toBe(1);
    expect(runtimeMoveHitCountValue(attacker.contact, 300, true)).toBe(1);
    expect(runtimeReceivedDamageValue(defender.contact, 5000)).toBe(12);
    expect(attacker.soundEvents[0]).toMatchObject({ type: "PlaySnd", group: 6, index: 0, contactKind: "hit" });
    expect(attacker.hitEffectEvents[0]).toMatchObject({ type: "HitSpark", kind: "hit", sparkNo: 7001, contactKind: "hit" });
  });

  it("routes Projectile p2stateno through target hit-state ownership when no HitOverride is active", () => {
    const contactWorld = new RuntimeContactMemoryWorld();
    const projectile = projectileActor({ projectileId: 88, p2StateNo: 889, p2GetP1State: false });
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

    expect(entries).toEqual(["p2:889:clear"]);
    expect(defender.runtime.stateNo).toBe(889);
    expect(attacker.targets).toEqual([{ actorId: "p2", targetId: 88, age: 0 }]);
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
  runtime?: CharacterRuntimeState;
  currentMove?: DemoMove;
  moveTick?: number;
  hasHit?: boolean;
  projectileResolver?: ProjectileResolver;
};

function actor(id: string, label: string, contactWorld: RuntimeContactMemoryWorld, options: ActorOptions = {}): TestActor {
  let removedExplodsOnGetHit = 0;
  const targetWorld = new RuntimeTargetWorld();
  const state = options.runtime ?? runtimeState();
  return {
    id,
    label,
    definition: {
      source: "demo",
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
        options.projectileResolver?.(ownerId, input);
      },
      helpers: () => [],
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
    damage: 12,
    kill: true,
    guardKill: true,
    attr: "S,SP",
    targetId: 88,
    hitPause: 4,
    hitStun: 13,
    push: 5,
    guardDamage: 3,
    guardDistance: 120,
    guardFlag: "MA",
    guardPause: 3,
    guardStun: 8,
    guardPush: 2,
    hitbox: { x1: 6, y1: -18, x2: 34, y2: 6 },
    removeOnHit: true,
    hasHit: false,
    terminalActions: {},
    ...overrides,
  };
}
