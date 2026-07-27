/**
 * DA30-030: local security and trust boundary baseline (static inventory + negative probes).
 */
import {
  negativeArchivePathFixtures,
  positiveArchivePathFixtures,
  rejectUnsafeArchivePaths,
} from "./ArchivePathPolicy";

export type TrustProbe = {
  id: string;
  surface: string;
  risk: string;
  negativeCase: string;
  status: "documented" | "mitigated" | "open";
};

export type SecurityTrustBaseline = {
  schema: "Da30SecurityTrustBaseline/v1";
  id: "DA30-030";
  probes: TrustProbe[];
  blockedClaims: string[];
  pathProbe: {
    rejectedCount: number;
    acceptedCount: number;
    allNegativesRejected: boolean;
    allPositivesAccepted: boolean;
  };
};

export function buildSecurityTrustBaseline(): SecurityTrustBaseline {
  const negativeList = negativeArchivePathFixtures();
  const positiveList = positiveArchivePathFixtures();
  const negatives = rejectUnsafeArchivePaths(negativeList);
  const positives = rejectUnsafeArchivePaths(positiveList);
  const allNegativesRejected = negatives.rejected.length === negativeList.length && negatives.accepted.length === 0;
  const allPositivesAccepted = positives.accepted.length === positiveList.length && positives.ok;
  return {
    schema: "Da30SecurityTrustBaseline/v1",
    id: "DA30-030",
    probes: [
      {
        id: "zip-traversal",
        surface: "archive import",
        risk: "path traversal via ../ entries",
        negativeCase: "entry with .. must fail closed",
        status: allNegativesRejected ? "mitigated" : "documented",
      },
      {
        id: "blob-url",
        surface: "object URLs",
        risk: "leaked blob URLs after revoke",
        negativeCase: "revoke before drop",
        status: "documented",
      },
      {
        id: "file-handle",
        surface: "File System Access",
        risk: "stale permission after revoke",
        negativeCase: "permission loss surfaces trust UI",
        status: "documented",
      },
      {
        id: "storage-quota",
        surface: "IndexedDB",
        risk: "quota exceeded mid-write",
        negativeCase: "transaction rolls back",
        status: "documented",
      },
      {
        id: "unsafe-eval",
        surface: "expression compiler",
        risk: "eval of untrusted package code",
        negativeCase: "no eval on imported sources",
        status: "mitigated",
      },
      {
        id: "worker-message",
        surface: "scanner worker",
        risk: "unvalidated postMessage",
        negativeCase: "schema reject malformed",
        status: "documented",
      },
      {
        id: "export-path",
        surface: "local export",
        risk: "absolute path escape",
        negativeCase: "sanitize to package root",
        status: "mitigated",
      },
      {
        id: "secrets",
        surface: "browser bundle",
        risk: "API keys in client",
        negativeCase: "no secret env in Vite public",
        status: "mitigated",
      },
      {
        id: "dependency-scripts",
        surface: "pnpm install",
        risk: "postinstall network",
        negativeCase: "review new deps",
        status: "open",
      },
      {
        id: "csp-needs",
        surface: "headers",
        risk: "inline script without CSP",
        negativeCase: "document CSP requirements",
        status: "documented",
      },
    ],
    blockedClaims: ["hosted multi-tenant security", "remote package execution"],
    pathProbe: {
      rejectedCount: negatives.rejected.length,
      acceptedCount: positives.accepted.length,
      allNegativesRejected,
      allPositivesAccepted,
    },
  };
}

export function validateSecurityTrustBaseline(doc: SecurityTrustBaseline): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (doc.schema !== "Da30SecurityTrustBaseline/v1") errors.push("bad schema");
  if (doc.probes.length < 8) errors.push("need >=8 probes");
  for (const p of doc.probes) {
    if (!p.negativeCase.trim()) errors.push(`${p.id}: missing negative`);
  }
  if (!doc.pathProbe?.allNegativesRejected) errors.push("pathProbe negatives must all reject");
  if (!doc.pathProbe?.allPositivesAccepted) errors.push("pathProbe positives must all accept");
  return { ok: errors.length === 0, errors };
}
