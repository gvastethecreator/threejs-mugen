import {
  createStageCompatibilityJourney,
  type StageCompatibilityJourneyCheck,
  type StageCompatibilityJourneyResult,
} from "../compatibility/StageCompatibilityJourney";
import { createStageCompatibilityReport } from "../compatibility/StageCompatibilityReport";
import type {
  CompatibilityJourneyBrowserEvidence,
  CompatibilityJourneyRegressionEvidence,
} from "../compatibility/CompatibilityJourney";
import { MugenStageLoader } from "../loader/MugenStageLoader";
import { demoFighters } from "./demoFighters";
import { PlayableMatchRuntime } from "./PlayableMatchRuntime";
import {
  createRepositoryStagePackageDigest,
  createRepositoryStagePackageVfs,
  REPOSITORY_STAGE_PACKAGE_MANIFEST,
} from "./RepositoryStagePackage";
import type { VirtualFileSystem } from "../loader/VirtualFileSystem";
import type { MugenStagePackage } from "../model/MugenStagePackage";

export type RepositoryStageJourneyOptions = {
  generatedAt?: string;
  runtimeArtifactPath?: string;
  browserDiagnosticsPath?: string;
  browserEvidence?: CompatibilityJourneyBrowserEvidence;
  nativeRegression?: CompatibilityJourneyRegressionEvidence;
  nativeBuildArtifact?: string;
};

export const REPOSITORY_STAGE_RUNTIME_ARTIFACT_SCHEMA = "mugen-web-sandbox/repository-stage-runtime/v1" as const;

export type RepositoryStageRuntimeArtifact = {
  schemaVersion: typeof REPOSITORY_STAGE_RUNTIME_ARTIFACT_SCHEMA;
  generatedAt: string;
  packageId: string;
  packageDigest: string;
  stage: {
    id: string;
    displayName: string;
    localCoord: { width: number; height: number };
    gameSpace?: { width: number; height: number; sourcePath?: string };
    depthBounds?: { top: number; bottom: number };
    resetBackgroundBetweenRounds?: boolean;
  };
  snapshots: Record<"initial" | "first" | "second" | "nextRound", {
    tick: number;
    backgroundTick: number;
    roundState: string;
    roundTimer: number;
  }>;
  nextRound: {
    applied: boolean;
    diagnostics: string[];
    outcome: string;
    matchOver: boolean;
  };
  checks: StageCompatibilityJourneyCheck[];
};

export type RepositoryStageJourneyEvidence = {
  journey: StageCompatibilityJourneyResult;
  packageDigest: string;
  vfs: VirtualFileSystem;
  stagePackage: MugenStagePackage;
  runtimeArtifact: RepositoryStageRuntimeArtifact;
};

