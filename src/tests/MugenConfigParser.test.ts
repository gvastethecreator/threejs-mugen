import { describe, expect, it } from "vitest";
import { parseMugenConfig } from "../mugen/parsers/MugenConfigParser";

describe("parseMugenConfig", () => {
  it("parses [Config] GameWidth and GameHeight as game-space dimensions", () => {
    const parsed = parseMugenConfig(
      `
[Config]
GameWidth = 1280
GameHeight = 720 ; native height
`,
      "data/mugen.cfg",
    );

    expect(parsed.gameSpace).toEqual({ width: 1280, height: 720, sourcePath: "data/mugen.cfg" });
    expect(parsed.rawSections.Config?.GameWidth).toBe("1280");
    expect(parsed.diagnostics).toEqual([]);
  });

  it("rejects invalid or incomplete game-space dimensions without inventing defaults", () => {
    const parsed = parseMugenConfig(
      `
[Config]
GameWidth = 0
GameHeight = 720
`,
      "config.ini",
    );

    expect(parsed.gameSpace).toBeUndefined();
    expect(parsed.diagnostics[0]).toMatchObject({
      severity: "warning",
      format: "config",
      file: "config.ini",
      message: "Invalid [Config] GameWidth; expected a positive number",
    });
  });

  it("parses case-insensitive finite [Rules] life-to-power multipliers including zero", () => {
    const parsed = parseMugenConfig(
      `
[rUlEs]
default.attack.lifetopowermul = 0
DEFAULT.GETHIT.LIFETOPOWERMUL = -0.25
`,
      "data/mugen.cfg",
    );

    expect(parsed.powerRules).toEqual({
      defaultAttackLifeToPowerMultiplier: 0,
      defaultGetHitLifeToPowerMultiplier: -0.25,
      sourcePath: "data/mugen.cfg",
    });
    expect(parsed.rawSections.rUlEs?.["default.attack.lifetopowermul"]).toBe("0");
    expect(parsed.diagnostics).toEqual([]);
  });

  it("warns for malformed [Rules] multipliers while preserving their raw values", () => {
    const parsed = parseMugenConfig(
      `
[Rules]
Default.Attack.LifeToPowerMul = nope
Default.GetHit.LifeToPowerMul = Infinity
`,
      "config.ini",
    );

    expect(parsed.powerRules).toBeUndefined();
    expect(parsed.rawSections.Rules).toMatchObject({
      "Default.Attack.LifeToPowerMul": "nope",
      "Default.GetHit.LifeToPowerMul": "Infinity",
    });
    expect(parsed.diagnostics).toEqual([
      expect.objectContaining({
        severity: "warning",
        format: "config",
        file: "config.ini",
        message: "Invalid [Rules] Default.Attack.LifeToPowerMul; expected a finite number",
      }),
      expect.objectContaining({
        severity: "warning",
        format: "config",
        file: "config.ini",
        message: "Invalid [Rules] Default.GetHit.LifeToPowerMul; expected a finite number",
      }),
    ]);
  });
});
