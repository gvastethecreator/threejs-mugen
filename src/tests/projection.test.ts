import { describe, expect, it } from "vitest";
import { projectCollisionBox, projectSprite } from "../game/render/projection";
import type { ActorSnapshot } from "../mugen/runtime/types";

const actor: ActorSnapshot = {
  id: "p1",
  label: "P1",
  actorKind: "player",
  ownerId: "p1",
  rootId: "p1",
  parentId: "p1",
  runtime: {
    pos: { x: 100, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
  },
  clsn1: [],
  clsn2: [],
};

describe("projection", () => {
  it("projects MUGEN collision boxes into Three world units", () => {
    const rect = projectCollisionBox(actor, { x1: -20, y1: -80, x2: 20, y2: 0 });
    expect(rect).toEqual({ x: 100, y: 40, width: 40, height: 80 });
  });

  it("projects sprite axis and offsets", () => {
    const sprite = projectSprite(
      {
        ...actor,
        frame: {
          spriteGroup: 0,
          spriteIndex: 0,
          offsetX: 4,
          offsetY: 2,
          duration: 5,
          clsn1: [],
          clsn2: [],
          raw: "",
          line: 1,
        },
      },
      { group: 0, index: 0, width: 60, height: 100, axisX: 30, axisY: 92 },
    );
    expect(sprite.x).toBe(104);
    expect(sprite.y).toBe(40);
    expect(sprite.scaleX).toBe(1);
  });

  it("applies runtime render scale around the sprite axis and collision boxes", () => {
    const scaledActor: ActorSnapshot = {
      ...actor,
      runtime: {
        ...actor.runtime,
        renderScale: { x: 2, y: 0.5 },
      },
      frame: {
        spriteGroup: 0,
        spriteIndex: 0,
        offsetX: 4,
        offsetY: 2,
        duration: 5,
        clsn1: [],
        clsn2: [],
        raw: "",
        line: 1,
      },
    };

    const sprite = projectSprite(scaledActor, { group: 0, index: 0, width: 60, height: 100, axisX: 30, axisY: 92 });
    expect(sprite).toMatchObject({ x: 108, y: 20, width: 120, height: 50 });
    expect(projectCollisionBox(scaledActor, { x1: -20, y1: -80, x2: 20, y2: 0 })).toEqual({
      x: 100,
      y: 20,
      width: 80,
      height: 40,
    });
  });
});
