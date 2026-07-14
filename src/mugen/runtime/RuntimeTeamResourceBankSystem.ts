import type { RuntimeTeamRoundMode } from "./RuntimeTeamRoundDecisionSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { CharacterRuntimeState, RuntimeTeamState } from "./types";

export const RUNTIME_TEAM_RESOURCE_BANK_SCHEMA = "mugen-web-sandbox/runtime-team-resource-bank/v1";

export type RuntimeTeamResourceBankActor = {
  id: string;
  side: RuntimeTeamSide;
  memberNo?: number;
  life: number;
  lifeMax?: number;
  power: number;
  powerMax?: number;
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
  value: number;
  max: number;
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

export type RuntimeTeamResourceBankRuntimeActor = RuntimeTeamResourceBankActor & {
  runtime: Pick<CharacterRuntimeState, "life" | "lifeMax" | "power" | "powerMax">;
};

export type RuntimeTeamResourceBankRuntimeInput = {
  actors: readonly RuntimeTeamResourceBankRuntimeActor[];
  mode: RuntimeTeamRoundMode;
  lifeShare: boolean;
  powerShare: boolean;
  tick?: number;
};

export type RuntimeTeamResourceBankMutation = {
  bankId: string;
  kind: "life" | "power";
  resourceOwnerId: string;
  shared: boolean;
  actorIds: string[];
  delta: number;
  value: number;
  max: number;
};

export type RuntimeTeamResourceBankRuntimeResult = {
  schema: typeof RUNTIME_TEAM_RESOURCE_BANK_SCHEMA;
  tick: number;
  reset: boolean;
  changes: RuntimeTeamResourceBankMutation[];
  diagnostics: string[];
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

export class RuntimeTeamResourceBankRuntime {
  private readonly bankWorld = new RuntimeTeamResourceBankWorld();
  private banks = new Map<string, RuntimeTeamResourceBank>();
  private baselines = new Map<string, number>();
  private topologyKey = "";

  reset(input: RuntimeTeamResourceBankRuntimeInput): RuntimeTeamResourceBankRuntimeResult {
    const diagnostic = this.bankWorld.snapshot(input);
    const actorsById = indexRuntimeActors(input.actors);
    this.banks = new Map(
      diagnostic.banks.map((bank) => [bank.bankId, { ...bank, actorIds: [...bank.actorIds] }]),
    );
    this.baselines.clear();
    for (const bank of this.banks.values()) {
      const representative = actorsById.get(bank.representativeActorId);
      if (!representative) continue;
      bank.value = clampResource(readRuntimeResource(representative, bank.kind), 0, bank.max);
      for (const actorId of bank.actorIds) {
        const actor = actorsById.get(actorId);
        if (!actor) continue;
        if (bank.shared) {
          writeRuntimeResource(actor, bank.kind, bank.value, bank.max);
        }
        this.baselines.set(baselineKey(bank.bankId, actorId), readRuntimeResource(actor, bank.kind));
      }
    }
    this.topologyKey = resourceBankTopologyKey(diagnostic);
    return {
      schema: RUNTIME_TEAM_RESOURCE_BANK_SCHEMA,
      tick: normalizeTick(input.tick),
      reset: true,
      changes: [],
      diagnostics: diagnostic.diagnostics,
    };
  }

  reconcile(input: RuntimeTeamResourceBankRuntimeInput): RuntimeTeamResourceBankRuntimeResult {
    const diagnostic = this.bankWorld.snapshot(input);
    const topologyKey = resourceBankTopologyKey(diagnostic);
    if (this.banks.size === 0 || this.topologyKey !== topologyKey) {
      return this.reset(input);
    }

    const actorsById = indexRuntimeActors(input.actors);
    const changes: RuntimeTeamResourceBankMutation[] = [];
    for (const bank of this.banks.values()) {
      const previousValue = bank.value;
      const delta = bank.actorIds.reduce((total, actorId) => {
        const actor = actorsById.get(actorId);
        if (!actor) return total;
        const current = readRuntimeResource(actor, bank.kind);
        const baseline = this.baselines.get(baselineKey(bank.bankId, actorId)) ?? current;
        return total + (current - baseline);
      }, 0);

      if (bank.shared) {
        bank.value = clampResource(bank.value + delta, 0, bank.max);
        for (const actorId of bank.actorIds) {
          const actor = actorsById.get(actorId);
          if (!actor) continue;
          writeRuntimeResource(actor, bank.kind, bank.value, bank.max);
        }
      } else {
        const representative = actorsById.get(bank.representativeActorId);
        if (representative) {
          bank.value = clampResource(readRuntimeResource(representative, bank.kind), 0, bank.max);
        }
      }

      for (const actorId of bank.actorIds) {
        const actor = actorsById.get(actorId);
        if (actor) {
          this.baselines.set(baselineKey(bank.bankId, actorId), readRuntimeResource(actor, bank.kind));
        }
      }
      if (bank.value !== previousValue) {
        changes.push({
          bankId: bank.bankId,
          kind: bank.kind,
          resourceOwnerId: bank.resourceOwnerId,
          shared: bank.shared,
          actorIds: [...bank.actorIds],
          delta: bank.value - previousValue,
          value: bank.value,
          max: bank.max,
        });
      }
    }

    return {
      schema: RUNTIME_TEAM_RESOURCE_BANK_SCHEMA,
      tick: normalizeTick(input.tick),
      reset: false,
      changes,
      diagnostics: diagnostic.diagnostics,
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
      value: resourceValue(actor, kind),
      max: resourceMax(actor, kind),
    }));
  }
  const resourceOwnerId = `team:${side}`;
  const representativeActorId = actors.find((actor) => !actor.teamState.disabled)?.id ?? actors[0]!.id;
  return [{
    bankId: `${resourceOwnerId}:${kind}`,
    kind,
    side,
    resourceOwnerId,
    shared: true,
    actorIds: actors.map((actor) => actor.id),
    representativeActorId,
    value: resourceValue(actors.find((actor) => actor.id === representativeActorId) ?? actors[0]!, kind),
    max: Math.min(...actors.map((actor) => resourceMax(actor, kind))),
  }];
}

