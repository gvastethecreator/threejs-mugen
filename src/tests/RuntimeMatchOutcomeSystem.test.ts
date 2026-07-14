import { describe, expect, it } from "vitest";
import { RuntimeMatchOutcomeSystem } from "../mugen/runtime/RuntimeMatchOutcomeSystem";

describe("RuntimeMatchOutcomeSystem", () => {
  it("records round wins without treating a draw as a score", () => {
    const outcome = new RuntimeMatchOutcomeSystem("single", 2);

    expect(outcome.recordRound()).toMatchObject({
      outcome: "draw",
      roundsExisted: 1,
      draws: 1,
      wins: { 1: 0, 2: 0 },
      matchOver: false,
    });
    expect(outcome.recordRound(1)).toMatchObject({
      outcome: "round-win",
      roundsExisted: 2,
      wins: { 1: 1, 2: 0 },
      winsBefore: { 1: 0, 2: 0 },
      winsAfter: { 1: 1, 2: 0 },
    });
  });

  it("closes the match at the configured score and rejects later scoring", () => {
    const outcome = new RuntimeMatchOutcomeSystem("tag", 2);

    outcome.recordRound(2);
    const matchWin = outcome.recordRound(2);
    expect(matchWin).toMatchObject({
      outcome: "match-win",
      matchOver: true,
      winnerSide: 2,
      wins: { 1: 0, 2: 2 },
    });

    expect(outcome.recordRound(1)).toMatchObject({
      outcome: "match-over",
      diagnostics: ["match-already-over"],
      wins: { 1: 0, 2: 2 },
    });
  });

  it("resets score state independently from runtime round resources", () => {
    const outcome = new RuntimeMatchOutcomeSystem("turns", 1);
    outcome.recordRound(1);
    expect(outcome.isOver).toBe(true);

    outcome.reset();

    expect(outcome.snapshot()).toEqual({
      schema: "mugen-web-sandbox/runtime-match-outcome/v0",
      mode: "turns",
      matchWins: 1,
      wins: { 1: 0, 2: 0 },
      roundsExisted: 0,
      draws: 0,
      matchOver: false,
    });
  });
});
