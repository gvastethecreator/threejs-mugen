import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";

export const RUNTIME_ROUND_PHASE_SCHEMA = "mugen-web-sandbox/runtime-round-phase/v0";

export type RuntimeRoundPhase = 0 | 1 | 2 | 3 | 4;

export type RuntimeRoundPhaseName =
  | "pre-intro"
  | "intro"
  | "fight"
  | "pre-over"
  | "over";

export type RuntimeRoundPhaseEvent =
  | "pre-intro"
  | "intro"
  | "fight"
  | "round-finished"
  | "round-over"
  | "reset";

export type RuntimeRoundPhaseSnapshot = {
  schema: typeof RUNTIME_ROUND_PHASE_SCHEMA;
  profile: RuntimeCompatibilityProfile;
  phase: RuntimeRoundPhase;
  name: RuntimeRoundPhaseName;
  diagnostics: string[];
};

export type RuntimeRoundPhaseTransition = {
  applied: boolean;
  event: RuntimeRoundPhaseEvent;
  from: RuntimeRoundPhase;
  to: RuntimeRoundPhase;
  snapshot: RuntimeRoundPhaseSnapshot;
  diagnostics: string[];
};

const PHASE_NAMES: Record<RuntimeRoundPhase, RuntimeRoundPhaseName> = {
  0: "pre-intro",
  1: "intro",
  2: "fight",
  3: "pre-over",
  4: "over",
};

const TRANSITIONS: Record<RuntimeRoundPhaseEvent, Partial<Record<RuntimeRoundPhase, RuntimeRoundPhase>>> = {
  "pre-intro": { 2: 0, 4: 0 },
  intro: { 0: 1 },
  fight: { 1: 2 },
  "round-finished": { 2: 3 },
  "round-over": { 3: 4 },
  reset: { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2 },
};

export class RuntimeRoundPhaseWorld {
  private phase: RuntimeRoundPhase;

  constructor(
    private readonly profile: RuntimeCompatibilityProfile = "unknown",
    initialPhase: RuntimeRoundPhase = 2,
  ) {
    this.phase = initialPhase;
  }

  get currentPhase(): RuntimeRoundPhase {
    return this.phase;
  }

  snapshot(diagnostics: readonly string[] = []): RuntimeRoundPhaseSnapshot {
    return {
      schema: RUNTIME_ROUND_PHASE_SCHEMA,
      profile: this.profile,
      phase: this.phase,
      name: PHASE_NAMES[this.phase],
      diagnostics: [...new Set(diagnostics)].sort(compareStableStrings),
    };
  }

  transition(event: RuntimeRoundPhaseEvent): RuntimeRoundPhaseTransition {
    const from = this.phase;
    const next = TRANSITIONS[event][from];
    if (next === undefined) {
      const diagnostic = `invalid-phase-transition:${from}:${event}`;
      return {
        applied: false,
        event,
        from,
        to: from,
        snapshot: this.snapshot([diagnostic]),
        diagnostics: [diagnostic],
      };
    }

    this.phase = next;
    return {
      applied: true,
      event,
      from,
      to: next,
      snapshot: this.snapshot(),
      diagnostics: [],
    };
  }
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
