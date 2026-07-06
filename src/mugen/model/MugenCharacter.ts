import type { CompatibilityReport } from "../compatibility/CompatibilityReport";
import type { RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction, MugenDiagnostic } from "./MugenAnimation";
import type { MugenCommand, MugenCommandFile } from "./MugenCommand";
import type { MugenPalette } from "./MugenPalette";
import type { SndArchive } from "./MugenSound";
import type { SffArchive } from "./MugenSprite";
import type { MugenStateController, MugenStateDef } from "./MugenState";
import type { MugenSystemAssets } from "./MugenSystemAssets";

export type MugenCharacterDef = {
  info: {
    name?: string;
    displayName?: string;
    versionDate?: string;
    mugenVersion?: string;
    author?: string;
    localCoord?: [number, number];
  };
  files: {
    cmd?: string;
    cns?: string;
    states?: string[];
    commonStates?: string[];
    sprite?: string;
    anim?: string;
    sound?: string;
    palettes?: string[];
  };
  rawSections: Record<string, Record<string, string>>;
  rawLines: string[];
  diagnostics: MugenDiagnostic[];
};

export type ResolvedCharacterFiles = {
  def?: string;
  cmd?: string;
  cns?: string;
  states: string[];
  commonStates: string[];
  sprite?: string;
  anim?: string;
  sound?: string;
  palettes: string[];
  missing: string[];
};

export type MugenCharacter = {
  sourceName: string;
  defPath: string;
  definition: MugenCharacterDef;
  files: ResolvedCharacterFiles;
  animations: Map<number, MugenAnimationAction>;
  commands: MugenCommand[];
  commandDefaults?: MugenCommandFile["defaults"];
  commandRemap?: MugenCommandFile["remap"];
  states: MugenStateDef[];
  stateEntryControllers: MugenStateController[];
  constants: Record<string, number>;
  runtimeProgram?: RuntimeProgramIr;
  spriteArchive?: SffArchive;
  soundArchive?: SndArchive;
  palettes?: MugenPalette[];
  systemAssets?: MugenSystemAssets;
  diagnostics: MugenDiagnostic[];
  compatibility: CompatibilityReport;
};
