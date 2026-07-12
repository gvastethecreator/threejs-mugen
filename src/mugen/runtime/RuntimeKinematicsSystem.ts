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
  groundFriction?: {
    stand: number;
    crouch: number;
    standThreshold: number;
  };
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

    const friction = options.groundFriction;
    if (friction && actor.runtime.physics === "S") {
      actor.runtime.vel.x *= friction.stand;
      if (Math.abs(actor.runtime.vel.x) < friction.standThreshold) actor.runtime.vel.x = 0;
      if (actor.runtime.combatDepth) {
        actor.runtime.combatDepth.velocity *= friction.stand;
        if (Math.abs(actor.runtime.combatDepth.velocity) < friction.standThreshold) {
          actor.runtime.combatDepth.velocity = 0;
        }
      }
    } else if (friction && actor.runtime.physics === "C") {
      actor.runtime.vel.x *= friction.crouch;
      if (actor.runtime.combatDepth) actor.runtime.combatDepth.velocity *= friction.crouch;
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

export function runtimeGroundFrictionOptions(
  constants?: Record<string, number>,
  localCoord?: readonly [number, number],
): NonNullable<RuntimeKinematicsAdvanceOptions["groundFriction"]> {
  const localWidth = localCoord?.[0];
  return {
    stand: finite(constants?.["movement.stand.friction"]) ?? 0.85,
    crouch: finite(constants?.["movement.crouch.friction"]) ?? 0.82,
    standThreshold: typeof localWidth === "number" && Number.isFinite(localWidth) && localWidth > 0 ? localWidth / 320 : 1,
  };
}

function finite(value: number | undefined): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}
