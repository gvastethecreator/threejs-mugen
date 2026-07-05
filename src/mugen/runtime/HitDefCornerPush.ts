import type { CharacterRuntimeState } from "./types";

export type RuntimeHitDefCornerPush = {
  cornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
};

export type RuntimeStageBounds = { left: number; right: number };

export function resolveHitDefCornerPush(input: {
  attr?: string;
  guardVelocityX?: number;
  groundCornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
}): RuntimeHitDefCornerPush {
  const groundCornerPush = finiteCornerPush(input.groundCornerPush) ?? defaultGroundCornerPush(input.attr, input.guardVelocityX);
  const guardCornerPush = finiteCornerPush(input.guardCornerPush) ?? groundCornerPush;
  return {
    cornerPush: groundCornerPush,
    airCornerPush: finiteCornerPush(input.airCornerPush) ?? groundCornerPush,
    downCornerPush: finiteCornerPush(input.downCornerPush) ?? groundCornerPush,
    guardCornerPush,
    airGuardCornerPush: finiteCornerPush(input.airGuardCornerPush) ?? guardCornerPush,
  };
}

export function applyRuntimeCornerPush(
  attacker: Pick<CharacterRuntimeState, "facing" | "pos" | "vel">,
  defender: Pick<CharacterRuntimeState, "bodyWidth" | "facing" | "pos">,
  stageBounds: RuntimeStageBounds | undefined,
  cornerPush: number | undefined,
  defenderPush: number,
): void {
  const magnitude = finiteCornerPush(cornerPush);
  if (magnitude === undefined || magnitude <= 0 || !stageBounds) {
    return;
  }
  if (!wouldDefenderReachCorner(defender, attacker.facing, stageBounds, Math.max(0, defenderPush))) {
    return;
  }
  attacker.vel.x += -attacker.facing * magnitude;
}

function defaultGroundCornerPush(attr: string | undefined, guardVelocityX: number | undefined): number | undefined {
  if (attackStateAttr(attr) === "A") {
    return 0;
  }
  const guardVelocity = finiteCornerPush(guardVelocityX);
  return guardVelocity === undefined ? undefined : guardVelocity * 1.3;
}

function attackStateAttr(attr: string | undefined): "S" | "C" | "A" | undefined {
  const statePart = attr?.split(",")[0]?.trim().toUpperCase() ?? "";
  if (statePart === "A") {
    return "A";
  }
  if (statePart === "C") {
    return "C";
  }
  if (statePart === "S") {
    return "S";
  }
  return undefined;
}

function finiteCornerPush(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : Math.abs(value);
}

function wouldDefenderReachCorner(
  defender: Pick<CharacterRuntimeState, "bodyWidth" | "facing" | "pos">,
  attackerFacing: 1 | -1,
  stageBounds: RuntimeStageBounds,
  push: number,
): boolean {
  if (attackerFacing === 1) {
    return defender.pos.x + rightWidth(defender) + push >= stageBounds.right;
  }
  return defender.pos.x - leftWidth(defender) - push <= stageBounds.left;
}

function rightWidth(defender: Pick<CharacterRuntimeState, "bodyWidth" | "facing">): number {
  const width = defender.bodyWidth ?? { front: 39, back: 39 };
  return defender.facing === 1 ? width.front : width.back;
}

function leftWidth(defender: Pick<CharacterRuntimeState, "bodyWidth" | "facing">): number {
  const width = defender.bodyWidth ?? { front: 39, back: 39 };
  return defender.facing === 1 ? width.back : width.front;
}
