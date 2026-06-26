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
