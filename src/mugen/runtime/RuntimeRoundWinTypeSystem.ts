import { parseHitAttribute } from "./CombatResolver";
import type { CharacterRuntimeState, RuntimeRoundWinTypeName } from "./types";
import { runtimeTeamSideFromId } from "./RuntimeTeamTopologySystem";

type RuntimeRoundWinTypeActor = {
  runtime: Pick<CharacterRuntimeState, "roundWinType">;
};

type RuntimeRoundWinTypeDefender = {
  runtime: Pick<CharacterRuntimeState, "life">;
};

type RuntimeRootSelfKoActor = {
  id: string;
  playerNo?: number;
  runtime: Pick<CharacterRuntimeState, "life" | "moveType" | "roundWinType" | "teamState" | "hitVars">;
};

export type RuntimeRoundHitSourceActor = {
  id: string;
  playerNo?: number;
  rootId?: string;
  rootOwned?: boolean;
  attr?: string;
  guardKo?: boolean;
};

export function runtimeRoundHitSourceMetadata(
  source: RuntimeRoundHitSourceActor,
): Pick<NonNullable<CharacterRuntimeState["hitVars"]>, "sourcePlayerNo" | "sourceActorId" | "sourceRootId" | "sourceRootOwned" | "sourceAttr" | "sourceGuardKo"> | undefined {
  if (source.playerNo === undefined) return undefined;
  const rootId = source.rootId ?? source.id;
  return {
    sourcePlayerNo: source.playerNo,
    sourceActorId: source.id,
    sourceRootId: rootId,
    sourceRootOwned: source.rootOwned ?? source.id === rootId,
    ...(source.attr === undefined ? {} : { sourceAttr: source.attr }),
    ...(source.guardKo === undefined ? {} : { sourceGuardKo: source.guardKo }),
  };
}

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
  if (victim.runtime.moveType === "H") {
    recordRuntimeHitStateKoCause(victim, winner);
    return;
  }
  if (
    sourceOwnerId !== victim.id ||
    lifeBefore <= 0 ||
    victim.runtime.life > 0 ||
    victim.runtime.teamState?.playerType !== true ||
    victim.runtime.teamState.disabled ||
    winner.runtime.teamState?.playerType !== true ||
    winner.runtime.teamState.disabled
  ) {
    return;
  }
  winner.runtime.roundWinType = "suicide";
}

export function recordRuntimeTargetLifeKoCause(
  victim: RuntimeRootSelfKoActor,
  winner: RuntimeRootSelfKoActor,
  lifeBefore: number,
  sourceRootId: string | undefined,
): void {
  if (
    sourceRootId === undefined ||
    lifeBefore <= 0 ||
    victim.runtime.life > 0 ||
    victim.runtime.teamState?.playerType !== true ||
    victim.runtime.teamState.disabled ||
    winner.runtime.teamState?.playerType !== true ||
    winner.runtime.teamState.disabled
  ) {
    return;
  }
  if (victim.runtime.moveType === "H") {
    recordRuntimeHitStateKoCause(victim, winner);
    return;
  }
  if (sourceRootId === victim.id) {
    winner.runtime.roundWinType = "suicide";
    return;
  }
  const victimSide = runtimeTeamSideFromId(victim.id);
  const sourceSide = runtimeTeamSideFromId(sourceRootId);
  if (victimSide !== undefined && victimSide === sourceSide) {
    winner.runtime.roundWinType = "teammate";
    return;
  }
  const source = victim.runtime.hitVars;
  if (source?.sourceGuardKo === true) {
    winner.runtime.roundWinType = "cheese";
    return;
  }
  winner.runtime.roundWinType = source?.sourceAttr === undefined
    ? "normal"
    : resolveRuntimeRoundWinTypeFromAttack(source.sourceAttr);
}

function recordRuntimeHitStateKoCause(
  victim: RuntimeRootSelfKoActor & { runtime: Pick<CharacterRuntimeState, "hitVars"> },
  winner: RuntimeRootSelfKoActor,
): void {
  const source = victim.runtime.hitVars;
  if (
    victim.playerNo === undefined ||
    source?.sourcePlayerNo === undefined ||
    source.sourceRootId === undefined ||
    source.sourceRootOwned !== true ||
    victim.runtime.teamState?.playerType !== true ||
    victim.runtime.teamState.disabled ||
    winner.runtime.teamState?.playerType !== true ||
    winner.runtime.teamState.disabled
  ) {
    return;
  }
  if (victim.playerNo === source.sourcePlayerNo) {
    winner.runtime.roundWinType = "suicide";
    return;
  }
  const victimSide = runtimeTeamSideFromId(victim.id);
  const sourceSide = runtimeTeamSideFromId(source.sourceRootId);
  if (victimSide !== undefined && victimSide === sourceSide) {
    winner.runtime.roundWinType = "teammate";
    return;
  }
  if (source.sourceGuardKo === true) {
    winner.runtime.roundWinType = "cheese";
    return;
  }
  if (source.sourceAttr !== undefined) {
    winner.runtime.roundWinType = resolveRuntimeRoundWinTypeFromAttack(source.sourceAttr);
  }
}
