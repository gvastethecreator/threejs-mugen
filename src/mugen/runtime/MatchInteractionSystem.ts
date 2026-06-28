export type RuntimeMatchInteractionFighterPair<TFighter> = {
  p1: TFighter;
  p2: TFighter;
};

export type RuntimeMatchInteractionWorldInput<TFighter> = RuntimeMatchInteractionFighterPair<TFighter> & {
  advanceTargetMemory: (fighter: TFighter) => void;
  advanceActiveEffects: (fighter: TFighter) => void;
  resolveProjectileClashes: (left: TFighter, right: TFighter) => void;
  separateActors: (left: TFighter, right: TFighter) => void;
  applyTargetBindings: (fighter: TFighter, opponent: TFighter) => void;
  applyBindToTarget: (fighter: TFighter, opponent: TFighter) => void;
  resolvePriorityClash: (left: TFighter, right: TFighter) => string | undefined;
  resolveDirectCombat: (attacker: TFighter, defender: TFighter) => void;
  resolveProjectileCombat: (attacker: TFighter, defender: TFighter) => void;
  clampToStage: (fighter: TFighter) => void;
  advancePresentationEffects: (fighter: TFighter) => void;
  log: (line: string) => void;
};

export class RuntimeMatchInteractionWorld {
  advance<TFighter>(input: RuntimeMatchInteractionWorldInput<TFighter>): void {
    const { p1, p2 } = input;

    input.advanceTargetMemory(p1);
    input.advanceTargetMemory(p2);
    input.advanceActiveEffects(p1);
    input.advanceActiveEffects(p2);
    input.resolveProjectileClashes(p1, p2);
    input.separateActors(p1, p2);
    input.applyTargetBindings(p1, p2);
    input.applyTargetBindings(p2, p1);
    input.applyBindToTarget(p1, p2);
    input.applyBindToTarget(p2, p1);

    const priorityMessage = input.resolvePriorityClash(p1, p2);
    if (priorityMessage) {
      input.log(priorityMessage);
    }

    input.resolveDirectCombat(p1, p2);
    input.resolveDirectCombat(p2, p1);
    input.resolveProjectileCombat(p1, p2);
    input.resolveProjectileCombat(p2, p1);
    input.clampToStage(p1);
    input.clampToStage(p2);
    input.advancePresentationEffects(p1);
    input.advancePresentationEffects(p2);
  }
}
