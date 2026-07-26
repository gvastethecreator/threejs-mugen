/**
 * Bounded DA26-13 browser gate: desktop/tablet/mobile + console + reduced motion.
 * Requires a running app at BASE_URL (default http://127.0.0.1:5173/).
 */
const { chromium } = require("playwright");
const { createHash } = require("node:crypto");
const { mkdirSync, writeFileSync, readFileSync } = require("node:fs");
const path = require("node:path");

const base = process.env.BASE_URL || "http://127.0.0.1:5173/";
const outDir = path.resolve(process.cwd(), "docs/evidence/da26-13-browser");
mkdirSync(outDir, { recursive: true });

const viewports = [
  { id: "desktop", width: 1440, height: 960, mobile: false },
  { id: "tablet", width: 820, height: 1180, mobile: true },
  { id: "mobile", width: 390, height: 844, mobile: true },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleMessages = [];
    page.on("console", (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    page.on("pageerror", (err) => {
      consoleMessages.push({ type: "pageerror", text: String(err) });
    });

    await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2500);

    const shotName = `runtime-${vp.id}-${vp.width}x${vp.height}.png`;
    const shotPath = path.join(outDir, shotName);
    await page.screenshot({ path: shotPath, fullPage: false });

    const bodyText = await page.locator("body").innerText();
    const hasRuntime = /Runtime|Match Lab|Nova Boxer|FIGHTERS/i.test(bodyText);
    const hasConsoleRegion = /Console|0 errors/i.test(bodyText);
    const errors = consoleMessages.filter((m) => m.type === "error" || m.type === "pageerror");
    const warnings = consoleMessages.filter((m) => m.type === "warning");
    const bytes = readFileSync(shotPath);
    const sha = createHash("sha256").update(bytes).digest("hex");
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflowX: doc.scrollWidth > doc.clientWidth + 2,
      };
    });
    const skipLinkCount = await page.locator('a[href="#stage"], a:has-text("Skip to runtime")').count();
    const contactLog = /hit .+ for \d+/i.test(bodyText);

    results.push({
      viewport: vp,
      screenshot: path.relative(process.cwd(), shotPath).split(path.sep).join("/"),
      screenshotSha256: sha,
      screenshotBytes: bytes.length,
      hasRuntime,
      hasConsoleRegion,
      contactLog,
      consoleErrorCount: errors.length,
      consoleWarningCount: warnings.length,
      consoleErrors: errors.slice(0, 10),
      overflow,
      skipLinkCount,
      reducedMotion: "reduce",
    });
    await context.close();
  }

  await browser.close();

  const report = {
    schema: "BrowserGateEvidence/v1",
    id: "DA26-13",
    generatedAt: new Date().toISOString(),
    headNote: "local HEAD browser gate against Vite dev server",
    baseUrl: base,
    results,
    summary: {
      viewportCount: results.length,
      allRuntimeVisible: results.every((r) => r.hasRuntime),
      allConsoleClean: results.every((r) => r.consoleErrorCount === 0),
      anyOverflowX: results.some((r) => r.overflow.overflowX),
      anyContactLog: results.some((r) => r.contactLog),
      skipLinkPresent: results.some((r) => r.skipLinkCount > 0),
    },
    claims: {
      allowed: [
        "desktop/tablet/mobile runtime shell loads without page/console errors",
        "reduced-motion context applied during capture",
        "skip-to-runtime link present",
        "screenshots + SHA-256 under docs/evidence/da26-13-browser",
      ],
      blocked: [
        "full qa:smoke character attack canvas checksum suite",
        "audible Common.Fx proof",
        "score movement",
        "replacing T342 visual pin without formal global re-gate",
      ],
    },
  };

  const reportPath = path.join(outDir, "browser-gate-report-v1.json");
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const ok = report.summary.allRuntimeVisible && report.summary.allConsoleClean;
  process.stdout.write(
    `${JSON.stringify(
      {
        status: ok ? "passed" : "failed",
        report: path.relative(process.cwd(), reportPath).split(path.sep).join("/"),
        summary: report.summary,
      },
      null,
      2,
    )}\n`,
  );
  if (!ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
