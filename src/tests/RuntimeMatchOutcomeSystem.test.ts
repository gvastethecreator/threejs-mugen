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

  it("projects a pending match win without mutating committed outcome state", () => {
    const outcome = new RuntimeMatchOutcomeSystem("single", 1);
    const before = outcome.snapshot();

    expect(outcome.projectRound(1)).toMatchObject({
      schema: "mugen-web-sandbox/runtime-match-outcome-projection/v0",
      status: "projected",
      outcome: "match-win",
      roundWinnerSide: 1,
      winsBefore: { 1: 0, 2: 0 },
      winsAfter: { 1: 1, 2: 0 },
      roundsExistedBefore: 0,
      roundsExistedAfter: 1,
      matchOver: true,
      winnerSide: 1,
    });
    expect(outcome.snapshot()).toEqual(before);
    expect(outcome.isOver).toBe(false);
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

  it("supports side-specific Turns targets without moving score ownership", () => {
    const outcome = new RuntimeMatchOutcomeSystem("turns", 9, { 1: 2, 2: 1 });

    expect(outcome.recordRound(1)).toMatchObject({
      matchOver: false,
      wins: { 1: 1, 2: 0 },
      matchWins: 2,
      matchWinsBySide: { 1: 2, 2: 1 },
    });

    expect(outcome.recordRound(2)).toMatchObject({
      outcome: "match-win",
      matchOver: true,
      winnerSide: 2,
      wins: { 1: 1, 2: 1 },
      matchWinsBySide: { 1: 2, 2: 1 },
    });
  });

  it("keeps draws neutral until the configured official limit is active", () => {
    const outcome = new RuntimeMatchOutcomeSystem("turns", 3, undefined, { 1: 1, 2: 1 });

    expect(outcome.effectiveLossBySideForNextDraw()).toEqual({ 1: false, 2: false });
    expect(outcome.recordRound()).toMatchObject({
      outcome: "draw",
      draws: 1,
      wins: { 1: 0, 2: 0 },
      effectiveLossBySide: { 1: false, 2: false },
    });
    expect(outcome.effectiveLossBySideForNextDraw()).toEqual({ 1: true, 2: true });

    expect(outcome.recordRound()).toMatchObject({
      outcome: "draw",
      draws: 2,
      wins: { 1: 1, 2: 1 },
      effectiveLossBySide: { 1: true, 2: true },
    });
  });

  it("awards an effective-loss draw to the opposing side", () => {
    const outcome = new RuntimeMatchOutcomeSystem("turns", 2, undefined, { 1: 1, 2: 99 });
    outcome.recordRound();

    expect(outcome.recordRound()).toMatchObject({
      outcome: "round-win",
      roundWinnerSide: 2,
      wins: { 1: 0, 2: 1 },
      effectiveLossBySide: { 1: true, 2: false },
    });
  });

  it("mutates one official draw limit without changing the other side", () => {
    const outcome = new RuntimeMatchOutcomeSystem("turns", 2);

    expect(outcome.setMaxDraws(1, 1)).toMatchObject({
      maxDrawsBySide: { 1: 1, 2: -1 },
    });
    expect(outcome.effectiveLossBySideForNextDraw()).toEqual({ 1: false, 2: false });
    outcome.recordRound();
    expect(outcome.effectiveLossBySideForNextDraw()).toEqual({ 1: true, 2: false });

    expect(outcome.setMaxDraws(1, Number.NaN).maxDrawsBySide).toBeUndefined();
    expect(outcome.effectiveLossBySideForNextDraw()).toEqual({ 1: false, 2: false });
  });

  it("closes a live match when an official win target is lowered to the score", () => {
    const outcome = new RuntimeMatchOutcomeSystem("turns", 3);
    outcome.recordRound(1);

    expect(outcome.setMatchWins(1, 1)).toMatchObject({
      matchWins: 3,
      matchWinsBySide: { 1: 1, 2: 3 },
      matchOver: true,
      winnerSide: 1,
    });
    expect(outcome.recordRound(2)).toMatchObject({
      outcome: "match-over",
      diagnostics: ["match-already-over"],
    });
  });
});
