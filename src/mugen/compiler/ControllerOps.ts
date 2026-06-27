import type { MugenStateController } from "../model/MugenState";

export type HitDefControllerOp = {
  kind: "hitdef";
  id?: number;
  attr?: string;
  damage?: number;
  guardDamage?: number;
  kill?: boolean;
  guardKill?: boolean;
  priority?: number;
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
  kill?: boolean;
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
  | { kind: "target"; controllerType: "targetdrop"; excludeId?: number; keepOne: boolean }
  | { kind: "target"; controllerType: "targetlifeadd"; requestedId?: number; value: number; absolute: boolean; kill: boolean }
  | { kind: "target"; controllerType: "targetpoweradd"; requestedId?: number; value: number }
  | { kind: "target"; controllerType: "targetfacing"; requestedId?: number; value: number }
  | { kind: "target"; controllerType: "targetveladd"; requestedId?: number; x: number; y: number }
  | { kind: "target"; controllerType: "targetvelset"; requestedId?: number; x?: number; y?: number }
  | { kind: "target"; controllerType: "targetbind"; requestedId?: number; pos: [number, number]; time: number }
  | { kind: "target"; controllerType: "targetstate"; requestedId?: number; stateNo?: number };

export type BindToTargetControllerOp = {
  kind: "bindtotarget";
  requestedId?: number;
  pos: [number, number];
  postype: "foot" | "mid" | "head";
  time: number;
};

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
  acceleration?: [number, number];
  velocityMultiplier?: [number, number];
  scale?: [number, number];
  facing?: number;
  hitAnim?: number;
  removeAnim?: number;
  cancelAnim?: number;
  removeTime: number;
  spritePriority: number;
  priority: number;
  hitCount: number;
  missTime: number;
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
  velocity?: [number, number];
  scale?: [number, number];
  postype?: string;
  facing?: number;
  removeTime: number;
  ignoreHitPause: boolean;
  pauseMoveTime?: number;
  superMoveTime?: number;
  spritePriority: number;
};

