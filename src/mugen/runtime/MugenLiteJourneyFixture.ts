import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";

export const MUGEN_LITE_JOURNEY_MANIFEST = Object.freeze({
  schema: "MugenLiteJourneyFixture/v1" as const,
  id: "mugen-lite-journey",
  displayName: "MUGEN Lite Journey",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  expectedRoutes: ["idle", "walk", "crouch", "jump", "attack", "guard", "get-hit", "fall", "recovery", "palette", "no-ko-slow"] as const,
  intentionalUnsupported: ["JourneyUnknownController"] as const,
});

export const MUGEN_LITE_JOURNEY_PALETTE_COLORS = Object.freeze([
  [240, 32, 80],
  [35, 195, 255],
  [255, 210, 45],
] as const);

const MUGEN_LITE_JOURNEY_SOURCE_PALETTE_COLORS = Object.freeze([
  [40, 160, 220],
  [220, 120, 45],
  [90, 215, 105],
] as const);

export function createMugenLiteJourneyVfs(): VirtualFileSystem {
  const vfs = new VirtualFileSystem();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(JOURNEY_DEF));
  vfs.addFile(`${root}/journey.cmd`, text(JOURNEY_CMD));
  vfs.addFile(`${root}/journey.cns`, text(JOURNEY_CNS));
  vfs.addFile(`${root}/journey.air`, text(JOURNEY_AIR));
  vfs.addFile(`${root}/journey.sff`, createFixtureSff());
  vfs.addFile(`${root}/journey-source.act`, createJourneyAct(MUGEN_LITE_JOURNEY_SOURCE_PALETTE_COLORS));
  vfs.addFile(`${root}/journey-palette.act`, createJourneyPaletteAct());
  vfs.addFile(`${root}/LICENSE.txt`, text(JOURNEY_LICENSE));
  return vfs;
}

export async function createMugenLiteJourneyZipBytes(): Promise<ArrayBuffer> {
  const vfs = createMugenLiteJourneyVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) throw new Error(`MUGEN-lite journey package is missing ${path}`);
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

const JOURNEY_LICENSE = `MUGEN Lite Journey fixture

To the extent possible under law, the mugen-web-sandbox contributors have
waived all copyright and related or neighboring rights to this repository-
authored fixture under CC0 1.0 Universal.

SPDX-License-Identifier: CC0-1.0
License: https://creativecommons.org/publicdomain/zero/1.0/legalcode
`;

const JOURNEY_DEF = `[Info]
name = "MUGEN Lite Journey"
displayname = "MUGEN Lite Journey"
author = "mugen-web-sandbox"
mugenversion = 1.1
localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = journey.cns
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act

[Size]
height = 60
ground.back = 15
ground.front = 16
air.back = 12
air.front = 12
`;

const JOURNEY_CMD = `[Defaults]
command.time = 15
command.buffer.time = 3

[Command]
name = "x"
command = x
time = 5

[Command]
name = "recovery"
command = x+y
time = 5

[Command]
name = "finisher"
command = z
time = 5

[Statedef -1]
[State -1, Journey Attack]
type = ChangeState
value = 200
triggerall = command = "x"
trigger1 = ctrl
trigger1 = statetype = S

[State -1, Journey NoKOSlow Finisher]
type = ChangeState
value = 210
triggerall = command = "finisher"
trigger1 = ctrl
trigger1 = statetype = S

[Command]
name = "palette"
command = y
time = 5

[State -1, Journey Palette]
type = ChangeState
value = 220
triggerall = command = "palette"
trigger1 = ctrl
trigger1 = statetype = S
`;

