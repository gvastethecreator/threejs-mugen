import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";
import { fingerprintMugenStateSource } from "../mugen/compiler/StateSourceResolver";

describe("MugenCharacterLoader", () => {
  it("loads DEF palette slots as parsed ACT palettes", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/pal/pal.def",
      textBytes(`
[Info]
name = "Palette Test"

[Files]
pal1 = pal1.act
pal2 = pal2.act
`),
    );
    vfs.addFile("chars/pal/pal1.act", createAct([255, 0, 255]));
    vfs.addFile("chars/pal/pal2.act", createAct([0, 16, 32], { colorCount: 4, transparentIndex: 3 }));

    const character = await new MugenCharacterLoader().load("pal.zip", vfs);

    expect(character.palettes).toHaveLength(2);
    expect(character.palettes?.[0]).toMatchObject({
      group: 1,
      index: 1,
      path: "chars/pal/pal1.act",
      colorCount: 256,
    });
    expect(character.palettes?.[0]?.colors?.[0]).toBe("#ff00ff");
    expect(character.palettes?.[1]).toMatchObject({
      group: 1,
      index: 2,
      path: "chars/pal/pal2.act",
      colorCount: 4,
      transparentIndex: 3,
    });
    expect(character.compatibility.palettes).toEqual({
      total: 2,
      parsed: 2,
      colors: 260,
      withTransparency: 1,
    });
  });

  it("compiles a character state instead of the same stcommon state", async () => {
    const fixture = stateSourceFixture({ withCharacterState120: true });
    const character = await new MugenCharacterLoader().load("source-probe.zip", fixture.vfs);

    expect(character.states.filter((state) => state.id === 120)).toHaveLength(1);
    expect(character.states.find((state) => state.id === 120)?.controllers[0]?.name).toBe("Character Guard Start Done");
    expect(character.runtimeProgram?.states.filter((state) => state.id === 120)).toHaveLength(1);
    expect(character.stateSources.find((selection) => selection.stateId === 120)).toEqual({
      stateId: 120,
      selected: {
        kind: "character",
        path: "chars/source-probe/source-probe.cns",
        fingerprint: fingerprintMugenStateSource(fixture.characterText),
      },
      shadowed: [
        {
          kind: "common",
          path: "data/common1.cns",
          fingerprint: fingerprintMugenStateSource(fixture.commonText),
        },
      ],
      reason: "character-override",
    });
  });

  it("compiles the stcommon state when character state data omits it", async () => {
    const fixture = stateSourceFixture({ withCharacterState120: false });
    const character = await new MugenCharacterLoader().load("source-probe.zip", fixture.vfs);

    expect(character.states.find((state) => state.id === 120)?.controllers[0]).toMatchObject({
      name: "Common Guard Start Done",
      source: {
        kind: "common",
        path: "data/common1.cns",
        fingerprint: fingerprintMugenStateSource(fixture.commonText),
      },
    });
    expect(character.stateSources.find((selection) => selection.stateId === 120)).toMatchObject({
      reason: "common-fallback",
      shadowed: [],
    });
  });

  it("keeps constants from a CNS-only file without importing its state sections", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/constants-only/constants-only.def",
      textBytes(`[Info]
name = "Constants Only"

[Files]
cns = constants-only.cns
`),
    );
    vfs.addFile(
      "chars/constants-only/constants-only.cns",
      textBytes(`[Data]
life = 777

[Statedef 120]
anim = 120
[State 120, Must not load]
type = Null
trigger1 = 1
`),
    );

    const character = await new MugenCharacterLoader().load("constants-only.zip", vfs);

    expect(character.constants["data.life"]).toBe(777);
    expect(character.states).toEqual([]);
    expect(character.stateSources).toEqual([]);
  });

  it("appends IKEMEN negative states across ordered st files and stcommon", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/negative/negative.def",
      textBytes(`[Info]
name = "Negative Merge"
ikemenversion = 0.99

[Files]
cns = negative.cns
st1 = second.st
st = first.st
stcommon = common.cns
`),
    );
    vfs.addFile("chars/negative/negative.cns", textBytes("[Data]\nlife = 900\n"));
    vfs.addFile("chars/negative/first.st", textBytes(negativeState(-2, "First Negative", { physics: "S", value: "1" })));
    vfs.addFile("chars/negative/second.st", textBytes(negativeState(-2, "Second Negative", { ctrl: "0", value: "2" })));
    vfs.addFile("data/common.cns", textBytes(negativeState(-2, "Common Negative", { anim: "7", value: "3" })));

    const character = await new MugenCharacterLoader().load("negative.zip", vfs);
    const state = character.states.find((candidate) => candidate.id === -2);

    expect(state).toMatchObject({ physics: "S", ctrl: 0, anim: 7 });
    expect(state?.controllers.map((controller) => controller.name)).toEqual([
      "First Negative",
      "Second Negative",
      "Common Negative",
    ]);
    expect(state?.controllers.map((controller) => controller.source?.path)).toEqual([
      "chars/negative/first.st",
      "chars/negative/second.st",
      "data/common.cns",
    ]);
    expect(character.stateSources.find((selection) => selection.stateId === -2)).toMatchObject({
      selected: { kind: "character", path: "chars/negative/first.st" },
      shadowed: [],
      appended: [
        { kind: "character", path: "chars/negative/second.st" },
        { kind: "common", path: "data/common.cns" },
      ],
      reason: "ikemen-negative-merge",
    });
  });

  it("loads configured CNS Common.States after stcommon with explicit fallback evidence", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/common/common.def",
      textBytes(`[Info]
name = "Global Common"

[Files]
cns = common.cns
stcommon = common1.cns
`),
    );
    vfs.addFile("chars/common/common.cns", textBytes("[Data]\nlife = 1000\n"));
    vfs.addFile("data/common1.cns", textBytes(namedState(120, "DEF Common Guard")));
    vfs.addFile("data/global-first.cns", textBytes(`${namedState(120, "Global Shadowed Guard")}\n${namedState(900, "Global Fallback")}`));
    vfs.addFile("data/global-second.cns", textBytes(namedState(900, "Global Duplicate")));
    vfs.addFile("data/global-relative.cns", textBytes(namedState(901, "Config Relative Fallback")));
    vfs.addFile("data/global.zss", textBytes("StateDef 900"));
    vfs.addFile(
      "data/mugen.cfg",
      textBytes(`[Common]
States1 = data/global-second.cns
States = data/global-first.cns, data/global.zss, data/missing.cns
States2 = global-relative.cns

[Config]
GameWidth = 1280
GameHeight = 720
`),
    );

    const character = await new MugenCharacterLoader().load("common.zip", vfs);

    expect(character.states.find((state) => state.id === 120)?.controllers[0]?.name).toBe("DEF Common Guard");
    expect(character.states.find((state) => state.id === 900)?.controllers[0]?.name).toBe("Global Fallback");
    expect(character.states.find((state) => state.id === 901)?.controllers[0]?.name).toBe("Config Relative Fallback");
    expect(character.stateSources.find((selection) => selection.stateId === 120)).toMatchObject({
      selected: { kind: "common", path: "data/common1.cns" },
      shadowed: [{ kind: "common", path: "data/global-first.cns" }],
      reason: "common-fallback",
    });
    expect(character.stateSources.find((selection) => selection.stateId === 900)).toMatchObject({
      selected: { kind: "common", path: "data/global-first.cns" },
      shadowed: [{ kind: "common", path: "data/global-second.cns" }],
      reason: "common-fallback",
    });
    expect(character.diagnostics).toContainEqual(
      expect.objectContaining({ message: "Referenced global common state file was not found: data/missing.cns" }),
    );
    expect(character.compatibility.unsupported).toEqual(
      expect.arrayContaining([expect.objectContaining({ format: "ikemen", feature: "Common.States ZSS" })]),
    );
  });

  it("appends ordered Common.Cmd sources through one command parser boundary", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/common-cmd/common-cmd.def",
      textBytes(`[Info]
name = "Common CMD"

[Files]
cmd = common-cmd.cmd
`),
    );
    vfs.addFile(
      "chars/common-cmd/common-cmd.cmd",
      textBytes(`[Command]
name = "character_command"
command = x
`),
    );
    vfs.addFile(
      "data/common-first.cmd",
      textBytes(`[Command]
name = "common_first"
command = a
`),
    );
    vfs.addFile(
      "data/common-second.cmd",
      textBytes(`[Defaults]
command.time = 27

[Command]
name = "common_second"
command = b
`),
    );
    vfs.addFile(
      "data/mugen.cfg",
      textBytes(`[Common]
Cmd1 = common-second.cmd
Cmd = data/common-first.cmd
Cmd2 = data/missing.cmd

[Config]
GameWidth = 1280
GameHeight = 720
`),
    );

    const character = await new MugenCharacterLoader().load("common-cmd.zip", vfs);

    expect(character.files.commonCommands).toEqual(["data/common-first.cmd", "data/common-second.cmd"]);
    expect(character.commands.map((command) => command.name)).toEqual([
      "character_command",
      "common_first",
      "common_second",
    ]);
    expect(character.commands[2]?.time).toBe(27);
    expect(character.compatibility.files.cmd).toBe(true);
    expect(character.diagnostics).toContainEqual(
      expect.objectContaining({ message: "Referenced global common command file was not found: data/missing.cmd" }),
    );
  });

  it("loads Common.Cmd when the DEF has no character CMD and blocks ZSS sources", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/common-only/common-only.def",
      textBytes(`[Info]
name = "Common Only"
`),
    );
    vfs.addFile(
      "data/common.cmd",
      textBytes(`[Command]
name = "common_only"
command = y
`),
    );
    vfs.addFile("data/common.zss", textBytes("StateDef 900"));
    vfs.addFile(
      "data/mugen.cfg",
      textBytes(`[Common]
Cmd = data/common.cmd, data/common.zss

[Config]
GameWidth = 1280
GameHeight = 720
`),
    );

    const character = await new MugenCharacterLoader().load("common-only.zip", vfs);

    expect(character.files.cmd).toBeUndefined();
    expect(character.files.commonCommands).toEqual(["data/common.cmd"]);
    expect(character.commands.map((command) => command.name)).toEqual(["common_only"]);
    expect(character.compatibility.files.cmd).toBe(true);
    expect(character.compatibility.unsupported).toEqual(
      expect.arrayContaining([expect.objectContaining({ format: "ikemen", feature: "Common.Cmd ZSS" })]),
    );
  });
});

