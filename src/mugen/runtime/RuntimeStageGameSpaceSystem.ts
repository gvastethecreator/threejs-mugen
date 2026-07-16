import type { MugenStageDefinition } from "../model/MugenStage";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";

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

function finitePositive(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : undefined;
}
