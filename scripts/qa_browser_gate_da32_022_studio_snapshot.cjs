/**
 * DA32-022: bind saved Studio projects to the durable IndexedDB snapshot store.
 * The gate reads the real browser object store at desktop and mobile sizes.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-022-studio-snapshot-browser-gate.json");
const projectDatabaseName = "mugen-web-sandbox-projects";
const snapshotDatabaseName = "mugen-web-sandbox-studio";
const studioRoute = "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isBenign(message) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(message));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_022_studio_snapshot.cjs"],
    codePaths: [
      "src/app/App.ts",
      "src/app/ProjectSnapshotBridge.ts",
      "src/app/StudioIndexedDbSnapshot.ts",
    ],
  });
  const port = await findFreePort(5700);
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
      await runFallbackProbe(browser, base),
    ];
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32StudioSnapshotBrowserGate/v1",
      id: "DA32-022",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      projectDatabase: projectDatabaseName,
      snapshotDatabase: snapshotDatabaseName,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional Studio snapshot observations for named viewports"
        : "saved Studio snapshot records persist in IndexedDB and survive reload at named viewports, with visible no-IndexedDB fallback",
      claims: {
        allowed: ok
          ? [
              "a saved Studio project produces one durable StudioIndexedDbSnapshot/v1 record",
              "the snapshot record keeps project revision, authority digest, and a JSON project snapshot payload",
              "the browser can read the snapshot record after a page reload at desktop and mobile sizes",
              "the no-IndexedDB route exposes memory fallback and keeps project saving available through the cache",
              "the named routes have no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: [
          "source-write intent replay in a live editor flow",
          "quota and eviction recovery",
          "large binary source blobs",
          "physical browser coverage",
          "full Studio authoring and release parity",
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
  page.setDefaultNavigationTimeout(120_000);
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error?.message || error)));

  try {
    await page.goto(`${base}${studioRoute}`, { waitUntil: "domcontentloaded" });
    await waitForStudio(page);
    await clearDatabases(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForStudio(page);

    const steps = {
      authorityReady: false,
      saved: false,
      snapshotRecord: false,
      snapshotSurvivesReload: false,
      noHorizontalOverflow: false,
    };
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "indexeddb" &&
        window.__MUGEN_WEB_SANDBOX__?.studioStorage?.authoritative === true &&
        window.__MUGEN_WEB_SANDBOX__?.studioSnapshotStorage?.authoritative === true,
      null,
      { timeout: 30_000 },
    );
    steps.authorityReady = true;

    const projectName = `DA32-022 ${options.id} snapshot`;
    await page.locator("[data-project-name]").first().fill(projectName);
    await page.locator("[data-project-name]").first().press("Tab");
    await clickAction(page, "save-project-local");
    await page.waitForFunction(
      (name) => {
        const bridge = window.__MUGEN_WEB_SANDBOX__;
        return bridge?.projectDirty === false &&
          bridge.projectStorageBackend === "indexeddb" &&
          bridge.projectStorageRevision === 1 &&
          bridge.studioSnapshotStorage?.authoritative === true &&
          bridge.storedProjects?.some((entry) => entry.name === name && entry.revision === 1);
      },
      projectName,
      { timeout: 30_000 },
    );
    steps.saved = true;

    const projectId = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.project?.id);
    const snapshotBeforeReload = await readSnapshotDb(page);
    const snapshotRecord = snapshotBeforeReload.records.find((record) => record.projectId === projectId);
    steps.snapshotRecord = Boolean(
      snapshotBeforeReload.available &&
        snapshotRecord?.schema === "StudioIndexedDbSnapshot/v1" &&
        snapshotRecord.revision === 1 &&
        snapshotRecord.authoritySha &&
        snapshotRecord.analysisDigest &&
        snapshotRecord.payload?.projectId === projectId &&
        snapshotRecord.payload?.projectRevision === 1 &&
        snapshotRecord.payload?.integrity,
    );

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForStudio(page);
    await page.waitForFunction(
      (id) => window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "indexeddb" &&
        window.__MUGEN_WEB_SANDBOX__?.storedProjects?.some((entry) => entry.id === id) &&
        window.__MUGEN_WEB_SANDBOX__?.studioSnapshotStorage?.authoritative === true,
      projectId,
      { timeout: 30_000 },
    );
    const snapshotAfterReload = await readSnapshotDb(page);
    const reloadedRecord = snapshotAfterReload.records.find((record) => record.projectId === projectId);
    steps.snapshotSurvivesReload = Boolean(
      reloadedRecord?.revision === 1 &&
        reloadedRecord.payload?.projectId === projectId &&
        reloadedRecord.payload?.projectName === projectName,
    );

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-022-studio-snapshot-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      projectId,
      snapshotBeforeReload,
      snapshotAfterReload,
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

async function runFallbackProbe(browser, base) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    try {
      Object.defineProperty(window, "indexedDB", { configurable: true, value: undefined });
    } catch {
      // The browser may expose a non-configurable property; the semantic check records that.
    }
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
    await waitForStudio(page);
    await page.waitForFunction(
      () => window.indexedDB === undefined &&
        window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "memory" &&
        window.__MUGEN_WEB_SANDBOX__?.studioSnapshotStorage?.backend === "memory",
      null,
      { timeout: 30_000 },
    );
    await page.waitForSelector('[data-action="retry-project-storage"]', { timeout: 15_000 });
    const steps = {
      noIndexedDb: true,
      fallbackVisible: false,
      cacheSave: false,
      retryKeepsFallback: false,
      noHorizontalOverflow: false,
    };
    steps.fallbackVisible = await page.locator(".studio-project-storage-status").innerText().then((text) => /memory|fallback/i.test(text));
    await page.locator("[data-project-name]").first().fill("DA32-022 snapshot fallback");
    await page.locator("[data-project-name]").first().press("Tab");
    await clickAction(page, "save-project-local");
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "localstorage-cache" &&
        window.__MUGEN_WEB_SANDBOX__?.projectDirty === false &&
        (window.__MUGEN_WEB_SANDBOX__?.storedProjects?.length ?? 0) > 0,
      null,
      { timeout: 30_000 },
    );
    steps.cacheSave = true;
    await clickAction(page, "retry-project-storage");
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "localstorage-cache" &&
        window.__MUGEN_WEB_SANDBOX__?.studioSnapshotStorage?.backend === "memory",
      null,
      { timeout: 15_000 },
    );
    steps.retryKeepsFallback = true;
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, "da32-022-studio-snapshot-fallback.png");
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: "fallback-no-indexeddb",
      viewport: "1440x900",
      ok: Object.values(steps).every(Boolean),
      steps,
      bridge: await page.evaluate(() => ({
        backend: window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend,
        storage: window.__MUGEN_WEB_SANDBOX__?.studioStorage,
        snapshotStorage: window.__MUGEN_WEB_SANDBOX__?.studioSnapshotStorage,
      })),
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

async function waitForStudio(page) {
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.qaProbe), null, { timeout: 60_000 });
  await page.waitForSelector('[data-action="save-project-local"]', { timeout: 30_000 });
}

async function clickAction(page, action) {
  await page.evaluate((actionName) => {
    const button = document.querySelector(`[data-action="${actionName}"]`);
    if (!button) throw new Error(`action ${actionName} is missing`);
    button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  }, action);
}

async function clearDatabases(page) {
  await page.evaluate(async (names) => {
    localStorage.clear();
    await Promise.all(names.map((name) => new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    })));
  }, [projectDatabaseName, snapshotDatabaseName]);
}

async function readSnapshotDb(page) {
  return page.evaluate((name) => new Promise((resolve) => {
    const open = indexedDB.open(name);
    open.onerror = () => resolve({ available: false, records: [] });
    open.onsuccess = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains("snapshots")) {
        db.close();
        resolve({ available: false, records: [] });
        return;
      }
      const transaction = db.transaction("snapshots", "readonly");
      const request = transaction.objectStore("snapshots").getAll();
      request.onsuccess = () => {
        const records = Array.isArray(request.result)
          ? request.result.map((record) => {
              let payload;
              try {
                payload = JSON.parse(record.payload);
              } catch {
                payload = undefined;
              }
              return {
                schema: record.schema,
                projectId: record.projectId,
                revision: record.revision,
                authoritySha: record.authoritySha,
                analysisDigest: record.analysisDigest,
                payload,
                savedAt: record.savedAt,
              };
            })
          : [];
        transaction.oncomplete = () => {
          db.close();
          resolve({ available: true, records });
        };
      };
      request.onerror = () => {
        db.close();
        resolve({ available: false, records: [] });
      };
    };
  }), snapshotDatabaseName);
}

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") return resolve(findFreePort(startPort + 1));
      reject(error);
    });
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(typeof address === "object" && address ? address.port : startPort));
    });
  });
}

async function waitForServer(base, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/`);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Vite did not start at ${base}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
