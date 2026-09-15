import { describe, expect, it } from "vitest";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";
import { MugenStageLoader } from "../mugen/loader/MugenStageLoader";
import { parseStageDef, stageDefToRuntime } from "../mugen/parsers/StageDefParser";

const kfmStageDef = `
[Info]
name = "Mountainside Temple"
displayname = "Mountainside Temple"
author = Elecbyte

[Camera]
startx = 0
starty = 0
boundleft = -150
boundright = 150
zoomout = 1
zoomin = 1

[PlayerInfo]
p1startx = -70
p2startx = 70
p1startz = -5
p2startz = 7
topbound = -30
botbound = 40
p1facing = 1
p2facing = -1

[StageInfo]
zoffset = 200
resetBG = 1
localcoord = 320,240

[Music]
bgmusic = sound/kfm.mid

[BGDef]
spr = kfm.sff

[BG 0]
type = normal
spriteno = 0,0
start = 0,0
delta = .5,.5

[BG Floor]
type = normal
id = 4
spriteno = 1,0
start = 0,170
delta = 1,1
velocity = .5,1
scalestart = 1.25,.75
scaledelta = .001,.002
zoomdelta = .5
layerno = 1

[BG Animated]
type = anim
actionno = 10
start = 20,40
delta = .75,.75
trans = addalpha
alpha = 128,256
maskwindow = -80,10,80,120
windowdelta = .25,0
mask = 1

[Begin Action 10]
2,0,0,0,4
Loopstart
2,1,4,0,4

[BGCtrlDef FloorPulse]
looptime = 120
ctrlID = 4

[BGCtrl FloorToggle]
type = Visible
time = 30,60
value = 0

[BGCtrl FloorMove]
type = VelAdd
time = 70
x = .25
y = 0
`;

