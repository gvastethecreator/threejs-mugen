import type { CharacterRuntimeState } from "./types";

export type RuntimeOrientationState = Pick<CharacterRuntimeState, "pos" | "facing" | "assertSpecial">;

export class RuntimeOrientationWorld {
  updateAutoFacing(self: RuntimeOrientationState, opponent: Pick<CharacterRuntimeState, "pos">): void {
    updateRuntimeAutoFacing(self, opponent);
  }

  applyTurn(state: Pick<CharacterRuntimeState, "facing">): void {
    applyRuntimeTurn(state);
  }
}

export function updateRuntimeAutoFacing(
  self: RuntimeOrientationState,
  opponent: Pick<CharacterRuntimeState, "pos">,
): void {
  if (self.assertSpecial?.noAutoTurn) {
    return;
  }
  self.facing = self.pos.x <= opponent.pos.x ? 1 : -1;
}

export function applyRuntimeTurn(state: Pick<CharacterRuntimeState, "facing">): void {
  state.facing = state.facing === 1 ? -1 : 1;
}
