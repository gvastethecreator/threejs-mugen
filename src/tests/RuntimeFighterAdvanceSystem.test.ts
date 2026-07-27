import { describe, expect, it } from "vitest";
import {
  RuntimeFighterAdvanceWorld,
  type RuntimeFighterAdvanceActor,
  type RuntimeFighterAdvanceHooks,
} from "../mugen/runtime/RuntimeFighterAdvanceSystem";
import { RuntimeHitTmpWorld } from "../mugen/runtime/RuntimeHitTmpSystem";

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
      "fall-defense-up",
      "ground-recovery",
      "liedown-recovery",
      "preserve-frozen:8,-3",
    ]);
    expect(actor.runtime.renderAngle).toBeUndefined();
    expect(actor.runtime.renderScale).toBeUndefined();
    expect(result).toEqual({
      tickStartPos: { x: 8, y: -3, z: 0 },
      preserveImportedStateMoveType: true,
    });
  });

  it("syncs hittmp after the frame mutation hooks when requested", () => {
    const actor = advanceActor({ x: 4, y: -2 }, 45, { x: 2, y: 0.5 });
    actor.runtime.moveType = "H";
    actor.runtime.hitFall = { falling: true, damage: 0, velocity: { y: -1 } };
    const synced: string[] = [];

    new RuntimeFighterAdvanceWorld().advance({
      actor,
      hooks: {
        ...orderedHooks([]),
        syncHitTmp: (current) => {
          new RuntimeHitTmpWorld().sync(current.runtime);
          synced.push(`${current.runtime.hitTmp}`);
        },
      },
    });

    expect(synced).toEqual(["2"]);
    expect(actor.runtime.hitTmp).toBe(2);
  });

  it("keeps acttmp preparation and finish around the fighter mutation hooks", () => {
    const calls: string[] = [];
    const actor = advanceActor({ x: 0, y: 0 });

    new RuntimeFighterAdvanceWorld().advance({
      actor,
      hooks: {
        ...orderedHooks(calls),
        prepareActTmp: () => calls.push("acttmp-prepare"),
        finishActTmp: () => calls.push("acttmp-finish"),
        syncHitTmp: () => calls.push("hittmp-sync"),
      },
    });

    expect(calls[0]).toBe("acttmp-prepare");
    expect(calls.at(-2)).toBe("acttmp-finish");
    expect(calls.at(-1)).toBe("hittmp-sync");
  });

  it("settles pending state changes before action and get-hit snapshots", () => {
    const calls: string[] = [];
    const actor = advanceActor({ x: 0, y: 0 });

    new RuntimeFighterAdvanceWorld().advance({
      actor,
      hooks: {
        ...orderedHooks(calls),
        settleStateChangeTmp: () => calls.push("stchtmp-settle"),
        finishActTmp: () => calls.push("acttmp-finish"),
        syncHitTmp: () => calls.push("hittmp-sync"),
      },
    });

    expect(calls.at(-3)).toBe("stchtmp-settle");
    expect(calls.at(-2)).toBe("acttmp-finish");
    expect(calls.at(-1)).toBe("hittmp-sync");
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
    applyCommon1FallDefenseUp: () => calls.push("fall-defense-up"),
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
