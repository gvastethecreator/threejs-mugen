import type { MugenStateController } from "../model/MugenState";

export type HitDefControllerOp = {
  kind: "hitdef";
  id?: number;
  attr?: string;
  damage?: number;
  guardDamage?: number;
  pauseTime?: number;
  groundHitTime?: number;
  groundVelocity?: [number, number?];
  guardDistance?: number;
  guardFlag?: string;
  guardPauseTime?: number;
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guardVelocity?: [number, number?];
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  fall: HitDefFallOp;
};

export type HitDefFallOp = {
  enabled?: boolean;
  xVelocity?: number;
  yVelocity?: number;
  damage?: number;
  recover?: boolean;
  recoverTime?: number;
  downRecover?: boolean;
  downRecoverTime?: number;
  envShakeTime?: number;
  envShakeFrequency?: number;
  envShakeAmplitude?: number;
  envShakePhase?: number;
};

export type TargetControllerOp =
  | { kind: "target"; controllerType: "targetdrop"; requestedId?: number; keepOne: boolean }
  | { kind: "target"; controllerType: "targetlifeadd"; requestedId?: number; value: number; absolute: boolean; kill: boolean }
  | { kind: "target"; controllerType: "targetpoweradd"; requestedId?: number; value: number }
  | { kind: "target"; controllerType: "targetfacing"; requestedId?: number; value: number }
  | { kind: "target"; controllerType: "targetveladd"; requestedId?: number; x: number; y: number }
  | { kind: "target"; controllerType: "targetvelset"; requestedId?: number; x?: number; y?: number }
  | { kind: "target"; controllerType: "targetbind"; requestedId?: number; pos: [number, number]; time: number }
  | { kind: "target"; controllerType: "targetstate"; requestedId?: number; stateNo?: number };

export type PauseControllerOp = {
  kind: "pause";
  controllerType: "pause" | "superpause";
  time: number;
  moveTime: number;
  darken: boolean;
  powerAdd: number;
};

export type ProjectileControllerOp = {
  kind: "projectile";
  projectileId?: number;
  projAnim?: number;
  offset?: [number, number];
  pos?: [number, number];
  postype?: string;
  velocity: [number, number];
  facing?: number;
  removeTime: number;
  spritePriority: number;
  priority: number;
  trans?: string;
  damage: number;
  attr?: string;
  hitPause: number;
  hitStun: number;
  groundVelocity?: [number, number?];
  guardDamage?: number;
  guardDistance?: number;
  guardFlag?: string;
  guardPauseTime?: number;
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guardVelocity?: [number, number?];
  removeOnHit: boolean;
};

export type HelperControllerOp = {
  kind: "helper";
  helperId?: number;
  name?: string;
  stateNo?: number;
  animNo?: number;
  pos?: [number, number];
  postype?: string;
  facing?: number;
  removeTime: number;
  spritePriority: number;
};

export type ExplodControllerOp = {
  kind: "explod";
  explodId?: number;
  animNo?: number;
  pos?: [number, number];
  postype?: string;
  facing?: number;
  removeTime?: number;
  spritePriority: number;
  trans?: string;
};

export type RemoveExplodControllerOp = {
  kind: "removeexplod";
  explodId?: number;
};

export type HitFallControllerOp =
  | {
      kind: "hitfall";
      controllerType: "hitfallvel" | "hitfalldamage";
    }
  | {
      kind: "hitfall";
      controllerType: "hitfallset";
      falling?: boolean;
      xVelocity?: number;
      yVelocity?: number;
    };

export type FallEnvShakeControllerOp = {
  kind: "fallenvshake";
};

export type ControllerOp =
  | HitDefControllerOp
  | TargetControllerOp
  | PauseControllerOp
  | ProjectileControllerOp
  | HelperControllerOp
  | ExplodControllerOp
  | RemoveExplodControllerOp
  | HitFallControllerOp
  | FallEnvShakeControllerOp;

