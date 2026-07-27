/**
 * DA30-022: warning and flaky-test policy validation.
 */

export type WarningLane = {
  lane: string;
  fatal: boolean;
  owner: string;
  quarantine: boolean;
  retry: number;
  expiryDays?: number;
};

export type WarningPolicy = {
  schema: "Da30WarningPolicy/v1";
  id: "DA30-022";
  lanes: WarningLane[];
  claimCeiling: string;
};

const REQUIRED_LANES = [
  "compiler",
  "test",
  "build",
  "browser",
  "WebGL",
  "accessibility",
  "deprecation",
] as const;

export function validateWarningPolicy(doc: Partial<WarningPolicy>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (doc.schema !== "Da30WarningPolicy/v1") errors.push("bad schema");
  if (doc.id !== "DA30-022") errors.push("bad id");
  if (!Array.isArray(doc.lanes)) {
    errors.push("missing lanes");
    return { ok: false, errors };
  }
  const names = new Set(doc.lanes.map((l) => l.lane));
  for (const need of REQUIRED_LANES) {
    if (!names.has(need)) errors.push(`missing lane ${need}`);
  }
  for (const lane of doc.lanes) {
    if (!lane.owner?.trim()) errors.push(`${lane.lane}: missing owner`);
    if (typeof lane.fatal !== "boolean") errors.push(`${lane.lane}: fatal must be boolean`);
    if (typeof lane.retry !== "number" || lane.retry < 0) errors.push(`${lane.lane}: bad retry`);
    if (lane.quarantine && lane.fatal && lane.retry > 2) {
      errors.push(`${lane.lane}: fatal quarantine retry cap is 2`);
    }
    if (lane.quarantine && lane.expiryDays !== undefined && lane.expiryDays <= 0) {
      errors.push(`${lane.lane}: quarantine expiry must be positive`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function isFatalWarningLane(policy: WarningPolicy, laneName: string): boolean {
  const lane = policy.lanes.find((l) => l.lane === laneName);
  return lane?.fatal === true;
}

export function defaultWarningPolicy(): WarningPolicy {
  return {
    schema: "Da30WarningPolicy/v1",
    id: "DA30-022",
    lanes: [
      { lane: "compiler", fatal: true, owner: "typecheck", quarantine: false, retry: 0 },
      { lane: "test", fatal: true, owner: "vitest", quarantine: true, retry: 1, expiryDays: 14 },
      { lane: "build", fatal: true, owner: "vite", quarantine: false, retry: 0 },
      { lane: "browser", fatal: false, owner: "playwright", quarantine: true, retry: 1, expiryDays: 7 },
      { lane: "WebGL", fatal: false, owner: "renderer", quarantine: true, retry: 0 },
      { lane: "accessibility", fatal: false, owner: "a11y", quarantine: true, retry: 0 },
      { lane: "deprecation", fatal: false, owner: "deps", quarantine: true, retry: 0, expiryDays: 30 },
    ],
    claimCeiling: "policy only",
  };
}
