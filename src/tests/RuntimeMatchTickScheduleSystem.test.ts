import { describe, expect, it } from "vitest";
import {
  createIdleMatchTickSchedule,
  MATCH_TICK_SCHEDULE_SCHEMA,
  RuntimeMatchTickScheduleRecorder,
} from "../mugen/runtime/RuntimeMatchTickScheduleSystem";

describe("RuntimeMatchTickScheduleSystem", () => {
  it("creates an owner-complete idle diagnostic contract", () => {
    expect(createIdleMatchTickSchedule(12)).toMatchObject({
      schema: MATCH_TICK_SCHEDULE_SCHEMA,
      tick: 12,
      branch: "idle",
      phases: [],
      snapshotPhases: [
        {
          id: "snapshot:presentation",
          owner: "RuntimeMatchPresentationSnapshotWorld",
          mutableStores: [],
          sideEffects: ["presentation actors and effects projected"],
        },
        {
          id: "snapshot:materialize",
          owner: "RuntimeSnapshotWorld",
          mutableStores: [],
          sideEffects: ["immutable external snapshot materialized"],
        },
      ],
      observationScope: "last-executed-tick-observed-phases",
      architectureComparison: { reference: "roadmap-target", status: "not-applicable", checks: [] },
      behaviorChecksumProjection: "excluded",
    });
  });

  it("records phase order with stable owners and returns isolated schedules", () => {
    const recorder = new RuntimeMatchTickScheduleRecorder(4);
    recorder.record("tick:stamp-input");
    recorder.record("frame:start");

    const first = recorder.complete("active");
    first.phases[0]!.owner = "mutated";
    first.snapshotPhases[0]!.owner = "mutated";

    expect(recorder.complete("active")).toMatchObject({
      tick: 4,
      branch: "active",
      phases: [
        { id: "tick:stamp-input", owner: "RuntimeMatchTickInputWorld" },
        { id: "frame:start", owner: "RuntimeMatchFrameStartWorld" },
      ],
      snapshotPhases: [
        { id: "snapshot:presentation", owner: "RuntimeMatchPresentationSnapshotWorld" },
        { id: "snapshot:materialize", owner: "RuntimeSnapshotWorld" },
      ],
    });
  });

  it("reports the current controller and combat ordering as known architecture divergences", () => {
    const recorder = new RuntimeMatchTickScheduleRecorder(9);
    recorder.record("fighter:kinematics", "p1");
    recorder.record("fighter:animation", "p1");
    recorder.record("fighter:controllers", "p1");
    recorder.record("post-fighter:combat");

    const schedule = recorder.complete("active");
    expect(schedule.architectureComparison).toEqual({
      reference: "roadmap-target",
      status: "known-divergence",
      checks: [
        {
          id: "controllers-before-kinematics",
          expectedBefore: "fighter:controllers",
          expectedAfter: "fighter:kinematics",
          actualBefore: "fighter:kinematics",
          actualAfter: "fighter:controllers",
          matches: false,
        },
        {
          id: "combat-before-animation",
          expectedBefore: "post-fighter:combat",
          expectedAfter: "fighter:animation",
          actualBefore: "fighter:animation",
          actualAfter: "post-fighter:combat",
          matches: false,
        },
      ],
    });
    expect(schedule.phases.every((phase) => phase.owner && Array.isArray(phase.mutableStores) && phase.sideEffects.length)).toBe(true);
  });
});
