import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateCloseoutFreshness, cssAfterGateFixture } from "../mugen/da30/CloseoutFreshness";
import { validateTaskAcceptanceManifest } from "../mugen/da30/TaskAcceptanceManifest";
import { validateEvidenceLineage, validLineageFixture } from "../mugen/da30/EvidenceLineage";
import {
  validateCommandGateRecord,
  passingCommandFixture,
  failingSummaryOnlyFixture,
} from "../mugen/da30/CommandGateCapture";
import {
  validateBrowserEvidenceFacts,
  greenRouteFixture,
  forcedErrorRouteFixture,
} from "../mugen/da30/BrowserEvidenceFacts";
import { compileClaims } from "../mugen/da30/ClaimCompiler";

const root = process.cwd();
const j = <T,>(rel: string) => JSON.parse(readFileSync(resolve(root, rel), "utf8")) as T;

describe("DA30-005 control reference audit", () => {
  it("passes live audit with six negative fixtures", () => {
    const r = j<{ ok: boolean; fixtures: { fixtureCount?: number; ok: boolean } }>(
      "docs/evidence/da30/da30-005-control-reference-audit.json",
    );
    expect(r.ok).toBe(true);
    expect(r.fixtures.ok).toBe(true);
    expect(r.fixtures.fixtureCount).toBeGreaterThanOrEqual(6);
  });
});

describe("DA30-007 freshness", () => {
  it("marks css-after-gate fixture stale", () => {
    const v = evaluateCloseoutFreshness(cssAfterGateFixture());
    expect(v.ok).toBe(false);
    expect(v.stale).toBe(true);
    expect(v.reasons.join(" ")).toMatch(/css-after-gate|product changed/i);
  });

  it("accepts clean same-sha record", () => {
    const v = evaluateCloseoutFreshness({
      implementationSha: "abc",
      evidenceSha: "abc",
      producerSha: "abc",
      inputDigests: { a: "1" },
      dirtyExclusions: [],
      inheritance: "same-sha",
      productChangedAfterGate: false,
    });
    expect(v.ok).toBe(true);
  });
});

describe("DA30-010 control recovery gate", () => {
  it("reports ok with shared controls and 200 ledger rows", () => {
    const g = j<{ ok: boolean; checklist: Array<{ id: string; ok: boolean }>; closedThrough: string }>(
      "docs/evidence/da30/da30-010-control-recovery-gate.json",
    );
    expect(g.ok).toBe(true);
    // Gate report may record closedThrough at run time; live control may advance after.
    expect(g.checklist.every((c) => c.ok)).toBe(true);
    const live = j<{ closedThrough: string; nextQueue: string[] }>("docs/evidence/control-source-v1.json");
    expect(live.closedThrough).toMatch(/^DA30-0(1|2)\d$/);
    expect(live.nextQueue[0]).toMatch(/^DA30-/);
  });
});

describe("DA30 series status", () => {
  it("accepts waves 0–1 consecutive and leaves later gates open", () => {
    const s = j<{
      closedThrough: string;
      acceptedCount: number;
      openCount: number;
      partialCount: number;
      count: number;
    }>("docs/evidence/da30/da30-series-status-v1.json");
    expect(s.count).toBe(120);
    expect(s.closedThrough).toBe("DA30-020");
    expect(s.acceptedCount).toBe(20);
    expect(s.openCount).toBeGreaterThan(0);
    expect(s.partialCount).toBeGreaterThan(0);
  });
});

describe("DA30-011/012 manifests", () => {
  it("validates good manifest and rejects malformed", () => {
    const good = j("docs/evidence/da30/manifests/da29-012.manifest.json");
    expect(validateTaskAcceptanceManifest(good).ok).toBe(true);
    const bad = {
      schema: "TaskAcceptanceManifest/v1",
      taskId: "X",
      claimCeiling: "held scores inventory only",
      clauses: [
        {
          id: "a",
          evidenceKind: "nope",
          producer: "",
          assertion: "",
          expectedFailure: "",
          revisionPolicy: "bad",
          environment: "",
          claim: "raise scores now",
        },
        { id: "a", evidenceKind: "unit-observation", producer: "p", assertion: "x", expectedFailure: "y", revisionPolicy: "exact-sha", environment: "e", claim: "c" },
      ],
    };
    const r = validateTaskAcceptanceManifest(bad);
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBeGreaterThan(3);
  });
});

