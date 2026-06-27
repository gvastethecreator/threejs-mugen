import type { MatchInput } from "./PlayableMatchRuntime";
import type {
  MatchWorldActorLifecycleEvent,
  MatchWorldActorLifecycleRecord,
  MatchWorldActorRegistrySnapshot,
  MatchWorldTargetLink,
} from "./MatchWorld";
import type {
  ActorCompatibilitySession,
  ActorSnapshot,
  CompatibilitySessionSnapshot,
  MugenSnapshot,
  RuntimeActorKind,
  RuntimeMatchPauseSnapshot,
  RoundSnapshot,
} from "./types";

export type RuntimeTraceInputFrame = {
  label?: string;
  p1?: string[];
  p2?: string[];
  force?: boolean;
};

export type RuntimeTraceScriptSegment = RuntimeTraceInputFrame & {
  frames?: number;
};

export type RuntimeTraceActor = {
  id: string;
  label: string;
  actorKind: ActorSnapshot["actorKind"];
  ownerId: string;
  rootId: string;
  parentId: string;
  source?: ActorSnapshot["source"];
  stateNo: number;
  animNo: number;
  animTime: number;
  frameIndex: number;
  life: number;
  power: number;
  ctrl: boolean;
  stateType: string;
  moveType: string;
  physics: string;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  renderScale?: { x: number; y: number };
  facing: 1 | -1;
  hitPause: number;
  guarding: boolean;
  guardStun: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  hitFall?: RuntimeTraceHitFallSummary;
  customOwnerId?: string;
  clsn1Count: number;
  clsn2Count: number;
};

export type RuntimeTraceCompatibilityActor = Pick<
  ActorCompatibilitySession,
  | "actorId"
  | "label"
  | "executedStates"
  | "routedStates"
  | "activeCommands"
  | "commandHistory"
  | "lastRoutedState"
  | "lastExecutedState"
> & {
  executedControllers: Record<string, number>;
  executedOperations: Record<string, number>;
};

export type RuntimeTraceEvent = {
  frameIndex: number;
  tick: number;
  category: "hit" | "guard" | "reject" | "override" | "reversal" | "pause" | "round" | "runtime";
  line: string;
};

export type RuntimeTraceCombatReason = {
  frameIndex: number;
  tick: number;
  reason: "hit" | "guard" | "whiff" | "reject" | "override" | "reversal";
  source: "log" | "inferred";
  actorId?: string;
  detail: string;
};

export type RuntimeTraceHitFallSummary = {
  falling: boolean;
  damage: number;
  kill?: boolean;
  velocity: {
    x?: number;
    y: number;
  };
  recover?: boolean;
  recoverTime?: number;
  downRecover?: boolean;
  downRecoverTime?: number;
  envShake?: {
    time: number;
    freq: number;
    ampl: number;
    phase: number;
  };
};

export type RuntimeTraceHitFallRequirement = {
  falling?: boolean;
  damage?: number;
  kill?: boolean;
  velocityX?: number;
  velocityY?: number;
  recover?: boolean;
  recoverTime?: number;
  downRecover?: boolean;
  downRecoverTime?: number;
  envShakeTime?: number;
  envShakeAmpl?: number;
};

export type RuntimeTraceFrame = {
  frameIndex: number;
  tick: number;
  label?: string;
  input: {
    p1: string[];
    p2?: string[];
    force: boolean;
  };
  actors: RuntimeTraceActor[];
  effects: RuntimeTraceActor[];
  round?: RoundSnapshot;
  matchPause?: RuntimeMatchPauseSnapshot;
  compatibility?: RuntimeTraceCompatibilityActor[];
  events: RuntimeTraceEvent[];
  combatReasons: RuntimeTraceCombatReason[];
  world?: RuntimeTraceWorldSummary;
  checksum: string;
};

export type RuntimeTraceWorldSummary = {
  live: string[];
  spawnedThisTick: string[];
  removedThisTick: string[];
  removed: string[];
  eventsThisTick: RuntimeTraceWorldLifecycleEvent[];
  recentEvents: RuntimeTraceWorldLifecycleEvent[];
  effectStores: RuntimeTraceWorldEffectStoreSummary[];
  targetLinks: RuntimeTraceWorldTargetLink[];
  lifecycle: RuntimeTraceWorldLifecycleRecord[];
};

export type RuntimeTraceWorldEffectStoreSummary = MatchWorldActorRegistrySnapshot["effectStores"][number];
export type RuntimeTraceWorldTargetLink = MatchWorldTargetLink;

export type RuntimeTraceWorldLifecycleRecord = Pick<
  MatchWorldActorLifecycleRecord,
  | "id"
  | "label"
  | "kind"
  | "layer"
  | "ownerId"
  | "rootId"
  | "parentId"
  | "status"
  | "firstSeenTick"
  | "lastSeenTick"
  | "ageTicks"
>;

export type RuntimeTraceWorldLifecycleEvent = Pick<
  MatchWorldActorLifecycleEvent,
  "type" | "id" | "label" | "kind" | "layer" | "ownerId" | "rootId" | "parentId" | "tick" | "ageTicks"
>;

export type RuntimeTraceTargetLinkRequirement = {
  ownerId?: string;
  actorId?: string;
  targetId?: number;
  hasBinding?: boolean;
};

export type RuntimeTraceWorldLifecycleEventRequirement = {
  type?: RuntimeTraceWorldLifecycleEvent["type"];
  id?: string;
  kind?: RuntimeActorKind;
  layer?: RuntimeTraceWorldLifecycleEvent["layer"];
  ownerId?: string;
  rootId?: string;
  parentId?: string;
};

export type RuntimeTraceGateWorldLifecycleEventEvidence = {
  type: RuntimeTraceWorldLifecycleEvent["type"];
  id: string;
  label: string;
  kind: RuntimeActorKind;
  layer: RuntimeTraceWorldLifecycleEvent["layer"];
  ownerId: string;
  rootId: string;
  parentId: string;
  firstTick: number;
  lastTick: number;
  count: number;
};

export type RuntimeTraceEffectStoreRequirement = {
  ownerId?: string;
  minTotal?: number;
  minExplods?: number;
  minHelpers?: number;
  minProjectiles?: number;
  minNextExplodSerial?: number;
  minNextHelperSerial?: number;
  minNextProjectileSerial?: number;
  includesExplod?: string;
  includesHelper?: string;
  includesProjectile?: string;
};

export type RuntimeTracePauseEvidenceType = RuntimeMatchPauseSnapshot["type"] | "HitPause";

export type RuntimeTraceMatchPauseRequirement = {
  type?: RuntimeTracePauseEvidenceType;
  actorId?: string;
  sourceStateNo?: number;
  darken?: boolean;
  minFrames?: number;
  minRemaining?: number;
  minMoveTime?: number;
};

export type RuntimeTraceMatchPauseFreezeRequirement = {
  type?: RuntimeTracePauseEvidenceType;
  actorId?: string;
  actorKind?: RuntimeActorKind;
  ownerId?: string;
  minFrozenFrames?: number;
};

export type RuntimeTraceMatchPauseAdvanceRequirement = {
  type?: RuntimeTracePauseEvidenceType;
  actorId?: string;
  actorKind?: RuntimeActorKind;
  ownerId?: string;
  minAdvancedFrames?: number;
  minPreviousMoveTime?: number;
};

export type RuntimeTraceGateEffectStoreEvidence = {
  ownerId: string;
  total: number;
  explods: string[];
  helpers: string[];
  projectiles: string[];
  nextSerials: RuntimeTraceWorldEffectStoreSummary["nextSerials"];
};

export type RuntimeTraceGateMatchPauseEvidence = {
  type: RuntimeTracePauseEvidenceType;
  actorId: string;
  sourceStateNo?: number;
  darken: boolean;
  firstTick: number;
  lastTick: number;
  frames: number;
  maxRemaining: number;
  maxMoveTime: number;
};

