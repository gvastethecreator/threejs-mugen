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
    const victim = actor("p1", 0, "I");
    const winner = actor("p2", 100, "I");

    recordRuntimeRootSelfKoCause(victim, winner, 100, "p1");

    expect(winner.runtime.roundWinType).toBe("suicide");
  });

  it.each([
    ["helper-owned", actor("p1-helper-0", 0, "I", false), actor("p2", 100, "I"), "p1-helper-0"],
    ["received-hit state", actor("p1", 0, "H"), actor("p2", 100, "I"), "p1"],
    ["wrong source owner", actor("p1", 0, "I"), actor("p2", 100, "I"), "p2"],
    ["still alive", actor("p1", 10, "I"), actor("p2", 100, "I"), "p1"],
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
) {
  return {
    id,
    runtime: {
      life,
      moveType,
      roundWinType: undefined,
      teamState: { disabled: false, standby: false, overKo: false, playerType },
    } satisfies Pick<CharacterRuntimeState, "life" | "moveType" | "roundWinType" | "teamState">,
  };
}
