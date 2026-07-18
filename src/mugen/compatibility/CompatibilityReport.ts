import { compileControllerIr, compileRuntimeProgram, hasUnsupportedTriggers, isRuntimeExecutableController } from "../compiler/StateControllerCompiler";
import type { CompileReport, RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenCharacter, ResolvedCharacterFiles } from "../model/MugenCharacter";
import type { MugenDiagnostic } from "../model/MugenAnimation";
import type { MugenPalette } from "../model/MugenPalette";
import type { SndArchive } from "../model/MugenSound";
import type { MugenStateController, MugenStateDef } from "../model/MugenState";
import type { CompatibilityProfileId, IkemenScanReport } from "./IkemenFeatureScanner";
import { createEmptyIkemenScanReport } from "./IkemenFeatureScanner";
import type { UnsupportedFeature } from "./UnsupportedFeatureTracker";

export { createEmptyCompileReport } from "../compiler/StateControllerCompiler";

export type CompatibilityReport = {
  character: string;
  loaded: boolean;
  files: {
    def: boolean;
    sff: boolean;
    air: boolean;
    cmd: boolean;
    cns: boolean;
    snd: boolean;
  };
  sounds: {
    total: number;
    decoded: number;
    wav: number;
    unsupported: number;
    formats: Record<string, number>;
    sampleRates: Record<string, number>;
    channels: Record<string, number>;
  };
  palettes: {
    total: number;
    parsed: number;
    colors: number;
    withTransparency: number;
  };
  animations: {
    total: number;
    loaded: number;
    withCollisionBoxes: number;
  };
  states: {
    total: number;
    parsed: number;
    stateEntries: number;
    recognizedControllerStates: number;
    compiled: number;
    triggerSupported: number;
    runtimeRoutable: number;
    executed: number;
    /** @deprecated Use runtimeRoutable for static reports and executed for session telemetry. */
    executable: number;
  };
  triggers: {
    total: number;
    supported: number;
    unsupported: number;
    unsupportedFeatures: Record<string, number>;
  };
  controllers: Record<string, number | Record<string, number>>;
  compiler: CompileReport;
  profiles: {
    primary: CompatibilityProfileId;
    active: CompatibilityProfileId[];
    ikemen: IkemenScanReport;
  };
  session?: {
    executedStates: number[];
    routedStateEntries: number;
    executedControllers: Record<string, number>;
    executedOperations: Record<string, number>;
    lastExecutedState?: number;
  };
  unsupported: UnsupportedFeature[];
  warnings: string[];
  errors: string[];
};

export function isRuntimeSupportedController(type: string): boolean {
  return isRuntimeExecutableController(type);
}

export function createCompatibilityReport(input: {
  name?: string;
  loaded: boolean;
  files: ResolvedCharacterFiles;
  animations: MugenCharacter["animations"];
  commands?: MugenCharacter["commands"];
  states: MugenStateDef[];
  stateEntryControllers?: MugenCharacter["stateEntryControllers"];
  runtimeProgram?: RuntimeProgramIr;
  mugenVersion?: string;
  soundArchive?: SndArchive;
  palettes?: MugenPalette[];
  ikemen?: IkemenScanReport;
  diagnostics: MugenDiagnostic[];
  unsupported: UnsupportedFeature[];
}): CompatibilityReport {
  const compiled =
    input.runtimeProgram ??
    compileRuntimeProgram({
      commands: input.commands ?? [],
      states: input.states,
      stateEntryControllers: input.stateEntryControllers ?? [],
      animations: input.animations,
    });

  const unsupportedCounts: Record<string, number> = {};
  for (const item of input.unsupported) {
    unsupportedCounts[item.feature] = (unsupportedCounts[item.feature] ?? 0) + item.count;
  }

  const actions = [...input.animations.values()];
  const warnings = input.diagnostics
    .filter((diagnostic) => diagnostic.severity === "warning")
    .map((diagnostic) => formatDiagnostic(diagnostic));
  const errors = input.diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => formatDiagnostic(diagnostic));

  return {
    character: input.name?.trim() || "Unknown character",
    loaded: input.loaded,
    files: {
      def: Boolean(input.files.def),
      sff: Boolean(input.files.sprite),
      air: Boolean(input.files.anim),
      cmd: Boolean(input.files.cmd || input.files.commonCommands?.length),
      cns: Boolean(input.files.cns || input.files.states.length > 0),
      snd: Boolean(input.files.sound),
    },
    sounds: summarizeSounds(input.soundArchive),
    palettes: summarizePalettes(input.files, input.palettes),
    animations: {
      total: actions.length,
      loaded: actions.length,
      withCollisionBoxes: actions.filter((action) =>
        action.frames.some((frame) => frame.clsn1.length > 0 || frame.clsn2.length > 0),
      ).length,
    },
    states: {
      total: input.states.length,
      parsed: input.states.length,
      stateEntries: input.stateEntryControllers?.length ?? 0,
      recognizedControllerStates: compiled.report.states.recognizedControllerStates,
      compiled: compiled.report.states.compiled,
      triggerSupported: compiled.report.states.triggerSupportedStateEntries,
      runtimeRoutable: compiled.report.states.runtimeRoutableStateTargets.length,
      executed: 0,
      executable: compiled.report.states.runtimeRoutableStateTargets.length,
    },
    triggers: {
      total: compiled.report.triggers.total,
      supported: compiled.report.triggers.compiled,
      unsupported: compiled.report.triggers.unsupported,
      unsupportedFeatures: compiled.report.triggers.unsupportedFeatures,
    },
    controllers: {
      ...compiled.report.controllers.byType,
      UnsupportedTrigger: compiled.report.triggers.unsupportedFeatures,
      Unsupported: unsupportedCounts,
    },
    compiler: compiled.report,
    profiles: createCompatibilityProfiles({
      mugenVersion: input.mugenVersion,
      ikemen: input.ikemen,
    }),
    unsupported: input.unsupported,
    warnings,
    errors,
  };
}

