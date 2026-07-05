import { compileControllerIr } from "../compiler/StateControllerCompiler";
import type {
  AssertSpecialControllerOp,
  BoundsControllerOp,
  CollisionControllerOp,
  HitFallControllerOp,
  KinematicControllerOp,
  MetadataControllerOp,
  MovementKinematicControllerOp,
  OrientationControllerOp,
  ResourceControllerOp,
  SpriteEffectControllerOp,
  VariableControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import {
  evaluateRuntimeControllerNumber,
  type RuntimeControllerEvaluationContext,
} from "./RuntimeControllerExpressionContextSystem";
import {
  applyRuntimeLifeAdd,
  applyRuntimeResourceController,
  applyRuntimeVariableAssignment,
  applyRuntimeVariableRangeAssignment,
  type RuntimeVariableAssignment,
} from "./RuntimeResourceSystem";
import { clampRuntimeRandomUnit, fallbackRuntimeRandomUnit } from "./RuntimeRandomSystem";
import { applyRuntimeTurn } from "./OrientationSystem";
import { applyRuntimeAngleController, applyRuntimeRemapPalController, applyRuntimeTransController } from "./SpriteEffectSystem";
import { RuntimeHitDefenseWorld } from "./HitDefenseSystem";
import { RuntimeDamageScaleWorld } from "./DamageScaleSystem";
import { RuntimeStateTypeWorld } from "./StateTypeSystem";
import { RuntimeHitFallControllerWorld } from "./HitFallControllerSystem";
import { RuntimeBoundsControllerWorld } from "./BoundsControllerSystem";
import { RuntimeKinematicControllerWorld } from "./KinematicControllerSystem";
import { RuntimeAnimationControllerWorld } from "./AnimationControllerSystem";
import { RuntimeStateTransitionControllerWorld } from "./StateTransitionControllerSystem";
import type { CharacterRuntimeState, RuntimeAssertSpecial } from "./types";

export type { RuntimeControllerEvaluationContext } from "./RuntimeControllerExpressionContextSystem";

type ControllerExecutionSource = Pick<ControllerIr, "type" | "normalizedType" | "params">;

const hitDefenseWorld = new RuntimeHitDefenseWorld();
const damageScaleWorld = new RuntimeDamageScaleWorld();
const stateTypeWorld = new RuntimeStateTypeWorld();
const hitFallControllerWorld = new RuntimeHitFallControllerWorld();
const boundsControllerWorld = new RuntimeBoundsControllerWorld();
const kinematicControllerWorld = new RuntimeKinematicControllerWorld();
const animationControllerWorld = new RuntimeAnimationControllerWorld();
const stateTransitionControllerWorld = new RuntimeStateTransitionControllerWorld();

export function executeStateController(
  controller: MugenStateController,
  state: CharacterRuntimeState,
  reportUnsupported: (controller: string) => void,
): CharacterRuntimeState {
  return executeControllerIr(compileControllerIr(controller), state, reportUnsupported);
}

export function executeControllerIr(
  controller: ControllerIr,
  state: CharacterRuntimeState,
  reportUnsupported: (controller: string) => void,
  context: RuntimeControllerEvaluationContext = {},
): CharacterRuntimeState {
  const next = structuredClone(state);
  const type = controller.normalizedType;

  if (type === "changestate" || type === "selfstate") {
    const result = stateTransitionControllerWorld.applyController(next, controller, context);
    if (result.missingValue) {
      reportUnsupported(`${controller.type}:missing-value`);
      return next;
    }
  } else if (type === "changeanim" || type === "changeanim2") {
    animationControllerWorld.applyController(next, controller, context);
  } else if (type === "velset") {
    kinematicControllerWorld.applyController(next, controller, kinematicOperation(controller, "velset"), context);
  } else if (type === "veladd") {
    kinematicControllerWorld.applyController(next, controller, kinematicOperation(controller, "veladd"), context);
  } else if (type === "velmul") {
    kinematicControllerWorld.applyController(next, controller, kinematicOperation(controller, "velmul"), context);
  } else if (type === "hitvelset") {
    kinematicControllerWorld.applyController(next, controller, kinematicOperation(controller, "hitvelset"), context);
  } else if (type === "hitfallvel") {
    hitFallControllerWorld.applyController(next, controller, hitFallOperation(controller, "hitfallvel"), context);
  } else if (type === "hitfalldamage") {
    hitFallControllerWorld.applyController(next, controller, hitFallOperation(controller, "hitfalldamage"), context);
  } else if (type === "hitfallset") {
    hitFallControllerWorld.applyController(next, controller, hitFallOperation(controller, "hitfallset"), context);
  } else if (type === "posset") {
    kinematicControllerWorld.applyController(next, controller, kinematicOperation(controller, "posset"), context);
  } else if (type === "posadd") {
    kinematicControllerWorld.applyController(next, controller, kinematicOperation(controller, "posadd"), context);
  } else if (type === "gravity") {
    kinematicControllerWorld.applyController(next, controller, kinematicOperation(controller, "gravity"), context);
  } else if (type === "ctrlset") {
    const operation = resourceOperation(controller, "ctrlset");
    applyRuntimeResourceController(next, {
      kind: "resource",
      controllerType: "ctrlset",
      value: operation?.value ?? (numberParam(controller, next, context, "value") ?? 0) !== 0,
    });
  } else if (type === "statetypeset") {
    stateTypeWorld.applyController(next, controller, metadataOperation(controller, "statetypeset"));
  } else if (type === "lifeadd") {
    const operation = resourceOperation(controller, "lifeadd");
    const value = operation?.value ?? numberParam(controller, next, context, "value") ?? 0;
    const kill = operation?.kill ?? ((numberParam(controller, next, context, "kill") ?? 1) !== 0);
    applyRuntimeLifeAdd(next, value, kill);
  } else if (type === "lifeset") {
    const operation = resourceOperation(controller, "lifeset");
    const value = operation?.value ?? numberParam(controller, next, context, "value");
    if (value !== undefined) {
      applyRuntimeResourceController(next, { kind: "resource", controllerType: "lifeset", value });
    }
  } else if (type === "poweradd") {
    const operation = resourceOperation(controller, "poweradd");
    applyRuntimeResourceController(next, {
      kind: "resource",
      controllerType: "poweradd",
      value: operation?.value ?? numberParam(controller, next, context, "value") ?? 0,
    });
  } else if (type === "powerset") {
    const operation = resourceOperation(controller, "powerset");
    const value = operation?.value ?? numberParam(controller, next, context, "value");
    if (value !== undefined) {
      applyRuntimeResourceController(next, { kind: "resource", controllerType: "powerset", value });
    }
  } else if (type === "varset" || type === "varadd") {
    applyVariableController(next, controller, context, type === "varadd", variableOperation(controller, type));
  } else if (type === "varrandom") {
    applyVariableRandomController(next, controller, context, variableOperation(controller, "varrandom"));
  } else if (type === "varrangeset") {
    applyVariableRangeSet(next, controller, context, variableOperation(controller, "varrangeset"));
  } else if (type === "playerpush") {
    boundsControllerWorld.applyPlayerPushController(next, controller, collisionOperation(controller, "playerpush"), context);
  } else if (type === "turn") {
    const operation = orientationOperation(controller, "turn");
    if (controller.operation && !operation) {
      reportUnsupported(`${controller.type}:operation-mismatch`);
      return next;
    }
    applyRuntimeTurn(next);
  } else if (type === "hitby" || type === "nothitby") {
    const operation =
      controller.operation?.kind === "eligibility" && controller.operation.controllerType === type
        ? controller.operation
        : undefined;
    hitDefenseWorld.applyHitByController(next, controller, type === "hitby" ? "allow" : "deny", operation, context);
  } else if (type === "hitoverride") {
    const operation = controller.operation?.kind === "hitoverride" ? controller.operation : undefined;
    hitDefenseWorld.applyHitOverrideController(next, controller, operation, context);
  } else if (type === "defencemulset") {
    const operation =
      controller.operation?.kind === "damage-scale" && controller.operation.controllerType === "defencemulset"
        ? controller.operation
        : undefined;
    damageScaleWorld.applyController(next, controller, "defencemulset", operation, context);
  } else if (type === "attackmulset") {
    const operation =
      controller.operation?.kind === "damage-scale" && controller.operation.controllerType === "attackmulset"
        ? controller.operation
        : undefined;
    damageScaleWorld.applyController(next, controller, "attackmulset", operation, context);
  } else if (type === "remappal") {
    applyRuntimeRemapPalController(next, controller, spriteEffectOperation(controller, "remappal"), (key) =>
      pairParam(controller, next, context, key),
    );
  } else if (type === "trans") {
    applyRuntimeTransController(next, controller, spriteEffectOperation(controller, "trans"), (key) =>
      pairParam(controller, next, context, key),
    );
  } else if (type === "angleset" || type === "angleadd" || type === "angledraw") {
    applyRuntimeAngleController(next, controller, spriteEffectOperation(controller, type));
  } else if (type === "posfreeze") {
    boundsControllerWorld.applyPosFreezeController(next, controller, boundsOperation(controller, "posfreeze"), context);
  } else if (type === "screenbound") {
    boundsControllerWorld.applyScreenBoundController(next, controller, boundsOperation(controller, "screenbound"), context);
  } else if (type === "assertspecial") {
    applyAssertSpecialController(next, controller, assertSpecialOperation(controller));
  } else if (
    type === "hitdef" ||
    type === "width" ||
    type === "fallenvshake" ||
    type === "forcefeedback" ||
    type === "displaytoclipboard" ||
    type === "appendtoclipboard" ||
    type === "clearclipboard" ||
    type === "makedust" ||
    type === "destroyself" ||
    type === "playsnd" ||
    type === "stopsnd" ||
    type === "sndpan" ||
    type === "envshake" ||
    type === "palfx" ||
    type === "afterimage" ||
    type === "afterimagetime" ||
    type === "angleset" ||
    type === "angleadd" ||
    type === "angledraw" ||
    type === "explod" ||
    type === "removeexplod" ||
    type === "modifyexplod" ||
    type === "helper" ||
    type === "projectile" ||
    type === "sprpriority" ||
    type === "pause" ||
    type === "superpause" ||
    type === "movehitreset" ||
    type === "hitadd" ||
    type === "null"
  ) {
    return next;
  } else {
    reportUnsupported(controller.type);
  }

  return next;
}

function hitFallOperation(
  controller: ControllerIr,
  controllerType: HitFallControllerOp["controllerType"],
): HitFallControllerOp | undefined {
  return controller.operation?.kind === "hitfall" && controller.operation.controllerType === controllerType
    ? controller.operation
    : undefined;
}

function kinematicOperation(
  controller: ControllerIr,
  controllerType: MovementKinematicControllerOp["controllerType"],
): MovementKinematicControllerOp | undefined;
function kinematicOperation(controller: ControllerIr, controllerType: "gravity"): Extract<KinematicControllerOp, { controllerType: "gravity" }> | undefined;
function kinematicOperation(
  controller: ControllerIr,
  controllerType: KinematicControllerOp["controllerType"],
): KinematicControllerOp | undefined {
  return controller.operation?.kind === "kinematic" && controller.operation.controllerType === controllerType
    ? controller.operation
    : undefined;
}

function resourceOperation<T extends ResourceControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<ResourceControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "resource" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<ResourceControllerOp, { controllerType: T }>)
    : undefined;
}

