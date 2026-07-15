import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeContactMemoryWorld, type RuntimeContactMemory } from "../mugen/runtime/ContactMemorySystem";
import {
  RuntimeExpressionContextWorld,
  type RuntimeExpressionContextActor,
  runtimeActorHasState,
  runtimeActorTeamSide,
  runtimeDefinitionConst,
  runtimeHitVar,
} from "../mugen/runtime/RuntimeExpressionContextSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeExpressionContextWorld", () => {
  it("builds one runtime expression context for CNS numeric reads", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", {
      stateNo: 200,
      animNo: 200,
      life: 920,
      hitFall: { falling: true, damage: 17, velocity: { y: -6 } },
    });
    const opponent = runtimeActor("p2", "Rival", { life: 875 });
    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];

    const result = world.evaluateNumber(
      [
        "Const(data.attack)",
        "Random",
        "AnimTime",
        "AnimElemTime(2)",
        "NumTarget(77)",
        "NumExplod(9)",
        "NumHelper(42)",
        "NumProj(77)",
        "MoveHit",
        "HitCount",
        "UniqHitCount",
        "ProjHitTime(77)",
        "ReceivedDamage",
        "ReceivedHits",
        "GetHitVar(fall.damage)",
      ].join(" + "),
      {
        actor,
        opponent,
        random: () => 0.321,
        animTimeRemaining: 5,
        animElemTime: (elementNumber) => (elementNumber === 2 ? 4 : undefined),
      },
    );

    expect(result).toBe(629);
  });

  it("owns target redirect reads used by trigger and expression evaluation", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival", { life: 875 });
    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];

    expect(world.evaluateNumber("Target(77), Life", { actor, opponent })).toBe(875);
    expect(world.evaluateNumber("Target(99), Life", { actor, opponent })).toBe(0);
    expect(world.resolveTargetRedirect(actor, opponent, 77)).toMatchObject({
      self: opponent.runtime,
      opponent: actor.runtime,
      name: "p2",
      opponentName: "p1",
    });
  });

  it("forwards explicit numeric identity through caller, EnemyNear, and Target reads", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");
    actor.playerId = 56;
    actor.playerNo = 1;
    opponent.playerId = 58;
    opponent.playerNo = 2;
    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];

    expect(world.evaluateNumber("ID * 100 + PlayerNo", { actor, opponent })).toBe(5601);
    expect(world.evaluateNumber("EnemyNear, ID * 100 + PlayerNo", { actor, opponent })).toBe(5802);
    expect(world.evaluateNumber("Target(77), ID * 100 + PlayerNo", { actor, opponent })).toBe(5802);
    expect(world.evaluateNumber("PlayerID(58), ID * 100 + PlayerNo", { actor, opponent, characters: [actor, opponent] })).toBe(5802);
    actor.runtime.vars = [58];
    expect(world.evaluateNumber("PlayerID(var(0)), Life", { actor, opponent, characters: [actor, opponent] })).toBe(1000);
    expect(world.resolvePlayerIdRedirect(actor, [actor, opponent], 58)).toMatchObject({
      self: opponent.runtime,
      playerId: 58,
      opponent: actor.runtime,
    });
  });

  it("passes stage bounds into edge-distance expression reads", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", {
      pos: { x: 20, y: 0 },
      facing: 1,
      bodyWidth: { front: 18, back: 44 },
    });
    const opponent = runtimeActor("p2", "Rival");

    expect(
      world.evaluateNumber("FrontEdgeDist + BackEdgeBodyDist", {
        actor,
        opponent,
        stageBounds: { left: -100, right: 160 },
      }),
    ).toBe(216);
    expect(world.evaluateNumber("FrontEdgeDist", { actor, opponent })).toBe(999);
  });

  it("evaluates P2BodyDist X from size boxes, Width policy, facing, and localcoord", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { pos: { x: 0, y: 0 }, facing: 1, bodyWidthDelta: { front: 4, back: 2 } });
    const opponent = runtimeActor("p2", "Rival", { pos: { x: 64, y: 0 }, facing: -1, bodyWidthDelta: { front: 6, back: 3 } });
    actor.definition.source = "imported";
    actor.definition.ikemenVersion = "0.99";
    actor.definition.localCoord = [320, 240];
    actor.definition.constants = { "size.ground.front": 10, "size.ground.back": 8 };
    opponent.definition.source = "imported";
    opponent.definition.ikemenVersion = "0.99";
    opponent.definition.localCoord = [640, 480];
    opponent.definition.constants = { "size.ground.front": 20, "size.ground.back": 12 };

    expect(world.evaluateNumber("P2BodyDist X", { actor, opponent })).toBe(5);

    actor.definition.ikemenVersion = undefined;
    opponent.definition.ikemenVersion = undefined;
    expect(world.evaluateNumber("P2BodyDist X", { actor, opponent })).toBe(12);

    opponent.definition.ikemenVersion = "0.99";
    expect(world.evaluateNumber("P2BodyDist X", { actor, opponent })).toBe(12);

    actor.definition.ikemenVersion = "0.99";
    opponent.definition.ikemenVersion = undefined;
    expect(world.evaluateNumber("P2BodyDist X", { actor, opponent })).toBe(5);

    actor.definition.ikemenVersion = undefined;
    opponent.runtime.facing = 1;
    expect(world.evaluateNumber("P2BodyDist X", { actor, opponent })).toBe(16);

    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];
    expect(world.evaluateNumber("EnemyNear, P2BodyDist X", { actor, opponent })).toBe(-32);
    expect(world.evaluateNumber("Target(77), P2BodyDist X", { actor, opponent })).toBe(-32);
  });

  it("evaluates IKEMEN P2BodyDist Y from size boxes, Height, OverrideClsn, localcoord, and redirects", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { pos: { x: 0, y: 0 }, facing: 1 });
    const opponent = runtimeActor("p2", "Rival", { pos: { x: 64, y: -200 }, facing: -1 });
    actor.definition.source = "imported";
    actor.definition.ikemenVersion = "0.99";
    actor.definition.localCoord = [320, 240];
    actor.definition.constants = { "size.height": 60 };
    opponent.definition.source = "imported";
    opponent.definition.ikemenVersion = "0.99";
    opponent.definition.localCoord = [640, 480];
    opponent.definition.constants = { "size.height": 120 };

    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(-40);
    actor.runtime.bodyHeightDelta = { top: 20, bottom: 0 };
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(-20);
    actor.runtime.clsnOverrides = [{ group: 3, index: -1, rect: { x1: -16, y1: -120, x2: 16, y2: 0 } }];
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(0);

    actor.runtime.bodyHeightDelta = undefined;
    actor.runtime.clsnOverrides = undefined;
    opponent.runtime.pos.y = 200;
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(40);
    opponent.runtime.pos.y = 100;
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(0);

    opponent.runtime.pos.y = -200;
    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];
    expect(world.evaluateNumber("EnemyNear, P2BodyDist Y", { actor, opponent })).toBe(40);
    expect(world.evaluateNumber("Target(77), P2BodyDist Y", { actor, opponent })).toBe(40);

    actor.runtime.clsnOverrides = [{ group: 3, index: -1, rect: { x1: 0, y1: 0, x2: 0, y2: 0 } }];
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBeUndefined();

    actor.runtime.clsnOverrides = undefined;
    actor.definition.ikemenVersion = undefined;
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(-100);

    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];
    expect(world.evaluateNumber("Target(77), P2BodyDist Y", { actor, opponent })).toBe(100);
  });

  it.each([
    ["C", "crouch", -45],
    ["A", "air", -30],
    ["L", "down", -20],
  ] as const)("uses %s state Size Y geometry", (stateType, key, top) => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { pos: { x: 0, y: 0 }, stateType });
    const opponent = runtimeActor("p2", "Rival", { pos: { x: 0, y: -80 } });
    actor.definition.source = "imported";
    actor.definition.ikemenVersion = "0.99";
    actor.definition.constants = {
      [`size.${key}.sizebox.left`]: -10,
      [`size.${key}.sizebox.top`]: top,
      [`size.${key}.sizebox.right`]: 10,
      [`size.${key}.sizebox.bottom`]: 0,
    };
    opponent.definition.constants = { "size.height": 60 };

    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(-80 - top);
  });

  it("composes opponent Height and OverrideClsn Size into P2BodyDist Y", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { pos: { x: 0, y: 0 } });
    const opponent = runtimeActor("p2", "Rival", { pos: { x: 0, y: 100 }, bodyHeightDelta: { top: 30, bottom: 0 } });
    actor.definition.source = "imported";
    actor.definition.ikemenVersion = "0.99";

    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(10);
    opponent.runtime.clsnOverrides = [{ group: 3, index: -1, rect: { x1: -16, y1: -120, x2: 16, y2: 0 } }];
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent })).toBe(0);
  });

  it("returns undefined P2BodyDist axes when P2 selection is empty", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");

    const rootSelection = {
      actorId: actor.id,
      side: 1 as const,
      partnerIds: [],
      enemyIds: [opponent.id],
      p2CandidateIds: [],
    };

    expect(world.evaluateNumber("P2BodyDist X", { actor, opponent, rootSelection })).toBeUndefined();
    expect(world.evaluateNumber("P2BodyDist Y", { actor, opponent, rootSelection })).toBeUndefined();
  });

  it("applies OverrideClsn Size deletion to P2BodyDist X", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { pos: { x: 0, y: 0 }, facing: 1 });
    const opponent = runtimeActor("p2", "Rival", { pos: { x: 64, y: 0 }, facing: -1 });
    actor.definition.source = "imported";
    actor.definition.ikemenVersion = "0.99";
    actor.runtime.clsnOverrides = [{ group: 3, index: -1, rect: { x1: 0, y1: 0, x2: 0, y2: 0 } }];

    expect(world.evaluateNumber("P2BodyDist X", { actor, opponent })).toBeUndefined();
  });

  it("passes game-space and screen-space dimensions into viewport expression reads", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");

    expect(
      world.evaluateNumber("GameWidth + GameHeight", {
        actor,
        opponent,
        gameSpace: { width: 640, height: 480, zoom: 1 },
      }),
    ).toBe(1120);
    expect(
      world.evaluateNumber("GameWidth + GameHeight", {
        actor,
        opponent,
        gameSpace: { width: 640, height: 480, zoom: 0.5 },
      }),
    ).toBe(2240);
    expect(
      world.evaluateNumber("ScreenWidth + ScreenHeight", {
        actor,
        opponent,
        gameSpace: { width: 640, height: 480, zoom: 0.5 },
      }),
    ).toBe(1120);
  });

  it("exposes bounded TeamSide values for players and first-generation helper ids", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");

    expect(world.evaluateNumber("TeamSide + EnemyNear, TeamSide", { actor, opponent })).toBe(3);
    expect(runtimeActorTeamSide(runtimeActor("p1-helper-0", "Author"))).toBe(1);
    expect(runtimeActorTeamSide(runtimeActor("p2-helper-0", "Rival"))).toBe(2);
    expect(runtimeActorTeamSide(runtimeActor("p3-helper-0", "Partner"))).toBe(1);
    expect(runtimeActorTeamSide(runtimeActor("p4", "Enemy Partner"))).toBe(2);
    expect(runtimeActorTeamSide(runtimeActor("training", "Neutral"))).toBe(0);
  });

  it("routes EnemyNear indexes and NumEnemy through an explicit runtime opponent roster", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const firstOpponent = runtimeActor("p2", "Rival", { life: 875, stateNo: 3000 });
    const secondOpponent = runtimeActor("p3", "Extra", { life: 333, stateNo: 5000 });

    expect(
      world.evaluateNumber("NumEnemy + EnemyNear(1), Life + EnemyNear(var(2)), StateNo", {
        actor: { ...actor, runtime: { ...actor.runtime, vars: [0, 0, 1] } },
        opponent: firstOpponent,
        opponents: [firstOpponent, secondOpponent],
      }),
    ).toBe(5335);
    expect(world.evaluateNumber("NumEnemy", { actor, opponent: firstOpponent })).toBe(1);
    expect(world.evaluateNumber("EnemyNear(1), Life", { actor, opponent: firstOpponent })).toBe(0);
  });

  it("orders explicit EnemyNear rosters by nearest body distance with stable ties", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", {
      pos: { x: 0, y: 0 },
      facing: 1,
      bodyWidth: { front: 10, back: 10 },
    });
    const far = runtimeActor("p3", "Far", {
      pos: { x: 160, y: 0 },
      life: 333,
      bodyWidth: { front: 12, back: 12 },
    });
    const near = runtimeActor("p2", "Near", {
      pos: { x: 80, y: 0 },
      life: 875,
      bodyWidth: { front: 12, back: 12 },
    });
    const tiedFirst = runtimeActor("p4", "TieA", {
      pos: { x: -80, y: 0 },
      life: 444,
      bodyWidth: { front: 12, back: 12 },
    });
    const tiedSecond = runtimeActor("p5", "TieB", {
      pos: { x: -80, y: 0 },
      life: 555,
      bodyWidth: { front: 12, back: 12 },
    });

    const input = { actor, opponent: far, opponents: [far, near, tiedFirst, tiedSecond] };
    expect(world.evaluateNumber("EnemyNear(0), Life", input)).toBe(875);
    expect(world.evaluateNumber("EnemyNear(1), Life", input)).toBe(444);
    expect(world.evaluateNumber("EnemyNear(2), Life", input)).toBe(555);
    expect(world.evaluateNumber("EnemyNear(3), Life", input)).toBe(333);
  });

  it("routes EnemyNear and P2 reads through distinct IKEMEN root-selection rows", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "P1 Author");
    const fallback = runtimeActor("p2", "Fallback", { life: 111, pos: { x: 200, y: 0 } });
    const overKoEnemy = runtimeActor("p4", "Enemy Author", { life: 444, pos: { x: 20, y: 0 } });
    const selectedP2 = runtimeActor("p6", "P2 Author", { life: 666, pos: { x: 80, y: 0 } });

    const input = {
      actor,
      opponent: fallback,
      characters: [actor, fallback, overKoEnemy, selectedP2],
      rootSelection: {
        actorId: "p1",
        side: 1 as const,
        partnerIds: ["p3"],
        enemyIds: ["p4", "p6"],
        p2CandidateIds: ["p6"],
      },
    };

    expect(world.evaluateNumber("P2Life", input)).toBe(666);
    expect(world.evaluateNumber("NumEnemy + EnemyNear(0), Life + EnemyNear(1), Life", input)).toBe(1112);
    expect(world.create(input)).toMatchObject({
      name: "p1",
      opponentName: "p6",
      opponentAuthorName: "P2 Author",
    });

    expect(
      world.evaluateNumber("P2Life + EnemyNear(0), Life", {
        ...input,
        rootSelection: { ...input.rootSelection, enemyIds: ["missing"] },
      }),
    ).toBe(0);
  });

  it("routes Partner, Enemy, and P3/P4 identity through ordered root rosters", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "P1 Author", { vars: [0, 0, 1] });
    const primaryEnemy = runtimeActor("p2", "P2 Author", { life: 900, pos: { x: 180, y: 0 } });
    const partner = runtimeActor("p3", "P3 Author", { life: 700, pos: { x: -40, y: 0 } });
    const secondaryEnemy = runtimeActor("p4", "P4 Author", { life: 600, pos: { x: 20, y: 0 } });
    const input = {
      actor,
      opponent: primaryEnemy,
      characters: [actor, primaryEnemy, partner, secondaryEnemy],
      rootSelection: {
        actorId: actor.id,
        side: 1 as const,
        partnerIds: [partner.id],
        enemyIds: [primaryEnemy.id, secondaryEnemy.id],
        p2CandidateIds: [primaryEnemy.id],
      },
    };

    expect(world.evaluateNumber("NumPartner + Partner, Life + Enemy, Life + Enemy(1), Life + P2Life", input)).toBe(3101);
    expect(world.evaluateNumber('P3Name = "p3" && P4Name = "p4"', input)).toBe(1);
    expect(world.evaluateNumber("EnemyNear, Life", input)).toBe(600);
    expect(world.evaluateNumber("Enemy(var(2)), Life", input)).toBe(600);
    expect(world.evaluateNumber("Partner(1), Life", input)).toBe(0);
  });

  it("fails P2 reads closed when an explicit selection has no candidate", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const fallback = runtimeActor("p2", "Fallback", { life: 999 });
    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];
    const input = {
      actor,
      opponent: fallback,
      characters: [actor, fallback],
      rootSelection: {
        actorId: "p1",
        side: 1 as const,
        partnerIds: [],
        enemyIds: [],
        p2CandidateIds: [],
      },
    };

    expect(world.evaluateNumber("P2Life + NumEnemy", input)).toBe(0);
    expect(world.evaluateNumber("Target(77), Life", input)).toBe(999);
    expect(world.create(input).opponentName).toBeUndefined();
  });

  it("normalizes transition sentinel state time to observable Time zero", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");
    actor.stateElapsed = -1;

    expect(world.evaluateNumber("Time + StateTime", { actor, opponent })).toBe(0);
  });

  it("evaluates compiled triggers through the same runtime read model", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { stateNo: 200, animNo: 200 });
    const opponent = runtimeActor("p2", "Rival");
    actor.contact.projectileGuardState = 200;
    actor.contact.projectileGuardTime = 3;

    const trigger = compiledTrigger('command = "fire" && ProjHit(77) && InGuardDist');

    expect(
      world.evaluateTrigger(trigger, {
        actor,
        opponent,
        inGuardDist: () => true,
      }),
    ).toBe(true);
    expect(world.evaluateTrigger(compiledTrigger("ProjContactTime(0) >= 0 && ProjContactTime(77) >= 0"), { actor, opponent })).toBe(true);
    expect(world.evaluateNumber("ProjContactTime(0) + ProjContactTime(77)", { actor, opponent })).toBe(22);
    expect(world.evaluateTrigger(compiledTrigger("ProjHitTime(0) >= 0 && ProjHitTime(77) >= 0"), { actor, opponent })).toBe(true);
    expect(world.evaluateNumber("ProjHitTime(0) + ProjHitTime(77)", { actor, opponent })).toBe(22);
    expect(world.evaluateTrigger(compiledTrigger("ProjGuarded(77) && ProjGuardedTime(0) < 0"), { actor, opponent })).toBe(true);
    expect(world.evaluateNumber("ProjGuardedTime(0) + ProjGuardedTime(77)", { actor, opponent })).toBe(-2);
    const guardActor = { ...actor, contact: { ...actor.contact, projectileLastContactKind: "guard" as const } };
    expect(world.evaluateTrigger(compiledTrigger("ProjGuarded(77) && ProjGuardedTime(0) >= 0"), { actor: guardActor, opponent })).toBe(true);
    expect(world.evaluateNumber("ProjGuardedTime(0) + ProjGuardedTime(77)", { actor: guardActor, opponent })).toBe(6);
    expect(world.evaluateTrigger(compiledTrigger("ProjCancelTime(0) >= 0 && ProjCancelTime(77) >= 0"), { actor, opponent })).toBe(true);
    expect(world.evaluateNumber("ProjCancelTime(0) + ProjCancelTime(77)", { actor, opponent })).toBe(10);
    expect(world.evaluateNumber("ProjContactTime(99)", { actor, opponent })).toBe(-1);
    expect(world.evaluateNumber("ProjHitTime(99)", { actor, opponent })).toBe(-1);
    expect(world.evaluateNumber("ProjGuardedTime(99)", { actor, opponent })).toBe(-1);
    expect(world.evaluateNumber("ProjCancelTime(99)", { actor, opponent })).toBe(-1);
  });

  it("exposes shared const, state, and HitVar helpers", () => {
    const actor = runtimeActor("p1", "Author", {
      hitVelocity: { x: -4, y: -2 },
      hitVars: {
        damage: 23,
        kill: false,
        hitId: 88,
        chainId: 44,
        hitCount: 3,
        hitOffset: { x: 16, y: -24, z: 0 },
        animType: 2,
        groundType: 2,
        airType: 3,
        yAccel: 0.37,
        isBound: true,
        guarded: true,
      },
      guardStun: 9,
      guardSlideTime: 5,
      guardControlTime: 7,
      hitFall: {
        falling: true,
        damage: 31,
        fallCount: 1,
        defenceUp: 80,
        velocity: { x: -2, y: -8 },
        envShake: { time: 15, freq: 178, ampl: 6, phase: 0 },
      },
    });

    expect(runtimeDefinitionConst(actor.definition, " DATA.ATTACK ")).toBe(200);
    expect(runtimeActorHasState(actor, 555)).toBe(true);
    expect(runtimeActorHasState(actor, 777)).toBe(false);
    expect(runtimeActorHasState({ ...actor, runtimeProgram: undefined }, 777)).toBe(true);
    expect(runtimeHitVar(actor.runtime, "damage")).toBe(23);
    expect(runtimeHitVar(actor.runtime, "kill")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "hitid")).toBe(88);
    expect(runtimeHitVar(actor.runtime, "chainid")).toBe(44);
    expect(runtimeHitVar(actor.runtime, "hitcount")).toBe(3);
    expect(runtimeHitVar(actor.runtime, "xoff")).toBe(16);
    expect(runtimeHitVar(actor.runtime, "yoff")).toBe(-24);
    expect(runtimeHitVar(actor.runtime, "zoff")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "type")).toBe(2);
    expect(runtimeHitVar(actor.runtime, "animtype")).toBe(2);
    expect(runtimeHitVar(actor.runtime, "groundtype")).toBe(2);
    expect(runtimeHitVar(actor.runtime, "airtype")).toBe(3);
    expect(runtimeHitVar(actor.runtime, "yaccel")).toBeCloseTo(0.37, 5);
    expect(runtimeHitVar(actor.runtime, "isbound")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "guarded")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "xvel")).toBe(-4);
    expect(runtimeHitVar(actor.runtime, "yvel")).toBe(-2);
    expect(runtimeHitVar(actor.runtime, "fallcount")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "fall.damage")).toBe(31);
    expect(runtimeHitVar(actor.runtime, "fall.defence_up")).toBe(80);
    expect(runtimeHitVar(actor.runtime, "fall.xvel")).toBe(-2);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.time")).toBe(15);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.freq")).toBe(178);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.ampl")).toBe(6);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.phase")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "hittime")).toBe(9);
    expect(runtimeHitVar(actor.runtime, "slidetime")).toBe(5);
    expect(runtimeHitVar(actor.runtime, "ctrltime")).toBe(7);

    const normalHit = runtimeActor("p1", "Author");
    normalHit.hitStun = 13;
    normalHit.hitPause = 4;
    expect(runtimeHitVar(normalHit.runtime, "hittime", { hitStun: normalHit.hitStun })).toBe(13);
    expect(runtimeHitVar(normalHit.runtime, "hitshaketime", { hitPause: normalHit.hitPause })).toBe(4);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(hittime) + GetHitVar(hitshaketime)", {
      actor: normalHit,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(17);
  });

  it("keeps GetHitVar fall.recover distinct from CanRecover timing", () => {
    const actor = runtimeActor("p1", "Author", {
      hitFall: {
        falling: true,
        damage: 31,
        velocity: { y: -8 },
        recover: true,
        recoverTime: 12,
        downRecover: true,
        downRecoverTime: 45,
      },
    });

    expect(runtimeHitVar(actor.runtime, "fall.recover")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "fall.recovertime")).toBe(12);
    expect(runtimeHitVar(actor.runtime, "down.recover")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "down.recovertime")).toBe(45);
    expect(runtimeHitVar(actor.runtime, "recovertime")).toBe(45);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("CanRecover", { actor, opponent: runtimeActor("p2", "Rival") })).toBe(0);
  });
});

