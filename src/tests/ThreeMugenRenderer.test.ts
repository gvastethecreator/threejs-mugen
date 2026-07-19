import { describe, expect, it } from "vitest";
import {
  resolveRootCollisionActors,
  resolveRootPresentationActors,
  resolveRoundFadePresentation,
  resolveRoundShutterPresentation,
} from "../game/render/ThreeMugenRenderer";
import {
  projectFightScreenSprite,
  resolveFightScreenAnnouncementSelection,
  resolveRoundDisplayAsset,
} from "../game/render/FightScreenAnnouncementRenderer";
import {
  resolveFightScreenAnimationCompletion,
  resolveFightScreenAnnouncementCompletion,
} from "../mugen/runtime/FightScreenAnimationSemantics";
import { projectRoundFadeSprite, resolveRoundFadeAnimationFrame } from "../game/render/RoundFadeRenderer";
import { projectRoundShutterBars } from "../game/render/RoundShutterRenderer";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenFightScreenDisplayDefinitions } from "../mugen/model/MugenSystemAssets";
import type { ActorSnapshot, MugenSnapshot } from "../mugen/runtime/types";

describe("resolveRootPresentationActors", () => {
  it("selects and orders promoted reserve roots without widening snapshot actors", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p3 = actor("p3");
    const snapshot = {
      actors: [p1, p2],
      reserveActors: [p3],
      rootPresentation: diagnostic(["p3", "p2"]),
    };

    expect(resolveRootPresentationActors(snapshot).map(({ id }) => id)).toEqual(["p3", "p2"]);
    expect(snapshot.actors.map(({ id }) => id)).toEqual(["p1", "p2"]);
  });

  it("resolves collision roots independently from draw roots", () => {
    const p1 = actor("p1");
    const p2 = actor("p2");
    const p3 = actor("p3");
    const snapshot = {
      actors: [p1, p2],
      reserveActors: [p3],
      rootPresentation: diagnostic(["p2"], ["p3", "p2"]),
    };

    expect(resolveRootPresentationActors(snapshot).map(({ id }) => id)).toEqual(["p2"]);
    expect(resolveRootCollisionActors(snapshot).map(({ id }) => id)).toEqual(["p3", "p2"]);
  });

  it("preserves the playable pair when the diagnostic is absent", () => {
    const actors = [actor("p1"), actor("p2")];

    expect(resolveRootPresentationActors({ actors }).map(({ id }) => id)).toEqual(["p1", "p2"]);
  });

  it("rejects duplicate and unknown draw ids", () => {
    const actors = [actor("p1"), actor("p2")];

    expect(() => resolveRootPresentationActors({
      actors,
      rootPresentation: diagnostic(["p1", "p1"]),
    })).toThrow("Duplicate root presentation draw id p1");
    expect(() => resolveRootPresentationActors({
      actors,
      rootPresentation: diagnostic(["p3"]),
    })).toThrow("Unknown root presentation draw actor p3");
    expect(() => resolveRootCollisionActors({
      actors,
      rootPresentation: diagnostic(["p1"], ["p1", "p1"]),
    })).toThrow("Duplicate root presentation collision id p1");
    expect(() => resolveRootCollisionActors({
      actors,
      rootPresentation: diagnostic(["p1"], ["p3"]),
    })).toThrow("Unknown root presentation collision actor p3");
  });
});

describe("resolveRoundFadePresentation", () => {
  it("returns only an active imported round fade for the renderer overlay", () => {
    const fade = {
      schema: "RuntimeRoundFade/v0" as const,
      active: true,
      frame: 2,
      remaining: 2,
      duration: 4,
      opacity: 0.5,
      color: [12, 34, 56] as [number, number, number],
    };
    const fadeIn = { ...fade, direction: "in" as const };

    expect(resolveRoundFadePresentation({ round: { postRound: { fadeOut: fade } } as MugenSnapshot["round"] })).toEqual(fade);
    expect(resolveRoundFadePresentation({ round: { postRound: { fadeOut: { ...fade, active: false } } } as MugenSnapshot["round"] })).toBeUndefined();
    expect(resolveRoundFadePresentation({ round: { preRound: { fadeIn } } as MugenSnapshot["round"] })).toEqual(fadeIn);
    expect(resolveRoundFadePresentation({
      round: { postRound: { fadeOut: { ...fade, active: false } }, preRound: { fadeIn } } as MugenSnapshot["round"],
    })).toEqual(fadeIn);
    expect(resolveRoundFadePresentation({ round: undefined })).toBeUndefined();
  });
});

