import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createVirtualFileSystemPackageDigest } from "../loader/VirtualFileSystemDigest";

export const REPOSITORY_STAGE_FIXTURE_MANIFEST = Object.freeze({
  schema: "RepositoryStageFixture/v1" as const,
  id: "repository-skyline-relay",
  displayName: "Skyline Relay",
  license: "CC0-1.0",
  licenseFile: "stages/skyline-relay/LICENSE.txt",
  provenance: "Repository-authored deterministic stage fixture",
  entry: "stages/skyline-relay/skyline.def",
  expectedRoutes: ["stage-loader", "stage-report", "stage-depth", "stage-bgctrl", "stage-round-reset"] as const,
  assumptions: {
    localCoord: [640, 480] as const,
    gameSpace: [1280, 720] as const,
    resetBackgroundBetweenRounds: false,
    hasDepthBounds: true,
    hasAnimatedBackground: true,
    hasTiledBackground: true,
    hasBackgroundController: true,
  },
});

export function createRepositoryStageFixtureVfs(): VirtualFileSystem {
  const vfs = new VirtualFileSystem();
  vfs.addFile("data/mugen.cfg", text(REPOSITORY_GAME_CONFIG));
  vfs.addFile(REPOSITORY_STAGE_FIXTURE_MANIFEST.entry, text(REPOSITORY_STAGE_DEF));
  vfs.addFile("stages/skyline-relay/skyline.sff", createRepositoryStageSff());
  vfs.addFile(REPOSITORY_STAGE_FIXTURE_MANIFEST.licenseFile, text(REPOSITORY_STAGE_LICENSE));
  return vfs;
}

export async function createRepositoryStageFixturePackageDigest(
  vfs: VirtualFileSystem = createRepositoryStageFixtureVfs(),
): Promise<string> {
  return createVirtualFileSystemPackageDigest(vfs, "repository stage fixture");
}

const REPOSITORY_GAME_CONFIG = `[Config]
GameWidth = 1280
GameHeight = 720
`;

const REPOSITORY_STAGE_DEF = `[Info]
name = "Skyline Relay"
displayname = "Skyline Relay"
author = "mugen-web-sandbox"
mugenversion = 1.1

[Camera]
startx = 0
starty = 12
boundleft = -520
boundright = 520
zoomout = .85
zoomin = 1.05

[PlayerInfo]
p1startx = -120
p2startx = 120
p1startz = -18
p2startz = 22
topbound = -60
botbound = 80
p1facing = 1
p2facing = -1

[StageInfo]
zoffset = 240
resetBG = 0
localcoord = 640,480

[BGDef]
spr = skyline.sff
debugbg = 0

[BG Skyline]
type = normal
spriteno = 0,0
start = 0,0
delta = .25,.25

[BG Transit]
type = normal
spriteno = 1,0
start = 0,188
delta = .65,.7
tile = 1,0
tilespacing = 12,0
layerno = 1
id = 7

[BG Signal]
type = anim
actionno = 10
start = 46,88
delta = .8,.8
trans = addalpha
alpha = 160,256
maskwindow = -120,24,120,144
windowdelta = .25,0
mask = 1

[Begin Action 10]
2,0,0,0,6
2,1,2,-1,6
Loopstart

[BGCtrlDef TransitPulse]
looptime = 120
ctrlid = 7

[BGCtrl TransitDrift]
type = VelAdd
time = 0,119
x = .12
y = 0
`;

const REPOSITORY_STAGE_LICENSE = `Skyline Relay stage fixture

To the extent possible under law, the mugen-web-sandbox contributors have
waived all copyright and related or neighboring rights to this repository-
authored fixture under CC0 1.0 Universal.

SPDX-License-Identifier: CC0-1.0
License: https://creativecommons.org/publicdomain/zero/1.0/legalcode
`;

const STAGE_SPRITES = [
  { group: 0, index: 0, seed: 1 },
  { group: 1, index: 0, seed: 2 },
  { group: 2, index: 0, seed: 3 },
  { group: 2, index: 1, seed: 4 },
] as const;

function createRepositoryStageSff(): ArrayBuffer {
  const chunks = STAGE_SPRITES.map((sprite) => createPcxSprite(sprite.seed));
  const totalLength = 512 + chunks.reduce((total, chunk) => total + 32 + chunk.length, 0);
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);
  bytes.set(ascii("ElecbyteSpr\0"), 0);
  bytes[12] = 1;
  bytes[13] = 1;
  view.setUint32(16, 1, true);
  view.setUint32(20, STAGE_SPRITES.length, true);
  view.setUint32(24, 512, true);
  view.setUint32(28, 32, true);

  let offset = 512;
  for (const [index, sprite] of STAGE_SPRITES.entries()) {
    const chunk = chunks[index]!;
    const nextOffset = index === chunks.length - 1 ? 0 : offset + 32 + chunk.length;
    view.setUint32(offset, nextOffset, true);
    view.setUint32(offset + 4, chunk.length, true);
    view.setInt16(offset + 8, 4, true);
    view.setInt16(offset + 10, 7, true);
    view.setInt16(offset + 12, sprite.group, true);
    view.setInt16(offset + 14, sprite.index, true);
    bytes.set(chunk, offset + 32);
    offset = nextOffset;
  }
  return bytes.buffer;
}

function createPcxSprite(seed: number): Uint8Array {
  const width = 8;
  const height = 8;
  const header = new Uint8Array(128);
  const view = new DataView(header.buffer);
  header.set([0x0a, 5, 1, 8]);
  view.setInt16(8, width - 1, true);
  view.setInt16(10, height - 1, true);
  header[65] = 1;
  view.setUint16(66, width, true);
  view.setUint16(68, 1, true);

  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pixels[y * width + x] = ((x + y + seed) % 3) + 1;
    }
  }
  const palette = new Uint8Array(769);
  palette[0] = 0x0c;
  palette.set([255, 0, 255], 1);
  palette.set([(40 + seed * 40) % 255, 180, 220], 4);
  palette.set([235, (60 + seed * 35) % 255, 90], 7);
  palette.set([80, 220, (90 + seed * 30) % 255], 10);

  const result = new Uint8Array(header.length + pixels.length + palette.length);
  result.set(header, 0);
  result.set(pixels, header.length);
  result.set(palette, header.length + pixels.length);
  return result;
}

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function ascii(value: string): Uint8Array {
  return Uint8Array.from([...value].map((character) => character.charCodeAt(0)));
}
