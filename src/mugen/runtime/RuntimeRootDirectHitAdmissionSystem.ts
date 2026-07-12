import type { CollisionBox } from "../model/CollisionBox";
import { canRuntimeBeHitBy, hasRuntimeBoxContact, hitAttributeMatches, runtimeWorldBox } from "./CombatResolver";
import type { DemoMove } from "./demoFighters";
import type { CharacterRuntimeState, RuntimeTeamState } from "./types";
import { hasRuntimeHitDefTarget, type RuntimeHitDefContactMemoryActor } from "./RuntimeHitDefContactMemorySystem";

export type RuntimeRootDirectHitAdmissionReason =
  | "admitted"
  | "same-side"
  | "missing-move"
  | "already-hit"
  | "compiled-hitdef"
  | "reversal-move"
  | "inactive"
  | "hitby-rejected"
  | "missing-hurt-box"
  | "no-contact";

export type RuntimeRootDirectHitAdmissionActor = {
  id: string;
  playerNo?: number;
  side: 1 | 2 | null;
  teamState: RuntimeTeamState;
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "hitBy" | "reversal">;
  currentMove?: DemoMove;
  moveTick: number;
  hasHit: boolean;
  hitDefTargets?: RuntimeHitDefContactMemoryActor["hitDefTargets"];
  pendingHitDefTargets?: RuntimeHitDefContactMemoryActor["pendingHitDefTargets"];
};

export type RuntimeRootDirectHitAdmissionDecision = {
  attackerId: string;
  getterId: string;
  reason: RuntimeRootDirectHitAdmissionReason;
};

export type RuntimeRootReversalClashAdmissionReason = "admitted" | "same-side" | "inactive" | "attr-rejected" | "no-contact";

export type RuntimeRootReversalClashAdmissionDecision = {
  attackerId: string;
  getterId: string;
  reason: RuntimeRootReversalClashAdmissionReason;
};

export type RuntimeRootDirectHitAdmissionDiagnostic = {
  schema: "RuntimeRootDirectHitAdmission/v1";
  mode: "ikemen-tag";
  rootIds: string[];
  attackerIds: string[];
  decisions: RuntimeRootDirectHitAdmissionDecision[];
  admittedPairIds: string[];
  reversalClashDecisions: RuntimeRootReversalClashAdmissionDecision[];
  admittedReversalClashPairIds: string[];
};

export type RuntimeRootDirectHitAdmissionInput<TActor extends RuntimeRootDirectHitAdmissionActor> = {
  roots: readonly TActor[];
  getHurtBoxes: (actor: TActor) => readonly CollisionBox[] | undefined;
};

export class RuntimeRootDirectHitAdmissionWorld {
  inspect<TActor extends RuntimeRootDirectHitAdmissionActor>(
    input: RuntimeRootDirectHitAdmissionInput<TActor>,
  ): RuntimeRootDirectHitAdmissionDiagnostic {
    assertRoots(input.roots);
    const roots = input.roots.filter(isEligibleRoot);
    const attackers = [...roots].sort(compareAttackers);
    const getters = [...roots].sort(compareAttackers);
    const decisions: RuntimeRootDirectHitAdmissionDecision[] = [];
    const admittedPairIds: string[] = [];
    const reversalClashDecisions: RuntimeRootReversalClashAdmissionDecision[] = [];
    const admittedReversalClashPairIds: string[] = [];

    for (const getter of getters) {
      for (const attacker of roots) {
        if (attacker === getter) continue;
        const reason = inspectPair(attacker, getter, input.getHurtBoxes);
        decisions.push({ attackerId: attacker.id, getterId: getter.id, reason });
        if (reason === "admitted") admittedPairIds.push(`${attacker.id}->${getter.id}`);
      }
    }

    for (const getter of getters.filter(isActiveReversal)) {
      for (const attacker of roots.filter(isActiveReversal)) {
        if (attacker === getter) continue;
        const reason = inspectReversalClash(attacker, getter);
        reversalClashDecisions.push({ attackerId: attacker.id, getterId: getter.id, reason });
        if (reason === "admitted") admittedReversalClashPairIds.push(`${attacker.id}->${getter.id}`);
      }
    }

    return {
      schema: "RuntimeRootDirectHitAdmission/v1",
      mode: "ikemen-tag",
      rootIds: roots.map(({ id }) => id),
      attackerIds: attackers.map(({ id }) => id),
      decisions,
      admittedPairIds,
      reversalClashDecisions,
      admittedReversalClashPairIds,
    };
  }
}