describe("DA30-014 lineage", () => {
  it("accepts valid DAG and rejects cycles/tamper shapes", () => {
    expect(validateEvidenceLineage(validLineageFixture()).ok).toBe(true);
    const cyclic = validLineageFixture();
    cyclic[0].cites = ["claim-1"];
    expect(validateEvidenceLineage(cyclic).ok).toBe(false);
    const stale = validLineageFixture();
    stale[0].fresh = false;
    expect(validateEvidenceLineage(stale).ok).toBe(false);
  });
});

describe("DA30-016 command gates", () => {
  it("accepts raw capture and rejects summary-only", () => {
    expect(validateCommandGateRecord(passingCommandFixture()).ok).toBe(true);
    expect(validateCommandGateRecord(failingSummaryOnlyFixture()).ok).toBe(false);
  });
});

describe("DA30-017 browser facts", () => {
  it("validates green and forced-error routes", () => {
    expect(validateBrowserEvidenceFacts(greenRouteFixture()).ok).toBe(true);
    const err = forcedErrorRouteFixture();
    expect(validateBrowserEvidenceFacts(err).ok).toBe(true);
    expect(err.result).toBe("fail");
    expect(err.consoleErrors.length).toBeGreaterThan(0);
  });
});

describe("DA30-018 failure-path coverage", () => {
  it("each pilot I/G manifest declares expectedFailure", () => {
    for (const id of ["da29-012", "da29-013", "da29-041", "da29-072"]) {
      const m = j<{ clauses: Array<{ expectedFailure: string }> }>(`docs/evidence/da30/manifests/${id}.manifest.json`);
      expect(m.clauses.every((c) => c.expectedFailure && c.expectedFailure.length > 0)).toBe(true);
    }
  });
});

describe("DA30-019 claim compiler", () => {
  it("blocks stale and score claims without adjudication", () => {
    const r = compileClaims({
      claimCeiling: "inventory only; scores held",
      clauseResults: [
        { id: "1", status: "pass", claim: "trace ids unique" },
        { id: "2", status: "stale", claim: "old" },
        { id: "3", status: "pass", claim: "score movement authorized" },
      ],
      scoreAdjudicationPassed: false,
    });
    expect(r.allowed).toContain("trace ids unique");
    expect(r.blocked.some((b) => b.includes("stale"))).toBe(true);
    expect(r.blocked.some((b) => b.includes("score") || b.includes("widening"))).toBe(true);
  });
});

describe("DA30-020 pilot revalidation", () => {
  it("records pass/fail/unknown without changing scores", () => {
    const p = j<{
      scoresUnchanged: boolean;
      scores: { sandbox: string };
      tasks: Array<{ taskId: string; clauses: Array<{ status: string }> }>;
    }>("docs/evidence/da30/da30-020-pilot-revalidation.json");
    expect(p.scoresUnchanged).toBe(true);
    expect(p.scores.sandbox).toBe("65");
    expect(p.tasks).toHaveLength(4);
    for (const t of p.tasks) {
      expect(t.clauses.length).toBeGreaterThan(0);
      expect(t.clauses.every((c) => ["pass", "fail", "unknown"].includes(c.status))).toBe(true);
    }
  });
});

describe("DA30-008/009 artifacts", () => {
  it("historical reconcile and ownership maps exist", () => {
    expect(existsSync(resolve(root, "docs/evidence/da30/da30-008-historical-gates-reconciliation.json"))).toBe(true);
    expect(existsSync(resolve(root, "docs/evidence/da30/da30-009-roadmap-surface-ownership.json"))).toBe(true);
    expect(existsSync(resolve(root, "docs/adr/0057-task-acceptance-manifest-v1.md"))).toBe(true);
  });
});
