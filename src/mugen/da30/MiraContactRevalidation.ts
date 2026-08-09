/**
 * DA30-042: reciprocal Nadia contact/guard against Rocco defender using shipped CombatResolver.
 */
import { hasRuntimeBoxContact, resolveRuntimeCombatHit } from "../runtime/CombatResolver";
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

export function runNadiaContactCases() {
  const attackBox = { x1: 10, y1: -40, x2: 40, y2: -10 };
  const hurt = [{ x1: 0, y1: -32, x2: 20, y2: -4 }];
  const nadia = actor({ pos: { x: 0, y: 0 }, facing: 1, moveType: "A", attackMultiplier: 1 });
  const rocco = actor({ pos: { x: 45, y: 0 }, facing: -1, moveType: "I", stateType: "S", defenseMultiplier: 1 });
  const contact = hasRuntimeBoxContact(attackBox, rocco, hurt);
  const hit = resolveRuntimeCombatHit({
    attacker: nadia,
    defender: rocco,
    attack: { damage: 35, hitPause: 7, hitStun: 14, push: 8, attr: "S, NA", guardFlag: "MA", guardDamage: 4, guardPause: 3, guardStun: 6 },
    holdingBack: false,
  });
  const guard = resolveRuntimeCombatHit({
    attacker: nadia,
    defender: rocco,
    attack: { damage: 35, hitPause: 7, hitStun: 14, push: 8, attr: "S, NA", guardFlag: "MA", guardDamage: 4, guardPause: 3, guardStun: 6 },
    holdingBack: true,
  });
  return {
    attacker: "nadia-arce",
    defender: "rocco-vidal",
    contact,
    hit: { kind: hit.kind, damage: hit.damage, pause: hit.pause },
    guard: { kind: guard.kind, damage: guard.damage, pause: guard.pause },
    ok: contact && hit.kind === "hit" && hit.damage > 0 && guard.kind === "guard",
  };
}

/** @deprecated Kept for older DA30 evidence readers. */
export const runMiraContactCases = runNadiaContactCases;
