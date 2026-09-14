import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
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
import { RuntimeStunWorld } from "../mugen/runtime/RuntimeStunSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";
import { createRuntimeProjectile } from "../mugen/runtime/ProjectileSystem";
import { evaluateExpression } from "../mugen/runtime/ExpressionEvaluator";
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

  it("exposes AnimElemVar from the actor's active AIR frame", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");
    actor.currentAction = {
      id: 200,
      loopStart: 0,
      rawLines: [],
      frames: [
        {
          spriteGroup: 200,
          spriteIndex: 3,
          offsetX: -4,
          offsetY: 9,
          duration: 5,
          flip: "HV",
          clsn1: [{ x1: 0, y1: 0, x2: 4, y2: 4 }],
          clsn2: [],
          raw: "",
          line: 1,
        },
      ],
    } satisfies MugenAnimationAction;

    expect(world.evaluateNumber("AnimElemVar(Group) + AnimElemVar(Image)", { actor, opponent })).toBe(203);
    expect(world.evaluateNumber("AnimElemVar(Time) + AnimElemVar(XOffset) + AnimElemVar(YOffset)", { actor, opponent })).toBe(10);
    expect(world.evaluateNumber("AnimElemVar(HFlip) && AnimElemVar(VFlip)", { actor, opponent })).toBe(1);
    expect(world.evaluateNumber("AnimElemVar(NumClsn1) + AnimElemVar(NumClsn2)", { actor, opponent })).toBe(1);
  });

  it("derives AnimLength from the actor's current action", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");
    actor.currentAction = {
      id: 300,
      rawLines: [],
      frames: [
        { ...emptyAnimationFrame(1), duration: 2 },
        { ...emptyAnimationFrame(2), duration: 0 },
        { ...emptyAnimationFrame(3), duration: -4 },
        { ...emptyAnimationFrame(4), duration: 4 },
      ],
    } satisfies MugenAnimationAction;

    expect(world.evaluateNumber("AnimLength", { actor, opponent })).toBe(8);
  });

  it("resolves AnimElemNo from the current AIR cursor without advancing it", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");
    actor.currentAction = {
      id: 300,
      loopStart: 1,
      rawLines: [],
      frames: [
        { ...emptyAnimationFrame(1), duration: 2 },
        { ...emptyAnimationFrame(2), duration: 3 },
        { ...emptyAnimationFrame(3), duration: 4 },
      ],
    } satisfies MugenAnimationAction;
    actor.frameElapsed = 0;
    actor.runtime.frameIndex = 0;
    actor.runtime.animTime = 0;

    expect(world.evaluateNumber("AnimElemNo(0)", { actor, opponent })).toBe(1);
    expect(world.evaluateNumber("AnimElemNo(2)", { actor, opponent })).toBe(2);
    expect(actor.runtime.frameIndex).toBe(0);
    expect(actor.frameElapsed).toBe(0);
  });

  it("exposes AnimPlayerNo from the active animation owner and redirects", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival");
    actor.playerNo = 1;
    actor.animationOwnerPlayerNo = 2;
    opponent.playerNo = 2;
    opponent.animationOwnerPlayerNo = 3;

    expect(world.evaluateNumber("AnimPlayerNo", { actor, opponent })).toBe(2);
    expect(world.evaluateNumber("EnemyNear, AnimPlayerNo", { actor, opponent })).toBe(3);
  });

  it("distinguishes AnimExist current AIR table from SelfAnimExist", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const owner = runtimeActor("p2", "Owner");
    const opponent = runtimeActor("p3", "Rival");
    actor.playerNo = 1;
    actor.animationOwnerPlayerNo = 2;
    actor.runtime.animationSource = "state-owner";
    actor.definition.animations = new Map<number, unknown>([[200, {}], [6666, {}]]);
    owner.playerNo = 2;
    owner.definition.animations = new Map<number, unknown>([[200, {}], [7777, {}]]);
    opponent.playerNo = 3;
    const input = { actor, opponent, owner, characters: [actor, owner, opponent] };

    expect(world.evaluateNumber("AnimExist(7777)", input)).toBe(1);
    expect(world.evaluateNumber("SelfAnimExist(7777)", input)).toBe(0);
    expect(world.evaluateNumber("AnimExist(6666)", input)).toBe(0);
    expect(world.evaluateNumber("SelfAnimExist(6666)", input)).toBe(1);
    expect(world.evaluateNumber("AnimExist(9999)", input)).toBe(0);
    expect(world.evaluateNumber("EnemyNear, AnimExist(7777)", input)).toBe(0);

    actor.playerNo = undefined;
    actor.animationOwnerPlayerNo = undefined;
    owner.playerNo = undefined;
    opponent.playerNo = undefined;
    expect(world.evaluateNumber("AnimExist(7777)", input)).toBe(1);
    expect(world.evaluateNumber("SelfAnimExist(7777)", input)).toBe(0);
    expect(world.evaluateNumber("AnimExist(6666)", input)).toBe(0);
    expect(world.evaluateNumber("SelfAnimExist(6666)", input)).toBe(1);
  });

  it("exposes current AIR ClsnVar reads, runtime overrides, size, and redirected localcoords", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", {
      vars: [0],
      clsnScaleMultiplier: { x: 4, y: 4 },
      clsnOverrides: [
        { group: 1, index: 0, rect: { x1: -20, y1: -30, x2: 44, y2: 10 } },
        { group: 3, index: 0, rect: { x1: -18, y1: -70, x2: 22, y2: 5 } },
      ],
    });
    const opponent = runtimeActor("p2", "Rival");
    actor.definition.localCoord = [320, 240];
    opponent.definition.localCoord = [640, 480];
    actor.currentAction = {
      id: 200,
      rawLines: [],
      frames: [{ ...emptyAnimationFrame(1), clsn1: [{ x1: -12, y1: -20, x2: 30, y2: 8 }] }],
    } satisfies MugenAnimationAction;
    opponent.currentAction = {
      id: 200,
      rawLines: [],
      frames: [{ ...emptyAnimationFrame(1), clsn2: [{ x1: -64, y1: -80, x2: 128, y2: 16 }] }],
    } satisfies MugenAnimationAction;

    expect(world.evaluateNumber("ClsnVar(Clsn1, var(0), Back)", { actor, opponent })).toBe(-20);
    expect(world.evaluateNumber("ClsnVar(Clsn1, 0, Front)", { actor, opponent })).toBe(44);
    expect(world.evaluateNumber("ClsnVar(Size, 0, Top)", { actor, opponent })).toBe(-70);
    expect(world.evaluateNumber("EnemyNear, ClsnVar(Clsn2, 0, Front)", { actor, opponent })).toBe(64);
    expect(world.evaluateNumber("ClsnVar(Clsn1, -1, Back)", { actor, opponent })).toBeUndefined();
    expect(world.evaluateNumber("ClsnVar(Clsn2, 9, Bottom)", { actor, opponent })).toBeUndefined();
  });

  it("evaluates ClsnOverlap by dynamic player ID and redirected source actor", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { vars: [58], pos: { x: 0, y: 0 } });
    const opponent = runtimeActor("p2", "Rival", { pos: { x: 18, y: 0 } });
    actor.playerId = 56;
    opponent.playerId = 58;
    actor.currentAction = {
      id: 200,
      rawLines: [],
      frames: [{ ...emptyAnimationFrame(1), clsn1: [{ x1: 8, y1: -12, x2: 24, y2: 2 }] }],
    } satisfies MugenAnimationAction;
    opponent.currentAction = {
      id: 200,
      rawLines: [],
      frames: [{ ...emptyAnimationFrame(1), clsn2: [{ x1: -8, y1: -16, x2: 8, y2: 4 }] }],
    } satisfies MugenAnimationAction;
    const input = { actor, opponent, characters: [actor, opponent] };

    expect(world.evaluateNumber("ClsnOverlap(Clsn1, var(0), Clsn2)", input)).toBe(1);
    expect(world.evaluateNumber("ClsnOverlap(Clsn1, EnemyNear, ID, Clsn2)", input)).toBe(1);
    expect(world.evaluateNumber("EnemyNear, ClsnOverlap(Clsn2, 56, Clsn1)", input)).toBe(1);
    expect(world.evaluateNumber("ClsnOverlap(Clsn1, 999, Clsn2)", input)).toBe(0);
    opponent.runtime.pos.x = 80;
    expect(world.evaluateNumber("ClsnOverlap(Clsn1, 58, Clsn2)", input)).toBe(0);
  });

  it("evaluates ProjClsnOverlap by owner index, dynamic player ID, and redirect", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { vars: [0], pos: { x: 0, y: 0 } });
    const opponent = runtimeActor("p2", "Rival", { pos: { x: 18, y: 0 } });
    actor.playerId = 56;
    opponent.playerId = 58;
    actor.currentAction = {
      id: 200,
      rawLines: [],
      frames: [{ ...emptyAnimationFrame(1), clsn1: [{ x1: 8, y1: -12, x2: 24, y2: 2 }] }],
    } satisfies MugenAnimationAction;
    opponent.currentAction = {
      id: 200,
      rawLines: [],
      frames: [{ ...emptyAnimationFrame(1), clsn2: [{ x1: -8, y1: -16, x2: 8, y2: 4 }] }],
    } satisfies MugenAnimationAction;
    const actorProjectile = createRuntimeProjectile({
      serialId: "p1-projectile-0",
      controller: controller("Projectile", {}, "1"),
      ownerId: actor.id,
      spriteOwnerId: actor.id,
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: actor.id,
      action: { ...actor.currentAction, id: 1000 },
      animNo: 1000,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    const opponentProjectile = createRuntimeProjectile({
      serialId: "p2-projectile-0",
      controller: controller("Projectile", {}, "1"),
      ownerId: opponent.id,
      spriteOwnerId: opponent.id,
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: opponent.id,
      action: { ...opponent.currentAction, id: 1001 },
      animNo: 1001,
      pos: { x: 18, y: 0 },
      fallbackFacing: 1,
    });
    const projectilesOwnedBy = (ownerId: string) => ownerId === actor.id ? [actorProjectile] : [opponentProjectile];
    actor.effectActorWorld.projectilesOwnedBy = projectilesOwnedBy;
    opponent.effectActorWorld.projectilesOwnedBy = projectilesOwnedBy;
    const input = { actor, opponent, characters: [actor, opponent] };

    expect(world.evaluateNumber("ProjClsnOverlap(var(0), EnemyNear, ID, Clsn2)", input)).toBe(1);
    expect(world.evaluateNumber("EnemyNear, ProjClsnOverlap(0, 56, Clsn1)", input)).toBe(1);
    expect(world.evaluateNumber("ProjClsnOverlap(1, 58, Clsn2)", input)).toBe(0);
    expect(world.evaluateNumber("ProjClsnOverlap(0, 999, Clsn2)", input)).toBe(0);
  });

  it("reads owner-filtered ProjVar state and preserves caller localcoord through redirects", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { vars: [77, 1] });
    const opponent = runtimeActor("p2", "Rival");
    actor.definition.localCoord = [320, 240];
    opponent.definition.localCoord = [640, 480];
    const makeProjectile = (ownerId: string, projectileId: number, serialId: string, posX: number, age: number) => {
      const projectile = createRuntimeProjectile({
        serialId,
        controller: controller("Projectile", {
          projid: String(projectileId),
          projanim: "1000",
          attr: projectileId === 99 ? "A,HP" : "S,SP",
          guardflag: projectileId === 99 ? "A" : "MA",
          hitflag: projectileId === 99 ? "D" : "MAF",
          remvelocity: projectileId === 99 ? "-10,6,2" : "8,-4,1",
          velmul: "1,1,2",
          projlayerno: projectileId === 99 ? "8" : "-6",
          projangle: projectileId === 99 ? "30" : "-15",
          projxangle: projectileId === 99 ? "20" : "-10",
          projyangle: projectileId === 99 ? "25" : "-5",
          projxshear: projectileId === 99 ? "0.5" : "-0.25",
          projshadow: projectileId === 99 ? "96,112,128" : "16,32,48",
          ownpal: "1",
          remappal: projectileId === 99 ? "4,7" : "2,5",
        }, "1"),
        ownerId,
        spriteOwnerId: ownerId,
        spriteOwnerDefinitionId: "demo",
        spriteOwnerLabel: ownerId,
        action: {
          id: 1000,
          rawLines: [],
          frames: [emptyAnimationFrame(1), emptyAnimationFrame(2)],
        },
        animNo: 1000,
        pos: { x: posX, y: 0 },
        fallbackFacing: 1,
        localCoord: [640, 480],
      });
      projectile.age = age;
      projectile.pauseMoveTime = age + 1;
      projectile.superMoveTime = age + 2;
      return projectile;
    };
    const actorProjectiles = [
      makeProjectile(actor.id, 77, "p1-projectile-0", 64, 4),
      makeProjectile(actor.id, 77, "p1-projectile-1", 128, 5),
      makeProjectile(actor.id, 88, "p1-projectile-2", 192, 6),
    ];
    const opponentProjectiles = [makeProjectile(opponent.id, 99, "p2-projectile-0", 80, 9)];
    expect(opponentProjectiles[0]?.velMul.z).toBe(2);
    expect(actorProjectiles[0]?.xShear).toBe(-0.25);
    expect(opponentProjectiles[0]?.xShear).toBe(0.5);
    const projectilesOwnedBy = (ownerId: string, projectileId?: number) =>
      (ownerId === actor.id ? actorProjectiles : opponentProjectiles)
        .filter((projectile) => projectileId === undefined || projectile.projectileId === projectileId);
    actor.effectActorWorld.projectilesOwnedBy = projectilesOwnedBy;
    opponent.effectActorWorld.projectilesOwnedBy = projectilesOwnedBy;
    const input = { actor, opponent, characters: [actor, opponent] };
    expect(world.create({ actor: opponent, opponent: actor, characters: [opponent, actor] }).projVar?.(99, 0, "VelMul Z")).toBe(2);

    expect(world.evaluateNumber("ProjVar(var(0), 0, Pos X)", input)).toBe(32);
    expect(world.evaluateNumber("ProjVar(77, var(1), ProjID)", input)).toBe(77);
    expect(world.evaluateNumber("ProjVar(-1, 2, ProjID)", input)).toBe(88);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, Time)", input)).toBe(9);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, Pos X)", input)).toBe(40);
    expect(world.evaluateNumber("ProjVar(77, 0, PauseMoveTime)", input)).toBe(5);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, SuperMoveTime)", input)).toBe(11);
    expect(world.evaluateNumber("ProjVar(77, 0, RemVelocity X)", input)).toBe(4);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, RemVelocity Y)", input)).toBe(3);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, RemVelocity Z)", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, VelMul Z)", input)).toBe(2);
    expect(world.evaluateNumber("ProjVar(99, 0, VelMul Z)", {
      actor: opponent,
      opponent: actor,
      characters: [opponent, actor],
    })).toBe(2);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, VelMul Z)", input)).toBe(2);
    expect(world.evaluateNumber("ProjVar(77, 0, ProjLayerNo)", input)).toBe(-1);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, ProjLayerNo)", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, ProjAngle)", input)).toBe(-15);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, ProjAngle)", input)).toBe(30);
    expect(world.evaluateNumber("ProjVar(77, 0, Angle X)", input)).toBe(-10);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, Angle Y)", input)).toBe(25);
    expect(evaluateExpression("ProjVar(77, 0, XShear)", world.create(input))).toBe(-0.25);
    expect(evaluateExpression("EnemyNear, ProjVar(99, 0, XShear)", world.create(input))).toBe(0.5);
    expect(world.evaluateNumber("ProjVar(77, 0, Shadow R)", input)).toBe(16);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, Shadow B)", input)).toBe(128);
    expect(world.evaluateNumber("ProjVar(77, 9, ProjID)", input)).toBeUndefined();
    expect(world.evaluateNumber("ProjVar(77, 0, DrawPal.Group)", input)).toBe(2);
    expect(world.evaluateNumber("ProjVar(77, 0, DrawPal.Index)", input)).toBe(5);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, DrawPal.Group)", input)).toBe(4);
    expect(world.evaluateNumber("ProjVar(77, 0, attr) = SCA, SP", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, attr) = SCA, S", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, guardflag) = L", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, guardflag) != L", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, hitflag) = H", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, hitflag) != H", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 0, attr) != S, NA", input)).toBe(0);
    expect(world.evaluateNumber("ProjVar(77, 0, attr) != A, NA", input)).toBe(1);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, attr) = A, HP", input)).toBe(1);
    expect(world.evaluateNumber("EnemyNear, ProjVar(99, 0, hitflag) = D", input)).toBe(1);
    expect(world.evaluateNumber("ProjVar(77, 9, hitflag) != D", input)).toBe(0);
  });

  it("reads the mutable RedLife resource in plain CNS expressions", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { redLife: 125 });
    const opponent = runtimeActor("p2", "Rival");

    expect(world.evaluateNumber("RedLife", { actor, opponent })).toBe(125);
    expect(world.evaluateNumber("RedLife >= 100", { actor, opponent })).toBe(1);
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

  it("reads the runtime round phase and preserves fight as the legacy fallback", () => {
    const world = new RuntimeExpressionContextWorld();
    const closingActor = runtimeActor("p1", "Author", { roundPhase: 3 });
    const opponent = runtimeActor("p2", "Rival");

    expect(world.evaluateNumber("RoundState", { actor: closingActor, opponent })).toBe(3);
    expect(world.evaluateNumber("RoundState", { actor: runtimeActor("p1", "Author"), opponent })).toBe(2);
    expect(world.evaluateNumber("MatchOver", {
      actor: runtimeActor("p1", "Author", { matchOver: true }),
      opponent,
    })).toBe(1);
  });

  it("exposes every authored RoundState boundary, including the Fight-screen lock", () => {
    const world = new RuntimeExpressionContextWorld();
    const opponent = runtimeActor("p2", "Rival");

    for (const phase of [0, 1, 2, 3, 4] as const) {
      expect(world.evaluateNumber("RoundState", {
        actor: runtimeActor("p1", "Author", { roundPhase: phase }),
        opponent,
      })).toBe(phase);
    }
  });

  it("reads the bounded Ikemen FightScreen trigger projection", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    actor.fightScreen = {
      introState: 3,
      fightTime: 42,
      state: { fightDisplay: false, koDisplay: false, roundDisplay: true, winDisplay: false },
      vars: {
        "round.ctrl.time": 30,
        "round.start.waittime": 12,
        "round.callfight.time": 3,
        "info.localcoord.x": 1280,
      },
      gameVars: { introtime: 12, outrotime: 0, pausetime: 0, slowtime: 0, superpausetime: 0 },
    };
    const opponent = runtimeActor("p2", "Rival");

    expect(world.evaluateNumber("IntroState", { actor, opponent })).toBe(3);
    expect(world.evaluateNumber("FightScreenState(rounddisplay)", { actor, opponent })).toBe(1);
    expect(world.evaluateNumber("FightScreenState(FightDisplay)", { actor, opponent })).toBe(0);
    expect(world.evaluateNumber("FightScreenVar(Round.Ctrl.Time)", { actor, opponent })).toBe(30);
    expect(world.evaluateNumber("FightScreenVar(Info.LocalCoord.X)", { actor, opponent })).toBe(1280);
    expect(world.evaluateNumber("FightTime", { actor, opponent })).toBe(42);
    expect(world.evaluateNumber("GameVar(IntroTime)", { actor, opponent })).toBe(12);
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
    const secondPartner = runtimeActor("p5", "P5 Author", { life: 500, pos: { x: -60, y: 0 } });
    const thirdPartner = runtimeActor("p7", "P7 Author", { life: 300, pos: { x: -80, y: 0 } });
    const secondaryEnemy = runtimeActor("p4", "P4 Author", { life: 600, pos: { x: 20, y: 0 } });
    const input = {
      actor,
      opponent: primaryEnemy,
      characters: [actor, primaryEnemy, partner, secondPartner, thirdPartner, secondaryEnemy],
      rootSelection: {
        actorId: actor.id,
        side: 1 as const,
        partnerIds: [partner.id, secondPartner.id, thirdPartner.id],
        enemyIds: [primaryEnemy.id, secondaryEnemy.id],
        p2CandidateIds: [primaryEnemy.id, secondaryEnemy.id],
      },
    };

    expect(world.evaluateNumber("NumPartner + Partner, Life + Enemy, Life + Enemy(1), Life + P2Life", input)).toBe(2803);
    expect(world.evaluateNumber('P3Name = "p3" && P4Name = "p2" && P5Name = "p5" && P7Name = "p7"', input)).toBe(1);
    expect(world.evaluateNumber("EnemyNear, Life", input)).toBe(600);
    expect(world.evaluateNumber("Enemy(var(2)), Life", input)).toBe(600);
    expect(world.evaluateNumber("Partner(1), Life", input)).toBe(500);
  });

  it("resolves explicit P2 reads by nearest candidate while preserving Enemy order", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "P1 Author", { pos: { x: 0, y: 0 } });
    const far = runtimeActor("p3", "Far P2", { life: 333, pos: { x: 160, y: 0 } });
    const near = runtimeActor("p5", "Near P2", { life: 875, pos: { x: 80, y: 0 } });
    const input = {
      actor,
      opponent: far,
      characters: [actor, far, near],
      rootSelection: {
        actorId: actor.id,
        side: 1 as const,
        partnerIds: [],
        enemyIds: [far.id, near.id],
        p2CandidateIds: [far.id, near.id],
      },
    };

    expect(world.evaluateNumber("P2Life", input)).toBe(875);
    expect(world.evaluateNumber("EnemyNear(0), Life + EnemyNear(1), Life", input)).toBe(1208);
  });

  it("uses the source-shaped P2 policy for explicit root selections without changing EnemyNear", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "P1 Author", { pos: { x: 0, y: 0 }, facing: 1 });
    const behind = runtimeActor("p4", "Behind P2", { life: 222, pos: { x: -5, y: 0 } });
    const front = runtimeActor("p2", "Front P2", { life: 111, pos: { x: 34, y: 0 } });
    const input = {
      actor,
      opponent: behind,
      characters: [actor, behind, front],
      rootSelection: {
        actorId: actor.id,
        side: 1 as const,
        partnerIds: [],
        enemyIds: [behind.id, front.id],
        p2CandidateIds: [behind.id, front.id],
      },
    };

    expect(world.evaluateNumber("P2Life", input)).toBe(111);
    expect(world.evaluateNumber("EnemyNear(0), Life + EnemyNear(1), Life", input)).toBe(333);
  });

  it("uses the same source-shaped P2 roster for P4Name while EnemyNear stays separate", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "P1 Author", { pos: { x: 0, y: 0 }, facing: 1 });
    const behind = runtimeActor("p2", "Behind P2", { life: 222, pos: { x: -5, y: 0 } });
    const front = runtimeActor("p4", "Front P2", { life: 111, pos: { x: 34, y: 0 } });
    const far = runtimeActor("p6", "Far P2", { life: 333, pos: { x: 80, y: 0 } });
    const farther = runtimeActor("p8", "Farther P2", { life: 444, pos: { x: 120, y: 0 } });
    const input = {
      actor,
      opponent: behind,
      characters: [actor, behind, front, far, farther],
      rootSelection: {
        actorId: actor.id,
        side: 1 as const,
        partnerIds: [],
        enemyIds: [behind.id, front.id, far.id, farther.id],
        p2CandidateIds: [behind.id, front.id, far.id, farther.id],
      },
    };

    expect(world.evaluateNumber('P2Life + (P4Name = "p2") * 1000 + (P6Name = "p6") * 10 + (P8Name = "p8") * 100', input)).toBe(111 + 1000 + 10 + 100);
    expect(world.evaluateNumber("EnemyNear(0), Life + EnemyNear(1), Life", input)).toBe(222 + 111);
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
      hitVelocity: { x: -4, y: -2, z: 1.5 },
      hitVars: {
        damage: 23,
        hitDamage: 37,
        guardDamage: 4,
        kill: false,
        sourceGuardKo: true,
        sourcePlayerId: 56,
        sourcePlayerNo: 7,
        sourceProjectileId: 77,
        sourceTeamSide: 1,
        sourcePriority: 7,
        sourceDizzyPoints: 23,
        sourceGuardPoints: 31,
        guardCount: 3,
        comboHitCount: 4,
        sourceRedLife: 37,
        sourceGuardPower: 41,
        sourceHitPower: 47,
        sourcePower: 41,
        sourceFacing: -1,
        sourceScore: 6.5,
        keepState: true,
        frame: true,
        sourceAttr: "S,HA",
        sourceGuardFlag: "MA",
        sourceHitFlag: "MAF",
        hitId: 88,
        chainId: 44,
        hitCount: 3,
        hitOffset: { x: 16, y: -24, z: 0 },
        animType: 2,
        groundAnimType: 1,
        airAnimType: 4,
        fallAnimType: 5,
        groundType: 2,
        airType: 3,
        xAccel: -0.18,
        yAccel: 0.37,
        zAccel: 0.22,
        hitVelocities: {
          ground: { x: 3, y: -2, z: 1.5 },
          air: { x: 4, y: -6, z: 2.25 },
          down: { x: 5, y: -7, z: 3.5 },
          guard: { x: 2, y: -1, z: 0.75 },
          airGuard: { x: 1, y: -3, z: 1.25 },
        },
        hitVelocityAdd: { x: 4, y: 2 },
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
        velocity: { x: -2, y: -8, z: 2.5 },
        envShake: { time: 15, freq: 178, ampl: 6, phase: 0, mul: 0.75, dir: 67.5 },
      },
    });

    expect(runtimeDefinitionConst(actor.definition, " DATA.ATTACK ")).toBe(200);
    expect(runtimeActorHasState(actor, 555)).toBe(true);
    expect(runtimeActorHasState(actor, 777)).toBe(false);
    expect(runtimeActorHasState({ ...actor, runtimeProgram: undefined }, 777)).toBe(true);
    expect(runtimeHitVar(actor.runtime, "damage")).toBe(23);
    expect(runtimeHitVar(actor.runtime, "hitdamage")).toBe(37);
    expect(runtimeHitVar(actor.runtime, "guarddamage")).toBe(4);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "hitdamage")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "kill")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "guardko")).toBe(1);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "guardko")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "playerid")).toBe(56);
    expect(runtimeHitVar(actor.runtime, "ID")).toBe(56);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "playerid")).toBe(0);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "ID")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "playerno")).toBe(7);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "playerno")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "projid")).toBe(77);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "projid")).toBe(-1);
    expect(runtimeHitVar(actor.runtime, "teamside")).toBe(1);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "teamside")).toBe(-1);
    expect(runtimeHitVar(actor.runtime, "keepstate")).toBe(1);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "keepstate")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "frame")).toBe(1);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "frame")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "priority")).toBe(7);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "priority")).toBe(4);
    expect(runtimeHitVar(actor.runtime, "dizzypoints")).toBe(23);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "dizzypoints")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "guardpoints")).toBe(31);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "guardpoints")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "guardcount")).toBe(3);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "guardcount")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "redlife")).toBe(37);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "redlife")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "guardpower")).toBe(41);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "guardpower")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "hitpower")).toBe(47);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "hitpower")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "power")).toBe(41);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "power")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "facing")).toBe(-1);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "facing")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "score")).toBe(6.5);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "score")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "hitid")).toBe(88);
    expect(runtimeHitVar(actor.runtime, "chainid")).toBe(44);
    expect(runtimeHitVar(actor.runtime, "hitcount")).toBe(4);
    expect(runtimeHitVar(runtimeActor("p3", "AuthoredOnly", { hitVars: { hitCount: 3 } }).runtime, "hitcount")).toBe(3);
    expect(runtimeHitVar(actor.runtime, "xoff")).toBe(16);
    expect(runtimeHitVar(actor.runtime, "yoff")).toBe(-24);
    expect(runtimeHitVar(actor.runtime, "zoff")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "type")).toBe(2);
    expect(runtimeHitVar(actor.runtime, "animtype")).toBe(2);
    expect(runtimeHitVar(actor.runtime, "ground.animtype")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "air.animtype")).toBe(4);
    expect(runtimeHitVar(actor.runtime, "fall.animtype")).toBe(5);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "air.animtype")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "groundtype")).toBe(2);
    expect(runtimeHitVar(actor.runtime, "airtype")).toBe(3);
    expect(runtimeHitVar(actor.runtime, "xaccel")).toBeCloseTo(-0.18, 5);
    expect(runtimeHitVar(actor.runtime, "yaccel")).toBeCloseTo(0.37, 5);
    expect(runtimeHitVar(actor.runtime, "zaccel")).toBeCloseTo(0.22, 5);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "xaccel")).toBe(0);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "zaccel")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "isbound")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "guarded")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "xvel")).toBe(-4);
    expect(runtimeHitVar(actor.runtime, "yvel")).toBe(-2);
    expect(runtimeHitVar(actor.runtime, "zvel")).toBe(1.5);
    expect(runtimeHitVar(actor.runtime, "xveladd")).toBe(4);
    expect(runtimeHitVar(actor.runtime, "yveladd")).toBe(2);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "xveladd")).toBe(0);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "yveladd")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "ground.velocity.x")).toBe(3);
    expect(runtimeHitVar(actor.runtime, "ground.velocity.y")).toBe(-2);
    expect(runtimeHitVar(actor.runtime, "ground.velocity.z")).toBe(1.5);
    expect(runtimeHitVar(actor.runtime, "air.velocity.y")).toBe(-6);
    expect(runtimeHitVar(actor.runtime, "air.velocity.z")).toBe(2.25);
    expect(runtimeHitVar(actor.runtime, "down.velocity.x")).toBe(5);
    expect(runtimeHitVar(actor.runtime, "guard.velocity.z")).toBe(0.75);
    expect(runtimeHitVar(actor.runtime, "airguard.velocity.y")).toBe(-3);
    expect(runtimeHitVar(actor.runtime, "airguard.velocity.z")).toBe(1.25);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "air.velocity.z")).toBe(0);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "zvel")).toBe(0);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(zvel)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(playerno)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(7);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(playerid)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(56);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(ID)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(56);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(guardko)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(keepstate)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(frame)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(priority)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(7);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(dizzypoints)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(23);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(guardpoints)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(31);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(guardcount)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(3);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(redlife)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(37);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(guardpower)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(41);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(hitpower)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(47);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(power)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(41);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(facing)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(-1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(score)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(6);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(attr) = SCA, HA", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(attr) != A, NT", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(guardflag) = L", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(guardflag) != D", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(hitflag) = H", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(hitflag) = F", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(hitflag) != D", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(1);
    expect(new RuntimeExpressionContextWorld().evaluateNumber("GetHitVar(ground.animtype) + GetHitVar(air.animtype) + GetHitVar(fall.animtype)", {
      actor,
      opponent: runtimeActor("p2", "Rival"),
    })).toBe(10);
    expect(runtimeHitVar(actor.runtime, "fallcount")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "fall.damage")).toBe(31);
    expect(runtimeHitVar(actor.runtime, "fall.defence_up")).toBe(80);
    expect(runtimeHitVar(actor.runtime, "fall.xvel")).toBe(-2);
    expect(runtimeHitVar(actor.runtime, "fall.zvel")).toBe(2.5);
    expect(runtimeHitVar(actor.runtime, "fall.zvelocity")).toBe(2.5);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.time")).toBe(15);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.freq")).toBe(178);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.ampl")).toBe(6);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.phase")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.mul")).toBeCloseTo(0.75, 5);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "fall.envshake.mul")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "fall.envshake.dir")).toBeCloseTo(67.5, 5);
    expect(runtimeHitVar(runtimeActor("p3", "Omitted").runtime, "fall.envshake.dir")).toBe(0);
    expect(runtimeHitVar(actor.runtime, "hittime")).toBe(9);
    expect(runtimeHitVar(actor.runtime, "slidetime")).toBe(5);
    expect(runtimeHitVar(actor.runtime, "ctrltime")).toBe(7);

    actor.runtime.ctrl = false;
    actor.runtime.guardSlideTimeRemaining = 2;
    actor.runtime.guardControlTimeRemaining = 3;
    new RuntimeStunWorld().advance(actor);
    expect(actor.runtime.guardSlideTimeRemaining).toBe(1);
    expect(actor.runtime.guardControlTimeRemaining).toBe(2);
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
    currentAction: undefined,
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

function emptyAnimationFrame(index: number) {
  return {
    spriteGroup: 0,
    spriteIndex: index,
    offsetX: 0,
    offsetY: 0,
    duration: 1,
    clsn1: [],
    clsn2: [],
    raw: "",
    line: index,
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
