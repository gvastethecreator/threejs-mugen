/**
 * Materialize authority-selector + roadmap-cursor using the TS digest algorithm.
 * Run: pnpm exec vitest run scripts/materialize_control_projections_via_vitest.ts
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { describe, it, expect } from "vitest";
import { createAuthoritySelectorDocument } from "../src/mugen/compatibility/AuthoritySelector";
import { createRoadmapCursorDocument } from "../src/mugen/compatibility/RoadmapCursor";

const root = process.cwd();

describe("materialize control projections (side-effect)", () => {
  it("writes selector and cursor from control-source-v1.json", () => {
    const source = JSON.parse(readFileSync(resolve(root, "docs/evidence/control-source-v1.json"), "utf8")) as {
      closedThrough: string;
      nextQueue: string[];
      scores: Record<string, string>;
      cursors: Record<string, { sha: string; artifact: string; claimLimit: string }>;
      claims: { allowed: string[]; blocked: string[] };
      seriesHold?: unknown;
    };
    const generatedAt = new Date().toISOString();
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: root }).toString().trim();

    const selector = createAuthoritySelectorDocument({
      generatedAt,
      closedThrough: source.closedThrough,
      nextQueue: source.nextQueue,
      scores: source.scores as never,
      cursors: {
        formal: source.cursors.formal,
        focal: source.cursors.focal,
        global: source.cursors.global,
        visual: source.cursors.visual,
        product: source.cursors.product,
        sourceNormative: source.cursors.sourceNormative,
        sourceWorking: source.cursors.sourceWorking,
      },
      artifacts: {
        authoritySelectorDoc: ".scratch/architecture/AUTHORITY_SELECTOR.md",
        roadmapCursor: "docs/evidence/roadmap-cursor-v1.json",
        sourceEpoch: "docs/evidence/source-authority-epoch-v1.json",
        globalCheckpointReport: source.cursors.global.artifact,
      },
      claims: source.claims,
    });

    // Attach seriesHold as non-schema extension is not allowed — keep pure schema.
    writeFileSync(resolve(root, "docs/evidence/authority-selector-v1.json"), `${JSON.stringify(selector, null, 2)}\n`, "utf8");

    const cursor = createRoadmapCursorDocument({
      generatedAt,
      branch,
      scores: source.scores as never,
      dirtyExclusions: [],
      cursors: [
        { kind: "head", sha: source.cursors.head.sha, date: generatedAt, artifact: source.cursors.head.artifact, claimLimit: source.cursors.head.claimLimit },
        { kind: "formal", sha: source.cursors.formal.sha, date: generatedAt, artifact: source.cursors.formal.artifact, claimLimit: source.cursors.formal.claimLimit },
        { kind: "focal", sha: source.cursors.focal.sha, date: generatedAt, artifact: source.cursors.focal.artifact, claimLimit: source.cursors.focal.claimLimit },
        { kind: "global", sha: source.cursors.global.sha, date: generatedAt, artifact: source.cursors.global.artifact, claimLimit: source.cursors.global.claimLimit },
        { kind: "visual", sha: source.cursors.visual.sha, date: generatedAt, artifact: source.cursors.visual.artifact, claimLimit: source.cursors.visual.claimLimit },
        { kind: "product", sha: source.cursors.product.sha, date: generatedAt, artifact: source.cursors.product.artifact, claimLimit: source.cursors.product.claimLimit },
        {
          kind: "source",
          sha: source.cursors.sourceNormative.sha,
          date: generatedAt,
          artifact: source.cursors.sourceNormative.artifact,
          claimLimit: `${source.cursors.sourceNormative.claimLimit}; working=${source.cursors.sourceWorking.sha.slice(0, 12)}; closedThrough=${source.closedThrough}; next=${source.nextQueue[0] || "empty"}`,
        },
      ],
      claims: {
        allowed: [...source.claims.allowed, `control-source closedThrough=${source.closedThrough}`],
        blocked: source.claims.blocked,
      },
    });
    writeFileSync(resolve(root, "docs/evidence/roadmap-cursor-v1.json"), `${JSON.stringify(cursor, null, 2)}\n`, "utf8");

    expect(selector.closedThrough).toBe(source.closedThrough);
    expect(cursor.cursors).toHaveLength(7);
    expect(selector.cursors.formal.sha).toBe(cursor.cursors.find((c) => c.kind === "formal")?.sha);
    // fingerprint for logs
    const fp = createHash("sha256").update(selector.digest.value + cursor.digest.value).digest("hex").slice(0, 12);
    expect(fp.length).toBe(12);
  });
});
