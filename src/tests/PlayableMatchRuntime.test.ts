import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { parseCmd } from "../mugen/parsers/CmdParser";
import { parseCns } from "../mugen/parsers/CnsParser";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { createRuntimeEffectActorStores, RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";

describe("PlayableMatchRuntime", () => {
  it("starts a two-fighter round on the training stage", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!);
    const snapshot = runtime.getSnapshot();

    expect(snapshot.actors).toHaveLength(2);
    expect(snapshot.actors[0]?.label).toBe("Nova Boxer");
    expect(snapshot.actors[1]?.label).toBe("Mira Volt");
    expect(snapshot.stage.floorY).toBe(0);
    expect(snapshot.playing).toBe(true);
    expect(snapshot.tickSchedule).toMatchObject({
      schema: "MatchTickSchedule/v0",
      tick: 0,
      branch: "idle",
      phases: [],
      behaviorChecksumProjection: "excluded",
    });
  });

  it("schedules capped IKEMEN P3-P8 reserve roots for controller-only CNS without presenting them", () => {
    const reserveFighters = Array.from({ length: 7 }, (_, index) => demoFighters[index % 2]!);
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters,
    });
    const initial = runtime.getSnapshot();
    const advanced = runtime.step({ p1: new Set(), p2: new Set() });

    expect(initial.actors.map((actor) => actor.id)).toEqual(["p1", "p2"]);
    expect(initial.reserveActors?.map((actor) => actor.id)).toEqual(["p3", "p4", "p5", "p6", "p7", "p8"]);
    expect(initial.reserveActors?.every((actor) => actor.runtime.teamState?.standby)).toBe(true);
    expect(initial.reserveActors?.map((actor) => ({ id: actor.id, pos: actor.runtime.pos, facing: actor.runtime.facing }))).toEqual([
      { id: "p3", pos: { x: trainingStage.playerStart.p1.x, y: trainingStage.playerStart.p1.y }, facing: trainingStage.playerStart.p1.facing },
      { id: "p4", pos: { x: trainingStage.playerStart.p2.x, y: trainingStage.playerStart.p2.y }, facing: trainingStage.playerStart.p2.facing },
      { id: "p5", pos: { x: trainingStage.playerStart.p1.x, y: trainingStage.playerStart.p1.y }, facing: trainingStage.playerStart.p1.facing },
      { id: "p6", pos: { x: trainingStage.playerStart.p2.x, y: trainingStage.playerStart.p2.y }, facing: trainingStage.playerStart.p2.facing },
      { id: "p7", pos: { x: trainingStage.playerStart.p1.x, y: trainingStage.playerStart.p1.y }, facing: trainingStage.playerStart.p1.facing },
      { id: "p8", pos: { x: trainingStage.playerStart.p2.x, y: trainingStage.playerStart.p2.y }, facing: trainingStage.playerStart.p2.facing },
    ]);
    const originalDuration = initial.reserveActors?.[0]?.frame?.duration;
    initial.reserveActors![0]!.frame!.duration = 999;
    const isolated = runtime.getSnapshot();
    expect(isolated.reserveActors?.[0]?.frame?.duration).toBe(originalDuration);
    expect(isolated.actors[0]?.frame?.duration).toBe(originalDuration);
    expect(advanced.reserveActors?.map((actor) => ({ id: actor.id, stateNo: actor.runtime.stateNo, pos: actor.runtime.pos }))).toEqual(
      isolated.reserveActors?.map((actor) => ({ id: actor.id, stateNo: actor.runtime.stateNo, pos: actor.runtime.pos })),
    );
    expect(
      advanced.tickSchedule?.phases
        .filter((phase) => /^p[3-8]$/.test(phase.actorId ?? ""))
        .map((phase) => [phase.id, phase.actorId]),
    ).toEqual(["p3", "p4", "p5", "p6", "p7", "p8"].map((id) => ["fighter:controllers", id]));
    expect(
      advanced.tickSchedule?.phases.some(
        (phase) => /^p[3-8]$/.test(phase.actorId ?? "") && phase.id !== "fighter:controllers",
      ),
    ).toBe(false);
    expect(runtime.getEffectActorStores().map((store) => store.ownerId)).toEqual(["p1", "p2"]);

    runtime.reset();
    expect(runtime.getSnapshot().reserveActors?.map((actor) => [actor.id, actor.runtime.teamState?.standby])).toEqual(
      ["p3", "p4", "p5", "p6", "p7", "p8"].map((id) => [id, true]),
    );
  });

  it("integrates stable IKEMEN P1-P4 identity into runtime expressions and diagnostics", () => {
    const identityStateNo = 7770;
    const p1 = createImportedFixture({
      id: "ikemen-root-identity",
      withStateMove: false,
      extraStateNos: [identityStateNo],
    });
    p1.stateEntryControllers = [
      ...(p1.stateEntryControllers ?? []),
      ...parseCns(`
[State -1, Numeric root identity]
type = ChangeState
trigger1 = ID = 56
trigger1 = PlayerNo = 1
trigger1 = EnemyNear, ID = 58
trigger1 = EnemyNear, PlayerNo = 2
value = ${identityStateNo}
`).controllers,
    ];
    const runtime = new PlayableMatchRuntime(p1, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const initial = runtime.getCharacterIdentity();
    expect(initial?.characters.map(({ actorId, playerId, playerNo, disabled, standby, lookupEligible }) => ({
      actorId,
      playerId,
      playerNo,
      disabled,
      standby,
      lookupEligible,
    }))).toEqual([
      { actorId: "p1", playerId: 56, playerNo: 1, disabled: false, standby: false, lookupEligible: true },
      { actorId: "p3", playerId: 57, playerNo: 3, disabled: false, standby: true, lookupEligible: true },
      { actorId: "p2", playerId: 58, playerNo: 2, disabled: false, standby: false, lookupEligible: true },
      { actorId: "p4", playerId: 59, playerNo: 4, disabled: false, standby: true, lookupEligible: true },
    ]);
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(initial?.characters)).toBe(true);
    expect(runtime.step({ p1: new Set(), p2: new Set() }).actors[0]?.runtime.stateNo).toBe(identityStateNo);

    runtime.dispatch({ type: "set-root-standby", changes: [{ id: "p1", standby: true }] });
    expect(runtime.getCharacterIdentity()?.characters.find(({ actorId }) => actorId === "p1")?.standby).toBe(true);
    runtime.reset();
    expect(runtime.getCharacterIdentity()?.characters.map(({ actorId, playerId, playerNo }) => [actorId, playerId, playerNo])).toEqual(
      initial?.characters.map(({ actorId, playerId, playerNo }) => [actorId, playerId, playerNo]),
    );

    const legacy = new PlayableMatchRuntime(p1, demoFighters[1]!, trainingStage, { runtimeProfile: "mugen-1.1" });
    expect(legacy.getCharacterIdentity()).toBeUndefined();
    expect(legacy.step({ p1: new Set(), p2: new Set() }).actors[0]?.runtime.stateNo).toBe(0);
  });

  it("registers Helpers before same-tick IKEMEN ID and PlayerNo expression execution", () => {
    const fighter = createImportedFixture({
      id: "ikemen-helper-identity",
      withStateMove: false,
      withHelper: true,
      helperRedirectTag: true,
      helperStateControllers: `
[State 1200, Helper PlayerID]
type = VarSet
trigger1 = 1
v = 0
value = ID

[State 1200, Helper PlayerNo]
type = VarSet
trigger1 = 1
v = 1
value = PlayerNo

[State 1200, Parent PlayerID]
type = VarSet
trigger1 = 1
v = 2
value = Parent, ID

[State 1200, Parent PlayerNo]
type = VarSet
trigger1 = 1
v = 3
value = Parent, PlayerNo

[State 1200, Root PlayerID]
type = VarSet
trigger1 = 1
v = 4
value = Root, ID

[State 1200, Root PlayerNo]
type = VarSet
trigger1 = 1
v = 5
value = Root, PlayerNo
`,
    });
    const runtime = new PlayableMatchRuntime(fighter, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const helper = snapshot.effects?.find(({ id }) => id === "p1-helper-0");
    expect(helper?.runtime.vars.slice(0, 6)).toEqual([58, 1, 56, 1, 56, 1]);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
    expect(snapshot.logs.some((line) => line.includes("Blocked tagout RedirectID 58 for p1"))).toBe(true);
    expect(runtime.getCharacterIdentity()?.characters).toEqual([
      expect.objectContaining({ actorId: "p1", playerId: 56, playerNo: 1, kind: "root" }),
      expect.objectContaining({ actorId: "p2", playerId: 57, playerNo: 2, kind: "root" }),
      expect.objectContaining({
        actorId: "p1-helper-0",
        playerId: 58,
        playerNo: 1,
        kind: "helper",
        rootId: "p1",
        parentId: "p1",
        lookupEligible: true,
      }),
    ]);

    const legacy = new PlayableMatchRuntime(fighter, demoFighters[1]!, trainingStage, {
      runtimeProfile: "mugen-1.1",
    });
    const legacyHelper = legacy.step({ p1: new Set(["x"]), p2: new Set() }).effects?.find(({ id }) => id === "p1-helper-0");
    expect(legacy.getCharacterIdentity()).toBeUndefined();
    expect(legacyHelper?.runtime.vars.slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("unregisters expired Helpers without PlayerID reuse and starts a fresh identity epoch on reset", () => {
    const fighter = createImportedFixture({
      id: "ikemen-helper-identity-lifecycle",
      withStateMove: false,
      withHelper: true,
      helperRemoveTime: 2,
    });
    const effectActorWorld = new RuntimeEffectActorWorld();
    const runtime = new PlayableMatchRuntime(fighter, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      effectActorWorld,
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(runtime.getCharacterIdentity()?.characters.at(-1)).toMatchObject({ actorId: "p1-helper-0", playerId: 58 });
    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(runtime.getCharacterIdentity()).toMatchObject({ nextPlayerId: 59, characters: [{ actorId: "p1" }, { actorId: "p2" }] });

    for (let frame = 0; frame < 80 && snapshot.actors[0]?.runtime.stateNo !== 0; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(0);
    runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(runtime.getCharacterIdentity()?.characters.at(-1)).toMatchObject({ actorId: "p1-helper-1", playerId: 59 });

    runtime.reset();
    expect(runtime.getCharacterIdentity()).toMatchObject({
      nextPlayerId: 58,
      characters: [
        { actorId: "p1", playerId: 56, playerNo: 1 },
        { actorId: "p2", playerId: 57, playerNo: 2 },
      ],
    });
    effectActorWorld.spawnHelper("p1", {
      controller: {
        stateId: 0,
        type: "Helper",
        params: {},
        triggers: [],
        line: 1,
        rawHeader: "[State 0, Helper]",
      },
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      spriteOwnerId: fighter.id,
      spriteOwnerDefinitionId: fighter.id,
      spriteOwnerLabel: fighter.displayName,
      localCoord: fighter.localCoord,
      animations: fighter.animations,
      action: fighter.animations.get(920)!,
      stateNo: 1200,
      animNo: 920,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    expect(runtime.getCharacterIdentity()?.characters.at(-1)).toMatchObject({ actorId: "p1-helper-0", playerId: 58 });
  });

  it("executes redirected Tag params in caller context against the resolved IKEMEN root", () => {
    const caller = createImportedFixture({
      id: "redirected-tag-caller-context",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 57 },
      passiveTagController: "TagIn",
      passiveTagRedirectId: "var(0)",
      passiveTagSelf: "PlayerNo = 1",
      passiveTagStateNo: "ID + 144",
      passiveTagControl: "ID = 56",
      passiveTagMemberNo: "PlayerNo",
      passiveTagLeader: "PlayerNo + 2",
    });
    const target = createImportedFixture({ id: "redirected-tag-target", withStateMove: false });
    const runtime = new PlayableMatchRuntime(caller, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [target, demoFighters[1]!, demoFighters[0]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const p3 = snapshot.reserveActors?.find(({ id }) => id === "p3");
    expect(snapshot.actors[0]?.runtime).toMatchObject({ stateNo: 0, ctrl: true });
    expect(snapshot.actors[0]?.runtime.vars[0]).toBe(57);
    expect(p3?.runtime).toMatchObject({ stateNo: 200, ctrl: true, teamState: { standby: false } });
    expect(snapshot.tagTeamOrder?.sides[0]).toMatchObject({
      stableRootIds: ["p1", "p3", "p5"],
      memberOrderIds: ["p3", "p1", "p5"],
      leaderId: "p3",
    });
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it("selects redirected Tag partners relative to the resolved root", () => {
    const caller = createImportedFixture({
      id: "redirected-tag-partner",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagRedirectId: 57,
      passiveTagPartner: 0,
    });
    const runtime = new PlayableMatchRuntime(caller, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!, demoFighters[0]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.reserveActors?.map(({ id, runtime: state }) => [id, state.teamState?.standby])).toEqual([
      ["p3", true],
      ["p4", true],
      ["p5", false],
    ]);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
  });

  it("allows root RedirectID lookup across teams", () => {
    const caller = createImportedFixture({
      id: "redirected-opponent-tagout",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagRedirectId: 57,
      passiveTagSelf: 1,
    });
    const runtime = new PlayableMatchRuntime(caller, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors.map(({ id, runtime: state }) => [id, state.teamState?.standby])).toEqual([
      ["p1", false],
      ["p2", true],
    ]);
  });

  it("rejects invalid RedirectID before evaluating later Tag expressions", () => {
    const fixture = (self: number | string) => createImportedFixture({
      id: "invalid-redirect-evaluation-order",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagRedirectId: 999,
      passiveTagSelf: self,
      passiveVarSet: { trigger: "1", index: 1, value: "Random" },
    });
    const dynamicRuntime = new PlayableMatchRuntime(fixture("Random"), demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });
    const staticRuntime = new PlayableMatchRuntime(fixture(1), demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const dynamicSnapshot = dynamicRuntime.step({ p1: new Set(), p2: new Set() });
    const staticSnapshot = staticRuntime.step({ p1: new Set(), p2: new Set() });
    expect(dynamicSnapshot.actors[0]?.runtime.vars[1]).toBe(staticSnapshot.actors[0]?.runtime.vars[1]);
    expect(dynamicSnapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(dynamicSnapshot.logs).toContain("Blocked tagout RedirectID 999 for p1");
    expect(dynamicSnapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("rejects negative RedirectID without mutating the caller", () => {
    const caller = createImportedFixture({
      id: "negative-redirected-tagout",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagRedirectId: -1,
    });
    const runtime = new PlayableMatchRuntime(caller, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout RedirectID -1 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("rejects redirected Tag execution outside the explicit IKEMEN profile", () => {
    const caller = createImportedFixture({
      id: "legacy-redirected-tagout",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagRedirectId: 56,
    });
    const runtime = new PlayableMatchRuntime(caller, demoFighters[1]!, trainingStage, {
      runtimeProfile: "mugen-1.1",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout for p1 outside ikemen-go profile");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("ignores reserve roots outside the explicit IKEMEN profile", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    expect(runtime.getSnapshot().reserveActors).toBeUndefined();
  });

  it("executes standby-safe imported CNS while blocking reserve gameplay side effects", () => {
    const importedFixture = createImportedFixture({
        id: "standby-controller-reserve",
        displayName: "Standby Controller Reserve",
        withStateMove: false,
        withRuntimeFlags: true,
        withSideEffects: true,
      });
    const controllerState = importedFixture.states?.find((state) => state.id === 200)!;
    const importedReserve = {
      ...importedFixture,
      states: [
        {
          ...controllerState,
          id: 0,
          controllers: controllerState.controllers.map((controller) => ({ ...controller, stateId: 0 })),
        },
        ...(importedFixture.states?.filter((state) => state.id !== 0) ?? []),
      ],
    };
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [importedReserve],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const reserve = snapshot.reserveActors?.[0];
    expect(reserve).toMatchObject({
      id: "p3",
      runtime: {
        life: 1000,
        power: 0,
        stateType: "C",
        moveType: "A",
        physics: "N",
        facing: -1,
      },
    });
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p3")).toBe(false);
    expect(snapshot.logs).toEqual(expect.arrayContaining([
      expect.stringContaining("Blocked standby CNS controller LifeSet for p3"),
      expect.stringContaining("Blocked standby CNS controller PowerSet for p3"),
      expect.stringContaining("Blocked standby CNS controller PlaySnd for p3"),
      expect.stringContaining("Blocked standby CNS controller Explod for p3"),
    ]));
  });

  it("executes self TagIn for a standby root without changing its teammates", () => {
    const tagInReserve = createImportedFixture({
      id: "tag-in-reserve",
      displayName: "Tag In Reserve",
      withStateMove: false,
      passiveTagController: "TagIn",
    });
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [tagInReserve, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors.map((actor) => [actor.id, actor.runtime.teamState?.standby])).toEqual([
      ["p1", false],
      ["p2", false],
    ]);
    expect(snapshot.reserveActors?.map((actor) => [actor.id, actor.runtime.teamState?.standby])).toEqual([
      ["p3", false],
      ["p4", true],
    ]);
  });

  it("publishes Tag team order only for explicit IKEMEN Tag mode and resets deterministically", () => {
    const single = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });
    expect(single.getSnapshot().tagTeamOrder).toBeUndefined();

    const tag = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });
    const expected = {
      schema: "RuntimeTagTeamOrder/v0" as const,
      sides: [
        { side: 1 as const, stableRootIds: ["p1", "p3"], memberOrderIds: ["p1", "p3"], leaderId: "p1" },
        { side: 2 as const, stableRootIds: ["p2", "p4"], memberOrderIds: ["p2", "p4"], leaderId: "p2" },
      ],
    };
    expect(tag.getSnapshot().tagTeamOrder).toEqual(expected);
    tag.dispatch({ type: "set-root-standby", changes: [{ id: "p3", standby: false }] });
    expect(tag.getSnapshot().tagTeamOrder).toEqual(expected);
    expect(tag.dispatch({ type: "reset" }).tagTeamOrder).toEqual(expected);
  });

  it("executes static Tag member order without changing stable root slots", () => {
    const memberTagIn = createImportedFixture({
      id: "member-tag-in",
      displayName: "Member Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagMemberNo: 2,
    });
    const runtime = new PlayableMatchRuntime(memberTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.tagTeamOrder?.sides[0]).toMatchObject({
      stableRootIds: ["p1", "p3"],
      memberOrderIds: ["p3", "p1"],
      leaderId: "p1",
    });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it("selects dynamic Tag member order from a same-tick caller variable", () => {
    const memberTagOut = createImportedFixture({
      id: "dynamic-member-tag-out",
      displayName: "Dynamic Member Tag Out",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 2 },
      passiveTagController: "TagOut",
      passiveTagMemberNo: "var(0) + 0.9",
    });
    const runtime = new PlayableMatchRuntime(memberTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.vars[0]).toBe(2);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(true);
    expect(snapshot.tagTeamOrder?.sides[0]).toMatchObject({
      stableRootIds: ["p1", "p3"],
      memberOrderIds: ["p3", "p1"],
      leaderId: "p1",
    });
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(1);
  });

  it.each([
    ["zero", "var(0)", "tag"],
    ["negative", "var(0) - 1", "tag"],
    ["out-of-range", "var(0) + 3", "tag"],
    ["non-Tag mode", "var(0) + 2", "single"],
  ] as const)("rolls back %s dynamic Tag member order", (_case, memberExpression, teamMode) => {
    const memberTagOut = createImportedFixture({
      id: `blocked-dynamic-member-${_case}`,
      displayName: "Blocked Dynamic Member Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagSelf: 1,
      passiveTagMemberNo: memberExpression,
    });
    const runtime = new PlayableMatchRuntime(memberTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode,
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.tagTeamOrder?.sides[0]?.memberOrderIds).toEqual(teamMode === "tag" ? ["p1", "p3"] : undefined);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("blocks invalid Tag member order before existing Tag mutations", () => {
    const invalidMemberTagOut = createImportedFixture({
      id: "invalid-member-tag-out",
      displayName: "Invalid Member Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagMemberNo: 3,
    });
    const runtime = new PlayableMatchRuntime(invalidMemberTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.tagTeamOrder?.sides[0]?.memberOrderIds).toEqual(["p1", "p3"]);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout member position 3 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("blocks Tag member order outside explicit Tag mode", () => {
    const memberTagOut = createImportedFixture({
      id: "single-member-tag-out",
      displayName: "Single Member Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagMemberNo: 1,
    });
    const runtime = new PlayableMatchRuntime(memberTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.tagTeamOrder).toBeUndefined();
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout member position 1 for p1");
  });

  it("executes static TagIn leader against stable PlayerNo", () => {
    const leaderTagIn = createImportedFixture({
      id: "leader-tag-in",
      displayName: "Leader Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagLeader: 3,
    });
    const runtime = new PlayableMatchRuntime(leaderTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.tagTeamOrder?.sides[0]).toEqual({
      side: 1,
      stableRootIds: ["p1", "p3"],
      memberOrderIds: ["p3", "p1"],
      leaderId: "p3",
    });
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it("selects dynamic TagIn leader from a same-tick caller variable", () => {
    const leaderTagIn = createImportedFixture({
      id: "dynamic-leader-tag-in",
      displayName: "Dynamic Leader Tag In",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 3 },
      passiveTagController: "TagIn",
      passiveTagLeader: "var(0) + 0.9",
    });
    const runtime = new PlayableMatchRuntime(leaderTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.vars[0]).toBe(3);
    expect(snapshot.tagTeamOrder?.sides[0]).toEqual({
      side: 1,
      stableRootIds: ["p1", "p3"],
      memberOrderIds: ["p3", "p1"],
      leaderId: "p3",
    });
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it.each([
    ["zero", "var(0)", "tag"],
    ["negative", "var(0) - 1", "tag"],
    ["opposing", "var(0) + 2", "tag"],
    ["missing", "var(0) + 5", "tag"],
    ["non-Tag mode", "var(0) + 3", "single"],
  ] as const)("rolls back %s dynamic TagIn leader", (_case, leaderExpression, teamMode) => {
    const leaderTagIn = createImportedFixture({
      id: `blocked-dynamic-leader-${_case}`,
      displayName: "Blocked Dynamic Leader Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagStateNo: 200,
      passiveTagControl: 0,
      passiveTagLeader: leaderExpression,
    });
    const runtime = new PlayableMatchRuntime(leaderTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode,
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.tagTeamOrder?.sides[0]?.memberOrderIds).toEqual(teamMode === "tag" ? ["p1", "p3"] : undefined);
    expect(snapshot.tagTeamOrder?.sides[0]?.leaderId).toBe(teamMode === "tag" ? "p1" : undefined);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBeUndefined();
  });

  it("resolves dynamic Tag self from changing caller variables", () => {
    const dynamicSelfTagOut = createImportedFixture({
      id: "dynamic-self-tag-out",
      displayName: "Dynamic Self Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagSelf: "var(0)",
      passiveVarSet: { trigger: "1", index: 0, value: 1 },
    });
    const runtime = new PlayableMatchRuntime(dynamicSelfTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const falseSnapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(falseSnapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(falseSnapshot.actors[0]?.runtime.vars[0]).toBe(1);
    expect(falseSnapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(1);

    const trueSnapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(trueSnapshot.actors[0]?.runtime.teamState?.standby).toBe(true);
    expect(trueSnapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(2);
  });

  it("resolves dynamic TagIn caller control after state entry", () => {
    const dynamicControlTagIn = createImportedFixture({
      id: "dynamic-control-tag-in",
      displayName: "Dynamic Control Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagStateNo: 200,
      passiveTagControl: "var(0) + 1",
      extraStateNos: [200],
    });
    const runtime = new PlayableMatchRuntime(dynamicControlTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it("re-evaluates dynamic TagIn caller control after variable mutation", () => {
    const dynamicControlTagIn = createImportedFixture({
      id: "changing-dynamic-control-tag-in",
      displayName: "Changing Dynamic Control Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagControl: "var(0)",
      passiveVarSet: { trigger: "1", index: 0, value: 1 },
    });
    const runtime = new PlayableMatchRuntime(dynamicControlTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const falseSnapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(falseSnapshot.actors[0]?.runtime.ctrl).toBe(false);
    expect(falseSnapshot.actors[0]?.runtime.vars[0]).toBe(1);

    const trueSnapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(trueSnapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(trueSnapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(2);
  });

  it.each([
    ["opposing", 2],
    ["missing", 5],
  ])("blocks %s TagIn leader before existing Tag mutations", (_case, leaderPlayerNo) => {
    const leaderTagIn = createImportedFixture({
      id: `invalid-leader-${leaderPlayerNo}`,
      displayName: "Invalid Leader Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagLeader: leaderPlayerNo,
    });
    const runtime = new PlayableMatchRuntime(leaderTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.tagTeamOrder?.sides[0]?.memberOrderIds).toEqual(["p1", "p3"]);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain(`Blocked tagin leader ${leaderPlayerNo} for p1`);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBeUndefined();
  });

  it("refreshes P2 selection for later roots after same-tick self TagOut", () => {
    const tagOutP1 = createImportedFixture({
      id: "tag-out-p1",
      displayName: "Tagged Out P1",
      withStateMove: false,
      passiveTagController: "TagOut",
    });
    const nextSideOne = createImportedFixture({
      id: "next-side-one",
      displayName: "Next Side One",
      withStateMove: false,
      passiveTagController: "TagIn",
    });
    const observingSideTwo = createImportedFixture({
      id: "observing-side-two",
      displayName: "Observing Side Two",
      withStateMove: false,
      passiveVarSet: { trigger: 'P2Name = "Next Side One"', index: 0, value: 73 },
    });
    const runtime = new PlayableMatchRuntime(tagOutP1, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [nextSideOne, observingSideTwo],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(true);
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p4")?.runtime.vars[0]).toBe(73);
    expect(snapshot.compatibilitySession?.actors.find((actor) => actor.actorId === "p1")?.executedOperations["team-standby:tagout"]).toBe(1);
  });

  it("blocks typed TagOut execution outside the explicit IKEMEN profile", () => {
    const tagOutP1 = createImportedFixture({
      id: "legacy-tag-out",
      displayName: "Legacy Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
    });
    const runtime = new PlayableMatchRuntime(tagOutP1, demoFighters[1]!);

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout for p1 outside ikemen-go profile");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("executes static partner-only TagIn without changing the caller", () => {
    const partnerTagIn = createImportedFixture({
      id: "partner-tag-in",
      displayName: "Partner Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
    });
    const runtime = new PlayableMatchRuntime(partnerTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p4")?.runtime.teamState?.standby).toBe(true);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it("selects a dynamic TagIn partner and validates that partner's own state", () => {
    const selectedPartner = createImportedFixture({
      id: "dynamic-selected-partner",
      displayName: "Dynamic Selected Partner",
      withStateMove: false,
      extraStateNos: [201],
    });
    const partnerTagIn = createImportedFixture({
      id: "dynamic-partner-tag-in",
      displayName: "Dynamic Partner Tag In",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 1 },
      passiveTagController: "TagIn",
      passiveTagPartner: "var(0) + 0.9",
      passiveTagPartnerStateNo: 201,
      passiveTagPartnerControl: 1,
    });
    const runtime = new PlayableMatchRuntime(partnerTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!, selectedPartner, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const firstPartner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    const selected = snapshot.reserveActors?.find((actor) => actor.id === "p5");
    expect(snapshot.actors[0]?.runtime.vars[0]).toBe(1);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(firstPartner?.runtime.teamState?.standby).toBe(true);
    expect(selected?.runtime.teamState?.standby).toBe(false);
    expect(selected?.runtime.stateNo).toBe(201);
    expect(selected?.runtime.ctrl).toBe(true);
    expect(selected?.runtime.customState).toBeUndefined();
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it("selects a dynamic TagOut partner without defaulting omitted self", () => {
    const selectedPartner = createImportedFixture({
      id: "dynamic-tagout-selected-partner",
      displayName: "Dynamic TagOut Selected Partner",
      withStateMove: false,
      extraStateNos: [201],
    });
    const partnerTagOut = createImportedFixture({
      id: "dynamic-partner-tag-out",
      displayName: "Dynamic Partner Tag Out",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 1 },
      passiveTagController: "TagOut",
      passiveTagPartner: "var(0)",
      passiveTagPartnerStateNo: 201,
    });
    const runtime = new PlayableMatchRuntime(partnerTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!, selectedPartner, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const selected = snapshot.reserveActors?.find((actor) => actor.id === "p5");
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.stateNo).toBe(0);
    expect(selected?.runtime.teamState?.standby).toBe(true);
    expect(selected?.runtime.stateNo).toBe(201);
    expect(selected?.runtime.customState).toBeUndefined();
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(1);
  });

  it("rejects a negative dynamic Tag partner before mutating explicit self", () => {
    const partnerTagOut = createImportedFixture({
      id: "negative-dynamic-partner-tag-out",
      displayName: "Negative Dynamic Partner Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagSelf: 1,
      passiveTagPartner: "var(0) - 1",
    });
    const runtime = new PlayableMatchRuntime(partnerTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.teamState?.standby).toBe(true);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("rolls back explicit self when a dynamic Tag partner target is missing", () => {
    const partnerTagOut = createImportedFixture({
      id: "missing-dynamic-partner-tag-out",
      displayName: "Missing Dynamic Partner Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagSelf: 1,
      passiveTagPartner: "var(0)",
    });
    const runtime = new PlayableMatchRuntime(partnerTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout partner 0 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("rolls back a dynamic partner target when its requested state is unavailable", () => {
    const partnerTagIn = createImportedFixture({
      id: "unavailable-state-dynamic-partner-tag-in",
      displayName: "Unavailable State Dynamic Partner Tag In",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 1 },
      passiveTagController: "TagIn",
      passiveTagSelf: 1,
      passiveTagPartner: "var(0)",
      passiveTagPartnerStateNo: 9999,
    });
    const runtime = new PlayableMatchRuntime(partnerTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!, demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const selected = snapshot.reserveActors?.find((actor) => actor.id === "p5");
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(selected?.runtime.teamState?.standby).toBe(true);
    expect(selected?.runtime.stateNo).toBe(0);
    expect(snapshot.logs).toContain("Blocked tagin partner state 9999 for p5");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBeUndefined();
  });

  it("fails closed when static Tag partner has no same-side root", () => {
    const partnerTagOut = createImportedFixture({
      id: "missing-partner-tag-out",
      displayName: "Missing Partner Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagPartner: 0,
    });
    const runtime = new PlayableMatchRuntime(partnerTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout partner 0 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("applies static Tag self and partner changes atomically", () => {
    const combinedTagIn = createImportedFixture({
      id: "combined-tag-in",
      displayName: "Combined Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagSelf: 1,
      passiveTagPartner: 0,
    });
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [combinedTagIn, demoFighters[1]!, demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p5")?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).not.toContain(expect.stringContaining("Blocked tagin partner"));
  });

  it("rolls back static Tag self when partner selection fails", () => {
    const combinedTagOut = createImportedFixture({
      id: "atomic-tag-out",
      displayName: "Atomic Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagSelf: 1,
      passiveTagPartner: 0,
    });
    const runtime = new PlayableMatchRuntime(combinedTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout partner 0 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("records static self zero without mutating a root", () => {
    const noOpTagOut = createImportedFixture({
      id: "no-op-tag-out",
      displayName: "No-op Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagSelf: 0,
    });
    const runtime = new PlayableMatchRuntime(noOpTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(1);
  });

  it("deduplicates static self when partner selection wraps to the caller", () => {
    const wrappedTagIn = createImportedFixture({
      id: "wrapped-tag-in",
      displayName: "Wrapped Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagSelf: 1,
      passiveTagPartner: 1,
    });
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [wrappedTagIn, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).not.toContain(expect.stringContaining("Blocked tagin partner"));
  });

  it("enters a static caller-owned Tag state before applying standby", () => {
    const stateTagOut = createImportedFixture({
      id: "state-tag-out",
      displayName: "State Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagStateNo: 200,
    });
    const runtime = new PlayableMatchRuntime(stateTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(true);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(1);
  });

  it("applies static Tag caller state when self is zero without changing standby", () => {
    const stateOnlyTagOut = createImportedFixture({
      id: "state-only-tag-out",
      displayName: "State-only Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagSelf: 0,
      passiveTagStateNo: 200,
    });
    const runtime = new PlayableMatchRuntime(stateOnlyTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(1);
  });

  it("fails closed before Tag standby when caller state is unavailable", () => {
    const missingStateTagOut = createImportedFixture({
      id: "missing-state-tag-out",
      displayName: "Missing State Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagStateNo: 9999,
    });
    const runtime = new PlayableMatchRuntime(missingStateTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout state 9999 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("enters a static partner-owned Tag state after partner standby", () => {
    const partnerStateTagIn = createImportedFixture({
      id: "partner-state-tag-in",
      displayName: "Partner State Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagPartnerStateNo: 200,
    });
    const runtime = new PlayableMatchRuntime(partnerStateTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const partner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    expect(partner?.runtime.teamState?.standby).toBe(false);
    expect(partner?.runtime.stateNo).toBe(200);
    expect(partner?.runtime.customState).toBeUndefined();
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(1);
  });

  it("selects dynamic partner-owned Tag state from a same-tick caller variable", () => {
    const partnerStateTagIn = createImportedFixture({
      id: "dynamic-partner-state-tag-in",
      displayName: "Dynamic Partner State Tag In",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 200 },
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagPartnerStateNo: "var(0)",
      passiveTagPartnerControl: 1,
    });
    const runtime = new PlayableMatchRuntime(partnerStateTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const partner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    expect(snapshot.actors[0]?.runtime.vars[0]).toBe(200);
    expect(partner?.runtime.teamState?.standby).toBe(false);
    expect(partner?.runtime.stateNo).toBe(200);
    expect(partner?.runtime.ctrl).toBe(true);
    expect(partner?.runtime.customState).toBeUndefined();
  });

  it("selects dynamic partner-owned state for TagOut without changing state ownership", () => {
    const partnerStateTagOut = createImportedFixture({
      id: "dynamic-partner-state-tag-out",
      displayName: "Dynamic Partner State Tag Out",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 200 },
      passiveTagController: "TagOut",
      passiveTagPartner: 0,
      passiveTagPartnerStateNo: "var(0)",
    });
    const runtime = new PlayableMatchRuntime(partnerStateTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const partner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    expect(partner?.runtime.teamState?.standby).toBe(true);
    expect(partner?.runtime.stateNo).toBe(200);
    expect(partner?.runtime.customState).toBeUndefined();
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBe(1);
  });

  it("fails closed before partner standby when partner state is unavailable", () => {
    const missingPartnerStateTagIn = createImportedFixture({
      id: "missing-partner-state-tag-in",
      displayName: "Missing Partner State Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagPartnerStateNo: 9999,
    });
    const runtime = new PlayableMatchRuntime(missingPartnerStateTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const partner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    expect(partner?.runtime.teamState?.standby).toBe(true);
    expect(partner?.runtime.stateNo).toBe(0);
    expect(snapshot.logs).toContain("Blocked tagin partner state 9999 for p3");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBeUndefined();
  });

  it.each([
    ["negative", "var(0) - 1", true],
    ["unavailable", "var(0) + 9999", true],
    ["missing partner", "var(0) + 200", false],
  ])("blocks %s dynamic Tag partner state before every mutation", (_case, partnerStateExpression, hasPartner) => {
    const partnerStateTagIn = createImportedFixture({
      id: `blocked-dynamic-partner-state-${_case}`,
      displayName: "Blocked Dynamic Partner State",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagPartnerStateNo: partnerStateExpression,
      passiveTagControl: 0,
      passiveTagPartnerControl: 0,
    });
    const runtime = new PlayableMatchRuntime(partnerStateTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      ...(hasPartner ? { reserveFighters: [demoFighters[0]!, demoFighters[1]!] } : {}),
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const partner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(partner?.runtime.teamState?.standby).toBe(hasPartner ? true : undefined);
    expect(partner?.runtime.stateNo).toBe(hasPartner ? 0 : undefined);
    expect(partner?.runtime.ctrl).toBe(hasPartner ? true : undefined);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBeUndefined();
  });

  it("applies static TagIn caller control after caller state metadata", () => {
    const callerControlTagIn = createImportedFixture({
      id: "caller-control-tag-in",
      displayName: "Caller Control Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagStateNo: 200,
      passiveTagControl: 1,
    });
    const runtime = new PlayableMatchRuntime(callerControlTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
  });

  it("selects dynamic Tag caller state from a same-tick variable and then applies control", () => {
    const dynamicStateTagIn = createImportedFixture({
      id: "dynamic-state-tag-in",
      displayName: "Dynamic State Tag In",
      withStateMove: false,
      passivePreTagVarSet: { trigger: "1", index: 0, value: 201 },
      passiveTagController: "TagIn",
      passiveTagStateNo: "var(0)",
      passiveTagControl: 1,
      extraStateNos: [201],
    });
    const runtime = new PlayableMatchRuntime(dynamicStateTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.vars[0]).toBe(201);
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(201);
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
  });

  it("blocks unavailable dynamic Tag caller state before every mutation", () => {
    const unavailableStateTagOut = createImportedFixture({
      id: "unavailable-dynamic-state-tag-out",
      displayName: "Unavailable Dynamic State Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagStateNo: "var(0) + 9999",
    });
    const runtime = new PlayableMatchRuntime(unavailableStateTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagout state 9999 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("blocks negative dynamic Tag caller state before every mutation", () => {
    const negativeStateTagOut = createImportedFixture({
      id: "negative-dynamic-state-tag-out",
      displayName: "Negative Dynamic State Tag Out",
      withStateMove: false,
      passiveTagController: "TagOut",
      passiveTagStateNo: "var(0) - 1",
    });
    const runtime = new PlayableMatchRuntime(negativeStateTagOut, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagout"]).toBeUndefined();
  });

  it("applies static TagIn partner control after partner state metadata", () => {
    const partnerControlTagIn = createImportedFixture({
      id: "partner-control-tag-in",
      displayName: "Partner Control Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagPartnerStateNo: 200,
      passiveTagPartnerControl: 1,
    });
    const runtime = new PlayableMatchRuntime(partnerControlTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const partner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    expect(partner?.runtime.stateNo).toBe(200);
    expect(partner?.runtime.ctrl).toBe(true);
    expect(partner?.runtime.teamState?.standby).toBe(false);
  });

  it("applies dynamic TagIn partner control after partner state metadata", () => {
    const partnerControlTagIn = createImportedFixture({
      id: "dynamic-partner-control-tag-in",
      displayName: "Dynamic Partner Control Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagPartnerStateNo: 200,
      passiveTagPartnerControl: "var(0) + 1",
    });
    const runtime = new PlayableMatchRuntime(partnerControlTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const partner = snapshot.reserveActors?.find((actor) => actor.id === "p3");
    expect(partner?.runtime.stateNo).toBe(200);
    expect(partner?.runtime.ctrl).toBe(true);
    expect(partner?.runtime.teamState?.standby).toBe(false);
  });

  it("re-evaluates dynamic TagIn partner control after caller variable mutation", () => {
    const partnerControlTagIn = createImportedFixture({
      id: "changing-dynamic-partner-control-tag-in",
      displayName: "Changing Dynamic Partner Control Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagPartnerControl: "var(0)",
      passiveVarSet: { trigger: "1", index: 0, value: 1 },
    });
    const runtime = new PlayableMatchRuntime(partnerControlTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!, demoFighters[1]!],
    });

    const falseSnapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(falseSnapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.ctrl).toBe(false);
    expect(falseSnapshot.actors[0]?.runtime.vars[0]).toBe(1);

    const trueSnapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(trueSnapshot.reserveActors?.find((actor) => actor.id === "p3")?.runtime.ctrl).toBe(true);
    expect(trueSnapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBe(2);
  });

  it("validates TagIn partner before mutating caller control", () => {
    const atomicControlTagIn = createImportedFixture({
      id: "atomic-control-tag-in",
      displayName: "Atomic Control Tag In",
      withStateMove: false,
      passiveTagController: "TagIn",
      passiveTagPartner: 0,
      passiveTagControl: 0,
      passiveTagPartnerControl: "var(0) + 1",
    });
    const runtime = new PlayableMatchRuntime(atomicControlTagIn, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(false);
    expect(snapshot.logs).toContain("Blocked tagin partner 0 for p1");
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["team-standby:tagin"]).toBeUndefined();
  });

  it("exposes the exact active match phase order with an owner for every phase", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!);
    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });

    expect(snapshot.tickSchedule?.branch).toBe("active");
    expect(snapshot.tickSchedule?.phases.map((phase) => phase.id)).toEqual([
      "tick:stamp-input",
      "frame:start",
      "branch:hitpause-advance",
      "branch:pause-check",
      "active:round-timer",
      "active:command-buffer",
      "active:input-control",
      "active:fighter-advance",
      "fighter:auto-guard-check:pre",
      "fighter:auto-guard-check:pre",
      "fighter:kinematics",
      "fighter:animation",
      "fighter:controllers",
      "fighter:auto-guard-check:post",
      "fighter:kinematics",
      "fighter:animation",
      "fighter:controllers",
      "fighter:auto-guard-check:post",
      "active:post-fighter",
      "tick:guard-distance-latch",
      "tick:guard-distance-latch",
      "post-fighter:combat",
      "post-fighter:presentation-effects",
      "active:round-finish",
      "tick:restore-superpause-defense",
    ]);
    expect(snapshot.tickSchedule?.phases.every((phase) => phase.owner.length > 0)).toBe(true);
    expect(snapshot.tickSchedule?.phases.filter((phase) => phase.id.startsWith("fighter:")).map((phase) => phase.actorId)).toEqual([
      "p1",
      "p2",
      "p1",
      "p1",
      "p1",
      "p1",
      "p2",
      "p2",
      "p2",
      "p2",
    ]);
    expect(snapshot.tickSchedule?.architectureComparison.status).toBe("known-divergence");
    expect(snapshot.tickSchedule?.snapshotPhases.map(({ id, owner }) => ({ id, owner }))).toEqual([
      { id: "snapshot:presentation", owner: "RuntimeMatchPresentationSnapshotWorld" },
      { id: "snapshot:materialize", owner: "RuntimeSnapshotWorld" },
    ]);
  });

  it("orders IKEMEN root prepare and run phases by previous-tick MoveType priority", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
    });
    runtime.step({ p1: new Set(), p2: new Set(["x"]) });
    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const fighterPhases = snapshot.tickSchedule?.phases.filter((phase) => phase.id.startsWith("fighter:")) ?? [];

    expect(snapshot.actors.map(({ runtime: actorRuntime }) => actorRuntime.moveType)).toEqual(["I", "A"]);
    expect(fighterPhases.filter((phase) => phase.id === "fighter:auto-guard-check:pre").map((phase) => phase.actorId)).toEqual([
      "p2",
      "p1",
    ]);
    expect(fighterPhases.filter((phase) => phase.id === "fighter:controllers").map((phase) => phase.actorId)).toEqual(["p2", "p1"]);
    expect(fighterPhases.filter((phase) => phase.id === "fighter:auto-guard-check:post").map((phase) => phase.actorId)).toEqual([
      "p2",
      "p1",
    ]);
  });

  it("applies previous-tick IKEMEN AssertSpecial RunFirst before attacking MoveType priority", () => {
    const runFirst = createImportedFixture({
      id: "runfirst-root",
      displayName: "RunFirst Root",
      passiveAssertSpecialFlags: ["RunFirst"],
      passiveAssertSpecialTrigger: "GameTime = 1",
    });
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, runFirst, trainingStage, {
      runtimeProfile: "ikemen-go",
    });

    runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const controllerOrder = snapshot.tickSchedule?.phases
      .filter((phase) => phase.id === "fighter:controllers")
      .map((phase) => phase.actorId);

    expect(snapshot.actors[0]?.runtime.moveType).toBe("A");
    expect(snapshot.actors[1]?.runtime.assertSpecial?.runFirst).toBeUndefined();
    expect(controllerOrder).toEqual(["p2", "p1"]);
  });

  it("preserves configured round timer fixtures across reset", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, { roundTimerFrames: 1 });

    let snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.round).toMatchObject({
      state: "timeover",
      timer: 0,
      winner: "Draw",
      message: "Time over - draw",
    });
    expect(snapshot.playing).toBe(false);

    runtime.dispatch({ type: "reset" });
    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.round).toMatchObject({
      state: "timeover",
      timer: 0,
      winner: "Draw",
      message: "Time over - draw",
    });
  });

  it("keeps the match paused during normal loop steps but supports forced frame stepping", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!);
    const paused = runtime.dispatch({ type: "set-playing", playing: false });

    const loopSnapshot = runtime.step({ p1: new Set(["F"]) });
    expect(loopSnapshot.tick).toBe(paused.tick);
    expect(loopSnapshot.actors[0]?.runtime.pos.x).toBe(paused.actors[0]?.runtime.pos.x);

    const frameStep = runtime.step({ p1: new Set(["F"]) }, { force: true });
    expect(frameStep.tick).toBe(paused.tick + 1);
    expect(frameStep.playing).toBe(false);
    expect(frameStep.actors[0]?.runtime.pos.x).toBeGreaterThan(paused.actors[0]!.runtime.pos.x);
  });

  it("routes local movement inputs to crouch, jump, and slow walk states", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!);

    const crouch = runtime.step({ p1: new Set(["D"]), p2: new Set() });
    expect(crouch.actors[0]?.runtime.stateNo).toBe(10);
    expect(crouch.actors[0]?.runtime.animNo).toBe(10);
    expect(crouch.actors[0]?.runtime.stateType).toBe("C");

    runtime.dispatch({ type: "reset" });
    const jump = runtime.step({ p1: new Set(["U"]), p2: new Set() });
    expect(jump.actors[0]?.runtime.stateNo).toBe(40);
    expect(jump.actors[0]?.runtime.animNo).toBe(40);
    expect(jump.actors[0]?.runtime.stateType).toBe("A");

    runtime.dispatch({ type: "reset" });
    const walk = runtime.step({ p1: new Set(["F"]), p2: new Set() });
    expect(walk.actors[0]?.runtime.stateNo).toBe(20);
    expect(walk.actors[0]?.runtime.animNo).toBe(20);
    expect(walk.actors[0]?.runtime.vel.x).toBeCloseTo(1.08);
  });

  it("keeps airborne movement inputs from collapsing into the walk state", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!);

    runtime.step({ p1: new Set(["U"]), p2: new Set() });
    const airBack = runtime.step({ p1: new Set(["B"]), p2: new Set() });

    expect(airBack.actors[0]?.runtime.stateNo).toBe(40);
    expect(airBack.actors[0]?.runtime.animNo).toBe(40);
    expect(airBack.actors[0]?.runtime.stateType).toBe("A");
    expect(airBack.actors[0]?.runtime.physics).toBe("A");
    expect(airBack.actors[0]?.runtime.vel.x).toBeCloseTo(-1.08);
  });

  it("lets P1 close distance and damage the opponent with a basic attack", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!);
    let snapshot = runtime.getSnapshot();

    for (let frame = 0; frame < 45; frame += 1) {
      snapshot = runtime.step({ p1: new Set(["F"]) });
    }

    const lifeBefore = snapshot.actors[1]!.runtime.life;
    for (let frame = 0; frame < 24; frame += 1) {
      snapshot = runtime.step({ p1: new Set(["a"]) });
    }

    expect(snapshot.actors[1]!.runtime.life).toBeLessThan(lifeBefore);
    expect(snapshot.logs.some((line) => line.includes("hit"))).toBe(true);
    expect(snapshot.actors[0]?.hitEffectEvents?.[0]).toMatchObject({
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7002,
      raw: "S7002",
      offset: { x: 48, y: -44 },
      assetFrame: {
        source: "player",
        actionId: 7002,
        frameIndex: 0,
        spriteGroup: 7002,
        spriteIndex: 0,
      },
    });
  });

  it("uses imported CMD State -1 entries to enter CNS attack states", () => {
    const imported = createImportedFixture();
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    const snapshot = runtime.step({ p1: new Set(["x"]) });

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[0]?.runtime.animNo).toBe(200);
    expect(snapshot.actors[0]?.runtime.moveType).toBe("A");
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toEqual([200]);
    expect(snapshot.compatibilitySession?.actors[0]?.routedStateEntries).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.routedStates).toEqual([200]);
    expect(snapshot.compatibilitySession?.actors[0]?.lastRoutedState).toEqual({
      stateId: 200,
      name: "Stand Light Punch",
    });
    expect(snapshot.compatibilitySession?.actors[0]?.activeCommands).toContain("x");
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeState).toBe(1);
  });

  it("executes simple imported CNS state controllers during active states", () => {
    const imported = createImportedFixture();
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    let snapshot = runtime.step({ p1: new Set(["x"]) });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);

    for (let frame = 0; frame < 6; frame += 1) {
      snapshot = runtime.step({ p1: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[0]?.runtime.ctrl).toBe(true);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toEqual([0, 200]);
    expect(snapshot.compatibilitySession?.actors[0]?.lastExecutedState).toBe(0);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
  });

  it("runs State -1 setup controllers before command state routing", () => {
    const imported = createImportedFixture();
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    let snapshot = runtime.step({ p1: new Set(["D"]) });
    snapshot = runtime.step({ p1: new Set(["D", "F", "DF"]) });
    snapshot = runtime.step({ p1: new Set(["F"]) });
    snapshot = runtime.step({ p1: new Set(["x"]) });

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(1000);
    expect(snapshot.actors[0]?.runtime.vars[1]).toBe(1);
  });

  it("executes imported HitDef controllers as active runtime attacks", () => {
    const imported = createImportedFixture({ withStateMove: false, hitDefDamage: 37 });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]) });

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[1]?.runtime.life).toBe(963);
    expect(snapshot.actors[1]?.runtime.hitVelocity).toEqual({ x: 4, y: 0 });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.HitDef).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 37"))).toBe(true);
  });

  it("resolves package-backed common and FightFX HitDef spark refs on imported attacks", () => {
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const common = createImportedFixture({
      withStateMove: false,
      hitSpark: "7001",
      hitSparkLibraries: {
        common: { source: "common", animations: new Map([[7001, action(7001, { durations: [3, 5] }, 7200)]]) },
      },
    });
    const fightFx = createImportedFixture({
      withStateMove: false,
      hitSpark: "F7002",
      hitSparkLibraries: {
        fightfx: { source: "fightfx", animations: new Map([[7002, action(7002, {}, 8300)]]) },
      },
    });

    const commonSnapshot = new PlayableMatchRuntime(common, demoFighters[1]!, closeStage).step({ p1: new Set(["x"]) });
    const fightFxSnapshot = new PlayableMatchRuntime(fightFx, demoFighters[1]!, closeStage).step({ p1: new Set(["x"]) });

    expect(commonSnapshot.actors[0]?.hitEffectEvents?.[0]).toMatchObject({
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7001,
      raw: "7001",
      offset: { x: 10, y: -72 },
      assetFrame: {
        source: "common",
        actionId: 7001,
        frameIndex: 0,
        spriteGroup: 14201,
        spriteIndex: 0,
      },
      assetFrames: [
        {
          source: "common",
          actionId: 7001,
          frameIndex: 0,
          spriteGroup: 14201,
          spriteIndex: 0,
        },
        {
          source: "common",
          actionId: 7001,
          frameIndex: 1,
          spriteGroup: 14201,
          spriteIndex: 1,
        },
      ],
    });
    expect(fightFxSnapshot.actors[0]?.hitEffectEvents?.[0]).toMatchObject({
      type: "HitSpark",
      kind: "hit",
      sparkNo: 7002,
      raw: "F7002",
      rawPrefix: "F",
      offset: { x: 10, y: -72 },
      assetFrame: {
        source: "fightfx",
        actionId: 7002,
        frameIndex: 0,
        spriteGroup: 15302,
        spriteIndex: 0,
      },
      assetFrames: [
        {
          source: "fightfx",
          actionId: 7002,
          frameIndex: 0,
          spriteGroup: 15302,
          spriteIndex: 0,
        },
      ],
    });
  });

  it("evaluates bounded MoveHit triggers after direct imported HitDef contact", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      moveHitStateNo: 260,
      multiFrameAction: { id: 200, durations: [30] },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 37"))).toBe(true);

    for (let frame = 0; frame < 10; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(260);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toContain(260);
  });

  it("evaluates bounded MoveHit as a direct-contact frame counter", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      moveHitCounterStateNo: 263,
      multiFrameAction: { id: 200, durations: [30] },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 37"))).toBe(true);

    for (let frame = 0; frame < 10; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(263);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toContain(263);
  });

  it("executes MoveHitReset as bounded direct-contact memory reset", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      withMoveHitReset: true,
      moveHitCounterStateNo: 263,
      multiFrameAction: { id: 200, durations: [30] },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 37"))).toBe(true);

    for (let frame = 0; frame < 10; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.MoveHitReset).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).not.toContain(263);
  });

  it("evaluates bounded HitCount and UniqHitCount after direct imported HitDef contact", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      hitCountStateNo: 264,
      multiFrameAction: { id: 200, durations: [30] },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 37"))).toBe(true);

    for (let frame = 0; frame < 10; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(264);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toContain(264);
  });

  it("evaluates bounded HitDefAttr triggers against the current imported HitDef attr", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      hitDefAttr: "S,NA",
      hitDefAttrStateNo: 261,
      multiFrameAction: { id: 200, durations: [30] },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 37"))).toBe(true);

    for (let frame = 0; frame < 10; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(261);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toContain(261);
  });

  it("tracks PrevStateNo for imported state trigger routing", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      withPrevStateBranch: { intermediateStateNo: 267, finalStateNo: 268 },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(267);
    expect(snapshot.actors[0]?.runtime.prevStateNo).toBe(200);

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(268);
    expect(snapshot.actors[0]?.runtime.prevStateNo).toBe(267);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toEqual(expect.arrayContaining([200, 267, 268]));
  });

  it("tracks PrevMoveType for imported state trigger routing", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      withPrevMoveTypeBranch: { intermediateStateNo: 269, finalStateNo: 270 },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(269);
    expect(snapshot.actors[0]?.runtime.prevMoveType).toBe("A");

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(270);
    expect(snapshot.actors[0]?.runtime.prevMoveType).toBe("I");
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toEqual(expect.arrayContaining([200, 269, 270]));
  });

  it("tracks PrevAnim for imported state trigger routing after ChangeAnim", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      withPrevAnimBranch: { previousAnimNo: 205, intermediateStateNo: 275, finalStateNo: 276 },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(275);
    expect(snapshot.actors[0]?.runtime.prevAnimNo).toBe(205);

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(276);
    expect(snapshot.actors[0]?.runtime.prevAnimNo).toBe(275);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toEqual(expect.arrayContaining([200, 275, 276]));
  });

  it("tracks PrevStateType for imported state trigger routing", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      attackStateType: "A",
      withPrevStateTypeBranch: { intermediateStateNo: 271, finalStateNo: 272 },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(271);
    expect(snapshot.actors[0]?.runtime.prevStateType).toBe("A");

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(272);
    expect(snapshot.actors[0]?.runtime.prevStateType).toBe("S");
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toEqual(expect.arrayContaining([200, 271, 272]));
  });

  it("respects imported HitDef kill = 0 for direct hits", () => {
    const imported = createImportedFixture({ withStateMove: false, hitDefDamage: 2000, hitDefKill: false });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[1]?.runtime.life).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 2000"))).toBe(true);
  });

  it("respects defender AssertSpecial NoKO for imported direct hits", () => {
    const attacker = createImportedFixture({ withStateMove: false, hitDefDamage: 2000 });
    const defender = createImportedFixture({
      id: "noko-defender",
      displayName: "NoKO Defender",
      passiveAssertSpecialFlags: ["NoKO"],
    });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const defenderSession = snapshot.compatibilitySession?.actors.find((actor) => actor.actorId === "p2");

    expect(snapshot.actors[1]?.runtime.life).toBe(1);
    expect(snapshot.actors[1]?.runtime.assertSpecial?.noKo).toBe(true);
    expect(defenderSession?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
  });

  it("routes imported defenders into default Common1 get-hit states when HitDef has no p2stateno", () => {
    const attacker = createImportedFixture({ withStateMove: false, hitDefDamage: 37 });
    const defender = createImportedFixture({ id: "imported-defender", displayName: "Imported Defender", defaultGetHitStateNo: 5000 });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(attacker, defender, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const defenderSession = snapshot.compatibilitySession?.actors.find((actor) => actor.actorId === "p2");

    expect(snapshot.actors[1]?.runtime.stateNo).toBe(5000);
    expect(snapshot.actors[1]?.runtime.animNo).toBe(5000);
    expect(snapshot.actors[1]?.runtime.moveType).toBe("H");
    expect(defenderSession?.executedStates).toContain(5000);
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Imported Defender for 37"))).toBe(true);
  });

  it("stores partial imported HitDef fall data on hit targets", () => {
    const imported = createImportedFixture({ withStateMove: false, hitDefDamage: 37, withFallHitDef: true });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]) });

    expect(snapshot.actors[1]?.runtime.hitFall).toMatchObject({
      falling: true,
      damage: 70,
      defenceUp: 150,
      velocity: { x: 3, y: -6 },
      recover: false,
      recoverTime: 30,
      envShake: { time: 15, freq: 178, ampl: 6, phase: 0 },
    });
  });

  it("auto-enters Common1 get-up state 5120 from lie-down state 5110 after down recovertime", () => {
    const attacker = createImportedFixture({
      withStateMove: false,
      hitDefP2StateNo: 5110,
      hitDefP2GetP1State: false,
      withFallHitDef: true,
      downRecoverTime: 1,
    });
    const defender = createImportedFixture({
      id: "imported-liedown-defender",
      displayName: "Imported Lie Down Defender",
      extraStateNos: [5110, 5120],
    });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(attacker, defender, closeStage);
    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[1]?.runtime.stateNo).toBe(5110);
    for (let frame = 0; frame < 14; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[1]?.runtime.stateNo).toBe(5120);
    expect(snapshot.actors[1]?.runtime.hitFall).toMatchObject({
      downRecoverTime: 0,
    });
    expect(snapshot.compatibilitySession?.actors.find((actor) => actor.actorId === "p2")?.executedStates).toEqual(
      expect.arrayContaining([5110, 5120]),
    );
  });

  it("applies partial HitDef guard behavior when the defender holds back", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      guardDamage: 5,
      guardFlag: "MA",
      guardSlideTime: 5,
      guardControlTime: 7,
    });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set(["B"]) });

    expect(snapshot.actors[1]?.runtime.life).toBe(995);
    expect(snapshot.actors[1]?.runtime.guarding).toBe(true);
    expect(snapshot.actors[1]?.runtime.guardStun).toBe(9);
    expect(snapshot.actors[1]?.runtime.guardSlideTime).toBe(5);
    expect(snapshot.actors[1]?.runtime.guardControlTime).toBe(7);
    expect(snapshot.actors[1]?.runtime.hitVelocity).toEqual({ x: 2, y: 0 });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.HitDef).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("Mira Volt guarded Imported Fixture for 5"))).toBe(true);
  });

  it("respects imported HitDef guard.kill = 0 on guarded hits", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      guardDamage: 2000,
      guardFlag: "MA",
      guardKill: false,
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set(["B"]) });

    expect(snapshot.actors[1]?.runtime.life).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("Mira Volt guarded Imported Fixture for 2000"))).toBe(true);
  });

  it("treats atomic down-back input as a crouch guard direction", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      guardDamage: 5,
      guardFlag: "MA",
    });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set(["DB"]) });

    expect(snapshot.actors[1]?.runtime.life).toBe(995);
    expect(snapshot.actors[1]?.runtime.guarding).toBe(true);
    expect(snapshot.logs.some((line) => line.includes("Mira Volt guarded Imported Fixture for 5"))).toBe(true);
  });

  it("does not guard a HitDef when guardflag does not allow the defender statetype", () => {
    const imported = createImportedFixture({ withStateMove: false, hitDefDamage: 37, guardDamage: 5, guardFlag: "A" });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set(["B"]) });

    expect(snapshot.actors[1]?.runtime.life).toBe(963);
    expect(snapshot.actors[1]?.runtime.guarding).toBe(false);
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 37"))).toBe(true);
  });

  it("uses imported NotHitBy to block matching HitDef attrs without consuming the active attack", () => {
    const attacker = createImportedFixture({ withStateMove: false, hitDefDamage: 37, hitDefAttr: "S,NA" });
    const defender = createImportedFixture({ withStateMove: false, passiveNotHitBy: "SCA" });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(attacker, defender, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[1]?.runtime.life).toBe(1000);
    expect(snapshot.actors[1]?.runtime.hitBy?.slot1).toEqual({ mode: "deny", attr: "SCA", remaining: 3 });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.HitDef).toBe(1);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.NotHitBy).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("hit"))).toBe(false);
  });

  it("uses imported HitBy to reject mismatched attrs and DefenceMulSet to scale accepted damage", () => {
    const blocked = new PlayableMatchRuntime(
      createImportedFixture({ withStateMove: false, hitDefDamage: 37, hitDefAttr: "S,NA" }),
      createImportedFixture({ withStateMove: false, passiveHitBy: "S,NT" }),
      {
        ...trainingStage,
        playerStart: {
          p1: { x: -20, y: 0, facing: 1 as const },
          p2: { x: 35, y: 0, facing: -1 as const },
        },
      },
    );

    const blockedSnapshot = blocked.step({ p1: new Set(["x"]), p2: new Set() });
    expect(blockedSnapshot.actors[1]?.runtime.life).toBe(1000);
    expect(blockedSnapshot.actors[1]?.runtime.hitBy?.slot1).toEqual({ mode: "allow", attr: "S,NT", remaining: 3 });
    expect(blockedSnapshot.compatibilitySession?.actors[1]?.executedControllers.HitBy).toBe(1);

    const scaled = new PlayableMatchRuntime(
      createImportedFixture({ withStateMove: false, hitDefDamage: 37, hitDefAttr: "S,NA" }),
      createImportedFixture({ withStateMove: false, defenseMultiplier: 0.5 }),
      {
        ...trainingStage,
        playerStart: {
          p1: { x: -20, y: 0, facing: 1 as const },
          p2: { x: 35, y: 0, facing: -1 as const },
        },
      },
    );

    const scaledSnapshot = scaled.step({ p1: new Set(["x"]), p2: new Set() });
    expect(scaledSnapshot.actors[1]?.runtime.life).toBe(981);
    expect(scaledSnapshot.actors[1]?.runtime.defenseMultiplier).toBe(0.5);
    expect(scaledSnapshot.compatibilitySession?.actors[1]?.executedControllers.DefenceMulSet).toBe(1);
    expect(scaledSnapshot.compatibilitySession?.actors[1]?.executedOperations["damage-scale:defencemulset"]).toBe(1);
    expect(scaledSnapshot.logs.some((line) => line.includes("Imported Fixture hit Imported Fixture for 19"))).toBe(true);
  });

  it("uses imported CNS Data attack and defence as bounded base damage scale", () => {
    const runtime = new PlayableMatchRuntime(
      createImportedFixture({ withStateMove: false, hitDefDamage: 40, dataAttack: 150 }),
      createImportedFixture({ withStateMove: false, dataDefence: 200 }),
      {
        ...trainingStage,
        playerStart: {
          p1: { x: -20, y: 0, facing: 1 as const },
          p2: { x: 35, y: 0, facing: -1 as const },
        },
      },
    );

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[0]?.runtime.attackMultiplier).toBe(1.5);
    expect(snapshot.actors[1]?.runtime.defenseMultiplier).toBe(0.5);
    expect(snapshot.actors[1]?.runtime.life).toBe(970);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.AttackMulSet ?? 0).toBe(0);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.DefenceMulSet ?? 0).toBe(0);
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Imported Fixture for 30"))).toBe(true);
  });

  it("uses imported HitOverride to redirect matching incoming HitDefs without normal damage", () => {
    const attacker = createImportedFixture({ withStateMove: false, hitDefDamage: 37, hitDefAttr: "S,NA" });
    const defender = createImportedFixture({
      withStateMove: false,
      passiveHitOverride: { attr: "S,NA", stateNo: 777, forceAir: true },
    });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[1]?.runtime.life).toBe(1000);
    expect(snapshot.actors[1]?.runtime.stateNo).toBe(777);
    expect(snapshot.actors[1]?.runtime.stateType).toBe("A");
    expect(snapshot.actors[1]?.runtime.moveType).toBe("H");
    expect(snapshot.actors[1]?.runtime.hitOverrides?.[0]).toMatchObject({ slot: 1, attr: "S,NA", stateNo: 777 });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.HitDef).toBe(1);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.HitOverride).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("HitOverride slot 1"))).toBe(true);
  });

  it("uses imported ReversalDef to counter matching incoming HitDefs through Clsn1 contact", () => {
    const attacker = createImportedFixture({ withStateMove: false, hitDefDamage: 37, hitDefAttr: "S,NA" });
    const defender = createImportedFixture({
      withStateMove: false,
      passiveReversalDef: { attr: "SA,AA", p1StateNo: 777, hitPause: 3 },
    });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[1]?.runtime.life).toBe(1000);
    expect(snapshot.actors[1]?.runtime.stateNo).toBe(777);
    expect(snapshot.actors[1]?.runtime.power).toBe(25);
    expect(snapshot.actors[0]?.runtime.moveType).toBe("H");
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.HitDef).toBe(1);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.ReversalDef).toBe(1);
    expect(snapshot.compatibilitySession?.actors[1]?.executedOperations.reversaldef).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("reversed"))).toBe(true);
  });

  it("evaluates bounded MoveReversed after imported ReversalDef counter contact", () => {
    const attacker = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      hitDefAttr: "S,NA",
      moveReversedStateNo: 778,
      multiFrameAction: { id: 200, durations: [30] },
    });
    const defender = createImportedFixture({
      withStateMove: false,
      passiveReversalDef: { attr: "SA,AA", p1StateNo: 777, hitPause: 3 },
    });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.logs.some((line) => line.includes("reversed"))).toBe(true);

    for (let frame = 0; frame < 8; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(778);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toContain(778);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.ReversalDef).toBe(1);
  });

  it("uses simple HitDef p1stateno and p2stateno as a partial custom-state bridge", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      hitDefP1StateNo: 777,
      hitDefP2StateNo: 888,
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(777);
    expect(snapshot.actors[0]?.runtime.animNo).toBe(777);
    expect(snapshot.actors[1]?.runtime.life).toBe(963);
    expect(snapshot.actors[1]?.runtime.stateNo).toBe(888);
    expect(snapshot.actors[1]?.runtime.animNo).toBe(888);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("state-owner");
    expect(snapshot.actors[1]?.runtime.customState).toEqual({ ownerId: "p1", stateNo: 888, getP1State: true });
    expect(snapshot.actors[1]?.frame?.spriteGroup).toBe(888);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.HitDef).toBe(1);
  });

  it("uses the target's own state data when HitDef p2getp1state is 0", () => {
    const attacker = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      hitDefP2StateNo: 888,
      hitDefP2GetP1State: false,
    });
    const defender = createImportedFixture({ withStateMove: false, extraStateNos: [888] });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[1]?.runtime.life).toBe(963);
    expect(snapshot.actors[1]?.runtime.stateNo).toBe(888);
    expect(snapshot.actors[1]?.runtime.animNo).toBe(888);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("self");
    expect(snapshot.actors[1]?.runtime.customState).toBeUndefined();
    expect(snapshot.actors[1]?.frame?.spriteGroup).toBe(888);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.HitDef).toBe(1);
    expect(snapshot.compatibilitySession?.actors[1]?.executedStates).toContain(888);
  });

  it("lets SelfState return a target from an attacker-owned custom state", () => {
    const attacker = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      hitDefP2StateNo: 888,
      hitDefP2SelfStateAfter: 1,
    });
    const defender = createImportedFixture({ withStateMove: false });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[1]?.runtime.stateNo).toBe(888);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("state-owner");
    expect(snapshot.actors[1]?.runtime.customState).toEqual({ ownerId: "p1", stateNo: 888, getP1State: true });

    for (let frame = 0; frame < 20 && snapshot.actors[1]?.runtime.stateNo !== 0; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[1]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[1]?.runtime.animNo).toBe(0);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("self");
    expect(snapshot.actors[1]?.runtime.customState).toBeUndefined();
    expect(snapshot.actors[1]?.runtime.ctrl).toBe(true);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.SelfState).toBe(1);
  });

  it("keeps attacker-owned state data when a custom state chains through ChangeState", () => {
    const attacker = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 37,
      hitDefP2StateNo: 888,
      hitDefP2ChangeStateTo: 889,
      hitDefP2ChangeStateAfter: 1,
      hitDefP2SelfStateAfter: 1,
    });
    const defender = createImportedFixture({ withStateMove: false });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[1]?.runtime.stateNo).toBe(888);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("state-owner");
    expect(snapshot.actors[1]?.runtime.customState).toEqual({ ownerId: "p1", stateNo: 888, getP1State: true });

    for (let frame = 0; frame < 20 && snapshot.actors[1]?.runtime.stateNo !== 889; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[1]?.runtime.stateNo).toBe(889);
    expect(snapshot.actors[1]?.runtime.animNo).toBe(889);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("state-owner");
    expect(snapshot.actors[1]?.runtime.customState).toEqual({ ownerId: "p1", stateNo: 889, getP1State: true });
    expect(snapshot.actors[1]?.frame?.spriteGroup).toBe(889);

    for (let frame = 0; frame < 20 && snapshot.actors[1]?.runtime.stateNo !== 0; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[1]?.runtime.stateNo).toBe(0);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("self");
    expect(snapshot.actors[1]?.runtime.customState).toBeUndefined();
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.ChangeState).toBe(1);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.SelfState).toBe(1);
  });

  it("uses the state owner's AIR data for ChangeAnim2 inside an attacker-owned custom state", () => {
    const attacker = createImportedFixture({
      id: "attacker-fixture",
      displayName: "Attacker Fixture",
      withStateMove: false,
      hitDefDamage: 37,
      hitDefP2StateNo: 888,
      hitDefP2ChangeAnim2To: 920,
      hitDefP2ChangeAnim2After: 1,
      actionGroupOffset: 10000,
    });
    const defender = createImportedFixture({
      id: "defender-fixture",
      displayName: "Defender Fixture",
      withStateMove: false,
      actionGroupOffset: 20000,
    });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 20 && snapshot.actors[1]?.runtime.animNo !== 920; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[1]?.runtime.stateNo).toBe(888);
    expect(snapshot.actors[1]?.runtime.animNo).toBe(920);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("state-owner");
    expect(snapshot.actors[1]?.runtime.customState).toEqual({ ownerId: "p1", stateNo: 888, getP1State: true });
    expect(snapshot.actors[1]?.spriteOwnerId).toBe("p1");
    expect(snapshot.actors[1]?.spriteOwnerDefinitionId).toBe("attacker-fixture");
    expect(snapshot.actors[1]?.frame?.spriteGroup).toBe(10920);
    expect(snapshot.compatibilitySession?.actors[1]?.executedControllers.ChangeAnim2).toBe(1);
  });

  it("uses imported AttackMulSet to scale outgoing HitDef damage", () => {
    const imported = createImportedFixture({ withStateMove: false, hitDefDamage: 40, attackMultiplier: 1.5 });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[0]?.runtime.attackMultiplier).toBe(1.5);
    expect(snapshot.actors[1]?.runtime.life).toBe(940);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.AttackMulSet).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["damage-scale:attackmulset"]).toBe(1);
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture hit Mira Volt for 60"))).toBe(true);
  });

  it("uses bounded imported HitDef priority to suppress a lower-priority direct attack", () => {
    const highPriority = createImportedFixture({
      id: "high-priority-fixture",
      displayName: "High Priority Fixture",
      withStateMove: false,
      hitDefDamage: 31,
      hitDefPriority: 6,
    });
    const lowPriority = createImportedFixture({
      id: "low-priority-fixture",
      displayName: "Low Priority Fixture",
      withStateMove: false,
      hitDefDamage: 31,
      hitDefPriority: 3,
    });
    const runtime = new PlayableMatchRuntime(highPriority, lowPriority, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set(["x"]) });

    expect(snapshot.actors[0]?.runtime.life).toBe(1000);
    expect(snapshot.actors[1]?.runtime.life).toBe(969);
    expect(snapshot.logs.some((line) => line.includes("HitDef priority clash") && line.includes("6 beat"))).toBe(true);
    expect(snapshot.logs.some((line) => line.includes("Low Priority Fixture hit High Priority Fixture"))).toBe(false);
  });

  it("records imported RemapPal telemetry and ForceFeedback as a browser no-op", () => {
    const imported = createImportedFixture({ withStateMove: false, withPaletteUtilities: true });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[0]?.runtime.paletteRemap).toEqual({ source: [1, 1], dest: [2, 3] });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.RemapPal).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["sprite-effect:remappal"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ForceFeedback).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["noop:forcefeedback"]).toBe(1);
  });

  it("executes simple imported target controllers against the latest hit target", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 10,
      hitDefTargetId: 77,
      withTargetControllers: true,
    });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.targetCount).toBe(1);
    expect(snapshot.actors[1]?.runtime.life).toBe(990);

    for (let frame = 0; frame < 20 && !snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetBind; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.targetCount).toBe(1);
    expect(snapshot.actors[1]?.runtime.life).toBe(970);
    expect(snapshot.actors[1]?.runtime.power).toBe(40);
    expect(snapshot.actors[1]?.runtime.vel).toEqual({ x: 0.88, y: -3 });
    expect(snapshot.actors[1]?.runtime.facing).toBe(1);
    expect(snapshot.actors[1]?.runtime.stateNo).toBe(500);
    expect(snapshot.actors[1]?.runtime.animNo).toBe(500);
    expect(snapshot.actors[1]?.runtime.animationSource).toBe("state-owner");
    expect(snapshot.actors[1]?.runtime.customState).toEqual({ ownerId: "p1", stateNo: 500, getP1State: true });
    expect(snapshot.actors[1]?.frame?.spriteGroup).toBe(500);
    expect(snapshot.actors[1]?.runtime.pos).toEqual({
      x: snapshot.actors[0]!.runtime.pos.x + 36,
      y: snapshot.actors[0]!.runtime.pos.y - 12,
    });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetLifeAdd).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetPowerAdd).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetVelSet).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetVelAdd).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetFacing).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetBind).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetState).toBe(1);
  });

  it("keeps TargetBind offsets applied while the owner advances during SuperPause movetime", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 10,
      hitDefTargetId: 77,
      multiFrameAction: { id: 200, durations: [20, 20] },
      withPrePauseTargetBind: true,
      withDelayedSuperPause: true,
      pauseMovePosAdd: { x: 8, y: -2, time: 2 },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 12 && !snapshot.matchPause; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }
    snapshot = runtime.step({ p1: new Set(), p2: new Set() });

    expect(snapshot.matchPause?.type).toBe("SuperPause");
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.PosAdd).toBe(1);
    expect(snapshot.actors[0]?.runtime.pos.y).toBe(-2);
    expect(snapshot.actors[1]?.runtime.pos).toEqual({
      x: snapshot.actors[0]!.runtime.pos.x + 36,
      y: snapshot.actors[0]!.runtime.pos.y - 12,
    });
    expect(snapshot.actors[0]?.runtime.targetBindings).toEqual([
      { actorId: "p2", targetId: 77, remaining: 3, offset: { x: 36, y: -12 } },
    ]);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.SuperPause).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetBind).toBe(1);
  });

  it("executes imported BindToTarget against the latest hit target", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 10,
      hitDefTargetId: 77,
      withBindToTarget: true,
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 20 && !snapshot.compatibilitySession?.actors[0]?.executedControllers.BindToTarget; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.bindToTarget).toEqual({
      actorId: "p2",
      targetId: 77,
      remaining: 3,
      offset: { x: 20, y: -8 },
    });
    expect(snapshot.actors[0]?.runtime.pos).toEqual({
      x: snapshot.actors[1]!.runtime.pos.x - 20,
      y: snapshot.actors[1]!.runtime.pos.y - 8,
    });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.BindToTarget).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations.bindtotarget).toBe(1);
  });

  it("resolves imported BindToTarget Head anchors from target Size constants", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 10,
      hitDefTargetId: 77,
      withBindToTarget: true,
      bindToTargetPostype: "Head",
    });
    const target: DemoFighterDefinition = {
      ...demoFighters[1]!,
      constants: {
        "size.head.pos.x": 6,
        "size.head.pos.y": -72,
      },
    };
    const runtime = new PlayableMatchRuntime(imported, target, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 20 && !snapshot.compatibilitySession?.actors[0]?.executedControllers.BindToTarget; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.bindToTarget).toEqual({
      actorId: "p2",
      targetId: 77,
      remaining: 3,
      offset: { x: 26, y: -80 },
    });
    expect(snapshot.actors[0]?.runtime.pos).toEqual({
      x: snapshot.actors[1]!.runtime.pos.x - 26,
      y: snapshot.actors[1]!.runtime.pos.y - 80,
    });
  });

  it("executes imported TargetDrop against the latest hit target", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      hitDefDamage: 10,
      hitDefTargetId: 77,
      withTargetDrop: true,
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.targetCount).toBe(1);

    for (let frame = 0; frame < 20 && !snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetDrop; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.targetCount).toBe(0);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.TargetDrop).toBe(1);
  });

  it("buffers imported CMD inputs entered during hit pause when buffer.hitpause is enabled", () => {
    const imported = createHitPauseBufferFixture(true);
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    let snapshot = runtime.step({ p1: new Set(["x"]) });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);

    for (let frame = 0; frame < 5; frame += 1) {
      snapshot = runtime.step({ p1: new Set(["y"]) });
    }
    for (let frame = 0; frame < 30 && snapshot.actors[0]?.runtime.stateNo !== 210; frame += 1) {
      snapshot = runtime.step({ p1: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(210);
    expect(snapshot.compatibilitySession?.actors[0]?.routedStateEntries).toBe(2);
  });

  it("does not buffer imported CMD hitpause inputs when buffer.hitpause is disabled", () => {
    const imported = createHitPauseBufferFixture(false);
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    let snapshot = runtime.step({ p1: new Set(["x"]) });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);

    for (let frame = 0; frame < 5; frame += 1) {
      snapshot = runtime.step({ p1: new Set(["y"]) });
    }
    for (let frame = 0; frame < 30; frame += 1) {
      snapshot = runtime.step({ p1: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).not.toBe(210);
    expect(snapshot.compatibilitySession?.actors[0]?.routedStateEntries).toBe(1);
  });

  it("executes imported ignorehitpause controllers during global hit pause", () => {
    const imported = createHitPauseIgnoreControllerFixture(true);
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    let snapshot = runtime.step({ p1: new Set(["x"]) });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[0]?.hitPause).toBeGreaterThan(0);

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(220);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeState).toBe(2);
    expect(snapshot.tickSchedule).toMatchObject({
      branch: "hitpause",
      phases: [
        { id: "tick:stamp-input" },
        { id: "frame:start" },
        { id: "branch:hitpause-advance" },
        { id: "tick:guard-distance-latch", actorId: "p1" },
        { id: "tick:guard-distance-latch", actorId: "p2" },
        { id: "tick:restore-superpause-defense" },
      ],
    });
  });

  it("keeps non-ignorehitpause imported controllers frozen during global hit pause", () => {
    const imported = createHitPauseIgnoreControllerFixture(false);
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    let snapshot = runtime.step({ p1: new Set(["x"]) });
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(200);
    expect(snapshot.actors[0]?.hitPause).toBeGreaterThan(0);

    for (let frame = 0; frame < 8; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.stateNo).not.toBe(220);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeState).toBe(1);
  });

  it("finishes the prepared active tick before imported Pause freezes the opponent", () => {
    const imported = createImportedFixture({ withStateMove: false, withPause: true });
    const farStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -100, y: 0, facing: 1 as const },
        p2: { x: 220, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, farStage);
    const initialP2AnimTime = runtime.getSnapshot().actors[1]!.runtime.animTime;

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const p1AnimTimeBefore = snapshot.actors[0]!.runtime.animTime;
    const p2AnimTimeBefore = snapshot.actors[1]!.runtime.animTime;

    expect(snapshot.matchPause).toMatchObject({
      type: "Pause",
      remaining: 6,
      moveTime: 2,
      actorId: "p1",
      darken: false,
      sourceStateNo: 200,
    });
    expect(snapshot.actors[1]!.runtime.animTime).toBeGreaterThan(initialP2AnimTime);
    expect(
      snapshot.tickSchedule?.phases.some((phase) => phase.id === "fighter:controllers" && phase.actorId === "p2"),
    ).toBe(true);
    expect(
      snapshot.tickSchedule?.phases.some(
        (phase) => phase.id === "fighter:auto-guard-check:post" && phase.actorId === "p2",
      ),
    ).toBe(true);

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.matchPause).toMatchObject({ type: "Pause", remaining: 5, moveTime: 1 });
    expect(snapshot.actors[0]!.runtime.animTime).toBeGreaterThan(p1AnimTimeBefore);
    expect(snapshot.actors[1]!.runtime.animTime).toBe(p2AnimTimeBefore);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.Pause).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["pause:pause"]).toBe(1);
    expect(snapshot.tickSchedule?.branch).toBe("pause");
    expect(snapshot.tickSchedule?.phases.map((phase) => phase.id)).toEqual([
      "tick:stamp-input",
      "frame:start",
      "branch:hitpause-advance",
      "branch:pause-check",
      "pause:advance",
      "fighter:kinematics",
      "fighter:animation",
      "fighter:controllers",
      "tick:guard-distance-latch",
      "tick:guard-distance-latch",
      "tick:restore-superpause-defense",
    ]);

    for (let frame = 0; frame < 5; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }
    expect(snapshot.matchPause).toBeUndefined();
  });

  it("executes imported SuperPause with darken and poweradd telemetry", () => {
    const imported = createImportedFixture({ withStateMove: false, withSuperPause: true });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);
    const initialP2AnimTime = runtime.getSnapshot().actors[1]!.runtime.animTime;

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const p1AnimTimeBefore = snapshot.actors[0]!.runtime.animTime;
    const p2AnimTimeBefore = snapshot.actors[1]!.runtime.animTime;

    expect(snapshot.matchPause).toMatchObject({
      type: "SuperPause",
      remaining: 7,
      moveTime: 1,
      actorId: "p1",
      darken: true,
      sourceStateNo: 200,
    });
    expect(snapshot.actors[1]!.runtime.animTime).toBeGreaterThan(initialP2AnimTime);
    expect(
      snapshot.tickSchedule?.phases.some((phase) => phase.id === "fighter:controllers" && phase.actorId === "p2"),
    ).toBe(true);
    expect(
      snapshot.tickSchedule?.phases.some(
        (phase) => phase.id === "fighter:auto-guard-check:post" && phase.actorId === "p2",
      ),
    ).toBe(true);
    expect(snapshot.actors[0]?.runtime.power).toBe(100);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.SuperPause).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["pause:superpause"]).toBe(1);

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.matchPause).toMatchObject({ type: "SuperPause", remaining: 6, moveTime: 0 });
    expect(snapshot.actors[0]!.runtime.animTime).toBeGreaterThan(p1AnimTimeBefore);
    expect(snapshot.actors[1]!.runtime.animTime).toBe(p2AnimTimeBefore);
  });

  it("restores temporary SuperPause p2defmul after pause expiry", () => {
    const runtime = new PlayableMatchRuntime(
      createImportedFixture({ withStateMove: false, withDelayedSuperPause: true, superPauseP2DefMul: 2 }),
      createImportedFixture({ withStateMove: false, defenseMultiplier: 0.5 }),
      {
        ...trainingStage,
        playerStart: {
          p1: { x: -20, y: 0, facing: 1 as const },
          p2: { x: 35, y: 0, facing: -1 as const },
        },
      },
    );

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 12 && !snapshot.matchPause; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }
    expect(snapshot.matchPause?.type).toBe("SuperPause");
    expect(snapshot.actors[1]?.runtime.defenseMultiplier).toBe(0.5);
    expect(snapshot.actors[1]?.runtime.superPauseDefenseMultiplier).toBe(0.5);

    for (let frame = 0; frame < 7; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.matchPause).toBeUndefined();
    expect(snapshot.actors[1]?.runtime.defenseMultiplier).toBe(0.5);
    expect(snapshot.actors[1]?.runtime.superPauseDefenseMultiplier).toBeUndefined();
  });

  it.each([
    ["omitted", undefined],
    ["zero", 0],
  ])("uses and restores the IKEMEN default for %s SuperPause p2defmul", (_label, p2DefMul) => {
    const runtime = new PlayableMatchRuntime(
      createImportedFixture({ withStateMove: false, withDelayedSuperPause: true, superPauseP2DefMul: p2DefMul }),
      createImportedFixture({ withStateMove: false, defenseMultiplier: 0.5 }),
      trainingStage,
      { runtimeProfile: "ikemen-go" },
    );

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 12 && !snapshot.matchPause; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }
    expect(snapshot.matchPause?.type).toBe("SuperPause");
    expect(snapshot.actors[1]?.runtime.defenseMultiplier).toBe(0.5);
    expect(snapshot.actors[1]?.runtime.superPauseDefenseMultiplier).toBeCloseTo(2 / 3);

    for (let frame = 0; frame < 7; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }
    expect(snapshot.matchPause).toBeUndefined();
    expect(snapshot.actors[1]?.runtime.defenseMultiplier).toBe(0.5);
    expect(snapshot.actors[1]?.runtime.superPauseDefenseMultiplier).toBeUndefined();
  });

  it("uses the explicit IKEMEN game-level SuperPause defense override", () => {
    const runtime = new PlayableMatchRuntime(
      createImportedFixture({ withStateMove: false, withDelayedSuperPause: true }),
      createImportedFixture({ withStateMove: false }),
      trainingStage,
      { runtimeProfile: "ikemen-go", superPauseTargetDefenseValue: 2 },
    );

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 12 && !snapshot.matchPause; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.matchPause?.type).toBe("SuperPause");
    expect(snapshot.actors[1]?.runtime.superPauseDefenseMultiplier).toBe(0.5);
  });

  it("applies IKEMEN SuperPause defense to the opposing root and existing helpers without target memory", () => {
    const runtime = new PlayableMatchRuntime(
      createImportedFixture({ withStateMove: false, withDelayedSuperPause: true }),
      createImportedFixture({ withStateMove: false, withHelper: true }),
      trainingStage,
      { runtimeProfile: "ikemen-go" },
    );

    let snapshot = runtime.step({ p1: new Set(), p2: new Set(["x"]) });
    for (let frame = 0; frame < 20 && !snapshot.actors[1]?.runtime.ctrl; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }
    expect(snapshot.effects?.some((effect) => effect.id === "p2-helper-0")).toBe(true);

    snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    for (let frame = 0; frame < 12 && !snapshot.matchPause; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.actors[0]?.runtime.targetCount).toBe(0);
    expect(snapshot.actors[1]?.runtime.superPauseDefenseMultiplier).toBeCloseTo(2 / 3);
    expect(
      snapshot.effects?.find((effect) => effect.id === "p2-helper-0")?.runtime.superPauseDefenseMultiplier,
    ).toBeCloseTo(2 / 3);
  });

  it("advances imported Explods with supermovetime during SuperPause after source movetime expires", () => {
    const imported = createImportedFixture({ withStateMove: false, withSuperPause: true, withPauseExplods: true });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -100, y: 0, facing: 1 as const },
        p2: { x: 220, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.matchPause?.type).toBe("SuperPause");
    expect(snapshot.effects?.some((effect) => effect.label === "Explod 9100")).toBe(true);
    expect(snapshot.effects?.some((effect) => effect.label === "Explod 9101")).toBe(true);

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    const frozenAfterMovetime = effectX(snapshot, "Explod 9100");
    const movingAfterMovetime = effectX(snapshot, "Explod 9101");
    expect(snapshot.matchPause).toMatchObject({ type: "SuperPause", moveTime: 0 });

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(effectX(snapshot, "Explod 9100")).toBe(frozenAfterMovetime);
    expect(effectX(snapshot, "Explod 9101")).toBeGreaterThan(movingAfterMovetime);
  });

  it("applies imported Width, SprPriority, PalFX, AfterImage, sound, and EnvShake hook controllers", () => {
    const imported = createImportedFixture({ withSideEffects: true });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    const snapshot = runtime.step({ p1: new Set(["x"]) });
    const actor = snapshot.actors[0];

    expect(actor?.runtime.bodyWidth).toEqual({ front: 18, back: 44 });
    expect(actor?.runtime.spritePriority).toBe(5);
    expect(actor?.runtime.paletteFx).toMatchObject({
      remaining: 18,
      time: 18,
      add: [80, 0, 0],
      mul: [256, 160, 160],
      color: 256,
      invert: false,
    });
    expect(actor?.runtime.afterImage).toMatchObject({
      remaining: 20,
      time: 20,
      length: 4,
      timeGap: 2,
      frameGap: 1,
      palAdd: [0, 40, 90],
      palMul: [160, 160, 256],
    });
    expect(actor?.runtime.afterImage?.samples).toHaveLength(1);
    expect(snapshot.effects?.[0]).toMatchObject({
      label: "Explod 9000",
      source: "effect",
      runtime: {
        animNo: 900,
        renderOpacity: 0.78,
      },
    });
    expect(actor?.soundEvents?.[0]).toMatchObject({
      type: "PlaySnd",
      group: 5,
      index: 0,
      channel: 0,
      stateNo: 200,
    });
    expect(actor?.envShakeEvents?.[0]).toMatchObject({
      type: "EnvShake",
      time: 12,
      freq: 30,
      ampl: -6,
      stateNo: 200,
    });
    expect(snapshot.stage.camera.shake).toMatchObject({
      remaining: 12,
      amplitude: -6,
    });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.Width).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["collision:width"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.SprPriority).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["sprite-effect:sprpriority"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.PalFX).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["sprite-effect:palfx"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.AfterImage).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["sprite-effect:afterimage"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.Explod).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations.explod).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.PlaySnd).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["audio:playsnd"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.EnvShake).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations.envshake).toBe(1);
  });

  it("executes imported Turn, PlayerPush, LifeSet, and PowerSet controllers", () => {
    const imported = createImportedFixture({ withStateMove: false, withRuntimeFlags: true });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const actor = snapshot.actors[0];

    expect(actor?.runtime.facing).toBe(-1);
    expect(actor?.runtime.playerPush).toBe(false);
    expect(actor?.runtime.stateType).toBe("C");
    expect(actor?.runtime.moveType).toBe("A");
    expect(actor?.runtime.physics).toBe("N");
    expect(actor?.runtime.life).toBe(777);
    expect(actor?.runtime.power).toBe(1234);
    expect(actor?.runtime.pos.x).toBe(-20);
    expect(snapshot.actors[1]?.runtime.pos.x).toBe(35);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.Turn).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["orientation:turn"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.PlayerPush).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["collision:playerpush"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.StateTypeSet).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations["metadata:statetypeset"]).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.LifeSet).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.PowerSet).toBe(1);
  });

  it("executes imported AssertSpecial flags for noautoturn, nowalk, and invisible telemetry", () => {
    const imported = createImportedFixture({ withStateMove: false, withAssertSpecial: true });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const actor = snapshot.actors[0]!;

    expect(actor.runtime.assertSpecial).toMatchObject({
      flags: ["noautoturn", "nowalk", "invisible"],
      noAutoTurn: true,
      noWalk: true,
      invisible: true,
    });
    expect(actor.runtime.renderOpacity).toBe(0);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.AssertSpecial).toBe(1);

    snapshot = runtime.step({ p1: new Set(["F"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.facing).toBe(1);
    expect(snapshot.actors[0]?.runtime.stateNo).not.toBe(imported.walkAction);
  });

  it("executes imported ChangeAnim2 as a state-owner animation source marker", () => {
    const imported = createImportedFixture({ withStateMove: false, withChangeAnim2: true });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const actor = snapshot.actors[0]!;

    expect(actor.runtime.animNo).toBe(920);
    expect(actor.runtime.animationSource).toBe("state-owner");
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeAnim2).toBe(1);
  });

  it("executes imported ChangeAnim elem and elemtime by starting on the requested AIR element", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      withChangeAnimElem: { animNo: 930, elem: 3, elemTime: 1 },
      multiFrameAction: { id: 930, durations: [5, 5, 5] },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const actor = snapshot.actors[0]!;

    expect(actor.runtime.animNo).toBe(930);
    expect(actor.runtime.frameIndex).toBe(2);
    expect(actor.runtime.animTime).toBe(11);
    expect(actor.frame?.spriteGroup).toBe(930);
    expect(actor.frame?.spriteIndex).toBe(2);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeAnim).toBe(1);
  });

  it("executes imported ChangeState anim override while preserving animation when no anim is supplied", () => {
    const withOverride = createImportedFixture({
      withStateMove: false,
      withChangeState: { stateNo: 777, controllerAnimNo: 930, stateAnimNo: null },
      multiFrameAction: { id: 930, durations: [6, 6] },
    });
    let runtime = new PlayableMatchRuntime(withOverride, demoFighters[1]!);
    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(777);
    expect(snapshot.actors[0]?.runtime.animNo).toBe(930);
    expect(snapshot.actors[0]?.frame?.spriteGroup).toBe(930);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);

    const preserveCurrent = createImportedFixture({
      withStateMove: false,
      withChangeState: { stateNo: 778, stateAnimNo: null },
    });
    runtime = new PlayableMatchRuntime(preserveCurrent, demoFighters[1]!);
    snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });

    expect(snapshot.actors[0]?.runtime.stateNo).toBe(778);
    expect(snapshot.actors[0]?.runtime.animNo).toBe(200);
    expect(snapshot.actors[0]?.frame?.spriteGroup).toBe(200);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
  });

  it("evaluates imported AnimElemTime from current AIR frame timing", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      withAnimElemTimeVars: true,
      multiFrameAction: { id: 200, durations: [2, 4, 4] },
    });
    const farStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -180, y: 0, facing: 1 as const },
        p2: { x: 180, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, farStage);

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.vars[7]).toBe(70);
    expect(snapshot.actors[0]?.runtime.vars[8]).toBeUndefined();

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.frameIndex).toBe(1);
    expect(snapshot.actors[0]?.runtime.vars[8]).toBe(80);

    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.actors[0]?.runtime.vars[9]).toBe(90);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.VarSet).toBeGreaterThanOrEqual(3);
  });

  it("executes imported PosFreeze by cancelling velocity movement for the current tick", () => {
    const imported = createImportedFixture({ withStateMove: false, withPosFreeze: true, stateVelSet: "7,-3" });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: -12, facing: 1 as const },
        p2: { x: 80, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const actor = snapshot.actors[0];

    expect(actor?.runtime.pos).toEqual({ x: -20, y: -12 });
    expect(actor?.runtime.posFreeze).toEqual({ x: true, y: true });
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.PosFreeze).toBe(1);
  });

  it("executes imported ScreenBound by allowing one-tick off-bound movement and camera exclusion", () => {
    const imported = createImportedFixture({ withStateMove: false, withScreenBoundOff: true, stateVelSet: "65,0" });
    const tightStage = {
      ...trainingStage,
      bounds: { left: -40, right: 40 },
      camera: { ...trainingStage.camera, startX: 0 },
      playerStart: {
        p1: { x: 30, y: 0, facing: 1 as const },
        p2: { x: -20, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, tightStage);

    const snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    const actor = snapshot.actors[0];

    expect(actor?.runtime.pos.x).toBeGreaterThan(tightStage.bounds.right);
    expect(actor?.runtime.screenBound).toEqual({ bound: false, moveCameraX: false, moveCameraY: true });
    expect(snapshot.stage.camera.x).toBeCloseTo(snapshot.actors[1]!.runtime.pos.x);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.ScreenBound).toBe(1);
  });

  it("spawns imported Projectile controllers as visible hitbox effects that can hit", () => {
    const imported = createImportedFixture({ withStateMove: false, withProjectile: true });
    const closeStage = {
      ...trainingStage,
      playerStart: {
        p1: { x: -35, y: 0, facing: 1 as const },
        p2: { x: 130, y: 0, facing: -1 as const },
      },
    };
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage);

    let snapshot = runtime.step({ p1: new Set(["x"]) });
    const projectile = snapshot.effects?.find((effect) => effect.label === "Projectile 77");

    expect(projectile?.source).toBe("effect");
    expect(projectile?.runtime.animNo).toBe(910);
    expect(projectile?.clsn1).toEqual([{ x1: 6, y1: -18, x2: 34, y2: 6 }]);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.Projectile).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations.projectile).toBe(1);

    const lifeBefore = snapshot.actors[1]!.runtime.life;
    for (let frame = 0; frame < 6; frame += 1) {
      snapshot = runtime.step({ p1: new Set() });
    }

    expect(snapshot.actors[1]!.runtime.life).toBeLessThan(lifeBefore);
    expect(snapshot.logs.some((line) => line.includes("Imported Fixture projectile hit Mira Volt for 31"))).toBe(true);
  });

  it("evaluates bounded ProjHit triggers after imported Projectile contact", () => {
    const imported = createImportedFixture({
      withStateMove: false,
      withProjectile: true,
      projHitStateNo: 270,
      multiFrameAction: { id: 200, durations: [40] },
    });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, {
      ...trainingStage,
      playerStart: {
        p1: { x: -35, y: 0, facing: 1 as const },
        p2: { x: 130, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.effects?.some((effect) => effect.label === "Projectile 77")).toBe(true);

    for (let frame = 0; frame < 14; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.logs.some((line) => line.includes("Imported Fixture projectile hit Mira Volt for 31"))).toBe(true);
    expect(snapshot.actors[0]?.runtime.stateNo).toBe(270);
    expect(snapshot.compatibilitySession?.actors[0]?.executedStates).toContain(270);
  });

  it("spawns imported Helper controllers as visible AIR-backed effect actors", () => {
    const imported = createImportedFixture({ withStateMove: false, withHelper: true });
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!);

    const snapshot = runtime.step({ p1: new Set(["x"]) });
    const helper = snapshot.effects?.find((effect) => effect.label === "Helper Buddy");

    expect(helper?.source).toBe("effect");
    expect(helper?.runtime.stateNo).toBe(1200);
    expect(helper?.runtime.animNo).toBe(920);
    expect(helper?.runtime.spritePriority).toBe(8);
    expect(helper?.clsn1).toEqual([{ x1: 10, y1: -45, x2: 36, y2: -18 }]);
    expect(helper?.clsn2).toEqual([{ x1: -18, y1: -64, x2: 18, y2: 0 }]);
    expect(snapshot.compatibilitySession?.actors[0]?.executedControllers.Helper).toBe(1);
    expect(snapshot.compatibilitySession?.actors[0]?.executedOperations.helper).toBe(1);
  });

  it("removes imported Explods flagged with removeongethit when the owner is hit", () => {
    const defender = createImportedFixture({
      id: "removeongethit-defender",
      displayName: "RemoveOnGetHit Defender",
      withStateMove: false,
      passiveRemoveOnGetHitExplod: true,
    });
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -20, y: 0, facing: 1 as const },
        p2: { x: 35, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p2" && effect.label === "Explod 9004")).toBe(true);

    for (let frame = 0; frame < 18; frame += 1) {
      snapshot = runtime.step({ p1: new Set(["a"]), p2: new Set() });
    }

    expect(snapshot.actors[1]?.runtime.moveType).toBe("H");
    expect(snapshot.logs.some((line) => line.includes("Nova Boxer hit RemoveOnGetHit Defender"))).toBe(true);
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p2" && effect.label === "Explod 9004")).toBe(false);
    expect(runtime.getEffectActorStores()[1]).toMatchObject({
      ownerId: "p2",
      total: 0,
      explods: [],
      nextSerials: { explod: 1 },
    });
  });

  it("removes imported Explods flagged with removeongethit when the owner is hit by a projectile", () => {
    const attacker = createImportedFixture({
      id: "projectile-removeongethit-attacker",
      displayName: "Projectile RemoveOnGetHit Attacker",
      withStateMove: false,
      withProjectile: true,
    });
    const defender = createImportedFixture({
      id: "projectile-removeongethit-defender",
      displayName: "Projectile RemoveOnGetHit Defender",
      withStateMove: false,
      passiveRemoveOnGetHitExplod: true,
    });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -35, y: 0, facing: 1 as const },
        p2: { x: 130, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p2" && effect.label === "Explod 9004")).toBe(true);

    snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() });
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p1" && effect.label === "Projectile 77")).toBe(true);

    for (let frame = 0; frame < 12; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    }

    expect(snapshot.logs.some((line) => line.includes("Projectile RemoveOnGetHit Attacker projectile hit Projectile RemoveOnGetHit Defender"))).toBe(true);
    expect(snapshot.actors[1]?.runtime.moveType).toBe("H");
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p2" && effect.label === "Explod 9004")).toBe(false);
    expect(runtime.getEffectActorStores()[1]).toMatchObject({
      ownerId: "p2",
      total: 0,
      explods: [],
      nextSerials: { explod: 1 },
    });
  });

  it("removes imported Explods flagged with removeongethit when the owner guards a projectile", () => {
    const attacker = createImportedFixture({
      id: "projectile-guard-removeongethit-attacker",
      displayName: "Projectile Guard RemoveOnGetHit Attacker",
      withStateMove: false,
      withProjectile: true,
    });
    const defender = createImportedFixture({
      id: "projectile-guard-removeongethit-defender",
      displayName: "Projectile Guard RemoveOnGetHit Defender",
      withStateMove: false,
      passiveRemoveOnGetHitExplod: true,
    });
    const runtime = new PlayableMatchRuntime(attacker, defender, {
      ...trainingStage,
      playerStart: {
        p1: { x: -35, y: 0, facing: 1 as const },
        p2: { x: 130, y: 0, facing: -1 as const },
      },
    });

    let snapshot = runtime.step({ p1: new Set(), p2: new Set() });
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p2" && effect.label === "Explod 9004")).toBe(true);

    snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set(["B"]) });
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p1" && effect.label === "Projectile 77")).toBe(true);

    for (let frame = 0; frame < 12; frame += 1) {
      snapshot = runtime.step({ p1: new Set(), p2: new Set(["B"]) });
    }

    expect(snapshot.logs.some((line) => line.includes("Projectile Guard RemoveOnGetHit Defender guarded Projectile Guard RemoveOnGetHit Attacker projectile"))).toBe(true);
    expect(snapshot.actors[1]?.runtime.moveType).toBe("H");
    expect(snapshot.actors[1]?.runtime.guarding).toBe(true);
    expect(snapshot.effects?.some((effect) => effect.ownerId === "p2" && effect.label === "Explod 9004")).toBe(false);
    expect(runtime.getEffectActorStores()[1]).toMatchObject({
      ownerId: "p2",
      total: 0,
      explods: [],
      nextSerials: { explod: 1 },
    });
  });

  it("can use externally owned effect actor stores and reset them in place", () => {
    const imported = createImportedFixture({ withStateMove: false, withHelper: true });
    const effectActorStores = createRuntimeEffectActorStores();
    const p1Store = effectActorStores.p1;
    const runtime = new PlayableMatchRuntime(imported, demoFighters[1]!, trainingStage, { effectActorStores });

    runtime.step({ p1: new Set(["x"]) });

    expect(effectActorStores.p1).toBe(p1Store);
    expect(effectActorStores.p1.helpers.map((helper) => helper.serialId)).toEqual(["p1-helper-0"]);
    expect(runtime.getEffectActorStores()[0]).toMatchObject({
      ownerId: "p1",
      total: 1,
      helpers: ["p1-helper-0"],
      nextSerials: { helper: 1 },
    });

    runtime.reset();

    expect(effectActorStores.p1).toBe(p1Store);
    expect(effectActorStores.p1.helpers).toEqual([]);
    expect(effectActorStores.p1.nextHelperSerial).toBe(0);
  });
});

