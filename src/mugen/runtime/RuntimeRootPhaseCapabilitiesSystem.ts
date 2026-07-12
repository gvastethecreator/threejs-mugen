import type {
  RuntimeRootInputRoutingDiagnostic,
  RuntimeRootInputRoutingRecord,
} from "./RuntimeRootInputRoutingSystem";
import type {
  RuntimeRootParticipationDiagnostic,
  RuntimeRootParticipationRecord,
} from "./RuntimeRootParticipationSystem";
import type { RuntimeTeamState } from "./types";

export type RuntimeRootControllerCnsCapability = "none" | "bounded-reserve" | "active-motion" | "playable";

export type RuntimeRootPhaseCapabilities = {
  commands: boolean;
  controllerCns: RuntimeRootControllerCnsCapability;
  directInput: boolean;
  ai: boolean;
  kinematics: boolean;
  animation: boolean;
  constraints: boolean;
  bodyPush: boolean;
  hitAdmission: boolean;
  effects: boolean;
  combat: boolean;
  round: boolean;
  presentation: boolean;
  resources: boolean;
};

export type RuntimeRootPhaseCapabilitiesRecord = {
  id: string;
  playerNo?: number;
  side: 1 | 2 | null;
  disabled: boolean;
  standby: boolean;
  overKo: boolean;
  playerType: boolean;
  available: boolean;
  structurallyActive: boolean;
  scheduled: boolean;
  effectiveCtrl: boolean;
  phases: RuntimeRootPhaseCapabilities;
};

export type RuntimeRootPhaseCapabilitiesDiagnostic = {
  schema: "RuntimeRootPhaseCapabilities/v4";
  mode: RuntimeRootInputRoutingDiagnostic["mode"];
  roots: RuntimeRootPhaseCapabilitiesRecord[];
};

export type RuntimeRootPhaseCapabilitiesInput = {
  roots: readonly {
    id: string;
    side: 1 | 2 | null;
    teamState: RuntimeTeamState;
  }[];
  participation: RuntimeRootParticipationDiagnostic;
  inputRouting: RuntimeRootInputRoutingDiagnostic;
  resourceOwnedRootIds: readonly string[];
};

const NO_PHASE_CAPABILITIES: RuntimeRootPhaseCapabilities = {
  commands: false,
  controllerCns: "none",
  directInput: false,
  ai: false,
  kinematics: false,
  animation: false,
  constraints: false,
  bodyPush: false,
  hitAdmission: false,
  effects: false,
  combat: false,
  round: false,
  presentation: false,
  resources: false,
};

export class RuntimeRootPhaseCapabilitiesWorld {
  diagnostic(input: RuntimeRootPhaseCapabilitiesInput): RuntimeRootPhaseCapabilitiesDiagnostic {
    assertMatchingIds(input);
    const participationById = new Map(input.participation.roots.map((root) => [root.id, root]));
    const routingById = new Map(input.inputRouting.roots.map((root) => [root.id, root]));
    const resourceOwned = new Set(input.resourceOwnedRootIds);

    return {
      schema: "RuntimeRootPhaseCapabilities/v4",
      mode: input.inputRouting.mode,
      roots: input.roots.map((root) => {
        const participation = participationById.get(root.id)!;
        const routing = routingById.get(root.id)!;
        assertMatchingRootState(root, participation, routing);
        const available = rootAvailable(root, routing);
        const phases = available
          ? phaseCapabilities(
              participation,
              routing,
              resourceOwned.has(root.id),
              input.inputRouting.mode === "ikemen-tag",
            )
          : { ...NO_PHASE_CAPABILITIES };
        return {
          id: root.id,
          ...(routing.playerNo === undefined ? {} : { playerNo: routing.playerNo }),
          side: root.side,
          disabled: root.teamState.disabled,
          standby: root.teamState.standby,
          overKo: root.teamState.overKo,
          playerType: root.teamState.playerType,
          available,
          structurallyActive: participation.structurallyActive,
          scheduled: participation.scheduled,
          effectiveCtrl: available && routing.effectiveCtrl,
          phases,
        };
      }),
    };
  }
}

function phaseCapabilities(
  participation: RuntimeRootParticipationRecord,
  routing: RuntimeRootInputRoutingRecord,
  resourceOwned: boolean,
  tagMode: boolean,
): RuntimeRootPhaseCapabilities {
  const playable = participation.inputOwned && (!tagMode || participation.structurallyActive);
  const activeMotion =
    tagMode &&
    participation.scheduled &&
    participation.structurallyActive &&
    !participation.inputOwned;
  return {
    commands: routing.commandMapped,
    controllerCns: participation.scheduled
      ? playable
        ? "playable"
        : activeMotion
          ? "active-motion"
          : "bounded-reserve"
      : "none",
    directInput: playable && routing.directControlled,
    ai: playable && routing.aiControlled,
    kinematics: playable || activeMotion,
    animation: playable || activeMotion,
    constraints: playable || activeMotion,
    bodyPush: tagMode ? participation.scheduled && !participation.standby : participation.inputOwned,
    hitAdmission: tagMode && participation.scheduled && !participation.standby,
    effects: participation.effectStoreOwned,
    combat: participation.combatOwned,
    round: participation.roundOwned,
    presentation: participation.presented,
    resources: resourceOwned,
  };
}

function rootAvailable(
  root: RuntimeRootPhaseCapabilitiesInput["roots"][number],
  routing: RuntimeRootInputRoutingRecord,
): boolean {
  if (root.side !== 1 && root.side !== 2) return false;
  if (!root.teamState.playerType || root.teamState.disabled) return false;
  return routing.side === null || routing.side === root.side;
}

function assertMatchingIds(input: RuntimeRootPhaseCapabilitiesInput): void {
  const rootIds = sortedUniqueIds(input.roots.map(({ id }) => id));
  const participationIds = sortedUniqueIds(input.participation.roots.map(({ id }) => id));
  const routingIds = sortedUniqueIds(input.inputRouting.roots.map(({ id }) => id));
  if (
    rootIds.length !== input.roots.length ||
    participationIds.length !== input.participation.roots.length ||
    routingIds.length !== input.inputRouting.roots.length ||
    rootIds.join("\0") !== participationIds.join("\0") ||
    rootIds.join("\0") !== routingIds.join("\0")
  ) {
    throw new Error("Root phase capability ids must match participation and input routing");
  }
  if (input.resourceOwnedRootIds.some((id) => !rootIds.includes(id))) {
    throw new Error("Root phase capability resources reference an unknown root");
  }
}

function assertMatchingRootState(
  root: RuntimeRootPhaseCapabilitiesInput["roots"][number],
  participation: RuntimeRootParticipationRecord,
  routing: RuntimeRootInputRoutingRecord,
): void {
  if (
    participation.disabled !== root.teamState.disabled ||
    participation.standby !== root.teamState.standby ||
    routing.standby !== root.teamState.standby ||
    participation.structurallyActive !== structurallyActive(root.teamState)
  ) {
    throw new Error(`Root phase capability state drift for ${root.id}`);
  }
  if (root.side !== null && (participation.side !== root.side || (routing.side !== null && routing.side !== root.side))) {
    throw new Error(`Root phase capability side drift for ${root.id}`);
  }
}

function structurallyActive(teamState: RuntimeTeamState): boolean {
  return teamState.playerType && !teamState.disabled && !teamState.standby && !teamState.overKo;
}

function sortedUniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids)].sort((left, right) => left.localeCompare(right));
}
