import { describe, expect, it } from "vitest";
import {
  canonicalizeProjectReleaseDecisionDocument,
  createProjectReleaseDecisionDocument,
  parseProjectReleaseDecisionDocument,
  type ProjectReleaseEvidenceInput,
} from "../app/ProjectReleaseDecision";

describe("ProjectReleaseDecision", () => {
  it("allows a saved release when every required fact is current and revision-bound", () => {
    const document = createProjectReleaseDecisionDocument({
      generatedAt: "2026-07-17T00:00:00.000Z",
      project: { id: "kfm-project", revision: 4, scope: "saved", dirty: false, conflict: false },
      evidence: completeEvidence(),
    });

    expect(document.decisions.diagnostic).toMatchObject({ status: "ready", canExport: true, canRelease: false });
    expect(document.decisions.release).toMatchObject({ status: "ready", canExport: true, canRelease: true });
    expect(document.summary).toMatchObject({ evidenceCount: 6, blockerCount: 0, releaseable: true });
    expect(parseProjectReleaseDecisionDocument(document).diagnostics).toEqual([]);
  });

  it("keeps diagnostic export available while release blockers remain explicit", () => {
    const document = createProjectReleaseDecisionDocument({
      generatedAt: "2026-07-17T00:00:00.000Z",
      project: { id: "kfm-project", scope: "session", dirty: true, conflict: true },
      evidence: [
        evidence("runtime", "missing", "missing"),
        evidence("gate", "passed", "stale"),
        evidence("envelope", "failed"),
        evidence("asset-policy", "blocked"),
        evidence("analysis", "passed", "current", "mismatched"),
        evidence("source-write", "warn"),
      ],
    });
    const release = document.decisions.release;
    const reasons = new Set(release.blockers.map((blocker) => blocker.reason));

    expect(document.decisions.diagnostic.canExport).toBe(true);
    expect(release.canExport).toBe(false);
    expect(release.canRelease).toBe(false);
    expect(reasons).toEqual(new Set([
      "project-revision-missing",
      "project-dirty",
      "project-conflict",
      "evidence-missing",
      "evidence-stale",
      "evidence-failed",
      "policy-blocked",
      "wrong-revision",
    ]));
    expect(release.blockers.every((blocker) => blocker.nextAction.targetId.length > 0)).toBe(true);
  });

  it("keeps current warnings non-blocking and canonicalizes evidence order", () => {
    const first = createProjectReleaseDecisionDocument({
      generatedAt: "2026-07-17T00:00:00.000Z",
      project: { id: "kfm-project", revision: 4, scope: "saved", dirty: false, conflict: false },
      evidence: [...completeEvidence(), evidence("source-write", "warn", "current", "matched", "source-write-warning")],
    });
    const second = createProjectReleaseDecisionDocument({
      generatedAt: "2026-07-17T00:00:00.000Z",
      project: { id: "kfm-project", revision: 4, scope: "saved", dirty: false, conflict: false },
      evidence: [evidence("source-write", "warn", "current", "matched", "source-write-warning"), ...completeEvidence().reverse()],
    });

    expect(first.decisions.release).toMatchObject({ status: "ready", canRelease: true });
    expect(first.decisions.release.warnings).toEqual(["source-write-warning: source-write warning"]);
    expect(canonicalizeProjectReleaseDecisionDocument(first)).toBe(canonicalizeProjectReleaseDecisionDocument(second));
  });

  it("rejects tampered semantic and transport digests", () => {
    const document = createProjectReleaseDecisionDocument({
      generatedAt: "2026-07-17T00:00:00.000Z",
      project: { id: "kfm-project", revision: 4, scope: "saved", dirty: false, conflict: false },
      evidence: completeEvidence(),
    });
    document.decisions.release.status = "blocked";

    expect(parseProjectReleaseDecisionDocument(document).diagnostics).toContain("Project release decision project-release-decision:kfm-project:release semanticDigest mismatch");

    const transportTampered = createProjectReleaseDecisionDocument({
      generatedAt: "2026-07-17T00:00:00.000Z",
      project: { id: "kfm-project", revision: 4, scope: "saved", dirty: false, conflict: false },
      evidence: completeEvidence(),
    });
    transportTampered.digest = "fnv1a32:00000000";
    expect(parseProjectReleaseDecisionDocument(transportTampered).diagnostics).toContain("Project release decision digest mismatch");
  });
});

function evidence(
  kind: ProjectReleaseEvidenceInput["kind"],
  status: ProjectReleaseEvidenceInput["status"],
  freshness: ProjectReleaseEvidenceInput["freshness"] = "current",
  revisionState: ProjectReleaseEvidenceInput["revisionState"] = "matched",
  id: string = kind,
): ProjectReleaseEvidenceInput {
  return {
    id,
    label: `${kind} evidence`,
    kind,
    status,
    freshness,
    revisionState,
    requiredForRelease: true,
    detail: status === "warn" ? `${kind} warning` : `${kind} detail`,
    evidenceIds: [`${kind}:evidence`],
  };
}

function completeEvidence(): ProjectReleaseEvidenceInput[] {
  return [
    evidence("runtime", "passed"),
    evidence("gate", "passed"),
    evidence("envelope", "passed"),
    evidence("asset-policy", "passed"),
    evidence("analysis", "passed"),
    evidence("source-write", "passed"),
  ];
}
