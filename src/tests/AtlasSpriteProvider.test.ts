import { describe, expect, it } from "vitest";
import { AtlasSpriteProvider } from "../game/textures/AtlasSpriteProvider";

type RowResolver = { resolveRowName(group: number): string };

function providerWithRows(rows: Record<string, unknown>): RowResolver {
  const provider = Object.create(AtlasSpriteProvider.prototype) as AtlasSpriteProvider & RowResolver;
  Object.defineProperties(provider, {
    manifest: { value: { frame_layout: { rows } } },
    actionMapping: { value: { 200: "punch", 210: "kick" } },
  });
  return provider;
}

describe("AtlasSpriteProvider action aliases", () => {
  it("keeps baseline punch/kick rows and resolves classic strike names", () => {
    expect(providerWithRows({ punch: [] }).resolveRowName(21200)).toBe("punch");
    expect(providerWithRows({ "light-strike": [] }).resolveRowName(21200)).toBe("light-strike");
    expect(providerWithRows({ "heavy-strike": [] }).resolveRowName(21210)).toBe("heavy-strike");
  });
});
