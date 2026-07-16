import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createCompatibilityCorpus } from "../mugen/compatibility/CompatibilityCorpus";
import { createCompatibilityJourney, type CompatibilityJourneyInput } from "../mugen/compatibility/CompatibilityJourney";
import {
  parseCompatibilityCorpusSnapshot,
  materializeCompatibilityCorpusSnapshot,
  verifyCompatibilityCorpusSnapshotArtifacts,
  type CompatibilityCorpusSnapshotMaterializerInput,
} from "../mugen/compatibility/CompatibilityCorpusSnapshot";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { parseStageCompatibilityJourney } from "../mugen/compatibility/StageCompatibilityJourney";
import {
  createMugenLiteJourneyNoKoSlowTraceArtifact,
  createMugenLiteJourneyPaletteTraceArtifact,
  createMugenLiteJourneyTraceArtifact,
} from "../mugen/runtime/RuntimeTraceGatePresets";
import { createMugenLiteJourneyVfs, MUGEN_LITE_JOURNEY_MANIFEST } from "../mugen/runtime/MugenLiteJourneyFixture";

describe("CompatibilityCorpusSnapshot materializer", () => {
  it("rebuilds a stable snapshot from corpus entries and an artifact catalog", () => {
    const journey = createCompatibilityJourney(journeyInput());
    const corpus = createCompatibilityCorpus({
      generatedAt: "2026-07-16T09:00:00.000Z",
      entries: [
        { id: "required-journey", availability: "required-legal", journey },
        { id: "optional-private", availability: "optional-private", unavailableReason: "fixture absent" },
      ],
      claims: {
        allowed: ["bounded repository-owned evidence"],
        blocked: ["broad package compatibility"],
      },
    });
    const first = materialize(snapshotInput(corpus, "2026-07-16T10:00:00.000Z"));
    const second = materialize(snapshotInput({ ...corpus, generatedAt: "2026-07-16T11:00:00.000Z" }, "2026-07-16T11:00:00.000Z"));

    expect(first.status).toBe("passed");
    expect(first.semanticDigest).toBe(second.semanticDigest);
    expect(first.checksum).not.toBe(second.checksum);
    expect(first.summary).toMatchObject({ entryCount: 2, requiredCount: 1, optionalCount: 1, artifactCount: 3 });
    expect(first.entries.find((entry) => entry.id === "required-journey")).toMatchObject({
      journey: { id: "journey-a" },
      package: { provenance: "repository-authored fixture", entry: "chars/journey.def" },
      artifactRefs: expect.arrayContaining([
        expect.objectContaining({ id: "trace-a", checksum: "trace" }),
        expect.objectContaining({ id: "browser:journey-a", path: "browser.json" }),
      ]),
    });
  });

  it("makes missing required artifact records visible and fails closed", () => {
    const journey = createCompatibilityJourney(journeyInput());
    const corpus = createCompatibilityCorpus({
      generatedAt: "2026-07-16T09:00:00.000Z",
      entries: [{ id: "required-journey", availability: "required-legal", journey }],
      claims: { allowed: ["bounded"], blocked: ["parity"] },
    });
    const input = snapshotInput(corpus, "2026-07-16T10:00:00.000Z");
    delete (input.artifactCatalog as Record<string, unknown>)["native:journey-a"];
    const snapshot = materialize(input);

    expect(snapshot.status).toBe("failed");
    expect(snapshot.diagnostics).toEqual(expect.arrayContaining([
      "required snapshot artifact is not passed:required-journey",
      "freshness artifact is not passed:native:journey-a",
    ]));
  });

  it("fails closed for stale, unexpected-revision, missing-file, and tampered artifacts", () => {
    const journey = createCompatibilityJourney(journeyInput());
    const corpus = createCompatibilityCorpus({
      generatedAt: "2026-07-16T09:00:00.000Z",
      entries: [{ id: "required-journey", availability: "required-legal", journey }],
      claims: { allowed: ["bounded"], blocked: ["parity"] },
    });
    const base = snapshotInput(corpus, "2026-07-16T10:00:00.000Z");
    const verified = materialize(base);
    expect(verifyCompatibilityCorpusSnapshotArtifacts(verified, base.artifactProbe)).toEqual([]);
    expect(verifyCompatibilityCorpusSnapshotArtifacts(verified, () => ({
      exists: true,
      contentDigest: `sha256:${"c".repeat(64)}`,
    }))).toContain("snapshot artifact content digest mismatch:browser:journey-a");

    const stale = materialize({
      ...base,
      observedAt: "2026-07-14T10:00:00.000Z",
      referenceAt: "2026-07-16T10:00:00.000Z",
    });
    expect(stale.diagnostics).toContain("compatibility corpus snapshot exceeds freshness max age");

    const unexpectedRevision = materialize({
      ...base,
      freshness: { ...base.freshness, expectedSourceRevision: "other-revision" },
    });
    expect(unexpectedRevision.diagnostics).toContain("snapshot source revision does not match expected revision");

    const missingFile = materialize({
      ...base,
      artifactProbe: (path) => path === "trace.json"
        ? { exists: false }
        : { exists: true, contentDigest: TEST_CONTENT_DIGEST },
    });
    expect(missingFile.diagnostics).toContain("freshness artifact is not passed:trace-a");

    const tampered = materialize({
      ...base,
      artifactCatalog: {
        ...base.artifactCatalog,
        "trace-a": {
          ...base.artifactCatalog["trace-a"]!,
          contentDigest: `sha256:${"b".repeat(64)}`,
        },
      },
    });
    expect(tampered.diagnostics).toContain("freshness artifact is not passed:trace-a");
    expect(tampered.entries[0]?.artifactRefs.find((artifact) => artifact.id === "trace-a")).toMatchObject({
      status: "failed",
      detail: "artifact content digest mismatch",
    });
  });

  it("materializes tracked repository snapshot from the legal journey artifacts", async () => {
    const snapshot = await createRepositorySnapshot();
    const outputPath = resolve(process.cwd(), "docs/evidence/compatibility-corpus-snapshot-v1.json");

    if (process.env.WRITE_COMPATIBILITY_CORPUS_SNAPSHOT === "1") {
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    }
    if (process.env.WRITE_COMPATIBILITY_CORPUS_SNAPSHOT === "1" && existsSync(outputPath)) {
      const parsed = parseCompatibilityCorpusSnapshot(JSON.parse(readFileSync(outputPath, "utf8")));
      expect(parsed.errors).toEqual([]);
      expect(parsed.snapshot?.semanticDigest).toBe(snapshot.semanticDigest);
    }

    expect(snapshot).toMatchObject({
      snapshotId: "compatibility-corpus-v1.1",
      status: "passed",
      summary: {
        entryCount: process.env.WRITE_COMPATIBILITY_CORPUS_SNAPSHOT === "1" ? 3 : 2,
        requiredCount: process.env.WRITE_COMPATIBILITY_CORPUS_SNAPSHOT === "1" ? 2 : 1,
        optionalCount: 1,
      },
    });
  }, 30_000);
});

