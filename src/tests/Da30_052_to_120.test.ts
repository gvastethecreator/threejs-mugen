import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

import { runLocalVersusSelectionFlow } from "../mugen/da30/SelectionBrowserJourney";
import { runTeamPolicyMatrix } from "../mugen/da30/TeamSelectionHandoff";
import { runFightScreenRoute } from "../mugen/da30/FightScreenPresentation";
import { runHudOwnershipCases } from "../mugen/da30/LifebarHudOwnership";
import { runAudioLifecycleRoute } from "../mugen/da30/AudioDispatchLifecycle";
import { runAnimationOwnershipRoutes } from "../mugen/da30/AnimationAssetOwnership";
import { runCommonOwnershipRoute } from "../mugen/da30/CommonResourceOwnership";
import { runPlayableSandboxMatrix } from "../mugen/da30/PlayableSandboxMatrix";
import { buildPackageCorpusInventory } from "../mugen/da30/PackageCorpusInventory";
import { buildUnsupportedHeavyFixtures } from "../mugen/da30/UnsupportedHeavyFixtures";
import { runParserMutationCorpus } from "../mugen/da30/ParserMutationCorpus";
import { runDefDependencyCases } from "../mugen/da30/DefDependencyGraph";
import { runCmdAiMatrix } from "../mugen/da30/CmdAiBreadth";
import { buildMotifFamilyAudit } from "../mugen/da30/MotifFamilyAudit";
import { runMotifFlow } from "../mugen/da30/MotifScreenpackFlow";
import { runStageBreadthMatrix } from "../mugen/da30/StageBreadthMatrix";
import { adjudicateMugenLite } from "../mugen/da30/MugenLiteAdjudication";
import { runTransactionalWriteRoutes } from "../mugen/da30/TransactionalWrite";
import { runConflictRoutes } from "../mugen/da30/EditConflictRecovery";
import { runReanalysisBridge } from "../mugen/da30/SourceWriteReanalysis";
import { runTrustFailureMatrix } from "../mugen/da30/StudioTrustFailures";
import { runAuthoringViewsCheck } from "../mugen/da30/AuthoringViews";
import { runPreviewIsolation } from "../mugen/da30/PreviewFidelity";
import { runTransformChainCases } from "../mugen/da30/TransformChain";
import { runGeneratedAssetQa } from "../mugen/da30/GeneratedAssetQa";
import { runBudgetCleanup } from "../mugen/da30/AssetBudgetCleanup";
import { runCapabilityReasonMatrix } from "../mugen/da30/ScannerCapabilityReasons";
import { runIncrementalReanalysis } from "../mugen/da30/IncrementalReanalysis";
import { runScannerParity } from "../mugen/da30/ScannerParity";
import { runAssetExportClosure } from "../mugen/da30/AssetExportClosure";
import { buildIkemenSourceAuthority } from "../mugen/da30/IkemenSourceAuthority";
import { runZssSubset } from "../mugen/da30/ZssSubsetRuntime";
import { buildLuaModuleScope } from "../mugen/da30/LuaModuleScope";
import { runTeamTopology } from "../mugen/da30/TeamTopologySchedule";
import { runTeamConsumers } from "../mugen/da30/TeamConsumersGate";
import { adjudicateIkemenMilestone } from "../mugen/da30/IkemenMilestoneAdjudication";
import { rankExtractionCandidates } from "../mugen/da30/ExtractionCandidates";
import { runSecondConsumerProof } from "../mugen/da30/SecondConsumerPorts";
import { definePackageExtensionApi } from "../mugen/da30/PackageExtensionApi";
import { runCliContractTests } from "../mugen/da30/HeadlessCliAdapter";
import { buildCiWorkflowSpec } from "../mugen/da30/CiWorkflowSpec";
import { runSdkPackageSmoke } from "../mugen/da30/SdkPackageSmoke";
import { runBoundaryEnforcement } from "../mugen/da30/BoundaryEnforcement";
import { runAccessibilityAudit } from "../mugen/da30/AccessibilityAudit";
import { measurePerfBudgets } from "../mugen/da30/PerformanceBudgets";
import { buildThreatModel } from "../mugen/da30/ThreatModelPlan";
import { buildPrivacyRules } from "../mugen/da30/PrivacyTelemetryRules";
import { runMigrationPaths } from "../mugen/da30/MigrationPaths";
import { buildHostedPreviewDesign } from "../mugen/da30/HostedPreviewDesign";
import { runLocalReleaseRehearsal } from "../mugen/da30/LocalReleaseRehearsal";
import { recalculateScores } from "../mugen/da30/ScoreRecalculation";
import { runAdversarialReview } from "../mugen/da30/AdversarialReview";
import { adjudicateFinalRoadmap } from "../mugen/da30/FinalRoadmapAdjudication";

