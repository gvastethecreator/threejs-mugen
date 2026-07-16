import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseStageCompatibilityJourney } from "../mugen/compatibility/StageCompatibilityJourney";
import { createRepositoryStageJourney } from "../mugen/runtime/RepositoryStageJourney";

const DEFAULT_BROWSER_DIAGNOSTICS = ".scratch/qa/repository-skyline-relay-browser/browser-diagnostics.json";
const DEFAULT_RUNTIME_ARTIFACT = ".scratch/qa/repository-skyline-relay-browser/runtime.json";
const DEFAULT_JOURNEY_ARTIFACT = ".scratch/qa/repository-skyline-relay-browser/journey.json";

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
    const browserEvidence = {
      status: "passed" as const,
      diagnosticsPath: browserDiagnosticsPath,
      viewports: (["desktop", "mobile"] as const).map((id) => ({
        id,
        status: "passed" as const,
        artifacts: [browser.viewports[id]?.screenshot, browser.viewports[id]?.canvas].filter((value): value is string => Boolean(value)),
        detail: `repository Skyline Relay ${id} browser evidence`,
      })),
    };
    const evidence = await createRepositoryStageJourney({
      generatedAt: browser.generatedAt,
      runtimeArtifactPath: repositoryPath(runtimePath),
      browserEvidence,
    });

    mkdirSync(dirname(runtimePath), { recursive: true });
    mkdirSync(dirname(journeyPath), { recursive: true });
    writeFileSync(runtimePath, `${JSON.stringify(evidence.runtimeArtifact, null, 2)}\n`, "utf8");
    writeFileSync(journeyPath, `${JSON.stringify(evidence.journey, null, 2)}\n`, "utf8");

    const parsed = parseStageCompatibilityJourney(JSON.parse(readFileSync(journeyPath, "utf8")));
    expect(parsed.errors).toEqual([]);
    expect(parsed.journey).toMatchObject({
      id: "repository-skyline-relay-v1",
      status: "partial",
      browser: { status: "passed", diagnosticsPath: browserDiagnosticsPath },
      nativeRegression: { status: "not-run" },
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
