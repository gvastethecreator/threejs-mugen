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
