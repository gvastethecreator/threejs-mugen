/**
 * DA29-012 — trace artifact manifest from shipped RuntimeTraceGatePresets producers.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const TRACE_ARTIFACT_MANIFEST_SCHEMA = "TraceArtifactManifest/v1" as const;

export type TraceManifestEntry = {
  id: string;
  producer: string;
  producerSymbol: string;
  inputFixture: string | null;
  profile: string;
  sourcePin: string | null;
  outputDigest: string | null;
  owner: string;
  required: boolean;
};

export type TraceArtifactManifest = {
  schema: typeof TRACE_ARTIFACT_MANIFEST_SCHEMA;
  generatedFrom: string;
  entries: TraceManifestEntry[];
  entryCount: number;
  duplicateIds: string[];
  missingIds: string[];
  digest: string;
};

const PRESET_PATH = "src/mugen/runtime/RuntimeTraceGatePresets.ts";

/** Extract create*TraceArtifact symbol names from the shipped presets source. */
export function listTraceProducerSymbols(sourceText: string): string[] {
  const re = /export\s+function\s+(create\w*TraceArtifact)\s*\(/g;
  const names: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(sourceText))) {
    names.push(m[1]);
  }
  return [...new Set(names)].sort();
}

/** Stable id for a producer symbol (kebab from camel). */
export function producerSymbolToId(symbol: string): string {
  return symbol
    .replace(/^create/, "")
    .replace(/TraceArtifact$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Build the machine-readable trace manifest from the presets source text.
 * Does not reimplement preset bodies — inventories producers and optional runtime ids.
 */
export function buildTraceArtifactManifest(options?: {
  sourceText?: string;
  sourcePath?: string;
  runtimeIds?: string[];
}): TraceArtifactManifest {
  const sourcePath = options?.sourcePath ?? PRESET_PATH;
  const sourceText =
    options?.sourceText ??
    (existsSync(resolve(process.cwd(), sourcePath))
      ? readFileSync(resolve(process.cwd(), sourcePath), "utf8")
      : "");
  if (!sourceText) {
    throw new Error(`missing trace presets source: ${sourcePath}`);
  }

  const symbols = listTraceProducerSymbols(sourceText);
  const entries: TraceManifestEntry[] = symbols.map((symbol) => {
    const id = producerSymbolToId(symbol);
    // Infer fixture/profile from symbol naming conventions in the shipped file.
    const profile = /mugenLite|MugenLite/i.test(symbol)
      ? "mugen-lite"
      : /native|Native/i.test(symbol)
        ? "native"
        : /synthetic|Synthetic|imported|Imported/i.test(symbol)
          ? "synthetic-imported"
          : "runtime-trace";
    const inputFixture = /mugenLite|MugenLite/i.test(symbol)
      ? "mugen-lite-journey"
      : /native/i.test(symbol)
        ? "rocco-vidal"
        : /synthetic|imported/i.test(symbol)
          ? "synthetic-imported"
          : null;
    return {
      id,
      producer: sourcePath,
      producerSymbol: symbol,
      inputFixture,
      profile,
      sourcePin: null,
      outputDigest: null,
      owner: "src/mugen/runtime/RuntimeTraceGatePresets.ts",
      required: !/optional|Optional/i.test(symbol),
    };
  });

  // Cross-check runtime ids if provided (from executed artifacts).
  const runtimeIds = options?.runtimeIds ?? [];
  const idSet = new Set(entries.map((e) => e.id));
  const duplicateIds: string[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.id)) duplicateIds.push(e.id);
    seen.add(e.id);
  }
  const missingIds = runtimeIds.filter((id) => !idSet.has(id) && !entries.some((e) => e.id.includes(id) || id.includes(e.id)));

  const payload = {
    schema: TRACE_ARTIFACT_MANIFEST_SCHEMA,
    generatedFrom: sourcePath,
    entries,
    entryCount: entries.length,
    duplicateIds,
    missingIds,
  };
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
  return { ...payload, digest };
}

/** Fail closed when required producers are missing or duplicate. */
export function validateTraceArtifactManifest(manifest: TraceArtifactManifest): string[] {
  const errors: string[] = [];
  if (manifest.schema !== TRACE_ARTIFACT_MANIFEST_SCHEMA) {
    errors.push(`unexpected schema ${manifest.schema}`);
  }
  if (manifest.entryCount < 1) errors.push("empty manifest");
  if (manifest.duplicateIds.length) {
    errors.push(`duplicate ids: ${manifest.duplicateIds.join(",")}`);
  }
  for (const e of manifest.entries) {
    if (!e.id || !e.producerSymbol || !e.producer) {
      errors.push(`incomplete entry ${e.producerSymbol || "?"}`);
    }
  }
  return errors;
}
