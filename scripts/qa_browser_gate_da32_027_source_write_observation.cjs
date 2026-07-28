/**
 * DA32-027: retain an explicit source observation state after a write-closed
 * intent is reopened without a source handle.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-027-source-write-observation-browser-gate.json");
const databaseName = "mugen-web-sandbox-studio";
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const sourceText = "[Statedef 0]\ntype = S\nphysics = S\nanim = 0\n";
const intent = {
  schema: "StudioSourceWriteIntent/v1",
  intentId: "source-intent:da32-027:observation-source:chars/observation/observation.cns:write-closed",
  path: "chars/observation/observation.cns",
  preimageBytes: [...Buffer.from(sourceText, "utf8")],
  preimageSha256: fnvHex(Buffer.from(sourceText, "utf8")),
  projectId: "da32-027-source-write-observation",
  sourcePackageId: "observation-source",
  draftDigest: "fnv1a32:observation-draft",
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
  const projectPath = writeObservationProject();
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_027_source_write_observation.cjs"],
    codePaths: ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"],
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
      schema: "Da32StudioSourceWriteObservationBrowserGate/v1",
      id: "DA32-027",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      database: databaseName,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional source-write observation recovery observations for named viewports"
        : "the named Studio route persists needs-observation and unavailable outcomes for a write-closed intent without settling a receipt",
      claims: {
        allowed: ok
          ? [
              "a durable write-closed intent without a receipt is marked needs-observation after reload",
              "the Studio bridge and visible recovery surface expose the observation state",
              "an unavailable source handle records an explicit unavailable observation without creating a receipt",
              "the pending intent remains write-closed and no source handle write occurs at the named desktop and mobile routes",
            ]
          : [],
        blocked: [
          "physical crash injection between stream close and receipt finalization",
          "successful physical source read classification with a granted File System Access handle",
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
      () => window.__MUGEN_WEB_SANDBOX__?.project?.id === "da32-027-source-write-observation",
      null,
      { timeout: 30_000 },
    );
    await page.waitForSelector('[data-source-write-phase="write-closed"]', { timeout: 15_000 });
    await page.waitForSelector('[data-source-write-observation="needs-observation"]', { timeout: 15_000 });

    const before = await page.evaluate(async (database) => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      bodyHasObservation: (document.body.textContent ?? "").includes("Source observation: needs-observation"),
      observationNode: document.querySelector("[data-source-write-observation-status]")?.getAttribute("data-source-write-observation-status"),
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
    const beforeIntent = before.records.find((record) => record.intentId === intent.intentId);
    const steps = {
      durableNeedsObservation: beforeIntent?.observation?.status === "needs-observation",
      bridgeNeedsObservation: before.bridge?.observation?.status === "needs-observation",
      visibleNeedsObservation: before.bodyHasObservation && before.observationNode === "needs-observation",
      pendingBeforeObserve: before.bridge?.phase === "write-closed" && before.bridge?.result === undefined,
    };

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="observe-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source observation action is missing");
      button.click();
    });
    await page.waitForSelector('[data-source-write-observation="unavailable"]', { timeout: 15_000 });
    const after = await page.evaluate(async (database) => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
      sourceHandles: window.__MUGEN_WEB_SANDBOX__?.sourceHandles ?? [],
      bodyHasUnavailable: (document.body.textContent ?? "").includes("Source observation: unavailable"),
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
    const afterIntent = after.records.find((record) => record.intentId === intent.intentId);
    steps.durableUnavailable = afterIntent?.observation?.status === "unavailable" && afterIntent?.receipt === undefined;
    steps.bridgeUnavailable = after.bridge?.observation?.status === "unavailable" && after.receipt === undefined;
    steps.visibleUnavailable = after.bodyHasUnavailable;
    steps.pendingAfterObserve = after.bridge?.phase === "write-closed" && after.bridge?.result === undefined;
    steps.noSourceHandleWrite = after.sourceHandles.every((handle) =>
      handle.sourcePackageId !== intent.sourcePackageId ||
      (handle.persisted === false && handle.state === "not-linked" && handle.canRead === false),
    );
    await page.evaluate(() => {
      const button = document.querySelector('[data-action="replay-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source preimage recovery action is missing");
      button.click();
    });
    await page.waitForFunction((expected) => window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument?.text === expected, sourceText, { timeout: 15_000 });
    const replayed = await page.evaluate(() => ({
      intent: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      document: window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument,
      editorValue: document.querySelector("[data-source-editor]")?.value,
    }));
    steps.exactPreimageLoaded = replayed.editorValue === sourceText && replayed.document?.text === sourceText;
    steps.pendingAfterPreimage = replayed.intent?.phase === "write-closed" && replayed.intent?.result === undefined;
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-027-source-write-observation-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      before: { bridge: before.bridge, intent: beforeIntent, bodyHasObservation: before.bodyHasObservation, observationNode: before.observationNode },
      after: { bridge: after.bridge, receipt: after.receipt, intent: afterIntent, sourceHandles: after.sourceHandles, replayed },
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

function writeObservationProject() {
  const projectPath = path.join(outDir, "da32-027-source-write-observation-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "da32-027-source-write-observation",
    name: "DA32-027 Source Write Observation",
    engineVersion: "qa-browser-gate",
    generatedAt: "2026-07-28T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [{
      id: "observation-source",
      name: "Observation Source",
      kind: "folder",
      fileCount: 1,
      status: "missing",
      characterId: "nova-boxer",
      characterName: "Nova Boxer",
      defPath: "chars/observation/observation.def",
      stageIds: [],
      stageDefPaths: [],
      requiredPaths: ["chars/observation/observation.cns"],
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
    request.onerror = () => reject(request.error ?? new Error("Could not seed source observation database."));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("intents", "readwrite");
      tx.objectStore("intents").put(value, value.intentId);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error ?? new Error("Could not seed source observation record."));
      tx.onabort = () => reject(tx.error ?? new Error("Source observation seed transaction aborted."));
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
