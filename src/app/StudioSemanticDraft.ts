import type { MugenDiagnostic } from "../mugen/model/MugenAnimation";
import { compileRuntimeProgram } from "../mugen/compiler/StateControllerCompiler";
import { fingerprintMugenStateSource } from "../mugen/compiler/StateSourceResolver";
import { parseCns } from "../mugen/parsers/CnsParser";

export const STUDIO_SEMANTIC_DRAFT_SCHEMA = "mugen-web-sandbox/studio-semantic-draft/v0" as const;
export const STUDIO_SEMANTIC_DRAFT_COMPILER_PROFILE = "mugen-cns-st" as const;
export const STUDIO_SEMANTIC_DRAFT_COMPILER_VERSION = "runtime-ir-v0" as const;

export type StudioSemanticDraftStatus = "ready" | "invalid" | "stale";

export type StudioSemanticDraftDiagnostic = {
  severity: "error" | "warning";
  code: string;
  message: string;
  line?: number;
};

export type StudioSemanticDraftCompileSummary = {
  states: number;
  controllers: number;
  compiledStates: number;
  compiledControllers: number;
  unsupportedControllers: number;
  triggers: number;
  unsupportedTriggers: number;
};

export type StudioSemanticDraftPreflight = {
  schemaVersion: typeof STUDIO_SEMANTIC_DRAFT_SCHEMA;
  sourcePackageId: string;
  path: string;
  compilerProfile: typeof STUDIO_SEMANTIC_DRAFT_COMPILER_PROFILE;
  compilerVersion: typeof STUDIO_SEMANTIC_DRAFT_COMPILER_VERSION;
  status: StudioSemanticDraftStatus;
  baseFingerprint?: string;
  activeFingerprint?: string;
  baseRevision?: number;
  activeRevision?: number;
  draftDigest: string;
  diagnosticDigest: string;
  diagnostics: StudioSemanticDraftDiagnostic[];
  compile: StudioSemanticDraftCompileSummary;
};

export type StudioSemanticDraftInput = {
  sourcePackageId: string;
  path: string;
  text: string;
  baseFingerprint?: string;
  activeFingerprint?: string;
  baseRevision?: number;
  activeRevision?: number;
};

export function createStudioSemanticDraftPreflight(
  input: StudioSemanticDraftInput,
): StudioSemanticDraftPreflight {
  const parsed = parseCns(input.text, input.path);
  const compiled = compileRuntimeProgram({
    commands: [],
    states: parsed.states,
    stateEntryControllers: parsed.controllers.filter((controller) => controller.stateId === -1),
    animations: new Map(),
    constants: parsed.constants,
  });
  const diagnostics = [
    ...sourceFormatDiagnostics(input.path),
    ...parsed.diagnostics.map((diagnostic) => semanticDiagnosticFromParser(diagnostic)),
    ...compiled.states.flatMap((state) => state.controllers.flatMap((controller) => (
      controller.supportLevel === "unsupported"
        ? [{
            severity: "warning" as const,
            code: "unsupported-controller",
            message: `Controller '${controller.type || "Unknown"}' is parsed but not compiled for this runtime profile.`,
            line: controller.line,
          }]
        : []
    ))),
    ...compiled.stateEntries.flatMap((controller) => (
      controller.supportLevel === "unsupported"
        ? [{
            severity: "warning" as const,
            code: "unsupported-entry-controller",
            message: `Entry controller '${controller.type || "Unknown"}' is parsed but not compiled for this runtime profile.`,
            line: controller.line,
          }]
        : []
    )),
    ...compiled.states.flatMap((state) => state.controllers.flatMap((controller) => controller.triggers.flatMap((trigger) => (
      trigger.expression.supportLevel === "unsupported"
        ? [{
            severity: "warning" as const,
            code: "unsupported-trigger",
            message: `Trigger '${trigger.expression.raw}' is parsed but has unsupported expression features.`,
            line: trigger.line,
          }]
        : []
    )))),
  ];

  if (parsed.states.length === 0) {
    diagnostics.push({
      severity: "warning",
      code: "empty-state-document",
      message: "The document does not declare a [Statedef] section; constants-only CNS/ST files remain readable but are not runtime-routable.",
    });
  }

  const staleDiagnostics = sourceRevisionDiagnostics(input);
  diagnostics.push(...staleDiagnostics);
  const hasParseErrors = diagnostics.some((diagnostic) => diagnostic.severity === "error");
  const hasStaleContext = staleDiagnostics.length > 0;
  const status: StudioSemanticDraftStatus = hasStaleContext
    ? "stale"
    : hasParseErrors
      ? "invalid"
      : "ready";
  const draftDigest = fingerprintMugenStateSource(input.text);
  const diagnosticDigest = fingerprintMugenStateSource(JSON.stringify(diagnostics));

  return {
    schemaVersion: STUDIO_SEMANTIC_DRAFT_SCHEMA,
    sourcePackageId: input.sourcePackageId,
    path: input.path,
    compilerProfile: STUDIO_SEMANTIC_DRAFT_COMPILER_PROFILE,
    compilerVersion: STUDIO_SEMANTIC_DRAFT_COMPILER_VERSION,
    status,
    ...(input.baseFingerprint ? { baseFingerprint: input.baseFingerprint } : {}),
    ...(input.activeFingerprint ? { activeFingerprint: input.activeFingerprint } : {}),
    ...(input.baseRevision !== undefined ? { baseRevision: input.baseRevision } : {}),
    ...(input.activeRevision !== undefined ? { activeRevision: input.activeRevision } : {}),
    draftDigest,
    diagnosticDigest,
    diagnostics,
    compile: {
      states: compiled.report.states.total,
      controllers: compiled.report.controllers.total,
      compiledStates: compiled.report.states.compiled,
      compiledControllers: compiled.report.controllers.compiled,
      unsupportedControllers: compiled.report.controllers.unsupported,
      triggers: compiled.report.triggers.total,
      unsupportedTriggers: compiled.report.triggers.unsupported,
    },
  };
}

