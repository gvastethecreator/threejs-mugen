import rawGateEvidence from "./studio-gate-evidence-v0.json";
import { parseGateEvidenceDocument, type GateEvidenceDocument } from "./GateEvidence";

const parsed = parseGateEvidenceDocument(rawGateEvidence);

export const STUDIO_GATE_EVIDENCE_DOCUMENT: GateEvidenceDocument = parsed.document ?? {
  schemaVersion: "mugen-web-sandbox/gate-evidence/v0",
  generatedAt: new Date(0).toISOString(),
  sourceRevision: "missing",
  results: [],
};

export const STUDIO_GATE_EVIDENCE_DIAGNOSTICS = parsed.diagnostics;