const JOURNEY_CNS = `[Data]
life = 1000
power = 3000
attack = 100
defence = 100

[Velocity]
walk.fwd = 2.4
walk.back = -2.2
jump.neu = 0,-8.5

[Movement]
yaccel = .44

[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[Statedef 10]
type = C
movetype = I
physics = C
anim = 10
ctrl = 1

[Statedef 20]
type = S
movetype = I
physics = S
anim = 20
ctrl = 1

[Statedef 40]
type = A
movetype = I
physics = A
anim = 40
ctrl = 1

[Statedef 120]
type = S
movetype = I
physics = S
anim = 120
ctrl = 0

[State 120, Guard Ready]
type = ChangeState
value = 130
trigger1 = Time >= 1

[Statedef 130]
type = S
movetype = I
physics = S
anim = 130
ctrl = 0

[Statedef 150]
type = S
movetype = H
physics = S
anim = 150
ctrl = 0

[State 150, Guard Exit]
type = ChangeState
value = 0
ctrl = 1
trigger1 = Time >= 8

[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0

[State 200, HitDef]
type = HitDef
trigger1 = Time = 0
attr = S, NA
damage = 70,10
guardflag = MA
pausetime = 0,0
ground.hittime = 12
ground.velocity = -3,-6
fall = 1
fall.recover = 1
fall.recovertime = 8

[State 200, Exit]
type = ChangeState
value = 0
ctrl = 1
trigger1 = Time >= 12

[Statedef 210]
type = S
movetype = A
physics = S
anim = 210
ctrl = 0

[State 210, No KO Slow]
type = AssertSpecial
flag = NoKOSlow
trigger1 = 1

[State 210, Finisher HitDef]
type = HitDef
trigger1 = Time = 0
attr = S, NA
damage = 1200,0
guardflag = MA
pausetime = 0,0
ground.hittime = 12
ground.velocity = -3,-6
fall = 1
fall.recover = 1
fall.recovertime = 8

[State 210, Exit]
type = ChangeState
value = 0
ctrl = 1
trigger1 = Time >= 12

[Statedef 220]
type = S
movetype = I
physics = S
anim = 200
ctrl = 0

[State 220, Apply Palette]
type = RemapPal
source = 1,1
dest = 1,2
trigger1 = Time = 0

[State 220, Exit]
type = ChangeState
value = 0
ctrl = 1
trigger1 = Time >= 8

[Statedef 5000]
type = S
movetype = H
physics = N
anim = 5000
ctrl = 0

[State 5000, Air Fall]
type = ChangeState
value = 5050
trigger1 = Time >= 1

[Statedef 5050]
type = A
movetype = H
physics = N
anim = 5050
ctrl = 0

[State 5050, Fall Motion]
type = HitFallVel
trigger1 = Time = 0

[State 5050, Ground]
type = ChangeState
value = 5100
trigger1 = Pos Y >= 0
trigger1 = Vel Y > 0

[Statedef 5100]
type = L
movetype = H
physics = N
anim = 5100
ctrl = 0

[State 5100, Recovery]
type = ChangeState
value = 5200
trigger1 = Time >= 2
trigger1 = command = "recovery"

[State 5100, Natural Exit]
type = ChangeState
value = 0
ctrl = 1
trigger1 = Time >= 18

[Statedef 5200]
type = A
movetype = I
physics = N
anim = 5200
ctrl = 0

[State 5200, Recovery Exit]
type = ChangeState
value = 0
ctrl = 1
trigger1 = Time >= 4

[Statedef 999]
type = S
movetype = I
physics = S
anim = 0
ctrl = 0

[State 999, Intentional Gap]
type = JourneyUnknownController
trigger1 = 1
`;

const ACTIONS = [0, 10, 20, 40, 120, 130, 150, 200, 5000, 5050, 5100, 5200, 210];
const SPRITES = [...ACTIONS.filter((group) => group !== 210).map((group) => ({ group, index: 0 })), { group: 200, index: 1 }, { group: 210, index: 0 }];
const JOURNEY_AIR = ACTIONS.map((action) => {
  const attacking = action === 200 || action === 210;
  const attackClsn1 = action === 210 ? "8,-48,128,-18" : "8,-48,72,-18";
  return `[Begin Action ${action}]
Clsn2Default: 1
  Clsn2[0] = -16,-60,16,0
${attacking ? `Clsn1: 1\n  Clsn1[0] = ${attackClsn1}\n` : ""}${action},0,0,0,4${action === 200 ? `\n200,1,0,0,4` : ""}
`;
}).join("\n");

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function createFixtureSff(): ArrayBuffer {
  const specs = SPRITES;
  const chunks = specs.map((spec, seed) => createPcxSprite(spec.group, spec.index, seed));
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
  specs.forEach((spec, spriteNumber) => {
    const chunk = chunks[spriteNumber]!;
    const nextOffset = spriteNumber === specs.length - 1 ? 0 : offset + 32 + chunk.length;
    view.setUint32(offset, nextOffset, true);
    view.setUint32(offset + 4, chunk.length, true);
    view.setInt16(offset + 8, 16, true);
    view.setInt16(offset + 10, 62, true);
    view.setInt16(offset + 12, spec.group, true);
    view.setInt16(offset + 14, spec.index, true);
    bytes.set(chunk, offset + 32);
    offset = nextOffset;
  });
  return bytes.buffer;
}

function createJourneyPaletteAct(): Uint8Array {
  return createJourneyAct(MUGEN_LITE_JOURNEY_PALETTE_COLORS);
}

function createJourneyAct(colors: readonly (readonly [number, number, number])[]): Uint8Array {
  const bytes = new Uint8Array(768);
  for (const [index, color] of colors.entries()) {
    bytes.set(color, (index + 1) * 3);
  }
  return bytes;
}

function createPcxSprite(action: number, index: number, seed: number): Uint8Array {
  const width = 32;
  const height = 64;
  const header = new Uint8Array(128);
  const view = new DataView(header.buffer);
  header.set([0x0a, 5, 1, 8]);
  view.setInt16(8, width - 1, true);
  view.setInt16(10, height - 1, true);
  header[65] = 1;
  view.setUint16(66, width, true);
  view.setUint16(68, 1, true);
  const pixels = createPosePixels(action, index, width, height);
  const palette = new Uint8Array(769);
  palette[0] = 0x0c;
  palette.set([255, 0, 255], 1);
  palette.set([(seed * 47) % 255, 180, 240], 4);
  palette.set([240, (seed * 71) % 255, 120], 7);
  palette.set([80, 220, (seed * 29) % 255], 10);
  const result = new Uint8Array(header.length + pixels.length + palette.length);
  result.set(header);
  result.set(pixels, header.length);
  result.set(palette, header.length + pixels.length);
  return result;
}

