import { describe, expect, it } from "vitest";
import { runtimeFightScreenContextFromRound } from "../mugen/runtime/RuntimeFightScreenTriggerSystem";
import type { RuntimeRoundAnnouncementSnapshot } from "../mugen/runtime/RuntimeRoundAnnouncementSystem";
import { resolveRuntimeRoundAnnouncementTiming } from "../mugen/runtime/RuntimeRoundAnnouncementSystem";
import { RuntimeRoundSystem } from "../mugen/runtime/RuntimeRoundSystem";

describe("RuntimeFightScreenTriggerSystem", () => {
  it("projects imported timing and announcement state without owning asset completion", () => {
    const context = runtimeFightScreenContextFromRound({
      phase: 2,
      round: {
        state: "fight",
        announcement: announcement("round"),
      },
      timing: {
        sourcePath: "fight.def",
        startWaitTime: 12,
        controlTime: 30,
        callFightTime: 3,
        overWaitTime: 12,
        overHitTime: 10,
        overWinTime: 18,
        overTime: 240,
        slowTime: 60,
      },
      assets: { localCoord: [1280, 720] },
      clock: { fightTimeFrames: 37 },
    });

    expect(context).toMatchObject({
      introState: 3,
      fightTime: 37,
      state: { roundDisplay: true, fightDisplay: false, koDisplay: false, winDisplay: false },
      vars: {
        "round.ctrl.time": 30,
        "round.start.waittime": 12,
        "round.callfight.time": 3,
        "round.over.waittime": 12,
        "round.over.hittime": 10,
        "round.over.wintime": 18,
        "round.over.time": 240,
        "round.slow.time": 60,
        "info.localcoord.x": 1280,
        "info.localcoord.y": 720,
        "time.framespercount": 60,
      },
      gameVars: {
        introtime: 0,
        outrotime: 0,
        pausetime: 0,
        slowtime: 0,
        superpausetime: 0,
      },
    });
  });

  it("projects internal GameVar clocks without conflating pause and KO slow time", () => {
    const context = runtimeFightScreenContextFromRound({
      phase: 3,
      round: {
        state: "ko",
        preRound: {
          schema: "RuntimePreRound/v0",
          frame: 1,
          remaining: 4,
          duration: 8,
          intro: {
            schema: "RuntimeRoundIntro/v0",
            active: true,
            frame: 4,
            remaining: 4,
            duration: 8,
            startWaitTime: 2,
            controlTime: 5,
            phase: 1,
          },
        },
        postRound: {
          schema: "RuntimePostRound/v0",
          frame: 2,
          remaining: 9,
          duration: 12,
          slowRemaining: 3,
          slowDuration: 5,
          playbackRate: 0.25,
          noKoSlow: false,
        },
      },
      clock: {
        fightTimeFrames: 18,
        pause: { type: "SuperPause", remaining: 6, moveTime: 0, actorId: "p1", darken: false, sourceStateNo: 300 },
      },
    });

    expect(context.fightTime).toBe(18);
    expect(context.gameVars).toMatchObject({
      introtime: 4,
      outrotime: 9,
      pausetime: 0,
      slowtime: 3,
      superpausetime: 6,
    });
    expect(runtimeFightScreenContextFromRound({
      phase: 2,
      round: { state: "fight" },
      clock: { pause: { type: "Pause", remaining: 2, moveTime: 0, actorId: "p1", darken: false, sourceStateNo: 0 } },
    }).gameVars).toMatchObject({ pausetime: 2, superpausetime: 0 });
  });

  it("maps the Fight call to IntroState 4 and returns to 0 afterwards", () => {
    const base = {
      state: "fight" as const,
      announcement: announcement("fight"),
    };
    expect(runtimeFightScreenContextFromRound({ phase: 2, round: base }).introState).toBe(4);
    expect(runtimeFightScreenContextFromRound({
      phase: 2,
      round: { state: "fight", announcement: announcement("hidden") },
    }).introState).toBe(0);
  });

  it("follows the imported round clock through the real intro, call, and post-call ticks", () => {
    const round = new RuntimeRoundSystem(20, "ikemen-go", {
      startWaitTimeFrames: 1,
      controlTimeFrames: 2,
      announcement: resolveRuntimeRoundAnnouncementTiming({
        roundTimeFrames: 1,
        callFightTimeFrames: 1,
        fightTimeFrames: 1,
        fightAnimationEndFrames: 1,
      }),
    });
    const read = () => runtimeFightScreenContextFromRound({
      phase: round.currentPhase,
      round: round.snapshot(),
      clock: { fightTimeFrames: round.fightTimeFramesElapsed },
    }).introState;
    const states = [read()];
    for (let tick = 0; tick < 20 && !states.includes(4); tick += 1) {
      round.tickTimer();
      states.push(read());
    }

    expect(states[0]).toBe(1);
    expect(states).toContain(2);
    expect(states).toContain(3);
    expect(states).toContain(4);
    for (let tick = 0; tick < 6 && read() !== 0; tick += 1) round.tickTimer();
    expect(read()).toBe(0);
  });
});

function announcement(phase: RuntimeRoundAnnouncementSnapshot["phase"]): RuntimeRoundAnnouncementSnapshot {
  return {
    schema: "RuntimeRoundAnnouncement/v0",
    visibility: phase === "hidden" ? "hidden" : "visible",
    phase,
    roundNo: 1,
    mode: "normal",
    roundDisplaySkipped: false,
    fightDisplaySkipped: false,
    round: {
      phase: phase === "hidden" ? "pending" : "active",
      skipped: false,
      elapsed: 0,
      animationStart: 0,
      soundTime: 0,
      soundDue: false,
    },
    fight: {
      phase: phase === "fight" ? "active" : "pending",
      skipped: false,
      elapsed: 0,
      animationStart: 0,
      soundTime: 0,
      soundDue: false,
    },
    callFightElapsed: 0,
    completion: "asset-owned",
    timing: {
      schema: "RuntimeRoundAnnouncementTiming/v0",
      roundTimeFrames: 0,
      roundSoundTimeFrames: 0,
      callFightTimeFrames: 0,
      fightTimeFrames: 0,
      fightSoundTimeFrames: 0,
    },
  };
}