function boundsOperation<T extends BoundsControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<BoundsControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "bounds" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<BoundsControllerOp, { controllerType: T }>)
    : undefined;
}

function collisionOperation<T extends CollisionControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<CollisionControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "collision" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<CollisionControllerOp, { controllerType: T }>)
    : undefined;
}

function metadataOperation<T extends MetadataControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<MetadataControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "metadata" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<MetadataControllerOp, { controllerType: T }>)
    : undefined;
}

function orientationOperation<T extends OrientationControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<OrientationControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "orientation" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<OrientationControllerOp, { controllerType: T }>)
    : undefined;
}

function variableOperation<T extends VariableControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<VariableControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "variable" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<VariableControllerOp, { controllerType: T }>)
    : undefined;
}

function spriteEffectOperation<T extends SpriteEffectControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<SpriteEffectControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "sprite-effect" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<SpriteEffectControllerOp, { controllerType: T }>)
    : undefined;
}

function assertSpecialOperation(controller: ControllerIr): AssertSpecialControllerOp | undefined {
  return controller.operation?.kind === "assertspecial" ? controller.operation : undefined;
}

function numberParam(
  controller: ControllerExecutionSource,
  state: CharacterRuntimeState,
  contextOrKey: RuntimeControllerEvaluationContext | string,
  ...keys: string[]
): number | undefined {
  const context = typeof contextOrKey === "string" ? {} : contextOrKey;
  const requestedKeys = typeof contextOrKey === "string" ? [contextOrKey, ...keys] : keys;
  for (const key of requestedKeys) {
    const raw = findParam(controller, key);
    if (raw === undefined) {
      continue;
    }
    return evaluateNumber(raw.trim(), state, context);
  }
  return undefined;
}