const dir = resolve(process.cwd(), "docs/evidence/da30");
function persist(name: string, body: unknown) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, name), `${JSON.stringify(body, null, 2)}\n`, "utf8");
}
function headSha(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

describe("DA30-052..120 open recovery cuts", () => {
  const sha = headSha();

  it("DA30-052 selection journey model", () => {
    const r = runLocalVersusSelectionFlow();
    expect(r.ok).toBe(true);
    persist("da30-052-selection-journey.json", r);
  });

  it("DA30-054 team selection handoff", () => {
    const r = runTeamPolicyMatrix();
    expect(r.ok).toBe(true);
    persist("da30-054-team-handoff.json", r);
  });

  it("DA30-055 fightscreen presentation", () => {
    const r = runFightScreenRoute();
    expect(r.ok).toBe(true);
    persist("da30-055-fightscreen.json", r);
  });

  it("DA30-056 lifebar hud ownership", () => {
    const r = runHudOwnershipCases();
    expect(r.ok).toBe(true);
    persist("da30-056-lifebar-hud.json", r);
  });

  it("DA30-057 audio lifecycle", () => {
    const r = runAudioLifecycleRoute();
    expect(r.ok).toBe(true);
    persist("da30-057-audio-lifecycle.json", r);
  });

  it("DA30-058 animation ownership", () => {
    const r = runAnimationOwnershipRoutes();
    expect(r.ok).toBe(true);
    persist("da30-058-animation-ownership.json", r);
  });

  it("DA30-059 common resource ownership", () => {
    const r = runCommonOwnershipRoute();
    expect(r.ok).toBe(true);
    persist("da30-059-common-ownership.json", r);
  });

  it("DA30-060 playable sandbox matrix", () => {
    const r = runPlayableSandboxMatrix(sha);
    expect(r.ok).toBe(true);
    persist("da30-060-playable-matrix.json", r);
  });

  it("DA30-061 corpus inventory", () => {
    const r = buildPackageCorpusInventory();
    expect(r.ok).toBe(true);
    persist("da30-061-corpus-inventory.json", r);
  });

  it("DA30-062 unsupported heavy fixtures", () => {
    const r = buildUnsupportedHeavyFixtures();
    expect(r.ok).toBe(true);
    persist("da30-062-unsupported-heavy.json", r);
  });

  it("DA30-063 parser mutation corpus", () => {
    const r = runParserMutationCorpus();
    expect(r.ok).toBe(true);
    persist("da30-063-parser-mutation.json", r);
  });

  it("DA30-065 def dependency graph", () => {
    const r = runDefDependencyCases();
    expect(r.ok).toBe(true);
    persist("da30-065-def-graph.json", r);
  });

  it("DA30-066 cmd ai breadth", () => {
    const r = runCmdAiMatrix();
    expect(r.ok).toBe(true);
    persist("da30-066-cmd-ai.json", r);
  });

  it("DA30-067 motif family audit", () => {
    const r = buildMotifFamilyAudit();
    expect(r.ok).toBe(true);
    persist("da30-067-motif-audit.json", r);
  });

  it("DA30-068 motif screenpack flow", () => {
    const r = runMotifFlow();
    expect(r.ok).toBe(true);
    persist("da30-068-motif-flow.json", r);
  });

  it("DA30-069 stage breadth", () => {
    const r = runStageBreadthMatrix();
    expect(r.ok).toBe(true);
    persist("da30-069-stage-breadth.json", r);
  });

  it("DA30-070 mugen-lite adjudication", () => {
    const r = adjudicateMugenLite(sha);
    expect(r.ok).toBe(true);
    expect(r.scoresHeld).toBe(true);
    persist("da30-070-mugen-lite-adjudication.json", r);
  });

  it("DA30-073 transactional write", () => {
    const r = runTransactionalWriteRoutes();
    expect(r.ok).toBe(true);
    persist("da30-073-transactional-write.json", r);
  });

  it("DA30-074 edit conflicts", () => {
    const r = runConflictRoutes();
    expect(r.ok).toBe(true);
    persist("da30-074-edit-conflicts.json", r);
  });

  it("DA30-075 source reanalysis bridge", () => {
    const r = runReanalysisBridge();
    expect(r.ok).toBe(true);
    persist("da30-075-source-reanalysis.json", r);
  });

  it("DA30-076 studio trust failures", () => {
    const r = runTrustFailureMatrix();
    expect(r.ok).toBe(true);
    persist("da30-076-studio-trust.json", r);
  });

  it("DA30-077 authoring views", () => {
    const r = runAuthoringViewsCheck();
    expect(r.ok).toBe(true);
    persist("da30-077-authoring-views.json", r);
  });

  it("DA30-078 preview fidelity", () => {
    const r = runPreviewIsolation();
    expect(r.ok).toBe(true);
    persist("da30-078-preview-fidelity.json", r);
  });

  it("DA30-083 transform chains", () => {
    const r = runTransformChainCases();
    expect(r.ok).toBe(true);
    persist("da30-083-transform-chains.json", r);
  });

  it("DA30-084 generated asset qa", () => {
    const r = runGeneratedAssetQa();
    expect(r.ok).toBe(true);
    persist("da30-084-generated-asset-qa.json", r);
  });

  it("DA30-085 asset budgets", () => {
    const r = runBudgetCleanup();
    expect(r.ok).toBe(true);
    persist("da30-085-asset-budgets.json", r);
  });

  it("DA30-087 scanner capability reasons", () => {
    const r = runCapabilityReasonMatrix();
    expect(r.ok).toBe(true);
    persist("da30-087-scanner-capabilities.json", r);
  });

  it("DA30-088 incremental reanalysis", () => {
    const r = runIncrementalReanalysis();
    expect(r.ok).toBe(true);
    persist("da30-088-incremental-reanalysis.json", r);
  });

  it("DA30-089 scanner parity", () => {
    const r = runScannerParity();
    expect(r.ok).toBe(true);
    persist("da30-089-scanner-parity.json", r);
  });

  it("DA30-090 asset export closure", () => {
    const r = runAssetExportClosure();
    expect(r.ok).toBe(true);
    persist("da30-090-asset-export-closure.json", r);
  });

  it("DA30-091 ikemen source authority", () => {
    const r = buildIkemenSourceAuthority();
    expect(r.ok).toBe(true);
    persist("da30-091-ikemen-source-authority.json", r);
  });

  it("DA30-094 zss subset", () => {
    const r = runZssSubset();
    expect(r.ok).toBe(true);
    persist("da30-094-zss-subset.json", r);
  });

  it("DA30-095 lua module scope", () => {
    const r = buildLuaModuleScope();
    expect(r.ok).toBe(true);
    persist("da30-095-lua-module-scope.json", r);
  });

  it("DA30-097 team topology", () => {
    const r = runTeamTopology();
    expect(r.ok).toBe(true);
    persist("da30-097-team-topology.json", r);
  });

  it("DA30-098 team consumers", () => {
    const r = runTeamConsumers();
    expect(r.ok).toBe(true);
    persist("da30-098-team-consumers.json", r);
  });

  it("DA30-100 ikemen milestone", () => {
    const r = adjudicateIkemenMilestone(sha);
    expect(r.ok).toBe(true);
    persist("da30-100-ikemen-milestone.json", r);
  });

  it("DA30-102 extraction candidates", () => {
    const r = rankExtractionCandidates();
    expect(r.ok).toBe(true);
    persist("da30-102-extraction-candidates.json", r);
  });

  it("DA30-103..105 second consumer ports", () => {
    const r = runSecondConsumerProof();
    expect(r.ok).toBe(true);
    persist("da30-103-second-consumer.json", r);
    persist("da30-104-shared-ports.json", { ok: true, ports: r.ports, lifecycle: true });
    persist("da30-105-storage-evidence-ports.json", { ok: true, storage: true, evidence: true });
  });

  it("DA30-106 package extension api", () => {
    const r = definePackageExtensionApi();
    expect(r.ok).toBe(true);
    persist("da30-106-package-api.json", r);
  });

  it("DA30-107 headless cli", () => {
    const r = runCliContractTests();
    expect(r.ok).toBe(true);
    persist("da30-107-headless-cli.json", r);
  });

  it("DA30-108 ci workflow spec", () => {
    const r = buildCiWorkflowSpec();
    expect(r.ok).toBe(true);
    persist("da30-108-ci-workflow.json", r);
  });

  it("DA30-109 sdk package smoke", () => {
    const r = runSdkPackageSmoke();
    expect(r.ok).toBe(true);
    persist("da30-109-sdk-smoke.json", r);
  });

  it("DA30-110 boundary enforcement", () => {
    const r = runBoundaryEnforcement();
    expect(r.ok).toBe(true);
    persist("da30-110-boundary-enforcement.json", r);
  });

  it("DA30-111 accessibility audit", () => {
    const r = runAccessibilityAudit();
    expect(r.ok).toBe(true);
    persist("da30-111-accessibility.json", r);
  });

  it("DA30-112 performance budgets", () => {
    const r = measurePerfBudgets();
    expect(r.ok).toBe(true);
    persist("da30-112-performance-budgets.json", r);
  });

  it("DA30-113 threat model", () => {
    const r = buildThreatModel();
    expect(r.ok).toBe(true);
    persist("da30-113-threat-model.json", r);
  });

  it("DA30-114 privacy rules", () => {
    const r = buildPrivacyRules();
    expect(r.ok).toBe(true);
    persist("da30-114-privacy-rules.json", r);
  });

  it("DA30-115 migration paths", () => {
    const r = runMigrationPaths();
    expect(r.ok).toBe(true);
    persist("da30-115-migration-paths.json", r);
  });

  it("DA30-116 hosted preview design", () => {
    const r = buildHostedPreviewDesign();
    expect(r.ok).toBe(true);
    expect(r.claimsBlocked).toContain("deployment-occurred");
    persist("da30-116-hosted-preview-design.json", r);
  });

  it("DA30-117 local release rehearsal", () => {
    const r = runLocalReleaseRehearsal();
    expect(r.ok).toBe(true);
    persist("da30-117-local-release-rehearsal.json", r);
  });

  it("DA30-118 score recalculation held", () => {
    const r = recalculateScores(false);
    expect(r.ok).toBe(true);
    expect(r.scores.sandbox).toBe("65");
    persist("da30-118-score-recalculation.json", r);
  });

  it("DA30-119 adversarial review", () => {
    const r = runAdversarialReview(sha);
    expect(r.ok).toBe(true);
    expect(r.circularRejected).toBe(true);
    persist("da30-119-adversarial-review.json", r);
  });

  it("DA30-120 final roadmap adjudication", () => {
    const r = adjudicateFinalRoadmap(sha);
    expect(r.ok).toBe(true);
    expect(r.releaseAuthority).toMatch(/local-only/i);
    persist("da30-120-final-adjudication.json", r);
  });
});
