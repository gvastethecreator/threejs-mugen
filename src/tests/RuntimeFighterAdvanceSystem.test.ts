import { describe, expect, it } from "vitest";
import {
  RuntimeFighterAdvanceWorld,
  type RuntimeFighterAdvanceActor,
  type RuntimeFighterAdvanceHooks,
} from "../mugen/runtime/RuntimeFighterAdvanceSystem";

describe("RuntimeFighterAdvanceWorld", () => {
  it("owns the bounded per-fighter advance order", () => {
    const actor = advanceActor({ x: 4, y: -2 }, 45, { x: 2, y: 0.5 });
    const calls: string[] = [];

    const result = new RuntimeFighterAdvanceWorld().advance({
      actor,
      hooks: orderedHooks(calls),
    });

    expect(calls).toEqual([
      "sprite-effects:45",
      "hitby",
      "hitoverride",
      "contact",
      "state-clock:cleared/scale-cleared",
      "constraints-reset",
      "fall-recovery-tick",
      "preserve-read:8,-3",
      "stun:true",
      "move-lifecycle",
      "kinematics:true",
      "animation",
      "active-controllers",
      "ground-recovery",
      "liedown-recovery",
      "preserve-frozen:8,-3",
    ]);
    expect(actor.runtime.renderAngle).toBeUndefined();
    expect(actor.runtime.renderScale).toBeUndefined();
    expect(result).toEqual({
      tickStartPos: { x: 8, y: -3 },
      preserveImportedStateMoveType: true,
    });
  });
});

type AdvanceActor = RuntimeFighterAdvanceActor & {
  runtime: RuntimeFighterAdvanceActor["runtime"];
};

function orderedHooks(calls: string[]): RuntimeFighterAdvanceHooks<AdvanceActor> {
  return {
    tickSpriteEffects: (actor) => calls.push(`sprite-effects:${actor.runtime.renderAngle ?? "none"}`),
    tickHitBySlots: () => calls.push("hitby"),
    tickHitOverrideSlots: () => calls.push("hitoverride"),
    advanceContactTimers: () => calls.push("contact"),
    advanceStateClock: (actor) =>
      calls.push(
        `state-clock:${actor.runtime.renderAngle === undefined ? "cleared" : "dirty"}/scale-${
          actor.runtime.renderScale === undefined ? "cleared" : "dirty"
        }`,
      ),
    resetFrameConstraints: () => calls.push("constraints-reset"),
    tickHitFallRecoveryWindow: (actor) => {
      actor.runtime.pos = { x: 8, y: -3 };
      calls.push("fall-recovery-tick");
    },
    shouldPreserveImportedStateMoveType: (actor) => {
      calls.push(`preserve-read:${actor.runtime.pos.x},${actor.runtime.pos.y}`);
      return true;
    },
    advanceStun: (_actor, preserveImportedStateMoveType) => calls.push(`stun:${preserveImportedStateMoveType}`),
    advanceMoveLifecycle: () => calls.push("move-lifecycle"),
    advanceKinematics: (actor, preserveImportedStateMoveType) => {
      calls.push(`kinematics:${preserveImportedStateMoveType}`);
      actor.runtime.pos = { x: 99, y: 99 };
    },
    advanceAnimation: () => calls.push("animation"),
    runActiveStateControllers: () => calls.push("active-controllers"),
    advanceImportedGroundRecoveryLanding: () => calls.push("ground-recovery"),
    advanceCommon1LieDownRecovery: () => calls.push("liedown-recovery"),
    preserveFrozenPosition: (_actor, tickStartPos) => calls.push(`preserve-frozen:${tickStartPos.x},${tickStartPos.y}`),
  };
}

function advanceActor(pos: { x: number; y: number }, renderAngle?: number, renderScale?: { x: number; y: number }): AdvanceActor {
  return {
    runtime: {
      pos: { ...pos },
      renderAngle,
      renderScale,
    },
  };
}
