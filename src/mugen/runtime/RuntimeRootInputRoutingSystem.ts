import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import type { RuntimeTagTeamMode } from "./RuntimeTagTeamOrderSystem";
import type { RuntimeTeamState } from "./types";

export type RuntimeRootCommandSource = "p1" | "p2";

export type RuntimeRootInputRoutingActor = {
  id: string;
  playerNo?: number;
  runtime: {
    ctrl: boolean;
    teamState?: RuntimeTeamState;
  };
};

export type RuntimeRootInputRoute<TActor extends RuntimeRootInputRoutingActor> = {
  actorId: string;
  actor: TActor;
  source: RuntimeRootCommandSource;
  input: Set<string>;
};

export type RuntimeRootInputRoutingRecord = {
  id: string;
  playerNo?: number;
  side: 1 | 2 | null;
  commandSource: RuntimeRootCommandSource | null;
  commandMapped: boolean;
  directControlled: boolean;
  aiControlled: boolean;
  standby: boolean;
  effectiveCtrl: boolean;
};

export type RuntimeRootInputRoutingDiagnostic = {
  schema: "RuntimeRootInputRouting/v0";
  mode: "legacy-pair" | "ikemen-single" | "ikemen-tag";
  scope: "normal-active-tick";
  roots: RuntimeRootInputRoutingRecord[];
};

export type RuntimeRootInputRoutingBaseInput<TActor extends RuntimeRootInputRoutingActor> = {
  runtimeProfile: RuntimeCompatibilityProfile;
  teamMode: RuntimeTagTeamMode;
  roots: readonly TActor[];
};

export type RuntimeRootInputRoutesInput<TActor extends RuntimeRootInputRoutingActor> =
  RuntimeRootInputRoutingBaseInput<TActor> & {
    p1Input: Set<string>;
    p2Input: Set<string>;
  };

export type RuntimeRootInputRoutingDiagnosticInput<TActor extends RuntimeRootInputRoutingActor> =
  RuntimeRootInputRoutingBaseInput<TActor> & {
    p2Controlled: boolean;
  };

export class RuntimeRootInputRoutingWorld {
  routes<TActor extends RuntimeRootInputRoutingActor>(
    input: RuntimeRootInputRoutesInput<TActor>,
  ): RuntimeRootInputRoute<TActor>[] {
    assertUniqueRootIds(input.roots);
    const mode = routingMode(input.runtimeProfile, input.teamMode);
    return input.roots.flatMap((actor): RuntimeRootInputRoute<TActor>[] => {
      const source = commandSource(actor, mode);
      if (!source) return [];
      const sideInput = source === "p1" ? input.p1Input : input.p2Input;
      return [{ actorId: actor.id, actor, source, input: new Set(sideInput) }];
    });
  }

  diagnostic<TActor extends RuntimeRootInputRoutingActor>(
    input: RuntimeRootInputRoutingDiagnosticInput<TActor>,
  ): RuntimeRootInputRoutingDiagnostic {
    assertUniqueRootIds(input.roots);
    const mode = routingMode(input.runtimeProfile, input.teamMode);
    return {
      schema: "RuntimeRootInputRouting/v0",
      mode,
      scope: "normal-active-tick",
      roots: input.roots.map((actor) => {
        const teamState = actor.runtime.teamState;
        const source = commandSource(actor, mode);
        const disabled = teamState?.disabled === true;
        const standby = teamState?.standby === true;
        return {
          id: actor.id,
          ...(actor.playerNo === undefined ? {} : { playerNo: actor.playerNo }),
          side: playerSide(actor.playerNo),
          commandSource: source,
          commandMapped: source !== null,
          directControlled: actor.id === "p1" || (actor.id === "p2" && input.p2Controlled),
          aiControlled: actor.id === "p2" && !input.p2Controlled,
          standby,
          effectiveCtrl: actor.runtime.ctrl && !disabled && !standby,
        };
      }),
    };
  }
}

function routingMode(
  runtimeProfile: RuntimeCompatibilityProfile,
  teamMode: RuntimeTagTeamMode,
): RuntimeRootInputRoutingDiagnostic["mode"] {
  if (runtimeProfile !== "ikemen-go") return "legacy-pair";
  return teamMode === "tag" ? "ikemen-tag" : "ikemen-single";
}

function commandSource(
  actor: RuntimeRootInputRoutingActor,
  mode: RuntimeRootInputRoutingDiagnostic["mode"],
): RuntimeRootCommandSource | null {
  if (mode !== "ikemen-tag") {
    if (actor.id === "p1") return "p1";
    if (actor.id === "p2") return "p2";
    return null;
  }
  const teamState = actor.runtime.teamState;
  const side = playerSide(actor.playerNo);
  if (side === null || teamState?.disabled === true || teamState?.playerType === false) return null;
  return side === 1 ? "p1" : "p2";
}

function playerSide(playerNo: number | undefined): 1 | 2 | null {
  if (!Number.isSafeInteger(playerNo) || playerNo === undefined || playerNo < 1 || playerNo > 8) return null;
  return playerNo % 2 === 1 ? 1 : 2;
}

function assertUniqueRootIds(roots: readonly RuntimeRootInputRoutingActor[]): void {
  const ids = new Set<string>();
  for (const root of roots) {
    if (ids.has(root.id)) throw new Error(`Duplicate root input routing actor ${root.id}`);
    ids.add(root.id);
  }
}
