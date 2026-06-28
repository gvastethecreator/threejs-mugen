import type { ResourceControllerOp, VariableControllerOp } from "../compiler/ControllerOps";
import { applyRuntimeDamage, canRuntimeDamageKill } from "./CombatResolver";
import type { CharacterRuntimeState } from "./types";

export type RuntimeVariableType = "var" | "fvar" | "sysvar";

export type RuntimeVariableAssignment = {
  variableType: RuntimeVariableType;
  index: number;
  value: number;
};

export type RuntimeVariableRangeAssignment = {
  variableType: Exclude<RuntimeVariableType, "sysvar">;
  first: number;
  last: number;
  value: number;
};

export function applyRuntimeResourceController(
  state: CharacterRuntimeState,
  operation: ResourceControllerOp,
): void {
  if (operation.controllerType === "ctrlset") {
    state.ctrl = operation.value;
    return;
  }
  if (operation.controllerType === "lifeadd") {
    applyRuntimeLifeAdd(state, operation.value, operation.kill ?? true);
    return;
  }
  if (operation.controllerType === "lifeset") {
    state.life = Math.max(0, operation.value);
    return;
  }
  if (operation.controllerType === "poweradd") {
    state.power = Math.max(0, state.power + operation.value);
    return;
  }
  state.power = Math.max(0, operation.value);
}

export function applyRuntimeLifeAdd(state: CharacterRuntimeState, value: number, kill: boolean): void {
  state.life =
    value < 0
      ? applyRuntimeDamage(state.life, Math.abs(value), canRuntimeDamageKill(state, kill))
      : Math.max(0, state.life + value);
}

export function applyRuntimeVariableAssignment(
  state: CharacterRuntimeState,
  assignment: RuntimeVariableAssignment,
  additive: boolean,
): void {
  if (assignment.index < 0) {
    return;
  }
  const target = runtimeVariableTarget(state, assignment.variableType);
  const current = target[assignment.index] ?? 0;
  target[assignment.index] = additive ? current + assignment.value : assignment.value;
}

export function applyRuntimeVariableRangeAssignment(
  state: CharacterRuntimeState,
  assignment: RuntimeVariableRangeAssignment,
): void {
  const target = runtimeVariableTarget(state, assignment.variableType);
  const maxIndex = assignment.variableType === "fvar" ? 39 : 59;
  const first = clampIndex(Math.round(assignment.first), maxIndex);
  const last = clampIndex(Math.round(assignment.last), maxIndex);
  const start = Math.min(first, last);
  const end = Math.max(first, last);
  for (let index = start; index <= end; index += 1) {
    target[index] = assignment.value;
  }
}

export function runtimeVariableTypeFromOperation(operation: VariableControllerOp | undefined): RuntimeVariableType | undefined {
  return operation?.variableType;
}

function runtimeVariableTarget(state: CharacterRuntimeState, variableType: RuntimeVariableType): number[] {
  if (variableType === "sysvar") {
    return (state.sysvars ??= []);
  }
  if (variableType === "fvar") {
    return state.fvars;
  }
  return state.vars;
}

function clampIndex(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}
