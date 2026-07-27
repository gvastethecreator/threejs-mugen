/**
 * DA30-024/025 helpers: write browser evidence facts for named product routes.
 * Does not run Playwright; produces the fact envelope for a measured or synthetic run.
 */
import {
  type BrowserEvidenceFacts,
  validateBrowserEvidenceFacts,
} from "./BrowserEvidenceFacts";
import type { ProductRoute } from "./ProductRouteInventory";

export type BrowserRouteObservation = {
  route: ProductRoute;
  commit: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  viewport?: { width: number; height: number };
  dpr?: number;
  input?: string;
  screenshotDigest: string;
  consoleErrors?: string[];
  pageErrors?: string[];
  focusChecks?: string[];
  result: "pass" | "fail";
};

export function writeBrowserRouteFacts(obs: BrowserRouteObservation): {
  facts: BrowserEvidenceFacts;
  validation: { ok: boolean; errors: string[] };
} {
  const queryState: Record<string, string> = {};
  try {
    const url = new URL(obs.route.path, "http://local.test");
    url.searchParams.forEach((v, k) => {
      queryState[k] = v;
    });
  } catch {
    queryState.raw = obs.route.path;
  }

  const facts: BrowserEvidenceFacts = {
    route: obs.route.path,
    queryState,
    browser: obs.browser ?? "chromium",
    browserVersion: obs.browserVersion ?? "playwright",
    os: obs.os ?? "windows",
    viewport: obs.viewport ?? { width: 1440, height: 900 },
    dpr: obs.dpr ?? 1,
    input: obs.input ?? "keyboard",
    commit: obs.commit,
    screenshotDigest: obs.screenshotDigest,
    consoleErrors: obs.consoleErrors ?? [],
    pageErrors: obs.pageErrors ?? [],
    focusChecks: obs.focusChecks ?? ["canvas-or-main-focusable"],
    result: obs.result,
  };

  return { facts, validation: validateBrowserEvidenceFacts(facts) };
}

export function forcedRouteErrorFacts(route: ProductRoute, commit: string): BrowserEvidenceFacts {
  return writeBrowserRouteFacts({
    route,
    commit,
    screenshotDigest: "forced-error",
    consoleErrors: ["forced route error"],
    result: "fail",
  }).facts;
}
