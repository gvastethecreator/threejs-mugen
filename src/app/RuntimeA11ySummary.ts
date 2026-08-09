import type { MugenSnapshot } from "../mugen/runtime/types";

export type RuntimeA11yMode = "match" | "lab" | "inspect" | "studio";

export type RuntimeA11yGamepadStatus = {
  seat: 1 | 2;
  connected: boolean;
  mapping: "standard" | "non-standard" | "disconnected";
};

export function buildRuntimeA11ySummary(input: {
  snapshot: MugenSnapshot;
  mode: RuntimeA11yMode;
  gamepads?: [RuntimeA11yGamepadStatus, RuntimeA11yGamepadStatus];
}): string {
  const { snapshot, mode } = input;
  const stage = snapshot.stage.displayName ?? "Stage";
  const playback = snapshot.playing ? "Playing" : "Paused";
  const surface = mode === "match" ? "Match" : mode === "lab" ? "Fighter Lab" : mode === "studio" ? "Studio" : "Inspector";
  const actors = snapshot.actors.slice(0, 2);

  if (actors.length === 0) {
    return `${surface} viewport on ${stage}. ${playback}. No fighter is loaded.`;
  }

  const actorSummary = actors
    .map((actor) => {
      const lifeMax = actor.runtime.lifeMax ?? 1000;
      const condition = actor.runtime.guarding ? "guarding" : actor.runtime.ctrl ? "ready" : "locked";
      return `${actor.label}: ${actor.runtime.life} of ${lifeMax} life, state ${actor.runtime.stateNo}, ${condition}`;
    })
    .join(". ");
  const round = snapshot.round
    ? `Round ${snapshot.round.roundNo ?? 1}, ${snapshot.round.state}, timer ${snapshot.round.timer}`
    : "Preview state";
  const pause = snapshot.matchPause ? ` ${snapshot.matchPause.type} active.` : "";
  const controls = input.gamepads
    ? ` Controls: P1 keyboard and ${describeGamepad(input.gamepads[0])}; P2 ${describeGamepad(input.gamepads[1])}.`
    : "";

  return `${surface} viewport on ${stage}. ${playback}. ${round}. ${actorSummary}.${pause}${controls}`;
}

function describeGamepad(status: RuntimeA11yGamepadStatus): string {
  if (!status.connected) return "gamepad disconnected";
  return status.mapping === "standard" ? "standard gamepad" : "non-standard gamepad";
}
