export type RuntimeMatchFighterAdvanceInput<TActor> = {
  p1: TActor;
  p2: TActor;
  advanceFighter: (fighter: TActor, opponent: TActor) => void;
  applyAutoGuardStart: (defender: TActor, attacker: TActor) => void;
  isPaused: () => boolean;
};

export type RuntimeMatchFighterAdvanceResult = {
  advancedP2: boolean;
};

export class RuntimeMatchFighterAdvanceWorld {
  advancePair<TActor>(input: RuntimeMatchFighterAdvanceInput<TActor>): RuntimeMatchFighterAdvanceResult {
    input.advanceFighter(input.p1, input.p2);
    input.applyAutoGuardStart(input.p2, input.p1);
    if (input.isPaused()) {
      return { advancedP2: false };
    }
    input.advanceFighter(input.p2, input.p1);
    input.applyAutoGuardStart(input.p1, input.p2);
    return { advancedP2: true };
  }
}
