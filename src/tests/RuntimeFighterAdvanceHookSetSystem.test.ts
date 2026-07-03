import { describe, expect, it } from "vitest";
import { RuntimeFighterAdvanceHookSetWorld } from "../mugen/runtime/RuntimeFighterAdvanceHookSetSystem";
import type { RuntimeFighterAdvanceActor } from "../mugen/runtime/RuntimeFighterAdvanceSystem";

describe("RuntimeFighterAdvanceHookSetWorld", () => {
  it("groups every fighter-advance hook route without replacing callbacks", () => {
    const calls: string[] = [];
    const input = {
      tickSpriteEffects: () => calls.push("sprite-effects"),
      tickHitBySlots: () => calls.push("hitby"),
      tickHitOverrideSlots: () => calls.push("hitoverride"),
      advanceContactTimers: () => calls.push("contact"),
      advanceStateClock: () => calls.push("state-clock"),
      resetFrameConstraints: () => calls.push("constraints"),
      tickHitFallRecoveryWindow: () => calls.push("fall-window"),
      shouldPreserveImportedStateMoveType: () => {
        calls.push("preserve-read");
        return true;
      },
      advanceStun: (_actor: AdvanceHookActor, preserve: boolean) => calls.push(`stun:${preserve}`),
      advanceMoveLifecycle: () => calls.push("move-lifecycle"),
      advanceKinematics: (_actor: AdvanceHookActor, preserve: boolean) => calls.push(`kinematics:${preserve}`),
      advanceAnimation: () => calls.push("animation"),
      runActiveStateControllers: () => calls.push("active-controllers"),
      advanceImportedGroundRecoveryLanding: () => calls.push("ground-recovery"),
      advanceCommon1LieDownRecovery: () => calls.push("liedown-recovery"),
      preserveFrozenPosition: (_actor: AdvanceHookActor, pos: { x: number; y: number }) =>
        calls.push(`preserve-frozen:${pos.x},${pos.y}`),
    };

    const hooks = new RuntimeFighterAdvanceHookSetWorld().create<AdvanceHookActor>(input);
    const actor = advanceActor();

    expect(hooks.tickSpriteEffects).toBe(input.tickSpriteEffects);
    expect(hooks.tickHitBySlots).toBe(input.tickHitBySlots);
    expect(hooks.tickHitOverrideSlots).toBe(input.tickHitOverrideSlots);
    expect(hooks.advanceContactTimers).toBe(input.advanceContactTimers);
    expect(hooks.advanceStateClock).toBe(input.advanceStateClock);
    expect(hooks.resetFrameConstraints).toBe(input.resetFrameConstraints);
    expect(hooks.tickHitFallRecoveryWindow).toBe(input.tickHitFallRecoveryWindow);
    expect(hooks.shouldPreserveImportedStateMoveType).toBe(input.shouldPreserveImportedStateMoveType);
    expect(hooks.advanceStun).toBe(input.advanceStun);
    expect(hooks.advanceMoveLifecycle).toBe(input.advanceMoveLifecycle);
    expect(hooks.advanceKinematics).toBe(input.advanceKinematics);
    expect(hooks.advanceAnimation).toBe(input.advanceAnimation);
    expect(hooks.runActiveStateControllers).toBe(input.runActiveStateControllers);
    expect(hooks.advanceImportedGroundRecoveryLanding).toBe(input.advanceImportedGroundRecoveryLanding);
    expect(hooks.advanceCommon1LieDownRecovery).toBe(input.advanceCommon1LieDownRecovery);
    expect(hooks.preserveFrozenPosition).toBe(input.preserveFrozenPosition);

    hooks.tickSpriteEffects(actor);
    hooks.tickHitBySlots(actor);
    hooks.tickHitOverrideSlots(actor);
    hooks.advanceContactTimers(actor);
    hooks.advanceStateClock(actor);
    hooks.resetFrameConstraints(actor);
    hooks.tickHitFallRecoveryWindow(actor);
    const preserve = hooks.shouldPreserveImportedStateMoveType(actor);
    hooks.advanceStun(actor, preserve);
    hooks.advanceMoveLifecycle(actor);
    hooks.advanceKinematics(actor, preserve);
    hooks.advanceAnimation(actor);
    hooks.runActiveStateControllers(actor);
    hooks.advanceImportedGroundRecoveryLanding(actor);
    hooks.advanceCommon1LieDownRecovery(actor);
    hooks.preserveFrozenPosition(actor, { x: 4, y: -2 });

    expect(calls).toEqual([
      "sprite-effects",
      "hitby",
      "hitoverride",
      "contact",
      "state-clock",
      "constraints",
      "fall-window",
      "preserve-read",
      "stun:true",
      "move-lifecycle",
      "kinematics:true",
      "animation",
      "active-controllers",
      "ground-recovery",
      "liedown-recovery",
      "preserve-frozen:4,-2",
    ]);
  });
});

type AdvanceHookActor = RuntimeFighterAdvanceActor & { id: string };

function advanceActor(): AdvanceHookActor {
  return {
    id: "p1",
    runtime: {
      pos: { x: 0, y: 0 },
      renderAngle: 0,
    },
  };
}
