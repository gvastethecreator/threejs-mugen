import { describe, expect, it } from "vitest";
import { createCompatibilityCorpus } from "../mugen/compatibility/CompatibilityCorpus";
import { createCompatibilityJourney, type CompatibilityJourneyInput } from "../mugen/compatibility/CompatibilityJourney";
import {
  materializeCompatibilityCorpusSnapshot,
  type CompatibilityCorpusSnapshotMaterializerInput,
} from "../mugen/compatibility/CompatibilityCorpusSnapshot";

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
});

function materialize(input: CompatibilityCorpusSnapshotMaterializerInput) {
  return materializeCompatibilityCorpusSnapshot(input);
}

function snapshotInput(corpus: ReturnType<typeof createCompatibilityCorpus>, observedAt: string): CompatibilityCorpusSnapshotMaterializerInput {
  return {
    corpus,
    observedAt,
    source: {
      corpusSchema: "mugen-web-sandbox/compatibility-corpus/v0",
      sourceRevision: "repo-revision",
      tool: { id: "compatibility-materializer", version: "1.0.0" },
      ruleset: { id: "mugen-compatibility", version: "v1" },
    },
    freshness: {
      policy: "rebuild-and-verify",
      maxAgeHours: 24,
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
