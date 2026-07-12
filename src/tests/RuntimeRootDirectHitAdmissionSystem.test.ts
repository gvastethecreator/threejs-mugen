import { describe, expect, it } from "vitest";
import type { CollisionBox } from "../mugen/model/CollisionBox";
import {
  RuntimeRootDirectHitAdmissionWorld,
  type RuntimeRootDirectHitAdmissionActor,
} from "../mugen/runtime/RuntimeRootDirectHitAdmissionSystem";

const hurt: CollisionBox[] = [{ x1: -10, y1: -20, x2: 10, y2: 0 }];

describe("RuntimeRootDirectHitAdmissionWorld", () => {
  it("orders reversal, active HitDef, then PlayerNo and inspects stable enemy pairs", () => {
    const p1 = actor("p1", 1, 1, 0);
    const p2 = actor("p2", 2, 2, 100);
    const p3 = actor("p3", 3, 1, 100, { move: true });
    const p4 = actor("p4", 4, 2, 0, { reversal: true });
    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [p1, p2, p3, p4], getHurtBoxes: () => hurt });

    expect(result.attackerIds).toEqual(["p4", "p3", "p1", "p2"]);
    expect(result.admittedPairIds).toEqual(["p3->p2"]);
    expect(result.decisions).toContainEqual({ attackerId: "p3", getterId: "p1", reason: "same-side" });
  });

  it("orders admitted mutation pairs by ReversalDef getter before competing HitDef getters", () => {
    const p2 = actor("p2", 2, 2, 0, { move: true });
    const p4 = actor("p4", 4, 2, 0, { reversal: true });
    const p5 = actor("p5", 5, 1, 0, { move: true });

    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [p2, p4, p5], getHurtBoxes: () => hurt });

    expect(result.admittedPairIds).toEqual(["p5->p4", "p5->p2", "p2->p5"]);
  });

  it("filters standby, disabled, invalid-side and non-player roots while retaining over-KO", () => {
    const roots = [
      actor("p1", 1, 1, 0, { move: true, overKo: true }),
      actor("p2", 2, 2, 0),
      actor("p3", 3, 1, 0, { standby: true }),
      actor("p4", 4, 2, 0, { disabled: true }),
      actor("p5", 5, null, 0),
      actor("p6", 6, 2, 0, { playerType: false }),
    ];
    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots, getHurtBoxes: () => hurt });
    expect(result.rootIds).toEqual(["p1", "p2"]);
    expect(result.admittedPairIds).toEqual(["p1->p2"]);
  });

  it("rejects only exact committed or pending getters when contact memory exists", () => {
    const attacker = actor("p1", 1, 1, 0, { move: true, hasHit: true });
    attacker.hitDefTargets = ["p2"];
    attacker.pendingHitDefTargets = ["p4"];
    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [attacker, actor("p2", 2, 2, 0), actor("p4", 4, 2, 0), actor("p6", 6, 2, 0)],
      getHurtBoxes: () => hurt,
    });

    expect(result.decisions).toEqual(expect.arrayContaining([
      { attackerId: "p1", getterId: "p2", reason: "already-hit" },
      { attackerId: "p1", getterId: "p4", reason: "already-hit" },
      { attackerId: "p1", getterId: "p6", reason: "admitted" },
    ]));
  });

  it.each([
    ["already-hit", { move: true, hasHit: true }],
    ["compiled-hitdef", { move: true, requiresHitDef: true }],
    ["reversal-move", { move: true, isReversal: true }],
    ["inactive", { move: true, moveTick: 9 }],
    ["hitby-rejected", { move: true, denyHit: true }],
    ["missing-hurt-box", { move: true, noHurt: true }],
    ["no-contact", { move: true, x: 100 }],
  ] as const)("reports %s without mutation", (reason, rawOptions) => {
    const options = rawOptions as NonNullable<Parameters<typeof actor>[4]>;
    const attacker = actor("p1", 1, 1, options.x ?? 0, options);
    const getter = actor("p2", 2, 2, 0, options);
    const before = structuredClone([attacker, getter]);
    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [attacker, getter],
      getHurtBoxes: () => options.noHurt ? [] : hurt,
    });
    expect(result.decisions[0]?.reason).toBe(reason);
    expect([attacker, getter]).toEqual(before);
  });

  it("rejects duplicate ids and actor aliases before reading boxes", () => {
    const p1 = actor("p1", 1, 1, 0);
    expect(() => new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [p1, p1], getHurtBoxes: () => hurt }))
      .toThrow("Duplicate root hit-admission actor object p1");
    expect(() => new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [p1, actor("p1", 2, 2, 0)], getHurtBoxes: () => hurt }))
      .toThrow("Duplicate root hit-admission actor id p1");
    expect(() => new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [p1, actor("p2", 1, 2, 0)], getHurtBoxes: () => hurt }))
      .toThrow("Duplicate root hit-admission PlayerNo 1");
    const missingPlayerNo = actor("p2", 2, 2, 0);
    delete missingPlayerNo.playerNo;
    expect(() => new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [p1, missingPlayerNo], getHurtBoxes: () => hurt }))
      .toThrow("Root hit-admission actor p2 requires a positive PlayerNo");
  });
});

function actor(
  id: string,
  playerNo: number,
  side: 1 | 2 | null,
  x: number,
  options: {
    move?: boolean;
    reversal?: boolean;
    standby?: boolean;
    disabled?: boolean;
    overKo?: boolean;
    playerType?: boolean;
    hasHit?: boolean;
    requiresHitDef?: boolean;
    isReversal?: boolean;
    moveTick?: number;
    denyHit?: boolean;
    noHurt?: boolean;
    x?: number;
  } = {},
): RuntimeRootDirectHitAdmissionActor {
  return {
    id,
    playerNo,
    side,
    teamState: {
      playerType: options.playerType ?? true,
      disabled: options.disabled ?? false,
      standby: options.standby ?? false,
      overKo: options.overKo ?? false,
    },
    runtime: {
      pos: { x, y: 0 },
      facing: 1,
      ...(options.reversal ? { reversal: { attr: "S,NA", hitPause: 0 } } : {}),
      ...(options.denyHit ? { hitBy: { slot1: { mode: "deny" as const, attr: "S,NA", remaining: 1 } } } : {}),
    },
    currentMove: options.move ? {
      actionId: 200,
      startup: 0,
      activeStart: 0,
      activeEnd: 3,
      recovery: 0,
      damage: 10,
      hitPause: 0,
      hitStun: 0,
      push: 0,
      hitbox: { x1: 0, y1: -20, x2: 20, y2: 0 },
      requiresHitDef: options.requiresHitDef,
      isReversal: options.isReversal,
    } : undefined,
    moveTick: options.moveTick ?? 1,
    hasHit: options.hasHit ?? false,
  };
}
