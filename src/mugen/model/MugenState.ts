export type MugenTrigger = {
  index: number;
  expression: string;
  raw: string;
  line: number;
};

export type MugenStateSourceKind = "character" | "common";

export type MugenStateSpecial = "plus-one";

export function mugenStateIdentityKey(id: number, special?: MugenStateSpecial): string {
  return `${special ?? "normal"}:${id}`;
}

export function matchesMugenStateIdentity(
  value: { id: number; special?: MugenStateSpecial },
  id: number,
  special?: MugenStateSpecial,
): boolean {
  return value.id === id && value.special === special;
}

export type MugenStateSourceRef = {
  kind: MugenStateSourceKind;
  path: string;
  fingerprint: string;
};

export type MugenStateSourceSelection = {
  stateId: number;
  special?: MugenStateSpecial;
  selected: MugenStateSourceRef;
  shadowed: MugenStateSourceRef[];
  appended?: MugenStateSourceRef[];
  reason: "character-override" | "character-only" | "common-fallback" | "ikemen-negative-merge";
};

export type MugenStateController = {
  stateId: number;
  special?: MugenStateSpecial;
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
  special?: MugenStateSpecial;
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
