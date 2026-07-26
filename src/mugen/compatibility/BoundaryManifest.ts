/**
 * BoundaryManifest/v1 fail-closed (DA26-29).
 */

export const BOUNDARY_MANIFEST_SCHEMA = "BoundaryManifest/v1" as const;

export type BoundaryRootKind = "required" | "optional" | "planned";

export type BoundaryRootEntry = {
  path: string;
  kind: BoundaryRootKind;
  exists: boolean;
};

export type BoundaryManifest = {
  schema: typeof BOUNDARY_MANIFEST_SCHEMA;
  roots: BoundaryRootEntry[];
  allowlistTotalFiles: number;
  allowlistMax: number;
  forbiddenImportHits: string[];
  forbiddenTermHits: string[];
};

export type BoundaryManifestEvaluation = {
  ok: boolean;
  diagnostics: string[];
  manifest: BoundaryManifest;
};

export type BoundaryManifestInput = {
  roots: readonly { path: string; kind: BoundaryRootKind; exists: boolean }[];
  allowlistTotalFiles: number;
  /** Total-allowlist of an entire root fails when above this (default 0 for fail-closed empty allowlist). */
  allowlistMax?: number;
  forbiddenImportHits?: readonly string[];
  forbiddenTermHits?: readonly string[];
};

export function evaluateBoundaryManifest(input: BoundaryManifestInput): BoundaryManifestEvaluation {
  const diagnostics: string[] = [];
  const allowlistMax = input.allowlistMax ?? 0;
  const roots = input.roots.map((root) => ({
    path: root.path,
    kind: root.kind,
    exists: root.exists === true,
  }));

  for (const root of roots) {
    if (root.kind === "required" && !root.exists) {
      diagnostics.push(`required-missing:${root.path}`);
    }
    // planned roots never contribute pass claims when missing
  }

  if (input.allowlistTotalFiles > allowlistMax) {
    diagnostics.push(`allowlist-total-exceeded:${input.allowlistTotalFiles}>${allowlistMax}`);
  }
  for (const hit of input.forbiddenImportHits ?? []) {
    diagnostics.push(`forbidden-import:${hit}`);
  }
  for (const hit of input.forbiddenTermHits ?? []) {
    diagnostics.push(`forbidden-term:${hit}`);
  }

  const manifest: BoundaryManifest = {
    schema: BOUNDARY_MANIFEST_SCHEMA,
    roots: roots.sort((a, b) => a.path.localeCompare(b.path)),
    allowlistTotalFiles: input.allowlistTotalFiles,
    allowlistMax,
    forbiddenImportHits: [...(input.forbiddenImportHits ?? [])].sort(),
    forbiddenTermHits: [...(input.forbiddenTermHits ?? [])].sort(),
  };

  return {
    ok: diagnostics.length === 0,
    diagnostics: diagnostics.sort(),
    manifest,
  };
}

/** Default repo layout for modularization readiness (does not invent missing dirs as present). */
export function defaultBoundaryRoots(exists: (path: string) => boolean): BoundaryRootEntry[] {
  return [
    { path: "src/core", kind: "required", exists: exists("src/core") },
    { path: "src/engine", kind: "required", exists: exists("src/engine") },
    { path: "src/mugen", kind: "optional", exists: exists("src/mugen") },
    { path: "src/app", kind: "optional", exists: exists("src/app") },
    { path: "src/modules/platformer", kind: "planned", exists: exists("src/modules/platformer") },
  ];
}
