/**
 * DA31-002: immutable DA30 task contract identity (digest comparison).
 */

export type TaskContract = {
  id: string;
  kind: string;
  scope: string;
  acceptance: string;
  dependencies: string[];
  expectedFailure: string;
  claimCeiling: string;
  source?: string;
  digest: { algorithm: string; value: string };
};

export type ContractEquivalence = {
  ok: boolean;
  reason?: string;
  originalDigest?: string;
  candidateDigest?: string;
};

export function contractPayload(c: Omit<TaskContract, "digest" | "source">): string {
  return JSON.stringify({
    id: c.id,
    kind: c.kind,
    scope: c.scope,
    acceptance: c.acceptance,
    dependencies: c.dependencies,
    expectedFailure: c.expectedFailure,
    claimCeiling: c.claimCeiling,
  });
}

/** Candidate must match original digest byte-for-byte on identity fields. */
export function assertContractEquivalence(
  original: TaskContract,
  candidate: TaskContract,
): ContractEquivalence {
  if (original.id !== candidate.id) {
    return { ok: false, reason: "id-mismatch" };
  }
  if (original.digest.value !== candidate.digest.value) {
    return {
      ok: false,
      reason: "digest-mismatch",
      originalDigest: original.digest.value,
      candidateDigest: candidate.digest.value,
    };
  }
  return {
    ok: true,
    originalDigest: original.digest.value,
    candidateDigest: candidate.digest.value,
  };
}

export function findContract(contracts: TaskContract[], id: string): TaskContract | undefined {
  return contracts.find((c) => c.id === id);
}
