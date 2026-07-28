/**
 * DA32-028: classify real bytes from a granted folder handle after reload.
 */
const { chromium } = require("playwright");
const JSZip = require("jszip");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da32/browser");
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-028-source-write-observation-positive-browser-gate.json");
const databaseName = "mugen-web-sandbox-studio";
const fixturePath = path.join(repoRoot, ".scratch", "fixtures", "kfm-official.zip");
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const sourcePath = "chars/kfm/kfm.cns";
let intent;

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

function summarizeIntent(value) {
  if (!value || typeof value !== "object") return value;
  const observation = value.observation && typeof value.observation === "object"
    ? {
        status: value.observation.status,
        observedAt: value.observation.observedAt,
        digest: value.observation.digest,
        byteLength: value.observation.byteLength,
        permission: value.observation.permission,
        diagnostics: value.observation.diagnostics,
      }
    : undefined;
  return {
    schema: value.schema,
    intentId: value.intentId,
    path: value.path,
    projectId: value.projectId,
    sourcePackageId: value.sourcePackageId,
    preimageByteLength: Array.isArray(value.preimageBytes) ? value.preimageBytes.length : undefined,
    preimageSha256: value.preimageSha256,
    draftDigest: value.draftDigest,
    byteLength: value.byteLength,
    phase: value.phase,
    writeByteLength: value.writeByteLength,
    observation,
    receiptId: value.receiptId,
    result: value.result,
    recovery: value.recovery,
  };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(fixturePath)) throw new Error(`Required KFM fixture is missing: ${fixturePath}`);
  const entries = await readZipAsFolderHandleEntries(fixturePath);
  const sourceEntry = entries.find((entry) => entry.path.toLowerCase() === sourcePath.toLowerCase());
  if (!sourceEntry) throw new Error(`Required source entry is missing: ${sourcePath}`);
  const preimageBytes = Buffer.from(sourceEntry.base64, "base64");
  intent = {
    schema: "StudioSourceWriteIntent/v1",
    intentId: "source-intent:da32-028:kfm-folder:chars/kfm/kfm.cns:write-closed",
    path: sourcePath,
    preimageBytes: [...preimageBytes],
    preimageSha256: fnvHex(preimageBytes),
    projectId: "da32-028-source-write-observation-positive",
    sourcePackageId: "kfm-folder",
    draftDigest: "fnv1a32:observation-positive",
    byteLength: preimageBytes.byteLength,
    phase: "write-closed",
    writeByteLength: preimageBytes.byteLength,
    createdAt: "2026-07-28T00:00:00.000Z",
  };
  const projectPath = writeObservationProject();
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_028_source_write_observation_positive.cjs"],
    codePaths: ["src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts", "src/app/StudioSourceWrite.ts", "src/app/StudioSourceHandle.ts"],
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
      await runViewport(browser, base, projectPath, entries, { id: "desktop", width: 1440, height: 900 }),
      await runViewport(browser, base, projectPath, entries, { id: "mobile", width: 390, height: 844 }),
    ];
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32StudioSourceWriteObservationPositiveBrowserGate/v1",
      id: "DA32-028",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      database: databaseName,
      fixture: ".scratch/fixtures/kfm-official.zip",
      sourcePath,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional positive source-write observation observations for named viewports"
        : "the named Studio route reads actual source bytes through a granted folder handle, records matches-preimage, and keeps the write intent pending without invoking a writable stream",
      claims: {
        allowed: ok
          ? [
              "the named browser route relinks the KFM folder through the source handle picker",
              "Observe source reads chars/kfm/kfm.cns from the granted handle and records matches-preimage with digest and byte length",
              "the source intent remains write-closed without a result or receipt after observation",
              "the positive observation path does not call createWritable",
            ]
          : [],
        blocked: [
          "matches-draft and changed source classification in a browser gate",
          "physical crash injection between stream close and receipt finalization",
          "explicit receipt finalization and automatic source write retry",
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

async function runViewport(browser, base, projectPath, entries, options) {
  const context = await browser.newContext({ viewport: { width: options.width, height: options.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.setDefaultNavigationTimeout(120_000);
  await installFolderHandle(page, entries);
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
      () => window.__MUGEN_WEB_SANDBOX__?.project?.id === "da32-028-source-write-observation-positive",
      null,
      { timeout: 30_000 },
    );
    try {
      await page.waitForSelector('[data-source-write-observation="needs-observation"]', { timeout: 15_000 });
    } catch (error) {
      const diagnostic = await page.evaluate(() => ({
        bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        project: window.__MUGEN_WEB_SANDBOX__?.project,
        sourceHandles: window.__MUGEN_WEB_SANDBOX__?.sourceHandles,
        body: (document.body.textContent ?? "").slice(-2400),
      }));
      throw new Error(`Source observation state did not render: ${JSON.stringify(diagnostic)}; ${error.message}`);
    }
    const steps = {
      pendingIntentVisible: false,
      nativeRelink: false,
      readPermission: false,
      observedPreimage: false,
      durableObservation: false,
      bridgeObservation: false,
      visibleObservation: false,
      pendingAfterObservation: false,
      noWritableStream: false,
      noReceipt: false,
      noHorizontalOverflow: false,
    };
    const before = await page.evaluate(() => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      relinkButton: Boolean(document.querySelector('[data-action="relink-source-write-intent"]')),
      observation: document.querySelector('[data-source-write-observation]')?.getAttribute("data-source-write-observation"),
    }));
    steps.pendingIntentVisible = before.bridge?.intentId === intent.intentId && before.bridge?.phase === "write-closed" && before.relinkButton;
    await page.evaluate(() => {
      const button = document.querySelector('[data-action="relink-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source observation relink action is missing");
      button.click();
    });
    await page.waitForFunction(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const sourcePackage = bridge?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder");
      const handle = bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
      return sourcePackage?.status === "linked" && handle?.state === "granted" && handle?.canRead === true;
    }, null, { timeout: 90_000 });
    steps.nativeRelink = await page.evaluate(() => Boolean(window.__DA32_028_FOLDER_HANDLE__));
    steps.readPermission = await page.evaluate(() => {
      const handle = window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
      return handle?.permission === "granted" && handle?.canRead === true;
    });
    await page.evaluate(() => {
      const button = document.querySelector('[data-mode="studio"]');
      if (!(button instanceof HTMLElement)) throw new Error("Studio mode navigation is missing after relink");
      button.click();
    });
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio", null, { timeout: 15_000 });
    try {
      await page.waitForSelector('[data-source-write-observation="needs-observation"]', { timeout: 15_000 });
    } catch (error) {
      const diagnostic = await page.evaluate(() => ({
        bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
        project: window.__MUGEN_WEB_SANDBOX__?.project,
        sourceHandles: window.__MUGEN_WEB_SANDBOX__?.sourceHandles,
        body: (document.body.textContent ?? "").slice(-2400),
      }));
      throw new Error(`Source observation state disappeared after relink: ${JSON.stringify(diagnostic)}; ${error.message}`);
    }
    await page.evaluate(() => {
      const button = document.querySelector('[data-action="observe-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source observation action is missing after relink");
      button.click();
    });
    await page.waitForSelector('[data-source-write-observation="matches-preimage"]', { timeout: 30_000 });
    const after = await page.evaluate(async (database) => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
      sourceHandle: window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
      bodyHasObservation: (document.body.textContent ?? "").includes("Source observation: matches-preimage"),
      observationNode: document.querySelector('[data-source-write-observation-status]')?.getAttribute("data-source-write-observation-status"),
      writeCalls: window.__DA32_028_WRITE_CALLS__ ?? 0,
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
    steps.observedPreimage = after.bridge?.observation?.status === "matches-preimage" && after.bridge.observation.byteLength === intent.byteLength && typeof after.bridge.observation.digest === "string";
    steps.durableObservation = afterIntent?.observation?.status === "matches-preimage" && afterIntent?.observation?.byteLength === intent.byteLength && afterIntent?.receipt === undefined;
    steps.bridgeObservation = after.bridge?.observation?.status === "matches-preimage" && after.bridge?.observation?.permission === "granted";
    steps.visibleObservation = after.bodyHasObservation && after.observationNode === "matches-preimage";
    steps.pendingAfterObservation = after.bridge?.phase === "write-closed" && after.bridge?.result === undefined;
    steps.noWritableStream = after.writeCalls === 0;
    steps.noReceipt = after.receipt === undefined && afterIntent?.receipt === undefined;
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-028-source-write-observation-positive-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      before: { ...before, bridge: summarizeIntent(before.bridge) },
      after: {
        bridge: summarizeIntent(after.bridge),
        receipt: after.receipt,
        sourceHandle: after.sourceHandle,
        durableIntent: summarizeIntent(afterIntent),
        writeCalls: after.writeCalls,
      },
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

async function installFolderHandle(page, entries) {
  await page.addInitScript(({ fixtureEntries }) => {
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
        queryPermission: async ({ mode } = {}) => mode === "readwrite" ? "prompt" : "granted",
        requestPermission: async ({ mode } = {}) => mode === "readwrite" ? "prompt" : "granted",
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
          window.__DA32_028_WRITE_CALLS__ = (window.__DA32_028_WRITE_CALLS__ ?? 0) + 1;
          throw new Error("DA32-028 must not open a writable stream");
        },
      };
      directory.children.push(fileEntry);
    }
    window.__DA32_028_FOLDER_HANDLE__ = root;
    Object.defineProperty(window, "showDirectoryPicker", { configurable: true, value: async () => root });
  }, { fixtureEntries: entries });
}

function writeObservationProject() {
  const projectPath = path.join(outDir, "da32-028-source-write-observation-positive-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "da32-028-source-write-observation-positive",
    name: "DA32-028 Source Write Observation Positive",
    engineVersion: "qa-browser-gate",
    generatedAt: "2026-07-28T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [{
      id: "kfm-folder",
      name: "KFM observation folder",
      kind: "folder",
      fileCount: 14,
      status: "missing",
      characterId: "imported-kfm",
      characterName: "Kung Fu Man",
      defPath: "chars/kfm/kfm.def",
      stageIds: ["kfm"],
      stageDefPaths: ["stages/kfm.def"],
      requiredPaths: ["chars/kfm/kfm.def", "chars/kfm/kfm.sff", "chars/kfm/kfm.air", "chars/kfm/kfm.cmd", sourcePath],
    }],
    assets: { characters: ["nova-boxer", "mira-volt", "rook-apprentice"], stages: ["rooftop-dojo"], audio: [], ui: [], effects: [] },
    assetRecords: [],
    entry: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" },
    compatibility: { gates: [], stats: { characters: 3, stages: 1, importedCharacters: 1, importedStages: 0, generatedAtlases: 3 } },
  };
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), "utf8");
  return projectPath;
}

async function readZipAsFolderHandleEntries(importedFixturePath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(importedFixturePath));
  return Promise.all(Object.entries(zip.files)
    .filter(([, entry]) => !entry.dir)
    .map(async ([entryPath, entry]) => ({ path: entryPath, base64: await entry.async("base64") })));
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
