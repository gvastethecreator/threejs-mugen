/**
 * DA30-076: Studio trust failures — actionable causes and safe actions.
 */

export type TrustFailureKind =
  | "quota"
  | "permission"
  | "stale-evidence"
  | "tampered-evidence"
  | "scanner-failure"
  | "blocked-asset"
  | "conflict"
  | "cancellation";

export type TrustFailure = {
  kind: TrustFailureKind;
  cause: string;
  item: string;
  retainedWork: boolean;
  safeAction: string;
  retryable: boolean;
};

export function describeTrustFailure(kind: TrustFailureKind, item: string): TrustFailure {
  const table: Record<TrustFailureKind, Omit<TrustFailure, "kind" | "item">> = {
    quota: {
      cause: "storage-quota-exceeded",
      retainedWork: true,
      safeAction: "export-copy-then-free-space",
      retryable: true,
    },
    permission: {
      cause: "file-permission-denied",
      retainedWork: true,
      safeAction: "re-authorize-folder",
      retryable: true,
    },
    "stale-evidence": {
      cause: "evidence-older-than-revision",
      retainedWork: true,
      safeAction: "rerun-scanner",
      retryable: true,
    },
    "tampered-evidence": {
      cause: "digest-mismatch",
      retainedWork: true,
      safeAction: "quarantine-and-rebuild-evidence",
      retryable: false,
    },
    "scanner-failure": {
      cause: "worker-crash",
      retainedWork: true,
      safeAction: "retry-bounded-scan",
      retryable: true,
    },
    "blocked-asset": {
      cause: "permission-exclude",
      retainedWork: true,
      safeAction: "remove-or-replace-asset",
      retryable: false,
    },
    conflict: {
      cause: "parallel-edit",
      retainedWork: true,
      safeAction: "choose-keep-or-export-copy",
      retryable: true,
    },
    cancellation: {
      cause: "user-cancel",
      retainedWork: true,
      safeAction: "resume-or-discard-pending",
      retryable: true,
    },
  };
  return { kind, item, ...table[kind] };
}

export function runTrustFailureMatrix(): { ok: boolean; failures: TrustFailure[] } {
  const kinds: TrustFailureKind[] = [
    "quota",
    "permission",
    "stale-evidence",
    "tampered-evidence",
    "scanner-failure",
    "blocked-asset",
    "conflict",
    "cancellation",
  ];
  const failures = kinds.map((k) => describeTrustFailure(k, `item-${k}`));
  return {
    ok: failures.length === 8 && failures.every((f) => f.cause && f.safeAction && f.retainedWork),
    failures,
  };
}
