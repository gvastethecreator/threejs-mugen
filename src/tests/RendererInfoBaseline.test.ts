/** @vitest-environment jsdom */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RENDERER_INFO_PRODUCT_ROUTES,
  buildRendererInfoBaseline,
  metricsFromRendererDiagnostics,
  subtractMetrics,
  validateRendererInfoBaseline,
  type RendererInfoMetrics,
} from "../game/render/RendererInfoBaseline";
import { readFileSync } from "node:fs";

describe("RendererInfoBaseline (DA29-072)", () => {
  it("extracts renderer.info fields from ThreeMugenRenderer diagnostics shape", () => {
    const metrics = metricsFromRendererDiagnostics({
      render: { calls: 12, triangles: 340, points: 0, lines: 4 },
      memory: { geometries: 8, textures: 5 },
      programs: 3,
    });
    expect(metrics).toEqual({
      calls: 12,
      triangles: 340,
      points: 0,
      lines: 4,
      geometries: 8,
      textures: 5,
      programs: 3,
    });
  });

  it("builds and validates a multi-route baseline structure (unit shape only)", () => {
    // Shape test only — synthetic seeds must NOT close DA29-072 (requires liveRenderer).
    const metric = (seed: number): RendererInfoMetrics => ({
      calls: seed,
      triangles: seed * 10,
      points: seed * 2,
      lines: seed,
      geometries: seed + 1,
      textures: seed + 2,
      programs: seed + 3,
    });
    const measured = Object.fromEntries(
      RENDERER_INFO_PRODUCT_ROUTES.map((route, index) => {
        const before = metric(index + 1);
        const after = metric(index + 5);
        const afterCleanup = metric(index + 2);
        return [route, { before, after, afterCleanup }];
      }),
    ) as Parameters<typeof buildRendererInfoBaseline>[0];

    const report = buildRendererInfoBaseline(measured);
    expect(validateRendererInfoBaseline(report)).toEqual([]);
    const play = report.samples.find((s) => s.route === "play");
    expect(play!.deltaRender).toEqual(subtractMetrics(play!.after, play!.before));

    const rendererSource = readFileSync(resolve(process.cwd(), "src/game/render/ThreeMugenRenderer.ts"), "utf8");
    expect(rendererSource).toContain("this.renderer.info.render.calls");
    expect(rendererSource).toContain("this.renderer.info.memory.geometries");

    // Do NOT overwrite docs/evidence/da29/measured/DA29-072.json here.
    // Live evidence is produced only by scripts/qa_da29_072_renderer_info.cjs (liveRenderer=true).
    // Unit shape validation stops at pure functions above.
    expect(report.samples).toHaveLength(5);
    expect(report.routes).toEqual([...RENDERER_INFO_PRODUCT_ROUTES]);
  });
});