export type ExplodControllerOp = {
  kind: "explod";
  explodId?: number;
  animNo?: number;
  pos?: [number, number];
  postype?: string;
  bindTime?: number;
  scale?: [number, number];
  velocity?: [number, number];
  acceleration?: [number, number];
  facing?: number;
  removeTime?: number;
  removeOnGetHit: boolean;
  ignoreHitPause: boolean;
  pauseMoveTime?: number;
  superMoveTime?: number;
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

export type MovementKinematicControllerOp = {
  kind: "kinematic";
  controllerType: "velset" | "veladd" | "velmul" | "hitvelset" | "posset" | "posadd";
  x?: number;
  y?: number;
};

export type GravityKinematicControllerOp = {
  kind: "kinematic";
  controllerType: "gravity";
  y: number;
};

export type KinematicControllerOp = MovementKinematicControllerOp | GravityKinematicControllerOp;

export type BoundsControllerOp =
  | {
      kind: "bounds";
      controllerType: "posfreeze";
      x: boolean;
      y: boolean;
    }
  | {
      kind: "bounds";
      controllerType: "screenbound";
      bound: boolean;
      moveCameraX: boolean;
      moveCameraY: boolean;
    };

export type CollisionControllerOp =
  | {
      kind: "collision";
      controllerType: "width";
      front: number;
      back: number;
    }
  | {
      kind: "collision";
      controllerType: "playerpush";
      enabled: boolean;
    };

export type MetadataControllerOp = {
  kind: "metadata";
  controllerType: "statetypeset";
  stateType?: "S" | "C" | "A" | "L";
  moveType?: "I" | "A" | "H";
  physics?: "S" | "C" | "A" | "N";
};

export type OrientationControllerOp = {
  kind: "orientation";
  controllerType: "turn";
};

export type SpriteEffectControllerOp =
  | {
      kind: "sprite-effect";
      controllerType: "sprpriority";
      priority: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "palfx";
      time: number;
      add: [number, number, number];
      mul: [number, number, number];
      color: number;
      invert: boolean;
    }
  | {
      kind: "sprite-effect";
      controllerType: "remappal";
      source: [number, number];
      dest: [number, number];
    }
  | {
      kind: "sprite-effect";
      controllerType: "afterimage";
      time: number;
      length: number;
      timeGap: number;
      frameGap: number;
      palAdd: [number, number, number];
      palMul: [number, number, number];
      opacity: number;
    }
  | {
      kind: "sprite-effect";
      controllerType: "afterimagetime";
      time: number;
    };

export type ResourceControllerOp =
  | { kind: "resource"; controllerType: "ctrlset"; value: boolean }
  | { kind: "resource"; controllerType: "lifeadd"; value: number; kill?: boolean }
  | { kind: "resource"; controllerType: "lifeset"; value: number }
  | { kind: "resource"; controllerType: "poweradd"; value: number }
  | { kind: "resource"; controllerType: "powerset"; value: number };

export type VariableControllerOp =
  | {
      kind: "variable";
      controllerType: "varset";
      variableType: "var" | "fvar" | "sysvar";
      index: number;
      value: number;
    }
  | {
      kind: "variable";
      controllerType: "varadd";
      variableType: "var" | "fvar" | "sysvar";
      index: number;
      value: number;
    }
  | {
      kind: "variable";
      controllerType: "varrangeset";
      variableType: "var" | "fvar";
      first: number;
      last: number;
      value: number;
    };

export type HitEligibilityControllerOp = {
  kind: "eligibility";
  controllerType: "hitby" | "nothitby";
  mode: "allow" | "deny";
  slots: Array<{ slot: 1 | 2; attr: string; remaining: number }>;
};

export type HitOverrideControllerOp = {
  kind: "hitoverride";
  slot: number;
  attr: string;
  remaining: number;
  stateNo?: number;
  forceAir: boolean;
  forceGuard: boolean;
  keepState: boolean;
};

export type ReversalDefControllerOp = {
  kind: "reversaldef";
  attr: string;
  hitPause: number;
  p1StateNo?: number;
  p2StateNo?: number;
  targetId?: number;
};

export type DamageScaleControllerOp = {
  kind: "damage-scale";
  controllerType: "attackmulset" | "defencemulset";
  multiplier: number;
};

export type ControllerOp =
  | HitDefControllerOp
  | TargetControllerOp
  | BindToTargetControllerOp
  | PauseControllerOp
  | ProjectileControllerOp
  | HelperControllerOp
  | ExplodControllerOp
  | RemoveExplodControllerOp
  | HitFallControllerOp
  | FallEnvShakeControllerOp
  | KinematicControllerOp
  | BoundsControllerOp
  | CollisionControllerOp
  | MetadataControllerOp
  | OrientationControllerOp
  | SpriteEffectControllerOp
  | ResourceControllerOp
  | VariableControllerOp
  | HitEligibilityControllerOp
  | HitOverrideControllerOp
  | ReversalDefControllerOp
  | DamageScaleControllerOp;

export function compileControllerOp(controller: MugenStateController): ControllerOp | undefined {
  const type = controller.type.toLowerCase();
  if (isKinematicController(type)) {
    return compileKinematicControllerOp(controller, type);
  }
  if (type === "posfreeze" || type === "screenbound") {
    return compileBoundsControllerOp(controller, type);
  }
  if (type === "width") {
    return compileWidthControllerOp(controller);
  }
  if (type === "playerpush") {
    return compilePlayerPushControllerOp(controller);
  }
  if (type === "statetypeset") {
    return compileStateTypeSetControllerOp(controller);
  }
  if (type === "turn") {
    return { kind: "orientation", controllerType: "turn" };
  }
  if (type === "sprpriority") {
    return compileSprPriorityControllerOp(controller);
  }
  if (type === "palfx") {
    return compilePalFxControllerOp(controller);
  }
  if (type === "remappal") {
    return compileRemapPalControllerOp(controller);
  }
  if (type === "afterimage") {
    return compileAfterImageControllerOp(controller);
  }
  if (type === "afterimagetime") {
    return compileAfterImageTimeControllerOp(controller);
  }
  if (isResourceController(type)) {
    return compileResourceControllerOp(controller, type);
  }
  if (isVariableController(type)) {
    return compileVariableControllerOp(controller, type);
  }
  if (type === "hitby" || type === "nothitby") {
    return compileHitEligibilityControllerOp(controller, type);
  }
  if (type === "hitoverride") {
    return compileHitOverrideControllerOp(controller);
  }
  if (type === "reversaldef") {
    return compileReversalDefControllerOp(controller);
  }
  if (type === "attackmulset" || type === "defencemulset") {
    return compileDamageScaleControllerOp(controller, type);
  }
  if (type === "hitdef") {
    return compileHitDefControllerOp(controller);
  }
  if (type.startsWith("target")) {
    return compileTargetControllerOp(controller);
  }
  if (type === "bindtotarget") {
    return compileBindToTargetControllerOp(controller);
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

function isKinematicController(type: string): type is KinematicControllerOp["controllerType"] {
  return (
    type === "velset" ||
    type === "veladd" ||
    type === "velmul" ||
    type === "hitvelset" ||
    type === "posset" ||
    type === "posadd" ||
    type === "gravity"
  );
}

function compileKinematicControllerOp(controller: MugenStateController, type: KinematicControllerOp["controllerType"]): KinematicControllerOp | undefined {
  if (type === "gravity") {
    return { kind: "kinematic", controllerType: "gravity", y: 0.55 };
  }
  const pair = strictNumberPair(findParam(controller, "value"));
  const op = definedObject({
    kind: "kinematic" as const,
    controllerType: type,
    x: firstNumber(findParam(controller, "x")) ?? pair?.[0],
    y: firstNumber(findParam(controller, "y")) ?? pair?.[1],
  });
  return op.x === undefined && op.y === undefined ? undefined : op;
}

function compileBoundsControllerOp(controller: MugenStateController, type: BoundsControllerOp["controllerType"]): BoundsControllerOp | undefined {
  if (type === "posfreeze") {
    const valueRaw = findParam(controller, "value");
    const xRaw = findParam(controller, "x");
    const yRaw = findParam(controller, "y");
    const value = optionalBooleanParam(valueRaw);
    const x = optionalBooleanParam(xRaw);
    const y = optionalBooleanParam(yRaw);
    if (value === "invalid" || x === "invalid" || y === "invalid") {
      return undefined;
    }
    const freeze = value === undefined ? x === undefined && y === undefined : value;
    return {
      kind: "bounds",
      controllerType: "posfreeze",
      x: value === undefined ? x ?? freeze : freeze,
      y: value === undefined ? y ?? freeze : freeze,
    };
  }

  const valueRaw = findParam(controller, "value");
  const moveCameraRaw = findParam(controller, "movecamera");
  const value = valueRaw === undefined ? 0 : firstNumber(valueRaw);
  const moveCamera = moveCameraRaw === undefined ? undefined : strictNumberPair(moveCameraRaw);
  if (value === undefined || (moveCameraRaw !== undefined && moveCamera === undefined)) {
    return undefined;
  }
  return {
    kind: "bounds",
    controllerType: "screenbound",
    bound: value !== 0,
    moveCameraX: (moveCamera?.[0] ?? 0) !== 0,
    moveCameraY: (moveCamera?.[1] ?? 0) !== 0,
  };
}

function compileWidthControllerOp(controller: MugenStateController): CollisionControllerOp | undefined {
  const pair = strictNumberPair(findParam(controller, "player") ?? findParam(controller, "value"));
  if (!pair) {
    return undefined;
  }
  return {
    kind: "collision",
    controllerType: "width",
    front: clampStaticBodyWidth(pair[0]),
    back: clampStaticBodyWidth(pair[1] ?? pair[0]),
  };
}

function compilePlayerPushControllerOp(controller: MugenStateController): CollisionControllerOp | undefined {
  const raw = findParam(controller, "value");
  const enabled = raw === undefined ? true : booleanNumber(raw);
  if (enabled === undefined) {
    return undefined;
  }
  return {
    kind: "collision",
    controllerType: "playerpush",
    enabled,
  };
}

function compileStateTypeSetControllerOp(controller: MugenStateController): MetadataControllerOp | undefined {
  const stateType = normalizeStateType(findParam(controller, "statetype") ?? findParam(controller, "stateType"));
  const moveType = normalizeMoveType(findParam(controller, "movetype") ?? findParam(controller, "moveType"));
  const physics = normalizePhysics(findParam(controller, "physics"));
  if (!stateType && !moveType && !physics) {
    return undefined;
  }
  return definedObject({
    kind: "metadata" as const,
    controllerType: "statetypeset" as const,
    stateType,
    moveType,
    physics,
  });
}

function compileSprPriorityControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const priority = firstNumber(findParam(controller, "value") ?? findParam(controller, "priority"));
  if (priority === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "sprpriority",
    priority: clampSpritePriority(priority),
  };
}

function compilePalFxControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const time = firstNumber(findParam(controller, "time"));
  const add = strictNumberTripletOrDefault(findParam(controller, "add"), [0, 0, 0], -255, 255);
  const mul = strictNumberTripletOrDefault(findParam(controller, "mul"), [256, 256, 256], 0, 512);
  const color = firstNumber(findParam(controller, "color"));
  const invertRaw = findParam(controller, "invertall") ?? findParam(controller, "invert");
  const invert = booleanNumber(invertRaw);
  if (
    time === undefined ||
    add === undefined ||
    mul === undefined ||
    (findParam(controller, "color") !== undefined && color === undefined) ||
    (invertRaw !== undefined && invert === undefined)
  ) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "palfx",
    time: clampPaletteFxTime(time),
    add,
    mul,
    color: clampPaletteFxColor(color ?? 256),
    invert: invert ?? false,
  };
}

function compileRemapPalControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const source = strictNumberPairExact(findParam(controller, "source"));
  const dest = strictNumberPairExact(findParam(controller, "dest"));
  if (!source || !dest) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "remappal",
    source: [normalizePaletteNumber(source[0]), normalizePaletteNumber(source[1])],
    dest: [normalizePaletteNumber(dest[0]), normalizePaletteNumber(dest[1])],
  };
}

function compileAfterImageControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const time = staticNumberParam(controller, "time", 20);
  const length = staticNumberParam(controller, "length", 6);
  const timeGap = staticNumberParam(controller, "timegap", 1);
  const frameGap = staticNumberParam(controller, "framegap", 1);
  const palAdd = strictNumberTripletOrDefault(findParam(controller, "paladd") ?? findParam(controller, "add"), [0, 0, 0], -255, 255);
  const palMul = strictNumberTripletOrDefault(findParam(controller, "palmul") ?? findParam(controller, "mul"), [192, 192, 192], 0, 512);
  if (
    time === undefined ||
    length === undefined ||
    timeGap === undefined ||
    frameGap === undefined ||
    palAdd === undefined ||
    palMul === undefined
  ) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "afterimage",
    time: clampAfterImageTime(time),
    length: clampAfterImageLength(length),
    timeGap: clampAfterImageGap(timeGap),
    frameGap: clampAfterImageGap(frameGap),
    palAdd,
    palMul,
    opacity: normalizeAfterImageOpacity(findParam(controller, "trans")),
  };
}

