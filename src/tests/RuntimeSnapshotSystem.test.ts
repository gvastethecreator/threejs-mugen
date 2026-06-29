import { describe, expect, it } from "vitest";
import { trainingStage } from "../mugen/runtime/demoStage";
import { cameraCenterX, RuntimeSnapshotWorld, type RuntimeSnapshotActor } from "../mugen/runtime/RuntimeSnapshotSystem";
import type { RuntimeStageFlash } from "../mugen/runtime/types";

describe("RuntimeSnapshotWorld", () => {
  it("projects camera center from actors that can move the camera", () => {
    const actors = [
      actorAt(-120),
      actorAt(40, { moveCameraX: false }),
      actorAt(80),
    ];

    expect(cameraCenterX(actors)).toBe(-20);
  });

  it("falls back to every actor when all actors disable camera movement", () => {
    const actors = [actorAt(-120, { moveCameraX: false }), actorAt(40, { moveCameraX: false })];

    expect(cameraCenterX(actors)).toBe(-40);
  });

  it("owns stage snapshot projection for camera, shake, env color, and stage data", () => {
    const world = new RuntimeSnapshotWorld();
    const envColor: RuntimeStageFlash = {
      color: [24, 48, 96],
      opacity: 0.5,
      under: true,
      remaining: 7,
    };
    const cameraShake = {
      x: 3,
      y: -2,
      remaining: 5,
      amplitude: 4,
    };

    const snapshot = world.stage({
      stage: trainingStage,
      actors: [actorAt(-100), actorAt(50)],
      cameraShake,
      envColor,
    });

    expect(snapshot).toMatchObject({
      id: trainingStage.id,
      displayName: trainingStage.displayName,
      floorY: trainingStage.floorY,
      zOffset: trainingStage.zOffset,
      bounds: trainingStage.bounds,
      camera: {
        x: -25 + trainingStage.camera.startX,
        y: trainingStage.camera.startY,
        zoom: trainingStage.camera.zoom,
        shake: cameraShake,
      },
      envColor,
      layers: trainingStage.layers,
      animations: trainingStage.animations,
      bgControllers: trainingStage.bgControllers,
    });
  });
});

function actorAt(x: number, screenBound?: RuntimeSnapshotActor["runtime"]["screenBound"]): RuntimeSnapshotActor {
  return {
    runtime: {
      pos: { x, y: 0 },
      screenBound,
    },
  };
}
