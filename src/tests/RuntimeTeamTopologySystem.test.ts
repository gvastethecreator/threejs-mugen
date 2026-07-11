import { describe, expect, it } from "vitest";
import {
  RuntimeTeamTopologyWorld,
  runtimeTeamSideFromId,
} from "../mugen/runtime/RuntimeTeamTopologySystem";

describe("RuntimeTeamTopologyWorld", () => {
  it("maps IKEMEN interleaved player numbers onto two team sides", () => {
    expect(["p1", "p3", "p5", "p7"].map(runtimeTeamSideFromId)).toEqual([1, 1, 1, 1]);
    expect(["p2", "p4", "p6", "p8"].map(runtimeTeamSideFromId)).toEqual([2, 2, 2, 2]);
    expect(runtimeTeamSideFromId("p3-helper-0")).toBe(1);
    expect(runtimeTeamSideFromId("p9")).toBeUndefined();
    expect(runtimeTeamSideFromId("stage-effect")).toBeUndefined();
  });

  it("enumerates opposing roots and helpers in stable roster order", () => {
    const p1 = { id: "p1" };
    const p3 = { id: "p3" };
    const p3Helper = { id: "helper-a", rootId: "p3" };
    const p2 = { id: "p2" };
    const p4 = { id: "p4" };
    const p4Helper = { id: "helper-b", rootId: "p4" };
    const neutral = { id: "neutral" };
    const topology = new RuntimeTeamTopologyWorld().create([
      p1,
      p2,
      p3,
      p4,
      p3Helper,
      p4Helper,
      neutral,
    ]);

    expect(topology.charactersFor(1)).toEqual([p1, p3, p3Helper]);
    expect(topology.charactersFor(2)).toEqual([p2, p4, p4Helper]);
    expect(topology.opposingCharactersFor(p3Helper)).toEqual([p2, p4, p4Helper]);
    expect(topology.opposingCharactersFor(p4)).toEqual([p1, p3, p3Helper]);
    expect(topology.opposingCharactersFor(neutral)).toEqual([]);
  });
});
