import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import {
  assertContractEquivalence,
  findContract,
  type TaskContract,
} from "../mugen/da31/TaskContractRegistry";
import {
  canClaimAdjudicated,
  createDualWatermark,
  gapAfterAdjudicated,
} from "../mugen/da31/DualWatermarkControl";
import { evaluateTaskVerdict } from "../mugen/da31/ClauseVerdict";
import {
  createPromotionReceipt,
  rejectDirtyAsAuthoritative,
} from "../mugen/da31/EvidencePromotion";

const root = process.cwd();

function sha(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

describe("DA31-002 task contracts", () => {
  it("loads frozen contracts and rejects narrowed DA30-025", () => {
    const path = resolve(root, "docs/evidence/da31/da30-task-contracts-v1.json");
    expect(existsSync(path)).toBe(true);
    const doc = JSON.parse(readFileSync(path, "utf8")) as {
      count: number;
      contracts: TaskContract[];
      negativeFixtures: Array<{ ok: boolean }>;
    };
    expect(doc.count).toBeGreaterThanOrEqual(100);
    const original = findContract(doc.contracts, "DA30-025");
    expect(original).toBeTruthy();
    const narrowedPath = resolve(root, "docs/evidence/da31/fixtures/da30-025-narrowed-contract.json");
    const narrowed = JSON.parse(readFileSync(narrowedPath, "utf8")) as TaskContract;
    const eq = assertContractEquivalence(original!, narrowed);
    expect(eq.ok).toBe(false);
    expect(eq.reason).toBe("digest-mismatch");
    expect(doc.negativeFixtures[0]?.ok).toBe(true);
  });
});

describe("DA31-003 dual watermarks", () => {
  it("keeps closedThrough as recorded alias and reports gap", () => {
    const doc = createDualWatermark({
      recordedThrough: "DA30-120",
      adjudicatedThrough: "DA30-020",
      reviewedThrough: "DA30-120",
      scores: { sandbox: "65" },
      cursors: {
        head: { sha: "a".repeat(40), artifact: "head", claimLimit: "audit" },
        formal: { sha: "b".repeat(40), artifact: "formal", claimLimit: "matrix" },
        global: { sha: "b".repeat(40), artifact: "formal", claimLimit: "matrix" },
        focal: { sha: "c".repeat(7), artifact: "focal", claimLimit: "t406" },
        visual: { sha: "d".repeat(7), artifact: "visual", claimLimit: "t342" },
        product: { sha: "e".repeat(7), artifact: "product", claimLimit: "narrow" },
        sourceNormative: { sha: "f".repeat(40), artifact: "epoch", claimLimit: "norm" },
        sourceWorking: { sha: "1".repeat(40), artifact: "epoch", claimLimit: "work" },
      },
    });
    expect(doc.closedThrough).toBe("DA30-120");
    expect(canClaimAdjudicated(doc, "DA30-020")).toBe(true);
    expect(canClaimAdjudicated(doc, "DA30-021")).toBe(false);
    expect(canClaimAdjudicated(doc, "DA30-120")).toBe(false);
    const gap = gapAfterAdjudicated(doc);
    expect(gap[0]).toBe("DA30-021");
    expect(gap[gap.length - 1]).toBe("DA30-120");
    expect(gap.length).toBe(100);
  });
});

describe("DA31-004 clause evaluation", () => {
  it("rejects fixed-true and non-empty-only promotion", () => {
    const bad = evaluateTaskVerdict({
      taskId: "DA30-050",
      requiredClauseIds: ["c1"],
      results: [],
      flags: { fixedTrue: true },
    });
    expect(bad.status).toBe("rejected");
    expect(bad.reasons).toContain("fixed-true-map");

    const emptyOnly = evaluateTaskVerdict({
      taskId: "DA30-050",
      requiredClauseIds: ["c1"],
      results: [],
      flags: { nonEmptyOutputOnly: true },
    });
    expect(emptyOnly.status).toBe("rejected");
  });

  it("accepts only when all clauses pass with live consumer and failure path", () => {
    const green = evaluateTaskVerdict({
      taskId: "DA30-010",
      requiredClauseIds: ["a", "b"],
      results: [
        {
          clauseId: "a",
          subjectSha: "abc",
          evidenceDigest: "d1",
          lineageOk: true,
          failurePathExercised: true,
          liveConsumer: true,
          reviewerVerdict: "pass",
        },
        {
          clauseId: "b",
          subjectSha: "abc",
          evidenceDigest: "d2",
          lineageOk: true,
          failurePathExercised: true,
          liveConsumer: true,
          reviewerVerdict: "pass",
        },
      ],
    });
    expect(green.status).toBe("accepted");

    const partial = evaluateTaskVerdict({
      taskId: "DA30-024",
      requiredClauseIds: ["move", "damage"],
      results: [
        {
          clauseId: "move",
          subjectSha: "abc",
          evidenceDigest: "d1",
          lineageOk: true,
          failurePathExercised: true,
          liveConsumer: true,
          reviewerVerdict: "pass",
        },
        {
          clauseId: "damage",
          subjectSha: "abc",
          evidenceDigest: "d2",
          lineageOk: true,
          failurePathExercised: true,
          liveConsumer: true,
          reviewerVerdict: "unknown",
        },
      ],
    });
    expect(partial.status).toBe("partial");
  });
});

describe("DA31-005 evidence promotion", () => {
  it("marks dirty tree promotions provisional", () => {
    const dirty = createPromotionReceipt({
      subjectSha: "abcdef0",
      producerSha: "abcdef0",
      inputDigests: { in: sha("x") },
      outputDigest: sha("y"),
      reviewer: "agent",
      dirtyTree: true,
      artifactPath: "docs/evidence/da31/tmp.json",
    });
    expect(dirty.ok).toBe(true);
    expect(dirty.receipt?.provisional).toBe(true);
    expect(rejectDirtyAsAuthoritative(dirty.receipt!)).toBe(true);

    const clean = createPromotionReceipt({
      subjectSha: "abcdef0",
      producerSha: "abcdef0",
      inputDigests: { in: sha("x") },
      outputDigest: sha("y"),
      reviewer: "agent",
      dirtyTree: false,
      artifactPath: "docs/evidence/da31/tmp.json",
    });
    expect(clean.receipt?.provisional).toBe(false);
    expect(rejectDirtyAsAuthoritative(clean.receipt!)).toBe(false);
  });

  it("writes temp evidence without touching tracked paths (local only)", () => {
    const tmpDir = resolve(root, ".scratch/evidence-tmp");
    mkdirSync(tmpDir, { recursive: true });
    const tmp = resolve(tmpDir, "da31-phase0-probe.json");
    writeFileSync(tmp, `${JSON.stringify({ ok: true, probe: "hermetic" }, null, 2)}\n`, "utf8");
    expect(existsSync(tmp)).toBe(true);
  });
});
