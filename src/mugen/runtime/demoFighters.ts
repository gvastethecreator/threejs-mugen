import type { CollisionBox } from "../model/CollisionBox";
import type { RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenCommand } from "../model/MugenCommand";
import type { MugenStateController, MugenStateDef } from "../model/MugenState";
import type { RuntimeGetHitVars, RuntimeResolvedSoundRef } from "./types";

export type HitSparkLibrarySource = "common" | "fightfx";

export type HitSparkLibrary = {
  source: HitSparkLibrarySource;
  animations: Map<number, MugenAnimationAction>;
};

export type DemoMove = {
  actionId: number;
  startup: number;
  activeStart: number;
  activeEnd: number;
  recovery: number;
  damage: number;
  kill?: boolean;
  attr?: string;
  priority?: number;
  targetId?: number;
  requiresHitDef?: boolean;
  isReversal?: boolean;
  reversalAttr?: string;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  missOnOverride?: boolean;
  defaultTargetStateNo?: number;
  hitPause: number;
  hitStun: number;
  push: number;
  hitVelocityY?: number;
  hitVars?: RuntimeGetHitVars;
  guardDistance?: number;
  guardFlag?: string;
  guardDamage?: number;
  guardKill?: boolean;
  guardPause?: number;
  guardStun?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  guardPush?: number;
  guardVelocityY?: number;
  airGuardPush?: number;
  airGuardVelocityY?: number;
  cornerPush?: number;
  airCornerPush?: number;
  downCornerPush?: number;
  guardCornerPush?: number;
  airGuardCornerPush?: number;
  hitSound?: string;
  guardSound?: string;
  hitSoundValue?: RuntimeResolvedSoundRef;
  guardSoundValue?: RuntimeResolvedSoundRef;
  hitSpark?: string;
  guardSpark?: string;
  sparkXy?: [number, number];
  fall?: {
    enabled: boolean;
    damage?: number;
    defenceUp?: number;
    kill?: boolean;
    velocity?: {
      x?: number;
      y?: number;
    };
    recover?: boolean;
    recoverTime?: number;
    downRecover?: boolean;
    downRecoverTime?: number;
    envShake?: {
      time: number;
      freq: number;
      ampl: number;
      phase: number;
    };
  };
  hitbox: CollisionBox;
};

export type DemoFighterDefinition = {
  id: string;
  source?: "demo" | "imported";
  displayName: string;
  authorName?: string;
  palette: string;
  spriteGroupBase: number;
  speed: number;
  jumpVelocity: number;
  walkAction: number;
  idleAction: number;
  crouchAction: number;
  jumpAction: number;
  hitstunAction: number;
  moves: {
    punch: DemoMove;
    kick: DemoMove;
  };
  stateMoves?: Map<number, DemoMove>;
  states?: MugenStateDef[];
  stateEntryControllers?: MugenStateController[];
  constants?: Record<string, number>;
  commands?: MugenCommand[];
  runtimeProgram?: RuntimeProgramIr;
  animations: Map<number, MugenAnimationAction>;
  fightFxPrefix?: string;
  hitSparkLibraries?: Partial<Record<HitSparkLibrarySource, HitSparkLibrary>>;
};

export const demoFighters: DemoFighterDefinition[] = [
  createFighter({
    id: "nova-boxer",
    displayName: "Nova Boxer",
    palette: "#4458d8",
    spriteGroupBase: 10000,
    speed: 1.08,
    jumpVelocity: -9.5,
    punchDamage: 55,
    kickDamage: 72,
  }),
  createFighter({
    id: "mira-volt",
    displayName: "Mira Volt",
    palette: "#b13f7a",
    spriteGroupBase: 11000,
    speed: 1.14,
    jumpVelocity: -10.2,
    punchDamage: 48,
    kickDamage: 84,
  }),
  createFighter({
    id: "rook-apprentice",
    displayName: "Rook Apprentice",
    palette: "#0f8f85",
    spriteGroupBase: 14000,
    speed: 1.08,
    jumpVelocity: -9.6,
    punchDamage: 42,
    kickDamage: 58,
  }),
];

type FighterOptions = {
  id: string;
  displayName: string;
  palette: string;
  spriteGroupBase: number;
  speed: number;
  jumpVelocity: number;
  punchDamage: number;
  kickDamage: number;
};