function effectX(snapshot: ReturnType<PlayableMatchRuntime["getSnapshot"]>, label: string): number {
  const effect = snapshot.effects?.find((candidate) => candidate.label === label);
  expect(effect).toBeDefined();
  return effect!.runtime.pos.x;
}

function createImportedFixture(
  options: {
    id?: string;
    displayName?: string;
    actionGroupOffset?: number;
    multiFrameAction?: { id: number; durations: number[] };
    withStateMove?: boolean;
    hitDefDamage?: number;
    hitDefKill?: boolean;
    hitDefAttr?: string;
    attackStateType?: "S" | "C" | "A" | "L";
    hitDefPriority?: number;
    hitDefTargetId?: number;
    hitDefP1StateNo?: number;
    hitDefP2StateNo?: number;
    hitDefP2GetP1State?: boolean;
    hitDefP2SelfStateAfter?: number;
    hitDefP2ChangeStateTo?: number;
    hitDefP2ChangeStateAfter?: number;
    hitDefP2ChangeAnim2To?: number;
    hitDefP2ChangeAnim2After?: number;
    extraStateNos?: number[];
    hitSpark?: string;
    guardSpark?: string;
    hitSparkLibraries?: DemoFighterDefinition["hitSparkLibraries"];
    guardDamage?: number;
    guardKill?: boolean;
    guardFlag?: string;
    guardSlideTime?: number;
    guardControlTime?: number;
    passiveNotHitBy?: string;
    passiveHitBy?: string;
    passiveHitOverride?: { attr: string; stateNo: number; forceAir?: boolean };
    passiveReversalDef?: { attr: string; p1StateNo: number; p2StateNo?: number; hitPause?: number };
    passiveAssertSpecialFlags?: string[];
    passiveAssertSpecialTrigger?: string;
    passiveTagController?: "TagIn" | "TagOut";
    passiveTagRedirectId?: number | string;
    passiveTagSelf?: number | string;
    passiveTagPartner?: number | string;
    passiveTagStateNo?: number | string;
    passiveTagPartnerStateNo?: number | string;
    passiveTagControl?: number | string;
    passiveTagPartnerControl?: number | string;
    passiveTagMemberNo?: number | string;
    passiveTagLeader?: number | string;
    passiveVarSet?: { trigger: string; index: number; value: number | string };
    passivePreTagVarSet?: { trigger: string; index: number; value: number };
    defenseMultiplier?: number;
    attackMultiplier?: number;
    withPaletteUtilities?: boolean;
    withSideEffects?: boolean;
    passiveRemoveOnGetHitExplod?: boolean;
    withRuntimeFlags?: boolean;
    withPosFreeze?: boolean;
    withScreenBoundOff?: boolean;
    stateVelSet?: string;
    withProjectile?: boolean;
    withHelper?: boolean;
    helperRedirectTag?: boolean;
    helperRemoveTime?: number;
    helperStateControllers?: string;
    withTargetControllers?: boolean;
    withBindToTarget?: boolean;
    bindToTargetPostype?: "Foot" | "Mid" | "Head";
    withTargetDrop?: boolean;
    withPrePauseTargetBind?: boolean;
    withPause?: boolean;
    withSuperPause?: boolean;
    superPauseP2DefMul?: number;
    withDelayedSuperPause?: boolean;
    pauseMovePosAdd?: { x: number; y: number; time?: number };
    withPauseExplods?: boolean;
    withAssertSpecial?: boolean;
    withChangeAnim2?: boolean;
    withChangeAnimElem?: { animNo: number; elem: number; elemTime?: number };
    withChangeState?: { stateNo: number; controllerAnimNo?: number; stateAnimNo?: number | null };
    withAnimElemTimeVars?: boolean;
    withFallHitDef?: boolean;
    fallDefenceUp?: number;
    fallKill?: boolean;
    downRecoverTime?: number;
    dataLiedownTime?: number;
    dataAttack?: number;
    dataDefence?: number;
    defaultGetHitStateNo?: number;
    moveHitStateNo?: number;
    moveHitCounterStateNo?: number;
    hitCountStateNo?: number;
    moveReversedStateNo?: number;
    moveGuardStateNo?: number;
    withMoveHitReset?: boolean;
    hitDefAttrStateNo?: number;
    projHitStateNo?: number;
    projGuardStateNo?: number;
    withPrevStateBranch?: { intermediateStateNo: number; finalStateNo: number };
    withPrevAnimBranch?: { previousAnimNo: number; intermediateStateNo: number; finalStateNo: number };
    withPrevStateTypeBranch?: { intermediateStateNo: number; finalStateNo: number };
    withPrevMoveTypeBranch?: { intermediateStateNo: number; finalStateNo: number };
  } = {},
): DemoFighterDefinition {
  const withStateMove = options.withStateMove ?? true;
  const hitDefDamage = options.hitDefDamage ?? 23;
  const hitDefAttr = options.hitDefAttr ?? "S,NA";
  const hitDefPriority = options.hitDefPriority ?? 4;
  const hitDefTargetId = options.hitDefTargetId ?? 7;
  const fixtureAction = (
    id: number,
    actionOptions: { clsn1?: Array<{ x1: number; y1: number; x2: number; y2: number }>; durations?: number[] } = {},
  ): MugenAnimationAction => action(id, actionOptions, options.actionGroupOffset ?? 0);
  const hitDefCustomStateLines =
    options.hitDefP1StateNo !== undefined || options.hitDefP2StateNo !== undefined
      ? `
${options.hitDefP1StateNo !== undefined ? `p1stateno = ${options.hitDefP1StateNo}` : ""}
${options.hitDefP2StateNo !== undefined ? `p2stateno = ${options.hitDefP2StateNo}` : ""}
${options.hitDefP2StateNo !== undefined ? `p2getp1state = ${options.hitDefP2GetP1State === false ? 0 : 1}` : ""}
`
      : "";
  const damageLine = options.guardDamage !== undefined ? `${hitDefDamage},${options.guardDamage}` : `${hitDefDamage}`;
  const hitDefKillLine = options.hitDefKill === undefined ? "" : `kill = ${options.hitDefKill ? 1 : 0}`;
  const hitSparkLines =
    options.hitSpark !== undefined || options.guardSpark !== undefined
      ? `
${options.hitSpark === undefined ? "" : `sparkno = ${options.hitSpark}`}
${options.guardSpark === undefined ? "" : `guard.sparkno = ${options.guardSpark}`}
sparkxy = 10,-72
`
      : "";
  const guardLine =
    options.guardFlag !== undefined
      ? `
guardflag = ${options.guardFlag}
${options.guardKill === undefined ? "" : `guard.kill = ${options.guardKill ? 1 : 0}`}
guard.pausetime = 4,4
guard.hittime = 9
${options.guardSlideTime === undefined ? "" : `guard.slidetime = ${options.guardSlideTime}`}
${options.guardControlTime === undefined ? "" : `guard.ctrltime = ${options.guardControlTime}`}
guard.velocity = -2
`
      : "";
  const hitDefP2ChangeStateLines =
    options.hitDefP2ChangeStateTo !== undefined
      ? `
[State ${options.hitDefP2StateNo}, Chain Custom State]
type = ChangeState
trigger1 = Time >= ${options.hitDefP2ChangeStateAfter ?? 1}
value = ${options.hitDefP2ChangeStateTo}
`
      : "";
  const hitDefP2ChangeAnim2Lines =
    options.hitDefP2ChangeAnim2To !== undefined
      ? `
[State ${options.hitDefP2StateNo}, Borrow Owner Animation]
type = ChangeAnim2
trigger1 = Time >= ${options.hitDefP2ChangeAnim2After ?? 1}
value = ${options.hitDefP2ChangeAnim2To}
`
      : "";
  const hitDefP2SelfStateLines =
    options.hitDefP2SelfStateAfter !== undefined
      ? `
[State ${options.hitDefP2ChangeStateTo ?? options.hitDefP2StateNo}, Return To Self]
type = SelfState
trigger1 = Time >= ${options.hitDefP2SelfStateAfter}
value = 0
ctrl = 1
`
      : "";
  const extraStateNos = [
    ...(options.extraStateNos ?? []),
    ...(options.moveHitStateNo === undefined ? [] : [options.moveHitStateNo]),
    ...(options.moveHitCounterStateNo === undefined ? [] : [options.moveHitCounterStateNo]),
    ...(options.hitCountStateNo === undefined ? [] : [options.hitCountStateNo]),
    ...(options.moveReversedStateNo === undefined ? [] : [options.moveReversedStateNo]),
    ...(options.moveGuardStateNo === undefined ? [] : [options.moveGuardStateNo]),
    ...(options.hitDefAttrStateNo === undefined ? [] : [options.hitDefAttrStateNo]),
    ...(options.projHitStateNo === undefined ? [] : [options.projHitStateNo]),
    ...(options.projGuardStateNo === undefined ? [] : [options.projGuardStateNo]),
    ...(options.withPrevMoveTypeBranch === undefined
      ? []
      : [options.withPrevMoveTypeBranch.intermediateStateNo, options.withPrevMoveTypeBranch.finalStateNo]),
    ...(options.withPrevAnimBranch === undefined
      ? []
      : [
          options.withPrevAnimBranch.previousAnimNo,
          options.withPrevAnimBranch.intermediateStateNo,
          options.withPrevAnimBranch.finalStateNo,
        ]),
    ...(options.withPrevStateTypeBranch === undefined
      ? []
      : [options.withPrevStateTypeBranch.intermediateStateNo, options.withPrevStateTypeBranch.finalStateNo]),
  ];
  const extraStates = [...new Set(extraStateNos)]
    .map(
      (stateNo) => `
[Statedef ${stateNo}]
type = S
movetype = H
physics = N
anim = ${stateNo}
ctrl = 0
`,
    )
    .join("");
  const defaultGetHitState = options.defaultGetHitStateNo
    ? `
[Statedef ${options.defaultGetHitStateNo}]
type = S
movetype = H
physics = N
anim = ${options.defaultGetHitStateNo}
ctrl = 0
`
    : "";
  const fallHitDef = options.withFallHitDef
    ? `
fall = 1
fall.damage = 70
fall.defence_up = ${options.fallDefenceUp ?? 150}
${options.fallKill === undefined ? "" : `fall.kill = ${options.fallKill ? 1 : 0}`}
fall.xvelocity = -3
fall.yvelocity = -6
fall.recover = 0
fall.recovertime = 30
${options.downRecoverTime === undefined ? "" : `down.recovertime = ${options.downRecoverTime}`}
fall.envshake.time = 15
fall.envshake.freq = 178
fall.envshake.ampl = 6
fall.envshake.phase = 0
`
    : "";
  const passiveControllers = [
    options.passivePreTagVarSet
      ? `
[State 0, Pre Tag Variable]
type = VarSet
trigger1 = ${options.passivePreTagVarSet.trigger}
v = ${options.passivePreTagVarSet.index}
value = ${options.passivePreTagVarSet.value}
`
      : "",
    options.passiveNotHitBy
      ? `
[State 0, Invulnerable Attrs]
type = NotHitBy
trigger1 = 1
value = ${options.passiveNotHitBy}
time = 3
`
      : "",
    options.passiveHitBy
      ? `
[State 0, Allowed Attrs]
type = HitBy
trigger1 = 1
value = ${options.passiveHitBy}
time = 3
`
      : "",
    options.defenseMultiplier !== undefined
      ? `
[State 0, Defence Scale]
type = DefenceMulSet
trigger1 = 1
value = ${options.defenseMultiplier}
`
      : "",
    options.passiveHitOverride
      ? `
[State 0, Hit Override]
type = HitOverride
trigger1 = 1
attr = ${options.passiveHitOverride.attr}
stateno = ${options.passiveHitOverride.stateNo}
slot = 1
time = 12
forceair = ${options.passiveHitOverride.forceAir ? 1 : 0}
`
      : "",
    options.passiveReversalDef
      ? `
[State 0, Reversal Counter]
type = ReversalDef
trigger1 = 1
reversal.attr = ${options.passiveReversalDef.attr}
pausetime = ${options.passiveReversalDef.hitPause ?? 0},${options.passiveReversalDef.hitPause ?? 0}
p1stateno = ${options.passiveReversalDef.p1StateNo}
${options.passiveReversalDef.p2StateNo !== undefined ? `p2stateno = ${options.passiveReversalDef.p2StateNo}` : ""}
`
      : "",
    options.passiveAssertSpecialFlags?.length
      ? `
[State 0, Passive AssertSpecial]
type = AssertSpecial
trigger1 = ${options.passiveAssertSpecialTrigger ?? "1"}
flag = ${options.passiveAssertSpecialFlags.join(", ")}
`
      : "",
    options.passiveTagController
      ? `
[State 0, Passive Team Standby]
type = ${options.passiveTagController}
trigger1 = 1
${options.passiveTagRedirectId === undefined ? "" : `redirectid = ${options.passiveTagRedirectId}`}
${options.passiveTagSelf === undefined ? "" : `self = ${options.passiveTagSelf}`}
${options.passiveTagPartner === undefined ? "" : `partner = ${options.passiveTagPartner}`}
${options.passiveTagStateNo === undefined ? "" : `stateno = ${options.passiveTagStateNo}`}
${options.passiveTagPartnerStateNo === undefined ? "" : `partnerstateno = ${options.passiveTagPartnerStateNo}`}
${options.passiveTagControl === undefined ? "" : `ctrl = ${options.passiveTagControl}`}
${options.passiveTagPartnerControl === undefined ? "" : `partnerctrl = ${options.passiveTagPartnerControl}`}
${options.passiveTagMemberNo === undefined ? "" : `memberno = ${options.passiveTagMemberNo}`}
${options.passiveTagLeader === undefined ? "" : `leader = ${options.passiveTagLeader}`}
`
      : "",
    options.passiveVarSet
      ? `
[State 0, Passive Variable]
type = VarSet
trigger1 = ${options.passiveVarSet.trigger}
v = ${options.passiveVarSet.index}
value = ${options.passiveVarSet.value}
`
      : "",
    options.passiveRemoveOnGetHitExplod
      ? `
[State 0, Passive RemoveOnGetHit Explod]
type = Explod
trigger1 = Time = 0
id = 9004
anim = 900
pos = 18,-54
postype = p1
removetime = -1
removeongethit = 1
sprpriority = 6
trans = add
`
      : "",
  ].join("");
  const attackMultiplier = options.attackMultiplier !== undefined
    ? `
[State 200, Attack Scale]
type = AttackMulSet
trigger1 = Time = 0
value = ${options.attackMultiplier}
`
    : "";
  const paletteUtilities = options.withPaletteUtilities
    ? `
[State 200, Palette Remap]
type = RemapPal
trigger1 = Time = 0
source = 1,1
dest = 2,3

[State 200, Browser Feedback Noop]
type = ForceFeedback
trigger1 = Time = 0
time = 8
`
    : "";
  const sideEffects = options.withSideEffects
    ? `
[State 200, Width]
type = Width
trigger1 = Time = 0
player = 18,44

[State 200, Sound]
type = PlaySnd
trigger1 = Time = 0
value = S5,0
channel = 0

[State 200, Priority]
type = SprPriority
trigger1 = Time = 0
value = 5

[State 200, Flash]
type = PalFX
trigger1 = Time = 0
time = 18
add = 80,0,0
mul = 256,160,160
color = 256

[State 200, Trail]
type = AfterImage
trigger1 = Time = 0
time = 20
length = 4
timegap = 2
framegap = 1
paladd = 0,40,90
palmul = 160,160,256
trans = add

[State 200, Spark]
type = Explod
trigger1 = Time = 0
id = 9000
anim = 900
pos = 42,-58
postype = p1
removetime = 18
sprpriority = 6
trans = add

[State 200, Shake]
type = EnvShake
trigger1 = Time = 0
time = 12
freq = 30
ampl = -6
phase = 0
`
    : "";
  const runtimeFlags = options.withRuntimeFlags
    ? `
[State 200, Flip]
type = Turn
trigger1 = Time = 0

[State 200, No Push]
type = PlayerPush
trigger1 = Time = 0
value = 0

[State 200, Metadata]
type = StateTypeSet
trigger1 = Time = 0
statetype = C
movetype = A
physics = N

[State 200, Fixed Life]
type = LifeSet
trigger1 = Time = 0
value = 777

[State 200, Fixed Power]
type = PowerSet
trigger1 = Time = 0
value = 1234
`
    : "";
  const posFreeze = options.withPosFreeze
    ? `
[State 200, Freeze Position]
type = PosFreeze
trigger1 = Time = 0
x = 1
y = 1
`
    : "";
  const screenBound = options.withScreenBoundOff
    ? `
[State 200, Offscreen Allowed]
type = ScreenBound
trigger1 = Time = 0
value = 0
movecamera = 0,1
`
    : "";
  const projectile = options.withProjectile
    ? `
[State 200, Fireball]
type = Projectile
trigger1 = Time = 0
projid = 77
projanim = 910
offset = 62,-45
velocity = 12,0
projremovetime = 60
damage = 31
pausetime = 4,4
ground.hittime = 13
ground.velocity = -5
sprpriority = 7
`
    : "";
  const helper = options.withHelper
    ? `
[State 200, Buddy]
type = Helper
trigger1 = Time = 0
id = 42
name = "Buddy"
stateno = 1200
pos = -44,-28
postype = p1
facing = 1
sprpriority = 8
removetime = ${options.helperRemoveTime ?? 30}
`
    : "";
  const helperRedirectTag = options.helperRedirectTag
    ? `
[State 200, Blocked Helper Tag redirect]
type = TagOut
trigger1 = Time = 0
redirectid = 58
self = 1
`
    : "";
  const targetControllers = options.withTargetControllers
    ? `
[State 200, Target Damage]
type = TargetLifeAdd
trigger1 = Time = 1
id = ${hitDefTargetId}
value = -20

[State 200, Target Meter]
type = TargetPowerAdd
trigger1 = Time = 1
id = ${hitDefTargetId}
value = 40

[State 200, Target Velocity Set]
type = TargetVelSet
trigger1 = Time = 1
id = ${hitDefTargetId}
x = 3
y = -4

[State 200, Target Velocity Add]
type = TargetVelAdd
trigger1 = Time = 1
id = ${hitDefTargetId}
x = 2
y = 1

[State 200, Target Face]
type = TargetFacing
trigger1 = Time = 1
id = ${hitDefTargetId}
value = 1

[State 200, Target Bind]
type = TargetBind
trigger1 = Time = 1
id = ${hitDefTargetId}
pos = 36,-12
time = 4

[State 200, Target State]
type = TargetState
trigger1 = Time = 1
id = ${hitDefTargetId}
value = 500

`
    : "";
  const targetDrop = options.withTargetDrop
    ? `
[State 200, Target Drop]
type = TargetDrop
trigger1 = Time = 1
excludeID = -1
keepone = 0
`
    : "";
  const bindToTarget = options.withBindToTarget
    ? `
[State 200, Bind Owner To Target]
type = BindToTarget
trigger1 = Time = 1
id = ${hitDefTargetId}
pos = 20,-8,${options.bindToTargetPostype ?? "Foot"}
time = 4
`
    : "";
  const prePauseTargetBind = options.withPrePauseTargetBind
    ? `
[State 200, Target Bind Before Pause]
type = TargetBind
trigger1 = Time = 2
id = ${hitDefTargetId}
pos = 36,-12
time = 4
`
    : "";
  const pauseControllers = [
    options.withPause
      ? `
[State 200, Pause]
type = Pause
trigger1 = Time = 0
time = 6
movetime = 2
`
      : "",
    options.withSuperPause
      ? `
[State 200, Super Pause]
type = SuperPause
trigger1 = Time = 0
time = 7
movetime = 1
darken = 1
poweradd = 100
${options.superPauseP2DefMul === undefined ? "" : `p2defmul = ${options.superPauseP2DefMul}`}
`
      : "",
    options.withDelayedSuperPause
      ? `
[State 200, Delayed Super Pause]
type = SuperPause
trigger1 = Time = 1
time = 7
movetime = 1
darken = 1
poweradd = 100
${options.superPauseP2DefMul === undefined ? "" : `p2defmul = ${options.superPauseP2DefMul}`}
`
      : "",
  ].join("");
  const pauseMovePosAdd = options.pauseMovePosAdd
    ? `
[State 200, Move During Pause]
type = PosAdd
trigger1 = Time = ${options.pauseMovePosAdd.time ?? 1}
x = ${options.pauseMovePosAdd.x}
y = ${options.pauseMovePosAdd.y}
`
    : "";
  const pauseExplods = options.withPauseExplods
    ? `
[State 200, Frozen Pause Spark]
type = Explod
trigger1 = Time = 0
id = 9100
anim = 900
pos = 42,-58
postype = p1
vel = 2,0
removetime = 30
sprpriority = 6

[State 200, SuperMove Pause Spark]
type = Explod
trigger1 = Time = 0
id = 9101
anim = 900
pos = 42,-46
postype = p1
vel = 4,0
removetime = 30
supermovetime = 4
sprpriority = 7
`
    : "";
  const assertSpecial = options.withAssertSpecial
    ? `
[State 200, Assert Runtime Flags]
type = AssertSpecial
trigger1 = Time = 0
flag = NoAutoTurn
flag2 = NoWalk, Invisible
`
    : "";
  const changeAnim2 = options.withChangeAnim2
    ? `
[State 200, Borrowed Animation]
type = ChangeAnim2
trigger1 = Time = 0
value = 920
`
    : "";
  const changeAnimElem = options.withChangeAnimElem
    ? `
[State 200, Element Animation]
type = ChangeAnim
trigger1 = Time = 0
value = ${options.withChangeAnimElem.animNo}
elem = ${options.withChangeAnimElem.elem}
${options.withChangeAnimElem.elemTime !== undefined ? `elemtime = ${options.withChangeAnimElem.elemTime}` : ""}
`
    : "";
  const changeState = options.withChangeState
    ? `
[State 200, Override State Animation]
type = ChangeState
trigger1 = Time = 0
value = ${options.withChangeState.stateNo}
${options.withChangeState.controllerAnimNo !== undefined ? `anim = ${options.withChangeState.controllerAnimNo}` : ""}
ctrl = 0
`
    : "";
  const animElemTimeVars = options.withAnimElemTimeVars
    ? `
[State 200, Mark Before Elem 2]
type = VarSet
trigger1 = AnimElemTime(2) < 0
var(7) = 70

[State 200, Mark Elem 2 Start]
type = VarSet
trigger1 = AnimElemTime(2) = 0
var(8) = 80

[State 200, Mark Elem 2 Later]
type = VarSet
trigger1 = AnimElemTime(2) = 2
var(9) = 90
`
    : "";
  const contactTriggerBranches = [
    options.withMoveHitReset
      ? `
[State 200, Reset Direct Contact]
type = MoveHitReset
trigger1 = MoveHit >= 1
`
      : "",
    options.moveHitStateNo === undefined
      ? ""
      : `
[State 200, MoveHit Branch]
type = ChangeState
trigger1 = MoveHit
value = ${options.moveHitStateNo}
ctrl = 0
`,
    options.moveHitCounterStateNo === undefined
      ? ""
      : `
[State 200, MoveHit Counter Branch]
type = ChangeState
trigger1 = MoveHit >= 1
value = ${options.moveHitCounterStateNo}
ctrl = 0
`,
    options.hitCountStateNo === undefined
      ? ""
      : `
[State 200, HitCount Branch]
type = ChangeState
trigger1 = HitCount >= 1
trigger1 = UniqHitCount >= 1
value = ${options.hitCountStateNo}
ctrl = 0
`,
    options.moveReversedStateNo === undefined
      ? ""
      : `
[State 200, MoveReversed Branch]
type = ChangeState
trigger1 = MoveReversed >= 1
value = ${options.moveReversedStateNo}
ctrl = 0
`,
    options.moveGuardStateNo === undefined
      ? ""
      : `
[State 200, MoveGuarded Branch]
type = ChangeState
trigger1 = MoveGuarded
value = ${options.moveGuardStateNo}
ctrl = 0
`,
    options.hitDefAttrStateNo === undefined
      ? ""
      : `
[State 200, HitDefAttr Branch]
type = ChangeState
trigger1 = HitDefAttr = SC, NA, SA, HA
trigger1 = MoveContact
value = ${options.hitDefAttrStateNo}
ctrl = 0
`,
    options.projHitStateNo === undefined
      ? ""
      : `
[State 200, ProjHit Branch]
type = ChangeState
trigger1 = ProjHit(77)
value = ${options.projHitStateNo}
ctrl = 0
`,
    options.projGuardStateNo === undefined
      ? ""
      : `
[State 200, ProjGuarded Branch]
type = ChangeState
trigger1 = ProjGuarded(77)
value = ${options.projGuardStateNo}
ctrl = 0
`,
  ].join("");
  const prevStateEntry = options.withPrevStateBranch
    ? `
[State 200, PrevState Entry]
type = ChangeState
trigger1 = Time = 0
value = ${options.withPrevStateBranch.intermediateStateNo}
ctrl = 0
`
    : "";
  const prevMoveTypeEntry = options.withPrevMoveTypeBranch
    ? `
[State 200, PrevMoveType Entry]
type = ChangeState
trigger1 = Time = 0
value = ${options.withPrevMoveTypeBranch.intermediateStateNo}
ctrl = 0
`
    : "";
  const prevAnimEntry = options.withPrevAnimBranch
    ? `
[State 200, PrevAnim Probe]
type = ChangeAnim
trigger1 = Time = 0
value = ${options.withPrevAnimBranch.previousAnimNo}

[State 200, PrevAnim Entry]
type = ChangeState
trigger1 = Time = 0
value = ${options.withPrevAnimBranch.intermediateStateNo}
ctrl = 0
`
    : "";
  const prevStateTypeEntry = options.withPrevStateTypeBranch
    ? `
[State 200, PrevStateType Entry]
type = ChangeState
trigger1 = Time = 0
value = ${options.withPrevStateTypeBranch.intermediateStateNo}
ctrl = 0
`
    : "";
  const prevStateBranchStates = options.withPrevStateBranch
    ? `
[Statedef ${options.withPrevStateBranch.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevStateBranch.intermediateStateNo}
ctrl = 0

[State ${options.withPrevStateBranch.intermediateStateNo}, PrevState Branch]
type = ChangeState
trigger1 = PrevStateNo = 200
value = ${options.withPrevStateBranch.finalStateNo}
ctrl = 1

[Statedef ${options.withPrevStateBranch.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevStateBranch.finalStateNo}
ctrl = 1
`
    : "";
  const prevMoveTypeBranchStates = options.withPrevMoveTypeBranch
    ? `
[Statedef ${options.withPrevMoveTypeBranch.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevMoveTypeBranch.intermediateStateNo}
ctrl = 0

[State ${options.withPrevMoveTypeBranch.intermediateStateNo}, PrevMoveType Branch]
type = ChangeState
trigger1 = PrevMoveType = A
value = ${options.withPrevMoveTypeBranch.finalStateNo}
ctrl = 1

[Statedef ${options.withPrevMoveTypeBranch.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevMoveTypeBranch.finalStateNo}
ctrl = 1
`
    : "";
  const prevAnimBranchStates = options.withPrevAnimBranch
    ? `
[Statedef ${options.withPrevAnimBranch.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevAnimBranch.intermediateStateNo}
ctrl = 0

[State ${options.withPrevAnimBranch.intermediateStateNo}, PrevAnim Branch]
type = ChangeState
trigger1 = PrevAnim = ${options.withPrevAnimBranch.previousAnimNo}
value = ${options.withPrevAnimBranch.finalStateNo}
ctrl = 1

[Statedef ${options.withPrevAnimBranch.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevAnimBranch.finalStateNo}
ctrl = 1
`
    : "";
  const prevStateTypeBranchStates = options.withPrevStateTypeBranch
    ? `
[Statedef ${options.withPrevStateTypeBranch.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevStateTypeBranch.intermediateStateNo}
ctrl = 0

[State ${options.withPrevStateTypeBranch.intermediateStateNo}, PrevStateType Branch]
type = ChangeState
trigger1 = PrevStateType = A
value = ${options.withPrevStateTypeBranch.finalStateNo}
ctrl = 1

[Statedef ${options.withPrevStateTypeBranch.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${options.withPrevStateTypeBranch.finalStateNo}
ctrl = 1
`
    : "";
  const changeStateDef = options.withChangeState
    ? `
[Statedef ${options.withChangeState.stateNo}]
type = S
movetype = I
physics = S
${options.withChangeState.stateAnimNo === null ? "" : `anim = ${options.withChangeState.stateAnimNo ?? options.withChangeState.stateNo}`}
ctrl = 0
`
    : "";
  const commands = parseCmd(`
[Defaults]
command.time = 15

[Command]
name = "x"
command = x

[Command]
name = "QCF_x"
command = ~D, DF, F, x
time = 15

[Command]
name = "holddown"
command = /$D
`).commands;
  const entry = parseCns(`
[State -1, Combo condition Reset]
type = VarSet
trigger1 = 1
var(1) = 0

[State -1, Combo condition Check]
type = VarSet
trigger1 = statetype != A
trigger1 = ctrl
var(1) = 1

[State -1, Light Special]
type = ChangeState
value = 1000
triggerall = command = "QCF_x"
trigger1 = var(1)

[State -1, Stand Light Punch]
type = ChangeState
value = 200
triggerall = command = "x"
triggerall = command != "holddown"
trigger1 = statetype = S
trigger1 = ctrl
`).controllers;
  const stateFile = parseCns(`
[Data]
liedown.time = ${options.dataLiedownTime ?? 60}
${options.dataAttack === undefined ? "" : `attack = ${options.dataAttack}`}
${options.dataDefence === undefined ? "" : `defence = ${options.dataDefence}`}

[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1
${passiveControllers}

[Statedef 200]
type = ${options.attackStateType ?? "S"}
movetype = A
physics = S
anim = 200
ctrl = 0
velset = ${options.stateVelSet ?? "0,0"}

[State 200, End]
type = ChangeState
trigger1 = AnimTime = 0
value = 0
ctrl = 1

${prevStateEntry}
${prevMoveTypeEntry}
${prevAnimEntry}
${prevStateTypeEntry}
[State 200, Runtime HitDef]
type = HitDef
trigger1 = Time = 0
id = ${hitDefTargetId}
attr = ${hitDefAttr}
damage = ${damageLine}
${hitDefKillLine}
priority = ${hitDefPriority}, Hit
${hitSparkLines}
${guardLine}
${hitDefCustomStateLines}
pausetime = 8,8
ground.hittime = 11
ground.velocity = -4
${fallHitDef}

${attackMultiplier}
${paletteUtilities}
${sideEffects}
${runtimeFlags}
${posFreeze}
${screenBound}
${prePauseTargetBind}
${pauseControllers}
${pauseMovePosAdd}
${pauseExplods}
${assertSpecial}
${changeAnim2}
${changeAnimElem}
${changeState}
${animElemTimeVars}
${projectile}
${contactTriggerBranches}
${helper}
${helperRedirectTag}
${targetControllers}
${bindToTarget}
${targetDrop}

${options.passiveHitOverride ? `
[Statedef ${options.passiveHitOverride.stateNo}]
type = ${options.passiveHitOverride.forceAir ? "A" : "S"}
movetype = H
physics = ${options.passiveHitOverride.forceAir ? "A" : "S"}
anim = ${options.passiveHitOverride.stateNo}
ctrl = 0
` : ""}

${options.passiveReversalDef ? `
[Statedef ${options.passiveReversalDef.p1StateNo}]
type = S
movetype = A
physics = S
anim = ${options.passiveReversalDef.p1StateNo}
ctrl = 0
` : ""}

${changeStateDef}
${prevStateBranchStates}
${prevMoveTypeBranchStates}
${prevAnimBranchStates}
${prevStateTypeBranchStates}

${options.hitDefP1StateNo !== undefined ? `
[Statedef ${options.hitDefP1StateNo}]
type = S
movetype = A
physics = S
anim = ${options.hitDefP1StateNo}
ctrl = 0
` : ""}

${options.hitDefP2StateNo !== undefined ? `
[Statedef ${options.hitDefP2StateNo}]
type = S
movetype = H
physics = N
anim = ${options.hitDefP2StateNo}
ctrl = 0
${hitDefP2ChangeAnim2Lines}
${hitDefP2ChangeStateLines}
${options.hitDefP2ChangeStateTo === undefined ? hitDefP2SelfStateLines : ""}
` : ""}

${options.hitDefP2ChangeStateTo !== undefined ? `
[Statedef ${options.hitDefP2ChangeStateTo}]
type = S
movetype = H
physics = N
anim = ${options.hitDefP2ChangeStateTo}
ctrl = 0
${hitDefP2SelfStateLines}
` : ""}

${extraStates}
${defaultGetHitState}

${options.withTargetControllers ? `
[Statedef 500]
type = S
movetype = H
physics = N
anim = 500
ctrl = 0
` : ""}

[Statedef 1000]
type = S
movetype = A
physics = S
anim = 1000
ctrl = 0
velset = 0,0

[Statedef 1200]
type = S
movetype = I
physics = N
anim = 920
ctrl = 0
${options.helperStateControllers ?? ""}
`);
  const move: DemoMove = {
    actionId: 200,
    startup: 1,
    activeStart: 1,
    activeEnd: 4,
    recovery: 60,
    damage: hitDefDamage,
    kill: options.hitDefKill,
    attr: hitDefAttr,
    priority: hitDefPriority,
    hitPause: 8,
    hitStun: 11,
    push: 4,
    guardKill: options.guardKill,
    hitSpark: options.hitSpark,
    guardSpark: options.guardSpark,
    sparkXy: options.hitSpark !== undefined || options.guardSpark !== undefined ? ([10, -72] as [number, number]) : undefined,
    fall: options.withFallHitDef
      ? {
          enabled: true,
          damage: 70,
          kill: options.fallKill,
          velocity: { x: -3, y: -6 },
          recover: false,
          recoverTime: 30,
          ...(options.downRecoverTime === undefined ? {} : { downRecoverTime: options.downRecoverTime }),
          envShake: { time: 15, freq: 178, ampl: 6, phase: 0 },
        }
      : undefined,
    hitbox: { x1: 12, y1: -70, x2: 76, y2: -35 },
  };
  const animations = new Map([
    [
      0,
      fixtureAction(
        0,
        options.passiveReversalDef ? { clsn1: [{ x1: 10, y1: -45, x2: 36, y2: -18 }] } : undefined,
      ),
    ],
    [200, fixtureAction(200)],
    [900, fixtureAction(900)],
    [920, fixtureAction(920)],
    [910, fixtureAction(910)],
    [1000, fixtureAction(1000)],
  ]);
  if (options.passiveHitOverride) {
    animations.set(options.passiveHitOverride.stateNo, fixtureAction(options.passiveHitOverride.stateNo));
  }
  if (options.passiveReversalDef) {
    animations.set(options.passiveReversalDef.p1StateNo, fixtureAction(options.passiveReversalDef.p1StateNo));
    if (options.passiveReversalDef.p2StateNo !== undefined) {
      animations.set(options.passiveReversalDef.p2StateNo, fixtureAction(options.passiveReversalDef.p2StateNo));
    }
  }
  if (options.hitDefP1StateNo !== undefined) {
    animations.set(options.hitDefP1StateNo, fixtureAction(options.hitDefP1StateNo));
  }
  if (options.hitDefP2StateNo !== undefined) {
    animations.set(options.hitDefP2StateNo, fixtureAction(options.hitDefP2StateNo));
  }
  if (options.hitDefP2ChangeStateTo !== undefined) {
    animations.set(options.hitDefP2ChangeStateTo, fixtureAction(options.hitDefP2ChangeStateTo));
  }
  if (options.withTargetControllers) {
    animations.set(500, fixtureAction(500));
  }
  if (options.multiFrameAction) {
    animations.set(options.multiFrameAction.id, fixtureAction(options.multiFrameAction.id, { durations: options.multiFrameAction.durations }));
  }
  for (const stateNo of extraStateNos) {
    animations.set(stateNo, fixtureAction(stateNo));
  }
  if (options.defaultGetHitStateNo !== undefined) {
    animations.set(options.defaultGetHitStateNo, fixtureAction(options.defaultGetHitStateNo));
  }
  if (options.withPrevStateBranch) {
    animations.set(options.withPrevStateBranch.intermediateStateNo, fixtureAction(options.withPrevStateBranch.intermediateStateNo));
    animations.set(options.withPrevStateBranch.finalStateNo, fixtureAction(options.withPrevStateBranch.finalStateNo));
  }
  if (options.withPrevMoveTypeBranch) {
    animations.set(options.withPrevMoveTypeBranch.intermediateStateNo, fixtureAction(options.withPrevMoveTypeBranch.intermediateStateNo));
    animations.set(options.withPrevMoveTypeBranch.finalStateNo, fixtureAction(options.withPrevMoveTypeBranch.finalStateNo));
  }
  if (options.withPrevAnimBranch) {
    animations.set(options.withPrevAnimBranch.previousAnimNo, fixtureAction(options.withPrevAnimBranch.previousAnimNo));
    animations.set(options.withPrevAnimBranch.intermediateStateNo, fixtureAction(options.withPrevAnimBranch.intermediateStateNo));
    animations.set(options.withPrevAnimBranch.finalStateNo, fixtureAction(options.withPrevAnimBranch.finalStateNo));
  }
  if (options.withPrevStateTypeBranch) {
    animations.set(options.withPrevStateTypeBranch.intermediateStateNo, fixtureAction(options.withPrevStateTypeBranch.intermediateStateNo));
    animations.set(options.withPrevStateTypeBranch.finalStateNo, fixtureAction(options.withPrevStateTypeBranch.finalStateNo));
  }

  return {
    id: options.id ?? "imported-fixture",
    source: "imported",
    displayName: options.displayName ?? "Imported Fixture",
    palette: "#fff",
    spriteGroupBase: 0,
    speed: 3,
    jumpVelocity: -9,
    idleAction: 0,
    walkAction: 20,
    crouchAction: 10,
    jumpAction: 40,
    hitstunAction: 500,
    moves: { punch: move, kick: { ...move, actionId: 230 } },
    stateMoves: withStateMove ? new Map([[200, move]]) : new Map(),
    states: stateFile.states,
    stateEntryControllers: entry,
    commands,
    constants: stateFile.constants,
    animations,
    hitSparkLibraries: options.hitSparkLibraries,
  };
}

