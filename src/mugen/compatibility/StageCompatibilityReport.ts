import type { MugenStageDefinition, MugenStageLayer } from "../model/MugenStage";
import type { MugenStagePackage } from "../model/MugenStagePackage";
import type { UnsupportedFeature } from "./UnsupportedFeatureTracker";

export type StageBackgroundLayerStatus = "rendered" | "animated" | "fallback" | "missing" | "unsupported";

export type StageBackgroundLayerReport = {
  id: string;
  order: number;
  status: StageBackgroundLayerStatus;
  type: string;
  layerNo: number;
  controlId?: number;
  start: { x: number; y: number };
  delta: { x: number; y: number };
  velocity?: { x: number; y: number };
  tiled: boolean;
  trans?: {
    mode: string;
    alpha?: {
      source: number;
      destination: number;
    };
  };
  clip?: {
    source: "maskwindow" | "window";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    delta?: {
      x: number;
      y: number;
    };
  };
  mask?: boolean;
  unsupported: string[];
  section?: string;
  sprite?: {
    group: number;
    index: number;
    decoded: boolean;
  };
  action?: {
    id: number;
    frames: number;
    decodedFrames: number;
    missingFrameRefs: string[];
  };
  fallback?: string;
};

export type StageBackgroundControllerStatus = "bounded" | "unsupported";

export type StageBackgroundControllerReport = {
  group?: string;
  name?: string;
  type: string;
  status: StageBackgroundControllerStatus;
  timing: {
    start: number;
    end: number;
    loopTime?: number;
    groupLoopTime?: number;
  };
  ctrlIds?: number[];
  targetLayers: string[];
  params: Record<string, string>;
  unsupported: string[];
  fallback: string;
};

export type StageCompatibilityReport = {
  stage: string;
  loaded: boolean;
  files: {
    def: boolean;
    sff: boolean;
    music: boolean;
  };
  backgrounds: {
    total: number;
    withSpriteRefs: number;
    renderedSprites: number;
    tiled: number;
    clipped: number;
    animated: number;
    renderedAnimated: number;
    placeholderFallback: number;
    layers: StageBackgroundLayerReport[];
    controllers: {
      groups: number;
      total: number;
      parsed: number;
      bounded: number;
      unsupported: number;
      targetedLayers: number;
      unsupportedTypes: Record<string, number>;
      items: StageBackgroundControllerReport[];
    };
  };
  sff: {
    version?: string;
    decodedSprites: number;
    totalSprites: number;
    formats: Record<string, number>;
    unsupportedFormats: Record<string, number>;
  };
  unsupported: UnsupportedFeature[];
  warnings: string[];
  errors: string[];
};

