import { describe, expect, it } from "vitest";
import {
  RuntimeMatchInteractionWorld,
  selectRuntimeRootTargetMaintenanceActors,
  type RuntimeMatchInteractionRuntimeActor,
} from "../mugen/runtime/MatchInteractionSystem";

describe("RuntimeMatchInteractionWorld", () => {
  it("selects unique valid root target actors while retaining standby and over-KO roots", () => {
    const candidate = (id: string, disabled = false, playerType = true) => ({
      id,
      runtime: { teamState: { disabled, playerType } },
    });
    const p3 = {
      ...candidate("p3"),
      runtime: { teamState: { disabled: false, playerType: true, standby: true, overKo: true } },
    };

    expect(selectRuntimeRootTargetMaintenanceActors([
      candidate("p1"),
      candidate("p2"),
      p3,
      p3,
      candidate("p4", true),
      candidate("p5", false, false),
      candidate("helper-0"),
      candidate("p6"),
    ]).map(({ id }) => id)).toEqual(["p1", "p2", "p3", "p6"]);
  });

  it("maintains an explicit root roster once each with complete exact candidates", () => {
    const calls: string[] = [];
    const actors = ["p1", "p2", "p3", "p4"];

    new RuntimeMatchInteractionWorld().advance({
      p1: "p1",
      p2: "p2",
      targetActors: actors,
      targetResetActors: [...actors, "disabled-p5"],
      hitDefContactActors: actors,
      advanceTargetMemory: (fighter) => calls.push(`age:${fighter}`),
      clearTargetBindingSubject: (fighter) => calls.push(`clear:${fighter}`),
      recordTargetMaintenance: (fighter) => calls.push(`phase:${fighter}`),
      advanceActiveEffects: () => undefined,
      resolveProjectileClashes: () => undefined,
      separateActors: () => undefined,
      applyTargetBindings: (fighter, candidates) => calls.push(`target-bind:${fighter}:${candidates.join(",")}`),
      applyBindToTarget: (fighter, candidates) => calls.push(`self-bind:${fighter}:${candidates.join(",")}`),
      resolvePriorityClash: () => undefined,
      resolveDirectCombat: () => undefined,
      commitHitDefTargets: (fighter) => calls.push(`commit:${fighter}`),
      recordHitDefContactCommit: (fighter) => calls.push(`commit-phase:${fighter}`),
      resolveProjectileCombat: () => undefined,
      clampToStage: () => undefined,
      advancePresentationEffects: () => undefined,
      log: () => undefined,
    });

    expect(calls).toEqual([
      "age:p1", "phase:p1",
      "age:p2", "phase:p2",
      "age:p3", "phase:p3",
      "age:p4", "phase:p4",
      "clear:p1", "clear:p2", "clear:p3", "clear:p4", "clear:disabled-p5",
      "target-bind:p1:p2,p3,p4",
      "target-bind:p2:p1,p3,p4",
      "target-bind:p3:p1,p2,p4",
      "target-bind:p4:p1,p2,p3",
      "self-bind:p1:p2,p3,p4",
      "self-bind:p2:p1,p3,p4",
      "self-bind:p3:p1,p2,p4",
      "self-bind:p4:p1,p2,p3",
      "commit:p1", "commit-phase:p1",
      "commit:p2", "commit-phase:p2",
      "commit:p3", "commit-phase:p3",
      "commit:p4", "commit-phase:p4",
    ]);
  });

  it("owns post-fighter target, effect, combat, clamp, and presentation ordering", () => {
    const world = new RuntimeMatchInteractionWorld();
    const calls: string[] = [];
    const tag = (label: string, fighter?: string, opponent?: string) => {
      calls.push([label, fighter, opponent].filter(Boolean).join(":"));
    };

    world.advance({
      p1: "p1",
      p2: "p2",
      advanceTargetMemory: (fighter) => tag("target-memory", fighter),
      advanceActiveEffects: (fighter) => tag("active-effects", fighter),
      resolveProjectileClashes: (left, right) => tag("projectile-clash", left, right),
      separateActors: (left, right) => tag("separate", left, right),
      applyTargetBindings: (fighter, candidates) => tag("target-bind", fighter, candidates[0]),
      applyBindToTarget: (fighter, candidates) => tag("bind-to-target", fighter, candidates[0]),
      resolvePriorityClash: (left, right) => {
        tag("priority", left, right);
        return "priority resolved";
      },
      resolveDirectCombat: (attacker, defender) => tag("direct-combat", attacker, defender),
      resolveProjectileCombat: (attacker, defender) => tag("projectile-combat", attacker, defender),
      clampToStage: (fighter) => tag("clamp", fighter),
      advancePresentationEffects: (fighter) => tag("presentation", fighter),
      log: (line) => tag("log", line),
    });

    expect(calls).toEqual([
      "target-memory:p1",
      "target-memory:p2",
      "active-effects:p1",
      "active-effects:p2",
      "projectile-clash:p1:p2",
      "separate:p1:p2",
      "target-bind:p1:p2",
      "target-bind:p2:p1",
      "bind-to-target:p1:p2",
      "bind-to-target:p2:p1",
      "priority:p1:p2",
      "log:priority resolved",
      "direct-combat:p1:p2",
      "direct-combat:p2:p1",
      "projectile-combat:p1:p2",
      "projectile-combat:p2:p1",
      "clamp:p1",
      "clamp:p2",
      "presentation:p1",
      "presentation:p2",
    ]);
  });

  it("wires runtime target, effect lifecycle, projectile clash, and constraint systems", () => {
    const world = new RuntimeMatchInteractionWorld();
    const calls: string[] = [];
    const activeLifecycleOptions: Array<{
      actorId: string;
      opponentId?: string;
      opponents: string[];
      stageTime?: number;
      runtimeTick?: number;
    }> = [];
    const tag = (label: string, fighter?: string, opponent?: string) => {
      calls.push([label, fighter, opponent].filter(Boolean).join(":"));
    };

    const p1 = runtimeActor("p1", "Nova", 1, calls);
    const p2 = runtimeActor("p2", "Mira", 2, calls);
    const runtimeLabels = new Map<object, string>([
      [p1.runtime, p1.id],
      [p2.runtime, p2.id],
    ]);
    const runtimeLabel = (runtime: object) => runtimeLabels.get(runtime) ?? "unknown";

    world.advanceRuntime({
      p1,
      p2,
      stage: { bounds: { left: -160, right: 160 } },
      stageTime: 91,
      runtimeTick: 92,
      actorConstraintWorld: {
        separate: (left, right) => tag("separate", runtimeLabel(left), runtimeLabel(right)),
        clampToStage: (runtime) => tag("clamp", runtimeLabel(runtime)),
      },
      advanceBodyPush: () => tag("body-push"),
      inspectHitAdmission: () => tag("hit-admission"),
      effectLifecycleWorld: {
        advanceActive: (fighter, _stage, opponent, options) => {
          tag("active-effects", fighter.id);
          activeLifecycleOptions.push({
            actorId: fighter.id,
            opponentId: opponent?.id,
            opponents: options?.opponents?.map((entry) => entry.id ?? "none") ?? [],
            stageTime: options?.stageTime,
            runtimeTick: options?.runtimeTick,
          });
        },
        advancePresentation: (fighter) => tag("presentation", fighter.id),
      },
      resolvePriorityClash: (left, right) => {
        tag("priority", left.id, right.id);
        return "priority resolved";
      },
      resolveDirectCombat: (attacker, defender) => tag("direct-combat", attacker.id, defender.id),
      resolveProjectileCombat: (attacker, defender) => tag("projectile-combat", attacker.id, defender.id),
      log: (line) => tag("log", line),
    });

    expect(calls).toEqual([
      "target-memory:p1",
      "target-memory:p2",
      "active-effects:p1",
      "active-effects:p2",
      "projectile-clash:p1/Nova:p2/Mira",
      "projectile-cancel:p1:0:77",
      "body-push",
      "target-bind:p1:p2",
      "target-bind:p2:p1",
      "bind-to-target:p1:p2",
      "bind-to-target:p2:p1",
      "hit-admission",
      "priority:p1:p2",
      "log:priority resolved",
      "direct-combat:p1:p2",
      "direct-combat:p2:p1",
      "projectile-combat:p1:p2",
      "projectile-combat:p2:p1",
      "clamp:p1",
      "clamp:p2",
      "presentation:p1",
      "presentation:p2",
    ]);
    expect(activeLifecycleOptions).toEqual([
      { actorId: "p1", opponentId: "p2", opponents: ["p2"], stageTime: 91, runtimeTick: 92 },
      { actorId: "p2", opponentId: "p1", opponents: ["p1"], stageTime: 91, runtimeTick: 92 },
    ]);
  });
});

