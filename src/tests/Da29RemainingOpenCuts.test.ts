/**
 * Acceptance-executed measured evidence only for cuts that call shipped functions.
 * Path-inventory theater is forbidden: ok+acceptanceExecuted require functionResults.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAir } from "../mugen/parsers/AirParser";
import { createAuthoritySelectorDocument } from "../mugen/compatibility/AuthoritySelector";
import { runPluralCombatOracle } from "../mugen/runtime/PluralCombatOracle";

const root = process.cwd();
const outDir = resolve(root, "docs/evidence/da29/measured");

function writeMeasured(id: string, payload: Record<string, unknown>): void {
  mkdirSync(outDir, { recursive: true });
  const body = {
    schema: "Da29MeasuredEvidence/v1",
    id,
    generatedAt: new Date().toISOString(),
    ...payload,
  };
  writeFileSync(resolve(outDir, `${id}.json`), `${JSON.stringify(body, null, 2)}\n`, "utf8");
}

function fileDigest(rel: string): { path: string; bytes: number; sha256: string } {
  const abs = resolve(root, rel);
  const buf = readFileSync(abs);
  return {
    path: rel,
    bytes: buf.length,
    sha256: createHash("sha256").update(buf).digest("hex"),
  };
}

describe("DA29 acceptance-executed measured evidence", () => {
  it("DA29-084 executes parseAir on real nova.air and malformed input", () => {
    const airPath = "public/characters/nova-boxer/mugen/nova.air";
    expect(existsSync(resolve(root, airPath))).toBe(true);
    const text = readFileSync(resolve(root, airPath), "utf8");
    const parsed = parseAir(text, airPath);
    expect(parsed.actions.size).toBeGreaterThan(0);
    const malformed = parseAir("[Begin Action\nloopstart\n", "malformed.air");
    expect(Array.isArray(malformed.diagnostics)).toBe(true);

    writeMeasured("DA29-084", {
      kind: "G",
      ok: true,
      acceptanceExecuted: true,
      command: "pnpm exec vitest run src/tests/Da29RemainingOpenCuts.test.ts -t DA29-084",
      anchors: ["src/mugen/parsers/AirParser.ts", airPath].map(fileDigest),
      functionResults: {
        actionCount: parsed.actions.size,
        diagnosticCount: parsed.diagnostics.length,
        malformedDiagnostics: malformed.diagnostics.length,
        sampleActionIds: [...parsed.actions.keys()].slice(0, 5),
      },
      claimCeiling: "AIR parse executed on repository nova.air + malformed path; not full AIR corpus matrix",
    });
  });

  it("DA29-134 executes createAuthoritySelectorDocument digest path", () => {
    const auth = createAuthoritySelectorDocument({
      generatedAt: "2026-07-27T00:00:00.000Z",
      closedThrough: "DA29-002",
      nextQueue: ["DA29-003"],
      scores: {
        sandbox: "65",
        mugenLite: "36",
        mugenMvp: "20",
        mugenFull: "10-12",
        ikemen: "6-8",
        studio: "25",
      },
      cursors: {
        formal: { sha: "a6e91520081d6308eac3d53b6bf333d4b950d019", artifact: "g", claimLimit: "DA29-002" },
        focal: { sha: "07ad9227", artifact: "f", claimLimit: "T406" },
        global: { sha: "a6e91520081d6308eac3d53b6bf333d4b950d019", artifact: "g", claimLimit: "DA29-002" },
        visual: { sha: "1085badb", artifact: "v", claimLimit: "T342" },
        product: { sha: "1085badb", artifact: "p", claimLimit: "T342" },
        sourceNormative: { sha: "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703", artifact: "e", claimLimit: "05b" },
        sourceWorking: { sha: "4aa0ba38f851c52549ba182310e9e53361cd472a", artifact: "e", claimLimit: "4aa" },
      },
      artifacts: {
        authoritySelectorDoc: "docs/AUTHORITY_SELECTOR.md",
        roadmapCursor: "docs/evidence/roadmap-cursor-v1.json",
        sourceEpoch: "docs/evidence/source-authority-epoch-v1.json",
        globalCheckpointReport: "docs/research/da29/2026-07-26-global-checkpoint-da29-002.md",
      },
      claims: { allowed: ["probe"], blocked: ["score movement"] },
    });
    expect(auth.digest.algorithm).toBe("sha-256");
    expect(auth.digest.value).toMatch(/^[a-f0-9]{64}$/);
    expect(auth.closedThrough).toBe("DA29-002");

    writeMeasured("DA29-134", {
      kind: "I",
      ok: true,
      acceptanceExecuted: true,
      command: "pnpm exec vitest run src/tests/Da29RemainingOpenCuts.test.ts -t DA29-134",
      anchors: ["src/mugen/compatibility/AuthoritySelector.ts"].map(fileDigest),
      functionResults: {
        digestPrefix: auth.digest.value.slice(0, 16),
        closedThrough: auth.closedThrough,
        nextHead: auth.nextQueue[0],
      },
      claimCeiling: "SHA-256 digest adapter via createAuthoritySelectorDocument",
    });
  });

  it("DA29-060 executes plural combat oracle (unit stress, not browser)", () => {
    const report = runPluralCombatOracle([
      {
        id: "c-three",
        kind: "projectile-three-owners",
        projectiles: [
          { id: "a", ownerId: "o1-a", ownerSide: 1, spawnTick: 1, localSeq: 0, payload: "p:a" },
          { id: "b", ownerId: "o2-b", ownerSide: 2, spawnTick: 1, localSeq: 0, payload: "p:b" },
          { id: "c", ownerId: "o1-c", ownerSide: 1, spawnTick: 2, localSeq: 0, priority: 0, payload: "p:c" },
        ],
      },
      {
        id: "c-juggle-block",
        kind: "juggle-cost",
        juggleCost: 8,
        juggleRemaining: 2,
      },
    ]);
    expect(report.schema).toBe("PluralCombatOracle/v1");
    expect(report.cellCount).toBe(2);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);

    writeMeasured("DA29-060", {
      kind: "G",
      ok: true,
      acceptanceExecuted: true,
      command: "pnpm exec vitest run src/tests/Da29RemainingOpenCuts.test.ts -t DA29-060",
      anchors: [
        "src/mugen/runtime/PluralCombatOracle.ts",
        "src/mugen/runtime/LivePluralCombatOracle.ts",
      ]
        .filter((p) => existsSync(resolve(root, p)))
        .map(fileDigest),
      functionResults: {
        schema: report.schema,
        cellCount: report.cellCount,
        admittedCount: report.admittedCount,
        checksum: report.checksum,
      },
      claimCeiling: "plural combat oracle unit execution only; not full multi-device stress matrix",
    });
  });
});
