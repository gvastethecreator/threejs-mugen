import { describe, expect, it } from "vitest";
import { compileStateProgram } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import type { CharacterRuntimeState } from "../mugen/runtime/types";
import {
  advanceRuntimeExplodActors,
  advanceRuntimeHelperActors,
  countRuntimeHelperProjectileActors,
  createRuntimeEffectActorStore,
  hasRuntimeHelperProjectileContact,
  removeRuntimeHelperActors,
  removeRuntimeExplodActors,
  removeRuntimeExplodActorsOnGetHit,
  removeRuntimeProjectilesMarkedForRemoval,
  RuntimeEffectActorWorld,
  runtimeHelperProjectileContactTime,
  runtimeExplodActorsToSnapshots,
  runtimeHelperActorsToSnapshots,
  runtimeProjectileActorsToSnapshots,
  spawnRuntimeExplodActor,
  spawnRuntimeHelperActor,
  spawnRuntimeProjectileActor,
  summarizeRuntimeEffectActorStore,
} from "../mugen/runtime/EffectActorSystem";
import { advanceRuntimeProjectiles, markRuntimeProjectileForRemoval, recordRuntimeProjectileContact } from "../mugen/runtime/ProjectileSystem";

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

  it("owns explicit helper removal by id, serial, and owner store", () => {
    const store = createRuntimeEffectActorStore();

    spawnRuntimeHelperActor(store, "p1", helperInput({ id: "20", name: '"First"' }));
    spawnRuntimeHelperActor(store, "p1", helperInput({ id: "20", name: '"Second"' }));
    spawnRuntimeHelperActor(store, "p1", helperInput({ id: "21", name: '"Third"' }));

    expect(removeRuntimeHelperActors(store, { helperId: 20 })).toBe(2);
    expect(store.helpers.map((helper) => helper.helperId)).toEqual([21]);

    const serialId = store.helpers[0]!.serialId;
    expect(removeRuntimeHelperActors(store, { serialId })).toBe(1);
    expect(store.helpers).toEqual([]);

    spawnRuntimeHelperActor(store, "p1", helperInput({ id: "22" }));
    spawnRuntimeHelperActor(store, "p1", helperInput({ id: "23" }));
    expect(removeRuntimeHelperActors(store)).toBe(2);
    expect(store.helpers).toEqual([]);
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

  it("removes helpers through the runtime world without crossing owner stores", () => {
    const world = new RuntimeEffectActorWorld();

    world.spawnHelper("p1", helperInput({ id: "42", name: '"P1 A"' }));
    world.spawnHelper("p1", helperInput({ id: "43", name: '"P1 B"' }));
    world.spawnHelper("p2", helperInput({ id: "42", name: '"P2 A"' }));

    expect(world.removeHelpers("p1", 42)).toBe(1);
    expect(world.countActors("p1", "helper")).toBe(1);
    expect(world.countActors("p2", "helper")).toBe(1);

    const p1Serial = world.getStore("p1").helpers[0]!.serialId;
    expect(world.destroyHelper("p1", p1Serial)).toBe(true);
    expect(world.destroyHelper("p1", p1Serial)).toBe(false);
    expect(world.countActors("p1", "helper")).toBe(0);
    expect(world.countActors("p2", "helper", 42)).toBe(1);

    expect(world.removeHelpers("p2")).toBe(1);
    expect(world.countActors("p2", "helper")).toBe(0);
  });

  it("runs a bounded helper-local state program for movement and animation", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("VelSet", { x: "3", y: "-1" }, ["Time = 0"]),
              controller("ChangeAnim", { value: "901" }, ["Time = 0"]),
            ]),
          ),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      stageTime: 10,
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["VelSet", "ChangeAnim"]);
    expect(helper).toMatchObject({
      animNo: 901,
      vel: { x: 3, y: -1 },
      pos: { x: 3, y: -1 },
      stateTime: 1,
      age: 1,
    });
  });

  it("runs bounded helper-local ChangeState and DestroySelf controllers", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(state(6000, 900, [controller("ChangeState", { value: "6001" }, ["Time = 0"])])),
          compileStateProgram(state(6001, 901, [controller("DestroySelf", {}, ["Time >= 1"])])),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
      ]),
    });

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } });

    expect(store.helpers[0]).toBe(helper);
    expect(helper).toMatchObject({
      stateNo: 6001,
      animNo: 901,
      stateTime: 1,
      age: 1,
    });

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } });

    expect(store.helpers).toEqual([]);
  });

  it("persists helper-local metadata, control, and variables for later triggers", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("StateTypeSet", { statetype: "A", movetype: "A", physics: "N" }, ["Time = 0"]),
              controller("CtrlSet", { value: "1" }, ["Time = 0"]),
              controller("VarSet", { v: "3", value: "7" }, ["Time = 0"]),
              controller("VarAdd", { v: "3", value: "5" }, ["Time = 0"]),
              controller("VarRandom", { v: "8", range: "20,20" }, ["Time = 0"]),
              controller("VarRangeSet", { first: "5", last: "6", value: "9" }, ["Time = 0"]),
              controller("VarSet", { fv: "2", value: "1.5" }, ["Time = 0"]),
              controller(
                "ChangeState",
                { value: "6002" },
                ["var(3) = 12", "var(5) = 9", "var(8) = 20", "fvar(2) = 1.5", "ctrl", "statetype = A", "movetype = A", "physics = N"],
              ),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [902, action(902, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["StateTypeSet", "CtrlSet", "VarSet", "VarAdd", "VarRandom", "VarRangeSet", "VarSet", "ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6002,
      animNo: 902,
      ctrl: true,
      stateType: "A",
      moveType: "A",
      physics: "N",
      stateTime: 1,
      age: 1,
    });
    expect(helper.vars[3]).toBe(12);
    expect(helper.vars.slice(5, 7)).toEqual([9, 9]);
    expect(helper.vars[8]).toBe(20);
    expect(helper.fvars[2]).toBe(1.5);
  });

  it("persists helper-local life and power resources for later triggers and snapshots", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("LifeAdd", { value: "-200", kill: "0" }, ["Time = 0"]),
              controller("PowerAdd", { value: "250" }, ["Time = 0"]),
              controller("LifeSet", { value: "950" }, ["Time = 0"]),
              controller("PowerSet", { value: "900" }, ["Time = 0"]),
              controller("ChangeState", { value: "6002" }, ["life = 950", "lifemax = 1000", "power = 900", "powermax = 3000"]),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [902, action(902, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["LifeAdd", "PowerAdd", "LifeSet", "PowerSet", "ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6002,
      animNo: 902,
      lifeMax: 1000,
      life: 950,
      powerMax: 3000,
      power: 900,
      stateTime: 1,
      age: 1,
    });
    expect(runtimeHelperActorsToSnapshots(store, 200)[0]?.runtime).toMatchObject({
      lifeMax: 1000,
      life: 950,
      powerMax: 3000,
      power: 900,
    });
  });

  it("evaluates bounded helper parent and root redirects against owner runtime state", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("VarSet", { v: "3", value: "99" }, ["Time = 0"]),
              controller("CtrlSet", { value: "1" }, ["Time = 0 && Parent,Var(3) = 7"]),
              controller("ChangeAnim", { value: "901" }, ["IfElse(Parent,StateNo = 200, 1, 0)"]),
              controller("ChangeState", { value: "1 + Root,Var(5) + Parent,Var(6)" }, ["Time = 0 && Root,Vel X = 4"]),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
      ]),
    });
    const ownerState = actor("p1", "Owner", {
      stateNo: 200,
      animNo: 201,
      vel: { x: 4, y: 0 },
      vars: Array.from({ length: 60 }, (_value, index) => (index === 3 ? 7 : index === 5 ? 5999 : index === 6 ? 2 : 0)),
    }).runtime;
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      parentState: ownerState,
      rootState: ownerState,
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["VarSet", "CtrlSet", "ChangeAnim", "ChangeState"]);
    expect(ownerState.vars[3]).toBe(7);
    expect(helper.vars[3]).toBe(99);
    expect(helper).toMatchObject({
      stateNo: 6002,
      animNo: 902,
      ctrl: true,
      stateTime: 1,
      age: 1,
    });
  });

  it("applies bounded helper-local BindToParent against owner runtime state", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("BindToParent", { pos: "24,-18", time: "2", facing: "-1" }, ["Time = 0"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(state(6001, 901)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
      ]),
    });
    const ownerState = actor("p1", "Owner", { pos: { x: 100, y: 5 }, facing: -1 }).runtime;
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      parentState: ownerState,
      rootState: ownerState,
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["BindToParent", "ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6001,
      animNo: 901,
      pos: { x: 76, y: -13 },
      facing: 1,
      stateTime: 1,
      age: 1,
    });
    expect(helper.ownerBind).toMatchObject({ target: "parent", offset: { x: 24, y: -18 }, remaining: 1 });

    ownerState.pos = { x: 80, y: 6 };
    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      parentState: ownerState,
      rootState: ownerState,
    });

    expect(helper.pos).toEqual({ x: 56, y: -12 });
    expect(helper.ownerBind).toBeUndefined();
  });

  it("applies bounded helper-local BindToRoot against root runtime state", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(state(6000, 900, [controller("BindToRoot", { pos: "5,-10", time: "1" }, ["Time = 0"])])),
        ],
      },
      animations: new Map([[900, action(900, 4)]]),
    });
    const rootState = actor("p1", "Root", { pos: { x: 30, y: 7 }, facing: 1 }).runtime;

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      rootState,
    });

    expect(helper).toMatchObject({
      pos: { x: 35, y: -3 },
      stateTime: 1,
      age: 1,
    });
    expect(helper.ownerBind).toBeUndefined();
  });

  it("does not execute helper-local BindToParent when owner runtime state is missing", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [compileStateProgram(state(6000, 900, [controller("BindToParent", { pos: "24,-18", time: "2" }, ["Time = 0"])]))],
      },
      animations: new Map([[900, action(900, 4)]]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual([]);
    expect(helper).toMatchObject({
      pos: { x: 0, y: 0 },
      stateTime: 1,
      age: 1,
    });
    expect(helper.ownerBind).toBeUndefined();
  });

  it("evaluates bounded helper EnemyNear redirects against opponent runtime state", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("ChangeAnim", { value: "901" }, ["Time = 0 && EnemyNear,StateNo = 5000"]),
              controller("ChangeState", { value: "6000 + EnemyNear,Var(3)" }, ["EnemyNear,Life = 777", "EnemyNear,Pos X = 64"]),
            ]),
          ),
          compileStateProgram(state(6004, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
      ]),
    });
    const opponentState = actor("p2", "Opponent", {
      stateNo: 5000,
      life: 777,
      pos: { x: 64, y: 0 },
      vars: Array.from({ length: 60 }, (_value, index) => (index === 3 ? 4 : 0)),
    }).runtime;
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      opponentState,
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["ChangeAnim", "ChangeState"]);
    expect(opponentState.vars[3]).toBe(4);
    expect(helper).toMatchObject({
      stateNo: 6004,
      animNo: 902,
      stateTime: 1,
      age: 1,
    });
  });

  it("does not satisfy helper EnemyNear redirects when opponent runtime state is missing", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("ChangeAnim", { value: "901" }, ["EnemyNear,StateNo = 5000"]),
              controller("ChangeState", { value: "6004" }, ["EnemyNear,Life = 777"]),
            ]),
          ),
          compileStateProgram(state(6004, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual([]);
    expect(helper).toMatchObject({
      stateNo: 6000,
      animNo: 900,
      stateTime: 1,
      age: 1,
    });
  });

  it("evaluates bounded helper identity triggers inside the helper-local micro-VM", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("ChangeAnim", { value: "901" }, ["Time = 0 && IsHelper"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0 && IsHelper(42)"]),
              controller("VarSet", { v: "3", value: "13" }, ["Time = 0 && IsHelper(43)"]),
            ]),
          ),
          compileStateProgram(state(6001, 901)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["ChangeAnim", "ChangeState"]);
    expect(helper.vars[3]).toBe(0);
    expect(helper).toMatchObject({
      stateNo: 6001,
      animNo: 901,
      stateTime: 1,
      age: 1,
    });
  });

  it("does not satisfy helper parent and root redirects when owner runtime state is missing", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("VarSet", { v: "3", value: "99" }, ["Time = 0"]),
              controller("CtrlSet", { value: "1" }, ["Parent,Var(3) = 7"]),
              controller("ChangeState", { value: "Root,Var(5)" }, ["Root,Vel X = 4"]),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [902, action(902, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["VarSet"]);
    expect(helper.vars[3]).toBe(99);
    expect(helper).toMatchObject({
      stateNo: 6000,
      animNo: 900,
      ctrl: false,
      stateTime: 1,
      age: 1,
    });
  });

  it("emits bounded helper-local sound events into helper snapshots", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("PlaySnd", { value: "S7,3", channel: "4" }, ["Time = 0"]),
              controller("StopSnd", { channel: "4" }, ["Time = 0"]),
            ]),
          ),
        ],
      },
      animations: new Map([[900, action(900, 4)]]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      runtimeTick: 123,
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["PlaySnd", "StopSnd"]);
    expect(helper.soundEvents).toEqual([
      { type: "StopSnd", channel: 4, raw: undefined, stateNo: 6000, tick: 0, runtimeTick: 123 },
      { type: "PlaySnd", group: 7, index: 3, channel: 4, raw: "S7,3", stateNo: 6000, tick: 0, runtimeTick: 123 },
    ]);
    expect(runtimeHelperActorsToSnapshots(store, 200)[0]?.soundEvents).toEqual(helper.soundEvents);
  });

  it("spawns bounded helper-local Explod actors with helper ownership metadata", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("Explod", { id: "8800", anim: "930", pos: "12,-6", sprpriority: "6", removetime: "8", vel: "2,0" }, ["Time = 0"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(state(6001, 901)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [930, action(930, 4)],
      ]),
      pos: { x: 30, y: -10 },
      fallbackFacing: -1,
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["Explod", "ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6001,
      animNo: 901,
      stateTime: 1,
      age: 1,
    });
    expect(store.explods).toHaveLength(1);
    expect(store.explods[0]).toMatchObject({
      serialId: "p1-explod-0",
      explodId: 8800,
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1-helper-0",
      spriteOwnerId: "p1",
      animNo: 930,
      pos: { x: 18, y: -16 },
      vel: { x: 2, y: 0 },
      facing: -1,
      removeTime: 8,
      spritePriority: 6,
    });
    expect(runtimeExplodActorsToSnapshots(store, 200)[0]).toMatchObject({
      id: "p1-explod-0",
      actorKind: "explod",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1-helper-0",
      effect: { kind: "explod", id: 8800, removeTime: 8, spritePriority: 6 },
      runtime: { pos: { x: 18, y: -16 }, facing: -1, animNo: 930 },
    });
  });

  it("removes bounded helper-local Explod actors by id from the owner store", () => {
    const store = createRuntimeEffectActorStore();
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("Explod", { id: "8810", anim: "930", pos: "12,-6", removetime: "80" }, ["Time = 0"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(
            state(6001, 901, [
              controller("RemoveExplod", { id: "8810" }, ["Time = 1"]),
              controller("ChangeState", { value: "6002" }, ["Time = 1"]),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
        [930, action(930, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(store.explods.map((explod) => explod.explodId)).toEqual([8810]);
    expect(runtimeExplodActorsToSnapshots(store, 200)[0]).toMatchObject({
      id: "p1-explod-0",
      parentId: "p1-helper-0",
      effect: { kind: "explod", id: 8810, removeTime: 80 },
    });

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["Explod", "ChangeState", "RemoveExplod", "ChangeState"]);
    expect(store.explods).toEqual([]);
    expect(helper).toMatchObject({
      stateNo: 6002,
      animNo: 902,
      stateTime: 1,
      age: 2,
    });
  });

  it("treats helper-local RemoveExplod without a matching actor as a supported no-op", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("RemoveExplod", { id: "4040" }, ["Time = 0"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(state(6001, 901)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
      ]),
    });
    const executed: string[] = [];
    const unsupported: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
      onUnsupportedController: (_helper, item) => unsupported.push(item.type),
    });

    expect(executed).toEqual(["RemoveExplod", "ChangeState"]);
    expect(unsupported).toEqual([]);
    expect(store.explods).toEqual([]);
    expect(store.helpers[0]).toMatchObject({
      stateNo: 6001,
      animNo: 901,
    });
  });

  it("modifies only helper-parented Explod actors by id from the helper-local micro-VM", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "8820", anim: "930", removetime: "30", sprpriority: "3" }));
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("Explod", { id: "8820", anim: "930", pos: "12,-6", removetime: "80", sprpriority: "4" }, ["Time = 0"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(
            state(6001, 901, [
              controller(
                "ModifyExplod",
                {
                  id: "8820",
                  vel: "4,-2",
                  accel: ".5,1",
                  scale: "1.5,.75",
                  removetime: "99",
                  removeongethit: "1",
                  ignorehitpause: "1",
                  pausemovetime: "12",
                  supermovetime: "13",
                  sprpriority: "9",
                  trans: "add",
                },
                ["Time = 1"],
              ),
              controller("ChangeState", { value: "6002" }, ["Time = 1"]),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
        [930, action(930, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });
    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    const playerExplod = store.explods.find((explod) => explod.parentId === "p1");
    const helperExplod = store.explods.find((explod) => explod.parentId === "p1-helper-0");
    expect(executed).toEqual(["Explod", "ChangeState", "ModifyExplod", "ChangeState"]);
    expect(playerExplod).toMatchObject({
      explodId: 8820,
      parentId: "p1",
      vel: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      removeTime: 30,
      spritePriority: 3,
      removeOnGetHit: false,
      ignoreHitPause: false,
    });
    expect(helperExplod).toMatchObject({
      explodId: 8820,
      parentId: "p1-helper-0",
      vel: { x: 4, y: -2 },
      accel: { x: 0.5, y: 1 },
      scale: { x: 1.5, y: 0.75 },
      removeTime: 99,
      removeOnGetHit: true,
      ignoreHitPause: true,
      pauseMoveTime: 12,
      superMoveTime: 13,
      spritePriority: 9,
      opacity: 0.78,
    });
    expect(helper).toMatchObject({
      stateNo: 6002,
      animNo: 902,
      stateTime: 1,
      age: 2,
    });
  });

  it("evaluates helper-local NumExplod against only helper-parented Explod actors", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeExplodActor(store, "p1", explodInput({ id: "8840", anim: "930", removetime: "30" }));
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("ChangeState", { value: "6199" }, ["NumExplod(8840) > 0"]),
              controller("Explod", { id: "8830", anim: "930", pos: "12,-6", removetime: "80" }, ["Time = 0"]),
              controller("ChangeState", { value: "6101" }, ["NumExplod(8830) > 0"]),
            ]),
          ),
          compileStateProgram(state(6101, 901)),
          compileStateProgram(state(6199, 999)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [930, action(930, 4)],
        [999, action(999, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["Explod", "ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6101,
      animNo: 901,
      stateTime: 1,
      age: 1,
    });
    expect(store.explods.filter((explod) => explod.explodId === 8840)).toHaveLength(1);
    expect(store.explods.filter((explod) => explod.explodId === 8830 && explod.parentId === "p1-helper-0")).toHaveLength(1);
  });

  it("spawns owner-side Projectile actors from the helper-local micro-VM", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller(
                "Projectile",
                {
                  projid: "8850",
                  projanim: "930",
                  projhitanim: "931",
                  offset: "18,-20",
                  velocity: "5,0",
                  projremovetime: "24",
                  damage: "20,3",
                  sprpriority: "6",
                },
                ["Time = 0"],
              ),
            ]),
          ),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [930, action(930, 4)],
        [931, action(931, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["Projectile"]);
    expect(store.projectiles).toHaveLength(1);
    expect(store.projectiles[0]).toMatchObject({
      serialId: "p1-projectile-0",
      projectileId: 8850,
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1-helper-0",
      animNo: 930,
      hitAnimNo: 931,
      pos: { x: 18, y: -20 },
      vel: { x: 5, y: 0 },
      removeTime: 24,
      spritePriority: 6,
    });
  });

  it("modifies only helper-parented Projectile actors by id from the helper-local micro-VM", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeProjectileActor(store, "p1", projectileInput({ projid: "8860", projanim: "930", velocity: "1,0", projpriority: "2", projhits: "1" }));
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller(
                "Projectile",
                {
                  projid: "8860",
                  projanim: "930",
                  velocity: "1,0",
                  projpriority: "2",
                  projhits: "1",
                  projmisstime: "0",
                  projremovetime: "24",
                  projremove: "1",
                },
                ["Time = 0"],
              ),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(
            state(6001, 901, [
              controller(
                "ModifyProjectile",
                {
                  projid: "8860",
                  velocity: "6,-1",
                  accel: ".5,.25",
                  velmul: "1.25,.5",
                  projscale: "2,.75",
                  projremovetime: "88",
                  sprpriority: "8",
                  projpriority: "4",
                  projhits: "3",
                  projmisstime: "7",
                  projremove: "0",
                },
                ["Time = 1"],
              ),
              controller("ChangeState", { value: "6002" }, ["Time = 1"]),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
        [930, action(930, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });
    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    const playerProjectile = store.projectiles.find((projectile) => projectile.parentId === "p1");
    const helperProjectile = store.projectiles.find((projectile) => projectile.parentId === "p1-helper-0");
    expect(executed).toEqual(["Projectile", "ChangeState", "ModifyProjectile", "ChangeState"]);
    expect(playerProjectile).toMatchObject({
      projectileId: 8860,
      parentId: "p1",
      vel: { x: 1, y: 0 },
      scale: { x: 1, y: 1 },
      removeTime: -1,
      spritePriority: 4,
      priority: 2,
      hitsRemaining: 1,
      missTime: 0,
      removeOnHit: true,
    });
    expect(helperProjectile).toMatchObject({
      projectileId: 8860,
      parentId: "p1-helper-0",
      vel: { x: 6, y: -1 },
      accel: { x: 0.5, y: 0.25 },
      velMul: { x: 1.25, y: 0.5 },
      scale: { x: 2, y: 0.75 },
      removeTime: 88,
      spritePriority: 8,
      priority: 4,
      hitsRemaining: 3,
      missTime: 7,
      removeOnHit: false,
    });
    expect(helper).toMatchObject({
      stateNo: 6002,
      animNo: 902,
      stateTime: 1,
      age: 2,
    });
  });

  it("evaluates helper-local ProjHit against only helper-parented Projectile contact", () => {
    const store = createRuntimeEffectActorStore();
    const playerProjectile = spawnRuntimeProjectileActor(store, "p1", projectileInput({ projid: "8870", projanim: "930", projremove: "0" }));
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("Projectile", { projid: "8870", projanim: "930", projremove: "0" }, ["Time = 0"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(
            state(6001, 901, [
              controller("ChangeState", { value: "6199" }, ["ProjGuarded(8870)"]),
              controller("ChangeState", { value: "6101" }, ["ProjHit(8870)", "ProjHitTime(8870) >= 0"]),
            ]),
          ),
          compileStateProgram(state(6101, 902)),
          compileStateProgram(state(6199, 999)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
        [930, action(930, 4)],
        [999, action(999, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });
    const helperProjectile = store.projectiles.find((projectile) => projectile.parentId === helper.serialId)!;
    recordRuntimeProjectileContact(playerProjectile, "hit");

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(helper).toMatchObject({ stateNo: 6001, animNo: 901 });
    expect(hasRuntimeHelperProjectileContact(store, helper, "hit", 8870)).toBe(false);

    recordRuntimeProjectileContact(helperProjectile, "hit");
    expect(hasRuntimeHelperProjectileContact(store, helper, "contact", 8870)).toBe(true);
    expect(hasRuntimeHelperProjectileContact(store, helper, "hit", 8870)).toBe(true);
    expect(hasRuntimeHelperProjectileContact(store, helper, "guard", 8870)).toBe(false);
    expect(runtimeHelperProjectileContactTime(store, helper, "hit", 8870)).toBe(0);
    advanceRuntimeProjectiles([helperProjectile], { bounds: { left: -160, right: 160 } });
    expect(runtimeHelperProjectileContactTime(store, helper, "hit", 8870)).toBe(1);

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["Projectile", "ChangeState", "ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6101,
      animNo: 902,
    });
  });

  it("evaluates helper-local ProjGuardedTime against only helper-parented Projectile guard contact", () => {
    const store = createRuntimeEffectActorStore();
    const playerProjectile = spawnRuntimeProjectileActor(store, "p1", projectileInput({ projid: "8871", projanim: "930", projremove: "0" }));
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("Projectile", { projid: "8871", projanim: "930", projremove: "0" }, ["Time = 0"]),
              controller("ChangeState", { value: "6001" }, ["Time = 0"]),
            ]),
          ),
          compileStateProgram(
            state(6001, 901, [
              controller("ChangeState", { value: "6298" }, ["ProjHit(8871)"]),
              controller("ChangeState", { value: "6002" }, ["ProjGuarded(8871) && ProjGuardedTime(8871) >= 1"]),
            ]),
          ),
          compileStateProgram(state(6002, 902)),
          compileStateProgram(state(6298, 999)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [902, action(902, 4)],
        [930, action(930, 4)],
        [999, action(999, 4)],
      ]),
    });

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } });
    const helperProjectile = store.projectiles.find((projectile) => projectile.parentId === helper.serialId)!;
    recordRuntimeProjectileContact(playerProjectile, "guard");

    advanceRuntimeProjectiles([helperProjectile], { bounds: { left: -160, right: 160 } });
    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } });

    expect(helper).toMatchObject({ stateNo: 6001, animNo: 901 });
    expect(hasRuntimeHelperProjectileContact(store, helper, "guard", 8871)).toBe(false);

    recordRuntimeProjectileContact(helperProjectile, "guard");
    expect(hasRuntimeHelperProjectileContact(store, helper, "contact", 8871)).toBe(true);
    expect(hasRuntimeHelperProjectileContact(store, helper, "hit", 8871)).toBe(false);
    expect(hasRuntimeHelperProjectileContact(store, helper, "guard", 8871)).toBe(true);
    expect(runtimeHelperProjectileContactTime(store, helper, "guard", 8871)).toBe(0);

    advanceRuntimeProjectiles([helperProjectile], { bounds: { left: -160, right: 160 } });
    expect(runtimeHelperProjectileContactTime(store, helper, "guard", 8871)).toBe(1);

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } });

    expect(helper).toMatchObject({
      stateNo: 6002,
      animNo: 902,
    });
  });

  it("evaluates helper-local NumProj against only helper-parented Projectile actors", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeProjectileActor(store, "p1", projectileInput({ projid: "8850", projanim: "930" }));
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("ChangeState", { value: "6199" }, ["NumProjID(8850) > 0"]),
              controller("Projectile", { projid: "8850", projanim: "930", projremovetime: "24" }, ["Time = 0"]),
              controller("ChangeState", { value: "6101" }, ["NumProjID(8850) > 0"]),
            ]),
          ),
          compileStateProgram(state(6101, 901)),
          compileStateProgram(state(6199, 999)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [930, action(930, 4)],
        [999, action(999, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["Projectile", "ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6101,
      animNo: 901,
      stateTime: 1,
      age: 1,
    });
    expect(store.projectiles.filter((projectile) => projectile.projectileId === 8850)).toHaveLength(2);
    expect(countRuntimeHelperProjectileActors(store, helper, 8850)).toBe(1);
    markRuntimeProjectileForRemoval(store.projectiles.find((projectile) => projectile.parentId === helper.serialId)!, "hit");
    expect(countRuntimeHelperProjectileActors(store, helper, 8850)).toBe(0);
  });

  it("evaluates helper-local NumHelper against owner-side Helper actors", () => {
    const store = createRuntimeEffectActorStore();
    spawnRuntimeHelperActor(store, "p1", helperInput({ id: "43", anim: "900" }));
    const helper = spawnRuntimeHelperActor(store, "p1", {
      ...helperInput({ id: "42", anim: "900" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("ChangeState", { value: "6199" }, ["NumHelper(99) > 0"]),
              controller("ChangeState", { value: "6101" }, ["NumHelper(43) > 0"]),
            ]),
          ),
          compileStateProgram(state(6101, 901)),
          compileStateProgram(state(6199, 999)),
        ],
      },
      animations: new Map([
        [900, action(900, 4)],
        [901, action(901, 4)],
        [999, action(999, 4)],
      ]),
    });
    const executed: string[] = [];

    advanceRuntimeHelperActors(store, { bounds: { left: -160, right: 160 } }, {
      onController: (_helper, item) => executed.push(item.type),
    });

    expect(executed).toEqual(["ChangeState"]);
    expect(helper).toMatchObject({
      stateNo: 6101,
      animNo: 901,
      stateTime: 1,
      age: 1,
    });
    expect(store.helpers.filter((candidate) => candidate.helperId === 43)).toHaveLength(1);
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

function controller(type: string, params: Record<string, string>, triggers: string[] = []): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: triggers.map((expression, index) => ({
      index: index + 1,
      expression,
      raw: `trigger${index + 1} = ${expression}`,
      line: index + 1,
    })),
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function state(id: number, anim: number, controllers: MugenStateController[] = []): MugenStateDef {
  return {
    id,
    anim,
    rawParams: {},
    controllers: controllers.map((item) => ({ ...item, stateId: id })),
    line: 1,
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
