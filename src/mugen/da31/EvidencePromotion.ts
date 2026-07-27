/**
 * DA31-005: hermetic test evidence → explicit promotion receipt.
 * Tests write temp; promotion records digests and clean subject SHA.
 */

export type PromotionReceipt = {
  schema: "Da31EvidencePromotion/v1";
  subjectSha: string;
  producerSha: string;
  inputDigests: Record<string, string>;
  outputDigest: string;
  reviewer: string;
  dirtyTree: boolean;
  provisional: boolean;
  artifactPath: string;
  promotedAt: string;
};

export function createPromotionReceipt(input: {
  subjectSha: string;
  producerSha: string;
  inputDigests: Record<string, string>;
  outputDigest: string;
  reviewer: string;
  dirtyTree: boolean;
  artifactPath: string;
  promotedAt?: string;
}): { ok: boolean; receipt?: PromotionReceipt; error?: string } {
  if (!input.subjectSha || input.subjectSha.length < 7) {
    return { ok: false, error: "subject-sha-required" };
  }
  if (!input.producerSha || input.producerSha.length < 7) {
    return { ok: false, error: "producer-sha-required" };
  }
  if (!input.outputDigest) return { ok: false, error: "output-digest-required" };
  if (!input.reviewer.trim()) return { ok: false, error: "reviewer-required" };
  if (input.dirtyTree) {
    // Allowed only as provisional
    return {
      ok: true,
      receipt: {
        schema: "Da31EvidencePromotion/v1",
        subjectSha: input.subjectSha,
        producerSha: input.producerSha,
        inputDigests: { ...input.inputDigests },
        outputDigest: input.outputDigest,
        reviewer: input.reviewer,
        dirtyTree: true,
        provisional: true,
        artifactPath: input.artifactPath,
        promotedAt: input.promotedAt ?? new Date().toISOString(),
      },
    };
  }
  return {
    ok: true,
    receipt: {
      schema: "Da31EvidencePromotion/v1",
      subjectSha: input.subjectSha,
      producerSha: input.producerSha,
      inputDigests: { ...input.inputDigests },
      outputDigest: input.outputDigest,
      reviewer: input.reviewer,
      dirtyTree: false,
      provisional: false,
      artifactPath: input.artifactPath,
      promotedAt: input.promotedAt ?? new Date().toISOString(),
    },
  };
}

export function rejectDirtyAsAuthoritative(receipt: PromotionReceipt): boolean {
  return receipt.dirtyTree === true || receipt.provisional === true;
}
