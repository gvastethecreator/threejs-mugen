const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = process.cwd();
const runsRoot = path.resolve(root, ".scratch/content-pack/karate-reset/runs");
const publicCharactersRoot = path.resolve(root, "public/characters");
const validator = path.resolve("X:/skills/spritesheet-expert-skill/SKILLS/spritesheet-expert/scripts/validate_run.py");
const runs = fs.readdirSync(runsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.endsWith("-v1"))
  .map((entry) => entry.name)
  .sort();

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return undefined;
  }
}

function summarizeSourceCoverage(runDir) {
  const request = readJson(path.join(runDir, "sprite-request.json"));
  const regenerationMap = readJson(path.join(runDir, "regeneration-map.json"));
  const frameManifest = readJson(path.join(runDir, "frames", "frames-manifest.json"));
  const provenance = readJson(path.join(runDir, "source-provenance.json"));
  const requestedStates = Object.keys(request?.states ?? {});
  const stateFrames = regenerationMap?.state_frames ?? {};
  const directRows = new Map((frameManifest?.rows ?? []).map((row) => [row.state, row]));
  const sourcedStates = new Set(
    (provenance?.accepted_sources ?? []).flatMap((source) => Array.isArray(source.states) ? source.states : []),
  );
  const usesRegenerationMap = Object.keys(stateFrames).length > 0;
  const rows = requestedStates.map((state) => {
    const expectedFrames = Number(request?.states?.[state]?.frames ?? 0);
    if (!usesRegenerationMap) {
      const extractedFrames = Number(directRows.get(state)?.frames ?? 0);
      return {
        state,
        expectedFrames,
        sourceFrames: extractedFrames,
        uniqueSourceCells: extractedFrames,
        duplicateFrames: 0,
        duplicateRatio: 0,
        complete: extractedFrames === expectedFrames && sourcedStates.has(state),
      };
    }
    const frames = Array.isArray(stateFrames[state]) ? stateFrames[state] : [];
    const uniqueCells = [...new Set(frames)];
    return {
      state,
      expectedFrames,
      sourceFrames: frames.length,
      uniqueSourceCells: uniqueCells.length,
      duplicateFrames: Math.max(0, frames.length - uniqueCells.length),
      duplicateRatio: frames.length === 0 ? 1 : Number(((frames.length - uniqueCells.length) / frames.length).toFixed(3)),
      complete: frames.length === expectedFrames,
    };
  });
  const incompleteRows = rows.filter((row) => !row.complete).map((row) => row.state);
  const duplicateRows = rows.filter((row) => row.duplicateFrames > 0).map((row) => ({
    state: row.state,
    duplicateFrames: row.duplicateFrames,
    duplicateRatio: row.duplicateRatio,
  }));
  return {
    coverageMode: usesRegenerationMap ? "regeneration-map" : "direct-state-sources",
    sourceGridCells: usesRegenerationMap
      ? Object.keys(regenerationMap?.cells ?? {}).length
      : (provenance?.accepted_sources ?? []).length,
    requestedStateCount: requestedStates.length,
    mappedStateCount: usesRegenerationMap
      ? Object.keys(stateFrames).length
      : rows.filter((row) => row.complete).length,
    complete: incompleteRows.length === 0 && requestedStates.length > 0,
    incompleteRows,
    duplicateRows,
    rows,
  };
}

const results = [];
for (const id of runs) {
  const runDir = path.join(runsRoot, id);
  const processResult = spawnSync("python", [validator, "--run-dir", runDir, "--stage", "pre-package", "--allow-imported-source"], {
    cwd: root,
    encoding: "utf8",
    stdio: "ignore",
  });
  const reportPath = path.join(runDir, "qa", "run-validation-report.json");
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  results.push({
    id,
    validatorExitCode: processResult.status ?? 1,
    ok: report.ok === true,
    status: report.status,
    requiredGates: (report.results ?? [])
      .filter((gate) => gate.applicable)
      .map((gate) => ({ id: gate.id, status: gate.status, errors: gate.errors?.length ?? 0, warnings: gate.warnings?.length ?? 0 })),
    blockerCount: report.blockers?.length ?? 0,
    inputFingerprint: report.input_fingerprint,
    sourceCoverage: summarizeSourceCoverage(runDir),
  });
}

function summarizePublicCharacterInventory() {
  const entries = fs.readdirSync(publicCharactersRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((id) => {
      const dir = path.join(publicCharactersRoot, id);
      const manifest = readJson(path.join(dir, "manifest.json"));
      const validation = readJson(path.join(dir, "qa", "run-validation-report.json"));
      const hasAtlas = fs.existsSync(path.join(dir, "sprite-sheet-alpha.png")) || fs.existsSync(path.join(dir, "sprite-sheet-alpha.webp"));
      const hasFrameManifest = fs.existsSync(path.join(dir, "frames", "frames-manifest.json"));
      const hasProvenance = fs.existsSync(path.join(dir, "source-provenance.json"));
      const hasIdentitySource = fs.existsSync(path.join(dir, "base-source.png")) || fs.existsSync(path.join(dir, "source"));
      const kind = hasAtlas && manifest ? "full-sheet" : hasIdentitySource ? "identity-anchor-only" : "unclassified";
      const blockers = [];
      if (kind === "full-sheet" && !hasFrameManifest) blockers.push("missing-frames-manifest");
      if (kind === "full-sheet" && !hasProvenance) blockers.push("missing-source-provenance");
      if (kind === "full-sheet" && !validation) blockers.push("missing-pre-package-validation");
      if (kind === "identity-anchor-only") blockers.push("action-rows-not-generated");
      return {
        id,
        kind,
        hasAtlas,
        hasManifest: Boolean(manifest),
        hasFrameManifest,
        hasProvenance,
        validationStatus: validation?.status ?? "unverified",
        validationOk: validation?.ok === true,
        blockers,
      };
    });
  const fullSheets = entries.filter((entry) => entry.kind === "full-sheet");
  const anchors = entries.filter((entry) => entry.kind === "identity-anchor-only");
  return {
    totalCharacters: entries.length,
    fullSheetCount: fullSheets.length,
    identityAnchorCount: anchors.length,
    fullyAuditedCount: fullSheets.filter((entry) => entry.validationStatus !== "unverified").length,
    entries,
    ok: fullSheets.length > 0 && fullSheets.every((entry) => entry.validationOk && entry.blockers.length === 0),
  };
}

const outputPath = path.resolve(root, process.env.QA_CONTENT_PACK_SPRITESHEETS_OUT ?? ".scratch/qa/content-pack-spritesheets.json");
const publicCharacterInventory = summarizePublicCharacterInventory();
const result = {
  version: 2,
  kind: "content-pack-spritesheet-qa",
  validator,
  stage: "pre-package",
  expectedProductionRuns: 2,
  ok: runs.length === 2 && results.every((entry) => entry.ok) && publicCharacterInventory.ok,
  promotionPolicy: "blocked_until_animation_identity_runtime_preview_and_visual_review_are_green",
  runs: results,
  publicCharacterInventory,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
