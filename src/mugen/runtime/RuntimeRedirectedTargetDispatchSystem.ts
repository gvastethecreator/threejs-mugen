import type { RuntimeTargetWorld } from "./TargetSystem";

export type RuntimeRedirectedTargetDispatchPhase = "root-active" | "root-state-minus-one" | "helper";

export type RuntimeRedirectedTargetDispatchLeaseStatus = "open" | "executing" | "committed" | "aborted";

export type RuntimeRedirectedTargetDispatchLease<TActor extends { id: string }> = {
  readonly phase: RuntimeRedirectedTargetDispatchPhase;
  readonly callerId: string;
  readonly redirectExpression: string;
  readonly redirectPlayerId: number;
  readonly destination: TActor;
  readonly destinationId: string;
  readonly stateOwnerId: string;
  readonly destinationRevision: string;
  readonly destinationGeneration: string;
  readonly candidateTargets: readonly TActor[];
  readonly targetWorld: RuntimeTargetWorld;
  readonly status: RuntimeRedirectedTargetDispatchLeaseStatus;
  isFresh(): boolean;
  abort(): void;
};

export type RuntimeRedirectedTargetDispatchResolveOptions<TActor extends { id: string }> = {
  phase: RuntimeRedirectedTargetDispatchPhase;
  callerId: string;
  redirectExpression: string;
  redirectPlayerId: number;
  destination?: TActor;
  candidateTargets: readonly TActor[];
  targetWorld: RuntimeTargetWorld;
  stateOwnerId?: string;
  destinationRevision?: string;
  destinationGeneration?: string;
  resolveCurrentDestination: () => TActor | undefined;
  resolveCurrentDestinationGeneration?: () => string | undefined;
  isDestinationLive?: (destination: TActor) => boolean;
  isDestinationSupported?: (destination: TActor) => boolean;
};

export type RuntimeRedirectedTargetDispatchFailure =
  | "invalid-player-id"
  | "missing-destination"
  | "stale-destination"
  | "unsupported-destination";

export type RuntimeRedirectedTargetDispatchResolutionFailure = {
  kind: "rejected";
  failure: {
    code: RuntimeRedirectedTargetDispatchFailure;
    phase: RuntimeRedirectedTargetDispatchPhase;
    callerId: string;
    redirectPlayerId: number;
    destinationId?: string;
    destinationRevision?: string;
    reason: string;
  };
};

export type RuntimeRedirectedTargetDispatchResolveResult<TActor extends { id: string }> =
  | { kind: "resolved"; lease: RuntimeRedirectedTargetDispatchLease<TActor> }
  | RuntimeRedirectedTargetDispatchResolutionFailure;

export type RuntimeRedirectedTargetDispatchExecuteResult<TResult> = {
  executed: boolean;
  value?: TResult;
};

export type RuntimeRedirectedTargetDispatchCommit<TActor extends { id: string }, TResult> = (
  lease: RuntimeRedirectedTargetDispatchLease<TActor>,
  value: TResult,
) => void;

const leaseStatus = new WeakMap<object, RuntimeRedirectedTargetDispatchLeaseStatus>();

