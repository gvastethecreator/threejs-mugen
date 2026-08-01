import type { MugenStageDefinition } from "../model/MugenStage";

export const rooftopDojoStage: MugenStageDefinition = {
  id: "rooftop-dojo",
  displayName: "Rooftop Dojo",
  floorY: 0,
  zOffset: 0,
  localCoord: {
    width: 640,
    height: 480,
  },
  bounds: {
    left: -420,
    right: 420,
  },
  camera: {
    startX: 0,
    startY: 78,
    zoom: 1,
  },
  playerStart: {
    p1: { x: -125, y: 0, facing: 1 },
    p2: { x: 125, y: 0, facing: -1 },
  },
  layers: [
    {
      id: "rooftop-dojo-far",
      color: "#171b1d",
      assetUrl: "/stages/rooftop-dojo/source/rooftop-dojo-far-v2.png",
      y: 88,
      width: 1020,
      height: 574,
      deltaX: 0.08,
      deltaY: 0.02,
      opacity: 1,
    },
    {
      id: "rooftop-dojo-mid",
      color: "#4b4035",
      assetUrl: "/stages/rooftop-dojo/source/rooftop-dojo-mid-v2.png",
      y: 88,
      width: 1020,
      height: 574,
      deltaX: 0.42,
      deltaY: 0.08,
      opacity: 1,
      layerNo: 0,
    },
    {
      id: "rooftop-dojo-near",
      color: "#76604a",
      assetUrl: "/stages/rooftop-dojo/source/rooftop-dojo-near-alpha-v2.png",
      y: 88,
      width: 1020,
      height: 574,
      deltaX: 0.88,
      deltaY: 0.16,
      opacity: 1,
      layerNo: 1,
    },
  ],
};

/** Imagegen-backed layered stage packs accepted by build-game-backgrounds. */
export const patioDojoPublicidadStage: MugenStageDefinition = {
  id: "patio-dojo-publicidad",
  displayName: "Patio Dojo Publicidad",
  floorY: 0,
  zOffset: 0,
  localCoord: { width: 640, height: 480 },
  bounds: { left: -420, right: 420 },
  camera: { startX: 0, startY: 78, zoom: 1 },
  playerStart: { p1: { x: -125, y: 0, facing: 1 }, p2: { x: 125, y: 0, facing: -1 } },
  layers: [
    { id: "city-far", color: "#25282a", assetUrl: "/stages/patio-dojo-publicidad/source/patio-dojo-publicidad-far-imagegen.png", y: 88, width: 1020, height: 574, deltaX: 0.08, deltaY: 0.02, opacity: 1, layerNo: 0 },
    { id: "dojo-mid", color: "#4e4138", assetUrl: "/stages/patio-dojo-publicidad/source/patio-dojo-publicidad-mid-imagegen.png", y: 88, width: 1020, height: 574, deltaX: 0.42, deltaY: 0.08, opacity: 1, layerNo: 0 },
    { id: "dojo-near", color: "#8b4e3c", assetUrl: "/stages/patio-dojo-publicidad/source/patio-dojo-publicidad-near-alpha.png", y: 88, width: 1020, height: 574, deltaX: 0.88, deltaY: 0.16, opacity: 1, layerNo: 1 },
  ],
};

export const terminalSupermercado24hStage: MugenStageDefinition = {
  id: "terminal-supermercado-24h",
  displayName: "Terminal Supermercado 24h",
  floorY: 0,
  zOffset: 0,
  localCoord: { width: 640, height: 480 },
  bounds: { left: -420, right: 420 },
  camera: { startX: 0, startY: 78, zoom: 1 },
  playerStart: { p1: { x: -125, y: 0, facing: 1 }, p2: { x: 125, y: 0, facing: -1 } },
  layers: [
    { id: "terminal-far", color: "#11161a", assetUrl: "/stages/terminal-supermercado-24h/source/terminal-supermercado-24h-base-imagegen.png", y: 88, width: 1020, height: 574, deltaX: 0.08, deltaY: 0.02, opacity: 1, layerNo: 0 },
    { id: "terminal-mid", color: "#4d4336", assetUrl: "/stages/terminal-supermercado-24h/source/terminal-supermercado-24h-mid-imagegen-v2.png", y: 88, width: 1020, height: 574, deltaX: 0.42, deltaY: 0.08, opacity: 1, layerNo: 0 },
    { id: "terminal-near", color: "#856440", assetUrl: "/stages/terminal-supermercado-24h/source/terminal-supermercado-24h-near-alpha.png", y: 88, width: 1020, height: 574, deltaX: 0.88, deltaY: 0.16, opacity: 1, layerNo: 1 },
  ],
};

