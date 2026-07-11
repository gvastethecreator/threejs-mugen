import type { RuntimeTeamState } from "./types";

export type RuntimeRootParticipationRecord = {
  id: string;
  side: 1 | 2;
  owned: true;
  disabled: boolean;
  standby: boolean;
  structurallyActive: boolean;
  scheduled: boolean;
  inputOwned: boolean;
  combatOwned: boolean;
  roundOwned: boolean;
  presented: boolean;
  effectStoreOwned: boolean;
};

export type RuntimeRootParticipationDiagnostic = {
  schema: "RuntimeRootParticipation/v0";
  roots: RuntimeRootParticipationRecord[];
};

export type RuntimeRootParticipationInput = {
  roots: readonly { id: string; side: 1 | 2; teamState: RuntimeTeamState }[];
  scheduledRootIds: readonly string[];
  inputOwnedRootIds: readonly string[];
  combatOwnedRootIds: readonly string[];
  roundOwnedRootIds: readonly string[];
  presentedRootIds: readonly string[];
  effectStoreOwnedRootIds: readonly string[];
};

export class RuntimeRootParticipationWorld {
  diagnostic(input: RuntimeRootParticipationInput): RuntimeRootParticipationDiagnostic {
    const scheduled = new Set(input.scheduledRootIds);
    const inputOwned = new Set(input.inputOwnedRootIds);
    const combatOwned = new Set(input.combatOwnedRootIds);
    const roundOwned = new Set(input.roundOwnedRootIds);
    const presented = new Set(input.presentedRootIds);
    const effectStoreOwned = new Set(input.effectStoreOwnedRootIds);

    return {
      schema: "RuntimeRootParticipation/v0",
      roots: input.roots.map(({ id, side, teamState }) => ({
        id,
        side,
        owned: true,
        disabled: teamState.disabled,
        standby: teamState.standby,
        structurallyActive:
          teamState.playerType && !teamState.disabled && !teamState.standby && !teamState.overKo,
        scheduled: scheduled.has(id),
        inputOwned: inputOwned.has(id),
        combatOwned: combatOwned.has(id),
        roundOwned: roundOwned.has(id),
        presented: presented.has(id),
        effectStoreOwned: effectStoreOwned.has(id),
      })),
    };
  }
}
