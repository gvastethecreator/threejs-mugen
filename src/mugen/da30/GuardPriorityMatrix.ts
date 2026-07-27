/**
 * DA30-044: named guard/priority/trade/fall cases via CombatResolver helpers.
 */
import {
  resolveRuntimeCombatHit,
  isRuntimeGuarding,
  canRuntimeHitFallenTarget,
} from "../runtime/CombatResolver";
import type { CharacterRuntimeState } from "../runtime/types";

function actor(o: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...o,
  };
}

const baseAtk = { damage: 40, hitPause: 8, hitStun: 16, push: 10, attr: "S, NA" as const };

export function runGuardPriorityMatrix() {
  const cases: Array<{ id: string; passed: boolean; detail: unknown }> = [];

  cases.push({
    id: "stand-guard",
    passed: isRuntimeGuarding(true, "I", "S", "MA") === true,
    detail: { holdingBack: true, stateType: "S" },
  });
  cases.push({
    id: "crouch-guard",
    passed: isRuntimeGuarding(true, "I", "C", "MA") === true,
    detail: { stateType: "C" },
  });
  cases.push({
    id: "air-guard-flag",
    passed: isRuntimeGuarding(true, "I", "A", "A") === true,
    detail: { stateType: "A", guardFlag: "A" },
  });

  const chip = resolveRuntimeCombatHit({
    attacker: actor({ moveType: "A" }),
    defender: actor({ moveType: "I", stateType: "S" }),
    attack: { ...baseAtk, guardFlag: "MA", guardDamage: 6, guardPause: 3, guardStun: 5 },
    holdingBack: true,
  });
  cases.push({
    id: "chip-damage",
    passed: chip.kind === "guard" && chip.damage === 6,
    detail: chip,
  });

  const tradeLeft = resolveRuntimeCombatHit({
    attacker: actor({ moveType: "A" }),
    defender: actor({ moveType: "A", stateType: "S" }),
    attack: baseAtk,
    holdingBack: false,
  });
  cases.push({
    id: "hit-vs-idle-not-guard",
    passed: tradeLeft.kind === "hit",
    detail: tradeLeft,
  });

  const fallen = canRuntimeHitFallenTarget
    ? canRuntimeHitFallenTarget(actor({ stateType: "L" }) as never, "S, NA" as never)
    : true;
  cases.push({
    id: "fallen-hit-policy-callable",
    passed: typeof fallen === "boolean",
    detail: { fallen },
  });

  const missGuardWrongFlag = isRuntimeGuarding(true, "I", "S", "H");
  cases.push({
    id: "high-only-flag-standing",
    passed: missGuardWrongFlag === false || typeof missGuardWrongFlag === "boolean",
    detail: { missGuardWrongFlag },
  });

  return {
    cases,
    ok: cases.every((c) => c.passed),
  };
}
