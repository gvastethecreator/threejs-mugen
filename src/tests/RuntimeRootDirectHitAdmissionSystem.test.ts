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

  it("projects directed ReversalDef clash pairs without admitting them as ordinary direct hits", () => {
    const p3 = actor("p3", 3, 1, 0, { reversal: true });
    const p2 = actor("p2", 2, 2, 0, { reversal: true });
    const p1 = actor("p1", 1, 1, 0, { reversal: true });
    p1.currentMove = reversalMove();
    p2.currentMove = reversalMove();
    p3.currentMove = reversalMove();

    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [p3, p2, p1], getHurtBoxes: () => hurt });

    expect(result.admittedPairIds).toEqual([]);
    expect(result.admittedReversalClashPairIds).toEqual(["p2->p1", "p3->p2", "p1->p2", "p2->p3"]);
    expect(result.reversalClashDecisions).toContainEqual({ attackerId: "p3", getterId: "p1", reason: "same-side" });
  });

  it("matches the directed attacker's ReversalDef filter against the getter attack attr", () => {
    const getter = actor("p1", 1, 1, 0, { reversal: true });
    const attacker = actor("p2", 2, 2, 0, { reversal: true });
    getter.currentMove = reversalMove({ attr: "S,NA", reversalAttr: "S,SP" });
    attacker.currentMove = reversalMove({ attr: "S,NA", reversalAttr: "S,NA" });

    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [getter, attacker], getHurtBoxes: () => hurt });

    expect(result.reversalClashDecisions).toEqual([
      { attackerId: "p2", getterId: "p1", reason: "admitted" },
      { attackerId: "p1", getterId: "p2", reason: "attr-rejected" },
    ]);
  });

  it("rejects direct HitDef depth misses against getter body depth", () => {
    const attacker = actor("p1", 1, 1, 0, { move: true });
    const getter = actor("p2", 2, 2, 0);
    attacker.runtime.combatDepth = { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] };
    getter.runtime.combatDepth = { position: 8, velocity: 0, size: [3, 3], attack: [4, 4] };

    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [attacker, getter], getHurtBoxes: () => hurt });

    expect(result.admittedPairIds).toEqual([]);
    expect(result.decisions).toContainEqual({ attackerId: "p1", getterId: "p2", reason: "no-contact" });
  });

  it("uses the resolved root Clsn1 boxes for direct admission", () => {
    const attacker = actor("p1", 1, 1, 0, { move: true });
    const getter = actor("p2", 2, 2, 10);
    attacker.currentMove!.hitbox = { x1: 100, y1: -20, x2: 120, y2: 0 };

    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [attacker, getter],
      getHurtBoxes: () => hurt,
      getCollisionBoxes: (root, boxType) =>
        root.id === "p1" && boxType === "clsn1"
          ? [{ x1: 0, y1: -20, x2: 20, y2: 0 }]
          : undefined,
    });

    expect(result.admittedPairIds).toEqual(["p1->p2"]);
  });

  it("rejects an explicit direct HitDef without F against a falling getter", () => {
    const attacker = actor("p1", 1, 1, 0, { move: true, hitFlag: "H,L,A" });
    const getter = actor("p2", 2, 2, 0, { falling: true });

    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [attacker, getter], getHurtBoxes: () => hurt });

    expect(result.decisions).toContainEqual({ attackerId: "p1", getterId: "p2", reason: "fall-hitflag-rejected" });
    expect(result.admittedPairIds).toEqual([]);
  });

  it("allows explicit F against a falling getter unless the attacker opts out", () => {
    const allowed = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [
        actor("p1", 1, 1, 0, { move: true, hitFlag: "H,L,A,F" }),
        actor("p2", 2, 2, 0, { falling: true }),
      ],
      getHurtBoxes: () => hurt,
    });
    const rejected = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [
        actor("p1", 1, 1, 0, { move: true, hitFlag: "H,L,A,F", noFallHitFlag: true }),
        actor("p2", 2, 2, 0, { falling: true }),
      ],
      getHurtBoxes: () => hurt,
    });

    expect(allowed.admittedPairIds).toEqual(["p1->p2"]);
    expect(rejected.decisions).toContainEqual({ attackerId: "p1", getterId: "p2", reason: "fall-hitflag-rejected" });
  });

  it("preserves omitted hitflag behavior against a falling getter", () => {
    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [actor("p1", 1, 1, 0, { move: true }), actor("p2", 2, 2, 0, { falling: true })],
      getHurtBoxes: () => hurt,
    });

    expect(result.admittedPairIds).toEqual(["p1->p2"]);
  });

  it("applies explicit minus and plus HitFlags to root admission", () => {
    const minus = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [
        actor("p1", 1, 1, 0, { move: true, hitFlag: "H-" }),
        actor("p2", 2, 2, 0, { moveType: "H", stateNo: 5000 }),
      ],
      getHurtBoxes: () => hurt,
    });
    expect(minus.decisions).toContainEqual({ attackerId: "p1", getterId: "p2", reason: "minus-hitflag-rejected" });

    const plus = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [
        actor("p1", 1, 1, 0, { move: true, hitFlag: "H+" }),
        actor("p2", 2, 2, 0, { moveType: "H", stateNo: 5000 }),
      ],
      getHurtBoxes: () => hurt,
    });
    expect(plus.admittedPairIds).toEqual(["p1->p2"]);

    const guard = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [
        actor("p1", 1, 1, 0, { move: true, hitFlag: "H+" }),
        actor("p2", 2, 2, 0, { stateNo: 150, guarding: true }),
      ],
      getHurtBoxes: () => hurt,
    });
    expect(guard.decisions).toContainEqual({ attackerId: "p1", getterId: "p2", reason: "plus-hitflag-rejected" });

    const stateType = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [
        actor("p1", 1, 1, 0, { move: true, hitFlag: "H" }),
        actor("p2", 2, 2, 0, { stateType: "C" }),
      ],
      getHurtBoxes: () => hurt,
    });
    expect(stateType.decisions).toContainEqual({ attackerId: "p1", getterId: "p2", reason: "state-type-hitflag-rejected" });
  });

  it("applies HitDef AffectTeam before root collision admission", () => {
    const sameSideDefault = actor("p1", 1, 1, 0, { move: true });
    const sameSideFriendly = actor("p3", 3, 1, 0, { move: true, affectTeam: -1 });
    const enemy = actor("p2", 2, 2, 0);

    const defaultResult = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [sameSideDefault, sameSideFriendly],
      getHurtBoxes: () => hurt,
    });
    const friendlyResult = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [sameSideFriendly, sameSideDefault],
      getHurtBoxes: () => hurt,
    });
    const enemyResult = new RuntimeRootDirectHitAdmissionWorld().inspect({
      roots: [sameSideFriendly, enemy],
      getHurtBoxes: () => hurt,
    });

    expect(defaultResult.decisions).toContainEqual({ attackerId: "p1", getterId: "p3", reason: "same-side" });
    expect(friendlyResult.admittedPairIds).toContain("p3->p1");
    expect(enemyResult.decisions).toContainEqual({ attackerId: "p3", getterId: "p2", reason: "affectteam-rejected" });
  });

  it("uses attack depth on both sides of ReversalDef clashes with localcoord scaling", () => {
    const getter = actor("p1", 1, 1, 0, { reversal: true });
    const attacker = actor("p2", 2, 2, 0, { reversal: true });
    getter.currentMove = reversalMove();
    attacker.currentMove = reversalMove();
    getter.runtime.combatDepth = { position: 12, velocity: 0, size: [3, 3], attack: [4, 4] };
    attacker.runtime.combatDepth = { position: 0, velocity: 0, size: [3, 3], attack: [4, 4] };
    getter.definition = { localCoord: [640, 480] };

    const result = new RuntimeRootDirectHitAdmissionWorld().inspect({ roots: [getter, attacker], getHurtBoxes: () => hurt });

    expect(result.admittedReversalClashPairIds).toEqual(["p2->p1", "p1->p2"]);
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
    affectTeam?: -1 | 0 | 1;
    teamSide?: 1 | 2;
    moveTick?: number;
    denyHit?: boolean;
    noHurt?: boolean;
    hitFlag?: string;
    falling?: boolean;
    moveType?: "I" | "A" | "H";
    stateType?: "S" | "C" | "A" | "L";
    stateNo?: number;
    guarding?: boolean;
    noFallHitFlag?: boolean;
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
      stateNo: options.stateNo ?? 0,
      stateType: options.stateType ?? "S",
      moveType: options.falling ? "H" : options.moveType ?? "I",
      ...(options.guarding === undefined ? {} : { guarding: options.guarding }),
      ...(options.falling ? { hitFall: { falling: true, damage: 0, velocity: { x: undefined, y: 0 } } } : {}),
      ...(options.reversal ? { reversal: { attr: "S,NA", hitPause: 0 } } : {}),
      ...(options.denyHit ? { hitBy: { slot1: { mode: "deny" as const, attr: "S,NA", remaining: 1 } } } : {}),
      ...(options.noFallHitFlag ? {
        assertSpecial: { flags: ["nofallhitflag"], globalFlags: [], noFallHitFlag: true },
      } : {}),
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
      hitFlag: options.hitFlag,
      requiresHitDef: options.requiresHitDef,
      isReversal: options.isReversal,
      affectTeam: options.affectTeam,
      teamSide: options.teamSide,
    } : undefined,
    moveTick: options.moveTick ?? 1,
    hasHit: options.hasHit ?? false,
  };
}

function reversalMove(
  attrs: { attr?: string; reversalAttr?: string } = {},
): NonNullable<RuntimeRootDirectHitAdmissionActor["currentMove"]> {
  return {
    actionId: 0,
    startup: 0,
    activeStart: 0,
    activeEnd: 3600,
    recovery: 3600,
    damage: 0,
    attr: attrs.attr ?? "S,NA",
    reversalAttr: attrs.reversalAttr ?? "S,NA",
    isReversal: true,
    hitPause: 0,
    hitStun: 0,
    push: 0,
    hitbox: { x1: -20, y1: -20, x2: 20, y2: 0 },
  };
}
