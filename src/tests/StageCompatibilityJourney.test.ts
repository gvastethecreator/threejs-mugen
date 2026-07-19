import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createStageCompatibilityJourney,
  parseStageCompatibilityJourney,
  type StageCompatibilityJourneyInput,
} from "../mugen/compatibility/StageCompatibilityJourney";
import { createStageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";
import { OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST } from "../mugen/compatibility/ExternalStageFixtureManifest";
import { MugenStageLoader } from "../mugen/loader/MugenStageLoader";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";
import type { StageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";

const fixtureRoot = resolve(process.cwd(), OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.directory.relativePath);
const hasOfficialFixture = OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.directory.requiredFiles
  .every((relativePath) => existsSync(resolve(fixtureRoot, relativePath)));
const itWithOfficialFixture = hasOfficialFixture ? it : it.skip;

describe("StageCompatibilityJourney/v1", () => {
  it("aggregates stage evidence, freezes the result, and rejects checksum tampering", () => {
    const result = createStageCompatibilityJourney(input());
    const parsed = parseStageCompatibilityJourney(JSON.parse(JSON.stringify(result)));
    const tampered = parseStageCompatibilityJourney({ ...result, checksum: "00000000" });

    expect(result).toMatchObject({
      schemaVersion: "mugen-web-sandbox/stage-compatibility-journey/v1",
      id: "stage-journey",
      status: "passed",
      package: { license: "CC-BY-NC-3.0" },
      loader: { report: { stage: "Training Room" } },
    });
    expect(result.diagnostics).toEqual([]);
    expect(result.checksum).toMatch(/^[0-9a-f]{8}$/);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.loader.report)).toBe(true);
    expect(parsed.errors).toEqual([]);
    expect(parsed.journey?.checksum).toBe(result.checksum);
    expect(tampered.journey).toBeUndefined();
    expect(tampered.errors).toContain("stage compatibility journey checksum mismatch");
  });

  it("keeps an unrun browser gate partial instead of claiming a complete stage journey", () => {
    const result = createStageCompatibilityJourney({
      ...input(),
      browser: {
        status: "not-run",
        diagnosticsPath: ".scratch/qa/stage-browser-not-run.json",
        viewports: [
          { id: "desktop", status: "not-run", artifacts: [], detail: "stage browser gate deferred" },
          { id: "mobile", status: "not-run", artifacts: [], detail: "stage browser gate deferred" },
        ],
      },
    });

    expect(result.status).toBe("partial");
    expect(result.diagnostics).toContain("browser evidence is not passed");
    expect(result.claims.blocked).toContain("browser stage render proof");
  });

  itWithOfficialFixture("loads the official sample stage through MugenStageLoader and proves round-local background time", async () => {
    const { vfs, packageDigest, readme } = loadOfficialStageVfs();
    const [stagePackage] = await new MugenStageLoader().loadAll("mugen-1.1b1-stage0", vfs);
    if (!stagePackage) throw new Error("official stage fixture did not produce a stage package");

    const report = createStageCompatibilityReport(stagePackage);
    const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, stagePackage.stage, {
      roundTimerFrames: 1,
      roundTiming: { postKoPhase4StartFrames: 1, postKoFrames: 1 },
    });
    const firstRound = runtime.step({ p1: new Set(), p2: new Set() });
    while (runtime.getSnapshot().round?.postRound?.remaining !== 0) {
      runtime.step({ p1: new Set(), p2: new Set() }, { force: true });
    }
    expect(runtime.startNextRound().applied).toBe(true);
    const nextRound = runtime.getSnapshot();

    expect(readme).toContain("Creative Commons");
    expect(readme).toContain("Noncommercial License");
    expect(stagePackage.stage.displayName).toBe(OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.expected.stageDisplayName);
    expect(stagePackage.stage.resetBackgroundBetweenRounds).toBe(OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.expected.resetBackgroundBetweenRounds);
    expect(stagePackage.stage.localCoord).toEqual({ width: 320, height: 240 });
    expect(report).toMatchObject({
      loaded: true,
      files: { def: true, sff: true },
    });
    expect(report.sff.decodedSprites).toBeGreaterThan(0);
    expect(report.backgrounds.total).toBeGreaterThanOrEqual(OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.expected.minimumLayers);
    expect(report.backgrounds.withSpriteRefs).toBeGreaterThan(0);
    expect(report.backgrounds.tiled).toBeGreaterThan(0);
    expect(firstRound.stage.backgroundTick).toBe(1);
    expect(nextRound.stage.backgroundTick).toBe(0);

    const journey = createStageCompatibilityJourney({
      id: "mugen-official-stage0-v1",
      generatedAt: "2026-07-14T00:00:00.000Z",
      package: {
        id: OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.id,
        name: OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.displayName,
        license: OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.source.licenseSpdx,
        licenseFile: `mugen/${OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.source.licensePath}`,
        provenance: OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.source.url,
        entry: `mugen/${OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.directory.definitionPath}`,
        packageDigest,
        files: vfs.listFiles(),
        expectedRoutes: ["stage-loader", "stage-report", "stage-round-reset"],
        licenseVerified: true,
      },
      loader: {
        status: "passed",
        sourceName: "mugen-1.1b1-stage0",
        loaded: true,
        presentFiles: vfs.listFiles(),
        report,
      },
      runtime: {
        status: "passed",
        checks: [
          { id: "stage-loader", status: "passed", detail: "official stage0 DEF/SFF loaded through MugenStageLoader" },
          { id: "stage-round-reset", status: "passed", detail: "resetBG resets backgroundTick at numbered round 2" },
        ],
        artifacts: [{ id: "official-stage0-loader", status: "passed", path: ".scratch/qa/stage-journey/runtime.json", detail: "production loader and round-local stage clock" }],
      },
      browser: {
        status: "not-run",
        diagnosticsPath: ".scratch/qa/stage-journey/browser.json",
        viewports: [
          { id: "desktop", status: "not-run", artifacts: [], detail: "browser stage render gate remains open" },
          { id: "mobile", status: "not-run", artifacts: [], detail: "browser stage render gate remains open" },
        ],
      },
      nativeRegression: {
        status: "not-run",
        tests: { status: "not-run", files: 0, assertions: 0 },
        typecheck: "not-run",
        boundaries: "not-run",
        build: { status: "not-run", warnings: [] },
      },
      claims: {
        allowed: [
          "official noncommercial MUGEN stage0 loads through the production stage loader",
          "stage compatibility report exposes decoded SFF and ordered background evidence",
          "resetBG round-local background clock works in the playable runtime",
        ],
        blocked: ["browser stage render proof", "exact MUGEN/IKEMEN stage parity", "commercial redistribution"],
      },
    });

    expect(journey.status).toBe("partial");
    expect(journey.package.packageDigest).toBe(packageDigest);
  }, 20_000);
});

