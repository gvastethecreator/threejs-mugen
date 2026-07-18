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

  it("keeps MUGEN negative duplicates first-listed", () => {
    const firstText = negativeState(-2, "First Negative");
    const secondText = negativeState(-2, "Second Negative");
    const resolution = resolveMugenStateSources([
      source("character", "chars/probe/first.st", firstText),
      source("character", "chars/probe/second.st", secondText),
    ]);

    expect(resolution.states[0]?.controllers.map((controller) => controller.name)).toEqual(["First Negative"]);
    expect(resolution.selections[0]).toMatchObject({
      stateId: -2,
      shadowed: [{ kind: "character", path: "chars/probe/second.st" }],
      reason: "character-only",
    });
  });

  it("appends IKEMEN negative states and preserves source order", () => {
    const firstText = negativeState(-2, "First Negative", { physics: "S", value: "1" });
    const secondText = negativeState(-2, "Second Negative", { ctrl: "0", value: "2" });
    const commonText = negativeState(-2, "Common Negative", { anim: "7", value: "3" });
    const resolution = resolveMugenStateSources(
      [
        source("common", "data/common1.cns", commonText),
        source("character", "chars/probe/first.st", firstText),
        source("character", "chars/probe/second.st", secondText),
      ],
      { negativeStatePolicy: "ikemen-append" },
    );

    expect(resolution.states[0]).toMatchObject({ id: -2, physics: "S", ctrl: 0, anim: 7 });
    expect(resolution.states[0]?.controllers.map((controller) => controller.name)).toEqual([
      "First Negative",
      "Second Negative",
      "Common Negative",
    ]);
    expect(resolution.states[0]?.controllers.map((controller) => controller.source?.path)).toEqual([
      "chars/probe/first.st",
      "chars/probe/second.st",
      "data/common1.cns",
    ]);
    expect(resolution.selections[0]).toMatchObject({
      stateId: -2,
      shadowed: [],
      appended: [
        { kind: "character", path: "chars/probe/second.st" },
        { kind: "common", path: "data/common1.cns" },
      ],
      reason: "ikemen-negative-merge",
    });
  });

  it("appends literal IKEMEN +1 states under the same policy", () => {
    const firstText = plusOneState("First Plus One", "1");
    const secondText = plusOneState("Second Plus One", "2");
    const resolution = resolveMugenStateSources(
      [
        source("character", "chars/probe/first.st", firstText),
        source("character", "chars/probe/second.st", secondText),
      ],
      { negativeStatePolicy: "ikemen-append" },
    );

    expect(resolution.states).toHaveLength(1);
    expect(resolution.states[0]?.special).toBe("plus-one");
    expect(resolution.states[0]?.controllers.map((controller) => controller.name)).toEqual([
      "First Plus One",
      "Second Plus One",
    ]);
  });

  it("does not append a duplicate negative StateDef from the same source file", () => {
    const resolution = resolveMugenStateSources(
      [source("character", "chars/probe/duplicate.st", `${negativeState(-2, "First")}\n${negativeState(-2, "Duplicate")}`)],
      { negativeStatePolicy: "ikemen-append" },
    );

    expect(resolution.states[0]?.controllers.map((controller) => controller.name)).toEqual(["First"]);
    expect(resolution.selections[0]?.appended).toBeUndefined();
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

function negativeState(id: number, name: string, options: { physics?: string; ctrl?: string; anim?: string; value?: string } = {}): string {
  const physics = options.physics ? `physics = ${options.physics}\n` : "";
  return `[Statedef ${id}]
${physics}
${options.ctrl ? `ctrl = ${options.ctrl}\n` : ""}${options.anim ? `anim = ${options.anim}\n` : ""}
[State ${id}, ${name}]
type = VarAdd
v = 0
value = ${options.value ?? "1"}
`;
}

function plusOneState(name: string, value: string): string {
  return `[Statedef +1]
[State +1, ${name}]
type = VarAdd
v = 0
value = ${value}
`;
}
