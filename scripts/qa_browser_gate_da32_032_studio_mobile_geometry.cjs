/**
 * DA32-032: live Studio mobile geometry and scroll ownership.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-032-studio-mobile-geometry-browser-gate.json");
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const viewports = [
  { width: 390, height: 844, capture: true },
  { width: 619, height: 900 },
  { width: 620, height: 900, capture: true },
  { width: 621, height: 900 },
  { width: 899, height: 900 },
  { width: 900, height: 900, capture: true },
  { width: 901, height: 900 },
  { width: 1160, height: 900 },
  { width: 1161, height: 900, capture: true },
];

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isBenign(message) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(message));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_032_studio_mobile_geometry.cjs"],
    codePaths: ["src/app/App.ts", "src/styles/redesign.css"],
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
    const cases = [];
    for (const viewport of viewports) {
      cases.push(await runViewport(browser, base, viewport));
    }
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32StudioMobileGeometryBrowserGate/v1",
      id: "DA32-032",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional live Studio geometry at named viewports and breakpoint seams"
        : "subject-bound Studio icon, action-height, horizontal-overflow, and stacked-scroll ownership at named viewports",
      claims: {
        allowed: ok
          ? [
              "Tabler SVG defaults remain bounded when a component has no icon-specific CSS",
              "Build actions remain compact and operable at 390, 619-621, 899-901, and 1160-1161 CSS pixels",
              "stacked Studio exposes exactly one keyboard-visible Workflow or Details pane at a time",
              "the 390px Studio route can switch to Match and return without pane state intercepting unrelated actions",
              "the active Studio pane and console delegate vertical scroll ownership to the document at widths up to 1160px",
              "the named viewports have no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: [
          "animated mobile drawers, persistent pane URL state, or wide-screen dock replacement",
          "desktop Build information-architecture simplification",
          "runtime touch-control safe-zone redesign",
          "physical device and screen-reader journeys",
          "full Studio or MUGEN/IKEMEN parity",
        ],
      },
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({
      status: ok ? "passed" : "failed",
      ok,
      provisional: subject.provisional,
      cases: cases.map((item) => ({ id: item.id, ok: item.ok, failures: item.failures })),
      unexpectedConsole: unexpectedConsole.length,
    }, null, 2)}\n`);
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
  const context = await browser.newContext({
    viewport: { width: options.width, height: options.height },
    deviceScaleFactor: options.width === 390 ? 2 : 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.setDefaultNavigationTimeout(120_000);
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error?.message || error)));

  try {
    await page.goto(`${base}${studioRoute}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.mode === "studio" && window.__MUGEN_WEB_SANDBOX__?.studioTab === "build",
      null,
      { timeout: 60_000 },
    );
    await page.waitForSelector('.app-shell.mode-studio[data-studio-tab="build"]', { timeout: 30_000 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

    const geometry = await page.evaluate((stacked) => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      };
      const rect = (element) => {
        const value = element.getBoundingClientRect();
        return {
          top: Math.round(value.top),
          left: Math.round(value.left),
          width: Math.round(value.width),
          height: Math.round(value.height),
          bottom: Math.round(value.bottom),
          right: Math.round(value.right),
        };
      };
      const scrollState = (selector) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) return null;
        const style = getComputedStyle(element);
        return {
          overflowY: style.overflowY,
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
          ownsScroll: ["auto", "scroll"].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 1,
        };
      };
      const icons = [...document.querySelectorAll(".command-launcher-icon, .action-icon")]
        .filter(isVisible)
        .map((element) => ({ className: element.getAttribute("class"), ...rect(element) }));
      const actionButtons = [
        ...document.querySelectorAll(
          '.build-command-center .build-action-grid button[data-action="compile-project"], ' +
            '.build-command-center .build-action-grid button[data-action="export-trace-artifact"]',
        ),
      ]
        .filter(isVisible)
        .map((element) => ({ label: (element.textContent || "").trim().replace(/\s+/g, " "), ...rect(element) }));
      const owners = {
        left: scrollState("#left-pane"),
        right: scrollState("#right-pane"),
        console: scrollState("#console"),
      };
      const documentElement = document.documentElement;
      const body = document.body;
      const paneVisibility = ["#left-pane", "#right-pane"].map((selector) => {
        const element = document.querySelector(selector);
        const style = element ? getComputedStyle(element) : null;
        return {
          selector,
          visible: Boolean(element && style && style.display !== "none" && element.getBoundingClientRect().height > 0),
          display: style?.display || null,
        };
      });
      const paneSwitch = document.querySelector("#studio-mobile-pane-switch");
      const paneSwitchVisible = Boolean(
        paneSwitch && getComputedStyle(paneSwitch).display !== "none" && paneSwitch.getBoundingClientRect().height > 0,
      );
      const frameRegions = ["#left-pane", "#stage", "#right-pane"]
        .map((selector) => {
          const element = document.querySelector(selector);
          if (!element || getComputedStyle(element).display === "none") return null;
          return { selector, ...rect(element) };
        })
        .filter(Boolean);
      return {
        viewport: { width: innerWidth, height: innerHeight },
        title: document.title,
        heading: document.querySelector("#left-pane h1")?.textContent?.trim() || null,
        bodyOverflowY: getComputedStyle(body).overflowY,
        documentScrollHeight: documentElement.scrollHeight,
        bodyScrollHeight: body.scrollHeight,
        documentOwnsScroll: (document.scrollingElement?.scrollHeight || 0) > innerHeight + 1,
        horizontalOverflow:
          documentElement.scrollWidth > innerWidth + 1 || body.scrollWidth > innerWidth + 1,
        owners,
        paneVisibility,
        paneSwitchVisible,
        frameRegions,
        framingOk: frameRegions.every((region) => region.left >= -1 && region.right <= innerWidth + 1),
        icons,
        actionButtons,
        iconBoundsOk: icons.length > 0 && icons.every((icon) => icon.width <= 32 && icon.height <= 32),
        actionBoundsOk:
          actionButtons.length > 0 &&
          actionButtons.every((button) => button.height >= 40 && button.height <= 64 && button.width <= innerWidth),
        singleDocumentScroll:
          !stacked ||
          (getComputedStyle(documentElement).overflowY === "auto" &&
            (document.scrollingElement?.scrollHeight || 0) > innerHeight + 1 &&
            Object.values(owners).every((owner) => owner && !owner.ownsScroll)),
        paneModeOk: stacked
          ? paneSwitchVisible && paneVisibility.filter((pane) => pane.visible).length === 1
          : !paneSwitchVisible && paneVisibility.filter((pane) => pane.visible).length === 2,
      };
    }, options.width <= 1160);

    let paneSwitch = { attempted: false, detailsVisible: false, workflowRestored: false };
    if (options.width <= 1160) {
      paneSwitch.attempted = true;
      await page.locator('[data-studio-mobile-pane="details"]').click();
      paneSwitch.detailsVisible = await page.evaluate(() => {
        const shell = document.querySelector(".app-shell");
        const left = document.querySelector("#left-pane");
        const right = document.querySelector("#right-pane");
        return shell?.getAttribute("data-studio-mobile-pane-state") === "details" &&
          left instanceof HTMLElement && getComputedStyle(left).display === "none" &&
          right instanceof HTMLElement && getComputedStyle(right).display !== "none" &&
          document.querySelector('[data-studio-mobile-pane="details"]')?.getAttribute("aria-pressed") === "true";
      });
      if (options.width === 390) {
        const detailsName = "da32-032-studio-mobile-geometry-w390-details.png";
        const detailsAbsolute = path.join(outDir, detailsName);
        await page.screenshot({ path: detailsAbsolute, fullPage: false });
        paneSwitch.detailsScreenshot = path.relative(repoRoot, detailsAbsolute).replaceAll("\\", "/");
      }
      await page.locator('[data-studio-mobile-pane="workflow"]').click();
      paneSwitch.workflowRestored = await page.evaluate(() => {
        const shell = document.querySelector(".app-shell");
        const left = document.querySelector("#left-pane");
        const right = document.querySelector("#right-pane");
        return shell?.getAttribute("data-studio-mobile-pane-state") === "workflow" &&
          left instanceof HTMLElement && getComputedStyle(left).display !== "none" &&
          right instanceof HTMLElement && getComputedStyle(right).display === "none" &&
          document.querySelector('[data-studio-mobile-pane="workflow"]')?.getAttribute("aria-pressed") === "true";
      });
    }

    let modeRoundTrip = { attempted: false, matchReached: false, studioRestored: false };
    if (options.width === 390) {
      modeRoundTrip.attempted = true;
      await page.locator('button[data-mode="match"]:visible').first().click();
      modeRoundTrip.matchReached = await page
        .waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "match", null, { timeout: 10_000 })
        .then(() => true, () => false);
      await page.locator('button[data-mode="studio"]:visible').first().click();
      modeRoundTrip.studioRestored = await page
        .waitForFunction(
          () => window.__MUGEN_WEB_SANDBOX__?.mode === "studio" && window.__MUGEN_WEB_SANDBOX__?.studioTab === "build",
          null,
          { timeout: 10_000 },
        )
        .then(() => true, () => false);
    }

    const focus = [];
    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press("Tab");
      focus.push(await page.evaluate(() => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement)) return { ok: false, tag: null, label: null };
        const rect = element.getBoundingClientRect();
        return {
          ok: rect.width > 0 && rect.height > 0,
          tag: element.tagName.toLowerCase(),
          label: (element.textContent || element.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 80),
        };
      }));
    }

    let screenshot = null;
    if (options.capture) {
      const name = `da32-032-studio-mobile-geometry-w${options.width}.png`;
      const absolute = path.join(outDir, name);
      await page.screenshot({ path: absolute, fullPage: false });
      screenshot = path.relative(repoRoot, absolute).replaceAll("\\", "/");
    }

    const failures = [];
    if (geometry.horizontalOverflow) failures.push("horizontal-overflow");
    if (!geometry.iconBoundsOk) failures.push("icon-bounds");
    if (!geometry.actionBoundsOk) failures.push("action-bounds");
    if (!geometry.framingOk) failures.push("viewport-framing");
    if (!geometry.singleDocumentScroll) failures.push("scroll-ownership");
    if (!geometry.paneModeOk || (paneSwitch.attempted && (!paneSwitch.detailsVisible || !paneSwitch.workflowRestored))) {
      failures.push("pane-switch");
    }
    if (modeRoundTrip.attempted && (!modeRoundTrip.matchReached || !modeRoundTrip.studioRestored)) {
      failures.push("mode-switch");
    }
    if (focus.some((item) => !item.ok)) failures.push("keyboard-focus");
    return {
      id: `w${options.width}`,
      viewport: `${options.width}x${options.height}`,
      ok: failures.length === 0,
      failures,
      geometry,
      focus,
      paneSwitch,
      modeRoundTrip,
      screenshot,
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

function waitForServer(base, timeoutMs) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      const request = require("node:http").get(base, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) resolve();
        else retry();
      });
      request.on("error", retry);
      request.setTimeout(1000, () => {
        request.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) reject(new Error(`Vite server did not start at ${base}`));
      else setTimeout(probe, 250);
    };
    probe();
  });
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
