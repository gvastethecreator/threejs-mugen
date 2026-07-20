import { parseHitAttribute } from "./CombatResolver";
import type { CharacterRuntimeState, RuntimeRoundWinTypeName } from "./types";

type RuntimeRoundWinTypeActor = {
  runtime: Pick<CharacterRuntimeState, "roundWinType">;
};

type RuntimeRoundWinTypeDefender = {
  runtime: Pick<CharacterRuntimeState, "life">;
};

type RuntimeRootSelfKoActor = {
  id: string;
  runtime: Pick<CharacterRuntimeState, "life" | "moveType" | "roundWinType" | "teamState">;
};

export function recordRuntimeRoundWinType(
  attacker: RuntimeRoundWinTypeActor,
  defender: RuntimeRoundWinTypeDefender,
  attr: string | undefined,
  contactKind: "hit" | "guard",
  lifeBefore: number,
  options: { sourceEligible?: boolean } = {},
): void {
  if (options.sourceEligible === false || lifeBefore <= 0 || defender.runtime.life > 0) return;
  attacker.runtime.roundWinType = contactKind === "guard"
    ? "cheese"
    : resolveRuntimeRoundWinTypeFromAttack(attr);
}

export function resolveRuntimeRoundWinTypeFromAttack(attr: string | undefined): RuntimeRoundWinTypeName {
  const types = parseHitAttribute(attr ?? "S,NA").types;
  if (["HA", "HT", "HP"].some((type) => types.has(type))) return "hyper";
  if (["SA", "ST", "SP"].some((type) => types.has(type))) return "special";
  if (["NT", "ST", "HT", "AT"].some((type) => types.has(type))) return "throw";
  return "normal";
}

export function recordRuntimeRootSelfKoCause(
  victim: RuntimeRootSelfKoActor,
  winner: RuntimeRootSelfKoActor,
  lifeBefore: number,
  sourceOwnerId: string | undefined,
): void {
  if (
    sourceOwnerId !== victim.id ||
    lifeBefore <= 0 ||
    victim.runtime.life > 0 ||
    victim.runtime.moveType === "H" ||
    victim.runtime.teamState?.playerType !== true ||
    victim.runtime.teamState.disabled ||
    winner.runtime.teamState?.playerType !== true ||
    winner.runtime.teamState.disabled
  ) {
    return;
  }
  winner.runtime.roundWinType = "suicide";
}
