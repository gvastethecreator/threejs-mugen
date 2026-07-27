/**
 * DA30-114: privacy and telemetry rules (design).
 */

export type PrivacyRule = {
  topic: string;
  default: "off" | "local-only" | "opt-in";
  retention: string;
  redaction: string;
};

export function buildPrivacyRules(): {
  schema: "Da30PrivacyTelemetryRules/v1";
  rules: PrivacyRule[];
  consentRequired: boolean;
  ok: boolean;
} {
  const rules: PrivacyRule[] = [
    { topic: "local-diagnostics", default: "local-only", retention: "session", redaction: "paths" },
    { topic: "crash-reports", default: "opt-in", retention: "30d", redaction: "user-assets" },
    { topic: "telemetry-metrics", default: "off", retention: "n/a", redaction: "all" },
    { topic: "prompts-generated", default: "local-only", retention: "project", redaction: "none-local" },
    { topic: "hosted-preview", default: "off", retention: "n/a", redaction: "block-upload" },
    { topic: "export-delete", default: "local-only", retention: "user-controlled", redaction: "full-delete" },
  ];
  return {
    schema: "Da30PrivacyTelemetryRules/v1",
    rules,
    consentRequired: true,
    ok: rules.every((r) => r.default) && rules.some((r) => r.default === "off"),
  };
}
