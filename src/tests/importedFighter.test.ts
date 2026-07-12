import { describe, expect, it } from "vitest";
import { createCompatibilityProfiles, createEmptyCompileReport, type CompatibilityReport } from "../mugen/compatibility/CompatibilityReport";
import { createEmptyIkemenScanReport } from "../mugen/compatibility/IkemenFeatureScanner";
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

  it("carries parsed character localcoord into imported fighters", () => {
    const character = fakeCharacter(
      new Map<number, MugenAnimationAction>([
        [0, action(0, [[0, 0, 0]])],
        [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
      ]),
    );
    character.definition.info.localCoord = [640, 480];

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.localCoord).toEqual([640, 480]);
  });

  it("maps assessed package profiles into the HitDef priority policy seam", () => {
    const animations = new Map<number, MugenAnimationAction>([[0, action(0, [[0, 0, 0]])]]);
    const mugen11 = fakeCharacter(animations);
    mugen11.compatibility.profiles = createCompatibilityProfiles({ mugenVersion: "1.1" });
    const ikemen = fakeCharacter(animations);
    ikemen.compatibility.profiles = createCompatibilityProfiles({
      ikemen: {
        ...createEmptyIkemenScanReport(),
        detected: true,
      },
    });

    expect(createImportedFighterDefinition(mugen11)?.hitDefPriorityProfile).toBe("mugen-1.1");
    expect(createImportedFighterDefinition(ikemen)?.hitDefPriorityProfile).toBe("ikemen-go");
    expect(createImportedFighterDefinition(fakeCharacter(animations))?.hitDefPriorityProfile).toBe("unknown");
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

  it("carries IKEMEN FightFX prefix metadata from DEF raw info sections", () => {
    const animations = new Map<number, MugenAnimationAction>([
      [0, action(0, [[0, 0, 0]])],
      [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
    ]);
    const character = fakeCharacter(animations);
    character.definition.rawSections = {
      Info: {
        "fightfx.prefix": "KFM",
      },
    };

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.fightFxPrefix).toBe("kfm");
  });

  it("uses a matching character FightFX library ahead of default system FightFX", () => {
    const animations = new Map<number, MugenAnimationAction>([
      [0, action(0, [[0, 0, 0]])],
      [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
    ]);
    const character = fakeCharacter(animations);
    character.definition.rawSections = {
      Info: {
        "fightfx.prefix": "KFM",
      },
    };
    character.systemAssets = {
      fightDefPath: "data/fight.def",
      diagnostics: [],
      hitSparkLibraries: {
        fightfx: {
          source: "fightfx",
          airPath: "data/fightfx.air",
          sffPath: "data/fightfx.sff",
          diagnostics: [],
          animations: new Map([[7002, action(7002, [[8102, 0, 0]])]]),
        },
      },
      fightFxLibraries: {
        kfm: {
          source: "fightfx",
          prefix: "kfm",
          defPath: "chars/kfm/kfmfx.def",
          airPath: "chars/kfm/kfmfx.air",
          sffPath: "chars/kfm/kfmfx.sff",
          diagnostics: [],
          animations: new Map([[7002, action(7002, [[9902, 0, 0]])]]),
        },
      },
    };

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.hitSparkLibraries?.fightfx?.animations.get(7002)?.frames[0]).toMatchObject({
      spriteGroup: 9902,
      spriteIndex: 0,
    });
  });

  it("uses CNS Data HitDef spark defaults when a state HitDef omits spark refs", () => {
    const animations = new Map<number, MugenAnimationAction>([
      [0, action(0, [[0, 0, 0]])],
      [1000, action(1000, [[1000, 0, 0], [1000, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
    ]);
    const states = [
      state(1000, 1000, [
        controller(1000, "HitDef", {
          damage: "90,4",
          hitsound: "5,4",
          sparkxy: "-10,-60",
        }),
      ]),
    ];
    const character = fakeCharacter(animations, true, states);
    character.constants = { "data.sparkno": 2, "data.guard.sparkno": 40 };

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.stateMoves?.get(1000)).toMatchObject({
      hitSpark: "2",
      guardSpark: "40",
      sparkXy: [-10, -60],
    });
  });

  it("keeps explicit HitDef spark refs ahead of CNS Data defaults", () => {
    const animations = new Map<number, MugenAnimationAction>([
      [0, action(0, [[0, 0, 0]])],
      [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
    ]);
    const states = [
      state(200, 200, [
        controller(200, "HitDef", {
          damage: "30",
          sparkno: "7",
          "guard.sparkno": "41",
        }),
      ]),
    ];
    const character = fakeCharacter(animations, true, states);
    character.constants = { "data.sparkno": 2, "data.guard.sparkno": 40 };

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.stateMoves?.get(200)).toMatchObject({
      hitSpark: "7",
      guardSpark: "41",
    });
  });

  it("preserves explicit and default attack depth on imported state moves", () => {
    const animations = new Map<number, MugenAnimationAction>([
      [0, action(0, [[0, 0, 0]])],
      [200, action(200, [[200, 0, 0], [200, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
      [210, action(210, [[210, 0, 0], [210, 1, 4, { x1: 8, y1: -60, x2: 70, y2: -30 }]])],
    ]);
    const states = [
      state(200, 200, [controller(200, "HitDef", { damage: "30", "attack.depth": "6" })]),
      state(210, 210, [controller(210, "HitDef", { damage: "40" })]),
    ];
    const character = fakeCharacter(animations, true, states);
    character.constants = { "size.attack.depth.top": 7, "size.attack.depth.bottom": 9 };

    const fighter = createImportedFighterDefinition(character);

    expect(fighter?.stateMoves?.get(200)?.attackDepth).toEqual([6, 6]);
    expect(fighter?.stateMoves?.get(210)?.attackDepth).toEqual([7, 9]);
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
    palettes: { total: 0, parsed: 0, colors: 0, withTransparency: 0 },
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
    stateSources: [],
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
