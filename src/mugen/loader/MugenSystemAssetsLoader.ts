import type { MugenAnimationAction, MugenDiagnostic } from "../model/MugenAnimation";
import type { MugenCharacterDef } from "../model/MugenCharacter";
import type { MugenGameConfig } from "../model/MugenConfig";
import type {
  MugenFightScreenAssets,
  MugenFightScreenDisplayAsset,
  MugenFightScreenDisplayDefinitions,
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
  const fightScreenAssets = fightDefPath
    ? await loadFightScreenAssets(
        vfs,
        fightDefPath,
        explicit.screenSffPath,
        explicit.screenSndPath,
        diagnostics,
      )
    : undefined;

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
    ...(fightScreenAssets ? { fightScreenAssets } : {}),
    ...(gameConfig ? { gameConfig } : {}),
    ...(supportedCommonFightFxPaths.length > 0 ? { commonFightFxPaths: supportedCommonFightFxPaths } : {}),
    hitSparkLibraries,
    ...(Object.keys(fightFxLibraries).length > 0 ? { fightFxLibraries } : {}),
    diagnostics,
  };
}

async function loadFightScreenAssets(
  vfs: VirtualFileSystem,
  fightDefPath: string,
  sffPath: string | undefined,
  sndPath: string | undefined,
  diagnostics: MugenDiagnostic[],
): Promise<MugenFightScreenAssets | undefined> {
  const bundleDiagnostics: MugenDiagnostic[] = [];
  const record = (diagnostic: MugenDiagnostic): void => {
    bundleDiagnostics.push(diagnostic);
    diagnostics.push(diagnostic);
  };
  const definition = parseDef(vfs.readText(fightDefPath) ?? "", fightDefPath);
  for (const diagnostic of definition.diagnostics) {
    record(diagnostic);
  }
  const inlineActions = parseAir(
    extractEmbeddedActionText(vfs.readText(fightDefPath) ?? ""),
    fightDefPath,
  );
  for (const diagnostic of inlineActions.diagnostics) {
    record(diagnostic);
  }

  let spriteArchive: MugenFightScreenAssets["spriteArchive"];
  if (sffPath) {
    const buffer = vfs.readArrayBuffer(sffPath);
    if (buffer) {
      spriteArchive = await new SffParser().load(buffer);
      for (const warning of spriteArchive.warnings) {
        record({ severity: "warning", format: "sff", file: sffPath, message: warning });
      }
    }
  }

  let soundArchive: MugenFightScreenAssets["soundArchive"];
  if (sndPath) {
    const buffer = vfs.readArrayBuffer(sndPath);
    if (buffer) {
      soundArchive = parseSnd(buffer);
  for (const warning of soundArchive.warnings) {
        record({ severity: "warning", format: "snd", file: sndPath, message: warning });
      }
    }
  }

  const display = parseFightScreenDisplayDefinitions(getSection(definition.rawSections, "Round"));

  if (!sffPath && !sndPath && inlineActions.actions.size === 0 && !display) {
    return undefined;
  }

  return {
    sourcePath: fightDefPath,
    ...(sffPath ? { sffPath } : {}),
    ...(sndPath ? { sndPath } : {}),
    animations: inlineActions.actions,
    ...(display ? { display } : {}),
    ...(spriteArchive ? { spriteArchive } : {}),
    ...(soundArchive ? { soundArchive } : {}),
    diagnostics: bundleDiagnostics,
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

function extractEmbeddedActionText(text: string): string {
  const lines = text.split(/\r?\n/);
  const output: string[] = [];
  let inAction = false;
  for (const line of lines) {
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line.trim());
    if (sectionMatch) {
      inAction = /^Begin\s+Action\s+-?\d+$/i.test(sectionMatch[1]?.trim() ?? "");
    }
    if (inAction) {
      output.push(line);
    }
  }
  return output.join("\n");
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
): {
  airPath?: string;
  sffPath?: string;
  sndPath?: string;
  screenSffPath?: string;
  screenSndPath?: string;
  fightScreenTiming?: MugenFightScreenTiming;
} {
  const definition = parseDef(vfs.readText(fightDefPath) ?? "", fightDefPath);
  const files = getSection(definition.rawSections, "Files");
  const round = getSection(definition.rawSections, "Round");
  const airRef = getValue(files, ["fightfx.air", "fightfx.anim", "fx.air"]);
  const sffRef = getValue(files, ["fightfx.sff", "fx.sff"]);
  const sndRef = getValue(files, ["fightfx.snd", "fx.snd"]);
  return {
    airPath: resolveExisting(resolver, fightDefPath, airRef),
    sffPath: resolveExisting(resolver, fightDefPath, sffRef),
    sndPath: resolveExisting(resolver, fightDefPath, sndRef),
    screenSffPath: resolveExisting(resolver, fightDefPath, getValue(files, ["sff", "sprite"])),
    screenSndPath: resolveExisting(resolver, fightDefPath, getValue(files, ["snd", "sound"])),
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
    startWaitTime: numberValue(section, "start.waittime"),
    controlTime: numberValue(section, "ctrl.time"),
    roundTime: numberValue(section, "round.time"),
    roundSoundTime: numberValue(section, "round.sndtime"),
    roundSound: soundValue(section, "round.default.snd"),
    callFightTime: numberValue(section, "callfight.time"),
    fightTime: numberValue(section, "fight.time"),
    fightSoundTime: numberValue(section, "fight.sndtime"),
    fightSound: soundValue(section, "fight.snd"),
    shutterTime: numberValue(section, "shutter.time"),
    shutterColor: colorValue(section, "shutter.col"),
    fadeInTime: numberValue(section, "fadein.time"),
    fadeInColor: colorValue(section, "fadein.col"),
    fadeInAnimationNo: nonNegativeIntegerValue(section, "fadein.anim"),
    fadeInSound: soundValue(section, "fadein.snd"),
    fadeOutTime: numberValue(section, "fadeout.time"),
    fadeOutColor: colorValue(section, "fadeout.col"),
    fadeOutAnimationNo: nonNegativeIntegerValue(section, "fadeout.anim"),
    fadeOutSound: soundValue(section, "fadeout.snd"),
    slowTime: numberValue(section, "slow.time"),
    slowFadeTime: numberValue(section, "slow.fadetime"),
    slowSpeed: numberValue(section, "slow.speed"),
  };
  return Object.entries(timing).some(([key, value]) => key !== "sourcePath" && value !== undefined)
    ? timing
    : undefined;
}

function parseFightScreenDisplayDefinitions(
  section: Record<string, string>,
): MugenFightScreenDisplayDefinitions | undefined {
  const round = new Map<number, MugenFightScreenDisplayAsset>();
  for (let roundNo = 1; roundNo <= 9; roundNo += 1) {
    const asset = displayAsset(section, `round${roundNo}`);
    if (asset) {
      round.set(roundNo, asset);
    }
  }
  const definitions: MugenFightScreenDisplayDefinitions = {
    round,
    roundDefault: displayAsset(section, "round.default"),
    roundSingle: displayAsset(section, "round.single"),
    roundFinal: displayAsset(section, "round.final"),
    fight: displayAsset(section, "fight"),
  };
  return definitions.round.size > 0
    || definitions.roundDefault !== undefined
    || definitions.roundSingle !== undefined
    || definitions.roundFinal !== undefined
    || definitions.fight !== undefined
    ? definitions
    : undefined;
}

function displayAsset(
  section: Record<string, string>,
  prefix: string,
): MugenFightScreenDisplayAsset | undefined {
  const asset: MugenFightScreenDisplayAsset = {
    animationNo: nonNegativeIntegerValue(section, `${prefix}.anim`),
    sound: soundValue(section, `${prefix}.snd`),
    text: getValue(section, [`${prefix}.text`]),
    font: fontValue(section, `${prefix}.font`),
    displayTime: numberValue(section, `${prefix}.displaytime`),
    offset: pairValue(section, `${prefix}.offset`),
    scale: pairValue(section, `${prefix}.scale`),
    facing: facingValue(section, `${prefix}.facing`),
    vfacing: facingValue(section, `${prefix}.vfacing`),
  };
  if (!Object.values(asset).some((value) => value !== undefined)) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(asset).filter(([, value]) => value !== undefined),
  ) as MugenFightScreenDisplayAsset;
}

