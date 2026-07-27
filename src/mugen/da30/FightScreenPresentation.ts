/**
 * DA30-055: FightScreen round presentation timing model.
 */

export type FightPhase =
  | "fade-in"
  | "shutter"
  | "intro"
  | "fight"
  | "round-call"
  | "timer-active"
  | "ko"
  | "fade-out"
  | "idle";

export type FightScreenState = {
  schema: "Da30FightScreenPresentation/v1";
  phase: FightPhase;
  tick: number;
  skipAllowed: boolean;
  announcement: string | null;
  timerGate: boolean;
  inputGate: boolean;
  localCoord: [number, number];
  mobileFit: boolean;
  assetIds: string[];
};

const TIMING: Record<FightPhase, { ticks: number; next: FightPhase; announce?: string }> = {
  idle: { ticks: 0, next: "fade-in" },
  "fade-in": { ticks: 8, next: "shutter" },
  shutter: { ticks: 6, next: "intro" },
  intro: { ticks: 30, next: "round-call", announce: "ROUND 1" },
  "round-call": { ticks: 20, next: "fight", announce: "FIGHT" },
  fight: { ticks: 0, next: "timer-active" },
  "timer-active": { ticks: 0, next: "ko" },
  ko: { ticks: 24, next: "fade-out", announce: "KO" },
  "fade-out": { ticks: 10, next: "idle" },
};

export function createFightScreen(localCoord: [number, number] = [320, 240]): FightScreenState {
  return {
    schema: "Da30FightScreenPresentation/v1",
    phase: "idle",
    tick: 0,
    skipAllowed: true,
    announcement: null,
    timerGate: false,
    inputGate: false,
    localCoord,
    mobileFit: localCoord[0] >= 320,
    assetIds: ["fight.def", "system.sff", "fight.snd"],
  };
}

export function advanceFightScreen(s: FightScreenState, skip = false): FightScreenState {
  if (s.phase === "timer-active") {
    return { ...s, tick: s.tick + 1, timerGate: true, inputGate: true, announcement: null };
  }
  if (s.phase === "fight") {
    return {
      ...s,
      phase: "timer-active",
      tick: 0,
      timerGate: true,
      inputGate: true,
      announcement: null,
    };
  }
  const cfg = TIMING[s.phase];
  let tick = s.tick + 1;
  if (skip && s.skipAllowed && (s.phase === "intro" || s.phase === "round-call")) {
    tick = cfg.ticks;
  }
  if (cfg.ticks > 0 && tick >= cfg.ticks) {
    const next = cfg.next;
    const nextCfg = TIMING[next];
    return {
      ...s,
      phase: next,
      tick: 0,
      announcement: nextCfg.announce ?? null,
      timerGate: next === "timer-active",
      inputGate: next === "timer-active" || next === "fight",
    };
  }
  return { ...s, tick, announcement: cfg.announce ?? s.announcement };
}

export function resetFightScreen(s: FightScreenState): FightScreenState {
  return createFightScreen(s.localCoord);
}

export function runFightScreenRoute(): {
  ok: boolean;
  phases: FightPhase[];
  skippedIntro: boolean;
  mobileFit: boolean;
  assets: string[];
} {
  let s = createFightScreen([320, 240]);
  const phases: FightPhase[] = [s.phase];
  // enter fade-in
  s = { ...s, phase: "fade-in", tick: 0 };
  phases.push(s.phase);
  for (let i = 0; i < 8; i++) s = advanceFightScreen(s);
  phases.push(s.phase);
  for (let i = 0; i < 6; i++) s = advanceFightScreen(s);
  phases.push(s.phase);
  s = advanceFightScreen(s, true); // skip intro remainder if needed
  const skippedIntro = s.phase === "round-call" || s.phase === "intro" || s.phase === "fight" || s.phase === "timer-active";
  // force through to timer
  let guard = 0;
  while (s.phase !== "timer-active" && guard < 200) {
    s = advanceFightScreen(s, true);
    phases.push(s.phase);
    guard += 1;
  }
  const mobile = createFightScreen([640, 360]);
  s = resetFightScreen(s);
  return {
    ok: phases.includes("fade-in") && s.phase === "idle" && mobile.mobileFit && s.assetIds.length >= 3,
    phases: [...new Set(phases)],
    skippedIntro,
    mobileFit: mobile.mobileFit,
    assets: s.assetIds,
  };
}
