export type RuntimeOpponentSelectionRuntime = {
  pos: { x: number; y: number };
};

export type RuntimeOpponentSelectionActor = {
  runtime: RuntimeOpponentSelectionRuntime;
};

export type RuntimeOpponentRosterActor<TRuntime extends RuntimeOpponentSelectionRuntime = RuntimeOpponentSelectionRuntime> = {
  id?: string;
  runtime: TRuntime;
};

export type RuntimeOpponentRosterEntry<TRuntime extends RuntimeOpponentSelectionRuntime = RuntimeOpponentSelectionRuntime> = {
  id?: string;
  state: TRuntime;
};

export class RuntimeOpponentSelectionWorld {
  orderByNearest<TActor extends RuntimeOpponentSelectionActor>(actor: TActor, opponents: readonly TActor[]): readonly TActor[] {
    return this.orderRuntimeContainersByNearest(actor, opponents);
  }

  buildOpponentRoster<
    TRuntime extends RuntimeOpponentSelectionRuntime,
    TActor extends RuntimeOpponentRosterActor<TRuntime>,
  >(actor: RuntimeOpponentSelectionActor, opponents: readonly TActor[]): readonly RuntimeOpponentRosterEntry<TRuntime>[] {
    return opponents
      .map((opponent, order) => ({
        opponent,
        order,
        distance: this.bodyDistanceX(actor, opponent),
      }))
      .sort((left, right) => left.distance - right.distance || left.order - right.order)
      .map(({ opponent }) => ({
        ...(opponent.id !== undefined ? { id: opponent.id } : {}),
        state: opponent.runtime,
      }));
  }

  orderRuntimeStatesByNearest<TState extends RuntimeOpponentSelectionRuntime>(
    actor: RuntimeOpponentSelectionRuntime,
    opponents: readonly TState[],
  ): readonly TState[] {
    return opponents
      .map((opponent, order) => ({
        opponent,
        order,
        distance: this.bodyDistanceX(actor, opponent),
      }))
      .sort((left, right) => left.distance - right.distance || left.order - right.order)
      .map((entry) => entry.opponent);
  }

  bodyDistanceX(actor: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime, opponent: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime): number {
    return runtimeOpponentBodyDistanceX(actor, opponent);
  }

  private orderRuntimeContainersByNearest<TActor extends RuntimeOpponentSelectionActor>(
    actor: TActor,
    opponents: readonly TActor[],
  ): readonly TActor[] {
    return opponents
      .map((opponent, order) => ({
        opponent,
        order,
        distance: this.bodyDistanceX(actor, opponent),
      }))
      .sort((left, right) => left.distance - right.distance || left.order - right.order)
      .map((entry) => entry.opponent);
  }
}

export function runtimeOpponentBodyDistanceX(
  actor: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime,
  opponent: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime,
): number {
  const actorRuntime = runtimeOpponentSelectionRuntime(actor);
  const opponentRuntime = runtimeOpponentSelectionRuntime(opponent);
  const delta = Math.abs(opponentRuntime.pos.x - actorRuntime.pos.x);
  const bodyDistance = Math.max(0, delta - 48);
  return Number.isFinite(bodyDistance) ? bodyDistance : Number.POSITIVE_INFINITY;
}

function runtimeOpponentSelectionRuntime(input: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime): RuntimeOpponentSelectionRuntime {
  return "runtime" in input ? input.runtime : input;
}
