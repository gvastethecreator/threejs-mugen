import { describe, expect, it } from "vitest";
import type { ExplodControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  advanceRuntimeExplods,
  createRuntimeExplod,
  removeRuntimeExplods,
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
      facing: -1,
      removeTime: 600,
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
      facing: 1,
      removeTime: 25,
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
      }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "fighter",
      spriteOwnerLabel: "Fighter",
      action: action(),
      animNo: operation.animNo ?? 900,
      pos: { x: 12, y: -4 },
      fallbackFacing: -1,
      defaultRemoveTime: 8,
    });

    expect(explod).toMatchObject({
      explodId: 9100,
      animNo: 930,
      facing: 1,
      removeTime: 25,
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
    expect(next[0]).toMatchObject({ age: 1, frameIndex: 0, frameElapsed: 1 });

    advanceRuntimeExplods(next);
    expect(next[0]).toMatchObject({ age: 2, frameIndex: 1, frameElapsed: 0 });
  });

  it("removes all explods without an id or only matching explod ids", () => {
    const one = { ...baseExplod(), serialId: "one", explodId: 1 };
    const two = { ...baseExplod(), serialId: "two", explodId: 2 };

    expect(removeRuntimeExplods([one, two], 1).map((explod) => explod.serialId)).toEqual(["two"]);
    expect(removeRuntimeExplods([one, two], undefined)).toEqual([]);
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
