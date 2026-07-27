import { describe, expect, it } from "vitest";
import { runNativeDualLiveExecution } from "../mugen/runtime/NativeDualLiveExecution";

describe("NativeDualLiveExecution", () => {
  it("executes Nova and Mira live routes with real digests and independence", async () => {
    const report = await runNativeDualLiveExecution();
    // Helpful failure surface.
    if (!report.canClaimNativeExecution) {
      expect({
        first: report.first.routes.filter((r) => !r.passed),
        second: report.second.routes.filter((r) => !r.passed),
        diagnostics: report.diagnostics,
        firstPassed: report.first.passed,
        secondPassed: report.second.passed,
        swapped: report.swappedRosterPassed,
      }).toEqual({});
    }
    expect(report.schema).toBe("NativeDualLiveExecution/v1");
    expect(report.canClaimNativeExecution).toBe(true);
    expect(report.independent).toBe(true);
    expect(report.noPerCharacterAdapter).toBe(true);
    expect(report.swappedRosterPassed).toBe(true);
    expect(report.first.packageSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(report.second.packageSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(report.first.packageSha256).not.toBe(report.second.packageSha256);
    expect(report.first.routePassCount).toBe(8);
    expect(report.second.routePassCount).toBe(8);
    expect(report.first.common1Attributed).toBe(true);
    expect(report.second.common1Attributed).toBe(true);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  }, 60_000);
});
