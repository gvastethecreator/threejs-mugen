export type StudioSourceDiagnosticRange = {
  line: number;
  start: number;
  end: number;
};

export function getStudioSourceDiagnosticRange(
  text: string,
  line: number | undefined,
): StudioSourceDiagnosticRange | undefined {
  if (!Number.isInteger(line) || line === undefined || line < 1) {
    return undefined;
  }
  const lines = text.split("\n");
  if (line > lines.length) {
    return undefined;
  }
  const start = lines.slice(0, line - 1).reduce((offset, value) => offset + value.length + 1, 0);
  const rawLine = lines[line - 1] ?? "";
  const end = start + (rawLine.endsWith("\r") ? rawLine.length - 1 : rawLine.length);
  return { line, start, end };
}
