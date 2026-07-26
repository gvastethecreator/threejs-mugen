/**
 * Bounded DA27-07 Turns browser HUD gate.
 * Requires Vite at BASE_URL (default http://127.0.0.1:5173/).
 */
const { chromium } = require("playwright");
const { createHash } = require("node:crypto");
const { mkdirSync, writeFileSync, readFileSync } = require("node:fs");
const path = require("node:path");

const base = process.env.BASE_URL || "http://127.0.0.1:5173/";
const outDir = path.resolve(process.cwd(), "docs/evidence/da27-07-turns-browser");
mkdirSync(outDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  const url = new URL(base);
  url.searchParams.set("mode", "match");
  url.searchParams.set("teamMode", "turns");
  await page.goto(url.toString(), { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);

  const bodyText = await page.locator("body").innerText();
  const teamModeSelect = page.locator('select[data-team-mode-select="team"]');
  const teamModeValue = (await teamModeSelect.count()) ? await teamModeSelect.inputValue() : "";
  const hudPanel = page.locator(".round-hud-panel[data-team-mode='turns'], .round-hud-panel[data-turns-hud='true']");
  const teamLifebar = page.locator("[data-hud-team-lifebar='true']");
  const teamModeBadge = page.locator("[data-hud-team-mode='turns'], .round-team-mode");

  const shotPath = path.join(outDir, "turns-hud-desktop-1440x960.png");
  await page.screenshot({ path: shotPath, fullPage: false });
  const bytes = readFileSync(shotPath);
  const sha = createHash("sha256").update(bytes).digest("hex");

  const report = {
    schema: "TurnsBrowserHudGate/v1",
    id: "DA27-07",
    generatedAt: new Date().toISOString(),
    baseUrl: url.toString(),
    summary: {
      teamModeSelectValue: teamModeValue,
      hasTurnsText: /Turns|Team mode|TURNS/i.test(bodyText),
      hudPanelCount: await hudPanel.count(),
      teamLifebarCount: await teamLifebar.count(),
      teamModeBadgeCount: await teamModeBadge.count(),
      consoleErrorCount: consoleErrors.length,
      screenshot: path.relative(process.cwd(), shotPath).split(path.sep).join("/"),
      screenshotSha256: sha,
    },
    consoleErrors: consoleErrors.slice(0, 10),
    claims: {
      allowed: [
        "URL teamMode=turns selects Turns mode",
        "round HUD exposes team mode / turns data attributes when lifebar is active",
        "desktop capture with 0 page console errors",
      ],
      blocked: [
        "full multi-replacement browser combat matrix",
        "audible Common.Fx",
        "score movement",
      ],
    },
  };
  const ok =
    report.summary.teamModeSelectValue === "turns" &&
    report.summary.consoleErrorCount === 0 &&
    (report.summary.hudPanelCount > 0 || report.summary.teamLifebarCount > 0 || report.summary.hasTurnsText);

  const reportPath = path.join(outDir, "turns-browser-gate-report-v1.json");
  writeFileSync(reportPath, `${JSON.stringify({ ...report, status: ok ? "passed" : "failed" }, null, 2)}\n`);
  await browser.close();
  process.stdout.write(
    `${JSON.stringify({ status: ok ? "passed" : "failed", report: path.relative(process.cwd(), reportPath).split(path.sep).join("/"), summary: report.summary }, null, 2)}\n`,
  );
  if (!ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
