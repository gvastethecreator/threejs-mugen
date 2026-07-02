import type { MugenDiagnostic } from "../model/MugenAnimation";
import type { MugenCharacterDef } from "../model/MugenCharacter";
import type { MugenSystemAssets, MugenSystemHitSparkLibrary, MugenSystemHitSparkLibrarySource } from "../model/MugenSystemAssets";
import { parseAir } from "../parsers/AirParser";
import { parseDef } from "../parsers/DefParser";
import { SffParser } from "../parsers/SffParser";
import type { PathResolver } from "./PathResolver";
import type { VirtualFileSystem } from "./VirtualFileSystem";

export type MugenSystemAssetsLoaderOptions = {
  characterDefPath?: string;
  characterDefinition?: MugenCharacterDef;
};

export async function loadMugenSystemAssets(
  vfs: VirtualFileSystem,
  resolver: PathResolver,
  options: MugenSystemAssetsLoaderOptions = {},
): Promise<MugenSystemAssets | undefined> {
  const diagnostics: MugenDiagnostic[] = [];
  const fightDefPath = findFightDefPath(resolver);
  const explicit = fightDefPath ? readFightDefRefs(vfs, fightDefPath, resolver) : {};
  const airPath = explicit.airPath ?? findBestBasename(resolver, "fightfx.air");
  const sffPath = explicit.sffPath ?? findBestBasename(resolver, "fightfx.sff");
  const characterFxPaths = findCharacterFightFxPaths(options.characterDefinition, options.characterDefPath, resolver);

  if (!fightDefPath && !airPath && !sffPath && characterFxPaths.length === 0) {
    return undefined;
  }

  if (fightDefPath && !airPath) {
    diagnostics.push({
      severity: "warning",
      format: "loader",
      file: fightDefPath,
      message: "fight.def was found, but no FightFX AIR file could be resolved",
    });
  }
  if (fightDefPath && !sffPath) {
    diagnostics.push({
      severity: "warning",
      format: "loader",
      file: fightDefPath,
      message: "fight.def was found, but no FightFX SFF file could be resolved",
    });
  }

  const systemPackage = await loadAirSffPackage(vfs, airPath, sffPath, diagnostics);

  const hitSparkLibraries: MugenSystemAssets["hitSparkLibraries"] = {};
  if (systemPackage.animations.size > 0 || systemPackage.spriteArchive) {
    hitSparkLibraries.fightfx = createLibrary(
      "fightfx",
      airPath,
      sffPath,
      systemPackage.animations,
      systemPackage.spriteArchive,
      diagnostics,
    );
    hitSparkLibraries.common = createLibrary(
      "common",
      airPath,
      sffPath,
      systemPackage.animations,
      systemPackage.spriteArchive,
      diagnostics,
    );
  }

  const fightFxLibraries: Record<string, MugenSystemHitSparkLibrary> = {};
  for (const fxDefPath of characterFxPaths) {
    const library = await loadCharacterFightFxLibrary(vfs, resolver, fxDefPath, diagnostics);
    if (!library?.prefix) {
      continue;
    }
    if (fightFxLibraries[library.prefix]) {
      diagnostics.push({
        severity: "warning",
        format: "loader",
        file: fxDefPath,
        message: `Duplicate FightFX prefix '${library.prefix}' ignored`,
      });
      continue;
    }
    fightFxLibraries[library.prefix] = library;
  }

  return {
    fightDefPath,
    hitSparkLibraries,
    ...(Object.keys(fightFxLibraries).length > 0 ? { fightFxLibraries } : {}),
    diagnostics,
  };
}

async function loadAirSffPackage(
  vfs: VirtualFileSystem,
  airPath: string | undefined,
  sffPath: string | undefined,
  diagnostics: MugenDiagnostic[],
): Promise<{
  animations: Map<number, MugenSystemHitSparkLibrary["animations"] extends Map<number, infer T> ? T : never>;
  spriteArchive: MugenSystemHitSparkLibrary["spriteArchive"];
}> {
  const animations = new Map();
  if (airPath) {
    const parsedAir = parseAir(vfs.readText(airPath) ?? "", airPath);
    for (const [id, action] of parsedAir.actions) {
      animations.set(id, action);
    }
    diagnostics.push(...parsedAir.diagnostics);
  }

  let spriteArchive: MugenSystemHitSparkLibrary["spriteArchive"];
  if (sffPath) {
    const buffer = vfs.readArrayBuffer(sffPath);
    if (buffer) {
      const sff = await new SffParser().load(buffer);
      spriteArchive = sff;
      for (const warning of sff.warnings) {
        diagnostics.push({
          severity: "warning",
          format: "sff",
          file: sffPath,
          message: warning,
        });
      }
    }
  }

  return { animations, spriteArchive };
}

