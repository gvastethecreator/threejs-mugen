import type { MugenAnimationAction, MugenDiagnostic } from "../model/MugenAnimation";
import type { MugenCharacterDef } from "../model/MugenCharacter";
import type { MugenGameConfig } from "../model/MugenConfig";
import type {
  MugenFightScreenTiming,
  MugenSystemAssets,
  MugenSystemHitSparkLibrary,
  MugenSystemHitSparkLibrarySource,
} from "../model/MugenSystemAssets";
import { parseAir } from "../parsers/AirParser";
import { parseDef } from "../parsers/DefParser";
import { parseSnd } from "../parsers/SndParser";
import { SffParser } from "../parsers/SffParser";
import { loadMugenGameConfig } from "./MugenConfigLoader";
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
  const gameConfig = loadMugenGameConfig(vfs, resolver);
  if (gameConfig) {
    diagnostics.push(...gameConfig.diagnostics);
  }
  const commonFightFxPaths = resolveGlobalCommonFightFxPaths(gameConfig, resolver, diagnostics);
  const supportedCommonFightFxPaths = commonFightFxPaths.filter((path) => {
    if (/\.zss$/i.test(path)) {
      diagnostics.push({
        severity: "warning",
        format: "loader",
        file: path,
        message: "Common.Fx ZSS source is unsupported; only FightFX DEF packages are loaded",
      });
      return false;
    }
    if (!/\.def$/i.test(path)) {
      diagnostics.push({
        severity: "warning",
        format: "loader",
        file: path,
        message: "Common.Fx source has an unsupported format; expected a FightFX .def package",
      });
      return false;
    }
    return true;
  });
  const explicit = fightDefPath ? readFightDefRefs(vfs, fightDefPath, resolver) : {};
  const airPath = explicit.airPath ?? findBestBasename(resolver, "fightfx.air");
  const sffPath = explicit.sffPath ?? findBestBasename(resolver, "fightfx.sff");
  const sndPath = explicit.sndPath ?? findBestBasename(resolver, "fightfx.snd") ?? findBestBasename(resolver, "fx.snd");
  const characterFxPaths = findCharacterFightFxPaths(options.characterDefinition, options.characterDefPath, resolver);

  if (!fightDefPath && !airPath && !sffPath && characterFxPaths.length === 0 && !gameConfig) {
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

  const systemPackage = await loadAirSffSndPackage(vfs, airPath, sffPath, sndPath, diagnostics);

  const hitSparkLibraries: MugenSystemAssets["hitSparkLibraries"] = {};
  if (systemPackage.animations.size > 0 || systemPackage.spriteArchive) {
    hitSparkLibraries.fightfx = createLibrary(
      "fightfx",
      airPath,
      sffPath,
      sndPath,
      systemPackage.animations,
      systemPackage.spriteArchive,
      systemPackage.soundArchive,
      diagnostics,
    );
    hitSparkLibraries.common = createLibrary(
      "common",
      airPath,
      sffPath,
      sndPath,
      systemPackage.animations,
      systemPackage.spriteArchive,
      systemPackage.soundArchive,
      diagnostics,
    );
  }

  const fightFxLibraries: Record<string, MugenSystemHitSparkLibrary> = {};
  const registerFightFxLibrary = async (fxDefPath: string, label: "Common" | "Character"): Promise<void> => {
    const library = await loadFightFxLibrary(vfs, resolver, fxDefPath, diagnostics, label);
    if (!library?.prefix) {
      return;
    }
    if (fightFxLibraries[library.prefix]) {
      diagnostics.push({
        severity: "warning",
        format: "loader",
        file: fxDefPath,
        message: `Duplicate FightFX prefix '${library.prefix}' ignored`,
      });
      return;
    }
    fightFxLibraries[library.prefix] = library;
  };
  for (const fxDefPath of supportedCommonFightFxPaths) {
    await registerFightFxLibrary(fxDefPath, "Common");
  }
  for (const fxDefPath of characterFxPaths) {
    await registerFightFxLibrary(fxDefPath, "Character");
  }

  const fightScreenTiming = enrichFightScreenTiming(explicit.fightScreenTiming, systemPackage.animations);
  return {
    fightDefPath,
    ...(fightScreenTiming ? { fightScreenTiming } : {}),
    ...(gameConfig ? { gameConfig } : {}),
    ...(supportedCommonFightFxPaths.length > 0 ? { commonFightFxPaths: supportedCommonFightFxPaths } : {}),
    hitSparkLibraries,
    ...(Object.keys(fightFxLibraries).length > 0 ? { fightFxLibraries } : {}),
    diagnostics,
  };
}

