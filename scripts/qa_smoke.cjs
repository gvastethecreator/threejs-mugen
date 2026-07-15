const { chromium } = require("playwright");
const fs = require("fs");
const JSZip = require("jszip");
const net = require("net");
const path = require("path");

const DEFAULT_P1 = "nova-boxer";
const DEFAULT_P2 = "mira-volt";
const DEFAULT_STAGE = "rooftop-dojo";
const DEFAULT_OUT_DIR = ".scratch/qa/qa-smoke";
const DEFAULT_IMPORTED_FIXTURE = ".scratch/fixtures/kfm-official.zip";
const DEFAULT_CODE_FUMAN_FIXTURE = ".scratch/fixtures/codefuman.zip";
const MUGEN_LITE_FIXTURE_SPRITES = [
  ...[0, 10, 20, 40, 120, 130, 150, 200, 5000, 5050, 5100, 5200].map((group) => [group, 0]),
  [200, 1],
  [210, 0],
];
const MUGEN_LITE_JOURNEY_PALETTE_COLORS = [
  [240, 32, 80],
  [35, 195, 255],
  [255, 210, 45],
];

const routeParams = `p1=${DEFAULT_P1}&p2=${DEFAULT_P2}&stage=${DEFAULT_STAGE}`;
const runtimeRoute = `/?mode=match&${routeParams}`;
const tagPresentationRoute = `/?mode=match&scenario=ikemen-tag-presentation&${routeParams}`;
const studioWorkbenchRoute = `/?mode=studio&studio=workbench&${routeParams}`;
const studioBuildRoute = `/?mode=studio&studio=build&${routeParams}`;
const studioModulesRoute = `/?mode=studio&studio=modules&${routeParams}`;
const studioAssetsRoute = `/?mode=studio&studio=assets&${routeParams}`;
const studioStageRoute = `/?mode=studio&studio=stage&${routeParams}`;
const studioDebugRoute = `/?mode=studio&studio=debug&${routeParams}`;
const studioBgCtrlStageRoute = `/?mode=studio&studio=stage&p1=${DEFAULT_P1}&p2=${DEFAULT_P2}&stage=bgctrl-lab`;

function studioTabLocator(page, tab) {
  return page.locator(`.studio-tab-section [data-studio-tab="${tab}"]:visible`).first();
}

async function selectStudioTab(page, tab) {
  const current = await evaluateWithStableBridge(page, () => window.__MUGEN_WEB_SANDBOX__?.studioTab);
  if (current !== tab) {
    await studioTabLocator(page, tab).evaluate((button) => button.click());
  }
  await page.waitForFunction((expected) => window.__MUGEN_WEB_SANDBOX__?.studioTab === expected, tab);
}

async function main() {
  const outDir = path.resolve(process.cwd(), process.env.QA_SMOKE_OUT_DIR ?? DEFAULT_OUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });

  const server = await resolveServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const logs = [];
  const pageErrors = [];
  page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  try {
    const runtimeDesktop = await captureRuntime(page, server.baseUrl, {
      viewport: { width: 1440, height: 960 },
      screenshotPath: path.join(outDir, "runtime-desktop.png"),
      canvasPath: path.join(outDir, "runtime-canvas.png"),
      label: "runtime-desktop",
    });

    const runtimeMobile = await captureRuntime(page, server.baseUrl, {
      viewport: { width: 390, height: 844 },
      screenshotPath: path.join(outDir, "runtime-mobile.png"),
      canvasPath: path.join(outDir, "runtime-mobile-canvas.png"),
      label: "runtime-mobile",
    });

    const mugenLiteVisual = await captureMugenLiteVisual(page, server.baseUrl, outDir);

    const codeFuManFixturePath = path.resolve(process.cwd(), process.env.QA_CODEFUMAN_FIXTURE_PATH ?? DEFAULT_CODE_FUMAN_FIXTURE);
    const codeFuManVisual = await captureCodeFuManVisual(
      page,
      server.baseUrl,
      outDir,
      fs.existsSync(codeFuManFixturePath) ? codeFuManFixturePath : undefined,
    );

    const tagPresentation = await captureTagPresentation(page, server.baseUrl, outDir);

    const studioWorkbench = await captureStudioWorkbench(page, server.baseUrl, outDir);
    const studioWorkbenchTablet = await captureStudioWorkbenchTablet(page, server.baseUrl, outDir);
    const commandPaletteA11y = await captureCommandPaletteA11y(page, server.baseUrl, outDir);

    const importedFixturePath = path.resolve(process.cwd(), process.env.QA_IMPORTED_FIXTURE_PATH ?? DEFAULT_IMPORTED_FIXTURE);
    const buildPage = await context.newPage();
    const studioBuild = await captureStudioBuild(buildPage, server.baseUrl, outDir, fs.existsSync(importedFixturePath) ? importedFixturePath : undefined);
    const studioModules = await captureStudioModules(buildPage, outDir);
    const relinkPage = await context.newPage();
    const studioSourceRelink = await captureStudioSourceRelink(
      relinkPage,
      server.baseUrl,
      outDir,
      fs.existsSync(importedFixturePath) ? importedFixturePath : undefined,
    );
    await relinkPage.close();
    const folderHandlePage = await context.newPage();
    const studioFolderHandleRecovery = await captureStudioFolderHandleRecovery(
      folderHandlePage,
      server.baseUrl,
      outDir,
      fs.existsSync(importedFixturePath) ? importedFixturePath : undefined,
    );
    await folderHandlePage.close();
    const ikemenPage = await context.newPage();
    const ikemenScan = await captureIkemenScan(ikemenPage, server.baseUrl, outDir);
    await ikemenPage.close();
    const studioStage = await captureStudioStage(buildPage, outDir);
    const studioEvidence = await captureStudioEvidence(buildPage, outDir);
    const studioDebug = await captureStudioDebug(
      buildPage,
      server.baseUrl,
      outDir,
      fs.existsSync(importedFixturePath) ? importedFixturePath : undefined,
    );
    const bgCtrlStagePage = await context.newPage();
    const studioBgCtrlStage = await captureStudioBgCtrlStage(bgCtrlStagePage, server.baseUrl, outDir);
    await bgCtrlStagePage.close();
    await page.goto(`${server.baseUrl}${studioAssetsRoute}`, { waitUntil: "domcontentloaded" });
    await waitForBridge(page);
    const studioAssets = await captureStudioAssets(page, outDir);
    const studioReplacement = await captureStudioAssetReplacement(context, server.baseUrl, outDir);
    await buildPage.close();
    const studioStorageConflict = await captureStudioProjectStorageConflict(context, server.baseUrl, outDir);

    const consoleIssues = getRelevantConsoleIssues(logs);
    const diagnostics = {
      generatedAt: new Date().toISOString(),
      baseUrl: server.baseUrl,
      serverMode: server.mode,
      browserPath: "playwright",
      browserFallbackReason: "Browser plugin tools were not callable in this session.",
      routes: {
        runtime: runtimeRoute,
        tagPresentation: tagPresentationRoute,
        studioWorkbench: studioWorkbenchRoute,
        studioBuild: studioBuildRoute,
        studioModules: studioModulesRoute,
        studioAssets: studioAssetsRoute,
      },
      checks: {
        runtimeDesktop,
        runtimeMobile,
        mugenLiteVisual,
        codeFuManVisual,
        tagPresentation,
        studioWorkbench,
        studioWorkbenchTablet,
        commandPaletteA11y,
        studioBuild,
        studioModules,
        studioSourceRelink,
        studioFolderHandleRecovery,
        ikemenScan,
        studioStage,
        studioBgCtrlStage,
        studioAssets,
        studioReplacement,
        studioStorageConflict,
        studioEvidence,
        studioDebug,
      },
      logs,
      consoleIssues,
      pageErrors,
      screenshots: {
        runtimeDesktop: path.join(outDir, "runtime-desktop.png"),
        runtimeMobile: path.join(outDir, "runtime-mobile.png"),
        mugenLiteDesktop: path.join(outDir, "mugen-lite-runtime-desktop.png"),
        mugenLiteDesktopCanvas: path.join(outDir, "mugen-lite-runtime-desktop-canvas.png"),
        mugenLiteDesktopAttack: path.join(outDir, "mugen-lite-runtime-desktop-attack.png"),
        mugenLiteDesktopAttackCanvas: path.join(outDir, "mugen-lite-runtime-desktop-attack-canvas.png"),
        mugenLiteDesktopAttackFollowThrough: path.join(outDir, "mugen-lite-runtime-desktop-attack-follow-through.png"),
        mugenLiteDesktopAttackFollowThroughCanvas: path.join(outDir, "mugen-lite-runtime-desktop-attack-follow-through-canvas.png"),
        mugenLiteDesktopPalette: path.join(outDir, "mugen-lite-runtime-desktop-palette.png"),
        mugenLiteDesktopPaletteCanvas: path.join(outDir, "mugen-lite-runtime-desktop-palette-canvas.png"),
        mugenLiteMobile: path.join(outDir, "mugen-lite-runtime-mobile.png"),
        mugenLiteMobileCanvas: path.join(outDir, "mugen-lite-runtime-mobile-canvas.png"),
        mugenLiteMobileAttack: path.join(outDir, "mugen-lite-runtime-mobile-attack.png"),
        mugenLiteMobileAttackCanvas: path.join(outDir, "mugen-lite-runtime-mobile-attack-canvas.png"),
        mugenLiteMobileAttackFollowThrough: path.join(outDir, "mugen-lite-runtime-mobile-attack-follow-through.png"),
        mugenLiteMobileAttackFollowThroughCanvas: path.join(outDir, "mugen-lite-runtime-mobile-attack-follow-through-canvas.png"),
        mugenLiteMobilePalette: path.join(outDir, "mugen-lite-runtime-mobile-palette.png"),
        mugenLiteMobilePaletteCanvas: path.join(outDir, "mugen-lite-runtime-mobile-palette-canvas.png"),
        codeFuManInitial: path.join(outDir, "codefuman-runtime-desktop.png"),
        codeFuManInitialCanvas: path.join(outDir, "codefuman-runtime-desktop-canvas.png"),
        codeFuManAttack: path.join(outDir, "codefuman-runtime-desktop-attack.png"),
        codeFuManAttackCanvas: path.join(outDir, "codefuman-runtime-desktop-attack-canvas.png"),
        codeFuManSpecial: path.join(outDir, "codefuman-runtime-desktop-qcf.png"),
        codeFuManSpecialCanvas: path.join(outDir, "codefuman-runtime-desktop-qcf-canvas.png"),
        codeFuManUpper: path.join(outDir, "codefuman-runtime-desktop-upper.png"),
        codeFuManUpperCanvas: path.join(outDir, "codefuman-runtime-desktop-upper-canvas.png"),
        mugenLiteMovement: Object.fromEntries(["desktop", "mobile"].map((viewport) => [viewport, Object.fromEntries(
          ["walk", "crouch", "jump"].flatMap((pose) => [
            [pose, path.join(outDir, `mugen-lite-runtime-${viewport}-${pose}.png`)],
            [`${pose}Canvas`, path.join(outDir, `mugen-lite-runtime-${viewport}-${pose}-canvas.png`)],
          ]),
        )])),
        mugenLiteCombat: Object.fromEntries(["desktop", "mobile"].map((viewport) => [viewport, Object.fromEntries(
          ["get-hit", "fall-motion", "fallen"].flatMap((pose) => [
            [pose, path.join(outDir, `mugen-lite-runtime-${viewport}-${pose}.png`)],
            [`${pose}Canvas`, path.join(outDir, `mugen-lite-runtime-${viewport}-${pose}-canvas.png`)],
          ]),
        )])),
        mugenLiteRecovery: Object.fromEntries(["desktop", "mobile"].map((viewport) => [viewport, Object.fromEntries(
          ["get-hit", "fall-motion", "fallen", "recovery"].flatMap((pose) => [
            [pose, path.join(outDir, `mugen-lite-runtime-${viewport}-recovery-${pose}.png`)],
            [`${pose}Canvas`, path.join(outDir, `mugen-lite-runtime-${viewport}-recovery-${pose}-canvas.png`)],
          ]),
        )])),
        mugenLiteGuard: Object.fromEntries(["desktop", "mobile"].map((viewport) => [viewport, {
          guarded: path.join(outDir, `mugen-lite-runtime-${viewport}-guarded.png`),
          guardedCanvas: path.join(outDir, `mugen-lite-runtime-${viewport}-guarded-canvas.png`),
        }])),
        mugenLiteNoKoSlow: Object.fromEntries(["desktop", "mobile"].map((viewport) => [viewport, {
          finisher: path.join(outDir, `mugen-lite-runtime-${viewport}-nokoslow.png`),
          finisherCanvas: path.join(outDir, `mugen-lite-runtime-${viewport}-nokoslow-canvas.png`),
        }])),
        tagPresentationDesktop: path.join(outDir, "runtime-tag-presentation-desktop.png"),
        tagPresentationDesktopCanvas: path.join(outDir, "runtime-tag-presentation-desktop-canvas.png"),
        tagPresentationMobile: path.join(outDir, "runtime-tag-presentation-mobile.png"),
        tagPresentationMobileCanvas: path.join(outDir, "runtime-tag-presentation-mobile-canvas.png"),
        studioWorkbench: path.join(outDir, "studio-workbench.png"),
        studioProjectAuthoring: path.join(outDir, "studio-project-authoring.png"),
        studioWorkbenchTablet: path.join(outDir, "studio-workbench-tablet.png"),
        commandPalette: path.join(outDir, "studio-command-palette.png"),
        studioBuild: path.join(outDir, "studio-build.png"),
        studioBuildTrustFocus: path.join(outDir, "studio-build-trust-focus.png"),
        studioModules: path.join(outDir, "studio-modules.png"),
        studioModulesContracts: path.join(outDir, "studio-modules-contracts.png"),
        studioSourceRelink: path.join(outDir, "studio-source-relink.png"),
        studioSourceRelinkRejected: path.join(outDir, "studio-source-relink-rejected.png"),
        studioSourceFolderHandle: path.join(outDir, "studio-source-folder-handle.png"),
        ikemenScan: path.join(outDir, "ikemen-scan-evidence.png"),
        studioStage: path.join(outDir, "studio-stage.png"),
        studioBgCtrlStage: path.join(outDir, "studio-stage-bgctrl.png"),
        studioAssets: path.join(outDir, "studio-assets.png"),
        studioReplacement: path.join(outDir, "studio-assets-replacement.png"),
        studioStorageConflict: path.join(outDir, "studio-project-storage-conflict.png"),
        studioEvidence: path.join(outDir, "studio-evidence.png"),
        studioEvidenceWorldDelta: path.join(outDir, "studio-evidence-world-delta.png"),
        studioDebug: path.join(outDir, "studio-debug.png"),
        studioDebugEvidence: path.join(outDir, "studio-debug-evidence.png"),
        studioDebugEvidenceMobile: path.join(outDir, "studio-debug-evidence-mobile.png"),
        studioDebugInspectorJump: path.join(outDir, "studio-debug-inspector-jump.png"),
        studioDebugInspectorJumpMobile: path.join(outDir, "studio-debug-inspector-jump-mobile.png"),
        studioDebugCommandJump: path.join(outDir, "studio-debug-command-jump.png"),
        studioDebugTargets: path.join(outDir, "studio-debug-targets.png"),
        studioDebugEffects: path.join(outDir, "studio-debug-effects.png"),
        studioDebugPause: path.join(outDir, "studio-debug-pause.png"),
        studioDebugAudio: path.join(outDir, "studio-debug-audio.png"),
      },
    };
    fs.writeFileSync(path.join(outDir, "diagnostics.json"), JSON.stringify(diagnostics, null, 2));

    assertSmoke(diagnostics);
    console.log(JSON.stringify(summarizeDiagnostics(diagnostics), null, 2));
  } finally {
    await browser.close();
    await server.stop();
  }
}

async function resolveServer() {
  const externalBaseUrl = process.env.QA_BASE_URL?.replace(/\/$/, "");
  if (externalBaseUrl) {
    return {
      baseUrl: externalBaseUrl,
      mode: "external",
      stop: async () => undefined,
    };
  }

  const port = Number(process.env.QA_PORT ?? (await findFreePort(5300)));
  const { createServer } = await import("vite");
  const vite = await createServer({
    root: process.cwd(),
    logLevel: "warn",
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true,
    },
  });
  await vite.listen();
  const baseUrl = vite.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`;
  return {
    baseUrl,
    mode: "started-vite",
    stop: async () => {
      await vite.close();
    },
  };
}

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(findFreePort(startPort + 1));
        return;
      }
      reject(error);
    });
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(typeof address === "object" && address ? address.port : startPort));
    });
  });
}

async function evaluateWithStableBridge(page, callback, arg) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => undefined);
      await waitForBridge(page);
      return await page.evaluate(callback, arg);
    } catch (error) {
      lastError = error;
      if (!String(error?.message ?? error).includes("Execution context was destroyed")) {
        throw error;
      }
      await page.waitForTimeout(150);
    }
  }
  throw lastError;
}

async function captureRuntime(page, baseUrl, options) {
  await page.setViewportSize(options.viewport);
  await page.goto(`${baseUrl}${runtimeRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await warmRuntimeRenderer(page);
  const drivenHitSparks = await driveRuntimeHitSpark(page);
  await page.waitForTimeout(80);
  await page.screenshot({ path: options.screenshotPath, fullPage: true });
  const canvasPng = await page.locator("canvas").first().screenshot({ path: options.canvasPath });
  const canvasPixels = await getCanvasPixelStats(page, canvasPng);
  const presentationOverlap = await capturePresentationOverlapOracle(page);
  return page.evaluate(
    ({ canvasPixels, drivenHitSparks, label, presentationOverlap }) => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const currentHitSparks = bridge?.renderer?.hitSparks;
      const hitSparks =
        currentHitSparks && currentHitSparks.active > 0
          ? currentHitSparks
          : drivenHitSparks && drivenHitSparks.active > 0
            ? drivenHitSparks
            : (currentHitSparks ?? drivenHitSparks);
      const renderer = bridge?.renderer ? { ...bridge.renderer, hitSparks } : undefined;
      return {
        label,
        title: document.title,
        mode: bridge?.mode,
        bodyHasRuntime: document.body.innerText.includes("Runtime"),
        bodyHasP1: document.body.innerText.includes("Nova Boxer"),
        bodyHasP2: document.body.innerText.includes("Mira Volt"),
        actorCount: bridge?.snapshot?.actors?.length ?? 0,
        tickSchedule: bridge?.snapshot?.tickSchedule,
        actorRegistryCount: bridge?.actorRegistry?.actors?.length ?? 0,
        actorRegistryPlayers: bridge?.actorRegistry?.players?.length ?? 0,
        actorRegistryKinds: bridge?.actorRegistry?.byKind,
        actorRegistryLifecycleLive: bridge?.actorRegistry?.lifecycle?.live?.length ?? 0,
        actorRegistryLifecycleStatuses: bridge?.actorRegistry?.actors?.map((actor) => actor.lifecycle?.status) ?? [],
        actorRegistryLifecycleEvents: bridge?.actorRegistry?.lifecycle?.eventsThisTick?.length ?? 0,
        actorRegistryRecentLifecycleEvents: bridge?.actorRegistry?.lifecycle?.recentEvents?.length ?? 0,
        actorRegistryTargetLinks: bridge?.actorRegistry?.targetLinks?.length ?? 0,
        actorRegistryTargetOwners: bridge?.actorRegistry?.targetLinks?.map((link) => link.ownerId) ?? [],
        actorRegistryEffectStores: bridge?.actorRegistry?.effectStores?.length ?? 0,
        actorRegistryEffectStoreOwners: bridge?.actorRegistry?.effectStores?.map((store) => store.ownerId) ?? [],
        bodyHasActorRegistry: document.body.innerText.includes("Actor Registry"),
        actors: bridge?.snapshot?.actors?.map((actor) => ({
          id: actor.id,
          label: actor.label,
          stateNo: actor.runtime.stateNo,
          animNo: actor.runtime.animNo,
          life: actor.runtime.life,
          hitEffects: actor.hitEffectEvents?.length ?? 0,
        })),
        hudRedLifeBars: [...document.querySelectorAll("[data-hud-redlife-bar]")].map((node) => ({
          actorId: node.getAttribute("data-hud-redlife-bar"),
          visible: node.getAttribute("data-hud-redlife-visible"),
          ariaLabel: node.getAttribute("aria-label"),
          width: node.querySelector("span")?.getAttribute("style") ?? "",
        })),
        renderer,
        characterPresentations: renderer?.characters ?? [],
        stagePresentations: renderer?.stage ?? [],
        activeHitSparks: hitSparks?.active ?? 0,
        hitSparkSources: hitSparks?.sources ?? {},
        hitSparkResolvedSprites: hitSparks?.resolvedSprites ?? 0,
        hitSparkPresentations: hitSparks?.presentations ?? [],
        recentHitEffects:
          bridge?.snapshot?.actors?.flatMap((actor) =>
            (actor.hitEffectEvents ?? []).map((event) => ({
              actorId: actor.id,
              kind: event.kind,
              sparkNo: event.sparkNo,
              runtimeTick: event.runtimeTick,
              age: event.runtimeTick === undefined ? undefined : (bridge.snapshot?.tick ?? 0) - event.runtimeTick,
            })),
          ) ?? [],
        runtimeRosterCount: bridge?.runtimeRoster?.length ?? 0,
        selectedRosterAtlasStatuses:
          bridge?.runtimeRoster
            ?.filter((entry) => entry.selected)
            .map((entry) => ({ id: entry.id, atlasStatus: entry.atlasStatus })) ?? [],
        atlasMotionQaCount: Object.keys(bridge?.atlasMotionQa ?? {}).length,
        canvasPixels,
        presentationOverlap,
      };
    },
    { canvasPixels, drivenHitSparks, label: options.label, presentationOverlap },
  );
}

async function captureMugenLiteVisual(page, baseUrl, outDir) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`${baseUrl}${runtimeRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  const fixtureBytes = await page.evaluate(async () => {
    const fixture = await import("/src/mugen/runtime/MugenLiteJourneyFixture.ts");
    return Array.from(new Uint8Array(await fixture.createMugenLiteJourneyZipBytes()));
  });
  const fixtureBuffer = Buffer.from(fixtureBytes);
  fs.writeFileSync(path.join(outDir, "mugen-lite-journey.zip"), fixtureBuffer);
  const desktop = await captureMugenLiteVisualViewport(page, baseUrl, fixtureBuffer, {
    viewport: { width: 1440, height: 960 },
    screenshotPath: path.join(outDir, "mugen-lite-runtime-desktop.png"),
    canvasPath: path.join(outDir, "mugen-lite-runtime-desktop-canvas.png"),
    attackScreenshotPath: path.join(outDir, "mugen-lite-runtime-desktop-attack.png"),
    attackCanvasPath: path.join(outDir, "mugen-lite-runtime-desktop-attack-canvas.png"),
    paletteScreenshotPath: path.join(outDir, "mugen-lite-runtime-desktop-palette.png"),
    paletteCanvasPath: path.join(outDir, "mugen-lite-runtime-desktop-palette-canvas.png"),
  });
  const mobile = await captureMugenLiteVisualViewport(page, baseUrl, fixtureBuffer, {
    viewport: { width: 390, height: 844 },
    screenshotPath: path.join(outDir, "mugen-lite-runtime-mobile.png"),
    canvasPath: path.join(outDir, "mugen-lite-runtime-mobile-canvas.png"),
    attackScreenshotPath: path.join(outDir, "mugen-lite-runtime-mobile-attack.png"),
    attackCanvasPath: path.join(outDir, "mugen-lite-runtime-mobile-attack-canvas.png"),
    paletteScreenshotPath: path.join(outDir, "mugen-lite-runtime-mobile-palette.png"),
    paletteCanvasPath: path.join(outDir, "mugen-lite-runtime-mobile-palette-canvas.png"),
  });
  return { fixtureBytes: fixtureBuffer.length, desktop, mobile };
}

async function captureCodeFuManVisual(page, baseUrl, outDir, fixturePath) {
  if (!fixturePath) {
    return { skipped: true, reason: "Optional Code Fu Man fixture is not present" };
  }

  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`${baseUrl}${runtimeRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.locator("#zip-input").setInputFiles(fixturePath);
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return bridge?.character === "Code Fu Man" && bridge.compatibility?.loaded === true;
  });
  await page.locator('[data-mode="match"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return bridge?.mode === "match" && actor?.source === "imported" && actor.runtime?.stateNo === 0 && actor.frame?.spriteGroup === 0;
  });
  await waitForRuntimeTicks(page, 8);
  await page.waitForTimeout(250);
  const initial = await captureMugenLiteVisualState(
    page,
    path.join(outDir, "codefuman-runtime-desktop.png"),
    path.join(outDir, "codefuman-runtime-desktop-canvas.png"),
    "p1",
    [],
  );

  const pauseOnAttack = page.evaluate(() => new Promise((resolve, reject) => {
    let lastSnapshot = {};
    const timeout = window.setTimeout(() => reject(new Error(`Code Fu Man x attack frame was not observed: ${JSON.stringify(lastSnapshot)}`)), 5000);
    const check = () => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
      lastSnapshot = actor ? {
        stateNo: actor.runtime?.stateNo,
        moveType: actor.runtime?.moveType,
        ctrl: actor.runtime?.ctrl,
        frame: actor.frame,
        activeCommands: actor.runtime?.activeCommands,
        playing: bridge?.snapshot?.playing,
      } : {};
      if (actor?.runtime?.stateNo === 200) {
        window.clearTimeout(timeout);
        document.querySelector('[data-action="play-pause"]')?.click();
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }));
  await page.keyboard.down("a");
  await page.waitForTimeout(80);
  await page.keyboard.up("a");
  await pauseOnAttack;
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const attack = await captureMugenLiteVisualState(
    page,
    path.join(outDir, "codefuman-runtime-desktop-attack.png"),
    path.join(outDir, "codefuman-runtime-desktop-attack-canvas.png"),
    "p1",
    [],
  );
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  await page.waitForTimeout(80);
  await resetCodeFuManRound(page);

  const waitForQcf = () => page.evaluate(() => new Promise((resolve, reject) => {
    let lastSnapshot = {};
    const timeout = window.setTimeout(() => reject(new Error(`Code Fu Man QCF_x special frame was not observed: ${JSON.stringify(lastSnapshot)}`)), 3000);
    const check = () => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
      lastSnapshot = actor ? {
        stateNo: actor.runtime?.stateNo,
        moveType: actor.runtime?.moveType,
        ctrl: actor.runtime?.ctrl,
        frame: actor.frame,
        activeCommands: actor.runtime?.activeCommands,
        playing: bridge?.snapshot?.playing,
      } : {};
      if (actor?.runtime?.stateNo === 1000) {
        window.clearTimeout(timeout);
        document.querySelector('[data-action="play-pause"]')?.click();
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }));
  let qcfObserved = false;
  for (let attempt = 0; attempt < 3 && !qcfObserved; attempt += 1) {
    const pauseOnQcf = waitForQcf();
    await pressCodeFuManQcfX(page);
    try {
      await pauseOnQcf;
      qcfObserved = true;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
      await resetCodeFuManRound(page);
    }
  }
  await page.evaluate(() => {
    if (window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing) {
      document.querySelector('[data-action="play-pause"]')?.click();
    }
  });
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const special = await captureMugenLiteVisualState(
    page,
    path.join(outDir, "codefuman-runtime-desktop-qcf.png"),
    path.join(outDir, "codefuman-runtime-desktop-qcf-canvas.png"),
    "p1",
    [],
  );
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  await page.waitForTimeout(80);
  await resetCodeFuManRound(page);

  let upperObserved = false;
  for (let attempt = 0; attempt < 2 && !upperObserved; attempt += 1) {
    const pauseOnUpper = page.evaluate(() => new Promise((resolve, reject) => {
      let lastSnapshot = {};
      const timeout = window.setTimeout(() => reject(new Error(`Code Fu Man upper_x frame was not observed: ${JSON.stringify(lastSnapshot)}`)), 5000);
      const check = () => {
        const bridge = window.__MUGEN_WEB_SANDBOX__;
        const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
        lastSnapshot = actor ? {
          stateNo: actor.runtime?.stateNo,
          moveType: actor.runtime?.moveType,
          ctrl: actor.runtime?.ctrl,
          frame: actor.frame,
          activeCommands: actor.runtime?.activeCommands,
          playing: bridge?.snapshot?.playing,
        } : {};
        if (actor?.runtime?.stateNo === 1100) {
          window.clearTimeout(timeout);
          document.querySelector('[data-action="play-pause"]')?.click();
          resolve(undefined);
          return;
        }
        window.setTimeout(check, 4);
      };
      check();
    }));
    await pressCodeFuManUpperX(page);
    try {
      await pauseOnUpper;
      upperObserved = true;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
      await resetCodeFuManRound(page);
    }
  }
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const upper = await captureMugenLiteVisualState(
    page,
    path.join(outDir, "codefuman-runtime-desktop-upper.png"),
    path.join(outDir, "codefuman-runtime-desktop-upper-canvas.png"),
    "p1",
    [],
  );
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  return { skipped: false, fixturePath, initial, attack, special, upper, returnedToIdle: true, specialReturnedToIdle: true, upperReturnedToIdle: true };
}

async function resetCodeFuManRound(page) {
  await page.locator('[data-action="reset-round"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    const p2 = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p2");
    return bridge?.snapshot?.playing === true &&
      p1?.runtime?.stateNo === 0 && p1.runtime.ctrl === true && p1.frame?.spriteGroup === 0 &&
      p2?.runtime?.stateNo === 0;
  });
  await page.waitForTimeout(120);
}

async function pressCodeFuManQcfX(page) {
  const hold = async (keys, minTicks = 3) => {
    const startTick = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick ?? 0);
    for (const key of keys) await page.keyboard.down(key);
    try {
      await page.waitForFunction(
        (minimumTick) => (window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick ?? 0) >= minimumTick,
        startTick + minTicks,
        { timeout: 1500 },
      );
    } finally {
      for (const key of [...keys].reverse()) await page.keyboard.up(key);
    }
    const releasedAtTick = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick ?? 0);
    await waitForRuntimeTicks(page, releasedAtTick + 1);
  };
  await hold(["ArrowDown"]);
  await hold(["ArrowDown", "ArrowRight"]);
  await hold(["ArrowRight"]);
  await holdCodeFuManAttackUntilState(page, 1000);
}

async function pressCodeFuManUpperX(page) {
  const hold = async (keys, minTicks = 3) => {
    const startTick = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick ?? 0);
    for (const key of keys) await page.keyboard.down(key);
    try {
      await page.waitForFunction(
        (minimumTick) => (window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick ?? 0) >= minimumTick,
        startTick + minTicks,
        { timeout: 1500 },
      );
    } finally {
      for (const key of [...keys].reverse()) await page.keyboard.up(key);
    }
    const releasedAtTick = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick ?? 0);
    await waitForRuntimeTicks(page, releasedAtTick + 1);
  };
  await hold(["ArrowRight"]);
  await hold(["ArrowDown"]);
  await hold(["ArrowDown", "ArrowRight"]);
  await holdCodeFuManAttackUntilState(page, 1100);
}

