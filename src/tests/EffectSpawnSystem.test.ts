import { describe, expect, it } from "vitest";
import { compileStateProgram } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import { RuntimeEffectActorWorld } from "../mugen/runtime/EffectActorSystem";
import {
  resolveEffectSpawnBind,
  resolveEffectSpawnPosition,
  RuntimeEffectSpawnWorld,
  type RuntimeEffectSpawnActor,
} from "../mugen/runtime/EffectSpawnSystem";
import type { DemoFighterDefinition } from "../mugen/runtime/demoFighters";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

const baseAction: MugenAnimationAction = {
  id: 910,
  rawLines: ["[Begin Action 910]"],
  frames: [
    {
      spriteGroup: 910,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 4,
      clsn1: [{ x1: 0, y1: -16, x2: 24, y2: 0 }],
      clsn2: [],
      raw: "910,0,0,0,4",
      line: 1,
    },
    {
      spriteGroup: 910,
      spriteIndex: 1,
      offsetX: 0,
      offsetY: 0,
      duration: 3,
      clsn1: [],
      clsn2: [],
      raw: "910,1,0,0,3",
      line: 2,
    },
  ],
};

const helperAction: MugenAnimationAction = {
  ...baseAction,
  id: 920,
  rawLines: ["[Begin Action 920]"],
};

const terminalAction: MugenAnimationAction = {
  ...baseAction,
  id: 930,
  rawLines: ["[Begin Action 930]"],
};

describe("EffectSpawnSystem", () => {
  it("owns Explod spawn positioning, binding, and removal through RuntimeEffectSpawnWorld", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld, {
      pos: { x: 100, y: 0 },
      facing: 1,
    });
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 220, y: 0 },
      facing: -1,
    });

    const spawned = spawnWorld.spawnExplod(
      fighter,
      opponent,
      controller("Explod", {
        anim: "910",
        pos: "10,-4",
        postype: "front",
        bindtime: "3",
        id: "77",
      }),
    );

    expect(spawned).toBe(true);
    expect(effectActorWorld.getStore("p1").explods[0]).toMatchObject({
      explodId: 77,
      animNo: 910,
      pos: { x: 158, y: -4 },
      bind: { localOffset: { x: 58, y: -4 }, remaining: 3 },
      removeTime: 7,
    });

    expect(spawnWorld.removeExplods(fighter, controller("RemoveExplod", { id: "77" }))).toBe(true);
    expect(effectActorWorld.getStore("p1").explods).toHaveLength(0);
  });

  it("owns ModifyExplod dispatch for live owner-side visual actors", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });

    spawnWorld.spawnExplod(fighter, opponent, controller("Explod", { anim: "910", id: "77", vel: "1,0", scale: "1,1" }));
    const changed = spawnWorld.modifyExplods(fighter, controller("ModifyExplod", { id: "77", vel: "4,-2", scale: "2,.5", sprpriority: "8" }));

    expect(changed).toBe(1);
    expect(effectActorWorld.getStore("p1").explods[0]).toMatchObject({
      vel: { x: 4, y: -2 },
      scale: { x: 2, y: 0.5 },
      spritePriority: 8,
    });
  });

  it("owns Helper and Projectile creation through state-owner sprite/action resolution", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const owner = actor("owner", effectActorWorld, {}, definition("owner", [baseAction, helperAction, terminalAction], [state(300, 920)]));
    owner.runtimeProgram = { states: [compileStateProgram(state(300, 920))] };
    const fighter = actor("p1", effectActorWorld, {
      pos: { x: 100, y: 0 },
      facing: 1,
      attackMultiplier: 1.5,
    });
    fighter.stateOwner = owner;
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 220, y: 0 },
      facing: -1,
    });

    expect(spawnWorld.spawnHelper(fighter, opponent, controller("Helper", { stateno: "300", pos: "12,5", postype: "p2" }))).toBe(true);
    expect(effectActorWorld.getStore("p1").helpers[0]).toMatchObject({
      stateNo: 300,
      animNo: 920,
      spriteOwnerId: "owner",
      runtimeProgram: owner.runtimeProgram,
      pos: { x: 208, y: 5 },
    });
    expect(effectActorWorld.getStore("p1").helpers[0]?.animations?.get(920)).toBe(helperAction);

    expect(
      spawnWorld.spawnProjectile(
        fighter,
        opponent,
        controller("Projectile", {
          projanim: "910",
          projhitanim: "930",
          offset: "6,-8",
          postype: "back",
          velocity: "3,0",
          projid: "44",
          damage: "20",
        }),
      ),
    ).toBe(true);
    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      projectileId: 44,
      animNo: 910,
      hitAnimNo: 930,
      damage: 30,
      spriteOwnerId: "owner",
      pos: { x: 58, y: -8 },
    });
  });

  it("owns helper removal dispatch for current visual helper actors", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });

    spawnWorld.spawnHelper(fighter, opponent, controller("Helper", { id: "42", anim: "920" }));
    spawnWorld.spawnHelper(fighter, opponent, controller("Helper", { id: "43", anim: "920" }));

    expect(spawnWorld.removeHelpers(fighter, 42)).toBe(1);
    expect(effectActorWorld.getStore("p1").helpers.map((helper) => helper.helperId)).toEqual([43]);

    expect(spawnWorld.removeHelpers(fighter)).toBe(1);
    expect(effectActorWorld.getStore("p1").helpers).toEqual([]);
  });

  it("owns ModifyProjectile dispatch and keeps position helper behavior explicit", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const spawnWorld = new RuntimeEffectSpawnWorld();
    const fighter = actor("p1", effectActorWorld);
    const opponent = actor("p2", effectActorWorld, {
      pos: { x: 200, y: 0 },
      facing: -1,
    });

    spawnWorld.spawnProjectile(fighter, opponent, controller("Projectile", { projanim: "910", projid: "7", velocity: "1,0" }));
    const changed = spawnWorld.modifyProjectiles(fighter, controller("ModifyProjectile", { projid: "7", velocity: "4,-2", projscale: "2,.5" }));

    expect(changed).toBe(1);
    expect(effectActorWorld.getStore("p1").projectiles[0]).toMatchObject({
      vel: { x: 4, y: -2 },
      scale: { x: 2, y: 0.5 },
    });
    expect(resolveEffectSpawnPosition(fighter, opponent, "left", [12, -3])).toEqual({ x: 12, y: -3 });
    expect(resolveEffectSpawnBind("back", [12, -3])).toEqual({ localOffset: { x: -36, y: -3 } });
  });
});

