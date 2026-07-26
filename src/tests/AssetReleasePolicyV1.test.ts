import { describe, expect, it } from "vitest";
import {
  createAssetReleasePolicyV1,
  evaluateDualAssetReleaseChains,
  type AssetReleasePolicyV1Evidence,
  type AssetReleasePolicyV1Input,
} from "../app/AssetReleasePolicyV1";

function fullEvidence(prefix: string): AssetReleasePolicyV1Evidence[] {
  return (
    ["provenance", "policy", "transforms", "qa", "collision", "playtest", "reopen"] as const
  ).map((phase) => ({
    phase,
    status: "pass" as const,
    reference: `${prefix}/${phase}`,
    digest: `${prefix}-${phase}`,
  }));
}

function chain(overrides: Partial<AssetReleasePolicyV1Input> & Pick<AssetReleasePolicyV1Input, "policyId" | "assetId" | "chainId">): AssetReleasePolicyV1Input {
  return {
    assetLabel: overrides.assetLabel ?? overrides.assetId,
    projectRevision: overrides.projectRevision ?? 1,
    assetRevision: overrides.assetRevision ?? 1,
    evidence: overrides.evidence ?? fullEvidence(overrides.chainId),
    ...overrides,
  };
}

describe("AssetReleasePolicyV1", () => {
  it("requires every release phase to pass", () => {
    const ready = createAssetReleasePolicyV1(chain({
      policyId: "pol-a",
      assetId: "asset-a",
      chainId: "chain-a",
    }));
    expect(ready.canRelease).toBe(true);
    expect(ready.status).toBe("ready");

    const blocked = createAssetReleasePolicyV1(chain({
      policyId: "pol-b",
      assetId: "asset-b",
      chainId: "chain-b",
      evidence: fullEvidence("chain-b").map((item) =>
        item.phase === "playtest" ? { ...item, status: "fail" } : item,
      ),
    }));
    expect(blocked.canRelease).toBe(false);
    expect(blocked.blockedBy.some((item) => item.startsWith("playtest:"))).toBe(true);
  });

  it("keeps two named asset chains independent", () => {
    const dual = evaluateDualAssetReleaseChains(
      chain({ policyId: "pol-nova", assetId: "nova-fx", chainId: "nova-chain", assetLabel: "Nova FX" }),
      chain({ policyId: "pol-spark", assetId: "spark-fx", chainId: "spark-chain", assetLabel: "Spark FX" }),
    );
    expect(dual.independent).toBe(true);
    expect(dual.first.canRelease).toBe(true);
    expect(dual.second.canRelease).toBe(true);
    expect(dual.first.integrity).not.toBe(dual.second.integrity);
  });

  it("flags shared identities as non-independent", () => {
    const dual = evaluateDualAssetReleaseChains(
      chain({ policyId: "same", assetId: "a", chainId: "c1" }),
      chain({ policyId: "same", assetId: "b", chainId: "c2" }),
    );
    expect(dual.independent).toBe(false);
    expect(dual.diagnostics).toContain("shared-policy-id");
  });
});
