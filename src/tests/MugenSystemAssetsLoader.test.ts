import { describe, expect, it } from "vitest";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

describe("MugenCharacterLoader system assets", () => {
  it("loads fight.def FightFX AIR/SFF/SND as common and fightfx hit spark libraries", async () => {
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
      text(`[Info]
localcoord = 640, 360

[Files]
fightfx.air = fightfx.air
fightfx.sff = fightfx.sff
sff = fightfx.sff
snd = fightfx.snd
font1 = ../font/standard.def
font1.height = 14

[Round]
over.waittime = 12
over.hittime = 10
over.wintime = 18
over.forcewintime = 900
over.time = 240
round.time = 4
round.sndtime = 2
round.default.snd = 8, 2
round.default.anim = 7002
round.default.text = Round %i
round.default.font = 1, 0, 0, 256, 128, 64
round.default.displaytime = 60
round.default.offset = 160, 100
round.default.scale = 1.2, 0.8
round.default.palfx.time = 3
round.default.palfx.add = 32, 0, 0
round.default.palfx.mul = 64, 32, 32
round.default.palfx.color = 128
round.default.palfx.invertall = true
round.default.text.palfx.time = 3
round.default.text.palfx.add = 16, 0, 0
round.default.text.palfx.mul = 128, 64, 64
round.default.text.palfx.color = 192
round.default.top.spr = 9100, 1
round.default.top.offset = 160, 120
round.default.top.scale = 1, 1
round.default.top.layerno = 1
round.default.top.xangle = 10
round.default.top.yangle = -20
round.default.top.palfx.time = 3
round.default.top.palfx.add = 32, 0, 0
round.default.top.palfx.mul = 64, 32, 32
round.default.top.palfx.color = 128
round.default.top.palfx.invertall = true
round.default.bg0.anim = 7002
round.default.bg0.offset = 160, 100
round.default.bg0.layerno = 0
round.default.bg0.angle = 15
round.default.bg0.xangle = 5
round.default.bg0.yangle = -6
round.default.bg0.xshear = 0.25
round.default.bg0.window = 80, 40, 240, 160
round1.snd = 8, 1
round1.anim = 7002
round1.offset = 161, 101
round.single.snd = 8, 3
round.single.anim = 7002
round.final.snd = 8, 4
round.final.anim = 7002
callfight.time = 3
fight.time = 5
fight.sndtime = 1
fight.snd = 7, 1
fight.anim = 7002
fight.offset = 160, 110
start.waittime = 12
ctrl.time = 30
shutter.time = 15
shutter.col = 17, 18, 19
fadein.time = 10
fadein.col = 1, 2, 3
fadein.anim = 7001
fadein.snd = 8, 2
fadeout.time = 16
fadeout.col = 12, 34, 56
fadeout.anim = 7001
fadeout.snd = 7, 1
slow.time = 70
slow.fadetime = 50
slow.speed = 0.5

[Begin Action 7002]
9100,0,0,0,3
`),
    );
    vfs.addFile("data/mugen.cfg", text("[Config]\nGameWidth = 1280\nGameHeight = 720\n"));
    vfs.addFile(
      "font/standard.def",
      text(`[FNT v2]
fntversion = 2,00

[Def]
Type = bitmap
BankType = palette
Size = 8, 12
Spacing = 1, 2
Offset = 0, -1
File = standard.sff
`),
    );
    vfs.addFile(
      "font/standard.sff",
      createSffV1([
        { group: 0, index: 82, axisX: 0, axisY: 9 },
        { group: 0, index: 111, axisX: 0, axisY: 9 },
      ]),
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
    vfs.addFile("data/fightfx.snd", createSndV1([{ group: 7, index: 1 }, { group: 8, index: 2 }]));

    const character = await new MugenCharacterLoader().load("kfm.zip", vfs);

    expect(character.systemAssets?.fightDefPath).toBe("data/fight.def");
    expect(character.systemAssets?.fightScreenTiming).toEqual({
      sourcePath: "data/fight.def",
      overWaitTime: 12,
      overHitTime: 10,
      overWinTime: 18,
      overForceWinTime: 900,
      overTime: 240,
      roundTime: 4,
      roundSoundTime: 2,
      roundSound: [8, 2],
      callFightTime: 3,
      fightTime: 5,
      fightSoundTime: 1,
      fightSound: [7, 1],
      startWaitTime: 12,
      controlTime: 30,
      shutterTime: 15,
      shutterColor: [17, 18, 19],
      fadeInTime: 10,
      fadeInColor: [1, 2, 3],
      fadeInAnimationNo: 7001,
      fadeInAnimationDuration: 6,
      fadeInSound: [8, 2],
      fadeOutTime: 16,
      fadeOutColor: [12, 34, 56],
      fadeOutAnimationNo: 7001,
      fadeOutAnimationDuration: 6,
      fadeOutSound: [7, 1],
      slowTime: 70,
      slowFadeTime: 50,
      slowSpeed: 0.5,
    });
    expect(character.systemAssets?.fightScreenAssets).toMatchObject({
      sourcePath: "data/fight.def",
      localCoord: [640, 360],
      sffPath: "data/fightfx.sff",
      sndPath: "data/fightfx.snd",
      display: {
        roundDefault: {
          animationNo: 7002,
          sound: [8, 2],
          text: "Round %i",
          font: [1, 0, 0],
          fontColor: [255, 128, 64, 255],
          displayTime: 60,
          offset: [160, 100],
          scale: [1.2, 0.8],
          paletteFx: {
            time: 3,
            add: [32, 0, 0],
            mul: [64, 32, 32],
            color: 128,
            invertAll: true,
          },
          textPaletteFx: {
            time: 3,
            add: [16, 0, 0],
            mul: [128, 64, 64],
            color: 192,
          },
          top: {
            sprite: [9100, 1],
            offset: [160, 120],
            scale: [1, 1],
            layerNo: 1,
            xAngle: 10,
            yAngle: -20,
            paletteFx: {
              time: 3,
              add: [32, 0, 0],
              mul: [64, 32, 32],
              color: 128,
              invertAll: true,
            },
          },
          background: [
            {
              animationNo: 7002,
              offset: [160, 100],
              layerNo: 0,
              angle: 15,
              xAngle: 5,
              yAngle: -6,
              xShear: 0.25,
              window: [80, 40, 160, 120],
            },
          ],
        },
        roundSingle: { animationNo: 7002, sound: [8, 3] },
        roundFinal: { animationNo: 7002, sound: [8, 4] },
        fight: { animationNo: 7002, sound: [7, 1], offset: [160, 110] },
      },
    });
    expect(character.systemAssets?.fightScreenAssets?.display?.round.get(1)).toEqual({
      animationNo: 7002,
      sound: [8, 1],
      offset: [161, 101],
    });
    expect(character.systemAssets?.fightScreenAssets?.fonts?.get(1)).toMatchObject({
      index: 1,
      sourcePath: "font/standard.def",
      reference: "../font/standard.def",
      height: 14,
      format: "bitmap",
      bankType: "palette",
      size: [8, 12],
      spacing: [1, 2],
      offset: [0, -1],
      filePath: "font/standard.sff",
      spriteArchive: { version: "v1", sprites: expect.arrayContaining([
        expect.objectContaining({ group: 0, index: 82 }),
        expect.objectContaining({ group: 0, index: 111 }),
      ]) },
    });
    expect(character.systemAssets?.fightScreenAssets?.animations.get(7002)?.frames[0]).toMatchObject({
      spriteGroup: 9100,
      spriteIndex: 0,
      duration: 3,
    });
    expect(character.systemAssets?.fightScreenAssets?.soundArchive?.sounds[0]).toMatchObject({
      group: 7,
      index: 1,
      format: "wav",
    });
    expect(character.systemAssets?.gameConfig?.gameSpace).toEqual({ width: 1280, height: 720, sourcePath: "data/mugen.cfg" });
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.airPath).toBe("data/fightfx.air");
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.sffPath).toBe("data/fightfx.sff");
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.sndPath).toBe("data/fightfx.snd");
    expect(character.systemAssets?.hitSparkLibraries.fightfx?.soundArchive?.sounds[0]).toMatchObject({
      group: 7,
      index: 1,
      format: "wav",
    });
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
snd = kfmfx.snd
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
    vfs.addFile("chars/kfm/kfmfx.snd", createSndV1([{ group: 5, index: 0 }]));

    const character = await new MugenCharacterLoader().load("kfm.zip", vfs);

    const prefixed = character.systemAssets?.fightFxLibraries?.kfm_fx;
    expect(prefixed?.defPath).toBe("chars/kfm/kfmfx.def");
    expect(prefixed?.prefix).toBe("kfm_fx");
    expect(prefixed?.airPath).toBe("chars/kfm/kfmfx.air");
    expect(prefixed?.sffPath).toBe("chars/kfm/kfmfx.sff");
    expect(prefixed?.sndPath).toBe("chars/kfm/kfmfx.snd");
    expect(prefixed?.soundArchive?.metadata).toEqual({ soundTotal: 1, decodedTotal: 1 });
    expect(prefixed?.soundArchive?.sounds[0]).toMatchObject({ group: 5, index: 0, format: "wav" });
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

  it("loads ordered Common.Fx packages before character FX prefixes", async () => {
    const vfs = new VirtualFileSystem();
    vfs.addFile(
      "chars/fx/fx.def",
      text(`[Info]
name = "Common FX Character"

[Files]
fx = character-fx.def
`),
    );
    vfs.addFile(
      "chars/fx/character-fx.def",
      text(`[Info]
prefix = shared_fx

[Files]
air = character-fx.air
sff = character-fx.sff
`),
    );
    vfs.addFile("chars/fx/character-fx.air", text("[Begin Action 7001]\n9800,0,0,0,5\n"));
    vfs.addFile(
      "chars/fx/character-fx.sff",
      createSffV1([{ group: 9800, index: 0, axisX: 1, axisY: 2 }]),
    );
    vfs.addFile(
      "data/common-first.def",
      text(`[Info]
prefix = shared_fx

[Files]
air = common-first.air
sff = common-first.sff
`),
    );
    vfs.addFile("data/common-first.air", text("[Begin Action 7001]\n9100,0,0,0,3\n"));
    vfs.addFile(
      "data/common-first.sff",
      createSffV1([{ group: 9100, index: 0, axisX: 3, axisY: 4 }]),
    );
    vfs.addFile(
      "data/common-second.def",
      text(`[Info]
prefix = common_fx

[Files]
air = common-second.air
sff = common-second.sff
`),
    );
    vfs.addFile("data/common-second.air", text("[Begin Action 7002]\n9200,0,0,0,4\n"));
    vfs.addFile(
      "data/common-second.sff",
      createSffV1([{ group: 9200, index: 0, axisX: 5, axisY: 6 }]),
    );
    vfs.addFile("data/common.zss", text("StateDef 900"));
    vfs.addFile(
      "data/mugen.cfg",
      text(`[Common]
Fx1 = common-second.def
Fx = data/common-first.def
Fx2 = data/missing.def
Fx3 = data/common.zss

[Config]
GameWidth = 1280
GameHeight = 720
`),
    );

    const character = await new MugenCharacterLoader().load("fx.zip", vfs);
    const libraries = character.systemAssets?.fightFxLibraries;

    expect(character.systemAssets?.commonFightFxPaths).toEqual(["data/common-first.def", "data/common-second.def"]);
    expect(libraries?.shared_fx?.defPath).toBe("data/common-first.def");
    expect(libraries?.shared_fx?.animations.get(7001)?.frames[0]).toMatchObject({
      spriteGroup: 9100,
      spriteIndex: 0,
    });
    expect(libraries?.common_fx?.animations.get(7002)?.frames[0]).toMatchObject({
      spriteGroup: 9200,
      spriteIndex: 0,
    });
    expect(character.diagnostics).toContainEqual(
      expect.objectContaining({ message: "Referenced global common FightFX file was not found: data/missing.def" }),
    );
    expect(character.diagnostics).toContainEqual(
      expect.objectContaining({ message: "Common.Fx ZSS source is unsupported; only FightFX DEF packages are loaded" }),
    );
    expect(character.diagnostics).toContainEqual(
      expect.objectContaining({ message: "Duplicate FightFX prefix 'shared_fx' ignored" }),
    );
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

function createSndV1(specs: Array<{ group: number; index: number }>): ArrayBuffer {
  const chunks = specs.map((_, index) => createTinyWav(index));
  const totalLength = 512 + chunks.reduce((total, chunk) => total + 16 + chunk.length, 0);
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);

  bytes.set(ascii("ElecbyteSnd\0"), 0);
  view.setUint16(12, 4, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, specs.length, true);
  view.setUint32(20, 512, true);

  let offset = 512;
  for (let soundNumber = 0; soundNumber < specs.length; soundNumber += 1) {
    const spec = specs[soundNumber]!;
    const chunk = chunks[soundNumber]!;
    const nextOffset = soundNumber === specs.length - 1 ? 0 : offset + 16 + chunk.length;
    view.setUint32(offset, nextOffset, true);
    view.setUint32(offset + 4, chunk.length, true);
    view.setInt32(offset + 8, spec.group, true);
    view.setInt32(offset + 12, spec.index, true);
    bytes.set(chunk, offset + 16);
    offset = nextOffset;
  }

  return bytes.buffer;
}

function createTinyWav(sample: number): Uint8Array {
  const bytes = new Uint8Array(45);
  const view = new DataView(bytes.buffer);
  bytes.set(ascii("RIFF"), 0);
  view.setUint32(4, 37, true);
  bytes.set(ascii("WAVE"), 8);
  bytes.set(ascii("fmt "), 12);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  bytes.set(ascii("data"), 36);
  view.setUint32(40, 1, true);
  bytes[44] = sample;
  return bytes;
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
