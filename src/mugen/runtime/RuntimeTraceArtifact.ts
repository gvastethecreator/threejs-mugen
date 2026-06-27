import type {
  RuntimeTrace,
  RuntimeTraceFrame,
  RuntimeTraceGate,
  RuntimeTraceGateResult,
  RuntimeTraceInputFrame,
} from "./RuntimeTrace";
import { evaluateRuntimeTraceGate } from "./RuntimeTrace";

type RuntimeTraceArtifactActor = RuntimeTraceFrame["actors"][number];
type RuntimeTraceArtifactEffect = NonNullable<RuntimeTraceArtifactActor["effect"]>;

export type RuntimeTraceArtifactStatus = "passed" | "failed";

export type RuntimeTraceArtifactTarget = {
  id: string;
  label: string;
  source: "native" | "imported" | "mixed" | "unknown";
  fixturePath?: string;
  notes?: string[];
};

export type RuntimeTraceArtifact = {
  schemaVersion: "runtime-trace-artifact/v0";
  generatedAt: string;
  target: RuntimeTraceArtifactTarget;
  status: RuntimeTraceArtifactStatus;
  trace: {
    label: string;
    frameCount: number;
    checksum: string;
    initialChecksum: string;
    finalChecksum: string;
    frameChecksums: string[];
    frames: RuntimeTraceArtifactFrameSummary[];
    finalActors: RuntimeTraceFrame["actors"];
    finalEffects: RuntimeTraceFrame["effects"];
    eventCount: number;
    events: RuntimeTrace["events"];
    combatReasonCount: number;
    combatReasons: RuntimeTrace["combatReasons"];
  };
  script?: RuntimeTraceInputFrame[];
  gates: RuntimeTraceArtifactGateResult[];
};

export type RuntimeTraceArtifactGateRequirements = Omit<RuntimeTraceGate, "label">;

export type RuntimeTraceArtifactGateResult = RuntimeTraceGateResult & {
  requirements: RuntimeTraceArtifactGateRequirements;
};

export type RuntimeTraceArtifactFrameSummary = {
  frameIndex: number;
  tick: number;
  label?: string;
  checksum: string;
  input: RuntimeTraceFrame["input"];
  actorCount: number;
  effectCount: number;
  world?: RuntimeTraceFrame["world"];
  eventCategories: RuntimeTraceFrame["events"][number]["category"][];
  combatReasons: RuntimeTraceFrame["combatReasons"][number]["reason"][];
  delta?: RuntimeTraceArtifactFrameDelta;
};

export type RuntimeTraceArtifactFrameDelta = {
  previousFrameIndex?: number;
  tickDelta?: number;
  checksumChanged: boolean;
  inputChanged: boolean;
  actorCountDelta: number;
  effectCountDelta: number;
  eventCount: number;
  combatReasonCount: number;
  actorChanges: RuntimeTraceArtifactActorDelta[];
  world?: RuntimeTraceArtifactWorldDelta;
};

export type RuntimeTraceArtifactActorDelta = {
  id: string;
  label: string;
  actorKind: RuntimeTraceFrame["actors"][number]["actorKind"];
  layer: "actor" | "effect";
  changes: string[];
};

export type RuntimeTraceArtifactWorldDelta = {
  liveDelta?: number;
  effectStoreTotalDelta?: number;
  targetLinkDelta?: number;
  lifecycleEventCount: number;
  spawned: string[];
  removed: string[];
};

export type CreateRuntimeTraceArtifactInput = {
  trace: RuntimeTrace;
  gates: RuntimeTraceGate[];
  target: RuntimeTraceArtifactTarget;
  script?: RuntimeTraceInputFrame[];
  generatedAt?: string;
};

