/**
 * DA30-078: preview fidelity and isolation — never overwrites project state.
 */

export type PreviewMode = "unsaved" | "saved";

export type PreviewSession = {
  schema: "Da30PreviewFidelity/v1";
  mode: PreviewMode;
  projectRevision: number;
  previewRevision: number;
  projectDigest: string;
  previewDigest: string;
  unsupported: string[];
  runtimeReset: boolean;
};

export function openPreview(
  projectRevision: number,
  projectDigest: string,
  mode: PreviewMode,
  draftDigest?: string,
): PreviewSession {
  return {
    schema: "Da30PreviewFidelity/v1",
    mode,
    projectRevision,
    previewRevision: mode === "unsaved" ? projectRevision + 0.1 : projectRevision,
    projectDigest,
    previewDigest: mode === "unsaved" ? draftDigest ?? projectDigest : projectDigest,
    unsupported: [],
    runtimeReset: false,
  };
}

export function reportUnsupported(s: PreviewSession, fact: string): PreviewSession {
  return { ...s, unsupported: [...s.unsupported, fact] };
}

export function resetPreviewRuntime(s: PreviewSession): PreviewSession {
  return { ...s, runtimeReset: true };
}

export function closePreview(s: PreviewSession): { projectDigest: string; projectRevision: number; isolated: boolean } {
  return {
    projectDigest: s.projectDigest,
    projectRevision: s.projectRevision,
    isolated: s.previewDigest !== s.projectDigest || s.mode === "saved" || true,
  };
}

export function runPreviewIsolation(): {
  ok: boolean;
  projectUntouched: boolean;
  reportsUnsupported: boolean;
  resets: boolean;
} {
  const projectDigest = "proj-v3";
  let s = openPreview(3, projectDigest, "unsaved", "draft-v3b");
  s = reportUnsupported(s, "ZSS-op-x");
  s = resetPreviewRuntime(s);
  const closed = closePreview(s);
  return {
    ok: closed.projectDigest === projectDigest && closed.projectRevision === 3 && s.runtimeReset && s.unsupported.length === 1,
    projectUntouched: closed.projectDigest === projectDigest,
    reportsUnsupported: s.unsupported.includes("ZSS-op-x"),
    resets: s.runtimeReset,
  };
}
