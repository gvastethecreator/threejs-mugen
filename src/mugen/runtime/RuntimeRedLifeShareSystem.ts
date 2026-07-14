import type { RuntimeTeamRoundMode } from "./RuntimeTeamRoundDecisionSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { CharacterRuntimeState, RuntimeTeamState } from "./types";

export const RUNTIME_RED_LIFE_SHARE_SCHEMA = "mugen-web-sandbox/runtime-red-life-share/v0";

export type RuntimeRedLifeShareActor = {
  id: string;
  side: RuntimeTeamSide;
  memberNo?: number;
  life: number;
  lifeMax?: number;
  redLife: number;
  teamState: RuntimeTeamState;
};

export type RuntimeRedLifeShareRuntimeActor = RuntimeRedLifeShareActor & {
  runtime: Pick<CharacterRuntimeState, "life" | "lifeMax" | "redLife">;
};

export type RuntimeRedLifeShareBinding = {
  actorId: string;
  side: RuntimeTeamSide;
  resourceOwnerId: string;
  shared: boolean;
  representativeActorId: string;
};

export type RuntimeRedLifeShareBank = {
  bankId: string;
  side: RuntimeTeamSide;
  resourceOwnerId: string;
  shared: boolean;
  actorIds: string[];
  representativeActorId: string;
  value: number;
  min: number;
  max: number;
};

export type RuntimeRedLifeShareDiagnostic = {
  schema: typeof RUNTIME_RED_LIFE_SHARE_SCHEMA;
  tick: number;
  mode: RuntimeTeamRoundMode;
  sharing: boolean;
  actors: RuntimeRedLifeShareBinding[];
  banks: RuntimeRedLifeShareBank[];
  diagnostics: string[];
};

export type RuntimeRedLifeShareInput = {
  actors: readonly RuntimeRedLifeShareActor[];
  mode: RuntimeTeamRoundMode;
  lifeShare: boolean;
  tick?: number;
};

export type RuntimeRedLifeShareRuntimeInput = {
  actors: readonly RuntimeRedLifeShareRuntimeActor[];
  mode: RuntimeTeamRoundMode;
  lifeShare: boolean;
  tick?: number;
};

export type RuntimeRedLifeShareMutation = {
  bankId: string;
  side: RuntimeTeamSide;
  resourceOwnerId: string;
  shared: boolean;
  actorIds: string[];
  delta: number;
  value: number;
  min: number;
  max: number;
};

export type RuntimeRedLifeShareRuntimeResult = {
  schema: typeof RUNTIME_RED_LIFE_SHARE_SCHEMA;
  tick: number;
  reset: boolean;
  changes: RuntimeRedLifeShareMutation[];
  diagnostics: string[];
};

export class RuntimeRedLifeShareWorld {
  snapshot(input: RuntimeRedLifeShareInput): RuntimeRedLifeShareDiagnostic {
    const diagnostics: string[] = [];
    const actorsBySide: Record<RuntimeTeamSide, RuntimeRedLifeShareActor[]> = { 1: [], 2: [] };
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
      if (!Number.isFinite(actor.life)) diagnostics.push(`invalid-life:${actorId}`);
      if (!Number.isFinite(actor.redLife)) diagnostics.push(`invalid-red-life:${actorId}`);
      actorsBySide[actor.side].push({ ...actor, id: actorId });
    }

    const orderedBySide: Record<RuntimeTeamSide, RuntimeRedLifeShareActor[]> = {
      1: [...actorsBySide[1]].sort(compareActors),
      2: [...actorsBySide[2]].sort(compareActors),
    };
    const sharing = input.lifeShare && input.mode !== "single";
    const banks = ([1, 2] as const).flatMap((side) => createBanks(side, orderedBySide[side], sharing));
    const bankByActor = new Map<string, RuntimeRedLifeShareBank>();
    for (const bank of banks) {
      for (const actorId of bank.actorIds) bankByActor.set(actorId, bank);
    }

    const actors = ([1, 2] as const).flatMap((side) => orderedBySide[side].flatMap((actor) => {
      const bank = bankByActor.get(actor.id);
      if (!bank) {
        diagnostics.push(`missing-bank:${actor.id}`);
        return [];
      }
      return [{
        actorId: actor.id,
        side,
        resourceOwnerId: bank.resourceOwnerId,
        shared: bank.shared,
        representativeActorId: bank.representativeActorId,
      } satisfies RuntimeRedLifeShareBinding];
    }));

    return {
      schema: RUNTIME_RED_LIFE_SHARE_SCHEMA,
      tick: normalizeTick(input.tick),
      mode: input.mode,
      sharing,
      actors,
      banks,
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }
}