export const azoteaWifiStage: MugenStageDefinition = {
  id: "azotea-wifi",
  displayName: "Azotea Wi-Fi",
  floorY: 0,
  zOffset: 0,
  localCoord: { width: 640, height: 480 },
  bounds: { left: -420, right: 420 },
  camera: { startX: 0, startY: 78, zoom: 1 },
  playerStart: { p1: { x: -125, y: 0, facing: 1 }, p2: { x: 125, y: 0, facing: -1 } },
  layers: [
    { id: "rooftop-far", color: "#252a2c", assetUrl: "/stages/azotea-wifi/source/azotea-wifi-base-imagegen.png", y: 88, width: 1020, height: 574, deltaX: 0.08, deltaY: 0.02, opacity: 1, layerNo: 0 },
    { id: "rooftop-mid", color: "#51534b", assetUrl: "/stages/azotea-wifi/source/azotea-wifi-mid-imagegen-v2.png", y: 88, width: 1020, height: 574, deltaX: 0.42, deltaY: 0.08, opacity: 1, layerNo: 0 },
    { id: "rooftop-near", color: "#747160", assetUrl: "/stages/azotea-wifi/source/azotea-wifi-near-alpha.png", y: 88, width: 1020, height: 574, deltaX: 0.88, deltaY: 0.16, opacity: 1, layerNo: 1 },
  ],
};

export const trainingStage: MugenStageDefinition = {
  id: "training-grid",
  displayName: "Training Grid",
  floorY: 0,
  zOffset: 0,
  localCoord: {
    width: 640,
    height: 480,
  },
  bounds: {
    left: -320,
    right: 320,
  },
  camera: {
    startX: 0,
    startY: 72,
    zoom: 1,
  },
  playerStart: {
    p1: { x: -95, y: 0, facing: 1 },
    p2: { x: 95, y: 0, facing: -1 },
  },
  layers: [
    { id: "backdrop", color: "#111821", y: 88, width: 900, height: 430, deltaX: 0.25, opacity: 1 },
    { id: "far-wall", color: "#1b2530", y: 64, width: 900, height: 110, deltaX: 0.45, opacity: 0.86 },
    { id: "floor-fill", color: "#182027", y: -42, width: 900, height: 84, deltaX: 1, opacity: 1 },
  ],
};

export const bgCtrlLabStage: MugenStageDefinition = {
  id: "bgctrl-lab",
  displayName: "BGCtrl Lab",
  floorY: 0,
  zOffset: 0,
  localCoord: {
    width: 640,
    height: 480,
  },
  bounds: {
    left: -360,
    right: 360,
  },
  camera: {
    startX: 0,
    startY: 72,
    zoom: 1,
  },
  playerStart: {
    p1: { x: -112, y: 0, facing: 1 },
    p2: { x: 112, y: 0, facing: -1 },
  },
  layers: [
    { id: "lab-backdrop", color: "#101620", y: 92, width: 980, height: 430, deltaX: 0.2, opacity: 1, layerNo: 0 },
    { id: "lab-cloud-drift", controlId: 10, color: "#26384a", y: 128, width: 760, height: 42, deltaX: 0.35, opacity: 0.72, layerNo: 0 },
    { id: "lab-sine-ribbon", controlId: 20, color: "#44c7b6", y: 58, width: 260, height: 14, deltaX: 0.7, opacity: 0.68, layerNo: 0 },
    { id: "lab-pulse-core", controlId: 30, color: "#e3b341", y: 24, width: 74, height: 74, deltaX: 0.85, opacity: 0.54, layerNo: 0 },
    { id: "lab-floor", color: "#202832", y: -34, width: 980, height: 68, deltaX: 1, opacity: 1, layerNo: 1 },
  ],
  bgControllers: [
    {
      name: "NativeMotion",
      loopTime: 120,
      rawParams: { looptime: "120" },
      controllers: [
        {
          name: "CloudVel",
          type: "velset",
          timing: { start: 0, end: 119, loopTime: 120 },
          ctrlIds: [10],
          params: { value: "0.22,0" },
          rawParams: { type: "VelSet", time: "0,119", value: "0.22,0" },
        },
        {
          name: "RibbonSinX",
          type: "sinx",
          timing: { start: 0, end: 119, loopTime: 120 },
          ctrlIds: [20],
          params: { value: "54,120,0" },
          rawParams: { type: "SinX", time: "0,119", value: "54,120,0" },
        },
        {
          name: "RibbonSinY",
          type: "siny",
          timing: { start: 0, end: 119, loopTime: 120 },
          ctrlIds: [20],
          params: { value: "10,60,0" },
          rawParams: { type: "SinY", time: "0,119", value: "10,60,0" },
        },
        {
          name: "PulsePos",
          type: "posadd",
          timing: { start: 0, end: 119, loopTime: 120 },
          ctrlIds: [30],
          params: { value: "0.08,0" },
          rawParams: { type: "PosAdd", time: "0,119", value: "0.08,0" },
        },
      ],
    },
  ],
};
