/**
 * DA30-025: Studio and Inspect browser journeys (desktop + mobile where useful).
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn, execSync } = require("node:child_process");
const net = require("node:net");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da30/browser");
const reportPath = path.join(repoRoot, "docs/evidence/da30/da30-025-studio-inspect-browser-gate.json");

const ROUTES = [
  {
    id: "studio-workbench-desktop",
    url: "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo",
    w: 1440,
    h: 900,
    expectMode: "studio",
  },
  {
    id: "studio-workbench-mobile",
    url: "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo",
    w: 390,
    h: 844,
    expectMode: "studio",
  },
  {
    id: "inspect-desktop",
    url: "/?mode=inspect&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo",
    w: 1440,
    h: 900,
    expectMode: "inspect",
  },
];

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function headSha() {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function isBenignConsole(msg) {
  const s = String(msg);
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(s);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const head = headSha();

  try {
    await waitForServer(base, 90_000);
    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });

    const journeys = [];
    for (const route of ROUTES) {
      journeys.push(await runRoute(browser, base, route));
    }
    await browser.close();

    const unexpected = journeys.flatMap((j) =>
      j.consoleErrors
        .filter((e) => !isBenignConsole(e))
        .map((e) => ({ journey: j.id, message: e })),
    ).concat(
      journeys.flatMap((j) => j.pageErrors.map((e) => ({ journey: j.id, message: e }))),
    );

    const ok =
      journeys.every((j) => j.shellFound && j.modeOk && j.screenshotBytes > 1000) && unexpected.length === 0;

    const report = {
      schema: "Da30StudioInspectBrowserGate/v1",
      id: "DA30-025",
      generatedAt: new Date().toISOString(),
      headSha: head,
      ok,
      journeys: journeys.map((j) => ({
        id: j.id,
        url: j.url,
        viewport: `${j.w}x${j.h}`,
        screenshot: j.screenshotRel,
        screenshotSha256: j.screenshotSha256,
        shellFound: j.shellFound,
        modeOk: j.modeOk,
        dataMode: j.dataMode,
        hasSourceOrCapabilityText: j.hasSourceOrCapabilityText,
        saveAttempt: j.saveAttempt,
        focusChecks: j.focusChecks,
        consoleErrorCount: j.consoleErrors.length,
        pageErrorCount: j.pageErrors.length,
        unexpectedConsole: j.consoleErrors.filter((e) => !isBenignConsole(e)),
      })),
      unexpectedErrors: unexpected,
      claimCeiling: "named Studio workbench + Inspect routes only",
      claims: {
        allowed: ok ? ["Studio/Inspect load, shell, mode attribute, capture at measured SHA"] : [],
        blocked: ["full authoring fidelity", "transactional save product claim", "score movement"],
      },
    };
    report.digest = {
      algorithm: "sha-256",
      value: sha256(JSON.stringify({ ...report, digest: undefined })),
    };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(
      `${JSON.stringify({ status: ok ? "passed" : "failed", output: "docs/evidence/da30/da30-025-studio-inspect-browser-gate.json", ok, unexpected: unexpected.length }, null, 2)}\n`,
    );
    process.exitCode = ok ? 0 : 1;
  } finally {
    try {
      child.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
}

async function runRoute(browser, base, route) {
  const context = await browser.newContext({ viewport: { width: route.w, height: route.h } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e.message || e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`${base}${route.url}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2500);

  let shellFound = false;
  try {
    await page.waitForSelector(".app-shell, main, [data-mode]", { timeout: 45_000 });
    shellFound = true;
  } catch {
    shellFound = false;
  }

  const state = await page.evaluate((expectMode) => {
    const mode = document.querySelector("[data-mode]")?.getAttribute("data-mode") || "";
    const text = (document.body?.innerText || "").slice(0, 5000);
    const active = document.activeElement;
    return {
      dataMode: mode,
      modeOk: mode === expectMode || text.toLowerCase().includes(expectMode),
      hasSourceOrCapabilityText: /source|capability|inspect|workbench|studio|character|cns|air|cmd/i.test(text),
      focus: active ? active.tagName.toLowerCase() : "none",
    };
  }, route.expectMode);

  // Best-effort save / invalid save probes (do not fail if controls absent)
  const saveAttempt = await page.evaluate(async () => {
    const buttons = [...document.querySelectorAll("button")].map((b) => (b.textContent || "").trim().toLowerCase());
    const saveBtn = [...document.querySelectorAll("button")].find((b) =>
      /save|export|write/i.test(b.textContent || ""),
    );
    if (!saveBtn) return { attempted: false, labels: buttons.slice(0, 12) };
    try {
      saveBtn.click();
      return { attempted: true, labels: buttons.slice(0, 12), clicked: (saveBtn.textContent || "").trim() };
    } catch (e) {
      return { attempted: true, error: String(e), labels: buttons.slice(0, 12) };
    }
  });
  await page.waitForTimeout(400);

  const shotName = `${route.id}.png`;
  const shotAbs = path.join(outDir, shotName);
  await page.screenshot({ path: shotAbs, fullPage: false });
  const buf = fs.readFileSync(shotAbs);
  await context.close();

  return {
    id: route.id,
    url: route.url,
    w: route.w,
    h: route.h,
    shellFound,
    modeOk: state.modeOk,
    dataMode: state.dataMode,
    hasSourceOrCapabilityText: state.hasSourceOrCapabilityText,
    saveAttempt,
    focusChecks: [`active=${state.focus}`, `mode=${state.dataMode}`],
    consoleErrors: consoleErrors.slice(0, 30),
    pageErrors: pageErrors.slice(0, 30),
    screenshotRel: `docs/evidence/da30/browser/${shotName}`,
    screenshotSha256: sha256(buf),
    screenshotBytes: buf.length,
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

async function waitForServer(base, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(base);
      if (res.ok || res.status === 404) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`server not ready: ${base}`);
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : err}\n`);
  process.exitCode = 1;
});
