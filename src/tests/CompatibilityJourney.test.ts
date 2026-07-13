import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { createCompatibilityJourney, parseCompatibilityJourney, type CompatibilityJourneyInput } from "../mugen/compatibility/CompatibilityJourney";
import {
  createMugenLiteJourneyVfs,
  MUGEN_LITE_JOURNEY_MANIFEST,
} from "../mugen/runtime/MugenLiteJourneyFixture";
import {
  createMugenLiteJourneyNoKoSlowTraceArtifact,
  createMugenLiteJourneyPaletteTraceArtifact,
  createMugenLiteJourneyTraceArtifact,
} from "../mugen/runtime/RuntimeTraceGatePresets";

describe("CompatibilityJourney/v1", () => {
  it("aggregates package, loader, trace, browser, and native evidence into an immutable result", () => {
    const result = createCompatibilityJourney(input());

    expect(result).toMatchObject({
      schemaVersion: "mugen-web-sandbox/compatibility-journey/v1",
      id: "legal-journey",
      status: "passed",
      package: { license: "CC0-1.0", packageDigest: "sha256:fixture" },
      runtime: { artifacts: [{ id: "journey", checksum: "trace-checksum" }] },
      browser: { viewports: [{ id: "desktop" }, { id: "mobile" }] },
    });
    expect(result.diagnostics).toEqual([]);
    expect(result.checksum).toMatch(/^[0-9a-f]{8}$/);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.package)).toBe(true);
    expect(Object.isFrozen(result.runtime.artifacts)).toBe(true);
  });

  it("sorts evidence references and produces the same checksum for equivalent input order", () => {
    const first = createCompatibilityJourney(input());
    const second = createCompatibilityJourney({
      ...input(),
      package: { ...input().package, files: [...input().package.files].reverse() },
      runtime: { ...input().runtime, artifacts: [...input().runtime.artifacts].reverse() },
      browser: { ...input().browser, viewports: [...input().browser.viewports].reverse() },
    });

    expect(second.checksum).toBe(first.checksum);
    expect(second.package.files).toEqual(["chars/journey.def", "chars/journey.sff"]);
    expect(second.runtime.artifacts.map((artifact) => artifact.id)).toEqual(["journey"]);
  });

  it("round-trips serialized evidence and rejects a tampered checksum", () => {
    const result = createCompatibilityJourney(input());
    const parsed = parseCompatibilityJourney(JSON.parse(JSON.stringify(result)));
    const tampered = parseCompatibilityJourney({ ...result, checksum: "00000000" });

    expect(parsed.errors).toEqual([]);
    expect(parsed.journey?.checksum).toBe(result.checksum);
    expect(tampered.journey).toBeUndefined();
    expect(tampered.errors).toContain("compatibility journey checksum mismatch");
  });

  it("fails closed when a required component is missing while preserving blocked claims", () => {
    const result = createCompatibilityJourney({
      ...input(),
      package: { ...input().package, licenseVerified: false },
      browser: { ...input().browser, status: "not-run", viewports: [{ ...input().browser.viewports[0]!, status: "not-run" }, { ...input().browser.viewports[1]!, status: "not-run" }] },
    });

    expect(result.status).toBe("failed");
    expect(result.diagnostics).toEqual(expect.arrayContaining(["package license was not verified", "browser evidence is not passed"]));
    expect(result.claims.blocked).toContain("commercial character breadth");

    const partial = createCompatibilityJourney({
      ...input(),
      browser: { ...input().browser, status: "not-run", viewports: [{ ...input().browser.viewports[0]!, status: "not-run" }, { ...input().browser.viewports[1]!, status: "not-run" }] },
    });
    expect(partial.status).toBe("partial");
  });

  it("aggregates the current legal fixture without copying its loader, trace, or browser artifacts", async () => {
    const vfs = createMugenLiteJourneyVfs();
    const character = await new MugenCharacterLoader().load(MUGEN_LITE_JOURNEY_MANIFEST.entry, vfs);
    const [journeyArtifact, noKoSlowArtifact, paletteArtifact] = await Promise.all([
      createMugenLiteJourneyTraceArtifact({ generatedAt: "2026-07-13T00:00:00.000Z" }),
      createMugenLiteJourneyNoKoSlowTraceArtifact({ generatedAt: "2026-07-13T00:00:00.000Z" }),
      createMugenLiteJourneyPaletteTraceArtifact({ generatedAt: "2026-07-13T00:00:00.000Z" }),
    ]);
    const packageDigest = createHash("sha256");
    for (const path of vfs.listFiles()) {
      packageDigest.update(path);
      packageDigest.update(vfs.readBytes(path)!);
    }
    const result = createCompatibilityJourney({
      id: "mugen-lite-journey-v1",
      generatedAt: "2026-07-13T00:00:00.000Z",
      package: {
        id: MUGEN_LITE_JOURNEY_MANIFEST.id,
        name: MUGEN_LITE_JOURNEY_MANIFEST.displayName,
        license: MUGEN_LITE_JOURNEY_MANIFEST.license,
        licenseFile: MUGEN_LITE_JOURNEY_MANIFEST.licenseFile,
        provenance: MUGEN_LITE_JOURNEY_MANIFEST.provenance,
        entry: MUGEN_LITE_JOURNEY_MANIFEST.entry,
        packageDigest: `sha256:${packageDigest.digest("hex")}`,
        files: vfs.listFiles(),
        expectedRoutes: [...MUGEN_LITE_JOURNEY_MANIFEST.expectedRoutes],
        licenseVerified: true,
      },
      loader: {
        status: "passed",
        sourceName: MUGEN_LITE_JOURNEY_MANIFEST.entry,
        loaded: character.compatibility.loaded,
        presentFiles: vfs.listFiles(),
        compatibility: {
          loaded: character.compatibility.loaded,
          parsedStates: character.compatibility.states.parsed,
          runtimeRoutableStates: character.compatibility.states.runtimeRoutable,
          unsupported: character.compatibility.unsupported,
          warnings: character.compatibility.warnings,
          errors: character.compatibility.errors,
        },
      },
      runtime: {
        status: "passed",
        traceQa: {
          status: "passed",
          totalArtifacts: 578,
          requiredArtifacts: 547,
          passedArtifacts: 578,
          failedArtifacts: 0,
          diagnosticsPath: ".scratch/qa/trace-gates/diagnostics.json",
        },
        artifacts: [
          {
            id: "mugen-lite-journey",
            status: journeyArtifact.status,
            path: ".scratch/qa/trace-gates/mugen-lite-journey.json",
            checksum: journeyArtifact.trace.checksum,
            finalChecksum: journeyArtifact.trace.finalChecksum,
            frameCount: journeyArtifact.trace.frameCount,
            detail: "movement, combat, recovery, and final-idle route",
          },
          {
            id: "mugen-lite-journey-nokoslow",
            status: noKoSlowArtifact.status,
            path: ".scratch/qa/trace-gates/mugen-lite-journey-nokoslow.json",
            checksum: noKoSlowArtifact.trace.checksum,
            finalChecksum: noKoSlowArtifact.trace.finalChecksum,
            frameCount: noKoSlowArtifact.trace.frameCount,
            detail: "lethal NoKOSlow post-KO route",
          },
          {
            id: "mugen-lite-journey-palette",
            status: paletteArtifact.status,
            path: ".scratch/qa/trace-gates/mugen-lite-journey-palette.json",
            checksum: paletteArtifact.trace.checksum,
            finalChecksum: paletteArtifact.trace.finalChecksum,
            frameCount: paletteArtifact.trace.frameCount,
            detail: "ACT-backed RemapPal source/destination route",
          },
        ],
      },
      browser: {
        status: "passed",
        diagnosticsPath: ".scratch/qa/qa-smoke/diagnostics.json",
        viewports: [
          { id: "desktop", status: "passed", artifacts: ["mugen-lite-runtime-desktop.png", "mugen-lite-runtime-desktop-nokoslow.png", "mugen-lite-runtime-desktop-palette.png"], detail: "ZIP upload, imported roster, movement/combat/recovery, NoKOSlow, and ACT-backed RemapPal" },
          { id: "mobile", status: "passed", artifacts: ["mugen-lite-runtime-mobile.png", "mugen-lite-runtime-mobile-nokoslow.png", "mugen-lite-runtime-mobile-palette.png"], detail: "independent mobile reload with the same legal route and ACT-backed RemapPal" },
        ],
      },
      nativeRegression: {
        status: "passed",
        tests: { status: "passed", files: 183, assertions: 1953 },
        typecheck: "passed",
        boundaries: "passed",
        build: { status: "passed", artifact: "dist/assets/index-DxsNJoGk.js", warnings: ["large chunk over 500 kB"] },
      },
      claims: {
        allowed: ["repository-owned CC0 package crosses deterministic ZIP, loader, runtime trace, browser, and native regression evidence"],
        blocked: ["commercial character breadth", "exact Common1 timing", "full MUGEN/IKEMEN parity"],
      },
    });

    expect(result.status).toBe("passed");
    expect(result.package.packageDigest).toBe("sha256:b8e917e9b968f86765db017388823e897779d46041b3738a47c702ce57adfc50");
    expect(result.checksum).toBe("11da5411");
    expect(result.runtime.artifacts.map((artifact) => artifact.checksum)).toEqual(["7615fd2b", "ceac9f37", "1291909d"]);
    expect(result.loader.compatibility.unsupported.some((item) => item.feature === "JourneyUnknownController")).toBe(true);
    expect(JSON.stringify(result)).toContain("sha256:");
  }, 15_000);
});

