import { describe, expect, it } from "vitest";
import { RuntimeRootPresentationWorld } from "../mugen/runtime/RuntimeRootPresentationSystem";

describe("RuntimeRootPresentationWorld", () => {
  it("promotes active Tag roots into side-ordered draw and camera lists", () => {
    const p1 = actor("p1", { standby: true });
    const p2 = actor("p2");
    const p3 = actor("p3", { overKo: true });

    const diagnostic = new RuntimeRootPresentationWorld().diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, p3],
      playableRoots: [p1, p2],
    });

    expect(diagnostic).toEqual({
      schema: "RuntimeRootPresentation/v0",
      mode: "ikemen-tag",
      roots: [
        expect.objectContaining({ id: "p1", side: 1, draw: false, drawReason: "standby-proxy", cameraX: false }),
        expect.objectContaining({ id: "p2", side: 2, draw: true, drawReason: "tag-active", cameraX: true }),
        expect.objectContaining({ id: "p3", side: 1, draw: true, drawReason: "tag-active", cameraX: true }),
      ],
      drawRootIds: ["p3", "p2"],
      cameraRootIds: ["p3", "p2"],
    });
  });

  it("keeps visibility and camera eligibility independent", () => {
    const p1 = actor("p1", { invisible: true });
    const p2 = actor("p2", { moveCameraX: false });

    const diagnostic = new RuntimeRootPresentationWorld().diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2],
      playableRoots: [p1, p2],
    });

    expect(diagnostic.drawRootIds).toEqual(["p2"]);
    expect(diagnostic.cameraRootIds).toEqual(["p1"]);
    expect(diagnostic.roots).toEqual([
      expect.objectContaining({ id: "p1", drawReason: "invisible", cameraReason: "tag-active" }),
      expect.objectContaining({ id: "p2", drawReason: "tag-active", cameraReason: "screenbound-disabled" }),
    ]);
  });

  it("does not fall back to standby roots when a Tag side has no eligible presentation", () => {
    const p1 = actor("p1", { standby: true });
    const p2 = actor("p2");
    const p3 = actor("p3", { standby: true });

    const oneSided = new RuntimeRootPresentationWorld().diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, p3],
      playableRoots: [p1, p2],
    });
    expect(oneSided.drawRootIds).toEqual(["p2"]);
    expect(oneSided.cameraRootIds).toEqual(["p2"]);

    p2.runtime.teamState.standby = true;
    const empty = new RuntimeRootPresentationWorld().diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, p3],
      playableRoots: [p1, p2],
    });
    expect(empty.drawRootIds).toEqual([]);
    expect(empty.cameraRootIds).toEqual([]);
  });

  it("fails Tag presentation closed for unavailable and invalid roots", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const roots = [
      actor("p3", { disabled: true }),
      actor("p5", { playerType: false }),
      actor("invalid"),
      { id: "p7", runtime: {} },
    ];

    const diagnostic = new RuntimeRootPresentationWorld().diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, ...roots],
      playableRoots: [p1, p2],
    });

    expect(diagnostic.roots.slice(2).map(({ drawReason, cameraReason }) => [drawReason, cameraReason])).toEqual([
      ["disabled", "disabled"],
      ["non-player", "non-player"],
      ["invalid-side", "invalid-side"],
      ["missing-team-state", "missing-team-state"],
    ]);
  });

  it("preserves pair presentation outside explicit IKEMEN Tag mode", () => {
    const p1 = actor("p1", { disabled: true, invisible: true, moveCameraX: false });
    const p2 = actor("p2");
    const p3 = actor("p3");

    for (const [runtimeProfile, teamMode] of [["ikemen-go", "single"], ["mugen-1.1", "tag"]] as const) {
      const diagnostic = new RuntimeRootPresentationWorld().diagnostic({
        runtimeProfile,
        teamMode,
        roots: [p1, p2, p3],
        playableRoots: [p1, p2],
      });
      expect(diagnostic.mode).toBe("pair");
      expect(diagnostic.drawRootIds).toEqual(["p1", "p2"]);
      expect(diagnostic.cameraRootIds).toEqual(["p1", "p2"]);
    }

    const left = actor("left");
    const right = actor("right");
    expect(new RuntimeRootPresentationWorld().diagnostic({
      runtimeProfile: "mugen-1.1",
      teamMode: "single",
      roots: [left, right],
      playableRoots: [left, right],
    })).toMatchObject({ drawRootIds: ["left", "right"], cameraRootIds: ["left", "right"] });
  });

  it("rejects duplicate roots and an invalid playable pair", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const world = new RuntimeRootPresentationWorld();

    expect(() => world.diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, p1],
      playableRoots: [p1, p2],
    })).toThrow("Duplicate root presentation actor object p1");
    expect(() => world.diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2],
      playableRoots: [p1, p1],
    })).toThrow("Root presentation playable pair must contain two distinct registered roots");
  });
});

function actor(
  id: string,
  overrides: Partial<{
    disabled: boolean;
    standby: boolean;
    overKo: boolean;
    playerType: boolean;
    invisible: boolean;
    moveCameraX: boolean;
  }> = {},
) {
  return {
    id,
    runtime: {
      teamState: {
        disabled: false,
        standby: false,
        overKo: false,
        playerType: true,
        ...overrides,
      },
      assertSpecial: { invisible: overrides.invisible },
      screenBound: { moveCameraX: overrides.moveCameraX ?? true },
    },
  };
}
