const { chromium } = require("playwright");
const fs = require("fs");
const JSZip = require("jszip");
const net = require("net");
const path = require("path");

const DEFAULT_OUT_DIR = ".scratch/qa/official-stage-compatibility-browser";
const DEFAULT_CHARACTER_FIXTURE = ".scratch/fixtures/kfm-official.zip";
const DEFAULT_OFFICIAL_STAGE_ROOT = ".scratch/external/mugen-1.1b1";
const STAGE_ID = "stage-training-room";

async function main() {
  const outDir = path.resolve(process.cwd(), process.env.QA_STAGE_OUT_DIR ?? DEFAULT_OUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });
  const fixturePath = await createCombinedFixture(outDir);
  const server = await resolveServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleIssues = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleIssues.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  try {
    await page.goto(`${server.baseUrl}/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`, {
      waitUntil: "networkidle",
      timeout: 120_000,
    });
    await waitForBridge(page);
    await waitForLayout(page);
    await page.locator("#zip-input").setInputFiles(fixturePath);
    await page.waitForFunction(
      (stageId) => Boolean(window.__MUGEN_WEB_SANDBOX__?.stages?.some((stage) => stage.stage === "Training Room")),
      STAGE_ID,
      { timeout: 30_000 },
    );

    await page.locator('[data-mode="studio"]').first().click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio", undefined, { timeout: 10_000 });
    await waitForLayout(page);
    await clickVisibleStudioTab(page, "build");
    await selectStudioTab(page, "stage");
    await page.locator(`button[data-studio-stage-id="${STAGE_ID}"]`).click();
    await page.waitForFunction(
      (stageId) => window.__MUGEN_WEB_SANDBOX__?.project?.entry?.stage === stageId,
      STAGE_ID,
      { timeout: 10_000 },
    );
    await page.waitForTimeout(350);

    const desktop = await captureViewport(page, outDir, "desktop", { width: 1440, height: 960 });
    const mobile = await captureViewport(page, outDir, "mobile", { width: 390, height: 844 });
    const bridge = await page.evaluate(() => {
      const value = window.__MUGEN_WEB_SANDBOX__;
      const report = value?.stages?.find((stage) => stage.stage === "Training Room");
      const bodyText = document.body.innerText.toLowerCase();
      return {
        mode: value?.mode,
        studioTab: value?.studioTab,
        selectedStage: value?.project?.entry?.stage,
        stageReports: value?.stages?.length ?? 0,
        report,
        bodyHasStagePreview: bodyText.includes("stage preview"),
        bodyHasStageContract: bodyText.includes("stage contract"),
        bodyHasAvailableStages: bodyText.includes("available stages"),
        bodyHasLayerStatus: bodyText.includes("bg layer status"),
        bodyHasLayerDiagnostics: bodyText.includes("layer diagnostics"),
      };
    });
    const diagnostics = {
      status: "passed",
      generatedAt: new Date().toISOString(),
      baseUrl: server.baseUrl,
      serverMode: server.mode,
      fixture: {
        path: path.relative(process.cwd(), fixturePath).replaceAll("\\", "/"),
        bytes: fs.statSync(fixturePath).size,
        source: "kfm-official.zip + official MUGEN 1.1b1 stage0 sample",
      },
      bridge: summarizeBridge(bridge),
      viewports: { desktop, mobile },
      consoleIssues,
      pageErrors,
      artifacts: [
        "official-stage0-browser-desktop.png",
        "official-stage0-browser-desktop-canvas.png",
        "official-stage0-browser-mobile.png",
        "official-stage0-browser-mobile-canvas.png",
      ],
    };
    assertDiagnostics(diagnostics);
    fs.writeFileSync(path.join(outDir, "browser-diagnostics.json"), `${JSON.stringify(diagnostics, null, 2)}\n`);
    console.log(JSON.stringify(diagnostics, null, 2));
  } catch (error) {
    const failure = {
      status: "failed",
      generatedAt: new Date().toISOString(),
      baseUrl: server.baseUrl,
      serverMode: server.mode,
      fixturePath: path.relative(process.cwd(), fixturePath).replaceAll("\\", "/"),
      consoleIssues,
      pageErrors,
      error: error instanceof Error ? error.stack ?? error.message : String(error),
    };
    fs.writeFileSync(path.join(outDir, "browser-diagnostics.json"), `${JSON.stringify(failure, null, 2)}\n`);
    throw error;
  } finally {
    await browser.close();
    await server.stop();
  }
}

