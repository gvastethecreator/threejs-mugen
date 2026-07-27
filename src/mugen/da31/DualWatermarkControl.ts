/**
 * DA31-003: dual watermark control model (design + pure helpers).
 * recordedThrough = machine series; adjudicatedThrough = written-clause ceiling.
 */

export type DualWatermarkDocument = {
  schema: "Da31DualWatermarkControl/v1";
  recordedThrough: string;
  adjudicatedThrough: string;
  reviewedThrough: string;
  /** Compatibility alias: equals recordedThrough for legacy consumers. */
  closedThrough: string;
  nextQueue: string[];
  scores: Record<string, string>;
  cursors: {
    head: CursorPin;
    formal: CursorPin;
    global: CursorPin;
    focal: CursorPin;
    visual: CursorPin;
    product: CursorPin;
    sourceNormative: CursorPin;
    sourceWorking: CursorPin;
    backlog?: CursorPin;
  };
};

export type CursorPin = {
  sha: string;
  artifact: string;
  claimLimit: string;
};

export function createDualWatermark(input: {
  recordedThrough: string;
  adjudicatedThrough: string;
  reviewedThrough: string;
  nextQueue?: string[];
  scores: Record<string, string>;
  cursors: DualWatermarkDocument["cursors"];
}): DualWatermarkDocument {
  return {
    schema: "Da31DualWatermarkControl/v1",
    recordedThrough: input.recordedThrough,
    adjudicatedThrough: input.adjudicatedThrough,
    reviewedThrough: input.reviewedThrough,
    closedThrough: input.recordedThrough,
    nextQueue: [...(input.nextQueue ?? [])],
    scores: { ...input.scores },
    cursors: { ...input.cursors },
  };
}

export function canClaimAdjudicated(doc: DualWatermarkDocument, taskId: string): boolean {
  // Only tasks at or before adjudicatedThrough may claim full written-clause close.
  const n = parseDaId(taskId);
  const adj = parseDaId(doc.adjudicatedThrough);
  if (n === null || adj === null) return false;
  if (n.series !== adj.series) return n.series < adj.series;
  return n.num <= adj.num;
}

export function gapAfterAdjudicated(doc: DualWatermarkDocument): string[] {
  const rec = parseDaId(doc.recordedThrough);
  const adj = parseDaId(doc.adjudicatedThrough);
  if (!rec || !adj || rec.series !== adj.series) return [];
  const out: string[] = [];
  for (let i = adj.num + 1; i <= rec.num; i += 1) {
    out.push(`${adj.series}-${String(i).padStart(3, "0")}`);
  }
  return out;
}

function parseDaId(id: string): { series: string; num: number } | null {
  const m = /^(DA\d+)-(\d+)$/.exec(id);
  if (!m) return null;
  return { series: m[1]!, num: Number(m[2]) };
}
