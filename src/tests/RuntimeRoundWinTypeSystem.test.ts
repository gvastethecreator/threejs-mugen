import { describe, expect, it } from "vitest";
import {
  recordRuntimeRootSelfKoCause,
  resolveRuntimeRoundWinTypeFromAttack,
} from "../mugen/runtime/RuntimeRoundWinTypeSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeRoundWinTypeSystem", () => {
  it.each([
    ["S,NA", "normal"],
    ["S,SA", "special"],
    ["S,HA", "hyper"],
    ["S,NT", "throw"],
    ["S,HA,ST", "hyper"],
  ] as const)("maps %s to %s using source precedence", (attr, expected) => {
    expect(resolveRuntimeRoundWinTypeFromAttack(attr)).toBe(expected);
  });

  it("records a root-owned self KO on the opposing root", () => {
    const victim = actor("p1", 0, "I", true, 1);
    const winner = actor("p2", 100, "I");

    recordRuntimeRootSelfKoCause(victim, winner, 100, "p1");

    expect(winner.runtime.roundWinType).toBe("suicide");
  });

  it.each([
    ["hit-state suicide", "p1", 1, 1, "p1", "suicide"],
    ["hit-state teammate", "p1", 1, 3, "p3", "teammate"],
  ] as const)("records %s from explicit hit source identity", (_label, victimId, victimPlayerNo, sourcePlayerNo, sourceRootId, expected) => {
    const victim = actor(victimId, 0, "H", true, victimPlayerNo, {
      sourcePlayerNo,
      sourceActorId: sourceRootId,
      sourceRootId,
      sourceRootOwned: true,
    });
    const winner = actor("p2", 100, "I");

    recordRuntimeRootSelfKoCause(victim, winner, 100, victim.id);

    expect(winner.runtime.roundWinType).toBe(expected);
  });

  it.each([
    ["hyper", "S,HA", false],
    ["cheese", "S,NA", true],
  ] as const)("preserves rival %s cause through hit-state KO metadata", (_label, sourceAttr, sourceGuardKo) => {
    const victim = actor("p1", 0, "H", true, 1, {
      sourcePlayerNo: 2,
      sourceActorId: "p2",
      sourceRootId: "p2",
      sourceRootOwned: true,
      sourceAttr,
      sourceGuardKo,
    });
    const winner = actor("p2", 100, "I");

    recordRuntimeRootSelfKoCause(victim, winner, 100, victim.id);

    expect(winner.runtime.roundWinType).toBe(_label);
  });

  it.each([
    ["helper-owned", actor("p1-helper-0", 0, "I", false), actor("p2", 100, "I"), "p1-helper-0"],
    ["received-hit state", actor("p1", 0, "H"), actor("p2", 100, "I"), "p1"],
    ["wrong source owner", actor("p1", 0, "I"), actor("p2", 100, "I"), "p2"],
    ["still alive", actor("p1", 10, "I"), actor("p2", 100, "I"), "p1"],
    ["helper projectile source", actor("p1", 0, "H", true, 1, {
      sourcePlayerNo: 1,
      sourceActorId: "p1",
      sourceRootId: "p1",
      sourceRootOwned: false,
    }), actor("p2", 100, "I"), "p1"],
    ["opposing hit source", actor("p1", 0, "H", true, 1, {
      sourcePlayerNo: 2,
      sourceActorId: "p2",
      sourceRootId: "p2",
      sourceRootOwned: true,
    }), actor("p2", 100, "I"), "p1"],
  ] as const)("does not classify %s as suicide", (_label, victim, winner, ownerId) => {
    recordRuntimeRootSelfKoCause(victim, winner, 100, ownerId);

    expect(winner.runtime.roundWinType).toBeUndefined();
  });
});

function actor(
  id: string,
  life: number,
  moveType: CharacterRuntimeState["moveType"],
  playerType = true,
  playerNo?: number,
  hitVars: CharacterRuntimeState["hitVars"] = undefined,
) {
  return {
    id,
    ...(playerNo === undefined ? {} : { playerNo }),
    runtime: {
      life,
      moveType,
      roundWinType: undefined,
      hitVars,
      teamState: { disabled: false, standby: false, overKo: false, playerType },
    } satisfies Pick<CharacterRuntimeState, "life" | "moveType" | "roundWinType" | "teamState" | "hitVars">,
  };
}