function createFighter(options: FighterOptions): DemoFighterDefinition {
  const idleAction = 0;
  const crouchAction = 10;
  const walkAction = 20;
  const jumpAction = 40;
  const punchAction = 200;
  const kickAction = 210;
  const hitstunAction = 500;
  const animations = new Map<number, MugenAnimationAction>([
    [idleAction, action(options.spriteGroupBase, idleAction, [7, 7, 7, 7], { loopStart: 0 })],
    [crouchAction, action(options.spriteGroupBase, crouchAction, [5, 7, 7], { height: 78, loopStart: 2 })],
    [walkAction, action(options.spriteGroupBase, walkAction, [10, 10, 10, 10, 10, 10, 10, 10], { loopStart: 0, step: 1 })],
    [jumpAction, action(options.spriteGroupBase, jumpAction, [6, 7, 8, 8], { airborne: true })],
    [7000, sparkAction(7000, [3, 3, 4])],
    [7001, sparkAction(7001, [3, 3, 4])],
    [7002, sparkAction(7002, [3, 3, 4])],
    [
      punchAction,
      action(options.spriteGroupBase, punchAction, [4, 4, 5, 7], {
        clsn1Frame: 2,
        hitbox: { x1: 18, y1: -72, x2: 86, y2: -42 },
      }),
    ],
    [
      kickAction,
      action(options.spriteGroupBase, kickAction, [5, 5, 5, 8, 8], {
        clsn1Frame: 2,
        hitbox: { x1: 12, y1: -54, x2: 96, y2: -18 },
      }),
    ],
    [hitstunAction, action(options.spriteGroupBase, hitstunAction, [6, 6, 6], { height: 92 })],
  ]);

  return {
    id: options.id,
    source: "demo",
    displayName: options.displayName,
    authorName: "mugen-web-sandbox",
    palette: options.palette,
    spriteGroupBase: options.spriteGroupBase,
    speed: options.speed,
    jumpVelocity: options.jumpVelocity,
    idleAction,
    walkAction,
    crouchAction,
    jumpAction,
    hitstunAction,
    moves: {
      punch: {
        actionId: punchAction,
        startup: 5,
        activeStart: 7,
        activeEnd: 11,
        recovery: 14,
        damage: options.punchDamage,
        hitPause: 7,
        hitStun: 22,
        push: 20,
        hitSpark: "S7001",
        guardSpark: "S7000",
        sparkXy: [42, -58],
        hitbox: { x1: 18, y1: -72, x2: 86, y2: -42 },
      },
      kick: {
        actionId: kickAction,
        startup: 7,
        activeStart: 10,
        activeEnd: 15,
        recovery: 18,
        damage: options.kickDamage,
        hitPause: 9,
        hitStun: 28,
        push: 30,
        hitSpark: "S7002",
        guardSpark: "S7000",
        sparkXy: [48, -44],
        hitbox: { x1: 12, y1: -54, x2: 96, y2: -18 },
      },
    },
    animations,
  };
}

function sparkAction(id: number, durations: number[]): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: durations.map((duration, index) => ({
      spriteGroup: id,
      spriteIndex: index,
      offsetX: 0,
      offsetY: 0,
      duration,
      clsn1: [],
      clsn2: [],
      raw: `${id},${index},0,0,${duration}`,
      line: index + 1,
    })),
  };
}

function action(
  groupBase: number,
  id: number,
  durations: number[],
  options: {
    height?: number;
    loopStart?: number;
    step?: number;
    airborne?: boolean;
    clsn1Frame?: number;
    hitbox?: CollisionBox;
  } = {},
): MugenAnimationAction {
  const height = options.height ?? 102;
  return {
    id,
    loopStart: options.loopStart,
    rawLines: [`[Begin Action ${id}]`],
    frames: durations.map((duration, index) => ({
      spriteGroup: groupBase + id,
      spriteIndex: index,
      offsetX: options.step ? (index % 2 === 0 ? -options.step : options.step) : 0,
      offsetY: options.airborne ? -4 : 0,
      duration,
      clsn1: index === options.clsn1Frame && options.hitbox ? [options.hitbox] : [],
      clsn2: [{ x1: -24, y1: -height, x2: 24, y2: 0 }],
      raw: `${groupBase + id},${index},0,0,${duration}`,
      line: index + 1,
    })),
  };
}

export function mergeDemoAnimations(): Map<number, MugenAnimationAction> {
  const result = new Map<number, MugenAnimationAction>();
  for (const fighter of demoFighters) {
    for (const [id, animation] of fighter.animations) {
      if (!result.has(id)) {
        result.set(id, animation);
      }
    }
  }
  return result;
}
