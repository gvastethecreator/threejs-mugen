import type { CollisionControllerOp } from "../compiler/ControllerOps";
import type { CollisionBox } from "../model/CollisionBox";
import type { MugenStateController } from "../model/MugenState";
import { findControllerParam } from "./StateProgramExecutor";

export type RuntimeCollisionOverride = {
  group: 1 | 2 | 3;
  index: number;
  rect: CollisionBox;
};

export type RuntimeCollisionOverrideState = {
  clsnOverrides?: RuntimeCollisionOverride[];
};

export type RuntimeCollisionOverrideResolver = {
  resolveNumber(key: "group" | "index"): number | undefined;
  resolveRect(key: "rect"): [number, number?, number?, number?] | undefined;
};

export class RuntimeCollisionOverrideWorld {
  resetFrame(state: RuntimeCollisionOverrideState): void {
    state.clsnOverrides = undefined;
  }

  apply(
    state: RuntimeCollisionOverrideState,
    controller: MugenStateController,
    operation?: Extract<CollisionControllerOp, { controllerType: "overrideclsn" }>,
    resolver?: RuntimeCollisionOverrideResolver,
    valueScale = 1,
  ): Extract<CollisionControllerOp, { controllerType: "overrideclsn" }> | undefined {
    const group = operation?.group ?? resolveGroup(findControllerParam(controller, "group"), resolver?.resolveNumber("group"));
    if (group === undefined) return undefined;
    const redirectPlayerIdExpression = operation?.redirectPlayerIdExpression ?? findControllerParam(controller, "redirectid")?.trim();
    if (group === 0) {
      state.clsnOverrides = undefined;
      return { kind: "collision", controllerType: "overrideclsn", group, index: 0, rect: [0, 0, 0, 0], ...(redirectPlayerIdExpression ? { redirectPlayerIdExpression } : {}) };
    }
    const indexRaw = findControllerParam(controller, "index");
    const resolvedIndex = operation?.index ?? resolver?.resolveNumber("index") ?? parseNumber(indexRaw);
    if (indexRaw !== undefined && resolvedIndex === undefined) return undefined;
    const index = Math.trunc(resolvedIndex ?? 0);
    const rectRaw = findControllerParam(controller, "rect");
    const tuple = operation?.rect ?? resolver?.resolveRect("rect") ?? parseRect(rectRaw);
    if (rectRaw !== undefined && tuple === undefined) return undefined;
    const resolvedTuple = tuple ?? [0];
    const x1 = resolvedTuple[0] * valueScale;
    const y1 = (resolvedTuple[1] ?? 0) * valueScale;
    const x2 = (resolvedTuple[2] ?? 0) * valueScale;
    const y2 = (resolvedTuple[3] ?? 0) * valueScale;
    const rect: CollisionBox = {
      x1: Math.min(x1, x2), y1: Math.min(y1, y2),
      x2: Math.max(x1, x2), y2: Math.max(y1, y2),
    };
    state.clsnOverrides ??= [];
    state.clsnOverrides.push({ group, index, rect });
    return { kind: "collision", controllerType: "overrideclsn", group, index, rect: [rect.x1, rect.y1, rect.x2, rect.y2], ...(redirectPlayerIdExpression ? { redirectPlayerIdExpression } : {}) };
  }
}

export function applyCollisionOverrides(
  boxes: readonly CollisionBox[],
  overrides: readonly RuntimeCollisionOverride[] | undefined,
  group: 1 | 2 | 3,
): CollisionBox[] {
  const result = boxes.map((box) => ({ ...box }));
  for (const override of overrides ?? []) {
    if (override.group !== group) continue;
    const empty = override.rect.x1 === 0 && override.rect.y1 === 0 && override.rect.x2 === 0 && override.rect.y2 === 0;
    if (empty) {
      if (override.index === -1) result.length = 0;
      else if (override.index >= 0 && override.index < result.length) result.splice(override.index, 1);
    } else if (override.index === -1) {
      for (let index = 0; index < result.length; index += 1) result[index] = { ...override.rect };
    } else if (override.index >= result.length) {
      result.push({ ...override.rect });
    } else if (override.index >= 0) {
      result[override.index] = { ...override.rect };
    }
  }
  return result;
}

function resolveGroup(raw: string | undefined, dynamic: number | undefined): 0 | 1 | 2 | 3 | undefined {
  if (dynamic !== undefined) return dynamic >= 0 && dynamic <= 3 ? Math.trunc(dynamic) as 0 | 1 | 2 | 3 : undefined;
  const token = raw?.trim().toLowerCase();
  if (token === "none") return 0;
  if (token === "clsn1") return 1;
  if (token === "clsn2") return 2;
  if (token === "size") return 3;
  const numeric = parseNumber(raw);
  return numeric !== undefined && numeric >= 0 && numeric <= 3 ? Math.trunc(numeric) as 0 | 1 | 2 | 3 : undefined;
}

function parseNumber(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function parseRect(raw: string | undefined): [number, number?, number?, number?] | undefined {
  if (raw === undefined) return undefined;
  const values = raw.split(",").map((value) => Number(value.trim()));
  if (values.length < 1 || values.length > 4 || values.some((value) => !Number.isFinite(value))) return undefined;
  return values as [number, number?, number?, number?];
}
