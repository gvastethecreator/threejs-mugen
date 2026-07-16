import { describe, expect, it } from "vitest";
import {
  createPackageAnalysisV1,
  createPackageAnalysis,
  parsePackageAnalysisV1,
  parsePackageAnalysis,
  type PackageAnalysisV1Result,
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

  it("materializes v1 source identity and nested targetable analysis", () => {
    const vfs = fixtureVfs();
    const report = createPackageAnalysisV1({
      vfs,
      sourceName: "fixture-package",
      observedAt: "2026-07-16T00:00:00.000Z",
      sourceFingerprint: fingerprintFor(vfs),
    });

    expect(report).toMatchObject({
      schemaVersion: "mugen-web-sandbox/package-analysis/v1",
      observedAt: "2026-07-16T00:00:00.000Z",
      analyzer: { id: "mugen-web-sandbox/package-analysis", version: "1.0.0" },
      ruleset: { id: "mugen-web-sandbox/package-analysis-rules", version: "1.0.0" },
      upstream: { project: "ikemen-engine/Ikemen-GO", revision: "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703" },
      source: {
        name: "fixture-package",
        package: { algorithm: "sha-256", digest: "e".repeat(64) },
        fileCount: 12,
      },
      analysis: {
        schemaVersion: "mugen-web-sandbox/package-analysis/v0",
        sourceName: "fixture-package",
      },
    });
    expect(report.source.files).toHaveLength(12);
    expect(report.analysis.findings.find((finding) => finding.feature === "ZSS script file")).toMatchObject({
      location: { path: "chars/kfm/kfm.zss" },
    });
    expect(report.semanticDigest).toMatch(/^[0-9a-f]{8}$/);
    expect(parsePackageAnalysisV1(JSON.parse(JSON.stringify(report))).errors).toEqual([]);
  });

  it("keeps semantic identity stable when only observation time changes", () => {
    const vfs = fixtureVfs();
    const fingerprint = fingerprintFor(vfs);
    const first = createPackageAnalysisV1({
      vfs,
      sourceName: "fixture-package",
      observedAt: "2026-07-16T00:00:00.000Z",
      sourceFingerprint: fingerprint,
    });
    const later = createPackageAnalysisV1({
      vfs,
      sourceName: "fixture-package",
      observedAt: "2026-07-16T01:00:00.000Z",
      sourceFingerprint: fingerprint,
    });

    expect(later.semanticDigest).toBe(first.semanticDigest);
    expect(later.checksum).not.toBe(first.checksum);
  });

  it("rejects an invalid nested v0 report even when the v1 envelope is present", () => {
    const report = createPackageAnalysisV1({
      vfs: fixtureVfs(),
      sourceName: "fixture-package",
      observedAt: "2026-07-16T00:00:00.000Z",
      sourceFingerprint: fingerprintFor(fixtureVfs()),
    });
    const tampered = JSON.parse(JSON.stringify(report)) as PackageAnalysisV1Result;
    tampered.analysis = { ...tampered.analysis, checksum: "00000000" };

    expect(parsePackageAnalysisV1(tampered).errors).toContain("nested package analysis: package analysis checksum mismatch");
  });

  it("rejects analyzer, ruleset, and upstream version drift", () => {
    const report = createPackageAnalysisV1({
      vfs: fixtureVfs(),
      sourceName: "fixture-package",
      observedAt: "2026-07-16T00:00:00.000Z",
      sourceFingerprint: fingerprintFor(fixtureVfs()),
    });
    const tampered = JSON.parse(JSON.stringify(report)) as PackageAnalysisV1Result;
    tampered.analyzer = { ...tampered.analyzer, version: "2.0.0" };
    tampered.ruleset = { ...tampered.ruleset, version: "2.0.0" };
    tampered.upstream = { ...tampered.upstream, revision: "0000000000000000000000000000000000000000" };

    expect(parsePackageAnalysisV1(tampered).errors).toEqual(expect.arrayContaining([
      "package analysis v1 analyzer identity is unsupported",
      "package analysis v1 ruleset identity is unsupported",
      "package analysis v1 upstream identity is unsupported",
    ]));
  });

  it("rejects source identity drift against nested analysis locations", () => {
    const vfs = fixtureVfs();
    const report = createPackageAnalysisV1({
      vfs,
      sourceName: "fixture-package",
      observedAt: "2026-07-16T00:00:00.000Z",
      sourceFingerprint: fingerprintFor(vfs),
    });
    const tampered = JSON.parse(JSON.stringify(report)) as PackageAnalysisV1Result;
    tampered.source.files[0] = { ...tampered.source.files[0]!, byteLength: tampered.source.files[0]!.byteLength + 1 };

    expect(parsePackageAnalysisV1(tampered).errors).toEqual(expect.arrayContaining([
      "package analysis v1 source file does not match analysis:chars/kfm/kfm.air",
      "package analysis v1 byteLength does not match source files",
    ]));
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

function fingerprintFor(vfs: VirtualFileSystem) {
  const files = vfs.listFiles().map((path, index) => ({
    path,
    digest: (index + 1).toString(16).padStart(64, "0"),
    byteLength: vfs.get(path)?.bytes.byteLength ?? 0,
  }));
  return {
    algorithm: "sha-256" as const,
    digest: "e".repeat(64),
    fileCount: files.length,
    byteLength: files.reduce((total, file) => total + file.byteLength, 0),
    files,
  };
}
