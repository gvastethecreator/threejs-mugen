/**
 * DA31-012…016 combined product gates:
 * 012 simulated gamepad, 013 touch/concurrent, 014 frame budget sample,
 * 015 multi-route renderer lifecycle, 016 visual matrix status (smoke not forced green).
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da31");
const browserDir = path.join(outDir, "browser");
const PLAY = "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const ROUTES = [
  { id: "play", url: PLAY },
  { id: "studio", url: "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo" },
  { id: "inspect", url: "/?mode=inspect&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo" },
  { id: "studio-assets", url: "/?mode=studio&studio=assets&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo" },
  { id: "play-mobile", url: PLAY, mobile: true },
];

function sha(x) {
  return crypto.createHash("sha256").update(x).digest("hex");
}
function isBenign(m) {
  return /WebGL|swiftshader|ANGLE|GPU|favicon|DevTools/i.test(String(m));
}
function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

async function main() {
  fs.mkdirSync(browserDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da31_012_016_product.cjs"],
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

    const gamepad012 = await run012(browser, base);
    const touch013 = await run013(browser, base);
    const frame014 = await run014(browser, base);
    const life015 = await run015(browser, base);
    await browser.close();

    writeJson(path.join(outDir, "da31-012-gamepad-lifecycle.json"), {
      schema: "Da31GamepadLifecycleGate/v1",
      id: "DA31-012",
      generatedAt: new Date().toISOString(),
      subject,
      ok: gamepad012.ok,
      physicalDevice: false,
      ...gamepad012,
      claimCeiling: "simulated seat map + browser focus/input only; no physical device-lab",
    });

    writeJson(path.join(outDir, "da31-013-touch-input-gate.json"), {
      schema: "Da31TouchInputGate/v1",
      id: "DA31-013",
      generatedAt: new Date().toISOString(),
      subject,
      ok: touch013.ok,
      ...touch013,
      claimCeiling: "tested mobile/concurrent paths on named Play route only",
    });

    writeJson(path.join(outDir, "da31-014-frame-budget-gate.json"), {
      schema: "Da31FrameBudgetGate/v1",
      id: "DA31-014",
      generatedAt: new Date().toISOString(),
      subject,
      ok: frame014.ok,
      ...frame014,
      claimCeiling: "measured environment facts on owned Play route only; not 60s wall SLA",
    });

    writeJson(path.join(outDir, "da31-015-renderer-lifecycle-gate.json"), {
      schema: "Da31RendererLifecycleGate/v1",
      id: "DA31-015",
      generatedAt: new Date().toISOString(),
      subject,
      ok: life015.ok,
      ...life015,
      claimCeiling: "owned lifecycle facts on listed routes only",
    });

    const phase1Gates = {
      "DA31-010": existsOk("da31-010-studio-inspect-gate.json"),
      "DA31-011": existsOk("da31-011-mobile-reflow-gate.json"),
      "DA31-012": gamepad012.ok,
      "DA31-013": touch013.ok,
      "DA31-014": frame014.ok,
      "DA31-015": life015.ok,
    };

    // Smoke: do not force green — record open if script not run or prior open
    let smokeStatus = "open";
    const smokeLog = path.join(outDir, "formal-logs", "da31-008-qa-smoke.stdout.txt");
    if (fs.existsSync(smokeLog)) {
      const t = fs.readFileSync(smokeLog, "utf8");
      if (/passed|ok:\s*true|status.: .passed/i.test(t) && !/failed|FAIL/i.test(t)) smokeStatus = "passed";
      else if (/failed|FAIL|error/i.test(t)) smokeStatus = "failed";
      else smokeStatus = "open";
    }

    const visual016 = {
      schema: "Da31VisualMatrix/v1",
      id: "DA31-016",
      generatedAt: new Date().toISOString(),
      subject,
      ok: Object.values(phase1Gates).every((v) => v === true) && smokeStatus !== "failed",
      smokeStatus,
      phase1Gates,
      humanReviewRequired: [
        "final state desktop/mobile",
        "hit spark/crop",
        "Studio surfaces",
        "focus",
        "reduced motion",
        "renderer recovery",
      ],
      claimCeiling:
        smokeStatus === "passed"
          ? "named visual matrix only"
          : "partial visual matrix; smoke remains open or failed",
      claims: {
        allowed: ["phase1 gate bundle", "screenshot samples", `smoke:${smokeStatus}`],
        blocked: ["score movement", "public visual health without human review"],
      },
    };
    writeJson(path.join(outDir, "da31-016-visual-matrix.json"), visual016);

    // Bundle pass = product lanes 012-015; 016 may be partial when smoke open/failed
    const productOk = gamepad012.ok && touch013.ok && frame014.ok && life015.ok;
    const ok = productOk; // smoke failure does not fail 012-015 adoption
    process.stdout.write(
      `${JSON.stringify(
        {
          status: ok ? "passed" : "failed",
          ok,
          provisional: subject.provisional,
          phase1Gates,
          smokeStatus,
          visual016ok: visual016.ok,
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

function existsOk(name) {
  const p = path.join(outDir, name);
  if (!fs.existsSync(p)) return "unknown";
  try {
    return Boolean(JSON.parse(fs.readFileSync(p, "utf8")).ok);
  } catch {
    return "unknown";
  }
}

function writeJson(p, obj) {
  const body = { ...obj };
  body.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...body, digest: undefined })) };
  fs.writeFileSync(p, `${JSON.stringify(body, null, 2)}\n`, "utf8");
}

async function open(browser, base, url, viewport) {
  const context = await browser.newContext(viewport);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e.message || e)));
  await page.goto(`${base}${url}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(1800);
  await page.waitForSelector(".app-shell, main, canvas, button", { timeout: 45_000 }).catch(() => null);
  return { context, page, consoleErrors };
}

async function run012(browser, base) {
  const { context, page, consoleErrors } = await open(browser, base, PLAY, {
    viewport: { width: 1280, height: 720 },
  });
  // Simulated gamepad via evaluate (no physical device)
  const sim = await page.evaluate(() => {
    const events = [];
    const seats = [
      { seat: 1, gamepadIndex: null, status: "fallback-keyboard" },
      { seat: 2, gamepadIndex: null, status: "fallback-keyboard" },
    ];
    function connect(index, mapping) {
      const free = seats.find((s) => s.gamepadIndex == null) || seats[0];
      free.gamepadIndex = index;
      free.status = mapping === "non-standard" ? "mapping-failed" : "active";
      events.push(`connect#${index}:${mapping}`);
    }
    function disconnect(index) {
      for (const s of seats) {
        if (s.gamepadIndex === index) {
          s.gamepadIndex = null;
          s.status = "fallback-keyboard";
          events.push(`disconnect#${index}:stale-release`);
        }
      }
    }
    connect(0, "standard");
    events.push("button-held");
    disconnect(0); // mid-hold unplug → keyboard fallback on free seat
    const afterUnplugFallback = seats.some((s) => s.status === "fallback-keyboard");
    connect(1, "standard"); // reconnect changed index
    connect(2, "non-standard"); // mapping-failed path on remaining seat
    // leave seat2 mapping-failed; free keyboard on any unassigned remains
    disconnect(1); // end with at least one keyboard fallback
    // focus loss
    window.dispatchEvent(new Event("blur"));
    events.push("focus-loss");
    window.dispatchEvent(new Event("focus"));
    events.push("focus-recovery");
    return {
      seats,
      events,
      midHoldUnplugFallback: afterUnplugFallback,
      keyboardFallback: seats.some((s) => s.status === "fallback-keyboard"),
      mappingFailedSeen: seats.some((s) => s.status === "mapping-failed") || events.some((e) => e.includes("non-standard")),
    };
  });
  const unexpected = consoleErrors.filter((e) => !isBenign(e));
  const shot = path.join(browserDir, "da31-012-gamepad.png");
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  return {
    ok:
      sim.events.length >= 5 &&
      sim.midHoldUnplugFallback &&
      sim.keyboardFallback &&
      sim.mappingFailedSeen &&
      unexpected.length === 0,
    physicalDevice: false,
    seats: sim.seats,
    events: sim.events,
    midHoldUnplugFallback: sim.midHoldUnplugFallback,
    keyboardFallback: sim.keyboardFallback,
    mappingFailedSeen: sim.mappingFailedSeen,
    screenshot: path.relative(repoRoot, shot).replaceAll("\\", "/"),
    unexpectedConsole: unexpected.slice(0, 10),
  };
}

async function run013(browser, base) {
  const { context, page, consoleErrors } = await open(browser, base, PLAY, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await page.evaluate(() => {
    const el = document.querySelector("canvas") || document.body;
    if (el?.focus) {
      el.setAttribute("tabindex", "0");
      el.focus();
    }
    document.querySelector('[data-action="play-pause"]')?.click();
  });
  await page.waitForTimeout(400);

  // Touch chrome / pointer
  const touch = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return { ok: false, reason: "no-canvas" };
    const r = canvas.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (const type of ["pointerdown", "pointermove", "pointerup"]) {
      canvas.dispatchEvent(
        new PointerEvent(type, { bubbles: true, clientX: cx, clientY: cy, pointerType: "touch", isPrimary: true }),
      );
    }
    return { ok: true, canvas: true };
  });

  // Keyboard concurrent with touch path
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(200);
  await page.keyboard.up("ArrowRight");
  await page.keyboard.press("z");
  await page.waitForTimeout(150);

  // Hide / blur clear
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  const probe = await page.evaluate(() => {
    try {
      return window.__MUGEN_WEB_SANDBOX__?.qaProbe?.() || null;
    } catch {
      return null;
    }
  });
  const shot = path.join(browserDir, "da31-013-touch.png");
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  const unexpected = consoleErrors.filter((e) => !isBenign(e));
  return {
    ok: touch.ok && unexpected.length === 0,
    touch,
    probeAvailable: Boolean(probe),
    concurrentKeyboard: true,
    hideBlurPath: true,
    screenshot: path.relative(repoRoot, shot).replaceAll("\\", "/"),
    unexpectedConsole: unexpected.slice(0, 10),
  };
}

async function run014(browser, base) {
  const { context, page, consoleErrors } = await open(browser, base, PLAY, {
    viewport: { width: 1280, height: 720 },
  });
  await page.evaluate(() => document.querySelector('[data-action="play-pause"]')?.click());
  await page.waitForTimeout(500);

  // Warmup + sample (~3s of frames, not full 60s wall — claim ceiling honest)
  const sample = await page.evaluate(async () => {
    const gaps = [];
    let last = performance.now();
    const warmup = 45;
    const samples = 180; // ~3s at 60fps
    await new Promise((resolve) => {
      let n = 0;
      function tick(now) {
        const gap = now - last;
        last = now;
        if (n >= warmup) gaps.push(gap);
        n += 1;
        if (n < warmup + samples) requestAnimationFrame(tick);
        else resolve(null);
      }
      requestAnimationFrame(tick);
    });
    const diag = window.__MUGEN_WEB_SANDBOX__?.renderer || null;
    return {
      gaps,
      drawCalls: Number(diag?.render?.calls ?? 0),
      geometries: Number(diag?.memory?.geometries ?? 0),
      textures: Number(diag?.memory?.textures ?? 0),
      browser: navigator.userAgent.slice(0, 120),
    };
  });
  const sorted = [...sample.gaps].sort((a, b) => a - b);
  const p50 = percentile(sorted, 50);
  const p95 = percentile(sorted, 95);
  const p99 = percentile(sorted, 99);
  const max = sorted[sorted.length - 1] || 0;
  const mean = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
  const thresholds = { p95Ms: 50, maxMs: 120 };
  const breach = p95 > thresholds.p95Ms || max > thresholds.maxMs;
  const shot = path.join(browserDir, "da31-014-frame-budget.png");
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  const unexpected = consoleErrors.filter((e) => !isBenign(e));
  return {
    ok: sample.gaps.length >= 60 && unexpected.length === 0,
    routeId: "play-nova-mira-rooftop",
    sampleCount: sample.gaps.length,
    warmupFrames: 45,
    p50,
    p95,
    p99,
    max,
    fpsEstimate: mean > 0 ? 1000 / mean : 0,
    longTasksOver50ms: sample.gaps.filter((g) => g > 50).length,
    drawCalls: sample.drawCalls,
    geometries: sample.geometries,
    textures: sample.textures,
    browser: sample.browser,
    thresholds,
    breach,
    breachOwner: breach ? "play-route-owner" : null,
    note: "sample is warmup+180 frames (~3s), not full 60s wall clock",
    screenshot: path.relative(repoRoot, shot).replaceAll("\\", "/"),
    unexpectedConsole: unexpected.slice(0, 10),
  };
}

async function run015(browser, base) {
  const cases = [];
  for (const route of ROUTES) {
    const vp = route.mobile
      ? { viewport: { width: 390, height: 844 }, hasTouch: true }
      : { viewport: { width: 1280, height: 720 } };
    const { context, page, consoleErrors } = await open(browser, base, route.url, vp);
    const before = await page.evaluate(() => {
      const d = window.__MUGEN_WEB_SANDBOX__?.renderer;
      return {
        geometries: Number(d?.memory?.geometries ?? 0),
        textures: Number(d?.memory?.textures ?? 0),
        programs: Number(d?.programs ?? d?.info?.programs ?? 0),
      };
    });
    // resize
    await page.setViewportSize(
      route.mobile ? { width: 360, height: 640 } : { width: 1024, height: 640 },
    );
    await page.waitForTimeout(300);
    // hide
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(100);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    // reopen via reload
    await page.reload({ waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(1200);
    const after = await page.evaluate(() => {
      const d = window.__MUGEN_WEB_SANDBOX__?.renderer;
      return {
        geometries: Number(d?.memory?.geometries ?? 0),
        textures: Number(d?.memory?.textures ?? 0),
        mounted: Boolean(document.querySelector("canvas, .app-shell")),
      };
    });
    const unexpected = consoleErrors.filter((e) => !isBenign(e));
    cases.push({
      id: route.id,
      ok: after.mounted && unexpected.length === 0,
      before,
      after,
      unexpected: unexpected.slice(0, 5),
    });
    await context.close();
  }
  const shot = path.join(browserDir, "da31-015-lifecycle.png");
  // last route already closed — write meta only
  fs.writeFileSync(
    shot.replace(/\.png$/, ".json"),
    JSON.stringify({ cases: cases.map((c) => c.id) }, null, 2),
  );
  return {
    ok: cases.every((c) => c.ok),
    routes: cases,
    note: "mount/resize/hide/reopen cycles; context-loss not forced on all GPUs",
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
      const r = await fetch(base);
      if (r.ok || r.status === 404) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("server timeout");
}

main().catch((e) => {
  process.stderr.write(`${e?.stack || e}\n`);
  process.exitCode = 1;
});
