import type { CharacterRuntimeState, RuntimeHitBySlot } from "./types";

export type RuntimeHitEligibilityTickResult = {
  slot1Active: boolean;
  slot2Active: boolean;
};

export class RuntimeHitEligibilityWorld {
  resetFrameFlags(state: CharacterRuntimeState): void {
    resetRuntimeAssertSpecial(state);
  }

  tickHitBySlots(state: CharacterRuntimeState): RuntimeHitEligibilityTickResult {
    return tickRuntimeHitBySlots(state);
  }
}

export function resetRuntimeAssertSpecial(state: CharacterRuntimeState): void {
  state.assertSpecial = undefined;
  state.renderOpacity = undefined;
}

export function tickRuntimeHitBySlots(state: CharacterRuntimeState): RuntimeHitEligibilityTickResult {
  const next = state.hitBy ? { ...state.hitBy } : undefined;
  if (!next) {
    return { slot1Active: false, slot2Active: false };
  }

  next.slot1 = tickRuntimeHitBySlot(next.slot1);
  next.slot2 = tickRuntimeHitBySlot(next.slot2);
  state.hitBy = next.slot1 || next.slot2 ? next : undefined;
  return {
    slot1Active: Boolean(next.slot1),
    slot2Active: Boolean(next.slot2),
  };
}

export function tickRuntimeHitBySlot(slot: RuntimeHitBySlot | undefined): RuntimeHitBySlot | undefined {
  if (!slot || slot.remaining === Number.POSITIVE_INFINITY) {
    return slot;
  }
  const remaining = Math.max(0, slot.remaining - 1);
  return remaining > 0 ? { ...slot, remaining } : undefined;
}