function summarizePalettes(files: ResolvedCharacterFiles, palettes: MugenPalette[] | undefined): CompatibilityReport["palettes"] {
  const parsed = palettes ?? [];
  return {
    total: files.palettes.length,
    parsed: parsed.length,
    colors: parsed.reduce((total, palette) => total + (palette.colorCount ?? palette.colors?.length ?? 0), 0),
    withTransparency: parsed.filter((palette) => palette.transparentIndex !== undefined).length,
  };
}

function summarizeSounds(archive: SndArchive | undefined): CompatibilityReport["sounds"] {
  const formats: Record<string, number> = {};
  const sampleRates: Record<string, number> = {};
  const channels: Record<string, number> = {};
  for (const sound of archive?.sounds ?? []) {
    formats[sound.format] = (formats[sound.format] ?? 0) + 1;
    if (sound.sampleRate !== undefined) {
      const key = String(sound.sampleRate);
      sampleRates[key] = (sampleRates[key] ?? 0) + 1;
    }
    if (sound.channels !== undefined) {
      const key = String(sound.channels);
      channels[key] = (channels[key] ?? 0) + 1;
    }
  }
  const total = archive?.metadata.soundTotal ?? 0;
  const decoded = archive?.metadata.decodedTotal ?? 0;
  return {
    total,
    decoded,
    wav: formats.wav ?? 0,
    unsupported: Math.max(0, total - decoded),
    formats,
    sampleRates,
    channels,
  };
}

export function createCompatibilityProfiles(input: {
  mugenVersion?: string;
  ikemen?: IkemenScanReport;
  nativeRuntime?: boolean;
} = {}): CompatibilityReport["profiles"] {
  const ikemen = input.ikemen ?? createEmptyIkemenScanReport();
  const mugenProfile = inferMugenProfile(input.mugenVersion);
  const primary: CompatibilityProfileId = input.nativeRuntime ? "native-runtime" : ikemen.detected && !input.mugenVersion ? "ikemen-go-scan" : mugenProfile;
  const active = new Set<CompatibilityProfileId>();
  active.add(primary);
  if (!input.nativeRuntime) {
    active.add(mugenProfile);
  }
  if (ikemen.detected) {
    active.add("ikemen-go-scan");
  }
  return {
    primary,
    active: [...active],
    ikemen,
  };
}

function inferMugenProfile(mugenVersion: string | undefined): CompatibilityProfileId {
  const normalized = mugenVersion?.toLowerCase() ?? "";
  if (/\b1\.1\b/.test(normalized) || normalized.includes("1.1b") || normalized.includes("1.1 beta")) {
    return "mugen-1.1";
  }
  return "mugen-1.0";
}

export type TriggerAnalysis = {
  total: number;
  supported: number;
  unsupported: number;
  unsupportedFeatures: Record<string, number>;
};

export function analyzeControllerTriggers(controller: MugenStateController): TriggerAnalysis {
  const compiled = compileControllerIr(controller);
  const unsupportedFeatures: Record<string, number> = {};
  for (const trigger of compiled.triggers) {
    for (const feature of trigger.expression.unsupportedFeatures) {
      unsupportedFeatures[feature] = (unsupportedFeatures[feature] ?? 0) + 1;
    }
  }

  return {
    total: compiled.triggers.length,
    supported: compiled.triggers.filter((trigger) => trigger.expression.supportLevel !== "unsupported").length,
    unsupported: compiled.triggers.filter((trigger) => trigger.expression.supportLevel === "unsupported").length,
    unsupportedFeatures,
  };
}

function formatDiagnostic(diagnostic: MugenDiagnostic): string {
  const location = [diagnostic.file, diagnostic.line ? `:${diagnostic.line}` : ""].join("");
  return location ? `${location} ${diagnostic.message}` : diagnostic.message;
}

export function controllerHasUnsupportedTriggers(controller: MugenStateController): boolean {
  return hasUnsupportedTriggers(compileControllerIr(controller));
}
