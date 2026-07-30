import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type ControlAudit = {
  integrityPassed: boolean;
  integrityErrors: string[];
  agreementErrors: string[];
  freshness: { status: "current" | "stale" | "mismatch"; reasons: string[] };
  promotionReady: boolean;
};

type AuditControlDocuments = (input: {
  selector: Record<string, unknown>;
  cursor: Record<string, unknown>;
  source: Record<string, unknown>;
  observedHeadSha: string;
  now: string;
  maxAgeMs?: number;
}) => ControlAudit;

const require = createRequire(import.meta.url);
const { auditControlDocuments } = require("../../scripts/lib_control_authority.cjs") as {
  auditControlDocuments: AuditControlDocuments;
};
const evidenceRoot = resolve(process.cwd(), "docs/evidence");

function readEvidence(name: string): Record<string, any> {
  return JSON.parse(readFileSync(resolve(evidenceRoot, name), "utf8"));
}

function fixture() {
  const selector = readEvidence("authority-selector-v1.json");
  const cursor = readEvidence("roadmap-cursor-v1.json");
  const source = readEvidence("control-source-v1.json");
  return { selector, cursor, source };
}

describe("control authority audit", () => {
  it("accepts intact, agreeing projections at their declared head", () => {
    const { selector, cursor, source } = fixture();
    const result = auditControlDocuments({
      selector,
      cursor,
      source,
      observedHeadSha: source.cursors.head.sha,
      now: cursor.generatedAt,
    });

    expect(result.integrityPassed).toBe(true);
    expect(result.integrityErrors).toEqual([]);
    expect(result.agreementErrors).toEqual([]);
    expect(result.freshness).toEqual({ status: "current", reasons: [] });
    expect(result.promotionReady).toBe(true);
  });

  it("rejects a selector payload whose digest was not regenerated", () => {
    const { selector, cursor, source } = fixture();
    selector.closedThrough = "DA30-119";
    const result = auditControlDocuments({
      selector,
      cursor,
      source,
      observedHeadSha: source.cursors.head.sha,
      now: cursor.generatedAt,
    });

    expect(result.integrityPassed).toBe(false);
    expect(result.integrityErrors).toContain("authority selector digest mismatch");
    expect(result.agreementErrors).toContain("closedThrough disagrees with control source");
    expect(result.promotionReady).toBe(false);
  });

  it("holds promotion when the observed head differs without invalidating integrity", () => {
    const { selector, cursor, source } = fixture();
    const result = auditControlDocuments({
      selector,
      cursor,
      source,
      observedHeadSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      now: cursor.generatedAt,
    });

    expect(result.integrityPassed).toBe(true);
    expect(result.freshness.status).toBe("mismatch");
    expect(result.freshness.reasons.some((reason) => reason.includes("does not match"))).toBe(true);
    expect(result.promotionReady).toBe(false);
  });
});
