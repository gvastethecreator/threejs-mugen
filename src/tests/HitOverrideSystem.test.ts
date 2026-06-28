import { describe, expect, it } from "vitest";
import { RuntimeHitOverrideWorld, type RuntimeHitOverrideActor } from "../mugen/runtime/HitOverrideSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("HitOverrideSystem", () => {
  it("ticks finite HitOverride slots and preserves infinite slots", () => {
    const world = new RuntimeHitOverrideWorld();
    const state = runtimeState({
      hitOverrides: [
        { slot: 1, attr: "S,NA", remaining: 2, stateNo: 777 },
        { slot: 2, attr: "S,SA", remaining: 1, stateNo: 778 },
        { slot: 3, attr: "A,AA", remaining: Number.POSITIVE_INFINITY, stateNo: 779 },
      ],
    });

    world.tickSlots(state);

    expect(state.hitOverrides).toEqual([
      { slot: 1, attr: "S,NA", remaining: 1, stateNo: 777 },
      { slot: 3, attr: "A,AA", remaining: Number.POSITIVE_INFINITY, stateNo: 779 },
    ]);

    world.tickSlots(state);
    expect(state.hitOverrides).toEqual([{ slot: 3, attr: "A,AA", remaining: Number.POSITIVE_INFINITY, stateNo: 779 }]);
  });

  it("clears hit/guard state and redirects through the enter-state hook", () => {
    const world = new RuntimeHitOverrideWorld();
    const attacker = actor("p1", "Attacker", { hitPause: 0 });
    const defender = actor("p2", "Defender", {
      hitPause: 0,
      hitStun: 17,
      guardStun: 9,
      guardSlideTime: 4,
      guardControlTime: 5,
      guarding: true,
      stateType: "S",
      physics: "S",
    });
    const enteredStates: number[] = [];

    const result = world.applyRedirect(attacker, defender, {
      slot: 1,
      attr: "S,NA",
      remaining: 12,
      stateNo: 777,
      forceAir: true,
      forceGuard: true,
    }, 6, {
      tryEnterState: (_target, stateNo) => {
        enteredStates.push(stateNo);
        return true;
      },
    });

    expect(result.message).toBe("Defender HitOverride slot 1 redirected Attacker to state 777");
    expect(attacker.hitPause).toBe(6);
    expect(defender.hitPause).toBe(6);
    expect(defender.hitStun).toBe(0);
    expect(defender.runtime.guardStun).toBe(0);
    expect(defender.runtime.guardSlideTime).toBe(0);
    expect(defender.runtime.guardControlTime).toBe(0);
    expect(defender.runtime.guarding).toBe(true);
    expect(defender.runtime.stateType).toBe("A");
    expect(defender.runtime.physics).toBe("A");
    expect(defender.runtime.moveType).toBe("H");
    expect(defender.removedExplodsOnGetHit).toBe(1);
    expect(enteredStates).toEqual([777]);
  });

  it("honors keepState and forceGuard defaults", () => {
    const world = new RuntimeHitOverrideWorld();
    const attacker = actor("p1", "Attacker");
    const defender = actor("p2", "Defender", { guarding: true });
    let entered = false;

    world.applyRedirect(attacker, defender, {
      slot: 2,
      attr: "S,NA",
      remaining: 12,
      stateNo: 778,
      keepState: true,
    }, 3, {
      tryEnterState: () => {
        entered = true;
        return true;
      },
    });

    expect(entered).toBe(false);
    expect(defender.runtime.guarding).toBe(false);
    expect(defender.runtime.moveType).toBe("I");
    expect(defender.removedExplodsOnGetHit).toBe(0);
  });
});

type ActorOverrides = Partial<CharacterRuntimeState> & Partial<Pick<RuntimeHitOverrideActor, "hitPause" | "hitStun">>;

function actor(id: string, label: string, overrides: ActorOverrides = {}): RuntimeHitOverrideActor & { removedExplodsOnGetHit: number } {
  let removedExplodsOnGetHit = 0;
  return {
    id,
    label,
    runtime: runtimeState(overrides),
    hitPause: overrides.hitPause ?? 0,
    hitStun: overrides.hitStun ?? 0,
    get removedExplodsOnGetHit() {
      return removedExplodsOnGetHit;
    },
    effectActorWorld: {
      removeExplodsOnGetHit: () => {
        removedExplodsOnGetHit += 1;
      },
    },
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 100,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}
