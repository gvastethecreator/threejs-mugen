import { describe, expect, it } from "vitest";
import { buildSandboxControllerCoverageMatrix } from "../mugen/compatibility/ControllerCoverageMatrix";

describe("ControllerCoverageMatrix", () => {
  it("builds supported/unsupported controller rows for Nova and Mira", () => {
    const report = buildSandboxControllerCoverageMatrix(process.cwd(), {
      "nova-boxer": "a".repeat(64),
      "mira-volt": "b".repeat(64),
    });
    expect(report.schema).toBe("ControllerCoverageMatrix/v1");
    expect(report.denominator).toBeGreaterThan(0);
    expect(report.rows.some((row) => row.controller === "hitdef" && row.supported)).toBe(true);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
  });
});