export class RuntimeRedirectedTargetDispatchWorld {
  resolveResult<TActor extends { id: string }>(
    options: RuntimeRedirectedTargetDispatchResolveOptions<TActor>,
  ): RuntimeRedirectedTargetDispatchResolveResult<TActor> {
    const reject = (
      code: RuntimeRedirectedTargetDispatchFailure,
      reason: string,
      destination?: TActor,
    ): RuntimeRedirectedTargetDispatchResolutionFailure => ({
      kind: "rejected",
      failure: {
        code,
        phase: options.phase,
        callerId: options.callerId,
        redirectPlayerId: options.redirectPlayerId,
        ...(destination ? { destinationId: destination.id } : {}),
        ...(options.destinationRevision === undefined ? {} : { destinationRevision: options.destinationRevision }),
        reason,
      },
    });

    if (!Number.isInteger(options.redirectPlayerId) || options.redirectPlayerId < 0) {
      return reject("invalid-player-id", "Redirect player id must be a non-negative integer");
    }
    const destination = options.destination;
    const currentDestination = options.resolveCurrentDestination();
    if (!destination || !currentDestination) {
      return reject("missing-destination", "Redirect destination is not live");
    }
    const destinationGeneration = options.destinationGeneration ?? options.destinationRevision ?? destination.id;
    const currentGeneration = options.resolveCurrentDestinationGeneration?.();
    if (
      currentDestination !== destination ||
      options.isDestinationLive?.(destination) === false ||
      (currentGeneration !== undefined && currentGeneration !== destinationGeneration)
    ) {
      return reject("stale-destination", "Redirect destination identity or generation is stale", destination);
    }
    if (options.isDestinationSupported?.(destination) === false) {
      return reject("unsupported-destination", "Redirect destination is not supported by this dispatch route", destination);
    }

    const candidateTargets = [...new Map(
      options.candidateTargets
        .filter((candidate) => candidate.id !== destination.id)
        .map((candidate) => [candidate.id, candidate] as const),
    ).values()];
    const lease: RuntimeRedirectedTargetDispatchLease<TActor> = {
      phase: options.phase,
      callerId: options.callerId,
      redirectExpression: options.redirectExpression,
      redirectPlayerId: options.redirectPlayerId,
      destination,
      destinationId: destination.id,
      stateOwnerId: options.stateOwnerId ?? destination.id,
      destinationRevision: options.destinationRevision ?? destination.id,
      destinationGeneration,
      candidateTargets: Object.freeze(candidateTargets),
      targetWorld: options.targetWorld,
      get status() {
        return leaseStatus.get(lease) ?? "aborted";
      },
      isFresh: () => {
        const currentGeneration = options.resolveCurrentDestinationGeneration?.();
        return (
          (lease.status === "open" || lease.status === "executing") &&
          options.resolveCurrentDestination() === destination &&
          options.isDestinationLive?.(destination) !== false &&
          (currentGeneration === undefined || currentGeneration === destinationGeneration)
        );
      },
      abort: () => {
        if (lease.status === "open" || lease.status === "executing") setLeaseStatus(lease, "aborted");
      },
    };
    setLeaseStatus(lease, "open");
    return { kind: "resolved", lease };
  }

  resolve<TActor extends { id: string }>(
    options: RuntimeRedirectedTargetDispatchResolveOptions<TActor>,
  ): RuntimeRedirectedTargetDispatchLease<TActor> | undefined {
    const result = this.resolveResult(options);
    return result.kind === "resolved" ? result.lease : undefined;
  }

  execute<TActor extends { id: string }, TResult>(
    lease: RuntimeRedirectedTargetDispatchLease<TActor>,
    operation: (lease: RuntimeRedirectedTargetDispatchLease<TActor>) => TResult,
    commit?: RuntimeRedirectedTargetDispatchCommit<TActor, TResult>,
  ): RuntimeRedirectedTargetDispatchExecuteResult<TResult> {
    if (!lease.isFresh()) {
      lease.abort();
      return { executed: false };
    }
    setLeaseStatus(lease, "executing");
    try {
      const value = operation(lease);
      if (!lease.isFresh()) {
        lease.abort();
        return { executed: false };
      }
      commit?.(lease, value);
      if (!lease.isFresh()) {
        lease.abort();
        return { executed: false };
      }
      setLeaseStatus(lease, "committed");
      return { executed: true, value };
    } catch (error) {
      lease.abort();
      throw error;
    }
  }
}

function setLeaseStatus<TActor extends { id: string }>(
  lease: RuntimeRedirectedTargetDispatchLease<TActor>,
  status: RuntimeRedirectedTargetDispatchLeaseStatus,
): void {
  leaseStatus.set(lease, status);
}
