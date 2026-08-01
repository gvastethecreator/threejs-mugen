import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";

export const MUGEN_CNS_SPECIAL_PERSISTENT_FIXTURE_MANIFEST = Object.freeze({
  schema: "MugenCnsSpecialPersistentFixture/v1" as const,
  id: "mugen-cns-special-persistent",
  displayName: "M.U.G.E.N CNS Special State Persistent",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  statePath: "chars/mugen-lite-journey/special-persistent.cns",
  expectedStates: [-2, 0, 200] as const,
});

export function createMugenCnsSpecialPersistentFixtureVfs(): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(DEFINITION));
  vfs.addFile(`${root}/special-persistent.cns`, text(SPECIAL_PERSISTENT_CNS));
  return vfs;
}

export async function createMugenCnsSpecialPersistentFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createMugenCnsSpecialPersistentFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`M.U.G.E.N CNS special persistent fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

const DEFINITION = `[Info]
name = "M.U.G.E.N CNS Special State Persistent"
displayname = "M.U.G.E.N CNS Special State Persistent"
author = "mugen-web-sandbox"
localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = special-persistent.cns
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;

const SPECIAL_PERSISTENT_CNS = `[Statedef -2]
type = S
movetype = I
physics = N
anim = 0
ctrl = 1

[State -2, sparse special cadence]
type = PosAdd
trigger1 = StageTime = 1
trigger2 = StageTime = 3
trigger3 = StageTime = 4
persistent = 2
x = 1
y = 0

[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[State 0, enter special cadence state]
type = ChangeState
trigger1 = Time = 0
value = 200

[Statedef 200]
type = S
movetype = I
physics = S
anim = 200
ctrl = 0

[State 200, stable current state]
type = VelSet
trigger1 = 1
x = 0
y = 0
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
