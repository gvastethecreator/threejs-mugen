import type { MugenStateDef } from "../model/MugenState";

export type RuntimeStateAvailabilityProgramState = {
  id: number;
  source?: MugenStateDef;
};

export type RuntimeStateAvailabilityActor = {
  runtimeProgram?: {
    states: RuntimeStateAvailabilityProgramState[];
  };
  definition: {
    states?: MugenStateDef[];
    animations: Map<number, unknown>;
  };
};

export class RuntimeStateAvailabilityWorld {
  canEnterState<TActor extends RuntimeStateAvailabilityActor>(target: TActor, stateId: number, owner: TActor = target): boolean {
    return Boolean(this.findState(owner, stateId) ?? owner.definition.animations.has(stateId));
  }

  findState<TActor extends RuntimeStateAvailabilityActor>(owner: TActor, stateId: number): MugenStateDef | undefined {
    return owner.runtimeProgram?.states.find((state) => state.id === stateId)?.source ?? owner.definition.states?.find((state) => state.id === stateId);
  }
}
