import type { MugenAnimationAction } from "./MugenAnimation";

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
  floorY: number;
  zOffset: number;
  bounds: {
    left: number;
    right: number;
  };
  camera: {
    startX: number;
    startY: number;
    zoom: number;
  };
  playerStart: {
    p1: { x: number; y: number; facing: 1 | -1 };
    p2: { x: number; y: number; facing: 1 | -1 };
  };
  layers: MugenStageLayer[];
  animations?: Map<number, MugenAnimationAction>;
  bgControllers?: MugenStageBgCtrlDef[];
};
