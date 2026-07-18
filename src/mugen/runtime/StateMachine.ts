import { matchesMugenStateIdentity, type MugenStateDef, type MugenStateSpecial } from "../model/MugenState";

export class StateMachine {
  constructor(private readonly states: MugenStateDef[]) {}

  getState(id: number, special?: MugenStateSpecial): MugenStateDef | undefined {
    return this.states.find((state) => matchesMugenStateIdentity(state, id, special));
  }

  listStateIds(): number[] {
    return this.states.map((state) => state.id).sort((a, b) => a - b);
  }
}
