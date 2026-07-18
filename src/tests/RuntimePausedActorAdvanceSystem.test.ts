import { describe, expect, it } from "vitest";
import { RuntimeActorRunOrderWorld, type RuntimeActorRunOrderCandidate } from "../mugen/runtime/RuntimeActorRunOrderSystem";
import { RuntimePausedActorAdvanceWorld } from "../mugen/runtime/RuntimePausedActorAdvanceSystem";
import type { RuntimeMatchPause } from "../mugen/runtime/PauseSystem";

type Root = { id: string; movable: boolean };
type Helper = { id: string; movable: boolean; runOrder?: number };

describe("RuntimePausedActorAdvanceWorld", () => {
  it("advances every eligible root and helper in prepared actor order", () => {
    const calls: string[] = [];
    const p1 = root("p1", true);
    const p2 = root("p2", true);
    const helper = { id: "helper", movable: true };
    const orderWorld = new RuntimeActorRunOrderWorld();
    const pause = runtimePause();

    const result = new RuntimePausedActorAdvanceWorld(orderWorld).advance({
      pause,
      runOrder: orderWorld.order("ikemen-go", [
        rootCandidate(p2, 2, "A"),
        helperCandidate(helper, 3, "A"),
        rootCandidate(p1, 1, "I"),
      ]),
      canAdvanceRoot: (actor) => actor.movable,
      advanceRoot: (actor) => calls.push(`root:${actor.id}`),
      consumeRootMoveTime: (actor) => calls.push(`consume:${actor.id}`),
      canAdvanceHelper: (actor) => actor.movable,
      advanceHelper: (actor, type) => calls.push(`helper:${actor.id}:${type}`),
      discoverHelpers: () => [helperCandidate(helper, 3, "A")],
      currentPause: () => pause,
      finalizePresentation: (roots) => calls.push(`presentation:${roots.map((actor) => actor.id).join(",")}`),
      tickPause: () => {
        calls.push("tick");
        return pause;
      },
    });

    expect(calls).toEqual([
      "root:p2",
      "consume:p2",
      "helper:helper:Pause",
      "root:p1",
      "consume:p1",
      "presentation:p2,p1",
      "tick",
    ]);
    expect(result).toEqual({ movedRoots: [p2, p1], movedHelpers: 1, interrupted: false, ticked: true });
  });

  it("appends a newly spawned movable helper later in the same paused tick", () => {
    const calls: string[] = [];
    const p1 = root("p1", true);
    const spawned = { id: "spawned", movable: true };
    const helpers: Helper[] = [];
    const orderWorld = new RuntimeActorRunOrderWorld();
    const pause = runtimePause();

    const result = new RuntimePausedActorAdvanceWorld(orderWorld).advance({
      pause,
      runOrder: orderWorld.order("ikemen-go", [rootCandidate(p1, 1, "I")]),
      canAdvanceRoot: () => true,
      advanceRoot: () => {
        calls.push("root:p1");
        helpers.push(spawned);
      },
      consumeRootMoveTime: () => undefined,
      canAdvanceHelper: (helper) => helper.movable,
      advanceHelper: (helper) => calls.push(`helper:${helper.id}:${helper.runOrder}`),
      discoverHelpers: () => helpers.map((helper) => helperCandidate(helper, 3, "I")),
      currentPause: () => pause,
      finalizePresentation: () => undefined,
      tickPause: () => pause,
    });

    expect(calls).toEqual(["root:p1", "helper:spawned:2"]);
    expect(result.movedHelpers).toBe(1);
  });

  it("stops before presentation and timer tick when an actor replaces the pause", () => {
    const p1 = root("p1", true);
    const pause = runtimePause();
    const replacement = { ...pause, actorId: "p2" };
    let current = pause;
    const calls: string[] = [];
    const orderWorld = new RuntimeActorRunOrderWorld();

    const result = new RuntimePausedActorAdvanceWorld(orderWorld).advance({
      pause,
      runOrder: orderWorld.order("ikemen-go", [rootCandidate(p1, 1, "I")]),
      canAdvanceRoot: () => true,
      advanceRoot: () => {
        calls.push("root");
        current = replacement;
      },
      consumeRootMoveTime: () => calls.push("consume"),
      canAdvanceHelper: () => false,
      advanceHelper: () => undefined,
      discoverHelpers: () => [],
      currentPause: () => current,
      finalizePresentation: () => calls.push("presentation"),
      tickPause: () => {
        calls.push("tick");
        return current;
      },
    });

    expect(calls).toEqual(["root", "consume"]);
    expect(result).toEqual({ movedRoots: [p1], movedHelpers: 0, interrupted: true, ticked: false });
  });

  it("runs the pause-immune root hook for frozen roots without advancing normal state", () => {
    const calls: string[] = [];
    const frozen = root("frozen", false);
    const pause = runtimePause();
    const orderWorld = new RuntimeActorRunOrderWorld();

    const result = new RuntimePausedActorAdvanceWorld(orderWorld).advance({
      pause,
      runOrder: orderWorld.order("ikemen-go", [rootCandidate(frozen, 1, "A")]),
      canAdvanceRoot: (actor) => actor.movable,
      advancePauseImmuneRoot: (actor) => calls.push(`immune:${actor.id}`),
      advanceRoot: (actor) => calls.push(`root:${actor.id}`),
      consumeRootMoveTime: (actor) => calls.push(`consume:${actor.id}`),
      canAdvanceHelper: () => false,
      advanceHelper: () => undefined,
      discoverHelpers: () => [],
      currentPause: () => pause,
      finalizePresentation: (roots) => calls.push(`presentation:${roots.length}`),
      tickPause: () => pause,
    });

    expect(calls).toEqual(["immune:frozen", "presentation:0"]);
    expect(result).toEqual({ movedRoots: [], movedHelpers: 0, interrupted: false, ticked: true });
  });
});

function root(id: string, movable: boolean): Root {
  return { id, movable };
}

function rootCandidate(root: Root, runOrderId: number, moveType: "I" | "A"): RuntimeActorRunOrderCandidate<Root, Helper> {
  return { kind: "root", key: `root:${root.id}`, runOrderId, moveType, value: root, stamp: () => undefined };
}

function helperCandidate(
  helper: Helper,
  runOrderId: number,
  moveType: "I" | "A",
): RuntimeActorRunOrderCandidate<Root, Helper> {
  return {
    kind: "helper",
    key: `helper:${helper.id}`,
    runOrderId,
    moveType,
    value: helper,
    stamp: (runOrder) => {
      helper.runOrder = runOrder;
    },
  };
}

function runtimePause(): RuntimeMatchPause {
  return {
    type: "Pause",
    remaining: 4,
    moveTime: 2,
    actorId: "p1",
    darken: false,
    sourceStateNo: 200,
    startedAt: 1,
  };
}
