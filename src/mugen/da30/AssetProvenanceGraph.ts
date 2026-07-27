/**
 * DA30-081/082: asset provenance graph nodes and release block on unknown.
 */

export type ProvenanceNode = {
  assetId: string;
  source: string;
  license: "repository-authored" | "generated" | "allowed" | "unknown" | "forbidden";
  creatorTool: string;
  prompt?: string;
  transformChain: string[];
  digest: string;
  consumer: string;
  revision: string;
  releaseState: "blocked" | "allowed";
};

export function evaluateAssetRelease(nodes: ProvenanceNode[]): {
  allow: boolean;
  blocked: string[];
} {
  const blocked: string[] = [];
  for (const n of nodes) {
    if (n.license === "unknown" || n.license === "forbidden") {
      blocked.push(n.assetId);
      continue;
    }
    if (n.releaseState === "blocked") blocked.push(n.assetId);
    if (!n.digest) blocked.push(n.assetId);
  }
  return { allow: blocked.length === 0, blocked };
}
