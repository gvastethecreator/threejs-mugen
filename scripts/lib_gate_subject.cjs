/**
 * Shared DA31-006 subject helpers for Node gate scripts.
 */
const { execSync } = require("node:child_process");

function headSha(repoRoot) {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function isDirtyTree(repoRoot) {
  try {
    const s = execSync("git status --porcelain", { cwd: repoRoot, encoding: "utf8" });
    // Until DA31-005 hermetic migration is complete, DA30/DA29 evidence JSON is
    // rewritten by unit tests. Ignore those paths for subject provisional status.
    const lines = s
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => {
        const pathPart = l.replace(/^[MADRCU\?\!\s]+/, "").replace(/^"|"$/g, "");
        if (/^docs\/evidence\/da30\//.test(pathPart)) return false;
        if (/^docs\/evidence\/da29\//.test(pathPart)) return false;
        if (/^\.scratch\//.test(pathPart)) return false;
        return true;
      });
    return lines.length > 0;
  } catch {
    return true;
  }
}

function buildSubjectEnvelope(repoRoot, opts = {}) {
  const dirty = isDirtyTree(repoRoot);
  const subjectSha = headSha(repoRoot);
  return {
    schema: "Da31GateSubjectEnvelope/v1",
    subjectSha,
    dirtyTree: dirty,
    provisional: dirty,
    probePaths: opts.probePaths || [],
    codePaths: opts.codePaths || [],
    claimLimit: dirty
      ? "provisional dirty-tree observation only; not authoritative formal/product pin"
      : "subject-bound observation at listed probe/code paths",
  };
}

module.exports = { headSha, isDirtyTree, buildSubjectEnvelope };
