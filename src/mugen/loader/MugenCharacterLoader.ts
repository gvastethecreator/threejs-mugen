import { createCompatibilityReport, type CompatibilityReport } from "../compatibility/CompatibilityReport";
import { scanIkemenFeatures } from "../compatibility/IkemenFeatureScanner";
import { UnsupportedFeatureTracker } from "../compatibility/UnsupportedFeatureTracker";
import { compileRuntimeProgram, isRuntimeExecutableController } from "../compiler/StateControllerCompiler";
import { resolveMugenStateSources, type MugenStateSourceInput } from "../compiler/StateSourceResolver";
import type { MugenCharacter, ResolvedCharacterFiles } from "../model/MugenCharacter";
import type { MugenDiagnostic } from "../model/MugenAnimation";
import type { MugenGameConfig } from "../model/MugenConfig";
import type { MugenPalette } from "../model/MugenPalette";
import { parseAir } from "../parsers/AirParser";
import { parseAct } from "../parsers/ActParser";
import { parseCmd } from "../parsers/CmdParser";
import { parseCns } from "../parsers/CnsParser";
import { parseDef } from "../parsers/DefParser";
import { parseSnd } from "../parsers/SndParser";
import { SffParser } from "../parsers/SffParser";
import { parseZss, type ZssParseResult } from "../parsers/ZssParser";
import { PathResolver } from "./PathResolver";
import { loadMugenSystemAssets } from "./MugenSystemAssetsLoader";
import type { VirtualFileSystem } from "./VirtualFileSystem";

