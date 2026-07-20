import type { CollisionBox } from "../model/CollisionBox";
import type { RuntimeHelper } from "./HelperSystem";

export type RuntimeHelperCollisionParent = {
  id: string;
  pos: { x: number; y: number };
  facing: 1 | -1;
};

export type RuntimeHelperCollisionProxy = Pick<
  RuntimeHelper,
  "serialId" | "parentId" | "rootId" | "clsnProxy" | "destroyed" | "teamState" | "action" | "frameIndex" | "pos" | "facing" | "scale" | "ownClsnScale"
>;

export type RuntimeHelperCollisionBoxType = "clsn1" | "clsn2";
export type RuntimeCollisionScale = { x: number; y: number };
export type RuntimeHelperCollisionScaleOptions = {
  animationOwnerScale?: RuntimeCollisionScale;
};

export function runtimeHelperCurrentCollisionBoxes(
  helper: Pick<RuntimeHelper, "action" | "frameIndex">,
  boxType: RuntimeHelperCollisionBoxType,
): CollisionBox[] {
  const frame = helper.action.frames[helper.frameIndex];
  const boxes = boxType === "clsn1" ? frame?.clsn1 : frame?.clsn2;
  return boxes?.map((box) => ({ ...box })) ?? [];
}

export function mergeRuntimeHelperProxyCollisionBoxes(
  parent: RuntimeHelperCollisionParent,
  baseBoxes: readonly CollisionBox[],
  helpers: readonly RuntimeHelperCollisionProxy[],
  boxType: RuntimeHelperCollisionBoxType,
  options: RuntimeHelperCollisionScaleOptions = {},
): CollisionBox[] {
  return [
    ...baseBoxes.map((box) => ({ ...box })),
    ...runtimeHelperProxyCollisionBoxes(parent, helpers, boxType, options),
  ];
}

export function runtimeHelperProxyCollisionBoxes(
  parent: RuntimeHelperCollisionParent,
  helpers: readonly RuntimeHelperCollisionProxy[],
  boxType: RuntimeHelperCollisionBoxType,
  options: RuntimeHelperCollisionScaleOptions = {},
): CollisionBox[] {
  const childrenByParent = new Map<string, RuntimeHelperCollisionProxy[]>();
  for (const helper of helpers) {
    const children = childrenByParent.get(helper.parentId) ?? [];
    children.push(helper);
    childrenByParent.set(helper.parentId, children);
  }

  const output: CollisionBox[] = [];
  const visited = new Set<string>();
  const queue = [...(childrenByParent.get(parent.id) ?? [])];
  for (let index = 0; index < queue.length; index += 1) {
    const helper = queue[index];
    if (!helper || visited.has(helper.serialId)) continue;
    visited.add(helper.serialId);
    if (!isActiveProxy(parent, helper)) continue;

    const scale = helper.ownClsnScale === true
      ? helper.scale
      : options.animationOwnerScale;
    for (const box of runtimeHelperCurrentCollisionBoxes(helper, boxType)) {
      output.push(relativeCollisionBox(parent, helperWorldBox(helper, scaleCollisionBox(box, scale))));
    }
    queue.push(...(childrenByParent.get(helper.serialId) ?? []));
  }
  return output;
}

function scaleCollisionBox(box: CollisionBox, scale: RuntimeCollisionScale | undefined): CollisionBox {
  const x1 = box.x1 * finiteScale(scale?.x);
  const x2 = box.x2 * finiteScale(scale?.x);
  const y1 = box.y1 * finiteScale(scale?.y);
  const y2 = box.y2 * finiteScale(scale?.y);
  return {
    x1: Math.min(x1, x2),
    x2: Math.max(x1, x2),
    y1: Math.min(y1, y2),
    y2: Math.max(y1, y2),
  };
}

function finiteScale(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) ? value : 1;
}

function isActiveProxy(parent: RuntimeHelperCollisionParent, helper: RuntimeHelperCollisionProxy): boolean {
  return helper.clsnProxy === true
    && helper.destroyed !== true
    && helper.teamState?.disabled !== true
    && helper.teamState?.standby !== true
    && (helper.rootId === undefined || helper.rootId === parent.id);
}

function helperWorldBox(helper: RuntimeHelperCollisionProxy, box: CollisionBox): CollisionBox {
  if (helper.facing === 1) {
    return {
      x1: helper.pos.x + box.x1,
      x2: helper.pos.x + box.x2,
      y1: helper.pos.y + box.y1,
      y2: helper.pos.y + box.y2,
    };
  }
  return {
    x1: helper.pos.x - box.x2,
    x2: helper.pos.x - box.x1,
    y1: helper.pos.y + box.y1,
    y2: helper.pos.y + box.y2,
  };
}

function relativeCollisionBox(parent: RuntimeHelperCollisionParent, world: CollisionBox): CollisionBox {
  if (parent.facing === 1) {
    return {
      x1: world.x1 - parent.pos.x,
      x2: world.x2 - parent.pos.x,
      y1: world.y1 - parent.pos.y,
      y2: world.y2 - parent.pos.y,
    };
  }
  return {
    x1: parent.pos.x - world.x2,
    x2: parent.pos.x - world.x1,
    y1: world.y1 - parent.pos.y,
    y2: world.y2 - parent.pos.y,
  };
}
