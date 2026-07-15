import { describe, expect, it } from "vitest";
import {
  createPackageAnalysis,
  parsePackageAnalysis,
} from "../mugen/compatibility/PackageAnalysis";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

describe("PackageAnalysis/v0", () => {
  it("classifies bounded package roles and keeps references source-located", () => {
    const vfs = fixtureVfs();
    const report = createPackageAnalysis({
      vfs,
      sourceName: "fixture-package",
      generatedAt: "2026-07-14T00:00:00.000Z",
    });

    expect(report).toMatchObject({
      schemaVersion: "mugen-web-sandbox/package-analysis/v0",
      sourceName: "fixture-package",
      status: "partial",
      profiles: {
        mugen: { profile: "mugen-1.1", versions: ["1.1"] },
        ikemen: { profile: "ikemen-go-scan", detected: true, claim: "scanner-only" },
      },
      summary: {
        fileCount: 12,
        recognizedFileCount: 12,
        unknownFileCount: 0,
        entrypointCount: 4,
      },
    });
    expect(report.files.find((file) => file.path === "chars/kfm/kfm.def")).toMatchObject({
      roles: ["character"],
    });
    expect(report.files.find((file) => file.path === "data/system.def")).toMatchObject({
      roles: ["screenpack", "system"],
    });
    expect(report.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        status: "recognized",
        feature: "Referenced cns file",
        location: { path: "chars/kfm/kfm.def", line: 7 },
        dependency: "chars/kfm/kfm.cns",
      }),
      expect.objectContaining({
        status: "unknown",
        feature: "Referenced bgmusic file",
        location: { path: "stages/dojo.def", line: 8 },
        dependency: "audio/stage.ogg",
      }),
      expect.objectContaining({
        status: "recognized",
        feature: "select.def characters entry",
        location: { path: "data/select.def", line: 2 },
      }),
      expect.objectContaining({
        status: "unknown",
        feature: "select.def characters entry",
        location: { path: "data/select.def", line: 3 },
        dependency: "missing-character",
      }),
      expect.objectContaining({
        status: "unsupported",
        feature: "ZSS script file",
        location: { path: "chars/kfm/kfm.zss" },
      }),
    ]));
    expect(report.claims.blocked).toContain("Package analysis does not prove runtime execution, rendering parity, or license compatibility.");
    expect(Object.isFrozen(report)).toBe(true);
    expect(parsePackageAnalysis(JSON.parse(JSON.stringify(report))).errors).toEqual([]);
  });

  it("is deterministic and rejects a tampered snapshot", () => {
    const first = createPackageAnalysis({
      vfs: fixtureVfs(),
      sourceName: "fixture-package",
      generatedAt: "2026-07-14T00:00:00.000Z",
    });
    const secondVfs = new VirtualFileSystem();
    for (const [path, value] of [...fixtureFiles()].reverse()) {
      secondVfs.addFile(path, textBytes(value));
    }
    const second = createPackageAnalysis({
      vfs: secondVfs,
      sourceName: "fixture-package",
      generatedAt: "2026-07-14T00:00:00.000Z",
    });

    expect(second.checksum).toBe(first.checksum);
    expect(parsePackageAnalysis({ ...first, checksum: "00000000" }).errors).toContain("package analysis checksum mismatch");
  });

  it("fails closed when no runtime entrypoint can be identified", () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile("notes/readme.txt", textBytes("not a MUGEN entrypoint"));

    const report = createPackageAnalysis({ vfs, generatedAt: "2026-07-14T00:00:00.000Z" });

    expect(report.status).toBe("unknown");
    expect(report.diagnostics).toContain("No recognized character, stage, or screenpack definition was found.");
    expect(report.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: "package", status: "unknown", feature: "MUGEN entrypoint coverage" }),
    ]));
  });

  it("uses the same VFS contract for stage-only and system-only packages", () => {
    const stageVfs = new VirtualFileSystem();
    stageVfs.addFile("stages/only.def", textBytes("[Info]\nname = Only Stage\n[BGDef]\nspr = only.sff\n"));
    stageVfs.addFile("stages/only.sff", textBytes("stage"));
    const stage = createPackageAnalysis({ vfs: stageVfs, generatedAt: "2026-07-14T00:00:00.000Z" });

    const systemVfs = new VirtualFileSystem();
    systemVfs.addFile("data/system.def", textBytes("[Info]\nname = Only System\n[Files]\nsff = system.sff\n"));
    systemVfs.addFile("data/system.sff", textBytes("system"));
    const system = createPackageAnalysis({ vfs: systemVfs, generatedAt: "2026-07-14T00:00:00.000Z" });

    expect(stage.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: "stage", status: "recognized", feature: "Referenced spr file", dependency: "stages/only.sff" }),
    ]));
    expect(system.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: "screenpack", status: "recognized", feature: "Referenced sff file", dependency: "data/system.sff" }),
    ]));
    expect(stage.profiles.ikemen.profile).toBe("ikemen-go-scan");
    expect(system.profiles.mugen.profile).toBe("unknown");
  });
});

function fixtureVfs(): VirtualFileSystem {
  const vfs = new VirtualFileSystem();
  for (const [path, value] of fixtureFiles()) {
    vfs.addFile(path, textBytes(value));
  }
  return vfs;
}

function fixtureFiles(): Array<[string, string]> {
  return [
    [
      "chars/kfm/kfm.def",
      `[Info]\nname = Kung Fu Man\nmugenversion = 1.1\n\n[Files]\ncmd = kfm.cmd\ncns = kfm.cns\nsprite = kfm.sff\nanim = kfm.air\nsound = kfm.snd\n`,
    ],
    ["chars/kfm/kfm.cmd", "[Command]\nname = \"holdfwd\"\n"],
    ["chars/kfm/kfm.cns", "[Statedef 0]\ntype = S\n"],
    ["chars/kfm/kfm.sff", "sprite bytes"],
    ["chars/kfm/kfm.air", "Begin Action 0\n0,0, 0,0, 1\n"],
    ["chars/kfm/kfm.snd", "sound bytes"],
    ["chars/kfm/kfm.zss", "[Statedef 1]\n"],
    ["stages/dojo.def", `[Info]\nname = Dojo\n\n[BGDef]\nspr = dojo.sff\n\n[Music]\nbgmusic = audio/stage.ogg\n`],
    ["stages/dojo.sff", "stage sprites"],
    ["data/system.def", "[Info]\nname = System\n\n[Files]\nsff = system.sff\n"],
    ["data/system.sff", "system sprites"],
    ["data/select.def", "[Characters]\nkfm\nmissing-character\n[Stages]\ndojo\n[System]\nscript = external/story.lua\n"],
  ];
}

function textBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
