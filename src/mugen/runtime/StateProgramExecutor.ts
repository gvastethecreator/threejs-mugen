import type { ControllerIr } from "../compiler/RuntimeIr";

export type StateProgramSideEffect =
  | "hitdef"
  | "reversaldef"
  | "width"
  | "fallenvshake"
  | "sprpriority"
  | "palfx"
  | "afterimage"
  | "afterimagetime"
  | "angle"
  | "explod"
  | "removeexplod"
  | "modifyexplod"
  | "helper"
  | "projectile"
  | "modifyprojectile"
  | "target"
  | "bindtotarget"
  | "pause"
  | "sound"
  | "envcolor"
  | "envshake"
  | "contact";

export type StateProgramDispatch =
  | {
      kind: "change-state";
      controller: ControllerIr;
      stateId?: number;
      stateExpression?: string;
      clearStateOwner: boolean;
      animOverride?: number;
      animExpression?: string;
      ctrl?: boolean;
      ctrlExpression?: string;
    }
  | {
      kind: "change-anim";
      controller: ControllerIr;
      actionId?: number;
      actionExpression?: string;
      animationSource: "self" | "state-owner";
      elem?: number;
      elemExpression?: string;
      elemTime?: number;
      elemTimeExpression?: string;
    }
  | {
      kind: "runtime-controller";
      controller: ControllerIr;
    }
  | {
      kind: "side-effect";
      controller: ControllerIr;
      effect: StateProgramSideEffect;
    }
  | {
      kind: "unsupported";
      controller: ControllerIr;
    };

const sideEffects: Record<string, StateProgramSideEffect> = {
  hitdef: "hitdef",
  reversaldef: "reversaldef",
  width: "width",
  fallenvshake: "fallenvshake",
  sprpriority: "sprpriority",
  palfx: "palfx",
  afterimage: "afterimage",
  afterimagetime: "afterimagetime",
  angleset: "angle",
  angleadd: "angle",
  angledraw: "angle",
  explod: "explod",
  removeexplod: "removeexplod",
  modifyexplod: "modifyexplod",
  helper: "helper",
  projectile: "projectile",
  modifyprojectile: "modifyprojectile",
  bindtotarget: "bindtotarget",
  pause: "pause",
  superpause: "pause",
  playsnd: "sound",
  stopsnd: "sound",
  envcolor: "envcolor",
  envshake: "envshake",
  movehitreset: "contact",
  hitadd: "contact",
};

const runtimeControllers = new Set([
  "velset",
  "veladd",
  "velmul",
  "hitvelset",
  "hitfallvel",
  "hitfalldamage",
  "hitfallset",
  "posset",
  "posadd",
  "gravity",
  "ctrlset",
  "statetypeset",
  "lifeadd",
  "lifeset",
  "poweradd",
  "powerset",
  "varset",
  "varadd",
  "varrandom",
  "varrangeset",
  "playerpush",
  "turn",
  "hitby",
  "nothitby",
  "hitoverride",
  "defencemulset",
  "attackmulset",
  "remappal",
  "trans",
  "posfreeze",
  "screenbound",
  "forcefeedback",
  "displaytoclipboard",
  "appendtoclipboard",
  "clearclipboard",
  "makedust",
  "destroyself",
  "assertspecial",
  "null",
]);

export function dispatchStateProgramController(controller: ControllerIr): StateProgramDispatch {
  const type = controller.normalizedType;
  if (type === "changestate" || type === "selfstate") {
    const stateParam = findControllerParam(controller, "value") ?? findControllerParam(controller, "stateno");
    const stateId = firstNumber(stateParam);
    if (stateId === undefined && stateParam === undefined) {
      return { kind: "unsupported", controller };
    }
    const animParam = findControllerParam(controller, "anim");
    const animOverride = firstNumber(animParam);
    const ctrlParamRaw = findControllerParam(controller, "ctrl");
    const ctrlParam = firstNumber(ctrlParamRaw);
    return {
      kind: "change-state",
      controller,
      clearStateOwner: type === "selfstate",
      ...(stateId !== undefined ? { stateId } : { stateExpression: stateParam }),
      ...(animOverride !== undefined ? { animOverride } : {}),
      ...(animOverride === undefined && animParam !== undefined ? { animExpression: animParam } : {}),
      ...(ctrlParam !== undefined ? { ctrl: ctrlParam !== 0 } : {}),
      ...(ctrlParam === undefined && ctrlParamRaw !== undefined ? { ctrlExpression: ctrlParamRaw } : {}),
    };
  }

  if (type === "changeanim" || type === "changeanim2") {
    const actionParam = findControllerParam(controller, "value") ?? findControllerParam(controller, "anim");
    const actionId = firstNumber(actionParam);
    if (actionId === undefined && actionParam === undefined) {
      return { kind: "unsupported", controller };
    }
    const elemParam = findControllerParam(controller, "elem");
    const elem = firstNumber(elemParam);
    const elemTimeParam = findControllerParam(controller, "elemtime");
    const elemTime = firstNumber(elemTimeParam);
    return {
      kind: "change-anim",
      controller,
      animationSource: type === "changeanim2" ? "state-owner" : "self",
      ...(actionId !== undefined ? { actionId } : { actionExpression: actionParam }),
      ...(elem !== undefined ? { elem } : {}),
      ...(elem === undefined && elemParam !== undefined ? { elemExpression: elemParam } : {}),
      ...(elemTime !== undefined ? { elemTime } : {}),
      ...(elemTime === undefined && elemTimeParam !== undefined ? { elemTimeExpression: elemTimeParam } : {}),
    };
  }

  if (type.startsWith("target")) {
    return { kind: "side-effect", controller, effect: "target" };
  }

  const sideEffect = sideEffects[type];
  if (sideEffect) {
    return { kind: "side-effect", controller, effect: sideEffect };
  }

  if (runtimeControllers.has(type)) {
    return { kind: "runtime-controller", controller };
  }

  return { kind: "unsupported", controller };
}

export function isStateEntrySetupDispatch(dispatch: StateProgramDispatch): boolean {
  if (dispatch.kind !== "runtime-controller") {
    return false;
  }
  return stateEntrySetupControllers.has(dispatch.controller.normalizedType);
}

const stateEntrySetupControllers = new Set(["varset", "varadd", "varrandom", "ctrlset", "poweradd", "powerset", "lifeadd", "lifeset"]);

export function findControllerParam(controller: { params: Record<string, string> }, key: string): string | undefined {
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