export class RuntimeRedLifeShareRuntime {
  private readonly shareWorld = new RuntimeRedLifeShareWorld();
  private banks = new Map<string, RuntimeRedLifeShareBank>();
  private baselines = new Map<string, number>();
  private topologyKey = "";

  reset(input: RuntimeRedLifeShareRuntimeInput): RuntimeRedLifeShareRuntimeResult {
    const diagnostic = this.shareWorld.snapshot(input);
    const actorsById = indexRuntimeActors(input.actors);
    this.banks = new Map(
      diagnostic.banks.map((bank) => [bank.bankId, { ...bank, actorIds: [...bank.actorIds] }]),
    );
    this.baselines.clear();
    for (const bank of this.banks.values()) {
      const representative = actorsById.get(bank.representativeActorId);
      if (!representative) continue;
      bank.value = clampBankValue(readRuntimeRedLife(representative), bank, bankActors(bank, actorsById));
      if (bank.shared) {
        for (const actorId of bank.actorIds) {
          const actor = actorsById.get(actorId);
          if (actor) writeRuntimeRedLife(actor, bank.value, bank, bankActors(bank, actorsById));
        }
      } else {
        writeRuntimeRedLife(representative, bank.value, bank, [representative]);
      }
      for (const actorId of bank.actorIds) {
        const actor = actorsById.get(actorId);
        if (actor) this.baselines.set(baselineKey(bank.bankId, actorId), readRuntimeRedLife(actor));
      }
    }
    this.topologyKey = redLifeShareTopologyKey(diagnostic);
    return {
      schema: RUNTIME_RED_LIFE_SHARE_SCHEMA,
      tick: normalizeTick(input.tick),
      reset: true,
      changes: [],
      diagnostics: diagnostic.diagnostics,
    };
  }

  reconcile(input: RuntimeRedLifeShareRuntimeInput): RuntimeRedLifeShareRuntimeResult {
    const diagnostic = this.shareWorld.snapshot(input);
    const topologyKey = redLifeShareTopologyKey(diagnostic);
    if (this.banks.size === 0 || this.topologyKey !== topologyKey) return this.reset(input);

    const actorsById = indexRuntimeActors(input.actors);
    const diagnosticBanks = new Map(diagnostic.banks.map((bank) => [bank.bankId, bank]));
    const changes: RuntimeRedLifeShareMutation[] = [];
    for (const bank of this.banks.values()) {
      const currentDiagnosticBank = diagnosticBanks.get(bank.bankId);
      if (currentDiagnosticBank) {
        bank.min = currentDiagnosticBank.min;
        bank.max = currentDiagnosticBank.max;
      }
      const previousValue = bank.value;
      const actors = bankActors(bank, actorsById);
      const delta = bank.actorIds.reduce((total, actorId) => {
        const actor = actorsById.get(actorId);
        if (!actor) return total;
        const current = readRuntimeRedLife(actor);
        const baseline = this.baselines.get(baselineKey(bank.bankId, actorId)) ?? current;
        return total + (current - baseline);
      }, 0);

      if (bank.shared) {
        bank.value = clampBankValue(bank.value + delta, bank, actors);
        for (const actorId of bank.actorIds) {
          const actor = actorsById.get(actorId);
          if (actor) writeRuntimeRedLife(actor, bank.value, bank, actors);
        }
      } else {
        const representative = actorsById.get(bank.representativeActorId);
        if (representative) {
          bank.value = clampBankValue(readRuntimeRedLife(representative), bank, [representative]);
          writeRuntimeRedLife(representative, bank.value, bank, [representative]);
        }
      }

      for (const actorId of bank.actorIds) {
        const actor = actorsById.get(actorId);
        if (actor) this.baselines.set(baselineKey(bank.bankId, actorId), readRuntimeRedLife(actor));
      }
      if (bank.value !== previousValue) {
        changes.push({
          bankId: bank.bankId,
          side: bank.side,
          resourceOwnerId: bank.resourceOwnerId,
          shared: bank.shared,
          actorIds: [...bank.actorIds],
          delta: bank.value - previousValue,
          value: bank.value,
          min: bank.min,
          max: bank.max,
        });
      }
    }

    return {
      schema: RUNTIME_RED_LIFE_SHARE_SCHEMA,
      tick: normalizeTick(input.tick),
      reset: false,
      changes,
      diagnostics: diagnostic.diagnostics,
    };
  }
}

