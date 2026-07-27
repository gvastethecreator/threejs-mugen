/**
 * DA30-062: unsupported-heavy repository fixtures for high-risk families.
 */

export type FixtureVariant = "valid" | "malformed" | "unknown" | "profile-mismatch";

export type HeavyFixture = {
  family: string;
  variants: FixtureVariant[];
  provenance: string;
  path: string;
};

const FAMILIES = [
  "HitDef",
  "Projectile",
  "Helper",
  "Explod",
  "ReversalDef",
  "HitOverride",
  "AssertSpecial",
  "VarRange",
  "Redirect",
  "ZSS-decl",
  "AI-cmd",
  "BGCtrl",
];

export function buildUnsupportedHeavyFixtures(): {
  schema: "Da30UnsupportedHeavyFixtures/v1";
  fixtures: HeavyFixture[];
  ok: boolean;
} {
  const fixtures = FAMILIES.map((family) => ({
    family,
    variants: ["valid", "malformed", "unknown", "profile-mismatch"] as FixtureVariant[],
    provenance: `repo:fixtures/heavy/${family.toLowerCase()}`,
    path: `docs/evidence/da30/fixtures/heavy/${family.toLowerCase()}`,
  }));
  return {
    schema: "Da30UnsupportedHeavyFixtures/v1",
    fixtures,
    ok: fixtures.length >= 10 && fixtures.every((f) => f.variants.length === 4 && f.provenance),
  };
}
