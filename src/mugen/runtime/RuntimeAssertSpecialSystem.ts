import type { ControllerIr, StateProgramIr } from "../compiler/RuntimeIr";
import type { CharacterRuntimeState } from "./types";

export type RuntimeAssertSpecialActor = {
  definition: { source?: string };
  hitPause: number;
  runtime: CharacterRuntimeState;
  runtimeProgram?: { states: StateProgramIr[] };
  stateOwner?: RuntimeAssertSpecialActor;
};

export type RuntimeAssertSpecialApplyInput<TActor extends RuntimeAssertSpecialActor> = {
  actor: TActor;
  opponent: TActor;
  tick: number;
  triggersPass: (controller: ControllerIr, actor: TActor, opponent: TActor, owner: TActor, tick: number) => boolean;
  executeController: (controller: ControllerIr, actor: TActor, owner: TActor, tick: number) => CharacterRuntimeState;
};

export type RuntimeAssertSpecialApplyResult = {
  applied: number;
  skipped: boolean;
};

export class RuntimeAssertSpecialWorld {
  applyPreFacing<TActor extends RuntimeAssertSpecialActor>(
    input: RuntimeAssertSpecialApplyInput<TActor>,
  ): RuntimeAssertSpecialApplyResult {
    const owner = (input.actor.stateOwner ?? input.actor) as TActor;
    const stateProgram = owner.runtimeProgram?.states.find((candidate) => candidate.id === input.actor.runtime.stateNo);
    if (!stateProgram?.source || !isImportedAssertSpecialRoute(input.actor, owner)) {
      return { applied: 0, skipped: true };
    }

    let applied = 0;
    for (const controller of stateProgram.controllers) {
      if (controller.normalizedType !== "assertspecial") {
        continue;
      }
      if (!input.triggersPass(controller, input.actor, input.opponent, owner, input.tick)) {
        continue;
      }
      input.actor.runtime = input.executeController(controller, input.actor, owner, input.tick);
      applied += 1;
    }

    return { applied, skipped: false };
  }
}

function isImportedAssertSpecialRoute(
  actor: RuntimeAssertSpecialActor,
  owner: RuntimeAssertSpecialActor,
): boolean {
  return actor.definition.source === "imported" || owner.definition.source === "imported";
}
