/**
 * DA30-072: versioned Studio project envelope.
 */

export type ProjectEnvelope = {
  schema: "Da30ProjectEnvelope/v1";
  projectId: string;
  revision: number;
  sourceGraphDigest: string;
  edits: string[];
  assets: string[];
  scannerFactsDigest: string | null;
  profile: string;
  toolChain: string;
  evidenceDigests: string[];
  createdAt: string;
  updatedAt: string;
};

export function createProjectEnvelope(input: {
  projectId: string;
  sourceGraphDigest: string;
  profile?: string;
  toolChain?: string;
}): ProjectEnvelope {
  const now = new Date().toISOString();
  return {
    schema: "Da30ProjectEnvelope/v1",
    projectId: input.projectId,
    revision: 1,
    sourceGraphDigest: input.sourceGraphDigest,
    edits: [],
    assets: [],
    scannerFactsDigest: null,
    profile: input.profile ?? "ikemen-go",
    toolChain: input.toolChain ?? "mugen-web-sandbox",
    evidenceDigests: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function openEnvelope(raw: unknown): { ok: true; envelope: ProjectEnvelope } | { ok: false; mode: "read-only" | "fail"; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, mode: "fail", error: "not object" };
  const e = raw as Partial<ProjectEnvelope>;
  if (e.schema !== "Da30ProjectEnvelope/v1") return { ok: false, mode: "read-only", error: "unknown schema version" };
  if (typeof e.projectId !== "string" || typeof e.revision !== "number") {
    return { ok: false, mode: "fail", error: "corrupt envelope" };
  }
  return { ok: true, envelope: e as ProjectEnvelope };
}

export function commitEdit(env: ProjectEnvelope, editId: string): ProjectEnvelope {
  return {
    ...env,
    revision: env.revision + 1,
    edits: [...env.edits, editId],
    updatedAt: new Date().toISOString(),
  };
}
