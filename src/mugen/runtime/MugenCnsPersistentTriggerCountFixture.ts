import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";

export const MUGEN_CNS_PERSISTENT_TRIGGER_COUNT_FIXTURE_MANIFEST = Object.freeze({
  schema: "MugenCnsPersistentTriggerCountFixture/v1" as const,
  id: "mugen-cns-persistent-trigger-count",
  displayName: "M.U.G.E.N CNS Persistent Trigger Count",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  statePath: "chars/mugen-lite-journey/persistent-trigger-count.cns",
  expectedStates: [0, 200, 201] as const,
});

export function createMugenCnsPersistentTriggerCountFixtureVfs(): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(DEFINITION));
  vfs.addFile(`${root}/persistent-trigger-count.cns`, text(PERSISTENT_TRIGGER_COUNT_CNS));
  return vfs;
}

export async function createMugenCnsPersistentTriggerCountFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createMugenCnsPersistentTriggerCountFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`M.U.G.E.N CNS persistent trigger-count fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

const DEFINITION = `[Info]
name = "M.U.G.E.N CNS Persistent Trigger Count"
displayname = "M.U.G.E.N CNS Persistent Trigger Count"
author = "mugen-web-sandbox"
localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = persistent-trigger-count.cns
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;

const PERSISTENT_TRIGGER_COUNT_CNS = `[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[State 0, enter sparse trigger state]
type = ChangeState
trigger1 = Time = 0
value = 200

[Statedef 200]
type = S
movetype = I
physics = S
anim = 200
ctrl = 0

[State 200, sparse trigger cadence]
type = PosAdd
trigger1 = StageTime = 1
trigger2 = StageTime = 3
trigger3 = StageTime = 4
persistent = 2
x = 1
y = 0

[State 200, leave sparse trigger state]
type = ChangeState
trigger1 = StageTime = 5
value = 201

[Statedef 201]
type = S
movetype = I
physics = S
anim = 201
ctrl = 0
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
