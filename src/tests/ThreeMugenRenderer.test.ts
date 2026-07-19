import { describe, expect, it } from "vitest";
import {
  resolveRootCollisionActors,
  resolveRootPresentationActors,
  resolveRoundFadePresentation,
} from "../game/render/ThreeMugenRenderer";
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

    expect(resolveRoundFadePresentation({ round: { postRound: { fadeOut: fade } } as MugenSnapshot["round"] })).toEqual(fade);
    expect(resolveRoundFadePresentation({ round: { postRound: { fadeOut: { ...fade, active: false } } } as MugenSnapshot["round"] })).toBeUndefined();
    expect(resolveRoundFadePresentation({ round: undefined })).toBeUndefined();
  });
});

function actor(id: string): ActorSnapshot {
  return { id } as ActorSnapshot;
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
