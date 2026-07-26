import { describe, expect, it } from "vitest";
import { runCommonFxFightScreenProof } from "../mugen/runtime/CommonFxFightScreenProof";
import { SANDBOX_FIGHTSCREEN_MANIFEST } from "../mugen/runtime/FightScreenFixture";

describe("CommonFxFightScreenProof", () => {
  it("loads Common.Fx / FightFX libraries and plays FightScreen SND edges", async () => {
    const report = await runCommonFxFightScreenProof();
    expect(report.schema).toBe("CommonFxFightScreenProof/v1");
    expect(report.packageId).toBe(SANDBOX_FIGHTSCREEN_MANIFEST.id);
    expect(report.libraries.commonHas7002).toBe(true);
    expect(report.libraries.fightfxHas7001).toBe(true);
    expect(report.libraries.fightfxHas7002).toBe(true);
    expect(report.audio.available).toBe(true);
    expect(report.audio.unlocked).toBe(true);
    expect(report.audio.played).toBeGreaterThanOrEqual(1);
    expect(report.audibleEdges).toEqual(
      expect.arrayContaining(["fight.snd:7,1", "ko.snd:7,2", "round.default.snd:8,2"]),
    );
    expect(report.passed).toBe(true);
    expect(report.diagnostics).toEqual([]);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  });
});
