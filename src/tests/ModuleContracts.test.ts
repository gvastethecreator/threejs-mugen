import { describe, expect, it } from "vitest";
import {
  buildSharedEngineContractReport,
  getEngineModuleContract,
  listEngineModuleContracts,
  PLATFORMER_MODULE_FORBIDDEN_LEGACY_CONCEPTS,
  SHARED_CORE_FORBIDDEN_LEGACY_CONCEPTS,
} from "../engine/ModuleContracts";

describe("ModuleContracts", () => {
  it("keeps shared core boundaries free of fighting-only legacy concepts", () => {
    expect(SHARED_CORE_FORBIDDEN_LEGACY_CONCEPTS).toEqual(
      expect.arrayContaining(["CNS", "CMD", "HitDef", "round", "helper", "projectile", "explod", "target", "MUGEN command routing", "IKEMEN ZSS"]),
    );

    const sharedConsumers = listEngineModuleContracts().filter((contract) => contract.id !== "mugen-compat");
    expect(sharedConsumers.length).toBeGreaterThan(0);
    expect(sharedConsumers.every((contract) => contract.allowedLegacyConcepts.length === 0)).toBe(true);
    expect(sharedConsumers.every((contract) => contract.claimBlocked.length > 0)).toBe(true);
  });

  it("keeps the future platformer module behind shared contracts instead of MUGEN runtime concepts", () => {
    const platformer = getEngineModuleContract("platformer-module");

    expect(platformer?.status).toBe("planned");
    expect(platformer?.role).toBe("genre");
    expect(platformer?.consumes).toEqual(["input/v0", "asset/v0", "build/v0", "qa/v0"]);
    expect(platformer?.provides).toEqual(["snapshot/v0", "audio/v0", "debug/v0"]);
    expect(platformer?.allowedLegacyConcepts).toEqual([]);
    expect(platformer?.forbiddenSharedCoreConcepts).toEqual(PLATFORMER_MODULE_FORBIDDEN_LEGACY_CONCEPTS);
    expect(platformer?.claimBlocked).toContain("CNS");
    expect(platformer?.claimBlocked).toContain("HitDef");
  });

  it("builds a runtime-exportable shared contract report for requested modules", () => {
    const report = buildSharedEngineContractReport(["mugen-compat", "platformer-module", "unknown-module"]);

    expect(report.schemaVersion).toBe("mugen-web-sandbox/shared-engine-contracts/v0");
    expect(report.moduleContracts.map((contract) => contract.id)).toEqual(["mugen-compat", "platformer-module"]);
    expect(report.boundaries.platformerForbidden).toEqual(expect.arrayContaining(["CNS", "HitDef", "round", "helper"]));
    expect(report.verificationCommands.boundary).toBe("pnpm check:boundaries");
  });
});