export type RuntimeTraceGateMatchPauseFreezeEvidence = {
  type: RuntimeTracePauseEvidenceType;
  actorId: string;
  actorKind: RuntimeActorKind;
  ownerId: string;
  firstTick: number;
  lastTick: number;
  frozenFrames: number;
  comparedFields: string[];
};

export type RuntimeTraceGateMatchPauseAdvanceEvidence = {
  type: RuntimeTracePauseEvidenceType;
  actorId: string;
  actorKind: RuntimeActorKind;
  ownerId: string;
  firstTick: number;
  lastTick: number;
  advancedFrames: number;
  maxPreviousMoveTime: number;
  changedFields: string[];
};

export type RuntimeTraceGateTargetLinkEvidence = {
  ownerId: string;
  actorId: string;
  targetId?: number;
  hasBinding: boolean;
};

export type RuntimeTraceFinalActorRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  stateNo?: number;
  animNo?: number;
  life?: number;
  ctrl?: boolean;
  stateType?: string;
  moveType?: string;
  physics?: string;
  guarding?: boolean;
  hitFall?: RuntimeTraceHitFallRequirement;
};

export type RuntimeTraceActorFrameRequirement = {
  actorId?: string;
  source?: NonNullable<ActorSnapshot["source"]>;
  actorKind?: RuntimeActorKind;
  ownerId?: string;
  animNo?: number;
  moveType?: string;
  clsn1Count?: number;
  clsn2Count?: number;
  minFrames?: number;
  observedPosXAtLeast?: number;
  observedPosXAtMost?: number;
  observedPosYAtLeast?: number;
  observedPosYAtMost?: number;
  observedVelXAtLeast?: number;
  observedVelXAtMost?: number;
  observedVelYAtLeast?: number;
  observedVelYAtMost?: number;
  observedScaleXAtLeast?: number;
  observedScaleXAtMost?: number;
  observedScaleYAtLeast?: number;
  observedScaleYAtMost?: number;
};

export type RuntimeTraceGateActorFrameEvidence = {
  actorId: string;
  label: string;
  source?: ActorSnapshot["source"];
  actorKind: RuntimeActorKind;
  ownerId: string;
  animNo: number;
  moveType: string;
  clsn1Count: number;
  clsn2Count: number;
  minPos: { x: number; y: number };
  maxPos: { x: number; y: number };
  minVel: { x: number; y: number };
  maxVel: { x: number; y: number };
  minScale: { x: number; y: number };
  maxScale: { x: number; y: number };
  firstTick: number;
  lastTick: number;
  frames: number;
};

export type RuntimeTraceGateFinalActorEvidence = Pick<
  RuntimeTraceActor,
  | "id"
  | "label"
  | "actorKind"
  | "source"
  | "stateNo"
  | "animNo"
  | "life"
  | "ctrl"
  | "stateType"
  | "moveType"
  | "physics"
  | "guarding"
  | "hitFall"
>;

export type RuntimeTrace = {
  label: string;
  frameCount: number;
  initial: Omit<RuntimeTraceFrame, "input" | "events">;
  frames: RuntimeTraceFrame[];
  events: RuntimeTraceEvent[];
  combatReasons: RuntimeTraceCombatReason[];
  final: RuntimeTraceFrame;
  checksum: string;
};

export type RuntimeTraceGate = {
  label: string;
  requiredActorSources?: Array<NonNullable<ActorSnapshot["source"]>>;
  requiredActorKinds?: RuntimeActorKind[];
  requiredEffectKinds?: RuntimeActorKind[];
  requiredRoutedStates?: number[];
  requiredExecutedStates?: number[];
  requiredExecutedControllers?: Array<string | { type: string; minCount: number }>;
  requiredExecutedOperations?: Array<string | { operation: string; minCount: number }>;
  requiredActiveCommands?: string[];
  requiredEventCategories?: RuntimeTraceEvent["category"][];
  requiredEventSubstrings?: string[];
  requiredCombatReasons?: RuntimeTraceCombatReason["reason"][];
  requiredWorldLifecycleEvents?: RuntimeTraceWorldLifecycleEventRequirement[];
  requiredEffectStores?: RuntimeTraceEffectStoreRequirement[];
  requiredMatchPauses?: RuntimeTraceMatchPauseRequirement[];
  requiredMatchPauseFreezes?: RuntimeTraceMatchPauseFreezeRequirement[];
  requiredMatchPauseAdvances?: RuntimeTraceMatchPauseAdvanceRequirement[];
  requiredTargetLinks?: RuntimeTraceTargetLinkRequirement[];
  requiredActorFrames?: RuntimeTraceActorFrameRequirement[];
  requiredFinalActors?: RuntimeTraceFinalActorRequirement[];
};

export type RuntimeTraceGateEvidence = {
  actorSources: string[];
  actorKinds: RuntimeActorKind[];
  effectKinds: RuntimeActorKind[];
  routedStates: number[];
  executedStates: number[];
  executedControllers: Record<string, number>;
  executedOperations: Record<string, number>;
  activeCommands: string[];
  eventCategories: RuntimeTraceEvent["category"][];
  eventLines: string[];
  combatReasons: RuntimeTraceCombatReason["reason"][];
  worldLifecycleEvents: RuntimeTraceGateWorldLifecycleEventEvidence[];
  effectStores: RuntimeTraceGateEffectStoreEvidence[];
  matchPauses: RuntimeTraceGateMatchPauseEvidence[];
  matchPauseFreezes: RuntimeTraceGateMatchPauseFreezeEvidence[];
  matchPauseAdvances: RuntimeTraceGateMatchPauseAdvanceEvidence[];
  targetLinks: RuntimeTraceGateTargetLinkEvidence[];
  actorFrames: RuntimeTraceGateActorFrameEvidence[];
  finalActors: RuntimeTraceGateFinalActorEvidence[];
};

export type RuntimeTraceGateResult = {
  label: string;
  passed: boolean;
  failures: string[];
  evidence: RuntimeTraceGateEvidence;
};

export type RuntimeTraceRunner = {
  getSnapshot(): MugenSnapshot;
  step(input: MatchInput, options?: { force?: boolean }): MugenSnapshot;
  getActorRegistry?(): MatchWorldActorRegistrySnapshot;
};

export function expandRuntimeTraceScript(segments: RuntimeTraceScriptSegment[]): RuntimeTraceInputFrame[] {
  return segments.flatMap((segment) => {
    const count = Math.max(1, Math.floor(segment.frames ?? 1));
    return Array.from({ length: count }, (_, index) => ({
      label: index === 0 ? segment.label : undefined,
      p1: cloneInputTokens(segment.p1),
      p2: segment.p2 === undefined ? undefined : cloneInputTokens(segment.p2),
      force: segment.force,
    }));
  });
}

export function runRuntimeTrace(
  runtime: RuntimeTraceRunner,
  script: RuntimeTraceInputFrame[],
  options: { label?: string } = {},
): RuntimeTrace {
  let snapshot = runtime.getSnapshot();
  let previousLogs = snapshot.logs;
  const initial = summarizeTraceSnapshot(-1, snapshot, undefined, [], options.label ?? "initial", readActorRegistry(runtime));
  const frames: RuntimeTraceFrame[] = [];

  for (const [frameIndex, frame] of script.entries()) {
    const input = toMatchInput(frame);
    snapshot = runtime.step(input, frame.force ? { force: true } : undefined);
    const newLogs = collectNewLogs(previousLogs, snapshot.logs);
    previousLogs = snapshot.logs;
    frames.push(summarizeTraceSnapshot(frameIndex, snapshot, frame, newLogs, undefined, readActorRegistry(runtime)));
  }

  const final = frames.at(-1) ?? summarizeTraceSnapshot(0, snapshot, { p1: [], p2: [], force: false }, [], undefined, readActorRegistry(runtime));
  const events = frames.flatMap((frame) => frame.events);
  const combatReasons = frames.flatMap((frame) => frame.combatReasons);
  const checksum = hashStableJson({
    label: options.label ?? "runtime-trace",
    initial: initial.checksum,
    frames: frames.map((frame) => frame.checksum),
    final: final.checksum,
    events: events.map((event) => event.line),
    combatReasons,
  });

  return {
    label: options.label ?? "runtime-trace",
    frameCount: frames.length,
    initial,
    frames,
    events,
    combatReasons,
    final,
    checksum,
  };
}

