import { describe, expect, it } from "vitest";
import { RuntimeControllerEvaluationContextWorld } from "../mugen/runtime/RuntimeControllerEvaluationContextSystem";

describe("RuntimeControllerEvaluationContextWorld", () => {
  it("creates executor context from actor, owner, and tick callbacks", () => {
    const world = new RuntimeControllerEvaluationContextWorld();
    const actor = { id: "p1", hitPause: 7 };
    const owner = { id: "owner", consts: { attack: 125 } };
    const randomActors: unknown[] = [];
    const constReads: unknown[] = [];

    const context = world.create({
      actor,
      owner,
      tick: 42,
      getConst: (stateOwner, name) => {
        constReads.push({ stateOwner, name });
        return stateOwner.consts[name as keyof typeof stateOwner.consts];
      },
      nextRandom: (randomActor) => {
        randomActors.push(randomActor);
        return 0.25;
      },
    });

    expect(context.stageTime).toBe(42);
    expect(context.hitPauseTime?.()).toBe(7);
    expect(context.getConst?.("attack")).toBe(125);
    expect(context.random?.()).toBe(0.25);
    expect(constReads).toEqual([{ stateOwner: owner, name: "attack" }]);
    expect(randomActors).toEqual([actor]);
  });
});
