export type MugenTrigger = {
  index: number;
  expression: string;
  raw: string;
  line: number;
};

export type MugenStateSourceKind = "character" | "common";

export type MugenStateSourceRef = {
  kind: MugenStateSourceKind;
  path: string;
  fingerprint: string;
};

export type MugenStateSourceSelection = {
  stateId: number;
  selected: MugenStateSourceRef;
  shadowed: MugenStateSourceRef[];
  reason: "character-override" | "character-only" | "common-fallback";
};

export type MugenStateController = {
  stateId: number;
  name?: string;
  type: string;
  triggers: MugenTrigger[];
  params: Record<string, string>;
  line: number;
  rawHeader: string;
  source?: MugenStateSourceRef;
};

export type MugenStateDef = {
  id: number;
  type?: string;
  moveType?: string;
  physics?: string;
  anim?: number;
  ctrl?: number;
  velSet?: [number, number];
  hitDefPersist?: boolean;
  moveHitPersist?: boolean;
  hitCountPersist?: boolean;
  rawParams: Record<string, string>;
  controllers: MugenStateController[];
  line: number;
  source?: MugenStateSourceRef;
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
