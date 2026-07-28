/**
 * DA32-031: durable retry and abandon decisions for a write-closed source intent.
 * The gate seeds a real IndexedDB intent, prepares a retry, then explicitly
 * abandons the same intent without writing a source handle.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-031-source-write-recovery-decisions-browser-gate.json");
const databaseName = "mugen-web-sandbox-studio";
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const sourceText = "[Statedef 0]\ntype = S\nphysics = S\nanim = 0\n";
const intent = {
  schema: "StudioSourceWriteIntent/v1",
  intentId: "source-intent:da32-031:recovery-source:chars/recovery/recovery.cns:write-closed",
  path: "chars/recovery/recovery.cns",
  preimageBytes: [...Buffer.from(sourceText, "utf8")],
  preimageSha256: fnvHex(Buffer.from(sourceText, "utf8")),
  projectId: "da32-031-recovery-project",
  sourcePackageId: "recovery-source",
  draftDigest: "fnv1a32:recovery",
  byteLength: Buffer.byteLength(sourceText),
  phase: "write-closed",
  writeByteLength: Buffer.byteLength(sourceText),
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
    probePaths: ["scripts/qa_browser_gate_da32_031_source_write_recovery_decisions.cjs"],
    codePaths: ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts", "src/app/StudioSourceWriteReceipt.ts"],
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
      schema: "Da32StudioSourceWriteRecoveryDecisionsBrowserGate/v1",
      id: "DA32-031",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      database: databaseName,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional source-write recovery decision observations for named viewports"
        : "the live Studio editor persists explicit retry and abandon decisions for a write-closed source intent at named viewports",
      claims: {
        allowed: ok
          ? [
              "Studio reads a pending write-closed StudioSourceWriteIntent/v1 record from the real browser IndexedDB object store",
              "Prepare retry persists a retry decision and attempt count before loading the exact preimage",
              "Abandon recovery persists a rejected recovery-abandoned receipt and settles the original intent",
              "the retry and abandon paths do not write a source handle",
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
  page.on("dialog", (dialog) => dialog.accept());

  try {
    await page.goto(`${base}${studioRoute}`, { waitUntil: "domcontentloaded" });
    await waitForStudio(page);
    await clearDatabase(page);
    await seedIntent(page);
    await page.goto(`${base}${studioRoute}`, { waitUntil: "domcontentloaded" });
    await waitForStudio(page);
    await page.locator("#project-input").setInputFiles(projectPath);
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.project?.id === "da32-031-recovery-project",
      null,
      { timeout: 30_000 },
    );
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent?.result === undefined, null, { timeout: 30_000 });
    await page.waitForSelector('[data-action="prepare-source-write-retry"]', { timeout: 15_000 });

    const steps = {
      pendingIntentVisible: false,
      retryActionVisible: false,
      abandonActionVisible: false,
      retryDecisionDurable: false,
      retryPreimageLoaded: false,
      retryAttemptRecorded: false,
      abandonReceipt: false,
      settledIntent: false,
      abandonDecisionDurable: false,
      noSourceHandleWrite: false,
      noHorizontalOverflow: false,
    };
    const before = {
      records: await readIntentRecords(page, databaseName),
      ...(await page.evaluate(() => ({
        bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        bodyHasRecovery: (document.body.textContent ?? "").includes("Durable source write intent"),
        retryAction: Boolean(document.querySelector('[data-action="prepare-source-write-retry"]')),
        abandonAction: Boolean(document.querySelector('[data-action="abandon-source-write-intent"]')),
      }))),
    };
    const beforeIntent = before.records.find((record) => record.intentId === intent.intentId);
    steps.pendingIntentVisible = Boolean(
      beforeIntent?.schema === "StudioSourceWriteIntent/v1" &&
        beforeIntent?.phase === "write-closed" &&
        beforeIntent?.path === intent.path &&
        beforeIntent?.result === undefined &&
        before.bridge?.intentId === intent.intentId &&
        before.bridge?.phase === "write-closed" &&
        before.bridge?.result === undefined,
    );
    steps.retryActionVisible = before.retryAction;
    steps.abandonActionVisible = before.abandonAction;

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="prepare-source-write-retry"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source write retry action is missing");
      button.click();
    });
    await page.waitForFunction(
      (expected) => window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument?.text === expected &&
        window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent?.recoveryDecision === "retry" &&
        window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent?.recoveryAttempt === 1,
      sourceText,
      { timeout: 30_000 },
    );
    const afterRetry = {
      records: await readIntentRecords(page, databaseName),
      ...(await page.evaluate(() => ({
        bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        document: window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument,
        editorValue: document.querySelector("[data-source-editor]")?.value,
        retryDecision: document.querySelector('[data-source-write-recovery-decision="retry"]')?.textContent,
      }))),
    };
    const retryIntent = afterRetry.records.find((record) => record.intentId === intent.intentId);
    steps.retryDecisionDurable = retryIntent?.recoveryDecision === "retry" && retryIntent?.phase === "write-closed" && retryIntent?.result === undefined;
    steps.retryPreimageLoaded = afterRetry.editorValue === sourceText && afterRetry.document?.text === sourceText;
    steps.retryAttemptRecorded = afterRetry.bridge?.recoveryAttempt === 1 && typeof afterRetry.bridge?.recoveryDecidedAt === "string" && Boolean(afterRetry.retryDecision);

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="abandon-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source write abandon action is missing");
      button.click();
    });
    await page.waitForFunction(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      return bridge?.studioSourceWriteIntent?.phase === "settled" &&
        bridge.studioSourceWriteIntent.result === "aborted" &&
        bridge.studioSourceWriteIntent.recoveryDecision === "abandon" &&
        bridge.studioSourceWriteReceipt?.status === "rejected" &&
        bridge.studioSourceWriteReceipt.reason === "recovery-abandoned";
    }, null, { timeout: 30_000 });
    const afterAbandon = {
      records: await readIntentRecords(page, databaseName),
      ...(await page.evaluate(() => ({
        bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
        sourceHandles: window.__MUGEN_WEB_SANDBOX__?.sourceHandles ?? [],
        receiptNode: document.querySelector('[data-source-write-receipt="rejected"]')?.textContent,
      }))),
    };
    const abandonedIntent = afterAbandon.records.find((record) => record.intentId === intent.intentId);
    steps.abandonReceipt = afterAbandon.receipt?.status === "rejected" && afterAbandon.receipt.reason === "recovery-abandoned" && Boolean(afterAbandon.receiptNode);
    steps.settledIntent = afterAbandon.bridge?.phase === "settled" && afterAbandon.bridge?.result === "aborted" && abandonedIntent?.phase === "settled" && abandonedIntent?.result === "aborted";
    steps.abandonDecisionDurable = afterAbandon.bridge?.recoveryDecision === "abandon" && abandonedIntent?.recoveryDecision === "abandon";
    steps.noSourceHandleWrite = afterAbandon.sourceHandles.every((handle) =>
      handle.sourcePackageId !== intent.sourcePackageId ||
        (handle.state === "not-linked" && handle.canRead === false && handle.permission === "not-requested" && handle.writePermission === "not-requested"),
    );
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-031-source-write-recovery-decisions-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      before,
      afterRetry,
      afterAbandon,
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

function writeRecoveryProject() {
  const projectPath = path.join(outDir, "da32-031-source-write-recovery-decisions-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "da32-031-recovery-project",
    name: "DA32-031 Source Recovery Decisions",
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
