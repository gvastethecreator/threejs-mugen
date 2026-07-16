const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { createServer } = require("vite");
const net = require("node:net");

const OUT_DIR = path.resolve(process.cwd(), ".scratch/qa/studio-project-reopen");
const DIAGNOSTICS_PATH = path.join(OUT_DIR, "browser-diagnostics.json");

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const port = await findFreePort(5500);
  const vite = await createServer({ root: process.cwd(), logLevel: "warn", server: { host: "127.0.0.1", port, strictPort: true } });
  await vite.listen();
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const url = `http://127.0.0.1:${port}/?mode=studio&studio=workbench&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo`;
  const diagnostics = { generatedAt: new Date().toISOString(), url, status: "failed", checks: {} };
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__));
    await editProject(page);
    const beforeReload = await inspect(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__MUGEN_WEB_SANDBOX__));
    await page.waitForTimeout(250);
    const afterReload = await inspect(page);
    const row = page.locator('[data-stored-project-id="qa-authored-fight-project"]').first();
    const rowCount = await row.count();
    if (!rowCount) throw new Error("stored project row was not rendered after reload");
    await row.evaluate((element) => element.click());
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.project?.name === "QA Authored Fight Project",
      undefined,
      { timeout: 15_000 },
    );
    const afterOpen = await inspect(page);
    if (afterOpen.project?.name !== "QA Authored Fight Project" || afterOpen.project?.entry?.stage !== "training-grid") {
      throw new Error("stored project did not reopen its saved name and stage");
    }
    diagnostics.checks = { beforeReload, afterReload, rowCount, afterOpen };
    diagnostics.status = "passed";
    fs.writeFileSync(DIAGNOSTICS_PATH, `${JSON.stringify(diagnostics, null, 2)}\n`);
    console.log(JSON.stringify({ status: diagnostics.status, checks: diagnostics.checks, artifact: DIAGNOSTICS_PATH }, null, 2));
  } catch (error) {
    diagnostics.error = String(error);
    fs.writeFileSync(DIAGNOSTICS_PATH, `${JSON.stringify(diagnostics, null, 2)}\n`);
    throw error;
  } finally {
    await page.close();
    await browser.close();
    await vite.close();
  }
}

async function editProject(page) {
  const select = async (selector, value) => {
    await page.locator(selector).evaluate((element, next) => {
      element.value = next;
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
    await page.waitForTimeout(50);
  };
  await page.locator("[data-project-name]").fill("QA Authored Fight Project");
  await page.locator("[data-project-name]").press("Tab");
  await select('[data-studio-fighter-select="p1"]', "rook-apprentice");
  await select('[data-studio-fighter-select="p2"]', "nova-boxer");
  await select('[data-studio-stage-select]', "training-grid");
  await page.waitForTimeout(1900);
  await page.locator('[data-action="save-project-local"]').first().click();
  await page.waitForTimeout(200);
}

async function inspect(page) {
  return page.evaluate(() => ({
    project: {
      id: window.__MUGEN_WEB_SANDBOX__?.project?.id,
      name: window.__MUGEN_WEB_SANDBOX__?.project?.name,
      entry: window.__MUGEN_WEB_SANDBOX__?.project?.entry,
    },
    dirty: window.__MUGEN_WEB_SANDBOX__?.projectDirty,
    storedRows: [...document.querySelectorAll("[data-stored-project-id]")].map((element) => ({
      id: element.dataset.storedProjectId,
      text: element.textContent?.trim().slice(0, 120),
    })),
    storedEntries: (() => {
      const raw = localStorage.getItem("mugen-web-sandbox:projects:v0");
      const entries = raw ? JSON.parse(raw).entries ?? [] : [];
      return entries.map((entry) => ({ id: entry.id, name: entry.name, stage: entry.manifest?.entry?.stage }));
    })(),
  }));
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
