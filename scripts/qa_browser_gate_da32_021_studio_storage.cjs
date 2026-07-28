/**
 * DA32-021: Studio project authority in IndexedDB, cache mirror, reopen, and revision conflict.
 * The gate uses the real browser IndexedDB implementation and covers desktop plus mobile layout.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-021-studio-storage-browser-gate.json");
const databaseName = "mugen-web-sandbox-projects";
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
    probePaths: ["scripts/qa_browser_gate_da32_021_studio_storage.cjs"],
    codePaths: ["src/app/App.ts", "src/app/ProjectStorage.ts", "src/app/StudioProjectStore.ts"],
  });
  const port = await findFreePort(5600);
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
      await runViewport(browser, base, { id: "desktop", width: 1440, height: 900, conflict: true }),
      await runViewport(browser, base, { id: "mobile", width: 390, height: 844, conflict: false }),
      await runFallbackProbe(browser, base),
    ];
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32StudioStorageBrowserGate/v1",
      id: "DA32-021",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      database: databaseName,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional IndexedDB project authority observations for named viewports"
        : "browser IndexedDB authority, local cache mirror, reopen, desktop revision conflict, and no-IndexedDB fallback at named viewports",
      claims: {
        allowed: ok
          ? [
              "Studio reports IndexedDB as the project authority",
              "a saved manifest is present in the named IndexedDB object store",
              "the small localStorage cache mirrors the authoritative entry",
              "a page reload restores the saved project row and opens its manifest",
              "a second browser page produces a revision conflict while local edits remain dirty",
              "the named desktop and mobile routes have no horizontal overflow or unexpected page errors",
              "the no-IndexedDB fallback remains visible, saves to the cache, and exposes a retry action",
            ]
          : [],
        blocked: ["storage quota and eviction recovery", "file-system source blobs", "physical browser coverage", "full Studio authoring suite"],
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
    await clearProjectState(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForStudio(page);

    const steps = {
      authorityReady: false,
      saved: false,
      indexedDbRecord: false,
      cacheMirror: false,
      reloadRestoresRow: false,
      reopenRestoresManifest: false,
      conflictRetainsLocalEdit: options.conflict ? false : true,
      noHorizontalOverflow: false,
    };

    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "indexeddb" &&
        window.__MUGEN_WEB_SANDBOX__?.studioStorage?.authoritative === true,
      null,
      { timeout: 30_000 },
    );
    steps.authorityReady = true;

    const projectName = `DA32-021 ${options.id} authority`;
    await page.locator("[data-project-name]").first().fill(projectName);
    await page.locator("[data-project-name]").first().press("Tab");
    await clickAction(page, "save-project-local");
    await page.waitForFunction(
      (name) => {
        const bridge = window.__MUGEN_WEB_SANDBOX__;
        return bridge?.projectDirty === false &&
          bridge.projectStorageBackend === "indexeddb" &&
          bridge.projectStorageRevision === 1 &&
          bridge.storedProjects?.some((entry) => entry.name === name && entry.revision === 1);
      },
      projectName,
      { timeout: 30_000 },
    );
    steps.saved = true;

    const projectId = await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.project?.id);
    const authority = await readIndexedDb(page);
    const cache = await page.evaluate(() => {
      const raw = localStorage.getItem("mugen-web-sandbox:projects:v0");
      const parsed = raw ? JSON.parse(raw) : undefined;
      return parsed?.entries?.map((entry) => ({ id: entry.id, name: entry.name, revision: entry.revision })) ?? [];
    });
    steps.indexedDbRecord = authority.records.some(
      (record) => record.entry?.id === projectId && record.entry?.name === projectName && record.entry?.revision === 1,
    );
    steps.cacheMirror = cache.some((entry) => entry.id === projectId && entry.name === projectName && entry.revision === 1);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForStudio(page);
    await page.waitForFunction(
      (id) => window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "indexeddb" &&
        window.__MUGEN_WEB_SANDBOX__?.storedProjects?.some((entry) => entry.id === id),
      projectId,
      { timeout: 30_000 },
    );
    steps.reloadRestoresRow = true;
    const row = page.locator(`[data-stored-project-id="${projectId}"]`).first();
    await row.waitFor({ state: "attached", timeout: 15_000 });
    await clickStoredProject(page, projectId);
    await page.waitForFunction(
      (name) => window.__MUGEN_WEB_SANDBOX__?.project?.name === name &&
        window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision === 1 &&
        window.__MUGEN_WEB_SANDBOX__?.projectDirty === false,
      projectName,
      { timeout: 30_000 },
    );
    steps.reopenRestoresManifest = true;

    let conflict = undefined;
    if (options.conflict) {
      conflict = await runConflictJourney(context, base, page, projectId, projectName);
      steps.conflictRetainsLocalEdit = conflict.ok;
    }

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-021-studio-storage-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      projectId,
      authority,
      cache,
      conflict,
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
      // The browser may expose a non-configurable property; the semantic check below records that.
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
      () => window.indexedDB === undefined && window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "memory",
      null,
      { timeout: 30_000 },
    );
    await page.waitForSelector('[data-action="retry-project-storage"]', { timeout: 15_000 });
    const steps = {
      noIndexedDb: true,
      memoryFallbackVisible: false,
      cacheSave: false,
      retryVisible: true,
      retryKeepsFallback: false,
      noHorizontalOverflow: false,
    };
    steps.memoryFallbackVisible = await page.locator(".studio-project-storage-status").innerText().then((text) => /memory|fallback/i.test(text));

    await page.locator("[data-project-name]").first().fill("DA32-021 cache fallback");
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
      () => window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend === "localstorage-cache",
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
    const screenshot = path.join(outDir, "da32-021-studio-storage-fallback.png");
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: "fallback-no-indexeddb",
      viewport: "1440x900",
      ok: Object.values(steps).every(Boolean),
      steps,
      bridge: await page.evaluate(() => ({
        backend: window.__MUGEN_WEB_SANDBOX__?.projectStorageBackend,
        storage: window.__MUGEN_WEB_SANDBOX__?.studioStorage,
        storedProjectCount: window.__MUGEN_WEB_SANDBOX__?.storedProjects?.length,
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

async function clickStoredProject(page, projectId) {
  await page.evaluate((id) => {
    const row = [...document.querySelectorAll("[data-stored-project-id]")].find(
      (element) => element.getAttribute("data-stored-project-id") === id,
    );
    if (!row) throw new Error(`stored project row ${id} is missing`);
    row.click();
  }, projectId);
}

async function clickAction(page, action) {
  await page.evaluate((actionName) => {
    const button = document.querySelector(`[data-action="${actionName}"]`);
    if (!button) throw new Error(`action ${actionName} is missing`);
    button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  }, action);
}

async function clearProjectState(page) {
  await page.evaluate(async (name) => {
    localStorage.clear();
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  }, databaseName);
}

async function readIndexedDb(page) {
  return page.evaluate((name) => new Promise((resolve) => {
    const open = indexedDB.open(name);
    open.onerror = () => resolve({ available: false, records: [] });
    open.onsuccess = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains("projects")) {
        db.close();
        resolve({ available: false, records: [] });
        return;
      }
      const transaction = db.transaction("projects", "readonly");
      const request = transaction.objectStore("projects").getAll();
      request.onsuccess = () => {
        const records = Array.isArray(request.result)
          ? request.result.map((record) => ({ schema: record.schema, entry: record.entry }))
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
  }), databaseName);
}

async function runConflictJourney(context, base, primary, projectId, projectName) {
  const remote = await context.newPage();
  const consoleErrors = [];
  remote.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  remote.on("pageerror", (error) => consoleErrors.push(String(error?.message || error)));
  try {
    await remote.goto(`${base}${studioRoute}`, { waitUntil: "domcontentloaded" });
    await waitForStudio(remote);
    await remote.waitForFunction(
      (id) => window.__MUGEN_WEB_SANDBOX__?.storedProjects?.some((entry) => entry.id === id),
      projectId,
      { timeout: 30_000 },
    );
    await clickStoredProject(remote, projectId);
    await remote.waitForFunction(
      (name) => window.__MUGEN_WEB_SANDBOX__?.project?.name === name && window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision === 1,
      projectName,
      { timeout: 30_000 },
    );

    const localName = `${projectName} local pending`;
    await primary.locator("[data-project-name]").first().fill(localName);
    await primary.locator("[data-project-name]").first().press("Tab");
    const remoteName = `${projectName} remote revision`;
    await remote.locator("[data-project-name]").first().fill(remoteName);
    await remote.locator("[data-project-name]").first().press("Tab");
    await clickAction(remote, "save-project-local");
    await remote.waitForFunction(
      (name) => window.__MUGEN_WEB_SANDBOX__?.projectDirty === false &&
        window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision === 2 &&
        window.__MUGEN_WEB_SANDBOX__?.project?.name === name,
      remoteName,
      { timeout: 30_000 },
    );
    await primary.waitForFunction(
      (name) => window.__MUGEN_WEB_SANDBOX__?.projectStorageConflict?.actualRevision === 2 &&
        window.__MUGEN_WEB_SANDBOX__?.projectDirty === true &&
        window.__MUGEN_WEB_SANDBOX__?.project?.name === name,
      localName,
      { timeout: 30_000 },
    );
    return {
      ok: true,
      localName,
      remoteName,
      primary: await primary.evaluate(() => ({
        dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
        conflict: window.__MUGEN_WEB_SANDBOX__?.projectStorageConflict,
        revision: window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision,
        name: window.__MUGEN_WEB_SANDBOX__?.project?.name,
      })),
      remote: await remote.evaluate(() => ({
        dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
        revision: window.__MUGEN_WEB_SANDBOX__?.projectStorageRevision,
        name: window.__MUGEN_WEB_SANDBOX__?.project?.name,
      })),
      consoleErrors,
    };
  } catch (error) {
    return { ok: false, error: String(error), consoleErrors };
  } finally {
    await remote.close();
  }
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
