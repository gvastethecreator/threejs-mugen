import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { runDualCharacterLegalJourney } from "../app/DualCharacterLegalJourney";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

function loadPackageFromDir(packageRoot: string): VirtualFileSystem {
  const vfs = new VirtualFileSystem();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = relative(packageRoot, full).split("\\").join("/");
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      if (/\.(def|cmd|cns|air|act|txt|md|json)$/i.test(entry)) {
        vfs.addFile(rel, new TextEncoder().encode(readFileSync(full, "utf8")));
      } else {
        vfs.addFile(rel, new Uint8Array(readFileSync(full)));
      }
    }
  };
  walk(packageRoot);
  return vfs;
}

async function loadNamed(id: string, name: string, entry: string, dir: string) {
  const packageRoot = join(process.cwd(), dir);
  const vfs = loadPackageFromDir(packageRoot);
  const character = await new MugenCharacterLoader().load(entry, vfs);
  const licensePath = join(packageRoot, "LICENSE.txt");
  let licenseVerified = false;
  try {
    const license = readFileSync(licensePath, "utf8");
    licenseVerified = /CC0-1\.0/i.test(license);
  } catch {
    licenseVerified = false;
  }
  return {
    legal: {
      id,
      name,
      licenseSpdx: "CC0-1.0",
      licenseVerified,
      entryDef: entry,
      packageDigest: `${id}-digest`,
      routes: ["import", "walk", "jump", "hit", "guard", "ko"] as const,
    },
    character,
  };
}

describe("DualCharacterLegalJourney", () => {
  it("loads Nova and Mira packages through independent legal routes", async () => {
    const first = await loadNamed(
      "nova-boxer",
      "Nova Boxer",
      "mugen/nova.def",
      "public/characters/nova-boxer",
    );
    const second = await loadNamed(
      "mira-volt",
      "Mira Volt",
      "mugen/mira.def",
      "public/characters/mira-volt",
    );
    const report = runDualCharacterLegalJourney(first, second);
    expect(report.independent).toBe(true);
    expect(report.first.passed).toBe(true);
    expect(report.second.passed).toBe(true);
    expect(report.canClaimTwoNamed).toBe(true);
    expect(report.diagnostics).toEqual([]);
    expect(report.first.routePassCount).toBe(6);
    expect(report.second.routePassCount).toBe(6);
  });
});
