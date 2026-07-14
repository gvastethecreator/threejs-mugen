import type { StudioSemanticDraftPreflight } from "./StudioSemanticDraft";

export type StudioSourceDocumentDraft = {
  sourcePackageId: string;
  path: string;
  originalText: string;
  text: string;
  dirty: boolean;
  baseSourceFingerprint?: string;
  baseProjectRevision?: number;
  semanticPreflight?: StudioSemanticDraftPreflight;
};

export function createStudioSourceDocumentDraft(input: {
  sourcePackageId: string;
  path: string;
  text: string;
  baseSourceFingerprint?: string;
  baseProjectRevision?: number;
  semanticPreflight?: StudioSemanticDraftPreflight;
}): StudioSourceDocumentDraft {
  return {
    sourcePackageId: input.sourcePackageId,
    path: input.path,
    originalText: input.text,
    text: input.text,
    dirty: false,
    ...(input.baseSourceFingerprint ? { baseSourceFingerprint: input.baseSourceFingerprint } : {}),
    ...(input.baseProjectRevision !== undefined ? { baseProjectRevision: input.baseProjectRevision } : {}),
    ...(input.semanticPreflight ? { semanticPreflight: input.semanticPreflight } : {}),
  };
}

export function updateStudioSourceDocumentDraft(
  draft: StudioSourceDocumentDraft,
  text: string,
): StudioSourceDocumentDraft {
  return {
    ...draft,
    text,
    dirty: text !== draft.originalText,
    semanticPreflight: undefined,
  };
}

export function commitStudioSourceDocumentDraft(
  draft: StudioSourceDocumentDraft,
): StudioSourceDocumentDraft {
  return {
    ...draft,
    originalText: draft.text,
    dirty: false,
  };
}

export function discardStudioSourceDocumentDraft(
  draft: StudioSourceDocumentDraft,
): StudioSourceDocumentDraft {
  return {
    ...draft,
    text: draft.originalText,
    dirty: false,
  };
}