function compileAfterImageTimeControllerOp(controller: MugenStateController): SpriteEffectControllerOp | undefined {
  const raw = findParam(controller, "time") ?? findParam(controller, "value");
  const time = raw === undefined ? 0 : firstNumber(raw);
  if (time === undefined) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "afterimagetime",
    time: clampAfterImageTime(time),
  };
}

function isResourceController(type: string): type is ResourceControllerOp["controllerType"] {
  return type === "ctrlset" || type === "lifeadd" || type === "lifeset" || type === "poweradd" || type === "powerset";
}

function compileResourceControllerOp(controller: MugenStateController, type: ResourceControllerOp["controllerType"]): ResourceControllerOp | undefined {
  const value = firstNumber(findParam(controller, "value"));
  if (value === undefined) {
    return undefined;
  }
  if (type === "ctrlset") {
    return { kind: "resource", controllerType: "ctrlset", value: value !== 0 };
  }
  if (type === "lifeadd") {
    return definedObject({
      kind: "resource" as const,
      controllerType: "lifeadd" as const,
      value,
      kill: booleanNumber(findParam(controller, "kill")),
    });
  }
  return { kind: "resource", controllerType: type, value };
}

function isVariableController(type: string): type is VariableControllerOp["controllerType"] {
  return type === "varset" || type === "varadd" || type === "varrangeset";
}

