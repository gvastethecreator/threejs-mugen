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
