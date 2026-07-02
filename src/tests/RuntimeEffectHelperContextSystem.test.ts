import { describe, expect, it } from "vitest";
import type { RuntimeHelperAdvanceOptions } from "../mugen/runtime/HelperSystem";
import {
  RuntimeEffectHelperContextWorld,
  type RuntimeEffectHelperContextActor,
} from "../mugen/runtime/RuntimeEffectHelperContextSystem";
import type { RuntimeTargetWorldActor } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeEffectHelperContextWorld", () => {
  it("builds nearest helper opponent roster from explicit lifecycle opponents", () => {
    const actor = contextActor("p1", 0);
    const far = contextActor("p2-far", 160);
    const near = contextActor("p2-near", 80);
    const tied = contextActor("p2-tie", -80);

    const context = new RuntimeEffectHelperContextWorld().create({
      actor,
      opponent: far,
      options: {
        opponents: [far, near, tied],
        stageTime: 12,
        runtimeTick: 120,
      },
    });

    expect(context.opponentId).toBe("p2-far");
    expect(context.opponentState).toBe(far.runtime);
    expect(context.opponentRoster?.map((entry) => entry.id)).toEqual(["p2-near", "p2-tie", "p2-far"]);
    expect(context.opponentRoster?.map((entry) => entry.state)).toEqual([near.runtime, tied.runtime, far.runtime]);
    expect(context.stageTime).toBe(12);
    expect(context.runtimeTick).toBe(120);
    expect("opponents" in context).toBe(false);
  });

  it("preserves an explicit helper opponent roster over lifecycle roster construction", () => {
    const actor = contextActor("p1", 0);
    const currentOpponent = contextActor("p2-current", 48);
    const extraOpponent = contextActor("p2-extra", 24);
    const suppliedRoster = [{ id: "manual", state: extraOpponent.runtime }];

    const context = new RuntimeEffectHelperContextWorld().create({
      actor,
      opponent: currentOpponent,
      options: {
        opponents: [currentOpponent, extraOpponent],
        opponentRoster: suppliedRoster,
      },
    });

    expect(context.opponentId).toBe("p2-current");
    expect(context.opponentState).toBe(currentOpponent.runtime);
    expect(context.opponentRoster).toBe(suppliedRoster);
  });

  it("forwards target candidates plus helper target-state and telemetry hooks", () => {
    const enterTargetState = () => undefined;
    const onController: RuntimeHelperAdvanceOptions["onController"] = () => undefined;
    const onOperation: RuntimeHelperAdvanceOptions["onOperation"] = () => undefined;
    const actor: RuntimeEffectHelperContextActor = {
      ...contextActor("p1", 0),
      enterHelperTargetState: enterTargetState,
      onHelperController: onController,
      onHelperOperation: onOperation,
    };
    const opponent = targetActor("p2", 64);

    const context = new RuntimeEffectHelperContextWorld().create({ actor, opponent });

    expect(context.parentState).toBe(actor.runtime);
    expect(context.rootState).toBe(actor.runtime);
    expect(context.targetCandidates).toEqual([opponent]);
    expect(context.enterTargetState).toBe(enterTargetState);
    expect(context.onController).toBe(onController);
    expect(context.onOperation).toBe(onOperation);
  });

  it("fails closed when the owner runtime is not a complete runtime state", () => {
    const actor: RuntimeEffectHelperContextActor = {
      id: "p1",
      runtime: {
        pos: { x: 0, y: 0 },
        facing: 1,
        stateNo: 200,
        moveType: "I",
      },
    };

    const context = new RuntimeEffectHelperContextWorld().create({
      actor,
      opponent: contextActor("p2", 48),
      options: { stageTime: 12, runtimeTick: 120 },
    });

    expect(context).toEqual({});
  });
});

function contextActor(id: string, x: number): RuntimeEffectHelperContextActor & { runtime: CharacterRuntimeState } {
  const runtime = runtimeState();
  runtime.pos.x = x;
  return { id, runtime };
}

function targetActor(id: string, x: number): RuntimeEffectHelperContextActor & RuntimeTargetWorldActor {
  const actor = contextActor(id, x);
  return {
    ...actor,
    targets: [],
    targetBindings: [],
  };
}

function runtimeState(): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
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
  };
}
