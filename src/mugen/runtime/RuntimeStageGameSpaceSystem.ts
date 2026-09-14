import type { MugenStageDefinition } from "../model/MugenStage";
import { resolveStageLayerForTick } from "../../game/render/stageProjection";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";
import type { StageSnapshot } from "./types";

export type RuntimeStageGameSpaceSource = Pick<MugenStageDefinition, "bounds"> & {
  depthBounds?: MugenStageDefinition["depthBounds"];
  camera?: Partial<Pick<MugenStageDefinition["camera"], "zoom">>;
  gameSpace?: Partial<Pick<NonNullable<MugenStageDefinition["gameSpace"]>, "width" | "height">>;
  localCoord?: Partial<MugenStageDefinition["localCoord"]>;
};

export function runtimeStageGameSpace(stage: RuntimeStageGameSpaceSource): ExpressionGameSpace {
  const width = finitePositive(stage.gameSpace?.width) ?? finitePositive(stage.localCoord?.width) ?? Math.max(0, stage.bounds.right - stage.bounds.left);
  const height = finitePositive(stage.gameSpace?.height) ?? finitePositive(stage.localCoord?.height) ?? 480;
  const zoom = finitePositive(stage.camera?.zoom) ?? 1;
  return { width, height, zoom };
}

export type RuntimeStageZOffsetLinkResult = {
  floorY: number;
  unsupported?: string;
};

export function runtimeStageZOffsetLink(
  stage: Pick<MugenStageDefinition, "id" | "displayName" | "floorY" | "zOffset" | "zOffsetLink" | "layers" | "bgControllers" | "camera">,
  tick: number,
  camera?: StageSnapshot["camera"],
): RuntimeStageZOffsetLinkResult {
  const linkId = stage.zOffsetLink;
  if (linkId === undefined || !Number.isFinite(linkId) || linkId < 0) {
    return { floorY: stage.floorY };
  }
  const target = stage.layers.find((layer) => layer.controlId === linkId);
  if (!target) {
    return { floorY: stage.floorY, unsupported: "zoffsetlink target missing" };
  }
  const authoredStartY = target.startY ?? 0;
  const resolved = resolveStageLayerForTick(
    target,
    {
      id: stage.id,
      displayName: stage.displayName,
      floorY: stage.floorY,
      zOffset: stage.zOffset,
      camera: camera ?? { x: stage.camera.startX, y: stage.camera.startY, zoom: stage.camera.zoom },
      layers: stage.layers,
      bgControllers: stage.bgControllers,
    },
    tick,
  );
  const resolvedStartY = resolved?.startY ?? authoredStartY;
  if (!Number.isFinite(resolvedStartY)) {
    return { floorY: stage.floorY, unsupported: "zoffsetlink target missing" };
  }
  return { floorY: stage.floorY + authoredStartY - resolvedStartY };
}

function finitePositive(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : undefined;
}
