import { describe, expect, it } from "vitest";
import { RuntimeMatchFrameStartWorld } from "../mugen/runtime/RuntimeMatchFrameStartSystem";

describe("RuntimeMatchFrameStartWorld", () => {
  it("owns reset, pre-facing AssertSpecial, and auto-facing order", () => {
    const calls: string[] = [];
    const p1 = actor("p1");
    const p2 = actor("p2");

    new RuntimeMatchFrameStartWorld().advance({
      p1,
      p2,
      resetFrameFlags: (actor) => {
        calls.push(`reset:${actor.id}`);
        actor.frameFlagsReset = true;
      },
      applyPreFacingAssertSpecial: (actor, opponent) => {
        calls.push(`assert:${actor.id}:${opponent.id}:${actor.frameFlagsReset}`);
        actor.assertSpecialApplied = true;
      },
      updateAutoFacing: (actor, opponent) => {
        calls.push(`face:${actor.id}:${opponent.id}:${actor.assertSpecialApplied}`);
      },
    });

    expect(calls).toEqual([
      "reset:p1",
      "reset:p2",
      "assert:p1:p2:true",
      "assert:p2:p1:true",
      "face:p1:p2:true",
      "face:p2:p1:true",
    ]);
  });
});

function actor(id: string): {
  id: string;
  frameFlagsReset: boolean;
  assertSpecialApplied: boolean;
} {
  return {
    id,
    frameFlagsReset: false,
    assertSpecialApplied: false,
  };
}
