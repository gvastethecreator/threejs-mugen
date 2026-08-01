import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contentPackFighters } from "../mugen/runtime/demoFighters";
import { azoteaWifiStage, patioDojoPublicidadStage, rooftopDojoStage, terminalSupermercado24hStage } from "../mugen/runtime/demoStage";
import { parseAssetPermissionMetadata } from "../app/StudioAssetPermission";

describe("content pack stage registry", () => {
  it("exposes the four verified parallax packs as playable stage definitions", () => {
    const stages = [rooftopDojoStage, patioDojoPublicidadStage, terminalSupermercado24hStage, azoteaWifiStage];
    expect(stages.map((stage) => stage.id)).toEqual([
      "rooftop-dojo",
      "patio-dojo-publicidad",
      "terminal-supermercado-24h",
      "azotea-wifi",
    ]);
    for (const stage of stages) {
      expect(stage.layers).toHaveLength(3);
      expect(stage.layers.every((layer) => layer.assetUrl?.startsWith("/stages/"))).toBe(true);
      expect(new Set(stage.layers.map((layer) => layer.deltaX)).size).toBe(3);
      expect(stage.layers.map((layer) => layer.deltaX)).toEqual(
        [...stage.layers.map((layer) => layer.deltaX)].sort((left, right) => left - right),
      );
      const deltaY = stage.layers.map((layer) => layer.deltaY ?? Number.NaN);
      expect(deltaY.every((value) => Number.isFinite(value))).toBe(true);
      expect(new Set(deltaY).size).toBe(3);
      expect(deltaY).toEqual(
        [...deltaY].sort((left, right) => left - right),
      );
      const stageRoot = resolve(process.cwd(), "public", "stages", stage.id);
      expect(existsSync(resolve(stageRoot, "background-pack.json"))).toBe(true);
      expect(existsSync(resolve(stageRoot, "source-provenance.json"))).toBe(true);
      expect(existsSync(resolve(stageRoot, "regeneration-map.json"))).toBe(true);
      const backgroundPack = JSON.parse(readFileSync(resolve(stageRoot, "background-pack.json"), "utf8")) as {
        layers?: Array<{ role?: string; parallax_x?: number; parallax_y?: number; path?: string }>;
      };
      expect(backgroundPack.layers).toHaveLength(3);
      expect(backgroundPack.layers?.map((layer) => layer.role)).toEqual(["far", "mid", "near"]);
      expect(backgroundPack.layers?.map((layer) => layer.parallax_x)).toEqual(stage.layers.map((layer) => layer.deltaX));
      expect(backgroundPack.layers?.map((layer) => layer.parallax_y)).toEqual(deltaY);
      expect(backgroundPack.layers?.every((layer) => typeof layer.path === "string" && layer.path.startsWith("source/"))).toBe(true);
    }
  });

  it("keeps the fourteen content-pack fighters selectable", () => {
    const expected = [
      "don-rayo",
      "la-jefa-del-combo",
      "turbo-abuela",
      "tanque-de-carton",
      "monje-wifi",
      "sombra-del-super",
      "mara-cinta",
      "toro-pixel",
      "nico-guante",
      "luna-codo",
      "sargento-pila",
      "bruno-giro",
      "vera-patada",
      "rulo-viento",
    ];
    expect(expected.every((id) => contentPackFighters.some((fighter) => fighter.id === id))).toBe(true);
  });

  it("registers the eight classic recolors as runtime atlas packages", () => {
    const classicIds = [
      "mara-cinta",
      "toro-pixel",
      "nico-guante",
      "luna-codo",
      "sargento-pila",
      "bruno-giro",
      "vera-patada",
      "rulo-viento",
    ];
    for (const id of classicIds) {
      const root = resolve(process.cwd(), "public", "characters", id);
      expect(existsSync(resolve(root, "sprite-sheet-alpha.png"))).toBe(true);
      expect(existsSync(resolve(root, "manifest.json"))).toBe(true);
      expect(existsSync(resolve(root, "base-source.png"))).toBe(true);
      expect(existsSync(resolve(root, "asset-permission.json"))).toBe(true);
      expect(existsSync(resolve(root, "LICENSE.txt"))).toBe(true);
      expect(existsSync(resolve(root, "runtime-states.json"))).toBe(true);
      expect(existsSync(resolve(root, "states.contract.json"))).toBe(true);
      const prefix = id.split("-")[0]!;
      for (const extension of ["def", "cmd", "cns", "air"]) {
        expect(existsSync(resolve(root, "mugen", `${prefix}.${extension}`))).toBe(true);
      }
      const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8")) as {
        animation?: { rows?: Record<string, { frames?: number }> };
      };
      expect(manifest.animation?.rows?.idle?.frames).toBe(4);
      expect(manifest.animation?.rows?.["walk-forward"]?.frames).toBe(8);
      expect(manifest.animation?.rows?.special?.frames).toBe(8);
      expect(Object.keys(manifest.animation?.rows ?? {})).toHaveLength(14);
      const permission = JSON.parse(readFileSync(resolve(root, "asset-permission.json"), "utf8")) as {
        assetId?: string;
        sourceFiles?: unknown[];
        outputFiles?: unknown[];
      };
      expect(parseAssetPermissionMetadata(permission)).toBeDefined();
      expect(permission.assetId).toBe(id);
      expect(permission.sourceFiles?.length).toBeGreaterThanOrEqual(2);
      expect(permission.outputFiles?.length).toBeGreaterThanOrEqual(10);
    }
  });
});