function pairParam(
  controller: ControllerExecutionSource,
  state: CharacterRuntimeState,
  contextOrKey: RuntimeControllerEvaluationContext | string,
  key?: string,
): [number, number] | undefined {
  const context = typeof contextOrKey === "string" ? {} : contextOrKey;
  const requestedKey = typeof contextOrKey === "string" ? contextOrKey : key;
  const raw = requestedKey ? findParam(controller, requestedKey) : undefined;
  if (!raw) {
    return undefined;
  }
  const parts = raw.split(",").map((part) => evaluateNumber(part.trim(), state, context));
  if (parts.length < 2 || parts[0] === undefined || parts[1] === undefined) {
    return undefined;
  }
  return [parts[0], parts[1]];
}

function findParam(controller: ControllerExecutionSource, key: string): string | undefined {
  const lower = key.toLowerCase();
  const match = Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower);
  return match?.[1];
}

function applyVariableController(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  context: RuntimeControllerEvaluationContext,
  additive: boolean,
  operation?: Extract<VariableControllerOp, { controllerType: "varset" | "varadd" }>,
): void {
  const assignment = operation
    ? { variableType: operation.variableType, index: operation.index, value: operation.value }
    : variableAssignmentParam(controller, state, context);
  const variableType =
    assignment?.variableType ??
    (operation?.variableType === "fvar" || findParam(controller, "fv") !== undefined || findParam(controller, "fvar") !== undefined
      ? "fvar"
      : "var");
  const index = assignment?.index ?? numberParam(controller, state, context, "v", "var", "fv", "fvar");
  const value = assignment?.value ?? numberParam(controller, state, context, "value");
  if (index === undefined || value === undefined || index < 0) {
    return;
  }
  applyRuntimeVariableAssignment(state, { variableType, index, value }, additive);
}

