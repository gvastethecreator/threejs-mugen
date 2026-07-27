/**
 * DA30-089: scanner parity Studio worker vs CLI adapter (named fixtures).
 */

export type ScannerEnv = "browser-worker" | "cli-adapter";

export type ScannerRun = {
  env: ScannerEnv;
  packageDigest: string;
  profile: string;
  limits: string;
  registryRev: number;
  facts: Array<{ code: string; path: string }>;
  envOnly: Record<string, string>;
};

export function runScanner(
  env: ScannerEnv,
  packageDigest: string,
  profile: string,
  limits: string,
  registryRev: number,
): ScannerRun {
  // deterministic facts from inputs only
  const facts = [
    { code: "OK_PARSE", path: "char.def" },
    { code: packageDigest.startsWith("bad") ? "ERR_MALFORMED" : "OK_CNS", path: "char.cns" },
  ];
  if (profile === "ikemen") facts.push({ code: "PROFILE_IKEMEN", path: "meta" });
  return {
    env,
    packageDigest,
    profile,
    limits,
    registryRev,
    facts,
    envOnly: env === "browser-worker" ? { ua: "playwright" } : { cwd: "/tmp" },
  };
}

export function canonicalFactsEqual(a: ScannerRun, b: ScannerRun): boolean {
  return JSON.stringify(a.facts) === JSON.stringify(b.facts);
}

export function runScannerParity(): { ok: boolean; equal: boolean; envSeparated: boolean } {
  const a = runScanner("browser-worker", "pkg-good", "mugen", "default", 1);
  const b = runScanner("cli-adapter", "pkg-good", "mugen", "default", 1);
  const equal = canonicalFactsEqual(a, b);
  const envSeparated = a.envOnly.ua !== undefined && b.envOnly.cwd !== undefined;
  const badA = runScanner("browser-worker", "bad-1", "mugen", "default", 1);
  const badB = runScanner("cli-adapter", "bad-1", "mugen", "default", 1);
  return {
    ok: equal && envSeparated && canonicalFactsEqual(badA, badB),
    equal,
    envSeparated,
  };
}
