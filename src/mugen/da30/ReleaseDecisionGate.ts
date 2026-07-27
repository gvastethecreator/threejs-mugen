/**
 * DA30-080: ProjectReleaseDecision as live product gate (pure decision).
 */

export type ReleaseInput = {
  projectRevision: number;
  evidenceFresh: boolean;
  scannerOk: boolean;
  assetsBlocked: string[];
  tampered: boolean;
  missingEvidence: boolean;
};

export type ReleaseDecision = {
  allow: boolean;
  code: "ready" | "stale" | "scanner-fail" | "blocked-asset" | "tampered" | "missing-evidence";
  nextAction: string;
};

export function evaluateReleaseDecision(input: ReleaseInput): ReleaseDecision {
  if (input.tampered) return { allow: false, code: "tampered", nextAction: "re-scan and re-sign evidence" };
  if (input.missingEvidence) return { allow: false, code: "missing-evidence", nextAction: "run required gates" };
  if (!input.evidenceFresh) return { allow: false, code: "stale", nextAction: "refresh revision-matched evidence" };
  if (!input.scannerOk) return { allow: false, code: "scanner-fail", nextAction: "fix scanner failures" };
  if (input.assetsBlocked.length) {
    return { allow: false, code: "blocked-asset", nextAction: `remove or permit: ${input.assetsBlocked.join(",")}` };
  }
  return { allow: true, code: "ready", nextAction: "export local bundle" };
}