function runtimeActor(
  id: string,
  authorName: string,
  runtimeOverrides: Partial<CharacterRuntimeState> = {},
): RuntimeExpressionContextActor {
  const runtime = runtimeState(runtimeOverrides);
  const contactWorld = new RuntimeContactMemoryWorld();
  return {
    id,
    definition: {
      displayName: id,
      authorName,
      constants: { "data.attack": 200 },
      commands: [],
      animations: new Map<number, unknown>([[200, {}]]),
      states: [{ id: 777 }],
    },
    runtimeProgram: { states: [{ id: 555 }] },
    commandBuffer: {
      isCommandActive: (name) => name === "fire",
    },
    currentMove: { attr: "S,NA" },
    stateElapsed: 9,
    hitPause: 0,
    hitStun: 0,
    runtime,
    targets: [],
    targetBindings: [],
    contactWorld,
    contact: contactMemory(),
    targetWorld: new RuntimeTargetWorld(),
    effectActorWorld: {
      countActors: (_ownerId, kind, actorId) => {
        if (kind === "explod" && actorId === 9) return 2;
        if (kind === "helper" && actorId === 42) return 3;
        if (kind === "projectile" && actorId === 77) return 4;
        return 0;
      },
    },
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "A",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

function contactMemory(): RuntimeContactMemory {
  return {
    moveContactState: 200,
    moveContactTime: 7,
    moveHitState: 200,
    moveHitTime: 7,
    moveHitCountState: 200,
    moveHitCount: 5,
    moveUniqueHitCount: 3,
    moveReversedState: 200,
    moveReversedTime: 6,
    receivedDamageState: 200,
    receivedDamageAmount: 44,
    receivedHitsState: 200,
    receivedHitsCount: 2,
    projectileContactState: 200,
    projectileHitState: 200,
    projectileGuardState: 200,
    projectileId: 77,
    projectileLastContactKind: "hit",
    projectileContactTime: 11,
    projectileHitTime: 11,
    projectileGuardTime: 3,
    projectileCancelState: 200,
    projectileCancelId: 77,
    projectileCancelTime: 5,
  };
}

function compiledTrigger(expression: string) {
  return compileControllerIr(controller("Null", {}, expression)).triggers[0]!;
}

function controller(type: string, params: Record<string, string>, triggerExpression: string): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [{ index: 1, expression: triggerExpression, raw: `trigger1 = ${triggerExpression}`, line: 1 }],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}
