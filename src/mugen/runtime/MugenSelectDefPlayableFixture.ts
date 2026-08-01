import JSZip from "jszip";
import { createRepositoryStagePackageVfs } from "./RepositoryStagePackage";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";

export const MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST = Object.freeze({
  schema: "MugenSelectDefPlayableFixture/v1" as const,
  id: "mugen-select-def-playable",
  license: "CC0-1.0",
  provenance: "Repository-authored deterministic select.def roster and stage fixture",
  selectPath: "data/select.def",
  characterEntries: ["select-alpha/journey", "select-beta/journey"] as const,
  stageEntries: ["skyline-relay/skyline"] as const,
});

export function createMugenSelectDefPlayableFixtureVfs(): VirtualFileSystem {
  const vfs = createRepositoryStagePackageVfs();
  const characterVfs = createMugenLiteJourneyVfs();
  copyCharacterFixture(characterVfs, vfs, "chars/select-alpha", "Select Alpha");
  copyCharacterFixture(characterVfs, vfs, "chars/select-beta", "Select Beta");
  vfs.addFile(
    MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST.selectPath,
    text(
      [
        "[Characters]",
        ...MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST.characterEntries,
        "",
        "[Stages]",
        ...MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST.stageEntries,
        "",
      ].join("\n"),
    ),
  );
  return vfs;
}

export function createMugenSelectDefPlayableReimportFixtureVfs(): VirtualFileSystem {
  const vfs = createMugenSelectDefPlayableFixtureVfs();
  const stageDefPath = "stages/skyline-relay/skyline.def";
  const stageDefinition = vfs.readText(stageDefPath);
  if (!stageDefinition) {
    throw new Error("select.def reimport fixture is missing " + stageDefPath);
  }
  vfs.addFile(
    stageDefPath,
    text(
      stageDefinition
        .replace('name = "Skyline Relay"', 'name = "Skyline Relay Reimport"')
        .replace('displayname = "Skyline Relay"', 'displayname = "Skyline Relay Reimport"'),
    ),
  );
  vfs.addFile(
    MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST.selectPath,
    text([
      "[Characters]",
      "select-beta/journey",
      "select-alpha/journey",
      "",
      "[Stages]",
      ...MUGEN_SELECT_DEF_PLAYABLE_FIXTURE_MANIFEST.stageEntries,
      "",
    ].join("\n")),
  );
  return vfs;
}

export async function createMugenSelectDefPlayableFixtureZipBytes(
  vfs: VirtualFileSystem = createMugenSelectDefPlayableFixtureVfs(),
): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error("select.def fixture is missing " + path);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
    platform: "DOS",
  });
}

function copyCharacterFixture(
  source: VirtualFileSystem,
  target: VirtualFileSystem,
  destinationRoot: string,
  displayName: string,
): void {
  const sourceRoot = "chars/mugen-lite-journey/";
  for (const path of source.listFiles()) {
    if (!path.startsWith(sourceRoot)) {
      continue;
    }
    const bytes = source.readBytes(path);
    if (!bytes) {
      throw new Error("MUGEN-lite fixture file missing: " + path);
    }
    const destination = destinationRoot + "/" + path.slice(sourceRoot.length);
    target.addFile(
      destination,
      path.endsWith("/journey.def") ? text(withDisplayName(source.readText(path) ?? "", displayName)) : bytes,
    );
  }
}

function withDisplayName(definition: string, displayName: string): string {
  return definition
    .replace('name = "MUGEN Lite Journey"', 'name = "' + displayName + '"')
    .replace('displayname = "MUGEN Lite Journey"', 'displayname = "' + displayName + '"');
}

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
