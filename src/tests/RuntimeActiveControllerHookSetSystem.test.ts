import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeActiveControllerHookSetWorld } from "../mugen/runtime/RuntimeActiveControllerHookSetSystem";
import type { RuntimeActiveStateDispatchActor } from "../mugen/runtime/RuntimeActiveStateDispatchSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeActiveControllerHookSetWorld", () => {
  it("groups every active-controller hook route without replacing callbacks", () => {
    const calls: string[] = [];
    const input = {
      resolveNumber: () => {
        calls.push("resolve-number");
        return 7;
      },
      resolveBoolean: () => {
        calls.push("resolve-boolean");
        return true;
      },
      recordController: (_actor: HookActor, controller: MugenStateController) => calls.push(`record:${controller.type}`),
      enterState: (_actor: HookActor, stateId: number) => calls.push(`enter:${stateId}`),
      applyControl: (_actor: HookActor, ctrl: boolean) => calls.push(`ctrl:${ctrl}`),
      changeAction: (_actor: HookActor, actionId: number) => {
        calls.push(`anim:${actionId}`);
        return true;
      },
      hitDef: () => calls.push("hitdef"),
      reversalDef: () => calls.push("reversaldef"),
      width: () => calls.push("width"),
      height: () => calls.push("height"),
      overrideClsn: () => calls.push("overrideclsn"),
      depth: () => calls.push("depth"),
      fallEnvShake: () => calls.push("fallenvshake"),
      spriteEffect: () => calls.push("sprite-effect"),
      effectSpawn: () => calls.push("effect-spawn"),
      target: () => calls.push("target"),
      pause: () => calls.push("pause"),
      sound: () => calls.push("sound"),
      envColor: () => calls.push("envcolor"),
      envShake: () => calls.push("envshake"),
      contact: () => calls.push("contact"),
      runtimeController: () => calls.push("runtime-controller"),
      unsupported: () => calls.push("unsupported"),
    };

    const hookSet = new RuntimeActiveControllerHookSetWorld().create<HookActor>(input);

    expect(hookSet.stateHooks.resolveNumber).toBe(input.resolveNumber);
    expect(hookSet.stateHooks.resolveBoolean).toBe(input.resolveBoolean);
    expect(hookSet.stateHooks.recordController).toBe(input.recordController);
    expect(hookSet.stateHooks.enterState).toBe(input.enterState);
    expect(hookSet.stateHooks.applyControl).toBe(input.applyControl);
    expect(hookSet.stateHooks.changeAction).toBe(input.changeAction);
    expect(hookSet.sideEffectHooks.hitDef).toBe(input.hitDef);
    expect(hookSet.sideEffectHooks.reversalDef).toBe(input.reversalDef);
    expect(hookSet.sideEffectHooks.width).toBe(input.width);
    expect(hookSet.sideEffectHooks.height).toBe(input.height);
    expect(hookSet.sideEffectHooks.overrideClsn).toBe(input.overrideClsn);
    expect(hookSet.sideEffectHooks.depth).toBe(input.depth);
    expect(hookSet.sideEffectHooks.fallEnvShake).toBe(input.fallEnvShake);
    expect(hookSet.sideEffectHooks.spriteEffect).toBe(input.spriteEffect);
    expect(hookSet.sideEffectHooks.effectSpawn).toBe(input.effectSpawn);
    expect(hookSet.sideEffectHooks.target).toBe(input.target);
    expect(hookSet.sideEffectHooks.pause).toBe(input.pause);
    expect(hookSet.sideEffectHooks.sound).toBe(input.sound);
    expect(hookSet.sideEffectHooks.envColor).toBe(input.envColor);
    expect(hookSet.sideEffectHooks.envShake).toBe(input.envShake);
    expect(hookSet.sideEffectHooks.contact).toBe(input.contact);
    expect(hookSet.hooks.runtimeController).toBe(input.runtimeController);
    expect(hookSet.hooks.unsupported).toBe(input.unsupported);

    hookSet.stateHooks.resolveNumber(resolveInput());
    hookSet.stateHooks.resolveBoolean(resolveInput());
    hookSet.stateHooks.recordController(actor(), controller("ChangeState"));
    hookSet.stateHooks.enterState(actor(), 200, {
      clearStateOwner: true,
      preserveAnimationWhenMissing: true,
    });
    hookSet.stateHooks.applyControl(actor(), false);
    hookSet.stateHooks.changeAction(actor(), 210, "self", actor(), {});
    hookSet.sideEffectHooks.hitDef?.(undefined as never);
    hookSet.sideEffectHooks.reversalDef?.(undefined as never);
    hookSet.sideEffectHooks.width?.(undefined as never);
    hookSet.sideEffectHooks.height?.(undefined as never);
    hookSet.sideEffectHooks.overrideClsn?.(undefined as never);
    hookSet.sideEffectHooks.depth?.(undefined as never);
    hookSet.sideEffectHooks.fallEnvShake?.(undefined as never);
    hookSet.sideEffectHooks.spriteEffect?.(undefined as never);
    hookSet.sideEffectHooks.effectSpawn?.(undefined as never);
    hookSet.sideEffectHooks.target?.(undefined as never);
    hookSet.sideEffectHooks.pause?.(undefined as never);
    hookSet.sideEffectHooks.sound?.(undefined as never);
    hookSet.sideEffectHooks.envColor?.(undefined as never);
    hookSet.sideEffectHooks.envShake?.(undefined as never);
    hookSet.sideEffectHooks.contact?.(undefined as never);
    hookSet.hooks.runtimeController?.(undefined as never);
    hookSet.hooks.unsupported?.(undefined as never);

    expect(calls).toEqual([
      "resolve-number",
      "resolve-boolean",
      "record:ChangeState",
      "enter:200",
      "ctrl:false",
      "anim:210",
      "hitdef",
      "reversaldef",
      "width",
      "height",
      "overrideclsn",
      "depth",
      "fallenvshake",
      "sprite-effect",
      "effect-spawn",
      "target",
      "pause",
      "sound",
      "envcolor",
      "envshake",
      "contact",
      "runtime-controller",
      "unsupported",
    ]);
  });

  it("omits unsupported hook when none is supplied", () => {
    const hookSet = new RuntimeActiveControllerHookSetWorld().create<HookActor>({
      resolveNumber: () => undefined,
      resolveBoolean: () => undefined,
      recordController: () => undefined,
      enterState: () => undefined,
      applyControl: () => undefined,
      changeAction: () => false,
      hitDef: () => undefined,
      reversalDef: () => undefined,
      width: () => undefined,
      height: () => undefined,
      overrideClsn: () => undefined,
      depth: () => undefined,
      fallEnvShake: () => undefined,
      spriteEffect: () => undefined,
      effectSpawn: () => undefined,
      target: () => undefined,
      pause: () => undefined,
      sound: () => undefined,
      envColor: () => undefined,
      envShake: () => undefined,
      contact: () => undefined,
      runtimeController: () => undefined,
    });

    expect("unsupported" in hookSet.hooks).toBe(false);
  });
});

type HookActor = RuntimeActiveStateDispatchActor<{ name: string }> & { id: string };

function actor(): HookActor {
  return {
    id: "p1",
    definition: { name: "p1" },
    runtime: runtime(),
  };
}

function resolveInput() {
  const activeActor = actor();
  return {
    actor: activeActor,
    opponent: actor(),
    owner: activeActor,
    tick: 4,
  };
}

function controller(type: string): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params: {},
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function runtime(): CharacterRuntimeState {
  return {
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
}
