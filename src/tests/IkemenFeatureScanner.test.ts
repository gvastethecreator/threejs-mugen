import { describe, expect, it } from "vitest";
import { scanIkemenFeatures } from "../mugen/compatibility/IkemenFeatureScanner";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";

describe("scanIkemenFeatures", () => {
  it("recognizes IKEMEN-only files and text features without creating execution claims", () => {
    const files = new Map<string, string>([
      ["chars/neo/neo.zss", 'mapSet{map: "route"; value: 1}\n'],
      ["data/config.json", "{\"GameWidth\": 1280}\n"],
      ["data/select.def", "unlock = stats.modes.arcade.clear > 0\ncommandlist = data/movelist.json\nscript = external/script/story.lua\n"],
      ["external/script/story.lua", 'hook.add("main.f_commandLine", "story", function() end)\n'],
      [
        "chars/neo/neo.cns",
        '[Info]\nIkemenVersion = 1.0\nst = neo.zss\n[State 0, AssertCommand]\ntype = AssertCommand\ntrigger1 = TimeElapsed > 20\n[State 0, AssertSpecial]\ntype = AssertSpecial\nflag = NoLifeBarAction\ntrigger1 = TeamLeader = 1\n',
      ],
      ["stages/model-stage.def", "[Camera]\ntopz = 240\nmodel = arena.glb\nfov = 45\ndepthtoscreen = 1\n"],
      ["stages/arena.glb", ""],
    ]);

    const report = scanIkemenFeatures({
      paths: [...files.keys()],
      readText: (path) => files.get(path),
    });

    expect(report.detected).toBe(true);
    expect(report.level).toBe("recognized-unsupported");
    expect(report.files.zss).toEqual(["chars/neo/neo.zss"]);
    expect(report.files.lua).toEqual(["external/script/story.lua"]);
    expect(report.files.config).toEqual(["data/config.json"]);
    expect(report.files.model).toEqual(["stages/arena.glb"]);
    expect(report.files.screenpack).toEqual(["data/select.def"]);
    expect(report.features["IKEMEN screenpack DEF"]).toBe(1);
    expect(report.features["ZSS script file"]).toBe(1);
    expect(report.features["ZSS state/script reference"]).toBe(1);
    expect(report.features["Lua script file"]).toBe(1);
    expect(report.features["Lua script hook"]).toBe(1);
    expect(report.features["IKEMEN Lua hook system"]).toBe(1);
    expect(report.features["IKEMEN Lua unlock expression"]).toBe(1);
    expect(report.features["IKEMEN command list reference"]).toBe(1);
    expect(report.features["IKEMEN config JSON"]).toBe(1);
    expect(report.features["IkemenVersion declaration"]).toBe(1);
    expect(report.features["IKEMEN controller AssertCommand"]).toBe(1);
    expect(report.features["IKEMEN controller MapSet"]).toBe(1);
    expect(report.features["IKEMEN AssertSpecial flag NoLifeBarAction"]).toBe(1);
    expect(report.features["IKEMEN extended trigger TimeElapsed"]).toBe(1);
    expect(report.features["IKEMEN extended trigger TeamLeader"]).toBe(1);
    expect(report.features["IKEMEN stage parameter topz"]).toBe(1);
    expect(report.features["IKEMEN stage parameter model"]).toBe(1);
    expect(report.features["IKEMEN stage parameter fov"]).toBe(1);
    expect(report.features["IKEMEN stage parameter depthtoscreen"]).toBe(1);
    expect(report.claimAllowed).toContain("not executed");
    expect(report.claimBlocked).toContain("IKEMEN compatible");
  });

  it("keeps clean MUGEN-style files outside the IKEMEN scan profile", () => {
    const files = new Map<string, string>([
      ["chars/kfm/kfm.cns", "[Statedef 0]\ntype = S\nphysics = S\nanim = 0\n[State 0, VelSet]\ntype = VelSet\ntrigger1 = Time = 0\n"],
    ]);

    const report = scanIkemenFeatures({
      paths: [...files.keys()],
      readText: (path) => files.get(path),
    });

    expect(report.detected).toBe(false);
    expect(report.level).toBe("clean");
    expect(report.files.screenpack).toEqual([]);
    expect(report.findings).toEqual([]);
  });

  it("does not report bounded-supported triggers as IKEMEN unsupported findings", () => {
    const files = new Map<string, string>([
      [
        "chars/neo/neo.cns",
        "[Statedef 200]\n[State 200, Branch]\ntype = ChangeState\ntrigger1 = PrevMoveType = A\ntrigger2 = PrevStateType = S\ntrigger3 = PrevAnim = 200\nvalue = 210\n",
      ],
    ]);

    const report = scanIkemenFeatures({
      paths: [...files.keys()],
      readText: (path) => files.get(path),
    });

    expect(report.features["IKEMEN extended trigger PrevMoveType"]).toBeUndefined();
    expect(report.features["IKEMEN extended trigger PrevStateType"]).toBeUndefined();
    expect(report.features["IKEMEN extended trigger PrevAnim"]).toBe(1);
  });

  it("classifies screenpack DEF paths as report-only IKEMEN package signals", () => {
    const files = new Map<string, string>([
      ["data/select.def", "[Characters]\nkfm, stages/kfm.def\n"],
    ]);

    const report = scanIkemenFeatures({
      paths: [...files.keys()],
      readText: (path) => files.get(path),
    });

    expect(report.detected).toBe(true);
    expect(report.files.screenpack).toEqual(["data/select.def"]);
    expect(report.features["IKEMEN screenpack DEF"]).toBe(1);
    expect(report.findings[0]?.fallback).toContain("report-only");
  });

  it("covers Windows-style IKEMEN package paths, nested config, and 3D stage metadata", () => {
    const files = new Map<string, string>([
      ["data\\save\\config.json", "{\"Difficulty\": 8}\n"],
      ["data\\fight.def", "[Files]\nfont1 = f-4x6.fnt\n"],
      [
        "stages\\tower.def",
        "[Camera]\nstagecamera.z = 32\nzoffsetlink = 1\nstartz = -16\nverticalfollowzoomdelta = 0.25\n[State 0, Zoom]\ntype = Zoom\ntrigger1 = StageTime > 20 && SelfCommand = \"zoom\"\n",
      ],
      ["stages\\tower.obj", ""],
    ]);

    const report = scanIkemenFeatures({
      paths: [...files.keys()],
      readText: (path) => files.get(path),
    });

    expect(report.detected).toBe(true);
    expect(report.files.config).toEqual(["data\\save\\config.json"]);
    expect(report.files.screenpack).toEqual(["data\\fight.def"]);
    expect(report.files.model).toEqual(["stages\\tower.obj"]);
    expect(report.features["IKEMEN config JSON"]).toBe(1);
    expect(report.features["IKEMEN screenpack DEF"]).toBe(1);
    expect(report.features["IKEMEN model stage asset"]).toBe(1);
    expect(report.features["IKEMEN stage parameter stagecamera.z"]).toBe(1);
    expect(report.features["IKEMEN stage parameter zoffsetlink"]).toBe(1);
    expect(report.features["IKEMEN stage parameter startz"]).toBe(1);
    expect(report.features["IKEMEN stage parameter verticalfollowzoomdelta"]).toBe(1);
    expect(report.features["IKEMEN controller Zoom"]).toBe(1);
    expect(report.features["IKEMEN extended trigger StageTime"]).toBe(1);
    expect(report.features["IKEMEN extended trigger SelfCommand"]).toBe(1);
  });

  it("recognizes ZSS fallback files, ZSS language blocks, screenpack menus, and controller parameters as report-only", () => {
    const files = new Map<string, string>([
      [
        "chars/neo/neo.def",
        "[Files]\nst1 = neo.cns\nmovelist = data/neo-movelist.dat\n",
      ],
      [
        "chars/neo/neo.cns",
        "[Statedef 900]\nanim = F 300\n[State 900, Redirected]\ntype = LifeAdd\nRedirectID = PlayerID(4)\nvalue = -1\n",
      ],
      [
        "chars/neo/neo.cns.zss",
        '[Function test]\nlet localCounter = 0\nif StageTime > 20 { assertInput{flag: "x"} camera{view: "Follow"} changeMovelist{value: 1} depth{value: 4} }\nignoreHitPause persistent(3) { getHitVarSet{fall: 1} }\nfor i := 0; i < 2; i++ { mapSet{map: "rounds"; value: i} }\n',
      ],
      [
        "data/system.def",
        "menu.itemname.freebattle = Quick Battle\nmenu.itemname.extras.storymode = Story Mode\nmenu.itemname.menugame = Arcade\n",
      ],
    ]);

    const report = scanIkemenFeatures({
      paths: [...files.keys()],
      readText: (path) => files.get(path),
    });

    expect(report.detected).toBe(true);
    expect(report.files.zss).toEqual(["chars/neo/neo.cns.zss"]);
    expect(report.files.screenpack).toEqual(["data/system.def"]);
    expect(report.features["ZSS fallback file for CNS reference"]).toBe(1);
    expect(report.features["IKEMEN movelist reference"]).toBe(1);
    expect(report.features["IKEMEN RedirectID controller parameter"]).toBe(1);
    expect(report.features["IKEMEN fightfx action prefix"]).toBe(1);
    expect(report.features["ZSS function definition"]).toBe(1);
    expect(report.features["ZSS local variable"]).toBe(1);
    expect(report.features["ZSS ignoreHitPause block"]).toBe(1);
    expect(report.features["ZSS persistent block"]).toBe(1);
    expect(report.features["ZSS loop statement"]).toBe(1);
    expect(report.features["IKEMEN controller AssertInput"]).toBe(1);
    expect(report.features["IKEMEN controller Camera"]).toBe(1);
    expect(report.features["IKEMEN controller ChangeMovelist"]).toBe(1);
    expect(report.features["IKEMEN controller Depth"]).toBe(1);
    expect(report.features["IKEMEN controller GetHitVarSet"]).toBe(1);
    expect(report.features["IKEMEN controller MapSet"]).toBe(1);
    expect(report.features["IKEMEN extended trigger StageTime"]).toBe(1);
    expect(report.features["IKEMEN screenpack menu item"]).toBe(3);
    expect(report.features["IKEMEN extra menu mode freebattle"]).toBe(1);
    expect(report.features["IKEMEN extra menu mode storymode"]).toBe(1);
    expect(report.claimAllowed).toContain("not executed");
    expect(report.claimBlocked).toContain("ZSS/Lua execution");
  });

  it("surfaces IKEMEN scanner findings through loaded character compatibility reports", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/neo/neo.def",
      textBytes(`
[Info]
name = Neo Test
mugenversion = 1.1

[Files]
cns = neo.cns
`),
    );
    vfs.addFile(
      "chars/neo/neo.cns",
      textBytes(`
[Statedef 0]
type = S
physics = S
anim = 0

[State 0, AssertCommand]
type = AssertCommand
trigger1 = Time = 0
name = "holdfwd"
`),
    );
    vfs.addFile("chars/neo/neo.zss", textBytes("[Statedef 200]\n"));
    vfs.addFile("data/select.def", textBytes("[Characters]\nneo\n"));

    const character = await new MugenCharacterLoader().load("neo.zip", vfs);

    expect(character.compatibility.profiles.primary).toBe("mugen-1.1");
    expect(character.compatibility.profiles.active).toContain("ikemen-go-scan");
    expect(character.compatibility.profiles.ikemen.detected).toBe(true);
    expect(character.compatibility.unsupported.some((item) => item.format === "ikemen" && item.feature === "ZSS script file")).toBe(true);
    expect(character.compatibility.unsupported.some((item) => item.format === "ikemen" && item.feature === "IKEMEN screenpack DEF")).toBe(true);
    expect(character.compatibility.unsupported.some((item) => item.format === "controller" && item.feature === "AssertCommand")).toBe(true);
  });
});

function textBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value.trimStart());
}
