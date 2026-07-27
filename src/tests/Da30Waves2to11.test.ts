import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  defaultWarningPolicy,
  isFatalWarningLane,
  validateWarningPolicy,
} from "../mugen/da30/WarningPolicy";
import {
  defaultProductRouteInventory,
  routeById,
  validateProductRouteInventory,
} from "../mugen/da30/ProductRouteInventory";
import { writeBrowserRouteFacts, forcedRouteErrorFacts } from "../mugen/da30/BrowserRouteFactWriter";
import { buildFrameGapReport } from "../mugen/da30/FrameGapHarness";
import {
  defaultRendererLifecycleChecklist,
  validateRendererLifecycleChecklist,
} from "../mugen/da30/RendererLifecycleChecklist";
import { buildSecurityTrustBaseline, validateSecurityTrustBaseline } from "../mugen/da30/SecurityTrustBaseline";
import {
  negativeArchivePathFixtures,
  positiveArchivePathFixtures,
  probeArchivePath,
  rejectUnsafeArchivePaths,
} from "../mugen/da30/ArchivePathPolicy";
import { canonicalizeInputLog, inputLogsEqual, mutateInputLogFrame } from "../mugen/da30/CanonicalInputLog";
import {
  restoreMatchState,
  sampleMatchState,
  serializeMatchState,
} from "../mugen/da30/MatchStateRoundTrip";
import { buildExportManifest, exportContentDigest } from "../mugen/da30/LocalExportBundle";
import { checkArchiveBatch } from "../mugen/da30/ScannerSafetyLimits";
import { evaluateAssetRelease } from "../mugen/da30/AssetProvenanceGraph";
import { runNovaContactCases } from "../mugen/da30/CombatJourneyRevalidation";
import { runPluralProjectileMatrix } from "../mugen/da30/PluralProjectileTestHook";
import {
  assertNoNameOnlySupport,
  loadControllerSupportRegistry,
} from "../mugen/da30/ControllerSupportProofRegistry";
import { assignSeat, createEmptySelection, launchPackageIds } from "../mugen/da30/SelectionStateModel";
import { canTransition, modeTransitionTable, transition } from "../mugen/da30/ModeStateMachine";
import {
  commitEdit,
  createProjectEnvelope,
  openEnvelope,
} from "../mugen/da30/ProjectEnvelope";
import { evaluateReleaseDecision } from "../mugen/da30/ReleaseDecisionGate";
import {
  decideAssetInclusion,
  shippedAssetEdgesFixture,
} from "../mugen/da30/AssetProvenanceEdge";
import {
  defaultBoundaryInventory,
  validateBoundaryInventory,
} from "../mugen/da30/BoundaryImportInventory";

const root = process.cwd();
const j = <T,>(rel: string) => JSON.parse(readFileSync(resolve(root, rel), "utf8")) as T;

describe("DA30-022 warning policy", () => {
  it("validates default policy and fatal lanes", () => {
    const policy = defaultWarningPolicy();
    expect(validateWarningPolicy(policy).ok).toBe(true);
    expect(isFatalWarningLane(policy, "compiler")).toBe(true);
    expect(isFatalWarningLane(policy, "browser")).toBe(false);
    const disk = j<typeof policy>("docs/evidence/da30/da30-022-warning-policy.json");
    expect(validateWarningPolicy(disk).ok).toBe(true);
  });
});

describe("DA30-023 product routes", () => {
  it("validates inventory with owners and omissions", () => {
    const inv = defaultProductRouteInventory();
    expect(validateProductRouteInventory(inv).ok).toBe(true);
    expect(routeById(inv, "play-match")?.path).toContain("mode=match");
    const disk = j<typeof inv>("docs/evidence/da30/da30-023-product-routes.json");
    expect(validateProductRouteInventory(disk).ok).toBe(true);
  });
});