function inspectReversalClash(
  attacker: RuntimeRootDirectHitAdmissionActor,
  getter: RuntimeRootDirectHitAdmissionActor,
): RuntimeRootReversalClashAdmissionReason {
  if (attacker.side === getter.side) return "same-side";
  const attackerMove = attacker.currentMove!;
  const getterMove = getter.currentMove!;
  if (!runtimeMoveIsActive(attacker, attackerMove) || !runtimeMoveIsActive(getter, getterMove)) return "inactive";
  if (!hitAttributeMatches(attackerMove.reversalAttr ?? "", getterMove.attr ?? "S,NA")) return "attr-rejected";
  return hasRuntimeBoxContact(runtimeWorldBox(attacker.runtime, attackerMove.hitbox), getter.runtime, [getterMove.hitbox])
    ? "admitted"
    : "no-contact";
}

function inspectPair<TActor extends RuntimeRootDirectHitAdmissionActor>(
  attacker: TActor,
  getter: TActor,
  getHurtBoxes: RuntimeRootDirectHitAdmissionInput<TActor>["getHurtBoxes"],
): RuntimeRootDirectHitAdmissionReason {
  if (attacker.side === getter.side) return "same-side";
  const move = attacker.currentMove;
  if (!move) return "missing-move";
  if (hasExplicitHitDefContactMemory(attacker)) {
    if (hasRuntimeHitDefTarget(attacker, getter.id)) return "already-hit";
  } else if (attacker.hasHit) return "already-hit";
  if (move.requiresHitDef) return "compiled-hitdef";
  if (move.isReversal) return "reversal-move";
  if (attacker.moveTick < move.activeStart || attacker.moveTick > move.activeEnd) return "inactive";
  if (!canRuntimeBeHitBy(getter.runtime, move.attr ?? "S,NA")) return "hitby-rejected";
  const hurtBoxes = getHurtBoxes(getter);
  if (!hurtBoxes?.length) return "missing-hurt-box";
  return hasRuntimeBoxContact(runtimeWorldBox(attacker.runtime, move.hitbox), getter.runtime, [...hurtBoxes])
    ? "admitted"
    : "no-contact";
}

function isEligibleRoot(root: RuntimeRootDirectHitAdmissionActor): boolean {
  return (
    (root.side === 1 || root.side === 2) &&
    root.teamState.playerType &&
    !root.teamState.disabled &&
    !root.teamState.standby
  );
}

function isActiveReversal(actor: RuntimeRootDirectHitAdmissionActor): boolean {
  return actor.currentMove?.isReversal === true && actor.runtime.reversal !== undefined;
}

function runtimeMoveIsActive(actor: RuntimeRootDirectHitAdmissionActor, move: DemoMove): boolean {
  return actor.moveTick >= move.activeStart && actor.moveTick <= move.activeEnd;
}

function compareAttackers(
  left: RuntimeRootDirectHitAdmissionActor,
  right: RuntimeRootDirectHitAdmissionActor,
): number {
  const priority = attackerPriority(right) - attackerPriority(left);
  if (priority !== 0) return priority;
  const playerNo = (left.playerNo ?? Number.MAX_SAFE_INTEGER) - (right.playerNo ?? Number.MAX_SAFE_INTEGER);
  return playerNo || left.id.localeCompare(right.id);
}

function attackerPriority(actor: RuntimeRootDirectHitAdmissionActor): number {
  if (actor.runtime.reversal) return 2;
  const move = actor.currentMove;
  if (move && (!actor.hasHit || hasExplicitHitDefContactMemory(actor)) && !move.requiresHitDef && !move.isReversal && actor.moveTick >= move.activeStart && actor.moveTick <= move.activeEnd) {
    return 1;
  }
  return 0;
}

function hasExplicitHitDefContactMemory(actor: RuntimeRootDirectHitAdmissionActor): boolean {
  return actor.hitDefTargets !== undefined || actor.pendingHitDefTargets !== undefined;
}

function assertRoots(roots: readonly RuntimeRootDirectHitAdmissionActor[]): void {
  const ids = new Set<string>();
  const playerNos = new Set<number>();
  const actors = new Set<RuntimeRootDirectHitAdmissionActor>();
  for (const root of roots) {
    if (actors.has(root)) throw new Error(`Duplicate root hit-admission actor object ${root.id}`);
    if (ids.has(root.id)) throw new Error(`Duplicate root hit-admission actor id ${root.id}`);
    actors.add(root);
    ids.add(root.id);
    if (!Number.isInteger(root.playerNo) || root.playerNo! < 1) {
      throw new Error(`Root hit-admission actor ${root.id} requires a positive PlayerNo`);
    }
    if (playerNos.has(root.playerNo!)) {
      throw new Error(`Duplicate root hit-admission PlayerNo ${root.playerNo}`);
    }
    playerNos.add(root.playerNo!);
  }
}
