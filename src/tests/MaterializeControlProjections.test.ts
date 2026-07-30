import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { parseAuthoritySelectorDocument } from "../mugen/compatibility/AuthoritySelector";
import { parseRoadmapCursorDocument } from "../mugen/compatibility/RoadmapCursor";

const root = process.cwd();
const generatedAt = "2026-07-27T18:30:57.369Z";

describe("materialize control projections from control-source", () => {
  it("writes parseable projections outside the repository without changing tracked evidence", () => {
    const trackedSelectorPath = resolve(root, "docs/evidence/authority-selector-v1.json");
    const trackedCursorPath = resolve(root, "docs/evidence/roadmap-cursor-v1.json");
    const trackedBefore = {
      selector: readFileSync(trackedSelectorPath, "utf8"),
      cursor: readFileSync(trackedCursorPath, "utf8"),
    };
    const source = JSON.parse(readFileSync(resolve(root, "docs/evidence/control-source-v1.json"), "utf8")) as {
      closedThrough: string;
      cursors: { formal: { sha: string }; global: { sha: string } };
    };
    const tempRoot = mkdtempSync(join(tmpdir(), "mugen-control-projections-"));
    const selectorPath = join(tempRoot, "authority-selector-v1.json");
    const cursorPath = join(tempRoot, "roadmap-cursor-v1.json");

    try {
      execFileSync(process.execPath, [
        resolve(root, "scripts/materialize_control_projections.cjs"),
        "--source",
        resolve(root, "docs/evidence/control-source-v1.json"),
        "--selector",
        selectorPath,
        "--cursor",
        cursorPath,
        "--generated-at",
        generatedAt,
      ], { cwd: root, stdio: "pipe" });

      const selector = JSON.parse(readFileSync(selectorPath, "utf8"));
      const cursor = JSON.parse(readFileSync(cursorPath, "utf8"));
      const selectorParsed = parseAuthoritySelectorDocument(selector);
      const cursorParsed = parseRoadmapCursorDocument(cursor);

      expect(selectorParsed.errors).toEqual([]);
      expect(cursorParsed.errors).toEqual([]);
      expect(selectorParsed.document?.closedThrough).toBe(source.closedThrough);
      expect(selectorParsed.document?.cursors.formal.sha).toBe(source.cursors.formal.sha);
      expect(cursorParsed.document?.cursors).toHaveLength(7);
      expect(cursorParsed.document?.cursors.find(({ kind }) => kind === "global")?.sha).toBe(
        source.cursors.global.sha,
      );
      const fingerprint = createHash("sha256")
        .update(selector.digest.value + cursor.digest.value)
        .digest("hex")
        .slice(0, 12);
      expect(fingerprint).toHaveLength(12);
      expect(readFileSync(trackedSelectorPath, "utf8")).toBe(trackedBefore.selector);
      expect(readFileSync(trackedCursorPath, "utf8")).toBe(trackedBefore.cursor);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps the legacy roadmap entry point on the canonical control source", () => {
    const trackedSelectorPath = resolve(root, "docs/evidence/authority-selector-v1.json");
    const trackedCursorPath = resolve(root, "docs/evidence/roadmap-cursor-v1.json");
    const trackedBefore = {
      selector: readFileSync(trackedSelectorPath, "utf8"),
      cursor: readFileSync(trackedCursorPath, "utf8"),
    };
    const source = JSON.parse(readFileSync(resolve(root, "docs/evidence/control-source-v1.json"), "utf8")) as {
      cursors: { formal: { sha: string }; global: { sha: string } };
    };
    const tempRoot = mkdtempSync(join(tmpdir(), "mugen-legacy-cursor-"));
    const cursorPath = join(tempRoot, "roadmap-cursor-v1.json");

    try {
      execFileSync(process.execPath, [
        resolve(root, "scripts/materialize_roadmap_cursor.cjs"),
        "--output",
        cursorPath,
        "--generated-at",
        generatedAt,
      ], { cwd: root, stdio: "pipe" });

      const parsed = parseRoadmapCursorDocument(JSON.parse(readFileSync(cursorPath, "utf8")));
      expect(parsed.errors).toEqual([]);
      expect(parsed.document?.cursors.find(({ kind }) => kind === "formal")?.sha).toBe(
        source.cursors.formal.sha,
      );
      expect(parsed.document?.cursors.find(({ kind }) => kind === "global")?.sha).toBe(
        source.cursors.global.sha,
      );
      expect(readFileSync(trackedSelectorPath, "utf8")).toBe(trackedBefore.selector);
      expect(readFileSync(trackedCursorPath, "utf8")).toBe(trackedBefore.cursor);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
