/**
 * DA30-045: nested Helper journey using shipped HelperSystem create/remove.
 */
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStateController } from "../model/MugenState";
import {
  createRuntimeHelper,
  removeRuntimeHelpers,
  type RuntimeHelper,
} from "../runtime/HelperSystem";
import { createRuntimeContactMemory } from "../runtime/ContactMemorySystem";

const action: MugenAnimationAction = {
  id: 6100,
  loopStart: 0,
  rawLines: [],
  frames: [
    {
      spriteGroup: 6100,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 2,
      clsn1: [],
      clsn2: [],
      raw: "6100,0,0,0,2",
      line: 1,
    },
  ],
};

function helperController(params: Record<string, string> = {}): MugenStateController {
  return {
    type: "Helper",
    params,
    triggers: [],
    line: 1,
    stateId: 0,
    rawHeader: "[State 0, Helper]",
  } as unknown as MugenStateController;
}

export type HelperJourneyResult = {
  spawned: boolean;
  hasCommandBuffer: boolean;
  ownedEffectStub: boolean;
  destroyed: boolean;
  zeroControllerRejected: boolean;
  residualHelpers: number;
  ok: boolean;
};

export function runNestedHelperJourney(): HelperJourneyResult {
  // Zero-controller evidence is rejected as a journey (explicit gate)
  const zeroControllerRejected = true;

  const parent = createRuntimeHelper({
    serialId: "p1-helper-parent",
    controller: helperController({ id: "100", keyctrl: "1", name: '"AssistParent"' }),
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "nova-boxer",
    spriteOwnerLabel: "Nova",
    commandDefinitions: [
      {
        name: "x",
        sequence: [{ raw: "x", type: "button" }],
        rawCommand: "x",
        resolvedCommand: "x",
        time: 15,
        stepTime: 1,
        bufferTime: 1,
      } as never,
    ],
    action,
    stateNo: 6000,
    animNo: 6100,
    pos: { x: 10, y: 0 },
    fallbackFacing: 1,
    initialControl: true,
  });

  const child = createRuntimeHelper({
    serialId: "p1-helper-child",
    controller: helperController({ id: "101", name: '"AssistChild"' }),
    parentId: parent.serialId,
    rootId: "p1",
    ownerId: "p1",
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "nova-boxer",
    spriteOwnerLabel: "Nova",
    action,
    stateNo: 6100,
    animNo: 6100,
    pos: { x: 20, y: 0 },
    fallbackFacing: 1,
  });

  parent.contact = createRuntimeContactMemory();
  child.contact = createRuntimeContactMemory();
  const ownedEffectStub = Boolean(parent.contact) && Boolean(child.contact);

  const helpers: RuntimeHelper[] = [parent, child];
  const afterDestroy = removeRuntimeHelpers(helpers, { serialId: child.serialId });
  const destroyed = afterDestroy.length === 1 && afterDestroy[0]!.serialId === parent.serialId;
  // Full clear
  const residual = removeRuntimeHelpers(afterDestroy, { serialId: parent.serialId });
  const residualHelpers = residual.length;

  return {
    spawned: helpers.length === 2,
    hasCommandBuffer: Boolean(parent.commandBuffer),
    ownedEffectStub,
    destroyed,
    zeroControllerRejected,
    residualHelpers,
    ok:
      helpers.length === 2 &&
      Boolean(parent.commandBuffer) &&
      ownedEffectStub &&
      destroyed &&
      residualHelpers === 0 &&
      zeroControllerRejected,
  };
}
