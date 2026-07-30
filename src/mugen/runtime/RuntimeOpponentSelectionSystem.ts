export type RuntimeOpponentSelectionRuntime = {
  pos: { x: number; y: number };
  facing?: 1 | -1;
  combatDepth?: { position?: number };
};

export type RuntimeOpponentSelectionActor = {
  id?: string;
  playerId?: number;
  playerNo?: number;
  runtime: RuntimeOpponentSelectionRuntime;
};

export type RuntimeP2SelectionOptions = {
  /** Mirrors Ikemen's sys.zEnabled gate; omitted means X-only. */
  zEnabled?: boolean;
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
  private readonly p2SelectionCache = new WeakMap<object, P2SelectionCacheEntry>();

  orderByNearest<TActor extends RuntimeOpponentSelectionActor>(actor: TActor, opponents: readonly TActor[]): readonly TActor[] {
    return this.orderRuntimeContainersByNearest(actor, opponents);
  }

  /**
   * Selects the source-shaped P2 candidate from an already filtered roster.
   * The roster's domain (Enemy/P2 eligibility) is owned by the caller; this
   * boundary only applies nearest-body ordering and the stable input-order tie
   * break used by the runtime opponent list.
   */
  selectNearest<TActor extends RuntimeOpponentSelectionActor>(
    actor: TActor,
    opponents: readonly TActor[],
  ): TActor | undefined {
    return this.orderRuntimeContainersByNearest(actor, opponents)[0];
  }

  /**
   * Orders an already filtered P2 roster using Ikemen's relative X/facing
   * distance policy. It intentionally remains separate from EnemyNear's
   * legacy body-distance order and caches only this P2 result.
   */
  orderP2ByNearest<TActor extends RuntimeOpponentSelectionActor>(
    actor: TActor,
    opponents: readonly TActor[],
    options: RuntimeP2SelectionOptions = {},
  ): readonly TActor[] {
    const signature = runtimeOpponentP2SelectionSignature(actor, opponents, options);
    const cached = this.p2SelectionCache.get(actor);
    const sameCandidates = cached?.candidates.length === opponents.length &&
      cached.candidates.every((candidate, index) => candidate === opponents[index]);
    if (cached?.signature === signature && sameCandidates) {
      return cached.ordered as readonly TActor[];
    }
    const ordered = this.orderRuntimeContainersByP2Nearest(actor, opponents, options);
    this.p2SelectionCache.set(actor, { signature, candidates: opponents, ordered });
    return ordered;
  }

  selectP2Nearest<TActor extends RuntimeOpponentSelectionActor>(
    actor: TActor,
    opponents: readonly TActor[],
    options: RuntimeP2SelectionOptions = {},
  ): TActor | undefined {
    return this.orderP2ByNearest(actor, opponents, options)[0];
  }

  p2Distance(
    actor: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime,
    opponent: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime,
    options: RuntimeP2SelectionOptions = {},
  ): number {
    return runtimeOpponentP2Distance(actor, opponent, options);
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

  private orderRuntimeContainersByP2Nearest<TActor extends RuntimeOpponentSelectionActor>(
    actor: TActor,
    opponents: readonly TActor[],
    options: RuntimeP2SelectionOptions,
  ): readonly TActor[] {
    return opponents
      .map((opponent, order) => ({
        opponent,
        order,
        distance: this.p2Distance(actor, opponent, options),
      }))
      .sort((left, right) =>
        compareRuntimeP2Distance(left.distance, right.distance) ||
        compareRuntimeP2Identity(left.opponent, right.opponent) ||
        left.order - right.order,
      )
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

export function runtimeOpponentP2Distance(
  actor: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime,
  opponent: RuntimeOpponentSelectionActor | RuntimeOpponentSelectionRuntime,
  options: RuntimeP2SelectionOptions = {},
): number {
  const actorRuntime = runtimeOpponentSelectionRuntime(actor);
  const opponentRuntime = runtimeOpponentSelectionRuntime(opponent);
  const actorX = actorRuntime.pos.x;
  const opponentX = opponentRuntime.pos.x;
  const facing = actorRuntime.facing === -1 ? -1 : 1;
  const distX = (opponentX - actorX) * facing;

  let distance = distX;
  if (distX < 0) {
    distance -= 30;
  }

  if (options.zEnabled) {
    // Ikemen's source applies the behind penalty before replacing the scalar
    // with hypot(distX, distZ); preserve that observable ordering.
    const distZ = (runtimeOpponentDepth(opponentRuntime) - runtimeOpponentDepth(actorRuntime)) * 16;
    distance = Math.hypot(distX, distZ);
  }

  const absoluteDistance = Math.abs(distance);
  return Number.isFinite(absoluteDistance) ? absoluteDistance : Number.POSITIVE_INFINITY;
}

type P2SelectionCacheEntry = {
  signature: string;
  candidates: readonly RuntimeOpponentSelectionActor[];
  ordered: readonly RuntimeOpponentSelectionActor[];
};

function runtimeOpponentP2SelectionSignature(
  actor: RuntimeOpponentSelectionActor,
  opponents: readonly RuntimeOpponentSelectionActor[],
  options: RuntimeP2SelectionOptions,
): string {
  const actorRuntime = runtimeOpponentSelectionRuntime(actor);
  return [
    options.zEnabled === true ? "z" : "x",
    runtimeOpponentDistanceSignature(actorRuntime),
    ...opponents.map((opponent, index) => {
      const runtime = runtimeOpponentSelectionRuntime(opponent);
      return [index, runtimeOpponentIdentitySignature(opponent), runtimeOpponentDistanceSignature(runtime)].join(":");
    }),
  ].join("|");
}

function runtimeOpponentDistanceSignature(runtime: RuntimeOpponentSelectionRuntime): string {
  return [runtime.pos.x, runtime.facing ?? 1, runtimeOpponentDepth(runtime)].join(",");
}

function runtimeOpponentDepth(runtime: RuntimeOpponentSelectionRuntime): number {
  const position = runtime.combatDepth?.position;
  return position !== undefined && Number.isFinite(position) ? position : 0;
}

function runtimeOpponentIdentitySignature(actor: RuntimeOpponentSelectionActor): string {
  return [actor.playerNo ?? "", actor.playerId ?? "", actor.id ?? ""].join(",");
}

function compareRuntimeP2Distance(left: number, right: number): number {
  if (left === right) return 0;
  if (!Number.isFinite(left)) return 1;
  if (!Number.isFinite(right)) return -1;
  return left < right ? -1 : 1;
}

function compareRuntimeP2Identity(
  left: RuntimeOpponentSelectionActor,
  right: RuntimeOpponentSelectionActor,
): number {
  const playerNoComparison = compareOptionalRuntimeNumber(left.playerNo, right.playerNo);
  if (playerNoComparison !== 0) return playerNoComparison;
  const playerIdComparison = compareOptionalRuntimeNumber(left.playerId, right.playerId);
  if (playerIdComparison !== 0) return playerIdComparison;
  if (left.id !== undefined && right.id !== undefined && left.id !== right.id) {
    return left.id < right.id ? -1 : 1;
  }
  return 0;
}

function compareOptionalRuntimeNumber(left: number | undefined, right: number | undefined): number {
  if (left === undefined || !Number.isFinite(left)) return right === undefined || !Number.isFinite(right) ? 0 : 1;
  if (right === undefined || !Number.isFinite(right)) return -1;
  return left === right ? 0 : left < right ? -1 : 1;
}
