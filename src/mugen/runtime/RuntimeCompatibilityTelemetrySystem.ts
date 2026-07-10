import type { ControllerOp } from "../compiler/ControllerOps";
import type { MugenCommand } from "../model/MugenCommand";
import type { MugenStateController } from "../model/MugenState";
import type { CommandInputHistorySample } from "./CommandBuffer";
import type { ActorCompatibilitySession, RuntimeControllerTraceEvent } from "./types";

export type RuntimeCompatibilityTelemetryActor = {
  id: string;
  label: string;
  definition: {
    source?: string;
    commands?: MugenCommand[];
  };
  stateOwner?: {
    definition: {
      source?: string;
    };
  };
  runtime: {
    stateNo: number;
  };
  commandBuffer: {
    isCommandActive(commandName: string, commands: MugenCommand[]): boolean;
    getHistory(limit?: number): CommandInputHistorySample[];
  };
  executedStateIds: Set<number>;
  routedStateEntries: number;
  routedStateIds: number[];
  lastRoutedState?: { stateId: number; name?: string };
  lastExecutedState?: number;
  executedControllerCounts: Record<string, number>;
  executedOperationCounts: Record<string, number>;
  controllerEvents: RuntimeControllerTraceEvent[];
  nextControllerEventSequence: number;
  compatibilityTick: number;
};

export type RuntimeCompatibilityTelemetryEventOptions = {
  stateNo?: number;
};

export class RuntimeCompatibilityTelemetryWorld {
  isImportedActor(actor: RuntimeCompatibilityTelemetryActor): boolean {
    return actor.definition.source === "imported" || actor.stateOwner?.definition.source === "imported";
  }

  recordStateExecution(
    actor: RuntimeCompatibilityTelemetryActor,
    stateId: number,
    owner: RuntimeCompatibilityTelemetryActor = actor,
  ): void {
    if (actor.definition.source !== "imported" && owner.definition.source !== "imported") {
      return;
    }
    actor.executedStateIds.add(stateId);
    actor.lastExecutedState = stateId;
  }

  recordStateEntryRoute(
    actor: RuntimeCompatibilityTelemetryActor,
    controller: MugenStateController,
    stateId: number,
  ): void {
    if (actor.definition.source !== "imported") {
      return;
    }
    actor.routedStateEntries += 1;
    actor.routedStateIds.push(stateId);
    while (actor.routedStateIds.length > 12) {
      actor.routedStateIds.shift();
    }
    actor.lastRoutedState = {
      stateId,
      ...(controller.name ? { name: controller.name } : {}),
    };
    this.recordController(actor, controller);
  }

  recordController(
    actor: RuntimeCompatibilityTelemetryActor,
    controller: MugenStateController,
    options: RuntimeCompatibilityTelemetryEventOptions = {},
  ): void {
    if (!this.isImportedActor(actor)) {
      return;
    }
    const key = controller.type || controller.name || "Unknown";
    actor.executedControllerCounts[key] = (actor.executedControllerCounts[key] ?? 0) + 1;
    this.appendControllerEvent(actor, controller, undefined, options);
  }

  recordOperation(
    actor: RuntimeCompatibilityTelemetryActor,
    operation: ControllerOp,
    options: RuntimeCompatibilityTelemetryEventOptions = {},
  ): void {
    if (!this.isImportedActor(actor)) {
      return;
    }
    const key = this.operationKey(operation);
    actor.executedOperationCounts[key] = (actor.executedOperationCounts[key] ?? 0) + 1;
    this.appendControllerEvent(actor, undefined, key, options);
  }

