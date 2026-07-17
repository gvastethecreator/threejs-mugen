const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const JSZip = require("jszip");
const { chromium } = require("playwright");
const { createServer } = require("vite");

const OUT_DIR = path.resolve(process.cwd(), ".scratch/qa/studio-gate-evidence");
const DIAGNOSTICS_PATH = path.join(OUT_DIR, "browser-diagnostics.json");
const GATE_EVIDENCE_PATH = "studio/gate-evidence.json";
const EVIDENCE_ENVELOPES_PATH = "studio/evidence-envelopes.json";
const GATE_EVIDENCE_SCHEMA = "mugen-web-sandbox/gate-evidence/v0";
const EVIDENCE_ENVELOPES_SCHEMA = "mugen-web-sandbox/studio-evidence-envelope-document/v0";
const ARCHITECTURE_GATE_ID = "architecture-boundaries";
const ARCHITECTURE_EVIDENCE_ID = "test:architecture-boundaries";

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const port = await findFreePort(5600);
  const vite = await createServer({ root: process.cwd(), logLevel: "warn", server: { host: "127.0.0.1", port, strictPort: true } });
  await vite.listen();
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

  const diagnostics = {
    generatedAt: new Date().toISOString(),
    url: `http://127.0.0.1:${port}/?mode=studio&studio=build&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`,
    status: "failed",
    checks: {},
    consoleIssues,
    pageErrors,
    screenshots: {},
    package: {},
    failures: [],
  };

  try {
    await page.goto(diagnostics.url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await waitForBridge(page);
    const build = await inspectSurface(page);
    diagnostics.checks.build = build;
    if (build.mode !== "studio" || build.studioTab !== "build") diagnostics.failures.push("Build surface did not initialize");
    if (build.gateStatus !== "ok" || build.evidenceStatus !== "ok" || build.evidenceCanExport !== true) {
      diagnostics.failures.push("architecture gate evidence was not current and exportable in Build");
    }
    if (!String(build.evidenceDetail ?? "").includes("check_boundaries.cjs")) diagnostics.failures.push("Build evidence did not expose the producer command");
    if (build.trustState !== "exportable" || build.trustFreshness !== "current") diagnostics.failures.push("Trust Chain did not promote current architecture evidence");
    if (!build.bodyHasGateEvidence || !build.bodyHasArchitectureReadiness) diagnostics.failures.push("Build UI did not expose GateEvidence and readiness surfaces");
    if (
      build.envelopeSchema !== EVIDENCE_ENVELOPES_SCHEMA ||
      build.envelopeCount < 1 ||
      build.envelopeCanExport !== true ||
      !build.bodyHasEvidenceEnvelopes
    ) diagnostics.failures.push("Build UI did not expose revision-bound EvidenceEnvelope facts");

    await page.screenshot({ path: path.join(OUT_DIR, "studio-build-gate-evidence.png"), fullPage: true });
    diagnostics.screenshots.desktopBuild = path.join(OUT_DIR, "studio-build-gate-evidence.png");

    await page.locator('[data-action="compile-project"]:visible').first().click();
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__?.compiledProject), undefined, { timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
    await page.locator('[data-action="export-package"]:visible').first().click();
    const download = await downloadPromise;
    const packagePath = path.join(OUT_DIR, "project-package.zip");
    await download.saveAs(packagePath);
    diagnostics.package = await inspectPackage(packagePath);
    diagnostics.packagePath = packagePath;
    if (
      !diagnostics.package.hasGateEvidenceFile ||
      !diagnostics.package.manifestListsGateEvidence ||
      !diagnostics.package.hasEvidenceEnvelopesFile ||
      !diagnostics.package.manifestListsEvidenceEnvelopes ||
      diagnostics.package.envelopeSchema !== EVIDENCE_ENVELOPES_SCHEMA ||
      diagnostics.package.envelopeCount < 1 ||
      diagnostics.package.schema !== GATE_EVIDENCE_SCHEMA ||
      diagnostics.package.intent !== "release" ||
      diagnostics.package.status !== "passed" ||
      diagnostics.package.target !== "test:architecture-boundaries" ||
      diagnostics.package.digest !== build.evidenceDigest
    ) {
      diagnostics.failures.push("exported package GateEvidence did not match the current Build record");
    }

    await page.locator('[data-studio-tab="evidence"]:visible').first().click();
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.studioTab === "evidence");
    const evidence = await inspectSurface(page);
    diagnostics.checks.evidence = evidence;
    if (evidence.studioTab !== "evidence" || evidence.evidenceStatus !== "ok" || evidence.evidenceCanExport !== true) {
      diagnostics.failures.push("Evidence surface did not preserve the GateEvidence result");
    }
    if (evidence.trustFreshness !== "current" || evidence.trustState !== "exportable") diagnostics.failures.push("Evidence Trust Chain lost current architecture freshness");
    if (evidence.envelopeSchema !== EVIDENCE_ENVELOPES_SCHEMA || evidence.envelopeCount < 1 || !evidence.bodyHasEvidenceEnvelopes) {
      diagnostics.failures.push("Evidence surface did not preserve revision-bound EvidenceEnvelope facts");
    }
    await page.screenshot({ path: path.join(OUT_DIR, "studio-evidence-gate-evidence.png"), fullPage: true });
    diagnostics.screenshots.desktopEvidence = path.join(OUT_DIR, "studio-evidence-gate-evidence.png");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(diagnostics.url.replace("studio=build", "studio=evidence"), { waitUntil: "domcontentloaded", timeout: 120_000 });
    await waitForBridge(page);
    const mobile = await page.evaluate(() => ({
      mode: window.__MUGEN_WEB_SANDBOX__?.mode,
      studioTab: window.__MUGEN_WEB_SANDBOX__?.studioTab,
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyHasGateEvidence: document.body.innerText.includes("Architecture Boundaries"),
      bodyHasEvidenceEnvelopes: document.body.innerText.includes("Evidence Envelopes"),
    }));
    diagnostics.checks.mobile = mobile;
    if (mobile.bodyScrollWidth > mobile.clientWidth + 1 || mobile.documentScrollWidth > mobile.clientWidth + 1) diagnostics.failures.push("mobile Evidence surface overflowed horizontally");
    if (mobile.mode !== "studio" || mobile.studioTab !== "evidence" || !mobile.bodyHasGateEvidence || !mobile.bodyHasEvidenceEnvelopes) diagnostics.failures.push("mobile Evidence surface lost the evidence contracts");
    await page.screenshot({ path: path.join(OUT_DIR, "studio-evidence-gate-evidence-mobile.png"), fullPage: true });
    diagnostics.screenshots.mobileEvidence = path.join(OUT_DIR, "studio-evidence-gate-evidence-mobile.png");

    if (consoleIssues.length || pageErrors.length) diagnostics.failures.push("browser emitted console/page errors");
    diagnostics.status = diagnostics.failures.length ? "failed" : "passed";
    fs.writeFileSync(DIAGNOSTICS_PATH, `${JSON.stringify(diagnostics, null, 2)}\n`);
    if (diagnostics.failures.length) throw new Error(`Studio GateEvidence QA failed:\n${diagnostics.failures.join("\n")}`);
    console.log(JSON.stringify({ status: diagnostics.status, checks: diagnostics.checks, package: diagnostics.package, artifact: DIAGNOSTICS_PATH }, null, 2));
  } catch (error) {
    diagnostics.error = String(error);
    diagnostics.status = "failed";
    fs.writeFileSync(DIAGNOSTICS_PATH, `${JSON.stringify(diagnostics, null, 2)}\n`);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    await vite.close();
  }
}

