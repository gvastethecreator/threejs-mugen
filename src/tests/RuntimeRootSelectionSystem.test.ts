import { describe, expect, it } from "vitest";
import { RuntimeRootSelectionWorld } from "../mugen/runtime/RuntimeRootSelectionSystem";

describe("RuntimeRootSelectionWorld", () => {
  it("separates partner, Enemy, and P2 policies", () => {
    const diagnostic = new RuntimeRootSelectionWorld().diagnostic([
      { id: "p1" },
      { id: "p2" },
      { id: "p3", standby: true },
      { id: "p4", overKo: true },
      { id: "p5", disabled: true },
      { id: "p6", standby: true },
      { id: "p2-helper-0", rootId: "p2", playerType: true },
      { id: "neutral" },
    ]);

    expect(diagnostic.schema).toBe("RuntimeRootSelection/v0");
    expect(diagnostic.entries.find((entry) => entry.actorId === "p1")).toEqual({
      actorId: "p1",
      side: 1,
      partnerIds: ["p3", "p5"],
      enemyIds: ["p2", "p4"],
      p2CandidateIds: ["p2"],
    });
    expect(diagnostic.entries.find((entry) => entry.actorId === "p3")?.partnerIds).toEqual(["p1", "p5"]);
    expect(diagnostic.entries.some((entry) => entry.actorId === "neutral")).toBe(false);
  });
});
