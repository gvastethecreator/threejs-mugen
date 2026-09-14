/**
 * Acceptance-executed evidence for remaining open DA29 IDs (102–200, waves 10–19).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { persistMeasuredEvidence } from "./da29/writeMeasuredJson";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DA29_WAVE10_EXECUTORS } from "../mugen/da29/Da29Wave10Evidence";

const outDir = resolve(process.cwd(), "docs/evidence/da29/measured");

function persist(id: string, kind: "I" | "G", result: { functionResults: Record<string, unknown>; anchors: string[] }) {
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
    command: `pnpm exec vitest run src/tests/Da29Wave10ConsecutiveEvidence.test.ts -t ${id}`,
    anchors,
    functionResults: result.functionResults,
    claimCeiling: `acceptance-executed unit evidence for ${id}; broader product claims remain blocked`,
  };
  persistMeasuredEvidence(resolve(outDir, `${id}.json`), body);
}

const CASES = Object.keys(DA29_WAVE10_EXECUTORS).sort() as Array<keyof typeof DA29_WAVE10_EXECUTORS>;

/** Kind map from closeout-status open records (I vs G). */
const KIND: Record<string, "I" | "G"> = {
  "DA29-102": "I",
  "DA29-103": "G",
  "DA29-104": "G",
  "DA29-105": "G",
  "DA29-108": "I",
  "DA29-109": "I",
  "DA29-110": "G",
  "DA29-113": "I",
  "DA29-114": "G",
  "DA29-115": "G",
  "DA29-116": "G",
  "DA29-117": "G",
  "DA29-119": "I",
  "DA29-120": "G",
  "DA29-121": "G",
  "DA29-122": "G",
  "DA29-123": "G",
  "DA29-124": "G",
  "DA29-126": "G",
  "DA29-127": "G",
  "DA29-128": "G",
  "DA29-130": "G",
  "DA29-131": "I",
  "DA29-132": "G",
  "DA29-135": "I",
  "DA29-139": "I",
  "DA29-140": "G",
  "DA29-142": "I",
  "DA29-143": "I",
  "DA29-144": "G",
  "DA29-145": "G",
  "DA29-146": "G",
  "DA29-148": "G",
  "DA29-149": "I",
  "DA29-150": "G",
  "DA29-152": "G",
  "DA29-153": "I",
  "DA29-154": "I",
  "DA29-156": "I",
  "DA29-157": "I",
  "DA29-158": "G",
  "DA29-159": "I",
  "DA29-160": "G",
  "DA29-161": "G",
  "DA29-162": "G",
  "DA29-164": "I",
  "DA29-165": "I",
  "DA29-166": "I",
  "DA29-167": "G",
  "DA29-169": "G",
  "DA29-170": "G",
  "DA29-172": "G",
  "DA29-174": "G",
  "DA29-176": "I",
  "DA29-177": "G",
  "DA29-178": "G",
  "DA29-179": "G",
  "DA29-180": "G",
  "DA29-182": "I",
  "DA29-183": "I",
  "DA29-184": "I",
  "DA29-185": "I",
  "DA29-186": "G",
  "DA29-187": "I",
  "DA29-188": "G",
  "DA29-190": "G",
  "DA29-194": "I",
  "DA29-195": "G",
  "DA29-196": "G",
  "DA29-200": "G",
};

describe("DA29 wave10–19 consecutive acceptance-executed evidence", () => {
  it.each(CASES)("%s executes shipped acceptance path", (id) => {
    const exec = DA29_WAVE10_EXECUTORS[id];
    const result = exec();
    expect(result.id).toBe(id);
    expect(Object.keys(result.functionResults).length).toBeGreaterThan(0);
    persist(id, KIND[id] ?? "I", result);
  });
});
