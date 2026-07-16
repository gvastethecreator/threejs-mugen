import { createFrameLoop } from "../game/loop/createFrameLoop";
import JSZip from "jszip";
import iconActivity from "@tabler/icons/outline/activity.svg?raw";
import iconAlertTriangle from "@tabler/icons/outline/alert-triangle.svg?raw";
import iconArchive from "@tabler/icons/outline/archive.svg?raw";
import iconBinaryTree from "@tabler/icons/outline/binary-tree.svg?raw";
import iconBox from "@tabler/icons/outline/box.svg?raw";
import iconBug from "@tabler/icons/outline/bug.svg?raw";
import iconCircleCheck from "@tabler/icons/outline/circle-check.svg?raw";
import iconCircleX from "@tabler/icons/outline/circle-x.svg?raw";
import iconClock from "@tabler/icons/outline/clock.svg?raw";
import iconCpu from "@tabler/icons/outline/cpu.svg?raw";
import iconDashboard from "@tabler/icons/outline/layout-dashboard.svg?raw";
import iconDatabase from "@tabler/icons/outline/database.svg?raw";
import iconFileAnalytics from "@tabler/icons/outline/file-analytics.svg?raw";
import iconFileDescription from "@tabler/icons/outline/file-description.svg?raw";
import iconFileExport from "@tabler/icons/outline/file-export.svg?raw";
import iconFolder from "@tabler/icons/outline/folder.svg?raw";
import iconGamepad from "@tabler/icons/outline/device-gamepad-2.svg?raw";
import iconLibraryPhoto from "@tabler/icons/outline/library-photo.svg?raw";
import iconMap from "@tabler/icons/outline/map-2.svg?raw";
import iconPackage from "@tabler/icons/outline/package.svg?raw";
import iconPhoto from "@tabler/icons/outline/photo.svg?raw";
import iconPlayerPause from "@tabler/icons/outline/player-pause.svg?raw";
import iconPlayerPlay from "@tabler/icons/outline/player-play.svg?raw";
import iconPlayerTrackNext from "@tabler/icons/outline/player-track-next.svg?raw";
import iconRefresh from "@tabler/icons/outline/refresh.svg?raw";
import iconRoute from "@tabler/icons/outline/route.svg?raw";
import iconSearch from "@tabler/icons/outline/search.svg?raw";
import iconDeviceFloppy from "@tabler/icons/outline/device-floppy.svg?raw";
import iconServer from "@tabler/icons/outline/server.svg?raw";
import iconShield from "@tabler/icons/outline/shield.svg?raw";
import iconShieldHalf from "@tabler/icons/outline/shield-half.svg?raw";
import iconSpeaker from "@tabler/icons/outline/device-speaker.svg?raw";
import iconTarget from "@tabler/icons/outline/target.svg?raw";
import iconTools from "@tabler/icons/outline/tools.svg?raw";
import iconUser from "@tabler/icons/outline/user-square-rounded.svg?raw";
import iconWand from "@tabler/icons/outline/wand.svg?raw";
import iconX from "@tabler/icons/outline/x.svg?raw";
import iconAxisX from "@tabler/icons/outline/axis-x.svg?raw";
import iconArrowBackUp from "@tabler/icons/outline/arrow-back-up.svg?raw";
import iconArrowForwardUp from "@tabler/icons/outline/arrow-forward-up.svg?raw";
import iconGrid3x3 from "@tabler/icons/outline/grid-3x3.svg?raw";
import { MugenAudioSystem } from "../game/audio/MugenAudioSystem";
import { KeyboardInputAdapter } from "../game/input/KeyboardInputAdapter";
import { ThreeMugenRenderer } from "../game/render/ThreeMugenRenderer";
import { AtlasSpriteProvider } from "../game/textures/AtlasSpriteProvider";
import { CompositeSpriteProvider } from "../game/textures/CompositeSpriteProvider";
import { MockSpriteProvider } from "../game/textures/MockSpriteProvider";
import { NativeHitSparkSpriteProvider } from "../game/textures/NativeHitSparkSpriteProvider";
import { SffSpriteProvider } from "../game/textures/SffSpriteProvider";
import { FolderCharacterSource, type FolderCharacterSourceFile } from "../mugen/loader/FolderCharacterSource";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { MugenStageLoader } from "../mugen/loader/MugenStageLoader";
import type { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";
import { ZipCharacterSource } from "../mugen/loader/ZipCharacterSource";
import type { CompatibilityReport } from "../mugen/compatibility/CompatibilityReport";
import { analyzeControllerTriggers, createCompatibilityProfiles, createEmptyCompileReport, isRuntimeSupportedController } from "../mugen/compatibility/CompatibilityReport";
import { createStageCompatibilityReport, summarizeStageBackgroundControllers } from "../mugen/compatibility/StageCompatibilityReport";
import type { StageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";
import {
  createPackageAnalysisV1,
  parsePackageAnalysisV1,
  type PackageAnalysisV1Result,
  type PackageAnalysisResult,
} from "../mugen/compatibility/PackageAnalysis";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenCharacter } from "../mugen/model/MugenCharacter";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import type { MugenStagePackage } from "../mugen/model/MugenStagePackage";
import { CommandBuffer } from "../mugen/runtime/CommandBuffer";
import { demoFighters, type DemoFighterDefinition } from "../mugen/runtime/demoFighters";
import { bgCtrlLabStage, rooftopDojoStage, trainingStage } from "../mugen/runtime/demoStage";
import { createFixtureAnimations } from "../mugen/runtime/fixture";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";
import { MatchWorld, type MatchWorldActorRegistrySnapshot } from "../mugen/runtime/MatchWorld";
import { MugenRuntime } from "../mugen/runtime/MugenRuntime";
import { createMatchSmokeTraceArtifact } from "../mugen/runtime/RuntimeTracePresets";
import { fingerprintMugenStateSource } from "../mugen/compiler/StateSourceResolver";
import type { RuntimeTraceArtifact } from "../mugen/runtime/RuntimeTraceArtifact";
import type { RuntimeTraceArtifactFrameSummary } from "../mugen/runtime/RuntimeTraceArtifact";
import type { MugenSnapshot } from "../mugen/runtime/types";
import { renderActorRegistry, renderDebugPanel, escapeHtml, type RuntimeRosterEntry } from "./DebugPanel";
import { FileDropZone } from "./FileDropZone";
import { compileGameProjectManifest, type CompiledRuntimeManifest } from "./ProjectCompiler";
import {
  listStoredProjects,
  loadStoredProject,
  PROJECT_STORAGE_KEY,
  ProjectStorageConflictError,
  saveStoredProjectManifest,
  type ProjectStorageConflict,
  type StoredProjectEntry,
} from "./ProjectStorage";
import { StudioEditHistory, type StudioProjectEditState } from "./StudioEditHistory";
import { listStoredTraceEvidence, saveStoredTraceEvidence, type StoredTraceEvidenceEntry } from "./StudioEvidenceStorage";
import { StudioAutosave } from "./StudioAutosave";
import {
  assessGateEvidenceFreshness,
  isGateEvidenceExportable,
  type GateEvidenceFreshnessAssessment,
  type GateEvidenceResult,
} from "./GateEvidence";
import { STUDIO_GATE_EVIDENCE_DIAGNOSTICS, STUDIO_GATE_EVIDENCE_DOCUMENT } from "./StudioGateEvidence";
import {
  STUDIO_COMPATIBILITY_SNAPSHOT,
  STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH,
  type StudioCompatibilitySnapshotState,
} from "./StudioCompatibilitySnapshot";
import {
  ASSET_PROVENANCE_EXPORT_CONFIG_DIGEST,
  ASSET_PROVENANCE_IMPORT_CONFIG_DIGEST,
  ASSET_PROVENANCE_TOOL_VERSION,
  createAssetProvenanceRecord,
  type AssetProvenanceFileInput,
  type AssetProvenanceQaLink,
  type AssetProvenancePermission,
  type AssetProvenanceRecord,
} from "./StudioAssetProvenance";
import {
  FIRST_PARTY_ASSET_PERMISSION_PATHS,
  getAssetPermissionMetadataPath,
  parseAssetPermissionMetadata,
  type AssetPermissionMetadata,
} from "./StudioAssetPermission";
import { needsStudioProjectNavigationGuard, studioProjectDiscardMessage } from "./StudioProjectNavigationGuard";
import { fingerprintVirtualFileSystem, type SourceFingerprint } from "./StudioSourceIdentity";
import {
  commitStudioSourceDocumentDraft,
  createStudioSourceDocumentDraft,
  discardStudioSourceDocumentDraft,
  updateStudioSourceDocumentDraft,
  type StudioSourceDocumentDraft,
} from "./StudioSourceDocument";
import {
  canWriteStudioSemanticDraft,
  createStudioSemanticDraftPreflight,
  describeStudioSemanticDraft,
  type StudioSemanticDraftPreflight,
} from "./StudioSemanticDraft";
import {
  createIndexedDbSourceHandleStore,
  createMemorySourceHandleStore,
  createSourceHandleRecord,
  detectSourceHandleCapability,
  detectSourceHandleStorage,
  pickSourceHandle,
  readSourceHandleFolder,
  readSourceHandleFile,
  requestSourceHandlePermission,
  requestSourceHandleWritePermission,
  type SourceHandleBrowserHost,
  type SourceHandleCapability,
  type SourceHandleLike,
  type SourceHandleRecord,
  type SourceHandleStore,
  type SourceHandleStoreEntry,
  type SourceHandleStorage,
} from "./StudioSourceHandle";
import {
  createSourceTransactionRecord,
  prepareSourceImportTransaction,
  runSourceImportTransaction,
  SOURCE_TRANSACTION_INVALIDATED_OUTPUTS,
  type SourceTransactionPermission,
  type SourceTransactionRecord,
  type SourceImportTransaction,
} from "./StudioSourceTransaction";
import {
  createSourceWritePlan,
  writeSourceHandleText,
  type SourceWritePlan,
} from "./StudioSourceWrite";
import {
  createSourceWriteReceipt,
  isSourceWriteReceiptCommitted,
  type SourceWriteReceipt,
  type SourceWriteReceiptReason,
  type SourceWriteReceiptStatus,
} from "./StudioSourceWriteReceipt";
import { parseStudioTab, STUDIO_TABS, type StudioTab } from "./StudioTabs";
import {
  buildGameProjectManifest,
  buildStudioProjectSummary,
  MAX_PROJECT_NAME_LENGTH,
  normalizeProjectName,
  parseGameProjectManifestJson,
  relinkGameProjectSourcePackages,
  type GameProjectManifest,
  type GameProjectSourcePackage,
  type StudioActionableFields,
  type StudioAssetRecord,
  type StudioNextAction,
  type StudioProjectSummary,
  type StudioStatus,
} from "./StudioModel";

type NavigatorTab = "animations" | "states" | "commands";
type AppMode = "match" | "inspect" | "studio";
type CommandPaletteTone = "ok" | "warn" | "error" | "active" | "neutral";
type CommandPaletteAction = {
  id: string;
  group: string;
  label: string;
  detail: string;
  keywords: string[];
  tone: CommandPaletteTone;
  disabled?: boolean;
  run(): void;
};
type StudioEvidenceCategory = "gate" | "asset" | "trace" | "compile" | "compatibility" | "analysis" | "diagnostic" | "source";
type StudioEvidenceFilter = "all" | "attention" | StudioEvidenceCategory;
type StudioAssetFilter = "all" | "attention" | "characters" | "stages" | "generated" | "imported" | "reports" | "selected";
type StudioDebugFilter = "overview" | "targets" | "effects" | "pause" | "audio";
type StudioIconName =
  | "activity"
  | "alert"
  | "archive"
  | "assetAtlas"
  | "assets"
  | "bug"
  | "build"
  | "character"
  | "check"
  | "close"
  | "data"
  | "debug"
  | "error"
  | "evidence"
  | "export"
  | "folder"
  | "match"
  | "modules"
  | "package"
  | "pending"
  | "play"
  | "pause"
  | "route"
  | "save"
  | "search"
  | "server"
  | "shield"
  | "sound"
  | "axis"
  | "grid"
  | "undo"
  | "redo"
  | "hit"
  | "hurt"
  | "report"
  | "reset"
  | "stageMap"
  | "stage"
  | "step"
  | "studio"
  | "tools"
  | "wand"
  | "workbench";

const TABLER_ICONS: Record<StudioIconName, string> = {
  activity: iconActivity,
  alert: iconAlertTriangle,
  archive: iconArchive,
  assetAtlas: iconLibraryPhoto,
  assets: iconPhoto,
  bug: iconBug,
  build: iconPackage,
  character: iconUser,
  check: iconCircleCheck,
  close: iconX,
  data: iconDatabase,
  debug: iconBug,
  error: iconCircleX,
  evidence: iconFileAnalytics,
  export: iconFileExport,
  folder: iconFolder,
  match: iconGamepad,
  modules: iconBinaryTree,
  package: iconBox,
  pending: iconClock,
  play: iconPlayerPlay,
  pause: iconPlayerPause,
  route: iconRoute,
  save: iconDeviceFloppy,
  search: iconSearch,
  server: iconServer,
  shield: iconShield,
  sound: iconSpeaker,
  axis: iconAxisX,
  grid: iconGrid3x3,
  hit: iconTarget,
  hurt: iconShieldHalf,
  report: iconFileDescription,
  reset: iconRefresh,
  stageMap: iconMap,
  stage: iconServer,
  step: iconPlayerTrackNext,
  studio: iconCpu,
  tools: iconTools,
  undo: iconArrowBackUp,
  redo: iconArrowForwardUp,
  wand: iconWand,
  workbench: iconDashboard,
};

function tablerIcon(name: StudioIconName, className = "ui-icon"): string {
  return TABLER_ICONS[name]
    .replace("<svg", `<svg class="${className}" aria-hidden="true" focusable="false"`)
    .replace(/width="24"/, "")
    .replace(/height="24"/, "");
}

function runtimeControlContent(icon: StudioIconName, label: string): string {
  return `${tablerIcon(icon, "ui-icon runtime-control-icon")}<span>${escapeHtml(label)}</span>`;
}

function iconForStatus(status: StudioStatus): StudioIconName {
  if (status === "ok" || status === "active") {
    return "check";
  }
  if (status === "fail" || status === "blocked" || status === "unsupported") {
    return "error";
  }
  if (status === "pending" || status === "planned" || status === "unknown") {
    return "pending";
  }
  return "alert";
}

function iconForMode(mode: AppMode): StudioIconName {
  if (mode === "match") {
    return "match";
  }
  if (mode === "inspect") {
    return "data";
  }
  return "studio";
}

function iconForStudioTab(tab: StudioTab): StudioIconName {
  const icons: Record<StudioTab, StudioIconName> = {
    workbench: "workbench",
    assets: "assets",
    inspector: "data",
    stage: "stage",
    debug: "debug",
    evidence: "evidence",
    modules: "modules",
    build: "build",
  };
  return icons[tab];
}

function labelForStudioTab(tab: StudioTab): string {
  return STUDIO_TABS.find((candidate) => candidate.id === tab)?.label ?? tab;
}

function iconForAction(label: string, attribute: string): StudioIconName {
  const key = `${label} ${attribute}`.toLowerCase();
  if (key.includes("undo")) {
    return "undo";
  }
  if (key.includes("redo")) {
    return "redo";
  }
  if (key.includes("playtest") || key.includes("match")) {
    return "match";
  }
  if (key.includes("reset")) {
    return "reset";
  }
  if (key.includes("evidence") || key.includes("trace")) {
    return "evidence";
  }
  if (key.includes("compile") || key.includes("build") || key.includes("package") || key.includes("ship")) {
    return "build";
  }
  if (key.includes("asset") || key.includes("sprite")) {
    return "assets";
  }
  if (key.includes("module") || key.includes("architecture") || key.includes("boundary")) {
    return "modules";
  }
  if (key.includes("workbench") || key.includes("project") || key.includes("health")) {
    return "workbench";
  }
  if (key.includes("debug")) {
    return "debug";
  }
  if (key.includes("zip") || key.includes("folder") || key.includes("source")) {
    return "folder";
  }
  if (key.includes("export") || key.includes("report")) {
    return "export";
  }
  if (key.includes("inspect") || key.includes("data")) {
    return "data";
  }
  return "tools";
}

function iconForAssetRecord(asset: StudioProjectSummary["assets"][number]): StudioIconName {
  if (asset.kind === "character") {
    return "character";
  }
  if (asset.kind === "stage") {
    return "stageMap";
  }
  if (asset.kind === "sprite-atlas") {
    return "assetAtlas";
  }
  if (asset.kind === "sound") {
    return "sound";
  }
  if (asset.kind === "report") {
    return "report";
  }
  return "package";
}

function studioActionButton(
  label: string,
  attribute: string,
  options: { primary?: boolean; fullWidth?: boolean; disabled?: boolean } = {},
): string {
  const classes = [
    options.primary ? "primary-action" : "",
    options.fullWidth ? "full-width-action" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `
    <button type="button" ${classes ? `class="${classes}"` : ""} ${attribute} ${options.disabled ? "disabled" : ""}>
      ${tablerIcon(iconForAction(label, attribute), "ui-icon action-icon")}
      <span class="action-label">${escapeHtml(label)}</span>
    </button>
  `;
}

type StudioEvidenceRecord = {
  id: string;
  label: string;
  category: StudioEvidenceCategory;
  status: StudioStatus;
  detail: string;
  tags: string[];
  level?: string;
} & Partial<StudioActionableFields>;
type StudioEvidenceSummary = {
  records: StudioEvidenceRecord[];
  compatibilitySnapshot: StudioCompatibilitySnapshotState;
  stats: {
    total: number;
    ok: number;
    attention: number;
    fail: number;
    pending: number;
    traceArtifacts: number;
    persistedTraceArtifacts: number;
  };
  activeFilter: StudioEvidenceFilter;
  filters: StudioEvidenceFilter[];
  topAction?: StudioNextAction;
  topRecordId?: string;
  topImpact?: string;
  persistedTraceEvidence: StoredTraceEvidenceEntry[];
  persistedTraceComparisons: StudioTraceEvidenceComparison[];
};
type StudioTraceEvidenceComparison = {
  id: string;
  projectId: string;
  label: string;
  checksum: string;
  currentChecksum?: string;
  match: "same" | "different" | "missing-current";
  status: StudioStatus;
  frameDelta?: number;
  eventDelta?: number;
  gateDelta?: number;
  passedGateDelta?: number;
  failedGateDelta?: number;
  combatReasonDelta?: number;
  summaryRows: StudioTraceMetricComparison[];
  gateComparisons: StudioTraceGateComparison[];
  detail: string;
};
type StudioTraceMetricComparison = {
  label: string;
  stored: number;
  current?: number;
  delta?: number;
  status: StudioStatus;
};
type StudioTraceGateComparison = {
  label: string;
  stored: "passed" | "failed" | "missing";
  current: "passed" | "failed" | "missing";
  status: "ok" | "warn" | "partial";
  storedFailures: string[];
  currentFailures: string[];
};
type StudioDebugRuntimeSession = NonNullable<MugenSnapshot["compatibilitySession"]>["actors"][number];
type StudioDebugTraceFrameLink = {
  frameIndex: number;
  tick: number;
  label?: string;
  checksum: string;
  input: RuntimeTraceArtifactFrameSummary["input"];
  score: number;
  reasons: string[];
  eventCategories: RuntimeTraceArtifactFrameSummary["eventCategories"];
  combatReasons: RuntimeTraceArtifactFrameSummary["combatReasons"];
  targetLinkCount: number;
  lifecycleEvents: string[];
};
type StudioDebugTraceGateLink = {
  label: string;
  passed: boolean;
  failures: string[];
  summary: string;
};
type StudioDebugTraceEvidence = {
  traceLabel?: string;
  traceChecksum?: string;
  traceStatus?: RuntimeTraceArtifact["status"];
  traceFrameCount: number;
  finalActor?: RuntimeTraceArtifact["trace"]["finalActors"][number];
  controllerKeys: string[];
  operationKeys: string[];
  frames: StudioDebugTraceFrameLink[];
  gates: StudioDebugTraceGateLink[];
};
type StudioDebugHitPauseSummary = {
  active: boolean;
  remaining: number;
  actors: MugenSnapshot["actors"];
};
type StudioDebugSelectionSummary = {
  selectedActorId?: string;
  selectedActor?: MatchWorldActorRegistrySnapshot["actors"][number];
  snapshotActor?: MugenSnapshot["actors"][number];
  runtimeSession?: StudioDebugRuntimeSession;
  traceEvidence: StudioDebugTraceEvidence;
  ownedActors: MatchWorldActorRegistrySnapshot["actors"];
  relatedTargetLinks: MatchWorldActorRegistrySnapshot["targetLinks"];
  effectStore?: MatchWorldActorRegistrySnapshot["effectStores"][number];
  recentEvents: MatchWorldActorRegistrySnapshot["lifecycle"]["recentEvents"];
};
type StudioTraceFrameScrubberSummary = {
  selectedFrameIndex: number;
  totalFrames: number;
  selectedFrame?: RuntimeTraceArtifactFrameSummary;
};
type StudioAssetLibrarySummary = {
  assets: StudioAssetRecord[];
  visibleAssets: StudioAssetRecord[];
  selectedAsset?: StudioAssetRecord;
  selectedDependencies: StudioAssetDependencyRecord[];
  selectedDependencyGraph: StudioAssetDependencyGraph;
  replacementPlan: StudioAssetReplacementPlan;
  provenance: AssetProvenanceRecord[];
  selectedProvenance?: AssetProvenanceRecord;
  sourceRuntimeMap: StudioAssetSourceRuntimeMap;
  missingReferences: StudioAssetDependencyRecord[];
  relatedEvidence: StudioEvidenceRecord[];
  activeFilter: StudioAssetFilter;
  selectedAssetId?: string;
  filters: StudioAssetFilter[];
  stats: {
    total: number;
    attention: number;
    characters: number;
    stages: number;
    generated: number;
    imported: number;
    reports: number;
    selected: number;
  };
};
type StudioAssetDependencyKind = "manifest" | "playtest-entry" | "provenance" | "module" | "evidence" | "source";
type StudioAssetDependencyRecord = {
  id: string;
  label: string;
  kind: StudioAssetDependencyKind;
  status: StudioStatus;
  detail: string;
};
type StudioAssetDependencyGraphNode = {
  id: string;
  label: string;
  kind: StudioAssetDependencyKind | "asset";
  status: StudioStatus;
  detail: string;
  root?: boolean;
};
type StudioAssetDependencyGraphEdge = {
  id: string;
  from: string;
  to: string;
  status: StudioStatus;
  label: string;
};
type StudioAssetDependencyGraph = {
  nodes: StudioAssetDependencyGraphNode[];
  edges: StudioAssetDependencyGraphEdge[];
  stats: {
    total: number;
    ok: number;
    attention: number;
    blocked: number;
  };
};
type StudioAssetReplacementRole = "p1" | "p2" | "stage" | "unbound" | "unsupported";
type StudioAssetReplacementCandidate = {
  id: string;
  label: string;
  role: Exclude<StudioAssetReplacementRole, "unbound" | "unsupported">;
  kind: StudioAssetRecord["kind"];
  source: StudioAssetRecord["source"];
  status: StudioStatus;
  detail: string;
  active: boolean;
  tags: string[];
};
type StudioAssetReplacementPlan = {
  role: StudioAssetReplacementRole;
  currentId?: string;
  currentLabel?: string;
  canApply: boolean;
  reason: string;
  candidates: StudioAssetReplacementCandidate[];
};
type StudioAssetMappingLane = "source" | "manifest" | "runtime" | "qa" | "export";
type StudioAssetSourceRuntimeRecord = {
  id: string;
  lane: StudioAssetMappingLane;
  label: string;
  status: StudioStatus;
  detail: string;
  path?: string;
};
type StudioAssetSourceRuntimeMap = {
  records: StudioAssetSourceRuntimeRecord[];
  lanes: Record<StudioAssetMappingLane, number>;
};
type BuildReadinessStatus = "runnable" | "partial" | "blocked" | "exportable";
type BuildReadinessBaseRecord = {
  id: string;
  label: string;
  status: StudioStatus;
  state: BuildReadinessStatus;
  detail: string;
};
type BuildReadinessRecord = BuildReadinessBaseRecord & StudioActionableFields;
type StudioGateEvidenceAssessment = {
  evidence?: GateEvidenceResult;
  freshness: GateEvidenceFreshnessAssessment;
  status: StudioStatus;
  detail: string;
  evidenceIds: string[];
  blockedBy: string[];
  canExport: boolean;
};
type StudioTrustLane = "runtime" | "source" | "assets" | "qa" | "build" | "compat" | "architecture";
type StudioTrustTargetKind = "compile" | "trace" | "package" | "package-file" | "asset" | "source-package" | "source-file" | "gate" | "contract";
type StudioTrustTarget = {
  kind: StudioTrustTargetKind;
  id: string;
  targetPackageId?: string;
  targetPath?: string;
};
type StudioTrustContractRow = {
  id: string;
  lane: StudioTrustLane;
  label: string;
  status: StudioStatus;
  state: BuildReadinessStatus;
  detail: string;
  impact: string;
  evidence: string;
  freshness: string;
  delta: string;
  targetKind: StudioTrustTargetKind;
  targetId: string;
  targetPackageId?: string;
  targetPath?: string;
  nextLabel: string;
  nextAction: StudioNextAction;
  blockedBy: string[];
};
type ProjectExportBundleManifest = {
  schemaVersion: "mugen-web-sandbox/export-bundle/v0";
  projectId: string;
  projectName: string;
  generatedAt: string;
  sourcePackage: "browser-export";
  files: Array<{
    path: string;
    kind: "manifest" | "runtime" | "studio" | "qa" | "report" | "readme" | "asset" | "asset-manifest";
    required: boolean;
  }>;
  assets: {
    total: number;
    sourceRuntimeMapped: number;
    binaryBundled: number;
    binarySkipped: number;
    binaryFailed: number;
    binaryBytes: number;
    binaryBundlingStatus: "metadata-only" | "partial" | "bundled";
    provenanceRecords: number;
    provenanceReady: number;
    provenanceBlocked: number;
    records: ProjectExportBundleAssetRecord[];
  };
  diagnostics: {
    warnings: string[];
    errors: string[];
  };
};
type ProjectExportBundleAssetRecord = {
  assetId: string;
  label: string;
  kind: StudioAssetRecord["kind"];
  source: StudioAssetRecord["source"];
  sourceKind: ProjectExportBundleAssetCandidate["sourceKind"];
  sourcePath: string;
  packagePath: string;
  required: boolean;
  status: "bundled" | "skipped" | "failed";
  bytes?: number;
  sha256?: string;
  contentType?: string;
  reason?: string;
};
type ProjectExportBundleAssetCandidate = {
  asset: StudioAssetRecord;
  sourcePath: string;
  packagePath: string;
  required: boolean;
  label: string;
  sourceKind: "fetch" | "vfs";
};
type ProjectExportBundleSummary = {
  manifest: ProjectExportBundleManifest;
  filename: string;
};
type ImportedSourceBundle = {
  sourceName: string;
  sourceKind: "zip" | "folder";
  vfs: VirtualFileSystem;
  fileCount: number;
  fingerprint: SourceFingerprint;
};
type SourceImportRollbackState = {
  character?: MugenCharacter;
  importedFighter?: DemoFighterDefinition;
  importedSffProvider?: SffSpriteProvider;
  importedStages: MugenStagePackage[];
  importedSourceBundle?: ImportedSourceBundle;
  importedProjectManifest?: GameProjectManifest;
  projectNameOverride?: string;
  projectImportWarnings: string[];
  projectDirty: boolean;
  projectStorageRevision?: number;
  projectStorageConflict?: ProjectStorageConflict;
  autosavePending: boolean;
  selectedP1: string;
  selectedP2: string;
  selectedStageId: string;
  mode: AppMode;
  snapshot: MugenSnapshot;
  matchRuntime: MatchWorld;
  inspectorRuntime: MugenRuntime;
  pendingSourceRelinkPackageId?: string;
  sourceImportTransaction?: SourceImportTransaction;
  importedPackageAnalysis?: PackageAnalysisResult;
  importedPackageAnalysisV1?: PackageAnalysisV1Result;
  studioSourceDocument?: StudioSourceDocumentDraft;
  studioSourceWriteReceipt?: SourceWriteReceipt;
  lastCompiledProject?: CompiledRuntimeManifest;
  lastProjectBundle?: ProjectExportBundleSummary;
  lastTraceArtifact?: RuntimeTraceArtifact;
};
type AtlasMotionQa = {
  status: "loading" | "pass" | "warn" | "fail" | "missing";
  checkedStates: string[];
  warnings: string[];
  errors: string[];
};

type AtlasMotionQaReport = {
  ok?: boolean;
  checked_states?: string[];
  warnings?: string[];
  errors?: string[];
};

type RuntimeQaScenario = "ikemen-tag-presentation";
type SourceImportOptions = {
  allowChangedSource?: boolean;
  skipNavigationGuard?: boolean;
};

const TRACE_ARTIFACT_HISTORY_LIMIT = 8;

export class App {
  private readonly spriteProvider = new CompositeSpriteProvider(new MockSpriteProvider());
  private readonly renderer = new ThreeMugenRenderer(this.spriteProvider);
  private readonly nativeHitSparks = new NativeHitSparkSpriteProvider();
  private readonly audio = new MugenAudioSystem();
  private readonly keyboard = new KeyboardInputAdapter();
  private readonly commandBuffer = new CommandBuffer();
  private readonly loader = new MugenCharacterLoader();
  private readonly stageLoader = new MugenStageLoader();
  private readonly fixtureAnimations = createFixtureAnimations();
  private inspectorRuntime = new MugenRuntime(this.fixtureAnimations);
  private matchRuntime = new MatchWorld({ p1: demoFighters[0]!, p2: demoFighters[1]! });
  private character?: MugenCharacter;
  private importedFighter?: DemoFighterDefinition;
  private importedSffProvider?: SffSpriteProvider;
  private importedStages: MugenStagePackage[] = [];
  private importedSourceBundle?: ImportedSourceBundle;
  private mode: AppMode = "match";
  private runtimeQaScenario?: RuntimeQaScenario;
  private selectedP1 = demoFighters[0]!.id;
  private selectedP2 = demoFighters[1]!.id;
  private selectedStageId = rooftopDojoStage.id;
  private activeTab: NavigatorTab = "animations";
  private studioTab: StudioTab = "workbench";
  private studioEvidenceFilter: StudioEvidenceFilter = "all";
  private studioAssetFilter: StudioAssetFilter = "all";
  private studioDebugFilter: StudioDebugFilter = "overview";
  private studioSelectedAssetId?: string;
  private studioSelectedActorId?: string;
  private pendingSourceRelinkPackageId?: string;
  private sourceImportTransaction?: SourceImportTransaction;
  private importedPackageAnalysis?: PackageAnalysisResult;
  private importedPackageAnalysisV1?: PackageAnalysisV1Result;
  private studioSourceDocument?: StudioSourceDocumentDraft;
  private studioSourceWriteReceipt?: SourceWriteReceipt;
  private studioSourceSemanticPreflightTimer?: number;
  private readonly memorySourceHandleStore = createMemorySourceHandleStore();
  private sourceHandleStore: SourceHandleStore = this.memorySourceHandleStore;
  private sourceHandleEntries: SourceHandleStoreEntry[] = [];
  private sourceHandleCapability: SourceHandleCapability = "unsupported";
  private sourceHandleStorage: SourceHandleStorage = "memory";
  private navigatorFilter = "";
  private selectedInspectorStateId?: number;
  private selectedInspectorControllerType?: string;
  private selectedInspectorControllerLine?: number;
  private selectedInspectorCommandName?: string;
  private snapshot: MugenSnapshot = this.matchRuntime.getSnapshot();
  private readonly appLogs: string[] = [];
  private readonly atlasStatusByFighter = new Map<string, "loading" | "loaded" | "fallback">(
    demoFighters.map((fighter) => [fighter.id, "loading"]),
  );
  private readonly atlasMotionQaByFighter = new Map<string, AtlasMotionQa>(
    demoFighters.map((fighter) => [fighter.id, { status: "loading", checkedStates: [], warnings: [], errors: [] }]),
  );
  private importedProjectManifest?: GameProjectManifest;
  private projectNameOverride?: string;
  private projectDirty = false;
  private projectStorageRevision?: number;
  private projectStorageConflict?: ProjectStorageConflict;
  private readonly studioEditHistory = new StudioEditHistory();
  private readonly studioAutosave = new StudioAutosave();
  private readonly assetPermissionMetadata = new Map<string, AssetPermissionMetadata>();
  private assetPermissionMetadataLoad?: Promise<void>;
  private projectImportWarnings: string[] = [];
  private storedProjects: StoredProjectEntry[] = [];
  private lastCompiledProject?: CompiledRuntimeManifest;
  private lastProjectBundle?: ProjectExportBundleSummary;
  private lastTraceArtifact?: RuntimeTraceArtifact;
  private traceArtifacts: RuntimeTraceArtifact[] = [];
  private storedTraceEvidence: StoredTraceEvidenceEntry[] = [];
  private selectedTraceFrameIndex = 0;
  private studioFocusedTrustRowId?: string;
  private studioFocusedPackageFilePath?: string;
  private studioFocusedSourcePackageId?: string;
  private studioFocusedSourcePath?: string;
  private commandPaletteOpen = false;
  private commandPaletteQuery = "";
  private commandPaletteActiveIndex = 0;
  private commandPaletteReturnFocus?: HTMLElement;
  private studioLeftDockOpen = true;
  private studioRightDockOpen = true;
  private studioFocusMode = false;
  private studioViewportDefaultsApplied = false;
  private pendingMs = 0;
  private renderBusy = false;
  private lastPanelUpdate = 0;
  private readonly htmlCache = new Map<string, string>();
  private readonly loop = createFrameLoop((deltaMs) => this.onFrame(deltaMs));

  constructor(private readonly root: HTMLElement) {
    this.spriteProvider.registerGroupRange(7000, 7002, this.nativeHitSparks, "native-hit-sparks");
  }

  start(): void {
    this.readUrlState();
    this.refreshStoredProjects();
    this.refreshStoredTraceEvidence();
    void this.refreshStoredSourceHandles();
    this.root.innerHTML = this.template();
    this.renderer.mount(this.root.querySelector<HTMLElement>("#stage")!);
    this.keyboard.start();
    this.installFileDropZone();
    this.installEvents();
    this.installNavigationGuard();
    this.installProjectStorageListener();
    this.installAudioUnlock();
    this.updateUi();
    this.loop.start();
    void this.loadAssetPermissionMetadata();
    void this.installRuntimeAtlases();
  }

  private loadAssetPermissionMetadata(): Promise<void> {
    if (this.assetPermissionMetadataLoad) {
      return this.assetPermissionMetadataLoad;
    }
    this.assetPermissionMetadataLoad = Promise.all(
      Object.entries(FIRST_PARTY_ASSET_PERMISSION_PATHS).map(async ([assetId, path]) => {
        if (this.assetPermissionMetadata.has(assetId)) {
          return;
        }
        try {
          const response = await fetch(path, { cache: "no-store" });
          if (!response.ok) {
            this.log("Asset permission metadata unavailable for " + assetId + ": HTTP " + response.status);
            return;
          }
          const metadata = parseAssetPermissionMetadata(await response.json());
          if (!metadata || metadata.assetId !== assetId || getAssetPermissionMetadataPath(assetId) !== path) {
            this.log("Asset permission metadata rejected for " + assetId + ": invalid v0 declaration");
            return;
          }
          this.assetPermissionMetadata.set(assetId, metadata);
        } catch (error) {
          this.log("Asset permission metadata failed for " + assetId + ": " + (error instanceof Error ? error.message : String(error)));
        }
      }),
    ).then(() => {
      this.updateUi();
    }).finally(() => {
      this.assetPermissionMetadataLoad = undefined;
    });
    return this.assetPermissionMetadataLoad;
  }

  private template(): string {
    return `
      <a class="skip-link" href="#stage">Skip to runtime viewport</a>
      <main class="app-shell mode-match" aria-label="MUGEN Web Sandbox workspace">
        <section class="studio-chrome" id="studio-chrome" aria-label="Studio command bar"></section>
        <aside class="pane" id="left-pane" aria-label="Project navigation">
          <div class="section workspace-header">
            <div class="workspace-brand" id="workspace-brand"></div>
            <div id="mode-controls"></div>
            <div id="workspace-summary"></div>
          </div>
          <div id="workspace-actions"></div>
          <div class="section file-loader-section">
            <div class="drop-zone" id="drop-zone">
              <div>
                <strong>Load MUGEN package</strong>
                <p>Drop a character ZIP or choose a local folder with a .def file. Files stay in this browser session.</p>
              </div>
              <div class="file-actions">
                <button type="button" data-open-zip>Choose ZIP</button>
                <button type="button" data-open-folder>Choose Folder</button>
              </div>
              <input id="zip-input" type="file" accept=".zip,application/zip" aria-label="Choose character ZIP" />
              <input id="folder-input" type="file" webkitdirectory multiple aria-label="Choose character folder" />
              <input id="project-input" type="file" accept=".json,application/json" aria-label="Open project JSON" hidden />
            </div>
          </div>
          <div id="navigator"></div>
        </aside>
        <section class="stage" id="stage" aria-label="Runtime viewport">
          <div class="stage-toolbar" aria-label="Runtime controls">
            <div class="toolbar-group toolbar-run-group">
              <span class="toolbar-label">Run</span>
              <button type="button" data-action="play-pause" data-runtime-state="pause" aria-label="Pause or resume simulation" title="Pause or resume simulation">${runtimeControlContent("pause", "Pause")}</button>
              <button type="button" data-action="step" aria-label="Advance one frame" title="Advance one frame">${runtimeControlContent("step", "1F")}</button>
              <button type="button" data-action="reset-round" aria-label="Reset current round" title="Reset current round">${runtimeControlContent("reset", "Reset")}</button>
              <button type="button" data-action="next-round" aria-label="Start next round" title="${this.snapshot.round?.match?.matchOver ? "Match over" : "Start next round"}" ${this.isInspectorRuntimeSurface() || !this.snapshot.round || this.snapshot.round.match?.matchOver || this.snapshot.round.state === "fight" || (this.snapshot.round.state === "ko" && (this.snapshot.round.postRound?.remaining ?? 1) > 0) ? "disabled" : ""}>${runtimeControlContent("step", "Next")}</button>
              <label class="speed-control" title="Playback speed">${runtimeControlContent("activity", "Speed")}
                <select data-action="speed">
                  <option value="0.5">0.5x</option>
                  <option value="1" selected>1x</option>
                  <option value="2">2x</option>
                  <option value="4">4x</option>
                </select>
              </label>
            </div>
            <div class="toolbar-group toolbar-view-group">
              <span class="toolbar-label">View</span>
              <label class="toggle-pill" title="Toggle grid" aria-label="Toggle grid"><input type="checkbox" data-toggle="showGrid" checked />${runtimeControlContent("grid", "Grid")}</label>
              <label class="toggle-pill" title="Toggle axis" aria-label="Toggle axis"><input type="checkbox" data-toggle="showAxis" checked />${runtimeControlContent("axis", "Axis")}</label>
              <label class="toggle-pill" title="Show Clsn1 hitboxes" aria-label="Show Clsn1 hitboxes"><input type="checkbox" data-toggle="showClsn1" checked />${runtimeControlContent("hit", "Hit")}</label>
              <label class="toggle-pill" title="Show Clsn2 hurtboxes" aria-label="Show Clsn2 hurtboxes"><input type="checkbox" data-toggle="showClsn2" checked />${runtimeControlContent("hurt", "Hurt")}</label>
            </div>
          </div>
          <div class="round-hud" id="round-hud"></div>
          <div class="stage-status" id="stage-status" aria-live="polite"></div>
          <div class="studio-stage-deck" id="studio-stage-deck"></div>
          <div class="touch-controls" aria-label="Touch controls">
            <div class="touch-cluster touch-cluster-move">
              <button type="button" aria-label="Move left" data-touch="B">L</button>
              <button type="button" aria-label="Crouch" data-touch="D">D</button>
              <button type="button" aria-label="Move right" data-touch="F">R</button>
              <button type="button" aria-label="Jump" data-touch="U">U</button>
            </div>
            <div class="touch-cluster touch-cluster-attack">
              <button type="button" aria-label="Punch" data-touch="a">P</button>
              <button type="button" aria-label="Kick" data-touch="x">K</button>
            </div>
          </div>
        </section>
        <aside class="pane pane-right" id="right-pane" aria-label="Runtime inspector"></aside>
        <section class="console" id="console" aria-label="Console and warnings"></section>
        <div id="command-palette-root"></div>
      </main>
    `;
  }

  private installFileDropZone(): void {
    const folderInput = this.root.querySelector<HTMLInputElement>("#folder-input");
    folderInput?.setAttribute("webkitdirectory", "");

    new FileDropZone(this.root.querySelector<HTMLElement>("#drop-zone")!, {
      onZip: (file) => {
        void this.loadZip(file);
      },
      onFolder: (files) => {
        void this.loadFolder(files);
      },
    }).mount();
  }

  private installNavigationGuard(): void {
    window.addEventListener("beforeunload", (event) => {
      if (!needsStudioProjectNavigationGuard(this.mode, this.projectDirty || this.studioSourceDocument?.dirty === true)) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    });
  }

  private installProjectStorageListener(): void {
    window.addEventListener("storage", (event) => {
      if (event.key !== PROJECT_STORAGE_KEY && event.key !== null) {
        return;
      }
      this.handleExternalProjectStorageChange();
    });
  }

  private handleExternalProjectStorageChange(): void {
    this.refreshStoredProjects();
    const projectId = this.importedProjectManifest?.id;
    if (!projectId || this.mode !== "studio") {
      this.updateUi();
      return;
    }
    const actualRevision = this.storedProjects.find((entry) => entry.id === projectId)?.revision ?? 0;
    const expectedRevision = this.projectStorageRevision ?? 0;
    if (actualRevision === expectedRevision) {
      return;
    }
    this.projectStorageConflict = { projectId, expectedRevision, actualRevision };
    this.studioAutosave.cancel();
    this.log(
      `${this.projectDirty ? "Local edits retained" : "External update detected"} for project ${projectId}; save is paused until the revision is resolved.`,
    );
    this.updateUi();
  }

  private confirmStudioProjectNavigation(destination: string): boolean {
    if (!needsStudioProjectNavigationGuard(this.mode, this.projectDirty || this.studioSourceDocument?.dirty === true)) {
      return true;
    }
    return window.confirm(studioProjectDiscardMessage(destination));
  }

  private installEvents(): void {
    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const action = target.closest<HTMLElement>("[data-action]")?.dataset.action;
      const commandId = target.closest<HTMLElement>("[data-command-id]")?.dataset.commandId;
      const trustRowId = target.closest<HTMLElement>("[data-trust-row-id]")?.dataset.trustRowId;
      if (trustRowId) {
        this.studioFocusedTrustRowId = trustRowId;
      }
      if (commandId) {
        this.executeCommandPaletteAction(commandId);
        return;
      }
      if (action === "open-command-palette") {
        this.openCommandPalette();
        return;
      }
      if (action === "close-command-palette") {
        this.closeCommandPalette();
        return;
      }
      if (action === "toggle-left-dock") {
        this.studioLeftDockOpen = !this.studioLeftDockOpen;
        this.studioFocusMode = false;
        this.updateUi();
        return;
      }
      if (action === "toggle-right-dock") {
        this.studioRightDockOpen = !this.studioRightDockOpen;
        this.studioFocusMode = false;
        this.updateUi();
        return;
      }
      if (action === "toggle-focus-mode") {
        this.studioFocusMode = !this.studioFocusMode;
        this.updateUi();
        return;
      }
      if (action === "play-pause") {
        const playing = !this.snapshot.playing;
        this.snapshot =
          this.isInspectorRuntimeSurface()
            ? this.inspectorRuntime.dispatch({ type: "set-playing", playing })
            : this.matchRuntime.dispatch({ type: "set-playing", playing });
        target.textContent = playing ? "Pause" : "Play";
        this.updateUi();
      } else if (action === "step") {
        this.snapshot =
          this.isInspectorRuntimeSurface()
            ? this.inspectorRuntime.dispatch({ type: "step", ticks: 1 })
            : this.matchRuntime.step({ p1: this.keyboard.getState() }, { force: true });
        if (!this.isInspectorRuntimeSurface()) {
          this.audio.processSnapshot(this.snapshot);
        }
        this.updateUi();
      } else if (action === "reset-round") {
        if (this.isInspectorRuntimeSurface()) {
          this.resetInspectorRuntime();
        } else {
          this.audio.stopAll();
          this.matchRuntime.dispatch({ type: "reset" });
          this.snapshot = this.getActiveSnapshot();
        }
        this.updateUi();
      } else if (action === "next-round") {
        if (!this.isInspectorRuntimeSurface() && !this.snapshot.round?.match?.matchOver) {
          this.audio.stopAll();
          this.snapshot = this.matchRuntime.dispatch({ type: "next-round" });
          this.updateUi();
        }
      } else if (action === "export-report") {
        this.exportCompatibilityReport();
      } else if (action === "export-project") {
        this.exportStudioProjectManifest();
      } else if (action === "open-project") {
        if (this.confirmStudioProjectNavigation("open another project")) {
          this.root.querySelector<HTMLInputElement>("#project-input")?.click();
        }
      } else if (action === "save-project-local") {
        this.saveCurrentProjectLocal();
      } else if (action === "reload-project-remote") {
        this.reloadExternalProject();
      } else if (action === "keep-project-local") {
        this.keepLocalProjectCopy();
      } else if (action === "undo-project-edit") {
        this.undoStudioProjectEdit();
      } else if (action === "redo-project-edit") {
        this.redoStudioProjectEdit();
      } else if (action === "compile-project") {
        this.compileCurrentProject();
      } else if (action === "export-runtime") {
        this.exportRuntimeManifest();
      } else if (action === "export-package") {
        void this.exportProjectBundle();
      } else if (action === "export-trace-artifact") {
        this.exportRuntimeTraceArtifact();
      } else if (action === "relink-source") {
        const sourcePackageId = target.closest<HTMLElement>("[data-source-package-id]")?.dataset.sourcePackageId;
        this.startSourcePackageRelink(sourcePackageId, "zip");
      } else if (action === "relink-source-folder") {
        const sourcePackageId = target.closest<HTMLElement>("[data-source-package-id]")?.dataset.sourcePackageId;
        this.startSourcePackageRelink(sourcePackageId, "folder");
      } else if (action === "link-source-handle" || action === "request-source-handle-permission" || action === "recover-source-handle") {
        const sourcePackageId = target.closest<HTMLElement>("[data-source-package-id]")?.dataset.sourcePackageId;
        void this.handleSourceHandleAction(sourcePackageId, action);
      } else if (action === "save-source-document") {
        void this.saveStudioSourceDocument();
      } else if (action === "discard-source-document") {
        this.discardStudioSourceDocument();
      } else if (action === "load-zip") {
        this.root.querySelector<HTMLInputElement>("#zip-input")?.click();
      } else if (action === "load-folder") {
        this.root.querySelector<HTMLInputElement>("#folder-input")?.click();
      }

      const packageFilePath = target.closest<HTMLElement>("[data-package-file-path]")?.dataset.packageFilePath;
      if (packageFilePath) {
        this.studioFocusedPackageFilePath = packageFilePath;
        this.mode = "studio";
        this.studioTab = "build";
        this.writeUrlState();
        this.updateUi();
        this.scrollPackageFilePathIntoView(packageFilePath);
        return;
      }

      const sourcePathNode = target.closest<HTMLElement>("[data-source-path]");
      const sourcePath = sourcePathNode?.dataset.sourcePath;
      if (sourcePath) {
        this.studioFocusedSourcePackageId = sourcePathNode?.dataset.sourcePackageId;
        this.studioFocusedSourcePath = sourcePath;
        this.openStudioSourceDocument(this.studioFocusedSourcePackageId, sourcePath);
        this.mode = "studio";
        this.studioTab = "build";
        this.writeUrlState();
        this.updateUi();
        this.scrollSourcePathIntoView(sourcePath, this.studioFocusedSourcePackageId);
        return;
      }

      const mode = target.closest<HTMLElement>("[data-mode]")?.dataset.mode as AppMode | undefined;
      if (mode) {
        this.mode = mode;
        this.snapshot = this.getActiveSnapshot();
        this.writeUrlState();
        this.updateUi();
      }

      const tab = target.closest<HTMLElement>("[data-tab]")?.dataset.tab as NavigatorTab | undefined;
      if (tab) {
        this.activeTab = tab;
        this.writeUrlState();
        this.updateUi();
      }

      const studioTab = parseStudioTab(target.closest<HTMLElement>("[data-studio-tab]")?.dataset.studioTab);
      if (studioTab) {
        this.studioTab = studioTab;
        this.mode = "studio";
        this.snapshot = this.getActiveSnapshot();
        this.writeUrlState();
        this.updateUi();
        this.scrollNavigatorToTop();
        this.scrollRightPaneToTop();
      }

      const evidenceFilter = parseStudioEvidenceFilter(target.closest<HTMLElement>("[data-evidence-filter]")?.dataset.evidenceFilter);
      if (evidenceFilter) {
        this.studioEvidenceFilter = evidenceFilter;
        this.mode = "studio";
        this.studioTab = "evidence";
        this.writeUrlState();
        this.updateUi();
      }

      const assetFilter = parseStudioAssetFilter(target.closest<HTMLElement>("[data-asset-filter]")?.dataset.assetFilter);
      if (assetFilter) {
        this.studioAssetFilter = assetFilter;
        this.mode = "studio";
        this.studioTab = "assets";
        this.studioSelectedAssetId = this.resolveSelectedStudioAssetId();
        this.writeUrlState();
        this.updateUi();
      }

      const studioAssetId = target.closest<HTMLElement>("[data-studio-asset-id]")?.dataset.studioAssetId;
      if (studioAssetId) {
        this.studioSelectedAssetId = studioAssetId;
        this.mode = "studio";
        this.studioTab = "assets";
        this.writeUrlState();
        this.updateUi();
      }

      const studioStageId = target.closest<HTMLElement>("[data-studio-stage-id]")?.dataset.studioStageId;
      if (studioStageId) {
        const before = this.captureStudioProjectEditState();
        this.selectedStageId = studioStageId;
        this.markProjectDirty();
        this.recordStudioProjectEdit(before);
        this.studioSelectedAssetId = studioStageId;
        this.invalidateBuildOutputs();
        this.rebuildMatchRuntime();
        this.mode = "studio";
        this.studioTab = "stage";
        this.snapshot = this.matchRuntime.getSnapshot();
        this.writeUrlState();
        this.updateUi();
      }

      const debugFilter = parseStudioDebugFilter(target.closest<HTMLElement>("[data-debug-filter]")?.dataset.debugFilter);
      if (debugFilter) {
        this.studioDebugFilter = debugFilter;
        this.mode = "studio";
        this.studioTab = "debug";
        this.writeUrlState();
        this.updateUi();
        this.scrollRightPaneToTop();
      }

      const debugActorId = target.closest<HTMLElement>("[data-debug-actor-id]")?.dataset.debugActorId;
      if (debugActorId) {
        this.studioSelectedActorId = debugActorId;
        this.mode = "studio";
        this.studioTab = "debug";
        this.writeUrlState();
        this.updateUi();
        this.scrollRightPaneToTop();
      }

      const debugStateFilter = target.closest<HTMLElement>("[data-debug-state-filter]")?.dataset.debugStateFilter;
      if (debugStateFilter) {
        this.openInspectorState(this.parseInspectorStateId(debugStateFilter), debugStateFilter);
      }

      const debugControllerFilter = target.closest<HTMLElement>("[data-debug-controller-filter]")?.dataset.debugControllerFilter;
      if (debugControllerFilter) {
        this.openInspectorController(debugControllerFilter);
      }

      const debugCommandFilter = target.closest<HTMLElement>("[data-debug-command-filter]")?.dataset.debugCommandFilter;
      if (debugCommandFilter) {
        this.openInspectorCommand(debugCommandFilter);
      }

      const inspectorControllerType = target.closest<HTMLElement>("[data-inspector-controller-type]")?.dataset.inspectorControllerType;
      if (inspectorControllerType) {
        const controllerNode = target.closest<HTMLElement>("[data-inspector-controller-type]");
        this.openInspectorController(
          inspectorControllerType,
          this.parseOptionalNumber(controllerNode?.dataset.inspectorStateId),
          this.parseOptionalNumber(controllerNode?.dataset.inspectorControllerLine),
        );
        return;
      }

      const inspectorStateId = this.parseOptionalNumber(target.closest<HTMLElement>("[data-inspector-state-id]")?.dataset.inspectorStateId);
      if (inspectorStateId !== undefined) {
        this.openInspectorState(inspectorStateId, `state ${inspectorStateId}`);
        return;
      }

      const inspectorCommandName = target.closest<HTMLElement>("[data-inspector-command-name]")?.dataset.inspectorCommandName;
      if (inspectorCommandName) {
        this.openInspectorCommand(inspectorCommandName);
        return;
      }

      const replacementAssetId = target.closest<HTMLElement>("[data-asset-replacement-id]")?.dataset.assetReplacementId;
      if (replacementAssetId) {
        this.applyStudioAssetReplacement(replacementAssetId);
      }

      const traceFrameIndexRaw = target.closest<HTMLElement>("[data-trace-frame-index]")?.dataset.traceFrameIndex;
      if (traceFrameIndexRaw) {
        this.selectedTraceFrameIndex = Math.max(0, Number(traceFrameIndexRaw) || 0);
        this.mode = "studio";
        this.studioTab = "evidence";
        this.writeUrlState();
        this.updateUi();
        this.scrollRightPaneToTop();
      }

      const actionIdRaw = target.closest<HTMLElement>("[data-action-id]")?.dataset.actionId;
      if (actionIdRaw && this.mode === "inspect") {
        this.snapshot = this.inspectorRuntime.dispatch({ type: "select-action", actionId: Number(actionIdRaw) });
        this.updateUi();
      }

      const studioActionIdRaw = target.closest<HTMLElement>("[data-studio-action-id]")?.dataset.studioActionId;
      if (studioActionIdRaw && this.mode === "studio" && this.studioTab === "inspector") {
        this.snapshot = this.inspectorRuntime.dispatch({ type: "select-action", actionId: Number(studioActionIdRaw) });
        this.updateUi();
      }

      const storedProjectId = target.closest<HTMLElement>("[data-stored-project-id]")?.dataset.storedProjectId;
      if (storedProjectId) {
        this.openStoredProject(storedProjectId);
      }
    });

    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      if (target instanceof HTMLSelectElement && target.dataset.action === "speed") {
        this.snapshot =
          this.isInspectorRuntimeSurface()
            ? this.inspectorRuntime.dispatch({ type: "set-speed", speed: Number(target.value) })
            : this.matchRuntime.dispatch({ type: "set-speed", speed: Number(target.value) });
      }
      if (target instanceof HTMLSelectElement && target.dataset.fighterSelect) {
        if (target.dataset.fighterSelect === "p1") {
          this.selectedP1 = target.value;
        } else {
          this.selectedP2 = target.value;
        }
        this.invalidateBuildOutputs();
        this.rebuildMatchRuntime();
        this.mode = "match";
        this.snapshot = this.matchRuntime.getSnapshot();
        this.writeUrlState();
        this.updateUi();
      }
      const studioFighterSelect = target.dataset.studioFighterSelect;
      if (target instanceof HTMLSelectElement && studioFighterSelect) {
        const before = this.captureStudioProjectEditState();
        if (studioFighterSelect === "p1") {
          this.selectedP1 = target.value;
        } else {
          this.selectedP2 = target.value;
        }
        this.invalidateBuildOutputs();
        this.markProjectDirty();
        this.recordStudioProjectEdit(before);
        this.rebuildMatchRuntime();
        this.mode = "studio";
        this.snapshot = this.matchRuntime.getSnapshot();
        this.writeUrlState();
        this.updateUi();
      }
      if (target instanceof HTMLSelectElement && target.dataset.stageSelect) {
        this.selectedStageId = target.value;
        this.invalidateBuildOutputs();
        this.rebuildMatchRuntime();
        this.mode = "match";
        this.snapshot = this.matchRuntime.getSnapshot();
        this.writeUrlState();
        this.updateUi();
      }
      if (target instanceof HTMLSelectElement && target.dataset.studioStageSelect) {
        const before = this.captureStudioProjectEditState();
        this.selectedStageId = target.value;
        this.invalidateBuildOutputs();
        this.markProjectDirty();
        this.recordStudioProjectEdit(before);
        this.rebuildMatchRuntime();
        this.mode = "studio";
        this.snapshot = this.matchRuntime.getSnapshot();
        this.writeUrlState();
        this.updateUi();
      }
      if (target instanceof HTMLInputElement && target.dataset.toggle) {
        const toggle = {
          type: "toggle" as const,
          key: target.dataset.toggle as "showClsn1" | "showClsn2" | "showAxis" | "showGrid",
          value: target.checked,
        };
        this.snapshot = this.isInspectorRuntimeSurface() ? this.inspectorRuntime.dispatch(toggle) : this.matchRuntime.dispatch(toggle);
      }
      if (target instanceof HTMLInputElement && target.id === "project-input") {
        const file = target.files?.[0];
        if (file) {
          void this.loadProjectManifest(file);
          target.value = "";
        }
      }
      if (target instanceof HTMLInputElement && target.dataset.projectName !== undefined) {
        this.applyProjectName(target.value);
      }
    });

    this.root.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      if (target.dataset.sourceEditor !== undefined) {
        const draft = this.studioSourceDocument;
        if (draft) {
          this.studioSourceDocument = updateStudioSourceDocumentDraft(draft, target.value);
          this.refreshStudioSourceEditorStatus();
          this.scheduleStudioSourceSemanticPreflight();
        }
        return;
      }
      if (target.dataset.commandPaletteSearch !== undefined) {
        this.commandPaletteQuery = target.value;
        this.commandPaletteActiveIndex = 0;
        const actions = this.getVisibleCommandPaletteActions();
        this.setHtml("#command-palette-results", this.renderCommandPaletteResults(actions));
        this.syncCommandPaletteActiveDescendant(actions);
        return;
      }
      if (target.dataset.filter === "navigator") {
        this.navigatorFilter = target.value;
        if (this.mode === "inspect") {
          this.writeUrlState();
        }
        this.updateUi();
      }
    });

    window.addEventListener("resize", () => {
      this.renderer.resize();
      void this.renderer.render(this.getRenderableSnapshot());
    });

    window.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        this.openCommandPalette();
        return;
      }
      if (this.commandPaletteOpen && this.handleCommandPaletteKeydown(event)) {
        return;
      }
      if (event.key === "Escape" && this.commandPaletteOpen) {
        event.preventDefault();
        this.closeCommandPalette();
        return;
      }
      if (!this.commandPaletteOpen && this.mode === "studio" && (event.ctrlKey || event.metaKey)) {
        const key = event.key.toLowerCase();
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            this.redoStudioProjectEdit();
          } else {
            this.undoStudioProjectEdit();
          }
          return;
        }
        if (key === "y") {
          event.preventDefault();
          this.redoStudioProjectEdit();
          return;
        }
      }
      if (event.key === "Tab" && this.commandPaletteOpen) {
        this.trapCommandPaletteFocus(event);
      }
    });

    this.root.addEventListener("pointerdown", (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-touch]");
      if (!target) {
        return;
      }
      event.preventDefault();
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic touch events in QA do not always register an active pointer.
      }
      target.classList.add("is-pressed");
      this.keyboard.setVirtualIntent(target.dataset.touch!, true);
    });

    const releaseTouch = (event: PointerEvent): void => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-touch]");
      if (!target) {
        return;
      }
      target.classList.remove("is-pressed");
      this.keyboard.setVirtualIntent(target.dataset.touch!, false);
    };
    this.root.addEventListener("pointerup", releaseTouch);
    this.root.addEventListener("pointercancel", releaseTouch);
    this.root.addEventListener("lostpointercapture", releaseTouch);
  }

  private installAudioUnlock(): void {
    const unlock = (): void => {
      void this.audio.unlock();
    };
    this.root.addEventListener("pointerdown", unlock, { capture: true });
    this.root.addEventListener("click", unlock, { capture: true });
    window.addEventListener("keydown", unlock, { capture: true });
  }

  private async installRuntimeAtlases(): Promise<void> {
    const atlasVersion = "walk-generated-2026-06-24";
    const atlasRoutes = [
      { fighterId: "nova-boxer", label: "Nova Boxer", path: "nova-boxer", minGroup: 10000, maxGroup: 10999 },
      { fighterId: "mira-volt", label: "Mira Volt", path: "mira-volt", minGroup: 11000, maxGroup: 11999 },
      { fighterId: "rook-apprentice", label: "Rook Apprentice", path: "rook-apprentice", minGroup: 14000, maxGroup: 14999 },
    ];
    const visibleFighterIds = new Set([this.selectedP1, this.selectedP2]);
    atlasRoutes.sort((left, right) => Number(!visibleFighterIds.has(left.fighterId)) - Number(!visibleFighterIds.has(right.fighterId)));
    for (const route of atlasRoutes) {
      if (!visibleFighterIds.has(route.fighterId)) {
        await this.waitForAtlasLoadSlot();
      }
      try {
        const provider = await AtlasSpriteProvider.fromUrls(
          `/characters/${route.path}/sprite-sheet-alpha.png?v=${atlasVersion}`,
          `/characters/${route.path}/manifest.json?v=${atlasVersion}`,
        );
        this.spriteProvider.registerGroupRange(route.minGroup, route.maxGroup, provider);
        this.atlasStatusByFighter.set(route.fighterId, "loaded");
        const motionQa = await this.loadAtlasMotionQa(route.path, atlasVersion);
        this.atlasMotionQaByFighter.set(route.fighterId, motionQa);
        if (motionQa.status !== "pass") {
          this.log(`${route.label} atlas loaded but locomotion QA is ${motionQa.status}`);
        }
        this.log(`${route.label} atlas loaded from sprite-atlas-builder manifest`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.atlasStatusByFighter.set(route.fighterId, "fallback");
        this.atlasMotionQaByFighter.set(route.fighterId, {
          status: "fail",
          checkedStates: [],
          warnings: [],
          errors: [message],
        });
        this.log(`${route.label} atlas failed; using mock fallback: ${message}`);
      }
      this.updateUi();
    }
  }

  private waitForAtlasLoadSlot(): Promise<void> {
    return new Promise((resolve) => {
      const idleCallback = window.requestIdleCallback;
      if (idleCallback) {
        idleCallback(() => resolve(), { timeout: 700 });
        return;
      }
      window.setTimeout(resolve, 120);
    });
  }

  private async loadAtlasMotionQa(path: string, atlasVersion: string): Promise<AtlasMotionQa> {
    try {
      const response = await fetch(`/characters/${path}/qa/motion-variation-report.json?v=${atlasVersion}`);
      if (!response.ok) {
        return { status: "missing", checkedStates: [], warnings: [`HTTP ${response.status}`], errors: [] };
      }
      const report = (await response.json()) as AtlasMotionQaReport;
      const warnings = report.warnings ?? [];
      const errors = report.errors ?? [];
      return {
        status: errors.length > 0 || report.ok === false ? "fail" : warnings.length > 0 ? "warn" : "pass",
        checkedStates: report.checked_states ?? [],
        warnings,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { status: "missing", checkedStates: [], warnings: [message], errors: [] };
    }
  }

  private readUrlState(): void {
    const params = new URLSearchParams(window.location.search);
    const scenario = params.get("scenario");
    this.runtimeQaScenario = scenario === "ikemen-tag-presentation" ? scenario : undefined;
    const mode = params.get("mode");
    if (mode === "match" || mode === "inspect" || mode === "studio") {
      this.mode = mode;
    }

    const p1 = params.get("p1");
    const p2 = params.get("p2");
    if (p1 && this.findFighter(p1)) {
      this.selectedP1 = p1;
    }
    if (p2 && this.findFighter(p2)) {
      this.selectedP2 = p2;
    }
    const stage = params.get("stage");
    if (stage) {
      this.selectedStageId = stage;
    }
    this.rebuildMatchRuntime();

    const tab = params.get("tab");
    if (tab === "animations" || tab === "states" || tab === "commands") {
      this.activeTab = tab;
    }
    this.navigatorFilter = params.get("filter") ?? "";
    this.selectedInspectorStateId = this.parseOptionalNumber(params.get("state"));
    this.selectedInspectorControllerType = params.get("controller") ?? undefined;
    this.selectedInspectorControllerLine = this.parseOptionalNumber(params.get("controllerLine"));
    this.selectedInspectorCommandName = params.get("command") ?? undefined;
    this.studioTab = parseStudioTab(params.get("studio")) ?? this.studioTab;
    this.studioEvidenceFilter = parseStudioEvidenceFilter(params.get("evidence")) ?? this.studioEvidenceFilter;
    this.studioAssetFilter = parseStudioAssetFilter(params.get("asset")) ?? this.studioAssetFilter;
    this.studioDebugFilter = parseStudioDebugFilter(params.get("debug")) ?? this.studioDebugFilter;
    this.studioSelectedAssetId = params.get("assetId") ?? undefined;
    this.studioSelectedActorId = params.get("actor") ?? undefined;
    this.snapshot = this.getActiveSnapshot();
  }

  private writeUrlState(): void {
    const params = new URLSearchParams();
    params.set("mode", this.mode);
    params.set("p1", this.selectedP1);
    params.set("p2", this.selectedP2);
    params.set("stage", this.selectedStageId);
    if (this.runtimeQaScenario) {
      params.set("scenario", this.runtimeQaScenario);
    }
    if (this.mode === "inspect") {
      params.set("tab", this.activeTab);
      if (this.navigatorFilter.trim()) {
        params.set("filter", this.navigatorFilter.trim());
      }
      if (this.selectedInspectorStateId !== undefined) {
        params.set("state", String(this.selectedInspectorStateId));
      }
      if (this.selectedInspectorControllerType) {
        params.set("controller", this.selectedInspectorControllerType);
      }
      if (this.selectedInspectorControllerLine !== undefined) {
        params.set("controllerLine", String(this.selectedInspectorControllerLine));
      }
      if (this.activeTab === "commands" && this.selectedInspectorCommandName) {
        params.set("command", this.selectedInspectorCommandName);
      }
    }
    if (this.mode === "studio") {
      params.set("studio", this.studioTab);
      if (this.studioTab === "evidence" && this.studioEvidenceFilter !== "all") {
        params.set("evidence", this.studioEvidenceFilter);
      }
      if (this.studioTab === "assets" && this.studioAssetFilter !== "all") {
        params.set("asset", this.studioAssetFilter);
      }
      if (this.studioTab === "assets") {
        const assetId = this.resolveSelectedStudioAssetId();
        if (assetId) {
          params.set("assetId", assetId);
        }
      }
      if (this.studioTab === "debug") {
        const actorId = this.getStudioDebugSelection().selectedActorId;
        if (actorId) {
          params.set("actor", actorId);
        }
        if (this.studioDebugFilter !== "overview") {
          params.set("debug", this.studioDebugFilter);
        }
      }
    }
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  private async loadZip(file: File, options: SourceImportOptions = {}): Promise<boolean> {
    if (!options.skipNavigationGuard && !this.confirmStudioProjectNavigation("load a new source package")) {
      return false;
    }
    this.log(`Loading ZIP ${file.name}`);
    try {
      const source = new ZipCharacterSource(file);
      const vfs = await source.load();
      const character = await this.loader.load(source.name, vfs);
      const stages = await this.stageLoader.loadAll(source.name, vfs);
      const fingerprint = await fingerprintVirtualFileSystem(vfs);
      const sourceBundle = { sourceName: source.name, sourceKind: "zip" as const, vfs, fileCount: vfs.listFiles().length, fingerprint };
      const transaction = this.prepareSourceImportTransaction(sourceBundle, options);
      if (transaction.status === "rejected") {
        this.rejectSourceImportTransaction(transaction);
        return false;
      }
      this.useCharacter(character, stages, sourceBundle, transaction);
      return true;
    } catch (error) {
      this.log(`ZIP rejected: ${error instanceof Error ? error.message : String(error)}`);
      this.updateUi();
      return false;
    }
  }

  private async loadFolder(
    files: FileList | readonly (File | FolderCharacterSourceFile)[],
    options: SourceImportOptions = {},
  ): Promise<boolean> {
    if (!options.skipNavigationGuard && !this.confirmStudioProjectNavigation("load a new source package")) {
      return false;
    }
    this.log(`Loading folder (${files.length} files)`);
    try {
      const source = new FolderCharacterSource(files);
      const vfs = await source.load();
      const character = await this.loader.load(source.name, vfs);
      const stages = await this.stageLoader.loadAll(source.name, vfs);
      const fingerprint = await fingerprintVirtualFileSystem(vfs);
      const sourceBundle = { sourceName: source.name, sourceKind: "folder" as const, vfs, fileCount: vfs.listFiles().length, fingerprint };
      const transaction = this.prepareSourceImportTransaction(sourceBundle, options);
      if (transaction.status === "rejected") {
        this.rejectSourceImportTransaction(transaction);
        return false;
      }
      this.useCharacter(character, stages, sourceBundle, transaction);
      return true;
    } catch (error) {
      this.log(`Folder rejected: ${error instanceof Error ? error.message : String(error)}`);
      this.updateUi();
      return false;
    }
  }

  private prepareSourceImportTransaction(
    sourceBundle: ImportedSourceBundle,
    options: SourceImportOptions = {},
  ): SourceImportTransaction {
    return prepareSourceImportTransaction(
      this.importedProjectManifest,
      {
        name: sourceBundle.sourceName,
        kind: sourceBundle.sourceKind,
        fileCount: sourceBundle.fileCount,
        paths: sourceBundle.vfs.listFiles(),
        fingerprint: sourceBundle.fingerprint.digest,
        byteLength: sourceBundle.fingerprint.byteLength,
        fileDigests: sourceBundle.fingerprint.files,
      },
      this.pendingSourceRelinkPackageId,
      { allowChangedSource: options.allowChangedSource },
    );
  }

  private rejectSourceImportTransaction(transaction: SourceImportTransaction): void {
    this.pendingSourceRelinkPackageId = undefined;
    this.sourceImportTransaction = transaction;
    this.projectImportWarnings = this.projectImportWarnings.filter((warning) => !isSourcePackageRelinkWarning(warning));
    for (const warning of transaction.warnings) {
      this.projectImportWarnings.push(warning);
      this.log(`Project manifest warning: ${warning}`);
    }
    this.log(`Source import rejected: ${transaction.reason}; current runtime/source session retained.`);
    this.updateUi();
  }

  private startSourcePackageRelink(sourcePackageId: string | undefined, kind: "zip" | "folder"): void {
    this.pendingSourceRelinkPackageId = sourcePackageId;
    const sourcePackage = sourcePackageId ? this.getProjectSourcePackages().find((item) => item.id === sourcePackageId) : undefined;
    this.log(`Relink requested for ${sourcePackage?.name ?? "missing source package"} via ${kind.toUpperCase()}`);
    this.root.querySelector<HTMLInputElement>(kind === "zip" ? "#zip-input" : "#folder-input")?.click();
  }

  private async loadProjectManifest(file: File): Promise<void> {
    this.log(`Opening project manifest ${file.name}`);
    const parsed = parseGameProjectManifestJson(await file.text());
    if (!parsed.manifest) {
      this.projectImportWarnings = parsed.errors;
      for (const error of parsed.errors) {
        this.log(`Project manifest rejected: ${error}`);
      }
      this.updateUi();
      return;
    }
    this.applyProjectManifest(parsed.manifest, parsed.warnings);
  }

  private refreshStoredProjects(): void {
    try {
      this.storedProjects = listStoredProjects(window.localStorage);
    } catch (error) {
      this.storedProjects = [];
      this.log(`Local project storage unavailable: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private refreshStoredTraceEvidence(): void {
    try {
      this.storedTraceEvidence = listStoredTraceEvidence(window.localStorage);
    } catch (error) {
      this.storedTraceEvidence = [];
      this.log(`Local evidence storage unavailable: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async refreshStoredSourceHandles(): Promise<void> {
    const host = this.getSourceHandleBrowserHost();
    const hadStoredEntries = this.sourceHandleEntries.length > 0;
    this.sourceHandleCapability = detectSourceHandleCapability(host);
    this.sourceHandleStorage = detectSourceHandleStorage(host);
    this.sourceHandleStore = createIndexedDbSourceHandleStore(host.indexedDB) ?? this.memorySourceHandleStore;
    let shouldRefreshUi = false;
    try {
      this.sourceHandleEntries = await this.sourceHandleStore.list();
    } catch (error) {
      this.sourceHandleStorage = "memory";
      this.sourceHandleStore = this.memorySourceHandleStore;
      this.sourceHandleEntries = await this.memorySourceHandleStore.list();
      this.log(`Persistent source handle storage unavailable: ${error instanceof Error ? error.message : String(error)}`);
      shouldRefreshUi = true;
    }
    if (shouldRefreshUi || hadStoredEntries || this.sourceHandleEntries.length > 0) {
      this.updateUi();
    }
  }

  private getSourceHandleBrowserHost(): SourceHandleBrowserHost {
    return window as Window & SourceHandleBrowserHost;
  }

  private async handleSourceHandleAction(
    sourcePackageId: string | undefined,
    action: "link-source-handle" | "request-source-handle-permission" | "recover-source-handle",
  ): Promise<void> {
    const sourcePackage = sourcePackageId ? this.getProjectSourcePackages().find((item) => item.id === sourcePackageId) : undefined;
    if (!sourcePackage) {
      this.log("Source handle action ignored: source package is unavailable.");
      this.updateUi();
      return;
    }
    const existing = this.sourceHandleEntries.find((entry) => entry.record.sourcePackageId === sourcePackage.id);
    try {
      const host = this.getSourceHandleBrowserHost();
      const handle = existing?.handle ?? (action === "link-source-handle" ? await pickSourceHandle(host, sourcePackage.kind) : undefined);
      if (!handle) {
        this.log(`No source handle selected for ${sourcePackage.name}.`);
        this.updateUi();
        return;
      }
      const permission = await requestSourceHandlePermission(handle);
      const previousFingerprint = existing?.record.observedFingerprint;
      if (permission !== "granted") {
        await this.persistSourceHandle(sourcePackage, handle, permission, previousFingerprint, existing?.record.observedByteLength);
        this.log(`Source handle for ${sourcePackage.name} remains ${permission}; no source bytes were read.`);
        this.updateUi();
        return;
      }

      const shouldRecover = action === "recover-source-handle" || action === "link-source-handle" || sourcePackage.status !== "linked";
      if (shouldRecover) {
        this.pendingSourceRelinkPackageId = sourcePackage.id;
        const accepted = sourcePackage.kind === "folder"
          ? await this.loadFolder(await readSourceHandleFolder(handle))
          : await this.loadZip(await readSourceHandleFile(handle));
        if (!accepted && this.pendingSourceRelinkPackageId === sourcePackage.id) {
          this.pendingSourceRelinkPackageId = undefined;
        }
        const rejectedFingerprint = this.sourceImportTransaction?.status === "rejected"
          ? this.sourceImportTransaction.fingerprint
          : undefined;
        const activePackage = this.getProjectSourcePackages().find((item) => item.id === sourcePackage.id) ?? sourcePackage;
        const observed = accepted ? this.importedSourceBundle?.fingerprint : undefined;
        await this.persistSourceHandle(
          accepted ? activePackage : sourcePackage,
          handle,
          permission,
          observed?.digest ?? rejectedFingerprint ?? previousFingerprint,
          observed?.byteLength ?? existing?.record.observedByteLength,
        );
        this.log(accepted
          ? `Recovered source package ${sourcePackage.name} from its persistent handle.`
          : `Source handle read completed but the package was not committed; the current session was retained.`);
        this.updateUi();
        return;
      }

      await this.persistSourceHandle(sourcePackage, handle, permission, previousFingerprint, existing?.record.observedByteLength);
      this.log(`Source handle linked for ${sourcePackage.name}.`);
      this.updateUi();
    } catch (error) {
      this.log(`Source handle recovery failed: ${error instanceof Error ? error.message : String(error)}`);
      this.updateUi();
    }
  }

  private openStudioSourceDocument(sourcePackageId: string | undefined, sourcePath: string): void {
    if (!sourcePackageId) {
      return;
    }
    const current = this.studioSourceDocument;
    if (
      current?.dirty &&
      (current.sourcePackageId !== sourcePackageId || current.path !== sourcePath) &&
      !window.confirm(studioProjectDiscardMessage("open another source file"))
    ) {
      return;
    }
    this.cancelStudioSourceSemanticPreflight();
    const vfsPath = this.resolveStudioSourceVfsPath(sourcePath);
    const text = vfsPath ? this.importedSourceBundle?.vfs.readText(vfsPath) : undefined;
    if (text === undefined) {
      this.studioSourceDocument = undefined;
      this.log(`Source file ${sourcePath} is not available in the active VFS.`);
      return;
    }
    const sourcePackage = this.getProjectSourcePackages().find((item) => item.id === sourcePackageId);
    this.studioSourceDocument = createStudioSourceDocumentDraft({
      sourcePackageId,
      path: vfsPath ?? sourcePath,
      text,
      baseSourceFingerprint: this.getActiveStudioSourceFingerprint(sourcePackage),
      baseProjectRevision: this.getActiveStudioProjectRevision(),
    });
    this.refreshStudioSourceSemanticDraft();
  }

  private resolveStudioSourceVfsPath(sourcePath: string): string | undefined {
    const vfs = this.importedSourceBundle?.vfs;
    if (!vfs) {
      return undefined;
    }
    if (vfs.readText(sourcePath) !== undefined) {
      return sourcePath;
    }
    const suffix = `/${sourcePath.toLowerCase()}`;
    return vfs.listFiles().find((candidate) => candidate.toLowerCase().endsWith(suffix));
  }

  private getStudioSourceWriteContext(draft: StudioSourceDocumentDraft): {
    sourcePackage: GameProjectSourcePackage;
    sourceTransaction: SourceTransactionRecord | undefined;
    sourceHandle: SourceHandleRecord | undefined;
    handle: SourceHandleLike | undefined;
    plan: SourceWritePlan;
  } | undefined {
    const sourcePackage = this.getProjectSourcePackages().find((item) => item.id === draft.sourcePackageId);
    if (!sourcePackage) {
      return undefined;
    }
    const sourceTransaction = this.getSourceTransactionRecords().find((item) => item.sourcePackageId === sourcePackage.id);
    const sourceHandle = this.getSourceHandleRecords().find((item) => item.sourcePackageId === sourcePackage.id);
    const entry = this.sourceHandleEntries.find((item) => item.record.sourcePackageId === sourcePackage.id);
    return {
      sourcePackage,
      sourceTransaction,
      sourceHandle,
      handle: entry?.handle,
      plan: createSourceWritePlan({
        sourcePackage,
        sourceTransaction,
        sourceHandle,
        handle: entry?.handle,
        path: draft.path,
      }),
    };
  }

  private recordStudioSourceWriteReceipt(
    draft: StudioSourceDocumentDraft,
    input: {
      status: SourceWriteReceiptStatus;
      reason: SourceWriteReceiptReason;
      diagnostics?: string[];
      permission?: SourceTransactionPermission;
      observedSourceFingerprint?: string;
      committedSourceFingerprint?: string;
      observedProjectRevision?: number;
      committedDigest?: string;
      byteLength?: number;
    },
  ): SourceWriteReceipt {
    const sourcePackage = this.getProjectSourcePackages().find((item) => item.id === draft.sourcePackageId);
    const receipt = createSourceWriteReceipt({
      id: `source-write:${draft.sourcePackageId}:${draft.path}`,
      sourcePackageId: draft.sourcePackageId,
      sourceName: sourcePackage?.name ?? draft.sourcePackageId,
      path: draft.path,
      status: input.status,
      reason: input.reason,
      observedAt: new Date().toISOString(),
      operation: "directory-exclusive-write-and-reimport",
      ...(input.permission ? { permission: input.permission } : {}),
      ...(draft.baseSourceFingerprint ? { baseSourceFingerprint: draft.baseSourceFingerprint } : {}),
      ...(input.observedSourceFingerprint ? { observedSourceFingerprint: input.observedSourceFingerprint } : {}),
      ...(input.committedSourceFingerprint ? { committedSourceFingerprint: input.committedSourceFingerprint } : {}),
      ...(draft.baseProjectRevision !== undefined ? { baseProjectRevision: draft.baseProjectRevision } : {}),
      ...(input.observedProjectRevision !== undefined ? { observedProjectRevision: input.observedProjectRevision } : {}),
      ...(draft.semanticPreflight?.draftDigest ? { draftDigest: draft.semanticPreflight.draftDigest } : {}),
      ...(input.committedDigest ? { committedDigest: input.committedDigest } : {}),
      ...(input.byteLength !== undefined ? { byteLength: input.byteLength } : {}),
      invalidatedOutputs: [...SOURCE_TRANSACTION_INVALIDATED_OUTPUTS],
      diagnostics: [...new Set(input.diagnostics ?? [])],
    });
    this.studioSourceWriteReceipt = receipt;
    return receipt;
  }

  private async saveStudioSourceDocument(): Promise<void> {
    this.cancelStudioSourceSemanticPreflight();
    this.refreshStudioSourceSemanticDraft();
    const draft = this.studioSourceDocument;
    if (!draft?.dirty) {
      return;
    }
    const semanticPreflight = draft.semanticPreflight;
    if (!semanticPreflight || !canWriteStudioSemanticDraft(semanticPreflight)) {
      this.recordStudioSourceWriteReceipt(draft, {
        status: "blocked",
        reason: "semantic-preflight",
        diagnostics: semanticPreflight?.diagnostics.map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`) ?? ["Semantic preflight has not run yet."],
        observedProjectRevision: this.getActiveStudioProjectRevision(),
      });
      this.log(describeStudioSemanticDraft(semanticPreflight));
      this.updateUi();
      return;
    }
    const context = this.getStudioSourceWriteContext(draft);
    if (!context || context.plan.status !== "ready" || !context.handle) {
      this.recordStudioSourceWriteReceipt(draft, {
        status: "blocked",
        reason: context?.plan.reason === "project-conflict" ? "project-conflict" : context?.plan.reason === "permission-denied" ? "permission" : "plan-blocked",
        permission: context?.sourceTransaction?.permission,
        diagnostics: [context?.plan.detail ?? "Source document save is unavailable for the current package."],
        observedProjectRevision: this.getActiveStudioProjectRevision(),
      });
      this.log(context?.plan.detail ?? "Source document save is unavailable for the current package.");
      this.updateUi();
      return;
    }
    try {
      const writePermission = await requestSourceHandleWritePermission(context.handle);
      if (writePermission !== "granted") {
        await this.persistSourceHandle(
          context.sourcePackage,
          context.handle,
          writePermission,
          context.sourceHandle?.observedFingerprint,
          context.sourceHandle?.observedByteLength,
        );
        this.recordStudioSourceWriteReceipt(draft, {
          status: "blocked",
          reason: "permission",
          permission: writePermission,
          diagnostics: [`Source write permission remains ${writePermission}.`],
          observedProjectRevision: this.getActiveStudioProjectRevision(),
        });
        this.log(`Source write permission for ${context.sourcePackage.name} remains ${writePermission}.`);
        this.updateUi();
        return;
      }
      const latestContext = this.getStudioSourceWriteContext(draft);
      if (!latestContext || latestContext.plan.status !== "ready" || !latestContext.handle) {
        this.recordStudioSourceWriteReceipt(draft, {
          status: "blocked",
          reason: "plan-blocked",
          diagnostics: [latestContext?.plan.detail ?? "Source document save is no longer available for the current package."],
          observedProjectRevision: this.getActiveStudioProjectRevision(),
        });
        this.log(latestContext?.plan.detail ?? "Source document save is no longer available for the current package.");
        this.updateUi();
        return;
      }
      const activeRevision = this.getActiveStudioProjectRevision();
      if (draft.baseProjectRevision !== undefined && draft.baseProjectRevision !== activeRevision) {
        this.recordStudioSourceWriteReceipt(draft, {
          status: "blocked",
          reason: "project-conflict",
          diagnostics: ["The project revision changed before the writable stream opened."],
          observedProjectRevision: activeRevision,
        });
        this.log("The project revision changed before the writable stream opened; resolve the conflict and reload the source draft.");
        this.refreshStudioSourceSemanticDraft();
        this.updateUi();
        return;
      }
      const observedFingerprint = await this.readSourceHandleFingerprint(latestContext.handle);
      const expectedFingerprint = draft.baseSourceFingerprint ?? latestContext.sourcePackage.fingerprint;
      if (!expectedFingerprint || observedFingerprint.digest.toLowerCase() !== expectedFingerprint.toLowerCase()) {
        await this.persistSourceHandle(
          latestContext.sourcePackage,
          latestContext.handle,
          "granted",
          observedFingerprint.digest,
          observedFingerprint.byteLength,
        );
        this.recordStudioSourceWriteReceipt(draft, {
          status: "blocked",
          reason: "source-changed",
          observedSourceFingerprint: observedFingerprint.digest,
          diagnostics: ["The source fingerprint changed before the writable stream opened."],
          observedProjectRevision: activeRevision,
        });
        this.log("The source fingerprint changed before the writable stream opened; save paused until explicit reimport.");
        this.refreshStudioSourceSemanticDraft();
        this.updateUi();
        return;
      }
      const result = await writeSourceHandleText(latestContext.handle, draft.path, draft.text);
      this.studioSourceDocument = commitStudioSourceDocumentDraft(draft);
      this.invalidateBuildOutputs();
      this.pendingSourceRelinkPackageId = latestContext.sourcePackage.id;
      const accepted = await this.loadFolder(await readSourceHandleFolder(latestContext.handle), {
        allowChangedSource: true,
        skipNavigationGuard: true,
      });
      if (accepted) {
        const activePackage = this.getProjectSourcePackages().find((item) => item.id === latestContext.sourcePackage.id) ?? latestContext.sourcePackage;
        const fingerprint = this.importedSourceBundle?.fingerprint;
        await this.persistSourceHandle(
          activePackage,
          latestContext.handle,
          "granted",
          fingerprint?.digest,
          fingerprint?.byteLength,
        );
        const refreshedText = this.importedSourceBundle?.vfs.readText(draft.path);
        if (refreshedText === undefined) {
          this.studioSourceDocument = undefined;
          this.recordStudioSourceWriteReceipt(draft, {
            status: "rejected",
            reason: "reimport-rejected",
            observedSourceFingerprint: fingerprint?.digest,
            byteLength: result.byteLength,
            diagnostics: [`Saved ${draft.path}, but the reimported source no longer exposes the edited path.`],
            observedProjectRevision: this.getActiveStudioProjectRevision(),
          });
          this.log(`Saved ${draft.path}, but the reimported source no longer exposes the edited path.`);
        } else if (fingerprintMugenStateSource(refreshedText) !== semanticPreflight.draftDigest) {
          this.studioSourceDocument = createStudioSourceDocumentDraft({
            sourcePackageId: activePackage.id,
            path: draft.path,
            text: refreshedText,
            baseSourceFingerprint: fingerprint?.digest,
            baseProjectRevision: this.getActiveStudioProjectRevision(),
          });
          this.refreshStudioSourceSemanticDraft();
          this.recordStudioSourceWriteReceipt(draft, {
            status: "rejected",
            reason: "reimport-rejected",
            observedSourceFingerprint: fingerprint?.digest,
            byteLength: result.byteLength,
            diagnostics: ["The reimported text digest differs from the semantic draft."],
            observedProjectRevision: this.getActiveStudioProjectRevision(),
          });
          this.log(`Saved ${draft.path}, but the reimported text digest differs from the semantic draft; inspect before continuing.`);
        } else if (!fingerprint?.digest) {
          this.recordStudioSourceWriteReceipt(draft, {
            status: "rejected",
            reason: "reimport-rejected",
            byteLength: result.byteLength,
            diagnostics: ["The reimported source did not expose a source fingerprint."],
            observedProjectRevision: this.getActiveStudioProjectRevision(),
          });
          this.log(`Saved ${draft.path}, but the reimported source fingerprint is unavailable.`);
        } else {
          this.studioSourceDocument = createStudioSourceDocumentDraft({
            sourcePackageId: activePackage.id,
            path: draft.path,
            text: refreshedText,
            baseSourceFingerprint: fingerprint?.digest,
            baseProjectRevision: this.getActiveStudioProjectRevision(),
          });
          this.refreshStudioSourceSemanticDraft();
          this.recordStudioSourceWriteReceipt(draft, {
            status: "committed",
            reason: "write-and-reimport",
            permission: "granted",
            observedSourceFingerprint: fingerprint.digest,
            committedSourceFingerprint: fingerprint.digest,
            committedDigest: semanticPreflight.draftDigest,
            byteLength: result.byteLength,
            observedProjectRevision: this.getActiveStudioProjectRevision(),
          });
          this.log(`Saved ${draft.path} (${result.byteLength} bytes) and explicitly reimported ${activePackage.name}.`);
        }
      } else {
        this.recordStudioSourceWriteReceipt(draft, {
          status: "rejected",
          reason: "reimport-rejected",
          byteLength: result.byteLength,
          diagnostics: ["Explicit source reimport was rejected; the current runtime session was retained."],
          observedProjectRevision: this.getActiveStudioProjectRevision(),
        });
        this.log(`Saved ${draft.path}, but explicit source reimport was rejected; the current runtime session was retained.`);
      }
    } catch (error) {
      this.recordStudioSourceWriteReceipt(draft, {
        status: "failed",
        reason: "write-failed",
        diagnostics: [error instanceof Error ? error.message : String(error)],
        observedProjectRevision: this.getActiveStudioProjectRevision(),
      });
      this.log(`Source document save failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    this.updateUi();
  }

  private discardStudioSourceDocument(): void {
    const draft = this.studioSourceDocument;
    if (!draft) {
      return;
    }
    this.cancelStudioSourceSemanticPreflight();
    this.studioSourceDocument = discardStudioSourceDocumentDraft(draft);
    this.updateUi();
  }

  private scheduleStudioSourceSemanticPreflight(): void {
    this.cancelStudioSourceSemanticPreflight();
    this.studioSourceSemanticPreflightTimer = window.setTimeout(() => {
      this.studioSourceSemanticPreflightTimer = undefined;
      this.refreshStudioSourceSemanticDraft();
      this.refreshStudioSourceEditorStatus();
    }, 180);
  }

  private cancelStudioSourceSemanticPreflight(): void {
    if (this.studioSourceSemanticPreflightTimer === undefined) {
      return;
    }
    window.clearTimeout(this.studioSourceSemanticPreflightTimer);
    this.studioSourceSemanticPreflightTimer = undefined;
  }

  private refreshStudioSourceEditorStatus(): void {
    const draft = this.studioSourceDocument;
    const status = this.root.querySelector<HTMLElement>("[data-source-editor-status]");
    const save = this.root.querySelector<HTMLButtonElement>('[data-action="save-source-document"]');
    const discard = this.root.querySelector<HTMLButtonElement>('[data-action="discard-source-document"]');
    if (!draft || !status || !save || !discard) {
      return;
    }
    const context = this.getStudioSourceWriteContext(draft);
    const plan = context?.plan;
    const preflight = draft.semanticPreflight;
    const semanticDetail = preflight ? describeStudioSemanticDraft(preflight) : "Semantic preflight pending...";
    status.textContent = plan?.status === "ready" ? semanticDetail : plan?.detail ?? "Unsaved local edit";
    save.disabled = !draft.dirty || plan?.status !== "ready" || !preflight || !canWriteStudioSemanticDraft(preflight);
    discard.disabled = !draft.dirty;
  }

  private refreshStudioSourceSemanticDraft(): void {
    const draft = this.studioSourceDocument;
    if (!draft) {
      return;
    }
    const context = this.getStudioSourceWriteContext(draft);
    this.studioSourceDocument = {
      ...draft,
      semanticPreflight: this.createStudioSourceSemanticPreflight(draft, context),
    };
  }

  private createStudioSourceSemanticPreflight(
    draft: StudioSourceDocumentDraft,
    context: ReturnType<App["getStudioSourceWriteContext"]>,
  ): StudioSemanticDraftPreflight {
    return createStudioSemanticDraftPreflight({
      sourcePackageId: draft.sourcePackageId,
      path: draft.path,
      text: draft.text,
      baseFingerprint: draft.baseSourceFingerprint,
      activeFingerprint: this.getActiveStudioSourceFingerprint(context?.sourcePackage),
      baseRevision: draft.baseProjectRevision,
      activeRevision: this.getActiveStudioProjectRevision(),
    });
  }

  private getActiveStudioSourceFingerprint(sourcePackage: GameProjectSourcePackage | undefined): string | undefined {
    return this.importedSourceBundle?.fingerprint.digest ?? sourcePackage?.observedFingerprint ?? sourcePackage?.fingerprint;
  }

  private getActiveStudioProjectRevision(): number | undefined {
    return this.projectStorageConflict?.actualRevision ?? this.projectStorageRevision;
  }

  private async readSourceHandleFingerprint(handle: SourceHandleLike): Promise<SourceFingerprint> {
    const files = await readSourceHandleFolder(handle);
    const vfs = await new FolderCharacterSource(files).load();
    return fingerprintVirtualFileSystem(vfs);
  }

  private async persistSourceHandle(
    sourcePackage: GameProjectSourcePackage,
    handle: NonNullable<SourceHandleStoreEntry["handle"]>,
    permission: SourceHandleRecord["permission"],
    observedFingerprint?: string,
    observedByteLength?: number,
  ): Promise<SourceHandleRecord> {
    let record = createSourceHandleRecord({
      sourcePackage,
      capability: this.sourceHandleCapability,
      storage: this.sourceHandleStorage,
      permission,
      handleLinked: true,
      persisted: this.sourceHandleStorage === "indexeddb",
      sourceAvailable: true,
      handleKind: handle.kind,
      observedFingerprint,
      observedByteLength,
    });
    try {
      await this.sourceHandleStore.put({ record, handle });
    } catch (error) {
      if (this.sourceHandleStore === this.memorySourceHandleStore) {
        throw error;
      }
      this.sourceHandleStorage = "memory";
      this.sourceHandleStore = this.memorySourceHandleStore;
      record = createSourceHandleRecord({
        sourcePackage,
        capability: this.sourceHandleCapability,
        storage: "memory",
        permission,
        handleLinked: true,
        persisted: false,
        sourceAvailable: true,
        handleKind: handle.kind,
        observedFingerprint,
        observedByteLength,
      });
      await this.sourceHandleStore.put({ record, handle });
      this.log(`Persistent source handle storage rejected the browser handle; retained it for this session only.`);
    }
    this.sourceHandleEntries = await this.sourceHandleStore.list();
    return record;
  }

  private saveTraceEvidenceLocal(manifest: GameProjectManifest, artifact: RuntimeTraceArtifact): void {
    try {
      this.storedTraceEvidence = saveStoredTraceEvidence(window.localStorage, manifest, artifact);
    } catch (error) {
      this.log(`Could not save trace evidence locally: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private saveCurrentProjectLocal(options: { automatic?: boolean } = {}): void {
    this.studioAutosave.cancel();
    const manifest = this.getGameProjectManifest();
    try {
      this.storedProjects = saveStoredProjectManifest(window.localStorage, manifest, {
        expectedRevision: this.projectStorageRevision ?? 0,
      });
      this.projectStorageRevision = this.storedProjects.find((entry) => entry.id === manifest.id)?.revision;
      this.projectStorageConflict = undefined;
      this.importedProjectManifest = manifest;
      this.projectDirty = false;
      this.log(`${options.automatic ? "Autosaved" : "Saved"} local project ${manifest.id}`);
      this.updateUi();
    } catch (error) {
      if (error instanceof ProjectStorageConflictError) {
        this.projectStorageConflict = error.conflict;
        this.refreshStoredProjects();
        this.log(
          `Could not save local project ${manifest.id}: revision conflict (expected ${error.conflict.expectedRevision}, found ${error.conflict.actualRevision}).`,
        );
        this.updateUi();
        return;
      }
      this.log(`Could not save local project: ${error instanceof Error ? error.message : String(error)}`);
      this.updateUi();
    }
  }

  private autosaveProjectLocal(): void {
    if (!this.projectDirty || this.projectStorageConflict) {
      return;
    }
    this.saveCurrentProjectLocal({ automatic: true });
  }

  private openStoredProject(id: string): void {
    if (!this.confirmStudioProjectNavigation("open another project")) {
      return;
    }
    try {
      const entry = loadStoredProject(window.localStorage, id);
      if (!entry) {
        this.refreshStoredProjects();
        this.log(`Stored project ${id} was not found`);
        this.updateUi();
        return;
      }
      this.applyProjectManifest(entry.manifest, [], { storageRevision: entry.revision });
    } catch (error) {
      this.log(`Could not open local project ${id}: ${error instanceof Error ? error.message : String(error)}`);
      this.updateUi();
    }
  }

  private reloadExternalProject(): void {
    const conflict = this.projectStorageConflict;
    if (!conflict) {
      return;
    }
    try {
      const entry = loadStoredProject(window.localStorage, conflict.projectId);
      if (!entry) {
        this.log(`Remote project ${conflict.projectId} is no longer available; keep the local copy or open another project.`);
        this.updateUi();
        return;
      }
      this.applyProjectManifest(entry.manifest, [`Reloaded remote project revision ${entry.revision}.`], {
        storageRevision: entry.revision,
      });
    } catch (error) {
      this.log(`Could not reload remote project ${conflict.projectId}: ${error instanceof Error ? error.message : String(error)}`);
      this.updateUi();
    }
  }

  private keepLocalProjectCopy(): void {
    if (!this.projectStorageConflict) {
      return;
    }
    const source = this.getGameProjectManifest();
    const copyName = normalizeProjectName(`${source.name} (Local copy)`) ?? "Local Project Copy";
    const existingIds = new Set(this.storedProjects.map((entry) => entry.id));
    const baseId = `${source.id}-local`;
    let copyId = baseId;
    let suffix = 2;
    while (existingIds.has(copyId)) {
      copyId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    const copy = { ...source, id: copyId, name: copyName };
    try {
      this.storedProjects = saveStoredProjectManifest(window.localStorage, copy, { expectedRevision: 0 });
      this.importedProjectManifest = copy;
      this.projectNameOverride = copy.name;
      this.projectStorageRevision = this.storedProjects.find((entry) => entry.id === copy.id)?.revision;
      this.projectStorageConflict = undefined;
      this.studioAutosave.cancel();
      this.projectDirty = false;
      this.log(`Saved local project copy ${copy.id}`);
      this.updateUi();
    } catch (error) {
      this.log(`Could not save local project copy: ${error instanceof Error ? error.message : String(error)}`);
      this.updateUi();
    }
  }

  private invalidateBuildOutputs(): void {
    this.lastCompiledProject = undefined;
    this.lastTraceArtifact = undefined;
    this.lastProjectBundle = undefined;
  }

  private markProjectDirty(): void {
    this.projectDirty = true;
    if (!this.projectStorageConflict) {
      this.studioAutosave.schedule(() => this.autosaveProjectLocal());
    }
  }

  private applyProjectName(value: string): void {
    const name = normalizeProjectName(value);
    if (!name) {
      this.log("Project name must contain at least one visible character");
      this.updateUi();
      return;
    }
    if (name === this.getStudioProjectSummary().name) {
      return;
    }
    const before = this.captureStudioProjectEditState();
    this.projectNameOverride = name;
    if (this.importedProjectManifest) {
      this.importedProjectManifest = { ...this.importedProjectManifest, name };
    }
    this.invalidateBuildOutputs();
    this.markProjectDirty();
    this.recordStudioProjectEdit(before);
    this.log(`Project renamed to ${name}`);
    this.updateUi();
  }

  private captureStudioProjectEditState(): StudioProjectEditState {
    return {
      projectName: this.getStudioProjectSummary().name,
      p1: this.selectedP1,
      p2: this.selectedP2,
      stage: this.selectedStageId,
    };
  }

  private recordStudioProjectEdit(before: StudioProjectEditState): void {
    this.studioEditHistory.record(before, this.captureStudioProjectEditState());
  }

  private applyStudioProjectEditState(state: StudioProjectEditState, actionLabel: string): void {
    this.projectNameOverride = state.projectName;
    if (this.importedProjectManifest) {
      this.importedProjectManifest = { ...this.importedProjectManifest, name: state.projectName };
    }
    this.selectedP1 = state.p1;
    this.selectedP2 = state.p2;
    this.selectedStageId = state.stage;
    this.studioSelectedAssetId = this.resolveSelectedStudioAssetId();
    this.invalidateBuildOutputs();
    this.markProjectDirty();
    this.rebuildMatchRuntime();
    this.mode = "studio";
    this.snapshot = this.matchRuntime.getSnapshot();
    this.writeUrlState();
    this.log(`${actionLabel} Studio project edit`);
    this.updateUi();
  }

  private undoStudioProjectEdit(): void {
    const state = this.studioEditHistory.undo(this.captureStudioProjectEditState());
    if (state) {
      this.applyStudioProjectEditState(state, "Undid");
    }
  }

  private redoStudioProjectEdit(): void {
    const state = this.studioEditHistory.redo(this.captureStudioProjectEditState());
    if (state) {
      this.applyStudioProjectEditState(state, "Redid");
    }
  }

  private applyProjectManifest(
    manifest: GameProjectManifest,
    warnings: string[] = [],
    options: { storageRevision?: number } = {},
  ): void {
    const nextWarnings = [...warnings];
    for (const sourcePackage of manifest.sourcePackages) {
      if (!this.isSourcePackageLinked(sourcePackage)) {
        nextWarnings.push(
          `Source package '${sourcePackage.name}' is required for full export; load the original ${sourcePackage.kind} before exporting imported MUGEN files.`,
        );
      }
    }
    const p1 = this.findFighter(manifest.entry.p1);
    const p2 = this.findFighter(manifest.entry.p2);
    const stage = this.findStage(manifest.entry.stage);
    if (p1) {
      this.selectedP1 = p1.id;
    } else {
      nextWarnings.push(`P1 '${manifest.entry.p1}' is not available in the current roster`);
    }
    if (p2) {
      this.selectedP2 = p2.id;
    } else {
      nextWarnings.push(`P2 '${manifest.entry.p2}' is not available in the current roster`);
    }
    if (stage) {
      this.selectedStageId = stage.id;
    } else {
      nextWarnings.push(`Stage '${manifest.entry.stage}' is not available in the current stage list`);
    }

    this.importedProjectManifest = manifest;
    this.projectNameOverride = manifest.name;
    this.projectStorageRevision = options.storageRevision;
    this.projectStorageConflict = undefined;
    this.studioAutosave.cancel();
    this.projectDirty = false;
    this.studioEditHistory.reset();
    this.projectImportWarnings = nextWarnings;
    this.invalidateBuildOutputs();
    this.rebuildMatchRuntime();
    this.mode = "studio";
    this.snapshot = this.matchRuntime.getSnapshot();
    this.writeUrlState();
    this.log(`Opened project manifest ${manifest.id}`);
    for (const warning of nextWarnings) {
      this.log(`Project manifest warning: ${warning}`);
    }
    this.updateUi();
  }

  private useCharacter(
    character: MugenCharacter,
    stages: MugenStagePackage[] = [],
    sourceBundle: ImportedSourceBundle,
    transaction: SourceImportTransaction,
  ): void {
    const rollback = this.captureSourceImportRollbackState();
    const commitStatus = runSourceImportTransaction(
      transaction,
      rollback,
      (acceptedTransaction) => {
        this.studioAutosave.cancel();
        this.studioSourceDocument = undefined;
        this.importedPackageAnalysisV1 = this.analyzeImportedSourceBundle(sourceBundle);
        this.importedPackageAnalysis = this.importedPackageAnalysisV1?.analysis;
        this.character = character;
        this.importedStages = stages;
        this.importedSourceBundle = sourceBundle;
        this.applySourceImportTransaction(acceptedTransaction);
        this.invalidateBuildOutputs();
        this.renderer.setStageSpriteArchives(
          stages.map((stage) => ({ stageId: stage.stage.id, archive: stage.spriteArchive })),
        );
        if (stages.length > 0) {
          this.selectedStageId = stages[0]!.stage.id;
          this.log(
            `Imported ${stages.length} MUGEN stage${stages.length === 1 ? "" : "s"}; selected ${stages[0]!.stage.displayName}`,
          );
        } else if (!this.getAvailableStages().some((stage) => stage.id === this.selectedStageId)) {
          this.selectedStageId = trainingStage.id;
        }
        const imported = createImportedFighterDefinition(character);
        this.installCharacterSffProvider(character);
        this.installCharacterSoundArchive(character);
        this.installImportedFighter(imported);
        const animations = character.animations.size > 0 ? character.animations : createFixtureAnimations();
        this.inspectorRuntime = new MugenRuntime(animations);
        this.mode = "inspect";
        this.snapshot = this.inspectorRuntime.getSnapshot();
        this.log(`Loaded ${character.definition.info.displayName ?? character.definition.info.name ?? character.sourceName}`);
        this.writeUrlState();
      },
      (previousState) => this.restoreSourceImportRollbackState(previousState),
    );
    if (commitStatus === "rejected") {
      this.rejectSourceImportTransaction(transaction);
      return;
    }
    this.studioEditHistory.reset();
    this.updateUi();
  }

  private analyzeImportedSourceBundle(sourceBundle: ImportedSourceBundle): PackageAnalysisV1Result | undefined {
    try {
      const candidate = createPackageAnalysisV1({
        vfs: sourceBundle.vfs,
        sourceName: sourceBundle.sourceName,
        observedAt: new Date().toISOString(),
        sourceFingerprint: sourceBundle.fingerprint,
      });
      const parsed = parsePackageAnalysisV1(candidate);
      if (!parsed.report) {
        this.log(`Package analysis v1 rejected: ${parsed.errors.join("; ") || "invalid analysis result"}`);
        return undefined;
      }
      return parsed.report;
    } catch (error) {
      this.log(`Package analysis v1 rejected: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  }

  private applySourceImportTransaction(transaction: SourceImportTransaction): void {
    this.pendingSourceRelinkPackageId = undefined;
    this.sourceImportTransaction = transaction;
    if (this.importedProjectManifest?.sourcePackages.length) {
      this.importedProjectManifest = {
        ...this.importedProjectManifest,
        sourcePackages: transaction.sourcePackages,
      };
    }
    this.projectImportWarnings = this.projectImportWarnings.filter((warning) => !isSourcePackageRelinkWarning(warning));
    for (const warning of transaction.warnings) {
      this.projectImportWarnings.push(warning);
      this.log(`Project manifest warning: ${warning}`);
    }
    for (const linkedId of transaction.linkedIds) {
      const sourcePackage = transaction.sourcePackages.find((item) => item.id === linkedId);
      this.log(`Relinked source package ${sourcePackage?.name ?? linkedId}`);
    }
  }

  private captureSourceImportRollbackState(): SourceImportRollbackState {
    return {
      character: this.character,
      importedFighter: this.importedFighter,
      importedSffProvider: this.importedSffProvider,
      importedStages: [...this.importedStages],
      importedSourceBundle: this.importedSourceBundle,
      importedProjectManifest: this.importedProjectManifest,
      projectNameOverride: this.projectNameOverride,
      projectImportWarnings: [...this.projectImportWarnings],
      projectDirty: this.projectDirty,
      projectStorageRevision: this.projectStorageRevision,
      projectStorageConflict: this.projectStorageConflict,
      autosavePending: this.studioAutosave.pending,
      selectedP1: this.selectedP1,
      selectedP2: this.selectedP2,
      selectedStageId: this.selectedStageId,
      mode: this.mode,
      snapshot: this.snapshot,
      matchRuntime: this.matchRuntime,
      inspectorRuntime: this.inspectorRuntime,
      pendingSourceRelinkPackageId: this.pendingSourceRelinkPackageId,
      sourceImportTransaction: this.sourceImportTransaction,
      importedPackageAnalysis: this.importedPackageAnalysis,
      importedPackageAnalysisV1: this.importedPackageAnalysisV1,
      studioSourceDocument: this.studioSourceDocument,
      studioSourceWriteReceipt: this.studioSourceWriteReceipt,
      lastCompiledProject: this.lastCompiledProject,
      lastProjectBundle: this.lastProjectBundle,
      lastTraceArtifact: this.lastTraceArtifact,
    };
  }

  private restoreSourceImportRollbackState(previousState: SourceImportRollbackState): void {
    this.character = previousState.character;
    this.importedFighter = previousState.importedFighter;
    this.importedStages = previousState.importedStages;
    this.importedSourceBundle = previousState.importedSourceBundle;
    this.importedProjectManifest = previousState.importedProjectManifest;
    this.projectNameOverride = previousState.projectNameOverride;
    this.projectImportWarnings = [...previousState.projectImportWarnings];
    this.projectDirty = previousState.projectDirty;
    this.projectStorageRevision = previousState.projectStorageRevision;
    this.projectStorageConflict = previousState.projectStorageConflict;
    this.selectedP1 = previousState.selectedP1;
    this.selectedP2 = previousState.selectedP2;
    this.selectedStageId = previousState.selectedStageId;
    this.mode = previousState.mode;
    this.snapshot = previousState.snapshot;
    this.matchRuntime = previousState.matchRuntime;
    this.inspectorRuntime = previousState.inspectorRuntime;
    this.pendingSourceRelinkPackageId = previousState.pendingSourceRelinkPackageId;
    this.sourceImportTransaction = previousState.sourceImportTransaction;
    this.importedPackageAnalysis = previousState.importedPackageAnalysis;
    this.importedPackageAnalysisV1 = previousState.importedPackageAnalysisV1;
    this.studioSourceDocument = previousState.studioSourceDocument;
    this.studioSourceWriteReceipt = previousState.studioSourceWriteReceipt;
    this.lastCompiledProject = previousState.lastCompiledProject;
    this.lastProjectBundle = previousState.lastProjectBundle;
    this.lastTraceArtifact = previousState.lastTraceArtifact;

    if (this.character) {
      this.installCharacterSffProvider(this.character);
      this.installCharacterSoundArchive(this.character);
    } else {
      this.spriteProvider.clearRoutesByTag("character-sff");
      this.spriteProvider.clearRoutesByTag("system-hit-sparks");
      this.importedSffProvider = undefined;
      this.audio.setArchive(undefined);
    }
    this.renderer.setStageSpriteArchives(
      this.importedStages.map((stage) => ({ stageId: stage.stage.id, archive: stage.spriteArchive })),
    );
    this.syncMatchSpriteOwnerRoutes(
      this.findFighter(this.selectedP1) ?? demoFighters[0]!,
      this.findFighter(this.selectedP2) ?? demoFighters[1]!,
    );
    this.studioAutosave.cancel();
    if (previousState.autosavePending) {
      this.studioAutosave.schedule(() => this.autosaveProjectLocal());
    }
    this.writeUrlState();
    this.updateUi();
  }

  private installCharacterSoundArchive(character: MugenCharacter): void {
    const prefixedArchives = this.characterFightFxSoundArchives(character);
    this.audio.setArchive(character.soundArchive, prefixedArchives);
    const archive = character.soundArchive;
    if (!archive) {
      this.log("Character SND was not loaded; PlaySnd remains debug-only");
    } else {
      this.log(`Character SND decoded ${archive.metadata.decodedTotal}/${archive.metadata.soundTotal} WAV sounds`);
    }
    for (const [prefix, soundArchive] of Object.entries(prefixedArchives)) {
      this.log(`FightFX ${prefix} SND decoded ${soundArchive.metadata.decodedTotal}/${soundArchive.metadata.soundTotal} WAV sounds`);
    }
  }

  private characterFightFxSoundArchives(character: MugenCharacter): Record<string, NonNullable<MugenCharacter["soundArchive"]>> {
    const result: Record<string, NonNullable<MugenCharacter["soundArchive"]>> = {};
    const fightfx = character.systemAssets?.hitSparkLibraries.fightfx;
    if (fightfx?.soundArchive) {
      result.f = fightfx.soundArchive;
    }
    for (const library of Object.values(character.systemAssets?.fightFxLibraries ?? {})) {
      if (library.prefix && library.soundArchive) {
        result[library.prefix] = library.soundArchive;
      }
    }
    return result;
  }

  private installCharacterSffProvider(character: MugenCharacter): void {
    this.spriteProvider.clearRoutesByTag("character-sff");
    this.spriteProvider.clearRoutesByTag("system-hit-sparks");
    this.importedSffProvider = undefined;
    this.installSystemHitSparkProviders(character);
    const archive = character.spriteArchive;
    if (!archive || archive.sprites.length === 0) {
      this.log("Character SFF did not provide decoded sprites; using mock sprite fallback");
      return;
    }
    const provider = new SffSpriteProvider(archive, character.palettes ?? []);
    if (!provider.hasSprites) {
      this.log("Character SFF provider has no sprites; using mock sprite fallback");
      return;
    }
    this.importedSffProvider = provider;
    this.spriteProvider.registerGroupRange(provider.minGroup, provider.maxGroup, provider, "character-sff");
    const total = archive.metadata?.spriteTotal ?? archive.sprites.length;
    this.log(`Character SFF ${archive.version} decoded ${archive.sprites.length}/${total} sprites (${provider.minGroup}-${provider.maxGroup})`);
  }

  private installSystemHitSparkProviders(character: MugenCharacter): void {
    const assets = character.systemAssets;
    if (!assets) {
      return;
    }
    const seenArchives = new Set<unknown>();
    const libraries = [
      assets.hitSparkLibraries.common,
      assets.hitSparkLibraries.fightfx,
      ...Object.values(assets.fightFxLibraries ?? {}),
    ];
    for (const library of libraries) {
      const archive = library?.spriteArchive;
      if (!archive || archive.sprites.length === 0 || seenArchives.has(archive)) {
        continue;
      }
      seenArchives.add(archive);
      const provider = new SffSpriteProvider(archive);
      if (!provider.hasSprites) {
        continue;
      }
      this.spriteProvider.registerGroupRange(provider.minGroup, provider.maxGroup, provider, "system-hit-sparks");
      const total = archive.metadata?.spriteTotal ?? archive.sprites.length;
      const label = library?.prefix ? `FightFX ${library.prefix}` : `System ${library?.source ?? "hit-spark"}`;
      this.log(`${label} SFF ${archive.version} decoded ${archive.sprites.length}/${total} sprites (${provider.minGroup}-${provider.maxGroup})`);
    }
  }

  private installImportedFighter(imported: DemoFighterDefinition | undefined): void {
    this.importedFighter = imported;
    if (!imported) {
      if (this.selectedP1.startsWith("imported-")) {
        this.selectedP1 = demoFighters[0]!.id;
      }
      if (this.selectedP2.startsWith("imported-")) {
        this.selectedP2 = demoFighters[1]!.id;
      }
      this.rebuildMatchRuntime();
      this.log("Imported Runtime route unavailable: needs decoded SFF sprites and parsed AIR actions");
      return;
    }
    this.selectedP1 = imported.id;
    if (this.selectedP2 === imported.id) {
      this.selectedP2 = demoFighters[1]?.id ?? demoFighters[0]!.id;
    }
    this.rebuildMatchRuntime();
    this.log(
      `Runtime route ready for ${imported.displayName}: CMD State -1 + CNS statedef/HitDef subset (${imported.stateEntryControllers?.length ?? 0} entries)`,
    );
  }

  private resetInspectorRuntime(): void {
    const animations = this.character && this.character.animations.size > 0 ? this.character.animations : createFixtureAnimations();
    this.inspectorRuntime = new MugenRuntime(animations);
    this.snapshot = this.inspectorRuntime.getSnapshot();
    if (!this.character) {
      this.snapshot = this.getRenderableSnapshot();
    }
    this.log(this.character ? "Inspector playback reset" : "Inspector is waiting for a character");
  }

  private getRenderableSnapshot(): MugenSnapshot {
    if (this.mode === "studio" && this.studioTab === "inspector") {
      return this.inspectorRuntime.getSnapshot();
    }
    if (this.mode !== "inspect" || this.character) {
      return this.snapshot;
    }
    return {
      ...this.snapshot,
      selectedActionId: undefined,
      selectedAction: undefined,
      actors: [],
      logs: this.snapshot.logs,
    };
  }

  private onFrame(deltaMs: number): void {
    this.commandBuffer.push(this.snapshot.tick, this.keyboard.getState());
    if (this.snapshot.playing) {
      this.pendingMs += deltaMs;
      while (this.pendingMs >= 1000 / 60) {
        this.snapshot =
          this.isInspectorRuntimeSurface()
            ? this.inspectorRuntime.step(1)
            : this.matchRuntime.step({ p1: this.keyboard.getState() });
        if (!this.isInspectorRuntimeSurface()) {
          this.audio.processSnapshot(this.snapshot);
        }
        this.pendingMs -= 1000 / 60;
      }
    }

    if (!this.renderBusy) {
      this.renderBusy = true;
      void this.renderer.render(this.getRenderableSnapshot()).finally(() => {
        this.installDiagnosticsBridge();
        this.renderBusy = false;
      });
    }

    const now = performance.now();
    if (now - this.lastPanelUpdate > 180) {
      this.lastPanelUpdate = now;
      if (this.shouldUseLiveUiRefresh()) {
        this.updateLiveUi();
      } else {
        this.updateUi();
      }
    }
  }

  private shouldUseLiveUiRefresh(): boolean {
    return this.mode === "studio" && this.studioTab !== "debug";
  }

  private syncShellState(): void {
    const shell = this.root.querySelector<HTMLElement>(".app-shell");
    shell?.classList.toggle("mode-match", this.mode === "match");
    shell?.classList.toggle("mode-inspect", this.mode === "inspect");
    shell?.classList.toggle("mode-studio", this.mode === "studio");
    shell?.setAttribute("data-surface", this.mode);
    shell?.setAttribute("data-studio-tab", this.mode === "studio" ? this.studioTab : "");
    shell?.setAttribute("data-left-dock", this.mode === "studio" && !this.studioFocusMode && this.studioLeftDockOpen ? "open" : "closed");
    shell?.setAttribute("data-right-dock", this.mode === "studio" && !this.studioFocusMode && this.studioRightDockOpen ? "open" : "closed");
    shell?.setAttribute("data-focus-mode", this.mode === "studio" && this.studioFocusMode ? "true" : "false");
    this.applyStudioViewportDefaults();
  }

  private applyStudioViewportDefaults(): void {
    if (this.mode !== "studio" || this.studioViewportDefaultsApplied) {
      return;
    }
    this.studioViewportDefaultsApplied = true;
    const disableOverlay = (key: "showClsn1" | "showClsn2" | "showAxis" | "showGrid"): void => {
      this.snapshot = this.isInspectorRuntimeSurface()
        ? this.inspectorRuntime.dispatch({ type: "toggle", key, value: false })
        : this.matchRuntime.dispatch({ type: "toggle", key, value: false });
    };
    disableOverlay("showGrid");
    disableOverlay("showAxis");
    disableOverlay("showClsn1");
    disableOverlay("showClsn2");
  }

  private updateLiveUi(): void {
    this.syncShellState();
    this.setHtml("#console", this.renderConsole());
    this.setHtml("#stage-status", this.renderStageStatus());
    this.setHtml("#round-hud", this.renderRoundHud());
    this.setHtml("#studio-stage-deck", this.renderStudioStageDeck());
    this.syncRuntimeControls();
  }

  private updateUi(): void {
    this.syncShellState();
    this.setHtml("#studio-chrome", this.renderStudioChrome());
    this.setHtml("#workspace-brand", this.renderWorkspaceBrand());
    this.setHtml("#mode-controls", this.renderModeControls());
    this.setHtml("#workspace-summary", this.renderWorkspaceSummary());
    this.setHtml("#workspace-actions", this.renderWorkspaceActions());
    this.setHtml("#navigator", this.renderNavigator());
    this.setHtml("#right-pane", this.mode === "studio" ? this.renderStudioRightPane() : this.renderRuntimeRightPane());
    this.setHtml("#console", this.renderConsole());
    this.setHtml("#stage-status", this.renderStageStatus());
    this.setHtml("#round-hud", this.renderRoundHud());
    this.setHtml("#studio-stage-deck", this.renderStudioStageDeck());
    const commandPaletteMounted = Boolean(this.root.querySelector(".command-palette-panel"));
    if (!this.commandPaletteOpen || !commandPaletteMounted) {
      this.setHtml("#command-palette-root", this.renderCommandPalette());
    }
    this.installDiagnosticsBridge();
    this.syncRuntimeControls();
    this.refreshRendererLayout();
  }

  private refreshRendererLayout(): void {
    const refresh = (): void => {
      this.renderer.resize();
      void this.renderer.render(this.getRenderableSnapshot());
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(refresh);
      return;
    }
    window.setTimeout(refresh, 0);
  }

  private syncRuntimeControls(): void {
    const playPause = this.root.querySelector<HTMLButtonElement>('[data-action="play-pause"]');
    if (playPause) {
      const runtimeState = this.snapshot.playing ? "pause" : "play";
      if (playPause.dataset.runtimeState !== runtimeState) {
        playPause.dataset.runtimeState = runtimeState;
        playPause.innerHTML = runtimeControlContent(runtimeState, this.snapshot.playing ? "Pause" : "Play");
      }
    }
    const speedSelect = this.root.querySelector<HTMLSelectElement>('[data-action="speed"]');
    if (speedSelect) {
      speedSelect.value = String(this.snapshot.speed);
    }
    for (const input of this.root.querySelectorAll<HTMLInputElement>("[data-toggle]")) {
      const key = input.dataset.toggle as keyof Pick<MugenSnapshot, "showClsn1" | "showClsn2" | "showAxis" | "showGrid"> | undefined;
      if (key) {
        input.checked = Boolean(this.snapshot[key]);
      }
    }
  }

  private setHtml(selector: string, html: string): void {
    if (this.htmlCache.get(selector) === html) {
      return;
    }
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) {
      return;
    }
    element.innerHTML = html;
    this.htmlCache.set(selector, html);
  }

  private renderStudioChrome(): string {
    if (this.mode !== "studio") {
      return "";
    }
    const summary = this.getStudioProjectSummary();
    const p1 = this.findFighter(this.selectedP1);
    const p2 = this.findFighter(this.selectedP2);
    const stage = this.findStage(this.selectedStageId);
    const runtimeLabel = this.snapshot.playing ? "Live" : "Paused";
    const buildLabel = this.lastCompiledProject ? "Manifest ready" : "Manifest pending";
    return `
      <div class="studio-chrome-brand">
        <span class="studio-chrome-brand-mark">${tablerIcon("studio", "ui-icon studio-chrome-icon")}</span>
        <span class="studio-chrome-title">
          <strong>Fight Lab</strong>
          <small>MUGEN runtime + evidence</small>
        </span>
      </div>
      <div class="studio-chrome-context" aria-label="Active studio context">
        <div class="studio-chrome-field studio-chrome-matchup">
          <small class="studio-chrome-kicker">Matchup</small>
          <span class="studio-chrome-value">
            <i class="studio-chrome-dot is-p1" aria-hidden="true"></i>
            <b>${escapeHtml(p1?.displayName ?? "P1")}</b>
            <em>vs</em>
            <i class="studio-chrome-dot is-p2" aria-hidden="true"></i>
            <b>${escapeHtml(p2?.displayName ?? "CPU")}</b>
          </span>
        </div>
        <div class="studio-chrome-field">
          <small class="studio-chrome-kicker">Stage</small>
          <span class="studio-chrome-value">
            ${tablerIcon("stage", "ui-icon")}
            <b>${escapeHtml(stage?.displayName ?? "Stage")}</b>
          </span>
        </div>
        <div class="studio-chrome-field ${this.snapshot.playing ? "is-ok" : "is-warn"}">
          <small class="studio-chrome-kicker">Runtime</small>
          <span class="studio-chrome-value">
            <i class="studio-chrome-dot ${this.snapshot.playing ? "is-live" : "is-paused"}" aria-hidden="true"></i>
            <b>${escapeHtml(runtimeLabel)}</b>
          </span>
        </div>
        <div class="studio-chrome-field ${this.lastCompiledProject ? "is-ok" : "is-warn"}">
          <small class="studio-chrome-kicker">Build</small>
          <span class="studio-chrome-value">
            ${tablerIcon("build", "ui-icon")}
            <b>${escapeHtml(buildLabel)}</b>
            <em>${summary.stats.generatedAtlases} atlas${summary.stats.generatedAtlases === 1 ? "" : "es"}</em>
          </span>
        </div>
      </div>
      <div class="studio-chrome-actions" aria-label="Studio command shortcuts">
        <button type="button" class="studio-chrome-command" data-action="open-command-palette" aria-label="Open command palette">
          <span class="studio-chrome-command-prefix" aria-hidden="true">&gt;_</span>
          <span>Commands</span>
        </button>
        <button type="button" class="studio-chrome-playtest" data-mode="match" aria-label="Open playable runtime">
          ${tablerIcon("play", "ui-icon")}
          <span>Playtest</span>
        </button>
        <button type="button" class="studio-chrome-utility ${this.studioFocusMode ? "is-active" : ""}" data-action="toggle-focus-mode" aria-pressed="${this.studioFocusMode}" aria-label="${this.studioFocusMode ? "Exit viewport focus" : "Focus viewport"}" title="${this.studioFocusMode ? "Exit viewport focus" : "Focus viewport"}">
          ${tablerIcon("tools", "ui-icon")}
          <span>Focus</span>
        </button>
      </div>
    `;
  }

  private renderNavigator(): string {
    if (this.mode === "match") {
      return this.renderMatchNavigator();
    }

    if (this.mode === "studio") {
      return this.renderStudioNavigator();
    }

    if (!this.character) {
      return `
        <div class="section">
          <h2>Inspector Pipeline</h2>
          <div class="pipeline-list">
            <span class="pipeline-step active">1 Load ZIP/folder</span>
            <span class="pipeline-step">2 Resolve DEF files</span>
            <span class="pipeline-step">3 Browse AIR/CNS/CMD</span>
            <span class="pipeline-step">4 Export report</span>
          </div>
          <div class="empty-state">No character loaded yet. Use the loader above to inspect real MUGEN data.</div>
        </div>
      `;
    }

    return `
      <div class="section">
        <div class="tabs">
          ${this.renderTab("animations", "Animations")}
          ${this.renderTab("states", "States")}
          ${this.renderTab("commands", "Commands")}
        </div>
        ${this.renderLoadStatus()}
        <div class="navigator-tools">
          <label>
            <span class="list-meta">Filter ${this.activeTab}</span>
            <input type="search" data-filter="navigator" value="${escapeHtml(this.navigatorFilter)}" placeholder="Action ID, state, command..." />
          </label>
        </div>
        ${this.activeTab === "animations" ? this.renderAnimations() : ""}
        ${this.activeTab === "states" ? this.renderStates() : ""}
        ${this.activeTab === "commands" ? this.renderCommands() : ""}
      </div>
    `;
  }

  private renderModeControls(): string {
    return `
      <div class="mode-control-stack">
        <div class="mode-switch" role="group" aria-label="Sandbox mode">
          ${this.renderModeButton("match", "Match", "play")}
          ${this.renderModeButton("inspect", "Inspect", "import")}
          ${this.renderModeButton("studio", "Studio", "build")}
        </div>
        <button type="button" class="command-launcher" data-action="open-command-palette" aria-keyshortcuts="Control+K Meta+K" aria-expanded="${this.commandPaletteOpen}">
          ${tablerIcon("search", "ui-icon command-launcher-icon")}
          <span>
            <strong>Command</strong>
            <small>Modes, loaders, build</small>
          </span>
          <span class="badge">${this.getCommandPaletteActions().length}</span>
        </button>
      </div>
    `;
  }

  private renderCommandPalette(): string {
    if (!this.commandPaletteOpen) {
      return "";
    }
    const actions = this.getVisibleCommandPaletteActions();
    const actionTotal = this.getCommandPaletteActions().length;
    const activeResultId = actions.length ? `command-result-${Math.min(this.commandPaletteActiveIndex, actions.length - 1)}` : undefined;
    return `
      <div class="command-palette-shell" role="dialog" aria-modal="true" aria-labelledby="command-palette-title">
        <button type="button" class="command-palette-backdrop" data-action="close-command-palette" aria-label="Close command palette"></button>
        <div class="command-palette-panel">
          <div class="command-palette-header">
            <div class="command-palette-title-block">
              <span class="panel-kicker">Command center</span>
              <h2 id="command-palette-title">Action index</h2>
            </div>
            <span class="command-palette-count">${actions.length}/${actionTotal}</span>
            <button type="button" class="command-palette-close" data-action="close-command-palette" aria-label="Close command palette" title="Close">
              ${tablerIcon("close", "ui-icon")}
            </button>
          </div>
          <label class="command-palette-search">
            <span>Filter</span>
            <input type="search" data-command-palette-search value="${escapeHtml(this.commandPaletteQuery)}" placeholder="mode, load, evidence, build..." autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="command-palette-results"${activeResultId ? ` aria-activedescendant="${activeResultId}"` : ""} />
          </label>
          <div class="command-palette-grid-head" aria-hidden="true">
            <span>Action</span>
            <span>Surface</span>
            <span>Signal</span>
          </div>
          <div id="command-palette-results" class="command-palette-results" role="listbox" aria-live="polite">
            ${this.renderCommandPaletteResults(actions)}
          </div>
        </div>
      </div>
    `;
  }

  private getVisibleCommandPaletteActions(): CommandPaletteAction[] {
    const query = this.commandPaletteQuery.trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    return this.getCommandPaletteActions()
      .filter((action) => {
        if (terms.length === 0) {
          return true;
        }
        const haystack = [action.group, action.label, action.detail, ...action.keywords].join(" ").toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, 14);
  }

  private renderCommandPaletteResults(actions = this.getVisibleCommandPaletteActions()): string {
    if (actions.length === 0) {
      return `
        <div class="empty-state compact">
          <strong>No action found</strong>
          <span>Try a surface name, export, load, evidence, build, debug, or inspector.</span>
        </div>
      `;
    }
    return actions
      .map(
        (action, index) => {
          const selected = index === Math.min(this.commandPaletteActiveIndex, actions.length - 1);
          const iconName = iconForAction(action.label, [action.id, action.group, ...action.keywords].join(" "));
          return `
          <button type="button" id="command-result-${index}" role="option" aria-selected="${selected}" class="command-result tone-${action.tone} ${selected ? "is-active" : ""}" data-command-id="${escapeHtml(action.id)}" data-command-tone="${escapeHtml(action.tone)}" ${action.disabled ? "disabled" : ""}>
            <span class="command-result-icon">${tablerIcon(iconName, "ui-icon")}</span>
            <span class="command-result-main">
              <strong>${escapeHtml(action.label)}</strong>
              <small>${escapeHtml(action.detail)}</small>
            </span>
            <span class="command-result-meta">
              <span class="badge command-result-group">${escapeHtml(action.group)}</span>
              <span class="command-result-signal signal-${action.disabled ? "disabled" : action.tone}">${escapeHtml(this.commandToneLabel(action.tone, action.disabled))}</span>
            </span>
          </button>
        `;
        },
      )
      .join("");
  }

  private openCommandPalette(): void {
    this.commandPaletteReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.commandPaletteOpen = true;
    this.commandPaletteQuery = "";
    this.commandPaletteActiveIndex = 0;
    this.updateUi();
    requestAnimationFrame(() => {
      this.root.querySelector<HTMLInputElement>("[data-command-palette-search]")?.focus();
    });
  }

  private closeCommandPalette(): void {
    if (!this.commandPaletteOpen) {
      return;
    }
    this.commandPaletteOpen = false;
    this.commandPaletteQuery = "";
    this.commandPaletteActiveIndex = 0;
    this.updateUi();
    const returnFocus = this.commandPaletteReturnFocus;
    requestAnimationFrame(() => {
      if (returnFocus?.isConnected) {
        returnFocus.focus();
      } else {
        this.root.querySelector<HTMLElement>('[data-action="open-command-palette"]')?.focus();
      }
      this.commandPaletteReturnFocus = undefined;
    });
  }

  private executeCommandPaletteAction(commandId: string): void {
    const action = this.getCommandPaletteActions().find((candidate) => candidate.id === commandId);
    if (!action || action.disabled) {
      return;
    }
    this.commandPaletteOpen = false;
    this.commandPaletteQuery = "";
    this.commandPaletteActiveIndex = 0;
    action.run();
    this.updateUi();
    if (commandId.startsWith("debug-actor:") || commandId.startsWith("trace-frame:") || commandId.startsWith("stage-layer:")) {
      this.scrollRightPaneToTop();
    }
  }

  private trapCommandPaletteFocus(event: KeyboardEvent): void {
    const shell = this.root.querySelector<HTMLElement>(".command-palette-shell");
    if (!shell) {
      return;
    }
    const focusable = Array.from(
      shell.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private handleCommandPaletteKeydown(event: KeyboardEvent): boolean {
    const shell = this.root.querySelector<HTMLElement>(".command-palette-shell");
    if (!shell || !shell.contains(document.activeElement)) {
      return false;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const actions = this.getVisibleCommandPaletteActions();
      if (!actions.length) {
        return true;
      }
      if (event.key === "Home") {
        this.commandPaletteActiveIndex = 0;
      } else if (event.key === "End") {
        this.commandPaletteActiveIndex = actions.length - 1;
      } else {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        this.commandPaletteActiveIndex = (this.commandPaletteActiveIndex + direction + actions.length) % actions.length;
      }
      this.setHtml("#command-palette-results", this.renderCommandPaletteResults(actions));
      this.syncCommandPaletteActiveDescendant(actions);
      this.scrollActiveCommandResultIntoView();
      return true;
    }
    if (event.key === "Enter") {
      if (document.activeElement?.matches(".command-palette-close")) {
        return false;
      }
      const actions = this.getVisibleCommandPaletteActions();
      const action = actions[Math.min(this.commandPaletteActiveIndex, actions.length - 1)];
      if (!action || action.disabled) {
        return false;
      }
      event.preventDefault();
      this.executeCommandPaletteAction(action.id);
      return true;
    }
    return false;
  }

  private scrollActiveCommandResultIntoView(): void {
    requestAnimationFrame(() => {
      this.root.querySelector<HTMLElement>(".command-result.is-active")?.scrollIntoView({ block: "nearest" });
    });
  }

  private syncCommandPaletteActiveDescendant(actions = this.getVisibleCommandPaletteActions()): void {
    const input = this.root.querySelector<HTMLInputElement>("[data-command-palette-search]");
    if (!input) {
      return;
    }
    if (!actions.length) {
      input.removeAttribute("aria-activedescendant");
      return;
    }
    input.setAttribute("aria-activedescendant", `command-result-${Math.min(this.commandPaletteActiveIndex, actions.length - 1)}`);
  }

  private scrollRightPaneToTop(): void {
    window.requestAnimationFrame(() => {
      this.root.querySelector<HTMLElement>("#right-pane")?.scrollTo({ top: 0 });
    });
  }

  private scrollPackageFilePathIntoView(path: string): void {
    window.requestAnimationFrame(() => {
      const target = [...this.root.querySelectorAll<HTMLElement>(".package-file-row[data-package-file-path]")]
        .find((element) => element.dataset.packageFilePath === path);
      target?.scrollIntoView({ block: "center", inline: "nearest" });
    });
  }

  private scrollSourcePathIntoView(path: string, sourcePackageId?: string): void {
    window.requestAnimationFrame(() => {
      const target = [...this.root.querySelectorAll<HTMLElement>(".source-package-path-row[data-source-path]")]
        .find((element) => element.dataset.sourcePath === path && (!sourcePackageId || element.dataset.sourcePackageId === sourcePackageId));
      target?.scrollIntoView({ block: "center", inline: "nearest" });
    });
  }

  private scrollNavigatorToTop(): void {
    window.requestAnimationFrame(() => {
      this.root.querySelector<HTMLElement>("#left-pane")?.scrollTo({ top: 0 });
      this.root.querySelector<HTMLElement>("#navigator")?.scrollTo({ top: 0 });
    });
  }

  private parseOptionalNumber(value: string | null | undefined): number | undefined {
    if (!value?.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseInspectorStateId(value: string): number | undefined {
    const normalized = value.trim().toLowerCase();
    const stateMatch = normalized.match(/\bstate\s*(-?\d+)/);
    if (stateMatch) {
      return Number(stateMatch[1]);
    }
    return /^-?\d+$/.test(normalized) ? Number(normalized) : undefined;
  }

  private openInspectorState(stateId: number | undefined, filter?: string): void {
    this.mode = "inspect";
    this.activeTab = "states";
    this.navigatorFilter = filter?.trim() || (stateId !== undefined ? `state ${stateId}` : this.navigatorFilter);
    this.selectedInspectorStateId = stateId;
    this.selectedInspectorControllerType = undefined;
    this.selectedInspectorControllerLine = undefined;
    this.selectedInspectorCommandName = undefined;
    this.writeUrlState();
    this.updateUi();
    if (stateId !== undefined) {
      this.scrollSelectedInspectorStateIntoView();
    } else {
      this.scrollNavigatorToTop();
    }
  }

  private openInspectorController(controllerType: string, requestedStateId?: number, requestedControllerLine?: number): void {
    const cleanType = controllerType.trim();
    if (!cleanType) {
      return;
    }
    const target = this.findInspectorControllerTarget(cleanType, requestedStateId, requestedControllerLine);
    this.mode = "inspect";
    this.activeTab = "states";
    this.navigatorFilter = cleanType;
    this.selectedInspectorStateId = target?.state.id ?? requestedStateId;
    this.selectedInspectorControllerType = target?.controller.type ?? cleanType;
    this.selectedInspectorControllerLine = target?.controller.line ?? requestedControllerLine;
    this.selectedInspectorCommandName = undefined;
    this.writeUrlState();
    this.updateUi();
    this.scrollSelectedInspectorStateIntoView();
  }

  private openInspectorCommand(commandName: string): void {
    const cleanName = commandName.trim();
    if (!cleanName) {
      return;
    }
    this.mode = "inspect";
    this.activeTab = "commands";
    this.navigatorFilter = cleanName;
    this.selectedInspectorCommandName = cleanName;
    this.selectedInspectorStateId = undefined;
    this.selectedInspectorControllerType = undefined;
    this.selectedInspectorControllerLine = undefined;
    this.writeUrlState();
    this.updateUi();
    this.scrollSelectedInspectorCommandIntoView();
  }

  private findInspectorControllerTarget(
    controllerType: string,
    requestedStateId?: number,
    requestedControllerLine?: number,
  ): { state: MugenStateDef; controller: MugenStateController } | undefined {
    const states = this.character?.states ?? [];
    if (!states.length) {
      return undefined;
    }
    const matchesControllerType = (controller: MugenStateController): boolean =>
      this.normalizeControllerKey(controller.type) === this.normalizeControllerKey(controllerType);
    const findInState = (state: MugenStateDef): { state: MugenStateDef; controller: MugenStateController } | undefined => {
      const controller =
        state.controllers.find(
          (candidate) => matchesControllerType(candidate) && requestedControllerLine !== undefined && candidate.line === requestedControllerLine,
        ) ?? state.controllers.find(matchesControllerType);
      return controller ? { state, controller } : undefined;
    };

    if (requestedStateId !== undefined) {
      const requested = states.find((state) => state.id === requestedStateId);
      const target = requested ? findInState(requested) : undefined;
      if (target) {
        return target;
      }
    }

    const session = this.getStudioDebugSelection().runtimeSession;
    const preferredStateIds = [
      session?.lastExecutedState,
      session?.lastRoutedState?.stateId,
      ...(session?.executedStates ?? []),
      ...(session?.routedStates ?? []),
    ].filter((stateId): stateId is number => stateId !== undefined);
    for (const stateId of [...new Set(preferredStateIds)]) {
      const state = states.find((candidate) => candidate.id === stateId);
      const target = state ? findInState(state) : undefined;
      if (target) {
        return target;
      }
    }

    for (const state of states) {
      const target = findInState(state);
      if (target) {
        return target;
      }
    }
    return undefined;
  }

  private normalizeControllerKey(value: string): string {
    return value.toLowerCase().replace(/[\s_-]+/g, "");
  }

  private scrollSelectedInspectorStateIntoView(): void {
    window.requestAnimationFrame(() => {
      const selected = this.root.querySelector<HTMLElement>("[data-inspector-selected-state]");
      const scrollContainer = selected?.closest<HTMLElement>(".pane") ?? this.root.querySelector<HTMLElement>("#navigator");
      if (!scrollContainer || !selected) {
        this.scrollNavigatorToTop();
        return;
      }
      const navigatorRect = scrollContainer.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      const stickyHeader = scrollContainer.querySelector<HTMLElement>(".workspace-header");
      const stickyOffset =
        stickyHeader && window.getComputedStyle(stickyHeader).position === "sticky" ? stickyHeader.getBoundingClientRect().height : 0;
      scrollContainer.scrollTo({
        top: Math.max(0, scrollContainer.scrollTop + selectedRect.top - navigatorRect.top - stickyOffset - 12),
      });
    });
  }

  private scrollSelectedInspectorCommandIntoView(): void {
    window.requestAnimationFrame(() => {
      const selected = this.root.querySelector<HTMLElement>("[data-inspector-selected-command]");
      const scrollContainer = selected?.closest<HTMLElement>(".pane") ?? this.root.querySelector<HTMLElement>("#navigator");
      if (!scrollContainer || !selected) {
        this.scrollNavigatorToTop();
        return;
      }
      const navigatorRect = scrollContainer.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      const stickyHeader = scrollContainer.querySelector<HTMLElement>(".workspace-header");
      const stickyOffset =
        stickyHeader && window.getComputedStyle(stickyHeader).position === "sticky" ? stickyHeader.getBoundingClientRect().height : 0;
      scrollContainer.scrollTo({
        top: Math.max(0, scrollContainer.scrollTop + selectedRect.top - navigatorRect.top - stickyOffset - 12),
      });
    });
  }

  private commandToneLabel(tone: CommandPaletteTone, disabled = false): string {
    if (disabled) {
      return "disabled";
    }
    if (tone === "ok") {
      return "ready";
    }
    if (tone === "warn") {
      return "review";
    }
    if (tone === "error") {
      return "blocked";
    }
    if (tone === "active") {
      return "active";
    }
    return "open";
  }

  private getCommandPaletteActions(): CommandPaletteAction[] {
    const studioSummary = this.getStudioProjectSummary();
    const primaryGate = this.getPrimaryStudioGate(studioSummary);
    const evidence = this.getStudioEvidenceSummary();
    const assetAttention = studioSummary.assets.filter((asset) => isAttentionStatus(asset.status)).length;
    const modeAction = (mode: AppMode): (() => void) => () => {
      this.mode = mode;
      this.snapshot = this.getActiveSnapshot();
      this.writeUrlState();
    };
    const studioAction = (tab: StudioTab): (() => void) => () => {
      this.mode = "studio";
      this.studioTab = tab;
      this.snapshot = this.getActiveSnapshot();
      this.writeUrlState();
    };

    return [
      {
        id: "mode-runtime",
        group: "Surface",
        label: "Open Runtime",
        detail: "Return to the playable match viewport.",
        keywords: ["match", "playtest", "fight", "game"],
        tone: this.mode === "match" ? "ok" : "neutral",
        run: modeAction("match"),
      },
      {
        id: "mode-inspector",
        group: "Surface",
        label: "Open Inspector",
        detail: this.character ? "Inspect loaded DEF/AIR/CNS/CMD data." : "Load or inspect character data.",
        keywords: ["character", "air", "cns", "cmd", "parser"],
        tone: this.character ? "ok" : "warn",
        run: modeAction("inspect"),
      },
      {
        id: "studio-workbench",
        group: "Studio",
        label: "Open Studio Workbench",
        detail: primaryGate?.impact ?? "Review project health and next action.",
        keywords: ["project", "health", "overview", "workbench"],
        tone: primaryGate && isAttentionStatus(primaryGate.status) ? "warn" : "ok",
        run: studioAction("workbench"),
      },
      {
        id: "studio-assets",
        group: "Studio",
        label: "Review Assets",
        detail: assetAttention ? `${assetAttention} records need attention.` : `${studioSummary.assets.length} asset records tracked.`,
        keywords: ["asset", "atlas", "sprites", "fighter", "stage", "provenance"],
        tone: assetAttention ? "warn" : "ok",
        run: studioAction("assets"),
      },
      {
        id: "studio-evidence",
        group: "QA",
        label: "Open Evidence Browser",
        detail: `${evidence.stats.total} records, ${evidence.stats.attention} need attention.`,
        keywords: ["trace", "qa", "golden", "compatibility", "proof"],
        tone: evidence.stats.attention ? "warn" : "ok",
        run: studioAction("evidence"),
      },
      {
        id: "studio-build",
        group: "Build",
        label: "Open Build Surface",
        detail: this.lastCompiledProject ? "Runtime manifest is compiled." : "Compile and package project contracts.",
        keywords: ["package", "runtime manifest", "export", "compile"],
        tone: this.lastCompiledProject ? "ok" : "warn",
        run: studioAction("build"),
      },
      {
        id: "studio-debug",
        group: "Debug",
        label: "Open Runtime Debug",
        detail: "Inspect actor registry, live commands, helpers, projectiles, and effects.",
        keywords: ["actor", "registry", "helpers", "projectiles", "debugger"],
        tone: "ok",
        run: studioAction("debug"),
      },
      ...this.getDebugActorCommandPaletteActions(),
      ...this.getTraceFrameCommandPaletteActions(),
      ...this.getStageLayerCommandPaletteActions(),
      {
        id: "studio-modules",
        group: "Studio",
        label: "Open Module Graph",
        detail: "Review engine modules and future runtime boundaries.",
        keywords: ["engine", "modules", "architecture", "ports"],
        tone: "neutral",
        run: studioAction("modules"),
      },
      {
        id: "load-zip",
        group: "Import",
        label: "Load MUGEN ZIP",
        detail: "Choose a local character or project package ZIP.",
        keywords: ["character", "def", "mugen", "import"],
        tone: "active",
        run: () => this.root.querySelector<HTMLInputElement>("#zip-input")?.click(),
      },
      {
        id: "load-folder",
        group: "Import",
        label: "Load Character Folder",
        detail: "Choose a local folder containing a DEF file.",
        keywords: ["folder", "character", "def", "source"],
        tone: "active",
        run: () => this.root.querySelector<HTMLInputElement>("#folder-input")?.click(),
      },
      {
        id: "open-project",
        group: "Project",
        label: "Open project.json",
        detail: "Load a saved Studio project manifest.",
        keywords: ["manifest", "local", "project"],
        tone: "neutral",
        run: () => this.root.querySelector<HTMLInputElement>("#project-input")?.click(),
      },
      {
        id: "save-local-project",
        group: "Project",
        label: "Save Local Project",
        detail: "Persist the current project manifest in local browser storage.",
        keywords: ["localstorage", "save", "manifest"],
        tone: "neutral",
        run: () => this.saveCurrentProjectLocal(),
      },
      {
        id: "undo-project-edit",
        group: "Project",
        label: "Undo Project Edit",
        detail: this.studioEditHistory.canUndo ? "Restore the previous Studio project state." : "No Studio project edit is available to undo.",
        keywords: ["undo", "history", "project", "authoring"],
        tone: this.studioEditHistory.canUndo ? "active" : "neutral",
        disabled: this.mode !== "studio" || !this.studioEditHistory.canUndo,
        run: () => this.undoStudioProjectEdit(),
      },
      {
        id: "redo-project-edit",
        group: "Project",
        label: "Redo Project Edit",
        detail: this.studioEditHistory.canRedo ? "Reapply the next Studio project state." : "No Studio project edit is available to redo.",
        keywords: ["redo", "history", "project", "authoring"],
        tone: this.studioEditHistory.canRedo ? "active" : "neutral",
        disabled: this.mode !== "studio" || !this.studioEditHistory.canRedo,
        run: () => this.redoStudioProjectEdit(),
      },
      {
        id: "compile-runtime",
        group: "Build",
        label: "Compile Runtime Manifest",
        detail: "Create a runtime-manifest/v0 contract from current Studio state.",
        keywords: ["build", "compiler", "manifest", "runtime"],
        tone: this.lastCompiledProject ? "ok" : "warn",
        run: () => this.compileCurrentProject(),
      },
      {
        id: "export-trace",
        group: "QA",
        label: "Export Trace Artifact",
        detail: "Capture deterministic match evidence for gates and reviews.",
        keywords: ["smoke", "evidence", "runtime trace", "golden"],
        tone: this.lastTraceArtifact ? "ok" : "warn",
        run: () => this.exportRuntimeTraceArtifact(),
      },
      {
        id: "export-project",
        group: "Export",
        label: "Export project.json",
        detail: "Download the current Studio project contract.",
        keywords: ["download", "manifest", "project"],
        tone: "neutral",
        run: () => this.exportStudioProjectManifest(),
      },
      {
        id: "export-runtime",
        group: "Export",
        label: "Export Runtime Manifest",
        detail: "Download the compiled runtime contract.",
        keywords: ["download", "runtime", "manifest"],
        tone: this.lastCompiledProject ? "ok" : "warn",
        run: () => this.exportRuntimeManifest(),
      },
      {
        id: "export-package",
        group: "Export",
        label: "Export Project Package",
        detail: "Bundle contracts, reports, QA evidence, and mapped assets.",
        keywords: ["zip", "bundle", "package", "release"],
        tone: this.lastProjectBundle ? "ok" : "warn",
        run: () => {
          void this.exportProjectBundle();
        },
      },
      {
        id: "export-report",
        group: "Export",
        label: "Export Compatibility Report",
        detail: "Download compatibility data for the current runtime/imported character.",
        keywords: ["report", "compatibility", "unsupported", "mugen"],
        tone: this.character ? "ok" : "neutral",
        run: () => this.exportCompatibilityReport(),
      },
      {
        id: "reset-round",
        group: "Runtime",
        label: "Reset Round",
        detail: "Restart the active playtest round.",
        keywords: ["match", "playtest", "restart"],
        tone: "active",
        run: () => {
          if (this.isInspectorRuntimeSurface()) {
            this.resetInspectorRuntime();
          } else {
            this.audio.stopAll();
            this.matchRuntime.dispatch({ type: "reset" });
            this.snapshot = this.getActiveSnapshot();
          }
        },
      },
      {
        id: "next-round",
        group: "Runtime",
        label: "Start Next Round",
        detail: "Continue the match with official round resource reset rules.",
        keywords: ["match", "round", "continue", "red life"],
        tone: this.snapshot.round?.state && this.snapshot.round.state !== "fight" ? "active" : "neutral",
        run: () => {
          if (!this.isInspectorRuntimeSurface() && !this.snapshot.round?.match?.matchOver) {
            this.audio.stopAll();
            this.snapshot = this.matchRuntime.dispatch({ type: "next-round" });
          }
        },
      },
      {
        id: "toggle-play",
        group: "Runtime",
        label: this.snapshot.playing ? "Pause Simulation" : "Resume Simulation",
        detail: "Toggle the active runtime loop.",
        keywords: ["play", "pause", "loop", "simulation"],
        tone: this.snapshot.playing ? "ok" : "warn",
        run: () => {
          const playing = !this.snapshot.playing;
          this.snapshot =
            this.isInspectorRuntimeSurface()
              ? this.inspectorRuntime.dispatch({ type: "set-playing", playing })
              : this.matchRuntime.dispatch({ type: "set-playing", playing });
        },
      },
      {
        id: "step-frame",
        group: "Runtime",
        label: "Advance One Frame",
        detail: "Step the active runtime by a single frame.",
        keywords: ["1f", "frame", "tick", "debug"],
        tone: "neutral",
        run: () => {
          this.snapshot =
            this.isInspectorRuntimeSurface()
              ? this.inspectorRuntime.dispatch({ type: "step", ticks: 1 })
              : this.matchRuntime.step({ p1: this.keyboard.getState() }, { force: true });
          if (!this.isInspectorRuntimeSurface()) {
            this.audio.processSnapshot(this.snapshot);
          }
        },
      },
      {
        id: "inspector-animations",
        group: "Inspector",
        label: "Browse Animations",
        detail: "Open AIR actions and collision frame data.",
        keywords: ["air", "action", "frames", "clsn"],
        tone: this.character ? "ok" : "warn",
        run: () => {
          this.mode = "inspect";
          this.activeTab = "animations";
          this.snapshot = this.getActiveSnapshot();
          this.writeUrlState();
        },
      },
      {
        id: "inspector-states",
        group: "Inspector",
        label: "Browse States",
        detail: "Open CNS/ST states, controllers, and triggers.",
        keywords: ["cns", "statedef", "controllers", "triggers"],
        tone: this.character ? "ok" : "warn",
        run: () => {
          this.mode = "inspect";
          this.activeTab = "states";
          this.snapshot = this.getActiveSnapshot();
          this.writeUrlState();
        },
      },
      {
        id: "inspector-commands",
        group: "Inspector",
        label: "Browse Commands",
        detail: "Open parsed CMD command definitions.",
        keywords: ["cmd", "input", "buffer", "commands"],
        tone: this.character ? "ok" : "warn",
        run: () => {
          this.mode = "inspect";
          this.activeTab = "commands";
          this.snapshot = this.getActiveSnapshot();
          this.writeUrlState();
        },
      },
    ];
  }

  private getTraceFrameCommandPaletteActions(): CommandPaletteAction[] {
    const artifact = this.getActiveTraceArtifact();
    if (!artifact) {
      return [];
    }
    const frames = this.getTraceArtifactFrameSummaries(artifact);
    if (!frames.length) {
      return [];
    }
    const selectedIndex = Math.min(Math.max(0, this.selectedTraceFrameIndex), frames.length - 1);
    return frames.slice(0, 24).map((frame, index) => {
      const labels = [frame.label, ...frame.eventCategories, ...frame.combatReasons].filter((label): label is string => Boolean(label));
      const checksumShort = frame.checksum.slice(0, 10);
      const hasFrameActivity = labels.length > 0 || frame.actorCount > 0 || frame.effectCount > 0;
      const tone: CommandPaletteTone = index === selectedIndex ? "active" : hasFrameActivity ? "ok" : "neutral";
      return {
        id: `trace-frame:${index}`,
        group: "Trace",
        label: `Open Trace Frame ${frame.frameIndex + 1}`,
        detail: [
          `tick ${frame.tick}`,
          `sum ${checksumShort}`,
          frame.actorCount || frame.effectCount ? `${frame.actorCount} actors / ${frame.effectCount} effects` : undefined,
          labels.length ? labels.slice(0, 2).join(" / ") : undefined,
        ]
          .filter(Boolean)
          .join(" / "),
        keywords: [
          "trace",
          "frame",
          "evidence",
          "scrubber",
          "checksum",
          checksumShort,
          String(frame.frameIndex + 1),
          String(frame.tick),
          ...labels,
          ...frame.input.p1,
          ...(frame.input.p2 ?? []),
        ].filter((keyword): keyword is string => Boolean(keyword)),
        tone,
        run: () => {
          this.mode = "studio";
          this.studioTab = "evidence";
          this.studioEvidenceFilter = "trace";
          this.selectedTraceFrameIndex = index;
          this.snapshot = this.getActiveSnapshot();
          this.writeUrlState();
        },
      };
    });
  }

  private getStageLayerCommandPaletteActions(): CommandPaletteAction[] {
    const stage = this.findStage(this.selectedStageId) ?? rooftopDojoStage;
    const report = this.getStageCompatibilityReportFor(stage.id);
    const layers = this.getStudioStageLayerRows(stage, report);
    if (!layers.length) {
      return [];
    }
    return layers.slice(0, 18).map((layer, index) => {
      const statusTone = this.stageLayerStatusClass(layer.status);
      const tone: CommandPaletteTone = statusTone === "error" ? "error" : statusTone === "warn" ? "warn" : "ok";
      return {
        id: `stage-layer:${layer.id}:${index}`,
        group: "Stage",
        label: `Review ${layer.label}`,
        detail: [
          layer.status,
          layer.type,
          layer.tiled ? "tiled" : undefined,
          layer.controlId === undefined ? undefined : `ctrl ${layer.controlId}`,
          layer.detail,
        ]
          .filter(Boolean)
          .join(" / "),
        keywords: [
          "stage",
          "layer",
          "background",
          "controller",
          "bgdef",
          stage.id,
          stage.displayName,
          layer.id,
          layer.label,
          layer.status,
          layer.type,
          layer.fallback ?? "",
          ...layer.unsupported,
        ],
        tone,
        run: () => {
          this.mode = "studio";
          this.studioTab = "stage";
          this.selectedStageId = stage.id;
          this.snapshot = this.getActiveSnapshot();
          this.writeUrlState();
        },
      };
    });
  }

  private getDebugActorCommandPaletteActions(): CommandPaletteAction[] {
    const registry = this.matchRuntime.getActorRegistry();
    return registry.actors.slice(0, 12).map((actor) => ({
      id: `debug-actor:${actor.id}`,
      group: "Actor",
      label: `Inspect ${actor.label}`,
      detail: `${actor.id} / ${actor.kind} / state ${actor.stateNo} / anim ${actor.animNo}`,
      keywords: [
        "debug",
        "actor",
        "registry",
        actor.id,
        actor.label,
        actor.kind,
        actor.ownerId,
        actor.rootId,
        actor.parentId,
        String(actor.stateNo),
        String(actor.animNo),
      ],
      tone: actor.layer === "effect" ? "warn" : "ok",
      run: () => {
        this.mode = "studio";
        this.studioTab = "debug";
        this.studioSelectedActorId = actor.id;
        this.snapshot = this.getActiveSnapshot();
        this.writeUrlState();
      },
    }));
  }

  private renderWorkspaceBrand(): string {
    const studioSurfaces: Record<StudioTab, { eyebrow: string; title: string; description: string }> = {
      workbench: {
        eyebrow: "Engine Studio",
        title: "Studio Workbench",
        description: "Assemble roster, stage, evidence, and export contract from one local control room.",
      },
      assets: {
        eyebrow: "Asset workbench",
        title: "Asset Library",
        description: "Track source packages, runtime ownership, dependency gaps, replacements, and export readiness.",
      },
      inspector: {
        eyebrow: "Data inspector",
        title: "Character Inspector",
        description: "Inspect AIR timelines, CNS/CMD routes, sprite metadata, and package diagnostics.",
      },
      stage: {
        eyebrow: "Stage lab",
        title: "Stage Inspector",
        description: "Review camera bounds, floor data, background layers, controllers, and import gaps.",
      },
      debug: {
        eyebrow: "Runtime debug",
        title: "Runtime Debug Studio",
        description: "Inspect live actors, targets, effects, pause state, audio events, and trace-backed links.",
      },
      evidence: {
        eyebrow: "QA desk",
        title: "Evidence Browser",
        description: "Compare trace artifacts, compatibility gates, persisted evidence, and diagnostic blockers.",
      },
      modules: {
        eyebrow: "Engine map",
        title: "Module Contracts",
        description: "Review active engine modules, planned runtime contracts, and compatibility boundaries.",
      },
      build: {
        eyebrow: "Build desk",
        title: "Build & Export",
        description: "Compile runtime manifests, package local outputs, and verify export diagnostics.",
      },
    };
    const surface =
      this.mode === "studio"
        ? studioSurfaces[this.studioTab]
        : this.mode === "inspect"
          ? {
              eyebrow: "MUGEN inspector",
              title: "Character Intake",
              description: "Resolve DEF paths, inspect AIR/CNS/CMD data, and expose unsupported features.",
            }
          : {
              eyebrow: "Match lab",
              title: "Runtime Console",
              description: "Playtest roster, inspect collision/debug signals, then route fixes into Studio.",
            };
    return `
      <span class="workspace-eyebrow">${escapeHtml(surface.eyebrow)}</span>
      <h1>${escapeHtml(surface.title)}</h1>
      <p>${escapeHtml(surface.description)}</p>
    `;
  }

  private renderModeButton(mode: AppMode, label: string, hint: string): string {
    const status = this.getModeButtonStatus(mode);
    const currentAttr = this.mode === mode ? ' aria-current="page"' : "";
    const ariaLabel = `${label} mode: ${hint}. Status: ${status.label}`;
    return `
      <button type="button" class="${this.mode === mode ? "is-active" : ""}" aria-pressed="${this.mode === mode}" aria-label="${escapeHtml(
        ariaLabel,
      )}" title="${escapeHtml(ariaLabel)}"${currentAttr} data-mode="${mode}">
        <span class="mode-button-top">
          ${tablerIcon(iconForMode(mode), "ui-icon mode-icon")}
          <span class="mode-label">${escapeHtml(label)}</span>
          <span class="mode-dot is-${status.tone}" aria-hidden="true"></span>
        </span>
        <span class="mode-hint">${escapeHtml(hint)}</span>
        <span class="mode-status">${escapeHtml(status.label)}</span>
      </button>
    `;
  }

  private getModeButtonStatus(mode: AppMode): { label: string; tone: "ok" | "warn" | "neutral" } {
    if (mode === "inspect") {
      return this.character ? { label: "loaded", tone: "ok" } : { label: "empty", tone: "warn" };
    }
    if (mode === "studio") {
      const summary = this.getStudioProjectSummary();
      const attention = summary.gates.filter((gate) => isAttentionStatus(gate.status)).length;
      return attention ? { label: `${attention} issues`, tone: "warn" } : { label: "steady", tone: "ok" };
    }
    const diagnostics = (this.character?.diagnostics.length ?? 0) + this.importedStages.reduce((total, stage) => total + stage.diagnostics.length, 0);
    return diagnostics ? { label: `${diagnostics} diag`, tone: "warn" } : { label: "ready", tone: "ok" };
  }

  private renderWorkspaceSummary(): string {
    const diagnostics = (this.character?.diagnostics.length ?? 0) + this.importedStages.reduce((total, stage) => total + stage.diagnostics.length, 0);
    if (this.mode === "studio") {
      return "";
    }
    if (this.mode === "inspect") {
      const actions = this.character?.animations.size ?? 0;
      const states = this.character?.states.length ?? 0;
      const commands = this.character?.commands.length ?? 0;
      return `
        <div class="workspace-summary" aria-label="Inspector workspace status">
          <span class="${this.character ? "is-ok" : "is-warn"}"><b>${this.character ? "loaded" : "empty"}</b><small>package</small></span>
          <span><b>${actions}</b><small>actions</small></span>
          <span><b>${states}</b><small>states</small></span>
          <span><b>${commands}</b><small>commands</small></span>
        </div>
      `;
    }
    const p1 = this.findFighter(this.selectedP1);
    const p2 = this.findFighter(this.selectedP2);
    return `
      <div class="workspace-summary" aria-label="Runtime workspace status">
        <span><b>${escapeHtml(p1?.displayName ?? "P1")}</b><small>P1</small></span>
        <span><b>${escapeHtml(p2?.displayName ?? "CPU")}</b><small>CPU</small></span>
        <span><b>${this.getAvailableFighters().length}</b><small>fighters</small></span>
        <span class="${diagnostics ? "is-warn" : "is-ok"}"><b>${diagnostics}</b><small>diagnostics</small></span>
      </div>
    `;
  }

  private renderWorkspaceActions(): string {
    if (this.mode === "studio") {
      const summary = this.getStudioProjectSummary();
      const primaryGate = this.getPrimaryStudioGate(summary);
      const issueCount = summary.gates.filter((gate) => isAttentionStatus(gate.status)).length;
      const compiled = this.lastCompiledProject;
      return `
        <div class="workspace-actions" aria-label="Studio quick actions">
          <div class="workspace-actions-head">
            <span>Project Pipeline</span>
            <b>${summary.gates.length - issueCount}/${summary.gates.length} Gates</b>
          </div>
          ${this.renderStudioMissionStrip(summary, primaryGate, issueCount, compiled)}
          <div class="studio-project-open">
            <label class="studio-project-name">
              <span>Project name <b class="studio-project-dirty ${this.projectDirty ? "is-dirty" : "is-clean"}" aria-live="polite">${this.projectDirty ? "Unsaved" : "Saved"}</b></span>
              <input type="text" data-project-name value="${escapeHtml(summary.name)}" maxlength="${MAX_PROJECT_NAME_LENGTH}" autocomplete="off" aria-label="Project name" />
            </label>
            <div class="studio-edit-history" aria-label="Project edit history">
              <button type="button" class="studio-history-button" data-action="undo-project-edit" aria-label="Undo project edit" aria-keyshortcuts="Control+Z Meta+Z" title="Undo project edit" ${this.studioEditHistory.canUndo ? "" : "disabled"}>
                ${tablerIcon("undo", "ui-icon action-icon")}
              </button>
              <button type="button" class="studio-history-button" data-action="redo-project-edit" aria-label="Redo project edit" aria-keyshortcuts="Control+Shift+Z Control+Y Meta+Shift+Z Meta+Y" title="Redo project edit" ${this.studioEditHistory.canRedo ? "" : "disabled"}>
                ${tablerIcon("redo", "ui-icon action-icon")}
              </button>
            </div>
            <button type="button" data-action="open-project">
              ${tablerIcon("folder", "ui-icon action-icon")}
              <span>Open Project</span>
            </button>
            <button type="button" class="${this.projectDirty ? "is-dirty" : ""}" data-action="save-project-local" aria-label="Save current project locally${this.projectDirty ? ", unsaved changes" : ""}" title="Save current project locally">
              ${tablerIcon("save", "ui-icon action-icon")}
            </button>
          </div>
          ${this.renderProjectStorageConflict()}
        </div>
      `;
    }

    if (this.mode === "inspect") {
      const loaded = Boolean(this.character);
      const characterName = this.character?.definition.info.displayName ?? this.character?.definition.info.name ?? "No character loaded";
      const actionButtons = [
        { label: "Open ZIP", detail: "Local package", attribute: 'data-action="load-zip"', primary: true },
        { label: "Folder", detail: "Local source", attribute: 'data-action="load-folder"', primary: false },
        { label: "Workbench", detail: "Studio state", attribute: 'data-mode="studio"', primary: false },
        { label: "Report", detail: "Compatibility", attribute: 'data-action="export-report"', primary: false, disabled: !loaded },
      ];
      return `
        <div class="workspace-actions" aria-label="Inspector quick actions">
          <div class="workspace-next">
            <span>${loaded ? "Loaded package" : "Start here"}</span>
            <strong>${escapeHtml(loaded ? characterName : "Import a MUGEN character")}</strong>
            <small>${loaded ? "Browse AIR, states, commands, collisions, and compatibility facts." : "Drop a ZIP/folder or choose files locally. Nothing is uploaded."}</small>
          </div>
          <div class="workspace-action-grid">
            ${actionButtons.map((button) => this.renderWorkspaceActionButton(button)).join("")}
          </div>
        </div>
      `;
    }

    const diagnostics = (this.character?.diagnostics.length ?? 0) + this.importedStages.reduce((total, stage) => total + stage.diagnostics.length, 0);
    const p1 = this.findFighter(this.selectedP1);
    const p2 = this.findFighter(this.selectedP2);
    const actionButtons = [
      { label: "Reset", detail: "Restart round", attribute: 'data-action="reset-round"', primary: true },
      { label: "Inspect", detail: "Character data", attribute: 'data-mode="inspect"', primary: false },
      { label: "Debug", detail: "Runtime lens", attribute: 'data-studio-tab="debug"', primary: false },
      { label: "Ship", detail: "Build desk", attribute: 'data-studio-tab="build"', primary: false },
    ];
    return `
      <div class="workspace-actions" aria-label="Runtime quick actions">
        <div class="workspace-next">
          <span>Live playtest</span>
          <strong>${escapeHtml(p1?.displayName ?? "P1")} vs ${escapeHtml(p2?.displayName ?? "CPU")}</strong>
          <small>${diagnostics ? `${diagnostics} diagnostics need review before this build is clean.` : "Runtime roster is ready for local testing."}</small>
        </div>
        <div class="workspace-action-grid">
          ${actionButtons.map((button) => this.renderWorkspaceActionButton(button)).join("")}
        </div>
      </div>
    `;
  }

  private renderProjectStorageConflict(): string {
    const conflict = this.projectStorageConflict;
    if (!conflict) {
      return "";
    }
    return `
      <section class="studio-project-conflict" role="alert" aria-live="assertive" aria-label="Project storage conflict">
        <div class="studio-project-conflict-head">
          ${tablerIcon("alert", "ui-icon action-icon")}
          <span>
            <strong>External project update</strong>
            <small>${escapeHtml(conflict.projectId)} / local base r${conflict.expectedRevision} / remote r${conflict.actualRevision}</small>
          </span>
        </div>
        <div class="studio-project-conflict-actions">
          <button type="button" data-action="reload-project-remote" title="Reload the remote project revision">
            ${tablerIcon("reset", "ui-icon action-icon")}
            <span>Reload Remote</span>
          </button>
          <button type="button" data-action="keep-project-local" title="Save local edits as a new project copy">
            ${tablerIcon("save", "ui-icon action-icon")}
            <span>Keep Local Copy</span>
          </button>
        </div>
      </section>
    `;
  }

  private studioNextActionAttribute(action: StudioNextAction): string {
    switch (action.kind) {
      case "open-evidence":
        return 'data-studio-tab="evidence"';
      case "open-build":
        return 'data-studio-tab="build"';
      case "open-character-preview":
        return 'data-mode="inspect"';
      case "open-stage-preview":
        return 'data-studio-tab="stage"';
      case "relink-source":
        return 'data-action="load-zip"';
      case "replace-asset":
      case "regenerate-source":
        return 'data-studio-tab="assets" data-asset-filter="attention"';
      case "run-trace":
        return 'data-action="export-trace-artifact"';
      case "run-smoke":
        return 'data-studio-tab="build"';
      case "not-supported-yet":
        return 'data-studio-tab="modules"';
    }
  }

  private renderWorkspaceActionButton(input: { label: string; detail: string; attribute: string; primary: boolean; disabled?: boolean }): string {
    const ariaLabel = `${input.label}: ${input.detail}`;
    return `
      <button type="button"${input.primary ? ' class="primary-action"' : ""} ${input.attribute} aria-label="${escapeHtml(ariaLabel)}"${input.disabled ? " disabled" : ""}>
        ${tablerIcon(iconForAction(input.label, input.attribute), "ui-icon action-icon")}
        <span class="workspace-action-label">${escapeHtml(input.label)}</span>
        <small>${escapeHtml(input.detail)}</small>
      </button>
    `;
  }

  private renderStudioMissionStrip(
    summary: StudioProjectSummary,
    primaryGate: StudioProjectSummary["gates"][number] | undefined,
    issueCount: number,
    compiled: CompiledRuntimeManifest | undefined,
  ): string {
    const traceCount = this.traceArtifacts.length + this.storedTraceEvidence.length;
    const importedStatus: StudioStatus = this.importedSourceBundle || this.character ? "ok" : "pending";
    const evidenceStatus: StudioStatus = traceCount ? "ok" : "pending";
    const buildStatus: StudioStatus = compiled ? (compiled.diagnostics.errors.length ? "fail" : compiled.diagnostics.warnings.length ? "warn" : "ok") : "pending";
    const assembleStatus: StudioStatus = issueCount ? primaryGate?.status ?? "warn" : "ok";
    const packageStatus: StudioStatus = this.lastProjectBundle ? "ok" : compiled ? "pending" : "pending";
    const missionSteps: Array<{
      step: string;
      icon: StudioIconName;
      label: string;
      value: string;
      detail: string;
      status: StudioStatus;
      attribute: string;
    }> = [
      {
        step: "01",
        icon: "folder",
        label: "Import",
        value: this.importedSourceBundle ? "source linked" : this.character ? "character parsed" : "load source",
        detail: this.importedSourceBundle?.sourceName ?? this.character?.sourceName ?? "MUGEN ZIP/folder",
        status: importedStatus,
        attribute: this.character ? 'data-mode="inspect"' : 'data-action="load-zip"',
      },
      {
        step: "02",
        icon: "shield",
        label: "Validate",
        value: "validate files",
        detail: `${summary.stats.characters} fighters / ${summary.stats.stages} stages`,
        status: assembleStatus,
        attribute: 'data-studio-tab="workbench"',
      },
      {
        step: "03",
        icon: "route",
        label: "Assets",
        value: "map links",
        detail: issueCount ? `${issueCount} gates to review` : "gates clear",
        status: assembleStatus,
        attribute: 'data-studio-tab="assets"',
      },
      {
        step: "04",
        icon: "play",
        label: "Playtest",
        value: traceCount ? `${traceCount} trace${traceCount === 1 ? "" : "s"}` : "no trace yet",
        detail: this.snapshot.playing ? "local match live" : "local match paused",
        status: evidenceStatus,
        attribute: 'data-mode="match"',
      },
      {
        step: "05",
        icon: "build",
        label: "Compile",
        value: compiled ? "manifest ready" : "compile needed",
        detail: compiled ? `${compiled.modules.active.length} modules active` : "manifest v0",
        status: buildStatus,
        attribute: compiled ? 'data-studio-tab="build"' : 'data-action="compile-project"',
      },
      {
        step: "06",
        icon: "package",
        label: "Package",
        value: this.lastProjectBundle ? "exported build" : "package project",
        detail: this.lastProjectBundle ? `${this.lastProjectBundle.manifest.files.length} files bundled` : "build distributable",
        status: packageStatus,
        attribute: compiled ? 'data-action="export-package"' : 'data-action="compile-project"',
      },
      {
        step: "07",
        icon: "export",
        label: "Publish",
        value: "publish build",
        detail: this.lastProjectBundle ? "share or export" : "package first",
        status: this.lastProjectBundle ? "partial" : "planned",
        attribute: 'data-studio-tab="build"',
      },
    ];
    const nextMissionIndex = missionSteps.findIndex((mission) => mission.status !== "ok");
    return `
      <div class="studio-mission-strip" aria-label="Studio project flow">
        ${missionSteps.map((mission, index) => this.renderStudioMissionNode(mission, index === nextMissionIndex)).join("")}
      </div>
    `;
  }

  private renderStudioMissionNode(input: {
    step: string;
    icon: StudioIconName;
    label: string;
    value: string;
    detail: string;
    status: StudioStatus;
    attribute: string;
  }, isNext = false): string {
    const statusLabel = this.missionStatusLabel(input.status, isNext);
    const stateClass = statusLabel.toLowerCase();
    const ariaLabel = `${input.step} ${input.label}: ${input.value}. Status ${statusLabel}. ${input.detail}`;
    return `
      <button type="button" class="studio-mission-node is-${this.statusClassName(input.status)} status-${escapeHtml(input.status)} state-${escapeHtml(stateClass)}" ${input.attribute} aria-label="${escapeHtml(ariaLabel)}">
        <span class="studio-mission-step">${tablerIcon(input.icon, "ui-icon mission-icon")}</span>
        <span class="studio-mission-main">
          <strong><em>${escapeHtml(input.step)}</em>${escapeHtml(input.label)}</strong>
          <small>${escapeHtml(input.value)}</small>
        </span>
        <span class="studio-mission-state">${escapeHtml(statusLabel)}</span>
        <span class="studio-mission-detail">${escapeHtml(input.detail)}</span>
      </button>
    `;
  }

  private missionStatusLabel(status: StudioStatus, isNext = false): string {
    if (isNext && (status === "pending" || status === "planned")) {
      return "NEXT";
    }
    switch (status) {
      case "ok":
        return "OK";
      case "active":
        return "LIVE";
      case "fail":
        return "FAIL";
      case "blocked":
        return "BLOCK";
      case "unsupported":
        return "NO";
      case "pending":
        return "WAIT";
      case "partial":
        return "PART";
      case "planned":
        return "PLAN";
      case "unknown":
        return "UNK";
      case "warn":
      default:
        return "CHECK";
    }
  }

  private getPrimaryStudioGate(summary: StudioProjectSummary): StudioProjectSummary["gates"][number] | undefined {
    return summary.gates.find((gate) => isAttentionStatus(gate.status)) ?? summary.gates.find((gate) => gate.status !== "ok") ?? summary.gates[0];
  }

  private renderRuntimeRightPane(): string {
    return renderDebugPanel(
      this.character,
      this.snapshot,
      this.mode === "inspect" ? "inspect" : "match",
      this.getStageCompatibilityReports(),
      this.buildRuntimeRosterReport(),
      this.getActiveActorRegistry(),
    );
  }

  private renderStudioNavigator(): string {
    const activeNavigator = this.renderActiveStudioNavigator();
    return `
      ${this.renderStudioTabs({ compact: true })}
      ${activeNavigator}
    `;
  }

  private renderActiveStudioNavigator(): string {
    if (this.studioTab === "workbench") {
      return this.renderStudioWorkbenchNavigator();
    }
    if (this.studioTab === "assets") {
      return this.renderStudioAssetsNavigator();
    }
    if (this.studioTab === "inspector") {
      return this.renderStudioInspectorNavigator();
    }
    if (this.studioTab === "stage") {
      return this.renderStudioStageNavigator();
    }
    if (this.studioTab === "debug") {
      return this.renderStudioDebugNavigator();
    }
    if (this.studioTab === "evidence") {
      return this.renderStudioEvidenceNavigator();
    }
    if (this.studioTab === "modules") {
      return this.renderStudioModulesNavigator();
    }
    return this.renderStudioBuildNavigator();
  }

  private renderStudioTabs(options: { compact?: boolean } = {}): string {
    const activeTab = STUDIO_TABS.find((tab) => tab.id === this.studioTab);
    const activeStatus = this.getStudioTabStatus(this.studioTab);
    const compactLabels: Record<StudioTab, string> = {
      workbench: "Work",
      assets: "Assets",
      inspector: "Inspect",
      stage: "Stage",
      debug: "Debug",
      evidence: "Evidence",
      modules: "Modules",
      build: "Build",
    };
    return `
      <div class="section studio-tab-section ${options.compact ? "is-compact" : ""}">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Surface</span>
            <h2>${escapeHtml(activeTab?.label ?? "Studio")}</h2>
          </div>
          <span class="badge ${activeStatus.tone === "ok" ? "ok" : activeStatus.tone === "error" ? "error" : activeStatus.tone === "warn" ? "warn" : "active"}">${escapeHtml(activeStatus.label)}</span>
        </div>
        <div class="tabs studio-tabs" role="tablist" aria-label="Studio surfaces">
          ${STUDIO_TABS.map((tab) => {
            const status = this.getStudioTabStatus(tab.id);
            const selected = this.studioTab === tab.id;
            const currentAttr = selected ? ' aria-current="page"' : "";
            return `
              <button type="button" role="tab" aria-selected="${selected}" aria-label="${escapeHtml(
                `${tab.label}: ${tab.summary}. ${status.label}`,
              )}"${currentAttr} class="tab ${selected ? "is-active" : ""}" data-studio-tab="${tab.id}">
                <span class="tab-topline">
                  ${tablerIcon(iconForStudioTab(tab.id), "ui-icon tab-icon")}
                  <span class="tab-label">${escapeHtml(options.compact ? compactLabels[tab.id] : tab.label)}</span>
                  <span class="tab-state tab-state-${status.tone}">${escapeHtml(this.compactTabStatusLabel(status.label, status.tone))}</span>
                </span>
                <span class="tab-status">${escapeHtml(status.label)}</span>
                <span class="tab-hint">${escapeHtml(tab.summary)}</span>
              </button>
            `;
          }).join("")}
        </div>
        <p class="tab-summary">${escapeHtml(activeTab?.summary ?? "")}</p>
      </div>
    `;
  }

  private getStudioTabStatus(tab: StudioTab): { label: string; tone: "ok" | "warn" | "error" | "neutral" } {
    const summary = this.getStudioProjectSummary();
    if (tab === "workbench") {
      const attention = summary.gates.filter((gate) => isAttentionStatus(gate.status)).length;
      return attention ? { label: `${summary.gates.length - attention}/${summary.gates.length} gates`, tone: "warn" } : { label: "clear", tone: "ok" };
    }
    if (tab === "assets") {
      const library = this.getStudioAssetLibrarySummary();
      return library.stats.attention
        ? { label: `${library.stats.attention} attention`, tone: "warn" }
        : { label: `${library.stats.total} assets`, tone: "ok" };
    }
    if (tab === "inspector") {
      return this.character ? { label: `${this.character.animations.size} actions`, tone: "ok" } : { label: "load data", tone: "warn" };
    }
    if (tab === "stage") {
      const stage = this.findStage(this.selectedStageId);
      const report = stage ? this.getStageCompatibilityReportFor(stage.id) : undefined;
      const issueCount = report?.backgrounds.layers.filter((layer) => layer.status === "missing" || layer.status === "unsupported").length ?? 0;
      const controllerCount = report?.backgrounds.controllers.total ?? 0;
      if (report) {
        if (issueCount) {
          return { label: `${issueCount} layer gaps`, tone: "warn" };
        }
        if (controllerCount) {
          return { label: `${report.backgrounds.controllers.bounded}/${controllerCount} BGCtrl`, tone: "warn" };
        }
        return { label: `${report.backgrounds.layers.length} layers`, tone: "ok" };
      }
      if (!stage) {
        return { label: "no stage", tone: "warn" };
      }
      const nativeControllerCount = stage.bgControllers?.reduce((total, group) => total + group.controllers.length, 0) ?? 0;
      return nativeControllerCount
        ? { label: `${nativeControllerCount} native BGCtrl`, tone: "warn" }
        : { label: `${stage.layers.length} native layers`, tone: "ok" };
    }
    if (tab === "debug") {
      const registry = this.matchRuntime.getActorRegistry();
      return { label: `${registry.actors.length} actors`, tone: registry.actors.length >= 2 ? "ok" : "warn" };
    }
    if (tab === "evidence") {
      const evidence = this.getStudioEvidenceSummary();
      return evidence.stats.traceArtifacts || evidence.stats.persistedTraceArtifacts
        ? { label: `${evidence.stats.traceArtifacts + evidence.stats.persistedTraceArtifacts} traces`, tone: "ok" }
        : { label: `${evidence.stats.attention} attention`, tone: evidence.stats.attention ? "warn" : "neutral" };
    }
    if (tab === "modules") {
      const active = summary.modules.filter((module) => module.status === "active").length;
      const missing = summary.modules.filter((module) => module.status === "blocked" || module.status === "unsupported").length;
      return missing ? { label: `${missing} blocked`, tone: "error" } : { label: `${active}/${summary.modules.length} active`, tone: "ok" };
    }
    const readiness = this.getBuildReadinessRecords(summary);
    const blocked = readiness.filter((record) => record.state === "blocked").length;
    if (blocked) {
      return { label: `${blocked} blocked`, tone: "error" };
    }
    if (this.lastProjectBundle) {
      return { label: "packaged", tone: "ok" };
    }
    return this.lastCompiledProject ? { label: "compiled", tone: "ok" } : { label: "compile", tone: "warn" };
  }

  private compactTabStatusLabel(_label: string, tone: "ok" | "warn" | "error" | "neutral"): string {
    if (tone === "ok") {
      return "OK";
    }
    if (tone === "error") {
      return "ERR";
    }
    if (tone === "warn") {
      return "WARN";
    }
    return "INFO";
  }

  private renderStudioWorkbenchNavigator(): string {
    const summary = this.getStudioProjectSummary();
    const manifest = this.getGameProjectManifest(summary);
    const visibleAssets = summary.assets.slice(0, 10);
    const compiled = this.lastCompiledProject;
    const attentionGates = summary.gates.filter((gate) => isAttentionStatus(gate.status));
    const attentionAssets = summary.assets.filter((asset) => isAttentionStatus(asset.status));
    const projectContractBody = `
      <dl class="kv studio-kv">
        <dt>Project</dt><dd>${escapeHtml(summary.name)}</dd>
        <dt>Project ID</dt><dd class="mono">${escapeHtml(manifest.id)}</dd>
        <dt>Schema</dt><dd class="mono">${escapeHtml(manifest.schemaVersion)}</dd>
        <dt>Type</dt><dd class="mono">${escapeHtml(summary.projectType)}</dd>
        <dt>Entry</dt><dd class="mono">${escapeHtml(summary.entry.p1)} vs ${escapeHtml(summary.entry.p2)}</dd>
        <dt>Stage</dt><dd class="mono">${escapeHtml(summary.entry.stage)}</dd>
      </dl>
      <div class="studio-stat-grid">
        ${this.studioStat("Characters", summary.stats.characters)}
        ${this.studioStat("Stages", summary.stats.stages)}
        ${this.studioStat("Imports", summary.stats.importedCharacters + summary.stats.importedStages)}
        ${this.studioStat("Atlases", summary.stats.generatedAtlases)}
      </div>
      <div class="split-controls">
        <button type="button" data-mode="match">Playtest</button>
        <button type="button" data-mode="inspect">Inspect Data</button>
      </div>
      <div class="split-controls">
        <button type="button" data-action="open-project">Open project.json</button>
        <button type="button" data-action="save-project-local">Save local</button>
      </div>
      <div class="split-controls">
        <button type="button" data-action="export-project">Export project.json</button>
        <button type="button" data-action="compile-project">Compile runtime</button>
      </div>
      <div class="badge-row">
        <span class="badge ${compiled ? "ok" : "warn"}">${compiled ? "runtime manifest ready" : "runtime manifest pending"}</span>
        ${compiled ? `<span class="badge">${compiled.modules.active.length} active modules</span>` : ""}
        ${compiled?.diagnostics.warnings.length ? `<span class="badge warn">${compiled.diagnostics.warnings.length} compile warnings</span>` : ""}
      </div>
      ${
        this.projectImportWarnings.length
          ? `<div class="badge-row">${this.projectImportWarnings
              .slice(0, 3)
              .map((warning) => `<span class="badge warn">${escapeHtml(warning)}</span>`)
              .join("")}</div>`
          : ""
      }
    `;
    const recentProjectsBody = this.storedProjects.length
      ? `<div class="list">${this.storedProjects
          .slice(0, 5)
          .map(
            (project) => `
              <button type="button" class="list-item" data-stored-project-id="${escapeHtml(project.id)}">
                <span>
                  <span class="list-title">${escapeHtml(project.name)}</span>
                  <span class="list-meta">${escapeHtml(project.id)} / ${escapeHtml(formatDateTime(project.savedAt))}</span>
                  <span class="badge-row">
                    <span class="badge">${escapeHtml(project.manifest.entry.p1)} vs ${escapeHtml(project.manifest.entry.p2)}</span>
                    <span class="badge">${escapeHtml(project.manifest.entry.stage)}</span>
                  </span>
                </span>
              </button>
            `,
          )
          .join("")}</div>`
      : `<div class="empty-state">No local projects saved yet.</div>`;
    const studioPipelineBody = `
      <div class="pipeline-list">
        ${summary.gates
          .map(
            (gate, index) => `
              <span class="pipeline-step ${gate.status === "ok" ? "active" : ""}">
                ${index + 1} ${escapeHtml(gate.label)}
                <small>${escapeHtml(gate.detail)}</small>
                <small>Impact: ${escapeHtml(gate.impact)}</small>
                <small>Next: ${escapeHtml(gate.nextAction.label)}</small>
              </span>
            `,
          )
          .join("")}
      </div>
    `;
    const assetLibraryBody = visibleAssets.length
      ? `<div class="list">${visibleAssets.map((asset) => this.renderStudioAsset(asset)).join("")}</div>`
      : `<div class="empty-state">No project assets are available yet.</div>`;
    return `
      ${this.renderStudioProjectBrief(summary, manifest, compiled)}
      ${this.renderStudioWorkbenchDetails("Project Contract", `${summary.projectType} / ${summary.entry.stage}`, projectContractBody)}
      ${this.renderStudioWorkbenchDetails("Recent Projects", `${this.storedProjects.length} saved`, recentProjectsBody)}
      ${this.renderStudioWorkbenchDetails("Studio Pipeline", `${summary.gates.length - attentionGates.length}/${summary.gates.length} clear`, studioPipelineBody)}
      ${this.renderStudioWorkbenchDetails("Asset Library", `${attentionAssets.length} attention`, assetLibraryBody)}
    `;
  }

  private renderStudioProjectBrief(
    summary: StudioProjectSummary,
    manifest: GameProjectManifest,
    compiled: CompiledRuntimeManifest | undefined,
  ): string {
    const primaryGate = this.getPrimaryStudioGate(summary);
    const attentionGates = summary.gates.filter((gate) => isAttentionStatus(gate.status));
    const assetsNeedingAttention = summary.assets.filter((asset) => isAttentionStatus(asset.status));
    const traceCount = this.traceArtifacts.length + this.storedTraceEvidence.length;
    const sourceName = this.importedSourceBundle?.sourceName ?? this.character?.sourceName;
    const importedReady = Boolean(sourceName || this.importedProjectManifest);
    const buildStatus: StudioStatus = compiled ? (compiled.diagnostics.errors.length ? "fail" : compiled.diagnostics.warnings.length ? "warn" : "ok") : "pending";
    const gateStatus: StudioStatus = attentionGates.length ? primaryGate?.status ?? "warn" : "ok";
    const directiveAction = primaryGate ? this.studioNextActionAttribute(primaryGate.nextAction) : 'data-studio-tab="workbench"';
    const manifestShort = manifest.schemaVersion.replace("mugen-web-sandbox/", "");
    return `
      <div class="workbench-ops-section" role="region" aria-labelledby="workbench-ops-title">
        <header class="workbench-ops-head">
          <span class="gate-kicker">Mission control</span>
          <h2 id="workbench-ops-title">${escapeHtml(summary.name)}</h2>
          <p>${escapeHtml(summary.entry.p1)} vs ${escapeHtml(summary.entry.p2)} on ${escapeHtml(summary.entry.stage)}</p>
          <span class="badge ${this.statusClassName(gateStatus)}">${attentionGates.length ? `${attentionGates.length} issues` : "steady"}</span>
        </header>
        <div class="match-select-grid" aria-label="Studio matchup controls">
          <label class="field">
            <span class="list-meta">P1</span>
            <select data-studio-fighter-select="p1">${this.renderFighterOptions(this.selectedP1)}</select>
          </label>
          <label class="field">
            <span class="list-meta">CPU</span>
            <select data-studio-fighter-select="p2">${this.renderFighterOptions(this.selectedP2)}</select>
          </label>
          <label class="field field-wide">
            <span class="list-meta">Stage</span>
            <select data-studio-stage-select="stage">${this.renderStageOptions()}</select>
          </label>
        </div>
        <button type="button" class="workbench-directive is-${this.statusClassName(primaryGate?.status ?? "unknown")}" ${directiveAction}>
          <span class="gate-kicker">Next gate</span>
          <strong>${escapeHtml(primaryGate?.nextAction.label ?? "Review project")}</strong>
          <small>${escapeHtml(primaryGate?.impact ?? "No gate impact has been reported yet.")}</small>
          <span class="workbench-directive-metrics">
            ${this.statusBadge(primaryGate?.status ?? "unknown")}
            <span class="badge">${summary.gates.length - attentionGates.length}/${summary.gates.length} gates clear</span>
            <span class="badge ${compiled ? "ok" : "warn"}">${compiled ? "manifest ready" : "manifest pending"}</span>
          </span>
        </button>
        <div class="workbench-command-main">
          <div class="workbench-surface-grid" aria-label="Workbench surface jumps">
            <button type="button" class="workbench-route-button is-${assetsNeedingAttention.length ? "warn" : "ok"}" data-studio-tab="assets" data-asset-filter="${assetsNeedingAttention.length ? "attention" : "all"}" aria-label="Open Assets: ${escapeHtml(assetsNeedingAttention.length ? `${assetsNeedingAttention.length} assets need work` : `${summary.assets.length} assets ready`)}">
              ${tablerIcon("assets", "ui-icon route-icon")}
              <span>Assets</span>
              <strong>${assetsNeedingAttention.length ? `${assetsNeedingAttention.length} need work` : `${summary.assets.length} ready`}</strong>
              <small>${escapeHtml(assetsNeedingAttention[0]?.label ?? "source/runtime map")}</small>
            </button>
            <button type="button" class="workbench-route-button is-${traceCount ? "ok" : "warn"}" data-studio-tab="evidence" aria-label="Open Evidence: ${traceCount ? `${traceCount} traces available` : "capture trace"}">
              ${tablerIcon("evidence", "ui-icon route-icon")}
              <span>Evidence</span>
              <strong>${traceCount ? `${traceCount} traces` : "capture trace"}</strong>
              <small>${traceCount ? "review gates" : "export smoke run"}</small>
            </button>
            <button type="button" class="workbench-route-button is-${compiled ? "ok" : "warn"}" data-studio-tab="build" aria-label="Open Build: ${compiled ? "package ready" : "compile next"}">
              ${tablerIcon("build", "ui-icon route-icon")}
              <span>Build</span>
              <strong>${compiled ? "package ready" : "compile next"}</strong>
              <small>${compiled ? `${compiled.modules.active.length} active modules` : manifestShort}</small>
            </button>
            <button type="button" class="workbench-route-button is-ok" data-studio-tab="debug" aria-label="Open Debug: ${this.matchRuntime.getActorRegistry().actors.length} live actors">
              ${tablerIcon("debug", "ui-icon route-icon")}
              <span>Debug</span>
              <strong>${this.matchRuntime.getActorRegistry().actors.length} actors live</strong>
              <small>registry lenses</small>
            </button>
          </div>
        </div>
        <div class="workbench-lane-strip" aria-label="Project readiness lanes">
          <span class="${importedReady ? "is-ok" : "is-warn"}">
            <small>Source</small>
            <b>${importedReady ? "linked" : "local demo"}</b>
            <em>${escapeHtml(sourceName ?? "load MUGEN ZIP/folder")}</em>
          </span>
          <span class="${assetsNeedingAttention.length ? "is-warn" : "is-ok"}">
            <small>Assets</small>
            <b>${summary.assets.length}</b>
            <em>${assetsNeedingAttention.length ? `${assetsNeedingAttention.length} need review` : "records mapped"}</em>
          </span>
          <span class="${traceCount ? "is-ok" : "is-warn"}">
            <small>Evidence</small>
            <b>${traceCount}</b>
            <em>${traceCount ? "trace artifacts" : "export trace"}</em>
          </span>
          <span class="${this.statusClassName(buildStatus) === "ok" ? "is-ok" : "is-warn"}">
            <small>Build</small>
            <b>${compiled ? "ready" : "pending"}</b>
            <em>${compiled ? `${compiled.modules.active.length} modules active` : manifestShort}</em>
          </span>
        </div>
        <div class="workbench-action-bar" aria-label="Primary workbench actions">
          <button type="button" class="primary-action" data-mode="match">${tablerIcon("match", "ui-icon action-icon")}<span>Playtest</span></button>
          <button type="button" data-action="load-zip">${tablerIcon("folder", "ui-icon action-icon")}<span>Load Source</span></button>
          <button type="button" data-action="export-trace-artifact">${tablerIcon("evidence", "ui-icon action-icon")}<span>Export Trace</span></button>
          <button type="button" data-action="compile-project">${tablerIcon("build", "ui-icon action-icon")}<span>Compile</span></button>
        </div>
        <div class="badge-row">
          <span class="badge">${escapeHtml(manifestShort)}</span>
          <span class="badge">${summary.modules.length} modules</span>
          <span class="badge">${summary.assets.length} assets</span>
          ${compiled?.diagnostics.warnings.length ? `<span class="badge warn">${compiled.diagnostics.warnings.length} compile warnings</span>` : ""}
          ${this.projectImportWarnings.length ? `<span class="badge warn">${this.projectImportWarnings.length} import warnings</span>` : ""}
        </div>
      </div>
    `;
  }

  private renderStudioWorkbenchDetails(title: string, badge: string, body: string, open = false): string {
    return `
      <details class="studio-workbench-details" ${open ? "open" : ""}>
        <summary>
          <span>${escapeHtml(title)}</span>
          <small>${escapeHtml(badge)}</small>
        </summary>
        <div class="collapsible-body">${body}</div>
      </details>
    `;
  }

  private renderStudioAssetsNavigator(): string {
    const library = this.getStudioAssetLibrarySummary();
    return `
      ${this.renderStudioAssetsCommandCenter(library)}
      <section class="asset-browser-panel">
        <div class="section-heading-row">
          <h2>Project Assets</h2>
          <span class="badge">${library.visibleAssets.length} visible</span>
        </div>
        <div class="tabs studio-tabs" role="tablist" aria-label="Asset filters">
          ${library.filters.map((filter) => this.renderAssetFilterButton(filter, library)).join("")}
        </div>
        ${
          library.visibleAssets.length
            ? `<div class="list compact-list asset-browser-list">${library.visibleAssets
                .map((asset) => this.renderStudioAsset(asset, { selectable: true, selected: asset.id === library.selectedAsset?.id }))
                .join("")}</div>`
            : `<div class="empty-state">No assets match this filter.</div>`
        }
      </section>
    `;
  }

  private renderStudioAssetsCommandCenter(library: StudioAssetLibrarySummary): string {
    const attentionAssets = library.assets.filter((asset) => isAttentionStatus(asset.status));
    const priority = attentionAssets[0] ?? library.selectedAsset ?? library.visibleAssets[0];
    const sourceCounts = countBy(library.assets, (asset) => asset.source);
    const exportable = library.assets.filter((asset) => asset.canExport).length;
    const sourceTracked =
      (sourceCounts.get("mugen-import") ?? 0) +
      (sourceCounts.get("generated") ?? 0) +
      (sourceCounts.get("authored") ?? 0) +
      (sourceCounts.get("runtime-demo") ?? 0);
    const qaMapped = library.sourceRuntimeMap.lanes.qa ?? 0;
    return `
      <section class="asset-command-center">
        <div class="command-center-header">
          <div>
            <span class="panel-kicker">Asset workbench</span>
            <h2>Asset Library</h2>
          </div>
          <span class="badge active">${escapeHtml(library.activeFilter)}</span>
        </div>
        <div class="command-meter-grid" aria-label="Asset readiness metrics">
          <span><b>${library.stats.total}</b><small>assets</small></span>
          <span class="${attentionAssets.length ? "is-warn" : "is-ok"}"><b>${attentionAssets.length}</b><small>attention</small></span>
          <span class="${exportable === library.assets.length ? "is-ok" : "is-warn"}"><b>${exportable}/${library.assets.length}</b><small>exportable</small></span>
          <span class="${library.sourceRuntimeMap.records.length ? "is-ok" : "is-warn"}"><b>${library.sourceRuntimeMap.records.length}</b><small>mapped records</small></span>
        </div>
        <div class="asset-lane-strip" aria-label="Asset lifecycle lanes">
          <span class="${sourceTracked ? "is-ok" : "is-warn"}">
            <small>Source</small>
            <b>${sourceTracked}</b>
            <em>${sourceCounts.get("mugen-import") ?? 0} import / ${sourceCounts.get("generated") ?? 0} gen</em>
          </span>
          <span class="${library.sourceRuntimeMap.lanes.runtime ? "is-ok" : "is-warn"}">
            <small>Runtime</small>
            <b>${library.sourceRuntimeMap.lanes.runtime ?? 0}</b>
            <em>manifest links</em>
          </span>
          <span class="${qaMapped ? "is-ok" : "is-warn"}">
            <small>QA</small>
            <b>${qaMapped}</b>
            <em>evidence lanes</em>
          </span>
          <span class="${exportable === library.assets.length ? "is-ok" : "is-warn"}">
            <small>Export</small>
            <b>${exportable}/${library.assets.length}</b>
            <em>${library.missingReferences.length} missing refs</em>
          </span>
        </div>
        <div class="command-center-main">
          <div class="operator-callout">
            <span class="panel-kicker">${attentionAssets.length ? "Current blocker" : "Current focus"}</span>
            ${
              priority
                ? `
                  <strong>${escapeHtml(priority.label)}</strong>
                  <small>${escapeHtml(priority.impact)}</small>
                  <div class="badge-row">
                    ${this.statusBadge(priority.status)}
                    <span class="badge ${priority.canExport ? "ok" : "warn"}">${priority.canExport ? "exportable" : "blocked"}</span>
                    <span class="badge">${escapeHtml(priority.nextAction.label)}</span>
                  </div>
                `
                : `
                  <strong>No asset records</strong>
                  <small>The project manifest has not produced asset records yet.</small>
                `
            }
          </div>
          <div class="command-action-column" aria-label="Asset workbench actions">
            <button type="button" class="primary-action" data-asset-filter="${attentionAssets.length ? "attention" : "all"}">${
              tablerIcon(attentionAssets.length ? "alert" : "assets", "ui-icon action-icon")
            }<span>${attentionAssets.length ? "Review Attention" : "Review Assets"}</span></button>
            <button type="button" data-action="compile-project">${tablerIcon("build", "ui-icon action-icon")}<span>Compile Runtime</span></button>
            <button type="button" data-studio-tab="evidence">${tablerIcon("evidence", "ui-icon action-icon")}<span>Open Evidence</span></button>
          </div>
        </div>
      </section>
    `;
  }

  private renderStudioAssetsRightPane(): string {
    const library = this.getStudioAssetLibrarySummary();
    const sourceCounts = countBy(library.assets, (asset) => asset.source);
    const statusCounts = countBy(library.assets, (asset) => asset.status);
    const entryIds = new Set([this.selectedP1, this.selectedP2, this.selectedStageId]);
    const entryAssets = library.assets.filter((asset) => entryIds.has(asset.id));
    const attentionAssets = library.assets.filter((asset) => isAttentionStatus(asset.status));
    return `
      ${this.renderStudioAssetTriage(library)}
      ${this.renderSelectedAssetPanel(library)}
      ${this.renderAssetSideDrawer(
        "Filtered Assets",
        `${library.visibleAssets.length} visible`,
        `
          <div class="list compact-list">
            ${
              library.visibleAssets.length
                ? library.visibleAssets.slice(0, 8).map((asset) => this.renderStudioAsset(asset, { selectable: true, selected: asset.id === library.selectedAsset?.id })).join("")
                : `<div class="empty-state">No assets match ${escapeHtml(library.activeFilter)}.</div>`
            }
          </div>
        `,
        { className: "asset-filtered-panel", open: true },
      )}
      ${this.renderAssetSideDrawer(
        "Asset Provenance",
        `${library.activeFilter} filter`,
        `
          <dl class="kv studio-kv">
            <dt>Filter</dt><dd class="mono">${escapeHtml(library.activeFilter)}</dd>
            <dt>Generated</dt><dd class="mono">${sourceCounts.get("generated") ?? 0}</dd>
            <dt>Imported</dt><dd class="mono">${sourceCounts.get("mugen-import") ?? 0}</dd>
            <dt>Authored</dt><dd class="mono">${sourceCounts.get("authored") ?? 0}</dd>
            <dt>Runtime demo</dt><dd class="mono">${sourceCounts.get("runtime-demo") ?? 0}</dd>
          </dl>
          <div class="badge-row">
            ${[...statusCounts.entries()].map(([status, count]) => `<span class="badge">${escapeHtml(status)} ${count}</span>`).join("")}
          </div>
        `,
        { className: "asset-provenance-panel" },
      )}
      ${this.renderAssetSideDrawer(
        "Playtest Entry Assets",
        `${entryAssets.length} entry`,
        `
          <div class="list compact-list">
            ${
              entryAssets.length
                ? entryAssets.map((asset) => this.renderStudioAsset(asset, { selectable: true, selected: asset.id === library.selectedAsset?.id })).join("")
                : `<div class="empty-state">Current P1/P2/stage IDs are not represented in asset records.</div>`
            }
          </div>
        `,
        { className: "asset-entry-panel" },
      )}
      ${this.renderAssetSideDrawer(
        "Asset Attention Queue",
        `${attentionAssets.length} attention`,
        `
          <div class="list compact-list">
            ${
              attentionAssets.length
                ? attentionAssets.slice(0, 10).map((asset) => this.renderStudioAsset(asset, { selectable: true, selected: asset.id === library.selectedAsset?.id })).join("")
                : `<div class="empty-state">No pending, partial, warning, or failed asset records.</div>`
            }
          </div>
        `,
        { className: "asset-attention-panel", open: true },
      )}
    `;
  }

  private renderStudioAssetTriage(library: StudioAssetLibrarySummary): string {
    const attentionAssets = library.assets.filter((asset) => isAttentionStatus(asset.status));
    const exportable = library.assets.filter((asset) => asset.canExport).length;
    const selected = library.selectedAsset;
    return `
      <section class="asset-side-panel asset-triage-section">
        <div class="section-heading-row">
          <h2>Asset Triage</h2>
          <span class="badge ${attentionAssets.length ? "warn" : "ok"}">${attentionAssets.length} attention</span>
        </div>
        <div class="triage-grid">
          <span>
            <b>${exportable}/${library.assets.length}</b>
            <small>exportable</small>
          </span>
          <span>
            <b>${library.provenance.filter((record) => record.canExport).length}/${library.provenance.length}</b>
            <small>provenance ready</small>
          </span>
          <span>
            <b>${library.sourceRuntimeMap.records.length}</b>
            <small>mapped</small>
          </span>
          <span>
            <b>${library.relatedEvidence.length}</b>
            <small>evidence</small>
          </span>
        </div>
        <div class="selection-summary">
          <span class="panel-kicker">Selected asset</span>
          ${
            selected
              ? `
                <strong>${escapeHtml(selected.label)}</strong>
                <small>${escapeHtml(selected.nextAction.label)} / ${escapeHtml(selected.impact)}</small>
                <div class="badge-row">
                  ${this.statusBadge(selected.status)}
                  <span class="badge">${escapeHtml(selected.kind)}</span>
                  <span class="badge">${escapeHtml(selected.source)}</span>
                </div>
              `
              : `
                <strong>No selection</strong>
                <small>Select an asset row to inspect its source, runtime map, dependencies, and QA records.</small>
              `
          }
        </div>
      </section>
    `;
  }

  private renderSelectedAssetPanel(library: StudioAssetLibrarySummary): string {
    const asset = library.selectedAsset;
    if (!asset) {
      return `
        <section class="asset-side-panel asset-detail-panel">
          <h2>Asset Detail</h2>
          <div class="empty-state">Select an asset to inspect provenance, status, tags, and related evidence.</div>
        </section>
      `;
    }
    const replacementFlow = this.renderStudioAssetInspectorDrawer("Replacement Flow", this.renderAssetReplacementFlow(library), {
      badge: `${library.replacementPlan.candidates.length} candidates`,
      open: true,
    });
    const sourceRuntimeMap = this.renderStudioAssetInspectorDrawer("Source / Runtime Map", this.renderAssetSourceRuntimeMap(library.sourceRuntimeMap), {
      badge: `${library.sourceRuntimeMap.records.length} records`,
    });
    const dependencyGraph = this.renderStudioAssetInspectorDrawer("Dependency Graph", this.renderAssetDependencyGraph(library), {
      badge: `${library.selectedDependencyGraph.nodes.length} nodes`,
    });
    const dependencyDrilldown = this.renderStudioAssetInspectorDrawer(
      "Dependency Drilldown",
      `
        <div class="list compact-list">
          ${
            library.selectedDependencies.length
              ? library.selectedDependencies.map((dependency) => this.renderAssetDependencyRecord(dependency)).join("")
              : `<div class="empty-state">No dependency records are attached to this asset yet.</div>`
          }
        </div>
      `,
      { badge: `${library.selectedDependencies.length} records` },
    );
    const missingReferences = this.renderStudioAssetInspectorDrawer(
      "Missing / Partial References",
      `
        <div class="list compact-list">
          ${
            library.missingReferences.length
              ? library.missingReferences.map((dependency) => this.renderAssetDependencyRecord(dependency)).join("")
              : `<div class="empty-state">No missing or partial references for this asset under the current project manifest.</div>`
          }
        </div>
      `,
      { badge: `${library.missingReferences.length} refs` },
    );
    const relatedEvidence = this.renderStudioAssetInspectorDrawer(
      "Related Evidence",
      `
        <div class="list compact-list">
          ${
            library.relatedEvidence.length
              ? library.relatedEvidence.slice(0, 6).map((record) => this.renderEvidenceRecord(record)).join("")
              : `<div class="empty-state">No evidence records are linked to this asset yet.</div>`
          }
        </div>
      `,
      { badge: `${library.relatedEvidence.length} records` },
    );
    return `
      <section class="asset-side-panel asset-detail-panel">
        <div class="section-heading-row">
          <h2>Asset Detail</h2>
          ${this.statusBadge(asset.status)}
        </div>
        <div class="action-callout">
          <span class="panel-kicker">Next action</span>
          <strong>${escapeHtml(asset.nextAction.label)}</strong>
          <small>${escapeHtml(asset.impact)}</small>
        </div>
        <dl class="kv studio-kv">
          <dt>Name</dt><dd>${escapeHtml(asset.label)}</dd>
          <dt>ID</dt><dd class="mono">${escapeHtml(asset.id)}</dd>
          <dt>Kind</dt><dd class="mono">${escapeHtml(asset.kind)}</dd>
          <dt>Source</dt><dd class="mono">${escapeHtml(asset.source)}</dd>
          <dt>Status</dt><dd>${this.statusBadge(asset.status)}</dd>
          <dt>Detail</dt><dd>${escapeHtml(asset.detail)}</dd>
          <dt>Impact</dt><dd>${escapeHtml(asset.impact)}</dd>
          <dt>Next action</dt><dd>${escapeHtml(asset.nextAction.label)}</dd>
           <dt>Export</dt><dd>${this.statusBadge(asset.canExport ? "ok" : "blocked")}</dd>
           <dt>Provenance</dt><dd>${library.selectedProvenance ? this.statusBadge(library.selectedProvenance.status === "complete" ? "ok" : library.selectedProvenance.status === "blocked" ? "blocked" : "warn") : this.statusBadge("unknown")}</dd>
           <dt>Provenance schema</dt><dd class="mono">${escapeHtml(library.selectedProvenance?.schemaVersion ?? "missing")}</dd>
           <dt>License</dt><dd class="mono">${escapeHtml(library.selectedProvenance?.license.expression ?? "unknown")} / ${library.selectedProvenance?.license.status ?? "unknown"}</dd>
           <dt>Transforms</dt><dd>${library.selectedProvenance ? `${library.selectedProvenance.transforms.length} ordered` : "missing"}</dd>
           <dt>QA links</dt><dd>${library.selectedProvenance?.qaLinks.length ?? 0}</dd>
           <dt>Input digest</dt><dd class="mono">${escapeHtml(library.selectedProvenance?.inputDigest?.digest ?? "missing")}</dd>
          <dt>Output digest</dt><dd class="mono">${escapeHtml(library.selectedProvenance?.outputDigest?.digest ?? "missing")}</dd>
          <dt>Input files</dt><dd>${library.selectedProvenance ? `${library.selectedProvenance.inputFiles.filter((file) => file.digest).length}/${library.selectedProvenance.inputFiles.length} hashed` : "missing"}</dd>
          <dt>Output files</dt><dd>${library.selectedProvenance ? `${library.selectedProvenance.outputFiles.filter((file) => file.digest).length}/${library.selectedProvenance.outputFiles.length} hashed` : "missing"}</dd>
          <dt>Source ref</dt><dd class="mono">${escapeHtml(library.selectedProvenance?.sourceRef ?? "missing")}</dd>
          <dt>Evidence</dt><dd>${asset.evidenceIds.length ? asset.evidenceIds.map((id) => `<span class="badge">${escapeHtml(id)}</span>`).join(" ") : "none linked yet"}</dd>
        </dl>
        <div class="badge-row">
           ${asset.tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
           <span class="badge">${escapeHtml(asset.severity)}</span>
           ${asset.blockedBy.map((id) => `<span class="badge warn">blocked by ${escapeHtml(id)}</span>`).join("")}
           ${(library.selectedProvenance?.warnings ?? []).slice(0, 4).map((warning) => `<span class="badge warn">${escapeHtml(warning)}</span>`).join("")}
         </div>
      </section>
      ${replacementFlow}
      ${sourceRuntimeMap}
      ${dependencyGraph}
      ${dependencyDrilldown}
      ${missingReferences}
      ${relatedEvidence}
    `;
  }

  private renderStudioAssetInspectorDrawer(title: string, body: string, options: { badge?: string; open?: boolean } = {}): string {
    return this.renderStudioLedgerDrawer(title, body, {
      badge: options.badge,
      bodyClassName: "asset-inspector-drawer-body",
      className: "asset-inspector-drawer",
      open: options.open,
    });
  }

  private renderAssetSideDrawer(
    title: string,
    badge: string,
    body: string,
    options: { className?: string; open?: boolean } = {},
  ): string {
    const className = options.className ? `asset-side-panel ${options.className}` : "asset-side-panel";
    return this.renderStudioLedgerDrawer(title, body, {
      badge,
      bodyClassName: "asset-side-panel-body",
      className,
      open: options.open,
    });
  }

  private renderStudioLedgerDrawer(
    title: string,
    body: string,
    options: { badge?: string; bodyClassName: string; className: string; open?: boolean },
  ): string {
    return `
      <details class="${options.className} studio-ledger-drawer" ${options.open ? "open" : ""}>
        <summary>
          <span>${escapeHtml(title)}</span>
          ${options.badge ? `<small>${escapeHtml(options.badge)}</small>` : ""}
        </summary>
        <div class="${options.bodyClassName} studio-ledger-drawer-body">
          ${body}
        </div>
      </details>
    `;
  }

  private renderAssetSourceRuntimeMap(map: StudioAssetSourceRuntimeMap): string {
    if (map.records.length === 0) {
      return `<div class="empty-state">No source/runtime mapping is available for the selected asset yet.</div>`;
    }
    return `
      <div class="source-runtime-map" data-source-runtime-map-count="${map.records.length}">
        <div class="badge-row">
          ${(["source", "manifest", "runtime", "qa", "export"] as StudioAssetMappingLane[])
            .map((lane) => `<span class="badge">${escapeHtml(lane)} ${map.lanes[lane] ?? 0}</span>`)
            .join("")}
        </div>
        <div class="list compact-list">
          ${map.records.map((record) => this.renderAssetSourceRuntimeRecord(record)).join("")}
        </div>
      </div>
    `;
  }

  private renderAssetSourceRuntimeRecord(record: StudioAssetSourceRuntimeRecord): string {
    return `
      <div class="list-item">
        <span>
          <span class="list-title">${escapeHtml(record.label)}</span>
          <span class="list-meta">${escapeHtml(record.lane)} / ${record.path ? `${escapeHtml(record.path)} / ` : ""}${escapeHtml(record.detail)}</span>
          <span class="badge-row">
            ${this.statusBadge(record.status)}
            <span class="badge">${escapeHtml(record.lane)}</span>
          </span>
        </span>
      </div>
    `;
  }

  private renderAssetReplacementFlow(library: StudioAssetLibrarySummary): string {
    const plan = library.replacementPlan;
    const roleLabel = this.formatReplacementRole(plan.role);
    return `
      <div class="replacement-flow" data-replacement-candidate-count="${plan.candidates.length}">
        <dl class="kv studio-kv">
          <dt>Target</dt><dd>${plan.currentLabel ? `${escapeHtml(roleLabel)} / ${escapeHtml(plan.currentLabel)}` : escapeHtml(roleLabel)}</dd>
          <dt>Status</dt><dd>${this.statusBadge(plan.canApply ? "active" : "pending")}</dd>
          <dt>Rule</dt><dd>${escapeHtml(plan.reason)}</dd>
        </dl>
        <div class="list compact-list">
          ${
            plan.candidates.length
              ? plan.candidates.map((candidate) => this.renderAssetReplacementCandidate(candidate)).join("")
              : `<div class="empty-state">${escapeHtml(plan.reason)}</div>`
          }
        </div>
      </div>
    `;
  }

  private renderAssetReplacementCandidate(candidate: StudioAssetReplacementCandidate): string {
    return `
      <button type="button" class="list-item replacement-candidate" data-asset-replacement-id="${escapeHtml(candidate.id)}">
        <span>
          <span class="list-title">Use ${escapeHtml(candidate.label)} as ${escapeHtml(this.formatReplacementRole(candidate.role))}</span>
          <span class="list-meta">${escapeHtml(candidate.kind)} / ${escapeHtml(candidate.source)} / ${escapeHtml(candidate.detail)}</span>
          <span class="badge-row">
            ${this.statusBadge(candidate.status)}
            ${candidate.active ? `<span class="badge active">currently selected</span>` : ""}
            ${candidate.tags.slice(0, 3).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
          </span>
        </span>
      </button>
    `;
  }

  private renderAssetDependencyGraph(library: StudioAssetLibrarySummary): string {
    const graph = library.selectedDependencyGraph;
    const root = graph.nodes.find((node) => node.root);
    const children = graph.nodes.filter((node) => !node.root);
    if (!library.selectedAsset || !root) {
      return `<div class="empty-state">Select an asset to map manifest, module, source, playtest, and evidence references.</div>`;
    }
    return `
      <div
        class="asset-graph"
        role="group"
        aria-label="Dependency graph for ${escapeHtml(library.selectedAsset.label)}"
        data-dependency-graph-node-count="${graph.nodes.length}"
        data-dependency-graph-edge-count="${graph.edges.length}"
      >
        <div class="badge-row">
          <span class="badge">${graph.stats.total} nodes</span>
          <span class="badge ok">${graph.stats.ok} ok</span>
          <span class="badge ${graph.stats.attention ? "warn" : "ok"}">${graph.stats.attention} attention</span>
          <span class="badge ${graph.stats.blocked ? "error" : "ok"}">${graph.stats.blocked} blocked</span>
        </div>
        <div class="asset-graph-map">
          ${this.renderAssetDependencyGraphNode(root)}
          <div class="asset-graph-branches">
            ${children
              .map(
                (node) => `
                  <div class="asset-graph-branch">
                    <span class="asset-graph-connector is-${this.statusClassName(node.status)}" aria-hidden="true"></span>
                    ${this.renderAssetDependencyGraphNode(node)}
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  private renderAssetDependencyGraphNode(node: StudioAssetDependencyGraphNode): string {
    return `
      <div
        class="asset-graph-node is-${this.statusClassName(node.status)}${node.root ? " is-root" : ""}"
        data-asset-graph-node-id="${escapeHtml(node.id)}"
        data-asset-graph-node-kind="${escapeHtml(node.kind)}"
      >
        <span class="asset-graph-kind">${escapeHtml(node.kind)}</span>
        <strong>${escapeHtml(node.label)}</strong>
        <small>${escapeHtml(node.detail)}</small>
        ${this.statusBadge(node.status)}
      </div>
    `;
  }

  private renderAssetDependencyRecord(record: StudioAssetDependencyRecord): string {
    return `
      <div class="list-item">
        <span>
          <span class="list-title">${escapeHtml(record.label)}</span>
          <span class="list-meta">${escapeHtml(record.kind)} / ${escapeHtml(record.detail)}</span>
          <span class="badge-row">
            ${this.statusBadge(record.status)}
            <span class="badge">${escapeHtml(record.id)}</span>
          </span>
        </span>
      </div>
    `;
  }

  private renderStudioRightPane(): string {
    if (this.studioTab === "assets") {
      return this.renderStudioAssetsRightPane();
    }
    if (this.studioTab === "inspector") {
      return this.renderStudioInspectorRightPane();
    }
    if (this.studioTab === "stage") {
      return this.renderStudioStageRightPane();
    }
    if (this.studioTab === "debug") {
      return this.renderStudioDebugRightPane();
    }
    if (this.studioTab === "modules") {
      return this.renderStudioModulesRightPane();
    }
    if (this.studioTab === "evidence") {
      return this.renderStudioEvidenceRightPane();
    }
    if (this.studioTab === "build") {
      return this.renderStudioBuildRightPane();
    }
    return this.renderStudioWorkbenchRightPane();
  }

  private renderStudioWorkbenchRightPane(): string {
    const summary = this.getStudioProjectSummary();
    const primaryGate = this.getPrimaryStudioGate(summary);
    const warnings = this.getWorkbenchWarningRows(summary);
    const nextActionAttribute = primaryGate ? this.studioNextActionAttribute(primaryGate.nextAction) : 'data-studio-tab="workbench"';
    const score = this.getWorkbenchHealthScore(summary);
    const healthBand = this.getWorkbenchHealthBand(score);
    const selectedAsset = this.getWorkbenchSelectedAsset(summary);
    const healthCopy =
      primaryGate?.nextAction.kind === "relink-source"
        ? "Import real source files before compatibility claims are trusted."
        : primaryGate?.impact ?? "Review the next issue before packaging this session.";
    const selectedAssetAttribute = selectedAsset
      ? `data-studio-tab="assets" data-studio-asset-id="${escapeHtml(selectedAsset.id)}" data-asset-filter="selected"`
      : 'data-studio-tab="assets"';
    return `
      <section class="studio-pro-inspector" aria-label="Studio project health">
        <header class="studio-pro-inspector-head">
          <span class="panel-kicker">Project Health</span>
          <h2>Readiness</h2>
          <span class="pro-health-badge is-${healthBand.tone}">${score} / 100</span>
        </header>

        <div class="pro-health-card is-${healthBand.tone}" style="--health-score: ${score}%">
          <small>Readiness</small>
          <strong>${escapeHtml(healthBand.label)}</strong>
          <span class="pro-health-track" aria-hidden="true"><i></i></span>
          <p>${escapeHtml(healthCopy)}</p>
          <button type="button" class="pro-primary-action" ${nextActionAttribute}>
            ${tablerIcon(primaryGate ? iconForAction(primaryGate.nextAction.label, nextActionAttribute) : "workbench", "ui-icon action-icon")}
            <span>Review Issues</span>
          </button>
        </div>

        <div class="pro-inspector-section" aria-label="Active issues">
          <div class="pro-section-head">
            <span>Active Issues</span>
            <b>${Math.min(warnings.length, 3)}</b>
          </div>
          ${
            warnings.length
              ? `<div class="pro-warning-list">${warnings.slice(0, 3)
                  .map(
                    (row, index) => `
                      <button type="button" class="pro-warning-row${index === 0 ? " is-priority" : ""} is-${this.statusClassName(row.status)}" ${row.attribute}>
                        ${tablerIcon(row.icon, "ui-icon")}
                        <span>
                          <strong>${escapeHtml(row.label)}</strong>
                          <small>${escapeHtml(row.detail)}</small>
                        </span>
                        <em>${escapeHtml(this.formatWorkbenchIssueMeta(row.meta))}</em>
                      </button>
                    `,
                  )
                  .join("")}</div>`
              : `<div class="pro-empty-note">No active Studio issue is blocking this workbench state.</div>`
          }
        </div>

        <div class="pro-inspector-section" aria-label="Selected asset">
          <div class="pro-section-head">
            <span>Selected Asset</span>
            ${selectedAsset ? this.statusBadge(selectedAsset.status) : "<b>none</b>"}
          </div>
          <button type="button" class="pro-selected-asset is-${this.statusClassName(selectedAsset?.status ?? "unknown")}" ${selectedAssetAttribute}>
            <span class="pro-asset-thumb">${tablerIcon(selectedAsset ? iconForAssetRecord(selectedAsset) : "assets", "ui-icon")}</span>
            <span>
              <strong>${escapeHtml(selectedAsset?.label ?? "No selected asset")}</strong>
              <small>${escapeHtml(selectedAsset ? `${selectedAsset.kind} / ${selectedAsset.source}` : "Open the asset desk")}</small>
              <em>${escapeHtml(selectedAsset?.detail ?? "Select an asset to inspect source, runtime, and QA state.")}</em>
            </span>
          </button>
        </div>
      </section>
    `;
  }

  private getWorkbenchSelectedAsset(summary: StudioProjectSummary): StudioProjectSummary["assets"][number] | undefined {
    return (
      summary.assets.find((asset) => asset.id === this.selectedP1) ??
      summary.assets.find((asset) => asset.id === this.selectedP2) ??
      summary.assets.find((asset) => asset.id === this.selectedStageId) ??
      summary.assets.find((asset) => isAttentionStatus(asset.status)) ??
      summary.assets[0]
    );
  }

  private getWorkbenchHealthBand(score: number): { label: string; tone: "ok" | "warn" | "error" } {
    if (score >= 82) {
      return { label: "Ready", tone: "ok" };
    }
    if (score >= 58) {
      return { label: "Review", tone: "warn" };
    }
    return { label: "Critical", tone: "error" };
  }

  private getWorkbenchHealthScore(summary: StudioProjectSummary): number {
    const gatePenalty = summary.gates.reduce((total, gate) => total + this.healthPenaltyForStatus(gate.status, 14), 0);
    const assetPenalty = Math.min(
      24,
      summary.assets.reduce((total, asset) => total + this.healthPenaltyForStatus(asset.status, 4), 0),
    );
    const compiled = this.lastCompiledProject;
    const buildPenalty = compiled
      ? compiled.diagnostics.errors.length * 18 + compiled.modules.missing.length * 12 + compiled.diagnostics.warnings.length * 4
      : 8;
    const tracePenalty = this.lastTraceArtifact ? 0 : 4;
    return Math.max(0, Math.min(100, Math.round(100 - gatePenalty - assetPenalty - buildPenalty - tracePenalty)));
  }

  private healthPenaltyForStatus(status: StudioStatus, maxPenalty: number): number {
    if (status === "ok" || status === "active") {
      return 0;
    }
    if (status === "fail" || status === "blocked" || status === "unsupported") {
      return maxPenalty;
    }
    if (status === "pending" || status === "planned" || status === "unknown") {
      return Math.ceil(maxPenalty * 0.58);
    }
    return Math.ceil(maxPenalty * 0.42);
  }

  private getWorkbenchWarningRows(summary: StudioProjectSummary): Array<{
    label: string;
    detail: string;
    meta: string;
    status: StudioStatus;
    icon: StudioIconName;
    attribute: string;
  }> {
    const rows: Array<{
      label: string;
      detail: string;
      meta: string;
      status: StudioStatus;
      icon: StudioIconName;
      attribute: string;
    }> = [];
    for (const gate of summary.gates.filter((item) => isAttentionStatus(item.status))) {
      rows.push({
        label: gate.label,
        detail: gate.detail,
        meta: gate.nextAction.label,
        status: gate.status,
        icon: "shield",
        attribute: this.studioNextActionAttribute(gate.nextAction),
      });
    }
    for (const asset of summary.assets.filter((item) => isAttentionStatus(item.status))) {
      rows.push({
        label: asset.label,
        detail: asset.detail,
        meta: asset.nextAction.label,
        status: asset.status,
        icon: iconForAssetRecord(asset),
        attribute: `data-studio-tab="assets" data-studio-asset-id="${escapeHtml(asset.id)}" data-asset-filter="attention"`,
      });
    }
    const compiled = this.lastCompiledProject;
    if (!compiled) {
      rows.push({
        label: "Runtime manifest",
        detail: "Compile the current project before exporting a runtime package.",
        meta: "Compile runtime",
        status: "pending",
        icon: "build",
        attribute: 'data-action="compile-project"',
      });
    } else if (compiled.diagnostics.errors.length || compiled.diagnostics.warnings.length || compiled.modules.missing.length) {
      rows.push({
        label: "Compiled manifest diagnostics",
        detail: `${compiled.diagnostics.errors.length} errors / ${compiled.diagnostics.warnings.length} warnings / ${compiled.modules.missing.length} missing modules`,
        meta: "Open build",
        status: compiled.diagnostics.errors.length || compiled.modules.missing.length ? "fail" : "warn",
        icon: "build",
        attribute: 'data-studio-tab="build"',
      });
    }
    if (!this.lastTraceArtifact) {
      rows.push({
        label: "Runtime trace evidence",
        detail: "No current trace artifact is attached to this project state.",
        meta: "Export trace",
        status: "pending",
        icon: "evidence",
        attribute: 'data-action="export-trace-artifact"',
      });
    }
    return rows;
  }

  private formatWorkbenchIssueMeta(label: string): string {
    const normalized = label.toLowerCase();
    if (normalized.includes("load") || normalized.includes("import")) {
      return "Load";
    }
    if (normalized.includes("review") || normalized.includes("qa") || normalized.includes("decode")) {
      return "Review";
    }
    if (normalized.includes("compile") || normalized.includes("manifest")) {
      return "Compile";
    }
    if (normalized.includes("trace")) {
      return "Trace";
    }
    if (normalized.includes("export") || normalized.includes("package")) {
      return "Export";
    }
    if (normalized.includes("open")) {
      return "Open";
    }
    return label.split(/\s+/)[0] ?? label;
  }

  private renderRuntimeManifestPanel(): string {
    const compiled = this.lastCompiledProject;
    return `
      <div class="section">
        <h2>Runtime Manifest</h2>
        ${
          compiled
            ? `
              <dl class="kv studio-kv">
                <dt>Schema</dt><dd class="mono">${escapeHtml(compiled.schemaVersion)}</dd>
                <dt>Project</dt><dd class="mono">${escapeHtml(compiled.projectId)}</dd>
                <dt>Entry</dt><dd class="mono">${escapeHtml(compiled.entry.p1)} vs ${escapeHtml(compiled.entry.p2)}</dd>
                <dt>Stage</dt><dd class="mono">${escapeHtml(compiled.entry.stage)}</dd>
                <dt>Tick</dt><dd class="mono">${compiled.runtime.tickRate} fps</dd>
                <dt>Contracts</dt><dd class="mono">${compiled.contracts.sharedContracts.length} shared / ${compiled.contracts.moduleContracts.length} modules</dd>
              </dl>
              ${this.renderSharedContractsStrip(compiled)}
              <div class="badge-row">
                <span class="badge ok">${compiled.modules.active.length} active</span>
                <span class="badge warn">${compiled.modules.planned.length} planned</span>
                <span class="badge ${compiled.modules.missing.length ? "error" : "ok"}">${compiled.modules.missing.length} missing</span>
                <span class="badge ${compiled.diagnostics.warnings.length ? "warn" : "ok"}">${compiled.diagnostics.warnings.length} warnings</span>
              </div>
              ${this.renderRuntimeManifestDiagnostics(compiled)}
              <button type="button" class="full-width-action" data-action="export-runtime">Export runtime manifest</button>
            `
            : `<div class="empty-state">
                <strong>Runtime manifest pending</strong>
                <span>Compile the current project to create a runtime-manifest/v0 package contract.</span>
                <button type="button" data-action="compile-project">Compile runtime</button>
              </div>`
        }
      </div>
    `;
  }

  private renderEngineModulesPanel(summary: StudioProjectSummary): string {
    return `
      <div class="section engine-modules-panel">
        <div class="section-heading-row">
          <h2>Engine Modules</h2>
          <span class="badge">${summary.modules.length} modules</span>
        </div>
        <div class="engine-module-table" role="table" aria-label="Engine module status">
          <div class="engine-module-row engine-module-row-head" role="row">
            <span aria-hidden="true"></span>
            <span>Module</span>
            <span>Status</span>
            <span>Contracts</span>
            <span>Blocked</span>
          </div>
          ${summary.modules
            .map(
              (module) => `
                <div class="engine-module-row is-${this.statusClassName(module.status)}" role="row">
                  <span class="engine-module-icon">${tablerIcon("modules", "ui-icon")}</span>
                  <span class="engine-module-name">
                    <strong>${escapeHtml(module.label)}</strong>
                    <small>${escapeHtml(module.id)}${module.role ? ` / ${escapeHtml(module.role)}` : ""}</small>
                  </span>
                  <span class="engine-module-status">${this.statusBadge(module.status)}</span>
                  <span class="engine-module-contracts">${module.consumes.length} in / ${module.provides.length} out</span>
                  <span class="engine-module-blocked">${escapeHtml(this.moduleBlockedPreview(module))}</span>
                </div>
              `,
            )
            .join("")}
        </div>
        <button type="button" class="full-width-action" data-studio-tab="modules">Open module contracts</button>
      </div>
    `;
  }

  private moduleBlockedPreview(module: StudioProjectSummary["modules"][number]): string {
    const forbidden = module.forbiddenSharedCoreConcepts;
    return forbidden.length ? forbidden.slice(0, 3).join(", ") + (forbidden.length > 3 ? ` +${forbidden.length - 3}` : "") : "none";
  }

  private renderAcceptanceGatesPanel(summary: StudioProjectSummary): string {
    const attention = summary.gates.filter((gate) => isAttentionStatus(gate.status)).length;
    const clear = summary.gates.length - attention;
    return `
      <div class="acceptance-gates-section" role="region" aria-labelledby="acceptance-gates-heading">
        <header class="section-heading-row acceptance-gate-heading">
          <span class="gate-kicker">Release desk</span>
          <h2 id="acceptance-gates-heading">Acceptance Gates</h2>
          <span class="badge ${attention ? "warn" : "ok"}">${clear}/${summary.gates.length} clear</span>
        </header>
        <div class="acceptance-gate-board" aria-label="Acceptance gate board">
          ${summary.gates
            .map(
              (gate) => `
                <button type="button" class="acceptance-gate-row is-${this.statusClassName(gate.status)}" ${this.studioNextActionAttribute(gate.nextAction)}>
                  <span class="acceptance-gate-state">${this.statusBadge(gate.status)}</span>
                  <span class="acceptance-gate-main">
                    <strong>${escapeHtml(gate.label)}</strong>
                    <small>${escapeHtml(gate.detail)}</small>
                  </span>
                  <span class="acceptance-gate-action">
                    <b>${escapeHtml(gate.nextAction.label)}</b>
                    <small>${escapeHtml(gate.affectedSystem ?? "studio")} / ${gate.evidenceIds.length} evidence</small>
                  </span>
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private renderStudioInspectorNavigator(): string {
    const characterName = this.character?.definition.info.displayName ?? this.character?.definition.info.name ?? "No imported character";
    const actions = [...(this.character?.animations ?? this.fixtureAnimations).values()].sort((a, b) => a.id - b.id);
    const states = this.character?.states ?? [];
    const commands = this.character?.commands ?? [];
    const diagnostics = this.character?.diagnostics ?? [];
    const selected = this.inspectorRuntime.getSnapshot().selectedAction;
    return `
      <div class="section">
        <h2>Inspector Timeline</h2>
        <dl class="kv studio-kv">
          <dt>Package</dt><dd>${escapeHtml(characterName)}</dd>
          <dt>Actions</dt><dd class="mono">${actions.length}</dd>
          <dt>States</dt><dd class="mono">${states.length}</dd>
          <dt>Commands</dt><dd class="mono">${commands.length}</dd>
          <dt>Diagnostics</dt><dd class="mono">${diagnostics.length}</dd>
          <dt>Selected</dt><dd class="mono">Action ${selected?.id ?? "-"}</dd>
        </dl>
        <div class="split-controls">
          <button type="button" data-mode="inspect">Open Inspector Mode</button>
          <button type="button" data-action="export-report">Export report</button>
        </div>
        ${this.character ? "" : `<div class="empty-state">Load a MUGEN ZIP/folder to replace fixture timeline data with real package data.</div>`}
      </div>
      <div class="section">
        <h2>Actions</h2>
        <div class="list">
          ${actions
            .slice(0, 12)
            .map(
              (action) => `
                <button type="button" class="list-item ${selected?.id === action.id ? "is-selected" : ""}" data-studio-action-id="${action.id}">
                  <span>
                    <span class="list-title">Action ${action.id}</span>
                    <span class="list-meta">${action.frames.length} frames / first ${action.frames[0] ? `${action.frames[0].spriteGroup},${action.frames[0].spriteIndex}` : "-"}</span>
                    <span class="badge-row">
                      ${action.frames.some((frame) => frame.clsn1.length > 0) ? `<span class="badge ok">Clsn1</span>` : `<span class="badge">Clsn1</span>`}
                      ${action.frames.some((frame) => frame.clsn2.length > 0) ? `<span class="badge ok">Clsn2</span>` : `<span class="badge">Clsn2</span>`}
                      ${action.loopStart !== undefined ? `<span class="badge ok">Loop ${action.loopStart}</span>` : ""}
                    </span>
                  </span>
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private renderStudioInspectorRightPane(): string {
    const inspector = this.inspectorRuntime.getSnapshot();
    const action = inspector.selectedAction;
    const frame = action?.frames[inspector.actors[0]?.runtime.frameIndex ?? 0];
    return `
      <div class="section">
        <h2>Frame Timeline</h2>
        ${
          action
            ? `
              <dl class="kv studio-kv">
                <dt>Action</dt><dd class="mono">${action.id}</dd>
                <dt>Frame</dt><dd class="mono">${inspector.actors[0]?.runtime.frameIndex ?? 0}</dd>
                <dt>Sprite</dt><dd class="mono">${frame ? `${frame.spriteGroup},${frame.spriteIndex}` : "-"}</dd>
                <dt>Time</dt><dd class="mono">${inspector.actors[0]?.runtime.animTime ?? 0}</dd>
              </dl>
              <div class="timeline-strip">
                ${action.frames
                  .map(
                    (candidate, index) => `
                      <div class="timeline-frame ${frame === candidate ? "is-active" : ""}" title="Frame ${index}">
                        <strong>${index}</strong>
                        <span>${candidate.duration}f</span>
                        <small>${candidate.spriteGroup},${candidate.spriteIndex}</small>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            `
            : `<div class="empty-state">No selected action yet.</div>`
        }
      </div>
      <div class="section">
        <h2>Collision Boxes</h2>
        ${
          frame
            ? `<div class="studio-stat-grid">
                ${this.studioStat("Clsn1", frame.clsn1.length)}
                ${this.studioStat("Clsn2", frame.clsn2.length)}
                ${this.studioStat("Duration", frame.duration)}
                ${this.studioStat("Line", frame.line)}
              </div>
              <div class="list compact-list">
                <div class="list-item"><span><span class="list-title">Raw AIR frame</span><span class="list-meta">${escapeHtml(frame.raw)}</span></span></div>
              </div>`
            : `<div class="empty-state">Select an action to inspect frame collision data.</div>`
        }
      </div>
      <div class="section">
        <h2>Parser Diagnostics</h2>
        ${this.renderStudioDiagnosticsList()}
      </div>
    `;
  }

  private renderStudioStageNavigator(): string {
    const stage = this.findStage(this.selectedStageId) ?? rooftopDojoStage;
    const report = this.getStageCompatibilityReportFor(stage.id);
    const layerRows = this.getStudioStageLayerRows(stage, report);
    const attentionLayers = layerRows.filter((layer) => layer.status === "missing" || layer.status === "unsupported" || layer.status === "fallback");
    const bgCtrlCount = report?.backgrounds.controllers.total ?? stage.bgControllers?.reduce((total, group) => total + group.controllers.length, 0) ?? 0;
    const bgCtrlLabel = report ? `${report.backgrounds.controllers.bounded}/${bgCtrlCount}` : String(bgCtrlCount);
    return `
      <div class="section">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Stage Preview</span>
            <h2>${escapeHtml(stage.displayName)}</h2>
          </div>
          <span class="badge ${report ? "ok" : "active"}">${report ? "imported report" : "native stage"}</span>
        </div>
        <dl class="kv studio-kv">
          <dt>Stage ID</dt><dd class="mono">${escapeHtml(stage.id)}</dd>
          <dt>Floor</dt><dd class="mono">Y ${formatStageNumber(stage.floorY)} / zoffset ${formatStageNumber(stage.zOffset)}</dd>
          <dt>Bounds</dt><dd class="mono">${formatStageNumber(stage.bounds.left)} .. ${formatStageNumber(stage.bounds.right)}</dd>
          <dt>Camera</dt><dd class="mono">${formatStageNumber(stage.camera.startX)}, ${formatStageNumber(stage.camera.startY)} / zoom ${formatStageNumber(stage.camera.zoom)}</dd>
          <dt>Starts</dt><dd class="mono">P1 ${formatStageNumber(stage.playerStart.p1.x)}, P2 ${formatStageNumber(stage.playerStart.p2.x)}</dd>
        </dl>
        <div class="studio-stat-grid">
          ${this.studioStat("Layers", layerRows.length)}
          ${this.studioStat("Rendered", layerRows.filter((layer) => layer.status === "rendered" || layer.status === "animated").length)}
          ${this.studioStat("BGCtrl", bgCtrlLabel)}
          ${this.studioStat("Attention", attentionLayers.length)}
        </div>
        <div class="split-controls">
          <button type="button" data-mode="match">Playtest</button>
          <button type="button" data-studio-tab="assets" data-asset-filter="stages">Stage assets</button>
        </div>
      </div>
      <div class="section">
        <h2>Available Stages</h2>
        <div class="list compact-list">
          ${this.getAvailableStages()
            .map((availableStage) => {
              const availableReport = this.getStageCompatibilityReportFor(availableStage.id);
              const active = availableStage.id === stage.id;
              const nativeControllerCount = availableStage.bgControllers?.reduce((total, group) => total + group.controllers.length, 0) ?? 0;
              return `
                <button type="button" class="list-item ${active ? "is-selected" : ""}" data-studio-stage-id="${escapeHtml(availableStage.id)}">
                  <span>
                    <span class="list-title">${escapeHtml(availableStage.displayName)}</span>
                    <span class="list-meta">${escapeHtml(availableStage.id)} / ${availableReport ? "mugen-import" : "native"}</span>
                  </span>
                  <span class="badge ${availableReport ? "ok" : nativeControllerCount ? "warn" : ""}">${
                    availableReport
                      ? `${availableReport.backgrounds.layers.length} bg / ${availableReport.backgrounds.controllers.total} ctrl`
                      : nativeControllerCount
                        ? `${availableStage.layers.length} layers / ${nativeControllerCount} ctrl`
                        : `${availableStage.layers.length} layers`
                  }</span>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
      <div class="section">
        <h2>BG Layer Status</h2>
        <div class="list compact-list stage-layer-list">
          ${layerRows.map((layer) => this.renderStudioStageLayerRow(layer)).join("")}
        </div>
      </div>
    `;
  }

  private renderStudioStageRightPane(): string {
    const stage = this.findStage(this.selectedStageId) ?? rooftopDojoStage;
    const report = this.getStageCompatibilityReportFor(stage.id);
    const layerRows = this.getStudioStageLayerRows(stage, report);
    const controllerSummary = report?.backgrounds.controllers ?? summarizeStageBackgroundControllers(stage);
    const controllerRows = controllerSummary.items;
    const unsupported = report?.unsupported ?? [];
    return `
      <div class="section">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Stage Contract</span>
            <h2>${escapeHtml(stage.displayName)}</h2>
          </div>
          <span class="badge ${report ? "ok" : "active"}">${report ? "DEF/SFF" : "native"}</span>
        </div>
        <dl class="kv studio-kv">
          <dt>Source</dt><dd class="mono">${escapeHtml(report ? "mugen-import" : stage.layers.some((layer) => layer.assetUrl) ? "authored" : "runtime-demo")}</dd>
          <dt>Layers</dt><dd class="mono">${layerRows.length}</dd>
          <dt>Rendered</dt><dd class="mono">${layerRows.filter((layer) => layer.status === "rendered" || layer.status === "animated").length}</dd>
          <dt>BGCtrl</dt><dd class="mono">${controllerSummary.total ? `${controllerSummary.bounded}/${controllerSummary.total} bounded` : "0 native"}</dd>
          <dt>Fallback</dt><dd class="mono">${layerRows.filter((layer) => layer.status === "fallback" || layer.status === "missing").length}</dd>
          <dt>Unsupported</dt><dd class="mono">${layerRows.filter((layer) => layer.status === "unsupported").length}</dd>
        </dl>
        ${
          report
            ? `<div class="studio-stage-file-grid">
                <span class="badge ${report.files.def ? "ok" : "error"}">DEF</span>
                <span class="badge ${report.files.sff && report.sff.decodedSprites > 0 ? "ok" : report.files.sff ? "warn" : "error"}">SFF ${report.sff.decodedSprites}/${report.sff.totalSprites}</span>
                <span class="badge ${report.files.music ? "ok" : ""}">music ${report.files.music ? "linked" : "none"}</span>
              </div>`
            : `<div class="empty-state compact">Native stages are already normalized runtime definitions; imported stage reports appear here after loading a package.</div>`
        }
      </div>
      <div class="section">
        <h2>Layer Diagnostics</h2>
        <div class="list compact-list">
          ${layerRows.map((layer) => this.renderStudioStageLayerRow(layer, { compact: true })).join("")}
        </div>
      </div>
      <div class="section">
        <h2>BG Controllers</h2>
        ${
          controllerRows.length
            ? `<div class="list compact-list stage-layer-list">
                ${controllerRows.map((controller) => this.renderStudioStageControllerRow(controller)).join("")}
              </div>`
            : `<div class="empty-state compact">No BGCtrl sections were parsed for the selected stage.</div>`
        }
      </div>
      <div class="section">
        <h2>Unsupported Stage Features</h2>
        ${
          unsupported.length
            ? `<div class="list compact-list">
                ${unsupported
                  .map(
                    (item) => `
                      <div class="list-item">
                        <span>
                          <span class="list-title">${escapeHtml(item.feature)}</span>
                          <span class="list-meta">${escapeHtml(item.fallback ?? "Tracked for future stage parity work.")}</span>
                        </span>
                        <span class="badge warn">${item.count ?? 1}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>`
            : `<div class="empty-state compact">No imported-stage unsupported features are reported for the selected stage.</div>`
        }
      </div>
    `;
  }

  private getStudioStageLayerRows(
    stage: MugenStageDefinition,
    report: StageCompatibilityReport | undefined,
  ): Array<{
    id: string;
    label: string;
    status: "rendered" | "animated" | "fallback" | "missing" | "unsupported";
    type: string;
    detail: string;
    tiled: boolean;
    unsupported: string[];
    fallback?: string;
    controlId?: number;
  }> {
    if (report) {
      return report.backgrounds.layers.map((layer) => ({
        id: layer.id,
        label: layer.section ?? layer.id,
        status: layer.status,
        type: layer.type,
        detail: [
          layer.sprite ? `spr ${layer.sprite.group},${layer.sprite.index}${layer.sprite.decoded ? "" : " missing"}` : undefined,
          layer.action ? `act ${layer.action.id} ${layer.action.decodedFrames}/${layer.action.frames}` : undefined,
          `start ${formatStageNumber(layer.start.x)},${formatStageNumber(layer.start.y)}`,
          `delta ${formatStageNumber(layer.delta.x)},${formatStageNumber(layer.delta.y)}`,
          layer.scale ? formatStageScale(layer.scale) : undefined,
          layer.positionLink ? formatStagePositionLink(layer.positionLink) : undefined,
          layer.trans ? formatStageTrans(layer.trans) : undefined,
          layer.clip ? formatStageClip(layer.clip) : undefined,
          layer.mask === undefined ? undefined : `mask ${layer.mask ? 1 : 0}`,
        ]
          .filter(Boolean)
          .join(" / "),
        tiled: layer.tiled,
        unsupported: layer.unsupported,
        fallback: layer.fallback,
        controlId: layer.controlId,
      }));
    }
    return stage.layers.map((layer, index) => ({
      id: layer.id,
      label: layer.sectionName ?? layer.id,
      status: layer.assetUrl || layer.spriteGroup !== undefined || layer.actionNo !== undefined ? "rendered" : "fallback",
      type: layer.type ?? (layer.actionNo !== undefined ? "anim" : "runtime"),
      detail: [
        layer.assetUrl ? "asset PNG" : undefined,
        layer.spriteGroup !== undefined && layer.spriteIndex !== undefined ? `spr ${layer.spriteGroup},${layer.spriteIndex}` : undefined,
        layer.actionNo !== undefined ? `act ${layer.actionNo}` : undefined,
        `layer ${index}`,
        `delta ${formatStageNumber(layer.deltaX)},${formatStageNumber(layer.deltaY ?? 1)}`,
        layer.scaleStart || layer.scaleDelta || layer.yScaleStart !== undefined || layer.yScaleDelta !== undefined || layer.zoomDelta
          ? formatStageScale({
              start: layer.scaleStart ?? { x: 1, y: 1 },
              delta: layer.scaleDelta ?? { x: 0, y: 0 },
              legacyYScale: layer.yScaleStart !== undefined || layer.yScaleDelta !== undefined
                ? { start: layer.yScaleStart, delta: layer.yScaleDelta }
                : undefined,
              zoomDelta: layer.zoomDelta,
          })
          : undefined,
        layer.positionLink ? formatStagePositionLink(layer.positionLink) : undefined,
        layer.trans ? formatStageTrans(layer.trans) : undefined,
        layer.clip ? formatStageClip(layer.clip) : undefined,
        layer.mask === undefined ? undefined : `mask ${layer.mask ? 1 : 0}`,
      ]
        .filter(Boolean)
        .join(" / "),
      tiled: Boolean(layer.tile && (layer.tile.x !== 0 || layer.tile.y !== 0)),
      unsupported: [],
      fallback: layer.assetUrl || layer.spriteGroup !== undefined || layer.actionNo !== undefined ? undefined : "Runtime geometry layer",
      controlId: layer.controlId,
    }));
  }

  private renderStudioStageLayerRow(
    layer: ReturnType<App["getStudioStageLayerRows"]>[number],
    options: { compact?: boolean } = {},
  ): string {
    return `
      <div class="list-item stage-layer-row is-${this.stageLayerStatusClass(layer.status)}">
        <span>
          <span class="list-title">${escapeHtml(layer.label)}</span>
          <span class="list-meta">${escapeHtml(layer.detail)}</span>
          ${!options.compact && layer.fallback ? `<span class="list-meta">Fallback: ${escapeHtml(layer.fallback)}</span>` : ""}
          ${layer.unsupported.length ? `<span class="list-meta">Unsupported: ${escapeHtml(layer.unsupported.join(", "))}</span>` : ""}
          <span class="badge-row">
            <span class="badge ${this.stageLayerStatusClass(layer.status)}">${escapeHtml(layer.status)}</span>
            <span class="badge">${escapeHtml(layer.type)}</span>
            ${layer.controlId === undefined ? "" : `<span class="badge">ctrl ${layer.controlId}</span>`}
            ${layer.tiled ? `<span class="badge ok">tile</span>` : ""}
          </span>
        </span>
      </div>
    `;
  }

  private renderStudioStageControllerRow(controller: StageCompatibilityReport["backgrounds"]["controllers"]["items"][number]): string {
    const statusClass = controller.status === "bounded" ? "warn" : "error";
    return `
      <div class="list-item stage-layer-row is-${statusClass}">
        <span>
          <span class="list-title">${escapeHtml(controller.name ?? controller.type)}</span>
          <span class="list-meta">${escapeHtml(
            [
              controller.group ? `group ${controller.group}` : undefined,
              `time ${formatStageNumber(controller.timing.start)}..${formatStageNumber(controller.timing.end)}`,
              controller.timing.loopTime === undefined ? undefined : `loop ${formatStageNumber(controller.timing.loopTime)}`,
              controller.timing.groupLoopTime === undefined || controller.timing.groupLoopTime === controller.timing.loopTime
                ? undefined
                : `group loop ${formatStageNumber(controller.timing.groupLoopTime)}`,
              controller.ctrlIds?.length ? `ctrl ${controller.ctrlIds.join(",")}` : "all layers",
            ]
              .filter(Boolean)
              .join(" / "),
          )}</span>
          <span class="list-meta">${escapeHtml(controller.fallback)}</span>
          ${controller.targetLayers.length ? `<span class="list-meta">Targets: ${escapeHtml(controller.targetLayers.slice(0, 4).join(", "))}${controller.targetLayers.length > 4 ? "..." : ""}</span>` : ""}
          ${controller.unsupported.length ? `<span class="list-meta">Unsupported: ${escapeHtml(controller.unsupported.join(", "))}</span>` : ""}
          <span class="badge-row">
            <span class="badge ${statusClass}">${escapeHtml(controller.status)}</span>
            <span class="badge">${escapeHtml(controller.type)}</span>
            <span class="badge">${controller.targetLayers.length} targets</span>
          </span>
        </span>
      </div>
    `;
  }

  private stageLayerStatusClass(status: "rendered" | "animated" | "fallback" | "missing" | "unsupported"): "ok" | "warn" | "error" {
    if (status === "rendered" || status === "animated") {
      return "ok";
    }
    if (status === "missing" || status === "unsupported") {
      return "error";
    }
    return "warn";
  }

  private renderStudioDebugNavigator(): string {
    const snapshot = this.matchRuntime.getSnapshot();
    const registry = this.matchRuntime.getActorRegistry();
    const activeCommands = this.getActiveCommandNames().slice(0, 6);
    const selection = this.getStudioDebugSelection(registry, snapshot);
    return `
      <div class="section">
        <h2>Runtime Debug Studio</h2>
        <p>Inspect the live match world without switching away from the Studio playtest.</p>
        <div class="studio-stat-grid">
          <div class="studio-stat"><strong>${registry.actors.length}</strong><span>Actors</span></div>
          <div class="studio-stat"><strong>${registry.effects.length}</strong><span>Effects</span></div>
          <div class="studio-stat"><strong>${snapshot.tick}</strong><span>Tick</span></div>
          <div class="studio-stat"><strong>${snapshot.round?.timer ?? "-"}</strong><span>Timer</span></div>
        </div>
        <div class="badge-row">
          <span class="badge ok">${registry.players.length} players</span>
          <span class="badge">helpers ${registry.byKind.helper.length}</span>
          <span class="badge">projectiles ${registry.byKind.projectile.length}</span>
          <span class="badge">explods ${registry.byKind.explod.length}</span>
        </div>
      </div>
      <div class="section section-emphasis">
        <div class="section-heading-row">
          <h2>Selected Actor</h2>
          <span class="badge ${selection.selectedActor?.layer === "effect" ? "warn" : "ok"}">${escapeHtml(selection.selectedActor?.kind ?? "none")}</span>
        </div>
        ${
          selection.selectedActor
            ? `
              <div class="debug-selection-panel">
                <strong>${escapeHtml(selection.selectedActor.label)}</strong>
                <span class="list-meta mono">${escapeHtml(selection.selectedActor.id)} / ${escapeHtml(selection.selectedActor.layer)} / ${escapeHtml(selection.selectedActor.source ?? "unknown")}</span>
                <span class="badge-row">
                  <span class="badge active">state ${selection.selectedActor.stateNo}</span>
                  <span class="badge">anim ${selection.selectedActor.animNo}</span>
                  <span class="badge">${escapeHtml(selection.selectedActor.lifecycle.status)} ${selection.selectedActor.lifecycle.ageTicks}f</span>
                  ${selection.relatedTargetLinks.length ? `<span class="badge warn">targets ${selection.relatedTargetLinks.length}</span>` : ""}
                  ${selection.ownedActors.length ? `<span class="badge">owns ${selection.ownedActors.length}</span>` : ""}
                </span>
              </div>
            `
            : `<div class="empty-state compact">No actor is available in the current registry.</div>`
        }
      </div>
      ${this.renderStudioDebugFilterControls(selection, registry, snapshot)}
      <div class="section">
        <div class="section-heading-row">
          <h2>Actor Explorer</h2>
          <span class="badge">${registry.actors.length} indexed</span>
        </div>
        <div class="debug-actor-list">
          ${registry.actors.map((actor) => this.renderDebugActorButton(actor, selection.selectedActorId)).join("")}
        </div>
      </div>
      <div class="section">
        <h2>Live Inputs</h2>
        ${
          activeCommands.length
            ? `<div class="badge-row">${activeCommands
                .map(
                  (command) =>
                    `<button type="button" class="badge active debug-command-chip" data-debug-command-filter="${escapeHtml(command)}">${escapeHtml(command)}</button>`,
                )
                .join("")}</div>`
            : `<div class="empty-state">No imported command is active in this frame.</div>`
        }
      </div>
      <div class="section">
        <h2>Debug Pipeline</h2>
        <div class="pipeline-list">
          <span class="pipeline-step active">1 Read MatchWorld snapshot</span>
          <span class="pipeline-step active">2 Index actor ownership</span>
          <span class="pipeline-step active">3 Render registry facts</span>
          <span class="pipeline-step active">4 Select actor detail</span>
          <span class="pipeline-step">5 Link actors to traces/controllers</span>
        </div>
      </div>
    `;
  }

  private renderStudioDebugFilterControls(
    selection: StudioDebugSelectionSummary,
    registry: MatchWorldActorRegistrySnapshot,
    snapshot: MugenSnapshot,
  ): string {
    const hitPause = this.getStudioDebugHitPauseSummary(snapshot);
    const audioCounts = this.getStudioDebugAudioEventCounts(snapshot);
    const effectStoreTotal = registry.effectStores.reduce((total, store) => total + store.total, 0);
    const filters: { id: StudioDebugFilter; label: string; detail: string; count: string | number; tone?: string }[] = [
      {
        id: "overview",
        label: "Overview",
        detail: `${selection.selectedActor?.id ?? "no actor"} selected`,
        count: registry.actors.length,
        tone: "ok",
      },
      {
        id: "targets",
        label: "Targets",
        detail: `${selection.relatedTargetLinks.length} linked to selection`,
        count: registry.targetLinks.length,
        tone: registry.targetLinks.length ? "warn" : undefined,
      },
      {
        id: "effects",
        label: "Effects",
        detail: `${effectStoreTotal} stored effects`,
        count: registry.effects.length,
        tone: registry.effects.length || effectStoreTotal ? "warn" : undefined,
      },
      {
        id: "pause",
        label: "Pause",
        detail: snapshot.matchPause
          ? `${snapshot.matchPause.type} from ${snapshot.matchPause.actorId}`
          : hitPause.active
            ? `HitPause on ${hitPause.actors.length} actor${hitPause.actors.length === 1 ? "" : "s"}`
            : "not active",
        count: snapshot.matchPause ? snapshot.matchPause.remaining : hitPause.remaining,
        tone: snapshot.matchPause || hitPause.active ? "active" : undefined,
      },
      {
        id: "audio",
        label: "Audio",
        detail: `${audioCounts.soundEvents} snd / ${audioCounts.envShakeEvents} shake`,
        count: audioCounts.soundEvents + audioCounts.envShakeEvents,
        tone: audioCounts.soundEvents || audioCounts.envShakeEvents ? "active" : undefined,
      },
    ];
    return `
      <div class="section">
        <div class="section-heading-row">
          <h2>Debug Lens</h2>
          <span class="badge">${escapeHtml(this.studioDebugFilter)}</span>
        </div>
        <div class="debug-filter-grid" role="list" aria-label="Runtime debug lenses">
          ${filters
            .map(
              (filter) => `
                <button
                  type="button"
                  class="debug-filter-button ${this.studioDebugFilter === filter.id ? "is-selected" : ""} ${filter.tone ? `is-${filter.tone}` : ""}"
                  data-debug-filter="${filter.id}"
                  aria-pressed="${this.studioDebugFilter === filter.id ? "true" : "false"}"
                >
                  <span>
                    <strong>${escapeHtml(filter.label)}</strong>
                    <small>${escapeHtml(filter.detail)}</small>
                  </span>
                  <b class="mono">${escapeHtml(String(filter.count))}</b>
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private renderStudioDebugRightPane(): string {
    const snapshot = this.matchRuntime.getSnapshot();
    const registry = this.matchRuntime.getActorRegistry();
    const selection = this.getStudioDebugSelection(registry, snapshot);
    const hitPause = this.getStudioDebugHitPauseSummary(snapshot);
    return `
      ${this.renderStudioDebugLens(selection, registry, snapshot)}
      ${this.renderStudioDebugActorDetail(selection)}
      <div class="section">
        <h2>Runtime Snapshot</h2>
        <dl class="kv studio-kv">
          <dt>Mode</dt><dd>Studio Debug</dd>
          <dt>Tick</dt><dd class="mono">${snapshot.tick}</dd>
          <dt>Playing</dt><dd class="mono">${snapshot.playing ? "true" : "false"}</dd>
          <dt>Round</dt><dd class="mono">${escapeHtml(snapshot.round?.message ?? "-")} / ${snapshot.round?.timer ?? "-"}</dd>
          <dt>Stage</dt><dd class="mono">${escapeHtml(snapshot.stage.displayName ?? snapshot.stage.id ?? "Stage")}</dd>
          <dt>Pause</dt><dd class="mono">${this.formatStudioDebugPauseSummary(snapshot.matchPause, hitPause)}</dd>
          <dt>Effects</dt><dd class="mono">${snapshot.effects?.length ?? 0}</dd>
        </dl>
        <div class="badge-row">
          <span class="badge active">QA bridge actorRegistry</span>
          <span class="badge ${registry.effects.length ? "warn" : "ok"}">${registry.effects.length} effect actors</span>
        </div>
      </div>
      ${renderActorRegistry(registry)}
      <div class="section">
        <h2>Actor Ownership Index</h2>
        <div class="compat-list">
          ${Object.entries(registry.byOwner)
            .map(
              ([owner, actorIds]) => `
                <div class="compat-row">
                  <span class="badge">${escapeHtml(owner)}</span>
                  <span>${actorIds.map((id) => escapeHtml(id)).join(", ")}</span>
                  <span class="mono">x${actorIds.length}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private renderStudioDebugLens(
    selection: StudioDebugSelectionSummary,
    registry: MatchWorldActorRegistrySnapshot,
    snapshot: MugenSnapshot,
  ): string {
    if (this.studioDebugFilter === "targets") {
      return this.renderStudioDebugTargetsLens(selection, registry);
    }
    if (this.studioDebugFilter === "effects") {
      return this.renderStudioDebugEffectsLens(selection, registry, snapshot);
    }
    if (this.studioDebugFilter === "pause") {
      return this.renderStudioDebugPauseLens(selection, snapshot);
    }
    if (this.studioDebugFilter === "audio") {
      return this.renderStudioDebugAudioLens(selection, snapshot);
    }
    const audioCounts = this.getStudioDebugAudioEventCounts(snapshot);
    const hitPause = this.getStudioDebugHitPauseSummary(snapshot);
    const pauseFocus = this.formatStudioDebugPauseFocus(snapshot.matchPause, hitPause, snapshot);
    return `
      <div class="section debug-lens-section" data-debug-filter-panel="overview">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Debug lens</span>
            <h2>Overview</h2>
          </div>
          <span class="badge ok">live</span>
        </div>
        <div class="studio-stat-grid debug-lens-stat-grid">
          ${this.studioStat("Actors", registry.actors.length)}
          ${this.studioStat("Targets", registry.targetLinks.length)}
          ${this.studioStat("Effects", registry.effects.length)}
          ${this.studioStat("Audio", audioCounts.soundEvents + audioCounts.envShakeEvents)}
        </div>
        <div class="debug-lens-grid">
          <div class="debug-lens-meter">
            <span class="panel-kicker">Selection</span>
            <strong>${escapeHtml(selection.selectedActor?.label ?? "No actor")}</strong>
            <small>${escapeHtml(selection.selectedActor ? `${selection.selectedActor.id} / ${selection.selectedActor.kind} / state ${selection.selectedActor.stateNo}` : "Registry empty")}</small>
          </div>
          <div class="debug-lens-meter">
            <span class="panel-kicker">Runtime focus</span>
            <strong>${escapeHtml(pauseFocus.title)}</strong>
            <small>${escapeHtml(pauseFocus.detail)}</small>
          </div>
        </div>
      </div>
    `;
  }

  private renderStudioDebugTargetsLens(selection: StudioDebugSelectionSummary, registry: MatchWorldActorRegistrySnapshot): string {
    const selectedRows = this.renderStudioDebugTargetRows(selection.relatedTargetLinks, "No target links reference the selected actor.");
    const allRows = this.renderStudioDebugTargetRows(registry.targetLinks, "No target links are active in the world.");
    return `
      <div class="section debug-lens-section" data-debug-filter-panel="targets">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Debug lens</span>
            <h2>Target Links</h2>
          </div>
          <span class="badge ${registry.targetLinks.length ? "warn" : "ok"}">${registry.targetLinks.length} active</span>
        </div>
        <div class="debug-lens-grid">
          <div class="debug-lens-meter">
            <span class="panel-kicker">Selected actor</span>
            <strong>${selection.relatedTargetLinks.length}</strong>
            <small>${escapeHtml(selection.selectedActor?.id ?? "none")} target references</small>
          </div>
          <div class="debug-lens-meter">
            <span class="panel-kicker">World</span>
            <strong>${registry.targetLinks.length}</strong>
            <small>${registry.players.length} player actors / ${registry.effects.length} effect actors</small>
          </div>
        </div>
        ${this.renderStudioDebugTargetGateEvidence(selection)}
        ${this.renderStudioDebugTargetWorldEvidence(selection)}
        <div class="debug-evidence-block">
          <span class="panel-kicker">Selection links</span>
          <div class="compat-list">${selectedRows}</div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">All target links</span>
          <div class="compat-list">${allRows}</div>
        </div>
      </div>
    `;
  }

  private renderStudioDebugTargetGateEvidence(selection: StudioDebugSelectionSummary): string {
    const artifact = this.getActiveTraceArtifact();
    if (!artifact) {
      return this.renderStudioDebugTargetGateEvidenceEmpty("Export a trace artifact from Build to compare target-link gate evidence.");
    }
    const rows = artifact.gates.flatMap((gate) =>
      gate.evidence.targetLinks
        .filter((link) => this.debugTargetLinkMatchesSelection(link, selection))
        .map(
          (link) => `
            <div class="compat-row debug-world-frame-row" data-debug-target-binding-evidence>
              <span class="badge ${gate.passed ? "ok" : "error"}">${escapeHtml(link.hasBinding ? "bind" : "target")}</span>
              <span>
                <span class="list-title">${escapeHtml(gate.label)} / ${escapeHtml(link.ownerId)} -> ${escapeHtml(link.actorId)}</span>
                <span class="list-meta">${escapeHtml(this.formatStudioDebugTargetGateEvidence(link))}</span>
              </span>
              <span class="mono">${link.frames}f</span>
            </div>
          `,
        ),
    );
    if (!rows.length) {
      return this.renderStudioDebugTargetGateEvidenceEmpty("The latest trace has no target-link gate evidence for this actor.");
    }
    return `
      <div class="debug-evidence-block" data-debug-world-evidence="targets-gate">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Trace target gate evidence</span>
          <span class="badge ok">${rows.length} records</span>
        </div>
        <div class="compat-list">${rows.slice(0, 10).join("")}</div>
      </div>
    `;
  }

  private renderStudioDebugTargetGateEvidenceEmpty(message: string): string {
    return `
      <div class="debug-evidence-block" data-debug-world-evidence="targets-gate">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Trace target gate evidence</span>
          <span class="badge warn">none</span>
        </div>
        <div class="empty-state compact">${escapeHtml(message)}</div>
      </div>
    `;
  }

  private renderStudioDebugEffectsLens(
    selection: StudioDebugSelectionSummary,
    registry: MatchWorldActorRegistrySnapshot,
    snapshot: MugenSnapshot,
  ): string {
    const effectActors = registry.actors.filter((actor) => actor.layer === "effect");
    const effectKindCounts = countBy(effectActors, (actor) => actor.kind);
    const snapshotActors = new Map(this.getStudioDebugSnapshotActors(snapshot).map((actor) => [actor.id, actor]));
    const effectRows = effectActors.length
      ? effectActors
          .map(
            (actor) => {
              const effectSnapshot = snapshotActors.get(actor.id);
              return `
              <button type="button" class="compat-row debug-effect-row" data-debug-actor-id="${escapeHtml(actor.id)}" data-debug-effect-kind="${escapeHtml(actor.kind)}">
                <span class="badge ${actor.id === selection.selectedActorId ? "active" : "warn"}">${escapeHtml(actor.kind)}</span>
                <span>
                  <span class="list-title">${escapeHtml(actor.label)}</span>
                  <span class="list-meta">${escapeHtml(this.formatStudioDebugEffectRowMeta(actor, effectSnapshot))}</span>
                </span>
                <span class="mono">${escapeHtml(this.formatStudioDebugEffectRowValue(actor, effectSnapshot))}</span>
              </button>
            `;
            },
          )
          .join("")
      : `<div class="empty-state compact">No helper, projectile, or explod actors are live right now.</div>`;
    const storeRows = registry.effectStores.length
      ? registry.effectStores
          .map(
            (store) => `
              <div class="debug-effect-store-row">
                <div class="section-heading-row compact-heading">
                  <span class="badge ${store.total ? "warn" : "ok"}">${escapeHtml(store.ownerId)}</span>
                  <span class="mono">total ${store.total}</span>
                </div>
                <dl class="kv studio-kv">
                  <dt>Explods</dt><dd class="mono">${escapeHtml(this.formatDebugIdList(store.explods))}</dd>
                  <dt>Helpers</dt><dd class="mono">${escapeHtml(this.formatDebugIdList(store.helpers))}</dd>
                  <dt>Projectiles</dt><dd class="mono">${escapeHtml(this.formatDebugIdList(store.projectiles))}</dd>
                  <dt>Next serials</dt><dd class="mono">E${store.nextSerials.explod} / H${store.nextSerials.helper} / P${store.nextSerials.projectile}</dd>
                </dl>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-state compact">No effect stores are registered for this match.</div>`;
    return `
      <div class="section debug-lens-section" data-debug-filter-panel="effects">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Debug lens</span>
            <h2>Effects</h2>
          </div>
          <span class="badge ${effectActors.length ? "warn" : "ok"}">${effectActors.length} actors</span>
        </div>
        <div class="badge-row">
          <span class="badge">helpers ${effectKindCounts.get("helper") ?? 0}</span>
          <span class="badge">projectiles ${effectKindCounts.get("projectile") ?? 0}</span>
          <span class="badge">explods ${effectKindCounts.get("explod") ?? 0}</span>
          ${selection.effectStore ? `<span class="badge active">selected store ${selection.effectStore.total}</span>` : ""}
        </div>
        ${this.renderStudioDebugEffectWorldEvidence(selection)}
        ${this.renderStudioDebugEffectDrilldown(selection.snapshotActor)}
        <div class="debug-evidence-block">
          <span class="panel-kicker">Live effect actors</span>
          <div class="compat-list">${effectRows}</div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Effect stores</span>
          <div class="debug-effect-store-list">${storeRows}</div>
        </div>
      </div>
    `;
  }

  private formatStudioDebugEffectRowMeta(
    actor: MatchWorldActorRegistrySnapshot["actors"][number],
    snapshotActor: MugenSnapshot["actors"][number] | undefined,
  ): string {
    const base = `${actor.id} / owner ${actor.ownerId} / state ${actor.stateNo} / anim ${actor.animNo}`;
    const effect = snapshotActor?.effect;
    if (!effect) {
      return base;
    }
    if (effect.kind === "projectile") {
      return `${base} / proj ${effect.id ?? "-"} / dmg ${effect.damage} / guard ${effect.guardDamage}`;
    }
    if (effect.kind === "explod") {
      return `${base} / explod ${effect.id ?? "-"} / scale ${formatDecimal(effect.scale.x)},${formatDecimal(effect.scale.y)}`;
    }
    return `${base} / helper ${effect.id ?? "-"}${effect.name ? ` / ${effect.name}` : ""}`;
  }

  private formatStudioDebugEffectRowValue(
    actor: MatchWorldActorRegistrySnapshot["actors"][number],
    snapshotActor: MugenSnapshot["actors"][number] | undefined,
  ): string {
    const effect = snapshotActor?.effect;
    if (effect?.kind === "projectile") {
      return `P${effect.priority} H${effect.hitsRemaining} ${effect.removalReason ?? actor.lifecycle.status}`;
    }
    if (effect?.kind === "explod") {
      return `${effect.ignoreHitPause ? "ihp " : ""}${actor.lifecycle.status} ${effect.age}f`;
    }
    if (effect?.kind === "helper") {
      return `${actor.lifecycle.status} ${effect.age}f`;
    }
    return `${actor.lifecycle.status} ${actor.lifecycle.ageTicks}f`;
  }

  private renderStudioDebugEffectDrilldown(actor: MugenSnapshot["actors"][number] | undefined): string {
    if (!actor?.effect) {
      return `
        <div class="debug-evidence-block" data-debug-effect-drilldown="none">
          <div class="section-heading-row compact-heading">
            <span class="panel-kicker">Selected effect drilldown</span>
            <span class="badge warn">none</span>
          </div>
          <div class="empty-state compact">Select a live helper, projectile, or explod actor to inspect effect-specific runtime payload.</div>
        </div>
      `;
    }
    const effect = actor.effect;
    const commonRows = `
      <dt>Actor</dt><dd class="mono">${escapeHtml(actor.id)} / ${escapeHtml(actor.label)}</dd>
      <dt>Owner</dt><dd class="mono">${escapeHtml(actor.ownerId)} / root ${escapeHtml(actor.rootId)} / parent ${escapeHtml(actor.parentId)}</dd>
      <dt>Runtime</dt><dd class="mono">pos ${formatDecimal(actor.runtime.pos.x)}, ${formatDecimal(actor.runtime.pos.y)} / vel ${formatDecimal(actor.runtime.vel.x)}, ${formatDecimal(actor.runtime.vel.y)}</dd>
      <dt>Sprite</dt><dd class="mono">${actor.runtime.animNo}:${actor.runtime.frameIndex} / priority ${actor.runtime.spritePriority ?? 0}</dd>
      <dt>Boxes</dt><dd class="mono">Clsn1 ${actor.clsn1.length} / Clsn2 ${actor.clsn2.length}</dd>
    `;
    let detailRows = "";
    if (effect.kind === "projectile") {
      detailRows = `
        <dt>Projectile</dt><dd class="mono">id ${effect.id ?? "-"} / priority ${effect.priority} / hits ${effect.hitsRemaining}</dd>
        <dt>Hit</dt><dd class="mono">damage ${effect.damage} / pause ${effect.hitPause} / stun ${effect.hitStun}</dd>
        <dt>Guard</dt><dd class="mono">damage ${effect.guardDamage} / pause ${effect.guardPause} / stun ${effect.guardStun} / dist ${effect.guardDistance} / ${escapeHtml(effect.guardFlag ?? "-")}</dd>
        <dt>Rehit</dt><dd class="mono">miss ${effect.missTimeRemaining}/${effect.missTime} / removeOnHit ${String(effect.removeOnHit)} / hasHit ${String(effect.hasHit)}</dd>
        <dt>Removal</dt><dd class="mono">${escapeHtml(effect.removalReason ?? "-")} / terminal ${escapeHtml(effect.terminalReason ?? "-")} ${effect.terminalAge ?? "-"}/${effect.terminalDuration ?? "-"}</dd>
        <dt>Anims</dt><dd class="mono">hit ${effect.hitAnimNo ?? "-"} / rem ${effect.removeAnimNo ?? "-"} / cancel ${effect.cancelAnimNo ?? "-"}</dd>
      `;
    } else if (effect.kind === "explod") {
      detailRows = `
        <dt>Explod</dt><dd class="mono">id ${effect.id ?? "-"} / age ${effect.age} / remove ${effect.removeTime}</dd>
        <dt>Flags</dt><dd class="mono">removeOnGetHit ${String(effect.removeOnGetHit)} / ignoreHitPause ${String(effect.ignoreHitPause)}</dd>
        <dt>Pause budget</dt><dd class="mono">pause ${effect.pauseMoveTime} / super ${effect.superMoveTime}</dd>
        <dt>Bind</dt><dd class="mono">${effect.bindRemaining ?? "-"} / ${effect.bindOffset ? `${formatDecimal(effect.bindOffset.x)}, ${formatDecimal(effect.bindOffset.y)}` : "-"}</dd>
        <dt>Render</dt><dd class="mono">scale ${formatDecimal(effect.scale.x)}, ${formatDecimal(effect.scale.y)} / opacity ${formatDecimal(effect.opacity)}</dd>
      `;
    } else {
      detailRows = `
        <dt>Helper</dt><dd class="mono">id ${effect.id ?? "-"} / ${escapeHtml(effect.name ?? "unnamed")}</dd>
        <dt>State</dt><dd class="mono">${effect.stateNo ?? "-"} / anim ${actor.runtime.animNo}</dd>
        <dt>Lifetime</dt><dd class="mono">age ${effect.age} / remove ${effect.removeTime}</dd>
      `;
    }
    return `
      <div class="debug-evidence-block" data-debug-effect-drilldown="${escapeHtml(effect.kind)}">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Selected effect drilldown</span>
          <span class="badge warn">${escapeHtml(effect.kind)}</span>
        </div>
        <dl class="kv studio-kv">
          ${commonRows}
          ${detailRows}
        </dl>
      </div>
    `;
  }

  private renderStudioDebugPauseLens(selection: StudioDebugSelectionSummary, snapshot: MugenSnapshot): string {
    const pause = snapshot.matchPause;
    const hitPause = this.getStudioDebugHitPauseSummary(snapshot);
    const session = selection.runtimeSession;
    const pauseControllerRows = this.renderDebugCountRows(
      this.filterDebugCountRecord(session?.executedControllers ?? {}, (key) => key.toLowerCase().includes("pause")),
      "No Pause, SuperPause, or hit pause controller has executed for the selected CNS actor yet.",
      "controller",
    );
    const pauseOperationRows = this.renderDebugCountRows(
      this.filterDebugCountRecord(session?.executedOperations ?? {}, (key) => key.toLowerCase().includes("pause")),
      "No typed pause or hit pause operation has executed for the selected CNS actor yet.",
    );
    const actors = this.getStudioDebugSnapshotActors(snapshot);
    const matchPauseRows = pause
      ? actors
          .map(
            (actor) => `
              <div class="compat-row">
                <span class="badge ${actor.id === pause.actorId ? "active" : ""}">${escapeHtml(actor.id)}</span>
                <span>${escapeHtml(actor.label)} / state ${actor.runtime.stateNo} / anim ${actor.runtime.animNo}</span>
                <span class="mono">${actor.runtime.ctrl ? "ctrl" : "no ctrl"} / ${actor.runtime.stateType}${actor.runtime.moveType}${actor.runtime.physics}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-state compact">No global match pause is active on this frame.</div>`;
    const hitPauseRows = hitPause.active
      ? hitPause.actors
          .map(
            (actor) => `
              <div class="compat-row" data-debug-hitpause-row>
                <span class="badge warn">${escapeHtml(actor.id)}</span>
                <span>${escapeHtml(actor.label)} / state ${actor.runtime.stateNo} / anim ${actor.runtime.animNo}</span>
                <span class="mono">${actor.hitPause ?? 0}f / ${actor.runtime.ctrl ? "ctrl" : "no ctrl"} / ${actor.runtime.stateType}${actor.runtime.moveType}${actor.runtime.physics}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-state compact">No actor hitpause is active on this frame.</div>`;
    return `
      <div class="section debug-lens-section" data-debug-filter-panel="pause">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Debug lens</span>
            <h2>Pause / HitPause</h2>
          </div>
          <span class="badge ${pause || hitPause.active ? "active" : "ok"}" data-debug-hitpause-count>${this.formatStudioDebugPauseSummary(
            pause,
            hitPause,
          )}</span>
        </div>
        <dl class="kv studio-kv">
          <dt>Type</dt><dd class="mono">${pause ? escapeHtml(pause.type) : "-"}</dd>
          <dt>Actor</dt><dd class="mono">${pause ? escapeHtml(pause.actorId) : "-"}</dd>
          <dt>Move time</dt><dd class="mono">${pause ? pause.moveTime : "-"}</dd>
          <dt>Darken</dt><dd class="mono">${pause ? String(pause.darken) : "-"}</dd>
          <dt>Source state</dt><dd class="mono">${pause ? pause.sourceStateNo : "-"}</dd>
          <dt>HitPause</dt><dd class="mono">${hitPause.active ? `${hitPause.remaining}f / ${hitPause.actors.length} actor${hitPause.actors.length === 1 ? "" : "s"}` : "-"}</dd>
        </dl>
        ${this.renderStudioDebugPauseTraceEvidence()}
        <div class="debug-evidence-grid">
          <div class="debug-evidence-block">
            <span class="panel-kicker">Pause controllers</span>
            <div class="compat-list">${pauseControllerRows}</div>
          </div>
          <div class="debug-evidence-block">
            <span class="panel-kicker">Pause operations</span>
            <div class="compat-list">${pauseOperationRows}</div>
          </div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Match pause actor state</span>
          <div class="compat-list">${matchPauseRows}</div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">HitPause actors</span>
          <div class="compat-list">${hitPauseRows}</div>
        </div>
      </div>
    `;
  }

  private renderStudioDebugTargetWorldEvidence(selection: StudioDebugSelectionSummary): string {
    const artifact = this.getActiveTraceArtifact();
    if (!artifact) {
      return this.renderStudioDebugWorldEvidenceEmpty(
        "targets",
        "Export a trace artifact from Build to compare target links against recorded world frames.",
      );
    }
    const frames = this.getTraceArtifactFrameSummaries(artifact)
      .filter((frame) => frame.world?.targetLinks.some((link) => this.debugTargetLinkMatchesSelection(link, selection)))
      .slice(0, 8);
    if (!frames.length) {
      return this.renderStudioDebugWorldEvidenceEmpty("targets", "The latest trace has no target-link world frames for this actor.");
    }
    const rows = frames
      .map((frame, index) => {
        const links = frame.world?.targetLinks.filter((link) => this.debugTargetLinkMatchesSelection(link, selection)) ?? [];
        const previous = frames[index - 1]?.world?.targetLinks.filter((link) => this.debugTargetLinkMatchesSelection(link, selection)).length;
        return `
          <button type="button" class="compat-row debug-world-frame-row" data-trace-frame-index="${frame.frameIndex}">
            <span class="badge">F${frame.frameIndex + 1}</span>
            <span>
              <span class="list-title">tick ${frame.tick} / ${links.length} target link${links.length === 1 ? "" : "s"}</span>
              <span class="list-meta">${escapeHtml(
                links
                  .map((link) => `${link.ownerId}->${link.actorId} ${this.formatStudioDebugWorldTargetLink(link)}`)
                  .join("; "),
              )}</span>
            </span>
            <span class="mono">${previous === undefined ? "base" : formatSignedDelta(links.length - previous)}</span>
          </button>
        `;
      })
      .join("");
    return `
      <div class="debug-evidence-block" data-debug-world-evidence="targets">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Trace world evidence</span>
          <span class="badge ok">${frames.length} frames</span>
        </div>
        <div class="compat-list">${rows}</div>
      </div>
    `;
  }

  private renderStudioDebugEffectWorldEvidence(selection: StudioDebugSelectionSummary): string {
    const artifact = this.getActiveTraceArtifact();
    if (!artifact) {
      return this.renderStudioDebugWorldEvidenceEmpty(
        "effects",
        "Export a trace artifact from Build to compare effect stores against recorded world frames.",
      );
    }
    const frames = this.getTraceArtifactFrameSummaries(artifact)
      .filter((frame) => Boolean(frame.world?.effectStores.length || frame.world?.eventsThisTick.some((event) => event.layer === "effect")))
      .slice(0, 8);
    if (!frames.length) {
      return this.renderStudioDebugWorldEvidenceEmpty("effects", "The latest trace has no effect-store world frames.");
    }
    const selectedOwnerId = selection.selectedActor?.ownerId ?? selection.selectedActorId;
    const rows = frames
      .map((frame, index) => {
        const stores = frame.world?.effectStores ?? [];
        const total = stores.reduce((sum, store) => sum + store.total, 0);
        const previousTotal = frames[index - 1]?.world?.effectStores.reduce((sum, store) => sum + store.total, 0);
        const selectedStore = selectedOwnerId ? stores.find((store) => store.ownerId === selectedOwnerId) : undefined;
        const effectEvents = frame.world?.eventsThisTick.filter((event) => event.layer === "effect") ?? [];
        return `
          <button type="button" class="compat-row debug-world-frame-row" data-trace-frame-index="${frame.frameIndex}">
            <span class="badge">F${frame.frameIndex + 1}</span>
            <span>
              <span class="list-title">tick ${frame.tick} / stores ${stores.length} / effects ${frame.effectCount}</span>
              <span class="list-meta">${escapeHtml(
                selectedStore
                  ? `${selectedStore.ownerId} total ${selectedStore.total} / E${selectedStore.explods.length} H${selectedStore.helpers.length} P${selectedStore.projectiles.length}`
                  : stores.map((store) => `${store.ownerId}:${store.total}`).join("; ") || "no stores",
              )}${effectEvents.length ? ` / lifecycle ${effectEvents.length}` : ""}</span>
            </span>
            <span class="mono">${previousTotal === undefined ? "base" : formatSignedDelta(total - previousTotal)}</span>
          </button>
        `;
      })
      .join("");
    return `
      <div class="debug-evidence-block" data-debug-world-evidence="effects">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Trace world evidence</span>
          <span class="badge ok">${frames.length} frames</span>
        </div>
        <div class="compat-list">${rows}</div>
      </div>
    `;
  }

  private renderStudioDebugPauseTraceEvidence(): string {
    const artifact = this.getActiveTraceArtifact();
    if (!artifact) {
      return this.renderStudioDebugWorldEvidenceEmpty(
        "pause",
        "Export a trace artifact from Build to compare Pause, SuperPause, and HitPause gate evidence.",
      );
    }
    const pauseRows = artifact.gates.flatMap((gate) => [
      ...gate.evidence.matchPauses.map(
        (pause) => `
          <div class="compat-row debug-world-frame-row">
            <span class="badge ${gate.passed ? "ok" : "error"}">${escapeHtml(pause.type)}</span>
            <span>
              <span class="list-title">${escapeHtml(gate.label)} / actor ${escapeHtml(pause.actorId)}</span>
              <span class="list-meta">ticks ${pause.firstTick}-${pause.lastTick} / frames ${pause.frames} / remaining ${pause.maxRemaining} / movetime ${pause.maxMoveTime}</span>
            </span>
            <span class="mono">${pause.darken ? "darken" : "clear"}</span>
          </div>
        `,
      ),
      ...gate.evidence.matchPauseFreezes.map(
        (freeze) => `
          <div class="compat-row debug-world-frame-row">
            <span class="badge warn">freeze</span>
            <span>
              <span class="list-title">${escapeHtml(gate.label)} / ${escapeHtml(freeze.actorId)} ${escapeHtml(freeze.actorKind)}</span>
              <span class="list-meta">ticks ${freeze.firstTick}-${freeze.lastTick} / frames ${freeze.frozenFrames} / compared ${escapeHtml(freeze.comparedFields.join(", ") || "-")}</span>
            </span>
            <span class="mono">${escapeHtml(freeze.type)}</span>
          </div>
        `,
      ),
      ...gate.evidence.matchPauseAdvances.map(
        (advance) => `
          <div class="compat-row debug-world-frame-row">
            <span class="badge active">advance</span>
            <span>
              <span class="list-title">${escapeHtml(gate.label)} / ${escapeHtml(advance.actorId)} ${escapeHtml(advance.actorKind)}</span>
              <span class="list-meta">ticks ${advance.firstTick}-${advance.lastTick} / frames ${advance.advancedFrames} / changed ${escapeHtml(advance.changedFields.join(", ") || "-")}</span>
            </span>
            <span class="mono">${escapeHtml(advance.type)}</span>
          </div>
        `,
      ),
    ]);
    if (!pauseRows.length) {
      return this.renderStudioDebugWorldEvidenceEmpty("pause", "The latest Studio trace has no Pause, SuperPause, or HitPause gate evidence.");
    }
    return `
      <div class="debug-evidence-block" data-debug-world-evidence="pause">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Trace pause evidence</span>
          <span class="badge ok">${pauseRows.length} records</span>
        </div>
        <div class="compat-list">${pauseRows.slice(0, 10).join("")}</div>
      </div>
    `;
  }

  private renderStudioDebugWorldEvidenceEmpty(kind: "targets" | "effects" | "pause", message: string): string {
    return `
      <div class="debug-evidence-block" data-debug-world-evidence="${kind}">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">${kind === "pause" ? "Trace pause evidence" : "Trace world evidence"}</span>
          <span class="badge warn">none</span>
        </div>
        <div class="empty-state compact">${escapeHtml(message)}</div>
      </div>
    `;
  }

  private debugTargetLinkMatchesSelection(
    link: Pick<MatchWorldActorRegistrySnapshot["targetLinks"][number], "ownerId" | "actorId">,
    selection: StudioDebugSelectionSummary,
  ): boolean {
    const actorId = selection.selectedActorId;
    if (!actorId) {
      return true;
    }
    return link.ownerId === actorId || link.actorId === actorId;
  }

  private formatStudioDebugTargetGateEvidence(
    link: RuntimeTraceArtifact["gates"][number]["evidence"]["targetLinks"][number],
  ): string {
    const parts = [
      `target ${link.targetId ?? "*"}`,
      `ticks ${link.firstTick}-${link.lastTick}`,
      `age ${link.minAge}-${link.maxAge}`,
    ];
    if (link.hasBinding) {
      parts.push(
        `bind ${this.formatTargetBindingRemaining(link.minBindingRemaining, link.maxBindingRemaining, link.bindingInfinite)}`,
      );
      if (link.bindingOffset) {
        parts.push(`offset ${this.formatTargetOffset(link.bindingOffset)}`);
      }
    }
    return parts.join(" / ");
  }

  private formatStudioDebugWorldTargetLink(link: MatchWorldActorRegistrySnapshot["targetLinks"][number]): string {
    const parts = [`target ${link.targetId ?? "*"}`];
    if (link.binding) {
      parts.push(`bind ${link.binding.remaining}`, `offset ${this.formatTargetOffset(link.binding.offset)}`);
    }
    parts.push(`age ${link.age}f`);
    return parts.join(" / ");
  }

  private formatTargetBindingRemaining(min: number | undefined, max: number | undefined, infinite?: boolean): string {
    if (infinite) {
      return "infinite";
    }
    if (min === undefined && max === undefined) {
      return "-";
    }
    if (min === max) {
      return String(min);
    }
    return `${min ?? "-"}-${max ?? "-"}`;
  }

  private formatTargetOffset(offset: { x: number; y: number }): string {
    return `${offset.x.toFixed(1)},${offset.y.toFixed(1)}`;
  }

  private renderStudioDebugAudioLens(selection: StudioDebugSelectionSummary, snapshot: MugenSnapshot): string {
    const audioDiagnostics = this.audio.getDiagnostics();
    const actors = this.getStudioDebugSnapshotActors(snapshot);
    const selectedActor = selection.snapshotActor;
    const selectedRows = selectedActor
      ? this.renderStudioDebugAudioEventRows([selectedActor], "The selected actor has not emitted sound or envshake events yet.")
      : `<div class="empty-state compact">No actor is selected for audio inspection.</div>`;
    const allRows = this.renderStudioDebugAudioEventRows(actors, "No sound or envshake events are present in the current snapshot.");
    const counts = this.getStudioDebugAudioEventCounts(snapshot);
    return `
      <div class="section debug-lens-section" data-debug-filter-panel="audio">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Debug lens</span>
            <h2>Audio</h2>
          </div>
          <span class="badge ${audioDiagnostics.available ? "ok" : "warn"}">${audioDiagnostics.available ? "SND loaded" : "no SND"}</span>
        </div>
        <div class="studio-stat-grid debug-lens-stat-grid">
          ${this.studioStat("Sound events", counts.soundEvents)}
          ${this.studioStat("EnvShake", counts.envShakeEvents)}
          ${this.studioStat("Played", audioDiagnostics.played)}
          ${this.studioStat("Missing", audioDiagnostics.missing)}
        </div>
        <dl class="kv studio-kv">
          <dt>Unlocked</dt><dd class="mono">${String(audioDiagnostics.unlocked)}</dd>
          <dt>Sounds</dt><dd class="mono">${audioDiagnostics.sounds} / decoded ${audioDiagnostics.decoded}</dd>
          <dt>Errors</dt><dd class="mono">${audioDiagnostics.errors.length ? escapeHtml(audioDiagnostics.errors.join(" | ")) : "-"}</dd>
        </dl>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Selected actor events</span>
          <div class="compat-list">${selectedRows}</div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">World audio events</span>
          <div class="compat-list">${allRows}</div>
        </div>
      </div>
    `;
  }

  private renderStudioDebugTargetRows(links: MatchWorldActorRegistrySnapshot["targetLinks"], emptyMessage: string): string {
    if (!links.length) {
      return `<div class="empty-state compact">${escapeHtml(emptyMessage)}</div>`;
    }
    return links
      .map(
        (link) => `
          <button type="button" class="compat-row debug-target-row" data-debug-actor-id="${escapeHtml(link.actorId)}">
            <span class="badge">${escapeHtml(link.ownerId)}</span>
            <span>
              <span class="list-title">${escapeHtml(link.ownerId)} -> ${escapeHtml(link.actorId)}</span>
              <span class="list-meta">target ${escapeHtml(link.targetId === undefined ? "*" : String(link.targetId))}${
                link.binding
                  ? ` / bind ${escapeHtml(String(link.binding.remaining))} / offset ${link.binding.offset.x.toFixed(1)},${link.binding.offset.y.toFixed(1)}`
                  : ""
              }</span>
            </span>
            <span class="mono">${link.age}f</span>
          </button>
        `,
      )
      .join("");
  }

  private renderStudioDebugAudioEventRows(actors: MugenSnapshot["actors"], emptyMessage: string): string {
    const rows = actors.flatMap((actor) => [
      ...(actor.soundEvents ?? []).map(
        (event) => `
          <div class="compat-row debug-event-row">
            <span class="badge ${event.type === "PlaySnd" ? "active" : "warn"}">${event.type}</span>
            <span>
              <span class="list-title">${escapeHtml(actor.label)}</span>
              <span class="list-meta">state ${event.stateNo} / sound ${event.group ?? "-"},${event.index ?? "-"} / channel ${event.channel ?? "-"}</span>
            </span>
            <span class="mono">t${event.tick}${event.runtimeTick === undefined ? "" : ` / r${event.runtimeTick}`}</span>
          </div>
        `,
      ),
      ...(actor.envShakeEvents ?? []).map(
        (event) => `
          <div class="compat-row debug-event-row">
            <span class="badge warn">${event.type}</span>
            <span>
              <span class="list-title">${escapeHtml(actor.label)}</span>
              <span class="list-meta">state ${event.stateNo} / time ${event.time} / freq ${event.freq} / ampl ${event.ampl}</span>
            </span>
            <span class="mono">t${event.tick} / r${event.runtimeTick}</span>
          </div>
        `,
      ),
    ]);
    return rows.length ? rows.slice(0, 18).join("") : `<div class="empty-state compact">${escapeHtml(emptyMessage)}</div>`;
  }

  private getStudioDebugSnapshotActors(snapshot: MugenSnapshot): MugenSnapshot["actors"] {
    return [...snapshot.actors, ...(snapshot.effects ?? [])];
  }

  private getStudioDebugHitPauseSummary(snapshot: MugenSnapshot): StudioDebugHitPauseSummary {
    const actors = this.getStudioDebugSnapshotActors(snapshot).filter((actor) => (actor.hitPause ?? 0) > 0);
    return {
      active: actors.length > 0,
      remaining: actors.reduce((max, actor) => Math.max(max, actor.hitPause ?? 0), 0),
      actors,
    };
  }

  private formatStudioDebugPauseSummary(
    pause: MugenSnapshot["matchPause"],
    hitPause: StudioDebugHitPauseSummary,
  ): string {
    if (pause) {
      return `${pause.type} ${pause.remaining}f`;
    }
    if (hitPause.active) {
      return `HitPause ${hitPause.remaining}f`;
    }
    return "clear";
  }

  private formatStudioDebugPauseFocus(
    pause: MugenSnapshot["matchPause"],
    hitPause: StudioDebugHitPauseSummary,
    snapshot: MugenSnapshot,
  ): { title: string; detail: string } {
    if (pause) {
      return {
        title: `${pause.type} pause`,
        detail: `${pause.remaining}f remaining / actor ${pause.actorId}`,
      };
    }
    if (hitPause.active) {
      const actorList = hitPause.actors
        .slice(0, 3)
        .map((actor) => `${actor.id}:${actor.hitPause ?? 0}f`)
        .join(", ");
      return {
        title: `HitPause ${hitPause.remaining}f`,
        detail: `${actorList}${hitPause.actors.length > 3 ? `, +${hitPause.actors.length - 3}` : ""}`,
      };
    }
    return {
      title: "No pause",
      detail: `${snapshot.playing ? "playing" : "paused"} / tick ${snapshot.tick}`,
    };
  }

  private getStudioDebugAudioEventCounts(snapshot: MugenSnapshot): { soundEvents: number; envShakeEvents: number } {
    return this.getStudioDebugSnapshotActors(snapshot).reduce(
      (counts, actor) => ({
        soundEvents: counts.soundEvents + (actor.soundEvents?.length ?? 0),
        envShakeEvents: counts.envShakeEvents + (actor.envShakeEvents?.length ?? 0),
      }),
      { soundEvents: 0, envShakeEvents: 0 },
    );
  }

  private filterDebugCountRecord(record: Record<string, number>, predicate: (key: string) => boolean): Record<string, number> {
    return Object.fromEntries(Object.entries(record).filter(([key]) => predicate(key)));
  }

  private formatDebugIdList(ids: string[]): string {
    if (!ids.length) {
      return "-";
    }
    const visible = ids.slice(0, 4).join(", ");
    return ids.length > 4 ? `${visible}, +${ids.length - 4}` : visible;
  }

  private renderDebugActorButton(
    actor: MatchWorldActorRegistrySnapshot["actors"][number],
    selectedActorId: string | undefined,
  ): string {
    const selected = actor.id === selectedActorId;
    const tone = actor.layer === "effect" ? "warn" : actor.kind === "player" ? "ok" : "";
    return `
      <button type="button" class="debug-actor-button ${selected ? "is-selected" : ""}" data-debug-actor-id="${escapeHtml(actor.id)}">
        <span class="debug-actor-main">
          <strong>${escapeHtml(actor.label)}</strong>
          <small>${escapeHtml(actor.id)} / ${escapeHtml(actor.kind)} / ${escapeHtml(actor.source ?? "unknown")}</small>
        </span>
        <span class="debug-actor-metrics">
          <span class="badge ${tone}">${escapeHtml(actor.layer)}</span>
          <span class="mono">S${actor.stateNo} A${actor.animNo}</span>
        </span>
      </button>
    `;
  }

  private renderStudioDebugActorDetail(selection: StudioDebugSelectionSummary): string {
    const actor = selection.selectedActor;
    if (!actor) {
      return `
        <div class="section">
          <h2>Actor Detail</h2>
          <div class="empty-state">No actor is available to inspect.</div>
        </div>
      `;
    }
    const runtime = selection.snapshotActor?.runtime;
    const targetRows = selection.relatedTargetLinks.length
      ? selection.relatedTargetLinks
          .map(
            (link) => `
              <div class="compat-row">
                <span class="badge ${link.ownerId === actor.id ? "active" : ""}">${escapeHtml(link.ownerId)}</span>
                <span>${escapeHtml(link.ownerId)} -> ${escapeHtml(link.actorId)} target ${escapeHtml(link.targetId === undefined ? "*" : String(link.targetId))}</span>
                <span class="mono">${link.age}f${link.binding ? ` / bind ${escapeHtml(String(link.binding.remaining))}` : ""}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-state compact">No target links reference this actor right now.</div>`;
    const ownedRows = selection.ownedActors.length
      ? selection.ownedActors
          .map(
            (owned) => `
              <button type="button" class="list-item compact-debug-row" data-debug-actor-id="${escapeHtml(owned.id)}">
                <span>
                  <span class="list-title">${escapeHtml(owned.label)}</span>
                  <span class="list-meta">${escapeHtml(owned.id)} / ${escapeHtml(owned.kind)} / state ${owned.stateNo}</span>
                </span>
                <span class="badge ${owned.layer === "effect" ? "warn" : "ok"}">${escapeHtml(owned.layer)}</span>
              </button>
            `,
          )
          .join("")
      : `<div class="empty-state compact">This actor does not own other indexed actors in the current frame.</div>`;
    const eventRows = selection.recentEvents.length
      ? selection.recentEvents
          .slice(0, 6)
          .map(
            (event) => `
              <div class="compat-row">
                <span class="badge ${event.type === "spawn" ? "active" : event.type === "remove" ? "warn" : ""}">${escapeHtml(event.type)}</span>
                <span>${escapeHtml(event.label)} / ${escapeHtml(event.id)}</span>
                <span class="mono">t${event.tick} / ${event.ageTicks}f</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-state compact">No lifecycle events were recorded for this actor yet.</div>`;
    return `
      <div class="section section-emphasis" data-debug-selected-actor="${escapeHtml(actor.id)}">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Actor detail</span>
            <h2>${escapeHtml(actor.label)}</h2>
          </div>
          <span class="badge ${actor.layer === "effect" ? "warn" : "ok"}">${escapeHtml(actor.id)}</span>
        </div>
        <dl class="kv studio-kv">
          <dt>Kind</dt><dd class="mono">${escapeHtml(actor.kind)} / ${escapeHtml(actor.layer)} / ${escapeHtml(actor.source ?? "unknown")}</dd>
          <dt>Owner</dt><dd class="mono">${escapeHtml(actor.ownerId)} / root ${escapeHtml(actor.rootId)} / parent ${escapeHtml(actor.parentId)}</dd>
          <dt>Sprite owner</dt><dd class="mono">${escapeHtml(actor.spriteOwnerId ?? actor.id)}${actor.spriteOwnerDefinitionId ? ` / ${escapeHtml(actor.spriteOwnerDefinitionId)}` : ""}</dd>
          <dt>Lifecycle</dt><dd class="mono">${escapeHtml(actor.lifecycle.status)} / first ${actor.lifecycle.firstSeenTick} / last ${actor.lifecycle.lastSeenTick} / age ${actor.lifecycle.ageTicks}</dd>
          <dt>State</dt><dd class="mono">${actor.stateNo} / anim ${actor.animNo}</dd>
          <dt>Vitals</dt><dd class="mono">life ${actor.life} / power ${actor.power}</dd>
          ${
            runtime
              ? `
                <dt>Pos</dt><dd class="mono">${runtime.pos.x.toFixed(1)}, ${runtime.pos.y.toFixed(1)} / facing ${runtime.facing}</dd>
                <dt>Vel</dt><dd class="mono">${runtime.vel.x.toFixed(1)}, ${runtime.vel.y.toFixed(1)}</dd>
                <dt>Ctrl</dt><dd class="mono">${runtime.ctrl ? "true" : "false"} / ${runtime.stateType}/${runtime.moveType}/${runtime.physics}</dd>
                <dt>Frame</dt><dd class="mono">${runtime.frameIndex} / anim time ${runtime.animTime}</dd>
                <dt>Boxes</dt><dd class="mono">Clsn1 ${selection.snapshotActor?.clsn1.length ?? 0} / Clsn2 ${selection.snapshotActor?.clsn2.length ?? 0}</dd>
                <dt>Targets</dt><dd class="mono">${runtime.targetCount ?? 0} / refs ${runtime.targetRefs?.length ?? 0} / binds ${runtime.targetBindings?.length ?? 0}</dd>
              `
              : `
                <dt>Runtime</dt><dd class="mono">effect registry summary only</dd>
              `
          }
          ${
            selection.effectStore
              ? `<dt>Effect store</dt><dd class="mono">total ${selection.effectStore.total} / explod ${selection.effectStore.explods.length} / helper ${selection.effectStore.helpers.length} / projectile ${selection.effectStore.projectiles.length}</dd>`
              : ""
          }
        </dl>
        <div class="badge-row">
          ${runtime?.guarding ? `<span class="badge warn">guard ${runtime.guardStun ?? 0}</span>` : ""}
          ${runtime?.hitFall ? `<span class="badge warn">fall ${runtime.hitFall.falling ? "on" : "off"}</span>` : ""}
          ${runtime?.customState ? `<span class="badge warn">custom ${escapeHtml(runtime.customState.ownerId)}:${runtime.customState.stateNo}</span>` : ""}
          ${runtime?.hitOverrides?.length ? `<span class="badge warn">overrides ${runtime.hitOverrides.length}</span>` : ""}
          ${runtime?.reversal ? `<span class="badge warn">reversal</span>` : ""}
          ${selection.snapshotActor?.soundEvents?.length ? `<span class="badge active">sound ${selection.snapshotActor.soundEvents.length}</span>` : ""}
          ${selection.snapshotActor?.envShakeEvents?.length ? `<span class="badge warn">shake ${selection.snapshotActor.envShakeEvents.length}</span>` : ""}
        </div>
      </div>
      ${actor.layer === "effect" && this.studioDebugFilter !== "effects" ? this.renderStudioDebugEffectDrilldown(selection.snapshotActor) : ""}
      ${this.renderStudioDebugExecutionEvidence(selection)}
      ${this.renderStudioDebugTraceEvidence(selection)}
      <div class="section">
        <h2>Target Links</h2>
        <div class="compat-list">${targetRows}</div>
      </div>
      <div class="section">
        <h2>Owned Actors</h2>
        <div class="list compact-list">${ownedRows}</div>
      </div>
      <div class="section">
        <h2>Lifecycle Events</h2>
        <div class="compat-list">${eventRows}</div>
      </div>
    `;
  }

  private renderStudioDebugExecutionEvidence(selection: StudioDebugSelectionSummary): string {
    const session = selection.runtimeSession;
    if (!selection.selectedActor) {
      return "";
    }
    if (!session) {
      return `
        <div class="section" data-debug-execution-evidence="none">
          <div class="section-heading-row">
            <h2>Execution Evidence</h2>
            <span class="badge warn">no CNS session</span>
          </div>
          <div class="empty-state compact">This actor is not currently an imported CNS-backed runtime actor, so no routed states or executed controllers are attached to it.</div>
        </div>
      `;
    }
    const controllerRows = this.renderDebugCountRows(session.executedControllers, "No controllers executed for this actor yet.", "controller");
    const operationRows = this.renderDebugCountRows(session.executedOperations, "No typed controller operations executed for this actor yet.", "controller");
    const stateIds = [...new Set([...session.executedStates, ...session.routedStates])].sort((left, right) => left - right);
    const stateButtons = stateIds.length
      ? stateIds
          .slice(0, 12)
          .map(
            (stateId) =>
              `<button type="button" class="debug-link-button" data-debug-state-filter="state ${stateId}">State ${stateId}${
                session.executedStates.includes(stateId) ? " / executed" : " / routed"
              }</button>`,
          )
          .join("")
      : `<div class="empty-state compact">No executed or routed state ids have been recorded for this actor yet.</div>`;
    return `
      <div class="section" data-debug-execution-evidence="${escapeHtml(session.actorId)}">
        <div class="section-heading-row">
          <h2>Execution Evidence</h2>
          <span class="badge ok">imported CNS</span>
        </div>
        <div class="studio-stat-grid">
          ${this.studioStat("Executed states", session.executedStates.length)}
          ${this.studioStat("Routed states", session.routedStates.length)}
          ${this.studioStat("Controllers", Object.keys(session.executedControllers).length)}
          ${this.studioStat("Ops", Object.keys(session.executedOperations).length)}
        </div>
        <dl class="kv studio-kv">
          <dt>Actor</dt><dd class="mono">${escapeHtml(session.label)} / ${escapeHtml(session.actorId)}</dd>
          <dt>Last routed</dt><dd class="mono">${session.lastRoutedState ? `${session.lastRoutedState.stateId}${session.lastRoutedState.name ? ` / ${escapeHtml(session.lastRoutedState.name)}` : ""}` : "-"}</dd>
          <dt>Last executed</dt><dd class="mono">${session.lastExecutedState ?? "-"}</dd>
          <dt>State entries</dt><dd class="mono">${session.routedStateEntries}</dd>
        </dl>
        <div class="debug-evidence-block">
          <span class="panel-kicker">State links</span>
          <div class="debug-link-grid">${stateButtons}</div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Active commands</span>
          ${
            session.activeCommands.length
              ? `<div class="badge-row">${session.activeCommands
                  .map(
                    (command) =>
                      `<button type="button" class="badge active debug-command-chip" data-debug-command-filter="${escapeHtml(command)}">${escapeHtml(command)}</button>`,
                  )
                  .join("")}</div>`
              : `<div class="empty-state compact">No imported command is active for this actor in the current frame.</div>`
          }
        </div>
        ${this.renderStudioDebugCommandHistory(session)}
        <div class="debug-evidence-grid">
          <div class="debug-evidence-block">
            <span class="panel-kicker">Controllers</span>
            <div class="compat-list">${controllerRows}</div>
          </div>
          <div class="debug-evidence-block">
            <span class="panel-kicker">Typed ops</span>
            <div class="compat-list">${operationRows}</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderStudioDebugCommandHistory(session: StudioDebugRuntimeSession): string {
    const history = session.commandHistory.slice(-14).reverse();
    const commandLinks = this.getStudioDebugCommandLinkNames(session);
    const rows = history.length
      ? history
          .map(
            (sample) => `
              <div class="debug-input-row ${sample.values.length ? "has-input" : ""}">
                <span class="mono">t${sample.frame}</span>
                <span>${sample.values.length ? sample.values.map((value) => `<b>${escapeHtml(value)}</b>`).join("") : `<small>-</small>`}</span>
                <span class="badge ${sample.hitPause ? "warn" : ""}">${sample.hitPause ? "hitpause" : "live"}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-state compact">No command-buffer samples are attached to this actor yet.</div>`;
    return `
      <div class="debug-evidence-block" data-debug-command-history="${escapeHtml(session.actorId)}">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Command buffer</span>
          <span class="badge">${session.commandHistory.length} samples</span>
        </div>
        ${
          commandLinks.length
            ? `<div class="debug-link-grid">${commandLinks
                .map(
                  (command) =>
                    `<button type="button" class="debug-link-button" data-debug-command-filter="${escapeHtml(command)}">${escapeHtml(command)}</button>`,
                )
                .join("")}</div>`
            : ""
        }
        <div class="debug-input-history">${rows}</div>
      </div>
    `;
  }

  private getStudioDebugCommandLinkNames(session: StudioDebugRuntimeSession): string[] {
    const names: string[] = [];
    const seen = new Set<string>();
    const add = (name: string): void => {
      const clean = name.trim();
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) {
        return;
      }
      seen.add(key);
      names.push(clean);
    };
    for (const name of session.activeCommands) {
      add(name);
    }
    for (const command of this.character?.commands ?? []) {
      add(command.name);
      if (names.length >= 12) {
        break;
      }
    }
    return names.slice(0, 12);
  }

  private renderStudioDebugTraceEvidence(selection: StudioDebugSelectionSummary): string {
    const trace = selection.traceEvidence;
    if (!trace.traceChecksum) {
      return `
        <div class="section" data-debug-trace-evidence="none">
          <div class="section-heading-row">
            <h2>Trace Evidence</h2>
            <span class="badge warn">not exported</span>
          </div>
          <div class="empty-state compact">Export a trace artifact from Build to link this actor to frame evidence.</div>
        </div>
      `;
    }
    const frameRows = trace.frames.length
      ? trace.frames
          .map(
            (frame) => `
              <button type="button" class="trace-frame-button debug-trace-frame-button" data-trace-frame-index="${frame.frameIndex}">
                <strong>F${frame.frameIndex + 1} / t${frame.tick}</strong>
                <span>${escapeHtml(frame.label ?? frame.checksum)}</span>
                <small>${escapeHtml(this.formatTraceInput(frame.input))}</small>
                <span class="badge-row">
                  ${frame.reasons.slice(0, 3).map((reason) => `<span class="badge">${escapeHtml(reason)}</span>`).join("")}
                  ${frame.targetLinkCount ? `<span class="badge warn">targets ${frame.targetLinkCount}</span>` : ""}
                </span>
              </button>
            `,
          )
          .join("")
      : `<div class="empty-state compact">The latest trace has no actor-specific frame matches for this selection.</div>`;
    const gateRows = trace.gates.length
      ? trace.gates
          .map(
            (gate) => `
              <div class="compat-row">
                <span class="badge ${gate.passed ? "ok" : "error"}">${gate.passed ? "passed" : "failed"}</span>
                <span>
                  <span class="list-title">${escapeHtml(gate.label)}</span>
                  <span class="list-meta">${escapeHtml(gate.summary)}</span>
                </span>
                <span class="mono">${gate.failures.length ? `${gate.failures.length} fail` : "clean"}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-state compact">No gate references this actor through final/world evidence yet.</div>`;
    const traceFilterButtons = [...new Set([...trace.controllerKeys, ...trace.operationKeys])].length
      ? [...new Set([...trace.controllerKeys, ...trace.operationKeys])]
          .slice(0, 10)
          .map((key) => `<button type="button" class="debug-link-button" data-debug-controller-filter="${escapeHtml(key)}">${escapeHtml(key)}</button>`)
          .join("")
      : `<div class="empty-state compact">No controller or operation keys were captured in actor-related trace gates.</div>`;
    return `
      <div class="section" data-debug-trace-evidence="${escapeHtml(trace.traceChecksum)}">
        <div class="section-heading-row">
          <h2>Trace Evidence</h2>
          <span class="badge ${trace.traceStatus === "passed" ? "ok" : "error"}">${escapeHtml(trace.traceStatus ?? "unknown")}</span>
        </div>
        <dl class="kv studio-kv">
          <dt>Trace</dt><dd class="mono">${escapeHtml(trace.traceLabel ?? "-")} / ${escapeHtml(trace.traceChecksum)}</dd>
          <dt>Frames</dt><dd class="mono">${trace.traceFrameCount} total / ${trace.frames.length} linked</dd>
          <dt>Trace controllers</dt><dd class="mono">${trace.controllerKeys.length ? trace.controllerKeys.slice(0, 6).map((key) => escapeHtml(key)).join(", ") : "-"}</dd>
          <dt>Trace ops</dt><dd class="mono">${trace.operationKeys.length ? trace.operationKeys.slice(0, 6).map((key) => escapeHtml(key)).join(", ") : "-"}</dd>
          <dt>Final actor</dt><dd class="mono">${
            trace.finalActor
              ? `${escapeHtml(trace.finalActor.id)} / state ${trace.finalActor.stateNo} / anim ${trace.finalActor.animNo} / ctrl ${trace.finalActor.ctrl ? "true" : "false"}`
              : "not present in final trace actors"
          }</dd>
        </dl>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Inspector filters</span>
          <div class="debug-link-grid">${traceFilterButtons}</div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Linked frames</span>
          <div class="debug-trace-frame-list">${frameRows}</div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Related gates</span>
          <div class="compat-list">${gateRows}</div>
        </div>
      </div>
    `;
  }

  private renderDebugCountRows(record: Record<string, number>, emptyMessage: string, action?: "controller"): string {
    const entries = Object.entries(record).sort(([, left], [, right]) => right - left);
    if (!entries.length) {
      return `<div class="empty-state compact">${escapeHtml(emptyMessage)}</div>`;
    }
    return entries
      .slice(0, 8)
      .map(
        ([label, count]) => `
          <button type="button" class="compat-row debug-count-row" ${action === "controller" ? `data-debug-controller-filter="${escapeHtml(label)}"` : ""}>
            <span>${escapeHtml(label)}</span>
            <span class="mono">x${count}</span>
          </button>
        `,
      )
      .join("");
  }

  private formatTraceInput(input: RuntimeTraceArtifactFrameSummary["input"]): string {
    const p1 = input.p1.length ? input.p1.join("+") : "-";
    const p2 = input.p2?.length ? input.p2.join("+") : "-";
    return `p1 ${p1} / p2 ${p2}`;
  }

  private renderStudioModulesNavigator(): string {
    const summary = this.getStudioProjectSummary();
    const compiled = this.lastCompiledProject;
    const sharedContracts = compiled?.contracts.sharedContracts ?? [];
    const sharedForbidden =
      compiled?.contracts.boundaries.sharedCoreForbidden ??
      summary.modules.find((module) => module.id === "three-render")?.forbiddenSharedCoreConcepts ??
      [];
    const platformerForbidden =
      compiled?.contracts.boundaries.platformerForbidden ??
      summary.modules.find((module) => module.id === "platformer-module")?.forbiddenSharedCoreConcepts ??
      [];
    return `
      <div class="section">
        <h2>Shared Contracts</h2>
        <div class="studio-stat-grid">
          ${this.studioStat("Shared", sharedContracts.length)}
          ${this.studioStat("Modules", compiled?.contracts.moduleContracts.length ?? summary.modules.length)}
          ${this.studioStat("Core blocks", sharedForbidden.length)}
          ${this.studioStat("Genre blocks", platformerForbidden.length)}
        </div>
        <div class="contract-strip compact" aria-label="Visible shared engine contract ids">
          ${this.renderContractPills(sharedContracts, compiled ? "none" : "compile first")}
        </div>
        <div class="badge-row">
          <span class="badge warn">CNS blocked</span>
          <span class="badge warn">HitDef blocked</span>
          <span class="badge warn">ZSS blocked</span>
        </div>
      </div>
      <div class="section">
        <h2>Module Graph Studio</h2>
        <div class="module-graph">
          ${summary.modules
            .map(
              (module) => `
                <div class="module-node ${module.status === "active" ? "is-active" : module.status === "planned" ? "is-planned" : ""}">
                  <strong>${escapeHtml(module.label)}</strong>
                  <span>${escapeHtml(module.id)}</span>
                  ${this.statusBadge(module.status)}
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="section">
        <h2>Compiler Status</h2>
        <div class="studio-stat-grid">
          ${this.studioStat("Requested", summary.modules.length)}
          ${this.studioStat("Active", compiled?.modules.active.length ?? 0)}
          ${this.studioStat("Planned", compiled?.modules.planned.length ?? 0)}
          ${this.studioStat("Missing", compiled?.modules.missing.length ?? 0)}
        </div>
        <button type="button" class="full-width-action" data-action="compile-project">Compile runtime</button>
      </div>
    `;
  }

  private renderStudioModulesRightPane(): string {
    const summary = this.getStudioProjectSummary();
    const compiled = this.lastCompiledProject;
    return `
      ${this.renderRuntimeManifestPanel()}
      ${this.renderEngineModulesPanel(summary)}
      <div class="section">
        <h2>Module Boundaries</h2>
        <div class="pipeline-list">
          <span class="pipeline-step active">Core snapshots<small>Runtime state stays renderer-independent.</small></span>
          <span class="pipeline-step active">Three adapter<small>Scene graph renders snapshots only.</small></span>
          <span class="pipeline-step">Future modules<small>Platformer and other genres must compile to their own runtime contracts.</small></span>
        </div>
        ${this.renderSharedBoundaryPanel(summary, compiled)}
      </div>
    `;
  }

  private renderStudioBuildNavigator(): string {
    const summary = this.getStudioProjectSummary();
    const compiled = this.lastCompiledProject;
    const bundle = this.lastProjectBundle;
    const readiness = this.getBuildReadinessRecords(summary);
    const blocked = readiness.filter((record) => record.state === "blocked").length;
    const partial = readiness.filter((record) => record.state === "partial").length;
    const exportable = readiness.filter((record) => record.state === "exportable").length;
    return `
      <div class="section section-emphasis build-command-center">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Build desk</span>
            <h2>Build Outputs</h2>
          </div>
          <span class="badge ${blocked ? "error" : partial ? "warn" : "ok"}">${blocked ? `${blocked} blocked` : partial ? `${partial} partial` : "ready"}</span>
        </div>
        <div class="build-runway" aria-label="Build export runway">
          <span class="${compiled ? "is-ok" : "is-warn"}"><b>${compiled ? "compiled" : "pending"}</b><small>runtime</small></span>
          <span class="${bundle ? "is-ok" : "is-warn"}"><b>${bundle ? "exported" : "pending"}</b><small>package</small></span>
          <span class="${exportable ? "is-ok" : "is-warn"}"><b>${exportable}</b><small>export</small></span>
          <span class="${blocked ? "is-error" : "is-ok"}"><b>${blocked}</b><small>blocked</small></span>
        </div>
        <div class="build-action-grid" aria-label="Build actions">
          ${studioActionButton(compiled ? "Export package ZIP" : "Compile runtime", compiled ? 'data-action="export-package"' : 'data-action="compile-project"', {
            primary: true,
            fullWidth: true,
          })}
          ${studioActionButton("Export trace artifact", 'data-action="export-trace-artifact"', { fullWidth: true })}
          ${studioActionButton("Runtime manifest", 'data-action="export-runtime"', { disabled: !compiled })}
          ${studioActionButton("Project JSON", 'data-action="export-project"')}
          ${studioActionButton("Compatibility report", 'data-action="export-report"')}
          ${studioActionButton("Save local project", 'data-action="save-project-local"')}
        </div>
      </div>
      <div class="section">
        <h2>Build Readiness</h2>
        <div class="build-readiness-header" aria-hidden="true">
          <span>Record</span>
          <span>Gate</span>
        </div>
        <div class="list compact-list">
          ${readiness.map((record) => this.renderBuildReadinessRecord(record)).join("")}
        </div>
      </div>
      ${this.renderStudioCompatibilitySnapshotPanel()}
      ${this.renderStudioPackageAnalysisPanel()}
      <div class="section">
        <h2>Recent Projects</h2>
        ${
          this.storedProjects.length
            ? `<div class="list">${this.storedProjects
                .slice(0, 6)
                .map(
                  (project) => `
                    <button type="button" class="list-item" data-stored-project-id="${escapeHtml(project.id)}">
                      <span>
                        <span class="list-title">${escapeHtml(project.name)}</span>
                        <span class="list-meta">${escapeHtml(project.id)} / ${escapeHtml(formatDateTime(project.savedAt))}</span>
                      </span>
                    </button>
                  `,
                )
                .join("")}</div>`
            : `<div class="empty-state">No local projects saved yet.</div>`
        }
      </div>
    `;
  }

  private renderStudioBuildRightPane(): string {
    const summary = this.getStudioProjectSummary();
    const trustRows = this.getStudioTrustContractRows(summary);
    return `
      ${this.renderStudioTrustContract(trustRows, "build")}
      ${this.renderBuildReadinessPanel(summary)}
      ${this.renderStudioCompatibilitySnapshotPanel()}
      ${this.renderStudioPackageAnalysisPanel()}
      ${this.renderSourcePackagePanel()}
      ${this.renderProjectBundlePanel()}
      ${this.renderRuntimeManifestPanel()}
      ${this.renderAcceptanceGatesPanel(summary)}
      ${this.renderTraceEvidencePanel()}
    `;
  }

  private renderSourcePackagePanel(): string {
    const sourcePackages = this.getProjectSourcePackages();
    const sourceTransactions = new Map(
      this.getSourceTransactionRecords().map((record) => [record.sourcePackageId, record]),
    );
    return `
      <div class="section">
        <h2>Source Packages</h2>
        ${this.renderSourceImportTransactionNotice()}
      ${
        sourcePackages.length
            ? `<div class="list compact-list">
                ${sourcePackages
                  .map((sourcePackage) => this.renderSourcePackageRow(sourcePackage, sourceTransactions.get(sourcePackage.id)))
                  .join("")}
              </div>`
            : `<div class="empty-state">No imported source package is required for the current local/generated project.</div>`
        }
        ${this.renderStudioSourceDocumentEditor()}
      </div>
    `;
  }

  private renderSourceImportTransactionNotice(): string {
    const transaction = this.sourceImportTransaction;
    if (!transaction || transaction.status !== "rejected") {
      return "";
    }
    const fingerprint = transaction.fingerprint ? ` / ${transaction.fingerprint.slice(0, 12)}...` : "";
    return `
      <section class="studio-project-conflict studio-source-transaction" role="alert" aria-live="assertive">
        <div class="studio-project-conflict-head">
          ${tablerIcon("alert", "ui-icon action-icon")}
          <span>
            <strong>Source reimport rejected</strong>
            <small>${escapeHtml(transaction.reason)} / ${escapeHtml(transaction.sourceName)}${escapeHtml(fingerprint)}</small>
          </span>
        </div>
        <div class="studio-project-conflict-actions"><small>Current runtime/source session was retained.</small></div>
      </section>
    `;
  }

  private renderSourcePackageRow(sourcePackage: GameProjectSourcePackage, sourceTransaction?: SourceTransactionRecord): string {
    const packageFocused = this.studioFocusedSourcePackageId === sourcePackage.id;
    const focusClass = packageFocused ? " is-linked-focus" : "";
    const sourceHandle = this.getSourceHandleRecords().find((record) => record.sourcePackageId === sourcePackage.id);
    const sourceHandleLabel = sourcePackage.kind === "folder" ? "folder handle" : "ZIP handle";
    const sourceHandleKind = sourceHandle?.handleKind ?? (sourcePackage.kind === "folder" ? "directory" : "file");
    const identityStatus = sourcePackage.identityStatus ?? "unknown";
    const identityDetail = identityStatus === "matched"
      ? "Fingerprint matches the saved source identity."
      : identityStatus === "changed"
        ? "Fingerprint changed; explicit reimport is required before export."
        : identityStatus === "missing"
          ? "No source bytes are currently linked in this browser session."
          : "Source identity is not established yet.";
    const pathRows = sourcePackage.requiredPaths
      .slice(0, 12)
      .map((sourcePath) => this.renderSourcePackageRequiredPath(sourcePackage, sourcePath))
      .join("");
    const hiddenPathCount = Math.max(0, sourcePackage.requiredPaths.length - 12);
    return `
      <div class="list-item source-package-row${focusClass}" data-source-package-id="${escapeHtml(sourcePackage.id)}">
        <span>
          <span class="list-title">${escapeHtml(sourcePackage.name)}</span>
          <span class="list-meta">${escapeHtml(sourcePackage.kind)} / ${sourcePackage.fileCount} files / ${sourcePackage.requiredPaths.length} required paths / ${escapeHtml(sourcePackage.id)}</span>
          ${
            sourcePackage.status === "linked"
              ? `<span class="list-meta">Source files are available for package export in this browser session.</span>`
              : `<span class="list-meta">${escapeHtml(identityDetail)} Reload the original ZIP or folder so imported DEF/SFF/AIR/CNS files can be embedded again.</span>`
          }
          <span class="list-meta">Identity: ${escapeHtml(identityStatus)}${sourcePackage.fingerprint ? ` / ${escapeHtml(sourcePackage.fingerprint.slice(0, 12))}...` : ""}</span>
          <span class="list-meta">Transaction: ${escapeHtml(sourceTransaction?.state ?? "missing")} / permission ${escapeHtml(sourceTransaction?.permission ?? "unsupported")} / next ${escapeHtml(sourceTransaction?.nextAction ?? "relink-source")}</span>
          <span class="list-meta">Handle: ${escapeHtml(sourceHandle?.state ?? "not-linked")} / ${escapeHtml(sourceHandleKind)} / ${escapeHtml(sourceHandle?.storage ?? "memory")} / next ${escapeHtml(sourceHandle?.nextAction ?? "relink-source")}</span>
          ${
            pathRows
              ? `<span class="source-package-path-list" aria-label="Required source paths">${pathRows}${hiddenPathCount ? `<span class="list-meta">+${hiddenPathCount} more required source path(s)</span>` : ""}</span>`
              : ""
          }
        </span>
        <span class="row-actions">
          ${this.statusBadge(sourcePackage.status === "linked" ? "ok" : "warn")}
          <button type="button" data-action="relink-source">${sourcePackage.status === "linked" ? "Reimport" : "ZIP"}</button>
          <button type="button" data-action="relink-source-folder">Folder</button>
          ${sourceHandle?.nextAction === "link-handle"
            ? `<button type="button" data-action="link-source-handle" title="Remember this ${sourceHandleLabel} for future recovery">Remember</button>`
            : ""}
          ${sourceHandle?.nextAction === "request-permission"
            ? `<button type="button" data-action="request-source-handle-permission" title="Request read permission for the remembered ${sourceHandleLabel}">Permit</button>`
            : ""}
          ${sourceHandle?.nextAction === "recover-source"
            ? `<button type="button" data-action="recover-source-handle" title="Recover this source package from its remembered ${sourceHandleLabel}">Recover</button>`
            : ""}
        </span>
      </div>
    `;
  }

  private renderSourcePackageRequiredPath(sourcePackage: GameProjectSourcePackage, sourcePath: string): string {
    const focused = this.studioFocusedSourcePackageId === sourcePackage.id && this.studioFocusedSourcePath === sourcePath;
    return `
      <button type="button" class="source-package-path-row${focused ? " is-linked-focus" : ""}" data-source-package-id="${escapeHtml(sourcePackage.id)}" data-source-path="${escapeHtml(sourcePath)}">
        <span class="mono">${escapeHtml(sourcePath)}</span>
        <small>${sourcePackage.status === "linked" ? "linked" : "required"}</small>
      </button>
    `;
  }

  private renderStudioSourceDocumentEditor(): string {
    const draft = this.studioSourceDocument;
    if (!draft) {
      return "";
    }
    const context = this.getStudioSourceWriteContext(draft);
    const plan = context?.plan ?? {
      status: "blocked" as const,
      reason: "missing-source" as const,
      sourcePackageId: draft.sourcePackageId,
      path: draft.path,
      detail: "The source package is no longer active in this Studio session.",
    } satisfies SourceWritePlan;
    const preflight = this.createStudioSourceSemanticPreflight(draft, context);
    const receipt = this.studioSourceWriteReceipt?.sourcePackageId === draft.sourcePackageId && this.studioSourceWriteReceipt.path === draft.path
      ? this.studioSourceWriteReceipt
      : undefined;
    const editable = plan.status === "ready" && preflight.status !== "stale";
    const editorStatus = draft.dirty
      ? plan.status !== "ready" ? plan.detail : describeStudioSemanticDraft(preflight)
      : plan.status !== "ready" ? plan.detail : describeStudioSemanticDraft(preflight);
    const badgeStatus: StudioStatus = plan.status !== "ready"
      ? "blocked"
      : preflight.status === "ready"
        ? draft.dirty ? "warn" : "ok"
        : preflight.status === "stale" ? "blocked" : "warn";
    return `
      <section class="studio-source-editor" aria-label="Source document editor">
        <div class="studio-source-editor-head">
          <span>
            <strong>Source document</strong>
            <small>${escapeHtml(context?.sourcePackage.name ?? draft.sourcePackageId)} / ${escapeHtml(draft.path)}</small>
          </span>
          ${this.statusBadge(badgeStatus)}
        </div>
        <textarea data-source-editor="true" aria-label="Source document text" spellcheck="false"${editable ? "" : " readonly"}>${escapeHtml(draft.text)}</textarea>
        <div class="studio-source-editor-status" data-source-editor-status>${escapeHtml(editorStatus)}</div>
        <small class="list-meta">Semantic ${escapeHtml(preflight.status)} / digest ${escapeHtml(preflight.draftDigest)} / diagnostics ${preflight.diagnostics.length}</small>
        ${receipt ? `<small class="list-meta" data-source-write-receipt="${escapeHtml(receipt.status)}">Write receipt: ${escapeHtml(receipt.status)} / ${escapeHtml(receipt.reason)} / ${escapeHtml(receipt.digest)}</small>` : ""}
        <div class="row-actions studio-source-editor-actions">
          <button type="button" data-action="save-source-document"${!draft.dirty || !editable || !canWriteStudioSemanticDraft(preflight) ? " disabled" : ""}>Save &amp; Reimport</button>
          <button type="button" data-action="discard-source-document"${!draft.dirty ? " disabled" : ""}>Discard</button>
        </div>
      </section>
    `;
  }

  private renderProjectBundlePanel(): string {
    const bundle = this.lastProjectBundle;
    const bundledAssets = bundle?.manifest.assets.records.filter((asset) => asset.status === "bundled") ?? [];
    const assetStatus = bundle?.manifest.assets.binaryBundlingStatus;
    const assetBadgeStatus: StudioStatus = assetStatus === "bundled" ? "ok" : assetStatus === "partial" ? "partial" : "warn";
    return `
      <div class="section">
        <h2>Project Package</h2>
        ${
          bundle
            ? `
              <dl class="kv studio-kv">
                <dt>Schema</dt><dd class="mono">${escapeHtml(bundle.manifest.schemaVersion)}</dd>
                <dt>Filename</dt><dd class="mono">${escapeHtml(bundle.filename)}</dd>
                <dt>Files</dt><dd class="mono">${bundle.manifest.files.length}</dd>
                <dt>Assets</dt><dd class="mono">${bundle.manifest.assets.sourceRuntimeMapped}/${bundle.manifest.assets.total} mapped</dd>
                <dt>Binary assets</dt><dd>${this.statusBadge(assetBadgeStatus)} ${bundle.manifest.assets.binaryBundled} bundled / ${bundle.manifest.assets.binarySkipped} skipped / ${bundle.manifest.assets.binaryFailed} failed</dd>
                <dt>Binary size</dt><dd class="mono">${escapeHtml(formatBytes(bundle.manifest.assets.binaryBytes))}</dd>
              </dl>
              ${this.renderProjectPackageFiles(bundle.manifest.files)}
              <div class="list compact-list">
                ${bundledAssets.length > 0 ? bundledAssets
                  .slice(0, 8)
                  .map(
                    (asset) => `
                      <div class="list-item">
                        <span>
                          <span class="list-title">${escapeHtml(asset.packagePath)}</span>
                          <span class="list-meta">${escapeHtml(asset.assetId)} / ${escapeHtml(asset.sourceKind)} / ${escapeHtml(formatBytes(asset.bytes ?? 0))} / ${escapeHtml(asset.sha256?.slice(0, 12) ?? "no-checksum")}</span>
                        </span>
                      </div>
                    `,
                  )
                  .join("") : `<div class="empty-state">No binary assets were embedded; this package only contains contracts and reports.</div>`}
              </div>
            `
            : `<div class="empty-state">Export a project package to snapshot project.json, runtime-manifest, Studio maps, QA evidence, and reports.</div>`
        }
      </div>
    `;
  }

  private renderProjectPackageFiles(files: ProjectExportBundleManifest["files"]): string {
    return `
      <div class="studio-package-file-list" aria-label="Project package files">
        ${files
          .slice(0, 16)
          .map((file) => this.renderProjectPackageFile(file))
          .join("")}
        ${files.length > 16 ? `<span class="list-meta">+${files.length - 16} more package file(s)</span>` : ""}
      </div>
    `;
  }

  private renderProjectPackageFile(file: ProjectExportBundleManifest["files"][number]): string {
    const focused = this.studioFocusedPackageFilePath === file.path;
    const status: StudioStatus = file.required ? "ok" : "partial";
    return `
      <button type="button" class="list-item package-file-row is-${this.statusClassName(status)}${focused ? " is-linked-focus" : ""}" data-package-file-path="${escapeHtml(file.path)}">
        <span>
          <span class="list-title">${escapeHtml(file.path)}</span>
          <span class="list-meta">${escapeHtml(file.kind)} / ${file.required ? "required" : "optional"}</span>
        </span>
        ${this.statusBadge(status)}
      </button>
    `;
  }

  private renderBuildReadinessPanel(summary: StudioProjectSummary): string {
    const readiness = this.getBuildReadinessRecords(summary);
    const stateCounts = countBy(readiness, (record) => record.state);
    return `
      <div class="section">
        <h2>Build Readiness</h2>
        <div class="badge-row">
          <span class="badge ok">runnable ${stateCounts.get("runnable") ?? 0}</span>
          <span class="badge warn">partial ${stateCounts.get("partial") ?? 0}</span>
          <span class="badge error">blocked ${stateCounts.get("blocked") ?? 0}</span>
          <span class="badge ok">exportable ${stateCounts.get("exportable") ?? 0}</span>
        </div>
        <div class="build-readiness-header" aria-hidden="true">
          <span>Record</span>
          <span>Gate</span>
        </div>
        <div class="list compact-list">
          ${readiness.map((record) => this.renderBuildReadinessRecord(record)).join("")}
        </div>
      </div>
    `;
  }

  private renderBuildReadinessRecord(record: BuildReadinessRecord): string {
    const relinkActions =
      record.nextAction.kind === "relink-source"
        ? `
            <span class="row-actions" data-source-package-id="${escapeHtml(record.nextAction.targetId ?? "")}">
            <button type="button" data-action="relink-source">Relink ZIP</button>
            <button type="button" data-action="relink-source-folder">Folder</button>
            </span>
          `
        : "";
    const statusClass = this.statusClassName(record.status);
    return `
      <div class="list-item build-readiness-record is-${statusClass}">
        <span class="build-readiness-main">
          <span class="record-kicker">${escapeHtml(record.state)} / ${escapeHtml(record.severity)} / ${escapeHtml(record.affectedSystem ?? "project")}</span>
          <span class="list-title">${escapeHtml(record.label)}</span>
          <span class="list-meta">${escapeHtml(record.detail)}</span>
          <span class="record-route"><b>Impact</b><span>${escapeHtml(record.impact)}</span></span>
          <span class="record-route"><b>Next</b><span>${escapeHtml(record.nextAction.label)}</span></span>
          <span class="badge-row record-evidence">
            <span class="badge">${escapeHtml(record.id)}</span>
            ${record.evidenceIds.slice(0, 3).map((id) => `<span class="badge">${escapeHtml(id)}</span>`).join("")}
          </span>
        </span>
        <span class="record-side">
          ${this.statusBadge(record.status)}
          <span class="badge ${record.canExport ? "ok" : "warn"}">${record.canExport ? "exportable" : "blocked"}</span>
          ${relinkActions}
        </span>
      </div>
    `;
  }

  private renderStudioCompatibilitySnapshotPanel(): string {
    const state = STUDIO_COMPATIBILITY_SNAPSHOT;
    const snapshot = state.snapshot;
    const status: StudioStatus = this.getCompatibilitySnapshotStudioStatus();
    if (!snapshot) {
      return `
        <div class="section studio-compatibility-snapshot">
          <div class="section-heading-row">
            <h2>Promoted Compatibility Snapshot</h2>
            ${this.statusBadge(status)}
          </div>
          <div class="empty-state">${escapeHtml(state.diagnostics.join("; ") || "Tracked snapshot is unavailable.")}</div>
        </div>
      `;
    }
    const entryStatus = (entryStatus: (typeof snapshot.entries)[number]["status"]): StudioStatus =>
      entryStatus === "passed" ? "ok" : entryStatus === "partial" ? "partial" : entryStatus === "failed" ? "fail" : "pending";
    return `
      <div class="section studio-compatibility-snapshot">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Promoted checkpoint</span>
            <h2>Compatibility Corpus Snapshot</h2>
          </div>
          ${this.statusBadge(status)}
        </div>
        <dl class="kv studio-kv">
          <dt>Schema</dt><dd class="mono">${escapeHtml(snapshot.schemaVersion)}</dd>
          <dt>Coverage</dt><dd class="mono">${snapshot.summary.passedCount}/${snapshot.summary.entryCount} entries / ${snapshot.summary.requiredCount} required</dd>
          <dt>Artifacts</dt><dd class="mono">${snapshot.summary.artifactCount} passed references</dd>
          <dt>Semantic digest</dt><dd class="mono">${escapeHtml(snapshot.semanticDigest)}</dd>
          <dt>Transport checksum</dt><dd class="mono">${escapeHtml(snapshot.checksum)}</dd>
          <dt>Source revision</dt><dd class="mono">${escapeHtml(snapshot.source.sourceRevision)}</dd>
          <dt>Observed</dt><dd>${escapeHtml(formatDateTime(snapshot.observedAt))}</dd>
          <dt>Artifact</dt><dd class="mono">${escapeHtml(STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH)}</dd>
        </dl>
        <div class="list compact-list">
          ${snapshot.entries
            .map(
              (entry) => `
                <div class="list-item">
                  <span>
                    <span class="list-title">${escapeHtml(entry.id)}</span>
                    <span class="list-meta">${escapeHtml(entry.availability)} / ${escapeHtml(entry.journey?.schemaVersion ?? "no journey")} / ${entry.artifactRefs.length} artifacts</span>
                  </span>
                  ${this.statusBadge(entryStatus(entry.status))}
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="badge-row">
          ${snapshot.claims.allowed.slice(0, 3).map((claim) => `<span class="badge ok">allowed: ${escapeHtml(claim)}</span>`).join("")}
          ${snapshot.claims.blocked.slice(0, 3).map((claim) => `<span class="badge warn">blocked: ${escapeHtml(claim)}</span>`).join("")}
        </div>
        <div class="row-actions">
          ${studioActionButton("Compatibility evidence", 'data-evidence-filter="compatibility"')}
        </div>
      </div>
    `;
  }

  private renderStudioPackageAnalysisPanel(): string {
    const report = this.importedPackageAnalysis;
    if (!report) {
      return "";
    }
    const reportV1 = this.importedPackageAnalysisV1;
    const ikemen = report.profiles.ikemen;
    const findingCoverage = Object.entries(report.summary.byCategory)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => `${category}:${count}`)
      .join(" / ");
    const status: StudioStatus = report.status === "recognized" ? "ok" : report.status === "partial" ? "warn" : "pending";
    return `
      <div class="section studio-package-analysis" data-package-analysis="${escapeHtml(reportV1?.checksum ?? report.checksum)}">
        <div class="section-heading-row">
          <div>
            <span class="panel-kicker">Scanner-only contract</span>
            <h2>Package Analysis</h2>
          </div>
          ${this.statusBadge(status)}
        </div>
        <dl class="kv studio-kv">
          <dt>Schema</dt><dd class="mono">${escapeHtml(reportV1?.schemaVersion ?? report.schemaVersion)}</dd>
          <dt>Source</dt><dd class="mono">${escapeHtml(report.sourceName)}</dd>
          <dt>Source SHA-256</dt><dd class="mono">${escapeHtml(reportV1?.source.package.digest ?? "missing")}</dd>
          <dt>Files</dt><dd class="mono">${report.summary.recognizedFileCount}/${report.summary.fileCount} recognized</dd>
          <dt>Entrypoints</dt><dd class="mono">${report.summary.entrypointCount}</dd>
          <dt>Finding coverage</dt><dd class="mono">${escapeHtml(findingCoverage || "none")}</dd>
          <dt>Findings</dt><dd class="mono">${report.summary.findingCount}</dd>
          <dt>Semantic digest</dt><dd class="mono">${escapeHtml(reportV1?.semanticDigest ?? "missing")}</dd>
          <dt>Envelope checksum</dt><dd class="mono">${escapeHtml(reportV1?.checksum ?? report.checksum)}</dd>
          <dt>Analyzer</dt><dd class="mono">${escapeHtml(reportV1 ? `${reportV1.analyzer.id}@${reportV1.analyzer.version}` : "missing")}</dd>
          <dt>Ruleset</dt><dd class="mono">${escapeHtml(reportV1 ? `${reportV1.ruleset.id}@${reportV1.ruleset.version}` : "missing")}</dd>
          <dt>Upstream</dt><dd class="mono">${escapeHtml(reportV1 ? `${reportV1.upstream.project}@${reportV1.upstream.revision.slice(0, 12)}` : "missing")}</dd>
          <dt>IKEMEN</dt><dd>${ikemen.detected ? `${ikemen.findingCount} findings / scanner-only` : "not detected"}</dd>
        </dl>
        <div class="list compact-list">
          ${report.findings.slice(0, 8).map((finding) => `
            <div class="list-item">
              <span>
                <span class="list-title">${escapeHtml(finding.feature)}</span>
                <span class="list-meta">${escapeHtml(finding.status)} / ${escapeHtml(finding.category)} / ${escapeHtml(finding.location.path)}${finding.location.line ? `:${finding.location.line}` : ""}</span>
                <span class="list-meta">${escapeHtml(finding.detail)}</span>
              </span>
              ${this.statusBadge(finding.status === "recognized" ? "ok" : finding.status === "unsupported" ? "blocked" : "pending")}
            </div>
          `).join("")}
        </div>
        <div class="row-actions">
          ${studioActionButton("Analysis evidence", 'data-evidence-filter="analysis"')}
        </div>
      </div>
    `;
  }

  private renderStudioEvidenceNavigator(): string {
    const evidence = this.getStudioEvidenceSummary();
    const records = this.getFilteredEvidenceRecords(evidence);
    const currentTrace = this.getActiveTraceArtifact();
    const comparison = evidence.persistedTraceComparisons[0];
    return `
      <div class="section section-emphasis studio-command-center evidence-command-center">
        <div class="command-center-header">
          <div>
            <span class="panel-kicker">QA desk</span>
            <h2>Evidence Browser</h2>
          </div>
          <span class="badge ${evidence.stats.attention ? "warn" : "ok"}">${evidence.stats.attention} attention</span>
        </div>
        <div class="command-meter-grid" aria-label="Evidence readiness metrics">
          <span><b>${evidence.stats.total}</b><small>records</small></span>
          <span class="${evidence.stats.ok ? "is-ok" : ""}"><b>${evidence.stats.ok}</b><small>ok</small></span>
          <span class="${evidence.stats.pending ? "is-warn" : "is-ok"}"><b>${evidence.stats.pending}</b><small>pending</small></span>
          <span class="${evidence.stats.fail ? "is-error" : "is-ok"}"><b>${evidence.stats.fail}</b><small>failed</small></span>
        </div>
        <div class="evidence-lane-strip" aria-label="Evidence lifecycle lanes">
          <span class="${currentTrace ? "is-ok" : "is-warn"}">
            <small>Latest trace</small>
            <b>${currentTrace ? escapeHtml(currentTrace.trace.checksum) : "none"}</b>
            <em>${currentTrace ? escapeHtml(currentTrace.status) : "export required"}</em>
          </span>
          <span class="${evidence.stats.persistedTraceArtifacts ? "is-ok" : "is-warn"}">
            <small>Persisted</small>
            <b>${evidence.stats.persistedTraceArtifacts}</b>
            <em>local history</em>
          </span>
          <span class="${comparison ? (comparison.match === "same" ? "is-ok" : "is-warn") : "is-warn"}">
            <small>Comparison</small>
            <b>${comparison ? escapeHtml(comparison.match) : "none"}</b>
            <em>${comparison ? `${comparison.summaryRows.length} metrics` : "save a trace"}</em>
          </span>
        </div>
        <div class="command-center-main">
          <div class="operator-callout">
            <span class="panel-kicker">Next action</span>
            <strong>${escapeHtml(evidence.topAction?.label ?? "Export trace artifact")}</strong>
            <small>${escapeHtml(evidence.topImpact ?? "Capture a deterministic runtime trace before treating compatibility claims as evidence.")}</small>
          </div>
          <div class="command-action-column" aria-label="Evidence actions">
            ${studioActionButton("Export Trace", 'data-action="export-trace-artifact"', { primary: true })}
            ${studioActionButton("Compile Runtime", 'data-action="compile-project"')}
            ${studioActionButton("Compatibility Report", 'data-action="export-report"')}
          </div>
        </div>
      </div>
      ${this.renderStudioCompatibilitySnapshotPanel()}
      ${this.renderStudioPackageAnalysisPanel()}
      <div class="section">
        <div class="section-heading-row">
          <h2>Evidence Filters</h2>
          <span class="badge">${records.length} visible</span>
        </div>
        <div class="tabs studio-tabs" role="tablist" aria-label="Evidence filters">
          ${evidence.filters.map((filter) => this.renderEvidenceFilterButton(filter, evidence)).join("")}
        </div>
        <div class="badge-row">
          <span class="badge ${evidence.stats.traceArtifacts ? "ok" : "warn"}">${evidence.stats.traceArtifacts} trace artifacts</span>
          <span class="badge ${evidence.persistedTraceComparisons.length ? "ok" : "warn"}">${evidence.persistedTraceComparisons.length} comparisons</span>
          ${evidence.topAction ? `<span class="badge warn">next ${escapeHtml(evidence.topAction.label)}</span>` : ""}
        </div>
      </div>
      <div class="section evidence-actions-section">
        <h2>Evidence Actions</h2>
        <div class="action-stack">
          ${studioActionButton("Export trace artifact", 'data-action="export-trace-artifact"', { primary: true })}
          ${studioActionButton("Compatibility report", 'data-action="export-report"')}
          ${studioActionButton("Compile runtime", 'data-action="compile-project"')}
          ${studioActionButton("Build outputs", 'data-studio-tab="build"')}
        </div>
      </div>
      <div class="section">
        <h2>Visible Records</h2>
        ${
          records.length
            ? `<div class="list compact-list">${records.slice(0, 12).map((record) => this.renderEvidenceRecord(record)).join("")}</div>`
            : `<div class="empty-state">No evidence records match this filter.</div>`
        }
      </div>
    `;
  }

  private renderStudioEvidenceRightPane(): string {
    const evidence = this.getStudioEvidenceSummary();
    const records = this.getFilteredEvidenceRecords(evidence);
    const trustRows = this.getStudioTrustContractRows();
    const categories = new Map<StudioEvidenceCategory, number>();
    for (const record of evidence.records) {
      categories.set(record.category, (categories.get(record.category) ?? 0) + 1);
    }
    return `
      ${this.renderStudioTrustContract(trustRows, "evidence")}
      <div class="section">
        <h2>Evidence Summary</h2>
        <dl class="kv studio-kv">
          <dt>Filter</dt><dd class="mono">${escapeHtml(evidence.activeFilter)}</dd>
          <dt>Total</dt><dd class="mono">${evidence.stats.total}</dd>
          <dt>Visible</dt><dd class="mono">${records.length}</dd>
          <dt>Attention</dt><dd class="mono">${evidence.stats.attention}</dd>
          <dt>Trace</dt><dd class="mono">${this.getActiveTraceArtifact() ? this.getActiveTraceArtifact()?.trace.checksum : "not exported"}</dd>
          <dt>Persisted</dt><dd class="mono">${evidence.stats.persistedTraceArtifacts}</dd>
          <dt>Comparisons</dt><dd class="mono">${evidence.persistedTraceComparisons.length}</dd>
          <dt>Top action</dt><dd>${evidence.topAction ? escapeHtml(evidence.topAction.label) : "none"}</dd>
          <dt>Top impact</dt><dd>${evidence.topImpact ? escapeHtml(evidence.topImpact) : "none"}</dd>
        </dl>
        <div class="badge-row">
          ${[...categories.entries()].map(([category, count]) => `<span class="badge">${escapeHtml(category)} ${count}</span>`).join("")}
        </div>
      </div>
      ${this.renderStudioCompatibilitySnapshotPanel()}
      ${this.renderStudioPackageAnalysisPanel()}
      ${this.renderTraceEvidencePanel()}
      ${this.renderTraceComparisonReviewPanel(evidence)}
      ${this.renderTraceFrameScrubberPanel()}
      <div class="section">
        <h2>Attention Queue</h2>
        <div class="list compact-list">
          ${
            evidence.records
              .filter((record) => isAttentionStatus(record.status))
              .slice(0, 10)
              .map((record) => this.renderEvidenceRecord(record))
              .join("") || `<div class="empty-state">No warning, pending, partial, or failed records in the current project.</div>`
          }
        </div>
      </div>
    `;
  }

  private renderStudioTrustContract(rows: StudioTrustContractRow[], surface: "build" | "evidence"): string {
    const attentionRows = rows.filter((row) => isAttentionStatus(row.status) || row.state === "partial" || row.state === "blocked");
    const blockedRows = rows.filter((row) => row.state === "blocked");
    const exportableRows = rows.filter((row) => row.state === "exportable" || row.state === "runnable");
    const headline = surface === "build" ? "Build Trust Chain" : "Evidence Trust Chain";
    const summary = blockedRows.length ? `${blockedRows.length} blocked` : attentionRows.length ? `${attentionRows.length} attention` : "ready";
    const summaryStatus: StudioStatus = blockedRows.length ? "blocked" : attentionRows.length ? "warn" : "ok";
    const primary = blockedRows[0] ?? attentionRows[0] ?? rows[0];
    return `
      <div class="section studio-trust-contract" aria-label="${escapeHtml(headline)}">
        <div class="section-heading-row studio-trust-contract-head">
          <div>
            <span class="panel-kicker">Shared contract</span>
            <h2>${escapeHtml(headline)}</h2>
          </div>
          <span class="badge ${this.statusClassName(summaryStatus)}">${escapeHtml(summary)}</span>
        </div>
        <div class="studio-trust-contract-summary">
          <span>
            <b>${exportableRows.length}/${rows.length}</b>
            <small>exportable or runnable</small>
          </span>
          <span>
            <b>${attentionRows.length}</b>
            <small>attention states</small>
          </span>
          <span>
            <b>${primary ? escapeHtml(primary.nextLabel) : "No action"}</b>
            <small>primary next action</small>
          </span>
        </div>
        <div class="studio-trust-contract-table" aria-label="${escapeHtml(headline)} rows">
          <div class="studio-trust-contract-columns" aria-hidden="true">
            <span>Lane</span>
            <span>Proof</span>
            <span>Evidence</span>
            <span>Next</span>
          </div>
          ${rows.map((row) => this.renderStudioTrustContractRow(row)).join("")}
        </div>
      </div>
    `;
  }

  private renderStudioTrustContractRow(row: StudioTrustContractRow): string {
    const statusClass = this.statusClassName(row.status);
    const focusClass = this.studioFocusedTrustRowId === row.id ? " is-linked-focus" : "";
    const actionAttribute = this.studioTrustActionAttribute(row);
    const blockerLabel = row.blockedBy.length ? `blocked by ${row.blockedBy.slice(0, 2).join(" / ")}` : "no blockers";
    const ariaLabel = `${row.label}: ${row.detail}. Next: ${row.nextLabel}`;
    return `
      <button type="button" class="studio-trust-contract-row is-${statusClass}${focusClass}" data-trust-row-id="${escapeHtml(row.id)}" ${actionAttribute} aria-label="${escapeHtml(ariaLabel)}">
        <span class="studio-trust-contract-lane">
          ${tablerIcon(this.iconForStudioTrustLane(row.lane), "ui-icon studio-trust-contract-icon")}
          <b>${escapeHtml(this.labelForStudioTrustLane(row.lane))}</b>
          <small>${escapeHtml(row.state)}</small>
        </span>
        <span class="studio-trust-contract-proof">
          <span class="studio-trust-contract-title">${escapeHtml(row.label)}</span>
          <span class="studio-trust-contract-detail">${escapeHtml(row.detail)}</span>
          <span class="studio-trust-contract-impact"><b>Impact</b>${escapeHtml(row.impact)}</span>
        </span>
        <span class="studio-trust-contract-evidence">
          ${this.statusBadge(row.status)}
          <small>${escapeHtml(row.evidence)}</small>
          <em>${escapeHtml(row.delta || blockerLabel)}</em>
        </span>
        <span class="studio-trust-contract-next">
          <b>${escapeHtml(row.nextLabel)}</b>
          <small>${escapeHtml(`${row.freshness} / ${row.targetKind}:${row.targetId}`)}</small>
        </span>
      </button>
    `;
  }

  private studioTrustActionAttribute(row: StudioTrustContractRow): string {
    if (row.id === "runtime-manifest" && !this.lastCompiledProject) {
      return 'data-action="compile-project"';
    }
    if (row.id === "runtime-manifest") {
      return 'data-evidence-filter="compile"';
    }
    if (row.id === "package-bundle") {
      if (row.targetKind === "package-file" && row.targetPath) {
        return `data-studio-tab="build" data-package-file-path="${escapeHtml(row.targetPath)}"`;
      }
      if (!this.lastCompiledProject) {
        return 'data-action="compile-project"';
      }
      if (!this.lastProjectBundle) {
        return 'data-action="export-package"';
      }
      return 'data-studio-tab="build"';
    }
    if (row.id === "evidence" && !this.lastTraceArtifact) {
      return 'data-action="export-trace-artifact"';
    }
    if (row.id === "evidence") {
      return 'data-evidence-filter="trace" data-trace-frame-index="0"';
    }
    if (row.id === "asset-validation") {
      const assetAttribute = row.targetId && row.targetId !== row.id ? ` data-studio-asset-id="${escapeHtml(row.targetId)}"` : "";
      return `data-studio-tab="assets" data-asset-filter="${row.status === "ok" ? "all" : "attention"}"${assetAttribute}`;
    }
    if (row.id === "source-packages" && row.targetKind === "source-file" && row.targetPath) {
      const sourcePackageAttribute = row.targetPackageId ? ` data-source-package-id="${escapeHtml(row.targetPackageId)}"` : "";
      return `data-studio-tab="build"${sourcePackageAttribute} data-source-path="${escapeHtml(row.targetPath)}"`;
    }
    if (row.id === "source-packages" && row.blockedBy.length) {
      return `data-action="relink-source" data-source-package-id="${escapeHtml(row.targetId)}"`;
    }
    if (row.id === "source-packages") {
      return 'data-studio-tab="build"';
    }
    if (row.id === "compatibility-gates") {
      return 'data-evidence-filter="gate"';
    }
    if (row.id === "compatibility-snapshot") {
      return 'data-evidence-filter="compatibility"';
    }
    if (row.id === "architecture-boundaries") {
      return 'data-evidence-filter="compile"';
    }
    return this.studioNextActionAttribute(row.nextAction);
  }

  private renderTraceFrameScrubberPanel(): string {
    const artifact = this.getActiveTraceArtifact();
    if (!artifact) {
      return `
        <div class="section">
          <h2>Trace Frame Scrubber</h2>
          <div class="empty-state">Export a trace artifact to inspect frame checksums and frame-local events.</div>
        </div>
      `;
    }
    const frames = this.getTraceArtifactFrameSummaries(artifact);
    if (!frames.length) {
      return `
        <div class="section">
          <h2>Trace Frame Scrubber</h2>
          <div class="empty-state">This trace artifact has no frame timeline data.</div>
        </div>
      `;
    }
    const selectedIndex = Math.min(Math.max(0, this.selectedTraceFrameIndex), frames.length - 1);
    const selected = frames[selectedIndex]!;
    const previous = selectedIndex > 0 ? frames[selectedIndex - 1] : undefined;
    const events = artifact.trace.events.filter((event) => event.frameIndex === selected.frameIndex);
    const reasons = artifact.trace.combatReasons.filter((reason) => reason.frameIndex === selected.frameIndex);
    return `
      <div class="section">
        <h2>Trace Frame Scrubber</h2>
        <div class="trace-frame-strip" role="list" aria-label="Trace frames">
          ${frames
            .slice(0, 48)
            .map(
              (frame, index) => `
                <button type="button" class="trace-frame-button ${index === selectedIndex ? "is-selected" : ""}" data-trace-frame-index="${index}">
                  <strong>${frame.frameIndex + 1}</strong>
                  <span>${escapeHtml(frame.checksum)}</span>
                </button>
              `,
            )
            .join("")}
        </div>
        <dl class="kv studio-kv">
          <dt>Frame</dt><dd class="mono">${selected.frameIndex + 1} / ${frames.length}</dd>
          <dt>Tick</dt><dd class="mono">${selected.tick}</dd>
          <dt>Checksum</dt><dd class="mono">${escapeHtml(selected.checksum)}</dd>
          <dt>Input</dt><dd class="mono">P1 ${escapeHtml(selected.input.p1.join("+") || "-")} / P2 ${escapeHtml(selected.input.p2?.join("+") || "-")}${selected.input.force ? " / force" : ""}</dd>
          <dt>Actors</dt><dd class="mono">${selected.actorCount} actors / ${selected.effectCount} effects</dd>
          <dt>Frame labels</dt><dd>${escapeHtml([selected.label, ...selected.eventCategories, ...selected.combatReasons].filter(Boolean).join(" / ") || "none")}</dd>
        </dl>
        ${this.renderTraceFrameDelta(selected)}
        ${this.renderTraceFrameWorldDelta(selected, previous)}
        <div class="list compact-list">
          ${
            events.length || reasons.length
              ? [...events.map((event) => ({ label: event.category, detail: event.line })), ...reasons.map((reason) => ({ label: reason.reason, detail: reason.detail }))].map(
                  (item) => `
                    <div class="list-item">
                      <span>
                        <span class="list-title">${escapeHtml(item.label)}</span>
                        <span class="list-meta">${escapeHtml(item.detail)}</span>
                      </span>
                    </div>
                  `,
                ).join("")
              : `<div class="empty-state">No events or combat reasons on this frame.</div>`
          }
        </div>
      </div>
    `;
  }

  private renderTraceFrameDelta(selected: RuntimeTraceArtifactFrameSummary): string {
    const delta = selected.delta;
    if (!delta) {
      return `
        <div class="trace-frame-delta" data-trace-frame-delta="none">
          <div class="section-heading-row compact-heading">
            <span class="panel-kicker">Frame Diff</span>
            <span class="badge warn">legacy artifact</span>
          </div>
          <div class="empty-state compact">This trace artifact does not include frame-level diff evidence.</div>
        </div>
      `;
    }
    const changedRows = delta.actorChanges.slice(0, 8);
    return `
      <div class="trace-frame-delta" data-trace-frame-delta="${selected.frameIndex}">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">Frame Diff</span>
          <span class="badge ${delta.previousFrameIndex === undefined ? "warn" : "ok"}">
            ${delta.previousFrameIndex === undefined ? "base frame" : `vs F${delta.previousFrameIndex + 1}`}
          </span>
        </div>
        <div class="studio-stat-grid trace-world-stat-grid">
          ${this.traceFrameDeltaStat("Checksum", delta.checksumChanged ? 1 : 0, delta.checksumChanged ? "changed" : "same")}
          ${this.traceFrameDeltaStat("Input", delta.inputChanged ? 1 : 0, delta.inputChanged ? "changed" : "same")}
          ${this.traceFrameDeltaStat("Actors", delta.actorCountDelta, formatSignedDelta(delta.actorCountDelta))}
          ${this.traceFrameDeltaStat("Effects", delta.effectCountDelta, formatSignedDelta(delta.effectCountDelta))}
          ${this.traceFrameDeltaStat("Events", delta.eventCount, "this frame")}
          ${this.traceFrameDeltaStat("Reasons", delta.combatReasonCount, "this frame")}
        </div>
        ${
          delta.world
            ? `<div class="badge-row">
                <span class="badge">live ${formatSignedDelta(delta.world.liveDelta)}</span>
                <span class="badge">stores ${formatSignedDelta(delta.world.effectStoreTotalDelta)}</span>
                <span class="badge">targets ${formatSignedDelta(delta.world.targetLinkDelta)}</span>
                <span class="badge">lifecycle ${delta.world.lifecycleEventCount}</span>
              </div>`
            : ""
        }
        <div class="compat-list">
          ${
            changedRows.length
              ? changedRows
                  .map(
                    (change) => `
                      <div class="compat-row trace-frame-delta-row">
                        <span class="badge">${escapeHtml(change.layer)}</span>
                        <span>
                          <span class="list-title">${escapeHtml(change.label)} <small>${escapeHtml(change.id)}</small></span>
                          <span class="list-meta">${escapeHtml(change.actorKind)} / ${escapeHtml(change.changes.join("; "))}</span>
                        </span>
                      </div>
                    `,
                  )
                  .join("")
              : `<div class="empty-state compact">No actor or effect field changed on this frame.</div>`
          }
        </div>
      </div>
    `;
  }

  private traceFrameDeltaStat(label: string, value: number, detail: string): string {
    return `
      <div class="studio-stat trace-frame-delta-stat">
        <strong>${value}</strong>
        <span>${escapeHtml(label)} ${escapeHtml(detail)}</span>
      </div>
    `;
  }

  private renderTraceFrameWorldDelta(
    selected: RuntimeTraceArtifactFrameSummary,
    previous: RuntimeTraceArtifactFrameSummary | undefined,
  ): string {
    const world = selected.world;
    if (!world) {
      return `
        <div class="trace-world-delta" data-trace-world-delta="none">
          <div class="section-heading-row compact-heading">
            <span class="panel-kicker">World Delta</span>
            <span class="badge warn">no world</span>
          </div>
          <div class="empty-state compact">This trace frame does not include MatchWorld summary data.</div>
        </div>
      `;
    }
    const previousWorld = previous?.world;
    const effectTotal = this.getTraceWorldEffectStoreTotal(world);
    const previousEffectTotal = this.getTraceWorldEffectStoreTotal(previousWorld);
    const targetDelta = previousWorld ? world.targetLinks.length - previousWorld.targetLinks.length : undefined;
    const eventDelta = previousWorld ? world.eventsThisTick.length - previousWorld.eventsThisTick.length : undefined;
    const effectDelta = previousWorld ? effectTotal - previousEffectTotal : undefined;
    const liveDelta = previousWorld ? world.live.length - previousWorld.live.length : undefined;
    return `
      <div class="trace-world-delta" data-trace-world-delta="${selected.frameIndex}">
        <div class="section-heading-row compact-heading">
          <span class="panel-kicker">World Delta</span>
          <span class="badge ${previousWorld ? "ok" : "warn"}">${previousWorld ? `vs F${previous!.frameIndex + 1}` : "base frame"}</span>
        </div>
        <div class="studio-stat-grid trace-world-stat-grid">
          ${this.traceWorldStat("Live", world.live.length, liveDelta)}
          ${this.traceWorldStat("Effects", effectTotal, effectDelta)}
          ${this.traceWorldStat("Targets", world.targetLinks.length, targetDelta)}
          ${this.traceWorldStat("Events", world.eventsThisTick.length, eventDelta)}
        </div>
        <div class="debug-evidence-grid">
          <div class="debug-evidence-block">
            <span class="panel-kicker">Effect stores</span>
            <div class="compat-list">${this.renderTraceWorldEffectStoreRows(world)}</div>
          </div>
          <div class="debug-evidence-block">
            <span class="panel-kicker">Target links</span>
            <div class="compat-list">${this.renderTraceWorldTargetRows(world)}</div>
          </div>
        </div>
        <div class="debug-evidence-block">
          <span class="panel-kicker">Lifecycle events</span>
          <div class="compat-list">${this.renderTraceWorldLifecycleRows(world)}</div>
        </div>
      </div>
    `;
  }

  private traceWorldStat(label: string, value: number, delta: number | undefined): string {
    return `
      <div class="studio-stat trace-world-stat">
        <strong>${value}</strong>
        <span>${escapeHtml(label)} ${delta === undefined ? "base" : formatSignedDelta(delta)}</span>
      </div>
    `;
  }

  private getTraceWorldEffectStoreTotal(world: RuntimeTraceArtifactFrameSummary["world"] | undefined): number {
    return world?.effectStores.reduce((sum, store) => sum + store.total, 0) ?? 0;
  }

  private renderTraceWorldEffectStoreRows(world: NonNullable<RuntimeTraceArtifactFrameSummary["world"]>): string {
    if (!world.effectStores.length) {
      return `<div class="empty-state compact">No effect stores were captured for this frame.</div>`;
    }
    return world.effectStores
      .slice(0, 8)
      .map(
        (store) => `
          <div class="compat-row trace-world-row">
            <span class="badge ${store.total ? "warn" : "ok"}">${escapeHtml(store.ownerId)}</span>
            <span>
              <span class="list-title">total ${store.total}</span>
              <span class="list-meta">explod ${this.formatDebugIdList(store.explods)} / helper ${this.formatDebugIdList(store.helpers)} / projectile ${this.formatDebugIdList(store.projectiles)}</span>
            </span>
            <span class="mono">E${store.nextSerials.explod} H${store.nextSerials.helper} P${store.nextSerials.projectile}</span>
          </div>
        `,
      )
      .join("");
  }

  private renderTraceWorldTargetRows(world: NonNullable<RuntimeTraceArtifactFrameSummary["world"]>): string {
    if (!world.targetLinks.length) {
      return `<div class="empty-state compact">No target links were captured for this frame.</div>`;
    }
    return world.targetLinks
      .slice(0, 8)
      .map(
        (link) => `
          <div class="compat-row trace-world-row">
            <span class="badge">${escapeHtml(link.ownerId)}</span>
            <span>
              <span class="list-title">${escapeHtml(link.ownerId)} -> ${escapeHtml(link.actorId)}</span>
              <span class="list-meta">${escapeHtml(this.formatStudioDebugWorldTargetLink(link))}</span>
            </span>
            <span class="mono">${link.age}f</span>
          </div>
        `,
      )
      .join("");
  }

  private renderTraceWorldLifecycleRows(world: NonNullable<RuntimeTraceArtifactFrameSummary["world"]>): string {
    if (!world.eventsThisTick.length) {
      return `<div class="empty-state compact">No MatchWorld lifecycle events occurred on this frame.</div>`;
    }
    return world.eventsThisTick
      .slice(0, 8)
      .map(
        (event) => `
          <div class="compat-row trace-world-row">
            <span class="badge ${event.type === "spawn" ? "active" : event.type === "remove" ? "warn" : ""}">${escapeHtml(event.type)}</span>
            <span>
              <span class="list-title">${escapeHtml(event.label)} / ${escapeHtml(event.id)}</span>
              <span class="list-meta">${escapeHtml(event.kind)} / owner ${escapeHtml(event.ownerId)} / root ${escapeHtml(event.rootId)} / parent ${escapeHtml(event.parentId)}</span>
            </span>
            <span class="mono">t${event.tick} / ${event.ageTicks}f</span>
          </div>
        `,
      )
      .join("");
  }

  private renderTraceComparisonReviewPanel(evidence: StudioEvidenceSummary): string {
    const [comparison] = evidence.persistedTraceComparisons;
    if (!comparison) {
      return `
        <div class="section">
          <h2>Trace Comparison Review</h2>
          <div class="empty-state">Export a trace artifact to persist it, then compare future runs against it.</div>
        </div>
      `;
    }
    return `
      <div class="section">
        <h2>Trace Comparison Review</h2>
        <dl class="kv studio-kv">
          <dt>Stored</dt><dd class="mono">${escapeHtml(comparison.checksum)}</dd>
          <dt>Current</dt><dd class="mono">${comparison.currentChecksum ? escapeHtml(comparison.currentChecksum) : "not exported"}</dd>
          <dt>Match</dt><dd>${this.statusBadge(comparison.match === "same" ? "ok" : comparison.match === "missing-current" ? "partial" : "warn")} ${escapeHtml(comparison.match)}</dd>
          <dt>Detail</dt><dd>${escapeHtml(comparison.detail)}</dd>
        </dl>
        <div class="list compact-list">
          ${comparison.summaryRows
            .map(
              (row) => `
                <div class="list-item">
                  <span>
                    <span class="list-title">${escapeHtml(row.label)}</span>
                    <span class="list-meta">stored ${row.stored}${row.current === undefined ? " / current n/a" : ` / current ${row.current} / delta ${formatSignedDelta(row.delta)}`}</span>
                    <span class="badge-row">${this.statusBadge(row.status)}</span>
                  </span>
                </div>
              `,
            )
            .join("")}
        </div>
        <h3>Gate Diff</h3>
        <div class="list compact-list">
          ${comparison.gateComparisons
            .slice(0, 10)
            .map(
              (gate) => `
                <div class="list-item">
                  <span>
                    <span class="list-title">${escapeHtml(gate.label)}</span>
                    <span class="list-meta">stored ${escapeHtml(gate.stored)} / current ${escapeHtml(gate.current)}</span>
                    ${
                      gate.storedFailures.length || gate.currentFailures.length
                        ? `<span class="list-meta">stored failures ${escapeHtml(gate.storedFailures.join("; ") || "none")} / current failures ${escapeHtml(gate.currentFailures.join("; ") || "none")}</span>`
                        : ""
                    }
                    <span class="badge-row">${this.statusBadge(gate.status)}</span>
                  </span>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private renderStudioDiagnosticsList(): string {
    const diagnostics = [...(this.character?.diagnostics ?? []), ...this.importedStages.flatMap((stage) => stage.diagnostics)];
    if (diagnostics.length === 0) {
      return `<div class="empty-state">No parser diagnostics in the current package.</div>`;
    }
    return `
      <div class="list compact-list">
        ${diagnostics
          .slice(0, 8)
          .map(
            (diagnostic) => `
              <div class="list-item">
                <span>
                  <span class="list-title">${escapeHtml(diagnostic.message)}</span>
                  <span class="list-meta">${escapeHtml([diagnostic.format ?? "loader", diagnostic.file, diagnostic.line ? `:${diagnostic.line}` : ""].filter(Boolean).join(" / "))}</span>
                  <span class="badge-row">${this.statusBadge(diagnostic.severity === "error" ? "fail" : diagnostic.severity === "warning" ? "warn" : "ok")}</span>
                </span>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  private renderRuntimeManifestDiagnostics(compiled: CompiledRuntimeManifest): string {
    const diagnostics = [...compiled.diagnostics.errors.map((message) => ({ className: "error", message })), ...compiled.diagnostics.warnings.map((message) => ({ className: "warn", message }))];
    if (diagnostics.length === 0) {
      return `<div class="badge-row"><span class="badge ok">compile clean</span></div>`;
    }
    return `
      <div class="list compact-list">
        ${diagnostics
          .slice(0, 5)
          .map(
            (diagnostic) => `
              <div class="list-item">
                <span>
                  <span class="list-title">${escapeHtml(diagnostic.message)}</span>
                  <span class="badge-row"><span class="badge ${diagnostic.className}">${diagnostic.className}</span></span>
                </span>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  private renderSharedContractsStrip(compiled: CompiledRuntimeManifest): string {
    return `
      <div class="contract-strip" aria-label="Shared engine contracts">
        <strong>Shared Contracts</strong>
        <div>${this.renderContractPills(compiled.contracts.sharedContracts, "none")}</div>
      </div>
    `;
  }

  private renderSharedBoundaryPanel(summary: StudioProjectSummary, compiled?: CompiledRuntimeManifest): string {
    const platformer = summary.modules.find((module) => module.id === "platformer-module");
    const sharedForbidden =
      compiled?.contracts.boundaries.sharedCoreForbidden ??
      summary.modules.find((module) => module.id === "three-render")?.forbiddenSharedCoreConcepts ??
      [];
    const platformerForbidden = compiled?.contracts.boundaries.platformerForbidden ?? platformer?.forbiddenSharedCoreConcepts ?? [];
    return `
      <div class="module-boundary-grid" aria-label="Shared engine boundary claims">
        <div class="module-boundary-card">
          <strong>Forbidden in shared core</strong>
          <small>Compatibility-only concepts stay inside mugen-compat.</small>
          ${this.renderContractPills(sharedForbidden, "none")}
        </div>
        <div class="module-boundary-card">
          <strong>Platformer blocked concepts</strong>
          <small>Future platformer module cannot depend on fighting controller semantics.</small>
          ${this.renderContractPills(platformerForbidden, "none")}
        </div>
      </div>
    `;
  }

  private renderContractPills(items: readonly string[], emptyLabel: string): string {
    if (items.length === 0) {
      return `<span class="badge">${escapeHtml(emptyLabel)}</span>`;
    }
    return `<span class="contract-pill-row">${items.map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join("")}</span>`;
  }

  private renderTraceEvidencePanel(): string {
    const artifact = this.lastTraceArtifact;
    const history = this.traceArtifacts;
    const persistedHistory = this.storedTraceEvidence;
    const persistedComparisons = new Map(this.getPersistedTraceComparisons().map((comparison) => [comparison.id, comparison]));
    return `
      <div class="section">
        <h2>QA Evidence</h2>
        <div class="pipeline-list">
          <span class="pipeline-step active">Unit tests<small>Parser/runtime/compiler contracts must stay covered.</small></span>
          <span class="pipeline-step active">Typecheck/build<small>Strict TypeScript and Vite build close each round.</small></span>
          <span class="pipeline-step active">Visual QA<small>Desktop/mobile screenshots and canvas checks prove frontend changes.</small></span>
          <span class="pipeline-step ${artifact ? "active" : ""}">Trace artifact<small>${
            artifact
              ? `${escapeHtml(artifact.target.label)} / ${escapeHtml(artifact.status)} / ${escapeHtml(artifact.trace.checksum)}`
              : "Export a smoke trace artifact from Build Outputs to capture replay evidence."
          }</small></span>
        </div>
        ${
          artifact
            ? `
              <dl class="kv studio-kv">
                <dt>Schema</dt><dd class="mono">${escapeHtml(artifact.schemaVersion)}</dd>
                <dt>Status</dt><dd>${this.statusBadge(artifact.status === "passed" ? "ok" : "fail")}</dd>
                <dt>Trace</dt><dd class="mono">${escapeHtml(artifact.trace.label)}</dd>
                <dt>Checksum</dt><dd class="mono">${escapeHtml(artifact.trace.checksum)}</dd>
                <dt>Frames</dt><dd class="mono">${artifact.trace.frameCount}</dd>
                <dt>Events</dt><dd class="mono">${artifact.trace.eventCount}</dd>
              </dl>
              <div class="list compact-list">
                ${artifact.gates
                  .map(
                    (gate) => `
                      <div class="list-item">
                        <span>
                          <span class="list-title">${escapeHtml(gate.label)}</span>
                          <span class="list-meta">${gate.failures.length ? escapeHtml(gate.failures.join("; ")) : "gate passed"}</span>
                          <span class="badge-row">${this.statusBadge(gate.passed ? "ok" : "fail")}</span>
                        </span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            `
            : `<div class="empty-state">No trace artifact generated in this session yet.</div>`
        }
        ${
          history.length > 1
            ? `
              <h3>Session Trace History</h3>
              <div class="list compact-list">
                ${history
                  .slice(0, 6)
                  .map(
                    (candidate, index) => `
                      <div class="list-item">
                        <span>
                          <span class="list-title">${index === 0 ? "Latest: " : ""}${escapeHtml(candidate.target.label)}</span>
                          <span class="list-meta">${escapeHtml(candidate.generatedAt)} / ${escapeHtml(candidate.trace.checksum)} / ${candidate.trace.frameCount} frames</span>
                          <span class="badge-row">
                            ${this.statusBadge(candidate.status === "passed" ? "ok" : "fail")}
                            <span class="badge">${escapeHtml(candidate.target.source)}</span>
                          </span>
                        </span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            `
            : ""
        }
        ${
          persistedHistory.length
            ? `
              <h3>Persisted Evidence History</h3>
              <div class="list compact-list">
                ${persistedHistory
                  .slice(0, 6)
                  .map((entry) => {
                    const status = this.getStoredTraceEvidenceStatus(entry);
                    const comparison = persistedComparisons.get(entry.id);
                    return `
                      <div class="list-item">
                        <span>
                          <span class="list-title">${escapeHtml(entry.projectName)} / ${escapeHtml(entry.artifact.target.label)}</span>
                          <span class="list-meta">${escapeHtml(entry.savedAt)} / ${escapeHtml(entry.artifact.trace.checksum)} / ${escapeHtml(status.detail)}</span>
                          ${
                            comparison
                              ? `<span class="list-meta">Comparison: ${escapeHtml(comparison.detail)}${
                                  comparison.currentChecksum ? ` Current ${escapeHtml(comparison.currentChecksum)}` : ""
                                }</span>`
                              : ""
                          }
                          <span class="badge-row">
                            ${this.statusBadge(status.status)}
                            <span class="badge">${escapeHtml(status.current ? "current" : "stale")}</span>
                            ${comparison ? `<span class="badge ${comparison.match === "same" ? "ok" : "warn"}">${escapeHtml(comparison.match)}</span>` : ""}
                            ${status.missingSourcePackages ? `<span class="badge warn">missing source ${status.missingSourcePackages}</span>` : ""}
                          </span>
                        </span>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            `
            : `<div class="empty-state">No persisted trace evidence has been saved in local browser storage yet.</div>`
        }
      </div>
    `;
  }

  private getStudioEvidenceSummary(): StudioEvidenceSummary {
    const records = this.getStudioEvidenceRecords();
    const topRecord =
      records.find((record) => record.status === "fail" || record.status === "blocked" || record.status === "unsupported") ??
      records.find((record) => isAttentionStatus(record.status));
    return {
      records,
      compatibilitySnapshot: STUDIO_COMPATIBILITY_SNAPSHOT,
      stats: {
        total: records.length,
        ok: records.filter((record) => record.status === "ok" || record.status === "active").length,
        attention: records.filter((record) => isAttentionStatus(record.status)).length,
        fail: records.filter((record) => record.status === "fail").length,
        pending: records.filter((record) => record.status === "pending").length,
        traceArtifacts: this.traceArtifacts.length,
        persistedTraceArtifacts: this.storedTraceEvidence.length,
      },
      activeFilter: this.studioEvidenceFilter,
      filters: ["all", "attention", "trace", "compile", "gate", "asset", "compatibility", "analysis", "source", "diagnostic"],
      topAction: topRecord?.nextAction,
      topRecordId: topRecord?.id,
      topImpact: topRecord?.impact,
      persistedTraceEvidence: this.storedTraceEvidence.map((entry) => structuredClone(entry)),
      persistedTraceComparisons: this.getPersistedTraceComparisons(),
    };
  }

  private getStudioDebugSelection(
    registry: MatchWorldActorRegistrySnapshot = this.matchRuntime.getActorRegistry(),
    snapshot: MugenSnapshot = this.matchRuntime.getSnapshot(),
  ): StudioDebugSelectionSummary {
    const selectedActorId =
      this.studioSelectedActorId && registry.byId[this.studioSelectedActorId]
        ? this.studioSelectedActorId
        : registry.actors[0]?.id;
    const selectedActor = selectedActorId ? registry.byId[selectedActorId] : undefined;
    const snapshotActors = [...snapshot.actors, ...(snapshot.effects ?? [])];
    const snapshotActor = selectedActorId ? snapshotActors.find((actor) => actor.id === selectedActorId) : undefined;
    const ownedActorIds = new Set(selectedActor ? (registry.byOwner[selectedActor.id] ?? []) : []);
    const ownedActors = selectedActor
      ? registry.actors.filter((actor) => actor.id !== selectedActor.id && ownedActorIds.has(actor.id))
      : [];
    const relatedTargetLinks = selectedActor
      ? registry.targetLinks.filter((link) => link.ownerId === selectedActor.id || link.actorId === selectedActor.id)
      : [];
    const effectStore = selectedActor
      ? registry.effectStores.find((store) => store.ownerId === selectedActor.id) ??
        registry.effectStores.find((store) => store.ownerId === selectedActor.ownerId)
      : undefined;
    const recentEvents = selectedActor
      ? registry.lifecycle.recentEvents.filter(
          (event) =>
            event.id === selectedActor.id ||
            event.ownerId === selectedActor.id ||
            event.parentId === selectedActor.id ||
            event.rootId === selectedActor.id,
        )
      : [];
    const runtimeSession = selectedActorId ? snapshot.compatibilitySession?.actors.find((actor) => actor.actorId === selectedActorId) : undefined;
    const traceEvidence = this.getStudioDebugTraceEvidence(selectedActor);
    return {
      selectedActorId,
      selectedActor,
      snapshotActor,
      runtimeSession,
      traceEvidence,
      ownedActors,
      relatedTargetLinks,
      effectStore,
      recentEvents,
    };
  }

  private getStudioDebugTraceEvidence(actor: MatchWorldActorRegistrySnapshot["actors"][number] | undefined): StudioDebugTraceEvidence {
    const artifact = this.getActiveTraceArtifact();
    if (!actor || !artifact) {
      return {
        traceFrameCount: 0,
        controllerKeys: [],
        operationKeys: [],
        frames: [],
        gates: [],
      };
    }
    const finalActor = [...artifact.trace.finalActors, ...artifact.trace.finalEffects].find((candidate) => candidate.id === actor.id);
    const frames = this.getTraceArtifactFrameSummaries(artifact)
      .map((frame) => this.getStudioDebugTraceFrameLink(frame, artifact, actor))
      .filter((frame): frame is StudioDebugTraceFrameLink => Boolean(frame))
      .sort((left, right) => right.score - left.score || left.frameIndex - right.frameIndex)
      .slice(0, 8)
      .sort((left, right) => left.frameIndex - right.frameIndex);
    const relevantGates = artifact.gates.filter((gate) => this.isTraceGateRelevantToActor(gate, actor));
    const controllerKeys = [...new Set(relevantGates.flatMap((gate) => Object.keys(gate.evidence.executedControllers)))].sort();
    const operationKeys = [...new Set(relevantGates.flatMap((gate) => Object.keys(gate.evidence.executedOperations)))].sort();
    const gates = relevantGates
      .slice(0, 6)
      .map((gate) => ({
        label: gate.label,
        passed: gate.passed,
        failures: [...gate.failures],
        summary: this.summarizeTraceGateForActor(gate, actor),
      }));
    return {
      traceLabel: artifact.trace.label,
      traceChecksum: artifact.trace.checksum,
      traceStatus: artifact.status,
      traceFrameCount: artifact.trace.frameCount,
      finalActor,
      controllerKeys,
      operationKeys,
      frames,
      gates,
    };
  }

  private getStudioDebugTraceFrameLink(
    frame: RuntimeTraceArtifactFrameSummary,
    artifact: RuntimeTraceArtifact,
    actor: MatchWorldActorRegistrySnapshot["actors"][number],
  ): StudioDebugTraceFrameLink | undefined {
    let score = 0;
    const reasons = new Set<string>();
    const lifecycleEvents =
      frame.world?.eventsThisTick.filter((event) => this.traceRecordReferencesActor(event, actor)).map((event) => event.type) ?? [];
    const nonPassiveLifecycleEvents = lifecycleEvents.filter((event) => event !== "active");
    if (nonPassiveLifecycleEvents.length) {
      score += 4;
      reasons.add(`lifecycle ${nonPassiveLifecycleEvents.join(",")}`);
    } else if (lifecycleEvents.length) {
      score += 1;
      reasons.add("lifecycle active");
    }
    const targetLinks =
      frame.world?.targetLinks.filter(
        (link) =>
          link.ownerId === actor.id ||
          link.actorId === actor.id ||
          link.ownerId === actor.ownerId ||
          link.actorId === actor.ownerId,
      ) ?? [];
    if (targetLinks.length) {
      score += 5;
      reasons.add(`${targetLinks.length} target link${targetLinks.length === 1 ? "" : "s"}`);
    }
    const actorCombatReasons = artifact.trace.combatReasons.filter(
      (reason) =>
        reason.frameIndex === frame.frameIndex &&
        (reason.actorId === actor.id || this.traceTextReferencesActor(reason.detail, actor)),
    );
    if (actorCombatReasons.length) {
      score += 4;
      for (const reason of actorCombatReasons) {
        reasons.add(reason.reason);
      }
    }
    const matchingEvents = artifact.trace.events.filter(
      (event) => event.frameIndex === frame.frameIndex && this.traceTextReferencesActor(event.line, actor),
    );
    if (matchingEvents.length) {
      score += 3;
      for (const event of matchingEvents) {
        reasons.add(event.category);
      }
    }
    if (actor.id === "p1" && frame.input.p1.length) {
      score += 2;
      reasons.add(`p1 input ${frame.input.p1.join("+")}`);
    }
    if (actor.id === "p2" && frame.input.p2?.length) {
      score += 2;
      reasons.add(`p2 input ${frame.input.p2.join("+")}`);
    }
    if (frame.world?.live.includes(actor.id)) {
      score += 1;
      reasons.add("live");
    }
    if (score <= 0) {
      return undefined;
    }
    return {
      frameIndex: frame.frameIndex,
      tick: frame.tick,
      label: frame.label,
      checksum: frame.checksum,
      input: frame.input,
      score,
      reasons: [...reasons],
      eventCategories: [...frame.eventCategories],
      combatReasons: [...frame.combatReasons],
      targetLinkCount: targetLinks.length,
      lifecycleEvents,
    };
  }

  private traceRecordReferencesActor(
    record: { id?: string; ownerId?: string; rootId?: string; parentId?: string; actorId?: string; label?: string },
    actor: MatchWorldActorRegistrySnapshot["actors"][number],
  ): boolean {
    return (
      record.id === actor.id ||
      record.ownerId === actor.id ||
      record.rootId === actor.id ||
      record.parentId === actor.id ||
      record.actorId === actor.id ||
      record.id === actor.ownerId ||
      record.ownerId === actor.ownerId ||
      record.label === actor.label
    );
  }

  private traceTextReferencesActor(text: string, actor: MatchWorldActorRegistrySnapshot["actors"][number]): boolean {
    const lower = text.toLowerCase();
    return lower.includes(actor.id.toLowerCase()) || lower.includes(actor.label.toLowerCase());
  }

  private isTraceGateRelevantToActor(
    gate: RuntimeTraceArtifact["gates"][number],
    actor: MatchWorldActorRegistrySnapshot["actors"][number],
  ): boolean {
    return (
      gate.evidence.finalActors.some((candidate) => candidate.id === actor.id) ||
      gate.evidence.worldLifecycleEvents.some((event) => this.traceRecordReferencesActor(event, actor)) ||
      gate.evidence.effectStores.some((store) => store.ownerId === actor.id || store.ownerId === actor.ownerId) ||
      gate.evidence.targetLinks.some((link) => link.ownerId === actor.id || link.actorId === actor.id) ||
      gate.evidence.eventLines.some((line) => this.traceTextReferencesActor(line, actor))
    );
  }

  private summarizeTraceGateForActor(
    gate: RuntimeTraceArtifact["gates"][number],
    actor: MatchWorldActorRegistrySnapshot["actors"][number],
  ): string {
    const parts: string[] = [];
    const controllers = Object.entries(gate.evidence.executedControllers)
      .slice(0, 3)
      .map(([type, count]) => `${type} x${count}`);
    const operations = Object.entries(gate.evidence.executedOperations)
      .slice(0, 3)
      .map(([type, count]) => `${type} x${count}`);
    const lifecycleCount = gate.evidence.worldLifecycleEvents.filter((event) => this.traceRecordReferencesActor(event, actor)).length;
    const targetCount = gate.evidence.targetLinks.filter((link) => link.ownerId === actor.id || link.actorId === actor.id).length;
    if (controllers.length) {
      parts.push(`controllers ${controllers.join(", ")}`);
    }
    if (operations.length) {
      parts.push(`ops ${operations.join(", ")}`);
    }
    if (lifecycleCount) {
      parts.push(`${lifecycleCount} lifecycle proofs`);
    }
    if (targetCount) {
      parts.push(`${targetCount} target proofs`);
    }
    return parts.join(" / ") || "gate references this actor through final/world evidence";
  }

  private getStudioAssetLibrarySummary(): StudioAssetLibrarySummary {
    const assets = this.getStudioProjectSummary().assets;
    const visibleAssets = this.getFilteredStudioAssets(assets);
    const selectedAssetId = this.resolveSelectedStudioAssetId(assets, visibleAssets);
    const selectedAsset = selectedAssetId ? assets.find((asset) => asset.id === selectedAssetId) : undefined;
    const relatedEvidence = selectedAsset ? this.getAssetEvidenceRecords(selectedAsset) : [];
    const selectedDependencies = selectedAsset ? this.getAssetDependencyRecords(selectedAsset, relatedEvidence) : [];
    const selectedDependencyGraph = selectedAsset
      ? this.getAssetDependencyGraph(selectedAsset, selectedDependencies)
      : this.getEmptyAssetDependencyGraph();
    const provenance = this.getStudioAssetProvenance(assets);
    const replacementPlan = selectedAsset
      ? this.getAssetReplacementPlan(selectedAsset, assets)
      : this.getEmptyAssetReplacementPlan("Select an asset to inspect replacement candidates.");
    const sourceRuntimeMap = selectedAsset
      ? this.getAssetSourceRuntimeMap(selectedAsset, relatedEvidence, selectedDependencies)
      : this.getEmptyAssetSourceRuntimeMap();
    const missingReferences = selectedDependencies.filter((dependency) => isAttentionStatus(dependency.status));
    return {
      assets,
      visibleAssets,
      selectedAsset,
      selectedDependencies,
      selectedDependencyGraph,
      replacementPlan,
      provenance,
      selectedProvenance: selectedAsset ? provenance.find((record) => record.assetId === selectedAsset.id) : undefined,
      sourceRuntimeMap,
      missingReferences,
      relatedEvidence,
      activeFilter: this.studioAssetFilter,
      selectedAssetId,
      filters: ["all", "attention", "characters", "stages", "generated", "imported", "reports", "selected"],
      stats: {
        total: assets.length,
        attention: assets.filter((asset) => isAttentionStatus(asset.status)).length,
        characters: assets.filter((asset) => asset.kind === "character" || asset.kind === "sprite-atlas").length,
        stages: assets.filter((asset) => asset.kind === "stage").length,
        generated: assets.filter((asset) => asset.source === "generated").length,
        imported: assets.filter((asset) => asset.source === "mugen-import").length,
        reports: assets.filter((asset) => asset.kind === "report" || asset.kind === "sound").length,
        selected: assets.filter((asset) => asset.tags.includes("selected")).length,
      },
    };
  }

  private getStudioAssetProvenance(
    assets: StudioAssetRecord[],
    bundledRecords: ProjectExportBundleAssetRecord[] = this.lastProjectBundle?.manifest.assets.records ?? [],
  ): AssetProvenanceRecord[] {
    const sourcePackages = this.getProjectSourcePackages();
    const sourceTransactions = this.getSourceTransactionRecords();
    return assets.map((asset) => {
      const sourcePackage = asset.source === "mugen-import"
        ? sourcePackages.find((candidate) => candidate.characterId === asset.id) ?? sourcePackages[0]
        : undefined;
      const sourceTransaction = sourcePackage
        ? sourceTransactions.find((candidate) => candidate.sourcePackageId === sourcePackage.id)
        : undefined;
      const sourceRecord = this.getAssetSourceRecords(asset).find((record) => record.lane === "source" && record.path);
      const permissionMetadata = this.assetPermissionMetadata.get(asset.id);
      const permission: AssetProvenancePermission = sourcePackage
        ? sourceTransaction?.permission ?? "unsupported"
        : "not-required";
      const permissionInputFiles: AssetProvenanceFileInput[] = permissionMetadata?.sourceFiles.map((file) => ({
        path: file.path,
        digest: file.sha256,
        byteLength: file.bytes,
      })) ?? [];
      const inputFiles: AssetProvenanceFileInput[] = sourcePackage?.fileDigests
        ? this.getProjectBundleAssetCandidates(asset)
          .filter((candidate) => candidate.sourceKind === "vfs")
          .map((candidate) => {
            const file = sourcePackage.fileDigests?.find((digest) => sourceFilePathMatches(digest.path, candidate.sourcePath));
            return {
              path: candidate.sourcePath,
              ...(file ? { digest: file.digest, byteLength: file.byteLength } : {}),
            };
          })
        : permissionInputFiles;
      const bundledOutputFiles: AssetProvenanceFileInput[] = bundledRecords
        .filter((record) => record.assetId === asset.id && record.status === "bundled")
        .map((record) => ({
          path: record.packagePath,
          ...(record.sha256 ? { digest: record.sha256 } : {}),
          ...(record.bytes !== undefined ? { byteLength: record.bytes } : {}),
        }));
      const outputFiles: AssetProvenanceFileInput[] = bundledOutputFiles.length > 0
        ? bundledOutputFiles
        : permissionMetadata?.outputFiles.map((file) => ({
            path: `assets/characters/${sanitizePackageSegment(asset.id)}/${file.path}`,
            digest: file.sha256,
            byteLength: file.bytes,
          })) ?? [];
      const inputPaths = inputFiles.length > 0
        ? inputFiles.map((file) => file.path)
        : [sourceRecord?.path ?? `assets/${asset.id}`];
      const outputPaths = outputFiles.length > 0
        ? outputFiles.map((file) => file.path)
        : [`runtime/${asset.id}`];
      const tool = asset.source === "mugen-import"
        ? "mugen-loader"
        : asset.source === "generated" && asset.tags.includes("sprite-atlas-builder")
          ? "sprite-atlas-builder"
          : "studio-asset-pipeline";
      const qaLinks: AssetProvenanceQaLink[] = asset.evidenceIds.map((id) => ({
        id,
        kind: id.includes("collision") ? "collision" : id.includes("trace") || id.includes("runtime") ? "playtest" : "qa",
        status: "unknown",
        reference: id,
      }));
      return createAssetProvenanceRecord({
        asset,
        sourceFingerprint: sourcePackage?.fingerprint,
        inputFiles,
        outputFiles,
        sourcePath: sourceRecord?.path,
        tool,
        toolVersion: ASSET_PROVENANCE_TOOL_VERSION,
        permission,
        requiresDurablePermission: false,
        license: permissionMetadata
          ? {
              expression: permissionMetadata.license.expression,
              sourceRef: permissionMetadata.license.sourceRef,
              verified: permissionMetadata.license.verified,
            }
          : undefined,
        transforms: [
          {
            id: `${asset.id}:source-import`,
            kind: "source-import",
            tool,
            version: ASSET_PROVENANCE_TOOL_VERSION,
            configDigest: ASSET_PROVENANCE_IMPORT_CONFIG_DIGEST,
            inputPaths,
            outputPaths: [`runtime/${asset.id}`],
          },
          {
            id: `${asset.id}:bundle`,
            kind: "bundle",
            tool: "browser-export",
            version: ASSET_PROVENANCE_TOOL_VERSION,
            configDigest: ASSET_PROVENANCE_EXPORT_CONFIG_DIGEST,
            inputPaths: [`runtime/${asset.id}`],
            outputPaths,
          },
        ],
        qaLinks,
      });
    });
  }

  private getFilteredStudioAssets(assets: StudioAssetRecord[]): StudioAssetRecord[] {
    if (this.studioAssetFilter === "all") {
      return assets;
    }
    if (this.studioAssetFilter === "attention") {
      return assets.filter((asset) => isAttentionStatus(asset.status));
    }
    if (this.studioAssetFilter === "characters") {
      return assets.filter((asset) => asset.kind === "character" || asset.kind === "sprite-atlas");
    }
    if (this.studioAssetFilter === "stages") {
      return assets.filter((asset) => asset.kind === "stage");
    }
    if (this.studioAssetFilter === "generated") {
      return assets.filter((asset) => asset.source === "generated");
    }
    if (this.studioAssetFilter === "imported") {
      return assets.filter((asset) => asset.source === "mugen-import");
    }
    if (this.studioAssetFilter === "reports") {
      return assets.filter((asset) => asset.kind === "report" || asset.kind === "sound");
    }
    return assets.filter((asset) => asset.tags.includes("selected"));
  }

  private resolveSelectedStudioAssetId(assets = this.getStudioProjectSummary().assets, visibleAssets = this.getFilteredStudioAssets(assets)): string | undefined {
    if (this.studioSelectedAssetId && visibleAssets.some((asset) => asset.id === this.studioSelectedAssetId)) {
      return this.studioSelectedAssetId;
    }
    return visibleAssets[0]?.id ?? assets[0]?.id;
  }

  private getAssetEvidenceRecords(asset: StudioAssetRecord): StudioEvidenceRecord[] {
    return this.getStudioEvidenceRecords().filter((record) => {
      if (record.id === `asset:${asset.id}`) {
        return true;
      }
      if (record.tags.includes(asset.id)) {
        return true;
      }
      return record.detail.includes(asset.id) || record.label === asset.label;
    });
  }

  private getAssetDependencyRecords(asset: StudioAssetRecord, relatedEvidence: StudioEvidenceRecord[]): StudioAssetDependencyRecord[] {
    const summary = this.getStudioProjectSummary();
    const manifest = this.getGameProjectManifest(summary);
    const records: StudioAssetDependencyRecord[] = [];
    const manifestBucket = this.getManifestAssetBucket(asset);
    const manifestContains = manifestBucket ? manifest.assets[manifestBucket].includes(asset.id) : manifest.assetRecords.some((record) => record.id === asset.id);
    const entryRoles = [
      summary.entry.p1 === asset.id ? "P1" : "",
      summary.entry.p2 === asset.id ? "P2" : "",
      summary.entry.stage === asset.id ? "stage" : "",
    ].filter(Boolean);

    records.push({
      id: `${asset.id}:manifest`,
      label: "Runtime manifest reference",
      kind: "manifest",
      status: manifestContains ? "ok" : "fail",
      detail: manifestBucket
        ? manifestContains
          ? `listed in assets.${manifestBucket}`
          : `missing from assets.${manifestBucket}`
        : manifestContains
          ? "kept as assetRecord metadata only"
          : "missing from assetRecords",
    });

    records.push({
      id: `${asset.id}:entry`,
      label: "Playtest entry",
      kind: "playtest-entry",
      status: entryRoles.length ? "active" : "pending",
      detail: entryRoles.length ? `used by current ${entryRoles.join(" and ")} selection` : "available but not selected in the current playtest entry",
    });

    records.push({
      id: `${asset.id}:provenance`,
      label: "Provenance status",
      kind: "provenance",
      status: asset.status,
      detail: `${asset.source} ${asset.kind}: ${asset.detail}`,
    });

    const module = this.getModuleDependencyForAsset(summary, asset);
    records.push({
      id: `${asset.id}:module`,
      label: "Required module",
      kind: "module",
      status: module?.status ?? "fail",
      detail: module ? `${module.label}: ${module.detail}` : "No project module currently owns this asset kind/source",
    });

    records.push({
      id: `${asset.id}:source`,
      label: "Source contract",
      kind: "source",
      status: this.getAssetSourceContractStatus(asset),
      detail: this.getAssetSourceContractDetail(asset),
    });

    records.push({
      id: `${asset.id}:evidence`,
      label: "Linked evidence",
      kind: "evidence",
      status: relatedEvidence.length ? (relatedEvidence.some((record) => record.status === "fail") ? "fail" : relatedEvidence.some((record) => isAttentionStatus(record.status)) ? "warn" : "ok") : "pending",
      detail: relatedEvidence.length ? `${relatedEvidence.length} evidence record(s) connected to this asset` : "no evidence records linked yet",
    });

    return records;
  }

  private getAssetDependencyGraph(asset: StudioAssetRecord, dependencies: StudioAssetDependencyRecord[]): StudioAssetDependencyGraph {
    const rootStatus = isAttentionStatus(asset.status) ? asset.status : "active";
    const nodes: StudioAssetDependencyGraphNode[] = [
      {
        id: asset.id,
        label: asset.label,
        kind: "asset",
        status: rootStatus,
        detail: `${asset.kind} / ${asset.source}`,
        root: true,
      },
      ...dependencies.map((dependency) => ({
        id: dependency.id,
        label: dependency.label,
        kind: dependency.kind,
        status: dependency.status,
        detail: dependency.detail,
      })),
    ];
    const edges = dependencies.map((dependency) => ({
      id: `${asset.id}->${dependency.id}`,
      from: asset.id,
      to: dependency.id,
      status: dependency.status,
      label: dependency.kind,
    }));
    return {
      nodes,
      edges,
      stats: {
        total: nodes.length,
        ok: nodes.filter((node) => node.status === "ok" || node.status === "active").length,
        attention: nodes.filter((node) => isAttentionStatus(node.status)).length,
        blocked: nodes.filter((node) => node.status === "fail").length,
      },
    };
  }

  private getEmptyAssetDependencyGraph(): StudioAssetDependencyGraph {
    return {
      nodes: [],
      edges: [],
      stats: {
        total: 0,
        ok: 0,
        attention: 0,
        blocked: 0,
      },
    };
  }

  private getAssetReplacementPlan(asset: StudioAssetRecord, assets: StudioAssetRecord[]): StudioAssetReplacementPlan {
    const role = this.getAssetReplacementRole(asset);
    if (role === "unbound") {
      return this.getEmptyAssetReplacementPlan("Select a current P1, P2, or stage asset to replace it.", role, asset);
    }
    if (role === "unsupported") {
      return this.getEmptyAssetReplacementPlan("Reports and sound assets are tracked, but replacement is not actionable in this first cut.", role, asset);
    }
    const candidates = assets
      .filter((candidate) => candidate.id !== asset.id && this.isReplacementCandidateForRole(candidate, role))
      .map((candidate) => this.toReplacementCandidate(candidate, role));
    return {
      role,
      currentId: asset.id,
      currentLabel: asset.label,
      canApply: candidates.length > 0,
      reason: candidates.length
        ? `Replace the current ${this.formatReplacementRole(role)} entry and rebuild the playtest runtime.`
        : `No compatible ${this.formatReplacementRole(role)} replacement is available in the current local project.`,
      candidates,
    };
  }

  private getEmptyAssetReplacementPlan(
    reason: string,
    role: StudioAssetReplacementRole = "unbound",
    asset?: StudioAssetRecord,
  ): StudioAssetReplacementPlan {
    return {
      role,
      currentId: asset?.id,
      currentLabel: asset?.label,
      canApply: false,
      reason,
      candidates: [],
    };
  }

  private getAssetReplacementRole(asset: StudioAssetRecord): StudioAssetReplacementRole {
    if (asset.id === this.selectedP1) {
      return "p1";
    }
    if (asset.id === this.selectedP2) {
      return "p2";
    }
    if (asset.id === this.selectedStageId) {
      return "stage";
    }
    if (asset.kind === "character" || asset.kind === "sprite-atlas" || asset.kind === "stage") {
      return "unbound";
    }
    return "unsupported";
  }

  private isReplacementCandidateForRole(asset: StudioAssetRecord, role: Exclude<StudioAssetReplacementRole, "unbound" | "unsupported">): boolean {
    if (role === "stage") {
      return asset.kind === "stage" && Boolean(this.findStage(asset.id));
    }
    return (asset.kind === "character" || asset.kind === "sprite-atlas") && Boolean(this.findFighter(asset.id));
  }

  private toReplacementCandidate(
    asset: StudioAssetRecord,
    role: Exclude<StudioAssetReplacementRole, "unbound" | "unsupported">,
  ): StudioAssetReplacementCandidate {
    const active =
      role === "stage"
        ? asset.id === this.selectedStageId
        : asset.id === this.selectedP1 || asset.id === this.selectedP2;
    const activeDetail =
      role === "stage"
        ? asset.id === this.selectedStageId
          ? "currently active stage"
          : asset.detail
        : asset.id === this.selectedP1
          ? "currently P1; applying may resolve duplicate slots"
          : asset.id === this.selectedP2
            ? "currently P2; applying may resolve duplicate slots"
            : asset.detail;
    return {
      id: asset.id,
      label: asset.label,
      role,
      kind: asset.kind,
      source: asset.source,
      status: asset.status,
      detail: activeDetail,
      active,
      tags: asset.tags,
    };
  }

  private applyStudioAssetReplacement(candidateId: string): void {
    const library = this.getStudioAssetLibrarySummary();
    const plan = library.replacementPlan;
    const candidate = plan.candidates.find((item) => item.id === candidateId);
    if (!candidate || (plan.role !== "p1" && plan.role !== "p2" && plan.role !== "stage")) {
      this.log(`Replacement unavailable for ${candidateId}`);
      this.updateUi();
      return;
    }
    if (plan.role === "p1") {
      this.selectedP1 = candidate.id;
    } else if (plan.role === "p2") {
      this.selectedP2 = candidate.id;
    } else {
      this.selectedStageId = candidate.id;
    }
    this.invalidateBuildOutputs();
    this.markProjectDirty();
    this.rebuildMatchRuntime();
    this.mode = "studio";
    this.studioTab = "assets";
    this.studioSelectedAssetId = candidate.id;
    const replacementAsset = this.getStudioProjectSummary().assets.find((asset) => asset.id === candidate.id);
    if (replacementAsset) {
      this.studioAssetFilter = this.getPreferredAssetFilter(replacementAsset);
    }
    this.snapshot = this.matchRuntime.getSnapshot();
    this.writeUrlState();
    this.log(`Replaced ${this.formatReplacementRole(plan.role)} asset ${plan.currentId ?? "-"} with ${candidate.id}; compile and trace outputs need refresh`);
    this.updateUi();
  }

  private getAssetSourceRuntimeMap(
    asset: StudioAssetRecord,
    relatedEvidence: StudioEvidenceRecord[],
    dependencies: StudioAssetDependencyRecord[],
  ): StudioAssetSourceRuntimeMap {
    const records: StudioAssetSourceRuntimeRecord[] = [
      ...this.getAssetSourceRecords(asset),
      ...this.getAssetManifestMappingRecords(asset),
      ...this.getAssetRuntimeMappingRecords(asset),
      ...this.getAssetQaMappingRecords(asset, relatedEvidence),
      ...this.getAssetExportMappingRecords(asset, dependencies),
    ];
    return this.toAssetSourceRuntimeMap(records);
  }

  private getEmptyAssetSourceRuntimeMap(): StudioAssetSourceRuntimeMap {
    return this.toAssetSourceRuntimeMap([]);
  }

  private toAssetSourceRuntimeMap(records: StudioAssetSourceRuntimeRecord[]): StudioAssetSourceRuntimeMap {
    const lanes: Record<StudioAssetMappingLane, number> = {
      source: 0,
      manifest: 0,
      runtime: 0,
      qa: 0,
      export: 0,
    };
    for (const record of records) {
      lanes[record.lane] += 1;
    }
    return { records, lanes };
  }

  private getAssetSourceRecords(asset: StudioAssetRecord): StudioAssetSourceRuntimeRecord[] {
    const records: StudioAssetSourceRuntimeRecord[] = [];
    const character = this.character;
    const importedStage = this.importedStages.find((stage) => stage.stage.id === asset.id);
    if (asset.source === "generated" && (asset.kind === "sprite-atlas" || asset.kind === "character")) {
      records.push(
        this.assetMappingRecord("source", `${asset.id}:source:atlas`, "Generated atlas manifest", "ok", "sprite-atlas-builder manifest consumed by AtlasSpriteProvider", `/characters/${asset.id}/manifest.json`),
        this.assetMappingRecord("source", `${asset.id}:source:sheet`, "Generated atlas sheet", "ok", "transparent sprite sheet used by the runtime texture store", `/characters/${asset.id}/sprite-sheet-alpha.png`),
        this.assetMappingRecord("source", `${asset.id}:source:qa`, "Generated motion QA report", asset.status, "locomotion report generated with atlas QA scripts", `/characters/${asset.id}/qa/motion-variation-report.json`),
      );
      return records;
    }
    if (asset.source === "mugen-import" && character && asset.id === this.importedFighter?.id) {
      records.push(this.assetMappingRecord("source", `${asset.id}:source:def`, "MUGEN DEF", "ok", character.sourceName, character.files.def ?? character.defPath));
      records.push(...this.optionalCharacterFileMappings(asset, character));
      return records;
    }
    if (asset.source === "mugen-import" && importedStage) {
      records.push(this.assetMappingRecord("source", `${asset.id}:source:def`, "Stage DEF", "ok", importedStage.sourceName, importedStage.files.def));
      if (importedStage.files.sprite) {
        records.push(this.assetMappingRecord("source", `${asset.id}:source:sff`, "Stage SFF", importedStage.spriteArchive ? "ok" : "warn", `${importedStage.spriteArchive?.sprites.length ?? 0} decoded stage sprites`, importedStage.files.sprite));
      }
      if (importedStage.files.music) {
        records.push(this.assetMappingRecord("source", `${asset.id}:source:music`, "Stage music", "pending", "tracked from DEF but not bundled by runtime export yet", importedStage.files.music));
      }
      return records;
    }
    if (asset.kind === "stage") {
      const stage = this.findStage(asset.id);
      const primaryLayer = stage?.layers.find((layer) => layer.assetUrl);
      records.push(
        this.assetMappingRecord(
          "source",
          `${asset.id}:source:stage`,
          asset.source === "authored" ? "Authored stage art" : "Runtime stage definition",
          primaryLayer ? "ok" : "partial",
          `${stage?.layers.length ?? 0} runtime stage layer(s)`,
          primaryLayer?.assetUrl ?? "src/mugen/runtime/demoStage.ts",
        ),
      );
      return records;
    }
    if (asset.kind === "sound" && character) {
      records.push(
        this.assetMappingRecord(
          "source",
          `${asset.id}:source:snd`,
          "MUGEN SND",
          character.files.sound ? asset.status : "pending",
          asset.detail,
          character.files.sound ?? `${character.sourceName}:sound`,
        ),
      );
      return records;
    }
    if (asset.kind === "report" && character) {
      records.push(
        this.assetMappingRecord(
          "source",
          `${asset.id}:source:compat`,
          "Compatibility report input",
          asset.status,
          `${character.sourceName} parser/runtime diagnostics`,
          character.files.def ?? character.defPath,
        ),
      );
      return records;
    }
    records.push(this.assetMappingRecord("source", `${asset.id}:source:metadata`, "Asset metadata", asset.status, asset.detail, asset.id));
    return records;
  }

  private optionalCharacterFileMappings(asset: StudioAssetRecord, character: MugenCharacter): StudioAssetSourceRuntimeRecord[] {
    const records: StudioAssetSourceRuntimeRecord[] = [];
    const add = (id: string, label: string, pathValue: string | undefined, status: StudioStatus, detail: string): void => {
      records.push(this.assetMappingRecord("source", `${asset.id}:source:${id}`, label, pathValue ? status : "pending", detail, pathValue ?? `${character.sourceName}:${id}:missing`));
    };
    add("sff", "MUGEN SFF", character.files.sprite, character.spriteArchive ? "ok" : "warn", `${character.spriteArchive?.sprites.length ?? 0} decoded sprites`);
    add("air", "MUGEN AIR", character.files.anim, character.animations.size > 0 ? "ok" : "warn", `${character.animations.size} parsed actions`);
    add("cmd", "MUGEN CMD", character.files.cmd, character.commands.length > 0 ? "ok" : "partial", `${character.commands.length} parsed commands`);
    add("cns", "MUGEN CNS", character.files.cns, character.states.length > 0 ? "ok" : "partial", `${character.states.length} parsed states`);
    for (const [index, stateFile] of character.files.states.entries()) {
      records.push(this.assetMappingRecord("source", `${asset.id}:source:st:${index}`, "MUGEN ST", "ok", "additional statedef source", stateFile));
    }
    return records;
  }

  private getAssetManifestMappingRecords(asset: StudioAssetRecord): StudioAssetSourceRuntimeRecord[] {
    const manifest = this.getGameProjectManifest();
    const bucket = this.getManifestAssetBucket(asset);
    const listed = bucket ? manifest.assets[bucket].includes(asset.id) : manifest.assetRecords.some((record) => record.id === asset.id);
    return [
      this.assetMappingRecord(
        "manifest",
        `${asset.id}:manifest:bucket`,
        bucket ? `project.json assets.${bucket}` : "project.json assetRecords",
        listed ? "ok" : "fail",
        listed ? "asset is referenced by the current project manifest" : "asset is only visible in runtime metadata, not the manifest bucket",
        bucket ? `assets.${bucket}` : "assetRecords",
      ),
      this.assetMappingRecord("manifest", `${asset.id}:manifest:entry`, "project.json entry", this.getAssetReplacementRole(asset) === "unbound" ? "pending" : "active", this.getEntryMappingDetail(asset), "entry"),
    ];
  }

  private getAssetRuntimeMappingRecords(asset: StudioAssetRecord): StudioAssetSourceRuntimeRecord[] {
    const role = this.getAssetReplacementRole(asset);
    if (asset.kind === "stage") {
      const stage = this.findStage(asset.id);
      return [
        this.assetMappingRecord("runtime", `${asset.id}:runtime:stage`, "Three.js stage renderer", stage ? "ok" : "fail", `${stage?.layers.length ?? 0} layer(s), floorY ${stage?.floorY ?? "-"}`, "ThreeMugenRenderer"),
      ];
    }
    if (asset.kind === "sprite-atlas" || asset.kind === "character") {
      const fighter = this.findFighter(asset.id);
      const providerStatus = asset.source === "generated" ? (this.atlasStatusByFighter.get(asset.id) ?? "loading") : this.importedSffProvider ? "loaded" : "fallback";
      const runtimeStatus: StudioStatus = fighter ? (role === "p1" || role === "p2" ? "active" : "ok") : "fail";
      return [
        this.assetMappingRecord("runtime", `${asset.id}:runtime:fighter`, role === "p1" || role === "p2" ? `MatchWorld actor ${this.formatReplacementRole(role)}` : "Roster fighter definition", runtimeStatus, `${fighter?.animations.size ?? 0} runtime actions / source ${fighter?.source ?? "demo"}`, "MatchWorld"),
        this.assetMappingRecord("runtime", `${asset.id}:runtime:sprites`, asset.source === "generated" ? "AtlasSpriteProvider route" : "SffSpriteProvider route", providerStatus === "loaded" ? "ok" : providerStatus === "fallback" ? "warn" : "pending", `${providerStatus} sprite provider for ${asset.id}`, asset.source === "generated" ? "CompositeSpriteProvider group range" : "CompositeSpriteProvider owner route"),
      ];
    }
    if (asset.kind === "sound") {
      return [
        this.assetMappingRecord("runtime", `${asset.id}:runtime:audio`, "MugenAudioSystem archive", asset.status === "pending" ? "pending" : asset.status, asset.detail, "MugenAudioSystem"),
      ];
    }
    return [
      this.assetMappingRecord("runtime", `${asset.id}:runtime:report`, "Studio diagnostics only", asset.status, "report asset is consumed by Studio panels and export diagnostics", "Studio Evidence"),
    ];
  }

  private getAssetQaMappingRecords(asset: StudioAssetRecord, relatedEvidence: StudioEvidenceRecord[]): StudioAssetSourceRuntimeRecord[] {
    const qaStatus: StudioStatus = relatedEvidence.some((record) => record.status === "fail")
      ? "fail"
      : relatedEvidence.some((record) => isAttentionStatus(record.status))
        ? "warn"
        : relatedEvidence.length
          ? "ok"
          : "pending";
    const records = [
      this.assetMappingRecord("qa", `${asset.id}:qa:evidence`, "Studio Evidence links", qaStatus, `${relatedEvidence.length} linked evidence record(s)`, "studioEvidence"),
    ];
    if (asset.kind === "sprite-atlas" && asset.source === "generated") {
      const motionQa = this.atlasMotionQaByFighter.get(asset.id);
      records.push(
        this.assetMappingRecord(
          "qa",
          `${asset.id}:qa:motion`,
          "Atlas locomotion QA",
          motionQa?.status === "pass" ? "ok" : motionQa?.status === "fail" ? "fail" : "warn",
          `${motionQa?.checkedStates.length ?? 0} checked state(s), ${(motionQa?.warnings.length ?? 0) + (motionQa?.errors.length ?? 0)} issue(s)`,
          `/characters/${asset.id}/qa/motion-variation-report.json`,
        ),
      );
    }
    return records;
  }

  private getAssetExportMappingRecords(asset: StudioAssetRecord, dependencies: StudioAssetDependencyRecord[]): StudioAssetSourceRuntimeRecord[] {
    const exportStatus = dependencies.some((dependency) => dependency.status === "fail")
      ? "fail"
      : dependencies.some((dependency) => isAttentionStatus(dependency.status))
        ? "partial"
        : "ok";
    const bundleCandidates = this.getProjectBundleAssetCandidates(asset);
    return [
      this.assetMappingRecord(
        "export",
        `${asset.id}:export:project`,
        "Project export contract",
        exportStatus,
        bundleCandidates.length > 0
          ? `included in project.json assetRecords; ${bundleCandidates.length} browser-fetchable file(s) are eligible for package bundling`
          : "included in project.json assetRecords; no browser-fetchable binary files are required for this asset",
        "project.json",
      ),
    ];
  }

  private getEntryMappingDetail(asset: StudioAssetRecord): string {
    const roles = [
      this.selectedP1 === asset.id ? "P1" : "",
      this.selectedP2 === asset.id ? "P2" : "",
      this.selectedStageId === asset.id ? "stage" : "",
    ].filter(Boolean);
    return roles.length ? `current playtest entry uses this asset as ${roles.join(" and ")}` : "asset is available but not active in the current playtest entry";
  }

  private assetMappingRecord(
    lane: StudioAssetMappingLane,
    id: string,
    label: string,
    status: StudioStatus,
    detail: string,
    path?: string,
  ): StudioAssetSourceRuntimeRecord {
    return { id, lane, label, status, detail, path };
  }

  private getManifestAssetBucket(asset: StudioAssetRecord): keyof GameProjectManifest["assets"] | undefined {
    if (asset.kind === "character" || asset.kind === "sprite-atlas") {
      return "characters";
    }
    if (asset.kind === "stage") {
      return "stages";
    }
    if (asset.kind === "sound") {
      return "audio";
    }
    return undefined;
  }

  private getModuleDependencyForAsset(summary: StudioProjectSummary, asset: StudioAssetRecord): StudioProjectSummary["modules"][number] | undefined {
    if (asset.kind === "stage") {
      return summary.modules.find((module) => module.id === "three-render");
    }
    if (asset.source === "generated") {
      return summary.modules.find((module) => module.id === "asset-pipeline");
    }
    if (asset.source === "mugen-import" || asset.kind === "character" || asset.kind === "report" || asset.kind === "sound") {
      return summary.modules.find((module) => module.id === "mugen-compat");
    }
    return summary.modules.find((module) => module.id === "studio-workspace");
  }

  private getAssetSourceContractStatus(asset: StudioAssetRecord): StudioStatus {
    if (asset.source === "generated") {
      return asset.tags.includes("sprite-atlas-builder") ? asset.status : "warn";
    }
    if (asset.source === "mugen-import") {
      return asset.status === "pending" ? "pending" : asset.status;
    }
    if (asset.source === "authored" || asset.source === "runtime-demo") {
      return "ok";
    }
    return asset.status;
  }

  private getAssetSourceContractDetail(asset: StudioAssetRecord): string {
    if (asset.source === "generated") {
      return asset.tags.includes("sprite-atlas-builder")
        ? "generated asset has sprite-atlas-builder provenance"
        : "generated asset is missing sprite-atlas-builder provenance";
    }
    if (asset.source === "mugen-import") {
      return this.importedSourceBundle
        ? "loaded from local MUGEN package; source files can be embedded in project package export"
        : "requires relinking the original local MUGEN package before source files can be embedded";
    }
    if (asset.source === "authored") {
      return "authored local project asset available to the current runtime";
    }
    if (asset.source === "runtime-demo") {
      return "runtime demo fallback asset; useful for playtest but not an authored project source yet";
    }
    return "converted runtime/report artifact derived from current import state";
  }

  private getStudioGateEvidenceAssessment(gateId: string): StudioGateEvidenceAssessment {
    const evidence = STUDIO_GATE_EVIDENCE_DOCUMENT.results.find((candidate) => candidate.gateId === gateId);
    if (!evidence) {
      const detail = STUDIO_GATE_EVIDENCE_DIAGNOSTICS.length
        ? STUDIO_GATE_EVIDENCE_DIAGNOSTICS.join("; ")
        : `No GateEvidenceResult/v0 record exists for ${gateId}.`;
      return {
        freshness: { state: "missing", detail },
        status: "pending",
        detail,
        evidenceIds: [],
        blockedBy: ["gate-evidence-missing"],
        canExport: false,
      };
    }
    const freshness = assessGateEvidenceFreshness(evidence);
    const status: StudioStatus = evidence.status === "failed"
      ? "fail"
      : evidence.status === "unsupported"
        ? "unsupported"
        : evidence.status === "missing"
          ? "pending"
          : freshness.state === "current"
            ? "ok"
            : "warn";
    const evidenceIds = [`gate-evidence:${evidence.gateId}`, `gate-digest:${evidence.digest}`, `gate-target:${evidence.target.id}`];
    const blockedBy = [
      ...(evidence.status === "failed" ? ["gate-evidence-failed"] : []),
      ...(evidence.status === "unsupported" ? ["gate-evidence-unsupported"] : []),
      ...(freshness.state !== "current" ? [`gate-evidence-${freshness.state}`] : []),
    ];
    return {
      evidence,
      freshness,
      status,
      detail: `${evidence.label} / ${evidence.status} / ${freshness.detail} / ${evidence.tool.name} / ${evidence.command} / ${evidence.digest}`,
      evidenceIds,
      blockedBy,
      canExport: isGateEvidenceExportable(evidence, freshness),
    };
  }

  private getBuildReadinessRecords(summary: StudioProjectSummary): BuildReadinessRecord[] {
    const compiled = this.lastCompiledProject;
    const assetAttention = summary.assets.filter((asset) => isAttentionStatus(asset.status));
    const architectureEvidence = this.getStudioGateEvidenceAssessment("architecture-boundaries");
    const gateFailures = [
      ...summary.gates.filter((gate) => gate.status === "fail"),
      ...(architectureEvidence.status === "fail" ? [{ id: "architecture-boundaries" }] : []),
    ];
    const gateWarnings = [
      ...summary.gates.filter((gate) => isAttentionStatus(gate.status)),
      ...(isAttentionStatus(architectureEvidence.status) ? [{ id: "architecture-boundaries", status: architectureEvidence.status }] : []),
    ];
    const sourcePackages = this.getProjectSourcePackages();
    const missingSourcePackages = sourcePackages.filter((sourcePackage) => sourcePackage.status !== "linked");
    const linkedSourcePackages = sourcePackages.length - missingSourcePackages.length;
    const provenanceRecords = this.getStudioAssetProvenance(summary.assets);
    const blockedProvenance = provenanceRecords.filter((record) => !record.canExport);
    const tracePassed = this.lastTraceArtifact?.status === "passed";
    const compileErrors = compiled?.diagnostics.errors.length ?? 0;
    const compileWarnings = compiled?.diagnostics.warnings.length ?? 0;
    const missingModules = compiled?.modules.missing.length ?? 0;
    const plannedModules = compiled?.modules.planned.length ?? 0;
    const records: Array<BuildReadinessBaseRecord & Partial<StudioActionableFields>> = [
      {
        id: "playtest",
        label: "Runtime playtest",
        status: "ok",
        state: "runnable",
        detail: `${summary.entry.p1} vs ${summary.entry.p2} on ${summary.entry.stage}`,
        affectedSystem: "runtime",
        impact: "Confirms the project has an immediately runnable match surface for verification.",
        evidenceIds: ["runtime-smoke"],
        blockedBy: [],
        canExport: true,
        nextAction: { kind: "run-smoke", label: "Run visual smoke QA", targetId: "playtest" },
      },
      {
        id: "project-json",
        label: "Project manifest",
        status: "ok",
        state: "exportable",
        detail: `${summary.assets.length} asset records and ${summary.modules.length} requested modules are exportable as project.json`,
        affectedSystem: "studio",
        impact: "Project source metadata can be saved or moved without runtime-only state.",
        evidenceIds: ["project-json"],
        blockedBy: [],
        canExport: true,
        nextAction: { kind: "open-build", label: "Export project.json", targetId: "project-json" },
      },
      {
        id: "runtime-manifest",
        label: "Runtime manifest",
        status: !compiled ? "pending" : compileErrors ? "fail" : compileWarnings ? "warn" : "ok",
        state: !compiled ? "partial" : compileErrors || missingModules ? "blocked" : compileWarnings || plannedModules ? "partial" : "exportable",
        detail: !compiled
          ? "Compile runtime-manifest/v0 before trusting runtime package export"
          : `${compiled.modules.active.length} active, ${plannedModules} planned, ${missingModules} missing modules; ${compileWarnings} warnings`,
        affectedSystem: "build",
        impact: !compiled
          ? "Runtime package export is blocked until the project compiles into a runtime manifest."
          : "Runtime handoff records which modules are active, planned, missing, or warning.",
        evidenceIds: ["compile:runtime-manifest"],
        blockedBy: !compiled ? ["compile-project"] : compileErrors || missingModules ? ["runtime-manifest-errors"] : [],
        canExport: Boolean(compiled && !compileErrors && !missingModules),
        nextAction: !compiled
          ? { kind: "open-build", label: "Compile runtime manifest", targetId: "runtime-manifest" }
          : { kind: "open-evidence", label: "Review compile evidence", targetId: "compile:runtime-manifest" },
      },
      {
        id: "architecture-boundaries",
        label: "Architecture boundaries",
        status: architectureEvidence.status,
        state: architectureEvidence.status === "fail" || architectureEvidence.status === "unsupported" || architectureEvidence.status === "pending"
          ? "blocked"
          : architectureEvidence.status === "ok" && architectureEvidence.canExport
            ? "exportable"
            : "partial",
        detail: architectureEvidence.detail,
        affectedSystem: "module",
        impact: "Keeps renderer-independent engine contracts portable while MUGEN-specific parser/runtime code stays behind compatibility adapters.",
        evidenceIds: ["test:architecture-boundaries", "module-contracts", ...architectureEvidence.evidenceIds],
        blockedBy: architectureEvidence.blockedBy,
        canExport: architectureEvidence.canExport,
        nextAction: { kind: "open-evidence", label: "Review boundary evidence", targetId: "test:architecture-boundaries" },
      },
      {
        id: "asset-validation",
        label: "Asset validation",
        status: assetAttention.some((asset) => asset.status === "fail") || blockedProvenance.length ? "fail" : assetAttention.length ? "warn" : "ok",
        state: assetAttention.some((asset) => asset.status === "fail") || blockedProvenance.length ? "blocked" : assetAttention.length ? "partial" : "exportable",
        detail: blockedProvenance.length
          ? `${blockedProvenance.length}/${provenanceRecords.length} provenance records block release readiness`
          : assetAttention.length
            ? `${assetAttention.length} asset records need attention`
            : "All current asset records are clean",
        affectedSystem: "studio",
        impact: blockedProvenance.length
          ? "The Studio can export a diagnostic package, but release readiness stays blocked until every asset has explicit license, digest, and transform evidence."
          : assetAttention.length
            ? "Some assets can still be playable, but their warnings must stay visible in exported evidence."
            : "Asset inventory has no current warning or failure states.",
        evidenceIds: [
          ...assetAttention.map((asset) => `asset:${asset.id}`),
          ...blockedProvenance.map((record) => `provenance:${record.assetId}`),
        ],
        blockedBy: [
          ...assetAttention.filter((asset) => asset.status === "fail").map((asset) => asset.id),
          ...blockedProvenance.map((record) => `provenance:${record.assetId}`),
        ],
        canExport: !assetAttention.some((asset) => asset.status === "fail") && blockedProvenance.length === 0,
        nextAction: blockedProvenance.length || assetAttention.length
          ? { kind: "open-evidence", label: "Review asset provenance", targetId: "asset-validation" }
          : { kind: "open-build", label: "Review export package", targetId: "asset-validation" },
      },
      {
        id: "source-packages",
        label: "Source packages",
        status: missingSourcePackages.length ? "warn" : "ok",
        state: missingSourcePackages.length ? "partial" : "exportable",
        detail: sourcePackages.length
          ? `${linkedSourcePackages}/${sourcePackages.length} linked; ${sourcePackages.reduce((total, sourcePackage) => total + sourcePackage.requiredPaths.length, 0)} required source path(s)`
          : "No imported ZIP/folder package is required for generated/local assets",
        affectedSystem: "build",
        impact: missingSourcePackages.length
          ? "Imported source files may be excluded from package export until the original ZIP/folder is relinked."
          : "All required source package references are linked for current export evidence.",
        evidenceIds: sourcePackages.map((sourcePackage) => `source-package:${sourcePackage.id}`),
        blockedBy: missingSourcePackages.map((sourcePackage) => sourcePackage.id),
        canExport: true,
        nextAction: missingSourcePackages.length
          ? { kind: "relink-source", label: "Relink missing source package", targetId: missingSourcePackages[0]?.id }
          : { kind: "open-build", label: "Review source package bundle", targetId: "source-packages" },
      },
      {
        id: "evidence",
        label: "Trace and QA evidence",
        status: tracePassed ? "ok" : "pending",
        state: tracePassed ? "exportable" : "partial",
        detail: tracePassed ? `latest trace ${this.lastTraceArtifact?.trace.checksum}` : "Export a trace artifact before claiming runtime evidence",
        affectedSystem: "studio",
        impact: tracePassed
          ? "Latest runtime trace can support current playtest evidence."
          : "Runtime behavior claims remain weak until a trace artifact is exported.",
        evidenceIds: tracePassed && this.lastTraceArtifact ? [`trace:${this.lastTraceArtifact.trace.checksum}`] : [],
        blockedBy: tracePassed ? [] : ["trace-artifact"],
        canExport: true,
        nextAction: tracePassed
          ? { kind: "open-evidence", label: "Open trace evidence", targetId: this.lastTraceArtifact?.trace.checksum }
          : { kind: "run-trace", label: "Export trace artifact", targetId: "trace-artifact" },
      },
      {
        id: "package-bundle",
        label: "Project package",
        status: this.lastProjectBundle ? "ok" : compiled ? "partial" : "pending",
        state: this.lastProjectBundle ? "exportable" : compiled ? "partial" : "blocked",
        detail: this.lastProjectBundle
          ? `${this.lastProjectBundle.filename}: ${this.lastProjectBundle.manifest.files.length} files, ${this.lastProjectBundle.manifest.assets.binaryBundled} bundled assets (${formatBytes(this.lastProjectBundle.manifest.assets.binaryBytes)})`
          : compiled
            ? "Ready to export contracts, evidence, and browser-fetchable local assets"
            : "Compile runtime before exporting the project package",
        affectedSystem: "build",
        impact: this.lastProjectBundle
          ? "Export bundle snapshots project/runtime contracts, evidence, reports, and package assets."
          : compiled
            ? "Package export can now capture current contracts and evidence."
            : "Package export is blocked until a runtime manifest exists.",
        evidenceIds: this.lastProjectBundle ? ["project-bundle"] : compiled ? ["compile:runtime-manifest"] : [],
        blockedBy: compiled ? [] : ["runtime-manifest"],
        canExport: Boolean(compiled),
        nextAction: this.lastProjectBundle
          ? { kind: "open-build", label: "Review package contents", targetId: "package-bundle" }
          : { kind: "open-build", label: compiled ? "Export project package" : "Compile runtime first", targetId: "package-bundle" },
      },
      {
        id: "compatibility-gates",
        label: "Compatibility gates",
        status: gateFailures.length ? "fail" : gateWarnings.length ? "warn" : "ok",
        state: gateFailures.length ? "blocked" : gateWarnings.length ? "partial" : "exportable",
        detail: gateFailures.length ? `${gateFailures.length} failed gate(s)` : gateWarnings.length ? `${gateWarnings.length} partial or pending gate(s)` : "All current gates are clean",
        affectedSystem: "runtime",
        impact: gateFailures.length
          ? "Compatibility export must remain blocked until failed gates are resolved."
          : gateWarnings.length
            ? "Compatibility can be exported as partial evidence, not parity."
            : "Current acceptance gates do not report blocking failures.",
        evidenceIds: summary.gates.map((gate) => `gate:${gate.id}`),
        blockedBy: gateFailures.map((gate) => gate.id),
        canExport: gateFailures.length === 0,
        nextAction: gateFailures.length || gateWarnings.length
          ? { kind: "open-evidence", label: "Review gate evidence", targetId: "compatibility-gates" }
          : { kind: "open-build", label: "Review export readiness", targetId: "compatibility-gates" },
      },
      this.getCompatibilitySnapshotBuildReadinessRecord(),
    ];
    if (this.importedPackageAnalysis && this.importedPackageAnalysisV1) {
      const packageAnalysisEvidence = this.getPackageAnalysisEvidenceRecord(this.importedPackageAnalysis);
      records.push({
        id: "package-analysis",
        label: "Package analysis",
        status: packageAnalysisEvidence.status,
        state: this.importedPackageAnalysis.status === "recognized" ? "exportable" : "partial",
        detail: packageAnalysisEvidence.detail,
        affectedSystem: "parser",
        impact: packageAnalysisEvidence.impact ?? packageAnalysisEvidence.detail,
        evidenceIds: packageAnalysisEvidence.evidenceIds ?? [],
        blockedBy: packageAnalysisEvidence.blockedBy ?? [],
        canExport: true,
        nextAction: packageAnalysisEvidence.nextAction ?? { kind: "open-evidence", label: "Review package analysis", targetId: "package-analysis" },
      });
    }
    const sourceWriteReceipt = this.studioSourceWriteReceipt;
    if (sourceWriteReceipt) {
      const receiptEvidence = this.getSourceWriteReceiptEvidenceRecord(sourceWriteReceipt);
      const committed = isSourceWriteReceiptCommitted(sourceWriteReceipt);
      records.push({
        id: "source-write-receipt",
        label: "Source write receipt",
        status: receiptEvidence.status,
        state: committed ? "exportable" : receiptEvidence.status === "fail" || receiptEvidence.status === "blocked" ? "blocked" : "partial",
        detail: receiptEvidence.detail,
        affectedSystem: "studio",
        impact: receiptEvidence.impact ?? receiptEvidence.detail,
        evidenceIds: receiptEvidence.evidenceIds ?? [],
        blockedBy: receiptEvidence.blockedBy ?? [],
        canExport: committed,
        nextAction: receiptEvidence.nextAction ?? { kind: "open-evidence", label: "Review source write receipt", targetId: sourceWriteReceipt.id },
      });
    }
    return records.map((record) => this.withBuildReadinessAction(record));
  }

  private getCompatibilitySnapshotBuildReadinessRecord(): BuildReadinessRecord {
    const evidence = this.getCompatibilitySnapshotEvidenceRecord();
    const state: BuildReadinessStatus = evidence.status === "ok" ? "exportable" : evidence.status === "fail" ? "blocked" : "partial";
    const snapshot = STUDIO_COMPATIBILITY_SNAPSHOT.snapshot;
    const nextAction = evidence.nextAction ?? { kind: "open-evidence" as const, label: "Review snapshot diagnostics", targetId: "compat:snapshot" };
    return {
      id: "compatibility-snapshot",
      label: "Promoted compatibility snapshot",
      status: evidence.status,
      state,
      detail: evidence.detail,
      severity: evidence.severity ?? this.severityForStatus(evidence.status),
      affectedSystem: "build",
      impact: evidence.impact ?? evidence.detail,
      evidenceIds: evidence.evidenceIds ?? [],
      blockedBy: evidence.blockedBy ?? [],
      canExport: evidence.canExport ?? state === "exportable",
      nextAction,
      staleBecause: snapshot ? `checkpoint observed ${formatDateTime(snapshot.observedAt)}` : undefined,
    };
  }

  private getStudioTrustContractRows(summary = this.getStudioProjectSummary()): StudioTrustContractRow[] {
    const readinessById = new Map(this.getBuildReadinessRecords(summary).map((record) => [record.id, record]));
    const lanes: Array<{ id: string; lane: StudioTrustLane }> = [
      { id: "runtime-manifest", lane: "runtime" },
      { id: "evidence", lane: "qa" },
      { id: "package-bundle", lane: "build" },
      { id: "asset-validation", lane: "assets" },
      { id: "source-packages", lane: "source" },
      { id: "compatibility-gates", lane: "compat" },
      { id: "compatibility-snapshot", lane: "compat" },
      ...(this.importedPackageAnalysisV1 ? [{ id: "package-analysis", lane: "compat" as const }] : []),
      { id: "architecture-boundaries", lane: "architecture" },
      ...(this.studioSourceWriteReceipt ? [{ id: "source-write-receipt", lane: "source" as const }] : []),
    ];
    return lanes.flatMap(({ id, lane }) => {
      const record = readinessById.get(id);
      if (!record) {
        return [];
      }
      const target = this.getStudioTrustTarget(record, summary);
      const freshness = this.getStudioTrustFreshness(record, summary);
      return [
        {
          id: record.id,
          lane,
          label: record.label,
          status: record.status,
          state: record.state,
          detail: record.detail,
          impact: record.impact,
          evidence: this.getStudioTrustEvidenceLabel(record, summary),
          freshness: freshness.label,
          delta: freshness.delta,
          targetKind: target.kind,
          targetId: target.id,
          targetPackageId: target.targetPackageId,
          targetPath: target.targetPath,
          nextLabel: record.nextAction.label,
          nextAction: record.nextAction,
          blockedBy: record.blockedBy,
        },
      ];
    });
  }

  private getStudioTrustTarget(record: BuildReadinessRecord, summary: StudioProjectSummary): StudioTrustTarget {
    if (record.id === "runtime-manifest") {
      return { kind: "compile", id: "compile:runtime-manifest" };
    }
    if (record.id === "evidence") {
      return { kind: "trace", id: this.lastTraceArtifact?.trace.checksum ?? this.storedTraceEvidence[0]?.artifact.trace.checksum ?? "trace:smoke" };
    }
    if (record.id === "package-bundle") {
      const packageFile = this.getStudioTrustPackageFileTarget();
      return packageFile
        ? { kind: "package-file", id: packageFile.path, targetPath: packageFile.path }
        : { kind: "package", id: this.lastProjectBundle?.filename ?? "project-package" };
    }
    if (record.id === "asset-validation") {
      const attentionAsset = summary.assets.find((asset) => isAttentionStatus(asset.status)) ?? summary.assets[0];
      return { kind: "asset", id: attentionAsset?.id ?? "asset-validation" };
    }
    if (record.id === "source-packages") {
      const target = this.getStudioTrustSourceFileTarget();
      return target?.sourcePath
        ? { kind: "source-file", id: target.sourcePath, targetPackageId: target.sourcePackage.id, targetPath: target.sourcePath }
        : { kind: "source-package", id: target?.sourcePackage.id ?? "source-packages", targetPackageId: target?.sourcePackage.id };
    }
    if (record.id === "compatibility-gates") {
      const target = summary.gates.find((gate) => isAttentionStatus(gate.status)) ?? summary.gates[0];
      return { kind: "gate", id: target?.id ?? "compatibility-gates" };
    }
    if (record.id === "compatibility-snapshot") {
      return { kind: "gate", id: "compat:snapshot" };
    }
    if (record.id === "package-analysis") {
      const report = this.importedPackageAnalysis;
      const reportV1 = this.importedPackageAnalysisV1;
      return report
        ? { kind: "package", id: `package-analysis:${reportV1?.checksum ?? report.checksum}` }
        : { kind: "package", id: "package-analysis" };
    }
    if (record.id === "architecture-boundaries") {
      return { kind: "contract", id: "test:architecture-boundaries" };
    }
    if (record.id === "source-write-receipt") {
      const receipt = this.studioSourceWriteReceipt;
      return receipt
        ? { kind: "source-file", id: receipt.path, targetPackageId: receipt.sourcePackageId, targetPath: receipt.path }
        : { kind: "source-package", id: "source-write-receipt" };
    }
    return { kind: "gate", id: record.id };
  }

  private getStudioTrustPackageFileTarget(): ProjectExportBundleManifest["files"][number] | undefined {
    const files = this.lastProjectBundle?.manifest.files ?? [];
    return (
      files.find((file) => file.path === "package-manifest.json") ??
      files.find((file) => file.path === "runtime/runtime-manifest.json") ??
      files.find((file) => file.required) ??
      files[0]
    );
  }

  private getStudioTrustSourceFileTarget(): { sourcePackage: GameProjectSourcePackage; sourcePath?: string } | undefined {
    const sourcePackages = this.getProjectSourcePackages();
    const sourcePackage =
      sourcePackages.find((candidate) => candidate.status !== "linked" && candidate.requiredPaths.length > 0) ??
      sourcePackages.find((candidate) => candidate.requiredPaths.length > 0) ??
      sourcePackages.find((candidate) => candidate.status !== "linked") ??
      sourcePackages[0];
    if (!sourcePackage) {
      return undefined;
    }
    return { sourcePackage, sourcePath: sourcePackage.requiredPaths[0] };
  }

  private getStudioTrustFreshness(record: BuildReadinessRecord, summary: StudioProjectSummary): { label: string; delta: string } {
    if (record.id === "runtime-manifest") {
      const compiled = this.lastCompiledProject;
      if (!compiled) {
        return { label: "missing", delta: "compile required" };
      }
      const warnings = compiled.diagnostics.warnings.length;
      const errors = compiled.diagnostics.errors.length;
      return { label: errors ? "blocked" : warnings ? "review" : "current", delta: `${errors} errors / ${warnings} warnings` };
    }
    if (record.id === "evidence") {
      const comparison = this.getPersistedTraceComparisons()[0];
      if (comparison) {
        return {
          label: comparison.match === "same" ? "current" : comparison.match === "different" ? "changed" : "session",
          delta:
            comparison.match === "same"
              ? "persisted trace matches current"
              : `${comparison.match}: frames ${formatSignedDelta(comparison.frameDelta)}, events ${formatSignedDelta(comparison.eventDelta)}, gates ${formatSignedDelta(comparison.gateDelta)}`,
        };
      }
      return this.lastTraceArtifact
        ? { label: "session", delta: "current trace not persisted" }
        : { label: this.storedTraceEvidence.length ? "stale" : "missing", delta: this.storedTraceEvidence.length ? "stored trace lacks current run" : "export trace required" };
    }
    if (record.id === "package-bundle") {
      const bundle = this.lastProjectBundle;
      return bundle
        ? { label: "snapshot", delta: `${bundle.manifest.files.length} files / ${bundle.manifest.assets.binaryBundled} bundled assets` }
        : { label: this.lastCompiledProject ? "ready" : "missing", delta: this.lastCompiledProject ? "export package to snapshot files" : "compile required before package" };
    }
    if (record.id === "asset-validation") {
      const attention = summary.assets.filter((asset) => isAttentionStatus(asset.status)).length;
      const failed = summary.assets.filter((asset) => asset.status === "fail" || asset.status === "blocked").length;
      return { label: attention ? "review" : "current", delta: `${attention} attention / ${failed} blocked` };
    }
    if (record.id === "source-packages") {
      const sourcePackages = this.getProjectSourcePackages();
      const missing = sourcePackages.filter((sourcePackage) => sourcePackage.status !== "linked").length;
      return { label: missing ? "stale" : "linked", delta: sourcePackages.length ? `${missing} missing / ${sourcePackages.length} source package(s)` : "no source package required" };
    }
    if (record.id === "compatibility-gates") {
      const attention = summary.gates.filter((gate) => isAttentionStatus(gate.status)).length;
      const blocked = summary.gates.filter((gate) => gate.status === "fail" || gate.status === "blocked" || gate.status === "unsupported").length;
      return { label: attention ? "review" : "current", delta: `${attention} attention / ${blocked} blocked` };
    }
    if (record.id === "compatibility-snapshot") {
      const snapshot = STUDIO_COMPATIBILITY_SNAPSHOT.snapshot;
      return snapshot
        ? { label: "promoted", delta: `semantic ${snapshot.semanticDigest} / source ${snapshot.source.sourceRevision.slice(0, 8)}` }
        : { label: "invalid", delta: STUDIO_COMPATIBILITY_SNAPSHOT.diagnostics.join("; ") || "snapshot unavailable" };
    }
    if (record.id === "package-analysis") {
      const report = this.importedPackageAnalysis;
      const reportV1 = this.importedPackageAnalysisV1;
      return report
        ? { label: "current", delta: `${report.summary.findingCount} findings / semantic ${reportV1?.semanticDigest ?? "missing"}` }
        : { label: "missing", delta: "package analysis not materialized" };
    }
    if (record.id === "architecture-boundaries") {
      const assessment = this.getStudioGateEvidenceAssessment(record.id);
      return {
        label: assessment.freshness.state === "current" && assessment.status === "ok" ? "current" : assessment.freshness.state,
        delta: assessment.evidence
          ? `${assessment.evidence.digest} / ${assessment.evidence.sourceRevision.slice(0, 8)}`
          : assessment.detail,
      };
    }
    if (record.id === "source-write-receipt") {
      const receipt = this.studioSourceWriteReceipt;
      if (!receipt) {
        return { label: "missing", delta: "source write receipt not recorded" };
      }
      return {
        label: isSourceWriteReceiptCommitted(receipt) ? "current" : receipt.status,
        delta: `${receipt.reason} / ${receipt.digest}`,
      };
    }
    return { label: record.state, delta: record.blockedBy.length ? `${record.blockedBy.length} blocker(s)` : "no blockers" };
  }

  private getStudioTrustEvidenceLabel(record: BuildReadinessRecord, summary: StudioProjectSummary): string {
    if (record.id === "runtime-manifest") {
      const compiled = this.lastCompiledProject;
      return compiled
        ? `${compiled.schemaVersion} / active ${compiled.modules.active.length} / missing ${compiled.modules.missing.length}`
        : "runtime-manifest/v0 not compiled";
    }
    if (record.id === "evidence") {
      if (this.lastTraceArtifact) {
        return `${this.lastTraceArtifact.trace.frameCount}f / ${this.lastTraceArtifact.trace.eventCount} events / ${this.lastTraceArtifact.trace.checksum}`;
      }
      return this.storedTraceEvidence.length ? `${this.storedTraceEvidence.length} stored trace(s), no current run` : "no current trace artifact";
    }
    if (record.id === "package-bundle") {
      const bundle = this.lastProjectBundle;
      return bundle
        ? `${bundle.manifest.files.length} files / ${bundle.manifest.assets.binaryBundled} assets / ${formatBytes(bundle.manifest.assets.binaryBytes)}`
        : this.lastCompiledProject
          ? "manifest compiled, package not exported"
          : "package export waits on compile";
    }
    if (record.id === "asset-validation") {
      const attention = summary.assets.filter((asset) => isAttentionStatus(asset.status)).length;
      return `${attention}/${summary.assets.length} attention / ${summary.stats.generatedAtlases} atlases`;
    }
    if (record.id === "source-packages") {
      const sourcePackages = this.getProjectSourcePackages();
      const linked = sourcePackages.filter((sourcePackage) => sourcePackage.status === "linked").length;
      const requiredPaths = sourcePackages.reduce((total, sourcePackage) => total + sourcePackage.requiredPaths.length, 0);
      return sourcePackages.length ? `${linked}/${sourcePackages.length} linked / ${requiredPaths} required paths` : "generated/local project sources only";
    }
    if (record.id === "compatibility-gates") {
      const blocked = summary.gates.filter((gate) => gate.status === "fail" || gate.status === "blocked" || gate.status === "unsupported").length;
      const attention = summary.gates.filter((gate) => isAttentionStatus(gate.status)).length;
      return `${summary.gates.length - attention}/${summary.gates.length} clean / ${blocked} blocked`;
    }
    if (record.id === "compatibility-snapshot") {
      const snapshot = STUDIO_COMPATIBILITY_SNAPSHOT.snapshot;
      return snapshot
        ? `${snapshot.summary.passedCount}/${snapshot.summary.entryCount} entries / ${snapshot.summary.requiredCount} required / ${snapshot.summary.artifactCount} artifacts`
        : "tracked snapshot unavailable";
    }
    if (record.id === "package-analysis") {
      const report = this.importedPackageAnalysis;
      const reportV1 = this.importedPackageAnalysisV1;
      return report
        ? `${reportV1?.schemaVersion ?? report.schemaVersion} / ${report.sourceName} / ${reportV1?.checksum ?? report.checksum}`
        : "PackageAnalysis/v1 missing";
    }
    if (record.id === "architecture-boundaries") {
      const assessment = this.getStudioGateEvidenceAssessment(record.id);
      return assessment.evidence
        ? `${assessment.evidence.tool.name} / ${assessment.evidence.command} / ${assessment.evidence.digest}`
        : "GateEvidenceResult/v0 missing";
    }
    if (record.id === "source-write-receipt") {
      const receipt = this.studioSourceWriteReceipt;
      return receipt
        ? `${receipt.status} / ${receipt.reason} / ${receipt.digest}`
        : "SourceWriteReceipt/v0 missing";
    }
    return record.evidenceIds.slice(0, 2).join(" / ") || record.id;
  }

  private withBuildReadinessAction(record: BuildReadinessBaseRecord & Partial<StudioActionableFields>): BuildReadinessRecord {
    return {
      ...record,
      severity: record.severity ?? this.severityForStatus(record.status),
      affectedAssetId: record.affectedAssetId,
      affectedSystem: record.affectedSystem,
      impact: record.impact ?? record.detail,
      evidenceIds: record.evidenceIds ?? [],
      blockedBy: record.blockedBy ?? (record.state === "blocked" ? [record.id] : []),
      staleBecause: record.staleBecause,
      canExport: record.canExport ?? (record.state === "exportable" || record.state === "runnable"),
      nextAction: record.nextAction ?? {
        kind: record.state === "blocked" ? "open-evidence" : "open-build",
        label: record.state === "blocked" ? "Review blocking evidence" : "Review Build Center",
        targetId: record.id,
      },
    };
  }

  private getStoredTraceEvidenceStatus(entry: StoredTraceEvidenceEntry): {
    status: StudioStatus;
    current: boolean;
    missingSourcePackages: number;
    detail: string;
  } {
    const manifest = this.getGameProjectManifest();
    const sourcePackageById = new Map(manifest.sourcePackages.map((sourcePackage) => [sourcePackage.id, sourcePackage]));
    const missingSourcePackages = entry.sourcePackages.filter((sourcePackage) => {
      const current = sourcePackageById.get(sourcePackage.id);
      return sourcePackage.status !== "linked" || !current || current.status !== "linked";
    }).length;
    const entryMatches =
      entry.projectId === manifest.id &&
      entry.entry.p1 === manifest.entry.p1 &&
      entry.entry.p2 === manifest.entry.p2 &&
      entry.entry.stage === manifest.entry.stage;
    if (entry.artifact.status === "failed") {
      return { status: "fail", current: entryMatches && missingSourcePackages === 0, missingSourcePackages, detail: "stored trace failed" };
    }
    if (missingSourcePackages > 0) {
      return {
        status: "warn",
        current: false,
        missingSourcePackages,
        detail: `${missingSourcePackages} source package reference(s) are missing or stale`,
      };
    }
    if (!entryMatches) {
      return {
        status: "partial",
        current: false,
        missingSourcePackages,
        detail: `stored for ${entry.entry.p1} vs ${entry.entry.p2} on ${entry.entry.stage}`,
      };
    }
    return { status: "ok", current: true, missingSourcePackages: 0, detail: "matches current project entry" };
  }

  private getPersistedTraceComparisons(): StudioTraceEvidenceComparison[] {
    const current = this.lastTraceArtifact;
    return this.storedTraceEvidence.map((entry) => {
      const status = this.getStoredTraceEvidenceStatus(entry);
      const currentChecksum = current?.trace.checksum;
      const match: StudioTraceEvidenceComparison["match"] = !current ? "missing-current" : current.trace.checksum === entry.artifact.trace.checksum ? "same" : "different";
      const frameDelta = current ? entry.artifact.trace.frameCount - current.trace.frameCount : undefined;
      const eventDelta = current ? entry.artifact.trace.eventCount - current.trace.eventCount : undefined;
      const gateDelta = current ? entry.artifact.gates.length - current.gates.length : undefined;
      const passedGateDelta = current
        ? entry.artifact.gates.filter((gate) => gate.passed).length - current.gates.filter((gate) => gate.passed).length
        : undefined;
      const failedGateDelta = current
        ? entry.artifact.gates.filter((gate) => !gate.passed).length - current.gates.filter((gate) => !gate.passed).length
        : undefined;
      const combatReasonDelta = current ? entry.artifact.trace.combatReasonCount - current.trace.combatReasonCount : undefined;
      return {
        id: entry.id,
        projectId: entry.projectId,
        label: `${entry.projectName} / ${entry.artifact.target.label}`,
        checksum: entry.artifact.trace.checksum,
        currentChecksum,
        match,
        status: status.status,
        frameDelta,
        eventDelta,
        gateDelta,
        passedGateDelta,
        failedGateDelta,
        combatReasonDelta,
        summaryRows: this.getTraceMetricComparisons(entry.artifact, current),
        gateComparisons: this.getTraceGateComparisons(entry.artifact, current),
        detail: this.describeTraceComparison(match, { frameDelta, eventDelta, gateDelta, passedGateDelta }),
      };
    });
  }

  private getTraceMetricComparisons(stored: RuntimeTraceArtifact, current: RuntimeTraceArtifact | undefined): StudioTraceMetricComparison[] {
    return [
      this.traceMetricComparison("Frames", stored.trace.frameCount, current?.trace.frameCount),
      this.traceMetricComparison("Events", stored.trace.eventCount, current?.trace.eventCount),
      this.traceMetricComparison("Combat reasons", stored.trace.combatReasonCount, current?.trace.combatReasonCount),
      this.traceMetricComparison("Gates", stored.gates.length, current?.gates.length),
      this.traceMetricComparison(
        "Passed gates",
        stored.gates.filter((gate) => gate.passed).length,
        current ? current.gates.filter((gate) => gate.passed).length : undefined,
      ),
      this.traceMetricComparison(
        "Failed gates",
        stored.gates.filter((gate) => !gate.passed).length,
        current ? current.gates.filter((gate) => !gate.passed).length : undefined,
      ),
    ];
  }

  private traceMetricComparison(label: string, stored: number, current: number | undefined): StudioTraceMetricComparison {
    const delta = current === undefined ? undefined : stored - current;
    return {
      label,
      stored,
      current,
      delta,
      status: current === undefined ? "partial" : delta === 0 ? "ok" : "warn",
    };
  }

  private getTraceArtifactFrameSummaries(artifact: RuntimeTraceArtifact): RuntimeTraceArtifactFrameSummary[] {
    const trace = artifact.trace as RuntimeTraceArtifact["trace"] & { frames?: RuntimeTraceArtifactFrameSummary[] };
    if (trace.frames?.length) {
      return trace.frames;
    }
    return artifact.trace.frameChecksums.map((checksum, index) => ({
      frameIndex: index,
      tick: index,
      checksum,
      input: {
        p1: artifact.script?.[index]?.p1 ?? [],
        p2: artifact.script?.[index]?.p2,
        force: artifact.script?.[index]?.force ?? false,
      },
      actorCount: index === artifact.trace.frameChecksums.length - 1 ? artifact.trace.finalActors.length : 0,
      effectCount: index === artifact.trace.frameChecksums.length - 1 ? artifact.trace.finalEffects.length : 0,
      eventCategories: [...new Set(artifact.trace.events.filter((event) => event.frameIndex === index).map((event) => event.category))],
      combatReasons: [...new Set(artifact.trace.combatReasons.filter((reason) => reason.frameIndex === index).map((reason) => reason.reason))],
    }));
  }

  private getActiveTraceArtifact(): RuntimeTraceArtifact | undefined {
    return this.lastTraceArtifact ?? this.traceArtifacts[0] ?? this.storedTraceEvidence[0]?.artifact;
  }

  private getTraceFrameScrubberSummary(): StudioTraceFrameScrubberSummary {
    const artifact = this.getActiveTraceArtifact();
    if (!artifact) {
      return { selectedFrameIndex: 0, totalFrames: 0 };
    }
    const frames = this.getTraceArtifactFrameSummaries(artifact);
    const selectedFrameIndex = Math.min(Math.max(0, this.selectedTraceFrameIndex), Math.max(0, frames.length - 1));
    return {
      selectedFrameIndex,
      totalFrames: frames.length,
      selectedFrame: frames[selectedFrameIndex] ? structuredClone(frames[selectedFrameIndex]) : undefined,
    };
  }

  private getTraceGateComparisons(stored: RuntimeTraceArtifact, current: RuntimeTraceArtifact | undefined): StudioTraceGateComparison[] {
    const storedByLabel = new Map(stored.gates.map((gate) => [gate.label, gate]));
    const currentByLabel = new Map((current?.gates ?? []).map((gate) => [gate.label, gate]));
    const labels = [...new Set([...storedByLabel.keys(), ...currentByLabel.keys()])].sort((a, b) => a.localeCompare(b));
    return labels.map((label) => {
      const storedGate = storedByLabel.get(label);
      const currentGate = currentByLabel.get(label);
      const storedState = storedGate ? (storedGate.passed ? "passed" : "failed") : "missing";
      const currentState = currentGate ? (currentGate.passed ? "passed" : "failed") : "missing";
      const failuresMatch = (storedGate?.failures ?? []).join("\n") === (currentGate?.failures ?? []).join("\n");
      const status: StudioTraceGateComparison["status"] =
        storedState === currentState && failuresMatch ? "ok" : storedState === "missing" || currentState === "missing" ? "partial" : "warn";
      return {
        label,
        stored: storedState,
        current: currentState,
        status,
        storedFailures: [...(storedGate?.failures ?? [])],
        currentFailures: [...(currentGate?.failures ?? [])],
      };
    });
  }

  private describeTraceComparison(
    match: StudioTraceEvidenceComparison["match"],
    deltas: Pick<StudioTraceEvidenceComparison, "frameDelta" | "eventDelta" | "gateDelta" | "passedGateDelta">,
  ): string {
    if (match === "missing-current") {
      return "No current trace artifact is available for comparison.";
    }
    if (match === "same") {
      return "Checksum matches the current trace artifact.";
    }
    return `Diff vs current: frames ${formatSignedDelta(deltas.frameDelta)}, events ${formatSignedDelta(deltas.eventDelta)}, gates ${formatSignedDelta(deltas.gateDelta)}, passed gates ${formatSignedDelta(deltas.passedGateDelta)}.`;
  }

  private getStudioEvidenceRecords(): StudioEvidenceRecord[] {
    const summary = this.getStudioProjectSummary();
    const records: StudioEvidenceRecord[] = [];
    for (const gate of summary.gates) {
      const gateEvidence = gate.id === "architecture-boundaries"
        ? this.getStudioGateEvidenceAssessment(gate.id)
        : undefined;
      records.push({
        id: `gate:${gate.id}`,
        label: gate.label,
        category: "gate",
        status: gateEvidence?.status ?? gate.status,
        detail: gateEvidence?.detail ?? gate.detail,
        tags: ["acceptance-gate", gate.id],
        severity: gateEvidence ? this.severityForStatus(gateEvidence.status) : gate.severity,
        affectedAssetId: gate.affectedAssetId,
        affectedSystem: gate.affectedSystem,
        impact: gate.impact,
        evidenceIds: [...gate.evidenceIds, ...(gateEvidence?.evidenceIds ?? [])],
        blockedBy: gateEvidence?.blockedBy ?? gate.blockedBy,
        staleBecause: gateEvidence?.freshness.state === "stale" ? gateEvidence.freshness.detail : gate.staleBecause,
        canExport: gateEvidence?.canExport ?? gate.canExport,
        nextAction: gateEvidence?.status === "ok"
          ? gate.nextAction
          : { kind: "open-evidence", label: "Review boundary evidence", targetId: "test:architecture-boundaries" },
      });
    }
    for (const asset of summary.assets) {
      records.push({
        id: `asset:${asset.id}`,
        label: asset.label,
        category: "asset",
        status: asset.status,
        detail: `${asset.kind} / ${asset.source} / ${asset.detail}`,
        tags: [asset.id, asset.kind, asset.source, ...asset.tags],
        severity: asset.severity,
        affectedAssetId: asset.affectedAssetId ?? asset.id,
        affectedSystem: asset.affectedSystem,
        impact: asset.impact,
        evidenceIds: asset.evidenceIds,
        blockedBy: asset.blockedBy,
        staleBecause: asset.staleBecause,
        canExport: asset.canExport,
        nextAction: asset.nextAction,
      });
    }
    records.push(...this.getCompileEvidenceRecords());
    records.push(...this.getTraceEvidenceRecords());
    records.push(...this.getCompatibilityEvidenceRecords());
    records.push(this.getCompatibilitySnapshotEvidenceRecord());
    if (this.importedPackageAnalysis && this.importedPackageAnalysisV1) {
      records.push(this.getPackageAnalysisEvidenceRecord(this.importedPackageAnalysis));
    }
    if (this.studioSourceWriteReceipt) {
      records.push(this.getSourceWriteReceiptEvidenceRecord(this.studioSourceWriteReceipt));
    }
    records.push(...this.getDiagnosticsEvidenceRecords());
    return records;
  }

  private getPackageAnalysisEvidenceRecord(report: PackageAnalysisResult): StudioEvidenceRecord {
    const reportV1 = this.importedPackageAnalysisV1;
    const status: StudioStatus = report.status === "recognized" ? "ok" : report.status === "partial" ? "warn" : "pending";
    const ikemen = report.profiles.ikemen;
    const envelopeChecksum = reportV1?.checksum ?? report.checksum;
    const semanticDigest = reportV1?.semanticDigest ?? "missing";
    const sourceDigest = reportV1?.source.package.digest ?? "missing";
    return {
      id: "package-analysis",
      label: "Package Analysis",
      category: "analysis",
      status,
      detail: `${report.summary.recognizedFileCount}/${report.summary.fileCount} recognized files / ${report.summary.findingCount} findings / ${ikemen.detected ? `${ikemen.findingCount} IKEMEN scanner findings` : "no IKEMEN profile"} / semantic ${semanticDigest} / ${envelopeChecksum}`,
      tags: ["package-analysis/v1", report.status, envelopeChecksum, semanticDigest, sourceDigest, ikemen.claim, ...(ikemen.detected ? ["ikemen-go-scan"] : [])],
      level: "Scanner-only",
      severity: this.severityForStatus(status),
      affectedSystem: "parser",
      impact: "Package findings are source-located scanner evidence; they do not claim IKEMEN runtime execution or rendering parity.",
      evidenceIds: [
        `package-analysis:${envelopeChecksum}`,
        `package-analysis:semantic:${semanticDigest}`,
        `package-analysis:source:${sourceDigest}`,
        ...report.findings.slice(0, 4).map((finding) => `package-analysis:${finding.location.path}`),
      ],
      blockedBy: report.status === "unknown" ? ["package-analysis-entrypoint"] : [],
      canExport: true,
      nextAction: {
        kind: status === "ok" ? "open-build" : "open-evidence",
        label: status === "ok" ? "Review package analysis" : "Review scanner findings",
        targetId: "package-analysis",
      },
    };
  }

  private getSourceWriteReceiptEvidenceRecord(receipt: SourceWriteReceipt): StudioEvidenceRecord {
    const committed = isSourceWriteReceiptCommitted(receipt);
    const status: StudioStatus = committed
      ? "ok"
      : receipt.status === "failed"
        ? "fail"
        : receipt.status === "blocked"
          ? "blocked"
          : "warn";
    return {
      id: receipt.id,
      label: "Source Write Receipt",
      category: "source",
      status,
      detail: `${receipt.sourceName} / ${receipt.path} / ${receipt.status} / ${receipt.reason} / ${receipt.digest}`,
      tags: ["source-write-receipt/v0", receipt.status, receipt.reason, receipt.sourcePackageId, receipt.digest],
      level: committed ? "Committed" : "Guarded",
      severity: this.severityForStatus(status),
      affectedSystem: "studio",
      impact: committed
        ? "The edited source bytes were written through the directory handle and explicitly reimported into the active project."
        : "The source write did not reach a committed write-and-reimport state; the receipt keeps the blocking reason exportable as diagnostic evidence.",
      evidenceIds: [receipt.id, `source-write-digest:${receipt.digest}`, `source-package:${receipt.sourcePackageId}`],
      blockedBy: committed ? [] : [`source-write:${receipt.reason}`],
      canExport: committed,
      nextAction: {
        kind: committed ? "open-build" : "open-evidence",
        label: committed ? "Review source write receipt" : "Review source write blocker",
        targetId: receipt.id,
      },
    };
  }

  private getCompileEvidenceRecords(): StudioEvidenceRecord[] {
    const compiled = this.lastCompiledProject;
    const architectureEvidence = this.getStudioGateEvidenceAssessment("architecture-boundaries");
    const architectureBoundaryEvidence: StudioEvidenceRecord = {
      id: "test:architecture-boundaries",
      label: "Architecture Boundaries",
      category: "compile",
      status: architectureEvidence.status,
      detail: architectureEvidence.detail,
      tags: ["architecture-boundaries", "module-contracts", "renderer-independent", "vitest", "gate-evidence/v0"],
      level: "Guarded",
      severity: this.severityForStatus(architectureEvidence.status),
      affectedSystem: "module",
      impact: "Makes the modular port strategy visible in Studio Evidence instead of only living in test output.",
      evidenceIds: ["src/tests/ArchitectureBoundaries.test.ts", "src/engine/ModuleContracts.ts", ...architectureEvidence.evidenceIds],
      blockedBy: architectureEvidence.blockedBy,
      staleBecause: architectureEvidence.freshness.state === "stale" ? architectureEvidence.freshness.detail : undefined,
      canExport: architectureEvidence.canExport,
      nextAction: {
        kind: architectureEvidence.status === "ok" ? "open-build" : "open-evidence",
        label: architectureEvidence.status === "ok" ? "Review Build readiness" : "Review gate evidence",
        targetId: "architecture-boundaries",
      },
    };
    if (!compiled) {
      return [
        {
          id: "compile:runtime-manifest",
          label: "Runtime Manifest",
          category: "compile",
          status: "pending",
          detail: "Compile the current project before export/playtest packaging can be trusted.",
          tags: ["runtime-manifest/v0", "build-center"],
          level: "Compiled",
        },
        architectureBoundaryEvidence,
      ];
    }
    const status: StudioStatus = compiled.diagnostics.errors.length ? "fail" : compiled.diagnostics.warnings.length ? "warn" : "ok";
    return [
      {
        id: "compile:runtime-manifest",
        label: "Runtime Manifest",
        category: "compile",
        status,
        detail: `${compiled.modules.active.length} active / ${compiled.modules.planned.length} planned / ${compiled.modules.missing.length} missing modules`,
        tags: ["runtime-manifest/v0", compiled.schemaVersion],
        level: "Compiled",
      },
      architectureBoundaryEvidence,
      ...compiled.diagnostics.errors.map((message, index) => ({
        id: `compile:error:${index}`,
        label: "Compile Error",
        category: "compile" as const,
        status: "fail" as const,
        detail: message,
        tags: ["runtime-manifest/v0", "error"],
        level: "Unknown",
      })),
      ...compiled.diagnostics.warnings.map((message, index) => ({
        id: `compile:warning:${index}`,
        label: "Compile Warning",
        category: "compile" as const,
        status: "warn" as const,
        detail: message,
        tags: ["runtime-manifest/v0", "warning"],
        level: "Compiled",
      })),
    ];
  }

  private getTraceEvidenceRecords(): StudioEvidenceRecord[] {
    const persistedRecords = this.getPersistedTraceEvidenceRecords();
    if (!this.traceArtifacts.length) {
      return [
        {
        id: "trace:smoke",
        label: "Runtime Trace Artifact",
        category: "trace" as const,
        status: "pending" as const,
          detail: "Export a smoke trace artifact to capture script, checksum, final actors, events, and gate results.",
          tags: ["runtime-trace-artifact/v0", "qa"],
          level: "Executed Partial",
        },
        ...persistedRecords,
      ];
    }
    return [
      ...this.traceArtifacts.flatMap((artifact, artifactIndex) => [
      {
        id: `trace:${artifactIndex}:${artifact.target.id}:${artifact.trace.checksum}`,
        label: artifactIndex === 0 ? `Latest: ${artifact.target.label}` : artifact.target.label,
        category: "trace" as const,
        status: artifact.status === "passed" ? ("ok" as const) : ("fail" as const),
        detail: `${artifact.trace.frameCount} frames / ${artifact.trace.eventCount} events / checksum ${artifact.trace.checksum}`,
        tags: [artifact.schemaVersion, artifact.target.source, artifact.target.id],
        level: "Executed Partial",
      },
      ...artifact.gates.map((gate) => ({
        id: `trace:${artifactIndex}:${artifact.target.id}:${artifact.trace.checksum}:${gate.label}`,
        label: gate.label,
        category: "trace" as const,
        status: gate.passed ? ("ok" as const) : ("fail" as const),
        detail: gate.failures.length ? gate.failures.join("; ") : "gate passed",
        tags: ["trace-gate", artifact.trace.checksum],
        level: "Executed Partial",
      })),
      ]),
      ...persistedRecords,
    ];
  }

  private getPersistedTraceEvidenceRecords(): StudioEvidenceRecord[] {
    return this.storedTraceEvidence.map((entry) => {
      const status = this.getStoredTraceEvidenceStatus(entry);
      return {
        id: `persisted-trace:${entry.id}`,
        label: `Persisted: ${entry.artifact.target.label}`,
        category: "trace",
        status: status.status,
        detail: `${entry.projectName} / ${entry.artifact.trace.checksum} / ${status.detail}`,
        tags: ["persisted", "runtime-trace-artifact/v0", entry.projectId, entry.artifact.trace.checksum],
        level: "Executed Partial",
        severity: this.severityForStatus(status.status),
        affectedSystem: "studio",
        impact: status.current
          ? "Persisted trace evidence matches the current project entry and can support comparison."
          : "Persisted trace evidence is stale for the current project entry and should not be treated as fresh proof.",
        evidenceIds: [`trace:${entry.artifact.trace.checksum}`],
        blockedBy: status.current ? [] : ["stale-evidence"],
        staleBecause: status.current ? undefined : status.detail,
        canExport: true,
        nextAction: {
          kind: status.current ? "open-evidence" : "run-trace",
          label: status.current ? "Compare persisted trace" : "Refresh trace evidence",
          targetId: entry.id,
        },
      };
    });
  }

  private getCompatibilityEvidenceRecords(): StudioEvidenceRecord[] {
    const records: StudioEvidenceRecord[] = [];
    if (this.character) {
      const report = this.withSessionCompatibility(this.character.compatibility);
      records.push(
        {
          id: "compat:character-files",
          label: `${report.character} files`,
          category: "compatibility",
          status: report.loaded ? "ok" : "fail",
          detail: `DEF ${report.files.def} / SFF ${report.files.sff} / AIR ${report.files.air} / CMD ${report.files.cmd} / CNS ${report.files.cns}`,
          tags: ["mugen-import", "files"],
          level: "Parsed",
        },
        {
          id: "compat:sprites",
          label: "Decoded Sprites",
          category: "compatibility",
          status: (this.character.spriteArchive?.sprites.length ?? 0) > 0 ? "ok" : "warn",
          detail: `${this.character.spriteArchive?.sprites.length ?? 0}/${this.character.spriteArchive?.metadata?.spriteTotal ?? 0} imported sprites decoded`,
          tags: ["sff", "sprite-decode"],
          level: "Decoded",
        },
        {
          id: "compat:states",
          label: "CNS State Coverage",
          category: "compatibility",
          status: report.states.runtimeRoutable > 0 ? "ok" : report.states.parsed > 0 ? "warn" : "pending",
          detail: `${report.states.parsed} parsed / ${report.states.compiled} compiled / ${report.states.runtimeRoutable} routable / ${report.states.executed} executed`,
          tags: ["cns", "state-controller"],
          level: "Executed Partial",
        },
        {
          id: "compat:unsupported-triggers",
          label: "Unsupported Triggers",
          category: "compatibility",
          status: report.triggers.unsupported > 0 ? "warn" : "ok",
          detail: `${report.triggers.unsupported}/${report.triggers.total} unsupported trigger expressions`,
          tags: ["trigger", "unsupported"],
          level: "Unsupported",
        },
      );
      if (report.profiles.ikemen.detected) {
        records.push({
          id: "compat:ikemen-scan",
          label: "IKEMEN Profile Scan",
          category: "compatibility",
          status: "unsupported",
          detail: report.profiles.ikemen.summary,
          tags: ["ikemen-go-scan", "unsupported", "scanner"],
          level: "Recognized + Unsupported",
          severity: "warning",
          affectedSystem: "parser",
          impact: "IKEMEN-only content is visible as scanner evidence and is intentionally excluded from runtime execution.",
          evidenceIds: report.profiles.ikemen.findings.slice(0, 6).map((finding) => finding.location),
          blockedBy: ["ikemen-runtime-profile"],
          canExport: true,
          nextAction: {
            kind: "open-evidence",
            label: "Review IKEMEN findings",
            targetId: "compat:ikemen-scan",
          },
        });
      }
    }
    for (const report of this.getStageCompatibilityReports()) {
      records.push({
        id: `compat:stage:${report.stage}`,
        label: `${report.stage} stage`,
        category: "compatibility",
        status: report.errors.length ? "fail" : report.warnings.length ? "warn" : "ok",
        detail: `${report.backgrounds.renderedSprites}/${report.backgrounds.withSpriteRefs} BG sprite refs rendered, ${report.backgrounds.renderedAnimated}/${report.backgrounds.animated} animated`,
        tags: ["stage", "stage-def", "bg"],
        level: "Decoded",
      });
    }
    return records;
  }

  private getCompatibilitySnapshotStudioStatus(): StudioStatus {
    if (STUDIO_COMPATIBILITY_SNAPSHOT.status === "passed") {
      return "ok";
    }
    if (STUDIO_COMPATIBILITY_SNAPSHOT.status === "partial") {
      return "partial";
    }
    if (STUDIO_COMPATIBILITY_SNAPSHOT.status === "failed") {
      return "fail";
    }
    return "pending";
  }

  private getCompatibilitySnapshotEvidenceRecord(): StudioEvidenceRecord {
    const snapshot = STUDIO_COMPATIBILITY_SNAPSHOT.snapshot;
    const status = this.getCompatibilitySnapshotStudioStatus();
    const diagnostics = STUDIO_COMPATIBILITY_SNAPSHOT.diagnostics;
    const detail = snapshot
      ? `${snapshot.summary.passedCount}/${snapshot.summary.entryCount} entries passed / ${snapshot.summary.requiredCount} required / ${snapshot.summary.artifactCount} artifacts / semantic ${snapshot.semanticDigest}`
      : diagnostics.join("; ") || "Tracked compatibility snapshot is unavailable.";
    return {
      id: "compat:snapshot",
      label: "Promoted Compatibility Snapshot",
      category: "compatibility",
      status,
      detail,
      tags: ["compatibility-corpus", "promoted", "rebuild-and-verify", ...(snapshot ? [snapshot.schemaVersion, snapshot.semanticDigest] : [])],
      level: "Promoted Checkpoint",
      severity: this.severityForStatus(status),
      affectedSystem: "runtime",
      impact:
        status === "ok"
          ? "The tracked corpus snapshot makes the repository-owned character and stage journey visible to Studio Evidence and Build."
          : "The tracked corpus snapshot cannot support a clean compatibility claim until its materialization diagnostics are resolved.",
      evidenceIds: snapshot
        ? [`snapshot:${snapshot.semanticDigest}`, `checksum:${snapshot.checksum}`, ...snapshot.summary.artifactIds]
        : [],
      blockedBy: status === "ok" || status === "partial" ? [] : diagnostics.length ? diagnostics : ["compatibility-snapshot"],
      canExport: status !== "fail" && status !== "pending",
      nextAction: {
        kind: status === "ok" ? "open-build" : "open-evidence",
        label: status === "ok" ? "Review promoted snapshot" : "Review snapshot diagnostics",
        targetId: "compat:snapshot",
      },
    };
  }

  private getDiagnosticsEvidenceRecords(): StudioEvidenceRecord[] {
    const diagnostics = [...(this.character?.diagnostics ?? []), ...this.importedStages.flatMap((stage) => stage.diagnostics)];
    return diagnostics.slice(0, 20).map((diagnostic, index) => ({
      id: `diagnostic:${index}:${diagnostic.file ?? "runtime"}`,
      label: diagnostic.message,
      category: "diagnostic",
      status: diagnostic.severity === "error" ? "fail" : diagnostic.severity === "warning" ? "warn" : "ok",
      detail: [diagnostic.format ?? "loader", diagnostic.file, diagnostic.line ? `line ${diagnostic.line}` : ""].filter(Boolean).join(" / "),
      tags: [diagnostic.format ?? "loader", diagnostic.severity],
      level: diagnostic.severity === "info" ? "Recognized" : "Unknown",
    }));
  }

  private getFilteredEvidenceRecords(evidence: StudioEvidenceSummary): StudioEvidenceRecord[] {
    if (evidence.activeFilter === "all") {
      return evidence.records;
    }
    if (evidence.activeFilter === "attention") {
      return evidence.records.filter((record) => isAttentionStatus(record.status));
    }
    return evidence.records.filter((record) => record.category === evidence.activeFilter);
  }

  private getEvidenceFilterCount(filter: StudioEvidenceFilter, evidence: StudioEvidenceSummary): number {
    if (filter === "all") {
      return evidence.records.length;
    }
    if (filter === "attention") {
      return evidence.records.filter((record) => isAttentionStatus(record.status)).length;
    }
    return evidence.records.filter((record) => record.category === filter).length;
  }

  private getAssetFilterCount(filter: StudioAssetFilter, library: StudioAssetLibrarySummary): number {
    if (filter === "all") {
      return library.assets.length;
    }
    if (filter === "attention") {
      return library.assets.filter((asset) => isAttentionStatus(asset.status)).length;
    }
    if (filter === "characters") {
      return library.assets.filter((asset) => asset.kind === "character" || asset.kind === "sprite-atlas").length;
    }
    if (filter === "stages") {
      return library.assets.filter((asset) => asset.kind === "stage").length;
    }
    if (filter === "generated") {
      return library.assets.filter((asset) => asset.source === "generated").length;
    }
    if (filter === "imported") {
      return library.assets.filter((asset) => asset.source === "mugen-import").length;
    }
    if (filter === "reports") {
      return library.assets.filter((asset) => asset.kind === "report").length;
    }
    return library.selectedAsset ? 1 : 0;
  }

  private renderEvidenceFilterButton(filter: StudioEvidenceFilter, evidence: StudioEvidenceSummary): string {
    const label = filter === "attention" ? "Attention" : filter === "compatibility" ? "Compat" : filter === "all" ? "All" : filter[0]!.toUpperCase() + filter.slice(1);
    const count = this.getEvidenceFilterCount(filter, evidence);
    return `
      <button type="button" role="tab" aria-selected="${this.studioEvidenceFilter === filter}" class="tab ${this.studioEvidenceFilter === filter ? "is-active" : ""}" data-evidence-filter="${filter}">
        <span class="tab-label">${escapeHtml(label)}</span>
        <span class="tab-count">${count}</span>
      </button>
    `;
  }

  private renderAssetFilterButton(filter: StudioAssetFilter, library: StudioAssetLibrarySummary): string {
    const labelByFilter: Record<StudioAssetFilter, string> = {
      all: "All",
      attention: "Needs",
      characters: "Chars",
      stages: "Stages",
      generated: "Gen",
      imported: "Import",
      reports: "Reports",
      selected: "Selected",
    };
    const label = labelByFilter[filter];
    const count = this.getAssetFilterCount(filter, library);
    return `
      <button type="button" role="tab" aria-selected="${this.studioAssetFilter === filter}" class="tab ${this.studioAssetFilter === filter ? "is-active" : ""}" data-asset-filter="${filter}">
        <span class="tab-label">${escapeHtml(label)}</span>
        <span class="tab-count">${count}</span>
      </button>
    `;
  }

  private renderEvidenceRecord(record: StudioEvidenceRecord): string {
    const statusClass = this.statusClassName(record.status);
    return `
      <div class="list-item evidence-record is-${statusClass}">
        <span class="evidence-record-main">
          <span class="record-kicker">${escapeHtml(record.category)} / ${escapeHtml(record.level ?? "unleveled")}</span>
          <span class="list-title">${escapeHtml(record.label)}</span>
          <span class="list-meta">${escapeHtml(record.detail)}</span>
          ${record.impact ? `<span class="record-route"><b>Impact</b><span>${escapeHtml(record.impact)}</span></span>` : ""}
          ${record.nextAction ? `<span class="record-route"><b>Next</b><span>${escapeHtml(record.nextAction.label)}</span></span>` : ""}
          <span class="badge-row record-evidence">
            ${record.tags.slice(0, 4).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
          </span>
        </span>
        <span class="record-side">
          ${this.statusBadge(record.status)}
          ${record.canExport !== undefined ? `<span class="badge ${record.canExport ? "ok" : "warn"}">${record.canExport ? "exportable" : "blocked"}</span>` : ""}
        </span>
      </div>
    `;
  }

  private renderStudioAsset(asset: StudioProjectSummary["assets"][number], options: { selectable?: boolean; selected?: boolean } = {}): string {
    const tagAttributes = options.selectable ? ` data-studio-asset-id="${escapeHtml(asset.id)}"` : "";
    const tagName = options.selectable ? "button" : "div";
    const selectedClass = options.selected ? " is-selected" : "";
    const statusClass = this.statusClassName(asset.status);
    const iconName = iconForAssetRecord(asset);
    return `
      <${tagName} ${options.selectable ? 'type="button"' : ""} class="list-item asset-row is-${statusClass}${selectedClass}"${tagAttributes}>
        <span class="asset-row-icon">${tablerIcon(iconName, "ui-icon")}</span>
        <span class="asset-row-main">
          <span class="asset-row-title">
            <span class="list-title">${escapeHtml(asset.label)}</span>
            <span class="asset-row-kind">${escapeHtml(asset.kind)} / ${escapeHtml(asset.source)}</span>
          </span>
          <span class="list-meta asset-row-detail">${escapeHtml(asset.detail)}</span>
          <span class="asset-row-action">Next: ${escapeHtml(asset.nextAction.label)}</span>
          <span class="badge-row">
            <span class="badge ${asset.canExport ? "ok" : "warn"}">${asset.canExport ? "exportable" : "blocked"}</span>
            ${asset.tags.slice(0, 4).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
          </span>
        </span>
        <span class="asset-row-side">
          ${this.statusBadge(asset.status)}
          <span class="asset-row-export ${asset.canExport ? "is-ok" : "is-warn"}">${asset.canExport ? "ship" : "hold"}</span>
        </span>
      </${tagName}>
    `;
  }

  private studioStat(label: string, value: number | string): string {
    return `
      <div class="studio-stat">
        <strong>${escapeHtml(String(value))}</strong>
        <span>${escapeHtml(label)}</span>
      </div>
    `;
  }

  private iconForStudioTrustLane(lane: StudioTrustLane): StudioIconName {
    const icons: Record<StudioTrustLane, StudioIconName> = {
      runtime: "server",
      source: "folder",
      assets: "assets",
      qa: "evidence",
      build: "build",
      compat: "shield",
      architecture: "modules",
    };
    return icons[lane];
  }

  private labelForStudioTrustLane(lane: StudioTrustLane): string {
    const labels: Record<StudioTrustLane, string> = {
      runtime: "Runtime",
      source: "Source",
      assets: "Assets",
      qa: "QA",
      build: "Build",
      compat: "Compat",
      architecture: "Arch",
    };
    return labels[lane];
  }

  private statusBadge(status: StudioProjectSummary["gates"][number]["status"]): string {
    const className = status === "ok" || status === "active" ? "ok" : status === "fail" || status === "blocked" || status === "unsupported" ? "error" : status === "planned" ? "" : "warn";
    return `<span class="badge status-badge status-${escapeHtml(status)} ${className}">${tablerIcon(iconForStatus(status), "ui-icon status-icon")}<span>${escapeHtml(status)}</span></span>`;
  }

  private statusClassName(status: StudioStatus): string {
    if (status === "ok" || status === "active") {
      return "ok";
    }
    if (status === "fail" || status === "blocked" || status === "unsupported") {
      return "error";
    }
    if (status === "planned") {
      return "planned";
    }
    return "warn";
  }

  private severityForStatus(status: StudioStatus): StudioActionableFields["severity"] {
    if (status === "fail" || status === "blocked" || status === "unsupported") {
      return "error";
    }
    if (status === "warn" || status === "partial" || status === "pending" || status === "unknown") {
      return "warning";
    }
    if (status === "planned") {
      return "notice";
    }
    return "info";
  }

  private formatReplacementRole(role: StudioAssetReplacementRole): string {
    if (role === "p1") {
      return "P1";
    }
    if (role === "p2") {
      return "P2";
    }
    if (role === "stage") {
      return "Stage";
    }
    if (role === "unsupported") {
      return "Unsupported";
    }
    return "Unbound";
  }

  private getPreferredAssetFilter(asset: StudioAssetRecord): StudioAssetFilter {
    if (asset.source === "generated") {
      return "generated";
    }
    if (asset.source === "mugen-import") {
      return "imported";
    }
    if (asset.kind === "stage") {
      return "stages";
    }
    if (asset.kind === "character" || asset.kind === "sprite-atlas") {
      return "characters";
    }
    if (asset.kind === "report" || asset.kind === "sound") {
      return "reports";
    }
    return "all";
  }

  private renderMatchNavigator(): string {
    const p1 = this.snapshot.actors[0];
    const p2 = this.snapshot.actors[1];
    return `
      <div class="section section-emphasis match-setup-panel">
        <div class="section-heading-row">
          <h2>Match Setup</h2>
          <span class="badge">${this.getAvailableFighters().length} fighters</span>
        </div>
        <div class="match-select-grid">
          <label class="field">
            <span class="list-meta">P1</span>
            <select data-fighter-select="p1">${this.renderFighterOptions(this.selectedP1)}</select>
          </label>
          <label class="field">
            <span class="list-meta">CPU</span>
            <select data-fighter-select="p2">${this.renderFighterOptions(this.selectedP2)}</select>
          </label>
          <label class="field field-wide">
            <span class="list-meta">Stage</span>
            <select data-stage-select="stage">${this.renderStageOptions()}</select>
          </label>
        </div>
        <div class="match-card">
          <div>
            <strong>${escapeHtml(p1?.label ?? "P1")}</strong>
            <span class="list-meta">Life ${p1?.runtime.life ?? 0} / Power ${p1?.runtime.power ?? 0}</span>
          </div>
          <span class="versus">VS</span>
          <div>
            <strong>${escapeHtml(p2?.label ?? "CPU")}</strong>
            <span class="list-meta">Life ${p2?.runtime.life ?? 0} / Power ${p2?.runtime.power ?? 0}</span>
          </div>
        </div>
      </div>
      <details class="section collapsible-section match-help-section">
        <summary>
          <span>Controls</span>
          <small>keyboard</small>
        </summary>
        <div class="collapsible-body">
          <div class="control-grid">
            ${this.controlChip("Arrows", "walk / jump / crouch")}
            ${this.controlChip("A S D", "punch buttons")}
            ${this.controlChip("Z X C", "kick buttons")}
            ${this.controlChip("Enter", "start")}
          </div>
        </div>
      </details>
      <div class="section">
        <div class="section-heading-row">
          <h2>Roster</h2>
          <span class="badge">${this.getAvailableFighters().length}</span>
        </div>
        <div class="list">
          ${this.getAvailableFighters()
            .map((fighter) => this.renderFighterCard(fighter.id))
            .join("")}
        </div>
      </div>
    `;
  }

  private renderFighterOptions(selectedId: string): string {
    return this.getAvailableFighters()
      .map(
        (fighter) =>
          `<option value="${escapeHtml(fighter.id)}" ${fighter.id === selectedId ? "selected" : ""}>${escapeHtml(
            fighter.displayName,
          )}</option>`,
      )
      .join("");
  }

  private renderStageOptions(): string {
    return this.getAvailableStages()
      .map(
        (stage) =>
          `<option value="${escapeHtml(stage.id)}" ${stage.id === this.selectedStageId ? "selected" : ""}>${escapeHtml(
            stage.displayName,
          )}</option>`,
      )
      .join("");
  }

  private renderFighterCard(fighterId: string): string {
    const fighter = this.findFighter(fighterId);
    if (!fighter) {
      return "";
    }
    const selected = fighter.id === this.selectedP1 || fighter.id === this.selectedP2;
    const isImported = fighter.source === "imported";
    return `
      <div class="list-item ${selected ? "is-selected" : ""}">
        <span>
          <span class="list-title">${escapeHtml(fighter.displayName)}</span>
          <span class="list-meta">Speed ${fighter.speed.toFixed(1)} / Jump ${Math.abs(fighter.jumpVelocity).toFixed(1)}</span>
          <span class="badge-row">
            <span class="badge">idle</span>
            <span class="badge">walk</span>
            <span class="badge">jump</span>
            ${
              isImported
                ? `<span class="badge ok">imported AIR/SFF</span>`
                : `<span class="badge ${this.atlasStatusByFighter.get(fighter.id) === "loaded" ? "ok" : "warn"}">atlas ${
                    this.atlasStatusByFighter.get(fighter.id) ?? "loading"
                  }</span>`
            }
            ${isImported ? "" : this.renderMotionQaBadge(fighter.id)}
            <span class="badge ok">punch ${fighter.moves.punch.damage}</span>
            <span class="badge ok">kick ${fighter.moves.kick.damage}</span>
          </span>
        </span>
        <span class="swatch" style="--swatch: ${escapeHtml(fighter.palette)}"></span>
      </div>
    `;
  }

  private controlChip(keys: string, action: string): string {
    return `
      <div class="control-chip">
        <kbd>${escapeHtml(keys)}</kbd>
        <span>${escapeHtml(action)}</span>
      </div>
    `;
  }

  private renderLoadStatus(): string {
    const report = this.character?.compatibility;
    if (!report) {
      return `
        <div class="loader-status">
          <div class="badge-row">
            <span class="badge active">Waiting for character</span>
            <span class="badge warn">No imported files</span>
          </div>
        </div>
      `;
    }
    const decodedSprites = this.character?.spriteArchive?.sprites.length ?? 0;
    const spriteTotal = this.character?.spriteArchive?.metadata?.spriteTotal ?? decodedSprites;
    const decodedSounds = this.character?.soundArchive?.metadata.decodedTotal ?? 0;
    const soundTotal = this.character?.soundArchive?.metadata.soundTotal ?? 0;
    return `
      <div class="loader-status">
        <div class="file-status-grid">
          ${this.fileBadge("DEF", report.files.def)}
          ${this.fileBadge("AIR", report.files.air)}
          ${this.fileBadge("SFF", report.files.sff, decodedSprites < spriteTotal)}
          ${this.fileBadge("CMD", report.files.cmd)}
          ${this.fileBadge("CNS", report.files.cns)}
          ${this.fileBadge("SND", report.files.snd, soundTotal > 0 && decodedSounds < soundTotal)}
          ${this.importedFighter ? `<span class="badge ok">Runtime route</span>` : `<span class="badge warn">Inspector only</span>`}
          ${report.profiles.ikemen.detected ? `<span class="badge warn">IKEMEN scan ${report.profiles.ikemen.findings.length}</span>` : ""}
          ${this.importedStages.length > 0 ? `<span class="badge ok">${this.importedStages.length} stage${this.importedStages.length === 1 ? "" : "s"}</span>` : ""}
        </div>
      </div>
    `;
  }

  private fileBadge(label: string, present: boolean, partial = false): string {
    const className = present ? (partial ? "warn" : "ok") : "error";
    return `<span class="badge ${className}">${label}</span>`;
  }

  private renderTab(tab: NavigatorTab, label: string): string {
    return `<button type="button" role="tab" aria-selected="${this.activeTab === tab}" class="tab ${this.activeTab === tab ? "is-active" : ""}" data-tab="${tab}">${label}</button>`;
  }

  private renderAnimations(): string {
    const sourceActions = this.character ? [...this.character.animations.values()] : [...createFixtureAnimations().values()];
    const filter = this.navigatorFilter.trim().toLowerCase();
    const filteredActions = sourceActions.filter((action) => {
      if (!filter) {
        return true;
      }
      return String(action.id).includes(filter) || action.frames.some((frame) => `${frame.spriteGroup},${frame.spriteIndex}`.includes(filter));
    });
    if (sourceActions.length === 0) {
      return `<div class="empty-state">No AIR actions parsed.</div>`;
    }
    if (filteredActions.length === 0) {
      return `<div class="empty-state">No actions match this filter.</div>`;
    }
    return `
      <div class="list">
        ${filteredActions
          .sort((a, b) => a.id - b.id)
          .map(
            (action) => `
              <button type="button" class="list-item ${action.id === this.snapshot.selectedActionId ? "is-selected" : ""}" data-action-id="${action.id}">
                <span>
                  <span class="list-title">Action ${action.id}</span>
                  <span class="list-meta">${action.frames.length} frames</span>
                  <span class="badge-row">
                    ${action.id === this.snapshot.selectedActionId ? `<span class="badge active">Selected</span>` : ""}
                    <span class="badge ${action.frames.some((frame) => frame.clsn1.length) ? "ok" : ""}">Clsn1</span>
                    <span class="badge ${action.frames.some((frame) => frame.clsn2.length) ? "ok" : ""}">Clsn2</span>
                    ${action.loopStart !== undefined ? `<span class="badge ok">Loop ${action.loopStart}</span>` : ""}
                  </span>
                </span>
                <span class="list-meta">${action.frames[0] ? `${action.frames[0].spriteGroup},${action.frames[0].spriteIndex}` : "-"}</span>
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  }

  private renderStates(): string {
    const filter = this.navigatorFilter.trim().toLowerCase();
    const allStates = this.character?.states ?? [];
    const states = allStates.filter((state) => this.stateMatchesFilter(state, filter));
    const executedStates = new Set(this.snapshot.compatibilitySession?.actors.flatMap((actor) => actor.executedStates) ?? []);
    const animations = this.character?.animations ?? new Map<number, MugenAnimationAction>();
    if (allStates.length === 0) {
      return `<div class="empty-state">No CNS/ST states parsed yet.</div>`;
    }
    if (states.length === 0) {
      return `<div class="empty-state">No states match this filter.</div>`;
    }
    let sortedStates = states.slice().sort((a, b) => a.id - b.id);
    if (this.selectedInspectorStateId !== undefined) {
      const selectedState = allStates.find((state) => state.id === this.selectedInspectorStateId);
      if (selectedState) {
        sortedStates = [selectedState, ...sortedStates.filter((state) => state.id !== selectedState.id)];
      }
    }
    const visibleStates = sortedStates.slice(0, 160);
    return `
      <div class="list">
        ${visibleStates.map((state) => this.renderStateListItem(state, animations, executedStates)).join("")}
      </div>
      ${
        visibleStates.length < sortedStates.length
          ? `<div class="list-footnote">Showing ${visibleStates.length} of ${sortedStates.length} matching states. Narrow the filter to inspect more.</div>`
          : ""
      }
    `;
  }

  private stateMatchesFilter(state: MugenStateDef, filter: string): boolean {
    if (!filter) {
      return true;
    }
    const values = [
      `state ${state.id}`,
      String(state.id),
      state.type,
      state.moveType,
      state.physics,
      state.anim !== undefined ? `anim ${state.anim}` : undefined,
      ...Object.entries(state.rawParams).flatMap(([key, value]) => [key, value]),
      ...state.controllers.flatMap((controller) => [
        controller.name,
        controller.type,
        controller.rawHeader,
        ...controller.triggers.map((trigger) => trigger.expression),
        ...Object.entries(controller.params).flatMap(([key, value]) => [key, value]),
      ]),
    ];
    return values.some((value) => value?.toLowerCase().includes(filter));
  }

  private renderStateListItem(
    state: MugenStateDef,
    animations: Map<number, MugenAnimationAction>,
    executedStates: Set<number>,
  ): string {
    const controllerStats = this.getControllerStats(state.controllers);
    const triggerStats = this.getTriggerStats(state.controllers);
    const animState = this.getStateAnimStatus(state, animations);
    const unsupportedSummary = controllerStats.unsupportedTypes.slice(0, 3).join(", ");
    const controllerStrip = state.controllers.slice(0, 5).map((controller) => this.renderControllerChip(controller)).join("");
    const remainingControllers = state.controllers.length - 5;
    const selected = this.selectedInspectorStateId === state.id;
    return `
      <div class="list-item state-list-item ${selected ? "is-selected" : ""}" ${selected ? `data-inspector-selected-state="${state.id}"` : ""}>
        <div class="state-row-main">
          <button type="button" class="state-title-button" data-inspector-state-id="${state.id}" aria-pressed="${selected}">
            <span class="list-title">State ${state.id}</span>
            <span class="list-meta">${escapeHtml(this.formatStateMeta(state))}</span>
          </button>
          <span class="badge-row">
            ${executedStates.has(state.id) ? `<span class="badge active">executed</span>` : ""}
            ${animState.label ? `<span class="badge ${animState.className}">${escapeHtml(animState.label)}</span>` : ""}
            <span class="badge ${controllerStats.unsupported === 0 ? "ok" : "warn"}">${controllerStats.supported}/${state.controllers.length} ctl</span>
            ${
              triggerStats.total > 0
                ? `<span class="badge ${triggerStats.unsupported === 0 ? "ok" : "warn"}">${triggerStats.supported}/${triggerStats.total} trig</span>`
                : `<span class="badge">0 trig</span>`
            }
            ${state.controllers.some((controller) => controller.type.toLowerCase() === "hitdef") ? `<span class="badge warn">HitDef</span>` : ""}
            ${unsupportedSummary ? `<span class="badge warn">unsupported ${escapeHtml(unsupportedSummary)}</span>` : ""}
          </span>
          ${
            controllerStrip
              ? `<span class="state-controller-strip">${controllerStrip}${remainingControllers > 0 ? `<span class="controller-chip">+${remainingControllers}</span>` : ""}</span>`
              : ""
          }
          ${selected ? this.renderStateControllerDetails(state) : ""}
        </div>
        <span class="state-summary-tail">
          <span class="badge">${state.controllers.length} ctl</span>
          <span class="list-meta">${escapeHtml(`line ${state.line}`)}</span>
        </span>
      </div>
    `;
  }

  private renderStateControllerDetails(state: MugenStateDef): string {
    if (!state.controllers.length) {
      return `<div class="empty-state compact">This state has no parsed controllers.</div>`;
    }
    return `
      <div class="state-controller-detail-list" aria-label="State ${state.id} controllers">
        ${state.controllers.map((controller, index) => this.renderStateControllerDetailRow(controller, index)).join("")}
      </div>
    `;
  }

  private renderStateControllerDetailRow(controller: MugenStateController, index: number): string {
    const supported = isRuntimeSupportedController(controller.type);
    const triggerStats = analyzeControllerTriggers(controller);
    const selected =
      this.selectedInspectorControllerLine === controller.line ||
      (this.selectedInspectorControllerLine === undefined &&
        this.selectedInspectorControllerType !== undefined &&
        this.normalizeControllerKey(this.selectedInspectorControllerType) === this.normalizeControllerKey(controller.type));
    const paramRows = Object.entries(controller.params)
      .slice(0, 6)
      .map(
        ([key, value]) => `
          <span class="controller-param">
            <b>${escapeHtml(key)}</b>
            <span>${escapeHtml(value)}</span>
          </span>
        `,
      )
      .join("");
    const triggerRows = controller.triggers
      .slice(0, 3)
      .map(
        (trigger) => `
          <span class="controller-trigger">
            <b>trigger${trigger.index}</b>
            <span>${escapeHtml(trigger.expression)}</span>
          </span>
        `,
      )
      .join("");
    return `
      <button
        type="button"
        class="state-controller-row ${selected ? "is-selected" : ""}"
        data-inspector-state-id="${controller.stateId}"
        data-inspector-controller-type="${escapeHtml(controller.type)}"
        data-inspector-controller-line="${controller.line}"
        aria-pressed="${selected}"
        ${selected ? `data-inspector-selected-controller="${escapeHtml(this.normalizeControllerKey(controller.type))}"` : ""}
      >
        <span class="state-controller-row-head">
          <span>
            <strong>${escapeHtml(controller.type)}</strong>
            <small>${escapeHtml(controller.name ? `${controller.rawHeader} / ${controller.name}` : controller.rawHeader)}</small>
          </span>
          <span class="badge-row">
            <span class="badge ${supported ? "ok" : "warn"}">${supported ? "runtime" : "unsupported"}</span>
            <span class="badge ${triggerStats.unsupported === 0 ? "ok" : "warn"}">${triggerStats.supported}/${triggerStats.total} trig</span>
            <span class="badge">#${index + 1}</span>
            <span class="badge">line ${controller.line}</span>
          </span>
        </span>
        ${triggerRows ? `<span class="controller-trigger-list">${triggerRows}</span>` : `<span class="empty-state compact">No trigger expressions parsed.</span>`}
        ${paramRows ? `<span class="controller-param-grid">${paramRows}</span>` : `<span class="list-meta">No controller params parsed.</span>`}
      </button>
    `;
  }

  private getControllerStats(controllers: MugenStateController[]): {
    supported: number;
    unsupported: number;
    unsupportedTypes: string[];
  } {
    let supported = 0;
    const unsupportedTypes = new Set<string>();
    for (const controller of controllers) {
      if (isRuntimeSupportedController(controller.type)) {
        supported += 1;
      } else {
        unsupportedTypes.add(controller.type);
      }
    }
    return {
      supported,
      unsupported: controllers.length - supported,
      unsupportedTypes: [...unsupportedTypes].sort((a, b) => a.localeCompare(b)),
    };
  }

  private getTriggerStats(controllers: MugenStateController[]): {
    total: number;
    supported: number;
    unsupported: number;
  } {
    return controllers.reduce(
      (stats, controller) => {
        const analysis = analyzeControllerTriggers(controller);
        stats.total += analysis.total;
        stats.supported += analysis.supported;
        stats.unsupported += analysis.unsupported;
        return stats;
      },
      { total: 0, supported: 0, unsupported: 0 },
    );
  }

  private getStateAnimStatus(
    state: MugenStateDef,
    animations: Map<number, MugenAnimationAction>,
  ): { label?: string; className: "ok" | "warn" } {
    if (state.anim === undefined) {
      return { className: "warn" };
    }
    return animations.has(state.anim)
      ? { label: `anim ${state.anim}`, className: "ok" }
      : { label: `anim ${state.anim} missing`, className: "warn" };
  }

  private renderControllerChip(controller: MugenStateController): string {
    const supported = isRuntimeSupportedController(controller.type);
    const triggerCount = controller.triggers.length;
    const selected =
      this.selectedInspectorControllerLine === controller.line ||
      (this.selectedInspectorControllerLine === undefined &&
        this.selectedInspectorControllerType !== undefined &&
        this.normalizeControllerKey(this.selectedInspectorControllerType) === this.normalizeControllerKey(controller.type));
    return `<button type="button" class="controller-chip ${supported ? "ok" : "warn"} ${
      selected ? "is-selected" : ""
    }" data-inspector-state-id="${controller.stateId}" data-inspector-controller-type="${escapeHtml(controller.type)}" data-inspector-controller-line="${
      controller.line
    }">${escapeHtml(controller.type)}${triggerCount > 0 ? `:${triggerCount}` : ""}</button>`;
  }

  private formatStateMeta(state: MugenStateDef): string {
    const shape = [state.type ?? "-", state.moveType ?? "-", state.physics ?? "-"].join("/");
    const ctrl = state.ctrl !== undefined ? state.ctrl : "-";
    const vel = state.velSet ? `${state.velSet[0]},${state.velSet[1]}` : "-";
    return `${shape} | ctrl ${ctrl} | velset ${vel}`;
  }

  private renderCommands(): string {
    const filter = this.navigatorFilter.trim().toLowerCase();
    const allCommands = this.character?.commands ?? [];
    const activeCommandNames = new Set(this.getActiveCommandNames(allCommands));
    const selectedCommandKey = this.selectedInspectorCommandName?.toLowerCase();
    const commands = allCommands.filter((command) => {
      if (!filter) {
        return true;
      }
      return (
        command.name.toLowerCase().includes(filter) ||
        command.rawCommand.toLowerCase().includes(filter) ||
        command.resolvedCommand.toLowerCase().includes(filter) ||
        command.sequence.some((token) => token.raw.toLowerCase().includes(filter))
      );
    });
    if (commands.length === 0) {
      return `<div class="empty-state">No CMD commands parsed yet.</div>`;
    }
    return `
      <div class="list">
        ${commands
          .map(
            (command) => this.renderCommandListItem(command, activeCommandNames.has(command.name), selectedCommandKey === command.name.toLowerCase()),
          )
          .join("")}
      </div>
    `;
  }

  private renderCommandListItem(command: MugenCharacter["commands"][number], active: boolean, selected: boolean): string {
    return `
      <button
        type="button"
        class="list-item command-list-item ${active || selected ? "is-selected" : ""}"
        data-inspector-command-name="${escapeHtml(command.name)}"
        aria-pressed="${selected}"
        ${selected ? `data-inspector-selected-command="${escapeHtml(command.name.toLowerCase())}"` : ""}
      >
        <span class="command-row-main">
          <span>
            <span class="list-title">${escapeHtml(command.name)}</span>
            <span class="list-meta">${escapeHtml(formatCommandSequence(command))}</span>
          </span>
          <span class="badge-row">
            ${active ? `<span class="badge active">active</span>` : ""}
            ${selected ? `<span class="badge active">selected</span>` : ""}
            ${command.sequence.some((token) => token.type === "alternative") ? `<span class="badge ok">alt</span>` : ""}
            ${command.sequence.some((token) => token.type === "modifier" && token.raw.startsWith("/")) ? `<span class="badge ok">hold</span>` : ""}
            ${command.sequence.some((token) => token.type === "modifier" && token.raw.startsWith("~")) ? `<span class="badge warn">rel</span>` : ""}
            ${command.sequence.some((token) => token.chargeTime !== undefined) ? `<span class="badge warn">chg</span>` : ""}
            ${command.remapped ? `<span class="badge warn">remap</span>` : ""}
            ${command.disabled ? `<span class="badge error">disabled</span>` : ""}
            <span class="badge ${command.bufferHitPause ? "ok" : "warn"}">${command.bufferHitPause ? "hpbuf" : "no hpbuf"}</span>
            <span class="badge">${command.time}f</span>
            <span class="badge">${command.stepTime}sf</span>
            <span class="badge">${command.bufferTime}bf</span>
          </span>
          ${selected ? this.renderCommandDetail(command) : ""}
        </span>
        <span class="state-summary-tail">
          <span class="badge">${command.sequence.length} tok</span>
          <span class="list-meta">${escapeHtml(`line ${command.line}`)}</span>
        </span>
      </button>
    `;
  }

  private renderCommandDetail(command: MugenCharacter["commands"][number]): string {
    const tokenRows = command.sequence.length
      ? command.sequence
          .map(
            (token) => `
              <span class="command-token ${token.type}">
                <b>${escapeHtml(token.raw)}</b>
                <small>${escapeHtml(token.chargeTime ? `${token.type} ${token.chargeTime}f` : token.type)}</small>
              </span>
            `,
          )
          .join("")
      : `<span class="empty-state compact">No tokens parsed for this command.</span>`;
    const params = Object.entries(command.rawParams)
      .slice(0, 6)
      .map(
        ([key, value]) => `
          <span class="controller-param">
            <b>${escapeHtml(key)}</b>
            <span>${escapeHtml(value)}</span>
          </span>
        `,
      )
      .join("");
    return `
      <span class="command-detail">
        <span class="command-token-strip">${tokenRows}</span>
        ${params ? `<span class="controller-param-grid">${params}</span>` : ""}
        ${command.disabledReason ? `<span class="badge error">${escapeHtml(command.disabledReason)}</span>` : ""}
      </span>
    `;
  }

  private renderConsole(): string {
    const diagnostics = [
      ...(this.character?.diagnostics ?? []),
      ...this.importedStages.flatMap((stage) => stage.diagnostics),
    ];
    const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
    const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length;
    const runtimeLogs = this.snapshot.logs.concat(this.appLogs);
    const visibleDiagnostics = diagnostics.slice(0, 40);
    const visibleRuntimeLogs = runtimeLogs.slice(0, Math.max(0, 60 - visibleDiagnostics.length));
    const hiddenRows = diagnostics.length + runtimeLogs.length - visibleDiagnostics.length - visibleRuntimeLogs.length;
    const consoleTone = errors ? "error" : warnings ? "warn" : "ok";
    const latestSignal = visibleDiagnostics[0]?.message ?? visibleRuntimeLogs[0] ?? "No warnings or runtime messages yet.";
    return `
      <div class="console-toolbar is-${consoleTone}">
        <div class="console-title">
          <strong>Console</strong>
          <span>${escapeHtml(latestSignal)}</span>
        </div>
        <div class="console-metrics" aria-label="Console summary">
          <span class="badge ${errors ? "error" : "ok"}">${errors} errors</span>
          <span class="badge ${warnings ? "warn" : "ok"}">${warnings} warnings</span>
          <span class="badge">${runtimeLogs.length} runtime logs</span>
          <span class="badge">Three.js renderer</span>
          ${hiddenRows > 0 ? `<span class="badge warn">${hiddenRows} hidden rows</span>` : ""}
        </div>
      </div>
      <div class="console-list" aria-live="polite">
        ${visibleDiagnostics
          .map(
            (diagnostic) => `
              <div class="log-line">
                <span class="log-level-${diagnostic.severity}">${diagnostic.severity}</span>
                <span>${escapeHtml(diagnostic.message)}</span>
                <span>${escapeHtml([diagnostic.file, diagnostic.line ? `:${diagnostic.line}` : ""].join(""))}</span>
              </div>
            `,
          )
          .join("")}
        ${visibleRuntimeLogs
          .map(
            (line) => `
              <div class="log-line">
                <span class="log-level-info">info</span>
                <span>${escapeHtml(line)}</span>
                <span>runtime</span>
              </div>
            `,
          )
          .join("")}
        ${diagnostics.length === 0 && runtimeLogs.length === 0 ? `<div class="empty-state compact"><strong>Clean runtime</strong><span>No warnings or runtime messages yet.</span></div>` : ""}
      </div>
    `;
  }

  private renderRoundHud(): string {
    const renderSnapshot = this.getRenderableSnapshot();
    const p1 = renderSnapshot.actors[0];
    const p2 = renderSnapshot.actors[1];
    if (this.isInspectorRuntimeSurface() || !p1 || !p2) {
      if (!this.character && this.mode !== "studio") {
        return `
          <div class="round-hud-panel inspector">
            <span>Inspector Mode</span>
            <strong>Load ZIP/folder</strong>
            <span>No character loaded</span>
          </div>
        `;
      }
      const characterName =
        this.character?.definition.info.displayName ?? this.character?.definition.info.name ?? (this.mode === "studio" ? "Studio Inspector" : "Inspector preview");
      return `
        <div class="round-hud-panel inspector">
          <span>${escapeHtml(characterName)}</span>
          <strong>Action ${renderSnapshot.selectedActionId ?? "-"}</strong>
          <span>${renderSnapshot.selectedAction?.frames.length ?? 0} frames</span>
        </div>
      `;
    }

    const round = renderSnapshot.round;
    const teamRoundLifebar = renderSnapshot.teamRoundLifebar;
    return `
      <div class="round-hud-panel">
        ${teamRoundLifebar
          ? this.renderHudTeamSide(teamRoundLifebar.sides[0], "left", teamRoundLifebar.visible)
          : this.renderHudFighter(p1, "left")}
        <div class="round-center">
          <span class="round-state ${round?.state ?? "fight"}">${escapeHtml(round?.message ?? "Fight")}</span>
          <strong>${round?.timer ?? 99}</strong>
          ${round?.roundNo ? `<span class="round-number">Round ${round.roundNo}</span>` : ""}
          ${round?.match ? `<span class="round-score" aria-label="Match score">${round.match.wins[1]}-${round.match.wins[2]} / ${round.match.matchWins}</span>` : ""}
          ${this.snapshot.matchPause ? `<span>${escapeHtml(formatHudMatchPause(this.snapshot.matchPause))}</span>` : ""}
          <span class="round-stage">${escapeHtml(this.snapshot.stage.displayName ?? "Stage")}</span>
        </div>
        ${teamRoundLifebar
          ? this.renderHudTeamSide(teamRoundLifebar.sides[1], "right", teamRoundLifebar.visible)
          : this.renderHudFighter(p2, "right")}
      </div>
    `;
  }

  private renderHudTeamSide(
    side: NonNullable<MugenSnapshot["teamRoundLifebar"]>["sides"][number],
    position: "left" | "right",
    visible: boolean,
  ): string {
    if (!visible) {
      return `
        <div class="hud-team-side ${position} is-hidden" data-hud-team-side="${side.side}" data-hud-team-lifebar="true" data-hud-team-lifebar-visible="false">
          <span class="hud-team-hidden-label">Team bars hidden</span>
        </div>
      `;
    }
    const slots = side.slots
      .map((slot) => `
        <div
          class="hud-team-slot is-${slot.status}"
          data-hud-team-slot="${escapeHtml(slot.actorId)}"
          data-hud-team-role="${slot.role}"
          data-hud-team-status="${slot.status}"
        >
          <div class="hud-team-slot-top">
            <strong class="hud-team-slot-name">${escapeHtml(slot.label)}</strong>
            <span class="hud-team-slot-state">${slot.role} / ${slot.status}</span>
            <span class="mono">${slot.life}/${slot.lifeMax}</span>
          </div>
          <div class="hud-meter hud-life"><span style="width: ${slot.ratio * 100}%"></span></div>
          <div
            class="hud-meter hud-redlife"
            data-hud-redlife-bar="${escapeHtml(slot.actorId)}"
            data-hud-redlife-visible="${slot.redLife > 0 ? "true" : "false"}"
            aria-label="Recoverable life ${slot.redLife}/${slot.lifeMax}"
          ><span style="width: ${slot.redLifeRatio * 100}%"></span></div>
        </div>
      `)
      .join("");
    return `
      <div
        class="hud-team-side ${position}"
        data-hud-team-side="${side.side}"
        data-hud-team-lifebar="true"
        data-hud-team-lifebar-visible="true"
        data-hud-team-active="${escapeHtml(side.activeActorIds.join(","))}"
      >
        ${slots || `<span class="hud-team-empty">No team slots</span>`}
      </div>
    `;
  }

  private renderHudFighter(actor: MugenSnapshot["actors"][number], side: "left" | "right"): string {
    const lifeMaxValue = actor.runtime.lifeMax ?? 1000;
    const powerMaxValue = actor.runtime.powerMax ?? 3000;
    const lifeMax = lifeMaxValue > 0 ? lifeMaxValue : 1;
    const powerMax = powerMaxValue > 0 ? powerMaxValue : 1;
    const lifePercent = Math.max(0, Math.min(100, (actor.runtime.life / lifeMax) * 100));
    const redLifeValue = Number.isFinite(actor.runtime.redLife) ? Math.max(0, actor.runtime.redLife ?? 0) : 0;
    const redLifePercent = Math.max(0, Math.min(100, (redLifeValue / lifeMax) * 100));
    const powerPercent = Math.max(0, Math.min(100, (actor.runtime.power / powerMax) * 100));
    return `
      <div class="hud-fighter ${side}">
        <div class="hud-fighter-top">
          <strong class="hud-fighter-name">${escapeHtml(actor.label)}</strong>
          <strong class="hud-fighter-role">${side === "left" ? "P1" : "P2"}</strong>
          <span class="mono">${actor.runtime.life}/${lifeMaxValue}</span>
        </div>
        <div class="hud-meter hud-life"><span style="width: ${lifePercent}%"></span></div>
        <div
          class="hud-meter hud-redlife"
          data-hud-redlife-bar="${escapeHtml(actor.id)}"
          data-hud-redlife-visible="${redLifeValue > 0 ? "true" : "false"}"
          aria-label="Recoverable life ${redLifeValue}/${lifeMaxValue}"
        ><span style="width: ${redLifePercent}%"></span></div>
        <div class="hud-meter hud-power"><span style="width: ${powerPercent}%"></span></div>
      </div>
    `;
  }

  private exportCompatibilityReport(): void {
    const baseReport: CompatibilityReport =
      this.character?.compatibility ??
      ({
        character: "Runtime atlas prototype roster",
        loaded: true,
        files: { def: false, sff: false, air: false, cmd: false, cns: false, snd: false },
        sounds: { total: 0, decoded: 0, wav: 0, unsupported: 0, formats: {}, sampleRates: {}, channels: {} },
        palettes: { total: 0, parsed: 0, colors: 0, withTransparency: 0 },
        animations: {
          total: demoFighters.reduce((total, fighter) => total + fighter.animations.size, 0),
          loaded: demoFighters.reduce((total, fighter) => total + fighter.animations.size, 0),
          withCollisionBoxes: demoFighters.reduce(
            (total, fighter) =>
              total +
              [...fighter.animations.values()].filter((action) =>
                action.frames.some((frame) => frame.clsn1.length > 0 || frame.clsn2.length > 0),
              ).length,
            0,
          ),
        },
        states: {
          total: 0,
          parsed: 0,
          stateEntries: 0,
          recognizedControllerStates: 0,
          compiled: 0,
          triggerSupported: 0,
          runtimeRoutable: 0,
          executed: 0,
          executable: 0,
        },
        triggers: { total: 0, supported: 0, unsupported: 0, unsupportedFeatures: {} },
        controllers: { RuntimePrototype: this.getAvailableFighters().length },
        compiler: createEmptyCompileReport(),
        profiles: createCompatibilityProfiles({ nativeRuntime: true }),
        unsupported: [{ format: "runtime", feature: "real CNS execution", severity: "warning", count: 1 }],
        warnings: [
          "Runtime roster can use authored atlas fixtures and one imported CMD State -1/AIR/SFF bridge; full imported MUGEN CNS/CMD execution is not yet complete.",
        ],
        errors: [],
      } satisfies CompatibilityReport);
    const report = this.withSessionCompatibility(baseReport);
    const exportPayload = {
      ...report,
      stages: this.getStageCompatibilityReports(),
      runtimeRoster: this.buildRuntimeRosterReport(),
      studio: this.getStudioProjectSummary(),
      project: this.getGameProjectManifest(),
      compiledProject: this.lastCompiledProject,
      compatibilitySnapshot: STUDIO_COMPATIBILITY_SNAPSHOT.snapshot ?? {
        status: STUDIO_COMPATIBILITY_SNAPSHOT.status,
        artifactPath: STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH,
        diagnostics: STUDIO_COMPATIBILITY_SNAPSHOT.diagnostics,
      },
    };
    this.downloadJson(
      exportPayload,
      `${report.character.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "mugen"}-compatibility.json`,
    );
    this.log(`Exported compatibility report for ${report.character}`);
  }

  private exportStudioProjectManifest(): void {
    const manifest = this.getGameProjectManifest();
    this.downloadJson(manifest, `${manifest.id}-project.json`);
    this.log(`Exported project manifest ${manifest.id}`);
  }

  private compileCurrentProject(): void {
    const manifest = this.getGameProjectManifest();
    const compiled = compileGameProjectManifest(manifest);
    this.lastCompiledProject = compiled;
    this.lastProjectBundle = undefined;
    this.log(
      `Compiled runtime manifest ${compiled.projectId}: ${compiled.modules.active.length} active, ${compiled.modules.planned.length} planned, ${compiled.modules.missing.length} missing modules`,
    );
    for (const warning of compiled.diagnostics.warnings.slice(0, 5)) {
      this.log(`Runtime manifest warning: ${warning}`);
    }
    for (const error of compiled.diagnostics.errors.slice(0, 5)) {
      this.log(`Runtime manifest error: ${error}`);
    }
    this.updateUi();
  }

  private exportRuntimeManifest(): void {
    const compiled = this.lastCompiledProject ?? compileGameProjectManifest(this.getGameProjectManifest());
    this.lastCompiledProject = compiled;
    this.downloadJson(compiled, `${compiled.projectId}-runtime-manifest.json`);
    this.log(`Exported runtime manifest ${compiled.projectId}`);
    this.updateUi();
  }

  private async exportProjectBundle(): Promise<void> {
    const project = this.getGameProjectManifest();
    const compiled = this.lastCompiledProject ?? compileGameProjectManifest(project);
    this.lastCompiledProject = compiled;
    await this.loadAssetPermissionMetadata();
    const studio = this.getStudioProjectSummary();
    const sourceRuntimeMaps = this.getAssetSourceRuntimeMaps(studio.assets);
    const evidence = this.getStudioEvidenceSummary();
    const traceArtifact = this.lastTraceArtifact;
    const zip = new JSZip();
    this.addJsonToZip(zip, "project/project.json", project);
    this.addJsonToZip(zip, "runtime/runtime-manifest.json", compiled);
    this.addJsonToZip(zip, "studio/studio-summary.json", studio);
    this.addJsonToZip(zip, "studio/asset-source-runtime-map.json", sourceRuntimeMaps);
    this.addJsonToZip(zip, "studio/gate-evidence.json", STUDIO_GATE_EVIDENCE_DOCUMENT);
    if (this.importedPackageAnalysisV1) {
      this.addJsonToZip(zip, "studio/package-analysis.json", this.importedPackageAnalysisV1);
    }
    if (this.studioSourceWriteReceipt) {
      this.addJsonToZip(zip, "studio/source-write-receipt.json", this.studioSourceWriteReceipt);
    }
    this.addJsonToZip(zip, "studio/evidence.json", evidence);
    this.addJsonToZip(zip, "reports/compatibility-report.json", this.getCompatibilityExportPayload());
    this.addJsonToZip(
      zip,
      "qa/compatibility-corpus-snapshot-v1.json",
      STUDIO_COMPATIBILITY_SNAPSHOT.snapshot ?? {
        status: STUDIO_COMPATIBILITY_SNAPSHOT.status,
        artifactPath: STUDIO_COMPATIBILITY_SNAPSHOT_ARTIFACT_PATH,
        diagnostics: STUDIO_COMPATIBILITY_SNAPSHOT.diagnostics,
      },
    );
    if (traceArtifact) {
      this.addJsonToZip(zip, "qa/latest-trace-artifact.json", traceArtifact);
    }
    const assetRecords = await this.addProjectBundleAssetsToZip(zip, studio.assets);
    const provenance = this.getStudioAssetProvenance(studio.assets, assetRecords);
    const provenanceReady = provenance.filter((record) => record.canExport).length;
    const provenanceBlocked = provenance.length - provenanceReady;
    const bundledAssets = assetRecords.filter((record) => record.status === "bundled");
    const failedAssets = assetRecords.filter((record) => record.status === "failed");
    const skippedAssets = assetRecords.filter((record) => record.status === "skipped");
    const binaryBundlingStatus = bundledAssets.length === 0 ? "metadata-only" : failedAssets.length > 0 || skippedAssets.some((record) => record.required) ? "partial" : "bundled";
    const files: ProjectExportBundleManifest["files"] = [
      { path: "package-manifest.json", kind: "manifest", required: true },
      { path: "project/project.json", kind: "manifest", required: true },
      { path: "runtime/runtime-manifest.json", kind: "runtime", required: true },
      { path: "studio/studio-summary.json", kind: "studio", required: true },
      { path: "studio/asset-source-runtime-map.json", kind: "studio", required: true },
      { path: "studio/gate-evidence.json", kind: "studio", required: true },
      ...(this.importedPackageAnalysisV1 ? [{ path: "studio/package-analysis.json", kind: "studio" as const, required: true }] : []),
      ...(this.studioSourceWriteReceipt ? [{ path: "studio/source-write-receipt.json", kind: "studio" as const, required: true }] : []),
      { path: "studio/asset-provenance.json", kind: "studio", required: true },
      { path: "studio/evidence.json", kind: "qa", required: true },
      { path: "studio/build-readiness.json", kind: "qa", required: true },
      { path: "reports/compatibility-report.json", kind: "report", required: true },
      { path: "qa/compatibility-corpus-snapshot-v1.json", kind: "qa", required: true },
      { path: "assets/package-assets.json", kind: "asset-manifest", required: true },
      { path: "README.txt", kind: "readme", required: true },
      ...bundledAssets.map((asset) => ({ path: asset.packagePath, kind: "asset" as const, required: asset.required })),
    ];
    if (traceArtifact) {
      files.push({ path: "qa/latest-trace-artifact.json", kind: "qa", required: false });
    }
    const manifest: ProjectExportBundleManifest = {
      schemaVersion: "mugen-web-sandbox/export-bundle/v0",
      projectId: project.id,
      projectName: project.name,
      generatedAt: new Date().toISOString(),
      sourcePackage: "browser-export",
      files,
      assets: {
        total: studio.assets.length,
        sourceRuntimeMapped: Object.keys(sourceRuntimeMaps).length,
        binaryBundled: bundledAssets.length,
        binarySkipped: skippedAssets.length,
        binaryFailed: failedAssets.length,
        binaryBytes: bundledAssets.reduce((total, asset) => total + (asset.bytes ?? 0), 0),
        binaryBundlingStatus,
        provenanceRecords: provenance.length,
        provenanceReady,
        provenanceBlocked,
        records: assetRecords,
      },
      diagnostics: {
        warnings: [
          ...compiled.diagnostics.warnings,
          ...(binaryBundlingStatus === "metadata-only" ? ["No browser-fetchable binary assets were embedded in this package export."] : []),
          ...(binaryBundlingStatus === "partial" ? ["Some local/source assets could not be embedded; see assets/package-assets.json."] : []),
          ...(provenanceBlocked > 0 ? [`${provenanceBlocked} asset provenance record(s) block release readiness; this package remains diagnostic-only.`] : []),
          ...(traceArtifact ? [] : ["No runtime trace artifact was included because none has been exported in this session."]),
        ],
        errors: [...compiled.diagnostics.errors],
      },
    };
    const filename = `${project.id}-mugen-web-package.zip`;
    this.lastProjectBundle = { manifest, filename };
    const readiness = this.getBuildReadinessRecords(studio);
    this.addJsonToZip(zip, "package-manifest.json", manifest);
    this.addJsonToZip(zip, "studio/build-readiness.json", readiness);
    this.addJsonToZip(zip, "studio/asset-provenance.json", provenance);
    this.addJsonToZip(zip, "assets/package-assets.json", assetRecords);
    zip.file("README.txt", this.createProjectBundleReadme(manifest));
    const blob = await zip.generateAsync({ type: "blob" });
    await this.downloadBlobAsDataUrl(blob, filename);
    this.log(`Exported project package ${filename}: ${manifest.files.length} files, ${bundledAssets.length} bundled assets, ${formatBytes(manifest.assets.binaryBytes)}`);
    this.updateUi();
  }

  private exportRuntimeTraceArtifact(): void {
    const p1 = this.findFighter(this.selectedP1) ?? demoFighters[0]!;
    const p2 = this.findFighter(this.selectedP2) ?? demoFighters[1]!;
    const stage = this.findStage(this.selectedStageId) ?? rooftopDojoStage;
    const manifest = this.getGameProjectManifest();
    const artifact = createMatchSmokeTraceArtifact({ p1, p2, stage });
    this.lastTraceArtifact = artifact;
    this.lastProjectBundle = undefined;
    this.selectedTraceFrameIndex = 0;
    this.traceArtifacts = [artifact, ...this.traceArtifacts].slice(0, TRACE_ARTIFACT_HISTORY_LIMIT);
    this.saveTraceEvidenceLocal(manifest, artifact);
    this.downloadJson(artifact, `${artifact.target.id}.json`);
    this.log(`Exported trace artifact ${artifact.target.id}: ${artifact.status}`);
    this.updateUi();
  }

  private async addProjectBundleAssetsToZip(zip: JSZip, assets: StudioAssetRecord[]): Promise<ProjectExportBundleAssetRecord[]> {
    const candidates = dedupeBundleAssetCandidates(assets.flatMap((asset) => this.getProjectBundleAssetCandidates(asset)));
    const records: ProjectExportBundleAssetRecord[] = [];
    for (const candidate of candidates) {
      records.push(await this.addProjectBundleAssetToZip(zip, candidate));
    }
    return records;
  }

  private async addProjectBundleAssetToZip(zip: JSZip, candidate: ProjectExportBundleAssetCandidate): Promise<ProjectExportBundleAssetRecord> {
    try {
      if (candidate.sourceKind === "vfs") {
        const bytes = this.importedSourceBundle?.vfs.readBytes(candidate.sourcePath);
        if (!bytes) {
          return this.packageAssetRecord(candidate, candidate.required ? "failed" : "skipped", {
            reason: "Imported source file is not available in the current virtual file system",
          });
        }
        const copy = new Uint8Array(bytes.byteLength);
        copy.set(bytes);
        zip.file(candidate.packagePath, copy);
        return this.packageAssetRecord(candidate, "bundled", {
          bytes: copy.byteLength,
          sha256: await sha256Hex(copy.buffer),
          contentType: contentTypeForPath(candidate.sourcePath),
        });
      }
      const response = await fetch(candidate.sourcePath, { cache: "no-store" });
      if (!response.ok) {
        return this.packageAssetRecord(candidate, candidate.required ? "failed" : "skipped", {
          reason: `HTTP ${response.status} while fetching asset`,
        });
      }
      const buffer = await response.arrayBuffer();
      zip.file(candidate.packagePath, buffer);
      return this.packageAssetRecord(candidate, "bundled", {
        bytes: buffer.byteLength,
        sha256: await sha256Hex(buffer),
        contentType: response.headers.get("content-type") ?? undefined,
      });
    } catch (error) {
      return this.packageAssetRecord(candidate, candidate.required ? "failed" : "skipped", {
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private packageAssetRecord(
    candidate: ProjectExportBundleAssetCandidate,
    status: ProjectExportBundleAssetRecord["status"],
    extra: Pick<ProjectExportBundleAssetRecord, "bytes" | "sha256" | "contentType" | "reason"> = {},
  ): ProjectExportBundleAssetRecord {
    return {
      assetId: candidate.asset.id,
      label: candidate.label,
      kind: candidate.asset.kind,
      source: candidate.asset.source,
      sourceKind: candidate.sourceKind,
      sourcePath: candidate.sourcePath,
      packagePath: candidate.packagePath,
      required: candidate.required,
      status,
      ...extra,
    };
  }

  private getProjectBundleAssetCandidates(asset: StudioAssetRecord): ProjectExportBundleAssetCandidate[] {
    const candidates: ProjectExportBundleAssetCandidate[] = [];
    const assetDir = sanitizePackageSegment(asset.id);
    const add = (sourcePath: string | undefined, packagePath: string, label: string, required = true): void => {
      if (!sourcePath) {
        return;
      }
      candidates.push({ asset, sourcePath, packagePath, label, required, sourceKind: "fetch" });
    };
    const addImported = (sourcePath: string | undefined, label: string, required = true): void => {
      if (!sourcePath || !this.importedSourceBundle) {
        return;
      }
      const packageRoot = `assets/imported/${sanitizePackageSegment(this.importedSourceBundle.sourceName)}`;
      candidates.push({
        asset,
        sourcePath,
        packagePath: `${packageRoot}/${sanitizePackagePath(sourcePath)}`,
        label,
        required,
        sourceKind: "vfs",
      });
    };

    if (asset.source === "mugen-import" && asset.kind === "character" && this.character && asset.id === this.importedFighter?.id) {
      const character = this.character;
      addImported(character.files.def ?? character.defPath, "MUGEN DEF");
      addImported(character.files.sprite, "MUGEN SFF");
      addImported(character.files.anim, "MUGEN AIR");
      addImported(character.files.cmd, "MUGEN CMD");
      addImported(character.files.cns, "MUGEN CNS");
      for (const [index, stateFile] of character.files.states.entries()) {
        addImported(stateFile, `MUGEN ST ${index + 1}`, false);
      }
      for (const [index, commonStateFile] of character.files.commonStates.entries()) {
        addImported(commonStateFile, `MUGEN common state ${index + 1}`, false);
      }
      addImported(character.files.sound, "MUGEN SND", false);
      for (const [index, palette] of character.files.palettes.entries()) {
        addImported(palette, `MUGEN palette ${index + 1}`, false);
      }
      return candidates;
    }

    if (asset.source === "mugen-import" && asset.kind === "stage") {
      const importedStage = this.importedStages.find((stage) => stage.stage.id === asset.id);
      if (importedStage) {
        addImported(importedStage.files.def, "Stage DEF");
        addImported(importedStage.files.sprite, "Stage SFF");
        addImported(importedStage.files.music, "Stage music", false);
      }
      return candidates;
    }

    if (asset.kind === "sound" && this.character) {
      addImported(this.character.files.sound, "MUGEN SND", false);
      return candidates;
    }

    if (asset.source === "generated" && (asset.kind === "sprite-atlas" || asset.kind === "character")) {
      const sourceRoot = `/characters/${asset.id}`;
      const packageRoot = `assets/characters/${assetDir}`;
      const mugenPrefix = asset.id.split("-")[0] ?? asset.id;
      add(`${sourceRoot}/sprite-sheet-alpha.png`, `${packageRoot}/sprite-sheet-alpha.png`, "Runtime atlas sheet");
      add(`${sourceRoot}/manifest.json`, `${packageRoot}/manifest.json`, "Runtime atlas manifest");
      add(`${sourceRoot}/sprite-sheet-alpha.report.json`, `${packageRoot}/sprite-sheet-alpha.report.json`, "Atlas build report");
      add(`${sourceRoot}/runtime-states.json`, `${packageRoot}/runtime-states.json`, "Runtime state contract");
      add(`${sourceRoot}/states.contract.json`, `${packageRoot}/states.contract.json`, "State contract");
      add(`${sourceRoot}/sprite-request.json`, `${packageRoot}/sprite-request.json`, "Sprite generation request", false);
      add(`${sourceRoot}/frames/frames-manifest.json`, `${packageRoot}/frames/frames-manifest.json`, "Extracted frame manifest", false);
      add(`${sourceRoot}/qa/motion-variation-report.json`, `${packageRoot}/qa/motion-variation-report.json`, "Motion QA report");
      add(`${sourceRoot}/qa/all-contact.png`, `${packageRoot}/qa/all-contact.png`, "Collision/contact QA sheet", false);
      add(`${sourceRoot}/README.md`, `${packageRoot}/README.md`, "Character asset README", false);
      const permissionMetadata = this.assetPermissionMetadata.get(asset.id);
      if (permissionMetadata) {
        add(`${sourceRoot}/asset-permission.json`, `${packageRoot}/asset-permission.json`, "Asset permission metadata");
        add(`${sourceRoot}/${permissionMetadata.license.sourceRef}`, `${packageRoot}/${permissionMetadata.license.sourceRef}`, "Asset license");
        for (const sourceFile of permissionMetadata.sourceFiles) {
          add(`${sourceRoot}/${sourceFile.path}`, `${packageRoot}/${sourceFile.path}`, "Source file " + sourceFile.path);
        }
      }
      for (const extension of ["def", "air", "cmd", "cns"]) {
        add(`${sourceRoot}/mugen/${mugenPrefix}.${extension}`, `${packageRoot}/mugen/${mugenPrefix}.${extension}`, `MUGEN-lite ${extension.toUpperCase()} template`, false);
      }
      return candidates;
    }

    if (asset.kind === "stage" && (asset.source === "authored" || asset.source === "runtime-demo")) {
      const stage = this.findStage(asset.id);
      const packageRoot = `assets/stages/${assetDir}`;
      for (const layer of stage?.layers ?? []) {
        if (layer.assetUrl) {
          add(layer.assetUrl, `${packageRoot}/${fileNameFromPath(layer.assetUrl)}`, `Stage layer ${layer.id}`);
        }
      }
      if (asset.source === "authored") {
        add(`/stages/${asset.id}/README.md`, `${packageRoot}/README.md`, "Stage asset README", false);
      }
    }

    return candidates;
  }

  private getAssetSourceRuntimeMaps(assets: StudioAssetRecord[]): Record<string, StudioAssetSourceRuntimeMap> {
    return Object.fromEntries(
      assets.map((asset) => {
        const relatedEvidence = this.getAssetEvidenceRecords(asset);
        const dependencies = this.getAssetDependencyRecords(asset, relatedEvidence);
        return [asset.id, this.getAssetSourceRuntimeMap(asset, relatedEvidence, dependencies)];
      }),
    );
  }

  private getCompatibilityExportPayload(): unknown {
    const baseReport = this.character?.compatibility ??
      ({
        character: "Runtime atlas prototype roster",
        loaded: true,
        files: { def: false, sff: false, air: false, cmd: false, cns: false, snd: false },
        sounds: { total: 0, decoded: 0, wav: 0, unsupported: 0, formats: {}, sampleRates: {}, channels: {} },
        palettes: { total: 0, parsed: 0, colors: 0, withTransparency: 0 },
        animations: {
          total: demoFighters.reduce((total, fighter) => total + fighter.animations.size, 0),
          loaded: demoFighters.reduce((total, fighter) => total + fighter.animations.size, 0),
          withCollisionBoxes: demoFighters.reduce(
            (total, fighter) =>
              total +
              [...fighter.animations.values()].filter((action) =>
                action.frames.some((frame) => frame.clsn1.length > 0 || frame.clsn2.length > 0),
              ).length,
            0,
          ),
        },
        states: {
          total: 0,
          parsed: 0,
          stateEntries: 0,
          recognizedControllerStates: 0,
          compiled: 0,
          triggerSupported: 0,
          runtimeRoutable: 0,
          executed: 0,
          executable: 0,
        },
        triggers: { total: 0, supported: 0, unsupported: 0, unsupportedFeatures: {} },
        controllers: { RuntimePrototype: this.getAvailableFighters().length },
        compiler: createEmptyCompileReport(),
        profiles: createCompatibilityProfiles({ nativeRuntime: true }),
        unsupported: [{ format: "runtime", feature: "real CNS execution", severity: "warning", count: 1 }],
        warnings: [
          "Runtime roster can use authored atlas fixtures and one imported CMD State -1/AIR/SFF bridge; full imported MUGEN CNS/CMD execution is not yet complete.",
        ],
        errors: [],
      } satisfies CompatibilityReport);
    const report = this.withSessionCompatibility(baseReport);
    return {
      ...report,
      stages: this.getStageCompatibilityReports(),
      runtimeRoster: this.buildRuntimeRosterReport(),
      studio: this.getStudioProjectSummary(),
      project: this.getGameProjectManifest(),
      compiledProject: this.lastCompiledProject,
    };
  }

  private addJsonToZip(zip: JSZip, path: string, payload: unknown): void {
    zip.file(path, JSON.stringify(payload, null, 2));
  }

  private createProjectBundleReadme(manifest: ProjectExportBundleManifest): string {
    return [
      "mugen-web-sandbox export bundle",
      "",
      `Project: ${manifest.projectName} (${manifest.projectId})`,
      `Schema: ${manifest.schemaVersion}`,
      `Generated: ${manifest.generatedAt}`,
      "",
      "This package export contains project/runtime contracts, Studio source-runtime maps, QA evidence, reports, and browser-fetchable local assets.",
      `Binary assets: ${manifest.assets.binaryBundled} bundled, ${manifest.assets.binarySkipped} skipped, ${manifest.assets.binaryFailed} failed, ${formatBytes(manifest.assets.binaryBytes)} total.`,
      "Current-session ZIP/folder imports are embedded from the in-memory virtual file system when available. Reopened project manifests can relink a missing source package by loading a ZIP/folder whose paths satisfy the recorded requirements.",
      "",
      "Files:",
      ...manifest.files.map((file) => `- ${file.path} [${file.kind}${file.required ? ", required" : ""}]`),
    ].join("\n");
  }

  private downloadJson(payload: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    this.downloadBlob(blob, filename);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  private async downloadBlobAsDataUrl(blob: Blob, filename: string): Promise<void> {
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result)));
      reader.addEventListener("error", () => reject(reader.error ?? new Error("Failed to prepare download")));
      reader.readAsDataURL(blob);
    });
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
  }

  private withSessionCompatibility(report: CompatibilityReport): CompatibilityReport {
    const session = this.snapshot.compatibilitySession?.actors[0];
    if (!session) {
      return report;
    }
    const next: CompatibilityReport = structuredClone(report);
    next.states = {
      ...next.states,
      executed: session.executedStates.length,
    };
    next.controllers = {
      ...next.controllers,
      ExecutedControllers: session.executedControllers,
      ExecutedOperations: session.executedOperations,
    };
    next.session = {
      executedStates: [...session.executedStates],
      routedStateEntries: session.routedStateEntries,
      executedControllers: { ...session.executedControllers },
      executedOperations: { ...session.executedOperations },
      ...(session.lastExecutedState !== undefined ? { lastExecutedState: session.lastExecutedState } : {}),
    };
    return next;
  }

  private installDiagnosticsBridge(): void {
    const snapshot = this.getRenderableSnapshot();
    const bridge = window as Window & {
      __MUGEN_WEB_SANDBOX__?: {
        mode: AppMode;
        snapshot: MugenSnapshot;
        character?: string;
        compatibility?: CompatibilityReport;
        resolvedFiles?: MugenCharacter["files"];
        diagnostics?: MugenCharacter["diagnostics"];
        renderer: ReturnType<ThreeMugenRenderer["getDiagnostics"]>;
        audio: ReturnType<MugenAudioSystem["getDiagnostics"]>;
        stages: StageCompatibilityReport[];
        atlasMotionQa: Record<string, AtlasMotionQa>;
        runtimeRoster: RuntimeRosterEntry[];
        actorRegistry?: MatchWorldActorRegistrySnapshot;
        studio: StudioProjectSummary;
        studioAssets: StudioAssetLibrarySummary;
        studioDebug: StudioDebugSelectionSummary;
        studioDebugFilter: StudioDebugFilter;
        studioEvidence: StudioEvidenceSummary;
        studioTrustChain: StudioTrustContractRow[];
        studioFocusedTrustRowId?: string;
        studioFocusedPackageFilePath?: string;
        studioFocusedSourcePackageId?: string;
        studioFocusedSourcePath?: string;
        traceFrameScrubber: StudioTraceFrameScrubberSummary;
        studioTab: StudioTab;
        studioEditHistory: {
          canUndo: boolean;
          canRedo: boolean;
          undoCount: number;
          redoCount: number;
        };
        studioAutosave: {
          pending: boolean;
          delayMs: number;
        };
        project: GameProjectManifest;
        compiledProject?: CompiledRuntimeManifest;
        projectBundle?: ProjectExportBundleSummary;
        traceArtifact?: RuntimeTraceArtifact;
        traceArtifacts: RuntimeTraceArtifact[];
        storedTraceEvidence: StoredTraceEvidenceEntry[];
        projectImportWarnings: string[];
        sourceImportTransaction?: SourceImportTransaction;
        packageAnalysis?: PackageAnalysisResult;
        packageAnalysisV1?: PackageAnalysisV1Result;
        sourceTransactions: SourceTransactionRecord[];
        sourceHandles: SourceHandleRecord[];
        studioSourceDocument?: StudioSourceDocumentDraft;
        studioSourceWriteReceipt?: SourceWriteReceipt;
        storedProjects: StoredProjectEntry[];
        projectDirty: boolean;
        projectStorageRevision?: number;
        projectStorageConflict?: ProjectStorageConflict;
        qa?: {
          scenario: RuntimeQaScenario;
          tagPresentationHandoff(): void;
          resetTagPresentation(): void;
        };
      };
    };
    const studio = this.getStudioProjectSummary();
    bridge.__MUGEN_WEB_SANDBOX__ = {
      mode: this.mode,
      snapshot,
      character: this.character?.compatibility.character,
      compatibility: this.character ? this.withSessionCompatibility(this.character.compatibility) : undefined,
      resolvedFiles: this.character?.files,
      diagnostics: this.character?.diagnostics,
      renderer: this.renderer.getDiagnostics(),
      audio: this.audio.getDiagnostics(),
      stages: this.getStageCompatibilityReports(),
      atlasMotionQa: Object.fromEntries(this.atlasMotionQaByFighter),
      runtimeRoster: this.buildRuntimeRosterReport(),
      actorRegistry: this.getActiveActorRegistry(),
      studio,
      studioAssets: this.getStudioAssetLibrarySummary(),
      studioDebug: this.getStudioDebugSelection(),
      studioDebugFilter: this.studioDebugFilter,
      studioEvidence: this.getStudioEvidenceSummary(),
      studioTrustChain: this.getStudioTrustContractRows(studio),
      studioFocusedTrustRowId: this.studioFocusedTrustRowId,
      studioFocusedPackageFilePath: this.studioFocusedPackageFilePath,
      studioFocusedSourcePackageId: this.studioFocusedSourcePackageId,
      studioFocusedSourcePath: this.studioFocusedSourcePath,
      traceFrameScrubber: this.getTraceFrameScrubberSummary(),
      studioTab: this.studioTab,
      studioEditHistory: {
        canUndo: this.studioEditHistory.canUndo,
        canRedo: this.studioEditHistory.canRedo,
        undoCount: this.studioEditHistory.undoCount,
        redoCount: this.studioEditHistory.redoCount,
      },
      studioAutosave: {
        pending: this.studioAutosave.pending,
        delayMs: this.studioAutosave.delayMs,
      },
      project: this.getGameProjectManifest(studio),
      compiledProject: this.lastCompiledProject,
      projectBundle: this.lastProjectBundle,
      traceArtifact: this.lastTraceArtifact,
      traceArtifacts: this.traceArtifacts.map((artifact) => structuredClone(artifact)),
      storedTraceEvidence: this.storedTraceEvidence.map((entry) => structuredClone(entry)),
      projectImportWarnings: [...this.projectImportWarnings],
      sourceImportTransaction: this.sourceImportTransaction,
      packageAnalysis: this.importedPackageAnalysis ? structuredClone(this.importedPackageAnalysis) : undefined,
      packageAnalysisV1: this.importedPackageAnalysisV1 ? structuredClone(this.importedPackageAnalysisV1) : undefined,
      sourceTransactions: this.getSourceTransactionRecords(),
      sourceHandles: this.getSourceHandleRecords(),
      studioSourceDocument: this.studioSourceDocument ? structuredClone(this.studioSourceDocument) : undefined,
      studioSourceWriteReceipt: this.studioSourceWriteReceipt ? structuredClone(this.studioSourceWriteReceipt) : undefined,
      storedProjects: this.storedProjects,
      projectDirty: this.projectDirty,
      projectStorageRevision: this.projectStorageRevision,
      projectStorageConflict: this.projectStorageConflict,
      ...(this.runtimeQaScenario
        ? {
            qa: {
              scenario: this.runtimeQaScenario,
              tagPresentationHandoff: () => this.applyTagPresentationQaHandoff(),
              resetTagPresentation: () => this.resetTagPresentationQaScenario(),
            },
          }
        : {}),
    };
  }

  private log(message: string): void {
    this.appLogs.unshift(message);
    this.appLogs.splice(80);
    this.snapshot = {
      ...this.snapshot,
      logs: this.snapshot.logs,
    };
  }

  private renderStudioStageDeck(): string {
    if (this.mode !== "studio" || this.studioTab !== "workbench") {
      return "";
    }
    const summary = this.getStudioProjectSummary();
    const primaryGate = this.getPrimaryStudioGate(summary);
    const warnings = this.getWorkbenchWarningRows(summary);
    const score = this.getWorkbenchHealthScore(summary);
    const healthBand = this.getWorkbenchHealthBand(score);
    const attentionGates = summary.gates.filter((gate) => isAttentionStatus(gate.status)).length;
    const attentionAssets = summary.assets.filter((asset) => isAttentionStatus(asset.status)).length;
    const traceCount = this.traceArtifacts.length + this.storedTraceEvidence.length;
    const nextActionAttribute = primaryGate ? this.studioNextActionAttribute(primaryGate.nextAction) : 'data-mode="match"';
    const nextActionKind = primaryGate?.nextAction.kind;
    const nextTitle = nextActionKind === "relink-source" ? "Import Source" : primaryGate?.nextAction.label ?? "Playtest Roster";
    const nextButtonLabel = nextActionKind === "relink-source" ? "Import" : primaryGate?.nextAction.label ?? "Playtest";
    const nextCopy =
      primaryGate?.impact ??
      "Use the current roster, inspect a source package, or build the next local proof when you need it.";
    return `
      <div class="studio-command-deck" aria-label="Studio production controls">
        <section class="studio-command-deck-main">
          <span class="deck-kicker">Next Production Move</span>
          <h2>${escapeHtml(nextTitle)}</h2>
          <p>${escapeHtml(nextCopy)}</p>
          <div class="deck-action-row">
            <button type="button" class="deck-primary-action" ${nextActionAttribute}>
              ${tablerIcon(primaryGate ? iconForAction(primaryGate.nextAction.label, nextActionAttribute) : "folder", "ui-icon action-icon")}
              <span>${escapeHtml(nextButtonLabel)}</span>
            </button>
            <button type="button" data-mode="match">${tablerIcon("play", "ui-icon action-icon")}<span>Play</span></button>
            <button type="button" data-action="compile-project">${tablerIcon("build", "ui-icon action-icon")}<span>Build</span></button>
            <button type="button" data-action="export-trace-artifact">${tablerIcon("evidence", "ui-icon action-icon")}<span>Trace</span></button>
          </div>
        </section>

        <section class="studio-command-deck-status is-${healthBand.tone}">
          <span class="deck-kicker">Readiness</span>
          <div class="studio-readiness-panel" style="--health-score: ${score}%">
            <span class="studio-health-orb" aria-hidden="true">
              <b>${score}</b>
              <small>/100</small>
            </span>
            <div class="studio-health-stats">
              <span><b>${summary.gates.length - attentionGates} / ${summary.gates.length}</b><small>Gates Clear</small></span>
              <span class="${attentionAssets ? "is-warn" : "is-ok"}"><b>${attentionAssets}</b><small>Asset Issues</small></span>
              <span><b>${traceCount}</b><small>Trace Artifacts</small></span>
              <span class="is-${healthBand.tone}"><b>${escapeHtml(healthBand.label)}</b><small>Runtime Build</small></span>
            </div>
          </div>
          ${
            warnings.length
              ? `<button type="button" class="deck-review-link" ${warnings[0]!.attribute}>
                  ${tablerIcon(warnings[0]!.icon, "ui-icon")}
                  <span>${escapeHtml(warnings[0]!.label)}</span>
                </button>`
              : ""
          }
        </section>
      </div>
    `;
  }

  private renderStageStatus(): string {
    const renderSnapshot = this.getRenderableSnapshot();
    const actor = renderSnapshot.actors[0];
    const opponent = renderSnapshot.actors[1];
    const frame = actor?.frame;
    if (this.mode === "match") {
      const activeCommands = this.getActiveCommandNames().slice(0, 3);
      const stage = this.findStage(this.selectedStageId);
      const stageAsset = this.importedStages.some((stagePackage) => stagePackage.stage.id === stage?.id)
        ? "import DEF"
        : stage?.layers.some((layer) => layer.assetUrl)
          ? "art PNG"
          : "geometry";
      const p1Atlas = this.atlasStatusByFighter.get(this.selectedP1) ?? "loading";
      const p1Qa = this.atlasMotionQaByFighter.get(this.selectedP1);
      const p1QaLabel =
        !p1Qa || p1Qa.status === "loading"
          ? "loading"
          : p1Qa.status === "pass"
            ? "ok"
            : p1Qa.status === "warn"
              ? `warn ${p1Qa.warnings.length}`
              : p1Qa.status === "missing"
                ? "missing"
                : `fail ${p1Qa.errors.length}`;
      return `
        <div class="stage-status-card">
          <div class="stage-status-main">
            <span class="stage-status-mode">Runtime Mode</span>
            <strong>${escapeHtml(actor?.label ?? "P1")} vs ${escapeHtml(opponent?.label ?? "CPU")}</strong>
            <small>${escapeHtml(this.snapshot.stage.displayName ?? "Stage")} / state ${escapeHtml(actor?.runtime.stateType ?? "-")}/${escapeHtml(actor?.runtime.moveType ?? "-")}/${escapeHtml(actor?.runtime.physics ?? "-")} / anim ${actor?.runtime.animNo ?? "-"}</small>
          </div>
          <div class="stage-status-grid" aria-label="Runtime state summary">
            ${this.renderStageStatusMetric("P1", `${actor?.runtime.life ?? 0} HP`, "ok", "character")}
            ${this.renderStageStatusMetric("CPU", `${opponent?.runtime.life ?? 0} HP`, "ok", "match")}
            ${this.renderStageStatusMetric("Cmd", activeCommands.length ? activeCommands.join(", ") : "idle", activeCommands.length ? "active" : undefined, "tools")}
            ${this.renderStageStatusMetric("Stage", stageAsset, stageAsset === "geometry" ? undefined : "ok", "stage")}
            ${this.renderStageStatusMetric("Atlas", p1Atlas, p1Atlas === "loaded" ? "ok" : p1Atlas === "fallback" ? "warn" : undefined, "assetAtlas")}
            ${this.renderStageStatusMetric("Walk QA", p1QaLabel, p1Qa?.status === "pass" ? "ok" : p1Qa?.status === "fail" ? "error" : p1Qa?.status === "warn" || p1Qa?.status === "missing" ? "warn" : undefined, "activity")}
          </div>
        </div>
      `;
    }
    if (this.mode === "studio") {
      const summary = this.getStudioProjectSummary();
      if (this.studioTab === "inspector") {
        return `
          <div class="stage-status-card">
            <div class="stage-status-main">
              <span class="stage-status-mode">Viewport</span>
              <strong>Inspector</strong>
              <small>Action ${renderSnapshot.selectedActionId ?? "-"} / frame ${actor?.runtime.frameIndex ?? "-"} / sprite ${frame ? `${frame.spriteGroup},${frame.spriteIndex}` : "-"}</small>
            </div>
            <div class="stage-status-grid" aria-label="Inspector collision summary">
              ${this.renderStageStatusMetric("Clsn1", String(frame?.clsn1.length ?? 0), frame?.clsn1.length ? "active" : undefined, "hit")}
              ${this.renderStageStatusMetric("Clsn2", String(frame?.clsn2.length ?? 0), frame?.clsn2.length ? "ok" : undefined, "hurt")}
            </div>
          </div>
        `;
      }
      const gateIssues = summary.gates.filter((gate) => gate.status === "warn" || gate.status === "fail" || gate.status === "pending").length;
      const traceCount = this.traceArtifacts.length + this.storedTraceEvidence.length;
      const compiled = this.lastCompiledProject;
      const tabLabel = labelForStudioTab(this.studioTab);
      const pauseLabel = this.snapshot.matchPause
        ? `${this.snapshot.matchPause.type === "SuperPause" ? "super" : "pause"} ${this.snapshot.matchPause.remaining}f`
        : actor?.hitPause
          ? `hit ${actor.hitPause}f`
          : "live";
      return `
        <div class="stage-status-card">
          <div class="stage-status-main">
            <span class="stage-status-mode">Viewport</span>
            <strong>${escapeHtml(tabLabel)}</strong>
            <small>Playtest ${escapeHtml(actor?.label ?? "P1")} vs ${escapeHtml(opponent?.label ?? "CPU")}</small>
          </div>
          <div class="stage-status-grid" aria-label="Studio state summary">
            ${this.renderStageStatusMetric("Gates", `${summary.gates.length - gateIssues}/${summary.gates.length}`, gateIssues > 0 ? "warn" : "ok", "shield")}
            ${this.renderStageStatusMetric("Assets", `${summary.stats.characters}c / ${summary.stats.stages}s`, undefined, "assets")}
            ${this.renderStageStatusMetric("Trace", traceCount ? String(traceCount) : "none", traceCount ? "ok" : "warn", "evidence")}
            ${this.renderStageStatusMetric("Build", compiled ? "ready" : "pending", compiled ? "ok" : "warn", "build")}
            ${this.renderStageStatusMetric("Pause", pauseLabel, this.snapshot.matchPause || actor?.hitPause ? "active" : undefined, "pause")}
          </div>
        </div>
      `;
    }
    if (!this.character) {
      return `
        <div class="stage-status-card">
          <div class="stage-status-main">
            <span class="stage-status-mode">Inspector Mode</span>
            <strong>No character loaded</strong>
            <small>Drop ZIP or choose Folder</small>
          </div>
        </div>
      `;
    }
    const decodedSprites = this.character.spriteArchive?.sprites.length ?? 0;
    const spriteTotal = this.character.spriteArchive?.metadata?.spriteTotal ?? decodedSprites;
    return `
      <div class="stage-status-card">
        <div class="stage-status-main">
          <span class="stage-status-mode">Character data</span>
          <strong>Action ${this.snapshot.selectedActionId ?? "-"}</strong>
          <small>Frame ${actor?.runtime.frameIndex ?? "-"} / sprite ${frame ? `${frame.spriteGroup},${frame.spriteIndex}` : "mock"}</small>
        </div>
        <div class="stage-status-grid" aria-label="Character preview summary">
          ${this.renderStageStatusMetric("SFF", decodedSprites > 0 ? `${decodedSprites}/${spriteTotal}` : "mock fallback", decodedSprites > 0 ? "ok" : "warn", "assetAtlas")}
        </div>
      </div>
    `;
  }

  private renderStageStatusMetric(label: string, value: string, tone?: "active" | "ok" | "warn" | "error", icon?: StudioIconName): string {
    return `
      <span class="stage-status-metric ${tone ? `is-${tone}` : ""} ${icon ? "has-icon" : ""}">
        ${icon ? tablerIcon(icon, "ui-icon stage-status-icon") : ""}
        <small>${escapeHtml(label)}</small>
        <b>${escapeHtml(value)}</b>
      </span>
    `;
  }

  private rebuildMatchRuntime(): void {
    const p1 = this.findFighter(this.selectedP1) ?? demoFighters[0]!;
    let p2 = this.findFighter(this.selectedP2) ?? demoFighters[1]!;
    const stage = this.findStage(this.selectedStageId) ?? rooftopDojoStage;
    this.selectedStageId = stage.id;
    if (p1.id === p2.id) {
      p2 = this.getAvailableFighters().find((fighter) => fighter.id !== p1.id) ?? p2;
      this.selectedP2 = p2.id;
    }
    this.syncMatchSpriteOwnerRoutes(p1, p2);
    this.matchRuntime = new MatchWorld({
      p1,
      p2,
      stage,
      ...(this.runtimeQaScenario === "ikemen-tag-presentation"
        ? {
            runtimeProfile: "ikemen-go" as const,
            teamMode: "tag" as const,
            reserveFighters: [p1, p2],
          }
        : {}),
    });
  }

  private applyTagPresentationQaHandoff(): void {
    if (this.runtimeQaScenario !== "ikemen-tag-presentation") {
      throw new Error("Tag presentation QA handoff requires the dedicated scenario");
    }
    this.snapshot = this.matchRuntime.dispatch({
      type: "set-root-standby",
      changes: [
        { id: "p1", standby: true },
        { id: "p3", standby: false },
      ],
    });
    this.updateUi();
  }

  private resetTagPresentationQaScenario(): void {
    if (this.runtimeQaScenario !== "ikemen-tag-presentation") {
      throw new Error("Tag presentation QA reset requires the dedicated scenario");
    }
    this.snapshot = this.matchRuntime.reset();
    this.updateUi();
  }

  private syncMatchSpriteOwnerRoutes(p1: DemoFighterDefinition, p2: DemoFighterDefinition): void {
    this.spriteProvider.clearRoutesByTag("match-owner");
    const imported = this.importedFighter;
    const provider = this.importedSffProvider;
    if (!imported || !provider) {
      return;
    }
    if (p1.id === imported.id) {
      this.spriteProvider.registerOwner("p1", provider, "match-owner");
    }
    if (p2.id === imported.id) {
      this.spriteProvider.registerOwner("p2", provider, "match-owner");
    }
  }

  private getActiveSnapshot(): MugenSnapshot {
    return this.isInspectorRuntimeSurface() ? this.inspectorRuntime.getSnapshot() : this.matchRuntime.getSnapshot();
  }

  private getActiveActorRegistry(): MatchWorldActorRegistrySnapshot | undefined {
    return this.isInspectorRuntimeSurface() ? undefined : this.matchRuntime.getActorRegistry();
  }

  private isInspectorRuntimeSurface(): boolean {
    return this.mode === "inspect" || (this.mode === "studio" && this.studioTab === "inspector");
  }

  private getAvailableFighters(): DemoFighterDefinition[] {
    return this.importedFighter ? [this.importedFighter, ...demoFighters] : demoFighters;
  }

  private findFighter(id: string): DemoFighterDefinition | undefined {
    return this.getAvailableFighters().find((fighter) => fighter.id === id);
  }

  private getAvailableStages(): MugenStageDefinition[] {
    return [rooftopDojoStage, trainingStage, bgCtrlLabStage, ...this.importedStages.map((stage) => stage.stage)];
  }

  private findStage(id: string): MugenStageDefinition | undefined {
    return this.getAvailableStages().find((stage) => stage.id === id);
  }

  private getStageCompatibilityReports(): StageCompatibilityReport[] {
    return this.importedStages.map((stage) => createStageCompatibilityReport(stage));
  }

  private getStageCompatibilityReportFor(stageId: string): StageCompatibilityReport | undefined {
    const stagePackage = this.importedStages.find((stage) => stage.stage.id === stageId);
    return stagePackage ? createStageCompatibilityReport(stagePackage) : undefined;
  }

  private getStudioProjectSummary(): StudioProjectSummary {
    const stage = this.findStage(this.selectedStageId) ?? rooftopDojoStage;
    const summary = buildStudioProjectSummary({
      fighters: this.getAvailableFighters(),
      selectedP1: this.selectedP1,
      selectedP2: this.selectedP2,
      stage,
      stages: this.getAvailableStages(),
      character: this.character,
      stageReports: this.getStageCompatibilityReports(),
      atlasStatusByFighter: Object.fromEntries(this.atlasStatusByFighter),
      atlasMotionQaByFighter: Object.fromEntries(this.atlasMotionQaByFighter),
    });
    return this.projectNameOverride ? { ...summary, name: this.projectNameOverride } : summary;
  }

  private getGameProjectManifest(summary = this.getStudioProjectSummary()): GameProjectManifest {
    const sourcePackages = this.getProjectSourcePackages();
    const generated = buildGameProjectManifest(summary, { engineVersion: "mugen-web-sandbox@0.0.0", sourcePackages });
    return this.importedProjectManifest
      ? { ...generated, id: this.importedProjectManifest.id, name: this.importedProjectManifest.name, sourcePackages }
      : generated;
  }

  private getProjectSourcePackages(): GameProjectSourcePackage[] {
    const currentPackage = this.getCurrentImportedSourcePackage();
    if (this.importedProjectManifest?.sourcePackages.length) {
      const sourcePackages = currentPackage
        ? relinkGameProjectSourcePackages(this.importedProjectManifest.sourcePackages, {
            name: currentPackage.name,
            kind: currentPackage.kind,
            fileCount: currentPackage.fileCount,
            paths: this.importedSourceBundle?.vfs.listFiles() ?? currentPackage.requiredPaths,
            fingerprint: currentPackage.fingerprint,
            byteLength: currentPackage.byteLength,
            fileDigests: this.importedSourceBundle?.fingerprint.files ?? currentPackage.fileDigests,
          }).sourcePackages
        : this.importedProjectManifest.sourcePackages;
      return sourcePackages.map((sourcePackage) => ({
        ...sourcePackage,
        status: this.isSourcePackageLinked(sourcePackage) ? "linked" : "missing",
        identityStatus: this.importedSourceBundle ? sourcePackage.identityStatus ?? "unknown" : "missing",
      }));
    }

    return currentPackage ? [currentPackage] : [];
  }

  private getSourceTransactionRecords(): SourceTransactionRecord[] {
    const sourcePackages = this.getProjectSourcePackages();
    if (!sourcePackages.length) {
      return [];
    }
    const permission = this.getSourceTransactionPermission();
    const expectedRevision = this.projectStorageConflict?.expectedRevision ?? this.projectStorageRevision;
    const observedRevision = this.projectStorageConflict?.actualRevision ?? this.projectStorageRevision;
    return sourcePackages.map((sourcePackage) => createSourceTransactionRecord({
      sourcePackage,
      permission,
      expectedRevision,
      observedRevision,
      conflict: Boolean(this.projectStorageConflict),
    }));
  }

  private getSourceHandleRecords(): SourceHandleRecord[] {
    const entries = new Map(this.sourceHandleEntries.map((entry) => [entry.record.sourcePackageId, entry]));
    return this.getProjectSourcePackages().map((sourcePackage) => {
      const entry = entries.get(sourcePackage.id);
      return createSourceHandleRecord({
        sourcePackage,
        capability: this.sourceHandleCapability,
        storage: this.sourceHandleStorage,
        permission: entry?.record.permission ?? "not-requested",
        handleLinked: Boolean(entry?.handle),
        persisted: Boolean(entry?.record.persisted),
        sourceAvailable: entry ? entry.record.state !== "missing" : false,
        observedFingerprint: entry?.record.observedFingerprint,
        observedByteLength: entry?.record.observedByteLength,
        handleKind: entry?.record.handleKind,
        updatedAt: entry?.record.updatedAt,
      });
    });
  }

  private getSourceTransactionPermission(): SourceTransactionPermission {
    const browser = window as Window & {
      showOpenFilePicker?: unknown;
      showSaveFilePicker?: unknown;
    };
    return typeof browser.showOpenFilePicker === "function" || typeof browser.showSaveFilePicker === "function"
      ? "not-requested"
      : "unsupported";
  }

  private getCurrentImportedSourcePackage(): GameProjectSourcePackage | undefined {
    if (this.importedSourceBundle && this.character) {
      const importedStageIds = this.importedStages.map((stage) => stage.stage.id);
      const importedStageDefPaths = this.importedStages.map((stage) => stage.files.def).filter(isNonEmptyString);
      const requiredPaths = uniqueStrings(
        [
          this.character.files.def ?? this.character.defPath,
          this.character.files.sprite,
          this.character.files.anim,
          this.character.files.cmd,
          this.character.files.cns,
          this.character.files.sound,
          ...this.character.files.states,
          ...this.character.files.commonStates,
          ...this.character.files.palettes,
          ...this.importedStages.flatMap((stage) => [stage.files.def, stage.files.sprite, stage.files.music]),
        ].filter(isNonEmptyString),
      );
      return {
        id: sanitizePackageSegment(this.importedSourceBundle.sourceName),
        name: this.importedSourceBundle.sourceName,
        kind: this.importedSourceBundle.sourceKind,
        fileCount: this.importedSourceBundle.fileCount,
        status: "linked",
        fingerprint: this.importedSourceBundle.fingerprint.digest,
        fingerprintAlgorithm: this.importedSourceBundle.fingerprint.algorithm,
        byteLength: this.importedSourceBundle.fingerprint.byteLength,
        fileDigests: this.importedSourceBundle.fingerprint.files,
        observedFingerprint: this.importedSourceBundle.fingerprint.digest,
        observedByteLength: this.importedSourceBundle.fingerprint.byteLength,
        identityStatus: "matched",
        characterId: this.importedFighter?.id,
        characterName: this.character.definition.info.displayName ?? this.character.definition.info.name ?? this.character.sourceName,
        defPath: this.character.files.def ?? this.character.defPath,
        stageIds: importedStageIds,
        stageDefPaths: importedStageDefPaths,
        requiredPaths,
      };
    }
    return undefined;
  }

  private isSourcePackageLinked(sourcePackage: GameProjectSourcePackage): boolean {
    return Boolean(
      this.importedSourceBundle &&
      this.importedSourceBundle.sourceKind === sourcePackage.kind &&
        this.importedSourceBundle.sourceName === sourcePackage.name &&
        sourcePackage.identityStatus !== "changed",
    );
  }

  private buildRuntimeRosterReport(): RuntimeRosterEntry[] {
    return this.getAvailableFighters().map((fighter) => {
      if (fighter.source === "imported") {
        return {
          id: fighter.id,
          displayName: fighter.displayName,
          source: "imported",
          selected: fighter.id === this.selectedP1 || fighter.id === this.selectedP2,
          atlasStatus: "imported",
          walkQaStatus: "not-applicable",
          walkQaCheckedStates: [],
          walkQaWarnings: [],
          walkQaErrors: [],
        };
      }
      const qa = this.atlasMotionQaByFighter.get(fighter.id) ?? {
        status: "missing" as const,
        checkedStates: [],
        warnings: ["No motion QA report loaded for fighter"],
        errors: [],
      };
      return {
        id: fighter.id,
        displayName: fighter.displayName,
        source: "demo",
        selected: fighter.id === this.selectedP1 || fighter.id === this.selectedP2,
        atlasStatus: this.atlasStatusByFighter.get(fighter.id) ?? "loading",
        walkQaStatus: qa.status,
        walkQaCheckedStates: [...qa.checkedStates],
        walkQaWarnings: [...qa.warnings],
        walkQaErrors: [...qa.errors],
      };
    });
  }

  private renderMotionQaBadge(fighterId: string): string {
    const qa = this.atlasMotionQaByFighter.get(fighterId);
    if (!qa) {
      return "";
    }
    if (qa.status === "loading") {
      return `<span class="badge">walk QA loading</span>`;
    }
    if (qa.status === "pass") {
      return `<span class="badge ok">walk QA ok</span>`;
    }
    if (qa.status === "warn") {
      return `<span class="badge warn">walk QA warn ${qa.warnings.length}</span>`;
    }
    if (qa.status === "missing") {
      return `<span class="badge warn">walk QA missing</span>`;
    }
    return `<span class="badge error">walk QA fail ${qa.errors.length}</span>`;
  }

  private getActiveCommandNames(commands = this.character?.commands ?? []): string[] {
    const names: string[] = [];
    const seen = new Set<string>();
    for (const command of commands) {
      if (seen.has(command.name)) {
        continue;
      }
      if (this.commandBuffer.isCommandActive(command.name, commands)) {
        names.push(command.name);
        seen.add(command.name);
      }
    }
    return names;
  }
}

function formatHudMatchPause(pause: MugenSnapshot["matchPause"]): string {
  if (!pause) {
    return "";
  }
  return `${pause.type} ${pause.remaining}f`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStageNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/g, "").replace(/\.$/g, "");
}

function formatStageTrans(trans: { mode: string; alpha?: { source: number; destination: number } }): string {
  const alpha = trans.alpha ? ` ${formatStageNumber(trans.alpha.source)},${formatStageNumber(trans.alpha.destination)}` : "";
  return `trans ${trans.mode}${alpha}`;
}

function formatStageScale(scale: {
  start: { x: number; y: number };
  delta: { x: number; y: number };
  legacyYScale?: { start?: number; delta?: number };
  zoomDelta?: { x: number; y: number };
}): string {
  const legacy = scale.legacyYScale
    ? ` y${formatStageNumber(scale.legacyYScale.start ?? 100)},${formatStageNumber(scale.legacyYScale.delta ?? 0)}`
    : "";
  const zoom = scale.zoomDelta ? ` z${formatStageNumber(scale.zoomDelta.x)},${formatStageNumber(scale.zoomDelta.y)}` : "";
  return `scale ${formatStageNumber(scale.start.x)},${formatStageNumber(scale.start.y)} d${formatStageNumber(scale.delta.x)},${formatStageNumber(scale.delta.y)}${legacy}${zoom}`;
}

function formatStagePositionLink(link: { targetId: string; offsetX: number; offsetY: number }): string {
  return `link ${link.targetId} +${formatStageNumber(link.offsetX)},${formatStageNumber(link.offsetY)}`;
}

function formatStageClip(clip: {
  source: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delta?: { x: number; y: number };
}): string {
  const rect = `${formatStageNumber(clip.x1)},${formatStageNumber(clip.y1)},${formatStageNumber(clip.x2)},${formatStageNumber(clip.y2)}`;
  const delta = clip.delta ? ` d${formatStageNumber(clip.delta.x)},${formatStageNumber(clip.delta.y)}` : "";
  return `${clip.source} ${rect}${delta}`;
}

function formatCommandSequence(command: MugenCharacter["commands"][number]): string {
  if (command.disabled) {
    return `disabled(${command.rawCommand})`;
  }
  if (!command.remapped) {
    return command.rawCommand;
  }
  return `${command.rawCommand}->${command.resolvedCommand}`;
}

function parseStudioEvidenceFilter(value: string | null | undefined): StudioEvidenceFilter | undefined {
  return value === "all" ||
    value === "attention" ||
    value === "gate" ||
    value === "asset" ||
    value === "trace" ||
    value === "compile" ||
    value === "compatibility" ||
    value === "diagnostic"
    ? value
    : undefined;
}

function parseStudioAssetFilter(value: string | null | undefined): StudioAssetFilter | undefined {
  return value === "all" ||
    value === "attention" ||
    value === "characters" ||
    value === "stages" ||
    value === "generated" ||
    value === "imported" ||
    value === "reports" ||
    value === "selected"
    ? value
    : undefined;
}

function parseStudioDebugFilter(value: string | null | undefined): StudioDebugFilter | undefined {
  return value === "overview" || value === "targets" || value === "effects" || value === "pause" || value === "audio"
    ? value
    : undefined;
}

function isAttentionStatus(status: StudioStatus): boolean {
  return status === "warn" || status === "fail" || status === "pending" || status === "partial" || status === "planned" || status === "blocked" || status === "unsupported" || status === "unknown";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSourcePackageRelinkWarning(value: string): boolean {
  return (
    (value.startsWith("Source package '") || value.startsWith("Source package target '")) &&
    (value.includes("is required for full export") || value.includes("could not be relinked") || value.includes("does not exist"))
  );
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function countBy<T>(values: T[], getKey: (value: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = getKey(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function dedupeBundleAssetCandidates(candidates: ProjectExportBundleAssetCandidate[]): ProjectExportBundleAssetCandidate[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${candidate.sourcePath}->${candidate.packagePath}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function sanitizePackageSegment(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-|-$/g, "") || "asset"
  );
}

function fileNameFromPath(value: string): string {
  const clean = value.split("?")[0]?.split("#")[0] ?? value;
  return sanitizePackageSegment(clean.split("/").filter(Boolean).at(-1) ?? "asset.bin");
}

function sanitizePackagePath(value: string): string {
  return value
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map(sanitizePackageSegment)
    .join("/");
}

function contentTypeForPath(value: string): string | undefined {
  const extension = value.split("?")[0]?.split("#")[0]?.split(".").at(-1)?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "json") return "application/json";
  if (extension === "txt" || extension === "def" || extension === "air" || extension === "cmd" || extension === "cns" || extension === "st") return "text/plain";
  if (extension === "wav") return "audio/wav";
  if (extension === "mp3") return "audio/mpeg";
  if (extension === "ogg") return "audio/ogg";
  return undefined;
}

function sourceFilePathMatches(left: string, right: string): boolean {
  const normalizedLeft = left.replace(/\\/g, "/").toLowerCase();
  const normalizedRight = right.replace(/\\/g, "/").toLowerCase();
  return normalizedLeft === normalizedRight || normalizedLeft.endsWith(`/${normalizedRight}`) || normalizedRight.endsWith(`/${normalizedLeft}`);
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }
  const units = ["KB", "MB", "GB"];
  let scaled = value / 1024;
  for (const unit of units) {
    if (scaled < 1024) {
      return `${scaled.toFixed(scaled >= 10 ? 1 : 2)} ${unit}`;
    }
    scaled /= 1024;
  }
  return `${scaled.toFixed(1)} TB`;
}

function formatSignedDelta(value: number | undefined): string {
  if (value === undefined) {
    return "n/a";
  }
  return value > 0 ? `+${value}` : `${value}`;
}

function formatDecimal(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/0+$/g, "").replace(/\.$/g, "");
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
    return bytesToHex(new Uint8Array(digest));
  }
  return fnv1aHex(new Uint8Array(buffer));
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fnv1aHex(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