export function createStageCompatibilityReport(stagePackage: MugenStagePackage): StageCompatibilityReport {
  const spriteKeys = new Set(stagePackage.spriteArchive?.sprites.map((sprite) => `${sprite.group}:${sprite.index}`) ?? []);
  const staticSpriteRefs = stagePackage.stage.layers.filter((layer) => layer.spriteGroup !== undefined && layer.spriteIndex !== undefined);
  const animated = stagePackage.stage.layers.filter((layer) => layer.actionNo !== undefined);
  const animatedFrameRefs = animated.flatMap((layer) => stagePackage.stage.animations?.get(layer.actionNo ?? Number.NaN)?.frames ?? []);
  const renderedAnimated = animated.filter((layer) =>
    (stagePackage.stage.animations?.get(layer.actionNo ?? Number.NaN)?.frames ?? []).some((frame) =>
      spriteKeys.has(`${frame.spriteGroup}:${frame.spriteIndex}`),
    ),
  );
  const withSpriteRefs = [...staticSpriteRefs, ...animatedFrameRefs];
  const renderedSprites = withSpriteRefs.filter((ref) => spriteKeys.has(`${ref.spriteGroup}:${ref.spriteIndex}`));
  const tiled = stagePackage.stage.layers.filter((layer) => layer.tile && (layer.tile.x !== 0 || layer.tile.y !== 0));
  const clipped = stagePackage.stage.layers.filter((layer) => layer.clip);
  const layers = stagePackage.stage.layers.map((layer, index) => describeBackgroundLayer(stagePackage, layer, index, spriteKeys));
  const controllers = summarizeStageBackgroundControllers(stagePackage.stage);
  const unsupported = collectUnsupportedStageFeatures(stagePackage);
  const warnings = stagePackage.diagnostics
    .filter((diagnostic) => diagnostic.severity === "warning")
    .map((diagnostic) => formatStageDiagnostic(diagnostic.file, diagnostic.line, diagnostic.message));
  const errors = stagePackage.diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => formatStageDiagnostic(diagnostic.file, diagnostic.line, diagnostic.message));

  return {
    stage: stagePackage.stage.displayName,
    loaded: Boolean(stagePackage.files.def),
    files: {
      def: Boolean(stagePackage.files.def),
      sff: Boolean(stagePackage.files.sprite),
      music: Boolean(stagePackage.files.music),
    },
    backgrounds: {
      total: stagePackage.stage.layers.length,
      withSpriteRefs: withSpriteRefs.length,
      renderedSprites: renderedSprites.length,
      tiled: tiled.length,
      clipped: clipped.length,
      animated: animated.length,
      renderedAnimated: renderedAnimated.length,
      placeholderFallback: withSpriteRefs.length - renderedSprites.length,
      layers,
      controllers,
    },
    sff: {
      version: stagePackage.spriteArchive?.metadata?.versionLabel ?? stagePackage.spriteArchive?.version,
      decodedSprites: stagePackage.spriteArchive?.sprites.length ?? 0,
      totalSprites: stagePackage.spriteArchive?.metadata?.spriteTotal ?? stagePackage.spriteArchive?.sprites.length ?? 0,
      formats: stagePackage.spriteArchive?.metadata?.formatCounts ?? {},
      unsupportedFormats: stagePackage.spriteArchive?.metadata?.unsupportedFormats ?? {},
    },
    unsupported,
    warnings,
    errors,
  };
}

const RECOGNIZED_BG_CTRL_TYPES = new Set(["null", "visible", "enabled", "velset", "veladd", "posset", "posadd", "anim", "sinx", "siny"]);

export function summarizeStageBackgroundControllers(stage: MugenStageDefinition): StageCompatibilityReport["backgrounds"]["controllers"] {
  const items = (stage.bgControllers ?? []).flatMap((group) =>
    group.controllers.map((controller) => {
      const type = controller.type.toLowerCase();
      const unsupported = RECOGNIZED_BG_CTRL_TYPES.has(type) ? [] : [`type:${type}`];
      const targetLayers = resolveControllerTargetLayers(stage, controller.ctrlIds);
      return {
        group: group.name,
        name: controller.name,
        type,
        status: unsupported.length ? "unsupported" : "bounded",
        timing: controller.timing,
        ctrlIds: controller.ctrlIds,
        targetLayers,
        params: controller.params,
        unsupported,
        fallback: unsupported.length
          ? "Unsupported BGCtrl type is preserved as raw params while target layers remain static"
          : "BGCtrl has bounded renderer execution for supported params; exact MUGEN timing/parity remains partial",
      } satisfies StageBackgroundControllerReport;
    }),
  );
  const unsupportedTypes: Record<string, number> = {};
  for (const item of items) {
    if (item.status === "unsupported") {
      unsupportedTypes[item.type] = (unsupportedTypes[item.type] ?? 0) + 1;
    }
  }
  return {
    groups: stage.bgControllers?.length ?? 0,
    total: items.length,
    parsed: items.length,
    bounded: items.filter((item) => item.status === "bounded").length,
    unsupported: items.filter((item) => item.status === "unsupported").length,
    targetedLayers: new Set(items.flatMap((item) => item.targetLayers)).size,
    unsupportedTypes,
    items,
  };
}

