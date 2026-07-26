import { describe, expect, it } from "vitest";
import {
  checksumRuntimeTurnsWorld,
  runRuntimeTurnsTransaction,
  type RuntimeTurnsWorldSnapshot,
} from "../mugen/runtime/RuntimeTurnsTransaction";

function world(overrides: Partial<RuntimeTurnsWorldSnapshot> = {}): RuntimeTurnsWorldSnapshot {
  return {
    tick: 10,
    roundNo: 1,
    effectsChecksum: "fx0",
    actors: [
      {
        id: "p1a",
        side: 1,
        life: 0,
        lifeMax: 1000,
        power: 0,
        standby: false,
        overKo: true,
        stateNo: 5050,
      },
      {
        id: "p1b",
        side: 1,
        life: 1000,
        lifeMax: 1000,
        power: 0,
        standby: true,
        overKo: false,
        stateNo: 0,
      },
      {
        id: "p2a",
        side: 2,
        life: 800,
        lifeMax: 1000,
        power: 100,
        standby: false,
        overKo: false,
        stateNo: 0,
      },
    ],
    ...overrides,
  };
}

describe("RuntimeTurnsTransaction", () => {
  it("commits a replacement and records pre/post checksums", () => {
    const base = world();
    const { world: next, result } = runRuntimeTurnsTransaction({
      world: base,
      mutate: (current) => ({
        ...current,
        tick: current.tick + 1,
        actors: current.actors.map((actor) => {
          if (actor.id === "p1a") return { ...actor, standby: true, overKo: true };
          if (actor.id === "p1b") return { ...actor, standby: false, overKo: false, stateNo: 5900 };
          return actor;
        }),
      }),
    });
    expect(result.applied).toBe(true);
    expect(result.restored).toBe(false);
    expect(result.phases).toEqual(["prepare", "validate", "commit"]);
    expect(result.preimageChecksum).toBe(checksumRuntimeTurnsWorld(base));
    expect(result.postimageChecksum).toBe(checksumRuntimeTurnsWorld(next));
    expect(next.actors.find((actor) => actor.id === "p1b")?.standby).toBe(false);
  });

  it("restores the preimage when fault injection fires after commit", () => {
    const base = world();
    const { world: next, result } = runRuntimeTurnsTransaction({
      world: base,
      injectFaultAfterCommit: true,
      mutate: (current) => ({
        ...current,
        actors: current.actors.map((actor) =>
          actor.id === "p1b" ? { ...actor, standby: false } : actor,
        ),
      }),
    });
    expect(result.applied).toBe(false);
    expect(result.restored).toBe(true);
    expect(result.phases).toContain("restore");
    expect(checksumRuntimeTurnsWorld(next)).toBe(checksumRuntimeTurnsWorld(base));
  });

  it("blocks invalid preimages without mutating", () => {
    const base = world({ actors: [] });
    const { world: next, result } = runRuntimeTurnsTransaction({
      world: base,
      mutate: (current) => current,
    });
    expect(result.applied).toBe(false);
    expect(result.diagnostics).toContain("empty-roster");
    expect(next.actors).toEqual([]);
  });
});
