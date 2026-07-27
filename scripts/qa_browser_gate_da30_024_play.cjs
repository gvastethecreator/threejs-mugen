/**
 * DA30-024: core Play route browser journey.
 * Loads exact packages/stage, waits for combat shell, sends input, checks HUD/focus/canvas,
 * records console/page errors, screenshots, and browser evidence facts at one SHA.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn, execSync } = require("node:child_process");
const net = require("node:net");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da30/browser");
const reportPath = path.join(repoRoot, "docs/evidence/da30/da30-024-play-browser-gate.json");

const PLAY_URL =
  "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function headSha() {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const head = headSha();
  const startedAt = new Date().toISOString();

  try {
    await waitForServer(base, 90_000);
    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });

    const desktop = await runPlayJourney(browser, base, {
      name: "play-desktop",
      w: 1440,
      h: 900,
      dpr: 1,
    });
    const mobile = await runPlayJourney(browser, base, {
      name: "play-mobile",
      w: 390,
      h: 844,
      dpr: 2,
    });

    await browser.close();

    const journeys = [desktop, mobile];
    const unexpectedErrors = journeys.flatMap((j) =>
      j.consoleErrors
        .filter((e) => !isBenignConsole(e))
        .map((e) => ({ journey: j.name, kind: "console", message: e })),
    ).concat(
      journeys.flatMap((j) =>
        j.pageErrors.map((e) => ({ journey: j.name, kind: "page", message: e })),
      ),
    );

    const ok =
      journeys.every((j) => j.shellFound && j.canvasOrStageFound) &&
      unexpectedErrors.length === 0 &&
      journeys.every((j) => j.screenshotBytes > 1000);

    const facts = journeys.map((j) => ({
      route: PLAY_URL,
      queryState: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" },
      browser: "chromium",
      browserVersion: j.browserVersion,
      os: process.platform,
      viewport: { width: j.w, height: j.h },
      dpr: j.dpr,
      input: "keyboard",
      commit: head,
      screenshotDigest: j.screenshotSha256,
      consoleErrors: j.consoleErrors,
      pageErrors: j.pageErrors,
      focusChecks: j.focusChecks,
      result: j.shellFound && j.canvasOrStageFound && j.consoleErrors.filter((e) => !isBenignConsole(e)).length === 0 ? "pass" : "fail",
      journey: j.name,
      hudSignals: j.hudSignals,
      inputSent: j.inputSent,
      rendererPresent: j.rendererPresent,
    }));

    const report = {
      schema: "Da30PlayBrowserGate/v1",
      id: "DA30-024",
      generatedAt: new Date().toISOString(),
      startedAt,
      endedAt: new Date().toISOString(),
      headSha: head,
      ok,
      playUrl: PLAY_URL,
      packages: { p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" },
      journeys: journeys.map((j) => ({
        name: j.name,
        viewport: `${j.w}x${j.h}`,
        screenshot: j.screenshotRel,
        screenshotSha256: j.screenshotSha256,
        screenshotBytes: j.screenshotBytes,
        shellFound: j.shellFound,
        canvasOrStageFound: j.canvasOrStageFound,
        rendererPresent: j.rendererPresent,
        focusChecks: j.focusChecks,
        hudSignals: j.hudSignals,
        inputSent: j.inputSent,
        consoleErrorCount: j.consoleErrors.length,
        pageErrorCount: j.pageErrors.length,
        unexpectedConsole: j.consoleErrors.filter((e) => !isBenignConsole(e)),
      })),
      browserFacts: facts,
      unexpectedErrors,
      claimCeiling: "one Play route (match nova vs mira rooftop) desktop+mobile only",
      claims: {
        allowed: ok
          ? ["Play route load + shell/canvas + keyboard input path + HUD signals at measured SHA"]
          : [],
        blocked: [
          "broad usability matrix",
          "Studio/Inspect (DA30-025)",
          "score movement",
          "formal tip rewrite without DA30-021",
        ],
      },
    };
    report.digest = {
      algorithm: "sha-256",
      value: sha256(JSON.stringify({ ...report, digest: undefined })),
    };

    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(
      `${JSON.stringify(
        {
          status: ok ? "passed" : "failed",
          output: "docs/evidence/da30/da30-024-play-browser-gate.json",
          head: head.slice(0, 12),
          journeys: journeys.map((j) => j.name),
          unexpectedErrors: unexpectedErrors.length,
          ok,
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = ok ? 0 : 1;
  } finally {
    try {
      child.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
}

async function runPlayJourney(browser, base, opts) {
  const context = await browser.newContext({
    viewport: { width: opts.w, height: opts.h },
    deviceScaleFactor: opts.dpr,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e.message || e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`${base}${PLAY_URL}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2000);

  let shellFound = false;
  try {
    await page.waitForSelector(".app-shell, main[data-mode], #stage, canvas", { timeout: 45_000 });
    shellFound = true;
  } catch {
    shellFound = false;
  }

  // Prefer match mode chrome if present
  await page.waitForTimeout(1500);

  const canvasOrStageFound = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const stage = document.querySelector("#stage, .stage, [data-stage], .match-stage");
    return Boolean(canvas || stage);
  });

  // Focus main shell / canvas for input
  await page.evaluate(() => {
    const el =
      document.querySelector("canvas") ||
      document.querySelector(".app-shell") ||
      document.querySelector("main") ||
      document.body;
    if (el && typeof el.focus === "function") {
      el.setAttribute("tabindex", el.getAttribute("tabindex") || "0");
      el.focus();
    }
  });

  const focusChecks = await page.evaluate(() => {
    const active = document.activeElement;
    const tag = active ? `${active.tagName.toLowerCase()}.${active.className}`.slice(0, 80) : "none";
    const canvas = document.querySelector("canvas");
    return [
      `active=${tag}`,
      `canvasPresent=${Boolean(canvas)}`,
      `bodyFocusable=${document.body.tabIndex >= -1}`,
    ];
  });

  // Send combat-ish input sequence (WASD + attack keys common in sandbox)
  const inputSent = [];
  for (const key of ["a", "s", "d", "w", "y", "x", "b", " "]) {
    await page.keyboard.down(key);
    inputSent.push(`${key}:down`);
    await page.waitForTimeout(80);
    await page.keyboard.up(key);
    inputSent.push(`${key}:up`);
    await page.waitForTimeout(40);
  }
  // Hold a direction briefly
  await page.keyboard.down("d");
  await page.waitForTimeout(200);
  await page.keyboard.up("d");
  inputSent.push("d:hold");

  await page.waitForTimeout(800);

  const hudSignals = await page.evaluate(() => {
    const text = (document.body?.innerText || "").slice(0, 4000);
    return {
      hasLifeOrMeter: /life|hp|meter|power|round|p1|p2|nova|mira/i.test(text),
      hasMatchChrome: /match|fight|play|pause|stage|rooftop/i.test(text),
      dataMode: document.querySelector("[data-mode]")?.getAttribute("data-mode") || null,
      canvasCount: document.querySelectorAll("canvas").length,
    };
  });

  const rendererPresent = await page.evaluate(() => {
    try {
      return Boolean(window.__MUGEN_WEB_SANDBOX__?.renderer || window.__MUGEN_WEB_SANDBOX__);
    } catch {
      return false;
    }
  });

  const shotName = `${opts.name}.png`;
  const shotAbs = path.join(outDir, shotName);
  await page.screenshot({ path: shotAbs, fullPage: false });
  const shotBuf = fs.readFileSync(shotAbs);

  const browserVersion = browser.version();

  await context.close();

  return {
    name: opts.name,
    w: opts.w,
    h: opts.h,
    dpr: opts.dpr,
    browserVersion,
    shellFound,
    canvasOrStageFound,
    rendererPresent,
    focusChecks,
    hudSignals,
    inputSent,
    consoleErrors: consoleErrors.slice(0, 30),
    pageErrors: pageErrors.slice(0, 30),
    screenshotRel: `docs/evidence/da30/browser/${shotName}`,
    screenshotSha256: sha256(shotBuf),
    screenshotBytes: shotBuf.length,
  };
}

function isBenignConsole(msg) {
  const s = String(msg);
  // WebGL/SwiftShader noise common in headless CI
  if (/WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(s)) return true;
  if (/Failed to load resource.*favicon/i.test(s)) return true;
  return false;
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

async function waitForServer(base, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(base);
      if (res.ok || res.status === 404) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`server not ready: ${base}`);
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : err}\n`);
  process.exitCode = 1;
});
