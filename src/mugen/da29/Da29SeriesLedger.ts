/**
 * DA29 series ledger helpers — pure functions used by tests and materializers.
 * Determines consecutive closedThrough from per-ID closeout status records.
 */

export type Da29CloseStatus = "closed" | "open";

export type Da29CloseoutRecord = {
  id: string;
  kind: "R" | "A" | "I" | "G";
  status: Da29CloseStatus;
  measuredGate?: boolean;
  gateSha?: string | null;
  acceptance: string;
  evidenceClass:
    | "control-adoption"
    | "measured-global-gate"
    | "research-inventory"
    | "architecture-design"
    | "implementation-probe"
    | "gate-report"
    | "browser-matrix"
    | "unproven";
};

export function padDa29(n: number): string {
  return `DA29-${String(n).padStart(3, "0")}`;
}

export function parseDa29Number(id: string): number {
  const m = /^DA29-(\d{3})$/.exec(id);
  if (!m) throw new Error(`invalid DA29 id: ${id}`);
  return Number(m[1]);
}

/** Highest consecutive closed ID starting at DA29-001; open IDs fill nextQueue. */
export function computeSeriesCursor(records: Da29CloseoutRecord[]): {
  closedThrough: string;
  nextQueue: string[];
  closedIds: string[];
  openIds: string[];
} {
  const byId = new Map(records.map((r) => [r.id, r]));
  const closedIds: string[] = [];
  const openIds: string[] = [];
  let waterMark = 0;

  for (let n = 1; n <= 200; n += 1) {
    const id = padDa29(n);
    const rec = byId.get(id);
    if (!rec) {
      openIds.push(id);
      if (waterMark === n - 1) {
        // first gap stops consecutive watermark
      }
      continue;
    }
    if (rec.status === "closed" && rec.evidenceClass !== "unproven") {
      if (waterMark === n - 1) {
        waterMark = n;
        closedIds.push(id);
      } else {
        // non-consecutive closed still recorded but does not advance watermark
        closedIds.push(id);
      }
    } else {
      openIds.push(id);
    }
  }

  const closedThrough = waterMark === 0 ? "DA28-30" : padDa29(waterMark);
  const nextQueue: string[] = [];
  for (let n = waterMark + 1; n <= 200; n += 1) {
    nextQueue.push(padDa29(n));
  }

  return { closedThrough, nextQueue, closedIds, openIds };
}

/** Kind rules for whether a closeout may be closed without being unproven theater. */
export function mayClose(record: Pick<Da29CloseoutRecord, "kind" | "evidenceClass" | "measuredGate" | "status">): boolean {
  if (record.status !== "closed") return false;
  switch (record.evidenceClass) {
    case "unproven":
      return false;
    case "measured-global-gate":
      return record.measuredGate === true;
    case "control-adoption":
    case "research-inventory":
    case "architecture-design":
    case "implementation-probe":
    case "gate-report":
    case "browser-matrix":
      return true;
    default:
      return false;
  }
}

export function evidenceClassForKind(
  kind: Da29CloseoutRecord["kind"],
  id: string,
  opts: { measuredGate?: boolean; hasBrowserArtifacts?: boolean; hasProbe?: boolean },
): Da29CloseoutRecord["evidenceClass"] {
  if (id === "DA29-001") return "control-adoption";
  if (id === "DA29-002") return opts.measuredGate ? "measured-global-gate" : "unproven";
  if (kind === "R") return "research-inventory";
  if (kind === "A") return "architecture-design";
  if (kind === "I") return opts.hasProbe ? "implementation-probe" : "unproven";
  if (kind === "G") {
    if (opts.hasBrowserArtifacts) return "browser-matrix";
    if (opts.measuredGate) return "measured-global-gate";
    return "gate-report";
  }
  return "unproven";
}