function actor(
  id: string,
  effectActorWorld: RuntimeEffectActorWorld,
  runtimeOverrides: Partial<CharacterRuntimeState> = {},
  fighterDefinition = definition(id, [baseAction, helperAction, terminalAction]),
): RuntimeEffectSpawnActor {
  return {
    id,
    label: id.toUpperCase(),
    definition: fighterDefinition,
    runtime: runtimeState(runtimeOverrides),
    effectActorWorld,
  };
}

function definition(id: string, actions: MugenAnimationAction[], states: MugenStateDef[] = []): DemoFighterDefinition {
  return {
    id,
    displayName: id,
    palette: "#fff",
    spriteGroupBase: 0,
    speed: 1,
    jumpVelocity: -8,
    walkAction: 20,
    idleAction: 0,
    crouchAction: 10,
    jumpAction: 40,
    hitstunAction: 5000,
    moves: {
      punch: move(200),
      kick: move(210),
    },
    states,
    animations: new Map(actions.map((action) => [action.id, action])),
  };
}

function state(id: number, anim: number): MugenStateDef {
  return {
    id,
    anim,
    rawParams: {},
    controllers: [],
    line: 1,
  };
}

function move(actionId: number) {
  return {
    actionId,
    startup: 1,
    activeStart: 1,
    activeEnd: 2,
    recovery: 4,
    damage: 20,
    hitPause: 4,
    hitStun: 12,
    push: 5,
    hitbox: { x1: 0, y1: -12, x2: 20, y2: 0 },
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 910,
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
