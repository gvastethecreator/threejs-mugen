import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { MugenCharacter } from "../model/MugenCharacter";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";

type FrameWindow = {
  index: number;
  start: number;
  end: number;
  frame: MugenAnimationFrame;
};

export function createImportedFighterDefinition(character: MugenCharacter): DemoFighterDefinition | undefined {
  if (character.animations.size === 0 || !character.spriteArchive || character.spriteArchive.sprites.length === 0) {
    return undefined;
  }

  const animations = normalizeAnimations(character.animations);
  const idleAction = pickAction(animations, [0]) ?? firstActionId(animations);
  if (idleAction === undefined) {
    return undefined;
  }

  const walkAction = pickAction(animations, [20, 21]) ?? idleAction;
  const crouchAction = pickAction(animations, [11, 10]) ?? idleAction;
  const jumpAction = pickAction(animations, [41, 40, 42, 50]) ?? idleAction;
  const hitstunAction = pickAction(animations, [5000, 5010, 5020, 500]) ?? idleAction;
  const punchAction = pickAttackAction(animations, [200, 201, 205, 210, 215]) ?? idleAction;
  const kickAction =
    pickAttackAction(animations, [230, 235, 240, 245, 250, 400, 410], punchAction) ??
    pickAttackAction(animations, [210, 215, 220], punchAction) ??
    punchAction;

  const displayName =
    character.definition.info.displayName ?? character.definition.info.name ?? character.compatibility.character ?? "Imported Fighter";
  const stateMoves = buildStateMoves(character.states, animations);

  return {
    id: `imported-${slugify(displayName)}`,
    source: "imported",
    displayName,
    palette: "#d8dde7",
    spriteGroupBase: 0,
    speed: 3.2,
    jumpVelocity: -9.8,
    idleAction,
    walkAction,
    crouchAction,
    jumpAction,
    hitstunAction,
    moves: {
      punch:
        stateMoves.get(punchAction) ??
        buildMove(animations.get(punchAction), punchAction, 45, { x1: 14, y1: -72, x2: 78, y2: -38 }),
      kick:
        stateMoves.get(kickAction) ??
        buildMove(animations.get(kickAction), kickAction, 62, { x1: 12, y1: -58, x2: 98, y2: -18 }),
    },
    stateMoves,
    states: character.states,
    stateEntryControllers: character.stateEntryControllers,
    constants: character.constants,
    commands: character.commands,
    runtimeProgram: character.runtimeProgram,
    animations,
  };
}

function buildStateMoves(states: MugenCharacter["states"], animations: Map<number, MugenAnimationAction>): Map<number, DemoMove> {
  const result = new Map<number, DemoMove>();
  for (const state of states) {
    const hitDef = state.controllers.find((controller) => controller.type.toLowerCase() === "hitdef");
    if (!hitDef) {
      continue;
    }
    const actionId = state.anim ?? state.id;
    const fallbackHitbox = { x1: 14, y1: -72, x2: 78, y2: -38 };
    result.set(
      state.id,
      buildMove(animations.get(actionId), state.id, numberParam(hitDef.params.damage, 45), fallbackHitbox, {
        attr: hitDef.params.attr,
        kill: boolParam(hitDef.params.kill),
        targetId: firstNumber(hitDef.params.id) ?? undefined,
        hitPause: firstNumber(hitDef.params.pausetime) ?? undefined,
        hitStun: firstNumber(hitDef.params["ground.hittime"]) ?? undefined,
        push: Math.abs(numberPair(hitDef.params["ground.velocity"])?.[0] ?? 20),
        hitVelocityY: numberPair(hitDef.params["ground.velocity"])?.[1] ?? undefined,
        guardDistance: firstNumber(hitDef.params["guard.dist"]) ?? undefined,
        guardFlag: hitDef.params.guardflag,
        guardDamage: secondNumber(hitDef.params.damage) ?? undefined,
        guardKill: boolParam(hitDef.params["guard.kill"]),
        guardPause: firstNumber(hitDef.params["guard.pausetime"]) ?? undefined,
        guardStun: firstNumber(hitDef.params["guard.hittime"]) ?? undefined,
        guardSlideTime: firstNumber(hitDef.params["guard.slidetime"]) ?? undefined,
        guardControlTime: firstNumber(hitDef.params["guard.ctrltime"]) ?? undefined,
        guardPush: Math.abs(numberPair(hitDef.params["guard.velocity"])?.[0] ?? 0) || undefined,
        guardVelocityY: numberPair(hitDef.params["guard.velocity"])?.[1] ?? undefined,
        hitSound: stripMugenString(hitDef.params.hitsound),
        guardSound: stripMugenString(hitDef.params.guardsound),
        hitVars: buildHitVars(hitDef.params),
        fall: buildFallData(hitDef.params),
        requiresHitDef: true,
      }),
    );
  }
  return result;
}

