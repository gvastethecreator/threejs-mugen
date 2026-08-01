import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";

export const MUGEN_CNS_STATE_MINUS_ONE_PERSISTENT_ZERO_FIXTURE_MANIFEST = Object.freeze({
  schema: "MugenCnsStateMinusOnePersistentZeroFixture/v1" as const,
  id: "mugen-cns-state-minus-one-persistent-zero",
  displayName: "M.U.G.E.N CNS State -1 Persistent Zero",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  commandPath: "chars/mugen-lite-journey/state-minus-one-persistent-zero.cmd",
  statePath: "chars/mugen-lite-journey/state-minus-one-persistent-zero.cns",
  expectedStates: [0, 200] as const,
});

export function createMugenCnsStateMinusOnePersistentZeroFixtureVfs(): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(DEFINITION));
  vfs.addFile(`${root}/state-minus-one-persistent-zero.cmd`, text(STATE_MINUS_ONE_PERSISTENT_ZERO_CMD));
  vfs.addFile(`${root}/state-minus-one-persistent-zero.cns`, text(STATE_MINUS_ONE_PERSISTENT_ZERO_CNS));
  return vfs;
}

export async function createMugenCnsStateMinusOnePersistentZeroFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createMugenCnsStateMinusOnePersistentZeroFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`M.U.G.E.N CNS State -1 persistent zero fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

const DEFINITION = `[Info]
name = "M.U.G.E.N CNS State -1 Persistent Zero"
displayname = "M.U.G.E.N CNS State -1 Persistent Zero"
author = "mugen-web-sandbox"
localcoord = 320,240

[Files]
cmd = state-minus-one-persistent-zero.cmd
cns = journey.cns
st = state-minus-one-persistent-zero.cns
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;

const STATE_MINUS_ONE_PERSISTENT_ZERO_CMD = `[Command]
name = "state-minus-one-persistent-zero"
command = x
time = 5

[Statedef -1]
type = S

[State -1, one shot command marker]
type = VarSet
trigger1 = StageTime = 1
trigger2 = StageTime = 3
trigger3 = StageTime = 4
persistent = 0
v = 8
value = 1
`;

const STATE_MINUS_ONE_PERSISTENT_ZERO_CNS = `[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[State 0, enter command cadence state]
type = ChangeState
trigger1 = Time = 0
value = 200

[Statedef 200]
type = S
movetype = I
physics = S
anim = 200
ctrl = 1

[State 200, stable current state]
type = VelSet
trigger1 = 1
x = 0
y = 0
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
