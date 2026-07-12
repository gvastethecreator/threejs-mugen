import { describe, expect, it } from "vitest";
import {
  RuntimeRootInputRoutingWorld,
  type RuntimeRootInputRoutingActor,
} from "../mugen/runtime/RuntimeRootInputRoutingSystem";

describe("RuntimeRootInputRoutingWorld", () => {
  it("fans explicit IKEMEN Tag side streams into independent same-side root routes", () => {
    const world = new RuntimeRootInputRoutingWorld();
    const roots = [
      actor("p1", 1, { ctrl: true }),
      actor("p2", 2, { ctrl: true }),
      actor("p3", 3, { ctrl: true, standby: true }),
      actor("p4", 4, { ctrl: false, standby: true }),
    ];
    const p1Input = new Set(["x"]);
    const p2Input = new Set(["y"]);

    const routes = world.routes({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots,
      p1Input,
      p2Input,
    });
    p1Input.add("z");
    p2Input.clear();

    expect(routes.map(({ actorId, source, input }) => [actorId, source, [...input]])).toEqual([
      ["p1", "p1", ["x"]],
      ["p2", "p2", ["y"]],
      ["p3", "p1", ["x"]],
      ["p4", "p2", ["y"]],
    ]);
    expect(routes[0]?.input).not.toBe(routes[2]?.input);
    expect(routes[1]?.input).not.toBe(routes[3]?.input);
  });

  it("publishes command, direct-control, AI, standby, and effective-control ownership separately", () => {
    const world = new RuntimeRootInputRoutingWorld();
    const roots = [
      actor("p1", 1, { ctrl: true }),
      actor("p2", 2, { ctrl: true }),
      actor("p3", 3, { ctrl: true, standby: true }),
      actor("p4", 4, { ctrl: false, standby: true }),
    ];

    expect(world.diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots,
      p2Controlled: false,
    })).toEqual({
      schema: "RuntimeRootInputRouting/v0",
      mode: "ikemen-tag",
      scope: "normal-active-tick",
      roots: [
        {
          id: "p1",
          playerNo: 1,
          side: 1,
          commandSource: "p1",
          commandMapped: true,
          directControlled: true,
          aiControlled: false,
          standby: false,
          effectiveCtrl: true,
        },
        {
          id: "p2",
          playerNo: 2,
          side: 2,
          commandSource: "p2",
          commandMapped: true,
          directControlled: false,
          aiControlled: true,
          standby: false,
          effectiveCtrl: true,
        },
        {
          id: "p3",
          playerNo: 3,
          side: 1,
          commandSource: "p1",
          commandMapped: true,
          directControlled: false,
          aiControlled: false,
          standby: true,
          effectiveCtrl: false,
        },
        {
          id: "p4",
          playerNo: 4,
          side: 2,
          commandSource: "p2",
          commandMapped: true,
          directControlled: false,
          aiControlled: false,
          standby: true,
          effectiveCtrl: false,
        },
      ],
    });
  });

  it("keeps legacy and IKEMEN Single command mapping pair-only", () => {
    const world = new RuntimeRootInputRoutingWorld();
    const roots = [actor("p1", 1), actor("p2", 2), actor("p3", 3, { standby: true })];

    for (const [runtimeProfile, teamMode, expectedMode] of [
      ["unknown", "tag", "legacy-pair"],
      ["mugen-1.1", "tag", "legacy-pair"],
      ["ikemen-go", "single", "ikemen-single"],
    ] as const) {
      const routes = world.routes({
        runtimeProfile,
        teamMode,
        roots,
        p1Input: new Set(["x"]),
        p2Input: new Set(["y"]),
      });
      const diagnostic = world.diagnostic({ runtimeProfile, teamMode, roots, p2Controlled: true });

      expect(routes.map(({ actorId }) => actorId)).toEqual(["p1", "p2"]);
      expect(diagnostic.mode).toBe(expectedMode);
      expect(diagnostic.roots.find(({ id }) => id === "p3")?.commandMapped).toBe(false);
    }
  });

  it("fails closed for invalid, disabled, and non-player Tag roots", () => {
    const world = new RuntimeRootInputRoutingWorld();
    const roots = [
      actor("p1", 1),
      actor("p2", 2),
      actor("p3", undefined, { standby: true }),
      actor("p5", 5, { disabled: true, standby: true }),
      actor("p7", 7, { playerType: false, standby: true }),
    ];

    const routes = world.routes({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots,
      p1Input: new Set(["x"]),
      p2Input: new Set(["y"]),
    });
    const diagnostic = world.diagnostic({
      runtimeProfile: "ikemen-go",
      teamMode: "tag",
      roots,
      p2Controlled: true,
    });

    expect(routes.map(({ actorId }) => actorId)).toEqual(["p1", "p2"]);
    expect(diagnostic.roots.slice(2).map(({ commandSource, commandMapped }) => [commandSource, commandMapped])).toEqual([
      [null, false],
      [null, false],
      [null, false],
    ]);
  });
});

function actor(
  id: string,
  playerNo?: number,
  options: {
    ctrl?: boolean;
    disabled?: boolean;
    standby?: boolean;
    playerType?: boolean;
  } = {},
): RuntimeRootInputRoutingActor {
  return {
    id,
    ...(playerNo === undefined ? {} : { playerNo }),
    runtime: {
      ctrl: options.ctrl ?? true,
      teamState: {
        disabled: options.disabled ?? false,
        standby: options.standby ?? false,
        overKo: false,
        playerType: options.playerType ?? true,
      },
    },
  };
}
