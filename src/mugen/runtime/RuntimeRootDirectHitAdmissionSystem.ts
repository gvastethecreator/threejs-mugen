import type { CollisionBox } from "../model/CollisionBox";
import { canRuntimeBeHitBy, hasRuntimeBoxContact, runtimeWorldBox } from "./CombatResolver";
import type { DemoMove } from "./demoFighters";
import type { CharacterRuntimeState, RuntimeTeamState } from "./types";

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
};

export type RuntimeRootDirectHitAdmissionDecision = {
  attackerId: string;
  getterId: string;
  reason: RuntimeRootDirectHitAdmissionReason;
};

export type RuntimeRootDirectHitAdmissionDiagnostic = {
  schema: "RuntimeRootDirectHitAdmission/v0";
  mode: "ikemen-tag";
  rootIds: string[];
  attackerIds: string[];
  decisions: RuntimeRootDirectHitAdmissionDecision[];
  admittedPairIds: string[];
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
    const decisions: RuntimeRootDirectHitAdmissionDecision[] = [];
    const admittedPairIds: string[] = [];

    for (const attacker of attackers) {
      for (const getter of roots) {
        if (attacker === getter) continue;
        const reason = inspectPair(attacker, getter, input.getHurtBoxes);
        decisions.push({ attackerId: attacker.id, getterId: getter.id, reason });
        if (reason === "admitted") admittedPairIds.push(`${attacker.id}->${getter.id}`);
      }
    }

    return {
      schema: "RuntimeRootDirectHitAdmission/v0",
      mode: "ikemen-tag",
      rootIds: roots.map(({ id }) => id),
      attackerIds: attackers.map(({ id }) => id),
      decisions,
      admittedPairIds,
    };
  }
}

function inspectPair<TActor extends RuntimeRootDirectHitAdmissionActor>(
  attacker: TActor,
  getter: TActor,
  getHurtBoxes: RuntimeRootDirectHitAdmissionInput<TActor>["getHurtBoxes"],
): RuntimeRootDirectHitAdmissionReason {
  if (attacker.side === getter.side) return "same-side";
  const move = attacker.currentMove;
  if (!move) return "missing-move";
  if (attacker.hasHit) return "already-hit";
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
  if (move && !actor.hasHit && !move.requiresHitDef && !move.isReversal && actor.moveTick >= move.activeStart && actor.moveTick <= move.activeEnd) {
    return 1;
  }
  return 0;
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
