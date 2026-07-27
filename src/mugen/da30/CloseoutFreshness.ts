/**
 * DA30-007: revision/freshness rules for closeouts.
 */

export type FreshnessRecord = {
  implementationSha: string | null;
  evidenceSha: string | null;
  producerSha: string | null;
  inputDigests: Record<string, string>;
  dirtyExclusions: string[];
  inheritance: "none" | "same-sha" | "invalid";
  productChangedAfterGate: boolean;
  productChangePaths?: string[];
};

export type FreshnessVerdict = {
  ok: boolean;
  stale: boolean;
  reasons: string[];
};

export function evaluateCloseoutFreshness(rec: FreshnessRecord): FreshnessVerdict {
  const reasons: string[] = [];
  if (!rec.implementationSha) reasons.push("missing implementationSha");
  if (!rec.evidenceSha) reasons.push("missing evidenceSha");
  if (!rec.producerSha) reasons.push("missing producerSha");
  if (!rec.inputDigests || Object.keys(rec.inputDigests).length === 0) {
    reasons.push("missing inputDigests");
  }
  if (rec.inheritance === "invalid") reasons.push("invalid inheritance");
  if (rec.productChangedAfterGate) {
    reasons.push(
      `product changed after gate: ${(rec.productChangePaths || []).join(",") || "unspecified"}`,
    );
  }
  // CSS-after-gate fixture pattern: redesign.css after formal pin without re-gate
  if (
    rec.productChangedAfterGate &&
    (rec.productChangePaths || []).some((p) => /redesign\.css|style\.css/i.test(p))
  ) {
    reasons.push("css-after-gate-stale");
  }
  if (
    rec.implementationSha &&
    rec.evidenceSha &&
    rec.implementationSha !== rec.evidenceSha &&
    rec.inheritance !== "same-sha"
  ) {
    // Allow different SHAs only when explicitly same-sha inheritance is not claimed wrongly
    if (rec.inheritance === "none" && rec.productChangedAfterGate) {
      reasons.push("implementation/evidence sha diverge with product change");
    }
  }
  const stale = reasons.some((r) => /stale|after gate|diverge|invalid inheritance|css-after/i.test(r));
  const ok = reasons.length === 0;
  return { ok, stale: stale || !ok, reasons };
}

/** Fixture: formal pin green then redesign.css lands without re-gate → must fail. */
export function cssAfterGateFixture(): FreshnessRecord {
  return {
    implementationSha: "a6e91520081d6308eac3d53b6bf333d4b950d019",
    evidenceSha: "a6e91520081d6308eac3d53b6bf333d4b950d019",
    producerSha: "a6e91520081d6308eac3d53b6bf333d4b950d019",
    inputDigests: { gateLog: "abc" },
    dirtyExclusions: [],
    inheritance: "none",
    productChangedAfterGate: true,
    productChangePaths: ["src/styles/redesign.css"],
  };
}