export function canWriteStudioSemanticDraft(
  preflight: StudioSemanticDraftPreflight | undefined,
): boolean {
  return preflight?.status === "ready";
}

export function describeStudioSemanticDraft(
  preflight: StudioSemanticDraftPreflight | undefined,
): string {
  if (!preflight) {
    return "Semantic preflight has not run yet.";
  }
  const firstError = preflight.diagnostics.find((diagnostic) => diagnostic.severity === "error");
  const firstWarning = preflight.diagnostics.find((diagnostic) => diagnostic.severity === "warning");
  if (preflight.status === "stale") {
    return firstError?.message ?? "The source revision or fingerprint changed; reload before editing.";
  }
  if (preflight.status === "invalid") {
    return firstError?.message ?? "The source draft has a syntax diagnostic.";
  }
  const warningSuffix = firstWarning ? ` / ${firstWarning.message}` : "";
  return `${preflight.compile.states} states / ${preflight.compile.controllers} controllers compiled${warningSuffix}`;
}

function semanticDiagnosticFromParser(diagnostic: MugenDiagnostic): StudioSemanticDraftDiagnostic {
  return {
    severity: "error",
    code: "parse-diagnostic",
    message: diagnostic.message,
    ...(diagnostic.line !== undefined ? { line: diagnostic.line } : {}),
  };
}

function sourceFormatDiagnostics(path: string): StudioSemanticDraftDiagnostic[] {
  if (/\.(?:cns|st)$/i.test(path)) {
    return [];
  }
  return [{
    severity: "error",
    code: "unsupported-source-format",
    message: "Only CNS/ST source documents have a semantic preflight in this Studio slice.",
  }];
}

function sourceRevisionDiagnostics(input: StudioSemanticDraftInput): StudioSemanticDraftDiagnostic[] {
  const diagnostics: StudioSemanticDraftDiagnostic[] = [];
  if (input.baseFingerprint !== undefined && input.activeFingerprint !== undefined && input.baseFingerprint.toLowerCase() !== input.activeFingerprint.toLowerCase()) {
    diagnostics.push({
      severity: "error",
      code: "source-fingerprint-changed",
      message: "The active source fingerprint differs from the draft base fingerprint; reimport before writing.",
    });
  }
  if (input.baseFingerprint !== undefined && input.activeFingerprint === undefined) {
    diagnostics.push({
      severity: "error",
      code: "source-fingerprint-missing",
      message: "The active source fingerprint is unavailable; reimport before writing.",
    });
  }
  if (input.baseRevision !== undefined && input.activeRevision !== undefined && input.baseRevision !== input.activeRevision) {
    diagnostics.push({
      severity: "error",
      code: "project-revision-changed",
      message: "The active project revision differs from the draft base revision; resolve the project conflict before writing.",
    });
  }
  return diagnostics;
}
