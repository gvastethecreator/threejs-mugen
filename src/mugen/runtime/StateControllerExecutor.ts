import { compileControllerIr } from "../compiler/StateControllerCompiler";
import type {
  BoundsControllerOp,
  CollisionControllerOp,
  DamageScaleControllerOp,
  HitEligibilityControllerOp,
  HitFallControllerOp,
  HitOverrideControllerOp,
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
import { applyRuntimeDamage, canRuntimeDamageKill } from "./CombatResolver";
import { evaluateExpression } from "./ExpressionEvaluator";
import {
  applyRuntimeLifeAdd,
  applyRuntimeResourceController,
  applyRuntimeVariableAssignment,
  applyRuntimeVariableRangeAssignment,
  type RuntimeVariableAssignment,
} from "./RuntimeResourceSystem";
import { applyRuntimeAngleController, applyRuntimeTransController } from "./SpriteEffectSystem";
import type { CharacterRuntimeState, RuntimeAssertSpecial, RuntimeHitBySlot, RuntimeHitOverrideSlot } from "./types";

type ControllerExecutionSource = Pick<ControllerIr, "type" | "normalizedType" | "params">;

export type RuntimeControllerEvaluationContext = {
  getConst?: (name: string) => number | undefined;
  hitPauseTime?: () => number;
  stageTime?: number;
};

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
    const value = numberParam(controller, next, context, "value", "stateno");
    if (value === undefined) {
      reportUnsupported(`${controller.type}:missing-value`);
      return next;
    }
    if (next.stateNo !== value) {
      next.prevStateNo = next.stateNo;
      next.prevAnimNo = next.animNo;
    }
    next.stateNo = value;
    next.animTime = 0;
    next.frameIndex = 0;
    const ctrl = numberParam(controller, next, context, "ctrl");
    if (ctrl !== undefined) {
      next.ctrl = ctrl !== 0;
    }
  } else if (type === "changeanim" || type === "changeanim2") {
    const value = numberParam(controller, next, context, "value", "anim");
    if (value !== undefined) {
      changeAnim(next, value, type === "changeanim2" ? "state-owner" : "self");
    }
  } else if (type === "velset") {
    const operation = kinematicOperation(controller, "velset");
    const pair = pairParam(controller, next, context, "value");
    const x = operation?.x ?? numberParam(controller, next, context, "x") ?? pair?.[0];
    const y = operation?.y ?? numberParam(controller, next, context, "y") ?? pair?.[1];
    next.vel = { x: x ?? next.vel.x, y: y ?? next.vel.y };
  } else if (type === "veladd") {
    const operation = kinematicOperation(controller, "veladd");
    const pair = pairParam(controller, next, context, "value");
    const x = operation?.x ?? numberParam(controller, next, context, "x") ?? pair?.[0] ?? 0;
    const y = operation?.y ?? numberParam(controller, next, context, "y") ?? pair?.[1] ?? 0;
    next.vel = { x: next.vel.x + x, y: next.vel.y + y };
  } else if (type === "velmul") {
    const operation = kinematicOperation(controller, "velmul");
    const pair = pairParam(controller, next, context, "value");
    const x = operation?.x ?? numberParam(controller, next, context, "x") ?? pair?.[0] ?? 1;
    const y = operation?.y ?? numberParam(controller, next, context, "y") ?? pair?.[1] ?? 1;
    next.vel = { x: next.vel.x * x, y: next.vel.y * y };
  } else if (type === "hitvelset") {
    const operation = kinematicOperation(controller, "hitvelset");
    const xFlag = operation?.x ?? numberParam(controller, next, context, "x") ?? 0;
    const yFlag = operation?.y ?? numberParam(controller, next, context, "y") ?? 0;
    if (next.hitVelocity && xFlag !== 0) {
      next.vel.x = next.hitVelocity.x;
    }
    if (next.hitVelocity && yFlag !== 0) {
      next.vel.y = next.hitVelocity.y;
    }
  } else if (type === "hitfallvel") {
    if (next.moveType === "H" && next.hitFall) {
      if (next.hitFall.velocity.x !== undefined) {
        next.vel.x = next.hitFall.velocity.x;
      }
      next.vel.y = next.hitFall.velocity.y;
    }
  } else if (type === "hitfalldamage") {
    if (next.moveType === "H" && next.hitFall && next.hitFall.damage > 0) {
      const defenceScale = next.hitFall.defenceUp === undefined ? 1 : Math.max(0, Math.min(10, next.hitFall.defenceUp / 100));
      const scaledDamage = Math.max(0, Math.round(next.hitFall.damage * defenceScale));
      next.life = applyRuntimeDamage(next.life, scaledDamage, canRuntimeDamageKill(next, next.hitFall.kill ?? true));
      next.hitFall = { ...next.hitFall, damage: 0 };
    }
  } else if (type === "hitfallset") {
    applyHitFallSet(next, controller, hitFallOperation(controller, "hitfallset"), context);
  } else if (type === "posset") {
    const operation = kinematicOperation(controller, "posset");
    const pair = pairParam(controller, next, context, "value");
    const x = operation?.x ?? numberParam(controller, next, context, "x") ?? pair?.[0];
    const y = operation?.y ?? numberParam(controller, next, context, "y") ?? pair?.[1];
    next.pos = { x: x ?? next.pos.x, y: y ?? next.pos.y };
  } else if (type === "posadd") {
    const operation = kinematicOperation(controller, "posadd");
    const pair = pairParam(controller, next, context, "value");
    const x = operation?.x ?? numberParam(controller, next, context, "x") ?? pair?.[0] ?? 0;
    const y = operation?.y ?? numberParam(controller, next, context, "y") ?? pair?.[1] ?? 0;
    next.pos = { x: next.pos.x + x, y: next.pos.y + y };
  } else if (type === "gravity") {
    const operation = kinematicOperation(controller, "gravity");
    next.vel = { ...next.vel, y: next.vel.y + (operation?.y ?? 0.55) };
  } else if (type === "ctrlset") {
    const operation = resourceOperation(controller, "ctrlset");
    applyRuntimeResourceController(next, {
      kind: "resource",
      controllerType: "ctrlset",
      value: operation?.value ?? (numberParam(controller, next, context, "value") ?? 0) !== 0,
    });
  } else if (type === "statetypeset") {
    applyStateTypeSet(next, controller, metadataOperation(controller, "statetypeset"));
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
  } else if (type === "varrangeset") {
    applyVariableRangeSet(next, controller, context, variableOperation(controller, "varrangeset"));
  } else if (type === "playerpush") {
    const operation = collisionOperation(controller, "playerpush");
    next.playerPush = operation?.enabled ?? (numberParam(controller, next, context, "value") ?? 1) !== 0;
  } else if (type === "turn") {
    const operation = orientationOperation(controller, "turn");
    if (controller.operation && !operation) {
      reportUnsupported(`${controller.type}:operation-mismatch`);
      return next;
    }
    next.facing = next.facing === 1 ? -1 : 1;
  } else if (type === "hitby" || type === "nothitby") {
    applyHitByController(next, controller, type === "hitby" ? "allow" : "deny", hitEligibilityOperation(controller, type));
  } else if (type === "hitoverride") {
    applyHitOverrideController(next, controller, hitOverrideOperation(controller));
  } else if (type === "defencemulset") {
    const operation = damageScaleOperation(controller, "defencemulset");
    const value = operation?.multiplier ?? numberParam(controller, next, context, "value");
    if (value !== undefined) {
      next.defenseMultiplier = Math.max(0, Math.min(10, value));
    }
  } else if (type === "attackmulset") {
    const operation = damageScaleOperation(controller, "attackmulset");
    const value = operation?.multiplier ?? numberParam(controller, next, context, "value");
    if (value !== undefined) {
      next.attackMultiplier = Math.max(0, Math.min(10, value));
    }
  } else if (type === "remappal") {
    applyRemapPalController(next, controller, spriteEffectOperation(controller, "remappal"));
  } else if (type === "trans") {
    applyRuntimeTransController(next, controller, spriteEffectOperation(controller, "trans"));
  } else if (type === "angleset" || type === "angleadd" || type === "angledraw") {
    applyRuntimeAngleController(next, controller, spriteEffectOperation(controller, type));
  } else if (type === "posfreeze") {
    const operation = boundsOperation(controller, "posfreeze");
    const value = operation ? undefined : numberParam(controller, next, context, "value");
    const x = operation ? undefined : numberParam(controller, next, context, "x");
    const y = operation ? undefined : numberParam(controller, next, context, "y");
    const freeze = value !== undefined ? value !== 0 : x === undefined && y === undefined;
    next.posFreeze = {
      x: operation?.x ?? (value !== undefined ? freeze : x !== undefined ? x !== 0 : freeze),
      y: operation?.y ?? (value !== undefined ? freeze : y !== undefined ? y !== 0 : freeze),
    };
  } else if (type === "screenbound") {
    const operation = boundsOperation(controller, "screenbound");
    const camera = operation ? undefined : pairParam(controller, next, context, "movecamera");
    next.screenBound = {
      bound: operation?.bound ?? ((numberParam(controller, next, context, "value") ?? 0) !== 0),
      moveCameraX: operation?.moveCameraX ?? ((camera?.[0] ?? 0) !== 0),
      moveCameraY: operation?.moveCameraY ?? ((camera?.[1] ?? 0) !== 0),
    };
  } else if (type === "assertspecial") {
    applyAssertSpecialController(next, controller);
  } else if (
    type === "hitdef" ||
    type === "width" ||
    type === "fallenvshake" ||
    type === "forcefeedback" ||
    type === "displaytoclipboard" ||
    type === "appendtoclipboard" ||
    type === "clearclipboard" ||
    type === "makedust" ||
    type === "playsnd" ||
    type === "stopsnd" ||
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

function applyHitFallSet(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  operation?: HitFallControllerOp,
  context: RuntimeControllerEvaluationContext = {},
): void {
  const current = state.hitFall ?? {
    falling: false,
    damage: 0,
    velocity: { y: -4.5 },
  };
  const value =
    operation?.controllerType === "hitfallset" && operation.falling !== undefined
      ? operation.falling
        ? 1
        : 0
      : numberParam(controller, state, context, "value");
  const x =
    operation?.controllerType === "hitfallset"
      ? operation.xVelocity ?? numberParam(controller, state, context, "xvel", "x")
      : numberParam(controller, state, context, "xvel", "x");
  const y =
    operation?.controllerType === "hitfallset"
      ? operation.yVelocity ?? numberParam(controller, state, context, "yvel", "y")
      : numberParam(controller, state, context, "yvel", "y");
  state.hitFall = {
    ...current,
    falling: value !== undefined ? value !== 0 : current.falling,
    velocity: {
      x: x ?? current.velocity.x,
      y: y ?? current.velocity.y,
    },
  };
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

function hitEligibilityOperation<T extends HitEligibilityControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): Extract<HitEligibilityControllerOp, { controllerType: T }> | undefined {
  return controller.operation?.kind === "eligibility" && controller.operation.controllerType === controllerType
    ? (controller.operation as Extract<HitEligibilityControllerOp, { controllerType: T }>)
    : undefined;
}

function hitOverrideOperation(controller: ControllerIr): HitOverrideControllerOp | undefined {
  return controller.operation?.kind === "hitoverride" ? controller.operation : undefined;
}

function damageScaleOperation<T extends DamageScaleControllerOp["controllerType"]>(
  controller: ControllerIr,
  controllerType: T,
): DamageScaleControllerOp | undefined {
  return controller.operation?.kind === "damage-scale" && controller.operation.controllerType === controllerType
    ? controller.operation
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

function applyRemapPalController(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  operation?: Extract<SpriteEffectControllerOp, { controllerType: "remappal" }>,
): void {
  const source = operation?.source ?? pairParam(controller, state, "source");
  const dest = operation?.dest ?? pairParam(controller, state, "dest");
  if (!source || !dest) {
    return;
  }
  state.paletteRemap = {
    source: [Math.max(0, Math.round(source[0])), Math.max(0, Math.round(source[1]))],
    dest: [Math.max(0, Math.round(dest[0])), Math.max(0, Math.round(dest[1]))],
  };
}

function changeAnim(state: CharacterRuntimeState, anim: number, source: NonNullable<CharacterRuntimeState["animationSource"]>): void {
  state.animNo = anim;
  state.frameIndex = 0;
  state.animTime = 0;
  state.animationSource = source;
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
    return evaluateNumber(raw.split(",")[0]?.trim(), state, context);
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

function applyHitByController(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  mode: RuntimeHitBySlot["mode"],
  operation?: HitEligibilityControllerOp,
): void {
  const hitBy = { ...(state.hitBy ?? {}) };
  if (operation) {
    for (const slot of operation.slots) {
      if (slot.slot === 1) {
        hitBy.slot1 = { mode: operation.mode, attr: slot.attr, remaining: slot.remaining };
      } else {
        hitBy.slot2 = { mode: operation.mode, attr: slot.attr, remaining: slot.remaining };
      }
    }
    state.hitBy = hitBy;
    return;
  }
  const time = controllerDuration(numberParam(controller, state, "time") ?? 1);
  const value = findParam(controller, "value");
  const value2 = findParam(controller, "value2");
  if (value !== undefined) {
    hitBy.slot1 = { mode, attr: value.trim(), remaining: time };
  }
  if (value2 !== undefined) {
    hitBy.slot2 = { mode, attr: value2.trim(), remaining: time };
  }
  state.hitBy = hitBy;
}

function applyHitOverrideController(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  operation?: HitOverrideControllerOp,
): void {
  const slot = operation?.slot ?? clampIndex(Math.round(numberParam(controller, state, "slot") ?? 0), 7);
  const attr = operation?.attr ?? findParam(controller, "attr")?.trim() ?? "";
  const remaining = operation?.remaining ?? controllerDuration(numberParam(controller, state, "time") ?? 1);
  const overrides = (state.hitOverrides ?? []).filter((entry) => entry.slot !== slot);

  if (!attr || remaining <= 0) {
    state.hitOverrides = overrides.length > 0 ? overrides : undefined;
    return;
  }

  const stateNo = numberParam(controller, state, "stateno", "value");
  const next: RuntimeHitOverrideSlot = {
    slot,
    attr,
    remaining,
    forceAir: operation?.forceAir ?? ((numberParam(controller, state, "forceair") ?? 0) !== 0),
    forceGuard: operation?.forceGuard ?? ((numberParam(controller, state, "forceguard") ?? 0) !== 0),
    keepState: operation?.keepState ?? ((numberParam(controller, state, "keepstate") ?? 0) !== 0),
  };
  const targetStateNo = operation?.stateNo ?? stateNo;
  if (targetStateNo !== undefined && targetStateNo >= 0) {
    next.stateNo = targetStateNo;
  }

  state.hitOverrides = [...overrides, next].sort((a, b) => a.slot - b.slot);
}

function applyAssertSpecialController(state: CharacterRuntimeState, controller: ControllerExecutionSource): void {
  const enabled = (numberParam(controller, state, "value", "enabled") ?? 1) !== 0;
  const rawFlags = Object.entries(controller.params)
    .filter(([key]) => key.toLowerCase().startsWith("flag"))
    .flatMap(([, value]) => value.split(",").map((part) => part.trim()))
    .filter(Boolean);
  if (!enabled || rawFlags.length === 0) {
    return;
  }
  const current: RuntimeAssertSpecial = state.assertSpecial
    ? {
        ...state.assertSpecial,
        flags: [...state.assertSpecial.flags],
        globalFlags: [...state.assertSpecial.globalFlags],
      }
    : { flags: [], globalFlags: [] };

  for (const rawFlag of rawFlags) {
    const flag = normalizeAssertSpecialFlag(rawFlag);
    if (!flag) {
      continue;
    }
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
    if (flag.name === "intro") current.intro = true;
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

function controllerDuration(value: number): number {
  if (value < 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Math.min(3600, Math.round(value)));
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
    const value = evaluateNumber(rawValue.split(",")[0]?.trim(), state, context);
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
  if (!raw) {
    return undefined;
  }
  const direct = Number(raw);
  if (Number.isFinite(direct)) {
    return direct;
  }
  const evaluated = evaluateExpression(raw, {
    self: state,
    getConst: context.getConst,
    getHitVar: (name) => runtimeHitVar(state, name),
    hitPauseTime: context.hitPauseTime,
    stageTime: context.stageTime,
  });
  const value = Number(evaluated);
  return Number.isFinite(value) ? value : undefined;
}

function runtimeHitVar(state: CharacterRuntimeState, name: string): number | undefined {
  const key = name.trim().toLowerCase();
  if (key === "animtype") {
    return state.hitVars?.animType ?? 0;
  }
  if (key === "groundtype") {
    return state.hitVars?.groundType ?? 0;
  }
  if (key === "airtype") {
    return state.hitVars?.airType ?? 0;
  }
  if (key === "isbound") {
    return state.hitVars?.isBound ? 1 : 0;
  }
  if (key === "fall") {
    return state.hitFall?.falling ? 1 : 0;
  }
  if (key === "fall.damage") {
    return state.hitFall?.damage ?? 0;
  }
  if (key === "fall.defence_up") {
    return state.hitFall?.defenceUp ?? 100;
  }
  if (key === "fall.kill") {
    return state.hitFall?.kill === false ? 0 : 1;
  }
  if (key === "fall.xvel" || key === "fall.xvelocity") {
    return state.hitFall?.velocity.x ?? 0;
  }
  if (key === "fall.yvel" || key === "fall.yvelocity") {
    return state.hitFall?.velocity.y ?? 0;
  }
  if (key === "fall.recover") {
    return state.hitFall?.recover && (state.hitFall.recoverTime ?? 0) <= 0 ? 1 : 0;
  }
  if (key === "fall.recovertime") {
    return state.hitFall?.recoverTime ?? 0;
  }
  if (key === "down.recover") {
    return state.hitFall?.downRecover === false ? 0 : 1;
  }
  if (key === "recovertime" || key === "down.recovertime") {
    return state.hitFall?.downRecoverTime ?? 0;
  }
  if (key === "yaccel") {
    return 0.44;
  }
  if (key === "fall.envshake.time") {
    return state.hitFall?.envShake?.time ?? 0;
  }
  if (key === "fall.envshake.freq") {
    return state.hitFall?.envShake?.freq ?? 60;
  }
  if (key === "fall.envshake.ampl") {
    return state.hitFall?.envShake?.ampl ?? 0;
  }
  if (key === "fall.envshake.phase") {
    return state.hitFall?.envShake?.phase ?? 0;
  }
  if (key === "xvel") {
    return state.hitVelocity?.x ?? 0;
  }
  if (key === "yvel") {
    return state.hitVelocity?.y ?? 0;
  }
  if (key === "hittime") {
    return state.guardStun ?? 0;
  }
  if (key === "slidetime") {
    return state.guardSlideTime ?? 0;
  }
  if (key === "ctrltime") {
    return state.guardControlTime ?? 0;
  }
  return undefined;
}

function applyStateTypeSet(
  state: CharacterRuntimeState,
  controller: ControllerExecutionSource,
  operation?: MetadataControllerOp,
): void {
  const stateType = operation?.stateType ?? enumParam(controller, "statetype", "stateType");
  const moveType = operation?.moveType ?? enumParam(controller, "movetype", "moveType");
  const physics = operation?.physics ?? enumParam(controller, "physics");
  if (stateType === "S" || stateType === "C" || stateType === "A" || stateType === "L") {
    state.stateType = stateType;
  }
  if (moveType === "I" || moveType === "A" || moveType === "H") {
    state.moveType = moveType;
  }
  if (physics === "S" || physics === "C" || physics === "A" || physics === "N") {
    state.physics = physics;
  }
}

function enumParam(controller: ControllerExecutionSource, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = findParam(controller, key);
    if (raw) {
      return raw.trim().toUpperCase();
    }
  }
  return undefined;
}