function createHitPauseBufferFixture(bufferHitPause: boolean): DemoFighterDefinition {
  const commands = parseCmd(`
[Defaults]
command.time = 90
command.buffer.time = 90
command.buffer.hitpause = ${bufferHitPause ? 1 : 0}

[Command]
name = "first"
command = x
time = 5

[Command]
name = "second"
command = y
time = 90
`).commands;
  const entry = parseCns(`
[State -1, Second]
type = ChangeState
value = 210
triggerall = command = "second"
trigger1 = ctrl

[State -1, First]
type = ChangeState
value = 200
triggerall = command = "first"
trigger1 = ctrl
`).controllers;
  const stateFile = parseCns(`
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 1

[State 200, HitPause Starter]
type = HitDef
trigger1 = Time = 0
damage = 1
pausetime = 5,5
ground.hittime = 5
ground.velocity = -1

[Statedef 210]
type = S
movetype = A
physics = S
anim = 210
ctrl = 1
`);
  const move: DemoMove = {
    actionId: 200,
    startup: 1,
    activeStart: 1,
    activeEnd: 2,
    recovery: 6,
    damage: 1,
    hitPause: 5,
    hitStun: 5,
    push: 1,
    hitbox: { x1: 10, y1: -70, x2: 72, y2: -30 },
  };

  return {
    id: `hitpause-buffer-${bufferHitPause ? "on" : "off"}`,
    source: "imported",
    displayName: `HitPause Buffer ${bufferHitPause ? "On" : "Off"}`,
    palette: "#fff",
    spriteGroupBase: 0,
    speed: 3,
    jumpVelocity: -9,
    idleAction: 0,
    walkAction: 20,
    crouchAction: 10,
    jumpAction: 40,
    hitstunAction: 500,
    moves: { punch: move, kick: { ...move, actionId: 210 } },
    stateMoves: new Map(),
    states: stateFile.states,
    stateEntryControllers: entry,
    commands,
    animations: new Map([
      [0, action(0)],
      [200, action(200)],
      [210, action(210)],
      [500, action(500)],
    ]),
  };
}

