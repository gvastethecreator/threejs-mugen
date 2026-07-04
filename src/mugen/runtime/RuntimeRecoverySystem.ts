import type { DemoFighterDefinition } from "./demoFighters";
import type { CharacterRuntimeState } from "./types";

export type RuntimeRecoveryActor = {
  definition: Pick<DemoFighterDefinition, "source" | "constants">;
  runtime: Pick<
    CharacterRuntimeState,
    "assertSpecial" | "hitFall" | "life" | "physics" | "pos" | "stateNo" | "stateType" | "vel"
  >;
  stateElapsed: number;
  stateOwner?: {
    definition: Pick<DemoFighterDefinition, "source">;
  };
};

export type RuntimeRecoveryTransitionApi = {
  canEnterState: (stateId: number) => boolean;
  enterState: (stateId: number) => void;
  isFastRecoverFromLieDownRequested?: () => boolean;
};

export class RuntimeRecoverySystem {
  tickHitFallRecoveryWindow(actor: RuntimeRecoveryActor): void {
    const hitFall = actor.runtime.hitFall;
    if (!hitFall?.recover || hitFall.recoverTime === undefined || hitFall.recoverTime <= 0) {
      return;
    }
    actor.runtime.hitFall = {
      ...hitFall,
      recoverTime: Math.max(0, hitFall.recoverTime - 1),
    };
  }

  advanceCommon1LieDownRecovery(actor: RuntimeRecoveryActor, transitions: RuntimeRecoveryTransitionApi): void {
    if (actor.runtime.stateNo !== 5110 || actor.runtime.life <= 0) {
      return;
    }
    const hitFall = ensureDownRecoveryTime(actor);
    if (!hitFall) {
      return;
    }
    if ((hitFall.downRecoverTime ?? 0) <= 0) {
      if (actor.runtime.assertSpecial?.noGetUpFromLieDown) {
        return;
      }
      if (actor.stateElapsed >= 1 && transitions.canEnterState(5120)) {
        transitions.enterState(5120);
      }
      return;
    }
    if (shouldFastRecoverFromLieDown(actor, transitions, hitFall)) {
      actor.runtime.hitFall = {
        ...hitFall,
        downRecoverTime: 0,
      };
      if (actor.stateElapsed >= 1 && transitions.canEnterState(5120)) {
        transitions.enterState(5120);
      }
      return;
    }
    actor.runtime.hitFall = {
      ...hitFall,
      downRecoverTime: Math.max(0, (hitFall.downRecoverTime ?? 0) - 1),
    };
  }

  advanceImportedGroundRecoveryLanding(actor: RuntimeRecoveryActor, transitions: RuntimeRecoveryTransitionApi): void {
    if (!isImportedGroundRecoveryLandingState(actor) || actor.runtime.life <= 0) {
      return;
    }
    if (actor.runtime.vel.y <= 0 || actor.runtime.pos.y < 0 || !transitions.canEnterState(52)) {
      return;
    }
    actor.runtime.pos.y = 0;
    actor.runtime.vel.y = 0;
    transitions.enterState(52);
  }
}

export function isImportedGroundRecoveryLandingState(actor: RuntimeRecoveryActor): boolean {
  if (actor.definition.source !== "imported" && actor.stateOwner?.definition.source !== "imported") {
    return false;
  }
  return actor.runtime.stateNo === 5201 && actor.runtime.physics === "A";
}

export function ensureDownRecoveryTime(actor: RuntimeRecoveryActor): CharacterRuntimeState["hitFall"] | undefined {
  const hitFall = actor.runtime.hitFall;
  if (!hitFall) {
    return undefined;
  }
  if (hitFall.downRecoverTime !== undefined) {
    return hitFall;
  }
  const downRecoverTime = defaultDownRecoverTime(actor.definition);
  actor.runtime.hitFall = {
    ...hitFall,
    downRecover: hitFall.downRecover ?? true,
    downRecoverTime,
  };
  return actor.runtime.hitFall;
}

export function defaultDownRecoverTime(definition: Pick<DemoFighterDefinition, "constants">): number {
  return Math.max(0, Math.round(definition.constants?.["data.liedown.time"] ?? 60));
}

function shouldFastRecoverFromLieDown(
  actor: RuntimeRecoveryActor,
  transitions: RuntimeRecoveryTransitionApi,
  hitFall: NonNullable<CharacterRuntimeState["hitFall"]>,
): boolean {
  return (
    actor.runtime.stateType === "L" &&
    !actor.runtime.assertSpecial?.noFastRecoverFromLieDown &&
    (hitFall.downRecoverTime ?? 0) > 0 &&
    transitions.isFastRecoverFromLieDownRequested?.() === true
  );
}
