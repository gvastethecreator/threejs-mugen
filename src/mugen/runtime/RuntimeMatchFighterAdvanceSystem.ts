import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import {
  RuntimeFighterRunOrderWorld,
  type RuntimeRootRunOrderActor,
  type RuntimeRootRunOrderResult,
} from "./RuntimeFighterRunOrderSystem";

export type RuntimeMatchFighterAdvanceInput<TActor extends RuntimeRootRunOrderActor> = {
  p1: TActor;
  p2: TActor;
  runtimeProfile?: RuntimeCompatibilityProfile;
  preparedRunOrder?: RuntimeRootRunOrderResult<TActor>;
  advanceFighter: (fighter: TActor, opponent: TActor) => void;
  applyAutoGuardStart: (defender: TActor, attacker: TActor, checkpoint: "pre" | "post") => void;
};

export class RuntimeMatchFighterAdvanceWorld {
  constructor(private readonly runOrderWorld = new RuntimeFighterRunOrderWorld()) {}

  advancePair<TActor extends RuntimeRootRunOrderActor>(
    input: RuntimeMatchFighterAdvanceInput<TActor>,
  ): RuntimeRootRunOrderResult<TActor> {
    const runOrder =
      input.preparedRunOrder ?? this.runOrderWorld.orderPair(input.runtimeProfile ?? "unknown", input.p1, input.p2);
    for (const { actor } of runOrder.entries) {
      input.applyAutoGuardStart(actor, opponentOf(actor, input), "pre");
    }
    for (const { actor } of runOrder.entries) {
      const opponent = opponentOf(actor, input);
      input.advanceFighter(actor, opponent);
      input.applyAutoGuardStart(actor, opponent, "post");
    }
    return runOrder;
  }
}

function opponentOf<TActor extends RuntimeRootRunOrderActor>(
  actor: TActor,
  input: Pick<RuntimeMatchFighterAdvanceInput<TActor>, "p1" | "p2">,
): TActor {
  return actor === input.p1 ? input.p2 : input.p1;
}
