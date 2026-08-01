import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";

export const MUGEN_CNS_HITPAUSE_PERSISTENT_ZERO_FIXTURE_MANIFEST = Object.freeze({
  schema: "MugenCnsHitPausePersistentZeroFixture/v1" as const,
  id: "mugen-cns-hitpause-persistent-zero",
  displayName: "M.U.G.E.N CNS HitPause Persistent Zero",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  statePath: "chars/mugen-lite-journey/hitpause-persistent-zero.cns",
  expectedStates: [0, 200, 201] as const,
});

export function createMugenCnsHitPausePersistentZeroFixtureVfs(): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(DEFINITION));
  vfs.addFile(`${root}/hitpause-persistent-zero.cns`, text(HITPAUSE_PERSISTENT_ZERO_CNS));
  return vfs;
}

export async function createMugenCnsHitPausePersistentZeroFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createMugenCnsHitPausePersistentZeroFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`M.U.G.E.N CNS HitPause persistent-zero fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

const DEFINITION = `[Info]
name = "M.U.G.E.N CNS HitPause Persistent Zero"
displayname = "M.U.G.E.N CNS HitPause Persistent Zero"
author = "mugen-web-sandbox"
localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = hitpause-persistent-zero.cns
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;

const HITPAUSE_PERSISTENT_ZERO_CNS = `[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[State 0, enter paused one-shot state]
type = ChangeState
trigger1 = Time = 0
value = 200

[Statedef 200]
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
pausetime = 6,6
ground.hittime = 6
ground.velocity = -1

[State 200, paired pause one-shot]
type = PosAdd
trigger1 = HitPauseTime > 0
ignorehitpause = 1
persistent = 0
x = 1
y = 0

[State 200, unwrapped pause control]
type = VelSet
trigger1 = HitPauseTime > 0
x = 7
y = 0

[State 200, leave paused one-shot state]
type = ChangeState
trigger1 = HitPauseTime = 3
ignorehitpause = 1
value = 201

[Statedef 201]
type = S
movetype = I
physics = S
anim = 201
ctrl = 0

[State 201, return to paused one-shot state]
type = ChangeState
trigger1 = HitPauseTime = 2
ignorehitpause = 1
value = 200
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