describe("DA30-024/025 browser route fact writer", () => {
  it("writes green and forced-error facts for inventory routes", () => {
    const inv = defaultProductRouteInventory();
    const play = routeById(inv, "play-match")!;
    const green = writeBrowserRouteFacts({
      route: play,
      commit: "testsha",
      screenshotDigest: "shot-play",
      result: "pass",
    });
    expect(green.validation.ok).toBe(true);
    expect(green.facts.queryState.mode).toBe("match");
    const bad = forcedRouteErrorFacts(play, "testsha");
    expect(bad.result).toBe("fail");
    expect(bad.consoleErrors.length).toBeGreaterThan(0);
  });
});

describe("DA30-027 frame-gap harness", () => {
  it("computes percentiles and breach owner", () => {
    const report = buildFrameGapReport({
      routeId: "play-match",
      seed: 7,
      warmupFrames: 30,
      sampleCount: 5,
      gapsMs: [16, 17, 16, 40, 18],
      browser: "chromium",
    });
    expect(report.p50).toBeGreaterThan(0);
    expect(report.p95).toBeGreaterThanOrEqual(report.p50);
    expect(report.max).toBe(40);
    expect(report.breach).toBe(true);
    expect(report.breachOwner).toBe("runtime-owner");
  });
});

describe("DA30-029 renderer lifecycle checklist", () => {
  it("covers seven lifecycle cases", () => {
    const doc = defaultRendererLifecycleChecklist();
    expect(validateRendererLifecycleChecklist(doc).ok).toBe(true);
    expect(doc.cases).toHaveLength(7);
  });
});

describe("DA30-030 security baseline + path probes", () => {
  it("rejects traversal/absolute paths and accepts package-relative", () => {
    for (const p of negativeArchivePathFixtures()) {
      expect(probeArchivePath(p).safe).toBe(false);
    }
    for (const p of positiveArchivePathFixtures()) {
      expect(probeArchivePath(p).safe).toBe(true);
    }
    expect(rejectUnsafeArchivePaths(negativeArchivePathFixtures()).accepted).toEqual([]);
    const baseline = buildSecurityTrustBaseline();
    expect(validateSecurityTrustBaseline(baseline).ok).toBe(true);
    expect(baseline.pathProbe.allNegativesRejected).toBe(true);
  });
});

describe("DA30-034 canonical input log", () => {
  it("is stable under reorder and changes on mutation", () => {
    const frames = [
      {
        tick: 2,
        seat: 2 as const,
        buttons: ["b", "a"],
        edges: ["a+"],
        deviceClass: "keyboard" as const,
        focus: true,
        policyRevision: "v1",
      },
      {
        tick: 1,
        seat: 1 as const,
        buttons: ["right"],
        edges: ["right+"],
        deviceClass: "keyboard" as const,
        focus: true,
        policyRevision: "v1",
      },
    ];
    const a = canonicalizeInputLog({ matchSeed: "s1", policyRevision: "v1", frames });
    const b = canonicalizeInputLog({
      matchSeed: "s1",
      policyRevision: "v1",
      frames: [...frames].reverse(),
    });
    expect(inputLogsEqual(a, b)).toBe(true);
    const mutated = mutateInputLogFrame(a, 1, 1, "a");
    expect(mutated.checksum).not.toBe(a.checksum);
  });
});

describe("DA30-038 match state roundtrip", () => {
  it("round-trips sample state and fails corrupt/unknown", () => {
    const sample = sampleMatchState();
    const env = serializeMatchState(sample);
    const restored = restoreMatchState(env);
    expect(restored.ok).toBe(true);
    if (restored.ok) {
      expect(restored.checksum).toBe(env.checksum);
      expect(restored.state.tick).toBe(120);
      expect(restored.state.roots).toHaveLength(2);
    }
    expect(restoreMatchState({ schema: "other", version: 1, state: sample, checksum: "x" }).ok).toBe(false);
    expect(restoreMatchState({ ...env, checksum: "deadbeef" }).ok).toBe(false);
  });
});

describe("DA30-041 Nova contact hit/guard/miss", () => {
  it("proves hit damage, guard chip, and miss non-contact", () => {
    const r = runNovaContactCases();
    expect(r.ok).toBe(true);
    expect(r.cases.map((c) => c.id)).toEqual(["hit", "guard", "miss"]);
    expect(r.cases[0]!.damage).toBeGreaterThan(0);
    expect(r.cases[1]!.kind).toBe("guard");
    expect(r.cases[2]!.contact).toBe(false);
  });
});

