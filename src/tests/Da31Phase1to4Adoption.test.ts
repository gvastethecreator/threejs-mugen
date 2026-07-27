import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCT_ADOPTION_ROWS,
  buildSimulatedGamepadProof,
  buildVisualMatrixStatus,
  findProductRow,
} from "../mugen/da31/ProductAdoption";
import {
  DETERMINISM_ROWS,
  buildCausalityMatrix,
  holdMugenLiteScores,
  ownerCensus,
  promoteSupportRow,
  proveInputLogDeterminism,
  proveRoundReplay,
  proveSnapshotRestore,
} from "../mugen/da31/DeterminismAdoption";
import {
  STUDIO_ADOPTION_ROWS,
  buildConflictCases,
  buildPreviewExportChain,
  buildScannerParityCases,
  buildSecondAssetChain,
  decideStorageAuthority,
  listAuthoringViewProofs,
  runSourceWriteReanalysis,
  runTransactionalSave,
} from "../mugen/da31/StudioAssetAdoption";
import {
  RELEASE_ADOPTION_ROWS,
  buildCliPackageCiProof,
  buildIkemenSourceFamilies,
  buildLocalReleaseReview,
  buildNonFightConsumer,
  buildSharedPortProof,
  buildTeamConsumerProofs,
  decideZssSlice,
  holdIkemenScores,
} from "../mugen/da31/ReleaseIkemenAdoption";
import { applyGamepadEvent, createSeatBindings, visibleStatus } from "../mugen/da30/GamepadLifecycle";
import { sampleMatchState } from "../mugen/da30/MatchStateRoundTrip";

const root = process.cwd();

describe("DA31-010..016 product adoption registry", () => {
  it("lists seven product rows with claim ceilings", () => {
    expect(PRODUCT_ADOPTION_ROWS).toHaveLength(7);
    expect(findProductRow("DA31-010")?.liveConsumer).toMatch(/studio_inspect|Studio/i);
    const gp = buildSimulatedGamepadProof();
    expect(gp.physicalDevice).toBe(false);
    expect(gp.events.length).toBeGreaterThan(3);
    const visual = buildVisualMatrixStatus({
      smokeStatus: "open",
      phase1Gates: { "DA31-012": true },
    });
    expect(visual.claimCeiling).toMatch(/partial|open/i);
  });

  it("exercises gamepad pure lifecycle for DA31-012 unit path", () => {
    let seats = createSeatBindings();
    seats = applyGamepadEvent(seats, { type: "connect", index: 0, mapping: "standard" });
    seats = applyGamepadEvent(seats, { type: "button", index: 0, button: 0, pressed: true });
    seats = applyGamepadEvent(seats, { type: "disconnect", index: 0 });
    expect(seats[0]!.status).toBe("fallback-keyboard");
    expect(seats[0]!.lastButtons.every((b) => b === false)).toBe(true);
    seats = applyGamepadEvent(seats, { type: "connect", index: 1, mapping: "non-standard" });
    expect(visibleStatus(seats).some((s) => s.includes("mapping-failed") || s.includes("active"))).toBe(true);
  });
});

describe("DA31-017..024 determinism adoption", () => {
  it("proves dual seeded input logs equal and mutation differs", () => {
    const r = proveInputLogDeterminism("da31-seed-a");
    expect(r.equal).toBe(true);
    expect(r.firstDiffTick).toBe(4);
    expect(r.logA.checksum).not.toBe(r.mutated.checksum);
  });

  it("proves snapshot restore and corrupt rejection", () => {
    const r = proveSnapshotRestore();
    expect(r.ok).toBe(true);
    expect(r.sameChecksum).toBe(true);
    expect(r.corruptRejected).toBe(true);
    expect(r.preservedOnFail).toBe(true);
    const census = ownerCensus(sampleMatchState());
    expect(census).toContain("roots");
    expect(census).toContain("rng");
  });

  it("proves round replay and first divergence", () => {
    const r = proveRoundReplay("da31-019-seed");
    expect(r.ok).toBe(true);
    expect(r.finalMatch).toBe(true);
    expect(r.frameCount).toBe(48);
    expect(r.firstDivergeTick).toBe(11);
  });

  it("builds causality matrix and rejects unproven support promotion", () => {
    const matrix = buildCausalityMatrix();
    expect(matrix.filter((c) => !c.negative).length).toBeGreaterThanOrEqual(6);
    expect(matrix.filter((c) => c.negative).every((c) => c.ok)).toBe(true);
    expect(
      promoteSupportRow({
        name: "HitDef",
        parse: true,
        compile: true,
        execute: true,
        branch: false,
        trace: false,
        browser: false,
        profile: false,
        sourceReview: false,
        failureState: null,
        evidenceRef: null,
      }).ok,
    ).toBe(false);
    expect(
      promoteSupportRow({
        name: "HitDef",
        parse: true,
        compile: true,
        execute: true,
        branch: true,
        trace: true,
        browser: false,
        profile: false,
        sourceReview: false,
        failureState: null,
        evidenceRef: "docs/evidence/da31/da31-019",
      }).ok,
    ).toBe(true);
    const hold = holdMugenLiteScores();
    expect(hold.scoresHeld).toBe(true);
    expect(hold.decision).toBe("hold");
    expect(DETERMINISM_ROWS).toHaveLength(8);
  });
});

