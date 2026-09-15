const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const outDir = path.resolve(root, process.env.QA_FIGHTER_LAB_OUT_DIR ?? ".scratch/qa/fighter-lab-gate");

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await resolveServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "assert") {
      consoleErrors.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  try {
    const response = await page.goto(
      `${server.baseUrl}/?mode=lab&fighter=rocco-vidal&action=200&frame=2`,
      { waitUntil: "domcontentloaded", timeout: 30_000 },
    );
    assert(response?.ok(), `Fighter Lab route returned HTTP ${response?.status() ?? "unknown"}`);
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "lab", null, { timeout: 30_000 });
    await page.waitForFunction(() => (window.__MUGEN_WEB_SANDBOX__?.renderer?.render?.calls ?? 0) > 0, null, { timeout: 30_000 });
    await page.waitForFunction(() => document.querySelector(".fighter-lab-atlas-preview img")?.naturalWidth > 0, null, { timeout: 30_000 });
    await page.waitForTimeout(450);

    const rocco = await readState(page);
    assert(rocco.shell.left === "open" && rocco.shell.right === "open", "Fighter Lab drawers are not available");
    assert(rocco.fighterButtons === 2, `Expected 2 fighter choices, found ${rocco.fighterButtons}`);
    assert(rocco.actionButtons === 17, `Expected 14 actions plus 3 VFX, found ${rocco.actionButtons}`);
    assert(rocco.frameButtons === 4, `Expected 4 light-strike frames, found ${rocco.frameButtons}`);
    assert(rocco.snapshot.action === 200 && rocco.snapshot.frame === 2 && rocco.snapshot.playing === false, "Deep-linked action/frame was not held paused");
    assert(rocco.inspection?.schema === "FighterLabInspection/v0", "Lab inspection observation missing");
    assert(rocco.inspection?.package?.id && rocco.inspection?.package?.digest, "Lab inspection is not package-bound");
    assert(rocco.inspection?.identity?.actionNo === 200 && rocco.inspection?.identity?.frameIndex === 2, "Inspection frame does not match seek");
    assert(rocco.inspection?.sprite, "Inspection sprite missing");
    assert(rocco.inspection?.manualVerdict === undefined, "Mechanical atlas must not become a manual verdict");
    assert(rocco.atlasLoaded && rocco.renderCalls > 0, "Atlas or WebGL preview did not load");
    assert(JSON.stringify(rocco.activeRootIds) === JSON.stringify(["p1", "p2"]), "Active root bridge did not expose the initial pair");
    assert(Array.isArray(rocco.helperTeamResourceBindings), "Helper resource binding bridge is missing");
    await page.screenshot({ path: path.join(outDir, "rocco-light-strike-frame-3.png") });
    await clickStable(page, '.fighter-lab-frame[data-lab-frame-index="0"]');
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.[0]?.runtime?.frameIndex === 0);
    await clickStable(page, '.fighter-lab-frame[data-lab-frame-index="2"]');
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.[0]?.runtime?.frameIndex === 2);
    const roccoAgain = await readState(page);
    assert(JSON.stringify(roccoAgain.inspection?.sprite) === JSON.stringify(rocco.inspection?.sprite), "Second seek changed sprite metadata");
    assert(roccoAgain.inspection?.identity?.spriteOwnerId === rocco.inspection?.identity?.spriteOwnerId, "Second seek changed resource owner");
    assert(roccoAgain.inspection?.package?.digest === rocco.inspection?.package?.digest, "Package digest drifted on seek");
    await clickStable(page, '.workspace-actions [data-action="play-pause"]');
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === true);
    await clickStable(page, '.workspace-actions [data-action="reset-round"]');
    const reset = await readState(page);
    assert(reset.snapshot.playing === false && reset.snapshot.frame === 0, "Reset did not restore paused frame 0");
    assert(reset.inspection?.tick === 0, "Reset leaked previous tick");
    assert((reset.inspection?.effects?.afterImageSamples ?? 0) === 0, "Reset leaked AfterImage samples");

    await clickStable(page, '[data-lab-fighter-id="nadia-arce"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("fighter") === "nadia-arce");
    await clickStable(page, '.fighter-lab-action[data-lab-action-id="220"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("action") === "220");
    await clickStable(page, '.fighter-lab-frame[data-lab-frame-index="7"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("frame") === "7");
    const nadia = await readState(page);
    assert(nadia.selectedFighter === "Nadia Arce", `Expected Nadia Arce, found ${nadia.selectedFighter ?? "none"}`);
    assert(nadia.snapshot.action === 220 && nadia.snapshot.frame === 7 && nadia.snapshot.playing === false, "Nadia special frame 8 was not selected");
    assert(nadia.frameButtons === 8, `Expected 8 special frames, found ${nadia.frameButtons}`);
    await page.screenshot({ path: path.join(outDir, "nadia-special-frame-8.png") });

    await clickStable(page, '.fighter-lab-action[data-lab-action-id="7001"]');
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.selectedActionId === 7001);
    const effect = await readState(page);
    assert(effect.snapshot.action === 7001 && effect.frameButtons === 3, "Hit-spark VFX preview did not expose 3 frames");

    await clickStable(page, '.fighter-lab-view-switch [data-lab-view="gallery"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("labView") === "gallery");
    const gallery = await readState(page);
    assert(gallery.galleryView === "gallery", "Character Gallery view did not open");
    assert(gallery.galleryCards === 2, `Expected 2 gallery cards, found ${gallery.galleryCards}`);
    assert(gallery.galleryActionIndex >= 14, "Character Gallery did not expose the complete animation index");
    await page.screenshot({ path: path.join(outDir, "character-gallery.png") });

    await clickStable(page, '.fighter-lab-view-switch [data-lab-view="showcase"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("labView") === "showcase");
    const showcase = await readState(page);
    assert(showcase.showcaseView === "showcase", "Character Showcase view did not open");
    assert(showcase.showcaseCards === 2, `Expected 2 showcase cards, found ${showcase.showcaseCards}`);
    assert(showcase.showcaseActionButtons >= 10, "Character Showcase did not expose quick animation actions");
    await clickStable(page, '.fighter-showcase-actions [data-lab-fighter-id="rocco-vidal"][data-lab-action-id="220"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("action") === "220");
    assert((await readState(page)).snapshot.action === 220, "Showcase action did not drive runtime stage");
    await page.screenshot({ path: path.join(outDir, "character-showcase.png") });

    await clickStable(page, '.fighter-lab-view-switch [data-lab-view="matrix"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("labView") === "matrix");
    const matrix = await readState(page);
    assert(matrix.matrixView === "matrix", "Character Matrix view did not open");
    assert(matrix.matrixCharacters === 2, `Expected 2 matrix characters, found ${matrix.matrixCharacters}`);
    assert(matrix.matrixActions === 34, `Expected every roster action in the matrix, found ${matrix.matrixActions}`);
    assert(matrix.matrixComponents === 12, `Expected 6 component checks per fighter, found ${matrix.matrixComponents}`);
    await clickStable(page, '.fighter-matrix-action[data-lab-fighter-id="nadia-arce"][data-lab-action-id="510"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("fighter") === "nadia-arce" && new URLSearchParams(location.search).get("action") === "510");
    const matrixSelection = await readState(page);
    assert(matrixSelection.snapshot.action === 510, "Character Matrix action did not drive runtime stage");
    assert(matrixSelection.matrixActiveActions === 1, `Expected one active matrix action, found ${matrixSelection.matrixActiveActions}`);
    assert(matrixSelection.testbenchAnimElemVar && matrixSelection.testbenchAnimLength && matrixSelection.testbenchClsnVar, "Character Matrix diagnostic lens is incomplete");
    await page.locator('.fighter-matrix-character.is-selected').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(outDir, "character-matrix.png") });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "lab" && new URLSearchParams(location.search).get("labView") === "matrix", null, { timeout: 30_000 });
    const matrixReload = await readState(page);
    assert(matrixReload.matrixCharacters === 2 && matrixReload.matrixActions === 34, "Character Matrix route did not survive reload");
    assert(matrixReload.snapshot.action === 510 && matrixReload.matrixActiveActions === 1, "Character Matrix selection did not survive reload");

    await clickStable(page, '.fighter-lab-view-switch [data-lab-view="testbench"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("labView") === "testbench");
    const testbench = await readState(page);
    assert(testbench.testbenchView === "testbench", "Animation Testbench view did not open");
    assert(testbench.testbenchActionCards === 17, `Expected 17 testbench action cards, found ${testbench.testbenchActionCards}`);
    assert(testbench.testbenchComponents === 6, `Expected 6 testbench component cards, found ${testbench.testbenchComponents}`);
    assert(testbench.testbenchAnimElemVar, "Animation Testbench did not expose AnimElemVar metadata");
    assert(testbench.testbenchAnimLength, "Animation Testbench did not expose AnimLength metadata");
    assert(testbench.testbenchClsnVar, "Animation Testbench did not expose ClsnVar metadata");
    await clickStable(page, '.fighter-testbench-action[data-lab-action-id="510"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("action") === "510");
    assert((await readState(page)).snapshot.action === 510, "Testbench action did not drive runtime stage");
    await page.screenshot({ path: path.join(outDir, "character-testbench.png") });

    await clickStable(page, '.fighter-lab-view-switch [data-lab-view="compare"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("labView") === "compare");
    const compare = await readState(page);
    assert(compare.compareView === "compare", "Character Compare view did not open");
    assert(compare.compareCharacters === 2, `Expected 2 comparison cards, found ${compare.compareCharacters}`);
    assert(compare.compareActions === 17, `Expected 17 unique comparison actions, found ${compare.compareActions}`);
    assert(compare.compareSelectedActions === 1, `Expected one selected comparison action, found ${compare.compareSelectedActions}`);
    assert(compare.testbenchAnimElemVar && compare.testbenchAnimLength && compare.testbenchClsnVar, "Character Compare diagnostic lens is incomplete");
    await page.screenshot({ path: path.join(outDir, "character-compare-overview.png") });
    await clickStable(page, '.fighter-compare-action[data-lab-action-id="220"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("action") === "220");
    await clickStable(page, '.fighter-compare-card[data-fighter-compare-character="nadia-arce"] .fighter-compare-card-main');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("fighter") === "nadia-arce" && new URLSearchParams(location.search).get("action") === "220");
    const compareSelection = await readState(page);
    assert(compareSelection.snapshot.action === 220, "Character Compare card did not drive runtime stage");
    assert(compareSelection.compareActiveCharacters === 1, `Expected one active comparison card, found ${compareSelection.compareActiveCharacters}`);
    await page.locator('.fighter-compare-card.is-selected').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(outDir, "character-compare.png") });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "lab" && new URLSearchParams(location.search).get("labView") === "compare", null, { timeout: 30_000 });
    const compareReload = await readState(page);
    assert(compareReload.compareCharacters === 2 && compareReload.compareActions === 17, "Character Compare route did not survive reload");
    assert(compareReload.snapshot.action === 220 && compareReload.compareActiveCharacters === 1, "Character Compare selection did not survive reload");

    await clickStable(page, '.fighter-lab-view-switch [data-lab-view="gallery"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("labView") === "gallery");
    await clickStable(page, '.fighter-gallery-open[data-lab-fighter-id="rocco-vidal"]');
    await page.waitForFunction(() => new URLSearchParams(location.search).get("labView") === "timeline");

    await page.evaluate(() => document.querySelector('[data-toggle="showClsn1"]')?.click());
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.showClsn1 === false);
    assert(consoleErrors.length === 0, `Console errors: ${JSON.stringify(consoleErrors)}`);
    assert(pageErrors.length === 0, `Page errors: ${JSON.stringify(pageErrors)}`);

    const report = {
      status: "pass",
      generatedAt: new Date().toISOString(),
      baseUrl: server.baseUrl,
      serverMode: server.mode,
      rocco,
      nadia,
      effect,
      gallery,
      showcase,
      matrix,
      matrixSelection,
      matrixReload,
      testbench,
      compare,
      compareSelection,
      compareReload,
      consoleErrors,
      pageErrors,
      screenshots: [
        path.join(outDir, "rocco-light-strike-frame-3.png"),
        path.join(outDir, "nadia-special-frame-8.png"),
        path.join(outDir, "character-gallery.png"),
        path.join(outDir, "character-showcase.png"),
        path.join(outDir, "character-matrix.png"),
        path.join(outDir, "character-testbench.png"),
        path.join(outDir, "character-compare-overview.png"),
        path.join(outDir, "character-compare.png"),
      ],
    };
    fs.writeFileSync(path.join(outDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    await server.stop();
  }
}

async function readState(page) {
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    return {
      mode: bridge?.mode,
      route: location.search,
      shell: {
        left: document.querySelector(".app-shell")?.getAttribute("data-left-dock"),
        right: document.querySelector(".app-shell")?.getAttribute("data-right-dock"),
      },
      selectedFighter: document.querySelector('.fighter-compare-card.is-selected .fighter-compare-copy strong')?.textContent
        ?? document.querySelector('[data-lab-fighter-id][aria-pressed="true"] strong')?.textContent,
      fighterButtons: document.querySelectorAll("[data-lab-fighter-id]").length,
      actionButtons: document.querySelectorAll(".fighter-lab-action[data-lab-action-id]").length,
      frameButtons: document.querySelectorAll(".fighter-lab-frame[data-lab-frame-index]").length,
      galleryView: new URLSearchParams(location.search).get("labView") ?? "timeline",
      galleryCards: document.querySelectorAll(".fighter-gallery-card").length,
      galleryActionIndex: document.querySelectorAll(".fighter-gallery-action-index-list button").length,
      showcaseView: new URLSearchParams(location.search).get("labView") ?? "timeline",
      showcaseCards: document.querySelectorAll(".fighter-showcase-card").length,
      showcaseActionButtons: document.querySelectorAll(".fighter-showcase-actions [data-lab-action-id]").length,
      matrixView: new URLSearchParams(location.search).get("labView") ?? "timeline",
      matrixCharacters: document.querySelectorAll("[data-fighter-matrix-character]").length,
      matrixActions: document.querySelectorAll("[data-fighter-matrix-action]").length,
      matrixActiveActions: document.querySelectorAll(".fighter-matrix-action.is-active").length,
      matrixComponents: document.querySelectorAll("[data-fighter-matrix-component]").length,
      testbenchView: new URLSearchParams(location.search).get("labView") ?? "timeline",
      testbenchActionCards: document.querySelectorAll(".fighter-testbench-action[data-lab-action-id]").length,
      testbenchComponents: document.querySelectorAll("[data-testbench-component]").length,
      testbenchAnimElemVar: [...document.querySelectorAll(".fighter-testbench-facts dt")].some((node) => node.textContent?.trim() === "AnimElemVar"),
      testbenchAnimLength: [...document.querySelectorAll(".fighter-testbench-facts dt")].some((node) => node.textContent?.trim() === "AnimLength"),
      testbenchClsnVar: [...document.querySelectorAll(".fighter-testbench-facts dt")].some((node) => node.textContent?.trim() === "ClsnVar"),
      compareView: new URLSearchParams(location.search).get("labView") ?? "timeline",
      compareCharacters: document.querySelectorAll("[data-fighter-compare-character]").length,
      compareActiveCharacters: document.querySelectorAll(".fighter-compare-card.is-selected").length,
      compareActions: document.querySelectorAll("[data-fighter-compare-action]").length,
      compareSelectedActions: document.querySelectorAll(".fighter-compare-action.is-selected").length,
      atlasLoaded: document.querySelector(".fighter-lab-atlas-preview img")?.naturalWidth > 0,
      renderCalls: bridge?.renderer?.render?.calls ?? 0,
      activeRootIds: bridge?.activeRootIds ?? [],
      helperTeamResourceBindings: bridge?.helperTeamResourceBindings ?? [],
      snapshot: {
        action: bridge?.snapshot?.selectedActionId,
        frame: bridge?.snapshot?.actors?.[0]?.runtime?.frameIndex,
        playing: bridge?.snapshot?.playing,
      },
      inspection: bridge?.fighterLabInspection,
    };
  });
}

async function clickStable(page, selector) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const locator = page.locator(selector);
      await locator.waitFor({ state: "visible", timeout: 10_000 });
      await locator.click({ timeout: 10_000 });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(250);
    }
  }
  throw lastError;
}

async function resolveServer() {
  const externalBaseUrl = process.env.QA_BASE_URL?.replace(/\/$/, "");
  if (externalBaseUrl) {
    return { baseUrl: externalBaseUrl, mode: "external", stop: async () => undefined };
  }
  const port = Number(process.env.QA_PORT ?? await findFreePort(5330));
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    logLevel: "warn",
    server: { host: "127.0.0.1", port, strictPort: true, watch: null },
  });
  await vite.listen();
  return {
    baseUrl: vite.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`,
    mode: "started-vite",
    stop: () => vite.close(),
  };
}

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
