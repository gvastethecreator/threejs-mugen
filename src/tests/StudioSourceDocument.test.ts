import { describe, expect, it } from "vitest";
import {
  createStudioSourceDocumentDraft,
  updateStudioSourceDocumentDraft,
} from "../app/StudioSourceDocument";

describe("StudioSourceDocument recovery", () => {
  it("marks a replayed preimage dirty when the linked source has different text", () => {
    const draft = createStudioSourceDocumentDraft({
      sourcePackageId: "kfm-folder",
      path: "chars/kfm/kfm.cns",
      text: "current source",
    });

    const recovered = updateStudioSourceDocumentDraft(draft, "pending preimage");

    expect(recovered).toMatchObject({
      originalText: "current source",
      text: "pending preimage",
      dirty: true,
    });
  });

  it("keeps a replayed preimage clean when the linked source already matches", () => {
    const draft = createStudioSourceDocumentDraft({
      sourcePackageId: "kfm-folder",
      path: "chars/kfm/kfm.cns",
      text: "same source",
    });

    const recovered = updateStudioSourceDocumentDraft(draft, "same source");

    expect(recovered.dirty).toBe(false);
  });
});
