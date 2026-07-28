/**
 * DA32-029: accept a verified source observation, reimport the folder, and
 * settle the original write intent with an explicit receipt.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-029-source-write-observation-finalize-browser-gate.json");
const databaseName = "mugen-web-sandbox-studio";
const fixturePath = path.join(repoRoot, ".scratch", "fixtures", "kfm-official.zip");
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const sourcePath = "chars/kfm/kfm.cns";
let intent;
let draftText;

function fnvText(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function fnvBytes(bytes) {
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
    baseSourceFingerprint: value.baseSourceFingerprint,
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
  const sourceText = preimageBytes.toString("utf8").replace(/^\uFEFF/, "");
  if (!sourceText.includes("life = 1000")) throw new Error("KFM fixture no longer contains the expected life setting.");
  draftText = sourceText.replace("life = 1000", "life = 999");
  const draftBytes = Buffer.from(draftText, "utf8");
  intent = {
    schema: "StudioSourceWriteIntent/v1",
    intentId: "source-intent:da32-029:kfm-folder:chars/kfm/kfm.cns:write-closed",
    path: sourcePath,
    preimageBytes: [...preimageBytes],
    preimageSha256: fnvBytes(preimageBytes),
    projectId: "da32-029-source-write-observation-finalize",
    sourcePackageId: "kfm-folder",
    draftDigest: fnvText(draftText),
    byteLength: preimageBytes.byteLength,
    phase: "write-closed",
    writeByteLength: draftBytes.byteLength,
    createdAt: "2026-07-28T00:00:00.000Z",
  };
  const projectPath = writeFinalizeProject(entries.length);
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_029_source_write_observation_finalize.cjs"],
    codePaths: [
      "src/app/App.ts",
      "src/app/StudioIndexedDbSnapshot.ts",
      "src/app/StudioSourceWrite.ts",
      "src/app/StudioSourceWriteReceipt.ts",
      "src/app/StudioSourceHandle.ts",
    ],
  });
  const port = await findFreePort(5840);
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
      schema: "Da32StudioSourceWriteObservationFinalizeBrowserGate/v1",
      id: "DA32-029",
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
        ? "provisional observed-source finalization observations for named viewports"
        : "the named Studio route accepts a matches-draft source observation, explicitly reimports the folder, and settles the original write intent with an observed-write-and-reimport receipt",
      claims: {
        allowed: ok
          ? [
              "the route reads the modified KFM source and records matches-draft before acceptance",
              "Accept observed source performs a second source read and explicit folder reimport",
              "the original write-closed intent settles as committed with observed recovery evidence",
              "the receipt uses observed-write-and-reimport and preserves the committed source fingerprint and draft digest",
              "the acceptance path does not call createWritable or request readwrite permission",
              "the named desktop and mobile routes have no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: [
          "physical crash injection at every stream and IndexedDB boundary",
          "automatic retry, abandon, quota, eviction, and multi-tab recovery",
          "multi-file atomic recovery and ZIP archive rewrite",
          "physical browser permission prompt coverage",
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
      () => window.__MUGEN_WEB_SANDBOX__?.project?.id === "da32-029-source-write-observation-finalize",
      null,
      { timeout: 30_000 },
    );
    await page.waitForSelector('[data-source-write-observation="needs-observation"]', { timeout: 15_000 });

    const steps = {
      pendingIntentVisible: false,
      nativeRelink: false,
      observedDraft: false,
      acceptActionVisible: false,
      explicitReimport: false,
      committedReceipt: false,
      settledIntent: false,
      observedRecovery: false,
      sourceFingerprintCommitted: false,
      exactDraftBytesOnHandle: false,
      noWritableStream: false,
      noReadwritePermission: false,
      noHorizontalOverflow: false,
    };
    const before = await page.evaluate(() => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      relinkButton: Boolean(document.querySelector('[data-action="relink-source-write-intent"]')),
    }));
    steps.pendingIntentVisible = before.bridge?.intentId === intent.intentId && before.bridge?.phase === "write-closed" && before.relinkButton;

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="relink-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source finalize relink action is missing");
      button.click();
    });
    await page.waitForFunction(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const sourcePackage = bridge?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder");
      const handle = bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
      return sourcePackage?.status === "linked" && handle?.state === "granted" && handle?.canRead === true;
    }, null, { timeout: 90_000 });
    steps.nativeRelink = await page.evaluate(() => Boolean(window.__DA32_029_FOLDER_HANDLE__));
    await page.evaluate(() => document.querySelector('[data-mode="studio"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio", null, { timeout: 15_000 });
    await page.waitForSelector('[data-source-write-observation="needs-observation"]', { timeout: 15_000 });

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="observe-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source observation action is missing");
      button.click();
    });
    try {
      await page.waitForSelector('[data-source-write-observation="matches-draft"]', { timeout: 30_000 });
    } catch (error) {
      const diagnostic = await page.evaluate(() => ({
        bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
        sourceHandle: window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
        body: (document.body.textContent ?? "").slice(-3200),
        mode: window.__MUGEN_WEB_SANDBOX__?.mode,
      }));
      throw new Error(`Observed draft classification failed: ${JSON.stringify(diagnostic)}; ${error.message}`);
    }
    const observed = await page.evaluate(() => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
      accept: Boolean(document.querySelector('[data-action="finalize-observed-source-write-intent"]')),
    }));
    steps.observedDraft = observed.bridge?.observation?.status === "matches-draft" && observed.receipt === undefined;
    steps.acceptActionVisible = observed.accept;

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="finalize-observed-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("observed source acceptance action is missing");
      button.click();
    });
    try {
      await page.waitForFunction(() => {
        const bridge = window.__MUGEN_WEB_SANDBOX__;
        return bridge?.studioSourceWriteReceipt?.status === "committed" &&
          bridge.studioSourceWriteReceipt.reason === "observed-write-and-reimport" &&
          bridge.studioSourceWriteIntent?.phase === "settled" &&
          bridge.studioSourceWriteIntent?.result === "committed";
      }, null, { timeout: 120_000 });
    } catch (error) {
      const diagnostic = await page.evaluate(() => ({
        intent: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
        receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
        sourceImportTransaction: window.__MUGEN_WEB_SANDBOX__?.sourceImportTransaction,
        sourcePackage: window.__MUGEN_WEB_SANDBOX__?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder"),
        sourceHandle: window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
        logs: window.__MUGEN_WEB_SANDBOX__?.logs?.slice?.(-12),
        body: (document.body.textContent ?? "").slice(-2400),
      }));
      diagnostic.intent = summarizeIntent(diagnostic.intent);
      throw new Error(`Observed source acceptance did not settle: ${JSON.stringify(diagnostic)}; ${error.message}`);
    }
    steps.explicitReimport = await page.waitForFunction(
      () => {
        const transaction = window.__MUGEN_WEB_SANDBOX__?.sourceImportTransaction;
        return transaction?.status === "accepted" && transaction.targetId === "kfm-folder";
      },
      null,
      { timeout: 30_000 },
    ).then(() => true).catch(() => false);
    if (await page.evaluate(() => window.__MUGEN_WEB_SANDBOX__?.mode) !== "studio") {
      await page.evaluate(() => document.querySelector('[data-mode="studio"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio", null, { timeout: 15_000 });
    }
    await page.waitForSelector('[data-source-write-receipt="committed"]', { timeout: 15_000 });

    const after = await page.evaluate(async (database) => ({
      bridge: window.__MUGEN_WEB_SANDBOX__,
      receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
      intent: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      sourceHandle: window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
      sourceTransaction: window.__MUGEN_WEB_SANDBOX__?.sourceTransactions?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
      fileText: await window.__DA32_029_FOLDER_HANDLE__.getDirectoryHandle("chars")
        .then((chars) => chars.getDirectoryHandle("kfm"))
        .then((kfm) => kfm.getFileHandle("kfm.cns"))
        .then((fileHandle) => fileHandle.getFile())
        .then((file) => file.text()),
      writeCalls: window.__DA32_029_WRITE_CALLS__ ?? 0,
      readwritePermissionRequests: window.__DA32_029_READWRITE_PERMISSION_REQUESTS__ ?? 0,
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
    const durable = after.records.find((record) => record.intentId === intent.intentId);
    steps.committedReceipt = after.receipt?.status === "committed" && after.receipt.reason === "observed-write-and-reimport";
    steps.settledIntent = after.intent?.phase === "settled" && after.intent?.result === "committed" && durable?.result === "committed";
    steps.observedRecovery = after.intent?.recovery === "observed" && durable?.recovery === "observed";
    steps.sourceFingerprintCommitted = typeof after.receipt?.committedSourceFingerprint === "string" && after.receipt.committedSourceFingerprint === after.sourceHandle?.observedFingerprint;
    steps.exactDraftBytesOnHandle = after.fileText === draftText;
    steps.noWritableStream = after.writeCalls === 0;
    steps.noReadwritePermission = after.readwritePermissionRequests === 0;
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-029-source-write-observation-finalize-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      before: { ...before, bridge: summarizeIntent(before.bridge) },
      observed: { bridge: summarizeIntent(observed.bridge), receipt: observed.receipt, accept: observed.accept },
      after: {
        receipt: after.receipt,
        intent: summarizeIntent(after.intent),
        durableIntent: summarizeIntent(durable),
        sourceHandle: after.sourceHandle,
        sourceTransaction: after.sourceTransaction,
        fileText: after.fileText,
        writeCalls: after.writeCalls,
        readwritePermissionRequests: after.readwritePermissionRequests,
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
  await page.addInitScript(({ fixtureEntries, targetPath, modifiedText }) => {
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
        requestPermission: async ({ mode } = {}) => {
          if (mode === "readwrite") {
            window.__DA32_029_READWRITE_PERMISSION_REQUESTS__ = (window.__DA32_029_READWRITE_PERMISSION_REQUESTS__ ?? 0) + 1;
            return "prompt";
          }
          return "granted";
        },
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
      const originalBytes = Uint8Array.from(atob(entry.base64), (character) => character.charCodeAt(0));
      const bytes = entry.path.toLowerCase() === targetPath.toLowerCase()
        ? new TextEncoder().encode(modifiedText)
        : originalBytes;
      const fileEntry = {
        kind: "file",
        name,
        bytes,
        getFile: async () => new File([fileEntry.bytes], name, { type: "application/octet-stream" }),
        createWritable: async () => {
          window.__DA32_029_WRITE_CALLS__ = (window.__DA32_029_WRITE_CALLS__ ?? 0) + 1;
          throw new Error("DA32-029 must not open a writable stream");
        },
      };
      directory.children.push(fileEntry);
    }
    window.__DA32_029_FOLDER_HANDLE__ = root;
    Object.defineProperty(window, "showDirectoryPicker", { configurable: true, value: async () => root });
  }, { fixtureEntries: entries, targetPath: sourcePath, modifiedText: draftText });
}

function writeFinalizeProject(fileCount) {
  const projectPath = path.join(outDir, "da32-029-source-write-observation-finalize-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "da32-029-source-write-observation-finalize",
    name: "DA32-029 Source Write Observation Finalize",
    engineVersion: "qa-browser-gate",
    generatedAt: "2026-07-28T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [{
      id: "kfm-folder",
      name: "KFM observed draft folder",
      kind: "folder",
      fileCount,
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
    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Vite server did not start at ${base}`));
        return;
      }
      setTimeout(probe, 250);
    };
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
    probe();
  });
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
