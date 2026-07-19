import type { MugenFightScreenFont } from "../../mugen/model/MugenSystemAssets";
import type { MugenSprite } from "../../mugen/model/MugenSprite";

export type FightScreenFontGlyph = {
  character: string;
  codePoint: number;
  sprite?: MugenSprite;
  x: number;
  line: number;
  advance: number;
};

export type FightScreenFontTextLayout = {
  text: string;
  lines: string[];
  width: number;
  lineHeight: number;
  glyphs: FightScreenFontGlyph[];
  missingCharacters: string[];
};

export function formatFightScreenText(template: string, roundNo: number): string {
  return template.replace(/%[di]/g, String(Math.max(0, Math.round(roundNo))));
}

export function resolveFightScreenFontGlyph(
  font: MugenFightScreenFont,
  bank: number,
  codePoint: number,
): MugenSprite | undefined {
  if (font.format !== "bitmap" || !font.spriteArchive) {
    return undefined;
  }
  const group = font.bankType === "sprite" ? Math.max(0, Math.round(bank)) : 0;
  return font.spriteArchive.sprites.find((sprite) => sprite.group === group && sprite.index === codePoint);
}

export function layoutFightScreenFontText(
  font: MugenFightScreenFont,
  text: string,
  bank: number,
  alignment: number,
): FightScreenFontTextLayout {
  const lines = text.replace(/\\n/g, "\n").split(/\r?\n/);
  const lineHeight = positiveOrZero(font.height ?? font.size[1]) + font.spacing[1];
  const glyphs: FightScreenFontGlyph[] = [];
  const missingCharacters: string[] = [];
  let width = 0;

  lines.forEach((line, lineIndex) => {
    const characters = [...line];
    const lineGlyphs = characters.map((character) => {
      const codePoint = character.codePointAt(0) ?? 32;
      const sprite = character === " " ? undefined : resolveFightScreenFontGlyph(font, bank, codePoint);
      if (character !== " " && !sprite && !missingCharacters.includes(character)) {
        missingCharacters.push(character);
      }
      const glyphWidth = sprite?.width ?? font.size[0];
      return {
        character,
        codePoint,
        sprite,
        glyphWidth,
        advance: glyphWidth + font.spacing[0],
      };
    });
    const lineWidth = lineGlyphs.reduce((total, glyph, index) => {
      const spacing = index === lineGlyphs.length - 1 ? 0 : font.spacing[0];
      return glyphTextWidth(glyph.glyphWidth, spacing) + total;
    }, 0);
    width = Math.max(width, lineWidth);
    const alignOffset = textAlignmentOffset(lineWidth, normalizeAlignment(alignment));
    let penX = alignOffset;
    for (const glyph of lineGlyphs) {
      glyphs.push({
        character: glyph.character,
        codePoint: glyph.codePoint,
        ...(glyph.sprite ? { sprite: glyph.sprite } : {}),
        x: penX,
        line: lineIndex,
        advance: glyph.advance,
      });
      penX += glyph.advance;
    }
  });

  return { text, lines, width, lineHeight, glyphs, missingCharacters };
}

function normalizeAlignment(value: number): -1 | 0 | 1 {
  if (!Number.isFinite(value) || value === 0) return 0;
  return value < 0 ? -1 : 1;
}

function textAlignmentOffset(width: number, alignment: -1 | 0 | 1): number {
  if (alignment < 0) return -width;
  if (alignment === 0) return -width / 2;
  return 0;
}

function glyphTextWidth(width: number, spacing: number): number {
  return width + spacing > 0 ? width + spacing : 0;
}

function positiveOrZero(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}
