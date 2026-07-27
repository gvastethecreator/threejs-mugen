/**
 * DA30-017: browser evidence facts envelope.
 */

export type BrowserEvidenceFacts = {
  route: string;
  queryState: Record<string, string>;
  browser: string;
  browserVersion: string;
  os: string;
  viewport: { width: number; height: number };
  dpr: number;
  input: string;
  commit: string;
  screenshotDigest: string;
  consoleErrors: string[];
  pageErrors: string[];
  focusChecks: string[];
  result: "pass" | "fail";
};

export function validateBrowserEvidenceFacts(f: Partial<BrowserEvidenceFacts>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const need = [
    "route",
    "browser",
    "browserVersion",
    "os",
    "viewport",
    "dpr",
    "input",
    "commit",
    "screenshotDigest",
    "result",
  ] as const;
  for (const k of need) {
    if (f[k] === undefined || f[k] === null || f[k] === "") errors.push(`missing ${k}`);
  }
  if (!Array.isArray(f.consoleErrors)) errors.push("missing consoleErrors");
  if (!Array.isArray(f.pageErrors)) errors.push("missing pageErrors");
  if (!Array.isArray(f.focusChecks)) errors.push("missing focusChecks");
  if (!f.queryState || typeof f.queryState !== "object") errors.push("missing queryState");
  return { ok: errors.length === 0, errors };
}

export function greenRouteFixture(): BrowserEvidenceFacts {
  return {
    route: "/?mode=match",
    queryState: { mode: "match" },
    browser: "chromium",
    browserVersion: "playwright",
    os: "windows",
    viewport: { width: 1440, height: 900 },
    dpr: 1,
    input: "keyboard",
    commit: "fd7a9b9a",
    screenshotDigest: "shot1",
    consoleErrors: [],
    pageErrors: [],
    focusChecks: ["body-focusable"],
    result: "pass",
  };
}

export function forcedErrorRouteFixture(): BrowserEvidenceFacts {
  return {
    ...greenRouteFixture(),
    route: "/?mode=force-error",
    consoleErrors: ["forced test error"],
    result: "fail",
  };
}