function pairValue(section: Record<string, string>, key: string): [number, number] | undefined {
  const raw = getValue(section, [key]);
  if (raw === undefined) return undefined;
  const values = raw.split(",").map((part) => Number(part.trim()));
  if (values.length !== 2 || values.some((value) => !Number.isFinite(value))) return undefined;
  return [values[0]!, values[1]!];
}

function fontValue(section: Record<string, string>, key: string): [number, number, number] | undefined {
  const raw = getValue(section, [key]);
  if (raw === undefined) return undefined;
  const values = raw.split(",").map((part) => Number(part.trim()));
  if (values.length !== 3 || values.some((value) => !Number.isFinite(value))) return undefined;
  return [Math.round(values[0]!), Math.round(values[1]!), Math.round(values[2]!)];
}

function facingValue(section: Record<string, string>, key: string): 1 | -1 | undefined {
  const value = numberValue(section, key);
  if (value === undefined) return undefined;
  return value < 0 ? -1 : 1;
}

function enrichFightScreenTiming(
  timing: MugenFightScreenTiming | undefined,
  animations: Map<number, MugenAnimationAction>,
): MugenFightScreenTiming | undefined {
  if (!timing) {
    return timing;
  }
  const fadeInDuration = resolveAnimationDuration(animations, timing.fadeInAnimationNo);
  const fadeOutDuration = resolveAnimationDuration(animations, timing.fadeOutAnimationNo);
  return {
    ...timing,
    ...(fadeInDuration === undefined ? {} : { fadeInAnimationDuration: fadeInDuration }),
    ...(fadeOutDuration === undefined ? {} : { fadeOutAnimationDuration: fadeOutDuration }),
  };
}

function resolveAnimationDuration(
  animations: Map<number, MugenAnimationAction>,
  actionNo: number | undefined,
): number | undefined {
  if (actionNo === undefined) return undefined;
  const action = animations.get(actionNo);
  return action ? animationDuration(action.frames.map((frame) => frame.duration)) : undefined;
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
