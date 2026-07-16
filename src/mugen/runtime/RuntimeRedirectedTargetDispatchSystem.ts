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
  resolveCurrentDestination: () => TActor | undefined;
  isDestinationLive?: (destination: TActor) => boolean;
};

export type RuntimeRedirectedTargetDispatchFailure = "invalid-player-id" | "missing-destination" | "stale-destination";

export type RuntimeRedirectedTargetDispatchExecuteResult<TResult> = {
  executed: boolean;
  value?: TResult;
};

const leaseStatus = new WeakMap<object, RuntimeRedirectedTargetDispatchLeaseStatus>();

export class RuntimeRedirectedTargetDispatchWorld {
  resolve<TActor extends { id: string }>(
    options: RuntimeRedirectedTargetDispatchResolveOptions<TActor>,
  ): RuntimeRedirectedTargetDispatchLease<TActor> | undefined {
    if (!Number.isInteger(options.redirectPlayerId) || options.redirectPlayerId < 0) {
      return undefined;
    }
    const destination = options.destination;
    const currentDestination = options.resolveCurrentDestination();
    if (!destination || !currentDestination) {
      return undefined;
    }
    if (currentDestination !== destination || options.isDestinationLive?.(destination) === false) {
      return undefined;
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
      candidateTargets: Object.freeze(candidateTargets),
      targetWorld: options.targetWorld,
      get status() {
        return leaseStatus.get(lease) ?? "aborted";
      },
      isFresh: () =>
        lease.status === "open" &&
        options.resolveCurrentDestination() === destination &&
        options.isDestinationLive?.(destination) !== false,
      abort: () => {
        if (lease.status === "open" || lease.status === "executing") setLeaseStatus(lease, "aborted");
      },
    };
    setLeaseStatus(lease, "open");
    return lease;
  }

  execute<TActor extends { id: string }, TResult>(
    lease: RuntimeRedirectedTargetDispatchLease<TActor>,
    operation: (lease: RuntimeRedirectedTargetDispatchLease<TActor>) => TResult,
  ): RuntimeRedirectedTargetDispatchExecuteResult<TResult> {
    if (!lease.isFresh()) {
      lease.abort();
      return { executed: false };
    }
    setLeaseStatus(lease, "executing");
    try {
      const value = operation(lease);
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
