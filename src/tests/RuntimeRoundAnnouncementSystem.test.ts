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
      roundSound: { group: 8, index: 2, soundPrefix: "FS" },
      callFightTimeFrames: 1,
      fightTimeFrames: 3,
      fightSoundTimeFrames: 1,
      fightSound: { group: 7, index: 1, soundPrefix: "fs" },
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
      round: { phase: "active", elapsed: 2, soundDue: true, sound: { group: 8, index: 2, soundPrefix: "fs" } },
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
      fight: { phase: "active", elapsed: 1, soundDue: true, sound: { group: 7, index: 1, soundPrefix: "fs" } },
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

  it("selects round-number, single-round, and final-round sounds before the default fallback", () => {
    const timing = resolveRuntimeRoundAnnouncementTiming({
      roundTimeFrames: 1,
      roundSoundTimeFrames: 1,
      roundSound: { group: 8, index: 2, soundPrefix: "fs" },
      roundSoundsByNumber: { 2: { group: 9, index: 4, soundPrefix: "FS" } },
      roundSingleSound: { group: 10, index: 0, soundPrefix: "fs" },
      roundFinalSound: { group: 11, index: 1, soundPrefix: "fs" },
    })!;

    const roundTwo = new RuntimeRoundAnnouncementWorld(timing);
    roundTwo.advance({ introActive: false, shutterActive: false, roundNo: 2 });
    roundTwo.advance({ introActive: false, shutterActive: false, roundNo: 2 });
    expect(roundTwo.snapshot().round.sound).toEqual({ group: 9, index: 4, soundPrefix: "fs" });

    const single = new RuntimeRoundAnnouncementWorld(timing);
    single.advance({ introActive: false, shutterActive: false, mode: "single" });
    single.advance({ introActive: false, shutterActive: false, mode: "single" });
    expect(single.snapshot().round.sound).toEqual({ group: 10, index: 0, soundPrefix: "fs" });

    const final = new RuntimeRoundAnnouncementWorld(timing);
    final.advance({ introActive: false, shutterActive: false, mode: "final" });
    final.advance({ introActive: false, shutterActive: false, mode: "final" });
    expect(final.snapshot().round.sound).toEqual({ group: 11, index: 1, soundPrefix: "fs" });
  });

  it("forwards the selected FightScreen round mode through RuntimeRoundSystem", () => {
    const timing = resolveRuntimeRoundAnnouncementTiming({
      roundTimeFrames: 0,
      roundSingleSound: { group: 10, index: 0, soundPrefix: "fs" },
    })!;
    const round = new RuntimeRoundSystem(10, "unknown", { announcement: timing });

    round.tickTimer({ announcementMode: "single" });

    expect(round.snapshot().announcement?.round.sound).toEqual({ group: 10, index: 0, soundPrefix: "fs" });
  });
});
