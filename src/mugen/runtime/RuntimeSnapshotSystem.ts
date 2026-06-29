import type { MugenStageDefinition } from "../model/MugenStage";
import type { CharacterRuntimeState, RuntimeStageFlash, StageSnapshot } from "./types";

export type RuntimeSnapshotActor = {
  runtime: {
    pos: CharacterRuntimeState["pos"];
    screenBound?: Pick<NonNullable<CharacterRuntimeState["screenBound"]>, "moveCameraX">;
  };
};

export type RuntimeStageSnapshotInput = {
  stage: MugenStageDefinition;
  actors: RuntimeSnapshotActor[];
  cameraShake?: StageSnapshot["camera"]["shake"];
  envColor?: RuntimeStageFlash;
};

export class RuntimeSnapshotWorld {
  stage(input: RuntimeStageSnapshotInput): StageSnapshot {
    const center = cameraCenterX(input.actors);
    return {
      id: input.stage.id,
      displayName: input.stage.displayName,
      floorY: input.stage.floorY,
      zOffset: input.stage.zOffset,
      bounds: input.stage.bounds,
      camera: {
        x: center + input.stage.camera.startX,
        y: input.stage.camera.startY,
        zoom: input.stage.camera.zoom,
        ...(input.cameraShake ? { shake: input.cameraShake } : {}),
      },
      ...(input.envColor ? { envColor: input.envColor } : {}),
      layers: input.stage.layers,
      animations: input.stage.animations,
      bgControllers: input.stage.bgControllers,
    };
  }
}

export function cameraCenterX(actors: RuntimeSnapshotActor[]): number {
  const cameraActors = actors.filter((actor) => actor.runtime.screenBound?.moveCameraX !== false);
  const source = cameraActors.length > 0 ? cameraActors : actors;
  return source.reduce((sum, actor) => sum + actor.runtime.pos.x, 0) / Math.max(1, source.length);
}
