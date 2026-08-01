import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { SATIRICAL_FIGHTFX_ACTIONS, contentPackFighters } from "../mugen/runtime/demoFighters";
import {
  hitSparkLibrarySource,
  resolveRuntimeHitSparkAssetFrames,
  type RuntimeHitSparkAssetActor,
} from "../mugen/runtime/HitSparkAssetSystem";

describe("HitSparkAssetSystem", () => {
  it("maps spark prefixes to runtime asset libraries", () => {
    expect(hitSparkLibrarySource(undefined)).toBe("common");
    expect(hitSparkLibrarySource("F")).toBe("fightfx");
    expect(hitSparkLibrarySource("S")).toBeUndefined();
    expect(hitSparkLibrarySource("X")).toBeUndefined();
  });

  it("resolves S-prefixed player AIR frames from the state owner when present", () => {
    const stateOwner = actor({
      animations: new Map([[7001, action(7001, 9100, [3, 5])]]),
    });
    const activeActor = actor({
      animations: new Map([[7001, action(7001, 1200, [7])]]),
      stateOwner,
    });

    expect(resolveRuntimeHitSparkAssetFrames(activeActor, "S7001")).toEqual([
      {
        source: "player",
        actionId: 7001,
        frameIndex: 0,
        spriteGroup: 9100,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 3,
      },
      {
        source: "player",
        actionId: 7001,
        frameIndex: 1,
        spriteGroup: 9100,
        spriteIndex: 1,
        offsetX: 2,
        offsetY: -1,
        duration: 5,
      },
    ]);
  });

  it("resolves unprefixed common and F-prefixed FightFX library frames", () => {
    const activeActor = actor({
      fightFxPrefix: "kfm",
      hitSparkLibraries: {
        common: { animations: new Map([[7000, action(7000, 7200, [4])]]) },
        fightfx: { animations: new Map([[7002, action(7002, 8300, [6])]]) },
      },
    });

    expect(resolveRuntimeHitSparkAssetFrames(activeActor, "7000")).toMatchObject([
      { source: "common", actionId: 7000, frameIndex: 0, spriteGroup: 7200, spriteIndex: 0, duration: 4 },
    ]);
    expect(resolveRuntimeHitSparkAssetFrames(activeActor, "F7002")).toMatchObject([
      { source: "fightfx", fightFxPrefix: "kfm", actionId: 7002, frameIndex: 0, spriteGroup: 8300, spriteIndex: 0, duration: 6 },
    ]);
  });

  it("propagates an authored CommonFX scale to every AIR frame", () => {
    const activeActor = actor({
      hitSparkLibraries: {
        common: { scale: 0.75, animations: new Map([[7000, action(7000, 7200, [4, 5])]]) },
      },
    });

    expect(resolveRuntimeHitSparkAssetFrames(activeActor, "7000")).toMatchObject([
      { source: "common", actionId: 7000, frameIndex: 0, scale: 0.75 },
      { source: "common", actionId: 7000, frameIndex: 1, scale: 0.75 },
    ]);
  });

  it("derives CommonFX scale from package and character localcoord", () => {
    const activeActor = actor({
      localCoord: [320, 240],
      hitSparkLibraries: {
        common: {
          scale: 0.75,
          localCoord: [640, 480],
          animations: new Map([[7000, action(7000, 7200, [4])]]),
        },
      },
    });

    expect(resolveRuntimeHitSparkAssetFrames(activeActor, "7000")).toMatchObject([
      {
        source: "common",
        actionId: 7000,
        scale: 0.375,
        localCoord: [640, 480],
      },
    ]);
  });

  it("wires the authored satirical FightFX rows into content-pack moves", () => {
    const fighter = contentPackFighters.find((entry) => entry.id === "mara-cinta");
    expect(fighter).toBeDefined();
    const actorDefinition = {
      animations: fighter!.animations,
      fightFxPrefix: fighter!.fightFxPrefix,
      hitSparkLibraries: fighter!.hitSparkLibraries,
    } satisfies RuntimeHitSparkAssetActor["definition"];

    expect(fighter!.moves.punch.hitSpark).toBe(`F${SATIRICAL_FIGHTFX_ACTIONS.hit}`);
    expect(resolveRuntimeHitSparkAssetFrames({ definition: actorDefinition }, fighter!.moves.punch.hitSpark)[0]).toMatchObject(
      {
        source: "fightfx",
        actionId: SATIRICAL_FIGHTFX_ACTIONS.hit,
        spriteGroup: SATIRICAL_FIGHTFX_ACTIONS.hit,
        frameIndex: 0,
      },
    );
    expect(resolveRuntimeHitSparkAssetFrames({ definition: actorDefinition }, fighter!.moves.punch.guardSpark)[0]).toMatchObject(
      {
        source: "fightfx",
        actionId: SATIRICAL_FIGHTFX_ACTIONS.guard,
        spriteGroup: SATIRICAL_FIGHTFX_ACTIONS.guard,
      },
    );
  });

  it("returns an empty frame list for unsupported prefixes or missing actions", () => {
    const activeActor = actor();

    expect(resolveRuntimeHitSparkAssetFrames(activeActor, "X7000")).toEqual([]);
    expect(resolveRuntimeHitSparkAssetFrames(activeActor, "S7000")).toEqual([]);
    expect(resolveRuntimeHitSparkAssetFrames(activeActor, undefined)).toEqual([]);
  });
});

function actor(options: Partial<RuntimeHitSparkAssetActor["definition"]> & { stateOwner?: RuntimeHitSparkAssetActor } = {}): RuntimeHitSparkAssetActor {
  return {
    definition: {
      animations: options.animations ?? new Map(),
      localCoord: options.localCoord,
      fightFxPrefix: options.fightFxPrefix,
      hitSparkLibraries: options.hitSparkLibraries,
    },
    stateOwner: options.stateOwner,
  };
}

function action(id: number, spriteGroup: number, durations: number[]): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: durations.map((duration, index) => {
      const offsetY = index === 0 ? 0 : -index;
      return {
        spriteGroup,
        spriteIndex: index,
        offsetX: index * 2,
        offsetY,
        duration,
        clsn1: [],
        clsn2: [],
        raw: `${spriteGroup},${index},${index * 2},${offsetY},${duration}`,
        line: index + 1,
      };
    }),
  };
}
