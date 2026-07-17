import { describe, expect, it } from "vitest";
import {
  createSourceWriteReceipt,
  isSourceWriteReceiptCommitted,
  parseSourceWriteReceipt,
  type SourceWriteReceipt,
} from "../app/StudioSourceWriteReceipt";

describe("StudioSourceWriteReceipt", () => {
  it("creates a deterministic receipt digest from the write outcome", () => {
    const first = receipt();
    const second = receipt();

    expect(first.digest).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
    expect(second.digest).toBe(first.digest);
  });

  it("parses a committed write-and-reimport receipt", () => {
    const parsed = parseSourceWriteReceipt(receipt());

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.receipt).toMatchObject({
      status: "committed",
      reason: "write-and-reimport",
      compensation: { status: "not-needed" },
      committedDigest: "sha256:edited-cns",
    });
    expect(isSourceWriteReceiptCommitted(parsed.receipt)).toBe(true);
  });

  it("rejects tampered outcome fields before Studio consumes the receipt", () => {
    const tampered = receipt();
    tampered.reason = "write-failed";

    expect(parseSourceWriteReceipt(tampered).diagnostics).toContain("Source write receipt digest mismatch");
  });

  it("fails closed for malformed optional fields", () => {
    const malformed = { ...receipt(), byteLength: -1, draftDigest: 42 };

    expect(parseSourceWriteReceipt(malformed).diagnostics).toEqual(expect.arrayContaining([
      "Source write receipt byteLength is invalid",
      "Source write receipt draftDigest is invalid",
    ]));
  });

  it("keeps blocked receipts visible without treating them as committed", () => {
    const blocked = receipt({
      status: "blocked",
      reason: "source-changed",
      committedSourceFingerprint: undefined,
      committedDigest: undefined,
      diagnostics: ["source changed"],
    });

    expect(parseSourceWriteReceipt(blocked).diagnostics).toEqual([]);
    expect(isSourceWriteReceiptCommitted(blocked)).toBe(false);
  });

  it("preserves restored preimage evidence and rejects incomplete compensation", () => {
    const restored = receipt({
      status: "rejected",
      reason: "reimport-rejected",
      compensation: {
        status: "restored",
        preimageDigest: "a".repeat(64),
        preimageByteLength: 12,
        restoredDigest: "a".repeat(64),
        restoredByteLength: 12,
        diagnostics: [],
      },
    });
    expect(parseSourceWriteReceipt(restored).diagnostics).toEqual([]);

    const incomplete = { ...restored, compensation: { ...restored.compensation, restoredDigest: undefined } };
    expect(parseSourceWriteReceipt(incomplete).diagnostics).toContain("Source write receipt restored compensation is missing byte evidence");
  });

  it("requires compensation evidence in v1 receipts", () => {
    const withoutCompensation = { ...receipt() } as Record<string, unknown>;
    delete withoutCompensation.compensation;

    expect(parseSourceWriteReceipt(withoutCompensation).diagnostics).toContain("Source write receipt compensation is missing");
  });

  it("requires the receipt digest field", () => {
    const withoutDigest = { ...receipt() } as Partial<SourceWriteReceipt>;
    delete withoutDigest.digest;

    expect(parseSourceWriteReceipt(withoutDigest).diagnostics).toContain("Source write receipt digest is missing");
  });
});

function receipt(overrides: Partial<SourceWriteReceipt> = {}): SourceWriteReceipt {
  return createSourceWriteReceipt({
    id: "source-write:kfm-folder:chars/kfm/kfm.cns",
    sourcePackageId: "kfm-folder",
    sourceName: "Kung Fu Man",
    path: "chars/kfm/kfm.cns",
    status: "committed",
    reason: "write-and-reimport",
    observedAt: "2026-07-16T00:00:00.000Z",
    operation: "directory-exclusive-write-and-reimport",
    permission: "granted",
    baseSourceFingerprint: "sha256:before",
    observedSourceFingerprint: "sha256:after",
    committedSourceFingerprint: "sha256:after",
    baseProjectRevision: 3,
    observedProjectRevision: 3,
    draftDigest: "sha256:edited-cns",
    committedDigest: "sha256:edited-cns",
    byteLength: 128,
    invalidatedOutputs: ["runtime-manifest", "trace-artifact", "project-bundle"],
    diagnostics: [],
    ...overrides,
  });
}