function compileVariableControllerOp(controller: MugenStateController, type: VariableControllerOp["controllerType"]): VariableControllerOp | undefined {
  if (type === "varrangeset") {
    const isFloat = findParam(controller, "fvalue") !== undefined;
    const value = firstNumber(findParam(controller, isFloat ? "fvalue" : "value"));
    if (value === undefined) {
      return undefined;
    }
    return {
      kind: "variable",
      controllerType: "varrangeset",
      variableType: isFloat ? "fvar" : "var",
      first: Math.max(0, Math.round(firstNumber(findParam(controller, "first")) ?? 0)),
      last: Math.max(0, Math.round(firstNumber(findParam(controller, "last")) ?? (isFloat ? 39 : 59))),
      value,
    };
  }

  const assignment = staticVariableAssignmentParam(controller);
  const variableType = assignment?.variableType ?? (findParam(controller, "fv") !== undefined || findParam(controller, "fvar") !== undefined ? "fvar" : "var");
  const index = assignment?.index ?? firstNumber(findParam(controller, variableType === "fvar" ? "fv" : "v") ?? findParam(controller, variableType));
  const value = assignment?.value ?? firstNumber(findParam(controller, "value"));
  if (index === undefined || value === undefined || index < 0) {
    return undefined;
  }
  return {
    kind: "variable",
    controllerType: type,
    variableType,
    index: Math.round(index),
    value,
  };
}

