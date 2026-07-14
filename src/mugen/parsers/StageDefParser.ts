import type {
  MugenStageBgCtrl,
  MugenStageBgCtrlDef,
  MugenStageDefinition,
  MugenStageLayer,
  MugenStageLayerClip,
  MugenStageLayerTrans,
} from "../model/MugenStage";
import type { MugenGameSpaceConfig } from "../model/MugenConfig";
import type { MugenStageDef } from "../model/MugenStagePackage";
import { parseAir } from "./AirParser";
import { createDiagnostic, parseKeyValue, parseNumber, parseTextLines, unquote } from "./text";

export function parseStageDef(text: string, file = "stage.def"): MugenStageDef {
  const lines = parseTextLines(text);
  const rawSections: Record<string, Record<string, string>> = {};
  const diagnostics: MugenStageDef["diagnostics"] = [];
  const embeddedActions = parseAir(extractEmbeddedActionText(text), file);
  let currentSection = "";

  for (const line of lines) {
    if (!line.content) {
      continue;
    }
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line.content);
    if (sectionMatch) {
      currentSection = sectionMatch[1]?.trim() ?? "";
      rawSections[currentSection] ??= {};
      continue;
    }
    const pair = parseKeyValue(line.content);
    if (!pair) {
      if (/^Begin\s+Action\s+-?\d+$/i.test(currentSection)) {
        continue;
      }
      diagnostics.push(
        createDiagnostic("warning", "Unrecognized stage DEF line", {
          format: "stage",
          file,
          line: line.number,
          raw: line.raw,
        }),
      );
      continue;
    }
    rawSections[currentSection] ??= {};
    rawSections[currentSection]![pair.key] = unquote(pair.value);
  }

  const info = getSection(rawSections, "Info");
  const bgdef = getSection(rawSections, "BGDef");
  const music = getSection(rawSections, "Music");
  const bgControllers = parseStageBgControllers(rawSections);
  diagnostics.push(...embeddedActions.diagnostics);

  return {
    info: {
      name: getValue(info, "name"),
      displayName: getValue(info, "displayname"),
      versionDate: getValue(info, "versiondate"),
      mugenVersion: getValue(info, "mugenversion"),
      author: getValue(info, "author"),
    },
    files: {
      sprite: getValue(bgdef, "spr"),
      music: getValue(music, "bgmusic"),
    },
    rawSections,
    rawLines: lines.map((line) => line.raw),
    diagnostics,
    animations: embeddedActions.actions,
    bgControllers,
  };
}

export function stageDefToRuntime(
  definition: MugenStageDef,
  id: string,
  gameSpace?: MugenGameSpaceConfig,
): MugenStageDefinition {
  const raw = definition.rawSections;
  const camera = getSection(raw, "Camera");
  const player = getSection(raw, "PlayerInfo");
  const stageInfo = getSection(raw, "StageInfo");
  const boundLeft = numberValue(camera, "boundleft") ?? -320;
  const boundRight = numberValue(camera, "boundright") ?? 320;
  const localcoord = pairValue(stageInfo, "localcoord") ?? [320, 240];
  const zOffset = numberValue(stageInfo, "zoffset") ?? 200;
  const floorY = 0;
  const cameraStartY = localcoord[1] - zOffset + (numberValue(camera, "starty") ?? 0) + 72;
  const zoomOut = numberValue(camera, "zoomout") ?? 1;
  const zoomIn = numberValue(camera, "zoomin") ?? zoomOut;
  const topBound = numberValue(player, "topbound") ?? 0;
  const bottomBound = numberValue(player, "botbound") ?? 0;

  return {
    id,
    displayName: definition.info.displayName ?? definition.info.name ?? id,
    ...(gameSpace ? { gameSpace } : {}),
    floorY,
    zOffset,
    localCoord: {
      width: localcoord[0],
      height: localcoord[1],
    },
    bounds: {
      left: boundLeft,
      right: boundRight,
    },
    ...(topBound === bottomBound
      ? {}
      : { depthBounds: { top: Math.min(topBound, bottomBound), bottom: Math.max(topBound, bottomBound) } }),
    camera: {
      startX: numberValue(camera, "startx") ?? 0,
      startY: cameraStartY,
      zoom: clampZoom((zoomOut + zoomIn) / 2),
    },
    ...(booleanValue(stageInfo, "resetbg") === undefined
      ? {}
      : { resetBackgroundBetweenRounds: booleanValue(stageInfo, "resetbg") }),
    playerStart: {
      p1: {
        x: numberValue(player, "p1startx") ?? -70,
        y: floorY + (numberValue(player, "p1starty") ?? 0),
        z: numberValue(player, "p1startz") ?? 0,
        facing: normalizeFacing(numberValue(player, "p1facing"), 1),
      },
      p2: {
        x: numberValue(player, "p2startx") ?? 70,
        y: floorY + (numberValue(player, "p2starty") ?? 0),
        z: numberValue(player, "p2startz") ?? 0,
        facing: normalizeFacing(numberValue(player, "p2facing"), -1),
      },
    },
    layers: buildPlaceholderLayers(raw, localcoord),
    animations: definition.animations,
    bgControllers: definition.bgControllers,
  };
}

