import { runtimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { FighterMatchState } from "./RuntimeFighterStateSystem";

export class RuntimeTagPartnerSelectionWorld {
  select(
    roots: readonly FighterMatchState[],
    caller: FighterMatchState,
    partnerOrdinal: number,
  ): FighterMatchState | undefined {
    if (
      !Number.isInteger(partnerOrdinal) ||
      partnerOrdinal < 0 ||
      !caller.runtime.teamState?.playerType ||
      caller.runtime.teamState.disabled
    ) {
      return undefined;
    }
    const side = runtimeTeamSide(caller);
    const teammates = roots.filter(
      (root) => root.runtime.teamState?.playerType && !root.runtime.teamState.disabled && runtimeTeamSide(root) === side,
    );
    const callerIndex = teammates.indexOf(caller);
    if (callerIndex < 0 || teammates.length < 2) {
      return undefined;
    }
    return teammates[(callerIndex + partnerOrdinal + 1) % teammates.length];
  }
}
