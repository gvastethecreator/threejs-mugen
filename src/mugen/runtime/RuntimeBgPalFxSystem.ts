import type { BgPalFxControllerOp, SpriteEffectControllerOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import {
  applyRuntimePaletteFxController,
  resolveRuntimePaletteFxControllerOperation,
  tickRuntimePaletteFx,
  type RuntimePaletteFxResolver,
} from "./SpriteEffectSystem";
import type { RuntimePaletteFxState } from "./types";

type PalFxControllerOp = Extract<SpriteEffectControllerOp, { controllerType: "palfx" }>;

export type RuntimeBgPalFxHolder = {
  paletteFx?: RuntimePaletteFxState;
};

export class RuntimeBgPalFxWorld {
  private readonly holder: RuntimeBgPalFxHolder = {};

  apply(
    controller: MugenStateController,
    operation?: BgPalFxControllerOp,
    resolvePaletteFx?: RuntimePaletteFxResolver,
  ): RuntimePaletteFxState | undefined {
    applyRuntimePaletteFxController(this.holder, controller, toPalFxControllerOp(operation), resolvePaletteFx);
    return this.holder.paletteFx;
  }

  resolveOperation(
    controller: MugenStateController,
    operation?: BgPalFxControllerOp,
    resolvePaletteFx?: RuntimePaletteFxResolver,
  ): BgPalFxControllerOp | undefined {
    if (operation) {
      return operation;
    }
    return toBgPalFxControllerOp(resolveRuntimePaletteFxControllerOperation(controller, resolvePaletteFx));
  }

  tick(): void {
    tickRuntimePaletteFx(this.holder);
  }

  snapshot(): RuntimePaletteFxState | undefined {
    const paletteFx = this.holder.paletteFx;
    if (!paletteFx || paletteFx.remaining <= 0) {
      return undefined;
    }
    return clonePaletteFxState(paletteFx);
  }

  reset(): void {
    this.holder.paletteFx = undefined;
  }
}

function toPalFxControllerOp(operation: BgPalFxControllerOp | undefined): PalFxControllerOp | undefined {
  if (!operation) {
    return undefined;
  }
  return {
    kind: "sprite-effect",
    controllerType: "palfx",
    time: operation.time,
    add: operation.add,
    mul: operation.mul,
    color: operation.color,
    invert: operation.invert,
    ...(operation.sinadd ? { sinadd: operation.sinadd, sinaddPeriod: operation.sinaddPeriod } : {}),
  };
}

export function toBgPalFxControllerOp(operation: PalFxControllerOp | undefined): BgPalFxControllerOp | undefined {
  if (!operation) {
    return undefined;
  }
  return {
    kind: "bgpalfx",
    time: operation.time,
    add: operation.add,
    mul: operation.mul,
    color: operation.color,
    invert: operation.invert,
    ...(operation.sinadd ? { sinadd: operation.sinadd, sinaddPeriod: operation.sinaddPeriod } : {}),
  };
}

function clonePaletteFxState(paletteFx: RuntimePaletteFxState): RuntimePaletteFxState {
  return {
    remaining: paletteFx.remaining,
    time: paletteFx.time,
    add: [paletteFx.add[0], paletteFx.add[1], paletteFx.add[2]],
    mul: [paletteFx.mul[0], paletteFx.mul[1], paletteFx.mul[2]],
    color: paletteFx.color,
    invert: paletteFx.invert,
    ...(paletteFx.addBase
      ? { addBase: [paletteFx.addBase[0], paletteFx.addBase[1], paletteFx.addBase[2]] }
      : {}),
    ...(paletteFx.sinadd ? { sinadd: [paletteFx.sinadd[0], paletteFx.sinadd[1], paletteFx.sinadd[2]] } : {}),
    ...(paletteFx.sinaddPeriod === undefined ? {} : { sinaddPeriod: paletteFx.sinaddPeriod }),
    ...(paletteFx.sinaddTime === undefined ? {} : { sinaddTime: paletteFx.sinaddTime }),
  };
}