async function inspectSurface(page) {
  return page.evaluate(({ gateId, evidenceId }) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const gate = bridge?.studio?.gates?.find((item) => item.id === gateId);
    const evidence = bridge?.studioEvidence?.records?.find((item) => item.id === evidenceId);
    const trust = bridge?.studioTrustChain?.find((item) => item.id === gateId);
    const readinessRow = [...document.querySelectorAll(".build-readiness-record")].find((row) => row.textContent?.includes("Architecture boundaries"));
    const evidenceDigest = evidence?.evidenceIds?.find((id) => id.startsWith("gate-digest:"))?.slice("gate-digest:".length);
    return {
      mode: bridge?.mode,
      studioTab: bridge?.studioTab,
      gateStatus: gate?.status,
      gateState: gate?.state,
      gateEvidenceIds: gate?.evidenceIds ?? [],
      evidenceStatus: evidence?.status,
      evidenceDetail: evidence?.detail,
      evidenceCanExport: evidence?.canExport,
      evidenceDigest,
      evidenceIds: evidence?.evidenceIds ?? [],
      envelopeSchema: bridge?.studioEvidence?.envelopeDocument?.schemaVersion,
      envelopeCount: bridge?.studioEvidence?.envelopeDocument?.envelopes?.length ?? 0,
      envelopeCanExport: bridge?.studioEvidence?.envelopeAssessment?.canExport,
      trustState: trust?.state,
      trustFreshness: trust?.freshness,
      trustTarget: trust ? `${trust.targetKind}:${trust.targetId}` : undefined,
      bodyHasGateEvidence: document.body.innerText.includes("Architecture Boundaries"),
      bodyHasEvidenceEnvelopes: document.body.innerText.includes("Evidence Envelopes"),
      bodyHasArchitectureReadiness: Boolean(readinessRow),
    };
  }, { gateId: ARCHITECTURE_GATE_ID, evidenceId: ARCHITECTURE_EVIDENCE_ID });
}

async function inspectPackage(packagePath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(packagePath));
  const files = Object.keys(zip.files).filter((file) => !zip.files[file].dir).sort();
  const manifest = JSON.parse(await zip.file("package-manifest.json").async("string"));
  const document = JSON.parse(await zip.file(GATE_EVIDENCE_PATH).async("string"));
  const envelopeDocument = JSON.parse(await zip.file(EVIDENCE_ENVELOPES_PATH).async("string"));
  const result = document.results?.find((item) => item.gateId === ARCHITECTURE_GATE_ID);
  return {
    fileCount: files.length,
    hasGateEvidenceFile: files.includes(GATE_EVIDENCE_PATH),
    manifestListsGateEvidence: manifest.files?.some((file) => file.path === GATE_EVIDENCE_PATH && file.required === true) ?? false,
    hasEvidenceEnvelopesFile: files.includes(EVIDENCE_ENVELOPES_PATH),
    manifestListsEvidenceEnvelopes: manifest.files?.some((file) => file.path === EVIDENCE_ENVELOPES_PATH && file.required === true) ?? false,
    envelopeSchema: envelopeDocument.schemaVersion,
    envelopeCount: envelopeDocument.envelopes?.length ?? 0,
    schema: document.schemaVersion,
    intent: result?.intent,
    status: result?.status,
    target: result?.target?.id,
    digest: result?.digest,
    sourceRevision: result?.sourceRevision,
  };
}

async function waitForBridge(page) {
  await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__), undefined, { timeout: 30_000 });
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
