import type { GameProjectManifest, StudioGateRecord, StudioProjectSummary } from "./StudioModel";
import {
  buildSharedEngineContractReport,
  getEngineModuleContract,
  type EngineModuleRole,
  type SharedEngineContractId,
  type SharedEngineContractReport,
} from "../engine/ModuleContracts";

export type RuntimeModuleStatus = "active" | "planned" | "missing";

export type RuntimeModuleRecord = {
  id: string;
  label: string;
  status: RuntimeModuleStatus;
  role: EngineModuleRole;
  detail: string;
  consumes: SharedEngineContractId[];
  provides: SharedEngineContractId[];
  forbiddenSharedCoreConcepts: string[];
  claimAllowed: string;
  claimBlocked: string;
};

export type CompiledRuntimeManifest = {
  schemaVersion: "mugen-web-sandbox/runtime-manifest/v0";
  sourceSchemaVersion: GameProjectManifest["schemaVersion"];
  projectId: string;
  projectName: string;
  engineVersion: string;
  generatedAt: string;
  entry: GameProjectManifest["entry"];
  runtime: {
    primaryModule: "mugen-compat";
    renderer: "three-render";
    tickRate: 60;
    snapshotContract: "mugen-snapshot/v0";
  };
  modules: {
    requested: string[];
    active: RuntimeModuleRecord[];
    planned: RuntimeModuleRecord[];
    missing: RuntimeModuleRecord[];
  };
  contracts: SharedEngineContractReport;
  assets: GameProjectManifest["assets"] & {
    records: GameProjectManifest["assetRecords"];
  };
  compatibility: {
    gates: StudioGateRecord[];
    stats: StudioProjectSummary["stats"];
  };
  diagnostics: {
    warnings: string[];
    errors: string[];
  };
};

export function compileGameProjectManifest(
  manifest: GameProjectManifest,
  options: { generatedAt?: string } = {},
): CompiledRuntimeManifest {
  const warnings: string[] = [];
  const errors: string[] = [];
  const requested = uniqueStrings(manifest.modules);
  const active: RuntimeModuleRecord[] = [];
  const planned: RuntimeModuleRecord[] = [];
  const missing: RuntimeModuleRecord[] = [];

  for (const moduleId of requested) {
    const known = getEngineModuleContract(moduleId);
    if (!known) {
      const record: RuntimeModuleRecord = {
        id: moduleId,
        label: moduleId,
        status: "missing",
        role: "genre",
        detail: "No compiler/runtime adapter is registered for this module id.",
        consumes: [],
        provides: [],
        forbiddenSharedCoreConcepts: [],
        claimAllowed: "Unknown module ids can be kept in project files for future migration.",
        claimBlocked: "No runtime, renderer, build, or QA contract is registered for this module.",
      };
      missing.push(record);
      warnings.push(`Module '${moduleId}' is not registered in the runtime compiler`);
      continue;
    }

    const record: RuntimeModuleRecord = {
      id: moduleId,
      label: known.label,
      status: known.status,
      role: known.role,
      detail: known.detail,
      consumes: known.consumes,
      provides: known.provides,
      forbiddenSharedCoreConcepts: known.forbiddenSharedCoreConcepts,
      claimAllowed: known.claimAllowed,
      claimBlocked: known.claimBlocked,
    };
    if (record.status === "planned") {
      planned.push(record);
      warnings.push(`Module '${moduleId}' is tracked but not runtime-executable yet`);
    } else {
      active.push(record);
    }
  }

  if (!requested.includes("mugen-compat")) {
    warnings.push("Project does not request the mugen-compat simulation module");
  }
  if (!requested.includes("three-render")) {
    warnings.push("Project does not request the three-render adapter");
  }

  validateEntryAssets(manifest, warnings);

  return {
    schemaVersion: "mugen-web-sandbox/runtime-manifest/v0",
    sourceSchemaVersion: manifest.schemaVersion,
    projectId: manifest.id,
    projectName: manifest.name,
    engineVersion: manifest.engineVersion,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    entry: manifest.entry,
    runtime: {
      primaryModule: "mugen-compat",
      renderer: "three-render",
      tickRate: 60,
      snapshotContract: "mugen-snapshot/v0",
    },
    modules: {
      requested,
      active,
      planned,
      missing,
    },
    contracts: buildSharedEngineContractReport(requested),
    assets: {
      characters: uniqueStrings(manifest.assets.characters),
      stages: uniqueStrings(manifest.assets.stages),
      audio: uniqueStrings(manifest.assets.audio),
      ui: uniqueStrings(manifest.assets.ui),
      effects: uniqueStrings(manifest.assets.effects),
      records: manifest.assetRecords,
    },
    compatibility: {
      gates: manifest.compatibility.gates,
      stats: manifest.compatibility.stats,
    },
    diagnostics: {
      warnings,
      errors,
    },
  };
}

function validateEntryAssets(manifest: GameProjectManifest, warnings: string[]): void {
  const characters = new Set(manifest.assets.characters);
  const stages = new Set(manifest.assets.stages);
  if (!characters.has(manifest.entry.p1)) {
    warnings.push(`Entry P1 '${manifest.entry.p1}' is not listed in assets.characters`);
  }
  if (!characters.has(manifest.entry.p2)) {
    warnings.push(`Entry P2 '${manifest.entry.p2}' is not listed in assets.characters`);
  }
  if (!stages.has(manifest.entry.stage)) {
    warnings.push(`Entry stage '${manifest.entry.stage}' is not listed in assets.stages`);
  }
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}
