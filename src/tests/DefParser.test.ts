import { describe, expect, it } from "vitest";
import { parseDef } from "../mugen/parsers/DefParser";

describe("parseDef", () => {
  it("parses core info/files and preserves raw sections", () => {
    const parsed = parseDef(`
[Info]
name = "Kung Fu Man"
displayname = "KFM"
mugenversion = 1.0
ikemenversion = 0.99
author = Elecbyte
localcoord = 640,480

[Files]
cmd = kfm.cmd
cns = kfm.cns
st = extra.st
stcommon = common1.cns
sprite = kfm.sff
anim = kfm.air
sound = kfm.snd
pal1 = kfm.act
`);

    expect(parsed.info.name).toBe("Kung Fu Man");
    expect(parsed.info.displayName).toBe("KFM");
    expect(parsed.info.mugenVersion).toBe("1.0");
    expect(parsed.info.ikemenVersion).toBe("0.99");
    expect(parsed.info.localCoord).toEqual([640, 480]);
    expect(parsed.files.cmd).toBe("kfm.cmd");
    expect(parsed.files.states).toEqual(["extra.st"]);
    expect(parsed.files.commonStates).toEqual(["common1.cns"]);
    expect(parsed.files.palettes).toEqual(["kfm.act"]);
    expect(parsed.rawSections.Files?.sprite).toBe("kfm.sff");
  });

  it("normalizes numbered character state files after the unnumbered st file", () => {
    const parsed = parseDef(`[Files]
st2 = second.st
st9 = ninth.st
st = base.st
st0 = zero.st
st1 = first.st
`);

    expect(parsed.files.states).toEqual(["base.st", "zero.st", "first.st", "second.st", "ninth.st"]);
  });
});
