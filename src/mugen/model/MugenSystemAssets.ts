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

export type MugenFightScreenAssets = {
  sourcePath: string;
  localCoord?: [number, number];
  sffPath?: string;
  sndPath?: string;
  animations: Map<number, MugenAnimationAction>;
  display?: MugenFightScreenDisplayDefinitions;
  fonts?: Map<number, MugenFightScreenFont>;
  spriteArchive?: SffArchive;
  soundArchive?: SndArchive;
  diagnostics: MugenDiagnostic[];
};

export type MugenFightScreenFont = {
  index: number;
  sourcePath: string;
  reference?: string;
  height?: number;
  format: "bitmap" | "truetype" | "unknown";
  bankType: string;
  size: [number, number];
  spacing: [number, number];
  offset: [number, number];
  filePath?: string;
  spriteArchive?: SffArchive;
  diagnostics: MugenDiagnostic[];
};

export type MugenFightScreenLayoutAsset = {
  animationNo?: number;
  sprite?: [number, number];
  offset?: [number, number];
  scale?: [number, number];
  facing?: 1 | -1;
  vfacing?: 1 | -1;
  blend?: string;
};

export type MugenFightScreenDisplayAsset = {
  animationNo?: number;
  sound?: [number, number];
  text?: string;
  font?: [number, number, number];
  fontColor?: [number, number, number, number];
  background?: MugenFightScreenLayoutAsset[];
  top?: MugenFightScreenLayoutAsset;
  displayTime?: number;
  offset?: [number, number];
  scale?: [number, number];
  facing?: 1 | -1;
  vfacing?: 1 | -1;
};

export type MugenFightScreenDisplayDefinitions = {
  round: Map<number, MugenFightScreenDisplayAsset>;
  roundDefault?: MugenFightScreenDisplayAsset;
  roundSingle?: MugenFightScreenDisplayAsset;
  roundFinal?: MugenFightScreenDisplayAsset;
  fight?: MugenFightScreenDisplayAsset;
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
  roundTime?: number;
  roundSoundTime?: number;
  roundSound?: [number, number];
  callFightTime?: number;
  fightTime?: number;
  fightSoundTime?: number;
  fightSound?: [number, number];
  shutterTime?: number;
  shutterColor?: [number, number, number];
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
  fightScreenAssets?: MugenFightScreenAssets;
  gameConfig?: MugenGameConfig;
  commonFightFxPaths?: string[];
  hitSparkLibraries: Partial<Record<MugenSystemHitSparkLibrarySource, MugenSystemHitSparkLibrary>>;
  fightFxLibraries?: Record<string, MugenSystemHitSparkLibrary>;
  diagnostics: MugenDiagnostic[];
};
