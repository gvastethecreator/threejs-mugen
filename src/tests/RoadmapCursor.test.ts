import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalizeRoadmapCursorDocument,
  createRoadmapCursorDocument,
  evaluateRoadmapCursorFreshness,
  getRoadmapCursor,
  parseRoadmapCursorDocument,
  ROADMAP_CURSOR_KINDS,
  type RoadmapCursorInput,
} from "../mugen/compatibility/RoadmapCursor";

const HEAD = "7d9b15f828934a7a25f445b44d72e01cd471027e";
// Unit fixtures use fixed digests independent of live git history.
const SHA = {
  head: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  formal: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  focal: "cccccccccccccccccccccccccccccccccccccccc",
  global: "dddddddddddddddddddddddddddddddddddddddd",
  visual: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  product: "ffffffffffffffffffffffffffffffffffffffff",
  source: "1111111111111111111111111111111111111111",
};

function input(overrides: Partial<RoadmapCursorInput> = {}): RoadmapCursorInput {
  return {
    generatedAt: "2026-07-26T17:00:00.000Z",
    branch: "master",
    scores: {
      sandbox: "65",
      mugenLite: "36",
      mugenMvp: "20",
      mugenFull: "10-12",
      ikemen: "6-8",
      studio: "25",
    },
    dirtyExclusions: [],
    cursors: ROADMAP_CURSOR_KINDS.map((kind) => ({
      kind,
      sha: SHA[kind],
      date: "2026-07-26T17:00:00.000Z",
      artifact: `docs/research/${kind}.md`,
      claimLimit: `${kind} claim only`,
    })),
    claims: {
      allowed: ["control state at named SHAs"],
      blocked: ["score movement", "visual inheritance"],
    },
    ...overrides,
  };
}

describe("RoadmapCursor", () => {
  it("creates a deterministic document with all seven cursors and a stable digest", () => {
    const first = createRoadmapCursorDocument(input());
    const reversed = createRoadmapCursorDocument({
      ...input(),
      cursors: [...input().cursors].reverse(),
    });
    const withDirty = createRoadmapCursorDocument({
      ...input(),
      dirtyExclusions: ["  ", "src/tmp.ts", "src/tmp.ts"],
    });

    expect(first.cursors.map((cursor) => cursor.kind)).toEqual([...ROADMAP_CURSOR_KINDS]);
    // Cursor order in the input does not affect the normalized document.
    expect(first.digest.value).toBe(reversed.digest.value);
    expect(first.digest.value).toBe(createRoadmapCursorDocument(input()).digest.value);
    expect(first.dirtyExclusions).toEqual([]);
    expect(withDirty.dirtyExclusions).toEqual(["src/tmp.ts"]);
    expect(withDirty.digest.value).not.toBe(first.digest.value);
    expect(getRoadmapCursor(first, "global")?.sha).toBe(SHA.global);
  });

  it("round-trips and rejects digest tampering", () => {
    const document = createRoadmapCursorDocument(input());
    expect(parseRoadmapCursorDocument(document)).toEqual({ errors: [], document });
    const tampered = {
      ...document,
      claims: { ...document.claims, allowed: ["score movement"] },
    };
    expect(parseRoadmapCursorDocument(tampered).errors).toContain("Roadmap cursor digest mismatch");
  });

  it("rejects missing required cursor kinds", () => {
    expect(() =>
      createRoadmapCursorDocument({
        ...input(),
        cursors: input().cursors.filter((cursor) => cursor.kind !== "source"),
      }),
    ).toThrow(/missing required kind source/);
  });

  it("marks freshness current, stale, and mismatch from observed HEAD and age", () => {
    const document = createRoadmapCursorDocument(input({
      generatedAt: "2026-07-26T12:00:00.000Z",
      cursors: ROADMAP_CURSOR_KINDS.map((kind) => ({
        kind,
        sha: kind === "head" ? HEAD : SHA[kind],
        date: "2026-07-26T12:00:00.000Z",
        artifact: `docs/${kind}.md`,
        claimLimit: kind,
      })),
    }));

    expect(evaluateRoadmapCursorFreshness(document, {
      observedHeadSha: HEAD,
      now: "2026-07-26T13:00:00.000Z",
      maxAgeMs: 24 * 60 * 60 * 1000,
    })).toEqual({ status: "current", reasons: [] });

    const stale = evaluateRoadmapCursorFreshness(document, {
      observedHeadSha: HEAD,
      now: "2026-07-28T13:00:00.000Z",
      maxAgeMs: 24 * 60 * 60 * 1000,
    });
    expect(stale.status).toBe("stale");
    expect(stale.reasons.some((reason) => reason.includes("max age"))).toBe(true);

    const mismatch = evaluateRoadmapCursorFreshness(document, {
      observedHeadSha: "9999999999999999999999999999999999999999",
      now: "2026-07-26T13:00:00.000Z",
    });
    expect(mismatch.status).toBe("mismatch");
    expect(mismatch.reasons.some((reason) => reason.includes("does not match"))).toBe(true);
  });

  it("parses the committed roadmap cursor evidence artifact when present", () => {
    const artifactPath = resolve(process.cwd(), "docs/evidence/roadmap-cursor-v1.json");
    expect(existsSync(artifactPath)).toBe(true);
    const parsed = parseRoadmapCursorDocument(JSON.parse(readFileSync(artifactPath, "utf8")));
    expect(parsed.errors).toEqual([]);
    expect(parsed.document?.schemaVersion).toBe("mugen-web-sandbox/roadmap-cursor/v1");
    expect(parsed.document?.cursors).toHaveLength(7);
    expect(getRoadmapCursor(parsed.document!, "global")?.artifact).toContain("global-checkpoint-after-t406");
    // Canonical form is stable for the committed payload.
    expect(canonicalizeRoadmapCursorDocument(parsed.document!).length).toBeGreaterThan(100);
  });
});