export class MugenCharacterLoader {
  async load(
    sourceName: string,
    vfs: VirtualFileSystem,
    options: { defPath?: string } = {},
  ): Promise<MugenCharacter> {
    const diagnostics: MugenDiagnostic[] = [];
    const unsupported = new UnsupportedFeatureTracker();
    const resolver = new PathResolver(vfs.listFiles());
    const ikemen = scanIkemenFeatures({
      paths: vfs.listFiles(),
      readText: (path) => vfs.readText(path),
    });
    const requestedDefPath = options.defPath?.trim();
    const resolvedRequestedDefPath = requestedDefPath ? resolver.resolve("", requestedDefPath) : undefined;
    const defPath = requestedDefPath
      ? (resolvedRequestedDefPath && resolver.exists(resolvedRequestedDefPath) ? resolvedRequestedDefPath : undefined)
      : this.findDefPath(sourceName, resolver);

    if (!defPath) {
      diagnostics.push({
        severity: "error",
        format: "loader",
        message: requestedDefPath
          ? "Requested character definition was not found: " + requestedDefPath
          : "No .def file found in character package",
      });
      const files = createEmptyFiles();
      reportIkemenFindings(unsupported, ikemen);
      return {
        sourceName,
        defPath: "",
        definition: {
          info: {},
          files: { states: [], commonStates: [], palettes: [] },
          rawSections: {},
          rawLines: [],
          diagnostics,
        },
        files,
        animations: new Map(),
        commands: [],
        states: [],
        stateSources: [],
        stateEntryControllers: [],
        constants: {},
        diagnostics,
        compatibility: createCompatibilityReport({
          loaded: false,
          files,
          animations: new Map(),
          commands: [],
          states: [],
          stateEntryControllers: [],
          diagnostics,
          ikemen,
          unsupported: unsupported.list(),
        }),
      };
    }

    const defText = vfs.readText(defPath) ?? "";
    const definition = parseDef(defText, defPath);
    diagnostics.push(...definition.diagnostics);
    const files = this.resolveFiles(defPath, definition, resolver, diagnostics, unsupported);
    const systemAssets = await loadMugenSystemAssets(vfs, resolver, {
      characterDefPath: defPath,
      characterDefinition: definition,
    });
    if (systemAssets) {
      diagnostics.push(...systemAssets.diagnostics);
    }

    const commonCommandPaths = resolveGlobalCommonCommandPaths(systemAssets?.gameConfig, resolver, diagnostics);
    const supportedCommonCommandPaths = commonCommandPaths.filter((path) => {
      if (/\.zss$/i.test(path)) {
        unsupported.report("ikemen", "Common.Cmd ZSS", {
          location: path,
          fallback: "Only CNS-compatible Common.Cmd sources are parsed by the bounded loader",
        });
        return false;
      }
      if (!/\.cmd$/i.test(path)) {
        unsupported.report("ikemen", "Common.Cmd format", {
          location: path,
          fallback: "Only .cmd Common.Cmd sources are parsed by the bounded loader",
        });
        return false;
      }
      return true;
    });
    files.commonCommands = supportedCommonCommandPaths;

    const commonAnimationPaths = resolveGlobalCommonAnimationPaths(systemAssets?.gameConfig, resolver, diagnostics);
    const supportedCommonAnimationPaths = commonAnimationPaths.filter((path) => {
      if (/\.zss$/i.test(path)) {
        unsupported.report("ikemen", "Common.Air ZSS", {
          location: path,
          fallback: "Only AIR Common.Air sources are parsed by the bounded loader",
        });
        return false;
      }
      if (!/\.air$/i.test(path)) {
        unsupported.report("ikemen", "Common.Air format", {
          location: path,
          fallback: "Only .air Common.Air sources are parsed by the bounded loader",
        });
        return false;
      }
      return true;
    });
    files.commonAnimations = supportedCommonAnimationPaths;

    const animations = new Map();
    if (files.anim) {
      const parsedAir = parseAir(vfs.readText(files.anim) ?? "", files.anim);
      for (const [id, action] of parsedAir.actions) {
        animations.set(id, action);
      }
      diagnostics.push(...parsedAir.diagnostics);
    }
    for (const commonAnimationPath of supportedCommonAnimationPaths) {
      const parsedCommonAir = parseAir(vfs.readText(commonAnimationPath) ?? "", commonAnimationPath);
      for (const [id, action] of parsedCommonAir.actions) {
        if (!animations.has(id)) {
          animations.set(id, action);
        }
      }
      diagnostics.push(...parsedCommonAir.diagnostics);
    }

    let commands: MugenCharacter["commands"] = [];
    let commandDefaults: MugenCharacter["commandDefaults"];
    let commandRemap: MugenCharacter["commandRemap"];
    let stateEntryControllers: MugenCharacter["stateEntryControllers"] = [];
    const commandSources = [files.cmd, ...supportedCommonCommandPaths].filter(
      (path): path is string => Boolean(path),
    );
    if (commandSources.length > 0) {
      const commandText = commandSources.map((path) => vfs.readText(path) ?? "").join("\n");
      const commandFileLabel = commandSources.length === 1 ? commandSources[0] : commandSources.join(", ");
      const parsedCmd = parseCmd(commandText, commandFileLabel);
      commands = parsedCmd.commands;
      commandDefaults = parsedCmd.defaults;
      commandRemap = parsedCmd.remap;
      diagnostics.push(...parsedCmd.diagnostics);
    }
    if (files.cmd) {
      const cmdText = vfs.readText(files.cmd) ?? "";
      const parsedCmdStateEntries = parseCns(cmdText, files.cmd);
      stateEntryControllers = parsedCmdStateEntries.controllers.filter((controller) => controller.stateId === -1);
      diagnostics.push(...parsedCmdStateEntries.diagnostics);
    }

    const stateSources: MugenStateSourceInput[] = [];
    const constants: MugenCharacter["constants"] = {};
    const parsedCnsByPath = new Map<string, { text: string; parsed: ReturnType<typeof parseCns> }>();
    const parseCnsFile = (path: string): { text: string; parsed: ReturnType<typeof parseCns> } => {
      const cached = parsedCnsByPath.get(path);
      if (cached) {
        return cached;
      }
      const text = vfs.readText(path) ?? "";
      const parsed = parseCns(text, path);
      const result = { text, parsed };
      parsedCnsByPath.set(path, result);
      diagnostics.push(...parsed.diagnostics);
      return result;
    };
    const parsedZssByPath = new Map<string, { text: string; parsed: ZssParseResult }>();
    const parseZssFile = (path: string): { text: string; parsed: ZssParseResult } => {
      const cached = parsedZssByPath.get(path);
      if (cached) {
        return cached;
      }
      const text = vfs.readText(path) ?? "";
      const parsed = parseZss(text, path);
      const result = { text, parsed };
      parsedZssByPath.set(path, result);
      diagnostics.push(...parsed.diagnostics);
      if (parsed.zss.status === "blocked") {
        unsupported.report("zss", "ZSS grammar source", {
          severity: "error",
          location: path,
          fallback: "The malformed ZSS source contributes no states or controllers to the runtime.",
        });
      }
      return result;
    };

    const commonConstantPaths = resolveGlobalCommonConstantPaths(systemAssets?.gameConfig, resolver, diagnostics);
    const supportedCommonConstantPaths = commonConstantPaths.filter((path) => {
      if (!/\.zss$/i.test(path)) {
        return true;
      }
      unsupported.report("ikemen", "Common.Const ZSS", {
        location: path,
        fallback: "Only INI-compatible Common.Const sources are parsed by the bounded loader",
      });
      return false;
    });
    files.commonConstants = supportedCommonConstantPaths;
    for (const commonConstantPath of supportedCommonConstantPaths) {
      Object.assign(constants, parseCnsFile(commonConstantPath).parsed.constants);
    }

    if (files.cns) {
      Object.assign(constants, parseCnsFile(files.cns).parsed.constants);
    }

    const globalCommonStatePaths = resolveGlobalCommonStatePaths(systemAssets?.gameConfig, resolver, diagnostics);
    const globalCnsStatePaths = globalCommonStatePaths.filter((path) => {
      if (!/\.zss$/i.test(path)) {
        return true;
      }
      unsupported.report("ikemen", "Common.States ZSS", {
        location: path,
        fallback: "Only CNS Common.States sources are compiled by the bounded loader",
      });
      return false;
    });
    const stateFiles = [
      ...files.states.map((path) => ({ kind: "character" as const, path })),
      ...files.commonStates.map((path) => ({ kind: "common" as const, path })),
      ...globalCnsStatePaths.map((path) => ({ kind: "common" as const, path })),
    ];
    for (const stateFile of stateFiles) {
      const { text, parsed } = /\.zss$/i.test(stateFile.path)
        ? parseZssFile(stateFile.path)
        : parseCnsFile(stateFile.path);
      stateSources.push({ ...stateFile, text, states: parsed.states });
      Object.assign(constants, parsed.constants);
    }
    if (constants["data.fall.defence_mul"] === undefined) {
      const fallDefenceUp = constants["data.fall.defence_up"];
      if (fallDefenceUp !== undefined && Number.isFinite(fallDefenceUp) && fallDefenceUp > -100) {
        constants["data.fall.defence_mul"] = (fallDefenceUp + 100) / 100;
      }
    }
    const stateResolution = resolveMugenStateSources(stateSources, {
      negativeStatePolicy: definition.info.ikemenVersion?.trim() ? "ikemen-append" : "first-wins",
    });
    const states = stateResolution.states;

    let spriteArchive: MugenCharacter["spriteArchive"];
    if (files.sprite) {
      const sffBuffer = vfs.readArrayBuffer(files.sprite);
      if (sffBuffer) {
        const sff = await new SffParser().load(sffBuffer);
        spriteArchive = sff;
        for (const warning of sff.warnings) {
          diagnostics.push({
            severity: "warning",
            format: "sff",
            file: files.sprite,
            message: warning,
          });
        }
        for (const [format, count] of Object.entries(sff.metadata?.unsupportedFormats ?? {})) {
          for (let index = 0; index < count; index += 1) {
            unsupported.report("sff", `${sff.version} ${format} image decoding`, {
              location: files.sprite,
              fallback: "MockSpriteProvider supplies deterministic placeholder textures for undecoded sprites",
            });
          }
        }
        if (sff.sprites.length === 0) {
          unsupported.report("sff", "image decoding", {
            location: files.sprite,
            fallback: "MockSpriteProvider supplies deterministic placeholder textures",
          });
        }
      }
    }

    let soundArchive: MugenCharacter["soundArchive"];
    if (files.sound) {
      const sndBuffer = vfs.readArrayBuffer(files.sound);
      if (sndBuffer) {
        const snd = parseSnd(sndBuffer);
        soundArchive = snd;
        for (const warning of snd.warnings) {
          diagnostics.push({
            severity: "warning",
            format: "snd",
            file: files.sound,
            message: warning,
          });
        }
      }
    }

    const palettes: MugenPalette[] = [];
    for (let index = 0; index < files.palettes.length; index += 1) {
      const palettePath = files.palettes[index]!;
      const buffer = vfs.readArrayBuffer(palettePath);
      if (!buffer) {
        continue;
      }
      const parsedAct = parseAct(buffer, palettePath);
      diagnostics.push(...parsedAct.diagnostics);
      if (parsedAct.data) {
        palettes.push({
          group: 1,
          index: index + 1,
          path: palettePath,
          colors: parsedAct.colors,
          data: parsedAct.data,
          colorCount: parsedAct.colorCount,
          transparentIndex: parsedAct.transparentIndex,
          raw: parsedAct.raw,
        });
      }
    }

    for (const controller of [...states.flatMap((state) => state.controllers), ...stateEntryControllers]) {
      if (!isRuntimeExecutableController(controller.type)) {
        unsupported.report(isZssPath(controller.source?.path) ? "zss" : "controller", controller.type || "Unknown", {
          location: `${controller.stateId}`,
          raw: controller.rawHeader,
          fallback: "Controller is parsed and listed but not executed",
        });
      }
    }

    reportIkemenFindings(unsupported, ikemen);

    const runtimeProgram = compileRuntimeProgram({
      commands,
      states,
      stateEntryControllers,
      animations,
      constants,
    });

    const compatibility = createCompatibilityReport({
      name: definition.info.displayName ?? definition.info.name,
      loaded: true,
      files,
      animations,
      commands,
      states,
      stateEntryControllers,
      runtimeProgram,
      mugenVersion: definition.info.mugenVersion,
      soundArchive,
      palettes,
      ikemen,
      zss: createZssCompatibilityReport(ikemen, parsedZssByPath, states, unsupported.list()),
      diagnostics,
      unsupported: unsupported.list(),
    });

    return {
      sourceName,
      defPath,
      definition,
      files,
      animations,
      commands,
      commandDefaults,
      commandRemap,
      states,
      stateSources: stateResolution.selections,
      stateEntryControllers,
      constants,
      runtimeProgram,
      spriteArchive,
      soundArchive,
      palettes,
      systemAssets,
      diagnostics,
      compatibility,
    };
  }

