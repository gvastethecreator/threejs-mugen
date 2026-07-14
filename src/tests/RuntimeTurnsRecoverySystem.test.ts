import { describe, expect, it } from "vitest";
import {
  DEFAULT_RUNTIME_TURNS_RECOVERY_RATE,
  RuntimeTurnsRecoveryWorld,
} from "../mugen/runtime/RuntimeTurnsRecoverySystem";

describe("RuntimeTurnsRecoveryWorld", () => {
  it("uses the official rate with remaining round ticks and clamps the winner", () => {
    const result = new RuntimeTurnsRecoveryWorld().prepare({
      actors: [
        { id: "p1", life: 400, lifeMax: 1000 },
        { id: "p2", life: 0, lifeMax: 1000 },
      ],
      winnerId: "p1",
      timeTicks: 300,
    });

    expect(result).toMatchObject({
      schema: "mugen-web-sandbox/runtime-turns-recovery/v0",
      timeTicks: 300,
      rate: DEFAULT_RUNTIME_TURNS_RECOVERY_RATE,
      diagnostics: [],
      states: [
        { actorId: "p1", lifeBefore: 400, lifeAfter: 416, recoveryAmount: 16, eligible: true },
        { actorId: "p2", lifeBefore: 0, lifeAfter: 0, recoveryAmount: 0, eligible: false },
      ],
    });
  });

  it("does not recover a terminal match or malformed duplicate actor", () => {
    const result = new RuntimeTurnsRecoveryWorld().prepare({
      actors: [
        { id: "p1", life: 900, lifeMax: 1000 },
        { id: "p1", life: 100, lifeMax: 1000 },
        { id: "p2", life: 500, lifeMax: 1000 },
      ],
      winnerId: "p1",
      timeTicks: 600,
      matchOver: true,
    });

    expect(result).toMatchObject({
      diagnostics: ["duplicate-actor:p1"],
      states: [
        { actorId: "p1", lifeBefore: 900, lifeAfter: 900, recoveryAmount: 0, eligible: false },
        { actorId: "p2", lifeBefore: 500, lifeAfter: 500, recoveryAmount: 0, eligible: false },
      ],
    });
  });
});
