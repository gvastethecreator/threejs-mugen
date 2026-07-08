import type { MugenGameConfig } from "../model/MugenConfig";
import { parseMugenConfig } from "../parsers/MugenConfigParser";
import type { PathResolver } from "./PathResolver";
import type { VirtualFileSystem } from "./VirtualFileSystem";

const CONFIG_BASENAMES = ["mugen.cfg", "config.ini", "default_config.ini", "defaultConfig.ini"];

export function loadMugenGameConfig(vfs: VirtualFileSystem, resolver: PathResolver): MugenGameConfig | undefined {
  const configPath = findMugenConfigPath(resolver);
  if (!configPath) {
    return undefined;
  }
  return parseMugenConfig(vfs.readText(configPath) ?? "", configPath);
}

export function findMugenConfigPath(resolver: PathResolver): string | undefined {
  const candidates = unique(CONFIG_BASENAMES.flatMap((basename) => resolver.findByBasename(basename)));
  return (
    candidates.find((path) => path.toLowerCase().endsWith("/data/mugen.cfg")) ??
    candidates.find((path) => path.toLowerCase() === "data/mugen.cfg") ??
    candidates.find((path) => path.toLowerCase().endsWith("/mugen.cfg")) ??
    candidates.find((path) => path.toLowerCase().endsWith("/data/config.ini")) ??
    candidates.find((path) => path.toLowerCase() === "config.ini") ??
    candidates.find((path) => path.toLowerCase().endsWith("/default_config.ini")) ??
    candidates.find((path) => path.toLowerCase().endsWith("/defaultconfig.ini")) ??
    candidates[0]
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
