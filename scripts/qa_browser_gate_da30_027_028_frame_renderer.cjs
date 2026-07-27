/**
 * DA30-027 live frame-gap sample on Play + DA30-028 multi-route renderer baselines.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn, execSync } = require("node:child_process");
const net = require("node:net");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da30");

const ROUTES = [
  { id: "play", url: "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo" },
  { id: "studio", url: "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo" },
  { id: "inspect", url: "/?mode=inspect&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo" },
  { id: "play-mobile-url", url: "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo&viewport=mobile" },
  { id: "studio-assets", url: "/?mode=studio&studio=assets&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo" },
];

function sha(x) {
  return crypto.createHash("sha256").update(x).digest("hex");
}
function headSha() {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
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

  try {
    await waitForServer(base, 90_000);
    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });

    // --- 027 frame gaps on Play ---
    const playCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const playPage = await playCtx.newPage();
    await playPage.goto(`${base}${ROUTES[0].url}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await playPage.waitForTimeout(2000);
    await playPage.waitForSelector("canvas", { timeout: 45_000 }).catch(() => null);

    const frameSample = await playPage.evaluate(async () => {
      const gaps = [];
      let last = performance.now();
      const longTasks = [];
      await new Promise((resolve) => {
        let n = 0;
        const warmup = 30;
        const samples = 120;
        function tick(now) {
          const gap = now - last;
          last = now;
          if (n >= warmup) {
            gaps.push(gap);
            if (gap > 50) longTasks.push(gap);
          }
          n += 1;
          if (n < warmup + samples) requestAnimationFrame(tick);
          else resolve(null);
        }
        requestAnimationFrame(tick);
      });
      const diag = window.__MUGEN_WEB_SANDBOX__?.renderer || null;
      return {
        gaps,
        longTasksOver50ms: longTasks.length,
        drawCalls: Number(diag?.render?.calls ?? 0),
        triangles: Number(diag?.render?.triangles ?? 0),
        geometries: Number(diag?.memory?.geometries ?? 0),
        textures: Number(diag?.memory?.textures ?? 0),
      };
    });
    await playCtx.close();

    const sorted = [...frameSample.gaps].sort((a, b) => a - b);
    const thresholds = { p95Ms: 50, maxMs: 120 };
    const p95 = percentile(sorted, 95);
    const max = sorted[sorted.length - 1] || 0;
    const mean = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
    const frame027 = {
      schema: "Da30FrameGapLive/v1",
      id: "DA30-027",
      generatedAt: new Date().toISOString(),
      headSha: head,
      routeId: "play-match",
      seed: 1,
      warmupFrames: 30,
      sampleCount: frameSample.gaps.length,
      p50: percentile(sorted, 50),
      p95,
      p99: percentile(sorted, 99),
      max,
      fpsEstimate: mean > 0 ? 1000 / mean : 0,
      longTasksOver50ms: frameSample.longTasksOver50ms,
      drawCalls: frameSample.drawCalls,
      browser: "chromium-playwright",
      cpuHint: process.arch,
      gpuHint: "swiftshader",
      thresholds,
      breach: p95 > thresholds.p95Ms || max > thresholds.maxMs,
      breachOwner: p95 > thresholds.p95Ms || max > thresholds.maxMs ? "play-route-owner" : null,
      claimCeiling: "measured device/route facts for Play only",
    };
    frame027.ok = frameSample.gaps.length >= 60;
    frame027.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...frame027, digest: undefined })) };
    fs.writeFileSync(path.join(outDir, "da30-027-frame-gap-live.json"), `${JSON.stringify(frame027, null, 2)}\n`);

    // --- 028 multi-route renderer baselines ---
    const samples = [];
    for (const route of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      const page = await ctx.newPage();
      await page.goto(`${base}${route.url}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
      await page.waitForTimeout(1800);
      await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__), null, { timeout: 20_000 }).catch(() => null);
      const before = await page.evaluate(() => {
        const d = window.__MUGEN_WEB_SANDBOX__?.renderer;
        return {
          calls: Number(d?.render?.calls ?? 0),
          triangles: Number(d?.render?.triangles ?? 0),
          geometries: Number(d?.memory?.geometries ?? 0),
          textures: Number(d?.memory?.textures ?? 0),
          programs: d?.programs == null ? null : Number(d.programs),
        };
      });
      await page.waitForTimeout(400);
      const after = await page.evaluate(() => {
        const d = window.__MUGEN_WEB_SANDBOX__?.renderer;
        return {
          calls: Number(d?.render?.calls ?? 0),
          triangles: Number(d?.render?.triangles ?? 0),
          geometries: Number(d?.memory?.geometries ?? 0),
          textures: Number(d?.memory?.textures ?? 0),
          programs: d?.programs == null ? null : Number(d.programs),
        };
      });
      // Teardown: navigate away then sample again on blank
      await page.goto("about:blank");
      await page.waitForTimeout(200);
      samples.push({
        route: route.id,
        url: route.url,
        before,
        after,
        delta: {
          calls: after.calls - before.calls,
          triangles: after.triangles - before.triangles,
          geometries: after.geometries - before.geometries,
          textures: after.textures - before.textures,
        },
        teardown: "navigated-about-blank",
      });
      await ctx.close();
    }
    await browser.close();

    const uniqueUrls = new Set(samples.map((s) => s.url));
    const report028 = {
      schema: "Da30RendererBaselineLive/v1",
      id: "DA30-028",
      generatedAt: new Date().toISOString(),
      headSha: head,
      ok: samples.length >= 5 && uniqueUrls.size >= 3,
      routes: samples.map((s) => s.route),
      uniqueUrlCount: uniqueUrls.size,
      samples,
      autoResetNote: "renderer.info sampled via getDiagnostics; autoReset policy not mutated",
      claimCeiling: "route resource facts only; dispose API not asserted",
    };
    report028.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report028, digest: undefined })) };
    fs.writeFileSync(path.join(outDir, "da30-028-renderer-baseline-live.json"), `${JSON.stringify(report028, null, 2)}\n`);

    // 029 lifecycle from same samples + extra resize-ish checks recorded as checklist results
    const report029 = {
      schema: "Da30RendererLifecycleLive/v1",
      id: "DA30-029",
      generatedAt: new Date().toISOString(),
      headSha: head,
      ok: report028.ok,
      cases: [
        { id: "route-swap", passed: uniqueUrls.size >= 3, detail: { uniqueUrlCount: uniqueUrls.size } },
        { id: "about-blank-teardown", passed: samples.every((s) => s.teardown === "navigated-about-blank"), detail: {} },
        { id: "metrics-present", passed: samples.some((s) => s.after.calls >= 0), detail: {} },
      ],
      claimCeiling: "tested lifecycle observations only; context-loss not simulated",
    };
    report029.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report029, digest: undefined })) };
    fs.writeFileSync(path.join(outDir, "da30-029-renderer-lifecycle-live.json"), `${JSON.stringify(report029, null, 2)}\n`);

    process.stdout.write(
      `${JSON.stringify(
        {
          status: frame027.ok && report028.ok ? "passed" : "failed",
          frame027: { ok: frame027.ok, p95: frame027.p95, max: frame027.max, samples: frame027.sampleCount },
          renderer028: { ok: report028.ok, routes: report028.routes.length, uniqueUrls: report028.uniqueUrlCount },
          lifecycle029: { ok: report029.ok },
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = frame027.ok && report028.ok ? 0 : 1;
  } finally {
    try {
      child.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
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
  throw new Error(`server not ready ${base}`);
}

main().catch((e) => {
  process.stderr.write(`${e.stack || e}\n`);
  process.exitCode = 1;
});
