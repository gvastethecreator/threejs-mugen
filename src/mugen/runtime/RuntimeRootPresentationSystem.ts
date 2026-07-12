import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import type { RuntimeTagTeamMode } from "./RuntimeTagTeamOrderSystem";
import { runtimeTeamSide, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";
import type { RuntimeAssertSpecial, RuntimeTeamState } from "./types";

export type RuntimeRootPresentationActor = {
  id: string;
  runtime: {
    teamState?: RuntimeTeamState;
    assertSpecial?: Pick<RuntimeAssertSpecial, "invisible">;
    screenBound?: { moveCameraX: boolean };
  };
};

export type RuntimeRootDrawReason =
  | "pair"
  | "tag-active"
  | "not-pair"
  | "missing-team-state"
  | "disabled"
  | "non-player"
  | "invalid-side"
  | "standby-proxy"
  | "invisible";

export type RuntimeRootCameraReason =
  | "pair"
  | "tag-active"
  | "not-pair"
  | "missing-team-state"
  | "disabled"
  | "non-player"
  | "invalid-side"
  | "standby"
  | "screenbound-disabled";

export type RuntimeRootCollisionReason =
  | "pair"
  | "tag-active"
  | "not-pair"
  | "missing-team-state"
  | "disabled"
  | "non-player"
  | "invalid-side"
  | "standby";

export type RuntimeRootPresentationEntry = {
  id: string;
  side: RuntimeTeamSide | null;
  draw: boolean;
  drawReason: RuntimeRootDrawReason;
  cameraX: boolean;
  cameraReason: RuntimeRootCameraReason;
  collisionDebug: boolean;
  collisionReason: RuntimeRootCollisionReason;
};

export type RuntimeRootPresentationDiagnostic = {
  schema: "RuntimeRootPresentation/v1";
  mode: "pair" | "ikemen-tag";
  roots: RuntimeRootPresentationEntry[];
  drawRootIds: string[];
  cameraRootIds: string[];
  collisionRootIds: string[];
};

export type RuntimeRootPresentationInput<TActor extends RuntimeRootPresentationActor> = {
  runtimeProfile: RuntimeCompatibilityProfile;
  teamMode: RuntimeTagTeamMode;
  roots: readonly TActor[];
  playableRoots: readonly [TActor, TActor];
};

export class RuntimeRootPresentationWorld {
  diagnostic<TActor extends RuntimeRootPresentationActor>(
    input: RuntimeRootPresentationInput<TActor>,
  ): RuntimeRootPresentationDiagnostic {
    assertRoots(input.roots, input.playableRoots);
    const tagMode = input.runtimeProfile === "ikemen-go" && input.teamMode === "tag";
    const pair = new Set<TActor>(input.playableRoots);
    const roots = input.roots.map((actor) => entryFor(actor, pair.has(actor), tagMode));

    return {
      schema: "RuntimeRootPresentation/v1",
      mode: tagMode ? "ikemen-tag" : "pair",
      roots,
      drawRootIds: tagMode ? orderedRootIds(roots, "draw") : input.playableRoots.map((root) => root.id),
      cameraRootIds: tagMode ? orderedRootIds(roots, "cameraX") : input.playableRoots.map((root) => root.id),
      collisionRootIds: tagMode ? orderedRootIds(roots, "collisionDebug") : input.playableRoots.map((root) => root.id),
    };
  }
}

function entryFor(
  actor: RuntimeRootPresentationActor,
  pairOwned: boolean,
  tagMode: boolean,
): RuntimeRootPresentationEntry {
  const side = runtimeTeamSide(actor) ?? null;
  if (!tagMode) {
    return {
      id: actor.id,
      side,
      draw: pairOwned,
      drawReason: pairOwned ? "pair" : "not-pair",
      cameraX: pairOwned,
      cameraReason: pairOwned ? "pair" : "not-pair",
      collisionDebug: pairOwned,
      collisionReason: pairOwned ? "pair" : "not-pair",
    };
  }

  const unavailableReason = unavailableTagReason(actor, side);
  if (unavailableReason) {
    return {
      id: actor.id,
      side,
      draw: false,
      drawReason: unavailableReason,
      cameraX: false,
      cameraReason: unavailableReason,
      collisionDebug: false,
      collisionReason: unavailableReason,
    };
  }

  const standby = actor.runtime.teamState!.standby;
  const invisible = actor.runtime.assertSpecial?.invisible === true;
  const cameraDisabled = actor.runtime.screenBound?.moveCameraX === false;
  return {
    id: actor.id,
    side,
    draw: !standby && !invisible,
    drawReason: standby ? "standby-proxy" : invisible ? "invisible" : "tag-active",
    cameraX: !standby && !cameraDisabled,
    cameraReason: standby ? "standby" : cameraDisabled ? "screenbound-disabled" : "tag-active",
    collisionDebug: !standby,
    collisionReason: standby ? "standby" : "tag-active",
  };
}

function unavailableTagReason(
  actor: RuntimeRootPresentationActor,
  side: RuntimeTeamSide | null,
): Extract<RuntimeRootDrawReason, "missing-team-state" | "disabled" | "non-player" | "invalid-side"> | undefined {
  const teamState = actor.runtime.teamState;
  if (!teamState) return "missing-team-state";
  if (teamState.disabled) return "disabled";
  if (!teamState.playerType) return "non-player";
  if (side === null) return "invalid-side";
  return undefined;
}

function orderedRootIds(
  roots: readonly RuntimeRootPresentationEntry[],
  key: "draw" | "cameraX" | "collisionDebug",
): string[] {
  return ([1, 2] as const).flatMap((side) => roots
    .filter((root) => root.side === side && root[key])
    .map((root) => root.id));
}

function assertRoots<TActor extends RuntimeRootPresentationActor>(
  roots: readonly TActor[],
  playableRoots: readonly [TActor, TActor],
): void {
  const rootSet = new Set<TActor>();
  const ids = new Set<string>();
  for (const root of roots) {
    if (rootSet.has(root)) throw new Error(`Duplicate root presentation actor object ${root.id}`);
    if (ids.has(root.id)) throw new Error(`Duplicate root presentation actor id ${root.id}`);
    rootSet.add(root);
    ids.add(root.id);
  }
  if (playableRoots[0] === playableRoots[1] || playableRoots.some((root) => !rootSet.has(root))) {
    throw new Error("Root presentation playable pair must contain two distinct registered roots");
  }
}
