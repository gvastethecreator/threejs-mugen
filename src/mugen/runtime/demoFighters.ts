import type { CollisionBox } from "../model/CollisionBox";
import type { MugenCollisionBoxType } from "../model/CollisionBox";
import type { RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenCommand } from "../model/MugenCommand";
import type { MugenStateController, MugenStateDef, MugenStateSourceSelection } from "../model/MugenState";
import type { MugenFightScreenAssets, MugenFightScreenTiming } from "../model/MugenSystemAssets";
import type { RuntimeContactEnvShake, RuntimeGetHitVars, RuntimeHitVelocityMetadata, RuntimePaletteFxPayload, RuntimeResolvedSoundRef } from "./types";
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
  /** Second HitDef givepower value exposed by GetHitVar(guardpower). */
  guardPower?: number;
  /** First HitDef givepower value exposed by GetHitVar(hitpower). */
  hitPower?: number;
  /** Authored HitDef score exposed by GetHitVar(score). */
  score?: number;
  /** Attacker power gain on an accepted unguarded direct hit. */
  attackerHitPower?: number;
  /** Attacker power gain on guard; one-value getpower derives this from attackerHitPower. */
  attackerGuardPower?: number;
  kill?: boolean;
  /** Ikemen GetHitVar(keepstate) source flag for direct HitDef contacts. */
  keepState?: boolean;
  hitOnce?: boolean;
  airJuggle?: number;
  /** Up to eight HitDef ids blocked by direct NoChainID admission. */
  noChainIds?: number[];
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
  /** HitDef values: attacker-side component 0 and receiver-side component 1. */
  unhittableTime?: [number, number];
  /** Resolved nonnegative direct HitDef ID. */
  targetId?: number;
  requiresHitDef?: boolean;
  isReversal?: boolean;
  reversalAttr?: string;
  reversalGuardFlag?: string;
  reversalGuardFlagNot?: string;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  /** Direct-hit attacker facing override. Zero leaves the attacker unchanged. */
  p1Facing?: number;
  /** Direct-hit attacker facing derived from P2; nonzero values take precedence over p1Facing. */
  p1GetP2Facing?: number;
  /** Force a crouching defender into standing get-hit states. */
  forceStand?: boolean;
  /** Force a standing defender into crouching get-hit states. */
  forceCrouch?: boolean;
  /** Clear the receiver fall flag for this direct hit. */
  forceNoFall?: boolean;
  /** Resolved defender-facing override; zero leaves the defender unchanged. */
  p2Facing?: number;
  missOnOverride?: boolean;
  ignoreReversalDef?: boolean;
  defaultTargetStateNo?: number;
  /** Attacker-side component of HitDef pausetime. */
  hitPause: number;
  /** Defender-side component of HitDef pausetime. */
  hitShakeTime?: number;
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
  /** Last HitDef velocity vectors for Ikemen GetHitVar readback aliases. */
  hitVelocities?: RuntimeHitVelocityMetadata;
  /** Bounded Ikemen-GO KO velocity delta metadata, separate from hit velocity. */
  koVelocityAdd?: { x?: number; y?: number };
  hitVars?: RuntimeGetHitVars;
  guardDistance?: number;
  guardFlag?: string;
  guardDamage?: number;
  guardKill?: boolean;
  /** Attacker-side component of guard.pausetime. */
  guardPause?: number;
  /** Defender-side component of guard.pausetime. */
  guardShakeTime?: number;
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
  /** Independent X/Y draw scales for normal and guarded hit sparks. */
  hitSparkScale?: [number, number];
  guardSparkScale?: [number, number];
  /** PalFX copied to the receiver by an accepted, unguarded contact. */
  paletteFx?: RuntimePaletteFxPayload;
  /** Camera shake emitted by an accepted, unguarded direct contact. */
  envShake?: RuntimeContactEnvShake;
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
      /** Ikemen-GO fall.envshake.mul; omitted uses the engine default of 1. */
      mul?: number;
      /** Ikemen-GO fall.envshake.dir in degrees. */
      dir?: number;
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
    id: "rocco-vidal",
    displayName: "Rocco Vidal",
    palette: "#34383b",
    spriteGroupBase: 15000,
    speed: 1.02,
    jumpVelocity: -9.6,
    punchDamage: 56,
    kickDamage: 82,
  }),
  createFighter({
    id: "nadia-arce",
    displayName: "Nadia Arce",
    palette: "#d8d1c2",
    spriteGroupBase: 16000,
    speed: 1.1,
    jumpVelocity: -10.1,
    punchDamage: 52,
    kickDamage: 78,
  }),
];

/** The reset roster intentionally has no secondary public content pack. */
export const contentPackFighters: DemoFighterDefinition[] = [];

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
  const walkBackAction = 21;
  const guardAction = 120;
  const winAction = 180;
  const punchAction = 200;
  const kickAction = 210;
  const specialAction = 220;
  const hitstunAction = 500;
  const knockdownAction = 510;
  const koAction = 515;
  const throwAction = 800;
  const animations = new Map<number, MugenAnimationAction>([
    [idleAction, action(options.spriteGroupBase, idleAction, [10, 10, 10, 10], { loopStart: 0 })],
    [crouchAction, action(options.spriteGroupBase, crouchAction, [8, 8, 8, 8], { height: 78 })],
    [walkAction, action(options.spriteGroupBase, walkAction, [6, 6, 6, 6, 6, 6, 6, 6], { loopStart: 0, step: 1 })],
    [walkBackAction, action(options.spriteGroupBase, walkBackAction, [6, 6, 6, 6, 6, 6, 6, 6], { loopStart: 0, step: -1 })],
    [jumpAction, action(options.spriteGroupBase, jumpAction, [6, 6, 6, 6, 6, 6], { airborne: true })],
    [guardAction, action(options.spriteGroupBase, guardAction, [8, 8, 8, 8], { loopStart: 0 })],
    [winAction, action(options.spriteGroupBase, winAction, [8, 8, 8, 8, 8])],
    [7000, sparkAction(7000, [3, 3, 4])],
    [7001, sparkAction(7001, [3, 3, 4])],
    [7002, sparkAction(7002, [3, 3, 4])],
    [
      punchAction,
      action(options.spriteGroupBase, punchAction, [5, 5, 5, 5], {
        clsn1Frame: 2,
        hitbox: { x1: 18, y1: -72, x2: 86, y2: -42 },
      }),
    ],
    [
      kickAction,
      action(options.spriteGroupBase, kickAction, [6, 6, 6, 6, 6, 6], {
        clsn1Frame: 3,
        hitbox: { x1: 12, y1: -54, x2: 96, y2: -18 },
      }),
    ],
    [specialAction, action(options.spriteGroupBase, specialAction, [5, 5, 5, 5, 5, 5, 5, 5])],
    [throwAction, action(options.spriteGroupBase, throwAction, [6, 6, 6, 6, 6, 6])],
    [hitstunAction, action(options.spriteGroupBase, hitstunAction, [6, 6, 6, 6], { height: 92 })],
    [knockdownAction, action(options.spriteGroupBase, knockdownAction, [6, 6, 6, 6, 6, 6], { height: 72 })],
    [koAction, action(options.spriteGroupBase, koAction, [8, 8, 8, 8, 8, 8], { height: 62 })],
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
