import { describe, expect, it } from "vitest";
import {
  MUGEN_SELECTION_MANIFEST_SCHEMA,
  createMugenSelectionManifest,
} from "../mugen/loader/MugenSelectionManifest";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function fingerprintForSelectDef(byteLength: number) {
  return {
    algorithm: "sha-256" as const,
    digest: "package-digest",
    files: [
      {
        path: "data/select.def",
        digest: "select-digest",
        byteLength,
      },
    ],
  };
}

describe("MugenSelectionManifest", () => {
  it("creates a source-fingerprinted, ordered playable manifest from direct character and stage entries", () => {
    const vfs = new VirtualFileSystem();
    const select = [
      "[Characters]",
      "alpha",
      "beta, order = 2 ; supported option remains source-visible",
      "",
      "[Stages]",
      "skyline",
      "",
    ].join("\n");
    vfs.addFile("data/select.def", text(select));
    vfs.addFile("chars/alpha/alpha.def", text("[Info]\nname = Alpha\n"));
    vfs.addFile("chars/beta/beta.def", text("[Info]\nname = Beta\n"));
    vfs.addFile("stages/skyline.def", text("[Info]\nname = Skyline\n"));

    const manifest = createMugenSelectionManifest({
      vfs,
      sourceFingerprint: fingerprintForSelectDef(text(select).byteLength),
    });
    expect(manifest).toBeDefined();
    if (!manifest) {
      throw new Error("select.def manifest was not created");
    }

    expect(manifest.schemaVersion).toBe(MUGEN_SELECTION_MANIFEST_SCHEMA);
    expect(manifest.source).toEqual({
      path: "data/select.def",
      fingerprint: {
        algorithm: "sha-256",
        digest: "select-digest",
        byteLength: text(select).byteLength,
      },
      packageDigest: "package-digest",
    });
    expect(manifest.characters.map((entry) => [entry.order, entry.reference, entry.options, entry.status, entry.resolvedPath])).toEqual([
      [0, "alpha", undefined, "resolved", "chars/alpha/alpha.def"],
      [1, "beta", "order = 2", "resolved", "chars/beta/beta.def"],
    ]);
    expect(manifest.stages.map((entry) => [entry.order, entry.reference, entry.status, entry.resolvedPath])).toEqual([
      [0, "skyline", "resolved", "stages/skyline.def"],
    ]);
    expect(manifest.playable).toEqual({
      characters: ["chars/alpha/alpha.def", "chars/beta/beta.def"],
      stages: ["stages/skyline.def"],
      ready: true,
    });
    expect(manifest.diagnostics).toEqual([]);
  });

  it("keeps unsafe, missing, duplicate, malformed, and unsupported rows located without promoting them to a launch roster", () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "data/select.def",
      text(
        [
          "[Characters]",
          "../escape",
          "alpha",
          "alpha",
          "randomselect",
          "= broken",
          "",
          "[Stages]",
          "C:\\outside.def",
          "missing",
          "skyline",
          "skyline",
          "",
        ].join("\n"),
      ),
    );
    vfs.addFile("chars/alpha/alpha.def", text("[Info]\nname = Alpha\n"));
    vfs.addFile("stages/skyline.def", text("[Info]\nname = Skyline\n"));

    const manifest = createMugenSelectionManifest({ vfs });
    expect(manifest).toBeDefined();
    if (!manifest) {
      throw new Error("select.def manifest was not created");
    }

    expect(manifest.characters.map((entry) => [entry.reference, entry.status, entry.resolvedPath, entry.duplicateOf])).toEqual([
      ["../escape", "unsafe", undefined, undefined],
      ["alpha", "resolved", "chars/alpha/alpha.def", undefined],
      ["alpha", "duplicate", "chars/alpha/alpha.def", "character-2"],
      ["randomselect", "unsupported", undefined, undefined],
      ["= broken", "malformed", undefined, undefined],
    ]);
    expect(manifest.stages.map((entry) => [entry.reference, entry.status, entry.resolvedPath, entry.duplicateOf])).toEqual([
      ["C:\\outside.def", "unsafe", undefined, undefined],
      ["missing", "missing", undefined, undefined],
      ["skyline", "resolved", "stages/skyline.def", undefined],
      ["skyline", "duplicate", "stages/skyline.def", "stage-3"],
    ]);
    expect(manifest.playable).toEqual({
      characters: ["chars/alpha/alpha.def"],
      stages: ["stages/skyline.def"],
      ready: false,
    });
    expect(manifest.diagnostics.map((diagnostic) => [diagnostic.code, diagnostic.location.line])).toEqual([
      ["unsafe-reference", 2],
      ["duplicate-entry", 4],
      ["unsupported-entry", 5],
      ["malformed-entry", 6],
      ["unsafe-reference", 9],
      ["missing-entry", 10],
      ["duplicate-entry", 12],
    ]);
  });
});
