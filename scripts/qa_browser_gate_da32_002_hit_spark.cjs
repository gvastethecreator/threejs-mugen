/**
 * DA32-002: native hit-spark drive on desktop and mobile.
 *
 * The gate keeps the runtime route, reset/play state, live contact approach,
 * and multi-key retry visible in one bounded browser report.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da32/browser");
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-002-hit-spark-browser-gate.json");
const runtimeRoute = "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const attackKeys = ["KeyZ", "KeyA", "KeyX"];

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isBenign(message) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(message));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_002_hit_spark.cjs", "scripts/qa_smoke.cjs"],
    codePaths: ["src/game/render/HitSparkRenderer.ts", "src/app/App.ts"],
  });
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let browser;

  try {
    await waitForServer(base, 90_000);
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });
    const cases = [
      await runViewport(browser, base, { id: "desktop", width: 1440, height: 960 }),
      await runViewport(browser, base, { id: "mobile", width: 390, height: 844 }),
    ];
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32HitSparkBrowserGate/v1",
      id: "DA32-002",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: runtimeRoute,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional dirty-tree native hit-spark observations for named viewports"
        : "native hit-spark drive on the named runtime route at desktop/mobile viewports",
      claims: {
        allowed: ok
          ? [
              "runtime starts playing after reset",
              "live P1/P2 approach reaches attack range",
              "KeyZ/KeyA/KeyX retry path is exercised",
              "native player hit-spark source metadata",
              "resolved player hit-spark sprite frame and axis diagnostics",
            ]
          : [],
        blocked: ["all characters and stages", "all input devices", "full MUGEN/IKEMEN visual parity"],
      },
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(
      `${JSON.stringify(
        {
          status: ok ? "passed" : "failed",
          ok,
          provisional: subject.provisional,
          viewports: cases.map((item) => ({ id: item.id, ok: item.ok, successfulKeys: item.semantic.successfulKeys })),
          unexpectedConsole: unexpectedConsole.length,
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = ok ? 0 : 1;
  } finally {
    await browser?.close().catch(() => undefined);
    try {
      child.kill("SIGTERM");
    } catch {
      /* best effort child cleanup */
    }
  }
}

