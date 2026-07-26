import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";

/**
 * Repository-authored CC0 FightScreen system package (DA26-12).
 * Own fight.def + FightFX + FNT + SND with named round/outcome/skip/fade paths.
 */
export const SANDBOX_FIGHTSCREEN_MANIFEST = Object.freeze({
  schema: "SandboxFightScreenFixture/v1" as const,
  id: "sandbox-fightscreen",
  displayName: "Sandbox FightScreen",
  license: "CC0-1.0",
  licenseFile: "data/sandbox-fightscreen/LICENSE.txt",
  provenance: "Repository-authored deterministic FightScreen system fixture",
  root: "data/sandbox-fightscreen",
  fightDef: "data/sandbox-fightscreen/fight.def",
  expectedSurfaces: [
    "round",
    "fight",
    "ko",
    "dko",
    "draw",
    "time-over",
    "win-type",
    "intro-skip",
    "fade-in",
    "fade-out",
    "reset-timing",
    "fallback-display",
  ] as const,
  files: [
    "data/sandbox-fightscreen/LICENSE.txt",
    "data/sandbox-fightscreen/README.md",
    "data/sandbox-fightscreen/fight.def",
    "data/sandbox-fightscreen/fightfx.air",
    "data/sandbox-fightscreen/fightfx.sff",
    "data/sandbox-fightscreen/fightfx.snd",
    "data/sandbox-fightscreen/font/standard.def",
    "data/sandbox-fightscreen/font/standard.sff",
  ] as const,
});

export type SandboxFightScreenHashes = Record<(typeof SANDBOX_FIGHTSCREEN_MANIFEST.files)[number], string>;

export function createSandboxFightScreenVfs(): VirtualFileSystem {
  const vfs = new VirtualFileSystem();
  const root = SANDBOX_FIGHTSCREEN_MANIFEST.root;
  vfs.addFile(`${root}/LICENSE.txt`, text(LICENSE));
  vfs.addFile(`${root}/README.md`, text(README));
  vfs.addFile(`${root}/fight.def`, text(FIGHT_DEF));
  vfs.addFile(`${root}/fightfx.air`, text(FIGHTFX_AIR));
  vfs.addFile(`${root}/fightfx.sff`, createSffV1([
    { group: 9100, index: 0, axisX: 4, axisY: 5 },
    { group: 9100, index: 1, axisX: 4, axisY: 5 },
  ]));
  vfs.addFile(
    `${root}/fightfx.snd`,
    createSndV1([
      { group: 7, index: 1 },
      { group: 7, index: 2 },
      { group: 8, index: 1 },
      { group: 8, index: 2 },
      { group: 8, index: 3 },
      { group: 8, index: 4 },
    ]),
  );
  vfs.addFile(`${root}/font/standard.def`, text(FONT_DEF));
  vfs.addFile(
    `${root}/font/standard.sff`,
    createSffV1([
      { group: 0, index: 65, axisX: 0, axisY: 9 },
      { group: 0, index: 66, axisX: 0, axisY: 9 },
      { group: 0, index: 75, axisX: 0, axisY: 9 },
      { group: 0, index: 79, axisX: 0, axisY: 9 },
    ]),
  );
  return vfs;
}

/** Package with a minimal character entry so the system loader discovers fight.def. */
export function createSandboxFightScreenWithProbeCharacterVfs(): VirtualFileSystem {
  const vfs = createSandboxFightScreenVfs();
  vfs.addFile(
    "chars/probe/probe.def",
    text(`[Info]
name = "Probe"
displayname = "Probe"
author = "mugen-web-sandbox"
mugenversion = 1.1
localcoord = 320,240

[Files]
cmd = probe.cmd
cns = probe.cns
st = probe.cns
sprite = probe.sff
anim = probe.air
`),
  );
  vfs.addFile("chars/probe/probe.cmd", text(""));
  vfs.addFile("chars/probe/probe.cns", text(""));
  vfs.addFile(
    "chars/probe/probe.air",
    text(`[Begin Action 0]
0,0,0,0,4
`),
  );
  vfs.addFile("chars/probe/probe.sff", createSffV1([{ group: 0, index: 0, axisX: 16, axisY: 62 }]));
  return vfs;
}