async function createRepositorySnapshot() {
  const vfs = createMugenLiteJourneyVfs();
  const character = await new MugenCharacterLoader().load(MUGEN_LITE_JOURNEY_MANIFEST.entry, vfs);
  const [journeyArtifact, noKoSlowArtifact, paletteArtifact] = await Promise.all([
    createMugenLiteJourneyTraceArtifact({ generatedAt: "2026-07-16T00:00:00.000Z" }),
    createMugenLiteJourneyNoKoSlowTraceArtifact({ generatedAt: "2026-07-16T00:00:00.000Z" }),
    createMugenLiteJourneyPaletteTraceArtifact({ generatedAt: "2026-07-16T00:00:00.000Z" }),
  ]);
  const sourceRevision = process.env.COMPATIBILITY_SOURCE_REVISION ?? "repository-test-revision";
  const referenceAt = process.env.COMPATIBILITY_REFERENCE_AT ?? "2026-07-16T00:30:00.000Z";
  const observedAt = process.env.COMPATIBILITY_OBSERVED_AT ?? referenceAt;
  const stageJourney = await readMaterializedStageJourney();
  const packageDigest = createHash("sha256");
  for (const path of vfs.listFiles()) {
    packageDigest.update(path);
    packageDigest.update(vfs.readBytes(path)!);
  }
  const journey = createCompatibilityJourney({
    id: "mugen-lite-journey-v1",
    generatedAt: "2026-07-16T00:00:00.000Z",
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
        totalArtifacts: 633,
        requiredArtifacts: 599,
        passedArtifacts: 633,
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
        { id: "desktop", status: "passed", artifacts: ["mugen-lite-runtime-desktop.png", "mugen-lite-runtime-desktop-nokoslow.png", "mugen-lite-runtime-desktop-palette.png"], detail: "legal imported desktop journey" },
        { id: "mobile", status: "passed", artifacts: ["mugen-lite-runtime-mobile.png", "mugen-lite-runtime-mobile-nokoslow.png", "mugen-lite-runtime-mobile-palette.png"], detail: "legal imported mobile journey" },
      ],
    },
    nativeRegression: {
      status: "passed",
      tests: { status: "passed", files: 213, assertions: 2149 },
      typecheck: "passed",
      boundaries: "passed",
      build: { status: "passed", artifact: "dist/assets/index.js", warnings: ["large chunk over 500 kB"] },
    },
    claims: {
      allowed: ["repository-owned CC0 package crosses package, loader, runtime, browser, and native evidence"],
      blocked: ["independent legal package breadth", "exact Common1 timing", "full MUGEN/IKEMEN parity"],
    },
  });
  const corpus = createCompatibilityCorpus({
    generatedAt: "2026-07-16T00:00:00.000Z",
    entries: [
      { id: "mugen-lite-journey", availability: "required-legal", journey },
      ...(stageJourney ? [{ id: "repository-skyline-relay", availability: "required-legal" as const, journey: stageJourney }] : []),
      { id: "official-training-room", availability: "optional-private", unavailableReason: "stage journey machine record requires a fresh external-fixture materialization" },
    ],
    claims: {
      allowed: ["one repository-owned legal journey is materialized with exact evidence references"],
      blocked: ["independent legal package breadth", "commercial redistribution", "full MUGEN/IKEMEN parity"],
    },
  });
  const artifactCatalog = {
    "mugen-lite-journey": { id: "mugen-lite-journey", status: journeyArtifact.status, path: ".scratch/qa/trace-gates/mugen-lite-journey.json", checksum: journeyArtifact.trace.checksum, finalChecksum: journeyArtifact.trace.finalChecksum, detail: "runtime trace" },
    "mugen-lite-journey-nokoslow": { id: "mugen-lite-journey-nokoslow", status: noKoSlowArtifact.status, path: ".scratch/qa/trace-gates/mugen-lite-journey-nokoslow.json", checksum: noKoSlowArtifact.trace.checksum, finalChecksum: noKoSlowArtifact.trace.finalChecksum, detail: "NoKOSlow trace" },
    "mugen-lite-journey-palette": { id: "mugen-lite-journey-palette", status: paletteArtifact.status, path: ".scratch/qa/trace-gates/mugen-lite-journey-palette.json", checksum: paletteArtifact.trace.checksum, finalChecksum: paletteArtifact.trace.finalChecksum, detail: "RemapPal trace" },
    "browser:mugen-lite-journey-v1": { id: "browser:mugen-lite-journey-v1", status: "passed" as const, path: ".scratch/qa/qa-smoke/diagnostics.json", detail: "desktop/mobile browser diagnostics" },
    "native:mugen-lite-journey-v1": { id: "native:mugen-lite-journey-v1", status: "passed" as const, path: "docs/reports/2026-07-13-compatibility-journey-v1.md", detail: "native regression report" },
    ...(stageJourney ? stageArtifactCatalog(stageJourney) : {}),
  };
  return materializeCompatibilityCorpusSnapshot({
    corpus,
    observedAt,
    referenceAt,
    source: {
      corpusSchema: "mugen-web-sandbox/compatibility-corpus/v0",
      sourceRevision,
      tool: { id: "compatibility-snapshot-materializer", version: "1.1.0" },
      ruleset: { id: "mugen-compatibility", version: "v1" },
    },
    freshness: {
      policy: "rebuild-and-verify",
      maxAgeHours: 24,
      expectedSourceRevision: sourceRevision,
      requiredArtifactIds: [
        "mugen-lite-journey",
        "mugen-lite-journey-nokoslow",
        "mugen-lite-journey-palette",
        "browser:mugen-lite-journey-v1",
        "native:mugen-lite-journey-v1",
        ...(stageJourney
          ? [
              stageJourney.runtime.artifacts[0]?.id ?? "repository-skyline-relay-runtime",
              `browser:${stageJourney.id}`,
              `native:${stageJourney.id}`,
            ]
          : []),
      ],
    },
    packageCatalog: {
      "mugen-lite-journey": {
        provenance: MUGEN_LITE_JOURNEY_MANIFEST.provenance,
        entry: MUGEN_LITE_JOURNEY_MANIFEST.entry,
      },
      ...(stageJourney
        ? {
            "repository-skyline-relay": {
              provenance: stageJourney.package.provenance,
              entry: stageJourney.package.entry,
            },
          }
        : {}),
    },
    artifactCatalog,
    artifactProbe: probeRepositoryArtifact,
  });
}