function createBanks(
  side: RuntimeTeamSide,
  actors: readonly RuntimeRedLifeShareActor[],
  shared: boolean,
): RuntimeRedLifeShareBank[] {
  if (actors.length === 0) return [];
  if (!shared) {
    return actors.map((actor) => ({
      bankId: `${actor.id}:red-life`,
      side,
      resourceOwnerId: actor.id,
      shared: false,
      actorIds: [actor.id],
      representativeActorId: actor.id,
      value: finiteOrZero(actor.redLife),
      min: currentLife(actor),
      max: lifeMax(actor),
    }));
  }
  const resourceOwnerId = `team:${side}`;
  const representativeActorId = actors.find((actor) => !actor.teamState.disabled)?.id ?? actors[0]!.id;
  const max = Math.min(...actors.map(lifeMax));
  return [{
    bankId: `${resourceOwnerId}:red-life`,
    side,
    resourceOwnerId,
    shared: true,
    actorIds: actors.map((actor) => actor.id),
    representativeActorId,
    value: finiteOrZero(actors.find((actor) => actor.id === representativeActorId)?.redLife ?? 0),
    min: Math.min(max, Math.max(...actors.map(currentLife))),
    max,
  }];
}

function bankActors(
  bank: RuntimeRedLifeShareBank,
  actorsById: Map<string, RuntimeRedLifeShareRuntimeActor>,
): RuntimeRedLifeShareRuntimeActor[] {
  return bank.actorIds.flatMap((actorId) => {
    const actor = actorsById.get(actorId);
    return actor ? [actor] : [];
  });
}

function indexRuntimeActors(
  actors: readonly RuntimeRedLifeShareRuntimeActor[],
): Map<string, RuntimeRedLifeShareRuntimeActor> {
  const byId = new Map<string, RuntimeRedLifeShareRuntimeActor>();
  for (const actor of actors) {
    const actorId = actor.id.trim();
    if (actorId && !byId.has(actorId)) byId.set(actorId, { ...actor, id: actorId });
  }
  return byId;
}

function redLifeShareTopologyKey(diagnostic: RuntimeRedLifeShareDiagnostic): string {
  return JSON.stringify({
    mode: diagnostic.mode,
    sharing: diagnostic.sharing,
    banks: diagnostic.banks.map((bank) => ({
      bankId: bank.bankId,
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

function readRuntimeRedLife(actor: RuntimeRedLifeShareRuntimeActor): number {
  return finiteOrZero(actor.runtime.redLife);
}

function writeRuntimeRedLife(
  actor: RuntimeRedLifeShareRuntimeActor,
  value: number,
  bank: RuntimeRedLifeShareBank,
  actors: readonly RuntimeRedLifeShareRuntimeActor[],
): void {
  actor.runtime.redLife = clampBankValue(value, bank, actors.length > 0 ? actors : [actor]);
}

function clampBankValue(
  value: number,
  bank: RuntimeRedLifeShareBank,
  actors: readonly RuntimeRedLifeShareRuntimeActor[],
): number {
  if (actors.some((actor) => actor.runtime.life <= 0)) return 0;
  if (value <= 0 || !Number.isFinite(value)) return 0;
  const max = Math.min(bank.max, ...actors.map((actor) => lifeMax(actor)));
  const min = Math.min(max, Math.max(...actors.map((actor) => currentLife(actor))));
  return Math.min(max, Math.max(min, value));
}

function currentLife(actor: Pick<RuntimeRedLifeShareActor, "life"> | RuntimeRedLifeShareRuntimeActor): number {
  return Math.max(0, finiteOrZero("runtime" in actor ? actor.runtime.life : actor.life));
}

function lifeMax(actor: Pick<RuntimeRedLifeShareActor, "lifeMax"> | RuntimeRedLifeShareRuntimeActor): number {
  const value = "runtime" in actor ? actor.runtime.lifeMax : actor.lifeMax;
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : 1000;
}

function finiteOrZero(value: number | undefined): number {
  return Number.isFinite(value) ? value! : 0;
}

function compareActors(a: RuntimeRedLifeShareActor, b: RuntimeRedLifeShareActor): number {
  const memberA = a.memberNo ?? Number.MAX_SAFE_INTEGER;
  const memberB = b.memberNo ?? Number.MAX_SAFE_INTEGER;
  return memberA - memberB || a.id.localeCompare(b.id);
}

function normalizeTick(value: number | undefined): number {
  return Number.isFinite(value) && value !== undefined ? Math.max(0, Math.floor(value)) : 0;
}

function compareStableStrings(a: string, b: string): number {
  return a.localeCompare(b);
}