function runtimeActor(id: string, label: string, x: number, calls: string[]): RuntimeMatchInteractionRuntimeActor {
  const runtime = {
    pos: { x, y: 0 },
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
    targets: [],
    targetBindings: [],
    contact: {},
    contactWorld: {
      markProjectileCancel: (_contact, stateNo, projectileId) => {
        calls.push(`projectile-cancel:${id}:${stateNo}:${projectileId ?? "none"}`);
      },
    },
    targetWorld: {
      advance: (fighter) => calls.push(`target-memory:${fighter.id}`),
      clearBindingSubject: () => undefined,
      applyTargetBindings: (fighter, candidates) => {
        calls.push(`target-bind:${fighter.id}:${candidates[0]?.id ?? "none"}`);
        return { appliedBindings: 1 };
      },
      applyBindToTarget: (fighter, candidates) => {
        calls.push(`bind-to-target:${fighter.id}:${candidates[0]?.id ?? "none"}`);
        return { appliedBindings: 1 };
      },
    },
    effectActorWorld: {
      advanceActiveEffects: () => undefined,
      advancePresentationEffects: () => undefined,
      explodSnapshots: () => [],
      helperSnapshots: () => [],
      projectileSnapshots: () => [],
      removeExplodsOnGetHit: () => undefined,
      resolveProjectileClashes: (leftOwnerId, rightOwnerId, input) => {
        calls.push(`projectile-clash:${leftOwnerId}/${input.leftLabel}:${rightOwnerId}/${input.rightLabel}`);
        input.recordProjectileCancel?.({ ownerId: leftOwnerId, projectileId: 77 } as never);
      },
    },
  } as RuntimeMatchInteractionRuntimeActor;
}
