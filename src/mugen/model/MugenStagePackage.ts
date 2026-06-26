import type { MugenAnimationAction, MugenDiagnostic } from "./MugenAnimation";
import type { MugenStageBgCtrlDef } from "./MugenStage";
import type { SffArchive } from "./MugenSprite";
import type { MugenStageDefinition } from "./MugenStage";

export type MugenStageDef = {
  info: {
    name?: string;
    displayName?: string;
    versionDate?: string;
    mugenVersion?: string;
    author?: string;
  };
  files: {
    sprite?: string;
    music?: string;
  };
  rawSections: Record<string, Record<string, string>>;
  rawLines: string[];
  diagnostics: MugenDiagnostic[];
  animations: Map<number, MugenAnimationAction>;
  bgControllers: MugenStageBgCtrlDef[];
};

export type MugenStagePackage = {
  sourceName: string;
  defPath: string;
  definition: MugenStageDef;
  stage: MugenStageDefinition;
  spriteArchive?: SffArchive;
  files: {
    def: string;
    sprite?: string;
    music?: string;
    missing: string[];
  };
  diagnostics: MugenDiagnostic[];
};
