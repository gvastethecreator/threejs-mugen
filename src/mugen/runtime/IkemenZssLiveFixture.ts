import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";

export const IKEMEN_ZSS_LIVE_FIXTURE_MANIFEST = Object.freeze({
  schema: "IkemenZssLiveFixture/v1" as const,
  id: "ikemen-zss-live",
  displayName: "IKEMEN ZSS Live",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  directStatePath: "chars/mugen-lite-journey/live.zss",
  fallbackStatePath: "chars/mugen-lite-journey/live.cns.zss",
  expectedStates: [-2, 0, 100, 101, 102, 104] as const,
});

export const IKEMEN_ZSS_HITPAUSE_FIXTURE_MANIFEST = Object.freeze({
  schema: "IkemenZssHitPauseFixture/v1" as const,
  id: "ikemen-zss-hitpause-wrapper",
  displayName: "IKEMEN ZSS HitPause Wrapper",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  cnsStatePath: "chars/mugen-lite-journey/hitpause.cns",
  rootStatePath: "chars/mugen-lite-journey/hitpause-root.cns",
  directStatePath: "chars/mugen-lite-journey/hitpause.zss",
  expectedStates: [-2, 0, 200] as const,
});

export const IKEMEN_ZSS_COMBINED_PERSISTENT_FIXTURE_MANIFEST = Object.freeze({
  schema: "IkemenZssCombinedPersistentFixture/v1" as const,
  id: "ikemen-zss-combined-persistent-wrapper",
  displayName: "IKEMEN ZSS Combined Persistent Wrapper",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  cnsStatePath: "chars/mugen-lite-journey/persistent-hitpause.cns",
  rootStatePath: "chars/mugen-lite-journey/persistent-hitpause-root.cns",
  directStatePath: "chars/mugen-lite-journey/persistent-hitpause.zss",
  expectedStates: [-2, 0, 200, 201] as const,
});

export type IkemenZssFixtureMode = "direct" | "fallback";

export function createIkemenZssLiveFixtureVfs(mode: IkemenZssFixtureMode = "direct"): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(createDefinition(mode)));
  vfs.addFile(`${root}/ordered.cns`, text(ORDERED_CNS));
  vfs.addFile(
    `${root}/${mode === "direct" ? "live.zss" : "live.cns.zss"}`,
    text(LIVE_ZSS),
  );
  return vfs;
}

export function createIkemenZssMalformedFixtureVfs(): VirtualFileSystem {
  const vfs = createIkemenZssLiveFixtureVfs("direct");
  vfs.addFile("chars/mugen-lite-journey/live.zss", text(MALFORMED_ZSS));
  return vfs;
}

export function createMugenProfileZssFixtureVfs(mode: IkemenZssFixtureMode = "direct"): VirtualFileSystem {
  const vfs = createIkemenZssLiveFixtureVfs(mode);
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(createDefinition(mode, false)));
  return vfs;
}

/**
 * T428 deliberately starts HitPause from CNS. ZSS is limited to the already
 * admitted controller family, so the fixture isolates scheduler filtering of
 * the parsed ignoreHitPause wrapper without treating ZSS HitDef as supported.
 */
export function createIkemenZssHitPauseFixtureVfs(ikemen = true): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(createHitPauseDefinition(ikemen)));
  vfs.addFile(`${root}/hitpause.cns`, text(HITPAUSE_CNS));
  vfs.addFile(`${root}/hitpause-root.cns`, text(HITPAUSE_ROOT_CNS));
  vfs.addFile(`${root}/hitpause.zss`, text(HITPAUSE_ZSS));
  return vfs;
}

export function createMugenProfileZssHitPauseFixtureVfs(): VirtualFileSystem {
  return createIkemenZssHitPauseFixtureVfs(false);
}

/**
 * T429 keeps the T428 pause origin but changes only the parsed ZSS wrapper to
 * the documented combined form. A CNS transition during pause gives the trace
 * a deterministic state-entry reset point without admitting new ZSS syntax.
 */
export function createIkemenZssCombinedPersistentFixtureVfs(ikemen = true): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(createCombinedPersistentDefinition(ikemen)));
  vfs.addFile(`${root}/persistent-hitpause.cns`, text(COMBINED_PERSISTENT_CNS));
  vfs.addFile(`${root}/persistent-hitpause-root.cns`, text(HITPAUSE_ROOT_CNS));
  vfs.addFile(`${root}/persistent-hitpause.zss`, text(COMBINED_PERSISTENT_ZSS));
  return vfs;
}

export function createMugenProfileZssCombinedPersistentFixtureVfs(): VirtualFileSystem {
  return createIkemenZssCombinedPersistentFixtureVfs(false);
}

export async function createIkemenZssLiveFixtureZipBytes(mode: IkemenZssFixtureMode = "direct"): Promise<ArrayBuffer> {
  const vfs = createIkemenZssLiveFixtureVfs(mode);
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`IKEMEN ZSS fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

export async function createIkemenZssHitPauseFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createIkemenZssHitPauseFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`IKEMEN ZSS hit-pause fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

export async function createIkemenZssCombinedPersistentFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createIkemenZssCombinedPersistentFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`IKEMEN ZSS combined persistent fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

function createDefinition(mode: IkemenZssFixtureMode, ikemen = true): string {
  const zssReference = mode === "direct" ? "st1 = live.zss" : "stcommon = live.cns";
  return `[Info]
name = "IKEMEN ZSS Live"
displayname = "IKEMEN ZSS Live"
author = "mugen-web-sandbox"
${ikemen ? "ikemenversion = 0.99\n" : ""}localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = ordered.cns
${zssReference}
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;
}