function resolveControllerTargetLayers(stage: MugenStageDefinition, ctrlIds: number[] | undefined): string[] {
  if (!ctrlIds?.length) {
    return stage.layers.map((layer) => layer.id);
  }
  const ids = new Set(ctrlIds);
  return stage.layers.filter((layer) => layer.controlId !== undefined && ids.has(layer.controlId)).map((layer) => layer.id);
}

function describeBackgroundLayer(
  stagePackage: MugenStagePackage,
  layer: MugenStageLayer,
  order: number,
  spriteKeys: Set<string>,
): StageBackgroundLayerReport {
  const rawSection = getLayerRawSection(stagePackage, layer);
  const type = (layer.type ?? (layer.actionNo !== undefined ? "anim" : "normal")).toLowerCase();
  const unsupported = collectUnsupportedLayerFeatures(rawSection, type, layer);
  const base = {
    id: layer.id,
    order,
    type,
    layerNo: layer.layerNo ?? 0,
    ...(layer.controlId === undefined ? {} : { controlId: layer.controlId }),
    start: {
      x: layer.startX ?? layer.x ?? 0,
      y: layer.startY ?? 0,
    },
    delta: {
      x: layer.deltaX ?? 1,
      y: layer.deltaY ?? 1,
    },
    ...(layer.velocity ? { velocity: layer.velocity } : {}),
    tiled: Boolean(layer.tile && (layer.tile.x !== 0 || layer.tile.y !== 0)),
    ...(layer.trans ? { trans: layer.trans } : {}),
    ...(layer.clip ? { clip: layer.clip } : {}),
    ...(layer.mask === undefined ? {} : { mask: layer.mask }),
    unsupported,
    ...(layer.sectionName ? { section: layer.sectionName } : {}),
  };

  if (layer.actionNo !== undefined) {
    const action = stagePackage.stage.animations?.get(layer.actionNo);
    if (!action) {
      return {
        ...base,
        status: "missing",
        action: { id: layer.actionNo, frames: 0, decodedFrames: 0, missingFrameRefs: [] },
        fallback: `Referenced BG action ${layer.actionNo} was not parsed`,
      };
    }
    const missingFrameRefs = action.frames
      .map((frame) => `${frame.spriteGroup}:${frame.spriteIndex}`)
      .filter((key) => !spriteKeys.has(key));
    const decodedFrames = action.frames.length - missingFrameRefs.length;
    if (decodedFrames <= 0) {
      return {
        ...base,
        status: "missing",
        action: { id: layer.actionNo, frames: action.frames.length, decodedFrames, missingFrameRefs: uniqueStrings(missingFrameRefs) },
        fallback: `BG action ${layer.actionNo} has no decoded frame sprites`,
      };
    }
    return {
      ...base,
      status: "animated",
      action: { id: layer.actionNo, frames: action.frames.length, decodedFrames, missingFrameRefs: uniqueStrings(missingFrameRefs) },
      ...(missingFrameRefs.length > 0 ? { fallback: "Animated BG renders decoded frames and falls back when undecoded frames are active" } : {}),
    };
  }

  if (layer.spriteGroup !== undefined && layer.spriteIndex !== undefined) {
    const decoded = spriteKeys.has(`${layer.spriteGroup}:${layer.spriteIndex}`);
    return {
      ...base,
      status: decoded ? "rendered" : "missing",
      sprite: {
        group: layer.spriteGroup,
        index: layer.spriteIndex,
        decoded,
      },
      ...(decoded ? {} : { fallback: `Stage sprite ${layer.spriteGroup}:${layer.spriteIndex} was not decoded` }),
    };
  }

  if (unsupported.length > 0) {
    return {
      ...base,
      status: "unsupported",
      fallback: "Layer uses unsupported BG semantics and is represented by a placeholder band",
    };
  }

  return {
    ...base,
    status: "fallback",
    fallback: "Layer has no sprite/action reference and is represented by a placeholder band",
  };
}

