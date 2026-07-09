import { describe, expect, it } from "vitest";
import type { RuntimeDirectCombatWorld } from "../mugen/runtime/DirectCombatSystem";
import type { RuntimeEffectLifecycleWorld } from "../mugen/runtime/EffectLifecycleSystem";
import type { RuntimeGetHitStateWorld } from "../mugen/runtime/GetHitStateSystem";
import type { RuntimeGuardWorld } from "../mugen/runtime/GuardSystem";
import type { RuntimeHitOverrideWorld } from "../mugen/runtime/HitOverrideSystem";
import type { RuntimeHitStateTransitionWorld } from "../mugen/runtime/HitStateTransitionSystem";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import type { RuntimeContactPresentationWorld } from "../mugen/runtime/RuntimeContactPresentationSystem";
import type { RuntimeCombatResolutionWorld } from "../mugen/runtime/RuntimeCombatResolutionSystem";
import {
  RuntimeMatchCombatBridgeWorld,
  type RuntimeMatchCombatBridgeActor,
} from "../mugen/runtime/RuntimeMatchCombatBridgeSystem";
import type { RuntimeHelperCombatWorld } from "../mugen/runtime/RuntimeHelperCombatSystem";
import type { RuntimeReversalWorld } from "../mugen/runtime/ReversalSystem";
import type { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";

describe("RuntimeMatchCombatBridgeWorld", () => {
  it("wires priority, direct, projectile, and helper combat through one bridge", () => {
    const calls: string[] = [];
    const p1 = actor("p1");
    const p2 = actor("p2");
    const projectile = { serialId: "proj-1" } as RuntimeProjectile;
    const directCombatWorld = tagged<RuntimeDirectCombatWorld>("direct-world");
    const targetWorld = tagged<RuntimeTargetWorld>("target-world");
    const combatStateHooks = tagged<object>("combat-hooks");
    const helperStateHooks = tagged<object>("helper-hooks");
    const defaultHurtBoxes = [{ x1: -1, y1: -2, x2: 3, y2: 4 }];

    const bridge = new RuntimeMatchCombatBridgeWorld().createResolvers({
      combatResolutionWorld: {
        resolvePriorityClash: (input) => {
          calls.push(`priority:${input.left.id}:${input.right.id}:${tagOf(input.directCombatWorld)}`);
          return "priority-log";
        },
        resolveDirect: (input) => {
          calls.push(`direct:${input.attacker.id}:${input.defender.id}:${input.runtimeTick}:${tagOf(input.stateHooks)}`);
          input.getHurtBoxes?.(input.defender);
          input.log("direct-log");
          return { kind: "skipped", reason: "missing-move" };
        },
        resolveProjectile: (input) => {
          calls.push(`projectile:${input.attacker.id}:${input.defender.id}:${tagOf(input.effectLifecycleWorld)}:${tagOf(input.reversalWorld)}`);
          input.rememberProjectileTarget?.(input.attacker, input.defender, projectile);
          input.recordAudioOperation?.(input.attacker, { kind: "audio", controllerType: "playsnd", value: "S6,0" });
          input.log("projectile-log");
        },
      } satisfies Pick<RuntimeCombatResolutionWorld, "resolvePriorityClash" | "resolveDirect" | "resolveProjectile">,
      helperCombatWorld: {
        resolveDirect: (input) => {
          calls.push(
            `helper:${input.owner.id}:${input.defender.id}:${tagOf(input.targetWorld)}:${tagOf(input.reversalWorld)}:${tagOf(input.stateHooks)}:${input.defaultHurtBoxes?.length ?? 0}`,
          );
          input.getHurtBoxes(input.defender);
          input.log?.("helper-log");
        },
      } satisfies Pick<RuntimeHelperCombatWorld, "resolveDirect">,
      directCombatWorld,
      hitOverrideWorld: tagged<RuntimeHitOverrideWorld>("hit-override"),
      reversalWorld: tagged<RuntimeReversalWorld>("reversal"),
      guardWorld: tagged<RuntimeGuardWorld>("guard"),
      getHitStateWorld: tagged<RuntimeGetHitStateWorld>("get-hit"),
      hitStateTransitionWorld: tagged<RuntimeHitStateTransitionWorld>("hit-transition"),
      contactPresentationWorld: tagged<RuntimeContactPresentationWorld>("presentation"),
      effectLifecycleWorld: tagged<Pick<RuntimeEffectLifecycleWorld, "markGetHit">>("effect-lifecycle"),
      targetWorld,
      runtimeTick: 77,
      getHurtBoxes: (target) => {
        calls.push(`hurt:${target.id}`);
        return defaultHurtBoxes;
      },
      combatStateHooks: combatStateHooks as never,
      helperStateHooks: helperStateHooks as never,
      defaultHurtBoxes,
      rememberProjectileTarget: (source, target, entry) => calls.push(`remember:${source.id}:${target.id}:${entry.serialId}`),
      recordAudioOperation: (actor, operation) => calls.push(`audio:${actor.id}:${operation.value}`),
      log: (line) => calls.push(`log:${line}`),
    });

    expect(bridge.resolvePriorityClash(p1, p2)).toBe("priority-log");
    bridge.resolveDirectCombat(p1, p2);
    bridge.resolveProjectileCombat(p1, p2);
    bridge.resolveHelperCombat(p1, p2);

    expect(calls).toEqual([
      "priority:p1:p2:direct-world",
      "direct:p1:p2:77:combat-hooks",
      "hurt:p2",
      "log:direct-log",
      "projectile:p1:p2:effect-lifecycle:reversal",
      "remember:p1:p2:proj-1",
      "audio:p1:S6,0",
      "log:projectile-log",
      "helper:p1:p2:target-world:reversal:helper-hooks:1",
      "hurt:p2",
      "log:helper-log",
    ]);
  });
});

function actor(id: string): RuntimeMatchCombatBridgeActor {
  return { id, label: id } as RuntimeMatchCombatBridgeActor;
}

function tagged<T>(tag: string): T {
  return { tag } as T;
}

function tagOf(value: unknown): string {
  return (value as { tag?: string }).tag ?? "untagged";
}
