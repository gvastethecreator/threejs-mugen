import { describe, expect, it } from "vitest";
import {
  RUNTIME_DRAW_POSE_STATE,
  RUNTIME_LOSE_POSE_STATE,
  RUNTIME_WIN_POSE_STATE,
  RuntimeRoundWinPoseWorld,
} from "../mugen/runtime/RuntimeRoundWinPoseSystem";

const actors = [
  { id: "p1", label: "P1" },
  { id: "p2", label: "P2" },
];

describe("RuntimeRoundWinPoseWorld", () => {
  it("starts winner and loser reserved states once at phase 4", () => {
    const world = new RuntimeRoundWinPoseWorld();
    const entered: string[] = [];

    const snapshot = world.apply({
      phase: 4,
      winner: "P1",
      actors,
      canEnterState: (_actor, stateNo) => stateNo === RUNTIME_WIN_POSE_STATE || stateNo === RUNTIME_LOSE_POSE_STATE,
      enterState: (actor, stateNo) => entered.push(`${actor.id}:${stateNo}`),
    });

    expect(snapshot).toMatchObject({
      schema: "mugen-web-sandbox/runtime-round-win-pose/v0",
      phase: 4,
      status: "started",
      winner: "P1",
      actors: [
        {
          actorId: "p1",
          role: "winner",
          requestedStateNo: 180,
          status: "started",
          appliedStateNo: 180,
        },
        {
          actorId: "p2",
          role: "loser",
          requestedStateNo: 170,
          status: "started",
          appliedStateNo: 170,
        },
      ],
    });
    expect(entered).toEqual(["p1:180", "p2:170"]);

    world.apply({
      phase: 4,
      winner: "P1",
      actors,
      canEnterState: () => true,
      enterState: (actor, stateNo) => entered.push(`${actor.id}:${stateNo}`),
    });

    expect(entered).toEqual(["p1:180", "p2:170"]);
  });

  it("maps a draw to state 175 and fails closed when the state is unavailable", () => {
    const world = new RuntimeRoundWinPoseWorld();
    const snapshot = world.apply({
      phase: 4,
      winner: "Draw",
      actors,
      canEnterState: () => false,
      enterState: () => {
        throw new Error("unavailable state must not be entered");
      },
    });

    expect(snapshot).toMatchObject({
      status: "unavailable",
      actors: [
        { actorId: "p1", role: "draw", requestedStateNo: RUNTIME_DRAW_POSE_STATE, status: "unavailable" },
        { actorId: "p2", role: "draw", requestedStateNo: RUNTIME_DRAW_POSE_STATE, status: "unavailable" },
      ],
      diagnostics: ["state-unavailable"],
    });
  });

  it("fails closed when the winner label is ambiguous", () => {
    const world = new RuntimeRoundWinPoseWorld();
    const snapshot = world.apply({
      phase: 4,
      winner: "P1",
      actors: [
        { id: "p1", label: "P1" },
        { id: "p2", label: "P1" },
      ],
      canEnterState: () => true,
      enterState: () => {
        throw new Error("ambiguous winner must not be entered");
      },
    });

    expect(snapshot).toMatchObject({
      status: "unavailable",
      diagnostics: ["ambiguous-winner-label", "state-unavailable"],
    });
  });

  it("does not mutate before phase 4 and resets the one-shot ledger", () => {
    const world = new RuntimeRoundWinPoseWorld();
    expect(world.apply({
      phase: 3,
      winner: "P1",
      actors,
      canEnterState: () => true,
      enterState: () => undefined,
    })).toBeUndefined();
    expect(world.snapshot()).toBeUndefined();

    world.apply({
      phase: 4,
      winner: "P1",
      actors: [actors[0]!],
      canEnterState: () => true,
      enterState: () => undefined,
    });
    expect(world.snapshot()).toBeDefined();
    world.reset();
    expect(world.snapshot()).toBeUndefined();
  });
});
