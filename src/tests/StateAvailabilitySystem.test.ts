import { describe, expect, it } from "vitest";
import {
  RuntimeStateAvailabilityWorld,
  type RuntimeStateAvailabilityActor,
  type RuntimeStateAvailabilityProgramState,
} from "../mugen/runtime/StateAvailabilitySystem";
import type { MugenStateDef } from "../mugen/model/MugenState";

describe("RuntimeStateAvailabilityWorld", () => {
  it("finds compiled runtime states before parsed definition states", () => {
    const world = new RuntimeStateAvailabilityWorld();
    const parsed = state(200, { anim: 200 });
    const compiled = state(200, { anim: 201 });
    const actor = availabilityActor({ runtimeStates: [{ id: 200, source: compiled }], states: [parsed] });

    expect(world.findState(actor, 200)).toBe(compiled);
    expect(world.canEnterState(actor, 200)).toBe(true);
  });

  it("accepts parsed states and animation-only fallbacks", () => {
    const world = new RuntimeStateAvailabilityWorld();
    const actor = availabilityActor({ states: [state(5000)], animations: [120] });

    expect(world.canEnterState(actor, 5000)).toBe(true);
    expect(world.canEnterState(actor, 120)).toBe(true);
    expect(world.canEnterState(actor, 999)).toBe(false);
  });

  it("uses state owner data when target is in an owner-backed custom state", () => {
    const world = new RuntimeStateAvailabilityWorld();
    const target = availabilityActor({ states: [state(0)], animations: [0] });
    const owner = availabilityActor({ states: [state(888)], animations: [889] });

    expect(world.canEnterState(target, 888, owner)).toBe(true);
    expect(world.canEnterState(target, 889, owner)).toBe(true);
    expect(world.canEnterState(target, 888)).toBe(false);
  });
});

function availabilityActor(options: {
  states?: MugenStateDef[];
  runtimeStates?: RuntimeStateAvailabilityProgramState[];
  animations?: number[];
}): RuntimeStateAvailabilityActor {
  return {
    runtimeProgram: options.runtimeStates ? { states: options.runtimeStates } : undefined,
    definition: {
      states: options.states,
      animations: new Map((options.animations ?? []).map((id) => [id, { id, frames: [] }])),
    },
  };
}

function state(id: number, overrides: Partial<MugenStateDef> = {}): MugenStateDef {
  return {
    id,
    line: 0,
    rawParams: {},
    controllers: [],
    ...overrides,
  };
}
