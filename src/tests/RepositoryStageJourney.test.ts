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
});
