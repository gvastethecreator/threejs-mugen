export function normalizeVirtualPath(path: string): string {
  const normalized = path
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part.length > 0 && part !== ".")
    .reduce<string[]>((parts, part) => {
      if (part === "..") {
        parts.pop();
      } else {
        parts.push(part);
      }
      return parts;
    }, [])
    .join("/");

  return normalized;
}

export function dirname(path: string): string {
  const normalized = normalizeVirtualPath(path);
  const slash = normalized.lastIndexOf("/");
  return slash >= 0 ? normalized.slice(0, slash) : "";
}

export function basename(path: string): string {
  const normalized = normalizeVirtualPath(path);
  const slash = normalized.lastIndexOf("/");
  return slash >= 0 ? normalized.slice(slash + 1) : normalized;
}

export class PathResolver {
  private readonly caseMap = new Map<string, string>();

  constructor(paths: string[]) {
    for (const path of paths) {
      const normalized = normalizeVirtualPath(path);
      this.caseMap.set(normalized.toLowerCase(), normalized);
    }
  }

  resolve(basePath: string, referencedPath: string | undefined): string | undefined {
    if (!referencedPath) {
      return undefined;
    }

    const stripped = referencedPath.trim().replace(/^["']|["']$/g, "");
    const normalized = normalizeVirtualPath(stripped.includes("/") || stripped.includes("\\")
      ? `${dirname(basePath)}/${stripped}`
      : `${dirname(basePath)}/${stripped}`);
    return this.caseMap.get(normalized.toLowerCase()) ?? normalized;
  }

  exists(path: string | undefined): boolean {
    if (!path) {
      return false;
    }
    return this.caseMap.has(normalizeVirtualPath(path).toLowerCase());
  }

  findByExtension(extension: string): string[] {
    const suffix = extension.toLowerCase().startsWith(".")
      ? extension.toLowerCase()
      : `.${extension.toLowerCase()}`;
    return [...this.caseMap.values()].filter((path) => path.toLowerCase().endsWith(suffix));
  }

  findByBasename(name: string): string[] {
    const lowerName = name.toLowerCase();
    return [...this.caseMap.values()].filter((path) => basename(path).toLowerCase() === lowerName);
  }
}
