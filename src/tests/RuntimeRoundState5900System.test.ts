import { describe, expect, it } from "vitest";
import { RuntimeRoundState5900World } from "../mugen/runtime/RuntimeRoundState5900System";

describe("RuntimeRoundState5900World", () => {
  it("preflights the official state 5900 route per root", () => {
    const result = new RuntimeRoundState5900World().prepare([
      { id: "p1", stateIds: [0, 5900] },
      { id: "p2", stateIds: [0] },
    ]);

    expect(result).toEqual({
      schema: "mugen-web-sandbox/runtime-round-state-5900/v0",
      stateNo: 5900,
      actors: [
        { actorId: "p1", stateNo: 5900, status: "available" },
        { actorId: "p2", stateNo: 5900, status: "unavailable" },
      ],
      availableActorIds: ["p1"],
      unavailableActorIds: ["p2"],
      diagnostics: ["state-5900-unavailable"],
    });
  });

  it("fails closed for invalid and duplicate roots", () => {
    const result = new RuntimeRoundState5900World().prepare([
      { id: "", stateIds: [5900] },
      { id: "p1", stateIds: [5900] },
      { id: "p1", stateIds: [5900] },
    ]);

    expect(result.availableActorIds).toEqual(["p1"]);
    expect(result.diagnostics).toEqual(["duplicate-actor:p1", "invalid-actor-id"]);
  });
});
