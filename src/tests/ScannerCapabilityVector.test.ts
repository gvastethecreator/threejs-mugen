import { describe, expect, it } from "vitest";
import {
  assessScannerCapabilityVector,
  createScannerCapabilityVector,
  negativeMugenSelectDefSignal,
} from "../mugen/compatibility/ScannerCapabilityVector";

describe("ScannerCapabilityVector", () => {
  it("keeps five explicit phases and rejects phase inference", () => {
    const assessment = assessScannerCapabilityVector([
      {
        id: "feature-x",
        facts: [
          { phase: "recognized", true: true, evidenceId: "e1" },
          { phase: "parsed", true: false },
          { phase: "lowered", true: true },
          { phase: "executed", true: false },
          { phase: "verified", true: false },
        ],
      },
    ]);
    expect(assessment.diagnostics).toContain("phase-inference:feature-x:lowered");
    expect(createScannerCapabilityVector(assessment.vector.signals).signals[0]?.facts).toHaveLength(5);
  });

  it("treats MUGEN select.def as recognition-only (negative execution)", () => {
    const assessment = assessScannerCapabilityVector([negativeMugenSelectDefSignal()]);
    expect(assessment.diagnostics).not.toContain("select.def-must-not-execute");
    expect(assessment.highestProvenPhase).toBe("recognized");
    const executed = assessment.vector.signals[0]?.facts.find((f) => f.phase === "executed");
    expect(executed?.true).toBe(false);
  });

  it("advances highest proven phase only through consecutive truths", () => {
    const assessment = assessScannerCapabilityVector([
      {
        id: "ok",
        facts: [
          { phase: "recognized", true: true },
          { phase: "parsed", true: true },
          { phase: "lowered", true: true },
          { phase: "executed", true: false },
          { phase: "verified", true: false },
        ],
      },
    ]);
    expect(assessment.diagnostics).toEqual([]);
    expect(assessment.highestProvenPhase).toBe("lowered");
  });
});
