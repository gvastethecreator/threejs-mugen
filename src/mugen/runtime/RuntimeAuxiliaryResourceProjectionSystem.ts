import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { CharacterRuntimeState, RuntimeTeamState } from "./types";

export const RUNTIME_AUXILIARY_RESOURCE_PROJECTION_SCHEMA =
  "mugen-web-sandbox/runtime-auxiliary-resource-projection/v0";

export type RuntimeAuxiliaryResourceActorKind = "root" | "helper";
export type RuntimeAuxiliaryResourceStatus = "available" | "unimplemented";

export type RuntimeAuxiliaryResourceRuntimeState = Pick<
  CharacterRuntimeState,
  "life" | "lifeMax" | "redLife" | "guardPoints" | "guardPointsMax" | "assertSpecial"
> & {
  dizzyPoints?: number;
  dizzyPointsMax?: number;
};

export type RuntimeAuxiliaryResourceProjectionInputActor = {
  id: string;
  actorKind: RuntimeAuxiliaryResourceActorKind;
  rootId: string;
  parentId: string;
  resourceOwnerId: string;
  side: RuntimeTeamSide;
  memberNo?: number;
  rootOrder?: number;
  runOrder?: number;
  teamState?: RuntimeTeamState;
  runtime: RuntimeAuxiliaryResourceRuntimeState;
};

export type RuntimeAuxiliaryResourceValue = {
  status: RuntimeAuxiliaryResourceStatus;
  ownerId: string;
  scope: "actor-local";
  value?: number;
  max?: number;
};

export type RuntimeAuxiliaryResourceProjectionActor = {
  id: string;
  actorKind: RuntimeAuxiliaryResourceActorKind;
  rootId: string;
  parentId: string;
  resourceOwnerId: string;
  side: RuntimeTeamSide;
  memberNo?: number;
  rootOrder?: number;
  runOrder?: number;
  teamState?: RuntimeTeamState;
  resources: {
    redLife: RuntimeAuxiliaryResourceValue;
    guardPoints: RuntimeAuxiliaryResourceValue;
    dizzyPoints: RuntimeAuxiliaryResourceValue;
  };
};

export type RuntimeAuxiliaryResourceProjectionDiagnostic = {
  schema: typeof RUNTIME_AUXILIARY_RESOURCE_PROJECTION_SCHEMA;
  tick: number;
  ownership: {
    redLife: {
      owner: "actor";
      share: "deferred-root-life-share";
    };
    guardPoints: {
      owner: "actor";
      share: "none";
    };
    dizzyPoints: {
      owner: "actor";
      share: "none";
    };
  };
  mutation: {
    redLife: "bounded";
    guardPoints: "bounded";
    dizzyPoints: "unimplemented";
  };
  suppression: {
    redLife: "unimplemented";
    guardPoints: "unimplemented";
    dizzyPoints: "unimplemented";
  };
  excludedActorKinds: ["projectile", "explod"];
  actors: RuntimeAuxiliaryResourceProjectionActor[];
  diagnostics: string[];
};

export type RuntimeAuxiliaryResourceProjectionInput = {
  actors: readonly RuntimeAuxiliaryResourceProjectionInputActor[];
  tick?: number;
};

