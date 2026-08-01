/**
 * T426: real select.def roster/stage import through the visible Play and Studio paths.
 *
 * The gate intentionally uses the browser ZIP input. It verifies that the
 * selected pair and stage are live, native sprites are routed for both seats,
 * the controls accept keyboard input, Studio exposes the manifest, and a
 * reimport replaces the visible selected roster without stale entries.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, ".scratch", "qa", "t426-select-def");
const reportPath = path.join(outDir, "report.json");
const runtimeRoute = "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isBenign(message) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(message));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const vite = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
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
    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "T426SelectDefBrowserGate/v1",
      generatedAt: new Date().toISOString(),
      route: runtimeRoute,
      ok,
      cases,
      unexpectedConsole,
      claimCeiling: "repository-owned direct select.def entries through the named browser import, Play controls, Studio manifest view, and reimport route",
      blocked: [
        "full M.U.G.E.N select screen, Arcade ordering, randomselect, unlock rules, and system.def parity",
        "all package layouts, characters, stages, devices, and viewport sizes",
      ],
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify(report)) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({ status: ok ? "passed" : "failed", ok, report: path.relative(repoRoot, reportPath).replaceAll("\\", "/"), cases: cases.map((item) => ({ id: item.id, ok: item.ok, semantic: item.semantic })), unexpectedConsole }, null, 2)}\n`);
    process.exitCode = ok ? 0 : 1;
  } finally {
    await browser?.close().catch(() => undefined);
    try {
      vite.kill("SIGTERM");
    } catch {
      // Best effort cleanup for the local Vite process.
    }
  }
}

async function runViewport(browser, base, options) {
  const context = await browser.newContext({ viewport: { width: options.width, height: options.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.setDefaultTimeout(60_000);
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error?.message || error)));

  try {
    await page.goto(`${base}${runtimeRoute}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.qaProbe));
    const initialBytes = await fixtureBytes(page, false);
    await page.locator("#zip-input").setInputFiles({
      name: "t426-select-def.zip",
      mimeType: "application/zip",
      buffer: Buffer.from(initialBytes),
    });
    await page.waitForFunction(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const selected = bridge?.runtimeRoster?.filter((entry) => entry.source === "imported" && entry.selected) ?? [];
      return bridge?.mode === "match" && selected.length === 2 && bridge?.snapshot?.actors?.length === 2;
    });

    const p1 = page.locator('[data-fighter-select="p1"]');
    const p2 = page.locator('[data-fighter-select="p2"]');
    const stage = page.locator('[data-stage-select="stage"]');
    const initialP1 = await p1.inputValue();
    const initialP2 = await p2.inputValue();
    await p1.focus();
    const focusedBeforeKeyboard = await page.evaluate(() => document.activeElement?.getAttribute("data-fighter-select"));
    await page.keyboard.press("Tab");
    const focusedAfterKeyboard = await page.evaluate(() => document.activeElement?.getAttribute("data-fighter-select"));

    const initial = await readState(page);
    const runtimeScreenshot = path.join(outDir, `t426-select-def-${options.id}-runtime.png`);
    await page.screenshot({ path: runtimeScreenshot, fullPage: true });

    await page.locator('[data-mode="studio"]').first().click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
    await page.locator('[data-studio-tab="build"]').first().click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioTab === "build");
    const manifestPanel = page.locator('[data-selection-manifest="data/select.def"]').first();
    await manifestPanel.waitFor();
    await manifestPanel.scrollIntoViewIfNeeded();
    const manifestText = await manifestPanel.innerText();
    const studio = await readState(page);
    const studioScreenshot = path.join(outDir, `t426-select-def-${options.id}-studio.png`);
    const manifestScreenshot = path.join(outDir, `t426-select-def-${options.id}-manifest.png`);
    await page.screenshot({ path: studioScreenshot, fullPage: true });
    await manifestPanel.screenshot({ path: manifestScreenshot });

    await page.locator('[data-mode="match"]').first().click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "match");
    const reimportBytes = await fixtureBytes(page, true);
    await page.locator("#zip-input").setInputFiles({
      name: "t426-select-def-reimport.zip",
      mimeType: "application/zip",
      buffer: Buffer.from(reimportBytes),
    });
    await page.waitForFunction(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const selected = bridge?.runtimeRoster?.filter((entry) => entry.source === "imported" && entry.selected) ?? [];
      return selected.map((entry) => entry.displayName).join("|") === "Select Beta|Select Alpha" &&
        bridge?.project?.entry?.stage === "stage-skyline-relay-reimport";
    });
    const reimport = await readState(page);

    const mobile = options.id === "mobile";
    const semantic = {
      selectedPairAndStage: initial.project?.p1 === "imported-select-character-1" &&
        initial.project?.p2 === "imported-select-character-2" &&
        initial.controls.p1 === initial.project?.p1 && initial.controls.p2 === initial.project?.p2 &&
        initial.controls.stage === initial.project?.stage,
      importedRosterVisible: initial.selectedRoster.map((entry) => entry.displayName).join("|") === "Select Alpha|Select Beta",
      importedActorsAndSprites: initial.actors.length === 2 && initial.actors.every((actor) => actor.source === "imported" && actor.spriteWidth > 0 && actor.spriteHeight > 0),
      keyboardFocus: focusedBeforeKeyboard === "p1",
      keyboardOperation: focusedAfterKeyboard === "p2",
      controlsRestored: initial.controls.p1 === initialP1 && initial.controls.p2 === initialP2,
      studioManifestVisible: manifestText.includes("select.def") && manifestText.includes("Manifest") && manifestText.includes("data/select.def"),
      studioManifestRows: manifestText.includes("select-alpha/journey") && manifestText.includes("select-beta/journey") && manifestText.includes("skyline-relay/skyline"),
      reimportReplacesSelection: reimport.selectedRoster.map((entry) => entry.displayName).join("|") === "Select Beta|Select Alpha" &&
        reimport.controls.p1 === "imported-select-character-1" && reimport.controls.p2 === "imported-select-character-2" &&
        reimport.controls.stage === "stage-skyline-relay-reimport",
      noHorizontalOverflow: initial.layout.scrollWidth <= initial.layout.innerWidth + 1 &&
        studio.layout.scrollWidth <= studio.layout.innerWidth + 1,
      manifestFitsViewport: !mobile || (studio.layout.manifestWidth > 0 && studio.layout.manifestRight <= studio.layout.innerWidth + 1),
    };
    const ok = Object.values(semantic).every(Boolean);
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok,
      semantic,
      initial,
      studio,
      reimport,
      runtimeScreenshot: path.relative(repoRoot, runtimeScreenshot).replaceAll("\\", "/"),
      studioScreenshot: path.relative(repoRoot, studioScreenshot).replaceAll("\\", "/"),
      manifestScreenshot: path.relative(repoRoot, manifestScreenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

async function fixtureBytes(page, reimport) {
  return page.evaluate(async (useReimport) => {
    const fixture = await import("/src/mugen/runtime/MugenSelectDefPlayableFixture.ts");
    const vfs = useReimport ? fixture.createMugenSelectDefPlayableReimportFixtureVfs() : undefined;
    return Array.from(new Uint8Array(await fixture.createMugenSelectDefPlayableFixtureZipBytes(vfs)));
  }, reimport);
}

async function readState(page) {
  return page.evaluate(() => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const renderedById = new Map((bridge?.renderer?.characters ?? []).map((actor) => [actor.actorId, actor]));
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return { width: 0, right: 0 };
      const value = element.getBoundingClientRect();
      return { width: value.width, right: value.right };
    };
    const selectedRoster = (bridge?.runtimeRoster ?? []).filter((entry) => entry.source === "imported" && entry.selected);
    return {
      project: bridge?.project?.entry,
      selectedRoster: selectedRoster.map((entry) => ({ id: entry.id, displayName: entry.displayName })),
      actors: (bridge?.snapshot?.actors ?? []).map((actor) => {
        const rendered = renderedById.get(actor.id);
        return {
          source: actor.source,
          label: actor.label,
          spriteWidth: Number(rendered?.sprite?.width ?? 0),
          spriteHeight: Number(rendered?.sprite?.height ?? 0),
        };
      }),
      controls: {
        p1: document.querySelector('[data-fighter-select="p1"]')?.value ?? null,
        p2: document.querySelector('[data-fighter-select="p2"]')?.value ?? null,
        stage: document.querySelector('[data-stage-select="stage"]')?.value ?? null,
      },
      layout: {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        manifestWidth: rect('[data-selection-manifest="data/select.def"]').width,
        manifestRight: rect('[data-selection-manifest="data/select.def"]').right,
      },
    };
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : undefined;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForServer(base, timeoutMs) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
      lastError = new Error(`Server responded ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${base}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exitCode = 1;
});
