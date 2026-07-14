export type StudioSourceDocumentDraft = {
  sourcePackageId: string;
  path: string;
  originalText: string;
  text: string;
  dirty: boolean;
};

export function createStudioSourceDocumentDraft(input: {
  sourcePackageId: string;
  path: string;
  text: string;
}): StudioSourceDocumentDraft {
  return {
    sourcePackageId: input.sourcePackageId,
    path: input.path,
    originalText: input.text,
    text: input.text,
    dirty: false,
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
