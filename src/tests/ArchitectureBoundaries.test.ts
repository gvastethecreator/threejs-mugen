import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcRoot = resolve(fileURLToPath(new URL("../", import.meta.url)));
const engineRoot = resolve(srcRoot, "engine");
const mugenRoot = resolve(srcRoot, "mugen");
const appRoot = resolve(srcRoot, "app");
const gameRoot = resolve(srcRoot, "game");

describe("Architecture boundaries", () => {
  it("keeps the shared engine core independent from MUGEN, app, game, and renderer packages", () => {
    const violations = collectImportViolations(engineRoot, (importInfo) => {
      if (importInfo.specifier === "three" || importInfo.specifier === "jszip") {
        return "shared engine core cannot depend on renderer or package-loader libraries";
      }
      if (importInfo.resolvedPath && isWithin(importInfo.resolvedPath, mugenRoot)) {
        return "shared engine core cannot import MUGEN compatibility code";
      }
      if (importInfo.resolvedPath && isWithin(importInfo.resolvedPath, appRoot)) {
        return "shared engine core cannot import Studio/App surfaces";
      }
      if (importInfo.resolvedPath && isWithin(importInfo.resolvedPath, gameRoot)) {
        return "shared engine core cannot import game/render adapters";
      }
      return undefined;
    });

    expect(violations).toEqual([]);
  });

  it("keeps MUGEN parser/runtime code renderer-independent", () => {
    const violations = collectImportViolations(mugenRoot, (importInfo) => {
      if (importInfo.specifier === "three") {
        return "MUGEN parser/runtime code cannot import Three.js";
      }
      if (importInfo.resolvedPath && isWithin(importInfo.resolvedPath, appRoot)) {
        return "MUGEN parser/runtime code cannot import Studio/App surfaces";
      }
      if (importInfo.resolvedPath && isWithin(importInfo.resolvedPath, gameRoot)) {
        return "MUGEN parser/runtime code cannot import game/render adapters";
      }
      return undefined;
    });

    expect(violations).toEqual([]);
  }, 15_000);
});

type ImportInfo = {
  file: string;
  specifier: string;
  resolvedPath?: string;
};

function collectImportViolations(root: string, predicate: (importInfo: ImportInfo) => string | undefined): string[] {
  return listTypeScriptFiles(root).flatMap((file) =>
    parseImportSpecifiers(readFileSync(file, "utf8")).flatMap((specifier) => {
      const importInfo: ImportInfo = {
        file,
        specifier,
        resolvedPath: resolveLocalImport(file, specifier),
      };
      const reason = predicate(importInfo);
      return reason ? [`${relative(srcRoot, file)} imports '${specifier}': ${reason}`] : [];
    }),
  );
}

function listTypeScriptFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root).flatMap((entry) => {
    const path = resolve(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      return listTypeScriptFiles(path);
    }
    return path.endsWith(".ts") && !path.endsWith(".d.ts") ? [path] : [];
  });
}

function parseImportSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const staticImportPattern = /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportPattern = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of source.matchAll(staticImportPattern)) {
    specifiers.push(match[1]!);
  }
  for (const match of source.matchAll(dynamicImportPattern)) {
    specifiers.push(match[1]!);
  }
  return specifiers;
}

function resolveLocalImport(file: string, specifier: string): string | undefined {
  if (!specifier.startsWith(".")) {
    return undefined;
  }
  return resolve(dirname(file), specifier);
}

function isWithin(path: string, root: string): boolean {
  const relativePath = relative(root, path);
  return relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
}