export function createRuntimeTraceArtifact(input: CreateRuntimeTraceArtifactInput): RuntimeTraceArtifact {
  const gateResults = input.gates.map((gate) => evaluateRuntimeTraceGate(input.trace, gate));
  const status: RuntimeTraceArtifactStatus = gateResults.every((gate) => gate.passed) ? "passed" : "failed";
  return {
    schemaVersion: "runtime-trace-artifact/v0",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    target: {
      ...input.target,
      notes: input.target.notes ? [...input.target.notes] : undefined,
    },
    status,
    trace: {
      label: input.trace.label,
      frameCount: input.trace.frameCount,
      checksum: input.trace.checksum,
      initialChecksum: input.trace.initial.checksum,
      finalChecksum: input.trace.final.checksum,
      frameChecksums: input.trace.frames.map((frame) => frame.checksum),
      frames: input.trace.frames.map((frame, index, frames) => summarizeArtifactFrame(frame, frames[index - 1])),
      finalActors: input.trace.final.actors.map(cloneTraceActor),
      finalEffects: input.trace.final.effects.map(cloneTraceActor),
      eventCount: input.trace.events.length,
      events: input.trace.events.map((event) => ({ ...event })),
      combatReasonCount: input.trace.combatReasons.length,
      combatReasons: input.trace.combatReasons.map((reason) => ({ ...reason })),
    },
    script: input.script?.map((frame) => ({
      ...frame,
      p1: frame.p1 ? [...frame.p1] : undefined,
      p2: frame.p2 ? [...frame.p2] : undefined,
    })),
    gates: gateResults.map((gate, index) => ({
      ...gate,
      requirements: cloneGateRequirements(input.gates[index]!),
      failures: [...gate.failures],
      evidence: {
        actorSources: [...gate.evidence.actorSources],
        actorKinds: [...gate.evidence.actorKinds],
        effectKinds: [...gate.evidence.effectKinds],
        routedStates: [...gate.evidence.routedStates],
        executedStates: [...gate.evidence.executedStates],
        executedControllers: { ...gate.evidence.executedControllers },
        executedOperations: { ...gate.evidence.executedOperations },
        activeCommands: [...gate.evidence.activeCommands],
        eventCategories: [...gate.evidence.eventCategories],
        eventLines: [...gate.evidence.eventLines],
        combatReasons: [...gate.evidence.combatReasons],
        worldLifecycleEvents: gate.evidence.worldLifecycleEvents.map((event) => ({ ...event })),
        effectStores: gate.evidence.effectStores.map((store) => ({
          ownerId: store.ownerId,
          total: store.total,
          explods: [...store.explods],
          helpers: [...store.helpers],
          projectiles: [...store.projectiles],
          nextSerials: { ...store.nextSerials },
        })),
        effectPayloads: gate.evidence.effectPayloads.map((payload) => ({
          ...payload,
          effect: cloneTraceEffect(payload.effect),
        })),
        matchPauses: gate.evidence.matchPauses.map((pause) => ({ ...pause })),
        matchPauseFreezes: gate.evidence.matchPauseFreezes.map((freeze) => ({
          ...freeze,
          comparedFields: [...freeze.comparedFields],
        })),
        matchPauseAdvances: gate.evidence.matchPauseAdvances.map((advance) => ({
          ...advance,
          changedFields: [...advance.changedFields],
        })),
        targetLinks: gate.evidence.targetLinks.map((link) => ({ ...link })),
        actorFrames: gate.evidence.actorFrames.map((actor) => ({ ...actor })),
        finalActors: gate.evidence.finalActors.map(cloneTraceGateFinalActor),
      },
    })),
  };
}