export async function createSandboxFightScreenZipBytes(): Promise<ArrayBuffer> {
  const vfs = createSandboxFightScreenVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) throw new Error(`Sandbox FightScreen package is missing ${path}`);
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
    platform: "DOS",
  });
}

export function hashSandboxFightScreenFiles(vfs: VirtualFileSystem = createSandboxFightScreenVfs()): SandboxFightScreenHashes {
  const hashes = {} as SandboxFightScreenHashes;
  for (const path of SANDBOX_FIGHTSCREEN_MANIFEST.files) {
    const bytes = vfs.readBytes(path);
    if (!bytes) throw new Error(`Sandbox FightScreen package is missing ${path}`);
    hashes[path] = sha256Hex(bytes);
  }
  return hashes;
}

/** Write the folder package under the given absolute or cwd-relative directory. */
export async function materializeSandboxFightScreenFolder(targetDirectory: string): Promise<string[]> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const vfs = createSandboxFightScreenVfs();
  const written: string[] = [];
  for (const filePath of vfs.listFiles()) {
    const absolute = path.resolve(targetDirectory, filePath);
    await mkdir(path.dirname(absolute), { recursive: true });
    const bytes = vfs.readBytes(filePath);
    if (!bytes) throw new Error(`missing ${filePath}`);
    await writeFile(absolute, Buffer.from(bytes));
    written.push(filePath);
  }
  return written.sort((a, b) => a.localeCompare(b));
}

const LICENSE = `Sandbox FightScreen fixture

To the extent possible under law, the mugen-web-sandbox contributors have
waived all copyright and related or neighboring rights to this repository-
authored FightScreen system package under CC0 1.0 Universal.

SPDX-License-Identifier: CC0-1.0
License: https://creativecommons.org/publicdomain/zero/1.0/legalcode
`;

const README = `# Sandbox FightScreen

Repository-authored CC0 FightScreen system package for loader/runtime evidence.

Surfaces covered in \`fight.def\` timing and display tables:

- round / fight call
- KO / Double KO / Draw / Time Over
- win-type text (normal/perfect/clutch samples)
- intro skip shutter
- fade-in / fade-out
- over/reset timing windows
- fallback default round display

Binary assets (\`fightfx.sff\`, \`fightfx.snd\`, font SFF) are generated
deterministically in code. This package does not claim Elecbyte screenpack
visual parity.
`;

const FIGHT_DEF = `[Info]
name = "Sandbox FightScreen"
author = "mugen-web-sandbox"
localcoord = 320, 240

[Files]
fightfx.air = fightfx.air
fightfx.sff = fightfx.sff
sff = fightfx.sff
snd = fightfx.snd
font1 = font/standard.def
font1.height = 12

[Round]
; Reset / over windows
over.waittime = 12
over.hittime = 10
over.wintime = 18
over.forcewintime = 900
over.time = 240

; Round display + fallback default
round.time = 4
round.sndtime = 2
round.default.snd = 8, 2
round.default.anim = 7002
round.default.text = Round %i
round.default.font = 1, 0, 0, 255, 255, 255
round.default.displaytime = 48
round.default.offset = 160, 80
round1.snd = 8, 1
round1.anim = 7002
round.single.snd = 8, 3
round.final.snd = 8, 4

; Fight call
callfight.time = 3
fight.time = 5
fight.sndtime = 1
fight.snd = 7, 1
fight.anim = 7002
fight.text = FIGHT
fight.font = 1, 0, 0, 255, 220, 64
fight.offset = 160, 100

; KO family
ko.time = 3
ko.sndtime = 2
ko.snd = 7, 2
ko.anim = 7002
ko.text = KO
ko.font = 1, 0, 0, 255, 64, 64

; Double KO + draw
dko.time = 4
dko.sndtime = 3
dko.showdraw = true
dko.anim = 7002
dko.text = Double KO
dko.font = 1, 0, 0, 255, 128, 64
draw.time = 4
draw.anim = 7002
draw.text = Draw
draw.font = 1, 0, 0, 200, 200, 255

; Time Over
to.time = 5
to.sndtime = 4
to.snd = 8, 3
to.anim = 7002
to.text = Time Over
to.font = 1, 0, 0, 220, 220, 220

; Win family samples
win.time = 6
win.anim = 7002
win.text = You win
win.font = 1, 0, 0, 255, 255, 128
win2.text = You win 2
p1.win.text = P1 win
p2.win.text = P2 win
p1.n.text.text = Normal win
p1.n.text.font = 1, 0, 0, 240, 220, 200
p1.n.time = 12
p1.n.displaytime = 18
p1.n.snd = 7, 2
p1.n.sndtime = 4
p1.perfect.text.text = Perfect win
p1.clutch.text.text = Clutch win
clutch.threshold = 10

; Intro skip + control handoff
start.waittime = 12
ctrl.time = 30
shutter.time = 15
shutter.col = 0, 0, 0

; Fade in/out
fadein.time = 10
fadein.col = 0, 0, 0
fadein.anim = 7001
fadein.snd = 8, 2
fadeout.time = 16
fadeout.col = 0, 0, 0
fadeout.anim = 7001
fadeout.snd = 7, 1

; Slow-mo residual timing (named, not full parity)
slow.time = 40
slow.fadetime = 20
slow.speed = 0.5
`;

