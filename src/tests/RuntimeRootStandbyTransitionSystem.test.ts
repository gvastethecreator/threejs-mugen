import { describe, expect, it } from "vitest";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";

describe("RuntimeRootStandbyTransitionWorld", () => {
  it("applies a validated batch atomically", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, trainingStage, {
      runtimeProfile: "ikemen-go",
      reserveFighters: [demoFighters[0]!],
    });

    expect(() =>
      runtime.dispatch({
        type: "set-root-standby",
        changes: [
          { id: "p1", standby: true },
          { id: "p9", standby: false },
        ],
      }),
    ).toThrow("Unknown root standby target p9");
    expect(runtime.getSnapshot().actors[0]?.runtime.teamState?.standby).toBe(false);

    const snapshot = runtime.dispatch({
      type: "set-root-standby",
      changes: [
        { id: "p1", standby: true },
        { id: "p3", standby: false },
      ],
    });
    expect(snapshot.actors[0]?.runtime.teamState?.standby).toBe(true);
    expect(snapshot.reserveActors?.[0]?.runtime.teamState?.standby).toBe(false);
  });

  it("rejects transitions outside the explicit IKEMEN profile", () => {
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!);
    expect(() =>
      runtime.dispatch({ type: "set-root-standby", changes: [{ id: "p1", standby: true }] }),
    ).toThrow("require the ikemen-go runtime profile");
  });
});