  buildSession(actors: RuntimeCompatibilityTelemetryActor[]): { actors: ActorCompatibilitySession[] } | undefined {
    const importedActors = actors
      .filter((actor) => this.isImportedActor(actor))
      .map((actor): ActorCompatibilitySession => {
        const session: ActorCompatibilitySession = {
          actorId: actor.id,
          label: actor.label,
          source: "imported",
          executedStates: [...actor.executedStateIds].sort((a, b) => a - b),
          routedStateEntries: actor.routedStateEntries,
          routedStates: [...actor.routedStateIds],
          executedControllers: { ...actor.executedControllerCounts },
          executedOperations: { ...actor.executedOperationCounts },
          controllerEvents: actor.controllerEvents.map((event) => ({ ...event })),
          activeCommands: this.activeCommands(actor),
          commandHistory: actor.commandBuffer.getHistory(24),
        };
        if (actor.lastRoutedState) {
          session.lastRoutedState = { ...actor.lastRoutedState };
        }
        if (actor.lastExecutedState !== undefined) {
          session.lastExecutedState = actor.lastExecutedState;
        }
        return session;
      });
    return importedActors.length > 0 ? { actors: importedActors } : undefined;
  }

  operationKey(operation: ControllerOp): string {
    if (operation.kind === "target") {
      return `target:${operation.controllerType}`;
    }
    if (operation.kind === "bindtotarget") {
      return "bindtotarget";
    }
    if (operation.kind === "helper-bind") {
      return `helper-bind:${operation.controllerType}`;
    }
    if (operation.kind === "pause") {
      return `pause:${operation.controllerType}`;
    }
    if (operation.kind === "audio") {
      return `audio:${operation.controllerType}`;
    }
    if (operation.kind === "noop") {
      return `noop:${operation.controllerType}`;
    }
    if (operation.kind === "envshake") {
      return "envshake";
    }
    if (operation.kind === "hitfall") {
      return `hitfall:${operation.controllerType}`;
    }
    if (operation.kind === "kinematic") {
      return `kinematic:${operation.controllerType}`;
    }
    if (operation.kind === "bounds") {
      return `bounds:${operation.controllerType}`;
    }
    if (operation.kind === "collision") {
      return `collision:${operation.controllerType}`;
    }
    if (operation.kind === "metadata") {
      return `metadata:${operation.controllerType}`;
    }
    if (operation.kind === "orientation") {
      return `orientation:${operation.controllerType}`;
    }
    if (operation.kind === "sprite-effect") {
      return `sprite-effect:${operation.controllerType}`;
    }
    if (operation.kind === "resource") {
      return `resource:${operation.controllerType}`;
    }
    if (operation.kind === "variable") {
      return `variable:${operation.controllerType}`;
    }
    if (operation.kind === "eligibility") {
      return `eligibility:${operation.controllerType}`;
    }
    if (operation.kind === "damage-scale") {
      return `damage-scale:${operation.controllerType}`;
    }
    if (operation.kind === "contact") {
      return `contact:${operation.controllerType}`;
    }
    return operation.kind;
  }

  private appendControllerEvent(
    actor: RuntimeCompatibilityTelemetryActor,
    controller?: MugenStateController,
    operation?: string,
    options: RuntimeCompatibilityTelemetryEventOptions = {},
  ): void {
    const key = controller?.type || controller?.name || operation || "Unknown";
    actor.controllerEvents.push({
      sequence: actor.nextControllerEventSequence++,
      tick: actor.compatibilityTick,
      stateNo: options.stateNo ?? actor.runtime.stateNo,
      controller: key,
      ...(controller?.name ? { name: controller.name } : {}),
      ...(controller?.line !== undefined ? { line: controller.line } : {}),
      ...(controller?.source ? { stateSource: { ...controller.source } } : {}),
      ...(operation ? { operation } : {}),
    });
    while (actor.controllerEvents.length > 160) {
      actor.controllerEvents.shift();
    }
  }

  private activeCommands(actor: RuntimeCompatibilityTelemetryActor): string[] {
    const commands = actor.definition.commands ?? [];
    const names: string[] = [];
    const seen = new Set<string>();
    for (const command of commands) {
      if (seen.has(command.name)) {
        continue;
      }
      if (actor.commandBuffer.isCommandActive(command.name, commands)) {
        names.push(command.name);
        seen.add(command.name);
      }
    }
    return names.slice(0, 12);
  }
}
