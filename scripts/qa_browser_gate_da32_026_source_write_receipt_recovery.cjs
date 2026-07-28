/**
 * DA32-026: rehydrate a settled source-write receipt after a Studio reload.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-026-source-write-receipt-recovery-browser-gate.json");
const databaseName = "mugen-web-sandbox-studio";
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const sourceText = "[Statedef 0]\ntype = S\nphysics = S\nanim = 0\n";
const receipt = createReceipt();
const intent = {
  schema: "StudioSourceWriteIntent/v1",
  intentId: "source-intent:da32-026:receipt-source:chars/receipt/receipt.cns:settled",
  path: "chars/receipt/receipt.cns",
  preimageBytes: [...Buffer.from(sourceText, "utf8")],
  preimageSha256: fnvHex(Buffer.from(sourceText, "utf8")),
  projectId: "da32-026-source-write-receipt-recovery",
  sourcePackageId: "receipt-source",
  draftDigest: "fnv1a32:receipt-draft",
  byteLength: Buffer.byteLength(sourceText),
  phase: "settled",
  writeByteLength: Buffer.byteLength(sourceText),
  observedSourceFingerprint: receipt.observedSourceFingerprint,
  receiptId: receipt.id,
  receipt,
  result: "committed",
  recovery: "none",
  createdAt: "2026-07-28T00:00:00.000Z",
};

function createReceipt() {
  const payload = {
    schemaVersion: "mugen-web-sandbox/source-write-receipt/v1",
    id: "source-write:receipt-source:chars/receipt/receipt.cns",
    sourcePackageId: "receipt-source",
    sourceName: "Receipt Recovery Source",
    path: "chars/receipt/receipt.cns",
    status: "committed",
    reason: "write-and-reimport",
    observedAt: "2026-07-28T00:00:00.000Z",
    operation: "directory-exclusive-write-and-reimport",
    permission: "granted",
    baseSourceFingerprint: "sha256:receipt-before",
    observedSourceFingerprint: "sha256:receipt-after",
    committedSourceFingerprint: "sha256:receipt-after",
    baseProjectRevision: 1,
    observedProjectRevision: 1,
    draftDigest: "fnv1a32:receipt-draft",
    committedDigest: "fnv1a32:receipt-draft",
    byteLength: Buffer.byteLength(sourceText),
    compensation: { status: "not-needed", diagnostics: [] },
    invalidatedOutputs: ["runtime-manifest", "trace-artifact", "project-bundle"],
    diagnostics: [],
  };
  return { ...payload, digest: stableHash(payload) };
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of stableStringify(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

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
    probePaths: ["scripts/qa_browser_gate_da32_026_source_write_receipt_recovery.cjs"],
    codePaths: ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts", "src/app/StudioSourceWriteReceipt.ts"],
  });
  const port = await findFreePort(5830);
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
      schema: "Da32StudioSourceWriteReceiptRecoveryBrowserGate/v1",
      id: "DA32-026",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      database: databaseName,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional source-write receipt rehydration observations for named viewports"
        : "the named Studio route rehydrates a validated settled source-write receipt from the durable intent after reload",
      claims: {
        allowed: ok
          ? [
              "the durable intent retains a validated SourceWriteReceipt/v1 payload and receipt id",
              "the Studio bridge and visible recovery surface rehydrate the settled receipt after reload",
              "receipt digest and status remain intact at the named desktop and mobile routes",
            ]
          : [],
        blocked: [
          "physical crash injection between stream close and receipt finalization",
          "automatic receipt synthesis or source write retry",
          "quota and eviction recovery",
          "multi-file atomic recovery and ZIP archive rewrite",
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
      () => window.__MUGEN_WEB_SANDBOX__?.project?.id === "da32-026-source-write-receipt-recovery",
      null,
      { timeout: 30_000 },
    );
    await page.waitForSelector('[data-source-write-phase="settled"]', { timeout: 15_000 });
    await page.waitForSelector('[data-source-write-receipt="committed"]', { timeout: 15_000 });

    const before = await page.evaluate(async (database) => ({
      bridge: {
        studioSourceWriteIntent: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        studioSourceWriteReceipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
        sourceHandles: window.__MUGEN_WEB_SANDBOX__?.sourceHandles,
      },
      bodyHasReceipt: (document.body.textContent ?? "").includes("Write receipt: committed"),
      phaseNode: document.querySelector("[data-source-write-phase]")?.getAttribute("data-source-write-phase"),
      records: await new Promise((resolve) => {
        const request = indexedDB.open(database);
        request.onerror = () => resolve([]);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("intents", "readonly");
          const get = tx.objectStore("intents").getAll();
          get.onsuccess = () => resolve(get.result);
          get.onerror = () => resolve([]);
          tx.oncomplete = () => db.close();
        };
      }),
    }), databaseName);
    const durableIntent = before.records.find((record) => record.intentId === intent.intentId);
    const steps = {
      durableReceipt: durableIntent?.receipt?.id === receipt.id && durableIntent?.receipt?.digest === receipt.digest,
      bridgeReceipt: before.bridge?.studioSourceWriteReceipt?.id === receipt.id && before.bridge?.studioSourceWriteReceipt?.digest === receipt.digest,
      visibleReceipt: before.bodyHasReceipt && before.phaseNode === "settled",
      receiptDigest: before.bridge?.studioSourceWriteReceipt?.status === "committed" && before.bridge?.studioSourceWriteReceipt?.reason === "write-and-reimport",
      noSourceHandleWrite: (before.bridge?.sourceHandles ?? []).every((handle) => handle.sourcePackageId !== intent.sourcePackageId || (handle.persisted === false && handle.state === "not-linked" && handle.canRead === false)),
      noHorizontalOverflow: false,
    };
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-026-source-write-receipt-recovery-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      before: {
        bridge: {
          studioSourceWriteIntent: before.bridge?.studioSourceWriteIntent,
          studioSourceWriteReceipt: before.bridge?.studioSourceWriteReceipt,
          sourceHandles: before.bridge?.sourceHandles,
        },
        bodyHasReceipt: before.bodyHasReceipt,
        phaseNode: before.phaseNode,
        intent: durableIntent,
      },
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

function writeRecoveryProject() {
  const projectPath = path.join(outDir, "da32-026-source-write-receipt-recovery-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "da32-026-source-write-receipt-recovery",
    name: "DA32-026 Source Write Receipt Recovery",
    engineVersion: "qa-browser-gate",
    generatedAt: "2026-07-28T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [{
      id: "receipt-source",
      name: "Receipt Recovery Source",
      kind: "folder",
      fileCount: 1,
      status: "missing",
      characterId: "nova-boxer",
      characterName: "Nova Boxer",
      defPath: "chars/receipt/receipt.def",
      stageIds: [],
      stageDefPaths: [],
      requiredPaths: ["chars/receipt/receipt.cns"],
    }],
    assets: { characters: ["nova-boxer", "mira-volt", "rook-apprentice"], stages: ["rooftop-dojo"], audio: [], ui: [], effects: [] },
    assetRecords: [],
    entry: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" },
    compatibility: { gates: [], stats: { characters: 3, stages: 1, importedCharacters: 1, importedStages: 0, generatedAtlases: 3 } },
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
    request.onerror = () => reject(request.error ?? new Error("Could not seed source receipt database."));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("intents", "readwrite");
      tx.objectStore("intents").put(value, value.intentId);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error ?? new Error("Could not seed source receipt record."));
      tx.onabort = () => reject(tx.error ?? new Error("Source receipt seed transaction aborted."));
    };
  }), { name: databaseName, value: intent });
}

function findFreePort(start) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () => { server.close(); findFreePort(start + 1).then(resolve, reject); });
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
    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) { reject(new Error(`Vite server did not start at ${base}`)); return; }
      setTimeout(probe, 250);
    };
    const probe = () => {
      const request = require("node:http").get(base, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) { resolve(); return; }
        retry();
      });
      request.on("error", retry);
      request.setTimeout(1000, () => { request.destroy(); retry(); });
    };
    probe();
  });
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
