import { describe, expect, it } from "vitest";
import { parseZss } from "../mugen/parsers/ZssParser";

describe("parseZss", () => {
  it("lowers StateDefs, ordered controller calls, branches, and wrappers into shared state IR", () => {
    const parsed = parseZss(`
# ZSS uses # for comments; semicolons delimit parameters.
[StateDef 0;
  type: S;
  physics: S;
  anim: 0;
  ctrl: 1;]
if time = 0 {
  posAdd{x: 12; y: -4;}
} else if time = 1 {
  velSet{x: 2; y: 0;}
} else {
  posAdd{x: 0; y: 0;}
}
ignoreHitPause persistent(2) if time >= 0 {
  changeState{value: 100;}
}

[StateDef 100; type: S; physics: S; anim: 0; ctrl: 0;]
null{}
`, "chars/zss/zss-live.zss");

    expect(parsed.zss).toEqual({ status: "compiled", stateDefs: 2, controllers: 5 });
    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.states.map((state) => ({ id: state.id, type: state.type, physics: state.physics, anim: state.anim, ctrl: state.ctrl }))).toEqual([
      { id: 0, type: "S", physics: "S", anim: 0, ctrl: 1 },
      { id: 100, type: "S", physics: "S", anim: 0, ctrl: 0 },
    ]);
    expect(parsed.states[0]?.controllers.map((controller) => controller.type)).toEqual(["posAdd", "velSet", "posAdd", "changeState"]);
    expect(parsed.states[0]?.controllers.map((controller) => controller.triggers[0]?.expression)).toEqual([
      "(time = 0)",
      "(!(time = 0)) && (time = 1)",
      "(!(time = 0)) && (!(time = 1))",
      "(time >= 0)",
    ]);
    expect(parsed.states[0]?.controllers[3]).toMatchObject({
      type: "changeState",
      params: { value: "100", ignorehitpause: "1", persistent: "2" },
      line: 16,
    });
  });

  it("fails an entire source closed when the grammar leaves the declared slice", () => {
    const parsed = parseZss(`
[StateDef 0; type: S; physics: S; anim: 0; ctrl: 1;]
let localCounter = 1;
posAdd{x: 99;}
`, "chars/zss/blocked.zss");

    expect(parsed.zss.status).toBe("blocked");
    expect(parsed.states).toEqual([]);
    expect(parsed.controllers).toEqual([]);
    expect(parsed.diagnostics).toEqual([
      expect.objectContaining({
        severity: "error",
        format: "zss",
        file: "chars/zss/blocked.zss",
        line: 3,
        message: expect.stringContaining("outside the executable ZSS subset"),
      }),
    ]);
  });

  it("fails an entire source closed when a controller is outside the granted runtime subset", () => {
    const parsed = parseZss(`
[StateDef 0; type: S; physics: S; anim: 0; ctrl: 1;]
turn{}
posAdd{x: 99;}
`, "chars/zss/blocked-controller.zss");

    expect(parsed.zss.status).toBe("blocked");
    expect(parsed.states).toEqual([]);
    expect(parsed.controllers).toEqual([]);
    expect(parsed.diagnostics).toEqual([
      expect.objectContaining({
        severity: "error",
        format: "zss",
        file: "chars/zss/blocked-controller.zss",
        line: 3,
        message: "ZSS controller turn is outside the executable ZSS subset",
      }),
    ]);
  });

  it("fails the whole source when a granted projectile block is malformed after a valid ChangeAnim", () => {
    const parsed = parseZss(`
[StateDef 0; type: S; physics: S; anim: 0; ctrl: 1;]
changeAnim{value: 200;}
projectile{projanim: 200; velocity: ;}
`, "chars/zss/blocked-granted.zss");

    expect(parsed.zss.status).toBe("blocked");
    expect(parsed.states).toEqual([]);
    expect(parsed.controllers).toEqual([]);
    expect(parsed.diagnostics).toEqual([
      expect.objectContaining({
        severity: "error",
        format: "zss",
        file: "chars/zss/blocked-granted.zss",
        message: expect.stringContaining("invalid parameter list"),
      }),
    ]);
  });
});
