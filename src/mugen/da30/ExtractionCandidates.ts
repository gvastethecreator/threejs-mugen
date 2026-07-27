/**
 * DA30-102: extraction candidates ranking for two-consumer ports.
 */

export type PortCandidate = {
  port: string;
  coupling: number;
  stability: number;
  migrationRisk: number;
  consumerNeed: number;
  score: number;
  note: string;
};

export function rankExtractionCandidates(): {
  schema: "Da30ExtractionCandidates/v1";
  ranked: PortCandidate[];
  combatRemainsMugenOwned: true;
  ok: boolean;
} {
  const raw = [
    { port: "clock", coupling: 2, stability: 9, migrationRisk: 2, consumerNeed: 9, note: "shared tick" },
    { port: "input", coupling: 3, stability: 8, migrationRisk: 3, consumerNeed: 9, note: "seat bindings" },
    { port: "renderer", coupling: 5, stability: 6, migrationRisk: 5, consumerNeed: 8, note: "lifecycle" },
    { port: "storage", coupling: 4, stability: 7, migrationRisk: 4, consumerNeed: 7, note: "revision" },
    { port: "evidence", coupling: 3, stability: 8, migrationRisk: 3, consumerNeed: 6, note: "facts" },
    { port: "asset", coupling: 6, stability: 5, migrationRisk: 6, consumerNeed: 7, note: "decode" },
    { port: "worker", coupling: 7, stability: 5, migrationRisk: 7, consumerNeed: 5, note: "scanner" },
    { port: "lifecycle", coupling: 4, stability: 7, migrationRisk: 4, consumerNeed: 8, note: "mount/teardown" },
  ];
  const ranked = raw
    .map((r) => ({
      ...r,
      score: r.stability + r.consumerNeed - r.coupling - r.migrationRisk,
    }))
    .sort((a, b) => b.score - a.score);
  return {
    schema: "Da30ExtractionCandidates/v1",
    ranked,
    combatRemainsMugenOwned: true,
    ok: ranked.length === 8 && ranked[0]!.port === "clock",
  };
}