describe("RoundFadeRenderer asset projection", () => {
  it("advances FightScreen AIR frames using imported durations", () => {
    const action: MugenAnimationAction = {
      id: 7001,
      frames: [fadeFrame(1, 3), fadeFrame(2, 2)],
      rawLines: [],
    };

    expect(resolveRoundFadeAnimationFrame(action, 0)).toMatchObject({ frameIndex: 0, frame: { spriteIndex: 1 } });
    expect(resolveRoundFadeAnimationFrame(action, 3)).toMatchObject({ frameIndex: 1, frame: { spriteIndex: 2 } });
    expect(resolveRoundFadeAnimationFrame(action, 4)).toMatchObject({ frameIndex: 1, frame: { spriteIndex: 2 } });
  });

  it("anchors a full-screen SFF sprite to the active viewport", () => {
    expect(projectRoundFadeSprite(
      { x: 12, y: 30, width: 640, height: 360, zoom: 1 },
      { width: 640, height: 360, axisX: 0, axisY: 0 },
      { offsetX: 0, offsetY: 0 },
    )).toEqual({ x: 12, y: 30, width: 640, height: 360, flipX: 1, flipY: 1 });
  });
});

describe("RoundShutterRenderer", () => {
  it("projects the imported shutter into symmetric closing bars", () => {
    expect(projectRoundShutterBars(
      { frame: 3, duration: 6, shutterTime: 3 },
      { x: 12, y: 30, width: 640, height: 360, zoom: 1 },
    )).toEqual({
      coverHeight: 180,
      top: { x: 12, y: 120, width: 640, height: 180 },
      bottom: { x: 12, y: -60, width: 640, height: 180 },
    });
  });

  it("selects only an active pre-round shutter", () => {
    const shutter = {
      schema: "RuntimeRoundShutter/v0" as const,
      active: true,
      frame: 1,
      remaining: 5,
      duration: 6,
      shutterTime: 3,
      color: [17, 18, 19] as [number, number, number],
      phase: "closing" as const,
    };
    expect(resolveRoundShutterPresentation({ round: { preRound: { shutter } } as MugenSnapshot["round"] })).toEqual(shutter);
    expect(resolveRoundShutterPresentation({ round: { preRound: { shutter: { ...shutter, active: false } } } as MugenSnapshot["round"] })).toBeUndefined();
  });
});

