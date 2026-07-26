import { describe, expect, it } from "vitest";
import {
  assessRealPlaytestReadiness,
  createEvidenceSubject,
} from "../app/EvidenceSubject";

describe("EvidenceSubject / RealPlaytestReadiness", () => {
  it("rejects fixed green rows without a real subject binding", () => {
    const readiness = assessRealPlaytestReadiness({
      subject: createEvidenceSubject("runtime", "playtest"),
      hasObservation: true,
      fixedGreenWithoutSubject: true,
    });
    expect(readiness.state).toBe("failed");
    expect(readiness.canExport).toBe(false);
    expect(readiness.diagnostics).toContain("fixed-green-without-subject");
  });

  it("marks missing, stale revision, stale age, failed, and runnable states", () => {
    const subject = createEvidenceSubject("project", "proj-1", "aaa");
    expect(
      assessRealPlaytestReadiness({ subject, hasObservation: false }).state,
    ).toBe("missing");
    expect(
      assessRealPlaytestReadiness({
        subject,
        hasObservation: true,
        failed: true,
      }).state,
    ).toBe("failed");
    expect(
      assessRealPlaytestReadiness({
        subject,
        hasObservation: true,
        sourceRevision: "bbb",
        expectedRevision: "aaa",
      }).state,
    ).toBe("stale");
    expect(
      assessRealPlaytestReadiness({
        subject,
        hasObservation: true,
        observedAt: "2026-07-01T00:00:00.000Z",
        now: "2026-07-26T00:00:00.000Z",
        maxAgeMs: 24 * 60 * 60 * 1000,
        sourceRevision: "aaa",
        expectedRevision: "aaa",
      }).state,
    ).toBe("stale");
    const ok = assessRealPlaytestReadiness({
      subject,
      hasObservation: true,
      observedAt: "2026-07-26T12:00:00.000Z",
      now: "2026-07-26T13:00:00.000Z",
      maxAgeMs: 24 * 60 * 60 * 1000,
      sourceRevision: "aaa",
      expectedRevision: "aaa",
    });
    expect(ok.state).toBe("runnable");
    expect(ok.canExport).toBe(true);
  });
});