function collectUnsupportedStageFeatures(stagePackage: MugenStagePackage): UnsupportedFeature[] {
  const unsupported: UnsupportedFeature[] = [];
  const push = (feature: string, count: number, fallback: string): void => {
    if (count <= 0) {
      return;
    }
    unsupported.push({
      format: "stage",
      feature,
      severity: "warning",
      location: stagePackage.defPath,
      fallback,
      count,
    });
  };

  const rawSections = Object.entries(stagePackage.definition.rawSections);
  push(
    "exact BGCtrl parity",
    stagePackage.stage.bgControllers?.reduce((total, group) => total + group.controllers.length, 0) ?? 0,
    "Supported BGCtrl types execute through a bounded renderer path, but exact MUGEN timing/stage side effects remain partial",
  );
  push(
    "unsupported BGCtrl type",
    Object.values(summarizeStageBackgroundControllers(stagePackage.stage).unsupportedTypes).reduce((total, count) => total + count, 0),
    "Unknown BGCtrl types are preserved in raw params and left static",
  );
  push(
    "unresolved action-backed BG",
    stagePackage.stage.layers.filter(
      (layer) => layer.actionNo !== undefined && !stagePackage.stage.animations?.has(layer.actionNo),
    ).length,
    "Renderer falls back to placeholder BG bands when a referenced BG action is missing",
  );
  push(
    "unsupported BG layer type",
    stagePackage.stage.layers.filter((layer) => {
      const type = layer.type?.toLowerCase();
      return Boolean(type && type !== "normal" && type !== "anim");
    }).length,
    "Renderer uses placeholder BG bands for BG layer types without a bounded render path",
  );
  push(
    "exact window/maskwindow clipping",
    stagePackage.stage.layers.filter((layer) => layer.clip).length,
    "Renderer has bounded rectangular clipping for window/maskwindow, but exact zoom/windowdelta/render-mode parity remains partial",
  );
  push(
    "mask color-key semantics",
    rawSections.filter(([, values]) => hasKey(values, "mask")).length,
    "Stage SFF sprites currently keep transparent palette-index handoff; exact mask=0/1 color-zero behavior remains partial",
  );

  const unsupportedFormats = stagePackage.spriteArchive?.metadata?.unsupportedFormats ?? {};
  for (const [format, count] of Object.entries(unsupportedFormats)) {
    push(`stage SFF ${format}`, count, "Undecoded stage sprites fall back to placeholder BG bands");
  }

  return unsupported.sort((left, right) => left.feature.localeCompare(right.feature));
}

function getLayerRawSection(stagePackage: MugenStagePackage, layer: MugenStageLayer): Record<string, string> {
  if (layer.sectionName && stagePackage.definition.rawSections[layer.sectionName]) {
    return stagePackage.definition.rawSections[layer.sectionName]!;
  }
  const match = Object.entries(stagePackage.definition.rawSections).find(([section]) => layer.id.startsWith(section));
  return match?.[1] ?? {};
}

function collectUnsupportedLayerFeatures(rawSection: Record<string, string>, type: string, layer: MugenStageLayer): string[] {
  const unsupported: string[] = [];
  if (type && type !== "normal" && type !== "anim") {
    unsupported.push(`type:${type}`);
  }
  if ((hasKey(rawSection, "window") || hasKey(rawSection, "maskwindow")) && !layer.clip) {
    unsupported.push("window clipping");
  }
  if (hasKey(rawSection, "mask")) {
    unsupported.push("mask color-key semantics");
  }
  if (hasKey(rawSection, "velocity")) {
    unsupported.push("velocity");
  }
  if (hasKey(rawSection, "positionlink")) {
    unsupported.push("positionlink");
  }
  if (hasKey(rawSection, "trans") && !layer.trans) {
    unsupported.push("transparency mode");
  }
  if (hasKey(rawSection, "alpha") && !layer.trans) {
    unsupported.push("alpha transparency");
  }
  return unsupported;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function hasKey(values: Record<string, string>, key: string): boolean {
  return Object.keys(values).some((candidate) => candidate.toLowerCase() === key.toLowerCase());
}

function formatStageDiagnostic(file: string | undefined, line: number | undefined, message: string): string {
  const location = [file, line ? `:${line}` : ""].join("");
  return location ? `${location} ${message}` : message;
}
