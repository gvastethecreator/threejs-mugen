/**
 * AssetReleasePolicy/v1 + dual independent chains (DA26-28 bounded).
 * Two named asset release chains must not share provenance/policy identity.
 * Claim blocked: full Studio release UI and real binary transforms.
 */

export const ASSET_RELEASE_POLICY_V1_SCHEMA = "AssetReleasePolicy/v1" as const;

export type AssetReleasePolicyV1Phase =
  | "provenance"
  | "policy"
  | "transforms"
  | "qa"
  | "collision"
  | "playtest"
  | "reopen";

export type AssetReleasePolicyV1Evidence = {
  phase: AssetReleasePolicyV1Phase;
  status: "pass" | "fail" | "missing";
  reference: string;
  digest?: string;
};

export type AssetReleasePolicyV1Record = {
  schema: typeof ASSET_RELEASE_POLICY_V1_SCHEMA;
  policyId: string;
  assetId: string;
  assetLabel: string;
  projectRevision: number;
  assetRevision: number;
  chainId: string;
  evidence: AssetReleasePolicyV1Evidence[];
  status: "ready" | "blocked";
  canRelease: boolean;
  blockedBy: string[];
  integrity: string;
};

export type AssetReleasePolicyV1Input = {
  policyId: string;
  assetId: string;
  assetLabel: string;
  projectRevision: number;
  assetRevision: number;
  chainId: string;
  evidence: readonly AssetReleasePolicyV1Evidence[];
};

export type DualAssetReleaseEvaluation = {
  first: AssetReleasePolicyV1Record;
  second: AssetReleasePolicyV1Record;
  independent: boolean;
  diagnostics: string[];
};

const REQUIRED_PHASES: AssetReleasePolicyV1Phase[] = [
  "provenance",
  "policy",
  "transforms",
  "qa",
  "collision",
  "playtest",
  "reopen",
];

export function createAssetReleasePolicyV1(
  input: AssetReleasePolicyV1Input,
): AssetReleasePolicyV1Record {
  const evidence = [...input.evidence].map((item) => ({ ...item }));
  const blockedBy: string[] = [];

  for (const phase of REQUIRED_PHASES) {
    const matches = evidence.filter((item) => item.phase === phase);
    if (matches.length === 0) {
      blockedBy.push(`${phase}:missing`);
      continue;
    }
    for (const item of matches) {
      if (item.status !== "pass") blockedBy.push(`${phase}:${item.status}`);
      if (!item.reference.trim()) blockedBy.push(`${phase}:empty-reference`);
    }
  }

  if (input.projectRevision < 1) blockedBy.push("project-revision");
  if (input.assetRevision < 1) blockedBy.push("asset-revision");
  if (!input.chainId.trim()) blockedBy.push("empty-chain");

  const payload: Omit<AssetReleasePolicyV1Record, "integrity"> = {
    schema: ASSET_RELEASE_POLICY_V1_SCHEMA,
    policyId: input.policyId.trim(),
    assetId: input.assetId.trim(),
    assetLabel: input.assetLabel.trim(),
    projectRevision: input.projectRevision,
    assetRevision: input.assetRevision,
    chainId: input.chainId.trim(),
    evidence,
    status: blockedBy.length === 0 ? "ready" : "blocked",
    canRelease: blockedBy.length === 0,
    blockedBy,
  };

  return {
    ...payload,
    integrity: stableHash(stableStringify(payload)),
  };
}

/** Prove two release chains stay independent (no shared policy/asset/chain identity). */
export function evaluateDualAssetReleaseChains(
  firstInput: AssetReleasePolicyV1Input,
  secondInput: AssetReleasePolicyV1Input,
): DualAssetReleaseEvaluation {
  const first = createAssetReleasePolicyV1(firstInput);
  const second = createAssetReleasePolicyV1(secondInput);
  const diagnostics: string[] = [];

  if (first.assetId === second.assetId) diagnostics.push("shared-asset-id");
  if (first.policyId === second.policyId) diagnostics.push("shared-policy-id");
  if (first.chainId === second.chainId) diagnostics.push("shared-chain-id");
  if (first.integrity === second.integrity) diagnostics.push("shared-integrity");

  // Independent means identities differ; both may still be ready.
  const independent = diagnostics.length === 0;
  return { first, second, independent, diagnostics };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
