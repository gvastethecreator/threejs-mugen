export type RuntimeMatchFighterAdvanceInput<TActor> = {
  p1: TActor;
  p2: TActor;
  advanceFighter: (fighter: TActor, opponent: TActor) => void;
  applyAutoGuardStart: (defender: TActor, attacker: TActor, checkpoint: "pre" | "post") => void;
};

export class RuntimeMatchFighterAdvanceWorld {
  advancePair<TActor>(input: RuntimeMatchFighterAdvanceInput<TActor>): void {
    input.applyAutoGuardStart(input.p1, input.p2, "pre");
    input.applyAutoGuardStart(input.p2, input.p1, "pre");
    input.advanceFighter(input.p1, input.p2);
    input.applyAutoGuardStart(input.p1, input.p2, "post");
    input.advanceFighter(input.p2, input.p1);
    input.applyAutoGuardStart(input.p2, input.p1, "post");
  }
}