export function compileControllerOp(controller: MugenStateController): ControllerOp | undefined {
  const type = controller.type.toLowerCase();
  if (type === "hitdef") {
    return compileHitDefControllerOp(controller);
  }
  if (type.startsWith("target")) {
    return compileTargetControllerOp(controller);
  }
  if (type === "pause" || type === "superpause") {
    return compilePauseControllerOp(controller, type);
  }
  if (type === "projectile") {
    return compileProjectileControllerOp(controller);
  }
  if (type === "helper") {
    return compileHelperControllerOp(controller);
  }
  if (type === "explod") {
    return compileExplodControllerOp(controller);
  }
  if (type === "removeexplod") {
    return compileRemoveExplodControllerOp(controller);
  }
  if (type === "hitfallvel" || type === "hitfalldamage" || type === "hitfallset") {
    return compileHitFallControllerOp(controller, type);
  }
  if (type === "fallenvshake") {
    return { kind: "fallenvshake" };
  }
  return undefined;
}

function compileHitDefControllerOp(controller: MugenStateController): HitDefControllerOp {
  const damage = numberPair(findParam(controller, "damage"));
  const groundVelocity = numberPair(findParam(controller, "ground.velocity"));
  const guardVelocity = numberPair(findParam(controller, "guard.velocity"));
  const p2StateNo = firstNumber(findParam(controller, "p2stateno"));
  return definedObject({
    kind: "hitdef" as const,
    id: firstNumber(findParam(controller, "id")),
    attr: stripMugenString(findParam(controller, "attr")),
    damage: damage?.[0],
    guardDamage: damage?.[1],
    pauseTime: firstNumber(findParam(controller, "pausetime")),
    groundHitTime: firstNumber(findParam(controller, "ground.hittime")),
    groundVelocity,
    guardDistance: firstNumber(findParam(controller, "guard.dist")),
    guardFlag: stripMugenString(findParam(controller, "guardflag")),
    guardPauseTime: firstNumber(findParam(controller, "guard.pausetime")),
    guardHitTime: firstNumber(findParam(controller, "guard.hittime")),
    guardSlideTime: firstNumber(findParam(controller, "guard.slidetime")),
    guardControlTime: firstNumber(findParam(controller, "guard.ctrltime")),
    guardVelocity,
    p1StateNo: firstNumber(findParam(controller, "p1stateno")),
    p2StateNo,
    p2GetP1State: p2StateNo !== undefined ? (firstNumber(findParam(controller, "p2getp1state")) ?? 1) !== 0 : undefined,
    fall: compileHitDefFallOp(controller),
  });
}

function compileHitDefFallOp(controller: MugenStateController): HitDefFallOp {
  return definedObject({
    enabled: booleanNumber(findParam(controller, "fall")),
    xVelocity: firstNumber(findParam(controller, "fall.xvelocity")),
    yVelocity: firstNumber(findParam(controller, "fall.yvelocity")),
    damage: firstNumber(findParam(controller, "fall.damage")),
    recover: booleanNumber(findParam(controller, "fall.recover")),
    recoverTime: firstNumber(findParam(controller, "fall.recovertime")),
    downRecover: booleanNumber(findParam(controller, "down.recover")),
    downRecoverTime: firstNumber(findParam(controller, "down.recovertime")),
    envShakeTime: firstNumber(findParam(controller, "fall.envshake.time")),
    envShakeFrequency: firstNumber(findParam(controller, "fall.envshake.freq")),
    envShakeAmplitude: firstNumber(findParam(controller, "fall.envshake.ampl")),
    envShakePhase: firstNumber(findParam(controller, "fall.envshake.phase")),
  });
}

