import { describe, expect, it } from "vitest";
import { compileStateProgram } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeEffectActorWorld,
  type RuntimeEffectPresentationAdvanceOptions,
} from "../mugen/runtime/EffectActorSystem";
import { RuntimeEffectLifecycleWorld, type RuntimeEffectLifecycleActor } from "../mugen/runtime/EffectLifecycleSystem";
import type { RuntimeHelperAdvanceOptions } from "../mugen/runtime/HelperSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("EffectLifecycleSystem", () => {
  it("owns active tick, presentation tick, snapshots, and get-hit cleanup over effect actors", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const actor = lifecycleActor(effectActorWorld);
    const lifecycle = new RuntimeEffectLifecycleWorld();

    effectActorWorld.spawnExplod("p1", explodInput({ id: "10", removeongethit: "1", removetime: "-1" }));
    effectActorWorld.spawnExplod("p1", explodInput({ id: "11", removetime: "-1" }));
    effectActorWorld.spawnHelper("p1", helperInput({ removetime: "1" }));
    effectActorWorld.spawnProjectile("p1", projectileInput({ velocity: "3,0" }));

    expect(lifecycle.snapshotGroups(actor)).toMatchObject({
      explods: [{ actorKind: "explod" }, { actorKind: "explod" }],
      helpers: [{ actorKind: "helper" }],
      projectiles: [{ actorKind: "projectile" }],
    });
    expect(lifecycle.snapshots(actor).map((snapshot) => snapshot.actorKind)).toEqual([
      "explod",
      "explod",
      "helper",
      "projectile",
    ]);

    lifecycle.advanceActive(actor, { bounds: { left: -160, right: 160 } });

    expect(effectActorWorld.getStore("p1").helpers).toEqual([]);
    expect(effectActorWorld.projectiles("p1")[0]?.pos.x).toBe(3);
    expect(effectActorWorld.getStore("p1").explods.map((explod) => explod.explodId)).toEqual([11, 10]);

    lifecycle.advancePresentation(actor);
    expect(effectActorWorld.getStore("p1").explods.map((explod) => explod.age)).toEqual([1, 1]);

    lifecycle.markGetHit(actor);

    expect(actor.runtime.moveType).toBe("H");
    expect(effectActorWorld.getStore("p1").explods.map((explod) => explod.explodId)).toEqual([11]);
  });

  it("forwards stage bounds, GameTime, and runtime tick into helper controllers", () => {
    const effectActorWorld = new RuntimeEffectActorWorld();
    const actor = lifecycleActor(effectActorWorld);
    const lifecycle = new RuntimeEffectLifecycleWorld();
    const helper = effectActorWorld.spawnHelper("p1", {
      ...helperInput({ id: "42", anim: "900", removetime: "-1" }),
      runtimeProgram: {
        states: [
          compileStateProgram(
            state(6000, 900, [
              controller("PlaySnd", { value: "S7,3", channel: "4" }, ["GameTime >= 7"]),
              controller("VelSet", { x: "FrontEdgeDist", y: "0" }, ["GameTime >= 7"]),
              controller("ChangeState", { value: "6001" }, ["GameTime >= 7"]),
            ]),
          ),
        ],
      },
      animations: new Map([[900, action(900)]]),
    });

    lifecycle.advanceActive(actor, { bounds: { left: -160, right: 160 } }, undefined, {
      stageTime: 6,
      runtimeTick: 66,
    });

    expect(helper.stateNo).toBe(6000);
    expect(helper.soundEvents).toEqual([]);

    lifecycle.advanceActive(actor, { bounds: { left: -160, right: 160 } }, undefined, {
      stageTime: 7,
      runtimeTick: 77,
    });

    expect(helper.soundEvents[0]).toMatchObject({ type: "PlaySnd", group: 7, index: 3, channel: 4, runtimeTick: 77 });
    expect(helper.vel.x).toBe(160);
    expect(helper.stateNo).toBe(6001);
  });

  it("forwards the current opponent as an id-bearing helper roster into active and paused contexts", () => {
    const lifecycle = new RuntimeEffectLifecycleWorld();
    const stage = { bounds: { left: -160, right: 160 }, localCoord: { width: 640, height: 480 }, camera: { zoom: 2 } };
    const activeOptions: RuntimeHelperAdvanceOptions[] = [];
    const presentationOptions: RuntimeEffectPresentationAdvanceOptions[] = [];
    const actor = lifecycleActorWithCapturedOptions(activeOptions, presentationOptions);
    const opponentRuntime = runtimeState();
    opponentRuntime.pos.x = 48;
    const opponent: RuntimeEffectLifecycleActor = {
      ...lifecycleActorWithCapturedOptions([], []),
      id: "p2",
      runtime: opponentRuntime,
    };

    lifecycle.advanceActive(actor, stage, opponent, { stageTime: 12, runtimeTick: 120 });
    lifecycle.advancePausedPresentation(actor, "Pause", stage, opponent, { stageTime: 13, runtimeTick: 130 });

    expect(activeOptions[0]?.opponentId).toBe("p2");
    expect(activeOptions[0]?.opponentState).toBe(opponentRuntime);
    expect(activeOptions[0]?.opponentRoster?.[0]?.id).toBe("p2");
    expect(activeOptions[0]?.opponentRoster?.[0]?.state).toBe(opponentRuntime);
    expect(activeOptions[0]?.stageTime).toBe(12);
    expect(activeOptions[0]?.runtimeTick).toBe(120);
    expect(activeOptions[0]?.gameSpace).toEqual({ width: 640, height: 480, zoom: 2 });

    expect(presentationOptions[0]?.pauseKind).toBe("Pause");
    expect(presentationOptions[0]?.opponentId).toBe("p2");
    expect(presentationOptions[0]?.opponentState).toBe(opponentRuntime);
    expect(presentationOptions[0]?.opponentRoster?.[0]?.id).toBe("p2");
    expect(presentationOptions[0]?.opponentRoster?.[0]?.state).toBe(opponentRuntime);
    expect(presentationOptions[0]?.stageTime).toBe(13);
    expect(presentationOptions[0]?.runtimeTick).toBe(130);
    expect(presentationOptions[0]?.gameSpace).toEqual({ width: 640, height: 480, zoom: 2 });
  });

  it("builds helper rosters from explicit lifecycle opponent lists before falling back to the current opponent", () => {
    const lifecycle = new RuntimeEffectLifecycleWorld();
    const stage = { bounds: { left: -160, right: 160 } };
    const activeOptions: RuntimeHelperAdvanceOptions[] = [];
    const actor = lifecycleActorWithCapturedOptions(activeOptions, []);
    const far = opponentLifecycleActor("p2-far", 160);
    const near = opponentLifecycleActor("p2-near", 80);
    const tied = opponentLifecycleActor("p2-tie", -80);

    lifecycle.advanceActive(actor, stage, far, {
      opponents: [far, near, tied],
      stageTime: 21,
      runtimeTick: 210,
    });

    expect(activeOptions[0]?.opponentId).toBe("p2-far");
    expect(activeOptions[0]?.opponentState).toBe(far.runtime);
    expect(activeOptions[0]?.opponentRoster?.map((entry) => entry.id)).toEqual(["p2-near", "p2-tie", "p2-far"]);
    expect(activeOptions[0]?.opponentRoster?.map((entry) => entry.state)).toEqual([near.runtime, tied.runtime, far.runtime]);
    expect("opponents" in activeOptions[0]!).toBe(false);
  });
});

