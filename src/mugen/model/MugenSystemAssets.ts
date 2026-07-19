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

export type MugenFightScreenTiming = {
  sourcePath: string;
  overWaitTime?: number;
  overHitTime?: number;
  overWinTime?: number;
  overForceWinTime?: number;
  overTime?: number;
  startWaitTime?: number;
  controlTime?: number;
  fadeInTime?: number;
  fadeInColor?: [number, number, number];
  fadeInAnimationNo?: number;
  fadeInAnimationDuration?: number;
  fadeInSound?: [number, number];
  fadeOutTime?: number;
  fadeOutColor?: [number, number, number];
  fadeOutAnimationNo?: number;
  fadeOutAnimationDuration?: number;
  fadeOutSound?: [number, number];
  slowTime?: number;
  slowFadeTime?: number;
  slowSpeed?: number;
};

export type MugenSystemAssets = {
  fightDefPath?: string;
  fightScreenTiming?: MugenFightScreenTiming;
  gameConfig?: MugenGameConfig;
  commonFightFxPaths?: string[];
  hitSparkLibraries: Partial<Record<MugenSystemHitSparkLibrarySource, MugenSystemHitSparkLibrary>>;
  fightFxLibraries?: Record<string, MugenSystemHitSparkLibrary>;
  diagnostics: MugenDiagnostic[];
};
