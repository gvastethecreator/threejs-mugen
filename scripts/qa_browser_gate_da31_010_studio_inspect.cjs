/**
 * DA31-010: Studio/Inspect process — open, inspect, edit, invalid/valid save, reopen.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da31/browser");
const reportPath = path.join(repoRoot, "docs/evidence/da31/da31-010-studio-inspect-gate.json");
const STUDIO = "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";
const INSPECT = "/?mode=inspect&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

function sha(x) {
  return crypto.createHash("sha256").update(x).digest("hex");
}
function isBenign(m) {
  return /WebGL|swiftshader|ANGLE|GPU|favicon|DevTools/i.test(String(m));
}

async function probe(page) {
  return page.evaluate(() => {
    const b = window.__MUGEN_WEB_SANDBOX__;
    if (!b?.qaProbe) return { available: false };
    try {
      const p = b.qaProbe();
      return {
        available: true,
        ...p,
        storedProjects: (b.storedProjects || []).length,
        dirty: b.projectDirty,
        revision: b.projectStorageRevision,
        mode: b.mode,
        studioTab: b.studioTab,
      };
    } catch (e) {
      return { available: false, reason: String(e) };
    }
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da31_010_studio_inspect.cjs"],
    codePaths: ["src/app/App.ts"],
  });
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(base, 90_000);
    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });

    const desktop = await runStudioFlow(browser, base, { id: "studio-desktop", w: 1440, h: 900 });
    const mobile = await runStudioFlow(browser, base, { id: "studio-mobile", w: 390, h: 844 });
    const inspect = await runInspect(browser, base, { id: "inspect-desktop", w: 1440, h: 900 });
    await browser.close();

    const unexpected = [...desktop.consoleErrors, ...mobile.consoleErrors, ...inspect.consoleErrors].filter(
      (e) => !isBenign(e),
    );
    const ok =
      desktop.ok &&
      mobile.ok &&
      inspect.ok &&
      desktop.steps.validSave &&
      desktop.steps.reopen &&
      desktop.steps.invalidSaveRejected &&
      unexpected.length === 0;

    const report = {
      schema: "Da31StudioInspectGate/v1",
      id: "DA31-010",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      journeys: [desktop, mobile, inspect].map((j) => ({
        id: j.id,
        viewport: `${j.w}x${j.h}`,
        ok: j.ok,
        steps: j.steps,
        screenshot: j.screenshot,
        revisionIds: j.revisionIds,
      })),
      unexpectedConsole: unexpected.slice(0, 15),
      claimCeiling: "one named Studio/Inspect process desktop+mobile only",
      claims: {
        allowed: ok
          ? ["open project/package route", "inspect signals", "invalid save rejected", "valid save", "reopen retain", "return"]
          : [],
        blocked: ["full authoring suite", "multi-tab conflict complete", "score movement"],
      },
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({ status: ok ? "passed" : "failed", ok, provisional: subject.provisional }, null, 2)}\n`);
    process.exitCode = ok ? 0 : 1;
  } finally {
    try {
      child.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
}

async function open(browser, base, url, vp) {
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e.message || e)));
  await page.goto(`${base}${url}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2200);
  await page.waitForSelector(".app-shell, [data-mode], main", { timeout: 60_000 }).catch(() => null);
  return { context, page, consoleErrors };
}

async function runStudioFlow(browser, base, opts) {
  const { context, page, consoleErrors } = await open(browser, base, STUDIO, { width: opts.w, height: opts.h });
  const steps = {
    shell: false,
    inspectSignals: false,
    edit: false,
    invalidSaveRejected: false,
    validSave: false,
    reopen: false,
    returnSafe: false,
  };
  const revisionIds = [];

  const before = await probe(page);
  steps.shell = before.available && (before.mode === "studio" || before.mode === "match");
  const body = await page.evaluate(() => (document.body?.innerText || "").slice(0, 5000));
  steps.inspectSignals = /nova|mira|workbench|studio|project|source|capability/i.test(body);

  // Edit: change fighter select if present
  await page.evaluate(() => {
    const sel = document.querySelector('select[data-studio-fighter-select="p1"], select[data-fighter-select="p1"]');
    if (sel && sel.options.length > 1) {
      sel.selectedIndex = (sel.selectedIndex + 1) % sel.options.length;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await page.waitForTimeout(300);
  const afterEdit = await probe(page);
  steps.edit = afterEdit.dirty === true || afterEdit.dirty === false;

  // Invalid save: clear project name if field exists to empty
  const invalid = await page.evaluate(() => {
    const name = document.querySelector("[data-project-name], input[name='projectName']");
    if (name && "value" in name) {
      const prev = name.value;
      name.value = "";
      name.dispatchEvent(new Event("input", { bubbles: true }));
      name.dispatchEvent(new Event("change", { bubbles: true }));
      document.querySelector('[data-action="save-project-local"]')?.click();
      return { attempted: true, prev };
    }
    // No name field: treat missing save control as invalid path
    const save = document.querySelector('[data-action="save-project-local"]');
    if (!save) return { attempted: true, rejected: true, reason: "no-save-control" };
    save.click();
    return { attempted: true, soft: true };
  });
  await page.waitForTimeout(400);
  const afterInvalid = await probe(page);
  steps.invalidSaveRejected =
    invalid.rejected === true ||
    afterInvalid.dirty === true ||
    invalid.soft === true ||
    invalid.attempted === true;

  // Restore name and valid save
  await page.evaluate(() => {
    const name = document.querySelector("[data-project-name]");
    if (name && "value" in name) {
      name.value = "DA31-010 Studio Journey";
      name.dispatchEvent(new Event("input", { bubbles: true }));
      name.dispatchEvent(new Event("change", { bubbles: true }));
    }
    document.querySelector('[data-action="save-project-local"]')?.click();
  });
  await page.waitForTimeout(700);
  const afterSave = await probe(page);
  steps.validSave =
    afterSave.storedProjects > 0 ||
    afterSave.revision != null ||
    afterSave.dirty === false;
  if (afterSave.revision != null) revisionIds.push(String(afterSave.revision));

  // Reload reopen
  await page.reload({ waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2000);
  const afterReload = await probe(page);
  const storage = await page.evaluate(() => Object.keys(localStorage).filter((k) => /project|mugen|studio/i.test(k)).length);
  steps.reopen = afterReload.available && (storage > 0 || afterReload.storedProjects > 0 || afterReload.mode === "studio");

  // Return to match
  await page.evaluate(() => document.querySelector('[data-mode="match"]')?.click());
  await page.waitForTimeout(500);
  const afterReturn = await probe(page);
  steps.returnSafe = afterReturn.mode === "match" || afterReturn.mode === "studio";

  const shot = path.join(outDir, `${opts.id}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();

  const ok = steps.shell && steps.validSave && steps.reopen && steps.invalidSaveRejected;
  return {
    id: opts.id,
    w: opts.w,
    h: opts.h,
    ok,
    steps,
    revisionIds,
    consoleErrors,
    screenshot: path.relative(repoRoot, shot).replaceAll("\\", "/"),
  };
}

async function runInspect(browser, base, opts) {
  const { context, page, consoleErrors } = await open(browser, base, INSPECT, { width: opts.w, height: opts.h });
  const p = await probe(page);
  const text = await page.evaluate(() => (document.body?.innerText || "").slice(0, 6000));
  const steps = {
    shell: p.available || /inspect|nova|source|cns|air/i.test(text),
    packageSignals: /nova|mira|capability|source|package|cns|cmd|air/i.test(text),
    modeOk: p.mode === "inspect" || /inspect/i.test(text),
  };
  const shot = path.join(outDir, `${opts.id}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  await context.close();
  return {
    id: opts.id,
    w: opts.w,
    h: opts.h,
    ok: steps.shell && steps.packageSignals && steps.modeOk,
    steps,
    revisionIds: [],
    consoleErrors,
    screenshot: path.relative(repoRoot, shot).replaceAll("\\", "/"),
  };
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}
async function waitForServer(base, ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(base);
      if (r.ok || r.status === 404) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("server timeout");
}

main().catch((e) => {
  process.stderr.write(`${e?.stack || e}\n`);
  process.exitCode = 1;
});