function input(): StageCompatibilityJourneyInput {
  return {
    id: "stage-journey",
    generatedAt: "2026-07-14T00:00:00.000Z",
    package: {
      id: "stage-fixture",
      name: "Training Room",
      license: "CC-BY-NC-3.0",
      licenseFile: "readme.txt",
      provenance: "Official MUGEN sample content",
      entry: "stages/stage0.def",
      packageDigest: "sha256:stage-fixture",
      files: ["stages/stage0.sff", "stages/stage0.def", "readme.txt"],
      expectedRoutes: ["stage-loader", "stage-report"],
      licenseVerified: true,
    },
    loader: {
      status: "passed",
      sourceName: "stage-fixture",
      loaded: true,
      presentFiles: ["readme.txt", "stages/stage0.def", "stages/stage0.sff"],
      report: createReport(),
    },
    runtime: {
      status: "passed",
      checks: [{ id: "stage-loader", status: "passed", detail: "stage loader" }],
      artifacts: [{ id: "stage", status: "passed", path: "stage.json", detail: "stage runtime" }],
    },
    browser: {
      status: "passed",
      diagnosticsPath: "browser.json",
      viewports: [
        { id: "desktop", status: "passed", artifacts: ["desktop.png"], detail: "desktop" },
        { id: "mobile", status: "passed", artifacts: ["mobile.png"], detail: "mobile" },
      ],
    },
    nativeRegression: {
      status: "passed",
      tests: { status: "passed", files: 1, assertions: 1 },
      typecheck: "passed",
      boundaries: "passed",
      build: { status: "passed", artifact: "dist/index.js", warnings: [] },
    },
    claims: {
      allowed: ["stage loader evidence"],
      blocked: ["browser stage render proof"],
    },
  };
}

function createReport(): StageCompatibilityReport {
  return {
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
        groups: 0,
        total: 0,
        parsed: 0,
        bounded: 0,
        unsupported: 0,
        targetedLayers: 0,
        unsupportedTypes: {},
        items: [],
      },
    },
    sff: { decodedSprites: 2, totalSprites: 2, formats: { RLE8: 2 }, unsupportedFormats: {} },
    unsupported: [],
    warnings: [],
    errors: [],
  };
}

function loadOfficialStageVfs(): { vfs: VirtualFileSystem; packageDigest: string; readme: string } {
  const vfs = new VirtualFileSystem();
  for (const relativePath of OFFICIAL_MUGEN_STAGE_FIXTURE_MANIFEST.directory.requiredFiles) {
    const bytes = readFileSync(resolve(fixtureRoot, relativePath));
    vfs.addFile(`mugen/${relativePath}`, bytes);
  }
  const digest = createHash("sha256");
  for (const path of vfs.listFiles()) {
    digest.update(path);
    digest.update(vfs.readBytes(path)!);
  }
  return {
    vfs,
    packageDigest: `sha256:${digest.digest("hex")}`,
    readme: vfs.readText("mugen/readme.txt") ?? "",
  };
}
