import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";

export const MUGEN_CNS_STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_FIXTURE_MANIFEST = Object.freeze({
  schema: "MugenCnsStateMinusOneChangeStatePersistentFixture/v1" as const,
  id: "mugen-cns-state-minus-one-changestate-persistent",
  displayName: "M.U.G.E.N CNS State -1 ChangeState Persistent",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  commandPath: "chars/mugen-lite-journey/state-minus-one-changestate-persistent.cmd",
  statePath: "chars/mugen-lite-journey/state-minus-one-changestate-persistent.cns",
  expectedStates: [0, 200, 201] as const,
});

export function createMugenCnsStateMinusOneChangeStatePersistentFixtureVfs(): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(DEFINITION));
  vfs.addFile(
    `${root}/state-minus-one-changestate-persistent.cmd`,
    text(STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_CMD),
  );
  vfs.addFile(
    `${root}/state-minus-one-changestate-persistent.cns`,
    text(STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_CNS),
  );
  return vfs;
}

export async function createMugenCnsStateMinusOneChangeStatePersistentFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createMugenCnsStateMinusOneChangeStatePersistentFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`M.U.G.E.N CNS State -1 ChangeState persistent fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

const DEFINITION = `[Info]
name = "M.U.G.E.N CNS State -1 ChangeState Persistent"
displayname = "M.U.G.E.N CNS State -1 ChangeState Persistent"
author = "mugen-web-sandbox"
localcoord = 320,240

[Files]
cmd = state-minus-one-changestate-persistent.cmd
cns = journey.cns
st = state-minus-one-changestate-persistent.cns
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;

const STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_CMD = `[Command]
name = "state-minus-one-changestate-persistent"
command = x
time = 5

[Statedef -1]
type = S

[State -1, cadence route]
type = ChangeState
trigger1 = StageTime = 1
trigger2 = StageTime = 3
trigger3 = StageTime = 4
persistent = 2
value = 200
ctrl = 1
`;

const STATE_MINUS_ONE_CHANGESTATE_PERSISTENT_CNS = `[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[State 0, stable initial state]
type = VelSet
trigger1 = 1
x = 0
y = 0

[Statedef 200]
type = S
movetype = I
physics = S
anim = 200
ctrl = 1

[State 200, same tick destination]
type = ChangeState
trigger1 = Time = 0
value = 201

[Statedef 201]
type = S
movetype = I
physics = S
anim = 201
ctrl = 1

[State 201, stable destination]
type = VelSet
trigger1 = 1
x = 0
y = 0
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
