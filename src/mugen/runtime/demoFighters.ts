import type { CollisionBox } from "../model/CollisionBox";
import type { MugenCollisionBoxType } from "../model/CollisionBox";
import type { RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenCommand } from "../model/MugenCommand";
import type { MugenStateController, MugenStateDef, MugenStateSourceSelection } from "../model/MugenState";
import type { MugenFightScreenAssets, MugenFightScreenTiming } from "../model/MugenSystemAssets";
import type { RuntimeGetHitVars, RuntimeResolvedSoundRef } from "./types";
import type { RuntimeHitDefPriorityProfile } from "./HitDefPriorityPolicy";
import type { MugenAffectTeam, MugenTeamSide } from "../model/MugenTeam";
import type { RuntimeSocdResolution } from "./RuntimeInput";

export type HitSparkLibrarySource = "common" | "fightfx";
export type RuntimeHitDefPriorityType = "hit" | "miss" | "dodge";

export type HitSparkLibrary = {
  source: HitSparkLibrarySource;
  /** Ikemen CommonFX `fx.scale`, when authored and different from the default. */
  scale?: number;
  /** Ikemen CommonFX authored coordinate space used to derive the draw scale. */
  localCoord?: [number, number];
  animations: Map<number, MugenAnimationAction>;
};

/**
 * The authored satirical FightFX atlas uses a dedicated group range so it can
 * coexist with the native 7000-series sparks and with imported character SFFs.
 * Keeping the IDs in one place makes the runtime animation rows and the
 * browser atlas route independently verifiable.
 */
export const SATIRICAL_FIGHTFX_ACTIONS = {
  hit: 7300,
  kick: 7301,
  electric: 7302,
  receipt: 7303,
  dust: 7304,
  cardboard: 7305,
  guard: 7306,
  ko: 7307,
} as const;