function normalizeAnimations(source: Map<number, MugenAnimationAction>): Map<number, MugenAnimationAction> {
  return new Map(
    [...source.entries()].map(([id, action]) => [
      id,
      {
        ...action,
        frames: action.frames.map((frame) => ({
          ...frame,
          duration: normalizeDuration(frame.duration),
          clsn1: frame.clsn1.map((box) => ({ ...box })),
          clsn2: frame.clsn2.map((box) => ({ ...box })),
        })),
      },
    ]),
  );
}

function pickAction(actions: Map<number, MugenAnimationAction>, preferred: number[]): number | undefined {
  return preferred.find((id) => actions.has(id));
}

function firstActionId(actions: Map<number, MugenAnimationAction>): number | undefined {
  return [...actions.keys()].sort((a, b) => a - b)[0];
}

function pickAttackAction(
  actions: Map<number, MugenAnimationAction>,
  preferred: number[],
  exclude?: number,
): number | undefined {
  const preferredHit = preferred.find((id) => id !== exclude && hasHitbox(actions.get(id)));
  if (preferredHit !== undefined) {
    return preferredHit;
  }
  const firstHit = [...actions.values()]
    .filter((action) => action.id !== exclude && action.id >= 200)
    .sort((a, b) => a.id - b.id)
    .find((action) => hasHitbox(action));
  return firstHit?.id ?? preferred.find((id) => id !== exclude && actions.has(id));
}

function hasHitbox(action: MugenAnimationAction | undefined): boolean {
  return action?.frames.some((frame) => frame.clsn1.length > 0) ?? false;
}

function buildMove(
  action: MugenAnimationAction | undefined,
  actionId: number,
  damage: number,
  fallbackHitbox: CollisionBox,
  overrides: Partial<
    Pick<
      DemoMove,
      | "attr"
      | "kill"
      | "targetId"
      | "requiresHitDef"
      | "hitPause"
      | "hitStun"
      | "push"
      | "hitVelocityY"
      | "guardDistance"
      | "guardFlag"
      | "guardDamage"
      | "guardKill"
      | "guardPause"
      | "guardStun"
      | "guardSlideTime"
      | "guardControlTime"
      | "guardPush"
      | "guardVelocityY"
      | "hitSound"
      | "guardSound"
      | "hitVars"
      | "fall"
    >
  > = {},
): DemoMove {
  const windows = action ? frameWindows(action) : [];
  const active = windows.filter((window) => window.frame.clsn1.length > 0);
  const activeWindow = active[0];
  const lastActiveWindow = active.at(-1);
  const total = Math.max(16, windows.at(-1)?.end ?? 16);
  const activeStart = activeWindow?.start ?? Math.min(8, total);
  const activeEnd = lastActiveWindow?.end ?? Math.min(activeStart + 4, total);
  const startup = Math.max(1, activeStart - 1);
  const recovery = Math.max(8, total - startup);

  return {
    actionId,
    startup,
    activeStart,
    activeEnd,
    recovery,
    damage,
    attr: overrides.attr,
    kill: overrides.kill,
    targetId: overrides.targetId,
    requiresHitDef: overrides.requiresHitDef,
    hitPause: overrides.hitPause ?? (damage >= 60 ? 9 : 7),
    hitStun: overrides.hitStun ?? (damage >= 60 ? 28 : 22),
    push: overrides.push ?? (damage >= 60 ? 30 : 20),
    hitVelocityY: overrides.hitVelocityY,
    guardDistance: overrides.guardDistance,
    guardFlag: overrides.guardFlag,
    guardDamage: overrides.guardDamage,
    guardKill: overrides.guardKill,
    guardPause: overrides.guardPause,
    guardStun: overrides.guardStun,
    guardSlideTime: overrides.guardSlideTime,
    guardControlTime: overrides.guardControlTime,
    guardPush: overrides.guardPush,
    guardVelocityY: overrides.guardVelocityY,
    hitSound: overrides.hitSound,
    guardSound: overrides.guardSound,
    hitVars: overrides.hitVars,
    fall: overrides.fall,
    hitbox: cloneBox(activeWindow?.frame.clsn1[0] ?? fallbackHitbox),
  };
}

