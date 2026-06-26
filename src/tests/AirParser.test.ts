import { describe, expect, it } from "vitest";
import { parseAir } from "../mugen/parsers/AirParser";

describe("parseAir", () => {
  it("parses actions, defaults, per-frame clsn and loop marker", () => {
    const parsed = parseAir(`
[Begin Action 200]
Clsn2Default: 1
  Clsn2Default[0] = -20, -80, 20, 0
200,0,0,0,5
Loopstart
Clsn1: 1
  Clsn1[0] = 15, -60, 70, -30
200,1,3,0,4, H
`);

    const action = parsed.actions.get(200);
    expect(action?.frames).toHaveLength(2);
    expect(action?.loopStart).toBe(1);
    expect(action?.frames[0]?.clsn2[0]).toEqual({ x1: -20, y1: -80, x2: 20, y2: 0 });
    expect(action?.frames[1]?.clsn1[0]).toEqual({ x1: 15, y1: -60, x2: 70, y2: -30 });
    expect(action?.frames[1]?.flip).toBe("H");
  });

  it("normalizes collision box corners when AIR coordinates are reversed", () => {
    const parsed = parseAir(`
[Begin Action 1000]
Clsn1: 1
  Clsn1[0] = 68, -66, 9, -44
1000,4,0,0,3
`);

    expect(parsed.actions.get(1000)?.frames[0]?.clsn1[0]).toEqual({ x1: 9, y1: -66, x2: 68, y2: -44 });
  });
});
