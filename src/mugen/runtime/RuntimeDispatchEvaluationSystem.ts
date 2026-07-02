import { evaluateExpression, type ExpressionContext } from "./ExpressionEvaluator";

export type RuntimeDispatchEvaluationContextInput<TActor, TOpponent, TOwner> = {
  expression: string;
  actor: TActor;
  opponent: TOpponent;
  opponents?: readonly TOpponent[];
  owner: TOwner;
  tick?: number;
};

export type RuntimeDispatchEvaluationInput<TActor, TOpponent, TOwner, TValue> = {
  value?: TValue;
  expression?: string;
  actor: TActor;
  opponent: TOpponent;
  opponents?: readonly TOpponent[];
  owner: TOwner;
  tick?: number;
  createContext: (input: RuntimeDispatchEvaluationContextInput<TActor, TOpponent, TOwner>) => ExpressionContext;
};

export class RuntimeDispatchEvaluationWorld {
  resolveNumber<TActor, TOpponent, TOwner>(
    input: RuntimeDispatchEvaluationInput<TActor, TOpponent, TOwner, number>,
  ): number | undefined {
    if (input.value !== undefined) {
      return input.value;
    }
    if (!input.expression) {
      return undefined;
    }
    const context = input.createContext({
      expression: input.expression,
      actor: input.actor,
      opponent: input.opponent,
      opponents: input.opponents,
      owner: input.owner,
      tick: input.tick,
    });
    const evaluated = evaluateExpression(input.expression, context);
    const numberValue = Number(evaluated);
    return Number.isFinite(numberValue) ? Math.trunc(numberValue) : undefined;
  }

  resolveBoolean<TActor, TOpponent, TOwner>(
    input: RuntimeDispatchEvaluationInput<TActor, TOpponent, TOwner, boolean>,
  ): boolean | undefined {
    if (input.value !== undefined) {
      return input.value;
    }
    const numberValue = this.resolveNumber({
      expression: input.expression,
      actor: input.actor,
      opponent: input.opponent,
      opponents: input.opponents,
      owner: input.owner,
      tick: input.tick,
      createContext: input.createContext,
    });
    return numberValue === undefined ? undefined : numberValue !== 0;
  }
}
