import { describe, expect, it } from "vitest";
import type { CollisionBox } from "../mugen/model/CollisionBox";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import {
  mergeRuntimeHelperProxyCollisionBoxes,
  runtimeHelperCurrentCollisionBoxes,
  type RuntimeHelperCollisionParent,
  type RuntimeHelperCollisionProxy,
} from "../mugen/runtime/RuntimeHelperCollisionSystem";

describe("RuntimeHelperCollisionSystem", () => {
  it("flattens active proxy descendants into the parent's local collision space", () => {
    const parent = root({ x: 100, y: 20 }, 1);
    const direct = proxy("proxy-1", "root", "root", { x: 120, y: 22 }, 1, {
      clsn2: [{ x1: -8, y1: -12, x2: 12, y2: 8 }],
    });
    const nested = proxy("proxy-2", "proxy-1", "root", { x: 140, y: 20 }, -1, {
      clsn2: [{ x1: -5, y1: -10, x2: 15, y2: 4 }],
    });
    const ordinaryChild = proxy("ordinary", "root", "root", { x: 200, y: 20 }, 1, {
      clsnProxy: false,
      clsn2: [{ x1: -100, y1: -10, x2: 100, y2: 10 }],
    });

    expect(mergeRuntimeHelperProxyCollisionBoxes(parent, [{ x1: -20, y1: -40, x2: 20, y2: 0 }], [direct, nested, ordinaryChild], "clsn2"))
      .toEqual([
        { x1: -20, y1: -40, x2: 20, y2: 0 },
        { x1: 12, y1: -10, x2: 32, y2: 10 },
        { x1: 25, y1: -10, x2: 45, y2: 4 },
      ]);
  });

  it("ignores inactive, cross-root, and cyclic proxy branches", () => {
    const parent = root({ x: 0, y: 0 }, 1);
    const disabled = proxy("disabled", "root", "root", { x: 0, y: 0 }, 1, { clsnProxy: true });
    disabled.teamState = { disabled: true, standby: false, overKo: false, playerType: false };
    const crossRoot = proxy("cross", "root", "other-root", { x: 0, y: 0 }, 1, { clsnProxy: true });
    const cycle = proxy("cycle", "cycle-child", "root", { x: 0, y: 0 }, 1, { clsnProxy: true });
    const cycleChild = proxy("cycle-child", "cycle", "root", { x: 0, y: 0 }, 1, { clsnProxy: true });

    expect(mergeRuntimeHelperProxyCollisionBoxes(parent, [], [disabled, crossRoot, cycle, cycleChild], "clsn2")).toEqual([]);
  });

  it("reads and clones only the selected current Helper frame boxes", () => {
    const action = actionWithBoxes({
      clsn1: [{ x1: 1, y1: 2, x2: 3, y2: 4 }],
      clsn2: [{ x1: -4, y1: -5, x2: 6, y2: 7 }],
    });
    const helper = { action, frameIndex: 0 };
    const attack = runtimeHelperCurrentCollisionBoxes(helper, "clsn1");
    attack[0]!.x1 = 999;

    expect(attack).toEqual([{ x1: 999, y1: 2, x2: 3, y2: 4 }]);
    expect(runtimeHelperCurrentCollisionBoxes(helper, "clsn1")).toEqual([{ x1: 1, y1: 2, x2: 3, y2: 4 }]);
    expect(runtimeHelperCurrentCollisionBoxes(helper, "clsn2")).toEqual([{ x1: -4, y1: -5, x2: 6, y2: 7 }]);
    expect(runtimeHelperCurrentCollisionBoxes({ action, frameIndex: 4 }, "clsn2")).toEqual([]);
  });
});

function root(pos: { x: number; y: number }, facing: 1 | -1): RuntimeHelperCollisionParent {
  return { id: "root", pos, facing };
}

function proxy(
  serialId: string,
  parentId: string,
  rootId: string,
  pos: { x: number; y: number },
  facing: 1 | -1,
  options: ProxyOptions = {},
): RuntimeHelperCollisionProxy {
  const { clsn1, clsn2, clsnProxy, ...actorOptions } = options;
  return {
    serialId,
    parentId,
    rootId,
    clsnProxy: clsnProxy ?? true,
    destroyed: false,
    teamState: { disabled: false, standby: false, overKo: false, playerType: false },
    action: actionWithBoxes({ clsn1, clsn2 }),
    frameIndex: 0,
    pos,
    facing,
    ...actorOptions,
  };
}

type ProxyOptions = Partial<Pick<RuntimeHelperCollisionProxy, "destroyed" | "teamState">> & {
  clsnProxy?: boolean;
  clsn1?: CollisionBox[];
  clsn2?: CollisionBox[];
};

function actionWithBoxes(options: { clsn1?: CollisionBox[]; clsn2?: CollisionBox[] } = {}): MugenAnimationAction {
  return {
    id: 1,
    rawLines: [],
    frames: [{
      spriteGroup: 0,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 1,
      clsn1: options.clsn1 ?? [],
      clsn2: options.clsn2 ?? [],
      raw: "",
      line: 1,
    }],
  };
}
