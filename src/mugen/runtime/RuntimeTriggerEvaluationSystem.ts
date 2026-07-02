import type { TriggerIr } from "../compiler/RuntimeIr";
import { evaluateExpression, type ExpressionContext } from "./ExpressionEvaluator";

export type RuntimeTriggerEvaluationContextInput<TActor, TOpponent, TOwner> = {
  trigger: TriggerIr;
  actor: TActor;
  opponent: TOpponent;
  opponents?: readonly TOpponent[];
  owner: TOwner;
  tick?: number;
};

export type RuntimeTriggerEvaluationInput<TActor, TOpponent, TOwner> =
  RuntimeTriggerEvaluationContextInput<TActor, TOpponent, TOwner> & {
    createContext: (input: RuntimeTriggerEvaluationContextInput<TActor, TOpponent, TOwner>) => ExpressionContext;
  };

export type RuntimeTriggerEvaluationValue = boolean | number | string;

export type RuntimeTriggerEvaluationResult = {
  passed: boolean;
  value: RuntimeTriggerEvaluationValue;
};

export class RuntimeTriggerEvaluationWorld {
  passes<TActor, TOpponent, TOwner>(input: RuntimeTriggerEvaluationInput<TActor, TOpponent, TOwner>): boolean {
    return this.evaluate(input).passed;
  }

  evaluate<TActor, TOpponent, TOwner>(
    input: RuntimeTriggerEvaluationInput<TActor, TOpponent, TOwner>,
  ): RuntimeTriggerEvaluationResult {
    const context = input.createContext({
      trigger: input.trigger,
      actor: input.actor,
      opponent: input.opponent,
      opponents: input.opponents,
      owner: input.owner,
      tick: input.tick,
    });
    const value = evaluateExpression(input.trigger.expression.normalized, context);
    return {
      passed: Boolean(value),
      value,
    };
  }
}
