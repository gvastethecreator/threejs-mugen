/**
 * SecondCharacterReadiness/v1 (DA26-20 bounded).
 * Two named independent legal character chains without per-character adapters.
 * Claim blocked: full import/walk/jump/hit/guard/KO browser journey for both.
 */

export const SECOND_CHARACTER_READINESS_SCHEMA = "SecondCharacterReadiness/v1" as const;

export type CharacterLegalPackage = {
  id: string;
  name: string;
  licenseSpdx: string;
  licenseVerified: boolean;
  entryDef: string;
  packageDigest: string;
  routes: readonly string[];
  adapterId?: string;
};

export type SecondCharacterReadiness = {
  schema: typeof SECOND_CHARACTER_READINESS_SCHEMA;
  first: CharacterLegalPackage;
  second: CharacterLegalPackage;
  independent: boolean;
  sharedAdapter: boolean;
  canClaimTwoNamed: boolean;
  diagnostics: string[];
  integrity: string;
};

const REQUIRED_ROUTES = ["import", "walk", "jump", "hit", "guard", "ko"] as const;

export function evaluateSecondCharacterReadiness(
  first: CharacterLegalPackage,
  second: CharacterLegalPackage,
): SecondCharacterReadiness {
  const diagnostics: string[] = [];

  for (const [label, pkg] of [
    ["first", first],
    ["second", second],
  ] as const) {
    if (!pkg.id.trim()) diagnostics.push(`${label}:empty-id`);
    if (!pkg.name.trim()) diagnostics.push(`${label}:empty-name`);
    if (!pkg.licenseSpdx.trim()) diagnostics.push(`${label}:empty-license`);
    if (!pkg.licenseVerified) diagnostics.push(`${label}:license-unverified`);
    if (!pkg.entryDef.trim()) diagnostics.push(`${label}:empty-entry`);
    if (!pkg.packageDigest.trim()) diagnostics.push(`${label}:empty-digest`);
    for (const route of REQUIRED_ROUTES) {
      if (!pkg.routes.includes(route)) diagnostics.push(`${label}:missing-route:${route}`);
    }
  }

  if (first.id === second.id) diagnostics.push("shared-id");
  if (first.packageDigest === second.packageDigest) diagnostics.push("shared-package-digest");
  if (first.entryDef === second.entryDef) diagnostics.push("shared-entry-def");

  const sharedAdapter =
    Boolean(first.adapterId && second.adapterId && first.adapterId === second.adapterId) ||
    Boolean(first.adapterId || second.adapterId);
  // Independent means no shared identity and no per-character adapter coupling.
  if (first.adapterId || second.adapterId) {
    diagnostics.push("per-character-adapter-present");
  }

  const independent =
    first.id !== second.id &&
    first.packageDigest !== second.packageDigest &&
    first.entryDef !== second.entryDef &&
    !first.adapterId &&
    !second.adapterId;

  const canClaimTwoNamed =
    independent &&
    diagnostics.filter((d) => !d.startsWith("per-character")).length === 0 &&
    first.licenseVerified &&
    second.licenseVerified;

  const payload = {
    schema: SECOND_CHARACTER_READINESS_SCHEMA,
    first: { ...first, routes: [...first.routes] },
    second: { ...second, routes: [...second.routes] },
    independent,
    sharedAdapter,
    canClaimTwoNamed,
    diagnostics: [...diagnostics].sort(),
  };

  return {
    ...payload,
    integrity: stableHash(stableStringify(payload)),
  };
}

/** Named dual package pair used for DA26-20 unit claim (Nova + Mira). */
export function sandboxDualCharacterPackages(): {
  first: CharacterLegalPackage;
  second: CharacterLegalPackage;
} {
  return {
    first: {
      id: "nova-boxer",
      name: "Nova Boxer",
      licenseSpdx: "CC0-1.0",
      licenseVerified: true,
      entryDef: "public/characters/nova-boxer/mugen/nova.def",
      packageDigest: "nova-package-v1",
      routes: ["import", "walk", "jump", "hit", "guard", "ko"],
    },
    second: {
      id: "mira-volt",
      name: "Mira Volt",
      licenseSpdx: "CC0-1.0",
      licenseVerified: true,
      entryDef: "public/characters/mira-volt/mugen/mira.def",
      packageDigest: "mira-package-v1",
      routes: ["import", "walk", "jump", "hit", "guard", "ko"],
    },
  };
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
