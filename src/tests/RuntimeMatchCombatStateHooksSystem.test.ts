import { describe, expect, it } from "vitest";
import type { RuntimeCombatResolutionActor } from "../mugen/runtime/RuntimeCombatResolutionSystem";
import type { RuntimeHelperCombatDefender } from "../mugen/runtime/RuntimeHelperCombatSystem";
import { RuntimeMatchCombatStateHooksWorld } from "../mugen/runtime/RuntimeMatchCombatStateHooksSystem";

type TestActor = RuntimeCombatResolutionActor & RuntimeHelperCombatDefender;

describe("RuntimeMatchCombatStateHooksWorld", () => {
  it("builds combat hooks that preserve state-owner availability and entry options", () => {
    const calls: string[] = [];
    const target = actor("target");
    const owner = actor("owner");
    const hooks = new RuntimeMatchCombatStateHooksWorld().create<TestActor>({
      canEnterState: (candidate, stateNo, stateOwner) => {
        calls.push(`can:${candidate.id}:${stateNo}:${stateOwner?.id ?? "self"}`);
        return stateOwner === owner;
      },
      enterState: (candidate, stateNo, options) => {
        calls.push(
          `enter:${candidate.id}:${stateNo}:${options?.stateOwner?.id ?? "self"}:${String(options?.clearStateOwner ?? false)}`,
        );
      },
    });

    expect(hooks.combatStateHooks.canEnterState(target, 888, owner)).toBe(true);
    hooks.combatStateHooks.enterState(target, 888, { stateOwner: owner, clearStateOwner: false });

    expect(calls).toEqual(["can:target:888:owner", "enter:target:888:owner:false"]);
  });

  it("builds helper hooks that use self-owned availability but forward entry options", () => {
    const calls: string[] = [];
    const target = actor("target");
    const owner = actor("owner");
    const hooks = new RuntimeMatchCombatStateHooksWorld().create<TestActor>({
      canEnterState: (candidate, stateNo, stateOwner) => {
        calls.push(`can:${candidate.id}:${stateNo}:${stateOwner?.id ?? "self"}`);
        return stateOwner === undefined;
      },
      enterState: (candidate, stateNo, options) => {
        calls.push(
          `enter:${candidate.id}:${stateNo}:${options?.stateOwner?.id ?? "self"}:${String(options?.clearStateOwner ?? false)}`,
        );
      },
    });

    expect(hooks.helperStateHooks.canEnterState(target, 150)).toBe(true);
    hooks.helperStateHooks.enterState(target, 150, { stateOwner: owner, clearStateOwner: true });

    expect(calls).toEqual(["can:target:150:self", "enter:target:150:owner:true"]);
  });
});

function actor(id: string): TestActor {
  return { id } as TestActor;
}
