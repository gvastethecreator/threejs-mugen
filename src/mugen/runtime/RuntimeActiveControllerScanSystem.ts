import type { ControllerIr, StateProgramIr } from "../compiler/RuntimeIr";

export type RuntimeActiveControllerScanActor<TSelf> = {
  definition: { source?: string };
  runtime: { stateNo: number };
  runtimeProgram?: { states: StateProgramIr[] };
  stateOwner?: TSelf;
};

export type RuntimeActiveControllerScanOptions<
  TActor extends RuntimeActiveControllerScanActor<TActor>,
  TOpponent,
> = {
  actor: TActor;
  opponent: TOpponent;
  tick: number;
  stateNo?: number;
  stateOwner?: TActor;
  onlyIgnoreHitPause?: boolean;
  controllerIgnoresHitPause: (controller: ControllerIr) => boolean;
  triggersPass: (controller: ControllerIr, actor: TActor, opponent: TOpponent, owner: TActor, tick: number) => boolean;
  executeController: (input: RuntimeActiveControllerExecution<TActor, TOpponent>) => "continue" | "blocked" | "stop" | void;
};

export type RuntimeActiveControllerExecution<
  TActor extends RuntimeActiveControllerScanActor<TActor>,
  TOpponent,
> = {
  actor: TActor;
  opponent: TOpponent;
  owner: TActor;
  stateProgram: StateProgramIr;
  controller: ControllerIr;
  tick: number;
};

export type RuntimeActiveControllerScanResult<TActor> =
  | {
      scanned: true;
      owner: TActor;
      stateProgram: StateProgramIr;
      visitedControllers: number;
      executedControllers: number;
      blockedControllers: number;
      stopped: boolean;
    }
  | {
      scanned: false;
      reason: "missing-state" | "non-imported";
      owner: TActor;
      visitedControllers: 0;
      executedControllers: 0;
      blockedControllers: 0;
      stopped: false;
    };

export class RuntimeActiveControllerScanWorld {
  run<TActor extends RuntimeActiveControllerScanActor<TActor>, TOpponent>(
    options: RuntimeActiveControllerScanOptions<TActor, TOpponent>,
  ): RuntimeActiveControllerScanResult<TActor> {
    const owner = options.stateOwner ?? options.actor.stateOwner ?? options.actor;
    const stateNo = options.stateNo ?? options.actor.runtime.stateNo;
    const stateProgram = owner.runtimeProgram?.states.find((candidate) => candidate.id === stateNo && candidate.special === undefined);
    if (!stateProgram) {
      return {
        scanned: false,
        reason: "missing-state",
        owner,
        visitedControllers: 0,
        executedControllers: 0,
        blockedControllers: 0,
        stopped: false,
      };
    }

    if (options.actor.definition.source !== "imported" && owner.definition.source !== "imported") {
      return {
        scanned: false,
        reason: "non-imported",
        owner,
        visitedControllers: 0,
        executedControllers: 0,
        blockedControllers: 0,
        stopped: false,
      };
    }

    let visitedControllers = 0;
    let executedControllers = 0;
    let blockedControllers = 0;
    let stopped = false;

    for (const controller of stateProgram.controllers) {
      if (options.onlyIgnoreHitPause && !options.controllerIgnoresHitPause(controller)) {
        continue;
      }
      if (!options.triggersPass(controller, options.actor, options.opponent, owner, options.tick)) {
        continue;
      }
      visitedControllers += 1;
      const result = options.executeController({
        actor: options.actor,
        opponent: options.opponent,
        owner,
        stateProgram,
        controller,
        tick: options.tick,
      });
      if (result === "blocked") {
        blockedControllers += 1;
        continue;
      }
      executedControllers += 1;
      if (result === "stop") {
        stopped = true;
        break;
      }
    }

    return {
      scanned: true,
      owner,
      stateProgram,
      visitedControllers,
      executedControllers,
      blockedControllers,
      stopped,
    };
  }
}
