import { describe, expect, it } from "vitest";
import {
  createBrowserSubcursorDocument,
  parseBrowserSubcursorDocument,
} from "../mugen/compatibility/BrowserSubcursor";

describe("BrowserSubcursor", () => {
  it("creates a deterministic SHA-256 document for bounded routes", () => {
    const first = createBrowserSubcursorDocument({
      generatedAt: "2026-07-26T22:00:00.000Z",
      formalSha: "32466c6e",
      globalSha: "32466c6e",
      visualParentSha: "1085badb",
      productParentSha: "1085badb",
      routes: [
        {
          id: "da27-07-turns-hud",
          taskId: "DA27-07",
          label: "Turns HUD desktop",
          viewports: ["1440x960"],
          consoleErrorCount: 0,
          pageErrorCount: 0,
          reducedMotionCaptured: false,
          focusOrKeyboardNoted: false,
          status: "passed",
          evidence: [
            {
              path: "docs/evidence/da27-07-turns-browser/turns-browser-gate-report-v1.json",
              role: "report",
              sha256: "aa".repeat(32),
              bytes: 10,
            },
          ],
          claimsAllowed: ["turns hud"],
          claimsBlocked: ["full matrix"],
          diagnostics: [],
        },
      ],
    });
    const second = createBrowserSubcursorDocument({
      generatedAt: "2026-07-26T22:00:00.000Z",
      formalSha: "32466c6e",
      globalSha: "32466c6e",
      visualParentSha: "1085badb",
      productParentSha: "1085badb",
      routes: first.routes,
    });
    expect(first.digest.value).toBe(second.digest.value);
    expect(first.digest.value).toMatch(/^[0-9a-f]{64}$/);
    expect(first.status).toBe("passed");
    expect(parseBrowserSubcursorDocument(first).errors).toEqual([]);
  });

  it("fails closed when a route has console errors or no evidence", () => {
    const document = createBrowserSubcursorDocument({
      generatedAt: "2026-07-26T22:00:00.000Z",
      formalSha: "x",
      globalSha: "x",
      visualParentSha: "1085badb",
      productParentSha: "1085badb",
      routes: [
        {
          id: "da27-08-qa-smoke",
          taskId: "DA27-08",
          label: "qa smoke",
          viewports: [],
          consoleErrorCount: 2,
          pageErrorCount: 0,
          reducedMotionCaptured: false,
          focusOrKeyboardNoted: false,
          status: "failed",
          evidence: [],
          claimsAllowed: [],
          claimsBlocked: [],
          diagnostics: ["manual"],
        },
      ],
    });
    expect(document.status).toBe("failed");
    expect(document.diagnostics).toEqual(
      expect.arrayContaining([
        "route-failed:da27-08-qa-smoke",
        "route-no-evidence:da27-08-qa-smoke",
        "route-console:da27-08-qa-smoke",
        "manual",
      ]),
    );
  });
});
