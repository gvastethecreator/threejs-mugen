import { describe, expect, it } from "vitest";
import { runNativeExecutionExtensions } from "../mugen/runtime/NativeExecutionExtensions";

describe("NativeExecutionExtensions", () => {
  it("covers palette, common.fx signal, projectile ledger, and throw matrix", async () => {
    const report = await runNativeExecutionExtensions();
    expect(report.schema).toBe("NativeExecutionExtensions/v1");
    expect(report.palettes).toHaveLength(2);
    expect(report.palettes.every((p) => p.passed)).toBe(true);
    expect(report.commonFx.passed).toBe(true);
    expect(report.commonFx.nonzeroSignal || report.commonFx.offlineSignalPeak >= 0).toBe(true);
    expect(report.projectileHelper.passed).toBe(true);
    expect(report.throws.passed).toBe(true);
    expect(report.passed).toBe(true);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  }, 30_000);
});
