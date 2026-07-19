import { describe, expect, it } from "vitest";
import {
  resolveRuntimeRoundAnnouncementTiming,
  RuntimeRoundAnnouncementWorld,
} from "../mugen/runtime/RuntimeRoundAnnouncementSystem";
import { RuntimeRoundSystem } from "../mugen/runtime/RuntimeRoundSystem";

describe("RuntimeRoundAnnouncementSystem", () => {
  it("normalizes source timing and keeps an absent [Round] contract absent", () => {
    expect(resolveRuntimeRoundAnnouncementTiming()).toBeUndefined();
    expect(resolveRuntimeRoundAnnouncementTiming({
      roundTimeFrames: 4.4,
      callFightTimeFrames: -2,
      fightTimeFrames: Number.NaN,
    })).toEqual({
      schema: "RuntimeRoundAnnouncementTiming/v0",
      roundTimeFrames: 4,
      roundSoundTimeFrames: 4,
      callFightTimeFrames: 0,
      fightTimeFrames: 0,
      fightSoundTimeFrames: 0,
    });
  });

  it("pauses through intro and shutter, then exposes round and fight sound edges", () => {
    const timing = resolveRuntimeRoundAnnouncementTiming({
      roundTimeFrames: 2,
      roundSoundTimeFrames: 2,
      callFightTimeFrames: 1,
      fightTimeFrames: 3,
      fightSoundTimeFrames: 1,
    })!;
    const world = new RuntimeRoundAnnouncementWorld(timing);

    expect(world.snapshot()).toMatchObject({
      visibility: "hidden",
      phase: "hidden",
      round: { phase: "pending", elapsed: 0, soundDue: false },
      fight: { phase: "pending", elapsed: 0, soundDue: false },
    });

    world.advance({ introActive: true, shutterActive: false });
    world.advance({ introActive: false, shutterActive: true });
    expect(world.snapshot()).toMatchObject({
      visibility: "hidden",
      round: { phase: "pending", elapsed: 0 },
      callFightElapsed: 0,
    });

    world.advance({ introActive: false, shutterActive: false });
    world.advance({ introActive: false, shutterActive: false });
    expect(world.snapshot()).toMatchObject({
      visibility: "visible",
      phase: "hidden",
      round: { phase: "pending", elapsed: 1 },
    });

    world.advance({ introActive: false, shutterActive: false });
    expect(world.snapshot()).toMatchObject({
      visibility: "visible",
      phase: "round",
      round: { phase: "active", elapsed: 2, soundDue: true },
      fight: { phase: "pending" },
    });

    world.advance({ introActive: false, shutterActive: false });
    expect(world.snapshot()).toMatchObject({
      phase: "fight",
      fight: { phase: "active", elapsed: 0, soundDue: false },
    });

    world.advance({ introActive: false, shutterActive: false });
    expect(world.snapshot()).toMatchObject({
      phase: "fight",
      fight: { phase: "active", elapsed: 1, soundDue: true },
      completion: "asset-owned",
    });

    world.reset();
    expect(world.snapshot()).toMatchObject({
      visibility: "hidden",
      phase: "hidden",
      round: { phase: "pending", elapsed: 0 },
      fight: { phase: "pending", elapsed: 0 },
    });
  });

  it("publishes and resets the announcement snapshot with the round system", () => {
    const timing = resolveRuntimeRoundAnnouncementTiming({ roundTimeFrames: 0 })!;
    const round = new RuntimeRoundSystem(10, "ikemen-go", { announcement: timing });

    expect(round.snapshot().announcement).toMatchObject({
      schema: "RuntimeRoundAnnouncement/v0",
      visibility: "hidden",
      phase: "hidden",
    });

    round.tickTimer();
    expect(round.snapshot().announcement).toMatchObject({
      visibility: "visible",
      phase: "round",
      round: { phase: "active" },
    });

    round.restartCurrentRound();
    expect(round.snapshot().announcement).toMatchObject({
      visibility: "hidden",
      phase: "hidden",
      round: { phase: "pending", elapsed: 0 },
    });
  });

  it("keeps skipped Round/Fight displays hidden while preserving the phase clock contract", () => {
    const timing = resolveRuntimeRoundAnnouncementTiming({
      roundTimeFrames: 4,
      callFightTimeFrames: 60,
      fightTimeFrames: 5,
    })!;
    const world = new RuntimeRoundAnnouncementWorld(timing);

    world.advance({
      introActive: false,
      shutterActive: false,
      skipRoundDisplay: true,
      skipFightDisplay: true,
    });

    expect(world.snapshot()).toMatchObject({
      visibility: "visible",
      phase: "hidden",
      roundDisplaySkipped: true,
      fightDisplaySkipped: true,
      round: { phase: "active", skipped: true, soundDue: false },
      fight: { phase: "active", skipped: true, elapsed: 5, soundDue: false },
    });
  });
});
