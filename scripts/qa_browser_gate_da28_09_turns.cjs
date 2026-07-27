/**
 * DA28-09 Turns browser matrix gate.
 * Desktop + mobile Turns route: HUD, focus, reduced motion, pause, console, screenshots.
 * Starts Vite unless QA_BASE_URL is set.
 */
const { chromium } = require("playwright");
const { createHash } = require("node:crypto");
const { mkdirSync, writeFileSync, readFileSync } = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const outDir = path.resolve(process.cwd(), "docs/evidence/da28-09-turns-browser");
mkdirSync(outDir, { recursive: true });

const viewports = [
  { id: "desktop", width: 1440, height: 960, mobile: false },
  { id: "mobile", width: 390, height: 844, mobile: true },
];

async function main() {
  const server = await resolveServer();
  const browser = await chromium.launch({ headless: true });
  const routes = [];
  let consoleErrorTotal = 0;

  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err)));

      const url = new URL(server.baseUrl.endsWith("/") ? server.baseUrl : `${server.baseUrl}/`);
      url.searchParams.set("mode", "match");
      url.searchParams.set("teamMode", "turns");
      await page.goto(url.toString(), { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(2000);

      // Focus path: tab to stage / first focusable control.
      await page.keyboard.press("Tab");
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? "");
      // Pause toggle when button present.
      const pauseBtn = page.locator('button[data-action="play"], button:has-text("Pause"), button:has-text("Play")').first();
      let pauseToggled = false;
      if (await pauseBtn.count()) {
        await pauseBtn.click();
        await page.waitForTimeout(200);
        pauseToggled = true;
        await pauseBtn.click();
      }

      const teamModeSelect = page.locator('select[data-team-mode-select="team"]');
      const teamModeValue = (await teamModeSelect.count()) ? await teamModeSelect.inputValue() : "";
      if (await teamModeSelect.count()) {
        await teamModeSelect.focus();
      }
      const bodyText = await page.locator("body").innerText();
      const hudPanel = page.locator(".round-hud-panel[data-team-mode='turns'], .round-hud-panel[data-turns-hud='true']");
      const teamLifebar = page.locator("[data-hud-team-lifebar='true']");
      const skipLink = page.locator('a[href="#stage"], a:has-text("Skip to runtime")');

      const shotName = `turns-matrix-${vp.id}-${vp.width}x${vp.height}.png`;
      const shotPath = path.join(outDir, shotName);
      await page.screenshot({ path: shotPath, fullPage: false });
      const bytes = readFileSync(shotPath);
      const sha = createHash("sha256").update(bytes).digest("hex");

      consoleErrorTotal += consoleErrors.length;
      routes.push({
        viewport: vp,
        baseUrl: url.toString(),
        teamModeSelectValue: teamModeValue,
        hasTurnsText: /Turns|Team mode|TURNS/i.test(bodyText),
        hudPanelCount: await hudPanel.count(),
        teamLifebarCount: await teamLifebar.count(),
        skipLinkCount: await skipLink.count(),
        activeTagAfterTab: activeTag,
        pauseToggled,
        reducedMotion: "reduce",
        consoleErrorCount: consoleErrors.length,
        consoleErrors: consoleErrors.slice(0, 8),
        screenshot: path.relative(process.cwd(), shotPath).split(path.sep).join("/"),
        screenshotSha256: sha,
        screenshotBytes: bytes.length,
      });
      await context.close();
    }
  } finally {
    await browser.close();
    await server.stop();
  }

  const allClean = routes.every((route) => route.consoleErrorCount === 0);
  const turnsOk = routes.every(
    (route) =>
      route.teamModeSelectValue === "turns" ||
      route.hasTurnsText ||
      route.hudPanelCount > 0 ||
      route.teamLifebarCount > 0,
  );
  const status = allClean && turnsOk ? "passed" : "failed";
  const report = {
    schema: "TurnsBrowserMatrixGate/v1",
    id: "DA28-09",
    generatedAt: new Date().toISOString(),
    serverMode: server.mode,
    status,
    consoleErrorTotal,
    routes,
    claims: {
      allowed: [
        "desktop/mobile Turns URL route with reduced motion",
        "focus/tab path and optional pause toggle",
        "0 page console errors on matrix viewports",
      ],
      blocked: [
        "full multi-replacement live combat browser proof for every seat",
        "score movement",
      ],
    },
  };
  const reportPath = path.join(outDir, "turns-browser-matrix-gate-v1.json");
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({
      status,
      report: path.relative(process.cwd(), reportPath).split(path.sep).join("/"),
      consoleErrorTotal,
      routeCount: routes.length,
    }, null, 2)}\n`,
  );
  if (status !== "passed") process.exitCode = 1;
}

async function resolveServer() {
  const externalBaseUrl = (process.env.QA_BASE_URL || process.env.BASE_URL || "").replace(/\/$/, "");
  if (externalBaseUrl) {
    return { baseUrl: externalBaseUrl, mode: "external", stop: async () => undefined };
  }
  const port = Number(process.env.QA_PORT ?? (await findFreePort(5310)));
  const { createServer } = await import("vite");
  const vite = await createServer({
    root: process.cwd(),
    logLevel: "warn",
    server: { host: "127.0.0.1", port, strictPort: true },
  });
  await vite.listen();
  const baseUrl = vite.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`;
  return {
    baseUrl,
    mode: "started-vite",
    stop: async () => {
      await vite.close();
    },
  };
}

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(findFreePort(startPort + 1));
        return;
      }
      reject(error);
    });
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(typeof address === "object" && address ? address.port : startPort));
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
