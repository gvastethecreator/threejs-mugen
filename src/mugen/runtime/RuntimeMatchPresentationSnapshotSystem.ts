import type { MugenStageDefinition } from "../model/MugenStage";
import type { RuntimeEffectLifecycleActor, RuntimeEffectSnapshotGroups } from "./EffectLifecycleSystem";
import type { RuntimeEnvShakeWorldActor } from "./EnvShakeSystem";
import type { RuntimeEffectSnapshotInput, RuntimeSnapshotActor, RuntimeStageSnapshotInput } from "./RuntimeSnapshotSystem";
import type { RuntimePaletteFxState, RuntimeStageFlash, StageSnapshot } from "./types";

export type RuntimeMatchPresentationSnapshotActor = RuntimeSnapshotActor &
  RuntimeEnvShakeWorldActor &
  RuntimeEffectLifecycleActor;

export type RuntimeMatchPresentationSnapshotInput<TActor extends RuntimeMatchPresentationSnapshotActor> = {
  tick: number;
  stage: MugenStageDefinition;
  backgroundTick?: number;
  p1: TActor;
  p2: TActor;
  cameraActors?: readonly TActor[];
  envShakeWorld: {
    snapshotCameraShake(runtimeTick: number, actors: readonly TActor[]): StageSnapshot["camera"]["shake"] | undefined;
  };
  envColorWorld: {
    snapshotStageFlash(runtimeTick: number): RuntimeStageFlash | undefined;
  };
  bgPalFxWorld?: {
    snapshot(): RuntimePaletteFxState | undefined;
  };
  effectLifecycleWorld: {
    snapshotGroups(actor: TActor): RuntimeEffectSnapshotGroups;
  };
};

export type RuntimeMatchPresentationSnapshotResult = {
  stage: RuntimeStageSnapshotInput;
  effects: RuntimeEffectSnapshotInput;
};

export class RuntimeMatchPresentationSnapshotWorld {
  create<TActor extends RuntimeMatchPresentationSnapshotActor>(
    input: RuntimeMatchPresentationSnapshotInput<TActor>,
  ): RuntimeMatchPresentationSnapshotResult {
    const actors = [input.p1, input.p2] as const;
    const bgPalFx = input.bgPalFxWorld?.snapshot();
    return {
      stage: {
        stage: input.stage,
        actors: [...(input.cameraActors ?? actors)],
        cameraShake: input.envShakeWorld.snapshotCameraShake(input.tick, actors),
        envColor: input.envColorWorld.snapshotStageFlash(input.tick),
        ...(bgPalFx ? { bgPalFx } : {}),
        ...(input.backgroundTick === undefined ? {} : { backgroundTick: input.backgroundTick }),
      },
      effects: {
        p1: input.effectLifecycleWorld.snapshotGroups(input.p1),
        p2: input.effectLifecycleWorld.snapshotGroups(input.p2),
      },
    };
  }
}
