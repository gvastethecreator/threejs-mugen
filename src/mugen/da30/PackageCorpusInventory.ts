/**
 * DA30-061: lawful package/stage corpus inventory classification.
 */

export type CorpusClass =
  | "repository-authored"
  | "generated"
  | "portable-legal"
  | "optional-private"
  | "forbidden";

export type CorpusRow = {
  id: string;
  class: CorpusClass;
  profile: string;
  featureDensity: "low" | "mid" | "high";
  route: string;
  permission: "include" | "metadata-only" | "exclude";
  expectedFailure?: string;
};

export function buildPackageCorpusInventory(): {
  schema: "Da30PackageCorpusInventory/v1";
  rows: CorpusRow[];
  ok: boolean;
} {
  const rows: CorpusRow[] = [
    {
      id: "nova-boxer",
      class: "repository-authored",
      profile: "mugen",
      featureDensity: "mid",
      route: "play",
      permission: "include",
    },
    {
      id: "mira-volt",
      class: "repository-authored",
      profile: "mugen",
      featureDensity: "mid",
      route: "play",
      permission: "include",
    },
    {
      id: "rook-apprentice",
      class: "repository-authored",
      profile: "mugen",
      featureDensity: "mid",
      route: "play",
      permission: "include",
    },
    {
      id: "rooftop-dojo",
      class: "repository-authored",
      profile: "mugen",
      featureDensity: "low",
      route: "stage",
      permission: "include",
    },
    {
      id: "gen-spark-sheet",
      class: "generated",
      profile: "sandbox",
      featureDensity: "low",
      route: "asset",
      permission: "include",
    },
    {
      id: "portable-kfm-style",
      class: "portable-legal",
      profile: "mugen",
      featureDensity: "high",
      route: "import-optional",
      permission: "metadata-only",
    },
    {
      id: "user-private-char",
      class: "optional-private",
      profile: "unknown",
      featureDensity: "high",
      route: "local-only",
      permission: "metadata-only",
    },
    {
      id: "commercial-sample",
      class: "forbidden",
      profile: "n/a",
      featureDensity: "high",
      route: "blocked",
      permission: "exclude",
      expectedFailure: "license-forbidden",
    },
  ];
  const classes = new Set(rows.map((r) => r.class));
  return {
    schema: "Da30PackageCorpusInventory/v1",
    rows,
    ok: classes.size >= 5 && rows.every((r) => r.id && r.permission),
  };
}