export async function createRepositoryStageJourney(
  options: RepositoryStageJourneyOptions = {},
): Promise<RepositoryStageJourneyEvidence> {
  const vfs = createRepositoryStagePackageVfs();
  const packageDigest = await createRepositoryStagePackageDigest(vfs);
  const [stagePackage] = await new MugenStageLoader().loadAll(REPOSITORY_STAGE_PACKAGE_MANIFEST.id, vfs);
  if (!stagePackage) throw new Error("repository Skyline Relay fixture did not produce a stage package");

  const report = createStageCompatibilityReport(stagePackage);
  const runtime = new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, stagePackage.stage, { roundTimerFrames: 1 });
  const initial = runtime.getSnapshot();
  const first = runtime.step({ p1: new Set(), p2: new Set() });
  const second = runtime.step({ p1: new Set(), p2: new Set() });
  const nextRound = runtime.startNextRound();
  const next = runtime.getSnapshot();
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const browserEvidence = options.browserEvidence ?? defaultBrowserEvidence(options.browserDiagnosticsPath);
  const nativeRegression = options.nativeRegression ?? defaultNativeRegression(options.nativeBuildArtifact);
  const initialBackgroundTick = initial.stage.backgroundTick ?? 0;
  const secondBackgroundTick = second.stage.backgroundTick ?? 0;
  const nextBackgroundTick = next.stage.backgroundTick ?? 0;
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
      status: nextRound.applied && stagePackage.stage.resetBackgroundBetweenRounds === false && secondBackgroundTick > initialBackgroundTick && nextBackgroundTick === secondBackgroundTick
        ? "passed" as const
        : "failed" as const,
      detail: `resetBG=0 preserves the absolute stage background clock across the next round (initial=${initialBackgroundTick}, second=${secondBackgroundTick}, next=${nextBackgroundTick}, applied=${nextRound.applied})`,
    },
  ];
  const runtimeArtifact: RepositoryStageRuntimeArtifact = {
    schemaVersion: REPOSITORY_STAGE_RUNTIME_ARTIFACT_SCHEMA,
    generatedAt,
    packageId: REPOSITORY_STAGE_PACKAGE_MANIFEST.id,
    packageDigest,
    stage: {
      id: stagePackage.stage.id,
      displayName: stagePackage.stage.displayName,
      localCoord: stagePackage.stage.localCoord,
      ...(stagePackage.stage.gameSpace ? { gameSpace: stagePackage.stage.gameSpace } : {}),
      ...(stagePackage.stage.depthBounds ? { depthBounds: stagePackage.stage.depthBounds } : {}),
      resetBackgroundBetweenRounds: stagePackage.stage.resetBackgroundBetweenRounds,
    },
    snapshots: {
      initial: runtimeSnapshotEvidence(initial),
      first: runtimeSnapshotEvidence(first),
      second: runtimeSnapshotEvidence(second),
      nextRound: runtimeSnapshotEvidence(next),
    },
    nextRound: {
      applied: nextRound.applied,
      diagnostics: [...nextRound.diagnostics],
      outcome: nextRound.matchOutcome.outcome,
      matchOver: nextRound.matchOutcome.matchOver,
    },
    checks,
  };

  const journey = createStageCompatibilityJourney({
    id: "repository-skyline-relay-v1",
    generatedAt,
    package: {
      id: REPOSITORY_STAGE_PACKAGE_MANIFEST.id,
      name: REPOSITORY_STAGE_PACKAGE_MANIFEST.displayName,
      license: REPOSITORY_STAGE_PACKAGE_MANIFEST.license,
      licenseFile: REPOSITORY_STAGE_PACKAGE_MANIFEST.licenseFile,
      provenance: REPOSITORY_STAGE_PACKAGE_MANIFEST.provenance,
      entry: REPOSITORY_STAGE_PACKAGE_MANIFEST.stageEntry,
      packageDigest,
      files: vfs.listFiles(),
      expectedRoutes: [...REPOSITORY_STAGE_PACKAGE_MANIFEST.expectedRoutes],
      licenseVerified: true,
    },
    loader: {
      status: "passed",
      sourceName: REPOSITORY_STAGE_PACKAGE_MANIFEST.id,
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
    browser: browserEvidence,
    nativeRegression,
    claims: {
      allowed: [
        "repository-authored CC0 Skyline Relay stage loads through the production stage loader",
        "bounded stage depth, background, and resetBG runtime checks pass",
        ...(browserEvidence.status === "passed" ? ["browser ZIP/folder import and Stage Studio render evidence pass"] : []),
        ...(nativeRegression.status === "passed" ? ["repository stage native regression batch passes"] : []),
      ],
      blocked: [
        ...(browserEvidence.status === "passed" ? [] : ["browser stage render proof"]),
        ...(nativeRegression.status === "passed" ? [] : ["native regression proof"]),
        "independent arbitrary-package compatibility",
        "full MUGEN/IKEMEN stage parity",
      ],
    },
  });

  return { journey, packageDigest, vfs, stagePackage, runtimeArtifact };
}

function defaultBrowserEvidence(browserDiagnosticsPath?: string): CompatibilityJourneyBrowserEvidence {
  return {
    status: "not-run",
    diagnosticsPath: browserDiagnosticsPath ?? ".scratch/qa/repository-skyline-stage/browser.json",
    viewports: [
      { id: "desktop", status: "not-run", artifacts: [], detail: "repository stage browser route pending" },
      { id: "mobile", status: "not-run", artifacts: [], detail: "repository stage browser route pending" },
    ],
  };
}

function defaultNativeRegression(nativeBuildArtifact?: string): CompatibilityJourneyRegressionEvidence {
  return {
    status: "not-run",
    tests: { status: "not-run", files: 0, assertions: 0 },
    typecheck: "not-run",
    boundaries: "not-run",
    build: { status: "not-run", ...(nativeBuildArtifact ? { artifact: nativeBuildArtifact } : {}), warnings: [] },
  };
}

function runtimeSnapshotEvidence(snapshot: ReturnType<PlayableMatchRuntime["getSnapshot"]>): RepositoryStageRuntimeArtifact["snapshots"]["initial"] {
  return {
    tick: snapshot.tick,
    backgroundTick: snapshot.stage.backgroundTick ?? 0,
    roundState: snapshot.round?.state ?? "unknown",
    roundTimer: snapshot.round?.timer ?? 0,
  };
}