async function holdCodeFuManAttackUntilState(page, stateNo) {
  await page.keyboard.down("a");
  try {
    await page
      .waitForFunction((expectedStateNo) => window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((actor) => actor.id === "p1")?.runtime?.stateNo === expectedStateNo, stateNo, {
        timeout: 3000,
      })
      .catch(() => undefined);
  } finally {
    await page.keyboard.up("a");
  }
}

async function captureMugenLiteVisualViewport(page, baseUrl, fixtureBuffer, options) {
  await page.setViewportSize(options.viewport);
  await page.goto(`${baseUrl}${runtimeRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.locator("#zip-input").setInputFiles({
    name: "mugen-lite-journey.zip",
    mimeType: "application/zip",
    buffer: fixtureBuffer,
  });
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.character === "MUGEN Lite Journey");
  await page.locator('[data-mode="match"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.renderer?.characters?.find((actor) => actor.actorId === "p1");
    const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return bridge?.mode === "match" && actor?.frame?.spriteGroup === 0 && actor.frame.spriteIndex === 0 &&
      p1?.sprite?.width === 32 && p1.sprite.height === 64 && p1.sprite.axisX === 16 && p1.sprite.axisY === 62;
  });
  await page.waitForTimeout(250);
  const probe = await captureMugenLiteVisualState(page, options.screenshotPath, options.canvasPath);
  await page.locator('[data-action="reset-round"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor.runtime.ctrl === true;
  });
  const pauseOnAttack = page.evaluate(() => new Promise((resolve, reject) => {
    let lastSnapshot = {};
    const timeout = window.setTimeout(() => reject(new Error(`MUGEN-lite attack frame was not observed: ${JSON.stringify(lastSnapshot)}`)), 5000);
    const check = () => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
      lastSnapshot = actor ? {
        stateNo: actor.runtime?.stateNo,
        ctrl: actor.runtime?.ctrl,
        frame: actor.frame,
        activeCommands: actor.runtime?.activeCommands,
        playing: bridge?.snapshot?.playing,
      } : {};
      if (actor?.runtime?.stateNo === 200 && actor?.frame?.spriteGroup === 200 && actor.frame.spriteIndex === 0) {
        window.clearTimeout(timeout);
        document.querySelector('[data-action="play-pause"]')?.click();
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }));
  await page.keyboard.down("a");
  try {
    await pauseOnAttack;
  } finally {
    await page.keyboard.up("a");
  }
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const attack = await captureMugenLiteVisualState(page, options.attackScreenshotPath, options.attackCanvasPath);
  const followThroughStep = page.locator('[data-action="step"]').first();
  let followThroughObserved = false;
  for (let count = 0; count < 12; count += 1) {
    await followThroughStep.evaluate((button) => button.click());
    followThroughObserved = await page.evaluate(() => {
      const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
      return actor?.runtime?.stateNo === 200 && actor.frame?.spriteGroup === 200 && actor.frame.spriteIndex === 1;
    });
    if (followThroughObserved) {
      break;
    }
  }
  if (!followThroughObserved) {
    throw new Error("MUGEN-lite attack-follow-through frame was not observed after 12 forced steps");
  }
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const viewportLabel = options.viewport.width < 600 ? "mobile" : "desktop";
  const attackFollowThrough = await captureMugenLiteVisualState(
    page,
    path.join(path.dirname(options.screenshotPath), `mugen-lite-runtime-${viewportLabel}-attack-follow-through.png`),
    path.join(path.dirname(options.canvasPath), `mugen-lite-runtime-${viewportLabel}-attack-follow-through-canvas.png`),
  );
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  const movement = {};
  for (const transition of [
    { id: "walk", key: "ArrowRight", stateNo: 20, action: 20 },
    { id: "crouch", key: "ArrowDown", stateNo: 10, action: 10 },
    { id: "jump", key: "ArrowUp", stateNo: 40, action: 40 },
  ]) {
    movement[transition.id] = await captureMugenLiteDrivenState(page, transition, {
      screenshotPath: path.join(path.dirname(options.screenshotPath), `mugen-lite-runtime-${viewportLabel}-${transition.id}.png`),
      canvasPath: path.join(path.dirname(options.canvasPath), `mugen-lite-runtime-${viewportLabel}-${transition.id}-canvas.png`),
    });
  }
  const combat = await captureMugenLiteCombatJourney(page, options);
  const recovery = await captureMugenLiteRecoveryJourney(page, options, combat.importedId);
  const guard = await captureMugenLiteGuardJourney(page, options, combat.importedId);
  const noKoSlow = await captureMugenLiteNoKoSlowJourney(page, options, combat.importedId);
  const palette = await captureMugenLitePaletteJourney(page, options);
  return { ...probe, attack, attackFollowThrough, movement, combat, recovery, guard, noKoSlow, palette, returnedToIdle: true };
}

async function captureMugenLitePaletteJourney(page, options) {
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return bridge?.snapshot?.round?.state === "fight" && actor?.source === "imported" && actor.runtime?.stateNo === 0 && actor.runtime?.ctrl;
  }, null, { timeout: 5000 });
  const pauseOnPalette = page.evaluate(() => new Promise((resolve, reject) => {
    let lastSnapshot = {};
    const timeout = window.setTimeout(() => reject(new Error(`MUGEN-lite RemapPal frame was not observed: ${JSON.stringify(lastSnapshot)}`)), 5000);
    const check = () => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
      lastSnapshot = actor ? {
        stateNo: actor.runtime?.stateNo,
        spriteGroup: actor.frame?.spriteGroup,
        spriteIndex: actor.frame?.spriteIndex,
        paletteRemap: actor.runtime?.paletteRemap,
      } : {};
      if (
        actor?.runtime?.stateNo === 220 &&
        actor?.frame?.spriteGroup === 200 &&
        actor?.frame?.spriteIndex === 0 &&
        actor.runtime?.paletteRemap?.source?.join(",") === "1,1" &&
        actor.runtime?.paletteRemap?.dest?.join(",") === "1,2"
      ) {
        window.clearTimeout(timeout);
        if (bridge?.snapshot?.playing) document.querySelector('[data-action="play-pause"]')?.click();
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }));
  await page.keyboard.down("s");
  try {
    await pauseOnPalette;
  } finally {
    await page.keyboard.up("s");
  }
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const palette = await captureMugenLiteVisualState(
    page,
    options.paletteScreenshotPath,
    options.paletteCanvasPath,
    "p1",
    MUGEN_LITE_JOURNEY_PALETTE_COLORS,
  );
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  return { palette, returnedToIdle: true };
}

async function captureMugenLiteGuardJourney(page, options, importedId) {
  const resetSnapshot = await page.locator('[data-action="reset-round"]').first().evaluate((button) => {
    button.click();
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const actors = bridge?.snapshot?.actors ?? [];
    const p1 = actors.find((actor) => actor.id === "p1");
    const p2 = actors.find((actor) => actor.id === "p2");
    return {
      playing: bridge?.snapshot?.playing,
      tick: bridge?.snapshot?.tick,
      p1: p1 ? { life: p1.runtime?.life, stateNo: p1.runtime?.stateNo } : undefined,
      p2: p2 ? { life: p2.runtime?.life, stateNo: p2.runtime?.stateNo } : undefined,
    };
  });
  if (
    resetSnapshot.playing !== true ||
    resetSnapshot.tick !== 0 ||
    resetSnapshot.p1?.life !== 1000 ||
    resetSnapshot.p2?.life !== 1000 ||
    resetSnapshot.p1?.stateNo !== 0 ||
    resetSnapshot.p2?.stateNo !== 0
  ) {
    throw new Error(`MUGEN-lite guard reset did not produce a fresh round: ${JSON.stringify(resetSnapshot)}`);
  }
  await changeHiddenSelect(page, '[data-fighter-select="p1"]', importedId);
  await changeHiddenSelect(page, '[data-fighter-select="p2"]', "nova-boxer");
  await page.waitForFunction((importedId) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
    const p2 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p2");
    return bridge?.project?.entry?.p1 === importedId && bridge.project.entry.p2 === "nova-boxer" &&
      p1?.source === "imported" && p1.label === "MUGEN Lite Journey" && p2?.source === "demo" && p2.label === "Nova Boxer";
  }, importedId);
  const roster = await page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      p1: bridge?.project?.entry?.p1,
      p2: bridge?.project?.entry?.p2,
      actors: bridge?.snapshot?.actors?.map((actor) => ({ id: actor.id, label: actor.label, source: actor.source, life: actor.runtime.life })) ?? [],
    };
  });
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const actors = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors ?? [];
    const p1 = actors.find((actor) => actor.id === "p1");
    const p2 = actors.find((actor) => actor.id === "p2");
    return p1 && p2 && Math.abs(p2.runtime.pos.x - p1.runtime.pos.x) <= 100;
  }, null, { timeout: 5000 });
  await page.keyboard.up("ArrowRight");

  await page.waitForFunction(() => {
    const p2 = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((actor) => actor.id === "p2");
    return p2?.runtime?.stateNo === 200;
  }, null, { timeout: 5000 });
  const pauseOnGuard = page.evaluate(() => new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("MUGEN-lite guarded contact was not observed")), 5000);
    const check = () => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
      if (p1?.runtime?.stateNo === 150 && p1?.frame?.spriteGroup === 150 && p1.runtime.guarding) {
        window.clearTimeout(timeout);
        if (bridge?.snapshot?.playing) document.querySelector('[data-action="play-pause"]')?.click();
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }));
  await page.keyboard.down("ArrowLeft");
  await pauseOnGuard;
  await page.keyboard.up("ArrowLeft");
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const viewportLabel = options.viewport.width < 600 ? "mobile" : "desktop";
  const guarded = await captureMugenLiteVisualState(
    page,
    path.join(path.dirname(options.screenshotPath), `mugen-lite-runtime-${viewportLabel}-guarded.png`),
    path.join(path.dirname(options.canvasPath), `mugen-lite-runtime-${viewportLabel}-guarded-canvas.png`),
    "p1",
  );
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  return { roster, guarded, returnedToIdle: true };
}

async function captureMugenLiteNoKoSlowJourney(page, options, importedId) {
  await changeHiddenSelect(page, '[data-fighter-select="p1"]', importedId);
  await changeHiddenSelect(page, '[data-fighter-select="p2"]', "nova-boxer");
  await page.waitForFunction((importedId) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
    const p2 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p2");
    return bridge?.project?.entry?.p1 === importedId && bridge.project.entry.p2 === "nova-boxer" &&
      p1?.source === "imported" && p1.label === "MUGEN Lite Journey" && p2?.source === "demo" && p2.label === "Nova Boxer";
  }, importedId);
  const roster = await page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      p1: bridge?.project?.entry?.p1,
      p2: bridge?.project?.entry?.p2,
      actors: bridge?.snapshot?.actors?.map((actor) => ({ id: actor.id, label: actor.label, source: actor.source, life: actor.runtime.life })) ?? [],
    };
  });
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const actors = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors ?? [];
    const p1 = actors.find((actor) => actor.id === "p1");
    const p2 = actors.find((actor) => actor.id === "p2");
    return p1 && p2 && Math.abs(p2.runtime.pos.x - p1.runtime.pos.x) <= 140;
  }, null, { timeout: 5000 });
  await page.keyboard.up("ArrowRight");
  await page.waitForFunction(() => {
    const p1 = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((actor) => actor.id === "p1");
    return p1?.runtime?.stateNo === 0 && p1.runtime.ctrl && p1.runtime.life === 1000;
  }, null, { timeout: 1000 });

  const pauseOnNoKoSlow = page.evaluate(() => new Promise((resolve, reject) => {
    let lastSnapshot = {};
    const timeout = window.setTimeout(() => reject(new Error(`MUGEN-lite NoKOSlow KO was not observed: ${JSON.stringify(lastSnapshot)}`)), 5000);
    const check = () => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
      const p2 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p2");
      const postRound = bridge?.snapshot?.round?.postRound;
      lastSnapshot = {
        p1: p1 ? { stateNo: p1.runtime?.stateNo, action: p1.frame?.spriteGroup, life: p1.runtime?.life, guarding: p1.runtime?.guarding } : undefined,
        p2: p2 ? { stateNo: p2.runtime?.stateNo, action: p2.frame?.spriteGroup, life: p2.runtime?.life, guarding: p2.runtime?.guarding } : undefined,
        round: bridge?.snapshot?.round,
      };
      if (
        p1?.runtime?.stateNo === 210 &&
        p1?.frame?.spriteGroup === 210 &&
        p2?.runtime?.life === 0 &&
        bridge?.snapshot?.round?.state === "ko" &&
        postRound?.noKoSlow === true &&
        postRound.frame >= 4 &&
        postRound.playbackRate === 1
      ) {
        window.clearTimeout(timeout);
        if (bridge?.snapshot?.playing) document.querySelector('[data-action="play-pause"]')?.click();
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }));
  await page.keyboard.down("d");
  try {
    await pauseOnNoKoSlow;
  } finally {
    await page.keyboard.up("d");
  }
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const viewportLabel = options.viewport.width < 600 ? "mobile" : "desktop";
  const finisher = await captureMugenLiteVisualState(
    page,
    path.join(path.dirname(options.screenshotPath), `mugen-lite-runtime-${viewportLabel}-nokoslow.png`),
    path.join(path.dirname(options.canvasPath), `mugen-lite-runtime-${viewportLabel}-nokoslow-canvas.png`),
    "p1",
  );
  await page.locator('[data-action="reset-round"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
    const p2 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p2");
    return bridge?.snapshot?.round?.state === "fight" && p1?.runtime?.life === 1000 && p2?.runtime?.life === 1000 &&
      p1.runtime.stateNo === 0;
  }, null, { timeout: 5000 });
  return { roster, finisher, reset: true };
}

async function captureMugenLiteRecoveryJourney(page, options, importedId) {
  await page.locator('[data-action="reset-round"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
    const p2 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p2");
    return bridge?.snapshot?.round?.state === "fight" && p1?.runtime?.life === 1000 && p2?.runtime?.life === 1000 &&
      p1.runtime.stateNo === 0 && p2.runtime.stateNo === 0;
  }, null, { timeout: 5000 });
  await changeHiddenSelect(page, '[data-fighter-select="p1"]', importedId);
  await changeHiddenSelect(page, '[data-fighter-select="p2"]', "nova-boxer");
  await page.waitForFunction((importedId) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
    const p2 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p2");
    return bridge?.project?.entry?.p1 === importedId && bridge.project.entry.p2 === "nova-boxer" &&
      p1?.source === "imported" && p1.label === "MUGEN Lite Journey" && p2?.source === "demo" && p2.label === "Nova Boxer";
  }, importedId);
  const roster = await page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      p1: bridge?.project?.entry?.p1,
      p2: bridge?.project?.entry?.p2,
      actors: bridge?.snapshot?.actors?.map((actor) => ({ id: actor.id, label: actor.label, source: actor.source, life: actor.runtime.life })) ?? [],
    };
  });
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const actors = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors ?? [];
    const p1 = actors.find((actor) => actor.id === "p1");
    const p2 = actors.find((actor) => actor.id === "p2");
    return p1 && p2 && Math.abs(p2.runtime.pos.x - p1.runtime.pos.x) <= 100;
  }, null, { timeout: 5000 });
  await page.keyboard.up("ArrowRight");

  const getHitPause = pauseWhenMugenLiteActorStateAppears(page, "p1", 5000, 5000, "recovery-get-hit");
  await getHitPause;
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const viewportLabel = options.viewport.width < 600 ? "mobile" : "desktop";
  const capture = (id) => captureMugenLiteVisualState(
    page,
    path.join(path.dirname(options.screenshotPath), `mugen-lite-runtime-${viewportLabel}-recovery-${id}.png`),
    path.join(path.dirname(options.canvasPath), `mugen-lite-runtime-${viewportLabel}-recovery-${id}-canvas.png`),
    "p1",
  );
  const getHit = await capture("get-hit");
  const fallMotion = await stepAndCaptureMugenLiteActorState(page, "p1", 5050, 5050, "recovery-fall-motion", capture);
  const fallen = await stepAndCaptureMugenLiteActorState(page, "p1", 5100, 5100, "recovery-fallen", capture);

  const recoveryPause = pauseWhenMugenLiteActorStateAppears(page, "p1", 5200, 5200, "recovery", { pause: false });
  const step = page.locator('[data-action="step"]').first();
  await step.evaluate((button) => button.click());
  await step.evaluate((button) => button.click());
  await page.keyboard.down("a");
  await page.keyboard.down("s");
  await step.evaluate((button) => button.click());
  await page.keyboard.up("s");
  await page.keyboard.up("a");
  await recoveryPause;
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const recovery = await capture("recovery");
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  return { roster, getHit, fallMotion, fallen, recovery, returnedToIdle: true };
}

async function captureMugenLiteCombatJourney(page, options) {
  const importedId = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.runtimeRoster?.find((entry) => entry.id.startsWith("imported-"))?.id);
  if (!importedId) throw new Error("MUGEN-lite imported roster id was unavailable");
  await changeHiddenSelect(page, '[data-fighter-select="p1"]', "nova-boxer");
  await changeHiddenSelect(page, '[data-fighter-select="p2"]', importedId);
  await page.waitForFunction((importedId) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const p1 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p1");
    const p2 = bridge?.snapshot?.actors?.find((actor) => actor.id === "p2");
    return bridge?.project?.entry?.p1 === "nova-boxer" && bridge.project.entry.p2 === importedId &&
      p1?.source === "demo" && p1.label === "Nova Boxer" && p2?.source === "imported" && p2.label === "MUGEN Lite Journey";
  }, importedId);
  const roster = await page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      p1: bridge?.project?.entry?.p1,
      p2: bridge?.project?.entry?.p2,
      actors: bridge?.snapshot?.actors?.map((actor) => ({ id: actor.id, label: actor.label, source: actor.source, life: actor.runtime.life })) ?? [],
    };
  });

  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const actors = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors ?? [];
    const p1 = actors.find((actor) => actor.id === "p1");
    const p2 = actors.find((actor) => actor.id === "p2");
    return p1 && p2 && Math.abs(p2.runtime.pos.x - p1.runtime.pos.x) <= 100;
  }, null, { timeout: 5000 });
  await page.keyboard.up("ArrowRight");

  const getHitPause = pauseWhenMugenLiteActorStateAppears(page, "p2", 5000, 5000, "get-hit");
  await page.keyboard.down("a");
  try {
    await getHitPause;
  } finally {
    await page.keyboard.up("a");
  }
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const viewportLabel = options.viewport.width < 600 ? "mobile" : "desktop";
  const capture = (id) => captureMugenLiteVisualState(
    page,
    path.join(path.dirname(options.screenshotPath), `mugen-lite-runtime-${viewportLabel}-${id}.png`),
    path.join(path.dirname(options.canvasPath), `mugen-lite-runtime-${viewportLabel}-${id}-canvas.png`),
    "p2",
  );
  const getHit = await capture("get-hit");
  const fallMotion = await stepAndCaptureMugenLiteActorState(page, "p2", 5050, 5050, "fall-motion", capture);
  const fallen = await stepAndCaptureMugenLiteActorState(page, "p2", 5100, 5100, "fallen", capture);
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p2");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  return { importedId, roster, getHit, fallMotion, fallen, returnedToIdle: true };
}

async function stepAndCaptureMugenLiteActorState(page, actorId, stateNo, action, label, capture, maxSteps = 24) {
  const step = page.locator('[data-action="step"]').first();
  for (let count = 0; count < maxSteps; count += 1) {
    await step.evaluate((button) => button.click());
    const matched = await page.evaluate(({ actorId, stateNo, action }) => {
      const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === actorId);
      return actor?.runtime?.stateNo === stateNo && actor?.frame?.spriteGroup === action;
    }, { actorId, stateNo, action });
    if (matched) {
      return capture(label);
    }
  }
  throw new Error(`MUGEN-lite ${label} frame was not observed for ${actorId} within ${maxSteps} visible steps`);
}

function pauseWhenMugenLiteActorStateAppears(page, actorId, stateNo, action, label, options = {}) {
  return page.evaluate(({ actorId, stateNo, action, label, pause }) => new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(`MUGEN-lite ${label} frame was not observed for ${actorId}`)), 5000);
    const check = () => {
      const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === actorId);
      if (actor?.runtime?.stateNo === stateNo && actor?.frame?.spriteGroup === action) {
        window.clearTimeout(timeout);
        if (pause && window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing) {
          document.querySelector('[data-action="play-pause"]')?.click();
        }
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }), { actorId, stateNo, action, label, pause: options.pause !== false });
}

async function captureMugenLiteDrivenState(page, transition, paths) {
  const pauseOnState = pauseWhenMugenLiteStateAppears(page, transition.stateNo, transition.action, transition.id);
  await page.keyboard.down(transition.key);
  await pauseOnState;
  await page.keyboard.up(transition.key);
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false);
  const probe = await captureMugenLiteVisualState(page, paths.screenshotPath, paths.canvasPath);
  await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
  await page.waitForFunction(() => {
    const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
    return actor?.runtime?.stateNo === 0 && actor?.frame?.spriteGroup === 0;
  });
  return { ...probe, returnedToIdle: true };
}

function pauseWhenMugenLiteStateAppears(page, stateNo, action, label) {
  return page.evaluate(({ stateNo, action, label }) => new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(`MUGEN-lite ${label} frame was not observed`)), 5000);
    const check = () => {
      const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
      if (actor?.runtime?.stateNo === stateNo && actor?.frame?.spriteGroup === action) {
        window.clearTimeout(timeout);
        document.querySelector('[data-action="play-pause"]')?.click();
        resolve(undefined);
        return;
      }
      window.setTimeout(check, 4);
    };
    check();
  }), { stateNo, action, label });
}

async function captureMugenLiteVisualState(page, screenshotPath, canvasPath, actorId = "p1", expectedColors) {
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const canvasPng = await page.locator("canvas").first().screenshot({ path: canvasPath });
  const canvasPixels = await getCanvasPixelStats(page, canvasPng);
  const presentation = await page.evaluate((actorId) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const renderedActor = bridge?.renderer?.characters?.find((actor) => actor.actorId === actorId);
    const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === actorId);
    return {
      renderedActor,
      rendererSize: bridge?.renderer?.size,
      camera: bridge?.renderer?.camera,
      spriteGroup: actor?.frame?.spriteGroup,
      spriteIndex: actor?.frame?.spriteIndex,
    };
  }, actorId);
  const spritePixels = await getProjectedSpritePixelStats(
    page,
    canvasPng,
    presentation.renderedActor,
    presentation.rendererSize,
    presentation.camera,
    expectedColors ?? fixturePaletteForSprite(presentation.spriteGroup, presentation.spriteIndex),
  );
  return page.evaluate(({ canvasPixels, spritePixels, actorId }) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const renderedActor = bridge?.renderer?.characters?.find((candidate) => candidate.actorId === actorId);
    const actor = bridge?.snapshot?.actors?.find((candidate) => candidate.id === actorId);
    return {
      mode: bridge?.mode,
      character: bridge?.character,
      compatibilityLoaded: bridge?.compatibility?.loaded,
      actorSource: actor?.source,
      actorState: actor?.runtime?.stateNo,
      actorLife: actor?.runtime?.life,
      actorGuarding: actor?.runtime?.guarding ?? false,
      actorAssertSpecial: actor?.runtime?.assertSpecial,
      actorPaletteRemap: actor?.runtime?.paletteRemap,
      actorFrame: actor?.frame ? { group: actor.frame.spriteGroup, index: actor.frame.spriteIndex } : null,
      opponent: bridge?.snapshot?.actors
        ?.filter((candidate) => candidate.id !== actorId)
        .map((candidate) => ({ id: candidate.id, source: candidate.source, label: candidate.label, life: candidate.runtime.life })) ?? [],
      round: bridge?.snapshot?.round,
      sprite: renderedActor?.sprite,
      renderCalls: bridge?.renderer?.render?.calls ?? 0,
      canvasPixels,
      spritePixels,
    };
  }, { canvasPixels, spritePixels, actorId });
}

async function captureTagPresentation(page, baseUrl, outDir) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`${baseUrl}${tagPresentationRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await warmRuntimeRenderer(page);
  await waitForTagPresentationState(page, ["p1", "p2"]);
  const baseline = await readTagPresentationState(page);

  await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.qa?.tagPresentationHandoff());
  await waitForTagPresentationState(page, ["p3", "p2"]);
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outDir, "runtime-tag-presentation-desktop.png"), fullPage: true });
  const desktopCanvasPng = await page.locator("canvas").first().screenshot({
    path: path.join(outDir, "runtime-tag-presentation-desktop-canvas.png"),
  });
  const desktop = await readTagPresentationState(page, await getCanvasPixelStats(page, desktopCanvasPng));

  await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.qa?.resetTagPresentation());
  await waitForTagPresentationState(page, ["p1", "p2"]);
  const reset = await readTagPresentationState(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}${tagPresentationRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await warmRuntimeRenderer(page);
  await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.qa?.tagPresentationHandoff());
  await waitForTagPresentationState(page, ["p3", "p2"]);
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outDir, "runtime-tag-presentation-mobile.png"), fullPage: true });
  const mobileCanvasPng = await page.locator("canvas").first().screenshot({
    path: path.join(outDir, "runtime-tag-presentation-mobile-canvas.png"),
  });
  const mobile = await readTagPresentationState(page, await getCanvasPixelStats(page, mobileCanvasPng));

  return { baseline, desktop, reset, mobile };
}

async function waitForTagPresentationState(page, drawRootIds) {
  await page.waitForFunction((expectedIds) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const presentation = bridge?.snapshot?.rootPresentation;
    const rendered = bridge?.renderer?.characters?.map((actor) => actor.actorId) ?? [];
    const collisionActors = bridge?.renderer?.collision?.actorIds ?? [];
    return bridge?.qa?.scenario === "ikemen-tag-presentation"
      && presentation?.drawRootIds?.join(",") === expectedIds.join(",")
      && presentation?.cameraRootIds?.join(",") === expectedIds.join(",")
      && presentation?.collisionRootIds?.join(",") === expectedIds.join(",")
      && rendered.length === expectedIds.length
      && expectedIds.every((id) => rendered.includes(id) && collisionActors.includes(id));
  }, drawRootIds, { timeout: 5000 });
}

async function readTagPresentationState(page, canvasPixels) {
  return page.evaluate((pixels) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      scenario: bridge?.qa?.scenario,
      actorIds: bridge?.snapshot?.actors?.map((actor) => actor.id) ?? [],
      reserveActorIds: bridge?.snapshot?.reserveActors?.map((actor) => actor.id) ?? [],
      drawRootIds: bridge?.snapshot?.rootPresentation?.drawRootIds ?? [],
      cameraRootIds: bridge?.snapshot?.rootPresentation?.cameraRootIds ?? [],
      collisionRootIds: bridge?.snapshot?.rootPresentation?.collisionRootIds ?? [],
      rendererActorIds: bridge?.renderer?.characters?.map((actor) => actor.actorId) ?? [],
      collisionActorIds: bridge?.renderer?.collision?.actorIds ?? [],
      collisionBoxCount: (bridge?.renderer?.collision?.hitBoxCount ?? 0) + (bridge?.renderer?.collision?.hurtBoxCount ?? 0),
      hudNames: [...document.querySelectorAll(".hud-fighter-name")].map((node) => node.textContent?.trim() ?? ""),
      teamLifebar: {
        mode: bridge?.snapshot?.teamRoundLifebar?.mode,
        visible: bridge?.snapshot?.teamRoundLifebar?.visible,
        slotIds: [...document.querySelectorAll("[data-hud-team-slot]")].map((node) => node.getAttribute("data-hud-team-slot") ?? ""),
        redLifeBarIds: [...document.querySelectorAll("[data-hud-redlife-bar]")].map((node) => node.getAttribute("data-hud-redlife-bar") ?? ""),
        slotStatuses: Object.fromEntries(
          [...document.querySelectorAll("[data-hud-team-slot]")].map((node) => [
            node.getAttribute("data-hud-team-slot") ?? "",
            node.getAttribute("data-hud-team-status") ?? "",
          ]),
        ),
        activeBySide: [...document.querySelectorAll("[data-hud-team-side]")].map((node) => node.getAttribute("data-hud-team-active") ?? ""),
      },
      presentedRoots:
        bridge?.actorRegistry?.rootParticipation?.roots
          ?.filter((root) => root.presented)
          .map((root) => root.id) ?? [],
      presentationCapabilities:
        bridge?.actorRegistry?.rootPhaseCapabilities?.roots
          ?.filter((root) => root.phases.presentation)
          .map((root) => root.id) ?? [],
      canvasPixels: pixels,
    };
  }, canvasPixels);
}

async function capturePresentationOverlapOracle(page) {
  return page.evaluate(async () => {
    const loadedThreeUrl = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .find((url) => url.includes("/node_modules/.vite/deps/three.js"));
    const THREE = await import(loadedThreeUrl ?? "/@id/three");
    const presentation = await import("/src/game/render/PresentationOrder.ts");
    const stageBack = presentation.resolveStagePresentationOrder(0, 0);
    const actorUnderlay = presentation.resolveActorUnderlayPresentationOrder(1);
    const actor = presentation.resolveActorPresentationOrder("player", 0, 1);
    const effect = presentation.resolveHitSparkPresentationOrder("hit");
    const stageFront = presentation.resolveStagePresentationOrder(1, 0);
    const pairs = [
      { name: "stage-back<actor-underlay", lower: stageBack, upper: actorUnderlay, lowerColor: 0xff0000, upperColor: 0xff00ff, expected: [255, 0, 255] },
      { name: "actor-underlay<actor", lower: actorUnderlay, upper: actor, lowerColor: 0xff00ff, upperColor: 0x00ff00, expected: [0, 255, 0] },
      { name: "actor<effect", lower: actor, upper: effect, lowerColor: 0x00ff00, upperColor: 0x0000ff, expected: [0, 0, 255] },
      { name: "effect<stage-front", lower: effect, upper: stageFront, lowerColor: 0x0000ff, upperColor: 0xffff00, expected: [255, 255, 0] },
    ];

    const results = [];
    for (const pair of pairs) {
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1);
      renderer.setSize(4, 4, false);
      renderer.setClearColor(0x000000, 1);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
      camera.position.z = 1;
      const rootGroups = [new THREE.Group(), new THREE.Group()];
      const meshes = [
        new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: pair.lowerColor })),
        new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: pair.upperColor })),
      ];
      presentation.applyThreePresentationOrder(meshes[0], meshes[0].material, pair.lower);
      presentation.applyThreePresentationOrder(meshes[1], meshes[1].material, pair.upper);
      rootGroups[0].add(meshes[0]);
      rootGroups[1].add(meshes[1]);
      scene.add(...rootGroups);
      renderer.render(scene, camera);
      const pixel = new Uint8Array(4);
      renderer.getContext().readPixels(2, 2, 1, 1, renderer.getContext().RGBA, renderer.getContext().UNSIGNED_BYTE, pixel);
      results.push({ name: pair.name, pixel: [...pixel.slice(0, 3)], expected: pair.expected, rootGroupOrders: rootGroups.map((group) => group.renderOrder) });
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
    }
    return results;
  });
}