  async loadAt(sourceName: string, vfs: VirtualFileSystem, defPath: string): Promise<MugenCharacter> {
    return this.load(sourceName, vfs, { defPath });
  }

  private findDefPath(sourceName: string, resolver: PathResolver): string | undefined {
    const defs = resolver.findByExtension(".def");
    if (defs.length === 0) {
      return undefined;
    }
    const sourceBase = sourceName.replace(/\.(zip|def)$/i, "").toLowerCase();
    const characterDefs = defs.filter((path) => {
      const lowerPath = path.toLowerCase();
      return lowerPath.startsWith("chars/") || lowerPath.includes("/chars/");
    });
    const preferredPool = characterDefs.length > 0 ? characterDefs : defs;
    return (
      preferredPool.find((path) => path.toLowerCase().endsWith(`/${sourceBase}.def`)) ??
      preferredPool.find((path) => {
        const parts = path.split("/");
        const file = parts.at(-1)?.replace(/\.def$/i, "").toLowerCase();
        const parent = parts.at(-2)?.toLowerCase();
        return Boolean(file && parent && file === parent);
      }) ??
      preferredPool.find((path) => path.split("/").length === 1) ??
      preferredPool.sort((a, b) => a.length - b.length)[0]
    );
  }

  private resolveFiles(
    defPath: string,
    definition: MugenCharacter["definition"],
    resolver: PathResolver,
    diagnostics: MugenDiagnostic[],
    unsupported: UnsupportedFeatureTracker,
  ): ResolvedCharacterFiles {
    const files = definition.files;
    const missing: string[] = [];
    const resolve = (path: string | undefined, options: { allowGlobalCommon?: boolean } = {}): string | undefined => {
      const resolved = resolver.resolve(defPath, path);
      const fallback = path && options.allowGlobalCommon ? findGlobalCommon(path, resolver) : undefined;
      const finalPath = resolver.exists(resolved) ? resolved : fallback;
      if (path && !finalPath) {
        missing.push(path);
        diagnostics.push({
          severity: "warning",
          format: "loader",
          file: defPath,
          message: `Referenced file was not found: ${path}`,
        });
      }
      return finalPath;
    };
    const ikemenProfile = Boolean(definition.info.ikemenVersion?.trim());
    const resolveState = (path: string | undefined, options: { allowGlobalCommon?: boolean } = {}): string | undefined => {
      if (!path) {
        return undefined;
      }
      const direct = resolver.resolve(defPath, path);
      const directGlobal = options.allowGlobalCommon ? findGlobalCommon(path, resolver) : undefined;
      const directPath = [direct, directGlobal].find((candidate) => resolver.exists(candidate));
      const fallbackReference = isZssPath(path) ? undefined : `${path}.zss`;
      const fallback = fallbackReference
        ? [
            resolver.resolve(defPath, fallbackReference),
            options.allowGlobalCommon ? findGlobalCommon(fallbackReference, resolver) : undefined,
          ].find((candidate) => resolver.exists(candidate))
        : undefined;
      const selected = directPath ?? fallback;
      if (!selected) {
        missing.push(path);
        diagnostics.push({
          severity: "warning",
          format: "loader",
          file: defPath,
          message: `Referenced file was not found: ${path}`,
        });
        return undefined;
      }
      if (!isZssPath(selected)) {
        return selected;
      }
      if (ikemenProfile) {
        return selected;
      }
      const reference = findStateReferenceLocation(definition, defPath, path);
      unsupported.report("zss", fallback ? "ZSS fallback requires Ikemen profile" : "ZSS state source requires Ikemen profile", {
        severity: "error",
        location: reference.location,
        raw: reference.raw,
        fallback: "Declare ikemenversion before loading this ZSS state source; no ZSS states were compiled for the M.U.G.E.N profile.",
      });
      diagnostics.push({
        severity: "error",
        format: "zss",
        file: defPath,
        ...(reference.line === undefined ? {} : { line: reference.line }),
        raw: reference.raw,
        message: fallback
          ? `ZSS fallback is unavailable outside an Ikemen profile: ${path}`
          : `ZSS state source is unavailable outside an Ikemen profile: ${path}`,
      });
      return undefined;
    };

    return {
      def: defPath,
      cmd: resolve(files.cmd),
      cns: resolve(files.cns),
      states: (files.states ?? []).map((path) => resolveState(path)).filter((path): path is string => Boolean(path)),
      commonStates: (files.commonStates ?? [])
        .map((path) => resolveState(path, { allowGlobalCommon: true }))
        .filter((path): path is string => Boolean(path)),
      sprite: resolve(files.sprite),
      anim: resolve(files.anim),
      sound: resolve(files.sound),
      palettes: (files.palettes ?? []).map((path) => resolve(path)).filter((path): path is string => Boolean(path)),
      missing,
    };
  }
}

