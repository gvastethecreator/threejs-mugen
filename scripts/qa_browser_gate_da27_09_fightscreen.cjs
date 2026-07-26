/**
 * Bounded DA27-09 FightScreen / Common.Fx browser gate.
 * Verifies public package HTTP availability + runtime shell + hit-spark evidence surface.
 */
const { chromium } = require("playwright");
const { createHash } = require("node:crypto");
const { mkdirSync, writeFileSync, readFileSync, existsSync } = require("node:fs");
const path = require("node:path");

const base = process.env.BASE_URL || "http://127.0.0.1:5173/";
const outDir = path.resolve(process.cwd(), "docs/evidence/da27-09-fightscreen-browser");
mkdirSync(outDir, { recursive: true });

const PACKAGE_PATHS = [
  "data/sandbox-fightscreen/fight.def",
  "data/sandbox-fightscreen/fightfx.air",
  "data/sandbox-fightscreen/fightfx.sff",
  "data/sandbox-fightscreen/fightfx.snd",
  "data/sandbox-fightscreen/LICENSE.txt",
  "system/sandbox-fightscreen.zip",
];

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

  const packageChecks = [];
  for (const rel of PACKAGE_PATHS) {
    const url = new URL(rel, base).toString();
    const response = await page.request.get(url);
    const ok = response.ok();
    const body = ok ? Buffer.from(await response.body()) : Buffer.alloc(0);
    packageChecks.push({
      path: rel,
      status: response.status(),
      ok,
      bytes: body.length,
      sha256: body.length ? createHash("sha256").update(body).digest("hex") : null,
    });
  }

  await page.goto(new URL("?mode=match", base).toString(), { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  // User gesture unlock path for WebAudio.
  await page.mouse.click(200, 200);
  await page.waitForTimeout(500);

  const bodyText = await page.locator("body").innerText();
  const hasRuntime = /Runtime|Fight|Nova|Match/i.test(bodyText);
  const hasConsoleClean = /0 errors/i.test(bodyText) || consoleErrors.length === 0;
  const fightDef = packageChecks.find((item) => item.path.endsWith("fight.def"));
  let fightDefText = "";
  if (fightDef?.ok) {
    const response = await page.request.get(new URL("data/sandbox-fightscreen/fight.def", base).toString());
    fightDefText = await response.text();
  }
  const fightDefHasSurfaces =
    typeof fightDefText === "string" &&
    fightDefText.includes("fight.snd") &&
    fightDefText.includes("ko.snd") &&
    fightDefText.includes("round.default.snd");

  const shotPath = path.join(outDir, "fightscreen-runtime-desktop-1440x960.png");
  await page.screenshot({ path: shotPath, fullPage: false });
  const shotBytes = readFileSync(shotPath);

  const localZip = path.resolve(process.cwd(), "public/system/sandbox-fightscreen.zip");
  const localZipPresent = existsSync(localZip);

  const report = {
    schema: "FightScreenBrowserGate/v1",
    id: "DA27-09",
    generatedAt: new Date().toISOString(),
    baseUrl: base,
    packageChecks,
    localZipPresent,
    summary: {
      allPackagesOk: packageChecks.every((item) => item.ok && item.bytes > 0),
      fightDefHasSurfaces,
      hasRuntime,
      hasConsoleClean,
      consoleErrorCount: consoleErrors.length,
      screenshot: path.relative(process.cwd(), shotPath).split(path.sep).join("/"),
      screenshotSha256: createHash("sha256").update(shotBytes).digest("hex"),
    },
    consoleErrors: consoleErrors.slice(0, 10),
    claims: {
      allowed: [
        "public Sandbox FightScreen package bytes are HTTP-reachable",
        "fight.def names fight/ko/round Common.Fx sound edges",
        "runtime match shell loads with clean console after gesture",
      ],
      blocked: [
        "full motif visual parity",
        "hardware audio device measurement outside WebAudio diagnostics",
        "score movement",
      ],
    },
  };

  const ok =
    report.summary.allPackagesOk &&
    report.summary.fightDefHasSurfaces &&
    report.summary.hasRuntime &&
    report.summary.consoleErrorCount === 0;

  const reportPath = path.join(outDir, "fightscreen-browser-gate-report-v1.json");
  writeFileSync(reportPath, `${JSON.stringify({ ...report, status: ok ? "passed" : "failed" }, null, 2)}\n`);
  await browser.close();
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
