import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { DemoMove } from "./demoFighters";
import { markRuntimeEffectActorGotHit } from "./EffectLifecycleSystem";
import type { CharacterRuntimeState, RuntimeHitOverrideSlot } from "./types";

export type RuntimeHitOverrideActor = {
  id: string;
  label: string;
  runtime: CharacterRuntimeState;
  hitStun: number;
  hitPause: number;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "removeExplodsOnGetHit">;
};

export type RuntimeHitOverrideRedirect = {
  attackerLabel: string;
  defenderLabel: string;
  targetState?: number;
  message: string;
};

export type RuntimeHitOverrideHooks<TDefender extends RuntimeHitOverrideActor = RuntimeHitOverrideActor> = {
  tryEnterState: (defender: TDefender, stateNo: number) => boolean;
};

export class RuntimeHitOverrideWorld {
  tickSlots(state: Pick<CharacterRuntimeState, "hitOverrides">): void {
    if (!state.hitOverrides) {
      return;
    }
    const next = state.hitOverrides
      .map((slot) => tickHitOverrideSlot(slot))
      .filter((slot): slot is RuntimeHitOverrideSlot => slot !== undefined);
    state.hitOverrides = next.length > 0 ? next : undefined;
  }

  applyRedirect<
    TAttacker extends RuntimeHitOverrideActor,
    TDefender extends RuntimeHitOverrideActor,
  >(
    attacker: TAttacker,
    defender: TDefender,
    override: RuntimeHitOverrideSlot,
    hitPause: number,
    hooks: RuntimeHitOverrideHooks<TDefender>,
  ): RuntimeHitOverrideRedirect {
    attacker.hitPause = hitPause;
    defender.hitPause = hitPause;
    defender.hitStun = 0;
    defender.runtime.guardStun = 0;
    defender.runtime.guardSlideTime = 0;
    defender.runtime.guardControlTime = 0;
    defender.runtime.guardSlideTimeRemaining = undefined;
    defender.runtime.guardControlTimeRemaining = undefined;
    defender.runtime.guarding = override.forceGuard ?? false;
    if (override.forceGuard) {
      markRuntimeEffectActorGotHit(defender);
    }
    if (override.forceAir) {
      defender.runtime.stateType = "A";
      defender.runtime.physics = "A";
    }
    if (!override.keepState && override.stateNo !== undefined) {
      hooks.tryEnterState(defender, override.stateNo);
    }
    const targetState = override.stateNo !== undefined ? ` to state ${override.stateNo}` : "";
    return {
      attackerLabel: attacker.label,
      defenderLabel: defender.label,
      targetState: override.stateNo,
      message: `${defender.label} HitOverride slot ${override.slot} redirected ${attacker.label}${targetState}`,
    };
  }
}

export function shouldRuntimeHitOverrideMissDirect(
  move: Pick<DemoMove, "missOnOverride" | "p1StateNo" | "p2StateNo">,
): boolean {
  if (move.missOnOverride !== undefined) {
    return move.missOnOverride;
  }
  return move.p1StateNo !== undefined || move.p2StateNo !== undefined;
}

function tickHitOverrideSlot(slot: RuntimeHitOverrideSlot | undefined): RuntimeHitOverrideSlot | undefined {
  if (!slot || slot.remaining === Number.POSITIVE_INFINITY) {
    return slot;
  }
  const remaining = Math.max(0, slot.remaining - 1);
  return remaining > 0 ? { ...slot, remaining } : undefined;
}