function applyVariableRangeSet(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  context: RuntimeControllerEvaluationContext,
  operation?: Extract<VariableControllerOp, { controllerType: "varrangeset" }>,
): void {
  const isFloat = operation?.variableType === "fvar" || findParam(controller, "fvalue") !== undefined;
  const value = operation?.value ?? numberParam(controller, state, context, isFloat ? "fvalue" : "value");
  if (value === undefined) {
    return;
  }
  const maxIndex = isFloat ? 39 : 59;
  const first = clampIndex(Math.round(operation?.first ?? numberParam(controller, state, context, "first") ?? 0), maxIndex);
  const last = clampIndex(Math.round(operation?.last ?? numberParam(controller, state, context, "last") ?? maxIndex), maxIndex);
  applyRuntimeVariableRangeAssignment(state, { variableType: isFloat ? "fvar" : "var", first, last, value });
}

function applyVariableRandomController(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  context: RuntimeControllerEvaluationContext,
  operation?: Extract<VariableControllerOp, { controllerType: "varrandom" }>,
): void {
  const rawIndex = operation?.index ?? numberParam(controller, state, context, "v", "var");
  if (rawIndex === undefined || rawIndex < 0) {
    return;
  }
  const index = clampIndex(Math.round(rawIndex), 59);
  const range = operation ? [operation.min, operation.max] : variableRandomRange(controller, state, context);
  if (!range) {
    return;
  }
  const lower = Math.round(Math.min(range[0], range[1]));
  const upper = Math.round(Math.max(range[0], range[1]));
  const span = Math.max(1, upper - lower + 1);
  const unit = clampRuntimeRandomUnit(
    context.random?.() ??
      fallbackRuntimeRandomUnit({
        state,
        variableIndex: index,
        lower,
        upper,
        stageTime: context.stageTime,
      }),
  );
  applyRuntimeVariableAssignment(state, { variableType: "var", index, value: lower + Math.floor(unit * span) }, false);
}

function variableRandomRange(
  controller: ControllerExecutionSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
): [number, number] | undefined {
  const raw = findParam(controller, "range");
  if (raw === undefined) {
    return [0, 1000];
  }
  const values = raw.split(",").map((part) => evaluateNumber(part.trim(), state, context));
  const first = values[0];
  if (first === undefined) {
    return undefined;
  }
  const second = values.length > 1 ? values[1] : first;
  if (second === undefined) {
    return undefined;
  }
  return values.length > 1 ? [first, second] : [0, first];
}

