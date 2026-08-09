import { describe, expect, it } from "vitest";
import { buildSandboxControllerCoverageMatrix } from "../mugen/compatibility/ControllerCoverageMatrix";

describe("ControllerCoverageMatrix", () => {
  it("builds supported/unsupported controller rows for Rocco and Nadia", () => {
    const report = buildSandboxControllerCoverageMatrix(process.cwd(), {
      "rocco-vidal": "a".repeat(64),
      "nadia-arce": "b".repeat(64),
    });
    expect(report.schema).toBe("ControllerCoverageMatrix/v1");
    expect(report.denominator).toBeGreaterThan(0);
    expect(report.rows.some((row) => row.controller === "hitdef" && row.supported)).toBe(true);
    expect(report.packageDigests).toEqual({
      "rocco-vidal": "a".repeat(64),
      "nadia-arce": "b".repeat(64),
    });
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  });
});
