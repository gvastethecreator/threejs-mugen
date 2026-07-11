import { describe, expect, it } from "vitest";
import { RuntimeActorRunOrderWorld, type RuntimeActorRunOrderCandidate } from "../mugen/runtime/RuntimeActorRunOrderSystem";
import { RuntimeMatchActorAdvanceWorld } from "../mugen/runtime/RuntimeMatchActorAdvanceSystem";

type Root = { id: string };
type Helper = { id: string; runOrder?: number };

describe("RuntimeMatchActorAdvanceWorld", () => {
  it("prepares roots first, then advances the unified actor list sequentially", () => {
    const calls: string[] = [];
    const p1 = { id: "p1" };
    const p2 = { id: "p2" };
    const helper = { id: "helper" };
    const runOrderWorld = new RuntimeActorRunOrderWorld();

    new RuntimeMatchActorAdvanceWorld(runOrderWorld).advance({
      runOrder: runOrderWorld.order("ikemen-go", [
        rootCandidate(p1, 1, "I"),
        rootCandidate(p2, 2, "A"),
        helperCandidate(helper, 3, "A"),
      ]),
      opponentOf: (root) => (root === p1 ? p2 : p1),
      participationOf: () => "playable",
      applyAutoGuardStart: (root, opponent, checkpoint) => calls.push(`guard:${checkpoint}:${root.id}:${opponent.id}`),
      advanceRoot: (root, opponent) => calls.push(`root:${root.id}:${opponent.id}`),
      advanceHelper: (actor) => calls.push(`helper:${actor.id}`),
      discoverHelpers: () => [helperCandidate(helper, 3, "A")],
    });

    expect(calls).toEqual([
      "guard:pre:p2:p1",
      "guard:pre:p1:p2",
      "root:p2:p1",
      "guard:post:p2:p1",
      "helper:helper",
      "root:p1:p2",
      "guard:post:p1:p2",
    ]);
  });

  it("advances a newly discovered helper later in the same tick", () => {
    const calls: string[] = [];
    const p1 = { id: "p1" };
    const p2 = { id: "p2" };
    const spawned = { id: "spawned" };
    const helpers: Helper[] = [];
    const runOrderWorld = new RuntimeActorRunOrderWorld();

    const result = new RuntimeMatchActorAdvanceWorld(runOrderWorld).advance({
      runOrder: runOrderWorld.order("ikemen-go", [rootCandidate(p1, 1, "I"), rootCandidate(p2, 2, "I")]),
      opponentOf: (root) => (root === p1 ? p2 : p1),
      participationOf: () => "playable",
      applyAutoGuardStart: () => undefined,
      advanceRoot: (root) => {
        calls.push(`root:${root.id}`);
        if (root === p1) helpers.push(spawned);
      },
      advanceHelper: (helper) => calls.push(`helper:${helper.id}:${helper.runOrder}`),
      discoverHelpers: () => helpers.map((helper) => helperCandidate(helper, 3, "A")),
    });

    expect(calls).toEqual(["root:p1", "root:p2", "helper:spawned:3"]);
    expect(result.entries.map((entry) => entry.value.id)).toEqual(["p1", "p2", "spawned"]);
  });

  it("advances standby roots without auto-guard ownership", () => {
    const calls: string[] = [];
    const p1 = { id: "p1" };
    const p2 = { id: "p2" };
    const p3 = { id: "p3" };
    const runOrderWorld = new RuntimeActorRunOrderWorld();

    new RuntimeMatchActorAdvanceWorld(runOrderWorld).advance({
      runOrder: runOrderWorld.order("ikemen-go", [
        rootCandidate(p1, 1, "I"),
        rootCandidate(p2, 2, "I"),
        rootCandidate(p3, 3, "I"),
      ]),
      opponentOf: (root) => root === p2 ? p1 : p2,
      participationOf: (root) => root === p3 ? "standby" : "playable",
      applyAutoGuardStart: (root, _opponent, checkpoint) => calls.push(`guard:${checkpoint}:${root.id}`),
      advanceRoot: (root, _opponent, participation) => calls.push(`root:${root.id}:${participation}`),
      advanceHelper: () => undefined,
      discoverHelpers: () => [],
    });

    expect(calls).toEqual([
      "guard:pre:p1",
      "guard:pre:p2",
      "root:p1:playable",
      "guard:post:p1",
      "root:p2:playable",
      "guard:post:p2",
      "root:p3:standby",
    ]);
  });
});

function rootCandidate(root: Root, runOrderId: number, moveType: "I" | "A" | "H"): RuntimeActorRunOrderCandidate<Root, Helper> {
  return { kind: "root", key: `root:${root.id}`, runOrderId, moveType, value: root, stamp: () => undefined };
}

function helperCandidate(
  helper: Helper,
  runOrderId: number,
  moveType: "I" | "A" | "H",
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
