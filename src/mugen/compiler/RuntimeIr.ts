import type { MugenCommand } from "../model/MugenCommand";
import type { MugenStateController, MugenStateDef, MugenStateSpecial, MugenTrigger } from "../model/MugenState";
import type { ControllerOp } from "./ControllerOps";

export type CompileSupportLevel = "executable" | "partial" | "noop" | "recognized" | "unsupported" | "invalid";

export type CommandPartIr = {
  raw: string;
  type: "direction" | "button";
  modifiers: string[];
  chargeTime?: number;
};

export type CommandStepIr = {
  parts: CommandPartIr[][];
};

export type CommandIr = {
  source: MugenCommand;
  name: string;
  rawCommand: string;
  resolvedCommand: string;
  time: number;
  stepTime: number;
  bufferTime: number;
  bufferHitPause: boolean;
  disabled: boolean;
  steps: CommandStepIr[];
  supportLevel: CompileSupportLevel;
  unsupportedFeatures: string[];
};

export type ExpressionIr = {
  raw: string;
  normalized: string;
  identifiers: string[];
  functions: string[];
  unsupportedFeatures: string[];
  supportLevel: CompileSupportLevel;
};

export type TriggerIr = {
  source: MugenTrigger;
  index: number;
  expression: ExpressionIr;
  line: number;
};

export type ControllerIr = {
  source: MugenStateController;
  stateId: number;
  special?: MugenStateSpecial;
  name?: string;
  type: string;
  normalizedType: string;
  supportLevel: CompileSupportLevel;
  triggers: TriggerIr[];
  params: Record<string, string>;
  operation?: ControllerOp;
  line: number;
  unsupportedFeatures: string[];
};

export type StateProgramIr = {
  source: MugenStateDef;
  id: number;
  special?: MugenStateSpecial;
  supportLevel: CompileSupportLevel;
  controllers: ControllerIr[];
  compiledControllers: number;
};

export type RuntimeProgramIr = {
  commands: CommandIr[];
  stateEntries: ControllerIr[];
  states: StateProgramIr[];
  report: CompileReport;
};

export type CompileReport = {
  commands: {
    total: number;
    compiled: number;
    disabled: number;
    unsupportedFeatures: Record<string, number>;
  };
  states: {
    total: number;
    compiled: number;
    recognizedControllerStates: number;
    triggerSupportedStateEntries: number;
    runtimeRoutableStateTargets: number[];
  };
  controllers: {
    total: number;
    compiled: number;
    partial: number;
    noop: number;
    unsupported: number;
    byType: Record<string, number>;
    unsupportedByType: Record<string, number>;
  };
  triggers: {
    total: number;
    compiled: number;
    unsupported: number;
    unsupportedFeatures: Record<string, number>;
  };
};
