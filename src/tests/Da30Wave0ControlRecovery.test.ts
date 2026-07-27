/**
 * DA30 Wave 0 control recovery: hold audit + verdict ledger schema.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(resolve(root, rel), "utf8")) as T;
}

describe("DA30-001 hold reference audit", () => {
  it("produces a passed reference audit with zero stale current complete claims", () => {
    const report = readJson<{
      ok: boolean;
      id: string;
      summary: { staleHits: unknown[]; markerFailures: unknown[]; missing: unknown[] };
      scoresHeld: string;
      proposedQueue: string;
      da29Status: string;
    }>("docs/evidence/da30/da30-001-hold-reference-audit.json");

    expect(report.id).toBe("DA30-001");
    expect(report.ok).toBe(true);
    expect(report.summary.staleHits).toEqual([]);
    expect(report.summary.markerFailures).toEqual([]);
    expect(report.summary.missing).toEqual([]);
    expect(report.scoresHeld).toMatch(/65/);
    expect(report.proposedQueue).toMatch(/DA30-001/);
    expect(report.da29Status).toMatch(/unadjudicat|candidate/i);
  });

  it("current authority selector doc rejects DA29-200 as accepted watermark", () => {
    const text = readFileSync(resolve(root, "docs/AUTHORITY_SELECTOR.md"), "utf8");
    expect(text).toMatch(/unadjudicat|reject|audit hold|quarantine|candidate/i);
    expect(text).toMatch(/DA30/);
    expect(text).toMatch(/65/);
    // Must not present empty queue as accepted current completion
    expect(text).not.toMatch(/Series complete: open count 0/);
    expect(text).not.toMatch(/watermark closed through \*\*DA29-200\*\*/);
  });
});

describe("DA30-002 DA29 verdict ledger", () => {
  it("lists exactly 200 rows with required fields and samples from all 20 waves", () => {
    const ledger = readJson<{
      schema: string;
      count: number;
      rows: Array<{
        id: string;
        kind: string;
        acceptanceClauses: unknown[];
        artifact: string;
        producer: string;
        revision: unknown;
        validatorClass: string;
        liveConsumer: string;
        verdict: string;
        preservedFact: string;
        missingProof: string;
        carryoverId: string;
        wave: number;
      }>;
      waveSamples: Array<{ wave: number; id: string }>;
      verdictCounts: Record<string, number>;
      claimCeiling: string;
    }>("docs/evidence/da30/da29-verdict-ledger-v1.json");

    expect(ledger.schema).toBe("Da29VerdictLedger/v1");
    expect(ledger.count).toBe(200);
    expect(ledger.rows).toHaveLength(200);
    expect(ledger.rows[0].id).toBe("DA29-001");
    expect(ledger.rows[199].id).toBe("DA29-200");
    expect(ledger.waveSamples).toHaveLength(20);
    expect(new Set(ledger.waveSamples.map((s) => s.wave)).size).toBe(20);
    expect(ledger.claimCeiling).toMatch(/inventory only/i);

    for (const row of ledger.rows) {
      expect(row.acceptanceClauses.length).toBeGreaterThan(0);
      expect(row.artifact.length).toBeGreaterThan(0);
      expect(row.producer.length).toBeGreaterThan(0);
      expect(row.validatorClass.length).toBeGreaterThan(0);
      expect(row.liveConsumer.length).toBeGreaterThan(0);
      expect(row.verdict.length).toBeGreaterThan(0);
      expect(row.preservedFact.length).toBeGreaterThan(0);
      expect(row.missingProof.length).toBeGreaterThan(0);
      expect(row.carryoverId).toMatch(/^DA30-\d{3}$/);
    }

    // Explicit audit samples
    const byId = new Map(ledger.rows.map((r) => [r.id, r]));
    expect(byId.get("DA29-001")?.verdict).toBe("control-invalid");
    expect(byId.get("DA29-052")?.verdict).toBe("reopen");
    expect(byId.get("DA29-041")?.verdict).toBe("candidate-bounded");
    expect(byId.get("DA29-200")?.verdict).toBe("reopen");
    expect(Object.keys(ledger.verdictCounts).length).toBeGreaterThan(0);
  });
});