function lifecycleActor(effectActorWorld: RuntimeEffectActorWorld): RuntimeEffectLifecycleActor {
  return {
    id: "p1",
    runtime: runtimeState(),
    effectActorWorld,
  };
}

function lifecycleActorWithCapturedOptions(
  activeOptions: RuntimeHelperAdvanceOptions[],
  presentationOptions: RuntimeEffectPresentationAdvanceOptions[],
): RuntimeEffectLifecycleActor {
  return {
    id: "p1",
    runtime: runtimeState(),
    effectActorWorld: {
      advanceActiveEffects: (_ownerId, _stage, options) => {
        activeOptions.push(options ?? {});
      },
      advancePresentationEffects: (_ownerId, _bindAnchor, options) => {
        presentationOptions.push(options ?? {});
      },
      explodSnapshots: () => [],
      helperSnapshots: () => [],
      projectileSnapshots: () => [],
      removeExplodsOnGetHit: () => undefined,
    },
  };
}

function opponentLifecycleActor(id: string, x: number): RuntimeEffectLifecycleActor {
  const state = runtimeState();
  state.pos.x = x;
  return {
    id,
    runtime: state,
    effectActorWorld: new RuntimeEffectActorWorld(),
  };
}

function runtimeState(): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
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
  };
}

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
    triggers: triggers.map((expression, index) => ({ index: index + 1, expression, raw: `trigger${index + 1} = ${expression}`, line: index + 1 })),
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function state(id: number, anim: number, controllers: MugenStateController[]) {
  return {
    id,
    type: "S",
    moveType: "I",
    physics: "S",
    anim,
    rawParams: {},
    controllers,
    line: 1,
  };
}

function action(id = 900): MugenAnimationAction {
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
        duration: 2,
        clsn1: [{ x1: 1, y1: -8, x2: 16, y2: -1 }],
        clsn2: [{ x1: -8, y1: -16, x2: 8, y2: 0 }],
        raw: `${id},0,0,0,2`,
        line: 1,
      },
    ],
  };
}
