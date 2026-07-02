import { describe, expect, it } from "vitest";
import { parseAct } from "../mugen/parsers/ActParser";

describe("ActParser", () => {
  it("parses Adobe ACT RGB entries into palette colors and raw bytes", () => {
    const buffer = createAct([
      [255, 0, 255],
      [12, 34, 56],
      [90, 120, 150],
    ]);

    const parsed = parseAct(buffer, "pal1.act");

    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.colorCount).toBe(256);
    expect(parsed.colors.slice(0, 3)).toEqual(["#ff00ff", "#0c2238", "#5a7896"]);
    expect(parsed.data?.slice(0, 9)).toEqual(new Uint8Array([255, 0, 255, 12, 34, 56, 90, 120, 150]));
  });

  it("honors optional Adobe ACT color count and transparent index footer", () => {
    const buffer = createAct(
      [
        [0, 0, 0],
        [255, 255, 255],
        [10, 20, 30],
      ],
      { colorCount: 3, transparentIndex: 2 },
    );

    const parsed = parseAct(buffer, "pal2.act");

    expect(parsed.colors).toEqual(["#000000", "#ffffff", "#0a141e"]);
    expect(parsed.colorCount).toBe(3);
    expect(parsed.transparentIndex).toBe(2);
    expect(parsed.raw).toMatchObject({ byteLength: 772, hasAdobeFooter: true });
  });

  it("reports too-short ACT data without throwing", () => {
    const parsed = parseAct(new Uint8Array([1, 2, 3]).buffer, "bad.act");

    expect(parsed.colors).toEqual([]);
    expect(parsed.data).toBeUndefined();
    expect(parsed.diagnostics[0]).toMatchObject({
      severity: "error",
      format: "act",
      file: "bad.act",
    });
  });
});

function createAct(colors: Array<[number, number, number]>, footer?: { colorCount: number; transparentIndex: number }): ArrayBuffer {
  const bytes = new Uint8Array(768 + (footer ? 4 : 0));
  for (let index = 0; index < colors.length; index += 1) {
    bytes.set(colors[index]!, index * 3);
  }
  if (footer) {
    bytes[768] = (footer.colorCount >> 8) & 0xff;
    bytes[769] = footer.colorCount & 0xff;
    bytes[770] = (footer.transparentIndex >> 8) & 0xff;
    bytes[771] = footer.transparentIndex & 0xff;
  }
  return bytes.buffer;
}
