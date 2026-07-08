import type { CollisionBox } from "./CollisionBox";

export type MugenAnimationAction = {
  id: number;
  frames: MugenAnimationFrame[];
  loopStart?: number;
  rawLines: string[];
};

export type MugenAnimationFrame = {
  spriteGroup: number;
  spriteIndex: number;
  offsetX: number;
  offsetY: number;
  duration: number;
  flip?: string;
  blend?: string;
  clsn1: CollisionBox[];
  clsn2: CollisionBox[];
  raw: string;
  line: number;
};

export type MugenAnimationLibrary = {
  actions: Map<number, MugenAnimationAction>;
  diagnostics: MugenDiagnostic[];
};

export type MugenDiagnosticSeverity = "info" | "warning" | "error";

export type MugenDiagnostic = {
  severity: MugenDiagnosticSeverity;
  message: string;
  format?: "def" | "air" | "cmd" | "cns" | "sff" | "snd" | "act" | "stage" | "config" | "loader";
  file?: string;
  line?: number;
  raw?: string;
};
