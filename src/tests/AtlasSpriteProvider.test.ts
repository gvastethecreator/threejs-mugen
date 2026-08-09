import { describe, expect, it } from "vitest";
import { AtlasSpriteProvider } from "../game/textures/AtlasSpriteProvider";

type RowResolver = { resolveRowName(group: number): string };

function providerWithRows(rows: Record<string, unknown>): RowResolver {
  const provider = Object.create(AtlasSpriteProvider.prototype) as AtlasSpriteProvider & RowResolver;
  Object.defineProperties(provider, {
    manifest: { value: { frame_layout: { rows } } },
    actionMapping: { value: {
      21: "walk-back",
      120: "guard",
      180: "win",
      200: "punch",
      210: "kick",
      220: "special",
      510: "knockdown",
      515: "ko",
      800: "throw",
    } },
  });
  return provider;
}

describe("AtlasSpriteProvider action aliases", () => {
  it("keeps baseline punch/kick rows and resolves classic strike names", () => {
    expect(providerWithRows({ punch: [] }).resolveRowName(21200)).toBe("punch");
    expect(providerWithRows({ "light-strike": [] }).resolveRowName(21200)).toBe("light-strike");
    expect(providerWithRows({ "heavy-strike": [] }).resolveRowName(21210)).toBe("heavy-strike");
  });

  it("resolves every extended karate-reset action row", () => {
    const rows = Object.fromEntries(
      ["walk-back", "guard", "win", "special", "knockdown", "ko", "throw"].map((name) => [name, []]),
    );
    const provider = providerWithRows(rows);
    expect(provider.resolveRowName(15021)).toBe("walk-back");
    expect(provider.resolveRowName(15120)).toBe("guard");
    expect(provider.resolveRowName(15180)).toBe("win");
    expect(provider.resolveRowName(15220)).toBe("special");
    expect(provider.resolveRowName(15510)).toBe("knockdown");
    expect(provider.resolveRowName(15515)).toBe("ko");
    expect(provider.resolveRowName(15800)).toBe("throw");
  });
});
