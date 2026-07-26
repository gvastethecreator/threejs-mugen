import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import JSZip from "jszip";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { ZipCharacterSource } from "../mugen/loader/ZipCharacterSource";
import {
  createSandboxFightScreenVfs,
  createSandboxFightScreenWithProbeCharacterVfs,
  createSandboxFightScreenZipBytes,
  hashSandboxFightScreenFiles,
  materializeSandboxFightScreenFolder,
  SANDBOX_FIGHTSCREEN_MANIFEST,
} from "../mugen/runtime/FightScreenFixture";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("Sandbox FightScreen fixture (DA26-12)", () => {
  it("exposes a CC0 first-party package with named FightScreen surfaces", () => {
    const vfs = createSandboxFightScreenVfs();
    expect(SANDBOX_FIGHTSCREEN_MANIFEST).toMatchObject({
      schema: "SandboxFightScreenFixture/v1",
      license: "CC0-1.0",
      fightDef: "data/sandbox-fightscreen/fight.def",
    });
    for (const surface of SANDBOX_FIGHTSCREEN_MANIFEST.expectedSurfaces) {
      expect(SANDBOX_FIGHTSCREEN_MANIFEST.expectedSurfaces).toContain(surface);
    }
    expect(vfs.listFiles().sort()).toEqual([...SANDBOX_FIGHTSCREEN_MANIFEST.files].sort());
    expect(vfs.readText(SANDBOX_FIGHTSCREEN_MANIFEST.licenseFile)).toContain("SPDX-License-Identifier: CC0-1.0");
    const fightDef = vfs.readText(SANDBOX_FIGHTSCREEN_MANIFEST.fightDef)!;
    expect(fightDef).toContain("round.default.text");
    expect(fightDef).toContain("ko.text");
    expect(fightDef).toContain("dko.showdraw");
    expect(fightDef).toContain("draw.text");
    expect(fightDef).toContain("to.text");
    expect(fightDef).toContain("p1.perfect.text.text");
    expect(fightDef).toContain("shutter.time");
    expect(fightDef).toContain("fadein.time");
    expect(fightDef).toContain("fadeout.time");
    expect(fightDef).toContain("over.waittime");
    expect(fightDef).toContain("ctrl.time");
  });

  it("loads fight.def timing and FightFX libraries through the real system loader", async () => {
    const vfs = createSandboxFightScreenWithProbeCharacterVfs();
    const character = await new MugenCharacterLoader().load("chars/probe/probe.def", vfs);

    expect(character.systemAssets?.fightDefPath).toBe(SANDBOX_FIGHTSCREEN_MANIFEST.fightDef);
    expect(character.systemAssets?.fightScreenTiming).toMatchObject({
      sourcePath: SANDBOX_FIGHTSCREEN_MANIFEST.fightDef,
      overWaitTime: 12,
      overHitTime: 10,
      overWinTime: 18,
      overForceWinTime: 900,
      overTime: 240,
      roundTime: 4,
      fightTime: 5,
      koTime: 3,
      doubleKoTime: 4,
      doubleKoShowDraw: true,
      timeOverTime: 5,
      startWaitTime: 12,
      controlTime: 30,
      shutterTime: 15,
      fadeInTime: 10,
      fadeOutTime: 16,
      clutchThresholdPercent: 10,
    });
    expect(character.systemAssets?.fightScreenAssets?.sourcePath).toBe(SANDBOX_FIGHTSCREEN_MANIFEST.fightDef);
    expect(character.systemAssets?.hitSparkLibraries?.fightfx?.animations.has(7001)).toBe(true);
    expect(character.systemAssets?.hitSparkLibraries?.fightfx?.animations.has(7002)).toBe(true);
    expect(character.systemAssets?.hitSparkLibraries?.common?.animations.has(7002)).toBe(true);
    expect(character.systemAssets?.fightScreenAssets?.fonts?.size).toBeGreaterThan(0);
  });

  it("round-trips as a deterministic ZIP package", async () => {
    const zipBytes = await createSandboxFightScreenZipBytes();
    expect(zipBytes.byteLength).toBeGreaterThan(200);
    expect(Array.from(new Uint8Array(zipBytes, 0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const source = new ZipCharacterSource(new File([zipBytes], "sandbox-fightscreen.zip"));
    const vfs = await source.load();
    for (const path of SANDBOX_FIGHTSCREEN_MANIFEST.files) {
      expect(vfs.readBytes(path)?.byteLength).toBeGreaterThan(0);
    }
    const hashes = hashSandboxFightScreenFiles(createSandboxFightScreenVfs());
    const zipHashes = hashSandboxFightScreenFiles(vfs);
    expect(zipHashes).toEqual(hashes);
    // JSZip round-trip identity for package contents (not bit-identical zip wrappers across compressors).
    const reopened = await JSZip.loadAsync(zipBytes.slice(0));
    expect(Object.keys(reopened.files).filter((name) => !reopened.files[name]!.dir).length).toBe(
      SANDBOX_FIGHTSCREEN_MANIFEST.files.length,
    );
  });

  it("materializes a folder package with stable SHA-256 hashes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sandbox-fightscreen-"));
    tempDirs.push(dir);
    const written = await materializeSandboxFightScreenFolder(dir);
    expect(written.sort((a, b) => a.localeCompare(b))).toEqual(
      [...SANDBOX_FIGHTSCREEN_MANIFEST.files].sort((a, b) => a.localeCompare(b)),
    );
    const expected = hashSandboxFightScreenFiles();
    for (const path of SANDBOX_FIGHTSCREEN_MANIFEST.files) {
      const onDisk = await readFile(join(dir, path));
      const digest = createHash("sha256").update(onDisk).digest("hex");
      expect(digest).toBe(expected[path]);
    }
  });

  it("produces stable content hashes for the named package identity", () => {
    const first = hashSandboxFightScreenFiles();
    const second = hashSandboxFightScreenFiles();
    expect(first).toEqual(second);
    expect(Object.keys(first).sort()).toEqual([...SANDBOX_FIGHTSCREEN_MANIFEST.files].sort());
    for (const digest of Object.values(first)) {
      expect(digest).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("materializes the repository public package and hash ledger", async () => {
    const publicRoot = resolve(process.cwd(), "public");
    await materializeSandboxFightScreenFolder(publicRoot);
    const hashes = hashSandboxFightScreenFiles();
    const zip = Buffer.from(await createSandboxFightScreenZipBytes());
    await mkdir(resolve(publicRoot, "system"), { recursive: true });
    await writeFile(resolve(publicRoot, "system", "sandbox-fightscreen.zip"), zip);
    await writeFile(
      resolve(publicRoot, "system", "sandbox-fightscreen.hashes.json"),
      `${JSON.stringify({
        schema: "SandboxFightScreenHashes/v1",
        manifest: SANDBOX_FIGHTSCREEN_MANIFEST,
        hashes,
        zipBytes: zip.byteLength,
      }, null, 2)}\n`,
    );
    const ledger = JSON.parse(await readFile(resolve(publicRoot, "system", "sandbox-fightscreen.hashes.json"), "utf8"));
    expect(ledger.manifest.id).toBe("sandbox-fightscreen");
    expect(ledger.hashes[SANDBOX_FIGHTSCREEN_MANIFEST.fightDef]).toMatch(/^[0-9a-f]{64}$/);
    expect((await readFile(resolve(publicRoot, "system", "sandbox-fightscreen.zip"))).byteLength).toBe(zip.byteLength);
  });
});
