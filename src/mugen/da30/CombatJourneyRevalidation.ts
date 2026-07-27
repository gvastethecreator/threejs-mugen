/**
 * DA30-041: semantic Nova contact revalidation with hit/miss/guard cases.
 * Uses shipped CombatResolver collision + resolveRuntimeCombatHit.
 */
import {
  hasRuntimeBoxContact,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
  type RuntimeCombatAttack,
} from "../runtime/CombatResolver";
import type { CharacterRuntimeState } from "../runtime/types";

function actor(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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
    ...overrides,
  } as CharacterRuntimeState;
}

const defaultAttack: RuntimeCombatAttack = {
  damage: 40,
  hitPause: 8,
  hitStun: 16,
  push: 10,
  attr: "S, NA",
  guardFlag: "MA",
  guardDamage: 5,
  guardPause: 4,
  guardStun: 8,
};

export type CombatCaseResult = {
  id: string;
  kind: "hit" | "guard" | "miss";
  damage: number;
  pause: number;
  contact: boolean;
};

/**
 * Local attack box on attacker at origin; defender at x=30 overlaps world attack.
 * Miss defender at x=200 does not overlap.
 */
export function runNovaContactCases(): { cases: CombatCaseResult[]; ok: boolean; packageHint: string } {
  const attacker = actor({ pos: { x: 0, y: 0 }, facing: 1, moveType: "A", attackMultiplier: 1 });
  const localAttack = { x1: 10, y1: -40, x2: 50, y2: -5 };
  const worldAttack = runtimeWorldBox(attacker, localAttack);
  const hurt = [{ x1: -12, y1: -36, x2: 12, y2: -4 }];

  const hitDefender = actor({ pos: { x: 40, y: 0 }, facing: -1, moveType: "I", stateType: "S" });
  const hitContact = hasRuntimeBoxContact(worldAttack, hitDefender, hurt);
  const hit = resolveRuntimeCombatHit({
    attacker,
    defender: hitDefender,
    attack: defaultAttack,
    holdingBack: false,
  });

  const guardDefender = actor({ pos: { x: 40, y: 0 }, facing: -1, moveType: "I", stateType: "S" });
  const guardContact = hasRuntimeBoxContact(worldAttack, guardDefender, hurt);
  const guard = resolveRuntimeCombatHit({
    attacker,
    defender: guardDefender,
    attack: defaultAttack,
    holdingBack: true,
  });

  const missDefender = actor({ pos: { x: 220, y: 0 }, facing: -1, moveType: "I", stateType: "S" });
  const missContact = hasRuntimeBoxContact(worldAttack, missDefender, hurt);

  const cases: CombatCaseResult[] = [
    {
      id: "hit",
      kind: hit.kind === "hit" ? "hit" : "guard",
      damage: hit.damage,
      pause: hit.pause,
      contact: hitContact,
    },
    {
      id: "guard",
      kind: guard.kind === "guard" ? "guard" : "hit",
      damage: guard.damage,
      pause: guard.pause,
      contact: guardContact,
    },
    {
      id: "miss",
      kind: "miss",
      damage: 0,
      pause: 0,
      contact: missContact,
    },
  ];

  const ok =
    cases[0]!.kind === "hit" &&
    cases[0]!.contact === true &&
    cases[0]!.damage > 0 &&
    cases[1]!.kind === "guard" &&
    cases[1]!.contact === true &&
    cases[1]!.damage === 5 &&
    cases[2]!.kind === "miss" &&
    cases[2]!.contact === false;

  return { cases, ok, packageHint: "nova-boxer combat surface via CombatResolver" };
}
