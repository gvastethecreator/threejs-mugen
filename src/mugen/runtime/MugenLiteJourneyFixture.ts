import { VirtualFileSystem } from "../loader/VirtualFileSystem";

export const MUGEN_LITE_JOURNEY_MANIFEST = Object.freeze({
  schema: "MugenLiteJourneyFixture/v0" as const,
  id: "mugen-lite-journey",
  displayName: "MUGEN Lite Journey",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  expectedRoutes: ["idle", "walk", "crouch", "jump", "attack", "guard", "get-hit", "fall", "recovery"] as const,
  intentionalUnsupported: ["JourneyUnknownController"] as const,
});

export function createMugenLiteJourneyVfs(): VirtualFileSystem {
  const vfs = new VirtualFileSystem();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(JOURNEY_DEF));
  vfs.addFile(`${root}/journey.cmd`, text(JOURNEY_CMD));
  vfs.addFile(`${root}/journey.cns`, text(JOURNEY_CNS));
  vfs.addFile(`${root}/journey.air`, text(JOURNEY_AIR));
  vfs.addFile(`${root}/journey.sff`, createFixtureSff());
  vfs.addFile(`${root}/LICENSE.txt`, text(JOURNEY_LICENSE));
  return vfs;
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

[Statedef -1]
[State -1, Journey Attack]
type = ChangeState
value = 200
triggerall = command = "x"
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

const ACTIONS = [0, 10, 20, 40, 120, 130, 150, 200, 5000, 5050, 5100, 5200];
const JOURNEY_AIR = ACTIONS.map((action) => `[Begin Action ${action}]
Clsn2Default: 1
  Clsn2[0] = -16,-60,16,0
${action === 200 ? "Clsn1: 1\n  Clsn1[0] = 8,-48,72,-18\n" : ""}${action},0,0,0,4
`).join("\n");

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function createFixtureSff(): ArrayBuffer {
  const specs = ACTIONS.map((group) => ({ group, index: 0 }));
  const chunks = specs.map((_, index) => createPcx2x2(index));
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
    view.setInt16(offset + 12, spec.group, true);
    view.setInt16(offset + 14, spec.index, true);
    bytes.set(chunk, offset + 32);
    offset = nextOffset;
  });
  return bytes.buffer;
}

function createPcx2x2(seed: number): Uint8Array {
  const header = new Uint8Array(128);
  const view = new DataView(header.buffer);
  header.set([0x0a, 5, 1, 8]);
  view.setInt16(8, 1, true);
  view.setInt16(10, 1, true);
  header[65] = 1;
  view.setUint16(66, 2, true);
  view.setUint16(68, 1, true);
  const pixels = new Uint8Array([0, 1, 2, 3]);
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

function ascii(value: string): Uint8Array {
  return Uint8Array.from([...value].map((character) => character.charCodeAt(0)));
}
