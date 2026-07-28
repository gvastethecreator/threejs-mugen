/**
 * DA32-010: virtual browser Gamepad API lifecycle and visible runtime status.
 * This gate covers injected browser devices only; it does not claim hardware parity.
 */
const { chromium } = require("playwright");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");
const { buildSubjectEnvelope } = require("./lib_gate_subject.cjs");

const repoRoot = path.resolve(process.cwd());
const outDir = path.join(repoRoot, "docs/evidence/da32/browser");
const reportPath = path.join(repoRoot, "docs/evidence/da32/da32-010-gamepad-browser-gate.json");
const runtimeRoute = "/?mode=match&p1=nova-boxer&p2=mira-volt&stage=rooftop-dojo";

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isBenign(message) {
  return /WebGL|swiftshader|ANGLE|GPU process|DevTools|favicon/i.test(String(message));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const subject = buildSubjectEnvelope(repoRoot, {
    probePaths: ["scripts/qa_browser_gate_da32_010_gamepad.cjs", "src/mugen/da32/GamepadDeviceLab.ts"],
    codePaths: ["src/game/input/GamepadInputAdapter.ts", "src/app/App.ts", "src/game/input/KeyboardInputAdapter.ts"],
  });
  const port = await findFreePort();
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
      await runViewport(browser, base, { id: "desktop", width: 1440, height: 900 }),
      await runViewport(browser, base, { id: "mobile", width: 390, height: 844 }),
    ];
    await browser.close();
    browser = undefined;

    const unexpectedConsole = cases.flatMap((item) => item.consoleErrors.filter((message) => !isBenign(message)));
    const ok = cases.every((item) => item.ok) && unexpectedConsole.length === 0;
    const report = {
      schema: "Da32GamepadBrowserGate/v1",
      id: "DA32-010",
      generatedAt: new Date().toISOString(),
      subject,
      headSha: subject.subjectSha,
      ok,
      route: runtimeRoute,
      cases,
      unexpectedConsole,
      claimCeiling: subject.provisional
        ? "provisional virtual browser gamepad lifecycle observations for named viewports"
        : "virtual browser gamepad lifecycle, keyboard fallback, and visible status at named viewports",
      claims: {
        allowed: ok
          ? [
              "browser gamepadconnected and gamepaddisconnected events reach the runtime adapter",
              "standard and non-standard mappings remain visible per seat",
              "held virtual input maps to a runtime action and clears after disconnect",
              "keyboard input remains usable while a gamepad seat is disconnected",
              "reconnect with a changed device index refreshes the seat diagnostic",
              "the named route has no horizontal overflow or unexpected page errors",
            ]
          : [],
        blocked: ["physical gamepad hardware", "all browser implementations", "screen-reader and contrast certification"],
      },
    };
    report.digest = { algorithm: "sha-256", value: sha(JSON.stringify({ ...report, digest: undefined })) };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(
      `${JSON.stringify(
        {
          status: ok ? "passed" : "failed",
          ok,
          provisional: subject.provisional,
          viewports: cases.map((item) => ({ id: item.id, ok: item.ok })),
          unexpectedConsole: unexpectedConsole.length,
        },
        null,
        2,
      )}\n`,
    );
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

