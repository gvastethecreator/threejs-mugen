import { describe, expect, it } from "vitest";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeActiveSideEffectDispatchWorld,
  type RuntimeActiveSideEffectDispatchHooks,
  type RuntimeActiveSideEffectRoute,
} from "../mugen/runtime/RuntimeActiveSideEffectDispatchSystem";
import type { StateProgramDispatch, StateProgramSideEffect } from "../mugen/runtime/StateProgramExecutor";

describe("RuntimeActiveSideEffectDispatchWorld", () => {
  it.each([
    ["hitdef", "hitdef", "hitDef"],
    ["reversaldef", "reversaldef", "reversalDef"],
    ["width", "width", "width"],
    ["height", "height", "height"],
    ["overrideclsn", "overrideclsn", "overrideClsn"],
    ["depth", "depth", "depth"],
    ["fallenvshake", "fallenvshake", "fallEnvShake"],
    ["sprpriority", "sprite-effect", "spriteEffect"],
    ["palfx", "sprite-effect", "spriteEffect"],
    ["remappal", "sprite-effect", "spriteEffect"],
    ["afterimage", "sprite-effect", "spriteEffect"],
    ["afterimagetime", "sprite-effect", "spriteEffect"],
    ["trans", "sprite-effect", "spriteEffect"],
    ["angle", "sprite-effect", "spriteEffect"],
    ["explod", "effect-spawn", "effectSpawn"],
    ["removeexplod", "effect-spawn", "effectSpawn"],
    ["modifyexplod", "effect-spawn", "effectSpawn"],
    ["helper", "effect-spawn", "effectSpawn"],
    ["projectile", "effect-spawn", "effectSpawn"],
    ["modifyprojectile", "effect-spawn", "effectSpawn"],
    ["target", "target", "target"],
    ["bindtotarget", "target", "target"],
    ["pause", "pause", "pause"],
    ["sound", "sound", "sound"],
    ["envcolor", "envcolor", "envColor"],
    ["envshake", "envshake", "envShake"],
    ["contact", "contact", "contact"],
  ] satisfies Array<[StateProgramSideEffect, RuntimeActiveSideEffectRoute, string]>)(
    "routes %s active side effects through %s",
    (effect, route, hookName) => {
      const calls: string[] = [];
      const result = new RuntimeActiveSideEffectDispatchWorld().apply({
        dispatch: sideEffectDispatch(effect),
        actor: actor("p1"),
        opponent: actor("p2"),
        owner: actor("owner"),
        tick: 17,
        hooks: routeHooks(calls),
      });

      expect(result).toEqual({ handled: true, effect, route, applied: true, stop: false });
      expect(calls).toEqual([`${hookName}:${effect}:p1:p2:owner:17:${effect}`]);
    },
  );

  it("marks handled side effects as unapplied when the route hook is absent", () => {
    const result = new RuntimeActiveSideEffectDispatchWorld().apply({
      dispatch: sideEffectDispatch("sound"),
      actor: actor("p1"),
      opponent: actor("p2"),
      owner: actor("owner"),
      tick: 1,
      hooks: {},
    });

    expect(result).toEqual({ handled: true, effect: "sound", route: "sound", applied: false, stop: false });
  });

  it("reports Height as applied with only its own hook installed", () => {
    const calls: string[] = [];
    const result = new RuntimeActiveSideEffectDispatchWorld().apply({
      dispatch: sideEffectDispatch("height"),
      actor: actor("p1"),
      opponent: actor("p2"),
      owner: actor("owner"),
      tick: 3,
      hooks: { height: routeHooks(calls).height },
    });

    expect(result).toEqual({ handled: true, effect: "height", route: "height", applied: true, stop: false });
    expect(calls).toEqual(["height:height:p1:p2:owner:3:height"]);
  });

  it("leaves non-side-effect dispatches for the rest of the active controller pipeline", () => {
    const result = new RuntimeActiveSideEffectDispatchWorld().apply({
      dispatch: { kind: "runtime-controller", controller: controllerIr("CtrlSet") },
      actor: actor("p1"),
      opponent: actor("p2"),
      owner: actor("owner"),
      tick: 0,
      hooks: routeHooks([]),
    });

    expect(result).toEqual({ handled: false, stop: false });
  });
});

type Actor = { id: string };

function routeHooks(calls: string[]): RuntimeActiveSideEffectDispatchHooks<Actor> {
  const push = (hook: string) => (input: { effect: StateProgramSideEffect; actor: Actor; opponent: Actor; owner: Actor; tick: number; controller: ControllerIr }) => {
    calls.push(
      `${hook}:${input.effect}:${input.actor.id}:${input.opponent.id}:${input.owner.id}:${input.tick}:${input.controller.type}`,
    );
  };
  return {
    hitDef: push("hitDef"),
    reversalDef: push("reversalDef"),
    width: push("width"),
    height: push("height"),
    overrideClsn: push("overrideClsn"),
    depth: push("depth"),
    fallEnvShake: push("fallEnvShake"),
    spriteEffect: push("spriteEffect"),
    effectSpawn: push("effectSpawn"),
    target: push("target"),
    pause: push("pause"),
    sound: push("sound"),
    envColor: push("envColor"),
    envShake: push("envShake"),
    contact: push("contact"),
  };
}

function sideEffectDispatch(effect: StateProgramSideEffect): Extract<StateProgramDispatch, { kind: "side-effect" }> {
  return {
    kind: "side-effect",
    controller: controllerIr(effect),
    effect,
  };
}

function controllerIr(type: string): ControllerIr {
  return {
    source: controllerSource(type),
    stateId: 200,
    type,
    normalizedType: type.toLowerCase(),
    supportLevel: "partial",
    triggers: [],
    params: {},
    line: 1,
    unsupportedFeatures: [],
  };
}

function controllerSource(type: string): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params: {},
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function actor(id: string): Actor {
  return { id };
}
