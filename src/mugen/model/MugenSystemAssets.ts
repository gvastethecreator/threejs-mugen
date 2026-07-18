import type { MugenAnimationAction, MugenDiagnostic } from "./MugenAnimation";
import type { MugenGameConfig } from "./MugenConfig";
import type { SndArchive } from "./MugenSound";
import type { SffArchive } from "./MugenSprite";

export type MugenSystemHitSparkLibrarySource = "common" | "fightfx";

export type MugenSystemHitSparkLibrary = {
  source: MugenSystemHitSparkLibrarySource;
  prefix?: string;
  defPath?: string;
  airPath?: string;
  sffPath?: string;
  sndPath?: string;
  animations: Map<number, MugenAnimationAction>;
  spriteArchive?: SffArchive;
  soundArchive?: SndArchive;
  diagnostics: MugenDiagnostic[];
};

export type MugenSystemAssets = {
  fightDefPath?: string;
  gameConfig?: MugenGameConfig;
  commonFightFxPaths?: string[];
  hitSparkLibraries: Partial<Record<MugenSystemHitSparkLibrarySource, MugenSystemHitSparkLibrary>>;
  fightFxLibraries?: Record<string, MugenSystemHitSparkLibrary>;
  diagnostics: MugenDiagnostic[];
};
