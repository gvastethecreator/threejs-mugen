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
  onHelperEnvShakeController?: RuntimeHelperAdvanceOptions["onEnvShakeController"];
  onHelperEnvColorController?: RuntimeHelperAdvanceOptions["onEnvColorController"];
  onHelperStateExecution?: RuntimeHelperAdvanceOptions["onStateExecution"];
  onHelperTeamStandby?: RuntimeHelperAdvanceOptions["onTeamStandby"];
  scaleHelperTargetDamage?: RuntimeHelperAdvanceOptions["scaleTargetDamage"];
};

export type RuntimeEffectHelperContextOpponent = {
  id?: string;
  runtime: RuntimeEffectHelperContextActor["runtime"];
};

export type RuntimeEffectHelperContextOptions = Pick<
  RuntimeHelperAdvanceOptions,
  | "defaultHitFlag"
  | "constants"
  | "opponentConstants"
  | "runtimeProfile"
  | "commandActive"
  | "commandInput"
  | "gameSpace"
  | "stageTime"
  | "runtimeTick"
  | "opponentRoster"
  | "opponentLocalCoord"
  | "p2BodyDistYUsesSizeBoxes"
  | "pauseKind"
  | "teamMode"
  | "roundDecision"
  | "resolveTargetRedirect"
  | "resolveResourceRedirect"
  | "onTargetRedirectBlocked"
  | "onResourceRedirectBlocked"
  | "onRedirectedController"
  | "onRedirectedOperation"
  | "admitResourceWrite"
  | "applySharedResourceWrite"
  | "onTargetLifeAdd"
  | "onRedirectedTargetDispatch"
  | "onModifyProjectile"
  | "enterRedirectedTargetState"
  | "onStateTransitionCycle"
> & {
  opponents?: readonly RuntimeEffectHelperContextOpponent[];
};

export type RuntimeEffectHelperContext = {
  defaultHitFlag?: RuntimeHelperAdvanceOptions["defaultHitFlag"];
  constants?: RuntimeHelperAdvanceOptions["constants"];
  opponentConstants?: RuntimeHelperAdvanceOptions["opponentConstants"];
  runtimeProfile?: RuntimeHelperAdvanceOptions["runtimeProfile"];
  commandActive?: RuntimeHelperAdvanceOptions["commandActive"];
  commandInput?: RuntimeHelperAdvanceOptions["commandInput"];
  parentState?: CharacterRuntimeState;
  rootState?: CharacterRuntimeState;
  opponentId?: string;
  opponentState?: CharacterRuntimeState;
  opponentRoster?: RuntimeHelperAdvanceOptions["opponentRoster"];
  opponentLocalCoord?: RuntimeHelperAdvanceOptions["opponentLocalCoord"];
  p2BodyDistYUsesSizeBoxes?: RuntimeHelperAdvanceOptions["p2BodyDistYUsesSizeBoxes"];
  gameSpace?: RuntimeHelperAdvanceOptions["gameSpace"];
  stageTime?: number;
  runtimeTick?: number;
  pauseKind?: RuntimeHelperAdvanceOptions["pauseKind"];
  teamMode?: RuntimeHelperAdvanceOptions["teamMode"];
  roundDecision?: RuntimeHelperAdvanceOptions["roundDecision"];
  targetCandidates?: RuntimeTargetWorldActor[];
  resolveTargetRedirect?: RuntimeHelperAdvanceOptions["resolveTargetRedirect"];
  resolveResourceRedirect?: RuntimeHelperAdvanceOptions["resolveResourceRedirect"];
  onTargetRedirectBlocked?: RuntimeHelperAdvanceOptions["onTargetRedirectBlocked"];
  onResourceRedirectBlocked?: RuntimeHelperAdvanceOptions["onResourceRedirectBlocked"];
  onRedirectedController?: RuntimeHelperAdvanceOptions["onRedirectedController"];
  onRedirectedOperation?: RuntimeHelperAdvanceOptions["onRedirectedOperation"];
  admitResourceWrite?: RuntimeHelperAdvanceOptions["admitResourceWrite"];
  applySharedResourceWrite?: RuntimeHelperAdvanceOptions["applySharedResourceWrite"];
  onTargetLifeAdd?: RuntimeHelperAdvanceOptions["onTargetLifeAdd"];
  onRedirectedTargetDispatch?: RuntimeHelperAdvanceOptions["onRedirectedTargetDispatch"];
  onModifyProjectile?: RuntimeHelperAdvanceOptions["onModifyProjectile"];
  enterTargetState?: RuntimeHelperAdvanceOptions["enterTargetState"];
  enterRedirectedTargetState?: RuntimeHelperAdvanceOptions["enterRedirectedTargetState"];
  onController?: RuntimeHelperAdvanceOptions["onController"];
  onOperation?: RuntimeHelperAdvanceOptions["onOperation"];
  onPauseController?: RuntimeHelperAdvanceOptions["onPauseController"];
  onEnvShakeController?: RuntimeHelperAdvanceOptions["onEnvShakeController"];
  onEnvColorController?: RuntimeHelperAdvanceOptions["onEnvColorController"];
  onStateExecution?: RuntimeHelperAdvanceOptions["onStateExecution"];
  onTeamStandby?: RuntimeHelperAdvanceOptions["onTeamStandby"];
  scaleTargetDamage?: RuntimeHelperAdvanceOptions["scaleTargetDamage"];
  onStateTransitionCycle?: RuntimeHelperAdvanceOptions["onStateTransitionCycle"];
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
      ...(options.admitResourceWrite ? { admitResourceWrite: options.admitResourceWrite } : {}),
      ...(options.applySharedResourceWrite ? { applySharedResourceWrite: options.applySharedResourceWrite } : {}),
      ...(actor.onHelperPauseController ? { onPauseController: actor.onHelperPauseController } : {}),
      ...(actor.onHelperEnvShakeController ? { onEnvShakeController: actor.onHelperEnvShakeController } : {}),
      ...(actor.onHelperEnvColorController ? { onEnvColorController: actor.onHelperEnvColorController } : {}),
      ...(actor.onHelperStateExecution ? { onStateExecution: actor.onHelperStateExecution } : {}),
      ...(actor.onHelperTeamStandby ? { onTeamStandby: actor.onHelperTeamStandby } : {}),
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
