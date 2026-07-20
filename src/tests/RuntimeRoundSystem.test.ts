import { describe, expect, it } from "vitest";
import {
  DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES,
  DEFAULT_RUNTIME_POST_KO_FRAMES,
  resolveRuntimeRoundTiming,
  RuntimeRoundSystem,
} from "../mugen/runtime/RuntimeRoundSystem";
import type { RuntimeRoundAnnouncementSound } from "../mugen/runtime/RuntimeRoundAnnouncementSystem";

const soundPair = (
  left?: RuntimeRoundAnnouncementSound,
  right?: RuntimeRoundAnnouncementSound,
): [RuntimeRoundAnnouncementSound | undefined, RuntimeRoundAnnouncementSound | undefined] => [left, right];

const outcomeTiming = {
  koTimeFrames: 1,
  koSoundTimeFrames: 1,
  doubleKoTimeFrames: 1,
  doubleKoSoundTimeFrames: 1,
  doubleKoShowDraw: true,
  timeOverTimeFrames: 1,
  timeOverSoundTimeFrames: 1,
  winTimeFrames: 1,
  winSoundTimeFrames: 1,
};

describe("RuntimeRoundSystem", () => {
  it("owns the fight timer snapshot without ending a live round", () => {
    const round = new RuntimeRoundSystem(61);

    expect(round.snapshot()).toEqual({
      state: "fight",
      timer: 2,
      winner: undefined,
      message: "Fight",
    });

    round.tickTimer();

    expect(round.snapshot()).toMatchObject({ state: "fight", timer: 1, message: "Fight" });
    expect(round.isOver).toBe(false);
  });

  it("finishes a KO round and emits the previous runtime message", () => {
    const round = new RuntimeRoundSystem();

    const result = round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });

    expect(result).toEqual({
      state: "ko",
      winner: "P1",
      message: "P1 wins - press Reset to fight again",
    });
    expect(round.snapshot()).toEqual({
      state: "ko",
      timer: 99,
      roundPhase: 3,
      winner: "P1",
      message: "P1 wins",
      postRound: {
        schema: "RuntimePostRound/v0",
        frame: 0,
        remaining: 255,
        duration: 255,
        slowRemaining: 60,
        slowDuration: 60,
        playbackRate: 0.25,
        noKoSlow: false,
      },
    });
    expect(round.isOver).toBe(false);
    expect(round.finishIfNeeded({ label: "P1", life: 0 }, { label: "P2", life: 600 })).toBeUndefined();
  });

  it("projects imported FightScreen outcome timing and one-shot sound edges", () => {
    const timing = {
      outcome: {
        koTimeFrames: 3,
        koSoundTimeFrames: 2,
        koSound: { group: 7, index: 1, soundPrefix: "fs" },
        doubleKoTimeFrames: 4,
        doubleKoSoundTimeFrames: 3,
        doubleKoSound: { group: 7, index: 2, soundPrefix: "fs" },
        doubleKoShowDraw: true,
        timeOverTimeFrames: 5,
        timeOverSoundTimeFrames: 4,
        timeOverSound: { group: 7, index: 3, soundPrefix: "fs" },
        winTimeFrames: 6,
        winSoundTimeFrames: 5,
        winSound: { group: 7, index: 5, soundPrefix: "fs" },
        drawSound: { group: 7, index: 4, soundPrefix: "fs" },
        resultSounds: {
          win: {
            variants: [
              soundPair({ group: 8, index: 6, soundPrefix: "fs" }),
              soundPair(undefined, { group: 8, index: 7, soundPrefix: "fs" }),
              soundPair(),
              soundPair(),
            ],
          },
          aiWin: {
            variants: [
              soundPair(),
              soundPair({ group: 9, index: 1, soundPrefix: "fs" }),
            ],
          },
          aiLose: {
            variants: [soundPair({ group: 9, index: 2, soundPrefix: "fs" })],
          },
        },
      },
    };
    const round = new RuntimeRoundSystem(1, "ikemen-go", timing);
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });

    expect(round.snapshot().postRound?.outcome).toEqual({
      schema: "RuntimeRoundOutcome/v0",
      kind: "ko",
      displayStartFrame: 3,
      soundTime: 2,
      soundDue: false,
      showDraw: true,
      sound: { group: 7, index: 1, soundPrefix: "fs" },
      winnerDisplay: {
        schema: "RuntimeRoundWinnerDisplay/v0",
        kind: "win",
        phase: "pending",
        displayStartFrame: 51,
        soundTime: 50,
        soundDue: false,
        sound: { group: 8, index: 6, soundPrefix: "fs" },
        selection: {
          schema: "RuntimeRoundWinnerDisplaySelection/v0",
          family: "win",
          side: 0,
          winnerSide: 0,
          variant: 0,
        },
      },
    });

    round.tickTimer();
    expect(round.snapshot().postRound?.outcome?.soundDue).toBe(false);
    round.tickTimer();
    expect(round.snapshot().postRound?.outcome).toMatchObject({ kind: "ko", soundTime: 2, soundDue: true });

    const drawRound = new RuntimeRoundSystem(0, "ikemen-go", timing);
    drawRound.finishIfNeeded({ label: "P1", life: 0 }, { label: "P2", life: 0 });
    expect(drawRound.snapshot().postRound?.outcome).toMatchObject({
      kind: "time-over",
      displayStartFrame: 5,
      soundTime: 4,
      showDraw: true,
      sound: { group: 7, index: 3, soundPrefix: "fs" },
      winnerDisplay: {
        kind: "draw",
        phase: "pending",
        displayStartFrame: 51,
        soundTime: 50,
        sound: { group: 7, index: 4, soundPrefix: "fs" },
      },
    });

    const hiddenDrawRound = new RuntimeRoundSystem(1, "ikemen-go", {
      outcome: { ...timing.outcome, doubleKoShowDraw: false },
    });
    hiddenDrawRound.finishIfNeeded({ label: "P1", life: 0 }, { label: "P2", life: 0 });
    expect(hiddenDrawRound.snapshot().postRound?.outcome).not.toHaveProperty("winnerDisplay");
  });

  it("selects the active side and sound for AI result families", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      outcome: {
        koTimeFrames: 1,
        koSoundTimeFrames: 1,
        doubleKoTimeFrames: 1,
        doubleKoSoundTimeFrames: 1,
        doubleKoShowDraw: true,
        timeOverTimeFrames: 1,
        timeOverSoundTimeFrames: 1,
        winTimeFrames: 1,
        winSoundTimeFrames: 1,
        resultSounds: {
          win: { variants: [] },
          aiWin: { variants: [soundPair(), soundPair({ group: 9, index: 1, soundPrefix: "fs" })] },
          aiLose: { variants: [soundPair({ group: 9, index: 2, soundPrefix: "fs" })] },
        },
      },
    });
    round.finishIfNeeded(
      { label: "CPU", life: 600, side: 1, playerControlled: false, variantIndex: 1, winType: "perfect" },
      { label: "Player", life: 0, side: 0, playerControlled: true },
    );

    expect(round.snapshot().postRound?.outcome?.winnerDisplay).toMatchObject({
      kind: "win",
      sound: { group: 9, index: 1, soundPrefix: "fs" },
      selection: {
        schema: "RuntimeRoundWinnerDisplaySelection/v0",
        family: "aiWin",
        side: 0,
        variant: 1,
        winType: "perfect",
      },
    });

    const playerWin = new RuntimeRoundSystem(1, "ikemen-go", {
      outcome: {
        koTimeFrames: 1,
        koSoundTimeFrames: 1,
        doubleKoTimeFrames: 1,
        doubleKoSoundTimeFrames: 1,
        doubleKoShowDraw: true,
        timeOverTimeFrames: 1,
        timeOverSoundTimeFrames: 1,
        winTimeFrames: 1,
        winSoundTimeFrames: 1,
        resultSounds: {
          win: { variants: [] },
          aiWin: { variants: [] },
          aiLose: { variants: [soundPair({ group: 9, index: 2, soundPrefix: "fs" })] },
        },
      },
    });
    playerWin.finishIfNeeded(
      { label: "Player", life: 600, side: 0, playerControlled: true },
      { label: "CPU", life: 0, side: 1, playerControlled: false },
    );
    expect(playerWin.snapshot().postRound?.outcome?.winnerDisplay?.selection).toMatchObject({
      family: "aiLose",
      side: 0,
      variant: 0,
    });
  });

  it("derives perfect and clutch from life facts and preserves an explicit base record", () => {
    const perfectRound = new RuntimeRoundSystem(1, "ikemen-go", { outcome: outcomeTiming });
    perfectRound.finishIfNeeded(
      { label: "P1", life: 1000, lifeMax: 1000, side: 0, winTypeBase: "special" },
      { label: "P2", life: 0, lifeMax: 1000, side: 1 },
    );

    expect(perfectRound.snapshot().postRound?.outcome?.winnerDisplay?.selection).toMatchObject({
      winType: "perfect",
      winTypes: ["perfect", "special"],
    });

    const clutchRound = new RuntimeRoundSystem(1, "ikemen-go", {
      outcome: { ...outcomeTiming, clutchThresholdPercent: 20 },
    });
    clutchRound.finishIfNeeded(
      { label: "P1", life: 200, lifeMax: 1000, side: 0, winType: "special" },
      { label: "P2", life: 0, lifeMax: 1000, side: 1 },
    );

    expect(clutchRound.snapshot().postRound?.outcome?.winnerDisplay?.selection).toMatchObject({
      winType: "clutch",
      winTypes: ["clutch", "special"],
    });
  });

  it("keeps the win type absent when live lifeMax evidence is unavailable", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", { outcome: outcomeTiming });
    round.finishIfNeeded(
      { label: "P1", life: 1000, side: 0 },
      { label: "P2", life: 0, side: 1 },
    );

    expect(round.snapshot().postRound?.outcome?.winnerDisplay?.selection).not.toHaveProperty("winType");
  });

  it("advances the bounded KO slowdown and fades back to normal speed", () => {
    const round = new RuntimeRoundSystem();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });

    expect(round.snapshot().postRound).toMatchObject({ frame: 0, remaining: 255, slowRemaining: 60, playbackRate: 0.25, noKoSlow: false });
    for (let frame = 0; frame < 16; frame += 1) round.tickTimer();
    expect(round.snapshot().postRound).toMatchObject({ frame: 16, remaining: 239, slowRemaining: 44 });
    expect(round.playbackRate).toBeGreaterThan(0.25);
    for (let frame = 16; frame < 60; frame += 1) round.tickTimer();
    expect(round.isOver).toBe(false);
    expect(round.playbackRate).toBe(1);
    expect(round.snapshot().postRound).toMatchObject({ remaining: 195, slowRemaining: 0 });
    for (let frame = 60; frame < 255; frame += 1) round.tickTimer();
    expect(round.isOver).toBe(true);
    expect(round.currentPhase).toBe(4);
    expect(round.snapshot()).toMatchObject({ roundPhase: 4 });
  });

  it("emits a selected win type sound edge before the winner display becomes active", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      postKoPhase4StartFrames: 0,
      outcome: {
        koTimeFrames: 1,
        koSoundTimeFrames: 1,
        doubleKoTimeFrames: 1,
        doubleKoSoundTimeFrames: 1,
        doubleKoShowDraw: true,
        timeOverTimeFrames: 1,
        timeOverSoundTimeFrames: 1,
        winTimeFrames: 5,
        winSoundTimeFrames: 5,
        winTypeSounds: {
          p1: {
            perfect: {
              soundTimeFrames: 2,
              sound: { group: 7, index: 9, soundPrefix: "fs" },
            },
          },
          p2: {},
        },
      },
    });
    round.finishIfNeeded(
      { label: "P1", life: 600, side: 0, playerControlled: true, winType: "perfect" },
      { label: "P2", life: 0, side: 1, playerControlled: false },
    );

    expect(round.snapshot().postRound?.outcome?.winnerDisplay).toMatchObject({
      phase: "pending",
      displayStartFrame: 5,
      winTypeSoundTime: 2,
      winTypeSoundDue: false,
      winTypeSound: { group: 7, index: 9, soundPrefix: "fs" },
    });
    round.tickTimer();
    round.tickTimer();
    expect(round.snapshot().postRound?.outcome?.winnerDisplay).toMatchObject({
      phase: "pending",
      winTypeSoundTime: 2,
      winTypeSoundDue: true,
    });
  });

  it("composes perfect win type sound edges with the base normal record", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      postKoPhase4StartFrames: 0,
      outcome: {
        koTimeFrames: 1,
        koSoundTimeFrames: 1,
        doubleKoTimeFrames: 1,
        doubleKoSoundTimeFrames: 1,
        doubleKoShowDraw: true,
        timeOverTimeFrames: 1,
        timeOverSoundTimeFrames: 1,
        winTimeFrames: 6,
        winSoundTimeFrames: 6,
        winTypeSounds: {
          p1: {
            perfect: {
              soundTimeFrames: 2,
              sound: { group: 5, index: 0, soundPrefix: "fs" },
            },
            normal: {
              soundTimeFrames: 4,
              sound: { group: 5, index: 1, soundPrefix: "fs" },
            },
          },
          p2: {},
        },
      },
    });
    round.finishIfNeeded(
      { label: "P1", life: 600, side: 0, playerControlled: true, winType: "perfect" },
      { label: "P2", life: 0, side: 1, playerControlled: false },
    );

    expect(round.snapshot().postRound?.outcome?.winnerDisplay).toMatchObject({
      selection: { winType: "perfect", winTypes: ["perfect", "normal"] },
      winTypeSounds: [
        { name: "perfect", soundTime: 2, soundDue: false, sound: { group: 5, index: 0, soundPrefix: "fs" } },
        { name: "normal", soundTime: 4, soundDue: false, sound: { group: 5, index: 1, soundPrefix: "fs" } },
      ],
    });
    round.tickTimer();
    round.tickTimer();
    expect(round.snapshot().postRound?.outcome?.winnerDisplay?.winTypeSounds).toMatchObject([
      { name: "perfect", soundDue: true },
      { name: "normal", soundDue: false },
    ]);
    round.tickTimer();
    round.tickTimer();
    expect(round.snapshot().postRound?.outcome?.winnerDisplay?.winTypeSounds).toMatchObject([
      { name: "perfect", soundDue: false },
      { name: "normal", soundDue: true },
    ]);
  });

  it("opens phase 4 before the post-KO terminal window completes", () => {
    const round = new RuntimeRoundSystem();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });

    for (let frame = 0; frame < DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES - 1; frame += 1) {
      round.tickTimer();
    }

    expect(round.currentPhase).toBe(3);
    expect(round.isOver).toBe(false);

    round.tickTimer();

    expect(round.currentPhase).toBe(4);
    expect(round.isOver).toBe(false);
    expect(round.snapshot().postRound).toMatchObject({
      frame: DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES,
      remaining: DEFAULT_RUNTIME_POST_KO_FRAMES - DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES,
    });
  });

  it("derives phase-4 timing from normalized source-backed overrides", () => {
    const timing = resolveRuntimeRoundTiming({
      overHitTimeFrames: 1,
      postKoPhase4StartFrames: 2,
      winPoseFrames: 3,
      postKoFrames: 7,
      koSlowFrames: 4,
      koSlowFadeFrames: 99,
      koSlowRate: 2,
    });
    expect(timing).toEqual({
      overHitTimeFrames: 1,
      postKoPhase4StartFrames: 2,
      forceWinTimeFrames: 0,
      winPoseFrames: 3,
      overTimeFrames: 210,
      startWaitTimeFrames: 0,
      controlTimeFrames: 0,
      shutterTimeFrames: 0,
      shutterColor: [0, 0, 0],
      fadeInTimeFrames: 0,
      fadeInColor: [0, 0, 0],
      fadeOutTimeFrames: 0,
      fadeOutColor: [0, 0, 0],
      postKoFrames: 7,
      koSlowFrames: 4,
      koSlowFadeFrames: 4,
      koSlowRate: 1,
    });
    expect(resolveRuntimeRoundTiming({ overHitTimeFrames: 12, postKoPhase4StartFrames: 2 }).overHitTimeFrames).toBe(12);

    const round = new RuntimeRoundSystem(undefined, "ikemen-go", timing);
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });
    round.tickTimer();
    expect(round.currentPhase).toBe(3);
    round.tickTimer();

    expect(round.currentPhase).toBe(4);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 5, duration: 7, slowDuration: 4 });
    expect(round.winPoseFrames).toBe(3);
  });

  it("extends the imported terminal window when fadeout lasts longer than over.time", () => {
    const timing = resolveRuntimeRoundTiming({
      postKoPhase4StartFrames: 2,
      overTimeFrames: 4,
      fadeOutTimeFrames: 6,
      fadeOutColor: [12.4, 34.5, 300],
    });

    expect(timing).toMatchObject({
      overTimeFrames: 4,
      fadeOutTimeFrames: 6,
      fadeOutColor: [12, 35, 255],
      postKoFrames: 8,
    });

    const round = new RuntimeRoundSystem(1, "ikemen-go", timing);
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });
    expect(round.snapshot().postRound?.fadeOut).toMatchObject({ active: false, frame: 0, remaining: 6 });

    for (let frame = 0; frame < 3; frame += 1) round.tickTimer();
    expect(round.snapshot().postRound?.fadeOut).toMatchObject({ active: true, frame: 1, remaining: 5, opacity: 1 / 6 });

    for (let frame = 3; frame < 8; frame += 1) round.tickTimer();
    expect(round.isOver).toBe(true);
    expect(round.snapshot().postRound?.fadeOut).toMatchObject({ active: true, frame: 6, remaining: 0, opacity: 1 });
  });

  it("uses the imported FightScreen animation duration and emits its global sound reference", () => {
    const timing = resolveRuntimeRoundTiming({
      postKoPhase4StartFrames: 2,
      overTimeFrames: 4,
      fadeOutTimeFrames: 6,
      fadeOutAnimationNo: 7001,
      fadeOutAnimationDurationFrames: 8,
      fadeOutSound: [7, 1],
    });

    expect(timing).toMatchObject({
      fadeOutAnimationNo: 7001,
      fadeOutAnimationDurationFrames: 8,
      fadeOutSound: [7, 1],
      postKoFrames: 10,
    });

    const round = new RuntimeRoundSystem(1, "ikemen-go", timing);
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 });
    expect(round.snapshot().postRound?.fadeOut).toMatchObject({ active: false, frame: 0, duration: 8 });

    for (let frame = 0; frame < 3; frame += 1) round.tickTimer();
    expect(round.snapshot().postRound?.fadeOut).toMatchObject({
      active: true,
      frame: 1,
      animationNo: 7001,
      opacity: 0,
      sound: { group: 7, index: 1 },
    });
  });

  it("opens the imported FightScreen fade-in on reset and clears it on the next round", () => {
    const timing = resolveRuntimeRoundTiming({
      fadeInTimeFrames: 4,
      fadeInColor: [12.4, 34.5, 300],
      fadeInSound: [8, 2],
    });
    expect(timing).toMatchObject({
      fadeInTimeFrames: 4,
      fadeInColor: [12, 35, 255],
      fadeInSound: [8, 2],
    });

    const round = new RuntimeRoundSystem(120, "ikemen-go", timing);
    expect(round.snapshot().preRound?.fadeIn).toMatchObject({
      active: true,
      frame: 0,
      remaining: 4,
      duration: 4,
      opacity: 1,
      direction: "in",
    });
    expect(round.snapshot().preRound?.fadeIn?.sound).toBeUndefined();

    round.tickTimer();
    expect(round.snapshot().preRound?.fadeIn).toMatchObject({
      active: true,
      frame: 1,
      remaining: 3,
      opacity: 0.75,
      sound: { group: 8, index: 2 },
    });
    for (let frame = 1; frame < 4; frame += 1) round.tickTimer();
    expect(round.snapshot().preRound?.fadeIn).toMatchObject({ active: false, frame: 4, remaining: 0, opacity: 0 });

    round.startNextRound(120);
    expect(round.snapshot().preRound).toMatchObject({ frame: 0, remaining: 4, duration: 4 });
    expect(round.snapshot().preRound?.fadeIn).toMatchObject({ active: true, frame: 0, opacity: 1 });
  });

  it("lets an imported FightScreen fade-in animation own the pre-round duration", () => {
    const round = new RuntimeRoundSystem(120, "ikemen-go", {
      fadeInTimeFrames: 4,
      fadeInAnimationNo: 7001,
      fadeInAnimationDurationFrames: 6,
    });

    expect(round.snapshot().preRound?.fadeIn).toMatchObject({
      active: true,
      frame: 0,
      remaining: 6,
      duration: 6,
      animationNo: 7001,
      opacity: 0,
    });
    for (let frame = 0; frame < 6; frame += 1) round.tickTimer();
    expect(round.snapshot().preRound?.fadeIn).toMatchObject({ active: false, frame: 6, remaining: 0 });
  });

  it("holds the imported round timer until the source intro reaches fight", () => {
    const round = new RuntimeRoundSystem(121, "ikemen-go", {
      startWaitTimeFrames: 2,
      controlTimeFrames: 3,
    });

    expect(round.snapshot()).toMatchObject({
      state: "fight",
      timer: 3,
      roundPhase: 0,
      preRound: {
        intro: {
          schema: "RuntimeRoundIntro/v0",
          active: true,
          frame: 0,
          remaining: 6,
          duration: 6,
          startWaitTime: 2,
          controlTime: 3,
          phase: 0,
        },
      },
    });

    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ timer: 3, roundPhase: 0, preRound: { intro: { frame: 1, remaining: 5, phase: 0 } } });
    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ timer: 3, roundPhase: 1, preRound: { intro: { frame: 2, remaining: 4, phase: 1 } } });

    round.tickTimer();
    round.tickTimer();
    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ timer: 3, roundPhase: 1, preRound: { intro: { frame: 5, remaining: 1, phase: 1 } } });

    round.tickTimer();
    expect(round.snapshot()).toMatchObject({
      timer: 2,
      preRound: { intro: { active: false, frame: 6, remaining: 0, phase: 2 } },
    });
    expect(round.currentPhase).toBe(2);

    round.startNextRound(121);
    expect(round.snapshot()).toMatchObject({ roundNo: 2, roundPhase: 0, preRound: { intro: { frame: 0, remaining: 6, phase: 0 } } });
  });

  it("skips the imported character-intro wait through a source-shaped shutter", () => {
    const round = new RuntimeRoundSystem(121, "ikemen-go", {
      startWaitTimeFrames: 4,
      controlTimeFrames: 2,
      shutterTimeFrames: 3,
      shutterColor: [17, 18, 19],
    });

    expect(round.requestIntroSkip({ roundNoSkip: true })).toEqual({
      applied: false,
      reason: "round-no-skip",
      shutterStarted: false,
    });
    expect(round.snapshot().preRound?.shutter).toBeUndefined();

    expect(round.requestIntroSkip()).toEqual({ applied: true, reason: "applied", shutterStarted: true });
    expect(round.snapshot()).toMatchObject({
      roundPhase: 1,
      preRound: {
        intro: { remaining: 3, phase: 1 },
        shutter: {
          schema: "RuntimeRoundShutter/v0",
          active: true,
          frame: 0,
          remaining: 6,
          duration: 6,
          shutterTime: 3,
          color: [17, 18, 19],
          phase: "closing",
        },
      },
    });

    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ timer: 3, preRound: { shutter: { frame: 0, remaining: 6 } } });
    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ timer: 3, preRound: { shutter: { frame: 1, remaining: 5 } } });
    round.tickTimer();
    expect(round.snapshot()).toMatchObject({
      timer: 2,
      preRound: { intro: { active: false, remaining: 0 }, shutter: { frame: 2, remaining: 4 } },
    });

    expect(round.requestIntroSkip()).toEqual({ applied: false, reason: "inactive", shutterStarted: false });
    for (let frame = 0; frame < 4; frame += 1) round.tickTimer();
    expect(round.snapshot().preRound?.shutter).toBeUndefined();
  });

  it("signals the bounded actor reset at the source shutter edge exactly once", () => {
    const round = new RuntimeRoundSystem(121, "ikemen-go", {
      startWaitTimeFrames: 4,
      controlTimeFrames: 2,
      shutterTimeFrames: 3,
    });

    round.requestIntroSkip();
    expect(round.consumeIntroSkipResetSignal()).toBe(false);
    for (let frame = 0; frame < 3; frame += 1) {
      round.tickTimer();
      expect(round.consumeIntroSkipResetSignal()).toBe(false);
    }

    round.tickTimer();
    expect(round.snapshot().preRound?.shutter).toMatchObject({ remaining: 3, frame: 3 });
    expect(round.consumeIntroSkipResetSignal()).toBe(true);
    expect(round.consumeIntroSkipResetSignal()).toBe(false);
  });

  it("holds phase 4 at the wait boundary until imported actors are ready or force time expires", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      overHitTimeFrames: 1,
      postKoPhase4StartFrames: 2,
      forceWinTimeFrames: 3,
      postKoFrames: 8,
    });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 0 });

    round.tickTimer({ phase4Ready: false });
    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(3);
    expect(round.roundNoDamage).toBe(true);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });

    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(3);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });

    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(4);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });
  });

  it("releases a held phase-4 boundary as soon as actors become ready", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      postKoPhase4StartFrames: 2,
      forceWinTimeFrames: 10,
      postKoFrames: 8,
    });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 0 });

    round.tickTimer({ phase4Ready: false });
    round.tickTimer({ phase4Ready: false });
    expect(round.currentPhase).toBe(3);

    round.tickTimer({ phase4Ready: true });
    expect(round.currentPhase).toBe(4);
    expect(round.snapshot().postRound).toMatchObject({ frame: 2, remaining: 6 });
  });

  it("opens the official no-damage interval through the wait boundary", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      overHitTimeFrames: 2,
      postKoPhase4StartFrames: 4,
      postKoFrames: 6,
    });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 500 });

    expect(round.roundNoDamage).toBe(false);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(false);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(true);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(true);
    round.tickTimer();
    expect(round.currentPhase).toBe(4);
    expect(round.roundNoDamage).toBe(true);
    round.tickTimer();
    expect(round.roundNoDamage).toBe(false);
  });

  it("captures NoKOSlow on the KO frame without shortening the post-round window", () => {
    const round = new RuntimeRoundSystem();
    round.finishIfNeeded({ label: "P1", life: 600 }, { label: "P2", life: 0 }, { noKoSlow: true });

    expect(round.snapshot().postRound).toMatchObject({ remaining: 255, slowRemaining: 60, playbackRate: 1, noKoSlow: true });
    for (let frame = 0; frame < 254; frame += 1) round.tickTimer();
    expect(round.isOver).toBe(false);
    expect(round.tickTimer()).toEqual({ finishedNow: true });
  });

  it("keeps double-KO and time-over draw wording distinct", () => {
    const ko = new RuntimeRoundSystem();
    expect(ko.finishIfNeeded({ label: "P1", life: 0 }, { label: "P2", life: 0 })?.message).toBe(
      "Double KO - press Reset to fight again",
    );

    const time = new RuntimeRoundSystem(1);
    time.tickTimer();

    expect(time.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 500 })).toEqual({
      state: "timeover",
      winner: "Draw",
      message: "Time over - draw - press Reset to fight again",
    });
    expect(time.snapshot()).toMatchObject({ roundPhase: 3 });
  });

  it("keeps time-over in the post-round window until the terminal draw frame", () => {
    const round = new RuntimeRoundSystem(1, "ikemen-go", {
      postKoPhase4StartFrames: 2,
      postKoFrames: 4,
    });
    round.tickTimer();

    expect(round.finishIfNeeded({ label: "P1", life: 500 }, { label: "P2", life: 500 })).toMatchObject({
      state: "timeover",
      winner: "Draw",
    });
    expect(round.isOver).toBe(false);
    expect(round.snapshot()).toMatchObject({
      state: "timeover",
      roundPhase: 3,
      postRound: { frame: 0, remaining: 4, duration: 4, playbackRate: 1 },
    });

    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ roundPhase: 3, postRound: { frame: 1, remaining: 3 } });
    round.tickTimer();
    expect(round.snapshot()).toMatchObject({ roundPhase: 4, postRound: { frame: 2, remaining: 2 } });
    round.tickTimer();
    expect(round.isOver).toBe(false);
    expect(round.snapshot()).toMatchObject({ postRound: { frame: 3, remaining: 1 } });
    expect(round.tickTimer()).toEqual({ finishedNow: true });
    expect(round.isOver).toBe(true);
    expect(round.snapshot()).toMatchObject({ roundPhase: 4, postRound: { frame: 4, remaining: 0 } });
  });

  it("resets mutable round state for MatchWorld reset", () => {
    const round = new RuntimeRoundSystem(1);
    round.tickTimer();
    expect(round.finishIfNeeded({ label: "P1", life: 100 }, { label: "P2", life: 100 })?.state).toBe("timeover");

    round.reset();

    expect(round.isOver).toBe(false);
    expect(round.snapshot()).toEqual({
      state: "fight",
      timer: 99,
      winner: undefined,
      message: "Fight",
    });
  });

  it("tracks the next round without changing the initial-round snapshot contract", () => {
    const round = new RuntimeRoundSystem(1, "unknown", { postKoPhase4StartFrames: 1, postKoFrames: 1 });
    round.tickTimer();
    round.finishIfNeeded({ label: "P1", life: 100 }, { label: "P2", life: 100 });
    expect(round.isOver).toBe(false);
    expect(round.tickTimer()).toEqual({ finishedNow: true });

    round.startNextRound(120);

    expect(round.isOver).toBe(false);
    expect(round.currentRoundNo).toBe(2);
    expect(round.roundsExisted).toBe(1);
    expect(round.snapshot()).toMatchObject({
      state: "fight",
      timer: 2,
      roundNo: 2,
      roundsExisted: 1,
    });
  });
});