function createHitPauseDefinition(ikemen: boolean): string {
  return `[Info]
name = "IKEMEN ZSS HitPause Wrapper"
displayname = "IKEMEN ZSS HitPause Wrapper"
author = "mugen-web-sandbox"
${ikemen ? "ikemenversion = 0.99\n" : ""}localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = hitpause.cns
st1 = hitpause-root.cns
st2 = hitpause.zss
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;
}

function createCombinedPersistentDefinition(ikemen: boolean): string {
  return `[Info]
name = "IKEMEN ZSS Combined Persistent Wrapper"
displayname = "IKEMEN ZSS Combined Persistent Wrapper"
author = "mugen-web-sandbox"
${ikemen ? "ikemenversion = 0.99\n" : ""}localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = persistent-hitpause.cns
st1 = persistent-hitpause-root.cns
st2 = persistent-hitpause.zss
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;
}

const ORDERED_CNS = `[Statedef -2]
type = S
physics = S
anim = 0
ctrl = 1

[State -2, CNS before ZSS]
type = Null
trigger1 = 1
`;

const LIVE_ZSS = `# Named executable ZSS subset: T427 motion plus ChangeAnim/ChangeAnim2.
[StateDef -2; type: S; physics: S; anim: 0; ctrl: 1;]
null{}

[StateDef 0; type: S; movetype: I; physics: S; anim: 0; ctrl: 1;]
if time = 0 {
  posAdd{x: 4; y: 0;}
  varSet{v: 2; value: 1;}
  projectile{projanim: 200; projid: 7; velocity: 12, 0; offset: 40, 0; guard.kill: var(2);}
  changeState{value: 100;}
}

[StateDef 100; type: S; movetype: I; physics: S; anim: 0; ctrl: 0;]
ignoreHitPause persistent(2) if time >= 0 {
  velSet{x: 2; y: 0;}
}
if time >= 2 {
  changeState{value: 101;}
} else {
  posAdd{x: 1; y: 0;}
}

[StateDef 101; type: S; movetype: I; physics: S; anim: 0; ctrl: 0;]
if time = 0 {
  posAdd{x: 2; y: 0;}
  changeAnim{value: 200;}
  changeAnim2{value: 200;}
}
if time >= 1 {
  changeState{value: 102;}
}

[StateDef 102; type: S; movetype: I; physics: N; anim: 200; ctrl: 1;]
if time = 0 {
  velAdd{x: 1;}
  velMul{x: 2;}
  posSet{x: 12.5;}
  ctrlSet{value: 0;}
  stateTypeSet{statetype: A;}
  varSet{v: 0; value: 3;}
  varAdd{v: 0; value: 2;}
  varSet{fv: 1; value: 0.5;}
}
persistent(2) if time >= 0 {
  posAdd{y: var(0);}
  velSet{y: fvar(1);}
}
if time >= 1 {
  changeState{value: 104;}
}

[StateDef 104; type: S; movetype: A; physics: N; anim: 200; ctrl: 0;]
if time = 0 {
  posSet{x: 100; y: 0;}
  velSet{x: 0; y: 0;}
  hitDef{
    attr: S, NA;
    damage: var(0), 0;
    pausetime: 0, 0;
    hitflag: MAF;
    guardflag: MA;
    ground.hittime: 8;
    ground.velocity: -1, 0;
  }
}
`;

const MALFORMED_ZSS = `[StateDef 0; type: S; physics: S; anim: 0; ctrl: 1;]
let localCounter = 1;
posAdd{x: 999; y: 0;}
`;

const HITPAUSE_CNS = `[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0

[State 200, CNS HitPause origin]
type = HitDef
trigger1 = Time = 0
attr = S, NA
damage = 1,0
pausetime = 5,5
ground.hittime = 5
ground.velocity = -1
`;

const HITPAUSE_ROOT_CNS = `[Statedef -2]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[State -2, CNS before ZSS]
type = Null
trigger1 = 1
`;

const HITPAUSE_ZSS = `# CNS starts the pause; these two controllers prove the ZSS scheduler filter.
[StateDef -2; type: S; movetype: I; physics: S; anim: 0; ctrl: 1;]
if hitPauseTime > 0 {
  posAdd{x: 100; y: 0;}
}
ignoreHitPause if hitPauseTime > 0 {
  velSet{x: 2; y: 0;}
}

[StateDef 0; type: S; movetype: I; physics: S; anim: 0; ctrl: 1;]
if time = 0 {
  changeState{value: 200;}
}
`;

const COMBINED_PERSISTENT_CNS = `[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0

[State 200, CNS HitPause origin]
type = HitDef
trigger1 = Time = 0
attr = S, NA
damage = 1,0
pausetime = 5,5
ground.hittime = 5
ground.velocity = -1

[State 200, CNS cadence reset]
type = ChangeState
trigger1 = HitPauseTime = 3
ignorehitpause = 1
value = 201

[Statedef 201]
type = S
movetype = I
physics = S
anim = 200
ctrl = 0
`;

const COMBINED_PERSISTENT_ZSS = `# Combined wrapper cadence is exercised only while CNS-owned HitPause is active.
[StateDef -2; type: S; movetype: I; physics: S; anim: 0; ctrl: 1;]
if hitPauseTime > 0 {
  posAdd{x: 100; y: 0;}
}
ignoreHitPause persistent(2) if hitPauseTime > 0 {
  velSet{x: 2; y: 0;}
}

[StateDef 0; type: S; movetype: I; physics: S; anim: 0; ctrl: 1;]
if time = 0 {
  changeState{value: 200;}
}
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