function compileTargetControllerOp(controller: MugenStateController): TargetControllerOp | undefined {
  const type = controller.type.toLowerCase();
  const requestedId = firstNumber(findParam(controller, "id"));
  if (type === "targetdrop") {
    return { kind: "target", controllerType: "targetdrop", requestedId, keepOne: (firstNumber(findParam(controller, "keepone")) ?? 1) !== 0 };
  }
  if (type === "targetlifeadd") {
    return {
      kind: "target",
      controllerType: "targetlifeadd",
      requestedId,
      value: firstNumber(findParam(controller, "value")) ?? 0,
      absolute: (firstNumber(findParam(controller, "absolute")) ?? 0) !== 0,
      kill: (firstNumber(findParam(controller, "kill")) ?? 1) !== 0,
    };
  }
  if (type === "targetpoweradd") {
    return { kind: "target", controllerType: "targetpoweradd", requestedId, value: firstNumber(findParam(controller, "value")) ?? 0 };
  }
  if (type === "targetfacing") {
    return { kind: "target", controllerType: "targetfacing", requestedId, value: firstNumber(findParam(controller, "value")) ?? 1 };
  }
  if (type === "targetveladd") {
    return {
      kind: "target",
      controllerType: "targetveladd",
      requestedId,
      x: firstNumber(findParam(controller, "x")) ?? 0,
      y: firstNumber(findParam(controller, "y")) ?? 0,
    };
  }
  if (type === "targetvelset") {
    return definedObject({
      kind: "target" as const,
      controllerType: "targetvelset" as const,
      requestedId,
      x: firstNumber(findParam(controller, "x")),
      y: firstNumber(findParam(controller, "y")),
    });
  }
  if (type === "targetbind") {
    return {
      kind: "target",
      controllerType: "targetbind",
      requestedId,
      pos: pairWithDefault(numberPair(findParam(controller, "pos"))),
      time: firstNumber(findParam(controller, "time")) ?? 1,
    };
  }
  if (type === "targetstate") {
    return { kind: "target", controllerType: "targetstate", requestedId, stateNo: firstNumber(findParam(controller, "value")) };
  }
  return undefined;
}

function compilePauseControllerOp(controller: MugenStateController, type: "pause" | "superpause"): PauseControllerOp {
  return {
    kind: "pause",
    controllerType: type,
    time: firstNumber(findParam(controller, "time")) ?? 0,
    moveTime: firstNumber(findParam(controller, "movetime")) ?? 0,
    darken: type === "superpause" ? (firstNumber(findParam(controller, "darken")) ?? 1) !== 0 : false,
    powerAdd: type === "superpause" ? firstNumber(findParam(controller, "poweradd")) ?? 0 : 0,
  };
}

function compileProjectileControllerOp(controller: MugenStateController): ProjectileControllerOp {
  return definedObject({
    kind: "projectile" as const,
    projectileId: firstNumber(findParam(controller, "projid") ?? findParam(controller, "id")),
    projAnim: firstNumber(findParam(controller, "projanim") ?? findParam(controller, "anim")),
    offset: pairWithDefaultOrUndefined(numberPair(findParam(controller, "offset"))),
    pos: pairWithDefaultOrUndefined(numberPair(findParam(controller, "pos"))),
    postype: stripMugenString(findParam(controller, "postype")),
    velocity: pairWithDefault(numberPair(findParam(controller, "velocity") ?? findParam(controller, "vel"))),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "projremovetime") ?? findParam(controller, "removetime")) ?? -1,
    spritePriority: firstNumber(findParam(controller, "sprpriority")) ?? 4,
    priority: firstNumber(findParam(controller, "projpriority") ?? findParam(controller, "priority")) ?? 1,
    trans: stripMugenString(findParam(controller, "trans")),
    damage: firstNumber(findParam(controller, "damage")) ?? 30,
    attr: stripMugenString(findParam(controller, "attr")),
    hitPause: firstNumber(findParam(controller, "pausetime")) ?? 6,
    hitStun: firstNumber(findParam(controller, "ground.hittime")) ?? 18,
    groundVelocity: numberPair(findParam(controller, "ground.velocity")),
    guardDamage: secondNumber(findParam(controller, "damage")),
    guardDistance: firstNumber(findParam(controller, "guard.dist")),
    guardFlag: stripMugenString(findParam(controller, "guardflag")),
    guardPauseTime: firstNumber(findParam(controller, "guard.pausetime")),
    guardHitTime: firstNumber(findParam(controller, "guard.hittime")),
    guardSlideTime: firstNumber(findParam(controller, "guard.slidetime")),
    guardControlTime: firstNumber(findParam(controller, "guard.ctrltime")),
    guardVelocity: numberPair(findParam(controller, "guard.velocity")),
    removeOnHit: (firstNumber(findParam(controller, "projremove")) ?? 1) !== 0,
  });
}