async function createCombinedFixture(outDir) {
  const characterFixturePath = path.resolve(process.cwd(), process.env.QA_STAGE_CHARACTER_FIXTURE ?? DEFAULT_CHARACTER_FIXTURE);
  const stageRoot = path.resolve(process.cwd(), process.env.QA_STAGE_ROOT ?? DEFAULT_OFFICIAL_STAGE_ROOT);
  const zip = await JSZip.loadAsync(fs.readFileSync(characterFixturePath));
  const stageDefPath = path.join(stageRoot, "stages", "stage0.def");
  const stageSffPath = path.join(stageRoot, "stages", "stage0.sff");
  const readmePath = path.join(stageRoot, "readme.txt");
  for (const [archivePath, localPath] of [
    ["stages/stage0.def", stageDefPath],
    ["stages/stage0.sff", stageSffPath],
    ["readme.txt", readmePath],
  ]) {
    if (!fs.existsSync(localPath)) {
      throw new Error(`Official stage fixture file is missing: ${localPath}`);
    }
    zip.file(archivePath, fs.readFileSync(localPath));
  }
  const fixturePath = path.join(outDir, "mugen-official-stage0-browser.zip");
  fs.writeFileSync(fixturePath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  return fixturePath;
}

async function captureViewport(page, outDir, id, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(150);
  const screenshotName = `official-stage0-browser-${id}.png`;
  const canvasName = `official-stage0-browser-${id}-canvas.png`;
  await page.screenshot({ path: path.join(outDir, screenshotName), fullPage: true });
  const canvasPng = await page.locator("canvas").first().screenshot({ path: path.join(outDir, canvasName) });
  return {
    viewport,
    screenshot: screenshotName,
    canvas: canvasName,
    canvasPixels: await getCanvasPixelStats(page, canvasPng),
    bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
    clientWidth: await page.evaluate(() => document.documentElement.clientWidth),
  };
}

async function getCanvasPixelStats(page, canvasPng) {
  return page.evaluate(async (dataUrl) => {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = image.naturalWidth;
    sampleCanvas.height = image.naturalHeight;
    const context = sampleCanvas.getContext("2d");
    if (!context) return { nonBlank: false, uniqueColors: 0, width: image.naturalWidth, height: image.naturalHeight };
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
    const colors = new Set();
    const stride = Math.max(4, Math.floor(data.length / 1600 / 4) * 4);
    let nonBlank = false;
    for (let index = 0; index < data.length; index += stride) {
      colors.add(`${data[index]},${data[index + 1]},${data[index + 2]},${data[index + 3]}`);
      if (data[index + 3] !== 0 && (data[index] !== 0 || data[index + 1] !== 0 || data[index + 2] !== 0)) nonBlank = true;
    }
    return { nonBlank, uniqueColors: colors.size, width: sampleCanvas.width, height: sampleCanvas.height };
  }, `data:image/png;base64,${canvasPng.toString("base64")}`);
}

async function selectStudioTab(page, tab) {
  const button = page.locator(`.studio-tab-section [data-studio-tab="${tab}"]`).first();
  await button.waitFor({ state: "visible", timeout: 15_000 });
  await button.click();
  await page.waitForFunction((expected) => window.__MUGEN_WEB_SANDBOX__?.studioTab === expected, tab, { timeout: 10_000 });
}

async function clickVisibleStudioTab(page, tab) {
  const buttons = page.locator(`[data-studio-tab="${tab}"]`);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    for (let index = 0; index < await buttons.count(); index += 1) {
      const button = buttons.nth(index);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForFunction((expected) => window.__MUGEN_WEB_SANDBOX__?.studioTab === expected, tab, { timeout: 10_000 });
        return;
      }
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`No visible Studio tab trigger found for ${tab}`);
}

