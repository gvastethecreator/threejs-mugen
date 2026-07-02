import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

describe("MugenCharacterLoader system assets", () => {
  it("loads fight.def FightFX AIR/SFF as common and fightfx hit spark libraries", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/kfm/kfm.def",
      text(`[Info]
name = "KFM"

[Files]
sprite = kfm.sff
anim = kfm.air
cmd = kfm.cmd
cns = kfm.cns
`),
    );
    vfs.addFile(
      "chars/kfm/kfm.air",
      text(`[Begin Action 0]
0,0,0,0,4
`),
    );
    vfs.addFile("chars/kfm/kfm.cmd", text(""));
    vfs.addFile("chars/kfm/kfm.cns", text(""));
    vfs.addFile("chars/kfm/kfm.sff", createSffV1([{ group: 0, index: 0, axisX: 0, axisY: 0 }]));
    vfs.addFile(
      "data/fight.def",
      text(`[Files]
fightfx.air = fightfx.air
fightfx.sff = fightfx.sff
`),
    );
    vfs.addFile(
      "data/fightfx.air",
      text(`[Begin Action 7001]
9100,0,0,0,3
9100,1,0,0,3
`),
    );
    vfs.addFile(
      "data/fightfx.sff",
      createSffV1([
        { group: 9100, index: 0, axisX: 4, axisY: 5 },
        { group: 9100, index: 1, axisX: 4, axisY: 5 },
      ]),
    );

    const character = await new MugenCharacterLoader().load("kfm.zip", vfs);

    expect(character.systemAssets?.fightDefPath).toBe("data/fight.def");
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.airPath).toBe("data/fightfx.air");
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.sffPath).toBe("data/fightfx.sff");
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.animations.get(7001)?.frames[0]).toMatchObject({
      spriteGroup: 9100,
      spriteIndex: 0,
      duration: 3,
    });
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.spriteArchive?.sprites).toHaveLength(2);
    expect(character.systemAssets?.hitSparkLibraries.common?.animations.has(7001)).toBe(true);
    expect(character.systemAssets?.hitSparkLibraries.common?.spriteArchive?.sprites[0]).toMatchObject({
      group: 9100,
      index: 0,
    });
  });

  it("loads character-declared FX packages by IKEMEN FightFX prefix", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/kfm/kfm.def",
      text(`[Info]
name = "KFM"
fightfx.prefix = kfm_fx

[Files]
sprite = kfm.sff
anim = kfm.air
cmd = kfm.cmd
cns = kfm.cns
fx = kfmfx.def
`),
    );
    vfs.addFile(
      "chars/kfm/kfm.air",
      text(`[Begin Action 0]
0,0,0,0,4
`),
    );
    vfs.addFile("chars/kfm/kfm.cmd", text(""));
    vfs.addFile("chars/kfm/kfm.cns", text(""));
    vfs.addFile("chars/kfm/kfm.sff", createSffV1([{ group: 0, index: 0, axisX: 0, axisY: 0 }]));
    vfs.addFile(
      "chars/kfm/kfmfx.def",
      text(`[Info]
prefix = KFM_FX

[Files]
air = kfmfx.air
sff = kfmfx.sff
`),
    );
    vfs.addFile(
      "chars/kfm/kfmfx.air",
      text(`[Begin Action 7002]
9800,0,3,-4,5
9800,1,3,-4,6
`),
    );
    vfs.addFile(
      "chars/kfm/kfmfx.sff",
      createSffV1([
        { group: 9800, index: 0, axisX: 6, axisY: 7 },
        { group: 9800, index: 1, axisX: 6, axisY: 7 },
      ]),
    );

    const character = await new MugenCharacterLoader().load("kfm.zip", vfs);

    const prefixed = character.systemAssets?.fightFxLibraries?.kfm_fx;
    expect(prefixed?.defPath).toBe("chars/kfm/kfmfx.def");
    expect(prefixed?.prefix).toBe("kfm_fx");
    expect(prefixed?.airPath).toBe("chars/kfm/kfmfx.air");
    expect(prefixed?.sffPath).toBe("chars/kfm/kfmfx.sff");
    expect(prefixed?.animations.get(7002)?.frames).toHaveLength(2);
    expect(prefixed?.animations.get(7002)?.frames[0]).toMatchObject({
      spriteGroup: 9800,
      spriteIndex: 0,
      offsetX: 3,
      offsetY: -4,
      duration: 5,
    });
    expect(prefixed?.spriteArchive?.sprites[0]).toMatchObject({
      group: 9800,
      index: 0,
      axisX: 6,
      axisY: 7,
    });
  });
});

type SffSpriteSpec = {
  group: number;
  index: number;
  axisX: number;
  axisY: number;
};

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function createSffV1(specs: SffSpriteSpec[]): ArrayBuffer {
  const chunks = specs.map(() => createPcx2x2());
  const totalLength = 512 + chunks.reduce((total, chunk) => total + 32 + chunk.length, 0);
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);

  bytes.set(ascii("ElecbyteSpr\0"), 0);
  bytes[12] = 1;
  bytes[13] = 1;
  view.setUint32(16, 1, true);
  view.setUint32(20, specs.length, true);
  view.setUint32(24, 512, true);
  view.setUint32(28, 32, true);

  let offset = 512;
  for (let spriteNumber = 0; spriteNumber < specs.length; spriteNumber += 1) {
    const spec = specs[spriteNumber]!;
    const chunk = chunks[spriteNumber]!;
    const nextOffset = spriteNumber === specs.length - 1 ? 0 : offset + 32 + chunk.length;
    view.setUint32(offset, nextOffset, true);
    view.setUint32(offset + 4, chunk.length, true);
    view.setInt16(offset + 8, spec.axisX, true);
    view.setInt16(offset + 10, spec.axisY, true);
    view.setInt16(offset + 12, spec.group, true);
    view.setInt16(offset + 14, spec.index, true);
    bytes.set(chunk, offset + 32);
    offset = nextOffset;
  }

  return bytes.buffer;
}

function createPcx2x2(): Uint8Array {
  const header = new Uint8Array(128);
  const view = new DataView(header.buffer);
  header[0] = 0x0a;
  header[1] = 5;
  header[2] = 1;
  header[3] = 8;
  view.setInt16(8, 1, true);
  view.setInt16(10, 1, true);
  header[65] = 1;
  view.setUint16(66, 2, true);
  view.setUint16(68, 1, true);

  const pixels = new Uint8Array([0, 1, 2, 3]);
  const palette = new Uint8Array(769);
  palette[0] = 0x0c;
  palette.set([255, 0, 255], 1);
  palette.set([255, 0, 0], 4);
  palette.set([0, 255, 0], 7);
  palette.set([0, 0, 255], 10);

  const result = new Uint8Array(header.length + pixels.length + palette.length);
  result.set(header, 0);
  result.set(pixels, header.length);
  result.set(palette, header.length + pixels.length);
  return result;
}

function ascii(value: string): Uint8Array {
  return Uint8Array.from([...value].map((char) => char.charCodeAt(0)));
}
