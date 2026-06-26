import type { MugenDiagnostic } from "../model/MugenAnimation";

export type ParsedLine = {
  number: number;
  raw: string;
  content: string;
  comment?: string;
};

export function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

export function stripComment(raw: string): { content: string; comment?: string } {
  let quoted = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === '"') {
      quoted = !quoted;
    }
    if (char === ";" && !quoted) {
      return {
        content: raw.slice(0, index).trim(),
        comment: raw.slice(index + 1),
      };
    }
  }
  return { content: raw.trim() };
}

export function parseKeyValue(content: string): { key: string; value: string } | undefined {
  const equals = content.indexOf("=");
  if (equals < 0) {
    return undefined;
  }
  return {
    key: content.slice(0, equals).trim(),
    value: content.slice(equals + 1).trim(),
  };
}

export function parseTextLines(text: string): ParsedLine[] {
  return splitLines(text).map((raw, index) => ({
    number: index + 1,
    raw,
    ...stripComment(raw),
  }));
}

export function createDiagnostic(
  severity: MugenDiagnostic["severity"],
  message: string,
  options: Omit<MugenDiagnostic, "severity" | "message"> = {},
): MugenDiagnostic {
  return {
    severity,
    message,
    ...options,
  };
}

export function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseNumber(value: string): number | undefined {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}
