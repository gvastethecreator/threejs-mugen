/**
 * PackageAnalysisRevisionBridge/v1 (DA27-05).
 * Lift PackageAnalysis / PackageAnalysisV1 results into PackageAnalysisRevision + diff.
 */

import {
  PACKAGE_ANALYSIS_V1_ANALYZER,
  PACKAGE_ANALYSIS_V1_RULESET,
  PACKAGE_ANALYSIS_V1_UPSTREAM,
  type PackageAnalysisResult,
  type PackageAnalysisV1Result,
} from "./PackageAnalysis";
import {
  createPackageAnalysisRevision,
  diffPackageAnalysisRevisions,
  type PackageAnalysisDiff,
  type PackageAnalysisRevision,
} from "./PackageAnalysisRevision";

export const PACKAGE_ANALYSIS_REVISION_BRIDGE_SCHEMA = "PackageAnalysisRevisionBridge/v1" as const;

export function revisionFromPackageAnalysis(
  analysis: PackageAnalysisResult,
  options: {
    id?: string;
    analyzerVersion?: string;
    rulesetVersion?: string;
    upstreamRevision?: string;
  } = {},
): PackageAnalysisRevision {
  return createPackageAnalysisRevision({
    id: options.id ?? `rev:${analysis.checksum.slice(0, 12)}`,
    sourceName: analysis.sourceName,
    analysisChecksum: analysis.checksum,
    analyzerVersion: options.analyzerVersion ?? "0.0.0",
    rulesetVersion: options.rulesetVersion ?? "0.0.0",
    upstreamRevision: options.upstreamRevision ?? "unpinned",
    status: analysis.status,
    findings: analysis.findings.map((finding) => ({
      id: finding.id,
      status: finding.status,
      feature: finding.feature,
      category: finding.category,
    })),
    generatedAt: analysis.generatedAt,
  });
}

export function revisionFromPackageAnalysisV1(
  report: PackageAnalysisV1Result,
  options: { id?: string } = {},
): PackageAnalysisRevision {
  return revisionFromPackageAnalysis(report.analysis, {
    id: options.id ?? `rev-v1:${report.checksum.slice(0, 12)}`,
    analyzerVersion: report.analyzer.version || PACKAGE_ANALYSIS_V1_ANALYZER.version,
    rulesetVersion: report.ruleset.version || PACKAGE_ANALYSIS_V1_RULESET.version,
    upstreamRevision: report.upstream.revision || PACKAGE_ANALYSIS_V1_UPSTREAM.revision,
  });
}

export function diffAnalysisReports(
  left: PackageAnalysisResult | PackageAnalysisV1Result,
  right: PackageAnalysisResult | PackageAnalysisV1Result,
): {
  schema: typeof PACKAGE_ANALYSIS_REVISION_BRIDGE_SCHEMA;
  left: PackageAnalysisRevision;
  right: PackageAnalysisRevision;
  diff: PackageAnalysisDiff;
} {
  const leftRev =
    "analysis" in left
      ? revisionFromPackageAnalysisV1(left, { id: "left" })
      : revisionFromPackageAnalysis(left, { id: "left" });
  const rightRev =
    "analysis" in right
      ? revisionFromPackageAnalysisV1(right, { id: "right" })
      : revisionFromPackageAnalysis(right, { id: "right" });
  return {
    schema: PACKAGE_ANALYSIS_REVISION_BRIDGE_SCHEMA,
    left: leftRev,
    right: rightRev,
    diff: diffPackageAnalysisRevisions(leftRev, rightRev),
  };
}
