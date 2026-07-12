import { describe, expect, it } from "vitest";
import type { RuntimeActorConstraintWorld } from "../mugen/runtime/ActorConstraintSystem";
import type { RuntimeEffectLifecycleWorld } from "../mugen/runtime/EffectLifecycleSystem";
import type { RuntimeDirectCombatWorld } from "../mugen/runtime/DirectCombatSystem";
import type { RuntimeGetHitStateWorld } from "../mugen/runtime/GetHitStateSystem";
import type { RuntimeGuardWorld } from "../mugen/runtime/GuardSystem";
import type { RuntimeHitOverrideWorld } from "../mugen/runtime/HitOverrideSystem";
import type { RuntimeHitStateTransitionWorld } from "../mugen/runtime/HitStateTransitionSystem";
import type { RuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import type { RuntimeContactPresentationWorld } from "../mugen/runtime/RuntimeContactPresentationSystem";
import type { RuntimeCombatResolutionWorld } from "../mugen/runtime/RuntimeCombatResolutionSystem";
import type { RuntimeHelperCombatWorld } from "../mugen/runtime/RuntimeHelperCombatSystem";
import { RuntimeMatchPostFighterWorld, type RuntimeMatchPostFighterActor } from "../mugen/runtime/RuntimeMatchPostFighterSystem";
import type { RuntimeReversalWorld } from "../mugen/runtime/ReversalSystem";
import type { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";

describe("RuntimeMatchPostFighterWorld", () => {
  it("owns combat bridge construction before post-fighter interaction advance", () => {
    const calls: string[] = [];
    const p1 = actor("p1", "Nova", calls);
    const p2 = actor("p2", "Mira", calls);
    const projectile = { serialId: "proj-1" } as RuntimeProjectile;
    const defaultHurtBoxes = [{ x1: -8, y1: -16, x2: 8, y2: 0 }];
    const directCombatWorld = tagged<RuntimeDirectCombatWorld>("direct-world");
    const targetWorld = tagged<RuntimeTargetWorld>("target-world");
    const combatStateHooks = tagged<object>("combat-hooks");
    const helperStateHooks = tagged<object>("helper-hooks");

    new RuntimeMatchPostFighterWorld().advanceRuntime({
      p1,
      p2,
      stage: { bounds: { left: -160, right: 160 } },
      stageTime: 90,
      runtimeTick: 91,
      actorConstraintWorld: {
        separate: (left, right) => calls.push(`separate:${runtimeId(left)}:${runtimeId(right)}`),
        clampToStage: (runtime) => calls.push(`clamp:${runtimeId(runtime)}`),
      } as Pick<RuntimeActorConstraintWorld, "separate" | "clampToStage">,
      effectLifecycleWorld: {
        advanceActive: (fighter, _stage, opponent, options) => {
          calls.push(
            `active:${fighter.id}:${opponent?.id ?? "none"}:${options?.stageTime ?? 0}:${options?.runtimeTick ?? 0}`,
          );
        },
        advancePresentation: (fighter) => calls.push(`presentation:${fighter.id}`),
        markGetHit: (fighter) => calls.push(`mark-gethit:${fighter.id}`),
      } satisfies Pick<RuntimeEffectLifecycleWorld, "advanceActive" | "advancePresentation" | "markGetHit">,
      combatResolutionWorld: {
        resolvePriorityClash: (input) => {
          calls.push(`priority:${input.left.id}:${input.right.id}:${tagOf(input.directCombatWorld)}`);
          return "priority-log";
        },
        resolveEqualPriorityOutcomes: () => 0,
        resolveDirect: (input) => {
          calls.push(`direct:${input.attacker.id}:${input.defender.id}:${input.runtimeTick}:${tagOf(input.stateHooks)}`);
          input.getHurtBoxes?.(input.defender);
          return { kind: "skipped", reason: "missing-move" };
        },
        resolveProjectile: (input) => {
          calls.push(`projectile:${input.attacker.id}:${input.defender.id}:${tagOf(input.effectLifecycleWorld)}`);
          input.rememberProjectileTarget?.(input.attacker, input.defender, projectile);
        },
      } satisfies Pick<RuntimeCombatResolutionWorld, "resolvePriorityClash" | "resolveEqualPriorityOutcomes" | "resolveDirect" | "resolveProjectile">,
      helperCombatWorld: {
        resolveDirect: (input) => {
          calls.push(
            `helper:${input.owner.id}:${input.defender.id}:${tagOf(input.targetWorld)}:${tagOf(input.stateHooks)}:${input.defaultHurtBoxes?.length ?? 0}`,
          );
          input.getHurtBoxes(input.defender);
        },
      } satisfies Pick<RuntimeHelperCombatWorld, "resolveDirect">,
      directCombatWorld,
      hitOverrideWorld: tagged<RuntimeHitOverrideWorld>("hit-override"),
      reversalWorld: tagged<RuntimeReversalWorld>("reversal"),
      guardWorld: tagged<RuntimeGuardWorld>("guard"),
      getHitStateWorld: tagged<RuntimeGetHitStateWorld>("get-hit"),
      hitStateTransitionWorld: tagged<RuntimeHitStateTransitionWorld>("hit-transition"),
      contactPresentationWorld: tagged<RuntimeContactPresentationWorld>("presentation-world"),
      targetWorld,
      getHurtBoxes: (target) => {
        calls.push(`hurt:${target.id}`);
        return defaultHurtBoxes;
      },
      combatStateHooks: combatStateHooks as never,
      helperStateHooks: helperStateHooks as never,
      defaultHurtBoxes,
      rememberProjectileTarget: (source, target, entry) => calls.push(`remember:${source.id}:${target.id}:${entry.serialId}`),
      log: (line) => calls.push(`log:${line}`),
    });

    expect(calls).toEqual([
      "target-memory:p1",
      "target-memory:p2",
      "active:p1:p2:90:91",
      "active:p2:p1:90:91",
      "projectile-clash:p1/Nova:p2/Mira",
      "projectile-cancel:p1:0:77",
      "separate:p1:p2",
      "target-bind:p1:p2",
      "target-bind:p2:p1",
      "bind-to-target:p1:p2",
      "bind-to-target:p2:p1",
      "priority:p1:p2:direct-world",
      "log:priority-log",
      "direct:p1:p2:91:combat-hooks",
      "hurt:p2",
      "direct:p2:p1:91:combat-hooks",
      "hurt:p1",
      "projectile:p1:p2:untagged",
      "remember:p1:p2:proj-1",
      "projectile:p2:p1:untagged",
      "remember:p2:p1:proj-1",
      "helper:p1:p2:target-world:helper-hooks:1",
      "hurt:p2",
      "helper:p2:p1:target-world:helper-hooks:1",
      "hurt:p1",
      "clamp:p1",
      "clamp:p2",
      "presentation:p1",
      "presentation:p2",
    ]);
  });
});

function actor(id: string, label: string, calls: string[]): RuntimeMatchPostFighterActor {
  const runtime = {
    id,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
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

  return {
    id,
    label,
    runtime,
    definition: { constants: {}, source: "native", animations: new Map(), hitSparkLibraries: {} },
    stateElapsed: 0,
    soundEvents: [],
    hitEffectEvents: [],
    contact: {},
    currentInput: [],
    targets: [],
    targetBindings: [],
    moveTick: 0,
    hitStun: 0,
    hitPause: 0,
    hasHit: false,
    contactWorld: {
      markProjectileCancel: (_contact: unknown, stateNo: number, projectileId?: number) =>
        calls.push(`projectile-cancel:${id}:${stateNo}:${projectileId ?? "none"}`),
      markProjectileContact: () => undefined,
      markReceivedDamage: () => undefined,
    },
    targetWorld: {
      advance: (fighter: { id: string }) => calls.push(`target-memory:${fighter.id}`),
      applyTargetBindings: (fighter: { id: string }, candidates: Array<{ id?: string }>) => {
        calls.push(`target-bind:${fighter.id}:${candidates[0]?.id ?? "none"}`);
        return { appliedBindings: 1 };
      },
      applyBindToTarget: (fighter: { id: string }, candidates: Array<{ id?: string }>) => {
        calls.push(`bind-to-target:${fighter.id}:${candidates[0]?.id ?? "none"}`);
        return { appliedBindings: 1 };
      },
      remember: () => undefined,
    },
    effectActorWorld: {
      advanceActiveEffects: () => undefined,
      advancePresentationEffects: () => undefined,
      explodSnapshots: () => [],
      helperSnapshots: () => [],
      projectileSnapshots: () => [],
      removeExplodsOnGetHit: () => undefined,
      resolveProjectileCombat: () => undefined,
      helpers: () => [],
      resolveProjectileClashes: (
        leftOwnerId: string,
        rightOwnerId: string,
        input: {
          leftLabel: string;
          rightLabel: string;
          recordProjectileCancel?: (projectile: unknown) => void;
        },
      ) => {
        calls.push(`projectile-clash:${leftOwnerId}/${input.leftLabel}:${rightOwnerId}/${input.rightLabel}`);
        input.recordProjectileCancel?.({ ownerId: leftOwnerId, projectileId: 77 } as never);
      },
    },
    audioWorld: {},
    hitEffectWorld: {},
  } as unknown as RuntimeMatchPostFighterActor;
}

function tagged<T>(tag: string): T {
  return { tag } as T;
}

function tagOf(value: unknown): string {
  return (value as { tag?: string }).tag ?? "untagged";
}

function runtimeId(value: unknown): string {
  return (value as { id?: string }).id ?? "unknown";
}