describe("parseStageDef", () => {
  it("parses stage metadata, camera and placeholder runtime data", () => {
    const parsed = parseStageDef(kfmStageDef, "stages/kfm.def");
    const runtime = stageDefToRuntime(parsed, "stage-kfm");

    expect(parsed.info.name).toBe("Mountainside Temple");
    expect(parsed.files.sprite).toBe("kfm.sff");
    expect(parsed.files.music).toBe("sound/kfm.mid");
    expect(runtime.displayName).toBe("Mountainside Temple");
    expect(runtime.bounds).toEqual({ left: -150, right: 150 });
    expect(runtime.playerStart.p1).toMatchObject({ x: -70, z: -5, facing: 1 });
    expect(runtime.playerStart.p2).toMatchObject({ x: 70, z: 7, facing: -1 });
    expect(runtime.depthBounds).toEqual({ top: -30, bottom: 40 });
    expect(runtime.camera.zoom).toBe(1);
    expect(runtime.resetBackgroundBetweenRounds).toBe(true);
    expect(runtime.zOffset).toBe(200);
    expect(runtime.zOffsetLink).toBeUndefined();
    expect(parsed.animations.get(10)?.frames).toHaveLength(2);
    expect(runtime.animations?.get(10)?.frames[1]).toMatchObject({ spriteGroup: 2, spriteIndex: 1, offsetX: 4 });
    expect(runtime.layers).toHaveLength(3);
    expect(runtime.layers[0]?.id).toContain("BG 0");
    expect(runtime.layers[0]).toMatchObject({ sectionName: "BG 0", type: "normal", spriteGroup: 0, spriteIndex: 0, startX: 0, startY: 0, deltaX: 0.5 });
    expect(runtime.layers[1]).toMatchObject({
      sectionName: "BG Floor",
      type: "normal",
      spriteGroup: 1,
      spriteIndex: 0,
      layerNo: 1,
      velocity: { x: 0.5, y: 1 },
      scaleStart: { x: 1.25, y: 0.75 },
      scaleDelta: { x: 0.001, y: 0.002 },
      zoomDelta: { x: 0.5, y: 0.5 },
    });
    expect(runtime.layers[2]).toMatchObject({
      sectionName: "BG Animated",
      type: "anim",
      actionNo: 10,
      startX: 20,
      startY: 40,
      deltaX: 0.75,
      trans: { mode: "addalpha", alpha: { source: 128, destination: 256 } },
      clip: { source: "maskwindow", x1: -80, y1: 10, x2: 80, y2: 120, delta: { x: 0.25, y: 0 } },
      mask: true,
    });
    expect(runtime.layers[1]?.controlId).toBe(4);
    expect(parsed.bgControllers).toHaveLength(1);
    expect(parsed.bgControllers[0]).toMatchObject({
      name: "FloorPulse",
      loopTime: 120,
      ctrlIds: [4],
      controllers: [
        {
          name: "FloorToggle",
          type: "visible",
          timing: { start: 30, end: 60, loopTime: 120 },
          ctrlIds: [4],
          params: { value: "0" },
        },
        {
          name: "FloorMove",
          type: "veladd",
          timing: { start: 70, end: 70, loopTime: 120 },
          ctrlIds: [4],
          params: { x: ".25", y: "0" },
        },
      ],
    });

    const continueBetweenRounds = stageDefToRuntime(
      parseStageDef(kfmStageDef.replace("resetBG = 1", "resetBG = 0"), "stages/kfm-continue.def"),
      "stage-kfm-continue",
    );
    expect(continueBetweenRounds.resetBackgroundBetweenRounds).toBe(false);
  });

  it("keeps more than eight authored BG sections in order", () => {
    const sections = Array.from({ length: 9 }, (_, index) => `
[BG Layer ${index}]
type = normal
id = ${10 + index}
spriteno = ${index},0
start = ${index},0
delta = 1,1
`).join("\n");
    const runtime = stageDefToRuntime(
      parseStageDef(`[BGDef]\nspr = many.sff\n${sections}`, "stages/nine.def"),
      "stage-nine",
    );

    expect(runtime.layers).toHaveLength(9);
    expect(runtime.layers.map((layer) => layer.sectionName)).toEqual(
      Array.from({ length: 9 }, (_, index) => `BG Layer ${index}`),
    );
    expect(runtime.layers[8]).toMatchObject({
      sectionName: "BG Layer 8",
      controlId: 18,
      spriteGroup: 8,
      spriteIndex: 0,
      startX: 8,
    });
  });

  it("parses static BG sin.x and sin.y triples", () => {
    const runtime = stageDefToRuntime(
      parseStageDef(`
[BGDef]
spr = sine.sff

[BG Wave]
type = normal
spriteno = 0,0
start = 0,0
sin.x = 10,8,90
sin.y = 4,16,0
`, "stages/sine.def"),
      "stage-sine",
    );

    expect(runtime.layers[0]?.sinusoid).toEqual({
      x: { amplitude: 10, period: 8, phase: 90 },
      y: { amplitude: 4, period: 16, phase: 0 },
    });
  });

  it("parses vertical camera tension and bound fields without scaling them", () => {
    const runtime = stageDefToRuntime(
      parseStageDef(`
[Camera]
startx = 0
starty = 0
floortension = 20
verticalfollow = .5
boundhigh = -8
boundlow = 0
[StageInfo]
zoffset = 200
localcoord = 320,240
[BGDef]
spr = cam.sff
`, "stages/vertical-cam.def"),
      "stage-vertical-cam",
    );

    expect(runtime.camera).toMatchObject({
      floorTension: 20,
      verticalFollow: 0.5,
      boundHigh: -8,
      boundLow: 0,
    });
  });

  it("keeps sinusoid amplitudes in stage pixels for a 640 localcoord stage", () => {
    const runtime = stageDefToRuntime(
      parseStageDef(`
[Info]
name = "Wide Wave"
[StageInfo]
zoffset = 180
zoffsetlink = 7
localcoord = 640,480
[BGDef]
spr = sine.sff
[BG Wave]
type = normal
id = 7
spriteno = 0,0
start = 10,20
sin.x = 10,8,0
`, "stages/wide-sine.def"),
      "stage-wide-sine",
    );

    expect(runtime.localCoord).toEqual({ width: 640, height: 480 });
    expect(runtime.zOffsetLink).toBe(7);
    expect(runtime.layers[0]?.sinusoid).toEqual({ x: { amplitude: 10, period: 8, phase: 0 } });
  });

  it("preserves parent and controller BGCtrl loop periods separately", () => {
    const parsed = parseStageDef(`
[BGDef]

[BGCtrlDef Independent]
looptime = 10

[BGCtrl Pulse]
type = Visible
time = 4,4,6
value = 0
`, "stages/loops.def");

    expect(parsed.bgControllers?.[0]?.controllers[0]?.timing).toEqual({
      start: 4,
      end: 4,
      loopTime: 6,
      groupLoopTime: 10,
    });
  });

  it("preserves positionlink offsets and inherits the linked layer delta", () => {
    const runtime = stageDefToRuntime(
      parseStageDef(`
[BGDef]

[BG Base]
type = normal
spriteno = 0,0
start = 10,20
delta = .5,.75

[BG Linked]
type = normal
spriteno = 1,0
positionlink = 1
start = 3,4
delta = 9,9
`, "stages/positionlink.def"),
      "stage-positionlink",
    );

    expect(runtime.layers[1]).toMatchObject({
      startX: 13,
      startY: 24,
      deltaX: 0.5,
      deltaY: 0.75,
      positionLink: { targetId: expect.stringContaining("BG Base"), offsetX: 3, offsetY: 4 },
    });
  });

  it("preserves deprecated vertical parallax scale fields", () => {
    const runtime = stageDefToRuntime(
      parseStageDef(`
[BGDef]

[BG Parallax]
type = parallax
spriteno = 0,0
yscalestart = 100
yscaledelta = 1.2
`, "stages/legacy-scale.def"),
      "stage-legacy-scale",
    );

    expect(runtime.layers[0]).toMatchObject({ yScaleStart: 100, yScaleDelta: 1.2 });
  });

  it("parses zoffsetlink and ignores a negative control ID", () => {
    const linked = stageDefToRuntime(
      parseStageDef(`
[StageInfo]
zoffset = 180
zoffsetlink = 4
[BGDef]
[BG Floor]
type = normal
id = 4
spriteno = 0,0
start = 0,12
`, "stages/zoffsetlink.def"),
      "stage-zoffsetlink",
    );
    const disabled = stageDefToRuntime(
      parseStageDef(`
[StageInfo]
zoffset = 180
zoffsetlink = -1
[BGDef]
[BG Floor]
type = normal
id = 4
spriteno = 0,0
`, "stages/zoffsetlink-off.def"),
      "stage-zoffsetlink-off",
    );

    expect(linked.zOffset).toBe(180);
    expect(linked.zOffsetLink).toBe(4);
    expect(disabled.zOffsetLink).toBeUndefined();
  });

  it("keeps parallax width ahead of xscale and ignores xscale on normal layers", () => {
    const runtime = stageDefToRuntime(
      parseStageDef(`
[BGDef]

[BG Floor]
type = parallax
spriteno = 0,0
width = 200,80
xscale = 3,4

[BG XScale]
type = parallax
spriteno = 1,0
xscale = 2,0.5

[BG Wall]
type = normal
spriteno = 2,0
width = 400,100
xscale = 9,9
`, "stages/parallax-width.def"),
      "stage-parallax-width",
    );

    expect(runtime.layers[0]).toMatchObject({
      type: "parallax",
      parallaxWidth: { top: 200, bottom: 80 },
    });
    expect(runtime.layers[0]?.parallaxXScale).toBeUndefined();
    expect(runtime.layers[1]).toMatchObject({
      type: "parallax",
      parallaxXScale: { top: 2, bottom: 0.5 },
    });
    expect(runtime.layers[1]?.parallaxWidth).toBeUndefined();
    expect(runtime.layers[2]?.parallaxWidth).toBeUndefined();
    expect(runtime.layers[2]?.parallaxXScale).toBeUndefined();
  });
});

