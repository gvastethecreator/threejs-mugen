import { describe, expect, it } from "vitest";
import type { MugenStagePackage } from "../mugen/model/MugenStagePackage";
import { createStageCompatibilityReport, summarizeStageBackgroundControllers } from "../mugen/compatibility/StageCompatibilityReport";
import { bgCtrlLabStage } from "../mugen/runtime/demoStage";
import { parseStageDef, stageDefToRuntime } from "../mugen/parsers/StageDefParser";

const stageText = `
[Info]
displayname = Report Temple

[BGDef]
spr = temple.sff

[BG Wall]
type = normal
id = 10
spriteno = 1,0
start = 0,0
delta = .8,.75
tile = 1,0
trans = addalpha
alpha = 128,256
window = 0,0,320,240

[BG Animated]
type = anim
id = 20
actionno = 10

[BG Missing]
type = normal
spriteno = 9,9

[BG Parallax]
type = parallax
start = 0,120

[Begin Action 10]
2,0,0,0,4
Loopstart
2,1,0,0,4

[BGCtrlDef Scroll]
ctrlID = 1
looptime = 90

[BGCtrl WallDrift]
type = VelSet
time = 0,60
x = 1
y = 0
ctrlID = 10

[BGCtrl MysteryZoom]
type = ZoomDelta
time = 10
value = 2
ctrlID = 20
`;

describe("createStageCompatibilityReport", () => {
  it("summarizes stage files, BG sprite coverage and unsupported stage features", () => {
    const definition = parseStageDef(stageText, "stages/report.def");
    const stage = stageDefToRuntime(definition, "stage-report-temple");
    const stagePackage: MugenStagePackage = {
      sourceName: "report.zip",
      defPath: "stages/report.def",
      definition,
      stage,
      files: {
        def: "stages/report.def",
        sprite: "stages/temple.sff",
        missing: [],
      },
      spriteArchive: {
        version: "v2",
        sprites: [
          { group: 1, index: 0, width: 100, height: 80, axisX: 0, axisY: 0 },
          { group: 2, index: 0, width: 60, height: 40, axisX: 0, axisY: 0 },
          { group: 2, index: 1, width: 60, height: 40, axisX: 0, axisY: 0 },
        ],
        warnings: [],
        metadata: {
          versionLabel: "2.0.1.0",
          spriteTotal: 4,
          decodedSprites: 1,
          paletteTotal: 1,
          formatCounts: { RLE8: 1 },
          unsupportedFormats: { PNG: 1 },
        },
      },
      diagnostics: [],
    };

    const report = createStageCompatibilityReport(stagePackage);

    expect(report.stage).toBe("Report Temple");
    expect(report.files).toEqual({ def: true, sff: true, music: false });
    expect(report.backgrounds).toMatchObject({
      total: 4,
      withSpriteRefs: 4,
      renderedSprites: 3,
      tiled: 1,
      animated: 1,
      renderedAnimated: 1,
      placeholderFallback: 1,
    });
    expect(report.backgrounds.layers).toEqual([
      expect.objectContaining({
        section: "BG Wall",
        status: "rendered",
        type: "normal",
        controlId: 10,
        sprite: { group: 1, index: 0, decoded: true },
        tiled: true,
        trans: { mode: "addalpha", alpha: { source: 128, destination: 256 } },
        unsupported: ["window/mask clipping"],
      }),
      expect.objectContaining({
        section: "BG Animated",
        status: "animated",
        type: "anim",
        controlId: 20,
        action: { id: 10, frames: 2, decodedFrames: 2, missingFrameRefs: [] },
      }),
      expect.objectContaining({
        section: "BG Missing",
        status: "missing",
        sprite: { group: 9, index: 9, decoded: false },
        fallback: "Stage sprite 9:9 was not decoded",
      }),
      expect.objectContaining({
        section: "BG Parallax",
        status: "unsupported",
        type: "parallax",
        unsupported: ["type:parallax"],
      }),
    ]);
    expect(report.backgrounds.controllers).toMatchObject({
      groups: 1,
      total: 2,
      parsed: 2,
      bounded: 1,
      unsupported: 1,
      targetedLayers: 2,
      unsupportedTypes: { zoomdelta: 1 },
    });
    expect(report.backgrounds.controllers.items).toEqual([
      expect.objectContaining({
        group: "Scroll",
        name: "WallDrift",
        type: "velset",
        status: "bounded",
        ctrlIds: [10],
        targetLayers: [expect.stringContaining("BG Wall")],
        params: { x: "1", y: "0" },
      }),
      expect.objectContaining({
        group: "Scroll",
        name: "MysteryZoom",
        type: "zoomdelta",
        status: "unsupported",
        ctrlIds: [20],
        targetLayers: [expect.stringContaining("BG Animated")],
        unsupported: ["type:zoomdelta"],
      }),
    ]);
    expect(report.sff).toMatchObject({ version: "2.0.1.0", decodedSprites: 3, totalSprites: 4 });
    expect(report.unsupported.map((item) => item.feature)).toEqual(expect.arrayContaining([
      "exact BGCtrl parity",
      "exact window/mask clipping",
      "stage SFF PNG",
      "unsupported BG layer type",
      "unsupported BGCtrl type",
    ]));
    expect(report.unsupported.map((item) => item.feature)).not.toContain("transparency mode");
  });

  it("summarizes native stage BGCtrl rows without a DEF/SFF package", () => {
    const summary = summarizeStageBackgroundControllers(bgCtrlLabStage);

    expect(summary).toMatchObject({
      groups: 1,
      total: 4,
      parsed: 4,
      bounded: 4,
      unsupported: 0,
    });
    expect(summary.items.map((item) => item.status)).toEqual(["bounded", "bounded", "bounded", "bounded"]);
    expect(summary.items.map((item) => item.targetLayers)).toEqual([
      ["lab-cloud-drift"],
      ["lab-sine-ribbon"],
      ["lab-sine-ribbon"],
      ["lab-pulse-core"],
    ]);
  });
});
