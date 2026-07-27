import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  findFirstDivergence,
  mutateRecordingAt,
  replayRound,
  simulateRoundFromSeed,
} from "../mugen/da30/RoundRecordReplay";
import { runRewindFeasibilitySpike } from "../mugen/da30/RewindFeasibility";
import { runNestedHelperJourney } from "../mugen/da30/HelperNestedJourney";
import { runThrowCustomStateRoute } from "../mugen/da30/ThrowCustomStateRoute";
import { runCameraStageBoundsCases } from "../mugen/da30/CameraStageBounds";

const dir = resolve(process.cwd(), "docs/evidence/da30");
function persist(name: string, body: unknown) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, name), `${JSON.stringify(body, null, 2)}\n`, "utf8");
}

describe("DA30-039..048 remaining open cuts", () => {
  it("DA30-039 record/replay full round with mutation divergence", () => {
    const { recording } = simulateRoundFromSeed("round-a", 48);
    const replay = replayRound(recording);
    expect(replay.ok).toBe(true);
    expect(replay.frameCount).toBe(48);
    const mutated = mutateRecordingAt(recording, 16);
    const div = findFirstDivergence(recording, mutated);
    expect(div).not.toBeNull();
    expect(div!.tick).toBe(16);
    persist("da30-039-round-record-replay.json", {
      ok: true,
      frameCount: recording.frameCount,
      finalChecksum: recording.finalChecksum,
      periodicEvery: recording.periodicEvery,
      replayOk: replay.ok,
      divergence: div,
      sampleFrame: recording.frames[15],
    });
  });

  it("DA30-040 rewind feasibility three depths", () => {
    const report = runRewindFeasibilitySpike([8, 32, 64]);
    expect(report.ok).toBe(true);
    expect(report.depths).toHaveLength(3);
    expect(report.blocks).toContain("rollback readiness");
    persist("da30-040-rewind-feasibility.json", report);
  });

  it("DA30-045 nested Helper journey", () => {
    const r = runNestedHelperJourney();
    expect(r.ok).toBe(true);
    expect(r.zeroControllerRejected).toBe(true);
    persist("da30-045-helper-journey.json", r);
  });

  it("DA30-047 throw/custom-state atomic route", () => {
    const r = runThrowCustomStateRoute();
    expect(r.ok).toBe(true);
    persist("da30-047-throw-custom-state.json", r);
  });

  it("DA30-048 camera/stage/bounds cases", () => {
    const r = runCameraStageBoundsCases();
    expect(r.ok).toBe(true);
    persist("da30-048-camera-stage-bounds.json", r);
  });
});
