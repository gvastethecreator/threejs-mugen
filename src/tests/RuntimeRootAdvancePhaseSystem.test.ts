import { describe, expect, it } from "vitest";
import { RuntimeRootAdvancePhaseWorld } from "../mugen/runtime/RuntimeRootAdvancePhaseSystem";

describe("RuntimeRootAdvancePhaseWorld", () => {
  it("snapshots playable, active-motion, and bounded-standby Tag phases", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p3 = actor("p3", { standby: true });
    const world = new RuntimeRootAdvancePhaseWorld();

    const before = world.snapshot({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, p3],
      playableRoots: [p1, p2],
    });
    p1.runtime.teamState.standby = true;
    p3.runtime.teamState.standby = false;
    const after = world.snapshot({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, p3],
      playableRoots: [p1, p2],
    });

    expect(before.entries.map(({ actorId, phase }) => [actorId, phase])).toEqual([
      ["p1", "playable"],
      ["p2", "playable"],
      ["p3", "bounded-standby"],
    ]);
    expect(before.phaseOf(p1)).toBe("playable");
    expect(before.phaseOf(p3)).toBe("bounded-standby");
    expect(after.phaseOf(p1)).toBe("bounded-standby");
    expect(after.phaseOf(p3)).toBe("active-motion");
  });

  it("keeps Single and legacy reserves bounded", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p3 = actor("p3");
    const world = new RuntimeRootAdvancePhaseWorld();

    for (const [runtimeProfile, teamMode] of [["ikemen-go", "single"], ["mugen-1.1", "tag"]] as const) {
      const snapshot = world.snapshot({ runtimeProfile, teamMode, roots: [p1, p2, p3], playableRoots: [p1, p2] });
      expect(snapshot.entries.map(({ phase }) => phase)).toEqual(["playable", "playable", "bounded-standby"]);
    }
  });

  it("fails new motion closed for unavailable roots and invalid topology", () => {
    const p1 = actor("p1", { overKo: true });
    const p2 = actor("p2");
    const roots = [
      actor("p3", { disabled: true }),
      actor("p5", { playerType: false }),
      actor("p7", { overKo: true }),
      actor("invalid"),
    ];
    const world = new RuntimeRootAdvancePhaseWorld();
    const snapshot = world.snapshot({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, ...roots],
      playableRoots: [p1, p2],
    });

    expect(snapshot.phaseOf(p1)).toBe("bounded-standby");
    expect(roots.map((root) => snapshot.phaseOf(root))).toEqual([
      "bounded-standby",
      "bounded-standby",
      "bounded-standby",
      "bounded-standby",
    ]);
    expect(() => snapshot.phaseOf(actor("p8"))).toThrow("Unknown root advance actor p8");
    expect(() => world.snapshot({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots: [p1, p2, p1],
      playableRoots: [p1, p2],
    })).toThrow("Duplicate root advance actor object p1");
  });
});

function actor(
  id: string,
  overrides: Partial<{ disabled: boolean; standby: boolean; overKo: boolean; playerType: boolean }> = {},
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
    },
  };
}
