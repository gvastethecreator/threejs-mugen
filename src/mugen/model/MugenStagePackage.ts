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
  /** Stage [Music] bgmloop. Omitted follows Ikemen default (loop). */
  musicLoop?: boolean;
  /** Stage [Music] bgmvolume 0-100. Omitted is 100. */
  musicVolume?: number;
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
  /** Local package BGM bytes. Playback stays in the audio system. */
  music?: {
    path: string;
    bytes: ArrayBuffer;
    loop: boolean;
    volume: number;
  };
  diagnostics: MugenDiagnostic[];
};
