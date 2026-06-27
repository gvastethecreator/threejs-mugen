export type EngineModuleStatus = "active" | "planned";

export type EngineModuleRole = "simulation" | "render" | "pipeline" | "studio" | "genre";

export type SharedEngineContractId =
  | "input/v0"
  | "asset/v0"
  | "snapshot/v0"
  | "render/v0"
  | "audio/v0"
  | "debug/v0"
  | "build/v0"
  | "qa/v0";

export type EngineModuleContract = {
  id: string;
  label: string;
  status: EngineModuleStatus;
  role: EngineModuleRole;
  detail: string;
  consumes: SharedEngineContractId[];
  provides: SharedEngineContractId[];
  allowedLegacyConcepts: string[];
  forbiddenSharedCoreConcepts: string[];
  claimAllowed: string;
  claimBlocked: string;
};

export type SharedEngineContractReport = {
  schemaVersion: "mugen-web-sandbox/shared-engine-contracts/v0";
  sharedContracts: SharedEngineContractId[];
  moduleContracts: EngineModuleContract[];
  boundaries: {
    sharedCoreForbidden: string[];
    platformerForbidden: string[];
  };
};

export const SHARED_ENGINE_CONTRACTS: SharedEngineContractId[] = [
  "input/v0",
  "asset/v0",
  "snapshot/v0",
  "render/v0",
  "audio/v0",
  "debug/v0",
  "build/v0",
  "qa/v0",
];

export const SHARED_CORE_FORBIDDEN_LEGACY_CONCEPTS = [
  "CNS",
  "CMD",
  "HitDef",
  "round",
  "helper",
  "projectile",
  "explod",
  "target",
  "MUGEN command routing",
  "IKEMEN ZSS",
];

export const PLATFORMER_MODULE_FORBIDDEN_LEGACY_CONCEPTS = [
  "CNS",
  "HitDef",
  "round",
  "helper",
  "MUGEN command routing",
];

const MODULE_CONTRACTS: Record<string, EngineModuleContract> = {
  "mugen-compat": {
    id: "mugen-compat",
    label: "MUGEN/Ikemen Fighting Module",
    status: "active",
    role: "simulation",
    detail: "Loads the current fighting runtime, command buffer, state subset, hit boxes, and match loop.",
    consumes: ["input/v0", "asset/v0", "build/v0", "qa/v0"],
    provides: ["snapshot/v0", "audio/v0", "debug/v0"],
    allowedLegacyConcepts: ["CNS", "CMD", "HitDef", "round", "helper", "projectile", "explod", "target"],
    forbiddenSharedCoreConcepts: [],
    claimAllowed: "May own fighting-specific MUGEN compatibility behavior behind module boundaries.",
    claimBlocked: "Must not be treated as shared core or required by future non-fighting modules.",
  },
  "three-render": {
    id: "three-render",
    label: "Three.js Render Adapter",
    status: "active",
    role: "render",
    detail: "Consumes runtime snapshots through an orthographic Three.js scene adapter.",
    consumes: ["asset/v0", "snapshot/v0", "debug/v0"],
    provides: ["render/v0"],
    allowedLegacyConcepts: [],
    forbiddenSharedCoreConcepts: SHARED_CORE_FORBIDDEN_LEGACY_CONCEPTS,
    claimAllowed: "May render shared snapshots and module-provided assets.",
    claimBlocked: "Must not parse CNS/CMD, evaluate HitDef, or route MUGEN commands.",
  },
  "studio-workspace": {
    id: "studio-workspace",
    label: "Studio Workspace",
    status: "active",
    role: "studio",
    detail: "Provides project metadata, browser-local storage, diagnostics, and build/export entry points.",
    consumes: ["asset/v0", "snapshot/v0", "debug/v0", "build/v0", "qa/v0"],
    provides: ["build/v0", "qa/v0"],
    allowedLegacyConcepts: [],
    forbiddenSharedCoreConcepts: SHARED_CORE_FORBIDDEN_LEGACY_CONCEPTS,
    claimAllowed: "May inspect module evidence and package project contracts.",
    claimBlocked: "Must not become the runtime owner of MUGEN state logic or future platformer simulation.",
  },
  "asset-pipeline": {
    id: "asset-pipeline",
    label: "Generated Asset Pipeline",
    status: "planned",
    role: "pipeline",
    detail: "Atlas assets are loadable today, but project-scoped source/generated/runtime compilation is still partial.",
    consumes: ["build/v0", "qa/v0"],
    provides: ["asset/v0"],
    allowedLegacyConcepts: [],
    forbiddenSharedCoreConcepts: SHARED_CORE_FORBIDDEN_LEGACY_CONCEPTS,
    claimAllowed: "May provide source, generated, converted, and QA asset records to any module.",
    claimBlocked: "Must not hardcode fighting-only states or repair generated sprites by cropping bad motion.",
  },
  "platformer-module": {
    id: "platformer-module",
    label: "Platformer Module",
    status: "planned",
    role: "genre",
    detail: "Future module target; not executable by the current fighting runtime.",
    consumes: ["input/v0", "asset/v0", "build/v0", "qa/v0"],
    provides: ["snapshot/v0", "audio/v0", "debug/v0"],
    allowedLegacyConcepts: [],
    forbiddenSharedCoreConcepts: PLATFORMER_MODULE_FORBIDDEN_LEGACY_CONCEPTS,
    claimAllowed: "May later implement tile collision, camera, hazards, checkpoints, and platformer snapshots using shared contracts.",
    claimBlocked: "Cannot depend on CNS, HitDef, rounds, helpers, or MUGEN command routing.",
  },
};

export function getEngineModuleContract(id: string): EngineModuleContract | undefined {
  return MODULE_CONTRACTS[id];
}

export function listEngineModuleContracts(): EngineModuleContract[] {
  return Object.values(MODULE_CONTRACTS);
}

export function buildSharedEngineContractReport(moduleIds: string[]): SharedEngineContractReport {
  const requested = new Set(moduleIds);
  return {
    schemaVersion: "mugen-web-sandbox/shared-engine-contracts/v0",
    sharedContracts: [...SHARED_ENGINE_CONTRACTS],
    moduleContracts: listEngineModuleContracts().filter((contract) => requested.has(contract.id)),
    boundaries: {
      sharedCoreForbidden: [...SHARED_CORE_FORBIDDEN_LEGACY_CONCEPTS],
      platformerForbidden: [...PLATFORMER_MODULE_FORBIDDEN_LEGACY_CONCEPTS],
    },
  };
}
