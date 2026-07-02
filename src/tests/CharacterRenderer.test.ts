import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { CharacterRenderer } from "../game/render/CharacterRenderer";
import type { TextureStore } from "../game/render/TextureStore";
import type { MugenSprite, SpriteLookupContext, SpriteProvider } from "../mugen/model/MugenSprite";
import type { ActorSnapshot } from "../mugen/runtime/types";

describe("CharacterRenderer", () => {
  it("forwards actor RemapPal context into sprite lookups", async () => {
    const provider = new RecordingSpriteProvider();
    const renderer = new CharacterRenderer(provider, fakeTextureStore());

    await renderer.update([
      actor({
        paletteRemap: { source: [1, 1], dest: [1, 2] },
      }),
    ]);

    expect(provider.lookups[0]).toMatchObject({
      group: 10,
      index: 0,
      ownerId: "p1",
      paletteRemap: { source: [1, 1], dest: [1, 2] },
    });
    renderer.dispose();
  });
});

class RecordingSpriteProvider implements SpriteProvider {
  readonly lookups: Array<{ group: number; index: number } & SpriteLookupContext> = [];

  async getSprite(group: number, index: number, context: SpriteLookupContext = {}): Promise<MugenSprite> {
    this.lookups.push({ group, index, ...context });
    return {
      group,
      index,
      width: 12,
      height: 16,
      axisX: 6,
      axisY: 14,
      raw: { test: true },
    };
  }
}

function actor(runtimeOverrides: Partial<ActorSnapshot["runtime"]>): ActorSnapshot {
  return {
    id: "p1",
    label: "P1",
    actorKind: "player",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    runtime: {
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      facing: 1,
      stateNo: 0,
      animNo: 10,
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
      ...runtimeOverrides,
    },
    frame: {
      spriteGroup: 10,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 5,
      clsn1: [],
      clsn2: [],
      raw: "10,0,0,0,5",
      line: 1,
    },
    clsn1: [],
    clsn2: [],
  };
}

function fakeTextureStore(): TextureStore {
  return {
    getTexture: () => new THREE.Texture(),
  } as unknown as TextureStore;
}
