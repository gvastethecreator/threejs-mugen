import type { CharacterRuntimeState } from "./types";

export type RuntimeStateMetadataTransition = {
  stateNo: number;
  animNo: number;
  stateType: CharacterRuntimeState["stateType"];
  moveType: CharacterRuntimeState["moveType"];
};

export type RuntimeStateMetadataTransitionOptions = {
  stateType?: CharacterRuntimeState["stateType"];
  moveType?: CharacterRuntimeState["moveType"];
};

export type RuntimeStateMetadataTransitionResult = {
  changed: boolean;
  previous?: RuntimeStateMetadataTransition;
};

export class RuntimeStateMetadataWorld {
  setStateNo(
    runtime: CharacterRuntimeState,
    stateNo: number,
    options: RuntimeStateMetadataTransitionOptions = {},
  ): RuntimeStateMetadataTransitionResult {
    return applyRuntimeStateMetadataTransition(runtime, stateNo, options);
  }
}

export function applyRuntimeStateMetadataTransition(
  runtime: CharacterRuntimeState,
  stateNo: number,
  options: RuntimeStateMetadataTransitionOptions = {},
): RuntimeStateMetadataTransitionResult {
  if (runtime.stateNo === stateNo) {
    runtime.stateNo = stateNo;
    return { changed: false };
  }

  const previous = {
    stateNo: runtime.stateNo,
    animNo: runtime.animNo,
    stateType: options.stateType ?? runtime.stateType,
    moveType: options.moveType ?? runtime.moveType,
  };
  runtime.prevStateNo = previous.stateNo;
  runtime.prevAnimNo = previous.animNo;
  runtime.prevStateType = previous.stateType;
  runtime.prevMoveType = previous.moveType;
  runtime.stateNo = stateNo;
  return { changed: true, previous };
}
