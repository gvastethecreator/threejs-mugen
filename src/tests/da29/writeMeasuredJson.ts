import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

/** Destination directory for explicit rematerialization. Unset: tests only assert tracked files. */
export const MEASURED_EVIDENCE_OUT_ENV = "MEASURED_EVIDENCE_OUT";

/** Readers see either the previous complete document or the new complete document. */
export function writeMeasuredJson(path: string, body: unknown): void {
  const content = `${JSON.stringify(body, null, 2)}\n`;
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(temporaryPath, content, { encoding: "utf8", flag: "wx" });
    renameSync(temporaryPath, path);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

export function assertExistingMeasuredEvidence(trackedPath: string): void {
  if (!existsSync(trackedPath)) {
    throw new Error(`missing measured evidence ${trackedPath}`);
  }
  const raw = readFileSync(trackedPath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `malformed measured evidence ${trackedPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`malformed measured evidence ${trackedPath}: expected a JSON object`);
  }
}

/** Ordinary tests assert the tracked record. `MEASURED_EVIDENCE_OUT` writes only that directory. */
export function persistMeasuredEvidence(trackedPath: string, body: unknown): void {
  const destinationDir = process.env[MEASURED_EVIDENCE_OUT_ENV]?.trim();
  if (destinationDir) {
    writeMeasuredJson(resolve(destinationDir, basename(trackedPath)), body);
    return;
  }
  assertExistingMeasuredEvidence(trackedPath);
}