export class RuntimeAuxiliaryResourceProjectionWorld {
  snapshot(input: RuntimeAuxiliaryResourceProjectionInput): RuntimeAuxiliaryResourceProjectionDiagnostic {
    const diagnostics: string[] = [];
    const seenIds = new Set<string>();
    const normalizedActors: RuntimeAuxiliaryResourceProjectionActor[] = [];
    const rootIds = new Set<string>();

    for (const actor of input.actors) {
      const id = actor.id.trim();
      if (!id) {
        diagnostics.push("invalid-actor-id");
        continue;
      }
      if (seenIds.has(id)) {
        diagnostics.push(`duplicate-actor:${id}`);
        continue;
      }
      seenIds.add(id);
      if (actor.actorKind !== "root" && actor.actorKind !== "helper") {
        diagnostics.push(`invalid-actor-kind:${id}`);
        continue;
      }
      if (actor.side !== 1 && actor.side !== 2) {
        diagnostics.push(`invalid-side:${id}`);
        continue;
      }
      const rootId = actor.rootId.trim();
      if (!rootId) {
        diagnostics.push(`invalid-root-id:${id}`);
        continue;
      }
      const parentId = actor.parentId.trim();
      if (!parentId) {
        diagnostics.push(`invalid-parent-id:${id}`);
        continue;
      }
      const resourceOwnerId = actor.resourceOwnerId.trim();
      if (!resourceOwnerId) {
        diagnostics.push(`invalid-resource-owner:${id}`);
        continue;
      }
      if (actor.actorKind === "root") {
        rootIds.add(id);
      }
      if (!Number.isFinite(actor.runtime.life)) {
        diagnostics.push(`invalid-life:${id}`);
      }
      const resolvedLifeMax = lifeMax(actor.runtime, id, diagnostics);
      const resolvedGuardPointsMax = guardPointsMax(actor.runtime, id, diagnostics);

      normalizedActors.push({
        id,
        actorKind: actor.actorKind,
        rootId,
        parentId,
        resourceOwnerId,
        side: actor.side,
        ...(actor.memberNo === undefined ? {} : { memberNo: actor.memberNo }),
        ...(actor.rootOrder === undefined ? {} : { rootOrder: actor.rootOrder }),
        ...(actor.runOrder === undefined ? {} : { runOrder: actor.runOrder }),
        ...(actor.teamState ? { teamState: cloneTeamState(actor.teamState) } : {}),
        resources: {
          redLife: availableResource(
            resourceOwnerId,
            normalizeValue(actor.runtime.redLife, 0, resolvedLifeMax, id, "red-life", diagnostics),
            resolvedLifeMax,
          ),
          guardPoints: availableResource(
            resourceOwnerId,
            normalizeValue(
              actor.runtime.guardPoints,
              resolvedGuardPointsMax,
              resolvedGuardPointsMax,
              id,
              "guard-points",
              diagnostics,
            ),
            resolvedGuardPointsMax,
          ),
          dizzyPoints: dizzyResource(actor.runtime, resourceOwnerId, id, resolvedLifeMax, diagnostics),
        },
      });
    }

    for (const actor of normalizedActors) {
      if (actor.actorKind === "helper" && !rootIds.has(actor.rootId)) {
        diagnostics.push(`orphan-helper-root:${actor.id}:${actor.rootId}`);
      }
    }

    normalizedActors.sort(compareActors);
    return {
      schema: RUNTIME_AUXILIARY_RESOURCE_PROJECTION_SCHEMA,
      tick: normalizeTick(input.tick),
      ownership: {
        redLife: { owner: "actor", share: "deferred-root-life-share" },
        guardPoints: { owner: "actor", share: "none" },
        dizzyPoints: { owner: "actor", share: "none" },
      },
      mutation: {
        redLife: "bounded",
        guardPoints: "bounded",
        dizzyPoints: "unimplemented",
      },
      suppression: {
        redLife: "unimplemented",
        guardPoints: "unimplemented",
        dizzyPoints: "unimplemented",
      },
      excludedActorKinds: ["projectile", "explod"],
      actors: normalizedActors,
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }
}

function availableResource(ownerId: string, value: number, max: number): RuntimeAuxiliaryResourceValue {
  return {
    status: "available",
    ownerId,
    scope: "actor-local",
    value,
    max,
  };
}

function dizzyResource(
  runtime: RuntimeAuxiliaryResourceRuntimeState,
  ownerId: string,
  actorId: string,
  fallbackMax: number,
  diagnostics: string[],
): RuntimeAuxiliaryResourceValue {
  if (runtime.dizzyPoints === undefined && runtime.dizzyPointsMax === undefined) {
    return {
      status: "unimplemented",
      ownerId,
      scope: "actor-local",
    };
  }
  const max = positiveMax(runtime.dizzyPointsMax, fallbackMax, actorId, "dizzy-points-max", diagnostics);
  const value = normalizeValue(runtime.dizzyPoints, max, max, actorId, "dizzy-points", diagnostics);
  return availableResource(ownerId, value, max);
}

function lifeMax(
  runtime: RuntimeAuxiliaryResourceRuntimeState,
  actorId: string,
  diagnostics: string[],
): number {
  return positiveMax(runtime.lifeMax, 1000, actorId, "life-max", diagnostics);
}

function guardPointsMax(
  runtime: RuntimeAuxiliaryResourceRuntimeState,
  actorId: string,
  diagnostics: string[],
): number {
  const fallback = lifeMax(runtime, actorId, diagnostics);
  return positiveMax(runtime.guardPointsMax, fallback, actorId, "guard-points-max", diagnostics);
}

function positiveMax(
  value: number | undefined,
  fallback: number,
  actorId: string,
  label: string,
  diagnostics: string[],
): number {
  if (value === undefined) return fallback;
  if (Number.isFinite(value) && value > 0) return value;
  diagnostics.push(`invalid-${label}:${actorId}`);
  return fallback;
}

function normalizeValue(
  value: number | undefined,
  fallback: number,
  max: number,
  actorId: string,
  label: string,
  diagnostics: string[],
): number {
  if (value !== undefined && !Number.isFinite(value)) {
    diagnostics.push(`invalid-${label}:${actorId}`);
    return fallback;
  }
  const normalized = Math.max(0, Math.min(max, value ?? fallback));
  if (value !== undefined && normalized !== value) {
    diagnostics.push(`clamped-${label}:${actorId}`);
  }
  return normalized;
}

function cloneTeamState(teamState: RuntimeTeamState): RuntimeTeamState {
  return { ...teamState };
}

function compareActors(
  left: RuntimeAuxiliaryResourceProjectionActor,
  right: RuntimeAuxiliaryResourceProjectionActor,
): number {
  if (left.side !== right.side) return left.side - right.side;
  if (left.rootOrder !== undefined && right.rootOrder !== undefined && left.rootOrder !== right.rootOrder) {
    return left.rootOrder - right.rootOrder;
  }
  if (left.rootOrder !== undefined && right.rootOrder === undefined) return -1;
  if (right.rootOrder !== undefined && left.rootOrder === undefined) return 1;
  if (left.actorKind !== right.actorKind) return left.actorKind === "root" ? -1 : 1;
  if (left.memberNo !== undefined && right.memberNo !== undefined && left.memberNo !== right.memberNo) {
    return left.memberNo - right.memberNo;
  }
  if (left.memberNo !== undefined) return -1;
  if (right.memberNo !== undefined) return 1;
  if (left.rootId !== right.rootId) return compareStableStrings(left.rootId, right.rootId);
  if (left.runOrder !== undefined && right.runOrder !== undefined && left.runOrder !== right.runOrder) {
    return left.runOrder - right.runOrder;
  }
  if (left.runOrder !== undefined && right.runOrder === undefined) return -1;
  if (right.runOrder !== undefined && left.runOrder === undefined) return 1;
  return compareStableStrings(left.id, right.id);
}

function normalizeTick(tick: number | undefined): number {
  return Number.isFinite(tick) ? Math.max(0, Math.round(tick!)) : 0;
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