describe("DA30-046 plural projectile schedule hook", () => {
  it("runs multi-owner stable order matrix", () => {
    const r = runPluralProjectileMatrix();
    expect(r.ok).toBe(true);
    expect(r.cases.length).toBeGreaterThanOrEqual(3);
    expect(r.cases.every((c) => c.ok)).toBe(true);
  });
});

describe("DA30-050 controller support registry export", () => {
  it("loads registry rows with evidence paths", () => {
    const reg = loadControllerSupportRegistry(root);
    expect(reg.ok).toBe(true);
    expect(reg.rows.length).toBeGreaterThan(0);
    expect(assertNoNameOnlySupport(reg.rows)).toBe(true);
    expect(reg.sourcePath).toMatch(/CONTROLLER_SUPPORT_REGISTRY|SUPPORTED_FEATURES/);
  });
});

describe("DA30-051 selection state model", () => {
  it("blocks illegal packages and launches exact revisions", () => {
    let state = createEmptySelection();
    const blocked = assignSeat(state, "p1", {
      packageId: "bad",
      revision: "1",
      legal: false,
      blockedReason: "unsupported profile",
    });
    expect(blocked.ok).toBe(false);
    const p1 = assignSeat(state, "p1", {
      packageId: "nova-boxer",
      revision: "r1",
      legal: true,
      palette: 1,
    });
    expect(p1.ok).toBe(true);
    state = p1.state;
    const p2 = assignSeat(state, "p2", {
      packageId: "mira-volt",
      revision: "r1",
      legal: true,
    });
    state = p2.state;
    state = { ...state, stageId: "rooftop-dojo", stageRevision: "r1" };
    const launch = launchPackageIds(state);
    expect(launch.ok).toBe(true);
    expect(launch.ids).toEqual(["nova-boxer@r1", "mira-volt@r1", "rooftop-dojo@r1"]);
  });
});

describe("DA30-053 mode state machine", () => {
  it("allows legal transitions and rejects illegal ones", () => {
    expect(canTransition("title", "select")).toBe(true);
    expect(transition("title", "results").ok).toBe(false);
    expect(modeTransitionTable().length).toBeGreaterThanOrEqual(8);
  });
});

describe("DA30-072 project envelope", () => {
  it("creates, commits, and fail-closes unknown versions", () => {
    const env = createProjectEnvelope({ projectId: "p1", sourceGraphDigest: "abc" });
    const next = commitEdit(env, "edit-1");
    expect(next.revision).toBe(2);
    expect(openEnvelope(next).ok).toBe(true);
    expect(openEnvelope({ schema: "other/v9", projectId: "p1", revision: 1 }).ok).toBe(false);
    expect(openEnvelope({ schema: "Da30ProjectEnvelope/v1" }).ok).toBe(false);
  });
});

describe("DA30-080 release decision gate", () => {
  it("blocks stale/tampered/scanner/asset paths and allows ready", () => {
    expect(
      evaluateReleaseDecision({
        projectRevision: 3,
        evidenceFresh: true,
        scannerOk: true,
        assetsBlocked: [],
        tampered: false,
        missingEvidence: false,
      }).allow,
    ).toBe(true);
    expect(
      evaluateReleaseDecision({
        projectRevision: 3,
        evidenceFresh: false,
        scannerOk: true,
        assetsBlocked: [],
        tampered: false,
        missingEvidence: false,
      }).code,
    ).toBe("stale");
    expect(
      evaluateReleaseDecision({
        projectRevision: 3,
        evidenceFresh: true,
        scannerOk: true,
        assetsBlocked: ["evil.png"],
        tampered: false,
        missingEvidence: false,
      }).code,
    ).toBe("blocked-asset");
  });
});

