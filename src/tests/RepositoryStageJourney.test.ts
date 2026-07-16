import { describe, expect, it } from "vitest";
import { parseStageCompatibilityJourney } from "../mugen/compatibility/StageCompatibilityJourney";
import { createRepositoryStageJourney } from "../mugen/runtime/RepositoryStageJourney";

describe("repository-authored Skyline Relay stage journey", () => {
  it("materializes loader and runtime evidence while keeping browser/native claims open", async () => {
    const result = await createRepositoryStageJourney({ generatedAt: "2026-07-16T16:00:00.000Z" });

    expect(result.journey.status).toBe("partial");
    expect(result.journey.package).toMatchObject({
      id: "repository-skyline-relay",
      license: "CC0-1.0",
      packageDigest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
    });
    expect(result.journey.loader.report).toMatchObject({
      loaded: true,
      files: { def: true, sff: true, music: false },
      backgrounds: { animated: 1, tiled: 1, renderedAnimated: 1 },
    });
    expect(result.journey.runtime).toMatchObject({
      status: "passed",
      checks: expect.arrayContaining([
        expect.objectContaining({ id: "stage-depth", status: "passed" }),
        expect.objectContaining({ id: "stage-bgctrl", status: "passed" }),
        expect.objectContaining({ id: "stage-round-reset", status: "passed" }),
      ]),
    });
    expect(result.journey.browser.status).toBe("not-run");
    expect(result.journey.nativeRegression.status).toBe("not-run");
    expect(result.journey.claims.blocked).toContain("browser stage render proof");

    const parsed = parseStageCompatibilityJourney(JSON.parse(JSON.stringify(result.journey)));
    expect(parsed.errors).toEqual([]);
    expect(parsed.journey?.checksum).toBe(result.journey.checksum);
  });

  it("promotes browser and native evidence only when both are explicitly supplied", async () => {
    const result = await createRepositoryStageJourney({
      generatedAt: "2026-07-16T16:00:00.000Z",
      browserEvidence: {
        status: "passed",
        diagnosticsPath: ".scratch/qa/repository-skyline-relay-browser/browser-diagnostics.json",
        viewports: [
          { id: "desktop", status: "passed", artifacts: ["desktop.png"], detail: "desktop" },
          { id: "mobile", status: "passed", artifacts: ["mobile.png"], detail: "mobile" },
        ],
      },
      nativeRegression: {
        status: "passed",
        reportPath: "docs/evidence/repository-stage-native-regression-v1.json",
        tests: { status: "passed", files: 4, assertions: 8 },
        typecheck: "passed",
        boundaries: "passed",
        build: { status: "passed", warnings: ["large chunk over 500 kB"] },
      },
    });

    expect(result.journey.status).toBe("passed");
    expect(result.journey.claims.allowed).toEqual(expect.arrayContaining([
      "browser ZIP/folder import and Stage Studio render evidence pass",
      "repository stage native regression batch passes",
    ]));
    expect(result.journey.claims.blocked).not.toEqual(expect.arrayContaining([
      "browser stage render proof",
      "native regression proof",
    ]));
  });
});
