import { describe, expect, it } from "vitest";
import {
  formatFightScreenText,
  layoutFightScreenFontText,
  resolveFightScreenFontGlyph,
} from "../game/render/FightScreenFontRenderer";
import type { MugenFightScreenFont } from "../mugen/model/MugenSystemAssets";

describe("FightScreenFontRenderer", () => {
  const font: MugenFightScreenFont = {
    index: 1,
    sourcePath: "font/test.def",
    format: "bitmap",
    bankType: "palette",
    size: [5, 8],
    spacing: [1, 2],
    offset: [0, 0],
    spriteArchive: {
      version: "v1",
      sprites: [
        sprite(0, 65, 3, 7),
        sprite(0, 66, 4, 7),
      ],
      warnings: [],
    },
    diagnostics: [],
  };

  it("formats round placeholders without changing unrelated percent text", () => {
    expect(formatFightScreenText("ROUND %i / %d %%", 3)).toBe("ROUND 3 / 3 %%");
  });

  it("maps palette-bank glyphs to group zero and reports missing glyphs", () => {
    expect(resolveFightScreenFontGlyph(font, 7, 65)).toMatchObject({ group: 0, index: 65 });
    expect(resolveFightScreenFontGlyph(font, 7, 67)).toBeUndefined();

    const layout = layoutFightScreenFontText(font, "AB\\nAC", 7, 0);
    expect(layout.lines).toEqual(["AB", "AC"]);
    expect(layout.lineHeight).toBe(10);
    expect(layout.width).toBe(9);
    expect(layout.missingCharacters).toEqual(["C"]);
    expect(layout.glyphs.map(({ character, x, line }) => ({ character, x, line }))).toEqual([
      { character: "A", x: -4, line: 0 },
      { character: "B", x: 0, line: 0 },
      { character: "A", x: -4.5, line: 1 },
      { character: "C", x: -0.5, line: 1 },
    ]);
  });

  it("uses the selected group for sprite-bank fonts", () => {
    const spriteBankFont = {
      ...font,
      bankType: "sprite",
      spriteArchive: {
        ...font.spriteArchive!,
        sprites: [sprite(2, 65, 6, 7)],
      },
    } satisfies MugenFightScreenFont;

    expect(resolveFightScreenFontGlyph(spriteBankFont, 2, 65)).toMatchObject({ group: 2, index: 65 });
    expect(resolveFightScreenFontGlyph(spriteBankFont, 1, 65)).toBeUndefined();
  });
});

function sprite(group: number, index: number, width: number, height: number) {
  return { group, index, width, height, axisX: 0, axisY: height };
}
