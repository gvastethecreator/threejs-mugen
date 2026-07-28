/**
 * DA32-029: runtime canvas alternative and focus contract at desktop/mobile.
 * This gate proves DOM semantics and live summary presence; it does not claim
 * a full screen-reader journey or WCAG conformance.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-029-a11y-runtime-browser-gate.json");
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
    probePaths: ["scripts/qa_browser_gate_da32_029_a11y.cjs"],
    codePaths: ["src/app/App.ts", "src/app/RuntimeA11ySummary.ts", "src/game/render/ThreeMugenRenderer.ts"],
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
      await runViewport(browser, base, { id: "desktop", width: 1440, height: 900 }),
      await runViewport(browser, base, { id: "mobile", width: 390, height: 844 }),
    ];
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32A11yRuntimeBrowserGate/v1",
      id: "DA32-029",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: runtimeRoute,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional DOM canvas/a11y observations for named viewports"
        : "named desktop/mobile DOM canvas alternative and focus contract",
      claims: {
        allowed: ok
          ? [
              "canvas role, label, description, and keyboard focus",
              "atomic polite status region with live runtime text",
              "P1/P2 gamepad status metric is present",
              "named route has no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: ["screen-reader journey", "contrast audit", "WCAG certification", "physical gamepad coverage"],
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
          viewports: cases.map((item) => ({ id: item.id, ok: item.ok })),
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
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error?.message || error)));

  try {
    await page.goto(`${base}${runtimeRoute}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForSelector("canvas#runtime-a11y-summary, canvas, #runtime-a11y-summary", { timeout: 60_000 });
    await page.waitForFunction(() => Boolean(document.querySelector("canvas") && document.querySelector("#runtime-a11y-summary")?.textContent?.trim()), null, {
      timeout: 60_000,
    });
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const summary = document.querySelector("#runtime-a11y-summary");
      const stage = document.querySelector("#stage");
      const padMetric = [...document.querySelectorAll(".stage-status-metric")].find(
        (element) => element.querySelector("small")?.textContent?.trim() === "Pads",
      );
      const summaryRect = summary?.getBoundingClientRect();
      return {
        canvas: canvas
          ? {
              role: canvas.getAttribute("role"),
              label: canvas.getAttribute("aria-label"),
              describedBy: canvas.getAttribute("aria-describedby"),
              tabIndex: canvas.tabIndex,
            }
          : null,
        stage: stage
          ? {
              describedBy: stage.getAttribute("aria-describedby"),
              label: stage.getAttribute("aria-label"),
            }
          : null,
        summary: summary
          ? {
              role: summary.getAttribute("role"),
              live: summary.getAttribute("aria-live"),
              atomic: summary.getAttribute("aria-atomic"),
              text: summary.textContent?.trim() ?? "",
              clipped: summaryRect?.width === 1 && summaryRect?.height === 1,
            }
          : null,
        padMetric: padMetric?.textContent?.replace(/\s+/g, " ").trim() ?? "",
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    const focused = await page.locator("canvas").evaluate((canvas) => {
      canvas.focus();
      return document.activeElement === canvas;
    });
    const semantic = {
      canvasRole: state.canvas?.role === "img",
      canvasLabel: state.canvas?.label === "MUGEN runtime canvas",
      canvasDescription: state.canvas?.describedBy === "runtime-a11y-summary",
      canvasFocusable: state.canvas?.tabIndex === 0 && focused,
      stageDescription: state.stage?.describedBy?.split(/\s+/).includes("runtime-a11y-summary") === true,
      summaryRole: state.summary?.role === "status",
      summaryLive: state.summary?.live === "polite",
      summaryAtomic: state.summary?.atomic === "true",
      summaryHasText: (state.summary?.text.length ?? 0) > 40,
      summaryClipped: state.summary?.clipped === true,
      padMetric: state.padMetric.includes("Pads"),
      noHorizontalOverflow: state.scrollWidth <= state.innerWidth + 1,
    };
    const screenshot = path.join(outDir, `da32-029-a11y-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(semantic).every(Boolean),
      semantic,
      state,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
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
