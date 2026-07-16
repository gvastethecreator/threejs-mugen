import { describe, expect, it } from "vitest";
import { createCompatibilityJourney, type CompatibilityJourneyInput } from "../mugen/compatibility/CompatibilityJourney";
import {
  COMPATIBILITY_CORPUS_SNAPSHOT_SCHEMA,
  createCompatibilityCorpusSnapshot,
  parseCompatibilityCorpusSnapshot,
  type CompatibilityCorpusSnapshotInput,
} from "../mugen/compatibility/CompatibilityCorpusSnapshot";

describe("CompatibilityCorpusSnapshot/v1", () => {
  it("projects package, route, unsupported, and exact artifact identity", () => {
    const journey = createCompatibilityJourney(journeyInput());
    const snapshot = createSnapshot(journey);

    expect(snapshot).toMatchObject({
      schemaVersion: COMPATIBILITY_CORPUS_SNAPSHOT_SCHEMA,
      snapshotId: "compatibility-v1-baseline",
      status: "passed",
      source: {
        sourceRevision: "repo-revision",
        tool: { id: "compatibility-materializer", version: "1.0.0" },
      },
      summary: {
        entryCount: 2,
        requiredCount: 1,
        optionalCount: 1,
        packageIds: ["package-a"],
        routeIds: ["attack", "idle"],
        unsupportedFeatureIds: ["cns:JourneyUnknownController"],
      },
    });
    expect(snapshot.entries.find((entry) => entry.id === "required-journey")).toMatchObject({
      journey: { id: "journey-a" },
      package: {
        id: "package-a",
        licenseSpdx: "CC0-1.0",
        packageDigest: "sha256:package-a",
      },
      artifactRefs: expect.arrayContaining([
        expect.objectContaining({ id: "trace-a", path: "trace.json", checksum: "trace" }),
        expect.objectContaining({ id: "journey-a:browser:diagnostics", path: "browser.json" }),
      ]),
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(parseCompatibilityCorpusSnapshot(JSON.parse(JSON.stringify(snapshot))).errors).toEqual([]);
  });

  it("keeps semantic identity stable when only observation time changes", () => {
    const journey = createCompatibilityJourney(journeyInput());
    const first = createSnapshot(journey, "2026-07-16T10:00:00.000Z");
    const second = createSnapshot(journey, "2026-07-16T11:00:00.000Z");
    const reversed = createCompatibilityCorpusSnapshot({
      ...snapshotInput(journey),
      observedAt: "2026-07-16T10:00:00.000Z",
      entries: [...snapshotInput(journey).entries].reverse(),
    });

    expect(second.semanticDigest).toBe(first.semanticDigest);
    expect(second.checksum).not.toBe(first.checksum);
    expect(reversed.semanticDigest).toBe(first.semanticDigest);
  });

  it("fails closed for tampering, missing freshness artifacts, and duplicate identities", () => {
    const journey = createCompatibilityJourney(journeyInput());
    const snapshot = createSnapshot(journey);

    expect(parseCompatibilityCorpusSnapshot({ ...snapshot, semanticDigest: "00000000" }).errors).toContain(
      "compatibility corpus snapshot semantic digest mismatch",
    );
    expect(parseCompatibilityCorpusSnapshot({ ...snapshot, checksum: "00000000" }).errors).toContain(
      "compatibility corpus snapshot checksum mismatch",
    );

    const missingArtifact = createCompatibilityCorpusSnapshot({
      ...snapshotInput(journey),
      freshness: { policy: "rebuild-and-verify", requiredArtifactIds: ["missing-artifact"] },
    });
    expect(missingArtifact.status).toBe("failed");
    expect(missingArtifact.diagnostics).toContain("freshness artifact is not indexed:missing-artifact");

    const duplicateArtifact = createCompatibilityCorpusSnapshot({
      ...snapshotInput(journey),
      entries: [{
        id: "optional-duplicate",
        availability: "optional-private",
        artifactRefs: [
          { id: "same", status: "passed", path: "one.json" },
          { id: "same", status: "passed", path: "two.json" },
        ],
      }],
    });
    expect(duplicateArtifact.status).toBe("failed");
    expect(duplicateArtifact.diagnostics).toContain("snapshot has no required or portable entry");
    expect(duplicateArtifact.diagnostics).toContain("duplicate snapshot artifact:optional-duplicate:same");
  });
});

function createSnapshot(journey: ReturnType<typeof createCompatibilityJourney>, observedAt = "2026-07-16T10:00:00.000Z") {
  return createCompatibilityCorpusSnapshot({ ...snapshotInput(journey), observedAt });
}

function snapshotInput(journey: ReturnType<typeof createCompatibilityJourney>): CompatibilityCorpusSnapshotInput {
  return {
    snapshotId: "compatibility-v1-baseline",
    observedAt: "2026-07-16T10:00:00.000Z",
    source: {
      corpusSchema: "mugen-web-sandbox/compatibility-corpus/v0",
      sourceRevision: "repo-revision",
      tool: { id: "compatibility-materializer", version: "1.0.0" },
      ruleset: { id: "mugen-compatibility", version: "v1" },
      upstream: { project: "Ikemen-GO", revision: "source-pin" },
    },
    freshness: {
      policy: "rebuild-and-verify",
      maxAgeHours: 24,
      requiredArtifactIds: ["trace-a", "journey-a:browser:diagnostics"],
    },
    entries: [
      { id: "required-journey", availability: "required-legal", journey },
      { id: "optional-codefuman", availability: "optional-private", unavailableReason: "fixture absent" },
    ],
    claims: {
      allowed: ["one repository-owned journey is indexed"],
      blocked: ["broad public package compatibility"],
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
        unsupported: [{ format: "cns", feature: "JourneyUnknownController", severity: "warning", count: 1 }],
        warnings: [],
        errors: [],
      },
    },
    runtime: {
      status: "passed",
      traceQa: {
        status: "passed",
        totalArtifacts: 1,
        requiredArtifacts: 1,
        passedArtifacts: 1,
        failedArtifacts: 0,
        diagnosticsPath: "trace-qa.json",
      },
      artifacts: [{ id: "trace-a", status: "passed", path: "trace.json", checksum: "trace", detail: "journey trace" }],
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
      build: { status: "passed", artifact: "build.log", warnings: [] },
    },
    claims: { allowed: ["bounded journey"], blocked: ["full parity"] },
  };
}
