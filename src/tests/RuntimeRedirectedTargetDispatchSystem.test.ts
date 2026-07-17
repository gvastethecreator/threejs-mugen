import { describe, expect, it } from "vitest";
import { RuntimeRedirectedTargetDispatchWorld } from "../mugen/runtime/RuntimeRedirectedTargetDispatchSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";

describe("RuntimeRedirectedTargetDispatchWorld", () => {
  it("leases a live destination with a frozen candidate projection and commits synchronously", () => {
    const world = new RuntimeRedirectedTargetDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const destination = { id: "p2" };
    const selected = { id: "p1" };
    const duplicate = { id: "p1" };
    let currentDestination = destination;
    const lease = world.resolve({
      phase: "root-active",
      callerId: "p1",
      redirectExpression: "57",
      redirectPlayerId: 57,
      destination,
      candidateTargets: [destination, selected, duplicate],
      targetWorld,
      stateOwnerId: "p2",
      destinationRevision: "57:p2",
      resolveCurrentDestination: () => currentDestination,
    });

    expect(lease).toMatchObject({
      callerId: "p1",
      destinationId: "p2",
      stateOwnerId: "p2",
      destinationRevision: "57:p2",
      destinationGeneration: "57:p2",
      status: "open",
    });
    expect(lease?.candidateTargets).toEqual([selected]);
    expect(Object.isFrozen(lease?.candidateTargets)).toBe(true);

    const seen: string[] = [];
    const result = world.execute(lease!, (activeLease) => {
      seen.push(activeLease.destination.id, ...activeLease.candidateTargets.map(({ id }) => id));
      return activeLease.destinationId;
    });

    expect(result).toEqual({ executed: true, value: "p2" });
    expect(seen).toEqual(["p2", "p1"]);
    expect(lease?.status).toBe("committed");
    expect(lease?.isFresh()).toBe(false);
    currentDestination = { id: "p2" };
    expect(lease?.isFresh()).toBe(false);
  });

  it("fails closed for stale or explicitly aborted destinations before executing", () => {
    const world = new RuntimeRedirectedTargetDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const destination = { id: "p2" };
    let currentDestination = destination;
    const lease = world.resolve({
      phase: "root-state-minus-one",
      callerId: "p1",
      redirectExpression: "57",
      redirectPlayerId: 57,
      destination,
      candidateTargets: [{ id: "p1" }],
      targetWorld,
      resolveCurrentDestination: () => currentDestination,
    });
    expect(lease).toBeDefined();

    currentDestination = { id: "p2" };
    let executed = false;
    expect(world.execute(lease!, () => {
      executed = true;
      return true;
    })).toEqual({ executed: false });
    expect(executed).toBe(false);
    expect(lease?.status).toBe("aborted");

    const aborted = world.resolve({
      phase: "root-active",
      callerId: "p1",
      redirectExpression: "57",
      redirectPlayerId: 57,
      destination,
      candidateTargets: [],
      targetWorld,
      resolveCurrentDestination: () => destination,
    });
    aborted?.abort();
    expect(world.execute(aborted!, () => true)).toEqual({ executed: false });
    expect(aborted?.status).toBe("aborted");
  });

  it("returns typed resolution failures and rejects stale generations or unsupported destinations", () => {
    const world = new RuntimeRedirectedTargetDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const destination = { id: "p2" };
    let generation = "p2:g1";
    const base = {
      phase: "root-active" as const,
      callerId: "p1",
      redirectExpression: "57",
      redirectPlayerId: 57,
      destination,
      candidateTargets: [{ id: "p1" }],
      targetWorld,
      destinationRevision: "57:p2",
      destinationGeneration: "p2:g1",
      resolveCurrentDestination: () => destination,
      resolveCurrentDestinationGeneration: () => generation,
    };

    const resolved = world.resolveResult(base);
    expect(resolved).toMatchObject({ kind: "resolved", lease: { destinationGeneration: "p2:g1" } });
    if (resolved.kind === "resolved") {
      generation = "p2:g2";
      expect(resolved.lease.isFresh()).toBe(false);
    }

    const stale = world.resolveResult(base);
    expect(stale).toMatchObject({ kind: "rejected", failure: { code: "stale-destination", destinationId: "p2" } });

    generation = "p2:g1";
    const unsupported = world.resolveResult({ ...base, isDestinationSupported: () => false });
    expect(unsupported).toMatchObject({
      kind: "rejected",
      failure: { code: "unsupported-destination", destinationId: "p2", destinationRevision: "57:p2" },
    });
  });

  it("revalidates freshness before the commit callback and owns commit ordering", () => {
    const world = new RuntimeRedirectedTargetDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const destination = { id: "p2" };
    let generation = "p2:g1";
    const options = {
      phase: "helper" as const,
      callerId: "p1-helper-0",
      redirectExpression: "57",
      redirectPlayerId: 57,
      destination,
      candidateTargets: [{ id: "p1" }],
      targetWorld,
      destinationGeneration: "p2:g1",
      resolveCurrentDestination: () => destination,
      resolveCurrentDestinationGeneration: () => generation,
    };
    const stale = world.resolveResult(options);
    expect(stale.kind).toBe("resolved");
    if (stale.kind !== "resolved") return;

    const committed: string[] = [];
    const staleResult = world.execute(
      stale.lease,
      () => {
        committed.push("operation");
        generation = "p2:g2";
        return "prepared";
      },
      () => committed.push("commit"),
    );
    expect(staleResult).toEqual({ executed: false });
    expect(committed).toEqual(["operation"]);
    expect(stale.lease.status).toBe("aborted");

    generation = "p2:g1";
    const live = world.resolveResult(options);
    expect(live.kind).toBe("resolved");
    if (live.kind === "resolved") {
      const liveEvents: string[] = [];
      expect(world.execute(live.lease, () => {
        liveEvents.push("operation");
        return "prepared";
      }, () => liveEvents.push("commit"))).toEqual({ executed: true, value: "prepared" });
      expect(liveEvents).toEqual(["operation", "commit"]);
    }
  });

  it("carries helper caller, destination store, and state-owner metadata", () => {
    const world = new RuntimeRedirectedTargetDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const destination = { id: "p2-helper-0" };
    const candidate = { id: "p1-helper-target" };
    const lease = world.resolve({
      phase: "helper",
      callerId: "p1-helper-caller",
      redirectExpression: "57",
      redirectPlayerId: 57,
      destination,
      candidateTargets: [destination, candidate],
      targetWorld,
      stateOwnerId: "p2-helper-0",
      destinationRevision: "57:p2-helper-0",
      resolveCurrentDestination: () => destination,
    });

    expect(lease).toMatchObject({
      phase: "helper",
      callerId: "p1-helper-caller",
      destinationId: "p2-helper-0",
      stateOwnerId: "p2-helper-0",
      destinationRevision: "57:p2-helper-0",
      destinationGeneration: "57:p2-helper-0",
      targetWorld,
      status: "open",
    });
    expect(lease?.candidateTargets).toEqual([candidate]);
  });

  it("rejects invalid player ids, missing destinations, and dead destinations", () => {
    const world = new RuntimeRedirectedTargetDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const base = {
      phase: "root-active" as const,
      callerId: "p1",
      redirectExpression: "id",
      candidateTargets: [],
      targetWorld,
      resolveCurrentDestination: () => undefined,
    };

    expect(world.resolve({ ...base, redirectPlayerId: -1, destination: undefined })).toBeUndefined();
    expect(world.resolve({ ...base, redirectPlayerId: 57, destination: undefined })).toBeUndefined();
    expect(world.resolve({
      ...base,
      redirectPlayerId: 57,
      destination: { id: "p2" },
      resolveCurrentDestination: () => ({ id: "p2" }),
      isDestinationLive: () => false,
    })).toBeUndefined();
  });
});