function findGlobalCommon(path: string, resolver: PathResolver): string | undefined {
  const name = path.replace(/\\/g, "/").split("/").at(-1);
  if (!name) {
    return undefined;
  }
  const candidates = resolver.findByBasename(name);
  return (
    candidates.find((candidate) => candidate.toLowerCase().includes("/data/")) ??
    candidates.find((candidate) => candidate.split("/").length <= 2) ??
    candidates[0]
  );
}

function resolveGlobalCommonStatePaths(
  config: MugenGameConfig | undefined,
  resolver: PathResolver,
  diagnostics: MugenDiagnostic[],
): string[] {
  if (!config) {
    return [];
  }
  const common = getConfigSection(config.rawSections, "Common");
  const configPath = config.gameSpace?.sourcePath ?? "data/mugen.cfg";
  const entries = Object.entries(common)
    .filter(([key]) => /^states\d*$/i.test(key))
    .sort(([left], [right]) => commonStateConfigRank(left) - commonStateConfigRank(right));
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
          message: `Referenced global common state file was not found: ${reference}`,
        });
        continue;
      }
      paths.push(resolved);
    }
  }
  return paths;
}

function resolveGlobalCommonCommandPaths(
  config: MugenGameConfig | undefined,
  resolver: PathResolver,
  diagnostics: MugenDiagnostic[],
): string[] {
  if (!config) {
    return [];
  }
  const common = getConfigSection(config.rawSections, "Common");
  const configPath = config.gameSpace?.sourcePath ?? "data/mugen.cfg";
  const entries = Object.entries(common)
    .filter(([key]) => /^cmd\d*$/i.test(key))
    .sort(([left], [right]) => commonCommandConfigRank(left) - commonCommandConfigRank(right));
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
          message: `Referenced global common command file was not found: ${reference}`,
        });
        continue;
      }
      paths.push(resolved);
    }
  }
  return paths;
}