const FIGHTFX_AIR = `[Begin Action 7001]
9100,0,0,0,3
9100,1,0,0,3

[Begin Action 7002]
9100,0,0,0,4
9100,1,0,0,4
`;

const FONT_DEF = `[FNT v2]
fntversion = 2,00

[Def]
Type = bitmap
BankType = palette
Size = 8, 12
Spacing = 1, 2
Offset = 0, -1
File = standard.sff
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function ascii(value: string): number[] {
  return Array.from(value, (char) => char.charCodeAt(0));
}

type SffSpriteSpec = { group: number; index: number; axisX: number; axisY: number };

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

function createPcx2x2(): Uint8Array {
  const header = new Uint8Array(128);
  const view = new DataView(header.buffer);
  header.set([0x0a, 5, 1, 8]);
  view.setInt16(8, 1, true);
  view.setInt16(10, 1, true);
  header[65] = 1;
  view.setUint16(66, 2, true);
  view.setUint16(68, 1, true);
  const pixels = new Uint8Array([2, 1, 1, 2]);
  const palette = new Uint8Array(769);
  palette[0] = 0x0c;
  palette.set([255, 0, 255], 1);
  palette.set([240, 200, 40], 4);
  const result = new Uint8Array(header.length + pixels.length + palette.length);
  result.set(header);
  result.set(pixels, header.length);
  result.set(palette, header.length + pixels.length);
  return result;
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
  bytes[44] = 128 + (sample % 40);
  return bytes;
}

function sha256Hex(bytes: Uint8Array): string {
  // Deterministic pure-JS SHA-256 for fixture hashes in browser and Node tests.
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const bitLength = bytes.length * 8;
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let [a, b, c, d, e, f, g, h] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Uint32Array(64);
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
    for (let index = 16; index < 64; index += 1) {
      const first = words[index - 15]!;
      const second = words[index - 2]!;
      const s0 = rightRotate(first, 7) ^ rightRotate(first, 18) ^ (first >>> 3);
      const s1 = rightRotate(second, 17) ^ rightRotate(second, 19) ^ (second >>> 10);
      words[index] = (words[index - 16]! + s0 + words[index - 7]! + s1) >>> 0;
    }
    let [A, B, C, D, E, F, G, H] = [a, b, c, d, e, f, g, h];
    for (let index = 0; index < 64; index += 1) {
      const S1 = rightRotate(E, 6) ^ rightRotate(E, 11) ^ rightRotate(E, 25);
      const ch = (E & F) ^ (~E & G);
      const temp1 = (H + S1 + ch + constants[index]! + words[index]!) >>> 0;
      const S0 = rightRotate(A, 2) ^ rightRotate(A, 13) ^ rightRotate(A, 22);
      const maj = (A & B) ^ (A & C) ^ (B & C);
      const temp2 = (S0 + maj) >>> 0;
      H = G;
      G = F;
      F = E;
      E = (D + temp1) >>> 0;
      D = C;
      C = B;
      B = A;
      A = (temp1 + temp2) >>> 0;
    }
    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
    e = (e + E) >>> 0;
    f = (f + F) >>> 0;
    g = (g + G) >>> 0;
    h = (h + H) >>> 0;
  }
  return [a, b, c, d, e, f, g, h].map((word) => word.toString(16).padStart(8, "0")).join("");
}

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}
