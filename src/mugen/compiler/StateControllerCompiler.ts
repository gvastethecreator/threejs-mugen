import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenCommand } from "../model/MugenCommand";
import type { MugenStateController, MugenStateDef } from "../model/MugenState";
import { compileCommandIr } from "./CommandCompiler";
import { compileControllerOp } from "./ControllerOps";
import { compileExpression } from "./ExpressionCompiler";
import type { CompileReport, CompileSupportLevel, ControllerIr, RuntimeProgramIr, StateProgramIr, TriggerIr } from "./RuntimeIr";

export type ControllerSupport = {
  level: CompileSupportLevel;
  runtimeLabel: string;
};

const controllerSupport: Record<string, ControllerSupport> = {
  changestate: partial("state routing"),
  changeanim: partial("animation routing"),
  changeanim2: partial("state-owner animation routing"),
  velset: partial("velocity"),
  veladd: partial("velocity"),
  velmul: partial("velocity"),
  hitvelset: partial("hit velocity"),
  hitfallvel: partial("fall velocity"),
  hitfalldamage: partial("fall damage"),
  hitfallset: partial("fall metadata"),
  posset: partial("position"),
  posadd: partial("position"),
  gravity: partial("physics"),
  ctrlset: partial("control"),
  statetypeset: partial("state metadata"),
  hitdef: partial("combat"),
  reversaldef: partial("counter combat"),
  playerpush: partial("body push"),
  posfreeze: partial("tick movement"),
  screenbound: partial("stage bounds"),
  width: partial("body width"),
  fallenvshake: partial("camera shake"),
  assertspecial: partial("runtime flags"),
  playsnd: partial("audio events"),
  stopsnd: partial("audio events"),
  envshake: partial("camera shake"),
  palfx: partial("material tint"),
  afterimage: partial("sprite trails"),
  afterimagetime: partial("sprite trails"),
  explod: partial("effect actors"),
  removeexplod: partial("effect actors"),
  helper: partial("bounded visual helper"),
  projectile: partial("bounded projectile"),
  modifyprojectile: partial("bounded projectile mutation"),
  targetdrop: partial("target memory"),
  targetfacing: partial("target memory"),
  targetlifeadd: partial("target memory"),
  targetpoweradd: partial("target memory"),
  targetstate: partial("target memory"),
  targetveladd: partial("target memory"),
  targetvelset: partial("target memory"),
  targetbind: partial("target memory"),
  bindtotarget: partial("target memory"),
  movehitreset: partial("contact memory"),
  pause: partial("pause"),
  superpause: partial("pause"),
  sprpriority: partial("render priority"),
  selfstate: partial("custom-state return"),
  lifeadd: partial("life"),
  lifeset: partial("life"),
  poweradd: partial("power"),
  powerset: partial("power"),
  varset: partial("variables"),
  varadd: partial("variables"),
  varrangeset: partial("variables"),
  hitby: partial("hit eligibility"),
  nothitby: partial("hit eligibility"),
  hitoverride: partial("hit override"),
  defencemulset: partial("damage scaling"),
  attackmulset: partial("damage scaling"),
  remappal: partial("palette telemetry"),
  trans: partial("sprite transparency"),
  forcefeedback: noop("browser no-op"),
  turn: partial("facing"),
  null: noop("true no-op"),
};

export function getControllerSupport(type: string): ControllerSupport {
  return controllerSupport[type.toLowerCase()] ?? { level: "unsupported", runtimeLabel: "not registered" };
}

export function isRuntimeExecutableController(type: string): boolean {
  const level = getControllerSupport(type).level;
  return level === "executable" || level === "partial" || level === "noop";
}

export function compileControllerIr(controller: MugenStateController): ControllerIr {
  const normalizedType = controller.type.toLowerCase();
  const support = getControllerSupport(controller.type);
  const triggers: TriggerIr[] = controller.triggers.map((trigger) => ({
    source: trigger,
    index: trigger.index,
    expression: compileExpression(trigger.expression),
    line: trigger.line,
  }));
  const unsupportedFeatures = new Set<string>();
  if (support.level === "unsupported") {
    unsupportedFeatures.add(controller.type || "Unknown controller");
  }
  for (const trigger of triggers) {
    for (const feature of trigger.expression.unsupportedFeatures) {
      unsupportedFeatures.add(feature);
    }
  }

  const operation = compileControllerOp(controller);
  return {
    source: controller,
    stateId: controller.stateId,
    name: controller.name,
    type: controller.type,
    normalizedType,
    supportLevel: support.level,
    triggers,
    params: controller.params,
    ...(operation ? { operation } : {}),
    line: controller.line,
    unsupportedFeatures: [...unsupportedFeatures].sort((a, b) => a.localeCompare(b)),
  };
}

export function compileStateProgram(state: MugenStateDef): StateProgramIr {
  const controllers = state.controllers.map(compileControllerIr);
  const compiledControllers = controllers.filter((controller) => isCompiledController(controller)).length;
  return {
    source: state,
    id: state.id,
    supportLevel: compiledControllers > 0 ? "partial" : "unsupported",
    controllers,
    compiledControllers,
  };
}