function applyAssertSpecialController(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  operation?: AssertSpecialControllerOp,
): void {
  const enabled = operation ? true : (numberParam(controller, state, "value", "enabled") ?? 1) !== 0;
  const rawFlags = operation
    ? []
    : Object.entries(controller.params)
        .filter(([key]) => key.toLowerCase().startsWith("flag"))
        .flatMap(([, value]) => value.split(",").map((part) => part.trim()))
        .filter(Boolean);
  if (!enabled || rawFlags.length === 0) {
    if (!operation) {
      return;
    }
  }
  const current: RuntimeAssertSpecial = state.assertSpecial
    ? {
        ...state.assertSpecial,
        flags: [...state.assertSpecial.flags],
        globalFlags: [...state.assertSpecial.globalFlags],
      }
    : { flags: [], globalFlags: [] };

  const flags = operation
    ? [
        ...operation.flags.map((name) => ({ name, global: false })),
        ...operation.globalFlags.map((name) => ({ name, global: true })),
      ]
    : rawFlags.map(normalizeAssertSpecialFlag).filter((flag): flag is { name: string; global: boolean } => Boolean(flag));

  for (const flag of flags) {
    if (flag.global) {
      addUnique(current.globalFlags, flag.name);
    } else {
      addUnique(current.flags, flag.name);
    }
    if (flag.name === "noautoturn") current.noAutoTurn = true;
    if (flag.name === "nowalk") current.noWalk = true;
    if (flag.name === "invisible") current.invisible = true;
    if (flag.name === "noshadow" || flag.name === "globalnoshadow") current.noShadow = true;
    if (flag.name === "nostandguard") current.noStandGuard = true;
    if (flag.name === "nocrouchguard") current.noCrouchGuard = true;
    if (flag.name === "noairguard") current.noAirGuard = true;
    if (flag.name === "unguardable") current.unguardable = true;
    if (flag.name === "noko" || flag.name === "globalnoko") current.noKo = true;
    if (flag.name === "nokoslow") current.noKoSlow = true;
    if (flag.name === "timerfreeze") current.timerFreeze = true;
    if (flag.name === "roundnotover") current.roundNotOver = true;
    if (flag.name === "intro") current.intro = true;
    if (flag.name === "nojugglecheck") current.noJuggleCheck = true;
    if (flag.name === "nogetupfromliedown") current.noGetUpFromLieDown = true;
    if (flag.name === "nofastrecoverfromliedown") current.noFastRecoverFromLieDown = true;
  }
  state.assertSpecial = current.flags.length > 0 || current.globalFlags.length > 0 ? current : undefined;
  if (state.assertSpecial?.invisible) {
    state.renderOpacity = 0;
  }
}

function normalizeAssertSpecialFlag(rawFlag: string): { name: string; global: boolean } | undefined {
  const name = rawFlag.trim().replace(/^"|"$/g, "").replace(/[^A-Za-z0-9_]/g, "").toLowerCase();
  if (!name) {
    return undefined;
  }
  const globalFlags = new Set([
    "intro",
    "globalnoko",
    "globalnoshadow",
    "nobardisplay",
    "nobg",
    "nofg",
    "nokoslow",
    "nokosnd",
    "nomusic",
    "roundnotover",
    "timerfreeze",
  ]);
  return { name, global: globalFlags.has(name) };
}

function addUnique(values: string[], value: string): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

function clampIndex(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function variableAssignmentParam(
  controller: ControllerExecutionSource,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext,
): RuntimeVariableAssignment | undefined {
  for (const [key, rawValue] of Object.entries(controller.params)) {
    const match = /^(sysvar|f?var)\((\d+)\)$/i.exec(key.trim());
    if (!match) {
      continue;
    }
    const value = evaluateNumber(rawValue.trim(), state, context);
    if (value === undefined) {
      continue;
    }
    return {
      variableType: match[1]?.toLowerCase() === "sysvar" ? "sysvar" : match[1]?.toLowerCase() === "fvar" ? "fvar" : "var",
      index: Number(match[2]),
      value,
    };
  }
  return undefined;
}

function evaluateNumber(
  raw: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): number | undefined {
  return evaluateRuntimeControllerNumber(raw, state, context);
}
