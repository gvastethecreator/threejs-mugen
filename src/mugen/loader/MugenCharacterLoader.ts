import { createCompatibilityReport } from "../compatibility/CompatibilityReport";
import { scanIkemenFeatures } from "../compatibility/IkemenFeatureScanner";
import { UnsupportedFeatureTracker } from "../compatibility/UnsupportedFeatureTracker";
import { compileRuntimeProgram, isRuntimeExecutableController } from "../compiler/StateControllerCompiler";
import type { MugenCharacter, ResolvedCharacterFiles } from "../model/MugenCharacter";
import type { MugenDiagnostic } from "../model/MugenAnimation";
import { parseAir } from "../parsers/AirParser";
import { parseCmd } from "../parsers/CmdParser";
import { parseCns } from "../parsers/CnsParser";
import { parseDef } from "../parsers/DefParser";
import { parseSnd } from "../parsers/SndParser";
import { SffParser } from "../parsers/SffParser";
import { PathResolver } from "./PathResolver";
import { loadMugenSystemAssets } from "./MugenSystemAssetsLoader";
import type { VirtualFileSystem } from "./VirtualFileSystem";

export class MugenCharacterLoader {
  async load(sourceName: string, vfs: VirtualFileSystem): Promise<MugenCharacter> {
    const diagnostics: MugenDiagnostic[] = [];
    const unsupported = new UnsupportedFeatureTracker();
    const resolver = new PathResolver(vfs.listFiles());
    const ikemen = scanIkemenFeatures({
      paths: vfs.listFiles(),
      readText: (path) => vfs.readText(path),
    });
    for (const finding of ikemen.findings) {
      unsupported.report("ikemen", finding.feature, {
        severity: finding.severity,
        location: finding.location,
        raw: finding.raw,
        fallback: finding.fallback,
      });
    }
    const defPath = this.findDefPath(sourceName, resolver);

    if (!defPath) {
      diagnostics.push({
        severity: "error",
        format: "loader",
        message: "No .def file found in character package",
      });
      const files = createEmptyFiles();
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
    const files = this.resolveFiles(defPath, definition.files, resolver, diagnostics);
    const systemAssets = await loadMugenSystemAssets(vfs, resolver);
    if (systemAssets) {
      diagnostics.push(...systemAssets.diagnostics);
    }

    const animations = new Map();
    if (files.anim) {
      const parsedAir = parseAir(vfs.readText(files.anim) ?? "", files.anim);
      for (const [id, action] of parsedAir.actions) {
        animations.set(id, action);
      }
      diagnostics.push(...parsedAir.diagnostics);
    }

    let commands: MugenCharacter["commands"] = [];
    let commandDefaults: MugenCharacter["commandDefaults"];
    let commandRemap: MugenCharacter["commandRemap"];
    let stateEntryControllers: MugenCharacter["stateEntryControllers"] = [];
    if (files.cmd) {
      const cmdText = vfs.readText(files.cmd) ?? "";
      const parsedCmd = parseCmd(cmdText, files.cmd);
      commands = parsedCmd.commands;
      commandDefaults = parsedCmd.defaults;
      commandRemap = parsedCmd.remap;
      diagnostics.push(...parsedCmd.diagnostics);
      const parsedCmdStateEntries = parseCns(cmdText, files.cmd);
      stateEntryControllers = parsedCmdStateEntries.controllers.filter((controller) => controller.stateId === -1);
      diagnostics.push(...parsedCmdStateEntries.diagnostics);
    }

    const states: MugenCharacter["states"] = [];
    const constants: MugenCharacter["constants"] = {};
    const stateFiles = [files.cns, ...files.states, ...files.commonStates].filter((path): path is string => Boolean(path));
    for (const stateFile of stateFiles) {
      const parsedCns = parseCns(vfs.readText(stateFile) ?? "", stateFile);
      states.push(...parsedCns.states);
      Object.assign(constants, parsedCns.constants);
      diagnostics.push(...parsedCns.diagnostics);
    }

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

    for (const controller of [...states.flatMap((state) => state.controllers), ...stateEntryControllers]) {
      if (!isRuntimeExecutableController(controller.type)) {
        unsupported.report("controller", controller.type || "Unknown", {
          location: `${controller.stateId}`,
          raw: controller.rawHeader,
          fallback: "Controller is parsed and listed but not executed",
        });
      }
    }

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
      ikemen,
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
      stateEntryControllers,
      constants,
      runtimeProgram,
      spriteArchive,
      soundArchive,
      systemAssets,
      diagnostics,
      compatibility,
    };
  }

  private findDefPath(sourceName: string, resolver: PathResolver): string | undefined {
    const defs = resolver.findByExtension(".def");
    if (defs.length === 0) {
      return undefined;
    }
    const sourceBase = sourceName.replace(/\.(zip|def)$/i, "").toLowerCase();
    const characterDefs = defs.filter((path) => path.toLowerCase().includes("/chars/"));
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
    files: MugenCharacter["definition"]["files"],
    resolver: PathResolver,
    diagnostics: MugenDiagnostic[],
  ): ResolvedCharacterFiles {
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

    return {
      def: defPath,
      cmd: resolve(files.cmd),
      cns: resolve(files.cns),
      states: (files.states ?? []).map((path) => resolve(path)).filter((path): path is string => Boolean(path)),
      commonStates: (files.commonStates ?? [])
        .map((path) => resolve(path, { allowGlobalCommon: true }))
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

function createEmptyFiles(): ResolvedCharacterFiles {
  return {
    states: [],
    commonStates: [],
    palettes: [],
    missing: [],
  };
}
