import type { MugenCharacterDef } from "../model/MugenCharacter";
import { createDiagnostic, parseKeyValue, parseTextLines, unquote } from "./text";

export function parseDef(text: string, file?: string): MugenCharacterDef {
  const lines = parseTextLines(text);
  const rawSections: Record<string, Record<string, string>> = {};
  const diagnostics: MugenCharacterDef["diagnostics"] = [];
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
        createDiagnostic("warning", "Unrecognized DEF line", {
          format: "def",
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

  const infoRaw = getSection(rawSections, "Info");
  const filesRaw = getSection(rawSections, "Files");
  const files = Object.entries(filesRaw);
  const stateFiles = files
    .filter(([key]) => /^st\d*$/i.test(key))
    .sort(([left], [right]) => stateFileRank(left) - stateFileRank(right));

  return {
    info: {
      name: getValue(infoRaw, "name"),
      displayName: getValue(infoRaw, "displayname"),
      versionDate: getValue(infoRaw, "versiondate"),
      mugenVersion: getValue(infoRaw, "mugenversion"),
      ikemenVersion: getValue(infoRaw, "ikemenversion"),
      author: getValue(infoRaw, "author"),
      localCoord: numberPair(getValue(infoRaw, "localcoord")),
    },
    files: {
      cmd: getValue(filesRaw, "cmd"),
      cns: getValue(filesRaw, "cns"),
      states: stateFiles.map(([, value]) => value).filter(Boolean),
      commonStates: files
        .filter(([key]) => /^stcommon\d*$/i.test(key) || /^common\d*$/i.test(key))
        .map(([, value]) => value)
        .filter(Boolean),
      sprite: getValue(filesRaw, "sprite"),
      anim: getValue(filesRaw, "anim"),
      sound: getValue(filesRaw, "sound"),
      palettes: files
        .filter(([key]) => /^pal\d+$/i.test(key))
        .sort(([a], [b]) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")))
        .map(([, value]) => value)
        .filter(Boolean),
    },
    rawSections,
    rawLines: lines.map((line) => line.raw),
    diagnostics,
  };
}

function stateFileRank(key: string): number {
  const normalized = key.toLowerCase();
  return normalized === "st" ? 0 : Number(normalized.slice(2)) + 1;
}

function getSection(
  rawSections: Record<string, Record<string, string>>,
  expected: string,
): Record<string, string> {
  const match = Object.entries(rawSections).find(([section]) => section.toLowerCase() === expected.toLowerCase());
  return match?.[1] ?? {};
}

function getValue(section: Record<string, string>, expected: string): string | undefined {
  const match = Object.entries(section).find(([key]) => key.toLowerCase() === expected.toLowerCase());
  return match?.[1];
}

function numberPair(value: string | undefined): [number, number] | undefined {
  const parts = value?.split(",").map((part) => Number(part.trim()));
  if (parts?.length !== 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
    return undefined;
  }
  return [parts[0], parts[1]];
}
