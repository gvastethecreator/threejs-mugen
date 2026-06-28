import type { MugenDiagnostic } from "../model/MugenAnimation";
import type { MugenSystemAssets, MugenSystemHitSparkLibrary, MugenSystemHitSparkLibrarySource } from "../model/MugenSystemAssets";
import { parseAir } from "../parsers/AirParser";
import { parseDef } from "../parsers/DefParser";
import { SffParser } from "../parsers/SffParser";
import type { PathResolver } from "./PathResolver";
import type { VirtualFileSystem } from "./VirtualFileSystem";

export async function loadMugenSystemAssets(vfs: VirtualFileSystem, resolver: PathResolver): Promise<MugenSystemAssets | undefined> {
  const diagnostics: MugenDiagnostic[] = [];
  const fightDefPath = findFightDefPath(resolver);
  const explicit = fightDefPath ? readFightDefRefs(vfs, fightDefPath, resolver) : {};
  const airPath = explicit.airPath ?? findBestBasename(resolver, "fightfx.air");
  const sffPath = explicit.sffPath ?? findBestBasename(resolver, "fightfx.sff");

  if (!fightDefPath && !airPath && !sffPath) {
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

  const hitSparkLibraries: MugenSystemAssets["hitSparkLibraries"] = {};
  if (animations.size > 0 || spriteArchive) {
    hitSparkLibraries.fightfx = createLibrary("fightfx", airPath, sffPath, animations, spriteArchive, diagnostics);
    hitSparkLibraries.common = createLibrary("common", airPath, sffPath, animations, spriteArchive, diagnostics);
  }

  return {
    fightDefPath,
    hitSparkLibraries,
    diagnostics,
  };
}

function createLibrary(
  source: MugenSystemHitSparkLibrarySource,
  airPath: string | undefined,
  sffPath: string | undefined,
  animations: Map<number, MugenSystemHitSparkLibrary["animations"] extends Map<number, infer T> ? T : never>,
  spriteArchive: MugenSystemHitSparkLibrary["spriteArchive"],
  diagnostics: MugenDiagnostic[],
): MugenSystemHitSparkLibrary {
  return {
    source,
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
