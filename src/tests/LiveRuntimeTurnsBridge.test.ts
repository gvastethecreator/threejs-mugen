import { describe, expect, it } from "vitest";
import {
  projectLiveTurnsWorld,
  runLiveRuntimeTurnsBridge,
  runLiveTurnsReplacementHandoff,
} from "../mugen/runtime/LiveRuntimeTurnsBridge";
import { checksumRuntimeTurnsWorld } from "../mugen/runtime/RuntimeTurnsTransaction";

const roots = [
  {
    id: "p1a",
    side: 1 as const,
    life: 0,
    lifeMax: 1000,
    power: 0,
    standby: false,
    overKo: true,
    stateNo: 5050,
  },
  {
    id: "p1b",
    side: 1 as const,
    life: 1000,
    lifeMax: 1000,
    power: 0,
    standby: true,
    overKo: false,
    stateNo: 0,
  },
  {
    id: "p2a",
    side: 2 as const,
    life: 800,
    lifeMax: 1000,
    power: 50,
    standby: false,
    overKo: false,
    stateNo: 0,
  },
];

describe("LiveRuntimeTurnsBridge", () => {
  it("projects live roots and commits a replacement handoff", () => {
    const pre = projectLiveTurnsWorld({ tick: 12, roundNo: 1, roots });
    const report = runLiveTurnsReplacementHandoff({ tick: 12, roundNo: 1, roots });
    expect(report.schema).toBe("LiveRuntimeTurnsBridge/v1");
    expect(report.transaction.applied).toBe(true);
    expect(report.transaction.restored).toBe(false);
    expect(report.transaction.phases).toEqual(["prepare", "validate", "commit"]);
    expect(report.transaction.preimageChecksum).toBe(checksumRuntimeTurnsWorld(pre));
    expect(report.world.actors.find((a) => a.id === "p1b")?.standby).toBe(false);
    expect(report.world.actors.find((a) => a.id === "p1b")?.stateNo).toBe(5900);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it("restores preimage on post-commit fault", () => {
    const pre = projectLiveTurnsWorld({ tick: 12, roundNo: 1, roots });
    const report = runLiveTurnsReplacementHandoff({
      tick: 12,
      roundNo: 1,
      roots,
      injectFaultAfterCommit: true,
    });
    expect(report.transaction.applied).toBe(false);
    expect(report.transaction.restored).toBe(true);
    expect(report.transaction.phases).toContain("restore");
    expect(checksumRuntimeTurnsWorld(report.world)).toBe(checksumRuntimeTurnsWorld(pre));
  });

  it("restores on pre-commit fault and rejects invalid mutate", () => {
    const report = runLiveRuntimeTurnsBridge({
      tick: 1,
      roundNo: 1,
      roots,
      injectFaultBeforeCommit: true,
      mutate: (world) => world,
    });
    expect(report.transaction.restored).toBe(true);
    expect(report.transaction.applied).toBe(false);
  });
});