export function serializeRuntimeTraceArtifact(artifact: RuntimeTraceArtifact): string {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

function summarizeArtifactFrame(frame: RuntimeTraceFrame, previous: RuntimeTraceFrame | undefined): RuntimeTraceArtifactFrameSummary {
  return {
    frameIndex: frame.frameIndex,
    tick: frame.tick,
    label: frame.label,
    checksum: frame.checksum,
    input: {
      p1: [...frame.input.p1],
      p2: frame.input.p2 ? [...frame.input.p2] : undefined,
      force: frame.input.force,
    },
    actorCount: frame.actors.length,
    effectCount: frame.effects.length,
    world: frame.world ? cloneTraceWorld(frame.world) : undefined,
    eventCategories: [...new Set(frame.events.map((event) => event.category))],
    combatReasons: [...new Set(frame.combatReasons.map((reason) => reason.reason))],
    delta: summarizeArtifactFrameDelta(frame, previous),
  };
}

function summarizeArtifactFrameDelta(
  frame: RuntimeTraceFrame,
  previous: RuntimeTraceFrame | undefined,
): RuntimeTraceArtifactFrameDelta {
  return {
    previousFrameIndex: previous?.frameIndex,
    tickDelta: previous ? frame.tick - previous.tick : undefined,
    checksumChanged: previous ? frame.checksum !== previous.checksum : true,
    inputChanged: previous ? !sameTraceInput(frame.input, previous.input) : true,
    actorCountDelta: frame.actors.length - (previous?.actors.length ?? 0),
    effectCountDelta: frame.effects.length - (previous?.effects.length ?? 0),
    eventCount: frame.events.length,
    combatReasonCount: frame.combatReasons.length,
    actorChanges: summarizeActorDeltas(frame, previous),
    world: summarizeWorldDelta(frame.world, previous?.world),
  };
}

function summarizeActorDeltas(frame: RuntimeTraceFrame, previous: RuntimeTraceFrame | undefined): RuntimeTraceArtifactActorDelta[] {
  const changes = [
    ...summarizeActorLayerDeltas(frame.actors, previous?.actors ?? [], "actor"),
    ...summarizeActorLayerDeltas(frame.effects, previous?.effects ?? [], "effect"),
  ];
  return changes.sort((left, right) => left.layer.localeCompare(right.layer) || left.id.localeCompare(right.id));
}

function summarizeActorLayerDeltas(
  currentActors: RuntimeTraceFrame["actors"],
  previousActors: RuntimeTraceFrame["actors"],
  layer: RuntimeTraceArtifactActorDelta["layer"],
): RuntimeTraceArtifactActorDelta[] {
  const previousById = new Map(previousActors.map((actor) => [actor.id, actor]));
  const currentById = new Map(currentActors.map((actor) => [actor.id, actor]));
  const deltas: RuntimeTraceArtifactActorDelta[] = [];

  for (const actor of currentActors) {
    const previous = previousById.get(actor.id);
    const changes = previous ? compareTraceActors(actor, previous) : ["spawned"];
    if (changes.length) {
      deltas.push({
        id: actor.id,
        label: actor.label,
        actorKind: actor.actorKind,
        layer,
        changes,
      });
    }
  }

  for (const actor of previousActors) {
    if (!currentById.has(actor.id)) {
      deltas.push({
        id: actor.id,
        label: actor.label,
        actorKind: actor.actorKind,
        layer,
        changes: ["removed"],
      });
    }
  }

  return deltas;
}

function compareTraceActors(
  current: RuntimeTraceFrame["actors"][number],
  previous: RuntimeTraceFrame["actors"][number],
): string[] {
  const changes: string[] = [];
  if (current.stateNo !== previous.stateNo) {
    changes.push(`state ${previous.stateNo}->${current.stateNo}`);
  }
  if (current.animNo !== previous.animNo) {
    changes.push(`anim ${previous.animNo}->${current.animNo}`);
  }
  if (current.frameIndex !== previous.frameIndex) {
    changes.push(`elem ${previous.frameIndex}->${current.frameIndex}`);
  }
  if (current.life !== previous.life) {
    changes.push(`life ${previous.life}->${current.life}`);
  }
  if (current.ctrl !== previous.ctrl) {
    changes.push(`ctrl ${previous.ctrl ? "on" : "off"}->${current.ctrl ? "on" : "off"}`);
  }
  if (current.stateType !== previous.stateType) {
    changes.push(`statetype ${previous.stateType}->${current.stateType}`);
  }
  if (current.moveType !== previous.moveType) {
    changes.push(`movetype ${previous.moveType}->${current.moveType}`);
  }
  if (current.physics !== previous.physics) {
    changes.push(`physics ${previous.physics}->${current.physics}`);
  }
  if (current.guarding !== previous.guarding) {
    changes.push(`guard ${previous.guarding ? "on" : "off"}->${current.guarding ? "on" : "off"}`);
  }
  if (current.guardStun !== previous.guardStun) {
    changes.push(`guardstun ${previous.guardStun}->${current.guardStun}`);
  }
  if (current.pos.x !== previous.pos.x || current.pos.y !== previous.pos.y) {
    changes.push(`pos ${formatPoint(previous.pos)}->${formatPoint(current.pos)}`);
  }
  if (current.vel.x !== previous.vel.x || current.vel.y !== previous.vel.y) {
    changes.push(`vel ${formatPoint(previous.vel)}->${formatPoint(current.vel)}`);
  }
  changes.push(...compareTraceActorEffects(current.effect, previous.effect));
  return changes;
}

function compareTraceActorEffects(
  current: RuntimeTraceArtifactActor["effect"],
  previous: RuntimeTraceArtifactActor["effect"],
): string[] {
  if (!current && !previous) {
    return [];
  }
  if (current && !previous) {
    return [`effect attached ${current.kind}`];
  }
  if (!current && previous) {
    return [`effect removed ${previous.kind}`];
  }
  if (!current || !previous) {
    return [];
  }
  if (current.kind !== previous.kind) {
    return [`effect ${previous.kind}->${current.kind}`];
  }

  const changes: string[] = [];
  if (current.kind === "explod" && previous.kind === "explod") {
    pushEffectValueChange(changes, "effect id", previous.id, current.id);
    pushEffectValueChange(changes, "effect remove", previous.removeTime, current.removeTime);
    pushEffectValueChange(changes, "effect sprPriority", previous.spritePriority, current.spritePriority);
    pushEffectValueChange(changes, "effect opacity", previous.opacity, current.opacity);
    if (current.scale.x !== previous.scale.x || current.scale.y !== previous.scale.y) {
      changes.push(`effect scale ${formatPoint(previous.scale)}->${formatPoint(current.scale)}`);
    }
    pushEffectValueChange(changes, "effect removeOnGetHit", previous.removeOnGetHit, current.removeOnGetHit);
    pushEffectValueChange(changes, "effect ignoreHitPause", previous.ignoreHitPause, current.ignoreHitPause);
    pushEffectValueChange(changes, "effect pauseMoveTime", previous.pauseMoveTime, current.pauseMoveTime);
    pushEffectValueChange(changes, "effect superMoveTime", previous.superMoveTime, current.superMoveTime);
    pushEffectValueChange(changes, "effect bindRemaining", previous.bindRemaining, current.bindRemaining);
    if (!sameOptionalPoint(current.bindOffset, previous.bindOffset)) {
      changes.push(`effect bindOffset ${formatOptionalPoint(previous.bindOffset)}->${formatOptionalPoint(current.bindOffset)}`);
    }
    return changes;
  }

  if (current.kind === "helper" && previous.kind === "helper") {
    pushEffectValueChange(changes, "effect id", previous.id, current.id);
    pushEffectValueChange(changes, "effect name", previous.name, current.name);
    pushEffectValueChange(changes, "effect state", previous.stateNo, current.stateNo);
    pushEffectValueChange(changes, "effect remove", previous.removeTime, current.removeTime);
    pushEffectValueChange(changes, "effect sprPriority", previous.spritePriority, current.spritePriority);
    return changes;
  }

  if (current.kind === "projectile" && previous.kind === "projectile") {
    pushEffectValueChange(changes, "effect id", previous.id, current.id);
    pushEffectValueChange(changes, "effect remove", previous.removeTime, current.removeTime);
    pushEffectValueChange(changes, "effect sprPriority", previous.spritePriority, current.spritePriority);
    pushEffectValueChange(changes, "effect priority", previous.priority, current.priority);
    pushEffectValueChange(changes, "effect hits", previous.hitsRemaining, current.hitsRemaining);
    pushEffectValueChange(changes, "effect miss", previous.missTimeRemaining, current.missTimeRemaining);
    pushEffectValueChange(changes, "effect damage", previous.damage, current.damage);
    pushEffectValueChange(changes, "effect hitPause", previous.hitPause, current.hitPause);
    pushEffectValueChange(changes, "effect hitStun", previous.hitStun, current.hitStun);
    pushEffectValueChange(changes, "effect guardDamage", previous.guardDamage, current.guardDamage);
    pushEffectValueChange(changes, "effect guardPause", previous.guardPause, current.guardPause);
    pushEffectValueChange(changes, "effect guardStun", previous.guardStun, current.guardStun);
    pushEffectValueChange(changes, "effect guardDistance", previous.guardDistance, current.guardDistance);
    pushEffectValueChange(changes, "effect guardFlag", previous.guardFlag, current.guardFlag);
    pushEffectValueChange(changes, "effect removeOnHit", previous.removeOnHit, current.removeOnHit);
    pushEffectValueChange(changes, "effect hasHit", previous.hasHit, current.hasHit);
    pushEffectValueChange(changes, "effect removal", previous.removalReason, current.removalReason);
    pushEffectValueChange(changes, "effect terminal", previous.terminalReason, current.terminalReason);
    pushEffectValueChange(changes, "effect terminalAge", previous.terminalAge, current.terminalAge);
    pushEffectValueChange(changes, "effect terminalDuration", previous.terminalDuration, current.terminalDuration);
    pushEffectValueChange(changes, "effect hitAnim", previous.hitAnimNo, current.hitAnimNo);
    pushEffectValueChange(changes, "effect removeAnim", previous.removeAnimNo, current.removeAnimNo);
    pushEffectValueChange(changes, "effect cancelAnim", previous.cancelAnimNo, current.cancelAnimNo);
  }
  return changes;
}

function pushEffectValueChange(
  changes: string[],
  label: string,
  previous: string | number | boolean | undefined,
  current: string | number | boolean | undefined,
): void {
  if (previous !== current) {
    changes.push(`${label} ${formatEffectValue(previous)}->${formatEffectValue(current)}`);
  }
}

function formatEffectValue(value: string | number | boolean | undefined): string {
  return value === undefined ? "none" : String(value);
}

function sameOptionalPoint(left: { x: number; y: number } | undefined, right: { x: number; y: number } | undefined): boolean {
  if (!left || !right) {
    return left === right;
  }
  return left.x === right.x && left.y === right.y;
}

function formatOptionalPoint(point: { x: number; y: number } | undefined): string {
  return point ? formatPoint(point) : "none";
}

function summarizeWorldDelta(
  world: RuntimeTraceFrame["world"] | undefined,
  previousWorld: RuntimeTraceFrame["world"] | undefined,
): RuntimeTraceArtifactWorldDelta | undefined {
  if (!world) {
    return undefined;
  }
  const effectStoreTotal = traceWorldEffectStoreTotal(world);
  const previousEffectStoreTotal = previousWorld ? traceWorldEffectStoreTotal(previousWorld) : undefined;
  return {
    liveDelta: previousWorld ? world.live.length - previousWorld.live.length : undefined,
    effectStoreTotalDelta: previousEffectStoreTotal === undefined ? undefined : effectStoreTotal - previousEffectStoreTotal,
    targetLinkDelta: previousWorld ? world.targetLinks.length - previousWorld.targetLinks.length : undefined,
    lifecycleEventCount: world.eventsThisTick.length,
    spawned: [...world.spawnedThisTick],
    removed: [...world.removedThisTick],
  };
}

function traceWorldEffectStoreTotal(world: NonNullable<RuntimeTraceFrame["world"]>): number {
  return world.effectStores.reduce((total, store) => total + store.total, 0);
}

function sameTraceInput(left: RuntimeTraceFrame["input"], right: RuntimeTraceFrame["input"]): boolean {
  return (
    left.force === right.force &&
    left.p1.join("\n") === right.p1.join("\n") &&
    (left.p2 ?? []).join("\n") === (right.p2 ?? []).join("\n")
  );
}

function formatPoint(point: { x: number; y: number }): string {
  return `${point.x},${point.y}`;
}

function cloneTraceWorld(world: NonNullable<RuntimeTraceFrame["world"]>): NonNullable<RuntimeTraceFrame["world"]> {
  return {
    live: [...world.live],
    spawnedThisTick: [...world.spawnedThisTick],
    removedThisTick: [...world.removedThisTick],
    removed: [...world.removed],
    eventsThisTick: world.eventsThisTick.map((event) => ({ ...event })),
    recentEvents: world.recentEvents.map((event) => ({ ...event })),
    effectStores: world.effectStores.map((store) => ({
      ownerId: store.ownerId,
      total: store.total,
      explods: [...store.explods],
      helpers: [...store.helpers],
      projectiles: [...store.projectiles],
      nextSerials: { ...store.nextSerials },
    })),
    targetLinks: world.targetLinks.map((link) => ({
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
    lifecycle: world.lifecycle.map((record) => ({ ...record })),
  };
}

function cloneGateRequirements(gate: RuntimeTraceGate): RuntimeTraceArtifactGateRequirements {
  return {
    requiredActorSources: gate.requiredActorSources ? [...gate.requiredActorSources] : undefined,
    requiredActorKinds: gate.requiredActorKinds ? [...gate.requiredActorKinds] : undefined,
    requiredEffectKinds: gate.requiredEffectKinds ? [...gate.requiredEffectKinds] : undefined,
    requiredRoutedStates: gate.requiredRoutedStates ? [...gate.requiredRoutedStates] : undefined,
    requiredExecutedStates: gate.requiredExecutedStates ? [...gate.requiredExecutedStates] : undefined,
    requiredExecutedControllers: gate.requiredExecutedControllers?.map((requirement) =>
      typeof requirement === "string" ? requirement : { ...requirement },
    ),
    requiredExecutedOperations: gate.requiredExecutedOperations?.map((requirement) =>
      typeof requirement === "string" ? requirement : { ...requirement },
    ),
    requiredActiveCommands: gate.requiredActiveCommands ? [...gate.requiredActiveCommands] : undefined,
    requiredEventCategories: gate.requiredEventCategories ? [...gate.requiredEventCategories] : undefined,
    requiredEventSubstrings: gate.requiredEventSubstrings ? [...gate.requiredEventSubstrings] : undefined,
    requiredCombatReasons: gate.requiredCombatReasons ? [...gate.requiredCombatReasons] : undefined,
    requiredWorldLifecycleEvents: gate.requiredWorldLifecycleEvents?.map((requirement) => ({ ...requirement })),
    requiredEffectStores: gate.requiredEffectStores?.map((requirement) => ({ ...requirement })),
    requiredEffectPayloads: gate.requiredEffectPayloads?.map((requirement) => ({ ...requirement })),
    requiredMatchPauses: gate.requiredMatchPauses?.map((requirement) => ({ ...requirement })),
    requiredMatchPauseFreezes: gate.requiredMatchPauseFreezes?.map((requirement) => ({ ...requirement })),
    requiredMatchPauseAdvances: gate.requiredMatchPauseAdvances?.map((requirement) => ({ ...requirement })),
    requiredTargetLinks: gate.requiredTargetLinks?.map((requirement) => ({ ...requirement })),
    requiredActorFrames: gate.requiredActorFrames?.map((requirement) => ({ ...requirement })),
    requiredFinalActors: gate.requiredFinalActors?.map((actor) => ({
      ...actor,
      hitFall: actor.hitFall ? { ...actor.hitFall } : undefined,
    })),
  };
}

function cloneTraceActor(actor: RuntimeTraceFrame["actors"][number]): RuntimeTraceFrame["actors"][number] {
  return {
    ...actor,
    pos: { ...actor.pos },
    vel: { ...actor.vel },
    effect: actor.effect ? cloneTraceEffect(actor.effect) : undefined,
    hitFall: actor.hitFall
      ? {
          ...actor.hitFall,
          velocity: { ...actor.hitFall.velocity },
          envShake: actor.hitFall.envShake ? { ...actor.hitFall.envShake } : undefined,
        }
      : undefined,
  };
}

function cloneTraceEffect(effect: RuntimeTraceArtifactEffect): RuntimeTraceArtifactEffect {
  if (effect.kind === "explod") {
    return {
      ...effect,
      scale: { ...effect.scale },
      bindOffset: effect.bindOffset ? { ...effect.bindOffset } : undefined,
    };
  }
  return { ...effect };
}

function cloneTraceGateFinalActor(
  actor: RuntimeTraceGateResult["evidence"]["finalActors"][number],
): RuntimeTraceGateResult["evidence"]["finalActors"][number] {
  return {
    ...actor,
    hitFall: actor.hitFall
      ? {
          ...actor.hitFall,
          velocity: { ...actor.hitFall.velocity },
          envShake: actor.hitFall.envShake ? { ...actor.hitFall.envShake } : undefined,
        }
      : undefined,
  };
}
