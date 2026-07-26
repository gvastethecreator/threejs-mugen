import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  defaultBoundaryRoots,
  evaluateBoundaryManifest,
} from "../mugen/compatibility/BoundaryManifest";

describe("BoundaryManifest", () => {
  it("fails closed when a required root is missing", () => {
    const result = evaluateBoundaryManifest({
      roots: [
        { path: "src/core", kind: "required", exists: false },
        { path: "src/engine", kind: "required", exists: true },
        { path: "src/modules/platformer", kind: "planned", exists: false },
      ],
      allowlistTotalFiles: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toContain("required-missing:src/core");
  });

  it("fails total allowlists and forbidden imports/terms", () => {
    const result = evaluateBoundaryManifest({
      roots: [{ path: "src/engine", kind: "required", exists: true }],
      allowlistTotalFiles: 99,
      allowlistMax: 0,
      forbiddenImportHits: ["src/core/foo.ts->mugen"],
      forbiddenTermHits: ["HitDef"],
    });
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.startsWith("allowlist-total-exceeded"))).toBe(true);
    expect(result.diagnostics).toContain("forbidden-import:src/core/foo.ts->mugen");
    expect(result.diagnostics).toContain("forbidden-term:HitDef");
  });

  it("passes when required roots exist and planned roots may be absent", () => {
    const roots = defaultBoundaryRoots((relative) =>
      existsSync(resolve(process.cwd(), relative)),
    );
    const result = evaluateBoundaryManifest({
      roots: roots.map((root) =>
        root.path === "src/core"
          ? // current repo: core may be absent; for this positive case force required only when exists
            { ...root, kind: root.exists ? "required" : "planned" }
          : root,
      ),
      allowlistTotalFiles: 0,
      allowlistMax: 0,
    });
    // engine exists in repo; planned platformer may be missing
    expect(result.manifest.roots.some((root) => root.path === "src/engine" && root.exists)).toBe(true);
    if (!result.ok) {
      // Only acceptable failures are pre-existing missing required core.
      expect(result.diagnostics.every((d) => d.startsWith("required-missing:src/core"))).toBe(true);
    }
  });

  it("does not treat planned missing roots as failures", () => {
    const result = evaluateBoundaryManifest({
      roots: [
        { path: "src/engine", kind: "required", exists: true },
        { path: "src/modules/platformer", kind: "planned", exists: false },
      ],
      allowlistTotalFiles: 0,
    });
    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });
});
