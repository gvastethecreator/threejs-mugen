/**
 * DA29-003 product/browser matrix (bounded named routes).
 * Captures match + studio workbench at desktop/mobile; records console errors.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da29/browser");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const port = await findFreePort();
  const base = `http://127.0.0.1:${port}`;
  const viteBin = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(port)], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await waitForServer(base, 60_000);
    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
    });
    const results = [];
    for (const shot of [
      { name: "match-desktop", url: "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo", w: 1440, h: 960 },
      { name: "match-mobile", url: "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo", w: 390, h: 844 },
      { name: "studio-workbench-desktop", url: "/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo", w: 1440, h: 960 },
    ]) {
      const context = await browser.newContext({ viewport: { width: shot.w, height: shot.h } });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e.message || e)));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await page.goto(`${base}${shot.url}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForTimeout(3000);
      try {
        await page.waitForSelector(".app-shell, #stage, main", { timeout: 30_000 });
      } catch {
        // still screenshot whatever rendered for diagnostics
      }
      const file = path.join(outDir, `${shot.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      const bytes = fs.readFileSync(file);
      results.push({
        name: shot.name,
        url: shot.url,
        viewport: `${shot.w}x${shot.h}`,
        path: `docs/evidence/da29/browser/${shot.name}.png`,
        bytes: bytes.length,
        sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
        consoleErrors: errors.slice(0, 20),
      });
      await context.close();
    }
    await browser.close();

    const matrix = {
      schema: "Da29ProductBrowserMatrix/v1",
      id: "DA29-003",
      generatedAt: new Date().toISOString(),
      claimCeiling: "named route/view captures only; blocks broad usability until DA29-111…120",
      routes: results.map((r) => ({
        id: r.name,
        viewport: r.viewport,
        path: r.path,
        sha256: r.sha256,
        consoleErrorCount: r.consoleErrors.length,
        status: r.consoleErrors.length === 0 ? "captured" : "captured-with-console-errors",
      })),
      claims: {
        allowed: ["route manifest + screenshots for DA29-003"],
        blocked: ["broad usability", "formal/global tip rewrite"],
      },
    };
    matrix.digest = {
      algorithm: "sha-256",
      value: crypto.createHash("sha256").update(stableStringify(matrix)).digest("hex"),
    };
    const matrixPath = path.join(repoRoot, "docs/evidence/da29/product-browser-matrix-v1.json");
    fs.writeFileSync(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`, "utf8");
    process.stdout.write(
      `${JSON.stringify({ status: "passed", captures: results.length, matrix: "docs/evidence/da29/product-browser-matrix-v1.json" }, null, 2)}\n`,
    );
  } finally {
    child.kill("SIGTERM");
  }
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
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
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server not ready: ${base}`);
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : err}\n`);
  process.exit(1);
});
