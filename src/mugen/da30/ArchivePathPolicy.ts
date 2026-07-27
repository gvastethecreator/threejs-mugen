/**
 * DA30-030/064: pure archive path safety probes (local trust boundary).
 */

export type PathProbeResult = {
  path: string;
  safe: boolean;
  reasons: string[];
};

const WINDOWS_ABS = /^[a-zA-Z]:[\\/]/;
const UNC = /^\\\\/;
const URL_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function probeArchivePath(entryPath: string): PathProbeResult {
  const reasons: string[] = [];
  const normalized = entryPath.replace(/\\/g, "/");
  if (!normalized.trim()) reasons.push("empty path");
  if (normalized.startsWith("/")) reasons.push("absolute unix path");
  if (WINDOWS_ABS.test(entryPath) || WINDOWS_ABS.test(normalized)) reasons.push("absolute windows path");
  if (UNC.test(entryPath)) reasons.push("unc path");
  if (normalized.split("/").some((p) => p === ".." || p === ".")) {
    if (normalized.split("/").includes("..")) reasons.push("path traversal");
  }
  if (URL_SCHEME.test(normalized) && !normalized.startsWith("file:")) reasons.push("url scheme");
  if (/\0/.test(entryPath)) reasons.push("null byte");
  if (normalized.length > 512) reasons.push("path too long");
  // Case-collision risk is documented only; pure function flags mixed-case duplicates via caller.
  return { path: entryPath, safe: reasons.length === 0, reasons };
}

export function rejectUnsafeArchivePaths(paths: string[]): {
  ok: boolean;
  rejected: PathProbeResult[];
  accepted: string[];
} {
  const rejected: PathProbeResult[] = [];
  const accepted: string[] = [];
  for (const p of paths) {
    const r = probeArchivePath(p);
    if (r.safe) accepted.push(p);
    else rejected.push(r);
  }
  return { ok: rejected.length === 0, rejected, accepted };
}

export function negativeArchivePathFixtures(): string[] {
  return [
    "../escape.txt",
    "/etc/passwd",
    "C:\\Windows\\system.ini",
    "\\\\server\\share\\x",
    "https://evil.example/x",
    "ok/nested\0bad.txt",
    "chars/../secret.cns",
  ];
}

export function positiveArchivePathFixtures(): string[] {
  return ["chars/nova/nova.cns", "stages/rooftop/stage.def", "data/common1.cns"];
}
