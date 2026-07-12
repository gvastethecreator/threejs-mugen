import { describe, expect, it } from "vitest";
import type { MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import { defaultRuntimeHurtBoxes, RuntimeFrameWorld, type RuntimeFrameActor } from "../mugen/runtime/RuntimeFrameSystem";

describe("RuntimeFrameSystem", () => {
  it("resolves the current AIR frame from runtime frameIndex", () => {
    const world = new RuntimeFrameWorld();
    const actor = frameActor({ frameIndex: 1 });

    expect(world.currentFrame(actor)?.spriteIndex).toBe(1);
  });

  it("projects cloned frame hurtboxes or default hurtboxes", () => {
    const world = new RuntimeFrameWorld();
    const actor = frameActor({ frames: [frame({ clsn2: [{ x1: -12, y1: -44, x2: 12, y2: 0 }] })] });

    const hurtBoxes = world.currentHurtBoxes(actor);
    hurtBoxes[0]!.x1 = 999;

    expect(actor.currentAction.frames[0]?.clsn2[0]).toEqual({ x1: -12, y1: -44, x2: 12, y2: 0 });
    expect(world.currentHurtBoxes(frameActor({ frames: [] }))).toEqual(defaultRuntimeHurtBoxes);
  });

  it("uses active move hitbox before frame clsn1 and clones boxes", () => {
    const world = new RuntimeFrameWorld();
    const active = frameActor({
      moveTick: 3,
      currentMove: {
        activeStart: 2,
        activeEnd: 4,
        hitbox: { x1: 10, y1: -20, x2: 30, y2: -4 },
      },
    });

    const attackBoxes = world.currentAttackBoxes(active);
    attackBoxes[0]!.x1 = 999;

    expect(world.firstCurrentAttackBox(active)).toEqual({ x1: 10, y1: -20, x2: 30, y2: -4 });
    expect(world.currentAttackBoxes(frameActor({ moveTick: 0 }))).toEqual([{ x1: 1, y1: -8, x2: 12, y2: -1 }]);
  });

  it("returns no attack boxes when there is no active move and no frame", () => {
    const world = new RuntimeFrameWorld();

    expect(world.currentAttackBoxes(frameActor({ frames: [] }))).toEqual([]);
  });

  it("projects runtime Clsn1 and Clsn2 overrides without mutating AIR frames", () => {
    const world = new RuntimeFrameWorld();
    const actor = frameActor();
    actor.runtime.clsnOverrides = [
      { group: 1, index: -1, rect: { x1: 20, y1: -30, x2: 50, y2: -10 } },
      { group: 2, index: 0, rect: { x1: 0, y1: 0, x2: 0, y2: 0 } },
    ];

    expect(world.currentAttackBoxes(actor)).toEqual([{ x1: 20, y1: -30, x2: 50, y2: -10 }]);
    expect(world.currentHurtBoxes(actor)).toEqual([]);
    expect(actor.currentAction.frames[0]?.clsn1).toEqual([{ x1: 1, y1: -8, x2: 12, y2: -1 }]);
  });

  it("applies Clsn1 overrides to every AIR box during active moves", () => {
    const world = new RuntimeFrameWorld();
    const actor = frameActor({
      moveTick: 3,
      frames: [frame({ clsn1: [{ x1: 1, y1: 1, x2: 2, y2: 2 }, { x1: 3, y1: 3, x2: 4, y2: 4 }] })],
      currentMove: { activeStart: 2, activeEnd: 4, hitbox: { x1: 99, y1: 99, x2: 100, y2: 100 } },
    });
    actor.runtime.clsnOverrides = [{ group: 1, index: 1, rect: { x1: 30, y1: -40, x2: 50, y2: -10 } }];

    expect(world.currentAttackBoxes(actor)).toEqual([
      { x1: 1, y1: 1, x2: 2, y2: 2 },
      { x1: 30, y1: -40, x2: 50, y2: -10 },
    ]);
  });

  it("does not let replace-all create Clsn2 from the synthetic no-frame fallback", () => {
    const world = new RuntimeFrameWorld();
    const actor = frameActor({ frames: [] });
    actor.runtime.clsnOverrides = [{ group: 2, index: -1, rect: { x1: -10, y1: -20, x2: 10, y2: 0 } }];

    expect(world.currentHurtBoxes(actor)).toEqual([]);
  });
});

function frameActor(
  overrides: Partial<RuntimeFrameActor> & {
    frameIndex?: number;
    frames?: MugenAnimationFrame[];
  } = {},
): RuntimeFrameActor {
  const { frameIndex, frames, ...actorOverrides } = overrides;
  return {
    runtime: { frameIndex: frameIndex ?? 0 },
    currentAction: {
      frames:
        frames ??
        [
          frame({ spriteIndex: 0 }),
          frame({ spriteIndex: 1 }),
        ],
    },
    moveTick: 0,
    ...actorOverrides,
  };
}

function frame(overrides: Partial<MugenAnimationFrame> = {}): MugenAnimationFrame {
  const base: MugenAnimationFrame = {
    spriteGroup: 100,
    spriteIndex: 0,
    offsetX: 0,
    offsetY: 0,
    duration: 4,
    clsn1: [{ x1: 1, y1: -8, x2: 12, y2: -1 }],
    clsn2: [{ x1: -16, y1: -48, x2: 16, y2: 0 }],
    raw: "100, 0, 0, 0, 4",
    line: 1,
  };
  return {
    ...base,
    ...overrides,
    raw: overrides.raw ?? base.raw,
    line: overrides.line ?? base.line,
  };
}
