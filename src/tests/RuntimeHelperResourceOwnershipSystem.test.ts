import { describe, expect, it } from "vitest";
import { RuntimeHelperResourceOwnershipWorld } from "../mugen/runtime/RuntimeHelperResourceOwnershipSystem";

describe("RuntimeHelperResourceOwnershipWorld", () => {
  const world = new RuntimeHelperResourceOwnershipWorld();

  it("keeps helper power local when team sharing is enabled but not sourced", () => {
    expect(world.snapshot({
      helperId: "helper-7",
      rootId: "p1",
      teamSide: 1,
      kind: "power",
      teamShareEnabled: true,
    })).toMatchObject({
      mode: "local",
      resourceOwnerId: "helper-7",
      reason: "helper-local-until-team-share-contract",
    });
  });

  it("rejects helper RedirectID resource ownership fail-closed", () => {
    expect(world.snapshot({
      helperId: "helper-7",
      rootId: "p1",
      kind: "red-life",
      teamShareEnabled: false,
      explicitRedirectId: 42,
    })).toMatchObject({ mode: "rejected", reason: "helper-resource-redirect-unimplemented" });
  });

  it("rejects missing lifecycle identity", () => {
    expect(world.snapshot({
      helperId: "",
      rootId: "p1",
      kind: "life",
      teamShareEnabled: false,
    })).toMatchObject({ mode: "rejected", reason: "missing-helper-or-root-id" });
  });

  it("builds a fail-closed matrix before shared-bank mutation", () => {
    const matrix = world.matrix([
      { helperId: "helper-7", rootId: "p1", kind: "life", teamShareEnabled: true },
      { helperId: "helper-7", rootId: "p1", kind: "life", teamShareEnabled: true },
      { helperId: "helper-8", rootId: "p2", kind: "red-life", teamShareEnabled: false, explicitRedirectId: 9 },
    ]);
    expect(matrix.entries).toHaveLength(3);
    expect(matrix.duplicateOwnerIds).toEqual(["life:helper-7"]);
    expect(matrix.rejectedHelperIds).toEqual(["helper-8"]);
  });

  it("admits only an unambiguous local owner for mutation", () => {
    const local = world.snapshot({ helperId: "helper-7", rootId: "p1", kind: "life", teamShareEnabled: false });
    const redirected = world.snapshot({ helperId: "helper-7", rootId: "p1", kind: "life", teamShareEnabled: false, explicitRedirectId: 2 });
    expect(world.admitLocalWrite(local)).toBe(true);
    expect(world.admitLocalWrite(redirected)).toBe(false);
  });
});
