import type { CharacterRuntimeState } from "./types";

export type RuntimeKinematicsActor = {
  currentMove?: unknown;
  runtime: Pick<CharacterRuntimeState, "combatDepth" | "physics" | "pos" | "stateType" | "vel">;
};

export type RuntimeKinematicsHooks = {
  changeIdleAction?: () => void;
};

export type RuntimeKinematicsAdvanceOptions = RuntimeKinematicsHooks & {
  preserveImportedStateMoveType?: boolean;
  gravity?: number;
};

export type RuntimeKinematicsAdvanceResult = {
  moved: boolean;
  appliedGravity: boolean;
  landed: boolean;
  changedIdleAction: boolean;
};

export class RuntimeKinematicsWorld {
  advance(
    actor: RuntimeKinematicsActor,
    options: RuntimeKinematicsAdvanceOptions = {},
  ): RuntimeKinematicsAdvanceResult {
    const gravity = options.gravity ?? 0.55;
    actor.runtime.pos.x += actor.runtime.vel.x;
    actor.runtime.pos.y += actor.runtime.vel.y;
    if (actor.runtime.combatDepth) actor.runtime.combatDepth.position += actor.runtime.combatDepth.velocity;

    const appliedGravity = actor.runtime.stateType === "A";
    if (appliedGravity) {
      actor.runtime.vel.y += gravity;
    }

    if (actor.runtime.pos.y <= 0 || options.preserveImportedStateMoveType) {
      return { moved: true, appliedGravity, landed: false, changedIdleAction: false };
    }

    actor.runtime.pos.y = 0;
    actor.runtime.vel.y = 0;
    actor.runtime.stateType = "S";
    actor.runtime.physics = "S";

    const changedIdleAction = !actor.currentMove;
    if (changedIdleAction) {
      options.changeIdleAction?.();
    }

    return { moved: true, appliedGravity, landed: true, changedIdleAction };
  }
}
