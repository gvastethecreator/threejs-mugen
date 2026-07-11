import { describe, expect, it } from "vitest";
import { RuntimeTagPartnerSelectionWorld } from "../mugen/runtime/RuntimeTagPartnerSelectionSystem";
import type { FighterMatchState } from "../mugen/runtime/RuntimeFighterStateSystem";

describe("RuntimeTagPartnerSelectionWorld", () => {
  it("selects cyclic same-side roots after the caller", () => {
    const roots = [root("p1", 1), root("p2", 2), root("p3", 1), root("p4", 2), root("p5", 1)];
    const world = new RuntimeTagPartnerSelectionWorld();

    expect(world.select(roots, roots[0]!, 0)?.id).toBe("p3");
    expect(world.select(roots, roots[0]!, 1)?.id).toBe("p5");
    expect(world.select(roots, roots[0]!, 2)?.id).toBe("p1");
    expect(world.select(roots, roots[2]!, 0)?.id).toBe("p5");
    expect(world.select(roots, roots[3]!, 0)?.id).toBe("p2");
  });

  it("fails closed for invalid ordinals, helpers, and a side without partners", () => {
    const p1 = root("p1", 1);
    const helper = root("p1-helper", 1, false);
    const world = new RuntimeTagPartnerSelectionWorld();

    expect(world.select([p1, helper], p1, 0)).toBeUndefined();
    expect(world.select([p1, helper], helper, 0)).toBeUndefined();
    expect(world.select([p1], p1, -1)).toBeUndefined();
    expect(world.select([p1], p1, 0.5)).toBeUndefined();

    const disabledPartner = root("p3", 1);
    disabledPartner.runtime.teamState!.disabled = true;
    expect(world.select([p1, disabledPartner], p1, 0)).toBeUndefined();
  });
});

function root(id: string, side: 1 | 2, playerType = true): FighterMatchState {
  return {
    id,
    runtime: { teamState: { disabled: false, standby: false, overKo: false, playerType } },
    teamSide: side,
  } as unknown as FighterMatchState;
}
