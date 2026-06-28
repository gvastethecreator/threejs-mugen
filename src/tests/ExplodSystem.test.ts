import { describe, expect, it } from "vitest";
import type { ExplodControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  advanceRuntimeExplods,
  createRuntimeExplod,
  modifyRuntimeExplods,
  removeRuntimeExplods,
  removeRuntimeExplodsOnGetHit,
  runtimeExplodsToSnapshots,
} from "../mugen/runtime/ExplodSystem";

describe("ExplodSystem", () => {
  it("creates visual explod actors from resolved controller inputs", () => {
    const explod = createRuntimeExplod({
      serialId: "p1-explod-0",
      controller: controller("Explod", {
        id: "9000",
        removetime: "999",
        sprpriority: "99",
        facing: "-1",
        trans: "add",
        bindtime: "6",
        scale: "1.5,0.75",
        vel: "2,-1",
        accel: "0.5,0.25",
        removeongethit: "1",
        ignorehitpause: "1",
        pausemovetime: "2",
        supermovetime: "3",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 42, y: -58 },
      bind: { localOffset: { x: 42, y: -58 } },
      fallbackFacing: 1,
      defaultRemoveTime: 8,
    });

    expect(explod).toMatchObject({
      serialId: "p1-explod-0",
      explodId: 9000,
      actorKind: "explod",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      spriteOwnerId: "p1",
      animNo: 900,
      pos: { x: 42, y: -58 },
      vel: { x: 2, y: -1 },
      accel: { x: 0.5, y: 0.25 },
      scale: { x: 1.5, y: 0.75 },
      bind: { localOffset: { x: 42, y: -58 }, remaining: 6 },
      facing: -1,
      removeTime: 600,
      removeOnGetHit: true,
      ignoreHitPause: true,
      pauseMoveTime: 2,
      superMoveTime: 3,
      spritePriority: 10,
      opacity: 0.78,
    });
  });

  it("prefers typed explod operations over raw controller params", () => {
    const operation: ExplodControllerOp = {
      kind: "explod",
      explodId: 9100,
      animNo: 930,
      pos: [12, -4],
      postype: "p1",
      bindTime: 5,
      scale: [2, 0.5],
      velocity: [5, -2],
      acceleration: [0.25, 0.5],
      facing: 1,
      removeTime: 25,
      removeOnGetHit: true,
      ignoreHitPause: true,
      pauseMoveTime: 4,
      superMoveTime: 5,
      spritePriority: 6,
      trans: "none",
    };
    const explod = createRuntimeExplod({
      serialId: "p1-explod-typed",
      controller: controller("Explod", {
        id: "9000",
        removetime: "999",
        sprpriority: "-5",
        facing: "-1",
        trans: "add",
        removeongethit: "0",
      }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: operation.animNo ?? 900,
      pos: { x: 12, y: -4 },
      bind: { localOffset: { x: 12, y: -4 } },
      fallbackFacing: -1,
      defaultRemoveTime: 8,
    });

    expect(explod).toMatchObject({
      explodId: 9100,
      animNo: 930,
      bind: { localOffset: { x: 12, y: -4 }, remaining: 5 },
      scale: { x: 2, y: 0.5 },
      vel: { x: 5, y: -2 },
      accel: { x: 0.25, y: 0.5 },
      facing: 1,
      removeTime: 25,
      removeOnGetHit: true,
      ignoreHitPause: true,
      pauseMoveTime: 4,
      superMoveTime: 5,
      spritePriority: 6,
      opacity: 0.9,
    });
  });

  it("advances frame timing, loops animation frames, and removes expired explods", () => {
    const persistent = createRuntimeExplod({
      serialId: "persist",
      controller: controller("Explod", { removetime: "-1" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      defaultRemoveTime: 8,
    });
    const expiring = { ...persistent, serialId: "expire", removeTime: 1 };

    const next = advanceRuntimeExplods([persistent, expiring]);

    expect(next.map((explod) => explod.serialId)).toEqual(["persist"]);
    expect(next[0]).toMatchObject({ age: 1, frameIndex: 0, frameElapsed: 1, pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 } });

    advanceRuntimeExplods(next);
    expect(next[0]).toMatchObject({ age: 2, frameIndex: 1, frameElapsed: 0 });
  });

  it("moves explods by velocity and acceleration", () => {
    const moving = createRuntimeExplod({
      serialId: "moving",
      controller: controller("Explod", {
        vel: "3,-2",
        accel: "1,0.5",
        removetime: "8",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 10, y: -10 },
      fallbackFacing: 1,
      defaultRemoveTime: 8,
    });

    advanceRuntimeExplods([moving]);
    expect(moving).toMatchObject({
      pos: { x: 13, y: -12 },
      vel: { x: 4, y: -1.5 },
    });

    advanceRuntimeExplods([moving]);
    expect(moving).toMatchObject({
      pos: { x: 17, y: -13.5 },
      vel: { x: 5, y: -1 },
    });
  });

  it("advances only eligible explods while hit pause or match pause is active", () => {
    const frozen = createRuntimeExplod({
      serialId: "frozen",
      controller: controller("Explod", { vel: "6,0", removetime: "12" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      defaultRemoveTime: 12,
    });
    const hitPauseImmune = createRuntimeExplod({
      serialId: "hitpause-immune",
      controller: controller("Explod", { ignorehitpause: "1", vel: "6,0", removetime: "12" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      defaultRemoveTime: 12,
    });
    const superMover = createRuntimeExplod({
      serialId: "super-mover",
      controller: controller("Explod", { supermovetime: "2", vel: "4,0", removetime: "12" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      defaultRemoveTime: 12,
    });

    advanceRuntimeExplods([frozen, hitPauseImmune, superMover], undefined, { pauseKind: "hitpause" });
    expect(frozen).toMatchObject({ age: 0, pos: { x: 0, y: 0 } });
    expect(hitPauseImmune).toMatchObject({ age: 1, pos: { x: 6, y: 0 } });
    expect(superMover).toMatchObject({ age: 0, pos: { x: 0, y: 0 }, superMoveTime: 2 });

    advanceRuntimeExplods([frozen, hitPauseImmune, superMover], undefined, { pauseKind: "SuperPause" });
    advanceRuntimeExplods([frozen, hitPauseImmune, superMover], undefined, { pauseKind: "SuperPause" });
    advanceRuntimeExplods([frozen, hitPauseImmune, superMover], undefined, { pauseKind: "SuperPause" });

    expect(frozen).toMatchObject({ age: 0, pos: { x: 0, y: 0 } });
    expect(hitPauseImmune).toMatchObject({ age: 1, pos: { x: 6, y: 0 } });
    expect(superMover).toMatchObject({ age: 2, pos: { x: 8, y: 0 }, superMoveTime: 0 });
  });

  it("binds explods to the owner anchor until bindtime expires", () => {
    const bound = createRuntimeExplod({
      serialId: "bound",
      controller: controller("Explod", {
        bindtime: "2",
        vel: "5,0",
        removetime: "8",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 110, y: -20 },
      bind: { localOffset: { x: 10, y: -20 } },
      fallbackFacing: 1,
      defaultRemoveTime: 8,
    });

    advanceRuntimeExplods([bound], { pos: { x: 100, y: 0 }, facing: 1 });
    expect(bound).toMatchObject({ pos: { x: 110, y: -20 }, vel: { x: 5, y: 0 }, bind: { remaining: 1 } });

    advanceRuntimeExplods([bound], { pos: { x: 120, y: 0 }, facing: 1 });
    expect(bound).toMatchObject({ pos: { x: 130, y: -20 }, vel: { x: 5, y: 0 } });
    expect(bound.bind).toBeUndefined();

    advanceRuntimeExplods([bound], { pos: { x: 150, y: 0 }, facing: 1 });
    expect(bound).toMatchObject({ pos: { x: 135, y: -20 }, vel: { x: 5, y: 0 } });
  });

  it("removes all explods without an id or only matching explod ids", () => {
    const one = { ...baseExplod(), serialId: "one", explodId: 1 };
    const two = { ...baseExplod(), serialId: "two", explodId: 2 };

    expect(removeRuntimeExplods([one, two], 1).map((explod) => explod.serialId)).toEqual(["two"]);
    expect(removeRuntimeExplods([one, two], undefined)).toEqual([]);
  });

  it("modifies live explod actors through bounded static params", () => {
    const untouched = { ...baseExplod(), serialId: "untouched", explodId: 1 };
    const changed = { ...baseExplod(), serialId: "changed", explodId: 2, bind: { localOffset: { x: 12, y: -4 }, remaining: 6 } };

    expect(
      modifyRuntimeExplods(
        [untouched, changed],
        {
          controller: controller("ModifyExplod", {
            id: "2",
            vel: "6,-2",
            accel: "1,0.5",
            scale: "2,0.5",
            facing: "-1",
            removetime: "24",
            removeongethit: "1",
            ignorehitpause: "1",
            pausemovetime: "3",
            supermovetime: "4",
            sprpriority: "8",
            bindtime: "2",
            trans: "none",
          }),
        },
      ),
    ).toBe(1);

    expect(untouched).toMatchObject({ vel: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, spritePriority: 6 });
    expect(changed).toMatchObject({
      vel: { x: 6, y: -2 },
      accel: { x: 1, y: 0.5 },
      scale: { x: 2, y: 0.5 },
      facing: -1,
      removeTime: 24,
      removeOnGetHit: true,
      ignoreHitPause: true,
      pauseMoveTime: 3,
      superMoveTime: 4,
      spritePriority: 8,
      bind: { remaining: 2 },
      opacity: 0.9,
    });
  });

  it("removes only explods flagged with removeongethit", () => {
    const flagged = createRuntimeExplod({
      serialId: "flagged",
      controller: controller("Explod", {
        id: "1",
        removeongethit: "1",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: 900,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
      defaultRemoveTime: 8,
    });
    const stable = { ...baseExplod(), serialId: "stable", explodId: 2 };

    expect(removeRuntimeExplodsOnGetHit([flagged, stable]).map((explod) => explod.serialId)).toEqual(["stable"]);
  });

  it("converts explods into renderer-friendly actor snapshots", () => {
    const snapshot = runtimeExplodsToSnapshots([baseExplod()], 200)[0]!;

    expect(snapshot).toMatchObject({
      id: "p1-explod-0",
      label: "Explod 9000",
      actorKind: "explod",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      source: "effect",
      runtime: {
        pos: { x: 42, y: -58 },
        vel: { x: 0, y: 0 },
        animNo: 900,
        stateNo: 200,
        renderOpacity: 0.78,
        paletteFx: {
          remaining: 12,
          time: 12,
        },
      },
      frame: {
        spriteGroup: 900,
        spriteIndex: 0,
      },
      clsn1: [],
      clsn2: [],
    });
  });
});

function baseExplod() {
  return createRuntimeExplod({
    serialId: "p1-explod-0",
    controller: controller("Explod", {
      id: "9000",
      removetime: "12",
      sprpriority: "6",
      trans: "add",
    }),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "fighter",
    spriteOwnerLabel: "Fighter",
    action: action(),
    animNo: 900,
    pos: { x: 42, y: -58 },
    fallbackFacing: 1,
    defaultRemoveTime: 8,
  });
}

function action(): MugenAnimationAction {
  return {
    id: 900,
    loopStart: 0,
    rawLines: [],
    frames: [
      {
        spriteGroup: 900,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 2,
        clsn1: [],
        clsn2: [],
        raw: "900,0,0,0,2",
        line: 1,
      },
      {
        spriteGroup: 900,
        spriteIndex: 1,
        offsetX: 0,
        offsetY: 0,
        duration: 2,
        clsn1: [],
        clsn2: [],
        raw: "900,1,0,0,2",
        line: 2,
      },
    ],
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
