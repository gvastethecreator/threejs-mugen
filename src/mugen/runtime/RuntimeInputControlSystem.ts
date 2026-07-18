import { hasRuntimeDirection } from "./RuntimeInput";
import type { CharacterRuntimeState } from "./types";

export type RuntimeInputControlActionId = number;
export type RuntimeInputControlMove = "punch" | "kick";

export type RuntimeInputControlDefinition = {
  speed: number;
  jumpVelocity: number;
  idleAction: RuntimeInputControlActionId;
  walkAction: RuntimeInputControlActionId;
  crouchAction: RuntimeInputControlActionId;
  jumpAction: RuntimeInputControlActionId;
};

export type RuntimeInputControlActor = {
  currentMove?: unknown;
  aiCooldown: number;
  definition: RuntimeInputControlDefinition;
  runtime: Pick<CharacterRuntimeState, "assertSpecial" | "ctrl" | "facing" | "physics" | "pos" | "stateType" | "vel">;
};

export type RuntimeInputControlOpponent = {
  runtime: Pick<CharacterRuntimeState, "pos">;
};

export type RuntimeInputControlHooks = {
  hasStun?: boolean;
  preserveImportedStateMoveType?: boolean;
  deferControl?: (apply: () => RuntimeInputControlResult) => RuntimeInputControlResult;
  runStateEntrySetup?: () => void;
  tryApplyStateEntry?: () => boolean;
  startMove?: (move: RuntimeInputControlMove) => void;
  changeAction?: (actionId: RuntimeInputControlActionId) => void;
  setStateNo?: (stateNo: RuntimeInputControlActionId) => void;
  restoreControl?: () => void;
};

export type RuntimeInputControlResult =
  | "blocked"
  | "deferred"
  | "state-entry"
  | "move"
  | "crouch"
  | "jump"
  | "air-drift"
  | "walk-blocked"
  | "walk"
  | "idle"
  | "ai-chase";

export class RuntimeInputControlWorld {
  handlePlayerInput(
    actor: RuntimeInputControlActor,
    input: Set<string>,
    hooks: RuntimeInputControlHooks = {},
  ): RuntimeInputControlResult {
    if (isInputBlocked(actor, hooks)) {
      return "blocked";
    }

    if (hooks.deferControl) {
      const { deferControl: _deferControl, ...immediateHooks } = hooks;
      return hooks.deferControl(() => this.handlePlayerInput(actor, input, immediateHooks));
    }

    hooks.runStateEntrySetup?.();
    if (hooks.tryApplyStateEntry?.()) {
      return "state-entry";
    }

    if (input.has("x") || input.has("y") || input.has("z")) {
      hooks.startMove?.("punch");
      return "move";
    }
    if (input.has("a") || input.has("b") || input.has("c")) {
      hooks.startMove?.("kick");
      return "move";
    }
    if (hasRuntimeDirection(input, "D") && actor.runtime.stateType !== "A") {
      hooks.changeAction?.(actor.definition.crouchAction);
      hooks.setStateNo?.(actor.definition.crouchAction);
      actor.runtime.stateType = "C";
      actor.runtime.physics = "C";
      actor.runtime.vel.x = 0;
      return "crouch";
    }
    if (hasRuntimeDirection(input, "U") && actor.runtime.stateType !== "A") {
      actor.runtime.vel.y = actor.definition.jumpVelocity;
      actor.runtime.stateType = "A";
      actor.runtime.physics = "A";
      hooks.changeAction?.(actor.definition.jumpAction);
      hooks.setStateNo?.(actor.definition.jumpAction);
      return "jump";
    }

    const direction = hasRuntimeDirection(input, "F") ? 1 : hasRuntimeDirection(input, "B") ? -1 : 0;
    if (direction !== 0 && actor.runtime.assertSpecial?.noWalk) {
      actor.runtime.vel.x = 0;
      return "walk-blocked";
    }
    if (direction !== 0 && actor.runtime.stateType === "A") {
      actor.runtime.vel.x = direction * actor.runtime.facing * actor.definition.speed;
      return "air-drift";
    }
    if (direction !== 0) {
      actor.runtime.vel.x = direction * actor.runtime.facing * actor.definition.speed;
      actor.runtime.stateType = "S";
      actor.runtime.physics = "S";
      hooks.changeAction?.(actor.definition.walkAction);
      hooks.setStateNo?.(actor.definition.walkAction);
      return "walk";
    }

    actor.runtime.vel.x = 0;
    if (actor.runtime.stateType !== "A") {
      actor.runtime.stateType = "S";
      actor.runtime.physics = "S";
      hooks.changeAction?.(actor.definition.idleAction);
      hooks.setStateNo?.(actor.definition.idleAction);
      hooks.restoreControl?.();
    }
    return "idle";
  }

  handleSimpleAi(
    actor: RuntimeInputControlActor,
    opponent: RuntimeInputControlOpponent,
    tick: number,
    hooks: RuntimeInputControlHooks = {},
  ): RuntimeInputControlResult {
    if (isInputBlocked(actor, hooks)) {
      return "blocked";
    }

    if (hooks.deferControl) {
      const { deferControl: _deferControl, ...immediateHooks } = hooks;
      return hooks.deferControl(() => this.handleSimpleAi(actor, opponent, tick, immediateHooks));
    }

    hooks.runStateEntrySetup?.();
    if (hooks.tryApplyStateEntry?.()) {
      return "state-entry";
    }

    actor.aiCooldown = Math.max(0, actor.aiCooldown - 1);
    const distance = Math.abs(opponent.runtime.pos.x - actor.runtime.pos.x);
    if (distance > 110 && !actor.runtime.assertSpecial?.noWalk) {
      actor.runtime.vel.x = actor.runtime.facing * actor.definition.speed * 0.65;
      hooks.changeAction?.(actor.definition.walkAction);
      hooks.setStateNo?.(actor.definition.walkAction);
      return "ai-chase";
    }

    actor.runtime.vel.x = 0;
    if (actor.aiCooldown === 0) {
      hooks.startMove?.(tick % 2 === 0 ? "punch" : "kick");
      actor.aiCooldown = 70;
      return "move";
    }

    hooks.changeAction?.(actor.definition.idleAction);
    hooks.setStateNo?.(actor.definition.idleAction);
    return "idle";
  }
}

function isInputBlocked(actor: RuntimeInputControlActor, hooks: RuntimeInputControlHooks): boolean {
  return Boolean(hooks.hasStun || actor.currentMove || !actor.runtime.ctrl || hooks.preserveImportedStateMoveType);
}
