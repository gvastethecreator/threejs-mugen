/**
 * DA30-113: product threat model and response plan (design record).
 */

export type ThreatRow = {
  zone: string;
  asset: string;
  threat: string;
  control: string;
  residual: string;
  releaseBlocker: boolean;
};

export function buildThreatModel(): {
  schema: "Da30ThreatModelPlan/v1";
  rows: ThreatRow[];
  logging: string[];
  disclosure: string;
  ok: boolean;
} {
  const rows: ThreatRow[] = [
    {
      zone: "browser",
      asset: "project files",
      threat: "path traversal on import",
      control: "ArchivePathPolicy",
      residual: "zip bomb CPU",
      releaseBlocker: true,
    },
    {
      zone: "browser",
      asset: "secrets",
      threat: "env leak in bundle",
      control: "no server secrets in vite",
      residual: "user pastes key",
      releaseBlocker: true,
    },
    {
      zone: "worker",
      asset: "scanner",
      threat: "malformed package crash",
      control: "ScannerSafetyLimits",
      residual: "timeout DoS",
      releaseBlocker: false,
    },
    {
      zone: "modules",
      asset: "lua/ext",
      threat: "code exec",
      control: "deny/isolate default",
      residual: "future host bugs",
      releaseBlocker: true,
    },
    {
      zone: "export",
      asset: "bundle",
      threat: "tampered evidence",
      control: "ReleaseDecisionGate digests",
      residual: "offline edit",
      releaseBlocker: true,
    },
    {
      zone: "deps",
      asset: "npm",
      threat: "supply chain",
      control: "lockfile + audit lane",
      residual: "zero-day",
      releaseBlocker: false,
    },
  ];
  return {
    schema: "Da30ThreatModelPlan/v1",
    rows,
    logging: ["local diagnostics only", "no PII default"],
    disclosure: "security@local-project — coordinated",
    ok: rows.length >= 6 && rows.some((r) => r.releaseBlocker),
  };
}
