import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { FolderCharacterSource } from "../mugen/loader/FolderCharacterSource";
import { ZipCharacterSource } from "../mugen/loader/ZipCharacterSource";
import { MugenStageLoader } from "../mugen/loader/MugenStageLoader";
import { createVirtualFileSystemPackageDigest } from "../mugen/loader/VirtualFileSystemDigest";
import {
  createRepositoryStagePackageDigest,
  createRepositoryStagePackageVfs,
  createRepositoryStagePackageZipBytes,
  REPOSITORY_STAGE_PACKAGE_MANIFEST,
} from "../mugen/runtime/RepositoryStagePackage";

describe("repository Skyline Relay package", () => {
  it("keeps folder and deterministic ZIP transports equivalent", async () => {
    const canonicalVfs = createRepositoryStagePackageVfs();
    const folderSource = new FolderCharacterSource(createBrowserFileList(canonicalVfs));
    const folderVfs = await folderSource.load();
    const zipBytes = await createRepositoryStagePackageZipBytes(canonicalVfs);
    const zipSource = new ZipCharacterSource(new File([zipBytes], "repository-skyline-relay.zip"));
    const zipVfs = await zipSource.load();

    expect(REPOSITORY_STAGE_PACKAGE_MANIFEST).toMatchObject({
      schema: "RepositoryStagePackage/v1",
      id: "repository-skyline-relay",
      license: "CC0-1.0",
      characterEntry: "chars/mugen-lite-journey/journey.def",
      stageEntry: "stages/skyline-relay/skyline.def",
    });
    expect(REPOSITORY_STAGE_PACKAGE_MANIFEST.licenseFiles).toEqual([
      "chars/mugen-lite-journey/LICENSE.txt",
      "stages/skyline-relay/LICENSE.txt",
    ]);
    expect(new Uint8Array(zipBytes).slice(0, 4)).toEqual(new Uint8Array([0x50, 0x4b, 0x03, 0x04]));
    expect(folderSource.name).toBe("repository-skyline-relay");
    expect(zipVfs.listFiles()).toEqual(folderVfs.listFiles());
    for (const path of folderVfs.listFiles()) {
      expect(zipVfs.readBytes(path), path).toEqual(folderVfs.readBytes(path));
    }
    expect(await createRepositoryStagePackageDigest(folderVfs)).toBe(await createVirtualFileSystemPackageDigest(zipVfs));
    expect(new Uint8Array(await createRepositoryStagePackageZipBytes(folderVfs))).toEqual(new Uint8Array(zipBytes));
  });

  it("loads the character and stage from the same package through production loaders", async () => {
    const vfs = createRepositoryStagePackageVfs();
    const character = await new MugenCharacterLoader().load(REPOSITORY_STAGE_PACKAGE_MANIFEST.id, vfs);
    const [stage] = await new MugenStageLoader().loadAll(REPOSITORY_STAGE_PACKAGE_MANIFEST.id, vfs);

    expect(character.compatibility).toMatchObject({
      loaded: true,
      character: "MUGEN Lite Journey",
      files: { def: true, sff: true, air: true, cmd: true, cns: true },
    });
    expect(stage?.stage).toMatchObject({
      id: "stage-skyline-relay",
      displayName: "Skyline Relay",
      localCoord: { width: 640, height: 480 },
      gameSpace: { width: 1280, height: 720 },
    });
    expect(stage?.spriteArchive?.sprites).toHaveLength(4);
  });
});

function createBrowserFileList(vfs: ReturnType<typeof createRepositoryStagePackageVfs>): FileList {
  const files = vfs.listFiles().map((path) => {
    const file = new File([vfs.readArrayBuffer(path)!], path.split("/").at(-1) ?? "source.bin");
    Object.defineProperty(file, "webkitRelativePath", { value: `repository-skyline-relay/${path}` });
    return file;
  });
  return {
    ...Object.fromEntries(files.map((file, index) => [index, file])),
    length: files.length,
    item: (index: number) => files[index] ?? null,
  } as unknown as FileList;
}