export function evaluateRuntimeTraceGate(trace: RuntimeTrace, gate: RuntimeTraceGate): RuntimeTraceGateResult {
  const evidence = summarizeTraceGateEvidence(trace);
  const failures: string[] = [];

  for (const source of gate.requiredActorSources ?? []) {
    if (!evidence.actorSources.includes(source)) {
      failures.push(`Missing actor source: ${source}`);
    }
  }
  for (const kind of gate.requiredActorKinds ?? []) {
    if (!evidence.actorKinds.includes(kind)) {
      failures.push(`Missing actor kind: ${kind}`);
    }
  }
  for (const kind of gate.requiredEffectKinds ?? []) {
    if (!evidence.effectKinds.includes(kind)) {
      failures.push(`Missing effect kind: ${kind}`);
    }
  }
  for (const stateNo of gate.requiredRoutedStates ?? []) {
    if (!evidence.routedStates.includes(stateNo)) {
      failures.push(`Missing routed state: ${stateNo}`);
    }
  }
  for (const stateNo of gate.requiredExecutedStates ?? []) {
    if (!evidence.executedStates.includes(stateNo)) {
      failures.push(`Missing executed state: ${stateNo}`);
    }
  }
  for (const controller of gate.requiredExecutedControllers ?? []) {
    const type = typeof controller === "string" ? controller : controller.type;
    const minCount = typeof controller === "string" ? 1 : controller.minCount;
    const actual = evidence.executedControllers[type] ?? 0;
    if (actual < minCount) {
      failures.push(`Missing executed controller: ${type} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const operation of gate.requiredExecutedOperations ?? []) {
    const type = typeof operation === "string" ? operation : operation.operation;
    const minCount = typeof operation === "string" ? 1 : operation.minCount;
    const actual = evidence.executedOperations[type] ?? 0;
    if (actual < minCount) {
      failures.push(`Missing executed operation: ${type} >= ${minCount} (actual ${actual})`);
    }
  }
  for (const command of gate.requiredActiveCommands ?? []) {
    if (!evidence.activeCommands.includes(command)) {
      failures.push(`Missing active command: ${command}`);
    }
  }
  for (const category of gate.requiredEventCategories ?? []) {
    if (!evidence.eventCategories.includes(category)) {
      failures.push(`Missing event category: ${category}`);
    }
  }
  for (const substring of gate.requiredEventSubstrings ?? []) {
    const expected = substring.toLowerCase();
    if (!evidence.eventLines.some((line) => line.toLowerCase().includes(expected))) {
      failures.push(`Missing event substring: ${substring}`);
    }
  }
  for (const reason of gate.requiredCombatReasons ?? []) {
    if (!evidence.combatReasons.includes(reason)) {
      failures.push(`Missing combat reason: ${reason}`);
    }
  }
  for (const requirement of gate.requiredWorldLifecycleEvents ?? []) {
    if (!evidence.worldLifecycleEvents.some((event) => matchesWorldLifecycleEventRequirement(event, requirement))) {
      failures.push(`Missing world lifecycle event: ${describeWorldLifecycleEventRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredEffectStores ?? []) {
    if (!evidence.effectStores.some((store) => matchesEffectStoreRequirement(store, requirement))) {
      failures.push(`Missing effect store: ${describeEffectStoreRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredMatchPauses ?? []) {
    if (!evidence.matchPauses.some((pause) => matchesMatchPauseRequirement(pause, requirement))) {
      failures.push(`Missing match pause: ${describeMatchPauseRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredMatchPauseFreezes ?? []) {
    if (!evidence.matchPauseFreezes.some((freeze) => matchesMatchPauseFreezeRequirement(freeze, requirement))) {
      failures.push(`Missing match pause freeze: ${describeMatchPauseFreezeRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredMatchPauseAdvances ?? []) {
    if (!evidence.matchPauseAdvances.some((advance) => matchesMatchPauseAdvanceRequirement(advance, requirement))) {
      failures.push(`Missing match pause advance: ${describeMatchPauseAdvanceRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredTargetLinks ?? []) {
    if (!evidence.targetLinks.some((link) => matchesTargetLinkRequirement(link, requirement))) {
      failures.push(`Missing target link: ${describeTargetLinkRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredActorFrames ?? []) {
    if (!evidence.actorFrames.some((actor) => matchesActorFrameRequirement(actor, requirement))) {
      failures.push(`Missing actor frame: ${describeActorFrameRequirement(requirement)}`);
    }
  }
  for (const requirement of gate.requiredFinalActors ?? []) {
    const actor = findRequiredFinalActor(evidence.finalActors, requirement);
    if (!actor) {
      failures.push(`Missing final actor matching: ${describeFinalActorRequirement(requirement)}`);
      continue;
    }
    for (const [field, expected] of Object.entries(requirement) as Array<
      [keyof RuntimeTraceFinalActorRequirement, RuntimeTraceFinalActorRequirement[keyof RuntimeTraceFinalActorRequirement]]
    >) {
      if (expected === undefined || field === "actorId") {
        continue;
      }
      if (field === "hitFall") {
        failures.push(...compareHitFallRequirement(actor, expected as RuntimeTraceHitFallRequirement));
        continue;
      }
      if (actor[field] !== expected) {
        failures.push(`Final actor ${actor.id} ${field} expected ${String(expected)} (actual ${String(actor[field])})`);
      }
    }
  }

  return {
    label: gate.label,
    passed: failures.length === 0,
    failures,
    evidence,
  };
}

export function summarizeTraceGateEvidence(trace: RuntimeTrace): RuntimeTraceGateEvidence {
  const frames = [trace.initial, ...trace.frames, trace.final];
  const actorSources = new Set<string>();
  const actorKinds = new Set<RuntimeActorKind>();
  const effectKinds = new Set<RuntimeActorKind>();
  const routedStates = new Set<number>();
  const executedStates = new Set<number>();
  const activeCommands = new Set<string>();
  const eventCategories = new Set<RuntimeTraceEvent["category"]>();
  const eventLines = new Set<string>();
  const combatReasons = new Set<RuntimeTraceCombatReason["reason"]>();
  const worldLifecycleEvents = new Map<string, RuntimeTraceGateWorldLifecycleEventEvidence>();
  const worldLifecycleEventOccurrences = new Set<string>();
  const effectStores = new Map<string, RuntimeTraceGateEffectStoreAccumulator>();
  const matchPauses = new Map<string, RuntimeTraceGateMatchPauseEvidence>();
  const matchPauseOccurrences = new Set<string>();
  const matchPauseFreezes = new Map<string, RuntimeTraceGateMatchPauseFreezeEvidence>();
  const matchPauseAdvances = new Map<string, RuntimeTraceGateMatchPauseAdvanceEvidence>();
  const targetLinks = new Map<string, RuntimeTraceGateTargetLinkEvidence>();
  const actorFrames = new Map<string, RuntimeTraceGateActorFrameEvidence>();
  const executedControllers: Record<string, number> = {};
  const executedOperations: Record<string, number> = {};

  for (const [frameIndex, frame] of frames.entries()) {
    const allActors = [...frame.actors, ...frame.effects];
    for (const actor of frame.actors) {
      if (actor.source) {
        actorSources.add(actor.source);
      }
      actorKinds.add(actor.actorKind);
    }
    for (const effect of frame.effects) {
      effectKinds.add(effect.actorKind);
    }
    for (const actor of frame.compatibility ?? []) {
      for (const stateNo of actor.routedStates) {
        routedStates.add(stateNo);
      }
      for (const stateNo of actor.executedStates) {
        executedStates.add(stateNo);
      }
      for (const command of actor.activeCommands) {
        activeCommands.add(command);
      }
      for (const [type, count] of Object.entries(actor.executedControllers)) {
        executedControllers[type] = Math.max(executedControllers[type] ?? 0, count);
      }
      for (const [type, count] of Object.entries(actor.executedOperations)) {
        executedOperations[type] = Math.max(executedOperations[type] ?? 0, count);
      }
    }
    for (const reason of frame.combatReasons) {
      combatReasons.add(reason.reason);
    }
    for (const event of frame.world?.eventsThisTick ?? []) {
      const occurrenceKey = worldLifecycleEventOccurrenceKey(event);
      if (worldLifecycleEventOccurrences.has(occurrenceKey)) {
        continue;
      }
      worldLifecycleEventOccurrences.add(occurrenceKey);
      const evidence = summarizeWorldLifecycleEventEvidence(event);
      const key = worldLifecycleEventEvidenceKey(evidence);
      const existing = worldLifecycleEvents.get(key);
      worldLifecycleEvents.set(
        key,
        existing
          ? {
              ...existing,
              firstTick: Math.min(existing.firstTick, event.tick),
              lastTick: Math.max(existing.lastTick, event.tick),
              count: existing.count + 1,
            }
          : evidence,
      );
    }
    for (const store of frame.world?.effectStores ?? []) {
      const accumulator = effectStores.get(store.ownerId) ?? createEffectStoreAccumulator(store.ownerId);
      accumulator.total = Math.max(accumulator.total, store.total);
      accumulator.nextSerials.explod = Math.max(accumulator.nextSerials.explod, store.nextSerials.explod);
      accumulator.nextSerials.helper = Math.max(accumulator.nextSerials.helper, store.nextSerials.helper);
      accumulator.nextSerials.projectile = Math.max(accumulator.nextSerials.projectile, store.nextSerials.projectile);
      for (const id of store.explods) {
        accumulator.explods.add(id);
      }
      for (const id of store.helpers) {
        accumulator.helpers.add(id);
      }
      for (const id of store.projectiles) {
        accumulator.projectiles.add(id);
      }
      effectStores.set(store.ownerId, accumulator);
    }
    if (frame.matchPause) {
      const occurrenceKey = matchPauseOccurrenceKey(frame);
      if (!matchPauseOccurrences.has(occurrenceKey)) {
        matchPauseOccurrences.add(occurrenceKey);
        const pause = frame.matchPause;
        const key = matchPauseEvidenceKey(pause);
        const existing = matchPauses.get(key);
        matchPauses.set(
          key,
          existing
            ? {
                ...existing,
                firstTick: Math.min(existing.firstTick, frame.tick),
                lastTick: Math.max(existing.lastTick, frame.tick),
                frames: existing.frames + 1,
                maxRemaining: Math.max(existing.maxRemaining, pause.remaining),
                maxMoveTime: Math.max(existing.maxMoveTime, pause.moveTime),
              }
            : {
                type: pause.type,
                actorId: pause.actorId,
                sourceStateNo: pause.sourceStateNo,
                darken: pause.darken,
                firstTick: frame.tick,
                lastTick: frame.tick,
                frames: 1,
                maxRemaining: pause.remaining,
                maxMoveTime: pause.moveTime,
              },
        );
      }
    }
    const previousFrame = frameIndex > 0 ? frames[frameIndex - 1] : undefined;
    if (frame.matchPause && previousFrame) {
      const currentTraceActors = [...frame.actors, ...frame.effects];
      const previousTraceActors = [...previousFrame.actors, ...previousFrame.effects];
      for (const actor of currentTraceActors) {
        const previousActor = previousTraceActors.find((candidate) => candidate.id === actor.id);
        if (!previousActor) {
          continue;
        }
        const changedFields = traceActorChangedFields(previousActor, actor);
        if (changedFields.length > 0) {
          const key = matchPauseAdvanceEvidenceKey(frame.matchPause.type, actor.id);
          const existing = matchPauseAdvances.get(key);
          matchPauseAdvances.set(
            key,
            existing
              ? {
                  ...existing,
                  firstTick: Math.min(existing.firstTick, frame.tick),
                  lastTick: Math.max(existing.lastTick, frame.tick),
                  advancedFrames: existing.advancedFrames + 1,
                  maxPreviousMoveTime: Math.max(existing.maxPreviousMoveTime, previousFrame.matchPause?.moveTime ?? 0),
                  changedFields: sortStrings([...new Set([...existing.changedFields, ...changedFields])]),
                }
              : {
                  type: frame.matchPause.type,
                  actorId: actor.id,
                  actorKind: actor.actorKind,
                  ownerId: actor.ownerId,
                  firstTick: frame.tick,
                  lastTick: frame.tick,
                  advancedFrames: 1,
                  maxPreviousMoveTime: previousFrame.matchPause?.moveTime ?? 0,
                  changedFields,
                },
          );
          continue;
        }
        const key = matchPauseFreezeEvidenceKey(frame.matchPause.type, actor.id);
        const existing = matchPauseFreezes.get(key);
        matchPauseFreezes.set(
          key,
          existing
            ? {
                ...existing,
                firstTick: Math.min(existing.firstTick, frame.tick),
                lastTick: Math.max(existing.lastTick, frame.tick),
                frozenFrames: existing.frozenFrames + 1,
              }
            : {
                type: frame.matchPause.type,
                actorId: actor.id,
                actorKind: actor.actorKind,
                ownerId: actor.ownerId,
                firstTick: frame.tick,
                lastTick: frame.tick,
                frozenFrames: 1,
                comparedFields: [...TRACE_ACTOR_FREEZE_FIELDS],
              },
        );
      }
    }
    if (previousFrame) {
      collectHitPauseMotionEvidence(frame, previousFrame, matchPauseFreezes, matchPauseAdvances);
    }
    for (const link of frame.world?.targetLinks ?? []) {
      const evidence = {
        ownerId: link.ownerId,
        actorId: link.actorId,
        targetId: link.targetId,
        hasBinding: Boolean(link.binding),
      };
      targetLinks.set(targetLinkEvidenceKey(evidence), evidence);
    }
    for (const actor of allActors) {
      const key = actorFrameEvidenceKey(actor);
      const existing = actorFrames.get(key);
      actorFrames.set(
        key,
        existing
          ? {
              ...existing,
              firstTick: Math.min(existing.firstTick, frame.tick),
              lastTick: Math.max(existing.lastTick, frame.tick),
              frames: existing.frames + 1,
              minPos: {
                x: Math.min(existing.minPos.x, actor.pos.x),
                y: Math.min(existing.minPos.y, actor.pos.y),
              },
              maxPos: {
                x: Math.max(existing.maxPos.x, actor.pos.x),
                y: Math.max(existing.maxPos.y, actor.pos.y),
              },
              minVel: {
                x: Math.min(existing.minVel.x, actor.vel.x),
                y: Math.min(existing.minVel.y, actor.vel.y),
              },
              maxVel: {
                x: Math.max(existing.maxVel.x, actor.vel.x),
                y: Math.max(existing.maxVel.y, actor.vel.y),
              },
              minScale: {
                x: Math.min(existing.minScale.x, actor.renderScale?.x ?? 1),
                y: Math.min(existing.minScale.y, actor.renderScale?.y ?? 1),
              },
              maxScale: {
                x: Math.max(existing.maxScale.x, actor.renderScale?.x ?? 1),
                y: Math.max(existing.maxScale.y, actor.renderScale?.y ?? 1),
              },
            }
          : {
              actorId: actor.id,
              label: actor.label,
              source: actor.source,
              actorKind: actor.actorKind,
              ownerId: actor.ownerId,
              animNo: actor.animNo,
              moveType: actor.moveType,
              clsn1Count: actor.clsn1Count,
              clsn2Count: actor.clsn2Count,
              minPos: { ...actor.pos },
              maxPos: { ...actor.pos },
              minVel: { ...actor.vel },
              maxVel: { ...actor.vel },
              minScale: { x: actor.renderScale?.x ?? 1, y: actor.renderScale?.y ?? 1 },
              maxScale: { x: actor.renderScale?.x ?? 1, y: actor.renderScale?.y ?? 1 },
              firstTick: frame.tick,
              lastTick: frame.tick,
              frames: 1,
            },
      );
    }
  }
  for (const event of trace.events) {
    eventCategories.add(event.category);
    eventLines.add(event.line);
  }

  return {
    actorSources: sortStrings([...actorSources]),
    actorKinds: sortStrings([...actorKinds]) as RuntimeActorKind[],
    effectKinds: sortStrings([...effectKinds]) as RuntimeActorKind[],
    routedStates: sortNumbers([...routedStates]),
    executedStates: sortNumbers([...executedStates]),
    executedControllers: Object.fromEntries(Object.entries(executedControllers).sort(([left], [right]) => left.localeCompare(right))),
    executedOperations: Object.fromEntries(Object.entries(executedOperations).sort(([left], [right]) => left.localeCompare(right))),
    activeCommands: sortStrings([...activeCommands]),
    eventCategories: sortStrings([...eventCategories]) as RuntimeTraceEvent["category"][],
    eventLines: sortStrings([...eventLines]),
    combatReasons: sortStrings([...combatReasons]) as RuntimeTraceCombatReason["reason"][],
    worldLifecycleEvents: [...worldLifecycleEvents.values()].sort((left, right) =>
      worldLifecycleEventEvidenceKey(left).localeCompare(worldLifecycleEventEvidenceKey(right)),
    ),
    effectStores: [...effectStores.values()]
      .map(finalizeEffectStoreEvidence)
      .sort((left, right) => left.ownerId.localeCompare(right.ownerId)),
    matchPauses: [...matchPauses.values()].sort((left, right) => matchPauseGateEvidenceKey(left).localeCompare(matchPauseGateEvidenceKey(right))),
    matchPauseFreezes: [...matchPauseFreezes.values()].sort((left, right) =>
      matchPauseFreezeEvidenceKey(left.type, left.actorId).localeCompare(matchPauseFreezeEvidenceKey(right.type, right.actorId)),
    ),
    matchPauseAdvances: [...matchPauseAdvances.values()].sort((left, right) =>
      matchPauseAdvanceEvidenceKey(left.type, left.actorId).localeCompare(matchPauseAdvanceEvidenceKey(right.type, right.actorId)),
    ),
    targetLinks: [...targetLinks.values()].sort((left, right) => targetLinkEvidenceKey(left).localeCompare(targetLinkEvidenceKey(right))),
    actorFrames: [...actorFrames.values()].sort((left, right) => actorFrameGateEvidenceKey(left).localeCompare(actorFrameGateEvidenceKey(right))),
    finalActors: trace.final.actors.map(summarizeFinalActorEvidence),
  };
}

type RuntimeTraceGateEffectStoreAccumulator = {
  ownerId: string;
  total: number;
  explods: Set<string>;
  helpers: Set<string>;
  projectiles: Set<string>;
  nextSerials: RuntimeTraceWorldEffectStoreSummary["nextSerials"];
};

function createEffectStoreAccumulator(ownerId: string): RuntimeTraceGateEffectStoreAccumulator {
  return {
    ownerId,
    total: 0,
    explods: new Set<string>(),
    helpers: new Set<string>(),
    projectiles: new Set<string>(),
    nextSerials: {
      explod: 0,
      helper: 0,
      projectile: 0,
    },
  };
}

function finalizeEffectStoreEvidence(
  store: RuntimeTraceGateEffectStoreAccumulator,
): RuntimeTraceGateEffectStoreEvidence {
  return {
    ownerId: store.ownerId,
    total: store.total,
    explods: sortStrings([...store.explods]),
    helpers: sortStrings([...store.helpers]),
    projectiles: sortStrings([...store.projectiles]),
    nextSerials: { ...store.nextSerials },
  };
}

function summarizeWorldLifecycleEventEvidence(
  event: RuntimeTraceWorldLifecycleEvent,
): RuntimeTraceGateWorldLifecycleEventEvidence {
  return {
    type: event.type,
    id: event.id,
    label: event.label,
    kind: event.kind,
    layer: event.layer,
    ownerId: event.ownerId,
    rootId: event.rootId,
    parentId: event.parentId,
    firstTick: event.tick,
    lastTick: event.tick,
    count: 1,
  };
}

function worldLifecycleEventOccurrenceKey(event: RuntimeTraceWorldLifecycleEvent): string {
  return `${event.type}:${event.id}:${event.tick}`;
}

function worldLifecycleEventEvidenceKey(event: RuntimeTraceGateWorldLifecycleEventEvidence): string {
  return `${event.type}:${event.kind}:${event.layer}:${event.ownerId}:${event.rootId}:${event.parentId}:${event.id}`;
}

function matchesWorldLifecycleEventRequirement(
  event: RuntimeTraceGateWorldLifecycleEventEvidence,
  requirement: RuntimeTraceWorldLifecycleEventRequirement,
): boolean {
  return (
    (requirement.type === undefined || event.type === requirement.type) &&
    (requirement.id === undefined || event.id === requirement.id) &&
    (requirement.kind === undefined || event.kind === requirement.kind) &&
    (requirement.layer === undefined || event.layer === requirement.layer) &&
    (requirement.ownerId === undefined || event.ownerId === requirement.ownerId) &&
    (requirement.rootId === undefined || event.rootId === requirement.rootId) &&
    (requirement.parentId === undefined || event.parentId === requirement.parentId)
  );
}

function describeWorldLifecycleEventRequirement(requirement: RuntimeTraceWorldLifecycleEventRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchesEffectStoreRequirement(
  store: RuntimeTraceGateEffectStoreEvidence,
  requirement: RuntimeTraceEffectStoreRequirement,
): boolean {
  return (
    (requirement.ownerId === undefined || store.ownerId === requirement.ownerId) &&
    (requirement.minTotal === undefined || store.total >= requirement.minTotal) &&
    (requirement.minExplods === undefined || store.explods.length >= requirement.minExplods) &&
    (requirement.minHelpers === undefined || store.helpers.length >= requirement.minHelpers) &&
    (requirement.minProjectiles === undefined || store.projectiles.length >= requirement.minProjectiles) &&
    (requirement.minNextExplodSerial === undefined || store.nextSerials.explod >= requirement.minNextExplodSerial) &&
    (requirement.minNextHelperSerial === undefined || store.nextSerials.helper >= requirement.minNextHelperSerial) &&
    (requirement.minNextProjectileSerial === undefined ||
      store.nextSerials.projectile >= requirement.minNextProjectileSerial) &&
    (requirement.includesExplod === undefined || store.explods.includes(requirement.includesExplod)) &&
    (requirement.includesHelper === undefined || store.helpers.includes(requirement.includesHelper)) &&
    (requirement.includesProjectile === undefined || store.projectiles.includes(requirement.includesProjectile))
  );
}

function describeEffectStoreRequirement(requirement: RuntimeTraceEffectStoreRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchPauseOccurrenceKey(frame: Omit<RuntimeTraceFrame, "input" | "events"> | RuntimeTraceFrame): string {
  return `${frame.frameIndex}:${frame.tick}`;
}

function matchPauseEvidenceKey(pause: RuntimeMatchPauseSnapshot): string {
  return `${pause.type}:${pause.actorId}:${pause.sourceStateNo ?? "*"}:${pause.darken ? "darken" : "normal"}`;
}

function matchPauseGateEvidenceKey(pause: RuntimeTraceGateMatchPauseEvidence): string {
  return `${pause.type}:${pause.actorId}:${pause.sourceStateNo ?? "*"}:${pause.darken ? "darken" : "normal"}`;
}

function matchesMatchPauseRequirement(
  pause: RuntimeTraceGateMatchPauseEvidence,
  requirement: RuntimeTraceMatchPauseRequirement,
): boolean {
  return (
    (requirement.type === undefined || pause.type === requirement.type) &&
    (requirement.actorId === undefined || pause.actorId === requirement.actorId) &&
    (requirement.sourceStateNo === undefined || pause.sourceStateNo === requirement.sourceStateNo) &&
    (requirement.darken === undefined || pause.darken === requirement.darken) &&
    (requirement.minFrames === undefined || pause.frames >= requirement.minFrames) &&
    (requirement.minRemaining === undefined || pause.maxRemaining >= requirement.minRemaining) &&
    (requirement.minMoveTime === undefined || pause.maxMoveTime >= requirement.minMoveTime)
  );
}

function describeMatchPauseRequirement(requirement: RuntimeTraceMatchPauseRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

const TRACE_ACTOR_FREEZE_FIELDS = [
  "stateNo",
  "animNo",
  "animTime",
  "frameIndex",
  "pos",
  "vel",
  "ctrl",
  "stateType",
  "moveType",
  "physics",
] as const;

function traceActorChangedFields(previous: RuntimeTraceActor, current: RuntimeTraceActor): string[] {
  const fields: string[] = [];
  if (current.stateNo !== previous.stateNo) {
    fields.push("stateNo");
  }
  if (current.animNo !== previous.animNo) {
    fields.push("animNo");
  }
  if (current.animTime !== previous.animTime) {
    fields.push("animTime");
  }
  if (current.frameIndex !== previous.frameIndex) {
    fields.push("frameIndex");
  }
  if (current.pos.x !== previous.pos.x || current.pos.y !== previous.pos.y) {
    fields.push("pos");
  }
  if (current.vel.x !== previous.vel.x || current.vel.y !== previous.vel.y) {
    fields.push("vel");
  }
  if (current.ctrl !== previous.ctrl) {
    fields.push("ctrl");
  }
  if (current.stateType !== previous.stateType) {
    fields.push("stateType");
  }
  if (current.moveType !== previous.moveType) {
    fields.push("moveType");
  }
  if (current.physics !== previous.physics) {
    fields.push("physics");
  }
  return fields;
}

function collectHitPauseMotionEvidence(
  frame: Omit<RuntimeTraceFrame, "input" | "events"> | RuntimeTraceFrame,
  previousFrame: Omit<RuntimeTraceFrame, "input" | "events"> | RuntimeTraceFrame,
  matchPauseFreezes: Map<string, RuntimeTraceGateMatchPauseFreezeEvidence>,
  matchPauseAdvances: Map<string, RuntimeTraceGateMatchPauseAdvanceEvidence>,
): void {
  const currentFightersInHitPause = frame.actors.filter((actor) => actor.hitPause > 0);
  if (currentFightersInHitPause.length === 0) {
    return;
  }
  const maxPreviousHitPause = Math.max(0, ...previousFrame.actors.map((actor) => actor.hitPause));
  const currentTraceActors = [...frame.actors, ...frame.effects];
  const previousTraceActors = [...previousFrame.actors, ...previousFrame.effects];
  for (const actor of currentTraceActors) {
    const previousActor = previousTraceActors.find((candidate) => candidate.id === actor.id);
    if (!previousActor) {
      continue;
    }
    const changedFields = traceActorChangedFields(previousActor, actor);
    if (changedFields.length > 0) {
      const key = matchPauseAdvanceEvidenceKey("HitPause", actor.id);
      const existing = matchPauseAdvances.get(key);
      matchPauseAdvances.set(
        key,
        existing
          ? {
              ...existing,
              firstTick: Math.min(existing.firstTick, frame.tick),
              lastTick: Math.max(existing.lastTick, frame.tick),
              advancedFrames: existing.advancedFrames + 1,
              maxPreviousMoveTime: Math.max(existing.maxPreviousMoveTime, maxPreviousHitPause),
              changedFields: sortStrings([...new Set([...existing.changedFields, ...changedFields])]),
            }
          : {
              type: "HitPause",
              actorId: actor.id,
              actorKind: actor.actorKind,
              ownerId: actor.ownerId,
              firstTick: frame.tick,
              lastTick: frame.tick,
              advancedFrames: 1,
              maxPreviousMoveTime: maxPreviousHitPause,
              changedFields,
            },
      );
      continue;
    }
    const key = matchPauseFreezeEvidenceKey("HitPause", actor.id);
    const existing = matchPauseFreezes.get(key);
    matchPauseFreezes.set(
      key,
      existing
        ? {
            ...existing,
            firstTick: Math.min(existing.firstTick, frame.tick),
            lastTick: Math.max(existing.lastTick, frame.tick),
            frozenFrames: existing.frozenFrames + 1,
          }
        : {
            type: "HitPause",
            actorId: actor.id,
            actorKind: actor.actorKind,
            ownerId: actor.ownerId,
            firstTick: frame.tick,
            lastTick: frame.tick,
            frozenFrames: 1,
            comparedFields: [...TRACE_ACTOR_FREEZE_FIELDS],
          },
    );
  }
}

function matchPauseFreezeEvidenceKey(type: RuntimeTracePauseEvidenceType, actorId: string): string {
  return `${type}:${actorId}`;
}

function matchesMatchPauseFreezeRequirement(
  freeze: RuntimeTraceGateMatchPauseFreezeEvidence,
  requirement: RuntimeTraceMatchPauseFreezeRequirement,
): boolean {
  return (
    (requirement.type === undefined || freeze.type === requirement.type) &&
    (requirement.actorId === undefined || freeze.actorId === requirement.actorId) &&
    (requirement.actorKind === undefined || freeze.actorKind === requirement.actorKind) &&
    (requirement.ownerId === undefined || freeze.ownerId === requirement.ownerId) &&
    (requirement.minFrozenFrames === undefined || freeze.frozenFrames >= requirement.minFrozenFrames)
  );
}

function describeMatchPauseFreezeRequirement(requirement: RuntimeTraceMatchPauseFreezeRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function matchPauseAdvanceEvidenceKey(type: RuntimeTracePauseEvidenceType, actorId: string): string {
  return `${type}:${actorId}`;
}

function matchesMatchPauseAdvanceRequirement(
  advance: RuntimeTraceGateMatchPauseAdvanceEvidence,
  requirement: RuntimeTraceMatchPauseAdvanceRequirement,
): boolean {
  return (
    (requirement.type === undefined || advance.type === requirement.type) &&
    (requirement.actorId === undefined || advance.actorId === requirement.actorId) &&
    (requirement.actorKind === undefined || advance.actorKind === requirement.actorKind) &&
    (requirement.ownerId === undefined || advance.ownerId === requirement.ownerId) &&
    (requirement.minAdvancedFrames === undefined || advance.advancedFrames >= requirement.minAdvancedFrames) &&
    (requirement.minPreviousMoveTime === undefined || advance.maxPreviousMoveTime >= requirement.minPreviousMoveTime)
  );
}

function describeMatchPauseAdvanceRequirement(requirement: RuntimeTraceMatchPauseAdvanceRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeFinalActorEvidence(actor: RuntimeTraceActor): RuntimeTraceGateFinalActorEvidence {
  return {
    id: actor.id,
    label: actor.label,
    actorKind: actor.actorKind,
    source: actor.source,
    stateNo: actor.stateNo,
    animNo: actor.animNo,
    life: actor.life,
    ctrl: actor.ctrl,
    stateType: actor.stateType,
    moveType: actor.moveType,
    physics: actor.physics,
    guarding: actor.guarding,
    hitFall: actor.hitFall ? cloneTraceHitFall(actor.hitFall) : undefined,
  };
}

function targetLinkEvidenceKey(link: RuntimeTraceGateTargetLinkEvidence): string {
  return `${link.ownerId}->${link.actorId}:${link.targetId ?? "*"}:${link.hasBinding ? "binding" : "memory"}`;
}

function matchesTargetLinkRequirement(
  link: RuntimeTraceGateTargetLinkEvidence,
  requirement: RuntimeTraceTargetLinkRequirement,
): boolean {
  return (
    (requirement.ownerId === undefined || link.ownerId === requirement.ownerId) &&
    (requirement.actorId === undefined || link.actorId === requirement.actorId) &&
    (requirement.targetId === undefined || link.targetId === requirement.targetId) &&
    (requirement.hasBinding === undefined || link.hasBinding === requirement.hasBinding)
  );
}

function describeTargetLinkRequirement(requirement: RuntimeTraceTargetLinkRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function actorFrameEvidenceKey(actor: RuntimeTraceActor): string {
  return [
    actor.id,
    actor.source ?? "none",
    actor.actorKind,
    actor.ownerId,
    actor.animNo,
    actor.moveType,
    actor.clsn1Count,
    actor.clsn2Count,
  ].join(":");
}

function actorFrameGateEvidenceKey(actor: RuntimeTraceGateActorFrameEvidence): string {
  return [
    actor.actorId,
    actor.source ?? "none",
    actor.actorKind,
    actor.ownerId,
    actor.animNo,
    actor.moveType,
    actor.clsn1Count,
    actor.clsn2Count,
  ].join(":");
}

function matchesActorFrameRequirement(
  actor: RuntimeTraceGateActorFrameEvidence,
  requirement: RuntimeTraceActorFrameRequirement,
): boolean {
  return (
    (requirement.actorId === undefined || actor.actorId === requirement.actorId) &&
    (requirement.source === undefined || actor.source === requirement.source) &&
    (requirement.actorKind === undefined || actor.actorKind === requirement.actorKind) &&
    (requirement.ownerId === undefined || actor.ownerId === requirement.ownerId) &&
    (requirement.animNo === undefined || actor.animNo === requirement.animNo) &&
    (requirement.moveType === undefined || actor.moveType === requirement.moveType) &&
    (requirement.clsn1Count === undefined || actor.clsn1Count === requirement.clsn1Count) &&
    (requirement.clsn2Count === undefined || actor.clsn2Count === requirement.clsn2Count) &&
    (requirement.minFrames === undefined || actor.frames >= requirement.minFrames) &&
    (requirement.observedPosXAtLeast === undefined || actor.maxPos.x >= requirement.observedPosXAtLeast) &&
    (requirement.observedPosXAtMost === undefined || actor.minPos.x <= requirement.observedPosXAtMost) &&
    (requirement.observedPosYAtLeast === undefined || actor.maxPos.y >= requirement.observedPosYAtLeast) &&
    (requirement.observedPosYAtMost === undefined || actor.minPos.y <= requirement.observedPosYAtMost) &&
    (requirement.observedVelXAtLeast === undefined || actor.maxVel.x >= requirement.observedVelXAtLeast) &&
    (requirement.observedVelXAtMost === undefined || actor.minVel.x <= requirement.observedVelXAtMost) &&
    (requirement.observedVelYAtLeast === undefined || actor.maxVel.y >= requirement.observedVelYAtLeast) &&
    (requirement.observedVelYAtMost === undefined || actor.minVel.y <= requirement.observedVelYAtMost) &&
    (requirement.observedScaleXAtLeast === undefined || actor.maxScale.x >= requirement.observedScaleXAtLeast) &&
    (requirement.observedScaleXAtMost === undefined || actor.minScale.x <= requirement.observedScaleXAtMost) &&
    (requirement.observedScaleYAtLeast === undefined || actor.maxScale.y >= requirement.observedScaleYAtLeast) &&
    (requirement.observedScaleYAtMost === undefined || actor.minScale.y <= requirement.observedScaleYAtMost)
  );
}

function describeActorFrameRequirement(requirement: RuntimeTraceActorFrameRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function compareHitFallRequirement(
  actor: RuntimeTraceGateFinalActorEvidence,
  requirement: RuntimeTraceHitFallRequirement,
): string[] {
  const failures: string[] = [];
  const hitFall = actor.hitFall;
  if (!hitFall) {
    failures.push(`Final actor ${actor.id} missing hitFall evidence`);
    return failures;
  }
  const comparisons: Array<[string, number | boolean | undefined, number | boolean | undefined]> = [
    ["hitFall.falling", requirement.falling, hitFall.falling],
    ["hitFall.damage", requirement.damage, hitFall.damage],
    ["hitFall.kill", requirement.kill, hitFall.kill],
    ["hitFall.velocity.x", requirement.velocityX, hitFall.velocity.x],
    ["hitFall.velocity.y", requirement.velocityY, hitFall.velocity.y],
    ["hitFall.recover", requirement.recover, hitFall.recover],
    ["hitFall.recoverTime", requirement.recoverTime, hitFall.recoverTime],
    ["hitFall.downRecover", requirement.downRecover, hitFall.downRecover],
    ["hitFall.downRecoverTime", requirement.downRecoverTime, hitFall.downRecoverTime],
    ["hitFall.envShake.time", requirement.envShakeTime, hitFall.envShake?.time],
    ["hitFall.envShake.ampl", requirement.envShakeAmpl, hitFall.envShake?.ampl],
  ];
  for (const [label, expected, actual] of comparisons) {
    if (expected !== undefined && actual !== expected) {
      failures.push(`Final actor ${actor.id} ${label} expected ${String(expected)} (actual ${String(actual)})`);
    }
  }
  return failures;
}

function findRequiredFinalActor(
  actors: RuntimeTraceGateFinalActorEvidence[],
  requirement: RuntimeTraceFinalActorRequirement,
): RuntimeTraceGateFinalActorEvidence | undefined {
  if (requirement.actorId) {
    return actors.find((actor) => actor.id === requirement.actorId);
  }
  return actors.find(
    (actor) =>
      (requirement.source === undefined || actor.source === requirement.source) &&
      (requirement.actorKind === undefined || actor.actorKind === requirement.actorKind),
  );
}

function describeFinalActorRequirement(requirement: RuntimeTraceFinalActorRequirement): string {
  return Object.entries(requirement)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function summarizeTraceSnapshot(
  frameIndex: number,
  snapshot: MugenSnapshot,
  inputFrame?: RuntimeTraceInputFrame,
  logs: string[] = [],
  label = inputFrame?.label,
  actorRegistry?: MatchWorldActorRegistrySnapshot,
): RuntimeTraceFrame {
  const events = logs.map((line) => ({
    frameIndex,
    tick: snapshot.tick,
    category: categorizeLogLine(line),
    line,
  }));
  const actors = snapshot.actors.map(summarizeActor);
  const frame: RuntimeTraceFrame = {
    frameIndex,
    tick: snapshot.tick,
    label,
    input: {
      p1: cloneInputTokens(inputFrame?.p1),
      ...(inputFrame?.p2 === undefined ? {} : { p2: cloneInputTokens(inputFrame.p2) }),
      force: inputFrame?.force ?? false,
    },
    actors,
    effects: (snapshot.effects ?? []).map(summarizeActor),
    round: snapshot.round,
    matchPause: snapshot.matchPause,
    compatibility: summarizeCompatibility(snapshot.compatibilitySession),
    events,
    combatReasons: summarizeCombatReasons(frameIndex, snapshot.tick, actors, events),
    world: summarizeWorld(actorRegistry),
    checksum: "",
  };
  // World lifecycle evidence is excluded from behavior checksums until MatchWorld owns lifecycle simulation directly.
  frame.checksum = hashStableJson({
    tick: frame.tick,
    input: frame.input,
    actors: frame.actors.map(summarizeActorForChecksum),
    effects: frame.effects.map(summarizeActorForChecksum),
    round: frame.round,
    matchPause: frame.matchPause,
    compatibility: frame.compatibility,
    events: frame.events.map((event) => event.line),
    combatReasons: frame.combatReasons,
  });
  return frame;
}

function readActorRegistry(runtime: RuntimeTraceRunner): MatchWorldActorRegistrySnapshot | undefined {
  return runtime.getActorRegistry?.();
}

function summarizeWorld(actorRegistry: MatchWorldActorRegistrySnapshot | undefined): RuntimeTraceWorldSummary | undefined {
  if (!actorRegistry) {
    return undefined;
  }
  return {
    live: [...actorRegistry.lifecycle.live],
    spawnedThisTick: [...actorRegistry.lifecycle.spawnedThisTick],
    removedThisTick: [...actorRegistry.lifecycle.removedThisTick],
    removed: [...actorRegistry.lifecycle.removed],
    eventsThisTick: actorRegistry.lifecycle.eventsThisTick.map((event) => ({ ...event })),
    recentEvents: actorRegistry.lifecycle.recentEvents.map((event) => ({ ...event })),
    effectStores: actorRegistry.effectStores.map((store) => ({
      ownerId: store.ownerId,
      total: store.total,
      explods: [...store.explods],
      helpers: [...store.helpers],
      projectiles: [...store.projectiles],
      nextSerials: { ...store.nextSerials },
    })),
    targetLinks: actorRegistry.targetLinks.map((link) => ({
      ownerId: link.ownerId,
      actorId: link.actorId,
      targetId: link.targetId,
      age: link.age,
      binding: link.binding
        ? {
            actorId: link.binding.actorId,
            targetId: link.binding.targetId,
            remaining: link.binding.remaining,
            offset: { ...link.binding.offset },
          }
        : undefined,
    })),
    lifecycle: actorRegistry.lifecycle.records.map((record) => ({ ...record })),
  };
}

function summarizeCombatReasons(
  frameIndex: number,
  tick: number,
  actors: RuntimeTraceActor[],
  events: RuntimeTraceEvent[],
): RuntimeTraceCombatReason[] {
  const reasons = events.flatMap((event): RuntimeTraceCombatReason[] => {
    const reason = eventCategoryToCombatReason(event.category);
    return reason
      ? [
          {
            frameIndex,
            tick,
            reason,
            source: "log",
            detail: event.line,
          },
        ]
      : [];
  });
  if (reasons.length > 0) {
    return reasons;
  }
  return actors
    .filter((actor) => actor.moveType === "A" && actor.clsn1Count > 0)
    .map((actor) => ({
      frameIndex,
      tick,
      reason: "whiff" as const,
      source: "inferred" as const,
      actorId: actor.id,
      detail: `${actor.label} had active Clsn1 without hit, guard, reject, override, or reversal evidence`,
    }));
}

function eventCategoryToCombatReason(category: RuntimeTraceEvent["category"]): RuntimeTraceCombatReason["reason"] | undefined {
  if (category === "hit" || category === "guard" || category === "reject" || category === "override" || category === "reversal") {
    return category;
  }
  return undefined;
}

function summarizeActor(actor: ActorSnapshot): RuntimeTraceActor {
  return {
    id: actor.id,
    label: actor.label,
    actorKind: actor.actorKind,
    ownerId: actor.ownerId,
    rootId: actor.rootId,
    parentId: actor.parentId,
    source: actor.source,
    stateNo: actor.runtime.stateNo,
    animNo: actor.runtime.animNo,
    animTime: roundTraceNumber(actor.runtime.animTime),
    frameIndex: actor.runtime.frameIndex,
    life: actor.runtime.life,
    power: actor.runtime.power,
    ctrl: actor.runtime.ctrl,
    stateType: actor.runtime.stateType,
    moveType: actor.runtime.moveType,
    physics: actor.runtime.physics,
    pos: {
      x: roundTraceNumber(actor.runtime.pos.x),
      y: roundTraceNumber(actor.runtime.pos.y),
    },
    vel: {
      x: roundTraceNumber(actor.runtime.vel.x),
      y: roundTraceNumber(actor.runtime.vel.y),
    },
    renderScale: actor.runtime.renderScale
      ? {
          x: roundTraceNumber(actor.runtime.renderScale.x),
          y: roundTraceNumber(actor.runtime.renderScale.y),
        }
      : undefined,
    facing: actor.runtime.facing,
    hitPause: actor.hitPause ?? 0,
    guarding: actor.runtime.guarding ?? false,
    guardStun: actor.runtime.guardStun ?? 0,
    ...(actor.runtime.guardSlideTime ? { guardSlideTime: actor.runtime.guardSlideTime } : {}),
    ...(actor.runtime.guardControlTime ? { guardControlTime: actor.runtime.guardControlTime } : {}),
    hitFall: actor.runtime.hitFall ? cloneTraceHitFall(actor.runtime.hitFall) : undefined,
    customOwnerId: actor.runtime.customState?.ownerId,
    clsn1Count: actor.clsn1.length,
    clsn2Count: actor.clsn2.length,
  };
}

function summarizeActorForChecksum(actor: RuntimeTraceActor): Omit<RuntimeTraceActor, "animTime" | "hitPause"> {
  const { animTime: _animTime, hitPause: _hitPause, ...checksumActor } = actor;
  return checksumActor;
}

function cloneTraceHitFall(hitFall: RuntimeTraceHitFallSummary): RuntimeTraceHitFallSummary {
  return {
    falling: hitFall.falling,
    damage: roundTraceNumber(hitFall.damage),
    kill: hitFall.kill,
    velocity: {
      ...(hitFall.velocity.x === undefined ? {} : { x: roundTraceNumber(hitFall.velocity.x) }),
      y: roundTraceNumber(hitFall.velocity.y),
    },
    recover: hitFall.recover,
    recoverTime: hitFall.recoverTime === undefined ? undefined : roundTraceNumber(hitFall.recoverTime),
    downRecover: hitFall.downRecover,
    downRecoverTime: hitFall.downRecoverTime === undefined ? undefined : roundTraceNumber(hitFall.downRecoverTime),
    envShake: hitFall.envShake
      ? {
          time: roundTraceNumber(hitFall.envShake.time),
          freq: roundTraceNumber(hitFall.envShake.freq),
          ampl: roundTraceNumber(hitFall.envShake.ampl),
          phase: roundTraceNumber(hitFall.envShake.phase),
        }
      : undefined,
  };
}

function summarizeCompatibility(session: CompatibilitySessionSnapshot | undefined): RuntimeTraceCompatibilityActor[] | undefined {
  if (!session?.actors.length) {
    return undefined;
  }
  return session.actors.map((actor) => ({
    actorId: actor.actorId,
    label: actor.label,
    executedStates: [...actor.executedStates],
    routedStates: [...actor.routedStates],
    activeCommands: [...actor.activeCommands],
    commandHistory: actor.commandHistory.map((sample) => ({
      frame: sample.frame,
      values: [...sample.values],
      hitPause: sample.hitPause,
    })),
    executedControllers: { ...actor.executedControllers },
    executedOperations: { ...actor.executedOperations },
    lastRoutedState: actor.lastRoutedState ? { ...actor.lastRoutedState } : undefined,
    lastExecutedState: actor.lastExecutedState,
  }));
}

function toMatchInput(frame: RuntimeTraceInputFrame): MatchInput {
  return {
    p1: new Set(frame.p1 ?? []),
    ...(frame.p2 === undefined ? {} : { p2: new Set(frame.p2) }),
  };
}

function collectNewLogs(previous: string[], current: string[]): string[] {
  for (let start = 0; start <= current.length; start += 1) {
    const matches = previous.every((line, index) => current[start + index] === line);
    if (matches) {
      return current.slice(0, start);
    }
  }
  const previousSet = new Set(previous);
  return current.filter((line) => !previousSet.has(line));
}

function categorizeLogLine(line: string): RuntimeTraceEvent["category"] {
  const lower = line.toLowerCase();
  if (lower.includes("hitoverride")) {
    return "override";
  }
  if (lower.includes("rejected")) {
    return "reject";
  }
  if (lower.includes("reversed")) {
    return "reversal";
  }
  if (lower.includes("guarded")) {
    return "guard";
  }
  if (lower.includes(" hit ") || lower.includes("projectile hit")) {
    return "hit";
  }
  if (lower.includes("pause")) {
    return "pause";
  }
  if (lower.includes("wins") || lower.includes("ko") || lower.includes("time over")) {
    return "round";
  }
  return "runtime";
}

function cloneInputTokens(tokens: string[] | undefined): string[] {
  return [...(tokens ?? [])].sort();
}

function sortNumbers(values: number[]): number[] {
  return values.sort((left, right) => left - right);
}

function sortStrings<T extends string>(values: T[]): T[] {
  return values.sort((left, right) => left.localeCompare(right));
}

function roundTraceNumber(value: number): number {
  return Number(value.toFixed(4));
}

function hashStableJson(value: unknown): string {
  const text = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
