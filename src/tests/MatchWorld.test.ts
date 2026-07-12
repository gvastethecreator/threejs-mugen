import { describe, expect, it } from "vitest";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import {
  buildMatchWorldActorRegistry,
  matchWorldActorRegistryFingerprint,
  MatchWorld,
} from "../mugen/runtime/MatchWorld";
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

  it("forwards the IKEMEN runtime profile into root-player RunOrder", () => {
    const world = new MatchWorld({
      p1: demoFighters[0]!,
      p2: demoFighters[1]!,
      stage: trainingStage,
      runtimeProfile: "ikemen-go",
    });
    world.step({ p1: new Set(), p2: new Set(["x"]) });

    const snapshot = world.step({ p1: new Set(), p2: new Set() });
    const controllerOrder = snapshot.tickSchedule?.phases
      .filter((phase) => phase.id === "fighter:controllers")
      .map((phase) => phase.actorId);

    expect(controllerOrder).toEqual(["p2", "p1"]);
  });

  it("publishes inert P3-P8 roots and participation through the live MatchWorld registry only", () => {
    const world = new MatchWorld({
      p1: demoFighters[0]!,
      p2: demoFighters[1]!,
      stage: trainingStage,
      runtimeProfile: "ikemen-go",
      reserveFighters: Array.from({ length: 6 }, (_, index) => demoFighters[index % 2]!),
    });
    const snapshot = world.step({ p1: new Set(), p2: new Set() });
    const registry = world.getActorRegistry();

    expect(snapshot.actors.map((actor) => actor.id)).toEqual(["p1", "p2"]);
    expect(snapshot.reserveActors?.map((actor) => actor.id)).toEqual(["p3", "p4", "p5", "p6", "p7", "p8"]);
    expect(registry.players).toEqual(["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"]);
    expect(registry.teamSides).toEqual({ 1: ["p1", "p3", "p5", "p7"], 2: ["p2", "p4", "p6", "p8"] });
    expect(registry.teamRoster.characters.slice(2)).toEqual(
      ["p3", "p4", "p5", "p6", "p7", "p8"].map((id) =>
        expect.objectContaining({ id, standby: true, enemyBaseEligible: false }),
      ),
    );
    expect(registry.rootParticipation).toEqual(expect.objectContaining({
      schema: "RuntimeRootParticipation/v0",
      activeRootIdsBySide: { 1: ["p1"], 2: ["p2"] },
      roots: expect.arrayContaining([
        expect.objectContaining({ id: "p1", side: 1, structurallyActive: true, scheduled: true, presented: true }),
        expect.objectContaining({ id: "p2", side: 2, structurallyActive: true, scheduled: true, presented: true }),
        expect.objectContaining({
          id: "p3",
          side: 1,
          standby: true,
          structurallyActive: false,
          scheduled: true,
          inputOwned: false,
          combatOwned: false,
          roundOwned: false,
          presented: false,
          effectStoreOwned: false,
        }),
        expect.objectContaining({
          id: "p4",
          side: 2,
          standby: true,
          structurallyActive: false,
          scheduled: true,
          inputOwned: false,
          combatOwned: false,
          roundOwned: false,
          presented: false,
          effectStoreOwned: false,
        }),
      ]),
    }));
    expect(registry.rootParticipation.roots.slice(2)).toHaveLength(6);
    expect(
      registry.rootParticipation.roots.slice(2).every(
        (root) =>
          !root.structurallyActive &&
          root.scheduled &&
          !root.inputOwned &&
          !root.combatOwned &&
          !root.roundOwned &&
          !root.presented &&
          !root.effectStoreOwned,
      ),
    ).toBe(true);
    expect(registry.lifecycle.records.filter((record) => /^p[3-8]$/.test(record.id))).toHaveLength(6);
    expect(registry.effectStores.map((store) => store.ownerId)).toEqual(["p1", "p2"]);

    const structurallyActiveSnapshot = structuredClone(snapshot);
    structurallyActiveSnapshot.reserveActors![0]!.runtime.teamState!.standby = false;
    structurallyActiveSnapshot.reserveActors![1]!.runtime.teamState = {
      disabled: false,
      standby: false,
      overKo: true,
      playerType: true,
    };
    structurallyActiveSnapshot.reserveActors![3]!.runtime.teamState = {
      disabled: false,
      standby: false,
      overKo: false,
      playerType: false,
    };
    structurallyActiveSnapshot.reserveActors![5]!.runtime.teamState!.disabled = true;
    structurallyActiveSnapshot.reserveActors![5]!.runtime.teamState!.standby = false;
    for (const actor of structurallyActiveSnapshot.reserveActors ?? []) {
      const route = structurallyActiveSnapshot.rootInputRouting?.roots.find(({ id }) => id === actor.id);
      if (!route) continue;
      route.standby = actor.runtime.teamState?.standby ?? false;
      route.effectiveCtrl =
        actor.runtime.ctrl && actor.runtime.teamState?.disabled !== true && actor.runtime.teamState?.standby !== true;
    }
    const structurallyActiveRegistry = buildMatchWorldActorRegistry(structurallyActiveSnapshot);
    expect(structurallyActiveRegistry.rootParticipation.roots.find((root) => root.id === "p3")).toMatchObject({
      structurallyActive: true,
      scheduled: true,
      inputOwned: false,
      combatOwned: false,
      roundOwned: false,
      presented: false,
      effectStoreOwned: false,
    });
    expect(structurallyActiveRegistry.rootSelection.entries.find((entry) => entry.actorId === "p1")).toEqual({
      actorId: "p1",
      side: 1,
      partnerIds: ["p3", "p5", "p7"],
      enemyIds: ["p2", "p4", "p6"],
      p2CandidateIds: ["p2"],
    });
  });

  it("exposes Tag side command routing without widening reserve gameplay ownership", () => {
    const world = new MatchWorld({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = world.step({ p1: new Set(["x"]), p2: new Set() });
    const registry = world.getActorRegistry();

    expect(snapshot.rootInputRouting).toMatchObject({
      schema: "RuntimeRootInputRouting/v0",
      mode: "ikemen-tag",
      scope: "normal-active-tick",
    });
    expect(snapshot.rootInputRouting?.roots.find(({ id }) => id === "p3")).toMatchObject({
      commandSource: "p1",
      commandMapped: true,
      directControlled: false,
      aiControlled: false,
      standby: true,
      effectiveCtrl: false,
    });
    expect(registry.rootParticipation.roots.find(({ id }) => id === "p3")).toMatchObject({
      scheduled: true,
      inputOwned: false,
      combatOwned: false,
      roundOwned: false,
      presented: false,
      effectStoreOwned: false,
    });
    expect(snapshot.actors.map(({ id }) => id)).toEqual(["p1", "p2"]);
    expect(registry.effectStores.map(({ ownerId }) => ownerId)).toEqual(["p1", "p2"]);
  });

  it("publishes current per-phase root capabilities without widening reserve execution", () => {
    const world = new MatchWorld({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    let registry = world.getActorRegistry();
    expect(world.getSnapshot().rootPresentation).toMatchObject({
      mode: "ikemen-tag",
      drawRootIds: ["p1", "p2"],
      cameraRootIds: ["p1", "p2"],
    });
    expect(registry.rootPhaseCapabilities).toMatchObject({
      schema: "RuntimeRootPhaseCapabilities/v4",
      mode: "ikemen-tag",
    });
    expect(registry.rootPhaseCapabilities?.roots.find(({ id }) => id === "p1")).toMatchObject({
      available: true,
      effectiveCtrl: true,
      phases: {
        commands: true,
        controllerCns: "playable",
        directInput: true,
        ai: false,
        kinematics: true,
        animation: true,
        constraints: true,
        effects: true,
        combat: true,
        round: true,
        presentation: true,
        resources: true,
      },
    });
    expect(registry.rootPhaseCapabilities?.roots.find(({ id }) => id === "p2")?.phases).toMatchObject({
      directInput: false,
      ai: true,
    });
    expect(registry.rootPhaseCapabilities?.roots.find(({ id }) => id === "p3")).toMatchObject({
      standby: true,
      structurallyActive: false,
      scheduled: true,
      effectiveCtrl: false,
      phases: {
        commands: true,
        controllerCns: "bounded-reserve",
        directInput: false,
        ai: false,
        kinematics: false,
        animation: false,
        constraints: false,
        effects: false,
        combat: false,
        round: false,
        presentation: false,
        resources: false,
      },
    });

    world.step({ p1: new Set(), p2: new Set() });
    registry = world.getActorRegistry();
    expect(registry.rootPhaseCapabilities?.roots.find(({ id }) => id === "p2")?.phases).toMatchObject({
      directInput: true,
      ai: false,
    });

    const handoffSnapshot = world.dispatch({
      type: "set-root-standby",
      changes: [
        { id: "p1", standby: true },
        { id: "p3", standby: false },
      ],
    });
    expect(handoffSnapshot.rootPresentation).toMatchObject({
      mode: "ikemen-tag",
      drawRootIds: ["p3", "p2"],
      cameraRootIds: ["p3", "p2"],
    });
    registry = world.getActorRegistry();
    expect(registry.rootPhaseCapabilities?.roots.find(({ id }) => id === "p1")).toMatchObject({
      standby: true,
      structurallyActive: false,
      effectiveCtrl: false,
      phases: expect.objectContaining({ controllerCns: "bounded-reserve", kinematics: false, constraints: false, presentation: false }),
    });
    expect(registry.rootPhaseCapabilities?.roots.find(({ id }) => id === "p3")).toMatchObject({
      standby: false,
      structurallyActive: true,
      phases: expect.objectContaining({ controllerCns: "active-motion", kinematics: true, constraints: true, presentation: true }),
    });

    registry.rootPhaseCapabilities!.roots[0]!.phases.combat = false;
    expect(world.getActorRegistry().rootPhaseCapabilities?.roots[0]?.phases.combat).toBe(true);
    const resetSnapshot = world.reset();
    expect(resetSnapshot.rootPresentation).toMatchObject({
      drawRootIds: ["p1", "p2"],
      cameraRootIds: ["p1", "p2"],
    });
    expect(world.getActorRegistry().rootPhaseCapabilities?.roots.find(({ id }) => id === "p3")?.standby).toBe(true);
  });

  it("keeps Single reserves command-disabled and legacy registries capability-free", () => {
    const single = new MatchWorld({
      runtimeProfile: "ikemen-go",
      teamMode: "single",
      reserveFighters: [demoFighters[0]!],
    });
    const singleReserve = single.getActorRegistry().rootPhaseCapabilities?.roots.find(({ id }) => id === "p3");

    expect(single.getActorRegistry().rootPhaseCapabilities?.mode).toBe("ikemen-single");
    expect(singleReserve?.phases).toMatchObject({ commands: false, controllerCns: "bounded-reserve" });
    expect(new MatchWorld().getActorRegistry().rootPhaseCapabilities).toBeUndefined();
  });

  it("projects atomic standby transitions without widening playable consumers", () => {
    const world = new MatchWorld({
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    world.dispatch({ type: "set-root-standby", changes: [{ id: "p3", standby: false }] });
    let registry = world.getActorRegistry();
    expect(registry.rootParticipation.activeRootIdsBySide).toEqual({ 1: ["p1", "p3"], 2: ["p2"] });
    expect(registry.rootSelection.entries.find((entry) => entry.actorId === "p2")).toMatchObject({
      partnerIds: ["p4"],
      enemyIds: ["p1", "p3"],
      p2CandidateIds: ["p1", "p3"],
    });
    expect(registry.rootParticipation.roots.find((root) => root.id === "p3")).toMatchObject({
      structurallyActive: true,
      scheduled: true,
      inputOwned: false,
      combatOwned: false,
      roundOwned: false,
      presented: false,
      effectStoreOwned: false,
    });

    const snapshot = world.dispatch({
      type: "set-root-standby",
      changes: [
        { id: "p1", standby: true },
        { id: "p3", standby: false },
      ],
    });
    expect(snapshot.actors.map((actor) => actor.id)).toEqual(["p1", "p2"]);
    expect(snapshot.reserveActors?.map((actor) => actor.id)).toEqual(["p3", "p4"]);
    registry = world.getActorRegistry();
    expect(registry.rootParticipation.activeRootIdsBySide).toEqual({ 1: ["p3"], 2: ["p2"] });
    expect(registry.rootSelection.entries.find((entry) => entry.actorId === "p2")).toMatchObject({
      partnerIds: ["p4"],
      enemyIds: ["p3"],
      p2CandidateIds: ["p3"],
    });
    expect(registry.rootParticipation.roots.find((root) => root.id === "p1")?.scheduled).toBe(true);

    world.reset();
    expect(world.getActorRegistry().rootParticipation.activeRootIdsBySide).toEqual({ 1: ["p1"], 2: ["p2"] });
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
    expect(registry.teamRoster.characters).toEqual([
      expect.objectContaining({ id: "p1", playerType: true, enemyBaseEligible: true }),
      expect.objectContaining({ id: "p2", playerType: true, enemyBaseEligible: true }),
    ]);

    registry.byId.p2!.teamState.standby = true;
    registry.teamSides[2].push("corrupt");
    registry.rootParticipation.roots[0]!.scheduled = false;
    registry.rootSelection.entries[0]!.enemyIds.push("corrupt");
    const freshRegistry = world.getActorRegistry();
    expect(freshRegistry.byId.p2?.teamState.standby).toBe(false);
    expect(freshRegistry.teamSides[2]).toEqual(["p2"]);
    expect(freshRegistry.rootParticipation.roots[0]?.scheduled).toBe(true);
    expect(freshRegistry.rootSelection.entries[0]?.enemyIds).not.toContain("corrupt");
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

  it("publishes a multi-root team roster diagnostic from synthetic snapshots", () => {
    const world = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]!, stage: closeStage });
    const snapshot = world.getSnapshot();
    const p1 = snapshot.actors[0]!;
    const p2 = snapshot.actors[1]!;
    const p3 = {
      ...p1,
      id: "p3",
      label: "P3",
      runtime: { ...p1.runtime, teamState: { disabled: false, standby: true, overKo: false, playerType: true } },
    };
    const p4 = {
      ...p2,
      id: "p4",
      label: "P4",
      runtime: { ...p2.runtime, teamState: { disabled: true, standby: false, overKo: false, playerType: true } },
    };
    const helper = {
      ...p3,
      id: "p3-helper-0",
      label: "P3 Helper",
      actorKind: "helper" as const,
      source: "effect" as const,
      ownerId: "p3",
      rootId: "p3",
      parentId: "p3",
      runtime: { ...p3.runtime, teamState: { disabled: false, standby: false, overKo: true, playerType: true } },
    };
    const registry = buildMatchWorldActorRegistry({
      ...snapshot,
      actors: [p1, p2, p3, p4],
      effects: [helper],
    });
    const standbyChanged = {
      ...snapshot,
      actors: [
        p1,
        { ...p2, runtime: { ...p2.runtime, teamState: { ...p2.runtime.teamState!, standby: true } } },
        p3,
        p4,
      ],
      effects: [helper],
    };

    expect(registry.players).toEqual(["p1", "p2", "p3", "p4"]);
    expect(registry.teamRoster.schema).toBe("RuntimeTeamRoster/v0");
    expect(registry.teamRoster.characters.map((actor) => [actor.id, actor.side, actor.kind])).toEqual([
      ["p1", 1, "root"],
      ["p2", 2, "root"],
      ["p3", 1, "root"],
      ["p4", 2, "root"],
      ["p3-helper-0", 1, "helper"],
    ]);
    expect(registry.byId.p3).toMatchObject({ id: "p3", kind: "player" });
    expect(registry.byId["p3-helper-0"]).toMatchObject({ rootId: "p3", kind: "helper" });
    expect(registry.teamSides).toEqual({
      1: ["p1", "p3", "p3-helper-0"],
      2: ["p2", "p4"],
    });
    expect(registry.teamRoster.characters).toEqual([
      expect.objectContaining({ id: "p1", enemyBaseEligible: true, enemyNearCandidate: true, p2Candidate: true }),
      expect.objectContaining({ id: "p2", enemyBaseEligible: true, enemyNearCandidate: true, p2Candidate: true }),
      expect.objectContaining({ id: "p3", standby: true, enemyBaseEligible: false, enemyNearCandidate: false, p2Candidate: false }),
      expect.objectContaining({ id: "p4", disabled: true, enemyBaseEligible: false, enemyNearCandidate: false, p2Candidate: false }),
      expect.objectContaining({ id: "p3-helper-0", playerType: true, overKo: true, enemyBaseEligible: true, enemyNearCandidate: false, p2Candidate: false }),
    ]);
    expect(matchWorldActorRegistryFingerprint(standbyChanged)).not.toBe(
      matchWorldActorRegistryFingerprint({ ...snapshot, actors: [p1, p2, p3, p4], effects: [helper] }),
    );
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
