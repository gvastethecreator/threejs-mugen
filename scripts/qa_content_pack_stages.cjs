const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { chromium } = require("playwright");

const STAGES = [
  "rooftop-dojo",
  "patio-dojo-publicidad",
  "terminal-supermercado-24h",
  "azotea-wifi",
];

function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(findFreePort(startPort + 1));
        return;
      }
      reject(error);
    });
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(typeof address === "object" && address ? address.port : startPort));
    });
  });
}

async function startServer() {
  const externalBaseUrl = process.env.QA_BASE_URL?.replace(/\/$/, "");
  if (externalBaseUrl) {
    return { baseUrl: externalBaseUrl, stop: async () => undefined, mode: "external" };
  }
  const { createServer } = await import("vite");
  const port = Number(process.env.QA_PORT ?? (await findFreePort(5300)));
  const vite = await createServer({
    root: process.cwd(),
    logLevel: "warn",
    server: { host: "127.0.0.1", port, strictPort: true },
  });
  await vite.listen();
  return {
    baseUrl: vite.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? `http://127.0.0.1:${port}`,
    stop: () => vite.close(),
    mode: "started-vite",
  };
}

async function checkStage(page, baseUrl, stageId) {
  const url = `${baseUrl}/?mode=match&p1=nova-boxer&p2=mira-volt&stage=${encodeURIComponent(stageId)}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    (expected) => window.__MUGEN_WEB_SANDBOX__?.snapshot?.stage?.id === expected,
    stageId,
    { timeout: 30_000 },
  );
  return page.evaluate(async (expected) => {
    const bridge = window.__MUGEN_WEB_SANDBOX__;
    const stage = bridge?.snapshot?.stage;
    const layers = stage?.layers ?? [];
    const assets = await Promise.all(layers.map(async (layer) => {
      if (!layer.assetUrl) return { id: layer.id, assetUrl: null, ok: false };
      try {
        const response = await fetch(layer.assetUrl, { cache: "no-store" });
        return { id: layer.id, assetUrl: layer.assetUrl, ok: response.ok, status: response.status };
      } catch (error) {
        return { id: layer.id, assetUrl: layer.assetUrl, ok: false, error: String(error?.message ?? error) };
      }
    }));
    const deltaX = layers.map((layer) => layer.deltaX);
    const deltaY = layers.map((layer) => layer.deltaY);
    const sortedDeltaX = [...deltaX].sort((left, right) => left - right);
    const sortedDeltaY = [...deltaY].sort((left, right) => left - right);
    return {
      stageId: stage?.id,
      layerIds: layers.map((layer) => layer.id),
      layerCount: layers.length,
      deltaX,
      deltaY,
      distinctParallax: new Set(deltaX).size === layers.length,
      sortedParallax: JSON.stringify(deltaX) === JSON.stringify(sortedDeltaX),
      distinctVerticalParallax: deltaY.every((value) => Number.isFinite(value)) && new Set(deltaY).size === layers.length,
      sortedVerticalParallax: deltaY.every((value) => Number.isFinite(value)) && JSON.stringify(deltaY) === JSON.stringify(sortedDeltaY),
      assets,
      assetsLoaded: assets.length === layers.length && assets.every((asset) => asset.ok),
      camera: stage?.camera,
      actorCount: bridge?.snapshot?.actors?.length ?? 0,
      mode: bridge?.mode,
      expected,
    };
  }, stageId);
}

async function main() {
  const outPath = path.resolve(process.cwd(), process.env.QA_CONTENT_PACK_OUT ?? ".scratch/qa/content-pack-stages.json");
  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const results = [];
  try {
    for (const stageId of STAGES) {
      const result = await checkStage(page, server.baseUrl, stageId);
      const ok = result.stageId === stageId && result.layerCount === 3 && result.distinctParallax && result.sortedParallax && result.distinctVerticalParallax && result.sortedVerticalParallax && result.assetsLoaded;
      results.push({ ...result, ok });
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  const report = {
    version: 1,
    kind: "content-pack-stage-browser-qa",
    serverMode: server.mode,
    ok: results.length === STAGES.length && results.every((result) => result.ok),
    stages: results,
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