function input(): CompatibilityJourneyInput {
  return {
    id: "legal-journey",
    generatedAt: "2026-07-13T00:00:00.000Z",
    package: {
      id: "mugen-lite-journey",
      name: "MUGEN Lite Journey",
      license: "CC0-1.0",
      licenseFile: "chars/journey/LICENSE.txt",
      provenance: "Repository-authored deterministic fixture",
      entry: "chars/journey/journey.def",
      packageDigest: "sha256:fixture",
      files: ["chars/journey.sff", "chars/journey.def"],
      expectedRoutes: ["idle", "attack"],
      licenseVerified: true,
    },
    loader: {
      status: "passed",
      sourceName: "mugen-lite-journey.zip",
      loaded: true,
      presentFiles: ["chars/journey/journey.def"],
      compatibility: {
        loaded: true,
        parsedStates: 10,
        runtimeRoutableStates: 8,
        unsupported: [],
        warnings: [],
        errors: [],
      },
    },
    runtime: {
      status: "passed",
      traceQa: {
        status: "passed",
        totalArtifacts: 577,
        requiredArtifacts: 546,
        passedArtifacts: 577,
        failedArtifacts: 0,
        diagnosticsPath: ".scratch/qa/trace-gates/diagnostics.json",
      },
      artifacts: [{ id: "journey", status: "passed", path: ".scratch/qa/trace-gates/mugen-lite-journey.json", checksum: "trace-checksum", detail: "runtime journey" }],
    },
    browser: {
      status: "passed",
      diagnosticsPath: ".scratch/qa/qa-smoke/diagnostics.json",
      viewports: [
        { id: "mobile", status: "passed", artifacts: ["mugen-lite-runtime-mobile.png"], detail: "mobile imported sprite" },
        { id: "desktop", status: "passed", artifacts: ["mugen-lite-runtime-desktop.png"], detail: "desktop imported sprite" },
      ],
    },
    nativeRegression: {
      status: "passed",
      tests: { status: "passed", files: 183, assertions: 1953 },
      typecheck: "passed",
      boundaries: "passed",
      build: { status: "passed", artifact: "dist/assets/index.js", warnings: ["large chunk"] },
    },
    claims: {
      allowed: ["repository-owned legal package crosses loader, runtime, and browser evidence"],
      blocked: ["commercial character breadth", "full MUGEN/IKEMEN parity"],
    },
  };
}