async function loadAirSffSndPackage(
  vfs: VirtualFileSystem,
  airPath: string | undefined,
  sffPath: string | undefined,
  sndPath: string | undefined,
  diagnostics: MugenDiagnostic[],
): Promise<{
  animations: Map<number, MugenSystemHitSparkLibrary["animations"] extends Map<number, infer T> ? T : never>;
  spriteArchive: MugenSystemHitSparkLibrary["spriteArchive"];
  soundArchive: MugenSystemHitSparkLibrary["soundArchive"];
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

  let soundArchive: MugenSystemHitSparkLibrary["soundArchive"];
  if (sndPath) {
    const buffer = vfs.readArrayBuffer(sndPath);
    if (buffer) {
      const snd = parseSnd(buffer);
      soundArchive = snd;
      for (const warning of snd.warnings) {
        diagnostics.push({
          severity: "warning",
          format: "snd",
          file: sndPath,
          message: warning,
        });
      }
    }
  }

  return { animations, spriteArchive, soundArchive };
}

async function loadFightFxLibrary(
  vfs: VirtualFileSystem,
  resolver: PathResolver,
  fxDefPath: string,
  diagnostics: MugenDiagnostic[],
  label: "Common" | "Character",
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
      message: `${label} FightFX DEF was found, but no [Info] prefix was declared`,
    });
    return undefined;
  }

  const files = getSection(definition.rawSections, "Files");
  const airPath = resolveExisting(resolver, fxDefPath, getValue(files, ["air", "anim"]));
  const sffPath = resolveExisting(resolver, fxDefPath, getValue(files, ["sff", "sprite"]));
  const sndPath = resolveExisting(resolver, fxDefPath, getValue(files, ["snd", "sound"]));
  if (!airPath) {
    diagnostics.push({
      severity: "warning",
      format: "loader",
      file: fxDefPath,
      message: `${label} FightFX '${prefix}' has no resolvable AIR file`,
    });
  }
  if (!sffPath) {
    diagnostics.push({
      severity: "warning",
      format: "loader",
      file: fxDefPath,
      message: `${label} FightFX '${prefix}' has no resolvable SFF file`,
    });
  }

  const loaded = await loadAirSffSndPackage(vfs, airPath, sffPath, sndPath, diagnostics);
  return createLibrary("fightfx", airPath, sffPath, sndPath, loaded.animations, loaded.spriteArchive, loaded.soundArchive, diagnostics, {
    prefix,
    defPath: fxDefPath,
  });
}

function createLibrary(
  source: MugenSystemHitSparkLibrarySource,
  airPath: string | undefined,
  sffPath: string | undefined,
  sndPath: string | undefined,
  animations: Map<number, MugenSystemHitSparkLibrary["animations"] extends Map<number, infer T> ? T : never>,
  spriteArchive: MugenSystemHitSparkLibrary["spriteArchive"],
  soundArchive: MugenSystemHitSparkLibrary["soundArchive"],
  diagnostics: MugenDiagnostic[],
  metadata: Pick<MugenSystemHitSparkLibrary, "prefix" | "defPath"> = {},
): MugenSystemHitSparkLibrary {
  return {
    source,
    ...metadata,
    airPath,
    sffPath,
    sndPath,
    animations: new Map(animations),
    spriteArchive,
    soundArchive,
    diagnostics: diagnostics.slice(),
  };
}

function readFightDefRefs(
  vfs: VirtualFileSystem,
  fightDefPath: string,
  resolver: PathResolver,
): { airPath?: string; sffPath?: string; sndPath?: string; fightScreenTiming?: MugenFightScreenTiming } {
  const definition = parseDef(vfs.readText(fightDefPath) ?? "", fightDefPath);
  const files = getSection(definition.rawSections, "Files");
  const round = getSection(definition.rawSections, "Round");
  const airRef = getValue(files, ["fightfx.air", "fightfx.anim", "fx.air"]);
  const sffRef = getValue(files, ["fightfx.sff", "fx.sff"]);
  const sndRef = getValue(files, ["snd", "fightfx.snd", "fx.snd"]);
  return {
    airPath: resolveExisting(resolver, fightDefPath, airRef),
    sffPath: resolveExisting(resolver, fightDefPath, sffRef),
    sndPath: resolveExisting(resolver, fightDefPath, sndRef),
    fightScreenTiming: parseFightScreenTiming(round, fightDefPath),
  };
}