function resolveGlobalCommonConstantPaths(
  config: MugenGameConfig | undefined,
  resolver: PathResolver,
  diagnostics: MugenDiagnostic[],
): string[] {
  if (!config) {
    return [];
  }
  const common = getConfigSection(config.rawSections, "Common");
  const configPath = config.gameSpace?.sourcePath ?? "data/mugen.cfg";
  const entries = Object.entries(common)
    .filter(([key]) => /^const\d*$/i.test(key))
    .sort(([left], [right]) => commonConstantConfigRank(left) - commonConstantConfigRank(right));
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
          message: `Referenced global common constant file was not found: ${reference}`,
        });
        continue;
      }
      paths.push(resolved);
    }
  }
  return paths;
}

function resolveGlobalCommonAnimationPaths(
  config: MugenGameConfig | undefined,
  resolver: PathResolver,
  diagnostics: MugenDiagnostic[],
): string[] {
  if (!config) {
    return [];
  }
  const common = getConfigSection(config.rawSections, "Common");
  const configPath = config.gameSpace?.sourcePath ?? "data/mugen.cfg";
  const entries = Object.entries(common)
    .filter(([key]) => /^air\d*$/i.test(key))
    .sort(([left], [right]) => commonAnimationConfigRank(left) - commonAnimationConfigRank(right));
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
          message: `Referenced global common animation file was not found: ${reference}`,
        });
        continue;
      }
      paths.push(resolved);
    }
  }
  return paths;
}

