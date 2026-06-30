import { describe, expect, it } from "vitest";
import { createCompatibilityProfiles, createEmptyCompileReport, type CompatibilityReport } from "../mugen/compatibility/CompatibilityReport";
import { compileRuntimeProgram } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenCharacter } from "../mugen/model/MugenCharacter";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";

describe("createImportedFighterDefinition", () => {
  it("maps decoded AIR/SFF characters into runtime fighters", () => {
    const character = fakeCharacter(
      new Map<number, MugenAnimationAction>([
        [0, action(0, [[0, 0, 0]])],
        [20, action(20, [[20, 0, 0]])],
        [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
        [230, action(230, [[230, 0, 0], [230, 1, 5, { x1: 12, y1: -48, x2: 96, y2: -18 }]])],
      ]),
    );

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.id).toBe("imported-test-karate");
    expect(fighter?.source).toBe("imported");
    expect(fighter?.idleAction).toBe(0);
    expect(fighter?.walkAction).toBe(20);
    expect(fighter?.moves.punch.actionId).toBe(200);
    expect(fighter?.moves.punch.hitbox).toEqual({ x1: 8, y1: -60, x2: 70, y2: -30 });
    expect(fighter?.moves.kick.actionId).toBe(230);
  });

  it("does not create a runtime fighter without decoded sprites", () => {
    const character = fakeCharacter(new Map([[0, action(0, [[0, 0, 0]])]]), false);

    expect(createImportedFighterDefinition(character)).toBeUndefined();
  });

  it("carries the compiled runtime program into imported fighters", () => {
    const animations = new Map<number, MugenAnimationAction>([
      [0, action(0, [[0, 0, 0]])],
      [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
    ]);
    const states = [state(200, 200, [controller(200, "VelSet", { x: "2" })])];
    const character = fakeCharacter(animations, true, states);

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.runtimeProgram?.states.map((compiledState) => compiledState.id)).toEqual([200]);
    expect(fighter?.runtimeProgram?.states[0]?.controllers[0]?.normalizedType).toBe("velset");
  });

  it("maps loaded system hit spark libraries into imported fighter definitions", () => {
    const animations = new Map<number, MugenAnimationAction>([
      [0, action(0, [[0, 0, 0]])],
      [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
    ]);
    const character = fakeCharacter(animations);
    character.systemAssets = {
      fightDefPath: "data/fight.def",
      diagnostics: [],
      hitSparkLibraries: {
        common: {
          source: "common",
          airPath: "data/fightfx.air",
          sffPath: "data/fightfx.sff",
          diagnostics: [],
          animations: new Map([[7001, action(7001, [[9100, 0, 0]])]]),
        },
        fightfx: {
          source: "fightfx",
          airPath: "data/fightfx.air",
          sffPath: "data/fightfx.sff",
          diagnostics: [],
          animations: new Map([[7002, action(7002, [[9101, 0, 0]])]]),
        },
      },
    };

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.hitSparkLibraries?.common?.animations.get(7001)?.frames[0]).toMatchObject({
      spriteGroup: 9100,
      spriteIndex: 0,
    });
    expect(fighter?.hitSparkLibraries?.fightfx?.animations.get(7002)?.frames[0]).toMatchObject({
      spriteGroup: 9101,
      spriteIndex: 0,
    });
  });
});

function action(id: number, frames: Array<[number, number, number, { x1: number; y1: number; x2: number; y2: number }?]>): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: frames.map(([group, index, offsetX, hitbox], line) => ({
      spriteGroup: group,
      spriteIndex: index,
      offsetX,
      offsetY: 0,
      duration: 4,
      clsn1: hitbox ? [hitbox] : [],
      clsn2: [{ x1: -20, y1: -80, x2: 20, y2: 0 }],
      raw: `${group},${index},${offsetX},0,4`,
      line,
    })),
  };
}

function fakeCharacter(animations: Map<number, MugenAnimationAction>, withSprites = true, states: MugenStateDef[] = []): MugenCharacter {
  const runtimeProgram = compileRuntimeProgram({ commands: [], states, stateEntryControllers: [], animations });
  const compatibility: CompatibilityReport = {
    character: "Test Karate",
    loaded: true,
    files: { def: true, sff: withSprites, air: true, cmd: false, cns: false, snd: false },
    sounds: { total: 0, decoded: 0, wav: 0, unsupported: 0, formats: {}, sampleRates: {}, channels: {} },
    animations: { total: animations.size, loaded: animations.size, withCollisionBoxes: 0 },
    states: {
      total: 0,
      parsed: 0,
      stateEntries: 0,
      recognizedControllerStates: 0,
      compiled: 0,
      triggerSupported: 0,
      runtimeRoutable: 0,
      executed: 0,
      executable: 0,
    },
    triggers: { total: 0, supported: 0, unsupported: 0, unsupportedFeatures: {} },
    controllers: {},
    compiler: states.length > 0 ? runtimeProgram.report : createEmptyCompileReport(),
    profiles: createCompatibilityProfiles({ mugenVersion: "1.0" }),
    unsupported: [],
    warnings: [],
    errors: [],
  };
  return {
    sourceName: "test",
    defPath: "test.def",
    definition: {
      info: { displayName: "Test Karate" },
      files: {},
      rawSections: {},
      rawLines: [],
      diagnostics: [],
    },
    files: { states: [], commonStates: [], palettes: [], missing: [] },
    animations,
    commands: [],
    states,
    stateEntryControllers: [],
    constants: {},
    runtimeProgram,
    spriteArchive: withSprites
      ? {
          version: "v1",
          sprites: [{ group: 0, index: 0, width: 16, height: 16, axisX: 8, axisY: 16 }],
          warnings: [],
        }
      : undefined,
    diagnostics: [],
    compatibility,
  };
}

function state(id: number, anim: number, controllers: MugenStateController[]): MugenStateDef {
  return {
    id,
    anim,
    rawParams: {},
    controllers,
    line: 1,
  };
}

function controller(stateId: number, type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State ${stateId}, ${type}]`,
  };
}