async function runViewport(browser, base, options) {
  const context = await browser.newContext({ viewport: { width: options.width, height: options.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.setDefaultNavigationTimeout(120_000);
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error?.message || error)));

  try {
    await page.goto(`${base}${runtimeRoute}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.qaProbe), null, { timeout: 60_000 });
    await page.waitForTimeout(450);

    const baseline = await readRuntime(page);
    const keyResults = [];
    for (const key of attackKeys) {
      keyResults.push(await driveAttack(page, key));
    }

    const successful = keyResults.find((result) => result.success && result.hitSpark.active > 0);
    const successfulSpark = successful?.hitSpark;
    const presentation = successfulSpark?.presentations?.[0];
    const semantic = {
      baselineAvailable: baseline.available,
      resetRoundFound: keyResults.every((result) => result.resetFound),
      playingAfterReset: keyResults.every((result) => result.playing),
      contactApproach: keyResults.every((result) => result.contactGap <= 110),
      testedKeys: keyResults.map((result) => result.key),
      successfulKeys: keyResults.filter((result) => result.success).map((result) => result.key),
      activeHitSparks: successfulSpark?.active ?? 0,
      playerSourceCount: successfulSpark?.sources?.player ?? 0,
      resolvedSprites: successfulSpark?.resolvedSprites ?? 0,
      spriteFrame: presentation?.assetFrame ?? null,
      spriteAxis: presentation?.sprite ?? null,
      damageObserved: Boolean(successful?.p2LifeDelta < 0),
    };
    const ok =
      semantic.baselineAvailable &&
      semantic.resetRoundFound &&
      semantic.playingAfterReset &&
      semantic.contactApproach &&
      semantic.activeHitSparks > 0 &&
      semantic.playerSourceCount > 0 &&
      semantic.resolvedSprites > 0 &&
      semantic.spriteFrame != null &&
      semantic.spriteAxis != null &&
      semantic.damageObserved;

    const screenshot = path.join(outDir, `da32-002-hit-spark-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok,
      semantic,
      baseline,
      keyResults,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

async function driveAttack(page, key) {
  const resetFound = await page.evaluate(() => {
    const button = document.querySelector('[data-action="reset-round"]');
    if (!button) return false;
    button.click();
    return true;
  });
  await page.waitForTimeout(180);
  await ensurePlaying(page);
  const approach = await approachRuntimeContact(page);
  let attempts = 0;
  let success = false;
  let hitSpark = await readHitSpark(page);
  let before = await readRuntime(page);
  let after = before;

  for (let retry = 0; retry < 2; retry += 1) {
    await page.keyboard.press(key);
    attempts += 1;
    success = await page
      .waitForFunction(() => (window.__MUGEN_WEB_SANDBOX__?.renderer?.hitSparks?.active ?? 0) > 0, null, {
        timeout: 1800,
      })
      .then(() => true)
      .catch(() => false);
    hitSpark = await readHitSpark(page);
    after = await readRuntime(page);
    if (success) break;
    await approachRuntimeContact(page);
  }

  return {
    key,
    resetFound,
    playing: after.playing === true,
    contactGap: approach.gap,
    approachAttempts: approach.attempts,
    attempts,
    success,
    p2LifeDelta: before.actors?.[1]?.life != null && after.actors?.[1]?.life != null
      ? after.actors[1].life - before.actors[1].life
      : null,
    hitSpark: summarizeHitSpark(hitSpark),
  };
}

async function ensurePlaying(page) {
  await page.evaluate(() => {
    const element = document.querySelector("canvas") || document.body;
    element?.setAttribute?.("tabindex", "0");
    element?.focus?.();
    const probe = window.__MUGEN_WEB_SANDBOX__?.qaProbe?.();
    if (probe?.playing === false) document.querySelector('[data-action="play-pause"]')?.click();
  });
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.qaProbe?.()?.playing === true, null, {
    timeout: 5000,
  });
}

async function approachRuntimeContact(page) {
  let attempts = 0;
  for (; attempts < 12; attempts += 1) {
    const direction = await page.evaluate(() => {
      const actors = window.__MUGEN_WEB_SANDBOX__?.qaProbe?.()?.actors ?? [];
      const p1 = actors[0];
      const p2 = actors[1];
      if (!p1 || !p2 || Math.abs(p2.x - p1.x) <= 110) return undefined;
      return p1.x <= p2.x ? "ArrowRight" : "ArrowLeft";
    });
    if (!direction) break;
    await page.keyboard.down(direction);
    await page.waitForTimeout(220);
    await page.keyboard.up(direction);
    await page.waitForTimeout(80);
  }
  const probe = await readRuntime(page);
  const p1 = probe.actors?.[0];
  const p2 = probe.actors?.[1];
  return {
    attempts,
    gap: p1 && p2 ? Math.abs(p2.x - p1.x) : Number.POSITIVE_INFINITY,
  };
}

async function readRuntime(page) {
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const probe = bridge?.qaProbe?.();
    return {
      available: Boolean(probe),
      mode: probe?.mode,
      playing: probe?.playing,
      tick: probe?.tick,
      actors: probe?.actors?.map((actor) => ({
        id: actor.id,
        life: actor.life,
        x: actor.x,
        stateNo: actor.stateNo,
        animNo: actor.animNo,
      })) ?? [],
    };
  });
}

async function readHitSpark(page) {
  return page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.renderer?.hitSparks ?? {
    active: 0,
    sources: {},
    resolvedSprites: 0,
    presentations: [],
  });
}

function summarizeHitSpark(hitSpark) {
  return {
    active: hitSpark?.active ?? 0,
    fallbackGeometry: Boolean(hitSpark?.fallbackGeometry),
    resolvedSprites: hitSpark?.resolvedSprites ?? 0,
    sources: hitSpark?.sources ?? {},
    presentations: (hitSpark?.presentations ?? []).slice(0, 2).map((item) => ({
      source: item.source,
      actionId: item.actionId,
      lookupStatus: item.lookupStatus,
      assetFrame: item.assetFrame,
      sprite: item.sprite,
    })),
  };
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(typeof address === "object" && address ? address.port : 0));
    });
  });
}

async function waitForServer(base, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(base);
      if (response.ok || response.status === 404) return;
    } catch {
      /* retry while Vite starts */
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`server timeout: ${base}`);
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
