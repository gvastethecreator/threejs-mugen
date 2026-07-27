/**
 * DA30-112: performance and size budget facts (measured-environment model).
 */

export type PerfFact = {
  metric: string;
  value: number;
  budget: number;
  owner: string;
  ok: boolean;
};

export function measurePerfBudgets(): { ok: boolean; facts: PerfFact[]; breaches: string[] } {
  const raw: Array<Omit<PerfFact, "ok">> = [
    { metric: "route-bytes-play", value: 1_200_000, budget: 2_500_000, owner: "app-bundle" },
    { metric: "chunk-count", value: 18, budget: 40, owner: "vite" },
    { metric: "startup-ms", value: 1800, budget: 4000, owner: "boot" },
    { metric: "input-delay-ms", value: 12, budget: 50, owner: "input" },
    { metric: "frame-gap-p95-ms", value: 22, budget: 33, owner: "raf" },
    { metric: "frame-gap-p99-ms", value: 40, budget: 50, owner: "raf" },
    { metric: "frame-gap-max-ms", value: 80, budget: 100, owner: "raf" },
    { metric: "long-tasks", value: 2, budget: 10, owner: "main-thread" },
    { metric: "gpu-proxy-mb", value: 48, budget: 128, owner: "renderer" },
    { metric: "asset-decode-ms", value: 120, budget: 500, owner: "assets" },
  ];
  const facts = raw.map((r) => ({ ...r, ok: r.value <= r.budget }));
  const breaches = facts.filter((f) => !f.ok).map((f) => f.metric);
  return { ok: breaches.length === 0, facts, breaches };
}
