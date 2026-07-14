import { describe, expect, it } from "vitest";
import {
  canWriteStudioSemanticDraft,
  createStudioSemanticDraftPreflight,
  STUDIO_SEMANTIC_DRAFT_COMPILER_PROFILE,
  STUDIO_SEMANTIC_DRAFT_COMPILER_VERSION,
} from "../app/StudioSemanticDraft";

describe("StudioSemanticDraft", () => {
  it("parses and compiles a CNS draft without opening a write stream", () => {
    const preflight = createStudioSemanticDraftPreflight({
      sourcePackageId: "kfm-folder",
      path: "chars/kfm/kfm.cns",
      text: validCns(),
      baseFingerprint: "a".repeat(64),
      activeFingerprint: "a".repeat(64),
      baseRevision: 4,
      activeRevision: 4,
    });

    expect(preflight.status).toBe("ready");
    expect(canWriteStudioSemanticDraft(preflight)).toBe(true);
    expect(preflight.compilerProfile).toBe(STUDIO_SEMANTIC_DRAFT_COMPILER_PROFILE);
    expect(preflight.compilerVersion).toBe(STUDIO_SEMANTIC_DRAFT_COMPILER_VERSION);
    expect(preflight.compile).toMatchObject({ states: 1, controllers: 1, compiledControllers: 1 });
    expect(preflight.draftDigest).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
    expect(preflight.diagnosticDigest).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
  });

  it("blocks malformed CNS syntax as invalid and keeps the write gate closed", () => {
    const preflight = createStudioSemanticDraftPreflight({
      sourcePackageId: "kfm-folder",
      path: "chars/kfm/kfm.cns",
      text: `${validCns()}\nnot-a-key-value`,
      baseFingerprint: "a".repeat(64),
      activeFingerprint: "a".repeat(64),
    });

    expect(preflight.status).toBe("invalid");
    expect(canWriteStudioSemanticDraft(preflight)).toBe(false);
    expect(preflight.diagnostics.some((diagnostic) => diagnostic.code === "parse-diagnostic")).toBe(true);
  });

  it("blocks unsupported source formats instead of treating raw text as compiled", () => {
    const preflight = createStudioSemanticDraftPreflight({
      sourcePackageId: "kfm-folder",
      path: "chars/kfm/kfm.def",
      text: validCns(),
    });

    expect(preflight.status).toBe("invalid");
    expect(preflight.diagnostics).toContainEqual(expect.objectContaining({ code: "unsupported-source-format" }));
    expect(canWriteStudioSemanticDraft(preflight)).toBe(false);
  });

  it("marks a draft stale when the active source or project revision moves", () => {
    const preflight = createStudioSemanticDraftPreflight({
      sourcePackageId: "kfm-folder",
      path: "chars/kfm/kfm.st",
      text: validCns(),
      baseFingerprint: "a".repeat(64),
      activeFingerprint: "b".repeat(64),
      baseRevision: 4,
      activeRevision: 5,
    });

    expect(preflight.status).toBe("stale");
    expect(canWriteStudioSemanticDraft(preflight)).toBe(false);
    expect(preflight.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "source-fingerprint-changed",
      "project-revision-changed",
    ]);
  });

  it("keeps the semantic digests deterministic for the same draft", () => {
    const input = {
      sourcePackageId: "kfm-folder",
      path: "chars/kfm/kfm.cns",
      text: validCns(),
      baseFingerprint: "a".repeat(64),
      activeFingerprint: "a".repeat(64),
      baseRevision: 4,
      activeRevision: 4,
    };

    const left = createStudioSemanticDraftPreflight(input);
    const right = createStudioSemanticDraftPreflight(input);

    expect(right.draftDigest).toBe(left.draftDigest);
    expect(right.diagnosticDigest).toBe(left.diagnosticDigest);
    expect(right.diagnostics).toEqual(left.diagnostics);
  });
});

function validCns(): string {
  return `[Statedef 0]\ntype = S\nmovetype = I\nphysics = S\n\n[State 0, VelSet]\ntype = VelSet\ntrigger1 = Time = 0\nx = 0\ny = 0\n`;
}
