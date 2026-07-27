import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(resolve(root, rel), "utf8")) as T;
}

describe("DA30-024 Play browser gate", () => {
  it("records ok journeys with screenshots and zero unexpected errors", () => {
    const report = readJson<{
      ok: boolean;
      id: string;
      journeys: Array<{
        name: string;
        shellFound: boolean;
        canvasOrStageFound: boolean;
        screenshot: string;
        unexpectedConsole: string[];
        hudSignals: { dataMode: string | null };
      }>;
      unexpectedErrors: unknown[];
      packages: { p1: string; p2: string; stage: string };
    }>("docs/evidence/da30/da30-024-play-browser-gate.json");

    expect(report.id).toBe("DA30-024");
    expect(report.ok).toBe(true);
    expect(report.packages).toEqual({ p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" });
    expect(report.journeys.length).toBeGreaterThanOrEqual(2);
    expect(report.unexpectedErrors).toEqual([]);
    for (const j of report.journeys) {
      expect(j.shellFound).toBe(true);
      expect(j.canvasOrStageFound).toBe(true);
      expect(j.hudSignals.dataMode).toBe("match");
      expect(j.unexpectedConsole).toEqual([]);
      expect(existsSync(resolve(root, j.screenshot))).toBe(true);
    }
  });
});

describe("DA30-025 Studio/Inspect browser gate", () => {
  it("records ok Studio and Inspect captures", () => {
    const report = readJson<{
      ok: boolean;
      id: string;
      journeys: Array<{ id: string; shellFound: boolean; modeOk: boolean; screenshot: string }>;
      unexpectedErrors: unknown[];
    }>("docs/evidence/da30/da30-025-studio-inspect-browser-gate.json");

    expect(report.id).toBe("DA30-025");
    expect(report.ok).toBe(true);
    expect(report.unexpectedErrors).toEqual([]);
    expect(report.journeys.some((j) => j.id.includes("studio"))).toBe(true);
    expect(report.journeys.some((j) => j.id.includes("inspect"))).toBe(true);
    for (const j of report.journeys) {
      expect(j.shellFound).toBe(true);
      expect(j.modeOk).toBe(true);
      expect(existsSync(resolve(root, j.screenshot))).toBe(true);
    }
  });
});