export type DemoMove = {
  actionId: number;
  startup: number;
  activeStart: number;
  activeEnd: number;
  recovery: number;
  damage: number;
  guardPoints?: number;
  dizzyPoints?: number;
  redLife?: number;
  guardRedLife?: number;
  kill?: boolean;
  hitOnce?: boolean;
  airJuggle?: number;
  attr?: string;
  hitFlag?: string;
  affectTeam?: MugenAffectTeam;
  teamSide?: MugenTeamSide;
  p2ClsnCheck?: MugenCollisionBoxType;
  p2ClsnRequire?: MugenCollisionBoxType;
  priority?: number;
  priorityType?: RuntimeHitDefPriorityType;
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  attackDepth?: [number, number];
  targetId?: number;
  requiresHitDef?: boolean;
  isReversal?: boolean;
  reversalAttr?: string;
  reversalGuardFlag?: string;
  reversalGuardFlagNot?: string;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  p2Facing?: number;
  missOnOverride?: boolean;
  ignoreReversalDef?: boolean;
  defaultTargetStateNo?: number;
  hitPause: number;
  hitStun: number;
  airHitTime?: number;
  /** M.U.G.E.N down.hittime for a lying defender. */
  downHitTime?: number;
  /** Effective down.velocity Y; omitted values inherit air.velocity Y. */
  downVelocityY?: number;
  /** Effective down.velocity X; omitted authored values inherit air.velocity X. */
  downVelocityX?: number;
  /** Effective down.velocity Z; omitted authored values inherit air.velocity Z. */
  downVelocityZ?: number;
  /** M.U.G.E.N down.bounce; omitted preserves the existing Common1 fallback. */
  downBounce?: boolean;
  push: number;
  hitVelocityY?: number;
  /** Ground HitDef velocity Z. */
  hitVelocityZ?: number;
  /** Air HitDef velocity Z, selected for airborne defenders. */
  airVelocityZ?: number;
  hitVars?: RuntimeGetHitVars;
  guardDistance?: number;
  guardFlag?: string;
  guardDamage?: number;
  guardKill?: boolean;
  guardPause?: number;
  guardStun?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
  guardPush?: number;
  guardVelocityY?: number;
  guardVelocityZ?: number;
  airGuardPush?: number;
  airGuardVelocityY?: number;
  airGuardVelocityZ?: number;
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
    /** M.U.G.E.N air.fall; applies only when the defender is already airborne. */
    airFall?: boolean;
    damage?: number;
    defenceUp?: number;
    kill?: boolean;
    velocity?: {
      x?: number;
      y?: number;
      /** Ikemen-GO fall.zvelocity depth component. */
      z?: number;
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
  hitDefPriorityProfile?: RuntimeHitDefPriorityProfile;
  socdResolution?: RuntimeSocdResolution;
  fightScreenTiming?: MugenFightScreenTiming;
  fightScreenAssets?: MugenFightScreenAssets;
  displayName: string;
  authorName?: string;
  ikemenVersion?: string;
  localCoord?: [number, number];
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
  stateSources?: MugenStateSourceSelection[];
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

/** User-directed content entries stay outside the three-fighter baseline; eight classic entries now bind generated runtime atlases. */
export const contentPackFighters: DemoFighterDefinition[] = [
  createContentFighter({ id: "don-rayo", displayName: "Don Rayo", palette: "#ff6b24", spriteGroupBase: 15000, speed: 1.12, jumpVelocity: -9.8, punchDamage: 51, kickDamage: 68 }),
  createContentFighter({ id: "la-jefa-del-combo", displayName: "La Jefa del Combo", palette: "#d83d62", spriteGroupBase: 16000, speed: 1.08, jumpVelocity: -10, punchDamage: 54, kickDamage: 75 }),
  createContentFighter({ id: "turbo-abuela", displayName: "Turbo Abuela", palette: "#d88b2f", spriteGroupBase: 17000, speed: 1.22, jumpVelocity: -9.2, punchDamage: 46, kickDamage: 62 }),
  createContentFighter({ id: "tanque-de-carton", displayName: "Tanque de Cartón", palette: "#a77c52", spriteGroupBase: 18000, speed: 0.92, jumpVelocity: -8.7, punchDamage: 66, kickDamage: 86 }),
  createContentFighter({ id: "monje-wifi", displayName: "Monje Wi-Fi", palette: "#3b82f6", spriteGroupBase: 19000, speed: 1.15, jumpVelocity: -10.4, punchDamage: 49, kickDamage: 70 }),
  createContentFighter({ id: "sombra-del-super", displayName: "Sombra del Súper", palette: "#5b3b8d", spriteGroupBase: 20000, speed: 1.18, jumpVelocity: -10.1, punchDamage: 50, kickDamage: 73 }),
  createContentFighter({ id: "mara-cinta", displayName: "Mara Cinta", palette: "#de3a63", spriteGroupBase: 21000, speed: 1.1, jumpVelocity: -9.9, punchDamage: 52, kickDamage: 71 }),
  createContentFighter({ id: "toro-pixel", displayName: "Toro Pixel", palette: "#b74435", spriteGroupBase: 22000, speed: 0.98, jumpVelocity: -8.9, punchDamage: 61, kickDamage: 82 }),
  createContentFighter({ id: "nico-guante", displayName: "Nico Guante", palette: "#2f9d9f", spriteGroupBase: 23000, speed: 1.16, jumpVelocity: -10.2, punchDamage: 56, kickDamage: 67 }),
  createContentFighter({ id: "luna-codo", displayName: "Luna Codo", palette: "#6f4dd8", spriteGroupBase: 24000, speed: 1.12, jumpVelocity: -10.3, punchDamage: 53, kickDamage: 76 }),
  createContentFighter({ id: "sargento-pila", displayName: "Sargento Pila", palette: "#879436", spriteGroupBase: 25000, speed: 1.03, jumpVelocity: -9.4, punchDamage: 58, kickDamage: 74 }),
  createContentFighter({ id: "bruno-giro", displayName: "Bruno Giro", palette: "#d27a32", spriteGroupBase: 26000, speed: 1.2, jumpVelocity: -10.1, punchDamage: 47, kickDamage: 69 }),
  createContentFighter({ id: "vera-patada", displayName: "Vera Patada", palette: "#bc4b8c", spriteGroupBase: 27000, speed: 1.14, jumpVelocity: -10.5, punchDamage: 49, kickDamage: 79 }),
  createContentFighter({ id: "rulo-viento", displayName: "Rulo Viento", palette: "#2796be", spriteGroupBase: 28000, speed: 1.19, jumpVelocity: -10, punchDamage: 50, kickDamage: 72 }),
];

function createContentFighter(options: FighterOptions): DemoFighterDefinition {
  return createFighter({ ...options, satiricalFightFx: true });
}

type FighterOptions = {
  id: string;
  displayName: string;
  palette: string;
  spriteGroupBase: number;
  speed: number;
  jumpVelocity: number;
  punchDamage: number;
  kickDamage: number;
  satiricalFightFx?: boolean;
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
  const fightFxAnimations = options.satiricalFightFx ? createSatiricalFightFxAnimations() : undefined;

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
        hitSpark: options.satiricalFightFx ? `F${SATIRICAL_FIGHTFX_ACTIONS.hit}` : "S7001",
        guardSpark: options.satiricalFightFx ? `F${SATIRICAL_FIGHTFX_ACTIONS.guard}` : "S7000",
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
        hitSpark: options.satiricalFightFx ? `F${SATIRICAL_FIGHTFX_ACTIONS.kick}` : "S7002",
        guardSpark: options.satiricalFightFx ? `F${SATIRICAL_FIGHTFX_ACTIONS.guard}` : "S7000",
        sparkXy: [48, -44],
        hitbox: { x1: 12, y1: -54, x2: 96, y2: -18 },
      },
    },
    animations,
    ...(fightFxAnimations
      ? {
          hitSparkLibraries: {
            fightfx: {
              source: "fightfx" as const,
              animations: fightFxAnimations,
            },
          },
        }
      : {}),
  };
}

function createSatiricalFightFxAnimations(): Map<number, MugenAnimationAction> {
  const durations = [2, 2, 3, 3, 4, 3, 2, 2];
  return new Map(
    Object.values(SATIRICAL_FIGHTFX_ACTIONS).map((actionId) => [actionId, sparkAction(actionId, durations)]),
  );
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
