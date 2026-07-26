/**
 * DA28-03: materialize bounded browser visual/product subcursors from on-disk evidence.
 * Does not replace T342. Fails closed on missing files.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(process.cwd());
const outPath = path.join(repoRoot, "docs/evidence/browser-subcursors-da28-03-v1.json");
const GATE = "32466c6e8bb4ec3f414a0cda032af24ea241e5c6";
const T342 = "1085badb";
const generatedAt = process.env.BROWSER_SUBCURSOR_GENERATED_AT ?? new Date().toISOString();

function fileMeta(relative) {
  const absolute = path.join(repoRoot, ...relative.split("/"));
  if (!fs.existsSync(absolute)) {
    return { exists: false, path: relative };
  }
  const bytes = fs.readFileSync(absolute);
  return {
    exists: true,
    path: relative,
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
}

function evidenceEntry(relative, role) {
  const meta = fileMeta(relative);
  if (!meta.exists) return null;
  return {
    path: relative,
    role,
    sha256: meta.sha256,
    bytes: meta.bytes,
  };
}

function readJson(relative) {
  const absolute = path.join(repoRoot, ...relative.split("/"));
  if (!fs.existsSync(absolute)) return null;
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

const routes = [];

// DA27-07 Turns HUD
{
  const reportPath = "docs/evidence/da27-07-turns-browser/turns-browser-gate-report-v1.json";
  const shotPath = "docs/evidence/da27-07-turns-browser/turns-hud-desktop-1440x960.png";
  const report = readJson(reportPath);
  const evidence = [
    evidenceEntry(reportPath, "report"),
    evidenceEntry(shotPath, "screenshot"),
  ].filter(Boolean);
  const diagnostics = [];
  if (!report) diagnostics.push("missing-report");
  if (report && report.status !== "passed") diagnostics.push("report-not-passed");
  if (report && (report.summary?.consoleErrorCount ?? 1) > 0) diagnostics.push("console-errors");
  if (evidence.length < 2) diagnostics.push("incomplete-evidence");
  routes.push({
    id: "da27-07-turns-hud",
    taskId: "DA27-07",
    label: "Turns HUD desktop browser gate",
    baseUrl: report?.baseUrl,
    viewports: ["1440x960"],
    consoleErrorCount: report?.summary?.consoleErrorCount ?? 0,
    pageErrorCount: 0,
    reducedMotionCaptured: false,
    focusOrKeyboardNoted: false,
    status: diagnostics.length === 0 ? "passed" : "failed",
    evidence,
    claimsAllowed: report?.claims?.allowed ?? [],
    claimsBlocked: report?.claims?.blocked ?? [],
    diagnostics,
  });
}

// DA27-08 qa:smoke
{
  const reportPath = "docs/evidence/da27-08-qa-smoke/qa-smoke-gate-report-v1.json";
  const report = readJson(reportPath);
  const shots = [
    "docs/evidence/da27-08-qa-smoke/runtime-desktop.png",
    "docs/evidence/da27-08-qa-smoke/runtime-mobile.png",
    "docs/evidence/da27-08-qa-smoke/mugen-lite-runtime-desktop-attack-canvas.png",
    "docs/evidence/da27-08-qa-smoke/mugen-lite-runtime-mobile-attack-canvas.png",
    "docs/evidence/da27-08-qa-smoke/studio-build.png",
  ];
  const evidence = [
    evidenceEntry(reportPath, "report"),
    ...shots.map((p) => evidenceEntry(p, "screenshot")),
  ].filter(Boolean);
  const diagnostics = [];
  if (!report) diagnostics.push("missing-report");
  if (report && report.status !== "passed") diagnostics.push("report-not-passed");
  if (report && ((report.consoleIssues ?? 1) > 0 || (report.pageErrors ?? 1) > 0)) {
    diagnostics.push("console-or-page-errors");
  }
  if (evidence.length < 3) diagnostics.push("incomplete-evidence");
  routes.push({
    id: "da27-08-qa-smoke",
    taskId: "DA27-08",
    label: "Full qa:smoke desktop/mobile attack canvas + studio",
    baseUrl: report?.baseUrl,
    viewports: ["desktop", "mobile"],
    consoleErrorCount: report?.consoleIssues ?? 0,
    pageErrorCount: report?.pageErrors ?? 0,
    reducedMotionCaptured: false,
    focusOrKeyboardNoted: false,
    status: diagnostics.length === 0 ? "passed" : "failed",
    evidence,
    claimsAllowed: report?.claims?.allowed ?? [
      "desktop/mobile runtime attack canvas paths",
      "studio build package contracts",
    ],
    claimsBlocked: report?.claims?.blocked ?? [
      "T342 matrix replacement",
      "score movement",
    ],
    diagnostics,
  });
}

// DA27-09 FightScreen
{
  const reportPath = "docs/evidence/da27-09-fightscreen-browser/fightscreen-browser-gate-report-v1.json";
  const shotPath = "docs/evidence/da27-09-fightscreen-browser/fightscreen-runtime-desktop-1440x960.png";
  const report = readJson(reportPath);
  const evidence = [
    evidenceEntry(reportPath, "report"),
    evidenceEntry(shotPath, "screenshot"),
  ].filter(Boolean);
  const diagnostics = [];
  if (!report) diagnostics.push("missing-report");
  if (report && report.status && report.status !== "passed") diagnostics.push("report-not-passed");
  if (report && (report.summary?.consoleErrorCount ?? 1) > 0) diagnostics.push("console-errors");
  if (evidence.length < 2) diagnostics.push("incomplete-evidence");
  routes.push({
    id: "da27-09-fightscreen",
    taskId: "DA27-09",
    label: "FightScreen package + shell browser gate",
    baseUrl: report?.baseUrl,
    viewports: ["1440x960"],
    consoleErrorCount: report?.summary?.consoleErrorCount ?? 0,
    pageErrorCount: 0,
    reducedMotionCaptured: false,
    focusOrKeyboardNoted: Boolean(report?.summary?.hasGesture || report?.gesture),
    status: diagnostics.length === 0 ? "passed" : "failed",
    evidence,
    claimsAllowed: report?.claims?.allowed ?? [
      "package + fight.def surfaces",
      "runtime shell + gesture reachability",
    ],
    claimsBlocked: report?.claims?.blocked ?? [
      "nonzero browser audio output",
      "score movement",
    ],
    diagnostics,
  });
}

// DA26-13 multi-viewport shell (supports reduced-motion claim parent)
{
  const reportPath = "docs/evidence/da26-13-browser/browser-gate-report-v1.json";
  const report = readJson(reportPath);
  const shots = [
    "docs/evidence/da26-13-browser/runtime-desktop-1440x960.png",
    "docs/evidence/da26-13-browser/runtime-tablet-820x1180.png",
    "docs/evidence/da26-13-browser/runtime-mobile-390x844.png",
  ];
  const evidence = [
    evidenceEntry(reportPath, "report"),
    ...shots.map((p) => evidenceEntry(p, "screenshot")),
  ].filter(Boolean);
  const diagnostics = [];
  if (!report) diagnostics.push("missing-report");
  if (report && report.status && report.status !== "passed") diagnostics.push("report-not-passed");
  if (evidence.length < 4) diagnostics.push("incomplete-evidence");
  routes.push({
    id: "da26-13-runtime-shell",
    taskId: "DA26-13",
    label: "Runtime multi-viewport shell with reduced-motion capture",
    baseUrl: report?.baseUrl,
    viewports: ["1440x960", "820x1180", "390x844"],
    consoleErrorCount: report?.consoleErrorCount ?? report?.summary?.consoleErrorCount ?? 0,
    pageErrorCount: report?.pageErrorCount ?? 0,
    reducedMotionCaptured: true,
    focusOrKeyboardNoted: Boolean(report?.skipLinkPresent ?? report?.summary?.skipLinkPresent),
    status: diagnostics.length === 0 ? "passed" : "failed",
    evidence,
    claimsAllowed: report?.claims?.allowed ?? [
      "desktop/tablet/mobile shell",
      "reduced-motion capture",
      "skip link present",
    ],
    claimsBlocked: report?.claims?.blocked ?? [
      "full qa:smoke inheritance",
      "T342 replacement",
    ],
    diagnostics,
  });
}

// Build document matching BrowserSubcursor module shape + SHA-256 digest.
const payload = {
  schema: "BrowserSubcursor/v1",
  generatedAt,
  formalSha: GATE,
  globalSha: GATE,
  visualParentSha: T342,
  productParentSha: T342,
  routes: routes
    .map((route) => ({
      ...route,
      viewports: [...route.viewports].sort(),
      evidence: [...route.evidence].sort((a, b) => a.path.localeCompare(b.path)),
      claimsAllowed: [...route.claimsAllowed].sort(),
      claimsBlocked: [...route.claimsBlocked].sort(),
      diagnostics: [...route.diagnostics].sort(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
  status: routes.every((r) => r.status === "passed") ? "passed" : "failed",
  diagnostics: [...new Set(routes.flatMap((r) => r.diagnostics))].sort(),
  claims: {
    allowed: [
      "bounded DA27-07/08/09 and DA26-13 routes recorded as subcursors",
      "T342 remains the broad visual/product parent cursor",
      "each route cites report/screenshot SHA-256 when present",
    ].sort(),
    blocked: [
      "replacing T342 visual/product matrix from these routes alone",
      "score movement",
      "heard hardware audio or nonzero browser audio output",
    ].sort(),
  },
};

// Fail closed if any route diagnostics exist.
if (payload.status !== "passed") {
  payload.diagnostics = [...new Set([
    ...payload.diagnostics,
    ...routes.filter((r) => r.status !== "passed").map((r) => `route-failed:${r.id}`),
  ])].sort();
}

const digestValue = crypto
  .createHash("sha256")
  .update(stableStringify(payload))
  .digest("hex");
const document = {
  ...payload,
  digest: {
    algorithm: "sha-256",
    value: digestValue,
  },
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

const summary = {
  status: document.status,
  output: path.relative(repoRoot, outPath).replaceAll(path.sep, "/"),
  routeCount: document.routes.length,
  diagnostics: document.diagnostics,
  digest: document.digest.value,
};
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
if (document.status !== "passed") process.exit(1);

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}