function staticVariableAssignmentParam(controller: MugenStateController): { variableType: "var" | "fvar" | "sysvar"; index: number; value: number } | undefined {
  for (const [key, rawValue] of Object.entries(controller.params)) {
    const match = /^(sysvar|f?var)\((\d+)\)$/i.exec(key.trim());
    if (!match) {
      continue;
    }
    const value = firstNumber(rawValue);
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

function compileHitEligibilityControllerOp(
  controller: MugenStateController,
  type: "hitby" | "nothitby",
): HitEligibilityControllerOp | undefined {
  const remaining = staticDurationParam(controller, "time", 1);
  if (remaining === undefined) {
    return undefined;
  }
  const value = stripMugenString(findParam(controller, "value"));
  const value2 = stripMugenString(findParam(controller, "value2"));
  const slots: HitEligibilityControllerOp["slots"] = [];
  if (value) {
    slots.push({ slot: 1, attr: value, remaining });
  }
  if (value2) {
    slots.push({ slot: 2, attr: value2, remaining });
  }
  if (slots.length === 0) {
    return undefined;
  }
  return {
    kind: "eligibility",
    controllerType: type,
    mode: type === "hitby" ? "allow" : "deny",
    slots,
  };
}

function compileHitOverrideControllerOp(controller: MugenStateController): HitOverrideControllerOp | undefined {
  const attr = stripMugenString(findParam(controller, "attr"));
  if (!attr) {
    return undefined;
  }
  const slot = staticNumberParam(controller, "slot", 0);
  const remaining = staticDurationParam(controller, "time", 1);
  const stateNo = staticOptionalNumberParam(controller, "stateno", "value");
  const forceAir = staticOptionalBooleanParam(controller, "forceair") ?? false;
  const forceGuard = staticOptionalBooleanParam(controller, "forceguard") ?? false;
  const keepState = staticOptionalBooleanParam(controller, "keepstate") ?? false;
  if (slot === undefined || remaining === undefined || stateNo === false || forceAir === undefined || forceGuard === undefined || keepState === undefined) {
    return undefined;
  }
  const operation = definedObject({
    kind: "hitoverride" as const,
    slot: clampIndex(Math.round(slot), 7),
    attr,
    remaining,
    stateNo: stateNo === true ? undefined : Math.max(0, Math.round(stateNo)),
    forceAir,
    forceGuard,
    keepState,
  });
  return operation as HitOverrideControllerOp;
}

function compileReversalDefControllerOp(controller: MugenStateController): ReversalDefControllerOp | undefined {
  const attr = stripMugenString(findParam(controller, "reversal.attr"));
  if (!attr) {
    return undefined;
  }
  const hitPause = staticNumberParam(controller, "pausetime", 0);
  const p1StateNo = staticOptionalNumberParam(controller, "p1stateno");
  const p2StateNo = staticOptionalNumberParam(controller, "p2stateno");
  const targetId = staticOptionalNumberParam(controller, "id");
  if (hitPause === undefined || p1StateNo === false || p2StateNo === false || targetId === false) {
    return undefined;
  }
  const operation = definedObject({
    kind: "reversaldef" as const,
    attr,
    hitPause: Math.max(0, Math.round(hitPause)),
    p1StateNo: p1StateNo === true ? undefined : Math.max(0, Math.round(p1StateNo)),
    p2StateNo: p2StateNo === true ? undefined : Math.max(0, Math.round(p2StateNo)),
    targetId: targetId === true ? undefined : Math.max(0, Math.round(targetId)),
  });
  return operation as ReversalDefControllerOp;
}

function compileDamageScaleControllerOp(
  controller: MugenStateController,
  type: DamageScaleControllerOp["controllerType"],
): DamageScaleControllerOp | undefined {
  const value = staticOptionalNumberParam(controller, "value");
  if (value === true || value === false) {
    return undefined;
  }
  return {
    kind: "damage-scale",
    controllerType: type,
    multiplier: Math.max(0, Math.min(10, value)),
  };
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
    kill: booleanNumber(findParam(controller, "kill")),
    guardKill: booleanNumber(findParam(controller, "guard.kill")),
    priority: firstNumber(findParam(controller, "priority")),
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
    kill: booleanNumber(findParam(controller, "fall.kill")),
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
    const excludeId = firstNumber(findParam(controller, "excludeid") ?? findParam(controller, "id"));
    return { kind: "target", controllerType: "targetdrop", excludeId, keepOne: (firstNumber(findParam(controller, "keepone")) ?? 1) !== 0 };
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

function compileBindToTargetControllerOp(controller: MugenStateController): BindToTargetControllerOp {
  const pos = posWithPostype(findParam(controller, "pos"));
  return {
    kind: "bindtotarget",
    requestedId: firstNumber(findParam(controller, "id")),
    pos: pos?.pos ?? [0, 0],
    postype: pos?.postype ?? "foot",
    time: firstNumber(findParam(controller, "time")) ?? 1,
  };
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
    acceleration: pairWithDefaultOrUndefined(numberPair(findParam(controller, "accel"))),
    velocityMultiplier: scalePairWithDefaultOrUndefined(numberPair(findParam(controller, "velmul"))),
    scale: scalePairWithDefaultOrUndefined(numberPair(findParam(controller, "projscale") ?? findParam(controller, "scale"))),
    facing: firstNumber(findParam(controller, "facing")),
    hitAnim: firstNumber(findParam(controller, "projhitanim")),
    removeAnim: firstNumber(findParam(controller, "projremanim")),
    cancelAnim: firstNumber(findParam(controller, "projcancelanim")),
    removeTime: firstNumber(findParam(controller, "projremovetime") ?? findParam(controller, "removetime")) ?? -1,
    spritePriority: firstNumber(findParam(controller, "sprpriority")) ?? 4,
    priority: firstNumber(findParam(controller, "projpriority") ?? findParam(controller, "priority")) ?? 1,
    hitCount: firstNumber(findParam(controller, "projhits")) ?? 1,
    missTime: firstNumber(findParam(controller, "projmisstime")) ?? 0,
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
    velocity: pairWithDefaultOrUndefined(numberPair(findParam(controller, "velset") ?? findParam(controller, "vel") ?? findParam(controller, "velocity"))),
    scale: scalePairWithDefaultOrUndefined(helperScalePair(controller)),
    postype: stripMugenString(findParam(controller, "postype")),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "removetime")) ?? 180,
    ignoreHitPause: booleanNumber(findParam(controller, "ignorehitpause")) ?? false,
    pauseMoveTime: firstNumber(findParam(controller, "pausemovetime")),
    superMoveTime: firstNumber(findParam(controller, "supermovetime")),
    spritePriority: firstNumber(findParam(controller, "sprpriority")) ?? 3,
  });
}

