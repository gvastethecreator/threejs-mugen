import JSZip from "jszip";
import { MUGEN_LITE_JOURNEY_MANIFEST, createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";
import { REPOSITORY_STAGE_FIXTURE_MANIFEST, createRepositoryStageFixtureVfs } from "./RepositoryStageFixture";
import { createVirtualFileSystemPackageDigest } from "../loader/VirtualFileSystemDigest";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";

export const REPOSITORY_STAGE_PACKAGE_MANIFEST = Object.freeze({
  schema: "RepositoryStagePackage/v1" as const,
  id: REPOSITORY_STAGE_FIXTURE_MANIFEST.id,
  displayName: "Skyline Relay Package",
  license: REPOSITORY_STAGE_FIXTURE_MANIFEST.license,
  licenseFile: REPOSITORY_STAGE_FIXTURE_MANIFEST.licenseFile,
  licenseFiles: [
    MUGEN_LITE_JOURNEY_MANIFEST.licenseFile,
    REPOSITORY_STAGE_FIXTURE_MANIFEST.licenseFile,
  ] as const,
  provenance: "Repository-authored deterministic character and stage package",
  characterEntry: MUGEN_LITE_JOURNEY_MANIFEST.entry,
  stageEntry: REPOSITORY_STAGE_FIXTURE_MANIFEST.entry,
  expectedRoutes: [
    ...REPOSITORY_STAGE_FIXTURE_MANIFEST.expectedRoutes,
    "package-folder-zip-equivalence",
    "application-zip-import",
    "application-folder-import",
  ] as const,
});

export function createRepositoryStagePackageVfs(): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const stageVfs = createRepositoryStageFixtureVfs();
  for (const path of stageVfs.listFiles()) {
    const bytes = stageVfs.readBytes(path);
    if (!bytes) throw new Error(`repository Skyline Relay package is missing ${path}`);
    vfs.addFile(path, bytes);
  }
  return vfs;
}

export async function createRepositoryStagePackageDigest(
  vfs: VirtualFileSystem = createRepositoryStagePackageVfs(),
): Promise<string> {
  return createVirtualFileSystemPackageDigest(vfs, "repository Skyline Relay package");
}

export async function createRepositoryStagePackageZipBytes(
  vfs: VirtualFileSystem = createRepositoryStagePackageVfs(),
): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) throw new Error(`repository Skyline Relay package is missing ${path}`);
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
    platform: "DOS",
  });
}