function buildHitVars(params: Record<string, string>): DemoMove["hitVars"] | undefined {
  const animType = hitAnimType(params.animtype);
  const fallAnimType = hitAnimType(params["fall.animtype"]);
  const groundType = hitType(params["ground.type"] ?? params.type);
  const airType = hitType(params["air.type"]);
  if (animType === undefined && fallAnimType === undefined && groundType === undefined && airType === undefined) {
    return undefined;
  }
  const hitVars: NonNullable<DemoMove["hitVars"]> = {};
  const resolvedAnimType = fallAnimType ?? animType;
  if (resolvedAnimType !== undefined) {
    hitVars.animType = resolvedAnimType;
  }
  if (groundType !== undefined) {
    hitVars.groundType = groundType;
  }
  if (airType !== undefined) {
    hitVars.airType = airType;
  }
  return hitVars;
}

function buildFallData(params: Record<string, string>): DemoMove["fall"] | undefined {
  const enabled = firstNumber(params.fall) ?? firstNumber(params["air.fall"]) ?? firstNumber(params["ground.fall"]);
  const damage = firstNumber(params["fall.damage"]);
  const defenceUp = firstNumber(params["fall.defence_up"]);
  const kill = boolParam(params["fall.kill"]);
  const xVelocity = firstNumber(params["fall.xvelocity"]);
  const yVelocity = firstNumber(params["fall.yvelocity"]);
  const recover = firstNumber(params["fall.recover"]);
  const recoverTime = firstNumber(params["fall.recovertime"]);
  const downRecover = firstNumber(params["down.recover"]);
  const downRecoverTime = firstNumber(params["down.recovertime"]);
  const envShakeTime = firstNumber(params["fall.envshake.time"]);
  const envShakeFreq = firstNumber(params["fall.envshake.freq"]);
  const envShakeAmpl = firstNumber(params["fall.envshake.ampl"]);
  const envShakePhase = firstNumber(params["fall.envshake.phase"]);
  const hasAny =
    enabled !== undefined ||
    damage !== undefined ||
    defenceUp !== undefined ||
    kill !== undefined ||
    xVelocity !== undefined ||
    yVelocity !== undefined ||
    recover !== undefined ||
    recoverTime !== undefined ||
    downRecover !== undefined ||
    downRecoverTime !== undefined ||
    envShakeTime !== undefined;
  if (!hasAny) {
    return undefined;
  }
  return {
    enabled: enabled !== undefined ? enabled !== 0 : false,
    damage,
    defenceUp,
    kill,
    velocity: xVelocity !== undefined || yVelocity !== undefined ? { x: xVelocity, y: yVelocity } : undefined,
    recover: recover !== undefined ? recover !== 0 : undefined,
    recoverTime,
    downRecover: downRecover !== undefined ? downRecover !== 0 : undefined,
    downRecoverTime,
    envShake:
      envShakeTime !== undefined
        ? {
            time: envShakeTime,
            freq: envShakeFreq ?? 60,
            ampl: envShakeAmpl ?? -4,
            phase: envShakePhase ?? 0,
          }
        : undefined,
  };
}

function boolParam(value: string | undefined): boolean | undefined {
  const numberValue = firstNumber(value);
  return numberValue === undefined ? undefined : numberValue !== 0;
}

function numberParam(value: string | undefined, fallback: number): number {
  return firstNumber(value) ?? fallback;
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function secondNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[1]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function hitAnimType(value: string | undefined): number | undefined {
  const numeric = firstNumber(value);
  if (numeric !== undefined) {
    return numeric;
  }
  const normalized = stripMugenString(value)?.replace(/[\s_-]+/g, "").toLowerCase();
  if (!normalized) {
    return undefined;
  }
  const values: Record<string, number> = {
    light: 0,
    medium: 1,
    med: 1,
    hard: 2,
    heavy: 2,
    back: 3,
    up: 4,
    diagup: 5,
    diagonalup: 5,
  };
  return values[normalized];
}

function hitType(value: string | undefined): number | undefined {
  const numeric = firstNumber(value);
  if (numeric !== undefined) {
    return numeric;
  }
  const normalized = stripMugenString(value)?.replace(/[\s_-]+/g, "").toLowerCase();
  if (!normalized) {
    return undefined;
  }
  const values: Record<string, number> = {
    high: 1,
    low: 2,
    trip: 3,
  };
  return values[normalized];
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((numberValue) => Number.isFinite(numberValue));
  if (numbers.length === 0 || numbers[0] === undefined) {
    return undefined;
  }
  return [numbers[0], numbers[1] ?? 0];
}

function frameWindows(action: MugenAnimationAction): FrameWindow[] {
  let cursor = 1;
  return action.frames.map((frame, index) => {
    const duration = normalizeDuration(frame.duration);
    const start = cursor;
    const end = cursor + duration - 1;
    cursor = end + 1;
    return { index, start, end, frame };
  });
}

function normalizeDuration(duration: number): number {
  if (!Number.isFinite(duration) || duration < 0) {
    return 6;
  }
  return Math.max(1, Math.min(60, Math.round(duration)));
}

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "fighter";
}
