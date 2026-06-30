import type { ControllerIr } from "../compiler/RuntimeIr";
import type { CharacterRuntimeState } from "./types";
import { dispatchStateProgramController, isStateEntrySetupDispatch } from "./StateProgramExecutor";

export type RuntimeStateEntrySetupActor = {
  definition: { source?: string };
  runtime: CharacterRuntimeState;
  runtimeProgram?: { stateEntries: ControllerIr[] };
};

export type RuntimeStateEntrySetupApplyInput<TActor extends RuntimeStateEntrySetupActor> = {
  actor: TActor;
  opponent: TActor;
  tick: number;
  triggersPass: (controller: ControllerIr, actor: TActor, opponent: TActor, owner: TActor, tick: number) => boolean;
  executeController: (controller: ControllerIr, actor: TActor, tick: number) => CharacterRuntimeState;
};

export type RuntimeStateEntrySetupResult = {
  applied: number;
  scanned: number;
  skipped: boolean;
};

export class RuntimeStateEntrySetupWorld {
  apply<TActor extends RuntimeStateEntrySetupActor>(
    input: RuntimeStateEntrySetupApplyInput<TActor>,
  ): RuntimeStateEntrySetupResult {
    const entries = input.actor.runtimeProgram?.stateEntries ?? [];
    if (entries.length === 0 || input.actor.definition.source !== "imported") {
      return { applied: 0, scanned: entries.length, skipped: true };
    }

    let applied = 0;
    let scanned = 0;
    for (const controller of entries) {
      scanned += 1;
      const dispatch = dispatchStateProgramController(controller);
      if (dispatch.kind === "change-state") {
        continue;
      }
      if (!input.triggersPass(controller, input.actor, input.opponent, input.actor, input.tick)) {
        continue;
      }
      if (!isStateEntrySetupDispatch(dispatch)) {
        continue;
      }
      input.actor.runtime = input.executeController(controller, input.actor, input.tick);
      applied += 1;
    }

    return { applied, scanned, skipped: false };
  }
}
