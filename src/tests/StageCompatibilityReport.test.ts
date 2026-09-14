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
mask = 1
scalestart = 1.1,.9
scaledelta = .001,.002
zoomdelta = .5

[BG Animated]
type = anim
id = 20
actionno = 10
positionlink = 1
start = 2,3

[BG Missing]
type = normal
spriteno = 9,9

[BG Parallax]
type = parallax
start = 0,120
yscalestart = 100
yscaledelta = 1.2

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
      clipped: 1,
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
        clip: { source: "window", x1: -160, y1: 0, x2: 160, y2: 240 },
        mask: true,
        scale: {
          start: { x: 1.1, y: 0.9 },
          delta: { x: 0.001, y: 0.002 },
          zoomDelta: { x: 0.5, y: 0.5 },
        },
        unsupported: ["mask color-key semantics"],
      }),
      expect.objectContaining({
        section: "BG Animated",
        status: "animated",
        type: "anim",
        controlId: 20,
        action: { id: 10, frames: 2, decodedFrames: 2, missingFrameRefs: [] },
        positionLink: { targetId: expect.stringContaining("BG Wall"), offsetX: 2, offsetY: 3 },
      }),
      expect.objectContaining({
        section: "BG Missing",
        status: "missing",
        sprite: { group: 9, index: 9, decoded: false },
        fallback: "Stage sprite 9:9 was not decoded",
      }),
      expect.objectContaining({
        section: "BG Parallax",
        status: "fallback",
        type: "parallax",
        scale: {
          start: { x: 1, y: 1 },
          delta: { x: 0, y: 0 },
          legacyYScale: { start: 100, delta: 1.2 },
        },
        unsupported: [],
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
      "exact window/maskwindow clipping",
      "mask color-key semantics",
      "stage SFF PNG",
      "unsupported BGCtrl type",
    ]));
    expect(report.unsupported.map((item) => item.feature)).not.toContain("unsupported BG layer type");
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

  it("reports every authored BG layer beyond the former eight-layer cap", () => {
    const sections = Array.from({ length: 9 }, (_, index) => `
[BG Extra ${index}]
type = normal
id = ${index + 1}
spriteno = ${index},0
`).join("\n");
    const definition = parseStageDef(`[BGDef]\nspr = extra.sff\n${sections}`, "stages/extra.def");
    const stage = stageDefToRuntime(definition, "extra");
    const report = createStageCompatibilityReport({
      sourceName: "extra.zip",
      defPath: "stages/extra.def",
      definition,
      stage,
      files: { def: "stages/extra.def", sprite: "stages/extra.sff", missing: [] },
      diagnostics: [],
    });

    expect(report.backgrounds.total).toBe(9);
    expect(report.backgrounds.layers).toHaveLength(9);
    expect(report.backgrounds.layers[8]).toMatchObject({
      section: "BG Extra 8",
      controlId: 9,
      sprite: { group: 8, index: 0 },
    });
  });

  it("reports parsed static sinusoid fields on authored layers", () => {
    const definition = parseStageDef(`
[BGDef]
spr = wave.sff
[BG Wave]
type = normal
spriteno = 0,0
sin.x = 12,8,0
`, "stages/wave.def");
    const report = createStageCompatibilityReport({
      sourceName: "wave.zip",
      defPath: "stages/wave.def",
      definition,
      stage: stageDefToRuntime(definition, "wave"),
      files: { def: "stages/wave.def", sprite: "stages/wave.sff", missing: [] },
      diagnostics: [],
    });
    expect(report.backgrounds.layers[0]).toMatchObject({
      sinusoid: { x: { amplitude: 12, period: 8, phase: 0 } },
      unsupported: [],
    });
  });

  it("keeps sprite-backed parallax rendered and reports tile/clip parallax as unsupported", () => {
    const definition = parseStageDef(`
[BGDef]
spr = floor.sff
[BG Floor]
type = parallax
spriteno = 0,0
width = 200,80
[BG Tiled]
type = parallax
spriteno = 0,0
width = 200,80
tile = 1,0
`, "stages/parallax.def");
    const report = createStageCompatibilityReport({
      sourceName: "parallax.zip",
      defPath: "stages/parallax.def",
      definition,
      stage: stageDefToRuntime(definition, "parallax"),
      files: { def: "stages/parallax.def", sprite: "stages/floor.sff", missing: [] },
      spriteArchive: {
        version: "v1",
        sprites: [{ group: 0, index: 0, width: 100, height: 40, axisX: 50, axisY: 0 }],
        warnings: [],
      },
      diagnostics: [],
    });
    expect(report.backgrounds.layers[0]).toMatchObject({
      section: "BG Floor",
      status: "rendered",
      type: "parallax",
      unsupported: [],
    });
    expect(report.backgrounds.layers[1]).toMatchObject({
      section: "BG Tiled",
      status: "unsupported",
      unsupported: ["tile+parallax"],
      fallback: "Parallax tile or clip combinations are not rendered as trapezoids",
    });
    expect(report.unsupported.map((item) => item.feature)).toContain("parallax tile or clip");
  });
});