function buildPlaceholderLayers(
  rawSections: Record<string, Record<string, string>>,
  localcoord: [number, number],
): MugenStageLayer[] {
  const bgSections = Object.entries(rawSections).filter(([section]) => /^BG\b/i.test(section) && section.toLowerCase() !== "bgdef");
  if (bgSections.length === 0) {
    return [
      { id: "imported-backdrop", color: "#18212b", y: 86, width: 900, height: 420, deltaX: 0.4, opacity: 1 },
      { id: "imported-floor", color: "#202b35", y: -42, width: 900, height: 84, deltaX: 1, opacity: 1 },
    ];
  }

  return bgSections.slice(0, 8).map(([section, values], index) => {
    const start = pairValue(values, "start") ?? [0, index < 2 ? 88 - index * 40 : -42 + (index % 3) * 16];
    const delta = pairValue(values, "delta") ?? [1, 1];
    const velocity = pairValue(values, "velocity");
    const sprite = pairValue(values, "spriteno");
    const spriteLabel = getValue(values, "spriteno") ?? `${index},0`;
    const actionNo = numberValue(values, "actionno");
    const layerNo = numberValue(values, "layerno") ?? 0;
    const tile = pairValue(values, "tile");
    const tilespacing = pairValue(values, "tilespacing");
    const controlId = numberValue(values, "id");
    const trans = stageLayerTrans(values);
    const clip = stageLayerClip(values, localcoord);
    const mask = booleanValue(values, "mask");
    return {
      id: `${section} ${spriteLabel}`.trim(),
      sectionName: section,
      type: getValue(values, "type"),
      controlId,
      color: stageLayerColor(index, layerNo),
      x: start[0] ?? 0,
      y: localcoord[1] - (start[1] ?? 0) - 40,
      width: Math.max(640, localcoord[0] * 3),
      height: index === 0 ? 360 : 72 + (index % 3) * 18,
      deltaX: delta[0] ?? 1,
      deltaY: delta[1] ?? 1,
      opacity: layerNo > 0 ? 0.72 : 0.92,
      layerNo,
      startX: start[0] ?? 0,
      startY: start[1] ?? 0,
      spriteGroup: sprite?.[0],
      spriteIndex: sprite?.[1],
      actionNo,
      ...(velocity ? { velocity: { x: velocity[0], y: velocity[1] } } : {}),
      trans,
      clip,
      mask,
      tile: tile
        ? {
            x: tile[0],
            y: tile[1],
            spacingX: tilespacing?.[0],
            spacingY: tilespacing?.[1],
          }
        : undefined,
    };
  });
}

function parseStageBgControllers(rawSections: Record<string, Record<string, string>>): MugenStageBgCtrlDef[] {
  const groups: MugenStageBgCtrlDef[] = [];
  let current: MugenStageBgCtrlDef | undefined;

  for (const [section, values] of Object.entries(rawSections)) {
    const ctrlDefName = matchBgCtrlDefSection(section);
    if (ctrlDefName !== undefined) {
      current = {
        name: ctrlDefName,
        loopTime: numberValue(values, "looptime"),
        ctrlIds: numberListValue(values, "ctrlid"),
        controllers: [],
        rawParams: { ...values },
      };
      groups.push(current);
      continue;
    }

    const ctrlName = matchBgCtrlSection(section);
    if (ctrlName !== undefined) {
      current ??= {
        name: "default",
        controllers: [],
        rawParams: {},
      };
      if (!groups.includes(current)) {
        groups.push(current);
      }
      current.controllers.push(parseStageBgCtrl(ctrlName, values, current));
    }
  }

  return groups;
}

function parseStageBgCtrl(
  name: string | undefined,
  values: Record<string, string>,
  group: MugenStageBgCtrlDef,
): MugenStageBgCtrl {
  const time = numberListValue(values, "time") ?? [0];
  const params = controllerParams(values);
  return {
    name,
    type: (getValue(values, "type") ?? "null").trim().toLowerCase(),
    timing: {
      start: time[0] ?? 0,
      end: time[1] ?? time[0] ?? 0,
      loopTime: time[2] ?? group.loopTime,
      ...(group.loopTime === undefined ? {} : { groupLoopTime: group.loopTime }),
    },
    ctrlIds: numberListValue(values, "ctrlid") ?? group.ctrlIds,
    params,
    rawParams: { ...values },
  };
}