function stateSourceFixture(options: { withCharacterState120: boolean }) {
  const vfs = new VirtualFileSystem();
  const characterText = options.withCharacterState120 ? state120("Character Guard Start Done") : stateZero();
  const commonText = state120("Common Guard Start Done");
  vfs.addFile(
    "chars/source-probe/source-probe.def",
    textBytes(`[Info]
name = "Source Probe"

[Files]
cns = source-probe.cns
${options.withCharacterState120 ? "st = source-probe.cns" : ""}
stcommon = common1.cns
`),
  );
  vfs.addFile("chars/source-probe/source-probe.cns", textBytes(characterText));
  vfs.addFile("data/common1.cns", textBytes(commonText));
  return { vfs, characterText: characterText.trimStart(), commonText: commonText.trimStart() };
}

function state120(name: string): string {
  return `[Statedef 120]
type = U
physics = U
anim = 120

[State 120, ${name}]
type = ChangeState
trigger1 = Time >= 1
value = 130
`;
}

function stateZero(): string {
  return `[Statedef 0]
type = S
physics = S
anim = 0
`;
}

function negativeState(id: number, name: string, options: { physics?: string; ctrl?: string; anim?: string; value?: string } = {}): string {
  const physics = options.physics ? `physics = ${options.physics}\n` : "";
  return `[Statedef ${id}]
${physics}
${options.ctrl ? `ctrl = ${options.ctrl}\n` : ""}${options.anim ? `anim = ${options.anim}\n` : ""}
[State ${id}, ${name}]
type = VarAdd
v = 0
value = ${options.value ?? "1"}
`;
}

function namedState(id: number, name: string): string {
  return `[Statedef ${id}]
type = S
physics = S
anim = ${id}

[State ${id}, ${name}]
type = Null
trigger1 = 1
`;
}

function textBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value.trimStart());
}

function createAct(firstColor: [number, number, number], footer?: { colorCount: number; transparentIndex: number }): Uint8Array {
  const bytes = new Uint8Array(768 + (footer ? 4 : 0));
  bytes.set(firstColor, 0);
  if (footer) {
    bytes[768] = (footer.colorCount >> 8) & 0xff;
    bytes[769] = footer.colorCount & 0xff;
    bytes[770] = (footer.transparentIndex >> 8) & 0xff;
    bytes[771] = footer.transparentIndex & 0xff;
  }
  return bytes;
}
