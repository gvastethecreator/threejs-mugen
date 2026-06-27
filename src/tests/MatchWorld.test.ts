import { describe, expect, it } from "vitest";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { buildMatchWorldActorRegistry, MatchWorld } from "../mugen/runtime/MatchWorld";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";
import { expandRuntimeTraceScript, runRuntimeTrace } from "../mugen/runtime/RuntimeTrace";

const closeStage = {
  ...trainingStage,
  playerStart: {
    p1: { x: -20, y: 0, facing: 1 as const },
    p2: { x: 35, y: 0, facing: -1 as const },
  },
};

describe("MatchWorld", () => {
  it("is the public match facade while preserving current PlayableMatchRuntime behavior", () => {
    const script = expandRuntimeTraceScript([{ label: "kick", frames: 16, p1: ["a"], p2: [] }]);
    const direct = runRuntimeTrace(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage), script, {
      label: "direct-runtime",
    });
    const world = runRuntimeTrace(new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: closeStage }), script, {
      label: "direct-runtime",
    });

    expect(world.checksum).toBe(direct.checksum);
    expect(world.final.actors).toEqual(direct.final.actors);
    expect(world.events).toEqual(direct.events);
    expect(world.frames[0]?.world?.live).toEqual(["p1", "p2"]);
    expect(world.frames[0]?.world?.lifecycle.find((actor) => actor.id === "p1")).toMatchObject({
      status: "active",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
    });
    expect(world.frames[0]?.world?.eventsThisTick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "active", id: "p1" }),
        expect.objectContaining({ type: "active", id: "p2" }),
      ]),
    );
    expect(world.frames.some((frame) => frame.world?.targetLinks.some((link) => link.ownerId === "p1" && link.actorId === "p2"))).toBe(
      true,
    );
  });

  it("owns reset and command dispatch at the match boundary", () => {
    const world = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: closeStage });
    const initialRegistry = world.getActorRegistry();
    expect(initialRegistry.lifecycle.spawnedThisTick).toEqual(["p1", "p2"]);
    expect(initialRegistry.lifecycle.eventsThisTick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", id: "p1", tick: 0 }),
        expect.objectContaining({ type: "spawn", id: "p2", tick: 0 }),
      ]),
    );
    expect(initialRegistry.effectStores).toEqual([
      {
        ownerId: "p1",
        total: 0,
        explods: [],
        helpers: [],
        projectiles: [],
        nextSerials: { explod: 0, helper: 0, projectile: 0 },
      },
      {
        ownerId: "p2",
        total: 0,
        explods: [],
        helpers: [],
        projectiles: [],
        nextSerials: { explod: 0, helper: 0, projectile: 0 },
      },
    ]);
    expect(world.getEffectActorStores()).toEqual(initialRegistry.effectStores);
    expect(initialRegistry.byId.p1?.lifecycle).toMatchObject({ status: "spawned", ageTicks: 0 });

    const advanced = world.step({ p1: new Set(["a"]), p2: new Set() });
    const advancedRegistry = world.getActorRegistry();

    expect(advanced.tick).toBe(1);
    expect(advanced.actors.map((actor) => actor.actorKind)).toEqual(["player", "player"]);
    expect(advanced.actors.map((actor) => actor.ownerId)).toEqual(["p1", "p2"]);
    expect(advancedRegistry.lifecycle.spawnedThisTick).toEqual([]);
    expect(advancedRegistry.lifecycle.eventsThisTick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "active", id: "p1", tick: 1, ageTicks: 1 }),
        expect.objectContaining({ type: "active", id: "p2", tick: 1, ageTicks: 1 }),
      ]),
    );
    expect(advancedRegistry.lifecycle.recentEvents.length).toBeGreaterThanOrEqual(4);
    expect(advancedRegistry.effectStores.map((store) => store.ownerId)).toEqual(["p1", "p2"]);
    expect(advancedRegistry.byId.p1?.lifecycle).toMatchObject({ status: "active", ageTicks: 1 });
    expect(world.dispatch({ type: "set-playing", playing: false }).playing).toBe(false);

    const paused = world.step({ p1: new Set(["F"]), p2: new Set() });
    expect(paused.tick).toBe(1);

    const reset = world.reset();
    const resetRegistry = world.getActorRegistry();
    expect(reset.tick).toBe(0);
    expect(reset.playing).toBe(true);
    expect(reset.actors[0]?.runtime.life).toBe(1000);
    expect(resetRegistry.lifecycle.spawnedThisTick).toEqual(["p1", "p2"]);
    expect(resetRegistry.lifecycle.eventsThisTick.map((event) => event.type)).toEqual(["spawn", "spawn"]);
    expect(resetRegistry.lifecycle.removed).toEqual([]);
    expect(world.getEffectActorStores()).toEqual(resetRegistry.effectStores);
  });

  it("exposes a player actor registry without changing match state", () => {
    const world = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: closeStage });
    const before = world.getSnapshot();
    const registry = world.getActorRegistry();
    const after = world.getSnapshot();

    expect(after.tick).toBe(before.tick);
    expect(registry.players).toEqual(["p1", "p2"]);
    expect(registry.effects).toEqual([]);
    expect(registry.targetLinks).toEqual([]);
    expect(registry.byKind.player).toEqual(["p1", "p2"]);
    expect(registry.byOwner.p1).toEqual(["p1"]);
    expect(registry.byOwner.p2).toEqual(["p2"]);
    expect(registry.byId.p1).toMatchObject({
      id: "p1",
      kind: "player",
      layer: "actor",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      stateNo: 0,
      animNo: 0,
      lifecycle: {
        status: "spawned",
        firstSeenTick: 0,
        lastSeenTick: 0,
      },
    });
  });

  it("indexes effect actors by kind and owner from runtime snapshots", () => {
    const world = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: closeStage });
    const snapshot = world.getSnapshot();
    const source = snapshot.actors[0]!;
    const helper = {
      ...source,
      id: "p1-helper-0",
      label: "P1 Helper",
      actorKind: "helper" as const,
      source: "effect" as const,
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
    };
    const projectile = {
      ...source,
      id: "p1-projectile-0",
      label: "P1 Projectile",
      actorKind: "projectile" as const,
      source: "effect" as const,
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
    };
    const registry = buildMatchWorldActorRegistry({
      ...snapshot,
      effects: [helper, projectile],
    });

    expect(registry.players).toEqual(["p1", "p2"]);
    expect(registry.effects).toEqual(["p1-helper-0", "p1-projectile-0"]);
    expect(registry.lifecycle.live).toEqual(["p1", "p2", "p1-helper-0", "p1-projectile-0"]);
    expect(registry.lifecycle.eventsThisTick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "active", id: "p1-helper-0", kind: "helper" }),
        expect.objectContaining({ type: "active", id: "p1-projectile-0", kind: "projectile" }),
      ]),
    );
    expect(registry.effectStores.find((store) => store.ownerId === "p1")).toMatchObject({
      total: 2,
      helpers: ["p1-helper-0"],
      projectiles: ["p1-projectile-0"],
    });
    expect(registry.byKind.helper).toEqual(["p1-helper-0"]);
    expect(registry.byKind.projectile).toEqual(["p1-projectile-0"]);
    expect(registry.byOwner.p1).toEqual(["p1", "p1-helper-0", "p1-projectile-0"]);
    expect(registry.byId["p1-helper-0"]).toMatchObject({
      layer: "effect",
      kind: "helper",
      ownerId: "p1",
    });
  });

  it("exposes target ownership links from actor snapshots without changing behavior state", () => {
    const world = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: closeStage });
    const source = world.getSnapshot();
    const p1 = {
      ...source.actors[0]!,
      runtime: {
        ...source.actors[0]!.runtime,
        targetCount: 1,
        targetRefs: [{ actorId: "p2", targetId: 77, age: 3 }],
        targetBindings: [{ actorId: "p2", targetId: 77, remaining: 4, offset: { x: 24, y: -8 } }],
        bindToTarget: { actorId: "p2", targetId: 77, remaining: 3, offset: { x: 26, y: -80 } },
      },
    };
    const p2 = source.actors[1]!;
    const registry = buildMatchWorldActorRegistry({ ...source, actors: [p1, p2] });

    expect(registry.byId.p1?.targetCount).toBe(1);
    expect(registry.byId.p1?.targets).toEqual([{ actorId: "p2", targetId: 77, age: 3 }]);
    expect(registry.byId.p1?.targetBindings).toEqual([
      { actorId: "p2", targetId: 77, remaining: 4, offset: { x: 24, y: -8 } },
    ]);
    expect(registry.byId.p1?.bindToTarget).toEqual({
      actorId: "p2",
      targetId: 77,
      remaining: 3,
      offset: { x: 26, y: -80 },
    });
    expect(registry.targetLinks).toEqual([
      {
        ownerId: "p1",
        actorId: "p2",
        targetId: 77,
        age: 3,
        binding: { actorId: "p2", targetId: 77, remaining: 4, offset: { x: 24, y: -8 } },
      },
      {
        ownerId: "p1",
        actorId: "p2",
        targetId: 77,
        age: 3,
        binding: { actorId: "p2", targetId: 77, remaining: 3, offset: { x: 26, y: -80 } },
      },
    ]);
  });
});
