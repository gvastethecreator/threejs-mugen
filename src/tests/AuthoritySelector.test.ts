import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUTHORITY_SELECTOR_STALE_CURRENT_PATTERNS,
  createAuthoritySelectorDocument,
  parseAuthoritySelectorDocument,
  type AuthoritySelectorInput,
} from "../mugen/compatibility/AuthoritySelector";

const GATE = "32466c6e8bb4ec3f414a0cda032af24ea241e5c6";

function input(overrides: Partial<AuthoritySelectorInput> = {}): AuthoritySelectorInput {
  return {
    generatedAt: "2026-07-26T19:00:00.000Z",
    closedThrough: "DA28-06",
    nextQueue: ["DA28-07", "DA28-08"],
    scores: {
      sandbox: "65",
      mugenLite: "36",
      mugenMvp: "20",
      mugenFull: "10-12",
      ikemen: "6-8",
      studio: "25",
    },
    cursors: {
      formal: { sha: GATE, artifact: "docs/BUILD_EXECUTION_BACKLOG.md", claimLimit: "Entry 587" },
      focal: { sha: "07ad9227", artifact: "docs/research/t406.md", claimLimit: "T406" },
      global: { sha: GATE, artifact: "docs/research/global.md", claimLimit: "global gate" },
      visual: { sha: "1085badb", artifact: "t342", claimLimit: "visual" },
      product: { sha: "1085badb", artifact: "t342", claimLimit: "product" },
      sourceNormative: { sha: "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703", artifact: "epoch", claimLimit: "05b" },
      sourceWorking: { sha: "4aa0ba38f851c52549ba182310e9e53361cd472a", artifact: "epoch", claimLimit: "4aa" },
    },
    artifacts: {
      authoritySelectorDoc: "docs/AUTHORITY_SELECTOR.md",
      roadmapCursor: "docs/evidence/roadmap-cursor-v1.json",
      sourceEpoch: "docs/evidence/source-authority-epoch-v1.json",
      globalCheckpointReport: "docs/research/2026-07-26-global-checkpoint-after-t406.md",
    },
    claims: {
      allowed: ["single selector"],
      blocked: ["score movement"],
    },
    ...overrides,
  };
}

describe("AuthoritySelector", () => {
  it("creates a deterministic document and rejects digest tampering", () => {
    const first = createAuthoritySelectorDocument(input());
    const second = createAuthoritySelectorDocument({
      ...input(),
      nextQueue: ["DA28-08", "DA28-07"],
    });
    expect(first.digest.value).toBe(second.digest.value);
    expect(first.nextQueue[0]).toBe("DA28-07");
    expect(first.cursors.formal.sha).toBe(GATE);
    expect(first.cursors.global.sha).toBe(GATE);
    expect(parseAuthoritySelectorDocument(first)).toEqual({ errors: [], document: first });
    const tampered = {
      ...first,
      closedThrough: "DA26-10",
    };
    expect(parseAuthoritySelectorDocument(tampered).errors).toContain("Authority selector digest mismatch");
  });

  it("parses the committed authority selector artifact", () => {
    const artifactPath = resolve(process.cwd(), "docs/evidence/authority-selector-v1.json");
    expect(existsSync(artifactPath)).toBe(true);
    const parsed = parseAuthoritySelectorDocument(JSON.parse(readFileSync(artifactPath, "utf8")));
    expect(parsed.errors).toEqual([]);
    expect(parsed.document?.closedThrough).toMatch(/^DA2[678]-\d{2}$/);
    expect(parsed.document?.nextQueue[0]).toBe("DA28-07");
    expect(parsed.document?.cursors.formal.sha.startsWith("32466c6e")).toBe(true);
    expect(parsed.document?.cursors.global.sha.startsWith("32466c6e")).toBe(true);
  });

  it("keeps stale-current patterns that the reference auditor relies on", () => {
    const sample = "Use HEAD `c01d5e70` and Entry 585 with global T383 and six dirty juggle files. Next: DA26-08.";
    const hits = AUTHORITY_SELECTOR_STALE_CURRENT_PATTERNS.filter((pattern) => pattern.test(sample));
    expect(hits.length).toBeGreaterThanOrEqual(3);
  });
});
