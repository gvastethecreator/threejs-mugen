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
});
