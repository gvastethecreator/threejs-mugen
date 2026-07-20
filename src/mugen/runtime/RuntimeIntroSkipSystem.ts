import type { FighterMatchState } from "./RuntimeFighterStateSystem";
import type { RuntimeAssertSpecial } from "./types";

export type RuntimeIntroSkipActorStart = {
  x: number;
  y: number;
  z?: number;
  facing: 1 | -1;
};

/**
 * Clears the transient actor state that Ikemen resets when the intro shutter
 * reaches its signal edge. Round resources, variables, team state, and
 * compatibility history intentionally remain owned by the caller.
 */
export function resetRuntimeIntroSkipActor(
  actor: FighterMatchState,
  start: RuntimeIntroSkipActorStart,
): void {
  const runtime = actor.runtime;
  runtime.pos = { x: start.x, y: start.y };
  runtime.vel = { x: 0, y: 0 };
  if (runtime.combatDepth) {
    runtime.combatDepth = {
      ...runtime.combatDepth,
      ...(start.z === undefined ? {} : { position: start.z }),
      velocity: 0,
    };
  }
  runtime.facing = start.facing;
  runtime.bodyWidthDelta = undefined;
  runtime.bodyHeightDelta = undefined;
  runtime.clsnOverrides = undefined;
  runtime.clsnScaleMultiplier = undefined;
  runtime.posFreeze = undefined;
  runtime.screenBound = undefined;
  runtime.stageBound = undefined;
  runtime.hitVelocity = undefined;
  runtime.receivedHitSequence = undefined;
  runtime.hitVars = undefined;
  runtime.hitFall = undefined;
  runtime.targetCount = 0;
  runtime.targetRefs = undefined;
  runtime.targetBindings = undefined;
  runtime.bindToTarget = undefined;
  runtime.hitBy = undefined;
  runtime.hitOverrides = undefined;
  runtime.reversal = undefined;
  runtime.superPauseDefenseMultiplier = undefined;
  runtime.fallDefenseMultiplier = undefined;
  runtime.dizzyPointsAttackMultiplier = undefined;
  runtime.paletteRemap = undefined;
  runtime.paletteFx = undefined;
  runtime.afterImage = undefined;
  runtime.renderOpacity = undefined;
  runtime.renderScale = undefined;
  runtime.angle = undefined;
  runtime.renderAngle = undefined;
  runtime.animationSource = "self";
  runtime.customState = undefined;
  runtime.assertSpecial = preserveRuntimeIntroSkipAssertSpecial(runtime.assertSpecial);
  runtime.inGuardDist = undefined;
  runtime.stateNo = 0;
  runtime.animNo = actor.definition.idleAction;
  runtime.animTime = 0;
  runtime.frameIndex = 0;
  runtime.ctrl = true;
  runtime.guardStun = 0;
  runtime.guardSlideTime = 0;
  runtime.guardControlTime = 0;
  runtime.guarding = false;
  runtime.stateType = "S";
  runtime.moveType = "I";
  runtime.physics = "S";

  actor.currentAction = actor.definition.animations.get(actor.definition.idleAction)!;
  actor.stateOwner = undefined;
  actor.frameElapsed = 0;
  actor.animationComplete = false;
  actor.stateElapsed = -1;
  actor.currentMove = undefined;
  actor.currentMoveLabel = undefined;
  actor.moveTick = 0;
  actor.hitStun = 0;
  actor.hitPause = 0;
  actor.hasHit = false;
  actor.hitDefTargets = [];
  actor.pendingHitDefTargets = [];
  actor.targets = [];
  actor.targetBindings = [];
  actor.bindToTarget = undefined;
  actor.currentInput.clear();
  actor.aiCooldown = 0;
  actor.firedHitDefs.clear();
  actor.soundEvents = [];
  actor.envShakeEvents = [];
  actor.hitEffectEvents = [];
  actor.contact = actor.contactWorld.create();
  actor.commandBuffer.clear();
}

export function preserveRuntimeIntroSkipAssertSpecial(
  assertSpecial: RuntimeAssertSpecial | undefined,
): RuntimeAssertSpecial | undefined {
  if (!assertSpecial) {
    return undefined;
  }

  const flags = assertSpecial.flags.filter((flag) => isIntroSkipDisplayFlag(flag));
  const globalFlags = assertSpecial.globalFlags.filter((flag) => isIntroSkipDisplayFlag(flag));
  const skipRoundDisplay = assertSpecial.skipRoundDisplay === true || globalFlags.includes("skiprounddisplay");
  const skipFightDisplay = assertSpecial.skipFightDisplay === true || globalFlags.includes("skipfightdisplay");
  if (!skipRoundDisplay && !skipFightDisplay && flags.length === 0 && globalFlags.length === 0) {
    return undefined;
  }

  return {
    flags,
    globalFlags,
    ...(skipRoundDisplay ? { skipRoundDisplay: true } : {}),
    ...(skipFightDisplay ? { skipFightDisplay: true } : {}),
  };
}

function isIntroSkipDisplayFlag(flag: string): boolean {
  const normalized = flag.trim().replace(/^"|"$/g, "").replace(/[^A-Za-z0-9_]/g, "").toLowerCase();
  return normalized === "skiprounddisplay" || normalized === "skipfightdisplay";
}
