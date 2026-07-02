import type { ControllerIr, TriggerIr } from "../compiler/RuntimeIr";

export type RuntimeTriggerGateEvaluator<TActor, TOpponent, TOwner> = (
  trigger: TriggerIr,
  actor: TActor,
  opponent: TOpponent,
  owner: TOwner,
  tick?: number,
) => boolean;

export type RuntimeTriggerGateInput<TActor, TOpponent, TOwner> = {
  controller: ControllerIr;
  actor: TActor;
  opponent: TOpponent;
  owner: TOwner;
  tick?: number;
  evaluateTrigger: RuntimeTriggerGateEvaluator<TActor, TOpponent, TOwner>;
};

export type RuntimeTriggerGateResult =
  | {
      passed: true;
      evaluatedTriggers: number;
      evaluatedGroups: number;
      matchedGroup?: number;
    }
  | {
      passed: false;
      evaluatedTriggers: number;
      evaluatedGroups: number;
      failedTriggerAll: boolean;
    };

export class RuntimeTriggerGateWorld {
  passes<TActor, TOpponent, TOwner>(input: RuntimeTriggerGateInput<TActor, TOpponent, TOwner>): boolean {
    return this.evaluate(input).passed;
  }

  evaluate<TActor, TOpponent, TOwner>(
    input: RuntimeTriggerGateInput<TActor, TOpponent, TOwner>,
  ): RuntimeTriggerGateResult {
    const triggerAll = input.controller.triggers.filter((trigger) => trigger.index === 0);
    let evaluatedTriggers = 0;

    for (const trigger of triggerAll) {
      evaluatedTriggers += 1;
      if (!input.evaluateTrigger(trigger, input.actor, input.opponent, input.owner, input.tick)) {
        return {
          passed: false,
          evaluatedTriggers,
          evaluatedGroups: 0,
          failedTriggerAll: true,
        };
      }
    }

    const grouped = new Map<number, TriggerIr[]>();
    for (const trigger of input.controller.triggers) {
      if (trigger.index <= 0) {
        continue;
      }
      const triggers = grouped.get(trigger.index) ?? [];
      triggers.push(trigger);
      grouped.set(trigger.index, triggers);
    }

    if (grouped.size === 0) {
      return {
        passed: true,
        evaluatedTriggers,
        evaluatedGroups: 0,
      };
    }

    let evaluatedGroups = 0;
    for (const [index, triggers] of grouped) {
      evaluatedGroups += 1;
      let groupPassed = true;
      for (const trigger of triggers) {
        evaluatedTriggers += 1;
        if (!input.evaluateTrigger(trigger, input.actor, input.opponent, input.owner, input.tick)) {
          groupPassed = false;
          break;
        }
      }
      if (groupPassed) {
        return {
          passed: true,
          evaluatedTriggers,
          evaluatedGroups,
          matchedGroup: index,
        };
      }
    }

    return {
      passed: false,
      evaluatedTriggers,
      evaluatedGroups,
      failedTriggerAll: false,
    };
  }
}
