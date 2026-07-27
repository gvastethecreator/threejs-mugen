/**
 * DA30-086: scanner archive/path limit checks (pure).
 */

export type ArchiveEntry = { path: string; size: number };

export type ScannerLimitConfig = {
  maxEntries: number;
  maxFileBytes: number;
  maxDepth: number;
};

export function checkArchiveEntry(entry: ArchiveEntry, cfg: ScannerLimitConfig): { ok: boolean; reason?: string } {
  const p = entry.path.replace(/\\/g, "/");
  if (p.includes("..")) return { ok: false, reason: "traversal" };
  if (/^([a-zA-Z]:)?\//.test(p) || p.startsWith("//")) return { ok: false, reason: "absolute" };
  if (entry.size > cfg.maxFileBytes) return { ok: false, reason: "file-too-large" };
  const depth = p.split("/").filter(Boolean).length;
  if (depth > cfg.maxDepth) return { ok: false, reason: "depth" };
  return { ok: true };
}

export function checkArchiveBatch(entries: ArchiveEntry[], cfg: ScannerLimitConfig): { ok: boolean; failures: string[] } {
  const failures: string[] = [];
  if (entries.length > cfg.maxEntries) failures.push("entry-count");
  for (const e of entries) {
    const r = checkArchiveEntry(e, cfg);
    if (!r.ok) failures.push(`${e.path}:${r.reason}`);
  }
  return { ok: failures.length === 0, failures };
}
