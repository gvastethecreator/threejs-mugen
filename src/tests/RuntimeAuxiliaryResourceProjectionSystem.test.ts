import { describe, expect, it } from "vitest";
import {
  RuntimeAuxiliaryResourceProjectionWorld,
  type RuntimeAuxiliaryResourceProjectionInputActor,
} from "../mugen/runtime/RuntimeAuxiliaryResourceProjectionSystem";

const teamState = {
  disabled: false,
  standby: false,
  overKo: false,
  playerType: true,
};

function actor(
  id: string,
  overrides: Partial<RuntimeAuxiliaryResourceProjectionInputActor> = {},
): RuntimeAuxiliaryResourceProjectionInputActor {
  return {
    id,
    actorKind: "root",
    rootId: id,
    parentId: id,
    resourceOwnerId: id,
    side: 1,
    rootOrder: 0,
    teamState,
    runtime: {
      life: 1000,
      lifeMax: 1000,
      redLife: 25,
      guardPointsMax: 800,
      guardPoints: 700,
      dizzyPointsMax: 900,
      dizzyPoints: 800,
    },
    ...overrides,
  };
}

describe("RuntimeAuxiliaryResourceProjectionWorld", () => {
  it("orders roots and Helpers deterministically and keeps dizzy support explicit", () => {
    const diagnostic = new RuntimeAuxiliaryResourceProjectionWorld().snapshot({
      tick: 12.4,
      actors: [
        actor("p3", { rootOrder: 1, memberNo: 1 }),
        actor("helper-p3", {
          actorKind: "helper",
          rootId: "p3",
          parentId: "p3",
          resourceOwnerId: "helper-p3",
          rootOrder: 1,
          runOrder: 9,
          teamState: { ...teamState, playerType: false },
        }),
        actor("p1", { memberNo: 0 }),
        actor("helper-p1", {
          actorKind: "helper",
          rootId: "p1",
          parentId: "p1",
          resourceOwnerId: "helper-p1",
          runOrder: 8,
          teamState: { ...teamState, playerType: false },
        }),
      ],
    });

    expect(diagnostic).toMatchObject({
      schema: "mugen-web-sandbox/runtime-auxiliary-resource-projection/v0",
      tick: 12,
      ownership: {
        redLife: { owner: "actor", share: "deferred-root-life-share" },
        guardPoints: { owner: "actor", share: "none" },
        dizzyPoints: { owner: "actor", share: "none" },
      },
      mutation: { redLife: "bounded", guardPoints: "bounded", dizzyPoints: "bounded" },
      suppression: { redLife: "unimplemented", guardPoints: "unimplemented", dizzyPoints: "unimplemented" },
      excludedActorKinds: ["projectile", "explod"],
      diagnostics: [],
    });
    expect(diagnostic.actors.map(({ id }) => id)).toEqual(["p1", "helper-p1", "p3", "helper-p3"]);
    expect(diagnostic.actors[0]?.resources).toEqual({
      redLife: { status: "available", ownerId: "p1", scope: "actor-local", value: 25, max: 1000 },
      guardPoints: { status: "available", ownerId: "p1", scope: "actor-local", value: 700, max: 800 },
      dizzyPoints: { status: "available", ownerId: "p1", scope: "actor-local", value: 800, max: 900 },
    });
    expect(diagnostic.actors[1]?.resources.redLife.ownerId).toBe("helper-p1");
    expect(diagnostic.actors[1]?.resources.guardPoints.scope).toBe("actor-local");
  });

  it("normalizes invalid maxima and values while retaining owner diagnostics", () => {
    const diagnostic = new RuntimeAuxiliaryResourceProjectionWorld().snapshot({
      actors: [
        actor("bad", {
          runtime: {
            life: Number.NaN,
            lifeMax: 0,
            redLife: 1200,
            guardPointsMax: -1,
            guardPoints: 1200,
          },
        }),
        actor("orphan-helper", {
          actorKind: "helper",
          rootId: "missing-root",
          parentId: "missing-root",
          resourceOwnerId: "orphan-helper",
          teamState: { ...teamState, playerType: false },
        }),
      ],
    });

    expect(diagnostic.diagnostics).toEqual([
      "clamped-guard-points:bad",
      "clamped-red-life:bad",
      "invalid-guard-points-max:bad",
      "invalid-life-max:bad",
      "invalid-life:bad",
      "orphan-helper-root:orphan-helper:missing-root",
    ]);
    expect(diagnostic.actors.find(({ id }) => id === "bad")?.resources).toMatchObject({
      redLife: { value: 1000, max: 1000 },
      guardPoints: { value: 1000, max: 1000 },
    });
  });

  it("does not mutate source runtime or team ownership state", () => {
    const source = actor("p1");
    const diagnostic = new RuntimeAuxiliaryResourceProjectionWorld().snapshot({ actors: [source] });

    source.runtime.redLife = 900;
    source.teamState!.standby = true;

    expect(diagnostic.actors[0]?.resources.redLife.value).toBe(25);
    expect(diagnostic.actors[0]?.teamState?.standby).toBe(false);
  });
});