async function readMaterializedStageJourney() {
  if (process.env.WRITE_COMPATIBILITY_CORPUS_SNAPSHOT !== "1") return undefined;
  const path = resolve(process.cwd(), ".scratch/qa/repository-skyline-relay-browser/journey.json");
  if (!existsSync(path)) throw new Error(`repository stage journey is missing: ${path}`);
  const parsed = parseStageCompatibilityJourney(JSON.parse(readFileSync(path, "utf8")));
  if (parsed.errors.length > 0 || !parsed.journey) throw new Error(`repository stage journey is invalid: ${parsed.errors.join(", ")}`);
  if (parsed.journey.status !== "passed") throw new Error(`repository stage journey is not promotable: ${parsed.journey.status}`);
  return parsed.journey;
}

function stageArtifactCatalog(journey: Awaited<ReturnType<typeof readMaterializedStageJourney>>) {
  if (!journey) return {};
  const runtimeArtifact = journey.runtime.artifacts[0];
  const nativeReport = journey.nativeRegression.reportPath;
  if (!runtimeArtifact || !nativeReport) throw new Error("repository stage journey lacks runtime/native artifact identity");
  return {
    [runtimeArtifact.id]: {
      id: runtimeArtifact.id,
      status: "passed" as const,
      path: runtimeArtifact.path,
      detail: "repository stage runtime artifact",
    },
    [`browser:${journey.id}`]: {
      id: `browser:${journey.id}`,
      status: "passed" as const,
      path: journey.browser.diagnosticsPath,
      detail: "repository stage browser diagnostics",
    },
    [`native:${journey.id}`]: {
      id: `native:${journey.id}`,
      status: "passed" as const,
      path: nativeReport,
      detail: "repository stage native regression report",
    },
  };
}

