import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseStageCompatibilityJourney } from "../mugen/compatibility/StageCompatibilityJourney";
import type { CompatibilityJourneyRegressionEvidence } from "../mugen/compatibility/CompatibilityJourney";
import { createRepositoryStageJourney } from "../mugen/runtime/RepositoryStageJourney";

const DEFAULT_BROWSER_DIAGNOSTICS = ".scratch/qa/repository-skyline-relay-browser/browser-diagnostics.json";
const DEFAULT_RUNTIME_ARTIFACT = ".scratch/qa/repository-skyline-relay-browser/runtime.json";
const DEFAULT_JOURNEY_ARTIFACT = ".scratch/qa/repository-skyline-relay-browser/journey.json";
const DEFAULT_NATIVE_REGRESSION = ".scratch/qa/repository-skyline-relay-native/native-regression.json";

describe("repository Skyline Relay journey materializer", () => {
  it("writes a parser-valid journey only when browser evidence is explicitly requested", async () => {
    if (process.env.WRITE_REPOSITORY_STAGE_JOURNEY !== "1") {
      expect(true).toBe(true);
      return;
    }

    const browserPath = resolve(process.cwd(), process.env.REPOSITORY_STAGE_BROWSER_DIAGNOSTICS ?? DEFAULT_BROWSER_DIAGNOSTICS);
    const runtimePath = resolve(process.cwd(), process.env.REPOSITORY_STAGE_RUNTIME_ARTIFACT ?? DEFAULT_RUNTIME_ARTIFACT);
    const journeyPath = resolve(process.cwd(), process.env.REPOSITORY_STAGE_JOURNEY_ARTIFACT ?? DEFAULT_JOURNEY_ARTIFACT);
    if (!existsSync(browserPath)) throw new Error(`repository stage browser diagnostics are missing: ${browserPath}`);

    const browser = JSON.parse(readFileSync(browserPath, "utf8")) as {
      status: string;
      generatedAt: string;
      viewports: Record<string, { screenshot: string; canvas: string }>;
    };
    expect(browser.status).toBe("passed");
    const browserDiagnosticsPath = repositoryPath(browserPath);
    const browserArtifactPath = (name: string | undefined): string | undefined => {
      if (!name) return undefined;
      return repositoryPath(resolve(browserPath, "..", name));
    };
    const browserEvidence = {
      status: "passed" as const,
      diagnosticsPath: browserDiagnosticsPath,
      viewports: (["desktop", "mobile"] as const).map((id) => ({
        id,
        status: "passed" as const,
        artifacts: [browserArtifactPath(browser.viewports[id]?.screenshot), browserArtifactPath(browser.viewports[id]?.canvas)]
          .filter((value): value is string => Boolean(value)),
        detail: `repository Skyline Relay ${id} browser evidence`,
      })),
    };
    const nativeRegression = process.env.WRITE_REPOSITORY_STAGE_NATIVE === "1"
      ? readNativeRegression(resolve(process.cwd(), process.env.REPOSITORY_STAGE_NATIVE_ARTIFACT ?? DEFAULT_NATIVE_REGRESSION))
      : undefined;
    const evidence = await createRepositoryStageJourney({
      generatedAt: browser.generatedAt,
      runtimeArtifactPath: repositoryPath(runtimePath),
      browserEvidence,
      ...(nativeRegression ? { nativeRegression } : {}),
    });

    mkdirSync(dirname(runtimePath), { recursive: true });
    mkdirSync(dirname(journeyPath), { recursive: true });
    writeFileSync(runtimePath, `${JSON.stringify(evidence.runtimeArtifact, null, 2)}\n`, "utf8");
    writeFileSync(journeyPath, `${JSON.stringify(evidence.journey, null, 2)}\n`, "utf8");

    const parsed = parseStageCompatibilityJourney(JSON.parse(readFileSync(journeyPath, "utf8")));
    expect(parsed.errors).toEqual([]);
    expect(parsed.journey).toMatchObject({
      id: "repository-skyline-relay-v1",
      status: nativeRegression ? "passed" : "partial",
      browser: { status: "passed", diagnosticsPath: browserDiagnosticsPath },
      nativeRegression: { status: nativeRegression ? "passed" : "not-run" },
    });
    expect(evidence.runtimeArtifact).toMatchObject({
      schemaVersion: "mugen-web-sandbox/repository-stage-runtime/v1",
      packageId: "repository-skyline-relay",
      nextRound: { applied: true },
    });
  }, 30_000);
});

function repositoryPath(absolutePath: string): string {
  return relative(process.cwd(), absolutePath).replaceAll("\\", "/");
}

function readNativeRegression(absolutePath: string): CompatibilityJourneyRegressionEvidence {
  if (!existsSync(absolutePath)) throw new Error(`repository stage native regression is missing: ${absolutePath}`);
  const report = JSON.parse(readFileSync(absolutePath, "utf8")) as {
    packageId: string;
    packageDigest: string;
    status: CompatibilityJourneyRegressionEvidence["status"];
    tests: CompatibilityJourneyRegressionEvidence["tests"];
    typecheck: { status: CompatibilityJourneyRegressionEvidence["typecheck"] };
    boundaries: { status: CompatibilityJourneyRegressionEvidence["boundaries"] };
    build: { status: CompatibilityJourneyRegressionEvidence["build"]["status"]; warnings: string[] };
  };
  if (report.packageId !== "repository-skyline-relay") throw new Error(`repository stage native regression package mismatch: ${report.packageId}`);
  if (report.packageDigest !== "sha256:9c8a0b7cbd8d298eda5450518045e8d67e5d9a4a409e3186c5eef33a7183b456") {
    throw new Error(`repository stage native regression digest mismatch: ${report.packageDigest}`);
  }
  return {
    status: report.status,
    reportPath: repositoryPath(resolve(process.cwd(), "docs/evidence/repository-stage-native-regression-v1.json")),
    tests: report.tests,
    typecheck: report.typecheck.status,
    boundaries: report.boundaries.status,
    build: { status: report.build.status, warnings: report.build.warnings },
  };
}
