export type MugenCommand = {
  name: string;
  sequence: MugenCommandToken[];
  rawCommand: string;
  resolvedCommand: string;
  time: number;
  stepTime: number;
  bufferTime: number;
  bufferHitPause: boolean;
  remapped: boolean;
  disabled?: boolean;
  disabledReason?: string;
  rawParams: Record<string, string>;
  line: number;
};

export type MugenCommandToken = {
  raw: string;
  type: "direction" | "button" | "modifier" | "separator" | "combo" | "alternative";
  chargeTime?: number;
};

export type MugenCommandFile = {
  commands: MugenCommand[];
  remap: Record<string, string>;
  defaults: {
    time: number;
    stepTime: number;
    bufferTime: number;
    bufferHitPause: boolean;
  };
  diagnostics: import("./MugenAnimation").MugenDiagnostic[];
};
