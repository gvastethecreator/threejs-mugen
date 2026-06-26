import type { MugenStateDef } from "../model/MugenState";

export class StateMachine {
  constructor(private readonly states: MugenStateDef[]) {}

  getState(id: number): MugenStateDef | undefined {
    return this.states.find((state) => state.id === id);
  }

  listStateIds(): number[] {
    return this.states.map((state) => state.id).sort((a, b) => a - b);
  }
}