function getConfigSection(rawSections: Record<string, Record<string, string>>, expected: string): Record<string, string> {
  return Object.entries(rawSections).find(([section]) => section.toLowerCase() === expected.toLowerCase())?.[1] ?? {};
}

function commonStateConfigRank(key: string): number {
  const normalized = key.toLowerCase();
  return normalized === "states" ? 0 : Number(normalized.slice("states".length)) + 1;
}

function commonCommandConfigRank(key: string): number {
  const normalized = key.toLowerCase();
  return normalized === "cmd" ? 0 : Number(normalized.slice("cmd".length)) + 1;
}

function commonConstantConfigRank(key: string): number {
  const normalized = key.toLowerCase();
  return normalized === "const" ? 0 : Number(normalized.slice("const".length)) + 1;
}

function commonAnimationConfigRank(key: string): number {
  const normalized = key.toLowerCase();
  return normalized === "air" ? 0 : Number(normalized.slice("air".length)) + 1;
}

function reportIkemenFindings(
  unsupported: UnsupportedFeatureTracker,
  ikemen: ReturnType<typeof scanIkemenFeatures>,
): void {
  for (const finding of ikemen.findings) {
    unsupported.report("ikemen", finding.feature, {
      severity: finding.severity,
      location: finding.location,
      raw: finding.raw,
      fallback: finding.fallback,
    });
  }
}

