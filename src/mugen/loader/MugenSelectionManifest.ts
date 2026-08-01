import { basename, normalizeVirtualPath, PathResolver } from "./PathResolver";
import type { VirtualFileSystem } from "./VirtualFileSystem";
import { parseTextLines, unquote } from "../parsers/text";

export const MUGEN_SELECTION_MANIFEST_SCHEMA = "MugenSelectionManifest/v0" as const;

export type MugenSelectionManifestEntryKind = "character" | "stage";
export type MugenSelectionManifestEntryStatus =
  | "resolved"
  | "missing"
  | "unsafe"
  | "duplicate"
  | "unsupported"
  | "malformed";

export type MugenSelectionManifestLocation = {
  path: string;
  line: number;
};

export type MugenSelectionManifestFingerprint = {
  algorithm: "sha-256";
  digest: string;
  byteLength: number;
};

export type MugenSelectionManifestSourceFingerprint = {
  algorithm: "sha-256";
  digest: string;
  files?: readonly {
    path: string;
    digest: string;
    byteLength: number;
  }[];
};

export type MugenSelectionManifestEntry = {
  id: string;
  kind: MugenSelectionManifestEntryKind;
  order: number;
  location: MugenSelectionManifestLocation;
  raw: string;
  reference: string;
  options?: string;
  status: MugenSelectionManifestEntryStatus;
  resolvedPath?: string;
  duplicateOf?: string;
};

export type MugenSelectionManifestDiagnostic = {
  code: "unsafe-reference" | "missing-entry" | "duplicate-entry" | "unsupported-entry" | "malformed-entry";
  location: MugenSelectionManifestLocation;
  message: string;
};

export type MugenSelectionManifest = {
  schemaVersion: typeof MUGEN_SELECTION_MANIFEST_SCHEMA;
  source: {
    path: string;
    fingerprint?: MugenSelectionManifestFingerprint;
    packageDigest?: string;
  };
  characters: MugenSelectionManifestEntry[];
  stages: MugenSelectionManifestEntry[];
  playable: {
    characters: string[];
    stages: string[];
    ready: boolean;
  };
  diagnostics: MugenSelectionManifestDiagnostic[];
};

export type CreateMugenSelectionManifestInput = {
  vfs: VirtualFileSystem;
  sourceFingerprint?: MugenSelectionManifestSourceFingerprint;
  selectPath?: string;
};

/**
 * Parses only the direct character and stage rows needed by the first
 * select.def launch route. Controls remain source-visible but non-runnable.
 */
export function createMugenSelectionManifest(
  input: CreateMugenSelectionManifestInput,
): MugenSelectionManifest | undefined {
  const resolver = new PathResolver(input.vfs.listFiles());
  const selectPath = resolveSelectPath(input.selectPath, resolver);
  if (!selectPath) {
    return undefined;
  }

  const sourceFingerprint = selectionFileFingerprint(selectPath, input.sourceFingerprint);
  const characters: MugenSelectionManifestEntry[] = [];
  const stages: MugenSelectionManifestEntry[] = [];
  const diagnostics: MugenSelectionManifestDiagnostic[] = [];
  const seen = {
    character: new Map<string, string>(),
    stage: new Map<string, string>(),
  };
  let section: MugenSelectionManifestEntryKind | undefined;

  for (const line of parseTextLines(input.vfs.readText(selectPath) ?? "")) {
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line.content);
    if (sectionMatch) {
      const name = sectionMatch[1]?.trim().toLowerCase();
      section = name === "characters" ? "character" : name === "stages" ? "stage" : undefined;
      continue;
    }
    if (!section || !line.content) {
      continue;
    }

    const entries = section === "character" ? characters : stages;
    const entry = parseSelectionEntry({
      kind: section,
      order: entries.length,
      sourcePath: selectPath,
      raw: line.raw,
      content: line.content,
      line: line.number,
      resolver,
      seen: seen[section],
      diagnostics,
    });
    entries.push(entry);
  }

  const playableCharacters = characters
    .filter((entry) => entry.status === "resolved" && entry.resolvedPath)
    .map((entry) => entry.resolvedPath!);
  const playableStages = stages
    .filter((entry) => entry.status === "resolved" && entry.resolvedPath)
    .map((entry) => entry.resolvedPath!);

  return {
    schemaVersion: MUGEN_SELECTION_MANIFEST_SCHEMA,
    source: {
      path: selectPath,
      ...(sourceFingerprint ? { fingerprint: sourceFingerprint } : {}),
      ...(input.sourceFingerprint?.digest ? { packageDigest: input.sourceFingerprint.digest } : {}),
    },
    characters,
    stages,
    playable: {
      characters: playableCharacters,
      stages: playableStages,
      ready: playableCharacters.length >= 2 && playableStages.length >= 1,
    },
    diagnostics,
  };
}

export function resolvedMugenSelectionEntries(
  manifest: MugenSelectionManifest,
  kind: MugenSelectionManifestEntryKind,
): MugenSelectionManifestEntry[] {
  return (kind === "character" ? manifest.characters : manifest.stages)
    .filter((entry) => entry.status === "resolved" && entry.resolvedPath);
}