async function runViewport(browser, base, options) {
  const context = await browser.newContext({ viewport: { width: options.width, height: options.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.setDefaultNavigationTimeout(120_000);
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error?.message || error)));

  try {
    await page.addInitScript(() => {
      const pads = [null, null];
      const createPad = ({ index = 0, id = "Virtual Standard Pad", mapping = "standard", pressedButtons = [] } = {}) => {
        const pressed = new Set(pressedButtons);
        return {
          index,
          id,
          mapping,
          connected: true,
          axes: [0, 0, 0, 0],
          buttons: Array.from({ length: 16 }, (_, buttonIndex) => {
            const active = pressed.has(buttonIndex);
            return { pressed: active, touched: active, value: active ? 1 : 0 };
          }),
          timestamp: performance.now(),
        };
      };
      const dispatch = (type, gamepad) => {
        const event = new Event(type);
        Object.defineProperty(event, "gamepad", { configurable: false, value: gamepad });
        window.dispatchEvent(event);
      };
      Object.defineProperty(Navigator.prototype, "getGamepads", {
        configurable: true,
        value: () => pads.slice(),
      });
      Object.defineProperty(window, "__DA32_GAMEPAD__", {
        configurable: true,
        value: {
          createPad,
          setPad: (slot, gamepad) => {
            pads[slot] = gamepad;
          },
          clearPad: (slot) => {
            pads[slot] = null;
          },
          dispatch,
        },
      });
    });
    await page.goto(`${base}${runtimeRoute}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => Boolean(window.__MUGEN_WEB_SANDBOX__?.qaProbe && window.__MUGEN_WEB_SANDBOX__?.gamepad),
      null,
      { timeout: 60_000 },
    );
    await page.waitForFunction(
      () => window.__MUGEN_WEB_SANDBOX__?.gamepad?.diagnostics?.connectedCount === 0,
      null,
      { timeout: 10_000 },
    );

    const p1 = await createAndConnect(page, {
      slot: 0,
      index: 0,
      id: "Virtual Standard Pad",
      mapping: "standard",
      pressedButtons: [0],
    });
    await page.waitForFunction(
      () => {
        const gamepad = window.__MUGEN_WEB_SANDBOX__?.gamepad;
        const seat = gamepad?.diagnostics?.seats?.[0];
        return seat?.connected === true && seat.mapping === "standard" && seat.actions.includes("a") &&
          gamepad.events?.some((event) => event.type === "connected" && event.index === 0);
      },
      null,
      { timeout: 15_000 },
    );
    const held = await readGamepadState(page);

    const p2 = await createAndConnect(page, {
      slot: 1,
      index: 7,
      id: "Virtual Legacy Pad",
      mapping: "",
      pressedButtons: [],
    });
    await page.waitForFunction(
      () => {
        const seats = window.__MUGEN_WEB_SANDBOX__?.gamepad?.diagnostics?.seats ?? [];
        return seats[0]?.connected === true && seats[1]?.connected === true && seats[1]?.mapping === "non-standard";
      },
      null,
      { timeout: 15_000 },
    );
    await page.waitForFunction(
      () => document.querySelector(".stage-status-metric")?.closest(".stage-status-card")?.textContent?.includes("P1 std / P2 map") === true,
      null,
      { timeout: 15_000 },
    );
    const twoSeatState = await readGamepadState(page);
    const p1Disconnected = await disconnect(page, 0, p1);
    await page.waitForFunction(
      () => {
        const seat = window.__MUGEN_WEB_SANDBOX__?.gamepad?.diagnostics?.seats?.[0];
        return seat?.connected === false && seat.mapping === "disconnected" && seat.actions.length === 0 &&
          window.__MUGEN_WEB_SANDBOX__?.gamepad?.events?.some((event) => event.type === "disconnected" && event.index === 0);
      },
      null,
      { timeout: 15_000 },
    );
    const afterDisconnect = await readGamepadState(page);

    await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === false, null, { timeout: 5_000 });
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", bubbles: true })));
    let keyboardFallback = false;
    try {
      await page.locator('[data-action="step"]').first().evaluate((button) => button.click());
      try {
        await page.waitForFunction(
          () => {
            return window.__MUGEN_WEB_SANDBOX__?.keyboard?.includes("a") === true;
          },
          null,
          { timeout: 10_000 },
        );
      } catch (error) {
        const debug = await page.evaluate(() => {
          const actor = window.__MUGEN_WEB_SANDBOX__?.snapshot?.actors?.find((candidate) => candidate.id === "p1");
          return {
            playing: window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing,
            tick: window.__MUGEN_WEB_SANDBOX__?.snapshot?.tick,
            input: window.__MUGEN_WEB_SANDBOX__?.keyboard ?? [],
            stateNo: actor?.runtime?.stateNo,
          };
        });
        throw new Error(`keyboard fallback timeout: ${JSON.stringify(debug)}; ${error.message}`);
      }
      keyboardFallback = true;
    } finally {
      await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "z", bubbles: true })));
    }
    await page.locator('[data-action="play-pause"]').first().evaluate((button) => button.click());
    await page.waitForFunction(() => window.__MUGEN_WEB_SANDBOX__?.snapshot?.playing === true, null, { timeout: 5_000 });

    const reconnect = await createAndConnect(page, {
      slot: 4,
      index: 4,
      id: "Virtual Standard Pad",
      mapping: "standard",
      pressedButtons: [1],
    });
    await page.waitForFunction(
      () => {
        const gamepad = window.__MUGEN_WEB_SANDBOX__?.gamepad;
        const seat = gamepad?.diagnostics?.seats?.[0];
        return seat?.connected === true && seat.index === 4 && seat.id === "Virtual Standard Pad" &&
          seat.actions.includes("b") && gamepad.events?.some((event) => event.type === "connected" && event.index === 4);
      },
      null,
      { timeout: 15_000 },
    );
    await page.waitForFunction(
      () => [...document.querySelectorAll(".stage-status-card")].some((card) => card.textContent?.includes("P1 std / P2 map")),
      null,
      { timeout: 15_000 },
    );
    const finalState = await readGamepadState(page);

    const statusText = await page.locator(".stage-status-card").first().innerText();
    const summaryText = await page.locator("#runtime-a11y-summary").innerText();
    const viewport = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    const semantic = {
      connectEvent: held.events.some((event) => event.type === "connected" && event.index === 0),
      heldButtonMapsToAction: held.diagnostics.seats[0]?.actions.includes("a") === true,
      twoSeatBinding: twoSeatState.diagnostics.connectedCount === 2,
      nonStandardMappingVisible: twoSeatState.diagnostics.seats[1]?.mapping === "non-standard" && statusText.includes("P2 map"),
      disconnectClearsActions: afterDisconnect.diagnostics.seats[0]?.connected === false && afterDisconnect.diagnostics.seats[0]?.actions.length === 0,
      disconnectEvent: afterDisconnect.events.some((event) => event.type === "disconnected" && event.index === 0),
      keyboardFallback,
      reconnectChangedIndex: finalState.diagnostics.seats[0]?.index === 4 && finalState.diagnostics.seats[0]?.actions.includes("b") === true,
      reconnectEvent: finalState.events.some((event) => event.type === "connected" && event.index === 4),
      visibleSeatStatus: statusText.includes("Pads") && statusText.includes("P1 std / P2 map"),
      liveSummary: summaryText.includes("standard gamepad") && summaryText.includes("non-standard gamepad"),
      noHorizontalOverflow: viewport.scrollWidth <= viewport.innerWidth + 1,
    };
    const screenshot = path.join(outDir, `da32-010-gamepad-${options.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    return {
      id: options.id,
      viewport: `${options.width}x${options.height}`,
      ok: Object.values(semantic).every(Boolean),
      semantic,
      journey: { held, twoSeatState, p1Disconnected, afterDisconnect, reconnect, finalState },
      statusText,
      summaryText,
      viewportState: viewport,
      screenshot: path.relative(repoRoot, screenshot).replaceAll("\\", "/"),
      consoleErrors,
    };
  } finally {
    await context.close();
  }
}

async function createAndConnect(page, input) {
  return page.evaluate((input) => {
    const api = window.__DA32_GAMEPAD__;
    const pad = api.createPad(input);
    api.setPad(input.slot, pad);
    api.dispatch("gamepadconnected", pad);
    return pad;
  }, input);
}

async function disconnect(page, slot, pad) {
  return page.evaluate(
    ({ slot, pad }) => {
      const api = window.__DA32_GAMEPAD__;
      api.clearPad(slot);
      api.dispatch("gamepaddisconnected", pad);
      return window.__MUGEN_WEB_SANDBOX__?.gamepad;
    },
    { slot, pad },
  );
}

async function readGamepadState(page) {
  return page.evaluate(() => {
    const gamepad = window.__MUGEN_WEB_SANDBOX__?.gamepad;
    return {
      diagnostics: gamepad?.diagnostics,
      events: gamepad?.events ?? [],
    };
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(base, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base);
      if (response.ok || response.status === 404) return;
    } catch {
      /* retry until Vite is ready */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Vite server timeout after ${timeoutMs}ms`);
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exitCode = 1;
});
