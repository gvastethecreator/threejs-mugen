/**
 * LiveGlobalProjectileSchedule/v1 (DA28-06).
 * Gathers live RuntimeProjectile actors into GlobalProjectileSchedule and returns
 * a stable ordered list for combat/clash resolution.
 */

import {
  runGlobalProjectileSchedule,
  type GlobalProjectileScheduleResult,
  type GlobalProjectileWorkItem,
} from "./GlobalProjectileSchedule";
import type { RuntimeProjectile } from "./ProjectileSystem";
import { runtimeTeamSideFromId, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";

export const LIVE_GLOBAL_PROJECTILE_SCHEDULE_SCHEMA = "LiveGlobalProjectileSchedule/v1" as const;

export type LiveProjectileScheduleSubject = {
  projectile: RuntimeProjectile;
  work: GlobalProjectileWorkItem;
};

export type LiveGlobalProjectileScheduleReport = GlobalProjectileScheduleResult & {
  schemaLive: typeof LIVE_GLOBAL_PROJECTILE_SCHEDULE_SCHEMA;
  ordered: RuntimeProjectile[];
  subjects: LiveProjectileScheduleSubject[];
};

export type LiveGlobalProjectileScheduleInput = {
  projectiles: readonly RuntimeProjectile[];
  /** Absolute match tick when available; defaults to age-relative proxy. */
  tick?: number;
  /** Map owner id → side; defaults to runtimeTeamSideFromId. */
  ownerSideOf?: (ownerId: string) => 1 | 2;
  /** Include projectiles already marked for removal (default false). */
  includeMarked?: boolean;
};

export function gatherLiveProjectileWork(
  input: LiveGlobalProjectileScheduleInput,
): LiveProjectileScheduleSubject[] {
  const ownerSideOf = input.ownerSideOf ?? defaultOwnerSide;
  const tick = input.tick;
  const active = input.projectiles.filter(
    (projectile) => input.includeMarked === true || !projectile.removalReason,
  );

  const subjects: LiveProjectileScheduleSubject[] = [];

  for (const projectile of active) {
    const spawnTick =
      typeof tick === "number" && Number.isFinite(tick)
        ? Math.max(0, tick - Math.max(0, projectile.age))
        : -Math.max(0, projectile.age);
    const side = ownerSideOf(projectile.ownerId);
    // localSeq is derived from serial identity so insertion order cannot flip ties.
    const work: GlobalProjectileWorkItem = {
      id: projectile.serialId,
      ownerId: projectile.ownerId,
      ownerSide: side,
      spawnTick,
      localSeq: localSeqFromSerial(projectile.serialId),
      priority: projectile.priority,
      payload: [
        projectile.rootId,
        projectile.parentId,
        String(projectile.projectileId ?? ""),
        projectile.attr ?? "",
      ].join(":"),
    };
    subjects.push({ projectile, work });
  }
  return subjects;
}

export function runLiveGlobalProjectileSchedule(
  input: LiveGlobalProjectileScheduleInput,
): LiveGlobalProjectileScheduleReport {
  const subjects = gatherLiveProjectileWork(input);
  const schedule = runGlobalProjectileSchedule(subjects.map((subject) => subject.work));
  const byId = new Map(subjects.map((subject) => [subject.projectile.serialId, subject.projectile]));
  const ordered = schedule.order
    .map((id) => byId.get(id))
    .filter((projectile): projectile is RuntimeProjectile => projectile !== undefined);
  return {
    ...schedule,
    schemaLive: LIVE_GLOBAL_PROJECTILE_SCHEDULE_SCHEMA,
    ordered,
    subjects,
  };
}

/** Order a projectile list with the live global schedule (stable under insertion shuffle). */
export function orderProjectilesForCombat(
  projectiles: readonly RuntimeProjectile[],
  options: Omit<LiveGlobalProjectileScheduleInput, "projectiles"> = {},
): RuntimeProjectile[] {
  return runLiveGlobalProjectileSchedule({ ...options, projectiles }).ordered;
}

export function liveGlobalProjectileScheduleIsStable(
  projectiles: readonly RuntimeProjectile[],
  options: Omit<LiveGlobalProjectileScheduleInput, "projectiles"> = {},
): boolean {
  const forward = runLiveGlobalProjectileSchedule({ ...options, projectiles });
  const reverse = runLiveGlobalProjectileSchedule({
    ...options,
    projectiles: [...projectiles].reverse(),
  });
  return forward.checksum === reverse.checksum && forward.order.join(",") === reverse.order.join(",");
}

function defaultOwnerSide(ownerId: string): 1 | 2 {
  const side: RuntimeTeamSide | undefined = runtimeTeamSideFromId(ownerId);
  return side === 2 ? 2 : 1;
}

function localSeqFromSerial(serialId: string): number {
  const match = serialId.match(/(\d+)(?!.*\d)/);
  if (match) return Number(match[1]);
  let hash = 0;
  for (let i = 0; i < serialId.length; i += 1) {
    hash = (hash * 31 + serialId.charCodeAt(i)) >>> 0;
  }
  return hash % 1_000_000;
}
