const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const JSZip = require("jszip");
const { chromium } = require("playwright");

const OUT_DIR = path.resolve(process.cwd(), ".scratch/qa/studio-compatibility-snapshot");
const SNAPSHOT_PATH = "qa/compatibility-corpus-snapshot-v1.json";
const SNAPSHOT_SCHEMA = "mugen-web-sandbox/compatibility-corpus-snapshot/v1.1";
const GATE_EVIDENCE_PATH = "studio/gate-evidence.json";
const GATE_EVIDENCE_SCHEMA = "mugen-web-sandbox/gate-evidence/v0";

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await startViteServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  const consoleIssues = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleIssues.push({ type: message.type(), text: message.text() });
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  const failures = [];
  try {
    await page.goto(`${server.baseUrl}/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    await waitForBridge(page);
    const buildSurface = await page.evaluate(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      const snapshot = bridge?.studioEvidence?.compatibilitySnapshot;
      const record = bridge?.studioEvidence?.records?.find((item) => item.id === "compat:snapshot");
      const trustRow = bridge?.studioTrustChain?.find((item) => item.id === "compatibility-snapshot");
      return {
        mode: bridge?.mode,
        studioTab: bridge?.studioTab,
        bodyHasPanel: document.body.innerText.includes("Compatibility Corpus Snapshot"),
        snapshotStatus: snapshot?.status,
        snapshotDigest: snapshot?.snapshot?.semanticDigest,
        recordStatus: record?.status,
        trustState: trustRow?.state,
        trustBinding: document.querySelector('[data-trust-row-id="compatibility-snapshot"]')?.dataset.evidenceFilter,
      };
    });
    if (buildSurface.mode !== "studio" || buildSurface.studioTab !== "build" || !buildSurface.bodyHasPanel) failures.push("build surface did not expose the snapshot panel");
    if (buildSurface.snapshotStatus !== "passed" || buildSurface.recordStatus !== "ok" || buildSurface.trustState !== "exportable") failures.push("build snapshot evidence was not exportable");
    if (buildSurface.trustBinding !== "compatibility") failures.push("build Trust Chain snapshot row did not target compatibility evidence");

    await page.locator('[data-action="compile-project"]:visible').first().click();
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.compiledProject), undefined, { timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
    await page.locator('[data-action="export-package"]:visible').first().click();
    const download = await downloadPromise;
    const packagePath = path.join(OUT_DIR, "project-package.zip");
    await download.saveAs(packagePath);
    const zip = await JSZip.loadAsync(fs.readFileSync(packagePath));
    const files = Object.keys(zip.files).filter((file) => !zip.files[file].dir).sort();
    const manifest = JSON.parse(await zip.file("package-manifest.json").async("string"));
    const snapshot = JSON.parse(await zip.file(SNAPSHOT_PATH).async("string"));
    const gateEvidence = JSON.parse(await zip.file(GATE_EVIDENCE_PATH).async("string"));
    const architectureGateEvidence = gateEvidence.results?.find((result) => result.gateId === "architecture-boundaries");
    const packageEvidence = {
      hasSnapshotFile: files.includes(SNAPSHOT_PATH),
      manifestListsSnapshot: manifest.files.some((file) => file.path === SNAPSHOT_PATH && file.required === true),
      schema: snapshot.schemaVersion,
      status: snapshot.status,
      semanticDigest: snapshot.semanticDigest,
      checksum: snapshot.checksum,
      requiredCount: snapshot.summary?.requiredCount,
      passedCount: snapshot.summary?.passedCount,
      artifactCount: snapshot.summary?.artifactCount,
      hasGateEvidenceFile: files.includes(GATE_EVIDENCE_PATH),
      manifestListsGateEvidence: manifest.files.some((file) => file.path === GATE_EVIDENCE_PATH && file.required === true),
      gateEvidenceSchema: gateEvidence.schemaVersion,
      gateEvidenceIntent: architectureGateEvidence?.intent,
      gateEvidenceStatus: architectureGateEvidence?.status,
      gateEvidenceTarget: architectureGateEvidence?.target?.id,
      gateEvidenceDigest: architectureGateEvidence?.digest,
      fileCount: files.length,
    };
    if (!packageEvidence.hasSnapshotFile || !packageEvidence.manifestListsSnapshot) failures.push("project package omitted the required snapshot file");
    if (packageEvidence.schema !== SNAPSHOT_SCHEMA || packageEvidence.status !== "passed") failures.push("project package snapshot schema/status was invalid");
    if (packageEvidence.requiredCount !== 2 || packageEvidence.passedCount !== 2 || packageEvidence.artifactCount !== 8) failures.push("project package snapshot coverage drifted");
    if (!packageEvidence.hasGateEvidenceFile || !packageEvidence.manifestListsGateEvidence) failures.push("project package omitted the required GateEvidence document");
    if (
      packageEvidence.gateEvidenceSchema !== GATE_EVIDENCE_SCHEMA ||
      packageEvidence.gateEvidenceIntent !== "release" ||
      packageEvidence.gateEvidenceStatus !== "passed" ||
      packageEvidence.gateEvidenceTarget !== "test:architecture-boundaries" ||
      !packageEvidence.gateEvidenceDigest
    ) failures.push("project package GateEvidence document was invalid or not release-intent");

    await page.locator('.studio-tab-section [data-studio-tab="evidence"]:visible').first().click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioTab === "evidence");
    const evidenceSurface = await page.evaluate(() => {
      const bridge = window.__MUGEN_WEB_SANDBOX__;
      return {
        bodyHasPanel: document.body.innerText.includes("Compatibility Corpus Snapshot"),
        snapshotStatus: bridge?.studioEvidence?.compatibilitySnapshot?.status,
        hasRecord: bridge?.studioEvidence?.records?.some((record) => record.id === "compat:snapshot" && record.status === "ok"),
        trustRow: bridge?.studioTrustChain?.some((row) => row.id === "compatibility-snapshot"),
      };
    });
    if (!evidenceSurface.bodyHasPanel || evidenceSurface.snapshotStatus !== "passed" || !evidenceSurface.hasRecord || !evidenceSurface.trustRow) failures.push("evidence surface did not expose the promoted snapshot");
    await page.screenshot({ path: path.join(OUT_DIR, "studio-evidence-snapshot.png"), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.baseUrl}/?mode=studio&studio=evidence&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await waitForBridge(page);
    const mobile = await page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyHasPanel: document.body.innerText.includes("Compatibility Corpus Snapshot"),
    }));
    if (mobile.bodyScrollWidth > mobile.clientWidth + 1 || mobile.documentScrollWidth > mobile.clientWidth + 1) failures.push("mobile Evidence surface overflowed horizontally");
    if (!mobile.bodyHasPanel) failures.push("mobile Evidence surface lost the snapshot panel");
    await page.screenshot({ path: path.join(OUT_DIR, "studio-evidence-snapshot-mobile.png"), fullPage: true });

    const diagnostics = {
      generatedAt: new Date().toISOString(),
      baseUrl: server.baseUrl,
      checks: { buildSurface, packageEvidence, evidenceSurface, mobile },
      consoleIssues,
      pageErrors,
      screenshots: {
        desktop: path.join(OUT_DIR, "studio-evidence-snapshot.png"),
        mobile: path.join(OUT_DIR, "studio-evidence-snapshot-mobile.png"),
      },
      packagePath,
      failures,
    };
    fs.writeFileSync(path.join(OUT_DIR, "browser-diagnostics.json"), `${JSON.stringify(diagnostics, null, 2)}\n`);
    if (consoleIssues.length || pageErrors.length) failures.push("browser emitted console/page errors");
    if (failures.length) throw new Error(`Studio compatibility snapshot QA failed:\n${failures.join("\n")}`);
    console.log(JSON.stringify(diagnostics, null, 2));
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    await server.stop();
  }
}

async function startViteServer() {
  const { createServer } = await import("vite");
  const port = await findFreePort(5400);
  const vite = await createServer({ root: process.cwd(), logLevel: "warn", server: { host: "127.0.0.1", port, strictPort: true } });
  await vite.listen();
  return {
    baseUrl: vite.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`,
    stop: () => vite.close(),
  };
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

async function waitForBridge(page) {
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__), undefined, { timeout: 30_000 });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
