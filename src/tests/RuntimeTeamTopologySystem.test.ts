import { describe, expect, it } from "vitest";
import {
  RuntimeTeamTopologyWorld,
  runtimeAffectTeamAllows,
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

  it("separates complete teams from active EnemyNear and P2 candidate lists", () => {
    const p1 = { id: "p1" };
    const p2 = { id: "p2", standby: true };
    const p4 = { id: "p4" };
    const nonPlayerRoot = { id: "p8", playerType: false };
    const p4Helper = { id: "p4-helper-0", rootId: "p4", playerType: true };
    const p2Helper = { id: "p2-helper-0", rootId: "p2", playerType: true, overKo: true };
    const disabled = { id: "p6", disabled: true };
    const topology = new RuntimeTeamTopologyWorld().create([p1, p2, p4, nonPlayerRoot, p4Helper, p2Helper, disabled]);

    expect(topology.opposingCharactersFor(p1)).toEqual([p2, p4, nonPlayerRoot, p4Helper, p2Helper, disabled]);
    expect(topology.enemyNearCandidatesFor(p1)).toEqual([p4]);
    expect(topology.p2CandidatesFor(p1)).toEqual([p4, p4Helper]);
  });

  it("publishes a stable multi-root roster diagnostic without claiming playable scheduling", () => {
    const topology = new RuntimeTeamTopologyWorld().create([
      { id: "p1" },
      { id: "p2" },
      { id: "p3", standby: true },
      { id: "p4", disabled: true },
      { id: "p3-helper-0", rootId: "p3", playerType: false },
      { id: "neutral" },
    ]);

    expect(topology.diagnostic()).toEqual({
      schema: "RuntimeTeamRoster/v0",
      characters: [
        { id: "p1", side: 1, kind: "root", disabled: false, standby: false, overKo: false, playerType: true, enemyBaseEligible: true, enemyNearCandidate: true, p2Candidate: true },
        { id: "p2", side: 2, kind: "root", disabled: false, standby: false, overKo: false, playerType: true, enemyBaseEligible: true, enemyNearCandidate: true, p2Candidate: true },
        { id: "p3", side: 1, kind: "root", disabled: false, standby: true, overKo: false, playerType: true, enemyBaseEligible: false, enemyNearCandidate: false, p2Candidate: false },
        { id: "p4", side: 2, kind: "root", disabled: true, standby: false, overKo: false, playerType: true, enemyBaseEligible: false, enemyNearCandidate: false, p2Candidate: false },
        { id: "p3-helper-0", rootId: "p3", side: 1, kind: "helper", disabled: false, standby: false, overKo: false, playerType: false, enemyBaseEligible: true, enemyNearCandidate: false, p2Candidate: false },
        { id: "neutral", side: null, kind: "root", disabled: false, standby: false, overKo: false, playerType: true, enemyBaseEligible: false, enemyNearCandidate: false, p2Candidate: false },
      ],
    });
  });

  it("evaluates AffectTeam policies while keeping unknown topology permissive", () => {
    expect(runtimeAffectTeamAllows(1, 2, 1)).toBe(true);
    expect(runtimeAffectTeamAllows(1, 1, 1)).toBe(false);
    expect(runtimeAffectTeamAllows(1, 1, 0)).toBe(true);
    expect(runtimeAffectTeamAllows(1, 1, -1)).toBe(true);
    expect(runtimeAffectTeamAllows(undefined, undefined, 1)).toBe(true);
  });
});