function isZssPath(path: string | undefined): boolean {
  return /\.zss$/i.test(path ?? "");
}

function findStateReferenceLocation(
  definition: MugenCharacter["definition"],
  defPath: string,
  reference: string,
): { location: string; line?: number; raw?: string } {
  const normalizedReference = reference.trim().replace(/^['"]|['"]$/g, "").toLowerCase();
  for (let index = 0; index < definition.rawLines.length; index += 1) {
    const raw = definition.rawLines[index] ?? "";
    const match = /^\s*(st\d*|stcommon\d*|common\d*)\s*=\s*(.*?)\s*(?:;.*)?$/i.exec(raw);
    if (!match?.[2]) {
      continue;
    }
    const value = match[2].trim().replace(/^['"]|['"]$/g, "").toLowerCase();
    if (value === normalizedReference) {
      const line = index + 1;
      return { location: `${defPath}:${line}`, line, raw };
    }
  }
  return { location: defPath, raw: reference };
}

function createZssCompatibilityReport(
  ikemen: ReturnType<typeof scanIkemenFeatures>,
  parsedZssByPath: ReadonlyMap<string, { text: string; parsed: ZssParseResult }>,
  states: readonly MugenCharacter["states"][number][],
  unsupported: ReturnType<UnsupportedFeatureTracker["list"]>,
): CompatibilityReport["zss"] {
  const compiledSourcePaths = [...parsedZssByPath.entries()]
    .filter(([, value]) => value.parsed.zss.status === "compiled")
    .map(([path]) => path)
    .sort((left, right) => left.localeCompare(right));
  const zssControllers = states.flatMap((state) => state.controllers).filter((controller) => isZssPath(controller.source?.path));
  const compiledStateIds = [...new Set([
    ...states.filter((state) => isZssPath(state.source?.path)).map((state) => state.id),
    ...zssControllers.map((controller) => controller.stateId),
  ])].sort((left, right) => left - right);
  const blocked = unsupported.filter((item) => item.format === "zss");
  const recognized = [...new Set(ikemen.files.zss)].sort((left, right) => left.localeCompare(right));
  if (recognized.length === 0 && compiledSourcePaths.length === 0 && blocked.length === 0) {
    return undefined;
  }
  return {
    recognized,
    compiled: {
      sourcePaths: compiledSourcePaths,
      stateIds: compiledStateIds,
      controllers: zssControllers.length,
    },
    executed: {
      stateIds: [],
      controllers: 0,
    },
    blocked: {
      count: blocked.reduce((total, item) => total + item.count, 0),
      features: [...new Set(blocked.map((item) => item.feature))].sort((left, right) => left.localeCompare(right)),
      locations: [...new Set(blocked.map((item) => item.location).filter((location): location is string => Boolean(location)))].sort(
        (left, right) => left.localeCompare(right),
      ),
    },
  };
}

function createEmptyFiles(): ResolvedCharacterFiles {
  return {
    states: [],
    commonStates: [],
    palettes: [],
    missing: [],
  };
}
