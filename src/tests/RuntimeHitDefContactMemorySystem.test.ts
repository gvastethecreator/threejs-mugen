import { describe, expect, it } from "vitest";
import {
  bufferRuntimeHitDefTarget,
  commitRuntimeHitDefTargets,
  createRuntimeHitDefContactMemoryDiagnostic,
  hasRuntimeHitDefTarget,
  resetRuntimeHitDefContactMemory,
} from "../mugen/runtime/RuntimeHitDefContactMemorySystem";

describe("RuntimeHitDefContactMemorySystem", () => {
  it("buffers source-order getter ids, commits duplicates, and clears pending", () => {
    const actor = { id: "p1", hitDefTargets: ["p2"], pendingHitDefTargets: [] as string[] };

    bufferRuntimeHitDefTarget(actor, "p4");
    bufferRuntimeHitDefTarget(actor, "p4");
    expect(hasRuntimeHitDefTarget(actor, "p4")).toBe(true);
    expect(commitRuntimeHitDefTargets(actor)).toEqual(["p4", "p4"]);
    expect(actor).toMatchObject({ hitDefTargets: ["p2", "p4", "p4"], pendingHitDefTargets: [] });
  });

  it("resets both lists and returns detached diagnostics", () => {
    const actor = { id: "p3", hitDefTargets: ["p2"], pendingHitDefTargets: ["p4"] };
    const diagnostic = createRuntimeHitDefContactMemoryDiagnostic([actor]);
    diagnostic.actors[0]!.committed.push("mutated");
    diagnostic.actors[0]!.pending.push("mutated");
    expect(actor).toEqual({ id: "p3", hitDefTargets: ["p2"], pendingHitDefTargets: ["p4"] });

    resetRuntimeHitDefContactMemory(actor);
    expect(actor).toEqual({ id: "p3", hitDefTargets: [], pendingHitDefTargets: [] });
  });
});