function indexRuntimeActors(
  actors: readonly RuntimeTeamResourceBankRuntimeActor[],
): Map<string, RuntimeTeamResourceBankRuntimeActor> {
  const byId = new Map<string, RuntimeTeamResourceBankRuntimeActor>();
  for (const actor of actors) {
    const actorId = actor.id.trim();
    if (actorId && !byId.has(actorId)) byId.set(actorId, { ...actor, id: actorId });
  }
  return byId;
}

function resourceBankTopologyKey(diagnostic: RuntimeTeamResourceBankDiagnostic): string {
  return JSON.stringify({
    mode: diagnostic.mode,
    sharing: diagnostic.sharing,
    banks: diagnostic.banks.map((bank) => ({
      bankId: bank.bankId,
      kind: bank.kind,
      side: bank.side,
      resourceOwnerId: bank.resourceOwnerId,
      shared: bank.shared,
      actorIds: bank.actorIds,
    })),
  });
}

function baselineKey(bankId: string, actorId: string): string {
  return `${bankId}:${actorId}`;
}

function readRuntimeResource(actor: RuntimeTeamResourceBankRuntimeActor, kind: "life" | "power"): number {
  return kind === "life" ? actor.runtime.life : actor.runtime.power;
}

function writeRuntimeResource(
  actor: RuntimeTeamResourceBankRuntimeActor,
  kind: "life" | "power",
  value: number,
  max: number,
): void {
  const actorMax = kind === "life" ? actor.runtime.lifeMax : actor.runtime.powerMax;
  const boundedMax = Math.min(max, resourceMax(actor, kind), actorMax ?? max);
  const boundedValue = clampResource(value, 0, boundedMax);
  if (kind === "life") actor.runtime.life = boundedValue;
  else actor.runtime.power = boundedValue;
}

function resourceValue(actor: RuntimeTeamResourceBankActor, kind: "life" | "power"): number {
  return clampResource(kind === "life" ? actor.life : actor.power, 0, resourceMax(actor, kind));
}

function resourceMax(actor: RuntimeTeamResourceBankActor, kind: "life" | "power"): number {
  const value = kind === "life" ? actor.lifeMax : actor.powerMax;
  return value !== undefined && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : kind === "life"
      ? 1000
      : 3000;
}

function clampResource(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
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
  return tick !== undefined && Number.isFinite(tick) ? Math.max(0, Math.round(tick)) : 0;
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
