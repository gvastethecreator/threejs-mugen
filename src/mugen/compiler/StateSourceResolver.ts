import { mugenStateIdentityKey } from "../model/MugenState";
import type {
  MugenStateDef,
  MugenStateSourceKind,
  MugenStateSourceRef,
  MugenStateSourceSelection,
} from "../model/MugenState";

export type MugenStateSourceInput = {
  kind: MugenStateSourceKind;
  path: string;
  text: string;
  states: MugenStateDef[];
};

export type MugenStateSourceNegativePolicy = "first-wins" | "ikemen-append";

export type MugenStateSourceResolutionOptions = {
  negativeStatePolicy?: MugenStateSourceNegativePolicy;
};

export type MugenStateSourceResolution = {
  states: MugenStateDef[];
  selections: MugenStateSourceSelection[];
};

export function resolveMugenStateSources(
  sources: readonly MugenStateSourceInput[],
  options: MugenStateSourceResolutionOptions = {},
): MugenStateSourceResolution {
  const ordered = sources
    .map((source, index) => ({ source, index }))
    .sort((left, right) => sourceRank(left.source.kind) - sourceRank(right.source.kind) || left.index - right.index);
  const states: MugenStateDef[] = [];
  const selections = new Map<string, MugenStateSourceSelection>();
  const stateIndexes = new Map<string, number>();
  const negativeStatePolicy = options.negativeStatePolicy ?? "first-wins";

  for (const { source } of ordered) {
    const ref = createMugenStateSourceRef(source);
    const identitiesInSource = new Set<string>();
    for (const state of source.states) {
      const identity = mugenStateIdentityKey(state.id, state.special);
      const repeatedInSource = identitiesInSource.has(identity);
      identitiesInSource.add(identity);
      const existing = selections.get(identity);
      if (existing) {
        if (!repeatedInSource && negativeStatePolicy === "ikemen-append" && isMergeableNegativeState(state)) {
          const stateIndex = stateIndexes.get(identity);
          const current = stateIndex === undefined ? undefined : states[stateIndex];
          if (current && stateIndex !== undefined) {
            states[stateIndex] = appendNegativeState(current, state, ref);
            existing.appended ??= [];
            existing.appended.push(ref);
            existing.reason = "ikemen-negative-merge";
            continue;
          }
        }
        existing.shadowed.push(ref);
        if (existing.selected.kind === "character" && ref.kind === "common") {
          existing.reason = "character-override";
        }
        continue;
      }

      const selected = cloneStateWithSource(state, ref);
      stateIndexes.set(identity, states.length);
      states.push(selected);
      selections.set(identity, {
        stateId: state.id,
        ...(state.special ? { special: state.special } : {}),
        selected: ref,
        shadowed: [],
        reason: ref.kind === "character" ? "character-only" : "common-fallback",
      });
    }
  }

  return { states, selections: [...selections.values()] };
}

export function fingerprintMugenStateSource(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function createMugenStateSourceRef(source: MugenStateSourceInput): MugenStateSourceRef {
  return {
    kind: source.kind,
    path: source.path,
    fingerprint: fingerprintMugenStateSource(source.text),
  };
}

function cloneStateWithSource(state: MugenStateDef, source: MugenStateSourceRef): MugenStateDef {
  return {
    ...state,
    rawParams: { ...state.rawParams },
    source,
    controllers: state.controllers.map((controller) => ({
      ...controller,
      triggers: controller.triggers.map((trigger) => ({ ...trigger })),
      params: { ...controller.params },
      source,
    })),
  };
}

function appendNegativeState(current: MugenStateDef, next: MugenStateDef, source: MugenStateSourceRef): MugenStateDef {
  const appended = cloneStateWithSource(next, source);
  const merged: MugenStateDef = {
    ...current,
    rawParams: { ...current.rawParams, ...appended.rawParams },
    controllers: [...current.controllers, ...appended.controllers],
  };
  if (next.type !== undefined) merged.type = next.type;
  if (next.moveType !== undefined) merged.moveType = next.moveType;
  if (next.physics !== undefined) merged.physics = next.physics;
  if (next.anim !== undefined) merged.anim = next.anim;
  if (next.ctrl !== undefined) merged.ctrl = next.ctrl;
  if (next.velSet !== undefined) merged.velSet = next.velSet;
  if (next.hitDefPersist !== undefined) merged.hitDefPersist = next.hitDefPersist;
  if (next.moveHitPersist !== undefined) merged.moveHitPersist = next.moveHitPersist;
  if (next.hitCountPersist !== undefined) merged.hitCountPersist = next.hitCountPersist;
  return merged;
}

function isMergeableNegativeState(state: MugenStateDef): boolean {
  return state.id < 0 || state.special === "plus-one";
}

function sourceRank(kind: MugenStateSourceKind): number {
  return kind === "character" ? 0 : 1;
}