function materialize(input: CompatibilityCorpusSnapshotMaterializerInput) {
  return materializeCompatibilityCorpusSnapshot(input);
}

function snapshotInput(corpus: ReturnType<typeof createCompatibilityCorpus>, observedAt: string): CompatibilityCorpusSnapshotMaterializerInput {
  return {
    corpus,
    observedAt,
    referenceAt: "2026-07-16T12:00:00.000Z",
    source: {
      corpusSchema: "mugen-web-sandbox/compatibility-corpus/v0",
      sourceRevision: "repo-revision",
      tool: { id: "compatibility-materializer", version: "1.0.0" },
      ruleset: { id: "mugen-compatibility", version: "v1" },
    },
    freshness: {
      policy: "rebuild-and-verify",
      maxAgeHours: 24,
      expectedSourceRevision: "repo-revision",
      requiredArtifactIds: ["trace-a", "browser:journey-a", "native:journey-a"],
    },
    packageCatalog: {
      "package-a": { provenance: "repository-authored fixture", entry: "chars/journey.def" },
    },
    artifactCatalog: {
      "trace-a": { id: "trace-a", status: "passed", path: "trace.json", checksum: "trace", detail: "trace" },
      "browser:journey-a": { id: "browser:journey-a", status: "passed", path: "browser.json", detail: "browser" },
      "native:journey-a": { id: "native:journey-a", status: "passed", path: "build.log", detail: "native" },
    },
    artifactProbe: () => ({ exists: true, contentDigest: TEST_CONTENT_DIGEST }),
  };
}

const TEST_CONTENT_DIGEST = `sha256:${"a".repeat(64)}`;

function probeRepositoryArtifact(path: string) {
  const absolutePath = resolve(process.cwd(), path);
  if (!existsSync(absolutePath)) return { exists: false };
  return {
    exists: true,
    contentDigest: `sha256:${createHash("sha256").update(readFileSync(absolutePath)).digest("hex")}`,
  };
}

function journeyInput(): CompatibilityJourneyInput {
  return {
    id: "journey-a",
    generatedAt: "2026-07-16T09:00:00.000Z",
    package: {
      id: "package-a",
      name: "Journey Package",
      license: "CC0-1.0",
      licenseFile: "LICENSE.txt",
      provenance: "repository-authored fixture",
      entry: "chars/journey.def",
      packageDigest: "sha256:package-a",
      files: ["chars/journey.sff"],
      expectedRoutes: ["attack", "idle"],
      licenseVerified: true,
    },
    loader: {
      status: "passed",
      sourceName: "journey-a.zip",
      loaded: true,
      presentFiles: ["chars/journey.def"],
      compatibility: {
        loaded: true,
        parsedStates: 2,
        runtimeRoutableStates: 2,
        unsupported: [],
        warnings: [],
        errors: [],
      },
    },
    runtime: {
      status: "passed",
      traceQa: { status: "passed", totalArtifacts: 1, requiredArtifacts: 1, passedArtifacts: 1, failedArtifacts: 0, diagnosticsPath: "trace-qa.json" },
      artifacts: [{ id: "trace-a", status: "passed", path: "trace.json", checksum: "trace", detail: "trace" }],
    },
    browser: {
      status: "passed",
      diagnosticsPath: "browser.json",
      viewports: [{ id: "desktop", status: "passed", artifacts: ["desktop.png"], detail: "desktop" }],
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
