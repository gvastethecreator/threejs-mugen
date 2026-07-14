import { describe, expect, it } from "vitest";
import { createCompatibilityJourney, type CompatibilityJourneyInput } from "../mugen/compatibility/CompatibilityJourney";
import {
  createCompatibilityCorpus,
  parseCompatibilityCorpus,
  type CompatibilityCorpusInput,
} from "../mugen/compatibility/CompatibilityCorpus";
import { createStageCompatibilityJourney, type StageCompatibilityJourneyInput } from "../mugen/compatibility/StageCompatibilityJourney";
import type { StageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";

describe("CompatibilityCorpus/v0", () => {
  it("aggregates journey references without copying package payloads", () => {
    const journey = createCompatibilityJourney(journeyInput("journey-a", "package-a"));
    const corpus = createCompatibilityCorpus({
      generatedAt: "2026-07-14T00:00:00.000Z",
      entries: [
        { id: "optional-codefuman", availability: "optional-private", unavailableReason: "fixture absent" },
        { id: "required-journey", availability: "required-legal", journey, evidenceIds: ["journey-a"] },
      ],
      claims: {
        allowed: ["one required legal package"],
        blocked: ["commercial character breadth"],
      },
    });

    expect(corpus.schemaVersion).toBe("mugen-web-sandbox/compatibility-corpus/v0");
    expect(corpus.status).toBe("passed");
    expect(corpus.summary).toMatchObject({
      entryCount: 2,
      requiredCount: 1,
      optionalCount: 1,
      passedCount: 1,
      unavailableOptionalCount: 1,
      packageIds: ["package-a"],
      routeIds: ["attack", "idle"],
    });
    expect(corpus.entries[0]).toMatchObject({ id: "optional-codefuman", status: "unavailable" });
    expect(corpus.entries[1]).toMatchObject({
      id: "required-journey",
      journeyId: "journey-a",
      package: { id: "package-a" },
    });
    expect(JSON.stringify(corpus)).not.toContain("chars/journey.sff");
    expect(Object.isFrozen(corpus)).toBe(true);
  });

  it("keeps equivalent entry order deterministic and round-trips checksum", () => {
    const journey = createCompatibilityJourney(journeyInput("journey-a", "package-a"));
    const input = corpusInput(journey);
    const first = createCompatibilityCorpus(input);
    const second = createCompatibilityCorpus({ ...input, entries: [...input.entries].reverse() });

    expect(second.checksum).toBe(first.checksum);
    expect(parseCompatibilityCorpus(JSON.parse(JSON.stringify(first))).errors).toEqual([]);
    expect(parseCompatibilityCorpus({ ...first, checksum: "00000000" }).errors).toContain(
      "compatibility corpus checksum mismatch",
    );
    expect(
      parseCompatibilityCorpus({
        ...first,
        entries: first.entries.map((entry) => ({ ...entry, journeySchema: "unknown-journey/v0" })),
      }).errors,
    ).toContain("compatibility corpus result metadata is invalid");
  });

  it("fails closed for missing required journeys and duplicate packages", () => {
    const journey = createCompatibilityJourney(journeyInput("journey-a", "package-a"));
    const missing = createCompatibilityCorpus({
      ...corpusInput(journey),
      entries: [{ id: "required-missing", availability: "required-legal" }],
    });
    expect(missing.status).toBe("failed");
    expect(missing.diagnostics).toContain("required corpus entry has no journey:required-missing");

    const duplicate = createCompatibilityCorpus({
      ...corpusInput(journey),
      entries: [
        { id: "required-a", availability: "required-legal", journey },
        { id: "portable-a", availability: "portable-legal", journey },
      ],
    });
    expect(duplicate.status).toBe("failed");
    expect(duplicate.diagnostics).toContain("duplicate corpus package:package-a");
  });

  it("promotes a passed stage journey as optional-private evidence", () => {
    const characterJourney = createCompatibilityJourney(journeyInput("journey-a", "package-a"));
    const stageJourney = createStageCompatibilityJourney(stageJourneyInput());
    const corpus = createCompatibilityCorpus({
      generatedAt: "2026-07-14T00:00:00.000Z",
      entries: [
        { id: "required-character", availability: "required-legal", journey: characterJourney },
        {
          id: "optional-official-stage",
          availability: "optional-private",
          journey: stageJourney,
          evidenceIds: ["qa:stage", "native:closeout"],
        },
      ],
      claims: {
        allowed: ["character and stage evidence are separately indexed"],
        blocked: ["full MUGEN/IKEMEN stage parity"],
      },
    });

    expect(corpus.status).toBe("passed");
    expect(corpus.summary).toMatchObject({
      entryCount: 2,
      requiredCount: 1,
      optionalCount: 1,
      passedCount: 2,
      packageIds: ["package-a", "stage-package"],
      routeIds: ["attack", "idle", "stage-loader", "stage-render"],
      unsupportedFeatureIds: ["cns:JourneyUnknownController", "stage:BGCtrl.sinx"],
    });
    expect(corpus.entries.find((entry) => entry.id === "optional-official-stage")).toMatchObject({
      journeyId: "stage-journey",
      journeySchema: "mugen-web-sandbox/stage-compatibility-journey/v1",
      availability: "optional-private",
      evidenceIds: expect.arrayContaining(["qa:stage", "native:closeout"]),
      unsupportedFeatures: ["stage:BGCtrl.sinx"],
    });
    expect(JSON.stringify(corpus)).not.toContain("stage0.sff");
  });
});

function corpusInput(journey: ReturnType<typeof createCompatibilityJourney>): CompatibilityCorpusInput {
  return {
    generatedAt: "2026-07-14T00:00:00.000Z",
    entries: [
      { id: "required-journey", availability: "required-legal", journey },
      { id: "optional-codefuman", availability: "optional-private", unavailableReason: "fixture absent" },
    ],
    claims: {
      allowed: ["one required legal package"],
      blocked: ["commercial character breadth"],
    },
  };
}

function journeyInput(id: string, packageId: string): CompatibilityJourneyInput {
  return {
    id,
    generatedAt: "2026-07-14T00:00:00.000Z",
    package: {
      id: packageId,
      name: "Journey Package",
      license: "CC0-1.0",
      licenseFile: "LICENSE.txt",
      provenance: "repository-authored fixture",
      entry: "chars/journey.def",
      packageDigest: `sha256:${packageId}`,
      files: ["chars/journey.sff"],
      expectedRoutes: ["idle", "attack"],
      licenseVerified: true,
    },
    loader: {
      status: "passed",
      sourceName: `${id}.zip`,
      loaded: true,
      presentFiles: ["chars/journey.def"],
      compatibility: {
        loaded: true,
        parsedStates: 2,
        runtimeRoutableStates: 2,
        unsupported: [{ format: "cns", feature: "JourneyUnknownController", severity: "warning", count: 1 }],
        warnings: [],
        errors: [],
      },
    },
    runtime: {
      status: "passed",
      traceQa: { status: "passed", totalArtifacts: 1, requiredArtifacts: 1, passedArtifacts: 1, failedArtifacts: 0, diagnosticsPath: "trace.json" },
      artifacts: [{ id: `${id}-trace`, status: "passed", path: "trace.json", checksum: "trace", detail: "journey" }],
    },
    browser: {
      status: "passed",
      diagnosticsPath: "browser.json",
      viewports: [{ id: "desktop", status: "passed", artifacts: ["desktop.png"], detail: "desktop" }, { id: "mobile", status: "passed", artifacts: ["mobile.png"], detail: "mobile" }],
    },
    nativeRegression: {
      status: "passed",
      tests: { status: "passed", files: 1, assertions: 1 },
      typecheck: "passed",
      boundaries: "passed",
      build: { status: "passed", warnings: [] },
    },
    claims: { allowed: ["bounded journey"], blocked: ["full parity"] },
  };
}

function stageJourneyInput(): StageCompatibilityJourneyInput {
  const report: StageCompatibilityReport = {
    stage: "Training Room",
    loaded: true,
    files: { def: true, sff: true, music: false },
    backgrounds: {
      total: 2,
      withSpriteRefs: 2,
      renderedSprites: 2,
      tiled: 1,
      clipped: 0,
      animated: 0,
      renderedAnimated: 0,
      placeholderFallback: 0,
      layers: [],
      controllers: {
        groups: 1,
        total: 1,
        parsed: 1,
        bounded: 1,
        unsupported: 0,
        targetedLayers: 1,
        unsupportedTypes: {},
        items: [],
      },
    },
    sff: { decodedSprites: 2, totalSprites: 2, formats: { RLE8: 2 }, unsupportedFormats: {} },
    unsupported: [{ format: "stage", feature: "BGCtrl.sinx", severity: "warning", count: 1 }],
    warnings: [],
    errors: [],
  };

  return {
    id: "stage-journey",
    generatedAt: "2026-07-14T00:00:00.000Z",
    package: {
      id: "stage-package",
      name: "Training Room",
      license: "CC-BY-NC-3.0",
      licenseFile: "readme.txt",
      provenance: "https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip",
      entry: "stages/stage0.def",
      packageDigest: "sha256:stage-package",
      files: ["readme.txt", "stages/stage0.def", "stages/stage0.sff"],
      expectedRoutes: ["stage-render", "stage-loader"],
      licenseVerified: true,
    },
    loader: {
      status: "passed",
      sourceName: "mugen-official-stage0",
      loaded: true,
      presentFiles: ["readme.txt", "stages/stage0.def", "stages/stage0.sff"],
      report,
    },
    runtime: {
      status: "passed",
      checks: [{ id: "stage-loader", status: "passed", detail: "official stage loaded" }],
      artifacts: [{ id: "stage-runtime", status: "passed", path: "stage-runtime.json", detail: "stage runtime" }],
    },
    browser: {
      status: "passed",
      diagnosticsPath: ".scratch/qa/official-stage-compatibility-browser/browser-diagnostics.json",
      viewports: [
        { id: "desktop", status: "passed", artifacts: ["desktop.png"], detail: "desktop stage render" },
        { id: "mobile", status: "passed", artifacts: ["mobile.png"], detail: "mobile stage render" },
      ],
    },
    nativeRegression: {
      status: "passed",
      tests: { status: "passed", files: 211, assertions: 2129 },
      typecheck: "passed",
      boundaries: "passed",
      build: { status: "passed", warnings: [] },
    },
    claims: {
      allowed: ["official stage browser and native evidence"],
      blocked: ["full MUGEN/IKEMEN stage parity"],
    },
  };
}
