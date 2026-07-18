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

  it("publishes selected source precedence and shadowed state-5900 files", () => {
    const result = new RuntimeRoundState5900World().prepare([
      {
        id: "p1",
        stateIds: [5900],
        stateSources: [{
          stateId: 5900,
          selected: { kind: "character", path: "chars/kfm/kfm.cns", fingerprint: "fnv1a32:11111111" },
          shadowed: [{ kind: "common", path: "data/common1.cns", fingerprint: "fnv1a32:22222222" }],
          reason: "character-override",
        }],
      },
    ]);

    expect(result.actors[0]).toEqual({
      actorId: "p1",
      stateNo: 5900,
      status: "available",
      provenance: {
        schema: "mugen-web-sandbox/runtime-round-state-5900-provenance/v1",
        stateNo: 5900,
        status: "resolved",
        selected: { layer: "character", path: "chars/kfm/kfm.cns", fingerprint: "fnv1a32:11111111" },
        precedence: "character-override",
        shadowed: [{ layer: "common", path: "data/common1.cns", fingerprint: "fnv1a32:22222222" }],
        appended: [],
      },
    });
  });

  it("records appended negative-state sources and missing selection separately", () => {
    const result = new RuntimeRoundState5900World().prepare([
      {
        id: "p1",
        stateIds: [5900],
        stateSources: [{
          stateId: 5900,
          selected: { kind: "common", path: "data/common1.cns", fingerprint: "fnv1a32:33333333" },
          shadowed: [],
          appended: [{ kind: "character", path: "chars/kfm/override.cns", fingerprint: "fnv1a32:44444444" }],
          reason: "ikemen-negative-merge",
        }],
      },
      { id: "p2", stateIds: [5900], stateSources: [] },
      { id: "p3", stateIds: [], stateSources: [] },
    ]);

    expect(result.actors).toEqual([
      expect.objectContaining({
        actorId: "p1",
        provenance: expect.objectContaining({
          precedence: "ikemen-negative-merge",
          appended: [{ layer: "character", path: "chars/kfm/override.cns", fingerprint: "fnv1a32:44444444" }],
        }),
      }),
      expect.objectContaining({
        actorId: "p2",
        provenance: { schema: "mugen-web-sandbox/runtime-round-state-5900-provenance/v1", stateNo: 5900, status: "unknown", shadowed: [], appended: [], reason: "state-source-selection-missing" },
      }),
      expect.objectContaining({
        actorId: "p3",
        provenance: { schema: "mugen-web-sandbox/runtime-round-state-5900-provenance/v1", stateNo: 5900, status: "unavailable", shadowed: [], appended: [], reason: "state-not-available" },
      }),
    ]);
  });

  it("keeps legacy actors free of optional provenance", () => {
    const result = new RuntimeRoundState5900World().prepare([{ id: "demo", stateIds: [5900] }]);

    expect(result.actors[0]).toEqual({ actorId: "demo", stateNo: 5900, status: "available" });
  });
});
