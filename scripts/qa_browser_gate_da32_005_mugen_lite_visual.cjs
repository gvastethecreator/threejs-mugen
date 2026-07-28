/**
 * DA32-005: imported MUGEN Lite playfield visibility on desktop and mobile.
 *
 * The gate checks the real ZIP import path, renderer actor geometry, the
 * responsive playfield, and the touch-control footprint. Screenshots remain
 * the visual record; DOM and bridge facts keep the report reproducible.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-005-mugen-lite-visual-browser-gate.json");
const runtimeRoute = "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isBenign(message) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(message));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_005_mugen_lite_visual.cjs", "src/mugen/runtime/MugenLiteJourneyFixture.ts"],
    codePaths: ["src/styles/redesign.css", "src/app/App.ts"],
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
      schema: "Da32MugenLiteVisualBrowserGate/v1",
      id: "DA32-005",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: runtimeRoute,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional dirty-tree imported MUGEN Lite visual observations for named viewports"
        : "imported MUGEN Lite actors remain visible in the named runtime route at desktop/mobile viewports",
      claims: {
        allowed: ok
          ? [
              "repository-authored MUGEN Lite ZIP imports through the browser UI",
              "two imported fighter actors expose native sprite frames to the renderer",
              "the mobile playfield has enough height for the actors and keeps touch controls visible",
              "the mobile runtime summary does not occlude the playfield",
              "the named route has no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: [
          "all MUGEN Lite states and input paths",
          "all characters, stages, devices, and screen sizes",
          "full MUGEN/IKEMEN visual parity",
        ],
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
          viewports: cases.map((item) => ({ id: item.id, ok: item.ok, semantic: item.semantic })),
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
    const bytes = await page.evaluate(async () => {
      const fixture = await import("/src/mugen/runtime/MugenLiteJourneyFixture.ts");
      return Array.from(new Uint8Array(await fixture.createMugenLiteJourneyZipBytes()));
    });
    await page.locator("#zip-input").setInputFiles({
      name: "mugen-lite-journey.zip",
      mimeType: "application/zip",
      buffer: Buffer.from(bytes),
    });
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.character === "MUGEN Lite Journey", null, {
      timeout: 60_000,
    });
    await page.locator('[data-mode="match"]').first().evaluate((button) => button.click());
    await page.waitForFunction(
      () =>
        window.__MUGEN_WEB_SANDBOX__?.mode === "match" &&
        window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.[0]?.frame?.spriteGroup === 0 &&
        (window.__MUGEN_WEB_SANDBOX__?.renderer?.characters?.length ?? 0) >= 2,
      null,
      { timeout: 30_000 },
    );
    await page.waitForTimeout(250);

    const state = await readVisualState(page);
    const mobile = options.id === "mobile";
    const semantic = {
      importedCharacter: state.character === "MUGEN Lite Journey",
      matchMode: state.mode === "match",
      compatibilityLoaded: state.compatibilityLoaded,
      twoRendererActors: state.actors.length >= 2,
      actorsHaveNativeSprites: state.actors.length >= 2 && state.actors.every((actor) => actor.spriteWidth > 0 && actor.spriteHeight > 0),
      rendererHasFrames: state.renderCalls > 0,
      canvasMatchesStage: state.stage != null && state.canvas != null && state.canvas.width >= state.stage.width - 1 && state.canvas.height >= state.stage.height - 1,
      stageHeight: mobile ? state.stage?.height >= 500 : state.stage?.height >= 700,
      mobileStatusHidden: !mobile || state.status == null || state.status.width === 0 || state.status.height === 0,
      desktopStatusVisible: mobile || (state.status?.width ?? 0) > 0,
      touchControlsVisible: !mobile || (state.touch?.width ?? 0) > 0,
      touchControlsFitStage: !mobile || (state.touch?.bottom ?? Number.POSITIVE_INFINITY) <= (state.stage?.bottom ?? 0) + 1,
      noHorizontalOverflow: state.scrollWidth <= state.innerWidth + 1,
    };
    const ok = Object.values(semantic).every((value) => value === true || value === false ? value : Boolean(value));
    const screenshot = path.join(outDir, `da32-005-mugen-lite-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok,
      semantic,
      state,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

async function readVisualState(page) {
  return page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return {
        left: value.left,
        top: value.top,
        right: value.right,
        bottom: value.bottom,
        width: value.width,
        height: value.height,
      };
    };
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const actors =
      bridge?.renderer?.characters?.map((actor) => ({
        actorId: actor.actorId,
        spriteWidth: Number(actor.sprite?.width ?? 0),
        spriteHeight: Number(actor.sprite?.height ?? 0),
        meshPosition: {
          x: Number(actor.meshPosition?.x ?? 0),
          y: Number(actor.meshPosition?.y ?? 0),
          z: Number(actor.meshPosition?.z ?? 0),
        },
      })) ?? [];
    return {
      mode: bridge?.mode ?? null,
      character: bridge?.character ?? null,
      compatibilityLoaded: Boolean(bridge?.snapshot?.actors?.length),
      actors,
      renderCalls: Number(bridge?.renderer?.render?.calls ?? 0),
      stage: rect(".stage"),
      canvas: rect("canvas"),
      hud: rect(".round-hud"),
      status: rect(".stage-status"),
      touch: rect(".touch-controls"),
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(base, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base);
      if (response.ok || response.status === 404) return;
    } catch {
      /* retry until Vite is ready */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Vite server timeout after ${timeoutMs}ms`);
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
