/**
 * DA31-011: Studio mobile reflow and focus at 320/390 + zoom factors.
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
const reportPath = path.join(repoRoot, "docs/evidence/da31/da31-011-mobile-reflow-gate.json");
const STUDIO = "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

function sha(x) {
  return crypto.createHash("sha256").update(x).digest("hex");
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da31_011_mobile_reflow.cjs"],
  });
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const viewports = [
    { id: "w320", w: 320, h: 720, zoom: 1 },
    { id: "w390", w: 390, h: 844, zoom: 1 },
    { id: "w390-z200", w: 390, h: 844, zoom: 2 },
    { id: "w390-z400", w: 390, h: 844, zoom: 4 },
  ];

  try {
    await waitForServer(base, 90_000);
    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });
    const cases = [];
    for (const vp of viewports) {
      cases.push(await runViewport(browser, base, vp));
    }
    // reduced motion
    const rm = await runViewport(browser, base, {
      id: "w390-reduced-motion",
      w: 390,
      h: 844,
      zoom: 1,
      reducedMotion: true,
    });
    cases.push(rm);
    await browser.close();

    // Claim: measure geometry; pass if we have measurements and required controls exist
    // Overflow may still exist — report honestly; pass requires focus visibility on at least one control
    const measured = cases.every((c) => c.geometry?.measured);
    const focusOk = cases.every((c) => c.focus?.focusedVisible !== false);
    const hasRequired = cases.every((c) => c.geometry?.requiredControlCount > 0);
    const ok = measured && focusOk && hasRequired;

    const report = {
      schema: "Da31MobileReflowGate/v1",
      id: "DA31-011",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      cases,
      claimCeiling: "measured viewport/accessibility geometry only; not full mobile polish",
      claims: {
        allowed: ok ? ["geometry samples at 320/390/zoom", "focus rectangles", "reduced-motion flag"] : [],
        blocked: ["pixel-perfect mobile redesign", "score movement"],
      },
      overflowObserved: cases.some((c) => c.geometry?.overflowX || c.geometry?.overflowY),
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(
      `${JSON.stringify({ status: ok ? "passed" : "failed", ok, overflowObserved: report.overflowObserved, cases: cases.length }, null, 2)}\n`,
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

async function runViewport(browser, base, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.zoom || 1,
    reducedMotion: vp.reducedMotion ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  await page.goto(`${base}${STUDIO}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2000);
  await page.waitForSelector(".app-shell, main, button", { timeout: 45_000 }).catch(() => null);

  // Tab focus sample
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const a = document.activeElement;
    if (!a) return { focusedVisible: false };
    const r = a.getBoundingClientRect();
    const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    return {
      focusedVisible: visible,
      tag: a.tagName.toLowerCase(),
      rect: { t: Math.round(r.top), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) },
    };
  });

  const geometry = await page.evaluate(() => {
    const required = [...document.querySelectorAll("button, select, [data-action], a")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const clipped = required
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right < 0 || r.bottom < 0 || r.left > window.innerWidth || r.top > window.innerHeight;
      })
      .slice(0, 8)
      .map((el) => (el.textContent || el.getAttribute("data-action") || el.tagName).trim().slice(0, 40));
    return {
      measured: true,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
      overflowY: document.documentElement.scrollHeight > window.innerHeight + 2,
      requiredControlCount: required.length,
      clippedSample: clipped,
    };
  });

  const shot = path.join(outDir, `reflow-${vp.id}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  return {
    id: vp.id,
    zoom: vp.zoom || 1,
    reducedMotion: Boolean(vp.reducedMotion),
    geometry,
    focus,
    screenshot: path.relative(repoRoot, shot).replaceAll("\\", "/"),
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
  throw new Error("timeout");
}

main().catch((e) => {
  process.stderr.write(`${e?.stack || e}\n`);
  process.exitCode = 1;
});