export function compileRuntimeProgram(input: {
  commands: MugenCommand[];
  states: MugenStateDef[];
  stateEntryControllers: MugenStateController[];
  animations: Map<number, MugenAnimationAction>;
}): RuntimeProgramIr {
  const commands = input.commands.map(compileCommandIr);
  const states = input.states.map(compileStateProgram);
  const stateEntries = input.stateEntryControllers.map(compileControllerIr);
  const runtimeRoutableStateTargets = new Set<number>();
  let triggerSupportedStateEntries = 0;

  for (const entry of stateEntries) {
    if (entry.normalizedType !== "changestate" || !isCompiledController(entry) || hasUnsupportedTriggers(entry)) {
      continue;
    }
    triggerSupportedStateEntries += 1;
    const target = firstNumber(entry.params.value);
    const state = input.states.find((candidate) => candidate.id === target);
    if (target !== undefined && state && input.animations.has(state.anim ?? state.id)) {
      runtimeRoutableStateTargets.add(target);
    }
  }

  const allControllers = [...states.flatMap((state) => state.controllers), ...stateEntries];
  const report: CompileReport = {
    commands: {
      total: commands.length,
      compiled: commands.filter((command) => command.supportLevel === "executable").length,
      disabled: commands.filter((command) => command.disabled).length,
      unsupportedFeatures: countCommandUnsupported(commands),
    },
    states: {
      total: states.length,
      compiled: states.filter((state) => state.compiledControllers > 0).length,
      recognizedControllerStates: states.filter((state) => state.controllers.some(isCompiledController)).length,
      triggerSupportedStateEntries,
      runtimeRoutableStateTargets: [...runtimeRoutableStateTargets].sort((a, b) => a - b),
    },
    controllers: summarizeControllers(allControllers),
    triggers: summarizeTriggers(allControllers),
  };

  return { commands, states, stateEntries, report };
}

export function createEmptyCompileReport(): CompileReport {
  return {
    commands: { total: 0, compiled: 0, disabled: 0, unsupportedFeatures: {} },
    states: {
      total: 0,
      compiled: 0,
      recognizedControllerStates: 0,
      triggerSupportedStateEntries: 0,
      runtimeRoutableStateTargets: [],
    },
    controllers: {
      total: 0,
      compiled: 0,
      partial: 0,
      noop: 0,
      unsupported: 0,
      byType: {},
      unsupportedByType: {},
    },
    triggers: { total: 0, compiled: 0, unsupported: 0, unsupportedFeatures: {} },
  };
}

export function isCompiledController(controller: ControllerIr): boolean {
  return controller.supportLevel === "executable" || controller.supportLevel === "partial" || controller.supportLevel === "noop";
}

export function hasUnsupportedTriggers(controller: ControllerIr): boolean {
  return controller.triggers.some((trigger) => trigger.expression.supportLevel === "unsupported");
}

function summarizeControllers(controllers: ControllerIr[]): CompileReport["controllers"] {
  const byType: Record<string, number> = {};
  const unsupportedByType: Record<string, number> = {};
  let partialCount = 0;
  let noopCount = 0;
  let unsupportedCount = 0;
  for (const controller of controllers) {
    byType[controller.type] = (byType[controller.type] ?? 0) + 1;
    if (controller.supportLevel === "partial") {
      partialCount += 1;
    } else if (controller.supportLevel === "noop") {
      noopCount += 1;
    } else if (controller.supportLevel === "unsupported") {
      unsupportedCount += 1;
      unsupportedByType[controller.type] = (unsupportedByType[controller.type] ?? 0) + 1;
    }
  }
  return {
    total: controllers.length,
    compiled: controllers.filter(isCompiledController).length,
    partial: partialCount,
    noop: noopCount,
    unsupported: unsupportedCount,
    byType,
    unsupportedByType,
  };
}

function summarizeTriggers(controllers: ControllerIr[]): CompileReport["triggers"] {
  const unsupportedFeatures: Record<string, number> = {};
  let total = 0;
  let compiled = 0;
  for (const controller of controllers) {
    for (const trigger of controller.triggers) {
      total += 1;
      if (trigger.expression.supportLevel !== "unsupported") {
        compiled += 1;
      }
      for (const feature of trigger.expression.unsupportedFeatures) {
        unsupportedFeatures[feature] = (unsupportedFeatures[feature] ?? 0) + 1;
      }
    }
  }
  return { total, compiled, unsupported: total - compiled, unsupportedFeatures };
}

function countCommandUnsupported(commands: ReturnType<typeof compileCommandIr>[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const command of commands) {
    for (const feature of command.unsupportedFeatures) {
      counts[feature] = (counts[feature] ?? 0) + 1;
    }
  }
  return counts;
}

function partial(runtimeLabel: string): ControllerSupport {
  return { level: "partial", runtimeLabel };
}

function noop(runtimeLabel: string): ControllerSupport {
  return { level: "noop", runtimeLabel };
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}
