import type { GameProjectManifest, StudioGateRecord, StudioProjectSummary } from "./StudioModel";

export type RuntimeModuleStatus = "active" | "planned" | "missing";

export type RuntimeModuleRecord = {
  id: string;
  label: string;
  status: RuntimeModuleStatus;
  role: "simulation" | "render" | "pipeline" | "studio" | "genre";
  detail: string;
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

const KNOWN_MODULES: Record<string, Omit<RuntimeModuleRecord, "id">> = {
  "mugen-compat": {
    label: "MUGEN/Ikemen Fighting Module",
    status: "active",
    role: "simulation",
    detail: "Loads the current fighting runtime, command buffer, state subset, hit boxes, and match loop.",
  },
  "three-render": {
    label: "Three.js Render Adapter",
    status: "active",
    role: "render",
    detail: "Consumes runtime snapshots through an orthographic Three.js scene adapter.",
  },
  "studio-workspace": {
    label: "Studio Workspace",
    status: "active",
    role: "studio",
    detail: "Provides project metadata, browser-local storage, diagnostics, and build/export entry points.",
  },
  "asset-pipeline": {
    label: "Generated Asset Pipeline",
    status: "planned",
    role: "pipeline",
    detail: "Atlas assets are loadable today, but project-scoped source/generated/runtime compilation is still partial.",
  },
  "platformer-module": {
    label: "Platformer Module",
    status: "planned",
    role: "genre",
    detail: "Future module target; not executable by the current fighting runtime.",
  },
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
    const known = KNOWN_MODULES[moduleId];
    if (!known) {
      const record: RuntimeModuleRecord = {
        id: moduleId,
        label: moduleId,
        status: "missing",
        role: "genre",
        detail: "No compiler/runtime adapter is registered for this module id.",
      };
      missing.push(record);
      warnings.push(`Module '${moduleId}' is not registered in the runtime compiler`);
      continue;
    }

    const record = { id: moduleId, ...known };
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
