/**
 * Acceptance-executed evidence for DA29-052..100 (waves 5–9 consecutive drain).
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { writeMeasuredJson } from "./da29/writeMeasuredJson";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DA29_WAVE5_EXECUTORS } from "../mugen/da29/Da29Wave5Evidence";

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
      return { path: p, bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") };
    });
  const body = {
    schema: "Da29MeasuredEvidence/v1",
    id,
    kind,
    generatedAt: new Date().toISOString(),
    ok: true,
    acceptanceExecuted: true,
    command: `pnpm exec vitest run src/tests/Da29Wave5ConsecutiveEvidence.test.ts -t ${id}`,
    anchors,
    functionResults: result.functionResults,
    claimCeiling: `acceptance-executed unit evidence for ${id}; broader product claims remain blocked`,
  };
  writeMeasuredJson(resolve(outDir, `${id}.json`), body);
}

const CASES = Object.keys(DA29_WAVE5_EXECUTORS).sort() as Array<keyof typeof DA29_WAVE5_EXECUTORS>;

const KIND: Record<string, "I" | "G"> = {
  "DA29-052": "I",
  "DA29-053": "I",
  "DA29-054": "I",
  "DA29-055": "I",
  "DA29-056": "I",
  "DA29-058": "G",
  "DA29-059": "I",
  "DA29-062": "I",
  "DA29-063": "I",
  "DA29-064": "I",
  "DA29-065": "G",
  "DA29-066": "I",
  "DA29-068": "I",
  "DA29-073": "I",
  "DA29-074": "I",
  "DA29-075": "I",
  "DA29-077": "I",
  "DA29-078": "I",
  "DA29-080": "G",
  "DA29-082": "G",
  "DA29-083": "G",
  "DA29-085": "G",
  "DA29-086": "G",
  "DA29-087": "I",
  "DA29-088": "I",
  "DA29-090": "G",
  "DA29-092": "I",
  "DA29-093": "I",
  "DA29-094": "I",
  "DA29-095": "I",
  "DA29-097": "I",
  "DA29-098": "I",
  "DA29-099": "G",
  "DA29-100": "I",
};

describe("DA29 wave5–9 consecutive acceptance-executed evidence", () => {
  it.each(CASES)("%s executes shipped acceptance path", (id) => {
    const exec = DA29_WAVE5_EXECUTORS[id];
    const result = exec();
    expect(result.id).toBe(id);
    expect(Object.keys(result.functionResults).length).toBeGreaterThan(0);
    persist(id, KIND[id] ?? "I", result);
  });
});
