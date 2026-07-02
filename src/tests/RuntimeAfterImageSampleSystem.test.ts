import { describe, expect, it } from "vitest";
import {
  RuntimeAfterImageSampleWorld,
  type RuntimeAfterImageSampleActor,
  type RuntimeAfterImageSampleFrame,
} from "../mugen/runtime/RuntimeAfterImageSampleSystem";

describe("RuntimeAfterImageSampleSystem", () => {
  it("returns undefined when no animation frame is available", () => {
    const world = new RuntimeAfterImageSampleWorld();

    expect(world.create({ actor: actor() })).toBeUndefined();
  });

  it("projects current frame, position, facing, and sprite owner into a sample", () => {
    const world = new RuntimeAfterImageSampleWorld();
    const source = actor({ pos: { x: 14, y: -28 }, facing: -1 });

    const sample = world.create({ actor: source, frame: frame() });

    expect(sample).toEqual({
      age: 0,
      pos: { x: 14, y: -28 },
      facing: -1,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      spriteGroup: 200,
      spriteIndex: 3,
      offsetX: -7,
      offsetY: 12,
    });

    source.runtime.pos.x = 999;
    expect(sample?.pos).toEqual({ x: 14, y: -28 });
  });

  it("uses state-owner sprite metadata for custom-state animation samples", () => {
    const world = new RuntimeAfterImageSampleWorld();
    const source = actor({
      stateOwner: {
        id: "p2",
        label: "State Owner",
        definition: { id: "owner-def" },
      },
    });

    const sample = world.create({ actor: source, frame: frame({ spriteGroup: 888, spriteIndex: 1 }) });

    expect(sample).toMatchObject({
      spriteOwnerId: "p2",
      spriteOwnerDefinitionId: "owner-def",
      spriteOwnerLabel: "State Owner",
      spriteGroup: 888,
      spriteIndex: 1,
    });
  });
});

function actor(
  overrides: Partial<RuntimeAfterImageSampleActor> & {
    pos?: { x: number; y: number };
    facing?: 1 | -1;
  } = {},
): RuntimeAfterImageSampleActor {
  const { pos, facing, ...actorOverrides } = overrides;
  return {
    id: "p1",
    label: "Kung Fu Man",
    definition: { id: "kfm" },
    runtime: {
      pos: pos ?? { x: 0, y: 0 },
      facing: facing ?? 1,
    },
    ...actorOverrides,
  };
}

function frame(overrides: Partial<RuntimeAfterImageSampleFrame> = {}): RuntimeAfterImageSampleFrame {
  return {
    spriteGroup: 200,
    spriteIndex: 3,
    offsetX: -7,
    offsetY: 12,
    ...overrides,
  };
}