async function warmRuntimeRenderer(page) {
  await page
    .waitForFunction(() => (window.__MUGEN_WEB_SANDBOX__?.renderer?.render?.calls ?? 0) > 0, null, { timeout: 3000 })
    .catch(() => undefined);
  await page.waitForTimeout(180);
  const reset = page.locator('[data-action="reset-round"]').first();
  if ((await reset.count()) > 0) {
    await reset.evaluate((button) => button.click());
  }
  await page.waitForTimeout(120);
}

async function driveRuntimeHitSpark(page) {
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(760);
  await page.keyboard.up("ArrowRight");

  const attacks = ["KeyZ", "KeyA", "KeyZ"];
  for (const attack of attacks) {
    await page.keyboard.press(attack);
    const active = await page
      .waitForFunction(() => (window.__MUGEN_WEB_SANDBOX__?.renderer?.hitSparks?.active ?? 0) > 0, null, { timeout: 1400 })
      .then(() => true)
      .catch(() => false);
    if (active) {
      return readHitSparkDiagnostics(page);
    }
    await page.waitForTimeout(220);
  }
  return readHitSparkDiagnostics(page);
}

async function readHitSparkDiagnostics(page) {
  return page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.renderer?.hitSparks ?? undefined);
}

async function captureStudioWorkbench(page, baseUrl, outDir) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`${baseUrl}${studioWorkbenchRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "studio-workbench.png"), fullPage: true });
  const baseline = await evaluateWithStableBridge(page, () => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const bodyText = document.body.innerText;
    const bodyTextLower = bodyText.toLowerCase();
    const shell = document.querySelector(".app-shell")?.getBoundingClientRect();
    const rectFor = (selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        return undefined;
      }
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };
    const stageDeck = rectFor("#studio-stage-deck");
    const navigator = rectFor("#navigator");
    const consoleRect = rectFor("#console");
    const canvas = rectFor(".stage-canvas");
    const rightInspector = rectFor(".studio-pro-inspector");
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      bodyHasNextDesk: Boolean(document.querySelector(".studio-command-deck")),
      bodyHasPipeline: Boolean(document.querySelector(".studio-mission-strip")),
      bodyHasHealthLanguage: bodyTextLower.includes("project health") && bodyTextLower.includes("readiness"),
      stageDeckVisible: Boolean(stageDeck && stageDeck.width > 0 && stageDeck.height > 0),
      chromeFieldCount: document.querySelectorAll(".studio-chrome-field").length,
      primaryActionCount: document.querySelectorAll(".deck-primary-action").length,
      pipelineStepCount: document.querySelectorAll(".studio-mission-node").length,
      rightInspectorVisible: Boolean(rightInspector && rightInspector.width > 0 && rightInspector.height > 0),
      activeIssueRows: document.querySelectorAll(".pro-warning-row").length,
      navigatorVisible: Boolean(navigator && navigator.width > 0 && navigator.height > 0),
      consoleCollapsed: Boolean(consoleRect && consoleRect.height <= 44),
      consoleHeight: consoleRect?.height ?? 0,
      canvasArea: canvas ? Math.round(canvas.width * canvas.height) : 0,
      selectedRosterAtlasStatuses:
        bridge?.runtimeRoster
          ?.filter((entry) => entry.selected)
          .map((entry) => ({ id: entry.id, atlasStatus: entry.atlasStatus })) ?? [],
      shellWidth: shell?.width ?? 0,
      bodyScrollWidth: document.body.scrollWidth,
      innerWidth: window.innerWidth,
      overflowX: document.body.scrollWidth > window.innerWidth + 1,
    };
  });
  const authoredName = "QA Authored Fight Project";
  const nameInput = page.locator("[data-project-name]").first();
  await nameInput.fill(authoredName);
  await nameInput.press("Tab");
  await changeHiddenSelect(page, '[data-studio-fighter-select="p1"]', "rook-apprentice");
  await changeHiddenSelect(page, '[data-studio-fighter-select="p2"]', "nova-boxer");
  await changeHiddenSelect(page, "[data-studio-stage-select]", "training-grid");
  const historyAfterEdits = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.studioEditHistory);
  await page.locator('[data-action="undo-project-edit"]').first().click();
  const afterUndo = await page.evaluate(() => ({
    project: window.__MUGEN_WEB_SANDBOX__?.project,
    history: window.__MUGEN_WEB_SANDBOX__?.studioEditHistory,
  }));
  await page.locator('[data-action="redo-project-edit"]').first().click();
  const afterRedo = await page.evaluate(() => ({
    project: window.__MUGEN_WEB_SANDBOX__?.project,
    history: window.__MUGEN_WEB_SANDBOX__?.studioEditHistory,
  }));
  await page.keyboard.press("Control+Z");
  const afterKeyboardUndo = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.project);
  await page.keyboard.press("Control+Shift+Z");
  const afterKeyboardRedo = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.project);
  const dirtyBeforeAutosave = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.projectDirty);
  const beforeUnloadPrevented = await page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  let navigationDialogDismissed = false;
  page.once("dialog", async (dialog) => {
    navigationDialogDismissed = dialog.type() === "confirm" && dialog.message().includes("unsaved changes");
    await dialog.dismiss();
  });
  await page.locator('[data-action="open-project"]').first().click();
  const afterDismissedNavigation = await page.evaluate(() => ({
    dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
    entry: window.__MUGEN_WEB_SANDBOX__?.project?.entry,
  }));
  const autosaveDelayMs = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.studioAutosave?.delayMs ?? 1500);
  await page.waitForTimeout(autosaveDelayMs + 250);
  const afterAutosave = await page.evaluate(({ key, authoredName }) => {
    const raw = localStorage.getItem(key);
    const entries = raw ? JSON.parse(raw).entries ?? [] : [];
    return {
      dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
      pending: window.__MUGEN_WEB_SANDBOX__?.studioAutosave?.pending,
      stored: entries.some(
        (entry) =>
          entry.name === authoredName &&
          entry.manifest?.name === authoredName &&
          entry.manifest?.entry?.p1 === "rook-apprentice" &&
          entry.manifest?.entry?.p2 === "nova-boxer" &&
          entry.manifest?.entry?.stage === "training-grid",
      ),
    };
  }, { key: "mugen-web-sandbox:projects:v0", authoredName });
  await page.locator('[data-action="save-project-local"]').first().click();
  const saved = await page.evaluate(({ key, authoredName }) => {
    const raw = localStorage.getItem(key);
    const entries = raw ? JSON.parse(raw).entries ?? [] : [];
    return entries.some(
      (entry) =>
        entry.name === authoredName &&
        entry.manifest?.name === authoredName &&
        entry.manifest?.entry?.p1 === "rook-apprentice" &&
        entry.manifest?.entry?.p2 === "nova-boxer" &&
        entry.manifest?.entry?.stage === "training-grid",
    );
  }, { key: "mugen-web-sandbox:projects:v0", authoredName });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.locator('[data-stored-project-id="qa-authored-fight-project"]').first().evaluate((element) => element.click());
  await page.waitForTimeout(600);
  const reopenedName = await page.locator("[data-project-name]").first().inputValue();
  const reopened = await page.evaluate(() => ({
    name: window.__MUGEN_WEB_SANDBOX__?.project?.name,
    entry: window.__MUGEN_WEB_SANDBOX__?.project?.entry,
    dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
  }));
  await page.screenshot({ path: path.join(outDir, "studio-project-authoring.png"), fullPage: true });
  return {
    ...baseline,
    projectAuthoring: {
      authoredName,
      saved,
      dirtyBeforeAutosave,
      autosaveDelayMs,
      afterAutosave,
      reopenedName,
      historyAfterEdits,
      afterUndo,
      afterRedo,
      afterKeyboardUndo,
      afterKeyboardRedo,
      beforeUnloadPrevented,
      navigationDialogDismissed,
      afterDismissedNavigation,
      ...reopened,
    },
  };
}

async function changeHiddenSelect(page, selector, value) {
  await page.locator(selector).first().evaluate((element, nextValue) => {
    element.value = nextValue;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.waitForTimeout(40);
}

async function captureStudioWorkbenchTablet(page, baseUrl, outDir) {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${baseUrl}${studioWorkbenchRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "studio-workbench-tablet.png"), fullPage: true });
  return evaluateWithStableBridge(page, () => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const shell = document.querySelector(".app-shell")?.getBoundingClientRect();
    const status = document.querySelector(".stage-status")?.getBoundingClientRect();
    const clientWidth = document.documentElement.clientWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const documentScrollWidth = document.documentElement.scrollWidth;
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      clientWidth,
      shellWidth: shell?.width ?? 0,
      bodyScrollWidth,
      documentScrollWidth,
      stageStatusVisible: Boolean(status && status.width > 0 && status.height > 0),
      overflowX: bodyScrollWidth > clientWidth + 1 || documentScrollWidth > clientWidth + 1,
    };
  });
}

async function captureCommandPaletteA11y(page, baseUrl, outDir) {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${baseUrl}${studioWorkbenchRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.waitForTimeout(200);

  const launcher = page.locator('[data-action="open-command-palette"]').first();
  await launcher.focus();
  await page.keyboard.press("Control+K");
  await page.waitForSelector(".command-palette-shell");
  await page.waitForSelector("[data-command-palette-search]");
  await page.screenshot({ path: path.join(outDir, "studio-command-palette.png"), fullPage: true });

  const openedProbe = await page.evaluate(() => {
    const shell = document.querySelector(".command-palette-shell");
    const active = document.activeElement;
    const selected = document.querySelector('.command-result[aria-selected="true"]');
    const input = document.querySelector("[data-command-palette-search]");
    return {
      opened: Boolean(shell),
      searchFocused: active?.matches("[data-command-palette-search]") ?? false,
      activeInsideShell: shell?.contains(active) ?? false,
      resultButtons: document.querySelectorAll(".command-result").length,
      initialActiveResult: selected?.textContent?.trim() ?? "",
      inputActiveDescendant: input?.getAttribute("aria-activedescendant") ?? "",
    };
  });

  await page.keyboard.press("ArrowDown");
  const arrowNavigationProbe = await page.evaluate(() => {
    const selected = document.querySelector('.command-result[aria-selected="true"]');
    const input = document.querySelector("[data-command-palette-search]");
    return {
      arrowChangedActiveResult: selected?.id === input?.getAttribute("aria-activedescendant") && selected?.id === "command-result-1",
      activeResultLabel: selected?.textContent?.trim() ?? "",
    };
  });

  await page.locator(".command-palette-close").first().focus();
  await page.keyboard.press("Shift+Tab");
  const focusStayedInsideAfterShiftTab = await page.evaluate(() => {
    const shell = document.querySelector(".command-palette-shell");
    return shell?.contains(document.activeElement) ?? false;
  });
  for (let i = 0; i < 24; i += 1) {
    await page.keyboard.press("Tab");
  }
  const focusStayedInsideAfterManyTabs = await page.evaluate(() => {
    const shell = document.querySelector(".command-palette-shell");
    return shell?.contains(document.activeElement) ?? false;
  });

  await page.keyboard.press("Escape");
  await page.waitForSelector(".command-palette-shell", { state: "detached" });
  await page.waitForTimeout(80);
  const closedProbe = await page.evaluate(() => ({
    closedOnEscape: !document.querySelector(".command-palette-shell"),
    focusRestoredToLauncher: document.activeElement?.matches('[data-action="open-command-palette"]') ?? false,
  }));

  await page.keyboard.press("Control+K");
  await page.waitForSelector("[data-command-palette-search]");
  await page.locator("[data-command-palette-search]").fill("build surface");
  await page.keyboard.press("Enter");
  await page.waitForSelector(".command-palette-shell", { state: "detached" });
  await page.waitForTimeout(120);
  const enterProbe = await page.evaluate(() => {
    const shell = document.querySelector(".app-shell");
    return {
      keyboardEnterExecutedBuild: shell?.getAttribute("data-studio-tab") === "build",
      keyboardEnterClosedPalette: !document.querySelector(".command-palette-shell"),
    };
  });

  return {
    ...openedProbe,
    ...arrowNavigationProbe,
    focusStayedInsideAfterShiftTab,
    focusStayedInsideAfterManyTabs,
    ...closedProbe,
    ...enterProbe,
  };
}

async function downloadFromButton(page, button, label, options = {}) {
  const attempts = options.attempts ?? 3;
  const timeout = options.timeout ?? 45000;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await button.scrollIntoViewIfNeeded();
    try {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout }),
        button.click(),
      ]);
      return download;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await page.waitForTimeout(750);
      }
    }
  }
  throw new Error(`${label} download did not start after ${attempts} attempt(s): ${lastError?.message ?? lastError}`);
}

async function captureStudioBuild(page, baseUrl, outDir, importedFixturePath) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`${baseUrl}${studioBuildRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  let importedFixtureLoaded = false;
  let importedFixtureName;
  if (importedFixturePath) {
    importedFixtureName = path.basename(importedFixturePath);
    await page.locator("#zip-input").setInputFiles(importedFixturePath);
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.character));
    importedFixtureLoaded = true;
    await page.locator('[data-mode="studio"]').first().evaluate((button) => button.click());
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
    await selectStudioTab(page, "build");
  }
  await page.locator('button[data-action="compile-project"]:visible').first().click();
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.compiledProject));
  const exportTraceButton = page.locator('button[data-action="export-trace-artifact"]:visible').filter({ hasText: /trace/i }).first();
  const download = await downloadFromButton(page, exportTraceButton, "trace artifact", { timeout: 90000, attempts: 2 });
  const tracePath = path.join(outDir, "trace-artifact.json");
  await download.saveAs(tracePath);
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.traceArtifact));
  const exportPackageButton = page.locator('button[data-action="export-package"]:visible').filter({ hasText: /package/i }).first();
  const packageDownload = await downloadFromButton(page, exportPackageButton, "project package", { timeout: 90000, attempts: 3 });
  const packagePath = path.join(outDir, "project-package.zip");
  await packageDownload.saveAs(packagePath);
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.projectBundle));
  await page.screenshot({ path: path.join(outDir, "studio-build.png"), fullPage: true });
  let sourceFocusAfterClick = null;
  const sourceTrustRow = page.locator('.studio-trust-contract-row[data-trust-row-id="source-packages"]').first();
  const sourceTrustHasPath = (await sourceTrustRow.isVisible()) && (await sourceTrustRow.evaluate((row) => Boolean(row.dataset.sourcePath)));
  if (sourceTrustHasPath) {
    await sourceTrustRow.click();
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.studioFocusedSourcePath));
    await page.waitForTimeout(150);
    sourceFocusAfterClick = await page.evaluate(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const sourcePathRow = document.querySelector(".source-package-path-row.is-linked-focus");
      const sourcePathRect = sourcePathRow?.getBoundingClientRect();
      return {
        trustFocusedRow: bridge?.studioFocusedTrustRowId ?? null,
        sourcePackageId: bridge?.studioFocusedSourcePackageId ?? null,
        sourcePath: bridge?.studioFocusedSourcePath ?? null,
        sourcePackageRowClass: document.querySelector(".source-package-row.is-linked-focus")?.dataset.sourcePackageId ?? null,
        sourcePathRowClass: sourcePathRow?.dataset.sourcePath ?? null,
        sourcePathRowVisible: Boolean(sourcePathRect && sourcePathRect.top >= 0 && sourcePathRect.bottom <= window.innerHeight),
      };
    });
    await page.screenshot({ path: path.join(outDir, "studio-build-source-file-focus.png"), fullPage: true });
  }
  const packageTrustRow = page.locator('.studio-trust-contract-row[data-trust-row-id="package-bundle"]').first();
  if (await packageTrustRow.isVisible()) {
    await packageTrustRow.click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioFocusedTrustRowId === "package-bundle");
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.studioFocusedPackageFilePath));
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(outDir, "studio-build-trust-focus.png"), fullPage: true });
  }
  const downloadedArtifact = JSON.parse(fs.readFileSync(tracePath, "utf8"));
  const downloadedPackage = await inspectPackageZip(packagePath);
  return page.evaluate(({ downloadedArtifact, sourceFocusAfterClick }) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      title: document.title,
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      character: bridge?.character,
      bodyHasBuild: document.body.innerText.includes("Build Outputs"),
      bodyHasTrace: document.body.innerText.includes("Trace Evidence"),
      bodyHasPackage: document.body.innerText.includes("Project Package"),
      bodyHasTrustChain: document.body.innerText.includes("Build Trust Chain"),
      trustChainRows: document.querySelectorAll(".studio-trust-contract-row").length,
      trustChainIds: bridge?.studioTrustChain?.map((row) => row.id) ?? [],
      trustChainTargets: bridge?.studioTrustChain?.map((row) => `${row.id}:${row.targetKind}:${row.targetId}`) ?? [],
      trustChainTargetDetails: bridge?.studioTrustChain?.map((row) => ({
        id: row.id,
        kind: row.targetKind,
        targetId: row.targetId,
        targetPackageId: row.targetPackageId,
        targetPath: row.targetPath,
      })) ?? [],
      trustChainDeltas: bridge?.studioTrustChain?.map((row) => `${row.id}:${row.freshness}:${row.delta}`) ?? [],
      trustChainNextActions: bridge?.studioTrustChain?.map((row) => row.nextLabel).filter(Boolean) ?? [],
      trustChainBlocked: bridge?.studioTrustChain?.filter((row) => row.state === "blocked").map((row) => row.id) ?? [],
      trustFocusedRow: bridge?.studioFocusedTrustRowId ?? null,
      trustFocusedRowClass: document.querySelector(".studio-trust-contract-row.is-linked-focus")?.dataset.trustRowId ?? null,
      focusedPackageFilePath: bridge?.studioFocusedPackageFilePath ?? null,
      focusedPackageFileRow: document.querySelector(".package-file-row.is-linked-focus")?.dataset.packageFilePath ?? null,
      focusedPackageFileRowVisible: (() => {
        const row = document.querySelector(".package-file-row.is-linked-focus");
        const rect = row?.getBoundingClientRect();
        return Boolean(rect && rect.top >= 0 && rect.bottom <= window.innerHeight);
      })(),
      sourceFocusAfterClick,
      packageFileRows: document.querySelectorAll(".package-file-row[data-package-file-path]").length,
      sourcePathRows: document.querySelectorAll(".source-package-path-row[data-source-path]").length,
      trustChainButtonBindings: [...document.querySelectorAll(".studio-trust-contract-row")].map((row) => ({
        action: row.dataset.action,
        studioTab: row.dataset.studioTab,
        evidenceFilter: row.dataset.evidenceFilter,
        assetFilter: row.dataset.assetFilter,
        traceFrameIndex: row.dataset.traceFrameIndex,
        sourcePackageId: row.dataset.sourcePackageId,
        sourcePath: row.dataset.sourcePath,
        packageFilePath: row.dataset.packageFilePath,
        studioAssetId: row.dataset.studioAssetId,
      })),
      bodyHasArchitectureBoundaries: document.body.innerText.includes("Architecture boundaries") || document.body.innerText.includes("Architecture Boundaries"),
      compiledProject: Boolean(bridge?.compiledProject),
      projectBundle: bridge?.projectBundle,
      traceArtifactStatus: bridge?.traceArtifact?.status,
      traceArtifactChecksum: bridge?.traceArtifact?.trace?.checksum,
      traceArtifacts: bridge?.traceArtifacts?.length ?? 0,
      architectureGateStatus: bridge?.studio?.gates?.find((gate) => gate.id === "architecture-boundaries")?.status,
      architectureGateEvidenceIds: bridge?.studio?.gates?.find((gate) => gate.id === "architecture-boundaries")?.evidenceIds ?? [],
      architectureEvidenceRecord: Boolean(bridge?.studioEvidence?.records?.some((record) => record.id === "test:architecture-boundaries")),
      stageReports: bridge?.stages?.length ?? 0,
      stageLayerReports: bridge?.stages?.reduce((total, stage) => total + (stage.backgrounds?.layers?.length ?? 0), 0) ?? 0,
      stageLayerStatuses: [
        ...new Set((bridge?.stages ?? []).flatMap((stage) => stage.backgrounds?.layers?.map((layer) => layer.status) ?? [])),
      ],
      provenanceSchema: bridge?.studioAssets?.provenance?.[0]?.schemaVersion,
      provenanceRecords: bridge?.studioAssets?.provenance?.length ?? 0,
      provenanceInputFiles: bridge?.studioAssets?.provenance?.reduce((total, record) => total + (record.inputFiles?.length ?? 0), 0) ?? 0,
      provenanceOutputFiles: bridge?.studioAssets?.provenance?.reduce((total, record) => total + (record.outputFiles?.length ?? 0), 0) ?? 0,
      provenanceCompleteRecords: bridge?.studioAssets?.provenance?.filter((record) => record.status === "complete").length ?? 0,
      provenanceFilePathLeaks: (bridge?.studioAssets?.provenance ?? []).flatMap((record) => [
        ...(record.inputFiles ?? []),
        ...(record.outputFiles ?? []),
      ]).filter((file) => /^(?:[a-z]:\\|[a-z]:\/|file:|\/\/)/i.test(file.path ?? "")).length,
      studioEvidenceStats: bridge?.studioEvidence?.stats,
      downloadedArtifact: {
        filename: downloadedArtifact.target?.id,
        schemaVersion: downloadedArtifact.schemaVersion,
        status: downloadedArtifact.status,
        checksum: downloadedArtifact.trace?.checksum,
        gateCount: downloadedArtifact.gates?.length ?? 0,
      },
      downloadedPackage: window.__DOWNLOADED_PACKAGE__,
    };
  }, { downloadedArtifact, sourceFocusAfterClick }).then((result) => ({ ...result, downloadedPackage, importedFixtureLoaded, importedFixtureName }));
}

async function captureStudioModules(page, outDir) {
  await selectStudioTab(page, "modules");
  const hasCompiledProject = await page
    .waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.compiledProject), undefined, { timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  if (!hasCompiledProject) {
    await page.locator('button[data-action="compile-project"]:visible').first().click();
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.compiledProject));
  }
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-modules.png"), fullPage: true });
  await page.locator("#right-pane").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outDir, "studio-modules-contracts.png"), fullPage: false });
  return evaluateWithStableBridge(page, () => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const compiled = bridge?.compiledProject;
    const contracts = compiled?.contracts;
    const modules = bridge?.studio?.modules ?? [];
    const bodyText = document.body.innerText;
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      bodyHasModuleGraph: bodyText.includes("Module Graph Studio"),
      bodyHasSharedContracts: bodyText.includes("Shared Contracts"),
      bodyHasSharedCoreBoundary: bodyText.includes("Forbidden in shared core"),
      bodyHasPlatformerBoundary: bodyText.includes("Platformer blocked concepts"),
      bodyHasCnsBlocked: bodyText.includes("CNS") && bodyText.includes("HitDef") && bodyText.includes("MUGEN command routing"),
      contractSchema: contracts?.schemaVersion,
      sharedContracts: contracts?.sharedContracts?.length ?? 0,
      moduleContracts: contracts?.moduleContracts?.length ?? 0,
      sharedCoreForbidden: contracts?.boundaries?.sharedCoreForbidden?.length ?? 0,
      platformerForbidden: contracts?.boundaries?.platformerForbidden?.length ?? 0,
      platformerBlocksCns: contracts?.boundaries?.platformerForbidden?.includes("CNS") ?? false,
      platformerBlocksHitDef: contracts?.boundaries?.platformerForbidden?.includes("HitDef") ?? false,
      modulesWithConsumes: modules.filter((module) => (module.consumes?.length ?? 0) > 0).length,
      modulesWithProvides: modules.filter((module) => (module.provides?.length ?? 0) > 0).length,
      modulesWithBlockedClaims: modules.filter((module) => String(module.claimBlocked ?? "").length > 0).length,
    };
  });
}

async function captureStudioSourceRelink(page, baseUrl, outDir, importedFixturePath) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`${baseUrl}${studioBuildRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  if (!importedFixturePath) {
    return { skipped: true, reason: "imported fixture not found" };
  }

  const projectPath = writeSourceRelinkProject(outDir);
  await page.locator("#project-input").setInputFiles(projectPath);
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.project?.sourcePackages?.some((sourcePackage) => sourcePackage.status === "missing"));
  const before = await page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      missing: bridge?.project?.sourcePackages?.filter((sourcePackage) => sourcePackage.status === "missing").length ?? 0,
      linked: bridge?.project?.sourcePackages?.filter((sourcePackage) => sourcePackage.status === "linked").length ?? 0,
      warnings: bridge?.projectImportWarnings ?? [],
      relinkButtons: document.querySelectorAll('[data-action="relink-source"]').length,
      bodyHasRelinkCopy: document.body.innerText.includes("Reload the original ZIP or folder"),
      sourceTransactions: bridge?.sourceTransactions ?? [],
      sourceHandles: bridge?.sourceHandles ?? [],
    };
  });

  const chooserPromise = page.waitForEvent("filechooser");
  await page.locator('[data-source-package-id="kfm-official"] [data-action="relink-source"]').first().click();
  const chooser = await chooserPromise;
  await chooser.setFiles(importedFixturePath);
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.project?.sourcePackages?.some((sourcePackage) => sourcePackage.status === "linked"));
  await page.locator('[data-mode="studio"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
  await selectStudioTab(page, "build");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-source-relink.png"), fullPage: true });

  const after = await evaluateWithStableBridge(page, () => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const sourcePackages = bridge?.project?.sourcePackages ?? [];
    const bodyText = document.body.innerText;
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      sourcePackages: sourcePackages.length,
      missing: sourcePackages.filter((sourcePackage) => sourcePackage.status === "missing").length,
      linked: sourcePackages.filter((sourcePackage) => sourcePackage.status === "linked").length,
      names: sourcePackages.map((sourcePackage) => sourcePackage.name),
      identity: sourcePackages.map((sourcePackage) => ({
        id: sourcePackage.id,
        status: sourcePackage.identityStatus,
        fingerprint: sourcePackage.fingerprint,
        observedFingerprint: sourcePackage.observedFingerprint,
      })),
      requiredPaths: sourcePackages.reduce((total, sourcePackage) => total + (sourcePackage.requiredPaths?.length ?? 0), 0),
      warnings: bridge?.projectImportWarnings ?? [],
      bodyHasSourcePackages: bodyText.includes("Source Packages"),
      bodyHasLinkedCopy: bodyText.includes("Source files are available for package export"),
      bodyHasKfm: bodyText.toLowerCase().includes("kfm"),
      relinkButtons: document.querySelectorAll('[data-action="relink-source"]').length,
      sourceTransactions: bridge?.sourceTransactions ?? [],
      sourceHandles: bridge?.sourceHandles ?? [],
    };
  });
  const changedFixturePath = await writeChangedSourceRelinkFixture(outDir, importedFixturePath);
  const changedChooserPromise = page.waitForEvent("filechooser");
  await page.locator('[data-source-package-id="kfm-official"] [data-action="relink-source"]').first().click();
  const changedChooser = await changedChooserPromise;
  await changedChooser.setFiles(changedFixturePath);
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.sourceImportTransaction?.status === "rejected");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-source-relink-rejected.png"), fullPage: true });
  const rejected = await evaluateWithStableBridge(page, () => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const sourcePackage = bridge?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-official");
    const transaction = bridge?.sourceImportTransaction;
    const bodyText = document.body.innerText;
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      character: bridge?.character,
      status: transaction?.status,
      reason: transaction?.reason,
      transactionFingerprint: transaction?.fingerprint,
      currentSourceStatus: sourcePackage?.status,
      currentIdentityStatus: sourcePackage?.identityStatus,
      currentFingerprint: sourcePackage?.fingerprint,
      currentObservedFingerprint: sourcePackage?.observedFingerprint,
      sourceTransaction: bridge?.sourceTransactions?.find((candidate) => candidate.sourcePackageId === "kfm-official"),
      sourceHandle: bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-official"),
      bodyHasSourceRejected: bodyText.includes("Source reimport rejected"),
      bodyHasRetainedSession: bodyText.includes("Current runtime/source session was retained"),
    };
  });
  return { skipped: false, projectPath, before, after, rejected, changedFixturePath };
}

async function captureStudioFolderHandleRecovery(page, baseUrl, outDir, importedFixturePath) {
  if (!importedFixturePath) {
    return { skipped: true, reason: "imported fixture not found" };
  }
  const entries = await readZipAsFolderHandleEntries(importedFixturePath);
  await page.addInitScript(({ entries: fixtureEntries }) => {
    const makeDirectory = (name) => {
      const directory = {
        kind: "directory",
        name,
        children: [],
        values: async function* () {
          for (const child of directory.children) yield child;
        },
        getDirectoryHandle: async (childName) => {
          const child = directory.children.find((candidate) => candidate.kind === "directory" && candidate.name === childName);
          if (!child) throw new DOMException(`Missing directory ${childName}`, "NotFoundError");
          return child;
        },
        getFileHandle: async (childName) => {
          const child = directory.children.find((candidate) => candidate.kind === "file" && candidate.name === childName);
          if (!child) throw new DOMException(`Missing file ${childName}`, "NotFoundError");
          return child;
        },
        queryPermission: async () => "granted",
        requestPermission: async () => "granted",
      };
      return directory;
    };
    const root = makeDirectory("kfm-folder");
    const directories = new Map([["", root]]);
    for (const entry of fixtureEntries) {
      const segments = String(entry.path).replace(/\\/g, "/").split("/").filter(Boolean);
      let directory = root;
      let prefix = "";
      for (const segment of segments.slice(0, -1)) {
        prefix = prefix ? `${prefix}/${segment}` : segment;
        let child = directories.get(prefix);
        if (!child) {
          child = makeDirectory(segment);
          directories.set(prefix, child);
          directory.children.push(child);
        }
        directory = child;
      }
      const name = segments.at(-1) ?? "source.bin";
      const fileEntry = {
        kind: "file",
        name,
        bytes: Uint8Array.from(atob(entry.base64), (character) => character.charCodeAt(0)),
        getFile: async () => new File([fileEntry.bytes], name, { type: "application/octet-stream" }),
        createWritable: async () => {
          let staged = fileEntry.bytes.slice();
          return {
            write: async (value) => {
              staged = new TextEncoder().encode(String(value));
            },
            close: async () => {
              fileEntry.bytes = staged;
            },
            abort: async () => {},
          };
        },
      };
      directory.children.push(fileEntry);
    }
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => root,
    });
  }, { entries });

  const projectPath = writeFolderHandleRecoveryProject(outDir);
  await page.goto(`${baseUrl}${studioBuildRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.locator("#project-input").setInputFiles(projectPath);
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.project?.sourcePackages?.some((sourcePackage) => sourcePackage.status === "missing"));
  const before = await page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const sourcePackage = bridge?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder");
    const sourceHandle = bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
    return {
      kind: sourcePackage?.kind,
      missing: sourcePackage?.status === "missing",
      sourceHandle,
      rememberButtons: document.querySelectorAll('[data-action="link-source-handle"]').length,
    };
  });
  await page.locator('[data-source-package-id="kfm-folder"] [data-action="link-source-handle"]').first().click();
  await page.waitForFunction(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const sourcePackage = bridge?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder");
    const sourceHandle = bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
    return sourcePackage?.status === "linked" && sourceHandle?.handleKind === "directory" && sourceHandle?.canRead === true;
  });
  await page.locator('[data-mode="studio"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
  await selectStudioTab(page, "build");
  await scrollLiveSelectorIntoView(page, '[data-source-package-id="kfm-folder"].source-package-row');
  await page.locator('[data-source-package-id="kfm-folder"] .source-package-path-row[data-source-path$=".cns"]').first().click();
  await page.waitForSelector('[data-source-editor]');
  await page.waitForFunction(() => {
    const editor = document.querySelector('[data-source-editor]');
    const draft = window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument;
    return editor && !editor.hasAttribute('readonly') && draft?.semanticPreflight?.status === 'ready';
  }, null, { timeout: 15000 });
  const sourceEditor = page.locator('[data-source-editor]');
  const originalSourceText = await sourceEditor.inputValue();
  const sourceDraftState = await page.evaluate(() => ({
    readOnly: document.querySelector('[data-source-editor]')?.hasAttribute('readonly') ?? true,
    draft: window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument,
    sourceTransaction: window.__MUGEN_WEB_SANDBOX__?.sourceTransactions?.find((candidate) => candidate.sourcePackageId === 'kfm-folder'),
  }));
  if (sourceDraftState.readOnly) {
    throw new Error(`Studio semantic draft was readonly before edit: ${JSON.stringify(sourceDraftState)}`);
  }
  const setSourceEditorText = async (text) => {
    // The real KFM CNS is large enough that Playwright fill can time out before dispatching the paste event.
    await sourceEditor.evaluate((element, value) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      if (!setter) {
        throw new Error("HTMLTextAreaElement value setter is unavailable");
      }
      setter.call(element, value);
      element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertFromPaste" }));
    }, text);
  };
  await setSourceEditorText(`${originalSourceText}\nnot-a-key-value`);
  await page.waitForFunction(() => document.querySelector('[data-action="save-source-document"]')?.disabled === true);
  await setSourceEditorText(`${originalSourceText}\n; qa explicit source edit`);
  await page.waitForFunction(() => document.querySelector('[data-action="save-source-document"]')?.disabled === false);
  await page.locator('[data-action="save-source-document"]').click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.sourceImportTransaction?.reason === "explicit-reimport");
  await page.locator('[data-mode="studio"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
  await selectStudioTab(page, "build");
  await scrollLiveSelectorIntoView(page, '[data-source-package-id="kfm-folder"].source-package-row');
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-source-folder-handle.png"), fullPage: true });
  const after = await evaluateWithStableBridge(page, () => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const sourcePackage = bridge?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder");
    const sourceHandle = bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
    const sourceTransaction = bridge?.sourceTransactions?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
    const bodyText = document.body.textContent ?? "";
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      character: bridge?.character,
      sourcePackage,
      sourceHandle,
      sourceTransaction,
      sourceDraft: bridge?.studioSourceDocument,
      bodyHasSourcePackages: bodyText.includes("Source Packages"),
      bodyHasLinkedCopy: bodyText.includes("Source files are available for package export"),
      bodyHasFolderHandle: bodyText.toLowerCase().includes("folder") && bodyText.includes("Handle: granted"),
      bodyHasSourceEditor: bodyText.includes("Source document") && bodyText.includes("Save & Reimport"),
      bodyHasSemanticPreflight: bodyText.includes("Semantic ready"),
      sourceEditorVisible: Boolean(document.querySelector("[data-source-editor]")),
      explicitReimport: bridge?.sourceImportTransaction?.reason === "explicit-reimport",
    };
  });
  return { skipped: false, projectPath, before, after, fixtureEntries: entries.length };
}

