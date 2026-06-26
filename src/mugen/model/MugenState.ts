export type MugenTrigger = {
  index: number;
  expression: string;
  raw: string;
  line: number;
};

export type MugenStateController = {
  stateId: number;
  name?: string;
  type: string;
  triggers: MugenTrigger[];
  params: Record<string, string>;
  line: number;
  rawHeader: string;
};

export type MugenStateDef = {
  id: number;
  type?: string;
  moveType?: string;
  physics?: string;
  anim?: number;
  ctrl?: number;
  velSet?: [number, number];
  rawParams: Record<string, string>;
  controllers: MugenStateController[];
  line: number;
};

export type MugenStateFile = {
  states: MugenStateDef[];
  controllers: MugenStateController[];
  /**
   * Numeric CNS constants normalized by source section.
   * Examples: `movement.yaccel`, `movement.down.bounce.offset.y`, `data.liedown.time`.
   */
  constants: Record<string, number>;
  diagnostics: import("./MugenAnimation").MugenDiagnostic[];
};
