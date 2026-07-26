/**
 * ScannerCapabilityVector/v1 (DA26-27).
 * Five explicit phases; none is inferred from another.
 */

export const SCANNER_CAPABILITY_VECTOR_SCHEMA = "ScannerCapabilityVector/v1" as const;

export type ScannerCapabilityPhase =
  | "recognized"
  | "parsed"
  | "lowered"
  | "executed"
  | "verified";

export const SCANNER_CAPABILITY_PHASES: readonly ScannerCapabilityPhase[] = [
  "recognized",
  "parsed",
  "lowered",
  "executed",
  "verified",
] as const;

export type ScannerCapabilityFact = {
  phase: ScannerCapabilityPhase;
  true: boolean;
  evidenceId?: string;
};

export type ScannerCapabilitySignal = {
  id: string;
  facts: ScannerCapabilityFact[];
};

export type ScannerCapabilityVector = {
  schema: typeof SCANNER_CAPABILITY_VECTOR_SCHEMA;
  signals: ScannerCapabilitySignal[];
};

export type ScannerCapabilityAssessment = {
  vector: ScannerCapabilityVector;
  highestProvenPhase: ScannerCapabilityPhase | "none";
  diagnostics: string[];
};

export function createScannerCapabilityVector(
  signals: readonly ScannerCapabilitySignal[],
): ScannerCapabilityVector {
  return {
    schema: SCANNER_CAPABILITY_VECTOR_SCHEMA,
    signals: signals.map((signal) => ({
      id: signal.id,
      facts: SCANNER_CAPABILITY_PHASES.map((phase) => {
        const found = signal.facts.find((fact) => fact.phase === phase);
        return {
          phase,
          true: found?.true === true,
          ...(found?.evidenceId ? { evidenceId: found.evidenceId } : {}),
        };
      }),
    })),
  };
}

/**
 * Highest phase is the last consecutive true phase from recognized onward.
 * A later true without earlier true is rejected (no phase inference).
 */
export function assessScannerCapabilityVector(
  signals: readonly ScannerCapabilitySignal[],
): ScannerCapabilityAssessment {
  const vector = createScannerCapabilityVector(signals);
  const diagnostics: string[] = [];
  let highest: ScannerCapabilityPhase | "none" = "none";

  for (const signal of vector.signals) {
    let sawFalse = false;
    for (const fact of signal.facts) {
      if (fact.true && sawFalse) {
        diagnostics.push(`phase-inference:${signal.id}:${fact.phase}`);
      }
      if (!fact.true) {
        sawFalse = true;
        continue;
      }
      if (!sawFalse) {
        highest = fact.phase;
      }
    }
  }

  // MUGEN select.def recognition alone must not imply execution.
  for (const signal of vector.signals) {
    if (signal.id === "mugen-select.def") {
      const executed = signal.facts.find((fact) => fact.phase === "executed");
      if (executed?.true) {
        diagnostics.push("select.def-must-not-execute");
      }
    }
  }

  return {
    vector,
    highestProvenPhase: diagnostics.some((d) => d.startsWith("phase-inference"))
      ? "none"
      : highest,
    diagnostics: diagnostics.sort(),
  };
}

export function negativeMugenSelectDefSignal(): ScannerCapabilitySignal {
  return {
    id: "mugen-select.def",
    facts: [
      { phase: "recognized", true: true, evidenceId: "select.def-path" },
      { phase: "parsed", true: false },
      { phase: "lowered", true: false },
      { phase: "executed", true: false },
      { phase: "verified", true: false },
    ],
  };
}
