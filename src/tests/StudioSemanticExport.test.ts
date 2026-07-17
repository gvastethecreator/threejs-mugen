import { describe, expect, it } from "vitest";
import {
  createProjectReleaseDecisionDocument,
  type ProjectReleaseEvidenceInput,
} from "../app/ProjectReleaseDecision";
import {
  canonicalizeStudioSemanticExportDocument,
  createStudioSemanticExportDocument,
  parseStudioSemanticExportDocument,
} from "../app/StudioSemanticExport";

describe("StudioSemanticExport", () => {
  it("keeps semantic bytes stable when observation time changes", () => {
    const decision = createDecision({ revision: 7, scope: "saved", dirty: false, conflict: false });
    const first = createStudioSemanticExportDocument({ generatedAt: "2026-07-17T04:00:00.000Z", decision });
    const second = createStudioSemanticExportDocument({ generatedAt: "2026-07-18T04:00:00.000Z", decision });

    expect(first.semanticDigest).toBe(second.semanticDigest);
    expect(canonicalizeStudioSemanticExportDocument(first)).toBe(canonicalizeStudioSemanticExportDocument(second));
    expect(first.digest).not.toBe(second.digest);
    expect(parseStudioSemanticExportDocument(first).diagnostics).toEqual([]);
    expect(parseStudioSemanticExportDocument(second).diagnostics).toEqual([]);
  });

  it("preserves revision, evidence identities, blockers, and next action", () => {
    const decision = createDecision({ revision: undefined, scope: "session", dirty: true, conflict: true, missing: true });
    const document = createStudioSemanticExportDocument({ generatedAt: "2026-07-17T04:00:00.000Z", decision });
    const release = document.decisions.release;

    expect(document.project).toMatchObject({ id: "kfm-project", scope: "session", dirty: true, conflict: true });
    expect(document.evidence.map((item) => item.id)).toContain("runtime");
    expect(release.blockerIds).toContain("project:revision-missing");
    expect(release.blockers.every((blocker) => blocker.nextAction.targetId.length > 0)).toBe(true);
    expect(release.nextAction).toEqual(release.blockers[0]?.nextAction);
    expect(parseStudioSemanticExportDocument(document).document?.sourceDecision.semanticDigest).toBe(decision.semanticDigest);
  });

  it("normalizes evidence identity order through the source decision", () => {
    const firstDecision = createDecision({ revision: 7, scope: "saved", dirty: false, conflict: false, reverse: false });
    const secondDecision = createDecision({ revision: 7, scope: "saved", dirty: false, conflict: false, reverse: true });
    const first = createStudioSemanticExportDocument({ generatedAt: "2026-07-17T04:00:00.000Z", decision: firstDecision });
    const second = createStudioSemanticExportDocument({ generatedAt: "2026-07-17T04:00:00.000Z", decision: secondDecision });

    expect(first.semanticDigest).toBe(second.semanticDigest);
    expect(first.evidence.map((item) => item.id)).toEqual(second.evidence.map((item) => item.id));
  });

  it("rejects semantic and transport tampering", () => {
    const document = createStudioSemanticExportDocument({
      generatedAt: "2026-07-17T04:00:00.000Z",
      decision: createDecision({ revision: 7, scope: "saved", dirty: false, conflict: false }),
    });
    document.evidence[0]!.label = "tampered";
    expect(parseStudioSemanticExportDocument(document).diagnostics).toContain("Studio semantic export semanticDigest mismatch");

    const transportTampered = createStudioSemanticExportDocument({
      generatedAt: "2026-07-17T04:00:00.000Z",
      decision: createDecision({ revision: 7, scope: "saved", dirty: false, conflict: false }),
    });
    transportTampered.digest = "fnv1a32:00000000";
    expect(parseStudioSemanticExportDocument(transportTampered).diagnostics).toContain("Studio semantic export digest mismatch");
  });
});

function createDecision(options: {
  revision?: number;
  scope: "saved" | "session";
  dirty: boolean;
  conflict: boolean;
  missing?: boolean;
  reverse?: boolean;
}) {
  const evidence = options.missing
    ? [evidenceItem("runtime", "missing"), evidenceItem("gate", "passed")]
    : [evidenceItem("runtime", "passed"), evidenceItem("gate", "passed")];
  return createProjectReleaseDecisionDocument({
    generatedAt: "2026-07-17T04:00:00.000Z",
    project: {
      id: "kfm-project",
      ...(options.revision !== undefined ? { revision: options.revision } : {}),
      scope: options.scope,
      dirty: options.dirty,
      conflict: options.conflict,
    },
    evidence: options.reverse ? [...evidence].reverse() : evidence,
  });
}

function evidenceItem(kind: ProjectReleaseEvidenceInput["kind"], status: ProjectReleaseEvidenceInput["status"]): ProjectReleaseEvidenceInput {
  return {
    id: kind,
    label: `${kind} evidence`,
    kind,
    status,
    freshness: status === "missing" ? "missing" : "current",
    revisionState: "not-applicable",
    requiredForRelease: true,
    detail: `${kind} detail`,
    evidenceIds: [`${kind}:identity`],
  };
}
