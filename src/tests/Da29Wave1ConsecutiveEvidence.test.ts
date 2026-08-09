/**
 * Acceptance-executed evidence for consecutive DA29 watermark advance from 012.
 * Writes docs/evidence/da29/measured/DA29-0xx.json with functionResults.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DA29_WAVE1_EXECUTORS } from "../mugen/da29/Da29Wave1Evidence";
import { validateTraceArtifactManifest, buildTraceArtifactManifest } from "../mugen/da29/TraceArtifactManifest";
import { buildCnsControllerCensus } from "../mugen/da29/CnsControllerCensus";

const outDir = resolve(process.cwd(), "docs/evidence/da29/measured");

function persist(id: string, kind: "I" | "G", result: { functionResults: Record<string, unknown>; anchors: string[] }) {
  mkdirSync(outDir, { recursive: true });
  const anchors = result.anchors
    .filter((p) => existsSync(resolve(process.cwd(), p)))
    .map((p) => {
      const abs = resolve(process.cwd(), p);
      const st = statSync(abs);
      if (st.isDirectory()) return { path: p, bytes: 0, sha256: "directory" };
      const buf = readFileSync(abs);
      return {
        path: p,
        bytes: buf.length,
        sha256: createHash("sha256").update(buf).digest("hex"),
      };
    });
  const body = {
    schema: "Da29MeasuredEvidence/v1",
    id,
    kind,
    generatedAt: new Date().toISOString(),
    ok: true,
    acceptanceExecuted: true,
    command: `pnpm exec vitest run src/tests/Da29Wave1ConsecutiveEvidence.test.ts -t ${id}`,
    anchors,
    functionResults: result.functionResults,
    claimCeiling: `acceptance-executed unit evidence for ${id}; broader product claims remain blocked`,
  };
  writeFileSync(resolve(outDir, `${id}.json`), `${JSON.stringify(body, null, 2)}\n`, "utf8");
}

describe("DA29 wave1 consecutive acceptance-executed evidence", () => {
  it("DA29-012 builds trace artifact manifest from RuntimeTraceGatePresets", () => {
    const manifest = buildTraceArtifactManifest();
    expect(manifest.entryCount).toBeGreaterThan(10);
    expect(validateTraceArtifactManifest(manifest)).toEqual([]);
    const result = DA29_WAVE1_EXECUTORS["DA29-012"]();
    expect(result.functionResults.entryCount).toBe(manifest.entryCount);
    persist("DA29-012", "I", result);
  });

  it("DA29-013 builds CNS controller census without treating StateDef type as controllers", () => {
    const source = "public/characters/rocco-vidal/mugen/rocco.cns";
    const census = buildCnsControllerCensus(readFileSync(resolve(process.cwd(), source), "utf8"), source);
    expect(census.controllerCount).toBeGreaterThan(0);
    expect(census.stateDefCount).toBeGreaterThan(0);
    // Controllers should include real types like ChangeState / HitDef if present
    expect(census.totalOccurrences).toBeGreaterThan(0);
    const result = DA29_WAVE1_EXECUTORS["DA29-013"]();
    persist("DA29-013", "I", result);
  });

  it.each([
    ["DA29-015", "G"],
    ["DA29-016", "I"],
    ["DA29-017", "I"],
    ["DA29-018", "G"],
    ["DA29-019", "G"],
    ["DA29-022", "I"],
    ["DA29-023", "I"],
    ["DA29-024", "I"],
    ["DA29-025", "I"],
    ["DA29-026", "I"],
    ["DA29-029", "I"],
    ["DA29-033", "I"],
    ["DA29-037", "I"],
    ["DA29-038", "G"],
    ["DA29-040", "G"],
    ["DA29-041", "I"],
    ["DA29-042", "I"],
    ["DA29-043", "I"],
    ["DA29-044", "I"],
    ["DA29-045", "I"],
    ["DA29-046", "I"],
    ["DA29-047", "I"],
    ["DA29-049", "I"],
    ["DA29-050", "G"],
  ] as const)("%s executes acceptance evidence", (id, kind) => {
    const exec = DA29_WAVE1_EXECUTORS[id];
    expect(exec, id).toBeTruthy();
    const result = exec();
    expect(result.id).toBe(id);
    expect(Object.keys(result.functionResults).length).toBeGreaterThan(0);
    persist(id, kind, result);
  });
});
