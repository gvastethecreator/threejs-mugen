import type { MugenCharacter } from "../model/MugenCharacter";
import type { MugenStagePackage } from "../model/MugenStagePackage";
import {
  createMugenSelectionManifest,
  resolvedMugenSelectionEntries,
  type MugenSelectionManifest,
  type MugenSelectionManifestEntry,
  type MugenSelectionManifestSourceFingerprint,
} from "./MugenSelectionManifest";
import { MugenCharacterLoader } from "./MugenCharacterLoader";
import { MugenStageLoader } from "./MugenStageLoader";
import type { VirtualFileSystem } from "./VirtualFileSystem";

export type MugenSelectionImportPalette = {
  characterPath: string;
  pal?: number;
  palettePath?: string;
};

export type MugenSelectionImportResult = {
  manifest?: MugenSelectionManifest;
  characters: MugenCharacter[];
  characterEntries: MugenSelectionManifestEntry[];
  stages: MugenStagePackage[];
  palettes?: MugenSelectionImportPalette[];
  usesSelectionManifest: boolean;
  diagnostics: string[];
};

export type LoadMugenSelectionImportInput = {
  sourceName: string;
  vfs: VirtualFileSystem;
  sourceFingerprint?: MugenSelectionManifestSourceFingerprint;
  characterLoader?: MugenCharacterLoader;
  stageLoader?: MugenStageLoader;
};

/**
 * Makes a select.def manifest the import authority only when it can produce
 * the bounded two-character, one-stage launch tuple. Other imports retain the
 * existing single-character/manual fallback.
 */
export async function loadMugenSelectionImport(
  input: LoadMugenSelectionImportInput,
): Promise<MugenSelectionImportResult> {
  const characterLoader = input.characterLoader ?? new MugenCharacterLoader();
  const stageLoader = input.stageLoader ?? new MugenStageLoader();
  const manifest = createMugenSelectionManifest({
    vfs: input.vfs,
    sourceFingerprint: input.sourceFingerprint,
  });

  if (manifest?.playable.ready) {
    const characterEntries = resolvedMugenSelectionEntries(manifest, "character");
    const stageEntries = resolvedMugenSelectionEntries(manifest, "stage");
    const characters = await Promise.all(
      characterEntries.map((entry) => characterLoader.loadAt(input.sourceName, input.vfs, entry.resolvedPath!)),
    );
    const stages = await stageLoader.loadSelected(
      input.sourceName,
      input.vfs,
      stageEntries.map((entry) => entry.resolvedPath!),
    );
    const diagnostics: string[] = [];
    const palettes = characterEntries.map((entry, index) => {
      const character = characters[index];
      if (entry.pal === undefined) {
        return { characterPath: entry.resolvedPath!, pal: undefined, palettePath: undefined };
      }
      const palette = character?.palettes?.find((item) => item.index === entry.pal) ?? character?.palettes?.[entry.pal - 1];
      if (!palette) {
        diagnostics.push("invalid palette " + String(entry.pal) + " for " + entry.resolvedPath);
        return { characterPath: entry.resolvedPath!, pal: entry.pal, palettePath: undefined };
      }
      return { characterPath: entry.resolvedPath!, pal: entry.pal, palettePath: palette.path };
    });
    return {
      manifest,
      characters,
      characterEntries,
      stages,
      palettes,
      usesSelectionManifest: true,
      diagnostics,
    };
  }

  const character = await characterLoader.load(input.sourceName, input.vfs);
  const stages = await stageLoader.loadAll(input.sourceName, input.vfs);
  return {
    ...(manifest ? { manifest } : {}),
    characters: [character],
    characterEntries: [],
    stages,
    palettes: [],
    usesSelectionManifest: false,
    diagnostics: manifest
      ? ["select.def manifest is not launch-ready; retained the existing single-character/manual fallback."]
      : [],
  };
}
