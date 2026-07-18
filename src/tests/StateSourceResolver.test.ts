import { describe, expect, it } from "vitest";
import { fingerprintMugenStateSource, resolveMugenStateSources } from "../mugen/compiler/StateSourceResolver";
import { parseCns } from "../mugen/parsers/CnsParser";

describe("resolveMugenStateSources", () => {
  it("selects character states before Common1 regardless of input order", () => {
    const characterText = state120("Character Guard Start Done");
    const commonText = state120("Common Guard Start Done");
    const resolution = resolveMugenStateSources([
      source("common", "data/common1.cns", commonText),
      source("character", "chars/probe/probe.cns", characterText),
    ]);

    expect(resolution.states).toHaveLength(1);
    expect(resolution.states[0]?.controllers[0]).toMatchObject({
      name: "Character Guard Start Done",
      source: {
        kind: "character",
        path: "chars/probe/probe.cns",
        fingerprint: fingerprintMugenStateSource(characterText),
      },
    });
    expect(resolution.selections).toEqual([
      {
        stateId: 120,
        selected: {
          kind: "character",
          path: "chars/probe/probe.cns",
          fingerprint: fingerprintMugenStateSource(characterText),
        },
        shadowed: [
          {
            kind: "common",
            path: "data/common1.cns",
            fingerprint: fingerprintMugenStateSource(commonText),
          },
        ],
        reason: "character-override",
      },
    ]);
  });

  it("selects Common1 when character state data omits the state", () => {
    const commonText = state120("Common Guard Start Done");
    const resolution = resolveMugenStateSources([source("common", "data/common1.cns", commonText)]);

    expect(resolution.states[0]?.source).toEqual({
      kind: "common",
      path: "data/common1.cns",
      fingerprint: fingerprintMugenStateSource(commonText),
    });
    expect(resolution.selections[0]).toMatchObject({ stateId: 120, reason: "common-fallback", shadowed: [] });
  });

  it("resolves numeric State 1 and IKEMEN +1 as separate source identities", () => {
    const characterText = `
[Statedef 1]
anim = 1
[State 1, Numeric]
type = VarAdd
v = 0
value = 1

[Statedef +1]
anim = 2
[State +1, Special]
type = VarAdd
v = 0
value = 7
`;
    const resolution = resolveMugenStateSources([source("character", "chars/probe/probe.cns", characterText)]);

    expect(resolution.states.map(({ id, special }) => ({ id, special }))).toEqual([
      { id: 1, special: undefined },
      { id: 1, special: "plus-one" },
    ]);
    expect(resolution.selections.map(({ stateId, special }) => ({ stateId, special }))).toEqual([
      { stateId: 1, special: undefined },
      { stateId: 1, special: "plus-one" },
    ]);
    expect(resolution.states[1]?.controllers[0]?.source).toMatchObject({
      path: "chars/probe/probe.cns",
      kind: "character",
    });
  });
});

function source(kind: "character" | "common", path: string, text: string) {
  return { kind, path, text, states: parseCns(text, path).states };
}

function state120(name: string): string {
  return `[Statedef 120]
type = U
physics = U
anim = 120

[State 120, ${name}]
type = ChangeState
trigger1 = Time >= 1
value = 130
`;
}
