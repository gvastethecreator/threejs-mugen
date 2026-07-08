import type { MugenGameConfig } from "../model/MugenConfig";
import { createDiagnostic, parseKeyValue, parseNumber, parseTextLines, unquote } from "./text";

export function parseMugenConfig(text: string, file?: string): MugenGameConfig {
  const lines = parseTextLines(text);
  const rawSections: Record<string, Record<string, string>> = {};
  const diagnostics: MugenGameConfig["diagnostics"] = [];
  let currentSection = "";

  for (const line of lines) {
    if (!line.content) {
      continue;
    }

    const sectionMatch = /^\[([^\]]+)\]$/.exec(line.content);
    if (sectionMatch) {
      currentSection = sectionMatch[1]?.trim() ?? "";
      rawSections[currentSection] ??= {};
      continue;
    }

    const pair = parseKeyValue(line.content);
    if (!pair) {
      diagnostics.push(
        createDiagnostic("warning", "Unrecognized config line", {
          format: "config",
          file,
          line: line.number,
          raw: line.raw,
        }),
      );
      continue;
    }

    const section = rawSections[currentSection] ?? (rawSections[currentSection] = {});
    section[pair.key] = unquote(pair.value);
  }

  const config = getSection(rawSections, "Config");
  const width = positiveNumberValue(config, "GameWidth", diagnostics, file);
  const height = positiveNumberValue(config, "GameHeight", diagnostics, file);

  return {
    ...(width !== undefined && height !== undefined
      ? { gameSpace: { width, height, ...(file ? { sourcePath: file } : {}) } }
      : {}),
    rawSections,
    rawLines: lines.map((line) => line.raw),
    diagnostics,
  };
}

function getSection(
  rawSections: Record<string, Record<string, string>>,
  expected: string,
): Record<string, string> {
  return Object.entries(rawSections).find(([section]) => section.toLowerCase() === expected.toLowerCase())?.[1] ?? {};
}

function positiveNumberValue(
  section: Record<string, string>,
  key: string,
  diagnostics: MugenGameConfig["diagnostics"],
  file: string | undefined,
): number | undefined {
  const match = Object.entries(section).find(([candidate]) => candidate.toLowerCase() === key.toLowerCase());
  if (!match) {
    return undefined;
  }
  const value = parseNumber(match[1]);
  if (value !== undefined && value > 0) {
    return value;
  }
  diagnostics.push(
    createDiagnostic("warning", `Invalid [Config] ${key}; expected a positive number`, {
      format: "config",
      file,
      raw: `${match[0]} = ${match[1]}`,
    }),
  );
  return undefined;
}
