import type { MetadataControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { CharacterRuntimeState } from "./types";

export type RuntimeStateTypeControllerSource = Pick<ControllerIr, "params" | "type" | "normalizedType">;

export type RuntimeStateTypeControllerResult = {
  applied: boolean;
  stateType?: CharacterRuntimeState["stateType"];
  moveType?: CharacterRuntimeState["moveType"];
  physics?: CharacterRuntimeState["physics"];
};

export class RuntimeStateTypeWorld {
  applyController(
    state: CharacterRuntimeState,
    controller: RuntimeStateTypeControllerSource,
    operation?: MetadataControllerOp,
  ): RuntimeStateTypeControllerResult {
    const stateType = operation?.stateType ?? enumParam(controller, "statetype", "stateType");
    const moveType = operation?.moveType ?? enumParam(controller, "movetype", "moveType");
    const physics = operation?.physics ?? enumParam(controller, "physics");
    let applied = false;
    const result: RuntimeStateTypeControllerResult = { applied: false };

    if (stateType === "S" || stateType === "C" || stateType === "A" || stateType === "L") {
      state.stateType = stateType;
      result.stateType = stateType;
      applied = true;
    }
    if (moveType === "I" || moveType === "A" || moveType === "H") {
      state.moveType = moveType;
      result.moveType = moveType;
      applied = true;
    }
    if (physics === "S" || physics === "C" || physics === "A" || physics === "N") {
      state.physics = physics;
      result.physics = physics;
      applied = true;
    }

    result.applied = applied;
    return result;
  }
}

function enumParam(controller: RuntimeStateTypeControllerSource, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = findParam(controller, key);
    if (raw) {
      return raw.trim().toUpperCase();
    }
  }
  return undefined;
}

function findParam(controller: RuntimeStateTypeControllerSource, key: string): string | undefined {
  const lower = key.toLowerCase();
  const match = Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower);
  return match?.[1];
}