function resolveSelectPath(requestedPath: string | undefined, resolver: PathResolver): string | undefined {
  if (requestedPath) {
    const resolved = resolver.resolve("", requestedPath);
    return resolved && resolver.exists(resolved) ? resolved : undefined;
  }
  const candidates = resolver.findByBasename("select.def");
  return candidates.find((path) => {
    const lower = path.toLowerCase();
    return lower === "data/select.def" || lower.endsWith("/data/select.def");
  }) ?? candidates[0];
}

function selectionFileFingerprint(
  selectPath: string,
  sourceFingerprint: MugenSelectionManifestSourceFingerprint | undefined,
): MugenSelectionManifestFingerprint | undefined {
  const file = sourceFingerprint?.files?.find(
    (candidate) => normalizeVirtualPath(candidate.path).toLowerCase() === selectPath.toLowerCase(),
  );
  return file
    ? {
        algorithm: sourceFingerprint!.algorithm,
        digest: file.digest,
        byteLength: file.byteLength,
      }
    : undefined;
}

function parseSelectionEntry(input: {
  kind: MugenSelectionManifestEntryKind;
  order: number;
  sourcePath: string;
  raw: string;
  content: string;
  line: number;
  resolver: PathResolver;
  seen: Map<string, string>;
  diagnostics: MugenSelectionManifestDiagnostic[];
}): MugenSelectionManifestEntry {
  const [reference, options] = splitSelectionRow(input.content);
  const id = input.kind + "-" + String(input.order + 1);
  const location = { path: input.sourcePath, line: input.line };
  const base = {
    id,
    kind: input.kind,
    order: input.order,
    location,
    raw: input.raw,
    reference,
    ...(options ? { options } : {}),
  } satisfies Omit<MugenSelectionManifestEntry, "status" | "resolvedPath" | "duplicateOf">;

  if (!reference || reference.includes("=")) {
    input.diagnostics.push({
      code: "malformed-entry",
      location,
      message: "Selection entry has no direct character or stage reference.",
    });
    return { ...base, status: "malformed" };
  }
  if (isSelectionControl(reference)) {
    input.diagnostics.push({
      code: "unsupported-entry",
      location,
      message: "Selection control '" + reference + "' is recognized but not executable in MugenSelectionManifest/v0.",
    });
    return { ...base, status: "unsupported" };
  }
  if (isUnsafeReference(reference)) {
    input.diagnostics.push({
      code: "unsafe-reference",
      location,
      message: "Selection reference '" + reference + "' is absolute or traversal-like and was not resolved.",
    });
    return { ...base, status: "unsafe" };
  }

  const resolvedPath = resolveSelectionReference(reference, input.kind, input.resolver);
  if (!resolvedPath) {
    input.diagnostics.push({
      code: "missing-entry",
      location,
      message: "Selection reference '" + reference + "' does not resolve to a package definition.",
    });
    return { ...base, status: "missing" };
  }

  const duplicateOf = input.seen.get(resolvedPath.toLowerCase());
  if (duplicateOf) {
    input.diagnostics.push({
      code: "duplicate-entry",
      location,
      message: "Selection reference '" + reference + "' duplicates " + duplicateOf + "; first resolved entry remains runnable.",
    });
    return { ...base, status: "duplicate", resolvedPath, duplicateOf };
  }
  input.seen.set(resolvedPath.toLowerCase(), id);
  return { ...base, status: "resolved", resolvedPath };
}

function splitSelectionRow(content: string): [string, string | undefined] {
  const comma = content.indexOf(",");
  const rawReference = comma >= 0 ? content.slice(0, comma) : content;
  const rawOptions = comma >= 0 ? content.slice(comma + 1).trim() : "";
  return [unquote(rawReference).trim(), rawOptions || undefined];
}

function isSelectionControl(reference: string): boolean {
  return /^(randomselect|random|none)$/i.test(reference);
}

function isUnsafeReference(reference: string): boolean {
  const normalized = reference.trim().replace(/\\/g, "/");
  return (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-z]:/i.test(normalized) ||
    normalized.split("/").some((part) => part === "..") ||
    normalized.includes("\0")
  );
}

function resolveSelectionReference(
  reference: string,
  kind: MugenSelectionManifestEntryKind,
  resolver: PathResolver,
): string | undefined {
  const normalized = normalizeVirtualPath(reference);
  const prefix = kind === "character" ? "chars" : "stages";
  const name = basename(normalized);
  const withDef = normalized.toLowerCase().endsWith(".def") ? normalized : normalized + ".def";
  const candidates = [
    normalized,
    withDef,
    normalizeVirtualPath(prefix + "/" + normalized),
    normalizeVirtualPath(prefix + "/" + withDef),
    normalizeVirtualPath(prefix + "/" + normalized + "/" + name + ".def"),
  ];
  return candidates.find((candidate) => resolver.exists(candidate));
}
