import type { MugenDiagnostic } from "./MugenAnimation";

export type MugenGameSpaceConfig = {
  width: number;
  height: number;
  sourcePath?: string;
};

export type MugenGameConfig = {
  gameSpace?: MugenGameSpaceConfig;
  rawSections: Record<string, Record<string, string>>;
  rawLines: string[];
  diagnostics: MugenDiagnostic[];
};
