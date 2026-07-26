/**
 * PackageAnalysisRevision/v1 + diff (DA26-25 bounded).
 * Revision identity from analysis checksum, ruleset, and upstream pin.
 * Diff reports add/remove/change/downgrade between two fixed analyses.
 */

export const PACKAGE_ANALYSIS_REVISION_SCHEMA = "PackageAnalysisRevision/v1" as const;
export const PACKAGE_ANALYSIS_DIFF_SCHEMA = "PackageAnalysisDiff/v1" as const;

export type PackageAnalysisRevisionFinding = {
  id: string;
  status: "recognized" | "unsupported" | "unknown";
  feature: string;
  category: string;
};

export type PackageAnalysisRevision = {
  schema: typeof PACKAGE_ANALYSIS_REVISION_SCHEMA;
  id: string;
  sourceName: string;
  analysisChecksum: string;
  analyzerVersion: string;
  rulesetVersion: string;
  upstreamRevision: string;
  status: "recognized" | "partial" | "unknown";
  findings: PackageAnalysisRevisionFinding[];
  generatedAt: string;
  revisionDigest: string;
};

export type PackageAnalysisRevisionInput = Omit<PackageAnalysisRevision, "schema" | "revisionDigest">;

export type PackageAnalysisDiffKind = "add" | "remove" | "change" | "downgrade" | "upgrade" | "unchanged";

export type PackageAnalysisDiffEntry = {
  findingId: string;
  kind: PackageAnalysisDiffKind;
  before?: PackageAnalysisRevisionFinding;
  after?: PackageAnalysisRevisionFinding;
};

export type PackageAnalysisDiff = {
  schema: typeof PACKAGE_ANALYSIS_DIFF_SCHEMA;
  leftRevisionId: string;
  rightRevisionId: string;
  meta: {
    rulesetChanged: boolean;
    upstreamChanged: boolean;
    analyzerChanged: boolean;
    statusTransition?: string;
  };
  entries: PackageAnalysisDiffEntry[];
  summary: Record<PackageAnalysisDiffKind, number>;
  checksum: string;
};

export function createPackageAnalysisRevision(
  input: PackageAnalysisRevisionInput,
): PackageAnalysisRevision {
  const findings = [...input.findings]
    .map((finding) => ({ ...finding }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const payload: Omit<PackageAnalysisRevision, "revisionDigest"> = {
    schema: PACKAGE_ANALYSIS_REVISION_SCHEMA,
    id: input.id.trim(),
    sourceName: input.sourceName.trim(),
    analysisChecksum: input.analysisChecksum.trim(),
    analyzerVersion: input.analyzerVersion.trim(),
    rulesetVersion: input.rulesetVersion.trim(),
    upstreamRevision: input.upstreamRevision.trim(),
    status: input.status,
    findings,
    generatedAt: input.generatedAt,
  };
  return {
    ...payload,
    revisionDigest: stableHash(stableStringify(payload)),
  };
}

export function diffPackageAnalysisRevisions(
  left: PackageAnalysisRevision,
  right: PackageAnalysisRevision,
): PackageAnalysisDiff {
  const leftMap = new Map(left.findings.map((finding) => [finding.id, finding]));
  const rightMap = new Map(right.findings.map((finding) => [finding.id, finding]));
  const ids = new Set([...leftMap.keys(), ...rightMap.keys()]);
  const entries: PackageAnalysisDiffEntry[] = [];

  for (const id of [...ids].sort()) {
    const before = leftMap.get(id);
    const after = rightMap.get(id);
    if (before && !after) {
      entries.push({ findingId: id, kind: "remove", before });
      continue;
    }
    if (!before && after) {
      entries.push({ findingId: id, kind: "add", after });
      continue;
    }
    if (before && after) {
      if (findingEqual(before, after)) {
        entries.push({ findingId: id, kind: "unchanged", before, after });
      } else if (isDowngrade(before, after)) {
        entries.push({ findingId: id, kind: "downgrade", before, after });
      } else if (isUpgrade(before, after)) {
        entries.push({ findingId: id, kind: "upgrade", before, after });
      } else {
        entries.push({ findingId: id, kind: "change", before, after });
      }
    }
  }

  const summary: Record<PackageAnalysisDiffKind, number> = {
    add: 0,
    remove: 0,
    change: 0,
    downgrade: 0,
    upgrade: 0,
    unchanged: 0,
  };
  for (const entry of entries) summary[entry.kind] += 1;

  const meta = {
    rulesetChanged: left.rulesetVersion !== right.rulesetVersion,
    upstreamChanged: left.upstreamRevision !== right.upstreamRevision,
    analyzerChanged: left.analyzerVersion !== right.analyzerVersion,
    ...(left.status !== right.status
      ? { statusTransition: `${left.status}->${right.status}` }
      : {}),
  };

  const payload = {
    schema: PACKAGE_ANALYSIS_DIFF_SCHEMA,
    leftRevisionId: left.id,
    rightRevisionId: right.id,
    meta,
    entries,
    summary,
  };

  return {
    ...payload,
    checksum: stableHash(stableStringify(payload)),
  };
}

function findingEqual(
  left: PackageAnalysisRevisionFinding,
  right: PackageAnalysisRevisionFinding,
): boolean {
  return (
    left.id === right.id &&
    left.status === right.status &&
    left.feature === right.feature &&
    left.category === right.category
  );
}

function statusRank(status: PackageAnalysisRevisionFinding["status"]): number {
  if (status === "recognized") return 2;
  if (status === "unsupported") return 1;
  return 0;
}

function isDowngrade(
  before: PackageAnalysisRevisionFinding,
  after: PackageAnalysisRevisionFinding,
): boolean {
  return statusRank(after.status) < statusRank(before.status);
}

function isUpgrade(
  before: PackageAnalysisRevisionFinding,
  after: PackageAnalysisRevisionFinding,
): boolean {
  return statusRank(after.status) > statusRank(before.status);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
