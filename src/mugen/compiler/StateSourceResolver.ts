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

export type MugenStateSourceResolution = {
  states: MugenStateDef[];
  selections: MugenStateSourceSelection[];
};

export function resolveMugenStateSources(sources: readonly MugenStateSourceInput[]): MugenStateSourceResolution {
  const ordered = sources
    .map((source, index) => ({ source, index }))
    .sort((left, right) => sourceRank(left.source.kind) - sourceRank(right.source.kind) || left.index - right.index);
  const states: MugenStateDef[] = [];
  const selections = new Map<string, MugenStateSourceSelection>();

  for (const { source } of ordered) {
    const ref = createMugenStateSourceRef(source);
    for (const state of source.states) {
      const existing = selections.get(mugenStateIdentityKey(state.id, state.special));
      if (existing) {
        existing.shadowed.push(ref);
        if (existing.selected.kind === "character" && ref.kind === "common") {
          existing.reason = "character-override";
        }
        continue;
      }

      const selected = cloneStateWithSource(state, ref);
      states.push(selected);
      selections.set(mugenStateIdentityKey(state.id, state.special), {
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

function sourceRank(kind: MugenStateSourceKind): number {
  return kind === "character" ? 0 : 1;
}
