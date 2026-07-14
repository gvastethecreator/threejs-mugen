export const RUNTIME_TURNS_RECOVERY_SCHEMA = "mugen-web-sandbox/runtime-turns-recovery/v0";

// IKEMEN's built-in fallback uses (lifeMax * roundTime / 60) * (1 / 300).
export const DEFAULT_RUNTIME_TURNS_RECOVERY_RATE = 1 / 300;

export type RuntimeTurnsRecoveryActor = {
  id: string;
  life: number;
  lifeMax?: number;
};

export type RuntimeTurnsRecoveryInput = {
  actors: readonly RuntimeTurnsRecoveryActor[];
  winnerId?: string;
  timeTicks?: number;
  matchOver?: boolean;
  rate?: number;
};

export type RuntimeTurnsRecoveryState = {
  actorId: string;
  lifeBefore: number;
  lifeAfter: number;
  recoveryAmount: number;
  eligible: boolean;
};

export type RuntimeTurnsRecoveryResult = {
  schema: typeof RUNTIME_TURNS_RECOVERY_SCHEMA;
  winnerId?: string;
  timeTicks: number;
  rate: number;
  states: RuntimeTurnsRecoveryState[];
  diagnostics: string[];
};

export class RuntimeTurnsRecoveryWorld {
  prepare(input: RuntimeTurnsRecoveryInput): RuntimeTurnsRecoveryResult {
    const diagnostics: string[] = [];
    const seenIds = new Set<string>();
    const timeTicks = nonNegativeInteger(input.timeTicks);
    const rate = nonNegativeFinite(input.rate, DEFAULT_RUNTIME_TURNS_RECOVERY_RATE);
    const states = input.actors.flatMap((actor) => {
      const actorId = actor.id.trim();
      if (!actorId) {
        diagnostics.push("invalid-actor-id");
        return [];
      }
      if (seenIds.has(actorId)) {
        diagnostics.push(`duplicate-actor:${actorId}`);
        return [];
      }
      seenIds.add(actorId);

      const lifeBefore = finiteLife(actor.life, actorId, diagnostics);
      const lifeMax = positiveMax(actor.lifeMax, actorId, diagnostics);
      const eligible = actorId === input.winnerId &&
        lifeBefore > 0 &&
        timeTicks > 0 &&
        input.matchOver !== true;
      const recoveryAmount = eligible
        ? Math.trunc((lifeMax * timeTicks / 60) * rate)
        : 0;

      return [{
        actorId,
        lifeBefore,
        lifeAfter: clamp(lifeBefore + recoveryAmount, 0, lifeMax),
        recoveryAmount,
        eligible,
      } satisfies RuntimeTurnsRecoveryState];
    });

    return {
      schema: RUNTIME_TURNS_RECOVERY_SCHEMA,
      ...(input.winnerId === undefined ? {} : { winnerId: input.winnerId }),
      timeTicks,
      rate,
      states,
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }
}

function finiteLife(value: number, actorId: string, diagnostics: string[]): number {
  if (!Number.isFinite(value)) {
    diagnostics.push(`invalid-life:${actorId}`);
    return 0;
  }
  return Math.max(0, value);
}

function positiveMax(value: number | undefined, actorId: string, diagnostics: string[]): number {
  if (value === undefined) return 1000;
  if (!Number.isFinite(value) || value <= 0) {
    diagnostics.push(`invalid-life-max:${actorId}`);
    return 1000;
  }
  return value;
}

function nonNegativeInteger(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function nonNegativeFinite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
