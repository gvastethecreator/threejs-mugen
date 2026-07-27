/**
 * DA30-106: local package and extension API surface design record.
 */

export type ApiSurface = {
  name: string;
  visibility: "public" | "private";
  versioned: boolean;
  capability: string;
  unstable: boolean;
};

export function definePackageExtensionApi(): {
  schema: "Da30PackageExtensionApi/v1";
  surfaces: ApiSurface[];
  ok: boolean;
  rules: string[];
} {
  const surfaces: ApiSurface[] = [
    { name: "@mugen/clock", visibility: "public", versioned: true, capability: "tick", unstable: false },
    { name: "@mugen/input", visibility: "public", versioned: true, capability: "seats", unstable: false },
    { name: "@mugen/renderer", visibility: "public", versioned: true, capability: "frame", unstable: false },
    { name: "@mugen/storage", visibility: "public", versioned: true, capability: "revision", unstable: false },
    { name: "@mugen/evidence", visibility: "public", versioned: true, capability: "facts", unstable: false },
    { name: "@mugen/internal/combat", visibility: "private", versioned: false, capability: "hitdef", unstable: true },
    { name: "@mugen/internal/dispatch", visibility: "private", versioned: false, capability: "controllers", unstable: true },
  ];
  return {
    schema: "Da30PackageExtensionApi/v1",
    surfaces,
    ok: surfaces.some((s) => s.visibility === "public") && surfaces.some((s) => s.visibility === "private"),
    rules: [
      "tree-shake public entrypoints",
      "private imports fail package smoke",
      "deprecation window for public only",
      "extension limits: no combat hooks",
    ],
  };
}
