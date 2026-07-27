/**
 * DA29-072 — product-route renderer.info baselines.
 * Captures WebGLRenderer-style metrics and post-cleanup deltas per product route.
 */

export const RENDERER_INFO_PRODUCT_ROUTES = [
  "play",
  "studio-preview",
  "inspect",
  "team",
  "stress",
] as const;

export type RendererInfoProductRoute = (typeof RENDERER_INFO_PRODUCT_ROUTES)[number];

export type RendererInfoMetrics = {
  calls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  /** Optional WebGL program count when the host exposes it. */
  programs: number | null;
};

export type RendererInfoRouteSample = {
  route: RendererInfoProductRoute;
  before: RendererInfoMetrics;
  after: RendererInfoMetrics;
  afterCleanup: RendererInfoMetrics;
  deltaRender: RendererInfoMetrics;
  deltaCleanup: RendererInfoMetrics;
};

export type RendererInfoBaselineReport = {
  schema: "RendererInfoBaseline/v1";
  routes: RendererInfoProductRoute[];
  samples: RendererInfoRouteSample[];
  requiredFields: Array<keyof RendererInfoMetrics>;
};

export const RENDERER_INFO_REQUIRED_FIELDS: Array<keyof RendererInfoMetrics> = [
  "calls",
  "triangles",
  "points",
  "lines",
  "geometries",
  "textures",
  "programs",
];

/** Extract metrics from ThreeMugenRenderer.getDiagnostics()-shaped data. */
export function metricsFromRendererDiagnostics(diagnostics: {
  render?: { calls?: number; triangles?: number; points?: number; lines?: number };
  memory?: { geometries?: number; textures?: number };
  programs?: number;
}): RendererInfoMetrics {
  return {
    calls: Number(diagnostics.render?.calls ?? 0),
    triangles: Number(diagnostics.render?.triangles ?? 0),
    points: Number(diagnostics.render?.points ?? 0),
    lines: Number(diagnostics.render?.lines ?? 0),
    geometries: Number(diagnostics.memory?.geometries ?? 0),
    textures: Number(diagnostics.memory?.textures ?? 0),
    programs: diagnostics.programs == null ? null : Number(diagnostics.programs),
  };
}

export function subtractMetrics(a: RendererInfoMetrics, b: RendererInfoMetrics): RendererInfoMetrics {
  return {
    calls: a.calls - b.calls,
    triangles: a.triangles - b.triangles,
    points: a.points - b.points,
    lines: a.lines - b.lines,
    geometries: a.geometries - b.geometries,
    textures: a.textures - b.textures,
    programs:
      a.programs == null || b.programs == null ? null : a.programs - b.programs,
  };
}

export function buildRouteSample(
  route: RendererInfoProductRoute,
  before: RendererInfoMetrics,
  after: RendererInfoMetrics,
  afterCleanup: RendererInfoMetrics,
): RendererInfoRouteSample {
  return {
    route,
    before,
    after,
    afterCleanup,
    deltaRender: subtractMetrics(after, before),
    deltaCleanup: subtractMetrics(afterCleanup, after),
  };
}

/**
 * Build the baseline report for all product routes.
 * Callers supply measured per-route samples (from live renderer or harness).
 */
export function buildRendererInfoBaseline(
  measured: Partial<Record<RendererInfoProductRoute, {
    before: RendererInfoMetrics;
    after: RendererInfoMetrics;
    afterCleanup: RendererInfoMetrics;
  }>>,
): RendererInfoBaselineReport {
  const samples: RendererInfoRouteSample[] = [];
  for (const route of RENDERER_INFO_PRODUCT_ROUTES) {
    const row = measured[route];
    if (!row) {
      throw new Error(`Missing renderer.info sample for product route ${route}`);
    }
    samples.push(buildRouteSample(route, row.before, row.after, row.afterCleanup));
  }
  return {
    schema: "RendererInfoBaseline/v1",
    routes: [...RENDERER_INFO_PRODUCT_ROUTES],
    samples,
    requiredFields: [...RENDERER_INFO_REQUIRED_FIELDS],
  };
}

/** Validate a report has every product route and required metric fields. */
export function validateRendererInfoBaseline(report: RendererInfoBaselineReport): string[] {
  const errors: string[] = [];
  if (report.schema !== "RendererInfoBaseline/v1") {
    errors.push(`unexpected schema ${report.schema}`);
  }
  for (const route of RENDERER_INFO_PRODUCT_ROUTES) {
    if (!report.routes.includes(route)) errors.push(`missing route ${route}`);
    const sample = report.samples.find((s) => s.route === route);
    if (!sample) {
      errors.push(`missing sample ${route}`);
      continue;
    }
    for (const phase of ["before", "after", "afterCleanup", "deltaRender", "deltaCleanup"] as const) {
      const metrics = sample[phase];
      for (const field of RENDERER_INFO_REQUIRED_FIELDS) {
        if (!(field in metrics)) errors.push(`${route}.${phase} missing ${field}`);
      }
    }
  }
  return errors;
}