function compileHelperControllerOp(controller: MugenStateController): HelperControllerOp {
  return definedObject({
    kind: "helper" as const,
    helperId: firstNumber(findParam(controller, "id")),
    name: stripMugenString(findParam(controller, "name")),
    stateNo: firstNumber(findParam(controller, "stateno") ?? findParam(controller, "value")),
    animNo: firstNumber(findParam(controller, "anim")),
    pos: pairWithDefaultOrUndefined(numberPair(findParam(controller, "pos"))),
    postype: stripMugenString(findParam(controller, "postype")),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "removetime")) ?? 180,
    spritePriority: firstNumber(findParam(controller, "sprpriority")) ?? 3,
  });
}

function compileExplodControllerOp(controller: MugenStateController): ExplodControllerOp {
  return definedObject({
    kind: "explod" as const,
    explodId: firstNumber(findParam(controller, "id")),
    animNo: firstNumber(findParam(controller, "anim")),
    pos: pairWithDefaultOrUndefined(numberPair(findParam(controller, "pos"))),
    postype: stripMugenString(findParam(controller, "postype")),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "removetime")),
    spritePriority: firstNumber(findParam(controller, "sprpriority")) ?? 3,
    trans: stripMugenString(findParam(controller, "trans")),
  });
}

function compileRemoveExplodControllerOp(controller: MugenStateController): RemoveExplodControllerOp {
  return definedObject({
    kind: "removeexplod" as const,
    explodId: firstNumber(findParam(controller, "id")),
  });
}

function compileHitFallControllerOp(
  controller: MugenStateController,
  type: "hitfallvel" | "hitfalldamage" | "hitfallset",
): HitFallControllerOp {
  if (type === "hitfallset") {
    return definedObject({
      kind: "hitfall" as const,
      controllerType: "hitfallset" as const,
      falling: booleanNumber(findParam(controller, "value")),
      xVelocity: firstNumber(findParam(controller, "xvel") ?? findParam(controller, "x")),
      yVelocity: firstNumber(findParam(controller, "yvel") ?? findParam(controller, "y")),
    });
  }
  return { kind: "hitfall", controllerType: type };
}

function findParam(controller: MugenStateController, key: string): string | undefined {
  const lower = key.toLowerCase();
  return Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower)?.[1];
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function secondNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[1]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function numberPair(value: string | undefined): [number, number?] | undefined {
  if (!value) {
    return undefined;
  }
  const values = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter(Number.isFinite);
  if (values.length === 0 || values[0] === undefined) {
    return undefined;
  }
  return values.length > 1 ? [values[0], values[1]] : [values[0]];
}

function pairWithDefault(value: [number, number?] | undefined): [number, number] {
  return [value?.[0] ?? 0, value?.[1] ?? 0];
}

function pairWithDefaultOrUndefined(value: [number, number?] | undefined): [number, number] | undefined {
  return value ? pairWithDefault(value) : undefined;
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

function booleanNumber(value: string | undefined): boolean | undefined {
  const numberValue = firstNumber(value);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

function definedObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}