function parseFightScreenTiming(
  section: Record<string, string>,
  sourcePath: string,
): MugenFightScreenTiming | undefined {
  const timing: MugenFightScreenTiming = {
    sourcePath,
    overWaitTime: numberValue(section, "over.waittime"),
    overHitTime: numberValue(section, "over.hittime"),
    overWinTime: numberValue(section, "over.wintime"),
    overForceWinTime: numberValue(section, "over.forcewintime"),
    overTime: numberValue(section, "over.time"),
    fadeOutTime: numberValue(section, "fadeout.time"),
    fadeOutColor: colorValue(section, "fadeout.col"),
    fadeOutAnimationNo: nonNegativeIntegerValue(section, "fadeout.anim"),
    fadeOutSound: soundValue(section, "fadeout.snd"),
    slowTime: numberValue(section, "slow.time"),
    slowFadeTime: numberValue(section, "slow.fadetime"),
    slowSpeed: numberValue(section, "slow.speed"),
  };
  return Object.values(timing).some((value) => typeof value === "number") ? timing : undefined;
}

function enrichFightScreenTiming(
  timing: MugenFightScreenTiming | undefined,
  animations: Map<number, MugenAnimationAction>,
): MugenFightScreenTiming | undefined {
  if (!timing || timing.fadeOutAnimationNo === undefined) {
    return timing;
  }
  const action = animations.get(timing.fadeOutAnimationNo);
  const duration = action ? animationDuration(action.frames.map((frame) => frame.duration)) : undefined;
  return duration === undefined ? timing : { ...timing, fadeOutAnimationDuration: duration };
}

function animationDuration(durations: number[]): number {
  return durations.reduce((total, duration) => total + (duration === -1 ? 1 : Math.max(0, Math.round(duration))), 0);
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

function resolveGlobalCommonFightFxPaths(
  config: MugenGameConfig | undefined,
  resolver: PathResolver,
  diagnostics: MugenDiagnostic[],
): string[] {
  if (!config) {
    return [];
  }
  const common = getSection(config.rawSections, "Common");
  const configPath = config.gameSpace?.sourcePath ?? "data/mugen.cfg";
  const entries = Object.entries(common)
    .filter(([key]) => /^fx\d*$/i.test(key))
    .sort(([left], [right]) => commonFightFxConfigRank(left) - commonFightFxConfigRank(right));
  const paths: string[] = [];

  for (const [, value] of entries) {
    for (const reference of value.split(",").map((item) => item.trim()).filter(Boolean)) {
      const normalizedReference = reference.replace(/^['"]|['"]$/g, "");
      const rootPath = resolver.resolve("", normalizedReference);
      const configRelativePath = resolver.resolve(configPath, normalizedReference);
      const candidates = normalizedReference.includes("/") || normalizedReference.includes("\\")
        ? [rootPath, configRelativePath]
        : [configRelativePath, rootPath];
      const resolved = candidates.find((candidate) => resolver.exists(candidate)) ?? candidates.find(Boolean);
      if (!resolved || !resolver.exists(resolved)) {
        diagnostics.push({
          severity: "warning",
          format: "loader",
          file: configPath,
          message: `Referenced global common FightFX file was not found: ${reference}`,
        });
        continue;
      }
      paths.push(resolved);
    }
  }
  return paths;
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

function numberValue(section: Record<string, string>, key: string): number | undefined {
  const raw = getValue(section, [key]);
  if (raw === undefined) return undefined;
  const value = Number(raw.trim());
  return Number.isFinite(value) ? value : undefined;
}

function nonNegativeIntegerValue(section: Record<string, string>, key: string): number | undefined {
  const value = numberValue(section, key);
  if (value === undefined || value < 0) return undefined;
  return Math.round(value);
}

function soundValue(section: Record<string, string>, key: string): [number, number] | undefined {
  const raw = getValue(section, [key]);
  if (raw === undefined) return undefined;
  const values = raw.split(",").map((part) => Number(part.trim()));
  if (values.length !== 2 || values.some((value) => !Number.isFinite(value) || value < 0)) return undefined;
  return values.map((value) => Math.round(value)) as [number, number];
}

function colorValue(section: Record<string, string>, key: string): [number, number, number] | undefined {
  const raw = getValue(section, [key]);
  if (raw === undefined) return undefined;
  const values = raw.split(",").map((part) => Number(part.trim()));
  if (values.length !== 3 || values.some((value) => !Number.isFinite(value))) return undefined;
  return values.map((value) => Math.max(0, Math.min(255, Math.round(value)))) as [number, number, number];
}

function normalizePrefix(value: string | undefined): string | undefined {
  const prefix = value?.trim().replace(/^"|"$/g, "").toLowerCase();
  return prefix || undefined;
}

function commonFightFxConfigRank(key: string): number {
  const normalized = key.toLowerCase();
  return normalized === "fx" ? 0 : Number(normalized.slice("fx".length)) + 1;
}
