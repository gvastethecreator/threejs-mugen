import type { MugenAnimationAction, MugenDiagnostic } from "./MugenAnimation";
import type { SffArchive } from "./MugenSprite";

export type MugenSystemHitSparkLibrarySource = "common" | "fightfx";

export type MugenSystemHitSparkLibrary = {
  source: MugenSystemHitSparkLibrarySource;
  prefix?: string;
  defPath?: string;
  airPath?: string;
  sffPath?: string;
  animations: Map<number, MugenAnimationAction>;
  spriteArchive?: SffArchive;
  diagnostics: MugenDiagnostic[];
};

export type MugenSystemAssets = {
  fightDefPath?: string;
  hitSparkLibraries: Partial<Record<MugenSystemHitSparkLibrarySource, MugenSystemHitSparkLibrary>>;
  fightFxLibraries?: Record<string, MugenSystemHitSparkLibrary>;
  diagnostics: MugenDiagnostic[];
};
