import type { RuntimeTeamRoundMode } from "./RuntimeTeamRoundDecisionSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeTeamState } from "./types";

export const RUNTIME_TEAM_ROUND_LIFEBAR_SCHEMA = "mugen-web-sandbox/runtime-team-round-lifebar/v0";

export type RuntimeTeamRoundLifebarActor = {
  id: string;
  label: string;
  side: RuntimeTeamSide;
  memberNo?: number;
  life: number;
  lifeMax: number;
  redLife?: number;
  teamState: RuntimeTeamState;
};

export type RuntimeTeamRoundLifebarSlotStatus = "active" | "standby" | "ko" | "disabled";

export type RuntimeTeamRoundLifebarSlot = {
  slot: number;
  memberNo?: number;
  actorId: string;
  label: string;
  role: "leader" | "member";
  status: RuntimeTeamRoundLifebarSlotStatus;
  life: number;
  lifeMax: number;
  ratio: number;
  redLife: number;
  redLifeRatio: number;
};

export type RuntimeTeamRoundLifebarSide = {
  side: RuntimeTeamSide;
  leaderId?: string;
  activeActorIds: string[];
  slots: RuntimeTeamRoundLifebarSlot[];
};

export type RuntimeTeamRoundLifebarDiagnostic = {
  schema: typeof RUNTIME_TEAM_ROUND_LIFEBAR_SCHEMA;
  tick: number;
  mode: RuntimeTeamRoundMode;
  visible: boolean;
  sides: [RuntimeTeamRoundLifebarSide, RuntimeTeamRoundLifebarSide];
  diagnostics: string[];
};

export type RuntimeTeamRoundLifebarInput = {
  actors: readonly RuntimeTeamRoundLifebarActor[];
  mode: RuntimeTeamRoundMode;
  visible: boolean;
  tick?: number;
};

export class RuntimeTeamRoundLifebarWorld {
  snapshot(input: RuntimeTeamRoundLifebarInput): RuntimeTeamRoundLifebarDiagnostic {
    const diagnostics: string[] = [];
    const actorsBySide: Record<RuntimeTeamSide, RuntimeTeamRoundLifebarActor[]> = { 1: [], 2: [] };
    const seenIds = new Set<string>();

    for (const actor of input.actors) {
      const actorId = actor.id.trim();
      if (!actorId) {
        diagnostics.push("invalid-actor-id");
        continue;
      }
      if (seenIds.has(actorId)) {
        diagnostics.push(`duplicate-actor:${actorId}`);
        continue;
      }
      seenIds.add(actorId);
      if (actor.side !== 1 && actor.side !== 2) {
        diagnostics.push(`invalid-side:${actorId}`);
        continue;
      }
      if (!Number.isFinite(actor.life)) {
        diagnostics.push(`invalid-life:${actorId}`);
      }
      if (!Number.isFinite(actor.lifeMax) || actor.lifeMax <= 0) {
        diagnostics.push(`invalid-life-max:${actorId}`);
      }
      actorsBySide[actor.side].push({
        ...actor,
        id: actorId,
        label: actor.label.trim() || actorId,
      });
    }

    const sides: [RuntimeTeamRoundLifebarSide, RuntimeTeamRoundLifebarSide] = [
      createSide(1, actorsBySide[1]),
      createSide(2, actorsBySide[2]),
    ];

    return {
      schema: RUNTIME_TEAM_ROUND_LIFEBAR_SCHEMA,
      tick: normalizeTick(input.tick),
      mode: input.mode,
      visible: input.visible,
      sides,
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }
}

function createSide(
  side: RuntimeTeamSide,
  actors: readonly RuntimeTeamRoundLifebarActor[],
): RuntimeTeamRoundLifebarSide {
  const orderedActors = [...actors].sort(compareActors);
  const slots = orderedActors.map((actor, slot) => {
    const life = Number.isFinite(actor.life) ? actor.life : 0;
    const lifeMax = Number.isFinite(actor.lifeMax) && actor.lifeMax > 0 ? actor.lifeMax : 0;
    const redLife = Number.isFinite(actor.redLife) ? Math.max(0, actor.redLife!) : 0;
    return {
      slot,
      ...(actor.memberNo === undefined ? {} : { memberNo: actor.memberNo }),
      actorId: actor.id,
      label: actor.label,
      role: slot === 0 ? "leader" : "member",
      status: slotStatus(actor),
      life,
      lifeMax,
      ratio: lifeMax > 0 ? clampRatio(life / lifeMax) : 0,
      redLife,
      redLifeRatio: lifeMax > 0 ? clampRatio(redLife / lifeMax) : 0,
    } satisfies RuntimeTeamRoundLifebarSlot;
  });

  return {
    side,
    ...(slots[0] ? { leaderId: slots[0].actorId } : {}),
    activeActorIds: slots.filter((slot) => slot.status === "active").map((slot) => slot.actorId),
    slots,
  };
}

function slotStatus(actor: RuntimeTeamRoundLifebarActor): RuntimeTeamRoundLifebarSlotStatus {
  if (actor.teamState.disabled) return "disabled";
  if (actor.teamState.overKo || actor.life <= 0) return "ko";
  if (actor.teamState.standby) return "standby";
  return "active";
}

function compareActors(left: RuntimeTeamRoundLifebarActor, right: RuntimeTeamRoundLifebarActor): number {
  if (left.memberNo !== undefined && right.memberNo !== undefined && left.memberNo !== right.memberNo) {
    return left.memberNo - right.memberNo;
  }
  if (left.memberNo !== undefined) return -1;
  if (right.memberNo !== undefined) return 1;
  return compareStableStrings(left.id, right.id);
}

function normalizeTick(tick: number | undefined): number {
  return Number.isFinite(tick) ? Math.max(0, Math.round(tick!)) : 0;
}

function clampRatio(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
