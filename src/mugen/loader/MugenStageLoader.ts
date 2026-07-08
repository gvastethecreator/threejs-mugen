import type { MugenDiagnostic } from "../model/MugenAnimation";
import type { SffArchive } from "../model/MugenSprite";
import type { MugenStagePackage } from "../model/MugenStagePackage";
import { parseStageDef, stageDefToRuntime } from "../parsers/StageDefParser";
import { SffParser } from "../parsers/SffParser";
import { PathResolver, basename, dirname, normalizeVirtualPath } from "./PathResolver";
import { loadMugenGameConfig } from "./MugenConfigLoader";
import type { VirtualFileSystem } from "./VirtualFileSystem";

export class MugenStageLoader {
  async loadAll(sourceName: string, vfs: VirtualFileSystem): Promise<MugenStagePackage[]> {
    const resolver = new PathResolver(vfs.listFiles());
    const gameConfig = loadMugenGameConfig(vfs, resolver);
    const ids = new Map<string, number>();
    const stages = resolver
      .findByExtension(".def")
      .filter((path) => isStageDefPath(path))
      .map((defPath) => withUniqueStageId(this.loadStage(sourceName, defPath, vfs, resolver, gameConfig), ids));

    return Promise.all(stages.map((stage) => this.loadStageSprites(stage, vfs)));
  }

  private loadStage(
    sourceName: string,
    defPath: string,
    vfs: VirtualFileSystem,
    resolver: PathResolver,
    gameConfig: ReturnType<typeof loadMugenGameConfig>,
  ): MugenStagePackage {
    const diagnostics: MugenDiagnostic[] = gameConfig?.diagnostics.slice() ?? [];
    const definition = parseStageDef(vfs.readText(defPath) ?? "", defPath);
    diagnostics.push(...definition.diagnostics);
    const missing: string[] = [];
    const resolve = (path: string | undefined): string | undefined => {
      const resolved = resolveStageFile(path, defPath, resolver);
      if (path && !resolved) {
        missing.push(path);
        diagnostics.push({
          severity: "warning",
          format: "stage",
          file: defPath,
          message: `Referenced stage file was not found: ${path}`,
        });
      }
      return resolved;
    };
    const id = `stage-${slugify(definition.info.displayName ?? definition.info.name ?? basename(defPath).replace(/\.def$/i, ""))}`;

    return {
      sourceName,
      defPath,
      definition,
      stage: stageDefToRuntime(definition, id, gameConfig?.gameSpace),
      files: {
        def: defPath,
        sprite: resolve(definition.files.sprite),
        music: resolve(definition.files.music),
        missing,
      },
      diagnostics,
    };
  }

  private async loadStageSprites(stagePackage: MugenStagePackage, vfs: VirtualFileSystem): Promise<MugenStagePackage> {
    const spritePath = stagePackage.files.sprite;
    if (!spritePath) {
      return stagePackage;
    }
    const buffer = vfs.readArrayBuffer(spritePath);
    if (!buffer) {
      return stagePackage;
    }

    let spriteArchive: SffArchive | undefined;
    try {
      spriteArchive = await new SffParser().load(buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ...stagePackage,
        diagnostics: [
          ...stagePackage.diagnostics,
          {
            severity: "warning",
            format: "sff",
            file: spritePath,
            message: `Stage SFF could not be parsed: ${message}`,
          },
        ],
      };
    }

    return {
      ...stagePackage,
      spriteArchive,
      diagnostics: [
        ...stagePackage.diagnostics,
        ...spriteArchive.warnings.map((message): MugenDiagnostic => ({
          severity: "warning",
          format: "sff",
          file: spritePath,
          message,
        })),
      ],
    };
  }
}

function withUniqueStageId(stagePackage: MugenStagePackage, ids: Map<string, number>): MugenStagePackage {
  const baseId = stagePackage.stage.id;
  const count = ids.get(baseId) ?? 0;
  ids.set(baseId, count + 1);
  if (count === 0) {
    return stagePackage;
  }
  return {
    ...stagePackage,
    stage: {
      ...stagePackage.stage,
      id: `${baseId}-${count + 1}`,
    },
  };
}

function resolveStageFile(path: string | undefined, defPath: string, resolver: PathResolver): string | undefined {
  if (!path) {
    return undefined;
  }
  const cleaned = path.trim().replace(/^["']|["']$/g, "");
  const normalizedDef = normalizeVirtualPath(defPath);
  const stagesIndex = normalizedDef.toLowerCase().lastIndexOf("/stages/");
  const packageRoot = stagesIndex >= 0 ? normalizedDef.slice(0, stagesIndex) : "";
  const candidates = [
    resolver.resolve(defPath, cleaned),
    normalizeVirtualPath(cleaned),
    packageRoot ? normalizeVirtualPath(`${packageRoot}/${cleaned}`) : undefined,
    normalizeVirtualPath(`data/${cleaned}`),
    packageRoot ? normalizeVirtualPath(`${packageRoot}/data/${cleaned}`) : undefined,
    normalizeVirtualPath(`${dirname(defPath)}/${basename(cleaned)}`),
  ];
  for (const candidate of candidates) {
    if (resolver.exists(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function isStageDefPath(path: string): boolean {
  const lower = path.toLowerCase();
  return lower.includes("/stages/") || lower.startsWith("stages/");
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "imported";
}