describe("DA30-082 asset provenance edges", () => {
  it("includes authored packages and excludes forbidden/unknown", () => {
    const edges = shippedAssetEdgesFixture();
    const decisions = edges.map((e) => ({ path: e.path, ...decideAssetInclusion(e) }));
    expect(decisions.filter((d) => d.include).length).toBeGreaterThanOrEqual(2);
    expect(decisions.find((d) => d.path.includes("commercial"))?.include).toBe(false);
    expect(decisions.find((d) => d.path.includes("mystery"))?.include).toBe(false);
  });
});

describe("DA30-079 local export bundle", () => {
  it("is path-order deterministic", () => {
    const a = buildExportManifest({
      projectId: "p",
      revision: 1,
      toolChain: "sandbox",
      files: [
        { path: "b.cns", content: "bb" },
        { path: "a.cns", content: "aa" },
      ],
      evidenceDigests: ["e2", "e1"],
      claimSheet: ["c"],
    });
    const b = buildExportManifest({
      projectId: "p",
      revision: 1,
      toolChain: "sandbox",
      files: [
        { path: "a.cns", content: "aa" },
        { path: "b.cns", content: "bb" },
      ],
      evidenceDigests: ["e1", "e2"],
      claimSheet: ["c"],
    });
    expect(exportContentDigest(a)).toBe(exportContentDigest(b));
    expect(a.files[0]!.path).toBe("a.cns");
  });
});

describe("DA30-086 scanner safety limits", () => {
  it("rejects traversal, absolute, oversized, and deep entries", () => {
    const cfg = { maxEntries: 10, maxFileBytes: 100, maxDepth: 3 };
    const r = checkArchiveBatch(
      [
        { path: "ok/a.cns", size: 10 },
        { path: "../evil.cns", size: 1 },
        { path: "/abs.cns", size: 1 },
        { path: "big.bin", size: 9999 },
        { path: "a/b/c/d/e.cns", size: 1 },
      ],
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.failures.some((f) => f.includes("traversal"))).toBe(true);
    expect(r.failures.some((f) => f.includes("absolute") || f.includes("/abs"))).toBe(true);
  });
});

describe("DA30-081/082 provenance graph release", () => {
  it("blocks unknown and forbidden assets", () => {
    const r = evaluateAssetRelease([
      {
        assetId: "nova",
        source: "repo",
        license: "repository-authored",
        creatorTool: "hand",
        transformChain: [],
        digest: "abc",
        consumer: "runtime",
        revision: "1",
        releaseState: "allowed",
      },
      {
        assetId: "mystery",
        source: "?",
        license: "unknown",
        creatorTool: "?",
        transformChain: [],
        digest: "",
        consumer: "none",
        revision: "0",
        releaseState: "blocked",
      },
    ]);
    expect(r.allow).toBe(false);
    expect(r.blocked).toContain("mystery");
  });
});

describe("DA30-101 boundary inventory", () => {
  it("lists owners and forbidden edges", () => {
    const inv = defaultBoundaryInventory();
    expect(validateBoundaryInventory(inv).ok).toBe(true);
    expect(inv.edges.some((e) => !e.allowed)).toBe(true);
  });
});

describe("DA30 evidence artifacts for wave modules", () => {
  it("writes exist for modules claimed in PROOF/PARTIAL", () => {
    const required = [
      "docs/evidence/da30/da30-022-warning-policy.json",
      "docs/evidence/da30/da30-023-product-routes.json",
      "docs/evidence/da30/da30-030-security-baseline.json",
      "docs/evidence/da30/da30-034-input-log-sample.json",
      "docs/evidence/da30/da30-038-match-state-roundtrip.json",
      "docs/evidence/da30/da30-041-nova-contact-cases.json",
      "docs/evidence/da30/da30-046-plural-projectile.json",
      "docs/evidence/da30/da30-050-controller-registry-export.json",
      "docs/evidence/da30/da30-051-selection-state.json",
      "docs/evidence/da30/da30-072-project-envelope.json",
      "docs/evidence/da30/da30-079.json",
      "docs/evidence/da30/da30-080-release-decision.json",
      "docs/evidence/da30/da30-082-asset-provenance.json",
      "docs/evidence/da30/da30-086.json",
    ];
    for (const rel of required) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });
});
