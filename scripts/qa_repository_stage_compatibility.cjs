const { chromium } = require("playwright");
const fs = require("fs");
const net = require("net");
const path = require("path");

const DEFAULT_OUT_DIR = ".scratch/qa/repository-skyline-relay-browser";
const STAGE_ID = "stage-skyline-relay";
const STAGE_NAME = "Skyline Relay";

async function main() {
  const outDir = path.resolve(process.cwd(), process.env.QA_STAGE_OUT_DIR ?? DEFAULT_OUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });
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
    if (["error", "warning"].includes(message.type())) consoleIssues.push({ type: message.type(), text: message.text() });
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  try {
    await page.goto(`${server.baseUrl}/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    await waitForBridge(page);
    const fixture = await page.evaluate(async () => {
      const packageModule = await import("/src/mugen/runtime/RepositoryStagePackage.ts");
      const vfs = packageModule.createRepositoryStagePackageVfs();
      const zipBytes = await packageModule.createRepositoryStagePackageZipBytes(vfs);
      return {
        packageDigest: await packageModule.createRepositoryStagePackageDigest(vfs),
        zipBase64: bytesToBase64(new Uint8Array(zipBytes)),
        entries: vfs.listFiles().map((entryPath) => ({
          path: entryPath,
          base64: bytesToBase64(vfs.readBytes(entryPath) ?? new Uint8Array()),
        })),
      };

      function bytesToBase64(bytes) {
        let binary = "";
        for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
        return btoa(binary);
      }
    });
    const zipBuffer = Buffer.from(fixture.zipBase64, "base64");

    await importZip(page, zipBuffer);
    const zipEvidence = await collectImportEvidence(page, "zip");

    await page.goto(`${server.baseUrl}/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    await waitForBridge(page);
    await importFolder(page, fixture.entries);
    const folderEvidence = await collectImportEvidence(page, "folder");

    await page.locator('[data-mode="studio"]').first().click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio", undefined, { timeout: 10_000 });
    await clickVisibleStudioTab(page, "build");
    await selectStudioTab(page, "stage");
    await page.locator(`button[data-studio-stage-id="${STAGE_ID}"]`).click();
    await page.waitForFunction((stageId) => window.__MUGEN_WEB_SANDBOX__?.project?.entry?.stage === stageId, STAGE_ID, { timeout: 10_000 });

    const desktop = await captureViewport(page, outDir, "desktop", { width: 1440, height: 960 });
    const mobile = await captureViewport(page, outDir, "mobile", { width: 390, height: 844 });
    const bridge = await page.evaluate(() => {
      const value = window.__MUGEN_WEB_SANDBOX__;
      const report = value?.stages?.find((stage) => stage.stage === "Skyline Relay");
      const bodyText = document.body.innerText.toLowerCase();
      return {
        mode: value?.mode,
        studioTab: value?.studioTab,
        selectedStage: value?.project?.entry?.stage,
        character: value?.character,
        report,
        snapshotStage: value?.snapshot?.stage,
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
        packageDigest: fixture.packageDigest,
        zipBytes: zipBuffer.length,
        entryCount: fixture.entries.length,
        entries: fixture.entries.map((entry) => entry.path),
      },
      transports: { zip: zipEvidence, folder: folderEvidence },
      bridge: summarizeBridge(bridge),
      viewports: { desktop, mobile },
      consoleIssues,
      pageErrors,
      artifacts: [
        "repository-skyline-relay-browser-desktop.png",
        "repository-skyline-relay-browser-desktop-canvas.png",
        "repository-skyline-relay-browser-mobile.png",
        "repository-skyline-relay-browser-mobile-canvas.png",
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

async function importZip(page, buffer) {
  await page.locator("#zip-input").setInputFiles({
    name: "repository-skyline-relay.zip",
    mimeType: "application/zip",
    buffer,
  });
  await waitForImportedPackage(page);
}

async function importFolder(page, entries) {
  await page.locator("#folder-input").evaluate((input, fixtureEntries) => {
    const transfer = new DataTransfer();
    for (const entry of fixtureEntries) {
      const bytes = Uint8Array.from(atob(entry.base64), (character) => character.charCodeAt(0));
      const pathParts = entry.path.split("/");
      const file = new File([bytes], pathParts.at(-1) ?? "source.bin", { type: "application/octet-stream" });
      Object.defineProperty(file, "webkitRelativePath", { value: `repository-skyline-relay/${entry.path}` });
      transfer.items.add(file);
    }
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, entries);
  await waitForImportedPackage(page);
}

async function waitForImportedPackage(page) {
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return bridge?.character === "MUGEN Lite Journey" && bridge.stages?.some((stage) => stage.stage === "Skyline Relay" && stage.loaded);
  }, undefined, { timeout: 30_000 });
}

async function collectImportEvidence(page, transport) {
  return page.evaluate((transportKind) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const source = bridge?.project?.sourcePackages?.[0];
    const report = bridge?.stages?.find((stage) => stage.stage === "Skyline Relay");
    return {
      transport: transportKind,
      mode: bridge?.mode,
      character: bridge?.character,
      source: source
        ? {
            kind: source.kind,
            fileCount: source.fileCount,
            fingerprint: source.fingerprint,
            requiredPaths: source.requiredPaths,
          }
        : undefined,
      stage: report
        ? {
            name: report.stage,
            loaded: report.loaded,
            files: report.files,
            backgrounds: report.backgrounds,
            sff: report.sff,
            errors: report.errors,
          }
        : undefined,
      snapshotStage: bridge?.snapshot?.stage,
    };
  }, transport);
}

async function captureViewport(page, outDir, id, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(200);
  const screenshotName = `repository-skyline-relay-browser-${id}.png`;
  const canvasName = `repository-skyline-relay-browser-${id}-canvas.png`;
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

function summarizeBridge(bridge) {
  return {
    mode: bridge.mode,
    studioTab: bridge.studioTab,
    selectedStage: bridge.selectedStage,
    character: bridge.character,
    snapshotStage: bridge.snapshotStage,
    stage: bridge.report
      ? {
          name: bridge.report.stage,
          loaded: bridge.report.loaded,
          files: bridge.report.files,
          decodedSprites: bridge.report.sff.decodedSprites,
          totalSprites: bridge.report.sff.totalSprites,
          backgroundCount: bridge.report.backgrounds.total,
          renderedBackgrounds: bridge.report.backgrounds.renderedSprites,
          renderedAnimatedBackgrounds: bridge.report.backgrounds.renderedAnimated,
          tiledBackgrounds: bridge.report.backgrounds.tiled,
          boundedControllers: bridge.report.backgrounds.controllers.bounded,
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
  const zip = diagnostics.transports.zip;
  const folder = diagnostics.transports.folder;
  const failures = [];
  if (zip.transport !== "zip" || zip.source?.kind !== "zip") failures.push("ZIP transport was not recorded");
  if (folder.transport !== "folder" || folder.source?.kind !== "folder") failures.push("folder transport was not recorded");
  if (!zip.source?.fingerprint || zip.source.fingerprint !== folder.source?.fingerprint) failures.push("folder and ZIP source fingerprints differ");
  if (zip.source?.fileCount !== folder.source?.fileCount) failures.push("folder and ZIP file counts differ");
  if (bridge.mode !== "studio" || bridge.studioTab !== "stage") failures.push("Studio stage tab was not active");
  if (bridge.selectedStage !== STAGE_ID || bridge.snapshotStage?.id !== STAGE_ID) failures.push("Skyline Relay was not the active runtime stage");
  if (bridge.character !== "MUGEN Lite Journey") failures.push("MUGEN Lite Journey character was not active");
  if (!stage || stage.name !== STAGE_NAME) failures.push("Skyline Relay report was not exposed");
  if (stage && (!stage.loaded || !stage.files.def || !stage.files.sff || stage.decodedSprites < 1)) failures.push("Skyline Relay DEF/SFF evidence is incomplete");
  if (stage && (stage.backgroundCount < 3 || stage.renderedAnimatedBackgrounds < 1 || stage.tiledBackgrounds < 1 || stage.boundedControllers < 1)) failures.push("Skyline Relay background evidence is incomplete");
  if (!bridge.bodyHasStagePreview || !bridge.bodyHasStageContract || !bridge.bodyHasAvailableStages || !bridge.bodyHasLayerStatus || !bridge.bodyHasLayerDiagnostics) failures.push("Stage Studio diagnostics surface is incomplete");
  for (const [id, viewport] of Object.entries(diagnostics.viewports)) {
    if (!viewport.canvasPixels.nonBlank || viewport.canvasPixels.uniqueColors < 20) failures.push(`${id} stage canvas is blank or under-sampled`);
    if (viewport.bodyScrollWidth > viewport.clientWidth + 1) failures.push(`${id} stage view overflows horizontally`);
  }
  if (diagnostics.pageErrors.length || diagnostics.consoleIssues.length) failures.push("Browser emitted page or console diagnostics");
  if (failures.length) throw new Error(`Repository stage browser QA failed:\n${failures.join("\n")}`);
}

async function waitForBridge(page) {
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__), undefined, { timeout: 20_000 });
}

async function resolveServer() {
  const externalBaseUrl = process.env.QA_BASE_URL?.replace(/\/$/, "");
  if (externalBaseUrl) return { baseUrl: externalBaseUrl, mode: "external", stop: async () => undefined };
  const port = Number(process.env.QA_PORT ?? (await findFreePort(5320)));
  const { createServer } = await import("vite");
  const vite = await createServer({ root: process.cwd(), logLevel: "warn", server: { host: "127.0.0.1", port, strictPort: true } });
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
