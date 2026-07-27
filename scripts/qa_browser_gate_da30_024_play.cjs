/**
 * DA30-024 Play browser gate — clause repair:
 * semantic state deltas (movement, contact/damage when observable, round/reset hooks)
 * via __MUGEN_WEB_SANDBOX__.qaProbe, not text-presence alone.
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
const PLAY_URL = "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

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
function isBenignConsole(msg) {
  const s = String(msg);
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(s);
}

async function readProbe(page) {
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    if (!bridge || typeof bridge.qaProbe !== "function") {
      return { available: false, reason: "qaProbe missing" };
    }
    try {
      return { available: true, ...bridge.qaProbe() };
    } catch (e) {
      return { available: false, reason: String(e) };
    }
  });
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

    const desktop = await runPlayJourney(browser, base, { name: "play-desktop", w: 1440, h: 900, dpr: 1 });
    const mobile = await runPlayJourney(browser, base, { name: "play-mobile", w: 390, h: 844, dpr: 2 });
    await browser.close();

    const journeys = [desktop, mobile];
    const unexpectedErrors = journeys.flatMap((j) =>
      j.consoleErrors
        .filter((e) => !isBenignConsole(e))
        .map((e) => ({ journey: j.name, kind: "console", message: e })),
    ).concat(
      journeys.flatMap((j) => j.pageErrors.map((e) => ({ journey: j.name, kind: "page", message: e }))),
    );

    const semanticOk = journeys.every(
      (j) =>
        j.shellFound &&
        j.canvasOrStageFound &&
        j.semantic.probeAvailable &&
        j.semantic.movementObserved &&
        j.semantic.tickAdvanced &&
        j.screenshotBytes > 1000,
    );
    const ok = semanticOk && unexpectedErrors.length === 0;

    const report = {
      schema: "Da30PlayBrowserGate/v2",
      id: "DA30-024",
      repair: "semantic-deltas-v1",
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
        semantic: j.semantic,
        consoleErrorCount: j.consoleErrors.length,
        pageErrorCount: j.pageErrors.length,
        unexpectedConsole: j.consoleErrors.filter((e) => !isBenignConsole(e)),
      })),
      unexpectedErrors,
      claimCeiling: "one Play route nova/mira/rooftop desktop+mobile with semantic deltas only",
      claims: {
        allowed: ok
          ? [
              "route load shell/canvas",
              "qaProbe actor life/pos samples",
              "movement delta after hold",
              "tick advance while playing",
              "damage delta when observed",
              "reset hook observation",
            ]
          : [],
        blocked: ["broad usability", "all stages/characters", "score movement", "physical gamepad"],
      },
      clauseStatus: {
        movement: journeys.every((j) => j.semantic.movementObserved),
        contactOrDamage: journeys.some((j) => j.semantic.damageObserved),
        tickAdvance: journeys.every((j) => j.semantic.tickAdvanced),
        resetHook: journeys.some((j) => j.semantic.resetObserved),
        probeApi: journeys.every((j) => j.semantic.probeAvailable),
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
          movement: report.clauseStatus.movement,
          damage: report.clauseStatus.contactOrDamage,
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
  await page.waitForTimeout(2500);

  let shellFound = false;
  try {
    await page.waitForSelector(".app-shell, main[data-mode], #stage, canvas", { timeout: 45_000 });
    shellFound = true;
  } catch {
    shellFound = false;
  }
  await page.waitForTimeout(1500);

  const canvasOrStageFound = await page.evaluate(() =>
    Boolean(document.querySelector("canvas") || document.querySelector("#stage, .stage, [data-stage]")),
  );

  await page.evaluate(() => {
    const el = document.querySelector("canvas") || document.querySelector(".app-shell") || document.body;
    if (el && typeof el.focus === "function") {
      el.setAttribute("tabindex", el.getAttribute("tabindex") || "0");
      el.focus();
    }
  });

  // Ensure match is playing if a play control exists
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /play|resume/i.test(b.textContent || ""));
    if (btn) btn.click();
  });
  await page.waitForTimeout(400);

  const before = await readProbe(page);
  const focusChecks = await page.evaluate(() => {
    const active = document.activeElement;
    const tag = active ? `${active.tagName.toLowerCase()}.${String(active.className || "").slice(0, 40)}` : "none";
    return [`active=${tag}`, `canvasPresent=${Boolean(document.querySelector("canvas"))}`, `probeReady=pending`];
  });

  const inputSent = [];
  // Keyboard map: ArrowRight→F (forward), z→a, x→b, c→c (see KeyboardInputAdapter)
  await page.keyboard.down("ArrowRight");
  inputSent.push("ArrowRight:hold-start");
  await page.waitForTimeout(700);
  await page.keyboard.up("ArrowRight");
  inputSent.push("ArrowRight:hold-end");
  await page.waitForTimeout(300);
  const afterMove = await readProbe(page);

  // Approach + light attack (z maps to a)
  for (let i = 0; i < 3; i++) {
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(200);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.down("z");
    inputSent.push("z:down");
    await page.waitForTimeout(120);
    await page.keyboard.up("z");
    inputSent.push("z:up");
    await page.waitForTimeout(150);
  }
  // Hold forward longer then attack
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(900);
  await page.keyboard.up("ArrowRight");
  await page.keyboard.down("x");
  await page.waitForTimeout(150);
  await page.keyboard.up("x");
  inputSent.push("approach+x");
  await page.waitForTimeout(800);
  const afterCombat = await readProbe(page);

  // Reset / round controls if present
  const resetClick = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /reset|restart|rematch|round/i.test(b.textContent || ""),
    );
    if (!btn) return { found: false };
    btn.click();
    return { found: true, label: (btn.textContent || "").trim().slice(0, 40) };
  });
  await page.waitForTimeout(500);
  const afterReset = await readProbe(page);

  const p1Before = before.actors?.[0];
  const p1AfterMove = afterMove.actors?.[0];
  const p2Before = before.actors?.[1];
  const p2AfterCombat = afterCombat.actors?.[1];
  const p1AfterCombat = afterCombat.actors?.[0];

  const movementObserved =
    before.available &&
    afterMove.available &&
    p1Before &&
    p1AfterMove &&
    (Math.abs(p1AfterMove.x - p1Before.x) > 0.5 || Math.abs(p1AfterMove.y - p1Before.y) > 0.5);

  const damageObserved =
    before.available &&
    afterCombat.available &&
    ((p2Before && p2AfterCombat && p2AfterCombat.life < p2Before.life) ||
      (p1Before && p1AfterCombat && p1AfterCombat.life < p1Before.life));

  const tickAdvanced =
    before.available && afterCombat.available && typeof before.tick === "number" && afterCombat.tick > before.tick;

  const resetObserved =
    resetClick.found &&
    afterReset.available &&
    (afterReset.tick !== afterCombat.tick ||
      (p1AfterCombat && afterReset.actors?.[0] && afterReset.actors[0].life >= p1AfterCombat.life));

  const hudSignals = await page.evaluate(() => {
    const text = (document.body?.innerText || "").slice(0, 4000);
    return {
      hasLifeOrMeter: /life|hp|meter|power|round|p1|p2|nova|mira/i.test(text),
      hasMatchChrome: /match|fight|play|pause|stage|rooftop/i.test(text),
      dataMode: document.querySelector("[data-mode]")?.getAttribute("data-mode") || null,
      canvasCount: document.querySelectorAll("canvas").length,
    };
  });

  const rendererPresent = await page.evaluate(() => Boolean(window.__MUGEN_WEB_SANDBOX__));

  const shotName = `${opts.name}.png`;
  const shotAbs = path.join(outDir, shotName);
  await page.screenshot({ path: shotAbs, fullPage: false });
  const shotBuf = fs.readFileSync(shotAbs);

  await context.close();

  return {
    name: opts.name,
    w: opts.w,
    h: opts.h,
    dpr: opts.dpr,
    browserVersion: browser.version(),
    shellFound,
    canvasOrStageFound,
    rendererPresent,
    focusChecks: [...focusChecks, `probeAvailable=${before.available}`],
    hudSignals,
    inputSent,
    semantic: {
      probeAvailable: Boolean(before.available && afterMove.available && afterCombat.available),
      movementObserved: Boolean(movementObserved),
      damageObserved: Boolean(damageObserved),
      tickAdvanced: Boolean(tickAdvanced),
      resetObserved: Boolean(resetObserved),
      resetControl: resetClick,
      before: summarizeProbe(before),
      afterMove: summarizeProbe(afterMove),
      afterCombat: summarizeProbe(afterCombat),
      afterReset: summarizeProbe(afterReset),
      deltas: {
        p1Dx: p1Before && p1AfterMove ? p1AfterMove.x - p1Before.x : null,
        p1LifeDelta: p1Before && p1AfterCombat ? p1AfterCombat.life - p1Before.life : null,
        p2LifeDelta: p2Before && p2AfterCombat ? p2AfterCombat.life - p2Before.life : null,
        tickDelta: before.available && afterCombat.available ? afterCombat.tick - before.tick : null,
      },
    },
    consoleErrors: consoleErrors.slice(0, 30),
    pageErrors: pageErrors.slice(0, 30),
    screenshotRel: `docs/evidence/da30/browser/${shotName}`,
    screenshotSha256: sha256(shotBuf),
    screenshotBytes: shotBuf.length,
  };
}

function summarizeProbe(p) {
  if (!p || !p.available) return { available: false, reason: p?.reason };
  return {
    available: true,
    mode: p.mode,
    tick: p.tick,
    playing: p.playing,
    actors: (p.actors || []).map((a) => ({
      id: a.id,
      label: a.label,
      life: a.life,
      x: Number(a.x?.toFixed?.(2) ?? a.x),
      y: Number(a.y?.toFixed?.(2) ?? a.y),
      stateNo: a.stateNo,
    })),
    round: p.round,
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
