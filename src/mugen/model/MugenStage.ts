import type { MugenAnimationAction } from "./MugenAnimation";
import type { MugenGameSpaceConfig } from "./MugenConfig";

export type MugenStageLayer = {
  id: string;
  sectionName?: string;
  type?: string;
  controlId?: number;
  color: string;
  assetUrl?: string;
  x?: number;
  y: number;
  width: number;
  height: number;
  deltaX: number;
  deltaY?: number;
  opacity: number;
  layerNo?: number;
  startX?: number;
  startY?: number;
  spriteGroup?: number;
  spriteIndex?: number;
  actionNo?: number;
  /** Runtime-only animation clock after bounded Enabled controller pauses. */
  animationTick?: number;
  velocity?: {
    x: number;
    y: number;
  };
  /** Authored BG scale before the global Three.js camera zoom is applied. */
  scaleStart?: {
    x: number;
    y: number;
  };
  /** Scale change per camera movement in the bounded stage projection. */
  scaleDelta?: {
    x: number;
    y: number;
  };
  /** Deprecated MUGEN parallax vertical scale parameters. */
  yScaleStart?: number;
  yScaleDelta?: number;
  /** Authored share of the global camera zoom, duplicated for one-value input. */
  zoomDelta?: {
    x: number;
    y: number;
  };
  /** Link position and scroll delta to the last non-linked authored layer. */
  positionLink?: {
    targetId: string;
    offsetX: number;
    offsetY: number;
  };
  trans?: MugenStageLayerTrans;
  clip?: MugenStageLayerClip;
  mask?: boolean;
  tile?: {
    x: number;
    y: number;
    spacingX?: number;
    spacingY?: number;
  };
};

export type MugenStageLayerTrans = {
  mode: "none" | "add" | "add1" | "addalpha" | "sub";
  alpha?: {
    source: number;
    destination: number;
  };
};

export type MugenStageLayerClip = {
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

export type MugenStageBgCtrlType =
  | "null"
  | "visible"
  | "enabled"
  | "velset"
  | "veladd"
  | "posset"
  | "posadd"
  | "anim"
  | "sinx"
  | "siny"
  | string;

export type MugenStageBgCtrlTiming = {
  start: number;
  end: number;
  loopTime?: number;
  /** Parent BGCtrlDef reset period, kept separate from an explicit controller loop. */
  groupLoopTime?: number;
};

export type MugenStageBgCtrl = {
  name?: string;
  type: MugenStageBgCtrlType;
  timing: MugenStageBgCtrlTiming;
  ctrlIds?: number[];
  params: Record<string, string>;
  rawParams: Record<string, string>;
};

export type MugenStageBgCtrlDef = {
  name?: string;
  loopTime?: number;
  ctrlIds?: number[];
  controllers: MugenStageBgCtrl[];
  rawParams: Record<string, string>;
};

export type MugenStageDefinition = {
  id: string;
  displayName: string;
  gameSpace?: MugenGameSpaceConfig;
  floorY: number;
  zOffset: number;
  localCoord: {
    width: number;
    height: number;
  };
  bounds: {
    left: number;
    right: number;
  };
  depthBounds?: {
    top: number;
    bottom: number;
  };
  camera: {
    startX: number;
    startY: number;
    zoom: number;
  };
  resetBackgroundBetweenRounds?: boolean;
  playerStart: {
    p1: { x: number; y: number; z?: number; facing: 1 | -1 };
    p2: { x: number; y: number; z?: number; facing: 1 | -1 };
  };
  layers: MugenStageLayer[];
  animations?: Map<number, MugenAnimationAction>;
  bgControllers?: MugenStageBgCtrlDef[];
};
