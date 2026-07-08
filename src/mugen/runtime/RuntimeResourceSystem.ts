import type { ResourceControllerOp, VariableControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import { applyRuntimeDamage, canRuntimeDamageKill } from "./CombatResolver";
import { evaluateRuntimeControllerNumber } from "./RuntimeControllerExpressionContextSystem";
import type { RuntimeControllerEvaluationContext } from "./StateControllerExecutor";
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

export type RuntimeResourceConstants = Record<string, number | undefined>;

export type RuntimeResourceControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export class RuntimeResourceWorld {
  lifeMaxFromConstants(constants?: RuntimeResourceConstants): number {
    return boundedRuntimeResourceMax(constants?.["data.life"], 1000);
  }

  powerMaxFromConstants(constants?: RuntimeResourceConstants): number {
    return boundedRuntimeResourceMax(constants?.["data.power"], 3000);
  }

  powerMaxForState(state: CharacterRuntimeState, constants?: RuntimeResourceConstants): number {
    return boundedRuntimeResourceMax(state.powerMax ?? constants?.["data.power"], 3000);
  }

  applyControl(state: CharacterRuntimeState, value: boolean): void {
    state.ctrl = value;
  }

  applyStateDefControl(state: CharacterRuntimeState, value: number | undefined): void {
    if (value !== undefined) {
      this.applyControl(state, value !== 0);
    }
  }

  applyPowerDelta(state: CharacterRuntimeState, value: number, constants?: RuntimeResourceConstants): void {
    state.power = clampRuntimeResource(state.power + value, 0, this.powerMaxForState(state, constants));
  }

  applyResourceController(state: CharacterRuntimeState, operation: ResourceControllerOp): void {
    if (operation.controllerType === "ctrlset") {
      this.applyControl(state, operation.value);
      return;
    }
    if (operation.controllerType === "lifeadd") {
      this.applyLifeAdd(state, operation.value, operation.kill ?? true);
      return;
    }
    if (operation.controllerType === "lifeset") {
      state.life = clampRuntimeResource(operation.value, 0, state.lifeMax);
      return;
    }
    if (operation.controllerType === "poweradd") {
      state.power = clampRuntimeResource(state.power + operation.value, 0, state.powerMax);
      return;
    }
    state.power = clampRuntimeResource(operation.value, 0, state.powerMax);
  }

  applyLifeAdd(state: CharacterRuntimeState, value: number, kill: boolean): void {
    state.life =
      value < 0
        ? applyRuntimeDamage(state.life, Math.abs(value), canRuntimeDamageKill(state, kill))
        : clampRuntimeResource(state.life + value, 0, state.lifeMax);
  }

  applyVariableAssignment(state: CharacterRuntimeState, assignment: RuntimeVariableAssignment, additive: boolean): void {
    if (assignment.index < 0) {
      return;
    }
    const target = runtimeVariableTarget(state, assignment.variableType);
    const current = target[assignment.index] ?? 0;
    target[assignment.index] = additive ? current + assignment.value : assignment.value;
  }

  applyVariableRangeAssignment(state: CharacterRuntimeState, assignment: RuntimeVariableRangeAssignment): void {
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
}

const defaultRuntimeResourceWorld = new RuntimeResourceWorld();

export function runtimeLifeMaxFromConstants(constants?: RuntimeResourceConstants): number {
  return defaultRuntimeResourceWorld.lifeMaxFromConstants(constants);
}

export function runtimePowerMaxFromConstants(constants?: RuntimeResourceConstants): number {
  return defaultRuntimeResourceWorld.powerMaxFromConstants(constants);
}

export function runtimePowerMaxForState(state: CharacterRuntimeState, constants?: RuntimeResourceConstants): number {
  return defaultRuntimeResourceWorld.powerMaxForState(state, constants);
}

export function applyRuntimeControl(state: CharacterRuntimeState, value: boolean): void {
  defaultRuntimeResourceWorld.applyControl(state, value);
}

export function applyRuntimeStateDefControl(state: CharacterRuntimeState, value: number | undefined): void {
  defaultRuntimeResourceWorld.applyStateDefControl(state, value);
}

export function applyRuntimePowerDelta(
  state: CharacterRuntimeState,
  value: number,
  constants?: RuntimeResourceConstants,
): void {
  defaultRuntimeResourceWorld.applyPowerDelta(state, value, constants);
}

export function applyRuntimeResourceController(
  state: CharacterRuntimeState,
  operation: ResourceControllerOp,
): void {
  defaultRuntimeResourceWorld.applyResourceController(state, operation);
}

export function applyRuntimeLifeAdd(state: CharacterRuntimeState, value: number, kill: boolean): void {
  defaultRuntimeResourceWorld.applyLifeAdd(state, value, kill);
}

export function applyRuntimeVariableAssignment(
  state: CharacterRuntimeState,
  assignment: RuntimeVariableAssignment,
  additive: boolean,
): void {
  defaultRuntimeResourceWorld.applyVariableAssignment(state, assignment, additive);
}

export function applyRuntimeVariableRangeAssignment(
  state: CharacterRuntimeState,
  assignment: RuntimeVariableRangeAssignment,
): void {
  defaultRuntimeResourceWorld.applyVariableRangeAssignment(state, assignment);
}

export function runtimeVariableTypeFromOperation(operation: VariableControllerOp | undefined): RuntimeVariableType | undefined {
  return operation?.variableType;
}

export function resolveRuntimeCtrlSetControllerOperation(
  controller: RuntimeResourceControllerSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): Extract<ResourceControllerOp, { controllerType: "ctrlset" }> | undefined {
  const raw = findParam(controller, "value");
  if (raw === undefined) {
    return undefined;
  }
  return {
    kind: "resource",
    controllerType: "ctrlset",
    value: (evaluateRuntimeControllerNumber(raw.trim(), state, context) ?? 0) !== 0,
  };
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

function findParam(controller: RuntimeResourceControllerSource, key: string): string | undefined {
  const lower = key.toLowerCase();
  const match = Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower);
  return match?.[1];
}

function clampIndex(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function clampRuntimeResource(value: number, min: number, max?: number): number {
  const lowerBounded = Math.max(min, value);
  return max === undefined ? lowerBounded : Math.min(max, lowerBounded);
}

function boundedRuntimeResourceMax(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.round(value));
}