function matchBgCtrlDefSection(section: string): string | undefined {
  const match = /^BGCtrlDef\b\s*(.*)$/i.exec(section.trim());
  return match ? normalizeOptionalName(match[1]) : undefined;
}

function matchBgCtrlSection(section: string): string | undefined {
  const match = /^BGCtrl\b\s*(.*)$/i.exec(section.trim());
  if (!match || /^BGCtrlDef\b/i.test(section.trim())) {
    return undefined;
  }
  return normalizeOptionalName(match[1]);
}

function normalizeOptionalName(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function controllerParams(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([key]) => !["type", "time", "ctrlid"].includes(key.toLowerCase())));
}

function extractEmbeddedActionText(text: string): string {
  const lines = parseTextLines(text);
  const output: string[] = [];
  let inAction = false;
  for (const line of lines) {
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line.content);
    if (sectionMatch) {
      const section = sectionMatch[1]?.trim() ?? "";
      inAction = /^Begin\s+Action\s+-?\d+$/i.test(section);
    }
    if (inAction) {
      output.push(line.raw);
    }
  }
  return output.join("\n");
}

function stageLayerColor(index: number, layerNo: number): string {
  const palette = layerNo > 0 ? ["#384455", "#2f5060", "#44543a"] : ["#111821", "#1f2e38", "#263845", "#202a33"];
  return palette[index % palette.length] ?? "#202a33";
}

function getSection(rawSections: Record<string, Record<string, string>>, expected: string): Record<string, string> {
  return Object.entries(rawSections).find(([section]) => section.toLowerCase() === expected.toLowerCase())?.[1] ?? {};
}

function getValue(section: Record<string, string>, expected: string): string | undefined {
  return Object.entries(section).find(([key]) => key.toLowerCase() === expected.toLowerCase())?.[1];
}

function numberValue(section: Record<string, string>, key: string): number | undefined {
  const value = getValue(section, key);
  return value === undefined ? undefined : parseNumber(value);
}

function pairValue(section: Record<string, string>, key: string): [number, number] | undefined {
  const value = getValue(section, key);
  if (!value) {
    return undefined;
  }
  const [left, right] = value.split(",").map((part) => parseNumber(part));
  if (left === undefined || right === undefined) {
    return undefined;
  }
  return [left, right];
}

function stageLayerTrans(values: Record<string, string>): MugenStageLayerTrans | undefined {
  const mode = getValue(values, "trans")?.trim().toLowerCase();
  if (!mode || !["none", "add", "add1", "addalpha", "sub"].includes(mode)) {
    return undefined;
  }
  const alpha = pairValue(values, "alpha");
  return {
    mode: mode as MugenStageLayerTrans["mode"],
    ...(alpha ? { alpha: { source: alpha[0], destination: alpha[1] } } : {}),
  };
}

function stageLayerClip(values: Record<string, string>, localcoord: [number, number]): MugenStageLayerClip | undefined {
  const maskWindow = numberListValue(values, "maskwindow");
  const deprecatedWindow = numberListValue(values, "window");
  const source = maskWindow ? "maskwindow" : deprecatedWindow ? "window" : undefined;
  const rect = maskWindow ?? deprecatedWindow;
  if (!source || !rect || rect.length < 4) {
    return undefined;
  }
  const windowDelta = pairValue(values, "windowdelta");
  const xOffset = source === "window" ? localcoord[0] / 2 : 0;
  return {
    source,
    x1: rect[0]! - xOffset,
    y1: rect[1]!,
    x2: rect[2]! - xOffset,
    y2: rect[3]!,
    ...(windowDelta ? { delta: { x: windowDelta[0], y: windowDelta[1] } } : {}),
  };
}

function booleanValue(section: Record<string, string>, key: string): boolean | undefined {
  const value = getValue(section, key);
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return undefined;
}

function numberListValue(section: Record<string, string>, key: string): number[] | undefined {
  const value = getValue(section, key);
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => parseNumber(part))
    .filter((part): part is number => part !== undefined);
  return numbers.length ? numbers : undefined;
}

function normalizeFacing(value: number | undefined, fallback: 1 | -1): 1 | -1 {
  return value === -1 ? -1 : value === 1 ? 1 : fallback;
}

function clampZoom(value: number): number {
  return Math.max(0.5, Math.min(2, value));
}
