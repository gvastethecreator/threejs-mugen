/**
 * DA30-079: deterministic local playable bundle digest (pure).
 */

export type ExportManifest = {
  schema: "Da30LocalExportManifest/v1";
  projectId: string;
  revision: number;
  toolChain: string;
  files: Array<{ path: string; digest: string }>;
  evidenceDigests: string[];
  claimSheet: string[];
};

export function buildExportManifest(input: {
  projectId: string;
  revision: number;
  toolChain: string;
  files: Array<{ path: string; content: string }>;
  evidenceDigests: string[];
  claimSheet: string[];
}): ExportManifest {
  const files = input.files
    .map((f) => ({
      path: f.path.replace(/\\/g, "/").replace(/^\/+/, ""),
      digest: simpleDigest(f.content),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return {
    schema: "Da30LocalExportManifest/v1",
    projectId: input.projectId,
    revision: input.revision,
    toolChain: input.toolChain,
    files,
    evidenceDigests: [...input.evidenceDigests].sort(),
    claimSheet: [...input.claimSheet].sort(),
  };
}

export function exportContentDigest(m: ExportManifest): string {
  return simpleDigest(JSON.stringify(m));
}

function simpleDigest(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
