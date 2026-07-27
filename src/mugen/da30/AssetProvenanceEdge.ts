/**
 * DA30-082: materialize permission/license decisions for shipped asset edges.
 */

export type ProvenanceStatus = "repository-authored" | "generated" | "allowed" | "forbidden" | "unknown";

export type AssetProvenanceEdge = {
  path: string;
  status: ProvenanceStatus;
  license: string;
  attribution: string;
  evidence: string;
  constraints: string[];
  scope: string;
};

export function decideAssetInclusion(edge: AssetProvenanceEdge): {
  include: boolean;
  reason: string;
} {
  if (edge.status === "forbidden" || edge.status === "unknown") {
    return { include: false, reason: `status ${edge.status} blocks inclusion` };
  }
  if (!edge.license.trim()) return { include: false, reason: "missing license" };
  if (!edge.evidence.trim()) return { include: false, reason: "missing evidence" };
  if (edge.constraints.includes("commercial-only")) {
    return { include: false, reason: "commercial-only constraint" };
  }
  return { include: true, reason: "permitted" };
}

export function shippedAssetEdgesFixture(): AssetProvenanceEdge[] {
  return [
    {
      path: "public/characters/nova-boxer/mugen/nova.cns",
      status: "repository-authored",
      license: "CC0-1.0",
      attribution: "repo authors",
      evidence: "public/characters/nova-boxer/README.md",
      constraints: [],
      scope: "runtime-package",
    },
    {
      path: "public/stages/rooftop-dojo/rooftop-dojo.png",
      status: "repository-authored",
      license: "CC0-1.0",
      attribution: "repo authors",
      evidence: "public/stages/rooftop-dojo/README.md",
      constraints: [],
      scope: "stage",
    },
    {
      path: "external/commercial-char.zip",
      status: "forbidden",
      license: "unknown",
      attribution: "",
      evidence: "policy",
      constraints: ["commercial-only"],
      scope: "metadata-only",
    },
    {
      path: "mystery/asset.png",
      status: "unknown",
      license: "",
      attribution: "",
      evidence: "",
      constraints: [],
      scope: "metadata-only",
    },
  ];
}
