/**
 * DA32-024: relink a pending source-write intent through a native folder
 * handle, replay its preimage, and finish the explicit write/reimport path.
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
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-024-source-intent-write-recovery-browser-gate.json");
const databaseName = "mugen-web-sandbox-studio";
const fixturePath = path.join(repoRoot, ".scratch", "fixtures", "kfm-official.zip");
const studioRoute = "/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const sourcePath = "chars/kfm/kfm.cns";
const sourceText = "[Statedef 0]\ntype = S\nphysics = S\nanim = 0\n";
const intent = {
  schema: "StudioSourceWriteIntent/v1",
  intentId: "source-intent:da32-024:kfm-folder:chars/kfm/kfm.cns:pending",
  path: sourcePath,
  preimageBytes: [...Buffer.from(sourceText, "utf8")],
  preimageSha256: fnvHex(Buffer.from(sourceText, "utf8")),
  projectId: "da32-024-source-intent-write-recovery",
  sourcePackageId: "kfm-folder",
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
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Required KFM fixture is missing: ${fixturePath}`);
  }
  const entries = await readZipAsFolderHandleEntries(fixturePath);
  const projectPath = writeRecoveryProject();
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_024_source_intent_write_recovery.cjs"],
    codePaths: [
      "src/app/App.ts",
      "src/app/StudioSourceDocument.ts",
      "src/app/StudioSourceHandle.ts",
      "src/app/StudioSourceWrite.ts",
      "src/app/StudioIndexedDbSnapshot.ts",
    ],
  });
  const port = await findFreePort(5820);
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
      schema: "Da32StudioSourceIntentWriteRecoveryBrowserGate/v1",
      id: "DA32-024",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: studioRoute,
      database: databaseName,
      fixture: ".scratch/fixtures/kfm-official.zip",
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional source-intent relink/write recovery observations for named viewports"
        : "the named Studio route relinks a folder handle, replays a pending source preimage, and completes explicit write/reimport recovery",
      claims: {
        allowed: ok
          ? [
              "the recovery action uses a native folder handle picker and preserves a granted read handle",
              "a pending StudioSourceWriteIntent/v1 preimage loads as a dirty editor draft when the active source differs",
              "Save & Reimport requests readwrite permission, writes the recovered text, and reimports the folder",
              "the original pending intent settles as committed with restored recovery evidence",
              "the named desktop and mobile routes have no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: [
          "physical user permission prompts and browser variance",
          "crash injection between writable-stream close and receipt finalization",
          "quota and eviction recovery",
          "multi-file atomic recovery and ZIP archive rewrite",
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
      () => window.__MUGEN_WEB_SANDBOX__?.project?.id === "da32-024-source-intent-write-recovery",
      null,
      { timeout: 30_000 },
    );
    await page.waitForSelector('[data-action="relink-source-write-intent"]', { timeout: 15_000 });

    const steps = {
      pendingIntentVisible: false,
      nativeRelink: false,
      linkedSourceReadable: false,
      dirtyPreimageLoaded: false,
      readwritePermission: false,
      writeReimportCommitted: false,
      originalIntentSettled: false,
      exactRecoveredBytesOnHandle: false,
      noHorizontalOverflow: false,
    };
    const before = await page.evaluate(() => ({
      bridge: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent,
      bodyHasRelink: (document.body.textContent ?? "").includes("Relink folder"),
      relinkButton: Boolean(document.querySelector('[data-action="relink-source-write-intent"]')),
    }));
    steps.pendingIntentVisible = Boolean(
      before.bridge?.intentId === intent.intentId &&
        before.bridge?.result === undefined &&
        before.bodyHasRelink &&
        before.relinkButton,
    );

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="relink-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source intent relink action is missing");
      button.click();
    });
    await page.waitForFunction(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const sourcePackage = bridge?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder");
      const sourceHandle = bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
      return sourcePackage?.status === "linked" && sourceHandle?.handleKind === "directory";
    }, null, { timeout: 90_000 });
    steps.nativeRelink = await page.evaluate(() => Boolean(window.__DA32_024_FOLDER_HANDLE__));
    steps.linkedSourceReadable = await page.evaluate(() => {
      const handle = window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder");
      return handle?.state === "granted" && handle?.canRead === true;
    });

    await page.evaluate(() => document.querySelector('[data-mode="studio"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.mode === "studio");
    await page.waitForSelector('[data-studio-tab="build"]');
    await page.evaluate(() => {
      const button = document.querySelector('[data-action="replay-source-write-intent"]');
      if (!(button instanceof HTMLButtonElement)) throw new Error("source intent replay action is missing");
      button.click();
    });
    await page.waitForFunction(
      (expected) => window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument?.text === expected,
      sourceText,
      { timeout: 30_000 },
    );
    const replayed = await page.evaluate(() => ({
      editor: document.querySelector("[data-source-editor]")?.value,
      draft: window.__MUGEN_WEB_SANDBOX__?.studioSourceDocument,
      saveDisabled: document.querySelector('[data-action="save-source-document"]')?.hasAttribute("disabled") ?? true,
      sourcePackage: window.__MUGEN_WEB_SANDBOX__?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder"),
      sourceHandle: window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
      sourceTransaction: window.__MUGEN_WEB_SANDBOX__?.sourceTransactions?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
    }));
    steps.dirtyPreimageLoaded = replayed.editor === sourceText && replayed.draft?.dirty === true && !replayed.saveDisabled;
    if (!steps.dirtyPreimageLoaded) {
      throw new Error(`Recovered draft was not writable: ${JSON.stringify(replayed)}`);
    }

    await page.evaluate(() => {
      const button = document.querySelector('[data-action="save-source-document"]');
      if (!(button instanceof HTMLButtonElement) || button.disabled) throw new Error("source intent recovered draft save action is unavailable");
      button.click();
    });
    try {
      await page.waitForFunction(
        () => window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt?.status === "committed",
        null,
        { timeout: 120_000 },
      );
    } catch (error) {
      const diagnostic = await page.evaluate(() => ({
        receipt: window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteReceipt,
        sourcePackage: window.__MUGEN_WEB_SANDBOX__?.project?.sourcePackages?.find((candidate) => candidate.id === "kfm-folder"),
        sourceHandle: window.__MUGEN_WEB_SANDBOX__?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
        sourceTransaction: window.__MUGEN_WEB_SANDBOX__?.sourceTransactions?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
        logs: window.__MUGEN_WEB_SANDBOX__?.logs?.slice?.(-8),
      }));
      throw new Error(`Source write receipt did not commit: ${JSON.stringify(diagnostic)}; ${error.message}`);
    }
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.sourceImportTransaction?.reason === "explicit-reimport",
      null,
      { timeout: 120_000 },
    );
    await page.waitForFunction(
      () => {
        const intent = window.__MUGEN_WEB_SANDBOX__?.studioSourceWriteIntent;
        return intent?.intentId === "source-intent:da32-024:kfm-folder:chars/kfm/kfm.cns:pending" &&
          intent.result === "committed" &&
          intent.recovery === "restored";
      },
      null,
      { timeout: 30_000 },
    );
    const after = await page.evaluate(async () => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const fileHandle = await window.__DA32_024_FOLDER_HANDLE__.getDirectoryHandle("chars").then((chars) => chars.getDirectoryHandle("kfm")).then((kfm) => kfm.getFileHandle("kfm.cns"));
      const file = await fileHandle.getFile();
      const records = await new Promise((resolve) => {
        const request = indexedDB.open("mugen-web-sandbox-studio");
        request.onerror = () => resolve([]);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("intents", "readonly");
          const get = tx.objectStore("intents").getAll();
          get.onsuccess = () => resolve(get.result);
          get.onerror = () => resolve([]);
          tx.oncomplete = () => db.close();
        };
      });
      return {
        sourceHandle: bridge?.sourceHandles?.find((candidate) => candidate.sourcePackageId === "kfm-folder"),
        receipt: bridge?.studioSourceWriteReceipt,
        intent: bridge?.studioSourceWriteIntent,
        intents: records,
        fileText: await file.text(),
        writePermissionRequests: window.__DA32_024_WRITE_PERMISSION_REQUESTS__,
        bodyHasCommitted: (document.body.textContent ?? "").includes("committed"),
      };
    });
    steps.readwritePermission = after.writePermissionRequests > 0;
    steps.writeReimportCommitted = Boolean(
      after.receipt?.status === "committed" &&
        after.receipt?.reason === "write-and-reimport",
    );
    steps.originalIntentSettled = Boolean(
      after.intent?.intentId === intent.intentId &&
        after.intent?.result === "committed" &&
        after.intent?.recovery === "restored" &&
        after.intents.some((record) => record.intentId === intent.intentId && record.result === "committed" && record.recovery === "restored"),
    );
    steps.exactRecoveredBytesOnHandle = after.fileText === sourceText;
    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth ?? 0,
    }));
    steps.noHorizontalOverflow = viewport.scrollWidth <= viewport.innerWidth + 1 && viewport.bodyScrollWidth <= viewport.innerWidth + 1;
    const screenshot = path.join(outDir, `da32-024-source-intent-write-recovery-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(steps).every(Boolean),
      steps,
      before,
      replayed,
      after: {
        sourceHandle: after.sourceHandle,
        receipt: after.receipt,
        intent: after.intent,
        durableIntent: after.intents.find((record) => record.intentId === intent.intentId),
        fileText: after.fileText,
        writePermissionRequests: after.writePermissionRequests,
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
        requestPermission: async ({ mode } = {}) => {
          if (mode === "readwrite") window.__DA32_024_WRITE_PERMISSION_REQUESTS__ = (window.__DA32_024_WRITE_PERMISSION_REQUESTS__ ?? 0) + 1;
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
      const fileEntry = {
        kind: "file",
        name,
        bytes: Uint8Array.from(atob(entry.base64), (character) => character.charCodeAt(0)),
        getFile: async () => new File([fileEntry.bytes], name, { type: "application/octet-stream" }),
        createWritable: async () => {
          let staged = fileEntry.bytes.slice();
          return {
            write: async (value) => {
              staged = typeof value === "string" ? new TextEncoder().encode(value) : Uint8Array.from(value);
            },
            close: async () => {
              fileEntry.bytes = staged;
            },
            abort: async () => {},
          };
        },
      };
      directory.children.push(fileEntry);
    }
    window.__DA32_024_FOLDER_HANDLE__ = root;
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => root,
    });
  }, { fixtureEntries: entries });
}

function writeRecoveryProject() {
  const projectPath = path.join(outDir, "da32-024-source-intent-write-recovery-project.json");
  const project = {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "da32-024-source-intent-write-recovery",
    name: "DA32-024 Source Intent Write Recovery",
    engineVersion: "qa-browser-gate",
    generatedAt: "2026-07-28T00:00:00.000Z",
    projectType: "mugen-port",
    modules: ["mugen-compat", "three-render", "studio-workspace"],
    sourcePackages: [{
      id: "kfm-folder",
      name: "KFM recovery folder",
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
