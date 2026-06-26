import type { MugenDiagnostic } from "../model/MugenAnimation";

export function parseAct(_buffer: ArrayBuffer, file?: string): {
  colors: string[];
  diagnostics: MugenDiagnostic[];
} {
  return {
    colors: [],
    diagnostics: [
      {
        severity: "info",
        format: "act",
        file,
        message: "ACT palette parsing is stubbed in this milestone",
      },
    ],
  };
}
