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
p1facing = 1
p2facing = -1

[StageInfo]
zoffset = 200
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
layerno = 1

[BG Animated]
type = anim
actionno = 10
start = 20,40
delta = .75,.75

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
    expect(runtime.playerStart.p1).toMatchObject({ x: -70, facing: 1 });
    expect(runtime.playerStart.p2).toMatchObject({ x: 70, facing: -1 });
    expect(runtime.camera.zoom).toBe(1);
    expect(parsed.animations.get(10)?.frames).toHaveLength(2);
    expect(runtime.animations?.get(10)?.frames[1]).toMatchObject({ spriteGroup: 2, spriteIndex: 1, offsetX: 4 });
    expect(runtime.layers).toHaveLength(3);
    expect(runtime.layers[0]?.id).toContain("BG 0");
    expect(runtime.layers[0]).toMatchObject({ sectionName: "BG 0", type: "normal", spriteGroup: 0, spriteIndex: 0, startX: 0, startY: 0, deltaX: 0.5 });
    expect(runtime.layers[1]).toMatchObject({ sectionName: "BG Floor", type: "normal", spriteGroup: 1, spriteIndex: 0, layerNo: 1 });
    expect(runtime.layers[2]).toMatchObject({ sectionName: "BG Animated", type: "anim", actionNo: 10, startX: 20, startY: 40, deltaX: 0.75 });
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
  });
});

describe("MugenStageLoader", () => {
  it("discovers stages and resolves stage sprite/music paths from a virtual package", async () => {
    const encoder = new TextEncoder();
    const vfs = new VirtualFileSystem();
    vfs.addFile("mugen/stages/kfm.def", encoder.encode(kfmStageDef));
    vfs.addFile("mugen/stages/kfm.sff", new Uint8Array([0]));
    vfs.addFile("mugen/sound/kfm.mid", new Uint8Array([0]));

    const [stage] = await new MugenStageLoader().loadAll("mugen.zip", vfs);

    expect(stage?.defPath).toBe("mugen/stages/kfm.def");
    expect(stage?.stage.displayName).toBe("Mountainside Temple");
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
