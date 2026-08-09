import { describe, expect, it } from "vitest";
import type { MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import {
  defaultRuntimeHurtBoxes,
  runtimeClsnVar,
  runtimeClsnOverlap,
  runtimeCurrentClsnVarBoxes,
  RuntimeFrameWorld,
  type RuntimeClsnVarActor,
  type RuntimeClsnOverlapActor,
  type RuntimeFrameActor,
} from "../mugen/runtime/RuntimeFrameSystem";

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

  it("applies the per-tick TransformClsn scale after collision overrides", () => {
    const world = new RuntimeFrameWorld();
    const actor = frameActor();
    actor.runtime.clsnOverrides = [{ group: 1, index: -1, rect: { x1: -4, y1: -6, x2: 8, y2: 10 } }];
    actor.runtime.clsnScaleMultiplier = { x: 2, y: 0.5 };

    expect(world.currentAttackBoxes(actor)).toEqual([{ x1: -8, y1: -3, x2: 16, y2: 5 }]);
    expect(world.currentHurtBoxes(actor)).toEqual([{ x1: -32, y1: -24, x2: 32, y2: 0 }]);
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

  it("projects raw current-frame ClsnVar boxes, size, overrides, and coordinates", () => {
    const actor: RuntimeClsnVarActor = {
      runtime: {
        frameIndex: 0,
        stateType: "S",
        bodyWidthDelta: { back: 2, front: 4 },
        bodyHeightDelta: { top: 3, bottom: 5 },
        clsnOverrides: [
          { group: 1, index: 0, rect: { x1: -20, y1: -30, x2: 40, y2: 10 } },
          { group: 3, index: 0, rect: { x1: -18, y1: -70, x2: 22, y2: 5 } },
        ],
      },
      currentAction: { frames: [frame()] },
      definition: { constants: { "size.ground.back": 16, "size.ground.front": 16, "size.height": 60 } },
    };

    expect(runtimeCurrentClsnVarBoxes(actor, "clsn1")).toEqual([{ x1: -20, y1: -30, x2: 40, y2: 10 }]);
    expect(runtimeCurrentClsnVarBoxes(actor, "size")).toEqual([{ x1: -18, y1: -70, x2: 22, y2: 5 }]);
    expect(runtimeClsnVar(actor, "clsn1", 0, "back")).toBe(-20);
    expect(runtimeClsnVar(actor, "clsn1", 0, "front")).toBe(40);
    expect(runtimeClsnVar(actor, "clsn1", 0, "top")).toBe(-30);
    expect(runtimeClsnVar(actor, "clsn1", 0, "bottom")).toBe(10);
    expect(runtimeClsnVar(actor, "clsn1", -1, "back")).toBeUndefined();
    expect(runtimeClsnVar(actor, "clsn1", 1, "back")).toBeUndefined();
  });

  it("checks ClsnOverlap in shared world space with localcoord, scale, angle, and size exceptions", () => {
    const actor = clsnOverlapActor({
      localCoord: [640, 480],
      clsn1: [{ x1: 20, y1: -4, x2: 40, y2: 4 }],
      runtime: { clsnScaleMultiplier: { x: 2, y: 1 } },
    });
    const target = clsnOverlapActor({
      localCoord: [320, 240],
      clsn2: [{ x1: -2, y1: -2, x2: 2, y2: 2 }],
      runtime: { pos: { x: 24, y: 0 } },
    });

    expect(runtimeClsnOverlap(actor, target, "clsn1", "clsn2")).toBe(true);
    actor.runtime.clsnScaleMultiplier = undefined;
    expect(runtimeClsnOverlap(actor, target, "clsn1", "clsn2")).toBe(false);

    actor.definition.localCoord = [320, 240];
    actor.currentAction.frames[0]!.clsn1 = [{ x1: 10, y1: -2, x2: 20, y2: 2 }];
    actor.runtime.clsnAngle = 90;
    target.runtime.pos = { x: 0, y: -15 };
    expect(runtimeClsnOverlap(actor, target, "clsn1", "clsn2")).toBe(true);
    actor.runtime.clsnAngle = 0;
    expect(runtimeClsnOverlap(actor, target, "clsn1", "clsn2")).toBe(false);

    actor.runtime.clsnAngle = 90;
    actor.runtime.clsnScaleMultiplier = { x: 10, y: 10 };
    target.runtime.pos = { x: 20, y: 0 };
    expect(runtimeClsnOverlap(actor, target, "size", "clsn2")).toBe(false);
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

function clsnOverlapActor(options: {
  localCoord?: [number, number];
  clsn1?: MugenAnimationFrame["clsn1"];
  clsn2?: MugenAnimationFrame["clsn2"];
  runtime?: Partial<RuntimeClsnOverlapActor["runtime"]>;
} = {}): RuntimeClsnOverlapActor {
  return {
    runtime: {
      frameIndex: 0,
      stateType: "S",
      pos: { x: 0, y: 0 },
      facing: 1,
      ...options.runtime,
    },
    currentAction: {
      frames: [frame({ clsn1: options.clsn1 ?? [], clsn2: options.clsn2 ?? [] })],
    },
    definition: { localCoord: options.localCoord },
  };
}