function createHitPauseIgnoreControllerFixture(ignoreHitPause: boolean): DemoFighterDefinition {
  const commands = parseCmd(`
[Defaults]
command.time = 30
command.buffer.time = 30
command.buffer.hitpause = 1

[Command]
name = "first"
command = x
time = 5
`).commands;
  const entry = parseCns(`
[State -1, First]
type = ChangeState
value = 200
triggerall = command = "first"
trigger1 = ctrl
`).controllers;
  const stateFile = parseCns(`
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 1

[State 200, HitPause Starter]
type = HitDef
trigger1 = Time = 0
damage = 1
pausetime = 5,5
ground.hittime = 5
ground.velocity = -1

[State 200, HitPause Branch]
type = ChangeState
trigger1 = HitPauseTime > 0
ignorehitpause = ${ignoreHitPause ? 1 : 0}
value = 220

[Statedef 220]
type = S
movetype = I
physics = S
anim = 220
ctrl = 1
`);
  const move: DemoMove = {
    actionId: 200,
    startup: 1,
    activeStart: 1,
    activeEnd: 2,
    recovery: 6,
    damage: 1,
    hitPause: 5,
    hitStun: 5,
    push: 1,
    hitbox: { x1: 10, y1: -70, x2: 72, y2: -30 },
  };

  return {
    id: `hitpause-ignore-${ignoreHitPause ? "on" : "off"}`,
    source: "imported",
    displayName: `HitPause Ignore ${ignoreHitPause ? "On" : "Off"}`,
    palette: "#fff",
    spriteGroupBase: 0,
    speed: 3,
    jumpVelocity: -9,
    idleAction: 0,
    walkAction: 20,
    crouchAction: 10,
    jumpAction: 40,
    hitstunAction: 500,
    moves: { punch: move, kick: { ...move, actionId: 220 } },
    stateMoves: new Map(),
    states: stateFile.states,
    stateEntryControllers: entry,
    commands,
    animations: new Map([
      [0, action(0)],
      [200, action(200)],
      [220, action(220)],
      [500, action(500)],
    ]),
  };
}

function action(
  id: number,
  options: { clsn1?: Array<{ x1: number; y1: number; x2: number; y2: number }>; durations?: number[] } = {},
  groupOffset = 0,
): MugenAnimationAction {
  const durations = options.durations?.length ? options.durations : [4];
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: durations.map((duration, index) => ({
      spriteGroup: id + groupOffset,
      spriteIndex: index,
      offsetX: 0,
      offsetY: 0,
      duration,
      clsn1: options.clsn1
        ? options.clsn1
        : id === 200
          ? [{ x1: 12, y1: -70, x2: 76, y2: -35 }]
          : id === 910
            ? [{ x1: 6, y1: -18, x2: 34, y2: 6 }]
            : id === 920
              ? [{ x1: 10, y1: -45, x2: 36, y2: -18 }]
              : [],
      clsn2:
        id === 910
          ? []
          : id === 920
            ? [{ x1: -18, y1: -64, x2: 18, y2: 0 }]
            : [{ x1: -20, y1: -80, x2: 20, y2: 0 }],
      raw: `${id},${index},0,0,${duration}`,
      line: index + 1,
    })),
  };
}
