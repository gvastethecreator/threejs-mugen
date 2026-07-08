import { describe, expect, it } from "vitest";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import type { RuntimeMatchPresentationSnapshotActor } from "../mugen/runtime/RuntimeMatchPresentationSnapshotSystem";
import { RuntimeMatchPresentationSnapshotWorld } from "../mugen/runtime/RuntimeMatchPresentationSnapshotSystem";

describe("RuntimeMatchPresentationSnapshotWorld", () => {
  it("collects stage shake, flash, and per-player effect groups for match snapshots", () => {
    const stage = {
      id: "dojo",
      displayName: "Dojo",
      floorY: 0,
      zOffset: 0,
      localCoord: { width: 320, height: 240 },
      bounds: { left: -160, right: 160 },
      camera: { startX: 0, startY: 0, zoom: 1 },
      playerStart: {
        p1: { x: -40, y: 0, facing: 1 },
        p2: { x: 40, y: 0, facing: -1 },
      },
      layers: [],
    } satisfies MugenStageDefinition;
    const p1 = actor("p1", 12);
    const p2 = actor("p2", 88);
    const calls: string[] = [];
    const result = new RuntimeMatchPresentationSnapshotWorld().create({
      tick: 42,
      stage,
      p1,
      p2,
      envShakeWorld: {
        snapshotCameraShake: (runtimeTick, actors) => {
          calls.push(`shake:${runtimeTick}:${actors.map((actor) => actor.id).join(",")}`);
          return { x: 2, y: -1, remaining: 5, amplitude: 7 };
        },
      },
      envColorWorld: {
        snapshotStageFlash: (runtimeTick) => {
          calls.push(`flash:${runtimeTick}`);
          return { color: [16, 24, 32], opacity: 0.5, remaining: 3, under: true };
        },
      },
      effectLifecycleWorld: {
        snapshotGroups: (target) => {
          calls.push(`effects:${target.id}`);
          return {
            explods: [{ id: `${target.id}-explod` } as never],
            helpers: [],
            projectiles: [],
          };
        },
      },
    });

    expect(calls).toEqual(["shake:42:p1,p2", "flash:42", "effects:p1", "effects:p2"]);
    expect(result.stage).toMatchObject({
      stage,
      cameraShake: { x: 2, y: -1, remaining: 5, amplitude: 7 },
      envColor: { color: [16, 24, 32], opacity: 0.5, remaining: 3, under: true },
    });
    expect(result.stage.actors).toEqual([p1, p2]);
    expect(result.effects.p1.explods[0]).toMatchObject({ id: "p1-explod" });
    expect(result.effects.p2.explods[0]).toMatchObject({ id: "p2-explod" });
  });
});

function actor(id: string, x: number): RuntimeMatchPresentationSnapshotActor {
  return {
    id,
    runtime: { pos: { x, y: 0 }, facing: 1, stateNo: 0, moveType: "I" },
    stateElapsed: 0,
    envShakeEvents: [],
    effectActorWorld: {
      advanceActiveEffects: () => undefined,
      advancePresentationEffects: () => undefined,
      explodSnapshots: () => [],
      helperSnapshots: () => [],
      projectileSnapshots: () => [],
      removeExplodsOnGetHit: () => undefined,
    },
  } as RuntimeMatchPresentationSnapshotActor;
}
