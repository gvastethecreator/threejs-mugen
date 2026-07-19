import { describe, expect, it } from "vitest";
import {
  resolveRootCollisionActors,
  resolveRootPresentationActors,
  resolveRoundFadePresentation,
} from "../game/render/ThreeMugenRenderer";
import { projectRoundFadeSprite, resolveRoundFadeAnimationFrame } from "../game/render/RoundFadeRenderer";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
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
