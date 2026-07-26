import { describe, expect, it } from "vitest";
import {
  canonicalizeCommonEvidenceFacts,
  commonEvidenceFactsEqual,
  createCommonEvidenceFacts,
  runtimeConsumerToCommonEvidenceFacts,
  studioConsumerToCommonEvidenceFacts,
  twoConsumerCanonicalParity,
} from "../engine/CommonEvidenceFacts";

describe("CommonEvidenceFacts", () => {
  it("produces equal digests when claim/evidence order differs", () => {
    const a = createCommonEvidenceFacts({
      subject: { kind: "project", id: "p1", revision: "3" },
      status: "passed",
      freshness: "current",
      observedAt: "2026-07-26T20:00:00.000Z",
      claimAllowed: ["b", "a"],
      claimBlocked: ["z"],
      evidenceIds: ["e2", "e1"],
      payload: { k: 1, a: "x" },
    });
    const b = createCommonEvidenceFacts({
      subject: { kind: "project", id: "p1", revision: "3" },
      status: "passed",
      freshness: "current",
      observedAt: "2026-07-26T20:00:00.000Z",
      claimAllowed: ["a", "b"],
      claimBlocked: ["z"],
      evidenceIds: ["e1", "e2"],
      payload: { a: "x", k: 1 },
    });
    expect(commonEvidenceFactsEqual(a, b)).toBe(true);
    expect(canonicalizeCommonEvidenceFacts(a)).toBe(canonicalizeCommonEvidenceFacts(b));
  });

  it("proves two-consumer parity for the same logical observation", () => {
    const parity = twoConsumerCanonicalParity({
      subject: { kind: "target", id: "gate-1" },
      status: "passed",
      freshness: "current",
      observedAt: "2026-07-26T20:00:00.000Z",
      evidenceIds: ["g1", "g2"],
      payload: { surface: "unit" },
      claimAllowed: ["shared core"],
      claimBlocked: ["adapter coupling"],
    });
    expect(parity.equal).toBe(true);
    expect(parity.studio.digest).toBe(parity.runtime.digest);
  });

  it("keeps studio and runtime adapters free of shared mutable state", () => {
    const studio = studioConsumerToCommonEvidenceFacts({
      projectId: "proj",
      projectRevision: "2",
      status: "passed",
      freshness: "current",
      observedAt: "2026-07-26T20:00:00.000Z",
      evidenceIds: ["s1"],
      analysisChecksum: "an",
    });
    const runtime = runtimeConsumerToCommonEvidenceFacts({
      runtimeId: "rt",
      runtimeRevision: "2",
      status: "passed",
      freshness: "current",
      observedAt: "2026-07-26T20:00:00.000Z",
      evidenceIds: ["r1"],
      traceChecksum: "tr",
    });
    expect(studio.subject.kind).toBe("project");
    expect(runtime.subject.kind).toBe("runtime");
    expect(studio.digest).not.toBe(runtime.digest);
    expect(studio.payload.consumer).toBe("studio");
    expect(runtime.payload.consumer).toBe("runtime");
  });
});
