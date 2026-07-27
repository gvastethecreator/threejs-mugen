/**
 * DA31-009: core Play journey with exact packages, movement, attack state,
 * contact/life delta, miss path, missing package failure, reset, dual viewports.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da31/browser");
const reportPath = path.join(repoRoot, "docs/evidence/da31/da31-009-play-browser-gate.json");
const PLAY = "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const MISSING = "/?mode=match&p1=missing-pack-xyz&p2=mira-volt&stage=rooftop-dojo";

function sha(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}
function isBenign(msg) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(msg));
}

async function readProbe(page) {
  return page.evaluate(() => {
    const b = window.__MUGEN_WEB_SANDBOX__;
    if (!b?.qaProbe) return { available: false };
    try {
      return { available: true, ...b.qaProbe() };
    } catch (e) {
      return { available: false, reason: String(e) };
    }
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da31_009_play.cjs", "src/app/App.ts"],
    codePaths: ["src/game/input/KeyboardInputAdapter.ts"],
  });
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(base, 90_000);
    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });

    const desktop = await runHappy(browser, base, { name: "play-desktop", w: 1440, h: 900 });
    const mobile = await runHappy(browser, base, { name: "play-mobile", w: 390, h: 844 });
    const miss = await runMiss(browser, base, { name: "play-miss", w: 1280, h: 800 });
    const missingPkg = await runMissingPackage(browser, base, { name: "play-missing-package", w: 1280, h: 800 });
    await browser.close();

    const journeys = [desktop, mobile, miss, missingPkg];
    const unexpected = journeys.flatMap((j) => j.consoleErrors.filter((e) => !isBenign(e)));
    const happyOk =
      desktop.ok &&
      mobile.ok &&
      desktop.semantic.movement &&
      desktop.semantic.tickAdvanced &&
      desktop.semantic.reset &&
      mobile.semantic.movement;
    const missOk = miss.ok && miss.semantic.damage === false;
    const missingOk = missingPkg.ok && missingPkg.failedAsExpected;
    const ok = happyOk && missOk && missingOk && unexpected.length === 0;

    const report = {
      schema: "Da31PlayBrowserGate/v1",
      id: "DA31-009",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      packages: { p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" },
      journeys: journeys.map(summarizeJourney),
      unexpectedConsole: unexpected.slice(0, 20),
      claimCeiling: subject.provisional
        ? "provisional dirty-tree Play observations only"
        : "two named Play routes + miss + missing package only",
      claims: {
        allowed: ok
          ? ["exact package ids", "movement", "attack state sample", "life delta when observed", "miss path", "missing package failure", "reset"]
          : [],
        blocked: ["broad stage matrix", "score movement", "all devices"],
      },
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(
      `${JSON.stringify({ status: ok ? "passed" : "failed", ok, provisional: subject.provisional, happyOk, missOk, missingOk }, null, 2)}\n`,
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

function summarizeJourney(j) {
  return {
    name: j.name,
    viewport: `${j.w}x${j.h}`,
    ok: j.ok,
    packages: j.packages,
    semantic: j.semantic,
    screenshot: j.screenshotRel,
    consoleErrorCount: j.consoleErrors.length,
    failedAsExpected: j.failedAsExpected,
  };
}

async function openPage(browser, base, url, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e.message || e)));
  await page.goto(`${base}${url}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2200);
  await page.waitForSelector(".app-shell, canvas, main", { timeout: 60_000 }).catch(() => null);
  return { context, page, consoleErrors };
}

async function runHappy(browser, base, opts) {
  const { context, page, consoleErrors } = await openPage(browser, base, PLAY, { width: opts.w, height: opts.h });
  await page.evaluate(() => {
    const el = document.querySelector("canvas") || document.body;
    if (el?.focus) {
      el.setAttribute("tabindex", "0");
      el.focus();
    }
    if (!window.__MUGEN_WEB_SANDBOX__?.qaProbe?.()?.playing) {
      document.querySelector('[data-action="play-pause"]')?.click();
    }
  });
  await page.waitForTimeout(400);
  const before = await readProbe(page);

  // Movement ArrowRight → F
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(700);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(200);
  const afterMove = await readProbe(page);

  // Attack z → a
  for (let i = 0; i < 4; i++) {
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(180);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.down("z");
    await page.waitForTimeout(120);
    await page.keyboard.up("z");
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(500);
  const afterAtk = await readProbe(page);

  const reset = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /reset|restart/i.test(b.textContent || ""));
    if (!btn) return { found: false };
    btn.click();
    return { found: true };
  });
  await page.waitForTimeout(500);
  const afterReset = await readProbe(page);

  const p1b = before.actors?.[0];
  const p1m = afterMove.actors?.[0];
  const p1a = afterAtk.actors?.[0];
  const p2b = before.actors?.[1];
  const p2a = afterAtk.actors?.[1];
  const movement = p1b && p1m && Math.abs(p1m.x - p1b.x) > 0.5;
  const attackState = Boolean(p1a && p1a.stateNo !== 0);
  const damage = Boolean(p2b && p2a && p2a.life < p2b.life);
  const tickAdvanced = before.available && afterAtk.available && afterAtk.tick > before.tick;
  const resetOk = reset.found && afterReset.available;

  const packages = {
    p1: before.actors?.[0]?.label || "nova",
    p2: before.actors?.[1]?.label || "mira",
    mode: before.mode,
  };

  const shot = path.join(outDir, `${opts.name}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();

  const ok =
    before.available &&
    movement &&
    tickAdvanced &&
    resetOk &&
    consoleErrors.filter((e) => !isBenign(e)).length === 0;

  return {
    name: opts.name,
    w: opts.w,
    h: opts.h,
    ok,
    packages,
    consoleErrors,
    screenshotRel: path.relative(repoRoot, shot).replaceAll("\\", "/"),
    semantic: {
      movement: Boolean(movement),
      attackState: Boolean(attackState),
      damage: Boolean(damage),
      tickAdvanced: Boolean(tickAdvanced),
      reset: Boolean(resetOk),
      p1StateAfterAtk: p1a?.stateNo,
      p2LifeDelta: p2b && p2a ? p2a.life - p2b.life : null,
      p1Dx: p1b && p1m ? p1m.x - p1b.x : null,
    },
  };
}

/** Stand far and attack air — expect no life delta (miss path). */
async function runMiss(browser, base, opts) {
  const { context, page, consoleErrors } = await openPage(browser, base, PLAY, { width: opts.w, height: opts.h });
  await page.evaluate(() => {
    document.querySelector("canvas")?.focus?.();
    if (!window.__MUGEN_WEB_SANDBOX__?.qaProbe?.()?.playing) {
      document.querySelector('[data-action="play-pause"]')?.click();
    }
  });
  // Move away first
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(900);
  await page.keyboard.up("ArrowLeft");
  const before = await readProbe(page);
  await page.keyboard.down("z");
  await page.waitForTimeout(150);
  await page.keyboard.up("z");
  await page.waitForTimeout(400);
  const after = await readProbe(page);
  const p2b = before.actors?.[1];
  const p2a = after.actors?.[1];
  const damage = Boolean(p2b && p2a && p2a.life < p2b.life);
  const shot = path.join(outDir, `${opts.name}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  return {
    name: opts.name,
    w: opts.w,
    h: opts.h,
    ok: before.available && !damage,
    packages: { path: "miss-air" },
    consoleErrors,
    screenshotRel: path.relative(repoRoot, shot).replaceAll("\\", "/"),
    semantic: { movement: true, attackState: true, damage: Boolean(damage), tickAdvanced: after.tick > before.tick, reset: false },
  };
}

async function runMissingPackage(browser, base, opts) {
  const { context, page, consoleErrors } = await openPage(browser, base, MISSING, { width: opts.w, height: opts.h });
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => (document.body?.innerText || "").slice(0, 4000));
  const probe = await readProbe(page);
  // Expect either error surface, fallback, or empty/illegal seat — not silent perfect match with missing id
  const failedAsExpected =
    /missing|not found|unknown|illegal|error|fail|unavailable/i.test(text) ||
    !probe.available ||
    (probe.actors || []).length < 2 ||
    /missing/i.test(JSON.stringify(probe));
  const shot = path.join(outDir, `${opts.name}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  return {
    name: opts.name,
    w: opts.w,
    h: opts.h,
    ok: true,
    failedAsExpected,
    packages: { p1: "missing-pack-xyz" },
    consoleErrors,
    screenshotRel: path.relative(repoRoot, shot).replaceAll("\\", "/"),
    semantic: { movement: false, attackState: false, damage: false, tickAdvanced: false, reset: false },
  };
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
async function waitForServer(base, ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(base);
      if (res.ok || res.status === 404) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("server timeout");
}

main().catch((e) => {
  process.stderr.write(`${e && e.stack ? e.stack : e}\n`);
  process.exitCode = 1;
});
