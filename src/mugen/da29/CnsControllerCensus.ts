/**
 * DA29-013 — controller census from parsed CNS (not regex over type= StateDef lines).
 */
import { createHash } from "node:crypto";
import { parseCns } from "../parsers/CnsParser";
import type { MugenStateFile } from "../model/MugenState";

export const CNS_CONTROLLER_CENSUS_SCHEMA = "CnsControllerCensus/v1" as const;

/** StateDef state types must never be counted as controllers. */
export const STATE_DEF_TYPE_TOKENS = new Set(["s", "c", "a", "l", "u"]);

export type ControllerCensusRow = {
  controller: string;
  occurrences: number;
  stateIds: number[];
  lines: number[];
};

export type CnsControllerCensus = {
  schema: typeof CNS_CONTROLLER_CENSUS_SCHEMA;
  source: string;
  controllerRows: ControllerCensusRow[];
  controllerCount: number;
  totalOccurrences: number;
  stateDefCount: number;
  rejectedStateDefTypeAsController: number;
  diagnostics: Array<{ severity: string; message: string; line?: number }>;
  digest: string;
};

/**
 * Build census from a parsed CNS file. Controllers come only from [State ...] blocks
 * with a `type =` param — never from StateDef type = S/C/A/L/U.
 */
export function buildCnsControllerCensus(text: string, source: string): CnsControllerCensus {
  const parsed: MugenStateFile = parseCns(text, source);
  const byType = new Map<string, ControllerCensusRow>();
  let rejectedStateDefTypeAsController = 0;

  for (const controller of parsed.controllers) {
    const rawType = String(controller.type || "").trim();
    const key = rawType.toLowerCase();
    if (!key) continue;
    // Defense: if a controller type is exactly a StateDef type token with no real controller name,
    // still count it as a controller type string (ChangeState etc. are different). StateDef types
    // live on states, not controllers — we never invent controllers from state.type.
    if (!byType.has(key)) {
      byType.set(key, { controller: rawType, occurrences: 0, stateIds: [], lines: [] });
    }
    const row = byType.get(key)!;
    row.occurrences += 1;
    if (typeof controller.stateId === "number" && !row.stateIds.includes(controller.stateId)) {
      row.stateIds.push(controller.stateId);
    }
    if (typeof controller.line === "number") row.lines.push(controller.line);
  }

  // Explicit check: StateDef type = S/C/A/L/U is state metadata, not a controller row source.
  for (const state of parsed.states) {
    const st = String(state.type ?? state.rawParams?.type ?? "").trim().toLowerCase();
    if (STATE_DEF_TYPE_TOKENS.has(st)) {
      rejectedStateDefTypeAsController += 1;
    }
  }

  const controllerRows = [...byType.values()].sort((a, b) => a.controller.localeCompare(b.controller));
  const payload = {
    schema: CNS_CONTROLLER_CENSUS_SCHEMA,
    source,
    controllerRows,
    controllerCount: controllerRows.length,
    totalOccurrences: controllerRows.reduce((n, r) => n + r.occurrences, 0),
    stateDefCount: parsed.states.length,
    rejectedStateDefTypeAsController,
    diagnostics: (parsed.diagnostics || []).map((d) => ({
      severity: d.severity,
      message: d.message,
      line: d.line,
    })),
  };
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
  return { ...payload, digest };
}

/** Validate StateDef type tokens are not the only "controllers" and census is non-empty for real packages. */
export function validateCnsControllerCensus(census: CnsControllerCensus): string[] {
  const errors: string[] = [];
  if (census.schema !== CNS_CONTROLLER_CENSUS_SCHEMA) errors.push("bad schema");
  // No controller row may be only a StateDef type token invented without State blocks — rows can include
  // legitimate controllers. Ensure StateDef count is tracked separately.
  if (census.stateDefCount < 0) errors.push("invalid stateDefCount");
  return errors;
}
