import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createStageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";
import { MugenStageLoader } from "../mugen/loader/MugenStageLoader";
import {
  createRepositoryStageFixturePackageDigest,
  createRepositoryStageFixtureVfs,
  REPOSITORY_STAGE_FIXTURE_MANIFEST,
} from "../mugen/runtime/RepositoryStageFixture";

describe("repository-authored Skyline Relay stage fixture", () => {
  it("has machine-readable CC0 provenance, stable inputs, and no absolute paths", async () => {
    const first = createRepositoryStageFixtureVfs();
    const second = createRepositoryStageFixtureVfs();
    const files = first.listFiles();

    expect(files).toEqual([
      "data/mugen.cfg",
      "stages/skyline-relay/LICENSE.txt",
      "stages/skyline-relay/skyline.def",
      "stages/skyline-relay/skyline.sff",
    ]);
    expect(files.every((path) => !/^(?:[A-Za-z]:|[\\/])/.test(path) && !path.split("/").includes(".."))).toBe(true);
    expect(first.readText(REPOSITORY_STAGE_FIXTURE_MANIFEST.licenseFile)).toMatchObject(expect.stringContaining("SPDX-License-Identifier: CC0-1.0"));
    expect(REPOSITORY_STAGE_FIXTURE_MANIFEST).toMatchObject({
      schema: "RepositoryStageFixture/v1",
      id: "repository-skyline-relay",
      license: "CC0-1.0",
      provenance: "Repository-authored deterministic stage fixture",
    });
    expect(createPackageDigest(first)).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(createPackageDigest(first)).toBe(createPackageDigest(second));
    expect(await createRepositoryStageFixturePackageDigest(first)).toBe(createPackageDigest(first));
  });

  it("loads materially different stage assumptions through the production loader", async () => {
    const vfs = createRepositoryStageFixtureVfs();
    const [stagePackage] = await new MugenStageLoader().loadAll(REPOSITORY_STAGE_FIXTURE_MANIFEST.id, vfs);
    if (!stagePackage) throw new Error("repository Skyline Relay fixture did not produce a stage package");

    const report = createStageCompatibilityReport(stagePackage);
    expect(stagePackage.stage.displayName).toBe("Skyline Relay");
    expect(stagePackage.stage.localCoord).toEqual({ width: 640, height: 480 });
    expect(stagePackage.stage.gameSpace).toEqual({ width: 1280, height: 720, sourcePath: "data/mugen.cfg" });
    expect(stagePackage.stage.playerStart.p1).toMatchObject({ x: -120, z: -18, facing: 1 });
    expect(stagePackage.stage.playerStart.p2).toMatchObject({ x: 120, z: 22, facing: -1 });
    expect(stagePackage.stage.depthBounds).toEqual({ top: -60, bottom: 80 });
    expect(stagePackage.stage.resetBackgroundBetweenRounds).toBe(false);
    expect(stagePackage.files.music).toBeUndefined();
    expect(stagePackage.spriteArchive?.sprites).toHaveLength(4);
    expect(report).toMatchObject({
      loaded: true,
      files: { def: true, sff: true, music: false },
      backgrounds: {
        total: 3,
        withSpriteRefs: 4,
        tiled: 1,
        animated: 1,
        renderedAnimated: 1,
        controllers: { groups: 1, total: 1, bounded: 1, unsupported: 0, targetedLayers: 1 },
      },
      sff: { decodedSprites: 4, totalSprites: 4 },
    });
    expect(report.errors).toEqual([]);
  });

  it("loads local PCM stage music bytes and loop/volume from the production loader", async () => {
    const vfs = createRepositoryStageFixtureVfs();
    vfs.addFile("stages/skyline-relay/skyline.wav", createTinyPcmWav());
    vfs.addFile(
      "stages/skyline-relay/skyline.def",
      new TextEncoder().encode(`${vfs.readText("stages/skyline-relay/skyline.def") ?? ""}

[Music]
bgmusic = skyline.wav
bgmloop = 1
bgmvolume = 80
`),
    );
    const [stagePackage] = await new MugenStageLoader().loadAll(REPOSITORY_STAGE_FIXTURE_MANIFEST.id, vfs);
    if (!stagePackage) throw new Error("repository Skyline Relay fixture did not produce a stage package");

    expect(stagePackage.files.music).toBe("stages/skyline-relay/skyline.wav");
    expect(stagePackage.definition.musicLoop).toBe(true);
    expect(stagePackage.definition.musicVolume).toBe(80);
    expect(stagePackage.music).toMatchObject({
      path: "stages/skyline-relay/skyline.wav",
      loop: true,
      volume: 80,
    });
    expect(stagePackage.music?.bytes.byteLength).toBeGreaterThan(12);
    const header = new Uint8Array(stagePackage.music!.bytes, 0, 12);
    expect(String.fromCharCode(...header.subarray(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...header.subarray(8, 12))).toBe("WAVE");
  });
});

function createTinyPcmWav(): Uint8Array {
  const bytes = new Uint8Array(45);
  const view = new DataView(bytes.buffer);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  view.setUint32(4, 37, true);
  bytes.set([0x57, 0x41, 0x56, 0x45], 8);
  bytes.set([0x66, 0x6d, 0x74, 0x20], 12);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  bytes.set([0x64, 0x61, 0x74, 0x61], 36);
  view.setUint32(40, 1, true);
  bytes[44] = 128;
  return bytes;
}

function createPackageDigest(vfs: ReturnType<typeof createRepositoryStageFixtureVfs>): string {
  const digest = createHash("sha256");
  for (const path of vfs.listFiles()) {
    digest.update(path);
    digest.update(vfs.readBytes(path)!);
  }
  return `sha256:${digest.digest("hex")}`;
}
