import type { TriggerIr } from "../compiler/RuntimeIr";
import type { MugenTrigger } from "../model/MugenState";
import { evaluateExpression, type ExpressionContext } from "./ExpressionEvaluator";

export function evaluateTrigger(trigger: MugenTrigger, context: ExpressionContext): boolean {
  return Boolean(evaluateExpression(trigger.expression, context));
}

export function evaluateTriggerIr(trigger: TriggerIr, context: ExpressionContext): boolean {
  return Boolean(evaluateExpression(trigger.expression.normalized, context));
}
