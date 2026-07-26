import { describe, expect, it } from "vitest";
import { evaluateProjectAssetClosure } from "../app/ProjectAssetClosure";

describe("ProjectAssetClosure", () => {
  it("includes transitive references from entry and ignores unused catalog assets", () => {
    const result = evaluateProjectAssetClosure({
      entryId: "project",
      catalogIds: ["project", "fighter", "stage", "unused-diag", "missing-ref"],
      nodes: [
        { id: "project", path: "project.json", references: ["fighter", "stage"] },
        { id: "fighter", path: "chars/a/a.def", references: ["fighter-sff"] },
        { id: "fighter-sff", path: "chars/a/a.sff" },
        { id: "stage", path: "stages/s/s.def" },
        { id: "unused-diag", path: "assets/diag.png" },
      ],
    });
    expect(result.closure.used).toEqual(["fighter", "fighter-sff", "project", "stage"]);
    expect(result.closure.unusedCatalog).toEqual(["unused-diag"]);
    expect(result.blocksRelease).toBe(false);
  });

  it("blocks release only for missing transitive references", () => {
    const result = evaluateProjectAssetClosure({
      entryId: "project",
      nodes: [{ id: "project", path: "project.json", references: ["gone"] }],
    });
    expect(result.closure.missing).toEqual(["gone"]);
    expect(result.blocksRelease).toBe(true);
  });

  it("records cycles without inventing missing nodes", () => {
    const result = evaluateProjectAssetClosure({
      entryId: "a",
      nodes: [
        { id: "a", path: "a", references: ["b"] },
        { id: "b", path: "b", references: ["a"] },
      ],
    });
    expect(result.closure.cycles.length).toBeGreaterThan(0);
    expect(result.closure.used.sort()).toEqual(["a", "b"]);
  });
});
