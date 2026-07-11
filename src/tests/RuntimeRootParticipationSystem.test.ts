import { describe, expect, it } from "vitest";
import { RuntimeRootParticipationWorld } from "../mugen/runtime/RuntimeRootParticipationSystem";

describe("RuntimeRootParticipationWorld", () => {
  it("keeps structural state separate from per-consumer ownership", () => {
    const diagnostic = new RuntimeRootParticipationWorld().diagnostic({
      roots: [
        {
          id: "p1",
          side: 1,
          teamState: { disabled: false, standby: false, overKo: false, playerType: true },
        },
        {
          id: "p3",
          side: 1,
          teamState: { disabled: false, standby: true, overKo: false, playerType: true },
        },
      ],
      scheduledRootIds: ["p1"],
      inputOwnedRootIds: ["p1"],
      combatOwnedRootIds: ["p1"],
      roundOwnedRootIds: ["p1"],
      presentedRootIds: ["p1"],
      effectStoreOwnedRootIds: ["p1"],
    });

    expect(diagnostic).toEqual({
      schema: "RuntimeRootParticipation/v0",
      activeRootIdsBySide: { 1: ["p1"], 2: [] },
      roots: [
        {
          id: "p1",
          side: 1,
          owned: true,
          disabled: false,
          standby: false,
          structurallyActive: true,
          scheduled: true,
          inputOwned: true,
          combatOwned: true,
          roundOwned: true,
          presented: true,
          effectStoreOwned: true,
        },
        {
          id: "p3",
          side: 1,
          owned: true,
          disabled: false,
          standby: true,
          structurallyActive: false,
          scheduled: false,
          inputOwned: false,
          combatOwned: false,
          roundOwned: false,
          presented: false,
          effectStoreOwned: false,
        },
      ],
    });
  });
});
