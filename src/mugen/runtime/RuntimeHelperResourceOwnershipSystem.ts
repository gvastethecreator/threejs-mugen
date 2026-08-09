export const RUNTIME_HELPER_RESOURCE_OWNERSHIP_SCHEMA =
  "mugen-web-sandbox/runtime-helper-resource-ownership/v0";

export type RuntimeHelperResourceKind = "life" | "power" | "red-life";
export type RuntimeHelperResourceOwnershipMode = "local" | "team-shared" | "rejected";

export type RuntimeHelperResourceOwnershipInput = {
  helperId: string;
  rootId: string;
  teamSide?: 1 | 2;
  kind: RuntimeHelperResourceKind;
  teamShareEnabled: boolean;
  explicitRedirectId?: number;
};

export type RuntimeHelperResourceOwnershipSnapshot = {
  schema: typeof RUNTIME_HELPER_RESOURCE_OWNERSHIP_SCHEMA;
  helperId: string;
  rootId: string;
  kind: RuntimeHelperResourceKind;
  mode: RuntimeHelperResourceOwnershipMode;
  resourceOwnerId?: string;
  reason: string;
};

export type RuntimeHelperResourceOwnershipMatrix = {
  schema: typeof RUNTIME_HELPER_RESOURCE_OWNERSHIP_SCHEMA;
  entries: RuntimeHelperResourceOwnershipSnapshot[];
  duplicateOwnerIds: string[];
  rejectedHelperIds: string[];
};

/** Conservative, read-only ownership oracle for Helper resource writes. */
export class RuntimeHelperResourceOwnershipWorld {
  snapshot(input: RuntimeHelperResourceOwnershipInput): RuntimeHelperResourceOwnershipSnapshot {
    const helperId = input.helperId.trim();
    const rootId = input.rootId.trim();
    if (!helperId || !rootId) {
      return {
        schema: RUNTIME_HELPER_RESOURCE_OWNERSHIP_SCHEMA,
        helperId,
        rootId,
        kind: input.kind,
        mode: "rejected",
        reason: "missing-helper-or-root-id",
      };
    }
    if (input.explicitRedirectId !== undefined) {
      return {
        schema: RUNTIME_HELPER_RESOURCE_OWNERSHIP_SCHEMA,
        helperId,
        rootId,
        kind: input.kind,
        mode: "rejected",
        reason: "helper-resource-redirect-unimplemented",
      };
    }
    return {
      schema: RUNTIME_HELPER_RESOURCE_OWNERSHIP_SCHEMA,
      helperId,
      rootId,
      kind: input.kind,
      mode: "local",
      resourceOwnerId: helperId,
      reason: input.teamShareEnabled
        ? "helper-local-until-team-share-contract"
        : "helper-local-resource",
    };
  }

  matrix(inputs: readonly RuntimeHelperResourceOwnershipInput[]): RuntimeHelperResourceOwnershipMatrix {
    const entries = inputs.map((input) => this.snapshot(input));
    const ownerCounts = new Map<string, { ownerId: string; kind: RuntimeHelperResourceKind; count: number }>();
    for (const entry of entries) {
      if (entry.mode === "local" && entry.resourceOwnerId) {
        const key = `${entry.kind}:${entry.resourceOwnerId}`;
        const current = ownerCounts.get(key);
        ownerCounts.set(key, current
          ? { ...current, count: current.count + 1 }
          : { ownerId: entry.resourceOwnerId, kind: entry.kind, count: 1 });
      }
    }
    return {
      schema: RUNTIME_HELPER_RESOURCE_OWNERSHIP_SCHEMA,
      entries,
      duplicateOwnerIds: [...ownerCounts.values()]
        .filter((entry) => entry.count > 1)
        .map((entry) => `${entry.kind}:${entry.ownerId}`)
        .sort(),
      rejectedHelperIds: entries
        .filter((entry) => entry.mode === "rejected")
        .map((entry) => entry.helperId)
        .filter(Boolean)
        .sort(),
    };
  }

  /** Mutation gate: only an unambiguous local Helper owner may write. */
  admitLocalWrite(snapshot: RuntimeHelperResourceOwnershipSnapshot): boolean {
    return snapshot.mode === "local" && snapshot.resourceOwnerId === snapshot.helperId;
  }
}
