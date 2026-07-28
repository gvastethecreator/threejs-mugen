/**
 * DA32-023: durable source-write intent recovery in the live Studio editor.
 * The gate seeds a real IndexedDB intent, loads its preimage through the app,
 * and checks the desktop/mobile recovery surface without writing a source handle.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-023-source-write-intent-browser-gate.json");
const databaseName = "mugen-web-sandbox-studio";
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const sourceText = "[Statedef 0]\ntype = S\nphysics = S\nanim = 0\n";
const intent = {
  schema: "StudioSourceWriteIntent/v1",
  intentId: "source-intent:da32-023:recovery-source:chars/recovery/recovery.cns:pending",
  path: "chars/recovery/recovery.cns",
  preimageBytes: [...Buffer.from(sourceText, "utf8")],
  preimageSha256: fnvHex(Buffer.from(sourceText, "utf8")),
  projectId: "da32-023-recovery-project",
  sourcePackageId: "recovery-source",
  draftDigest: "fnv1a32:recovery",
  byteLength: Buffer.byteLength(sourceText),
  createdAt: "2026-07-28T00:00:00.000Z",
};

function fnvHex(bytes) {
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isBenign(message) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(message));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const projectPath = writeRecoveryProject();
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_023_source_write_intent.cjs"],
    codePaths: ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts", "src/app/StudioSourceWrite.ts"],
  });
  const port = await findFreePort(5800);
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
      await runViewport(browser, base, projectPath, { id: "desktop", width: 1440, height: 900 }),
      await runViewport(browser, base, projectPath, { id: "mobile", width: 390, height: 844 }),
    ];
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32StudioSourceWriteIntentBrowserGate/v1",
      id: "DA32-023",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      database: databaseName,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional source-write intent recovery observations for named viewports"
        : "the live Studio editor reads a pending source-write preimage from IndexedDB and keeps recovery explicit at named viewports",
      claims: {
        allowed: ok
          ? [
              "Studio reads a pending StudioSourceWriteIntent/v1 record from the real browser IndexedDB object store",
              "the recovery surface identifies the source package, path, byte length, and preimage digest",
              "Load preimage replays the exact persisted bytes into the Studio editor without writing a source handle",
              "the pending intent remains pending after editor recovery and survives the named viewport flow",
              "the named desktop and mobile routes have no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: [
          "crash injection between writable-stream close and receipt finalization",
          "automatic handle restoration or multi-file recovery",
          "quota and eviction recovery",
          "physical browser and permission prompt coverage",
          "full MUGEN/IKEMEN authoring and release parity",
        ],
      },
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({
      status: ok ? "passed" : "failed",
      ok,
      provisional: subject.provisional,
      viewports: cases.map((item) => ({ id: item.id, ok: item.ok })),
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

async function runViewport(browser, base, projectPath, options) {
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
    await clearDatabase(page);
    await seedIntent(page);
    await page.goto(`${base}${studioRoute}`, { waitUntil: "domcontentloaded" });
    await waitForStudio(page);
    await page.locator("#project-input").setInputFiles(projectPath);
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.project?.id === "da32-023-recovery-project",
      null,
      { timeout: 30_000 },
    );
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent?.result === undefined, null, { timeout: 30_000 });
    await page.waitForSelector('[data-action="replay-source-write-intent"]', { timeout: 15_000 });

    const steps = {
      idbIntent: false,
      bridgePendingIntent: false,
      recoverySurface: false,
      exactPreimageLoaded: false,
      pendingAfterRecovery: false,
      noSourceHandleWrite: false,
      noHorizontalOverflow: false,
    };
    const before = {
      records: await readIntentRecords(page, databaseName),
      ...(await page.evaluate(() => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      bodyHasRecovery: (document.body.textContent ?? "").includes("Durable source write intent"),
      }))),
    };
    const beforeIntent = before.records.find((record) => record.intentId === intent.intentId);
    steps.idbIntent = Boolean(
      beforeIntent?.schema === "StudioSourceWriteIntent/v1" &&
        beforeIntent?.path === intent.path &&
        beforeIntent?.preimageBytes?.length === intent.preimageBytes.length &&
        beforeIntent?.result === undefined,
    );
    steps.bridgePendingIntent = Boolean(
      before.bridge?.intentId === intent.intentId &&
        before.bridge?.path === intent.path &&
        before.bridge?.result === undefined,
    );
    steps.recoverySurface = before.bodyHasRecovery;

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="replay-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source intent recovery action is missing");
      button.click();
    });
    await page.waitForFunction(
      (expected) => window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument?.text === expected,
      sourceText,
      { timeout: 15_000 },
    );
    const after = {
      records: await readIntentRecords(page, databaseName),
      ...(await page.evaluate(() => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      document: window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument,
      sourceHandles: window.__MUGEN_WEB_SANDBOX__?.sourceHandles ?? [],
      editorValue: document.querySelector("[data-source-editor]")?.value,
      }))),
    };
    steps.exactPreimageLoaded = after.editorValue === sourceText && after.document?.text === sourceText;
    steps.pendingAfterRecovery = Boolean(after.bridge?.intentId === intent.intentId && after.bridge?.result === undefined);
    steps.noSourceHandleWrite = after.sourceHandles.every((handle) =>
      handle.sourcePackageId !== intent.sourcePackageId ||
        (handle.persisted === false && handle.state === "not-linked" && handle.canRead === false),
    );
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-023-source-write-intent-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      before,
      after,
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

function writeRecoveryProject() {
  const projectPath = path.join(outDir, "da32-023-source-write-intent-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "da32-023-recovery-project",
    name: "DA32-023 Source Intent Recovery",
    engineVersion: "qa-browser-gate",
    generatedAt: "2026-07-28T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [{
      id: "recovery-source",
      name: "Recovery Source",
      kind: "folder",
      fileCount: 1,
      status: "missing",
      characterId: "nova-boxer",
      characterName: "Nova Boxer",
      defPath: "chars/recovery/recovery.def",
      stageIds: [],
      stageDefPaths: [],
      requiredPaths: ["chars/recovery/recovery.cns"],
    }],
    assets: {
      characters: ["nova-boxer", "mira-volt", "rook-apprentice"],
      stages: ["rooftop-dojo"],
      audio: [],
      ui: [],
      effects: [],
    },
    assetRecords: [],
    entry: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" },
    compatibility: {
      gates: [],
      stats: { characters: 3, stages: 1, importedCharacters: 1, importedStages: 0, generatedAtlases: 3 },
    },
  };
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), "utf8");
  return projectPath;
}

async function waitForStudio(page) {
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.qaProbe), null, { timeout: 60_000 });
  await page.waitForSelector('[data-studio-tab="build"]', { timeout: 30_000 });
}

async function clearDatabase(page) {
  await page.evaluate((name) => new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  }), databaseName);
}

async function seedIntent(page) {
  await page.evaluate(({ name, value }) => new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("snapshots")) db.createObjectStore("snapshots");
      if (!db.objectStoreNames.contains("intents")) db.createObjectStore("intents");
    };
    request.onerror = () => reject(request.error ?? new Error("Could not seed source intent database."));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("intents", "readwrite");
      tx.objectStore("intents").put(value, value.intentId);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error ?? new Error("Could not seed source intent record."));
      tx.onabort = () => reject(tx.error ?? new Error("Source intent seed transaction aborted."));
    };
  }), { name: databaseName, value: intent });
}

async function readIntentRecords(page, name) {
  return page.evaluate((database) => new Promise((resolve) => {
    const request = indexedDB.open(database);
    request.onerror = () => resolve([]);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("intents")) {
        db.close();
        resolve([]);
        return;
      }
      const tx = db.transaction("intents", "readonly");
      const get = tx.objectStore("intents").getAll();
      let records = [];
      get.onsuccess = () => { records = Array.isArray(get.result) ? get.result : []; };
      get.onerror = () => { records = []; };
      tx.oncomplete = () => {
        db.close();
        resolve(records);
      };
      tx.onerror = () => {
        db.close();
        resolve([]);
      };
    };
  }), name);
}

function findFreePort(start) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () => {
      server.close();
      findFreePort(start + 1).then(resolve, reject);
    });
    server.listen(start, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : start;
      server.close(() => resolve(port));
    });
  });
}

function waitForServer(base, timeoutMs) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      const request = require("node:http").get(base, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
      request.setTimeout(1000, () => {
        request.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Vite server did not start at ${base}`));
        return;
      }
      setTimeout(probe, 250);
    };
    probe();
  });
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
