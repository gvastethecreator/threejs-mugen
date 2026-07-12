import { describe, expect, it } from "vitest";
import { RuntimeActorConstraintWorld } from "../mugen/runtime/ActorConstraintSystem";
import {
  RuntimeRootBodyPushWorld,
  resolveRuntimePushSizeBox,
  usesMugenPlayerPushMinimumWidth,
  type RuntimeRootBodyPushActor,
} from "../mugen/runtime/RuntimeRootBodyPushSystem";

describe("RuntimeRootBodyPushWorld", () => {
  it("resolves legacy and IKEMEN state-specific size boxes", () => {
    expect(resolveRuntimePushSizeBox(undefined, "S")).toEqual({ x1: -16, y1: -60, x2: 16, y2: 0 });
    expect(resolveRuntimePushSizeBox({ "size.air.back": 9, "size.air.front": 13, "size.height": 70 }, "A"))
      .toEqual({ x1: -9, y1: -70, x2: 13, y2: 0 });
    expect(resolveRuntimePushSizeBox({
      "size.crouch.sizebox.left": 20, "size.crouch.sizebox.top": 4,
      "size.crouch.sizebox.right": -18, "size.crouch.sizebox.bottom": -50,
    }, "C")).toEqual({ x1: -18, y1: -50, x2: 20, y2: 4 });
  });
  it("resolves every eligible Tag pair once in stable root order", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 10), actor("p3", 1, 5)];
    const diagnostic = advance(roots, true);

    expect(diagnostic.rootIds).toEqual(["p1", "p2", "p3"]);
    expect(diagnostic.pairIds).toEqual([["p1", "p2"], ["p2", "p3"]]);
    expect(diagnostic.movedRootIds).toEqual(["p1", "p2", "p3"]);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-11, 29, -3]);
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
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-100, -76.5]);

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

    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-11, 21]);
    expect(roots.map((root) => root.runtime.combatDepth?.position)).toEqual([0, 0]);
  });

  it("pushes both axes when normalized distances are similar", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 8)];
    roots[0]!.runtime.bodyWidth = { front: 5, back: 5 };
    roots[1]!.runtime.bodyWidth = { front: 5, back: 5 };
    roots[0]!.runtime.combatDepth = { position: 0, velocity: 0, size: [5, 5], attack: [4, 4] };
    roots[1]!.runtime.combatDepth = { position: 8, velocity: 0, size: [5, 5], attack: [4, 4] };

    advance(roots, true);

    expect(roots.map((root) => root.runtime.pos.x)).toEqual([0, 8]);
    expect(roots.map((root) => root.runtime.combatDepth?.position)).toEqual([-1, 9]);
  });

  it("allows same-side push when either actor authors AffectTeam both", () => {
    const roots = [actor("p1", 1, 0), actor("p3", 1, 10)];
    roots[0]!.runtime.pushAffectTeam = 0;

    const diagnostic = advance(roots, true);

    expect(diagnostic.pairIds).toEqual([["p1", "p3"]]);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-11, 21]);
  });

  it("moves only the lower-priority actor", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 10)];
    roots[0]!.runtime.pushPriority = 2;

    advance(roots, true);

    expect(roots.map((root) => root.runtime.pos.x)).toEqual([0, 32]);
  });

  it("weights equal-priority displacement and applies each pushfactor", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 10)];
    roots[0]!.weight = 300;
    roots[0]!.pushFactor = 0.5;
    roots[1]!.weight = 100;
    roots[1]!.pushFactor = 2;

    advance(roots, true);

    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-2.75, 43]);
  });

  it("requires vertical size-box and Clsn2 overlap", () => {
    const vertical = [actor("p1", 1, 0), actor("p2", 2, 10)];
    vertical[1]!.runtime.pos.y = -61;
    expect(advance(vertical, true).pairIds).toEqual([]);
    expect(vertical.map((root) => root.runtime.pos.x)).toEqual([0, 10]);

    const clsn = [actor("p1", 1, 0), actor("p2", 2, 10)];
    clsn[1]!.hurtBoxes = [{ x1: 100, y1: -60, x2: 120, y2: 0 }];
    expect(advance(clsn, true).pairIds).toEqual([]);
    expect(clsn.map((root) => root.runtime.pos.x)).toEqual([0, 10]);
  });

  it("allows SizePushOnly to bypass Clsn2 while retaining size admission", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 10)];
    roots[1]!.hurtBoxes = [];
    roots[0]!.sizePushOnly = true;

    expect(advance(roots, true).pairIds).toEqual([["p1", "p2"]]);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-11, 21]);

    const vertical = [actor("p1", 1, 0), actor("p2", 2, 10)];
    vertical[0]!.sizePushOnly = true;
    vertical[1]!.runtime.pos.y = -61;
    expect(advance(vertical, true).pairIds).toEqual([]);
  });

  it("resolves exact X ties through priority and state/facing policy", () => {
    const fallback = [actor("p1", 1, 0), actor("p2", 2, 0)];
    advance(fallback, true);
    expect(fallback.map((root) => root.runtime.pos.x)).toEqual([16, -16]);

    const priority = [actor("p1", 1, 0), actor("p2", 2, 0)];
    priority[1]!.runtime.pushPriority = 2;
    advance(priority, true);
    expect(priority.map((root) => root.runtime.pos.x)).toEqual([-32, 0]);

    const hit = [actor("p1", 1, 0), actor("p2", 2, 0)];
    hit[0]!.moveType = "H";
    advance(hit, true);
    expect(hit.map((root) => root.runtime.pos.x)).toEqual([-16, 16]);
  });

  it("clamps legacy MUGEN push width to five world units", () => {
    const legacy = [actor("p1", 1, 0), actor("p2", 2, 8)];
    for (const root of legacy) {
      root.runtime.bodyWidth = { front: 1, back: 1 };
      root.sizeBox = { x1: -1, y1: -60, x2: 1, y2: 0 };
      root.mugenMinimumWidth = true;
    }
    advance(legacy, true);
    expect(legacy.map((root) => root.runtime.pos.x)).toEqual([-1, 9]);

    const ikemen = [actor("p1", 1, 0), actor("p2", 2, 8)];
    for (const root of ikemen) {
      root.runtime.bodyWidth = { front: 1, back: 1 };
      root.sizeBox = { x1: -1, y1: -60, x2: 1, y2: 0 };
    }
    advance(ikemen, true);
    expect(ikemen.map((root) => root.runtime.pos.x)).toEqual([0, 8]);

    const scaled = [actor("p1", 1, 0), actor("p2", 2, 16)];
    for (const root of scaled) {
      root.localCoord = [640, 480];
      root.runtime.bodyWidth = { front: 1, back: 1 };
      root.sizeBox = { x1: -1, y1: -60, x2: 1, y2: 0 };
      root.mugenMinimumWidth = true;
    }
    advance(scaled, true);
    expect(scaled.map((root) => root.runtime.pos.x)).toEqual([-2, 18]);
  });

  it("routes only MUGEN-compatible imported versions to the width clamp", () => {
    expect(usesMugenPlayerPushMinimumWidth({ source: "imported" })).toBe(true);
    expect(usesMugenPlayerPushMinimumWidth({ source: "imported", ikemenVersion: "0.0" })).toBe(true);
    expect(usesMugenPlayerPushMinimumWidth({ source: "imported", ikemenVersion: "0, 0" })).toBe(true);
    expect(usesMugenPlayerPushMinimumWidth({ source: "imported", ikemenVersion: "0.99" })).toBe(false);
    expect(usesMugenPlayerPushMinimumWidth({ source: "demo" })).toBe(false);
  });

  it("clamps asymmetric size-box sides before facing-aware separation", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 8)];
    roots[0]!.runtime.bodyWidth = { front: 1, back: 1 };
    roots[0]!.sizeBox = { x1: -9, y1: -60, x2: 1, y2: 0 };
    roots[0]!.runtime.facing = -1;
    roots[0]!.mugenMinimumWidth = true;
    roots[1]!.runtime.bodyWidth = { front: 1, back: 1 };
    roots[1]!.sizeBox = { x1: -1, y1: -60, x2: 1, y2: 0 };
    roots[1]!.mugenMinimumWidth = true;

    advance(roots, true);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-3, 11]);
  });

  it("composes one-frame Width deltas over state size-box X", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 30)];
    roots[0]!.sizeBox = { x1: -10, y1: -60, x2: 10, y2: 0 };
    roots[1]!.sizeBox = { x1: -10, y1: -60, x2: 10, y2: 0 };
    expect(advance(roots, true).movedRootIds).toEqual([]);

    roots[0]!.runtime.bodyWidthDelta = { front: 12, back: 2 };
    roots[0]!.sizePushOnly = true;
    advance(roots, true);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-1, 31]);

    roots[0]!.runtime.bodyWidthDelta = undefined;
    roots[0]!.localCoord = [640, 480];
    roots[1]!.localCoord = [640, 480];
    roots[0]!.runtime.pos.x = 0;
    roots[1]!.runtime.pos.x = 40;
    roots[0]!.runtime.bodyWidthDelta = { front: 22, back: 2 };
    advance(roots, true);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([-1, 41]);
  });

  it("composes Height deltas over state size-box Y before push admission", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 8)];
    roots[0]!.runtime.pos.y = 0;
    roots[1]!.runtime.pos.y = -70;
    roots[0]!.sizePushOnly = true;
    expect(advance(roots, true).pairIds).toEqual([]);

    roots[0]!.runtime.bodyHeightDelta = { top: 12, bottom: 0 };
    const result = advance(roots, true);
    expect(result.pairIds).toEqual([["p1", "p2"]]);
    expect(result.movedRootIds).toEqual(["p1", "p2"]);

    roots[0]!.runtime.bodyHeightDelta = undefined;
    roots[0]!.runtime.pos.x = 0;
    roots[1]!.runtime.pos.x = 8;
    expect(advance(roots, true).pairIds).toEqual([]);
  });

  it("uses exact interval intersection for contained asymmetric boxes", () => {
    const roots = [actor("p1", 1, 0), actor("p2", 2, 0)];
    roots[0]!.sizeBox = { x1: -100, y1: -60, x2: 100, y2: 0 };
    roots[1]!.sizeBox = { x1: -1, y1: -60, x2: 1, y2: 0 };
    roots[0]!.sizePushOnly = true;

    advance(roots, true);
    expect(roots.map((root) => root.runtime.pos.x)).toEqual([1, -1]);
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
    sizeBox: { x1: -16, y1: -60, x2: 16, y2: 0 },
    hurtBoxes: [{ x1: -10, y1: -60, x2: 10, y2: 0 }],
  };
}