describe("MugenStageLoader", () => {
  it("discovers stages and resolves stage sprite/music paths from a virtual package", async () => {
    const encoder = new TextEncoder();
    const vfs = new VirtualFileSystem();
    vfs.addFile("mugen/data/mugen.cfg", encoder.encode("[Config]\nGameWidth = 1280\nGameHeight = 720\n"));
    vfs.addFile("mugen/stages/kfm.def", encoder.encode(kfmStageDef));
    vfs.addFile("mugen/stages/kfm.sff", new Uint8Array([0]));
    vfs.addFile("mugen/sound/kfm.mid", new Uint8Array([0]));

    const [stage] = await new MugenStageLoader().loadAll("mugen.zip", vfs);

    expect(stage?.defPath).toBe("mugen/stages/kfm.def");
    expect(stage?.stage.displayName).toBe("Mountainside Temple");
    expect(stage?.stage.gameSpace).toEqual({ width: 1280, height: 720, sourcePath: "mugen/data/mugen.cfg" });
    expect(stage?.files.sprite).toBe("mugen/stages/kfm.sff");
    expect(stage?.files.music).toBe("mugen/sound/kfm.mid");
    expect(stage?.files.missing).toEqual([]);
  });

  it("keeps stage ids unique when display names repeat", async () => {
    const encoder = new TextEncoder();
    const vfs = new VirtualFileSystem();
    vfs.addFile("mugen/stages/training.def", encoder.encode(`[Info]\ndisplayname = Training Room\n`));
    vfs.addFile("mugen/stages/training2.def", encoder.encode(`[Info]\ndisplayname = Training Room\n`));

    const stages = await new MugenStageLoader().loadAll("mugen.zip", vfs);

    expect(stages.map((stage) => stage.stage.id)).toEqual(["stage-training-room", "stage-training-room-2"]);
  });
});