function helperScalePair(controller: MugenStateController): [number, number?] | undefined {
  const explicit = numberPair(findParam(controller, "scale"));
  if (explicit) {
    return explicit;
  }
  const x = firstNumber(findParam(controller, "size.xscale") ?? findParam(controller, "xscale"));
  const y = firstNumber(findParam(controller, "size.yscale") ?? findParam(controller, "yscale"));
  return x === undefined && y === undefined ? undefined : [x ?? 1, y ?? x ?? 1];
}

function compileExplodControllerOp(controller: MugenStateController): ExplodControllerOp {
  return definedObject({
    kind: "explod" as const,
    explodId: firstNumber(findParam(controller, "id")),
    animNo: firstNumber(findParam(controller, "anim")),
    pos: pairWithDefaultOrUndefined(numberPair(findParam(controller, "pos"))),
    postype: stripMugenString(findParam(controller, "postype")),
    bindTime: firstNumber(findParam(controller, "bindtime")),
    scale: scalePairWithDefaultOrUndefined(numberPair(findParam(controller, "scale"))),
    velocity: pairWithDefaultOrUndefined(numberPair(findParam(controller, "vel") ?? findParam(controller, "velocity"))),
    acceleration: pairWithDefaultOrUndefined(numberPair(findParam(controller, "accel"))),
    facing: firstNumber(findParam(controller, "facing")),
    removeTime: firstNumber(findParam(controller, "removetime")),
    removeOnGetHit: booleanNumber(findParam(controller, "removeongethit")) ?? false,
    ignoreHitPause: booleanNumber(findParam(controller, "ignorehitpause")) ?? false,
    pauseMoveTime: firstNumber(findParam(controller, "pausemovetime")),
    superMoveTime: firstNumber(findParam(controller, "supermovetime")),
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

function staticNumberParam(controller: MugenStateController, key: string, fallback: number): number | undefined {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return fallback;
  }
  return firstNumber(raw);
}

function staticOptionalNumberParam(controller: MugenStateController, ...keys: string[]): number | true | false {
  for (const key of keys) {
    const raw = findParam(controller, key);
    if (raw === undefined) {
      continue;
    }
    const value = firstNumber(raw);
    return value === undefined ? false : value;
  }
  return true;
}

function staticOptionalBooleanParam(controller: MugenStateController, key: string): boolean | undefined {
  const raw = findParam(controller, key);
  if (raw === undefined) {
    return false;
  }
  return booleanNumber(raw);
}

function staticDurationParam(controller: MugenStateController, key: string, fallback: number): number | undefined {
  const value = staticNumberParam(controller, key, fallback);
  return value === undefined ? undefined : controllerDuration(value);
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

function posWithPostype(value: string | undefined): { pos: [number, number]; postype?: "foot" | "mid" | "head" } | undefined {
  if (!value) {
    return undefined;
  }
  const [xRaw, yRaw, postypeRaw] = value.split(",").map((part) => part.trim());
  const x = Number(xRaw);
  const y = Number(yRaw);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return undefined;
  }
  const postype = normalizeBindPostype(postypeRaw);
  return {
    pos: [x, y],
    ...(postype ? { postype } : {}),
  };
}

function normalizeBindPostype(value: string | undefined): "foot" | "mid" | "head" | undefined {
  const normalized = value?.replace(/^"|"$/g, "").trim().toLowerCase();
  if (normalized === "foot" || normalized === "mid" || normalized === "head") {
    return normalized;
  }
  return undefined;
}

function strictNumberPair(value: string | undefined): [number, number?] | undefined {
  if (!value) {
    return undefined;
  }
  const rawParts = value.split(",").map((part) => part.trim());
  const values = rawParts.map((part) => Number(part));
  if (values.length === 0 || values.some((item) => !Number.isFinite(item)) || values[0] === undefined) {
    return undefined;
  }
  return values.length > 1 ? [values[0], values[1]] : [values[0]];
}

function strictNumberPairExact(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const values = value.split(",").map((part) => Number(part.trim()));
  if (values.length < 2 || values.some((item) => !Number.isFinite(item))) {
    return undefined;
  }
  return [values[0]!, values[1]!];
}

function strictNumberTripletOrDefault(
  value: string | undefined,
  fallback: [number, number, number],
  min: number,
  max: number,
): [number, number, number] | undefined {
  if (value === undefined) {
    return fallback;
  }
  const values = value.split(",").map((part) => Number(part.trim()));
  if (values.length < 3 || values.some((item) => !Number.isFinite(item))) {
    return undefined;
  }
  return [clampNumber(values[0]!, min, max), clampNumber(values[1]!, min, max), clampNumber(values[2]!, min, max)];
}

function pairWithDefault(value: [number, number?] | undefined): [number, number] {
  return [value?.[0] ?? 0, value?.[1] ?? 0];
}

function pairWithDefaultOrUndefined(value: [number, number?] | undefined): [number, number] | undefined {
  return value ? pairWithDefault(value) : undefined;
}

function scalePairWithDefaultOrUndefined(value: [number, number?] | undefined): [number, number] | undefined {
  return value ? [value[0], value[1] ?? value[0]] : undefined;
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

function normalizeStateType(value: string | undefined): MetadataControllerOp["stateType"] | undefined {
  const normalized = stripMugenString(value)?.toUpperCase();
  return normalized === "S" || normalized === "C" || normalized === "A" || normalized === "L" ? normalized : undefined;
}

function normalizeMoveType(value: string | undefined): MetadataControllerOp["moveType"] | undefined {
  const normalized = stripMugenString(value)?.toUpperCase();
  return normalized === "I" || normalized === "A" || normalized === "H" ? normalized : undefined;
}

function normalizePhysics(value: string | undefined): MetadataControllerOp["physics"] | undefined {
  const normalized = stripMugenString(value)?.toUpperCase();
  return normalized === "S" || normalized === "C" || normalized === "A" || normalized === "N" ? normalized : undefined;
}

function booleanNumber(value: string | undefined): boolean | undefined {
  const numberValue = firstNumber(value);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

function optionalBooleanParam(value: string | undefined): boolean | "invalid" | undefined {
  if (value === undefined) {
    return undefined;
  }
  return booleanNumber(value) ?? "invalid";
}

function clampStaticBodyWidth(value: number): number {
  return Math.max(1, Math.min(160, Math.abs(Math.round(value))));
}

function clampSpritePriority(value: number): number {
  return Math.max(-5, Math.min(10, Math.round(value)));
}

function clampPaletteFxTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function clampPaletteFxColor(value: number): number {
  return Math.max(0, Math.min(256, Math.round(value)));
}

function clampAfterImageTime(value: number): number {
  return Math.max(0, Math.min(600, Math.round(value)));
}

function clampAfterImageLength(value: number): number {
  return Math.max(1, Math.min(24, Math.round(value)));
}

function clampAfterImageGap(value: number): number {
  return Math.max(1, Math.min(30, Math.round(value)));
}

function normalizeAfterImageOpacity(value: string | undefined): number {
  const normalized = stripMugenString(value)?.toLowerCase();
  if (!normalized) {
    return 0.42;
  }
  if (normalized.includes("add")) {
    return 0.34;
  }
  if (normalized.includes("none")) {
    return 0.25;
  }
  return 0.42;
}

function normalizePaletteNumber(value: number): number {
  return Math.max(0, Math.round(value));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

function definedObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}