describe("DA30-003 single control source ADR", () => {
  it("records alternatives and chooses one checked input model", () => {
    const path = "docs/adr/0055-da30-single-control-source.md";
    expect(existsSync(resolve(root, path))).toBe(true);
    const text = readFileSync(resolve(root, path), "utf8");
    expect(text).toMatch(/DA30-003/);
    expect(text).toMatch(/one checked input/i);
    expect(text).toMatch(/Event ledger/i);
    expect(text).toMatch(/Paired generators/i);
    expect(text).toMatch(/Decision/);
    expect(text).toMatch(/Rollback/i);
    expect(text).toMatch(/Accepted/i);
  });
});

describe("DA30-004 synchronized control projections", () => {
  it("selector and cursor agree on shared fields from control-source", () => {
    const source = readJson<{
      closedThrough: string;
      nextQueue: string[];
      scores: Record<string, string>;
      cursors: { formal: { sha: string }; global: { sha: string } };
      seriesHold: { watermarkAccepted: boolean };
    }>("docs/evidence/control-source-v1.json");
    const selector = readJson<{
      closedThrough: string;
      nextQueue: string[];
      scores: Record<string, string>;
      cursors: { formal: { sha: string }; global: { sha: string } };
    }>("docs/evidence/authority-selector-v1.json");
    const cursor = readJson<{
      closedThrough: string;
      nextQueue: string[];
      scores: Record<string, string>;
      cursors: Array<{ kind: string; sha: string }>;
    }>("docs/evidence/roadmap-cursor-v1.json");

    expect(source.seriesHold.watermarkAccepted).toBe(false);
    expect(selector.closedThrough).toBe(source.closedThrough);
    expect(selector.nextQueue).toEqual(source.nextQueue);
    expect(selector.scores).toEqual(source.scores);
    expect(cursor.scores).toEqual(source.scores);
    expect(selector.cursors.formal.sha).toBe(source.cursors.formal.sha);
    expect(cursor.cursors.find((c) => c.kind === "formal")?.sha).toBe(source.cursors.formal.sha);
    expect(selector.cursors.global.sha).toBe(source.cursors.global.sha);
    // Queue lives on authority selector; cursor carries 7 pin kinds only.
    expect(cursor.cursors).toHaveLength(7);
    // Stale DA27 formal pin must not reappear as current formal
    expect(selector.cursors.formal.sha).not.toBe("b7d23801bd3ca766ba5b184b3c040bef8165d355");
  });

  it("failed DA29 watermark artifact is preserved separately for audit evidence", () => {
    const failed = readJson<{ closedThrough: string; nextQueue: string[] }>(
      "docs/evidence/da30/authority-selector-da29-failed-watermark.json",
    );
    expect(failed.closedThrough).toBe("DA29-200");
    expect(failed.nextQueue).toEqual([]);
  });
});

describe("DA30-006 closeout state transitions", () => {
  it("defines states and forbids invalid watermark advances", () => {
    const doc = readJson<{
      states: string[];
      watermarkRule: string;
      invalidTransitions: Array<{ from: string; to: string }>;
    }>("docs/evidence/da30/closeout-state-transitions-v1.json");
    expect(doc.states).toEqual(
      expect.arrayContaining(["proposed", "active", "blocked", "partial", "candidate", "accepted", "superseded", "rejected"]),
    );
    expect(doc.watermarkRule).toMatch(/only accepted/i);
    expect(doc.invalidTransitions.some((t) => t.from === "accepted" && t.to === "candidate")).toBe(true);
    expect(doc.invalidTransitions.some((t) => t.from === "proposed" && t.to === "accepted")).toBe(true);
  });
});
