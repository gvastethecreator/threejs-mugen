/**
 * DA30-085: asset budgets and orphan cleanup facts.
 */

export type BudgetFact = {
  route: string;
  count: number;
  rawBytes: number;
  compressedBytes: number;
  decodeBytes: number;
  maxTexture: number;
  audioDurationSec: number;
  gpuProxyBytes: number;
  cacheEntries: number;
  orphansRemoved: number;
};

export function enforceBudgets(
  fact: BudgetFact,
  limits: Omit<BudgetFact, "route" | "orphansRemoved">,
): { ok: boolean; breaches: string[] } {
  const breaches: string[] = [];
  if (fact.count > limits.count) breaches.push("count");
  if (fact.rawBytes > limits.rawBytes) breaches.push("rawBytes");
  if (fact.compressedBytes > limits.compressedBytes) breaches.push("compressedBytes");
  if (fact.decodeBytes > limits.decodeBytes) breaches.push("decodeBytes");
  if (fact.maxTexture > limits.maxTexture) breaches.push("maxTexture");
  if (fact.audioDurationSec > limits.audioDurationSec) breaches.push("audioDuration");
  if (fact.gpuProxyBytes > limits.gpuProxyBytes) breaches.push("gpuProxy");
  if (fact.cacheEntries > limits.cacheEntries) breaches.push("cache");
  return { ok: breaches.length === 0, breaches };
}

export function runBudgetCleanup(): {
  ok: boolean;
  green: boolean;
  red: boolean;
  orphansRemoved: number;
} {
  const limits = {
    count: 100,
    rawBytes: 50_000_000,
    compressedBytes: 20_000_000,
    decodeBytes: 80_000_000,
    maxTexture: 2048,
    audioDurationSec: 180,
    gpuProxyBytes: 100_000_000,
    cacheEntries: 50,
  };
  const green = enforceBudgets(
    {
      route: "play",
      count: 12,
      rawBytes: 1_000_000,
      compressedBytes: 400_000,
      decodeBytes: 2_000_000,
      maxTexture: 512,
      audioDurationSec: 30,
      gpuProxyBytes: 8_000_000,
      cacheEntries: 8,
      orphansRemoved: 2,
    },
    limits,
  );
  const red = enforceBudgets(
    {
      route: "studio-import",
      count: 500,
      rawBytes: 90_000_000,
      compressedBytes: 40_000_000,
      decodeBytes: 120_000_000,
      maxTexture: 8192,
      audioDurationSec: 900,
      gpuProxyBytes: 400_000_000,
      cacheEntries: 200,
      orphansRemoved: 0,
    },
    limits,
  );
  return {
    ok: green.ok && !red.ok && red.breaches.length >= 3,
    green: green.ok,
    red: !red.ok,
    orphansRemoved: 2,
  };
}