function createPosePixels(action: number, index: number, width: number, height: number): Uint8Array {
  const pixels = new Uint8Array(width * height);
  const crouching = action === 10;
  const airborne = action === 40 || action === 5050;
  const attacking = action === 200 || action === 210;
  const guarding = action === 120 || action === 130 || action === 150;
  const hit = action === 5000;
  const recovering = action === 5200;
  const fallen = action === 5100;
  if (fallen) {
    fillRect(pixels, width, 3, 49, 28, 59, 2);
    fillRect(pixels, width, 23, 44, 30, 52, 3);
    fillRect(pixels, width, 1, 58, 15, 62, 4);
    return pixels;
  }
  const shiftY = crouching || recovering ? 7 : airborne ? -4 : 0;
  const leanX = hit ? 3 : action === 20 ? 1 : 0;
  fillRect(pixels, width, 11 + leanX, 4 + shiftY, 20 + leanX, 14 + shiftY, 3);
  fillRect(pixels, width, (crouching || recovering ? 7 : 8) + leanX, 15 + shiftY, (crouching || recovering ? 24 : 23) + leanX, 38 + shiftY, 1);
  if (attacking) {
    if (action === 210) {
      fillRect(pixels, width, 20, 8 + shiftY, 31, 17 + shiftY, 2);
      fillRect(pixels, width, 24, 18 + shiftY, 31, 27 + shiftY, 2);
      fillRect(pixels, width, 2, 16 + shiftY, 7, 39 + shiftY, 2);
    } else if (index === 1) {
      fillRect(pixels, width, 22, 12 + shiftY, 31, 19 + shiftY, 2);
      fillRect(pixels, width, 25, 20 + shiftY, 30, 35 + shiftY, 2);
      fillRect(pixels, width, 3, 24 + shiftY, 7, 37 + shiftY, 2);
    } else {
      fillRect(pixels, width, 23, 19 + shiftY, 31, 25 + shiftY, 2);
      fillRect(pixels, width, 4, 21 + shiftY, 8, 34 + shiftY, 2);
    }
  } else if (guarding) {
    const guardLift = action === 120 ? 0 : action === 130 ? 4 : 8;
    fillRect(pixels, width, 20, 10 + shiftY + guardLift, 25, 29 + shiftY + guardLift, 2);
    fillRect(pixels, width, 5, 21 + shiftY - guardLift, 9, 34 + shiftY - guardLift, 2);
  } else if (hit) {
    fillRect(pixels, width, 2, 12, 9, 18, 2);
    fillRect(pixels, width, 24, 29, 30, 35, 2);
  } else {
    const armSwing = action === 20 ? 4 : action === 40 ? -3 : action === 5050 ? 6 : action === 5200 ? 2 : 0;
    fillRect(pixels, width, 4, 19 + shiftY + armSwing, 8, 34 + shiftY + armSwing, 2);
    fillRect(pixels, width, 23, 19 + shiftY - armSwing, 27, 34 + shiftY - armSwing, 2);
  }
  if (crouching || recovering) {
    const split = recovering ? 3 : 0;
    fillRect(pixels, width, 5, 47 - split, 15, 55 - split, 2);
    fillRect(pixels, width, 17 + split, 47, 27 + split, 55, 2);
    fillRect(pixels, width, 3, 56 - split, 14, 62 - split, 4);
    fillRect(pixels, width, 18, 56, 29, 62, 4);
  } else {
    const stride = action === 20 ? 3 : action === 5050 ? 2 : 0;
    fillRect(pixels, width, 8 - stride, 39 + shiftY, 14 - stride, 58 + shiftY, 2);
    fillRect(pixels, width, 17 + stride, 39 + shiftY, 23 + stride, 58 + shiftY, 2);
    fillRect(pixels, width, 5 - stride, 59 + shiftY, 14 - stride, 62 + shiftY, 4);
    fillRect(pixels, width, 17 + stride, 59 + shiftY, 26 + stride, 62 + shiftY, 4);
  }
  return pixels;
}

function fillRect(
  pixels: Uint8Array,
  width: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  color: number,
): void {
  const height = pixels.length / width;
  for (let y = Math.max(0, top); y <= Math.min(height - 1, bottom); y += 1) {
    for (let x = Math.max(0, left); x <= Math.min(width - 1, right); x += 1) {
      pixels[y * width + x] = color;
    }
  }
}

function ascii(value: string): Uint8Array {
  return Uint8Array.from([...value].map((character) => character.charCodeAt(0)));
}
