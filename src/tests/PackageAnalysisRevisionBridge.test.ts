import { describe, expect, it } from "vitest";
import { createPackageAnalysis } from "../mugen/compatibility/PackageAnalysis";
import {
  diffAnalysisReports,
  revisionFromPackageAnalysis,
} from "../mugen/compatibility/PackageAnalysisRevisionBridge";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

function addText(vfs: VirtualFileSystem, path: string, text: string): void {
  vfs.addFile(path, new TextEncoder().encode(text));
}

function vfsWithDef(name: string, featureLine = ""): VirtualFileSystem {
  const vfs = new VirtualFileSystem();
  addText(
    vfs,
    `${name}.def`,
    `[Info]\nname = ${name}\n[Files]\ncmd = ${name}.cmd\ncns = ${name}.cns\nanim = ${name}.air\nsprite = ${name}.sff\n`,
  );
  addText(vfs, `${name}.cmd`, `[Command]\nname = "x"\ncommand = x\n`);
  addText(vfs, `${name}.cns`, `[Statedef 0]\ntype = S\nanim = 0\nctrl = 1\n${featureLine}`);
  addText(vfs, `${name}.air`, `[Begin Action 0]\n0,0,0,0,5\n`);
  vfs.addFile(`${name}.sff`, new Uint8Array([0]));
  return vfs;
}

describe("PackageAnalysisRevisionBridge", () => {
  it("lifts analysis results into revisions and diffs findings", () => {
    const left = createPackageAnalysis({
      vfs: vfsWithDef("alpha"),
      sourceName: "alpha",
      generatedAt: "2026-07-26T22:00:00.000Z",
    });
    const right = createPackageAnalysis({
      vfs: vfsWithDef("alpha", "; ikemen tag\n"),
      sourceName: "alpha",
      generatedAt: "2026-07-26T22:05:00.000Z",
    });
    const leftRev = revisionFromPackageAnalysis(left, {
      analyzerVersion: "1.0.0",
      rulesetVersion: "1.0.0",
      upstreamRevision: "05b7d98a",
    });
    expect(leftRev.analysisChecksum).toBe(left.checksum);
    const bridge = diffAnalysisReports(left, right);
    expect(bridge.schema).toBe("PackageAnalysisRevisionBridge/v1");
    expect(bridge.diff.checksum).toMatch(/^[0-9a-f]{8}$/);
    expect(bridge.left.sourceName).toBe("alpha");
    expect(bridge.right.sourceName).toBe("alpha");
  });
});