async function loadCharacterFightFxLibrary(
  vfs: VirtualFileSystem,
  resolver: PathResolver,
  fxDefPath: string,
  diagnostics: MugenDiagnostic[],
): Promise<MugenSystemHitSparkLibrary | undefined> {
  const definition = parseDef(vfs.readText(fxDefPath) ?? "", fxDefPath);
  diagnostics.push(...definition.diagnostics);
  const info = getSection(definition.rawSections, "Info");
  const prefix = normalizePrefix(getValue(info, ["prefix"]));
  if (!prefix) {
    diagnostics.push({
      severity: "warning",
      format: "loader",
      file: fxDefPath,
      message: "Character FightFX DEF was found, but no [Info] prefix was declared",
    });
    return undefined;
  }

  const files = getSection(definition.rawSections, "Files");
  const airPath = resolveExisting(resolver, fxDefPath, getValue(files, ["air", "anim"]));
  const sffPath = resolveExisting(resolver, fxDefPath, getValue(files, ["sff", "sprite"]));
  if (!airPath) {
    diagnostics.push({
      severity: "warning",
      format: "loader",
      file: fxDefPath,
      message: `Character FightFX '${prefix}' has no resolvable AIR file`,
    });
  }
  if (!sffPath) {
    diagnostics.push({
      severity: "warning",
      format: "loader",
      file: fxDefPath,
      message: `Character FightFX '${prefix}' has no resolvable SFF file`,
    });
  }

  const loaded = await loadAirSffPackage(vfs, airPath, sffPath, diagnostics);
  return createLibrary("fightfx", airPath, sffPath, loaded.animations, loaded.spriteArchive, diagnostics, {
    prefix,
    defPath: fxDefPath,
  });
}

function createLibrary(
  source: MugenSystemHitSparkLibrarySource,
  airPath: string | undefined,
  sffPath: string | undefined,
  animations: Map<number, MugenSystemHitSparkLibrary["animations"] extends Map<number, infer T> ? T : never>,
  spriteArchive: MugenSystemHitSparkLibrary["spriteArchive"],
  diagnostics: MugenDiagnostic[],
  metadata: Pick<MugenSystemHitSparkLibrary, "prefix" | "defPath"> = {},
): MugenSystemHitSparkLibrary {
  return {
    source,
    ...metadata,
    airPath,
    sffPath,
    animations: new Map(animations),
    spriteArchive,
    diagnostics: diagnostics.slice(),
  };
}

function readFightDefRefs(
  vfs: VirtualFileSystem,
  fightDefPath: string,
  resolver: PathResolver,
): { airPath?: string; sffPath?: string } {
  const definition = parseDef(vfs.readText(fightDefPath) ?? "", fightDefPath);
  const files = getSection(definition.rawSections, "Files");
  const airRef = getValue(files, ["fightfx.air", "fightfx.anim", "fx.air"]);
  const sffRef = getValue(files, ["fightfx.sff", "fx.sff"]);
  return {
    airPath: resolveExisting(resolver, fightDefPath, airRef),
    sffPath: resolveExisting(resolver, fightDefPath, sffRef),
  };
}

function findCharacterFightFxPaths(
  definition: MugenCharacterDef | undefined,
  characterDefPath: string | undefined,
  resolver: PathResolver,
): string[] {
  if (!definition || !characterDefPath) {
    return [];
  }
  const files = getSection(definition.rawSections, "Files");
  const rawFx = getValue(files, ["fx"]);
  if (!rawFx) {
    return [];
  }
  return rawFx
    .split(",")
    .map((ref) => resolveExisting(resolver, characterDefPath, ref))
    .filter((path): path is string => Boolean(path));
}

function findFightDefPath(resolver: PathResolver): string | undefined {
  const candidates = resolver.findByBasename("fight.def");
  return (
    candidates.find((path) => path.toLowerCase().endsWith("/data/fight.def")) ??
    candidates.find((path) => path.toLowerCase().includes("/data/")) ??
    candidates.find((path) => path.split("/").length <= 2) ??
    candidates[0]
  );
}

function findBestBasename(resolver: PathResolver, basename: string): string | undefined {
  const candidates = resolver.findByBasename(basename);
  return candidates.find((path) => path.toLowerCase().includes("/data/")) ?? candidates[0];
}

function resolveExisting(resolver: PathResolver, basePath: string, ref: string | undefined): string | undefined {
  const resolved = resolver.resolve(basePath, ref);
  return resolver.exists(resolved) ? resolved : undefined;
}

function getSection(rawSections: Record<string, Record<string, string>>, expected: string): Record<string, string> {
  return Object.entries(rawSections).find(([section]) => section.toLowerCase() === expected.toLowerCase())?.[1] ?? {};
}

function getValue(section: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const match = Object.entries(section).find(([candidate]) => candidate.toLowerCase() === key.toLowerCase());
    if (match?.[1]) {
      return match[1];
    }
  }
  return undefined;
}

function normalizePrefix(value: string | undefined): string | undefined {
  const prefix = value?.trim().replace(/^"|"$/g, "").toLowerCase();
  return prefix || undefined;
}
