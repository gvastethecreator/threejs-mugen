import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildSmokeOwnership,
  classifySmokeFailure,
  parseSmokeFailureBody,
} from "../mugen/da32/SmokeOwnership";
import {
  defaultDeviceLabProtocol,
  deviceLabFullClaimAllowed,
  runVirtualGamepadSequence,
} from "../mugen/da32/GamepadDeviceLab";
import { buildClauseAdjudicationSample } from "../mugen/da32/ClauseAdjudicationSample";
import { buildA11yBaseline } from "../mugen/da32/A11yBaseline";

const root = process.cwd();

describe("DA32-001 smoke ownership", () => {
  it("classifies known failure families", () => {
    expect(classifySmokeFailure("runtime-desktop: native hit spark renderer did not expose an active spark after KeyA")).toBe(
      "runtime-native",
    );
    expect(classifySmokeFailure("mugen-lite visual desktop: ZIP load failed")).toBe("mugen-lite-visual");
    expect(classifySmokeFailure("studio-build: Build surface did not render")).toBe("studio-build");
    expect(classifySmokeFailure("studio-evidence: Evidence surface did not render")).toBe("studio-evidence");
  });

  it("builds ownership ledger from failure list", () => {
    const failures = [
      "runtime-desktop: native hit spark",
      "runtime-mobile: native hit spark",
      "mugen-lite visual desktop: zip",
      "studio-build: missing",
    ];
    const own = buildSmokeOwnership(failures);
    expect(own.ok).toBe(false);
    expect(own.failureCount).toBe(4);
    expect(own.laneSummary["runtime-native"]).toBe(2);
    expect(own.laneSummary["mugen-lite-visual"]).toBe(1);
    expect(own.claimCeiling).toMatch(/ownership/i);
  });

  it("parses smoke stderr body lines", () => {
    const sample = `Error: QA smoke failed:\nruntime-desktop: spark\nmugen-lite visual mobile: zip\n    at assertSmoke`;
    const lines = parseSmokeFailureBody(sample);
    expect(lines).toContain("runtime-desktop: spark");
    expect(lines.some((l) => l.startsWith("at "))).toBe(false);
  });

  it("loads formal smoke stderr fixture when present", () => {
    const p = resolve(root, "docs/evidence/da31/formal-logs/da31-008-qa-smoke.stderr.txt");
    if (!existsSync(p)) return;
    const text = readFileSync(p, "utf8");
    const lines = parseSmokeFailureBody(text);
    expect(lines.length).toBeGreaterThan(10);
    const own = buildSmokeOwnership(lines);
    expect(own.lanes.length).toBeGreaterThan(3);
  });
});

describe("DA32-009/010 gamepad device lab", () => {
  it("requires hardware for full claim", () => {
    const protocol = defaultDeviceLabProtocol();
    expect(protocol.cases.length).toBe(11);
    expect(deviceLabFullClaimAllowed(protocol)).toBe(false);
    const withHw = defaultDeviceLabProtocol({
      hardwareResults: Object.fromEntries(protocol.cases.map((c) => [c.id, true])) as never,
    });
    expect(deviceLabFullClaimAllowed(withHw)).toBe(true);
    const virt = runVirtualGamepadSequence();
    expect(virt.events.length).toBeGreaterThanOrEqual(6);
    expect(virt.claimCeiling).toMatch(/virtual|not physical/i);
  });
});

describe("DA32-013 clause adjudication sample", () => {
  it("advances consecutive pass prefix only to DA30-021", () => {
    const report = buildClauseAdjudicationSample("DA30-020");
    expect(report.consecutivePassThrough).toBe("DA30-021");
    expect(report.proposedAdjudicatedThrough).toBe("DA30-021");
    expect(report.advanced).toBe(true);
    expect(report.rows.find((r) => r.taskId === "DA30-022")?.verdict).toBe("partial");
    // Does not jump to 024 despite later passes
    expect(report.proposedAdjudicatedThrough).not.toBe("DA30-024");
  });

  it("holds watermark when prior already at consecutive tip", () => {
    const report = buildClauseAdjudicationSample("DA30-021");
    expect(report.advanced).toBe(false);
    expect(report.proposedAdjudicatedThrough).toBe("DA30-021");
  });
});

describe("DA32-029 a11y baseline", () => {
  it("lists measured and open items without cert claim", () => {
    const report = buildA11yBaseline();
    expect(report.items.length).toBeGreaterThanOrEqual(6);
    expect(report.openCount).toBeGreaterThan(0);
    expect(report.items.some((i) => i.id === "canvas-alternative" && i.status === "open")).toBe(true);
    expect(report.claimCeiling).toMatch(/not WCAG/i);
  });
});
