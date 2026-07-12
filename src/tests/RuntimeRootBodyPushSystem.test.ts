import { describe, expect, it } from "vitest";
import { RuntimeActorConstraintWorld } from "../mugen/runtime/ActorConstraintSystem";
import {
  RuntimeRootBodyPushWorld,
  type RuntimeRootBodyPushActor,
} from "../mugen/runtime/RuntimeRootBodyPushSystem";

describe("RuntimeRootBodyPushWorld", () => {
  it("resolves every eligible Tag pair once in stable root order", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 30), actor("p3", 1, 10)];
    const diagnostic = advance(roots, true);

    expect(diagnostic.rootIds).toEqual(["p1", "p2", "p3"]);
    expect(diagnostic.pairIds).toEqual([["p1", "p2"], ["p1", "p3"], ["p2", "p3"]]);
    expect(diagnostic.movedRootIds).toEqual(["p1", "p2", "p3"]);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-5, 32.5, 12.5]);
  });

  it("filters unavailable Tag roots but keeps over-KO roots eligible", () => {
    const roots = [
      actor("p1", 1, 0),
      actor("p2", 2, 20),
      actor("p3", 1, 10, { standby: true }),
      actor("p4", 2, 10, { disabled: true }),
      actor("p5", null, 10),
      actor("p6", 2, 10, { playerType: false }),
      actor("p7", 1, 30, { overKo: true }),
    ];

    expect(advance(roots, true).rootIds).toEqual(["p1", "p2", "p7"]);
  });

  it("preserves pair mode and actor-local PlayerPush opt-out", () => {
    const roots = [actor("p1", 1, 0, {}, false), actor("p2", 2, 10), actor("p3", 1, 5)];
    const diagnostic = advance(roots, false);

    expect(diagnostic).toMatchObject({ mode: "pair", rootIds: ["p1", "p2"], pairIds: [["p1", "p2"]], movedRootIds: [] });
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([0, 10, 5]);
  });

  it("reclamps moved roots and rejects duplicate identities", () => {
    const roots = [actor("p1", 1, -95), actor("p2", 2, -90)];
    const diagnostic = advance(roots, true);
    expect(diagnostic.movedRootIds).toEqual(["p1", "p2"]);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-100, -82.5]);

    expect(() => advance([roots[0]!, { ...roots[1]!, id: "p1" }], true)).toThrow("Duplicate root body-push actor p1");
  });

  it("selects Z push for depth-dominant overlap and reclamps it", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 1)];
    roots[0]!.runtime.combatDepth = { position: -4, velocity: 0, size: [5, 5], attack: [4, 4] };
    roots[1]!.runtime.combatDepth = { position: 4, velocity: 0, size: [5, 5], attack: [4, 4] };

    const diagnostic = new RuntimeRootBodyPushWorld().advance({
      tagMode: true,
      roots,
      playableRoots: [roots[0]!, roots[1]!],
      stage: { bounds: { left: -100, right: 100 }, depthBounds: { top: -5, bottom: 5 } },
      actorConstraintWorld: new RuntimeActorConstraintWorld(),
    });

    expect(diagnostic.movedRootIds).toEqual(["p1", "p2"]);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([0, 1]);
    expect(roots.map((root) => root.runtime.combatDepth?.position)).toEqual([-5, 5]);
  });

  it("uses localcoord scale when separating depth", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 1)];
    roots[0]!.localCoord = [640, 480];
    roots[0]!.runtime.combatDepth = { position: -8, velocity: 0, size: [10, 10], attack: [4, 4] };
    roots[1]!.runtime.combatDepth = { position: 4, velocity: 0, size: [5, 5], attack: [4, 4] };

    advance(roots, true);

    expect(roots.map((root) => root.runtime.combatDepth?.position)).toEqual([-10, 5]);
  });

  it("falls back to X for equal depth and keeps Z unchanged", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 10)];
    roots[0]!.runtime.combatDepth = { position: 0, velocity: 0, size: [5, 5], attack: [4, 4] };
    roots[1]!.runtime.combatDepth = { position: 0, velocity: 0, size: [5, 5], attack: [4, 4] };

    advance(roots, true);

    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-5, 15]);
    expect(roots.map((root) => root.runtime.combatDepth?.position)).toEqual([0, 0]);
  });

  it("pushes both axes when normalized distances are similar", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 8)];
    roots[0]!.runtime.bodyWidth = { front: 5, back: 5 };
    roots[1]!.runtime.bodyWidth = { front: 5, back: 5 };
    roots[0]!.runtime.combatDepth = { position: 0, velocity: 0, size: [5, 5], attack: [4, 4] };
    roots[1]!.runtime.combatDepth = { position: 8, velocity: 0, size: [5, 5], attack: [4, 4] };

    advance(roots, true);

    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-1, 9]);
    expect(roots.map((root) => root.runtime.combatDepth?.position)).toEqual([-1, 9]);
  });
});

function advance(roots: RuntimeRootBodyPushActor[], tagMode: boolean) {
  return new RuntimeRootBodyPushWorld().advance({
    tagMode,
    roots,
    playableRoots: [roots[0]!, roots[1]!],
    stage: { bounds: { left: -100, right: 100 } },
    actorConstraintWorld: new RuntimeActorConstraintWorld(),
  });
}

function actor(
  id: string,
  side: 1 | 2 | null,
  x: number,
  teamOverrides: Partial<RuntimeRootBodyPushActor["teamState"]> = {},
  playerPush = true,
): RuntimeRootBodyPushActor {
  return {
    id,
    side,
    teamState: { disabled: false, standby: false, overKo: false, playerType: true, ...teamOverrides },
    runtime: { pos: { x, y: 0 }, facing: 1, bodyWidth: { front: 10, back: 10 }, playerPush },
  };
}