async function waitForBridge(page) {
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__), undefined, { timeout: 20_000 });
}

async function waitForLayout(page) {
  await page.waitForFunction(
    () => {
      const shell = document.querySelector(".app-shell");
      const leftPane = document.querySelector("#left-pane");
      return Boolean(shell && leftPane && shell.getBoundingClientRect().width > 0 && leftPane.getBoundingClientRect().width > 0);
    },
    undefined,
    { timeout: 30_000 },
  );
}

function summarizeBridge(bridge) {
  return {
    mode: bridge.mode,
    studioTab: bridge.studioTab,
    selectedStage: bridge.selectedStage,
    stageReports: bridge.stageReports,
    stage: bridge.report
      ? {
          name: bridge.report.stage,
          loaded: bridge.report.loaded,
          files: bridge.report.files,
          decodedSprites: bridge.report.sff.decodedSprites,
          totalSprites: bridge.report.sff.totalSprites,
          backgroundCount: bridge.report.backgrounds.total,
          renderedBackgrounds: bridge.report.backgrounds.renderedSprites,
          tiledBackgrounds: bridge.report.backgrounds.tiled,
          errors: bridge.report.errors,
        }
      : undefined,
    bodyHasStagePreview: bridge.bodyHasStagePreview,
    bodyHasStageContract: bridge.bodyHasStageContract,
    bodyHasAvailableStages: bridge.bodyHasAvailableStages,
    bodyHasLayerStatus: bridge.bodyHasLayerStatus,
    bodyHasLayerDiagnostics: bridge.bodyHasLayerDiagnostics,
  };
}

function assertDiagnostics(diagnostics) {
  const bridge = diagnostics.bridge;
  const stage = bridge.stage;
  const failures = [];
  if (bridge.mode !== "studio" || bridge.studioTab !== "stage") failures.push("Studio stage tab was not active");
  if (bridge.selectedStage !== STAGE_ID) failures.push(`Selected stage was ${bridge.selectedStage ?? "missing"}`);
  if (!stage || stage.name !== "Training Room") failures.push("Training Room report was not exposed");
  if (stage && (!stage.loaded || !stage.files.def || !stage.files.sff || stage.decodedSprites < 1)) failures.push("Training Room DEF/SFF evidence is incomplete");
  if (stage && stage.backgroundCount < 2) failures.push(`Expected at least two background layers, got ${stage.backgroundCount}`);
  for (const [id, viewport] of Object.entries(diagnostics.viewports)) {
    if (!viewport.canvasPixels.nonBlank || viewport.canvasPixels.uniqueColors < 20) failures.push(`${id} stage canvas is blank or under-sampled`);
    if (viewport.bodyScrollWidth > viewport.clientWidth + 1) failures.push(`${id} stage view overflows horizontally`);
  }
  if (!bridge.bodyHasStagePreview || !bridge.bodyHasStageContract || !bridge.bodyHasAvailableStages || !bridge.bodyHasLayerStatus || !bridge.bodyHasLayerDiagnostics) {
    failures.push("Stage Studio diagnostics surface is incomplete");
  }
  if (diagnostics.pageErrors.length || diagnostics.consoleIssues.length) failures.push("Browser emitted page or console diagnostics");
  if (failures.length) throw new Error(`Official stage browser QA failed:\n${failures.join("\n")}`);
}

async function resolveServer() {
  const externalBaseUrl = process.env.QA_BASE_URL?.replace(/\/$/, "");
  if (externalBaseUrl) return { baseUrl: externalBaseUrl, mode: "external", stop: async () => undefined };
  const port = Number(process.env.QA_PORT ?? (await findFreePort(5310)));
  const { createServer } = await import("vite");
  const vite = await createServer({
    root: process.cwd(),
    logLevel: "warn",
    server: { host: "127.0.0.1", port, strictPort: true },
  });
  await vite.listen();
  return {
    baseUrl: vite.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`,
    mode: "started-vite",
    stop: async () => vite.close(),
  };
}

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", (error) => (error.code === "EADDRINUSE" ? resolve(findFreePort(startPort + 1)) : reject(error)));
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(typeof address === "object" && address ? address.port : startPort));
    });
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