describe("FightScreenAnnouncementRenderer asset selection", () => {
  const display: MugenFightScreenDisplayDefinitions = {
    round: new Map([[2, { animationNo: 7002 }]]),
    roundDefault: { animationNo: 7000 },
    roundSingle: { animationNo: 7001 },
    roundFinal: { animationNo: 7003 },
    fight: { animationNo: 7004 },
  };

  it("selects numbered, single, final, and fight assets from the runtime announcement", () => {
    expect(resolveRoundDisplayAsset(display, "normal", 2)).toEqual({ animationNo: 7002 });
    expect(resolveRoundDisplayAsset(display, "normal", 3)).toEqual({ animationNo: 7000 });
    expect(resolveRoundDisplayAsset(display, "single", 1)).toEqual({ animationNo: 7001 });
    expect(resolveRoundDisplayAsset(display, "final", 2)).toEqual({ animationNo: 7003 });
    expect(resolveFightScreenAnnouncementSelection({
      state: "fight",
      timer: 99,
      message: "Fight",
      announcement: {
        schema: "RuntimeRoundAnnouncement/v0",
        visibility: "visible",
        phase: "fight",
        roundNo: 2,
        mode: "normal",
        round: { phase: "active", skipped: false, elapsed: 4, animationStart: 0, soundTime: 0, soundDue: false },
        fight: { phase: "active", skipped: false, elapsed: 0, animationStart: 0, soundTime: 0, soundDue: false },
        roundDisplaySkipped: false,
        fightDisplaySkipped: false,
        callFightElapsed: 0,
        completion: "asset-owned",
        timing: {} as never,
      },
    }, display)?.asset).toEqual({ animationNo: 7004 });
  });

  it("keeps the default primary announcement when a numbered variant only adds layouts", () => {
    const display: MugenFightScreenDisplayDefinitions = {
      round: new Map([[2, { top: { sprite: [9100, 1] } }]]),
      roundDefault: { animationNo: 7000 },
    };

    expect(resolveRoundDisplayAsset(display, "normal", 2)).toEqual({ animationNo: 7000 });
  });

  it("mirrors AnimTextSnd End for displaytime, finite AIR, and terminal AIR frames", () => {
    const finite = actionWithDurations(7100, [3, 4]);
    const terminal = actionWithDurations(7101, [3, -1]);
    const animations = new Map([[7100, finite], [7101, terminal]]);

    expect(resolveFightScreenAnimationCompletion({ animationNo: 7100 }, animations)).toEqual({
      frame: 7,
      reason: "finite-animation",
      actionNos: [7100],
    });
    expect(resolveFightScreenAnimationCompletion({ animationNo: 7101 }, animations)).toEqual({
      frame: 3,
      reason: "terminal-frame",
      actionNos: [7101],
    });
    expect(resolveFightScreenAnimationCompletion({ animationNo: 7100, displayTime: 4 }, animations)).toEqual({
      frame: 3,
      reason: "displaytime",
      actionNos: [7100],
    });
  });

  it("waits for both the selected round variant and round.default", () => {
    const display: MugenFightScreenDisplayDefinitions = {
      round: new Map([[2, { animationNo: 7100 }]]),
      roundDefault: { animationNo: 7101 },
      fight: { animationNo: 7100 },
    };
    const animations = new Map([
      [7100, actionWithDurations(7100, [3, 4])],
      [7101, actionWithDurations(7101, [9])],
    ]);

    expect(resolveFightScreenAnnouncementCompletion(display, animations, "round", "normal", 2)).toEqual({
      frame: 9,
      reason: "parallel",
      actionNos: [7100, 7101],
    });
    expect(resolveFightScreenAnnouncementCompletion(display, animations, "fight", "normal", 1)).toEqual({
      frame: 7,
      reason: "finite-animation",
      actionNos: [7100],
    });
  });

  it("projects FightScreen layout coordinates with AIR offsets and authored flips", () => {
    expect(projectFightScreenSprite(
      { x: 0, y: 0, width: 640, height: 360, zoom: 1 },
      [320, 240],
      { width: 32, height: 16, axisX: 8, axisY: 4 },
      { offsetX: 2, offsetY: -3, flip: "" },
      { offset: [160, 100], scale: [1, 1], facing: 1, vfacing: 1 },
    )).toEqual({
      x: 20,
      y: 28.5,
      width: 64,
      height: 24,
      scaleX: 64,
      scaleY: 24,
    });
  });
});

function actor(id: string): ActorSnapshot {
  return { id } as ActorSnapshot;
}

function fadeFrame(spriteIndex: number, duration: number): MugenAnimationAction["frames"][number] {
  return {
    spriteGroup: 9000,
    spriteIndex,
    offsetX: 0,
    offsetY: 0,
    duration,
    clsn1: [],
    clsn2: [],
    raw: `${spriteIndex},0,0,0,${duration}`,
    line: spriteIndex,
  };
}

function actionWithDurations(id: number, durations: number[]): MugenAnimationAction {
  return {
    id,
    frames: durations.map((duration, index) => fadeFrame(index, duration)),
    rawLines: [`[Begin Action ${id}]`],
  };
}

function diagnostic(drawRootIds: string[], collisionRootIds = drawRootIds): NonNullable<MugenSnapshot["rootPresentation"]> {
  return {
    schema: "RuntimeRootPresentation/v1",
    mode: "ikemen-tag",
    roots: [],
    drawRootIds,
    cameraRootIds: [],
    collisionRootIds,
  };
}
