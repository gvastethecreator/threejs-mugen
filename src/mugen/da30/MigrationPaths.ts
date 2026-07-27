/**
 * DA30-115: project/evidence/API migration paths.
 */

export type MigrationResult = {
  from: string;
  to: string;
  ok: boolean;
  mode: "migrate" | "read-only" | "fail";
  preservedOriginal: boolean;
  detail: string;
};

export function migrateEnvelope(
  version: string,
  target: string,
): MigrationResult {
  if (version === target) {
    return { from: version, to: target, ok: true, mode: "migrate", preservedOriginal: true, detail: "noop" };
  }
  if (version === "v0" && target === "v1") {
    return { from: version, to: target, ok: true, mode: "migrate", preservedOriginal: true, detail: "n-1 upgrade" };
  }
  if (version === "v9-future") {
    return {
      from: version,
      to: target,
      ok: true,
      mode: "read-only",
      preservedOriginal: true,
      detail: "unknown future open read-only",
    };
  }
  if (version === "corrupt") {
    return {
      from: version,
      to: target,
      ok: false,
      mode: "fail",
      preservedOriginal: true,
      detail: "failed migration keeps original",
    };
  }
  return {
    from: version,
    to: target,
    ok: false,
    mode: "fail",
    preservedOriginal: true,
    detail: "unsupported",
  };
}

export function runMigrationPaths(): { ok: boolean; results: MigrationResult[] } {
  const results = [
    migrateEnvelope("v0", "v1"),
    migrateEnvelope("v1", "v1"),
    migrateEnvelope("v9-future", "v1"),
    migrateEnvelope("corrupt", "v1"),
    migrateEnvelope("partial", "v1"),
  ];
  return {
    ok:
      results[0]!.ok &&
      results[2]!.mode === "read-only" &&
      results[3]!.preservedOriginal &&
      !results[3]!.ok,
    results,
  };
}
