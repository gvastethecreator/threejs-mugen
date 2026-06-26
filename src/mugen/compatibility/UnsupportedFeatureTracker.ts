import type { MugenDiagnosticSeverity } from "../model/MugenAnimation";

export type UnsupportedFeature = {
  format: string;
  feature: string;
  severity: MugenDiagnosticSeverity;
  location?: string;
  raw?: string;
  fallback?: string;
  count: number;
};

export class UnsupportedFeatureTracker {
  private readonly items = new Map<string, UnsupportedFeature>();

  report(
    format: string,
    feature: string,
    options: {
      severity?: MugenDiagnosticSeverity;
      location?: string;
      raw?: string;
      fallback?: string;
    } = {},
  ): void {
    const key = `${format}:${feature}:${options.location ?? ""}:${options.raw ?? ""}`;
    const current = this.items.get(key);
    if (current) {
      current.count += 1;
      return;
    }

    this.items.set(key, {
      format,
      feature,
      severity: options.severity ?? "warning",
      location: options.location,
      raw: options.raw,
      fallback: options.fallback,
      count: 1,
    });
  }

  list(): UnsupportedFeature[] {
    return [...this.items.values()].sort((a, b) => a.format.localeCompare(b.format));
  }

  countByFeature(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of this.items.values()) {
      counts[item.feature] = (counts[item.feature] ?? 0) + item.count;
    }
    return counts;
  }
}
