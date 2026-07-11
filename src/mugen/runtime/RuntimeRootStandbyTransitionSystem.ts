import type { FighterMatchState } from "./RuntimeFighterStateSystem";

export type RuntimeRootStandbyChange = {
  id: string;
  standby: boolean;
};

export class RuntimeRootStandbyTransitionWorld {
  apply(roots: readonly FighterMatchState[], changes: readonly RuntimeRootStandbyChange[]): void {
    const byId = new Map(roots.map((root) => [root.id, root]));
    const seen = new Set<string>();

    for (const change of changes) {
      if (seen.has(change.id)) {
        throw new Error(`Duplicate root standby change for ${change.id}`);
      }
      seen.add(change.id);
      const root = byId.get(change.id);
      if (!root) {
        throw new Error(`Unknown root standby target ${change.id}`);
      }
      if (!root.runtime.teamState?.playerType) {
        throw new Error(`Standby target ${change.id} is not a player root`);
      }
    }

    for (const change of changes) {
      byId.get(change.id)!.runtime.teamState!.standby = change.standby;
    }
  }
}
