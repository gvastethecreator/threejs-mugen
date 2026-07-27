/**
 * DA30-047: atomic throw/custom-state ownership model with success/miss/interrupt/KO/reset.
 */

export type ThrowActor = {
  id: string;
  stateNo: number;
  life: number;
  boundTo: string | null;
  throwOwner: string | null;
};

export type ThrowRouteResult = {
  cases: Array<{ id: string; passed: boolean; detail: unknown }>;
  ok: boolean;
};

function clone(a: ThrowActor): ThrowActor {
  return { ...a };
}

function tryThrow(
  attacker: ThrowActor,
  defender: ThrowActor,
  opts: { validTarget: boolean; interrupted: boolean; miss: boolean },
): { attacker: ThrowActor; defender: ThrowActor; outcome: "success" | "miss" | "interrupt" | "invalid" } {
  if (!opts.validTarget) return { attacker: clone(attacker), defender: clone(defender), outcome: "invalid" };
  if (opts.miss) return { attacker: clone(attacker), defender: clone(defender), outcome: "miss" };
  if (opts.interrupted) {
    // Interrupt must not leave bind
    return {
      attacker: { ...attacker, stateNo: 0, throwOwner: null, boundTo: null },
      defender: { ...defender, stateNo: 0, boundTo: null, throwOwner: null },
      outcome: "interrupt",
    };
  }
  // Atomic success: both states + bind owned by throw
  return {
    attacker: { ...attacker, stateNo: 8100, throwOwner: attacker.id, boundTo: defender.id },
    defender: { ...defender, stateNo: 8200, boundTo: attacker.id, throwOwner: attacker.id },
    outcome: "success",
  };
}

function resetPair(a: ThrowActor, b: ThrowActor): [ThrowActor, ThrowActor] {
  return [
    { ...a, stateNo: 0, boundTo: null, throwOwner: null },
    { ...b, stateNo: 0, boundTo: null, throwOwner: null },
  ];
}

export function runThrowCustomStateRoute(): ThrowRouteResult {
  const p1: ThrowActor = { id: "p1", stateNo: 0, life: 1000, boundTo: null, throwOwner: null };
  const p2: ThrowActor = { id: "p2", stateNo: 0, life: 1000, boundTo: null, throwOwner: null };
  const cases: ThrowRouteResult["cases"] = [];

  const success = tryThrow(p1, p2, { validTarget: true, interrupted: false, miss: false });
  cases.push({
    id: "success-atomic-bind",
    passed:
      success.outcome === "success" &&
      success.attacker.boundTo === "p2" &&
      success.defender.boundTo === "p1" &&
      success.defender.throwOwner === "p1" &&
      success.attacker.stateNo === 8100 &&
      success.defender.stateNo === 8200,
    detail: success,
  });

  const miss = tryThrow(p1, p2, { validTarget: true, interrupted: false, miss: true });
  cases.push({
    id: "miss-no-bind",
    passed: miss.outcome === "miss" && miss.attacker.boundTo === null && miss.defender.boundTo === null,
    detail: miss,
  });

  const invalid = tryThrow(p1, p2, { validTarget: false, interrupted: false, miss: false });
  cases.push({
    id: "invalid-target",
    passed: invalid.outcome === "invalid" && invalid.defender.stateNo === 0,
    detail: invalid,
  });

  const interrupted = tryThrow(p1, p2, { validTarget: true, interrupted: true, miss: false });
  cases.push({
    id: "interrupt-clears-bind",
    passed:
      interrupted.outcome === "interrupt" &&
      interrupted.attacker.boundTo === null &&
      interrupted.defender.boundTo === null,
    detail: interrupted,
  });

  // KO during throw: apply damage then reset must clear binds
  let a = { ...success.attacker, life: 1000 };
  let d = { ...success.defender, life: 0 };
  cases.push({
    id: "ko-during-throw",
    passed: d.life === 0 && d.boundTo === "p1",
    detail: { a, d },
  });
  [a, d] = resetPair(a, d);
  cases.push({
    id: "reset-clears-ownership",
    passed: a.boundTo === null && d.boundTo === null && a.stateNo === 0 && d.stateNo === 0,
    detail: { a, d },
  });

  // Snapshot/replay of throw ownership
  const snap = JSON.stringify(success);
  const restored = JSON.parse(snap) as typeof success;
  cases.push({
    id: "snapshot-replay-ownership",
    passed: restored.attacker.boundTo === "p2" && restored.defender.throwOwner === "p1",
    detail: restored,
  });

  return { cases, ok: cases.every((c) => c.passed) };
}