describe("DA31-025..032 studio/asset adoption", () => {
  it("decides IndexedDB storage authority with spike cases", () => {
    const adr = decideStorageAuthority();
    expect(adr.choice).toBe("indexeddb");
    expect(adr.localStorageRole).toBe("ui-cache-only");
    expect(adr.spikeCases.every((c) => c.ok)).toBe(true);
  });

  it("transactional save fault injection retains base revision", () => {
    const base = "r-base";
    const good = runTransactionalSave({ baseRevision: base, nextBytes: "body-v2", valid: true });
    expect(good.ok).toBe(true);
    const badValidate = runTransactionalSave({
      baseRevision: base,
      nextBytes: "",
      valid: false,
    });
    expect(badValidate.ok).toBe(false);
    if (!badValidate.ok) expect(badValidate.retainedRevision).toBe(base);
    const fault = runTransactionalSave({
      baseRevision: base,
      nextBytes: "x",
      valid: true,
      faultAt: "commit",
    });
    expect(fault.ok).toBe(false);
    if (!fault.ok) expect(fault.retainedRevision).toBe(base);
  });

  it("conflict cases, authoring views, preview, provenance, scanner, reanalysis", () => {
    const conflicts = buildConflictCases("r1");
    expect(conflicts.length).toBeGreaterThanOrEqual(5);
    expect(conflicts.every((c) => c.reopenOk && c.safeActions.length > 0)).toBe(true);

    const views = listAuthoringViewProofs();
    expect(views.length).toBe(9);
    expect(views.every((v) => v.route.includes("studio"))).toBe(true);

    const preview = buildPreviewExportChain("r2");
    expect(preview.savedMode.persistedUnchanged).toBe(true);
    expect(preview.exportBlocked.length).toBeGreaterThanOrEqual(2);

    const chain = buildSecondAssetChain();
    expect(chain.releaseBlockedOnFailure).toBe(true);
    expect(chain.inputSha256).not.toBe(chain.outputSha256);

    const parity = buildScannerParityCases();
    expect(parity.every((p) => p.identical)).toBe(true);

    const re = runSourceWriteReanalysis({
      writeOk: true,
      dependents: ["cns", "cmd"],
      baseRevision: "r3",
      staleWorker: true,
    });
    expect(re.publishedRevision).toBe("r3+1");
    expect(re.invalidated).toEqual(["cns", "cmd"]);
    const fail = runSourceWriteReanalysis({
      writeOk: false,
      dependents: ["cns"],
      baseRevision: "r3",
      staleWorker: true,
    });
    expect(fail.publishedRevision).toBeNull();
    expect(STUDIO_ADOPTION_ROWS).toHaveLength(8);
  });
});

describe("DA31-033..040 release/IKEMEN adoption", () => {
  it("source families, ZSS reclass, team consumers, holds, ports, release", () => {
    const families = buildIkemenSourceFamilies({
      normative: "05b7d98a",
      working: "4aa0ba38",
    });
    expect(families.length).toBeGreaterThanOrEqual(8);
    expect(families.find((f) => f.family === "zss")?.relation).toBe("diverged");

    const zss = decideZssSlice();
    expect(zss.decision).toBe("prototype-reclass");

    const teams = buildTeamConsumerProofs();
    expect(teams.length).toBe(10);
    expect(teams.filter((t) => t.exercised).length).toBeGreaterThanOrEqual(5);

    const ik = holdIkemenScores();
    expect(ik.scoresHeld).toBe(true);

    const nonFight = buildNonFightConsumer();
    expect(nonFight.noCombatImports).toBe(true);

    const port = buildSharedPortProof();
    expect(port.port).toBe("evidence-subject-envelope");
    expect(port.consumers.length).toBeGreaterThanOrEqual(2);

    const cli = buildCliPackageCiProof();
    expect(cli.packageScriptsPresent).toContain("test");
    expect(cli.ciLanes).toContain("typecheck");

    const release = buildLocalReleaseReview();
    expect(release.publicRelease).toBe("blocked");
    expect(release.blockers.length).toBeGreaterThanOrEqual(5);
    expect(release.nextProgram).toMatch(/DA32/);
    expect(RELEASE_ADOPTION_ROWS).toHaveLength(8);
  });
});

describe("DA31 phase status artifact shape", () => {
  it("phase0 status exists and next includes 010+", () => {
    const p = resolve(root, "docs/evidence/da31/da31-phase0-status-v1.json");
    expect(existsSync(p)).toBe(true);
    const doc = JSON.parse(readFileSync(p, "utf8")) as {
      tasks: Record<string, { status: string }>;
      scoresHeld: boolean;
    };
    expect(doc.tasks["DA31-009"]?.status).toBe("accepted");
    expect(doc.scoresHeld).toBe(true);
  });
});
