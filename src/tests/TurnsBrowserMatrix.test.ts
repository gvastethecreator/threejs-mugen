import { describe, expect, it } from "vitest";
import { runTurnsBrowserMatrix } from "../mugen/runtime/TurnsBrowserMatrix";

describe("TurnsBrowserMatrix", () => {
  it(
    "passes HUD, multi-replace, both sides, pause, fault restore, and replay digest lanes",
    () => {
      const report = runTurnsBrowserMatrix();
      expect(report.schema).toBe("TurnsBrowserMatrix/v1");
      if (!report.passed) {
        // Surface lane diagnostics in assertion message for failures.
        expect({
          lanes: report.lanes.filter((lane) => !lane.passed),
          diagnostics: report.diagnostics,
        }).toEqual({});
      }
      expect(report.passed).toBe(true);
      expect(report.bothSidesReplacements).toBe(2);
      expect(report.pauseHeldTicks).toBeGreaterThanOrEqual(1);
      expect(report.faultRestored).toBe(true);
      expect(report.replayDigest).toMatch(/^[0-9a-f]{8}$/);
      expect(report.lanes.map((lane) => lane.id)).toEqual(
        expect.arrayContaining([
          "hud-ko-handoff",
          "multi-replace-side1",
          "both-sides-replace",
          "pause-hold",
          "fault-restore",
          "replay-digest",
        ]),
      );
      expect(report.lanes.every((lane) => lane.passed)).toBe(true);
      expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
    },
    30_000,
  );
});