async function readZipAsFolderHandleEntries(importedFixturePath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(importedFixturePath));
  return Promise.all(Object.entries(zip.files)
    .filter(([, entry]) => !entry.dir)
    .map(async ([entryPath, entry]) => ({ path: entryPath, base64: await entry.async("base64") })));
}

async function writeChangedSourceRelinkFixture(outDir, importedFixturePath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(importedFixturePath));
  const defPath = Object.keys(zip.files).find((candidate) => candidate.toLowerCase() === "chars/kfm/kfm.def");
  if (!defPath) {
    throw new Error("Source relink fixture did not contain chars/kfm/kfm.def");
  }
  const definition = await zip.file(defPath).async("string");
  zip.file(defPath, `${definition}\n; qa changed source fingerprint\n`);
  const changedPath = path.join(outDir, "kfm-official-changed.zip");
  fs.writeFileSync(changedPath, await zip.generateAsync({ type: "nodebuffer" }));
  return changedPath;
}

async function captureIkemenScan(page, baseUrl, outDir) {
  await page.setViewportSize({ width: 1440, height: 960 });
  const zipPath = await writeIkemenScanFixture(outDir);
  await page.goto(`${baseUrl}/?mode=studio&studio=evidence&${routeParams}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.locator("#zip-input").setInputFiles(zipPath);
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.compatibility?.profiles?.ikemen?.detected));
  await page.locator('[data-mode="studio"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
  await selectStudioTab(page, "evidence");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "ikemen-scan-evidence.png"), fullPage: true });
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const scan = bridge?.compatibility?.profiles?.ikemen;
    const unsupported = bridge?.compatibility?.unsupported ?? [];
    const bodyText = document.body.innerText;
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      detected: Boolean(scan?.detected),
      level: scan?.level,
      findings: scan?.findings?.length ?? 0,
      screenpackFiles: scan?.files?.screenpack?.length ?? 0,
      zssFiles: scan?.files?.zss?.length ?? 0,
      luaFiles: scan?.files?.lua?.length ?? 0,
      modelFiles: scan?.files?.model?.length ?? 0,
      hasScreenpackFeature: Boolean(scan?.features?.["IKEMEN screenpack DEF"]),
      hasZssControllerFeature: Boolean(scan?.features?.["IKEMEN controller MapSet"]),
      hasLuaHookFeature: Boolean(scan?.features?.["IKEMEN Lua hook system"]),
      hasExtendedTriggerFeature: Boolean(scan?.features?.["IKEMEN extended trigger TimeElapsed"]),
      unsupportedScreenpack: unsupported.some((item) => item.format === "ikemen" && item.feature === "IKEMEN screenpack DEF"),
      unsupportedZss: unsupported.some((item) => item.format === "ikemen" && item.feature === "ZSS script file"),
      bodyHasIkemenEvidence: bodyText.includes("IKEMEN"),
      bodyHasEvidenceBrowser: bodyText.includes("Evidence Browser"),
    };
  });
}

async function writeIkemenScanFixture(outDir) {
  const zipPath = path.join(outDir, "ikemen-scan-fixture.zip");
  const zip = new JSZip();
  zip.file(
    "chars/neo/neo.def",
    `
[Info]
name = Neo Ikemen Probe
displayname = Neo Ikemen Probe
mugenversion = 1.1
author = local qa

[Files]
cns = neo.cns
st = neo.zss
`,
  );
  zip.file(
    "chars/neo/neo.cns",
    `
[Statedef 0]
type = S
physics = S
anim = 0

[State 0, AssertCommand]
type = AssertCommand
trigger1 = TimeElapsed > 20
name = "holdfwd"

[State 0, AssertSpecial]
type = AssertSpecial
flag = NoLifeBarAction
trigger1 = TeamLeader = 1
`,
  );
  zip.file("chars/neo/neo.zss", 'mapSet{map: "route"; value: 1}\n');
  zip.file("data/select.def", "unlock = stats.modes.arcade.clear > 0\ncommandlist = data/movelist.json\nscript = external/script/story.lua\n");
  zip.file("external/script/story.lua", 'hook.add("main.f_commandLine", "story", function() end)\n');
  zip.file("stages/model-stage.def", "[Info]\nname = Model Stage Probe\n[Camera]\ntopz = 240\nfov = 45\ndepthtoscreen = 1\nmodel = arena.glb\n");
  zip.file("stages/arena.glb", Buffer.from([0, 1, 2, 3]));
  fs.writeFileSync(zipPath, await zip.generateAsync({ type: "nodebuffer" }));
  return zipPath;
}

function writeSourceRelinkProject(outDir) {
  const projectPath = path.join(outDir, "source-relink-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "source-relink-fixture",
    name: "Source Relink Fixture",
    engineVersion: "qa-smoke",
    generatedAt: "2026-06-26T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [
      {
        id: "kfm-official",
        name: "kfm-official.zip",
        kind: "zip",
        fileCount: 14,
        status: "linked",
        characterId: "imported-kfm",
        characterName: "Kung Fu Man",
        defPath: "chars/kfm/kfm.def",
        stageIds: ["kfm"],
        stageDefPaths: ["stages/kfm.def"],
        requiredPaths: ["chars/kfm/kfm.def", "chars/kfm/kfm.sff", "chars/kfm/kfm.air", "chars/kfm/kfm.cmd", "chars/kfm/kfm.cns"],
      },
    ],
    assets: {
      characters: ["nova-boxer", "mira-volt", "rook-apprentice"],
      stages: ["rooftop-dojo"],
      audio: [],
      ui: [],
      effects: [],
    },
    assetRecords: [],
    entry: { mode: "match", p1: DEFAULT_P1, p2: DEFAULT_P2, stage: DEFAULT_STAGE },
    compatibility: {
      gates: [],
      stats: { characters: 3, stages: 1, importedCharacters: 1, importedStages: 0, generatedAtlases: 3 },
    },
  };
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
  return projectPath;
}

function writeFolderHandleRecoveryProject(outDir) {
  const projectPath = path.join(outDir, "source-folder-handle-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "source-folder-handle-fixture",
    name: "Source Folder Handle Fixture",
    engineVersion: "qa-smoke",
    generatedAt: "2026-07-13T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [{
      id: "kfm-folder",
      name: "kfm-folder",
      kind: "folder",
      fileCount: 14,
      status: "linked",
      characterId: "imported-kfm",
      characterName: "Kung Fu Man",
      defPath: "chars/kfm/kfm.def",
      stageIds: ["kfm"],
      stageDefPaths: ["stages/kfm.def"],
      requiredPaths: ["chars/kfm/kfm.def", "chars/kfm/kfm.sff", "chars/kfm/kfm.air", "chars/kfm/kfm.cmd", "chars/kfm/kfm.cns"],
    }],
    assets: {
      characters: ["nova-boxer", "mira-volt", "rook-apprentice"],
      stages: ["rooftop-dojo"],
      audio: [],
      ui: [],
      effects: [],
    },
    assetRecords: [],
    entry: { mode: "match", p1: DEFAULT_P1, p2: DEFAULT_P2, stage: DEFAULT_STAGE },
    compatibility: {
      gates: [],
      stats: { characters: 3, stages: 1, importedCharacters: 1, importedStages: 0, generatedAtlases: 3 },
    },
  };
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
  return projectPath;
}

async function inspectPackageZip(packagePath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(packagePath));
  const files = Object.keys(zip.files).filter((name) => !zip.files[name].dir).sort();
  const manifest = JSON.parse(await zip.file("package-manifest.json").async("string"));
  const project = JSON.parse(await zip.file("project/project.json").async("string"));
  const runtime = JSON.parse(await zip.file("runtime/runtime-manifest.json").async("string"));
  const sourceRuntimeMap = JSON.parse(await zip.file("studio/asset-source-runtime-map.json").async("string"));
  const packageAssets = JSON.parse(await zip.file("assets/package-assets.json").async("string"));
  const bundledAssets = packageAssets.filter((asset) => asset.status === "bundled");
  const importedAssets = bundledAssets.filter((asset) => asset.packagePath.startsWith("assets/imported/"));
  const missingBundledFiles = bundledAssets.filter((asset) => !files.includes(asset.packagePath));
  const bundledWithoutChecksum = bundledAssets.filter((asset) => !asset.sha256 || !asset.bytes);
  const importedLowerPaths = importedAssets.map((asset) => asset.packagePath.toLowerCase());
  return {
    fileCount: files.length,
    files,
    manifestSchema: manifest.schemaVersion,
    binaryBundlingStatus: manifest.assets?.binaryBundlingStatus,
    binaryBundled: manifest.assets?.binaryBundled,
    binarySkipped: manifest.assets?.binarySkipped,
    binaryFailed: manifest.assets?.binaryFailed,
    binaryBytes: manifest.assets?.binaryBytes,
    projectSourcePackages: project.sourcePackages?.length ?? 0,
    linkedProjectSourcePackages: project.sourcePackages?.filter((sourcePackage) => sourcePackage.status === "linked").length ?? 0,
    projectSourceRequiredPaths: project.sourcePackages?.reduce((total, sourcePackage) => total + (sourcePackage.requiredPaths?.length ?? 0), 0) ?? 0,
    projectSourceFileDigests: project.sourcePackages?.reduce((total, sourcePackage) => total + (sourcePackage.fileDigests?.length ?? 0), 0) ?? 0,
    hasKfmSourcePackage: project.sourcePackages?.some((sourcePackage) =>
      String(sourcePackage.name ?? "").toLowerCase().includes("kfm") &&
      sourcePackage.requiredPaths?.some((requiredPath) => String(requiredPath).toLowerCase().endsWith("kfm.def")),
    ) ?? false,
    packageAssetRecords: packageAssets.length,
    bundledAssetRecords: bundledAssets.length,
    importedBundledAssetRecords: importedAssets.length,
    hasImportedDef: importedLowerPaths.some((file) => file.endsWith(".def")),
    hasImportedSff: importedLowerPaths.some((file) => file.endsWith(".sff")),
    hasImportedAir: importedLowerPaths.some((file) => file.endsWith(".air")),
    hasImportedCmd: importedLowerPaths.some((file) => file.endsWith(".cmd")),
    hasImportedCns: importedLowerPaths.some((file) => file.endsWith(".cns")),
    missingBundledFiles: missingBundledFiles.map((asset) => asset.packagePath),
    bundledWithoutChecksum: bundledWithoutChecksum.map((asset) => asset.packagePath),
    runtimeSchema: runtime.schemaVersion,
    runtimeContractSchema: runtime.contracts?.schemaVersion,
    runtimeSharedContracts: runtime.contracts?.sharedContracts?.length ?? 0,
    runtimeModuleContracts: runtime.contracts?.moduleContracts?.length ?? 0,
    runtimeSharedCoreForbidden: runtime.contracts?.boundaries?.sharedCoreForbidden?.length ?? 0,
    runtimePlatformerForbidden: runtime.contracts?.boundaries?.platformerForbidden?.length ?? 0,
    runtimeBlocksCns: runtime.contracts?.boundaries?.sharedCoreForbidden?.includes("CNS") ?? false,
    runtimeBlocksHitDef: runtime.contracts?.boundaries?.sharedCoreForbidden?.includes("HitDef") ?? false,
    runtimeHasPlatformerContract: runtime.contracts?.moduleContracts?.some((contract) => contract.id === "platformer-module") ?? false,
    sourceRuntimeAssetCount: Object.keys(sourceRuntimeMap).length,
    hasTrace: files.includes("qa/latest-trace-artifact.json"),
    hasAssetManifest: files.includes("assets/package-assets.json"),
    hasRuntimeAtlas: files.some((file) => file.endsWith("sprite-sheet-alpha.png")),
    hasStageArt: files.some((file) => file.endsWith("rooftop-dojo.png")),
  };
}

async function captureStudioStage(page, outDir) {
  await selectStudioTab(page, "stage");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-stage.png"), fullPage: true });
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const stageReports = bridge?.stages ?? [];
    const layerReports = stageReports.flatMap((stage) => stage.backgrounds?.layers ?? []);
    const controllerReports = stageReports.flatMap((stage) => stage.backgrounds?.controllers?.items ?? []);
    const controllerSummaries = stageReports.map((stage) => stage.backgrounds?.controllers).filter(Boolean);
    const bodyText = document.body.innerText.toLowerCase();
    return {
      title: document.title,
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      selectedStage: bridge?.project?.entry?.stage,
      bodyHasStagePreview: bodyText.includes("stage preview"),
      bodyHasStageContract: bodyText.includes("stage contract"),
      bodyHasLayerStatus: bodyText.includes("bg layer status"),
      bodyHasLayerDiagnostics: bodyText.includes("layer diagnostics"),
      bodyHasBgControllers: bodyText.includes("bg controllers"),
      bodyHasAvailableStages: bodyText.includes("available stages"),
      stageReports: stageReports.length,
      layerReports: layerReports.length,
      layerStatuses: [...new Set(layerReports.map((layer) => layer.status))],
      renderedOrAnimatedLayers: layerReports.filter((layer) => layer.status === "rendered" || layer.status === "animated").length,
      missingOrUnsupportedLayers: layerReports.filter((layer) => layer.status === "missing" || layer.status === "unsupported").length,
      bgControllerReports: controllerReports.length,
      bgControllerParsed: controllerSummaries.reduce((total, controller) => total + (controller.parsed ?? 0), 0),
      bgControllerBounded: controllerReports.filter((controller) => controller.status === "bounded").length,
      bgControllerUnsupported: controllerReports.filter((controller) => controller.status === "unsupported").length,
    };
  });
}

async function captureStudioBgCtrlStage(page, baseUrl, outDir) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`${baseUrl}${studioBgCtrlStageRoute}`, { waitUntil: "domcontentloaded" });
  await waitForBridge(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "studio-stage-bgctrl.png"), fullPage: true });
  const canvasPng = await page.locator("canvas").first().screenshot({ path: path.join(outDir, "studio-stage-bgctrl-canvas.png") });
  const canvasPixels = await getCanvasPixelStats(page, canvasPng);
  return evaluateWithStableBridge(page, (canvasPixels) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const stage = bridge?.snapshot?.stage;
    const controllerGroups = stage?.bgControllers ?? [];
    const controllers = controllerGroups.flatMap((group) => group.controllers ?? []);
    const bodyText = document.body.innerText.toLowerCase();
    return {
      title: document.title,
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      selectedStage: bridge?.project?.entry?.stage,
      snapshotStage: stage?.id,
      layerCount: stage?.layers?.length ?? 0,
      bgControllerGroups: controllerGroups.length,
      bgControllers: controllers.length,
      bgControllerTypes: [...new Set(controllers.map((controller) => String(controller.type).toLowerCase()))],
      bodyHasBgCtrlLab: bodyText.includes("bgctrl lab"),
      bodyHasBoundedBgCtrl: bodyText.includes("bounded"),
      bodyHasNativeBgCtrlCount: bodyText.includes("4 native bgctrl") || bodyText.includes("4/4 bounded"),
      canvasPixels,
    };
  }, canvasPixels);
}

async function captureStudioEvidence(page, outDir) {
  await selectStudioTab(page, "evidence");
  const traceFilter = page.locator('[data-evidence-filter="trace"]').first();
  if (await traceFilter.isVisible()) {
    await traceFilter.click();
    await page.waitForTimeout(100);
  }
  const secondFrame = page.locator('[data-trace-frame-index="1"]').first();
  if (await secondFrame.isVisible()) {
    await secondFrame.click();
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: path.join(outDir, "studio-evidence.png"), fullPage: true });
  const worldDelta = page.locator("[data-trace-world-delta]").first();
  if (await worldDelta.isVisible()) {
    await worldDelta.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(outDir, "studio-evidence-world-delta.png"), fullPage: true });
  }
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      title: document.title,
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      evidenceFilter: bridge?.studioEvidence?.activeFilter,
      bodyHasEvidence: document.body.innerText.includes("Evidence Browser"),
      bodyHasTrustChain: document.body.innerText.includes("Evidence Trust Chain"),
      trustChainRows: document.querySelectorAll(".studio-trust-contract-row").length,
      trustChainIds: bridge?.studioTrustChain?.map((row) => row.id) ?? [],
      trustChainTargets: bridge?.studioTrustChain?.map((row) => `${row.id}:${row.targetKind}:${row.targetId}`) ?? [],
      trustChainDeltas: bridge?.studioTrustChain?.map((row) => `${row.id}:${row.freshness}:${row.delta}`) ?? [],
      trustChainNextActions: bridge?.studioTrustChain?.map((row) => row.nextLabel).filter(Boolean) ?? [],
      trustChainBlocked: bridge?.studioTrustChain?.filter((row) => row.state === "blocked").map((row) => row.id) ?? [],
      trustChainButtonBindings: [...document.querySelectorAll(".studio-trust-contract-row")].map((row) => ({
        action: row.dataset.action,
        studioTab: row.dataset.studioTab,
        evidenceFilter: row.dataset.evidenceFilter,
        assetFilter: row.dataset.assetFilter,
        traceFrameIndex: row.dataset.traceFrameIndex,
        sourcePackageId: row.dataset.sourcePackageId,
        studioAssetId: row.dataset.studioAssetId,
      })),
      bodyHasHistory: document.body.innerText.includes("Session Trace History"),
      bodyHasPersistedHistory: document.body.innerText.includes("Persisted Evidence History"),
      bodyHasPersistedComparison: document.body.innerText.includes("Comparison:"),
      bodyHasTraceComparisonReview: document.body.innerText.includes("Trace Comparison Review"),
      bodyHasGateDiff: document.body.innerText.includes("Gate Diff"),
      bodyHasTraceFrameScrubber: document.body.innerText.includes("Trace Frame Scrubber"),
      bodyHasTraceFrameDelta: Boolean(document.querySelector("[data-trace-frame-delta]")),
      bodyHasTraceWorldDelta: Boolean(document.querySelector("[data-trace-world-delta]")),
      bodyHasTrace: document.body.innerText.toLowerCase().includes("trace"),
      hasArchitectureGateRecord: Boolean(bridge?.studioEvidence?.records?.some((record) => record.id === "gate:architecture-boundaries")),
      hasArchitectureEvidenceRecord: Boolean(bridge?.studioEvidence?.records?.some((record) => record.id === "test:architecture-boundaries")),
      architectureEvidenceStatus: bridge?.studioEvidence?.records?.find((record) => record.id === "test:architecture-boundaries")?.status,
      traceArtifacts: bridge?.traceArtifacts?.length ?? 0,
      persistedTraceArtifacts: bridge?.studioEvidence?.stats?.persistedTraceArtifacts ?? 0,
      persistedTraceComparisons: bridge?.studioEvidence?.persistedTraceComparisons?.length ?? 0,
      firstPersistedTraceComparisonMatch: bridge?.studioEvidence?.persistedTraceComparisons?.[0]?.match,
      firstTraceComparisonMetricRows: bridge?.studioEvidence?.persistedTraceComparisons?.[0]?.summaryRows?.length ?? 0,
      firstTraceComparisonGateRows: bridge?.studioEvidence?.persistedTraceComparisons?.[0]?.gateComparisons?.length ?? 0,
      selectedTraceFrameIndex: bridge?.traceFrameScrubber?.selectedFrameIndex,
      traceFrameCount: bridge?.traceFrameScrubber?.totalFrames ?? 0,
      selectedTraceFrameChecksum: bridge?.traceFrameScrubber?.selectedFrame?.checksum,
      selectedTraceFrameDeltaActorChanges: bridge?.traceFrameScrubber?.selectedFrame?.delta?.actorChanges?.length ?? 0,
      selectedTraceFrameDeltaEventCount: bridge?.traceFrameScrubber?.selectedFrame?.delta?.eventCount ?? 0,
      traceFrameDeltaRows: document.querySelectorAll(".trace-frame-delta-row").length,
      selectedTraceFrameHasWorld: Boolean(bridge?.traceFrameScrubber?.selectedFrame?.world),
      traceWorldStatRows: document.querySelectorAll(".trace-world-stat").length,
      traceWorldEffectStoreRows: document.querySelectorAll(".trace-world-row").length,
      storedTraceEvidence: bridge?.storedTraceEvidence?.length ?? 0,
      latestTraceStatus: bridge?.traceArtifact?.status,
      latestTraceChecksum: bridge?.traceArtifact?.trace?.checksum,
      studioEvidenceStats: bridge?.studioEvidence?.stats,
      topEvidenceAction: bridge?.studioEvidence?.topAction?.label,
    };
  });
}

async function captureStudioAssets(page, outDir) {
  await selectStudioTab(page, "assets");
  const generatedFilter = page.locator('[data-asset-filter="generated"]').first();
  if (await generatedFilter.isVisible()) {
    await generatedFilter.evaluate((button) => button.click());
    await page.waitForTimeout(100);
  }
  const firstAsset = page.locator("[data-studio-asset-id]").first();
  if (await firstAsset.isVisible()) {
    await firstAsset.evaluate((button) => button.click());
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: path.join(outDir, "studio-assets.png"), fullPage: true });
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      title: document.title,
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      assetFilter: bridge?.studioAssets?.activeFilter,
      bodyHasAssets: document.body.innerText.includes("Asset Library"),
      bodyHasProjectAssets: document.body.innerText.includes("Project Assets"),
      bodyHasReadiness: document.body.innerText.includes("Asset Attention Queue"),
      bodyHasAssetDetail: document.body.innerText.includes("Asset Detail"),
      bodyHasReplacementFlow: document.body.innerText.includes("Replacement Flow"),
      bodyHasSourceRuntimeMap: document.body.innerText.includes("Source / Runtime Map"),
      bodyHasDependencyGraph: document.body.innerText.includes("Dependency Graph"),
      bodyHasDependencyDrilldown: document.body.innerText.includes("Dependency Drilldown"),
      bodyHasMissingReferences: document.body.innerText.includes("Missing / Partial References"),
      bodyHasRelatedEvidence: document.body.innerText.includes("Related Evidence"),
      bodyHasProvenance: document.body.innerText.includes("Provenance"),
      bodyHasNextAction: document.body.innerText.includes("Next action"),
      selectedAssetId: bridge?.studioAssets?.selectedAssetId,
      selectedAssetLabel: bridge?.studioAssets?.selectedAsset?.label,
      selectedAssetNextAction: bridge?.studioAssets?.selectedAsset?.nextAction?.label,
      selectedDependencies: bridge?.studioAssets?.selectedDependencies?.length ?? 0,
      dependencyGraphNodes: bridge?.studioAssets?.selectedDependencyGraph?.nodes?.length ?? 0,
      dependencyGraphEdges: bridge?.studioAssets?.selectedDependencyGraph?.edges?.length ?? 0,
      dependencyGraphAttention: bridge?.studioAssets?.selectedDependencyGraph?.stats?.attention ?? 0,
      replacementRole: bridge?.studioAssets?.replacementPlan?.role,
      replacementCandidates: bridge?.studioAssets?.replacementPlan?.candidates?.length ?? 0,
      sourceRuntimeRecords: bridge?.studioAssets?.sourceRuntimeMap?.records?.length ?? 0,
      sourceRuntimeLanes: bridge?.studioAssets?.sourceRuntimeMap?.lanes,
      provenanceSchema: bridge?.studioAssets?.provenance?.[0]?.schemaVersion,
      provenanceRecords: bridge?.studioAssets?.provenance?.length ?? 0,
      provenanceReady: bridge?.studioAssets?.provenance?.filter((record) => record.canExport).length ?? 0,
      provenanceInputFiles: bridge?.studioAssets?.provenance?.reduce((total, record) => total + (record.inputFiles?.length ?? 0), 0) ?? 0,
      provenanceOutputFiles: bridge?.studioAssets?.provenance?.reduce((total, record) => total + (record.outputFiles?.length ?? 0), 0) ?? 0,
      provenanceFilePathLeaks: (bridge?.studioAssets?.provenance ?? []).flatMap((record) => [
        ...(record.inputFiles ?? []),
        ...(record.outputFiles ?? []),
      ]).filter((file) => /^(?:[a-z]:\\|[a-z]:\/|file:|\/\/)/i.test(file.path ?? "")).length,
      selectedProvenanceStatus: bridge?.studioAssets?.selectedProvenance?.status,
      provenanceAbsolutePathLeaks: (bridge?.studioAssets?.provenance ?? []).filter((record) => /^(?:[a-z]:\\|[a-z]:\/|file:|\/\/)/i.test(record.sourceRef ?? "")).length,
      missingReferences: bridge?.studioAssets?.missingReferences?.length ?? 0,
      relatedEvidence: bridge?.studioAssets?.relatedEvidence?.length ?? 0,
      assetTotal: bridge?.studioAssets?.stats?.total ?? 0,
      visibleAssets: bridge?.studioAssets?.visibleAssets?.length ?? 0,
      attentionAssets: bridge?.studioAssets?.stats?.attention ?? 0,
      generatedAssets: bridge?.studioAssets?.stats?.generated ?? 0,
      importedAssets: bridge?.studioAssets?.stats?.imported ?? 0,
    };
  });
}

async function captureStudioAssetReplacement(context, baseUrl, outDir) {
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}${studioAssetsRoute}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => undefined);
    await waitForBridge(page);
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioTab === "assets");
    const generatedFilter = page.locator('[data-asset-filter="generated"]:visible').first();
    if (await generatedFilter.isVisible()) {
      await generatedFilter.evaluate((button) => button.click());
      await page.waitForTimeout(100);
    }
    const firstAsset = page.locator("[data-studio-asset-id]:visible").first();
    if (await firstAsset.isVisible()) {
      await firstAsset.evaluate((button) => button.click());
      await page.waitForTimeout(100);
    }
    const before = await page.evaluate(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      return {
        selected: bridge?.studioAssets?.selectedAssetId,
        entry: bridge?.project?.entry,
        replacementRole: bridge?.studioAssets?.replacementPlan?.role,
        replacementCandidates: bridge?.studioAssets?.replacementPlan?.candidates?.length ?? 0,
      };
    });
    const replacementButton = page.locator("[data-asset-replacement-id]:visible").first();
    const candidateId = (await replacementButton.isVisible({ timeout: 5000 }).catch(() => false))
      ? await replacementButton.getAttribute("data-asset-replacement-id")
      : undefined;
    let replacementSettled = false;
    if (candidateId) {
      await replacementButton.click({ timeout: 5000 });
      replacementSettled = await page
        .waitForFunction((id) => window.__MUGEN_WEB_SANDBOX__?.project?.entry?.p1 === id, candidateId, { timeout: 5000 })
        .then(() => true)
        .catch(() => false);
    }
    await page.screenshot({ path: path.join(outDir, "studio-assets-replacement.png"), fullPage: true });
    const after = await page.evaluate(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      return {
        selected: bridge?.studioAssets?.selectedAssetId,
        entry: bridge?.project?.entry,
        replacementRole: bridge?.studioAssets?.replacementPlan?.role,
        replacementCandidates: bridge?.studioAssets?.replacementPlan?.candidates?.length ?? 0,
        bodyHasReplacementFlow: document.body.innerText.includes("Replacement Flow"),
        bodyHasRefreshNotice: document.body.innerText.includes("compile and trace outputs need refresh"),
      };
    });
    return {
      before,
      after,
      candidateId,
      replacementSettled,
      applied: Boolean(candidateId && after.entry?.p1 === candidateId && after.selected === candidateId),
    };
  } finally {
    await page.close();
  }
}

async function captureStudioProjectStorageConflict(context, baseUrl, outDir) {
  const primary = await context.newPage();
  const remote = await context.newPage();
  const projectId = "qa-authored-fight-project";
  try {
    await Promise.all([
      primary.goto(`${baseUrl}${studioWorkbenchRoute}`, { waitUntil: "domcontentloaded" }),
      remote.goto(`${baseUrl}${studioWorkbenchRoute}`, { waitUntil: "domcontentloaded" }),
    ]);
    await Promise.all([waitForBridge(primary), waitForBridge(remote)]);
    for (const candidate of [primary, remote]) {
      await candidate.locator(`[data-stored-project-id="${projectId}"]`).first().evaluate((element) => element.click());
      await candidate.waitForFunction((id) => window.__MUGEN_WEB_SANDBOX__?.project?.id === id, projectId);
    }

    const baselineRevision = await primary.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision ?? 0);
    const remoteBaselineRevision = await remote.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision ?? 0);
    if (baselineRevision !== remoteBaselineRevision) {
      throw new Error(`Project storage baseline diverged (${baselineRevision} vs ${remoteBaselineRevision})`);
    }

    const remoteNameOne = "QA Remote Revision One";
    await remote.locator("[data-project-name]").first().fill(remoteNameOne);
    await remote.locator("[data-project-name]").first().press("Tab");
    await remote.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.projectDirty === true);
    await remote.locator('[data-action="save-project-local"]').first().click();
    await remote.waitForFunction(
      (expectedRevision) =>
        window.__MUGEN_WEB_SANDBOX__?.projectDirty === false &&
        window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision === expectedRevision + 1,
      baselineRevision,
    );
    const remoteRevisionOne = await remote.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision ?? 0);
    await primary.waitForFunction(
      (expectedRevision) => {
        const conflict = window.__MUGEN_WEB_SANDBOX__?.projectStorageConflict;
        return conflict?.expectedRevision === expectedRevision && conflict.actualRevision === expectedRevision + 1;
      },
      baselineRevision,
    );
    const cleanExternal = await primary.evaluate(() => ({
      dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
      conflict: window.__MUGEN_WEB_SANDBOX__?.projectStorageConflict,
      pending: window.__MUGEN_WEB_SANDBOX__?.studioAutosave?.pending,
    }));
    await primary.locator('[data-action="reload-project-remote"]').first().click();
    await primary.waitForFunction(
      (expectedRevision) => {
        const bridge = window.__MUGEN_WEB_SANDBOX__;
        return bridge?.projectDirty === false && bridge.projectStorageRevision === expectedRevision && !bridge.projectStorageConflict;
      },
      remoteRevisionOne,
    );
    const reloadedRemote = await primary.evaluate(() => ({
      dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
      conflict: window.__MUGEN_WEB_SANDBOX__?.projectStorageConflict,
      revision: window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision,
      projectName: window.__MUGEN_WEB_SANDBOX__?.project?.name,
    }));

    const localName = "QA Local Pending Conflict";
    await primary.locator("[data-project-name]").first().fill(localName);
    await primary.locator("[data-project-name]").first().press("Tab");
    await primary.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.projectDirty === true);

    const remoteNameTwo = "QA Remote Revision Two";
    await remote.locator("[data-project-name]").first().fill(remoteNameTwo);
    await remote.locator("[data-project-name]").first().press("Tab");
    await remote.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.projectDirty === true);
    await remote.locator('[data-action="save-project-local"]').first().click();
    await remote.waitForFunction(
      (expectedRevision) =>
        window.__MUGEN_WEB_SANDBOX__?.projectDirty === false &&
        window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision === expectedRevision + 1,
      remoteRevisionOne,
    );
    const remoteRevisionTwo = await remote.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision ?? 0);
    await primary.waitForFunction(
      (expectedRevision) => {
        const bridge = window.__MUGEN_WEB_SANDBOX__;
        return bridge?.projectDirty === true && bridge.projectStorageConflict?.actualRevision === expectedRevision;
      },
      remoteRevisionTwo,
    );
    const dirtyExternal = await primary.evaluate(() => ({
      dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
      pending: window.__MUGEN_WEB_SANDBOX__?.studioAutosave?.pending,
      projectName: window.__MUGEN_WEB_SANDBOX__?.project?.name,
      conflict: window.__MUGEN_WEB_SANDBOX__?.projectStorageConflict,
    }));

    await primary.locator('[data-action="save-project-local"]').first().click();
    await primary.waitForTimeout(150);
    const rejectedSave = await primary.evaluate(({ key, projectId: id }) => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const raw = localStorage.getItem(key);
      const entry = raw ? JSON.parse(raw).entries?.find((candidate) => candidate.id === id) : undefined;
      return {
        dirty: bridge?.projectDirty,
        projectName: bridge?.project?.name,
        conflict: bridge?.projectStorageConflict,
        storedName: entry?.name,
        storedRevision: entry?.revision,
      };
    }, { key: "mugen-web-sandbox:projects:v0", projectId });
    await primary.locator('[data-action="keep-project-local"]').first().click();
    await primary.waitForFunction(
      () => {
        const bridge = window.__MUGEN_WEB_SANDBOX__;
        return bridge?.projectDirty === false && !bridge.projectStorageConflict && bridge.project?.id !== "qa-authored-fight-project";
      },
    );
    const keptLocal = await primary.evaluate(({ key, originalId }) => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const raw = localStorage.getItem(key);
      const entries = raw ? JSON.parse(raw).entries ?? [] : [];
      const entry = entries.find((candidate) => candidate.id === bridge?.project?.id);
      return {
        projectId: bridge?.project?.id,
        projectName: bridge?.project?.name,
        dirty: bridge?.projectDirty,
        revision: bridge?.projectStorageRevision,
        conflict: bridge?.projectStorageConflict,
        originalStillPresent: entries.some((candidate) => candidate.id === originalId),
        storedName: entry?.name,
        storedRevision: entry?.revision,
      };
    }, { key: "mugen-web-sandbox:projects:v0", originalId: projectId });
    await primary.screenshot({ path: path.join(outDir, "studio-project-storage-conflict.png"), fullPage: true });

    return {
      projectId,
      baselineRevision,
      remoteRevisionOne,
      remoteRevisionTwo,
      cleanExternal,
      reloadedRemote,
      dirtyExternal,
      rejectedSave,
      keptLocal,
      cleanExternalDetected:
        cleanExternal.dirty === false &&
        cleanExternal.conflict?.expectedRevision === baselineRevision &&
        cleanExternal.conflict?.actualRevision === remoteRevisionOne,
      remoteReloadResolved:
        reloadedRemote.dirty === false &&
        !reloadedRemote.conflict &&
        reloadedRemote.revision === remoteRevisionOne &&
        reloadedRemote.projectName === remoteNameOne,
      dirtyExternalDetected:
        dirtyExternal.dirty === true &&
        dirtyExternal.pending === false &&
        dirtyExternal.projectName === localName &&
        dirtyExternal.conflict?.actualRevision === remoteRevisionTwo,
      staleSaveRejected:
        rejectedSave.dirty === true &&
        rejectedSave.projectName === localName &&
        rejectedSave.storedName === remoteNameTwo &&
        rejectedSave.storedRevision === remoteRevisionTwo,
      localCopyResolved:
        keptLocal.dirty === false &&
        !keptLocal.conflict &&
        keptLocal.projectId !== projectId &&
        keptLocal.projectName === `${localName} (Local copy)` &&
        keptLocal.revision === 1 &&
        keptLocal.storedName === `${localName} (Local copy)` &&
        keptLocal.storedRevision === 1 &&
        keptLocal.originalStillPresent,
    };
  } finally {
    await Promise.all([primary.close(), remote.close()]);
  }
}

async function captureStudioDebug(page, baseUrl, outDir, importedFixturePath) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await waitForBridge(page);
  if (importedFixturePath) {
    const hasImportedCharacter = await page.evaluate(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.character));
    if (!hasImportedCharacter) {
      await page.locator("#zip-input").setInputFiles(importedFixturePath);
      await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.character));
      await page.locator('[data-mode="studio"]').first().click();
      await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
    }
  }
  if (!(await studioTabLocator(page, "debug").isVisible().catch(() => false))) {
    const studioMode = page.locator('[data-mode="studio"]').first();
    if (await studioMode.isVisible().catch(() => false)) {
      await studioMode.click();
      await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
    }
  }
  if (!(await studioTabLocator(page, "debug").isVisible().catch(() => false))) {
    await page.goto(`${baseUrl}${studioDebugRoute}`, { waitUntil: "domcontentloaded" });
    await waitForBridge(page);
  }
  await selectStudioTab(page, "debug");
  await page.locator('[data-debug-actor-id="p2"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioDebug?.selectedActorId === "p2");
  const p2Probe = await readStudioDebugBridge(page);
  await page.locator('[data-debug-actor-id="p1"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioDebug?.selectedActorId === "p1");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-debug.png"), fullPage: true });
  await scrollLiveSelectorIntoView(page, '[data-debug-execution-evidence="p1"]');
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outDir, "studio-debug-evidence.png"), fullPage: true });
  const p1Probe = await readStudioDebugBridge(page);
  const debugLenses = {
    targets: await captureStudioDebugLens(page, "targets", outDir),
    effects: await captureStudioDebugLens(page, "effects", outDir),
    pause: await captureStudioDebugLens(page, "pause", outDir),
    audio: await captureStudioDebugLens(page, "audio", outDir),
  };
  const worldEvidenceJump = await captureStudioDebugWorldEvidenceJump(page);
  await selectStudioTab(page, "debug");
  await page.locator('[data-debug-actor-id="p1"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioDebug?.selectedActorId === "p1");
  await page.locator('[data-debug-filter="overview"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioDebugFilter === "overview");
  await page.setViewportSize({ width: 390, height: 920 });
  await scrollLiveSelectorIntoView(page, '[data-debug-execution-evidence="p1"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-debug-evidence-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 960 });
  await scrollLiveSelectorIntoView(page, '[data-debug-execution-evidence="p1"]');
  await page.waitForTimeout(100);
  await page.locator('[data-debug-controller-filter="hitdef"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "inspect");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-debug-inspector-jump.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 920 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outDir, "studio-debug-inspector-jump-mobile.png"), fullPage: true });
  const inspectorJump = await evaluateWithStableBridge(page, () => ({
    mode: window.__MUGEN_WEB_SANDBOX__?.mode,
    url: window.location.search,
    filterValue: document.querySelector('input[data-filter="navigator"]')?.value,
    bodyHasStateBrowser: document.body.innerText.includes("States"),
    bodyHasHitDef: document.body.innerText.includes("HitDef"),
    selectedState: document.querySelector("[data-inspector-selected-state]")?.getAttribute("data-inspector-selected-state"),
    selectedController: document
      .querySelector("[data-inspector-selected-controller]")
      ?.getAttribute("data-inspector-selected-controller"),
    selectedControllerLine: document
      .querySelector("[data-inspector-selected-controller]")
      ?.getAttribute("data-inspector-controller-line"),
    bodyHasControllerDetail: Boolean(document.querySelector(".state-controller-detail-list")),
  }));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.locator('[data-mode="studio"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
  await selectStudioTab(page, "debug");
  await page.locator('[data-debug-actor-id="p1"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioDebug?.selectedActorId === "p1");
  await page.locator('[data-debug-command-history="p1"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const commandHistory = await evaluateWithStableBridge(page, () => ({
    bodyHasCommandHistory: Boolean(document.querySelector('[data-debug-command-history="p1"]')),
    sampleRows: document.querySelectorAll(".debug-input-row").length,
    commandLinks: document.querySelectorAll("[data-debug-command-filter]").length,
  }));
  await page.locator("[data-debug-command-filter]").first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "inspect");
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, "studio-debug-command-jump.png"), fullPage: true });
  const commandJump = await page.evaluate(() => ({
    mode: window.__MUGEN_WEB_SANDBOX__?.mode,
    url: window.location.search,
    filterValue: document.querySelector('input[data-filter="navigator"]')?.value,
    selectedCommand: document.querySelector("[data-inspector-selected-command]")?.getAttribute("data-inspector-selected-command"),
    bodyHasCommandDetail: Boolean(document.querySelector(".command-detail")),
  }));
  return {
    ...p1Probe,
    inspectorJump,
    commandHistory,
    commandJump,
    debugLenses,
    worldEvidenceJump,
    p2Probe: {
      selectedDebugActorId: p2Probe.selectedDebugActorId,
      selectedDebugActorLabel: p2Probe.selectedDebugActorLabel,
      selectedDebugActorKind: p2Probe.selectedDebugActorKind,
      selectedDebugTargetLinks: p2Probe.selectedDebugTargetLinks,
      bodyHasActorDetail: p2Probe.bodyHasActorDetail,
    },
  };
}

async function captureStudioDebugWorldEvidenceJump(page) {
  await page.locator('[data-debug-filter="effects"]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioDebugFilter === "effects");
  await page.locator('[data-debug-world-evidence="effects"] [data-trace-frame-index]').first().click();
  await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioTab === "evidence");
  await page.waitForTimeout(100);
  return page.evaluate(() => ({
    mode: window.__MUGEN_WEB_SANDBOX__?.mode,
    studioTab: window.__MUGEN_WEB_SANDBOX__?.studioTab,
    selectedTraceFrameIndex: window.__MUGEN_WEB_SANDBOX__?.traceFrameScrubber?.selectedFrameIndex,
    selectedTraceFrameHasWorld: Boolean(window.__MUGEN_WEB_SANDBOX__?.traceFrameScrubber?.selectedFrame?.world),
    selectedTraceFrameEffectStores:
      window.__MUGEN_WEB_SANDBOX__?.traceFrameScrubber?.selectedFrame?.world?.effectStores?.length ?? 0,
    bodyHasTraceFrameScrubber: document.body.innerText.includes("Trace Frame Scrubber"),
  }));
}

async function captureStudioDebugLens(page, filter, outDir) {
  await page.locator(`[data-debug-filter="${filter}"]`).first().click();
  await page.waitForFunction((expected) => window.__MUGEN_WEB_SANDBOX__?.studioDebugFilter === expected, filter);
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outDir, `studio-debug-${filter}.png`), fullPage: true });
  return page.evaluate((expected) => {
    const panel = document.querySelector(`[data-debug-filter-panel="${expected}"]`);
    return {
      filter: window.__MUGEN_WEB_SANDBOX__?.studioDebugFilter,
      url: window.location.search,
      bodyHasPanel: Boolean(panel),
      selectedButtonPressed: document.querySelector(`[data-debug-filter="${expected}"]`)?.getAttribute("aria-pressed"),
      targetRows: panel?.querySelectorAll(".debug-target-row").length ?? 0,
      effectRows: panel?.querySelectorAll(".debug-effect-row").length ?? 0,
      effectStoreRows: panel?.querySelectorAll(".debug-effect-store-row").length ?? 0,
      eventRows: panel?.querySelectorAll(".debug-event-row").length ?? 0,
      worldEvidence: Boolean(panel?.querySelector(`[data-debug-world-evidence="${expected}"]`)),
      targetGateEvidence: Boolean(panel?.querySelector('[data-debug-world-evidence="targets-gate"]')),
      targetGateEvidenceRows: panel?.querySelectorAll("[data-debug-target-binding-evidence]").length ?? 0,
      worldFrameRows: panel?.querySelectorAll("[data-debug-world-evidence] .debug-world-frame-row").length ?? 0,
      worldFrameButtons: panel?.querySelectorAll("[data-debug-world-evidence] [data-trace-frame-index]").length ?? 0,
      compatRows: panel?.querySelectorAll(".compat-row").length ?? 0,
      effectDrilldown: Boolean(panel?.querySelector("[data-debug-effect-drilldown]")),
      effectDrilldownKind: panel?.querySelector("[data-debug-effect-drilldown]")?.getAttribute("data-debug-effect-drilldown") ?? "",
      bodyHasEffectDrilldownCopy: panel?.textContent?.includes("Selected effect drilldown") ?? false,
      hitPauseRows: panel?.querySelectorAll("[data-debug-hitpause-row]").length ?? 0,
      hitPauseCountText: panel?.querySelector("[data-debug-hitpause-count]")?.textContent?.trim() ?? "",
      bodyHasHitPauseCopy: panel?.textContent?.includes("HitPause") ?? false,
      bodyHasTargetGateEvidenceCopy: panel?.textContent?.includes("Trace target gate evidence") ?? false,
      hasEmptyState: Boolean(panel?.querySelector(".empty-state")),
    };
  }, filter);
}

async function readStudioDebugBridge(page) {
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      title: document.title,
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      studioDebugFilter: bridge?.studioDebugFilter,
      bodyHasDebug: document.body.innerText.includes("Runtime Debug Studio"),
      bodyHasDebugLens: Boolean(document.querySelector("[data-debug-filter-panel]")),
      bodyHasActorRegistry: document.body.innerText.includes("Actor Registry"),
      bodyHasActorExplorer: document.body.innerText.includes("Actor Explorer"),
      bodyHasActorDetail: Boolean(document.querySelector(`[data-debug-selected-actor="${bridge?.studioDebug?.selectedActorId}"]`)),
      bodyHasExecutionEvidence: Boolean(document.querySelector("[data-debug-execution-evidence]")),
      bodyHasTraceEvidence: Boolean(document.querySelector("[data-debug-trace-evidence]")),
      bodyHasLinkedTraceFrame: Boolean(document.querySelector("[data-trace-frame-index]")),
      bodyHasCommandHistory: Boolean(document.querySelector("[data-debug-command-history]")),
      selectedDebugActorId: bridge?.studioDebug?.selectedActorId,
      selectedDebugActorLabel: bridge?.studioDebug?.selectedActor?.label,
      selectedDebugActorKind: bridge?.studioDebug?.selectedActor?.kind,
      selectedDebugActorState: bridge?.studioDebug?.selectedActor?.stateNo,
      selectedDebugOwnedActors: bridge?.studioDebug?.ownedActors?.length ?? 0,
      selectedDebugTargetLinks: bridge?.studioDebug?.relatedTargetLinks?.length ?? 0,
      selectedDebugRecentEvents: bridge?.studioDebug?.recentEvents?.length ?? 0,
      selectedDebugSessionActorId: bridge?.studioDebug?.runtimeSession?.actorId,
      selectedDebugExecutedStates: bridge?.studioDebug?.runtimeSession?.executedStates?.length ?? 0,
      selectedDebugRoutedStates: bridge?.studioDebug?.runtimeSession?.routedStates?.length ?? 0,
      selectedDebugExecutedControllerKeys: Object.keys(bridge?.studioDebug?.runtimeSession?.executedControllers ?? {}),
      selectedDebugExecutedOperationKeys: Object.keys(bridge?.studioDebug?.runtimeSession?.executedOperations ?? {}),
      selectedDebugActiveCommands: bridge?.studioDebug?.runtimeSession?.activeCommands ?? [],
      selectedDebugCommandHistorySamples: bridge?.studioDebug?.runtimeSession?.commandHistory?.length ?? 0,
      selectedDebugTraceChecksum: bridge?.studioDebug?.traceEvidence?.traceChecksum,
      selectedDebugTraceFrames: bridge?.studioDebug?.traceEvidence?.frames?.length ?? 0,
      selectedDebugTraceGateLinks: bridge?.studioDebug?.traceEvidence?.gates?.length ?? 0,
      selectedDebugTraceFinalActorId: bridge?.studioDebug?.traceEvidence?.finalActor?.id,
      selectedDebugTraceControllerKeys: bridge?.studioDebug?.traceEvidence?.controllerKeys ?? [],
      selectedDebugTraceOperationKeys: bridge?.studioDebug?.traceEvidence?.operationKeys ?? [],
      actorRegistryCount: bridge?.actorRegistry?.actors?.length ?? 0,
      actorRegistryPlayers: bridge?.actorRegistry?.players?.length ?? 0,
      actorRegistryKinds: bridge?.actorRegistry?.byKind,
      actorRegistryLifecycleLive: bridge?.actorRegistry?.lifecycle?.live?.length ?? 0,
      actorRegistryLifecycleStatuses: bridge?.actorRegistry?.actors?.map((actor) => actor.lifecycle?.status) ?? [],
      actorRegistryLifecycleEvents: bridge?.actorRegistry?.lifecycle?.eventsThisTick?.length ?? 0,
      actorRegistryRecentLifecycleEvents: bridge?.actorRegistry?.lifecycle?.recentEvents?.length ?? 0,
      actorRegistryTargetLinks: bridge?.actorRegistry?.targetLinks?.length ?? 0,
      actorRegistryTargetOwners: bridge?.actorRegistry?.targetLinks?.map((link) => link.ownerId) ?? [],
      actorRegistryEffectStores: bridge?.actorRegistry?.effectStores?.length ?? 0,
      actorRegistryEffectStoreOwners: bridge?.actorRegistry?.effectStores?.map((store) => store.ownerId) ?? [],
    };
  });
}

async function waitForBridge(page) {
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.renderer), null, { timeout: 15000 });
}

async function waitForRuntimeTicks(page, minimumTick) {
  await page.waitForFunction(
    (minimum) => (window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick ?? -1) >= minimum,
    minimumTick,
    { timeout: 15000 },
  );
}

async function scrollLiveSelectorIntoView(page, selector) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
    const scrolled = await page.evaluate((targetSelector) => {
      const target = document.querySelector(targetSelector);
      if (!(target instanceof HTMLElement)) {
        return false;
      }
      target.scrollIntoView({ block: "center", inline: "nearest" });
      return true;
    }, selector);
    if (scrolled) {
      return;
    }
    await page.waitForTimeout(100);
  }
  await page.locator(selector).first().scrollIntoViewIfNeeded();
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
    if (!context) {
      return { nonBlank: false, uniqueColors: 0, width: image.naturalWidth, height: image.naturalHeight };
    }
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
    const colors = new Set();
    const stride = Math.max(4, Math.floor(data.length / 1600 / 4) * 4);
    let nonBlank = false;
    for (let i = 0; i < data.length; i += stride) {
      colors.add(`${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`);
      if (data[i + 3] !== 0 && (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0)) {
        nonBlank = true;
      }
    }
    return { nonBlank, uniqueColors: colors.size, width: sampleCanvas.width, height: sampleCanvas.height };
  }, `data:image/png;base64,${canvasPng.toString("base64")}`);
}

function fixturePaletteForSprite(group, index) {
  const seed = MUGEN_LITE_FIXTURE_SPRITES.findIndex(([fixtureGroup, fixtureIndex]) =>
    fixtureGroup === group && fixtureIndex === index,
  );
  if (seed < 0) return [];
  return [[(seed * 47) % 255, 180, 240], [240, (seed * 71) % 255, 120], [80, 220, (seed * 29) % 255]];
}

async function getProjectedSpritePixelStats(page, canvasPng, presentation, rendererSize, camera, expectedColors) {
  return page.evaluate(async ({ dataUrl, presentation, rendererSize, camera, expectedColors }) => {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = image.naturalWidth;
    sampleCanvas.height = image.naturalHeight;
    const context = sampleCanvas.getContext("2d");
    if (!context || !presentation || !rendererSize || !camera) {
      return { sampledPixels: 0, fixtureColorPixels: 0, uniqueColors: 0 };
    }
    context.drawImage(image, 0, 0);
    const worldHeight = Math.max(rendererSize.height, 420);
    const scale = rendererSize.height / worldHeight * camera.zoom;
    const centerX = rendererSize.width / 2 + (presentation.meshPosition.x - camera.x) * scale;
    const centerY = rendererSize.height / 2 - (presentation.meshPosition.y - camera.y) * scale;
    const width = Math.max(1, Math.abs(presentation.meshScale.x) * scale);
    const height = Math.max(1, Math.abs(presentation.meshScale.y) * scale);
    const left = Math.max(0, Math.floor(centerX - width / 2));
    const top = Math.max(0, Math.floor(centerY - height / 2));
    const right = Math.min(sampleCanvas.width, Math.ceil(centerX + width / 2));
    const bottom = Math.min(sampleCanvas.height, Math.ceil(centerY + height / 2));
    const data = context.getImageData(left, top, Math.max(1, right - left), Math.max(1, bottom - top)).data;
    const colors = new Set();
    const expectedColorPixels = expectedColors.map(() => 0);
    const exactExpectedColorPixels = expectedColors.map(() => 0);
    let fixtureColorPixels = 0;
    let fixtureMaskChecksum = 0x811c9dc5;
    for (let offset = 0; offset < data.length; offset += 4) {
      const color = [data[offset], data[offset + 1], data[offset + 2]];
      colors.add(color.join(","));
      const paletteIndex = expectedColors.findIndex((candidate) => candidate.every((channel, index) => Math.abs(channel - color[index]) <= 60));
      if (paletteIndex >= 0) {
        fixtureColorPixels += 1;
        expectedColorPixels[paletteIndex] += 1;
        fixtureMaskChecksum ^= offset / 4 + paletteIndex * 65537;
        fixtureMaskChecksum = Math.imul(fixtureMaskChecksum, 0x01000193) >>> 0;
      }
      const exactPaletteIndex = expectedColors.findIndex((candidate) => candidate.every((channel, index) => channel === color[index]));
      if (exactPaletteIndex >= 0) exactExpectedColorPixels[exactPaletteIndex] += 1;
    }
    return {
      sampledPixels: data.length / 4,
      fixtureColorPixels,
      fixtureMaskChecksum: fixtureMaskChecksum.toString(16).padStart(8, "0"),
      expectedColorPixels,
      exactExpectedColorPixels,
      uniqueColors: colors.size,
      rect: { left, top, width: right - left, height: bottom - top },
    };
  }, {
    dataUrl: `data:image/png;base64,${canvasPng.toString("base64")}`,
    presentation,
    rendererSize,
    camera,
    expectedColors,
  });
}

function getRelevantConsoleIssues(logs) {
  return logs.filter((log) => {
    if (log.type === "error") {
      return true;
    }
    if (log.type !== "warning") {
      return false;
    }
    return !isKnownBenignWarning(log.text);
  });
}

function isKnownBenignWarning(text) {
  return text.includes("GL Driver Message") && text.includes("ReadPixels");
}

function assertSmoke(diagnostics) {
  const failures = [];
  const {
    runtimeDesktop,
    runtimeMobile,
    mugenLiteVisual,
    codeFuManVisual,
    tagPresentation,
    studioWorkbench,
    studioWorkbenchTablet,
    commandPaletteA11y,
    studioBuild,
    studioModules,
    studioSourceRelink,
    studioFolderHandleRecovery,
    ikemenScan,
    studioStage,
    studioAssets,
    studioReplacement,
    studioEvidence,
    studioDebug,
  } = diagnostics.checks;
  const studioSourceRelinkIdentity = studioSourceRelink?.after?.identity?.find((identity) => identity.id === "kfm-official");
  const studioSourceRelinkHandle = studioSourceRelink?.after?.sourceHandles?.find((handle) => handle.sourcePackageId === "kfm-official");
  for (const runtime of [runtimeDesktop, runtimeMobile]) {
    if (runtime.mode !== "match" || !runtime.bodyHasRuntime || !runtime.bodyHasP1 || !runtime.bodyHasP2) {
      failures.push(`${runtime.label}: runtime shell or roster text missing`);
    }
    if (!runtime.canvasPixels.nonBlank || runtime.canvasPixels.uniqueColors < 10) {
      failures.push(`${runtime.label}: canvas looked blank or too flat`);
    }
    if (runtime.actorCount < 2) {
      failures.push(`${runtime.label}: expected at least two actors`);
    }
    const hudActorIds = runtime.hudRedLifeBars.map((bar) => bar.actorId);
    const expectedHudActorIds = runtime.actors.map((actor) => actor.id);
    if (
      runtime.hudRedLifeBars.length < runtime.actorCount ||
      !expectedHudActorIds.every((actorId) => hudActorIds.includes(actorId)) ||
      runtime.hudRedLifeBars.some((bar) => !bar.ariaLabel?.startsWith("Recoverable life "))
    ) {
      failures.push(`${runtime.label}: red-life HUD bars were missing an actor binding or accessible value`);
    }
    if (
      runtime.tickSchedule?.schema !== "MatchTickSchedule/v0" ||
      runtime.tickSchedule?.behaviorChecksumProjection !== "excluded" ||
      runtime.tickSchedule?.observationScope !== "last-executed-tick-observed-phases" ||
      runtime.tickSchedule?.branch === "idle" ||
      !runtime.tickSchedule?.phases?.length ||
      runtime.tickSchedule.phases.some(
        (phase) => !phase.owner || !Array.isArray(phase.mutableStores) || !phase.sideEffects?.length,
      )
    ) {
      failures.push(`${runtime.label}: MatchTickSchedule/v0 bridge diagnostics were incomplete`);
    }
    if (!runtime.bodyHasActorRegistry || runtime.actorRegistryCount < 2 || runtime.actorRegistryPlayers < 2) {
      failures.push(`${runtime.label}: actor registry was not visible or did not expose both players`);
    }
    if (runtime.actorRegistryLifecycleLive < 2 || !runtime.actorRegistryLifecycleStatuses.includes("active")) {
      failures.push(`${runtime.label}: actor registry lifecycle did not expose live active actors`);
    }
    if (runtime.actorRegistryLifecycleEvents < 2 || runtime.actorRegistryRecentLifecycleEvents < 2) {
      failures.push(`${runtime.label}: actor registry lifecycle event stream was missing`);
    }
    if (runtime.actorRegistryEffectStores < 2 || !runtime.actorRegistryEffectStoreOwners.includes("p1")) {
      failures.push(`${runtime.label}: actor registry effect stores were missing`);
    }
    if (runtime.activeHitSparks < 1) {
      failures.push(`${runtime.label}: native hit spark renderer did not expose an active spark after KeyA`);
    }
    if ((runtime.hitSparkSources?.player ?? 0) < 1) {
      failures.push(`${runtime.label}: native hit spark renderer did not expose player AIR spark source metadata`);
    }
    if ((runtime.hitSparkResolvedSprites ?? 0) < 1) {
      failures.push(`${runtime.label}: native hit spark renderer did not resolve a player AIR spark sprite`);
    }
    const spriteAxisFailures = runtime.characterPresentations.filter((presentation) => {
      const expectedX =
        presentation.actorPosition.x +
        presentation.facing *
          (presentation.frameOffset.x + presentation.sprite.width / 2 - presentation.sprite.axisX) *
          presentation.renderScale.x;
      const expectedY =
        -presentation.actorPosition.y +
        (presentation.sprite.axisY - presentation.sprite.height / 2 - presentation.frameOffset.y) * presentation.renderScale.y;
      const expectedScaleX = presentation.sprite.width * presentation.renderScale.x * presentation.facing;
      const expectedScaleY = presentation.sprite.height * presentation.renderScale.y;
      const boundedPriority = Math.max(-5, Math.min(10, Math.round(presentation.spritePriority)));
      const expectedZ = 1 + boundedPriority * 0.05 + presentation.orderBias;
      return (
        Math.abs(presentation.meshPosition.x - expectedX) > 0.001 ||
        Math.abs(presentation.meshPosition.y - expectedY) > 0.001 ||
        Math.abs(presentation.meshScale.x - expectedScaleX) > 0.001 ||
        Math.abs(presentation.meshScale.y - expectedScaleY) > 0.001 ||
        Math.abs(presentation.meshPosition.z - expectedZ) > 0.001
      );
    });
    const presentationFacings = new Set(runtime.characterPresentations.map((presentation) => presentation.facing));
    if (runtime.characterPresentations.length < 2 || !presentationFacings.has(1) || !presentationFacings.has(-1) || spriteAxisFailures.length) {
      failures.push(`${runtime.label}: Three.js character sprite axis/facing presentation failed the independent projection oracle`);
    }
    const presentationOrderFailures = runtime.characterPresentations.filter((presentation) => {
      const semantic = presentation.presentationOrder?.semantic;
      const effective = presentation.presentationOrder?.three;
      const expectedRenderOrder = expectedPresentationRenderOrder(semantic);
      const shadowSemantic = presentation.shadow?.presentationOrder?.semantic;
      const shadowEffective = presentation.shadow?.presentationOrder?.three;
      const expectedShadowRenderOrder = expectedPresentationRenderOrder(shadowSemantic);
      return (
        semantic?.schema !== "MugenPresentationOrder/v0" ||
        semantic.phase !== "actor" ||
        effective?.renderOrder !== expectedRenderOrder ||
        effective?.boundedPriority !== Math.max(-9_999, Math.min(9_999, semantic.priority)) ||
        effective?.boundedTieBreaker !== Math.max(-49, Math.min(49, semantic.tieBreaker)) ||
        presentation.meshRenderOrder !== expectedRenderOrder ||
        presentation.material?.transparent !== true ||
        presentation.material?.depthTest !== false ||
        presentation.material?.depthWrite !== false ||
        shadowSemantic?.phase !== "actor-underlay" ||
        shadowEffective?.renderOrder !== expectedShadowRenderOrder ||
        presentation.shadow?.meshRenderOrder !== expectedShadowRenderOrder ||
        presentation.shadow?.material?.depthTest !== false ||
        presentation.shadow?.material?.depthWrite !== false
      );
    });
    const stageOrderFailures = runtime.stagePresentations.filter((presentation) => {
      const semantic = presentation.presentationOrder?.semantic;
      const expectedRenderOrder = expectedPresentationRenderOrder(semantic);
      const expectedPhase = presentation.layerNo > 0 ? "stage-foreground" : "stage-background";
      return (
        semantic?.schema !== "MugenPresentationOrder/v0" ||
        semantic.phase !== expectedPhase ||
        semantic.priority !== presentation.authoredOrder ||
        presentation.presentationOrder?.three?.renderOrder !== expectedRenderOrder ||
        presentation.presentationOrder?.three?.boundedPriority !== Math.max(-9_999, Math.min(9_999, semantic.priority)) ||
        presentation.presentationOrder?.three?.boundedTieBreaker !== Math.max(-49, Math.min(49, semantic.tieBreaker)) ||
        presentation.meshRenderOrders?.some((renderOrder) => renderOrder !== expectedRenderOrder)
      );
    });
    if (presentationOrderFailures.length || stageOrderFailures.length) {
      failures.push(`${runtime.label}: semantic presentation order did not match effective Three.js adapter state`);
    }
    const orderedPresentations = [...runtime.characterPresentations].sort((left, right) => left.spritePriority - right.spritePriority);
    if (
      orderedPresentations.length >= 2 &&
      orderedPresentations[0].spritePriority < orderedPresentations.at(-1).spritePriority &&
      orderedPresentations[0].meshRenderOrder >= orderedPresentations.at(-1).meshRenderOrder
    ) {
      failures.push(`${runtime.label}: higher SprPriority character was not rendered in front`);
    }
    const resolvedPresentation = runtime.hitSparkPresentations.find(
      (presentation) =>
        presentation.lookupStatus === "resolved-sprite" &&
        presentation.assetFrame?.spriteGroup !== undefined &&
        presentation.assetFrame?.spriteIndex !== undefined &&
        presentation.sprite?.axisX !== undefined &&
        presentation.sprite?.axisY !== undefined &&
        presentation.spriteLocalPosition?.x !== undefined &&
        presentation.spriteLocalPosition?.y !== undefined,
    );
    if (!resolvedPresentation) {
      failures.push(`${runtime.label}: native hit spark renderer did not expose resolved sprite frame/axis diagnostics`);
    } else {
      const sparkRenderOrder = expectedPresentationRenderOrder(resolvedPresentation.presentationOrder?.semantic);
      const stageBackOrders = runtime.stagePresentations
        .filter((presentation) => presentation.presentationOrder?.semantic?.phase === "stage-background")
        .map((presentation) => presentation.presentationOrder.three.renderOrder);
      const actorOrders = runtime.characterPresentations.map((presentation) => presentation.meshRenderOrder);
      const actorUnderlayOrders = runtime.characterPresentations.map((presentation) => presentation.shadow?.meshRenderOrder);
      const stageFrontOrders = runtime.stagePresentations
        .filter((presentation) => presentation.presentationOrder?.semantic?.phase === "stage-foreground")
        .map((presentation) => presentation.presentationOrder.three.renderOrder);
      const meshOrders = resolvedPresentation.meshRenderOrders ?? [];
      if (
        resolvedPresentation.presentationOrder?.semantic?.phase !== "effect" ||
        resolvedPresentation.renderOrder !== sparkRenderOrder ||
        resolvedPresentation.groupRenderOrder !== 0 ||
        !meshOrders.includes(sparkRenderOrder) ||
        stageBackOrders.length < 1 ||
        actorUnderlayOrders.some((renderOrder) => !Number.isFinite(renderOrder)) ||
        actorOrders.length < 2 ||
        stageFrontOrders.length < 1 ||
        Math.max(...stageBackOrders) >= Math.min(...actorUnderlayOrders) ||
        Math.max(...actorUnderlayOrders) >= Math.min(...actorOrders) ||
        Math.max(...actorOrders) >= sparkRenderOrder ||
        sparkRenderOrder >= Math.min(...stageFrontOrders)
      ) {
        failures.push(`${runtime.label}: stage/player/effect presentation phases did not produce a strict effective order`);
      }
    }
    const rootGroupOrders = Object.values(runtime.renderer?.presentationGroups ?? {});
    const overlapFailures = (runtime.presentationOverlap ?? []).filter(
      (result) => result.pixel.join(",") !== result.expected.join(",") || result.rootGroupOrders.some((order) => order !== 0),
    );
    if (rootGroupOrders.length !== 4 || rootGroupOrders.some((order) => order !== 0) || runtime.presentationOverlap?.length !== 4 || overlapFailures.length) {
      failures.push(`${runtime.label}: controlled WebGL overlap oracle did not prove root-group-neutral phase composition`);
    }
    const unreadyVisibleAtlases = runtime.selectedRosterAtlasStatuses.filter(
      (entry) => entry.atlasStatus !== "loaded" && entry.atlasStatus !== "imported",
    );
    if (unreadyVisibleAtlases.length) {
      failures.push(`${runtime.label}: visible roster atlas was not ready (${unreadyVisibleAtlases.map((entry) => `${entry.id}:${entry.atlasStatus}`).join(", ")})`);
    }
  }
  for (const [viewport, probe] of Object.entries({ desktop: mugenLiteVisual.desktop, mobile: mugenLiteVisual.mobile })) {
    if (
      probe.mode !== "match" ||
      probe.character !== "MUGEN Lite Journey" ||
      !probe.compatibilityLoaded ||
      probe.actorSource !== "imported" ||
      probe.actorFrame?.group !== 0 ||
      probe.actorFrame?.index !== 0 ||
      probe.sprite?.width !== 32 ||
      probe.sprite?.height !== 64 ||
      probe.sprite?.axisX !== 16 ||
      probe.sprite?.axisY !== 62 ||
      probe.renderCalls < 1 ||
      !probe.canvasPixels?.nonBlank ||
      probe.canvasPixels.uniqueColors < 10 ||
      probe.spritePixels?.fixtureColorPixels < 50 ||
      probe.spritePixels?.uniqueColors < 3 ||
      probe.attack?.actorFrame?.group !== 200 ||
      probe.attack?.actorFrame?.index !== 0 ||
      probe.attack?.actorState !== 200 ||
      probe.attack?.sprite?.width !== 32 ||
      probe.attack?.sprite?.height !== 64 ||
      probe.attack?.spritePixels?.fixtureColorPixels < 50 ||
      probe.attack?.spritePixels?.fixtureMaskChecksum === probe.spritePixels?.fixtureMaskChecksum ||
      probe.attackFollowThrough?.actorSource !== "imported" ||
      probe.attackFollowThrough?.actorState !== 200 ||
      probe.attackFollowThrough?.actorFrame?.group !== 200 ||
      probe.attackFollowThrough?.actorFrame?.index !== 1 ||
      probe.attackFollowThrough?.sprite?.width !== 32 ||
      probe.attackFollowThrough?.sprite?.height !== 64 ||
      probe.attackFollowThrough?.spritePixels?.fixtureColorPixels < 50 ||
      probe.attackFollowThrough?.spritePixels?.fixtureMaskChecksum === probe.attack?.spritePixels?.fixtureMaskChecksum ||
      !probe.returnedToIdle
    ) {
      failures.push(`mugen-lite visual ${viewport}: ZIP load, imported sprite presentation, or multi-frame canvas proof failed`);
    }
    for (const [id, action] of Object.entries({ walk: 20, crouch: 10, jump: 40 })) {
      const transition = probe.movement?.[id];
      if (
        transition?.actorFrame?.group !== action ||
        transition.actorFrame.index !== 0 ||
        transition.sprite?.width !== 32 ||
        transition.sprite?.height !== 64 ||
        transition.spritePixels?.fixtureColorPixels < 50 ||
        transition.spritePixels?.fixtureMaskChecksum === probe.spritePixels?.fixtureMaskChecksum ||
        !transition.returnedToIdle
      ) {
        failures.push(`mugen-lite visual ${viewport} ${id}: input-driven pose or idle return proof failed`);
      }
    }
    const movementMasks = [
      probe.spritePixels?.fixtureMaskChecksum,
      probe.movement?.walk?.spritePixels?.fixtureMaskChecksum,
      probe.movement?.crouch?.spritePixels?.fixtureMaskChecksum,
      probe.movement?.jump?.spritePixels?.fixtureMaskChecksum,
    ];
    if (movementMasks.some((checksum) => !checksum) || new Set(movementMasks).size !== movementMasks.length) {
      failures.push(`mugen-lite visual ${viewport}: idle/walk/crouch/jump masks were not mutually distinct`);
    }
    const combatExpected = { getHit: 5000, fallMotion: 5050, fallen: 5100 };
    for (const [id, action] of Object.entries(combatExpected)) {
      const state = probe.combat?.[id];
      if (
        state?.actorSource !== "imported" ||
        state.actorState !== action ||
        state.actorFrame?.group !== action ||
        state.actorFrame.index !== 0 ||
        state.spritePixels?.fixtureColorPixels < 50
      ) {
        failures.push(`mugen-lite visual ${viewport} ${id}: imported combat state/frame/crop proof failed`);
      }
    }
    const combatMasks = Object.keys(combatExpected).map((id) => probe.combat?.[id]?.spritePixels?.fixtureMaskChecksum);
    if (
      probe.combat?.roster?.p1 !== "nova-boxer" ||
      probe.combat?.roster?.p2 !== probe.combat?.importedId ||
      probe.combat?.roster?.actors?.find((actor) => actor.id === "p1")?.source !== "demo" ||
      probe.combat?.roster?.actors?.find((actor) => actor.id === "p2")?.source !== "imported" ||
      probe.combat?.roster?.actors?.find((actor) => actor.id === "p2")?.life !== 1000 ||
      Object.keys(combatExpected).some((id) => probe.combat?.[id]?.actorLife !== 945) ||
      combatMasks.some((checksum) => !checksum) ||
      new Set(combatMasks).size !== combatMasks.length ||
      !probe.combat?.returnedToIdle
    ) {
      failures.push(`mugen-lite visual ${viewport}: combat damage, unique poses, or idle return proof failed`);
    }
    const recoveryExpected = { getHit: 5000, fallMotion: 5050, fallen: 5100, recovery: 5200 };
    for (const [id, action] of Object.entries(recoveryExpected)) {
      const state = probe.recovery?.[id];
      if (
        state?.actorSource !== "imported" ||
        state.actorState !== action ||
        state.actorFrame?.group !== action ||
        state.actorFrame.index !== 0 ||
        state.spritePixels?.fixtureColorPixels < 50
      ) {
        failures.push(`mugen-lite visual ${viewport} recovery ${id}: imported state/frame/crop proof failed`);
      }
    }
    const recoveryMasks = Object.keys(recoveryExpected).map((id) => probe.recovery?.[id]?.spritePixels?.fixtureMaskChecksum);
    if (
      probe.recovery?.roster?.p1 === undefined ||
      probe.recovery.roster.p1 !== probe.combat?.importedId ||
      probe.recovery.roster.p2 !== "nova-boxer" ||
      probe.recovery.roster.actors?.find((actor) => actor.id === "p1")?.source !== "imported" ||
      probe.recovery.roster.actors?.find((actor) => actor.id === "p2")?.source !== "demo" ||
      probe.recovery.roster.actors?.find((actor) => actor.id === "p1")?.life !== 1000 ||
      Object.keys(recoveryExpected).some((id) => probe.recovery?.[id]?.actorLife !== 945) ||
      recoveryMasks.some((checksum) => !checksum) ||
      new Set(recoveryMasks).size !== recoveryMasks.length ||
      !probe.recovery?.returnedToIdle
    ) {
      failures.push(`mugen-lite visual ${viewport}: recovery roster, damage, unique poses, or idle return proof failed`);
    }
    const guarded = probe.guard?.guarded;
    if (
      probe.guard?.roster?.p1 !== probe.combat?.importedId ||
      probe.guard?.roster?.p2 !== "nova-boxer" ||
      probe.guard?.roster?.actors?.find((actor) => actor.id === "p1")?.source !== "imported" ||
      probe.guard?.roster?.actors?.find((actor) => actor.id === "p2")?.source !== "demo" ||
      probe.guard?.roster?.actors?.find((actor) => actor.id === "p1")?.life !== 1000 ||
      guarded?.actorSource !== "imported" ||
      guarded.actorState !== 150 ||
      guarded.actorFrame?.group !== 150 ||
      guarded.actorFrame.index !== 0 ||
      !guarded.actorGuarding ||
      guarded.actorLife !== 1000 ||
      guarded.spritePixels?.fixtureColorPixels < 50 ||
      !probe.guard?.returnedToIdle
    ) {
      failures.push(`mugen-lite visual ${viewport}: guarded imported contact, exact chip, or idle return proof failed`);
    }
    const noKoSlow = probe.noKoSlow?.finisher;
    if (
      probe.noKoSlow?.roster?.p1 !== probe.combat?.importedId ||
      probe.noKoSlow?.roster?.p2 !== "nova-boxer" ||
      probe.noKoSlow?.roster?.actors?.find((actor) => actor.id === "p1")?.source !== "imported" ||
      probe.noKoSlow?.roster?.actors?.find((actor) => actor.id === "p2")?.source !== "demo" ||
      noKoSlow?.actorSource !== "imported" ||
      noKoSlow.actorState !== 210 ||
      noKoSlow.actorFrame?.group !== 210 ||
      noKoSlow.actorFrame.index !== 0 ||
      noKoSlow.actorLife !== 1000 ||
      !noKoSlow.actorAssertSpecial?.globalFlags?.includes("nokoslow") ||
      noKoSlow.opponent?.find((actor) => actor.id === "p2")?.life !== 0 ||
      noKoSlow.round?.state !== "ko" ||
      !noKoSlow.round?.postRound?.noKoSlow ||
      noKoSlow.round?.postRound?.frame < 4 ||
      noKoSlow.round?.postRound?.playbackRate !== 1 ||
      noKoSlow.spritePixels?.fixtureColorPixels < 50 ||
      noKoSlow.spritePixels?.fixtureMaskChecksum === probe.attack?.spritePixels?.fixtureMaskChecksum ||
      !probe.noKoSlow?.reset
    ) {
      failures.push(`mugen-lite visual ${viewport}: legal NoKOSlow KO, normal playback, or reset proof failed`);
    }
    const palette = probe.palette?.palette;
    if (
      palette?.actorSource !== "imported" ||
      palette.actorState !== 220 ||
      palette.actorFrame?.group !== 200 ||
      palette.actorFrame.index !== 0 ||
      palette.actorPaletteRemap?.source?.join(",") !== "1,1" ||
      palette.actorPaletteRemap?.dest?.join(",") !== "1,2" ||
      palette.sprite?.width !== 32 ||
      palette.sprite?.height !== 64 ||
      palette.spritePixels?.fixtureColorPixels < 50 ||
      !palette.spritePixels?.expectedColorPixels?.every((count) => count > 0) ||
      !probe.palette?.returnedToIdle
    ) {
      failures.push(`mugen-lite visual ${viewport}: ACT-backed source/destination RemapPal pixel proof failed`);
    }
  }
  if (!codeFuManVisual.skipped) {
    if (
      codeFuManVisual.initial?.mode !== "match" ||
      codeFuManVisual.initial.character !== "Code Fu Man" ||
      !codeFuManVisual.initial.compatibilityLoaded ||
      codeFuManVisual.initial.actorSource !== "imported" ||
      codeFuManVisual.initial.actorState !== 0 ||
      codeFuManVisual.initial.actorFrame?.group !== 0 ||
      !codeFuManVisual.initial.canvasPixels?.nonBlank ||
      codeFuManVisual.initial.canvasPixels.uniqueColors < 10 ||
      codeFuManVisual.initial.spritePixels?.uniqueColors < 3 ||
      codeFuManVisual.attack?.actorSource !== "imported" ||
      codeFuManVisual.attack.actorState !== 200 ||
      !Number.isFinite(codeFuManVisual.attack.actorFrame?.group) ||
      codeFuManVisual.attack.actorFrame.group <= 0 ||
      !codeFuManVisual.attack.canvasPixels?.nonBlank ||
      codeFuManVisual.attack.canvasPixels.uniqueColors < 10 ||
      codeFuManVisual.attack.spritePixels?.uniqueColors < 3 ||
      !codeFuManVisual.returnedToIdle ||
      codeFuManVisual.special?.actorSource !== "imported" ||
      codeFuManVisual.special.actorState !== 1000 ||
      !Number.isFinite(codeFuManVisual.special.actorFrame?.group) ||
      codeFuManVisual.special.actorFrame.group <= 0 ||
      !codeFuManVisual.special.canvasPixels?.nonBlank ||
      codeFuManVisual.special.canvasPixels.uniqueColors < 10 ||
      codeFuManVisual.special.spritePixels?.uniqueColors < 3 ||
      !codeFuManVisual.specialReturnedToIdle ||
      codeFuManVisual.upper?.actorSource !== "imported" ||
      codeFuManVisual.upper.actorState !== 1100 ||
      !Number.isFinite(codeFuManVisual.upper.actorFrame?.group) ||
      codeFuManVisual.upper.actorFrame.group <= 0 ||
      !codeFuManVisual.upper.canvasPixels?.nonBlank ||
      codeFuManVisual.upper.canvasPixels.uniqueColors < 10 ||
      codeFuManVisual.upper.spritePixels?.uniqueColors < 3 ||
      !codeFuManVisual.upperReturnedToIdle
    ) {
      failures.push("codefuman visual: independent package did not prove imported idle, x state 200, QCF_x state 1000, upper_x state 1100, nonblank canvases, or idle returns");
    }
  }
  const expectedPair = "p1,p2";
  const expectedHandoff = "p3,p2";
  const tagStates = [tagPresentation.desktop, tagPresentation.mobile];
  if (
    tagPresentation.baseline.scenario !== "ikemen-tag-presentation" ||
    tagPresentation.baseline.actorIds.join(",") !== expectedPair ||
    tagPresentation.baseline.reserveActorIds.join(",") !== "p3,p4" ||
    tagPresentation.baseline.drawRootIds.join(",") !== expectedPair ||
    tagPresentation.baseline.cameraRootIds.join(",") !== expectedPair ||
    tagPresentation.baseline.collisionRootIds.join(",") !== expectedPair ||
    tagPresentation.baseline.teamLifebar.mode !== "tag" ||
    tagPresentation.baseline.teamLifebar.visible !== true ||
    tagPresentation.baseline.teamLifebar.slotIds.join(",") !== "p1,p3,p2,p4" ||
    tagPresentation.baseline.teamLifebar.redLifeBarIds.join(",") !== "p1,p3,p2,p4" ||
    tagPresentation.baseline.teamLifebar.slotStatuses.p1 !== "active" ||
    tagPresentation.baseline.teamLifebar.slotStatuses.p3 !== "standby" ||
    tagPresentation.baseline.teamLifebar.slotStatuses.p2 !== "active" ||
    tagPresentation.baseline.teamLifebar.slotStatuses.p4 !== "standby" ||
    tagPresentation.baseline.teamLifebar.activeBySide.join(",") !== "p1,p2" ||
    !sameIdSet(tagPresentation.baseline.collisionActorIds, ["p1", "p2"]) ||
    !sameIdSet(tagPresentation.baseline.rendererActorIds, ["p1", "p2"])
  ) {
    failures.push("tag-presentation baseline: pair snapshot, reserves, or renderer selection was incorrect");
  }
  for (const state of tagStates) {
    if (
      state.scenario !== "ikemen-tag-presentation" ||
      state.actorIds.join(",") !== expectedPair ||
      state.reserveActorIds.join(",") !== "p3,p4" ||
      state.drawRootIds.join(",") !== expectedHandoff ||
      state.cameraRootIds.join(",") !== expectedHandoff ||
      state.collisionRootIds.join(",") !== expectedHandoff ||
      state.teamLifebar.mode !== "tag" ||
      state.teamLifebar.visible !== true ||
      state.teamLifebar.slotIds.join(",") !== "p1,p3,p2,p4" ||
      state.teamLifebar.redLifeBarIds.join(",") !== "p1,p3,p2,p4" ||
      state.teamLifebar.slotStatuses.p1 !== "standby" ||
      state.teamLifebar.slotStatuses.p3 !== "active" ||
      state.teamLifebar.slotStatuses.p2 !== "active" ||
      state.teamLifebar.slotStatuses.p4 !== "standby" ||
      state.teamLifebar.activeBySide.join(",") !== "p3,p2" ||
      !sameIdSet(state.collisionActorIds, ["p3", "p2"]) ||
      state.collisionActorIds.includes("p1") ||
      state.collisionBoxCount < 1 ||
      !sameIdSet(state.rendererActorIds, ["p3", "p2"]) ||
      state.rendererActorIds.includes("p1") ||
      !sameIdSet(state.presentedRoots, ["p3", "p2"]) ||
      !sameIdSet(state.presentationCapabilities, ["p3", "p2"]) ||
      !state.canvasPixels?.nonBlank ||
      state.canvasPixels.uniqueColors < 10
    ) {
      failures.push("tag-presentation handoff: desktop/mobile runtime, renderer, HUD, ownership, or canvas proof failed");
      break;
    }
  }
  if (
    tagPresentation.reset.drawRootIds.join(",") !== expectedPair ||
    tagPresentation.reset.cameraRootIds.join(",") !== expectedPair ||
    tagPresentation.reset.collisionRootIds.join(",") !== expectedPair ||
    !sameIdSet(tagPresentation.reset.collisionActorIds, ["p1", "p2"]) ||
    tagPresentation.reset.collisionActorIds.includes("p3") ||
    !sameIdSet(tagPresentation.reset.rendererActorIds, ["p1", "p2"]) ||
    tagPresentation.reset.rendererActorIds.includes("p3")
  ) {
    failures.push("tag-presentation reset: playable pair or stale Three.js mesh cleanup failed");
  }
  if (
    studioWorkbench.mode !== "studio" ||
    studioWorkbench.studioTab !== "workbench" ||
    !studioWorkbench.bodyHasNextDesk ||
    !studioWorkbench.bodyHasPipeline ||
    !studioWorkbench.bodyHasHealthLanguage ||
    !studioWorkbench.stageDeckVisible ||
    studioWorkbench.chromeFieldCount < 4 ||
    studioWorkbench.primaryActionCount !== 1 ||
    studioWorkbench.pipelineStepCount < 7 ||
    !studioWorkbench.rightInspectorVisible ||
    studioWorkbench.activeIssueRows < 1 ||
    studioWorkbench.navigatorVisible ||
    studioWorkbench.consoleCollapsed ||
    studioWorkbench.consoleHeight < 100 ||
    studioWorkbench.canvasArea < 300000 ||
    studioWorkbench.overflowX
  ) {
    failures.push("studio-workbench: premium cockpit workbench was missing stage deck, pipeline, health inspector, expanded console, or large playfield");
  }
  const workbenchUnreadyAtlases = studioWorkbench.selectedRosterAtlasStatuses.filter(
    (entry) => entry.atlasStatus !== "loaded" && entry.atlasStatus !== "imported",
  );
  if (workbenchUnreadyAtlases.length) {
    failures.push(`studio-workbench: visible roster atlas was not ready (${workbenchUnreadyAtlases.map((entry) => `${entry.id}:${entry.atlasStatus}`).join(", ")})`);
  }
  if (
    !studioWorkbench.projectAuthoring?.saved ||
    studioWorkbench.projectAuthoring.reopenedName !== studioWorkbench.projectAuthoring.authoredName ||
    studioWorkbench.projectAuthoring.name !== studioWorkbench.projectAuthoring.authoredName ||
    studioWorkbench.projectAuthoring.entry?.p1 !== "rook-apprentice" ||
    studioWorkbench.projectAuthoring.entry?.p2 !== "nova-boxer" ||
    studioWorkbench.projectAuthoring.entry?.stage !== "training-grid" ||
    studioWorkbench.projectAuthoring.dirty !== false ||
    (studioWorkbench.projectAuthoring.historyAfterEdits?.undoCount ?? 0) < 4 ||
    studioWorkbench.projectAuthoring.afterUndo?.project?.entry?.stage === "training-grid" ||
    !studioWorkbench.projectAuthoring.afterUndo?.history?.canRedo ||
    studioWorkbench.projectAuthoring.afterRedo?.project?.entry?.stage !== "training-grid" ||
    studioWorkbench.projectAuthoring.afterRedo?.history?.canRedo ||
    studioWorkbench.projectAuthoring.afterKeyboardUndo?.entry?.stage === "training-grid" ||
    studioWorkbench.projectAuthoring.afterKeyboardRedo?.entry?.stage !== "training-grid" ||
    studioWorkbench.projectAuthoring.dirtyBeforeAutosave !== true ||
    studioWorkbench.projectAuthoring.beforeUnloadPrevented !== true ||
    studioWorkbench.projectAuthoring.navigationDialogDismissed !== true ||
    studioWorkbench.projectAuthoring.afterDismissedNavigation?.dirty !== true ||
    studioWorkbench.projectAuthoring.afterDismissedNavigation?.entry?.stage !== "training-grid" ||
    studioWorkbench.projectAuthoring.afterAutosave?.dirty !== false ||
    studioWorkbench.projectAuthoring.afterAutosave?.pending !== false ||
    studioWorkbench.projectAuthoring.afterAutosave?.stored !== true
  ) {
    failures.push("studio-workbench: authored project scene, dirty-state, undo/redo history, navigation guard, or autosave did not behave correctly");
  }
  if (
    !diagnostics.checks.studioStorageConflict?.cleanExternalDetected ||
    !diagnostics.checks.studioStorageConflict?.remoteReloadResolved ||
    !diagnostics.checks.studioStorageConflict?.dirtyExternalDetected ||
    !diagnostics.checks.studioStorageConflict?.staleSaveRejected ||
    !diagnostics.checks.studioStorageConflict?.localCopyResolved
  ) {
    failures.push("studio-storage-conflict: external edit detection, remote reload, local-copy preservation, autosave pause, or stale-save rejection did not behave correctly");
  }
  if (
    studioWorkbenchTablet.mode !== "studio" ||
    studioWorkbenchTablet.studioTab !== "workbench" ||
    studioWorkbenchTablet.overflowX ||
    !studioWorkbenchTablet.stageStatusVisible
  ) {
    failures.push("studio-workbench-tablet: 1024px workbench layout overflowed or lost stage status");
  }
  if (
    !commandPaletteA11y.opened ||
    !commandPaletteA11y.searchFocused ||
    !commandPaletteA11y.activeInsideShell ||
    !commandPaletteA11y.inputActiveDescendant ||
    !commandPaletteA11y.initialActiveResult ||
    !commandPaletteA11y.arrowChangedActiveResult ||
    !commandPaletteA11y.focusStayedInsideAfterShiftTab ||
    !commandPaletteA11y.focusStayedInsideAfterManyTabs ||
    !commandPaletteA11y.closedOnEscape ||
    !commandPaletteA11y.focusRestoredToLauncher ||
    !commandPaletteA11y.keyboardEnterClosedPalette ||
    !commandPaletteA11y.keyboardEnterExecutedBuild
  ) {
    failures.push("command-palette: focus trap, active result navigation, Enter execution, Escape close, or focus restore failed");
  }
  if (studioBuild.mode !== "studio" || studioBuild.studioTab !== "build" || !studioBuild.bodyHasBuild) {
    failures.push("studio-build: Build surface did not render");
  }
  const expectedTrustChainIds = [
    "runtime-manifest",
    "evidence",
    "package-bundle",
    "asset-validation",
    "source-packages",
    "compatibility-gates",
    "architecture-boundaries",
  ];
  const hasExpectedTrustChain = (check) =>
    expectedTrustChainIds.every((id) => check.trustChainIds?.includes(id)) &&
    expectedTrustChainIds.every((id) => check.trustChainTargets?.some((target) => target.startsWith(`${id}:`))) &&
    expectedTrustChainIds.every((id) => check.trustChainDeltas?.some((delta) => delta.startsWith(`${id}:`) && !delta.endsWith(":"))) &&
    (check.trustChainNextActions?.length ?? 0) >= expectedTrustChainIds.length;
  if (!studioBuild.bodyHasTrustChain || studioBuild.trustChainRows < expectedTrustChainIds.length || !hasExpectedTrustChain(studioBuild)) {
    failures.push("studio-build: shared Trust Chain rows were missing targets, deltas, or Build Readiness next actions");
  }
  const trustBindingAt = (check, id) => {
    const index = check.trustChainIds?.indexOf(id) ?? -1;
    return index >= 0 ? check.trustChainButtonBindings?.[index] : undefined;
  };
  const trustTargetAt = (check, id) => check.trustChainTargetDetails?.find((target) => target.id === id);
  if (trustBindingAt(studioBuild, "runtime-manifest")?.evidenceFilter !== "compile") {
    failures.push("studio-build: runtime manifest Trust Chain row did not target compile evidence");
  }
  if (trustBindingAt(studioBuild, "evidence")?.evidenceFilter !== "trace" || trustBindingAt(studioBuild, "evidence")?.traceFrameIndex !== "0") {
    failures.push("studio-build: trace Trust Chain row did not target trace evidence frame 0");
  }
  if (trustBindingAt(studioBuild, "asset-validation")?.assetFilter !== "attention") {
    failures.push("studio-build: asset Trust Chain row did not target asset attention");
  }
  if (trustBindingAt(studioBuild, "compatibility-gates")?.evidenceFilter !== "gate") {
    failures.push("studio-build: compatibility Trust Chain row did not target gate evidence");
  }
  if (
    trustTargetAt(studioBuild, "package-bundle")?.kind !== "package-file" ||
    !trustBindingAt(studioBuild, "package-bundle")?.packageFilePath ||
    (studioBuild.packageFileRows ?? 0) <= 0
  ) {
    failures.push("studio-build: package Trust Chain row did not drill down to a concrete package file");
  }
  if (!studioBuild.focusedPackageFilePath || studioBuild.focusedPackageFileRow !== studioBuild.focusedPackageFilePath || !studioBuild.focusedPackageFileRowVisible) {
    failures.push("studio-build: package Trust Chain click did not focus the concrete package file row");
  }
  if (
    studioBuild.importedFixtureLoaded &&
    (trustTargetAt(studioBuild, "source-packages")?.kind !== "source-file" ||
      !trustBindingAt(studioBuild, "source-packages")?.sourcePackageId ||
      !trustBindingAt(studioBuild, "source-packages")?.sourcePath ||
      (studioBuild.sourcePathRows ?? 0) <= 0)
  ) {
    failures.push("studio-build: source Trust Chain row did not drill down to a concrete required source path");
  }
  if (
    studioBuild.importedFixtureLoaded &&
    (studioBuild.sourceFocusAfterClick?.trustFocusedRow !== "source-packages" ||
      !studioBuild.sourceFocusAfterClick?.sourcePackageId ||
      !studioBuild.sourceFocusAfterClick?.sourcePath ||
      studioBuild.sourceFocusAfterClick?.sourcePathRowClass !== studioBuild.sourceFocusAfterClick?.sourcePath ||
      !studioBuild.sourceFocusAfterClick?.sourcePathRowVisible)
  ) {
    failures.push("studio-build: source Trust Chain click did not focus the concrete source path row");
  }
  if (studioBuild.trustFocusedRow !== "package-bundle" || studioBuild.trustFocusedRowClass !== "package-bundle") {
    failures.push("studio-build: Trust Chain click did not leave a visible package-bundle focus row");
  }
  if (!studioBuild.compiledProject) {
    failures.push("studio-build: compiledProject missing after compile action");
  }
  if (!studioBuild.bodyHasPackage || !studioBuild.projectBundle) {
    failures.push("studio-build: project package panel or bridge summary missing");
  }
  if (
    !studioBuild.bodyHasArchitectureBoundaries ||
    studioBuild.architectureGateStatus !== "ok" ||
    !studioBuild.architectureGateEvidenceIds?.includes("test:architecture-boundaries") ||
    !studioBuild.architectureEvidenceRecord
  ) {
    failures.push("studio-build: architecture boundary gate was not visible or linked to Studio evidence");
  }
  if (
    studioBuild.downloadedPackage?.manifestSchema !== "mugen-web-sandbox/export-bundle/v0" ||
    studioBuild.downloadedPackage?.runtimeSchema !== "mugen-web-sandbox/runtime-manifest/v0" ||
    studioBuild.downloadedPackage?.runtimeContractSchema !== "mugen-web-sandbox/shared-engine-contracts/v0" ||
    (studioBuild.downloadedPackage?.runtimeSharedContracts ?? 0) < 8 ||
    (studioBuild.downloadedPackage?.runtimeModuleContracts ?? 0) < 3 ||
    (studioBuild.downloadedPackage?.runtimeSharedCoreForbidden ?? 0) < 8 ||
    (studioBuild.downloadedPackage?.runtimePlatformerForbidden ?? 0) < 4 ||
    !studioBuild.downloadedPackage?.runtimeBlocksCns ||
    !studioBuild.downloadedPackage?.runtimeBlocksHitDef ||
    !studioBuild.downloadedPackage?.runtimeHasPlatformerContract ||
    studioBuild.downloadedPackage?.binaryBundlingStatus !== "bundled" ||
    (studioBuild.downloadedPackage?.binaryBundled ?? 0) < 20 ||
    (studioBuild.downloadedPackage?.binaryBytes ?? 0) <= 0 ||
    !studioBuild.downloadedPackage?.hasAssetManifest ||
    !studioBuild.downloadedPackage?.hasRuntimeAtlas ||
    !studioBuild.downloadedPackage?.hasStageArt ||
    (studioBuild.downloadedPackage?.missingBundledFiles?.length ?? 0) > 0 ||
    (studioBuild.downloadedPackage?.bundledWithoutChecksum?.length ?? 0) > 0 ||
    (studioBuild.downloadedPackage?.sourceRuntimeAssetCount ?? 0) < 3 ||
    !studioBuild.downloadedPackage?.hasTrace
  ) {
    failures.push("studio-build: downloaded project package did not include required contracts/evidence");
  }
  if (
    studioBuild.importedFixtureLoaded &&
    ((studioBuild.downloadedPackage?.importedBundledAssetRecords ?? 0) < 5 ||
      (studioBuild.downloadedPackage?.projectSourcePackages ?? 0) < 1 ||
      (studioBuild.downloadedPackage?.linkedProjectSourcePackages ?? 0) < 1 ||
      (studioBuild.downloadedPackage?.projectSourceRequiredPaths ?? 0) < 5 ||
      (studioBuild.downloadedPackage?.projectSourceFileDigests ?? 0) < 5 ||
      !studioBuild.downloadedPackage?.hasKfmSourcePackage ||
      !studioBuild.downloadedPackage?.hasImportedDef ||
      !studioBuild.downloadedPackage?.hasImportedSff ||
      !studioBuild.downloadedPackage?.hasImportedAir ||
      !studioBuild.downloadedPackage?.hasImportedCmd ||
      !studioBuild.downloadedPackage?.hasImportedCns)
  ) {
    failures.push("studio-build: imported fixture source files were not embedded in the project package");
  }
  if (
    studioBuild.importedFixtureLoaded &&
    (studioBuild.provenanceSchema !== "mugen-web-sandbox/asset-provenance/v1" ||
      studioBuild.provenanceRecords < 1 ||
      studioBuild.provenanceInputFiles < 5 ||
      studioBuild.provenanceOutputFiles < 5 ||
      studioBuild.provenanceCompleteRecords < 1 ||
      studioBuild.provenanceFilePathLeaks !== 0)
  ) {
    failures.push("studio-build: imported asset provenance did not join per-file source and bundled output hashes");
  }
  if (
    studioBuild.importedFixtureLoaded &&
    (studioBuild.stageReports < 1 ||
      studioBuild.stageLayerReports < 1 ||
      !studioBuild.stageLayerStatuses?.some((status) => ["rendered", "animated", "fallback", "missing", "unsupported"].includes(status)))
  ) {
    failures.push("studio-build: imported stage BG layer IR was not exposed through the QA bridge");
  }
  if (studioBuild.traceArtifactStatus !== "passed" || studioBuild.downloadedArtifact.status !== "passed") {
    failures.push("studio-build: trace artifact did not pass");
  }
  if (
    studioModules.mode !== "studio" ||
    studioModules.studioTab !== "modules" ||
    !studioModules.bodyHasModuleGraph ||
    !studioModules.bodyHasSharedContracts ||
    !studioModules.bodyHasSharedCoreBoundary ||
    !studioModules.bodyHasPlatformerBoundary ||
    !studioModules.bodyHasCnsBlocked ||
    studioModules.contractSchema !== "mugen-web-sandbox/shared-engine-contracts/v0" ||
    studioModules.sharedContracts < 8 ||
    studioModules.moduleContracts < 3 ||
    studioModules.sharedCoreForbidden < 8 ||
    studioModules.platformerForbidden < 4 ||
    !studioModules.platformerBlocksCns ||
    !studioModules.platformerBlocksHitDef ||
    studioModules.modulesWithConsumes < 4 ||
    studioModules.modulesWithProvides < 3 ||
    studioModules.modulesWithBlockedClaims < 4
  ) {
    failures.push("studio-modules: shared module contracts and boundary claims were not visible through Studio Modules and the QA bridge");
  }
  if (
    !studioSourceRelink?.skipped &&
    (studioSourceRelink.before?.missing < 1 ||
      studioSourceRelink.before?.relinkButtons < 1 ||
      studioSourceRelink.after?.mode !== "studio" ||
      studioSourceRelink.after?.studioTab !== "build" ||
      studioSourceRelink.after?.linked < 1 ||
      studioSourceRelink.after?.missing !== 0 ||
      studioSourceRelink.after?.requiredPaths < 5 ||
      studioSourceRelinkIdentity?.status !== "matched" ||
      !/^[0-9a-f]{64}$/i.test(String(studioSourceRelinkIdentity?.fingerprint ?? "")) ||
      studioSourceRelinkIdentity?.observedFingerprint !== studioSourceRelinkIdentity?.fingerprint ||
      !studioSourceRelink.after?.bodyHasSourcePackages ||
      !studioSourceRelink.after?.bodyHasKfm ||
      studioSourceRelink.after?.sourceTransactions?.[0]?.schemaVersion !== "mugen-web-sandbox/source-transaction/v0" ||
      studioSourceRelink.after?.sourceTransactions?.[0]?.state !== "linked" ||
      studioSourceRelink.after?.sourceTransactions?.[0]?.canRead !== true ||
      studioSourceRelink.after?.sourceTransactions?.[0]?.canWrite !== false ||
      !["not-requested", "unsupported"].includes(studioSourceRelink.after?.sourceTransactions?.[0]?.permission) ||
      !["request-permission", "manual-relink"].includes(studioSourceRelink.after?.sourceTransactions?.[0]?.nextAction) ||
      studioSourceRelinkHandle?.schemaVersion !== "mugen-web-sandbox/source-handle/v0" ||
      !["available", "unsupported"].includes(studioSourceRelinkHandle?.capability) ||
      studioSourceRelinkHandle?.state !== "not-linked" ||
      studioSourceRelinkHandle?.canRead !== false ||
      !["link-handle", "relink-source"].includes(studioSourceRelinkHandle?.nextAction) ||
      (studioSourceRelinkHandle?.warnings ?? []).some((warning) => /^(?:[a-z]:\\|[a-z]:\/|file:|\/\/)/i.test(String(warning))) ||
      studioSourceRelink.after?.warnings?.some((warning) => String(warning).includes("is required for full export")))
  ) {
    failures.push("studio-source-relink: missing source package did not relink through the Build Center UI");
  }
  if (
    !studioSourceRelink?.skipped &&
    (studioSourceRelink.rejected?.mode !== "studio" ||
      studioSourceRelink.rejected?.studioTab !== "build" ||
      studioSourceRelink.rejected?.status !== "rejected" ||
      studioSourceRelink.rejected?.reason !== "changed-source" ||
      studioSourceRelink.rejected?.currentSourceStatus !== "linked" ||
      studioSourceRelink.rejected?.currentIdentityStatus !== "matched" ||
      !/^[0-9a-f]{64}$/i.test(String(studioSourceRelink.rejected?.transactionFingerprint ?? "")) ||
      studioSourceRelink.rejected?.transactionFingerprint === studioSourceRelink.rejected?.currentFingerprint ||
      studioSourceRelink.rejected?.currentFingerprint !== studioSourceRelinkIdentity?.fingerprint ||
      studioSourceRelink.rejected?.sourceTransaction?.state !== "linked" ||
      studioSourceRelink.rejected?.sourceTransaction?.canRead !== true ||
      studioSourceRelink.rejected?.sourceTransaction?.canWrite !== false ||
      !studioSourceRelink.rejected?.bodyHasSourceRejected ||
      !studioSourceRelink.rejected?.bodyHasRetainedSession)
  ) {
    failures.push("studio-source-relink: changed source did not reject atomically while retaining the active runtime/source session");
  }
  if (
    !studioFolderHandleRecovery?.skipped &&
    (studioFolderHandleRecovery.before?.kind !== "folder" ||
      studioFolderHandleRecovery.before?.missing !== true ||
      studioFolderHandleRecovery.before?.sourceHandle?.state !== "not-linked" ||
      studioFolderHandleRecovery.after?.mode !== "studio" ||
      studioFolderHandleRecovery.after?.studioTab !== "build" ||
      studioFolderHandleRecovery.after?.character !== "Kung Fu Man" ||
      studioFolderHandleRecovery.after?.sourcePackage?.status !== "linked" ||
      studioFolderHandleRecovery.after?.sourceHandle?.schemaVersion !== "mugen-web-sandbox/source-handle/v0" ||
      studioFolderHandleRecovery.after?.sourceHandle?.handleKind !== "directory" ||
      studioFolderHandleRecovery.after?.sourceHandle?.state !== "granted" ||
      studioFolderHandleRecovery.after?.sourceHandle?.canRead !== true ||
      !/^[0-9a-f]{64}$/i.test(String(studioFolderHandleRecovery.after?.sourceHandle?.observedFingerprint ?? "")) ||
      studioFolderHandleRecovery.after?.sourceTransaction?.schemaVersion !== "mugen-web-sandbox/source-transaction/v0" ||
      studioFolderHandleRecovery.after?.sourceTransaction?.state !== "linked" ||
      studioFolderHandleRecovery.after?.sourceTransaction?.canRead !== true ||
      studioFolderHandleRecovery.after?.sourceTransaction?.canWrite !== false ||
      !studioFolderHandleRecovery.after?.bodyHasSourcePackages ||
      !studioFolderHandleRecovery.after?.bodyHasLinkedCopy ||
      !studioFolderHandleRecovery.after?.bodyHasFolderHandle ||
      !studioFolderHandleRecovery.after?.bodyHasSourceEditor ||
      !studioFolderHandleRecovery.after?.bodyHasSemanticPreflight ||
      !studioFolderHandleRecovery.after?.sourceEditorVisible ||
      studioFolderHandleRecovery.after?.explicitReimport !== true)
  ) {
    failures.push("studio-folder-handle: directory enumeration did not recover the real fixture through SourceHandle/v0 and SourceTransaction/v0");
  }
  if (
    ikemenScan.mode !== "studio" ||
    ikemenScan.studioTab !== "evidence" ||
    !ikemenScan.detected ||
    ikemenScan.level !== "recognized-unsupported" ||
    ikemenScan.findings < 10 ||
    ikemenScan.screenpackFiles < 1 ||
    ikemenScan.zssFiles < 1 ||
    ikemenScan.luaFiles < 1 ||
    ikemenScan.modelFiles < 1 ||
    !ikemenScan.hasScreenpackFeature ||
    !ikemenScan.hasZssControllerFeature ||
    !ikemenScan.hasLuaHookFeature ||
    !ikemenScan.hasExtendedTriggerFeature ||
    !ikemenScan.unsupportedScreenpack ||
    !ikemenScan.unsupportedZss ||
    !ikemenScan.bodyHasIkemenEvidence ||
    !ikemenScan.bodyHasEvidenceBrowser
  ) {
    failures.push("ikemen-scan: scanner-only IKEMEN ZSS/Lua/screenpack/model-stage findings did not reach Studio Evidence and unsupported reports");
  }
  if (
    studioStage.mode !== "studio" ||
    studioStage.studioTab !== "stage" ||
    !studioStage.bodyHasStagePreview ||
    !studioStage.bodyHasStageContract ||
    !studioStage.bodyHasLayerStatus ||
    !studioStage.bodyHasLayerDiagnostics ||
    !studioStage.bodyHasBgControllers ||
    !studioStage.bodyHasAvailableStages
  ) {
    failures.push("studio-stage: Stage Studio surface did not render required panels");
  }
  if (studioBuild.importedFixtureLoaded && (studioStage.stageReports < 1 || studioStage.layerReports < 1 || studioStage.renderedOrAnimatedLayers < 1)) {
    failures.push("studio-stage: imported stage layer IR was not visible in Stage Studio");
  }
  const studioBgCtrlStage = diagnostics.checks.studioBgCtrlStage;
  if (
    studioBgCtrlStage.mode !== "studio" ||
    studioBgCtrlStage.studioTab !== "stage" ||
    studioBgCtrlStage.snapshotStage !== "bgctrl-lab" ||
    studioBgCtrlStage.bgControllers < 4 ||
    !studioBgCtrlStage.bodyHasBgCtrlLab ||
    !studioBgCtrlStage.bodyHasBoundedBgCtrl ||
    !studioBgCtrlStage.bodyHasNativeBgCtrlCount ||
    studioBgCtrlStage.canvasPixels?.uniqueColors < 20
  ) {
    failures.push("studio-bgctrl-stage: native BGCtrl Lab did not expose bounded controller rows with a nonblank canvas");
  }
  if (
    studioAssets.mode !== "studio" ||
    studioAssets.studioTab !== "assets" ||
    studioAssets.assetFilter !== "generated" ||
    !studioAssets.bodyHasAssets ||
    !studioAssets.bodyHasProjectAssets ||
    !studioAssets.bodyHasReadiness ||
    !studioAssets.bodyHasAssetDetail ||
    !studioAssets.bodyHasReplacementFlow ||
    !studioAssets.bodyHasSourceRuntimeMap ||
    !studioAssets.bodyHasDependencyGraph ||
    !studioAssets.bodyHasDependencyDrilldown ||
    !studioAssets.bodyHasMissingReferences ||
    !studioAssets.bodyHasRelatedEvidence ||
    !studioAssets.bodyHasProvenance ||
    !studioAssets.bodyHasNextAction ||
    !studioAssets.selectedAssetId ||
    !studioAssets.selectedAssetNextAction ||
    studioAssets.selectedDependencies < 4 ||
    studioAssets.dependencyGraphNodes < 5 ||
    studioAssets.dependencyGraphEdges < 4 ||
    studioAssets.replacementRole !== "p1" ||
    studioAssets.replacementCandidates < 1 ||
    studioAssets.sourceRuntimeRecords < 6 ||
    (studioAssets.sourceRuntimeLanes?.source ?? 0) < 1 ||
    (studioAssets.sourceRuntimeLanes?.manifest ?? 0) < 1 ||
    (studioAssets.sourceRuntimeLanes?.runtime ?? 0) < 1 ||
    (studioAssets.sourceRuntimeLanes?.qa ?? 0) < 1 ||
    (studioAssets.sourceRuntimeLanes?.export ?? 0) < 1 ||
    studioAssets.provenanceSchema !== "mugen-web-sandbox/asset-provenance/v1" ||
    studioAssets.provenanceRecords < studioAssets.assetTotal ||
    studioAssets.provenanceFilePathLeaks !== 0 ||
    studioAssets.selectedProvenanceStatus !== "partial" ||
    studioAssets.provenanceAbsolutePathLeaks !== 0 ||
    studioAssets.relatedEvidence < 1 ||
    studioAssets.assetTotal < 3 ||
    studioAssets.visibleAssets < 1 ||
    studioAssets.generatedAssets < 1
  ) {
    failures.push("studio-assets: Asset Library did not expose filtered project asset records");
  }
  if (
    !studioReplacement.applied ||
    studioReplacement.before?.replacementRole !== "p1" ||
    studioReplacement.before?.replacementCandidates < 1 ||
    studioReplacement.after?.selected !== studioReplacement.candidateId ||
    studioReplacement.after?.entry?.p1 !== studioReplacement.candidateId ||
    !studioReplacement.after?.bodyHasReplacementFlow
  ) {
    failures.push("studio-assets-replacement: replacement flow did not apply a compatible P1 candidate");
  }
  if (studioEvidence.mode !== "studio" || studioEvidence.studioTab !== "evidence" || !studioEvidence.bodyHasEvidence) {
    failures.push("studio-evidence: Evidence surface did not render");
  }
  if (!studioEvidence.bodyHasTrustChain || studioEvidence.trustChainRows < expectedTrustChainIds.length || !hasExpectedTrustChain(studioEvidence)) {
    failures.push("studio-evidence: shared Trust Chain rows were missing targets, deltas, or Build Readiness next actions");
  }
  if ((studioBuild.trustChainIds ?? []).join("|") !== (studioEvidence.trustChainIds ?? []).join("|")) {
    failures.push("studio-evidence: Trust Chain ids drifted from Studio Build");
  }
  if ((studioBuild.trustChainTargets ?? []).join("|") !== (studioEvidence.trustChainTargets ?? []).join("|")) {
    failures.push("studio-evidence: Trust Chain targets drifted from Studio Build");
  }
  if (!studioEvidence.hasArchitectureGateRecord || !studioEvidence.hasArchitectureEvidenceRecord || studioEvidence.architectureEvidenceStatus !== "ok") {
    failures.push("studio-evidence: architecture boundary gate/evidence records were not exposed through the Evidence Browser bridge");
  }
  if ((studioEvidence.traceArtifacts ?? 0) < 1 || studioEvidence.latestTraceStatus !== "passed") {
    failures.push("studio-evidence: trace history missing after export");
  }
  if (!studioEvidence.bodyHasPersistedHistory || (studioEvidence.persistedTraceArtifacts ?? 0) < 1 || (studioEvidence.storedTraceEvidence ?? 0) < 1) {
    failures.push("studio-evidence: persisted trace evidence history missing after export");
  }
  if (
    (studioEvidence.persistedTraceComparisons ?? 0) < 1 ||
    studioEvidence.firstPersistedTraceComparisonMatch !== "same"
  ) {
    failures.push("studio-evidence: persisted trace comparison missing or not matching the current exported trace");
  }
  if (
    !studioEvidence.bodyHasTraceComparisonReview ||
    !studioEvidence.bodyHasGateDiff ||
    (studioEvidence.firstTraceComparisonMetricRows ?? 0) < 4 ||
    (studioEvidence.firstTraceComparisonGateRows ?? 0) < 1
  ) {
    failures.push("studio-evidence: trace comparison review did not expose metric and gate diff rows");
  }
  if (
    !studioEvidence.bodyHasTraceFrameScrubber ||
    !studioEvidence.bodyHasTraceFrameDelta ||
    !studioEvidence.bodyHasTraceWorldDelta ||
    (studioEvidence.traceFrameCount ?? 0) < 2 ||
    studioEvidence.selectedTraceFrameIndex !== 1 ||
    !studioEvidence.selectedTraceFrameChecksum ||
    (studioEvidence.selectedTraceFrameDeltaActorChanges ?? 0) < 1 ||
    (studioEvidence.traceFrameDeltaRows ?? 0) < 1 ||
    !studioEvidence.selectedTraceFrameHasWorld ||
    (studioEvidence.traceWorldStatRows ?? 0) < 4 ||
    (studioEvidence.traceWorldEffectStoreRows ?? 0) < 1
  ) {
    failures.push("studio-evidence: trace frame scrubber did not expose selected frame timeline, frame diff, and world delta data");
  }
  if (!studioEvidence.topEvidenceAction) {
    failures.push("studio-evidence: top actionable next step missing from QA bridge");
  }
  if (
    studioDebug.mode !== "studio" ||
    studioDebug.studioTab !== "debug" ||
    studioDebug.studioDebugFilter !== "overview" ||
    !studioDebug.bodyHasDebug ||
    !studioDebug.bodyHasDebugLens ||
    !studioDebug.bodyHasActorRegistry ||
    !studioDebug.bodyHasActorExplorer ||
    !studioDebug.bodyHasActorDetail ||
    studioDebug.selectedDebugActorId !== "p1" ||
    !studioDebug.selectedDebugActorLabel ||
    studioDebug.selectedDebugActorKind !== "player" ||
    studioDebug.actorRegistryCount < 2 ||
    studioDebug.actorRegistryPlayers < 2 ||
    studioDebug.actorRegistryLifecycleLive < 2 ||
    !studioDebug.actorRegistryLifecycleStatuses.includes("active") ||
    studioDebug.actorRegistryLifecycleEvents < 2 ||
    studioDebug.actorRegistryRecentLifecycleEvents < 2 ||
    studioDebug.actorRegistryTargetLinks < 1 ||
    studioDebug.actorRegistryEffectStores < 2 ||
    !studioDebug.actorRegistryEffectStoreOwners.includes("p1")
  ) {
    failures.push("studio-debug: Runtime Debug Studio did not expose the actor registry");
  }
  if (
    studioDebug.debugLenses?.targets?.filter !== "targets" ||
    !studioDebug.debugLenses?.targets?.url?.includes("debug=targets") ||
    studioDebug.debugLenses?.targets?.selectedButtonPressed !== "true" ||
    !studioDebug.debugLenses?.targets?.bodyHasPanel ||
    studioDebug.debugLenses?.targets?.targetRows < 1 ||
    !studioDebug.debugLenses?.targets?.worldEvidence ||
    !studioDebug.debugLenses?.targets?.targetGateEvidence ||
    !studioDebug.debugLenses?.targets?.bodyHasTargetGateEvidenceCopy
  ) {
    failures.push("studio-debug: targets lens did not expose target-link rows, gate-evidence panel, and URL state");
  }
  if (
    studioDebug.debugLenses?.effects?.filter !== "effects" ||
    !studioDebug.debugLenses?.effects?.url?.includes("debug=effects") ||
    studioDebug.debugLenses?.effects?.selectedButtonPressed !== "true" ||
    !studioDebug.debugLenses?.effects?.bodyHasPanel ||
    studioDebug.debugLenses?.effects?.effectStoreRows < 1 ||
    !studioDebug.debugLenses?.effects?.worldEvidence ||
    studioDebug.debugLenses?.effects?.worldFrameRows < 1 ||
    !studioDebug.debugLenses?.effects?.effectDrilldown ||
    !studioDebug.debugLenses?.effects?.bodyHasEffectDrilldownCopy
  ) {
    failures.push("studio-debug: effects lens did not expose effect-store rows, drilldown contract, and URL state");
  }
  if (
    studioDebug.debugLenses?.pause?.filter !== "pause" ||
    !studioDebug.debugLenses?.pause?.url?.includes("debug=pause") ||
    studioDebug.debugLenses?.pause?.selectedButtonPressed !== "true" ||
    !studioDebug.debugLenses?.pause?.bodyHasPanel ||
    !studioDebug.debugLenses?.pause?.worldEvidence ||
    !studioDebug.debugLenses?.pause?.hitPauseCountText ||
    !studioDebug.debugLenses?.pause?.bodyHasHitPauseCopy
  ) {
    failures.push("studio-debug: pause lens did not expose pause/hitpause panel and URL state");
  }
  if (
    studioDebug.worldEvidenceJump?.mode !== "studio" ||
    studioDebug.worldEvidenceJump?.studioTab !== "evidence" ||
    !studioDebug.worldEvidenceJump?.bodyHasTraceFrameScrubber ||
    !studioDebug.worldEvidenceJump?.selectedTraceFrameHasWorld ||
    studioDebug.worldEvidenceJump?.selectedTraceFrameEffectStores < 1
  ) {
    failures.push("studio-debug: effect world evidence did not jump to a world-backed trace frame scrubber row");
  }
  if (
    studioDebug.debugLenses?.audio?.filter !== "audio" ||
    !studioDebug.debugLenses?.audio?.url?.includes("debug=audio") ||
    studioDebug.debugLenses?.audio?.selectedButtonPressed !== "true" ||
    !studioDebug.debugLenses?.audio?.bodyHasPanel
  ) {
    failures.push("studio-debug: audio lens did not expose audio panel and URL state");
  }
  if (
    studioDebug.p2Probe?.selectedDebugActorId !== "p2" ||
    !studioDebug.p2Probe?.bodyHasActorDetail ||
    studioDebug.p2Probe?.selectedDebugActorKind !== "player"
  ) {
    failures.push("studio-debug: actor selection probe did not preserve p2 detail before imported actor drilldown");
  }
  if (
    !studioDebug.bodyHasExecutionEvidence ||
    studioDebug.selectedDebugSessionActorId !== "p1" ||
    studioDebug.selectedDebugExecutedStates < 1 ||
    studioDebug.selectedDebugExecutedControllerKeys.length < 1 ||
    !studioDebug.bodyHasCommandHistory ||
    studioDebug.selectedDebugCommandHistorySamples < 1
  ) {
    failures.push("studio-debug: selected imported actor did not expose CNS execution and command-buffer evidence");
  }
  if (
    !studioDebug.bodyHasTraceEvidence ||
    !studioDebug.bodyHasLinkedTraceFrame ||
    !studioDebug.selectedDebugTraceChecksum ||
    studioDebug.selectedDebugTraceFrames < 1 ||
    studioDebug.selectedDebugTraceGateLinks < 1 ||
    studioDebug.selectedDebugTraceFinalActorId !== "p1" ||
    !studioDebug.selectedDebugTraceOperationKeys.includes("hitdef")
  ) {
    failures.push("studio-debug: selected imported actor did not expose linked trace evidence");
  }
  if (
    studioDebug.inspectorJump?.mode !== "inspect" ||
    !studioDebug.inspectorJump?.url?.includes("tab=states") ||
    !studioDebug.inspectorJump?.url?.toLowerCase().includes("filter=hitdef") ||
    !studioDebug.inspectorJump?.url?.toLowerCase().includes("controller=hitdef") ||
    !studioDebug.inspectorJump?.url?.toLowerCase().includes("state=") ||
    studioDebug.inspectorJump?.filterValue?.toLowerCase() !== "hitdef" ||
    !studioDebug.inspectorJump?.bodyHasHitDef ||
    !studioDebug.inspectorJump?.selectedState ||
    studioDebug.inspectorJump?.selectedController !== "hitdef" ||
    !studioDebug.inspectorJump?.selectedControllerLine ||
    !studioDebug.inspectorJump?.bodyHasControllerDetail
  ) {
    failures.push("studio-debug: controller/operation evidence did not jump to exact CNS controller inspector row");
  }
  if (
    !studioDebug.commandHistory?.bodyHasCommandHistory ||
    studioDebug.commandHistory?.sampleRows < 1 ||
    studioDebug.commandHistory?.commandLinks < 1 ||
    studioDebug.commandJump?.mode !== "inspect" ||
    !studioDebug.commandJump?.url?.includes("tab=commands") ||
    !studioDebug.commandJump?.url?.toLowerCase().includes("command=") ||
    !studioDebug.commandJump?.selectedCommand ||
    !studioDebug.commandJump?.bodyHasCommandDetail
  ) {
    failures.push("studio-debug: command-buffer evidence did not jump to exact CMD command inspector row");
  }
  if (diagnostics.pageErrors.length > 0) {
    failures.push(`page errors: ${diagnostics.pageErrors.join(" | ")}`);
  }
  if (diagnostics.consoleIssues.length > 0) {
    failures.push(`console issues: ${diagnostics.consoleIssues.map((issue) => issue.text).join(" | ")}`);
  }
  if (failures.length) {
    throw new Error(`QA smoke failed:\n${failures.join("\n")}`);
  }
}

function expectedPresentationRenderOrder(semantic) {
  if (!semantic) {
    return Number.NaN;
  }
  const phaseRank = {
    "stage-background": 0,
    "actor-underlay": 1,
    actor: 2,
    effect: 3,
    "stage-foreground": 4,
    debug: 5,
    overlay: 6,
  }[semantic.phase];
  if (phaseRank === undefined) {
    return Number.NaN;
  }
  const boundedPriority = Math.max(-9_999, Math.min(9_999, semantic.priority));
  const boundedTieBreaker = Math.max(-49, Math.min(49, semantic.tieBreaker));
  return phaseRank * 10_000_000 + boundedPriority * 100 + boundedTieBreaker;
}

function sameIdSet(actual, expected) {
  return actual.length === expected.length && expected.every((id) => actual.includes(id));
}

function summarizeMugenLiteCombat(combat) {
  return {
    importedId: combat.importedId,
    roster: combat.roster,
    returnedToIdle: combat.returnedToIdle,
    states: Object.fromEntries(["getHit", "fallMotion", "fallen"].map((id) => [id, {
      state: combat[id].actorState,
      frame: combat[id].actorFrame,
      life: combat[id].actorLife,
      spritePixels: combat[id].spritePixels,
    }])),
  };
}

function summarizeMugenLiteRecovery(recovery) {
  return {
    roster: recovery.roster,
    returnedToIdle: recovery.returnedToIdle,
    states: Object.fromEntries(["getHit", "fallMotion", "fallen", "recovery"].map((id) => [id, {
      state: recovery[id].actorState,
      frame: recovery[id].actorFrame,
      life: recovery[id].actorLife,
      spritePixels: recovery[id].spritePixels,
    }])),
  };
}

function summarizeMugenLiteGuard(guard) {
  return {
    roster: guard.roster,
    returnedToIdle: guard.returnedToIdle,
    guarded: {
      state: guard.guarded.actorState,
      frame: guard.guarded.actorFrame,
      life: guard.guarded.actorLife,
      guarding: guard.guarded.actorGuarding,
      spritePixels: guard.guarded.spritePixels,
    },
  };
}

function summarizeDiagnostics(diagnostics) {
  return {
    status: "passed",
    baseUrl: diagnostics.baseUrl,
    serverMode: diagnostics.serverMode,
    browserPath: diagnostics.browserPath,
    runtimeDesktop: {
      actors: diagnostics.checks.runtimeDesktop.actorCount,
      uniqueColors: diagnostics.checks.runtimeDesktop.canvasPixels.uniqueColors,
      hitSparks: diagnostics.checks.runtimeDesktop.activeHitSparks,
      hitSparkSources: diagnostics.checks.runtimeDesktop.hitSparkSources,
      hitSparkResolvedSprites: diagnostics.checks.runtimeDesktop.hitSparkResolvedSprites,
      characterPresentations: diagnostics.checks.runtimeDesktop.characterPresentations.length,
    },
    runtimeMobile: {
      actors: diagnostics.checks.runtimeMobile.actorCount,
      uniqueColors: diagnostics.checks.runtimeMobile.canvasPixels.uniqueColors,
      hitSparks: diagnostics.checks.runtimeMobile.activeHitSparks,
      hitSparkSources: diagnostics.checks.runtimeMobile.hitSparkSources,
      hitSparkResolvedSprites: diagnostics.checks.runtimeMobile.hitSparkResolvedSprites,
      characterPresentations: diagnostics.checks.runtimeMobile.characterPresentations.length,
    },
    mugenLiteVisual: {
      fixtureBytes: diagnostics.checks.mugenLiteVisual.fixtureBytes,
      desktopSprite: diagnostics.checks.mugenLiteVisual.desktop.sprite,
      desktopFrame: diagnostics.checks.mugenLiteVisual.desktop.actorFrame,
      desktopUniqueColors: diagnostics.checks.mugenLiteVisual.desktop.canvasPixels.uniqueColors,
      desktopSpritePixels: diagnostics.checks.mugenLiteVisual.desktop.spritePixels,
      desktopAttackFrame: diagnostics.checks.mugenLiteVisual.desktop.attack.actorFrame,
      desktopAttackSpritePixels: diagnostics.checks.mugenLiteVisual.desktop.attack.spritePixels,
      desktopAttackFollowThroughFrame: diagnostics.checks.mugenLiteVisual.desktop.attackFollowThrough.actorFrame,
      desktopAttackFollowThroughSpritePixels: diagnostics.checks.mugenLiteVisual.desktop.attackFollowThrough.spritePixels,
      desktopPalette: {
        state: diagnostics.checks.mugenLiteVisual.desktop.palette.palette.actorState,
        frame: diagnostics.checks.mugenLiteVisual.desktop.palette.palette.actorFrame,
        remap: diagnostics.checks.mugenLiteVisual.desktop.palette.palette.actorPaletteRemap,
        spritePixels: diagnostics.checks.mugenLiteVisual.desktop.palette.palette.spritePixels,
        returnedToIdle: diagnostics.checks.mugenLiteVisual.desktop.palette.returnedToIdle,
      },
      desktopMovement: Object.fromEntries(Object.entries(diagnostics.checks.mugenLiteVisual.desktop.movement).map(([id, probe]) => [id, {
        frame: probe.actorFrame,
        spritePixels: probe.spritePixels,
        returnedToIdle: probe.returnedToIdle,
      }])),
      desktopCombat: summarizeMugenLiteCombat(diagnostics.checks.mugenLiteVisual.desktop.combat),
      desktopRecovery: summarizeMugenLiteRecovery(diagnostics.checks.mugenLiteVisual.desktop.recovery),
      desktopGuard: summarizeMugenLiteGuard(diagnostics.checks.mugenLiteVisual.desktop.guard),
      mobileSprite: diagnostics.checks.mugenLiteVisual.mobile.sprite,
      mobileFrame: diagnostics.checks.mugenLiteVisual.mobile.actorFrame,
      mobileUniqueColors: diagnostics.checks.mugenLiteVisual.mobile.canvasPixels.uniqueColors,
      mobileSpritePixels: diagnostics.checks.mugenLiteVisual.mobile.spritePixels,
      mobileAttackFrame: diagnostics.checks.mugenLiteVisual.mobile.attack.actorFrame,
      mobileAttackSpritePixels: diagnostics.checks.mugenLiteVisual.mobile.attack.spritePixels,
      mobileAttackFollowThroughFrame: diagnostics.checks.mugenLiteVisual.mobile.attackFollowThrough.actorFrame,
      mobileAttackFollowThroughSpritePixels: diagnostics.checks.mugenLiteVisual.mobile.attackFollowThrough.spritePixels,
      mobilePalette: {
        state: diagnostics.checks.mugenLiteVisual.mobile.palette.palette.actorState,
        frame: diagnostics.checks.mugenLiteVisual.mobile.palette.palette.actorFrame,
        remap: diagnostics.checks.mugenLiteVisual.mobile.palette.palette.actorPaletteRemap,
        spritePixels: diagnostics.checks.mugenLiteVisual.mobile.palette.palette.spritePixels,
        returnedToIdle: diagnostics.checks.mugenLiteVisual.mobile.palette.returnedToIdle,
      },
      mobileMovement: Object.fromEntries(Object.entries(diagnostics.checks.mugenLiteVisual.mobile.movement).map(([id, probe]) => [id, {
        frame: probe.actorFrame,
        spritePixels: probe.spritePixels,
        returnedToIdle: probe.returnedToIdle,
      }])),
      mobileCombat: summarizeMugenLiteCombat(diagnostics.checks.mugenLiteVisual.mobile.combat),
      mobileRecovery: summarizeMugenLiteRecovery(diagnostics.checks.mugenLiteVisual.mobile.recovery),
      mobileGuard: summarizeMugenLiteGuard(diagnostics.checks.mugenLiteVisual.mobile.guard),
    },
    codeFuManVisual: diagnostics.checks.codeFuManVisual.skipped
      ? { skipped: true, reason: diagnostics.checks.codeFuManVisual.reason }
      : {
          skipped: false,
          initial: {
            character: diagnostics.checks.codeFuManVisual.initial.character,
            actorState: diagnostics.checks.codeFuManVisual.initial.actorState,
            actorFrame: diagnostics.checks.codeFuManVisual.initial.actorFrame,
            uniqueColors: diagnostics.checks.codeFuManVisual.initial.canvasPixels.uniqueColors,
            spriteUniqueColors: diagnostics.checks.codeFuManVisual.initial.spritePixels.uniqueColors,
          },
          attack: {
            actorState: diagnostics.checks.codeFuManVisual.attack.actorState,
            actorFrame: diagnostics.checks.codeFuManVisual.attack.actorFrame,
            uniqueColors: diagnostics.checks.codeFuManVisual.attack.canvasPixels.uniqueColors,
            spriteUniqueColors: diagnostics.checks.codeFuManVisual.attack.spritePixels.uniqueColors,
          },
          special: {
            actorState: diagnostics.checks.codeFuManVisual.special.actorState,
            actorFrame: diagnostics.checks.codeFuManVisual.special.actorFrame,
            uniqueColors: diagnostics.checks.codeFuManVisual.special.canvasPixels.uniqueColors,
            spriteUniqueColors: diagnostics.checks.codeFuManVisual.special.spritePixels.uniqueColors,
          },
          upper: {
            actorState: diagnostics.checks.codeFuManVisual.upper.actorState,
            actorFrame: diagnostics.checks.codeFuManVisual.upper.actorFrame,
            uniqueColors: diagnostics.checks.codeFuManVisual.upper.canvasPixels.uniqueColors,
            spriteUniqueColors: diagnostics.checks.codeFuManVisual.upper.spritePixels.uniqueColors,
          },
          returnedToIdle: diagnostics.checks.codeFuManVisual.returnedToIdle,
          specialReturnedToIdle: diagnostics.checks.codeFuManVisual.specialReturnedToIdle,
          upperReturnedToIdle: diagnostics.checks.codeFuManVisual.upperReturnedToIdle,
        },
    tagPresentation: {
      baseline: diagnostics.checks.tagPresentation.baseline.drawRootIds,
      desktop: diagnostics.checks.tagPresentation.desktop.drawRootIds,
      mobile: diagnostics.checks.tagPresentation.mobile.drawRootIds,
      reset: diagnostics.checks.tagPresentation.reset.drawRootIds,
      desktopRenderer: diagnostics.checks.tagPresentation.desktop.rendererActorIds,
      mobileRenderer: diagnostics.checks.tagPresentation.mobile.rendererActorIds,
      desktopCollision: diagnostics.checks.tagPresentation.desktop.collisionActorIds,
      mobileCollision: diagnostics.checks.tagPresentation.mobile.collisionActorIds,
      desktopUniqueColors: diagnostics.checks.tagPresentation.desktop.canvasPixels.uniqueColors,
      mobileUniqueColors: diagnostics.checks.tagPresentation.mobile.canvasPixels.uniqueColors,
    },
    studioWorkbench: {
      tab: diagnostics.checks.studioWorkbench.studioTab,
      chromeFields: diagnostics.checks.studioWorkbench.chromeFieldCount,
      primaryActions: diagnostics.checks.studioWorkbench.primaryActionCount,
      pipelineSteps: diagnostics.checks.studioWorkbench.pipelineStepCount,
      activeIssues: diagnostics.checks.studioWorkbench.activeIssueRows,
      canvasArea: diagnostics.checks.studioWorkbench.canvasArea,
      consoleCollapsed: diagnostics.checks.studioWorkbench.consoleCollapsed,
      consoleHeight: diagnostics.checks.studioWorkbench.consoleHeight,
      navigatorVisible: diagnostics.checks.studioWorkbench.navigatorVisible,
      overflowX: diagnostics.checks.studioWorkbench.overflowX,
      projectAuthoring: diagnostics.checks.studioWorkbench.projectAuthoring,
    },
    studioWorkbenchTablet: {
      tab: diagnostics.checks.studioWorkbenchTablet.studioTab,
      clientWidth: diagnostics.checks.studioWorkbenchTablet.clientWidth,
      bodyScrollWidth: diagnostics.checks.studioWorkbenchTablet.bodyScrollWidth,
      documentScrollWidth: diagnostics.checks.studioWorkbenchTablet.documentScrollWidth,
      stageStatusVisible: diagnostics.checks.studioWorkbenchTablet.stageStatusVisible,
      overflowX: diagnostics.checks.studioWorkbenchTablet.overflowX,
    },
    commandPaletteA11y: {
      opened: diagnostics.checks.commandPaletteA11y.opened,
      searchFocused: diagnostics.checks.commandPaletteA11y.searchFocused,
      arrowChangedActiveResult: diagnostics.checks.commandPaletteA11y.arrowChangedActiveResult,
      keyboardEnterExecutedBuild: diagnostics.checks.commandPaletteA11y.keyboardEnterExecutedBuild,
      focusStayedInsideAfterShiftTab: diagnostics.checks.commandPaletteA11y.focusStayedInsideAfterShiftTab,
      focusStayedInsideAfterManyTabs: diagnostics.checks.commandPaletteA11y.focusStayedInsideAfterManyTabs,
      closedOnEscape: diagnostics.checks.commandPaletteA11y.closedOnEscape,
      focusRestoredToLauncher: diagnostics.checks.commandPaletteA11y.focusRestoredToLauncher,
    },
    studioBuild: {
      compiledProject: diagnostics.checks.studioBuild.compiledProject,
      traceArtifactStatus: diagnostics.checks.studioBuild.traceArtifactStatus,
      checksum: diagnostics.checks.studioBuild.traceArtifactChecksum,
      contractSchema: diagnostics.checks.studioBuild.downloadedPackage?.runtimeContractSchema,
      sharedContracts: diagnostics.checks.studioBuild.downloadedPackage?.runtimeSharedContracts,
      moduleContracts: diagnostics.checks.studioBuild.downloadedPackage?.runtimeModuleContracts,
      stageReports: diagnostics.checks.studioBuild.stageReports,
      stageLayerReports: diagnostics.checks.studioBuild.stageLayerReports,
      stageLayerStatuses: diagnostics.checks.studioBuild.stageLayerStatuses,
      packageFiles: diagnostics.checks.studioBuild.downloadedPackage?.fileCount,
      bundledAssets: diagnostics.checks.studioBuild.downloadedPackage?.binaryBundled,
      bundledBytes: diagnostics.checks.studioBuild.downloadedPackage?.binaryBytes,
      importedFixture: diagnostics.checks.studioBuild.importedFixtureName ?? null,
      importedBundledAssets: diagnostics.checks.studioBuild.downloadedPackage?.importedBundledAssetRecords,
      sourcePackages: diagnostics.checks.studioBuild.downloadedPackage?.projectSourcePackages,
      linkedSourcePackages: diagnostics.checks.studioBuild.downloadedPackage?.linkedProjectSourcePackages,
      sourceRequiredPaths: diagnostics.checks.studioBuild.downloadedPackage?.projectSourceRequiredPaths,
      sourceFileDigests: diagnostics.checks.studioBuild.downloadedPackage?.projectSourceFileDigests,
      provenanceSchema: diagnostics.checks.studioBuild.provenanceSchema,
      provenanceRecords: diagnostics.checks.studioBuild.provenanceRecords,
      provenanceInputFiles: diagnostics.checks.studioBuild.provenanceInputFiles,
      provenanceOutputFiles: diagnostics.checks.studioBuild.provenanceOutputFiles,
      provenanceCompleteRecords: diagnostics.checks.studioBuild.provenanceCompleteRecords,
      provenanceFilePathLeaks: diagnostics.checks.studioBuild.provenanceFilePathLeaks,
      architectureGateStatus: diagnostics.checks.studioBuild.architectureGateStatus,
      architectureEvidenceRecord: diagnostics.checks.studioBuild.architectureEvidenceRecord,
      bodyHasArchitectureBoundaries: diagnostics.checks.studioBuild.bodyHasArchitectureBoundaries,
      trustChainRows: diagnostics.checks.studioBuild.trustChainRows,
      trustChainIds: diagnostics.checks.studioBuild.trustChainIds,
      trustChainTargets: diagnostics.checks.studioBuild.trustChainTargets,
      trustChainDeltas: diagnostics.checks.studioBuild.trustChainDeltas,
      trustChainBlocked: diagnostics.checks.studioBuild.trustChainBlocked,
      trustFocusedRow: diagnostics.checks.studioBuild.trustFocusedRow,
      trustFocusedRowClass: diagnostics.checks.studioBuild.trustFocusedRowClass,
      provenanceSchema: diagnostics.checks.studioAssets.provenanceSchema,
      provenanceRecords: diagnostics.checks.studioAssets.provenanceRecords,
      provenanceReady: diagnostics.checks.studioAssets.provenanceReady,
      provenanceInputFiles: diagnostics.checks.studioAssets.provenanceInputFiles,
      provenanceOutputFiles: diagnostics.checks.studioAssets.provenanceOutputFiles,
      provenanceFilePathLeaks: diagnostics.checks.studioAssets.provenanceFilePathLeaks,
      selectedProvenanceStatus: diagnostics.checks.studioAssets.selectedProvenanceStatus,
      provenanceAbsolutePathLeaks: diagnostics.checks.studioAssets.provenanceAbsolutePathLeaks,
    },
    studioModules: {
      schema: diagnostics.checks.studioModules.contractSchema,
      sharedContracts: diagnostics.checks.studioModules.sharedContracts,
      moduleContracts: diagnostics.checks.studioModules.moduleContracts,
      sharedCoreForbidden: diagnostics.checks.studioModules.sharedCoreForbidden,
      platformerForbidden: diagnostics.checks.studioModules.platformerForbidden,
      modulesWithConsumes: diagnostics.checks.studioModules.modulesWithConsumes,
    },
    studioSourceRelink: diagnostics.checks.studioSourceRelink?.skipped
      ? { skipped: true, reason: diagnostics.checks.studioSourceRelink.reason }
      : {
          beforeMissing: diagnostics.checks.studioSourceRelink?.before?.missing,
          beforeRelinkButtons: diagnostics.checks.studioSourceRelink?.before?.relinkButtons,
          afterLinked: diagnostics.checks.studioSourceRelink?.after?.linked,
          afterMissing: diagnostics.checks.studioSourceRelink?.after?.missing,
          identity: diagnostics.checks.studioSourceRelink?.after?.identity,
          sourceTransactions: diagnostics.checks.studioSourceRelink?.after?.sourceTransactions?.map((record) => ({
            schemaVersion: record.schemaVersion,
            state: record.state,
            permission: record.permission,
            revisionStatus: record.revisionStatus,
            canRead: record.canRead,
            canWrite: record.canWrite,
            nextAction: record.nextAction,
            invalidatedOutputs: record.invalidatedOutputs,
          })),
          sourceHandles: diagnostics.checks.studioSourceRelink?.after?.sourceHandles?.map((record) => ({
            schemaVersion: record.schemaVersion,
            state: record.state,
            capability: record.capability,
            storage: record.storage,
            persisted: record.persisted,
            permission: record.permission,
            canRead: record.canRead,
            nextAction: record.nextAction,
          })),
          requiredPaths: diagnostics.checks.studioSourceRelink?.after?.requiredPaths,
          rejected: diagnostics.checks.studioSourceRelink?.rejected
            ? {
                status: diagnostics.checks.studioSourceRelink.rejected.status,
                reason: diagnostics.checks.studioSourceRelink.rejected.reason,
                currentSourceStatus: diagnostics.checks.studioSourceRelink.rejected.currentSourceStatus,
                currentIdentityStatus: diagnostics.checks.studioSourceRelink.rejected.currentIdentityStatus,
                transactionFingerprint: diagnostics.checks.studioSourceRelink.rejected.transactionFingerprint,
                currentFingerprint: diagnostics.checks.studioSourceRelink.rejected.currentFingerprint,
                sourceTransaction: diagnostics.checks.studioSourceRelink.rejected.sourceTransaction,
                bodyHasSourceRejected: diagnostics.checks.studioSourceRelink.rejected.bodyHasSourceRejected,
                bodyHasRetainedSession: diagnostics.checks.studioSourceRelink.rejected.bodyHasRetainedSession,
              }
            : undefined,
        },
    studioFolderHandleRecovery: diagnostics.checks.studioFolderHandleRecovery?.skipped
      ? { skipped: true, reason: diagnostics.checks.studioFolderHandleRecovery.reason }
      : {
          fixtureEntries: diagnostics.checks.studioFolderHandleRecovery?.fixtureEntries,
          before: {
            kind: diagnostics.checks.studioFolderHandleRecovery?.before?.kind,
            missing: diagnostics.checks.studioFolderHandleRecovery?.before?.missing,
            handle: diagnostics.checks.studioFolderHandleRecovery?.before?.sourceHandle,
          },
          after: {
            mode: diagnostics.checks.studioFolderHandleRecovery?.after?.mode,
            studioTab: diagnostics.checks.studioFolderHandleRecovery?.after?.studioTab,
            character: diagnostics.checks.studioFolderHandleRecovery?.after?.character,
            sourcePackage: {
              status: diagnostics.checks.studioFolderHandleRecovery?.after?.sourcePackage?.status,
              identityStatus: diagnostics.checks.studioFolderHandleRecovery?.after?.sourcePackage?.identityStatus,
            },
            sourceHandle: diagnostics.checks.studioFolderHandleRecovery?.after?.sourceHandle,
            sourceTransaction: diagnostics.checks.studioFolderHandleRecovery?.after?.sourceTransaction,
            bodyHasSourcePackages: diagnostics.checks.studioFolderHandleRecovery?.after?.bodyHasSourcePackages,
            bodyHasLinkedCopy: diagnostics.checks.studioFolderHandleRecovery?.after?.bodyHasLinkedCopy,
            bodyHasFolderHandle: diagnostics.checks.studioFolderHandleRecovery?.after?.bodyHasFolderHandle,
          },
        },
    ikemenScan: {
      detected: diagnostics.checks.ikemenScan.detected,
      findings: diagnostics.checks.ikemenScan.findings,
      screenpackFiles: diagnostics.checks.ikemenScan.screenpackFiles,
      zssFiles: diagnostics.checks.ikemenScan.zssFiles,
      luaFiles: diagnostics.checks.ikemenScan.luaFiles,
      modelFiles: diagnostics.checks.ikemenScan.modelFiles,
    },
    studioStage: {
      selectedStage: diagnostics.checks.studioStage.selectedStage,
      reports: diagnostics.checks.studioStage.stageReports,
      layers: diagnostics.checks.studioStage.layerReports,
      statuses: diagnostics.checks.studioStage.layerStatuses,
      renderedOrAnimated: diagnostics.checks.studioStage.renderedOrAnimatedLayers,
      missingOrUnsupported: diagnostics.checks.studioStage.missingOrUnsupportedLayers,
      bgControllers: diagnostics.checks.studioStage.bgControllerReports,
      bgControllersParsed: diagnostics.checks.studioStage.bgControllerParsed,
      bgControllersBounded: diagnostics.checks.studioStage.bgControllerBounded,
      bgControllersUnsupported: diagnostics.checks.studioStage.bgControllerUnsupported,
    },
    studioBgCtrlStage: {
      selectedStage: diagnostics.checks.studioBgCtrlStage.selectedStage,
      snapshotStage: diagnostics.checks.studioBgCtrlStage.snapshotStage,
      groups: diagnostics.checks.studioBgCtrlStage.bgControllerGroups,
      controllers: diagnostics.checks.studioBgCtrlStage.bgControllers,
      types: diagnostics.checks.studioBgCtrlStage.bgControllerTypes,
      uniqueColors: diagnostics.checks.studioBgCtrlStage.canvasPixels?.uniqueColors,
    },
    studioAssets: {
      filter: diagnostics.checks.studioAssets.assetFilter,
      total: diagnostics.checks.studioAssets.assetTotal,
      visible: diagnostics.checks.studioAssets.visibleAssets,
      attention: diagnostics.checks.studioAssets.attentionAssets,
      selected: diagnostics.checks.studioAssets.selectedAssetId,
      selectedNextAction: diagnostics.checks.studioAssets.selectedAssetNextAction,
      dependencies: diagnostics.checks.studioAssets.selectedDependencies,
      graphNodes: diagnostics.checks.studioAssets.dependencyGraphNodes,
      sourceRuntimeRecords: diagnostics.checks.studioAssets.sourceRuntimeRecords,
    },
    studioReplacement: {
      candidate: diagnostics.checks.studioReplacement.candidateId,
      applied: diagnostics.checks.studioReplacement.applied,
      entry: diagnostics.checks.studioReplacement.after?.entry,
    },
    studioEvidence: {
      filter: diagnostics.checks.studioEvidence.evidenceFilter,
      traceArtifacts: diagnostics.checks.studioEvidence.traceArtifacts,
      persistedTraceArtifacts: diagnostics.checks.studioEvidence.persistedTraceArtifacts,
      persistedTraceComparisons: diagnostics.checks.studioEvidence.persistedTraceComparisons,
      firstPersistedTraceComparisonMatch: diagnostics.checks.studioEvidence.firstPersistedTraceComparisonMatch,
      metricRows: diagnostics.checks.studioEvidence.firstTraceComparisonMetricRows,
      gateRows: diagnostics.checks.studioEvidence.firstTraceComparisonGateRows,
      frameCount: diagnostics.checks.studioEvidence.traceFrameCount,
      selectedFrame: diagnostics.checks.studioEvidence.selectedTraceFrameIndex,
      frameDeltaRows: diagnostics.checks.studioEvidence.traceFrameDeltaRows,
      actorDeltaRows: diagnostics.checks.studioEvidence.selectedTraceFrameDeltaActorChanges,
      worldDeltaStats: diagnostics.checks.studioEvidence.traceWorldStatRows,
      latestTraceStatus: diagnostics.checks.studioEvidence.latestTraceStatus,
      topAction: diagnostics.checks.studioEvidence.topEvidenceAction,
      architectureGateRecord: diagnostics.checks.studioEvidence.hasArchitectureGateRecord,
      architectureEvidenceRecord: diagnostics.checks.studioEvidence.hasArchitectureEvidenceRecord,
      architectureEvidenceStatus: diagnostics.checks.studioEvidence.architectureEvidenceStatus,
      trustChainRows: diagnostics.checks.studioEvidence.trustChainRows,
      trustChainIds: diagnostics.checks.studioEvidence.trustChainIds,
      trustChainTargets: diagnostics.checks.studioEvidence.trustChainTargets,
      trustChainDeltas: diagnostics.checks.studioEvidence.trustChainDeltas,
      trustChainBlocked: diagnostics.checks.studioEvidence.trustChainBlocked,
    },
    studioDebug: {
      actors: diagnostics.checks.studioDebug.actorRegistryCount,
      players: diagnostics.checks.studioDebug.actorRegistryPlayers,
      selectedActor: diagnostics.checks.studioDebug.selectedDebugActorId,
      selectedActorLabel: diagnostics.checks.studioDebug.selectedDebugActorLabel,
      selectedActorState: diagnostics.checks.studioDebug.selectedDebugActorState,
      sessionActor: diagnostics.checks.studioDebug.selectedDebugSessionActorId,
      controllerKeys: diagnostics.checks.studioDebug.selectedDebugExecutedControllerKeys,
      operationKeys: diagnostics.checks.studioDebug.selectedDebugExecutedOperationKeys,
      activeCommands: diagnostics.checks.studioDebug.selectedDebugActiveCommands,
      commandHistorySamples: diagnostics.checks.studioDebug.selectedDebugCommandHistorySamples,
      debugLenses: {
        targets: {
          rows: diagnostics.checks.studioDebug.debugLenses?.targets?.targetRows,
          worldFrames: diagnostics.checks.studioDebug.debugLenses?.targets?.worldFrameRows,
          gatePanel: diagnostics.checks.studioDebug.debugLenses?.targets?.targetGateEvidence,
          gateRows: diagnostics.checks.studioDebug.debugLenses?.targets?.targetGateEvidenceRows,
        },
        effects: {
          stores: diagnostics.checks.studioDebug.debugLenses?.effects?.effectStoreRows,
          worldFrames: diagnostics.checks.studioDebug.debugLenses?.effects?.worldFrameRows,
          drilldown: diagnostics.checks.studioDebug.debugLenses?.effects?.effectDrilldownKind,
        },
        pause: {
          panel: diagnostics.checks.studioDebug.debugLenses?.pause?.bodyHasPanel,
          worldEvidence: diagnostics.checks.studioDebug.debugLenses?.pause?.worldEvidence,
        },
        audio: diagnostics.checks.studioDebug.debugLenses?.audio?.bodyHasPanel,
      },
      worldEvidenceJump: diagnostics.checks.studioDebug.worldEvidenceJump,
      traceChecksum: diagnostics.checks.studioDebug.selectedDebugTraceChecksum,
      traceFrames: diagnostics.checks.studioDebug.selectedDebugTraceFrames,
      traceGateLinks: diagnostics.checks.studioDebug.selectedDebugTraceGateLinks,
      traceOperationKeys: diagnostics.checks.studioDebug.selectedDebugTraceOperationKeys,
      inspectorJumpFilter: diagnostics.checks.studioDebug.inspectorJump?.filterValue,
      inspectorJumpState: diagnostics.checks.studioDebug.inspectorJump?.selectedState,
      inspectorJumpController: diagnostics.checks.studioDebug.inspectorJump?.selectedController,
      commandJump: diagnostics.checks.studioDebug.commandJump?.selectedCommand,
      live: diagnostics.checks.studioDebug.actorRegistryLifecycleLive,
      events: diagnostics.checks.studioDebug.actorRegistryLifecycleEvents,
      targets: diagnostics.checks.studioDebug.actorRegistryTargetLinks,
      stores: diagnostics.checks.studioDebug.actorRegistryEffectStores,
    },
    screenshots: diagnostics.screenshots,
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
