import {
  createStageCompatibilityJourney,
  type StageCompatibilityJourneyResult,
} from "../compatibility/StageCompatibilityJourney";
import { createStageCompatibilityReport } from "../compatibility/StageCompatibilityReport";
import { MugenStageLoader } from "../loader/MugenStageLoader";
import { demoFighters } from "./demoFighters";
import { PlayableMatchRuntime } from "./PlayableMatchRuntime";
import {
  createRepositoryStageFixturePackageDigest,
  createRepositoryStageFixtureVfs,
  REPOSITORY_STAGE_FIXTURE_MANIFEST,
} from "./RepositoryStageFixture";
import type { VirtualFileSystem } from "../loader/VirtualFileSystem";
import type { MugenStagePackage } from "../model/MugenStagePackage";

export type RepositoryStageJourneyOptions = {
  generatedAt?: string;
  runtimeArtifactPath?: string;
  browserDiagnosticsPath?: string;
  nativeBuildArtifact?: string;
};

export type RepositoryStageJourneyEvidence = {
  journey: StageCompatibilityJourneyResult;
  packageDigest: string;
  vfs: VirtualFileSystem;
  stagePackage: MugenStagePackage;
};

export async function createRepositoryStageJourney(
  options: RepositoryStageJourneyOptions = {},
): Promise<RepositoryStageJourneyEvidence> {
  const vfs = createRepositoryStageFixtureVfs();
  const packageDigest = await createRepositoryStageFixturePackageDigest(vfs);
  const [stagePackage] = await new MugenStageLoader().loadAll(REPOSITORY_STAGE_FIXTURE_MANIFEST.id, vfs);
  if (!stagePackage) throw new Error("repository Skyline Relay fixture did not produce a stage package");

  const report = createStageCompatibilityReport(stagePackage);
  const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, stagePackage.stage, { roundTimerFrames: 1 });
  const initial = runtime.getSnapshot();
  const first = runtime.step({ p1: new Set(), p2: new Set() });
  const second = runtime.step({ p1: new Set(), p2: new Set() });
  const nextRound = runtime.startNextRound();
  const next = runtime.getSnapshot();
  const checks = [
    {
      id: "stage-loader",
      status: report.loaded && report.files.def && report.files.sff && report.errors.length === 0 ? "passed" as const : "failed" as const,
      detail: "production stage loader resolves DEF, SFF, and game-space config",
    },
    {
      id: "stage-depth",
      status: stagePackage.stage.depthBounds && stagePackage.stage.localCoord.width === 640 && first.stage.id === "stage-skyline-relay" ? "passed" as const : "failed" as const,
      detail: "stage localcoord and player depth bounds reach the runtime snapshot",
    },
    {
      id: "stage-bgctrl",
      status: report.backgrounds.controllers.bounded > 0 && report.backgrounds.renderedAnimated > 0 ? "passed" as const : "failed" as const,
      detail: "animated background and bounded BGCtrl survive the production report",
    },
    {
      id: "stage-round-reset",
      status: nextRound.applied && stagePackage.stage.resetBackgroundBetweenRounds === false && second.stage.backgroundTick > initial.stage.backgroundTick && next.stage.backgroundTick === second.stage.backgroundTick
        ? "passed" as const
        : "failed" as const,
      detail: `resetBG=0 preserves the absolute stage background clock across the next round (initial=${initial.stage.backgroundTick}, second=${second.stage.backgroundTick}, next=${next.stage.backgroundTick}, applied=${nextRound.applied})`,
    },
  ];

  const journey = createStageCompatibilityJourney({
    id: "repository-skyline-relay-v1",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    package: {
      id: REPOSITORY_STAGE_FIXTURE_MANIFEST.id,
      name: REPOSITORY_STAGE_FIXTURE_MANIFEST.displayName,
      license: REPOSITORY_STAGE_FIXTURE_MANIFEST.license,
      licenseFile: REPOSITORY_STAGE_FIXTURE_MANIFEST.licenseFile,
      provenance: REPOSITORY_STAGE_FIXTURE_MANIFEST.provenance,
      entry: REPOSITORY_STAGE_FIXTURE_MANIFEST.entry,
      packageDigest,
      files: vfs.listFiles(),
      expectedRoutes: [...REPOSITORY_STAGE_FIXTURE_MANIFEST.expectedRoutes],
      licenseVerified: true,
    },
    loader: {
      status: "passed",
      sourceName: REPOSITORY_STAGE_FIXTURE_MANIFEST.id,
      loaded: true,
      presentFiles: vfs.listFiles(),
      report,
    },
    runtime: {
      status: checks.every((check) => check.status === "passed") ? "passed" : "failed",
      checks,
      artifacts: [{
        id: "repository-skyline-relay-runtime",
        status: checks.every((check) => check.status === "passed") ? "passed" : "failed",
        path: options.runtimeArtifactPath ?? ".scratch/qa/repository-skyline-stage/runtime.json",
        detail: "production stage loader and bounded runtime round route",
      }],
    },
    browser: {
      status: "not-run",
      diagnosticsPath: options.browserDiagnosticsPath ?? ".scratch/qa/repository-skyline-stage/browser.json",
      viewports: [
        { id: "desktop", status: "not-run", artifacts: [], detail: "repository stage browser route pending" },
        { id: "mobile", status: "not-run", artifacts: [], detail: "repository stage browser route pending" },
      ],
    },
    nativeRegression: {
      status: "not-run",
      tests: { status: "not-run", files: 0, assertions: 0 },
      typecheck: "not-run",
      boundaries: "not-run",
      build: { status: "not-run", ...(options.nativeBuildArtifact ? { artifact: options.nativeBuildArtifact } : {}), warnings: [] },
    },
    claims: {
      allowed: [
        "repository-authored CC0 Skyline Relay stage loads through the production stage loader",
        "bounded stage depth, background, and resetBG runtime checks pass",
      ],
      blocked: [
        "browser stage render proof",
        "native regression proof",
        "independent arbitrary-package compatibility",
        "full MUGEN/IKEMEN stage parity",
      ],
    },
  });

  return { journey, packageDigest, vfs, stagePackage };
}
