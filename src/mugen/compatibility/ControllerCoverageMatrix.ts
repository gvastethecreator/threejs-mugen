/**
 * ControllerCoverageMatrix/v1 (DA28-18).
 * Exact controller/trigger denominators from package CNS + unsupported reasons.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const CONTROLLER_COVERAGE_MATRIX_SCHEMA = "ControllerCoverageMatrix/v1" as const;

export type ControllerCoverageRow = {
  controller: string;
  packageId: string;
  supported: boolean;
  reason?: string;
  occurrences: number;
};

export type ControllerCoverageMatrixReport = {
  schema: typeof CONTROLLER_COVERAGE_MATRIX_SCHEMA;
  packageDigests: Record<string, string>;
  rows: ControllerCoverageRow[];
  supportedCount: number;
  unsupportedCount: number;
  denominator: number;
  claims: { allowed: string[]; blocked: string[] };
  checksum: string;
};

const SUPPORTED = new Set([
  "changedef",
  "changestate",
  "hitdef",
  "velset",
  "veladd",
  "ctrlset",
  "varset",
  "null",
  "assertspecial",
  "playsnd",
  "explod",
  "helper",
  "projectile",
  "targetstate",
  "targetbind",
  "selfstate",
]);

export function buildControllerCoverageMatrix(input: {
  packages: Array<{ id: string; cnsPath: string; packageDigest: string }>;
}): ControllerCoverageMatrixReport {
  const counts = new Map<string, { packageId: string; count: number }>();
  for (const pkg of input.packages) {
    const text = readFileSync(pkg.cnsPath, "utf8");
    const re = /^\s*type\s*=\s*([A-Za-z0-9_]+)/gim;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      const controller = match[1]!.toLowerCase();
      const key = `${pkg.id}:${controller}`;
      const prev = counts.get(key);
      counts.set(key, { packageId: pkg.id, count: (prev?.count ?? 0) + 1 });
    }
  }

  const rows: ControllerCoverageRow[] = [...counts.entries()]
    .map(([key, value]) => {
      const controller = key.split(":")[1]!;
      const supported = SUPPORTED.has(controller);
      return {
        controller,
        packageId: value.packageId,
        supported,
        ...(supported ? {} : { reason: "not-in-supported-controller-set" }),
        occurrences: value.count,
      };
    })
    .sort((a, b) => a.packageId.localeCompare(b.packageId) || a.controller.localeCompare(b.controller));

  const supportedCount = rows.filter((r) => r.supported).length;
  const unsupportedCount = rows.filter((r) => !r.supported).length;
  const packageDigests = Object.fromEntries(input.packages.map((p) => [p.id, p.packageDigest]));
  const payload = {
    schema: CONTROLLER_COVERAGE_MATRIX_SCHEMA,
    packageDigests,
    rows,
    supportedCount,
    unsupportedCount,
    denominator: rows.length,
  };
  return {
    ...payload,
    claims: {
      allowed: [
        "controller occurrence matrix tied to package digests",
        "unsupported controllers listed with reasons",
      ],
      blocked: ["semantic parity from coverage counts", "score movement"],
    },
    checksum: stableHash(stableStringify(payload)),
  };
}

export function buildSandboxControllerCoverageMatrix(
  repoRoot = process.cwd(),
  packageDigests: Record<string, string> = {},
): ControllerCoverageMatrixReport {
  return buildControllerCoverageMatrix({
    packages: [
      {
        id: "nova-boxer",
        cnsPath: join(repoRoot, "public/characters/nova-boxer/mugen/nova.cns"),
        packageDigest: packageDigests["nova-boxer"] ?? "unknown",
      },
      {
        id: "mira-volt",
        cnsPath: join(repoRoot, "public/characters/mira-volt/mugen/mira.cns"),
        packageDigest: packageDigests["mira-volt"] ?? "unknown",
      },
    ],
  });
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
