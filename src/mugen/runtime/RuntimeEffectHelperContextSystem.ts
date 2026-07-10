import type { RuntimeHelper, RuntimeHelperAdvanceOptions } from "./HelperSystem";
import { RuntimeOpponentSelectionWorld } from "./RuntimeOpponentSelectionSystem";
import type { RuntimeTargetWorldActor } from "./TargetSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeEffectHelperContextActor = {
  id: string;
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "stateNo" | "moveType">;
  targets?: RuntimeTargetWorldActor["targets"];
  targetBindings?: RuntimeTargetWorldActor["targetBindings"];
  bindToTarget?: RuntimeTargetWorldActor["bindToTarget"];
  enterHelperTargetState?: (helper: RuntimeHelper, target: RuntimeTargetWorldActor, stateId: number) => void;
  onHelperController?: RuntimeHelperAdvanceOptions["onController"];
  onHelperOperation?: RuntimeHelperAdvanceOptions["onOperation"];
  onHelperPauseController?: RuntimeHelperAdvanceOptions["onPauseController"];
  scaleHelperTargetDamage?: RuntimeHelperAdvanceOptions["scaleTargetDamage"];
};

export type RuntimeEffectHelperContextOpponent = {
  id?: string;
  runtime: RuntimeEffectHelperContextActor["runtime"];
};

export type RuntimeEffectHelperContextOptions = Pick<
  RuntimeHelperAdvanceOptions,
  "gameSpace" | "stageTime" | "runtimeTick" | "opponentRoster" | "pauseKind"
> & {
  opponents?: readonly RuntimeEffectHelperContextOpponent[];
};

export type RuntimeEffectHelperContext = {
  parentState?: CharacterRuntimeState;
  rootState?: CharacterRuntimeState;
  opponentId?: string;
  opponentState?: CharacterRuntimeState;
  opponentRoster?: RuntimeHelperAdvanceOptions["opponentRoster"];
  gameSpace?: RuntimeHelperAdvanceOptions["gameSpace"];
  stageTime?: number;
  runtimeTick?: number;
  pauseKind?: RuntimeHelperAdvanceOptions["pauseKind"];
  targetCandidates?: RuntimeTargetWorldActor[];
  enterTargetState?: RuntimeHelperAdvanceOptions["enterTargetState"];
  onController?: RuntimeHelperAdvanceOptions["onController"];
  onOperation?: RuntimeHelperAdvanceOptions["onOperation"];
  onPauseController?: RuntimeHelperAdvanceOptions["onPauseController"];
  scaleTargetDamage?: RuntimeHelperAdvanceOptions["scaleTargetDamage"];
};

export type RuntimeEffectHelperContextInput = {
  actor: RuntimeEffectHelperContextActor;
  opponent?: RuntimeEffectHelperContextActor;
  options?: RuntimeEffectHelperContextOptions;
};

export class RuntimeEffectHelperContextWorld {
  constructor(private readonly opponentSelectionWorld = new RuntimeOpponentSelectionWorld()) {}

  create(input: RuntimeEffectHelperContextInput): RuntimeEffectHelperContext {
    const { actor, opponent, options = {} } = input;
    if (!isCompleteRuntimeState(actor.runtime)) {
      return {};
    }

    const { opponents, ...helperOptions } = options;
    let opponentId: string | undefined;
    let opponentState: CharacterRuntimeState | undefined;
    let opponentRoster: RuntimeHelperAdvanceOptions["opponentRoster"];
    const completeOpponents = opponents?.filter(isCompleteHelperContextOpponent);

    if (completeOpponents && completeOpponents.length > 0) {
      opponentRoster = this.opponentSelectionWorld.buildOpponentRoster({ runtime: actor.runtime }, completeOpponents);
    }
    if (opponent && isCompleteRuntimeState(opponent.runtime)) {
      opponentId = opponent.id;
      opponentState = opponent.runtime;
      opponentRoster ??= this.opponentSelectionWorld.buildOpponentRoster({ runtime: actor.runtime }, [
        { id: opponent.id, runtime: opponent.runtime },
      ]);
    }

    return {
      parentState: actor.runtime,
      rootState: actor.runtime,
      opponentId,
      opponentState,
      ...helperOptions,
      opponentRoster: helperOptions.opponentRoster ?? opponentRoster,
      ...(opponent && isRuntimeTargetWorldActor(opponent) ? { targetCandidates: [opponent] } : {}),
      ...(actor.enterHelperTargetState ? { enterTargetState: actor.enterHelperTargetState } : {}),
      ...(actor.onHelperController ? { onController: actor.onHelperController } : {}),
      ...(actor.onHelperOperation ? { onOperation: actor.onHelperOperation } : {}),
      ...(actor.onHelperPauseController ? { onPauseController: actor.onHelperPauseController } : {}),
      ...(actor.scaleHelperTargetDamage ? { scaleTargetDamage: actor.scaleHelperTargetDamage } : {}),
    };
  }
}

function isCompleteHelperContextOpponent(
  opponent: RuntimeEffectHelperContextOpponent,
): opponent is RuntimeEffectHelperContextOpponent & { runtime: CharacterRuntimeState } {
  return isCompleteRuntimeState(opponent.runtime);
}

function isRuntimeTargetWorldActor(
  actor: RuntimeEffectHelperContextActor,
): actor is RuntimeEffectHelperContextActor & RuntimeTargetWorldActor {
  return isCompleteRuntimeState(actor.runtime) && Array.isArray(actor.targets) && Array.isArray(actor.targetBindings);
}

function isCompleteRuntimeState(
  runtime: RuntimeEffectHelperContextActor["runtime"],
): runtime is CharacterRuntimeState {
  return (
    "vel" in runtime &&
    "animNo" in runtime &&
    "animTime" in runtime &&
    "frameIndex" in runtime &&
    "life" in runtime &&
    "power" in runtime &&
    "ctrl" in runtime &&
    "stateType" in runtime &&
    "physics" in runtime &&
    "vars" in runtime &&
    "fvars" in runtime
  );
}
