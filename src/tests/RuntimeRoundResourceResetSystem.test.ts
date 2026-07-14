import { describe, expect, it } from "vitest";
import { RuntimeRoundResourceResetWorld } from "../mugen/runtime/RuntimeRoundResourceResetSystem";

describe("RuntimeRoundResourceResetWorld", () => {
  it("restores life, preserves bounded round resources, and clears red life", () => {
    const world = new RuntimeRoundResourceResetWorld();

    const result = world.prepare({
      mode: "tag",
      nextRoundNo: 2,
      actors: [
        {
          id: "p1",
          life: 700,
          lifeMax: 1000,
          power: 1700,
          powerMax: 3000,
          guardPoints: 200,
          guardPointsMax: 1000,
          dizzyPoints: 300,
          dizzyPointsMax: 1000,
          redLife: 900,
        },
        {
          id: "p2",
          life: 0,
          lifeMax: 1200,
          power: 4000,
          powerMax: 3000,
          guardPoints: -10,
          dizzyPoints: 1400,
        },
      ],
    });

    expect(result).toMatchObject({
      schema: "mugen-web-sandbox/runtime-round-resource-reset/v0",
      nextRoundNo: 2,
      roundsExisted: 1,
      diagnostics: [],
    });
    expect(result.states).toEqual([
      {
        actorId: "p1",
        lifeBefore: 700,
        lifeAfter: 1000,
        powerBefore: 1700,
        powerAfter: 1700,
        guardPointsBefore: 200,
        guardPointsAfter: 200,
        dizzyPointsBefore: 300,
        dizzyPointsAfter: 300,
        redLifeBefore: 900,
        redLifeAfter: 0,
      },
      {
        actorId: "p2",
        lifeBefore: 0,
        lifeAfter: 1200,
        powerBefore: 4000,
        powerAfter: 3000,
        guardPointsBefore: 0,
        guardPointsAfter: 0,
        dizzyPointsBefore: 1400,
        dizzyPointsAfter: 1000,
        redLifeBefore: 0,
        redLifeAfter: 0,
      },
    ]);
  });

  it("keeps the turns winner alive while restoring the other member", () => {
    const result = new RuntimeRoundResourceResetWorld().prepare({
      mode: "turns",
      winnerId: "p1",
      actors: [
        { id: "p1", life: 420, power: 800, guardPoints: 40, dizzyPoints: 90 },
        { id: "p2", life: 0, power: 500, guardPoints: 60, dizzyPoints: 120 },
      ],
    });

    expect(result.states).toEqual([
      expect.objectContaining({ actorId: "p1", lifeBefore: 420, lifeAfter: 420 }),
      expect.objectContaining({ actorId: "p2", lifeBefore: 0, lifeAfter: 1000 }),
    ]);
  });

  it("gives a KO turns winner the minimum surviving life and reports malformed ids", () => {
    const result = new RuntimeRoundResourceResetWorld().prepare({
      mode: "turns",
      winnerId: "p1",
      nextRoundNo: 3.8,
      actors: [
        { id: "p1", life: 0, power: 0, guardPoints: 0, dizzyPoints: 0 },
        { id: "p1", life: 400, power: 0, guardPoints: 0, dizzyPoints: 0 },
        { id: " ", life: 400, power: 0, guardPoints: 0, dizzyPoints: 0 },
      ],
    });

    expect(result.nextRoundNo).toBe(3);
    expect(result.roundsExisted).toBe(2);
    expect(result.states[0]).toMatchObject({ actorId: "p1", lifeAfter: 1 });
    expect(result.diagnostics).toEqual(["duplicate-actor:p1", "invalid-actor-id"]);
  });
});
