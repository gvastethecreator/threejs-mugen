import JSZip from "jszip";
import { VirtualFileSystem } from "../loader/VirtualFileSystem";
import { createMugenLiteJourneyVfs } from "./MugenLiteJourneyFixture";

export const MUGEN_CNS_PERSISTENT_ZERO_FIXTURE_MANIFEST = Object.freeze({
  schema: "MugenCnsPersistentZeroFixture/v1" as const,
  id: "mugen-cns-persistent-zero",
  displayName: "M.U.G.E.N CNS Persistent Zero",
  license: "CC0-1.0",
  licenseFile: "chars/mugen-lite-journey/LICENSE.txt",
  provenance: "Repository-authored deterministic test fixture",
  entry: "chars/mugen-lite-journey/journey.def",
  statePath: "chars/mugen-lite-journey/persistent-zero.cns",
  expectedStates: [0, 200, 201] as const,
});

export function createMugenCnsPersistentZeroFixtureVfs(): VirtualFileSystem {
  const vfs = createMugenLiteJourneyVfs();
  const root = "chars/mugen-lite-journey";
  vfs.addFile(`${root}/journey.def`, text(DEFINITION));
  vfs.addFile(`${root}/persistent-zero.cns`, text(PERSISTENT_ZERO_CNS));
  return vfs;
}

export async function createMugenCnsPersistentZeroFixtureZipBytes(): Promise<ArrayBuffer> {
  const vfs = createMugenCnsPersistentZeroFixtureVfs();
  const zip = new JSZip();
  const fixtureDate = new Date("1980-01-01T00:00:00.000Z");
  for (const path of vfs.listFiles()) {
    const bytes = vfs.readBytes(path);
    if (!bytes) {
      throw new Error(`M.U.G.E.N CNS persistent-zero fixture is missing ${path}`);
    }
    zip.file(path, bytes, { date: fixtureDate, createFolders: false });
  }
  return zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, platform: "DOS" });
}

const DEFINITION = `[Info]
name = "M.U.G.E.N CNS Persistent Zero"
displayname = "M.U.G.E.N CNS Persistent Zero"
author = "mugen-web-sandbox"
localcoord = 320,240

[Files]
cmd = journey.cmd
cns = journey.cns
st = persistent-zero.cns
sprite = journey.sff
anim = journey.air
pal1 = journey-source.act
pal2 = journey-palette.act
`;

const PERSISTENT_ZERO_CNS = `[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[State 0, enter one-shot state]
type = ChangeState
trigger1 = Time = 0
value = 200

[Statedef 200]
type = S
movetype = I
physics = S
anim = 200
ctrl = 0

[State 200, once per entry]
type = PosAdd
trigger1 = 1
persistent = 0
x = 1
y = 0

[State 200, regular controller]
type = VelSet
trigger1 = 1
x = 1
y = 0

[State 200, leave one-shot state]
type = ChangeState
trigger1 = Time = 2
value = 201

[Statedef 201]
type = S
movetype = I
physics = S
anim = 201
ctrl = 0

[State 201, return to one-shot state]
type = ChangeState
trigger1 = Time = 0
value = 200
`;

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
