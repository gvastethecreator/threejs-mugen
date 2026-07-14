import type { RuntimeTeamRoundMode } from "./RuntimeTeamRoundDecisionSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTeamState } from "./types";

export const RUNTIME_TEAM_RESOURCE_BANK_SCHEMA = "mugen-web-sandbox/runtime-team-resource-bank/v0";

export type RuntimeTeamResourceBankActor = {
  id: string;
  side: RuntimeTeamSide;
  memberNo?: number;
  life: number;
  power: number;
  teamState: RuntimeTeamState;
};

export type RuntimeTeamResourceBankBinding = {
  actorId: string;
  side: RuntimeTeamSide;
  life: RuntimeTeamResourceBinding;
  power: RuntimeTeamResourceBinding;
};

export type RuntimeTeamResourceBinding = {
  bankId: string;
  resourceOwnerId: string;
  shared: boolean;
  representativeActorId: string;
};

export type RuntimeTeamResourceBank = {
  bankId: string;
  kind: "life" | "power";
  side: RuntimeTeamSide;
  resourceOwnerId: string;
  shared: boolean;
  actorIds: string[];
  representativeActorId: string;
};

export type RuntimeTeamResourceBankDiagnostic = {
  schema: typeof RUNTIME_TEAM_RESOURCE_BANK_SCHEMA;
  tick: number;
  mode: RuntimeTeamRoundMode;
  sharing: {
    life: boolean;
    power: boolean;
  };
  actors: RuntimeTeamResourceBankBinding[];
  banks: RuntimeTeamResourceBank[];
  diagnostics: string[];
};

export type RuntimeTeamResourceBankInput = {
  actors: readonly RuntimeTeamResourceBankActor[];
  mode: RuntimeTeamRoundMode;
  lifeShare: boolean;
  powerShare: boolean;
  tick?: number;
};

export class RuntimeTeamResourceBankWorld {
  snapshot(input: RuntimeTeamResourceBankInput): RuntimeTeamResourceBankDiagnostic {
    const diagnostics: string[] = [];
    const actorsBySide: Record<RuntimeTeamSide, RuntimeTeamResourceBankActor[]> = { 1: [], 2: [] };
    const seenIds = new Set<string>();

    for (const actor of input.actors) {
      const actorId = actor.id.trim();
      if (!actorId) {
        diagnostics.push("invalid-actor-id");
        continue;
      }
      if (seenIds.has(actorId)) {
        diagnostics.push(`duplicate-actor:${actorId}`);
        continue;
      }
      seenIds.add(actorId);
      if (actor.side !== 1 && actor.side !== 2) {
        diagnostics.push(`invalid-side:${actorId}`);
        continue;
      }
      actorsBySide[actor.side].push({ ...actor, id: actorId });
    }

    const orderedBySide: Record<RuntimeTeamSide, RuntimeTeamResourceBankActor[]> = {
      1: [...actorsBySide[1]].sort(compareActors),
      2: [...actorsBySide[2]].sort(compareActors),
    };
    const banks = ([1, 2] as const).flatMap((side) => [
      ...createBanks(side, "life", orderedBySide[side], input.lifeShare),
      ...createBanks(side, "power", orderedBySide[side], input.powerShare),
    ]);
    const bankByActorAndKind = new Map<string, RuntimeTeamResourceBank>();
    for (const bank of banks) {
      for (const actorId of bank.actorIds) {
        bankByActorAndKind.set(`${actorId}:${bank.kind}`, bank);
      }
    }

    const actors = ([1, 2] as const).flatMap((side) => orderedBySide[side].map((actor) => {
      const life = bankByActorAndKind.get(`${actor.id}:life`);
      const power = bankByActorAndKind.get(`${actor.id}:power`);
      if (!life || !power) {
        diagnostics.push(`missing-bank:${actor.id}`);
        return undefined;
      }
      return {
        actorId: actor.id,
        side,
        life: bindingFor(life),
        power: bindingFor(power),
      } satisfies RuntimeTeamResourceBankBinding;
    }).filter((actor): actor is RuntimeTeamResourceBankBinding => actor !== undefined));

    return {
      schema: RUNTIME_TEAM_RESOURCE_BANK_SCHEMA,
      tick: normalizeTick(input.tick),
      mode: input.mode,
      sharing: { life: input.lifeShare, power: input.powerShare },
      actors,
      banks,
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }
}

function createBanks(
  side: RuntimeTeamSide,
  kind: "life" | "power",
  actors: readonly RuntimeTeamResourceBankActor[],
  shared: boolean,
): RuntimeTeamResourceBank[] {
  if (actors.length === 0) return [];
  if (!shared) {
    return actors.map((actor) => ({
      bankId: `${actor.id}:${kind}`,
      kind,
      side,
      resourceOwnerId: actor.id,
      shared: false,
      actorIds: [actor.id],
      representativeActorId: actor.id,
    }));
  }
  const resourceOwnerId = `team:${side}`;
  return [{
    bankId: `${resourceOwnerId}:${kind}`,
    kind,
    side,
    resourceOwnerId,
    shared: true,
    actorIds: actors.map((actor) => actor.id),
    representativeActorId: actors.find((actor) => !actor.teamState.disabled)?.id ?? actors[0]!.id,
  }];
}

function bindingFor(bank: RuntimeTeamResourceBank): RuntimeTeamResourceBinding {
  return {
    bankId: bank.bankId,
    resourceOwnerId: bank.resourceOwnerId,
    shared: bank.shared,
    representativeActorId: bank.representativeActorId,
  };
}

function compareActors(left: RuntimeTeamResourceBankActor, right: RuntimeTeamResourceBankActor): number {
  if (left.memberNo !== undefined && right.memberNo !== undefined && left.memberNo !== right.memberNo) {
    return left.memberNo - right.memberNo;
  }
  if (left.memberNo !== undefined) return -1;
  if (right.memberNo !== undefined) return 1;
  return compareStableStrings(left.id, right.id);
}

function normalizeTick(tick: number | undefined): number {
  return Number.isFinite(tick) ? Math.max(0, Math.round(tick!)) : 0;
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
