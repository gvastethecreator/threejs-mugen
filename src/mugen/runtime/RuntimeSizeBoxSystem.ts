import type { CollisionBox } from "../model/CollisionBox";
import { applyCollisionOverrides } from "./RuntimeCollisionOverrideSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeSizeBoxState = Pick<
  CharacterRuntimeState,
  "bodyHeightDelta" | "bodyWidthDelta" | "clsnOverrides"
>;

export type RuntimeSizeBoxOptions = {
  includeHeight?: boolean;
  includeWidth?: boolean;
};

export function runtimeCurrentSizeBox(
  state: RuntimeSizeBoxState,
  base: CollisionBox,
  options: RuntimeSizeBoxOptions = {},
): CollisionBox | undefined {
  const width = options.includeWidth === false ? undefined : state.bodyWidthDelta;
  const height = options.includeHeight === false ? undefined : state.bodyHeightDelta;
  const x1 = base.x1 - (width?.back ?? 0);
  const x2 = base.x2 + (width?.front ?? 0);
  const y1 = base.y1 - (height?.top ?? 0);
  const y2 = base.y2 + (height?.bottom ?? 0);
  return applyCollisionOverrides([
    {
      ...base,
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2),
    },
  ], state.clsnOverrides, 3)[0];
}
